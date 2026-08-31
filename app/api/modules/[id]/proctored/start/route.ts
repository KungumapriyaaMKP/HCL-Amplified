import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { proctoredAttempts, practiceAttempts } from "@/db/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { getModuleForUser } from "@/lib/moduleAccess";
import { chatJson, generateFallbackJson } from "@/lib/llm";
import { questionGenerationMessages } from "@/lib/prompts";
import { DOMAINS } from "@/data/domains";

type QuestionSet = { questions: { id: string; skillId: string; question: string; options: string[]; correctIndex: number; explanation: string }[] };

const TIME_LIMIT_SECONDS = 900;

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;

    const row = await getModuleForUser(user.id, id);
    if (!row) return jsonError("Not found", 404);

    const [already] = await db
      .select()
      .from(proctoredAttempts)
      .where(and(eq(proctoredAttempts.moduleId, id), eq(proctoredAttempts.userId, user.id), isNotNull(proctoredAttempts.submittedAt)));
    if (already) {
      return NextResponse.json({ alreadyTaken: true, score: already.score, reportText: already.reportText });
    }

    // Hard gate: at least one scored practice attempt must exist for this
    // module before a proctored attempt can even be generated.
    const [practiced] = await db
      .select()
      .from(practiceAttempts)
      .where(and(eq(practiceAttempts.moduleId, id), eq(practiceAttempts.userId, user.id), isNotNull(practiceAttempts.score)))
      .limit(1);
    if (!practiced) return jsonError("Complete a practice quiz attempt before starting the proctored test", 403);

    const domainName = DOMAINS.find((d) => d.id === row.goal.domain)?.name ?? row.goal.domain;
    let questions: { id: string; skillId: string; question: string; options: string[]; correctIndex: number; explanation: string }[] = [];

    try {
      const result = await chatJson<QuestionSet>(
        questionGenerationMessages({
          purpose: "proctored",
          domain: domainName,
          skills: [{ id: row.skill.id, name: row.skill.name, description: row.skill.description }],
          count: 15,
        }),
        { temperature: 0.4, maxTokens: 4500 },
      );

      if (Array.isArray(result)) {
        questions = result;
      } else if (Array.isArray(result?.questions)) {
        questions = result.questions;
      }
    } catch (_err) {
      // Fallback below
    }

    if (!questions || questions.length === 0) {
      const fallbackResult = generateFallbackJson<QuestionSet>([
        { role: "system", content: `proctored assessment for ${row.skill.name} (${row.skill.id}) in ${domainName}` },
      ]);
      questions = Array.isArray(fallbackResult?.questions) ? fallbackResult.questions : [];
    }

    // Sanitize and guarantee every question is well-formed
    const sanitizedQuestions = questions.map((q, idx) => ({
      id: q.id || `proc_${idx + 1}`,
      skillId: q.skillId || row.skill.id,
      question: q.question || `Core assessment question for ${row.skill.name}`,
      options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ["True", "False", "Partially True", "None of the above"],
      correctIndex: typeof q.correctIndex === "number" && q.correctIndex >= 0 ? q.correctIndex : 0,
      explanation: q.explanation || `Key concept in ${row.skill.name}.`,
    }));

    const [attempt] = await db
      .insert(proctoredAttempts)
      .values({
        userId: user.id,
        moduleId: id,
        questions: sanitizedQuestions,
        timeLimitSeconds: TIME_LIMIT_SECONDS,
      })
      .returning();

    const questionsForClient = sanitizedQuestions.map(({ id: qid, question, options }) => ({ id: qid, question, options }));
    return NextResponse.json({ attemptId: attempt.id, questions: questionsForClient, timeLimitSeconds: TIME_LIMIT_SECONDS });
  });
}
