import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { goals, learningPaths, pathModules, adaptationLog, profiles } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { computeGap, resolveGoalSkills } from "@/lib/skillGraph";
import { getMasteryMap } from "@/lib/adapt";
import { getCandidatePool } from "@/lib/catalog";
import { bestResourceForSkill, CRASH_COURSE_PRACTICE_BIAS, planSkillOrder, type PlannerMode, type ScoredResource } from "@/lib/recommend";
import { computeFeasibility } from "@/lib/feasibility";
import { isProgrammingSkill, languageForSkill } from "@/data/programmingSkills";
import { SKILLS_BY_ID } from "@/data/skills";
import { DOMAINS } from "@/data/domains";
import { syncMsLearnResourcesForSkill } from "@/lib/external/msLearn";
import { chatComplete } from "@/lib/llm";
import { moduleRationaleMessages } from "@/lib/prompts";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;

    const reqBody = await req.json().catch(() => ({}));
    const [goal] = await db.select().from(goals).where(and(eq(goals.id, id), eq(goals.userId, user.id)));
    if (!goal) return jsonError("Not found", 404);

    const subFocus = (goal.subFocus ?? {}) as { tags?: string[]; mappedSkillIds?: string[] };
    const mappedIds = (subFocus.mappedSkillIds ?? []).filter((sId) => SKILLS_BY_ID.has(sId));
    const goalSkillIds = mappedIds.length > 0 ? mappedIds : resolveGoalSkills(goal.domain, goal.goalText, subFocus.tags ?? []);

    const mastery = await getMasteryMap(user.id);
    const rawGapSkills = computeGap(goalSkillIds, mastery);
    if (rawGapSkills.length === 0) {
      return jsonError("You already have every prerequisite mastered for this goal - nothing to generate.");
    }

    const plannerMode: PlannerMode = reqBody?.plannerMode ?? (goal.preferences as { plannerMode?: PlannerMode } | null)?.plannerMode ?? "fastest";
    const orderedPlannedSkills = planSkillOrder(rawGapSkills, mastery, plannerMode);
    const gapSkills = orderedPlannedSkills.length > 0 ? orderedPlannedSkills : rawGapSkills;

    // Best-effort: pull in live Microsoft Learn content for each gap skill.
    // Network hiccups here don't block path generation (internal + curated
    // resources already cover every skill).
    await Promise.all(
      gapSkills.map((skillId) => {
        const skill = SKILLS_BY_ID.get(skillId);
        return skill ? syncMsLearnResourcesForSkill(skillId, skill.name).catch(() => 0) : Promise.resolve(0);
      }),
    );

    const pool = await getCandidatePool();
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
    const modalityPreference = (profile?.preferenceScores ?? {}) as Record<string, number>;
    const difficultyBias = (goal.preferences as { difficultyBias?: number } | null)?.difficultyBias ?? 0;
    // Interview Crash Course: bias resource selection toward hands-on
    // projects/assessments over long-form courses - see practiceFit() in
    // lib/recommend.ts. Every other pace leaves this at 0 (no behavior change).
    const practiceBias = goal.trackPace === "crash-course" ? CRASH_COURSE_PRACTICE_BIAS : 0;
    const goalSkillSet = new Set(goalSkillIds);

    const [path] = await db.insert(learningPaths).values({ goalId: id, status: "active" }).returning();

    const domainName = DOMAINS.find((d) => d.id === goal.domain)?.name ?? goal.domain;
    const createdModules: {
      order: number;
      skillId: string;
      skillName: string;
      resourceTitle: string;
      resourceType: string;
      mastery: number;
      scoreBreakdown: ScoredResource["scoreBreakdown"];
    }[] = [];
    let validatorNote: string | null = null;

    for (let i = 0; i < gapSkills.length; i++) {
      const skillId = gapSkills[i];
      const skill = SKILLS_BY_ID.get(skillId);
      if (!skill) continue;

      const rankCtx = {
        targetSkillId: skillId,
        masteryBySkill: mastery,
        interestSkillIds: goalSkillIds,
        difficultyBias,
        practiceBias,
        goalText: goal.goalText,
        modalityPreference,
      };
      let best = bestResourceForSkill(pool, rankCtx);
      if (!best) continue;

      // Validator pass (pacing/difficulty check, run before the path is ever
      // shown): opening the whole path on an advanced resource for a skill
      // the learner has zero mastery in is a pacing mistake even if it's
      // technically the top-ranked match - soften it by re-ranking with a
      // forced preference for easier material.
      if (i < 2 && best.difficulty === "advanced" && (mastery.get(skillId) ?? 0) === 0) {
        const gentler = bestResourceForSkill(pool, { ...rankCtx, difficultyBias: -1 });
        if (gentler && gentler.id !== best.id) {
          validatorNote = `Softened the opening difficulty curve: swapped an advanced resource for "${skill.name}" (module ${i + 1}) for an easier one so the path doesn't start too steep.`;
          best = gentler;
        }
      }

      const milestoneType = skill.prerequisites.length === 0 ? "foundation" : goalSkillSet.has(skillId) ? "capstone" : "core";

      await db.insert(pathModules).values({
        pathId: path.id,
        order: i,
        skillId,
        resourceId: best.id,
        status: i === 0 ? "available" : "locked",
        milestoneType,
        isProgramming: isProgrammingSkill(skillId),
        programmingLanguage: languageForSkill(skillId),
      });

      createdModules.push({
        order: i,
        skillId,
        skillName: skill.name,
        resourceTitle: best.title,
        resourceType: best.type,
        mastery: mastery.get(skillId) ?? 0,
        scoreBreakdown: best.scoreBreakdown,
      });
    }

    if (validatorNote) {
      await db.insert(adaptationLog).values({
        userId: user.id,
        goalId: id,
        trigger: "path_validator",
        action: "softened_opening_difficulty",
        reason: validatorNote,
      });
    }

    // Rationale generation is independent per module (each only needs the
    // list of skill names that come before it, not their own generated
    // text), so run every call concurrently instead of chaining them. Each
    // one is grounded in the real ranking numbers (score-grounded explainer)
    // rather than left for Claude to freely invent a justification.
    const rationales = await Promise.all(
      createdModules.map((m, idx) =>
        chatComplete(
          moduleRationaleMessages({
            skillName: m.skillName,
            resourceTitle: m.resourceTitle,
            resourceType: m.resourceType,
            goalText: goal.goalText,
            domain: domainName,
            isFirstModule: idx === 0,
            priorSkillNames: createdModules.slice(0, idx).map((p) => p.skillName),
            trackPace: goal.trackPace,
            currentMastery: m.mastery,
            scoreBreakdown: m.scoreBreakdown,
          }),
          { temperature: 0.6, maxTokens: 250 },
        ).catch(() => `Covers "${m.skillName}", a required step toward your goal.`),
      ),
    );

    await Promise.all(
      createdModules.map((m, idx) =>
        db
          .update(pathModules)
          .set({ rationale: rationales[idx] })
          .where(and(eq(pathModules.pathId, path.id), eq(pathModules.order, m.order))),
      ),
    );

    await db.update(goals).set({ status: "active" }).where(eq(goals.id, id));

    const feasibility = computeFeasibility({
      gapSkills,
      goalSkillIds,
      trackPace: goal.trackPace,
      deadlineWeeks: (subFocus as { timeframeWeeks?: number })?.timeframeWeeks ?? null,
    });

    return NextResponse.json({
      pathId: path.id,
      moduleCount: createdModules.length,
      feasibility,
    });
  });
}
