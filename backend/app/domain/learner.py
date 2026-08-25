"""Learner profile -- the 4D model: goals, mastery, history, constraints."""
from __future__ import annotations

from pydantic import BaseModel, Field

from app.domain.resource import Modality
from app.domain.skill import Mastery


class Constraints(BaseModel):
    """
    Captured conversationally on Page 1. These four answers are what make
    Deliverable 1 a real dialogue rather than a form (see plan F7).
    """
    hours_per_week: float = Field(default=10.0, gt=0)
    deadline_weeks: int | None = None
    budget_usd: float | None = None          # None = no ceiling
    preferred_modalities: list[Modality] = Field(default_factory=list)


class LearnerProfile(BaseModel):
    id: str = "demo"
    goal_text: str = ""
    target_role: str | None = None
    mastery: dict[str, Mastery] = Field(default_factory=dict)
    completed_resource_ids: list[str] = Field(default_factory=list)
    constraints: Constraints = Field(default_factory=Constraints)

    def level(self, skill_id: str) -> float:
        m = self.mastery.get(skill_id)
        return m.level if m else 0.0
