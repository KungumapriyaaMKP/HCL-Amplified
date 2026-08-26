"""
Gamification, XP, streaks, and achievement badges routes.
"""
from __future__ import annotations

import math
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.auth import current_user
from app.domain import EventType
from app.modules.telemetry import interface as telemetry

router = APIRouter(prefix="/gamification")


class Badge(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    unlocked: bool
    unlocked_at: str | None = None


class GamificationResponse(BaseModel):
    total_xp: int
    level: int
    next_level_xp: int
    current_level_progress_pct: int
    streak_days: int
    total_events: int
    badges: list[Badge]


@router.get("", response_model=GamificationResponse)
async def get_gamification_stats(
    user_id: str = Depends(current_user),
) -> GamificationResponse:
    """
    Derive dynamic XP, level, active study streak, and unlocked badges from telemetry events.
    """
    events = telemetry.events_for(user_id)

    # 1. Calculate XP from learning events
    total_xp = 0
    quiz_count = 0
    review_count = 0
    distinct_skills = set()
    event_days = set()

    for e in events:
        if e.type == EventType.QUIZ_ATTEMPTED:
            quiz_count += 1
            score = e.score or 0.8
            total_xp += int(50 * score)
        elif e.type == EventType.REVIEW_COMPLETED:
            review_count += 1
            total_xp += 30
        elif e.type == EventType.RESOURCE_COMPLETED:
            total_xp += 100
        else:
            total_xp += 10

        if e.skill_id:
            distinct_skills.add(e.skill_id)

        dt = e.at.astimezone(timezone.utc).date()
        event_days.add(dt)

    # Level formula: level = 1 + floor(sqrt(total_xp / 100))
    level = 1 + int(math.sqrt(total_xp / 100.0))
    current_tier_base_xp = ((level - 1) ** 2) * 100
    next_level_xp = (level ** 2) * 100
    tier_span = max(1, next_level_xp - current_tier_base_xp)
    progress_pct = min(100, int(100 * (total_xp - current_tier_base_xp) / tier_span))

    # 2. Calculate consecutive day streak
    sorted_days = sorted(list(event_days), reverse=True)
    today = datetime.now(timezone.utc).date()
    streak = 0
    if sorted_days:
        cur = today
        # If user didn't study today yet, allow yesterday as start of streak
        if (today - sorted_days[0]).days <= 1:
            check_date = sorted_days[0]
            for day in sorted_days:
                if (check_date - day).days <= 1:
                    streak += 1
                    check_date = day
                else:
                    break

    # 3. Badges definitions
    badges_def = [
        Badge(
            id="first_step",
            title="First Step",
            description="Logged your first learning or diagnostic event.",
            icon="🌱",
            unlocked=len(events) > 0,
        ),
        Badge(
            id="quiz_master",
            title="Quiz Specialist",
            description="Completed 3 or more diagnostic or mastery quizzes.",
            icon="🎯",
            unlocked=quiz_count >= 3,
        ),
        Badge(
            id="polymath",
            title="Polymath",
            description="Engaged with 5 or more distinct domain skills.",
            icon="🧠",
            unlocked=len(distinct_skills) >= 5,
        ),
        Badge(
            id="consistency_hero",
            title="Streak Starter",
            description="Maintained an active study streak for 3+ consecutive days.",
            icon="🔥",
            unlocked=streak >= 3,
        ),
        Badge(
            id="deep_diver",
            title="Century Scholar",
            description="Earned over 500 total XP on your learning roadmap.",
            icon="⚡",
            unlocked=total_xp >= 500,
        ),
    ]

    return GamificationResponse(
        total_xp=total_xp,
        level=level,
        next_level_xp=next_level_xp,
        current_level_progress_pct=progress_pct,
        streak_days=max(streak, 1 if len(events) > 0 else 0),
        total_events=len(events),
        badges=badges_def,
    )
