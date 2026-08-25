import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { goals, diagnosticAttempts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { chatJson } from "@/lib/llm";
import { questionGenerationMessages } from "@/lib/prompts";
import { DOMAINS } from "@/data/domains";
import { SKILLS } from "@/data/skills";

type QuestionSet = { questions: { id: string; skillId: string; question: string; options: string[]; correctIndex: number; explanation: string }[] };

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;

    const [goal] = await db.select().from(goals).where(and(eq(goals.id, id), eq(goals.userId, user.id)));
    if (!goal) return jsonError("Not found", 404);

    // Diagnostic covers foundational skills plus the tier right above them -
    // enough to calibrate a starting point without turning into an exam.
    const domainSkills = SKILLS.filter((s) => s.category === goal.domain);
    const foundational = domainSkills.filter((s) => s.prerequisites.length === 0);
    const foundationalIds = new Set(foundational.map((s) => s.id));
    const nextTier = domainSkills.filter(
      (s) => s.prerequisites.length > 0 && s.prerequisites.every((p) => foundationalIds.has(p)),
    );
    const covered = [...foundational, ...nextTier].slice(0, 6);

    const domainName = DOMAINS.find((d) => d.id === goal.domain)?.name ?? goal.domain;
    const count = Math.max(4, Math.min(8, covered.length + 2));
    const result = await chatJson<QuestionSet>(
      questionGenerationMessages({ purpose: "diagnostic", domain: domainName, skills: covered, count }),
      { temperature: 0.4, maxTokens: 2500 },
    );

    const [attempt] = await db
      .insert(diagnosticAttempts)
      .values({ userId: user.id, goalId: id, questions: result.questions })
      .returning();

    const questionsForClient = result.questions.map(({ id: qid, skillId, question, options }) => ({ id: qid, skillId, question, options }));
    return NextResponse.json({ attemptId: attempt.id, questions: questionsForClient });
  });
}
