"""
Domain types -- the shared vocabulary of the whole system.

ARCHITECTURE RULE #1: this package imports NOTHING from app.modules,
app.ml, app.llm or app.api. Everything depends on domain; domain
depends on nobody. Enforced by tests/test_architecture.py.
"""
from app.domain.skill import Skill, SkillGap, Mastery, MasteryEvidence, Confidence
from app.domain.resource import Resource, Provider, Modality, Difficulty, CostType
from app.domain.learner import LearnerProfile, Constraints
from app.domain.path import LearningPath, Milestone, PathNode, NodeStatus, Phase
from app.domain.event import LearningEvent, EventType

__all__ = [
    "Skill", "SkillGap", "Mastery", "MasteryEvidence", "Confidence",
    "Resource", "Provider", "Modality", "Difficulty", "CostType",
    "LearnerProfile", "Constraints",
    "LearningPath", "Milestone", "PathNode", "NodeStatus", "Phase",
    "LearningEvent", "EventType",
]
