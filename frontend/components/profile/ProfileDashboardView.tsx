"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProgressBar } from "@/frontend/components/ui/progress-bar";
import { Badge } from "@/frontend/components/ui/badge";
import type { DashboardData } from "@/lib/dashboardData";
import {
  IconBolt,
  IconFlame,
  IconShieldCheck,
  IconFileText,
  IconArrowRight,
  IconBriefcase,
  IconTarget,
  IconAward,
  IconSearch,
  IconActivity,
  IconBrain,
  IconCalendar,
  IconAdjustments,
  IconRefresh,
  IconCompass,
  IconSparkles,
  IconChevronRight,
  IconCheck,
} from "@tabler/icons-react";

const TIER_CLASSES = [
  "bg-[#090d1f] border border-white/5",
  "bg-purple-950/80 border border-purple-600/40 text-purple-300",
  "bg-purple-700/70 border border-purple-500/60 shadow-[0_0_8px_rgba(168,85,247,0.4)]",
  "bg-purple-500 border border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.7)]",
  "bg-cyan-400 border border-white shadow-[0_0_15px_rgba(6,182,212,0.9)]",
];

function tierFor(count: number): number {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getRankBadge(score: number) {
  if (score >= 85) return { label: "MASTER", color: "text-amber-300 border-amber-500/50 bg-amber-950/70 shadow-[0_0_10px_rgba(245,158,11,0.3)]" };
  if (score >= 70) return { label: "EXPERT", color: "text-purple-300 border-purple-500/50 bg-purple-950/70 shadow-[0_0_10px_rgba(168,85,247,0.3)]" };
  if (score >= 50) return { label: "ADEPT", color: "text-cyan-300 border-cyan-500/50 bg-cyan-950/70 shadow-[0_0_10px_rgba(6,182,212,0.3)]" };
  return { label: "NOVICE", color: "text-slate-400 border-slate-700 bg-slate-900/80" };
}

const TRIGGER_TONE: Record<string, "success" | "warning" | "accent" | "cyan"> = {
  low_proctored_score: "warning",
  high_proctored_score: "success",
  feedback_too_easy: "cyan",
  feedback_too_hard: "accent",
};

export function ProfileDashboardView({
  data,
  userEmail,
}: {
  data: DashboardData;
  userEmail?: string;
}) {
  const profile = data.profile;
  const gamification = data.gamification;
  const pct = gamification.xpForNextLevel > 0 ? (gamification.xpIntoLevel / gamification.xpForNextLevel) * 100 : 0;
  const hasFace = !!profile?.faceDescriptor;
  const resume = profile?.resumeProfile as {
    currentRole?: string;
    careerGoal?: string;
    yearsExperience?: number;
    summary?: string;
  } | null;

  const [skillTab, setSkillTab] = useState<"mastery" | "retention">("mastery");
  const [skillSearch, setSkillSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | "master" | "expert" | "adept" | "novice">("all");

  const filteredMastery = data.mastery.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(skillSearch.toLowerCase());
    const rank = getRankBadge(m.score).label.toLowerCase();
    const matchesTier = tierFilter === "all" || rank === tierFilter;
    return matchesSearch && matchesTier;
  });

  const fadingFoundational = data.decay.filter(
    (d) => d.foundational && d.tier !== "fresh" && data.reviewSuggestions[d.skillId]
  );

  // Activity Heatmap padding
  const hasActivity = data.activity.some((d) => d.count > 0);
  const firstDow = data.activity.length > 0 ? new Date(data.activity[0].date + "T00:00:00").getDay() : 0;
  const padded = [...Array.from({ length: firstDow }, () => null), ...data.activity];
  const weeks: (DashboardData["activity"][number] | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));

  return (
    <div className="space-y-8">
      
      {/* Top Grid: Hero Identity + Credentials */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Left: Main Identity Card (7 cols) */}
        <div className="lg:col-span-7">
          <div className="relative h-full overflow-hidden border-2 border-purple-500/30 bg-[#0c1026]/90 p-6 sm:p-7 shadow-[0_0_35px_rgba(139,92,246,0.25)] backdrop-blur-2xl">
            
            {/* Cyber Corner Brackets */}
            <div className="pointer-events-none absolute -top-1 -right-1 h-5 w-5 border-t-2 border-r-2 border-cyan-400" />
            <div className="pointer-events-none absolute -bottom-1 -left-1 h-5 w-5 border-b-2 border-l-2 border-purple-400" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              
              {/* Sci-Fi Avatar Hologram */}
              <div className="relative flex h-22 w-22 shrink-0 items-center justify-center border-2 border-purple-400/60 bg-gradient-to-tr from-purple-900 via-fuchsia-700 to-indigo-900 p-1 shadow-[0_0_25px_rgba(168,85,247,0.6)]">
                <div className="flex h-full w-full flex-col items-center justify-center bg-[#090c20] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent animate-pulse" />
                  <span className="text-3xl font-black text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]">
                    {profile?.displayName?.[0]?.toUpperCase() || "L"}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
                    LVL {gamification.level}
                  </span>
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-purple-300">
                    {gamification.levelTitle}
                  </span>
                  <span className="border border-emerald-500/40 bg-emerald-950/70 px-2 py-0.5 text-[9px] font-black text-emerald-300 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-emerald-400 animate-pulse" />
                    ONLINE
                  </span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)] mt-0.5">
                  {profile?.displayName || "Learner"}
                </h2>
                <p className="text-xs text-slate-400">{userEmail}</p>

                {/* Quick Stat Badges */}
                <div className="mt-3.5 flex flex-wrap items-center gap-2.5 text-xs">
                  <div className="flex items-center gap-1.5 border border-amber-500/40 bg-amber-950/60 px-3 py-1 text-amber-300 font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                    <IconBolt className="h-4 w-4 text-amber-400" />
                    <span>{gamification.xp.toLocaleString()} XP</span>
                  </div>

                  <div className="flex items-center gap-1.5 border border-orange-500/40 bg-orange-950/60 px-3 py-1 text-orange-300 font-bold shadow-[0_0_12px_rgba(249,115,22,0.2)]">
                    <IconFlame className="h-4 w-4 text-orange-400" />
                    <span>{gamification.streak.currentStreak} Day Streak</span>
                  </div>

                  <div className="flex items-center gap-1.5 border border-cyan-500/40 bg-cyan-950/60 px-3 py-1 text-cyan-300 font-bold shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                    <IconCompass className="h-4 w-4 text-cyan-400" />
                    <span>{data.goals.length} Active Goals</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Level XP Progress Bar */}
            <div className="mt-6 border border-purple-500/20 bg-[#070a1a]/90 p-4 shadow-inner">
              <div className="mb-2 flex items-center justify-between text-xs font-black">
                <span className="text-purple-300 flex items-center gap-1.5">
                  <IconSparkles className="h-3.5 w-3.5 text-purple-400" />
                  <span>Level {gamification.level} Calibration</span>
                </span>
                <span className="text-amber-400 font-bold">{Math.round(pct)}% to Level {gamification.level + 1}</span>
              </div>
              <ProgressBar value={pct} variant="gold" />
              <div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-400">
                <span>Current Tier Mastery</span>
                <span className="tabular-nums font-bold text-amber-300">{gamification.xpIntoLevel.toLocaleString()} / {gamification.xpForNextLevel.toLocaleString()} XP</span>
              </div>
            </div>

            {/* Badges Section */}
            {gamification.badges.length > 0 && (
              <div className="mt-5 border-t border-purple-500/20 pt-4">
                <div className="mb-2.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-purple-300/80">
                  EARNED VALOR BADGES ({gamification.badges.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {gamification.badges.map((b) => (
                    <div
                      key={b.id}
                      title={b.description}
                      className="group flex items-center gap-2 border border-purple-500/30 bg-[#121633]/90 px-3 py-1.5 text-xs font-bold text-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.4)] transition-all hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                    >
                      <IconAward className="h-4 w-4 text-purple-400" />
                      <span>{b.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right: Credentials & Biometrics (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Biometric Verification Card */}
          <div className="border border-purple-500/25 bg-[#0d1226]/90 p-5 backdrop-blur-xl shadow-lg transition-all hover:border-purple-400/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center border border-purple-400/40 bg-purple-950 text-purple-300">
                  <IconShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Biometric Calibration</h3>
                  <p className="text-[10px] text-slate-400">Proctoring Identity Verification</p>
                </div>
              </div>
              <Badge tone={hasFace ? "success" : "warning"}>
                {hasFace ? "VERIFIED" : "PENDING"}
              </Badge>
            </div>

            <p className="mt-3 text-xs text-slate-300 leading-relaxed">
              {hasFace
                ? "Biometric facial signature enrolled for automated proctoring verification."
                : "Calibrate your facial scan before your first proctored examination."}
            </p>

            <div className="mt-4 pt-3 border-t border-purple-500/15">
              <Link
                href="/onboarding/face?next=/profile"
                className="inline-flex items-center gap-1.5 text-xs font-black text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider"
              >
                <span>{hasFace ? "Recalibrate Signature" : "Enroll Face Signature"}</span>
                <IconArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Resume & Prior Experience Profile */}
          <div className="flex-1 border border-purple-500/25 bg-[#0d1226]/90 p-5 backdrop-blur-xl shadow-lg transition-all hover:border-purple-400/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center border border-cyan-400/40 bg-cyan-950 text-cyan-300">
                  <IconFileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Experience Profile</h3>
                  <p className="text-[10px] text-slate-400">Prerequisite & Starting Mastery</p>
                </div>
              </div>
              <Badge tone={resume ? "cyan" : "default"}>
                {resume ? "CALIBRATED" : "NOT SET"}
              </Badge>
            </div>

            {resume ? (
              <div className="mt-3 space-y-2 text-xs">
                {resume.currentRole && (
                  <div className="flex items-center gap-2 text-slate-200">
                    <IconBriefcase className="h-4 w-4 text-purple-400 shrink-0" />
                    <span className="font-bold">{resume.currentRole}</span>
                    {resume.yearsExperience !== undefined && (
                      <span className="text-slate-400">({resume.yearsExperience} yrs)</span>
                    )}
                  </div>
                )}
                {resume.careerGoal && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <IconTarget className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>{resume.careerGoal}</span>
                  </div>
                )}
                {resume.summary && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed pt-1">
                    {resume.summary}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                Upload your resume to calibrate starting mastery and tailor milestone prerequisites.
              </p>
            )}

            <div className="mt-4 pt-3 border-t border-purple-500/15">
              <Link
                href="/onboarding/resume?next=/profile"
                className="inline-flex items-center gap-1.5 text-xs font-black text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider"
              >
                <span>{resume ? "Update Resume Profile" : "Upload Resume"}</span>
                <IconArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* Interactive Section 1: Skill Proficiency & Memory Retention */}
      <div className="border border-purple-500/30 bg-[#0c1026]/90 p-6 backdrop-blur-2xl shadow-[0_0_35px_rgba(139,92,246,0.2)]">
        
        {/* Section Header & Interactive Tabs */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/20 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
              ALGORITHMIC MASTERY & MEMORY
            </span>
            <h2 className="text-xl font-black text-white">Skill Proficiency Matrix</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSkillTab("mastery")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider border transition-all ${
                skillTab === "mastery"
                  ? "border-purple-400 bg-purple-950 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  : "border-purple-500/20 bg-[#080b18] text-slate-400 hover:text-white"
              }`}
            >
              <IconActivity className="h-4 w-4" />
              <span>Proficiency Ratings ({data.mastery.length})</span>
            </button>
            <button
              onClick={() => setSkillTab("retention")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider border transition-all ${
                skillTab === "retention"
                  ? "border-cyan-400 bg-cyan-950 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  : "border-purple-500/20 bg-[#080b18] text-slate-400 hover:text-white"
              }`}
            >
              <IconBrain className="h-4 w-4" />
              <span>Retention & Vitality ({data.decay.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Live Mastery Scores */}
        {skillTab === "mastery" && (
          <div className="space-y-5">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  placeholder="Filter skills by name..."
                  className="w-full border border-purple-500/30 bg-[#070918] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1">
                {(["all", "master", "expert", "adept", "novice"] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setTierFilter(tier)}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border transition-all ${
                      tierFilter === tier
                        ? "border-purple-400 bg-purple-900/60 text-purple-200"
                        : "border-purple-500/20 bg-[#070918] text-slate-400 hover:text-white"
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {filteredMastery.length === 0 ? (
              <div className="border border-dashed border-purple-500/20 p-8 text-center text-xs text-slate-400">
                {data.mastery.length === 0
                  ? "No skills assessed yet — embark on a goal to build your skill profile."
                  : "No skills matched your search filter."}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMastery.map((m) => {
                  const rank = getRankBadge(m.score);
                  return (
                    <div
                      key={m.skillId}
                      className="border border-purple-500/25 bg-[#090d22]/90 p-3.5 shadow-md transition-all hover:border-purple-400/60 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="truncate text-xs font-bold text-white">{m.name}</span>
                        <span className={`border px-1.5 py-0.5 text-[9px] font-black tracking-wider ${rank.color}`}>
                          {rank.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-black mb-1.5">
                        <span className="text-slate-400 font-semibold">Mastery Score</span>
                        <span className="text-cyan-300 font-black tabular-nums">{m.score}%</span>
                      </div>

                      <div className="h-2 w-full overflow-hidden bg-[#070915] ring-1 ring-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 shadow-[0_0_10px_rgba(168,85,247,0.7)] transition-all duration-700"
                          style={{ width: `${Math.max(5, m.score)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Memory Retention & Decay */}
        {skillTab === "retention" && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {data.decay.map((d) => {
                const tone = d.tier === "fresh" ? "success" : d.tier === "fading" ? "warning" : "danger";
                return (
                  <Badge key={d.skillId} tone={tone} title={`${d.daysSince} day(s) since last reinforcement`}>
                    <span>{d.name}</span>
                    <span className="opacity-70 ml-1">· {d.daysSince}d ago</span>
                  </Badge>
                );
              })}
            </div>

            {fadingFoundational.length > 0 ? (
              <div className="border border-amber-500/30 bg-amber-950/20 p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
                  <IconRefresh className="h-4 w-4" />
                  <span>Foundational Skill Reinforcement Recommended</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {fadingFoundational.map((d) => (
                    <a
                      key={d.skillId}
                      href={data.reviewSuggestions[d.skillId].url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between border border-amber-500/40 bg-amber-950/40 p-3 text-xs transition-all hover:bg-amber-900/50 hover:border-amber-400"
                    >
                      <div>
                        <p className="font-bold text-white">{d.name}</p>
                        <p className="text-[10px] text-slate-300">{data.reviewSuggestions[d.skillId].title}</p>
                      </div>
                      <IconArrowRight className="h-4 w-4 text-amber-400 shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs text-emerald-300 flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>All foundational skills are currently within optimal memory retention thresholds!</span>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Interactive Section 2: Learning Activity & AI Adaptations */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Activity Heatmap */}
        <div className="border border-purple-500/30 bg-[#0c1026]/90 p-6 backdrop-blur-2xl shadow-[0_0_35px_rgba(139,92,246,0.2)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-400">
                VELOCITY & FREQUENCY
              </span>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <IconCalendar className="h-5 w-5 text-purple-400" />
                <span>Learning Activity Heatmap</span>
              </h3>
            </div>
          </div>

          {!hasActivity ? (
            <p className="text-xs text-slate-400 p-6 text-center border border-dashed border-purple-500/20">
              No activity logged yet — complete quizzes and coding challenges to record your progress.
            </p>
          ) : (
            <>
              <div className="flex gap-[4px] overflow-x-auto pb-2 scrollbar-thin">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[4px]">
                    {week.map((day, di) => (
                      <div
                        key={di}
                        title={
                          day
                            ? `${formatDate(day.date)} - ${day.count} action${day.count === 1 ? "" : "s"}${
                                day.skillNames.length ? ` (${day.skillNames.join(", ")})` : ""
                              }`
                            : undefined
                        }
                        className={`h-[14px] w-[14px] transition-transform hover:scale-125 cursor-pointer ${
                          day ? TIER_CLASSES[tierFor(day.count)] : "bg-transparent"
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-purple-500/15 pt-3 text-[10px] font-bold text-slate-400">
                <span>Activity Scale</span>
                <div className="flex items-center gap-1.5">
                  <span>Low</span>
                  {TIER_CLASSES.map((c, i) => (
                    <div key={i} className={`h-[12px] w-[12px] ${c}`} />
                  ))}
                  <span>High</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* AI Adaptation Feed */}
        <div className="border border-purple-500/30 bg-[#0c1026]/90 p-6 backdrop-blur-2xl shadow-[0_0_35px_rgba(139,92,246,0.2)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
                DYNAMIC RECALIBRATION
              </span>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <IconAdjustments className="h-5 w-5 text-cyan-400" />
                <span>AI Adaptive Path Log</span>
              </h3>
            </div>
          </div>

          {data.adaptations.length === 0 ? (
            <p className="text-xs text-slate-400 p-6 text-center border border-dashed border-purple-500/20">
              No adaptations logged yet — as you complete assessments and provide feedback, the AI dynamically reconfigures your curriculum roadmap.
            </p>
          ) : (
            <ul className="space-y-3 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
              {data.adaptations.map((a) => (
                <li key={a.id} className="border border-purple-500/20 bg-[#070918]/90 p-3 border-l-4 border-l-purple-500">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <Badge tone={TRIGGER_TONE[a.trigger] ?? "accent"} className="text-[9px]">
                      {a.action.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-[10px] font-bold text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-200 leading-relaxed">{a.reason}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

    </div>
  );
}
