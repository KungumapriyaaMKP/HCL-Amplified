import { SKILLS } from "@/data/skills";

// Fixed dimension order shared by every vector in the app - resource
// skill-vectors, the learner's gap vector, and the learner's interest
// vector are all dense arrays over this same skill-id space, which is what
// makes cosine similarity between them meaningful (lib/recommend.ts).
const DIMENSIONS = SKILLS.map((s) => s.id);
const INDEX = new Map(DIMENSIONS.map((id, i) => [id, i]));

export function dimensionCount(): number {
  return DIMENSIONS.length;
}

/** Builds a dense embedding vector from a sparse {skillId: weight} map. */
export function skillVector(weights: Record<string, number> | Map<string, number>): number[] {
  const vec = new Array(DIMENSIONS.length).fill(0);
  const entries = weights instanceof Map ? weights.entries() : Object.entries(weights);
  for (const [skillId, weight] of entries) {
    const idx = INDEX.get(skillId);
    if (idx !== undefined) vec[idx] = weight;
  }
  return vec;
}

export function addVectors(a: number[], b: number[]): number[] {
  return a.map((v, i) => v + (b[i] ?? 0));
}

export function scaleVector(a: number[], scalar: number): number[] {
  return a.map((v) => v * scalar);
}
