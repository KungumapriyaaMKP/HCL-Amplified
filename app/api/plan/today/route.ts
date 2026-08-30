import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import {
  goals,
  learningPaths,
  pathModules,
  resources,
  skills,
  dailyTasks,
  reviewSchedule,
  skillMastery,
} from "@/db/schema";
import { and, eq, asc, desc, lte } from "drizzle-orm";
import { computeSkillDecay } from "@/lib/decay";
import { chatJson } from "@/lib/llm";

export type PlanItem = {
  id: string;
  title: string;
  duration: string;
  type: "focus" | "review" | "quiz" | "task";
  status: "completed" | "active" | "pending";
  deepLink: string;
  isUserTask: boolean;
};

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const items: PlanItem[] = [];

    // 1. Find the current active/in-progress module across user's goals
    const activeGoals = await db
      .select({ id: goals.id, goalText: goals.goalText, domain: goals.domain })
      .from(goals)
      .where(eq(goals.userId, user.id))
      .orderBy(desc(goals.createdAt));

    let activeModuleTitle = "";
    let activeGoalDomain = "";

    for (const goal of activeGoals) {
      const [path] = await db
        .select({ id: learningPaths.id })
        .from(learningPaths)
        .where(eq(learningPaths.goalId, goal.id));

      if (path) {
        const modules = await db
          .select({
            module: pathModules,
            resource: resources,
            skill: skills,
          })
          .from(pathModules)
          .innerJoin(resources, eq(resources.id, pathModules.resourceId))
          .innerJoin(skills, eq(skills.id, pathModules.skillId))
          .where(eq(pathModules.pathId, path.id))
          .orderBy(asc(pathModules.order));

        const nextMod = modules.find(
          (m) => m.module.status === "in_progress" || m.module.status === "available"
        );

        if (nextMod) {
          activeModuleTitle = nextMod.skill.name;
          activeGoalDomain = goal.domain;
          items.push({
            id: `mod-${nextMod.module.id}`,
            title: `Focus Session: ${nextMod.skill.name}`,
            duration: "25 min",
            type: "focus",
            status: "active",
            deepLink: `/goals/${goal.id}/modules/${nextMod.module.id}`,
            isUserTask: false,
          });

          if (nextMod.module.isProgramming) {
            items.push({
              id: `comp-${nextMod.module.id}`,
              title: `Code Lab: ${nextMod.skill.name} Practice`,
              duration: "15 min",
              type: "quiz",
              status: "pending",
              deepLink: `/goals/${goal.id}/modules/${nextMod.module.id}/compiler`,
              isUserTask: false,
            });
          }
          break;
        }
      }
    }

    // 2. Check due spaced repetition reviews
    const now = new Date();
    const dueReviews = await db
      .select({ skillId: reviewSchedule.skillId })
      .from(reviewSchedule)
      .where(and(eq(reviewSchedule.userId, user.id), lte(reviewSchedule.dueAt, now)))
      .limit(3);

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

    const decay = computeSkillDecay(masteryRows);
    const fadingSkills = decay.filter((d) => d.tier !== "fresh").slice(0, 2);

    const reviewSkillCount = Math.max(dueReviews.length, fadingSkills.length);
    if (reviewSkillCount > 0) {
      items.push({
        id: "daily-review-queue",
        title: `Spaced Review (${reviewSkillCount} competencies due)`,
        duration: `${Math.min(15, reviewSkillCount * 5)} min`,
        type: "review",
        status: "pending",
        deepLink: "/review",
        isUserTask: false,
      });
    }

    // 3. User Daily Tasks
    const userTasks = await db
      .select()
      .from(dailyTasks)
      .where(eq(dailyTasks.userId, user.id))
      .orderBy(desc(dailyTasks.createdAt));

    userTasks.forEach((task) => {
      items.push({
        id: task.id,
        title: task.title,
        duration: "10 min",
        type: "task",
        status: task.completed ? "completed" : "pending",
        deepLink: "/dashboard",
        isUserTask: true,
      });
    });

    // 4. Generate Coach Intro with fallback
    let intro = "";
    const activeTasksCount = userTasks.filter((t) => !t.completed).length;

    try {
      const messages = [
        {
          role: "system" as const,
          content:
            "You are Pathwise's AI learning coach. Write a ONE-SENTENCE encouraging, personalized greeting and daily study focus recommendation (max 18 words). Respond with JSON: {\"intro\": \"...\"}",
        },
        {
          role: "user" as const,
          content: `Learner has ${reviewSkillCount} review(s) due, active focus module '${activeModuleTitle || "fundamentals"}', and ${activeTasksCount} daily tasks today.`,
        },
      ];

      const res = await chatJson<{ intro: string }>(messages, {
        temperature: 0.4,
        maxTokens: 100,
      });

      if (res?.intro && typeof res.intro === "string" && res.intro.trim().length > 5) {
        intro = res.intro.trim();
      }
    } catch {
      // Deterministic degraded-mode fallback template
      if (reviewSkillCount > 0 && activeModuleTitle) {
        intro = `Let's reinforce ${activeModuleTitle} and knock out your ${reviewSkillCount} spaced reviews today!`;
      } else if (activeModuleTitle) {
        intro = `Focus on mastering ${activeModuleTitle} today to accelerate your learning velocity!`;
      } else if (reviewSkillCount > 0) {
        intro = `You have ${reviewSkillCount} review sessions ready to protect your knowledge retention!`;
      } else {
        intro = "Welcome back! Start a focus session or add a goal to level up your skills today.";
      }
    }

    if (!intro) {
      intro = "Welcome back! Start a focus session or add a goal to level up your skills today.";
    }

    // Calculate total estimated minutes
    let totalMinutes = 0;
    items.forEach((item) => {
      if (!item.isUserTask && item.duration) {
        const num = parseInt(item.duration, 10);
        if (!isNaN(num)) totalMinutes += num;
      }
    });
    totalMinutes += activeTasksCount * 10;
    if (totalMinutes === 0) totalMinutes = 30;

    return NextResponse.json({
      intro,
      items,
      totalEstimatedMinutes: totalMinutes,
      reviewSkillCount,
    });
  });
}
