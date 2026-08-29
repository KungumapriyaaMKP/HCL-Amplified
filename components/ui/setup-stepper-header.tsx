"use client";

import React from "react";
import { Check, Bell, HelpCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SetupStep = "intake" | "beginner_check" | "diagnostic" | "ready";

interface SetupStepperHeaderProps {
  currentStatus: SetupStep;
  className?: string;
}

export function SetupStepperHeader({
  currentStatus,
  className,
}: SetupStepperHeaderProps) {
  // Mapping current status to step index (0-based)
  // 0: Intake, 1: Goals, 2: Calibration, 3: Roadmap
  const getActiveIndex = () => {
    switch (currentStatus) {
      case "intake":
        return 0;
      case "beginner_check":
      case "diagnostic":
        return 2;
      case "ready":
        return 3;
      default:
        return 2;
    }
  };

  const activeIndex = getActiveIndex();

  const steps = [
    { id: "intake", label: "Intake", number: 1 },
    { id: "goals", label: "Goals", number: 2 },
    { id: "calibration", label: "Calibration", number: 3 },
    { id: "roadmap", label: "Roadmap", number: 4 },
  ];

  return (
    <div className={cn("w-full flex items-center justify-between gap-4", className)}>
      {/* 1. Main Stepper Card */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-150 shadow-2xs px-8 py-3.5 flex items-center">
        <div className="w-full flex items-center justify-between max-w-3xl mx-auto">
          {steps.map((step, idx) => {
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const isPending = idx > activeIndex;

            return (
              <React.Fragment key={step.id}>
                {/* Step Item */}
                <div className="flex items-center gap-3">
                  {/* Circle Icon Badge */}
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all",
                      isCompleted &&
                        "border-2 border-purple-500 text-purple-600 bg-purple-50",
                      isCurrent &&
                        "bg-[#4F46E5] text-white shadow-sm ring-4 ring-indigo-50",
                      isPending &&
                        "border border-slate-300 text-slate-400 bg-white"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    ) : (
                      step.number
                    )}
                  </div>

                  {/* Text Label & Status */}
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        "text-xs font-bold leading-none",
                        isCurrent
                          ? "text-slate-900"
                          : isCompleted
                          ? "text-slate-800"
                          : "text-slate-400"
                      )}
                    >
                      {step.label}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-semibold mt-0.5",
                        isCurrent
                          ? "text-[#4F46E5]"
                          : isCompleted
                          ? "text-emerald-500"
                          : "text-slate-400"
                      )}
                    >
                      {isCompleted
                        ? "Completed"
                        : isCurrent
                        ? "In Progress"
                        : "Pending"}
                    </span>
                  </div>
                </div>

                {/* Connecting Line between steps */}
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-[2px] mx-4 transition-all",
                      idx < activeIndex
                        ? "bg-gradient-to-r from-purple-300 to-purple-500"
                        : "bg-slate-200"
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 2. Top Right Actions (Bell, Help, Profile Badge) */}
      <div className="hidden lg:flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
          title="Help & Support"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1.5 pl-1 cursor-pointer">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] text-white font-bold text-xs shadow-sm">
            K
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
        </div>
      </div>
    </div>
  );
}

export default SetupStepperHeader;
