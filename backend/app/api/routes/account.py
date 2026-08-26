"""
Account, profile, events, and learning history routes.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.core import supa
from app.core.auth import current_user, require_user
from app.domain import (
    Confidence, EventType, LearnerProfile, LearningEvent, Mastery, MasteryEvidence,
)
from app.modules.profiling import interface as profiling
from app.modules.telemetry import interface as telemetry

router = APIRouter()

# In-memory store for saved plans in guest/fallback mode: user_id -> list[dict]
_IN_MEMORY_SAVED_PLANS: dict[str, list[dict[str, Any]]] = {}


class UserMeResponse(BaseModel):
    user_id: str
    display_name: str
    is_guest: bool


class ProfileUpdateRequest(BaseModel):
    display_name: str = Field(min_length=1, max_length=100)


class ProfileResponse(BaseModel):
    user_id: str
    display_name: str
    is_guest: bool


class EventIn(BaseModel):
    type: EventType
    skill_id: str | None = None
    resource_id: str | None = None
    score: float | None = None
    minutes_spent: float | None = None
    payload: dict[str, Any] = Field(default_factory=dict)
    at: datetime | None = None  # Server defaults to now(UTC) if omitted


class HistoryResponse(BaseModel):
    saved_plans: list[dict[str, Any]]
    retention_summary: list[dict[str, Any]]
    activity_grid: list[dict[str, Any]]


@router.get("/me", response_model=UserMeResponse)
async def get_me(user_id: str = Depends(current_user)) -> UserMeResponse:
    """Return authenticated profile information or guest status."""
    if user_id == "demo" or not supa.enabled():
        return UserMeResponse(user_id="demo", display_name="Demo Learner", is_guest=True)

    client = supa.client()
    try:
        res = client.table("profiles").select("*").eq("user_id", user_id).limit(1).execute()
        if res.data and res.data[0].get("display_name"):
            return UserMeResponse(
                user_id=user_id,
                display_name=res.data[0]["display_name"],
                is_guest=False,
            )
    except Exception:
        pass

    return UserMeResponse(user_id=user_id, display_name="Learner", is_guest=False)


@router.post("/profile", response_model=ProfileResponse)
async def update_profile(
    req: ProfileUpdateRequest, user_id: str = Depends(require_user)
) -> ProfileResponse:
    """Upsert display name in the profiles table on login/signup."""
    if supa.enabled() and user_id != "demo":
        try:
            client = supa.client()
            client.table("profiles").upsert({
                "user_id": user_id,
                "display_name": req.display_name.strip(),
            }).execute()
        except Exception:
            pass

    return ProfileResponse(
        user_id=user_id,
        display_name=req.display_name.strip(),
        is_guest=(user_id == "demo"),
    )


@router.post("/events")
async def record_event(
    req: EventIn, user_id: str = Depends(current_user)
) -> dict[str, str]:
    """
    Ingest a telemetry event from frontend interactions (quizzes, reviews, completion).
    Accrues mastery in persistent state when applicable.
    """
    learner_id = user_id if user_id != "demo" else "demo"
    at_dt = req.at or datetime.now(timezone.utc)

    event = LearningEvent(
        learner_id=learner_id,
        type=req.type,
        at=at_dt,
        skill_id=req.skill_id,
        resource_id=req.resource_id,
        score=req.score,
        minutes_spent=req.minutes_spent,
        payload=req.payload,
    )

    telemetry.record(event)

    # If quiz/review attempted with a score, accrue mastery to learner_state
    if event.skill_id and event.score is not None and event.type in {
        EventType.QUIZ_ATTEMPTED,
        EventType.REVIEW_COMPLETED,
        EventType.RESOURCE_COMPLETED,
    }:
        profile = profiling.load_state(event.learner_id) or LearnerProfile(id=event.learner_id)
        current_m = profile.mastery.get(event.skill_id)
        old_level = current_m.level if current_m else 0.0
        new_level = max(old_level, float(event.score))

        profile.mastery[event.skill_id] = Mastery(
            skill_id=event.skill_id,
            level=new_level,
            confidence=Confidence.HIGH,
            evidence=[
                MasteryEvidence(
                    source="quiz",
                    quote=None,
                    detail=f"Score: {event.score:.2f} ({event.type.value})",
                )
            ],
        )
        profiling.save_state(event.learner_id, profile)

    return {"status": "ok"}


@router.get("/history", response_model=HistoryResponse)
async def get_history(user_id: str = Depends(current_user)) -> HistoryResponse:
    """
    Return the user's saved learning plans and derived skill retention decay summary.
    """
    # 1. Fetch saved plans
    if supa.enabled() and user_id != "demo":
        client = supa.client()
        try:
            plans_res = (
                client.table("saved_plans")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .execute()
            )
            saved_plans = plans_res.data or []
        except Exception:
            saved_plans = []
    else:
        saved_plans = _IN_MEMORY_SAVED_PLANS.get(user_id, [])

    # 2. Derive retention for studied skills
    events = telemetry.events_for(user_id)
    skills_studied = sorted(list({e.skill_id for e in events if e.skill_id}))
    now = datetime.now(timezone.utc)

    retention_summary = []
    for sid in skills_studied:
        r = telemetry.retention(sid, events, now)
        retention_summary.append({"skill_id": sid, "retention": round(r, 4)})

    # 3. Activity contribution grid
    grid = telemetry.activity_grid(user_id)

    return HistoryResponse(
        saved_plans=saved_plans,
        retention_summary=retention_summary,
        activity_grid=grid,
    )
