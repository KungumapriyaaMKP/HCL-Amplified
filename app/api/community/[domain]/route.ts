import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { getDomainFeed, getMembershipInfo, createPost, isValidDomain, POST_MAX_LENGTH } from "@/lib/community";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ domain: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { domain } = await params;
    if (!isValidDomain(domain)) return jsonError("Unknown domain", 404);

    const [feed, membership] = await Promise.all([getDomainFeed(domain), getMembershipInfo(user.id, domain)]);
    return NextResponse.json({ posts: feed, ...membership });
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ domain: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { domain } = await params;
    if (!isValidDomain(domain)) return jsonError("Unknown domain", 404);

    const { content } = (await req.json()) as { content: string };
    if (typeof content !== "string" || content.trim().length === 0) return jsonError("Post content is required");
    if (content.length > POST_MAX_LENGTH) return jsonError(`Posts are limited to ${POST_MAX_LENGTH} characters`);

    const { joined } = await getMembershipInfo(user.id, domain);
    if (!joined) return jsonError("Join this community before posting", 403);

    const post = await createPost(user.id, domain, content.trim());
    return NextResponse.json({ post });
  });
}
