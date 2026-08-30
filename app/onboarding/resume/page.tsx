"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  IconFileText,
  IconArrowRight,
  IconCheck,
  IconCloudUpload,
  IconBriefcase,
  IconTarget,
  IconCalendar,
} from "@tabler/icons-react";

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
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [result, setResult] = useState<{ extraction: Extraction; seededCount: number } | null>(null);

  async function submit() {
    setHasAttemptedSubmit(true);
    setError(null);

    // Validate mandatory fields
    if (!currentRole.trim() || !careerGoal.trim() || !yearsExperience.trim()) {
      setError("Please fill in all mandatory fields (marked with *).");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (fileRef.current?.files?.[0]) formData.append("file", fileRef.current.files[0]);
      formData.append("currentRole", currentRole.trim());
      formData.append("careerGoal", careerGoal.trim());
      formData.append("yearsExperience", yearsExperience.trim());

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
      <div className="relative min-h-screen flex items-center justify-center bg-[#F8F9FD] p-4 sm:p-8 font-sans overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-200/50 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-100/60 blur-3xl pointer-events-none" />

        <div className="w-full max-w-[560px] bg-white rounded-none p-8 sm:p-10 shadow-[0_20px_50px_rgba(79,70,229,0.06)] border border-slate-200 text-center relative z-10">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-none bg-purple-50 text-[#7C3AED] mb-4 shadow-xs">
            <IconCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Experience Profile Calibrated</h1>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed max-w-md mx-auto">{result.extraction.summary}</p>
          
          {result.seededCount > 0 && (
            <div className="my-5 rounded-none border border-emerald-200 bg-emerald-50/70 p-4 text-xs font-bold text-emerald-700">
              {result.seededCount} Skill{result.seededCount === 1 ? "" : "s"} already credited toward your profile.
            </div>
          )}

          <button
            onClick={() => router.push(next)}
            className="w-full mt-4 py-3.5 rounded-none bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#A855F7] text-white text-xs font-bold shadow-md shadow-purple-500/20 hover:opacity-95 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Enter Dashboard</span>
            <IconArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#F8F9FD] p-4 sm:p-8 font-sans overflow-hidden">
      {/* Background Decorative Ambient Radial Glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-200/50 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-100/60 blur-3xl pointer-events-none" />

      {/* Decorative Orbit Concentric Rings (Bottom Left) */}
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border border-purple-200/50 pointer-events-none hidden sm:block" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full border border-purple-200/40 pointer-events-none hidden sm:block" />
      <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full border border-purple-200/30 pointer-events-none hidden sm:block" />

      {/* Decorative Dot Matrix Grids */}
      <div className="absolute top-10 left-10 grid grid-cols-6 gap-2 opacity-30 pointer-events-none hidden sm:grid">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
        ))}
      </div>
      <div className="absolute bottom-10 right-10 grid grid-cols-6 gap-2 opacity-30 pointer-events-none hidden sm:grid">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
        ))}
      </div>

      {/* Main Calibration Card */}
      <div className="w-full max-w-[560px] bg-white rounded-none p-8 sm:p-10 shadow-[0_20px_50px_rgba(79,70,229,0.06)] border border-slate-200 relative z-10 space-y-6">
        
        {/* Top Header Section */}
        <div className="text-center">
          {/* Badge Icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-none bg-[#F4EFFF] text-[#7C3AED] mx-auto shadow-xs border border-purple-100">
            <IconFileText className="h-7 w-7" />
          </div>

          <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#6366F1] mt-3.5">
            BACKGROUND & CREDENTIAL INTAKE
          </div>

          <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight mt-1">
            Prior Experience Calibration
          </h1>

          <p className="text-xs text-slate-400 font-normal leading-relaxed max-w-md mx-auto mt-2">
            Upload your resume or specify your background so AI credits existing masteries instead of starting from scratch.
          </p>
        </div>

        {/* Upload Resume Box */}
        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,text/plain,application/pdf"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            className="hidden"
            id="resume-file"
          />
          <label
            htmlFor="resume-file"
            className="block rounded-none border-2 border-dashed border-[#DDD6FE] bg-[#FAF8FF] hover:bg-[#F5F0FF] p-6 text-center transition-all cursor-pointer group"
          >
            <IconCloudUpload className="h-9 w-9 text-[#7C3AED] mx-auto mb-1.5 group-hover:scale-105 transition-transform" />
            <div className="text-xs font-bold text-slate-800">
              {fileName ? (
                <span className="text-[#7C3AED] flex items-center justify-center gap-1">
                  <IconCheck className="h-3.5 w-3.5 text-emerald-500" />
                  {fileName}
                </span>
              ) : (
                "Upload Resume (PDF / TXT)"
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Click to browse or drag & drop
            </div>
          </label>
        </div>

        {/* Structured Form Fields */}
        <div className="space-y-4">
          
          {/* Field 1: Current Role */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
              CURRENT ROLE / SPECIALIZATION <span className="text-rose-500 font-black">*</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-none bg-[#F5F3FF] text-[#7C3AED] shrink-0 border border-purple-100">
                <IconBriefcase className="h-5 w-5" />
              </div>
              <input
                type="text"
                required
                value={currentRole}
                onChange={(e) => {
                  setCurrentRole(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. Frontend Engineer"
                className={`w-full rounded-none border px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-2xs ${
                  hasAttemptedSubmit && !currentRole.trim()
                    ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    : "border-slate-200 bg-white focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                }`}
              />
            </div>
          </div>

          {/* Field 2: Career Objective */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
              CAREER OBJECTIVE <span className="text-rose-500 font-black">*</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-none bg-[#F5F3FF] text-[#7C3AED] shrink-0 border border-purple-100">
                <IconTarget className="h-5 w-5" />
              </div>
              <input
                type="text"
                required
                value={careerGoal}
                onChange={(e) => {
                  setCareerGoal(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. Senior Distributed AI Architect"
                className={`w-full rounded-none border px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-2xs ${
                  hasAttemptedSubmit && !careerGoal.trim()
                    ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    : "border-slate-200 bg-white focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                }`}
              />
            </div>
          </div>

          {/* Field 3: Years of Experience */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
              YEARS OF EXPERIENCE <span className="text-rose-500 font-black">*</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-none bg-[#F5F3FF] text-[#7C3AED] shrink-0 border border-purple-100">
                <IconCalendar className="h-5 w-5" />
              </div>
              <input
                type="number"
                min={0}
                required
                value={yearsExperience}
                onChange={(e) => {
                  setYearsExperience(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. 3"
                className={`w-full rounded-none border px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-2xs ${
                  hasAttemptedSubmit && !yearsExperience.trim()
                    ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    : "border-slate-200 bg-white focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                }`}
              />
            </div>
          </div>

        </div>

        {/* Error Notification */}
        {error && (
          <div className="rounded-none border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            disabled={submitting}
            onClick={submit}
            className="w-full py-3.5 rounded-none bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#A855F7] text-white text-xs font-bold shadow-md shadow-purple-500/20 hover:opacity-95 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{submitting ? "Analyzing Profile..." : "Analyze & Ingest Profile"}</span>
            <IconArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => router.push(next)}
            className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors text-center block mx-auto cursor-pointer"
          >
            Skip for now
          </button>
        </div>

      </div>
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
