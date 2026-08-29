import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { dailyTasks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const tasks = await db
      .select()
      .from(dailyTasks)
      .where(eq(dailyTasks.userId, user.id))
      .orderBy(desc(dailyTasks.createdAt));

    return NextResponse.json({ tasks });
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === "string" ? body.title.trim() : "";

    if (!title) {
      return jsonError("Task title is required", 400);
    }

    const [task] = await db
      .insert(dailyTasks)
      .values({
        userId: user.id,
        title,
        completed: false,
      })
      .returning();

    return NextResponse.json({ task }, { status: 201 });
  });
}
