"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { DashboardData } from "@/lib/dashboardData";
import {
  IconBolt,
  IconFlame,
  IconShield,
  IconShieldCheck,
  IconFileText,
  IconArrowRight,
  IconTarget,
  IconSearch,
  IconSparkles,
  IconChevronDown,
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

  const [activeMatrixTab, setActiveMatrixTab] = useState<"proficiency" | "retention">("proficiency");
  const [filterTier, setFilterTier] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const skillCards = [
    {
      id: "linear-algebra",
      name: "Linear Algebra",
      symbol: "1:1",
      iconBg: "bg-emerald-500 text-white",
      badge: "NOVICE",
      score: 15,
      sparkColor: "#10B981",
      progressBg: "bg-emerald-500",
      points: "M0 18 L20 16 L40 20 L60 12 L80 16 L100 6",
    },
    {
      id: "calculus-basics",
      name: "Calculus Basics",
      symbol: "∫ dx",
      iconBg: "bg-blue-600 text-white",
      badge: "NOVICE",
      score: 15,
      sparkColor: "#3B82F6",
      progressBg: "bg-blue-600",
      points: "M0 19 L20 17 L40 20 L60 13 L80 15 L100 7",
    },
    {
      id: "python-programming",
      name: "Python Programming",
      symbol: "Py",
      iconBg: "bg-amber-400 text-amber-950 font-black",
      badge: "NOVICE",
      score: 10,
      sparkColor: "#F59E0B",
      progressBg: "bg-amber-500",
      points: "M0 20 L20 18 L40 21 L60 16 L80 18 L100 11",
    },
  ];

  const filteredSkills = skillCards.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterTier === "ALL" || s.badge === filterTier;
    return matchesSearch && matchesFilter;
  });

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

                {/* Exact 3D Student Pixar Character */}
                <div className="shrink-0 self-end sm:self-center pr-2">
                  <Image
                    src="/images/profile/student_avatar.png"
                    alt="Learner Avatar 3D"
                    width={130}
                    height={130}
                    className="object-contain drop-shadow-md select-none"
                    unoptimized
                  />
                </div>

              </div>

              {/* Bottom Progress Bar Row */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                  <span className="flex items-center gap-1.5 text-[#7C3AED]">
                    <IconSparkles className="h-3.5 w-3.5" />
                    Level {level} Calibration
                  </span>
                  <span className="text-slate-500">{pct}% to Level {level + 1}</span>
                </div>

                <div className="h-2.5 w-full rounded-none bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-none bg-gradient-to-r from-[#6366F1] to-[#7C3AED] transition-all duration-500"
                    style={{ width: `${Math.max(5, pct)}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Current Tier Mastery</span>
                  <span>{xpIntoLevel} / {xpForNextLevel} XP</span>
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-none bg-purple-100 text-[#7C3AED] shadow-xs shrink-0">
                    <IconShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 leading-tight">BIOMETRIC CALIBRATION</div>
                    <div className="text-[9px] text-slate-400 font-medium">Proctored Identity Verification</div>
                  </div>
                  <span className="ml-auto rounded-none border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700">
                    PENDING
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                  Calibrate your facial scan before your first proctored examination.
                </p>

                <Link
                  href="/calibration/face"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-[#2563EB] hover:underline"
                >
                  <span>ENROLL FACE SIGNATURE</span>
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-none bg-sky-100 text-sky-600 shadow-xs shrink-0">
                    <IconFileText className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 leading-tight">EXPERIENCE PROFILE</div>
                    <div className="text-[9px] text-slate-400 font-medium">Prerequisite & Starting Mastery</div>
                  </div>
                  <span className="ml-auto rounded-none border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                    NOT SET
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                  Upload your resume to calibrate starting mastery and tailor milestone prerequisites.
                </p>

                <Link
                  href="/onboarding/resume?next=/profile"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-[#2563EB] hover:underline"
                >
                  <span>UPLOAD RESUME</span>
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

        {/* ================= MIDDLE: SKILL PROFICIENCY MATRIX ================= */}
        <div className="rounded-none border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#7C3AED]">
                ALGORITHMIC MASTERY & MEMORY
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Skill Proficiency Matrix
              </h2>
            </div>

            {/* Right Mode Toggle Tabs with Sharp Edges */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveMatrixTab("proficiency")}
                className={`flex items-center gap-1.5 rounded-none px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  activeMatrixTab === "proficiency"
                    ? "bg-[#4338CA] text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <IconSparkles className="h-3.5 w-3.5" />
                <span>PROFICIENCY RATINGS (2)</span>
              </button>
              <button
                onClick={() => setActiveMatrixTab("retention")}
                className={`flex items-center gap-1.5 rounded-none px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeMatrixTab === "retention"
                    ? "bg-[#4338CA] text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>RETENTION & VITALITY (2)</span>
              </button>
            </div>
          </div>

          {/* Search Bar & Tier Filter Pills with Sharp Edges */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            <div className="relative w-full max-w-xs">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills by name..."
                className="w-full rounded-none border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#7C3AED] focus:bg-white focus:outline-none"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {["ALL", "MASTER", "EXPERT", "ADEPT", "NOVICE"].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setFilterTier(tier)}
                  className={`rounded-none px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                    filterTier === tier
                      ? "bg-[#7C3AED] text-white shadow-xs"
                      : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* 3 Skill Cards Grid with Sharp Edges */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSkills.map((s) => (
              <div
                key={s.id}
                className="rounded-none border border-slate-200 bg-white p-4 shadow-xs hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between min-h-[140px]"
              >
                <div>
                  {/* Top Row: Symbol Icon & Title & Novice Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-none ${s.iconBg} text-xs font-black shadow-xs shrink-0`}>
                        {s.symbol}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 leading-tight">{s.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Mastery Score</div>
                      </div>
                    </div>

                    <span className="rounded-none border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-500 uppercase">
                      {s.badge}
                    </span>
                  </div>

                  {/* Score & Sparkline Graph */}
                  <div className="mt-3 flex items-end justify-between">
                    <span className="text-lg font-black text-slate-900 leading-none">
                      {s.score}%
                    </span>

                    {/* Sparkline Graph Vector with dots */}
                    <svg viewBox="0 0 100 24" className="w-28 h-6 overflow-visible">
                      <path
                        d={s.points}
                        fill="none"
                        stroke={s.sparkColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle cx="20" cy="16" r="1.5" fill={s.sparkColor} />
                      <circle cx="40" cy="20" r="1.5" fill={s.sparkColor} />
                      <circle cx="60" cy="12" r="1.5" fill={s.sparkColor} />
                      <circle cx="80" cy="16" r="1.5" fill={s.sparkColor} />
                      <circle cx="100" cy="6" r="2.5" fill={s.sparkColor} />
                    </svg>
                  </div>
                </div>

                {/* Bottom Progress Bar */}
                <div className="mt-3 h-1.5 w-full rounded-none bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-none ${s.progressBg}`} style={{ width: `${s.score}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Explore All Skills Centered Button */}
          <div className="pt-2 flex justify-center">
            <Link
              href="/dashboard#skill-map"
              className="inline-flex items-center gap-1.5 rounded-none border border-slate-200 bg-white px-6 py-2 text-xs font-bold text-[#2563EB] shadow-xs hover:bg-slate-50 transition-all"
            >
              <span>Explore All Skills</span>
              <IconArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>

        {/* ================= BOTTOM ROW: ACTIVITY HEATMAP & AI PATH LOG ================= */}
        <div className="grid gap-5 lg:grid-cols-2">
          
          {/* Left: Exact GitHub-Style Learning Activity Contribution Heatmap */}
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

          {/* Right: AI Adaptive Path Log with Sharp Edges & Exact 3D Brain Mascot */}
          <div className="relative rounded-none border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-none bg-purple-100 text-[#7C3AED] shadow-xs shrink-0">
                    <IconSparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#7C3AED]">
                      DYNAMIC RECALIBRATION
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                      AI Adaptive Path Log
                    </h3>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="rounded-none border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
                >
                  View All
                </Link>
              </div>

              {/* Timeline Item */}
              <div className="relative pl-6 border-l-2 border-purple-200 mt-5 space-y-1">
                <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-none bg-[#7C3AED]" />
                <div className="text-[10px] font-bold text-slate-400">Today, 09:15 PM</div>
                <div className="text-xs font-bold text-[#7C3AED]">Welcome to QuestLearn!</div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                  Initial assessment completed. Starting adaptive journey...
                </p>
              </div>
            </div>

            {/* Exact 3D Purple Brain Mascot */}
            <div className="absolute right-4 bottom-3 pointer-events-none">
              <Image
                src="/images/profile/brain_mascot.png"
                alt="Brain Mascot 3D"
                width={72}
                height={72}
                className="object-contain drop-shadow-sm select-none"
                unoptimized
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
