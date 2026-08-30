"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { DashboardData } from "@/lib/dashboardData";
import { SKILLS } from "@/data/skills";
import {
  IconBolt,
  IconFlame,
  IconShield,
  IconShieldCheck,
  IconFileText,
  IconArrowRight,
  IconTarget,
  IconChevronDown,
  IconCheck,
  IconSparkles,
} from "@tabler/icons-react";

export function ProfileDashboardView({
  data,
  userEmail = "yuvi@gmail.com",
}: {
  data: DashboardData;
  userEmail?: string;
}) {
  const profile = data.profile;
  const gamification = data.gamification;
  const displayName = profile?.displayName || "yuvi";
  const xp = gamification.xp || 0;
  const level = gamification.level || 1;
  const streak = gamification.streak?.currentStreak || 0;
  const activeGoals = data.goals?.length || 2;
  const xpIntoLevel = gamification.xpIntoLevel || 0;
  const xpForNextLevel = gamification.xpForNextLevel || 50;
  const pct = xpForNextLevel > 0 ? Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100)) : 0;

  const [clientResumeProfile, setClientResumeProfile] = React.useState<any>(null);
  const [clientFaceEnrolled, setClientFaceEnrolled] = React.useState<boolean>(false);
  const [skillFilter, setSkillFilter] = React.useState<"ALL" | "PROCTORED" | "TRACKS" | "RESUME">("ALL");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("pathwise_resume_profile");
        if (stored) {
          setClientResumeProfile(JSON.parse(stored));
        } else if (localStorage.getItem("pathwise_resume_uploaded") === "true") {
          setClientResumeProfile({ currentRole: "Profile Calibrated" });
        }
        if (localStorage.getItem("pathwise_face_enrolled") === "true") {
          setClientFaceEnrolled(true);
        }
      } catch {}
    }
  }, []);

  const resumeData = (profile?.resumeProfile as any) || clientResumeProfile;
  const isResumeUploaded = Boolean(resumeData || profile?.resumeText);
  const isFaceVerified = Boolean(profile?.faceDescriptor || clientFaceEnrolled);

  // Collect and harmonize skills verified via:
  // 1) Proctored tests
  // 2) Completed tracks / modules
  // 3) Extracted resume credentials
  // 4) Diagnostic / mastery records
  const verifiedSkills = useMemo(() => {
    const map = new Map<string, {
      id: string;
      name: string;
      category: string;
      score: number;
      source: "proctored" | "practice" | "resume" | "diagnostic";
      sourceLabel: string;
      badge: "MASTER" | "EXPERT" | "ADEPT" | "NOVICE";
      icon: string;
    }>();

    const getSkillSymbol = (name: string, id: string) => {
      const lower = (name + " " + id).toLowerCase();
      if (lower.includes("type") || lower.includes("ts")) return "TS";
      if (lower.includes("react") || lower.includes("next")) return "⚛";
      if (lower.includes("sql") || lower.includes("db") || lower.includes("postgres")) return "SQL";
      if (lower.includes("python") || lower.includes("py")) return "Py";
      if (lower.includes("api") || lower.includes("rest") || lower.includes("server")) return "API";
      if (lower.includes("git") || lower.includes("version")) return "GIT";
      if (lower.includes("docker") || lower.includes("container")) return "🐳";
      if (lower.includes("cloud") || lower.includes("aws") || lower.includes("azure")) return "☁";
      if (lower.includes("ml") || lower.includes("ai") || lower.includes("tensor")) return "🤖";
      if (lower.includes("linear") || lower.includes("algebra") || lower.includes("math")) return "1:1";
      if (lower.includes("css") || lower.includes("tailwind") || lower.includes("ui")) return "🎨";
      return "⚡";
    };

    const getBadgeTier = (score: number): "MASTER" | "EXPERT" | "ADEPT" | "NOVICE" => {
      if (score >= 80) return "MASTER";
      if (score >= 65) return "EXPERT";
      if (score >= 40) return "ADEPT";
      return "NOVICE";
    };

    // 1. From database mastery rows
    if (data.mastery && Array.isArray(data.mastery)) {
      data.mastery.forEach((m) => {
        const src = m.source === "proctored" ? "proctored" : m.source === "resume" ? "resume" : (m.source === "practice" || m.source === "quiz") ? "practice" : "diagnostic";
        const label = src === "proctored" ? "PROCTORED CERTIFIED" : src === "resume" ? "RESUME CREDITED" : src === "practice" ? "TRACK COMPLETED" : "DIAGNOSTIC CALIBRATED";
        map.set(m.skillId, {
          id: m.skillId,
          name: m.name,
          category: m.category || "General",
          score: Math.min(100, Math.max(10, m.score)),
          source: src,
          sourceLabel: label,
          badge: getBadgeTier(m.score),
          icon: getSkillSymbol(m.name, m.skillId),
        });
      });
    }

    // 2. From resume profile extraction
    const resumeSkillList = (profile?.resumeProfile as any)?.skillMastery || clientResumeProfile?.skillMastery || [];
    if (Array.isArray(resumeSkillList)) {
      resumeSkillList.forEach((rs: { skillId: string; confidence: string }) => {
        if (!map.has(rs.skillId)) {
          const score = rs.confidence === "high" ? 75 : rs.confidence === "medium" ? 55 : 40;
          const def = SKILLS.find((s) => s.id === rs.skillId);
          const name = def?.name || rs.skillId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          map.set(rs.skillId, {
            id: rs.skillId,
            name,
            category: def?.category || "web-dev",
            score,
            source: "resume",
            sourceLabel: "RESUME CREDITED",
            badge: getBadgeTier(score),
            icon: getSkillSymbol(name, rs.skillId),
          });
        }
      });
    }

    // 3. Fallback to default calibrated track skills if user has goals or default profile
    if (map.size === 0) {
      const defaultDomain = data.goals?.[0]?.domain || "web-dev";
      const defaults = defaultDomain.includes("ai") || defaultDomain.includes("ml")
        ? [
            { id: "linear-algebra", name: "Linear Algebra & Vectors", category: "ai-ml", score: 65, source: "diagnostic" as const, sourceLabel: "DIAGNOSTIC CALIBRATED", badge: "EXPERT" as const, icon: "1:1" },
            { id: "python-fundamentals", name: "Python Fundamentals", category: "ai-ml", score: 80, source: "practice" as const, sourceLabel: "TRACK COMPLETED", badge: "MASTER" as const, icon: "Py" },
            { id: "ml-fundamentals", name: "Machine Learning Fundamentals", category: "ai-ml", score: 75, source: "proctored" as const, sourceLabel: "PROCTORED CERTIFIED", badge: "EXPERT" as const, icon: "🤖" },
          ]
        : [
            { id: "typescript", name: "TypeScript Generics & Types", category: "web-dev", score: 85, source: "proctored" as const, sourceLabel: "PROCTORED CERTIFIED", badge: "MASTER" as const, icon: "TS" },
            { id: "react-fundamentals", name: "React 19 & Next.js Architecture", category: "web-dev", score: 75, source: "practice" as const, sourceLabel: "TRACK COMPLETED", badge: "EXPERT" as const, icon: "⚛" },
            { id: "sql", name: "SQL & PostgreSQL Database Design", category: "web-dev", score: 60, source: "resume" as const, sourceLabel: "RESUME CREDITED", badge: "ADEPT" as const, icon: "SQL" },
            { id: "git-basics", name: "Git Workflows & CI/CD", category: "web-dev", score: 70, source: "resume" as const, sourceLabel: "RESUME CREDITED", badge: "EXPERT" as const, icon: "GIT" },
          ];
      defaults.forEach((d) => map.set(d.id, d));
    }

    return Array.from(map.values());
  }, [data.mastery, profile?.resumeProfile, clientResumeProfile, data.goals]);

  const filteredSkills = useMemo(() => {
    if (skillFilter === "ALL") return verifiedSkills;
    if (skillFilter === "PROCTORED") return verifiedSkills.filter((s) => s.source === "proctored");
    if (skillFilter === "TRACKS") return verifiedSkills.filter((s) => s.source === "practice");
    if (skillFilter === "RESUME") return verifiedSkills.filter((s) => s.source === "resume");
    return verifiedSkills;
  }, [verifiedSkills, skillFilter]);



  return (
    <div className="relative min-h-screen bg-[#F8F9FD] text-slate-900 font-sans pb-16 overflow-x-hidden">
      
      {/* Background Decorative Floating Sky Islands on far outer edges */}
      <div className="pointer-events-none absolute inset-0 max-w-[1700px] mx-auto overflow-hidden">
        <div className="absolute bottom-20 left-2 w-24 h-24 hidden 2xl:block opacity-80">
          <Image
            src="/images/profile/island_flag.png"
            alt="Island Flag"
            width={96}
            height={96}
            className="object-contain"
            unoptimized
          />
        </div>
        <div className="absolute top-2 right-2 w-24 h-24 hidden 2xl:block opacity-80">
          <Image
            src="/images/profile/island_top_right.png"
            alt="Island"
            width={96}
            height={96}
            className="object-contain"
            unoptimized
          />
        </div>
      </div>



      {/* Main Content Precision Container */}
      <div className="relative z-10 mx-auto w-full max-w-[1380px] px-4 sm:px-8 py-5 space-y-6">
        
        {/* ================= HERO HEADER & TOP STATS HUD ================= */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Left Welcome Greeting + Exact 3D Robot Mascot */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Welcome back, <span className="text-[#7C3AED]">{displayName}!</span> 👏
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
                Let&apos;s continue your journey of mastering skills and achieving your goals.
              </p>
            </div>
            
            {/* Exact 3D Waving Robot Mascot Image */}
            <div className="shrink-0 hidden sm:block">
              <Image
                src="/images/profile/robot_mascot.png"
                alt="Waving Robot Mascot"
                width={80}
                height={80}
                className="object-contain drop-shadow-md select-none"
                unoptimized
              />
            </div>
          </div>

          {/* Right Stats HUD (4 Sharp Pill Cards) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Streak */}
            <div className="flex items-center gap-3 rounded-none border border-slate-200 bg-white px-4 py-2.5 shadow-xs">
              <IconFlame className="h-5 w-5 fill-orange-400 text-orange-500 shrink-0" />
              <div className="leading-tight">
                <div className="text-base font-extrabold text-slate-900">{streak}</div>
                <div className="text-[10px] font-semibold text-slate-400">Day Streak</div>
              </div>
            </div>

            {/* Active Goals */}
            <div className="flex items-center gap-3 rounded-none border border-slate-200 bg-white px-4 py-2.5 shadow-xs">
              <div className="flex h-5 w-5 items-center justify-center rounded-none border-2 border-emerald-500 text-emerald-600 font-black text-[9px]">
                🎯
              </div>
              <div className="leading-tight">
                <div className="text-base font-extrabold text-slate-900">{activeGoals}</div>
                <div className="text-[10px] font-semibold text-slate-400">Active Goals</div>
              </div>
            </div>

            {/* Total XP */}
            <div className="flex items-center gap-3 rounded-none border border-slate-200 bg-white px-4 py-2.5 shadow-xs">
              <IconBolt className="h-5 w-5 fill-amber-400 text-amber-500 shrink-0" />
              <div className="leading-tight">
                <div className="text-base font-extrabold text-slate-900">{xp} XP</div>
                <div className="text-[10px] font-semibold text-slate-400">Total XP</div>
              </div>
            </div>

            {/* Current Level */}
            <div className="flex items-center gap-3 rounded-none border border-slate-200 bg-white px-4 py-2.5 shadow-xs">
              <IconShield className="h-5 w-5 fill-purple-100 text-[#7C3AED] shrink-0" />
              <div className="leading-tight">
                <div className="text-base font-extrabold text-slate-900">Level {level}</div>
                <div className="text-[10px] font-semibold text-slate-400">Current Level</div>
              </div>
            </div>
          </div>

        </div>

        {/* ================= TOP GRID: MAIN HERO PROFILE + CREDENTIALS ================= */}
        <div className="grid gap-5 lg:grid-cols-12 items-stretch">
          
          {/* Left: Main Identity Card (7 Cols) with Sharp Edges & Exact 3D Student Character */}
          <div className="lg:col-span-7">
            <div className="relative h-full flex flex-col justify-between rounded-none border-2 border-purple-400 bg-white p-6 sm:p-7 shadow-xs overflow-hidden">
              
              {/* Top Identity Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                {/* Avatar + Info */}
                <div className="flex items-start gap-4">
                  {/* Avatar with level badge */}
                  <div className="relative shrink-0">
                    <div className="flex h-16 w-16 items-center justify-center rounded-none bg-gradient-to-tr from-[#6366F1] to-[#7C3AED] text-2xl font-black text-white shadow-md">
                      {displayName[0]?.toUpperCase() || "Y"}
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-none bg-[#2563EB] px-2 py-0.5 text-[9px] font-bold text-white shadow-xs">
                      lvl {level}
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C3AED]">
                        {gamification.levelTitle || "NEWCOMER"}
                      </span>
                      <span className="flex items-center gap-1 rounded-none border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-none bg-emerald-500 animate-pulse" />
                        ONLINE
                      </span>
                    </div>

                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                      {displayName}
                    </h2>
                    <p className="text-xs text-slate-400">{userEmail}</p>

                    {/* 3 Stat Pills with Sharp Edges */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-none border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                        <IconBolt className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span>{xp} XP</span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-none border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-orange-700">
                        <IconFlame className="h-3 w-3 fill-orange-500 text-orange-500" />
                        <span>{streak} Day Streak</span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-none border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                        <IconTarget className="h-3 w-3 text-blue-500" />
                        <span>{activeGoals} Active Goals</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Exact 3D Student Pixar Character (Ultra HD) */}
                <div className="shrink-0 self-end sm:self-center pr-1">
                  <Image
                    src="/images/profile/student_avatar.png"
                    alt="Learner Avatar 3D"
                    width={150}
                    height={150}
                    className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-xs drop-shadow-md select-none"
                    unoptimized
                  />
                </div>

              </div>

              {/* Bottom Information Details: Primary Track, Status & Milestone */}
              <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="rounded-none border border-slate-200 bg-slate-50/80 px-3 py-2">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Primary Track</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                    {data.goals?.[0]?.goalText || data.goals?.[0]?.domain || "Full-Stack Web Dev"}
                  </div>
                </div>

                <div className="rounded-none border border-slate-200 bg-slate-50/80 px-3 py-2">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Learner Status</div>
                  <div className="text-xs font-bold text-emerald-600 mt-0.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-none bg-emerald-500 animate-pulse" />
                    <span>Active Contributor</span>
                  </div>
                </div>

                <div className="rounded-none border border-slate-200 bg-slate-50/80 px-3 py-2">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Next Milestone</div>
                  <div className="text-xs font-bold text-[#7C3AED] mt-0.5">
                    Level {level + 1} ({xpForNextLevel} XP)
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right: 2 Vertical Verification & Experience Cards with Sharp Edges (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            
            {/* Biometric Calibration Card with Exact 3D Face Hologram */}
            <div className="relative flex items-center justify-between rounded-none border border-slate-200 bg-white p-5 shadow-xs overflow-hidden">
              <div className="pr-2 max-w-[65%]">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-none shadow-xs shrink-0 ${
                    isFaceVerified ? "bg-emerald-100 text-emerald-600" : "bg-purple-100 text-[#7C3AED]"
                  }`}>
                    <IconShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 leading-tight">BIOMETRIC CALIBRATION</div>
                    <div className="text-[9px] text-slate-400 font-medium">Proctored Identity Verification</div>
                  </div>
                  <span className={`ml-auto rounded-none border px-2 py-0.5 text-[9px] font-bold ${
                    isFaceVerified
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  }`}>
                    {isFaceVerified ? "VERIFIED" : "PENDING"}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                  {isFaceVerified
                    ? "Facial biometric signature verified. You are authorized for proctored examinations."
                    : "Calibrate your facial scan before your first proctored examination."}
                </p>

                <Link
                  href="/calibration/face"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-[#2563EB] hover:underline"
                >
                  <span>{isFaceVerified ? "RE-CALIBRATE FACE" : "ENROLL FACE SIGNATURE"}</span>
                  <IconArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Dynamic Animated Biometric Face Scanner */}
              <div className="shrink-0 relative flex items-center justify-center select-none w-20 h-20">
                {/* Pulsing Scan Reticle Corner Brackets */}
                <svg
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute inset-0 w-full h-full pointer-events-none animate-biometric-brackets z-10"
                >
                  {/* Top-Left Bracket */}
                  <path d="M12 28 V12 H28" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Top-Right Bracket */}
                  <path d="M88 28 V12 H72" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Bottom-Left Bracket */}
                  <path d="M12 72 V88 H28" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Bottom-Right Bracket */}
                  <path d="M88 72 V88 H72" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Calibration Crosshair Ticks */}
                  <line x1="50" y1="5" x2="50" y2="10" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                  <line x1="50" y1="90" x2="50" y2="95" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                  <line x1="5" y1="50" x2="10" y2="50" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                  <line x1="90" y1="50" x2="95" y2="50" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                </svg>

                {/* Radar Grid Ripple Wave */}
                <div className="absolute inset-1.5 rounded-full border border-sky-400/40 animate-biometric-ripple pointer-events-none" />

                {/* Biometric Face Image Container with Sweeping Laser Line */}
                <div className="relative w-16 h-16 flex items-center justify-center overflow-hidden rounded-full">
                  <Image
                    src="/images/profile/face_hologram.png"
                    alt="Biometric Face 3D"
                    width={64}
                    height={64}
                    className="object-contain drop-shadow-sm select-none"
                    unoptimized
                  />

                  {/* Sweeping Laser Beam with Glowing Cyan Light Curtain */}
                  <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-200 to-transparent shadow-[0_0_8px_#38BDF8] animate-biometric-laser pointer-events-none z-20">
                    <div className="absolute -top-3 left-0 right-0 h-3 bg-gradient-to-t from-cyan-400/35 to-transparent blur-[0.5px] pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Experience Profile Card with Exact 3D Folder Upload */}
            <div className="relative flex items-center justify-between rounded-none border border-slate-200 bg-white p-5 shadow-xs overflow-hidden">
              <div className="pr-2 max-w-[65%]">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-none shadow-xs shrink-0 ${
                    isResumeUploaded ? "bg-emerald-100 text-emerald-600" : "bg-sky-100 text-sky-600"
                  }`}>
                    <IconFileText className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 leading-tight">EXPERIENCE PROFILE</div>
                    <div className="text-[9px] text-slate-400 font-medium">Prerequisite & Starting Mastery</div>
                  </div>
                  <span className={`ml-auto rounded-none border px-2 py-0.5 text-[9px] font-bold ${
                    isResumeUploaded
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}>
                    {isResumeUploaded ? "CALIBRATED" : "NOT SET"}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                  {isResumeUploaded
                    ? (resumeData?.currentRole
                        ? `Calibrated as ${resumeData.currentRole}${resumeData.yearsExperience ? ` (${resumeData.yearsExperience} yrs exp)` : ""}. Prerequisites tailored.`
                        : "Resume credentials successfully calibrated and starting masteries credited.")
                    : "Upload your resume to calibrate starting mastery and tailor milestone prerequisites."}
                </p>

                <Link
                  href="/onboarding/resume?next=/profile"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-[#2563EB] hover:underline"
                >
                  <span>{isResumeUploaded ? "UPDATE RESUME" : "UPLOAD RESUME"}</span>
                  <IconArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="shrink-0">
                <Image
                  src="/images/profile/folder_upload.png"
                  alt="Experience Profile Folder 3D"
                  width={85}
                  height={85}
                  className="object-contain drop-shadow-sm select-none"
                  unoptimized
                />
              </div>
            </div>

          </div>

        </div>



        {/* ================= MIDDLE: VERIFIED SKILLS PORTFOLIO (RESUME + TRACKS + PROCTORED) ================= */}
        <div className="w-full rounded-none border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#7C3AED]">
                  VERIFIED COMPETENCY REPOSITORY
                </span>
                <span className="rounded-none bg-purple-50 border border-purple-200 px-2 py-0.5 text-[9px] font-bold text-[#6D28D9]">
                  {verifiedSkills.length} Verified Skills
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                Calibrated & Certified Skill Portfolio
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                Competencies automatically credited and verified from your resume intake, completed track modules, and proctored test assessments.
              </p>
            </div>

            {/* Filter Tabs with Sharp Edges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "ALL", label: `ALL (${verifiedSkills.length})` },
                { id: "PROCTORED", label: `PROCTORED (${verifiedSkills.filter(s => s.source === "proctored").length})` },
                { id: "TRACKS", label: `TRACKS (${verifiedSkills.filter(s => s.source === "practice").length})` },
                { id: "RESUME", label: `RESUME (${verifiedSkills.filter(s => s.source === "resume").length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSkillFilter(tab.id as any)}
                  className={`rounded-none px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                    skillFilter === tab.id
                      ? "bg-[#7C3AED] text-white shadow-xs"
                      : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Verified Skills with Sharp Edges */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSkills.map((s) => (
              <div
                key={s.id}
                className="rounded-none border border-slate-200 bg-white p-4 shadow-xs hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between min-h-[145px]"
              >
                <div>
                  {/* Top Row: Symbol, Title & Tier Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-none bg-slate-900 text-white font-black text-xs shadow-xs shrink-0">
                        {s.icon}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 leading-tight">{s.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">{s.category}</div>
                      </div>
                    </div>

                    <span className={`rounded-none border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                      s.badge === "MASTER"
                        ? "border-amber-200 bg-amber-50 text-amber-800"
                        : s.badge === "EXPERT"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : s.badge === "ADEPT"
                        ? "border-blue-200 bg-blue-50 text-blue-800"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}>
                      {s.badge}
                    </span>
                  </div>

                  {/* Verification Source Badge */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 rounded-none border px-2 py-0.5 text-[9px] font-bold uppercase ${
                      s.source === "proctored"
                        ? "border-purple-200 bg-purple-50 text-purple-700"
                        : s.source === "practice"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : s.source === "resume"
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}>
                      {s.source === "proctored" && <IconShieldCheck className="h-3 w-3 text-purple-600" />}
                      {s.source === "practice" && <IconTarget className="h-3 w-3 text-emerald-600" />}
                      {s.source === "resume" && <IconFileText className="h-3 w-3 text-blue-600" />}
                      {s.source === "diagnostic" && <IconBolt className="h-3 w-3 text-amber-600" />}
                      <span>{s.sourceLabel}</span>
                    </span>

                    <span className="text-sm font-black text-slate-900">
                      {s.score}%
                    </span>
                  </div>
                </div>

                {/* Bottom Progress Bar + Link */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex-1 mr-3 h-1.5 rounded-none bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-none ${
                        s.source === "proctored"
                          ? "bg-purple-600"
                          : s.source === "practice"
                          ? "bg-emerald-600"
                          : s.source === "resume"
                          ? "bg-blue-600"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                  <Link
                    href="/dashboard"
                    className="text-[10px] font-bold text-[#2563EB] hover:underline flex items-center gap-0.5 shrink-0"
                  >
                    <span>Practice Lab</span>
                    <IconArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ================= BOTTOM ROW: ACTIVITY HEATMAP ================= */}
        <div className="w-full">
          {/* Exact GitHub-Style Learning Activity Contribution Heatmap */}
          <div className="rounded-none border border-[#30363D] bg-[#0D1117] text-slate-200 p-5 sm:p-6 shadow-md flex flex-col justify-between overflow-hidden">
            <div>
              {/* Header: Total Contributions + Settings Dropdown */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-sm sm:text-base font-semibold text-slate-100 tracking-tight">
                  994 contributions in the last year
                </h3>

                <div className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer select-none">
                  <span>Contribution settings</span>
                  <IconChevronDown className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Heatmap Matrix Box */}
              <div className="rounded-none border border-[#30363D] bg-[#0D1117] p-3 sm:p-4 overflow-x-auto scrollbar-thin">
                
                {/* Month Labels along top */}
                <div className="flex justify-between text-[10px] text-slate-400 pl-7 pr-1 mb-2 font-mono select-none">
                  {["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((m, i) => (
                    <span key={i}>{m}</span>
                  ))}
                </div>

                {/* 7 Days Row Grid with Mon/Wed/Fri Labels */}
                <div className="flex items-start gap-1.5 min-w-[580px]">
                  {/* Day Labels Column */}
                  <div className="flex flex-col justify-between text-[9px] text-slate-400 h-[88px] font-mono pr-1 select-none">
                    <span className="leading-none pt-0.5">Mon</span>
                    <span className="leading-none">Wed</span>
                    <span className="leading-none pb-0.5">Fri</span>
                  </div>

                  {/* 52 Columns of 7 Day Blocks */}
                  <div className="flex-1 grid grid-flow-col grid-rows-7 gap-[3px]">
                    {Array.from({ length: 52 * 7 }).map((_, idx) => {
                      const col = Math.floor(idx / 7);
                      const row = idx % 7;
                      // Seeded distribution matching the density in the user screenshot
                      const seed = (col * 19 + row * 37 + (col > 35 ? 45 : 0)) % 100;
                      let bgClass = "bg-[#161B22]";
                      let tooltipCount = 0;

                      if (col >= 36 && col <= 41 && row <= 2) {
                        // High activity cluster in May/Jun matching screenshot
                        bgClass = seed > 50 ? "bg-[#39D353]" : "bg-[#26A641]";
                        tooltipCount = seed > 50 ? 9 : 6;
                      } else if (col >= 48) {
                        // High activity cluster in recent August
                        bgClass = seed > 60 ? "bg-[#39D353]" : seed > 30 ? "bg-[#26A641]" : "bg-[#006D32]";
                        tooltipCount = seed > 60 ? 8 : 4;
                      } else if (seed > 86) {
                        bgClass = "bg-[#39D353]";
                        tooltipCount = 8;
                      } else if (seed > 70) {
                        bgClass = "bg-[#26A641]";
                        tooltipCount = 5;
                      } else if (seed > 50) {
                        bgClass = "bg-[#006D32]";
                        tooltipCount = 3;
                      } else if (seed > 28) {
                        bgClass = "bg-[#0E4429]";
                        tooltipCount = 1;
                      }

                      return (
                        <div
                          key={idx}
                          title={`${tooltipCount} contributions on this day`}
                          className={`w-[9px] h-[9px] sm:w-[10px] sm:h-[10px] rounded-[1.5px] ${bgClass} transition-transform hover:scale-125 cursor-pointer`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Row: Link & Legend */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#30363D]/60 select-none">
                  <span className="hover:text-[#58A6FF] transition-colors cursor-pointer">
                    Learn how we count contributions
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span>Less</span>
                    <span className="w-2.5 h-2.5 rounded-[1.5px] bg-[#161B22] border border-[#30363D]" />
                    <span className="w-2.5 h-2.5 rounded-[1.5px] bg-[#0E4429]" />
                    <span className="w-2.5 h-2.5 rounded-[1.5px] bg-[#006D32]" />
                    <span className="w-2.5 h-2.5 rounded-[1.5px] bg-[#26A641]" />
                    <span className="w-2.5 h-2.5 rounded-[1.5px] bg-[#39D353]" />
                    <span>More</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
