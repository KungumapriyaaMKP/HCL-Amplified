"""
Public surface of the planning module. Deliverable 4.

A* sequences SKILL nodes, not course nodes. Budget is enforced at bind time,
not inside the search (constrained shortest path with a budget dimension is
NP-hard). This module owns sequencing and validation; resource binding lives
alongside once retrieval is wired.
"""
from __future__ import annotations

from app.domain import LearnerProfile, Skill, SkillGap
from app.modules.planning.astar import PlannerWeights, plan_skill_order
from app.modules.planning.milestones import assign_phases
from app.modules.planning.validate import count_violations, is_valid

__all__ = [
    "PlannerWeights",
    "plan_skill_order",
    "assign_phases",
    "count_violations",
    "is_valid",
]
