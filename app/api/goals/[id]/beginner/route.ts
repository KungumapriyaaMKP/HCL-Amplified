import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { goals } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { foundationalSkillsForDomain } from "@/lib/skillGraph";
import { upsertMastery } from "@/lib/adapt";

const BEGINNER_BASELINE = 15;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const { beginnerDeclared } = (await req.json()) as { beginnerDeclared: boolean };

    const [goal] = await db.select().from(goals).where(and(eq(goals.id, id), eq(goals.userId, user.id)));
    if (!goal) return jsonError("Not found", 404);

    if (beginnerDeclared) {
      for (const skillId of foundationalSkillsForDomain(goal.domain)) {
        await upsertMastery(user.id, skillId, BEGINNER_BASELINE, "stated");
      }
    }

    await db
      .update(goals)
      .set({ beginnerDeclared, status: beginnerDeclared ? "ready" : "diagnostic" })
      .where(eq(goals.id, id));

    return NextResponse.json({ nextStep: beginnerDeclared ? "ready" : "diagnostic" });
  });
}
