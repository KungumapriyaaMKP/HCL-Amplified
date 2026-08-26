"""
Public surface of the catalog module.

Two-tier: the hot index (confidently-tagged, searchable) is loaded here; the
cold store stays on disk for re-tagging. Live enrichment (YouTube, MS Learn)
attaches at query time -- W1.
"""
from __future__ import annotations

from app.domain import Resource
from app.modules.catalog.search import search, semantic_scores
from app.modules.catalog.store import load_index

__all__ = ["search", "semantic_scores", "load_index", "load_hot_index"]


def load_hot_index() -> list[Resource]:
    resources, _, _ = load_index()
    return resources
