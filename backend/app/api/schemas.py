"""HTTP request/response contracts. Pydantic is the single source of truth."""
from __future__ import annotations

from pydantic import BaseModel, Field

from app.domain import Modality, NodeStatus, Phase


class PlanRequest(BaseModel):
    goal: str = Field(min_length=2, max_length=300)
    hours_per_week: float = Field(default=10.0, gt=0)
    deadline_weeks: int | None = None
    budget_usd: float | None = None
    preferred_modalities: list[Modality] = Field(default_factory=list)
    # optional: skills the learner already has (id -> 0..1), demo/testing
    known: dict[str, float] = Field(default_factory=dict)
    priority: str = Field(default="balanced")  # balanced|fastest|cheapest|rigorous


class ResourceOut(BaseModel):
    id: str
    provider: str
    title: str
    url: str
    duration_display: str
    difficulty: str | None
    price_usd: float
    price_is_estimate: bool
    cost_type: str


class NodeOut(BaseModel):
    skill_id: str
    skill_name: str
    status: NodeStatus
    phase: Phase
    order: int
    estimated_hours: float
    xp: int
    gap_delta: int
    resource: ResourceOut | None
    alternatives: list[ResourceOut] = Field(default_factory=list)
    rationale: str | None
    is_remediation: bool


class MilestoneOut(BaseModel):
    phase: Phase
    title: str
    total_hours: float
    nodes: list[NodeOut]


class PlanResponse(BaseModel):
    goal: str
    target_role: str
    readiness_pct: int
    total_hours: float
    total_cost_usd: float
    weeks_required: float | None
    is_feasible: bool
    prerequisite_violations: int
    milestones: list[MilestoneOut]
    gap_count: int
