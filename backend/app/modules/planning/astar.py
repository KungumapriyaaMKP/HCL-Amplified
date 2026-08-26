"""
A* over the SKILL DAG -- Deliverable 4, deterministic.

We sequence skill nodes, not course nodes: courses have messy
inter-dependencies while canonical skills have clean, cycle-free ones. Each
sequenced skill later binds its best resource (see resource binding).

State = frozenset of mastered skill ids. A move learns one more skill whose
prerequisites are already satisfied. g(n) accumulates weighted time / cost /
difficulty-jump minus prior-experience credit; h(n) is an admissible
estimate of the work remaining. The frontier is a heapq ordered by f = g + h.
"""
from __future__ import annotations

import heapq
from dataclasses import dataclass, field

from app.domain import LearnerProfile, Skill, SkillGap


@dataclass(frozen=True)
class PlannerWeights:
    """
    Maps the Page 3 priority control onto g(n). A 3-way segmented control,
    NOT three independent toggles -- those give eight ambiguous combinations.
    """
    time: float = 1.0
    cost: float = 0.5
    difficulty_jump: float = 0.5
    prior_experience: float = 0.5

    @classmethod
    def fastest(cls) -> "PlannerWeights":
        return cls(time=2.0, cost=0.2, difficulty_jump=0.4)

    @classmethod
    def cheapest(cls) -> "PlannerWeights":
        return cls(time=0.4, cost=2.0, difficulty_jump=0.4)

    @classmethod
    def most_rigorous(cls) -> "PlannerWeights":
        return cls(time=0.4, cost=0.4, difficulty_jump=1.5)


@dataclass(order=True)
class _Node:
    f: float
    g: float = field(compare=False)
    mastered: frozenset[str] = field(compare=False)
    order: tuple[str, ...] = field(compare=False)


# rough hours to learn one skill, by difficulty tier -- used only for the
# heuristic and the g-cost when a real course is not yet bound
_TIER_HOURS = {0: 6.0, 1: 10.0, 2: 16.0}
_DEPTH_DIFFICULTY = 3  # depth beyond which a skill counts as "advanced"


