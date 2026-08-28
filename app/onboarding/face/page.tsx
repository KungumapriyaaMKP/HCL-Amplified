"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/frontend/components/ui/Card";
import { Button } from "@/frontend/components/ui/Button";
import { loadFaceModels, captureFace, type FaceCapture } from "@/lib/faceMatch";
import { IconCamera, IconRefresh, IconArrowRight, IconShieldCheck } from "@tabler/icons-react";

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFaceModels().catch(() => {});
    navigator.mediaDevices
      .getUserMedia({ video: true })
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
    try {
      const result = await captureFace(videoRef.current);
      if (!result) {
        setError("No face detected — center your face inside the scan frame and retry.");
        return;
      }
      setCapture(result);
    } catch {
      setError("Could not process frame — try again.");
    } finally {
      setCapturing(false);
    }
  }

  async function saveAndContinue() {
    if (!capture) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile/face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptor: capture.descriptor, photoDataUrl: capture.photoDataUrl }),
      });
      if (!res.ok) throw new Error();
      router.push(next);
    } catch {
      setError("Could not save biometric profile — you can register later before your first proctored test.");
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070913] px-4 text-white">
      <Card className="w-full max-w-lg p-8">
        <div className="text-center mb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-400">
            BIOMETRIC REGISTRATION
          </span>
          <h1 className="mt-1 text-2xl font-black text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
            Biometric Calibration
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Proctored assessments check your face against this encrypted descriptor in-browser for integrity.
          </p>
        </div>

        {/* Camera Viewport Frame */}
        <div className="relative mb-6 aspect-video overflow-hidden rounded-3xl border-2 border-purple-500/40 bg-black shadow-[0_0_25px_rgba(168,85,247,0.3)]">
          {capture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={capture.photoDataUrl} alt="Captured reference" className="h-full w-full object-cover" />
          ) : cameraError ? (
            <div className="grid h-full place-items-center p-6 text-center text-xs text-slate-400">
              Camera access required for instant registration.
              <br />
              You can proceed and register later before your first proctored assessment.
            </div>
          ) : (
            <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
          )}

          {/* Cyber reticle overlay */}
          <div className="pointer-events-none absolute inset-4 border border-cyan-400/30 rounded-2xl flex items-center justify-center">
            <div className="h-24 w-24 border border-dashed border-cyan-400/50 rounded-full animate-pulse" />
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-950/60 p-3 text-xs font-bold text-red-300">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {capture ? (
            <>
              <Button size="lg" disabled={saving} onClick={saveAndContinue}>
                <span>{saving ? "Registering Descriptor..." : "Save Biometrics & Continue"}</span>
                <IconArrowRight className="h-4 w-4" />
              </Button>
              <Button size="md" variant="secondary" disabled={saving} onClick={() => setCapture(null)}>
                <IconRefresh className="h-4 w-4" />
                <span>Recalibrate Frame</span>
              </Button>
            </>
          ) : (
            <Button size="lg" disabled={!cameraReady || capturing} onClick={takeCapture}>
              <IconCamera className="h-4 w-4" />
              <span>{capturing ? "Scanning..." : "Capture Reference Photo"}</span>
            </Button>
          )}

          <button
            onClick={() => router.push(next)}
            className="mt-2 text-center text-xs font-bold text-slate-500 hover:text-purple-300 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </Card>
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
