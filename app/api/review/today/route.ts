import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { reviewSchedule, skillMastery, skills } from "@/db/schema";
import { and, eq, lte } from "drizzle-orm";
import { computeSkillDecay } from "@/lib/decay";
import { SKILLS_BY_ID } from "@/data/skills";
import { chatJson } from "@/lib/llm";
import { questionGenerationMessages } from "@/lib/prompts";
import { getFallbackReviewQuestions, StaticReviewQuestion } from "@/data/reviewQuestions";

export type ReviewQueueItem = {
  skillId: string;
  skillName: string;
  category: string;
  decayTier: string;
  intervalDays: number;
  reps: number;
  questions: StaticReviewQuestion[];
};

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const now = new Date();

    // 1. Query explicitly scheduled reviews due now
    const scheduledRows = await db
      .select({
        skillId: reviewSchedule.skillId,
        intervalDays: reviewSchedule.intervalDays,
        reps: reviewSchedule.reps,
      })
      .from(reviewSchedule)
      .where(and(eq(reviewSchedule.userId, user.id), lte(reviewSchedule.dueAt, now)));

    // 2. Query touched skills and run decay computation
    const masteryRows = await db
      .select({
        skillId: skillMastery.skillId,
        score: skillMastery.score,
        name: skills.name,
        category: skills.category,
        source: skillMastery.source,
        updatedAt: skillMastery.updatedAt,
      })
      .from(skillMastery)
      .innerJoin(skills, eq(skills.id, skillMastery.skillId))
      .where(eq(skillMastery.userId, user.id));

    const decayList = computeSkillDecay(masteryRows);
    const fadingOrDecayed = decayList.filter((d) => d.tier !== "fresh");

    // 3. Combine unique candidate skill IDs, prioritizing scheduled, then fading/decayed, capped at 5
    const candidateSkillIds = new Set<string>();
    scheduledRows.forEach((r) => candidateSkillIds.add(r.skillId));
    fadingOrDecayed.forEach((d) => candidateSkillIds.add(d.skillId));

    // If candidate list is empty, include up to 2 mastered skills for daily refresh
    if (candidateSkillIds.size === 0 && masteryRows.length > 0) {
      masteryRows.slice(0, 2).forEach((m) => candidateSkillIds.add(m.skillId));
    }

    const selectedSkillIds = Array.from(candidateSkillIds).slice(0, 5);

    // 4. Assemble questions for each skill (with resilient offline fallbacks)
    const items: ReviewQueueItem[] = [];

    for (const skillId of selectedSkillIds) {
      const skill = SKILLS_BY_ID.get(skillId);
      const skillName = skill?.name || skillId;
      const category = skill?.category || "general";
      const decayInfo = decayList.find((d) => d.skillId === skillId);
      const sched = scheduledRows.find((s) => s.skillId === skillId);

      let questions: StaticReviewQuestion[] = [];

      try {
        // Attempt dynamic generation via LLM
        const prompt = questionGenerationMessages({
          purpose: "practice",
          domain: category,
          skills: [{ id: skillId, name: skillName, description: skill?.description || skillName }],
          count: 2,
        });

        const res = await chatJson<{ questions: StaticReviewQuestion[] }>(prompt, {
          temperature: 0.3,
          maxTokens: 800,
        });

        if (Array.isArray(res?.questions) && res.questions.length > 0) {
          questions = res.questions.map((q, idx) => ({
            id: q.id || `${skillId}-dyn-${idx}`,
            skillId,
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation || "Correct answer reinforced.",
          }));
        }
      } catch (err) {
        // Degraded mode fallback: static verified question bank
        questions = getFallbackReviewQuestions(skillId, skillName);
      }

      if (questions.length === 0) {
        questions = getFallbackReviewQuestions(skillId, skillName);
      }

      items.push({
        skillId,
        skillName,
        category,
        decayTier: decayInfo?.tier || "fading",
        intervalDays: sched?.intervalDays || 1,
        reps: sched?.reps || 0,
        questions,
      });
    }

    return NextResponse.json({
      items,
      count: items.length,
    });
  });
}
