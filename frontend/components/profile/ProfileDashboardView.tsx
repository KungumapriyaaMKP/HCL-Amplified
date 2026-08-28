"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { DashboardData } from "@/lib/dashboardData";
import {
  WavingRobotMascot,
  StudentAvatarIllustration,
  FaceHologramIllustration,
  FolderUploadIllustration,
  Calendar3DIllustration,
  CuteBrainMascotIllustration,
  FloatingSkyIsland,
} from "@/frontend/components/dashboard/Illustrations";
import {
  IconBolt,
  IconFlame,
  IconShield,
  IconShieldCheck,
  IconFileText,
  IconArrowRight,
  IconTarget,
  IconAward,
  IconSearch,
  IconSparkles,
  IconChevronDown,
  IconChartBar,
  IconBarbell,
  IconCode,
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
    },
    {
      id: "python-programming",
      name: "Python Programming",
      symbol: "Py",
      iconBg: "bg-amber-400 text-amber-950 font-bold",
      badge: "NOVICE",
      score: 10,
      sparkColor: "#F59E0B",
      progressBg: "bg-amber-500",
    },
  ];

  const filteredSkills = skillCards.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterTier === "ALL" || s.badge === filterTier;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-8 py-5 space-y-6">
      
      {/* Decorative Floating Sky Islands */}
      <FloatingSkyIsland className="top-2 -left-6 w-24 h-24 hidden xl:block" />
      <FloatingSkyIsland className="top-8 -right-6 w-28 h-28 hidden xl:block" />
      <FloatingSkyIsland className="bottom-24 -left-10 w-32 h-32 hidden xl:block" />

      {/* Left-Hand Vertical Floating Quick-Action Pill Menu */}
      <div className="fixed left-3 top-1/2 -translate-y-1/2 z-30 hidden 2xl:flex flex-col items-center gap-3 rounded-full border border-slate-200/90 bg-white/90 p-2 shadow-lg backdrop-blur-md">
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-[#7C3AED] hover:bg-purple-100 transition-colors shadow-xs" title="Goals">
          <IconTarget className="h-5 w-5" />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors" title="Proficiency">
          <IconChartBar className="h-5 w-5" />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors" title="Practice">
          <IconBarbell className="h-5 w-5" />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors" title="Achievements">
          <IconAward className="h-5 w-5" />
        </button>
      </div>

      {/* ================= HERO HEADER & TOP STATS HUD ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* Left Welcome Greeting */}
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#7C3AED]">
              LEARNER IDENTITY & ANALYTICS
            </div>
            <h1 className="mt-0.5 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Welcome back, <span className="text-[#7C3AED]">{displayName}!</span> 👏
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
              Let&apos;s continue your journey of mastering skills and achieving your goals.
            </p>
          </div>
          
          {/* Mascot in Header */}
          <WavingRobotMascot className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 hidden sm:block" />
        </div>

        {/* Right Stats HUD (4 White Pill Cards) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Streak */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 shadow-xs">
            <IconFlame className="h-5 w-5 fill-orange-400 text-orange-500 shrink-0" />
            <div className="leading-tight">
              <div className="text-sm sm:text-base font-extrabold text-slate-900">{streak}</div>
              <div className="text-[10px] font-semibold text-slate-400">Day Streak</div>
            </div>
          </div>

          {/* Active Goals */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 shadow-xs">
            <IconTarget className="h-5 w-5 text-emerald-500 shrink-0" />
            <div className="leading-tight">
              <div className="text-sm sm:text-base font-extrabold text-slate-900">{activeGoals}</div>
              <div className="text-[10px] font-semibold text-slate-400">Active Goals</div>
            </div>
          </div>

          {/* Total XP */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 shadow-xs">
            <IconBolt className="h-5 w-5 fill-amber-400 text-amber-500 shrink-0" />
            <div className="leading-tight">
              <div className="text-sm sm:text-base font-extrabold text-slate-900">{xp} XP</div>
              <div className="text-[10px] font-semibold text-slate-400">Total XP</div>
            </div>
          </div>

          {/* Current Level */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 shadow-xs">
            <IconShield className="h-5 w-5 fill-purple-100 text-[#7C3AED] shrink-0" />
            <div className="leading-tight">
              <div className="text-sm sm:text-base font-extrabold text-slate-900">Level {level}</div>
              <div className="text-[10px] font-semibold text-slate-400">Current Level</div>
            </div>
          </div>
        </div>

      </div>

      {/* ================= TOP GRID: MAIN HERO PROFILE + CREDENTIALS ================= */}
      <div className="grid gap-5 lg:grid-cols-12 items-stretch">
        
        {/* Left: Main Identity Card (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="electric-glow-border relative h-full flex flex-col justify-between rounded-2xl bg-white p-6 sm:p-7 shadow-xs overflow-hidden">
            
            {/* Top Identity Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              
              {/* Avatar + Info */}
              <div className="flex items-start gap-4">
                {/* Avatar with level badge */}
                <div className="relative">
                  <div className="flex h-18 w-18 items-center justify-center rounded-full bg-gradient-to-tr from-[#6366F1] to-[#7C3AED] text-2xl font-black text-white shadow-md">
                    {displayName[0]?.toUpperCase() || "Y"}
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-[#2563EB] px-2 py-0.5 text-[9px] font-bold text-white shadow-xs">
                    lvl {level}
                  </div>
                </div>

                {/* Profile Details */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C3AED]">
                      {gamification.levelTitle || "NEWCOMER"}
                    </span>
                    <span className="flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ONLINE
                    </span>
                  </div>

                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                    {displayName}
                  </h2>
                  <p className="text-xs text-slate-400">{userEmail}</p>

                  {/* 3 Stat Pills */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                      <IconBolt className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span>{xp} XP</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-orange-700">
                      <IconFlame className="h-3 w-3 fill-orange-500 text-orange-500" />
                      <span>{streak} Day Streak</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                      <IconTarget className="h-3 w-3 text-blue-500" />
                      <span>{activeGoals} Active Goals</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 3D Student Anime Avatar Graphic */}
              <div className="shrink-0 self-end sm:self-center">
                <StudentAvatarIllustration className="w-28 h-28 sm:w-32 sm:h-32" />
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

              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6366F1] to-[#7C3AED] transition-all duration-500"
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

        {/* Right: 2 Vertical Verification & Experience Cards (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          
          {/* Biometric Calibration Card */}
          <div className="relative flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs overflow-hidden">
            <div className="pr-2 max-w-[65%]">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-[#7C3AED] shadow-xs shrink-0">
                  <IconShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900 leading-tight">BIOMETRIC CALIBRATION</div>
                  <div className="text-[9px] text-slate-400 font-medium">Proctored Identity Verification</div>
                </div>
                <span className="ml-auto rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700">
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

            <FaceHologramIllustration className="w-22 h-22 shrink-0" />
          </div>

          {/* Experience Profile Card */}
          <div className="relative flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs overflow-hidden">
            <div className="pr-2 max-w-[65%]">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-600 shadow-xs shrink-0">
                  <IconFileText className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900 leading-tight">EXPERIENCE PROFILE</div>
                  <div className="text-[9px] text-slate-400 font-medium">Prerequisite & Starting Mastery</div>
                </div>
                <span className="ml-auto rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                  NOT SET
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                Upload your resume to calibrate starting mastery and tailor milestone prerequisites.
              </p>

              <Link
                href="/profile#resume"
                className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-[#2563EB] hover:underline"
              >
                <span>UPLOAD RESUME</span>
                <IconArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <FolderUploadIllustration className="w-22 h-22 shrink-0" />
          </div>

        </div>

      </div>

      {/* ================= MIDDLE: SKILL PROFICIENCY MATRIX ================= */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
        
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

          {/* Right Mode Toggle Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMatrixTab("proficiency")}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer ${
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
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeMatrixTab === "retention"
                  ? "bg-[#4338CA] text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>RETENTION & VITALITY (2)</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Tier Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <div className="relative w-full max-w-xs">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills by name..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#7C3AED] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["ALL", "MASTER", "EXPERT", "ADEPT", "NOVICE"].map((tier) => (
              <button
                key={tier}
                onClick={() => setFilterTier(tier)}
                className={`rounded-md px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
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

        {/* 3 Skill Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSkills.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between min-h-[140px]"
            >
              <div>
                {/* Top Row: Symbol Icon & Title & Novice Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.iconBg} text-xs font-extrabold shadow-xs shrink-0`}>
                      {s.symbol}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 leading-tight">{s.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Mastery Score</div>
                    </div>
                  </div>

                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-500 uppercase">
                    {s.badge}
                  </span>
                </div>

                {/* Score & Sparkline Graph */}
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-lg font-black text-slate-900 leading-none">
                    {s.score}%
                  </span>

                  {/* Sparkline Graph Vector */}
                  <svg viewBox="0 0 100 24" className="w-24 h-6 overflow-visible">
                    <path
                      d="M0 20 L20 18 L40 22 L60 14 L80 18 L100 8"
                      fill="none"
                      stroke={s.sparkColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="100" cy="8" r="2.5" fill={s.sparkColor} />
                  </svg>
                </div>
              </div>

              {/* Bottom Progress Bar */}
              <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full rounded-full ${s.progressBg}`} style={{ width: `${s.score}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Explore All Skills Centered Button */}
        <div className="pt-2 flex justify-center">
          <Link
            href="/dashboard#skill-map"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-6 py-2 text-xs font-bold text-[#2563EB] shadow-xs hover:bg-slate-50 transition-all"
          >
            <span>Explore All Skills</span>
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>

      {/* ================= BOTTOM ROW: ACTIVITY HEATMAP & AI PATH LOG ================= */}
      <div className="grid gap-5 lg:grid-cols-2">
        
        {/* Left: Learning Activity Heatmap */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <Calendar3DIllustration className="w-10 h-10 shrink-0" />
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#7C3AED]">
                    VELOCITY & FREQUENCY
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    Learning Activity Heatmap
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-xs cursor-pointer">
                <span>This Week</span>
                <IconChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            {/* Weekday Block Matrix */}
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-400 mt-5">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                <div key={day} className="space-y-1.5">
                  <span>{day}</span>
                  <div
                    className={`h-9 w-full rounded-md transition-all ${
                      i === 4
                        ? "bg-[#2563EB]"
                        : i === 3
                        ? "bg-[#60A5FA]"
                        : i === 2
                        ? "bg-[#93C5FD]"
                        : "bg-slate-100"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Less / More Legend */}
          <div className="mt-5 flex items-center justify-end gap-1.5 text-[10px] font-semibold text-slate-400">
            <span>Less</span>
            <span className="h-2.5 w-2.5 rounded-xs bg-slate-100" />
            <span className="h-2.5 w-2.5 rounded-xs bg-[#BFDBFE]" />
            <span className="h-2.5 w-2.5 rounded-xs bg-[#60A5FA]" />
            <span className="h-2.5 w-2.5 rounded-xs bg-[#2563EB]" />
            <span>More</span>
          </div>
        </div>

        {/* Right: AI Adaptive Path Log */}
        <div className="relative rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-[#7C3AED] shadow-xs shrink-0">
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
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                View All
              </Link>
            </div>

            {/* Timeline Item */}
            <div className="relative pl-6 border-l-2 border-purple-200 mt-5 space-y-1">
              <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-[#7C3AED]" />
              <div className="text-[10px] font-bold text-slate-400">Today, 09:15 PM</div>
              <div className="text-xs font-bold text-[#7C3AED]">Welcome to QuestLearn!</div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                Initial assessment completed. Starting adaptive journey...
              </p>
            </div>
          </div>

          {/* Cute 3D Purple Brain Mascot sitting at bottom right */}
          <div className="absolute right-4 bottom-3 pointer-events-none">
            <CuteBrainMascotIllustration className="w-22 h-22" />
          </div>
        </div>

      </div>

    </div>
  );
}
