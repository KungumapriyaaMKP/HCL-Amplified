"""Skill ontology types. The canonical DAG is built from these."""
from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field


class Confidence(str, Enum):
    """How much we trust a mastery estimate. Drives Stage 0 probe priority."""
    HIGH = "high"      # verified by quiz (IRT theta)
    MEDIUM = "medium"  # evidenced by resume/github, unprobed
    LOW = "low"        # no evidence -- assumed weak, wide uncertainty


class Skill(BaseModel):
    """A node in the canonical prerequisite DAG."""
    id: str
    name: str
    category: str
    description: str = ""
    prerequisites: list[str] = Field(default_factory=list)

    # F5: does a code exercise make sense for this skill?
    is_programming: bool = False
    # EduCOR middle tier -- grouping, not a separate graph (see plan Part 0)
    topic: str | None = None


class MasteryEvidence(BaseModel):
    """Provenance for a mastery claim. Stage 0 requires a quote, never a guess."""
    source: str                      # "resume" | "github" | "quiz" | "practice"
    quote: str | None = None         # verbatim supporting text
    detail: str | None = None        # e.g. "12k bytes of Python across 4 repos"


class Mastery(BaseModel):
    """
    Per-skill mastery WITH confidence -- not a single global theta.

    This is what makes the "zero-assumption" claim real: an unverified
    resume boast carries MEDIUM confidence and gets probed or discounted,
    never silently trusted.
    """
    skill_id: str
    level: float = Field(ge=0.0, le=1.0)
    confidence: Confidence = Confidence.LOW
    evidence: list[MasteryEvidence] = Field(default_factory=list)


class SkillGap(BaseModel):
    """SkillGap(s) = max(0, Req(s) - Current(s)); Priority = Importance x Gap."""
    skill_id: str
    skill_name: str
    required_level: float = Field(ge=0.0, le=1.0)
    current_level: float = Field(ge=0.0, le=1.0)
    importance: float = Field(default=1.0, ge=0.0, le=1.0)
    confidence: Confidence = Confidence.LOW

    @property
    def gap(self) -> float:
        return max(0.0, self.required_level - self.current_level)

    @property
    def priority(self) -> float:
        return self.importance * self.gap
