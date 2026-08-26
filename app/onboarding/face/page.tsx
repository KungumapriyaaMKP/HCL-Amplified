"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/frontend/components/ui/Card";
import { Button } from "@/frontend/components/ui/Button";
import { loadFaceModels, captureFace, type FaceCapture } from "@/lib/faceMatch";

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
        setError("No face detected - center your face in frame and try again.");
        return;
      }
      setCapture(result);
    } catch {
      setError("Couldn't process that frame - try again.");
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
      setError("Couldn't save your reference photo - you can register it later before your first proctored test instead.");
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="mb-1 text-xl font-semibold">Register your face</h1>
        <p className="mb-6 text-sm text-muted">
          Proctored tests check your face against this reference photo, right in your browser - it&apos;s used only
          for that comparison, never for anything else.
        </p>

        <div className="mb-4 aspect-video overflow-hidden rounded-xl border border-border bg-surface-2">
          {capture ? (
            // eslint-disable-next-line @next/next/no-img-element -- a captured data: URL, not an optimizable remote image
            <img src={capture.photoDataUrl} alt="Captured reference" className="h-full w-full object-cover" />
          ) : cameraError ? (
            <div className="grid h-full place-items-center text-center text-sm text-muted">
              Camera access is needed for this step.
              <br />
              You can skip it and register later instead.
            </div>
          ) : (
            <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
          )}
        </div>

        {error && <p className="mb-3 text-sm text-danger">{error}</p>}

        <div className="flex flex-col gap-2">
          {capture ? (
            <>
              <Button disabled={saving} onClick={saveAndContinue}>
                {saving ? "Saving..." : "Save & continue"}
              </Button>
              <Button variant="secondary" disabled={saving} onClick={() => setCapture(null)}>
                Retake
              </Button>
            </>
          ) : (
            <Button disabled={!cameraReady || capturing} onClick={takeCapture}>
              {capturing ? "Capturing..." : "Capture photo"}
            </Button>
          )}
          <button
            onClick={() => router.push(next)}
            className="text-center text-sm text-muted hover:text-foreground"
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
