"""
Public surface of the profiling module. Stage 0 + Deliverable 2.

The principle: evidence proposes, the quiz verifies. A resume claim never
becomes mastery without either a probe or an explicit confidence downgrade.
"""
from __future__ import annotations

from app.domain import LearnerProfile, Mastery, Skill
from app.modules.profiling.canonical import map_to_canonical
from app.modules.profiling.github import profile_github
from app.modules.profiling.irt import estimate_theta
from app.modules.profiling.resume import parse_resume
from app.modules.profiling.state import load_state, save_state

__all__ = [
    "parse_resume",
    "profile_github",
    "map_to_canonical",
    "estimate_theta",
    "save_state",
    "load_state",
]
