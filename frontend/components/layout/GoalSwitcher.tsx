"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { DOMAINS } from "@/data/domains";
import { IconChevronDown } from "@tabler/icons-react";

interface GoalSummary {
  id: string;
  domain: string;
  goalText: string;
  status: string;
  pathId: string | null;
  totalModules: number;
  completedModules: number;
}

export function GoalSwitcher() {
  const pathname = usePathname();
  const params = useParams();
  const currentGoalId = params?.id as string | undefined;

  const [goals, setGoals] = useState<GoalSummary[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/goals")
      .then((res) => (res.ok ? res.json() : { goals: [] }))
      .then((data) => setGoals(data.goals ?? []))
      .catch(() => setGoals([]));
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (goals.length === 0) return null;

  const activeGoal = goals.find((g) => g.id === currentGoalId) || goals[0];
  const domainObj = DOMAINS.find((d) => d.id === activeGoal.domain);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer max-w-[200px] sm:max-w-[260px] shadow-xs"
      >
        <span className="truncate">{activeGoal.goalText || domainObj?.name || activeGoal.domain}</span>
        <IconChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 mt-1.5 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Your Active Learning Tracks ({goals.length})
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 my-1">
            {goals.map((g) => {
              const d = DOMAINS.find((dom) => dom.id === g.domain);
              const isCurrent = g.id === currentGoalId;
              const targetUrl = g.pathId ? `/goals/${g.id}` : `/goals/${g.id}/setup`;

              return (
                <Link
                  key={g.id}
                  href={targetUrl}
                  onClick={() => setOpen(false)}
                  className={`flex items-start gap-2.5 rounded-lg p-2 text-xs transition-colors ${
                    isCurrent
                      ? "bg-purple-50 border border-purple-200 text-purple-900 font-semibold"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span className="text-base shrink-0 mt-0.5">{d?.icon ?? "🎯"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{g.goalText}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                      <span>{d?.name ?? g.domain}</span>
                      {g.totalModules > 0 && (
                        <span>· {g.completedModules}/{g.totalModules} done</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-slate-100 pt-1.5 mt-1">
            <Link
              href="/goals/new"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#7C3AED] font-semibold hover:bg-purple-50 transition-colors"
            >
              <span>+</span> Set a new learning goal
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
