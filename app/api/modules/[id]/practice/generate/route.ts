import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { practiceAttempts } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getModuleForUser } from "@/lib/moduleAccess";
import { chatJson } from "@/lib/llm";
import { questionGenerationMessages } from "@/lib/prompts";
import { DOMAINS } from "@/data/domains";

type QuestionSet = { questions: { id: string; skillId: string; question: string; options: string[]; correctIndex: number; explanation: string }[] };

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;

    const row = await getModuleForUser(user.id, id);
    if (!row) return jsonError("Not found", 404);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(practiceAttempts)
      .where(and(eq(practiceAttempts.userId, user.id), eq(practiceAttempts.moduleId, id)));

    const domainName = DOMAINS.find((d) => d.id === row.goal.domain)?.name ?? row.goal.domain;
    const result = await chatJson<QuestionSet>(
      questionGenerationMessages({
        purpose: "practice",
        domain: domainName,
        skills: [{ id: row.skill.id, name: row.skill.name, description: row.skill.description }],
        count: 5,
      }),
      { temperature: 0.7, maxTokens: 1800 },
    );

    const [attempt] = await db
      .insert(practiceAttempts)
      .values({ userId: user.id, moduleId: id, questions: result.questions, attemptNo: Number(count) + 1 })
      .returning();

    const questionsForClient = result.questions.map(({ id: qid, question, options }) => ({ id: qid, question, options }));
    return NextResponse.json({ attemptId: attempt.id, attemptNo: attempt.attemptNo, questions: questionsForClient });
  });
}
