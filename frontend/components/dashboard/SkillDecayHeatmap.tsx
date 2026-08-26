import { Card, Badge } from "@/frontend/components/ui/Card";
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
    <Card className="p-5">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Skill decay</h3>
        <span className="text-xs text-muted">days since last reinforced</span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
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
        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-xs font-medium text-muted">Quick reviews before these foundational skills fade further:</p>
          {fadingFoundational.map((d) => (
            <a
              key={d.skillId}
              href={reviewSuggestions[d.skillId].url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-xs hover:bg-[#222b40]"
            >
              <span>
                <span className="font-medium text-foreground">{d.name}</span>
                <span className="text-muted"> — {reviewSuggestions[d.skillId].title}</span>
              </span>
              <span className="text-accent">Review →</span>
            </a>
          ))}
        </div>
      )}
    </Card>
  );
}
