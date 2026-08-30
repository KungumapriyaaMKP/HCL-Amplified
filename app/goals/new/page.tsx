"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppSidebar } from "@/frontend/components/layout/AppSidebar";
import { TRACK_PACES } from "@/data/domains";
import {
  WavingRobotMascot,
  WebDevPastelIllustration,
  DataSciencePastelIllustration,
  AiMlPastelIllustration,
  CloudDevOpsPastelIllustration,
  MobileDevPastelIllustration,
  CybersecurityPastelIllustration,
} from "@/frontend/components/dashboard/Illustrations";
import {
  IconChevronLeft,
  IconArrowRight,
  IconArrowLeft,
  IconCompass,
  IconClock,
} from "@tabler/icons-react";

interface DomainOption {
  id: string;
  name: string;
  description: string;
  illustration: React.ReactNode;
}

const DOMAIN_OPTIONS: DomainOption[] = [
  {
    id: "web-dev",
    name: "Web Development",
    description: "Build websites and web applications from scratch.",
    illustration: <WebDevPastelIllustration className="pointer-events-none absolute right-3 bottom-2 w-32 h-24 sm:w-36 sm:h-26" />,
  },
  {
    id: "data-science",
    name: "Data Science",
    description: "Analyze data and extract valuable insights.",
    illustration: <DataSciencePastelIllustration className="pointer-events-none absolute right-3 bottom-2 w-32 h-24 sm:w-36 sm:h-26" />,
  },
  {
    id: "ai-ml",
    name: "AI & Machine Learning",
    description: "Build intelligent models and smart systems.",
    illustration: <AiMlPastelIllustration className="pointer-events-none absolute right-3 bottom-2 w-32 h-24 sm:w-36 sm:h-26" />,
  },
  {
    id: "cloud-devops",
    name: "Cloud & DevOps",
    description: "Deploy, automate and scale applications in the cloud.",
    illustration: <CloudDevOpsPastelIllustration className="pointer-events-none absolute right-3 bottom-2 w-32 h-24 sm:w-36 sm:h-26" />,
  },
  {
    id: "mobile-dev",
    name: "Mobile Development",
    description: "Create modern mobile apps for Android and iOS.",
    illustration: <MobileDevPastelIllustration className="pointer-events-none absolute right-3 bottom-2 w-32 h-24 sm:w-36 sm:h-26" />,
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    description: "Learn to protect systems and secure data.",
    illustration: <CybersecurityPastelIllustration className="pointer-events-none absolute right-3 bottom-2 w-32 h-24 sm:w-36 sm:h-26" />,
  },
];

function NewGoalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const domainQuery = searchParams?.get("domain");

  const [step, setStep] = useState(0);
  const [domain, setDomain] = useState<string>("web-dev");
  const [trackPace, setTrackPace] = useState<string>("balanced");
  const [goalText, setGoalText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (domainQuery && DOMAIN_OPTIONS.some((d) => d.id === domainQuery)) {
      setDomain(domainQuery);
    }
  }, [domainQuery]);

  async function createGoal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, trackPace, goalText: goalText || `Master ${domain}` }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not create goal");
      router.push(`/goals/${body.goal.id}/setup`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong creating goal");
      setLoading(false);
    }
  }

  const stepTitles = [
    { num: 1, label: "Choose Domain" },
    { num: 2, label: "Details" },
    { num: 3, label: "Confirm" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F9FD] text-slate-900 font-sans">
      {/* 1. Left Sidebar Navigation */}
      <AppSidebar
        displayName="yuvi"
        level={1}
        levelTitle="Newcomer"
      />

      {/* 2. Main Scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        <main className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 py-5 space-y-4">
        
        {/* ================= HEADER & STEP TRACKER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          
          {/* Left Title & Back Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => (step > 0 ? setStep(step - 1) : router.back())}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none border border-slate-200 bg-white text-slate-600 shadow-xs hover:bg-slate-50 transition-all cursor-pointer"
              title="Go Back"
            >
              <IconChevronLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#7C3AED]">
                GOAL SETUP · STEP {step + 1} OF 3
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Set a New Learning Goal
              </h1>
            </div>
          </div>

          {/* Right Mascot + 3-Step Indicator */}
          <div className="flex items-center justify-end gap-4 self-end sm:self-center">
            {/* 3D Cute Robot Mascot */}
            <WavingRobotMascot className="w-11 h-11 sm:w-13 sm:h-13" />

            {/* Stepper Dots */}
            <div className="flex items-center">
              {stepTitles.map((st, idx) => {
                const isActive = step === idx;
                const isCompleted = step > idx;

                return (
                  <React.Fragment key={st.num}>
                    {idx > 0 && (
                      <div
                        className={`h-[1.5px] w-8 sm:w-12 transition-colors mb-3.5 ${
                          step >= idx ? "bg-[#2563EB]" : "bg-slate-200"
                        }`}
                      />
                    )}
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-none text-[11px] font-bold transition-all shadow-xs ${
                          isActive || isCompleted
                            ? "bg-[#2563EB] text-white"
                            : "border border-slate-200 bg-slate-100 text-slate-400"
                        }`}
                      >
                        {st.num}
                      </div>
                      <span
                        className={`mt-1 text-[10px] sm:text-[11px] tracking-tight transition-colors whitespace-nowrap ${
                          isActive
                            ? "font-bold text-[#2563EB]"
                            : isCompleted
                            ? "font-semibold text-slate-700"
                            : "font-medium text-slate-400"
                        }`}
                      >
                        {st.label}
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

        </div>

        {/* ================= STEP 0: DOMAIN SELECTION ================= */}
        {step === 0 && (
          <div className="rounded-none border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
            
            {/* Header inside Card */}
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-none bg-purple-50 text-[#7C3AED] shadow-xs shrink-0">
                <IconCompass className="h-4 w-4 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">Select Domain</h2>
                <p className="text-[11px] text-slate-400 font-normal">
                  Which discipline do you wish to master?
                </p>
              </div>
            </div>

            {/* 6 Domain Cards Grid - Expanded Vertical Area & Fits Single Screen */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {DOMAIN_OPTIONS.map((d) => {
                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      setDomain(d.id);
                      setStep(1);
                    }}
                    className="electric-glow-border group relative flex flex-col justify-between overflow-hidden rounded-none bg-white p-5 sm:p-6 text-left min-h-[190px] sm:min-h-[210px] lg:min-h-[225px] cursor-pointer"
                  >
                    {/* Top Row: Title & Right Square Arrow */}
                    <div className="relative z-10 flex items-start justify-between gap-3">
                      <div className="pr-10 max-w-[78%]">
                        <div className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-[#6D28D9] transition-colors leading-snug">
                          {d.name}
                        </div>
                        <div className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                          {d.description}
                        </div>
                      </div>

                      <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-none border border-[#7C3AED] bg-[#7C3AED] text-white shadow-xs transition-all duration-200 group-hover:scale-105 group-hover:bg-[#6D28D9]">
                        <IconArrowRight className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Custom Vector Pastel Illustration on Bottom Right */}
                    {d.illustration}
                  </button>
                );
              })}
            </div>

          </div>
        )}

        {/* ================= STEP 1: PACE SELECTION ================= */}
        {step === 1 && (
          <div className="rounded-none border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
            
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-none bg-purple-50 text-[#7C3AED] shadow-xs shrink-0">
                <IconClock className="h-4 w-4 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Choose Learning Pace</h2>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  How many hours per week will you dedicate to this goal?
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {TRACK_PACES.map((t) => {
                const selected = trackPace === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTrackPace(t.id)}
                    className={`flex w-full items-center justify-between rounded-none border-2 p-4 text-left transition-all duration-150 cursor-pointer ${
                      selected
                        ? "border-[#7C3AED] bg-[#FAF8FE] shadow-[0_0_12px_rgba(124,58,237,0.15)]"
                        : "border-slate-200 bg-white hover:border-[#7C3AED] hover:shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="text-sm sm:text-base font-bold text-slate-900">{t.name}</div>
                      <div className="mt-0.5 text-xs text-slate-500">{t.description}</div>
                    </div>
                    <span
                      className={`rounded-none px-3 py-1.5 text-xs font-bold transition-colors ${
                        selected
                          ? "bg-[#7C3AED] text-white"
                          : "border border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    >
                      ~{t.hoursPerWeek} hrs/wk
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                onClick={() => setStep(0)}
                className="inline-flex items-center gap-1.5 rounded-none border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <IconArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
              <button
                disabled={!trackPace}
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 rounded-none bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#9333EA] px-5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:opacity-95 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <span>Define Objective</span>
                <IconArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        )}

        {/* ================= STEP 2: GOAL OBJECTIVE & INTAKE ================= */}
        {step === 2 && (
          <div className="rounded-none border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
            
            <div className="mb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                State Your Target Objective
              </h2>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                Describe what you want to achieve. Claude AI will parse your goal into an exact topological skill DAG.
              </p>
            </div>

            <textarea
              rows={4}
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="e.g. I want to master Full-Stack Web Application Engineering and build production-ready software."
              className="w-full rounded-none border border-slate-200 bg-slate-50/50 p-3.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 shadow-inner focus:border-[#7C3AED] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
            />

            {error && (
              <div className="mt-3 rounded-none border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600">
                {error}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 rounded-none border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <IconArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
              <button
                disabled={loading}
                onClick={createGoal}
                className="inline-flex items-center gap-1.5 rounded-none bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#9333EA] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:opacity-95 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? "Creating Goal..." : "Initiate Diagnostic Intake"}</span>
                <IconArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        )}

      </main>
      </div>
    </div>
  );
}

export default function NewGoalPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#F8F9FD] text-slate-500 font-sans text-xs">Loading Quest Wizard...</div>}>
      <NewGoalForm />
    </Suspense>
  );
}
