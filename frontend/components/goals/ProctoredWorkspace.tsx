"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/frontend/components/ui/Card";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/Button";
import { loadFaceModels, captureFace, faceDistance, MATCH_THRESHOLD } from "@/lib/faceMatch";
import {
  IconClock,
  IconAlertTriangle,
  IconArrowRight,
  IconCheck,
  IconAward,
  IconShieldCheck,
} from "@tabler/icons-react";

type Question = { id: string; question: string; options: string[] };
type Flag = { type: "tab_switch" | "blur" | "fullscreen_exit" | "identity_mismatch" | "no_face_detected"; at: number };

const FACE_CHECK_INTERVAL_MS = 30_000;

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
  const [faceStatus, setFaceStatus] = useState<"checking" | "enrolled" | "verified" | "mismatch" | "no_face" | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; reportText: string; xpAwarded?: number; badgesAwarded?: string[] } | null>(
    alreadyTaken ? { score: initialScore ?? 0, reportText: initialReport ?? "" } : null,
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const faceCheckTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const referenceDescriptorRef = useRef<number[] | null>(null);
  const submittedRef = useRef(false);

  const latestRef = useRef({ questions, answers, attemptId, flags, cameraActive });
  useEffect(() => {
    latestRef.current = { questions, answers, attemptId, flags, cameraActive };
  }, [questions, answers, attemptId, flags, cameraActive]);

  function flag(type: Flag["type"]) {
    if (phase !== "in_progress") return;
    setFlags((f) => [...f, { type, at: Date.now() }]);
  }

  async function checkFace(isInitial: boolean) {
    if (!videoRef.current) return;
    setFaceStatus("checking");
    try {
      const capture = await captureFace(videoRef.current);
      if (!capture) {
        setFaceStatus("no_face");
        if (!isInitial) flag("no_face_detected");
        return;
      }

      if (!referenceDescriptorRef.current) {
        await fetch("/api/profile/face", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ descriptor: capture.descriptor, photoDataUrl: capture.photoDataUrl }),
        }).catch(() => {});
        referenceDescriptorRef.current = capture.descriptor;
        setFaceStatus("enrolled");
        return;
      }

      const distance = faceDistance(capture.descriptor, referenceDescriptorRef.current);
      if (distance > MATCH_THRESHOLD) {
        setFaceStatus("mismatch");
        if (isInitial) setFlags((f) => [...f, { type: "identity_mismatch", at: Date.now() }]);
        else flag("identity_mismatch");
      } else {
        setFaceStatus("verified");
      }
    } catch {
      // Non-blocking face detection fallback
    }
  }

  useEffect(() => {
    if (phase !== "in_progress") return;

    const onVisibility = () => {
      if (document.hidden) flag("tab_switch");
    };
    const onBlur = () => flag("blur");
    const onFullscreen = () => {
      if (!document.fullscreenElement) flag("fullscreen_exit");
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFullscreen);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFullscreen);
    };
  }, [phase]);

  function cleanup() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (faceCheckTimerRef.current) clearInterval(faceCheckTimerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  async function begin() {
    setStartError(null);
    setPhase("loading");

    try {
      await loadFaceModels().catch(() => {});
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setCameraActive(true);

      const profileRes = await fetch("/api/profile");
      if (profileRes.ok) {
        const p = await profileRes.json();
        if (p.profile?.faceDescriptor) {
          referenceDescriptorRef.current = p.profile.faceDescriptor;
        }
      }

      let res = await fetch(`/api/modules/${moduleId}/proctored/start`, { method: "POST" });
      if (res.status === 404) {
        res = await fetch(`/api/modules/${moduleId}/proctored/generate`, { method: "POST" });
      }
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not generate questions");

      if (body.alreadyTaken) {
        setResult({ score: body.score ?? 0, reportText: body.reportText ?? "" });
        setPhase("done");
        return;
      }

      setAttemptId(body.attemptId);
      setQuestions(body.questions);
      setSecondsLeft(body.timeLimitSeconds || (body.timeLimitMinutes ? body.timeLimitMinutes * 60 : 600));

      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch {
        // Fullscreen non-critical
      }

      setPhase("in_progress");

      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
          checkFace(true);
        }
      }, 500);

      timerRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(timerRef.current!);
            submitAuto();
            return 0;
          }
          return s - 1;
        });
      }, 1000);

      faceCheckTimerRef.current = setInterval(() => {
        checkFace(false);
      }, FACE_CHECK_INTERVAL_MS);
    } catch (err) {
      cleanup();
      setPhase("intro");
      setStartError(err instanceof Error ? err.message : "Could not initialize proctored session");
    }
  }

  function submitAuto() {
    if (submittedRef.current) return;
    const { questions: qs, answers: ans, attemptId: aid, flags: flgs, cameraActive: cam } = latestRef.current;
    if (!aid || qs.length === 0) return;
    performSubmit(aid, qs, ans, flgs, cam);
  }

  async function submit() {
    if (submittedRef.current) return;
    if (!attemptId || questions.length === 0) return;
    performSubmit(attemptId, questions, answers, flags, cameraActive);
  }

  async function performSubmit(
    aid: string,
    qs: Question[],
    ans: Record<string, number>,
    flgs: Flag[],
    cam: boolean,
  ) {
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
      <Card className="p-8 text-center">
        <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-purple-700 via-fuchsia-600 to-cyan-500 shadow-[0_0_35px_rgba(168,85,247,0.6)] mb-4">
          <span className="text-3xl font-black text-white">{result.score}/100</span>
        </div>
        
        <h2 className="text-2xl font-black text-white">Proctored Assessment Complete</h2>
        
        <div className="my-5 max-w-lg mx-auto rounded-2xl border border-purple-500/20 bg-[#070918]/90 p-4 text-xs font-medium text-slate-300 leading-relaxed text-left">
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block mb-1">
            EVALUATION REPORT & SKILL MASTERY
          </span>
          {result.reportText}
        </div>

        {!!result.badgesAwarded?.length && (
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {result.badgesAwarded.map((b) => (
              <Badge key={b} tone="success" className="flex items-center gap-1 text-xs py-1 px-3">
                <IconAward className="h-3.5 w-3.5" />
                <span>{b} Earned</span>
              </Badge>
            ))}
          </div>
        )}

        <Button size="lg" onClick={() => router.push(`/goals/${goalId}`)}>
          <span>Return to Roadmap</span>
          <IconArrowRight className="h-4 w-4" />
        </Button>
      </Card>
    );
  }

  if (phase === "intro") {
    return (
      <Card className="p-8">
        <div className="mb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-400">
            OFFICIAL EVALUATION
          </span>
          <h1 className="mt-1 text-2xl font-black text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
            Proctored Assessment: {skillName}
          </h1>
        </div>

        <div className="my-6 rounded-2xl border border-purple-500/25 bg-[#070918]/80 p-5 space-y-3 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-bold text-purple-300">
            <IconShieldCheck className="h-5 w-5 text-purple-400" />
            <span>EXAMINATION PROTOCOLS:</span>
          </div>
          <ul className="list-inside list-disc space-y-2 text-slate-400 pl-2">
            <li>Single attempt trial, timed countdown (10 minutes).</li>
            <li>Executes in full-screen mode; window blur or tab switching is logged by telemetric flags.</li>
            <li>Webcam biometric presence check actively ensures identity integrity.</li>
            <li>Completing this assessment calculates official skill mastery and unlocks subsequent branch nodes.</li>
          </ul>
        </div>

        {startError && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-950/60 p-3 text-xs font-bold text-red-300">
            {startError}
          </div>
        )}

        <Button onClick={begin} size="lg" variant="primary">
          <span>Enter Fullscreen Assessment</span>
          <IconArrowRight className="h-4 w-4" />
        </Button>
      </Card>
    );
  }

  if (phase === "loading" || phase === "submitting") {
    return (
      <Card className="p-12 text-center">
        <div className="flex items-center justify-center gap-2 text-purple-400 text-sm font-bold">
          <span className="h-3 w-3 rounded-full bg-purple-400 animate-ping" />
          <span>{phase === "loading" ? "Initializing Biometrics & Assessment Environment..." : "AI Examiner Grading Responses..."}</span>
        </div>
      </Card>
    );
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="space-y-5">
      
      {/* Live Proctored HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-purple-500/30 bg-[#0c1026]/90 p-4 shadow-[0_0_25px_rgba(139,92,246,0.3)] backdrop-blur-xl">
        
        {/* Timer */}
        <div className="flex items-center gap-3">
          <IconClock className="h-6 w-6 text-purple-400" />
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">TIME REMAINING</div>
            <div className={`text-xl font-black tabular-nums ${secondsLeft < 60 ? "text-red-400 animate-pulse" : "text-amber-400"}`}>
              {minutes}:{seconds.toString().padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Biometrics & Flags */}
        <div className="flex items-center gap-3">
          {flags.length > 0 && (
            <Badge tone="danger" className="flex items-center gap-1">
              <IconAlertTriangle className="h-3.5 w-3.5" />
              <span>{flags.length} Flag(s) Logged</span>
            </Badge>
          )}

          {faceStatus && (
            <Badge tone={faceStatus === "verified" || faceStatus === "enrolled" ? "success" : faceStatus === "checking" ? "cyan" : "danger"}>
              {faceStatus === "checking" && "Scanning..."}
              {faceStatus === "enrolled" && "Face Enrolled"}
              {faceStatus === "verified" && "Identity Verified"}
              {faceStatus === "mismatch" && "Identity Warning"}
              {faceStatus === "no_face" && "No Face Detected"}
            </Badge>
          )}

          {/* Cyber Webcam Frame */}
          <div className="relative h-14 w-20 overflow-hidden rounded-xl border border-cyan-400/50 bg-black shadow-[0_0_12px_rgba(6,182,212,0.4)]">
            {cameraActive ? (
              <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-[9px] font-bold text-slate-500">NO CAM</div>
            )}
            <div className="pointer-events-none absolute inset-0 border border-cyan-400/30 rounded-xl" />
          </div>
        </div>

      </div>

      {/* Question Sheet */}
      <Card className="space-y-6 p-6 sm:p-8">
        <div className="border-b border-purple-500/20 pb-3 flex items-center justify-between">
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Assessment Questions</h2>
          <span className="rounded-full bg-purple-950 border border-purple-500/40 px-3 py-1 text-xs font-bold text-purple-300">
            {Object.keys(answers).length} / {questions.length} Answered
          </span>
        </div>

        {questions.map((q, qi) => (
          <div key={q.id} className="rounded-2xl border border-purple-500/20 bg-[#080b1a]/90 p-5">
            <p className="mb-3 text-xs font-bold text-slate-200">
              <span className="text-purple-400 mr-1.5">{qi + 1}.</span> {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const selected = answers[q.id] === oi;
                return (
                  <label
                    key={oi}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-xs font-medium transition-all ${
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

        <div className="flex justify-end pt-4">
          <Button
            size="lg"
            variant="primary"
            onClick={submit}
            disabled={Object.keys(answers).length < questions.length}
          >
            <span>Submit Official Assessment</span>
            <IconArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>

    </div>
  );
}
