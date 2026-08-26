"""
Hybrid retrieval over the hot index -- Deliverable 3's candidate generation.

    Score = alpha * CosineSim(v_goal, v_res) + (1 - alpha) * BM25(q, d)

Dense similarity is a numpy dot product (vectors are unit-normalized, so the
dot product IS cosine); at ~9k docs this is sub-millisecond and a vector DB
would be pure overhead. BM25 runs over the same hot index.
"""
from __future__ import annotations

from functools import lru_cache

import numpy as np
from rank_bm25 import BM25Okapi

from app.core.config import settings
from app.domain import Resource
from app.ml.embedder import embed as embed_query
from app.modules.catalog.store import load_index


@lru_cache(maxsize=1)
def _bm25() -> tuple[BM25Okapi, list[Resource]]:
    resources, _, _ = load_index()
    corpus = [
        (r.title + " " + r.description).lower().split()
        for r in resources
    ]
    return BM25Okapi(corpus), resources


def search(query: str, top_k: int = 50, skill_id: str | None = None) -> list[Resource]:
    """
    Hybrid search. If `skill_id` is given, restrict to resources tagged with
    it (candidate generation for one gap skill), then rank by the blend.
    """
    resources, vecs, pos = load_index()
    bm25, _ = _bm25()

    # candidate pool
    if skill_id:
        idx = [i for i, r in enumerate(resources) if skill_id in r.skills_taught]
    else:
        idx = list(range(len(resources)))
    if not idx:
        return []

    # dense: cosine via dot product (unit-normalized vectors)
    qv = embed_query(query)
    dense = vecs[idx] @ qv  # (len(idx),)

    # sparse: BM25 over the same pool
    tokens = query.lower().split()
    bm_all = np.asarray(bm25.get_scores(tokens))
    sparse = bm_all[idx]

    # min-max normalize each to [0,1] before blending
    def norm(a: np.ndarray) -> np.ndarray:
        lo, hi = a.min(), a.max()
        return (a - lo) / (hi - lo) if hi > lo else np.zeros_like(a)

    alpha = settings.hybrid_alpha
    blended = alpha * norm(dense) + (1 - alpha) * norm(sparse)

    order = np.argsort(-blended)[:top_k]
    return [resources[idx[i]] for i in order]


def semantic_scores(query: str, resources: list[Resource]) -> dict[str, float]:
    """Cosine of the query against each resource -- for the reranker factor."""
    _, vecs, pos = load_index()
    qv = embed_query(query)
    out: dict[str, float] = {}
    for r in resources:
        if r.id in pos:
            out[r.id] = float(vecs[pos[r.id]] @ qv)
    return out
