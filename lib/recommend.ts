import { skillVector } from "@/lib/embeddings";
import { SKILLS_BY_ID } from "@/data/skills";

export type CandidateResource = {
  id: string;
  title: string;
  description: string;
  type: string;
  provider: string;
  source: string;
  url: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  rating: number;
  estimatedMinutes: number;
  skillWeights: Record<string, number>;
};

export type RankingContext = {
  targetSkillId: string;
  masteryBySkill: Map<string, number>;
  interestSkillIds: string[]; // skills implied by the learner's stated interests/sub-focus
  difficultyBias: number; // -1 (prefer easier) .. 1 (prefer harder), 0 = neutral
  practiceBias?: number; // 0 (neutral, default) .. 1 (strongly prefer hands-on project/assessment resources over long-form courses) - set for the "Interview Crash Course" track pace
  goalText?: string; // the learner's own free-text goal - drives the keyword side of hybrid retrieval below
  modalityPreference?: Record<string, number>; // learner's preferenceScores from profiles (EMA over course/project/assessment/article outcomes)
};

const DIFFICULTY_INDEX: Record<CandidateResource["difficulty"], number> = {
  beginner: 0,
  intermediate: 0.5,
  advanced: 1,
};

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/** Where the learner currently sits, 0..1, in the prerequisites of `skillId`. */
function prereqReadiness(skillId: string, masteryBySkill: Map<string, number>): number {
  const skill = SKILLS_BY_ID.get(skillId);
  if (!skill || skill.prerequisites.length === 0) return 1;
  const scores = skill.prerequisites.map((p) => (masteryBySkill.get(p) ?? 0) / 100);
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/** How well a resource's difficulty matches where the learner currently is
 * *in this specific skill* (not how ready its prerequisites are - those are
 * a separate ranking dimension), nudged by their stated difficultyBias
 * preference (set by the adaptation engine after "too easy"/"too hard"
 * feedback). A foundational skill with zero prerequisites and zero mastery
 * should still point at a beginner resource - prerequisite completeness is
 * not the same signal as "ready for advanced material in this skill". */
function difficultyFit(
  resource: CandidateResource,
  targetSkillId: string,
  masteryBySkill: Map<string, number>,
  difficultyBias: number,
): number {
  const ownMastery = (masteryBySkill.get(targetSkillId) ?? 0) / 100;
  const idealIndex = Math.max(0, Math.min(1, ownMastery * 0.7 + difficultyBias * 0.3));
  const distance = Math.abs(DIFFICULTY_INDEX[resource.difficulty] - idealIndex);
  return 1 - distance;
}

const STOPWORDS = new Set([
  "want", "goal", "learn", "learning", "become", "with", "that", "this", "into", "about", "from", "have", "will",
  "just", "really", "like", "know", "some", "more", "very", "good", "role", "using",
]);

function keywords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w)),
  );
}

/** Hybrid retrieval's keyword side: plain term overlap between the
 * learner's own goal text and a resource's title/description, independent
 * of the skill-tag/embedding match above. A resource can rank well on
 * cosineSim (right skill) but this catches the case where its specific
 * framing (e.g. "for interviews", "from scratch", a named tool) matches
 * what the learner actually asked for. Neutral (0.5) when no goal text is
 * available so it never penalizes callers that don't pass one. */
function keywordOverlap(resource: CandidateResource, goalText?: string): number {
  if (!goalText) return 0.5;
  const goalWords = keywords(goalText);
  if (goalWords.size === 0) return 0.5;
  const resourceWords = keywords(`${resource.title} ${resource.description}`);
  let hits = 0;
  for (const w of resourceWords) if (goalWords.has(w)) hits++;
  return Math.min(1, hits / 3);
}

function interestOverlap(resource: CandidateResource, interestSkillIds: string[]): number {
  if (interestSkillIds.length === 0) return 0.5; // neutral when we don't know interests yet
  const resourceSkills = Object.keys(resource.skillWeights);
  const overlap = resourceSkills.filter((s) => interestSkillIds.includes(s)).length;
  return Math.min(1, overlap / Math.max(1, interestSkillIds.length));
}

/** How well a resource's format (course/project/assessment/article) matches
 * this learner's modality preference, tracked via EMA in
 * `updatePreferenceScore` (lib/adapt.ts) from how they've actually engaged
 * with each format before. Neutral (0.5) until enough signal exists. */
