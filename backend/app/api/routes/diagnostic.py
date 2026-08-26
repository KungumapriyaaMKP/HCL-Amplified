"""
Adaptive Diagnostic (CAT/IRT) routes.

Generates psychometrically calibrated diagnostic probes prioritized by uncertainty
and downstream graph fan-out, and updates learner ability parameters via 2PL-IRT MLE.
"""
from __future__ import annotations

from datetime import datetime, timezone
import json
from functools import lru_cache
from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.core.auth import current_user
from app.core.config import DATA_DIR
from app.domain import (
    Confidence, Constraints, EventType, LearnerProfile, LearningEvent, Mastery, MasteryEvidence, Skill,
)
from app.llm import router as llm_router
from app.modules.gap import interface as gap
from app.modules.profiling import interface as profiling
from app.modules.telemetry import interface as telemetry

router = APIRouter(prefix="/diagnostic")


@lru_cache(maxsize=1)
def _skills_and_meta() -> tuple[dict[str, Skill], dict[str, int]]:
    rows = json.loads((DATA_DIR / "skills.json").read_text(encoding="utf-8"))
    skills = {
        r["id"]: Skill(
            id=r["id"],
            name=r["name"],
            category=r["topic"],
            description=r["description"],
            prerequisites=r["prerequisites"],
            is_programming=r["is_programming"],
            topic=r["topic"],
        )
        for r in rows
    }
    fan_out = {r["id"]: r["fan_out"] for r in rows}
    return skills, fan_out


@lru_cache(maxsize=1)
def _tracks() -> dict[str, dict]:
    rows = json.loads((DATA_DIR / "tracks.json").read_text(encoding="utf-8"))
    return {t["id"]: t for t in rows}


class DiagnosticQuestion(BaseModel):
    id: str
    skill_id: str
    skill_name: str
    question: str
    options: list[str]
    correct_index: int
    explanation: str
    discrimination: float = 1.0
    difficulty: float = 0.0


class DiagnosticGenerateRequest(BaseModel):
    goal: str = "Machine Learning Engineer"
    num_questions: int = Field(default=4, ge=2, le=10)


class DiagnosticGenerateResponse(BaseModel):
    questions: list[DiagnosticQuestion]
    skills_tested: list[str]


class DiagnosticAnswerItem(BaseModel):
    skill_id: str
    discrimination: float = 1.0
    difficulty: float = 0.0
    is_correct: bool


class DiagnosticSubmitRequest(BaseModel):
    responses: list[DiagnosticAnswerItem]
    goal: str = "Machine Learning Engineer"


class DiagnosticSubmitResponse(BaseModel):
    theta: float
    standard_error: float
    updated_mastery: dict[str, float]
    readiness_pct: int


@router.post("/generate", response_model=DiagnosticGenerateResponse)
async def generate_diagnostic(
    req: DiagnosticGenerateRequest,
    user_id: str = Depends(current_user),
) -> DiagnosticGenerateResponse:
    """
    Generate adaptive diagnostic questions targeting highest probe-priority skills
    (skills with high uncertainty and high downstream prerequisite fan-out).
    """
    skills, fan_out = _skills_and_meta()
    profile = profiling.load_state(user_id) or LearnerProfile(id=user_id)

    # 1. Goal decomposition
    track_id = llm_router.match_track(req.goal)
    if track_id and track_id in _tracks():
        track = _tracks()[track_id]
        required = {s: v["required"] for s, v in track["skills"].items()}
        importance = {s: v["importance"] for s, v in track["skills"].items()}
    else:
        decomp = llm_router.decompose_goal(req.goal)
        required = {s["id"]: s.get("required", 0.7) for s in decomp.get("skills", []) if s.get("id") in skills}
        importance = {s["id"]: s.get("importance", 0.7) for s in decomp.get("skills", []) if s.get("id") in skills}

    # 2. Compute gaps and probe priorities
    gaps = gap.compute_gaps(profile, required, skills, importance)
    priorities = gap.probe_priority(gaps, skills, fan_out)

    target_skill_ids = [sid for sid, _ in priorities[: req.num_questions]]
    if not target_skill_ids:
        target_skill_ids = list(required.keys())[: req.num_questions]

    target_skills_info = [{"id": sid, "name": skills[sid].name} for sid in target_skill_ids if sid in skills]

    # 3. Generate calibrated items
    raw_questions = llm_router.generate_diagnostic_questions(target_skills_info)
    questions = [DiagnosticQuestion(**q) for q in raw_questions]

    return DiagnosticGenerateResponse(
        questions=questions,
        skills_tested=[q.skill_id for q in questions],
    )


@router.post("/submit", response_model=DiagnosticSubmitResponse)
async def submit_diagnostic(
    req: DiagnosticSubmitRequest,
    user_id: str = Depends(current_user),
) -> DiagnosticSubmitResponse:
    """
    Evaluate diagnostic responses, compute 2PL-IRT theta, and update learner state.
    """
    skills, _ = _skills_and_meta()
    profile = profiling.load_state(user_id) or LearnerProfile(id=user_id)

    # 1. 2PL-IRT estimation
    irt_inputs = [(r.discrimination, r.difficulty, r.is_correct) for r in req.responses]
    theta, se = profiling.estimate_theta(irt_inputs)

    now = datetime.now(timezone.utc)

    # 2. Update mastery and record events for each item
    for r in req.responses:
        score = 0.95 if r.is_correct else 0.40
        telemetry.record(
            LearningEvent(
                learner_id=user_id,
                type=EventType.QUIZ_ATTEMPTED,
                at=now,
                skill_id=r.skill_id,
                score=score,
                payload={"theta": theta, "difficulty": r.difficulty},
            )
        )

        existing = profile.mastery.get(r.skill_id)
        old_level = existing.level if existing else 0.0
        new_level = max(old_level, score)

        profile.mastery[r.skill_id] = Mastery(
            skill_id=r.skill_id,
            level=new_level,
            confidence=Confidence.HIGH,
            evidence=[
                MasteryEvidence(
                    source="quiz",
                    quote=None,
                    detail=f"Diagnostic 2PL IRT: theta={theta:.2f}, score={score:.2f}",
                )
            ],
        )

    profiling.save_state(user_id, profile)

    # 3. Compute updated readiness
    track_id = llm_router.match_track(req.goal)
    if track_id and track_id in _tracks():
        track = _tracks()[track_id]
        required = {s: v["required"] for s, v in track["skills"].items()}
        importance = {s: v["importance"] for s, v in track["skills"].items()}
    else:
        required = {s: 0.8 for s in profile.mastery}
        importance = {s: 1.0 for s in profile.mastery}

    gaps = gap.compute_gaps(profile, required, skills, importance)
    total_w = sum(g.importance * g.required_level for g in gaps) or 1.0
    met_w = sum(g.importance * min(g.current_level, g.required_level) for g in gaps)
    readiness = round(100 * met_w / total_w)

    return DiagnosticSubmitResponse(
        theta=theta,
        standard_error=se,
        updated_mastery={sid: m.level for sid, m in profile.mastery.items()},
        readiness_pct=readiness,
    )
