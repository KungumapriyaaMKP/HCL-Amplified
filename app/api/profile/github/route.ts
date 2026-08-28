import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { profiles, skillMastery } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { fetchGitHubProfile } from "@/lib/github";
import { SKILLS_BY_ID } from "@/data/skills";

const CONFIDENCE_SCORE = { low: 45, medium: 60, high: 75 };

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { username } = (await req.json()) as { username?: string };

    if (!username || !username.trim()) {
      return jsonError("GitHub username is required", 400);
    }

    const githubResult = await fetchGitHubProfile(username);
    if (!githubResult) {
      return jsonError("Could not fetch public GitHub profile for that username", 404);
    }

    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
    const currentResumeProfile = (profile?.resumeProfile ?? {}) as Record<string, unknown>;

    // Additively store github profile findings
    const updatedResumeProfile = {
      ...currentResumeProfile,
      githubProfile: githubResult,
    };

    await db
      .update(profiles)
      .set({ resumeProfile: updatedResumeProfile })
      .where(eq(profiles.userId, user.id));

    // Seed mastery for newly discovered skills if no stronger mastery exists
    const validSkillIds = githubResult.discoveredSkills
      .filter((s) => SKILLS_BY_ID.has(s.skillId))
      .map((s) => s.skillId);

    let seededCount = 0;
    if (validSkillIds.length > 0) {
      const existing = await db
        .select({ skillId: skillMastery.skillId })
        .from(skillMastery)
        .where(and(eq(skillMastery.userId, user.id), inArray(skillMastery.skillId, validSkillIds)));
      const existingIds = new Set(existing.map((r) => r.skillId));

      for (const s of githubResult.discoveredSkills) {
        if (!SKILLS_BY_ID.has(s.skillId) || existingIds.has(s.skillId)) continue;
        await db.insert(skillMastery).values({
          userId: user.id,
          skillId: s.skillId,
          score: CONFIDENCE_SCORE[s.confidence] ?? 50,
          source: "github",
        });
        seededCount++;
      }
    }

    return NextResponse.json({
      githubResult,
      seededCount,
    });
  });
}
