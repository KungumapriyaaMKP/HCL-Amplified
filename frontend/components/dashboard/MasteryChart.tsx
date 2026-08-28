import { Card } from "@/frontend/components/ui/Card";
import type { DashboardData } from "@/lib/dashboardData";

// Single-series magnitude comparison across skills -> horizontal bars, one
// sequential hue, sorted descending, direct value labels at the tip (so
// meaning never rides on color alone), muted track for the unfilled part.
export function MasteryChart({ mastery }: { mastery: DashboardData["mastery"] }) {
  if (mastery.length === 0) {
    return (
      <Card className="p-5">
        <h3 className="mb-1 text-sm font-semibold">Skill mastery</h3>
        <p className="text-sm text-muted">No skills assessed yet - start a goal to begin building this.</p>
      </Card>
    );
  }

  const top = mastery.slice(0, 12);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-base font-semibold">Skill mastery</h3>
        <p className="mt-1 text-xs text-muted">Top skills and your proficiency</p>
      </div>
      <div className="space-y-4">
        {top.map((m) => (
          <div key={m.skillId} className="group">
            <div className="mb-2 flex items-center justify-between">
              <span className="truncate text-sm font-medium text-foreground group-hover:text-accent transition-colors">{m.name}</span>
              <span className="text-right text-sm font-semibold tabular-nums text-accent">{m.score}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2/50 backdrop-blur-sm">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent/80 via-accent to-accent-2 transition-all duration-500"
                style={{ width: `${Math.max(2, m.score)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
