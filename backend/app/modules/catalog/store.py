"""
Hot-index loader. Loads the committed, pre-tagged resources and their vectors
once at startup -- never tags or embeds the 23.6k catalog at boot.
"""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

import numpy as np

from app.core.config import DATA_DIR
from app.domain import CostType, Difficulty, Modality, Provider, Resource

_INDEX = DATA_DIR / "hot_index.json"
_VEC = DATA_DIR / "hot_vectors.npy"


def _to_resource(row: dict) -> Resource:
    return Resource(
        id=row["id"],
        provider=Provider(row["provider"]),
        title=row["title"],
        url=row["url"],
        description=row.get("description", ""),
        thumbnail_url=row.get("thumbnail_url"),
        duration_hours=row.get("duration_hours"),
        duration_source=row.get("duration_source"),
        difficulty=Difficulty(row["difficulty"]) if row.get("difficulty") else None,
        modality=Modality.VIDEO,
        cost_type=CostType(row.get("cost_type", "subscription")),
        price_usd=row.get("price_usd", 0.0),
        price_is_estimate=row.get("price_is_estimate", False),
        skills_taught=row.get("skills_taught", []),
        tag_confidence=row.get("tag_confidence", {}),
        tags_verified=row.get("tags_verified", False),
    )


@lru_cache(maxsize=1)
def load_index() -> tuple[list[Resource], np.ndarray, dict[str, int]]:
    """Returns (resources, vectors[N,384] float32, id -> row index)."""
    rows = json.loads(_INDEX.read_text(encoding="utf-8"))
    resources = [_to_resource(r) for r in rows]
    vecs = np.load(_VEC).astype(np.float32)
    pos = {r.id: i for i, r in enumerate(resources)}
    return resources, vecs, pos


def duration_display(row: dict) -> str:
    """Honest duration string from the stored provenance."""
    if row.get("duration_source") == "parsed":
        return f"{row['duration_hours']:g}h"
    lo, hi = row.get("duration_low"), row.get("duration_high")
    if lo and hi:
        return f"~{lo:.0f}-{hi:.0f}h"
    return f"~{row.get('duration_hours', 4):.0f}h"
