"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Badge } from "@/frontend/components/ui/Card";
import { Button } from "@/frontend/components/ui/Button";

type Question = { id: string; question: string; options: string[] };
type Flag = { type: "tab_switch" | "blur" | "fullscreen_exit"; at: number };

type Phase = "intro" | "loading" | "in_progress" | "submitting" | "done";

export function ProctoredWorkspace({
  goalId,
  moduleId,
  skillName,
  alreadyTaken,
  initialScore,
  initialReport,
}: {
  goalId: string;
  moduleId: string;
  skillName: string;
  alreadyTaken: boolean;
  initialScore: number | null;
  initialReport: string | null;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(alreadyTaken ? "done" : "intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [result, setResult] = useState<{ score: number; reportText: string; xpAwarded?: number; badgesAwarded?: string[] } | null>(
    alreadyTaken ? { score: initialScore ?? 0, reportText: initialReport ?? "" } : null,
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittedRef = useRef(false);

  // The countdown timer is set up once inside begin() and its callback must
  // always submit with the LATEST answers/flags, not whatever they were at
  // that render - a plain closure over state would go stale. Keep a ref in
  // sync with the state that submit() actually needs.
  const latestRef = useRef({ questions, answers, attemptId, flags, cameraActive });
  useEffect(() => {
    latestRef.current = { questions, answers, attemptId, flags, cameraActive };
  }, [questions, answers, attemptId, flags, cameraActive]);

  function flag(type: Flag["type"]) {
    if (phase !== "in_progress") return;
    setFlags((f) => [...f, { type, at: Date.now() }]);
  }

  useEffect(() => {
    function onVisibility() {
      if (document.hidden) flag("tab_switch");
    }
    function onBlur() {
      flag("blur");
    }
    function onFullscreenChange() {
      if (!document.fullscreenElement) flag("fullscreen_exit");
    }
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function cleanup() {
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }

  useEffect(() => () => cleanup(), []);

  async function begin() {
    setPhase("loading");
    try {
      await document.documentElement.requestFullscreen?.().catch(() => {});
    } catch {}
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      setCameraActive(false);
    }

    const res = await fetch(`/api/modules/${moduleId}/proctored/start`, { method: "POST" });
    const body = await res.json();
    if (body.alreadyTaken) {
      cleanup();
      setResult({ score: body.score, reportText: body.reportText });
      setPhase("done");
      return;
    }

    setAttemptId(body.attemptId);
    setQuestions(body.questions);
    setSecondsLeft(body.timeLimitSeconds);
    setPhase("in_progress");

    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          submit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function submit() {
    const { questions: qs, answers: ans, attemptId: aid, flags: flgs, cameraActive: cam } = latestRef.current;
    if (submittedRef.current || !aid) return;
    submittedRef.current = true;
    setPhase("submitting");
    cleanup();

    const payload = qs.map((q) => ({ id: q.id, selectedIndex: ans[q.id] ?? -1 }));
    const res = await fetch(`/api/modules/${moduleId}/proctored/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId: aid, answers: payload, flags: flgs, webcamPresenceRatio: cam ? 1 : 0 }),
    });
    const body = await res.json();
    setResult(body);
    setPhase("done");
  }

  if (phase === "done" && result) {
    return (
      <Card className="p-6">
        <p className="mb-2 text-4xl font-semibold text-accent">{result.score}/100</p>
        <p className="mb-4 text-sm text-foreground/85">{result.reportText}</p>
        {!!result.badgesAwarded?.length && (
          <div className="mb-4 flex gap-2">
            {result.badgesAwarded.map((b) => <Badge key={b} tone="success">🏅 {b}</Badge>)}
          </div>
        )}
        <Button size="sm" onClick={() => router.push(`/goals/${goalId}`)}>Back to path</Button>
      </Card>
    );
  }

  if (phase === "intro") {
    return (
      <Card className="p-6">
        <h2 className="mb-2 text-lg font-semibold">Proctored test: {skillName}</h2>
        <ul className="mb-6 list-inside list-disc space-y-1 text-sm text-muted">
          <li>Single attempt, timed (10 minutes)</li>
          <li>Runs in fullscreen; switching tabs or losing focus is flagged</li>
          <li>Requests camera access for a live self-view (best-effort presence check, not identity verification)</li>
          <li>This score sets your official mastery for this skill</li>
        </ul>
        <Button onClick={begin}>Begin proctored test</Button>
      </Card>
    );
  }

  if (phase === "loading" || phase === "submitting") {
    return <Card className="p-6 text-center text-sm text-muted">{phase === "loading" ? "Preparing your test..." : "Scoring..."}</Card>;
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Badge tone={secondsLeft < 60 ? "danger" : "warning"} className="text-sm">
          ⏱ {minutes}:{seconds.toString().padStart(2, "0")}
        </Badge>
        <div className="flex items-center gap-2">
          {flags.length > 0 && <Badge tone="danger">{flags.length} flag(s)</Badge>}
          <div className="h-16 w-20 overflow-hidden rounded-lg border border-border bg-surface-2">
            {cameraActive ? (
              <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-[10px] text-muted">No camera</div>
            )}
          </div>
        </div>
      </div>

      <Card className="space-y-5 p-6">
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
        <Button onClick={submit} disabled={Object.keys(answers).length < questions.length}>
          Submit test
        </Button>
      </Card>
    </div>
  );
}
