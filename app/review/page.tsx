import type { Metadata } from "next";
import { requireUserOrRedirect } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AppSidebar } from "@/frontend/components/layout/AppSidebar";
import { ReviewSession } from "@/frontend/components/review/ReviewSession";

export const metadata: Metadata = {
  title: "Adaptive Spaced Review",
  description: "Personalized spaced repetition review session powered by IRT decay modeling to keep your skills sharp.",
};

export default async function ReviewPage() {
  const user = await requireUserOrRedirect("/review");
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#FAF8FC] via-[#F5F2FB] to-[#ECE6F9] text-slate-900 font-sans">
      {/* 1. Left Sidebar Navigation */}
      <AppSidebar
        displayName={profile?.displayName || "Learner"}
        level={1}
        levelTitle="Newcomer"
      />

      {/* 2. Main Scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
          <div className="mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#7C3AED]">
              SPACED REPETITION ENGINE
            </span>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Daily Memory Calibration & Review Queue
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
              Reinforce fading competencies using the SM-2 decay schedule to lock in long-term mastery.
            </p>
          </div>

          <ReviewSession />
        </main>
      </div>
    </div>
  );
}
