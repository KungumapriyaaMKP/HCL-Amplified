import Link from "next/link";
import { LogoutButton } from "@/frontend/components/layout/LogoutButton";
import { GoalSwitcher } from "@/frontend/components/layout/GoalSwitcher";
import {
  IconCompass,
  IconTrophy,
  IconUsers,
  IconUser,
  IconPlus,
  IconDeviceGamepad2,
} from "@tabler/icons-react";

export function Nav({ displayName }: { displayName?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-purple-500/20 bg-[#070913]/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        
        {/* Brand & Goal Switcher */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/dashboard" className="group flex items-center gap-3 transition-transform hover:scale-105">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 shadow-[0_0_15px_rgba(147,51,234,0.6)] border border-purple-400/40">
              <IconDeviceGamepad2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-wider text-white">
                Quest<span className="text-purple-400">Learn</span>
              </div>
              <div className="text-[8px] font-bold tracking-[0.2em] text-purple-300/70 uppercase">
                LEVEL UP YOUR FUTURE
              </div>
            </div>
          </Link>
          <GoalSwitcher />
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs font-bold">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-xl border border-transparent px-3 py-2 text-slate-300 transition-all hover:border-purple-500/30 hover:bg-purple-950/40 hover:text-white"
          >
            <IconCompass className="h-4 w-4 text-purple-400" />
            <span className="hidden sm:inline">Quests</span>
          </Link>
          <Link
            href="/leaderboard"
            className="flex items-center gap-1.5 rounded-xl border border-transparent px-3 py-2 text-slate-300 transition-all hover:border-amber-500/30 hover:bg-amber-950/40 hover:text-amber-300"
          >
            <IconTrophy className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">Leaderboard</span>
          </Link>
          <Link
            href="/community"
            className="flex items-center gap-1.5 rounded-xl border border-transparent px-3 py-2 text-slate-300 transition-all hover:border-cyan-500/30 hover:bg-cyan-950/40 hover:text-cyan-300"
          >
            <IconUsers className="h-4 w-4 text-cyan-400" />
            <span className="hidden sm:inline">Guilds</span>
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-1.5 rounded-xl border border-transparent px-3 py-2 text-slate-300 transition-all hover:border-fuchsia-500/30 hover:bg-fuchsia-950/40 hover:text-fuchsia-300"
          >
            <IconUser className="h-4 w-4 text-fuchsia-400" />
            <span className="hidden sm:inline">Profile</span>
          </Link>
          <Link
            href="/goals/new"
            className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-950/60 px-3 py-2 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)] transition-all hover:border-purple-400 hover:bg-purple-900/80 hover:text-white"
          >
            <IconPlus className="h-4 w-4 text-purple-300" />
            <span className="hidden sm:inline">New Quest</span>
          </Link>

          {/* Player HUD Tag & Logout */}
          <div className="ml-2 flex items-center gap-2 border-l border-purple-500/20 pl-3">
            {displayName && (
              <Link
                href="/profile"
                className="hidden items-center gap-2 rounded-xl border border-purple-500/30 bg-[#0d1226]/90 px-3 py-1.5 text-xs transition-all hover:border-purple-400 hover:bg-[#151c3d] md:flex"
                title="View Profile & Skill Analytics"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-[10px] font-black text-white">
                  {displayName[0]?.toUpperCase()}
                </span>
                <span className="font-bold text-slate-200">{displayName}</span>
              </Link>
            )}
            <LogoutButton />
          </div>
        </nav>

      </div>
    </header>
  );
}
