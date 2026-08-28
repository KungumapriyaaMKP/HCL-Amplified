import { Card } from "@/frontend/components/ui/Card";
import { Badge } from "@/frontend/components/ui/badge";
import type { DashboardData } from "@/lib/dashboardData";
import { IconAdjustments } from "@tabler/icons-react";

const TRIGGER_TONE: Record<string, "success" | "warning" | "accent" | "cyan"> = {
  low_proctored_score: "warning",
  high_proctored_score: "success",
  feedback_too_easy: "cyan",
  feedback_too_hard: "accent",
};

export function AdaptationFeed({ adaptations }: { adaptations: DashboardData["adaptations"] }) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
            <IconAdjustments className="h-5 w-5 text-purple-400" />
            <span>AI ADAPTIVE PATH LOG</span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">Dynamic curriculum adjustments & remediation history</p>
        </div>
      </div>

      {adaptations.length === 0 ? (
        <p className="text-xs text-slate-400">
          No adaptations logged yet — as you complete assessments and provide feedback, the AI dynamically reconfigures your curriculum roadmap.
        </p>
      ) : (
        <ul className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
          {adaptations.map((a) => (
            <li key={a.id} className="relative rounded-md border border-purple-500/20 bg-[#070918]/80 p-3 pl-4 border-l-4 border-l-purple-500">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <Badge tone={TRIGGER_TONE[a.trigger] ?? "accent"} className="text-[9px]">
                  {a.action.replace(/_/g, " ")}
                </Badge>
                <span className="text-[10px] font-bold text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-xs font-medium text-slate-200 leading-relaxed">{a.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
