"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PracticeQuiz } from "@/frontend/components/goals/PracticeQuiz";
import { FocusTimer } from "@/frontend/components/goals/FocusTimer";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconExternalLink,
  IconLock,
  IconAward,
  IconTarget,
} from "@tabler/icons-react";

type Props = {
  goalId: string;
  moduleId: string;
  skillName: string;
  resourceTitle: string;
  resourceUrl: string;
  resourceType: string;
  resourceProvider: string;
  estimatedMinutes: number;
  rationale: string;
  isProgramming: boolean;
  programmingLanguage: string | null;
  hasResourceDone: boolean;
  hasPracticeAttempt: boolean;
  proctoredAlreadyTaken: boolean;
  proctoredScore: number | null;
  proctoredReport: string | null;
};

export function ModuleWorkspace(props: Props) {
  const [resourceMarked, setResourceMarked] = useState(props.hasResourceDone);
  const [practiceAttempted, setPracticeAttempted] = useState(props.hasPracticeAttempt);
  const [feedbackSent, setFeedbackSent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function postProgress(body: Record<string, unknown>) {
    setBusy(true);
    try {
      await fetch(`/api/modules/${props.moduleId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } finally {
      setBusy(false);
    }
  }

  async function trackEvent(body: { eventType: string; modality?: string; timeSpentSeconds?: number }) {
    try {
      await fetch(`/api/modules/${props.moduleId}/track-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      // Non-blocking telemetry
    }
  }

  const hoursEst = Math.max(1, Math.round(props.estimatedMinutes / 60));

  return (
    <div className="relative w-full min-h-screen py-6 px-4 sm:px-6 flex flex-col items-center select-none font-sans">
      
      {/* Background Soft Studio Ambient Image Overlay strictly scoped to content area */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <Image
          src="/images/journey/study_desk_bg.jpg"
          alt="Study Desk Studio"
          fill
          unoptimized
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8FC]/70 via-[#FAF8FC]/50 to-[#FAF8FC]/80" />
      </div>

      <div className="relative z-10 w-full max-w-5xl space-y-5">
        
        {/* Top Back Navigation Link & Focus Timer */}
        <div className="flex items-center justify-between">
          <Link
            href={`/goals/${props.goalId}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors group"
          >
            <IconArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Roadmap</span>
          </Link>
          <FocusTimer moduleId={props.moduleId} skillName={props.skillName} compact />
        </div>

        {/* Main 2-Column Stage (Left 3D Stepper Trail + Right Cards) */}
        <div className="relative grid grid-cols-1 md:grid-cols-[130px_1fr] gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* 1. LEFT 3D STEPPER TRAIL (Exact 3D Vector Geometry matching Image 1)       */}
          {/* ========================================================================= */}
          <div className="relative flex flex-col items-center pt-1">
            
            {/* SVG Defs for 3D Gradients & Filters */}
            <svg className="absolute w-0 h-0 pointer-events-none">
              <defs>
                <linearGradient id="purpleShieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="50%" stopColor="#6D28D9" />
                  <stop offset="100%" stopColor="#4C1D95" />
                </linearGradient>

                <linearGradient id="silverShieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#CBD5E1" />
                  <stop offset="50%" stopColor="#64748B" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>

                <linearGradient id="purplePedestalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#2E1065" />
                </linearGradient>

                <linearGradient id="silverPedestalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#64748B" />
                  <stop offset="100%" stopColor="#1E293B" />
                </linearGradient>

                <linearGradient id="emeraldShieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="50%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>

                <linearGradient id="emeraldPedestalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#064E3B" />
                </linearGradient>

                <filter id="auraGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                <filter id="stepperShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#4C1D95" floodOpacity="0.35" />
                </filter>
              </defs>
            </svg>

            {/* STEP 01: 3D Hexagonal Purple Pedestal with Flag */}
            <div className="relative flex flex-col items-center z-20 group">
              <svg width="110" height="135" viewBox="0 0 110 135" fill="none" className="overflow-visible">
                {/* Authentic 3D Planted Flagpole & Waving Purple Pennant Flag */}
                <g filter="url(#stepperShadow)">
                  {/* Flagpole planted into pedestal base */}
                  <line x1="78" y1="98" x2="86" y2="-16" stroke="#4C1D95" strokeWidth="3" strokeLinecap="round" />
                  <line x1="77.5" y1="98" x2="85.5" y2="-16" stroke="#DDD6FE" strokeWidth="1" opacity="0.6" strokeLinecap="round" />
                  
                  {/* Sphere Finial Ball on Top */}
                  <circle cx="86" cy="-16" r="4.5" fill="#6D28D9" stroke="#E9D5FF" strokeWidth="1.5" />
                  <circle cx="84.5" cy="-17.5" r="1.2" fill="#FFFFFF" />

                  {/* 3D Waving Swallowtail Pennant Flag */}
                  <path
                    d="M 86 -13 C 98 -16, 106 -10, 118 -14 L 111 -3 L 118 8 C 106 4, 98 10, 86 6 Z"
                    fill="url(#purpleShieldGrad)"
                    stroke="#C4B5FD"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  {/* Flag Fabric Wave Fold Shadow */}
                  <path
                    d="M 100 -12 C 106 -9, 107 -4, 100 0 C 106 3, 107 8, 100 8"
                    stroke="#3B0764"
                    strokeWidth="1.5"
                    opacity="0.4"
                    fill="none"
                  />
                </g>

                {/* Pedestal Ambient Light Aura */}
                <ellipse cx="55" cy="108" rx="46" ry="16" fill="#A855F7" opacity="0.35" filter="url(#auraGlow)" />

                {/* 3D Tiered Base Cylinder */}
                <g filter="url(#stepperShadow)">
                  {/* Bottom Cylinder Wall */}
                  <path d="M 12 104 C 12 118 98 118 98 104 L 98 116 C 98 128 12 128 12 116 Z" fill="url(#purplePedestalGrad)" />
                  {/* Base Ring Top Surface */}
                  <ellipse cx="55" cy="104" rx="43" ry="12" fill="#5B21B6" stroke="#C084FC" strokeWidth="1.5" />
                  {/* Glowing Neon Light Ring */}
                  <ellipse cx="55" cy="102" rx="36" ry="9" fill="none" stroke="#E9D5FF" strokeWidth="2.5" opacity="0.9" />
                </g>

                {/* 3D Hexagonal Shield 01 */}
                <g transform="translate(55, 52) scale(0.92)" filter="url(#stepperShadow)">
                  {/* Outer Beveled Hexagon */}
                  <path
                    d="M 0 -48 L 38 -26 L 38 26 L 0 48 L -38 26 L -38 -26 Z"
                    fill="url(#purpleShieldGrad)"
                    stroke="#DDD6FE"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                  />
                  {/* Inner White Shield Plate */}
                  <path
                    d="M 0 -38 L 29 -20 L 29 20 L 0 38 L -29 20 L -29 -20 Z"
                    fill="#FFFFFF"
                    stroke="#DDD6FE"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  {/* Text 01 */}
                  <text x="0" y="-12" textAnchor="middle" fill="#5B21B6" fontSize="11" fontWeight="900" letterSpacing="1">
                    01
                  </text>
                  {/* Code Symbol </> */}
                  <text x="0" y="16" textAnchor="middle" fill="#4C1D95" fontSize="22" fontWeight="900" fontFamily="monospace">
                    &lt;/&gt;
                  </text>
                </g>
              </svg>
            </div>

            {/* Neon Dashed Light Trail 1 -> 2 */}
            <div className="w-10 h-28 flex justify-center -my-2 relative z-10">
              <svg width="24" height="100%" viewBox="0 0 24 112" fill="none" preserveAspectRatio="none">
                <rect
                  x="7"
                  y="0"
                  width="10"
                  height="112"
                  fill={practiceAttempted ? "#10B981" : "#7C3AED"}
                  opacity={practiceAttempted ? 0.35 : 0.25}
                  filter="url(#auraGlow)"
                />
                <line
                  x1="12"
                  y1="0"
                  x2="12"
                  y2="112"
                  stroke={practiceAttempted ? "#10B981" : "#7C3AED"}
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <line x1="12" y1="0" x2="12" y2="112" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" />
              </svg>
            </div>

            {/* STEP 02: 3D Hexagonal Pedestal (Practice Assessment - Turns Green When Completed) */}
            <div className="relative flex flex-col items-center z-20">
              <svg width="110" height="135" viewBox="0 0 110 135" fill="none" className="overflow-visible">
                {/* Pedestal Ambient Light Aura when completed */}
                {practiceAttempted && (
                  <ellipse cx="55" cy="108" rx="46" ry="16" fill="#10B981" opacity="0.45" filter="url(#auraGlow)" />
                )}

                {/* 3D Tiered Base Cylinder */}
                <g filter="url(#stepperShadow)">
                  {/* Bottom Cylinder Wall */}
                  <path
                    d="M 16 104 C 16 118 94 118 94 104 L 94 114 C 94 126 16 126 16 114 Z"
                    fill={practiceAttempted ? "url(#emeraldPedestalGrad)" : "url(#silverPedestalGrad)"}
                  />
                  {/* Base Ring Top Surface */}
                  <ellipse
                    cx="55"
                    cy="104"
                    rx="39"
                    ry="11"
                    fill={practiceAttempted ? "#065F46" : "#475569"}
                    stroke={practiceAttempted ? "#34D399" : "#94A3B8"}
                    strokeWidth="1.5"
                  />

                  {practiceAttempted && (
                    <ellipse cx="55" cy="102" rx="34" ry="8" fill="none" stroke="#A7F3D0" strokeWidth="2.5" opacity="0.9" />
                  )}
                  
                  {/* Metallic Lock / Checked Badge on Right Rim */}
                  <g transform="translate(74, 96)">
                    <circle
                      cx="9"
                      cy="9"
                      r="9"
                      fill={practiceAttempted ? "#064E3B" : "#1E293B"}
                      stroke={practiceAttempted ? "#34D399" : "#94A3B8"}
                      strokeWidth="1.5"
                    />
                    {practiceAttempted || resourceMarked ? (
                      <path d="M 5 9 L 8 12 L 13 6" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    ) : (
                      <g transform="translate(4.5, 4)">
                        <path d="M 2 4.5 L 2 3 C 2 1.3 3.3 0 5 0 C 6.7 0 8 1.3 8 3 L 8 4.5" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />
                        <rect x="0" y="4" width="10" height="7" rx="1.5" fill="#CBD5E1" />
                        <circle cx="5" cy="7.5" r="1" fill="#1E293B" />
                      </g>
                    )}
                  </g>
                </g>

                {/* 3D Hexagonal Shield 02 - Emerald Green when completed */}
                <g transform="translate(55, 52) scale(0.92)" filter="url(#stepperShadow)">
                  <path
                    d="M 0 -48 L 38 -26 L 38 26 L 0 48 L -38 26 L -38 -26 Z"
                    fill={practiceAttempted ? "url(#emeraldShieldGrad)" : "url(#silverShieldGrad)"}
                    stroke={practiceAttempted ? "#A7F3D0" : "#E2E8F0"}
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 0 -38 L 29 -20 L 29 20 L 0 38 L -29 20 L -29 -20 Z"
                    fill={practiceAttempted ? "#ECFDF5" : "#F8FAFC"}
                    stroke={practiceAttempted ? "#6EE7B7" : "#CBD5E1"}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  {/* Text 02 */}
                  <text
                    x="0"
                    y="-12"
                    textAnchor="middle"
                    fill={practiceAttempted ? "#047857" : "#475569"}
                    fontSize="11"
                    fontWeight="900"
                    letterSpacing="1"
                  >
                    02
                  </text>
                  {/* Checklist Clipboard Icon */}
                  <g transform="translate(-10, -2)">
                    <rect
                      x="0"
                      y="0"
                      width="20"
                      height="24"
                      rx="2"
                      fill={practiceAttempted ? "#D1FAE5" : "#E2E8F0"}
                      stroke={practiceAttempted ? "#059669" : "#64748B"}
                      strokeWidth="1.5"
                    />
                    <rect
                      x="5"
                      y="-2"
                      width="10"
                      height="4"
                      rx="1"
                      fill={practiceAttempted ? "#047857" : "#475569"}
                    />
                    <line
                      x1="4"
                      y1="7"
                      x2="16"
                      y2="7"
                      stroke={practiceAttempted ? "#059669" : "#64748B"}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="4"
                      y1="12"
                      x2="14"
                      y2="12"
                      stroke={practiceAttempted ? "#059669" : "#64748B"}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="4"
                      y1="17"
                      x2="11"
                      y2="17"
                      stroke={practiceAttempted ? "#059669" : "#64748B"}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </g>
                </g>
              </svg>
            </div>

            {/* Neon Dashed Light Trail 2 -> 3 */}
            <div className="w-10 h-28 flex justify-center -my-2 relative z-10">
              <svg width="24" height="100%" viewBox="0 0 24 112" fill="none" preserveAspectRatio="none">
                {props.proctoredAlreadyTaken && (
                  <rect x="7" y="0" width="10" height="112" fill="#10B981" opacity="0.35" filter="url(#auraGlow)" />
                )}
                <line
                  x1="12"
                  y1="0"
                  x2="12"
                  y2="112"
                  stroke={props.proctoredAlreadyTaken ? "#10B981" : "#64748B"}
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <line x1="12" y1="0" x2="12" y2="112" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" />
              </svg>
            </div>

            {/* STEP 03: 3D Hexagonal Pedestal (Official Proctored Assessment) */}
            <div className="relative flex flex-col items-center z-20">
              <svg width="110" height="135" viewBox="0 0 110 135" fill="none" className="overflow-visible">
                {/* Pedestal Ambient Light Aura when completed */}
                {props.proctoredAlreadyTaken && (
                  <ellipse cx="55" cy="108" rx="46" ry="16" fill="#10B981" opacity="0.45" filter="url(#auraGlow)" />
                )}

                {/* 3D Tiered Base Cylinder */}
                <g filter="url(#stepperShadow)">
                  <path
                    d="M 16 104 C 16 118 94 118 94 104 L 94 114 C 94 126 16 126 16 114 Z"
                    fill={props.proctoredAlreadyTaken ? "url(#emeraldPedestalGrad)" : "url(#silverPedestalGrad)"}
                  />
                  <ellipse
                    cx="55"
                    cy="104"
                    rx="39"
                    ry="11"
                    fill={props.proctoredAlreadyTaken ? "#065F46" : "#475569"}
                    stroke={props.proctoredAlreadyTaken ? "#34D399" : "#94A3B8"}
                    strokeWidth="1.5"
                  />

                  {props.proctoredAlreadyTaken && (
                    <ellipse cx="55" cy="102" rx="34" ry="8" fill="none" stroke="#A7F3D0" strokeWidth="2.5" opacity="0.9" />
                  )}
                  
                  {/* Metallic Lock Badge on Right Rim */}
                  <g transform="translate(74, 96)">
                    <circle
                      cx="9"
                      cy="9"
                      r="9"
                      fill={props.proctoredAlreadyTaken ? "#064E3B" : "#1E293B"}
                      stroke={props.proctoredAlreadyTaken ? "#34D399" : "#94A3B8"}
                      strokeWidth="1.5"
                    />
                    {props.proctoredAlreadyTaken || practiceAttempted ? (
                      <path d="M 5 9 L 8 12 L 13 6" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    ) : (
                      <g transform="translate(4.5, 4)">
                        <path d="M 2 4.5 L 2 3 C 2 1.3 3.3 0 5 0 C 6.7 0 8 1.3 8 3 L 8 4.5" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />
                        <rect x="0" y="4" width="10" height="7" rx="1.5" fill="#CBD5E1" />
                        <circle cx="5" cy="7.5" r="1" fill="#1E293B" />
                      </g>
                    )}
                  </g>
                </g>

                {/* 3D Hexagonal Shield 03 */}
                <g transform="translate(55, 52) scale(0.92)" filter="url(#stepperShadow)">
                  <path
                    d="M 0 -48 L 38 -26 L 38 26 L 0 48 L -38 26 L -38 -26 Z"
                    fill={props.proctoredAlreadyTaken ? "url(#emeraldShieldGrad)" : "url(#silverShieldGrad)"}
                    stroke={props.proctoredAlreadyTaken ? "#A7F3D0" : "#E2E8F0"}
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 0 -38 L 29 -20 L 29 20 L 0 38 L -29 20 L -29 -20 Z"
                    fill={props.proctoredAlreadyTaken ? "#ECFDF5" : "#F8FAFC"}
                    stroke={props.proctoredAlreadyTaken ? "#6EE7B7" : "#CBD5E1"}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  {/* Text 03 */}
                  <text
                    x="0"
                    y="-12"
                    textAnchor="middle"
                    fill={props.proctoredAlreadyTaken ? "#047857" : "#475569"}
                    fontSize="11"
                    fontWeight="900"
                    letterSpacing="1"
                  >
                    03
                  </text>
                  {/* Graduation Cap Icon */}
                  <g transform="translate(-13, 0)">
                    <path
                      d="M 13 0 L 26 6 L 13 12 L 0 6 Z"
                      fill={props.proctoredAlreadyTaken ? "#047857" : "#475569"}
                      stroke={props.proctoredAlreadyTaken ? "#064E3B" : "#334155"}
                      strokeWidth="1"
                    />
                    <path
                      d="M 4 8.5 L 4 15 C 4 18 22 18 22 15 L 22 8.5"
                      fill={props.proctoredAlreadyTaken ? "#10B981" : "#64748B"}
                    />
                    <path
                      d="M 23 8 L 25 15"
                      stroke={props.proctoredAlreadyTaken ? "#047857" : "#475569"}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </g>
                </g>
              </svg>
            </div>

            {/* Curving Light Trail 3 -> Chest */}
            <div className="w-28 h-24 -my-2 relative z-10">
              <svg width="100%" height="100%" viewBox="0 0 100 90" fill="none">
                <path d="M 50 0 C 50 45, 50 55, 50 90" stroke="#64748B" strokeWidth="8" strokeLinecap="round" />
                <path d="M 50 0 C 50 45, 50 55, 50 90" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" />
              </svg>
            </div>

            {/* FINAL DESTINATION: 3D Locked Treasure Chest on Circular Stone Pedestal (Significantly Enlarged) */}
            <div className="relative flex flex-col items-center z-20 group cursor-pointer mt-1">
              <div className="relative flex flex-col items-center">
                
                {/* Ambient Floor Shadow / Light Ring */}
                <div className="absolute -bottom-4 w-44 h-12 rounded-full bg-slate-900/30 blur-lg" />
                
                {/* 3D Chest Model with Large Steel Padlock */}
                <div className="relative h-34 w-34 drop-shadow-[0_16px_32px_rgba(30,41,59,0.5)] group-hover:scale-105 transition-transform">
                  <Image
                    src="/images/journey/treasure_transparent.png"
                    alt="Locked Chest"
                    fill
                    unoptimized
                    className="object-contain grayscale contrast-125 brightness-105"
                  />
                  {/* Padlock on center of chest */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-slate-300 flex items-center justify-center shadow-2xl ring-2 ring-black/20">
                      <IconLock className="h-5 w-5 text-white stroke-[2.5]" />
                    </div>
                  </div>
                </div>

                {/* Multi-Tiered Circular Stone Pedestal Base */}
                <div className="-mt-6 relative flex flex-col items-center">
                  {/* Top Stone Ring Surface */}
                  <div className="w-40 h-8 rounded-full bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 border-2 border-slate-400 shadow-md flex items-center justify-center">
                    <div className="w-32 h-4 rounded-full bg-slate-800/60 blur-2xs" />
                  </div>
                  {/* Bottom Tiered Base Ring */}
                  <div className="-mt-4 w-46 h-9 rounded-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-600 shadow-xl" />
                </div>

              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 2. RIGHT CARDS COLUMN (Exact Match to Image 1)                            */}
          {/* ========================================================================= */}
          <div className="space-y-6">
            
            {/* --------------------------------------------------------------------- */}
            {/* CARD 1: Step 01 Hero Card (Dark Purple/Navy Developer Card)           */}
            {/* --------------------------------------------------------------------- */}
            <div className="relative overflow-hidden rounded-sm bg-gradient-to-br from-[#1C1736] via-[#140F2D] to-[#0E0A22] border border-purple-500/30 p-6 sm:p-7 shadow-xl text-white">
              
              {/* Top Row Badges */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="px-3 py-1 rounded-xs bg-purple-900/80 border border-purple-400/40 text-purple-200 text-[11px] font-black uppercase tracking-wider shadow-xs">
                  {props.skillName}
                </span>

                <span className="px-3 py-1 rounded-xs bg-[#251E49] border border-purple-500/30 text-purple-300 text-[11px] font-extrabold tracking-wide">
                  ~{hoursEst}h ESTIMATED
                </span>
              </div>

              {/* Title & Subtitle + 3D Monitor Illustration */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_160px] gap-6 items-center">
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {props.resourceTitle}
                  </h1>
                  <p className="text-xs text-slate-400 font-medium">
                    Source: <span className="text-slate-300">{props.resourceProvider}</span> · Modality: <span className="text-purple-300">{props.resourceType.toUpperCase()}</span>
                  </p>

                  {/* Action Buttons */}
                  <div className="pt-4 flex flex-wrap items-center gap-3">
                    <a
                      href={props.resourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => {
                        trackEvent({ eventType: "open", modality: props.resourceType });
                        if (!resourceMarked) postProgress({ type: "started" });
                      }}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm bg-gradient-to-r from-[#A855F7] via-[#8B5CF6] to-[#7C3AED] text-white text-xs font-black shadow-lg shadow-purple-500/30 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <span>Launch Resource</span>
                      <IconExternalLink className="h-4 w-4" />
                    </a>

                    {!resourceMarked ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          await postProgress({ type: "resource_done" });
                          await trackEvent({ eventType: "complete", modality: props.resourceType });
                          setResourceMarked(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm bg-[#28214A] border border-purple-400/30 text-slate-200 text-xs font-bold hover:bg-[#342B60] hover:text-white transition-all cursor-pointer disabled:opacity-50"
                      >
                        <span>Mark Step Complete</span>
                        <IconCheck className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold">
                        <IconCheck className="h-4 w-4 stroke-[3]" />
                        <span>Step Completed</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3D Desktop Monitor Illustration with Code Lines & {} Badge */}
                <div className="hidden lg:flex flex-col items-center justify-center relative select-none">
                  <div className="relative w-36 h-28 rounded-xs bg-[#0F0C24] border-2 border-purple-500/40 shadow-xl p-2.5 flex flex-col justify-between">
                    {/* Monitor Code Lines */}
                    <div className="space-y-1.5">
                      <div className="h-1.5 w-16 bg-purple-400/80 rounded-xs" />
                      <div className="h-1.5 w-24 bg-cyan-400/70 rounded-xs" />
                      <div className="h-1.5 w-20 bg-emerald-400/70 rounded-xs" />
                      <div className="h-1.5 w-14 bg-amber-400/70 rounded-xs" />
                      <div className="h-1.5 w-22 bg-purple-300/60 rounded-xs" />
                    </div>

                    {/* Monitor Stand */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-3 bg-purple-900 rounded-b-xs" />
                  </div>

                  {/* Floating Hexagonal Code Symbol Badge */}
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-xs bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] border border-purple-200 text-white font-mono font-black text-sm shadow-lg drop-shadow-md">
                    &#123;&#125;
                  </div>
                </div>
              </div>

              {/* Module Difficulty Calibration - Sleek Segmented Control */}
              <div className="mt-6 pt-4 border-t border-purple-500/20 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-semibold text-slate-300">
                    Difficulty Calibration
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Fine-tune AI recommendation pacing
                  </p>
                </div>
                
                <div className="inline-flex items-center p-1 rounded-sm bg-[#090717]/90 border border-purple-500/30 shadow-inner gap-1">
                  {[
                    { id: "too_easy", label: "Easy", dot: "bg-emerald-400" },
                    { id: "just_right", label: "Balanced", dot: "bg-sky-400" },
                    { id: "too_hard", label: "Challenging", dot: "bg-amber-400" },
                  ].map((item) => {
                    const isSelected = feedbackSent === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          await postProgress({ type: "feedback", feedback: item.id });
                          setFeedbackSent(item.id);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xs text-xs font-semibold transition-all cursor-pointer select-none ${
                          isSelected
                            ? "bg-purple-600/40 text-white border border-purple-400/60 shadow-xs"
                            : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* --------------------------------------------------------------------- */}
            {/* CARD 2: Step 02 (Practice Assessment - Dedicated Arena Link)          */}
            {/* --------------------------------------------------------------------- */}
            {resourceMarked ? (
              <div className="relative overflow-hidden rounded-none bg-white border-2 border-purple-200 p-6 sm:p-7 shadow-lg backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <IconTarget className="h-5 w-5 text-[#7C3AED]" />
                    <span>Practice Assessment</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-none bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-black">
                    UNLIMITED RETAKES
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Test your comprehension with low-stakes adaptive multiple-choice questions in the dedicated practice arena before attempting the official proctored exam.
                </p>

                <div className="pt-1">
                  <Link
                    href={`/goals/${props.goalId}/modules/${props.moduleId}/practice`}
                    className="inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-none bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] text-white text-xs font-black shadow-md shadow-purple-500/20 hover:opacity-95 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <span>{practiceAttempted ? "Retake Practice Assessment Arena" : "Launch Practice Assessment Arena"}</span>
                    <IconArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-none bg-white/95 border border-slate-200/90 p-6 sm:p-7 shadow-md backdrop-blur-md grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-6 items-center">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <IconLock className="h-5 w-5 text-slate-500" />
                    <span>Practice Assessment</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Complete the resource review above to unlock practice assessments.
                  </p>
                </div>

                {/* 3D Paper Checklist Illustration with Lock Badge */}
                <div className="flex items-center justify-center relative select-none">
                  <div className="relative w-22 h-26 rounded-xs bg-slate-50 border border-slate-200 shadow-md p-2 space-y-1.5">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-xs bg-slate-300" />
                      <div className="h-1.5 w-12 bg-slate-200 rounded-xs" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-xs bg-slate-300" />
                      <div className="h-1.5 w-10 bg-slate-200 rounded-xs" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-xs bg-slate-300" />
                      <div className="h-1.5 w-14 bg-slate-200 rounded-xs" />
                    </div>
                    {/* Pencil */}
                    <div className="absolute -bottom-1 -right-2 w-10 h-2 bg-amber-400 rotate-45 rounded-xs shadow-xs border border-amber-600" />
                  </div>

                  {/* Circular Lock Badge */}
                  <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center shadow-md">
                    <IconLock className="h-3.5 w-3.5 text-slate-600" />
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* CARD 3: Step 03 (Official Proctored Assessment - Light Glass Card)    */}
            {/* --------------------------------------------------------------------- */}
            {props.proctoredAlreadyTaken ? (
              <div className="relative overflow-hidden rounded-sm bg-white/98 border-2 border-emerald-200 p-6 shadow-xl backdrop-blur-md space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <IconAward className="h-5 w-5 text-emerald-600" />
                    <span>Official Proctored Assessment Cleared</span>
                  </h3>
                  <span className="px-3 py-1 rounded-xs bg-emerald-100 text-emerald-800 text-xs font-black">
                    MASTERY RECORDED
                  </span>
                </div>
                <div className="text-3xl font-black text-emerald-600">
                  {props.proctoredScore}/100
                </div>
              </div>
            ) : practiceAttempted ? (
              <div className="relative overflow-hidden rounded-sm bg-white/98 border-2 border-purple-300 p-6 shadow-xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <IconAward className="h-5 w-5 text-[#6D28D9]" />
                    <span>Official Proctored Assessment</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-xs bg-purple-100 text-purple-800 text-xs font-black">
                    UNLOCKED
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Single-attempt, timed, webcam presence-monitored trial. Successfully completing this assessment records official skill mastery.
                </p>
                <Link
                  href={`/goals/${props.goalId}/modules/${props.moduleId}/proctored`}
                  className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-sm bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white text-xs font-black shadow-lg shadow-purple-500/20 hover:opacity-95 transition-all"
                >
                  <span>Begin Proctored Assessment</span>
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-sm bg-white/95 border border-slate-200/90 p-6 sm:p-7 shadow-md backdrop-blur-md grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-6 items-center">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <IconLock className="h-5 w-5 text-slate-500" />
                    <span>Official Proctored Assessment</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Complete at least one practice quiz attempt in the arena above to unlock this assessment.
                  </p>
                </div>

                {/* 3D Laptop with Shield Illustration & Lock Badge */}
                <div className="flex items-center justify-center relative select-none">
                  <div className="relative w-24 h-20 rounded-xs bg-slate-100 border border-slate-300 shadow-md flex flex-col items-center justify-center">
                    <div className="w-16 h-10 rounded-xs bg-slate-800 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-xs bg-slate-700 flex items-center justify-center">
                        <path d="M 3 6 L 6 9 L 10 3" stroke="#94A3B8" strokeWidth="1.5" fill="none" />
                      </div>
                    </div>
                    <div className="w-20 h-2 bg-slate-300 rounded-b-xs mt-1" />
                  </div>

                  {/* Circular Lock Badge */}
                  <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center shadow-md">
                    <IconLock className="h-3.5 w-3.5 text-slate-600" />
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* BOTTOM REWARD CARD (Beside the Treasure Chest)                        */}
            {/* --------------------------------------------------------------------- */}
            <div className="rounded-sm bg-white/95 border border-purple-100 p-4 shadow-sm backdrop-blur-md flex items-center justify-center gap-2.5 text-xs font-bold text-slate-700">
              <IconLock className="h-4 w-4 text-purple-600" />
              <span>
                Complete all steps above to unlock <span className="text-[#6D28D9] font-black">amazing rewards!</span> 🎁
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default ModuleWorkspace;