function preferenceFit(resource: CandidateResource, modalityPreference?: Record<string, number>): number {
  return modalityPreference?.[resource.type] ?? 0.5;
}

/** practiceBias value used whenever a goal's track pace is "crash-course" -
 * shared by path generation and the adaptation engine so remediation/
 * acceleration re-ranks stay consistent with how the path was first built. */
export const CRASH_COURSE_PRACTICE_BIAS = 0.45;

/** How hands-on/practice-oriented a resource is: 1 for a project or
 * assessment, 0.5 for an article, 0 for a full course. Only pulled into the
 * final score when `practiceBias` is non-zero (crash-course pace) - at
 * practiceBias 0 this dimension has no effect on the default ranking. */
function practiceFit(resource: CandidateResource): number {
  if (resource.type === "project" || resource.type === "assessment") return 1;
  if (resource.type === "article") return 0.5;
  return 0; // "course"
}

export type ScoredResource = CandidateResource & {
  score: number;
  scoreBreakdown: {
    cosineSim: number;
    prereqReadiness: number;
    difficultyFit: number;
    interestOverlap: number;
    ratingNorm: number;
    preferenceFit: number;
    practiceFit: number;
    keywordOverlap: number;
  };
};

/**
 * Hybrid content-based recommendation with weighted ranking: blends
 * embedding cosine similarity (semantic - skill-tag vectors) with plain
 * keyword overlap against the learner's own goal text (the keyword side of
 * hybrid retrieval), prerequisite readiness, difficulty fit, interest
 * overlap, rating, and modality preference (course/project/assessment/
 * article, tracked via EMA) into a single score. This is what actually
 * orders resources within a path module, and what the adaptation engine
 * re-runs after feedback changes `difficultyBias` or modality preferences.
 */
