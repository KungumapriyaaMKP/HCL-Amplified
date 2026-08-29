import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { dailyTasks } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const updateFields: { completed?: boolean; title?: string } = {};
    if (typeof body.completed === "boolean") {
      updateFields.completed = body.completed;
    }
    if (typeof body.title === "string" && body.title.trim()) {
      updateFields.title = body.title.trim();
    }

    if (Object.keys(updateFields).length === 0) {
      return jsonError("No valid fields to update", 400);
    }

    const [updated] = await db
      .update(dailyTasks)
      .set(updateFields)
      .where(and(eq(dailyTasks.id, id), eq(dailyTasks.userId, user.id)))
      .returning();

    if (!updated) {
      return jsonError("Task not found", 404);
    }

    return NextResponse.json({ task: updated });
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;

    const [deleted] = await db
      .delete(dailyTasks)
      .where(and(eq(dailyTasks.id, id), eq(dailyTasks.userId, user.id)))
      .returning();

    if (!deleted) {
      return jsonError("Task not found", 404);
    }

    return NextResponse.json({ success: true });
  });
}
