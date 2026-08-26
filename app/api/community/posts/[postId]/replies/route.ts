import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { createReply, getPostDomain, getMembershipInfo, REPLY_MAX_LENGTH } from "@/lib/community";

export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { postId } = await params;

    const { content } = (await req.json()) as { content: string };
    if (typeof content !== "string" || content.trim().length === 0) return jsonError("Reply content is required");
    if (content.length > REPLY_MAX_LENGTH) return jsonError(`Replies are limited to ${REPLY_MAX_LENGTH} characters`);

    const domain = await getPostDomain(postId);
    if (!domain) return jsonError("Post not found", 404);

    const { joined } = await getMembershipInfo(user.id, domain);
    if (!joined) return jsonError("Join this community before replying", 403);

    const reply = await createReply(user.id, postId, content.trim());
    return NextResponse.json({ reply });
  });
}
