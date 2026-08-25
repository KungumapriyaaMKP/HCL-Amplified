import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { pathModules, progressEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getModuleForUser } from "@/lib/moduleAccess";
import { onDifficultyFeedback } from "@/lib/adapt";
import { awardXp, touchStreak, XP } from "@/lib/gamification";

type Body = {
  type: "started" | "resource_done" | "feedback";
  feedback?: "too_easy" | "too_hard" | "just_right";
  comment?: string;
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const body = (await req.json()) as Body;

    const row = await getModuleForUser(user.id, id);
    if (!row) return jsonError("Not found", 404);

    await db.insert(progressEvents).values({
      userId: user.id,
      moduleId: id,
      type: body.type,
      payload: { feedback: body.feedback, comment: body.comment },
    });
    await touchStreak(user.id);

    if (body.type === "started" && row.module.status === "available") {
      await db.update(pathModules).set({ status: "in_progress" }).where(eq(pathModules.id, id));
      await awardXp(user.id, XP.MODULE_STARTED, "Started a module");
    }

    if (body.type === "resource_done") {
      await awardXp(user.id, 5, "Finished a module's resource");
    }

    let newDifficultyBias: number | undefined;
    if (body.type === "feedback" && body.feedback) {
      newDifficultyBias = await onDifficultyFeedback({ userId: user.id, goalId: row.goal.id, feedback: body.feedback });
    }

    return NextResponse.json({ ok: true, newDifficultyBias });
  });
}
