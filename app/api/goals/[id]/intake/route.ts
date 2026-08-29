import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { goals, chatMessages, profiles } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { chatJson } from "@/lib/llm";
import { goalIntakeMessages } from "@/lib/prompts";
import { DOMAINS } from "@/data/domains";

type IntakeResult = {
  reply: string;
  done: boolean;
  subFocus: string[];
  motivation: string | null;
  timeframeWeeks: number | null;
  mappedSkillIds?: string[];
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;

    const [goal] = await db.select().from(goals).where(and(eq(goals.id, id), eq(goals.userId, user.id)));
    if (!goal) return jsonError("Not found", 404);

    const rows = await db
      .select()
      .from(chatMessages)
      .where(and(eq(chatMessages.goalId, id), eq(chatMessages.thread, "goal_intake")))
      .orderBy(asc(chatMessages.createdAt));

    return NextResponse.json({ messages: rows.map((r) => ({ role: r.role, content: r.content })) });
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const { message } = (await req.json().catch(() => ({}))) as { message?: string };

    const [goal] = await db.select().from(goals).where(and(eq(goals.id, id), eq(goals.userId, user.id)));
    if (!goal) return jsonError("Not found", 404);

    const priorRows = await db
      .select()
      .from(chatMessages)
      .where(and(eq(chatMessages.goalId, id), eq(chatMessages.thread, "goal_intake")))
      .orderBy(asc(chatMessages.createdAt));

    const history = priorRows.map((r) => ({ role: r.role as "user" | "assistant", content: r.content }));

    if (message && message.trim()) {
      await db.insert(chatMessages).values({ userId: user.id, goalId: id, thread: "goal_intake", role: "user", content: message.trim() });
      history.push({ role: "user", content: message.trim() });
    } else if (history.length === 0) {
      history.push({ role: "user", content: "Hi, I'd like to set up this learning goal." });
    }

    const domainName = DOMAINS.find((d) => d.id === goal.domain)?.name ?? goal.domain;
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
    const resumeProfile = profile?.resumeProfile as
      | { summary: string; currentRole: string | null; careerGoal: string | null }
      | null;

    const result = await chatJson<IntakeResult>(
      goalIntakeMessages(domainName, goal.goalText, goal.trackPace, history, goal.domain, resumeProfile),
      { temperature: 0.6 },
    );

    await db.insert(chatMessages).values({ userId: user.id, goalId: id, thread: "goal_intake", role: "assistant", content: result.reply });

    if (result.done) {
      await db
        .update(goals)
        .set({
          subFocus: {
            tags: result.subFocus ?? [],
            motivation: result.motivation,
            timeframeWeeks: result.timeframeWeeks,
            mappedSkillIds: result.mappedSkillIds ?? [],
          },
          status: "beginner_check",
        })
        .where(eq(goals.id, id));
    }

    const updatedRows = await db
      .select()
      .from(chatMessages)
      .where(and(eq(chatMessages.goalId, id), eq(chatMessages.thread, "goal_intake")))
      .orderBy(asc(chatMessages.createdAt));

    return NextResponse.json({
      reply: result.reply,
      done: result.done,
      messages: updatedRows.map((r) => ({ role: r.role, content: r.content })),
    });
  });
}
