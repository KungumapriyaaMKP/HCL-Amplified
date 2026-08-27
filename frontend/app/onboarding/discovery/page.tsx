"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, ArrowLeft, ArrowRight, Clock, Calendar, DollarSign } from "lucide-react";
import { StreamingChat } from "@/features/intake/StreamingChat";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { PlanRequest } from "@/lib/api/pathfinder";
import {
  getOnboardingDraft,
  saveOnboardingDraft,
  updateOnboardingStatus,
} from "@/lib/onboardingDraft";

export default function OnboardingDiscoveryPage() {
  const router = useRouter();
  const [knownSkills, setKnownSkills] = useState<Record<string, number>>({});
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [deadlineWeeks, setDeadlineWeeks] = useState(24);
  const [budgetUsd, setBudgetUsd] = useState<number | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from the saved draft AFTER mount so SSR and the first client render
  // match. Reading localStorage during render causes a hydration mismatch.
  useEffect(() => {
    const d = getOnboardingDraft();
    setKnownSkills(d.knownSkills || {});
    setHoursPerWeek(d.hoursPerWeek ?? 10);
    setDeadlineWeeks(d.deadlineWeeks ?? 24);
    setBudgetUsd(d.budgetUsd ?? null);
    setHydrated(true);
  }, []);

  const handleIntakeComplete = async (planReq: Partial<PlanRequest>) => {
    setIsAdvancing(true);
    // Explicit slider choice takes precedence as the user's direct input
    const finalHours = hoursPerWeek || planReq.hours_per_week || 10;
    const finalDeadline = deadlineWeeks || planReq.deadline_weeks || 24;
    const finalBudget = budgetUsd !== null ? budgetUsd : (planReq.budget_usd ?? null);

    saveOnboardingDraft({
      goal: planReq.goal || "Machine Learning Engineer",
      hoursPerWeek: finalHours,
      deadlineWeeks: finalDeadline,
      budgetUsd: finalBudget,
      priority: planReq.priority || "balanced",
      knownSkills: { ...knownSkills, ...(planReq.known || {}) },
    });
    await updateOnboardingStatus("role_pending");
    router.push("/onboarding/role");
  };

  const handleDirectContinue = async () => {
    setIsAdvancing(true);
    saveOnboardingDraft({
      hoursPerWeek,
      deadlineWeeks,
      budgetUsd,
    });
    await updateOnboardingStatus("role_pending");
    router.push("/onboarding/role");
  };

  const knownCount = Object.keys(knownSkills).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border text-xs font-semibold text-muted uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
          Step 2: Conversational Discovery
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Discover Goals & Constraints
        </h1>
        <p className="text-sm text-muted">
          Chat with Pathfinder AI to calibrate your target career trajectory, study schedule, and financial constraints.
        </p>
      </div>

      {/* Constraints Bar */}
      <Card className="p-4 bg-surface border-border grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-canvas border border-border text-ink">
            <Clock className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
              Hours / Week: <span className="text-ink font-bold">{hoursPerWeek}h</span>
            </label>
            <input
              type="range"
              min={2}
              max={40}
              step={2}
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="w-full h-1.5 bg-canvas rounded-lg appearance-none cursor-pointer accent-ink mt-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-canvas border border-border text-ink">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
              Deadline: <span className="text-ink font-bold">{deadlineWeeks} weeks</span>
            </label>
            <input
              type="range"
              min={4}
              max={52}
              step={4}
              value={deadlineWeeks}
              onChange={(e) => setDeadlineWeeks(Number(e.target.value))}
              className="w-full h-1.5 bg-canvas rounded-lg appearance-none cursor-pointer accent-ink mt-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-canvas border border-border text-ink">
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
              Budget: <span className="text-ink font-bold">{budgetUsd === null ? "Any / Free + Paid" : `$${budgetUsd}`}</span>
            </label>
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => setBudgetUsd(null)}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                  budgetUsd === null
                    ? "bg-ink text-canvas font-semibold border-ink"
                    : "bg-canvas text-muted border-border hover:border-border-hover"
                }`}
              >
                Any
              </button>
              <button
                type="button"
                onClick={() => setBudgetUsd(0)}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                  budgetUsd === 0
                    ? "bg-ink text-canvas font-semibold border-ink"
                    : "bg-canvas text-muted border-border hover:border-border-hover"
                }`}
              >
                100% Free
              </button>
              <button
                type="button"
                onClick={() => setBudgetUsd(100)}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                  budgetUsd === 100
                    ? "bg-ink text-canvas font-semibold border-ink"
                    : "bg-canvas text-muted border-border hover:border-border-hover"
                }`}
              >
                &le; $100
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Streaming Chat Interface — mount after hydration so the greeting reflects the real slider values */}
      {hydrated && (
        <StreamingChat
          onIntakeComplete={handleIntakeComplete}
          knownSkills={knownSkills}
          constraints={{ hoursPerWeek, deadlineWeeks, budgetUsd }}
        />
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Link
          href="/onboarding/history"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors font-medium cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Background</span>
        </Link>

        <div className="flex items-center gap-3">
          {knownCount > 0 && (
            <Pill variant="neutral">
              {knownCount} skill{knownCount > 1 ? "s" : ""} imported
            </Pill>
          )}
          <button
            type="button"
            disabled={isAdvancing}
            onClick={handleDirectContinue}
            className="bg-ink text-canvas font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-ink/90 transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <span>Proceed to Role Recommendation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
