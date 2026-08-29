import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isValidDomain } from "@/lib/community";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AppSidebar } from "@/frontend/components/layout/AppSidebar";
import { CommunityFeed } from "@/frontend/components/community/CommunityFeed";
import { DOMAINS } from "@/data/domains";
import { IconArrowLeft } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

export default async function CommunityDomainPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  if (!isValidDomain(domain)) redirect("/community");

  let displayName = "yuvi";
  try {
    const user = await requireUser();
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
    if (profile?.displayName) displayName = profile.displayName;
  } catch (_err) {
    // Unauthenticated guest view of domain community
  }
  const domainMeta = DOMAINS.find((d) => d.id === domain)!;

  return (
    <div className="flex min-h-screen bg-[#F8F9FD] text-slate-900 font-sans">
      {/* 1. Left Sidebar Navigation */}
      <AppSidebar
        displayName={displayName}
        level={1}
        levelTitle="Newcomer"
      />

      {/* 2. Main Scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen relative">
        <main className="mx-auto w-full max-w-[1380px] px-6 sm:px-10 py-6 space-y-5">
          
          {/* Back Navigation Link */}
          <div>
            <Link
              href="/community"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7C3AED] hover:underline"
            >
              <IconArrowLeft className="h-3.5 w-3.5" />
              <span>Back to All Guilds</span>
            </Link>
          </div>

          {/* ================= HERO HEADER: BADGE + TITLE + 3D CODE EDITOR ================= */}
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Left Column: Icon Badge + Typography */}
            <div className="flex items-start gap-4 sm:gap-5 max-w-2xl">
              
              {/* Purple Square Icon Container with White Code Tag */}
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#7C3AED] text-white text-2xl sm:text-3xl font-black shadow-md shrink-0 border-4 border-white">
                {"</>"}
              </div>

              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#7C3AED]">
                  PEER DISCUSSION GUILD
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mt-0.5">
                  {domainMeta.name} <br className="hidden sm:inline" />
                  <span className="text-[#7C3AED]">Community Hub</span>
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                  A place for developers to share ideas, ask questions, and grow together.
                </p>
              </div>
            </div>

            {/* Right Column: Exact 3D Code Editor Window with Chat & Heart Bubbles */}
            <div className="shrink-0 hidden md:block">
              <Image
                src="/images/community/webdev_header_3d.png"
                alt="Web Development 3D Code Hub"
                width={280}
                height={160}
                className="object-contain select-none drop-shadow-sm"
                unoptimized
              />
            </div>

          </div>

          {/* ================= COMMUNITY FEED & INTERACTIVE CARDS ================= */}
          <div className="w-full">
            <CommunityFeed domain={domain} />
          </div>

          {/* Floating Mascot in Bottom-Right Corner */}
          <div className="fixed right-6 bottom-4 pointer-events-none z-20 hidden md:block">
            <Image
              src="/images/community/cute_ghost_mascot.png"
              alt="Mascot"
              width={40}
              height={40}
              className="object-contain opacity-90 drop-shadow-sm select-none"
              unoptimized
            />
          </div>

        </main>
      </div>
    </div>
  );
}
