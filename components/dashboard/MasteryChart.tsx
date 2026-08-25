import { Card } from "@/components/ui/Card";
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
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-semibold">Skill mastery</h3>
      <div className="space-y-3">
        {top.map((m) => (
          <div key={m.skillId} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="truncate text-foreground">{m.name}</span>
              </div>
              <div className="h-3.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent/70 to-accent"
                  style={{ width: `${Math.max(2, m.score)}%` }}
                />
              </div>
            </div>
            <span className="w-10 text-right text-xs font-medium tabular-nums text-muted">{m.score}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
