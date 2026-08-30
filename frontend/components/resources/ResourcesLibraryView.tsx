"use client";

import React, { useState, useMemo } from "react";
import {
  COMPREHENSIVE_RESOURCES,
  ResourceItem,
} from "@/data/libraryResources";
import {
  IconSearch,
  IconAdjustmentsHorizontal,
  IconBookmark,
  IconBookmarkFilled,
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
  IconExternalLink,
  IconX,
  IconCheck,
  IconSparkles,
  IconShare,
} from "@tabler/icons-react";

export function ResourcesLibraryView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All Resources");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<"latest" | "az" | "duration">("latest");
  const [savedResourceIds, setSavedResourceIds] = useState<Set<string>>(
    new Set(["web-vid-1", "aiml-vid-1", "genai-vid-1"])
  );
  const [activeVideoModal, setActiveVideoModal] = useState<ResourceItem | null>(null);
  const [userNote, setUserNote] = useState<string>("");
  const [savedNotes, setSavedNotes] = useState<Record<string, string>>({});
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([
    "web-vid-1",
    "de-vid-1",
    "java-vid-1",
  ]);
  const [quickAccessFilter, setQuickAccessFilter] = useState<string | null>(null);

  // Toggle bookmark / save
  const toggleSave = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedResourceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleOpenResource = (res: ResourceItem) => {
    // Add to recently viewed
    setRecentlyViewedIds((prev) => Array.from(new Set([res.id, ...prev])));
    if (res.type === "Video") {
      setActiveVideoModal(res);
      setUserNote(savedNotes[res.id] || "");
    } else if (res.url) {
      window.open(res.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleSaveNote = () => {
    if (!activeVideoModal) return;
    setSavedNotes((prev) => ({ ...prev, [activeVideoModal.id]: userNote }));
  };

  // Top Domain Tabs
  const TOP_DOMAINS = [
    { label: "All", count: `${COMPREHENSIVE_RESOURCES.length} Resources` },
    { label: "Web Development", count: "7 Resources" },
    { label: "Data Science", count: "4 Resources" },
    { label: "AI & Machine Learning", count: "4 Resources" },
    { label: "Generative AI & Enterprise LLMs", count: "3 Resources" },
    { label: "Enterprise Java & Microservices", count: "2 Resources" },
    { label: "Cloud & DevOps", count: "3 Resources" },
    { label: "Data Engineering & Big Data", count: "3 Resources" },
    { label: "Cybersecurity Fundamentals", count: "2 Resources" },
    { label: "Mobile Development", count: "3 Resources" },
    { label: "IoT & Embedded Engineering", count: "2 Resources" },
    { label: "SRE & Cloud Observability", count: "2 Resources" },
    { label: "QA & Test Automation", count: "2 Resources" },
    { label: "SAP & Enterprise ERP", count: "2 Resources" },
    { label: "Blockchain & Web3", count: "2 Resources" },
    { label: "Game Engine & 3D Simulation", count: "2 Resources" },
    { label: "UI/UX & Design Systems", count: "2 Resources" },
    { label: "Mainframe & Cloud Migration", count: "2 Resources" },
    { label: "Digital Product Management", count: "2 Resources" },
  ];

  // Resource Type counts
  const typeCounts = useMemo(() => {
    const counts = {
      All: COMPREHENSIVE_RESOURCES.length,
      Videos: 0,
      PDFs: 0,
      Articles: 0,
      Cheatsheets: 0,
      PracticeSets: 0,
      Books: 0,
    };
    COMPREHENSIVE_RESOURCES.forEach((r) => {
      if (r.type === "Video") counts.Videos++;
      else if (r.type === "PDF") counts.PDFs++;
      else if (r.type === "Article") counts.Articles++;
      else if (r.type === "Cheatsheet") counts.Cheatsheets++;
      else if (r.type === "Practice Set") counts.PracticeSets++;
      else if (r.type === "Books") counts.Books++;
    });
    return counts;
  }, []);

  const resourceTypeItems = [
    { label: "All Resources", count: `${typeCounts.All}`, icon: IconLayoutGrid },
    { label: "Videos", count: `${typeCounts.Videos}`, icon: IconPlayerPlay },
    { label: "PDFs", count: `${typeCounts.PDFs}`, icon: IconFileText },
    { label: "Articles", count: `${typeCounts.Articles}`, icon: IconNews },
    { label: "Cheatsheets", count: `${typeCounts.Cheatsheets}`, icon: IconListDetails },
    { label: "Practice Sets", count: `${typeCounts.PracticeSets}`, icon: IconCode },
    { label: "Books", count: `${typeCounts.Books}`, icon: IconBook },
  ];

  const quickAccessItems = [
    { id: "my-library", label: "My Library", count: `${savedResourceIds.size} Saved`, icon: IconBookmark },
    { id: "recently-viewed", label: "Recently Viewed", count: `${recentlyViewedIds.length} Items`, icon: IconClock },
    { id: "my-notes", label: "My Notes", count: `${Object.keys(savedNotes).length} Notes`, icon: IconNotes },
  ];

  // Filtering Engine
  const filteredResources = useMemo(() => {
    return COMPREHENSIVE_RESOURCES.filter((res) => {
      // 1. Quick Access Filter
      if (quickAccessFilter === "my-library") {
        if (!savedResourceIds.has(res.id)) return false;
      } else if (quickAccessFilter === "recently-viewed") {
        if (!recentlyViewedIds.includes(res.id)) return false;
      } else if (quickAccessFilter === "my-notes") {
        if (!savedNotes[res.id]) return false;
      }

      // 2. Domain Filter
      if (selectedDomain !== "All") {
        if (res.domain !== selectedDomain) return false;
      }

      // 3. STRICT Resource Type Filter
      if (selectedType !== "All Resources") {
        if (selectedType === "Videos" && res.type !== "Video") return false;
        if (selectedType === "PDFs" && res.type !== "PDF") return false;
        if (selectedType === "Articles" && res.type !== "Article") return false;
        if (selectedType === "Cheatsheets" && res.type !== "Cheatsheet") return false;
        if (selectedType === "Practice Sets" && res.type !== "Practice Set") return false;
        if (selectedType === "Books" && res.type !== "Books") return false;
      }

      // 4. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = res.title.toLowerCase().includes(q);
        const matchesDesc = res.description.toLowerCase().includes(q);
        const matchesDomain = res.domain.toLowerCase().includes(q);
        const matchesTags = res.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesDomain && !matchesTags) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "az") return a.title.localeCompare(b.title);
      if (sortBy === "duration") return a.duration.localeCompare(b.duration);
      return 0; // Default latest order
    });
  }, [searchQuery, selectedDomain, selectedType, quickAccessFilter, savedResourceIds, recentlyViewedIds, savedNotes, sortBy]);

  // Helper for Type Icon badge
  const renderTypeIcon = (type: ResourceItem["type"]) => {
    switch (type) {
      case "Video":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xs bg-[#8B5CF6] text-white shadow-2xs">
            <IconPlayerPlay className="h-4 w-4 fill-white text-white" />
          </div>
        );
      case "PDF":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xs bg-[#EF4444] text-white shadow-2xs">
            <span className="text-[10px] font-black tracking-tight">PDF</span>
          </div>
        );
      case "Article":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xs bg-[#0284C7] text-white shadow-2xs">
            <IconNews className="h-4 w-4" />
          </div>
        );
      case "Practice Set":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xs bg-[#16A34A] text-white shadow-2xs">
            <IconCode className="h-4 w-4 stroke-[2.5]" />
          </div>
        );
      case "Cheatsheet":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xs bg-[#D97706] text-white shadow-2xs">
            <IconListDetails className="h-4 w-4" />
          </div>
        );
      case "Books":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xs bg-[#6366F1] text-white shadow-2xs">
            <IconBook className="h-4 w-4" />
          </div>
        );
    }
  };

  // Helper for Type Pill
  const renderTypePill = (type: ResourceItem["type"]) => {
    switch (type) {
      case "Video":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-xs bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">Video</span>;
      case "PDF":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-xs bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold">PDF</span>;
      case "Article":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-xs bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold">Article</span>;
      case "Practice Set":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-xs bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">Practice Set</span>;
      case "Cheatsheet":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-xs bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">Cheatsheet</span>;
      case "Books":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-xs bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">Book</span>;
    }
  };

  // Helper for Difficulty Pill
  const renderDifficultyPill = (difficulty: ResourceItem["difficulty"]) => {
    switch (difficulty) {
      case "Beginner":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-xs bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">Beginner</span>;
      case "Intermediate":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-xs bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">Intermediate</span>;
      case "Advanced":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-xs bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">Advanced</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Resources Library</span>
            <IconBook className="h-6 w-6 text-slate-700 stroke-[2.2]" />
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Explore verified tutorials, architecture blueprints, videos, and cheatsheets across all 18 domains.
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
              placeholder="Search resources, topics, or frameworks..."
              className="w-full pl-9.5 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 rounded-xs border border-slate-200/90 bg-white focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] shadow-2xs transition-all"
            />
          </div>

          <button
            onClick={() => {
              setSelectedDomain("All");
              setSelectedType("All Resources");
              setQuickAccessFilter(null);
              setSearchQuery("");
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xs border border-slate-200/90 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer shrink-0"
          >
            <IconAdjustmentsHorizontal className="h-4 w-4 text-slate-500" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 2. Browse by Domain Horizontal Scrollable Row */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Browse by Domain ({TOP_DOMAINS.length - 1} Domains)
          </h2>
          <span className="text-[11px] font-semibold text-purple-600">
            Active: {selectedDomain}
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
          {TOP_DOMAINS.map((tab) => {
            const isSelected = selectedDomain === tab.label;

            return (
              <button
                key={tab.label}
                onClick={() => {
                  setSelectedDomain(tab.label);
                  setQuickAccessFilter(null);
                }}
                className={`shrink-0 rounded-xs border px-3.5 py-2.5 text-left transition-all cursor-pointer shadow-2xs ${
                  isSelected
                    ? "border-[#7C3AED] bg-[#FAF8FE] text-[#6D28D9] font-bold"
                    : "border-slate-200 bg-white text-slate-700 hover:border-purple-300 font-medium"
                }`}
              >
                <div className="text-xs font-bold leading-tight whitespace-nowrap">
                  {tab.label}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">
                  {tab.count}
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
          <div className="rounded-xs border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Quick Access
            </h3>

            <div className="space-y-1">
              {quickAccessItems.map((item) => {
                const Icon = item.icon;
                const isSelected = quickAccessFilter === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isSelected) setQuickAccessFilter(null);
                      else {
                        setQuickAccessFilter(item.id);
                        setSelectedType("All Resources");
                      }
                    }}
                    className={`flex items-center justify-between w-full px-2.5 py-2 rounded-xs text-left transition-colors group cursor-pointer ${
                      isSelected
                        ? "bg-[#EDE9FE] text-[#6D28D9] font-bold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isSelected ? "text-[#6D28D9]" : "text-slate-500 group-hover:text-slate-900"} stroke-[2]`} />
                      <span className="text-xs font-bold">{item.label}</span>
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
          <div className="rounded-xs border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Resource Types
            </h3>

            <div className="space-y-1">
              {resourceTypeItems.map((item) => {
                const isSelected = selectedType === item.label && !quickAccessFilter;
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      setSelectedType(item.label);
                      setQuickAccessFilter(null);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-xs text-left transition-all cursor-pointer ${
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
        <div className="lg:col-span-9 rounded-xs border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  {quickAccessFilter ? quickAccessItems.find((q) => q.id === quickAccessFilter)?.label : selectedType}
                </h2>
                {selectedDomain !== "All" && (
                  <span className="px-2 py-0.5 rounded-xs bg-purple-100/80 text-[#6D28D9] text-[10px] font-bold">
                    {selectedDomain}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                {filteredResources.length} {filteredResources.length === 1 ? "resource" : "resources"} found
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs">
                <span className="text-slate-400 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="latest">Latest</option>
                  <option value="az">A-Z</option>
                  <option value="duration">Duration</option>
                </select>
              </div>

              {/* View Switchers */}
              <div className="flex items-center rounded-xs border border-slate-200 p-0.5 bg-slate-50/60 shadow-2xs">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
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
                  className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
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
              <p className="text-xs text-slate-400">Try changing your search query, domain filter, or resource type.</p>
              <button
                onClick={() => {
                  setSelectedDomain("All");
                  setSelectedType("All Resources");
                  setQuickAccessFilter(null);
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
                      <tr
                        key={res.id}
                        onClick={() => handleOpenResource(res)}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      >
                        {/* Resource Info */}
                        <td className="py-3.5 px-3 min-w-[280px]">
                          <div className="flex items-center gap-3">
                            {renderTypeIcon(res.type)}
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-[#7C3AED] transition-colors leading-tight flex items-center gap-1.5">
                                <span>{res.title}</span>
                                {res.type === "Video" && (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-xs bg-purple-100 text-purple-700">
                                    Watch ▶
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 font-medium leading-snug mt-0.5 line-clamp-1">
                                {res.description}
                              </p>
                              {/* Tags */}
                              <div className="flex items-center gap-1 mt-1">
                                {res.tags?.slice(0, 3).map((tag) => (
                                  <span key={tag} className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-xs">
                                    {tag}
                                  </span>
                                ))}
                              </div>
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
                        <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 font-medium">
                          {res.duration}
                        </td>

                        {/* Added On */}
                        <td className="py-3.5 px-3 whitespace-nowrap text-slate-400 text-[11px]">
                          {res.addedOn}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => toggleSave(res.id, e)}
                              className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
                                isSaved
                                  ? "text-[#7C3AED] bg-purple-50"
                                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                              }`}
                              title={isSaved ? "Remove Bookmark" : "Bookmark Resource"}
                            >
                              {isSaved ? (
                                <IconBookmarkFilled className="h-4 w-4" />
                              ) : (
                                <IconBookmark className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              onClick={() => handleOpenResource(res)}
                              className="p-1.5 rounded-xs text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                              title="Open Resource"
                            >
                              <IconExternalLink className="h-4 w-4" />
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
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((res) => {
                const isSaved = savedResourceIds.has(res.id);

                return (
                  <div
                    key={res.id}
                    onClick={() => handleOpenResource(res)}
                    className="rounded-xs border border-slate-200/90 bg-white p-4 shadow-2xs flex flex-col justify-between hover:border-purple-300 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        {renderTypeIcon(res.type)}
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => toggleSave(res.id, e)}
                            className={`p-1 rounded-xs transition-colors cursor-pointer ${
                              isSaved ? "text-[#7C3AED]" : "text-slate-300 hover:text-slate-600"
                            }`}
                          >
                            {isSaved ? <IconBookmarkFilled className="h-4 w-4" /> : <IconBookmark className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#7C3AED] transition-colors leading-snug line-clamp-2">
                        {res.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-normal mt-1 leading-relaxed line-clamp-2">
                        {res.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {renderTypePill(res.type)}
                        {renderDifficultyPill(res.difficulty)}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">{res.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* ================= IN-APP VIDEO PLAYER & NOTE-TAKING MODAL ================= */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 animate-fadeIn">
          <div className="relative w-full max-w-4xl rounded-xs border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-purple-600 text-white shadow-2xs">
                  <IconPlayerPlay className="h-3.5 w-3.5 fill-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{activeVideoModal.title}</h3>
                  <p className="text-[10px] font-medium text-slate-500">{activeVideoModal.domain} · {activeVideoModal.duration}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSave(activeVideoModal.id)}
                  className="p-1.5 rounded-xs text-slate-400 hover:text-purple-600 hover:bg-white transition-colors cursor-pointer"
                  title="Bookmark"
                >
                  {savedResourceIds.has(activeVideoModal.id) ? (
                    <IconBookmarkFilled className="h-4 w-4 text-purple-600" />
                  ) : (
                    <IconBookmark className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="p-1.5 rounded-xs text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
                >
                  <IconX className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Embedded Video Player + Tabs */}
            <div className="p-5 overflow-y-auto space-y-4">
              
              {/* Embedded Player */}
              <div className="relative w-full aspect-video rounded-xs overflow-hidden bg-black shadow-inner">
                {activeVideoModal.youtubeId ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${activeVideoModal.youtubeId}?autoplay=1&rel=0`}
                    title={activeVideoModal.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-white space-y-2">
                    <IconPlayerPlay className="h-12 w-12 text-purple-400" />
                    <p className="text-xs font-bold">Video Stream Ready</p>
                    <a
                      href={activeVideoModal.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-1.5 rounded-xs bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors"
                    >
                      Watch on External Provider ↗
                    </a>
                  </div>
                )}
              </div>

              {/* Resource Meta & Note Taking */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {renderTypePill(activeVideoModal.type)}
                    {renderDifficultyPill(activeVideoModal.difficulty)}
                    <span className="text-[10px] font-bold text-slate-400">{activeVideoModal.addedOn}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {activeVideoModal.description}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {activeVideoModal.tags?.map((tag) => (
                      <span key={tag} className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Interactive Study Notes */}
                <div className="rounded-xs border border-purple-100 bg-[#FAF8FE] p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <IconNotes className="h-3.5 w-3.5 text-purple-600" />
                      <span>My Study Notes</span>
                    </span>
                    <button
                      onClick={handleSaveNote}
                      className="px-2.5 py-1 rounded-xs bg-purple-600 text-white text-[10px] font-bold hover:bg-purple-700 cursor-pointer shadow-2xs transition-all"
                    >
                      Save Note
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    placeholder="Take notes while watching this lesson..."
                    className="w-full rounded-xs border border-purple-200 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                  {savedNotes[activeVideoModal.id] && (
                    <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                      <IconCheck className="h-3 w-3" />
                      <span>Note saved to your library</span>
                    </p>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
