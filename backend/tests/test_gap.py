"""
Gap math is the arithmetic Deliverable 2 is graded on -- it must be exact,
and the probe-priority ordering is what makes the diagnostic targeted.
"""
from __future__ import annotations

import pytest

from app.domain import (
    Confidence,
    Constraints,
    LearnerProfile,
    Mastery,
    Skill,
)
from app.modules.gap import interface as gap


def mk_skill(sid: str, prereqs: list[str] | None = None) -> Skill:
    return Skill(id=sid, name=sid.title(), category="test", prerequisites=prereqs or [])


@pytest.fixture
def skills() -> dict[str, Skill]:
    return {s: mk_skill(s) for s in ["python", "linear-algebra", "ml", "deep-learning"]}


class TestGapMath:
    def test_gap_is_required_minus_current(self, skills):
        p = LearnerProfile(mastery={"python": Mastery(skill_id="python", level=0.3)})
        gaps = gap.compute_gaps(p, {"python": 0.9}, skills)
        assert gaps[0].gap == pytest.approx(0.6)

    def test_gap_never_negative(self, skills):
        # already above the requirement -> gap is 0, not negative
        p = LearnerProfile(mastery={"python": Mastery(skill_id="python", level=0.95)})
        gaps = gap.compute_gaps(p, {"python": 0.7}, skills)
        assert gaps[0].gap == 0.0

    def test_unknown_skill_defaults_to_zero_mastery(self, skills):
        p = LearnerProfile()  # no mastery recorded
        gaps = gap.compute_gaps(p, {"ml": 0.8}, skills)
        assert gaps[0].current_level == 0.0
        assert gaps[0].gap == pytest.approx(0.8)

    def test_priority_is_importance_times_gap(self, skills):
        p = LearnerProfile()
        gaps = gap.compute_gaps(p, {"ml": 1.0}, skills, importance={"ml": 0.5})
        assert gaps[0].priority == pytest.approx(0.5)

    def test_required_skill_not_in_graph_is_skipped(self, skills):
        p = LearnerProfile()
        gaps = gap.compute_gaps(p, {"nonexistent": 0.9}, skills)
        assert gaps == []


class TestPrioritise:
    def test_orders_by_priority_descending(self, skills):
        p = LearnerProfile()
        gaps = gap.compute_gaps(
            p, {"python": 1.0, "ml": 1.0},
            skills, importance={"python": 0.2, "ml": 0.9},
        )
        ordered = gap.prioritise(gaps)
        assert ordered[0].skill_id == "ml"

    def test_is_stable_for_equal_priority(self, skills):
        p = LearnerProfile()
        gaps = gap.compute_gaps(p, {"python": 1.0, "ml": 1.0}, skills)
        a = [g.skill_id for g in gap.prioritise(gaps)]
        b = [g.skill_id for g in gap.prioritise(list(reversed(gaps)))]
        assert a == b  # deterministic regardless of input order


class TestProbePriority:
    def test_high_fan_out_foundation_probed_before_leaf(self, skills):
        """The core reason probing is weighted, not uniform."""
        p = LearnerProfile()
        gaps = gap.compute_gaps(p, {"linear-algebra": 0.8, "deep-learning": 0.8}, skills)
        fan_out = {"linear-algebra": 30, "deep-learning": 0}
        ranked = gap.probe_priority(gaps, skills, fan_out)
        assert ranked[0][0] == "linear-algebra"

    def test_certain_and_mastered_skill_is_not_probed(self, skills):
        # already known with high confidence and no gap -> skip it
        p = LearnerProfile(mastery={
            "python": Mastery(skill_id="python", level=0.95, confidence=Confidence.HIGH),
        })
        gaps = gap.compute_gaps(p, {"python": 0.7}, skills)
        ranked = gap.probe_priority(gaps, skills, {"python": 20})
        assert "python" not in [s for s, _ in ranked]

    def test_low_confidence_outranks_high_at_equal_fan_out(self, skills):
        p = LearnerProfile(mastery={
            "python": Mastery(skill_id="python", level=0.5, confidence=Confidence.HIGH),
            "ml": Mastery(skill_id="ml", level=0.5, confidence=Confidence.LOW),
        })
        gaps = gap.compute_gaps(p, {"python": 0.9, "ml": 0.9}, skills)
        ranked = gap.probe_priority(gaps, skills, {"python": 10, "ml": 10})
        assert ranked[0][0] == "ml"  # less-trusted estimate is worth verifying
