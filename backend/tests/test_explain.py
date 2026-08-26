"""
Deliverable 5: the rationale must contain only engine-computed numbers.
The tests assert the numbers in the text match the evidence exactly -- no
invention, no rounding drift.
"""
from __future__ import annotations

from app.domain import PathNode, Provider, Resource, SkillGap
from app.modules.explain import interface as explain


def mk_node(remediation=False, with_resource=True):
    res = Resource(id="r", provider=Provider.COURSERA, title="Attention Models",
                   url="http://x") if with_resource else None
    return PathNode(skill_id="attention", skill_name="Attention Mechanisms",
                    resource=res, estimated_hours=18.0, is_remediation=remediation)


def mk_gap(current=0.2, required=0.9):
    return SkillGap(skill_id="attention", skill_name="Attention Mechanisms",
                    required_level=required, current_level=current, importance=1.0)


class TestEvidence:
    def test_gap_delta_is_computed_from_gap(self):
        ev = explain.build_evidence(mk_node(), mk_gap(0.2, 0.9), [], {})
        assert ev["gap_delta"] == 70  # (0.9 - 0.2) * 100

    def test_levels_recorded(self):
        ev = explain.build_evidence(mk_node(), mk_gap(0.3, 0.8), [], {})
        assert ev["current_level"] == 30 and ev["required_level"] == 80


class TestRationaleGrounding:
    def test_rationale_states_the_computed_gap(self):
        ev = explain.build_evidence(mk_node(), mk_gap(0.2, 0.9),
                                    ["Linear Algebra"], {"semantic": 0.83})
        text = explain.render_rationale(ev)
        assert "70-point" in text           # the computed delta
        assert "Attention Models" in text   # the real resource title
        assert "Linear Algebra" in text     # the satisfied prereq
        assert "0.83" in text               # the real semantic score

    def test_low_semantic_is_omitted_not_faked(self):
        ev = explain.build_evidence(mk_node(), mk_gap(), [], {"semantic": 0.2})
        assert "0.2" not in explain.render_rationale(ev)

    def test_remediation_has_its_own_phrasing(self):
        ev = explain.build_evidence(mk_node(remediation=True), mk_gap(), [], {})
        text = explain.render_rationale(ev)
        assert "refresher" in text.lower() and "unlock" in text.lower()

    def test_no_resource_still_grounded(self):
        ev = explain.build_evidence(mk_node(with_resource=False), mk_gap(0.2, 0.9), [], {})
        text = explain.render_rationale(ev)
        assert "70-point" in text
