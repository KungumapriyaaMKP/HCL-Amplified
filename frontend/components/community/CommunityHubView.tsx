"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DomainIcon } from "@/frontend/components/ui/DomainIcon";
import {
  IconArrowRight,
  IconSearch,
  IconUsers,
  IconMessage2,
  IconSparkles,
  IconFlame,
  IconShieldCheck,
  IconCompass,
  IconBolt,
} from "@tabler/icons-react";

export type CommunityDomainItem = {
  id: string;
  name: string;
  memberCount: number;
  postCount: number;
};

const DOMAIN_DETAILS: Record<
  string,
  {
    tagline: string;
    tags: string[];
    category: "engineering" | "ai-data" | "cloud-sec";
    accentColor: string;
    borderColor: string;
    borderHover: string;
    shadowHover: string;
    bgGradient: string;
    badgeBg: string;
    badgeText: string;
    iconBg: string;
    iconColor: string;
  }
> = {
  "web-dev": {
    tagline: "Build reactive user interfaces, scalable full-stack applications, and performant APIs.",
    tags: ["React", "TypeScript", "Next.js", "Full-Stack"],
    category: "engineering",
    accentColor: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    borderHover: "hover:border-cyan-400",
    shadowHover: "hover:shadow-[0_0_35px_rgba(6,182,212,0.35)]",
    bgGradient: "from-cyan-950/20 via-[#0d1226] to-[#080b18]",
    badgeBg: "bg-cyan-950/60 border-cyan-500/40",
    badgeText: "text-cyan-300",
    iconBg: "bg-cyan-950/80 border-cyan-500/40",
    iconColor: "text-cyan-400",
  },
  "data-science": {
    tagline: "Analyze complex datasets, build statistical models, and extract high-value insights.",
    tags: ["Python", "Pandas", "SQL", "EDA"],
    category: "ai-data",
    accentColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    borderHover: "hover:border-amber-400",
    shadowHover: "hover:shadow-[0_0_35px_rgba(245,158,11,0.35)]",
    bgGradient: "from-amber-950/20 via-[#0d1226] to-[#080b18]",
    badgeBg: "bg-amber-950/60 border-amber-500/40",
    badgeText: "text-amber-300",
    iconBg: "bg-amber-950/80 border-amber-500/40",
    iconColor: "text-amber-400",
  },
  "ai-ml": {
    tagline: "Train machine learning models, leverage neural architectures, and build autonomous agents.",
    tags: ["PyTorch", "LLMs", "RAG", "Agents"],
    category: "ai-data",
    accentColor: "text-purple-400",
    borderColor: "border-purple-500/30",
    borderHover: "hover:border-purple-400",
    shadowHover: "hover:shadow-[0_0_35px_rgba(168,85,247,0.4)]",
    bgGradient: "from-purple-950/20 via-[#0d1226] to-[#080b18]",
    badgeBg: "bg-purple-950/60 border-purple-500/40",
    badgeText: "text-purple-300",
    iconBg: "bg-purple-950/80 border-purple-500/40",
    iconColor: "text-purple-400",
  },
  "cloud-devops": {
    tagline: "Automate deployment pipelines, orchestrate containers, and architect cloud infrastructure.",
    tags: ["Docker", "Kubernetes", "AWS", "CI/CD"],
    category: "cloud-sec",
    accentColor: "text-sky-400",
    borderColor: "border-sky-500/30",
    borderHover: "hover:border-sky-400",
    shadowHover: "hover:shadow-[0_0_35px_rgba(56,189,248,0.35)]",
    bgGradient: "from-sky-950/20 via-[#0d1226] to-[#080b18]",
    badgeBg: "bg-sky-950/60 border-sky-500/40",
    badgeText: "text-sky-300",
    iconBg: "bg-sky-950/80 border-sky-500/40",
    iconColor: "text-sky-400",
  },
  "mobile-dev": {
    tagline: "Engineer native and cross-platform mobile experiences for iOS and Android ecosystems.",
    tags: ["React Native", "Flutter", "Swift", "Android"],
    category: "engineering",
    accentColor: "text-pink-400",
    borderColor: "border-pink-500/30",
    borderHover: "hover:border-pink-400",
    shadowHover: "hover:shadow-[0_0_35px_rgba(236,72,153,0.35)]",
    bgGradient: "from-pink-950/20 via-[#0d1226] to-[#080b18]",
    badgeBg: "bg-pink-950/60 border-pink-500/40",
    badgeText: "text-pink-300",
    iconBg: "bg-pink-950/80 border-pink-500/40",
    iconColor: "text-pink-400",
  },
  "cybersecurity": {
    tagline: "Defend networks, analyze security postures, and implement zero-trust cryptographic defense.",
    tags: ["SecOps", "Zero-Trust", "PenTesting", "Crypto"],
    category: "cloud-sec",
    accentColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    borderHover: "hover:border-emerald-400",
    shadowHover: "hover:shadow-[0_0_35px_rgba(16,185,129,0.35)]",
    bgGradient: "from-emerald-950/20 via-[#0d1226] to-[#080b18]",
    badgeBg: "bg-emerald-950/60 border-emerald-500/40",
    badgeText: "text-emerald-300",
    iconBg: "bg-emerald-950/80 border-emerald-500/40",
    iconColor: "text-emerald-400",
  },
};

