"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PracticeQuiz } from "@/frontend/components/goals/PracticeQuiz";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconExternalLink,
  IconLock,
  IconCode,
  IconAward,
  IconFileText,
  IconDeviceLaptop,
} from "@tabler/icons-react";

type Props = {
  goalId: string;
  moduleId: string;
  skillName: string;
  resourceTitle: string;
  resourceUrl: string;
  resourceType: string;
  resourceProvider: string;
  estimatedMinutes: number;
  rationale: string;
  isProgramming: boolean;
  programmingLanguage: string | null;
  hasResourceDone: boolean;
  hasPracticeAttempt: boolean;
  proctoredAlreadyTaken: boolean;
  proctoredScore: number | null;
  proctoredReport: string | null;
};

export function ModuleWorkspace(props: Props) {
  const [resourceMarked, setResourceMarked] = useState(props.hasResourceDone);
  const [practiceAttempted, setPracticeAttempted] = useState(props.hasPracticeAttempt);
  const [feedbackSent, setFeedbackSent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function postProgress(body: Record<string, unknown>) {
    setBusy(true);
    try {
      await fetch(`/api/modules/${props.moduleId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } finally {
      setBusy(false);
    }
  }

  async function trackEvent(body: { eventType: string; modality?: string; timeSpentSeconds?: number }) {
    try {
      await fetch(`/api/modules/${props.moduleId}/track-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      // Non-blocking telemetry
    }
  }

  const hoursEst = Math.max(1, Math.round(props.estimatedMinutes / 60));

  return (
    <div className="relative w-full min-h-screen py-8 px-4 sm:px-8 flex flex-col items-center">
      
      {/* Background Soft Studio Ambient Image Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <Image
          src="/images/journey/study_desk_bg.jpg"
          alt="Study Desk Studio"
          fill
          unoptimized
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFF9F6]/80 via-[#FFF9F6]/60 to-[#FFF9F6]/90" />
      </div>

      <div className="relative z-10 w-full max-w-5xl space-y-6">
        
        {/* Top Back Navigation Link */}
        <div>
          <Link
            href={`/goals/${props.goalId}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors group"
          >
            <IconArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Roadmap</span>
          </Link>
        </div>

        {/* Main 2-Column Stage (Left 3D Stepper Trail + Right Cards) */}
        <div className="relative grid grid-cols-1 md:grid-cols-[140px_1fr] gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* 1. LEFT 3D STEPPER TRAIL (Exact Match to Image 1)                         */}
          {/* ========================================================================= */}
          <div className="relative flex flex-col items-center pt-2 select-none">
            
            {/* Step 01: Active 3D Hexagonal Purple Pedestal with Flag */}
            <div className="relative flex flex-col items-center z-20 group">
              {/* Flag on top right */}
              <div className="absolute -top-4 right-2 text-sm drop-shadow-md animate-bounce duration-1000">
                🚩
              </div>

              {/* Radiant Purple Pulse Aura */}
              <div className="absolute -inset-4 rounded-full bg-purple-500/30 blur-xl animate-pulse" />

              {/* 3D Hexagonal Badge 01 */}
              <div className="relative flex flex-col items-center drop-shadow-[0_12px_24px_rgba(109,40,217,0.55)]">
                <div className="relative flex flex-col items-center justify-center w-20 h-22 rounded-2xl bg-gradient-to-b from-[#8B5CF6] via-[#6D28D9] to-[#4C1D95] border-3 border-purple-200 text-white shadow-xl">
                  <span className="text-[10px] font-black tracking-widest text-purple-200 uppercase">01</span>
                  <div className="text-xl font-mono font-black text-white">&lt;/&gt;</div>
                </div>

                {/* 3D Base Tier */}
                <div className="-mt-3 w-22 h-6 rounded-full bg-gradient-to-r from-purple-950 via-[#5B21B6] to-purple-950 border-2 border-purple-300 shadow-lg flex items-center justify-center">
                  <div className="w-16 h-2 rounded-full bg-purple-400/40 blur-xs" />
                </div>
              </div>
            </div>

            {/* Vertical Dashed Light-Trail Connector 1 -> 2 */}
            <div className="w-1.5 h-36 bg-gradient-to-b from-purple-400 to-slate-400 border-x border-dashed border-white/80 my-1 relative z-10">
              <div className="absolute inset-0 bg-purple-400/50 blur-xs" />
            </div>

            {/* Step 02: Steel Pedestal Badge (Practice Assessment) */}
            <div className="relative flex flex-col items-center z-20">
              <div className="relative flex flex-col items-center drop-shadow-[0_10px_20px_rgba(30,41,59,0.3)]">
                <div
                  className={`relative flex flex-col items-center justify-center w-18 h-20 rounded-2xl border-2 text-white shadow-lg transition-all ${
                    resourceMarked
                      ? "bg-gradient-to-b from-purple-600 via-indigo-700 to-purple-900 border-purple-300"
                      : "bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 border-slate-400 opacity-90"
                  }`}
                >
                  <span className="text-[9px] font-black tracking-widest text-slate-300">02</span>
                  <IconFileText className="h-6 w-6 text-slate-200 mt-0.5" />
                </div>

                {/* Pedestal Base Ring with Lock Badge */}
                <div className="-mt-2.5 w-20 h-5 rounded-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-500 shadow-md flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center">
                    {resourceMarked ? (
                      <IconCheck className="h-2.5 w-2.5 text-emerald-400 stroke-[3]" />
                    ) : (
                      <IconLock className="h-2.5 w-2.5 text-slate-300" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical Dashed Light-Trail Connector 2 -> 3 */}
            <div className="w-1.5 h-36 bg-gradient-to-b from-slate-400 to-slate-500 border-x border-dashed border-white/80 my-1 relative z-10">
              <div className="absolute inset-0 bg-slate-400/40 blur-xs" />
            </div>

            {/* Step 03: Steel Pedestal Badge (Official Proctored Assessment) */}
            <div className="relative flex flex-col items-center z-20">
              <div className="relative flex flex-col items-center drop-shadow-[0_10px_20px_rgba(30,41,59,0.3)]">
                <div
                  className={`relative flex flex-col items-center justify-center w-18 h-20 rounded-2xl border-2 text-white shadow-lg transition-all ${
                    practiceAttempted
                      ? "bg-gradient-to-b from-purple-600 via-indigo-700 to-purple-900 border-purple-300"
                      : "bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 border-slate-400 opacity-90"
                  }`}
                >
                  <span className="text-[9px] font-black tracking-widest text-slate-300">03</span>
                  <IconAward className="h-6 w-6 text-slate-200 mt-0.5" />
                </div>

                {/* Pedestal Base Ring with Lock Badge */}
                <div className="-mt-2.5 w-20 h-5 rounded-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-500 shadow-md flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center">
                    {practiceAttempted ? (
                      <IconCheck className="h-2.5 w-2.5 text-emerald-400 stroke-[3]" />
                    ) : (
                      <IconLock className="h-2.5 w-2.5 text-slate-300" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Curving Connector 3 -> Chest */}
            <svg className="w-24 h-24 pointer-events-none -my-2 z-10" viewBox="0 0 100 100" fill="none">
              <path
                d="M 50 0 C 50 50, 50 60, 50 100"
                stroke="#94A3B8"
                strokeWidth="6"
                strokeDasharray="6 6"
                strokeLinecap="round"
              />
            </svg>

            {/* Locked Treasure Chest on Circular Stone Pedestal */}
            <div className="relative flex flex-col items-center z-20 group cursor-pointer">
              <div className="relative flex flex-col items-center">
                {/* 3D Chest Container */}
                <div className="relative h-20 w-20 drop-shadow-[0_10px_20px_rgba(30,41,59,0.4)] group-hover:scale-105 transition-transform">
                  <Image
                    src="/images/journey/treasure_transparent.png"
                    alt="Locked Chest"
                    fill
                    unoptimized
                    className="object-contain grayscale contrast-125"
                  />
                  {/* Padlock on chest */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-6 rounded-full bg-slate-900/90 border border-slate-400 flex items-center justify-center shadow-lg">
                      <IconLock className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Circular Stone Tiered Base */}
                <div className="-mt-3 w-24 h-5 rounded-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-2 border-slate-500 shadow-md" />
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 2. RIGHT CARDS COLUMN (Exact Match to Image 1)                            */}
          {/* ========================================================================= */}
          <div className="space-y-6">
            
            {/* --------------------------------------------------------------------- */}
            {/* CARD 1: Step 01 Hero Card (Dark Purple/Navy Developer Card)           */}
            {/* --------------------------------------------------------------------- */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1C1736] via-[#140F2D] to-[#0E0A22] border border-purple-500/30 p-6 sm:p-7 shadow-2xl text-white">
              
              {/* Top Row Badges */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="px-3 py-1 rounded-md bg-purple-900/80 border border-purple-400/40 text-purple-200 text-[11px] font-black uppercase tracking-wider shadow-xs">
                  {props.skillName}
                </span>

                <span className="px-3 py-1 rounded-md bg-[#251E49] border border-purple-500/30 text-purple-300 text-[11px] font-extrabold tracking-wide">
                  ~{hoursEst}h ESTIMATED
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_160px] gap-6 items-center">
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {props.resourceTitle}
                  </h1>
                  <p className="text-xs text-slate-400 font-medium">
                    Source: <span className="text-slate-300">{props.resourceProvider}</span> · Modality: <span className="text-purple-300">{props.resourceType.toUpperCase()}</span>
                  </p>

                  {/* Action Buttons */}
                  <div className="pt-4 flex flex-wrap items-center gap-3">
                    <a
                      href={props.resourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => {
                        trackEvent({ eventType: "open", modality: props.resourceType });
                        if (!resourceMarked) postProgress({ type: "started" });
                      }}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-gradient-to-r from-[#A855F7] via-[#8B5CF6] to-[#7C3AED] text-white text-xs font-black shadow-lg shadow-purple-500/30 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <span>Launch Resource</span>
                      <IconExternalLink className="h-4 w-4" />
                    </a>

                    {!resourceMarked ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          await postProgress({ type: "resource_done" });
                          await trackEvent({ eventType: "complete", modality: props.resourceType });
                          setResourceMarked(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-[#28214A] border border-purple-400/30 text-slate-200 text-xs font-bold hover:bg-[#342B60] hover:text-white transition-all cursor-pointer disabled:opacity-50"
                      >
                        <span>Mark Step Complete</span>
                        <IconCheck className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold">
                        <IconCheck className="h-4 w-4 stroke-[3]" />
                        <span>Step Completed</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3D Desktop Monitor Illustration with Code Lines & {} Badge */}
                <div className="hidden lg:flex flex-col items-center justify-center relative select-none">
                  <div className="relative w-36 h-28 rounded-lg bg-[#0F0C24] border-2 border-purple-500/40 shadow-xl p-2.5 flex flex-col justify-between">
                    {/* Monitor Code Lines */}
                    <div className="space-y-1.5">
                      <div className="h-1.5 w-16 bg-purple-400/80 rounded-full" />
                      <div className="h-1.5 w-24 bg-cyan-400/70 rounded-full" />
                      <div className="h-1.5 w-20 bg-emerald-400/70 rounded-full" />
                      <div className="h-1.5 w-14 bg-amber-400/70 rounded-full" />
                      <div className="h-1.5 w-22 bg-purple-300/60 rounded-full" />
                    </div>

                    {/* Monitor Stand */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-3 bg-purple-900 rounded-b-md" />
                  </div>

                  {/* Floating Hexagonal Code Symbol Badge */}
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] border border-purple-200 text-white font-mono font-black text-sm shadow-lg drop-shadow-md">
                    &#123;&#125;
                  </div>
                </div>
              </div>

              {/* Module Difficulty Calibration */}
              <div className="mt-6 pt-4 border-t border-purple-500/20 space-y-2">
                <p className="text-[11px] font-bold text-slate-300">
                  Calibrate Module Difficulty for Future Recommendations:
                </p>
                
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      await postProgress({ type: "feedback", feedback: "too_easy" });
                      setFeedbackSent("too_easy");
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border text-xs font-bold transition-all cursor-pointer ${
                      feedbackSent === "too_easy"
                        ? "bg-emerald-900 border-emerald-400 text-white shadow-sm"
                        : "bg-[#0A2616] border-emerald-600/50 text-emerald-300 hover:bg-emerald-950"
                    }`}
                  >
                    <span>😄</span>
                    <span>Too Easy</span>
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      await postProgress({ type: "feedback", feedback: "just_right" });
                      setFeedbackSent("just_right");
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border text-xs font-bold transition-all cursor-pointer ${
                      feedbackSent === "just_right"
                        ? "bg-blue-900 border-blue-400 text-white shadow-sm"
                        : "bg-[#0C1E3D] border-blue-600/50 text-blue-300 hover:bg-blue-950"
                    }`}
                  >
                    <span>😐</span>
                    <span>Balanced</span>
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      await postProgress({ type: "feedback", feedback: "too_hard" });
                      setFeedbackSent("too_hard");
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border text-xs font-bold transition-all cursor-pointer ${
                      feedbackSent === "too_hard"
                        ? "bg-amber-900 border-amber-400 text-white shadow-sm"
                        : "bg-[#2D1606] border-amber-600/50 text-amber-300 hover:bg-amber-950"
                    }`}
                  >
                    <span>🤔</span>
                    <span>Challenging</span>
                  </button>
                </div>
              </div>

            </div>

            {/* --------------------------------------------------------------------- */}
            {/* CARD 2: Step 02 (Practice Assessment - Light Glass Card)              */}
            {/* --------------------------------------------------------------------- */}
            {resourceMarked ? (
              <div className="relative overflow-hidden rounded-2xl bg-white/98 border-2 border-purple-200 p-6 shadow-xl backdrop-blur-md">
                <PracticeQuiz moduleId={props.moduleId} onSubmitted={() => setPracticeAttempted(true)} />
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-2xl bg-white/95 border border-slate-200/90 p-6 sm:p-7 shadow-lg backdrop-blur-md grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-6 items-center">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <IconLock className="h-5 w-5 text-slate-500" />
                    <span>Practice Assessment</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Complete the resource review above to unlock practice assessments.
                  </p>
                </div>

                {/* 3D Paper Checklist Illustration with Lock Badge */}
                <div className="flex items-center justify-center relative select-none">
                  <div className="relative w-22 h-26 rounded-lg bg-slate-50 border border-slate-200 shadow-md p-2 space-y-1.5">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-xs bg-slate-300" />
                      <div className="h-1.5 w-12 bg-slate-200 rounded-full" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-xs bg-slate-300" />
                      <div className="h-1.5 w-10 bg-slate-200 rounded-full" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-xs bg-slate-300" />
                      <div className="h-1.5 w-14 bg-slate-200 rounded-full" />
                    </div>
                    {/* Pencil */}
                    <div className="absolute -bottom-1 -right-2 w-10 h-2 bg-amber-400 rotate-45 rounded-xs shadow-xs border border-amber-600" />
                  </div>

                  {/* Circular Lock Badge */}
                  <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center shadow-md">
                    <IconLock className="h-3.5 w-3.5 text-slate-600" />
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* CARD 3: Step 03 (Official Proctored Assessment - Light Glass Card)    */}
            {/* --------------------------------------------------------------------- */}
            {props.proctoredAlreadyTaken ? (
              <div className="relative overflow-hidden rounded-2xl bg-white/98 border-2 border-emerald-200 p-6 shadow-xl backdrop-blur-md space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <IconAward className="h-5 w-5 text-emerald-600" />
                    <span>Official Proctored Assessment Cleared</span>
                  </h3>
                  <span className="px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-black">
                    MASTERY RECORDED
                  </span>
                </div>
                <div className="text-3xl font-black text-emerald-600">
                  {props.proctoredScore}/100
                </div>
              </div>
            ) : practiceAttempted ? (
              <div className="relative overflow-hidden rounded-2xl bg-white/98 border-2 border-purple-300 p-6 shadow-xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <IconAward className="h-5 w-5 text-[#6D28D9]" />
                    <span>Official Proctored Assessment</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-xs font-black">
                    UNLOCKED
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Single-attempt, timed, webcam presence-monitored trial. Successfully completing this assessment records official skill mastery.
                </p>
                <Link
                  href={`/goals/${props.goalId}/modules/${props.moduleId}/proctored`}
                  className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-md bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white text-xs font-black shadow-lg shadow-purple-500/20 hover:opacity-95 transition-all"
                >
                  <span>Begin Proctored Assessment</span>
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-2xl bg-white/95 border border-slate-200/90 p-6 sm:p-7 shadow-lg backdrop-blur-md grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-6 items-center">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <IconLock className="h-5 w-5 text-slate-500" />
                    <span>Official Proctored Assessment</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Complete at least one practice quiz attempt in the arena above to unlock this assessment.
                  </p>
                </div>

                {/* 3D Laptop with Shield Illustration & Lock Badge */}
                <div className="flex items-center justify-center relative select-none">
                  <div className="relative w-24 h-20 rounded-lg bg-slate-100 border border-slate-300 shadow-md flex items-center justify-center">
                    <IconDeviceLaptop className="h-10 w-10 text-slate-400" />
                  </div>

                  {/* Circular Lock Badge */}
                  <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center shadow-md">
                    <IconLock className="h-3.5 w-3.5 text-slate-600" />
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* BOTTOM REWARD CARD (Beside the Treasure Chest)                        */}
            {/* --------------------------------------------------------------------- */}
            <div className="rounded-xl bg-white/95 border border-purple-100 p-4 shadow-md backdrop-blur-md flex items-center justify-center gap-2.5 text-xs font-bold text-slate-700">
              <IconLock className="h-4 w-4 text-purple-600" />
              <span>
                Complete all steps above to unlock <span className="text-[#6D28D9] font-black">amazing rewards!</span> 🎁
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default ModuleWorkspace;
