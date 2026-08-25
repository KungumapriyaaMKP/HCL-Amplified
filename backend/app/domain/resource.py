"""Learning resource types -- the catalog's shared shape across all providers."""
from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field


class Provider(str, Enum):
    COURSERA = "coursera"
    YOUTUBE = "youtube"
    MS_LEARN = "ms_learn"
    UDEMY = "udemy"
    DOCS = "docs"


class Difficulty(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class Modality(str, Enum):
    VIDEO = "video"
    LAB = "lab"
    READING = "reading"
    PROJECT = "project"
    ASSESSMENT = "assessment"


class CostType(str, Enum):
    FREE = "free"
    PAID = "paid"
    SUBSCRIPTION = "subscription"


class Resource(BaseModel):
    """
    A catalog item. `skills_taught` and `difficulty` are PREDICTED by
    app.ml for live-fetched items -- see the tagger risk note in the plan.
    `tag_confidence` records how much to trust that prediction.
    """
    id: str
    provider: Provider
    title: str
    url: str
    description: str = ""
    thumbnail_url: str | None = None

    duration_hours: float | None = None
    difficulty: Difficulty | None = None
    modality: Modality = Modality.VIDEO

    # F4/F7: cost is a hard ceiling at bind time, not just an A* penalty
    cost_type: CostType = CostType.FREE
    price_usd: float = 0.0
    price_is_estimate: bool = False   # true for Coursera subscription modelling

    rating: float | None = None
    num_reviews: int | None = None
    last_updated_year: int | None = None

    skills_taught: list[str] = Field(default_factory=list)
    prerequisite_skills: list[str] = Field(default_factory=list)
    tag_confidence: dict[str, float] = Field(default_factory=dict)
    tags_verified: bool = False       # hand-checked (top-N per skill)

    # F3/F7: can this be dropped when relaxing an infeasible schedule?
    is_elective: bool = False
    topic: str | None = None
