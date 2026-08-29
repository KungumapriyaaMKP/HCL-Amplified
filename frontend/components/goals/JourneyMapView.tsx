"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IconCheck,
  IconLock,
  IconTarget,
  IconSparkles,
  IconArrowRight,
  IconBell,
  IconTrendingUp,
  IconGift,
  IconLayersLinked,
  IconBook,
  IconCode,
  IconAward,
} from "@tabler/icons-react";

export type JourneyModuleItem = {
  module: {
    id: string;
    pathId?: string;
    order: number;
    skillId: string;
    resourceId?: string;
    status: "completed" | "in_progress" | "available" | "locked" | string;
    milestoneType: string;
    rationale?: string;
    isProgramming?: boolean;
    programmingLanguage?: string | null;
  };
  resource?: {
    id: string;
    title: string;
    provider: string;
    url: string;
    type: string;
    description: string;
    estimatedMinutes: number;
    difficulty: string;
    rating?: number;
  } | null;
  skill?: {
    id: string;
    name: string;
    category?: string;
    description?: string;
  } | null;
};

interface JourneyMapViewProps {
  goalId: string;
  goalTitle: string;
  domainName: string;
  modules: JourneyModuleItem[];
  userDisplayName?: string;
}

export function JourneyMapView({
  goalId,
  goalTitle,
  domainName,
  modules,
  userDisplayName = "Yuvi",
}: JourneyMapViewProps) {
  // Sort modules by order
  const sortedModules = [...modules].sort(
    (a, b) => (a.module.order ?? 0) - (b.module.order ?? 0)
  );

  // If there are no modules yet, provide fallback courses
  const courseList = sortedModules.length > 0
    ? sortedModules
    : [
        {
          module: { id: "mod_sql", order: 1, skillId: "sql", status: "completed", milestoneType: "foundation", rationale: "Master relational database fundamentals and schema modeling." },
          resource: { id: "res_1", title: "SQL Fundamentals & Relational Modeling", provider: "Frontend Masters Path", url: "#", type: "course", description: "Learn database design, queries, and join operations.", estimatedMinutes: 180, difficulty: "beginner" },
          skill: { id: "sql", name: "SQL" },
        },
        {
          module: { id: "mod_css", order: 2, skillId: "css", status: "available", milestoneType: "foundation", rationale: "Core CSS layout mechanics, flexbox, and responsive UI." },
          resource: { id: "res_2", title: "CSS Mastery: Flexbox & Grid Systems", provider: "Frontend Masters Path", url: "#", type: "course", description: "Design responsive and accessible modern web interfaces.", estimatedMinutes: 180, difficulty: "beginner" },
          skill: { id: "css", name: "CSS" },
        },
        {
          module: { id: "mod_js", order: 3, skillId: "javascript", status: "locked", milestoneType: "core", rationale: "Core language mechanics, closures, and async DOM execution." },
          resource: { id: "res_3", title: "JavaScript Fundamentals & ES6+", provider: "freeCodeCamp", url: "#", type: "course", description: "Master modern ECMAScript standards, promises, and async/await.", estimatedMinutes: 1500, difficulty: "intermediate" },
          skill: { id: "javascript", name: "JavaScript Fundamentals" },
        },
        {
          module: { id: "mod_react", order: 4, skillId: "react", status: "locked", milestoneType: "core", rationale: "State management, component lifecycles, and hook architectures." },
          resource: { id: "res_4", title: "React & Next.js Modern Web Applications", provider: "Microsoft Learn", url: "#", type: "course", description: "Build scalable production React apps with server components.", estimatedMinutes: 360, difficulty: "intermediate" },
          skill: { id: "react", name: "React & Component Architecture" },
        },
      ];

  const completedCount = courseList.filter(
    (m) => m.module.status === "completed"
  ).length;
  const totalCount = courseList.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  // Find active module index (first in_progress or available, or first non-completed)
  let activeIdx = courseList.findIndex(
    (m) => m.module.status === "in_progress" || m.module.status === "available"
  );
  if (activeIdx === -1) {
    activeIdx = completedCount < totalCount ? completedCount : totalCount - 1;
  }

  const canvasHeight = Math.max(1080, courseList.length * 200 + 260);

  return (
    <div className="relative w-full min-h-screen bg-[#FFF9F6] text-slate-900 font-sans flex flex-col">
      {/* 1. Full Scenic Candy Landscape Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        style={{ minHeight: `${canvasHeight}px` }}
      >
        <Image
          src="/images/journey/candy_clean_bg.jpg"
          alt="Candy Valley Background"
          fill
          unoptimized
          className="object-cover object-top opacity-95"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/40" />
      </div>

      {/* 2. Top Navigation Bar */}
      <header className="relative z-30 w-full px-6 sm:px-12 py-4 flex items-center justify-between">
        <div className="space-y-0.5 drop-shadow-xs">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Your{" "}
            <span className="text-[#6D28D9]">Learning Journey</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium flex items-center gap-1.5">
            <span>Recommended roadmap & follow-up milestones for {goalTitle || domainName}!</span>
            <span className="text-amber-500">✨</span>
          </p>
        </div>

        {/* Top Right Badges & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 border border-amber-200/90 text-amber-800 text-xs font-black shadow-xs backdrop-blur-xs">
            <span className="text-sm">🪙</span>
            <span>320</span>
          </div>

          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 border border-purple-200/90 text-[#7C3AED] text-xs font-black shadow-xs backdrop-blur-xs">
            <span className="text-sm">💎</span>
            <span>15</span>
          </div>

          <Link
            href={`/goals/${goalId}/graph`}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-white/95 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-purple-50 hover:text-[#7C3AED] transition-all"
          >
            <IconLayersLinked className="h-4 w-4 text-[#7C3AED]" />
            <span>Skill Tree</span>
          </Link>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-100 bg-white/95 text-slate-600 hover:text-[#7C3AED] transition-colors shadow-xs"
            title="Notifications"
          >
            <IconBell className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1.5 pl-1 cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] text-white font-bold text-xs shadow-sm ring-2 ring-white">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-slate-500 font-bold">▾</span>
          </div>
        </div>
      </header>

      {/* 3. Main Stage: Dynamic S-Curved Road + Recommended Courses */}
      <div className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-2 flex flex-col items-center justify-center">
        
        {/* Center Canvas with Dynamic Course Nodes */}
        <div
          className="relative w-full max-w-[760px] pb-16"
          style={{ minHeight: `${canvasHeight}px` }}
        >
          {/* SVG S-Curve Candy Cane Ribbon Road */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox={`0 0 700 ${canvasHeight}`}
            fill="none"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern
                id="candyCanePattern"
                width="28"
                height="28"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width="14" height="28" fill="#FFFFFF" />
                <rect x="14" width="14" height="28" fill="#FB7185" />
              </pattern>

              <filter id="roadShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="12" stdDeviation="8" floodColor="#78350F" floodOpacity="0.18" />
              </filter>
            </defs>

            {/* Road Outer Shadow Border */}
            <path
              d={`M 290 80 C 210 180, 240 280, 280 380 C 320 480, 270 580, 300 680 C 330 780, 260 880, 300 ${canvasHeight - 120}`}
              stroke="#FDE68A"
              strokeWidth="52"
              strokeLinecap="round"
              fill="none"
              filter="url(#roadShadow)"
            />

            {/* Road Candy-Cane Border Strip */}
            <path
              d={`M 290 80 C 210 180, 240 280, 280 380 C 320 480, 270 580, 300 680 C 330 780, 260 880, 300 ${canvasHeight - 120}`}
              stroke="url(#candyCanePattern)"
              strokeWidth="42"
              strokeLinecap="round"
              fill="none"
            />

            {/* Road Inner Smooth Path */}
            <path
              d={`M 290 80 C 210 180, 240 280, 280 380 C 320 480, 270 580, 300 680 C 330 780, 260 880, 300 ${canvasHeight - 120}`}
              stroke="#FEF3C7"
              strokeWidth="30"
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          {/* Render Recommended Course Nodes */}
          {courseList.map((item, idx) => {
            const isCompleted = item.module.status === "completed" || idx < activeIdx;
            const isCurrent = idx === activeIdx;
            const isLocked = !isCompleted && !isCurrent;
            const stepNumber = idx + 1;
            
            // Format course metadata
            const skillName = item.skill?.name || item.resource?.title || `Module ${stepNumber}`;
            const provider = item.resource?.provider || "Recommended Course";
            const duration = item.resource?.estimatedMinutes
              ? item.resource.estimatedMinutes >= 60
                ? `~${Math.round(item.resource.estimatedMinutes / 60)}h`
                : `~${item.resource.estimatedMinutes}m`
              : "~2h";
            const rationale =
              item.module.rationale ||
              item.resource?.description ||
              (isLocked
                ? "Complete previous modules to unlock this course and its hands-on exercises."
                : "Master prerequisite competencies, code exercises, and knowledge checks.");

            const topPos = idx * 190 + 35;
            // Subtle S-curve offset for pedestals
            const leftOffsets = ["32%", "30%", "33%", "35%", "31%"];
            const leftPos = leftOffsets[idx % leftOffsets.length];

            return (
              <div
                key={item.module.id || idx}
                className="absolute flex items-center gap-6 z-10"
                style={{ top: `${topPos}px`, left: leftPos }}
              >
                {/* 3D Pedestal Node */}
                <div className="relative flex flex-col items-center">
                  {/* Confetti on Completed Step */}
                  {isCompleted && (
                    <>
                      <div className="absolute -top-3 -left-3 text-sm animate-pulse">✨</div>
                      <div className="absolute -bottom-2 -right-2 text-sm animate-pulse">🎉</div>
                    </>
                  )}

                  {/* Pulsing Aura on Active Current Step */}
                  {isCurrent && (
                    <div className="absolute -inset-5 rounded-full bg-purple-500/30 blur-xl animate-pulse" />
                  )}

                  {/* 3D Pedestal Body */}
                  <div
                    className={`relative flex flex-col items-center ${
                      isCompleted
                        ? "drop-shadow-[0_10px_18px_rgba(16,185,129,0.45)]"
                        : isCurrent
                        ? "drop-shadow-[0_16px_28px_rgba(124,58,237,0.55)]"
                        : "drop-shadow-[0_10px_18px_rgba(30,41,59,0.35)]"
                    }`}
                  >
                    {/* Floating Orb / Icon */}
                    <div
                      className={`flex items-center justify-center rounded-full border-4 transition-all ${
                        isCompleted
                          ? "h-16 w-16 sm:h-18 sm:w-18 bg-gradient-to-tr from-emerald-400 via-emerald-500 to-teal-400 border-white text-white shadow-lg ring-4 ring-emerald-200/50"
                          : isCurrent
                          ? "h-20 w-20 sm:h-24 sm:w-24 bg-gradient-to-tr from-[#6D28D9] via-[#8B5CF6] to-[#C084FC] border-white shadow-2xl ring-4 ring-purple-300"
                          : "h-16 w-16 sm:h-18 sm:w-18 bg-gradient-to-tr from-slate-600 to-slate-800 border-slate-400 text-slate-300 shadow-md"
                      }`}
                    >
                      {isCompleted ? (
                        <IconCheck className="h-9 w-9 stroke-[3]" />
                      ) : isCurrent ? (
                        <div className="relative flex items-center justify-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-white/90 bg-[#5B21B6]">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#7C3AED]">
                              <div className="h-4 w-4 rounded-full bg-[#7C3AED]" />
                            </div>
                          </div>
                          <div className="absolute -top-2 -right-2 text-xl drop-shadow-md transform -rotate-12">
                            🎯
                          </div>
                        </div>
                      ) : (
                        <IconLock className="h-8 w-8 text-slate-300" />
                      )}
                    </div>

                    {/* Step Number Tag */}
                    <div
                      className={`-mt-3 px-3.5 py-0.5 rounded-full text-[11px] font-black shadow-md ${
                        isCompleted
                          ? "bg-purple-900 border-2 border-purple-400 text-white"
                          : isCurrent
                          ? "bg-purple-950 border-2 border-purple-300 text-amber-300 ring-2 ring-purple-400"
                          : "bg-slate-900 border-2 border-slate-600 text-slate-400"
                      }`}
                    >
                      {stepNumber}
                    </div>
                  </div>
                </div>

                {/* Connected Course Card */}
                {isCurrent ? (
                  /* Active Highlight Card */
                  <div className="bg-white/98 border-2 border-purple-400 rounded-3xl p-5 shadow-xl shadow-purple-500/15 backdrop-blur-md max-w-xs sm:max-w-sm space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100/80 px-2.5 py-0.5 rounded-md">
                        COURSE · {provider} · {duration}
                      </span>
                      <span className="text-xs font-extrabold text-[#7C3AED]">In Progress</span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                      {skillName}
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {rationale}
                    </p>

                    <div className="pt-1.5">
                      <Link
                        href={`/goals/${goalId}/modules/${item.module.id}`}
                        className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-purple-500/30 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
                      >
                        <span>Continue Course</span>
                        <IconArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ) : isCompleted ? (
                  /* Completed Card */
                  <Link
                    href={`/goals/${goalId}/modules/${item.module.id}`}
                    className="bg-white/95 border border-slate-200/90 rounded-2xl p-4 shadow-md backdrop-blur-xs max-w-xs hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {provider} · {duration}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <IconCheck className="h-3 w-3 stroke-[3]" />
                        <span>Completed</span>
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {skillName}
                    </h3>
                  </Link>
                ) : (
                  /* Locked Card */
                  <div className="bg-white/92 border border-slate-200 rounded-2xl p-4 shadow-sm backdrop-blur-xs max-w-xs opacity-90">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {provider} · {duration}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <IconLock className="h-3 w-3" />
                        <span>Locked</span>
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-800">
                      {skillName}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-1">
                      {rationale}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {/* FINAL DESTINATION: 3D Golden Treasure Chest (Capstone & Reward) */}
          <div
            className="absolute flex items-center gap-6 z-10"
            style={{ top: `${courseList.length * 190 + 50}px`, left: "32%" }}
          >
            {/* 3D Treasure Chest */}
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 drop-shadow-[0_18px_30px_rgba(234,179,8,0.5)]">
              <Image
                src="/images/journey/treasure.jpg"
                alt="Treasure Chest"
                fill
                unoptimized
                className="object-contain rounded-2xl"
              />
            </div>

            {/* Mega Reward Card */}
            <div className="bg-white/95 border border-amber-200/90 rounded-2xl p-4 shadow-md backdrop-blur-xs max-w-xs">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-purple-700 uppercase tracking-wide">
                <span>💎</span>
                <span>Capstone & Certification</span>
              </div>
              <p className="mt-1 text-xs text-slate-600 leading-snug">
                Complete all course modules to unlock your final Capstone Project and earn your Domain Mastery Certificate! 🎁
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default JourneyMapView;
