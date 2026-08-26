"""
Plan orchestration -- composes the modules through their interfaces.

This is the api/service layer, so it is allowed to know several modules
(direction api -> modules -> domain). Each module is still touched only via
its interface.py.

Flow: goal -> gaps -> per-skill retrieval+rerank -> A* order -> bind
resources within budget -> phases + milestones -> grounded rationale.
"""
from __future__ import annotations

import json
import math
from functools import lru_cache

from app.core.config import DATA_DIR
from app.domain import (
    Confidence, Constraints, LearnerProfile, LearningPath, Mastery, Milestone,
    NodeStatus, PathNode, Phase, Resource, Skill,
)
from app.llm import router
from app.modules.catalog import interface as catalog
from app.modules.explain import interface as explain
from app.modules.gap import interface as gap
from app.modules.planning import interface as planning
from app.modules.planning.astar import PlannerWeights
from app.modules.retrieval import interface as retrieval

_PHASE_TITLE = {
    Phase.FOUNDATIONS: "Foundations",
    Phase.CORE: "Core Concepts",
    Phase.ADVANCED: "Advanced Applications",
    Phase.CAPSTONE: "Capstone",
}
_PRESETS = {
    "fastest": PlannerWeights.fastest,
    "cheapest": PlannerWeights.cheapest,
    "rigorous": PlannerWeights.most_rigorous,
    "balanced": PlannerWeights,
    "crash": PlannerWeights.fastest,
}


@lru_cache(maxsize=1)
def _skills() -> tuple[dict[str, Skill], dict[str, int], dict[str, int]]:
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
    depth = {r["id"]: r["depth"] for r in rows}
    fan_out = {r["id"]: r["fan_out"] for r in rows}
    return skills, depth, fan_out


@lru_cache(maxsize=1)
def _tracks() -> dict[str, dict]:
    rows = json.loads((DATA_DIR / "tracks.json").read_text(encoding="utf-8"))
    return {t["id"]: t for t in rows}


def _profile(known: dict[str, float], constraints: Constraints) -> LearnerProfile:
    return LearnerProfile(
        mastery={
            sid: Mastery(skill_id=sid, level=lvl, confidence=Confidence.HIGH)
            for sid, lvl in known.items()
        },
        constraints=constraints,
    )


def build_plan(
    goal: str,
    constraints: Constraints,
    known: dict[str, float],
    priority: str = "balanced",
    strip_electives: bool = False,
) -> tuple[LearningPath, str, int]:
    """Returns (path, target_role, readiness_pct)."""
    skills, depth, _ = _skills()

    # 1. decompose goal -> required + importance
    track_id = router.match_track(goal)
    if track_id and track_id in _tracks():
        track = _tracks()[track_id]
        role = track["name"]
        track_skills = track["skills"]

        # If priority is crash or strip_electives is requested, omit elective skills
        if priority == "crash" or strip_electives:
            required = {s: v["required"] for s, v in track_skills.items() if not v.get("elective", False)}
            importance = {s: v["importance"] for s, v in track_skills.items() if not v.get("elective", False)}
        else:
            required = {s: v["required"] for s, v in track_skills.items()}
            importance = {s: v["importance"] for s, v in track_skills.items()}
    else:
        decomp = router.decompose_goal(goal)
        role = decomp.get("role", goal)
        required, importance = {}, {}
        for s in decomp.get("skills", []):
            sid = s.get("id")
            if sid in skills:  # keep only skills in our canonical DAG
                if (priority == "crash" or strip_electives) and s.get("elective", False):
                    continue
                required[sid] = s.get("required", 0.7)
                importance[sid] = s.get("importance", 0.7)

    profile = _profile(known, constraints)

    # 2. gaps
    gaps = gap.compute_gaps(profile, required, skills, importance)
    gap_by_skill = {g.skill_id: g for g in gaps}

    # readiness: weighted fraction of the requirement already met
    total_w = sum(g.importance * g.required_level for g in gaps) or 1.0
    met_w = sum(g.importance * min(g.current_level, g.required_level) for g in gaps)
    readiness = round(100 * met_w / total_w)

    # 3. A* order over the gapped skills
    weights = _PRESETS.get(priority, PlannerWeights)()
    order = planning.plan_skill_order(gaps, profile, skills, depth, weights=weights)

    # 4. bind each ordered skill to its best resource
    phases = planning.assign_phases(order, skills, depth)
    nodes: list[PathNode] = []
    for i, sid in enumerate(order):
        skill = skills[sid]
        g = gap_by_skill.get(sid)

        # Catalog search with live enrichment (MS Learn, YouTube)
        candidates = catalog.search(f"{skill.name}. {skill.description}", top_k=12, skill_id=sid)
        live_resources = catalog.enrich_live(sid, skill.name)
        if live_resources:
            candidates = live_resources + candidates

        best_res: Resource | None = None
        alts: list[Resource] = []
        factor_scores: dict[str, float] = {}
        if candidates and g:
            sem = catalog.semantic_scores(skill.name, candidates)
            scored = retrieval.rerank(candidates, g, profile, semantic=sem, top_k=4)
            if scored:
                best_res = scored[0].resource
                alts = [s.resource for s in scored[1:4]]
                factor_scores = scored[0].factors

        hours = best_res.duration_hours if best_res and best_res.duration_hours else 6.0
        satisfied = [skills[p].name for p in skill.prerequisites if profile.level(p) >= 0.6]
        node = PathNode(
            skill_id=sid,
            skill_name=skill.name,
            resource=best_res,
            alternatives=alts,
            status=NodeStatus.LOCKED,
            phase=phases.get(sid, Phase.FOUNDATIONS),
            order=i,
            estimated_hours=hours,
            gap_delta=round(g.gap * 100) if g else 0,
            factor_scores=factor_scores,
        )
        if g:
            ev = explain.build_evidence(node, g, satisfied, factor_scores)
            node.rationale = explain.render_rationale(ev)
        nodes.append(node)

    if nodes:
        nodes[0].status = NodeStatus.ACTIVE

    # 5. budget binding
    _apply_budget(nodes, constraints.budget_usd)

    # 6. milestones and totals
    milestones = _group(nodes)
    total_hours = sum(n.estimated_hours for n in nodes)
    total_cost = sum(
        n.resource.price_usd for n in nodes if n.resource and n.resource.cost_type != "free"
    )
    weeks = total_hours / constraints.hours_per_week if constraints.hours_per_week else None
    feasible = True
    if constraints.deadline_weeks and weeks:
        feasible = weeks <= constraints.deadline_weeks

    path = LearningPath(
        goal_text=goal,
        target_role=role,
        milestones=milestones,
        total_hours=round(total_hours, 1),
        total_cost_usd=round(total_cost, 2),
        weeks_required=round(weeks, 1) if weeks else None,
        is_feasible=feasible,
        prerequisite_violations=planning.count_violations(order, skills),
    )
    return path, role, readiness


