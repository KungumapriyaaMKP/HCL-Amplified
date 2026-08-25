"""
Telemetry events -- ONE stream feeding F1 (decay), F6 (socratic) and F8
(analytics). Three feature-specific tables would be the wrong shape.
"""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class EventType(str, Enum):
    RESOURCE_STARTED = "resource_started"
    RESOURCE_COMPLETED = "resource_completed"
    QUIZ_ATTEMPTED = "quiz_attempted"
    REVIEW_COMPLETED = "review_completed"
    FEEDBACK_GIVEN = "feedback_given"
    PATH_GENERATED = "path_generated"
    DETOUR_INSERTED = "detour_inserted"


class LearningEvent(BaseModel):
    learner_id: str = "demo"
    type: EventType
    at: datetime
    skill_id: str | None = None
    resource_id: str | None = None
    score: float | None = None          # 0..1 for quiz/review
    minutes_spent: float | None = None
    payload: dict[str, Any] = Field(default_factory=dict)
