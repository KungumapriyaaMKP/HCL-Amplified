import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { goals, chatMessages, pathModules, learningPaths, skills, adaptationLog } from "@/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";
import { chatComplete } from "@/lib/llm";
import { assistantSystemMessage } from "@/lib/prompts";
import { getMasteryMap } from "@/lib/adapt";
import { getModuleForUser } from "@/lib/moduleAccess";
import { DOMAINS } from "@/data/domains";

export async function GET(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    let goalId = req.nextUrl.searchParams.get("goalId");

    if (!goalId) {
      const [latestGoal] = await db
        .select()
        .from(goals)
        .where(eq(goals.userId, user.id))
        .orderBy(desc(goals.createdAt))
        .limit(1);
      if (latestGoal) {
        goalId = latestGoal.id;
      }
    }

    const history = goalId
      ? await db
          .select()
          .from(chatMessages)
          .where(
            and(
              eq(chatMessages.goalId, goalId),
              eq(chatMessages.thread, "assistant"),
              eq(chatMessages.userId, user.id)
            )
          )
          .orderBy(asc(chatMessages.createdAt))
      : await db
          .select()
          .from(chatMessages)
          .where(
            and(
              eq(chatMessages.thread, "assistant"),
              eq(chatMessages.userId, user.id)
            )
          )
          .orderBy(asc(chatMessages.createdAt))
          .limit(30);

    return NextResponse.json({ messages: history });
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { goalId, message, moduleId } = (await req.json()) as {
      goalId?: string;
      message: string;
      moduleId?: string;
    };
    if (!message?.trim()) return jsonError("message is required");

    let targetGoalId = goalId;
    let [goal] = targetGoalId
      ? await db
          .select()
          .from(goals)
          .where(and(eq(goals.id, targetGoalId), eq(goals.userId, user.id)))
      : [];

    if (!goal) {
      const [latestGoal] = await db
        .select()
        .from(goals)
        .where(eq(goals.userId, user.id))
        .orderBy(desc(goals.createdAt))
        .limit(1);
      if (latestGoal) {
        goal = latestGoal;
        targetGoalId = latestGoal.id;
      }
    }

    let system;
    if (goal && targetGoalId) {
      const mastery = await getMasteryMap(user.id);
      const masterySummary =
        [...mastery.entries()]
          .slice(0, 8)
          .map(([id, score]) => `${id}: ${score}%`)
          .join(", ") || "no mastery recorded yet";

      const [path] = await db
        .select()
        .from(learningPaths)
        .where(eq(learningPaths.goalId, targetGoalId));
      let pathSummary = "no path generated yet";
      if (path) {
        const modules = await db
          .select({ status: pathModules.status, name: skills.name })
          .from(pathModules)
          .innerJoin(skills, eq(skills.id, pathModules.skillId))
          .where(eq(pathModules.pathId, path.id))
          .orderBy(asc(pathModules.order));
        pathSummary = modules.map((m) => `${m.name} (${m.status})`).join(" -> ");
      }

      const adaptations = await db
        .select()
        .from(adaptationLog)
        .where(eq(adaptationLog.goalId, targetGoalId))
        .orderBy(desc(adaptationLog.createdAt))
        .limit(3);
      const recentAdaptations = adaptations.map((a) => a.reason).join(" | ");

      let currentModule = null;
      if (moduleId) {
        const modRow = await getModuleForUser(user.id, moduleId);
        if (modRow) {
          currentModule = {
            skillName: modRow.skill.name,
            resourceTitle: modRow.resource.title,
            resourceType: modRow.resource.type,
            rationale: modRow.module.rationale,
          };
        }
      }

      const domainName = DOMAINS.find((d) => d.id === goal.domain)?.name ?? goal.domain;
      system = assistantSystemMessage({
        goalText: goal.goalText,
        domain: domainName,
        trackPace: goal.trackPace,
        masterySummary,
        pathSummary,
        recentAdaptations,
        currentModule,
      });
    } else {
      system = {
        role: "system" as const,
        content: `You are the QuestLearn AI Ghost Mentor, a friendly, encouraging, and highly knowledgeable study companion.
The learner is exploring QuestLearn. Help guide them with studying, technical questions, roadmaps, or getting started with courses. Keep answers concise, direct, helpful, and friendly.`,
      };
    }

    const history = targetGoalId
      ? await db
          .select()
          .from(chatMessages)
          .where(and(eq(chatMessages.goalId, targetGoalId), eq(chatMessages.thread, "assistant")))
          .orderBy(asc(chatMessages.createdAt))
      : await db
          .select()
          .from(chatMessages)
          .where(and(eq(chatMessages.userId, user.id), eq(chatMessages.thread, "assistant")))
          .orderBy(asc(chatMessages.createdAt))
          .limit(20);

    await db.insert(chatMessages).values({
      userId: user.id,
      goalId: targetGoalId ?? null,
      thread: "assistant",
      role: "user",
      content: message.trim(),
    });

    const reply = await chatComplete(
      [
        system,
        ...history.map((h) => ({ role: h.role as "user" | "assistant", content: h.content })),
        { role: "user", content: message.trim() },
      ],
      { temperature: 0.6, maxTokens: 500 }
    );

    await db.insert(chatMessages).values({
      userId: user.id,
      goalId: targetGoalId ?? null,
      thread: "assistant",
      role: "assistant",
      content: reply,
    });

    return NextResponse.json({ reply });
  });
}
