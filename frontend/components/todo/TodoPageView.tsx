"use client";

import React, { useState, useMemo } from "react";
import {
  IconListCheck,
  IconPlus,
  IconCheck,
  IconTrash,
  IconClock,
  IconAdjustmentsHorizontal,
  IconSearch,
  IconBolt,
  IconCircleCheck,
  IconTrendingUp,
  IconWorld,
  IconDatabase,
  IconBrain,
  IconCode,
  IconLayoutGrid,
  IconList,
  IconCalendar,
  IconFlame,
  IconX,
} from "@tabler/icons-react";

export interface TodoTask {
  id: string;
  title: string;
  description: string;
  category: "Programming" | "Web Development" | "Data Science" | "Database" | "AI & ML";
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  xpReward: number;
  completed: boolean;
}

const INITIAL_TASKS: TodoTask[] = [
  {
    id: "task-1",
    title: "Python Lists & Dictionaries Exercises",
    description: "Complete 10 hands-on practice problems on data manipulation.",
    category: "Programming",
    priority: "High",
    dueDate: "Today",
    xpReward: 30,
    completed: false,
  },
  {
    id: "task-2",
    title: "Next.js Server Actions & Streaming",
    description: "Watch module 4 tutorial and test suspense loading boundaries.",
    category: "Web Development",
    priority: "Medium",
    dueDate: "Today",
    xpReward: 20,
    completed: false,
  },
  {
    id: "task-3",
    title: "Linear Algebra: Matrices & Vectors",
    description: "Review eigenvector notes for machine learning algorithms.",
    category: "Data Science",
    priority: "Medium",
    dueDate: "Tomorrow",
    xpReward: 25,
    completed: false,
  },
  {
    id: "task-4",
    title: "Daily Practice: Two Pointers & Arrays",
    description: "Solve 3 algorithmic coding challenges on two-pointer traversal.",
    category: "Programming",
    priority: "High",
    dueDate: "Today",
    xpReward: 30,
    completed: true,
  },
  {
    id: "task-5",
    title: "PostgreSQL Index Optimization Guide",
    description: "Study B-Tree index scans vs sequential table scans.",
    category: "Database",
    priority: "Low",
    dueDate: "26 May 2025",
    xpReward: 15,
    completed: true,
  },
  {
    id: "task-6",
    title: "Neural Networks: Backpropagation",
    description: "Implement simple forward and backward pass in Python.",
    category: "AI & ML",
    priority: "High",
    dueDate: "In 2 days",
    xpReward: 40,
    completed: false,
  },
  {
    id: "task-7",
    title: "Weekly Habit & Streak Review",
    description: "Check study consistency and claim daily streak bonus.",
    category: "Programming",
    priority: "Low",
    dueDate: "Today",
    xpReward: 10,
    completed: true,
  },
];

