"""Tests for account, events, history, and plan persistence endpoints."""
from __future__ import annotations

from datetime import datetime, timezone

import pytest
from starlette.testclient import TestClient

from app.api.routes.account import _IN_MEMORY_SAVED_PLANS
from app.main import app
from app.modules.profiling.state import _IN_MEMORY_STATE
from app.modules.telemetry.store import _IN_MEMORY_EVENTS


@pytest.fixture(autouse=True)
def clean_stores():
    _IN_MEMORY_STATE.clear()
    _IN_MEMORY_EVENTS.clear()
    _IN_MEMORY_SAVED_PLANS.clear()
    yield
    _IN_MEMORY_STATE.clear()
    _IN_MEMORY_EVENTS.clear()
    _IN_MEMORY_SAVED_PLANS.clear()


@pytest.fixture
def client():
    return TestClient(app)


def test_get_me_guest(client: TestClient):
    res = client.get("/api/me")
    assert res.status_code == 200
    data = res.json()
    assert data["user_id"] == "demo"
    assert data["is_guest"] is True


def test_post_events_and_history(client: TestClient):
    # Omit timestamp 'at' to verify server-side default
    event_payload = {
        "learner_id": "demo",
        "type": "quiz_attempted",
        "skill_id": "linear-algebra",
        "score": 0.88,
        "minutes_spent": 12.5,
        "payload": {"difficulty": "medium"},
    }
    res = client.post("/api/events", json=event_payload)
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}

    # Query history
    h_res = client.get("/api/history")
    assert h_res.status_code == 200
    h_data = h_res.json()
    assert "saved_plans" in h_data
    assert "retention_summary" in h_data
    assert "activity_grid" in h_data

    # Check that retention for linear-algebra is recorded
    retention_items = [
        r for r in h_data["retention_summary"] if r["skill_id"] == "linear-algebra"
    ]
    assert len(retention_items) == 1
    assert retention_items[0]["retention"] > 0.9


def test_plan_endpoint_and_state_persistence(client: TestClient):
    req_body = {
        "goal": "Machine Learning Engineer",
        "hours_per_week": 10.0,
        "deadline_weeks": 24,
        "known": {"linear-algebra": 0.9},
        "priority": "balanced",
    }
    res = client.post("/api/plan", json=req_body)
    assert res.status_code == 200
    data = res.json()
    assert data["goal"] == "Machine Learning Engineer"
    assert len(data["milestones"]) > 0

    # Verify history returns the saved plan in in-memory mode
    h_res = client.get("/api/history")
    assert h_res.status_code == 200
    h_data = h_res.json()
    assert len(h_data["saved_plans"]) >= 1
    assert h_data["saved_plans"][0]["goal"] == "Machine Learning Engineer"


def test_persisted_mastery_roundtrip_remediation(client: TestClient):
    """
    Acceptance test for remediation pass:
    1. Log quiz event with score 0.95 for 'linear-algebra' without 'at' (Defect 2 check).
    2. POST /api/plan with goal 'Machine Learning Engineer' and empty known dict.
    3. Assert 'linear-algebra' is excluded from milestone sequenced skills (Defect 1 check).
    4. Assert readiness_pct > 0.
    5. Assert lower subsequent score does not overwrite higher stored mastery.
    """
    # 1. Post quiz event without 'at'
    quiz_res = client.post(
        "/api/events",
        json={
            "type": "quiz_attempted",
            "skill_id": "linear-algebra",
            "score": 0.95,
        },
    )
    assert quiz_res.status_code == 200, f"Expected 200, got {quiz_res.status_code}: {quiz_res.text}"

    # 2. Generate plan for Machine Learning Engineer without explicit known skills
    plan_res = client.post(
        "/api/plan",
        json={
            "goal": "Machine Learning Engineer",
            "hours_per_week": 10.0,
            "priority": "balanced",
        },
    )
    assert plan_res.status_code == 200, f"Expected 200, got {plan_res.status_code}: {plan_res.text}"
    plan_data = plan_res.json()

    # 3. 'linear-algebra' must NOT be in any milestone's sequenced nodes because mastery=0.95 meets required
    sequenced_skill_ids = [
        node["skill_id"]
        for milestone in plan_data["milestones"]
        for node in milestone["nodes"]
    ]
    assert "linear-algebra" not in sequenced_skill_ids, (
        f"'linear-algebra' was unexpectedly sequenced despite 0.95 mastery: {sequenced_skill_ids}"
    )

    # 4. Readiness must be > 0 due to mastered linear algebra
    assert plan_data["readiness_pct"] > 0, f"Expected readiness > 0, got {plan_data['readiness_pct']}"

    # 5. Low score event does not downgrade existing higher mastery
    low_res = client.post(
        "/api/events",
        json={
            "type": "quiz_attempted",
            "skill_id": "linear-algebra",
            "score": 0.40,
        },
    )
    assert low_res.status_code == 200

    profile = _IN_MEMORY_STATE.get("demo")
    assert profile is not None
    assert profile.mastery["linear-algebra"].level == 0.95


def test_cors_headers_and_guest_endpoints(client: TestClient):
    # Test OPTIONS preflight with Origin
    opt_res = client.options(
        "/api/gamification",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization,content-type",
        },
    )
    assert opt_res.status_code == 200
    assert opt_res.headers.get("access-control-allow-origin") == "http://localhost:3000"

    # Test GET with Origin
    get_res = client.get("/api/gamification", headers={"Origin": "http://localhost:3000"})
    assert get_res.status_code == 200
    assert get_res.headers.get("access-control-allow-origin") == "http://localhost:3000"

    # Test POST /api/plan with Origin
    plan_res = client.post(
        "/api/plan",
        json={"goal": "Machine Learning Engineer", "hours_per_week": 10.0},
        headers={"Origin": "http://localhost:3000"},
    )
    assert plan_res.status_code == 200
    assert plan_res.headers.get("access-control-allow-origin") == "http://localhost:3000"

