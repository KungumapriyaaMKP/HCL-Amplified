import { db } from "@/lib/db";
import { resources, resourceSkills } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { CandidateResource } from "@/lib/recommend";
import { SKILLS } from "@/data/skills";
import { generateYouTubeFallback } from "@/lib/external/youtubeFallback";

/** All resources joined with the skills they teach, shaped for the ranking
 * engine. Shared by path generation and the adaptation engine so both rank
 * against the exact same pool (internal + curated + live Microsoft Learn + guaranteed YouTube fallbacks). */
export async function getCandidatePool(): Promise<CandidateResource[]> {
  const rows = await db
    .select({
      id: resources.id,
      title: resources.title,
      description: resources.description,
      type: resources.type,
      provider: resources.provider,
      source: resources.source,
      url: resources.url,
      difficulty: resources.difficulty,
      rating: resources.rating,
      estimatedMinutes: resources.estimatedMinutes,
      skillId: resourceSkills.skillId,
      weight: resourceSkills.weight,
    })
    .from(resources)
    .innerJoin(resourceSkills, eq(resourceSkills.resourceId, resources.id));

  const byId = new Map<string, CandidateResource>();
  const countBySkill = new Map<string, number>();

  for (const r of rows) {
    if (!byId.has(r.id)) {
      byId.set(r.id, {
        id: r.id,
        title: r.title,
        description: r.description,
        type: r.type,
        provider: r.provider,
        source: r.source,
        url: r.url,
        difficulty: r.difficulty as CandidateResource["difficulty"],
        rating: r.rating,
        estimatedMinutes: r.estimatedMinutes,
        skillWeights: {},
      });
    }
    byId.get(r.id)!.skillWeights[r.skillId] = r.weight;
    countBySkill.set(r.skillId, (countBySkill.get(r.skillId) ?? 0) + 1);
  }

  // Guaranteed fallback: inject deterministic YouTube candidates for any skill with < 2 candidates
  for (const skill of SKILLS) {
    if ((countBySkill.get(skill.id) ?? 0) < 2) {
      const fallback = generateYouTubeFallback(skill.id, skill.name);
      if (!byId.has(fallback.id)) {
        byId.set(fallback.id, fallback);
      }
    }
  }

  return [...byId.values()];
}
