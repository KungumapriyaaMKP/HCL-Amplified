"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppSidebar } from "@/frontend/components/layout/AppSidebar";
import { NotificationDropdown } from "@/frontend/components/notifications/NotificationDropdown";
import { TRACK_PACES } from "@/data/domains";
import {
  IconChevronLeft,
  IconArrowRight,
  IconArrowLeft,
  IconSearch,
  IconClock,
} from "@tabler/icons-react";

/* -------------------------------------------------------------------------
 * CRISP SHARP-EDGED HIGH-FIDELITY VECTOR BADGES
 * ------------------------------------------------------------------------- */

function WebDevBadge() {
  return (
    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xs bg-[#F3E8FF] flex items-center justify-center shrink-0 border border-purple-100">
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="9" width="28" height="22" rx="1" fill="#6D28D9" />
        <rect x="6" y="9" width="28" height="6" rx="1" fill="#5B21B6" />
        <circle cx="10" cy="12" r="1" fill="#E9D5FF" />
        <circle cx="13.5" cy="12" r="1" fill="#E9D5FF" />
        <circle cx="17" cy="12" r="1" fill="#E9D5FF" />
        <path d="M15 20 L12 23 L15 26" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M18.5 27 L21.5 19" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="square" />
        <path d="M25 20 L28 23 L25 26" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    </div>
  );
}

function DataScienceBadge() {
  return (
    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xs bg-[#E0F2FE] flex items-center justify-center shrink-0 border border-sky-100">
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <rect x="9" y="22" width="5" height="10" rx="0.5" fill="#0284C7" />
        <rect x="17.5" y="15" width="5" height="17" rx="0.5" fill="#0284C7" />
        <rect x="26" y="19" width="5" height="13" rx="0.5" fill="#0284C7" />
        <path d="M28 10 C28 13.5, 25 16, 21.5 16 L21.5 10 Z" fill="#0369A1" />
        <path d="M30 8 C30 4.5, 27 2, 23.5 2 L23.5 8 Z" fill="#38BDF8" />
      </svg>
    </div>
  );
}

function AiMlBadge() {
  return (
    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xs bg-[#DCFCE7] flex items-center justify-center shrink-0 border border-emerald-100">
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 8 C16.5 8, 11.5 10, 11.5 15 C11.5 17.5, 13 19, 11.5 22 C10 24.5, 11.5 29, 15 30.5 C16.5 31.5, 20 31.5, 20 32.5"
          stroke="#16A34A"
          strokeWidth="2"
          strokeLinecap="square"
          fill="none"
        />
        <path
          d="M20 8 C23.5 8, 28.5 10, 28.5 15 C28.5 17.5, 27 19, 28.5 22 C30 24.5, 28.5 29, 25 30.5 C23.5 31.5, 20 31.5, 20 32.5"
          stroke="#16A34A"
          strokeWidth="2"
          strokeLinecap="square"
          fill="none"
        />
        <line x1="20" y1="8" x2="20" y2="32.5" stroke="#16A34A" strokeWidth="2" strokeLinecap="square" />
        <path d="M15.5 14 C18 15, 18 18, 15.5 19" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="square" fill="none" />
        <path d="M24.5 14 C22 15, 22 18, 24.5 19" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="square" fill="none" />
      </svg>
    </div>
  );
}

function MobileDevBadge() {
  return (
    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xs bg-[#FCE7F3] flex items-center justify-center shrink-0 border border-pink-100">
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <rect x="13" y="8" width="14" height="24" rx="1" stroke="#DB2777" strokeWidth="2" fill="none" />
        <line x1="17" y1="11.5" x2="23" y2="11.5" stroke="#DB2777" strokeWidth="1.8" strokeLinecap="square" />
        <circle cx="20" cy="28.5" r="1.2" fill="#DB2777" />
      </svg>
    </div>
  );
}

function CloudDevOpsBadge() {
  return (
    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xs bg-[#FEF3C7] flex items-center justify-center shrink-0 border border-amber-100">
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M14 18 C11.8 18, 10 19.8, 10 22 C10 24.2, 11.8 26, 14 26 L26 26 C28.5 26, 30.5 24, 30.5 21.5 C30.5 19, 28.5 17, 26 16.8 C25.5 13.2, 22.3 10.5, 18.5 10.5 C15.2 10.5, 12.5 12.5, 11.5 15.5"
          stroke="#D97706"
          strokeWidth="2"
          strokeLinecap="square"
          fill="none"
        />
        <line x1="13" y1="21.5" x2="27" y2="21.5" stroke="#D97706" strokeWidth="1.6" strokeLinecap="square" />
      </svg>
    </div>
  );
}

function CybersecurityBadge() {
  return (
    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xs bg-[#EDE9FE] flex items-center justify-center shrink-0 border border-indigo-100">
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 8 L28 11.5 V19 C28 24.5, 24.5 29, 20 31 C15.5 29, 12 24.5, 12 19 V11.5 L20 8 Z"
          stroke="#6D28D9"
          strokeWidth="2"
          strokeLinejoin="miter"
          fill="none"
        />
        <rect x="17.5" y="19" width="5" height="4.5" rx="0.5" fill="#6D28D9" />
        <path d="M18.5 19 V16.5 C18.5 15.8, 19.2 15.2, 20 15.2 C20.8 15.2, 21.5 15.8, 21.5 16.5 V19" stroke="#6D28D9" strokeWidth="1.4" fill="none" />
      </svg>
    </div>
  );
}

function BlockchainBadge() {
  return (
    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xs bg-[#F3E8FF] flex items-center justify-center shrink-0 border border-purple-100">
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 10 L22 7 L28 10 L22 13 Z" fill="#9333EA" />
        <path d="M16 10 L22 13 V19 L16 16 Z" fill="#7E22CE" />
        <path d="M28 10 L22 13 V19 L28 16 Z" fill="#A855F7" />

        <path d="M12 21 L18 18 L24 21 L18 24 Z" fill="#7C3AED" />
        <path d="M12 21 L18 24 V30 L12 27 Z" fill="#6D28D9" />
        <path d="M24 21 L18 24 V30 L24 27 Z" fill="#8B5CF6" />
      </svg>
    </div>
  );
}

function GameDevBadge() {
  return (
    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xs bg-[#FCE7F3] flex items-center justify-center shrink-0 border border-pink-100">
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="13" width="24" height="14" rx="1" fill="#DB2777" />
        <path d="M13 18 V22 M11 20 H15" stroke="#FDF2F8" strokeWidth="1.6" strokeLinecap="square" />
        <circle cx="25" cy="18" r="1.3" fill="#FDF2F8" />
        <circle cx="28" cy="21" r="1.3" fill="#FDF2F8" />
      </svg>
    </div>
  );
}

function UiUxDesignBadge() {
  return (
    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xs bg-[#FFE4E6] flex items-center justify-center shrink-0 border border-rose-100">
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <rect x="11" y="9" width="18" height="22" rx="1" fill="#E11D48" />
        <circle cx="16" cy="14" r="1.8" fill="#FFE4E6" />
        <line x1="14" y1="20" x2="26" y2="20" stroke="#FFE4E6" strokeWidth="1.6" strokeLinecap="square" />
        <line x1="14" y1="24" x2="22" y2="24" stroke="#FFE4E6" strokeWidth="1.6" strokeLinecap="square" />
      </svg>
    </div>
  );
}

/* ---------------- Corporate Badges (Sharp Edges) ---------------- */

function GenAiBadge() {
  return (
    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xs bg-[#FAE8FF] flex items-center justify-center shrink-0 border border-fuchsia-100">
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 7 L22.5 15.5 L31 18 L22.5 20.5 L20 29 L17.5 20.5 L9 18 L17.5 15.5 Z" fill="#9333EA" />
        <path d="M28 25 L29.5 29 L33.5 30.5 L29.5 32 L28 36 L26.5 32 L22.5 30.5 L26.5 29 Z" fill="#C084FC" />
      </svg>
    </div>
  );
}

function DataEngineeringBadge() {
  return (
    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xs bg-[#CCFBF1] flex items-center justify-center shrink-0 border border-teal-100">
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="20" cy="12" rx="10" ry="4" fill="#0D9488" />
        <path d="M10 12 V20 C10 22.2, 14.5 24, 20 24 C25.5 24, 30 22.2, 30 20 V12" stroke="#0D9488" strokeWidth="1.8" fill="none" />
        <path d="M10 20 V28 C10 30.2, 14.5 32, 20 32 C25.5 32, 30 30.2, 30 28 V20" stroke="#14B8A6" strokeWidth="1.8" fill="none" />
      </svg>
    </div>
  );
}

function EnterpriseFullStackBadge() {
  return (
    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xs bg-[#DBEAFE] flex items-center justify-center shrink-0 border border-blue-100">
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <rect x="9" y="9" width="22" height="6.5" rx="0.5" fill="#2563EB" />
        <rect x="9" y="17" width="22" height="6.5" rx="0.5" fill="#3B82F6" />
        <rect x="9" y="25" width="22" height="6.5" rx="0.5" fill="#60A5FA" />
        <circle cx="13" cy="12.2" r="1.2" fill="#EFF6FF" />
        <circle cx="13" cy="20.2" r="1.2" fill="#EFF6FF" />
        <circle cx="13" cy="28.2" r="1.2" fill="#EFF6FF" />
      </svg>
    </div>
  );
}

function EmbeddedIotBadge() {
  return (
    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xs bg-[#FEF9C3] flex items-center justify-center shrink-0 border border-yellow-100">
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="12" width="16" height="16" rx="1" fill="#CA8A04" />
        <rect x="15" y="15" width="10" height="10" rx="0.5" fill="#FEF08A" />
        <line x1="12" y1="16" x2="8" y2="16" stroke="#854D0E" strokeWidth="1.6" strokeLinecap="square" />
        <line x1="12" y1="24" x2="8" y2="24" stroke="#854D0E" strokeWidth="1.6" strokeLinecap="square" />
        <line x1="28" y1="16" x2="32" y2="16" stroke="#854D0E" strokeWidth="1.6" strokeLinecap="square" />
        <line x1="28" y1="24" x2="32" y2="24" stroke="#854D0E" strokeWidth="1.6" strokeLinecap="square" />
      </svg>
    </div>
  );
}

function SreBadge() {
  return (
    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xs bg-[#FFE4E6] flex items-center justify-center shrink-0 border border-rose-100">
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="12" stroke="#E11D48" strokeWidth="2" fill="none" />
        <path d="M12 20 L16 20 L18.5 14 L22 26 L24.5 20 L28 20" stroke="#BE123C" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" fill="none" />
      </svg>
    </div>
  );
}

function QaAutomationBadge() {
  return (
    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xs bg-[#D1FAE5] flex items-center justify-center shrink-0 border border-emerald-100">
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="8" width="20" height="24" rx="1" fill="#059669" />
        <path d="M14 16 L17 19 L23 13" stroke="#A7F3D0" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M14 23 L17 26 L23 20" stroke="#A7F3D0" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    </div>
  );
}

function MainframeBadge() {
  return (
    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xs bg-[#E2E8F0] flex items-center justify-center shrink-0 border border-slate-200">
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="9" width="12" height="22" rx="0.5" fill="#334155" />
        <circle cx="12" cy="13" r="1.2" fill="#38BDF8" />
        <circle cx="12" cy="17" r="1.2" fill="#34D399" />
        <path d="M22 20 L26 20 M26 20 L24 17 M26 20 L24 23" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M28 17 C28 15, 29.5 13.5, 31.5 13.5 C33 13.5, 34.2 14.5, 34.6 16 C35.5 16.2, 36 17, 36 18 C36 19.2, 35 20, 33.8 20 L28 20 Z" fill="#60A5FA" />
      </svg>
    </div>
  );
}

function SapErpBadge() {
  return (
    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xs bg-[#DBEAFE] flex items-center justify-center shrink-0 border border-blue-100">
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <rect x="9" y="14" width="22" height="16" rx="1" fill="#1D4ED8" />
        <path d="M9 19 L20 11 L31 19" fill="#1E40AF" />
        <rect x="13" y="21" width="3" height="5" fill="#93C5FD" />
        <rect x="18.5" y="21" width="3" height="5" fill="#93C5FD" />
        <rect x="24" y="21" width="3" height="5" fill="#93C5FD" />
      </svg>
    </div>
  );
}

function ProductManagementBadge() {
  return (
    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xs bg-[#FFEDD5] flex items-center justify-center shrink-0 border border-orange-100">
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="13" width="20" height="16" rx="1" fill="#EA580C" />
        <path d="M16 13 V10 C16 9.2, 16.8 8.5, 17.5 8.5 H22.5 C23.2 8.5, 24 9.2, 24 10 V13" stroke="#C2410C" strokeWidth="1.6" fill="none" />
        <rect x="18" y="19" width="4" height="4" rx="0.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

interface DomainOption {
  id: string;
  name: string;
  description: string;
  category: "student" | "corporate";
  badge: React.ReactNode;
  arrowBorderColor: string;
  arrowTextColor: string;
  arrowHoverBg: string;
}

const DOMAIN_OPTIONS: DomainOption[] = [
  /* ================= 1. STUDENT & CORE FOUNDATIONS ================= */
  {
    id: "web-dev",
    name: "Web Development",
    description: "Build responsive web apps and full-stack solutions.",
    category: "student",
    badge: <WebDevBadge />,
    arrowBorderColor: "border-purple-300",
    arrowTextColor: "text-purple-600",
    arrowHoverBg: "group-hover:bg-purple-50",
  },
  {
    id: "data-science",
    name: "Data Science",
    description: "Analyze data, build predictive models, and extract insights.",
    category: "student",
    badge: <DataScienceBadge />,
    arrowBorderColor: "border-sky-300",
    arrowTextColor: "text-sky-600",
    arrowHoverBg: "group-hover:bg-sky-50",
  },
  {
    id: "ai-ml",
    name: "AI & Machine Learning",
    description: "Train neural networks and build intelligent systems.",
    category: "student",
    badge: <AiMlBadge />,
    arrowBorderColor: "border-emerald-300",
    arrowTextColor: "text-emerald-600",
    arrowHoverBg: "group-hover:bg-emerald-50",
  },
  {
    id: "mobile-dev",
    name: "Mobile Development",
    description: "Create modern Android & iOS apps with Flutter, React Native.",
    category: "student",
    badge: <MobileDevBadge />,
    arrowBorderColor: "border-pink-300",
    arrowTextColor: "text-pink-600",
    arrowHoverBg: "group-hover:bg-pink-50",
  },
  {
    id: "cloud-devops",
    name: "Cloud & DevOps",
    description: "Deploy, automate and scale infrastructure across cloud.",
    category: "student",
    badge: <CloudDevOpsBadge />,
    arrowBorderColor: "border-amber-300",
    arrowTextColor: "text-amber-600",
    arrowHoverBg: "group-hover:bg-amber-50",
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity Fundamentals",
    description: "Learn to defend systems and implement secure practices.",
    category: "student",
    badge: <CybersecurityBadge />,
    arrowBorderColor: "border-indigo-300",
    arrowTextColor: "text-indigo-600",
    arrowHoverBg: "group-hover:bg-indigo-50",
  },
  {
    id: "blockchain-web3",
    name: "Blockchain & Web3",
    description: "Explore smart contracts and next-gen decentralized apps.",
    category: "student",
    badge: <BlockchainBadge />,
    arrowBorderColor: "border-purple-300",
    arrowTextColor: "text-purple-600",
    arrowHoverBg: "group-hover:bg-purple-50",
  },
  {
    id: "game-dev",
    name: "Game Engine & 3D Simulation",
    description: "Build immersive 3D experiences with game engines.",
    category: "student",
    badge: <GameDevBadge />,
    arrowBorderColor: "border-pink-300",
    arrowTextColor: "text-pink-600",
    arrowHoverBg: "group-hover:bg-pink-50",
  },
  {
    id: "ui-ux-design",
    name: "UI/UX & Design Systems",
    description: "Design intuitive interfaces and scalable design systems.",
    category: "student",
    badge: <UiUxDesignBadge />,
    arrowBorderColor: "border-rose-300",
    arrowTextColor: "text-rose-600",
    arrowHoverBg: "group-hover:bg-rose-50",
  },

  /* ================= 2. CORPORATE & ENTERPRISE ENGINEERING ================= */
  {
    id: "gen-ai",
    name: "Generative AI & Enterprise LLMs",
    description: "Build enterprise RAG pipelines and deploy fine-tuned models.",
    category: "corporate",
    badge: <GenAiBadge />,
    arrowBorderColor: "border-purple-300",
    arrowTextColor: "text-purple-600",
    arrowHoverBg: "group-hover:bg-purple-50",
  },
  {
    id: "data-engineering",
    name: "Data Engineering & Big Data",
    description: "Design scalable pipelines with Spark, Databricks, Snowflake.",
    category: "corporate",
    badge: <DataEngineeringBadge />,
    arrowBorderColor: "border-teal-300",
    arrowTextColor: "text-teal-600",
    arrowHoverBg: "group-hover:bg-teal-50",
  },
  {
    id: "enterprise-fullstack",
    name: "Enterprise Java & Microservices",
    description: "Scale high-throughput systems with Spring Boot, Docker & more.",
    category: "corporate",
    badge: <EnterpriseFullStackBadge />,
    arrowBorderColor: "border-blue-300",
    arrowTextColor: "text-blue-600",
    arrowHoverBg: "group-hover:bg-blue-50",
  },
  {
    id: "embedded-iot",
    name: "IoT & Embedded Engineering",
    description: "Smart devices, automotive firmware, RTOS & edge computing.",
    category: "corporate",
    badge: <EmbeddedIotBadge />,
    arrowBorderColor: "border-yellow-300",
    arrowTextColor: "text-yellow-600",
    arrowHoverBg: "group-hover:bg-yellow-50",
  },
  {
    id: "sre-observability",
    name: "SRE & Cloud Observability",
    description: "Zero-downtime reliability, Prometheus metrics & incident response.",
    category: "corporate",
    badge: <SreBadge />,
    arrowBorderColor: "border-rose-300",
    arrowTextColor: "text-rose-600",
    arrowHoverBg: "group-hover:bg-rose-50",
  },
  {
    id: "qa-test-automation",
    name: "QA & Test Automation",
    description: "Selenium, Playwright, automated regression & performance suites.",
    category: "corporate",
    badge: <QaAutomationBadge />,
    arrowBorderColor: "border-emerald-300",
    arrowTextColor: "text-emerald-600",
    arrowHoverBg: "group-hover:bg-emerald-50",
  },
  {
    id: "mainframe-modernization",
    name: "Mainframe & Cloud Migration",
    description: "COBOL modernization, IBM z/OS integration & cloud migration.",
    category: "corporate",
    badge: <MainframeBadge />,
    arrowBorderColor: "border-slate-400",
    arrowTextColor: "text-slate-700",
    arrowHoverBg: "group-hover:bg-slate-100",
  },
  {
    id: "sap-enterprise-erp",
    name: "SAP & Enterprise ERP",
    description: "SAP S/4HANA workflows, ABAP development & supply chain.",
    category: "corporate",
    badge: <SapErpBadge />,
    arrowBorderColor: "border-blue-300",
    arrowTextColor: "text-blue-600",
    arrowHoverBg: "group-hover:bg-blue-50",
  },
  {
    id: "product-management",
    name: "Digital Product Management",
    description: "Agile product roadmapping, sprint delivery & business KPIs.",
    category: "corporate",
    badge: <ProductManagementBadge />,
    arrowBorderColor: "border-orange-300",
    arrowTextColor: "text-orange-600",
    arrowHoverBg: "group-hover:bg-orange-50",
  },
];

function NewGoalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const domainQuery = searchParams?.get("domain");

  const [step, setStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [domain, setDomain] = useState<string>("mobile-dev");
  const [trackPace, setTrackPace] = useState<string>("balanced");
  const [goalText, setGoalText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (domainQuery && DOMAIN_OPTIONS.some((d) => d.id === domainQuery)) {
      setDomain(domainQuery);
    }
  }, [domainQuery]);

  async function createGoal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, trackPace, goalText: goalText || `Master ${domain}` }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not create goal");
      router.push(`/goals/${body.goal.id}/setup`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong creating goal");
      setLoading(false);
    }
  }

  const studentDomains = DOMAIN_OPTIONS.filter(
    (d) =>
      d.category === "student" &&
      (d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const corporateDomains = DOMAIN_OPTIONS.filter(
    (d) =>
      d.category === "corporate" &&
      (d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-[#F8F9FD] text-slate-900 font-sans">
      {/* 1. Left Sidebar Navigation */}
      <AppSidebar
        displayName="yuvi"
        level={1}
        levelTitle="Newcomer"
      />

      {/* 2. Main Scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        <main className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 py-7 space-y-7">
        
        {/* ================= TOP BAR: MY QUESTS + SEARCH & NOTIFICATIONS ================= */}
        {step === 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
            <div>
              <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
                My Quests
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Choose a domain and start your learning journey
              </p>
            </div>

            {/* Right: Search, Notifications & User Avatar (Sharp Edges) */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="relative w-60 sm:w-72">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search quests, topics..."
                  className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xs border border-slate-200/90 bg-white placeholder-slate-400 focus:outline-none focus:border-[#6D28D9] focus:ring-1 focus:ring-[#6D28D9] shadow-2xs transition-all"
                />
              </div>

              <NotificationDropdown />

              <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xs bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] text-xs font-black text-white shadow-2xs">
                K
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 0: 2 SECTIONS (STUDENT & CORPORATE) SHARP EDGES ================= */}
        {step === 0 && (
          <div className="space-y-8">
            
            {/* ---------------- SECTION 1: STUDENT & CORE FOUNDATIONS ---------------- */}
            {studentDomains.length > 0 && (
              <div className="space-y-3.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-base sm:text-[17px] font-black text-slate-900">
                      Student & Core Foundations
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-xs bg-purple-100/80 text-[#6D28D9]">
                      9 Programs
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Career-starting curricula, software fundamentals, and practical project tracks
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 sm:gap-5">
                  {studentDomains.map((d) => {
                    const isSelected = domain === d.id;
                    return (
                      <div
                        key={d.id}
                        onClick={() => {
                          setDomain(d.id);
                          setStep(1);
                        }}
                        className={`group relative flex items-center justify-between gap-4 rounded-xs border bg-white p-4.5 sm:p-5 transition-all duration-150 cursor-pointer min-h-[105px] ${
                          isSelected
                            ? "border-2 border-indigo-400 shadow-sm"
                            : "border-slate-200/90 hover:border-purple-300 hover:shadow-xs"
                        }`}
                      >
                        {/* Left: Sharp Icon Avatar */}
                        {d.badge}

                        {/* Middle: Title & Description */}
                        <div className="flex-1 min-w-0 pr-1">
                          <div
                            className={`text-sm sm:text-[15px] font-extrabold transition-colors leading-snug ${
                              isSelected ? "text-indigo-600" : "text-slate-900 group-hover:text-[#6D28D9]"
                            }`}
                          >
                            {d.name}
                          </div>
                          <div className="mt-1 text-xs text-slate-500 font-normal leading-relaxed line-clamp-2">
                            {d.description}
                          </div>
                        </div>

                        {/* Right: Outline Square Arrow Button */}
                        <div
                          className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-xs border ${d.arrowBorderColor} ${d.arrowTextColor} ${d.arrowHoverBg} bg-white transition-transform duration-150 group-hover:translate-x-0.5 shadow-2xs`}
                        >
                          <IconArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ---------------- SECTION 2: CORPORATE & ENTERPRISE ENGINEERING ---------------- */}
            {corporateDomains.length > 0 && (
              <div className="space-y-3.5 pt-1">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-base sm:text-[17px] font-black text-slate-900">
                      Corporate & Enterprise Engineering
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Production microservices, GenAI, ERP, reliability & industrial embedded systems
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 sm:gap-5">
                  {corporateDomains.map((d) => {
                    const isSelected = domain === d.id;
                    return (
                      <div
                        key={d.id}
                        onClick={() => {
                          setDomain(d.id);
                          setStep(1);
                        }}
                        className={`group relative flex items-center justify-between gap-4 rounded-xs border bg-white p-4.5 sm:p-5 transition-all duration-150 cursor-pointer min-h-[105px] ${
                          isSelected
                            ? "border-2 border-indigo-400 shadow-sm"
                            : "border-slate-200/90 hover:border-indigo-300 hover:shadow-xs"
                        }`}
                      >
                        {/* Left: Sharp Icon Avatar */}
                        {d.badge}

                        {/* Middle: Title & Description */}
                        <div className="flex-1 min-w-0 pr-1">
                          <div
                            className={`text-sm sm:text-[15px] font-extrabold transition-colors leading-snug ${
                              isSelected ? "text-indigo-600" : "text-slate-900 group-hover:text-indigo-700"
                            }`}
                          >
                            {d.name}
                          </div>
                          <div className="mt-1 text-xs text-slate-500 font-normal leading-relaxed line-clamp-2">
                            {d.description}
                          </div>
                        </div>

                        {/* Right: Outline Square Arrow Button */}
                        <div
                          className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-xs border ${d.arrowBorderColor} ${d.arrowTextColor} ${d.arrowHoverBg} bg-white transition-transform duration-150 group-hover:translate-x-0.5 shadow-2xs`}
                        >
                          <IconArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= STEP 1: PACE SELECTION (SHARP EDGES) ================= */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => setStep(0)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xs border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
                title="Go Back"
              >
                <IconChevronLeft className="h-4.5 w-4.5 stroke-[2.2]" />
              </button>
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#6D28D9]">
                  GOAL SETUP · STEP 2 OF 3
                </div>
                <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight leading-tight">
                  Choose Learning Pace
                </h1>
              </div>
            </div>

            <div className="rounded-xs border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-100/80">
                <div className="flex h-9 w-9 items-center justify-center rounded-xs bg-purple-50 text-[#6D28D9] border border-purple-100 shadow-2xs shrink-0">
                  <IconClock className="h-4.5 w-4.5 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    Dedicated Time Commitment
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    How many hours per week will you dedicate to this goal?
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {TRACK_PACES.map((t) => {
                  const selected = trackPace === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTrackPace(t.id)}
                      className={`flex w-full items-center justify-between rounded-xs border-2 p-4 text-left transition-all duration-150 cursor-pointer ${
                        selected
                          ? "border-[#7C3AED] bg-[#FAF8FE] shadow-[0_0_12px_rgba(124,58,237,0.1)]"
                          : "border-slate-200 bg-white hover:border-[#7C3AED] hover:shadow-2xs"
                      }`}
                    >
                      <div>
                        <div className="text-sm sm:text-base font-bold text-slate-900">{t.name}</div>
                        <div className="mt-0.5 text-xs text-slate-500">{t.description}</div>
                      </div>
                      <span
                        className={`rounded-xs px-3 py-1 text-xs font-bold transition-colors ${
                          selected
                            ? "bg-[#7C3AED] text-white"
                            : "border border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        ~{t.hoursPerWeek} hrs/wk
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
                <button
                  onClick={() => setStep(0)}
                  className="inline-flex items-center gap-1.5 rounded-xs border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <IconArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <button
                  disabled={!trackPace}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 rounded-xs bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] px-6 py-2 text-xs font-extrabold text-white shadow-2xs transition-all hover:opacity-90 active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <span>Define Objective</span>
                  <IconArrowRight className="h-4 w-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: GOAL OBJECTIVE & INTAKE (SHARP EDGES) ================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => setStep(1)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xs border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
                title="Go Back"
              >
                <IconChevronLeft className="h-4.5 w-4.5 stroke-[2.2]" />
              </button>
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#6D28D9]">
                  GOAL SETUP · STEP 3 OF 3
                </div>
                <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight leading-tight">
                  State Your Target Objective
                </h1>
              </div>
            </div>

            <div className="rounded-xs border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
              <div className="mb-5">
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Learning Roadmap Intent
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Describe what you want to achieve. Claude AI will parse your goal into an exact topological skill DAG.
                </p>
              </div>

              <textarea
                rows={4}
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                placeholder="e.g. I want to master Enterprise GenAI and build production RAG agents for cloud workloads."
                className="w-full rounded-xs border border-slate-200 bg-slate-50/50 p-3.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 shadow-inner focus:border-[#7C3AED] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
              />

              {error && (
                <div className="mt-3 rounded-xs border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600">
                  {error}
                </div>
              )}

              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 rounded-xs border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <IconArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <button
                  disabled={loading}
                  onClick={createGoal}
                  className="inline-flex items-center gap-1.5 rounded-xs bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] px-6 py-2 text-xs font-extrabold text-white shadow-2xs transition-all hover:opacity-90 active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? "Creating Goal..." : "Initiate Diagnostic Intake"}</span>
                  <IconArrowRight className="h-4 w-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
      </div>
    </div>
  );
}

export default function NewGoalPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#FAFBFD] text-slate-500 font-sans text-xs">Loading Quest Wizard...</div>}>
      <NewGoalForm />
    </Suspense>
  );
}
