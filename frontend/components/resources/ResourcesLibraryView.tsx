"use client";

import React, { useState, useMemo } from "react";
import {
  IconSearch,
  IconAdjustmentsHorizontal,
  IconBookmark,
  IconBookmarkFilled,
  IconDots,
  IconChevronRight,
  IconClock,
  IconDownload,
  IconNotes,
  IconList,
  IconLayoutGrid,
  IconPlayerPlay,
  IconFileText,
  IconNews,
  IconListDetails,
  IconCode,
  IconBook,
  IconWorld,
  IconTrendingUp,
  IconDatabase,
  IconBrain,
  IconCheck,
  IconExternalLink,
} from "@tabler/icons-react";

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  type: "Video" | "PDF" | "Article" | "Practice Set" | "Cheatsheet" | "Books";
  domain: "Programming" | "Data Science" | "Web Development" | "Database" | "AI & ML";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  addedOn: string;
  url?: string;
}

const INITIAL_RESOURCES: ResourceItem[] = [
  {
    id: "res-1",
    title: "Python for Beginners – Full Course",
    description: "Complete Python tutorial for beginners with hands-on examples.",
    type: "Video",
    domain: "Programming",
    difficulty: "Beginner",
    duration: "2h 35m",
    addedOn: "28 May 2025",
    url: "https://www.youtube.com/results?search_query=python+for+beginners+full+course",
  },
  {
    id: "res-2",
    title: "Python Cheat Sheet",
    description: "Quick reference guide for Python syntax and commonly used functions.",
    type: "PDF",
    domain: "Programming",
    difficulty: "Beginner",
    duration: "2 pages",
    addedOn: "26 May 2025",
    url: "https://docs.python.org/3/",
  },
  {
    id: "res-3",
    title: "Understanding Data Structures",
    description: "In-depth explanation of arrays, linked lists, stacks, queues and more.",
    type: "Article",
    domain: "Data Science",
    difficulty: "Intermediate",
    duration: "15 min read",
    addedOn: "24 May 2025",
    url: "https://en.wikipedia.org/wiki/Data_structure",
  },
  {
    id: "res-4",
    title: "Arrays in Python – Practice Set",
    description: "20 practice questions to test your understanding of arrays.",
    type: "Practice Set",
    domain: "Programming",
    difficulty: "Beginner",
    duration: "20 Questions",
    addedOn: "23 May 2025",
    url: "/goals/new",
  },
  {
    id: "res-5",
    title: "SQL Query Guide",
    description: "Common SQL queries with examples and use cases.",
    type: "PDF",
    domain: "Database",
    difficulty: "Intermediate",
    duration: "8 pages",
    addedOn: "21 May 2025",
    url: "https://www.w3schools.com/sql/",
  },
  {
    id: "res-6",
    title: "Introduction to Machine Learning",
    description: "Basics of ML, types of models and real-world applications.",
    type: "Video",
    domain: "AI & ML",
    difficulty: "Beginner",
    duration: "1h 10m",
    addedOn: "19 May 2025",
    url: "https://developers.google.com/machine-learning/crash-course",
  },
  {
    id: "res-7",
    title: "Full-Stack Web Dev with Next.js & React 19",
    description: "Comprehensive guide to building production React apps with server actions.",
    type: "Video",
    domain: "Web Development",
    difficulty: "Intermediate",
    duration: "3h 45m",
    addedOn: "17 May 2025",
    url: "https://nextjs.org/docs",
  },
  {
    id: "res-8",
    title: "Neural Networks & Deep Learning Foundations",
    description: "Mathematical principles and practical PyTorch implementation of backpropagation.",
    type: "Article",
    domain: "AI & ML",
    difficulty: "Advanced",
    duration: "30 min read",
    addedOn: "15 May 2025",
    url: "https://pytorch.org/tutorials/",
  },
  {
    id: "res-9",
    title: "Git & GitHub Team Workflows Cheatsheet",
    description: "Master branching, rebase strategies, merge conflict resolution, and PR reviews.",
    type: "Cheatsheet",
    domain: "Programming",
    difficulty: "Beginner",
    duration: "4 pages",
    addedOn: "12 May 2025",
    url: "https://git-scm.com/doc",
  },
  {
    id: "res-10",
    title: "PostgreSQL Architecture & Index Optimization",
    description: "Deep dive into B-Tree indices, VACUUM tuning, and query execution plans.",
    type: "Books",
    domain: "Database",
    difficulty: "Advanced",
    duration: "140 pages",
    addedOn: "10 May 2025",
    url: "https://www.postgresql.org/docs/",
  },
];

