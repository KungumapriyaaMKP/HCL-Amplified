"use client";

import React, { useState } from "react";
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
export function YourPlanForToday() {
  const [tasks, setTasks] = useState<DailyTaskItem[]>([]);
  const [agendaItems, setAgendaItems] = useState<PlanAgendaItem[]>([]);
  const [coachIntro, setCoachIntro] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load daily plan & user tasks
  const loadPlanAndTasks = React.useCallback(async () => {
    try {
      // 1. Fetch user tasks
      const tasksRes = await fetch("/api/tasks");
      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data.tasks || []);
      }

      // 2. Fetch today's generated plan agenda
      const planRes = await fetch("/api/plan/today");
      if (planRes.ok) {
        const planData = await planRes.json();
        if (planData.intro) setCoachIntro(planData.intro);
        if (Array.isArray(planData.items)) {
          setAgendaItems(planData.items);
        }
      }
    } catch (err) {
      console.error("Failed to load today's plan/tasks:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPlanAndTasks();
  }, [loadPlanAndTasks]);

  // Add a new task (optimistic)
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
        // Rollback on failure
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
      }
    } catch (err) {
      console.error("Failed to add task:", err);
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle task complete (optimistic)
  const handleToggleTask = async (task: DailyTaskItem) => {
    const nextCompleted = !task.completed;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: nextCompleted } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: nextCompleted }),
      });
      if (!res.ok) {
        // Rollback
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, completed: task.completed } : t))
        );
      }
    } catch (err) {
      console.error("Failed to toggle task:", err);
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: task.completed } : t))
      );
    }
  };

  // Delete task (optimistic)
  const handleDeleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const previous = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) {
        setTasks(previous);
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
      setTasks(previous);
    }
  };

  // Combine agenda items (curriculum focus/review/quiz) + user tasks
  const combinedItems = React.useMemo(() => {
    const list: (PlanAgendaItem | { isTask: true; task: DailyTaskItem })[] = [];

    // Add generated agenda items first (if any)
    agendaItems.forEach((item) => {
      if (!item.isUserTask) list.push(item);
    });

    // Add user tasks
    tasks.forEach((task) => {
      list.push({ isTask: true, task });
    });

    return list;
  }, [agendaItems, tasks]);

  const totalMinutes = React.useMemo(() => {
    let sum = 0;
    agendaItems.forEach((item) => {
      if (item.duration) {
        const num = parseInt(item.duration.replace(/\D/g, ""), 10);
        if (!isNaN(num)) sum += num;
      }
    });
    // Add estimated 10 min for each active user task
    sum += tasks.filter((t) => !t.completed).length * 10;
    return Math.max(25, sum || 30);
  }, [agendaItems, tasks]);

  return (
    <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900">Your Plan for Today</h3>
        <Link href="/review" className="text-xs font-bold text-[#6D28D9] hover:underline">
          Review Queue
        </Link>
      </div>

      {/* AI Coach Intro (if available) */}
      {coachIntro && (
        <div className="mb-3.5 flex items-start gap-2 rounded-md bg-purple-50/80 border border-purple-200/60 p-2.5 text-[11px] text-purple-900 leading-snug">
          <IconSparkles className="h-4 w-4 text-[#7C3AED] shrink-0 mt-0.5" />
          <span>{coachIntro}</span>
        </div>
      )}

      {/* Add Task Input Row */}
      <form onSubmit={handleAddTask} className="mb-3 flex items-center gap-2">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a task for today..."
          className="flex-1 rounded-md border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#7C3AED] focus:bg-white focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!newTaskTitle.trim() || isSubmitting}
          className="inline-flex h-7 items-center justify-center gap-1 rounded-md bg-[#7C3AED] px-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#6D28D9] disabled:opacity-50 transition-colors"
        >
          <IconPlus className="h-3.5 w-3.5" />
          <span>Add</span>
        </button>
      </form>

      {/* Plan Checklist Items */}
      <div className="space-y-2.5">
        {combinedItems.length === 0 && !isLoading && (
          <div className="rounded-md border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
            No items planned yet. Add a task above to plan your day!
          </div>
        )}

        {combinedItems.map((entry, idx) => {
          if ("isTask" in entry) {
            const task = entry.task;
            return (
              <div
                key={"task-" + task.id}
                onClick={() => handleToggleTask(task)}
                className="group flex items-center justify-between p-2.5 rounded-md transition-all cursor-pointer hover:bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm transition-colors ${
                      task.completed
                        ? "bg-[#7C3AED] text-white"
                        : "border-2 border-slate-300 bg-white group-hover:border-[#7C3AED]"
                    }`}
                  >
                    {task.completed && <IconCheck className="h-3 w-3 stroke-[3]" />}
                  </div>

                  <span
                    className={`text-xs truncate ${
                      task.completed
                        ? "text-slate-400 line-through"
                        : "text-slate-800 font-semibold"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => handleDeleteTask(task.id, e)}
                    title="Delete task"
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-0.5"
                  >
                    <IconTrash className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          }

          const item = entry;
          const isDone = item.status === "completed";
          const isActive = item.status === "active";

          return (
            <Link
              key={"item-" + (item.id || idx)}
              href={item.deepLink || "/dashboard"}
              className={`flex items-center justify-between p-2.5 rounded-md transition-all ${
                isActive
                  ? "bg-purple-50/70 border border-purple-200/60"
                  : isDone
                  ? "bg-slate-50/60 border border-slate-100 opacity-80"
                  : "hover:bg-slate-50 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm transition-colors ${
                    isDone
                      ? "bg-[#7C3AED] text-white"
                      : isActive
                      ? "border-2 border-[#7C3AED] bg-white text-[#7C3AED]"
                      : "border-2 border-slate-300 bg-white"
                  }`}
                >
                  {isDone && <IconCheck className="h-3 w-3 stroke-[3]" />}
                  {isActive && <span className="h-1.5 w-1.5 bg-[#7C3AED]" />}
                </div>

                <div className="min-w-0">
                  <span
                    className={`text-xs block truncate ${
                      isDone
                        ? "text-slate-500 line-through"
                        : isActive
                        ? "text-slate-900 font-bold"
                        : "text-slate-700 font-semibold"
                    }`}
                  >
                    {item.title}
                  </span>
                  {item.type && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-purple-600">
                      {item.type}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.duration && (
                  <span className="text-[11px] font-medium text-slate-400">{item.duration}</span>
                )}
                {isActive && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-[#EDE9FE] text-[#6D28D9]">
                    <IconArrowRight className="h-3 w-3 stroke-[2.5]" />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs font-semibold text-slate-500">
          Total time • <span className="font-bold text-slate-800">~ {totalMinutes} min</span>
        </span>
        <Link
          href="/goals/new"
          title="Plan new learning quests"
          className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EDE9FE] text-[#6D28D9] hover:bg-[#DDD6FE] transition-colors"
        >
          <IconCalendar className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

/**
 * 2. Achievements Widget with Exact 3D Hexagonal Badges
 */
export function AchievementsWidget() {
  return (
    <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900">Achievements</h3>
        <Link href="/profile" className="text-xs font-bold text-[#6D28D9] hover:underline">
          View all
        </Link>
      </div>

      {/* 3 Exact Hexagonal Badges */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Badge 1: First Steps (Star Hexagon) */}
        <div className="rounded-md border border-slate-100 bg-[#FAFBFD] p-3 flex flex-col items-center text-center">
          <StarHexagonBadge className="w-14 h-14 mb-2" />
          <div className="text-[11px] font-bold text-slate-900 leading-tight">First Steps</div>
          <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">
            Complete your first quest
          </div>
          <div className="mt-2.5 w-full">
            <span className="inline-flex items-center justify-center gap-1 w-full rounded-sm bg-emerald-50 border border-emerald-200/60 py-0.5 text-[9px] font-bold text-emerald-700">
              <IconCheck className="h-2.5 w-2.5 stroke-[3]" />
              <span>Completed</span>
            </span>
          </div>
        </div>

        {/* Badge 2: Streak Starter (Flame Hexagon) */}
        <div className="rounded-md border border-slate-100 bg-[#FAFBFD] p-3 flex flex-col items-center text-center">
          <FlameHexagonBadge className="w-14 h-14 mb-2" />
          <div className="text-[11px] font-bold text-slate-900 leading-tight">Streak Starter</div>
          <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">
            Maintain a 3-day streak
          </div>
          <div className="mt-2.5 w-full">
            <div className="text-[9px] font-bold text-slate-500 mb-1">0 / 3</div>
            <div className="h-1.5 w-full rounded-sm bg-slate-200 overflow-hidden">
              <div className="h-full rounded-sm bg-[#7C3AED]" style={{ width: "0%" }} />
            </div>
          </div>
        </div>

        {/* Badge 3: Explorer (Compass Hexagon) */}
        <div className="rounded-md border border-slate-100 bg-[#FAFBFD] p-3 flex flex-col items-center text-center">
          <CompassHexagonBadge className="w-14 h-14 mb-2" />
          <div className="text-[11px] font-bold text-slate-900 leading-tight">Explorer</div>
          <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">
            Complete 5 checkpoints
          </div>
          <div className="mt-2.5 w-full">
            <div className="text-[9px] font-bold text-slate-500 mb-1">1 / 5</div>
            <div className="h-1.5 w-full rounded-sm bg-slate-200 overflow-hidden">
              <div className="h-full rounded-sm bg-[#0284C7]" style={{ width: "20%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. Weekly Progress Widget
 */
export function WeeklyProgressWidget() {
  const days = [
    { day: "Mon", height: 50 },
    { day: "Tue", height: 35 },
    { day: "Wed", height: 95, isPeak: true },
    { day: "Thu", height: 65 },
    { day: "Fri", height: 30 },
    { day: "Sat", height: 20 },
    { day: "Sun", height: 15 },
  ];

  return (
    <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900">Weekly Progress</h3>
        <Link href="/profile" className="text-xs font-bold text-[#6D28D9] hover:underline">
          View insights
        </Link>
      </div>

      <div className="flex items-end justify-between gap-4">
        {/* 7-Day Bar Chart */}
        <div className="flex items-end gap-2 sm:gap-2.5 flex-1 h-20 pt-2">
          {days.map((item) => (
            <div key={item.day} className="flex flex-col items-center flex-1 h-full justify-end group">
              <div className="relative w-full flex justify-center">
                <div
                  className={`w-3.5 sm:w-4 rounded-t-sm transition-all group-hover:opacity-80 ${
                    item.isPeak ? "bg-[#7C3AED] shadow-sm" : "bg-[#A78BFA]"
                  }`}
                  style={{ height: `${(item.height / 100) * 55}px` }}
                />
              </div>
              <span className="mt-1.5 text-[9px] font-semibold text-slate-400">{item.day}</span>
            </div>
          ))}
        </div>

        {/* Right Summary Statistics */}
        <div className="shrink-0 pl-2 text-right">
          <div className="text-[10px] font-semibold text-slate-400">This Week</div>
          <div className="text-xl font-extrabold text-slate-900 leading-tight">2.5 hrs</div>
          <div className="mt-1 flex items-center justify-end gap-1 text-[10px] font-bold text-emerald-600">
            <IconTrendingUp className="h-3 w-3" />
            <span>+1.2 hrs vs last week</span>
          </div>
        </div>
      </div>
    </div>
  );
}
