import { Card, Badge, ProgressBar } from "@/components/ui/Card";
import type { DashboardData } from "@/lib/dashboardData";

export function GamificationHeader({ gamification }: { gamification: DashboardData["gamification"] }) {
  const pct = gamification.xpForNextLevel > 0 ? (gamification.xpIntoLevel / gamification.xpForNextLevel) * 100 : 0;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-lg font-bold text-white">
            L{gamification.level}
          </div>
          <div>
            <p className="text-sm font-semibold">{gamification.levelTitle}</p>
            <p className="text-xs text-muted">{gamification.xp} XP total</p>
          </div>
        </div>

        <div className="min-w-[180px] flex-1 max-w-xs">
          <div className="mb-1 flex justify-between text-xs text-muted">
            <span>Level {gamification.level}</span>
            <span>Level {gamification.level + 1}</span>
          </div>
          <ProgressBar value={pct} />
          <p className="mt-1 text-right text-xs text-muted">
            {gamification.xpIntoLevel}/{gamification.xpForNextLevel} XP
          </p>
        </div>

        <Badge tone={gamification.streak.currentStreak > 0 ? "warning" : "default"} className="text-sm">
          🔥 {gamification.streak.currentStreak}-day streak
        </Badge>
      </div>

      {gamification.badges.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          {gamification.badges.map((b) => (
            <Badge key={b.id} tone="accent" title={b.description}>
              <span>{b.icon}</span> {b.name}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}
