"""
Public surface of the retrieval module. Deliverable 3.

Hybrid: alpha * CosineSim + (1 - alpha) * BM25, then the 7-factor rerank
whose component scores are retained for Deliverable 5.
"""
from __future__ import annotations

from app.modules.retrieval.rerank import ScoredResource, rerank

__all__ = ["ScoredResource", "rerank"]
