import type { CandidateResource } from "@/lib/recommend";
import { SKILLS_BY_ID } from "@/data/skills";

/**
 * Generates a deterministic, always-available zero-cost YouTube video fallback resource
 * for any skill to guarantee no empty recommendation sets.
 */
export function generateYouTubeFallback(skillId: string, skillName?: string): CandidateResource {
  const name = skillName || SKILLS_BY_ID.get(skillId)?.name || skillId;
  const query = encodeURIComponent(`${name} full course tutorial`);

  return {
    id: `yt-fallback-${skillId}`,
    title: `${name} | Video Tutorials & Course Walkthrough (YouTube)`,
    description: `Curated free video tutorials and full comprehensive guides for mastering ${name}.`,
    type: "video",
    provider: "YouTube",
    source: "curated",
    url: `https://www.youtube.com/results?search_query=${query}`,
    difficulty: "intermediate",
    rating: 4.6,
    estimatedMinutes: 180,
    skillWeights: { [skillId]: 1.0 },
  };
}
