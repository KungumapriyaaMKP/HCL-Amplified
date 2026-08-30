"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppSidebar } from "@/frontend/components/layout/AppSidebar";
import { Button } from "@/frontend/components/ui/Button";
import { PencilLoader } from "@/components/ui/loader-1";
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
import { SetupStepperHeader, type SetupStep } from "@/components/ui/setup-stepper-header";
import { Target3DIllustration } from "@/components/ui/target-3d-illustration";
import { type ChatBubble } from "@/frontend/components/chat/ChatThread";
import {
  IconSparkles,
  IconArrowRight,
  IconCompass,
  IconActivity,
  IconBolt,
  IconCoin,
  IconTarget,
} from "@tabler/icons-react";

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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
    if (goal?.status === "ready" && !generating) {
      generatePath();
    }
  }, [goal?.status]);

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
      if (!res.ok) throw new Error(body.error || "Intake step failed");
      if (body.messages && Array.isArray(body.messages) && body.messages.length > 0) {
        setMessages(body.messages);
      } else if (body.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: body.reply }]);
      }
      if (body.done) {
        await loadGoal();
      }
    } catch (e: any) {
      setError(e.message);
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
    setError(null);
    try {
      const res = await fetch(`/api/goals/${id}/diagnostic/generate`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to generate diagnostic");
      setDiagQuestions(body.questions);
      setDiagAttemptId(body.attemptId);
      setDiagAnswers({});
      setCurrentQuestionIndex(0);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDiagLoading(false);
    }
  }

  async function submitDiagnostic() {
    if (!diagAttemptId || !diagQuestions) return;
    setDiagLoading(true);
    setError(null);
    try {
      const answers = diagQuestions.map((q) => ({
        id: q.id,
        selectedIndex: diagAnswers[q.id] ?? 0,
      }));
      const res = await fetch(`/api/goals/${id}/diagnostic/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: diagAttemptId, answers }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to score diagnostic");
      setDiagScore(body.score ?? body.overallScore);
      setGoal((g) => (g ? { ...g, status: "ready" } : g));
      await loadGoal();
    } catch (e: any) {
      setError(e.message);
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
      if (!res.ok) throw new Error(body.error || "Failed to generate path");
      router.replace(`/goals/${id}`);
    } catch (e: any) {
      setError(e.message);
      setGenerating(false);
    }
  }

  if (!goal) {
    return (
      <div className="flex min-h-screen bg-[#FAFBFD] text-slate-900 font-sans">
        <AppSidebar displayName="Yuvi" level={1} levelTitle="Newcomer" />
        <div className="flex-1 flex flex-col min-w-0 items-center justify-center min-h-screen bg-[#FAFBFD]">
          <PencilLoader size={140} label="Loading Goal Setup..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#FAFBFD] text-slate-900 font-sans">
      {/* 1. Left Sidebar Navigation */}
      <AppSidebar
        displayName="Yuvi"
        level={1}
        levelTitle="Newcomer"
      />

      {/* 2. Main Still Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-screen max-h-screen overflow-hidden">
        <main className="w-full h-full px-6 sm:px-10 py-3 sm:py-4 flex flex-col justify-start min-h-0 space-y-3 overflow-y-auto custom-scrollbar">
        
        {/* Top Stepper Progress Header */}
        <div className="shrink-0">
          <SetupStepperHeader currentStatus={goal.status as SetupStep} />
        </div>

        {/* Hero Header Section with 3D Illustration Overlay */}
        <div className="shrink-0 flex items-center justify-between gap-6 pt-0 pb-0 relative z-10">
          <div className="space-y-0.5 max-w-xl">
            {/* Pill Eyebrow Badge */}
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-100/70 text-[#7C3AED]">
              INTAKE & CALIBRATION
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {goal.goalText.toLowerCase().includes("web") ? (
                <>
                  <span>I want to master </span>
                  <span className="font-black bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] bg-clip-text text-transparent">
                    Web Dev
                  </span>
                </>
              ) : (
                goal.goalText
              )}
            </h1>

            <p className="text-xs text-slate-500 font-normal max-w-md">
              Complete calibration so the recommendation engine can calculate your exact skill gap roadmap.
            </p>
          </div>

          {/* 3D Target Illustration with Layered Overlay */}
          <div className="hidden sm:block shrink-0 relative -mb-6 z-20 pointer-events-none scale-90">
            <Target3DIllustration />
          </div>
        </div>

        {error && (
          <div className="shrink-0 rounded-md border border-red-200 bg-red-50 p-2.5 text-xs font-bold text-red-700 shadow-2xs">
            {error}
          </div>
        )}

        {/* STEP A: Intake Chat (Animated AI Chat) */}
        {goal.status === "intake" && (
          <div className="flex-1 flex flex-col overflow-hidden rounded-none border border-slate-200 bg-white shadow-xs min-h-[460px]">
            <AnimatedAIChat
              title="How can I help with your learning goal?"
              subtitle="Our AI mentor is calibrating your skill vector. Type your reply below."
              messages={messages}
              onSendMessage={(t) => sendIntake(t)}
              loading={chatLoading}
              className="flex-1 min-h-0"
            />
          </div>
        )}

        {/* STEP B: Beginner Check */}
        {goal.status === "beginner_check" && (
          <div className="rounded-md border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-sm space-y-4 max-w-3xl mx-auto w-full my-auto">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Declare Your Starting Proficiency
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
                Are you starting from absolute scratch in this domain, or would you like to take a diagnostic assessment to test out of foundational prerequisites?
              </p>
            </div>

            {/* Interactive Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-2xl mx-auto pt-2">
              {/* Card 1: Starting from Scratch */}
              <button
                type="button"
                disabled={beginnerLoading}
                onClick={() => submitBeginner(true)}
                className="flex items-center justify-between p-4 rounded-md border border-slate-200 bg-white hover:border-purple-300 hover:shadow-xs transition-all group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-purple-50 text-[#7C3AED] group-hover:bg-purple-100 transition-colors">
                    <IconCompass className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-slate-800">
                    I am starting from scratch
                  </span>
                </div>
                <IconArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#7C3AED] group-hover:translate-x-1 transition-all shrink-0" />
              </button>

              {/* Card 2: Diagnostic Assessment (Primary Highlight) */}
              <button
                type="button"
                disabled={beginnerLoading}
                onClick={() => submitBeginner(false)}
                className="flex items-center justify-between p-4 rounded-md bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white shadow-md shadow-purple-500/20 hover:opacity-95 transition-all group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/20 text-white backdrop-blur-xs">
                    <IconActivity className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-white">
                    Test my current level (Diagnostic)
                  </span>
                </div>
                <IconArrowRight className="h-4 w-4 text-white group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            </div>
          </div>
        )}

        {/* STEP C: Diagnostic Assessment */}
        {goal.status === "diagnostic" && (
          <div className="rounded-md border border-slate-200 bg-white p-5 sm:p-7 text-center shadow-sm relative overflow-hidden max-w-3xl mx-auto w-full my-auto">
            {/* Ambient Background Wave SVG */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
              viewBox="0 0 800 300"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M-50 240 C150 160 250 280 450 200 C650 140 750 260 850 180"
                stroke="#DDD6FE"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M-50 270 C150 190 250 310 450 230 C650 160 750 290 850 210"
                stroke="#EDE9FE"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>

            {!diagQuestions ? (
              <div className="relative z-10 text-center py-4 space-y-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    Diagnostic Assessment
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    A dynamic assessment targeting domain prerequisites with 2PL-IRT ability estimation to pinpoint your skill baseline.
                  </p>
                </div>

                {/* Start Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={diagLoading}
                    onClick={startDiagnostic}
                    className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] text-white px-7 py-3 text-xs sm:text-sm font-bold shadow-md shadow-purple-500/20 hover:opacity-95 transition-all cursor-pointer"
                  >
                    <span>{diagLoading ? "Generating Questions..." : "Begin Diagnostic Assessment"}</span>
                    <IconArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : diagScore !== null ? (
              <div className="relative z-10 text-center py-4 space-y-3">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-md bg-gradient-to-tr from-[#6D28D9] to-[#06B6D4] text-white shadow-md">
                  <span className="text-2xl font-extrabold">{diagScore}%</span>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Starting Mastery Recorded</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Your baseline proficiency has been calibrated. Ready to generate your path.
                  </p>
                </div>
                <Button onClick={loadGoal} size="lg" className="rounded-md px-6">
                  <span>Continue to Roadmap</span>
                  <IconArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="relative z-10 space-y-4 text-left">
                {/* Header with Title and Progress */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                        Diagnostic Assessment
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Question {currentQuestionIndex + 1} of {diagQuestions.length}
                      </p>
                    </div>
                    <span className="rounded-md bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-xs font-bold text-[#7C3AED]">
                      {Object.keys(diagAnswers).length} / {diagQuestions.length} Answered
                    </span>
                  </div>

                  {/* Top Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] transition-all duration-300 rounded-full"
                      style={{
                        width: `${((currentQuestionIndex + 1) / diagQuestions.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Active Question Box */}
                {(() => {
                  const q = diagQuestions[currentQuestionIndex];
                  if (!q) return null;
                  return (
                    <div key={q.id} className="rounded-md border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        <span className="text-[#7C3AED] mr-1.5">{currentQuestionIndex + 1}.</span> {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => {
                          const selected = diagAnswers[q.id] === oi;
                          return (
                            <label
                              key={oi}
                              onClick={() => setDiagAnswers((a) => ({ ...a, [q.id]: oi }))}
                              className={`flex cursor-pointer items-center gap-2.5 rounded-md border p-2.5 text-xs sm:text-sm font-medium transition-all ${
                                selected
                                  ? "border-[#7C3AED] bg-purple-50 text-[#7C3AED] shadow-2xs ring-1 ring-purple-300"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-purple-200 hover:bg-purple-50/30"
                              }`}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                checked={selected}
                                onChange={() => setDiagAnswers((a) => ({ ...a, [q.id]: oi }))}
                                className="accent-[#7C3AED] h-3.5 w-3.5"
                              />
                              <span className="flex-1">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Navigation Controls: Previous / Next Question / Submit */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
                    className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    Previous
                  </button>

                  {currentQuestionIndex < diagQuestions.length - 1 ? (
                    <button
                      type="button"
                      disabled={diagAnswers[diagQuestions[currentQuestionIndex]?.id] === undefined}
                      onClick={() =>
                        setCurrentQuestionIndex((i) => Math.min(diagQuestions.length - 1, i + 1))
                      }
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] rounded-md shadow-sm hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                    >
                      <span>Next Question</span>
                      <IconArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={diagLoading || Object.keys(diagAnswers).length < diagQuestions.length}
                      onClick={submitDiagnostic}
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-md shadow-sm hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                    >
                      {diagLoading ? "Scoring..." : "Submit Assessment"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP D: Generating Roadmap Automatically */}
        {(goal.status === "ready" || generating) && (
          <div className="rounded-md border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-sm space-y-4 max-w-xl mx-auto w-full my-auto">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Synthesizing Your AI Learning Path
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Assembling your personalized skill graph roadmap and optimizing prerequisite order...
              </p>
            </div>

            <div className="pt-3 max-w-xs mx-auto">
              <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] rounded-full animate-pulse w-full" />
              </div>
            </div>
          </div>
        )}

        </main>
      </div>
    </div>
  );
}
