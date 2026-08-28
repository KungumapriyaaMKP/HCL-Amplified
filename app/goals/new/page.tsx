"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/frontend/components/layout/Nav";
import { TRACK_PACES } from "@/data/domains";
import {
  WavingRobotMascot,
  WreathTrophyShield,
} from "@/frontend/components/dashboard/Illustrations";
import {
  IconChevronLeft,
  IconArrowRight,
  IconArrowLeft,
  IconCompass,
  IconCode,
  IconChartBar,
  IconBrain,
  IconCloud,
  IconDeviceMobile,
  IconShieldLock,
  IconClock,
} from "@tabler/icons-react";

interface DomainOption {
  id: string;
  name: string;
  description: string;
  image: string;
  gradient: string;
  icon: React.ReactNode;
}

const DOMAIN_OPTIONS: DomainOption[] = [
  {
    id: "web-dev",
    name: "Web Development",
    description: "Build websites and web applications from scratch.",
    image: "/guilds/web-dev.png",
    gradient: "bg-gradient-to-br from-[#6366F1] to-[#7C3AED]",
    icon: <IconCode className="h-5 w-5 text-white stroke-[2.5]" />,
  },
  {
    id: "data-science",
    name: "Data Science",
    description: "Analyze data and extract valuable insights.",
    image: "/guilds/data-science.png",
    gradient: "bg-gradient-to-br from-[#38BDF8] to-[#2563EB]",
    icon: <IconChartBar className="h-5 w-5 text-white stroke-[2.5]" />,
  },
  {
    id: "ai-ml",
    name: "AI & Machine Learning",
    description: "Build intelligent models and smart systems.",
    image: "/guilds/ai-ml.png",
    gradient: "bg-gradient-to-br from-[#34D399] to-[#059669]",
    icon: <IconBrain className="h-5 w-5 text-white stroke-[2.5]" />,
  },
  {
    id: "cloud-devops",
    name: "Cloud & DevOps",
    description: "Deploy, automate and scale applications in the cloud.",
    image: "/guilds/cloud-devops.png",
    gradient: "bg-gradient-to-br from-[#FBBF24] to-[#EA580C]",
    icon: <IconCloud className="h-5 w-5 text-white stroke-[2.5]" />,
  },
  {
    id: "mobile-dev",
    name: "Mobile Development",
    description: "Create modern mobile apps for Android and iOS.",
    image: "/guilds/mobile-dev.png",
    gradient: "bg-gradient-to-br from-[#F472B6] to-[#E11D48]",
    icon: <IconDeviceMobile className="h-5 w-5 text-white stroke-[2.5]" />,
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    description: "Learn to protect systems and secure data.",
    image: "/guilds/cybersecurity.png",
    gradient: "bg-gradient-to-br from-[#818CF8] to-[#4F46E5]",
    icon: <IconShieldLock className="h-5 w-5 text-white stroke-[2.5]" />,
  },
];

