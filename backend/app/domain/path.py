"""Generated learning path types -- output of the A* planner."""
from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field

from app.domain.resource import Resource


class NodeStatus(str, Enum):
    MASTERED = "mastered"
    ACTIVE = "active"
    NEXT = "next"
    LOCKED = "locked"


class Phase(str, Enum):
    FOUNDATIONS = "foundations"
    CORE = "core"
    ADVANCED = "advanced"
    CAPSTONE = "capstone"


class PathNode(BaseModel):
    """One sequenced skill plus the resource bound to it."""
    skill_id: str
    skill_name: str
    resource: Resource | None = None
    alternatives: list[Resource] = Field(default_factory=list)

    status: NodeStatus = NodeStatus.LOCKED
    phase: Phase = Phase.FOUNDATIONS
    order: int = 0
    estimated_hours: float = 0.0
    xp: int = 150

    # D5: every number shown to the user is computed, never phrased by an LLM
    gap_delta: float = 0.0
    hybrid_score: float = 0.0
    factor_scores: dict[str, float] = Field(default_factory=dict)
    rationale: str | None = None

    # F6/adapt: guards the prior build's infinite-remediation bug
    is_remediation: bool = False
    remediation_for: str | None = None


class Milestone(BaseModel):
    phase: Phase
    title: str
    nodes: list[PathNode] = Field(default_factory=list)

    @property
    def total_hours(self) -> float:
        return sum(n.estimated_hours for n in self.nodes)


class LearningPath(BaseModel):
    goal_text: str
    target_role: str | None = None
    milestones: list[Milestone] = Field(default_factory=list)

    total_hours: float = 0.0
    total_cost_usd: float = 0.0
    weeks_required: float | None = None
    is_feasible: bool = True

    # proof surfaced in the UI and asserted in tests
    prerequisite_violations: int = 0

    @property
    def nodes(self) -> list[PathNode]:
        return [n for m in self.milestones for n in m.nodes]
