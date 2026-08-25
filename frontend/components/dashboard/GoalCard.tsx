import Link from "next/link";
import { Card, Badge, ProgressBar } from "@/frontend/components/ui/Card";
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
      <Card className="h-full p-5 transition-colors hover:border-accent/50">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-muted">{domain?.icon} {domain?.name}</p>
            <h3 className="mt-1 font-semibold leading-snug">{goal.goalText}</h3>
          </div>
          <Badge tone={goal.status === "completed" ? "success" : "accent"}>{STATUS_LABEL[goal.status] ?? goal.status}</Badge>
        </div>

        {goal.pathId ? (
          <>
            <ProgressBar value={pct} className="mb-2" />
            <p className="text-xs text-muted">
              {goal.completedModules}/{goal.totalModules} modules complete
            </p>
            {goal.nextAction && (
              <p className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-xs">
                <span className="text-muted">Next: </span>
                {goal.nextAction.skillName} — {goal.nextAction.resourceTitle}
              </p>
            )}
          </>
        ) : (
          <p className="text-xs text-muted">Continue setting up this goal to generate your path.</p>
        )}
      </Card>
    </Link>
  );
}