export default function NewGoalPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0: Choose Domain, 1: Details (Pace), 2: Confirm (Objective)
  const [domain, setDomain] = useState<string>("web-dev"); // Default to web-dev like in screenshot
  const [trackPace, setTrackPace] = useState<string>("balanced");
  const [goalText, setGoalText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen bg-[#F8F9FD] text-slate-900 font-sans pb-16">
      {/* Top Light Navigation */}
      <Nav displayName="yuvi" />

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 sm:px-8 pt-8 space-y-6">
        
        {/* ================= HEADER & STEP TRACKER ================= */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          
          {/* Left Title & Back Button */}
          <div className="flex items-start gap-4">
            <button
              onClick={() => (step > 0 ? setStep(step - 1) : router.back())}
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-xs hover:bg-slate-50 transition-all cursor-pointer"
              title="Go Back"
            >
              <IconChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#7C3AED]">
                GOAL SETUP · STEP {step + 1} OF 3
              </div>
              <h1 className="mt-0.5 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Set a New Learning Goal
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
                Start your journey by choosing what you want to master.
              </p>
            </div>
          </div>

          {/* Right Mascot + 3-Step Indicator */}
          <div className="flex items-center justify-end gap-6 sm:gap-8 self-end lg:self-center">
            {/* 3D Cute Robot Mascot */}
            <WavingRobotMascot className="w-16 h-16 sm:w-20 sm:h-20" />

            {/* Stepper Dots */}
            <div className="flex items-center">
              {stepTitles.map((st, idx) => {
                const isActive = step === idx;
                const isCompleted = step > idx;

                return (
                  <React.Fragment key={st.num}>
                    {idx > 0 && (
                      <div
                        className={`h-[1.5px] w-8 sm:w-12 transition-colors mb-4.5 ${
                          step >= idx ? "bg-[#2563EB]" : "bg-slate-200"
                        }`}
                      />
                    )}
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all shadow-xs ${
                          isActive || isCompleted
                            ? "bg-[#2563EB] text-white"
                            : "border border-slate-200 bg-slate-100 text-slate-400"
                        }`}
                      >
                        {st.num}
                      </div>
                      <span
                        className={`mt-1.5 text-xs tracking-tight transition-colors whitespace-nowrap ${
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
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
            
            {/* Header inside Card */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-[#7C3AED] shadow-xs shrink-0">
                <IconCompass className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">Select Domain</h2>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Which discipline do you wish to master?
                </p>
              </div>
            </div>

            {/* 6 Domain Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {DOMAIN_OPTIONS.map((d) => {
                const selected = domain === d.id;

                return (
                  <button
                    key={d.id}
                    onClick={() => setDomain(d.id)}
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border p-5 text-left transition-all duration-200 min-h-[145px] cursor-pointer ${
                      selected
                        ? "border-2 border-[#7C3AED] bg-[#FAF8FE] ring-4 ring-purple-100/60 shadow-xs"
                        : "border-slate-200/80 bg-white hover:border-purple-300 hover:shadow-md"
                    }`}
                  >
                    {/* Top Row: Left Icon Badge & Right Circle Arrow */}
                    <div className="relative z-10 flex items-start justify-between">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-full shadow-xs ${d.gradient}`}>
                        {d.icon}
                      </div>
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
                          selected
                            ? "border-[#7C3AED] bg-[#7C3AED] text-white shadow-xs"
                            : "border-slate-200 bg-white text-slate-400 group-hover:border-purple-300 group-hover:text-[#7C3AED]"
                        }`}
                      >
                        <IconArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>

                    {/* Text Title & Subtitle */}
                    <div className="relative z-10 mt-3.5 max-w-[210px]">
                      <div className="text-sm font-bold text-slate-900">{d.name}</div>
                      <div className="mt-1 text-xs text-slate-500 leading-relaxed font-normal">
                        {d.description}
                      </div>
                    </div>

                    {/* Pastel Illustration in bottom right corner */}
                    <img
                      src={d.image}
                      alt={d.name}
                      className="pointer-events-none absolute right-1 bottom-1 h-20 w-24 object-contain opacity-90 transition-transform duration-300 group-hover:scale-105"
                    />
                  </button>
                );
              })}
            </div>

            {/* Bottom Banner: "Not sure yet?" */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-gradient-to-r from-[#FAF8FF] via-white to-[#FAF8FF] p-4 sm:p-5 shadow-xs">
              <div className="flex items-center gap-3.5">
                <WreathTrophyShield className="h-12 w-12 shrink-0" />
                <div>
                  <div className="text-sm font-bold text-slate-900">Not sure yet?</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    You can change your goal domain later anytime.
                  </div>
                </div>
              </div>

              <div className="relative flex items-center">
                {/* Sparkles on top-right of button */}
                <div className="pointer-events-none absolute -top-2.5 -right-2 text-amber-400 text-sm animate-pulse">
                  ✨
                </div>
                <button
                  disabled={!domain}
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#9333EA] px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)] transition-all hover:scale-102 hover:shadow-[0_6px_20px_rgba(99,102,241,0.45)] active:scale-98 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  <span>Continue to Pace</span>
                  <IconArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ================= STEP 1: PACE SELECTION ================= */}
        {step === 1 && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
            
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-[#7C3AED] shadow-xs shrink-0">
                <IconClock className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">Choose Learning Pace</h2>
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
                    className={`flex w-full items-center justify-between rounded-xl border p-4 sm:p-5 text-left transition-all duration-200 cursor-pointer ${
                      selected
                        ? "border-2 border-[#7C3AED] bg-[#FAF8FE] ring-4 ring-purple-100/60 shadow-xs"
                        : "border-slate-200/80 bg-white hover:border-purple-300 hover:shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900">{t.name}</div>
                      <div className="mt-0.5 text-xs text-slate-500">{t.description}</div>
                    </div>
                    <span
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
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

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
              <button
                onClick={() => setStep(0)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <IconArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <button
                disabled={!trackPace}
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#9333EA] px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)] transition-all hover:scale-102 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <span>Define Objective</span>
                <IconArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        )}

        {/* ================= STEP 2: GOAL OBJECTIVE & INTAKE ================= */}
        {step === 2 && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
            
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900 leading-tight">
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 shadow-inner focus:border-[#7C3AED] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
            />

            {error && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600">
                {error}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <IconArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <button
                disabled={loading}
                onClick={createGoal}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#9333EA] px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)] transition-all hover:scale-102 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? "Creating Goal..." : "Initiate Diagnostic Intake"}</span>
                <IconArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
