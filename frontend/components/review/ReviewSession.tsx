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
} from "@tabler/icons-react";
import { ReviewQueueItem } from "@/app/api/review/today/route";
import { ReviewGrade } from "@/lib/review";

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

  if (queue.length === 0 || isFinished) {
    return (
      <div className="mx-auto max-w-xl py-12 px-4">
        <Card className="p-8 text-center bg-white shadow-sm border border-slate-200/90">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-[#7C3AED] mb-4">
            {isFinished ? (
              <IconAward className="h-8 w-8 stroke-[2.5]" />
            ) : (
              <IconShieldCheck className="h-8 w-8 text-emerald-600 stroke-[2.5]" />
            )}
          </div>

          <h2 className="text-2xl font-black text-slate-900">
            {isFinished ? "Spaced Review Complete!" : "All Caught Up For Today!"}
          </h2>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            {isFinished
              ? `You strengthened ${strengthenedSkills.length} key competencies and earned +${totalXpEarned} XP. Your decay intervals have been extended.`
              : "No competencies are currently fading or due for review. Great job staying ahead of the curve!"}
          </p>

          {isFinished && strengthenedSkills.length > 0 && (
            <div className="mt-6 rounded-lg bg-slate-50 p-4 text-left border border-slate-200/60">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                STRENGTHENED SKILLS
              </span>
              <div className="flex flex-wrap gap-1.5">
                {strengthenedSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2.5 py-1 text-xs font-bold text-purple-900 shadow-2xs"
                  >
                    <IconCheck className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />
                    <span>{s}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/dashboard">
              <Button size="md" variant="primary">
                <span>Back to Dashboard</span>
                <IconArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const progressPct = ((currentSkillIndex * 2 + currentQuestionIndex) / (queue.length * 2)) * 100;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header & Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700"
        >
          <IconArrowLeft className="h-4 w-4" />
          <span>Exit to Dashboard</span>
        </Link>
        <span className="text-xs font-bold text-slate-500">
          Skill {currentSkillIndex + 1} of {queue.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-[#7C3AED] transition-all duration-300"
          style={{ width: `${Math.max(5, progressPct)}%` }}
        />
      </div>

      {/* Main Flashcard / MCQ Question Container */}
      <Card className="p-7 bg-white shadow-sm border border-slate-200/90">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2">
            <Badge tone="accent">{currentSkill.skillName}</Badge>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {currentSkill.category}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              currentSkill.decayTier === "decayed"
                ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                : "bg-amber-50 text-amber-700 border border-amber-200/60"
            }`}
          >
            <IconFlame className="h-3 w-3" />
            <span>{currentSkill.decayTier === "decayed" ? "Decayed Mastery" : "Fading Retention"}</span>
          </span>
        </div>

        {/* Question Text */}
        <h3 className="text-base font-bold text-slate-900 leading-snug">
          {currentQuestion?.question}
        </h3>

        {/* Option Choices */}
        <div className="mt-5 space-y-2.5">
          {currentQuestion?.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQuestion.correctIndex;

            let optionStyle = "border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 text-slate-800";
            if (isAnswerRevealed) {
              if (isCorrect) {
                optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-2xs";
              } else if (isSelected && !isCorrect) {
                optionStyle = "border-rose-400 bg-rose-50 text-rose-950 line-through opacity-90";
              } else {
                optionStyle = "border-slate-200 bg-slate-50 text-slate-400 opacity-60";
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswerRevealed}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-3.5 rounded-lg border text-xs transition-all flex items-center justify-between ${optionStyle}`}
              >
                <span>{opt}</span>
                {isAnswerRevealed && isCorrect && (
                  <IconCheck className="h-4 w-4 text-emerald-600 stroke-[3] shrink-0 ml-2" />
                )}
                {isAnswerRevealed && isSelected && !isCorrect && (
                  <IconX className="h-4 w-4 text-rose-500 stroke-[3] shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation & Self-Rating SM-2 Controls */}
        {isAnswerRevealed && (
          <div className="mt-6 border-t border-slate-100 pt-5 animate-fade-in">
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200/70 mb-5">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block mb-1">
                EXPLANATION
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800 mb-3 text-center">
                Rate your recall difficulty to calibrate your next review interval:
              </p>
              <div className="grid grid-cols-4 gap-2">
                <button
                  disabled={submitting}
                  onClick={() => handleGradeAndAdvance("again")}
                  className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-800 transition-all text-center"
                >
                  <span className="text-xs font-extrabold">Again</span>
                  <span className="text-[10px] text-rose-600 mt-0.5">&lt; 1 day</span>
                </button>

                <button
                  disabled={submitting}
                  onClick={() => handleGradeAndAdvance("hard")}
                  className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-800 transition-all text-center"
                >
                  <span className="text-xs font-extrabold">Hard</span>
                  <span className="text-[10px] text-amber-600 mt-0.5">~ 2 days</span>
                </button>

                <button
                  disabled={submitting}
                  onClick={() => handleGradeAndAdvance("good")}
                  className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 transition-all text-center"
                >
                  <span className="text-xs font-extrabold">Good</span>
                  <span className="text-[10px] text-purple-600 mt-0.5">~ 4 days</span>
                </button>

                <button
                  disabled={submitting}
                  onClick={() => handleGradeAndAdvance("easy")}
                  className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 transition-all text-center"
                >
                  <span className="text-xs font-extrabold">Easy</span>
                  <span className="text-[10px] text-emerald-600 mt-0.5">~ 7+ days</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
