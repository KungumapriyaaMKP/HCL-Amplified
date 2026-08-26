"""
Socratic guided tutor routes.
"""
from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.modules.socratic import interface as socratic

router = APIRouter(prefix="/socratic")


class SocraticRequest(BaseModel):
    skill_id: str = Field(min_length=1)
    skill_name: str = Field(min_length=1)
    chosen_answer: str = Field(min_length=1)
    question: str = Field(min_length=1)
    correct_answer: str = Field(default="")


class SocraticResponse(BaseModel):
    scaffolding_questions: list[str]
    conceptual_hint: str
    diagram: str


@router.post("", response_model=SocraticResponse)
async def get_socratic_guidance(req: SocraticRequest) -> SocraticResponse:
    """
    Generate interactive Socratic feedback guiding a learner through their misconception.
    """
    res = socratic.guide(
        skill_id=req.skill_id,
        skill_name=req.skill_name,
        chosen_answer=req.chosen_answer,
        question=req.question,
        correct_answer=req.correct_answer,
    )
    return SocraticResponse(
        scaffolding_questions=res.get("scaffolding_questions", []),
        conceptual_hint=res.get("conceptual_hint", ""),
        diagram=res.get("diagram", ""),
    )
