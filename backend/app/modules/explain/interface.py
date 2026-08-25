"""
Public surface of the explain module. Deliverable 5.

The contract: numbers are computed first and passed in; the LLM only
phrases them. If a figure on screen was not produced by the engine, this
deliverable is hollow.
"""
from __future__ import annotations

from app.domain import PathNode, SkillGap

__all__ = ["build_evidence", "render_rationale"]


def build_evidence(node: PathNode, gap: SkillGap, satisfied_prereqs: list[str]) -> dict:
    """Assemble the computed facts -- gap delta, prereqs met, factor scores."""
    raise NotImplementedError


def render_rationale(evidence: dict) -> str:
    """
    Phrase the evidence in natural language. The LLM may reword but must
    not introduce, alter, or round any number.
    """
    raise NotImplementedError
