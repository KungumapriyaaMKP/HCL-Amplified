"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  QuestLearnBrandIcon,
  RocketBlastingIllustration,
  NeedResourcesBooksIllustration,
} from "@/frontend/components/dashboard/Illustrations";
import {
  IconSmartHome,
  IconTarget,
  IconListCheck,
  IconGitFork,
  IconCompass,
  IconTrophy,
  IconAward,
  IconBook,
  IconUser,
  IconLogout,
  IconArrowRight,
} from "@tabler/icons-react";

interface AppSidebarProps {
  displayName?: string;
  level?: number;
  levelTitle?: string;
}

export function AppSidebar({
  displayName = "yuvi",
  level = 1,
  levelTitle = "Newcomer",
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: IconSmartHome },
    { label: "My Quests", href: "/goals/new", icon: IconTarget },
    { label: "To-Do List", href: "/todo", icon: IconListCheck },
    { label: "Skill Map", href: "/dashboard#skill-map", icon: IconGitFork },
    { label: "Explore", href: "/community", icon: IconCompass },
    { label: "Leaderboard", href: "/leaderboard", icon: IconTrophy },
    { label: "Achievements", href: "/achievements", icon: IconAward },
    { label: "Resources", href: "/resources", icon: IconBook },
    { label: "Profile", href: "/profile", icon: IconUser },
  ];

  const isResourcesPage = pathname === "/resources";

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-100 flex flex-col justify-between p-5 min-h-screen">
      <div>
        {/* Brand Header */}
        <Link href="/dashboard" className="flex items-center gap-3 px-1 py-1 mb-6 group">
          <div className="shrink-0 transition-transform group-hover:scale-105">
            <QuestLearnBrandIcon className="w-9 h-9" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
              QuestLearn
            </div>
            <div className="text-[11px] font-normal text-slate-400">
              Level up your future
            </div>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href === "/community" && pathname.startsWith("/community")) ||
              (item.href === "/dashboard" && pathname === "/dashboard") ||
              (item.href === "/achievements" && pathname === "/achievements") ||
              (item.href === "/resources" && pathname === "/resources") ||
              (item.href === "/todo" && pathname === "/todo") ||
              (item.href === "/leaderboard" && pathname === "/leaderboard");

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-none text-sm font-bold transition-all ${
                  isActive
                    ? "bg-[#EDE9FE] text-[#6D28D9]"
                    : "text-slate-900 hover:text-black hover:bg-slate-50"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-[#6D28D9] stroke-[2.2]" : "text-slate-700 stroke-[2]"}`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Sign Out Button */}
          <button
            onClick={async () => {
              await createClient().auth.signOut();
              router.push("/login");
              router.refresh();
            }}
            className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-none text-sm font-bold text-slate-900 hover:text-rose-600 hover:bg-rose-50/60 w-full text-left transition-all cursor-pointer group"
          >
            <IconLogout className="w-5 h-5 text-slate-700 group-hover:text-rose-600 stroke-[2]" />
            <span>Sign Out</span>
          </button>
        </nav>
      </div>

      {/* Bottom Promo Card */}
      <div className="pt-3">
        {/* Motivational Banner */}
        {isResourcesPage ? (
          <div className="p-3.5 rounded-none bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-[#F3E8FF] border border-purple-100 flex items-center justify-between shadow-2xs">
            <div className="space-y-1 pr-2">
              <div className="text-xs font-black text-purple-950 leading-tight">
                Need resources?
              </div>
              <div className="text-[10px] font-medium text-purple-700 leading-snug">
                Find the right materials to learn, practice and grow.
              </div>
              <Link
                href="/resources"
                className="inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-none bg-white border border-purple-200/80 text-[10px] font-bold text-[#6D28D9] shadow-2xs hover:bg-purple-50 transition-colors"
              >
                <span>Explore Now</span>
                <IconArrowRight className="w-3 h-3 stroke-[2.5]" />
              </Link>
            </div>
            <div className="shrink-0">
              <NeedResourcesBooksIllustration className="w-12 h-12" />
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-none bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-[#F3E8FF] border border-purple-100 flex items-center justify-between shadow-2xs">
            <div className="space-y-0.5 pr-2">
              <div className="text-[11px] font-black text-purple-950 leading-tight">
                Keep going!
              </div>
              <div className="text-[9px] font-medium text-purple-700 leading-snug">
                Complete more quests to unlock achievements and earn rewards.
              </div>
            </div>
            <div className="shrink-0">
              <RocketBlastingIllustration className="w-9 h-9" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
