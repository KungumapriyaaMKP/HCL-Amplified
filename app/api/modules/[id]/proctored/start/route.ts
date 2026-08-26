import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { proctoredAttempts, practiceAttempts } from "@/db/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { getModuleForUser } from "@/lib/moduleAccess";
import { chatJson } from "@/lib/llm";
import { questionGenerationMessages } from "@/lib/prompts";
import { DOMAINS } from "@/data/domains";

type QuestionSet = { questions: { id: string; skillId: string; question: string; options: string[]; correctIndex: number; explanation: string }[] };

const TIME_LIMIT_SECONDS = 600;

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
    const result = await chatJson<QuestionSet>(
      questionGenerationMessages({
        purpose: "proctored",
        domain: domainName,
        skills: [{ id: row.skill.id, name: row.skill.name, description: row.skill.description }],
        count: 6,
      }),
      { temperature: 0.4, maxTokens: 2200 },
    );

    const [attempt] = await db
      .insert(proctoredAttempts)
      .values({ userId: user.id, moduleId: id, questions: result.questions, timeLimitSeconds: TIME_LIMIT_SECONDS })
      .returning();

    const questionsForClient = result.questions.map(({ id: qid, question, options }) => ({ id: qid, question, options }));
    return NextResponse.json({ attemptId: attempt.id, questions: questionsForClient, timeLimitSeconds: TIME_LIMIT_SECONDS });
  });
}
