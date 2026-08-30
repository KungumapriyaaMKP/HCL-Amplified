"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CubeLoader from "@/components/ui/cube-loader";
import {
  IconArrowLeft,
  IconArrowRight,
  IconTarget,
  IconCheck,
  IconX,
  IconRefresh,
  IconAward,
  IconSparkles,
  IconShieldCheck,
  IconBook,
} from "@tabler/icons-react";
import { SlideToUnlock } from "@/components/ui/reward-card";
import { emitNudge } from "@/lib/mentorBus";

type Question = { id: string; question: string; options: string[] };
type Explanation = {
  id: string;
  correctIndex: number;
  selectedIndex: number | null;
  explanation: string;
};

type Props = {
  goalId: string;
  moduleId: string;
  skillName: string;
  resourceTitle: string;
};

export function DedicatedPracticeWorkspace({
  goalId,
  moduleId,
  skillName,
  resourceTitle,
}: Props) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    score: number;
    correctCount: number;
    total: number;
    explanations: Explanation[];
  } | null>(null);

  async function startPractice() {
    setLoading(true);
    setError(null);
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);
    try {
      const res = await fetch(`/api/modules/${moduleId}/practice/generate`, {
        method: "POST",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not generate questions");
      setAttemptId(body.attemptId);
      setQuestions(body.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }

  async function submitPractice() {
    if (!attemptId || !questions) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = questions.map((q) => ({
        id: q.id,
        selectedIndex: answers[q.id] ?? -1,
      }));
      const res = await fetch(`/api/modules/${moduleId}/practice/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, answers: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not score assessment");
      setResult(data);
      if (data.score >= 70) emitNudge("quiz_pass");
      if (data.detour) emitNudge("detour_splice");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  // Auto-start on initial page load
  useEffect(() => {
    startPractice();
  }, [moduleId]);

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-900 font-sans py-8 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Top Header & Navigation Links */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/goals/${goalId}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none border border-slate-200 bg-white text-xs font-extrabold text-slate-700 hover:text-[#7C3AED] hover:border-purple-300 transition-all cursor-pointer shadow-2xs group"
            >
              <IconArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Roadmap</span>
            </Link>

            <span className="text-slate-300">/</span>

            <Link
              href={`/goals/${goalId}/modules/${moduleId}`}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              {skillName}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-none bg-purple-50 border border-purple-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#7C3AED]">
              PRACTICE ARENA • UNLIMITED RETAKES
            </span>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="rounded-none border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        {/* 1. Loading State (3D CubeLoader) */}
        {loading && (
          <div className="rounded-none border border-slate-200 bg-white p-10 text-center shadow-xs">
            <CubeLoader
              title="SYNTHESIZING PRACTICE QUESTIONS"
              subtitle={`Targeting ${skillName} foundational concepts and formulating practice challenge set…`}
            />
          </div>
        )}

        {/* 2. Submitting / Scoring State (3D CubeLoader) */}
        {submitting && (
          <div className="rounded-none border border-slate-200 bg-white p-10 text-center shadow-xs">
            <CubeLoader
              title="EVALUATING & SCORING"
              subtitle="Calibrating your response accuracy and compiling step-by-step master explanations…"
            />
          </div>
        )}

        {/* 3. Results Screen (Completed Assessment) */}
        {!loading && !submitting && result && (
          <div className="space-y-6">
            
            {/* Top Score HUD Card (100% Match to Design Image) */}
            <div className="rounded-3xl border border-purple-100/90 bg-gradient-to-b from-white to-[#FAF9FF] p-6 sm:p-10 text-center shadow-xl shadow-purple-500/5 space-y-6 relative overflow-hidden backdrop-blur-md">
              {/* Decorative Corner Dot Grid Matrices */}
              <div className="absolute top-6 left-6 pointer-events-none opacity-30 select-none">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="#818CF8">
                  <circle cx="4" cy="4" r="1.5" /><circle cx="15" cy="4" r="1.5" /><circle cx="26" cy="4" r="1.5" /><circle cx="36" cy="4" r="1.5" />
                  <circle cx="4" cy="15" r="1.5" /><circle cx="15" cy="15" r="1.5" /><circle cx="26" cy="15" r="1.5" /><circle cx="36" cy="15" r="1.5" />
                  <circle cx="4" cy="26" r="1.5" /><circle cx="15" cy="26" r="1.5" /><circle cx="26" cy="26" r="1.5" /><circle cx="36" cy="26" r="1.5" />
                  <circle cx="4" cy="36" r="1.5" /><circle cx="15" cy="36" r="1.5" /><circle cx="26" cy="36" r="1.5" /><circle cx="36" cy="36" r="1.5" />
                </svg>
              </div>

              <div className="absolute bottom-6 right-6 pointer-events-none opacity-30 select-none">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="#818CF8">
                  <circle cx="4" cy="4" r="1.5" /><circle cx="15" cy="4" r="1.5" /><circle cx="26" cy="4" r="1.5" /><circle cx="36" cy="4" r="1.5" />
                  <circle cx="4" cy="15" r="1.5" /><circle cx="15" cy="15" r="1.5" /><circle cx="26" cy="15" r="1.5" /><circle cx="36" cy="15" r="1.5" />
                  <circle cx="4" cy="26" r="1.5" /><circle cx="15" cy="26" r="1.5" /><circle cx="26" cy="26" r="1.5" /><circle cx="36" cy="26" r="1.5" />
                  <circle cx="4" cy="36" r="1.5" /><circle cx="15" cy="36" r="1.5" /><circle cx="26" cy="36" r="1.5" /><circle cx="36" cy="36" r="1.5" />
                </svg>
              </div>

              {/* Decorative Concentric Corner Ring Accents */}
              <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full border border-purple-200/50 pointer-events-none" />
              <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full border border-purple-200/50 pointer-events-none" />

              {/* Laurel Wreath & Circular Score Gauge HUD (Exact Match to Image 2) */}
              <div className="relative flex items-center justify-center pt-2">
                {(() => {
                  const angleDeg = -90 + (result.score / 100) * 360;
                  const angleRad = (angleDeg * Math.PI) / 180;
                  const dotX = 120 + 49 * Math.cos(angleRad);
                  const dotY = 75 + 49 * Math.sin(angleRad);
                  return (
                    <svg width="250" height="155" viewBox="0 0 250 155" fill="none" className="overflow-visible select-none">
                      <defs>
                        <linearGradient id="scoreGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#4338CA" />
                          <stop offset="35%" stopColor="#6366F1" />
                          <stop offset="70%" stopColor="#0EA5E9" />
                          <stop offset="100%" stopColor="#06B6D4" />
                        </linearGradient>

                        <filter id="gaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#6366F1" floodOpacity="0.12" />
                        </filter>
                      </defs>

                      {/* Minimal Design Accents from Target Image */}
                      <rect x="18" y="34" width="8" height="4" rx="1.5" fill="#F59E0B" transform="rotate(20 18 34)" opacity="0.9" />
                      <path d="M 230 34 L 234 36 L 231 39 L 227 37 Z" fill="#A855F7" opacity="0.9" />

                      {/* Left Laurel Branch (Realistic Pointed Leaves) */}
                      <g opacity="0.85">
                        {/* Curved Stem */}
                        <path d="M 52 118 C 40 92 44 58 64 36" stroke="#E9D5FF" strokeWidth="1.5" strokeLinecap="round" fill="none" />

                        {/* Pair 1 (Base) */}
                        <path d="M 0 0 C 3 -2.2, 7 -2.2, 11 0 C 7 2.2, 3 2.2, 0 0 Z" fill="#DDD6FE" transform="translate(51, 114) rotate(-140)" />
                        <path d="M 0 0 C 3 -2.2, 7 -2.2, 11 0 C 7 2.2, 3 2.2, 0 0 Z" fill="#DDD6FE" transform="translate(53, 112) rotate(-55)" />

                        {/* Pair 2 */}
                        <path d="M 0 0 C 3.5 -2.5, 8 -2.5, 12 0 C 8 2.5, 3.5 2.5, 0 0 Z" fill="#E9D5FF" transform="translate(46, 96) rotate(-135)" />
                        <path d="M 0 0 C 3.5 -2.5, 8 -2.5, 12 0 C 8 2.5, 3.5 2.5, 0 0 Z" fill="#DDD6FE" transform="translate(48, 94) rotate(-50)" />

                        {/* Pair 3 */}
                        <path d="M 0 0 C 3.5 -2.5, 8 -2.5, 12 0 C 8 2.5, 3.5 2.5, 0 0 Z" fill="#E9D5FF" transform="translate(43, 76) rotate(-130)" />
                        <path d="M 0 0 C 3.5 -2.5, 8 -2.5, 12 0 C 8 2.5, 3.5 2.5, 0 0 Z" fill="#DDD6FE" transform="translate(46, 74) rotate(-45)" />

                        {/* Pair 4 */}
                        <path d="M 0 0 C 3.5 -2.5, 8 -2.5, 12 0 C 8 2.5, 3.5 2.5, 0 0 Z" fill="#E9D5FF" transform="translate(46, 56) rotate(-120)" />
                        <path d="M 0 0 C 3.5 -2.5, 8 -2.5, 12 0 C 8 2.5, 3.5 2.5, 0 0 Z" fill="#DDD6FE" transform="translate(50, 54) rotate(-35)" />

                        {/* Pair 5 (Top) */}
                        <path d="M 0 0 C 3 -2.2, 7 -2.2, 10 0 C 7 2.2, 3 2.2, 0 0 Z" fill="#E9D5FF" transform="translate(54, 42) rotate(-105)" />
                        <path d="M 0 0 C 3 -2.2, 7 -2.2, 10 0 C 7 2.2, 3 2.2, 0 0 Z" fill="#DDD6FE" transform="translate(59, 40) rotate(-20)" />

                        {/* Apex Tip Leaf */}
                        <path d="M 0 0 C 3 -2.2, 7 -2.2, 10 0 C 7 2.2, 3 2.2, 0 0 Z" fill="#C4B5FD" transform="translate(64, 36) rotate(-60)" />
                      </g>

                      {/* Right Laurel Branch (Mirrored for 100% Symmetrical Perfection) */}
                      <g opacity="0.85" transform="translate(240, 0) scale(-1, 1)">
                        {/* Curved Stem */}
                        <path d="M 52 118 C 40 92 44 58 64 36" stroke="#E9D5FF" strokeWidth="1.5" strokeLinecap="round" fill="none" />

                        {/* Pair 1 (Base) */}
                        <path d="M 0 0 C 3 -2.2, 7 -2.2, 11 0 C 7 2.2, 3 2.2, 0 0 Z" fill="#DDD6FE" transform="translate(51, 114) rotate(-140)" />
                        <path d="M 0 0 C 3 -2.2, 7 -2.2, 11 0 C 7 2.2, 3 2.2, 0 0 Z" fill="#DDD6FE" transform="translate(53, 112) rotate(-55)" />

                        {/* Pair 2 */}
                        <path d="M 0 0 C 3.5 -2.5, 8 -2.5, 12 0 C 8 2.5, 3.5 2.5, 0 0 Z" fill="#E9D5FF" transform="translate(46, 96) rotate(-135)" />
                        <path d="M 0 0 C 3.5 -2.5, 8 -2.5, 12 0 C 8 2.5, 3.5 2.5, 0 0 Z" fill="#DDD6FE" transform="translate(48, 94) rotate(-50)" />

                        {/* Pair 3 */}
                        <path d="M 0 0 C 3.5 -2.5, 8 -2.5, 12 0 C 8 2.5, 3.5 2.5, 0 0 Z" fill="#E9D5FF" transform="translate(43, 76) rotate(-130)" />
                        <path d="M 0 0 C 3.5 -2.5, 8 -2.5, 12 0 C 8 2.5, 3.5 2.5, 0 0 Z" fill="#DDD6FE" transform="translate(46, 74) rotate(-45)" />

                        {/* Pair 4 */}
                        <path d="M 0 0 C 3.5 -2.5, 8 -2.5, 12 0 C 8 2.5, 3.5 2.5, 0 0 Z" fill="#E9D5FF" transform="translate(46, 56) rotate(-120)" />
                        <path d="M 0 0 C 3.5 -2.5, 8 -2.5, 12 0 C 8 2.5, 3.5 2.5, 0 0 Z" fill="#DDD6FE" transform="translate(50, 54) rotate(-35)" />

                        {/* Pair 5 (Top) */}
                        <path d="M 0 0 C 3 -2.2, 7 -2.2, 10 0 C 7 2.2, 3 2.2, 0 0 Z" fill="#E9D5FF" transform="translate(54, 42) rotate(-105)" />
                        <path d="M 0 0 C 3 -2.2, 7 -2.2, 10 0 C 7 2.2, 3 2.2, 0 0 Z" fill="#DDD6FE" transform="translate(59, 40) rotate(-20)" />

                        {/* Apex Tip Leaf */}
                        <path d="M 0 0 C 3 -2.2, 7 -2.2, 10 0 C 7 2.2, 3 2.2, 0 0 Z" fill="#C4B5FD" transform="translate(64, 36) rotate(-60)" />
                      </g>

                      {/* Circular Progress Gauge */}
                      <g filter="url(#gaugeShadow)">
                        {/* Background Light Ring */}
                        <circle
                          cx="120"
                          cy="75"
                          r="49"
                          fill="#FFFFFF"
                          stroke="#F3F0FF"
                          strokeWidth="11"
                        />

                        {/* Progress Arc */}
                        <circle
                          cx="120"
                          cy="75"
                          r="49"
                          fill="none"
                          stroke="url(#scoreGaugeGrad)"
                          strokeWidth="11"
                          strokeLinecap="round"
                          strokeDasharray={`${(result.score / 100) * 307.88} 307.88`}
                          transform="rotate(-90 120 75)"
                        />

                        {/* Progress Tip Glowing Dot Indicator */}
                        <circle cx={dotX} cy={dotY} r="6" fill="#06B6D4" />
                        <circle cx={dotX} cy={dotY} r="2.5" fill="#FFFFFF" />
                      </g>

                      {/* Center Score Text & Subtitle Label */}
                      <text
                        x="120"
                        y="70"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#1E1B4B"
                        fontSize="32"
                        fontWeight="900"
                        letterSpacing="-0.5"
                      >
                        {result.score}%
                      </text>
                      <text
                        x="120"
                        y="93"
                        textAnchor="middle"
                        fill="#64748B"
                        fontSize="12"
                        fontWeight="600"
                      >
                        Score
                      </text>
                    </svg>
                  );
                })()}
              </div>

              {/* Assessment Completed Pill Label with Divider Lines */}
              <div className="flex items-center justify-center gap-3 pt-1">
                <div className="h-[1px] w-12 bg-purple-200" />
                <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#6366F1]">
                  ASSESSMENT COMPLETED
                </span>
                <div className="h-[1px] w-12 bg-purple-200" />
              </div>

              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] tracking-tight">
                  {result.score >= 70 ? "Milestone Accuracy Achieved!" : "Practice Complete • Ready for Review"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                  You answered <span className="font-bold text-[#6366F1]">{result.correctCount} of {result.total}</span> questions correctly. Review the explanations below to reinforce your understanding.
                </p>
              </div>

              {/* SlideToUnlock Reward Card with Sparkle Badge & Unlocked Gradient Pill */}
              <div className="pt-2 flex justify-center w-full">
                <SlideToUnlock
                  sliderText="Swipe to claim Practice Loot"
                  className="max-w-xl border-purple-100/90 bg-white/90 shadow-sm"
                  unlockedContent={
                    <div className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-[#6366F1] via-[#06B6D4] to-[#10B981] shadow-lg text-white">
                      <div className="flex items-center gap-3">
                        {/* 3D Glowing Hexagon Shield Badge */}
                        <div className="relative flex items-center justify-center shrink-0">
                          <svg width="42" height="42" viewBox="0 0 42 42" fill="none" className="drop-shadow-md">
                            <circle cx="5" cy="9" r="1.5" fill="#FDE047" />
                            <circle cx="37" cy="8" r="1.5" fill="#FDE047" />
                            <path d="M 21 3 L 36 11.5 L 36 28.5 L 21 37 L 6 28.5 L 6 11.5 Z" fill="#818CF8" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round" />
                            <path d="M 21 7 L 32 13.5 L 32 26.5 L 21 33 L 10 26.5 L 10 13.5 Z" fill="#FFFFFF" opacity="0.25" />
                            <path d="M 15 21 L 19 25 L 27 16" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>

                        <div className="text-left">
                          <p className="text-sm font-extrabold text-white tracking-tight leading-snug">
                            Practice Score Credited! +50 XP Claimed
                          </p>
                          <p className="text-[11px] text-cyan-100 font-semibold">
                            Step 03 Proctored Exam Unlocked
                          </p>
                        </div>
                      </div>

                      {/* Right Lock Button */}
                      <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white flex items-center justify-center shadow-md shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                    </div>
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-100/70 border border-purple-200/80 flex items-center justify-center text-purple-600 shadow-2xs shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M 12 3 L 14.5 9.5 L 21 12 L 14.5 14.5 L 12 21 L 9.5 14.5 L 3 12 L 9.5 9.5 Z" />
                        <path d="M 19 3 L 20 6 L 23 7 L 20 8 L 19 11 L 18 8 L 15 7 L 18 6 Z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-extrabold text-[#1E1B4B]">Step 02 Practice Completed</h4>
                      <p className="text-xs text-slate-400">Swipe the slider below to claim your practice milestone bonus</p>
                    </div>
                  </div>
                </SlideToUnlock>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
                {/* 1. Return to Goal Roadmap */}
                <Link
                  href={`/goals/${goalId}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] text-white text-xs font-bold shadow-md shadow-purple-500/25 hover:opacity-95 hover:shadow-lg transition-all cursor-pointer"
                >
                  <IconArrowLeft className="h-4 w-4" />
                  <span>Return to Goal Roadmap</span>
                </Link>

                {/* 2. Take Proctored Exam */}
                <Link
                  href={`/goals/${goalId}/modules/${moduleId}/proctored`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-purple-200/90 bg-white text-[#6366F1] text-xs font-bold hover:bg-purple-50/60 shadow-2xs transition-all cursor-pointer"
                >
                  <IconShieldCheck className="h-4 w-4 text-[#6366F1]" />
                  <span>Take Proctored Exam</span>
                  <IconArrowRight className="h-4 w-4" />
                </Link>

                {/* 3. Retake Practice */}
                <button
                  type="button"
                  onClick={startPractice}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
                >
                  <IconRefresh className="h-4 w-4 text-slate-600" />
                  <span>Retake Practice</span>
                </button>
              </div>
            </div>

            {/* Explanations List */}
            <div className="rounded-none border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Detailed Answer Explanations
                </h3>
                <span className="text-xs font-bold text-slate-400">
                  {result.explanations.length} Questions
                </span>
              </div>

              <div className="space-y-4">
                {result.explanations.map((exp, idx) => {
                  const isCorrect = exp.selectedIndex === exp.correctIndex;
                  const qObj = questions?.find((q) => q.id === exp.id);
                  return (
                    <div
                      key={exp.id}
                      className={`p-4 rounded-none border ${
                        isCorrect
                          ? "border-emerald-200 bg-emerald-50/40"
                          : "border-rose-200 bg-rose-50/40"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-none text-white font-bold text-xs shrink-0 mt-0.5 ${
                            isCorrect ? "bg-emerald-600" : "bg-rose-500"
                          }`}
                        >
                          {isCorrect ? (
                            <IconCheck className="h-3.5 w-3.5 stroke-[3]" />
                          ) : (
                            <IconX className="h-3.5 w-3.5 stroke-[3]" />
                          )}
                        </div>

                        <div className="flex-1 space-y-1.5">
                          <p className="text-xs font-bold text-slate-900">
                            <span className="text-slate-500 mr-1">{idx + 1}.</span>{" "}
                            {qObj?.question || `Question ${idx + 1}`}
                          </p>
                          <p className="text-xs text-slate-600 leading-relaxed font-normal">
                            {exp.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* 4. Active Question Flow */}
        {!loading && !submitting && !result && questions && questions.length > 0 && (
          <div className="rounded-none border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            
            {/* Header: Progress Counter & Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#7C3AED]">
                    QUESTION {currentIndex + 1} OF {questions.length}
                  </span>
                  <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {skillName} Practice Check
                  </div>
                </div>

                <span className="rounded-none bg-purple-50 border border-purple-200 px-2.5 py-1 text-xs font-bold text-[#7C3AED]">
                  {Object.keys(answers).length} / {questions.length} Answered
                </span>
              </div>

              <div className="w-full h-1.5 bg-slate-100 rounded-none overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] transition-all duration-300 rounded-none"
                  style={{
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Active Question Box */}
            {(() => {
              const q = questions[currentIndex];
              if (!q) return null;
              return (
                <div className="rounded-none border border-slate-200 bg-[#F8F9FD] p-5 space-y-4">
                  <p className="text-sm font-bold text-slate-900 leading-snug">
                    <span className="text-[#7C3AED] mr-1.5">{currentIndex + 1}.</span>{" "}
                    {q.question}
                  </p>

                  <div className="space-y-2.5">
                    {q.options.map((opt, oi) => {
                      const selected = answers[q.id] === oi;
                      return (
                        <label
                          key={oi}
                          onClick={() =>
                            setAnswers((prev) => ({ ...prev, [q.id]: oi }))
                          }
                          className={`flex cursor-pointer items-center gap-3 rounded-none border p-3.5 text-xs sm:text-sm font-medium transition-all ${
                            selected
                              ? "border-[#7C3AED] bg-purple-50 text-[#7C3AED] shadow-2xs ring-1 ring-purple-300 font-bold"
                              : "border-slate-200 bg-white text-slate-700 hover:border-purple-200 hover:bg-purple-50/20"
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            checked={selected}
                            onChange={() =>
                              setAnswers((prev) => ({ ...prev, [q.id]: oi }))
                            }
                            className="accent-[#7C3AED] h-4 w-4"
                          />
                          <span className="flex-1">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Question Navigation Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <IconArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  disabled={answers[questions[currentIndex]?.id] === undefined}
                  onClick={() =>
                    setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
                  }
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] rounded-none shadow-md shadow-purple-500/20 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  <span>Next Question</span>
                  <IconArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={
                    submitting ||
                    Object.keys(answers).length < questions.length
                  }
                  onClick={submitPractice}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-none shadow-md shadow-emerald-500/20 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  <span>Submit Practice Assessment</span>
                  <IconCheck className="h-4 w-4 stroke-[3]" />
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default DedicatedPracticeWorkspace;
