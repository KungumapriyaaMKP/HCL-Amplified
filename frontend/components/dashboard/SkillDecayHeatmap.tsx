import { Card } from "@/frontend/components/ui/Card";
import { Badge } from "@/frontend/components/ui/badge";
import type { DashboardData } from "@/lib/dashboardData";
import { IconBrain, IconRefresh, IconArrowRight } from "@tabler/icons-react";

const TIER: Record<string, { tone: "success" | "warning" | "danger"; label: string }> = {
  fresh: { tone: "success", label: "Active" },
  fading: { tone: "warning", label: "Fading" },
  decayed: { tone: "danger", label: "Depleted" },
};

export function SkillDecayHeatmap({
  decay,
  reviewSuggestions,
}: {
  decay: DashboardData["decay"];
  reviewSuggestions: DashboardData["reviewSuggestions"];
}) {
  if (decay.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <IconBrain className="h-5 w-5 text-purple-400" />
          <span>SKILL VITALITY MATRIX</span>
        </h3>
        <p className="mt-2 text-xs text-slate-400">Tracks memory retention and suggests reinforcement sessions once skills are mastered.</p>
      </Card>
    );
  }

  const fadingFoundational = decay.filter((d) => d.foundational && d.tier !== "fresh" && reviewSuggestions[d.skillId]);

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
            <IconBrain className="h-5 w-5 text-purple-400" />
            <span>SKILL VITALITY & RETENTION</span>
          </h3>
          <p className="mt-1 text-xs text-slate-400">Reinforcement status based on memory curve</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {decay.map((d) => {
          const t = TIER[d.tier] ?? TIER.fresh;
          return (
            <Badge key={d.skillId} tone={t.tone} title={`${d.daysSince} day(s) since last reinforcement`}>
              <span>{d.name}</span>
              <span className="opacity-70 ml-1">· {d.daysSince}d</span>
            </Badge>
          );
        })}
      </div>

      {fadingFoundational.length > 0 && (
        <div className="space-y-3 border-t border-purple-500/20 pt-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <IconRefresh className="h-4 w-4" />
              <span>REINFORCEMENT SUGGESTED</span>
            </p>
            <p className="mt-0.5 text-xs text-slate-400">Prevent foundational skill decay before advancing:</p>
          </div>
          <div className="space-y-2">
            {fadingFoundational.map((d) => (
              <a
                key={d.skillId}
                href={reviewSuggestions[d.skillId].url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-md border border-amber-500/30 bg-amber-950/30 px-4 py-3 text-xs transition-all hover:bg-amber-950/60 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              >
                <div>
                  <p className="font-bold text-white group-hover:text-amber-300 transition-colors">{d.name}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{reviewSuggestions[d.skillId].title}</p>
                </div>
                <span className="ml-3 shrink-0 flex items-center gap-1 font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                  <span>Review Resource</span>
                  <IconArrowRight className="h-3.5 w-3.5" />
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
