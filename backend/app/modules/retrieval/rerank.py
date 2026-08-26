"""
Apply the 7-factor weighted scorer to candidate resources.

final = w1*coverage + w2*semantic + w3*prereq + w4*difficulty
      + w5*modality + w6*quality + w7*freshness
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime

from app.core.config import settings
from app.domain import LearnerProfile, Resource, SkillGap
from app.modules.retrieval import scoring


@dataclass
class ScoredResource:
    resource: Resource
    final: float
    factors: dict[str, float] = field(default_factory=dict)


def rerank(
    candidates: list[Resource],
    gap: SkillGap,
    profile: LearnerProfile,
    semantic: dict[str, float] | None = None,
    top_k: int = 5,
    now: datetime | None = None,
) -> list[ScoredResource]:
    """Score and sort candidates for a single gap skill. Order is stable."""
    semantic = semantic or {}
    w = settings.rerank_weights
    scored: list[ScoredResource] = []

    for r in candidates:
        factors = {
            "skill_coverage": scoring.score_skill_coverage(r, gap),
            "semantic": scoring.score_semantic(semantic.get(r.id, 0.0)),
            "prerequisite": scoring.score_prerequisite_readiness(r, profile),
            "difficulty": scoring.score_difficulty_fit(r, profile, gap),
            "modality": scoring.score_modality(r, profile),
            "quality": scoring.score_quality(r),
            "freshness": scoring.score_freshness(r, now),
        }
        final = sum(w[k] * v for k, v in factors.items())
        scored.append(ScoredResource(resource=r, final=final, factors=factors))

    scored.sort(key=lambda s: (-s.final, s.resource.id))
    return scored[:top_k]
