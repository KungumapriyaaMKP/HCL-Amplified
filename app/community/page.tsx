import { requireUser } from "@/lib/auth";
import { getCommunityOverview } from "@/lib/community";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AppSidebar } from "@/frontend/components/layout/AppSidebar";
import { CommunityHubView } from "@/frontend/components/community/CommunityHubView";

import { DOMAINS } from "@/data/domains";

export default async function CommunityLandingPage() {
  let displayName = "Yuvi";
  try {
    const user = await requireUser();
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
    if (profile?.displayName) displayName = profile.displayName;
  } catch (_err) {
    // Unauthenticated guest view
  }

  let domains: any[] = [];
  try {
    domains = await getCommunityOverview();
  } catch (err) {
    console.error("Failed to load live community overview:", err);
  }

  if (!domains || domains.length === 0) {
    domains = DOMAINS.map((d) => ({ ...d, memberCount: 0, postCount: 0 }));
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FD] text-slate-900 font-sans">
      {/* 1. Left Sidebar Navigation */}
      <AppSidebar
        displayName={displayName}
        level={1}
        levelTitle="Newcomer"
      />

      {/* 2. Main Scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        <main className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 py-6 space-y-6">
          {/* Header */}
          <div className="max-w-2xl">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#7C3AED]">
              PEER NETWORKS & DISCUSSION HUBS
            </span>
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Domain Guilds & Communities
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
              Join domain hubs to discuss concepts, share code solutions, ask questions, and collaborate with peers.
            </p>
          </div>

          {/* Interactive Community Hub Grid */}
          <CommunityHubView domains={domains} />
        </main>
      </div>
    </div>
  );
}
