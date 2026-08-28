import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { practiceAttempts, skillMastery, learningEvents } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getModuleForUser } from "@/lib/moduleAccess";
import { upsertMastery, updatePreferenceScore } from "@/lib/adapt";
import { awardXp, awardBadgeIfNew, touchStreak, XP } from "@/lib/gamification";
import { estimateTheta, type IRTItemResponse } from "@/lib/irt";

type StoredQuestion = { id: string; correctIndex: number; explanation: string; a?: number; b?: number };
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

    const responses: IRTItemResponse[] = questions.map((q) => ({
      a: q.a ?? 1.0,
      b: q.b ?? 0.0,
      correct: answerMap.get(q.id) === q.correctIndex,
    }));
    const estimate = estimateTheta(responses);
    const score = estimate.score;

    await db
      .update(practiceAttempts)
      .set({
        answers,
        score,
        theta: estimate.theta,
        standardError: estimate.standardError,
      })
      .where(eq(practiceAttempts.id, attemptId));

    await db.insert(learningEvents).values({
      userId: user.id,
      moduleId: id,
      eventType: "quiz_submit",
      modality: "assessment",
    });
    await updatePreferenceScore(user.id, "assessment", score / 100);

    const [existingMastery] = await db
      .select()
      .from(skillMastery)
      .where(and(eq(skillMastery.userId, user.id), eq(skillMastery.skillId, row.skill.id)));
    if (!existingMastery || existingMastery.source !== "proctored") {
      await upsertMastery(user.id, row.skill.id, score, "practice");
    }

    await awardXp(user.id, correctCount * XP.PRACTICE_QUIZ_CORRECT_ANSWER, "Practice quiz answers");
    let quizWhiz = false;
    if (score === 100 || correctCount === questions.length) {
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

    return NextResponse.json({
      score,
      theta: estimate.theta,
      standardError: estimate.standardError,
      correctCount,
      total: questions.length,
      explanations,
      badgesAwarded: quizWhiz ? ["quiz_whiz"] : [],
    });
  });
}
