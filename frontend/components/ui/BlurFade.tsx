"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface BlurFadeProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  blur?: string;
  yOffset?: number;
}

export function BlurFade({
  children,
  className = "",
  delay = 0,
  duration = 0.4,
  blur = "6px",
  yOffset = 8,
}: BlurFadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset, filter: `blur(${blur})` }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface BlurFadeStaggerProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  baseDelay?: number;
}

export function BlurFadeStagger({
  children,
  className = "",
  staggerDelay = 0.06,
  baseDelay = 0,
}: BlurFadeStaggerProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <BlurFade key={index} delay={baseDelay + index * staggerDelay}>
          {child}
        </BlurFade>
      ))}
    </div>
  );
}
