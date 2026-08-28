import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isValidDomain } from "@/lib/community";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AppSidebar } from "@/frontend/components/layout/AppSidebar";
import { CommunityFeed } from "@/frontend/components/community/CommunityFeed";
import { DOMAINS } from "@/data/domains";
import { DomainIcon } from "@/frontend/components/ui/DomainIcon";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

export default async function CommunityDomainPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  if (!isValidDomain(domain)) redirect("/community");

  const user = await requireUser();
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
  const domainMeta = DOMAINS.find((d) => d.id === domain)!;

  return (
    <div className="flex min-h-screen bg-[#F8F9FD] text-slate-900 font-sans">
      {/* 1. Left Sidebar Navigation */}
      <AppSidebar
        displayName={profile?.displayName || "Yuvi"}
        level={1}
        levelTitle="Newcomer"
      />

      {/* 2. Main Scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        <main className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 py-6 space-y-6">
          <Link
            href="/community"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7C3AED] hover:underline"
          >
            <IconArrowLeft className="h-4 w-4" />
            <span>Back to All Guilds</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-none border border-purple-200 bg-white p-2 shadow-xs shrink-0 overflow-hidden">
              {["web-dev", "data-science", "ai-ml", "cloud-devops", "mobile-dev", "cybersecurity"].includes(domainMeta.id) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/guilds/${domainMeta.id}.png`}
                  alt={domainMeta.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <DomainIcon id={domainMeta.id} className="h-7 w-7 text-[#7C3AED]" />
              )}
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#7C3AED]">
                PEER DISCUSSION GUILD
              </span>
              <h1 className="mt-0.5 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {domainMeta.name} Community Hub
              </h1>
            </div>
          </div>

          <div className="max-w-4xl">
            <CommunityFeed domain={domain} />
          </div>
        </main>
      </div>
    </div>
  );
}
