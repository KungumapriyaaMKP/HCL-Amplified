import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { goals } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getMasteryMap } from "@/lib/adapt";
import { resolveGoalSkills } from "@/lib/skillGraph";
import { simulateWhatIfBranch } from "@/lib/whatif";
import { TRACK_PACES } from "@/data/domains";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const { targetDomain, targetRole } = (await req.json()) as {
      targetDomain?: string;
      targetRole?: string;
    };

    if (!targetDomain || !targetRole) {
      return jsonError("targetDomain and targetRole are required", 400);
    }

    const [goal] = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, user.id)));
    if (!goal) return jsonError("Goal not found", 404);

    const subFocus = (goal.subFocus ?? {}) as { tags?: string[]; mappedSkillIds?: string[] };
    const currentGoalSkillIds = resolveGoalSkills(
      goal.domain,
      goal.goalText,
      subFocus.tags ?? []
    );

    const mastery = await getMasteryMap(user.id);
    const paceObj = TRACK_PACES.find((p) => p.id === goal.trackPace);
    const hoursPerWeek = paceObj?.hoursPerWeek ?? 8;

    const comparison = simulateWhatIfBranch({
      currentDomain: goal.domain,
      currentGoalText: goal.goalText,
      currentGoalSkillIds,
      targetDomain,
      targetRole,
      masteryBySkill: mastery,
      hoursPerWeek,
    });

    return NextResponse.json({ comparison });
  });
}
