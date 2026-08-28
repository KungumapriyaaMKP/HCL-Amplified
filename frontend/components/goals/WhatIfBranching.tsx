"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/frontend/components/ui/Card";
import { Button } from "@/frontend/components/ui/Button";
import { DOMAINS } from "@/data/domains";
import type { WhatIfComparison } from "@/lib/whatif";

const POPULAR_TARGETS = [
  { domain: "web-dev", role: "Full-Stack Web Architect", title: "Full-Stack Web Developer", icon: "🌐" },
  { domain: "ai-ml", role: "AI Systems & LLM Specialist", title: "AI/ML Systems Engineer", icon: "🤖" },
  { domain: "cloud-devops", role: "Cloud Infrastructure Architect", title: "Cloud & DevOps Engineer", icon: "☁️" },
  { domain: "data-science", role: "Data Scientist & Analytics Lead", title: "Data Scientist", icon: "📊" },
  { domain: "mobile-dev", role: "Cross-Platform Mobile Engineer", title: "Mobile Developer", icon: "📱" },
  { domain: "cybersecurity", role: "Cyber Defense & Security Specialist", title: "Cybersecurity Analyst", icon: "🛡️" },
];

export function WhatIfBranching({ goalId }: { goalId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedTarget, setSelectedTarget] = useState(POPULAR_TARGETS[0]);
  const [comparison, setComparison] = useState<WhatIfComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    async function fetchComparison() {
      setLoading(true);
      try {
        const res = await fetch(`/api/goals/${goalId}/whatif`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetDomain: selectedTarget.domain,
            targetRole: selectedTarget.role,
          }),
        });
        const body = await res.json();
        if (res.ok && body.comparison) {
          setComparison(body.comparison);
        }
      } catch (e) {
        console.error("Failed to compare what-if branch:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchComparison();
  }, [goalId, selectedTarget]);

  async function handleSwitchTrack() {
    if (!confirm(`Switch to "${selectedTarget.title}" track? This will set up your new goal.`)) return;
    setSwitching(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: selectedTarget.domain,
          trackPace: "balanced",
          goalText: selectedTarget.role,
        }),
      });
      const body = await res.json();
      if (res.ok && body.goal?.id) {
        startTransition(() => {
          router.push(`/goals/${body.goal.id}/setup`);
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSwitching(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-accent">
            What-If Career Simulator
          </span>
          <span className="rounded-md border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
            Read-Only Simulation
          </span>
        </div>
        <h2 className="mt-1 text-lg font-bold text-foreground">Explore Career & Role Pivots</h2>
        <p className="text-xs text-muted">
          Compare your active progress against hypothetical alternative tracks. Check skill overlap and pivot runway with zero changes to your active roadmap.
        </p>
      </div>

      {/* Target Role Selector */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
        {POPULAR_TARGETS.map((t) => {
          const isSelected = selectedTarget.domain === t.domain && selectedTarget.role === t.role;
          return (
            <button
              key={t.domain}
              onClick={() => setSelectedTarget(t)}
              className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                isSelected
                  ? "border-accent bg-accent/10 ring-1 ring-accent"
                  : "border-border bg-surface hover:border-accent/40"
              }`}
            >
              <div className="text-lg">{t.icon}</div>
              <div className="mt-1 text-xs font-semibold text-foreground truncate">{t.title}</div>
            </button>
          );
        })}
      </div>

      {loading ? (
        <Card className="py-12 text-center text-xs text-muted">
          <span className="animate-pulse font-medium text-accent">Simulating A* pivot path...</span>
        </Card>
      ) : comparison ? (
        <div className="space-y-4">
          {/* Delta Metric Stats */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card className="p-4 bg-surface">
              <span className="text-xs text-muted">Skill Transferability</span>
              <div className="mt-1 text-2xl font-bold text-emerald-400">
                {Math.round(comparison.transferabilityRatio * 100)}%
              </div>
              <p className="mt-0.5 text-[11px] text-muted">
                {comparison.sharedSkills.length} shared skills carry over
              </p>
            </Card>

            <Card className="p-4 bg-surface">
              <span className="text-xs text-muted">Pivot Study Time</span>
              <div className="mt-1 text-2xl font-bold text-foreground">
                ~{comparison.deltaHours} hrs
              </div>
              <p className="mt-0.5 text-[11px] text-muted">
                Estimated ~{comparison.deltaWeeks} weeks to pivot
              </p>
            </Card>

            <Card className="p-4 bg-surface flex flex-col justify-between">
              <div>
                <span className="text-xs text-muted">Remaining Target Gaps</span>
                <div className="mt-1 text-2xl font-bold text-amber-400">
                  {comparison.uniqueGapSkills.length}
                </div>
              </div>
              <Button
                size="sm"
                disabled={switching || isPending}
                onClick={handleSwitchTrack}
                className="mt-2 text-xs"
              >
                {switching ? "Switching..." : "Switch to this Track →"}
              </Button>
            </Card>
          </div>

          {/* Side by side skills */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Shared Skills */}
            <Card className="p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                ✓ Transferable Skills ({comparison.sharedSkills.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {comparison.sharedSkills.map((s) => (
                  <span
                    key={s.id}
                    className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-300"
                  >
                    {s.name}
                  </span>
                ))}
                {comparison.sharedSkills.length === 0 && (
                  <span className="text-xs text-muted">No direct prerequisite overlap.</span>
                )}
              </div>
            </Card>

            {/* Gap Skills to Learn */}
            <Card className="p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                ⚡ Skills to Master for Pivot ({comparison.uniqueGapSkills.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {comparison.uniqueGapSkills.map((s) => (
                  <span
                    key={s.id}
                    className="rounded-lg border border-border bg-surface-2 px-2 py-1 text-[11px] font-medium text-foreground"
                  >
                    {s.name} <span className="text-muted text-[10px]">({s.estimatedHours}h)</span>
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
