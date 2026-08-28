import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { goals, diagnosticAttempts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { upsertMastery } from "@/lib/adapt";
import { touchStreak } from "@/lib/gamification";
import { estimateTheta, type IRTItemResponse } from "@/lib/irt";

type StoredQuestion = { id: string; skillId: string; correctIndex: number; a?: number; b?: number };
type Answer = { id: string; selectedIndex: number };

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const { attemptId, answers } = (await req.json()) as { attemptId: string; answers: Answer[] };

    const [goal] = await db.select().from(goals).where(and(eq(goals.id, id), eq(goals.userId, user.id)));
    if (!goal) return jsonError("Not found", 404);

    const [attempt] = await db
      .select()
      .from(diagnosticAttempts)
      .where(and(eq(diagnosticAttempts.id, attemptId), eq(diagnosticAttempts.userId, user.id)));
    if (!attempt) return jsonError("Diagnostic attempt not found", 404);

    const questions = attempt.questions as StoredQuestion[];
    const answerMap = new Map(answers.map((a) => [a.id, a.selectedIndex]));

    const responses: IRTItemResponse[] = questions.map((q) => ({
      a: q.a ?? 1.0,
      b: q.b ?? 0.0,
      correct: answerMap.get(q.id) === q.correctIndex,
    }));
    const overallEstimate = estimateTheta(responses);

    const distinctSkillIds = Array.from(new Set(questions.map((q) => q.skillId)));
    const bySkillScores: Record<string, number> = {};

    for (const skillId of distinctSkillIds) {
      const skillResponses: IRTItemResponse[] = questions
        .filter((q) => q.skillId === skillId)
        .map((q) => ({
          a: q.a ?? 1.0,
          b: q.b ?? 0.0,
          correct: answerMap.get(q.id) === q.correctIndex,
        }));
      const skillEstimate = estimateTheta(skillResponses);
      bySkillScores[skillId] = skillEstimate.score;
      await upsertMastery(user.id, skillId, skillEstimate.score, "diagnostic");
    }

    await db
      .update(diagnosticAttempts)
      .set({
        answers,
        score: overallEstimate.score,
        theta: overallEstimate.theta,
        standardError: overallEstimate.standardError,
      })
      .where(eq(diagnosticAttempts.id, attemptId));

    await db.update(goals).set({ status: "ready" }).where(eq(goals.id, id));
    await touchStreak(user.id);

    return NextResponse.json({
      score: overallEstimate.score,
      theta: overallEstimate.theta,
      standardError: overallEstimate.standardError,
      bySkill: bySkillScores,
    });
  });
}
