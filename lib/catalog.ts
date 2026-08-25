import { db } from "@/lib/db";
import { resources, resourceSkills } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { CandidateResource } from "@/lib/recommend";

/** All resources joined with the skills they teach, shaped for the ranking
 * engine. Shared by path generation and the adaptation engine so both rank
 * against the exact same pool (internal + curated + live Microsoft Learn). */
export async function getCandidatePool(): Promise<CandidateResource[]> {
  const rows = await db
    .select({
      id: resources.id,
      title: resources.title,
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
  for (const r of rows) {
    if (!byId.has(r.id)) {
      byId.set(r.id, {
        id: r.id,
        title: r.title,
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
  }
  return [...byId.values()];
}
