import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { learningEvents } from "@/db/schema";
import { getModuleForUser } from "@/lib/moduleAccess";
import { updatePreferenceScore } from "@/lib/adapt";

type TrackEventBody = {
  eventType: "open" | "complete" | "abandon" | "quiz_submit";
  modality?: string;
  timeSpentSeconds?: number;
  estimatedSeconds?: number;
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const body = (await req.json()) as TrackEventBody;

    const row = await getModuleForUser(user.id, id);
    if (!row) return jsonError("Not found", 404);

    const modality = body.modality ?? row.resource.type;
    const estimatedSeconds = body.estimatedSeconds ?? (row.resource.estimatedMinutes ? row.resource.estimatedMinutes * 60 : undefined);

    await db.insert(learningEvents).values({
      userId: user.id,
      moduleId: id,
      eventType: body.eventType,
      modality,
      timeSpentSeconds: body.timeSpentSeconds,
      estimatedSeconds,
    });

    if (body.eventType === "complete" && modality) {
      await updatePreferenceScore(user.id, modality, 1.0);
    } else if (body.eventType === "abandon" && modality) {
      await updatePreferenceScore(user.id, modality, 0.4);
    }

    return NextResponse.json({ ok: true });
  });
}
