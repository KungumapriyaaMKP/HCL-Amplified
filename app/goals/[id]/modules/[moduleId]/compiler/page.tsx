import { redirect } from "next/navigation";
import { requireUserOrRedirect } from "@/lib/auth";
import { getModuleDetail } from "@/lib/moduleDetail";
import { db } from "@/lib/db";
import { profiles, xpLedger, streaks } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { AppSidebar } from "@/frontend/components/layout/AppSidebar";
import { CompilerWorkspace } from "@/frontend/components/goals/CompilerWorkspace";

export default async function CompilerPage({ params }: { params: Promise<{ id: string; moduleId: string }> }) {
  const { id, moduleId } = await params;
  const user = await requireUserOrRedirect(`/goals/${id}/modules/${moduleId}/compiler`);
  const detail = await getModuleDetail(user.id, moduleId);
  if (!detail) redirect(`/goals/${id}`);

  let displayName = "Learner";
  let totalXp = 0;
  let streakDays = 0;

  try {
    const [profileResult, xpRowResult, streakRowResult] = await Promise.all([
      db.select().from(profiles).where(eq(profiles.userId, user.id)),
      db.select({ total: sql<number>`coalesce(sum(${xpLedger.amount}), 0)` }).from(xpLedger).where(eq(xpLedger.userId, user.id)),
      db.select().from(streaks).where(eq(streaks.userId, user.id)),
    ]);

    const [profile] = profileResult;
    if (profile?.displayName) displayName = profile.displayName;

    const [xpRow] = xpRowResult;
    if (xpRow) totalXp = Number(xpRow.total) || 0;

    const [streakRow] = streakRowResult;
    if (streakRow) streakDays = streakRow.currentStreak || 0;
  } catch (_err) {}

  const language =
    detail.module.programmingLanguage ||
    (detail.skill.name.toLowerCase().includes("python")
      ? "python"
      : detail.skill.name.toLowerCase().includes("type")
      ? "typescript"
      : detail.skill.name.toLowerCase().includes("sql")
      ? "python"
      : "javascript");

  return (
    <div className="flex min-h-screen bg-[#F8F9FD] text-slate-900 font-sans">
      {/* 1. Left Sidebar Navigation */}
      <AppSidebar
        displayName={displayName}
        level={1}
        levelTitle="Newcomer"
      />

      {/* 2. Main Scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen bg-[#F8F9FD] text-slate-900">
        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8">
          <CompilerWorkspace
            goalId={id}
            moduleId={moduleId}
            skillName={detail.skill.name}
            language={language}
            dayStreak={streakDays}
            totalXp={totalXp}
          />
        </main>
      </div>
    </div>
  );
}
