"use client";

import React, { useState, useEffect } from "react";
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
  IconCode,
  IconTerminal2,
  IconBook,
} from "@tabler/icons-react";
import { SlideToUnlock } from "@/components/ui/reward-card";
import { CertificateModal } from "@/frontend/components/certificates/CertificateModal";

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
  const [codingMarked, setCodingMarked] = useState(false);
  const [practiceAttempted, setPracticeAttempted] = useState(props.hasPracticeAttempt);
  const [showCert, setShowCert] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`questlearn_coding_${props.moduleId}`);
      if (saved === "true") setCodingMarked(true);
    } catch {}
  }, [props.moduleId]);

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
      
      {/* Background Studio Ambient Image Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <Image
          src="/images/journey/study_desk_bg.jpg"
          alt="Study Desk Studio"
          fill
          unoptimized
          className="object-cover object-top opacity-95"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/30" />
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

            {/* STEP 01: 3D Hexagonal Purple Pedestal with Flag (Course Material) */}
            <div className="relative flex flex-col items-center z-20 group">
              <svg width="110" height="135" viewBox="0 0 110 135" fill="none" className="overflow-visible">
                {/* Authentic 3D Planted Flagpole & Waving Purple Pennant Flag */}
                <g filter="url(#stepperShadow)">
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
                <ellipse cx="55" cy="108" rx="46" ry="16" fill={resourceMarked ? "#10B981" : "#A855F7"} opacity="0.35" filter="url(#auraGlow)" />

                {/* 3D Tiered Base Cylinder */}
                <g filter="url(#stepperShadow)">
                  <path d="M 12 104 C 12 118 98 118 98 104 L 98 116 C 98 128 12 128 12 116 Z" fill={resourceMarked ? "url(#emeraldPedestalGrad)" : "url(#purplePedestalGrad)"} />
                  <ellipse cx="55" cy="104" rx="43" ry="12" fill={resourceMarked ? "#065F46" : "#5B21B6"} stroke={resourceMarked ? "#34D399" : "#C084FC"} strokeWidth="1.5" />
                  <ellipse cx="55" cy="102" rx="36" ry="9" fill="none" stroke={resourceMarked ? "#A7F3D0" : "#E9D5FF"} strokeWidth="2.5" opacity="0.9" />
                </g>

                {/* 3D Hexagonal Shield 01 */}
                <g transform="translate(55, 52) scale(0.92)" filter="url(#stepperShadow)">
                  <path
                    d="M 0 -48 L 38 -26 L 38 26 L 0 48 L -38 26 L -38 -26 Z"
                    fill={resourceMarked ? "url(#emeraldShieldGrad)" : "url(#purpleShieldGrad)"}
                    stroke={resourceMarked ? "#A7F3D0" : "#DDD6FE"}
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 0 -38 L 29 -20 L 29 20 L 0 38 L -29 20 L -29 -20 Z"
                    fill={resourceMarked ? "#ECFDF5" : "#FFFFFF"}
                    stroke={resourceMarked ? "#6EE7B7" : "#DDD6FE"}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <text x="0" y="-12" textAnchor="middle" fill={resourceMarked ? "#047857" : "#5B21B6"} fontSize="11" fontWeight="900" letterSpacing="1">
                    01
                  </text>
                  <text x="0" y="16" textAnchor="middle" fill={resourceMarked ? "#065F46" : "#4C1D95"} fontSize="18" fontWeight="900" fontFamily="sans-serif">
                    📖
                  </text>
                </g>
              </svg>
            </div>

            {/* Neon Dashed Light Trail 1 -> 2 */}
            <div className="w-10 h-24 flex justify-center -my-2 relative z-10">
              <svg width="24" height="100%" viewBox="0 0 24 96" fill="none" preserveAspectRatio="none">
                <rect
                  x="7"
                  y="0"
                  width="10"
                  height="96"
                  fill={resourceMarked ? "#10B981" : "#7C3AED"}
                  opacity={resourceMarked ? 0.35 : 0.25}
                  filter="url(#auraGlow)"
                />
                <line
                  x1="12"
                  y1="0"
                  x2="12"
                  y2="96"
                  stroke={resourceMarked ? "#10B981" : "#64748B"}
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <line x1="12" y1="0" x2="12" y2="96" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" />
              </svg>
            </div>

            {/* STEP 02: 3D Hexagonal Pedestal (Coding Lab) */}
            <div className="relative flex flex-col items-center z-20">
              <svg width="110" height="135" viewBox="0 0 110 135" fill="none" className="overflow-visible">
                {codingMarked && (
                  <ellipse cx="55" cy="108" rx="46" ry="16" fill="#10B981" opacity="0.45" filter="url(#auraGlow)" />
                )}

                <g filter="url(#stepperShadow)">
                  <path
                    d="M 16 104 C 16 118 94 118 94 104 L 94 114 C 94 126 16 126 16 114 Z"
                    fill={codingMarked ? "url(#emeraldPedestalGrad)" : resourceMarked ? "url(#purplePedestalGrad)" : "url(#silverPedestalGrad)"}
                  />
                  <ellipse
                    cx="55"
                    cy="104"
                    rx="39"
                    ry="11"
                    fill={codingMarked ? "#065F46" : resourceMarked ? "#5B21B6" : "#475569"}
                    stroke={codingMarked ? "#34D399" : resourceMarked ? "#C084FC" : "#94A3B8"}
                    strokeWidth="1.5"
                  />
                  {codingMarked && (
                    <ellipse cx="55" cy="102" rx="34" ry="8" fill="none" stroke="#A7F3D0" strokeWidth="2.5" opacity="0.9" />
                  )}
                </g>

                {/* 3D Hexagonal Shield 02 */}
                <g transform="translate(55, 52) scale(0.92)" filter="url(#stepperShadow)">
                  <path
                    d="M 0 -48 L 38 -26 L 38 26 L 0 48 L -38 26 L -38 -26 Z"
                    fill={codingMarked ? "url(#emeraldShieldGrad)" : resourceMarked ? "url(#purpleShieldGrad)" : "url(#silverShieldGrad)"}
                    stroke={codingMarked ? "#A7F3D0" : resourceMarked ? "#DDD6FE" : "#E2E8F0"}
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 0 -38 L 29 -20 L 29 20 L 0 38 L -29 20 L -29 -20 Z"
                    fill={codingMarked ? "#ECFDF5" : resourceMarked ? "#FBF8FF" : "#F8FAFC"}
                    stroke={codingMarked ? "#6EE7B7" : resourceMarked ? "#DDD6FE" : "#CBD5E1"}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <text
                    x="0"
                    y="-12"
                    textAnchor="middle"
                    fill={codingMarked ? "#047857" : resourceMarked ? "#5B21B6" : "#475569"}
                    fontSize="11"
                    fontWeight="900"
                    letterSpacing="1"
                  >
                    02
                  </text>
                  <text
                    x="0"
                    y="16"
                    textAnchor="middle"
                    fill={codingMarked ? "#065F46" : resourceMarked ? "#4C1D95" : "#475569"}
                    fontSize="18"
                    fontWeight="900"
                    fontFamily="monospace"
                  >
                    &lt;/&gt;
                  </text>
                </g>
              </svg>
            </div>

            {/* Neon Dashed Light Trail 2 -> 3 */}
            <div className="w-10 h-24 flex justify-center -my-2 relative z-10">
              <svg width="24" height="100%" viewBox="0 0 24 96" fill="none" preserveAspectRatio="none">
                <rect
                  x="7"
                  y="0"
                  width="10"
                  height="96"
                  fill={practiceAttempted ? "#10B981" : "#7C3AED"}
                  opacity={practiceAttempted ? 0.35 : 0.25}
                  filter="url(#auraGlow)"
                />
                <line
                  x1="12"
                  y1="0"
                  x2="12"
                  y2="96"
                  stroke={practiceAttempted ? "#10B981" : codingMarked ? "#7C3AED" : "#64748B"}
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <line x1="12" y1="0" x2="12" y2="96" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" />
              </svg>
            </div>

            {/* STEP 03: 3D Hexagonal Pedestal (Practice Quiz) */}
            <div className="relative flex flex-col items-center z-20">
              <svg width="110" height="135" viewBox="0 0 110 135" fill="none" className="overflow-visible">
                {practiceAttempted && (
                  <ellipse cx="55" cy="108" rx="46" ry="16" fill="#10B981" opacity="0.45" filter="url(#auraGlow)" />
                )}

                <g filter="url(#stepperShadow)">
                  <path
                    d="M 16 104 C 16 118 94 118 94 104 L 94 114 C 94 126 16 126 16 114 Z"
                    fill={practiceAttempted ? "url(#emeraldPedestalGrad)" : codingMarked ? "url(#purplePedestalGrad)" : "url(#silverPedestalGrad)"}
                  />
                  <ellipse
                    cx="55"
                    cy="104"
                    rx="39"
                    ry="11"
                    fill={practiceAttempted ? "#065F46" : codingMarked ? "#5B21B6" : "#475569"}
                    stroke={practiceAttempted ? "#34D399" : codingMarked ? "#C084FC" : "#94A3B8"}
                    strokeWidth="1.5"
                  />
                  {practiceAttempted && (
                    <ellipse cx="55" cy="102" rx="34" ry="8" fill="none" stroke="#A7F3D0" strokeWidth="2.5" opacity="0.9" />
                  )}
                </g>

                {/* 3D Hexagonal Shield 03 */}
                <g transform="translate(55, 52) scale(0.92)" filter="url(#stepperShadow)">
                  <path
                    d="M 0 -48 L 38 -26 L 38 26 L 0 48 L -38 26 L -38 -26 Z"
                    fill={practiceAttempted ? "url(#emeraldShieldGrad)" : codingMarked ? "url(#purpleShieldGrad)" : "url(#silverShieldGrad)"}
                    stroke={practiceAttempted ? "#A7F3D0" : codingMarked ? "#DDD6FE" : "#E2E8F0"}
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 0 -38 L 29 -20 L 29 20 L 0 38 L -29 20 L -29 -20 Z"
                    fill={practiceAttempted ? "#ECFDF5" : codingMarked ? "#FBF8FF" : "#F8FAFC"}
                    stroke={practiceAttempted ? "#6EE7B7" : codingMarked ? "#DDD6FE" : "#CBD5E1"}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <text
                    x="0"
                    y="-12"
                    textAnchor="middle"
                    fill={practiceAttempted ? "#047857" : codingMarked ? "#5B21B6" : "#475569"}
                    fontSize="11"
                    fontWeight="900"
                    letterSpacing="1"
                  >
                    03
                  </text>
                  <text
                    x="0"
                    y="16"
                    textAnchor="middle"
                    fill={practiceAttempted ? "#065F46" : codingMarked ? "#4C1D95" : "#475569"}
                    fontSize="18"
                    fontWeight="900"
                  >
                    📝
                  </text>
                </g>
              </svg>
            </div>

            {/* Neon Dashed Light Trail 3 -> 4 */}
            <div className="w-10 h-24 flex justify-center -my-2 relative z-10">
              <svg width="24" height="100%" viewBox="0 0 24 96" fill="none" preserveAspectRatio="none">
                <rect
                  x="7"
                  y="0"
                  width="10"
                  height="96"
                  fill={props.proctoredAlreadyTaken ? "#10B981" : "#7C3AED"}
                  opacity={props.proctoredAlreadyTaken ? 0.35 : 0.25}
                  filter="url(#auraGlow)"
                />
                <line
                  x1="12"
                  y1="0"
                  x2="12"
                  y2="96"
                  stroke={props.proctoredAlreadyTaken ? "#10B981" : practiceAttempted ? "#7C3AED" : "#64748B"}
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <line x1="12" y1="0" x2="12" y2="96" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" />
              </svg>
            </div>

            {/* STEP 04: 3D Hexagonal Pedestal (Official Proctored Exam) */}
            <div className="relative flex flex-col items-center z-20">
              <svg width="110" height="135" viewBox="0 0 110 135" fill="none" className="overflow-visible">
                {props.proctoredAlreadyTaken && (
                  <ellipse cx="55" cy="108" rx="46" ry="16" fill="#10B981" opacity="0.45" filter="url(#auraGlow)" />
                )}

                <g filter="url(#stepperShadow)">
                  <path
                    d="M 16 104 C 16 118 94 118 94 104 L 94 114 C 94 126 16 126 16 114 Z"
                    fill={props.proctoredAlreadyTaken ? "url(#emeraldPedestalGrad)" : practiceAttempted ? "url(#purplePedestalGrad)" : "url(#silverPedestalGrad)"}
                  />
                  <ellipse
                    cx="55"
                    cy="104"
                    rx="39"
                    ry="11"
                    fill={props.proctoredAlreadyTaken ? "#065F46" : practiceAttempted ? "#5B21B6" : "#475569"}
                    stroke={props.proctoredAlreadyTaken ? "#34D399" : practiceAttempted ? "#C084FC" : "#94A3B8"}
                    strokeWidth="1.5"
                  />
                  {props.proctoredAlreadyTaken && (
                    <ellipse cx="55" cy="102" rx="34" ry="8" fill="none" stroke="#A7F3D0" strokeWidth="2.5" opacity="0.9" />
                  )}
                </g>

                {/* 3D Hexagonal Shield 04 */}
                <g transform="translate(55, 52) scale(0.92)" filter="url(#stepperShadow)">
                  <path
                    d="M 0 -48 L 38 -26 L 38 26 L 0 48 L -38 26 L -38 -26 Z"
                    fill={props.proctoredAlreadyTaken ? "url(#emeraldShieldGrad)" : practiceAttempted ? "url(#purpleShieldGrad)" : "url(#silverShieldGrad)"}
                    stroke={props.proctoredAlreadyTaken ? "#A7F3D0" : practiceAttempted ? "#DDD6FE" : "#E2E8F0"}
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 0 -38 L 29 -20 L 29 20 L 0 38 L -29 20 L -29 -20 Z"
                    fill={props.proctoredAlreadyTaken ? "#ECFDF5" : practiceAttempted ? "#FBF8FF" : "#F8FAFC"}
                    stroke={props.proctoredAlreadyTaken ? "#6EE7B7" : practiceAttempted ? "#DDD6FE" : "#CBD5E1"}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <text
                    x="0"
                    y="-12"
                    textAnchor="middle"
                    fill={props.proctoredAlreadyTaken ? "#047857" : practiceAttempted ? "#5B21B6" : "#475569"}
                    fontSize="11"
                    fontWeight="900"
                    letterSpacing="1"
                  >
                    04
                  </text>
                  <text
                    x="0"
                    y="16"
                    textAnchor="middle"
                    fill={props.proctoredAlreadyTaken ? "#065F46" : practiceAttempted ? "#4C1D95" : "#475569"}
                    fontSize="18"
                    fontWeight="900"
                  >
                    🎓
                  </text>
                </g>
              </svg>
            </div>

            {/* Curving Light Trail 4 -> Chest */}
            <div className="w-28 h-20 -my-2 relative z-10">
              <svg width="100%" height="100%" viewBox="0 0 100 80" fill="none">
                <path d="M 50 0 C 50 40, 50 50, 50 80" stroke={props.proctoredAlreadyTaken ? "#10B981" : "#64748B"} strokeWidth="8" strokeLinecap="round" />
                <path d="M 50 0 C 50 40, 50 50, 50 80" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" />
              </svg>
            </div>

            {/* FINAL DESTINATION: 3D Locked Treasure Chest */}
            <div className="relative flex flex-col items-center z-20 group cursor-pointer mt-1">
              <div className="relative flex flex-col items-center">
                <div className="absolute -bottom-4 w-44 h-12 rounded-full bg-slate-900/30 blur-lg" />
                
                <div className="relative h-32 w-32 drop-shadow-[0_16px_32px_rgba(30,41,59,0.5)] group-hover:scale-105 transition-transform">
                  <Image
                    src="/images/journey/treasure_transparent.png"
                    alt="Locked Chest"
                    fill
                    unoptimized
                    className={`object-contain ${props.proctoredAlreadyTaken ? "brightness-110 contrast-125" : "grayscale contrast-125 brightness-105"}`}
                  />
                  {!props.proctoredAlreadyTaken && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-slate-300 flex items-center justify-center shadow-2xl ring-2 ring-black/20">
                        <IconLock className="h-5 w-5 text-white stroke-[2.5]" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="-mt-6 relative flex flex-col items-center">
                  <div className="w-40 h-8 rounded-full bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 border-2 border-slate-400 shadow-md flex items-center justify-center">
                    <div className="w-32 h-4 rounded-full bg-slate-800/60 blur-2xs" />
                  </div>
                  <div className="-mt-4 w-46 h-9 rounded-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-600 shadow-xl" />
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 2. RIGHT CARDS COLUMN (4-Step Progression)                                */}
          {/* ========================================================================= */}
          <div className="space-y-6">
            
            {/* --------------------------------------------------------------------- */}
            {/* CARD 1: Step 01 Course Material & Theory Card                         */}
            {/* --------------------------------------------------------------------- */}
            <div className="relative overflow-hidden rounded-none bg-gradient-to-br from-[#1C1736] via-[#140F2D] to-[#0E0A22] border border-purple-500/30 p-6 sm:p-7 shadow-xl text-white">
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="px-3 py-1 rounded-none bg-purple-900/80 border border-purple-400/40 text-purple-200 text-[11px] font-black uppercase tracking-wider shadow-xs">
                  01 · COURSE THEORY &amp; LESSON
                </span>

                <span className="px-3 py-1 rounded-none bg-[#251E49] border border-purple-500/30 text-purple-300 text-[11px] font-extrabold tracking-wide">
                  ~{hoursEst}h ESTIMATED
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_160px] gap-6 items-center">
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {props.resourceTitle}
                  </h1>
                  <p className="text-xs text-slate-400 font-medium">
                    Source: <span className="text-slate-300">{props.resourceProvider}</span> · Modality: <span className="text-purple-300">{props.resourceType.toUpperCase()}</span>
                  </p>

                  <div className="pt-4 flex flex-wrap items-center gap-3">
                    <a
                      href={props.resourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => {
                        trackEvent({ eventType: "open", modality: props.resourceType });
                        if (!resourceMarked) postProgress({ type: "started" });
                      }}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-none bg-gradient-to-r from-[#A855F7] via-[#8B5CF6] to-[#7C3AED] text-white text-xs font-black shadow-lg shadow-purple-500/30 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <span>Launch Course Resource</span>
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
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-none bg-[#28214A] border border-purple-400/30 text-slate-200 text-xs font-bold hover:bg-[#342B60] hover:text-white transition-all cursor-pointer disabled:opacity-50"
                      >
                        <span>Mark Course Complete</span>
                        <IconCheck className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold">
                        <IconCheck className="h-4 w-4 stroke-[3]" />
                        <span>Course Step Completed</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="hidden lg:flex flex-col items-center justify-center relative select-none">
                  <div className="relative w-36 h-28 rounded-none bg-[#0F0C24] border-2 border-purple-500/40 shadow-xl p-2.5 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="h-1.5 w-16 bg-purple-400/80 rounded-none" />
                      <div className="h-1.5 w-24 bg-cyan-400/70 rounded-none" />
                      <div className="h-1.5 w-20 bg-emerald-400/70 rounded-none" />
                      <div className="h-1.5 w-14 bg-amber-400/70 rounded-none" />
                      <div className="h-1.5 w-22 bg-purple-300/60 rounded-none" />
                    </div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-3 bg-purple-900" />
                  </div>

                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-none bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] border border-purple-200 text-white font-mono font-black text-sm shadow-lg drop-shadow-md">
                    📖
                  </div>
                </div>
              </div>

              {/* Module Difficulty Calibration */}
              <div className="mt-6 pt-4 border-t border-purple-500/25 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>Difficulty Calibration</span>
                    <span className="text-[10px] font-semibold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-none border border-purple-500/40">
                      AI Feedback
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Click to fine-tune AI recommendation pacing for future modules
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {[
                    { id: "too_easy", label: "Easy", dot: "bg-emerald-400", border: "border-emerald-500/40", activeBg: "bg-emerald-950/90 border-emerald-400 text-emerald-200 shadow-emerald-900/30" },
                    { id: "just_right", label: "Balanced", dot: "bg-cyan-400", border: "border-cyan-500/40", activeBg: "bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-cyan-900/30" },
                    { id: "too_hard", label: "Challenging", dot: "bg-amber-400", border: "border-amber-500/40", activeBg: "bg-amber-950/90 border-amber-400 text-amber-200 shadow-amber-900/30" },
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
                        className={`group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none text-xs font-bold transition-all cursor-pointer select-none shadow-sm ${
                          isSelected
                            ? `${item.activeBg} shadow-md ring-1 ring-white/30 scale-[1.02] border`
                            : `bg-[#0D0A21] hover:bg-[#1A143A] text-slate-300 hover:text-white border ${item.border} hover:scale-105 active:scale-95`
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${item.dot} ${isSelected ? "animate-pulse" : "group-hover:scale-125 transition-transform"}`} />
                        <span>{item.label}</span>
                        {isSelected && (
                          <IconCheck className="h-3.5 w-3.5 ml-0.5 stroke-[3]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* --------------------------------------------------------------------- */}
            {/* CARD 2: Step 02 Hands-On Coding Lab & Compiler Card                   */}
            {/* --------------------------------------------------------------------- */}
            {resourceMarked ? (
              <div className="relative overflow-hidden rounded-none bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0A0F1D] border-2 border-cyan-500/40 p-6 sm:p-7 shadow-xl text-white space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-none bg-cyan-950 border border-cyan-400 text-cyan-300 text-xs font-black">
                      02 · CODING LAB
                    </span>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <IconCode className="h-5 w-5 text-cyan-400" />
                      <span>Hands-On Code Lab &amp; Compiler</span>
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-none bg-emerald-950/80 border border-emerald-400 text-emerald-300 text-[11px] font-black">
                    INTERACTIVE RUNNER
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-2xl">
                  Put theory into action! Write, test, and execute live code challenges in our in-browser coding sandbox before unlocking the practice assessment.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/goals/${props.goalId}/modules/${props.moduleId}/compiler`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-none bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-black shadow-lg shadow-cyan-500/25 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <IconTerminal2 className="h-4 w-4" />
                    <span>Launch Code Lab &amp; Compiler</span>
                    <IconArrowRight className="h-4 w-4" />
                  </Link>

                  {!codingMarked ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCodingMarked(true);
                        try { localStorage.setItem(`questlearn_coding_${props.moduleId}`, "true"); } catch {}
                      }}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-none bg-[#241E47] border border-purple-400/40 text-purple-200 text-xs font-bold hover:bg-[#342C64] hover:text-white transition-all cursor-pointer shadow-md"
                    >
                      <span>Mark Coding Complete</span>
                      <IconCheck className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-emerald-950/90 border border-emerald-400 text-emerald-300 text-xs font-bold">
                      <IconCheck className="h-4 w-4 stroke-[3]" />
                      <span>Coding Lab Completed</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-none bg-white/95 border border-slate-200/90 p-6 sm:p-7 shadow-md backdrop-blur-md grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-6 items-center">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-none bg-slate-100 text-slate-500 text-[10px] font-black">
                      02 · CODING LAB
                    </span>
                    <h3 className="text-base font-black text-slate-700 flex items-center gap-2">
                      <IconLock className="h-4 w-4 text-slate-400" />
                      <span>Hands-On Code Lab &amp; Compiler</span>
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Complete the Course Material in Step 01 above to unlock this interactive coding lab.
                  </p>
                </div>

                <div className="flex items-center justify-center relative select-none">
                  <div className="relative w-20 h-16 rounded-none bg-slate-900 border border-slate-700 p-2 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="h-1 w-8 bg-cyan-400/70" />
                      <div className="h-1 w-12 bg-purple-400/70" />
                      <div className="h-1 w-10 bg-emerald-400/70" />
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 h-6 w-6 rounded-none bg-slate-800 border border-slate-300 flex items-center justify-center shadow-md">
                    <IconLock className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* CARD 3: Step 03 Practice Assessment Card                              */}
            {/* --------------------------------------------------------------------- */}
            {codingMarked || practiceAttempted ? (
              <div className="relative overflow-hidden rounded-none bg-white border-2 border-purple-200 p-6 sm:p-7 shadow-lg backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-none bg-purple-100 text-purple-900 text-xs font-black">
                      03 · PRACTICE
                    </span>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <IconTarget className="h-5 w-5 text-[#7C3AED]" />
                      <span>Practice Assessment</span>
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-none bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-black">
                    UNLIMITED RETAKES
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Test your comprehension with adaptive multiple-choice questions in the dedicated practice arena before attempting the official proctored test.
                </p>

                <div className="pt-1">
                  <Link
                    href={`/goals/${props.goalId}/modules/${props.moduleId}/practice`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-none bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] text-white text-xs font-extrabold shadow-md shadow-purple-500/20 hover:opacity-95 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <span>{practiceAttempted ? "Retake Practice Assessment" : "Launch Practice Assessment"}</span>
                    <IconArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-none bg-white/95 border border-slate-200/90 p-6 sm:p-7 shadow-md backdrop-blur-md grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-6 items-center">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-none bg-slate-100 text-slate-500 text-[10px] font-black">
                      03 · PRACTICE
                    </span>
                    <h3 className="text-base font-black text-slate-700 flex items-center gap-2">
                      <IconLock className="h-4 w-4 text-slate-400" />
                      <span>Practice Assessment</span>
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Complete the hands-on coding lab in Step 02 above to unlock this practice assessment.
                  </p>
                </div>

                <div className="flex items-center justify-center relative select-none">
                  <div className="relative w-20 h-22 rounded-none bg-slate-50 border border-slate-200 shadow-md p-2 space-y-1.5">
                    <div className="h-2 w-2 bg-slate-300" />
                    <div className="h-1.5 w-10 bg-slate-200" />
                    <div className="h-1.5 w-12 bg-slate-200" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-6 w-6 rounded-none bg-slate-800 border border-slate-300 flex items-center justify-center shadow-md">
                    <IconLock className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* CARD 4: Step 04 Official Proctored Assessment Card                    */}
            {/* --------------------------------------------------------------------- */}
            {props.proctoredAlreadyTaken ? (
              <div className="relative overflow-hidden rounded-none bg-white/98 border-2 border-emerald-200 p-6 shadow-xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-none bg-emerald-100 text-emerald-900 text-xs font-black">
                      04 · PROCTORED TEST
                    </span>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <IconAward className="h-5 w-5 text-emerald-600" />
                      <span>Official Proctored Assessment Cleared</span>
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-none bg-emerald-100 text-emerald-800 text-xs font-black">
                    MASTERY RECORDED
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-black text-emerald-600">
                    {props.proctoredScore}/100
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCert(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white text-xs font-black shadow-md shadow-amber-500/20 hover:opacity-95 transition-all cursor-pointer rounded-none"
                  >
                    <IconAward className="w-4 h-4" />
                    <span>View Milestone Certificate 📜</span>
                  </button>
                </div>
              </div>
            ) : practiceAttempted ? (
              <div className="relative overflow-hidden rounded-none bg-white/98 border-2 border-purple-300 p-6 shadow-xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-none bg-purple-100 text-purple-900 text-xs font-black">
                      04 · PROCTORED TEST
                    </span>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <IconAward className="h-5 w-5 text-[#6D28D9]" />
                      <span>Official Proctored Assessment</span>
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-none bg-purple-100 text-purple-800 text-xs font-black">
                    UNLOCKED
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Single-attempt, 15-minute, webcam presence-monitored examination. Successfully completing this proctored test records official skill mastery.
                </p>
                <div className="pt-1">
                  <Link
                    href={`/goals/${props.goalId}/modules/${props.moduleId}/proctored`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-none bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white text-xs font-extrabold shadow-md shadow-purple-500/20 hover:opacity-95 transition-all cursor-pointer"
                  >
                    <span>Begin Proctored Assessment</span>
                    <IconArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-none bg-white/95 border border-slate-200/90 p-6 sm:p-7 shadow-md backdrop-blur-md grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-6 items-center">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-none bg-slate-100 text-slate-500 text-[10px] font-black">
                      04 · PROCTORED TEST
                    </span>
                    <h3 className="text-base font-black text-slate-700 flex items-center gap-2">
                      <IconLock className="h-4 w-4 text-slate-400" />
                      <span>Official Proctored Assessment</span>
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Complete at least one practice quiz attempt in Step 03 above to unlock this assessment.
                  </p>
                </div>

                <div className="flex items-center justify-center relative select-none">
                  <div className="relative w-22 h-18 rounded-none bg-slate-100 border border-slate-300 shadow-md flex flex-col items-center justify-center">
                    <div className="w-14 h-9 rounded-none bg-slate-800 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-none bg-slate-700" />
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 h-6 w-6 rounded-none bg-slate-800 border border-slate-300 flex items-center justify-center shadow-md">
                    <IconLock className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* BOTTOM REWARD CARD (Milestone Completion Chest Loot)                  */}
            {/* --------------------------------------------------------------------- */}
            {props.proctoredAlreadyTaken ? (
              <div className="rounded-none bg-white border-2 border-purple-300 p-6 shadow-xl backdrop-blur-md flex flex-col items-center justify-center space-y-3">
                <SlideToUnlock
                  sliderText="Swipe to unlock Milestone Chest"
                  className="max-w-md border-purple-200 bg-purple-50/30 shadow-md"
                  unlockedContent={
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-none shadow-xl gap-3">
                      <div className="space-y-0.5">
                        <p className="text-sm font-black">Milestone Mastery Cleared! 🎁</p>
                        <p className="text-xs text-emerald-100">+250 Bonus XP & Milestone Trophy Credited</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCert(true)}
                        className="px-3.5 py-1.5 bg-white text-emerald-800 text-xs font-black rounded-none shadow-md hover:bg-emerald-50 transition-all cursor-pointer shrink-0"
                      >
                        📜 Claim Certificate
                      </button>
                    </div>
                  }
                >
                  <div className="text-center space-y-1.5 py-1">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-[#7C3AED] mb-1">
                      🎁
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900">Milestone Treasure Ready!</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      You completed all 4 stages for <span className="font-bold text-slate-800">{props.skillName}</span>. Swipe below to claim your milestone reward!
                    </p>
                  </div>
                </SlideToUnlock>
              </div>
            ) : (
              <div className="rounded-none bg-white/95 border border-purple-100 p-4 shadow-xs backdrop-blur-md flex items-center justify-center gap-2.5 text-xs font-bold text-slate-700">
                <IconLock className="h-4 w-4 text-purple-600" />
                <span>
                  Complete all 4 stages above (Course + Coding + Practice + Proctored Test) to unlock <strong className="text-purple-700">Milestone Loot! 🎁</strong>
                </span>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Milestone Certificate Modal */}
      <CertificateModal
        isOpen={showCert}
        onClose={() => setShowCert(false)}
        data={{
          type: "milestone",
          recipientName: "Learner",
          title: props.skillName,
          score: props.proctoredScore || 95,
          skillsMastered: [props.skillName, "Hands-On Code Lab", "15-Question Proctored Exam"],
        }}
      />
    </div>
  );
}

export default ModuleWorkspace;
