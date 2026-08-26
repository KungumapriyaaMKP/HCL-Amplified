"""
Poincaré hyperbolic embeddings endpoint for hierarchical skill knowledge graphs.

Maps the DAG ontology into the 2D Poincaré disk (||(u, v)|| < 1) where depth
translates directly to hyperbolic radius r = tanh(alpha * depth), preserving tree distances.
"""
from __future__ import annotations

import json
import math
from functools import lru_cache

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import DATA_DIR

router = APIRouter(prefix="/poincare")


class PoincareNode(BaseModel):
    id: str
    name: str
    topic: str
    depth: int
    fan_out: int
    u: float
    v: float
    radius: float
    angle: float


class PoincareEdge(BaseModel):
    source: str
    target: str
    hyperbolic_dist: float


class PoincareResponse(BaseModel):
    nodes: list[PoincareNode]
    edges: list[PoincareEdge]


def _hyperbolic_dist(u1: float, v1: float, u2: float, v2: float) -> float:
    """Poincaré disk metric: d_H(x, y) = arcosh(1 + 2 * ||x-y||^2 / ((1-||x||^2)(1-||y||^2)))."""
    norm1_sq = u1 * u1 + v1 * v1
    norm2_sq = u2 * u2 + v2 * v2
    diff_sq = (u1 - u2) ** 2 + (v1 - v2) ** 2

    denom = (1.0 - norm1_sq) * (1.0 - norm2_sq)
    if denom <= 1e-9:
        return 5.0

    delta = 1.0 + 2.0 * diff_sq / denom
    delta = max(1.0, delta)
    return float(math.acosh(delta))


@router.get("", response_model=PoincareResponse)
async def get_poincare_disk_layout() -> PoincareResponse:
    """
    Compute 2D Poincaré disk embeddings for the entire skill graph ontology.
    """
    rows = json.loads((DATA_DIR / "skills.json").read_text(encoding="utf-8"))

    # Group skills by topic to assign angular sectors
    topics = sorted(list({r["topic"] for r in rows}))
    topic_angle_base = {t: (2 * math.pi * i) / len(topics) for i, t in enumerate(topics)}
    topic_counts: dict[str, int] = {}

    nodes: list[PoincareNode] = []
    node_map: dict[str, PoincareNode] = {}

    for r in rows:
        topic = r["topic"]
        depth = r["depth"]
        fan_out = r["fan_out"]

        # Hyperbolic radius r in [0, 0.90] based on depth
        r_hyperbolic = math.tanh(0.32 * depth)
        r_hyperbolic = min(0.88, r_hyperbolic)

        # Angular distribution within topic sector
        idx_in_topic = topic_counts.get(topic, 0)
        topic_counts[topic] = idx_in_topic + 1
        sector_span = (2 * math.pi / len(topics)) * 0.8
        angle = topic_angle_base[topic] + (idx_in_topic * 0.23) % sector_span

        u = round(r_hyperbolic * math.cos(angle), 4)
        v = round(r_hyperbolic * math.sin(angle), 4)

        node = PoincareNode(
            id=r["id"],
            name=r["name"],
            topic=topic,
            depth=depth,
            fan_out=fan_out,
            u=u,
            v=v,
            radius=round(r_hyperbolic, 3),
            angle=round(angle, 3),
        )
        nodes.append(node)
        node_map[node.id] = node

    # Compute edges with hyperbolic distances
    edges: list[PoincareEdge] = []
    for r in rows:
        target_id = r["id"]
        target_node = node_map.get(target_id)
        if not target_node:
            continue
        for prereq_id in r.get("prerequisites", []):
            source_node = node_map.get(prereq_id)
            if source_node:
                d_h = _hyperbolic_dist(
                    source_node.u, source_node.v, target_node.u, target_node.v
                )
                edges.append(
                    PoincareEdge(
                        source=prereq_id,
                        target=target_id,
                        hyperbolic_dist=round(d_h, 3),
                    )
                )

    return PoincareResponse(nodes=nodes, edges=edges)
