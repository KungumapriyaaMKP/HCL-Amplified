"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IconCheck,
  IconLock,
  IconArrowRight,
  IconBell,
  IconLayersLinked,
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

  // If there are no modules yet, provide standard curriculum courses
  const courseList =
    sortedModules.length > 0
      ? sortedModules
      : [
          {
            module: {
              id: "mod_sql",
              order: 1,
              skillId: "sql",
              status: "completed",
              milestoneType: "foundation",
              rationale: "Master relational database fundamentals and schema modeling.",
            },
            resource: {
              id: "res_1",
              title: "SQL Fundamentals & Relational Modeling",
              provider: "Frontend Masters Path",
              url: "#",
              type: "course",
              description: "Learn database design, queries, and join operations.",
              estimatedMinutes: 180,
              difficulty: "beginner",
            },
            skill: { id: "sql", name: "SQL" },
          },
          {
            module: {
              id: "mod_css",
              order: 2,
              skillId: "css",
              status: "completed",
              milestoneType: "foundation",
              rationale: "Core CSS layout mechanics, flexbox, and responsive UI.",
            },
            resource: {
              id: "res_2",
              title: "CSS Mastery: Flexbox & Grid Systems",
              provider: "Frontend Masters Path",
              url: "#",
              type: "course",
              description: "Design responsive and accessible modern web interfaces.",
              estimatedMinutes: 180,
              difficulty: "beginner",
            },
            skill: { id: "css", name: "CSS" },
          },
          {
            module: {
              id: "mod_js",
              order: 3,
              skillId: "javascript",
              status: "in_progress",
              milestoneType: "core",
              rationale: "Complete core language mechanics, closures, and async DOM execution.",
            },
            resource: {
              id: "res_3",
              title: "JavaScript Fundamentals & ES6+",
              provider: "freeCodeCamp",
              url: "#",
              type: "course",
              description: "Master modern ECMAScript standards, promises, and async/await.",
              estimatedMinutes: 1500,
              difficulty: "intermediate",
            },
            skill: { id: "javascript", name: "JavaScript Fundamentals" },
          },
          {
            module: {
              id: "mod_react",
              order: 4,
              skillId: "react",
              status: "locked",
              milestoneType: "core",
              rationale: "State management, component lifecycles, and hook architectures.",
            },
            resource: {
              id: "res_4",
              title: "React & Next.js Modern Web Applications",
              provider: "Microsoft Learn",
              url: "#",
              type: "course",
              description: "Build scalable production React apps with server components.",
              estimatedMinutes: 360,
              difficulty: "intermediate",
            },
            skill: { id: "react", name: "React Component Architecture" },
          },
          {
            module: {
              id: "mod_node",
              order: 5,
              skillId: "node",
              status: "locked",
              milestoneType: "core",
              rationale: "Backend APIs, Express middleware, and database connectivity.",
            },
            resource: {
              id: "res_5",
              title: "Node.js & Backend Architecture",
              provider: "Coursera",
              url: "#",
              type: "course",
              description: "Build RESTful APIs and server-side services with Node.js.",
              estimatedMinutes: 300,
              difficulty: "intermediate",
            },
            skill: { id: "node", name: "Node.js & API Development" },
          },
        ];

  const completedCount = courseList.filter(
    (m) => m.module.status === "completed"
  ).length;
  const totalCount = courseList.length;

  // Find active module index (first in_progress or available, or first non-completed)
  let activeIdx = courseList.findIndex(
    (m) => m.module.status === "in_progress" || m.module.status === "available"
  );
  if (activeIdx === -1) {
    activeIdx = completedCount < totalCount ? completedCount : totalCount - 1;
  }

  // Pre-calculated S-Curve Coordinates for Perfect Alignment
  const nodeCoordinates = [
    { x: 190, y: 70 },   // Node 1
    { x: 150, y: 260 },  // Node 2
    { x: 135, y: 470 },  // Node 3 (Active)
    { x: 185, y: 680 },  // Node 4
    { x: 205, y: 880 },  // Node 5
    { x: 185, y: 1070 }, // Treasure Chest
  ];

  // Dynamic SVG path built from coordinates
  const svgPathD = `
    M 190 70
    C 190 165, 150 165, 150 260
    C 150 365, 135 365, 135 470
    C 135 575, 185 575, 185 680
    C 185 780, 205 780, 205 880
    C 205 975, 185 975, 185 1070
  `;

  const canvasHeight = 1180;

  return (
    <div className="relative w-full min-h-screen bg-[#FFF9F6] text-slate-900 font-sans flex flex-col items-center">
      {/* 1. Full Scenic Minimal Candy Landscape Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        style={{ minHeight: `${canvasHeight + 100}px` }}
      >
        <Image
          src="/images/journey/candy_clean_bg.jpg"
          alt="Candy Valley Background"
          fill
          unoptimized
          className="object-cover object-top opacity-95"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/30" />
      </div>

      {/* 2. Top Navigation Bar */}
      <header className="relative z-30 w-full max-w-6xl px-6 sm:px-12 py-4 flex items-center justify-between">
        <div className="space-y-0.5 drop-shadow-xs">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Your{" "}
            <span className="text-[#6D28D9]">Learning Journey</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium flex items-center gap-1.5">
            <span>Complete milestones, unlock rewards & level up your skills!</span>
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

      {/* 3. Main Stage: Centered S-Curved Candy Path + 3D Pedestals & Cards */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-8 py-4 flex justify-center">
        
        {/* Fixed Width Canvas for Absolute Mathematical Alignment */}
        <div
          className="relative w-[760px] pb-24 select-none"
          style={{ height: `${canvasHeight}px` }}
        >
          {/* SVG S-Curve Candy Cane Ribbon Road */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox={`0 0 760 ${canvasHeight}`}
            fill="none"
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
                <feDropShadow dx="0" dy="10" stdDeviation="6" floodColor="#78350F" floodOpacity="0.15" />
              </filter>
            </defs>

            {/* Road Outer Shadow Border */}
            <path
              d={svgPathD}
              stroke="#FDE68A"
              strokeWidth="48"
              strokeLinecap="round"
              fill="none"
              filter="url(#roadShadow)"
            />

            {/* Road Candy-Cane Border Strip */}
            <path
              d={svgPathD}
              stroke="url(#candyCanePattern)"
              strokeWidth="38"
              strokeLinecap="round"
              fill="none"
            />

            {/* Road Inner Smooth Path */}
            <path
              d={svgPathD}
              stroke="#FEF3C7"
              strokeWidth="26"
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          {/* Render 5 Course Nodes with Precise Coordinates */}
          {courseList.slice(0, 5).map((item, idx) => {
            const isCompleted = item.module.status === "completed" || idx < activeIdx;
            const isCurrent = idx === activeIdx;
            const isLocked = !isCompleted && !isCurrent;
            const stepNumber = idx + 1;
            
            const coords = nodeCoordinates[idx] || { x: 190, y: idx * 200 + 70 };
            
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
                ? "Complete previous modules to unlock this course."
                : "Master prerequisite competencies, code exercises, and knowledge checks.");

            return (
              <React.Fragment key={item.module.id || idx}>
                {/* 1. Pedestal Center Point (Anchored at exact X, Y) */}
                <div
                  className="absolute z-20"
                  style={{
                    left: `${coords.x}px`,
                    top: `${coords.y}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="relative flex flex-col items-center">
                    {/* Confetti on Completed Step */}
                    {isCompleted && (
                      <>
                        <div className="absolute -top-3 -left-3 text-sm animate-pulse">✨</div>
                        <div className="absolute -bottom-2 -right-2 text-sm animate-pulse">🎉</div>
                      </>
                    )}

                    {/* Radiant Aura on Active Current Step */}
                    {isCurrent && (
                      <div className="absolute -inset-6 rounded-full bg-purple-500/35 blur-xl animate-pulse" />
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
                      {/* Floating 3D Orb / Icon */}
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

                      {/* Step Number Tag on Pedestal Rim */}
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
                </div>

                {/* 2. Course Card (Anchored to the right of pedestal with exact vertical alignment) */}
                <div
                  className="absolute z-20"
                  style={{
                    left: `${coords.x + 65}px`,
                    top: `${coords.y}px`,
                    transform: "translateY(-50%)",
                    width: "480px",
                  }}
                >
                  {isCurrent ? (
                    /* Active Highlight Card with Directional Arrow */
                    <div className="relative bg-white/98 border-2 border-purple-400 rounded-3xl p-5 shadow-xl shadow-purple-500/15 backdrop-blur-md space-y-2.5">
                      {/* Left Pointing Directional Arrow */}
                      <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-[10px] border-r-purple-400" />

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

                      <div className="pt-1">
                        <Link
                          href={`/goals/${goalId}/modules/${item.module.id}`}
                          className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-purple-500/30 hover:opacity-95 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer group"
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
                      className="block bg-white/95 border border-slate-200/90 rounded-2xl p-4 shadow-md backdrop-blur-xs hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer group"
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
                    <div className="bg-white/92 border border-slate-200 rounded-2xl p-4 shadow-sm backdrop-blur-xs opacity-90">
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
              </React.Fragment>
            );
          })}

          {/* FINAL DESTINATION: 3D Golden Treasure Chest (Point 6) */}
          {(() => {
            const chestCoords = nodeCoordinates[5] || { x: 185, y: 1070 };
            return (
              <React.Fragment>
                {/* Chest Position (Anchored at exact X, Y) */}
                <div
                  className="absolute z-20"
                  style={{
                    left: `${chestCoords.x}px`,
                    top: `${chestCoords.y}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="relative flex flex-col items-center group cursor-pointer">
                    {/* Dynamic Radiant Golden Breathing Aura */}
                    <div className="absolute -inset-8 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 blur-2xl opacity-75 animate-pulse" />
                    <div className="absolute -inset-4 rounded-full bg-amber-300/60 blur-xl animate-pulse" />

                    {/* 3D Pedestal Base & Glowing Chest */}
                    <div className="relative flex flex-col items-center">
                      <div className="relative h-28 w-28 sm:h-32 sm:w-32 animate-pulse drop-shadow-[0_0_25px_rgba(245,158,11,0.95)] group-hover:scale-110 group-hover:drop-shadow-[0_0_40px_rgba(234,179,8,1)] transition-all duration-300">
                        <Image
                          src="/images/journey/treasure_transparent.png"
                          alt="Golden Treasure Chest"
                          fill
                          unoptimized
                          className="object-contain"
                        />
                      </div>
                      <div className="-mt-4 w-24 h-4 rounded-full bg-gradient-to-r from-purple-950 via-[#4C1D95] to-purple-950 border-2 border-amber-400/80 shadow-lg" />
                    </div>
                  </div>
                </div>

                {/* Mega Reward Card (Anchored to the right of chest) */}
                <div
                  className="absolute z-20"
                  style={{
                    left: `${chestCoords.x + 65}px`,
                    top: `${chestCoords.y}px`,
                    transform: "translateY(-50%)",
                    width: "480px",
                  }}
                >
                  <div className="bg-white/95 border-2 border-amber-300/80 rounded-3xl p-5 shadow-xl shadow-amber-500/15 backdrop-blur-md space-y-1.5 hover:shadow-2xl hover:border-amber-400 transition-all">
                    <div className="flex items-center gap-1.5 text-xs font-black text-purple-700 uppercase tracking-wide">
                      <span>💎</span>
                      <span>Capstone & Certification</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">
                      Complete all course modules to unlock your final Capstone Project and earn your Domain Mastery Certificate! 🎁
                    </p>
                  </div>
                </div>
              </React.Fragment>
            );
          })()}

        </div>
      </div>
    </div>
  );
}

export default JourneyMapView;
