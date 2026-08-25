"""
Public surface of the catalog module.

Four legs, every link real: Coursera (bulk, keyless), YouTube (live, keyed),
Microsoft Learn (live, keyless), Udemy (dataset, real prices).

Two-tier index: the HOT index holds resources whose predicted skill tags
clear the confidence threshold; the COLD store keeps all ~23.6k for
re-tagging when tracks are added.
"""
from __future__ import annotations

from app.domain import Resource, Skill

__all__ = ["load_hot_index", "enrich_live", "price_of"]


def load_hot_index() -> list[Resource]:
    """Confidently-tagged resources -- what BM25 and dense search run over."""
    raise NotImplementedError


def enrich_live(query: str, skills: dict[str, Skill], limit: int = 10) -> list[Resource]:
    """
    Live YouTube + MS Learn fetch, tagged on the fly and cached.

    YouTube free quota is ~100 searches/day (search.list costs 100 of
    10,000 units), so caching is required, not optional.
    """
    raise NotImplementedError


def price_of(resource: Resource) -> tuple[float, bool]:
    """
    Returns (usd, is_estimate).

    YouTube / MS Learn -> 0.0, exact. Udemy -> dataset list price, exact.
    Coursera -> subscription model, ESTIMATE -- must be labelled as such in
    the UI. The API exposes no price and we do not invent one.
    """
    raise NotImplementedError
