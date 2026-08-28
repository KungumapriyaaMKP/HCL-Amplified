"use client";

import { useState } from "react";
import { Card } from "@/frontend/components/ui/Card";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/Button";
import { IconTarget, IconArrowRight, IconRefresh, IconCheck, IconX } from "@tabler/icons-react";

type Question = { id: string; question: string; options: string[] };
type Explanation = { id: string; correctIndex: number; selectedIndex: number | null; explanation: string };

export function PracticeQuiz({ moduleId, onSubmitted }: { moduleId: string; onSubmitted?: () => void }) {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; correctCount: number; total: number; explanations: Explanation[] } | null>(null);
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    setResult(null);
    setAnswers({});
    try {
      const res = await fetch(`/api/modules/${moduleId}/practice/generate`, { method: "POST" });
      const body = await res.json();
      setAttemptId(body.attemptId);
      setQuestions(body.questions);
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!attemptId || !questions) return;
    setLoading(true);
    try {
      const payload = questions.map((q) => ({ id: q.id, selectedIndex: answers[q.id] ?? -1 }));
      const res = await fetch(`/api/modules/${moduleId}/practice/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, answers: payload }),
      });
      setResult(await res.json());
      onSubmitted?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <IconTarget className="h-5 w-5 text-purple-400" />
          <span>PRACTICE ASSESSMENT</span>
        </h3>
        <Badge tone="cyan">UNLIMITED RETAKES</Badge>
      </div>

      {!questions && (
        <div>
          <p className="mb-5 text-xs text-slate-400 leading-relaxed">
            Low-stakes self-check assessment. Generate dynamic practice questions to build familiarity before the proctored test.
          </p>
          <Button size="md" disabled={loading} onClick={start}>
            <span>{loading ? "Generating Assessment..." : "Start Practice Assessment"}</span>
            <IconArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {questions && !result && (
        <div className="space-y-5">
          {questions.map((q, qi) => (
            <div key={q.id} className="rounded-md border border-purple-500/20 bg-[#080b1a]/90 p-4">
              <p className="mb-3 text-xs font-bold text-slate-200">
                <span className="text-purple-400 mr-1.5">{qi + 1}.</span> {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const selected = answers[q.id] === oi;
                  return (
                    <label
                      key={oi}
                      className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 text-xs font-medium transition-all ${
                        selected
                          ? "border-cyan-400 bg-cyan-950/60 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/40"
                          : "border-purple-500/20 bg-[#0c1026] text-slate-300 hover:border-purple-500/40 hover:bg-[#121838]"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={selected}
                        onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                        className="accent-purple-500"
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <Button size="md" disabled={loading || Object.keys(answers).length < questions.length} onClick={submit}>
              <span>{loading ? "Evaluating..." : "Submit Answers"}</span>
              <IconArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {result && (
        <div>
          <div className="mb-4 flex items-center gap-4">
            <span className="text-3xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              {result.score}%
            </span>
            <span className="text-xs font-bold text-slate-300">
              {result.correctCount} of {result.total} questions answered correctly
            </span>
          </div>

          <div className="mb-5 space-y-2">
            {result.explanations.map((e, i) => {
              const isCorrect = e.selectedIndex === e.correctIndex;
              return (
                <div
                  key={e.id}
                  className={`rounded-md border p-3 text-xs ${
                    isCorrect
                      ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-300"
                      : "border-red-500/30 bg-red-950/40 text-red-300"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {isCorrect ? <IconCheck className="h-3.5 w-3.5 text-emerald-400" /> : <IconX className="h-3.5 w-3.5 text-red-400" />}
                    <span>Question {i + 1} {isCorrect ? "Correct" : "Incorrect"}:</span>
                  </div>
                  <p className="text-slate-300 leading-snug">{e.explanation}</p>
                </div>
              );
            })}
          </div>

          <Button size="sm" variant="secondary" disabled={loading} onClick={start}>
            <IconRefresh className="h-3.5 w-3.5" />
            <span>Retake Practice Assessment</span>
          </Button>
        </div>
      )}
    </Card>
  );
}