export function TodoPageView() {
  const [tasks, setTasks] = useState<TodoTask[]>(INITIAL_TASKS);
  const [selectedQuickView, setSelectedQuickView] = useState<string>("All Tasks");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedPriority, setSelectedPriority] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "xp">("dueDate");

  // Inline Quick Add State
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<TodoTask["category"]>("Programming");
  const [newPriority, setNewPriority] = useState<TodoTask["priority"]>("Medium");
  const [newDueDate, setNewDueDate] = useState("Today");
  const [newXp, setNewXp] = useState(25);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TodoTask = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || "Practice session and study task.",
      category: newCategory,
      priority: newPriority,
      dueDate: newDueDate,
      xpReward: Number(newXp) || 20,
      completed: false,
    };

    setTasks([newTask, ...tasks]);
    setNewTitle("");
    setNewDesc("");
    setIsAdding(false);
  };

  // Metrics
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;

  const quickAccessItems = [
    { label: "Today's Tasks", count: `${tasks.filter((t) => t.dueDate === "Today" && !t.completed).length} Due`, icon: IconClock },
    { label: "High Priority", count: `${tasks.filter((t) => t.priority === "High" && !t.completed).length} Tasks`, icon: IconFlame },
    { label: "Upcoming", count: `${tasks.filter((t) => t.dueDate !== "Today" && !t.completed).length} Tasks`, icon: IconCalendar },
    { label: "Completed", count: `${completedCount} Done`, icon: IconCircleCheck },
  ];

  const categoryItems = [
    { label: "All Categories", count: totalCount, icon: IconLayoutGrid },
    { label: "Programming", count: tasks.filter((t) => t.category === "Programming").length, icon: IconCode },
    { label: "Web Development", count: tasks.filter((t) => t.category === "Web Development").length, icon: IconWorld },
    { label: "Data Science", count: tasks.filter((t) => t.category === "Data Science").length, icon: IconTrendingUp },
    { label: "Database", count: tasks.filter((t) => t.category === "Database").length, icon: IconDatabase },
    { label: "AI & ML", count: tasks.filter((t) => t.category === "AI & ML").length, icon: IconBrain },
  ];

  // Filtering
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Quick Access Filter
        if (selectedQuickView === "Today's Tasks" && (task.dueDate !== "Today" || task.completed)) return false;
        if (selectedQuickView === "High Priority" && (task.priority !== "High" || task.completed)) return false;
        if (selectedQuickView === "Upcoming" && (task.dueDate === "Today" || task.completed)) return false;
        if (selectedQuickView === "Completed" && !task.completed) return false;

        // Category Box
        if (selectedCategory !== "All Categories" && task.category !== selectedCategory) {
          return false;
        }

        // Priority Filter
        if (selectedPriority !== "All" && task.priority !== selectedPriority) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = task.title.toLowerCase().includes(q);
          const matchesDesc = task.description.toLowerCase().includes(q);
          const matchesCat = task.category.toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc && !matchesCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "xp") return b.xpReward - a.xpReward;
        if (sortBy === "priority") {
          const order = { High: 3, Medium: 2, Low: 1 };
          return order[b.priority] - order[a.priority];
        }
        return 0;
      });
  }, [tasks, selectedQuickView, selectedCategory, selectedPriority, searchQuery, sortBy]);

  // Helper for Category Icon Box with Sharp Edges
  const renderCategoryIcon = (category: TodoTask["category"]) => {
    switch (category) {
      case "Programming":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-[#8B5CF6] text-white shadow-xs">
            <IconCode className="h-4 w-4 stroke-[2.2]" />
          </div>
        );
      case "Web Development":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-[#38BDF8] text-white shadow-xs">
            <IconWorld className="h-4 w-4 stroke-[2.2]" />
          </div>
        );
      case "Data Science":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-[#22C55E] text-white shadow-xs">
            <IconTrendingUp className="h-4 w-4 stroke-[2.2]" />
          </div>
        );
      case "Database":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-[#F59E0B] text-white shadow-xs">
            <IconDatabase className="h-4 w-4 stroke-[2.2]" />
          </div>
        );
      case "AI & ML":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-[#6366F1] text-white shadow-xs">
            <IconBrain className="h-4 w-4 stroke-[2.2]" />
          </div>
        );
    }
  };

  // Helper for Category Pill with Sharp Edges
  const renderCategoryPill = (category: TodoTask["category"]) => {
    switch (category) {
      case "Programming":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-none bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-bold">Programming</span>;
      case "Web Development":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-none bg-sky-50 text-sky-700 border border-sky-100 text-[10px] font-bold">Web Dev</span>;
      case "Data Science":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-none bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold">Data Science</span>;
      case "Database":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-none bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold">Database</span>;
      case "AI & ML":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-none bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold">AI & ML</span>;
    }
  };

  // Helper for Priority Pill with Sharp Edges
  const renderPriorityPill = (priority: TodoTask["priority"]) => {
    switch (priority) {
      case "High":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-none bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-bold">High</span>;
      case "Medium":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-none bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold">Medium</span>;
      case "Low":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-none bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold">Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Row: Title on Left, Search & Actions on Right */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>To-Do List</span>
            <IconListCheck className="h-6 w-6 text-slate-900 stroke-[2.2]" />
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 font-semibold">
            Manage daily learning milestones, practice exercises, and earn bonus XP.
          </p>
        </div>

        {/* Right Search Input & New Task Button with Sharp Edges */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, topics, or keywords..."
              className="w-full pl-9.5 pr-4 py-2.5 rounded-none border border-slate-300 bg-white text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] shadow-2xs transition-all"
            />
          </div>

          <button
            onClick={() => {
              setSelectedCategory("All Categories");
              setSelectedQuickView("All Tasks");
              setSelectedPriority("All");
              setSearchQuery("");
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-none border border-slate-300 bg-white text-xs font-bold text-slate-900 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer shrink-0"
            title="Reset Filters"
          >
            <IconAdjustmentsHorizontal className="h-4 w-4 text-slate-700" />
            <span>Filters</span>
          </button>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-none bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0"
          >
            <IconPlus className="h-4 w-4 stroke-[2.5]" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content: Left Column & Right Column with Sharp Edges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (3 of 12) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Quick Access Card */}
          <div className="rounded-none border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Quick Access
            </h3>

            <div className="space-y-1">
              {quickAccessItems.map((item) => {
                const isSelected = selectedQuickView === item.label;
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    onClick={() => setSelectedQuickView(item.label === selectedQuickView ? "All Tasks" : item.label)}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-none text-left transition-all group cursor-pointer ${
                      isSelected
                        ? "bg-[#EDE9FE] text-[#6D28D9] font-bold"
                        : "hover:bg-slate-50 text-slate-900 font-semibold"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isSelected ? "text-[#6D28D9]" : "text-slate-700 group-hover:text-black"} stroke-[2]`} />
                      <span className="text-xs">
                        {item.label}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold ${isSelected ? "text-[#6D28D9]" : "text-slate-500"}`}>
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Task Categories Card */}
          <div className="rounded-none border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Categories
            </h3>

            <div className="space-y-1">
              {categoryItems.map((item) => {
                const isSelected = selectedCategory === item.label;
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    onClick={() => setSelectedCategory(item.label)}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-none text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#EDE9FE] text-[#6D28D9] font-bold"
                        : "text-slate-900 hover:bg-slate-50 hover:text-black font-semibold"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isSelected ? "text-[#6D28D9]" : "text-slate-700"} stroke-[2]`} />
                      <span className="text-xs">{item.label}</span>
                    </div>
                    <span className={`text-[10px] font-bold ${isSelected ? "text-[#6D28D9]" : "text-slate-500"}`}>
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column (9 of 12): All Tasks Table */}
        <div className="lg:col-span-9 rounded-none border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          
          {/* Header Bar: Count on Left, Sort & View Modes on Right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-black text-slate-900">
                All Tasks
              </h2>
              <p className="text-[11px] font-semibold text-slate-500">
                {filteredTasks.length} tasks found • {completedCount} completed
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Priority Dropdown */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-none border border-slate-300 bg-white text-xs font-bold text-slate-900 shadow-2xs">
                <span className="text-slate-500 font-medium">Priority:</span>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="All">All</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-none border border-slate-300 bg-white text-xs font-bold text-slate-900 shadow-2xs">
                <span className="text-slate-500 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="xp">XP Reward</option>
                </select>
              </div>

              {/* View Switchers */}
              <div className="flex items-center rounded-none border border-slate-300 p-0.5 bg-slate-50 shadow-2xs">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-none transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "bg-[#EDE9FE] text-[#6D28D9]"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  title="List View"
                >
                  <IconList className="h-4 w-4 stroke-[2.2]" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-none transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-[#EDE9FE] text-[#6D28D9]"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  title="Grid View"
                >
                  <IconLayoutGrid className="h-4 w-4 stroke-[2.2]" />
                </button>
              </div>
            </div>
          </div>

          {/* New Task Inline Creator Form with Sharp Edges */}
          {isAdding && (
            <form
              onSubmit={handleAddTask}
              className="p-4 rounded-none border border-purple-300 bg-[#FAF8FE] space-y-3 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#6D28D9]">Create New Task</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-500 hover:text-black cursor-pointer"
                >
                  <IconX className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Task title (e.g. Master React Query hooks)"
                  className="w-full px-3.5 py-2 rounded-none border border-slate-300 bg-white text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
                  autoFocus
                />
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Brief description or learning objective..."
                  className="w-full px-3.5 py-2 rounded-none border border-slate-300 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-none border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="Programming">Programming</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Database">Database</option>
                    <option value="AI & ML">AI & ML</option>
                  </select>

                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-none border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="High">🔴 High</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="Low">🟢 Low</option>
                  </select>

                  <select
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="px-2.5 py-1.5 rounded-none border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="Today">Today</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="In 2 days">In 2 days</option>
                    <option value="This Week">This Week</option>
                  </select>

                  <select
                    value={newXp}
                    onChange={(e) => setNewXp(Number(e.target.value))}
                    className="px-2.5 py-1.5 rounded-none border border-slate-300 bg-white text-xs font-black text-[#6D28D9] focus:outline-none"
                  >
                    <option value={10}>+10 XP</option>
                    <option value={20}>+20 XP</option>
                    <option value={30}>+30 XP</option>
                    <option value={40}>+40 XP</option>
                    <option value={50}>+50 XP</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-black cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-none bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    Save Task
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Table / Grid Content */}
          {filteredTasks.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <IconListCheck className="h-10 w-10 text-slate-400 mx-auto stroke-[1.5]" />
              <div className="text-sm font-bold text-slate-900">No tasks found</div>
              <p className="text-xs text-slate-500">Try changing your search query or active filters.</p>
              <button
                onClick={() => {
                  setSelectedCategory("All Categories");
                  setSelectedQuickView("All Tasks");
                  setSelectedPriority("All");
                  setSearchQuery("");
                }}
                className="mt-2 text-xs font-bold text-[#7C3AED] hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : viewMode === "list" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-600">
                    <th className="py-3 px-3">Task</th>
                    <th className="py-3 px-3">Domain</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Due Date</th>
                    <th className="py-3 px-3">Reward</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredTasks.map((task) => {
                    return (
                      <tr
                        key={task.id}
                        className={`hover:bg-slate-50 transition-colors group ${
                          task.completed ? "bg-slate-50/50 opacity-75" : ""
                        }`}
                      >
                        {/* Task Title & Custom Domain Icon */}
                        <td className="py-3.5 px-3 min-w-[280px]">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleTask(task.id)}
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-none border transition-all cursor-pointer ${
                                task.completed
                                  ? "bg-[#7C3AED] border-[#7C3AED] text-white shadow-2xs"
                                  : "border-slate-400 bg-white hover:border-[#7C3AED] hover:bg-purple-50/50"
                              }`}
                              title={task.completed ? "Mark incomplete" : "Mark completed"}
                            >
                              {task.completed && <IconCheck className="h-3.5 w-3.5 stroke-[3]" />}
                            </button>

                            {renderCategoryIcon(task.category)}

                            <div>
                              <span
                                className={`font-bold leading-tight transition-colors block ${
                                  task.completed
                                    ? "text-slate-400 line-through"
                                    : "text-slate-900 group-hover:text-[#7C3AED]"
                                }`}
                              >
                                {task.title}
                              </span>
                              <p className="text-[11px] text-slate-500 font-medium leading-snug mt-0.5 line-clamp-1">
                                {task.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Domain Pill */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {renderCategoryPill(task.category)}
                        </td>

                        {/* Priority */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {renderPriorityPill(task.priority)}
                        </td>

                        {/* Due Date */}
                        <td className="py-3.5 px-3 whitespace-nowrap font-bold text-slate-700">
                          <div className="flex items-center gap-1.5 text-xs">
                            <IconCalendar className="h-3.5 w-3.5 text-slate-500" />
                            <span>{task.dueDate}</span>
                          </div>
                        </td>

                        {/* XP Reward */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-black ${
                              task.completed
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-purple-50 text-purple-800 border border-purple-200"
                            }`}
                          >
                            <IconBolt className="h-3 w-3 stroke-[2.5]" />
                            <span>+{task.xpReward} XP</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-3 whitespace-nowrap text-right">
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1.5 rounded-none text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Delete task"
                          >
                            <IconTrash className="h-4 w-4 stroke-[2]" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View Mode */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {filteredTasks.map((task) => {
                return (
                  <div
                    key={task.id}
                    className="rounded-none border border-slate-200 bg-[#FAFBFD] p-4 flex flex-col justify-between hover:border-purple-300 hover:shadow-xs transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-none border transition-all cursor-pointer ${
                              task.completed
                                ? "bg-[#7C3AED] border-[#7C3AED] text-white shadow-2xs"
                                : "border-slate-400 bg-white hover:border-[#7C3AED]"
                            }`}
                          >
                            {task.completed && <IconCheck className="h-3.5 w-3.5 stroke-[3]" />}
                          </button>
                          {renderCategoryIcon(task.category)}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {renderPriorityPill(task.priority)}
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 rounded-none text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <IconTrash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div
                        className={`font-bold text-xs leading-tight line-clamp-2 block ${
                          task.completed ? "text-slate-400 line-through" : "text-slate-900 group-hover:text-[#7C3AED]"
                        }`}
                      >
                        {task.title}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-700 font-bold">
                      <span>{task.dueDate}</span>
                      <span className="font-black text-[#6D28D9]">+{task.xpReward} XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. Pagination / Summary Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs font-semibold text-slate-600">
              Showing 1 to {filteredTasks.length} of {tasks.length} tasks
            </div>

            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-none border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                &lt;
              </button>

              <button
                className="flex h-8 w-8 items-center justify-center rounded-none text-xs font-black bg-[#7C3AED] text-white shadow-xs"
              >
                1
              </button>

              <button
                className="flex h-8 w-8 items-center justify-center rounded-none border border-slate-300 text-slate-900 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
              >
                2
              </button>

              <button
                className="flex h-8 w-8 items-center justify-center rounded-none border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                &gt;
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
