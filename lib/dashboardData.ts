import { db } from "@/lib/db";
import {
  goals,
  learningPaths,
  pathModules,
  resources,
  skills,
  skillMastery,
  adaptationLog,
  streaks,
  userBadges,
  badges,
  profiles,
} from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { getTotalXp, levelForXp, levelTitle } from "@/lib/gamification";
import { checkDisengagement } from "@/lib/adapt";
import { computeSkillDecay } from "@/lib/decay";
import { getActivityHeatmap } from "@/lib/activityData";
import { getCandidatePool } from "@/lib/catalog";
import { bestResourceForSkill } from "@/lib/recommend";

export async function getDashboardData(userId: string) {
  const [
    profileResult,
    xp,
    streakResult,
    disengagement,
    earnedBadges,
    goalRows,
    masteryRows,
    activity,
    adaptations,
  ] = await Promise.all([
    db.select().from(profiles).where(eq(profiles.userId, userId)),
    getTotalXp(userId),
    db.select().from(streaks).where(eq(streaks.userId, userId)),
    checkDisengagement(userId),
    db
      .select({ id: badges.id, name: badges.name, icon: badges.icon, description: badges.description, earnedAt: userBadges.earnedAt })
      .from(userBadges)
      .innerJoin(badges, eq(badges.id, userBadges.badgeId))
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt)),
    db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.createdAt)),
    db
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
      .where(eq(skillMastery.userId, userId))
      .orderBy(desc(skillMastery.score)),
    getActivityHeatmap(userId),
    db
      .select()
      .from(adaptationLog)
      .where(eq(adaptationLog.userId, userId))
      .orderBy(desc(adaptationLog.createdAt))
      .limit(15),
  ]);

  const [profile] = profileResult;
  const level = levelForXp(xp);
  const [streak] = streakResult;

  const goalSummaries = await Promise.all(
    goalRows.map(async (goal) => {
      const [path] = await db.select().from(learningPaths).where(eq(learningPaths.goalId, goal.id));
      if (!path) return { ...goal, pathId: null, totalModules: 0, completedModules: 0, nextAction: null };

      const modules = await db
        .select({ module: pathModules, resource: resources, skill: skills })
        .from(pathModules)
        .innerJoin(resources, eq(resources.id, pathModules.resourceId))
        .innerJoin(skills, eq(skills.id, pathModules.skillId))
        .where(eq(pathModules.pathId, path.id))
        .orderBy(asc(pathModules.order));

      const completedModules = modules.filter((m) => m.module.status === "completed").length;
      const next = modules.find((m) => m.module.status === "available" || m.module.status === "in_progress");

      return {
        ...goal,
        pathId: path.id,
        totalModules: modules.length,
        completedModules,
        modules: modules.map((m) => ({
          id: m.module.id,
          skillId: m.skill.id,
          skillName: m.skill.name,
          resourceTitle: m.resource.title,
          status: m.module.status,
          milestoneType: m.module.milestoneType,
          order: m.module.order,
        })),
        nextAction: next
          ? { moduleId: next.module.id, skillName: next.skill.name, resourceTitle: next.resource.title, status: next.module.status }
          : null,
      };
    }),
  );

  const decay = computeSkillDecay(masteryRows);
  const needsReview = decay.filter((d) => d.foundational && d.tier !== "fresh").slice(0, 5);
  const reviewSuggestions: Record<string, { title: string; url: string }> = {};
  if (needsReview.length > 0) {
    const pool = await getCandidatePool();
    for (const d of needsReview) {
      const best = bestResourceForSkill(pool, {
        targetSkillId: d.skillId,
        masteryBySkill: new Map(),
        interestSkillIds: [],
        difficultyBias: -0.3,
      });
      if (best) reviewSuggestions[d.skillId] = { title: best.title, url: best.url };
    }
  }

  return {
    profile,
    disengagement,
    gamification: {
      xp,
      level: level.level,
      levelTitle: levelTitle(level.level),
      xpIntoLevel: level.xpIntoLevel,
      xpForNextLevel: level.xpForNextLevel,
      streak: streak ?? { currentStreak: 0, longestStreak: 0 },
      badges: earnedBadges,
    },
    goals: goalSummaries,
    mastery: masteryRows,
    decay,
    reviewSuggestions,
    activity,
    adaptations,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
