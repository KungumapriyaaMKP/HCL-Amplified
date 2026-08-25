"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Nav } from "@/components/layout/Nav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChatThread, type ChatBubble } from "@/components/chat/ChatThread";

type Goal = { id: string; status: string; domain: string; goalText: string };
type DiagQuestion = { id: string; skillId: string; question: string; options: string[] };

export default function GoalSetupPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [beginnerLoading, setBeginnerLoading] = useState(false);

  const [diagQuestions, setDiagQuestions] = useState<DiagQuestion[] | null>(null);
  const [diagAttemptId, setDiagAttemptId] = useState<string | null>(null);
  const [diagAnswers, setDiagAnswers] = useState<Record<string, number>>({});
  const [diagScore, setDiagScore] = useState<number | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyChecked, setHistoryChecked] = useState(false);

  const loadGoal = useCallback(async () => {
    const res = await fetch(`/api/goals/${id}`);
    const body = await res.json();
    if (res.ok) {
      setGoal(body.goal);
      if (body.path) router.replace(`/goals/${id}`);
    }
  }, [id, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    loadGoal();
  }, [loadGoal]);

  // On entering the intake step, first hydrate any prior chat history (e.g.
  // after a page refresh mid-conversation) before deciding whether to kick
  // off the model's opening question - otherwise a refresh would both lose
  // the visible history and trigger a redundant seed turn.
  useEffect(() => {
    if (goal?.status !== "intake" || historyChecked) return;
    (async () => {
      const res = await fetch(`/api/goals/${id}/intake`);
      const body = await res.json();
      const history: ChatBubble[] = res.ok ? body.messages : [];
      setHistoryChecked(true);
      if (history.length > 0) {
        setMessages(history);
      } else {
        sendIntake(null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal?.status, historyChecked]);

  async function sendIntake(message: string | null) {
    setChatLoading(true);
    if (message) setMessages((m) => [...m, { role: "user", content: message }]);
    try {
      const res = await fetch(`/api/goals/${id}/intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setMessages((m) => [...m, { role: "assistant", content: body.reply }]);
      if (body.done) await loadGoal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setChatLoading(false);
    }
  }

  async function submitBeginner(beginnerDeclared: boolean) {
    setBeginnerLoading(true);
    try {
      const res = await fetch(`/api/goals/${id}/beginner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beginnerDeclared }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await loadGoal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBeginnerLoading(false);
    }
  }

  async function startDiagnostic() {
    setDiagLoading(true);
    try {
      const res = await fetch(`/api/goals/${id}/diagnostic/generate`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setDiagAttemptId(body.attemptId);
      setDiagQuestions(body.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDiagLoading(false);
    }
  }

  async function submitDiagnostic() {
    if (!diagAttemptId || !diagQuestions) return;
    setDiagLoading(true);
    try {
      const answers = diagQuestions.map((q) => ({ id: q.id, selectedIndex: diagAnswers[q.id] ?? -1 }));
      const res = await fetch(`/api/goals/${id}/diagnostic/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: diagAttemptId, answers }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setDiagScore(body.score);
      await loadGoal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDiagLoading(false);
    }
  }

  async function generatePath() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/goals/${id}/path/generate`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      router.push(`/goals/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setGenerating(false);
    }
  }

  if (!goal) {
    return (
      <div>
        <Nav />
        <main className="mx-auto max-w-2xl px-4 py-10 text-center text-muted">Loading...</main>
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="mb-1 text-xl font-semibold">{goal.goalText}</h1>
        <p className="mb-6 text-sm text-muted">Let&apos;s finish setting this goal up.</p>
        {error && <p className="mb-4 text-sm text-danger">{error}</p>}

        {goal.status === "intake" && (
          <Card className="h-[480px] overflow-hidden">
            <ChatThread messages={messages} onSend={(t) => sendIntake(t)} loading={chatLoading} placeholder="Your answer..." />
          </Card>
        )}

        {goal.status === "beginner_check" && (
          <Card className="p-6 text-center">
            <p className="mb-6 text-sm">Are you a complete beginner in this domain?</p>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" disabled={beginnerLoading} onClick={() => submitBeginner(true)}>
                Yes, I&apos;m starting from scratch
              </Button>
              <Button disabled={beginnerLoading} onClick={() => submitBeginner(false)}>
                No, test my current level
              </Button>
            </div>
          </Card>
        )}

        {goal.status === "diagnostic" && (
          <Card className="p-6">
            {!diagQuestions ? (
              <div className="text-center">
                <p className="mb-4 text-sm text-muted">A quick calibration quiz to see what you already know.</p>
                <Button disabled={diagLoading} onClick={startDiagnostic}>
                  {diagLoading ? "Preparing..." : "Start diagnostic quiz"}
                </Button>
              </div>
            ) : diagScore !== null ? (
              <div className="text-center">
                <p className="mb-2 text-3xl font-semibold text-accent">{diagScore}%</p>
                <p className="mb-4 text-sm text-muted">Your starting mastery has been recorded.</p>
                <Button onClick={loadGoal}>Continue</Button>
              </div>
            ) : (
              <div className="space-y-5">
                {diagQuestions.map((q, qi) => (
                  <div key={q.id}>
                    <p className="mb-2 text-sm font-medium">{qi + 1}. {q.question}</p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, oi) => (
                        <label
                          key={oi}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                            diagAnswers[q.id] === oi ? "border-accent bg-accent/10" : "border-border bg-surface-2"
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            checked={diagAnswers[q.id] === oi}
                            onChange={() => setDiagAnswers((a) => ({ ...a, [q.id]: oi }))}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <Button
                  disabled={diagLoading || Object.keys(diagAnswers).length < diagQuestions.length}
                  onClick={submitDiagnostic}
                >
                  {diagLoading ? "Scoring..." : "Submit answers"}
                </Button>
              </div>
            )}
          </Card>
        )}

        {goal.status === "ready" && (
          <Card className="p-6 text-center">
            <p className="mb-4 text-sm text-muted">
              We have what we need. Time to build your personalized roadmap - this runs the skill-gap analysis and
              recommendation engine and generates rationale for every step.
            </p>
            <Button disabled={generating} onClick={generatePath}>
              {generating ? "Generating your path..." : "Generate my learning path"}
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}
