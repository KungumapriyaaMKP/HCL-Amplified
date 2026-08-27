"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useReducedMotion, AnimatePresence, useAnimationControls } from "framer-motion";

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
  const controls = useAnimationControls();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [burstId, setBurstId] = useState<number | null>(null);
  const [idleEyeOffset, setIdleEyeOffset] = useState({ x: 0, y: 0 });
  const isReactingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse Cursor Tracking
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

  // Natural Blinking Loop (every 6-9s, ~130ms duration)
  useEffect(() => {
    let blinkTimer: NodeJS.Timeout;
    let unblinkTimer: NodeJS.Timeout;

    const scheduleBlink = () => {
      const delay = 6000 + Math.random() * 3000;
      blinkTimer = setTimeout(() => {
        setIsBlinking(true);
        unblinkTimer = setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 130);
      }, delay);
    };

    scheduleBlink();

    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(unblinkTimer);
    };
  }, []);

  // Micro-Idle Actions Loop (every 10-15s)
  useEffect(() => {
    if (shouldReduceMotion) return;

    let idleTimer: NodeJS.Timeout;

    const scheduleIdleAction = () => {
      const delay = 10000 + Math.random() * 5000;
      idleTimer = setTimeout(async () => {
        if (!isReactingRef.current && state === "idle") {
          const actions = ["lookLeft", "lookRight", "hop", "squish"] as const;
          const action = actions[Math.floor(Math.random() * actions.length)];

          if (action === "lookLeft") {
            setIdleEyeOffset({ x: -3, y: 0 });
            await controls.start({ rotate: -3, transition: { duration: 0.3 } });
            await controls.start({ rotate: 0, transition: { duration: 0.4 } });
            setIdleEyeOffset({ x: 0, y: 0 });
          } else if (action === "lookRight") {
            setIdleEyeOffset({ x: 3, y: 0 });
            await controls.start({ rotate: 3, transition: { duration: 0.3 } });
            await controls.start({ rotate: 0, transition: { duration: 0.4 } });
            setIdleEyeOffset({ x: 0, y: 0 });
          } else if (action === "hop") {
            await controls.start({ y: [0, -6, 0], transition: { duration: 0.5, ease: "easeOut" } });
          } else if (action === "squish") {
            await controls.start({ scaleX: [1, 1.08, 1], scaleY: [1, 0.92, 1], transition: { duration: 0.4 } });
          }
        }
        scheduleIdleAction();
      }, delay);
    };

    scheduleIdleAction();

    return () => {
      clearTimeout(idleTimer);
    };
  }, [shouldReduceMotion, state, controls]);

  // Playful Reaction Animations on state change
  useEffect(() => {
    if (shouldReduceMotion) return;

    let burstTimer: NodeJS.Timeout | undefined;

    if (state === "celebrate") {
      isReactingRef.current = true;
      burstTimer = setTimeout(() => {
        setBurstId(Date.now());
      }, 0);
      controls.start({
        y: [0, -14, 0, -7, 0],
        rotate: [0, 8, -8, 0],
        transition: { duration: 0.8, ease: "easeInOut" },
      }).then(() => {
        isReactingRef.current = false;
      });
    } else if (state === "thinking") {
      isReactingRef.current = true;
      controls.start({
        rotate: [0, -8, 8, -6, 6, 0],
        transition: { duration: 0.5, ease: "easeInOut" },
      }).then(() => {
        isReactingRef.current = false;
      });
    } else if (state === "socratic") {
      isReactingRef.current = true;
      controls.start({
        y: [-2, 2, -2],
        rotate: [-1, 1, -1],
        transition: { repeat: Infinity, duration: 2, ease: "easeInOut" },
      });
    } else if (state === "idle") {
      isReactingRef.current = false;
      controls.start({
        y: [0, 3, 0],
        scaleY: [1, 0.96, 1],
        transition: { duration: 0.9, ease: "easeInOut" },
      }).then(() => {
        controls.start({
          y: [-3, 3, -3],
          rotate: 0,
          scaleX: 1,
          scaleY: 1,
          transition: { repeat: Infinity, duration: 4, ease: "easeInOut" },
        });
      });
    }

    return () => {
      if (burstTimer) clearTimeout(burstTimer);
    };
  }, [state, shouldReduceMotion, controls]);

  const isThinking = state === "thinking";
  const isSocratic = state === "socratic";
  const isCelebrate = state === "celebrate";

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center select-none ${className}`}
    >
      {/* Thought Cloud with Trailing Dots */}
      <AnimatePresence>
        {bubble && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-3 right-0 z-30 pointer-events-none flex flex-col items-end"
          >
            {/* Thought Cloud Box */}
            <div className="rounded-2xl bg-canvas border border-border px-3.5 py-2 text-xs font-medium text-ink shadow-lg max-w-[220px] whitespace-normal leading-relaxed text-right">
              {bubble}
            </div>
            {/* Trailing thought dots */}
            <div className="flex flex-col items-end pr-5 -space-y-0.5 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-canvas border border-border shadow-xs" />
              <div className="w-1.5 h-1.5 rounded-full bg-canvas border border-border mr-1 mt-0.5 shadow-2xs" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparkle Confetti Burst on Celebrate */}
      <AnimatePresence>
        {burstId && !shouldReduceMotion && (
          <div key={burstId} className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const dist = 28 + (i % 3) * 5;
              const targetX = Math.cos(rad) * dist;
              const targetY = Math.sin(rad) * dist;
              const isStar = i % 2 === 1;
              const color = i % 2 === 0 ? "#10b981" : "#fbbf24";

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, scale: 0.3, x: 0, y: 0 }}
                  animate={{ opacity: [1, 1, 0], scale: [0.3, 1.2, 0.4], x: targetX, y: targetY }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="absolute"
                >
                  {isStar ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill={color}>
                      <path d="M 5 0 Q 5 5 10 5 Q 5 5 5 10 Q 5 5 0 5 Q 5 5 5 0 Z" />
                    </svg>
                  ) : (
                    <div
                      style={{ backgroundColor: color }}
                      className="w-2 h-2 rounded-full shadow-xs"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
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
        animate={controls}
        initial={
          shouldReduceMotion
            ? {}
            : { y: [-3, 3, -3] }
        }
        transition={
          shouldReduceMotion
            ? {}
            : { repeat: Infinity, duration: 4, ease: "easeInOut" }
        }
        className="relative z-10 drop-shadow-md"
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#fff3e0" />
          </linearGradient>
        </defs>

        {/* Body — soft cream, warm amber outline */}
        <path
          d="M 22 45 C 22 24, 34 16, 50 16 C 66 16, 78 24, 78 45 C 78 68, 76 82, 70 82 C 64 82, 60 76, 50 76 C 40 76, 36 82, 30 82 C 24 82, 22 68, 22 45 Z"
          fill="url(#bodyGrad)"
          stroke="rgba(217,119,6,0.30)"
          strokeWidth="1.5"
        />

        {/* Cheeks — soft amber blush */}
        <circle cx="33" cy="52" r="3.2" fill="#fbbf24" opacity="0.35" />
        <circle cx="67" cy="52" r="3.2" fill="#fbbf24" opacity="0.35" />

        {/* Eyes — gaze tracks cursor and idle glance offset, with natural blinking */}
        <g transform={`translate(${mousePos.x + idleEyeOffset.x}, ${mousePos.y + idleEyeOffset.y})`}>
          <ellipse
            cx="40"
            cy="44"
            rx="3.4"
            ry={isBlinking ? 0.6 : 4.4}
            fill={isCelebrate ? "#10b981" : "#3f3f46"}
            className="transition-all duration-75"
          />
          <ellipse
            cx="60"
            cy="44"
            rx="3.4"
            ry={isBlinking ? 0.6 : 4.4}
            fill={isCelebrate ? "#10b981" : "#3f3f46"}
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
          stroke="#3f3f46"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
      </motion.svg>
    </div>
  );
}
