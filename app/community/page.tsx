import { requireUser } from "@/lib/auth";
import { getCommunityOverview } from "@/lib/community";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Nav } from "@/frontend/components/layout/Nav";
import { CommunityHubView } from "@/frontend/components/community/CommunityHubView";

export default async function CommunityLandingPage() {
  const user = await requireUser();
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
  const domains = await getCommunityOverview();

  return (
    <div className="min-h-screen bg-[#070913] text-white">
      <Nav displayName={profile?.displayName} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        
        {/* Header */}
        <div className="mb-8">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
            PEER NETWORKS & DISCUSSION HUBS
          </span>
          <h1 className="mt-1 text-3xl font-black text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.2)]">
            Domain Communities
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Join domain hubs to discuss concepts, share code solutions, and collaborate with peers across specialized engineering fields.
          </p>
        </div>

        {/* Interactive Community Hub Grid */}
        <CommunityHubView domains={domains} />

      </main>
    </div>
  );
}
