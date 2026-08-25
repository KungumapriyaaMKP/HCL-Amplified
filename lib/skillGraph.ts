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
