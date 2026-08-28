import { db } from "@/lib/db";
import { profiles, xpLedger } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { levelForXp, levelTitle } from "@/lib/gamification";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/frontend/components/layout/Nav";
import { Card } from "@/frontend/components/ui/Card";
import { Badge } from "@/frontend/components/ui/badge";
import { IconTrophy, IconAward, IconBolt, IconFlame } from "@tabler/icons-react";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const [viewerProfile] = data.user
    ? await db.select().from(profiles).where(eq(profiles.userId, data.user.id))
    : [];

  const rows = await db
    .select({ displayName: profiles.displayName, xp: sql<number>`coalesce(sum(${xpLedger.amount}), 0)` })
    .from(profiles)
    .leftJoin(xpLedger, eq(xpLedger.userId, profiles.userId))
    .groupBy(profiles.userId, profiles.displayName)
    .orderBy(desc(sql`coalesce(sum(${xpLedger.amount}), 0)`))
    .limit(50);

  const leaderboard = rows.map((r, i) => {
    const xp = Number(r.xp);
    const level = levelForXp(xp);
    return { rank: i + 1, displayName: r.displayName, xp, level: level.level, levelTitle: levelTitle(level.level) };
  });

  const top3 = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-[#070913] text-white">
      <Nav displayName={viewerProfile?.displayName} />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">
            GLOBAL STANDINGS & VALOR
          </span>
          <h1 className="mt-1 text-3xl font-black text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.3)]">
            Platform Leaderboard
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Ranked by total learning XP, completed modules, and proctored assessments.
          </p>
        </div>

        {/* Top 3 Champions Rocket Podium */}
        {top3.length > 0 && (
          <div className="mb-20 pt-8 grid grid-cols-3 gap-3 sm:gap-8 items-end max-w-3xl mx-auto">
            
            {/* Rank 2 (Silver Nebula Striker Rocket) */}
            {top3[1] && (
              <div className="animate-rocket-2 relative flex flex-col items-center">
                
                {/* Nose Cone */}
                <div className="relative flex flex-col items-center z-10">
                  <div className="h-0 w-0 border-x-[22px] sm:border-x-[28px] border-x-transparent border-b-[32px] sm:border-b-[40px] border-b-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] filter" />
                  <div className="h-1.5 w-1.5 bg-white shadow-[0_0_8px_#fff] -mt-8 mb-6 animate-ping" />
                </div>

                {/* Main Fuselage Body */}
                <div className="relative w-full max-w-[200px] border-2 border-cyan-400/60 bg-gradient-to-b from-slate-900 via-[#0d1330] to-[#070918] p-3 sm:p-4 text-center shadow-[0_0_25px_rgba(6,182,212,0.3)] z-10">
                  
                  {/* Side Booster Fins */}
                  <div className="absolute -left-3 sm:-left-4 bottom-3 h-12 sm:h-16 w-3 sm:w-4 border-l-2 border-b-2 border-t border-cyan-400/70 bg-gradient-to-l from-slate-800 to-cyan-950 skew-y-[35deg] shadow-[0_0_10px_rgba(6,182,212,0.3)]" />
                  <div className="absolute -right-3 sm:-right-4 bottom-3 h-12 sm:h-16 w-3 sm:w-4 border-r-2 border-b-2 border-t border-cyan-400/70 bg-gradient-to-r from-slate-800 to-cyan-950 -skew-y-[35deg] shadow-[0_0_10px_rgba(6,182,212,0.3)]" />

                  {/* Cockpit Window */}
                  <div className="mx-auto mb-2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center border-2 border-slate-300 bg-slate-800/90 shadow-[inset_0_0_10px_rgba(203,213,225,0.5),0_0_15px_rgba(203,213,225,0.4)]">
                    <span className="text-xs sm:text-sm font-black text-slate-200">#2</span>
                  </div>

                  <p className="font-bold text-xs sm:text-sm text-white truncate drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                    {top3[1].displayName}
                  </p>
                  
                  <div className="mt-1 flex items-center justify-center gap-1 text-[11px] sm:text-xs font-black text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                    <IconBolt className="h-3 w-3" />
                    <span>{top3[1].xp.toLocaleString()} XP</span>
                  </div>
                  
                  <span className="mt-1 inline-block text-[9px] font-black uppercase tracking-wider text-purple-300/90 border border-purple-500/30 bg-purple-950/60 px-1.5 py-0.5">
                    {top3[1].levelTitle}
                  </span>
                </div>

                {/* Engine Exhaust Nozzle */}
                <div className="h-2.5 w-12 sm:w-16 bg-slate-950 border-x-2 border-cyan-400/80 z-10" />

                {/* Animated Thruster Fire Plume */}
                <div className="relative flex flex-col items-center -mt-0.5">
                  {/* Outer cyan-plasma flame */}
                  <div className="animate-flame-main h-16 sm:h-20 w-8 sm:w-10 bg-gradient-to-b from-cyan-200 via-blue-500 to-transparent blur-[1px] shadow-[0_0_25px_rgba(6,182,212,0.9)] [clip-path:polygon(20%_0%,80%_0%,100%_70%,50%_100%,0%_70%)]" />
                  {/* Inner superheated core */}
                  <div className="animate-flame-core absolute top-0 h-10 sm:h-12 w-4 sm:w-5 bg-gradient-to-b from-white via-cyan-100 to-transparent shadow-[0_0_12px_#fff] [clip-path:polygon(25%_0%,75%_0%,100%_65%,50%_100%,0%_65%)]" />
                  {/* Sparks */}
                  <div className="animate-sparks absolute top-10 h-1.5 w-1.5 bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
                  <div className="animate-sparks absolute top-12 left-2 h-1 w-1 bg-blue-300 [animation-delay:0.25s]" />
                </div>

                {/* Launchpad Glow */}
                <div className="h-1.5 w-20 sm:w-28 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent blur-sm -mt-2 animate-pulse" />
              </div>
            )}

            {/* Rank 1 (Gold Solar Apex Cruiser Rocket - Flying Highest) */}
            {top3[0] && (
              <div className="animate-rocket-1 relative flex flex-col items-center -translate-y-6 sm:-translate-y-10 z-20">
                
                {/* Nose Cone */}
                <div className="relative flex flex-col items-center z-10">
                  <div className="h-0 w-0 border-x-[26px] sm:border-x-[34px] border-x-transparent border-b-[38px] sm:border-b-[48px] border-b-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,1)] filter" />
                  <div className="h-2 w-2 bg-white shadow-[0_0_12px_#fff] -mt-10 mb-8 animate-ping" />
                </div>

                {/* Main Fuselage Body */}
                <div className="relative w-full max-w-[230px] border-2 border-amber-400 bg-gradient-to-b from-amber-950/90 via-[#18142a] to-[#070918] p-4 sm:p-5 text-center shadow-[0_0_35px_rgba(245,158,11,0.5),inset_0_0_15px_rgba(245,158,11,0.2)] z-10">
                  
                  {/* Side Booster Fins */}
                  <div className="absolute -left-4 sm:-left-5 bottom-4 h-16 sm:h-20 w-4 sm:w-5 border-l-2 border-b-2 border-t border-amber-400 bg-gradient-to-l from-amber-600 to-amber-950 skew-y-[35deg] shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                  <div className="absolute -right-4 sm:-right-5 bottom-4 h-16 sm:h-20 w-4 sm:w-5 border-r-2 border-b-2 border-t border-amber-400 bg-gradient-to-r from-amber-600 to-amber-950 -skew-y-[35deg] shadow-[0_0_15px_rgba(245,158,11,0.5)]" />

                  {/* Cockpit Window with Trophy */}
                  <div className="relative mx-auto mb-2 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center border-2 border-amber-300 bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.8),inset_0_0_10px_rgba(255,255,255,0.4)]">
                    <IconTrophy className="h-7 w-7 sm:h-8 sm:w-8 text-amber-950 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
                    <span className="absolute -bottom-2 -right-2 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center border border-black bg-amber-300 text-[10px] sm:text-xs font-black text-black shadow-md">
                      #1
                    </span>
                  </div>

                  <p className="font-black text-sm sm:text-base text-amber-200 truncate drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]">
                    {top3[0].displayName}
                  </p>
                  
                  <div className="mt-1 flex items-center justify-center gap-1 text-xs sm:text-sm font-black text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">
                    <IconFlame className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                    <span>{top3[0].xp.toLocaleString()} XP</span>
                  </div>
                  
                  <span className="mt-1.5 inline-block text-[10px] font-black uppercase tracking-wider text-amber-300 border border-amber-500/40 bg-amber-950/80 px-2 py-0.5 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                    {top3[0].levelTitle}
                  </span>
                </div>

                {/* Engine Exhaust Nozzle */}
                <div className="h-3 w-16 sm:w-20 bg-slate-950 border-x-2 border-amber-400 z-10" />

                {/* Animated Thruster Mega Fire Plume */}
                <div className="relative flex flex-col items-center -mt-0.5">
                  {/* Outer intense solar flame */}
                  <div className="animate-flame-main h-20 sm:h-28 w-10 sm:w-14 bg-gradient-to-b from-yellow-200 via-orange-500 to-transparent blur-[1px] shadow-[0_0_35px_rgba(249,115,22,1)] [clip-path:polygon(15%_0%,85%_0%,100%_70%,50%_100%,0%_70%)]" />
                  {/* Inner white-hot plasma beam */}
                  <div className="animate-flame-core absolute top-0 h-12 sm:h-16 w-5 sm:w-7 bg-gradient-to-b from-white via-yellow-200 to-transparent shadow-[0_0_20px_#fff] [clip-path:polygon(20%_0%,80%_0%,100%_65%,50%_100%,0%_65%)]" />
                  {/* Sparks */}
                  <div className="animate-sparks absolute top-12 h-2 w-2 bg-yellow-300 shadow-[0_0_10px_#fde047]" />
                  <div className="animate-sparks absolute top-14 left-3 h-1.5 w-1.5 bg-orange-400 shadow-[0_0_8px_#fb923c] [animation-delay:0.3s]" />
                  <div className="animate-sparks absolute top-14 right-3 h-1.5 w-1.5 bg-amber-200 shadow-[0_0_8px_#fef08a] [animation-delay:0.15s]" />
                </div>

                {/* Launchpad Ground Flame Reflection */}
                <div className="h-2 w-24 sm:w-36 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent blur-sm -mt-2 animate-pulse" />
              </div>
            )}

            {/* Rank 3 (Bronze Phoenix Rocket) */}
            {top3[2] && (
              <div className="animate-rocket-3 relative flex flex-col items-center">
                
                {/* Nose Cone */}
                <div className="relative flex flex-col items-center z-10">
                  <div className="h-0 w-0 border-x-[22px] sm:border-x-[28px] border-x-transparent border-b-[32px] sm:border-b-[40px] border-b-orange-600 drop-shadow-[0_0_15px_rgba(234,88,12,0.8)] filter" />
                  <div className="h-1.5 w-1.5 bg-white shadow-[0_0_8px_#fff] -mt-8 mb-6 animate-ping" />
                </div>

                {/* Main Fuselage Body */}
                <div className="relative w-full max-w-[200px] border-2 border-orange-600/60 bg-gradient-to-b from-amber-950/80 via-[#161026] to-[#070918] p-3 sm:p-4 text-center shadow-[0_0_25px_rgba(234,88,12,0.3)] z-10">
                  
                  {/* Side Booster Fins */}
                  <div className="absolute -left-3 sm:-left-4 bottom-3 h-12 sm:h-16 w-3 sm:w-4 border-l-2 border-b-2 border-t border-orange-600/70 bg-gradient-to-l from-amber-800 to-amber-950 skew-y-[35deg] shadow-[0_0_10px_rgba(234,88,12,0.3)]" />
                  <div className="absolute -right-3 sm:-right-4 bottom-3 h-12 sm:h-16 w-3 sm:w-4 border-r-2 border-b-2 border-t border-orange-600/70 bg-gradient-to-r from-amber-800 to-amber-950 -skew-y-[35deg] shadow-[0_0_10px_rgba(234,88,12,0.3)]" />

                  {/* Cockpit Window */}
                  <div className="mx-auto mb-2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center border-2 border-amber-700 bg-amber-950/90 shadow-[inset_0_0_10px_rgba(180,83,9,0.5),0_0_15px_rgba(180,83,9,0.4)]">
                    <span className="text-xs sm:text-sm font-black text-amber-300">#3</span>
                  </div>

                  <p className="font-bold text-xs sm:text-sm text-white truncate drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                    {top3[2].displayName}
                  </p>
                  
                  <div className="mt-1 flex items-center justify-center gap-1 text-[11px] sm:text-xs font-black text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]">
                    <IconBolt className="h-3 w-3" />
                    <span>{top3[2].xp.toLocaleString()} XP</span>
                  </div>
                  
                  <span className="mt-1 inline-block text-[9px] font-black uppercase tracking-wider text-purple-300/90 border border-purple-500/30 bg-purple-950/60 px-1.5 py-0.5">
                    {top3[2].levelTitle}
                  </span>
                </div>

                {/* Engine Exhaust Nozzle */}
                <div className="h-2.5 w-12 sm:w-16 bg-slate-950 border-x-2 border-orange-600/80 z-10" />

                {/* Animated Thruster Fire Plume */}
                <div className="relative flex flex-col items-center -mt-0.5">
                  {/* Outer crimson flame */}
                  <div className="animate-flame-main h-16 sm:h-20 w-8 sm:w-10 bg-gradient-to-b from-amber-300 via-red-600 to-transparent blur-[1px] shadow-[0_0_25px_rgba(220,38,38,0.9)] [clip-path:polygon(20%_0%,80%_0%,100%_70%,50%_100%,0%_70%)]" />
                  {/* Inner superheated core */}
                  <div className="animate-flame-core absolute top-0 h-10 sm:h-12 w-4 sm:w-5 bg-gradient-to-b from-white via-orange-200 to-transparent shadow-[0_0_12px_#fff] [clip-path:polygon(25%_0%,75%_0%,100%_65%,50%_100%,0%_65%)]" />
                  {/* Sparks */}
                  <div className="animate-sparks absolute top-10 h-1.5 w-1.5 bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                  <div className="animate-sparks absolute top-12 right-2 h-1 w-1 bg-red-400 [animation-delay:0.25s]" />
                </div>

                {/* Launchpad Glow */}
                <div className="h-1.5 w-20 sm:w-28 bg-gradient-to-r from-transparent via-orange-600/40 to-transparent blur-sm -mt-2 animate-pulse" />
              </div>
            )}

          </div>
        )}

        {/* Global Rankings Table */}
        <div className="rounded-lg border-2 border-purple-500/30 bg-[#0c1026]/90 p-5 shadow-[0_0_35px_rgba(139,92,246,0.2)] backdrop-blur-2xl">
          <div className="border-b border-purple-500/20 pb-3 mb-3 px-3 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="flex items-center gap-6">
              <span className="w-8 text-center">RANK</span>
              <span>LEARNER PROFILE</span>
            </div>
            <span>TOTAL XP</span>
          </div>

          <div className="space-y-2">
            {leaderboard.length === 0 && (
              <p className="p-8 text-center text-xs text-slate-400">No entries yet — be the first to complete a module and claim Rank #1!</p>
            )}

            {leaderboard.map((row) => {
              const isTop3 = row.rank <= 3;
              return (
                <div
                  key={row.rank}
                  className={`flex items-center justify-between rounded-md border p-3.5 transition-all ${
                    row.rank === 1
                      ? "border-amber-400/40 bg-amber-950/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                      : row.rank === 2
                      ? "border-slate-400/40 bg-slate-900/40"
                      : row.rank === 3
                      ? "border-amber-700/40 bg-amber-950/30"
                      : "border-purple-500/15 bg-[#070918]/80 hover:border-purple-500/40 hover:bg-[#111633]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 text-center font-black text-sm ${isTop3 ? "text-amber-400" : "text-slate-500"}`}>
                      #{row.rank}
                    </span>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-950 border border-purple-500/30 text-xs font-black text-purple-300">
                        {row.displayName[0]?.toUpperCase() || "P"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{row.displayName}</p>
                        <p className="text-[10px] font-semibold text-purple-400 uppercase">{row.levelTitle}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <IconBolt className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-black tabular-nums text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                      {row.xp.toLocaleString()} XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
