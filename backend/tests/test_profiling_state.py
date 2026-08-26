"""Tests for learner profile state persistence and recovery."""
from __future__ import annotations

import pytest

from app.domain import Confidence, Constraints, LearnerProfile, Mastery, MasteryEvidence
from app.modules.profiling import interface as profiling
from app.modules.profiling.state import _IN_MEMORY_STATE


@pytest.fixture(autouse=True)
def clean_in_memory_state():
    _IN_MEMORY_STATE.clear()
    yield
    _IN_MEMORY_STATE.clear()


def test_save_and_load_state_roundtrip():
    user_id = "user-state-test-123"
    profile = LearnerProfile(
        id=user_id,
        goal_text="Become a Senior AI Engineer",
        target_role="AI Engineer",
        constraints=Constraints(
            hours_per_week=15.0,
            deadline_weeks=24,
            budget_usd=100.0,
        ),
        mastery={
            "python-basics": Mastery(
                skill_id="python-basics",
                level=0.95,
                confidence=Confidence.HIGH,
                evidence=[
                    MasteryEvidence(
                        source="quiz",
                        quote=None,
                        detail="Passed 2PL IRT assessment with theta 1.8",
                    )
                ],
            ),
            "linear-algebra": Mastery(
                skill_id="linear-algebra",
                level=0.7,
                confidence=Confidence.MEDIUM,
                evidence=[
                    MasteryEvidence(
                        source="resume",
                        quote="Extensive experience with numpy and linear algebra",
                    )
                ],
            ),
        },
    )

    profiling.save_state(user_id, profile)
    loaded = profiling.load_state(user_id)

    assert loaded is not None
    assert loaded.id == user_id
    assert loaded.goal_text == "Become a Senior AI Engineer"
    assert loaded.target_role == "AI Engineer"
    assert loaded.constraints.hours_per_week == 15.0
    assert loaded.constraints.deadline_weeks == 24
    assert loaded.constraints.budget_usd == 100.0

    assert "python-basics" in loaded.mastery
    m_py = loaded.mastery["python-basics"]
    assert m_py.level == 0.95
    assert m_py.confidence == Confidence.HIGH
    assert len(m_py.evidence) == 1
    assert m_py.evidence[0].source == "quiz"

    assert "linear-algebra" in loaded.mastery
    m_la = loaded.mastery["linear-algebra"]
    assert m_la.level == 0.7
    assert m_la.confidence == Confidence.MEDIUM


def test_load_state_nonexistent_returns_none():
    assert profiling.load_state("non-existent-user-id") is None
