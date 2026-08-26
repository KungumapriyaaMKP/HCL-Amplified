"""
Stuck detection and dual-graph remediation -- Deliverable 6, deterministic.

On blockage, find the missing upstream concept and splice a remediation node
into the active path without disturbing completed work or downstream order.

GUARD: a remediation never spawns its own remediation, and detours per skill
are capped. An earlier internal build shipped exactly this infinite loop
(scoring < 50% on a remediation inserted another identical remediation).
"""
from __future__ import annotations

from app.core.config import settings
from app.domain import (
    LearningEvent,
    LearningPath,
    NodeStatus,
    PathNode,
    Skill,
)


def detect_stuck(events: list[LearningEvent], skill_id: str) -> bool:
    """
    Two consecutive quiz attempts below the stuck threshold on this skill, or
    one explicit "too difficult" signal.
    """
    relevant = [
        e for e in events
        if e.skill_id == skill_id and e.type.value == "quiz_attempted"
    ]
    recent = relevant[-settings.stuck_attempts:]
    if len(recent) >= settings.stuck_attempts and all(
        (e.score or 1.0) < settings.stuck_threshold for e in recent
    ):
        return True
    return any(e.payload.get("too_difficult") for e in events if e.skill_id == skill_id)


def find_bridge_concept(
    skill_id: str, skills: dict[str, Skill], mastery: dict[str, float]
) -> str | None:
    """
    The nearest unmastered prerequisite -- the concept actually blocking the
    learner. Walks upstream, returning the deepest unmastered prerequisite so
    the remediation targets the true root, not an intermediate.
    """
    skill = skills.get(skill_id)
    if not skill:
        return None

    weak_prereqs = [
        p for p in skill.prerequisites if mastery.get(p, 0.0) < 0.6
    ]
    if not weak_prereqs:
        return None

    # descend into the weakest prerequisite chain to find the root gap
    for p in weak_prereqs:
        deeper = find_bridge_concept(p, skills, mastery)
        if deeper:
            return deeper
    return weak_prereqs[0]


def insert_detour(
    path: LearningPath,
    blocked_skill_id: str,
    bridge_skill_id: str,
    bridge_skill_name: str,
) -> tuple[LearningPath, bool]:
    """
    Splice a remediation node for `bridge_skill_id` immediately before the
    blocked node. Returns (path, inserted). Refuses to insert when the blocked
    node is itself a remediation, or the per-skill detour cap is reached --
    this is the guard against the infinite remediation loop.
    """
    for milestone in path.milestones:
        for idx, node in enumerate(milestone.nodes):
            if node.skill_id != blocked_skill_id:
                continue

            # GUARD 1: never remediate a remediation
            if node.is_remediation:
                return path, False

            # GUARD 2: cap detours for this skill
            existing = sum(
                1 for n in milestone.nodes
                if n.is_remediation and n.remediation_for == blocked_skill_id
            )
            if existing >= settings.max_detours_per_skill:
                return path, False

            detour = PathNode(
                skill_id=bridge_skill_id,
                skill_name=bridge_skill_name,
                status=NodeStatus.NEXT,
                phase=node.phase,
                order=node.order,
                estimated_hours=0.5,
                xp=50,
                is_remediation=True,
                remediation_for=blocked_skill_id,
                rationale=(
                    f"Quick refresher on {bridge_skill_name} to unlock "
                    f"{node.skill_name}."
                ),
            )
            milestone.nodes.insert(idx, detour)
            # downstream nodes keep their relative order; bump order fields
            for n in milestone.nodes[idx + 1:]:
                n.order += 1
            return path, True

    return path, False
