"use client";

import { useState } from "react";
import { Card } from "@/frontend/components/ui/Card";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/Button";
import { emitNudge } from "@/lib/mentorBus";

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
      const data = await res.json();
      setResult(data);
      if (data.score >= 70) emitNudge("quiz_pass");
      if (data.detour) emitNudge("detour_splice");
      onSubmitted?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Practice quiz</h3>
        <Badge tone="default">Unlimited retakes</Badge>
      </div>

      {!questions && (
        <div>
          <p className="mb-4 text-sm text-muted">Low-stakes self-check - take it as many times as you like.</p>
          <Button size="sm" disabled={loading} onClick={start}>{loading ? "Preparing..." : "Start practice quiz"}</Button>
        </div>
      )}

      {questions && !result && (
        <div className="space-y-4">
          {questions.map((q, qi) => (
            <div key={q.id}>
              <p className="mb-2 text-sm font-medium">{qi + 1}. {q.question}</p>
              <div className="space-y-1.5">
                {q.options.map((opt, oi) => (
                  <label
                    key={oi}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                      answers[q.id] === oi ? "border-accent bg-accent/10" : "border-border bg-surface-2"
                    }`}
                  >
                    <input type="radio" name={q.id} checked={answers[q.id] === oi} onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <Button size="sm" disabled={loading || Object.keys(answers).length < questions.length} onClick={submit}>
            {loading ? "Scoring..." : "Submit"}
          </Button>
        </div>
      )}

      {result && (
        <div>
          <p className="mb-3 text-2xl font-semibold text-accent">{result.score}%</p>
          <div className="mb-4 space-y-2">
            {result.explanations.map((e, i) => (
              <p key={e.id} className={`text-xs ${e.selectedIndex === e.correctIndex ? "text-success" : "text-danger"}`}>
                Q{i + 1}: {e.selectedIndex === e.correctIndex ? "Correct" : "Missed"} — {e.explanation}
              </p>
            ))}
          </div>
          <Button size="sm" variant="secondary" disabled={loading} onClick={start}>Try again</Button>
        </div>
      )}
    </Card>
  );
}
