"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/frontend/components/ui/Card";
import { Button } from "@/frontend/components/ui/Button";
import { Input, Label } from "@/frontend/components/ui/Input";
import { IconFileText, IconArrowRight, IconCheck, IconUpload } from "@tabler/icons-react";

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
      if (!res.ok) throw new Error(body.error || "Could not analyze credentials");
      setResult(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong analyzing resume");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070913] px-4 text-white">
        <Card className="w-full max-w-lg p-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-950 border border-purple-500/40 text-purple-400 mb-3 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <IconCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-white">Experience Profile Calibrated</h1>
          <p className="mt-2 text-xs text-slate-300 leading-relaxed max-w-md mx-auto">{result.extraction.summary}</p>
          
          {result.seededCount > 0 && (
            <div className="my-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs font-bold text-emerald-300">
              {result.seededCount} Skill{result.seededCount === 1 ? "" : "s"} already credited toward your profile.
            </div>
          )}

          <Button size="lg" className="w-full mt-4" onClick={() => router.push(next)}>
            <span>Enter Dashboard</span>
            <IconArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070913] px-4 text-white">
      <Card className="w-full max-w-lg p-8">
        <div className="text-center mb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
            BACKGROUND & CREDENTIAL INTAKE
          </span>
          <h1 className="mt-1 text-2xl font-black text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
            Prior Experience Calibration
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Upload your resume or specify your background so AI credits existing masteries instead of starting from scratch.
          </p>
        </div>

        {/* Upload Box */}
        <div className="mb-5 rounded-2xl border-2 border-dashed border-purple-500/30 bg-[#080b1a] p-5 text-center">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,text/plain,application/pdf"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            className="hidden"
            id="resume-file"
          />
          <label htmlFor="resume-file" className="cursor-pointer flex flex-col items-center">
            <IconUpload className="h-8 w-8 text-purple-400 mb-2" />
            <span className="text-xs font-bold text-purple-300 hover:text-purple-200">
              {fileName ? fileName : "Upload Resume (PDF / TXT)"}
            </span>
            <span className="block text-[10px] text-slate-500 mt-0.5">Click to browse file</span>
          </label>
        </div>

        <div className="space-y-3.5 mb-6">
          <div>
            <Label>Current Role / Specialization</Label>
            <Input value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} placeholder="e.g. Frontend Engineer" />
          </div>
          <div>
            <Label>Career Objective</Label>
            <Input value={careerGoal} onChange={(e) => setCareerGoal(e.target.value)} placeholder="e.g. Senior Distributed AI Architect" />
          </div>
          <div>
            <Label>Years of Experience</Label>
            <Input
              type="number"
              min={0}
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              placeholder="e.g. 3"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-950/60 p-3 text-xs font-bold text-red-300">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <Button size="lg" disabled={submitting} onClick={submit}>
            <span>{submitting ? "Analyzing Profile..." : "Analyze & Ingest Profile"}</span>
            <IconArrowRight className="h-4 w-4" />
          </Button>
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

export default function OnboardingResumePage() {
  return (
    <Suspense>
      <ResumeOnboarding />
    </Suspense>
  );
}
