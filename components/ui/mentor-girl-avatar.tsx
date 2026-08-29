"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MentorGirlAvatarProps {
  size?: "sm" | "md" | "lg";
  isThinking?: boolean;
  className?: string;
}

export function MentorGirlAvatar({
  size = "md",
  isThinking = false,
  className,
}: MentorGirlAvatarProps) {
  const sizeDimensions = {
    sm: { box: "h-9 w-9", img: 36 },
    md: { box: "h-11 w-11", img: 44 },
    lg: { box: "h-18 w-18", img: 72 },
  };

  const currentSize = sizeDimensions[size];

  return (
    <div
      className={cn(
        "relative flex items-center justify-center select-none shrink-0",
        className
      )}
    >
      {/* 1. Soft Steady Radiant Glow Ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/40 via-fuchsia-500/25 to-indigo-500/40 filter blur-xs pointer-events-none"
        animate={{
          scale: isThinking ? [1, 1.15, 1] : [1, 1.05, 1],
          opacity: isThinking ? [0.6, 0.9, 0.6] : [0.35, 0.55, 0.35],
        }}
        transition={{
          repeat: Infinity,
          duration: isThinking ? 1.4 : 3,
          ease: "easeInOut",
        }}
      />

      {/* 2. Completely Fixed, Still Circular Avatar Frame (Zero Frame Shaking) */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full overflow-hidden border-2 border-purple-400/90 shadow-md bg-[#180E30]",
          currentSize.box
        )}
      >
        {/* Base Layer: Girl's Face, Body & Background - 100% STILL and Rock-Solid */}
        <div className="relative w-full h-full">
          <Image
            src="/mentor-girl.png"
            alt="QuestLearn AI Mentor"
            width={currentSize.img}
            height={currentSize.img}
            className="object-cover w-full h-full scale-105"
            priority
          />

          {/* Animated Hand Layer: Precisely Isolated Hand Region Waving on the Wrist Pivot */}
          <motion.div
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              clipPath: "polygon(6% 32%, 38% 30%, 42% 64%, 26% 72%, 12% 70%, 6% 52%)",
              transformOrigin: "24% 67%",
            }}
            animate={
              isThinking
                ? {
                    rotate: [0, 4, -2, 0],
                  }
                : {
                    // Natural hand waving: rotates back and forth around the wrist without moving head/body
                    rotate: [-4, 14, -6, 12, -4],
                  }
            }
            transition={{
              repeat: Infinity,
              duration: 1.8,
              times: [0, 0.3, 0.55, 0.8, 1],
              ease: "easeInOut",
            }}
          >
            <Image
              src="/mentor-girl.png"
              alt="Waving Hand"
              width={currentSize.img}
              height={currentSize.img}
              className="object-cover w-full h-full scale-105"
              priority
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default MentorGirlAvatar;
