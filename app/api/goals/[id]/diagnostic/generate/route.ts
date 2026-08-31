import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { goals, diagnosticAttempts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { chatJson, generateFallbackJson } from "@/lib/llm";
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
    let questions: { id: string; skillId: string; question: string; options: string[]; correctIndex: number; explanation: string }[] = [];

    try {
      const result = await chatJson<QuestionSet>(
        questionGenerationMessages({ purpose: "diagnostic", domain: domainName, skills: covered, count }),
        { temperature: 0.4, maxTokens: 2500 },
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
        { role: "system", content: `diagnostic questions for ${domainName}` },
      ]);
      questions = Array.isArray(fallbackResult?.questions) ? fallbackResult.questions : [];
    }

    // Sanitize questions
    const sanitizedQuestions = questions.map((q, idx) => ({
      id: q.id || `diag_${idx + 1}`,
      skillId: q.skillId || covered[idx % Math.max(1, covered.length)]?.id || "general",
      question: q.question || `Diagnostic evaluation question for ${domainName}`,
      options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: typeof q.correctIndex === "number" && q.correctIndex >= 0 ? q.correctIndex : 0,
      explanation: q.explanation || `Core concept in ${domainName}.`,
    }));

    const [attempt] = await db
      .insert(diagnosticAttempts)
      .values({ userId: user.id, goalId: id, questions: sanitizedQuestions })
      .returning();

    const questionsForClient = sanitizedQuestions.map(({ id: qid, skillId, question, options }) => ({ id: qid, skillId, question, options }));
    return NextResponse.json({ attemptId: attempt.id, questions: questionsForClient });
  });
}
