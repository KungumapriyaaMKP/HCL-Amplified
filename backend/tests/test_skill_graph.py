"""
The skill DAG is the substrate everything else consumes. A malformed graph
surfaces later as a mysterious pathfinding bug, so it is validated here
rather than discovered downstream.
"""
from __future__ import annotations

import json
from pathlib import Path

import networkx as nx
import pytest

DATA = Path(__file__).resolve().parents[1] / "data"


@pytest.fixture(scope="module")
def skills() -> list[dict]:
    return json.loads((DATA / "skills.json").read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def by_id(skills) -> dict[str, dict]:
    return {s["id"]: s for s in skills}


@pytest.fixture(scope="module")
def graph(skills) -> nx.DiGraph:
    g = nx.DiGraph()
    g.add_nodes_from(s["id"] for s in skills)
    for s in skills:
        for p in s["prerequisites"]:
            g.add_edge(p, s["id"])
    return g


@pytest.fixture(scope="module")
def tracks() -> list[dict]:
    return json.loads((DATA / "tracks.json").read_text(encoding="utf-8"))


class TestIntegrity:
    def test_ids_unique(self, skills):
        ids = [s["id"] for s in skills]
        assert len(ids) == len(set(ids))

    def test_every_prerequisite_resolves(self, skills, by_id):
        for s in skills:
            for p in s["prerequisites"]:
                assert p in by_id, f"{s['id']} requires unknown skill {p!r}"

    def test_no_self_prerequisite(self, skills):
        for s in skills:
            assert s["id"] not in s["prerequisites"]

    def test_required_fields_present(self, skills):
        for s in skills:
            assert s["name"] and s["description"] and s["topic"]
            assert isinstance(s["is_programming"], bool)


class TestAcyclicity:
    def test_graph_is_a_dag(self, graph):
        """The claim the whole planner rests on."""
        assert nx.is_directed_acyclic_graph(graph), (
            f"cycles found: {list(nx.simple_cycles(graph))[:3]}"
        )

    def test_topological_sort_covers_every_skill(self, graph, skills):
        assert len(list(nx.topological_sort(graph))) == len(skills)

    def test_graph_is_connected_enough_to_sequence(self, graph, skills):
        """Isolated nodes cannot be reached by A* from any foundation."""
        isolated = [n for n in graph if graph.degree(n) == 0]
        assert not isolated, f"unreachable skills: {isolated}"


class TestDerivedFields:
    def test_depth_matches_longest_prerequisite_chain(self, graph, by_id):
        for node in nx.topological_sort(graph):
            preds = list(graph.predecessors(node))
            expected = max((by_id[p]["depth"] for p in preds), default=-1) + 1
            assert by_id[node]["depth"] == expected, f"{node} depth is stale"

    def test_fan_out_matches_descendant_count(self, graph, by_id):
        for node in graph:
            assert by_id[node]["fan_out"] == len(nx.descendants(graph, node))

    def test_roots_have_depth_zero(self, graph, by_id):
        for node in graph:
            if graph.in_degree(node) == 0:
                assert by_id[node]["depth"] == 0

    def test_foundations_have_the_highest_fan_out(self, by_id):
        """
        Sanity-check the signal that drives probe priority and review urgency:
        the most-depended-upon skills should be foundations, not leaves.
        """
        top = sorted(by_id.values(), key=lambda s: -s["fan_out"])[:5]
        assert all(s["depth"] <= 2 for s in top), (
            "a deep skill has more dependents than the foundations -- "
            "the fan-out weighting would mis-prioritise"
        )


class TestTracks:
    def test_track_skills_all_exist(self, tracks, by_id):
        for track in tracks:
            for sid in track["skills"]:
                assert sid in by_id, f"track {track['id']} names unknown skill {sid!r}"

    def test_levels_and_importance_in_range(self, tracks):
        for track in tracks:
            for sid, spec in track["skills"].items():
                assert 0.0 <= spec["required"] <= 1.0, sid
                assert 0.0 <= spec["importance"] <= 1.0, sid

    def test_track_is_prerequisite_closed(self, tracks, by_id):
        """
        If a track requires a skill, it must also require that skill's
        prerequisites -- otherwise A* would sequence a node the learner was
        never told they needed.
        """
        for track in tracks:
            named = set(track["skills"])
            for sid in named:
                for p in by_id[sid]["prerequisites"]:
                    assert p in named, (
                        f"track {track['id']} requires {sid!r} but omits its "
                        f"prerequisite {p!r}"
                    )

    def test_demand_snapshot_is_dated(self, tracks):
        """Demand figures are a curated snapshot; the date must be shown."""
        for track in tracks:
            assert track.get("demand_snapshot_date"), track["id"]
