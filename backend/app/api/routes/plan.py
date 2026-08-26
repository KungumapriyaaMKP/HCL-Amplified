"""
POST /api/plan -- the end-to-end roadmap endpoint, relaxation optimizer, and roles.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException

from app.api import plan_service
from app.api.routes.account import _IN_MEMORY_SAVED_PLANS
from app.api.schemas import (
    DetourRequest, DetourResponse, MilestoneOut, NodeOut, PlanRelaxRequest,
    PlanRelaxResponse, PlanRequest, PlanResponse, RelaxationOption, ResourceOut,
    RoleCompareRequest, RoleCompareResponse, RoleItem, RolesResponse,
)
from app.core import supa
from app.core.auth import current_user
from app.core.config import DATA_DIR
from app.domain import (
    Confidence, Constraints, LearnerProfile, Mastery, PathNode, Resource, Skill,
)
from app.modules.adapt import interface as adapt
from app.modules.profiling import interface as profiling

router = APIRouter()


def _resource_out(r: Resource | None) -> ResourceOut | None:
    if r is None:
        return None
    if r.duration_hours is None:
        dur = "~?h"
    elif r.price_is_estimate or r.cost_type == "subscription":
        dur = f"{r.duration_hours:g}h"
    else:
        dur = f"{r.duration_hours:g}h"
    return ResourceOut(
        id=r.id,
        provider=r.provider.value,
        title=r.title,
        url=r.url,
        duration_display=dur,
        difficulty=r.difficulty.value if r.difficulty else None,
        price_usd=r.price_usd,
        price_is_estimate=r.price_is_estimate,
        cost_type=r.cost_type.value,
    )


def _node_out(n: PathNode) -> NodeOut:
    h = n.estimated_hours
    if n.resource and getattr(n.resource, "duration_source", None) == "parsed":
        dur = f"{h:g}h"
    else:
        dur = f"~{h:g}h"

    return NodeOut(
        skill_id=n.skill_id,
        skill_name=n.skill_name,
        status=n.status,
        phase=n.phase,
        order=n.order,
        estimated_hours=n.estimated_hours,
        duration_display=dur,
        xp=n.xp,
        gap_delta=n.gap_delta,
        resource=_resource_out(n.resource),
        alternatives=[a for a in (_resource_out(x) for x in n.alternatives) if a],
        rationale=n.rationale,
        is_remediation=n.is_remediation,
    )


def _to_plan_response(path, role: str, readiness: int) -> PlanResponse:
    return PlanResponse(
        goal=path.goal_text,
        target_role=role,
        readiness_pct=readiness,
        total_hours=path.total_hours,
        total_cost_usd=path.total_cost_usd,
        weeks_required=path.weeks_required,
        is_feasible=path.is_feasible,
        prerequisite_violations=path.prerequisite_violations,
        gap_count=len(path.nodes),
        milestones=[
            MilestoneOut(
                phase=m.phase,
                title=m.title,
                total_hours=round(m.total_hours, 1),
                nodes=[_node_out(n) for n in m.nodes],
            )
            for m in path.milestones
        ],
    )


@router.post("/plan", response_model=PlanResponse)
async def create_plan(
    req: PlanRequest, user_id: str = Depends(current_user)
) -> PlanResponse:
    constraints = Constraints(
        hours_per_week=req.hours_per_week,
        deadline_weeks=req.deadline_weeks,
        budget_usd=req.budget_usd,
        preferred_modalities=req.preferred_modalities,
    )

    # 1. Load stored profile once before planning to incorporate accumulated mastery
    stored = profiling.load_state(user_id)
    stored_levels = (
        {sid: m.level for sid, m in stored.mastery.items()} if stored else {}
    )

    # 2. Overlay request-specific known skills over stored mastery
    merged_known = {**stored_levels, **req.known}

    # 3. Build plan using merged known skills
    path, role, readiness = plan_service.build_plan(
        req.goal, constraints, merged_known, req.priority
    )
    response = _to_plan_response(path, role, readiness)

    # 4. Reuse stored profile and persist merged state across sessions
    profile = stored or LearnerProfile(id=user_id)
    profile.goal_text = req.goal
    profile.target_role = role
    profile.constraints = constraints
    for sid, lvl in req.known.items():
        profile.mastery[sid] = Mastery(
            skill_id=sid, level=lvl, confidence=Confidence.HIGH
        )
    profiling.save_state(user_id, profile)

    # 5. Persist saved plan
    plan_dict = response.model_dump(mode="json")
    if supa.enabled() and user_id != "demo":
        try:
            supa.client().table("saved_plans").insert({
                "id": str(uuid4()),
                "user_id": user_id,
                "goal": req.goal,
                "plan_json": plan_dict,
            }).execute()
        except Exception:
            pass
    else:
        _IN_MEMORY_SAVED_PLANS.setdefault(user_id, []).insert(0, {
            "id": str(uuid4()),
            "user_id": user_id,
            "goal": req.goal,
            "plan_json": plan_dict,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    return response


@router.post("/plan/relax", response_model=PlanRelaxResponse)
async def relax_plan(
    req: PlanRelaxRequest, user_id: str = Depends(current_user)
) -> PlanRelaxResponse:
    """
    Compute ranked relaxation options for an infeasible or tight plan.
    """
    constraints = Constraints(
        hours_per_week=req.hours_per_week,
        deadline_weeks=req.deadline_weeks,
        budget_usd=req.budget_usd,
    )
    stored = profiling.load_state(user_id)
    stored_levels = {sid: m.level for sid, m in stored.mastery.items()} if stored else {}
    merged_known = {**stored_levels, **req.known}

    res = plan_service.compute_relaxation(
        req.goal, constraints, merged_known, priority=req.priority
    )
    return PlanRelaxResponse(
        is_feasible=res["is_feasible"],
        baseline_hours=res["baseline_hours"],
        baseline_weeks=res["baseline_weeks"],
        deadline_weeks=res["deadline_weeks"],
        hours_per_week=res["hours_per_week"],
        options=[RelaxationOption(**o) for o in res["options"]],
    )


@router.get("/roles", response_model=RolesResponse)
async def get_roles() -> RolesResponse:
    """
    Return available curated career tracks with live job-market demand scores.
    """
    rows = json.loads((DATA_DIR / "tracks.json").read_text(encoding="utf-8"))
    roles = [
        RoleItem(
            id=t["id"],
            name=t["name"],
            summary=t.get("summary", ""),
            demand_score=t.get("demand_score", 0.9),
            demand_label=t.get("demand_label", "High"),
            demand_snapshot_date=t.get("demand_snapshot_date", "2026-08"),
            skills_count=len(t.get("skills", {})),
            skill_ids=list(t.get("skills", {}).keys()),
        )
        for t in rows
    ]
    return RolesResponse(roles=roles)


@router.post("/plan/compare", response_model=RoleCompareResponse)
async def compare_roles(req: RoleCompareRequest) -> RoleCompareResponse:
    track_rows = json.loads((DATA_DIR / "tracks.json").read_text(encoding="utf-8"))
    tracks = {t["id"]: t for t in track_rows}
    cur, tgt = tracks.get(req.current_role_id), tracks.get(req.target_role_id)
    if not cur or not tgt:
        raise HTTPException(status_code=404, detail="Unknown role id")

    skill_rows = json.loads((DATA_DIR / "skills.json").read_text(encoding="utf-8"))
    name_of = {r["id"]: r["name"] for r in skill_rows}

    cur_ids = set(cur.get("skills", {}).keys())
    tgt_ids = set(tgt.get("skills", {}).keys())
    shared = cur_ids & tgt_ids
    delta = tgt_ids - cur_ids
    union = cur_ids | tgt_ids

    # Treat everything the current role teaches as already mastered.
    known = {sid: 1.0 for sid in cur_ids}
    constraints = Constraints(hours_per_week=req.hours_per_week)
    path, _role, _readiness = plan_service.build_plan(
        tgt["id"].replace("-", " "), constraints, known, priority="balanced"
    )

    return RoleCompareResponse(
        current_role=cur["name"],
        target_role=tgt["name"],
        shared_skill_count=len(shared),
        delta_skill_count=len(path.nodes),        # skills the planner actually sequences
        delta_hours=path.total_hours,             # engine-computed real hours
        delta_weeks=path.weeks_required,          # engine-computed real weeks
        transferability_pct=round(100 * len(shared) / len(union)) if union else 0,
        shared_skill_names=[name_of.get(s, s) for s in sorted(shared)][:8],
        delta_skill_names=[name_of.get(s, s) for s in sorted(delta)][:8],
    )


@router.post("/adapt/detour", response_model=DetourResponse)
async def insert_plan_detour(
    req: DetourRequest, user_id: str = Depends(current_user)
) -> DetourResponse:
    """
    D6 money-shot: Splices a remediation node into the active learning path on blockage.
    """
    skills_rows = json.loads((DATA_DIR / "skills.json").read_text(encoding="utf-8"))
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
        for r in skills_rows
    }

    profile = profiling.load_state(user_id) or LearnerProfile(id=user_id)
    mastery_levels = {sid: m.level for sid, m in profile.mastery.items()}

    bridge_id = adapt.find_bridge_concept(req.blocked_skill_id, skills, mastery_levels)
    if not bridge_id or bridge_id not in skills:
        # Fallback to direct prerequisite if bridge concept root is empty
        blocked_skill = skills.get(req.blocked_skill_id)
        if blocked_skill and blocked_skill.prerequisites:
            bridge_id = blocked_skill.prerequisites[0]
        else:
            return DetourResponse(
                success=False,
                blocked_skill_id=req.blocked_skill_id,
                rationale="No upstream prerequisite found for detour.",
            )

    bridge_name = skills[bridge_id].name

    # Build baseline plan
    constraints = profile.constraints
    path, role, readiness = plan_service.build_plan(
        req.goal, constraints, mastery_levels, priority="balanced"
    )

    # Splice remediation node
    spliced_path, inserted = adapt.insert_detour(
        path, req.blocked_skill_id, bridge_id, bridge_name
    )
    plan_out = _to_plan_response(spliced_path, role, readiness)

    return DetourResponse(
        success=inserted,
        blocked_skill_id=req.blocked_skill_id,
        bridge_skill_id=bridge_id,
        bridge_skill_name=bridge_name,
        rationale=f"Quick refresher on {bridge_name} to unlock {skills[req.blocked_skill_id].name}.",
        plan=plan_out,
    )
