import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { goals, learningPaths, pathModules } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { DOMAINS, TRACK_PACES } from "@/data/domains";

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const rows = await db
      .select({
        goal: goals,
        pathId: learningPaths.id,
        total: sql<number>`count(${pathModules.id})`,
        completed: sql<number>`count(${pathModules.id}) filter (where ${pathModules.status} = 'completed')`,
      })
      .from(goals)
      .leftJoin(learningPaths, eq(learningPaths.goalId, goals.id))
      .leftJoin(pathModules, eq(pathModules.pathId, learningPaths.id))
      .where(eq(goals.userId, user.id))
      .groupBy(goals.id, learningPaths.id)
      .orderBy(desc(goals.createdAt));

    return NextResponse.json({
      goals: rows.map((r) => ({
        ...r.goal,
        pathId: r.pathId,
        totalModules: Number(r.total),
        completedModules: Number(r.completed),
      })),
    });
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const body = await req.json();
    const { domain, trackPace, goalText } = body as { domain: string; trackPace: string; goalText: string };

    if (!DOMAINS.some((d) => d.id === domain)) return jsonError("Invalid domain");
    if (!TRACK_PACES.some((t) => t.id === trackPace)) return jsonError("Invalid track pace");
    if (!goalText || goalText.trim().length < 3) return jsonError("Describe your goal in a bit more detail");
    if (goalText.length > 500) return jsonError("Goal description must be 500 characters or fewer");

    const [goal] = await db
      .insert(goals)
      .values({ userId: user.id, domain, trackPace, goalText: goalText.trim(), status: "intake" })
      .returning();

    return NextResponse.json({ goal });
  });
}
