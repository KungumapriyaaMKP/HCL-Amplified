"""
Adaptive rerouting -- Deliverable 6. The critical test is the infinite-loop
guard: a remediation must never spawn its own remediation.
"""
from __future__ import annotations

from datetime import datetime

from app.domain import (
    LearningEvent, EventType, LearningPath, Milestone, Phase, PathNode, Skill,
)
from app.modules.adapt import interface as adapt


def quiz(skill_id, score):
    return LearningEvent(type=EventType.QUIZ_ATTEMPTED, at=datetime.now(),
                         skill_id=skill_id, score=score)


def mk_path(*node_skills):
    nodes = [PathNode(skill_id=s, skill_name=s.title(), order=i)
             for i, s in enumerate(node_skills)]
    return LearningPath(goal_text="x",
                        milestones=[Milestone(phase=Phase.CORE, title="Core", nodes=nodes)])


class TestStuckDetection:
    def test_two_low_scores_is_stuck(self):
        events = [quiz("backprop", 0.4), quiz("backprop", 0.3)]
        assert adapt.detect_stuck(events, "backprop")

    def test_one_low_score_is_not_stuck(self):
        assert not adapt.detect_stuck([quiz("backprop", 0.3)], "backprop")

    def test_passing_then_failing_once_is_not_stuck(self):
        events = [quiz("backprop", 0.9), quiz("backprop", 0.3)]
        assert not adapt.detect_stuck(events, "backprop")

    def test_explicit_too_difficult(self):
        e = LearningEvent(type=EventType.FEEDBACK_GIVEN, at=datetime.now(),
                          skill_id="backprop", payload={"too_difficult": True})
        assert adapt.detect_stuck([e], "backprop")


class TestBridgeConcept:
    def test_finds_unmastered_prerequisite(self):
        skills = {
            "backprop": Skill(id="backprop", name="Backprop", category="dl",
                              prerequisites=["multivar-calc"]),
            "multivar-calc": Skill(id="multivar-calc", name="Multivariate Calculus",
                                   category="math", prerequisites=[]),
        }
        bridge = adapt.find_bridge_concept("backprop", skills, {"multivar-calc": 0.2})
        assert bridge == "multivar-calc"

    def test_descends_to_root_gap(self):
        skills = {
            "c": Skill(id="c", name="C", category="x", prerequisites=["b"]),
            "b": Skill(id="b", name="B", category="x", prerequisites=["a"]),
            "a": Skill(id="a", name="A", category="x", prerequisites=[]),
        }
        # everything upstream is weak -> should return the deepest root, a
        bridge = adapt.find_bridge_concept("c", skills, {"a": 0.1, "b": 0.1})
        assert bridge == "a"

    def test_none_when_prerequisites_mastered(self):
        skills = {
            "c": Skill(id="c", name="C", category="x", prerequisites=["b"]),
            "b": Skill(id="b", name="B", category="x", prerequisites=[]),
        }
        assert adapt.find_bridge_concept("c", skills, {"b": 0.9}) is None


class TestDetourInsertion:
    def test_detour_inserted_before_blocked_node(self):
        path = mk_path("linear-regression", "backprop", "transformers")
        path, ok = adapt.insert_detour(path, "backprop", "multivar-calc", "Multivariate Calculus")
        assert ok
        skills = [n.skill_id for n in path.milestones[0].nodes]
        assert skills == ["linear-regression", "multivar-calc", "backprop", "transformers"]

    def test_detour_is_flagged_and_attributed(self):
        path = mk_path("backprop")
        path, ok = adapt.insert_detour(path, "backprop", "multivar-calc", "Multivariate Calculus")
        detour = path.milestones[0].nodes[0]
        assert detour.is_remediation and detour.remediation_for == "backprop"

    def test_downstream_completed_work_is_preserved(self):
        path = mk_path("a", "backprop", "downstream")
        path, _ = adapt.insert_detour(path, "backprop", "bridge", "Bridge")
        assert "downstream" in [n.skill_id for n in path.milestones[0].nodes]

    def test_remediation_never_spawns_a_remediation(self):
        """THE guard: the prior build's infinite loop lived here."""
        path = mk_path("backprop")
        # first detour ok
        path, ok1 = adapt.insert_detour(path, "backprop", "bridge", "Bridge")
        assert ok1
        # the inserted remediation node cannot itself be remediated
        path, ok2 = adapt.insert_detour(path, "bridge", "deeper", "Deeper")
        assert not ok2

    def test_per_skill_detour_cap(self):
        path = mk_path("backprop")
        path, ok1 = adapt.insert_detour(path, "backprop", "b1", "B1")
        path, ok2 = adapt.insert_detour(path, "backprop", "b2", "B2")
        assert ok1 and not ok2  # capped at 1 by default
