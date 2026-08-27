"use client";

import { useState, useEffect } from "react";
import { X, GraduationCap, Check, Lightbulb } from "lucide-react";
import {
  generateDiagnostic,
  submitDiagnostic,
  DiagnosticQuestion,
  DiagnosticSubmitResponse,
} from "@/lib/api/pathfinder";
import { NumberTicker } from "@/components/ui/NumberTicker";
import { Pill } from "@/components/ui/Pill";
import { Card } from "@/components/ui/Card";
import { FormattedContent } from "@/components/ui/FormattedContent";
import { emitNudge } from "@/lib/mentorBus";
import { SocraticModal } from "../socratic/SocraticModal";

interface DiagnosticQuizProps {
  goal: string;
  onClose: () => void;
  onMasteryUpdated: (mastery: Record<string, number>) => void;
}

export function DiagnosticQuiz({
  goal,
  onClose,
  onMasteryUpdated,
}: DiagnosticQuizProps) {
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [hasSparseError, setHasSparseError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<DiagnosticSubmitResponse | null>(null);

  // Socratic modal state
  const [socraticState, setSocraticState] = useState<{
    isOpen: boolean;
    skill_id: string;
    skill_name: string;
    chosen: string;
    question: string;
    correct: string;
  } | null>(null);

  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function fetchDiagnostic() {
      try {
        const res = await generateDiagnostic(goal, 4);
        if (ignore) return;
        if (!res.questions || res.questions.length < 2) {
          console.warn(
            `Diagnostic returned only ${res.questions?.length ?? 0} question(s) for goal "${goal}". Minimum 2 required.`
          );
          setHasSparseError(true);
          setQuestions([]);
        } else {
          setQuestions(res.questions);
          setHasSparseError(false);
          setCurrentIndex(0);
          setSelectedOptions({});
        }
      } catch (e) {
        if (!ignore) {
          console.error("Failed to load diagnostic:", e);
          setHasSparseError(true);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchDiagnostic();

    return () => {
      ignore = true;
    };
  }, [goal, reloadTrigger]);

  const handleRetry = () => {
    setLoading(true);
    setHasSparseError(false);
    setReloadTrigger((prev) => prev + 1);
  };

  const handleSelect = (optionIdx: number) => {
    setSelectedOptions((prev) => ({ ...prev, [currentIndex]: optionIdx }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const responsePayload = questions.map((q, idx) => {
        const sel = selectedOptions[idx] ?? -1;
        return {
          skill_id: q.skill_id,
          discrimination: q.discrimination,
          difficulty: q.difficulty,
          is_correct: sel === q.correct_index,
        };
      });

      const res = await submitDiagnostic(responsePayload, goal);
      setResults(res);
      emitNudge("quiz_pass");
      onMasteryUpdated(res.updated_mastery);
    } catch (e) {
      console.error("Failed to submit diagnostic:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentIndex];
  const isSelected = selectedOptions[currentIndex] !== undefined;
  const isLast = currentIndex === questions.length - 1;
  const allAnswered = questions.length > 0 && questions.every((_, idx) => selectedOptions[idx] !== undefined);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-canvas border border-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              IRT Diagnostic Engine
            </span>
            <h2 className="text-lg font-bold text-ink">Adaptive Skill Calibration</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink text-xl leading-none cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="text-sm font-semibold text-ink animate-pulse">
              Generating scenario probes for top fan-out skills...
            </div>
            <p className="text-xs text-muted">Calculating 2PL-IRT item parameters</p>
          </div>
        ) : hasSparseError ? (
          <div className="py-10 text-center space-y-4">
            <div className="text-sm font-semibold text-ink">
              Couldn&apos;t load the full quiz
            </div>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Received an incomplete question set from the diagnostic generator. Please retry to generate a full 4-question adaptive assessment.
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="bg-ink text-canvas font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-ink/90 transition-all cursor-pointer shadow-xs"
            >
              Retry Quiz Generation
            </button>
          </div>
        ) : results ? (
          /* Results View */
          <div className="space-y-6 py-2">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-full text-emerald-600 dark:text-emerald-400">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-ink">Diagnostic Complete</h3>
              <FormattedContent
                text="Your latent ability parameter \(\theta\) has been updated via 2PL MLE."
                className="text-xs text-muted"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-surface text-center">
                <div className="text-xs text-muted">
                  <FormattedContent text="Latent Ability (\(\theta\))" className="inline" />
                </div>
                <div className="text-2xl font-extrabold text-ink mt-1">
                  <NumberTicker value={results.theta} decimals={2} />
                </div>
                <span className="text-[10px] text-muted">SE: {results.standard_error.toFixed(2)}</span>
              </Card>

              <Card className="p-4 bg-surface text-center">
                <span className="text-xs text-muted">Estimated Readiness</span>
                <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                  <NumberTicker value={results.readiness_pct} suffix="%" />
                </div>
                <span className="text-[10px] text-muted">Target Role: {goal}</span>
              </Card>
            </div>

            {/* Per-skill mastery breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">
                Updated Skill Mastery
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {Object.entries(results.updated_mastery).map(([sid, lvl]) => (
                  <div
                    key={sid}
                    className="flex items-center justify-between p-2 rounded-lg bg-surface text-xs"
                  >
                    <span className="font-medium text-ink capitalize">
                      {sid.replace(/-/g, " ")}
                    </span>
                    <Pill variant={lvl >= 0.7 ? "mastered" : "active"}>
                      {Math.round(lvl * 100)}%
                    </Pill>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-ink text-canvas font-semibold text-xs py-3 rounded-xl hover:bg-ink/90 transition-all cursor-pointer"
            >
              Apply to Roadmap
            </button>
          </div>
        ) : currentQ ? (
          /* Question View */
          <div className="space-y-5">
            {/* Progress Bar */}
            <div className="flex items-center justify-between text-xs text-muted">
              <span>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <Pill variant="neutral">Skill: {currentQ.skill_name}</Pill>
            </div>

            <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-ink transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>

            {/* Question Text */}
            <div className="p-4 bg-surface rounded-xl border border-border">
              <FormattedContent
                text={currentQ.question}
                className="text-sm font-medium text-ink leading-relaxed"
              />
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, optIdx) => {
                const isChosen = selectedOptions[currentIndex] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelect(optIdx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                      isChosen
                        ? "border-ink bg-surface shadow-2xs font-semibold text-ink"
                        : "border-border hover:border-border-hover bg-canvas text-ink/80"
                    }`}
                  >
                    <FormattedContent text={opt} className="leading-relaxed flex-1 mr-2" />
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] shrink-0 ml-2 ${
                        isChosen ? "border-ink bg-ink text-canvas" : "border-border"
                      }`}
                    >
                      {isChosen ? <Check className="w-2.5 h-2.5" /> : String.fromCharCode(65 + optIdx)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Socratic Helper Button (if answered and wrong) */}
            {isSelected && selectedOptions[currentIndex] !== currentQ.correct_index && (
              <button
                type="button"
                onClick={() =>
                  setSocraticState({
                    isOpen: true,
                    skill_id: currentQ.skill_id,
                    skill_name: currentQ.skill_name,
                    chosen: currentQ.options[selectedOptions[currentIndex]],
                    question: currentQ.question,
                    correct: currentQ.explanation,
                  })
                }
                className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 hover:bg-amber-500/20 p-2.5 rounded-xl flex items-center justify-between w-full transition-colors cursor-pointer"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> Not sure? Consult Socratic Tutor
                </span>
                <span className="font-semibold">Explore Misconception →</span>
              </button>
            )}

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="text-xs text-muted hover:text-ink disabled:opacity-30 cursor-pointer"
              >
                ← Previous
              </button>

              {isLast ? (
                <button
                  disabled={!allAnswered || submitting}
                  onClick={handleSubmit}
                  className="bg-ink text-canvas font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-ink/90 disabled:opacity-50 transition-opacity cursor-pointer shadow-xs"
                >
                  {submitting ? "Fitting 2PL IRT Model..." : "Submit Diagnostic"}
                </button>
              ) : (
                <button
                  disabled={!isSelected}
                  onClick={handleNext}
                  className="bg-ink text-canvas font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-ink/90 disabled:opacity-50 transition-opacity cursor-pointer shadow-xs"
                >
                  Next Question →
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Socratic Tutor Modal */}
      {socraticState?.isOpen && (
        <SocraticModal
          skillId={socraticState.skill_id}
          skillName={socraticState.skill_name}
          chosenAnswer={socraticState.chosen}
          question={socraticState.question}
          correctAnswer={socraticState.correct}
          onClose={() => setSocraticState(null)}
        />
      )}
    </div>
  );
}
