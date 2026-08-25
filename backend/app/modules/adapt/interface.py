"""
Public surface of the adapt module. Deliverable 6.

Dual-graph rerouting: on blockage, query the concept-similarity graph for
the missing upstream concept and splice a detour into the active phase
without disturbing completed work or downstream order.
"""
from __future__ import annotations

from app.domain import LearningEvent, LearningPath, Skill

__all__ = ["detect_stuck", "find_bridge_concept", "insert_detour"]


def detect_stuck(events: list[LearningEvent], skill_id: str) -> bool:
    """Two attempts below the stuck threshold, or explicit 'too difficult'."""
    raise NotImplementedError


def find_bridge_concept(
    skill_id: str, skills: dict[str, Skill], mastery: dict[str, float]
) -> str | None:
    """Nearest unmastered upstream prerequisite -- the actual blocker."""
    raise NotImplementedError


def insert_detour(path: LearningPath, blocked_skill_id: str, bridge_skill_id: str) -> LearningPath:
    """
    Splice a remediation node in.

    GUARD: never insert a remediation for a node that is already one, and
    cap detours per skill -- the prior build shipped exactly this infinite
    loop (see plan Part 3).
    """
    raise NotImplementedError
