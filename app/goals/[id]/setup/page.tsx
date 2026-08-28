"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Nav } from "@/frontend/components/layout/Nav";
import { Card } from "@/frontend/components/ui/Card";
import { Button } from "@/frontend/components/ui/Button";
import { ChatThread, type ChatBubble } from "@/frontend/components/chat/ChatThread";
import { IconSparkles, IconArrowRight, IconShieldCheck, IconCheck, IconBolt, IconCoin, IconTarget } from "@tabler/icons-react";

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
  const [plannerMode, setPlannerMode] = useState<"fastest" | "cheapest" | "most_rigorous">("fastest");
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
    loadGoal();
  }, [loadGoal]);

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
  }, [goal?.status, historyChecked, id]);

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
      setError(err instanceof Error ? err.message : "Something went wrong in intake");
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
      setError(err instanceof Error ? err.message : "Something went wrong generating questions");
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
      setError(err instanceof Error ? err.message : "Something went wrong submitting answers");
    } finally {
      setDiagLoading(false);
    }
  }

  async function generatePath() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/goals/${id}/path/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plannerMode }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      router.push(`/goals/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong generating path");
      setGenerating(false);
    }
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-[#070913] text-white">
        <Nav />
        <main className="mx-auto max-w-2xl px-4 py-20 text-center text-slate-400">
          <div className="flex items-center justify-center gap-2 text-purple-400">
            <span className="h-3 w-3 rounded-full bg-purple-400 animate-ping" />
            <span>Loading Goal Setup...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070913] text-white">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        
        {/* Header */}
        <div className="mb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-400">
            INTAKE & CALIBRATION
          </span>
          <h1 className="mt-1 text-2xl font-black text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
            {goal.goalText}
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Complete calibration so the recommendation engine can calculate your exact skill gap roadmap.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-500/40 bg-red-950/60 p-4 text-xs font-bold text-red-300">
            {error}
          </div>
        )}

        {/* STEP A: Intake Chat */}
        {goal.status === "intake" && (
          <div className="overflow-hidden rounded-lg border-2 border-purple-500/30 shadow-[0_0_35px_rgba(139,92,246,0.25)] backdrop-blur-2xl">
            <div className="border-b border-purple-500/20 bg-[#0c1026] px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <IconSparkles className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="text-xs font-black text-white">AI INTAKE DIALOGUE</div>
                  <div className="text-[10px] text-purple-300/70">Answering these prompts identifies your target skills</div>
                </div>
              </div>
            </div>
            <div className="h-[480px]">
              <ChatThread
                messages={messages}
                onSend={(t) => sendIntake(t)}
                loading={chatLoading}
                placeholder="Type your reply..."
              />
            </div>
          </div>
        )}

        {/* STEP B: Beginner Check */}
        {goal.status === "beginner_check" && (
          <Card className="p-8 text-center">
            <IconShieldCheck className="h-12 w-12 text-purple-400 mx-auto mb-3" />
            <h2 className="text-xl font-black text-white">Declare Your Starting Proficiency</h2>
            <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
              Are you starting from absolute scratch in this domain, or would you like to take a diagnostic assessment to test out of foundational prerequisites?
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Button
                variant="secondary"
                disabled={beginnerLoading}
                onClick={() => submitBeginner(true)}
                size="lg"
              >
                I am starting from scratch
              </Button>
              <Button
                disabled={beginnerLoading}
                onClick={() => submitBeginner(false)}
                size="lg"
              >
                Test my current level (Diagnostic)
              </Button>
            </div>
          </Card>
        )}

        {/* STEP C: Diagnostic Quiz */}
        {goal.status === "diagnostic" && (
          <Card className="p-6 sm:p-8">
            {!diagQuestions ? (
              <div className="text-center py-6">
                <IconSparkles className="h-10 w-10 text-cyan-400 mx-auto mb-3" />
                <h2 className="text-xl font-black text-white">Diagnostic Assessment</h2>
                <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto mb-6">
                  A dynamic assessment targeting domain prerequisites with 2PL-IRT ability estimation to pinpoint your skill baseline.
                </p>
                <Button disabled={diagLoading} onClick={startDiagnostic} size="lg">
                  {diagLoading ? "Generating Questions..." : "Begin Diagnostic Assessment"}
                </Button>
              </div>
            ) : diagScore !== null ? (
              <div className="text-center py-6">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-700 to-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.5)] mb-3">
                  <span className="text-3xl font-black text-white">{diagScore}%</span>
                </div>
                <h2 className="text-xl font-black text-white">Starting Mastery Recorded</h2>
                <p className="mt-1 text-xs text-slate-400 mb-6">
                  Your baseline proficiency has been calibrated. Ready to generate your path.
                </p>
                <Button onClick={loadGoal} size="lg">
                  <span>Continue to Roadmap</span>
                  <IconArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border-b border-purple-500/20 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Diagnostic Assessment</h3>
                    <p className="text-[11px] text-slate-400">Answer all questions to calibrate starting skill vector</p>
                  </div>
                  <span className="rounded-sm bg-purple-950 border border-purple-500/40 px-3 py-1 text-xs font-bold text-purple-300">
                    {Object.keys(diagAnswers).length} / {diagQuestions.length} Answered
                  </span>
                </div>

                {diagQuestions.map((q, qi) => (
                  <div key={q.id} className="rounded-md border border-purple-500/20 bg-[#080b1a]/90 p-4">
                    <p className="mb-3 text-xs font-bold text-slate-200">
                      <span className="text-purple-400 mr-1.5">{qi + 1}.</span> {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => {
                        const selected = diagAnswers[q.id] === oi;
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
                              onChange={() => setDiagAnswers((a) => ({ ...a, [q.id]: oi }))}
                              className="accent-purple-500"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="pt-4 flex justify-end">
                  <Button
                    disabled={diagLoading || Object.keys(diagAnswers).length < diagQuestions.length}
                    onClick={submitDiagnostic}
                    size="lg"
                  >
                    <span>{diagLoading ? "Evaluating..." : "Submit Answers"}</span>
                    <IconArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* STEP D: Ready to Forge Path */}
        {goal.status === "ready" && (
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="text-center">
              <IconSparkles className="h-10 w-10 text-purple-400 mx-auto mb-3" />
              <h2 className="text-xl font-black text-white">Choose Planning Priority</h2>
              <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
                Our A* path search will optimize the sequencing of modules and resources based on your chosen focus.
              </p>
            </div>

            {/* 3-Way Segmented Planner Priority */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  id: "fastest" as const,
                  title: "⚡ Fastest",
                  desc: "Minimizes time to reach your goal milestone",
                },
                {
                  id: "cheapest" as const,
                  title: "💡 Cheapest",
                  desc: "Prioritizes free & high-value open resources",
                },
                {
                  id: "most_rigorous" as const,
                  title: "🎯 Rigorous",
                  desc: "Gradual difficulty jumps & deep prerequisites",
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPlannerMode(opt.id)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    plannerMode === opt.id
                      ? "border-purple-400 bg-purple-950/60 shadow-[0_0_15px_rgba(168,85,247,0.4)] ring-1 ring-purple-400"
                      : "border-purple-500/20 bg-[#0c1026] hover:border-purple-500/40 hover:bg-[#121838]"
                  }`}
                >
                  <div className="text-sm font-bold text-white">{opt.title}</div>
                  <div className="mt-1 text-[11px] text-slate-400 leading-tight">{opt.desc}</div>
                </button>
              ))}
            </div>

            <div className="text-center pt-2">
              <Button disabled={generating} onClick={generatePath} size="lg" className="w-full sm:w-auto px-8">
                <span>{generating ? "Generating Roadmap..." : "Generate Learning Path"}</span>
                <IconArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

      </main>
    </div>
  );
}
