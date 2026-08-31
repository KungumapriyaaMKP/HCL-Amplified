"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  WebDevPastelIllustration,
  DataSciencePastelIllustration,
  AiMlPastelIllustration,
  CloudDevOpsPastelIllustration,
  MobileDevPastelIllustration,
  CybersecurityPastelIllustration,
} from "@/frontend/components/dashboard/Illustrations";
import {
  IconArrowRight,
  IconSearch,
  IconUsers,
  IconMessage2,
  IconSparkles,
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
    Illustration: React.ComponentType<{ className?: string }>;
    badgeBg: string;
    badgeText: string;
    accentColor: string;
  }
> = {
  "web-dev": {
    tagline: "Build reactive user interfaces, full-stack applications, and performant APIs.",
    tags: ["React", "TypeScript", "Next.js", "Full-Stack"],
    category: "engineering",
    Illustration: WebDevPastelIllustration,
    badgeBg: "bg-indigo-50 border-indigo-200",
    badgeText: "text-indigo-700",
    accentColor: "text-indigo-600",
  },
  "data-science": {
    tagline: "Analyze complex datasets, build statistical models, and extract high-value insights.",
    tags: ["Python", "Pandas", "SQL", "EDA"],
    category: "ai-data",
    Illustration: DataSciencePastelIllustration,
    badgeBg: "bg-sky-50 border-sky-200",
    badgeText: "text-sky-700",
    accentColor: "text-sky-600",
  },
  "ai-ml": {
    tagline: "Train machine learning models, leverage neural architectures, and build autonomous agents.",
    tags: ["PyTorch", "LLMs", "RAG", "Agents"],
    category: "ai-data",
    Illustration: AiMlPastelIllustration,
    badgeBg: "bg-emerald-50 border-emerald-200",
    badgeText: "text-emerald-700",
    accentColor: "text-emerald-600",
  },
  "cloud-devops": {
    tagline: "Automate deployment pipelines, orchestrate containers, and architect cloud infrastructure.",
    tags: ["Docker", "Kubernetes", "AWS", "CI/CD"],
    category: "cloud-sec",
    Illustration: CloudDevOpsPastelIllustration,
    badgeBg: "bg-amber-50 border-amber-200",
    badgeText: "text-amber-700",
    accentColor: "text-amber-600",
  },
  "mobile-dev": {
    tagline: "Engineer native and cross-platform mobile experiences for iOS and Android ecosystems.",
    tags: ["React Native", "Flutter", "Swift", "iOS"],
    category: "engineering",
    Illustration: MobileDevPastelIllustration,
    badgeBg: "bg-pink-50 border-pink-200",
    badgeText: "text-pink-700",
    accentColor: "text-pink-600",
  },
  "cybersecurity": {
    tagline: "Defend networks, analyze security postures, and implement zero-trust defense.",
    tags: ["SecOps", "Zero-Trust", "PenTesting", "Crypto"],
    category: "cloud-sec",
    Illustration: CybersecurityPastelIllustration,
    badgeBg: "bg-purple-50 border-purple-200",
    badgeText: "text-purple-700",
    accentColor: "text-purple-600",
  },
  "gen-ai": {
    tagline: "Build enterprise RAG pipelines, fine-tune LLMs, and deploy multi-agent cognitive systems.",
    tags: ["LangChain", "RAG", "LlamaIndex", "Enterprise AI"],
    category: "ai-data",
    Illustration: AiMlPastelIllustration,
    badgeBg: "bg-fuchsia-50 border-fuchsia-200",
    badgeText: "text-fuchsia-700",
    accentColor: "text-fuchsia-600",
  },
  "data-engineering": {
    tagline: "Design real-time ETL pipelines, data warehouses, and streaming architectures at scale.",
    tags: ["Apache Spark", "Databricks", "Snowflake", "Kafka"],
    category: "ai-data",
    Illustration: DataSciencePastelIllustration,
    badgeBg: "bg-teal-50 border-teal-200",
    badgeText: "text-teal-700",
    accentColor: "text-teal-600",
  },
  "enterprise-fullstack": {
    tagline: "Architect high-concurrency microservices, robust backends, and enterprise systems.",
    tags: ["Java", "Spring Boot", "Microservices", "Docker"],
    category: "engineering",
    Illustration: WebDevPastelIllustration,
    badgeBg: "bg-indigo-50 border-indigo-200",
    badgeText: "text-indigo-700",
    accentColor: "text-indigo-600",
  },
  "embedded-iot": {
    tagline: "Engineer connected smart hardware, automotive firmware, and real-time edge devices.",
    tags: ["Embedded C", "RTOS", "IoT", "Automotive"],
    category: "engineering",
    Illustration: MobileDevPastelIllustration,
    badgeBg: "bg-yellow-50 border-yellow-200",
    badgeText: "text-yellow-700",
    accentColor: "text-yellow-600",
  },
  "sre-observability": {
    tagline: "Ensure high-availability, automated incident response, and end-to-end cloud observability.",
    tags: ["Kubernetes", "Prometheus", "Grafana", "Chaos Eng"],
    category: "cloud-sec",
    Illustration: CloudDevOpsPastelIllustration,
    badgeBg: "bg-rose-50 border-rose-200",
    badgeText: "text-rose-700",
    accentColor: "text-rose-600",
  },
  "product-management": {
    tagline: "Lead digital transformation, roadmap development, agile sprints, and value delivery.",
    tags: ["Agile/Scrum", "Product Strategy", "KPIs", "Design Thinking"],
    category: "engineering",
    Illustration: WebDevPastelIllustration,
    badgeBg: "bg-orange-50 border-orange-200",
    badgeText: "text-orange-700",
    accentColor: "text-orange-600",
  },
  "qa-test-automation": {
    tagline: "Automate cross-browser regression testing, load testing, and enterprise quality assurance.",
    tags: ["Selenium", "Playwright", "Cypress", "JMeter", "Test Automation"],
    category: "engineering",
    Illustration: WebDevPastelIllustration,
    badgeBg: "bg-emerald-50 border-emerald-200",
    badgeText: "text-emerald-700",
    accentColor: "text-emerald-600",
  },
  "blockchain-web3": {
    tagline: "Develop decentralized applications, smart contract protocols, and cryptographically verified systems.",
    tags: ["Solidity", "Ethereum", "Smart Contracts", "Web3"],
    category: "cloud-sec",
    Illustration: CybersecurityPastelIllustration,
    badgeBg: "bg-purple-50 border-purple-200",
    badgeText: "text-purple-700",
    accentColor: "text-purple-600",
  },
  "mainframe-modernization": {
    tagline: "Modernize legacy enterprise mainframes, migrate COBOL workloads, and bridge hybrid cloud architectures.",
    tags: ["COBOL", "IBM z/OS", "Cloud Migration", "Enterprise Modernization"],
    category: "engineering",
    Illustration: CloudDevOpsPastelIllustration,
    badgeBg: "bg-slate-100 border-slate-300",
    badgeText: "text-slate-700",
    accentColor: "text-slate-600",
  },
  "sap-enterprise-erp": {
    tagline: "Configure enterprise workflows, implement SAP S/4HANA modules, and develop ABAP solutions.",
    tags: ["SAP S/4HANA", "ABAP", "ERP", "Supply Chain"],
    category: "engineering",
    Illustration: DataSciencePastelIllustration,
    badgeBg: "bg-blue-50 border-blue-200",
    badgeText: "text-blue-700",
    accentColor: "text-blue-600",
  },
  "game-dev": {
    tagline: "Build 2D/3D interactive game experiences, physics simulation engines, and graphics shaders.",
    tags: ["Unity", "Unreal Engine", "C#", "C++", "Shaders"],
    category: "engineering",
    Illustration: MobileDevPastelIllustration,
    badgeBg: "bg-pink-50 border-pink-200",
    badgeText: "text-pink-700",
    accentColor: "text-pink-600",
  },
  "ui-ux-design": {
    tagline: "Craft cohesive design systems, user journey maps, Figma components, and accessibility standards.",
    tags: ["Figma", "Design Systems", "User Research", "Prototyping"],
    category: "engineering",
    Illustration: WebDevPastelIllustration,
    badgeBg: "bg-fuchsia-50 border-fuchsia-200",
    badgeText: "text-fuchsia-700",
    accentColor: "text-fuchsia-600",
  },
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
      {/* Search & Filter Controls (Sharp Edges) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-xs border border-slate-200/90 bg-white p-4 shadow-2xs">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search guilds by skill, topic or framework"
            placeholder="Search guilds by skill, topic or framework (e.g. React, PyTorch, Docker)..."
            className="w-full rounded-xs border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-[#7C3AED] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7C3AED] transition-all"
          />
        </div>

        {/* Category Filters (Sharp Edges) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCategory("all")}
            className={`px-3.5 py-1.5 rounded-xs text-xs font-bold transition-all cursor-pointer ${
              category === "all"
                ? "bg-[#7C3AED] text-white shadow-2xs"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            All Guilds
          </button>
          <button
            onClick={() => setCategory("engineering")}
            className={`px-3.5 py-1.5 rounded-xs text-xs font-bold transition-all cursor-pointer ${
              category === "engineering"
                ? "bg-[#7C3AED] text-white shadow-2xs"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Engineering
          </button>
          <button
            onClick={() => setCategory("ai-data")}
            className={`px-3.5 py-1.5 rounded-xs text-xs font-bold transition-all cursor-pointer ${
              category === "ai-data"
                ? "bg-[#7C3AED] text-white shadow-2xs"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            AI & Data
          </button>
          <button
            onClick={() => setCategory("cloud-sec")}
            className={`px-3.5 py-1.5 rounded-xs text-xs font-bold transition-all cursor-pointer ${
              category === "cloud-sec"
                ? "bg-[#7C3AED] text-white shadow-2xs"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Cloud & Security
          </button>
        </div>
      </div>

      {/* Guild Cards Grid (Sharp Edges) */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDomains.map((d) => {
          const meta = DOMAIN_DETAILS[d.id] || {
            tagline: `Community dedicated to discussions and collaboration in ${d.name}.`,
            tags: ["Collaboration", "Concepts", "Code"],
            category: "engineering",
            Illustration: WebDevPastelIllustration,
            badgeBg: "bg-purple-50 border-purple-200",
            badgeText: "text-purple-700",
            accentColor: "text-purple-600",
          };
          const Illustration = meta.Illustration;

          return (
            <Link key={d.id} href={`/community/${d.id}`} className="group block h-full select-none">
              <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-xs border border-slate-200/90 bg-white p-6 shadow-2xs transition-all duration-200 hover:border-purple-300 hover:shadow-sm hover:-translate-y-0.5">
                
                {/* Top Row */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-xs bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-xs">
                        ACTIVE GUILD
                      </span>
                    </div>

                    <div className="shrink-0">
                      <Illustration className="w-20 h-16 pointer-events-none" />
                    </div>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#7C3AED] transition-colors">
                    {d.name}
                  </h2>

                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-normal min-h-[36px]">
                    {meta.tagline}
                  </p>

                  {/* Skill Tag Pills */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {meta.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold text-slate-600 border border-slate-200 bg-slate-50 px-2 py-0.5 rounded-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Hub Actions & Metrics */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-1">
                      <IconUsers className="h-3.5 w-3.5 text-slate-400" />
                      <span>{d.memberCount} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconMessage2 className="h-3.5 w-3.5 text-slate-400" />
                      <span>{d.postCount} posts</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-white rounded-xs bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] px-3.5 py-1.5 shadow-2xs group-hover:opacity-95 transition-all">
                    <span>Enter Hub</span>
                    <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>

              </div>
            </Link>
          );
        })}
      </div>

      {filteredDomains.length === 0 && (
        <div className="rounded-xs border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <IconSearch className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900">No Matching Guilds</h3>
          <p className="mt-1 text-xs text-slate-500">
            Try searching for another skill term or click &ldquo;All Guilds&rdquo; to reset.
          </p>
        </div>
      )}

      {/* Community Collaboration Guidelines Banner (Sharp Edges) */}
      <div className="rounded-xs border border-slate-200/90 bg-gradient-to-r from-purple-50 via-white to-blue-50 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xs bg-purple-100 text-[#7C3AED] shadow-2xs">
              <IconSparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Peer-Driven Knowledge Acceleration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Share modular code solutions, debug complex diagnostic errors, and earn XP recognition from fellow learners.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xs bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:opacity-95 active:scale-98 transition-all shrink-0"
          >
            <span>Explore Dashboard</span>
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
