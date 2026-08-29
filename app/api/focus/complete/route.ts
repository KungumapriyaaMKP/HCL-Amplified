import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { focusSessions, learningEvents, pathModules, resources } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { awardXp, touchStreak, awardBadgeIfNew } from "@/lib/gamification";

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));

    const sessionId = body.sessionId;
    if (!sessionId) {
      return jsonError("Session ID is required", 400);
    }

    const actualSeconds = Number(body.actualSeconds) || 0;
    const interruptions = Number(body.interruptions) || 0;

    const [session] = await db
      .update(focusSessions)
      .set({
        actualSeconds,
        interruptions,
        completed: true,
        endedAt: new Date(),
      })
      .where(and(eq(focusSessions.id, sessionId), eq(focusSessions.userId, user.id)))
      .returning();

    if (!session) {
      return jsonError("Focus session not found", 404);
    }

    // Determine modality if linked to a module
    let modality = "course";
    if (session.moduleId) {
      const [mod] = await db
        .select({ type: resources.type })
        .from(pathModules)
        .innerJoin(resources, eq(resources.id, pathModules.resourceId))
        .where(eq(pathModules.id, session.moduleId));
      if (mod?.type) modality = mod.type;
    }

    // Record learning event for velocity / EMA
    await db.insert(learningEvents).values({
      userId: user.id,
      moduleId: session.moduleId,
      eventType: "focus",
      modality,
      timeSpentSeconds: actualSeconds,
      estimatedSeconds: session.plannedSeconds,
    });

    // Award XP and update streak
    const xpEarned = 10;
    await awardXp(user.id, xpEarned, "Completed focus session");
    const streakResult = await touchStreak(user.id);

    // Check badges
    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(focusSessions)
      .where(and(eq(focusSessions.userId, user.id), eq(focusSessions.completed, true)));
    
    const completedCount = Number(countRow?.count || 0);
    if (completedCount >= 5) {
      await awardBadgeIfNew(user.id, "deep_work");
    }

    // Perfect 25-min session badge
    if (actualSeconds >= 1500 && interruptions === 0) {
      await awardBadgeIfNew(user.id, "focus_master");
    }

    const integrity = Math.max(0, 100 - interruptions * 5);

    return NextResponse.json({
      session,
      xpEarned,
      integrity,
      streak: streakResult,
    });
  });
}
