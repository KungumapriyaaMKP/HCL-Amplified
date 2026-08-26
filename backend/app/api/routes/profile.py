"""
Profile intake routes for Resume upload and GitHub analysis.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from app.core.auth import current_user
from app.domain import Confidence, LearnerProfile, Mastery
from app.modules.profiling import interface as profiling

router = APIRouter(prefix="/profile")


class GitHubProfileRequest(BaseModel):
    username: str = Field(min_length=1, max_length=100)


class ProfileIntakeResponse(BaseModel):
    skills: list[Mastery]
    count: int


@router.post("/resume", response_model=ProfileIntakeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    user_id: str = Depends(current_user),
) -> ProfileIntakeResponse:
    """
    Extract verified technical skills with provenance quotes from an uploaded resume (PDF/DOCX).
    Accrues evidence in learner profile.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    extracted = profiling.parse_resume(content, file.filename)

    # Persist extracted mastery to learner state
    profile = profiling.load_state(user_id) or LearnerProfile(id=user_id)
    for m in extracted:
        existing = profile.mastery.get(m.skill_id)
        if not existing or m.level >= existing.level:
            profile.mastery[m.skill_id] = m

    profiling.save_state(user_id, profile)

    return ProfileIntakeResponse(skills=extracted, count=len(extracted))


@router.post("/github", response_model=ProfileIntakeResponse)
async def profile_github_user(
    req: GitHubProfileRequest,
    user_id: str = Depends(current_user),
) -> ProfileIntakeResponse:
    """
    Analyze public repositories and tech stack for a GitHub user.
    Accrues evidence in learner profile.
    """
    extracted = profiling.profile_github(req.username)

    # Persist extracted mastery to learner state
    profile = profiling.load_state(user_id) or LearnerProfile(id=user_id)
    for m in extracted:
        existing = profile.mastery.get(m.skill_id)
        if not existing or m.level >= existing.level:
            profile.mastery[m.skill_id] = m

    profiling.save_state(user_id, profile)

    return ProfileIntakeResponse(skills=extracted, count=len(extracted))
