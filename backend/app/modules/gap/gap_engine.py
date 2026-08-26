"""
Gap engine internals -- Deliverable 2, deterministic and LLM-free.

Pure functions over plain data: no network, no model loading. They test in
milliseconds and stay correct when a provider rate-limits.
"""
from __future__ import annotations

from app.domain import Confidence, LearnerProfile, Skill, SkillGap

# How much a mastery estimate can be trusted, as a 0..1 multiplier. Drives
# probe priority: a LOW-confidence skill is a better thing to quiz than a
# HIGH-confidence one, all else equal.
_UNCERTAINTY = {
    Confidence.HIGH: 0.15,
    Confidence.MEDIUM: 0.55,
    Confidence.LOW: 1.00,
}


def compute_gaps(
    profile: LearnerProfile,
    required: dict[str, float],
    skills: dict[str, Skill],
    importance: dict[str, float] | None = None,
) -> list[SkillGap]:
    """SkillGap(s) = max(0, Req(s) - Current(s)) for every required skill."""
    importance = importance or {}
    out: list[SkillGap] = []
    for sid, req in required.items():
        skill = skills.get(sid)
        if skill is None:
            continue
        mastery = profile.mastery.get(sid)
        current = mastery.level if mastery else 0.0
        conf = mastery.confidence if mastery else Confidence.LOW
        out.append(
            SkillGap(
                skill_id=sid,
                skill_name=skill.name,
                required_level=req,
                current_level=current,
                importance=importance.get(sid, 1.0),
                confidence=conf,
            )
        )
    return out


def prioritise(gaps: list[SkillGap]) -> list[SkillGap]:
    """Sort by Priority(s) = Importance(s) x Gap(s), descending. Stable."""
    return sorted(gaps, key=lambda g: (-g.priority, g.skill_id))


def probe_priority(
    gaps: list[SkillGap],
    skills: dict[str, Skill],
    fan_out: dict[str, int],
) -> list[tuple[str, float]]:
    """
    Stage 0d: which skills the diagnostic should probe.

        probe_priority(s) = uncertainty(s) x downstream_fan_out(s)

    A wrong estimate on a high-fan-out foundation poisons everything below
    it; a wrong estimate on a leaf costs almost nothing. Skills already known
    with HIGH confidence fall to the bottom -- no point re-quizzing them.
    Only skills with a genuine gap or genuine uncertainty are worth an item.
    """
    scored: list[tuple[str, float]] = []
    for g in gaps:
        # nothing to learn and already certain -> not worth probing
        if g.gap <= 0 and g.confidence is Confidence.HIGH:
            continue
        uncertainty = _UNCERTAINTY[g.confidence]
        # +1 so a zero-fan-out leaf still ranks by uncertainty rather than 0
        weight = fan_out.get(g.skill_id, 0) + 1
        scored.append((g.skill_id, uncertainty * weight))
    return sorted(scored, key=lambda x: (-x[1], x[0]))
