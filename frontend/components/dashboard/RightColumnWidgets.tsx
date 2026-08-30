"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  StarHexagonBadge,
  FlameHexagonBadge,
  CompassHexagonBadge,
} from "@/frontend/components/dashboard/Illustrations";
import {
  IconCheck,
  IconArrowRight,
  IconCalendar,
  IconTrendingUp,
  IconPlus,
  IconTrash,
  IconSparkles,
  IconLock,
} from "@tabler/icons-react";

export type DailyTaskItem = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

export type PlanAgendaItem = {
  id: string;
  title: string;
  duration?: string;
  type: "focus" | "review" | "quiz" | "task";
  status: "completed" | "active" | "pending";
  deepLink?: string;
  isUserTask?: boolean;
};

/**
 * 1. Your Plan for Today Widget
 */
export function YourPlanForToday({ hasGoals = true }: { hasGoals?: boolean }) {
  const [tasks, setTasks] = useState<DailyTaskItem[]>([]);
  const [agendaItems, setAgendaItems] = useState<PlanAgendaItem[]>([]);
  const [coachIntro, setCoachIntro] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const tasksRes = await fetch("/api/tasks");
        if (tasksRes.ok && isMounted) {
          const data = await tasksRes.json();
          setTasks(data.tasks || []);
        }

        const planRes = await fetch("/api/plan/today");
        if (planRes.ok && isMounted) {
          const planData = await planRes.json();
          if (planData.intro) setCoachIntro(planData.intro);
          if (Array.isArray(planData.items)) {
            setAgendaItems(planData.items);
          }
        }
      } catch (err) {
        console.error("Failed to load today's plan/tasks:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTaskTitle.trim();
    if (!title || isSubmitting) return;

    setIsSubmitting(true);
    setNewTaskTitle("");

    const tempId = "temp-" + Date.now();
    const optimisticTask: DailyTaskItem = {
      id: tempId,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [optimisticTask, ...prev]);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (res.ok) {
        const { task } = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === tempId ? task : t)));
      } else {
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
      }
    } catch (err) {
      console.error("Failed to add task:", err);
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTask = async (id: string, currentCompleted: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !currentCompleted } : t))
    );

    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentCompleted }),
      });
    } catch (err) {
      console.error("Failed to update task status:", err);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: currentCompleted } : t))
      );
    }
  };

  const handleDeleteTask = async (id: string) => {
    const prevTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete task:", err);
      setTasks(prevTasks);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length + agendaItems.length;

  return (
    <div className="rounded-sm border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
            <span>Your Plan for Today</span>
            <IconSparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
          </h3>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
            AI-sequenced daily micro-milestones
          </p>
        </div>
        <span className="text-[11px] font-bold text-slate-500">
          {totalCount > 0 ? `${completedCount}/${totalCount} Done` : "0 Tasks"}
        </span>
      </div>

      {/* Coach Message Banner */}
      {coachIntro && (
        <div className="rounded-xs bg-purple-50/80 border border-purple-200/70 p-2.5 text-xs text-purple-950 flex items-start gap-2">
          <span className="text-sm">🎯</span>
          <p className="text-[11px] leading-relaxed font-medium">{coachIntro}</p>
        </div>
      )}

      {/* Task List / Agenda */}
      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
        {/* Dynamic Agenda Items */}
        {agendaItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-2.5 rounded-xs border transition-all ${
              item.status === "completed"
                ? "bg-slate-50 border-slate-200 text-slate-400"
                : item.status === "active"
                ? "bg-purple-50/60 border-purple-200 text-purple-950 font-bold"
                : "bg-white border-slate-200 text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xs">
                {item.type === "focus" ? "⏱️" : item.type === "review" ? "🔄" : "📝"}
              </span>
              <span className="text-xs truncate">{item.title}</span>
            </div>
            {item.deepLink && (
              <Link
                href={item.deepLink}
                className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-[#6D28D9] hover:underline"
              >
                <span>Go</span>
                <IconArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        ))}

        {/* User Added Daily Tasks */}
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center justify-between p-2.5 rounded-xs border transition-all ${
              task.completed
                ? "bg-slate-50 border-slate-200 text-slate-400 line-through"
                : "bg-white border-slate-200 text-slate-800 font-semibold"
            }`}
          >
            <div
              className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1"
              onClick={() => handleToggleTask(task.id, task.completed)}
            >
              <div
                className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors ${
                  task.completed
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-slate-300 hover:border-purple-400"
                }`}
              >
                {task.completed && <IconCheck className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className="text-xs truncate">{task.title}</span>
            </div>
            <button
              type="button"
              onClick={() => handleDeleteTask(task.id)}
              className="text-slate-300 hover:text-rose-500 transition-colors p-1"
              title="Delete task"
            >
              <IconTrash className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {tasks.length === 0 && agendaItems.length === 0 && !isLoading && (
          <div className="py-4 text-center text-xs text-slate-400 font-medium">
            No active tasks. Add your own task below!
          </div>
        )}
      </div>

      {/* Add Task Input Form */}
      <form onSubmit={handleAddTask} className="flex items-center gap-2 pt-1 border-t border-slate-100">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a daily study task..."
          className="flex-1 px-3 py-1.5 rounded-xs border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-purple-500"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={!newTaskTitle.trim() || isSubmitting}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xs bg-[#6D28D9] hover:bg-[#5B21B6] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <IconPlus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </form>
    </div>
  );
}

interface ProfileResponse {
  streak?: { currentStreak: number };
  badges?: { id: string }[];
  xp?: number;
}

/**
 * 2. Achievements Widget with Exact 3D Hexagonal Badges
 */
export function AchievementsWidget({
  streak = 0,
  xp = 0,
  badgeCount = 0,
}: {
  streak?: number;
  xp?: number;
  badgeCount?: number;
}) {
  const isNewUser = badgeCount === 0 && xp === 0;

  return (
    <div className="rounded-sm border border-slate-200/90 bg-white p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-extrabold text-slate-900">Achievements</h3>
        <Link href="/achievements" className="text-xs font-bold text-[#6D28D9] hover:underline">
          View all ({badgeCount || 0})
        </Link>
      </div>

      {/* 3 Exact Hexagonal Badges */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Badge 1: First Steps (Star Hexagon) */}
        <div className="rounded-xs border border-slate-100 bg-[#FAFBFD] p-3 flex flex-col items-center text-center">
          <StarHexagonBadge className={`w-14 h-14 mb-2 ${isNewUser ? "opacity-75 grayscale-30" : ""}`} />
          <div className="text-[11px] font-bold text-slate-900 leading-tight">First Steps</div>
          <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">
            Complete your first quest
          </div>
          <div className="mt-2.5 w-full">
            {isNewUser ? (
              <span className="inline-flex items-center justify-center gap-1 w-full rounded-xs bg-slate-100 border border-slate-200 py-0.5 text-[9px] font-bold text-slate-500">
                <IconLock className="h-2.5 w-2.5" />
                <span>0/1 Quest</span>
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-1 w-full rounded-xs bg-emerald-50 border border-emerald-200/60 py-0.5 text-[9px] font-bold text-emerald-700">
                <IconCheck className="h-2.5 w-2.5 stroke-[3]" />
                <span>Completed</span>
              </span>
            )}
          </div>
        </div>

        {/* Badge 2: Streak Starter (Flame Hexagon) */}
        <div className="rounded-xs border border-slate-100 bg-[#FAFBFD] p-3 flex flex-col items-center text-center">
          <FlameHexagonBadge className={`w-14 h-14 mb-2 ${streak < 3 ? "opacity-75 grayscale-30" : ""}`} />
          <div className="text-[11px] font-bold text-slate-900 leading-tight">Streak Starter</div>
          <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">
            Maintain a 3-day streak
          </div>
          <div className="mt-2.5 w-full">
            <span className="inline-flex items-center justify-center gap-1 w-full rounded-xs bg-purple-50 border border-purple-200/60 py-0.5 text-[9px] font-bold text-[#6D28D9]">
              <span>{streak}/3 days</span>
            </span>
          </div>
        </div>

        {/* Badge 3: Explorer / Deep Work (Compass Hexagon) */}
        <div className="rounded-xs border border-slate-100 bg-[#FAFBFD] p-3 flex flex-col items-center text-center">
          <CompassHexagonBadge className="w-14 h-14 mb-2 opacity-75 grayscale-30" />
          <div className="text-[11px] font-bold text-slate-900 leading-tight">Explorer</div>
          <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">
            5 Pomodoro focus blocks
          </div>
          <div className="mt-2.5 w-full">
            <span className="inline-flex items-center justify-center gap-1 w-full rounded-xs bg-purple-50 border border-purple-200/60 py-0.5 text-[9px] font-bold text-[#6D28D9]">
              <span>0/5 goals</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. Weekly Progress Widget with Bar Chart
 */
export function WeeklyProgressWidget() {
  const days = [
    { label: "Mon", height: "h-8", active: false },
    { label: "Tue", height: "h-14", active: false },
    { label: "Wed", height: "h-20", active: true },
    { label: "Thu", height: "h-16", active: false },
    { label: "Fri", height: "h-24", active: false },
    { label: "Sat", height: "h-10", active: false },
    { label: "Sun", height: "h-6", active: false },
  ];

  return (
    <div className="rounded-sm border border-slate-200/90 bg-white p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">Weekly Progress</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-bold text-[#6D28D9]">3.2 hrs</span>
            <span className="text-[11px] text-slate-400 font-medium">this week</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xs">
          <IconTrendingUp className="h-3.5 w-3.5 text-emerald-600" />
          <span>+1.5 hrs</span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end justify-between gap-2 pt-3 h-28 border-b border-slate-100 pb-2">
        {days.map((day) => (
          <div key={day.label} className="flex flex-col items-center gap-2 flex-1">
            <div className="w-full flex items-end justify-center h-20">
              <div
                className={`w-full max-w-[20px] rounded-t-xs transition-all ${
                  day.active
                    ? "bg-gradient-to-t from-[#6D28D9] to-[#8B5CF6] shadow-xs"
                    : "bg-purple-100 hover:bg-purple-200"
                } ${day.height}`}
              />
            </div>
            <span className="text-[10px] font-semibold text-slate-400">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
