"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getRoles,
  createPlan,
  compareRoles,
  RoleItem,
  RoleCompareResponse,
} from "@/lib/api/pathfinder";
import { storePlan } from "@/lib/planStore";
import { Pill } from "@/components/ui/Pill";
import { Card } from "@/components/ui/Card";
import { NumberTicker } from "@/components/ui/NumberTicker";

export function WhatIfBranching() {
  const router = useRouter();
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("ml-engineer");
  const [targetRole, setTargetRole] = useState<string>("full-stack-engineer");
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [comparison, setComparison] = useState<RoleCompareResponse | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getRoles();
        setRoles(res.roles);
      } catch (e) {
        console.error("Failed to load roles:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function fetchComparison() {
      if (!selectedRole || !targetRole || selectedRole === targetRole) {
        setComparison(null);
        return;
      }
      setComparing(true);
      try {
        const res = await compareRoles(selectedRole, targetRole);
        setComparison(res);
      } catch (e) {
        console.error("Failed to compare roles:", e);
      } finally {
        setComparing(false);
      }
    }
    fetchComparison();
  }, [selectedRole, targetRole]);

  const handleSwitchTrack = async (roleName: string) => {
    setGenerating(true);
    try {
      const plan = await createPlan({
        goal: roleName,
        hours_per_week: 10.0,
        priority: "balanced",
      });
      storePlan(plan);
      router.push("/roadmap");
    } catch (e) {
      console.error("Failed to switch track:", e);
    } finally {
      setGenerating(false);
    }
  };

  const currentRoleObj = roles.find((r) => r.id === selectedRole) || roles[0];
  const targetRoleObj = roles.find((r) => r.id === targetRole) || roles[1];

  if (loading) {
    return (
      <div className="py-16 text-center space-y-2">
        <div className="text-sm font-semibold text-ink animate-pulse">
          Loading career tracks...
        </div>
        <p className="text-xs text-muted">Fetching live market demand and skill tracks</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 4 Role Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((role) => {
          const isSelected = selectedRole === role.id;
          const isTarget = targetRole === role.id;

          return (
            <Card
              key={role.id}
              onClick={() => {
                if (selectedRole !== role.id) {
                  setTargetRole(role.id);
                }
              }}
              className={`p-5 bg-canvas border transition-all cursor-pointer space-y-3 flex flex-col justify-between ${
                isSelected
                  ? "border-ink ring-2 ring-ink/20 shadow-md"
                  : isTarget
                  ? "border-amber-500 ring-2 ring-amber-500/20 shadow-xs"
                  : "border-border hover:border-ink/40"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    {role.demand_snapshot_date} Demand
                  </span>
                  <Pill variant="mastered">
                    {Math.round(role.demand_score * 100)}% Index
                  </Pill>
                </div>

                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-sm font-bold text-ink">{role.name}</h3>
                  {isSelected && (
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      Current
                    </span>
                  )}
                  {isTarget && !isSelected && (
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      Target
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted leading-relaxed line-clamp-3">
                  {role.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted font-mono">{role.skills_count} Canonical Skills</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwitchTrack(role.name);
                  }}
                  disabled={generating}
                  className="bg-ink text-canvas text-[11px] font-semibold px-2.5 py-1 rounded-lg hover:bg-ink/90 transition-all cursor-pointer"
                >
                  Switch Track
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Same role selected message */}
      {selectedRole === targetRole && (
        <Card className="p-8 bg-canvas border-border text-center space-y-3">
          <h2 className="text-base font-bold text-ink">
            Select a Different Target Role to Compare
          </h2>
          <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
            You currently have <span className="font-semibold text-ink">{currentRoleObj?.name}</span> selected as both current focus and comparison target. Click any other career track card above to compute the real prerequisite overlap and delta effort.
          </p>
        </Card>
      )}

      {/* Venn Overlap & Delta Analysis */}
      {selectedRole !== targetRole && currentRoleObj && targetRoleObj && (
        <Card className="p-6 bg-canvas border-border space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Curriculum Delta Engine
              </span>
              <h2 className="text-base font-bold text-ink mt-0.5">
                {comparison?.current_role ?? currentRoleObj.name} ⟷ {comparison?.target_role ?? targetRoleObj.name}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted font-medium">Baseline Focus:</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="text-xs bg-surface border border-border rounded-lg px-2.5 py-1 text-ink focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {comparing && !comparison ? (
            <div className="py-12 text-center space-y-2">
              <div className="text-sm font-semibold text-ink animate-pulse">
                Sequencing real curriculum delta with gap engine...
              </div>
              <p className="text-xs text-muted">Calculating honest hours and transferable prerequisites</p>
            </div>
          ) : comparison ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4 bg-surface rounded-2xl border border-border space-y-1">
                  <span className="text-xs text-muted block">Shared Prerequisite Skills</span>
                  <div className="text-3xl font-extrabold text-ink">
                    <NumberTicker value={comparison.shared_skill_count} />
                  </div>
                  <p className="text-[11px] text-emerald-600 font-medium">
                    {comparison.shared_skill_names.slice(0, 3).map((s) => s.replace(/-/g, " ")).join(", ") || "Foundations"}
                  </p>
                </div>

                <div className="p-4 bg-surface rounded-2xl border border-border space-y-1">
                  <span className="text-xs text-muted block">Additional Delta Study Effort</span>
                  <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                    <NumberTicker value={comparison.delta_hours} prefix="~" suffix="h" />
                  </div>
                  <p className="text-[11px] text-muted font-medium">
                    {comparison.delta_skill_count} new skills
                    {comparison.delta_weeks != null && ` (~${comparison.delta_weeks.toFixed(1)} wks at 10h/wk)`}
                  </p>
                </div>

                <div className="p-4 bg-surface rounded-2xl border border-border space-y-1">
                  <span className="text-xs text-muted block">Transferability Index</span>
                  <div className="text-3xl font-extrabold text-ink">
                    <NumberTicker value={comparison.transferability_pct} suffix="%" />
                  </div>
                  <p className="text-[11px] text-muted font-medium">
                    {comparison.transferability_pct >= 60 ? "High Core Alignment" : "Distinct Technical Track"}
                  </p>
                </div>
              </div>

              {/* Skill chips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {comparison.shared_skill_names.length > 0 && (
                  <div className="p-3.5 bg-surface/50 rounded-xl border border-border space-y-2">
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                      Transferable Skills You Keep
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {comparison.shared_skill_names.map((name, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium text-[11px]"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {comparison.delta_skill_names.length > 0 && (
                  <div className="p-3.5 bg-surface/50 rounded-xl border border-border space-y-2">
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                      New Skills to Acquire
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {comparison.delta_skill_names.map((name, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-200 font-medium text-[11px]"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <p className="text-xs text-muted">
              Ready to pivot? The planner will preserve all accrued mastery evidence and sequence only the delta skills.
            </p>
            <button
              onClick={() => handleSwitchTrack(targetRoleObj.name)}
              disabled={generating}
              className="bg-ink text-canvas font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-ink/90 disabled:opacity-50 transition-all cursor-pointer shadow-xs whitespace-nowrap ml-4"
            >
              {generating ? "Sequencing Delta Path..." : `Generate Roadmap for ${targetRoleObj.name}`}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
