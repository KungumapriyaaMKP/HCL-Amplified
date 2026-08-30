import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { focusSessions } from "@/db/schema";

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));

    const plannedSeconds = Number(body.plannedSeconds) || 25 * 60;
    const moduleId = typeof body.moduleId === "string" ? body.moduleId : null;
    const skillId = typeof body.skillId === "string" ? body.skillId : null;

    const [session] = await db
      .insert(focusSessions)
      .values({
        userId: user.id,
        moduleId,
        skillId,
        plannedSeconds,
        actualSeconds: 0,
        completed: false,
        interruptions: 0,
      })
      .returning();

    return NextResponse.json({ id: session.id, session }, { status: 201 });
  });
}
