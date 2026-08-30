import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

// Only the descriptor (the numeric embedding) is returned here - never the
// reference photo. Matching happens client-side and only needs the numbers;
// the photo is stored purely for later human review of a flagged attempt,
// and has no reason to ever be fetched back down to the browser during a test.
export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
    return NextResponse.json({
      descriptor: (profile?.faceDescriptor as number[] | null) ?? null,
      photoDataUrl: (profile?.faceReferencePhoto as string | null) ?? null,
    });
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { descriptor, photoDataUrl } = (await req.json()) as { descriptor: number[]; photoDataUrl: string };
    if (!Array.isArray(descriptor) || descriptor.length === 0) return jsonError("descriptor is required");
    if (typeof photoDataUrl !== "string" || !photoDataUrl.startsWith("data:image/")) {
      return jsonError("photoDataUrl must be a data: image URL");
    }

    await db
      .update(profiles)
      .set({ faceDescriptor: descriptor, faceReferencePhoto: photoDataUrl })
      .where(eq(profiles.userId, user.id));

    return NextResponse.json({ ok: true });
  });
}
