"""
Telemetry persistence and analytics engine.

Implements event recording, retention decay modeling (Ebbinghaus), review urgency,
and activity grid aggregation with dual-mode operation: Supabase Postgres when
configured, or in-memory fallback.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from functools import lru_cache
import json
import math
from typing import Any

from app.core import supa
from app.core.config import DATA_DIR
from app.domain import EventType, LearningEvent, Skill

# In-memory storage for guest/fallback mode: learner_id -> list[LearningEvent]
_IN_MEMORY_EVENTS: dict[str, list[LearningEvent]] = {}


def _to_utc(dt: datetime) -> datetime:
    """Ensure datetime is timezone-aware in UTC."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _serialize_event(event: LearningEvent) -> dict[str, Any]:
    """Serialize a LearningEvent domain model for Supabase PostgREST insertion."""
    type_val = event.type.value if isinstance(event.type, EventType) else str(event.type)
    at_val = _to_utc(event.at).isoformat()
    return {
        "user_id": event.learner_id,
        "type": type_val,
        "at": at_val,
        "skill_id": event.skill_id,
        "resource_id": event.resource_id,
        "score": event.score,
        "minutes_spent": event.minutes_spent,
        "payload": event.payload if isinstance(event.payload, dict) else {},
    }


def _deserialize_event(row: dict[str, Any]) -> LearningEvent:
    """Deserialize a Supabase database row to a LearningEvent domain model."""
    raw_type = row.get("type", "")
    try:
        event_type = EventType(raw_type)
    except ValueError:
        event_type = EventType.QUIZ_ATTEMPTED

    raw_at = row.get("at")
    if isinstance(raw_at, str):
        # Handle ISO string with or without Z
        clean_at = raw_at.replace("Z", "+00:00")
        at_dt = datetime.fromisoformat(clean_at)
    elif isinstance(raw_at, datetime):
        at_dt = raw_at
    else:
        at_dt = datetime.now(timezone.utc)

    return LearningEvent(
        learner_id=str(row.get("user_id") or "demo"),
        type=event_type,
        at=_to_utc(at_dt),
        skill_id=row.get("skill_id"),
        resource_id=row.get("resource_id"),
        score=float(row["score"]) if row.get("score") is not None else None,
        minutes_spent=float(row["minutes_spent"]) if row.get("minutes_spent") is not None else None,
        payload=row.get("payload") if isinstance(row.get("payload"), dict) else {},
    )


@lru_cache(maxsize=1)
def _load_fan_outs() -> dict[str, int]:
    """Load fan-out metrics from canonical skills dataset without importing other modules."""
    try:
        data_path = DATA_DIR / "skills.json"
        if data_path.exists():
            rows = json.loads(data_path.read_text(encoding="utf-8"))
            return {r["id"]: int(r.get("fan_out", 1)) for r in rows if "id" in r}
    except Exception:
        pass
    return {}


def _is_uuid(val: str) -> bool:
    try:
        from uuid import UUID
        UUID(str(val))
        return True
    except Exception:
        return False


def record(event: LearningEvent) -> None:
    """
    Record a learning event.
    Persists to Supabase 'learning_events' for authenticated UUID users if enabled,
    otherwise saves in-memory.
    """
    if supa.enabled() and event.learner_id != "demo" and _is_uuid(event.learner_id):
        try:
            client = supa.client()
            client.table("learning_events").insert(_serialize_event(event)).execute()
            return
        except Exception:
            pass

    # Clone event with UTC timestamp for consistent memory storage
    utc_event = event.model_copy(update={"at": _to_utc(event.at)})
    _IN_MEMORY_EVENTS.setdefault(event.learner_id, []).append(utc_event)


def events_for(learner_id: str, skill_id: str | None = None) -> list[LearningEvent]:
    """
    Retrieve chronological learning events for a learner, optionally filtered by skill.
    """
    if supa.enabled() and learner_id != "demo" and _is_uuid(learner_id):
        try:
            client = supa.client()
            query = client.table("learning_events").select("*").eq("user_id", learner_id)
            if skill_id:
                query = query.eq("skill_id", skill_id)
            query = query.order("at", desc=False)
            res = query.execute()
            return [_deserialize_event(r) for r in (res.data or [])]
        except Exception:
            pass

    events = _IN_MEMORY_EVENTS.get(learner_id, [])
    if skill_id:
        events = [e for e in events if e.skill_id == skill_id]
    return sorted(events, key=lambda e: e.at)


def retention(skill_id: str, events: list[LearningEvent], now: datetime) -> float:
    """
    Ebbinghaus decay: R(t) = e^(-t/S)
    Fixed stability S = 14 days, derived from the most recent review or quiz event.
    No review/quiz event -> fully decayed (0.0).
    """
    review_types = {EventType.QUIZ_ATTEMPTED, EventType.REVIEW_COMPLETED}
    matching = [
        e for e in events
        if e.skill_id == skill_id and e.type in review_types
    ]
    if not matching:
        return 0.0

    latest_event = max(matching, key=lambda e: e.at)
    now_utc = _to_utc(now)
    event_utc = _to_utc(latest_event.at)

    elapsed_seconds = (now_utc - event_utc).total_seconds()
    if elapsed_seconds <= 0:
        return 1.0

    t_days = elapsed_seconds / 86400.0
    stability_days = 14.0
    r = math.exp(-t_days / stability_days)
    return max(0.0, min(1.0, float(r)))


def review_urgency(
    skill_id: str, retention_value: float, skills: dict[str, Skill]
) -> float:
    """
    urgency = (1 - retention) * downstream_fan_out
    Fan-out prioritizes foundational skills whose decay blocks many downstream skills.
    """
    fan_outs = _load_fan_outs()
    fan_out = fan_outs.get(skill_id)
    if fan_out is None:
        # Fallback: compute direct dependents from the passed skills dict
        fan_out = sum(1 for s in skills.values() if skill_id in s.prerequisites)
        if fan_out <= 0:
            fan_out = 1

    decay = max(0.0, min(1.0, 1.0 - retention_value))
    return decay * float(fan_out)


def activity_grid(learner_id: str, weeks: int = 52) -> list[dict]:
    """
    LeetCode-style daily contribution grid: per-day count plus list of topics studied.
    Returns a continuous sequence of days for the specified number of weeks.
    """
    events = events_for(learner_id)
    today = datetime.now(timezone.utc).date()
    start_date = today - timedelta(days=weeks * 7 - 1)

    grid: dict[str, dict] = {}
    for i in range(weeks * 7):
        d_str = (start_date + timedelta(days=i)).isoformat()
        grid[d_str] = {"date": d_str, "count": 0, "topics": []}

    for e in events:
        d_str = e.at.date().isoformat()
        if d_str in grid:
            grid[d_str]["count"] += 1
            topic = e.skill_id or (e.payload.get("topic") if isinstance(e.payload, dict) else None)
            if topic and topic not in grid[d_str]["topics"]:
                grid[d_str]["topics"].append(topic)

    return list(grid.values())
