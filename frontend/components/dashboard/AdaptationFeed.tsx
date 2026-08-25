import { Card, Badge } from "@/frontend/components/ui/Card";
import type { DashboardData } from "@/lib/dashboardData";

const TRIGGER_TONE: Record<string, "success" | "warning" | "accent"> = {
  low_proctored_score: "warning",
  high_proctored_score: "success",
  feedback_too_easy: "accent",
  feedback_too_hard: "accent",
};

export function AdaptationFeed({ adaptations }: { adaptations: DashboardData["adaptations"] }) {
  return (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-semibold">Why your path changed</h3>
      {adaptations.length === 0 ? (
        <p className="text-sm text-muted">No adaptations yet - this fills in as you take proctored tests and give feedback.</p>
      ) : (
        <ul className="space-y-3">
          {adaptations.map((a) => (
            <li key={a.id} className="border-l-2 border-border pl-3">
              <div className="mb-1 flex items-center gap-2">
                <Badge tone={TRIGGER_TONE[a.trigger] ?? "default"} className="text-[10px]">
                  {a.action.replace(/_/g, " ")}
                </Badge>
                <span className="text-[11px] text-muted">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-foreground/90">{a.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
