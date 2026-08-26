import { requireUser } from "@/lib/auth";
import { getCommunityOverview } from "@/lib/community";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Nav } from "@/frontend/components/layout/Nav";
import { Card, Badge } from "@/frontend/components/ui/Card";
import Link from "next/link";

export default async function CommunityLandingPage() {
  const user = await requireUser();
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
  const domains = await getCommunityOverview();

  return (
    <div>
      <Nav displayName={profile?.displayName} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="mb-1 text-2xl font-semibold">Community</h1>
        <p className="mb-6 text-sm text-muted">
          Join the discussion for whichever domain you&apos;re learning - ask questions, compare notes, help someone
          else out.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((d) => (
            <Link key={d.id} href={`/community/${d.id}`}>
              <Card className="h-full p-5 transition-colors hover:border-accent/50">
                <div className="mb-3 text-2xl">{d.icon}</div>
                <h3 className="mb-2 font-semibold">{d.name}</h3>
                <div className="flex gap-2">
                  <Badge>{d.memberCount} member{d.memberCount === 1 ? "" : "s"}</Badge>
                  <Badge>{d.postCount} post{d.postCount === 1 ? "" : "s"}</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
