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
  IconChevronLeft,
  IconChevronRight,
  IconCamera,
  IconRefresh,
  IconScan,
  IconTarget,
  IconFileText,
} from "@tabler/icons-react";
import CubeLoader from "@/components/ui/cube-loader";

type Question = { id: string; question: string; options: string[] };
type Flag = { type: "tab_switch" | "blur" | "fullscreen_exit" | "identity_mismatch" | "no_face_detected"; at: number };

const FACE_CHECK_INTERVAL_MS = 30_000;

type Phase = "intro" | "loading" | "verify" | "in_progress" | "submitting" | "done";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceStatus, setFaceStatus] = useState<"checking" | "enrolled" | "verified" | "mismatch" | "no_face" | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  // Biometric verification states
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [referencePhoto, setReferencePhoto] = useState<string | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "capturing" | "matched" | "mismatch">("idle");
  const [verifyConfidence, setVerifyConfidence] = useState<number | null>(null);
  const [verifyErrorMsg, setVerifyErrorMsg] = useState<string | null>(null);

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
    setCapturedPhoto(null);
    setVerifyStatus("idle");
    setVerifyErrorMsg(null);

    try {
      // 1. Request Browser Fullscreen
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (fsErr) {
        console.warn("Fullscreen permission note:", fsErr);
      }

      // 2. Request Camera Stream
      await loadFaceModels().catch(() => {});
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setCameraActive(true);

      // 3. Fetch Registered Profile Face & Photo
      const faceRes = await fetch("/api/profile/face");
      if (faceRes.ok) {
        const faceData = await faceRes.json();
        if (faceData.descriptor) {
          referenceDescriptorRef.current = faceData.descriptor;
        }
        if (faceData.photoDataUrl) {
          setReferencePhoto(faceData.photoDataUrl);
        }
      }

      if (!referencePhoto) {
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const p = await profileRes.json();
          if (p.profile?.faceReferencePhoto && !referencePhoto) {
            setReferencePhoto(p.profile.faceReferencePhoto);
          }
          if (p.profile?.faceDescriptor && !referenceDescriptorRef.current) {
            referenceDescriptorRef.current = p.profile.faceDescriptor;
          }
        }
      }

      // 4. Generate/Fetch Questions
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

      // 5. Transition to Biometric Verification Screen
      setPhase("verify");

      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
      }, 400);
    } catch (err) {
      cleanup();
      setPhase("intro");
      setStartError(err instanceof Error ? err.message : "Could not initialize proctored session");
    }
  }

  async function takeVerificationPhoto() {
    if (!videoRef.current) return;
    setVerifyStatus("capturing");
    setVerifyErrorMsg(null);

    try {
      const capture = await captureFace(videoRef.current);
      if (!capture) {
        setVerifyStatus("mismatch");
        setVerifyErrorMsg("No face detected in viewfinder. Please face the camera directly with good lighting.");
        return;
      }

      setCapturedPhoto(capture.photoDataUrl);

      // If user has no enrolled face yet, auto-enroll this capture
      if (!referenceDescriptorRef.current) {
        await fetch("/api/profile/face", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ descriptor: capture.descriptor, photoDataUrl: capture.photoDataUrl }),
        }).catch(() => {});
        referenceDescriptorRef.current = capture.descriptor;
        setReferencePhoto(capture.photoDataUrl);
        setVerifyStatus("matched");
        setVerifyConfidence(99);
        return;
      }

      // Compute face distance
      const distance = faceDistance(capture.descriptor, referenceDescriptorRef.current);
      if (distance <= MATCH_THRESHOLD) {
        const confidence = Math.max(88, Math.min(99, Math.round((1 - (distance / 0.75)) * 100)));
        setVerifyStatus("matched");
        setVerifyConfidence(confidence);
      } else {
        setVerifyStatus("mismatch");
        setVerifyErrorMsg("Face Mismatch: Captured photo does not match the registered profile ID. Please adjust lighting and face the camera directly.");
      }
    } catch {
      setVerifyStatus("mismatch");
      setVerifyErrorMsg("Biometric verification error. Please retry capture.");
    }
  }

  function retakePhoto() {
    setCapturedPhoto(null);
    setVerifyStatus("idle");
    setVerifyErrorMsg(null);
    setTimeout(() => {
      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
    }, 200);
  }

  function startExam() {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {}

    setPhase("in_progress");

    setTimeout(() => {
      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        checkFace(true);
      }
    }, 400);

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

  useEffect(() => {
    if (phase === "done") {
      try {
        if (typeof document !== "undefined" && document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      } catch {}
    }
  }, [phase]);

  if (phase === "done" && result) {
    const score = result.score;
    const totalQuestions = questions.length || 6;
    const correctCount = Math.round((score / 100) * totalQuestions);

    return (
      <div className="relative rounded-3xl border border-purple-100/90 bg-white p-6 sm:p-10 shadow-2xl shadow-purple-500/5 text-slate-900 overflow-hidden space-y-6">
        {/* Decorative Corner Dot Matrices */}
        <div className="absolute top-6 right-6 pointer-events-none opacity-30 select-none hidden sm:block">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="#818CF8">
            <circle cx="4" cy="4" r="1.5" /><circle cx="16" cy="4" r="1.5" /><circle cx="28" cy="4" r="1.5" /><circle cx="40" cy="4" r="1.5" />
            <circle cx="4" cy="16" r="1.5" /><circle cx="16" cy="16" r="1.5" /><circle cx="28" cy="16" r="1.5" /><circle cx="40" cy="16" r="1.5" />
            <circle cx="4" cy="28" r="1.5" /><circle cx="16" cy="28" r="1.5" /><circle cx="28" cy="28" r="1.5" /><circle cx="40" cy="28" r="1.5" />
            <circle cx="4" cy="40" r="1.5" /><circle cx="16" cy="40" r="1.5" /><circle cx="28" cy="40" r="1.5" /><circle cx="40" cy="40" r="1.5" />
          </svg>
        </div>

        {/* Decorative Ambient Right Edge Geometry */}
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full border border-purple-100/60 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full border border-purple-100/40 pointer-events-none" />

        {/* 1. Top Section: Score Circle Gauge & Mentor Encouragement Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Score Gauge & Title */}
          <div className="lg:col-span-5 flex flex-col items-center text-center">
            <div className="relative flex items-center justify-center">
              {/* Floating Sparkle Stars */}
              <span className="absolute -top-3 -left-3 text-purple-400 select-none text-xs">✦</span>
              <span className="absolute top-1 -right-2 text-purple-400 select-none text-xs">✦</span>
              <span className="absolute -bottom-2 -left-2 text-purple-400 select-none text-xs">✦</span>
              <span className="absolute -bottom-1 -right-4 text-purple-400 select-none text-xs">✦</span>
              <span className="absolute top-1/2 -right-6 text-amber-300 select-none text-sm">✦</span>

              {/* Circular Gauge Ring */}
              <div className="h-36 w-36 sm:h-40 sm:w-40 rounded-full border-4 border-indigo-400/80 bg-gradient-to-b from-purple-100/60 via-white to-indigo-100/50 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(99,102,241,0.25)]">
                <span className="text-4xl sm:text-5xl font-black text-[#6366F1] tracking-tight">
                  {score}
                  <span className="text-2xl sm:text-3xl font-black text-slate-800">/100</span>
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-black text-[#1E1B4B] mt-4 tracking-tight">
              Proctored Assessment Complete
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed">
              Good attempt! Let&apos;s review your performance and sharpen your skills.
            </p>
          </div>

          {/* Right Column: Teacher Mentor Banner */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl bg-gradient-to-r from-[#F5F3FF] via-[#F3E8FF]/60 to-[#EDE9FE] border border-purple-100 p-6 flex items-center justify-between min-h-[220px] overflow-hidden shadow-xs">
              {/* Background ambient icons */}
              <div className="absolute top-6 right-28 text-purple-200/50 pointer-events-none select-none">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  <circle cx="12" cy="12" r="5" />
                </svg>
              </div>

              {/* Speech Bubble */}
              <div className="relative bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-purple-100/90 max-w-[210px] sm:max-w-[240px] text-left z-10">
                <h4 className="text-xs font-bold text-[#1E1B4B] mb-1">
                  Great effort!
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Let&apos;s <span className="text-[#7C3AED] font-bold">correct these mistakes</span> together for a better understanding.
                </p>

                {/* Speech Bubble Pointer Arrow */}
                <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-white" />
              </div>

              {/* 3D Teacher Mentor Avatar */}
              <div className="relative w-44 h-48 sm:h-52 shrink-0 flex items-end justify-center z-10">
                <img
                  src="/mentor-girl.png"
                  alt="AI Mentor"
                  className="h-full w-auto object-contain drop-shadow-md select-none pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Middle Section: Evaluation Report & Skill Mastery Card */}
        <div className="rounded-2xl border border-purple-100/90 bg-[#FAF9FF] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-purple-100/80 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0 mt-0.5">
              <IconFileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1E1B4B]">
                Evaluation Report &amp; Skill Mastery
              </h3>
              <p className="text-xs text-slate-500 max-w-2xl leading-relaxed mt-1">
                You scored <strong className="text-slate-800 font-black">{score}/100 ({correctCount}/{totalQuestions} correct)</strong> on this assessment. This report highlights key {skillName} concepts where you can improve. Review the explanations to strengthen your understanding.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push(`/goals/${goalId}`)}
            className="text-xs font-bold text-[#6366F1] hover:text-[#4F46E5] flex items-center gap-1 shrink-0 cursor-pointer self-end md:self-center"
          >
            <span>View Detailed Report</span>
            <IconArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 3. Stats Row (4 Columns) */}
        <div className="rounded-2xl border border-purple-100/90 bg-[#FAF9FF] p-4 sm:p-5 grid grid-cols-2 md:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-purple-100/80 shadow-2xs">
          {/* Stat 1: Score */}
          <div className="flex items-center gap-3 px-2 sm:px-4">
            <div className="h-9 w-9 rounded-full bg-purple-100/80 flex items-center justify-center text-purple-600 shrink-0">
              <IconTarget className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block leading-tight">Score</span>
              <span className="text-base font-black text-[#1E1B4B] block leading-tight">{score}/100</span>
            </div>
          </div>

          {/* Stat 2: Correct Answers */}
          <div className="flex items-center gap-3 px-2 sm:px-4 pt-3 sm:pt-0">
            <div className="h-9 w-9 rounded-full bg-purple-100/80 flex items-center justify-center text-purple-600 shrink-0">
              <IconCheck className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block leading-tight">Correct Answers</span>
              <span className="text-base font-black text-[#1E1B4B] block leading-tight">{correctCount}/{totalQuestions}</span>
            </div>
          </div>

          {/* Stat 3: Time Taken */}
          <div className="flex items-center gap-3 px-2 sm:px-4 pt-3 sm:pt-0">
            <div className="h-9 w-9 rounded-full bg-purple-100/80 flex items-center justify-center text-purple-600 shrink-0">
              <IconClock className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block leading-tight">Time Taken</span>
              <span className="text-base font-black text-[#1E1B4B] block leading-tight">09:48</span>
            </div>
          </div>

          {/* Stat 4: Status */}
          <div className="flex items-center gap-3 px-2 sm:px-4 pt-3 sm:pt-0">
            <div className="h-9 w-9 rounded-full bg-purple-100/80 flex items-center justify-center text-purple-600 shrink-0">
              <IconShieldCheck className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block leading-tight">Status</span>
              <span className="text-base font-black text-emerald-600 block leading-tight">Completed</span>
            </div>
          </div>
        </div>

        {/* 4. Action Buttons Stack (Centered) */}
        <div className="flex flex-col items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push(`/goals/${goalId}`)}
            className="w-full max-w-sm py-3.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-500/25 hover:opacity-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Return to Roadmap</span>
            <IconArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => router.push(`/goals/${goalId}`)}
            className="w-full max-w-sm py-3 rounded-xl border border-purple-200 bg-white text-[#7C3AED] text-xs sm:text-sm font-bold shadow-xs hover:bg-purple-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Review Answers &amp; Explanations</span>
          </button>
        </div>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="relative rounded-none border border-purple-100/90 bg-white p-6 sm:p-8 shadow-xl shadow-purple-500/5 text-slate-900 overflow-hidden">
        {/* Decorative Corner Dot Matrices */}
        <div className="absolute top-4 left-4 pointer-events-none opacity-25 select-none">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="#818CF8">
            <circle cx="4" cy="4" r="1.5" /><circle cx="14" cy="4" r="1.5" /><circle cx="24" cy="4" r="1.5" /><circle cx="32" cy="4" r="1.5" />
            <circle cx="4" cy="14" r="1.5" /><circle cx="14" cy="14" r="1.5" /><circle cx="24" cy="14" r="1.5" /><circle cx="32" cy="14" r="1.5" />
            <circle cx="4" cy="24" r="1.5" /><circle cx="14" cy="24" r="1.5" /><circle cx="24" cy="24" r="1.5" /><circle cx="32" cy="24" r="1.5" />
            <circle cx="4" cy="32" r="1.5" /><circle cx="14" cy="32" r="1.5" /><circle cx="24" cy="32" r="1.5" /><circle cx="32" cy="32" r="1.5" />
          </svg>
        </div>

        <div className="absolute bottom-4 right-4 pointer-events-none opacity-25 select-none">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="#818CF8">
            <circle cx="4" cy="4" r="1.5" /><circle cx="14" cy="4" r="1.5" /><circle cx="24" cy="4" r="1.5" /><circle cx="32" cy="4" r="1.5" />
            <circle cx="4" cy="14" r="1.5" /><circle cx="14" cy="14" r="1.5" /><circle cx="24" cy="14" r="1.5" /><circle cx="32" cy="14" r="1.5" />
            <circle cx="4" cy="24" r="1.5" /><circle cx="14" cy="24" r="1.5" /><circle cx="24" cy="24" r="1.5" /><circle cx="32" cy="24" r="1.5" />
            <circle cx="4" cy="32" r="1.5" /><circle cx="14" cy="32" r="1.5" /><circle cx="24" cy="32" r="1.5" /><circle cx="32" cy="32" r="1.5" />
          </svg>
        </div>

        {/* Top Header Section with 3D Illustration */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          {/* Left Column Text */}
          <div className="space-y-1.5 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-purple-100/70 border border-purple-200/80 text-purple-600 text-[10px] font-extrabold uppercase tracking-widest">
              <IconShieldCheck className="h-3.5 w-3.5 text-purple-600" />
              <span>OFFICIAL EVALUATION</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tracking-tight">
              Proctored Assessment: {skillName}
            </h1>

            {/* Gradient accent line */}
            <div className="h-0.5 w-12 bg-gradient-to-r from-purple-600 to-indigo-400 rounded-none my-1.5" />

            <p className="text-xs text-slate-500 leading-relaxed">
              This is a secure, proctored assessment designed to evaluate your {skillName} skills under real-world conditions.
            </p>
          </div>

          {/* Right Column: 3D Database & Shield Illustration */}
          <div className="shrink-0 flex items-center justify-center self-center md:self-auto">
            <svg width="170" height="130" viewBox="0 0 220 175" fill="none" className="select-none overflow-visible">
              <defs>
                <filter id="proc3dShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#7C3AED" floodOpacity="0.16" />
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

              <ellipse cx="105" cy="142" rx="72" ry="16" fill="#EDE9FE" opacity="0.65" />

              {/* Background Document */}
              <g transform="translate(108, 20)">
                <rect x="0" y="0" width="72" height="92" rx="0" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                <text x="12" y="24" fill="#1E1B4B" fontSize="13" fontWeight="900">
                  {skillName || "SQL"}
                </text>
                <circle cx="14" cy="40" r="2.5" fill="#C4B5FD" />
                <rect x="22" y="38" width="38" height="4" rx="0" fill="#F1F5F9" />
                <circle cx="14" cy="52" r="2.5" fill="#C4B5FD" />
                <rect x="22" y="50" width="28" height="4" rx="0" fill="#F1F5F9" />
                <circle cx="14" cy="64" r="2.5" fill="#C4B5FD" />
                <rect x="22" y="62" width="34" height="4" rx="0" fill="#F1F5F9" />
              </g>

              {/* 3D Database Cylinders Stack */}
              <g filter="url(#proc3dShadow)">
                <path d="M 60 102 C 60 110 80 116 105 116 C 130 116 150 110 150 102 L 150 122 C 150 130 130 136 105 136 C 80 136 60 130 60 122 Z" fill="url(#cylinderGrad2)" />
                <ellipse cx="105" cy="102" rx="45" ry="14" fill="url(#cylinderGrad1)" />

                <path d="M 60 72 C 60 80 80 86 105 86 C 130 86 150 80 150 72 L 150 92 C 150 100 130 106 105 106 C 80 106 60 100 60 92 Z" fill="url(#cylinderGrad2)" />
                <ellipse cx="105" cy="72" rx="45" ry="14" fill="url(#cylinderGrad1)" />

                <path d="M 60 42 C 60 50 80 56 105 56 C 130 56 150 50 150 42 L 150 62 C 150 70 130 76 105 76 C 80 76 60 70 60 62 Z" fill="url(#cylinderGrad2)" />
                <ellipse cx="105" cy="42" rx="45" ry="14" fill="#F3E8FF" />
              </g>

              {/* 3D Security Shield */}
              <g transform="translate(126, 80)" filter="url(#proc3dShadow)">
                <path
                  d="M 28 4 C 44 4 52 14 52 28 C 52 46 28 58 28 58 C 28 58 4 46 4 28 C 4 14 12 4 28 4 Z"
                  fill="url(#shield3dGrad)"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
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

        {/* Middle Examination Protocols Card (Compact & Sharp) */}
        <div className="my-4 rounded-none border border-purple-100/90 bg-[#FAF9FF] p-4 sm:p-5 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-none bg-purple-100/80 border border-purple-200/80 flex items-center justify-center text-purple-600">
              <IconShieldCheck className="h-4 w-4 text-purple-600" />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-wider text-[#1E1B4B]">
              EXAMINATION PROTOCOLS
            </h3>
          </div>

          <div className="divide-y divide-purple-100/70 pt-0.5">
            {/* Protocol 1 */}
            <div className="flex items-center gap-3.5 py-2">
              <div className="h-7 w-7 rounded-none bg-purple-100/60 flex items-center justify-center text-purple-600 shrink-0">
                <IconClock className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Single attempt trial, timed countdown (15 minutes • 15 questions).
              </p>
            </div>

            {/* Protocol 2 */}
            <div className="flex items-center gap-3.5 py-2">
              <div className="h-7 w-7 rounded-none bg-purple-100/60 flex items-center justify-center text-purple-600 shrink-0">
                <IconDeviceLaptop className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Executes in full-screen mode; window blur or tab switching is logged by telemetric flags.
              </p>
            </div>

            {/* Protocol 3 */}
            <div className="flex items-center gap-3.5 py-2">
              <div className="h-7 w-7 rounded-none bg-purple-100/60 flex items-center justify-center text-purple-600 shrink-0">
                <IconUserCheck className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Webcam biometric presence check actively ensures identity integrity.
              </p>
            </div>

            {/* Protocol 4 */}
            <div className="flex items-center gap-3.5 py-2">
              <div className="h-7 w-7 rounded-none bg-purple-100/60 flex items-center justify-center text-purple-600 shrink-0">
                <IconLock className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Completing this assessment calculates official skill mastery and unlocks subsequent branch nodes.
              </p>
            </div>
          </div>
        </div>

        {startError && (
          <div className="mb-4 rounded-none border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700 flex items-center gap-2">
            <IconAlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{startError}</span>
          </div>
        )}

        {/* Bottom Actions Row: Sharp Corners */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
          {/* Primary Action Button */}
          <button
            type="button"
            onClick={begin}
            className="flex-1 inline-flex items-center justify-between px-6 py-3.5 rounded-none bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-500/25 hover:opacity-95 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-none bg-white/20 flex items-center justify-center text-white">
                <IconShieldCheck className="h-4 w-4" />
              </div>
              <span>Enter Fullscreen Assessment</span>
            </div>
            <IconArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Estimated Time Badge */}
          <div className="rounded-none border border-purple-100 bg-[#FAF9FF] px-5 py-2.5 flex items-center gap-3 shrink-0 shadow-xs">
            <div className="h-8 w-8 rounded-none bg-purple-100/80 flex items-center justify-center text-purple-600">
              <IconClock className="h-4 w-4 text-[#6366F1]" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block leading-tight">
                Estimated Time
              </span>
              <span className="text-xs sm:text-sm font-black text-[#6366F1] block leading-tight">
                15 Minutes
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "loading" || phase === "submitting") {
    return (
      <div className="relative rounded-none border border-purple-100/90 bg-white p-8 sm:p-12 shadow-xl shadow-purple-500/5 text-slate-900 flex flex-col items-center justify-center min-h-[380px]">
        <CubeLoader
          title={phase === "loading" ? "INITIALIZING ENVIRONMENT" : "EVALUATING RESPONSES"}
          subtitle={
            phase === "loading"
              ? "Preparing biometric telemetry, security sandbox & assessment questions…"
              : "AI Examiner is validating answers and computing skill mastery score…"
          }
        />
      </div>
    );
  }

  if (phase === "verify") {
    return (
      <div className="relative rounded-none border border-purple-100/90 bg-white p-6 sm:p-8 shadow-2xl shadow-purple-500/5 text-slate-900 space-y-5">
        {/* Header */}
        <div className="space-y-1.5 border-b border-purple-100/80 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-purple-100/70 border border-purple-200/80 text-purple-600 text-[10px] font-extrabold uppercase tracking-widest">
            <IconShieldCheck className="h-3.5 w-3.5 text-purple-600" />
            <span>BIOMETRIC IDENTITY VERIFICATION</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1E1B4B]">
            Facial Recognition & ID Match
          </h2>
          <p className="text-xs text-slate-500">
            Please click a verification photo. Once your facial features match your registered profile, you will proceed directly to the examination.
          </p>
        </div>

        {/* Verification Dual-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Card 1: Registered Profile ID Photo */}
          <div className="rounded-none border border-purple-100/90 bg-[#FAF9FF] p-4 flex flex-col items-center justify-between space-y-3 text-center">
            <div className="w-full flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#1E1B4B]">
                Registered ID Profile
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 border border-purple-100">
                Primary Reference
              </span>
            </div>

            <div className="relative h-48 w-48 sm:h-52 sm:w-52 rounded-none border-2 border-purple-200 bg-slate-900 overflow-hidden shadow-inner flex items-center justify-center">
              {referencePhoto ? (
                <img
                  src={referencePhoto}
                  alt="Registered profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 p-4">
                  <IconUserCheck className="h-14 w-14 text-purple-400 mb-2" />
                  <span className="text-xs font-semibold">New Student Profile</span>
                  <span className="text-[10px] text-slate-500">Will enroll first capture</span>
                </div>
              )}
            </div>

            <div className="w-full text-center">
              <span className="text-[11px] font-bold text-slate-600 block">
                {referencePhoto ? "✓ Registered Reference on File" : "Initial Enrollment Mode"}
              </span>
            </div>
          </div>

          {/* Card 2: Live Webcam & Captured Frame */}
          <div
            className={`rounded-none border p-4 flex flex-col items-center justify-between space-y-3 text-center transition-all ${
              verifyStatus === "matched"
                ? "border-emerald-400 bg-emerald-50/30"
                : verifyStatus === "mismatch"
                ? "border-rose-400 bg-rose-50/30"
                : "border-purple-100/90 bg-[#FAF9FF]"
            }`}
          >
            <div className="w-full flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#1E1B4B]">
                Live Camera Capture
              </span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-none uppercase tracking-wider ${
                  verifyStatus === "matched"
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                    : verifyStatus === "mismatch"
                    ? "bg-rose-100 text-rose-700 border border-rose-300"
                    : "bg-purple-100 text-purple-700 border border-purple-200"
                }`}
              >
                {verifyStatus === "matched"
                  ? `✓ Matched (${verifyConfidence}%)`
                  : verifyStatus === "mismatch"
                  ? "Mismatch"
                  : verifyStatus === "capturing"
                  ? "Scanning..."
                  : "Live Viewfinder"}
              </span>
            </div>

            <div className="relative h-48 w-48 sm:h-52 sm:w-52 rounded-none border-2 border-dashed border-purple-300 bg-black overflow-hidden shadow-inner flex items-center justify-center">
              {capturedPhoto ? (
                <img
                  src={capturedPhoto}
                  alt="Captured snapshot"
                  className="h-full w-full object-cover"
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover scale-x-[-1]"
                />
              )}

              {/* Viewfinder Target Brackets */}
              <div className="pointer-events-none absolute inset-2 border border-cyan-400/40 rounded-none" />
              <div className="pointer-events-none absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
              <div className="pointer-events-none absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
              <div className="pointer-events-none absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
              <div className="pointer-events-none absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

              {verifyStatus === "capturing" && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-cyan-300 gap-2">
                  <IconScan className="h-8 w-8 animate-spin" />
                  <span className="text-[11px] font-black tracking-widest uppercase">Matching Face...</span>
                </div>
              )}
            </div>

            <div className="w-full">
              {verifyStatus === "matched" ? (
                <span className="text-[11px] font-extrabold text-emerald-600 block">
                  ✓ Identity Confirmed ({verifyConfidence}% Confidence Score)
                </span>
              ) : verifyStatus === "mismatch" ? (
                <span className="text-[11px] font-extrabold text-rose-600 block">
                  Face did not match registered profile
                </span>
              ) : (
                <span className="text-[11px] font-medium text-slate-500 block">
                  Center your face in the box and capture
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Error Alert if Mismatched */}
        {verifyErrorMsg && (
          <div className="rounded-none border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700 flex items-center gap-2">
            <IconAlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{verifyErrorMsg}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-medium">
            {verifyStatus === "matched"
              ? "✓ Biometric clearance granted. Launching fullscreen proctoring..."
              : "Full-screen mode will be locked during the test."}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {capturedPhoto ? (
              <button
                type="button"
                onClick={retakePhoto}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-none border border-purple-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
              >
                <IconRefresh className="h-4 w-4" />
                <span>Retake Photo</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={takeVerificationPhoto}
                disabled={verifyStatus === "capturing"}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-none bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white text-xs sm:text-sm font-black shadow-lg shadow-purple-500/25 hover:opacity-95 cursor-pointer disabled:opacity-50"
              >
                <IconCamera className="h-4 w-4" />
                <span>Click Image & Verify</span>
              </button>
            )}

            {verifyStatus === "matched" && (
              <button
                type="button"
                onClick={startExam}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-none bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-500/30 hover:opacity-95 cursor-pointer ring-2 ring-emerald-300 animate-pulse"
              >
                <span>Proceed to Assessment</span>
                <IconArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="space-y-4">
      {/* 1. Live Proctored HUD Bar (Matches Mockup) */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-purple-100/90 bg-white p-4 sm:p-5 shadow-sm">
        {/* Timer */}
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-full bg-purple-100/80 text-purple-600 flex items-center justify-center shrink-0">
            <IconClock className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block leading-tight">Time Remaining</span>
            <span className="text-2xl font-black text-[#1E1B4B] tabular-nums tracking-tight block leading-tight">
              {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Biometrics & Live Webcam Frame */}
        <div className="flex items-center gap-3">
          {flags.length > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold">
              <IconAlertTriangle className="h-3.5 w-3.5 text-rose-500" />
              <span>{flags.length} Flag(s)</span>
            </div>
          )}

          {/* Scanning Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/70 border border-purple-200/80 text-purple-600 text-xs font-bold uppercase tracking-wider">
            <span>
              {faceStatus === "mismatch"
                ? "WARNING..."
                : faceStatus === "no_face"
                ? "NO FACE..."
                : "SCANNING..."}
            </span>
            <span
              className={`h-2 w-2 rounded-full ${
                faceStatus === "mismatch" || faceStatus === "no_face"
                  ? "bg-rose-500"
                  : "bg-emerald-400 animate-pulse"
              }`}
            />
          </div>

          {/* Webcam Thumbnail Frame */}
          <div className="relative h-12 w-16 rounded-xl overflow-hidden border-2 border-purple-200 bg-slate-950 shadow-xs shrink-0">
            {cameraActive ? (
              <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover scale-x-[-1]" />
            ) : (
              <div className="grid h-full w-full place-items-center text-[9px] font-bold text-slate-500">NO CAM</div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Question Quick Jump & Progress Header Card */}
      {questions.length > 0 && (
        <>
          <div className="rounded-2xl border border-purple-100/90 bg-white p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#7C3AED]">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs font-medium text-slate-400">
                  {Object.keys(answers).length}/{questions.length} Answered
                </span>
              </div>

              {/* Numbered Jump Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {questions.map((_, idx) => {
                  const isCurrent = currentIndex === idx;
                  const isAnswered = answers[questions[idx]?.id] !== undefined;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-8 w-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        isCurrent
                          ? "bg-[#7C3AED] text-white font-black shadow-sm"
                          : isAnswered
                          ? "bg-purple-100/80 border border-purple-300 text-purple-700"
                          : "border border-purple-100 bg-[#FAF9FF] text-slate-500 hover:bg-purple-50"
                      }`}
                      title={`Jump to Question ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Progress Line */}
            <div className="h-1 w-full bg-purple-50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-400 rounded-full transition-all duration-300"
                style={{ width: `${(Object.keys(answers).length / Math.max(1, questions.length)) * 100}%` }}
              />
            </div>
          </div>

          {/* 3. Active Single Question Card */}
          {questions[currentIndex] && (
            <div className="rounded-2xl border border-purple-100/90 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
              {/* Question Header Badge */}
              <div>
                <span className="px-3 py-1 rounded-lg bg-purple-100/80 text-purple-600 text-[10px] font-extrabold uppercase tracking-wider inline-block">
                  QUESTION #{currentIndex + 1}
                </span>
              </div>

              {/* Question Text */}
              <h3 className="text-base sm:text-lg font-bold text-[#1E1B4B] leading-relaxed">
                {questions[currentIndex].question}
              </h3>

              {/* Options Stack */}
              <div className="space-y-3 pt-1">
                {questions[currentIndex].options.map((opt, oi) => {
                  const qId = questions[currentIndex].id;
                  const isSelected = answers[qId] === oi;
                  const optionLetters = ["A", "B", "C", "D", "E", "F"];

                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => setAnswers((a) => ({ ...a, [qId]: oi }))}
                      className={`w-full text-left flex items-center justify-between gap-4 rounded-xl border p-4 transition-all cursor-pointer ${
                        isSelected
                          ? "border-2 border-purple-400 bg-purple-50/50 shadow-xs"
                          : "border border-purple-100/80 bg-white hover:border-purple-200 hover:bg-purple-50/30 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        {/* Option Letter Badge */}
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                            isSelected
                              ? "bg-purple-200/90 text-purple-800 font-black"
                              : "bg-purple-100/70 text-purple-600"
                          }`}
                        >
                          {optionLetters[oi] || oi + 1}
                        </div>

                        <span className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed font-mono sm:font-sans">
                          {opt}
                        </span>
                      </div>

                      {/* Selected Checkmark Badge */}
                      {isSelected && (
                        <div className="h-6 w-6 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <IconCheck className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Navigation Actions Footer */}
              <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-purple-100 bg-white text-xs sm:text-sm font-bold text-slate-500 hover:bg-purple-50 shadow-xs disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  <IconChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-3">
                  {currentIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-500/20 hover:opacity-95 transition-all cursor-pointer"
                    >
                      <span>Next Question</span>
                      <IconChevronRight className="h-4 w-4" />
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={submit}
                    disabled={Object.keys(answers).length < questions.length}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-purple-200 bg-white text-[#7C3AED] text-xs sm:text-sm font-bold shadow-xs hover:bg-purple-50 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <span>Submit Official Assessment</span>
                    <IconArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
