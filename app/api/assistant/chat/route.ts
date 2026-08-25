import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { goals, chatMessages, pathModules, learningPaths, skills, adaptationLog } from "@/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";
import { chatComplete } from "@/lib/llm";
import { assistantSystemMessage } from "@/lib/prompts";
import { getMasteryMap } from "@/lib/adapt";
import { DOMAINS } from "@/data/domains";

export async function GET(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const goalId = req.nextUrl.searchParams.get("goalId");
    if (!goalId) return jsonError("goalId is required");

    const history = await db
      .select()
      .from(chatMessages)
      .where(and(eq(chatMessages.goalId, goalId), eq(chatMessages.thread, "assistant"), eq(chatMessages.userId, user.id)))
      .orderBy(asc(chatMessages.createdAt));

    return NextResponse.json({ messages: history });
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { goalId, message } = (await req.json()) as { goalId: string; message: string };
    if (!message?.trim()) return jsonError("message is required");

    const [goal] = await db.select().from(goals).where(and(eq(goals.id, goalId), eq(goals.userId, user.id)));
    if (!goal) return jsonError("Not found", 404);

    const mastery = await getMasteryMap(user.id);
    const masterySummary =
      [...mastery.entries()]
        .slice(0, 8)
        .map(([id, score]) => `${id}: ${score}%`)
        .join(", ") || "no mastery recorded yet";

    const [path] = await db.select().from(learningPaths).where(eq(learningPaths.goalId, goalId));
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
      .where(eq(adaptationLog.goalId, goalId))
      .orderBy(desc(adaptationLog.createdAt))
      .limit(3);
    const recentAdaptations = adaptations.map((a) => a.reason).join(" | ");

    const domainName = DOMAINS.find((d) => d.id === goal.domain)?.name ?? goal.domain;
    const system = assistantSystemMessage({
      goalText: goal.goalText,
      domain: domainName,
      trackPace: goal.trackPace,
      masterySummary,
      pathSummary,
      recentAdaptations,
    });

    const history = await db
      .select()
      .from(chatMessages)
      .where(and(eq(chatMessages.goalId, goalId), eq(chatMessages.thread, "assistant")))
      .orderBy(asc(chatMessages.createdAt));

    await db.insert(chatMessages).values({ userId: user.id, goalId, thread: "assistant", role: "user", content: message.trim() });

    const reply = await chatComplete(
      [system, ...history.map((h) => ({ role: h.role as "user" | "assistant", content: h.content })), { role: "user", content: message.trim() }],
      { temperature: 0.6, maxTokens: 500 },
    );

    await db.insert(chatMessages).values({ userId: user.id, goalId, thread: "assistant", role: "assistant", content: reply });

    return NextResponse.json({ reply });
  });
}
