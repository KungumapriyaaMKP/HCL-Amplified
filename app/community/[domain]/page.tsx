import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isValidDomain } from "@/lib/community";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Nav } from "@/frontend/components/layout/Nav";
import { CommunityFeed } from "@/frontend/components/community/CommunityFeed";
import { DOMAINS } from "@/data/domains";
import Link from "next/link";

export default async function CommunityDomainPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  if (!isValidDomain(domain)) redirect("/community");

  const user = await requireUser();
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
  const domainMeta = DOMAINS.find((d) => d.id === domain)!;

  return (
    <div>
      <Nav displayName={profile?.displayName} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link href="/community" className="mb-2 inline-block text-sm text-muted hover:text-foreground">
          ‹ All communities
        </Link>
        <h1 className="mb-6 text-2xl font-semibold">
          {domainMeta.icon} {domainMeta.name} community
        </h1>
        <CommunityFeed domain={domain} />
      </main>
    </div>
  );
}
