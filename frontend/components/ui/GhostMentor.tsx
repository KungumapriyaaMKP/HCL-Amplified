"use client";

import { useEffect, useState, useRef } from "react";

export type GhostMentorState = "idle" | "thinking" | "speaking" | "socratic" | "celebrate";

export interface GhostMentorProps {
  size?: number;
  state?: GhostMentorState;
  bubble?: string | null;
  className?: string;
}

export function GhostMentor({
  size = 72,
  state = "idle",
  bubble,
  className = "",
}: GhostMentorProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse Cursor Tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const factor = Math.min(distance / 300, 1.0);
      const angle = Math.atan2(deltaY, deltaX);
      const eyeTravel = 4.0 * factor;

      setMousePos({
        x: Math.cos(angle) * eyeTravel,
        y: Math.sin(angle) * eyeTravel,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Blinking loop (every 5-8s)
  useEffect(() => {
    let blinkTimer: NodeJS.Timeout;
    let unblinkTimer: NodeJS.Timeout;

    const scheduleBlink = () => {
      const delay = 5000 + Math.random() * 3000;
      blinkTimer = setTimeout(() => {
        setIsBlinking(true);
        unblinkTimer = setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 140);
      }, delay);
    };

    scheduleBlink();
    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(unblinkTimer);
    };
  }, []);

  const isCelebrate = state === "celebrate";
  const isThinking = state === "thinking";
  const isSocratic = state === "socratic";

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center select-none ${className}`}
    >
      {/* Thought / Speech Bubble */}
      {bubble && (
        <div className="absolute bottom-full mb-3 right-0 z-30 pointer-events-none flex flex-col items-end animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="rounded-2xl border border-border bg-surface px-3.5 py-2 text-xs font-medium text-foreground shadow-xl max-w-[220px] whitespace-normal leading-relaxed text-right backdrop-blur-sm">
            {bubble}
          </div>
          <div className="flex flex-col items-end pr-5 -space-y-0.5 mt-0.5">
            <div className="w-2 h-2 rounded-full border border-border bg-surface shadow-xs" />
            <div className="w-1.5 h-1.5 rounded-full border border-border bg-surface mr-1 mt-0.5" />
          </div>
        </div>
      )}

      {/* Ambient Glow */}
      <div
        className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 pointer-events-none ${
          isCelebrate
            ? "bg-emerald-500/30 scale-125"
            : isThinking || isSocratic
            ? "bg-amber-500/25 scale-110"
            : "bg-accent/15"
        }`}
      />

      {/* Floating Ghost Avatar SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`relative z-10 transition-transform duration-300 ${
          isCelebrate
            ? "animate-bounce"
            : isThinking
            ? "rotate-3 scale-105"
            : "hover:scale-105"
        }`}
      >
        <defs>
          <linearGradient id="ghostBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>

        {/* Ghost Body */}
        <path
          d="M 22 45 C 22 24, 34 16, 50 16 C 66 16, 78 24, 78 45 C 78 68, 76 82, 70 82 C 64 82, 60 76, 50 76 C 40 76, 36 82, 30 82 C 24 82, 22 68, 22 45 Z"
          fill="url(#ghostBodyGrad)"
          stroke="rgba(124, 92, 255, 0.4)"
          strokeWidth="1.5"
        />

        {/* Cheeks */}
        <circle cx="33" cy="52" r="3.2" fill="#fbbf24" opacity="0.4" />
        <circle cx="67" cy="52" r="3.2" fill="#fbbf24" opacity="0.4" />

        {/* Eyes tracking mouse */}
        <g transform={`translate(${mousePos.x}, ${mousePos.y})`}>
          <ellipse
            cx="40"
            cy="44"
            rx="3.4"
            ry={isBlinking ? 0.6 : 4.4}
            fill={isCelebrate ? "#10b981" : "#1e293b"}
            className="transition-all duration-75"
          />
          <ellipse
            cx="60"
            cy="44"
            rx="3.4"
            ry={isBlinking ? 0.6 : 4.4}
            fill={isCelebrate ? "#10b981" : "#1e293b"}
            className="transition-all duration-75"
          />
          {!isBlinking && (
            <>
              <circle cx="41.2" cy="42.3" r="1.1" fill="#ffffff" />
              <circle cx="61.2" cy="42.3" r="1.1" fill="#ffffff" />
            </>
          )}
        </g>

        {/* Smile */}
        <path
          d="M 44 55 Q 50 60 56 55"
          stroke="#1e293b"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
