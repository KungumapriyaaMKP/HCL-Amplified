import Link from "next/link";
import { Card } from "@/frontend/components/ui/Card";
import { Badge } from "@/frontend/components/ui/badge";
import { ProgressBar } from "@/frontend/components/ui/progress-bar";
import { DOMAINS } from "@/data/domains";
import type { DashboardData } from "@/lib/dashboardData";

const STATUS_LABEL: Record<string, string> = {
  intake: "Setting up",
  beginner_check: "Setting up",
  diagnostic: "Diagnostic quiz",
  ready: "Generating path",
  active: "In progress",
  completed: "Completed",
};

export function GoalCard({ goal }: { goal: DashboardData["goals"][number] }) {
  const domain = DOMAINS.find((d) => d.id === goal.domain);
  const pct = goal.totalModules > 0 ? (goal.completedModules / goal.totalModules) * 100 : 0;
  const inSetup = !goal.pathId;
  const href = inSetup ? `/goals/${goal.id}/setup` : `/goals/${goal.id}`;

  return (
    <Link href={href}>
      <Card className="group relative h-full overflow-hidden p-6 transition-all duration-300 hover:shadow-lg hover:border-accent/50">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0 opacity-0 transition-opacity duration-300 group-hover:from-accent/5 group-hover:to-accent/10 group-hover:opacity-100" />

        <div className="relative z-10 mb-4 flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">{domain?.icon} {domain?.name}</p>
            <h3 className="mt-2 text-base font-semibold leading-snug text-foreground">{goal.goalText}</h3>
          </div>
          <Badge tone={goal.status === "completed" ? "success" : "accent"} className="shrink-0">{STATUS_LABEL[goal.status] ?? goal.status}</Badge>
        </div>

        {goal.pathId ? (
          <>
            <div className="relative z-10 mb-3 space-y-2">
              <ProgressBar value={pct} />
              <p className="text-xs font-medium text-muted">
                {goal.completedModules}/{goal.totalModules} modules complete
              </p>
            </div>
            {goal.nextAction && (
              <div className="relative z-10 mt-4 rounded-lg bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 px-3 py-3 text-xs">
                <p className="text-muted">Next module:</p>
                <p className="mt-1 font-medium text-foreground">{goal.nextAction.skillName}</p>
                <p className="mt-1 text-muted text-xs">{goal.nextAction.resourceTitle}</p>
              </div>
            )}
          </>
        ) : (
          <p className="relative z-10 text-xs text-muted">Continue setting up this goal to generate your path.</p>
        )}
      </Card>
    </Link>
  );
}
