"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppSidebar } from "@/frontend/components/layout/AppSidebar";
import { TRACK_PACES } from "@/data/domains";
import {
  IconChevronLeft,
  IconArrowRight,
  IconArrowLeft,
  IconLayoutGrid,
  IconClock,
} from "@tabler/icons-react";

/* -------------------------------------------------------------------------
 * EXACT DOMAIN CIRCULAR ICON BADGES MATCHING IMAGE 1
 * ------------------------------------------------------------------------- */

function WebDevBadge() {
  return (
    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#F3E8FF] flex items-center justify-center shrink-0">
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="12" width="32" height="24" rx="4" fill="#6D28D9" />
        <rect x="8" y="12" width="32" height="7" rx="4" fill="#5B21B6" />
        <circle cx="13" cy="15.5" r="1.2" fill="#E9D5FF" />
        <circle cx="17" cy="15.5" r="1.2" fill="#E9D5FF" />
        <circle cx="21" cy="15.5" r="1.2" fill="#E9D5FF" />
        {/* < / > code text */}
        <path d="M18 24 L14 27 L18 30" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 31 L26 23" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M30 24 L34 27 L30 30" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function DataScienceBadge() {
  return (
    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#E0F2FE] flex items-center justify-center shrink-0">
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
        {/* Bars */}
        <rect x="12" y="27" width="5" height="11" rx="1.5" fill="#0284C7" />
        <rect x="20" y="20" width="5" height="18" rx="1.5" fill="#0284C7" />
        <rect x="28" y="25" width="5" height="13" rx="1.5" fill="#0284C7" />
        {/* Pie / Node Graph */}
        <path d="M30 14 C30 18.4, 26.4 22, 22 22 L22 14 Z" fill="#0369A1" />
        <path d="M32 12 C32 7.6, 28.4 4, 24 4 L24 12 Z" fill="#38BDF8" />
        <path d="M23 11 C23 6.6, 19.4 3, 15 3 L15 11 Z" fill="#0284C7" />
      </svg>
    </div>
  );
}

function AiMlBadge() {
  return (
    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
        {/* Brain Synapse Graphic */}
        <path
          d="M24 10 C20 10, 14 12, 14 18 C14 21, 16 23, 14 26 C12 29, 14 34, 18 36 C20 37, 24 37, 24 38"
          stroke="#16A34A"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M24 10 C28 10, 34 12, 34 18 C34 21, 32 23, 34 26 C36 29, 34 34, 30 36 C28 37, 24 37, 24 38"
          stroke="#16A34A"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <line x1="24" y1="10" x2="24" y2="38" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" />
        {/* Inner neural loops */}
        <path d="M19 16 C22 17, 22 21, 19 22" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M29 16 C26 17, 26 21, 29 22" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M19 26 C22 27, 22 31, 19 32" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M29 26 C26 27, 26 31, 29 32" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

function CloudDevOpsBadge() {
  return (
    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0">
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
        {/* Cloud */}
        <path
          d="M17 22 C14.2 22, 12 24.2, 12 27 C12 29.8, 14.2 32, 17 32 L31 32 C34.3 32, 37 29.3, 37 26 C37 22.8, 34.5 20.2, 31.3 20 C30.6 15.5, 26.7 12, 22 12 C18.1 12, 14.8 14.4, 13.5 18 C14.6 18, 15.8 18.5, 16.7 19.3"
          stroke="#D97706"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Server layers */}
        <line x1="16" y1="26" x2="32" y2="26" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
        <circle cx="18" cy="26" r="1" fill="#D97706" />
        <line x1="16" y1="30" x2="32" y2="30" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
        <circle cx="18" cy="30" r="1" fill="#D97706" />
      </svg>
    </div>
  );
}

function MobileDevBadge() {
  return (
    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FCE7F3] flex items-center justify-center shrink-0">
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
        {/* Smartphone */}
        <rect x="15" y="10" width="18" height="28" rx="4" stroke="#DB2777" strokeWidth="2.2" fill="none" />
        <line x1="21" y1="14" x2="27" y2="14" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="34" r="1.5" fill="#DB2777" />
      </svg>
    </div>
  );
}

function CybersecurityBadge() {
  return (
    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#EDE9FE] flex items-center justify-center shrink-0">
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
        {/* Shield */}
        <path
          d="M24 10 L33 14 V23 C33 29, 29 34.5, 24 37 C19 34.5, 15 29, 15 23 V14 L24 10 Z"
          stroke="#6D28D9"
          strokeWidth="2.2"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Padlock */}
        <rect x="21" y="23" width="6" height="5" rx="1" fill="#6D28D9" />
        <path d="M22.5 23 V20 C22.5 19.2, 23.2 18.5, 24 18.5 C24.8 18.5, 25.5 19.2, 25.5 20 V23" stroke="#6D28D9" strokeWidth="1.6" fill="none" />
      </svg>
    </div>
  );
}

interface DomainOption {
  id: string;
  name: string;
  description: string;
  badge: React.ReactNode;
  arrowBorderColor: string;
  arrowTextColor: string;
  arrowHoverBg: string;
}

const DOMAIN_OPTIONS: DomainOption[] = [
  {
    id: "web-dev",
    name: "Web Development",
    description: "Build websites and web applications from scratch.",
    badge: <WebDevBadge />,
    arrowBorderColor: "border-purple-300",
    arrowTextColor: "text-purple-600",
    arrowHoverBg: "group-hover:bg-purple-50",
  },
  {
    id: "data-science",
    name: "Data Science",
    description: "Analyze data and extract valuable insights.",
    badge: <DataScienceBadge />,
    arrowBorderColor: "border-sky-300",
    arrowTextColor: "text-sky-600",
    arrowHoverBg: "group-hover:bg-sky-50",
  },
  {
    id: "ai-ml",
    name: "AI & Machine Learning",
    description: "Build intelligent models and smart systems.",
    badge: <AiMlBadge />,
    arrowBorderColor: "border-emerald-300",
    arrowTextColor: "text-emerald-600",
    arrowHoverBg: "group-hover:bg-emerald-50",
  },
  {
    id: "cloud-devops",
    name: "Cloud & DevOps",
    description: "Deploy, automate and scale applications in the cloud.",
    badge: <CloudDevOpsBadge />,
    arrowBorderColor: "border-amber-300",
    arrowTextColor: "text-amber-600",
    arrowHoverBg: "group-hover:bg-amber-50",
  },
  {
    id: "mobile-dev",
    name: "Mobile Development",
    description: "Create modern mobile apps for Android and iOS.",
    badge: <MobileDevBadge />,
    arrowBorderColor: "border-pink-300",
    arrowTextColor: "text-pink-600",
    arrowHoverBg: "group-hover:bg-pink-50",
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    description: "Learn to protect systems and secure data.",
    badge: <CybersecurityBadge />,
    arrowBorderColor: "border-indigo-300",
    arrowTextColor: "text-indigo-600",
    arrowHoverBg: "group-hover:bg-indigo-50",
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
        <main className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 py-6 space-y-6">
        
        {/* ================= HEADER & STEP TRACKER EXACT MATCH TO IMAGE 1 ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Left Title & Back Button */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => (step > 0 ? setStep(step - 1) : router.back())}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
              title="Go Back"
            >
              <IconChevronLeft className="h-5 w-5 stroke-[2.2]" />
            </button>
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#6D28D9]">
                GOAL SETUP · STEP {step + 1} OF 3
              </div>
              <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight leading-tight">
                Set a New Learning Goal
              </h1>
            </div>
          </div>

          {/* Right Mascot + 3-Step Stepper */}
          <div className="flex items-center justify-end gap-3.5 self-end sm:self-center">
            {/* Cute Bot Mascot Avatar Circle */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-200 bg-purple-50/80 shadow-xs">
              <span className="text-lg">🤖</span>
            </div>

            {/* Stepper Dots & Labels */}
            <div className="flex items-center">
              {stepTitles.map((st, idx) => {
                const isActive = step === idx;
                const isCompleted = step > idx;

                return (
                  <React.Fragment key={st.num}>
                    {idx > 0 && (
                      <div
                        className={`h-[1.5px] w-8 sm:w-12 transition-colors mb-4 ${
                          step >= idx ? "bg-[#6D28D9]" : "bg-slate-200"
                        }`}
                      />
                    )}
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                          isActive || isCompleted
                            ? "bg-[#6D28D9] text-white shadow-xs"
                            : "border border-slate-300 bg-white text-slate-400"
                        }`}
                      >
                        {st.num}
                      </div>
                      <span
                        className={`mt-1 text-[11px] tracking-tight transition-colors whitespace-nowrap ${
                          isActive
                            ? "font-extrabold text-[#6D28D9]"
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

        {/* ================= STEP 0: DOMAIN SELECTION EXACT MATCH TO IMAGE 1 ================= */}
        {step === 0 && (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
            
            {/* Header inside Card */}
            <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100/80">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-[#6D28D9] border border-purple-100 shadow-2xs shrink-0">
                <IconLayoutGrid className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Select Domain
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Which discipline do you wish to master?
                </p>
              </div>
            </div>

            {/* 6 Domain Cards Grid - Horizontal Layout Matching Image 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {DOMAIN_OPTIONS.map((d) => {
                return (
                  <div
                    key={d.id}
                    onClick={() => {
                      setDomain(d.id);
                      setStep(1);
                    }}
                    className="group relative flex items-center justify-between gap-4 rounded-xl border border-slate-200/90 bg-white p-5 hover:border-purple-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    {/* Left: Circular Icon Avatar */}
                    {d.badge}

                    {/* Middle: Title & Description */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm sm:text-[15px] font-extrabold text-slate-900 group-hover:text-[#6D28D9] transition-colors leading-snug">
                        {d.name}
                      </div>
                      <div className="mt-1 text-xs text-slate-500 font-normal leading-relaxed">
                        {d.description}
                      </div>
                    </div>

                    {/* Right: Outline Circular Arrow Button */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${d.arrowBorderColor} ${d.arrowTextColor} ${d.arrowHoverBg} bg-white transition-transform duration-200 group-hover:translate-x-1 shadow-2xs`}
                    >
                      <IconArrowRight className="h-4 w-4 stroke-[2.5]" />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ================= STEP 1: PACE SELECTION ================= */}
        {step === 1 && (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
            
            <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-100/80">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-[#6D28D9] border border-purple-100 shadow-2xs shrink-0">
                <IconClock className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Choose Learning Pace
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
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
                    className={`flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition-all duration-150 cursor-pointer ${
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
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
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

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
              <button
                onClick={() => setStep(0)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <IconArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <button
                disabled={!trackPace}
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] px-6 py-2.5 text-xs font-extrabold text-white shadow-md shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <span>Define Objective</span>
                <IconArrowRight className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>

          </div>
        )}

        {/* ================= STEP 2: GOAL OBJECTIVE & INTAKE ================= */}
        {step === 2 && (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
            
            <div className="mb-5">
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                State Your Target Objective
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
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

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <IconArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <button
                disabled={loading}
                onClick={createGoal}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] px-7 py-2.5 text-xs font-extrabold text-white shadow-md shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? "Creating Goal..." : "Initiate Diagnostic Intake"}</span>
                <IconArrowRight className="h-4 w-4 stroke-[2.5]" />
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
