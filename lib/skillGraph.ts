import { SKILLS, SKILLS_BY_ID } from "@/data/skills";

/** All prerequisites of `skillId`, transitively, not including itself. */
export function transitivePrerequisites(skillId: string, seen = new Set<string>()): Set<string> {
  const skill = SKILLS_BY_ID.get(skillId);
  if (!skill) return seen;
  for (const p of skill.prerequisites) {
    if (!seen.has(p)) {
      seen.add(p);
      transitivePrerequisites(p, seen);
    }
  }
  return seen;
}

/** The full set of skills required to reach every goal skill: the goals
 * themselves plus everything they transitively depend on. */
export function requiredSkillSet(goalSkillIds: string[]): Set<string> {
  const required = new Set<string>(goalSkillIds);
  for (const g of goalSkillIds) {
    for (const p of transitivePrerequisites(g)) required.add(p);
  }
  return required;
}

/**
 * Topologically sorts `skillIds` (Kahn's algorithm) so every skill appears
 * after all of its prerequisites that are also in the set. Skills whose
 * prerequisites lie outside the set are treated as having no in-set
 * dependency for that edge (they're assumed already satisfied/irrelevant).
 */
export function topologicalOrder(skillIds: string[]): string[] {
  const set = new Set(skillIds);
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const id of set) {
    inDegree.set(id, 0);
    dependents.set(id, []);
  }

  for (const id of set) {
    const skill = SKILLS_BY_ID.get(id);
    if (!skill) continue;
    for (const prereq of skill.prerequisites) {
      if (!set.has(prereq)) continue;
      inDegree.set(id, (inDegree.get(id) ?? 0) + 1);
      dependents.get(prereq)!.push(id);
    }
  }

  const queue = [...set].filter((id) => (inDegree.get(id) ?? 0) === 0).sort();
  const order: string[] = [];

  while (queue.length) {
    const next = queue.shift()!;
    order.push(next);
    for (const dep of dependents.get(next) ?? []) {
      const remaining = (inDegree.get(dep) ?? 0) - 1;
      inDegree.set(dep, remaining);
      if (remaining === 0) queue.push(dep);
    }
    queue.sort();
  }

  // Any leftover ids indicate a cycle (shouldn't happen with hand-authored
  // data) - append them at the end rather than dropping them silently.
  for (const id of set) if (!order.includes(id)) order.push(id);

  return order;
}

const MASTERY_THRESHOLD = 60;

/**
 * The core skill-gap analysis: given a goal and what the learner has
 * mastered, returns the ordered (prerequisite-respecting) list of skills
 * still needed to reach the goal.
 */
export function computeGap(
  goalSkillIds: string[],
  masteryBySkill: Map<string, number>,
  threshold = MASTERY_THRESHOLD,
): string[] {
  const required = requiredSkillSet(goalSkillIds);
  const missing = [...required].filter((id) => (masteryBySkill.get(id) ?? 0) < threshold);
  return topologicalOrder(missing);
}

/** Skills whose prerequisites are all satisfied (mastered or absent from the
 * set), used to decide what's "available" to start next. */
export function isUnlocked(skillId: string, masteryBySkill: Map<string, number>, threshold = MASTERY_THRESHOLD): boolean {
  const skill = SKILLS_BY_ID.get(skillId);
  if (!skill) return true;
  return skill.prerequisites.every((p) => (masteryBySkill.get(p) ?? 0) >= threshold);
}

export function foundationalSkillsForDomain(domain: string): string[] {
  return SKILLS.filter((s) => s.category === domain && s.prerequisites.length === 0).map((s) => s.id);
}

export function skillsForDomain(domain: string): string[] {
  return SKILLS.filter((s) => s.category === domain).map((s) => s.id);
}

/** Leaf skills of a domain: nothing else lists them as a prerequisite, so
 * they represent that domain's "end states" - the natural default targets
 * for a learning goal. */
export function leafSkillsForDomain(domain: string): string[] {
  const referenced = new Set<string>();
  for (const s of SKILLS) for (const p of s.prerequisites) referenced.add(p);
  return SKILLS.filter((s) => s.category === domain && !referenced.has(s.id)).map((s) => s.id);
}

/**
 * Maps a free-text goal (+ extracted sub-focus tags) onto concrete target
 * skill(s) in the domain's skill graph, via keyword overlap against each
 * leaf skill's name/description. Deterministic and explainable - this is
 * the skill-graph side of "goal -> path", separate from the LLM calls.
 */
