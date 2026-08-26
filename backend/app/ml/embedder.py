"""
Query embedder -- the ml/ layer owns model loading (coupling rule 6).

Modules call embed(); they never import fastembed. The catalog's document
vectors are precomputed offline; this encodes queries at request time with
the same model, so query and document vectors share a space.
"""
from __future__ import annotations

from functools import lru_cache

import numpy as np

from app.core.config import settings


@lru_cache(maxsize=1)
def _model():
    from fastembed import TextEmbedding
    return TextEmbedding(model_name=settings.embedding_model)


@lru_cache(maxsize=2048)
def embed(text: str) -> np.ndarray:
    """
    Encode one query string to a unit-normalized float32 vector.

    Cached: skill-name queries repeat on every /api/plan call, so after the
    first request the 48 per-skill searches hit the cache instead of the
    encoder -- the dominant latency win.
    """
    vec = next(iter(_model().embed([text])))
    return np.asarray(vec, dtype=np.float32)
