"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/frontend/components/ui/Card";
import { Button } from "@/frontend/components/ui/Button";
import { Input, Label } from "@/frontend/components/ui/Input";

type Extraction = {
  currentRole: string | null;
  careerGoal: string | null;
  yearsExperience: number | null;
  summary: string;
  skillMastery: { skillId: string; confidence: string }[];
};

function ResumeOnboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ extraction: Extraction; seededCount: number } | null>(null);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      if (fileRef.current?.files?.[0]) formData.append("file", fileRef.current.files[0]);
      if (currentRole.trim()) formData.append("currentRole", currentRole.trim());
      if (careerGoal.trim()) formData.append("careerGoal", careerGoal.trim());
      if (yearsExperience.trim()) formData.append("yearsExperience", yearsExperience.trim());

      const res = await fetch("/api/profile/resume", { method: "POST", body: formData });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Couldn't process that");
      setResult(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md p-8">
          <h1 className="mb-1 text-xl font-semibold">Got it</h1>
          <p className="mb-4 text-sm text-foreground/85">{result.extraction.summary}</p>
          {result.seededCount > 0 && (
            <p className="mb-6 text-sm text-success">
              {result.seededCount} skill{result.seededCount === 1 ? "" : "s"} already credited toward your goals -
              every new goal will start from here instead of zero.
            </p>
          )}
          <Button className="w-full" onClick={() => router.push(next)}>
            Continue
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="mb-1 text-xl font-semibold">Tell us what you already know</h1>
        <p className="mb-6 text-sm text-muted">
          Upload a resume and/or answer a couple of questions - we&apos;ll credit skills you already have so every
          new goal starts from where you actually are, not from zero.
        </p>

        <div className="mb-4">
          <Label>Resume (PDF or text, optional)</Label>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,text/plain,application/pdf"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            className="block w-full text-sm text-muted"
          />
          {fileName && <p className="mt-1 text-xs text-accent">{fileName}</p>}
        </div>

        <div className="mb-3">
          <Label>Current role</Label>
          <Input value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} placeholder="e.g. Frontend developer" />
        </div>
        <div className="mb-3">
          <Label>Career goal</Label>
          <Input value={careerGoal} onChange={(e) => setCareerGoal(e.target.value)} placeholder="e.g. Move into ML engineering" />
        </div>
        <div className="mb-4">
          <Label>Years of experience</Label>
          <Input
            type="number"
            min={0}
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
            placeholder="e.g. 3"
          />
        </div>

        {error && <p className="mb-3 text-sm text-danger">{error}</p>}

        <div className="flex flex-col gap-2">
          <Button disabled={submitting} onClick={submit}>
            {submitting ? "Analyzing..." : "Save"}
          </Button>
          <button onClick={() => router.push(next)} className="text-center text-sm text-muted hover:text-foreground">
            Skip for now
          </button>
        </div>
      </Card>
    </div>
  );
}

export default function OnboardingResumePage() {
  return (
    <Suspense>
      <ResumeOnboarding />
    </Suspense>
  );
}
