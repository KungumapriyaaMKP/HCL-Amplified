"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Target,
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { DiagnosticQuiz } from "@/features/diagnostic/DiagnosticQuiz";
import { Card } from "@/components/ui/Card";
import {
  getOnboardingDraft,
  saveOnboardingDraft,
  updateOnboardingStatus,
} from "@/lib/onboardingDraft";

export default function OnboardingDiagnosticPage() {
  const router = useRouter();
  const [goal, setGoal] = useState("Machine Learning Engineer");
  const [knownSkills, setKnownSkills] = useState<Record<string, number>>({});
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [completedResults, setCompletedResults] = useState<Record<string, number> | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Hydrate goal + known skills from the draft after mount (avoids SSR hydration mismatch).
  useEffect(() => {
    const d = getOnboardingDraft();
    setGoal(d.targetRole || d.goal || "Machine Learning Engineer");
    setKnownSkills(d.knownSkills || {});
  }, []);

  const handleMasteryUpdated = (newMastery: Record<string, number>) => {
    setCompletedResults(newMastery);
    setKnownSkills((prev) => {
      const merged = { ...prev, ...newMastery };
      saveOnboardingDraft({ knownSkills: merged });
      return merged;
    });
  };

  const handleQuizClose = async () => {
    setIsQuizOpen(false);
    if (completedResults) {
      setIsAdvancing(true);
      await updateOnboardingStatus("completed");
      router.push("/onboarding/complete");
    }
  };

  const handleSkipDiagnostic = async () => {
    setIsAdvancing(true);
    await updateOnboardingStatus("completed");
    router.push("/onboarding/complete");
  };

  const handleProceedAfterQuiz = async () => {
    setIsAdvancing(true);
    await updateOnboardingStatus("completed");
    router.push("/onboarding/complete");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border text-xs font-semibold text-muted uppercase tracking-wider">
          <Target className="w-3.5 h-3.5 text-emerald-500" />
          Step 4: Targeted Diagnostic Calibration
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Calibrate Starting Mastery
        </h1>
        <p className="text-sm text-muted">
          Take a 3-minute adaptive assessment powered by 2PL Item Response Theory (IRT) to calibrate your latent ability parameter &theta; for <strong>{goal}</strong>.
        </p>
      </div>

      {/* Main Diagnostic Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-8 space-y-4">
          <Card className="p-6 bg-canvas border-border space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-ink">
                  2PL-IRT Adaptive Assessment
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Evaluates high fan-out prerequisite skills for <strong>{goal}</strong>. Questions dynamically adapt based on discrimination parameter (a) and difficulty parameter (b).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted">Questions</span>
                <p className="font-semibold text-ink">4 Scenario Probes</p>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted">Duration</span>
                <p className="font-semibold text-ink">~2–3 Minutes</p>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted">Benefit</span>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">Skips Known Nodes</p>
              </div>
            </div>

            {completedResults ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Diagnostic Assessment Completed</span>
                </div>
                <p className="text-xs text-muted">
                  Calibrated {Object.keys(completedResults).length} prerequisite skills into your baseline draft.
                </p>
                <button
                  type="button"
                  onClick={handleProceedAfterQuiz}
                  disabled={isAdvancing}
                  className="w-full bg-ink text-canvas font-semibold text-xs py-2.5 rounded-xl hover:bg-ink/90 transition-all cursor-pointer shadow-xs"
                >
                  Apply Calibrations & Build Curriculum →
                </button>
              </div>
            ) : (
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setIsQuizOpen(true)}
                  className="flex-1 bg-ink text-canvas font-semibold text-xs py-3 rounded-xl hover:bg-ink/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Start Adaptive Diagnostic</span>
                </button>
                <button
                  type="button"
                  onClick={handleSkipDiagnostic}
                  disabled={isAdvancing}
                  className="px-5 py-3 rounded-xl border border-border bg-surface hover:bg-surface/80 text-xs font-medium text-muted hover:text-ink transition-colors cursor-pointer text-center"
                >
                  Skip Diagnostic (Use Baseline)
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* Current State Column */}
        <div className="md:col-span-4 space-y-4">
          <Card className="p-5 bg-surface border-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
              Target Track Summary
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted">Role Goal:</span>
                <span className="font-semibold text-ink truncate ml-2">{goal}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted">Imported Skills:</span>
                <span className="font-semibold text-ink">{Object.keys(knownSkills).length}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted">Diagnostic Status:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {completedResults ? "Calibrated" : "Pending"}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Link
          href="/onboarding/role"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors font-medium cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Role Selection</span>
        </Link>

        <button
          type="button"
          disabled={isAdvancing}
          onClick={handleSkipDiagnostic}
          className="bg-ink text-canvas font-semibold text-xs px-6 py-2.5 rounded-xl hover:bg-ink/90 transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
        >
          <span>Continue to Curriculum Generation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Diagnostic Quiz Modal */}
      {isQuizOpen && (
        <DiagnosticQuiz
          goal={goal}
          onClose={handleQuizClose}
          onMasteryUpdated={handleMasteryUpdated}
        />
      )}
    </div>
  );
}
