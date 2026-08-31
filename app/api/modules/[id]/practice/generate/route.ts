import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { practiceAttempts, progressEvents } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getModuleForUser } from "@/lib/moduleAccess";
import { chatJson, generateFallbackJson } from "@/lib/llm";
import { questionGenerationMessages } from "@/lib/prompts";
import { DOMAINS } from "@/data/domains";

type QuestionSet = { questions: { id: string; skillId: string; question: string; options: string[]; correctIndex: number; explanation: string }[] };

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;

    const row = await getModuleForUser(user.id, id);
    if (!row) return jsonError("Not found", 404);

    // Hard gate, not just a UI nicety: the resource must actually be marked
    // done (a real progress_events row, not just pathModules.status) before
    // a practice quiz can be generated at all.
    const [resourceDone] = await db
      .select()
      .from(progressEvents)
      .where(and(eq(progressEvents.moduleId, id), eq(progressEvents.userId, user.id), eq(progressEvents.type, "resource_done")))
      .limit(1);
    if (!resourceDone) return jsonError("Mark the resource as done before starting the practice quiz", 403);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(practiceAttempts)
      .where(and(eq(practiceAttempts.userId, user.id), eq(practiceAttempts.moduleId, id)));

    const domainName = DOMAINS.find((d) => d.id === row.goal.domain)?.name ?? row.goal.domain;
    let questions: { id: string; skillId: string; question: string; options: string[]; correctIndex: number; explanation: string }[] = [];

    try {
      const result = await chatJson<QuestionSet>(
        questionGenerationMessages({
          purpose: "practice",
          domain: domainName,
          skills: [{ id: row.skill.id, name: row.skill.name, description: row.skill.description }],
          count: 10,
        }),
        { temperature: 0.7, maxTokens: 3500 },
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
        { role: "system", content: `practice questions for ${row.skill.name} (${row.skill.id}) in ${domainName}` },
      ]);
      questions = Array.isArray(fallbackResult?.questions) ? fallbackResult.questions : [];
    }

    // Sanitize questions
    const sanitizedQuestions = questions.map((q, idx) => ({
      id: q.id || `pract_${idx + 1}`,
      skillId: q.skillId || row.skill.id,
      question: q.question || `Practice question for ${row.skill.name}`,
      options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ["True", "False", "Partially True", "None of the above"],
      correctIndex: typeof q.correctIndex === "number" && q.correctIndex >= 0 ? q.correctIndex : 0,
      explanation: q.explanation || `Core concept for ${row.skill.name}.`,
    }));

    const [attempt] = await db
      .insert(practiceAttempts)
      .values({ userId: user.id, moduleId: id, questions: sanitizedQuestions, attemptNo: Number(count) + 1 })
      .returning();

    const questionsForClient = sanitizedQuestions.map(({ id: qid, question, options }) => ({ id: qid, question, options }));
    return NextResponse.json({ attemptId: attempt.id, attemptNo: attempt.attemptNo, questions: questionsForClient });
  });
}