export function rankResources(candidates: CandidateResource[], ctx: RankingContext): ScoredResource[] {
  const targetVector = skillVector({
    [ctx.targetSkillId]: 1,
    ...Object.fromEntries(ctx.interestSkillIds.map((id) => [id, 0.3])),
  });

  const weights = {
    cosineSim: 0.3,
    prereqReadiness: 0.15,
    difficultyFit: 0.15,
    interestOverlap: 0.1,
    rating: 0.1,
    keyword: 0.1,
    preferenceFit: 0.1,
  };

  const scored = candidates.map((resource) => {
    const resourceVector = skillVector(resource.skillWeights);
    const cosineSim = cosineSimilarity(targetVector, resourceVector);
    const prereq = prereqReadiness(ctx.targetSkillId, ctx.masteryBySkill);
    const diffFit = difficultyFit(resource, ctx.targetSkillId, ctx.masteryBySkill, ctx.difficultyBias);
    const interest = interestOverlap(resource, ctx.interestSkillIds);
    const ratingNorm = resource.rating / 5;
    const prefFit = preferenceFit(resource, ctx.modalityPreference);
    const practice = practiceFit(resource);
    const keyword = keywordOverlap(resource, ctx.goalText);

    const score =
      weights.cosineSim * cosineSim +
      weights.prereqReadiness * prereq +
      weights.difficultyFit * diffFit +
      weights.interestOverlap * interest +
      weights.rating * ratingNorm +
      weights.keyword * keyword +
      weights.preferenceFit * prefFit +
      (ctx.practiceBias ?? 0) * practice;

    return {
      ...resource,
      score,
      scoreBreakdown: {
        cosineSim,
        prereqReadiness: prereq,
        difficultyFit: diffFit,
        interestOverlap: interest,
        ratingNorm,
        preferenceFit: prefFit,
        practiceFit: practice,
        keywordOverlap: keyword,
      },
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}

/** Picks the single best resource for `targetSkillId` from a pool of
 * candidates that teach it (any weight > 0). */
export function bestResourceForSkill(
  pool: CandidateResource[],
  ctx: RankingContext,
): ScoredResource | null {
  const eligible = pool.filter((r) => (r.skillWeights[ctx.targetSkillId] ?? 0) > 0);
  if (eligible.length === 0) return null;
  return rankResources(eligible, ctx)[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// A* Path Planning Engine
// ─────────────────────────────────────────────────────────────────────────────

export type PlannerMode = "fastest" | "cheapest" | "most_rigorous";

export interface PlannerWeights {
  time: number;
  cost: number;
  difficultyJump: number;
  priorExperience: number;
}

export const PLANNER_WEIGHTS: Record<PlannerMode, PlannerWeights> = {
  fastest: { time: 2.0, cost: 0.2, difficultyJump: 0.4, priorExperience: 0.5 },
  cheapest: { time: 0.4, cost: 2.0, difficultyJump: 0.4, priorExperience: 0.5 },
  most_rigorous: { time: 0.4, cost: 0.4, difficultyJump: 1.5, priorExperience: 0.5 },
};

const TIER_HOURS: Record<number, number> = { 0: 6.0, 1: 10.0, 2: 16.0 };
const DEPTH_DIFFICULTY = 3;
const ASTAR_TARGET_LIMIT = 16;
const MAX_EXPANSIONS = 6000;

function skillTierDifficulty(depth: number): number {
  return Math.min(2, Math.floor(depth / DEPTH_DIFFICULTY));
}

function computeStepCost(
  sid: string,
  masteryBySkill: Map<string, number>,
  depthMap: Map<string, number>,
  weights: PlannerWeights
): number {
  const skill = SKILLS_BY_ID.get(sid);
  const depth = depthMap.get(sid) ?? 0;
  const d = skillTierDifficulty(depth);
  const hours = TIER_HOURS[d] ?? 10.0;

  let prereqMax = 0;
  if (skill && skill.prerequisites.length > 0) {
    for (const p of skill.prerequisites) {
      const pd = depthMap.get(p) ?? 0;
      const pt = skillTierDifficulty(pd);
      if (pt > prereqMax) prereqMax = pt;
    }
  }

  const jump = Math.max(0, d - prereqMax);
  const prior = (masteryBySkill.get(sid) ?? 0) / 100;
  const step =
    weights.time * hours +
    weights.difficultyJump * jump * 5.0 -
    weights.priorExperience * prior * hours;

  return Math.max(0.5, step);
}

class PriorityQueue<T> {
  private items: { item: T; priority: number }[] = [];

  push(item: T, priority: number) {
    this.items.push({ item, priority });
    this.items.sort((a, b) => a.priority - b.priority);
  }

  pop(): T | undefined {
    return this.items.shift()?.item;
  }

  get length(): number {
    return this.items.length;
  }
}

function resolveTargetSubsets(
  gapSkillIds: string[],
  masteryBySkill: Map<string, number>
): { needed: Set<string>; already: Set<string> } {
  const already = new Set<string>();
  for (const [id] of SKILLS_BY_ID) {
    const m = masteryBySkill.get(id) ?? 0;
    if (m >= 70) already.add(id);
  }

  const needed = new Set<string>();
  const stack = [...gapSkillIds];
  while (stack.length > 0) {
    const sid = stack.pop()!;
    if (needed.has(sid) || already.has(sid)) continue;
    needed.add(sid);
    const skill = SKILLS_BY_ID.get(sid);
    if (skill) {
      for (const p of skill.prerequisites) {
        if (!already.has(p)) stack.push(p);
      }
    }
  }

  return { needed, already };
}

function greedyOrder(
  needed: Set<string>,
  already: Set<string>,
  masteryBySkill: Map<string, number>,
  depthMap: Map<string, number>,
  weights: PlannerWeights
): string[] {
  const order: string[] = [];
  const mastered = new Set(already);
  const remaining = new Set(needed);

  while (remaining.size > 0) {
    const ready: string[] = [];
    for (const s of remaining) {
      const skill = SKILLS_BY_ID.get(s);
      const prereqs = skill?.prerequisites ?? [];
      if (prereqs.every((p) => mastered.has(p))) {
        ready.push(s);
      }
    }

    if (ready.length === 0) {
      order.push(...Array.from(remaining).sort());
      break;
    }

    ready.sort((a, b) => {
      const costA = computeStepCost(a, masteryBySkill, depthMap, weights);
      const costB = computeStepCost(b, masteryBySkill, depthMap, weights);
      if (costA !== costB) return costA - costB;
      const depthA = depthMap.get(a) ?? 0;
      const depthB = depthMap.get(b) ?? 0;
      if (depthA !== depthB) return depthA - depthB;
      return a.localeCompare(b);
    });

    const chosen = ready[0];
    order.push(chosen);
    mastered.add(chosen);
    remaining.delete(chosen);
  }

  return order;
}

/**
 * Plans the optimal prerequisite-respecting learning sequence using A* search
 * over the skill-DAG powerset with heuristic estimation and greedy fallback.
 */
export function planSkillOrder(
  gapSkillIds: string[],
  masteryBySkill: Map<string, number>,
  mode: PlannerMode = "fastest",
  customWeights?: PlannerWeights
): string[] {
  const weights = customWeights ?? PLANNER_WEIGHTS[mode] ?? PLANNER_WEIGHTS.fastest;
  const { needed, already } = resolveTargetSubsets(gapSkillIds, masteryBySkill);
  if (needed.size === 0) return [];

  // Compute depths
  const depthMap = new Map<string, number>();
  const getDepth = (id: string, visited = new Set<string>()): number => {
    if (depthMap.has(id)) return depthMap.get(id)!;
    if (visited.has(id)) return 0;
    visited.add(id);
    const skill = SKILLS_BY_ID.get(id);
    if (!skill || skill.prerequisites.length === 0) {
      depthMap.set(id, 0);
      return 0;
    }
    const maxP = Math.max(...skill.prerequisites.map((p) => getDepth(p, visited)));
    const d = maxP + 1;
    depthMap.set(id, d);
    return d;
  };

  for (const s of needed) getDepth(s);
  for (const s of already) getDepth(s);

  // Large target set -> use greedy topological sort
  if (needed.size > ASTAR_TARGET_LIMIT) {
    return greedyOrder(needed, already, masteryBySkill, depthMap, weights);
  }

  const learnable = (mastered: Set<string>): string[] => {
    const list: string[] = [];
    for (const sid of needed) {
      if (mastered.has(sid)) continue;
      const skill = SKILLS_BY_ID.get(sid);
      const prereqs = skill?.prerequisites ?? [];
      if (prereqs.every((p) => mastered.has(p))) {
        list.push(sid);
      }
    }
    return list.sort();
  };

  const heuristic = (mastered: Set<string>): number => {
    let remainingHours = 0;
    for (const s of needed) {
      if (!mastered.has(s)) {
        const d = skillTierDifficulty(depthMap.get(s) ?? 0);
        remainingHours += (TIER_HOURS[d] ?? 10.0) * 0.5;
      }
    }
    return weights.time * remainingHours;
  };

  interface AStarNode {
    f: number;
    g: number;
    mastered: Set<string>;
    order: string[];
  }

  const setKey = (s: Set<string>) => Array.from(s).sort().join(",");
  const startMastered = new Set(already);
  const frontier = new PriorityQueue<AStarNode>();
  frontier.push({ f: 0, g: 0, mastered: startMastered, order: [] }, 0);

  const bestG = new Map<string, number>();
  bestG.set(setKey(startMastered), 0);
  let expansions = 0;

  while (frontier.length > 0 && expansions < MAX_EXPANSIONS) {
    const node = frontier.pop()!;
    let allNeededMastered = true;
    for (const n of needed) {
      if (!node.mastered.has(n)) {
        allNeededMastered = false;
        break;
      }
    }
    if (allNeededMastered) {
      return node.order;
    }

    const currentKey = setKey(node.mastered);
    if (node.g > (bestG.get(currentKey) ?? Infinity)) {
      continue;
    }
    expansions++;

    const candidates = learnable(node.mastered);
    for (const sid of candidates) {
      const step = computeStepCost(sid, masteryBySkill, depthMap, weights);
      const newMastered = new Set(node.mastered);
      newMastered.add(sid);
      const newG = node.g + step;
      const nextKey = setKey(newMastered);

      if (newG < (bestG.get(nextKey) ?? Infinity)) {
        bestG.set(nextKey, newG);
        const f = newG + heuristic(newMastered);
        frontier.push(
          {
            f,
            g: newG,
            mastered: newMastered,
            order: [...node.order, sid],
          },
          f
        );
      }
    }
  }

  return greedyOrder(needed, already, masteryBySkill, depthMap, weights);
}

