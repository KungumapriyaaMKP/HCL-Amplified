import { redirect } from "next/navigation";
import { requireUserOrRedirect } from "@/lib/auth";
import { getGoalDetail } from "@/lib/goalData";
import { db } from "@/lib/db";
import { profiles, userBadges } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getTotalXp, levelForXp, levelTitle } from "@/lib/gamification";
import { AppSidebar } from "@/frontend/components/layout/AppSidebar";
import { JourneyMapView } from "@/frontend/components/goals/JourneyMapView";
import { DOMAINS } from "@/data/domains";

export default async function GoalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUserOrRedirect(`/goals/${id}`);
  const detail = await getGoalDetail(user.id, id);
  if (!detail) redirect("/dashboard");
  if (!detail.path) redirect(`/goals/${id}/setup`);

  let displayName = "Learner";
  let totalXp = 0;
  let gems = 0;

  try {
    const [profileResult, xpResult, badgesCountResult] = await Promise.all([
      db.select().from(profiles).where(eq(profiles.userId, user.id)),
      getTotalXp(user.id),
      db.select({ count: sql<number>`count(*)` }).from(userBadges).where(eq(userBadges.userId, user.id)),
    ]);

    const [profile] = profileResult;
    if (profile?.displayName) displayName = profile.displayName;
    totalXp = xpResult || 0;
    const [badgeRow] = badgesCountResult;
    gems = Number(badgeRow?.count || 0);
  } catch (_err) {}

  const userLevel = levelForXp(totalXp);
  const userLevelTitle = levelTitle(userLevel.level);
  const domain = DOMAINS.find((d) => d.id === detail.goal.domain);

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#FDFBF7] text-slate-900 font-sans">
      {/* 1. Left Sidebar Navigation */}
      <AppSidebar
        displayName={displayName}
        level={userLevel.level}
        levelTitle={userLevelTitle}
        activeGoalId={id}
      />

      {/* 2. Main 3D Journey Road Map Content with seamless scrolling */}
      <div className="flex-1 flex flex-col min-w-0 h-screen max-h-screen overflow-y-auto custom-scrollbar relative">
        <JourneyMapView
          goalId={id}
          goalTitle={detail.goal.goalText}
          domainName={domain?.name || "Web Development"}
          modules={detail.modules as any}
          userDisplayName={displayName}
          totalXp={totalXp}
          gems={gems}
        />
      </div>
    </div>
  );
}
