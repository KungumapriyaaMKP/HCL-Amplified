import Link from "next/link";
import { Card } from "@/frontend/components/ui/Card";
import type { DashboardData } from "@/lib/dashboardData";

function daysSince(date: string | Date | null): number | null {
  if (!date) return null;
  const last = new Date(date);
  const today = new Date();
  const ms = today.setHours(0, 0, 0, 0) - last.setHours(0, 0, 0, 0);
  return Math.round(ms / 86_400_000);
}

/**
 * The "remind them" step of the flow: a lightweight nudge back into
 * whatever's next, surfaced every time the learner lands on the dashboard
 * rather than something that needs a notification/email pipeline. Picks the
 * single most relevant thing to say - streak-at-risk beats "pick up where
 * you left off" beats nothing, so it never stacks multiple banners.
 */
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
      <Card className="mb-6 flex flex-wrap items-center justify-between gap-3 border-accent/40 bg-accent/10 p-4">
        <div>
          <p className="text-sm font-medium">
            👋 Pick up where you left off — your <strong>{next.skillName}</strong> module is waiting.
          </p>
          <p className="text-xs text-muted">
            It&apos;s been {disengagement.daysSinceActive} days since your last session. Dive back in to keep momentum going!
          </p>
        </div>
        <Link
          href={`/goals/${withNextAction[0].id}/modules/${next.moduleId}`}
          className="text-sm font-semibold text-accent hover:underline"
        >
          Resume module →
        </Link>
      </Card>
    );
  }

  if (streak.currentStreak > 0 && idleDays !== null && idleDays >= 1) {
    return (
      <Card className="mb-6 flex flex-wrap items-center justify-between gap-3 border-warning/30 bg-warning/5 p-4">
        <p className="text-sm">
          🔥 You&apos;re on a <strong>{streak.currentStreak}-day streak</strong> - it&apos;ll reset if you don&apos;t complete
          something today.
        </p>
        {withNextAction[0]?.nextAction && (
          <Link
            href={`/goals/${withNextAction[0].id}/modules/${withNextAction[0].nextAction.moduleId}`}
            className="text-sm font-medium text-accent hover:underline"
          >
            Continue {withNextAction[0].nextAction.skillName} →
          </Link>
        )}
      </Card>
    );
  }

  if (withNextAction.length > 0) {
    const g = withNextAction[0];
    return (
      <Card className="mb-6 flex flex-wrap items-center justify-between gap-3 border-accent/30 bg-accent/5 p-4">
        <p className="text-sm">
          Pick up where you left off: <strong>{g.nextAction!.skillName}</strong> via {g.nextAction!.resourceTitle}
        </p>
        <Link href={`/goals/${g.id}/modules/${g.nextAction!.moduleId}`} className="text-sm font-medium text-accent hover:underline">
          Continue →
        </Link>
      </Card>
    );
  }

  return null;
}
