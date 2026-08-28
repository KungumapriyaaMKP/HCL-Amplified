import { db } from "@/lib/db";
import { profiles, xpLedger } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { levelForXp, levelTitle } from "@/lib/gamification";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/frontend/components/layout/Nav";
import { IconTrophy, IconBolt, IconFlame } from "@tabler/icons-react";

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

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-900 font-sans pb-16">
      <Nav displayName={viewerProfile?.displayName} />
      
      <main className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 py-6 space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#7C3AED]">
            GLOBAL STANDINGS & VALOR
          </span>
          <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Platform Leaderboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
            Ranked by total learning XP, completed modules, and proctored assessments.
          </p>
        </div>

        {/* Top 3 Champions Rocket Podium */}
        {top3.length > 0 && (
          <div className="pt-6 pb-4 grid grid-cols-3 gap-3 sm:gap-8 items-end max-w-3xl mx-auto">
            
            {/* Rank 2 (Silver / Cyan Nebula Striker Rocket) */}
            {top3[1] && (
              <div className="animate-rocket-2 relative flex flex-col items-center">
                
                {/* Nose Cone */}
                <div className="relative flex flex-col items-center z-10">
                  <div className="h-0 w-0 border-x-[22px] sm:border-x-[28px] border-x-transparent border-b-[32px] sm:border-b-[40px] border-b-cyan-400 drop-shadow-[0_4px_10px_rgba(6,182,212,0.4)] filter" />
                  <div className="h-1.5 w-1.5 bg-white shadow-[0_0_8px_#fff] -mt-8 mb-6 animate-ping" />
                </div>

                {/* Main Fuselage Body - Razor-sharp geometry */}
                <div className="relative w-full max-w-[200px] rounded-none border-2 border-cyan-400 bg-gradient-to-b from-[#F0F9FF] via-white to-[#E0F2FE] p-3 sm:p-4 text-center shadow-[0_8px_25px_rgba(6,182,212,0.2)] z-10">
                  
                  {/* Side Booster Fins */}
                  <div className="absolute -left-3 sm:-left-4 bottom-3 h-12 sm:h-16 w-3 sm:w-4 rounded-none border-l-2 border-b-2 border-t border-cyan-400 bg-gradient-to-l from-cyan-400 to-sky-500 skew-y-[35deg] shadow-xs" />
                  <div className="absolute -right-3 sm:-right-4 bottom-3 h-12 sm:h-16 w-3 sm:w-4 rounded-none border-r-2 border-b-2 border-t border-cyan-400 bg-gradient-to-r from-cyan-400 to-sky-500 -skew-y-[35deg] shadow-xs" />

                  {/* Cockpit Window */}
                  <div className="mx-auto mb-2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-none border-2 border-sky-300 bg-gradient-to-br from-sky-400 to-blue-600 shadow-sm">
                    <span className="text-xs sm:text-sm font-black text-white">#2</span>
                  </div>

                  <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                    {top3[1].displayName}
                  </p>
                  
                  <div className="mt-1 flex items-center justify-center gap-1 text-[11px] sm:text-xs font-extrabold text-sky-600">
                    <IconBolt className="h-3.5 w-3.5 fill-sky-500 text-sky-500" />
                    <span>{top3[1].xp.toLocaleString()} XP</span>
                  </div>
                  
                  <span className="mt-1.5 inline-block text-[9px] font-bold uppercase tracking-wider text-sky-700 border border-sky-200 bg-sky-50 px-2 py-0.5 rounded-none">
                    {top3[1].levelTitle}
                  </span>
                </div>

                {/* Engine Exhaust Nozzle */}
                <div className="h-2.5 w-12 sm:w-16 bg-slate-800 border-x-2 border-cyan-400 rounded-none z-10" />

                {/* Animated Thruster Fire Plume */}
                <div className="relative flex flex-col items-center -mt-0.5">
                  <div className="animate-flame-main h-16 sm:h-20 w-8 sm:w-10 bg-gradient-to-b from-cyan-300 via-blue-500 to-transparent blur-[0.5px] shadow-[0_4px_20px_rgba(6,182,212,0.6)] [clip-path:polygon(20%_0%,80%_0%,100%_70%,50%_100%,0%_70%)]" />
                  <div className="animate-flame-core absolute top-0 h-10 sm:h-12 w-4 sm:w-5 bg-gradient-to-b from-white via-cyan-100 to-transparent shadow-[0_0_10px_#fff] [clip-path:polygon(25%_0%,75%_0%,100%_65%,50%_100%,0%_65%)]" />
                </div>
              </div>
            )}

            {/* Rank 1 (Gold Solar Champion - Center, Flying Highest) */}
            {top3[0] && (
              <div className="animate-rocket-1 relative flex flex-col items-center -translate-y-6 sm:-translate-y-10 z-20">
                
                {/* Nose Cone */}
                <div className="relative flex flex-col items-center z-10">
                  <div className="h-0 w-0 border-x-[26px] sm:border-x-[34px] border-x-transparent border-b-[38px] sm:border-b-[48px] border-b-amber-400 drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)] filter" />
                  <div className="h-2 w-2 bg-white shadow-[0_0_10px_#fff] -mt-10 mb-8 animate-ping" />
                </div>

                {/* Main Fuselage Body - Razor-sharp geometry */}
                <div className="relative w-full max-w-[230px] rounded-none border-2 border-amber-400 bg-gradient-to-b from-[#FFFDF5] via-white to-[#FEF3C7] p-4 sm:p-5 text-center shadow-[0_10px_35px_rgba(245,158,11,0.25)] z-10">
                  
                  {/* Side Booster Fins */}
                  <div className="absolute -left-4 sm:-left-5 bottom-4 h-16 sm:h-20 w-4 sm:w-5 rounded-none border-l-2 border-b-2 border-t border-amber-400 bg-gradient-to-l from-amber-400 to-yellow-500 skew-y-[35deg] shadow-xs" />
                  <div className="absolute -right-4 sm:-right-5 bottom-4 h-16 sm:h-20 w-4 sm:w-5 rounded-none border-r-2 border-b-2 border-t border-amber-400 bg-gradient-to-r from-amber-400 to-yellow-500 -skew-y-[35deg] shadow-xs" />

                  {/* Cockpit Window with Trophy */}
                  <div className="relative mx-auto mb-2 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-none border-2 border-amber-300 bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-200 shadow-md">
                    <IconTrophy className="h-7 w-7 sm:h-8 sm:w-8 text-amber-900 drop-shadow-xs" />
                    <span className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-none border border-amber-400 bg-amber-400 text-[10px] sm:text-xs font-black text-amber-950 shadow-sm">
                      #1
                    </span>
                  </div>

                  <p className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                    {top3[0].displayName}
                  </p>
                  
                  <div className="mt-1 flex items-center justify-center gap-1 text-xs sm:text-sm font-black text-amber-600">
                    <IconFlame className="h-4 w-4 fill-amber-500 text-amber-500 animate-pulse" />
                    <span>{top3[0].xp.toLocaleString()} XP</span>
                  </div>
                  
                  <span className="mt-1.5 inline-block text-[10px] font-bold uppercase tracking-wider text-amber-800 border border-amber-300 bg-amber-100 px-2.5 py-0.5 rounded-none shadow-xs">
                    {top3[0].levelTitle}
                  </span>
                </div>

                {/* Engine Exhaust Nozzle */}
                <div className="h-3 w-16 sm:w-20 bg-slate-800 border-x-2 border-amber-400 rounded-none z-10" />

                {/* Animated Thruster Mega Fire Plume */}
                <div className="relative flex flex-col items-center -mt-0.5">
                  <div className="animate-flame-main h-20 sm:h-28 w-10 sm:w-14 bg-gradient-to-b from-yellow-300 via-orange-500 to-transparent blur-[0.5px] shadow-[0_4px_25px_rgba(249,115,22,0.7)] [clip-path:polygon(15%_0%,85%_0%,100%_70%,50%_100%,0%_70%)]" />
                  <div className="animate-flame-core absolute top-0 h-12 sm:h-16 w-5 sm:w-7 bg-gradient-to-b from-white via-yellow-200 to-transparent shadow-[0_0_15px_#fff] [clip-path:polygon(20%_0%,80%_0%,100%_65%,50%_100%,0%_65%)]" />
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze Phoenix Rocket) */}
            {top3[2] && (
              <div className="animate-rocket-3 relative flex flex-col items-center">
                
                {/* Nose Cone */}
                <div className="relative flex flex-col items-center z-10">
                  <div className="h-0 w-0 border-x-[22px] sm:border-x-[28px] border-x-transparent border-b-[32px] sm:border-b-[40px] border-b-orange-500 drop-shadow-[0_4px_10px_rgba(249,115,22,0.4)] filter" />
                  <div className="h-1.5 w-1.5 bg-white shadow-[0_0_8px_#fff] -mt-8 mb-6 animate-ping" />
                </div>

                {/* Main Fuselage Body - Razor-sharp geometry */}
                <div className="relative w-full max-w-[200px] rounded-none border-2 border-orange-400 bg-gradient-to-b from-[#FFF7ED] via-white to-[#FFEDD5] p-3 sm:p-4 text-center shadow-[0_8px_25px_rgba(249,115,22,0.2)] z-10">
                  
                  {/* Side Booster Fins */}
                  <div className="absolute -left-3 sm:-left-4 bottom-3 h-12 sm:h-16 w-3 sm:w-4 rounded-none border-l-2 border-b-2 border-t border-orange-400 bg-gradient-to-l from-orange-400 to-amber-500 skew-y-[35deg] shadow-xs" />
                  <div className="absolute -right-3 sm:-right-4 bottom-3 h-12 sm:h-16 w-3 sm:w-4 rounded-none border-r-2 border-b-2 border-t border-orange-400 bg-gradient-to-r from-orange-400 to-amber-500 -skew-y-[35deg] shadow-xs" />

                  {/* Cockpit Window */}
                  <div className="mx-auto mb-2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-none border-2 border-amber-300 bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm">
                    <span className="text-xs sm:text-sm font-black text-white">#3</span>
                  </div>

                  <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                    {top3[2].displayName}
                  </p>
                  
                  <div className="mt-1 flex items-center justify-center gap-1 text-[11px] sm:text-xs font-extrabold text-orange-600">
                    <IconBolt className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                    <span>{top3[2].xp.toLocaleString()} XP</span>
                  </div>
                  
                  <span className="mt-1.5 inline-block text-[9px] font-bold uppercase tracking-wider text-orange-700 border border-orange-200 bg-orange-50 px-2 py-0.5 rounded-none">
                    {top3[2].levelTitle}
                  </span>
                </div>

                {/* Engine Exhaust Nozzle */}
                <div className="h-2.5 w-12 sm:w-16 bg-slate-800 border-x-2 border-orange-500 rounded-none z-10" />

                {/* Animated Thruster Fire Plume */}
                <div className="relative flex flex-col items-center -mt-0.5">
                  <div className="animate-flame-main h-16 sm:h-20 w-8 sm:w-10 bg-gradient-to-b from-amber-300 via-red-500 to-transparent blur-[0.5px] shadow-[0_4px_20px_rgba(239,68,68,0.6)] [clip-path:polygon(20%_0%,80%_0%,100%_70%,50%_100%,0%_70%)]" />
                  <div className="animate-flame-core absolute top-0 h-10 sm:h-12 w-4 sm:w-5 bg-gradient-to-b from-white via-orange-200 to-transparent shadow-[0_0_10px_#fff] [clip-path:polygon(25%_0%,75%_0%,100%_65%,50%_100%,0%_65%)]" />
                </div>
              </div>
            )}

          </div>
        )}

        {/* Global Rankings Table - Pure Razor-Sharp 90-Degree Geometry */}
        <div className="rounded-none border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs max-w-4xl mx-auto">
          <div className="border-b border-slate-200 pb-3 mb-3 px-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                  className={`flex items-center justify-between rounded-none border p-3.5 transition-all ${
                    row.rank === 1
                      ? "border-amber-400 bg-amber-50/70 shadow-xs"
                      : row.rank === 2
                      ? "border-sky-400 bg-sky-50/70 shadow-xs"
                      : row.rank === 3
                      ? "border-orange-400 bg-orange-50/70 shadow-xs"
                      : "border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 text-center font-extrabold text-sm ${isTop3 ? "text-amber-600" : "text-slate-400"}`}>
                      #{row.rank}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-none bg-purple-100 border border-purple-200 text-xs font-bold text-purple-700 shadow-xs">
                        {row.displayName[0]?.toUpperCase() || "P"}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-900">{row.displayName}</p>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase">{row.levelTitle}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <IconBolt className="h-4 w-4 fill-amber-400 text-amber-500" />
                    <span className="text-xs sm:text-sm font-bold tabular-nums text-slate-800">
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
