"""
Grounded explanation -- Deliverable 5.

build_evidence assembles the facts the engine computed. render_rationale
turns them into a sentence. The template renderer here uses ONLY those
numbers; the LLM layer (llm/) may reword its output but is contractually
forbidden from introducing, altering, or rounding any figure.

If a number on screen was not produced upstream, this deliverable is hollow
-- so the evidence dict is the single source, and the renderer never invents.
"""
from __future__ import annotations

from app.domain import PathNode, SkillGap


def build_evidence(
    node: PathNode,
    gap: SkillGap,
    satisfied_prereqs: list[str],
    factor_scores: dict[str, float],
) -> dict:
    """Collect the computed facts behind one recommendation."""
    return {
        "skill_name": node.skill_name,
        "resource_title": node.resource.title if node.resource else None,
        "provider": node.resource.provider.value if node.resource else None,
        "gap_delta": round(gap.gap * 100),          # percentage points closed
        "current_level": round(gap.current_level * 100),
        "required_level": round(gap.required_level * 100),
        "satisfied_prereqs": satisfied_prereqs,
        "semantic": round(factor_scores.get("semantic", 0.0), 2),
        "coverage": round(factor_scores.get("skill_coverage", 0.0), 2),
        "hours": node.estimated_hours,
        "is_remediation": node.is_remediation,
    }


def render_rationale(ev: dict) -> str:
    """Deterministic template. Every number here comes from `ev`."""
    if ev["is_remediation"]:
        return (
            f"Quick refresher on {ev['skill_name']} — a prerequisite you "
            f"haven't mastered yet — to unlock the blocked module."
        )

    parts: list[str] = []
    if ev["resource_title"]:
        parts.append(
            f"**{ev['resource_title']}** teaches {ev['skill_name']}, "
            f"closing an estimated {ev['gap_delta']}-point gap "
            f"({ev['current_level']}% → {ev['required_level']}%)."
        )
    else:
        parts.append(
            f"{ev['skill_name']} — closing an estimated {ev['gap_delta']}-point gap."
        )

    if ev["satisfied_prereqs"]:
        names = ", ".join(ev["satisfied_prereqs"][:3])
        parts.append(f"Prerequisites satisfied: {names}.")

    if ev["semantic"] >= 0.5:
        parts.append(f"Semantic match {ev['semantic']:.2f}.")

    return " ".join(parts)
