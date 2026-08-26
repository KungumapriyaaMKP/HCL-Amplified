"""
The planner's one non-negotiable guarantee: zero prerequisite violations.
These run A* over the REAL 51-skill DAG, not a toy graph, because that is
what ships.
"""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from app.domain import Constraints, LearnerProfile, Mastery, Skill
from app.modules.planning import interface as planning

DATA = Path(__file__).resolve().parents[1] / "data"


@pytest.fixture(scope="module")
def skill_data() -> list[dict]:
    return json.loads((DATA / "skills.json").read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def skills(skill_data) -> dict[str, Skill]:
    return {
        s["id"]: Skill(
            id=s["id"], name=s["name"], category=s["topic"],
            prerequisites=s["prerequisites"], is_programming=s["is_programming"],
        )
        for s in skill_data
    }


@pytest.fixture(scope="module")
def depth(skill_data) -> dict[str, int]:
    return {s["id"]: s["depth"] for s in skill_data}


@pytest.fixture(scope="module")
def track() -> dict:
    tracks = json.loads((DATA / "tracks.json").read_text(encoding="utf-8"))
    return tracks[0]


def gaps_for(track, skills, profile):
    from app.modules.gap import interface as gap
    required = {s: spec["required"] for s, spec in track["skills"].items()}
    importance = {s: spec["importance"] for s, spec in track["skills"].items()}
    return gap.compute_gaps(profile, required, skills, importance)


class TestZeroViolations:
    def test_full_beginner_path_has_no_violations(self, track, skills, depth):
        """A blank-slate learner targeting the whole ML track."""
        profile = LearnerProfile(goal_text="ML Engineer")
        g = gaps_for(track, skills, profile)
        order = planning.plan_skill_order(g, profile, skills, depth)
        assert order, "planner returned an empty path"
        assert planning.count_violations(order, skills) == 0

    def test_partial_learner_path_has_no_violations(self, track, skills, depth):
        """Someone who already knows the Python + maths foundations."""
        known = ["python-fundamentals", "python-data-structures",
                 "linear-algebra", "statistics-fundamentals", "calculus-basics"]
        profile = LearnerProfile(
            mastery={k: Mastery(skill_id=k, level=0.9) for k in known}
        )
        g = gaps_for(track, skills, profile)
        order = planning.plan_skill_order(g, profile, skills, depth)
        assert planning.count_violations(order, skills) == 0
        # already-known skills should not be re-taught
        assert not (set(known) & set(order))

    @pytest.mark.parametrize("preset", ["fastest", "cheapest", "most_rigorous"])
    def test_every_priority_preset_is_valid(self, track, skills, depth, preset):
        from app.modules.planning.astar import PlannerWeights
        w = getattr(PlannerWeights, preset)()
        profile = LearnerProfile()
        g = gaps_for(track, skills, profile)
        order = planning.plan_skill_order(g, profile, skills, depth, weights=w)
        assert planning.count_violations(order, skills) == 0


class TestPathContent:
    def test_targets_are_reached(self, track, skills, depth):
        profile = LearnerProfile()
        g = gaps_for(track, skills, profile)
        order = planning.plan_skill_order(g, profile, skills, depth)
        # a high-importance leaf target must appear
        assert "transformer-architecture" in order
        assert "mlops-pipelines" in order

    def test_prerequisite_precedes_dependent(self, track, skills, depth):
        profile = LearnerProfile()
        g = gaps_for(track, skills, profile)
        order = planning.plan_skill_order(g, profile, skills, depth)
        pos = {s: i for i, s in enumerate(order)}
        # backprop requires multivariate calculus -- must come first
        assert pos["multivariate-calculus"] < pos["backpropagation"]
        assert pos["attention-mechanisms"] < pos["transformer-architecture"]


class TestMilestones:
    def test_phases_are_depth_ordered(self, track, skills, depth):
        from app.domain import Phase
        profile = LearnerProfile()
        g = gaps_for(track, skills, profile)
        order = planning.plan_skill_order(g, profile, skills, depth)
        phases = planning.assign_phases(order, skills, depth)
        rank = {Phase.FOUNDATIONS: 0, Phase.CORE: 1, Phase.ADVANCED: 2, Phase.CAPSTONE: 3}
        # foundations skill has lower avg depth than a capstone skill
        found = [depth[s] for s, p in phases.items() if p == Phase.FOUNDATIONS]
        cap = [depth[s] for s, p in phases.items() if p == Phase.CAPSTONE]
        if found and cap:
            assert sum(found) / len(found) < sum(cap) / len(cap)
