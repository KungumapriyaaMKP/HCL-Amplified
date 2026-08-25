"""
Public surface of the gap module. Callers import ONLY from here.

Deliverable 2. All arithmetic is deterministic and LLM-free; the LLM is
used upstream (llm/) purely to decompose a goal into skills.
"""
from __future__ import annotations

from app.domain import LearnerProfile, Skill, SkillGap

__all__ = ["compute_gaps", "prioritise", "probe_priority"]


def compute_gaps(
    profile: LearnerProfile,
    required: dict[str, float],
    skills: dict[str, Skill],
    importance: dict[str, float] | None = None,
) -> list[SkillGap]:
    """SkillGap(s) = max(0, Req(s) - Current(s)) for every required skill."""
    raise NotImplementedError


def prioritise(gaps: list[SkillGap]) -> list[SkillGap]:
    """Sort by Priority(s) = Importance(s) x Gap(s), descending."""
    raise NotImplementedError


def probe_priority(
    gaps: list[SkillGap],
    skills: dict[str, Skill],
    target_skill_ids: set[str],
) -> list[tuple[str, float]]:
    """
    Stage 0d: which skills the diagnostic should test.

        probe_priority = uncertainty x downstream_fan_out

    Fan-out is why this matters: a wrong Linear Algebra estimate poisons
    every downstream skill; a wrong leaf estimate costs nearly nothing.
    """
    raise NotImplementedError
