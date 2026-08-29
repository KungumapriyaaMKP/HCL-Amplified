"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconRotateClockwise,
  IconFlame,
  IconShieldAlert,
  IconCheck,
  IconCoffee,
  IconSparkles,
} from "@tabler/icons-react";

interface FocusTimerProps {
  moduleId?: string;
  skillName?: string;
  compact?: boolean;
  onSessionComplete?: (data: { xpEarned: number; integrity: number }) => void;
}

const FOCUS_SECONDS = 25 * 60; // 25 mins
const BREAK_SECONDS = 5 * 60;  // 5 mins

export function FocusTimer({
  moduleId,
  skillName,
  compact = false,
  onSessionComplete,
}: FocusTimerProps) {
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [timeLeft, setTimeLeft] = useState(FOCUS_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [interruptions, setInterruptions] = useState(0);
  const [completedStats, setCompletedStats] = useState<{
    xpEarned: number;
    integrity: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSeconds = mode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  // Track tab blur / visibility state as interruptions during focus blocks
  useEffect(() => {
    if (!isRunning || mode !== "focus") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setInterruptions((prev) => prev + 1);
      }
    };

    const handleBlur = () => {
      setInterruptions((prev) => prev + 1);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isRunning, mode]);

  // Complete session API handler
  const handleCompleteSession = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsRunning(false);

    try {
      if (sessionId && mode === "focus") {
        const actualSeconds = FOCUS_SECONDS - timeLeft;
        const res = await fetch("/api/focus/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            actualSeconds: Math.max(actualSeconds, 1),
            interruptions,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setCompletedStats({
            xpEarned: data.xpEarned,
            integrity: data.integrity,
          });
          onSessionComplete?.(data);
        }
      }
    } catch (err) {
      console.error("Failed to complete focus session:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionId, mode, timeLeft, interruptions, isSubmitting, onSessionComplete]);

  // Main countdown timer tick
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleCompleteSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, handleCompleteSession]);

  // Start / Resume focus block
  const handleStart = async () => {
    if (!sessionId && mode === "focus") {
      try {
        const res = await fetch("/api/focus/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moduleId: moduleId || null,
            plannedSeconds: totalSeconds,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setSessionId(data.id);
        }
      } catch (err) {
        console.error("Failed to start focus session:", err);
      }
    }
    setCompletedStats(null);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(mode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS);
    setSessionId(null);
    setInterruptions(0);
    setCompletedStats(null);
  };

  const toggleMode = (newMode: "focus" | "break") => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS);
    setSessionId(null);
    setInterruptions(0);
    setCompletedStats(null);
  };

  // Format time MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // SVG Circular Ring parameters
  const radius = compact ? 38 : 64;
  const strokeWidth = compact ? 6 : 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const currentIntegrity = Math.max(0, 100 - interruptions * 5);

  if (compact) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-white p-3.5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <svg className="h-16 w-16 -rotate-90 transform">
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-slate-100"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r={radius}
                className={`transition-all duration-300 ${
                  mode === "focus" ? "stroke-[#7C3AED]" : "stroke-emerald-500"
                }`}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute font-mono text-xs font-bold text-slate-800">
              {formatTime(timeLeft)}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">
                {mode === "focus" ? "Deep Focus" : "Rest & Recharge"}
              </span>
              {mode === "focus" && (
                <span className="inline-flex items-center rounded-full bg-purple-50 px-1.5 py-0.5 text-[9px] font-bold text-purple-700">
                  25 min
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
              {skillName || "Focused Study"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isRunning ? (
            <button
              onClick={handlePause}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 text-[#7C3AED] hover:bg-purple-200 transition-colors"
            >
              <IconPlayerPause className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-xs transition-colors"
            >
              <IconPlayerPlay className="h-4 w-4 fill-white ml-0.5" />
            </button>
          )}
          <button
            onClick={handleReset}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors"
          >
            <IconRotateClockwise className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm">
      {/* Header Mode Switcher */}
      <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg">
          <button
            onClick={() => toggleMode("focus")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-all ${
              mode === "focus"
                ? "bg-white text-[#7C3AED] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <IconFlame className="h-3.5 w-3.5 text-[#7C3AED]" />
            <span>Focus Block (25m)</span>
          </button>
          <button
            onClick={() => toggleMode("break")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-all ${
              mode === "break"
                ? "bg-white text-emerald-600 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <IconCoffee className="h-3.5 w-3.5 text-emerald-600" />
            <span>Break (5m)</span>
          </button>
        </div>

        {skillName && (
          <span className="text-[11px] font-semibold text-slate-400 truncate max-w-[200px]">
            Target: <strong className="text-slate-700">{skillName}</strong>
          </span>
        )}
      </div>

      {/* Timer Circular Dial */}
      <div className="flex flex-col items-center justify-center my-4">
        <div className="relative flex items-center justify-center">
          <svg className="h-40 w-40 -rotate-90 transform">
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="stroke-slate-100"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx="80"
              cy="80"
              r={radius}
              className={`transition-all duration-300 ${
                mode === "focus" ? "stroke-[#7C3AED]" : "stroke-emerald-500"
              }`}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="font-mono text-3xl font-black text-slate-900 tracking-tight">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mt-1">
              {isRunning ? (mode === "focus" ? "Focused" : "Resting") : "Paused"}
            </span>
          </div>
        </div>

        {/* Live Focus Integrity Bar (during focus mode) */}
        {mode === "focus" && (
          <div className="mt-4 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
              <IconShieldAlert
                className={`h-4 w-4 ${
                  interruptions > 0 ? "text-amber-500" : "text-slate-400"
                }`}
              />
              <span>
                Interruptions:{" "}
                <strong className={interruptions > 0 ? "text-amber-600" : "text-slate-700"}>
                  {interruptions}
                </strong>
              </span>
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
              <span>
                Focus Integrity:{" "}
                <strong
                  className={
                    currentIntegrity >= 90
                      ? "text-emerald-600"
                      : currentIntegrity >= 70
                      ? "text-purple-600"
                      : "text-amber-600"
                  }
                >
                  {currentIntegrity}%
                </strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Completed Banner */}
      {completedStats && (
        <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-xs">
            <IconCheck className="h-4 w-4 stroke-[3]" />
            <span>Focus Block Complete!</span>
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">
            Earned <strong>+{completedStats.xpEarned} XP</strong> • Focus Integrity:{" "}
            <strong>{completedStats.integrity}%</strong>
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-2">
        {isRunning ? (
          <button
            onClick={handlePause}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-purple-100 px-5 text-xs font-bold text-[#7C3AED] hover:bg-purple-200 transition-colors"
          >
            <IconPlayerPause className="h-4 w-4" />
            <span>Pause Timer</span>
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#7C3AED] px-6 text-xs font-bold text-white shadow-sm hover:bg-[#6D28D9] transition-all"
          >
            <IconPlayerPlay className="h-4 w-4 fill-white ml-0.5" />
            <span>{timeLeft === totalSeconds ? "Start Focus Session" : "Resume Session"}</span>
          </button>
        )}

        <button
          onClick={handleReset}
          title="Reset timer"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <IconRotateClockwise className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
