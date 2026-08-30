"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/frontend/components/ui/Card";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/Button";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconX,
  IconFlame,
  IconShieldCheck,
  IconAward,
  IconLayoutGrid,
} from "@tabler/icons-react";
import { ReviewQueueItem } from "@/app/api/review/today/route";
import { ReviewGrade } from "@/lib/review";
import {
  ReviewCelebrationIllustration,
  StudioHangingLamp,
  DotMatrixGrid,
  CornerStudyDecor,
} from "@/frontend/components/review/ReviewCelebrationIllustration";

export function ReviewSession() {
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [skillResponses, setSkillResponses] = useState<{ questionId: string; correct: boolean }[]>([]);
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [strengthenedSkills, setStrengthenedSkills] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchQueue() {
      try {
        const res = await fetch("/api/review/today");
        if (res.ok) {
          const data = await res.json();
          setQueue(data.items || []);
        }
      } catch (err) {
        console.error("Failed to load review queue:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchQueue();
  }, []);

  const currentSkill = queue[currentSkillIndex];
  const currentQuestion = currentSkill?.questions?.[currentQuestionIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswerRevealed) return;
    setSelectedOption(idx);
    setIsAnswerRevealed(true);

    const isCorrect = idx === currentQuestion.correctIndex;
    setSkillResponses((prev) => [...prev, { questionId: currentQuestion.id, correct: isCorrect }]);
  };

  const handleGradeAndAdvance = async (grade: ReviewGrade) => {
    if (submitting || !currentSkill) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/review/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillId: currentSkill.skillId,
          grade,
          responses: skillResponses,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTotalXpEarned((prev) => prev + (data.xpEarned || 10));
        setStrengthenedSkills((prev) => [...prev, currentSkill.skillName]);
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setSubmitting(false);

      // Check if more questions in current skill
      if (currentQuestionIndex + 1 < currentSkill.questions.length) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedOption(null);
        setIsAnswerRevealed(false);
      } else if (currentSkillIndex + 1 < queue.length) {
        // Next skill in queue
        setCurrentSkillIndex((prev) => prev + 1);
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsAnswerRevealed(false);
        setSkillResponses([]);
      } else {
        // Finished all reviews
        setIsFinished(true);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#7C3AED] border-t-transparent" />
          <span className="text-xs font-bold text-slate-500">Loading today&apos;s spaced review queue...</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // EXACT MATCH TO IMAGE 1: All Caught Up For Today State
  // =========================================================================
  if (queue.length === 0 || isFinished) {
    return (
      <div className="relative w-full py-4 sm:py-6 flex flex-col items-center select-none font-sans">
        
        {/* Background Decorative Studio Elements matching Image 1 */}
        <div className="absolute -top-6 right-2 pointer-events-none z-0 hidden md:block">
          <StudioHangingLamp className="w-18 h-32 opacity-90" />
        </div>
        <div className="absolute top-8 right-24 pointer-events-none z-0 hidden lg:block">
          <DotMatrixGrid rows={4} cols={4} />
        </div>
        <div className="absolute bottom-4 -left-6 pointer-events-none z-0 hidden md:block">
          <CornerStudyDecor className="w-24 h-24 opacity-70" />
        </div>
        <div className="absolute bottom-12 -right-4 pointer-events-none z-0 hidden lg:block">
          <DotMatrixGrid rows={4} cols={4} />
        </div>

        {/* Central Master Review Card matching Image 1 */}
        <div className="relative z-10 w-full max-w-xl rounded-2xl border border-purple-100/90 bg-white/95 p-8 sm:p-10 shadow-xl shadow-purple-900/5 backdrop-blur-md text-center flex flex-col items-center">
          
          {/* Exact 3D Clipboard with Books, Plant & Confetti */}
          <div className="mb-2">
            <ReviewCelebrationIllustration className="w-64 sm:w-72 h-52 sm:h-56" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <span>{isFinished ? "Spaced Review Complete!" : "All Caught Up For Today!"}</span>
            <span className="text-2xl">🎉</span>
          </h2>

          {/* Subtitle Description matching Image 1 */}
          <div className="mt-3 text-xs sm:text-sm font-medium text-slate-600 leading-relaxed max-w-md mx-auto space-y-1">
            {isFinished ? (
              <p>
                You strengthened {strengthenedSkills.length} key competencies and earned +{totalXpEarned} XP. Your decay intervals have been extended.
              </p>
            ) : (
              <>
                <p>No competencies are currently fading or due for review.</p>
                <p>Great job staying ahead of the curve!</p>
              </>
            )}
          </div>

          {isFinished && strengthenedSkills.length > 0 && (
            <div className="mt-6 w-full rounded-md bg-purple-50/60 p-4 text-left border border-purple-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 block mb-2">
                STRENGTHENED SKILLS
              </span>
              <div className="flex flex-wrap gap-1.5">
                {strengthenedSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-xs bg-white border border-purple-200 px-2.5 py-1 text-xs font-bold text-purple-900 shadow-2xs"
                  >
                    <IconCheck className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />
                    <span>{s}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Centered Star Divider matching Image 1 */}
          <div className="relative w-full my-7 flex items-center justify-center">
            <div className="w-full border-t border-purple-100" />
            <div className="absolute px-3 bg-white text-purple-400 text-xs font-black">
              ★
            </div>
          </div>

          {/* Vibrant Action Button matching Image 1 */}
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2.5 rounded-sm bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] hover:from-[#5B21B6] hover:to-[#7C3AED] px-8 py-3 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-purple-500/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <IconLayoutGrid className="w-4 h-4 stroke-[2.2]" />
              <span>Back to Dashboard</span>
              <IconArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>

        </div>

      </div>
    );
  }

  const progressPct = ((currentSkillIndex * 2 + currentQuestionIndex) / (queue.length * 2)) * 100;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header & Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-purple-600">
          <IconArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <Badge tone="accent">
          SKILL {currentSkillIndex + 1} OF {queue.length}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1.5">
          <span>{currentSkill?.skillName}</span>
          <span>Question {currentQuestionIndex + 1} of {currentSkill?.questions.length}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-[#7C3AED] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 shadow-sm">
          <div className="mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#7C3AED] block mb-1">
              FLASH RECALL
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-2.5 my-6">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQuestion.correctIndex;

              let optionStyle = "border-slate-200 bg-white hover:border-purple-300 text-slate-800";
              if (isAnswerRevealed) {
                if (isCorrect) {
                  optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-400";
                } else if (isSelected && !isCorrect) {
                  optionStyle = "border-rose-500 bg-rose-50 text-rose-950 ring-1 ring-rose-400";
                } else {
                  optionStyle = "border-slate-200 bg-slate-50 text-slate-400 opacity-60";
                }
              } else if (isSelected) {
                optionStyle = "border-purple-500 bg-purple-50 text-purple-950 font-bold";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswerRevealed}
                  className={`w-full text-left p-4 rounded-md border text-xs sm:text-sm transition-all flex items-start justify-between gap-3 ${optionStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswerRevealed && isCorrect && (
                    <IconCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[3]" />
                  )}
                  {isAnswerRevealed && isSelected && !isCorrect && (
                    <IconX className="h-4 w-4 text-rose-600 shrink-0 mt-0.5 stroke-[3]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {isAnswerRevealed && (
            <div className="mt-4 p-4 rounded-md bg-purple-50/80 border border-purple-200/80 text-xs text-purple-950 leading-relaxed">
              <span className="font-bold block mb-1">Concept Insight:</span>
              <p>{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Self-Rating Calibration Buttons (SM-2 Grade) */}
          {isAnswerRevealed && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block mb-3 text-center">
                How easy was this retrieval for you?
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleGradeAndAdvance("hard")}
                  disabled={submitting}
                  className="p-3 rounded-md border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-900 text-xs font-bold transition-colors text-center"
                >
                  <span className="block text-sm mb-0.5">Hard 😓</span>
                  <span className="text-[10px] text-rose-700 font-normal">Review soon</span>
                </button>

                <button
                  onClick={() => handleGradeAndAdvance("good")}
                  disabled={submitting}
                  className="p-3 rounded-md border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors text-center"
                >
                  <span className="block text-sm mb-0.5">Good 🙂</span>
                  <span className="text-[10px] text-amber-700 font-normal">Standard decay</span>
                </button>

                <button
                  onClick={() => handleGradeAndAdvance("easy")}
                  disabled={submitting}
                  className="p-3 rounded-md border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-colors text-center"
                >
                  <span className="block text-sm mb-0.5">Easy! 🚀</span>
                  <span className="text-[10px] text-emerald-700 font-normal">Extend interval</span>
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
