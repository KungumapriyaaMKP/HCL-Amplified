"""HTTP request/response contracts. Pydantic is the single source of truth."""
from __future__ import annotations

from typing import Any
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
    priority: str = Field(default="balanced")  # balanced|fastest|cheapest|rigorous|crash


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
    duration_display: str = ""
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


class RelaxationOption(BaseModel):
    type: str  # "drop_electives" | "extend_deadline" | "increase_hours"
    title: str
    description: str
    hours_saved: float
    new_total_hours: float
    new_weeks_required: float
    is_feasible: bool


class PlanRelaxRequest(BaseModel):
    goal: str = Field(min_length=2, max_length=300)
    hours_per_week: float = Field(default=10.0, gt=0)
    deadline_weeks: int | None = None
    budget_usd: float | None = None
    known: dict[str, float] = Field(default_factory=dict)
    priority: str = Field(default="balanced")


class PlanRelaxResponse(BaseModel):
    is_feasible: bool
    baseline_hours: float
    baseline_weeks: float | None
    deadline_weeks: int | None
    hours_per_week: float
    options: list[RelaxationOption]


class RoleItem(BaseModel):
    id: str
    name: str
    summary: str
    demand_score: float
    demand_label: str
    demand_snapshot_date: str
    skills_count: int
    skill_ids: list[str] = Field(default_factory=list)


class RolesResponse(BaseModel):
    roles: list[RoleItem]


class DetourRequest(BaseModel):
    blocked_skill_id: str
    goal: str = "Machine Learning Engineer"


class DetourResponse(BaseModel):
    success: bool
    blocked_skill_id: str
    bridge_skill_id: str | None = None
    bridge_skill_name: str | None = None
    rationale: str | None = None
    plan: PlanResponse | None = None


class RoleCompareRequest(BaseModel):
    current_role_id: str
    target_role_id: str
    hours_per_week: float = 10.0


class RoleCompareResponse(BaseModel):
    current_role: str
    target_role: str
    shared_skill_count: int
    delta_skill_count: int
    delta_hours: float
    delta_weeks: float | None
    transferability_pct: int
    shared_skill_names: list[str]
    delta_skill_names: list[str]

