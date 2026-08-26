"""
Comprehensive test suite for Phase 1 backend feature extensions.

Tests:
- Resume parsing (PDF/DOCX/text) & skill extraction with provenance quotes
- GitHub profile analyzer
- Adaptive Diagnostic (2PL-IRT MLE & probe priority)
- Socratic guided tutoring & misconception handling
- Plan relaxation optimizer (electives, deadline extension, weekly hours)
- Crash course preset
- Job demand & career roles endpoint
- Telemetry, XP gamification, and badges
- Poincaré hyperbolic geometry 2D projection
- Stuck detection & adapt detour splicing
"""
from __future__ import annotations

import io
import json
import pytest
from starlette.testclient import TestClient

from app.api.routes.account import _IN_MEMORY_SAVED_PLANS
from app.main import app
from app.modules.catalog import interface as catalog
from app.modules.profiling.irt import estimate_theta
from app.modules.profiling.state import _IN_MEMORY_STATE
from app.modules.telemetry.store import _IN_MEMORY_EVENTS


@pytest.fixture(autouse=True)
def clean_test_stores():
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


def test_estimate_theta_2pl_irt():
    # Perfect score -> high theta
    theta_high, se_high = estimate_theta([(1.5, 0.0, True), (1.2, 0.5, True), (1.8, -0.5, True)])
    assert theta_high > 0.5
    assert se_high > 0.0

    # Low score -> negative theta
    theta_low, se_low = estimate_theta([(1.5, 0.0, False), (1.2, 0.5, False), (1.8, -0.5, False)])
    assert theta_low < -0.5

    # Mixed score -> balanced theta
    theta_mid, se_mid = estimate_theta([(1.5, 0.0, True), (1.5, 0.0, False)])
    assert -0.5 <= theta_mid <= 0.5


