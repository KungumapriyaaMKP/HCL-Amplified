import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { proctoredAttempts } from "@/db/schema";
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
