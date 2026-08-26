"""
The 7-factor reranker -- weights must sum to 1.0, scores stay bounded, and
ranking is deterministic. The weight-sum test guards the prior build's 1.45
bug directly.
"""
from __future__ import annotations

import pytest

from app.core.config import settings
from app.domain import (
    Constraints,
    Difficulty,
    LearnerProfile,
    Mastery,
    Modality,
    Provider,
    Resource,
    SkillGap,
)
from app.modules.retrieval import interface as retrieval
from app.modules.retrieval import scoring


def mk_resource(rid: str, **kw) -> Resource:
    base = dict(id=rid, provider=Provider.COURSERA, title=rid, url=f"http://x/{rid}")
    base.update(kw)
    return Resource(**base)


def mk_gap(skill_id="ml", current=0.2, gap=0.7) -> SkillGap:
    return SkillGap(
        skill_id=skill_id, skill_name=skill_id,
        required_level=current + gap, current_level=current, importance=1.0,
    )


class TestWeights:
    def test_seven_factor_weights_sum_to_one(self):
        """The single most important invariant -- a prior build hit 1.45."""
        total = sum(settings.rerank_weights.values())
        assert total == pytest.approx(1.0), f"weights sum to {total}, not 1.0"

    def test_there_are_exactly_seven_factors(self):
        assert len(settings.rerank_weights) == 7


class TestScoreBounds:
    @pytest.mark.parametrize("sim", [-0.5, 0.0, 0.5, 1.0, 1.5])
    def test_semantic_clamped(self, sim):
        assert 0.0 <= scoring.score_semantic(sim) <= 1.0

    def test_coverage_zero_when_skill_not_taught(self):
        r = mk_resource("r", skills_taught=["other"])
        assert scoring.score_skill_coverage(r, mk_gap("ml")) == 0.0

    def test_coverage_discounts_low_confidence_tag(self):
        confident = mk_resource("a", skills_taught=["ml"], tag_confidence={"ml": 0.95})
        unsure = mk_resource("b", skills_taught=["ml"], tag_confidence={"ml": 0.30})
        assert (scoring.score_skill_coverage(confident, mk_gap("ml"))
                > scoring.score_skill_coverage(unsure, mk_gap("ml")))

    def test_prerequisite_readiness_fraction(self):
        p = LearnerProfile(mastery={
            "a": Mastery(skill_id="a", level=0.9),
            "b": Mastery(skill_id="b", level=0.1),
        })
        r = mk_resource("r", prerequisite_skills=["a", "b"])
        assert scoring.score_prerequisite_readiness(r, p) == pytest.approx(0.5)

    def test_quality_softened_by_review_count(self):
        many = mk_resource("a", rating=5.0, num_reviews=500)
        few = mk_resource("b", rating=5.0, num_reviews=1)
        assert scoring.score_quality(many) > scoring.score_quality(few)


class TestReranking:
    def test_relevant_confident_match_ranks_first(self):
        p = LearnerProfile()
        gap = mk_gap("ml")
        good = mk_resource("good", skills_taught=["ml"], tag_confidence={"ml": 0.95},
                           difficulty=Difficulty.BEGINNER, rating=4.8, num_reviews=200)
        bad = mk_resource("bad", skills_taught=["unrelated"],
                          difficulty=Difficulty.ADVANCED, rating=3.0, num_reviews=5)
        out = retrieval.rerank([bad, good], gap, p, semantic={"good": 0.9, "bad": 0.1})
        assert out[0].resource.id == "good"

    def test_every_component_is_retained(self):
        """Deliverable 5 needs these numbers -- they must all be present."""
        out = retrieval.rerank([mk_resource("r", skills_taught=["ml"])], mk_gap("ml"),
                               LearnerProfile(), semantic={"r": 0.5})
        assert set(out[0].factors) == set(settings.rerank_weights)

    def test_final_score_is_the_weighted_sum(self):
        r = mk_resource("r", skills_taught=["ml"], rating=4.0, num_reviews=50)
        out = retrieval.rerank([r], mk_gap("ml"), LearnerProfile(), semantic={"r": 0.6})
        w = settings.rerank_weights
        expected = sum(w[k] * v for k, v in out[0].factors.items())
        assert out[0].final == pytest.approx(expected)

    def test_ranking_is_deterministic(self):
        p = LearnerProfile()
        gap = mk_gap("ml")
        rs = [mk_resource(f"r{i}", skills_taught=["ml"]) for i in range(5)]
        a = [s.resource.id for s in retrieval.rerank(rs, gap, p)]
        b = [s.resource.id for s in retrieval.rerank(list(reversed(rs)), gap, p)]
        assert a == b
