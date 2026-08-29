"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DynamicBotAvatarProps {
  size?: "sm" | "md" | "lg";
  isThinking?: boolean;
  showGreeting?: boolean;
  className?: string;
}

export function DynamicBotAvatar({
  size = "md",
  isThinking = false,
  showGreeting = true,
  className,
}: DynamicBotAvatarProps) {
  const [greetVisible, setGreetVisible] = useState(showGreeting);
  const [isWaving, setIsWaving] = useState(false);

  useEffect(() => {
    // Show greeting bubble on mount for 4 seconds, then periodically wave
    const timer = setTimeout(() => {
      setGreetVisible(false);
    }, 4500);

    const waveInterval = setInterval(() => {
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 1500);
    }, 12000);

    return () => {
      clearTimeout(timer);
      clearInterval(waveInterval);
    };
  }, []);

  const sizeStyles = {
    sm: "h-7 w-7 rounded-md text-xs",
    md: "h-8 w-8 rounded-md text-sm",
    lg: "h-11 w-11 rounded-lg text-base",
  };

  return (
    <div
      className={cn("relative flex items-center justify-center select-none group cursor-pointer", className)}
      onMouseEnter={() => setGreetVisible(true)}
      onMouseLeave={() => setGreetVisible(false)}
      onClick={() => {
        setIsWaving(true);
        setGreetVisible(true);
        setTimeout(() => setIsWaving(false), 1500);
      }}
    >
      {/* Floating Greeting Pill ("Hi! 👋") */}
      <AnimatePresence>
        {greetVisible && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.8 }}
            animate={{ opacity: 1, y: -22, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute -top-1 left-1/2 -translate-x-1/2 z-30 pointer-events-none whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-extrabold shadow-md border border-purple-400/40 flex items-center gap-1"
          >
            <span>Hi!</span>
            <motion.span
              animate={{ rotate: [0, 20, -15, 20, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              👋
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Outer Pulse Glow Ring */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/30 to-indigo-500/30 filter blur-xs"
        animate={{
          scale: isThinking ? [1, 1.25, 1] : [1, 1.1, 1],
          opacity: isThinking ? [0.6, 1, 0.6] : [0.3, 0.6, 0.3],
        }}
        transition={{
          repeat: Infinity,
          duration: isThinking ? 1.2 : 2.5,
          ease: "easeInOut",
        }}
      />

      {/* Main Bot Container */}
      <motion.div
        className={cn(
          "relative flex shrink-0 items-center justify-center bg-gradient-to-br from-[#EDE9FE] via-[#F3E8FF] to-[#DDD6FE] text-[#7C3AED] shadow-2xs border border-purple-200/80 overflow-hidden",
          sizeStyles[size]
        )}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Animated Custom Sparkle / Bot Mascot */}
        <motion.svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            "transition-transform",
            size === "sm" ? "w-4 h-4" : size === "md" ? "w-4.5 h-4.5" : "w-6 h-6"
          )}
          animate={
            isWaving
              ? { rotate: [0, 15, -15, 15, 0], scale: [1, 1.15, 1] }
              : isThinking
              ? { rotate: [0, 180, 360], scale: [1, 0.9, 1] }
              : { scale: [1, 1.05, 1] }
          }
          transition={{
            repeat: isThinking ? Infinity : isWaving ? 1 : Infinity,
            duration: isThinking ? 2 : isWaving ? 1 : 3,
            ease: "easeInOut",
          }}
        >
          {/* Main Glow Star Path */}
          <path
            d="M12 2L14.4 8.6C14.8 9.7 15.7 10.6 16.8 11L23.4 13.4C24.2 13.7 24.2 14.3 23.4 14.6L16.8 17C15.7 17.4 14.8 18.3 14.4 19.4L12 26"
            stroke="url(#bot-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 3C12 7.41828 15.5817 11 20 11C15.5817 11 12 14.5817 12 19C12 14.5817 8.41828 11 4 11C8.41828 11 12 7.41828 12 3Z"
            fill="url(#bot-grad)"
          />
          {/* Secondary Orbiting Little Star */}
          <circle cx="19" cy="5" r="2" fill="#9333EA" />
          <circle cx="5" cy="18" r="1.5" fill="#7C3AED" opacity="0.8" />

          <defs>
            <linearGradient id="bot-grad" x1="4" y1="3" x2="20" y2="19" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6D28D9" />
              <stop offset="0.5" stopColor="#7C3AED" />
              <stop offset="1" stopColor="#A855F7" />
            </linearGradient>
          </defs>
        </motion.svg>
      </motion.div>
    </div>
  );
}

export default DynamicBotAvatar;
