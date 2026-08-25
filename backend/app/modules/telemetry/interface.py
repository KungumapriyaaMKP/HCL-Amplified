"""
Public surface of the telemetry module. F1 + F8.

One event stream feeds decay, analytics and stuck detection. Three
feature-specific tables would be the wrong shape.
"""
from __future__ import annotations

from datetime import datetime

from app.domain import LearningEvent, Skill

__all__ = ["record", "events_for", "retention", "review_urgency", "activity_grid"]


def record(event: LearningEvent) -> None:
    raise NotImplementedError


def events_for(learner_id: str, skill_id: str | None = None) -> list[LearningEvent]:
    raise NotImplementedError


def retention(skill_id: str, events: list[LearningEvent], now: datetime) -> float:
    """Ebbinghaus R(t) = e^(-t/S), with S fitted from real review outcomes."""
    raise NotImplementedError


def review_urgency(
    skill_id: str, retention_value: float, skills: dict[str, Skill]
) -> float:
    """
    urgency = (1 - retention) x downstream_fan_out

    A decayed foundation outranks a decayed leaf. Same fan-out weighting
    used for probe priority in the gap module -- one idea, two uses.
    """
    raise NotImplementedError


def activity_grid(learner_id: str, weeks: int = 52) -> list[dict]:
    """LeetCode-style contribution grid: per-day count plus topics studied."""
    raise NotImplementedError