def test_resume_upload_endpoint(client: TestClient):
    resume_text = (
        "Senior Software Engineer\n"
        "Proficient in Python, SQL, and Docker containerization.\n"
        "Built deep learning models using PyTorch and scikit-learn for fraud detection.\n"
    )
    file_bytes = resume_text.encode("utf-8")
    files = {"file": ("resume.txt", io.BytesIO(file_bytes), "text/plain")}

    res = client.post("/api/profile/resume", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["count"] > 0
    skills_found = [s["skill_id"] for s in data["skills"]]
    assert any(s in skills_found for s in ["python-fundamentals", "sql", "containers-docker", "pytorch-basics"])
    # Provenance quote check
    assert data["skills"][0]["evidence"][0]["quote"] is not None


def test_github_profile_endpoint(client: TestClient):
    res = client.post("/api/profile/github", json={"username": "torvalds"})
    assert res.status_code == 200
    data = res.json()
    assert "skills" in data
    assert "count" in data


def test_diagnostic_generate_and_submit(client: TestClient):
    # 1. Generate diagnostic questions
    gen_res = client.post(
        "/api/diagnostic/generate",
        json={"goal": "Machine Learning Engineer", "num_questions": 3},
    )
    assert gen_res.status_code == 200
    gen_data = gen_res.json()
    assert len(gen_data["questions"]) >= 2
    assert len(gen_data["skills_tested"]) >= 2

    # 2. Submit responses
    answers = [
        {
            "skill_id": q["skill_id"],
            "discrimination": q["discrimination"],
            "difficulty": q["difficulty"],
            "is_correct": True,
        }
        for q in gen_data["questions"]
    ]
    sub_res = client.post(
        "/api/diagnostic/submit",
        json={"responses": answers, "goal": "Machine Learning Engineer"},
    )
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    assert "theta" in sub_data
    assert sub_data["readiness_pct"] > 0
    assert len(sub_data["updated_mastery"]) >= 2


def test_plan_relax_endpoint(client: TestClient):
    req_body = {
        "goal": "Machine Learning Engineer",
        "hours_per_week": 5.0,
        "deadline_weeks": 10,  # Very tight deadline to force relaxation options
    }
    res = client.post("/api/plan/relax", json=req_body)
    assert res.status_code == 200
    data = res.json()
    assert "options" in data
    assert len(data["options"]) >= 1
    # Check drop electives / extend deadline options
    types = [o["type"] for o in data["options"]]
    assert any(t in types for t in ["drop_electives", "extend_deadline", "increase_hours"])


def test_crash_course_priority_preset(client: TestClient):
    res = client.post(
        "/api/plan",
        json={"goal": "Machine Learning Engineer", "priority": "crash"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["goal"] == "Machine Learning Engineer"
    # Elective skills like cnn-architectures or prompt-engineering should not appear
    skill_ids = [
        node["skill_id"]
        for m in data["milestones"]
        for node in m["nodes"]
    ]
    assert "prompt-engineering" not in skill_ids
    assert "vector-databases" not in skill_ids
    assert "computer-vision-fundamentals" not in skill_ids


def test_roles_endpoint(client: TestClient):
    res = client.get("/api/roles")
    assert res.status_code == 200
    data = res.json()
    assert len(data["roles"]) >= 4
    role_ids = [r["id"] for r in data["roles"]]
    assert "ml-engineer" in role_ids
    assert "full-stack-engineer" in role_ids
    assert "cloud-devops-engineer" in role_ids
    assert "data-engineer" in role_ids
    assert all(r["demand_score"] > 0.5 for r in data["roles"])


def test_socratic_endpoint(client: TestClient):
    res = client.post(
        "/api/socratic",
        json={
            "skill_id": "linear-algebra",
            "skill_name": "Linear Algebra",
            "chosen_answer": "Matrix multiplication is commutative (AB == BA)",
            "question": "What is the relationship between AB and BA?",
            "correct_answer": "Matrix multiplication is non-commutative in general.",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data["scaffolding_questions"]) > 0
    assert "diagram" in data
    # Socratic principle: never show direct answer
    assert "non-commutative in general" not in data["conceptual_hint"]


def test_gamification_stats_and_badges(client: TestClient):
    # Post some quiz and learning events
    client.post(
        "/api/events",
        json={"type": "quiz_attempted", "skill_id": "linear-algebra", "score": 0.95},
    )
    client.post(
        "/api/events",
        json={"type": "resource_completed", "skill_id": "python-fundamentals", "minutes_spent": 45.0},
    )

    res = client.get("/api/gamification")
    assert res.status_code == 200
    data = res.json()
    assert data["total_xp"] > 0
    assert data["level"] >= 1
    assert len(data["badges"]) >= 5
    # First step badge should be unlocked
    first_step = next(b for b in data["badges"] if b["id"] == "first_step")
    assert first_step["unlocked"] is True


def test_poincare_disk_layout(client: TestClient):
    res = client.get("/api/poincare")
    assert res.status_code == 200
    data = res.json()
    assert len(data["nodes"]) >= 50
    assert len(data["edges"]) >= 30
    # Check that all nodes lie inside the unit disk: u^2 + v^2 < 1
    for n in data["nodes"]:
        norm_sq = n["u"] ** 2 + n["v"] ** 2
        assert norm_sq < 1.0, f"Node {n['id']} outside Poincare disk: {norm_sq}"
    # Check edge hyperbolic distances
    assert all(e["hyperbolic_dist"] > 0 for e in data["edges"])


def test_adapt_detour_endpoint(client: TestClient):
    res = client.post(
        "/api/adapt/detour",
        json={
            "blocked_skill_id": "multivariate-calculus",
            "goal": "Machine Learning Engineer",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["bridge_skill_id"] == "calculus-basics"
    assert data["plan"] is not None
    # Check that the remediation node was inserted into the plan
    remediation_nodes = [
        node for m in data["plan"]["milestones"] for node in m["nodes"] if node["is_remediation"]
    ]
    assert len(remediation_nodes) == 1
    assert remediation_nodes[0]["skill_id"] == "calculus-basics"
