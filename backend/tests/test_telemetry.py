"""Tests for the telemetry persistence and retention analytics module."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from app.domain import EventType, LearningEvent, Skill
from app.modules.telemetry import interface as telemetry
from app.modules.telemetry.store import _IN_MEMORY_EVENTS


@pytest.fixture(autouse=True)
def clean_in_memory_telemetry():
    _IN_MEMORY_EVENTS.clear()
    yield
    _IN_MEMORY_EVENTS.clear()


def test_telemetry_record_and_events_for_roundtrip():
    now = datetime.now(timezone.utc)
    e1 = LearningEvent(
        learner_id="test-user-1",
        type=EventType.RESOURCE_STARTED,
        at=now - timedelta(minutes=30),
        skill_id="linear-algebra",
        resource_id="coursera-lin-alg-1",
    )
    e2 = LearningEvent(
        learner_id="test-user-1",
        type=EventType.QUIZ_ATTEMPTED,
        at=now - timedelta(minutes=10),
        skill_id="linear-algebra",
        score=0.9,
    )
    e3 = LearningEvent(
        learner_id="test-user-1",
        type=EventType.QUIZ_ATTEMPTED,
        at=now - timedelta(minutes=5),
        skill_id="calculus-basics",
        score=0.85,
    )
    e4 = LearningEvent(
        learner_id="test-user-2",
        type=EventType.PATH_GENERATED,
        at=now,
    )

    telemetry.record(e1)
    telemetry.record(e2)
    telemetry.record(e3)
    telemetry.record(e4)

    # Fetch all for user 1
    user1_events = telemetry.events_for("test-user-1")
    assert len(user1_events) == 3
    assert user1_events[0].resource_id == "coursera-lin-alg-1"
    assert user1_events[1].score == 0.9

    # Fetch filtered by skill
    lin_alg_events = telemetry.events_for("test-user-1", skill_id="linear-algebra")
    assert len(lin_alg_events) == 2
    assert all(e.skill_id == "linear-algebra" for e in lin_alg_events)

    # User 2 isolation
    user2_events = telemetry.events_for("test-user-2")
    assert len(user2_events) == 1
    assert user2_events[0].type == EventType.PATH_GENERATED


def test_retention_ebbinghaus_decay():
    now = datetime.now(timezone.utc)
    skill = "gradient-descent"

    # Case 1: No events -> 0.0 retention
    assert telemetry.retention(skill, [], now) == 0.0

    # Case 2: Fresh quiz just completed -> ~1.0
    fresh_event = LearningEvent(
        learner_id="u1",
        type=EventType.QUIZ_ATTEMPTED,
        at=now,
        skill_id=skill,
        score=1.0,
    )
    r_fresh = telemetry.retention(skill, [fresh_event], now)
    assert r_fresh == pytest.approx(1.0, rel=1e-3)

    # Case 3: 14 days elapsed (one half-life/stability period S=14) -> e^(-1) ≈ 0.3678
    past_event = LearningEvent(
        learner_id="u1",
        type=EventType.QUIZ_ATTEMPTED,
        at=now - timedelta(days=14),
        skill_id=skill,
        score=0.9,
    )
    r_14d = telemetry.retention(skill, [past_event], now)
    assert r_14d == pytest.approx(0.367879, rel=1e-3)

    # Case 4: 28 days elapsed -> e^(-2) ≈ 0.1353
    past_28d = LearningEvent(
        learner_id="u1",
        type=EventType.REVIEW_COMPLETED,
        at=now - timedelta(days=28),
        skill_id=skill,
        score=0.8,
    )
    r_28d = telemetry.retention(skill, [past_28d], now)
    assert r_28d == pytest.approx(0.135335, rel=1e-3)


def test_review_urgency_fan_out_weighting():
    skills_map = {
        "foundations-math": Skill(
            id="foundations-math",
            name="Foundations Math",
            category="Math",
            prerequisites=[],
        ),
        "advanced-ml": Skill(
            id="advanced-ml",
            name="Advanced ML",
            category="ML",
            prerequisites=["foundations-math"],
        ),
        "deep-learning": Skill(
            id="deep-learning",
            name="Deep Learning",
            category="AI",
            prerequisites=["foundations-math"],
        ),
    }

    # Low retention (0.2) with high fan-out produces high urgency
    urgency_math = telemetry.review_urgency("foundations-math", 0.2, skills_map)
    assert urgency_math > 0.0

    # Fully retained skill (1.0) produces 0 urgency
    urgency_retained = telemetry.review_urgency("foundations-math", 1.0, skills_map)
    assert urgency_retained == 0.0


def test_activity_grid_generation():
    now = datetime.now(timezone.utc)
    telemetry.record(
        LearningEvent(
            learner_id="active-user",
            type=EventType.QUIZ_ATTEMPTED,
            at=now,
            skill_id="neural-networks",
        )
    )
    telemetry.record(
        LearningEvent(
            learner_id="active-user",
            type=EventType.RESOURCE_COMPLETED,
            at=now,
            skill_id="backpropagation",
        )
    )

    grid = telemetry.activity_grid("active-user", weeks=2)
    assert len(grid) == 14  # 2 weeks * 7 days

    today_str = now.date().isoformat()
    today_bucket = next((b for b in grid if b["date"] == today_str), None)
    assert today_bucket is not None
    assert today_bucket["count"] == 2
    assert "neural-networks" in today_bucket["topics"]
    assert "backpropagation" in today_bucket["topics"]
