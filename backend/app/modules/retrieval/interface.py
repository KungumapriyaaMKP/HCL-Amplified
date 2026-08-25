"""
Public surface of the retrieval module. Deliverable 3.

Hybrid: alpha * CosineSim(v_goal, v_res) + (1 - alpha) * BM25(q, d),
then a 7-factor deterministic rerank whose component scores are retained
so Deliverable 5 can quote real numbers.
"""
from __future__ import annotations

from app.domain import LearnerProfile, Resource, SkillGap

__all__ = ["search", "rerank", "ScoredResource"]


class ScoredResource:
    """A resource plus every component score that produced its rank."""

    def __init__(self, resource: Resource, scores: dict[str, float], final: float):
        self.resource = resource
        self.scores = scores
        self.final = final


def search(query: str, top_k: int = 50, skill_id: str | None = None) -> list[Resource]:
    """Hybrid BM25 + dense retrieval over the hot index."""
    raise NotImplementedError


def rerank(
    candidates: list[Resource],
    gap: SkillGap,
    profile: LearnerProfile,
    top_k: int = 5,
) -> list[ScoredResource]:
    """7-factor weighted rerank. Weights sum to 1.0 (asserted in tests)."""
    raise NotImplementedError
