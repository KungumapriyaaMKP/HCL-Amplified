"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Code2, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { ResumeUploader } from "@/features/intake/ResumeUploader";
import { GitHubProfiler } from "@/features/intake/GitHubProfiler";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import {
  getOnboardingDraft,
  saveOnboardingDraft,
  updateOnboardingStatus,
} from "@/lib/onboardingDraft";

export default function OnboardingHistoryPage() {
  const router = useRouter();
  const [knownSkills, setKnownSkills] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<"resume" | "github">("resume");
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Hydrate captured skills from the draft after mount (avoids SSR hydration mismatch).
  useEffect(() => {
    setKnownSkills(getOnboardingDraft().knownSkills || {});
  }, []);

  const handleSkillsExtracted = (newSkills: Record<string, number>) => {
    setKnownSkills((prev) => {
      const merged = { ...prev, ...newSkills };
      saveOnboardingDraft({ knownSkills: merged });
      return merged;
    });
  };

  const handleContinue = async (skipSkills: boolean = false) => {
    setIsAdvancing(true);
    const skillsToSave = skipSkills ? {} : knownSkills;
    saveOnboardingDraft({ knownSkills: skillsToSave });
    await updateOnboardingStatus("discovery_pending");
    router.push("/onboarding/discovery");
  };

  const handleSkipSetup = async () => {
    setIsAdvancing(true);
    await updateOnboardingStatus("completed");
    router.push("/roadmap");
  };

  const skillCount = Object.keys(knownSkills).length;

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border text-xs font-semibold text-muted uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Step 1: Background & Prior Knowledge
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Capture Your Technical History
        </h1>
        <p className="text-sm text-muted">
          Drop your resume or scan your public GitHub repositories to extract verified skills. You can also start fresh without importing history.
        </p>
      </div>

      {/* Main Import Grid / Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Input Panels (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          <Card className="p-6 bg-canvas border-border space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("resume")}
                  className={`text-xs font-semibold pb-1 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "resume"
                      ? "border-ink text-ink"
                      : "border-transparent text-muted hover:text-ink"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Resume (PDF/DOCX)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("github")}
                  className={`text-xs font-semibold pb-1 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "github"
                      ? "border-ink text-ink"
                      : "border-transparent text-muted hover:text-ink"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>GitHub Profile</span>
                </button>
              </div>

              {skillCount > 0 && (
                <Pill variant="mastered">
                  {skillCount} skill{skillCount > 1 ? "s" : ""} captured
                </Pill>
              )}
            </div>

            {activeTab === "resume" ? (
              <ResumeUploader onSkillsExtracted={handleSkillsExtracted} />
            ) : (
              <GitHubProfiler onSkillsExtracted={handleSkillsExtracted} />
            )}
          </Card>
        </div>

        {/* Live Extracted Summary & Actions (5 cols) */}
        <div className="md:col-span-5 space-y-5">
          <Card className="p-5 bg-surface border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                Captured Skills ({skillCount})
              </h3>
              {skillCount > 0 && (
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>

            {skillCount === 0 ? (
              <div className="py-6 text-center text-xs text-muted space-y-1">
                <p>No skills imported yet.</p>
                <p className="text-[11px] text-muted/80">
                  Upload a resume, enter GitHub handle, or skip this step to start from a clean slate.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {Object.entries(knownSkills).map(([sid, lvl]) => (
                  <div
                    key={sid}
                    className="flex items-center justify-between p-2 rounded-lg bg-canvas text-xs border border-border"
                  >
                    <span className="font-medium text-ink capitalize truncate mr-2">
                      {sid.replace(/-/g, " ")}
                    </span>
                    <Pill variant={lvl >= 0.7 ? "mastered" : "active"}>
                      {Math.round(lvl * 100)}%
                    </Pill>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              {skillCount > 0 ? (
                <button
                  type="button"
                  disabled={isAdvancing}
                  onClick={() => handleContinue(false)}
                  className="w-full bg-ink text-canvas font-semibold text-xs py-3 rounded-xl hover:bg-ink/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <span>Continue with {skillCount} Verified Skills</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isAdvancing}
                  onClick={() => handleContinue(true)}
                  className="w-full bg-ink text-canvas font-semibold text-xs py-3 rounded-xl hover:bg-ink/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <span>I&apos;m starting fresh / Skip history</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {skillCount > 0 && (
                <button
                  type="button"
                  disabled={isAdvancing}
                  onClick={() => handleContinue(true)}
                  className="w-full text-xs text-muted hover:text-ink py-1.5 text-center transition-colors cursor-pointer"
                >
                  Start fresh instead (clear history)
                </button>
              )}
            </div>
          </Card>

          {/* Quick-Start Skip */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleSkipSetup}
              className="text-xs text-muted hover:text-ink underline transition-colors cursor-pointer"
            >
              Skip setup — explore the app directly
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
