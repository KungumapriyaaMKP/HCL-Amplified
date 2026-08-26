"""
Partition a sequenced skill list into the four progressive phases the
roadmap renders as columns: Foundations -> Core -> Advanced -> Capstone.

Phase is assigned by DAG depth so the split is principled rather than an
even quartering: foundations really are the low-depth skills.
"""
from __future__ import annotations

from app.domain import Phase, Skill


def assign_phases(
    order: list[str], skills: dict[str, Skill], depth: dict[str, int]
) -> dict[str, Phase]:
    """Map each skill id to its phase, by depth banding."""
    if not order:
        return {}
    depths = [depth[s] for s in order]
    lo, hi = min(depths), max(depths)
    span = max(1, hi - lo)

    phases: dict[str, Phase] = {}
    for sid in order:
        frac = (depth[sid] - lo) / span
        if frac < 0.25:
            phases[sid] = Phase.FOUNDATIONS
        elif frac < 0.55:
            phases[sid] = Phase.CORE
        elif frac < 0.85:
            phases[sid] = Phase.ADVANCED
        else:
            phases[sid] = Phase.CAPSTONE
    return phases