export function resolveGoalSkills(domain: string, goalText: string, subFocusTags: string[] = []): string[] {
  const leaves = leafSkillsForDomain(domain);
  const haystack = `${goalText} ${subFocusTags.join(" ")}`.toLowerCase();

  const scored = leaves
    .map((id) => {
      const skill = SKILLS_BY_ID.get(id)!;
      const words = `${skill.name} ${skill.description}`
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 3);
      const score = words.reduce((acc, w) => acc + (haystack.includes(w) ? 1 : 0), 0);
      return { id, score };
    })
    .sort((a, b) => b.score - a.score);

  const matched = scored.filter((s) => s.score > 0).slice(0, 3).map((s) => s.id);
  return matched.length ? matched : leaves.slice(0, Math.min(2, leaves.length));
}

// ---------------------------------------------------------------------------
// Knowledge graph (visual): the same prerequisite DAG above, exposed as
// nodes/edges for rendering rather than just for gap-analysis traversal.
// ---------------------------------------------------------------------------

export type GraphNode = { id: string; name: string; category: string; description: string; depth: number };
export type GraphEdge = { from: string; to: string }; // from prerequisite -> to dependent

/** Longest chain of prerequisites beneath `skillId` - used to lay the graph
 * out in columns (depth 0 = no prerequisites, on the left). */
export function skillDepth(skillId: string, memo = new Map<string, number>()): number {
  if (memo.has(skillId)) return memo.get(skillId)!;
  const skill = SKILLS_BY_ID.get(skillId);
  if (!skill || skill.prerequisites.length === 0) {
    memo.set(skillId, 0);
    return 0;
  }
  const d = 1 + Math.max(...skill.prerequisites.map((p) => skillDepth(p, memo)));
  memo.set(skillId, d);
  return d;
}

/**
 * The knowledge graph for one domain: its own skills plus the transitive
 * closure of everything they depend on (even prerequisites that live in a
 * different domain category, e.g. `sql` feeding data-science skills) - so
 * the rendered graph never has a dangling edge pointing at a node it
 * doesn't include.
 */
export function domainSkillGraph(domain: string): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const own = skillsForDomain(domain);
  const nodeIds = new Set<string>(own);
  for (const id of own) for (const p of transitivePrerequisites(id)) nodeIds.add(p);

  const nodes: GraphNode[] = [...nodeIds].map((id) => {
    const skill = SKILLS_BY_ID.get(id)!;
    return { id, name: skill.name, category: skill.category, description: skill.description, depth: skillDepth(id) };
  });

  const edges: GraphEdge[] = [];
  for (const id of nodeIds) {
    const skill = SKILLS_BY_ID.get(id)!;
    for (const p of skill.prerequisites) {
      if (nodeIds.has(p)) edges.push({ from: p, to: id });
    }
  }

  return { nodes, edges };
}

// ---------------------------------------------------------------------------
// Similarity graph: a second, independent graph over the same skill set,
// connecting skills that are topically close (same domain + overlapping
// prerequisites) rather than dependent on each other. This is what the
// adaptation engine's stuck-detector reroutes through - see onProctoredResult
// in lib/adapt.ts - when the prerequisite graph alone would dead-end (no
// easier resource left, or the learner has already failed remediation on
// this exact skill once).
// ---------------------------------------------------------------------------

/** 0..1 topical closeness between two skills: same category is a strong
 * signal, plus how much their prerequisite sets overlap (Jaccard). Distinct
 * from cosineSimilarity in lib/recommend.ts, which compares a *resource's*
 * skill-tag vector against a *target skill* - this compares two skills
 * directly, using graph structure rather than resource tagging. */
export function skillSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const skillA = SKILLS_BY_ID.get(a);
  const skillB = SKILLS_BY_ID.get(b);
  if (!skillA || !skillB) return 0;

  const sameCategory = skillA.category === skillB.category ? 0.4 : 0;

  const prereqsA = new Set(skillA.prerequisites);
  const prereqsB = new Set(skillB.prerequisites);
  const union = new Set([...prereqsA, ...prereqsB]);
  const overlap = union.size === 0 ? 0 : [...prereqsA].filter((p) => prereqsB.has(p)).length / union.size;

  return Math.min(1, sameCategory + overlap * 0.6);
}

/** The skills most topically related to `skillId`, most similar first -
 * candidates for a dual-graph reroute when `skillId` itself is a dead end. */
export function relatedSkills(skillId: string, exclude: Set<string> = new Set(), minSimilarity = 0.3): string[] {
  return SKILLS.filter((s) => s.id !== skillId && !exclude.has(s.id))
    .map((s) => ({ id: s.id, sim: skillSimilarity(skillId, s.id) }))
    .filter((s) => s.sim >= minSimilarity)
    .sort((a, b) => b.sim - a.sim)
    .map((s) => s.id);
}