def compute_relaxation(
    goal: str,
    constraints: Constraints,
    known: dict[str, float],
    priority: str = "balanced",
) -> dict:
    """
    Compute ranked relaxation options when a schedule or budget constraint is tight.
    Returns calculated deltas for: (1) dropping electives, (2) extending deadline, (3) increasing study pace.
    """
    baseline_path, role, _ = build_plan(goal, constraints, known, priority=priority, strip_electives=False)

    options = []

    # 1. Option: Drop electives
    stripped_path, _, _ = build_plan(goal, constraints, known, priority=priority, strip_electives=True)
    saved_hours = round(baseline_path.total_hours - stripped_path.total_hours, 1)
    if saved_hours > 0:
        new_weeks = stripped_path.weeks_required or 0.0
        options.append({
            "type": "drop_electives",
            "title": "Drop Elective Modules",
            "description": f"Focus strictly on core requirements, saving {saved_hours} study hours.",
            "hours_saved": saved_hours,
            "new_total_hours": stripped_path.total_hours,
            "new_weeks_required": new_weeks,
            "is_feasible": (
                new_weeks <= constraints.deadline_weeks if constraints.deadline_weeks else True
            ),
        })

    # 2. Option: Extend deadline
    if constraints.deadline_weeks and baseline_path.weeks_required:
        needed_weeks = math.ceil(baseline_path.total_hours / constraints.hours_per_week)
        if needed_weeks > constraints.deadline_weeks:
            delta_weeks = needed_weeks - constraints.deadline_weeks
            options.append({
                "type": "extend_deadline",
                "title": f"Extend Target Deadline by +{delta_weeks} Weeks",
                "description": f"Maintain your current {constraints.hours_per_week:g}h/week study pace by adjusting target deadline to {needed_weeks} weeks.",
                "hours_saved": 0.0,
                "new_total_hours": baseline_path.total_hours,
                "new_weeks_required": float(needed_weeks),
                "is_feasible": True,
            })

    # 3. Option: Increase study pace
    if constraints.deadline_weeks and baseline_path.weeks_required:
        if baseline_path.weeks_required > constraints.deadline_weeks:
            needed_hpw = round(baseline_path.total_hours / constraints.deadline_weeks, 1)
            delta_hpw = round(needed_hpw - constraints.hours_per_week, 1)
            options.append({
                "type": "increase_hours",
                "title": f"Accelerate Pace (+{delta_hpw}h/week)",
                "description": f"Increase study commitment to {needed_hpw}h/week to achieve goal within {constraints.deadline_weeks} weeks.",
                "hours_saved": 0.0,
                "new_total_hours": baseline_path.total_hours,
                "new_weeks_required": float(constraints.deadline_weeks),
                "is_feasible": True,
            })

    return {
        "is_feasible": baseline_path.is_feasible,
        "baseline_hours": baseline_path.total_hours,
        "baseline_weeks": baseline_path.weeks_required,
        "deadline_weeks": constraints.deadline_weeks,
        "hours_per_week": constraints.hours_per_week,
        "options": options,
    }


def _apply_budget(nodes: list[PathNode], budget: float | None) -> None:
    """Downgrade paid picks to free alternatives when exceeding budget ceiling."""
    if budget is None:
        return
    paid = [n for n in nodes if n.resource and n.resource.cost_type != "free"]
    total = sum(n.resource.price_usd for n in paid)
    for n in sorted(paid, key=lambda x: -x.resource.price_usd):
        if total <= budget:
            break
        free_alt = next((a for a in n.alternatives if a.cost_type == "free"), None)
        if free_alt:
            total -= n.resource.price_usd
            n.resource = free_alt


def _group(nodes: list[PathNode]) -> list[Milestone]:
    out: list[Milestone] = []
    for phase in [Phase.FOUNDATIONS, Phase.CORE, Phase.ADVANCED, Phase.CAPSTONE]:
        phase_nodes = [n for n in nodes if n.phase == phase]
        if phase_nodes:
            out.append(Milestone(phase=phase, title=_PHASE_TITLE[phase], nodes=phase_nodes))
    return out