export function ResourcesLibraryView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All Resources");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<"latest" | "az">("latest");
  const [savedResourceIds, setSavedResourceIds] = useState<Set<string>>(new Set(["res-1", "res-3"]));
  const [activePage, setActivePage] = useState(1);

  const toggleSave = (id: string) => {
    setSavedResourceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const domainTabs = [
    { label: "Programming", count: "312 Resources", icon: IconCode, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
    { label: "Data Science", count: "186 Resources", icon: IconTrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "Web Development", count: "254 Resources", icon: IconWorld, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-100" },
    { label: "Database", count: "96 Resources", icon: IconDatabase, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    { label: "AI & ML", count: "142 Resources", icon: IconBrain, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
    { label: "More Domains", count: "View all", icon: IconLayoutGrid, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100" },
  ];

  const quickAccessItems = [
    { label: "My Library", count: `${21 + savedResourceIds.size} Saved`, icon: IconBookmark },
    { label: "Recently Viewed", count: "10 Items", icon: IconClock },
    { label: "Downloaded", count: "6 Items", icon: IconDownload },
    { label: "My Notes", count: "12 Notes", icon: IconNotes },
  ];

  const resourceTypeItems = [
    { label: "All Resources", count: "986", icon: IconLayoutGrid },
    { label: "Videos", count: "312", icon: IconPlayerPlay },
    { label: "PDFs", count: "268", icon: IconFileText },
    { label: "Articles", count: "184", icon: IconNews },
    { label: "Cheatsheets", count: "126", icon: IconListDetails },
    { label: "Practice Sets", count: "72", icon: IconCode },
    { label: "Books", count: "24", icon: IconBook },
  ];

  // Filtering
  const filteredResources = useMemo(() => {
    return INITIAL_RESOURCES.filter((res) => {
      // Domain filter
      if (selectedDomain !== "All" && selectedDomain !== "More Domains") {
        if (res.domain !== selectedDomain) return false;
      }
      // Type filter
      if (selectedType !== "All Resources") {
        if (res.type !== selectedType && !(selectedType === "PDFs" && res.type === "PDF") && !(selectedType === "Videos" && res.type === "Video") && !(selectedType === "Articles" && res.type === "Article") && !(selectedType === "Cheatsheets" && res.type === "Cheatsheet") && !(selectedType === "Practice Sets" && res.type === "Practice Set") && !(selectedType === "Books" && res.type === "Books")) {
          return false;
        }
      }
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = res.title.toLowerCase().includes(q);
        const matchesDesc = res.description.toLowerCase().includes(q);
        const matchesDomain = res.domain.toLowerCase().includes(q);
        const matchesType = res.type.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesDomain && !matchesType) return false;
      }
      return true;
    });
  }, [searchQuery, selectedDomain, selectedType]);

  // Helper for Type Icon badge
  const renderTypeIcon = (type: ResourceItem["type"]) => {
    switch (type) {
      case "Video":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#8B5CF6] text-white shadow-xs">
            <IconPlayerPlay className="h-4 w-4 fill-white text-white" />
          </div>
        );
      case "PDF":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EF4444] text-white shadow-xs">
            <span className="text-[10px] font-black tracking-tight">PDF</span>
          </div>
        );
      case "Article":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#38BDF8] text-white shadow-xs">
            <IconNews className="h-4 w-4" />
          </div>
        );
      case "Practice Set":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#22C55E] text-white shadow-xs">
            <IconCode className="h-4 w-4 stroke-[2.5]" />
          </div>
        );
      case "Cheatsheet":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F59E0B] text-white shadow-xs">
            <IconListDetails className="h-4 w-4" />
          </div>
        );
      case "Books":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6366F1] text-white shadow-xs">
            <IconBook className="h-4 w-4" />
          </div>
        );
    }
  };

  // Helper for Type Pill
  const renderTypePill = (type: ResourceItem["type"]) => {
    switch (type) {
      case "Video":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-bold">Video</span>;
      case "PDF":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold">PDF</span>;
      case "Article":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-100 text-[10px] font-bold">Article</span>;
      case "Practice Set":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold">Practice Set</span>;
      case "Cheatsheet":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold">Cheatsheet</span>;
      case "Books":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold">Book</span>;
    }
  };

  // Helper for Difficulty Pill
  const renderDifficultyPill = (difficulty: ResourceItem["difficulty"]) => {
    switch (difficulty) {
      case "Beginner":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold">Beginner</span>;
      case "Intermediate":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold">Intermediate</span>;
      case "Advanced":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-bold">Advanced</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Row: Title on Left, Search & Filters on Right */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Resources Library</span>
            <IconBook className="h-6 w-6 text-slate-700 stroke-[2.2]" />
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Explore high-quality learning materials across domains and formats.
          </p>
        </div>

        {/* Right Search Input & Filters Button */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources, topics, or keywords..."
              className="w-full pl-9.5 pr-4 py-2.5 rounded-xl border border-slate-200/90 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] shadow-2xs transition-all"
            />
          </div>

          <button
            onClick={() => {
              setSelectedDomain("All");
              setSelectedType("All Resources");
              setSearchQuery("");
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer shrink-0"
          >
            <IconAdjustmentsHorizontal className="h-4 w-4 text-slate-500" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* 2. Browse by Domain Horizontal Row */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
          Browse by Domain
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {domainTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedDomain === tab.label || (tab.label === "Programming" && selectedDomain === "All");

            return (
              <button
                key={tab.label}
                onClick={() => setSelectedDomain(tab.label === "More Domains" ? "All" : tab.label)}
                className={`relative rounded-2xl border bg-white p-3.5 flex flex-col justify-between text-left transition-all group hover:shadow-xs cursor-pointer ${
                  isSelected
                    ? "border-purple-200 shadow-2xs"
                    : "border-slate-100/90 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tab.bg} ${tab.border} border ${tab.color} shadow-2xs`}>
                    <Icon className="h-4.5 w-4.5 stroke-[2.2]" />
                  </div>
                  <IconChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>

                <div className="mt-3">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {tab.label}
                  </div>
                  <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                    {tab.count}
                  </div>
                </div>

                {/* Active Underline Indicator / Dot */}
                <div className="mt-2.5 flex justify-center w-full">
                  {isSelected ? (
                    <div className="h-1 w-full bg-[#7C3AED] rounded-full" />
                  ) : (
                    <div className="h-1 w-1 bg-slate-200 rounded-full" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Content: Left Column (Quick Access + Types) & Right Column (Table / Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (3 of 12) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Quick Access Card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Quick Access
            </h3>

            <div className="space-y-1">
              {quickAccessItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.label === "My Library") {
                        setSelectedType("All Resources");
                      }
                    }}
                    className="flex items-center justify-between w-full px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-slate-500 group-hover:text-slate-900 stroke-[2]" />
                      <span className="text-xs font-bold text-slate-800 group-hover:text-slate-900">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resource Types Card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Resource Types
            </h3>

            <div className="space-y-1">
              {resourceTypeItems.map((item) => {
                const isSelected = selectedType === item.label;
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    onClick={() => setSelectedType(item.label)}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#EDE9FE] text-[#6D28D9] font-bold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isSelected ? "text-[#6D28D9]" : "text-slate-400"} stroke-[2]`} />
                      <span className="text-xs">{item.label}</span>
                    </div>
                    <span className={`text-[10px] font-bold ${isSelected ? "text-[#6D28D9]" : "text-slate-400"}`}>
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column (9 of 12): All Resources Table / Grid */}
        <div className="lg:col-span-9 rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          
          {/* Header Bar: Count on Left, Sort & View Modes on Right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                All Resources
              </h2>
              <p className="text-[11px] font-medium text-slate-400">
                {filteredResources.length === INITIAL_RESOURCES.length ? "986 resources found" : `${filteredResources.length} resources found`}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs">
                <span className="text-slate-400 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="latest">Latest</option>
                  <option value="az">A-Z</option>
                </select>
              </div>

              {/* View Switchers */}
              <div className="flex items-center rounded-xl border border-slate-200 p-0.5 bg-slate-50/60 shadow-2xs">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "bg-[#EDE9FE] text-[#6D28D9]"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                  title="List View"
                >
                  <IconList className="h-4 w-4 stroke-[2.2]" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-[#EDE9FE] text-[#6D28D9]"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                  title="Grid View"
                >
                  <IconLayoutGrid className="h-4 w-4 stroke-[2.2]" />
                </button>
              </div>
            </div>
          </div>

          {/* Table / Grid Content */}
          {filteredResources.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <IconBook className="h-10 w-10 text-slate-300 mx-auto stroke-[1.5]" />
              <div className="text-sm font-bold text-slate-700">No resources found</div>
              <p className="text-xs text-slate-400">Try changing your search query or active filters.</p>
              <button
                onClick={() => {
                  setSelectedDomain("All");
                  setSelectedType("All Resources");
                  setSearchQuery("");
                }}
                className="mt-2 text-xs font-bold text-[#7C3AED] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : viewMode === "list" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-3">Resource</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Domain</th>
                    <th className="py-3 px-3">Difficulty</th>
                    <th className="py-3 px-3">Duration</th>
                    <th className="py-3 px-3">Added On</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {filteredResources.map((res) => {
                    const isSaved = savedResourceIds.has(res.id);

                    return (
                      <tr key={res.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* Resource Info (Icon + Title + Desc) */}
                        <td className="py-3.5 px-3 min-w-[280px]">
                          <div className="flex items-center gap-3">
                            {renderTypeIcon(res.type)}
                            <div>
                              <a
                                href={res.url || "#"}
                                target={res.url?.startsWith("http") ? "_blank" : "_self"}
                                rel="noreferrer"
                                className="font-bold text-slate-900 group-hover:text-[#7C3AED] transition-colors leading-tight flex items-center gap-1"
                              >
                                <span>{res.title}</span>
                                {res.url?.startsWith("http") && (
                                  <IconExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                                )}
                              </a>
                              <p className="text-[11px] text-slate-400 font-medium leading-snug mt-0.5 line-clamp-1">
                                {res.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Type Pill */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {renderTypePill(res.type)}
                        </td>

                        {/* Domain */}
                        <td className="py-3.5 px-3 whitespace-nowrap font-semibold text-slate-700">
                          {res.domain}
                        </td>

                        {/* Difficulty */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {renderDifficultyPill(res.difficulty)}
                        </td>

                        {/* Duration */}
                        <td className="py-3.5 px-3 whitespace-nowrap font-medium text-slate-600">
                          {res.duration}
                        </td>

                        {/* Added On */}
                        <td className="py-3.5 px-3 whitespace-nowrap font-medium text-slate-500">
                          {res.addedOn}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => toggleSave(res.id)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isSaved
                                  ? "text-[#7C3AED] bg-purple-50"
                                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                              }`}
                              title={isSaved ? "Remove bookmark" : "Save resource"}
                            >
                              {isSaved ? (
                                <IconBookmarkFilled className="h-4 w-4" />
                              ) : (
                                <IconBookmark className="h-4 w-4 stroke-[2]" />
                              )}
                            </button>
                            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
                              <IconDots className="h-4 w-4 stroke-[2]" />
                            </button>
                          </div>
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
              {filteredResources.map((res) => {
                const isSaved = savedResourceIds.has(res.id);

                return (
                  <div
                    key={res.id}
                    className="rounded-2xl border border-slate-100 bg-[#FAFBFD] p-4 flex flex-col justify-between hover:border-purple-200 hover:shadow-xs transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        {renderTypeIcon(res.type)}
                        <div className="flex items-center gap-1.5">
                          {renderTypePill(res.type)}
                          <button
                            onClick={() => toggleSave(res.id)}
                            className={`p-1 rounded-lg transition-colors cursor-pointer ${
                              isSaved ? "text-[#7C3AED]" : "text-slate-400 hover:text-slate-700"
                            }`}
                          >
                            {isSaved ? <IconBookmarkFilled className="h-4 w-4" /> : <IconBookmark className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <a
                        href={res.url || "#"}
                        target={res.url?.startsWith("http") ? "_blank" : "_self"}
                        rel="noreferrer"
                        className="font-bold text-xs text-slate-900 group-hover:text-[#7C3AED] transition-colors leading-tight line-clamp-2 block"
                      >
                        {res.title}
                      </a>
                      <p className="text-[11px] text-slate-400 font-medium mt-1 line-clamp-2">
                        {res.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                      <span>{res.duration}</span>
                      {renderDifficultyPill(res.difficulty)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. Pagination Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs font-medium text-slate-400">
              Showing 1 to {filteredResources.length} of 986 resources
            </div>

            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              <button
                disabled={activePage === 1}
                onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                &lt;
              </button>

              <button
                onClick={() => setActivePage(1)}
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activePage === 1
                    ? "bg-[#7C3AED] text-white shadow-xs"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                1
              </button>

              <button
                onClick={() => setActivePage(2)}
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activePage === 2
                    ? "bg-[#7C3AED] text-white shadow-xs"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                2
              </button>

              <button
                onClick={() => setActivePage(3)}
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activePage === 3
                    ? "bg-[#7C3AED] text-white shadow-xs"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                3
              </button>

              <span className="px-1 text-xs text-slate-400 font-bold">...</span>

              <button
                onClick={() => setActivePage(99)}
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activePage === 99
                    ? "bg-[#7C3AED] text-white shadow-xs"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                99
              </button>

              <button
                disabled={activePage === 99}
                onClick={() => setActivePage((p) => Math.min(99, p + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
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
