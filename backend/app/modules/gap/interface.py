"""
Public surface of the gap module. Callers import ONLY from here.

Deliverable 2. All arithmetic is deterministic and LLM-free; the LLM is
used upstream (llm/) purely to decompose a goal into skills.
"""
from __future__ import annotations

from app.domain import LearnerProfile, Skill, SkillGap
from app.modules.gap.gap_engine import compute_gaps, prioritise, probe_priority

__all__ = ["compute_gaps", "prioritise", "probe_priority"]
