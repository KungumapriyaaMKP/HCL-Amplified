import { Card } from "@/frontend/components/ui/card";
import { Badge } from "@/frontend/components/ui/badge";
import { ProgressBar } from "@/frontend/components/ui/progress-bar";
import type { DashboardData } from "@/lib/dashboardData";

export function GamificationHeader({ gamification }: { gamification: DashboardData["gamification"] }) {
  const pct = gamification.xpForNextLevel > 0 ? (gamification.xpIntoLevel / gamification.xpForNextLevel) * 100 : 0;

  return (
    <div className="mb-8 rounded-2xl border border-border/50 bg-gradient-to-br from-slate-900/30 via-slate-900/20 to-slate-900/30 p-6 backdrop-blur-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-5">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-accent via-accent/80 to-accent-2 text-xl font-bold text-white shadow-lg">
            L{gamification.level}
          </div>
          <div className="pt-1">
            <h3 className="text-lg font-semibold leading-tight">{gamification.levelTitle}</h3>
            <p className="mt-1 text-sm text-muted">{gamification.xp.toLocaleString()} XP total</p>
            {gamification.streak.currentStreak > 0 && (
              <p className="mt-2 text-xs font-medium text-orange-500"> {gamification.streak.currentStreak}-day streak</p>
            )}
          </div>
        </div>

        <div className="w-full md:w-auto md:min-w-[200px] flex-1 md:flex-none max-w-xs">
          <div className="mb-2 flex justify-between text-xs font-medium">
            <span className="text-muted">Level {gamification.level}</span>
            <span className="text-muted">Level {gamification.level + 1}</span>
          </div>
          <ProgressBar value={pct} />
          <p className="mt-2 text-right text-xs text-muted">
            {gamification.xpIntoLevel.toLocaleString()}/{gamification.xpForNextLevel.toLocaleString()} XP
          </p>
        </div>
      </div>

      {gamification.badges.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2 border-t border-border/30 pt-6">
          {gamification.badges.map((b) => (
            <Badge key={b.id} tone="accent" title={b.description}>
              <span>{b.icon}</span> {b.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
