import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
    return NextResponse.json({ profile: profile ?? null });
  });
}

export async function PATCH(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const body = await req.json();
    const { displayName, avatarUrl } = body;

    const updates: Record<string, unknown> = {};
    if (typeof displayName === "string" && displayName.trim().length > 0) {
      updates.displayName = displayName.trim();
    }
    if (typeof avatarUrl === "string") {
      updates.avatarUrl = avatarUrl;
    }

    if (Object.keys(updates).length > 0) {
      await db.update(profiles).set(updates).where(eq(profiles.userId, user.id));
    }

    const [updated] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
    return NextResponse.json({ profile: updated });
  });
}
