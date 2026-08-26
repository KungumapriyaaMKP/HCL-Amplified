import { SKILLS_BY_ID } from "@/data/skills";

export type DecayTier = "fresh" | "fading" | "decayed";

/** Thresholds are in days since the skill's mastery was last touched
 * (via a diagnostic, practice, or proctored score) - not since it was
 * first learned. A skill practiced yesterday is "fresh" no matter how
 * long ago it was originally mastered. */
export function decayTierFor(daysSince: number): DecayTier {
  if (daysSince < 7) return "fresh";
  if (daysSince < 21) return "fading";
  return "decayed";
}

export type SkillDecay = {
  skillId: string;
  name: string;
  score: number;
  daysSince: number;
  tier: DecayTier;
  foundational: boolean;
};

/** Skill-decay heatmap data: every skill the learner has actually touched
 * (score > 0 - untouched skills have nothing to decay), tiered by how long
 * it's been since that mastery was last reinforced. */
export function computeSkillDecay(
  rows: { skillId: string; score: number; name: string; updatedAt: Date }[],
): SkillDecay[] {
  const now = Date.now();
  return rows
    .filter((r) => r.score > 0)
    .map((r) => {
      const daysSince = Math.floor((now - new Date(r.updatedAt).getTime()) / 86_400_000);
      const skill = SKILLS_BY_ID.get(r.skillId);
      return {
        skillId: r.skillId,
        name: r.name,
        score: r.score,
        daysSince,
        tier: decayTierFor(daysSince),
        foundational: (skill?.prerequisites.length ?? 1) === 0,
      };
    })
    .sort((a, b) => b.daysSince - a.daysSince);
}
