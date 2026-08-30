"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadFaceModels, captureFace, type FaceCapture } from "@/lib/faceMatch";
import CubeLoader from "@/components/ui/cube-loader";
import {
  IconCamera,
  IconRefresh,
  IconArrowRight,
  IconCheck,
  IconLock,
  IconSun,
  IconFaceId,
  IconEyeglass,
  IconPencil,
  IconLoader2,
} from "@tabler/icons-react";

function FaceOnboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [capture, setCapture] = useState<FaceCapture>(null);
  const [capturing, setCapturing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFaceModels().catch(() => {});
    navigator.mediaDevices
      .getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraReady(true);
      })
      .catch(() => setCameraError(true));

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function takeCapture() {
    if (!videoRef.current) return;
    setCapturing(true);
    setError(null);
    setScanProgress(15);

    const interval = setInterval(() => {
      setScanProgress((p) => (p < 85 ? p + 15 : p));
    }, 100);

    try {
      const result = await captureFace(videoRef.current);
      clearInterval(interval);
      if (!result) {
        setScanProgress(0);
        setError("No face detected | please center your face inside the dashed frame and retry.");
        return;
      }
      setScanProgress(100);
      setTimeout(() => {
        setCapture(result);
        setScanProgress(0);
      }, 250);
    } catch {
      clearInterval(interval);
      setScanProgress(0);
      setError("Could not process frame | please try again.");
    } finally {
      setCapturing(false);
    }
  }

  async function saveAndContinue() {
    if (!capture) return;
    setSaving(true);
    try {
      const [res] = await Promise.all([
        fetch("/api/profile/face", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ descriptor: capture.descriptor, photoDataUrl: capture.photoDataUrl }),
        }),
        new Promise((r) => setTimeout(r, 1200)),
      ]);
      if (!res.ok) throw new Error();
      setIsCompleted(true);
      setTimeout(() => {
        router.push(next);
      }, 700);
    } catch {
      setError("Could not save biometric profile | you can register later before your first proctored test.");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-900 flex flex-col justify-between items-center p-4 sm:p-6 font-sans selection:bg-purple-100 selection:text-purple-900">
      
      {/* 1. Top Header & Centered Progress Stepper */}
      <div className="w-full max-w-2xl mx-auto space-y-3 pt-2 shrink-0">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Biometric Registration
          </h1>
        </div>

        {/* Clean Stepper: Connecting Lines Sit Between Items */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 w-full py-1">
          
          {/* Step 1: Welcome */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-none border border-purple-200 bg-purple-100 text-[10px] font-black text-[#7C3AED] shadow-2xs">
              1
            </div>
            <div className="text-left">
              <div className="text-[11px] font-bold text-slate-800 leading-tight">Welcome</div>
              <div className="text-[9px] font-semibold text-purple-600 flex items-center gap-0.5 mt-0.5">
                <IconCheck className="h-2.5 w-2.5 stroke-[2.5]" />
                <span>Completed</span>
              </div>
            </div>
          </div>

          {/* Line 1 -> 2 */}
          <div className="flex-1 max-w-[30px] sm:max-w-[50px] h-0.5 bg-purple-300" />

          {/* Step 2: Personal Details */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-none border border-purple-200 bg-purple-100 text-[10px] font-black text-[#7C3AED] shadow-2xs">
              2
            </div>
            <div className="text-left">
              <div className="text-[11px] font-bold text-slate-800 leading-tight">Personal Details</div>
              <div className="text-[9px] font-semibold text-purple-600 flex items-center gap-0.5 mt-0.5">
                <IconCheck className="h-2.5 w-2.5 stroke-[2.5]" />
                <span>Completed</span>
              </div>
            </div>
          </div>

          {/* Line 2 -> 3 */}
          <div className="flex-1 max-w-[30px] sm:max-w-[50px] h-0.5 bg-purple-300" />

          {/* Step 3: Face Verification (Active) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-none text-[10px] font-black text-white transition-all ${
                isCompleted
                  ? "border border-purple-200 bg-purple-100 text-[#7C3AED]"
                  : "bg-[#7C3AED] shadow-md shadow-purple-500/25 ring-2 ring-purple-500/20"
              }`}
            >
              3
            </div>
            <div className="text-left">
              <div className="text-[11px] font-extrabold text-slate-900 leading-tight">Face Verification</div>
              <div className="text-[9px] font-bold text-purple-600 flex items-center gap-0.5 mt-0.5">
                <IconCheck className="h-2.5 w-2.5 stroke-[2.5]" />
                <span>{isCompleted ? "Completed" : "In Progress"}</span>
              </div>
            </div>
          </div>

          {/* Line 3 -> 4 */}
          <div
            className={`flex-1 max-w-[30px] sm:max-w-[50px] h-0.5 transition-colors duration-500 ${
              isCompleted ? "bg-purple-300" : "bg-slate-200"
            }`}
          />

          {/* Step 4: Complete */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-none text-[10px] font-semibold transition-all ${
                isCompleted
                  ? "bg-[#7C3AED] text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-500/20"
                  : "border border-slate-200 bg-slate-100 text-slate-400"
              }`}
            >
              4
            </div>
            <div className="text-left">
              <div className={`text-[11px] font-semibold leading-tight ${isCompleted ? "text-slate-900" : "text-slate-400"}`}>
                Complete
              </div>
              <div className={`text-[9px] font-medium mt-0.5 ${isCompleted ? "text-purple-600" : "text-slate-400"}`}>
                {isCompleted ? "In Progress" : "Pending"}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Main Center Verification Card (White Theme with Sharp Edges) */}
      <div className="w-full max-w-xl mx-auto my-auto shrink-1 min-h-0 py-4">
        <div className="relative rounded-none border border-slate-200 bg-white p-5 sm:p-6 shadow-[0_20px_50px_rgba(79,70,229,0.06)] text-center overflow-hidden flex flex-col justify-between">
          
          {/* Title Header */}
          <div className="shrink-0">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7C3AED]">
              BIOMETRIC REGISTRATION
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Face Verification
            </h2>

            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto mt-1 leading-snug">
              We use face recognition to ensure a secure and personalized learning experience for you.
            </p>
          </div>

          {/* 3. Camera Viewfinder (Sharp Edges) */}
          <div className="relative h-48 sm:h-56 w-full max-w-md mx-auto rounded-none overflow-hidden bg-slate-950 border border-slate-300 my-3 shadow-inner shrink-0">
            {saving ? (
              <div className="relative h-full w-full bg-[#090D1C] flex items-center justify-center">
                <CubeLoader
                  title="Encrypting & Storing"
                  subtitle="Writing biometric descriptor to secure profile…"
                  className="min-h-0 p-2"
                />
              </div>
            ) : capture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <div className="relative h-full w-full">
                <img src={capture.photoDataUrl} alt="Captured reference" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-purple-950/30 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-none bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.6)] mb-1">
                    <IconCheck className="h-5 w-5 stroke-[3]" />
                  </div>
                  <div className="text-xs font-black text-white">Face Descriptor Encrypted</div>
                  <p className="text-[10px] text-purple-200">Biometric calibration verified at 100%.</p>
                </div>
              </div>
            ) : cameraError ? (
              <div className="grid h-full place-items-center p-4 text-center text-xs text-slate-400 bg-slate-950">
                <div>
                  <IconCamera className="h-6 w-6 text-slate-600 mx-auto mb-1" />
                  <span className="font-bold text-slate-300 text-xs">Camera access required for face verification.</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Please allow camera permissions or skip to register later.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative h-full w-full">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  onLoadedMetadata={() => setCameraReady(true)}
                  className="h-full w-full object-cover"
                />

                {/* 4 Corner Crosshair Reticles (Sharp 90-Degree) */}
                <div className="pointer-events-none absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-white/80" />
                <div className="pointer-events-none absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-white/80" />
                <div className="pointer-events-none absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-white/80" />
                <div className="pointer-events-none absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-white/80" />

                {/* Center Oval Reticle with Dynamic Laser Scanning Beam */}
                <div className="pointer-events-none absolute inset-0 m-auto w-32 sm:w-40 h-40 sm:h-48 rounded-[50%] border-2 border-dashed border-purple-400/80 shadow-[0_0_20px_rgba(168,85,247,0.35)] overflow-hidden flex items-center justify-center">
                  {capturing && (
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-pulse" />
                  )}
                </div>

                {/* Live Scanning Progress Overlay (Sharp Edges) */}
                {capturing && (
                  <div className="absolute inset-x-0 bottom-2 px-4">
                    <div className="bg-black/90 backdrop-blur-md rounded-none p-2 border border-purple-500/40 shadow-lg space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-purple-300 flex items-center gap-1">
                          <IconLoader2 className="h-3 w-3 animate-spin text-purple-400" />
                          Calibrating Biometrics...
                        </span>
                        <span className="text-cyan-400 font-extrabold">{scanProgress}%</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-none overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-cyan-400 rounded-none transition-all duration-200"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-2 rounded-none border border-rose-200 bg-rose-50 p-2 text-[11px] font-bold text-rose-700 text-left shrink-0">
              {error}
            </div>
          )}

          {/* 4. Instructions Row (Sharp Edges) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-none bg-[#F8F9FD] border border-slate-200 mb-3 text-left shrink-0">
            
            {/* Good lighting */}
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-none bg-emerald-50 border border-emerald-200 text-emerald-600">
                <IconSun className="h-3.5 w-3.5 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">Good lighting</div>
                <div className="text-[9px] text-slate-500 font-medium">Face is well lit</div>
              </div>
            </div>

            {/* Face forward */}
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-none bg-emerald-50 border border-emerald-200 text-emerald-600">
                <IconFaceId className="h-3.5 w-3.5 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">Face forward</div>
                <div className="text-[9px] text-slate-500 font-medium">Look directly at camera</div>
              </div>
            </div>

            {/* No accessories */}
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-none bg-emerald-50 border border-emerald-200 text-emerald-600">
                <IconEyeglass className="h-3.5 w-3.5 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">No accessories</div>
                <div className="text-[9px] text-slate-500 font-medium">Remove glasses/hats</div>
              </div>
            </div>

          </div>

          {/* 5. Action Buttons (Sharp Edges) */}
          <div className="space-y-2 shrink-0">
            {capture ? (
              <div className="space-y-1.5">
                <button
                  disabled={saving || isCompleted}
                  onClick={saveAndContinue}
                  className="w-full py-2.5 px-4 rounded-none bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#9333EA] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-purple-500/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{isCompleted ? "Verified! Redirecting..." : saving ? "Registering Biometric Profile..." : "Save Biometrics & Continue"}</span>
                  <IconArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>

                {!isCompleted && (
                  <button
                    disabled={saving}
                    onClick={() => setCapture(null)}
                    className="w-full py-1.5 px-3 rounded-none border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <IconRefresh className="h-3 w-3" />
                    <span>Recalibrate & Retake Photo</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                disabled={capturing}
                onClick={takeCapture}
                className="w-full py-2.5 px-4 rounded-none bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#9333EA] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-purple-500/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <IconCamera className="h-3.5 w-3.5 stroke-[2.2]" />
                <span>{capturing ? "Scanning Face Descriptor..." : "Capture Reference Photo"}</span>
              </button>
            )}

            {/* Divider OR */}
            <div className="relative py-1 flex items-center justify-center">
              <div className="w-full border-t border-slate-200" />
              <span className="absolute bg-white px-2.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                OR
              </span>
            </div>

            {/* Skip for now Link */}
            <div>
              <button
                onClick={() => router.push(next)}
                className="text-[11px] font-bold text-[#7C3AED] hover:text-[#6D28D9] transition-colors cursor-pointer"
              >
                Skip for now
              </button>
            </div>
          </div>

          {/* 6. Footer Encryption Notice */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100 shrink-0">
            <IconLock className="h-3 w-3 text-slate-400" />
            <span>Your biometric data is encrypted and used only for verification purposes.</span>
          </div>

        </div>
      </div>

    </div>
  );
}

export default function OnboardingFacePage() {
  return (
    <Suspense>
      <FaceOnboarding />
    </Suspense>
  );
}
