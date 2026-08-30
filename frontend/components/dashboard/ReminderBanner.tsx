import Link from "next/link";
import { Card } from "@/frontend/components/ui/Card";
import type { DashboardData } from "@/lib/dashboardData";
import { IconAlertCircle, IconFlame, IconCompass, IconArrowRight } from "@tabler/icons-react";

function daysSince(date: string | Date | null): number | null {
  if (!date) return null;
  const last = new Date(date);
  const today = new Date();
  const ms = today.setHours(0, 0, 0, 0) - last.setHours(0, 0, 0, 0);
  return Math.round(ms / 86_400_000);
}

export function ReminderBanner({
  goals,
  streak,
  disengagement,
}: {
  goals: DashboardData["goals"];
  streak: DashboardData["gamification"]["streak"];
  disengagement?: DashboardData["disengagement"];
}) {
  const withNextAction = goals.filter((g) => g.nextAction);
  const idleDays = daysSince((streak as { lastActiveDate?: string | Date | null }).lastActiveDate ?? null);

  if (disengagement?.atRisk && withNextAction.length > 0) {
    const next = withNextAction[0].nextAction!;
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-purple-500/50 bg-gradient-to-r from-purple-950/80 via-[#0d1226]/90 to-purple-950/80 p-4 shadow-[0_0_25px_rgba(168,85,247,0.3)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <IconAlertCircle className="h-6 w-6 text-purple-400 shrink-0" />
          <div>
            <p className="text-sm font-black text-white">
              Resume Your Path | <strong className="text-purple-300">{next.skillName}</strong> module is waiting.
            </p>
            <p className="text-xs text-slate-400">
              It has been {disengagement.daysSinceActive} days since your last session. Dive back in to maintain momentum.
            </p>
          </div>
        </div>
        <Link
          href={`/goals/${withNextAction[0].id}/modules/${next.moduleId}`}
          className="flex items-center gap-1.5 rounded-md border border-purple-400/50 bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-black text-white uppercase shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:brightness-110 active:scale-95"
        >
          <span>Resume Module</span>
          <IconArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (streak.currentStreak > 0 && idleDays !== null && idleDays >= 1) {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-orange-500/50 bg-gradient-to-r from-orange-950/80 via-[#0d1226]/90 to-orange-950/80 p-4 shadow-[0_0_25px_rgba(249,115,22,0.3)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <IconFlame className="h-6 w-6 text-orange-400 shrink-0 animate-pulse" />
          <p className="text-sm font-bold text-orange-200">
            Your <strong className="text-orange-400">{streak.currentStreak}-day streak</strong> is at risk. Complete a module today to maintain it.
          </p>
        </div>
        {withNextAction[0]?.nextAction && (
          <Link
            href={`/goals/${withNextAction[0].id}/modules/${withNextAction[0].nextAction.moduleId}`}
            className="flex items-center gap-1.5 rounded-md border border-orange-400/50 bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-2 text-xs font-black text-white uppercase shadow-[0_0_15px_rgba(249,115,22,0.5)] hover:brightness-110 active:scale-95"
          >
            <span>Defend Streak</span>
            <IconArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    );
  }

  if (withNextAction.length > 0) {
    const g = withNextAction[0];
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-purple-500/30 bg-[#0d1226]/90 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <IconCompass className="h-5 w-5 text-purple-400 shrink-0" />
          <p className="text-xs font-bold text-slate-300">
            Active Objective: <strong className="text-purple-300">{g.nextAction!.skillName}</strong> via <span className="text-slate-400">{g.nextAction!.resourceTitle}</span>
          </p>
        </div>
        <Link
          href={`/goals/${g.id}/modules/${g.nextAction!.moduleId}`}
          className="text-xs font-black text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1"
        >
          <span>Continue</span>
          <IconArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return null;
}
