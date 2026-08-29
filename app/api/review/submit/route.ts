import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { reviewSchedule, skillMastery, adaptationLog, goals } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { calculateNextReview, ReviewGrade } from "@/lib/review";
import { estimateTheta, IRTItemResponse } from "@/lib/irt";
import { awardXp, touchStreak, awardBadgeIfNew } from "@/lib/gamification";

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));

    const skillId = typeof body.skillId === "string" ? body.skillId : null;
    const grade = (body.grade as ReviewGrade) || "good";
    const responses = Array.isArray(body.responses) ? body.responses : [];

    if (!skillId) {
      return jsonError("Skill ID is required", 400);
    }

    // 1. Compute 2PL-IRT ability estimate
    const irtItems: IRTItemResponse[] = responses.map((r) => ({
      a: 1.0,
      b: 0.0,
      correct: !!r.correct,
    }));
    const estimate = estimateTheta(irtItems);

    // 2. Upsert skill_mastery with refreshed timestamp (resets decay)
    const existingMastery = await db
      .select()
      .from(skillMastery)
      .where(and(eq(skillMastery.userId, user.id), eq(skillMastery.skillId, skillId)));

    const finalScore = Math.max(existingMastery[0]?.score || 0, estimate.score);

    if (existingMastery.length > 0) {
      await db
        .update(skillMastery)
        .set({
          score: finalScore,
          theta: estimate.theta,
          standardError: estimate.standardError,
          source: "practice",
          updatedAt: new Date(),
        })
        .where(and(eq(skillMastery.userId, user.id), eq(skillMastery.skillId, skillId)));
    } else {
      await db
        .insert(skillMastery)
        .values({
          userId: user.id,
          skillId,
          score: finalScore,
          theta: estimate.theta,
          standardError: estimate.standardError,
          source: "practice",
          updatedAt: new Date(),
        })
        .onConflictDoNothing();
    }

    // 3. Update SM-2 review schedule
    const [currentSched] = await db
      .select()
      .from(reviewSchedule)
      .where(and(eq(reviewSchedule.userId, user.id), eq(reviewSchedule.skillId, skillId)));

    const nextSched = calculateNextReview(
      currentSched || { intervalDays: 1, ease: 2.5, reps: 0 },
      grade
    );

    if (currentSched) {
      await db
        .update(reviewSchedule)
        .set({
          dueAt: nextSched.dueAt,
          intervalDays: nextSched.intervalDays,
          ease: nextSched.ease,
          reps: nextSched.reps,
          lastReviewedAt: new Date(),
        })
        .where(and(eq(reviewSchedule.userId, user.id), eq(reviewSchedule.skillId, skillId)));
    } else {
      await db
        .insert(reviewSchedule)
        .values({
          userId: user.id,
          skillId,
          dueAt: nextSched.dueAt,
          intervalDays: nextSched.intervalDays,
          ease: nextSched.ease,
          reps: nextSched.reps,
          lastReviewedAt: new Date(),
        })
        .onConflictDoNothing();
    }

    // 4. Award XP and touch streak
    const correctCount = responses.filter((r) => r.correct).length;
    const xpEarned = correctCount * 4 + 5;
    await awardXp(user.id, xpEarned, `Spaced review: ${skillId}`);
    const streak = await touchStreak(user.id);

    // 5. Log adaptation event if an active goal exists
    const [activeGoal] = await db
      .select({ id: goals.id })
      .from(goals)
      .where(eq(goals.userId, user.id))
      .limit(1);

    if (activeGoal) {
      await db.insert(adaptationLog).values({
        userId: user.id,
        goalId: activeGoal.id,
        trigger: "spaced_repetition",
        action: "refreshed_decay",
        reason: `Mastery for ${skillId} reinforced via spaced review (score: ${finalScore}%, next interval: ${nextSched.intervalDays}d)`,
      });
    }

    // 6. Check review badge
    const [revCount] = await db
      .select({ total: sql<number>`count(*)` })
      .from(reviewSchedule)
      .where(and(eq(reviewSchedule.userId, user.id), sql`${reviewSchedule.reps} > 0`));

    if (Number(revCount?.total || 0) >= 10) {
      await awardBadgeIfNew(user.id, "review_rigor");
    }

    return NextResponse.json({
      success: true,
      updatedMastery: finalScore,
      nextDue: nextSched.dueAt,
      xpEarned,
      streak,
    });
  });
}
