"""
Public surface of the planning module. Deliverable 4.

A* runs over SKILL nodes, not course nodes: courses have messy
inter-dependencies, canonical skills have clean ones. Each sequenced
skill then binds its best affordable resource.
"""
from __future__ import annotations

from dataclasses import dataclass

from app.domain import LearnerProfile, LearningPath, Skill, SkillGap

__all__ = ["PlannerWeights", "plan", "validate", "bind_within_budget"]


@dataclass(frozen=True)
class PlannerWeights:
    """
    Maps the Page 3 priority control onto g(n).

    A segmented control -- NOT three independent toggles, which would give
    eight ambiguous combinations ("fastest AND cheapest" -- which wins?).
    """
    time: float = 1.0
    cost: float = 0.5
    difficulty_jump: float = 0.5
    prior_experience: float = 0.5

    @classmethod
    def fastest(cls) -> "PlannerWeights":
        return cls(time=2.0, cost=0.2, difficulty_jump=0.4)

    @classmethod
    def cheapest(cls) -> "PlannerWeights":
        return cls(time=0.4, cost=2.0, difficulty_jump=0.4)

    @classmethod
    def most_rigorous(cls) -> "PlannerWeights":
        return cls(time=0.4, cost=0.4, difficulty_jump=1.5)


def plan(
    goal_skills: list[SkillGap],
    profile: LearnerProfile,
    skills: dict[str, Skill],
    weights: PlannerWeights | None = None,
) -> LearningPath:
    """
    Parameterised deliberately: F2 (what-if), F3 (relaxer), F4 and F7 all
    call this with different goals and weights. A single generate_my_path()
    would force a rewrite in week 2.
    """
    raise NotImplementedError


def validate(path: LearningPath, skills: dict[str, Skill]) -> int:
    """Kahn check. Returns the prerequisite-violation count -- must be 0."""
    raise NotImplementedError


def bind_within_budget(path: LearningPath, budget_usd: float | None) -> LearningPath:
    """
    F7: budget is a hard ceiling, enforced HERE rather than inside A*.

    Constrained shortest path with a budget dimension is NP-hard in general
    and cumulative spend explodes the search state. Binding instead: take the
    best affordable resource per skill, then downgrade the most expensive
    picks to free equivalents until the total fits.
    """
    raise NotImplementedError
