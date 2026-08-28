import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { practiceAttempts, skillMastery, learningEvents } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getModuleForUser } from "@/lib/moduleAccess";
import { upsertMastery, updatePreferenceScore, checkAndSpliceDetour } from "@/lib/adapt";
import { awardXp, awardBadgeIfNew, touchStreak, XP } from "@/lib/gamification";
import { estimateTheta, type IRTItemResponse } from "@/lib/irt";
import misconceptionsData from "@/data/misconceptions.json";
import { socraticDialogueMessages } from "@/lib/prompts";
import { chatJson } from "@/lib/llm";

type StoredQuestion = { id: string; question?: string; options?: string[]; correctIndex: number; explanation: string; a?: number; b?: number };
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

    const { spliced, detour } = await checkAndSpliceDetour(user.id, id);

    // Socratic Misconception Scaffolding for missed answers
    const skillMisconceptions = (misconceptionsData as Record<string, Record<string, string>>)[row.skill.id] ?? {};
    let socraticGuidance: {
      questionId: string;
      skillName: string;
      chosenAnswer: string;
      scaffoldingQuestions: string[];
      conceptualHint: string;
      diagram?: string | null;
    } | null = null;

    const firstMissed = questions.find((q) => {
      const selected = answerMap.get(q.id);
      return selected !== undefined && selected !== q.correctIndex;
    });

    if (firstMissed) {
      const chosenIndex = answerMap.get(firstMissed.id) ?? 0;
      const chosenText = firstMissed.options?.[chosenIndex] ?? `Option ${chosenIndex + 1}`;
      const correctText = firstMissed.options?.[firstMissed.correctIndex] ?? firstMissed.explanation;

      let matchedMisconception: string | undefined;
      for (const [key, desc] of Object.entries(skillMisconceptions)) {
        if (chosenText.toLowerCase().includes(key.replace(/_/g, " ")) || chosenText.toLowerCase().includes(key)) {
          matchedMisconception = desc;
          break;
        }
      }

      try {
        const socraticRes = await chatJson<{
          scaffoldingQuestions: string[];
          conceptualHint: string;
          diagram?: string | null;
        }>(
          socraticDialogueMessages({
            skillName: row.skill.name,
            question: firstMissed.question ?? "Conceptual question",
            chosenAnswer: chosenText,
            correctAnswer: correctText,
            misconceptionHint: matchedMisconception,
          }),
          { temperature: 0.4, maxTokens: 400 }
        );

        socraticGuidance = {
          questionId: firstMissed.id,
          skillName: row.skill.name,
          chosenAnswer: chosenText,
          scaffoldingQuestions: socraticRes.scaffoldingQuestions ?? [
            `What fundamental invariant of ${row.skill.name} might contradict this choice?`,
            "Consider what assumptions this answer makes about the underlying state.",
          ],
          conceptualHint: socraticRes.conceptualHint ?? (matchedMisconception || "Review the relationship between inputs and outputs."),
          diagram: socraticRes.diagram ?? null,
        };
      } catch {
        if (matchedMisconception) {
          socraticGuidance = {
            questionId: firstMissed.id,
            skillName: row.skill.name,
            chosenAnswer: chosenText,
            scaffoldingQuestions: [
              `Consider why this approach might lead to an unintended side effect.`,
              `How does ${row.skill.name} handle this condition?`,
            ],
            conceptualHint: matchedMisconception,
          };
        }
      }
    }

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
      detour: spliced ? detour : undefined,
      socraticGuidance: socraticGuidance ?? undefined,
    });
  });
}
