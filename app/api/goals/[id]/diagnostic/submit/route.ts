import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { goals, diagnosticAttempts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { upsertMastery } from "@/lib/adapt";
import { touchStreak } from "@/lib/gamification";

type StoredQuestion = { id: string; skillId: string; correctIndex: number };
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

    const bySkill = new Map<string, { correct: number; total: number }>();
    for (const q of questions) {
      const entry = bySkill.get(q.skillId) ?? { correct: 0, total: 0 };
      entry.total++;
      if (answerMap.get(q.id) === q.correctIndex) entry.correct++;
      bySkill.set(q.skillId, entry);
    }

    let totalCorrect = 0;
    for (const [skillId, { correct, total }] of bySkill) {
      const score = Math.round((correct / total) * 100);
      totalCorrect += correct;
      await upsertMastery(user.id, skillId, score, "diagnostic");
    }
    const overallScore = Math.round((totalCorrect / questions.length) * 100);

    await db
      .update(diagnosticAttempts)
      .set({ answers, score: overallScore })
      .where(eq(diagnosticAttempts.id, attemptId));
    await db.update(goals).set({ status: "ready" }).where(eq(goals.id, id));
    await touchStreak(user.id);

    return NextResponse.json({
      score: overallScore,
      bySkill: Object.fromEntries([...bySkill.entries()].map(([k, v]) => [k, Math.round((v.correct / v.total) * 100)])),
    });
  });
}
