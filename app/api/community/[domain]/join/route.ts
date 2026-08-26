import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { joinCommunity, isValidDomain } from "@/lib/community";

export async function POST(_req: Request, { params }: { params: Promise<{ domain: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { domain } = await params;
    if (!isValidDomain(domain)) return jsonError("Unknown domain", 404);

    await joinCommunity(user.id, domain);
    return NextResponse.json({ ok: true });
  });
}