const DOMAIN_IMAGES: Record<string, string> = {
  "web-dev": "/guilds/web-dev.png",
  "data-science": "/guilds/data-science.png",
  "ai-ml": "/guilds/ai-ml.png",
  "cloud-devops": "/guilds/cloud-devops.png",
  "mobile-dev": "/guilds/mobile-dev.png",
  "cybersecurity": "/guilds/cybersecurity.png",
};

export function CommunityHubView({ domains }: { domains: CommunityDomainItem[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | "engineering" | "ai-data" | "cloud-sec">("all");

  const filteredDomains = domains.filter((d) => {
    const meta = DOMAIN_DETAILS[d.id];
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      meta?.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      meta?.tagline.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = category === "all" || meta?.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Interactive Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border border-purple-500/20 bg-[#0c1026]/90 p-4 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by domain name, topic or skill (e.g. React, LLMs, Docker)..."
            className="w-full border border-purple-500/30 bg-[#070918] py-2.5 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setCategory("all")}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border ${
              category === "all"
                ? "border-cyan-400 bg-cyan-950/80 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "border-purple-500/20 bg-[#070918] text-slate-400 hover:text-white hover:border-purple-500/40"
            }`}
          >
            All Hubs
          </button>
          <button
            onClick={() => setCategory("engineering")}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border ${
              category === "engineering"
                ? "border-cyan-400 bg-cyan-950/80 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "border-purple-500/20 bg-[#070918] text-slate-400 hover:text-white hover:border-purple-500/40"
            }`}
          >
            Engineering
          </button>
          <button
            onClick={() => setCategory("ai-data")}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border ${
              category === "ai-data"
                ? "border-purple-400 bg-purple-950/80 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                : "border-purple-500/20 bg-[#070918] text-slate-400 hover:text-white hover:border-purple-500/40"
            }`}
          >
            AI & Data
          </button>
          <button
            onClick={() => setCategory("cloud-sec")}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border ${
              category === "cloud-sec"
                ? "border-emerald-400 bg-emerald-950/80 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                : "border-purple-500/20 bg-[#070918] text-slate-400 hover:text-white hover:border-purple-500/40"
            }`}
          >
            Cloud & Security
          </button>
        </div>
      </div>

      {/* Domain Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDomains.map((d) => {
          const meta = DOMAIN_DETAILS[d.id] || {
            tagline: `Community dedicated to discussions and collaboration in ${d.name}.`,
            tags: ["Collaboration", "Concepts", "Code"],
            category: "engineering",
            accentColor: "text-purple-400",
            borderColor: "border-purple-500/30",
            borderHover: "hover:border-purple-400",
            shadowHover: "hover:shadow-[0_0_30px_rgba(168,85,247,0.35)]",
            bgGradient: "from-purple-950/20 via-[#0d1226] to-[#080b18]",
            badgeBg: "bg-purple-950/60 border-purple-500/40",
            badgeText: "text-purple-300",
            iconBg: "bg-purple-950/80 border-purple-500/40",
            iconColor: "text-purple-400",
          };

          return (
            <Link key={d.id} href={`/community/${d.id}`} className="group block h-full select-none">
              <div
                className={`relative flex h-full flex-col justify-between overflow-hidden border-2 border-purple-500/25 bg-gradient-to-b ${meta.bgGradient} p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 ${meta.borderHover} ${meta.shadowHover} group-hover:-translate-y-1.5`}
              >
                {/* Cyber Corner Targeting Brackets */}
                <div className="pointer-events-none absolute -top-1 -right-1 h-4 w-4 border-t-2 border-r-2 border-purple-400 opacity-60 group-hover:opacity-100 group-hover:border-cyan-400 transition-all" />
                <div className="pointer-events-none absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-purple-400 opacity-60 group-hover:opacity-100 group-hover:border-cyan-400 transition-all" />

                {/* Top Hub Row */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div
                      className={`relative flex h-16 w-16 items-center justify-center border-2 ${meta.iconBg} ${meta.iconColor} shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden transition-transform duration-300 group-hover:scale-105`}
                    >
                      {DOMAIN_IMAGES[d.id] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={DOMAIN_IMAGES[d.id]}
                          alt={d.name}
                          className="h-full w-full object-contain p-1.5 bg-[#090d20]"
                        />
                      ) : (
                        <DomainIcon id={d.id} className="h-8 w-8" />
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 border border-emerald-500/30 bg-emerald-950/70 px-2 py-1">
                      <span className="h-1.5 w-1.5 bg-emerald-400 animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300">
                        ACTIVE GUILD
                      </span>
                    </div>
                  </div>

                  <h2
                    className={`text-xl font-black text-white group-hover:${meta.accentColor} transition-colors drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]`}
                  >
                    {d.name}
                  </h2>

                  <p className="mt-2 text-xs text-slate-300 leading-relaxed font-medium min-h-[36px]">
                    {meta.tagline}
                  </p>

                  {/* Skill Tag Pills */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {meta.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-bold tracking-wide text-slate-400 border border-purple-500/20 bg-[#070918]/80 px-2 py-0.5 group-hover:border-purple-400/40 group-hover:text-purple-200 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Hub Actions & Metrics */}
                <div className="mt-6 pt-4 border-t border-purple-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <div className="flex items-center gap-1.5 text-cyan-300">
                      <IconUsers className="h-3.5 w-3.5" />
                      <span>{d.memberCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-purple-300">
                      <IconMessage2 className="h-3.5 w-3.5" />
                      <span>{d.postCount}</span>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-white border border-purple-400/40 bg-gradient-to-r from-purple-700 via-indigo-600 to-fuchsia-600 px-3.5 py-1.5 shadow-[0_0_15px_rgba(147,51,234,0.4)] group-hover:brightness-110 group-hover:shadow-[0_0_20px_rgba(147,51,234,0.7)] transition-all`}
                  >
                    <span>ENTER HUB</span>
                    <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filteredDomains.length === 0 && (
        <div className="border-2 border-dashed border-purple-500/30 bg-[#0d1226]/60 p-12 text-center">
          <IconSearch className="h-8 w-8 text-purple-400 mx-auto mb-2 opacity-60" />
          <h3 className="text-base font-bold text-white">No Matching Domain Hubs</h3>
          <p className="mt-1 text-xs text-slate-400">
            Try searching for another skill term or click &ldquo;All Hubs&rdquo; to reset.
          </p>
        </div>
      )}

      {/* Community Collaboration Guidelines Banner */}
      <div className="border border-purple-500/30 bg-gradient-to-r from-[#0d1226]/90 via-purple-950/40 to-[#0d1226]/90 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-cyan-400/40 bg-cyan-950/80 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <IconSparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Peer-Driven Knowledge Acceleration
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Share modular code solutions, debug complex diagnostic errors, and earn XP recognition from fellow learners.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 border border-cyan-400/50 bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-black text-white uppercase shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95 transition-all shrink-0"
          >
            <IconBolt className="h-3.5 w-3.5" />
            <span>Launch Quest</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
