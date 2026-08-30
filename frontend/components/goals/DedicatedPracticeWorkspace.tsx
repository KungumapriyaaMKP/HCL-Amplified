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
            
            {/* Top Score HUD Card */}
            <div className="rounded-none border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-xs space-y-4 relative overflow-hidden">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-none bg-gradient-to-tr from-[#6D28D9] to-[#06B6D4] text-white font-black text-3xl shadow-lg shadow-purple-500/20">
                {result.score}%
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#7C3AED]">
                  ASSESSMENT COMPLETED
                </span>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {result.score >= 70 ? "Milestone Accuracy Achieved!" : "Practice Complete • Ready for Review"}
                </h1>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                  You answered <span className="font-bold text-slate-900">{result.correctCount} of {result.total}</span> questions correctly. Review the explanations below to reinforce your understanding.
                </p>
              </div>

              {/* SlideToUnlock Practice Reward Card */}
              <div className="pt-2 flex justify-center">
                <SlideToUnlock
                  sliderText="Swipe to claim Practice Loot"
                  className="max-w-md border-purple-200 bg-purple-50/40 text-slate-900 shadow-sm"
                  unlockedContent={
                    <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-none shadow-md">
                      <div className="space-y-0.5">
                        <p className="text-xs font-black">Practice Score Credited! +50 XP Claimed</p>
                        <p className="text-[10px] text-emerald-100">Step 03 Proctored Exam Unlocked</p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-white text-emerald-700 flex items-center justify-center font-black text-xs shadow-xs">
                        🛡️
                      </div>
                    </div>
                  }
                >
                  <div className="text-left">
                    <h4 className="text-xs font-black text-slate-900">Step 02 Practice Completed</h4>
                    <p className="text-[10px] text-slate-500">Swipe the slider below to claim your practice milestone bonus</p>
                  </div>
                </SlideToUnlock>
              </div>

              {/* Redirect Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                {/* Primary Button: Return to Roadmap */}
                <Link
                  href={`/goals/${goalId}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-none bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] text-white text-xs font-extrabold shadow-md shadow-purple-500/25 hover:opacity-95 hover:shadow-lg transition-all cursor-pointer"
                >
                  <IconArrowLeft className="h-4 w-4" />
                  <span>Return to Goal Roadmap</span>
                </Link>

                {/* Secondary Option: Proctored Test */}
                <Link
                  href={`/goals/${goalId}/modules/${moduleId}/proctored`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-none border border-purple-200 bg-purple-50 text-[#7C3AED] text-xs font-extrabold hover:bg-purple-100 transition-all cursor-pointer"
                >
                  <IconShieldCheck className="h-4 w-4" />
                  <span>Take Proctored Exam</span>
                  <IconArrowRight className="h-4 w-4" />
                </Link>

                {/* Retake Button */}
                <button
                  type="button"
                  onClick={startPractice}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-none border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <IconRefresh className="h-4 w-4" />
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
