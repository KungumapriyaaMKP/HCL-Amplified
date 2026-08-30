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
  IconDeviceLaptop,
  IconUserCheck,
  IconLock,
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
      <div className="relative rounded-3xl border border-purple-100/90 bg-white p-8 sm:p-12 shadow-2xl shadow-purple-500/5 text-slate-900 overflow-hidden">
        {/* Decorative Corner Dot Matrices */}
        <div className="absolute top-6 left-6 pointer-events-none opacity-30 select-none">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="#818CF8">
            <circle cx="4" cy="4" r="1.5" /><circle cx="16" cy="4" r="1.5" /><circle cx="28" cy="4" r="1.5" /><circle cx="40" cy="4" r="1.5" />
            <circle cx="4" cy="16" r="1.5" /><circle cx="16" cy="16" r="1.5" /><circle cx="28" cy="16" r="1.5" /><circle cx="40" cy="16" r="1.5" />
            <circle cx="4" cy="28" r="1.5" /><circle cx="16" cy="28" r="1.5" /><circle cx="28" cy="28" r="1.5" /><circle cx="40" cy="28" r="1.5" />
            <circle cx="4" cy="40" r="1.5" /><circle cx="16" cy="40" r="1.5" /><circle cx="28" cy="40" r="1.5" /><circle cx="40" cy="40" r="1.5" />
          </svg>
        </div>

        <div className="absolute bottom-6 right-6 pointer-events-none opacity-30 select-none">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="#818CF8">
            <circle cx="4" cy="4" r="1.5" /><circle cx="16" cy="4" r="1.5" /><circle cx="28" cy="4" r="1.5" /><circle cx="40" cy="4" r="1.5" />
            <circle cx="4" cy="16" r="1.5" /><circle cx="16" cy="16" r="1.5" /><circle cx="28" cy="16" r="1.5" /><circle cx="40" cy="16" r="1.5" />
            <circle cx="4" cy="28" r="1.5" /><circle cx="16" cy="28" r="1.5" /><circle cx="28" cy="28" r="1.5" /><circle cx="40" cy="28" r="1.5" />
            <circle cx="4" cy="40" r="1.5" /><circle cx="16" cy="40" r="1.5" /><circle cx="28" cy="40" r="1.5" /><circle cx="40" cy="40" r="1.5" />
          </svg>
        </div>

        {/* Decorative Ambient Corner Geometry */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full border border-purple-100/60 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full border border-purple-100/60 pointer-events-none" />

        {/* Top Header Section with 3D Illustration */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          {/* Left Column Text */}
          <div className="space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-100/70 border border-purple-200/80 text-purple-600 text-[11px] font-extrabold uppercase tracking-widest">
              <IconShieldCheck className="h-4 w-4 text-purple-600" />
              <span>OFFICIAL EVALUATION</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-[#1E1B4B] tracking-tight pt-1">
              Proctored Assessment: {skillName}
            </h1>

            {/* Gradient accent line */}
            <div className="h-1 w-14 bg-gradient-to-r from-purple-600 to-indigo-400 rounded-full my-2" />

            <p className="text-sm text-slate-500 leading-relaxed pt-1">
              This is a secure, proctored assessment designed to evaluate your {skillName} skills under real-world conditions.
            </p>
          </div>

          {/* Right Column: 3D Database & Shield Illustration */}
          <div className="shrink-0 flex items-center justify-center self-center md:self-auto">
            <svg width="220" height="175" viewBox="0 0 220 175" fill="none" className="select-none overflow-visible">
              <defs>
                <filter id="proc3dShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#7C3AED" floodOpacity="0.16" />
                </filter>

                <linearGradient id="cylinderGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E9D5FF" />
                  <stop offset="100%" stopColor="#DDD6FE" />
                </linearGradient>

                <linearGradient id="cylinderGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#DDD6FE" />
                  <stop offset="100%" stopColor="#C4B5FD" />
                </linearGradient>

                <linearGradient id="shield3dGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A78BFA" />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#6D28D9" />
                </linearGradient>
              </defs>

              {/* Pedestal Shadow */}
              <ellipse cx="105" cy="142" rx="72" ry="16" fill="#EDE9FE" opacity="0.65" />

              {/* Background Document / SQL Sheet */}
              <g transform="translate(108, 20)">
                <rect x="0" y="0" width="72" height="92" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                <text x="12" y="24" fill="#1E1B4B" fontSize="13" fontWeight="900">
                  {skillName || "SQL"}
                </text>
                <circle cx="14" cy="40" r="2.5" fill="#C4B5FD" />
                <rect x="22" y="38" width="38" height="4" rx="2" fill="#F1F5F9" />
                <circle cx="14" cy="52" r="2.5" fill="#C4B5FD" />
                <rect x="22" y="50" width="28" height="4" rx="2" fill="#F1F5F9" />
                <circle cx="14" cy="64" r="2.5" fill="#C4B5FD" />
                <rect x="22" y="62" width="34" height="4" rx="2" fill="#F1F5F9" />
              </g>

              {/* Sparkle Stars */}
              <path d="M 38 42 Q 41 42 41 39 Q 41 42 44 42 Q 41 42 41 45 Q 41 42 38 42 Z" fill="#C4B5FD" />
              <path d="M 194 62 Q 197 62 197 59 Q 197 62 200 62 Q 197 62 197 65 Q 197 62 194 62 Z" fill="#A78BFA" />

              {/* 3D Database Cylinders Stack */}
              <g filter="url(#proc3dShadow)">
                {/* Bottom Cylinder */}
                <path d="M 60 102 C 60 110 80 116 105 116 C 130 116 150 110 150 102 L 150 122 C 150 130 130 136 105 136 C 80 136 60 130 60 122 Z" fill="url(#cylinderGrad2)" />
                <ellipse cx="105" cy="102" rx="45" ry="14" fill="url(#cylinderGrad1)" />

                {/* Middle Cylinder */}
                <path d="M 60 72 C 60 80 80 86 105 86 C 130 86 150 80 150 72 L 150 92 C 150 100 130 106 105 106 C 80 106 60 100 60 92 Z" fill="url(#cylinderGrad2)" />
                <ellipse cx="105" cy="72" rx="45" ry="14" fill="url(#cylinderGrad1)" />

                {/* Top Cylinder */}
                <path d="M 60 42 C 60 50 80 56 105 56 C 130 56 150 50 150 42 L 150 62 C 150 70 130 76 105 76 C 80 76 60 70 60 62 Z" fill="url(#cylinderGrad2)" />
                <ellipse cx="105" cy="42" rx="45" ry="14" fill="#F3E8FF" />
              </g>

              {/* 3D Glowing Security Shield in Foreground */}
              <g transform="translate(126, 80)" filter="url(#proc3dShadow)">
                <path
                  d="M 28 4 C 44 4 52 14 52 28 C 52 46 28 58 28 58 C 28 58 4 46 4 28 C 4 14 12 4 28 4 Z"
                  fill="url(#shield3dGrad)"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                />
                <path
                  d="M 28 8 C 40 8 46 16 46 28 C 46 42 28 52 28 52 C 28 52 10 42 10 28 C 10 16 16 8 28 8 Z"
                  fill="#FFFFFF"
                  opacity="0.22"
                />
                <path
                  d="M 19 28 L 25 34 L 37 20"
                  stroke="#FFFFFF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          </div>
        </div>

        {/* Middle Examination Protocols Card */}
        <div className="my-8 rounded-2xl border border-purple-100/90 bg-[#FAF9FF] p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-purple-100/80 border border-purple-200/80 flex items-center justify-center text-purple-600">
              <IconShieldCheck className="h-4 w-4 text-purple-600" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#1E1B4B]">
              EXAMINATION PROTOCOLS
            </h3>
          </div>

          <div className="divide-y divide-purple-100/70 pt-1">
            {/* Protocol 1 */}
            <div className="flex items-center gap-4 py-3">
              <div className="h-8 w-8 rounded-full bg-purple-100/60 flex items-center justify-center text-purple-600 shrink-0">
                <IconClock className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Single attempt trial, timed countdown (10 minutes).
              </p>
            </div>

            {/* Protocol 2 */}
            <div className="flex items-center gap-4 py-3">
              <div className="h-8 w-8 rounded-full bg-purple-100/60 flex items-center justify-center text-purple-600 shrink-0">
                <IconDeviceLaptop className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Executes in full-screen mode; window blur or tab switching is logged by telemetric flags.
              </p>
            </div>

            {/* Protocol 3 */}
            <div className="flex items-center gap-4 py-3">
              <div className="h-8 w-8 rounded-full bg-purple-100/60 flex items-center justify-center text-purple-600 shrink-0">
                <IconUserCheck className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Webcam biometric presence check actively ensures identity integrity.
              </p>
            </div>

            {/* Protocol 4 */}
            <div className="flex items-center gap-4 py-3">
              <div className="h-8 w-8 rounded-full bg-purple-100/60 flex items-center justify-center text-purple-600 shrink-0">
                <IconLock className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Completing this assessment calculates official skill mastery and unlocks subsequent branch nodes.
              </p>
            </div>
          </div>
        </div>

        {startError && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700 flex items-center gap-2">
            <IconAlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{startError}</span>
          </div>
        )}

        {/* Bottom Actions Row: Fullscreen Button & Estimated Time Card */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          {/* Primary Action Button */}
          <button
            type="button"
            onClick={begin}
            className="flex-1 inline-flex items-center justify-between px-7 py-4 rounded-2xl bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] text-white text-sm font-bold shadow-lg shadow-purple-500/25 hover:opacity-95 hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <IconShieldCheck className="h-4 w-4" />
              </div>
              <span>Enter Fullscreen Assessment</span>
            </div>
            <IconArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Estimated Time Badge */}
          <div className="rounded-2xl border border-purple-100 bg-[#FAF9FF] px-6 py-3.5 flex items-center gap-3.5 shrink-0 shadow-xs">
            <div className="h-10 w-10 rounded-full bg-purple-100/80 flex items-center justify-center text-purple-600">
              <IconClock className="h-5 w-5 text-[#6366F1]" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">
                Estimated Time
              </span>
              <span className="text-sm font-black text-[#6366F1] block">
                10 Minutes
              </span>
            </div>
          </div>
        </div>
      </div>
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
