import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { proctoredAttempts, pathModules, learningEvents } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getModuleForUser } from "@/lib/moduleAccess";
import { onProctoredResult, updatePreferenceScore } from "@/lib/adapt";
import { awardXp, awardBadgeIfNew, touchStreak, XP } from "@/lib/gamification";
import { chatComplete } from "@/lib/llm";
import { proctoredReportMessages } from "@/lib/prompts";

type StoredQuestion = { id: string; correctIndex: number; explanation: string };
type Answer = { id: string; selectedIndex: number };
type Flag = { type: "tab_switch" | "blur" | "fullscreen_exit" | "identity_mismatch" | "no_face_detected"; at: number };

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const { attemptId, answers, flags, webcamPresenceRatio } = (await req.json()) as {
      attemptId: string;
      answers: Answer[];
      flags: Flag[];
      webcamPresenceRatio: number | null;
    };

    const row = await getModuleForUser(user.id, id);
    if (!row) return jsonError("Not found", 404);

    const [attempt] = await db
      .select()
      .from(proctoredAttempts)
      .where(and(eq(proctoredAttempts.id, attemptId), eq(proctoredAttempts.userId, user.id)));
    if (!attempt) return jsonError("Proctored attempt not found", 404);
    if (attempt.submittedAt) return jsonError("This proctored test has already been submitted");

    const questions = attempt.questions as StoredQuestion[];
    const answerMap = new Map(answers.map((a) => [a.id, a.selectedIndex]));
    const correctCount = questions.filter((q) => answerMap.get(q.id) === q.correctIndex).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const missedTopics = questions.filter((q) => answerMap.get(q.id) !== q.correctIndex).map((q) => q.explanation);

    // Was there an earlier, failed proctored attempt on this same skill
    // (via a since-inserted remedial module)? Used for the "Comeback" badge.
    const priorFailure = await db
      .select({ score: proctoredAttempts.score })
      .from(proctoredAttempts)
      .innerJoin(pathModules, eq(pathModules.id, proctoredAttempts.moduleId))
      .where(and(eq(pathModules.skillId, row.skill.id), eq(proctoredAttempts.userId, user.id)));
    const hadPriorFailure = priorFailure.some((p) => (p.score ?? 100) < 50);

    const reportText = await chatComplete(
      proctoredReportMessages({
        skillName: row.skill.name,
        score,
        totalQuestions: questions.length,
        correctCount,
        missedTopics,
        tabSwitchCount: flags?.filter((f) => f.type === "tab_switch").length ?? 0,
        identityFlagCount: flags?.filter((f) => f.type === "identity_mismatch" || f.type === "no_face_detected").length ?? 0,
      }),
      { temperature: 0.5, maxTokens: 400 },
    ).catch(() => `You scored ${score}/100 on ${row.skill.name}.`);

    await db
      .update(proctoredAttempts)
      .set({ answers, score, submittedAt: new Date(), flags: flags ?? [], webcamPresenceRatio, reportText })
      .where(eq(proctoredAttempts.id, attemptId));

    await db.insert(learningEvents).values({
      userId: user.id,
      moduleId: id,
      eventType: score >= 50 ? "complete" : "quiz_submit",
      modality: "assessment",
    });
    await updatePreferenceScore(user.id, "assessment", score / 100);

    await onProctoredResult({ userId: user.id, moduleId: id, score });

    const xpAwarded = XP.PROCTORED_PASS_BASE + Math.round(score * XP.PROCTORED_SCORE_BONUS_PER_POINT * 0.5);
    await awardXp(user.id, xpAwarded, `Proctored test: ${row.skill.name}`);
    await touchStreak(user.id);

    const badgesAwarded: string[] = [];
    if (score >= 80 && (await awardBadgeIfNew(user.id, "certified"))) badgesAwarded.push("certified");
    if (hadPriorFailure && score >= 70 && (await awardBadgeIfNew(user.id, "comeback"))) badgesAwarded.push("comeback");
    if (score >= 50 && (await awardBadgeIfNew(user.id, "first_steps"))) badgesAwarded.push("first_steps");

    return NextResponse.json({ score, correctCount, total: questions.length, reportText, xpAwarded, badgesAwarded });
  });
}
