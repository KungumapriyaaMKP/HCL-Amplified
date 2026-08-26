"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

export type GhostMentorState =
  | "idle"
  | "thinking"
  | "speaking"
  | "socratic"
  | "celebrate";

interface GhostMentorProps {
  size?: number;
  state?: GhostMentorState;
  bubble?: string | null;
  className?: string;
}

export function GhostMentor({
  size = 80,
  state = "idle",
  bubble,
  className = "",
}: GhostMentorProps) {
  const shouldReduceMotion = useReducedMotion();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = 300;
      const factor = Math.min(distance / maxDistance, 1.0);

      const angle = Math.atan2(deltaY, deltaX);
      const eyeTravel = 4.5 * factor;

      setMousePos({
        x: Math.cos(angle) * eyeTravel,
        y: Math.sin(angle) * eyeTravel,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [shouldReduceMotion]);

  const isThinking = state === "thinking";
  const isSocratic = state === "socratic";
  const isCelebrate = state === "celebrate";

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center select-none ${className}`}
    >
      {/* Speech Bubble */}
      <AnimatePresence>
        {bubble && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-2.5 right-0 whitespace-nowrap rounded-xl bg-canvas border border-border px-3 py-1.5 text-xs font-medium text-ink shadow-lg pointer-events-none z-30 flex items-center"
          >
            <span>{bubble}</span>
            {/* Downward triangle tail */}
            <div className="absolute top-full right-6 -mt-px border-4 border-transparent border-t-canvas" />
            <div className="absolute top-full right-6 border-4 border-transparent border-t-border -z-10" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient AI Glow */}
      <div
        className={`absolute inset-0 rounded-full blur-lg transition-opacity duration-700 ${
          isCelebrate
            ? "bg-emerald-500/40 animate-pulse"
            : isThinking || isSocratic
            ? "bg-amber-500/30"
            : "bg-amber-500/10"
        }`}
      />

      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={
          shouldReduceMotion
            ? {}
            : isCelebrate
            ? { y: [-6, 2, -6], scale: [1, 1.06, 1] }
            : isThinking
            ? { y: [-2, 2, -2], rotate: [-1, 1, -1] }
            : { y: [-3, 3, -3] }
        }
        transition={{
          repeat: Infinity,
          duration: isCelebrate ? 1.2 : isThinking ? 2 : 4,
          ease: "easeInOut",
        }}
        className="relative z-10 drop-shadow-md"
      >
        <defs>
          <linearGradient id="ghostGrad" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#1e1e24" />
            <stop offset="50%" stopColor="#121216" />
            <stop offset="100%" stopColor="#08080a" />
          </linearGradient>
          <linearGradient id="meshOverlay" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#a8a29e" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
            <stop
              offset="0%"
              stopColor={isCelebrate ? "#10b981" : "#f59e0b"}
              stopOpacity="0.9"
            />
            <stop
              offset="100%"
              stopColor={isCelebrate ? "#059669" : "#d97706"}
              stopOpacity="0"
            />
          </radialGradient>
        </defs>

        {/* Ghost Body */}
        <path
          d="M 22 45 C 22 24, 34 16, 50 16 C 66 16, 78 24, 78 45 C 78 68, 76 82, 70 82 C 64 82, 60 76, 50 76 C 40 76, 36 82, 30 82 C 24 82, 22 68, 22 45 Z"
          fill="url(#ghostGrad)"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1.5"
        />

        {/* Mesh Gradient Tint Overlay */}
        <path
          d="M 22 45 C 22 24, 34 16, 50 16 C 66 16, 78 24, 78 45 C 78 68, 76 82, 70 82 C 64 82, 60 76, 50 76 C 40 76, 36 82, 30 82 C 24 82, 22 68, 22 45 Z"
          fill="url(#meshOverlay)"
        />

        {/* Eyes Socket Base */}
        <ellipse cx="40" cy="42" rx="4.5" ry="5.5" fill="#000" />
        <ellipse cx="60" cy="42" rx="4.5" ry="5.5" fill="#000" />

        {/* Tracking Pupils (Gaze follows cursor) */}
        <g transform={`translate(${mousePos.x}, ${mousePos.y})`}>
          <circle
            cx="40"
            cy="42"
            r="2.2"
            fill={isCelebrate ? "#10b981" : "#f59e0b"}
          />
          <circle cx="40.8" cy="41.2" r="0.8" fill="#ffffff" />
          <circle
            cx="60"
            cy="42"
            r="2.2"
            fill={isCelebrate ? "#10b981" : "#f59e0b"}
          />
          <circle cx="60.8" cy="41.2" r="0.8" fill="#ffffff" />
        </g>
      </motion.svg>
    </div>
  );
}
