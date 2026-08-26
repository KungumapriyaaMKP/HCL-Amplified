"""
Canonical skill mapper.

Maps arbitrary raw skill strings (from resumes, GitHub, or user input) to the
canonical skill DAG nodes using alias dictionaries and embedding cosine similarity.
"""
from __future__ import annotations

import json
from functools import lru_cache
import re

import numpy as np

from app.core.config import DATA_DIR
from app.domain import Skill
from app.ml.embedder import embed


@lru_cache(maxsize=1)
def _load_aliases() -> dict[str, list[str]]:
    path = DATA_DIR / "skill_aliases.json"
    if path.exists():
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            return {k: v for k, v in data.items() if not k.startswith("_")}
        except Exception:
            pass
    return {}


def map_to_canonical(
    raw_skill: str, skills: dict[str, Skill]
) -> tuple[str, float] | None:
    """
    Map raw skill text to (canonical_skill_id, confidence_score) or None.
    1. Exact ID match
    2. Alias matching
    3. Dense semantic similarity via embedding cosine
    """
    cleaned = raw_skill.strip().lower()
    if not cleaned:
        return None

    # 1. Exact ID
    if cleaned in skills:
        return (cleaned, 1.0)

    # 2. Alias dictionary
    aliases = _load_aliases()
    for sid, alias_list in aliases.items():
        if sid not in skills:
            continue
        for alias in alias_list:
            if alias.lower() == cleaned:
                return (sid, 0.98)
            # Word boundary regex match for phrases
            pattern = rf"\b{re.escape(alias.lower())}\b"
            if re.search(pattern, cleaned):
                return (sid, 0.92)

    # 3. Dense semantic match using embeddings
    try:
        qv = embed(cleaned)
        best_id: str | None = None
        best_sim = -1.0

        for sid, skill in skills.items():
            sv = embed(f"{skill.name}. {skill.description}")
            sim = float(np.dot(qv, sv))
            if sim > best_sim:
                best_sim = sim
                best_id = sid

        if best_id and best_sim >= 0.65:
            return (best_id, round(best_sim, 3))
    except Exception:
        pass

    return None