def _difficulty(skill: Skill, depth: int) -> int:
    return min(2, depth // _DEPTH_DIFFICULTY)


# The skill DAG has several parallel tracks (maths, Python, cloud) that
# interleave freely, so the number of prerequisite-closed subsets is
# combinatorial. Optimal A* is only tractable when the target set is small
# (a partial learner filling a handful of gaps); for a large target set we
# go straight to the weight-aware greedy topological sort, which is always
# valid. The expansion cap is a second safety net.
_ASTAR_TARGET_LIMIT = 16
_MAX_EXPANSIONS = 6000


def _step_cost(
    sid: str,
    mastered: frozenset[str],
    profile: LearnerProfile,
    skills: dict[str, Skill],
    depth: dict[str, int],
    weights: PlannerWeights,
) -> float:
    """Cost of learning `sid` next, given what is already mastered."""
    skill = skills[sid]
    d = _difficulty(skill, depth[sid])
    hours = _TIER_HOURS[d]
    prereq_max = max(
        (_difficulty(skills[p], depth[p]) for p in skill.prerequisites), default=0
    )
    jump = max(0, d - prereq_max)
    m = profile.mastery.get(sid)
    prior = m.level if m else 0.0
    step = (
        weights.time * hours
        + weights.difficulty_jump * jump * 5.0
        - weights.prior_experience * prior * hours
    )
    return max(0.5, step)


def _resolve_targets(
    goal_gaps: list[SkillGap],
    profile: LearnerProfile,
    skills: dict[str, Skill],
) -> tuple[set[str], set[str]]:
    """Return (needed, already) -- the skills to learn and the ones held."""
    already: set[str] = {
        sid for sid, _ in skills.items()
        if (m := profile.mastery.get(sid)) and m.level >= 0.7
    }
    targets = {g.skill_id for g in goal_gaps if g.gap > 0}
    needed: set[str] = set()
    stack = list(targets)
    while stack:
        sid = stack.pop()
        if sid in needed or sid in already:
            continue
        needed.add(sid)
        stack.extend(p for p in skills[sid].prerequisites if p not in already)
    return needed, already


def plan_skill_order(
    goal_gaps: list[SkillGap],
    profile: LearnerProfile,
    skills: dict[str, Skill],
    depth: dict[str, int],
    weights: PlannerWeights | None = None,
) -> list[str]:
    """
    Return the skill ids to learn, in an order that never violates a
    prerequisite. Only skills with a real gap are targeted; their unmastered
    prerequisites are pulled in automatically.

    Bounded A* for optimality on tractable instances, with a weight-aware
    greedy topological sort as the fallback that guarantees termination and
    validity on the large interleaving DAG.
    """
    weights = weights or PlannerWeights()
    needed, already = _resolve_targets(goal_gaps, profile, skills)
    if not needed:
        return []

    # large target set -> optimal A* is intractable, use the valid greedy order
    if len(needed) > _ASTAR_TARGET_LIMIT:
        return _greedy_order(needed, already, profile, skills, depth, weights)

    def learnable(mastered: frozenset[str]) -> list[str]:
        return sorted(
            sid for sid in needed
            if sid not in mastered
            and all(p in mastered for p in skills[sid].prerequisites)
        )

    def heuristic(mastered: frozenset[str]) -> float:
        # admissible: at least half the minimum tier hours per remaining skill
        return weights.time * sum(
            _TIER_HOURS[_difficulty(skills[s], depth[s])] * 0.5
            for s in needed - mastered
        )

    start = _Node(f=0.0, g=0.0, mastered=frozenset(already), order=())
    frontier: list[_Node] = [start]
    best_g: dict[frozenset[str], float] = {start.mastered: 0.0}
    expansions = 0

    while frontier and expansions < _MAX_EXPANSIONS:
        node = heapq.heappop(frontier)
        if needed <= node.mastered:
            return list(node.order)
        if node.g > best_g.get(node.mastered, float("inf")):
            continue
        expansions += 1

        for sid in learnable(node.mastered):
            step = _step_cost(sid, node.mastered, profile, skills, depth, weights)
            new_mastered = node.mastered | {sid}
            new_g = node.g + step
            if new_g < best_g.get(new_mastered, float("inf")):
                best_g[new_mastered] = new_g
                heapq.heappush(frontier, _Node(
                    f=new_g + heuristic(new_mastered),
                    g=new_g,
                    mastered=new_mastered,
                    order=node.order + (sid,),
                ))

    # A* exceeded its budget on this instance -> greedy weighted topo sort
    return _greedy_order(needed, already, profile, skills, depth, weights)


def _greedy_order(
    needed: set[str],
    already: set[str],
    profile: LearnerProfile,
    skills: dict[str, Skill],
    depth: dict[str, int],
    weights: PlannerWeights,
) -> list[str]:
    """
    Repeatedly take the lowest-cost learnable skill. Only ever picks from the
    ready set, so it is prerequisite-valid by construction; deterministic via
    the (cost, id) tie-break; and preset-aware through the shared cost model.
    """
    order: list[str] = []
    mastered = set(already)
    remaining = set(needed)
    while remaining:
        ready = [
            s for s in remaining if all(p in mastered for p in skills[s].prerequisites)
        ]
        if not ready:  # a cycle -- the DAG test prevents this from happening
            order.extend(sorted(remaining))
            break
        chosen = min(
            ready,
            key=lambda s: (
                _step_cost(s, frozenset(mastered), profile, skills, depth, weights),
                depth[s],
                s,
            ),
        )
        order.append(chosen)
        mastered.add(chosen)
        remaining.discard(chosen)
    return order
