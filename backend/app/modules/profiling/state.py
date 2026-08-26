"""
Learner state persistence and restoration.

Handles serialization and deserialization of the 4D LearnerProfile (goals,
mastery with confidence, constraints) to/from Supabase Postgres or in-memory fallback.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.core import supa
from app.domain import Confidence, Constraints, LearnerProfile, Mastery, MasteryEvidence

# In-memory storage for guest/fallback mode: user_id -> LearnerProfile
_IN_MEMORY_STATE: dict[str, LearnerProfile] = {}


def _serialize_profile(user_id: str, profile: LearnerProfile) -> dict[str, Any]:
    """Convert a LearnerProfile domain model into a Supabase Postgres row."""
    constraints_dict = profile.constraints.model_dump(mode="json")
    mastery_dict = {
        sid: m.model_dump(mode="json") for sid, m in profile.mastery.items()
    }
    return {
        "user_id": user_id,
        "goal_text": profile.goal_text,
        "target_role": profile.target_role,
        "constraints": constraints_dict,
        "mastery": mastery_dict,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }


def _deserialize_profile(user_id: str, row: dict[str, Any]) -> LearnerProfile:
    """Reconstruct a LearnerProfile domain model from a database row."""
    raw_constraints = row.get("constraints") or {}
    try:
        constraints = Constraints(**raw_constraints)
    except Exception:
        constraints = Constraints()

    raw_mastery = row.get("mastery") or {}
    mastery: dict[str, Mastery] = {}
    for sid, m_data in raw_mastery.items():
        if isinstance(m_data, dict):
            try:
                # Reconstruct evidence list if present
                ev_list = []
                for ev in m_data.get("evidence", []):
                    if isinstance(ev, dict):
                        ev_list.append(MasteryEvidence(**ev))

                conf_val = m_data.get("confidence", Confidence.LOW.value)
                try:
                    conf = Confidence(conf_val)
                except ValueError:
                    conf = Confidence.LOW

                mastery[sid] = Mastery(
                    skill_id=m_data.get("skill_id", sid),
                    level=float(m_data.get("level", 0.0)),
                    confidence=conf,
                    evidence=ev_list,
                )
            except Exception:
                pass

    return LearnerProfile(
        id=user_id,
        goal_text=row.get("goal_text") or "",
        target_role=row.get("target_role"),
        constraints=constraints,
        mastery=mastery,
    )


def _is_uuid(val: str) -> bool:
    try:
        from uuid import UUID
        UUID(str(val))
        return True
    except Exception:
        return False


def save_state(user_id: str, profile: LearnerProfile) -> None:
    """
    Save the learner profile state.
    Upserts into Supabase 'learner_state' for authenticated UUID users if enabled,
    otherwise saves in-memory.
    """
    if supa.enabled() and user_id != "demo" and _is_uuid(user_id):
        try:
            client = supa.client()
            row = _serialize_profile(user_id, profile)
            client.table("learner_state").upsert(row).execute()
            return
        except Exception:
            pass

    _IN_MEMORY_STATE[user_id] = profile.model_copy(deep=True)


def load_state(user_id: str) -> LearnerProfile | None:
    """
    Load and reconstruct the learner profile state for a user.
    Returns None if no persisted state exists.
    """
    if supa.enabled() and user_id != "demo" and _is_uuid(user_id):
        try:
            client = supa.client()
            res = client.table("learner_state").select("*").eq("user_id", user_id).limit(1).execute()
            if res.data:
                return _deserialize_profile(user_id, res.data[0])
        except Exception:
            pass

    profile = _IN_MEMORY_STATE.get(user_id)
    return profile.model_copy(deep=True) if profile else None
