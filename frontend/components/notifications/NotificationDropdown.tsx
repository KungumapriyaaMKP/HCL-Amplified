"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  IconBell,
  IconCheck,
  IconChecks,
  IconShieldCheck,
  IconCode,
  IconRefresh,
  IconFlame,
  IconAward,
  IconX,
  IconArrowRight,
  IconSparkles,
} from "@tabler/icons-react";

export type NotificationType = "assessment" | "review" | "milestone" | "achievement";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timeAgo: string;
  read: boolean;
  actionUrl: string;
  actionLabel: string;
  tag: string;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    type: "assessment",
    title: "Proctored Assessment Ready",
    description: "Your personalized diagnostic assessment for Core Python & Neural Networks is ready for evaluation.",
    timeAgo: "10m ago",
    read: false,
    actionUrl: "/review",
    actionLabel: "Start Assessment",
    tag: "Assessment",
  },
  {
    id: "notif-2",
    type: "assessment",
    title: "Coding Sandbox Benchmark",
    description: "Compiler test suite with 4 auto-graded test cases is waiting for your submission.",
    timeAgo: "45m ago",
    read: false,
    actionUrl: "/todo",
    actionLabel: "View Task",
    tag: "Coding Exam",
  },
  {
    id: "notif-3",
    type: "review",
    title: "Daily Memory Calibration",
    description: "SM-2 spaced decay detected 3 concepts due for retention refresh (+30 XP).",
    timeAgo: "2h ago",
    read: false,
    actionUrl: "/review",
    actionLabel: "Review Now",
    tag: "Spaced Review",
  },
  {
    id: "notif-4",
    type: "milestone",
    title: "Daily Streak Shield Active",
    description: "Complete 1 micro-milestone today to maintain your consecutive streak bonus.",
    timeAgo: "4h ago",
    read: true,
    actionUrl: "/dashboard",
    actionLabel: "Open Dashboard",
    tag: "Streak",
  },
  {
    id: "notif-5",
    type: "achievement",
    title: "Achievement Milestone Reached",
    description: "You unlocked the First Steps achievement badge and earned +50 XP.",
    timeAgo: "Yesterday",
    read: true,
    actionUrl: "/achievements",
    actionLabel: "View Badges",
    tag: "Badge",
  },
];

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<"all" | "assessment" | "review">("all");
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    return n.type === activeFilter;
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "assessment":
        return <IconShieldCheck className="h-4 w-4 text-purple-600 stroke-[2.5]" />;
      case "review":
        return <IconRefresh className="h-4 w-4 text-blue-600 stroke-[2.5]" />;
      case "milestone":
        return <IconFlame className="h-4 w-4 text-orange-500 fill-orange-400" />;
      case "achievement":
        return <IconAward className="h-4 w-4 text-emerald-600 stroke-[2.5]" />;
    }
  };

  const getTagColor = (type: NotificationType) => {
    switch (type) {
      case "assessment":
        return "bg-purple-100/70 text-purple-800 border-purple-200";
      case "review":
        return "bg-blue-100/70 text-blue-800 border-blue-200";
      case "milestone":
        return "bg-orange-100/70 text-orange-800 border-orange-200";
      case "achievement":
        return "bg-emerald-100/70 text-emerald-800 border-emerald-200";
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        className={`relative flex h-10 w-10 items-center justify-center rounded-md border transition-all cursor-pointer shadow-xs ${
          isOpen
            ? "border-purple-300 bg-purple-50 text-[#6D28D9] ring-2 ring-purple-400/30"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        <IconBell className="h-4.5 w-4.5 stroke-[2]" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
          </span>
        )}
      </button>

      {/* Floating Notifications Popover */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-xl border border-slate-200/90 bg-white shadow-2xl backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-[#6D28D9] px-1.5 py-0.2 text-[9px] font-bold text-white">
                    {unreadCount} new
                  </span>
                )}
              </h4>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6D28D9] hover:underline cursor-pointer"
              >
                <IconChecks className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 border-b border-slate-100 bg-white px-3 py-2">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`rounded-xs px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                activeFilter === "all"
                  ? "bg-[#6D28D9] text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("assessment")}
              className={`rounded-xs px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                activeFilter === "assessment"
                  ? "bg-[#6D28D9] text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Assessments ({notifications.filter((n) => n.type === "assessment").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("review")}
              className={`rounded-xs px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                activeFilter === "review"
                  ? "bg-[#6D28D9] text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Reviews ({notifications.filter((n) => n.type === "review").length})
            </button>
          </div>

          {/* List of Notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
            {filteredNotifications.length === 0 ? (
              <div className="py-8 text-center px-4">
                <IconSparkles className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-700">No notifications in this category</p>
                <p className="text-[11px] text-slate-400 mt-0.5">You are completely up to date!</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer ${
                    notif.read ? "bg-white hover:bg-slate-50/80" : "bg-purple-50/40 hover:bg-purple-50/70"
                  }`}
                >
                  {/* Unread Indicator Bar */}
                  {!notif.read && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#7C3AED]" />
                  )}

                  {/* Icon Avatar */}
                  <div className="shrink-0 rounded-md border border-slate-200/80 bg-white p-2 shadow-2xs">
                    {getIcon(notif.type)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`inline-block rounded-xs border px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider ${getTagColor(
                          notif.type
                        )}`}
                      >
                        {notif.tag}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{notif.timeAgo}</span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-900 leading-snug">
                      {notif.title}
                    </h5>

                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed line-clamp-2">
                      {notif.description}
                    </p>

                    {/* Action Link Button */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <Link
                        href={notif.actionUrl}
                        onClick={() => {
                          markAsRead(notif.id);
                          setIsOpen(false);
                        }}
                        className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#6D28D9] hover:text-[#5B21B6] hover:underline"
                      >
                        <span>{notif.actionLabel}</span>
                        <IconArrowRight className="h-3 w-3 stroke-[2.5]" />
                      </Link>
                    </div>
                  </div>

                  {/* Dismiss Button */}
                  <button
                    type="button"
                    onClick={(e) => removeNotification(notif.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 p-1 transition-all rounded-xs hover:bg-slate-100"
                    title="Dismiss"
                  >
                    <IconX className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 text-center">
            <Link
              href="/todo"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-slate-600 hover:text-[#6D28D9] transition-colors"
            >
              View all daily milestones & tasks →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
