import Link from "next/link";
import { Card, Badge } from "@/frontend/components/ui/Card";
import type { GoalDetail } from "@/lib/goalData";

const STATUS_STYLE: Record<string, { tone: "default" | "success" | "warning" | "accent"; label: string }> = {
  locked: { tone: "default", label: "Locked" },
  available: { tone: "accent", label: "Up next" },
  in_progress: { tone: "warning", label: "In progress" },
  completed: { tone: "success", label: "Completed" },
};

const MILESTONE_LABEL: Record<string, string> = {
  foundation: "Foundation",
  core: "Core",
  capstone: "Capstone",
  remediation: "Remediation",
};

export function ModuleCard({ item, goalId }: { item: GoalDetail["modules"][number]; goalId: string }) {
  const status = STATUS_STYLE[item.module.status] ?? STATUS_STYLE.locked;
  const clickable = item.module.status !== "locked";

  const body = (
    <Card className={`p-4 ${clickable ? "hover:border-accent/50" : "opacity-60"} transition-colors`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Badge tone="default" className="text-[10px]">{MILESTONE_LABEL[item.module.milestoneType] ?? item.module.milestoneType}</Badge>
            {item.module.isProgramming && <Badge tone="accent" className="text-[10px]">💻 {item.module.programmingLanguage}</Badge>}
          </div>
          <h3 className="font-medium">{item.skill.name}</h3>
          <p className="text-xs text-muted">
            {item.resource.type} · {item.resource.provider} · ~{Math.round(item.resource.estimatedMinutes / 60)}h
          </p>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>
      {item.module.rationale && (
        <p className="mt-3 line-clamp-1 text-sm text-muted">
          {item.module.rationale}
          {clickable && <span className="ml-1 text-accent">View details →</span>}
        </p>
      )}
    </Card>
  );

  return clickable ? <Link href={`/goals/${goalId}/modules/${item.module.id}`}>{body}</Link> : body;
}
