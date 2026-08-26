import { db } from "@/lib/db";
import { communityMembers, communityPosts, communityReplies, profiles } from "@/db/schema";
import { eq, and, asc, desc, sql as sqlOp } from "drizzle-orm";
import { DOMAINS } from "@/data/domains";

export const POST_MAX_LENGTH = 2000;
export const REPLY_MAX_LENGTH = 1000;

export function isValidDomain(domain: string): boolean {
  return DOMAINS.some((d) => d.id === domain);
}

export async function getMembershipInfo(userId: string, domain: string) {
  const [membership] = await db
    .select()
    .from(communityMembers)
    .where(and(eq(communityMembers.userId, userId), eq(communityMembers.domain, domain)));
  const [row] = await db
    .select({ count: sqlOp<number>`count(*)::int` })
    .from(communityMembers)
    .where(eq(communityMembers.domain, domain));
  return { joined: !!membership, memberCount: row?.count ?? 0 };
}

export async function joinCommunity(userId: string, domain: string) {
  await db.insert(communityMembers).values({ userId, domain }).onConflictDoNothing();
}

/** All posts in a domain, newest first, each with its replies (oldest
 * first) and author display names attached - shaped once here so both the
 * server-rendered page and the API route consume the identical structure. */
export async function getDomainFeed(domain: string) {
  const posts = await db
    .select({ post: communityPosts, authorName: profiles.displayName })
    .from(communityPosts)
    .innerJoin(profiles, eq(profiles.userId, communityPosts.userId))
    .where(eq(communityPosts.domain, domain))
    .orderBy(desc(communityPosts.createdAt));

  const replies = await db
    .select({ reply: communityReplies, authorName: profiles.displayName })
    .from(communityReplies)
    .innerJoin(profiles, eq(profiles.userId, communityReplies.userId))
    .innerJoin(communityPosts, eq(communityPosts.id, communityReplies.postId))
    .where(eq(communityPosts.domain, domain))
    .orderBy(asc(communityReplies.createdAt));

  const repliesByPost = new Map<string, typeof replies>();
  for (const r of replies) {
    const list = repliesByPost.get(r.reply.postId) ?? [];
    list.push(r);
    repliesByPost.set(r.reply.postId, list);
  }

  return posts.map((p) => ({ ...p, replies: repliesByPost.get(p.post.id) ?? [] }));
}

export async function createPost(userId: string, domain: string, content: string) {
  const [row] = await db.insert(communityPosts).values({ userId, domain, content }).returning();
  return row;
}

export async function createReply(userId: string, postId: string, content: string) {
  const [row] = await db.insert(communityReplies).values({ userId, postId, content }).returning();
  return row;
}

export async function getPostDomain(postId: string): Promise<string | null> {
  const [row] = await db.select({ domain: communityPosts.domain }).from(communityPosts).where(eq(communityPosts.id, postId));
  return row?.domain ?? null;
}

/** Per-domain post/member counts for the community landing page. */
export async function getCommunityOverview() {
  const memberCounts = await db
    .select({ domain: communityMembers.domain, count: sqlOp<number>`count(*)::int` })
    .from(communityMembers)
    .groupBy(communityMembers.domain);
  const postCounts = await db
    .select({ domain: communityPosts.domain, count: sqlOp<number>`count(*)::int` })
    .from(communityPosts)
    .groupBy(communityPosts.domain);

  const members = new Map(memberCounts.map((r) => [r.domain, r.count]));
  const posts = new Map(postCounts.map((r) => [r.domain, r.count]));
  return DOMAINS.map((d) => ({ ...d, memberCount: members.get(d.id) ?? 0, postCount: posts.get(d.id) ?? 0 }));
}
