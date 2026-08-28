import { Card } from "@/frontend/components/ui/Card";
import { Badge } from "@/frontend/components/ui/badge";
import type { DashboardData } from "@/lib/dashboardData";

// Status encoding (state, not magnitude): a small fixed 3-step scale with
// reserved meaning (good -> warning -> critical), always icon + label, never
// color alone - this is exactly the "decay tier" job, not a sequential ramp.
const TIER: Record<string, { tone: "success" | "warning" | "danger"; icon: string; label: string }> = {
  fresh: { tone: "success", icon: "●", label: "Fresh" },
  fading: { tone: "warning", icon: "◐", label: "Fading" },
  decayed: { tone: "danger", icon: "○", label: "Decayed" },
};

/**
 * Skill-decay heatmap: every skill the learner has ever mastered, colored by
 * how long it's been since that mastery was last reinforced (a diagnostic,
 * practice, or proctored score touching it) - not since it was first
 * learned. Fading/decayed *foundational* skills get a one-click review link
 * straight to a suggested resource (lib/decay.ts + the same recommendation
 * engine that built the original path).
 */
export function SkillDecayHeatmap({
  decay,
  reviewSuggestions,
}: {
  decay: DashboardData["decay"];
  reviewSuggestions: DashboardData["reviewSuggestions"];
}) {
  if (decay.length === 0) {
    return (
      <Card className="p-5">
        <h3 className="mb-1 text-sm font-semibold">Skill decay</h3>
        <p className="text-sm text-muted">Nothing to show yet - this fills in once you&apos;ve mastered at least one skill.</p>
      </Card>
    );
  }

  const fadingFoundational = decay.filter((d) => d.foundational && d.tier !== "fresh" && reviewSuggestions[d.skillId]);

  return (
    <Card className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold">Skill decay</h3>
          <p className="mt-1 text-xs text-muted">Days since last reinforced</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {decay.map((d) => {
          const t = TIER[d.tier];
          return (
            <Badge key={d.skillId} tone={t.tone} title={`${d.daysSince} day(s) since last touched`}>
              {t.icon} {d.name} · {d.daysSince}d
            </Badge>
          );
        })}
      </div>

      {fadingFoundational.length > 0 && (
        <div className="space-y-3 border-t border-border/50 pt-6">
          <div>
            <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide"> Review suggested</p>
            <p className="mt-1 text-xs text-muted">Before these foundational skills fade further:</p>
          </div>
          <div className="space-y-2">
            {fadingFoundational.map((d) => (
              <a
                key={d.skillId}
                href={reviewSuggestions[d.skillId].url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs transition-all hover:bg-amber-500/10 hover:border-amber-500/40"
              >
                <div>
                  <p className="font-semibold text-foreground group-hover:text-amber-400 transition-colors">{d.name}</p>
                  <p className="mt-1 text-muted text-xs">{reviewSuggestions[d.skillId].title}</p>
                </div>
                <span className="ml-3 shrink-0 text-amber-500 font-medium group-hover:translate-x-1 transition-transform">Review →</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
