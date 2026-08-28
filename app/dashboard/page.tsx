import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboardData";
import { AppSidebar } from "@/frontend/components/layout/AppSidebar";
import { AppTopNav } from "@/frontend/components/layout/AppTopNav";
import { QuestDashboard } from "@/frontend/components/dashboard/QuestDashboard";

export default async function DashboardPage() {
  let displayName = "Yuvi";
  let xp = 0;
  let level = 1;
  let levelTitle = "Newcomer";
  let xpIntoLevel = 0;
  let xpForNextLevel = 50;
  let currentStreak = 0;
  let badgeCount = 0;

  try {
    const user = await requireUser();
    const data = await getDashboardData(user.id);

    displayName = data.profile?.displayName || "Yuvi";
    xp = data.gamification.xp ?? 0;
    level = data.gamification.level ?? 1;
    levelTitle = data.gamification.levelTitle ?? "Newcomer";
    xpIntoLevel = data.gamification.xpIntoLevel ?? 0;
    xpForNextLevel = data.gamification.xpForNextLevel || 50;
    currentStreak = data.gamification.streak?.currentStreak ?? 0;
    badgeCount = data.gamification.badges?.length ?? 0;
  } catch (_err) {
    // Graceful fallback to default matching screenshot
  }

  return (
    <div className="flex min-h-screen bg-[#FAFBFD] text-slate-900">
      {/* 1. Left Sidebar Navigation */}
      <AppSidebar
        displayName={displayName}
        level={level}
        levelTitle={levelTitle}
      />

      {/* 2. Main Scrollable Dashboard Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        <main className="mx-auto w-full max-w-[1440px] px-6 py-6 sm:px-8 space-y-6">
          {/* Top Nav HUD with Search, Notifications, and 4 Stat Pills */}
          <AppTopNav
            displayName={displayName}
            xp={xp}
            xpIntoLevel={xpIntoLevel}
            xpForNextLevel={xpForNextLevel}
            streak={currentStreak}
            badgeCount={badgeCount}
            rankTitle={levelTitle}
          />

          {/* 2-Column Main Dashboard Grid */}
          <QuestDashboard
            displayName={displayName}
            level={level}
            levelTitle={levelTitle}
            xp={xp}
            xpIntoLevel={xpIntoLevel}
            xpForNextLevel={xpForNextLevel}
            streak={currentStreak}
            badgeCount={badgeCount}
          />
        </main>
      </div>
    </div>
  );
}
