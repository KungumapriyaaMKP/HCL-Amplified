"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Scale,
  Zap,
  Banknote,
  Microscope,
  Rocket,
  Target,
  FileText,
  Code2,
} from "lucide-react";
import { createPlan, PlanRequest } from "@/lib/api/pathfinder";
import { storePlan } from "@/lib/planStore";
import { Pill } from "@/components/ui/Pill";
import { Card } from "@/components/ui/Card";
import { StreamingChat } from "./StreamingChat";
import { ResumeUploader } from "./ResumeUploader";
import { GitHubProfiler } from "./GitHubProfiler";
import { DiagnosticQuiz } from "../diagnostic/DiagnosticQuiz";

const PRESETS = [
  { id: "balanced", label: "Balanced", icon: Scale, desc: "Optimal depth and time trade-off" },
  { id: "fastest", label: "Fastest", icon: Zap, desc: "Shortest route to minimum required mastery" },
  { id: "cheapest", label: "Budget / Free", icon: Banknote, desc: "Prioritizes 100% free YouTube & MS Learn" },
  { id: "rigorous", label: "Most Rigorous", icon: Microscope, desc: "Deepest academic foundations" },
  { id: "crash", label: "Crash Course", icon: Rocket, desc: "Strips non-essential electives" },
];

export function IntakeFlow() {
  const router = useRouter();
  const [activeSideTab, setActiveSideTab] = useState<"resume" | "github">("resume");
  const [knownSkills, setKnownSkills] = useState<Record<string, number>>({});
  const [priority, setPriority] = useState("balanced");
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSkillsExtracted = (newSkills: Record<string, number>) => {
    setKnownSkills((prev) => ({ ...prev, ...newSkills }));
  };

  const handlePlanGenerate = async (planReq: Partial<PlanRequest>) => {
    setIsBuilding(true);
    setError(null);
    try {
      const fullReq: PlanRequest = {
        goal: planReq.goal || "Machine Learning Engineer",
        hours_per_week: planReq.hours_per_week || 10.0,
        deadline_weeks: planReq.deadline_weeks || 24,
        budget_usd: planReq.budget_usd || null,
        known: { ...knownSkills, ...(planReq.known || {}) },
        priority: priority,
      };

      const plan = await createPlan(fullReq);
      storePlan(plan);
      router.push("/roadmap");
    } catch (err: any) {
      setError(err?.message || "Failed to generate roadmap. Please check that backend is running.");
      setIsBuilding(false);
    }
  };

  const knownCount = Object.keys(knownSkills).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted">
          Adaptive Career Pathfinding
        </span>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl text-ink tracking-tight">
          What do you want to master?
        </h1>
        <p className="mt-2 text-sm text-muted">
          Chat with our AI mentor, drop your resume, or scan your GitHub to tailor an A*-optimized curriculum.
        </p>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Conversational Streaming Intake (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <StreamingChat
            onIntakeComplete={handlePlanGenerate}
            knownSkills={knownSkills}
          />

          {/* Strategy Preset Selector */}
          <Card className="p-4 bg-canvas border-border space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                Optimization Objective
              </label>
              <span className="text-xs text-muted">A* Weight Profile</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESETS.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                      priority === p.id
                        ? "border-ink bg-surface shadow-2xs font-semibold text-ink"
                        : "border-border hover:border-border-hover text-muted bg-canvas"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-ink">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{p.label}</span>
                    </div>
                    <div className="text-[10px] text-muted font-normal mt-0.5 leading-tight">
                      {p.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Ingestion & Calibration Side Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Diagnostic Quiz Banner */}
          <Card className="p-5 bg-surface border-border space-y-3 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                  {knownCount > 0 ? `${knownCount} Skills Calibrated` : "2PL-IRT Adaptive Calibration"}
                </span>
                <h3 className="text-sm font-semibold text-ink mt-0.5">
                  Adaptive Diagnostic Probe
                </h3>
                <p className="text-xs text-muted mt-1">
                  Take a 3-minute 2PL-IRT assessment to calibrate your readiness before generating.
                </p>
              </div>
              <div className="text-emerald-600 shrink-0 p-1">
                <Target className="w-7 h-7" />
              </div>
            </div>

            <button
              onClick={() => setIsDiagnosticOpen(true)}
              className="w-full bg-ink text-canvas font-medium text-xs py-2.5 rounded-xl hover:bg-ink/90 transition-opacity cursor-pointer text-center block"
            >
              Start Diagnostic Quiz
            </button>
          </Card>

          {/* Side Intake Panel: Resume & GitHub */}
          <Card className="p-5 bg-canvas border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveSideTab("resume")}
                  className={`text-xs font-semibold pb-1 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeSideTab === "resume"
                      ? "border-ink text-ink"
                      : "border-transparent text-muted hover:text-ink"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Resume</span>
                </button>
                <button
                  onClick={() => setActiveSideTab("github")}
                  className={`text-xs font-semibold pb-1 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeSideTab === "github"
                      ? "border-ink text-ink"
                      : "border-transparent text-muted hover:text-ink"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>GitHub Stack</span>
                </button>
              </div>

              {knownCount > 0 && (
                <Pill variant="mastered">
                  {knownCount} skill{knownCount > 1 ? "s" : ""} verified
                </Pill>
              )}
            </div>

            {activeSideTab === "resume" ? (
              <ResumeUploader onSkillsExtracted={handleSkillsExtracted} />
            ) : (
              <GitHubProfiler onSkillsExtracted={handleSkillsExtracted} />
            )}
          </Card>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {isBuilding && (
            <div className="p-4 bg-surface rounded-xl border border-border text-center space-y-2">
              <div className="text-sm font-medium text-ink animate-pulse">
                Sequencing curriculum via A* shortest path...
              </div>
              <div className="text-xs text-muted">
                Binding 23.6k catalog resources & applying budget constraints
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Diagnostic Modal */}
      {isDiagnosticOpen && (
        <DiagnosticQuiz
          goal="Machine Learning Engineer"
          onClose={() => setIsDiagnosticOpen(false)}
          onMasteryUpdated={(newMastery) => {
            setKnownSkills((prev) => ({ ...prev, ...newMastery }));
          }}
        />
      )}
    </div>
  );
}
