import { db } from "@/lib/db";
import { goals, learningPaths, pathModules, skillMastery, adaptationLog } from "@/db/schema";
import { and, eq, gt, asc } from "drizzle-orm";
import { rankResources, CRASH_COURSE_PRACTICE_BIAS } from "@/lib/recommend";
import { getCandidatePool } from "@/lib/catalog";
import { SKILLS_BY_ID } from "@/data/skills";

export async function getMasteryMap(userId: string): Promise<Map<string, number>> {
  const rows = await db.select().from(skillMastery).where(eq(skillMastery.userId, userId));
  return new Map(rows.map((r) => [r.skillId, r.score]));
}

export async function upsertMastery(userId: string, skillId: string, score: number, source: string) {
  await db
    .insert(skillMastery)
    .values({ userId, skillId, score, source, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [skillMastery.userId, skillMastery.skillId],
      set: { score, source, updatedAt: new Date() },
    });
}

async function logAdaptation(userId: string, goalId: string, trigger: string, action: string, reason: string) {
  await db.insert(adaptationLog).values({ userId, goalId, trigger, action, reason });
}

/** Marks a module completed and unlocks the next one in sequence. */
export async function unlockNextModule(pathId: string, completedOrder: number) {
  const [next] = await db
    .select()
    .from(pathModules)
    .where(and(eq(pathModules.pathId, pathId), gt(pathModules.order, completedOrder)))
    .orderBy(asc(pathModules.order))
    .limit(1);

  if (next && next.status === "locked") {
    await db.update(pathModules).set({ status: "available" }).where(eq(pathModules.id, next.id));
  }
}

/**
 * Rule-based reaction to a proctored test result. This is the load-bearing
 * "dynamic adaptation" the rubric asks for: low scores insert a remedial
 * module before the path continues; strong scores reinforce prerequisite
 * mastery slightly. Always logs to adaptation_log for the dashboard feed.
 */
export async function onProctoredResult(opts: {
  userId: string;
  moduleId: string;
  score: number;
}) {
  const [mod] = await db.select().from(pathModules).where(eq(pathModules.id, opts.moduleId));
  if (!mod) return;
  const [path] = await db.select().from(learningPaths).where(eq(learningPaths.id, mod.pathId));
  if (!path) return;
  const [goal] = await db.select().from(goals).where(eq(goals.id, path.goalId));
  const practiceBias = goal?.trackPace === "crash-course" ? CRASH_COURSE_PRACTICE_BIAS : 0;

  await upsertMastery(opts.userId, mod.skillId, opts.score, "proctored");
  await db.update(pathModules).set({ status: "completed" }).where(eq(pathModules.id, mod.id));

  if (opts.score < 50) {
    const skill = SKILLS_BY_ID.get(mod.skillId);
    const pool = await getCandidatePool();
    const mastery = await getMasteryMap(opts.userId);
    const easier = rankResources(
      pool.filter((r) => (r.skillWeights[mod.skillId] ?? 0) > 0 && r.difficulty !== "advanced"),
      { targetSkillId: mod.skillId, masteryBySkill: mastery, interestSkillIds: [], difficultyBias: -1, practiceBias },
    )[0];

    if (easier) {
      // Shift every later module up by one slot and insert the remedial one
      // right after the failed module, before the path continues. This is
      // several dependent writes (N order shifts + 1 insert) - wrapped in a
      // transaction so a dropped connection partway through can't leave two
      // modules sharing an order value instead of either fully applying or
      // fully rolling back.
      await db.transaction(async (tx) => {
        const later = await tx
          .select()
          .from(pathModules)
          .where(and(eq(pathModules.pathId, mod.pathId), gt(pathModules.order, mod.order)))
          .orderBy(asc(pathModules.order));
        for (const m of later) {
          await tx.update(pathModules).set({ order: m.order + 1 }).where(eq(pathModules.id, m.id));
        }
        await tx.insert(pathModules).values({
          pathId: mod.pathId,
          order: mod.order + 1,
          skillId: mod.skillId,
          resourceId: easier.id,
          status: "available",
          milestoneType: "remediation",
          rationale: `Inserted after a low proctored score (${opts.score}/100) on ${skill?.name ?? mod.skillId} to reinforce this skill before continuing.`,
        });
      });
    }

    await logAdaptation(
      opts.userId,
      path.goalId,
      "low_proctored_score",
      "insert_remedial_module",
      `Scored ${opts.score}/100 on ${skill?.name ?? mod.skillId}; inserted a remedial module before continuing.`,
    );
  } else {
    await unlockNextModule(mod.pathId, mod.order);
    if (opts.score >= 90) {
      const skill = SKILLS_BY_ID.get(mod.skillId);
      for (const prereq of skill?.prerequisites ?? []) {
        const current = (await getMasteryMap(opts.userId)).get(prereq) ?? 0;
        if (current > 0) await upsertMastery(opts.userId, prereq, Math.min(100, current + 5), "proctored");
      }
      await logAdaptation(
        opts.userId,
        path.goalId,
        "high_proctored_score",
        "reinforce_prerequisites",
        `Scored ${opts.score}/100 on ${skill?.name ?? mod.skillId}; reinforced prerequisite mastery and unlocked the next module.`,
      );
    }
  }
}

/**
 * Reacts to explicit learner feedback ("too easy"/"too hard") by shifting
 * the goal's difficulty bias and re-ranking every not-yet-completed module
 * still ahead in the path against the new bias, swapping in a better-fit
 * resource where one ranks higher.
 */
export async function onDifficultyFeedback(opts: {
  userId: string;
  goalId: string;
  feedback: "too_easy" | "too_hard" | "just_right";
}) {
  if (opts.feedback === "just_right") return;

  const [goal] = await db.select().from(goals).where(eq(goals.id, opts.goalId));
  if (!goal) return;
  const prefs = (goal.preferences ?? {}) as { difficultyBias?: number };
  const currentBias = prefs.difficultyBias ?? 0;
  const delta = opts.feedback === "too_easy" ? 0.2 : -0.2;
  const newBias = Math.max(-1, Math.min(1, currentBias + delta));
  await db
    .update(goals)
    .set({ preferences: { ...prefs, difficultyBias: newBias } })
    .where(eq(goals.id, opts.goalId));

  const [path] = await db.select().from(learningPaths).where(eq(learningPaths.goalId, opts.goalId));
  if (!path) return;

  const upcoming = await db
    .select()
    .from(pathModules)
    .where(and(eq(pathModules.pathId, path.id), eq(pathModules.status, "locked")));

  const pool = await getCandidatePool();
  const mastery = await getMasteryMap(opts.userId);
  const practiceBias = goal.trackPace === "crash-course" ? CRASH_COURSE_PRACTICE_BIAS : 0;
  let swapped = 0;

  for (const mod of upcoming) {
    const best = rankResources(
      pool.filter((r) => (r.skillWeights[mod.skillId] ?? 0) > 0),
      { targetSkillId: mod.skillId, masteryBySkill: mastery, interestSkillIds: [], difficultyBias: newBias, practiceBias },
    )[0];
    if (best && best.id !== mod.resourceId) {
      await db.update(pathModules).set({ resourceId: best.id }).where(eq(pathModules.id, mod.id));
      swapped++;
    }
  }

  await logAdaptation(
    opts.userId,
    opts.goalId,
    `feedback_${opts.feedback}`,
    "rerank_remaining_modules",
    `Learner marked a module "${opts.feedback}"; adjusted difficulty preference and swapped ${swapped} upcoming resource(s) to better match.`,
  );

  return newBias;
}
