"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";

export function InteractiveSkillMapTree() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div id="skill-map" className="rounded-lg border border-slate-200/80 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-slate-900">Your Skill Map</h3>
        <Link
          href="/dashboard#skill-map"
          className="flex items-center gap-1 text-xs font-bold text-[#6D28D9] hover:underline"
        >
          <span>Explore full map</span>
          <IconChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 100% Seamlessly Connected SVG Skill Map Graph */}
      <div className="relative w-full overflow-x-auto my-2">
        <svg
          viewBox="0 0 660 170"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto min-w-[620px] select-none"
        >
          <defs>
            <linearGradient id="calc-glow" x1="270" y1="50" x2="330" y2="110" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F5F3FF" />
              <stop offset="100%" stopColor="#EDE9FE" />
            </linearGradient>
            <filter id="hub-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#7C3AED" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* ==================== 1. CONNECTOR PATHS (Continuous & Seamless) ==================== */}
          {/* Connector: Foundations (70,80) -> Algebra (150,80) */}
          <line
            x1="70"
            y1="80"
            x2="150"
            y2="80"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Connector: Algebra (190,80) -> Calculus Basics (274,80) */}
          <line
            x1="190"
            y1="80"
            x2="274"
            y2="80"
            stroke="#8B5CF6"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Curved Branch: Calculus Basics (326,80) -> Differentiation (430,42) */}
          <path
            d="M 326 80 C 365 80, 395 42, 430 42"
            stroke="#8B5CF6"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            strokeLinecap="round"
            fill="none"
          />

          {/* Curved Branch: Calculus Basics (326,80) -> Limits (430,118) */}
          <path
            d="M 326 80 C 365 80, 395 118, 430 118"
            stroke="#CBD5E1"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Connector: Differentiation (470,42) -> Integration (570,42) */}
          <line
            x1="470"
            y1="42"
            x2="570"
            y2="42"
            stroke="#CBD5E1"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Connector: Limits (470,118) -> Applications (570,118) */}
          <line
            x1="470"
            y1="118"
            x2="570"
            y2="118"
            stroke="#CBD5E1"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* ==================== 2. NODES ==================== */}

          {/* Node 1: Foundations (cx=50, cy=80, r=20) */}
          <g
            className="cursor-pointer transition-transform"
            onMouseEnter={() => setHoveredNode("foundations")}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <circle cx="50" cy="80" r="20" fill="#ECFDF5" stroke="#10B981" strokeWidth="2.5" />
            <path d="M 43 80 L 48 85 L 58 74" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <text x="50" y="116" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="500" fontFamily="Plus Jakarta Sans, sans-serif">
              Foundations
            </text>
          </g>

          {/* Node 2: Algebra (cx=170, cy=80, r=20) */}
          <g
            className="cursor-pointer transition-transform"
            onMouseEnter={() => setHoveredNode("algebra")}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <circle cx="170" cy="80" r="20" fill="#ECFDF5" stroke="#10B981" strokeWidth="2.5" />
            <path d="M 163 80 L 168 85 L 178 74" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <text x="170" y="116" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="500" fontFamily="Plus Jakarta Sans, sans-serif">
              Algebra
            </text>
          </g>

          {/* Node 3: Calculus Basics (Center Hub, cx=300, cy=80, r=26) */}
          <g
            className="cursor-pointer"
            filter="url(#hub-shadow)"
            onMouseEnter={() => setHoveredNode("calculus")}
            onMouseLeave={() => setHoveredNode(null)}
          >
            {/* Outer Aura Ring */}
            <circle cx="300" cy="80" r="32" fill="#EDE9FE" fillOpacity="0.6" />
            {/* Main Hub Body */}
            <circle cx="300" cy="80" r="26" fill="url(#calc-glow)" stroke="#7C3AED" strokeWidth="3" />
            {/* Integral Symbol ∫ */}
            <text x="300" y="88" textAnchor="middle" fill="#7C3AED" fontSize="22" fontWeight="700" fontStyle="italic" fontFamily="Georgia, serif">
              ∫
            </text>
            <text x="300" y="128" textAnchor="middle" fill="#0F172A" fontSize="12" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">
              Calculus Basics
            </text>
          </g>

          {/* Node 4a: Differentiation (Upper Branch, cx=450, cy=42, r=20) */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredNode("diff")}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <circle cx="450" cy="42" r="20" fill="#FAF5FF" stroke="#A855F7" strokeWidth="2.5" />
            {/* ∂/∂x Math Symbol */}
            <text x="450" y="47" textAnchor="middle" fill="#7E22CE" fontSize="13" fontWeight="700" fontFamily="Georgia, serif">
              ∂/∂x
            </text>
            {/* Green Completed Mini Badge */}
            <circle cx="465" cy="27" r="7.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
            <path d="M 462 27 L 464.5 29.5 L 468 25" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <text x="450" y="74" textAnchor="middle" fill="#0F172A" fontSize="11" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
              Differentiation
            </text>
          </g>

          {/* Node 4b: Limits (Lower Branch, cx=450, cy=118, r=20) */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredNode("limits")}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <circle cx="450" cy="118" r="20" fill="#ECFDF5" stroke="#10B981" strokeWidth="2.5" />
            {/* Green Lock Icon */}
            <g transform="translate(444, 111) scale(0.9)">
              <rect x="1" y="5" width="10" height="8" rx="1.5" fill="#059669" />
              <path d="M3 5 V3 C3 1.5 9 1.5 9 3 V5" stroke="#059669" strokeWidth="1.8" fill="none" />
            </g>
            {/* Green Completed Mini Badge */}
            <circle cx="465" cy="103" r="7.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
            <path d="M 462 103 L 464.5 105.5 L 468 101" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <text x="450" y="150" textAnchor="middle" fill="#0F172A" fontSize="11" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
              Limits
            </text>
          </g>

          {/* Node 5a: Integration (Upper End, cx=590, cy=42, r=20) */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredNode("integration")}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <circle cx="590" cy="42" r="20" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
            {/* Gray Lock Icon */}
            <g transform="translate(584, 35) scale(0.9)">
              <rect x="1" y="5" width="10" height="8" rx="1.5" fill="#94A3B8" />
              <path d="M3 5 V3 C3 1.5 9 1.5 9 3 V5" stroke="#94A3B8" strokeWidth="1.8" fill="none" />
            </g>
            <text x="590" y="74" textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="500" fontFamily="Plus Jakarta Sans, sans-serif">
              Integration
            </text>
          </g>

          {/* Node 5b: Applications (Lower End, cx=590, cy=118, r=20) */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredNode("apps")}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <circle cx="590" cy="118" r="20" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
            {/* Gray Lock Icon */}
            <g transform="translate(584, 111) scale(0.9)">
              <rect x="1" y="5" width="10" height="8" rx="1.5" fill="#94A3B8" />
              <path d="M3 5 V3 C3 1.5 9 1.5 9 3 V5" stroke="#94A3B8" strokeWidth="1.8" fill="none" />
            </g>
            <text x="590" y="150" textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="500" fontFamily="Plus Jakarta Sans, sans-serif">
              Applications
            </text>
          </g>

        </svg>
      </div>

      {/* Legend Footer */}
      <div className="mt-2 flex flex-wrap items-center justify-start gap-5 border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#7C3AED]" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-slate-300" />
          <span>Locked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-slate-100 border border-slate-300" />
          <span>Available</span>
        </div>
      </div>
    </div>
  );
}
