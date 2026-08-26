"""
Topological validation via Kahn's algorithm.

The planner's core guarantee is zero prerequisite violations. This checks it
independently of A*, so a bug in the search is caught rather than shipped.
"""
from __future__ import annotations

from app.domain import Skill


def count_violations(order: list[str], skills: dict[str, Skill]) -> int:
    """
    How many skills appear before one of their prerequisites. Zero is the
    contract; the number is surfaced in the UI and asserted in tests.
    """
    seen: set[str] = set()
    violations = 0
    for sid in order:
        skill = skills.get(sid)
        if skill:
            for p in skill.prerequisites:
                # a prerequisite that is in this plan but not yet seen = violation
                if p in order and p not in seen:
                    violations += 1
        seen.add(sid)
    return violations


def is_valid(order: list[str], skills: dict[str, Skill]) -> bool:
    return count_violations(order, skills) == 0
