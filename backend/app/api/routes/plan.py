"""POST /api/plan -- the end-to-end roadmap endpoint."""
from __future__ import annotations

from fastapi import APIRouter

from app.api import plan_service
from app.api.schemas import (
    MilestoneOut, NodeOut, PlanRequest, PlanResponse, ResourceOut,
)
from app.domain import Constraints, PathNode, Resource

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
        id=r.id, provider=r.provider.value, title=r.title, url=r.url,
        duration_display=dur, difficulty=r.difficulty.value if r.difficulty else None,
        price_usd=r.price_usd, price_is_estimate=r.price_is_estimate,
        cost_type=r.cost_type.value,
    )


def _node_out(n: PathNode) -> NodeOut:
    return NodeOut(
        skill_id=n.skill_id, skill_name=n.skill_name, status=n.status,
        phase=n.phase, order=n.order, estimated_hours=n.estimated_hours, xp=n.xp,
        gap_delta=n.gap_delta, resource=_resource_out(n.resource),
        alternatives=[a for a in (_resource_out(x) for x in n.alternatives) if a],
        rationale=n.rationale, is_remediation=n.is_remediation,
    )


@router.post("/plan", response_model=PlanResponse)
async def create_plan(req: PlanRequest) -> PlanResponse:
    constraints = Constraints(
        hours_per_week=req.hours_per_week,
        deadline_weeks=req.deadline_weeks,
        budget_usd=req.budget_usd,
        preferred_modalities=req.preferred_modalities,
    )
    path, role, readiness = plan_service.build_plan(
        req.goal, constraints, req.known, req.priority
    )
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
                phase=m.phase, title=m.title, total_hours=round(m.total_hours, 1),
                nodes=[_node_out(n) for n in m.nodes],
            )
            for m in path.milestones
        ],
    )
