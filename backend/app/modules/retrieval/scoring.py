"""
The seven scoring factors -- Deliverable 3, deterministic.

Each returns a value in [0, 1]. The weighted sum is the final rank, and the
spec fixes the weights (they sum to exactly 1.0 -- asserted in a test). Every
component is retained on the result so Deliverable 5 can quote the real
numbers rather than have the LLM invent them.

A prior build added an unnormalized practice-bias term that pushed the weight
total to 1.45; there is deliberately no eighth factor here.
"""
from __future__ import annotations

from datetime import datetime

from app.domain import Difficulty, LearnerProfile, Modality, Resource, SkillGap

# difficulty tier as a number, for baseline-fit distance
_DIFF_LEVEL = {
    Difficulty.BEGINNER: 0.25,
    Difficulty.INTERMEDIATE: 0.55,
    Difficulty.ADVANCED: 0.85,
}


def score_skill_coverage(resource: Resource, gap: SkillGap) -> float:
    """
    Does this resource teach the gap skill, and how confidently was it tagged?
    A confidently-tagged direct match scores highest; an unconfident tag is
    discounted rather than trusted (the honesty principle at the score level).
    """
    if gap.skill_id not in resource.skills_taught:
        return 0.0
    confidence = resource.tag_confidence.get(gap.skill_id, 1.0 if resource.tags_verified else 0.6)
    # scale by how much of the gap is worth closing
    return confidence * min(1.0, 0.5 + gap.gap)


def score_semantic(semantic_similarity: float) -> float:
    """Cosine similarity of goal and resource embeddings, passed through."""
    return max(0.0, min(1.0, semantic_similarity))


def score_prerequisite_readiness(
    resource: Resource, profile: LearnerProfile
) -> float:
    """Fraction of the resource's prerequisite skills the learner already holds."""
    prereqs = resource.prerequisite_skills
    if not prereqs:
        return 1.0
    held = sum(1 for p in prereqs if profile.level(p) >= 0.6)
    return held / len(prereqs)


def score_difficulty_fit(resource: Resource, profile: LearnerProfile, gap: SkillGap) -> float:
    """
    Closeness of the resource's difficulty to the learner's current level on
    the target skill. A beginner served an advanced course scores low.
    """
    if resource.difficulty is None:
        return 0.5  # unknown -> neutral, not penalised
    target = _DIFF_LEVEL[resource.difficulty]
    current = gap.current_level
    return 1.0 - min(1.0, abs(target - current) / 0.85)


def score_modality(resource: Resource, profile: LearnerProfile) -> float:
    """Match against the learner's stated format preference; neutral if none."""
    prefs = profile.constraints.preferred_modalities
    if not prefs:
        return 0.6
    return 1.0 if resource.modality in prefs else 0.3


def score_quality(resource: Resource) -> float:
    """Rating scaled to [0,1], softened by review count so 1 review != 5.0."""
    if resource.rating is None:
        return 0.5
    base = resource.rating / 5.0
    reviews = resource.num_reviews or 0
    # confidence in the rating grows with volume, saturating around 100 reviews
    trust = min(1.0, reviews / 100.0)
    return base * (0.6 + 0.4 * trust)


def score_freshness(resource: Resource, now: datetime | None = None) -> float:
    """Newer content scores higher; unknown year is neutral."""
    if resource.last_updated_year is None:
        return 0.5
    year = (now or datetime.now()).year
    age = max(0, year - resource.last_updated_year)
    return max(0.0, 1.0 - age / 8.0)  # ~0 after 8 years
