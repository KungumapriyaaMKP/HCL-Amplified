"""
Public surface of the explain module. Deliverable 5.

Numbers are computed first and passed in; rendering only phrases them.
"""
from __future__ import annotations

from app.modules.explain.rationale import build_evidence, render_rationale

__all__ = ["build_evidence", "render_rationale"]
