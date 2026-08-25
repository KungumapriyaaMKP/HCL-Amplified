import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { practiceAttempts, skillMastery } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getModuleForUser } from "@/lib/moduleAccess";
import { upsertMastery } from "@/lib/adapt";
import { awardXp, awardBadgeIfNew, touchStreak, XP } from "@/lib/gamification";

type StoredQuestion = { id: string; correctIndex: number; explanation: string };
type Answer = { id: string; selectedIndex: number };

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const { attemptId, answers } = (await req.json()) as { attemptId: string; answers: Answer[] };

    const row = await getModuleForUser(user.id, id);
    if (!row) return jsonError("Not found", 404);

    const [attempt] = await db
      .select()
      .from(practiceAttempts)
      .where(and(eq(practiceAttempts.id, attemptId), eq(practiceAttempts.userId, user.id)));
    if (!attempt) return jsonError("Practice attempt not found", 404);

    const questions = attempt.questions as StoredQuestion[];
    const answerMap = new Map(answers.map((a) => [a.id, a.selectedIndex]));
    const correctCount = questions.filter((q) => answerMap.get(q.id) === q.correctIndex).length;
    const score = Math.round((correctCount / questions.length) * 100);

    await db.update(practiceAttempts).set({ answers, score }).where(eq(practiceAttempts.id, attemptId));

    const [existingMastery] = await db
      .select()
      .from(skillMastery)
      .where(and(eq(skillMastery.userId, user.id), eq(skillMastery.skillId, row.skill.id)));
    if (!existingMastery || existingMastery.source !== "proctored") {
      await upsertMastery(user.id, row.skill.id, score, "practice");
    }

    await awardXp(user.id, correctCount * XP.PRACTICE_QUIZ_CORRECT_ANSWER, "Practice quiz answers");
    let quizWhiz = false;
    if (score === 100) {
      await awardXp(user.id, XP.PRACTICE_QUIZ_PERFECT_BONUS, "Perfect practice quiz");
      quizWhiz = await awardBadgeIfNew(user.id, "quiz_whiz");
    }
    await touchStreak(user.id);

    const explanations = questions.map((q) => ({
      id: q.id,
      correctIndex: q.correctIndex,
      selectedIndex: answerMap.get(q.id) ?? null,
      explanation: q.explanation,
    }));

    return NextResponse.json({ score, correctCount, total: questions.length, explanations, badgesAwarded: quizWhiz ? ["quiz_whiz"] : [] });
  });
}
