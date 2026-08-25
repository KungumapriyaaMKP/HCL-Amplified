"""
Public surface of the profiling module. Stage 0 + Deliverable 2.

The principle: evidence proposes, the quiz verifies. A resume claim never
becomes mastery without either a probe or an explicit confidence downgrade.
"""
from __future__ import annotations

from app.domain import Mastery, Skill

__all__ = ["parse_resume", "profile_github", "map_to_canonical", "estimate_theta"]


def parse_resume(file_bytes: bytes, filename: str) -> list[Mastery]:
    """
    Layout-aware PDF/DOCX extraction. Every returned Mastery carries a
    verbatim evidence quote -- provenance is not optional. [W1]
    """
    raise NotImplementedError


def profile_github(username: str) -> list[Mastery]:
    """
    Public REST, no OAuth. Languages by byte count, frameworks from
    requirements.txt / package.json, commit recency, repo depth. [W1]
    """
    raise NotImplementedError


def map_to_canonical(raw_skill: str, skills: dict[str, Skill]) -> tuple[str, float] | None:
    """
    "deep learning" -> ("neural-networks", 0.87). Reuses the embedding model
    already loaded for retrieval -- no new infrastructure.
    """
    raise NotImplementedError


def estimate_theta(responses: list[tuple[float, float, bool]]) -> tuple[float, float]:
    """
    2PL-IRT: P(Y=1|theta) = 1 / (1 + e^(-a(theta - b)))

    Takes [(a, b, correct)], returns (theta, standard_error) by maximum
    likelihood. A genuinely fitted statistical model -- distinct from the
    classical algorithms elsewhere in this codebase.
    """
    raise NotImplementedError
