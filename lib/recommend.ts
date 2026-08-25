import { skillVector } from "@/lib/embeddings";
import { SKILLS_BY_ID } from "@/data/skills";

export type CandidateResource = {
  id: string;
  title: string;
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

function interestOverlap(resource: CandidateResource, interestSkillIds: string[]): number {
  if (interestSkillIds.length === 0) return 0.5; // neutral when we don't know interests yet
  const resourceSkills = Object.keys(resource.skillWeights);
  const overlap = resourceSkills.filter((s) => interestSkillIds.includes(s)).length;
  return Math.min(1, overlap / Math.max(1, interestSkillIds.length));
}

export type ScoredResource = CandidateResource & {
  score: number;
  scoreBreakdown: { cosineSim: number; prereqReadiness: number; difficultyFit: number; interestOverlap: number; ratingNorm: number };
};

/**
 * Content-based recommendation with weighted ranking: blends embedding
 * cosine similarity with prerequisite readiness, difficulty fit, interest
 * overlap and rating into a single score. This is what actually orders
 * resources within a path module, and what the adaptation engine re-runs
 * after feedback changes `difficultyBias`.
 */
export function rankResources(candidates: CandidateResource[], ctx: RankingContext): ScoredResource[] {
  const targetVector = skillVector({
    [ctx.targetSkillId]: 1,
    ...Object.fromEntries(ctx.interestSkillIds.map((id) => [id, 0.3])),
  });

  const weights = { cosineSim: 0.4, prereqReadiness: 0.15, difficultyFit: 0.15, interestOverlap: 0.15, rating: 0.15 };

  const scored = candidates.map((resource) => {
    const resourceVector = skillVector(resource.skillWeights);
    const cosineSim = cosineSimilarity(targetVector, resourceVector);
    const prereq = prereqReadiness(ctx.targetSkillId, ctx.masteryBySkill);
    const diffFit = difficultyFit(resource, ctx.targetSkillId, ctx.masteryBySkill, ctx.difficultyBias);
    const interest = interestOverlap(resource, ctx.interestSkillIds);
    const ratingNorm = resource.rating / 5;

    const score =
      weights.cosineSim * cosineSim +
      weights.prereqReadiness * prereq +
      weights.difficultyFit * diffFit +
      weights.interestOverlap * interest +
      weights.rating * ratingNorm;

    return {
      ...resource,
      score,
      scoreBreakdown: { cosineSim, prereqReadiness: prereq, difficultyFit: diffFit, interestOverlap: interest, ratingNorm },
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
