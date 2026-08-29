"use client";

import React from "react";
import { motion } from "framer-motion";

export function Target3DIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
      {/* 1. Large Ambient Background Glow & Radial Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300/25 rounded-full filter blur-3xl pointer-events-none" />

      {/* 2. Floating Ambient Spheres / Orbs */}
      <motion.div
        className="absolute top-2 right-10 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-300 shadow-sm opacity-80"
        animate={{ y: [0, -6, 0], opacity: [0.6, 0.9, 0.6] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-6 left-12 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-purple-300 to-purple-200 shadow-xs opacity-70"
        animate={{ y: [0, 5, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.6 }}
      />

      {/* 3. Main 3D Target & Tiered Pedestal Composition */}
      <motion.div
        className="relative z-10"
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 4.5,
          ease: "easeInOut",
        }}
      >
        <svg
          width="240"
          height="190"
          viewBox="0 0 260 210"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Pedestal Tier Gradients */}
            <linearGradient id="pedestalLowerSide" x1="130" y1="150" x2="130" y2="190" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EDE9FE" />
              <stop offset="1" stopColor="#DDD6FE" />
            </linearGradient>
            <linearGradient id="pedestalLowerTop" x1="20" y1="150" x2="240" y2="150" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F8F7FF" />
              <stop offset="0.5" stopColor="#F1EEFF" />
              <stop offset="1" stopColor="#E6E0FA" />
            </linearGradient>

            <linearGradient id="pedestalUpperSide" x1="130" y1="130" x2="130" y2="160" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F1EEFF" />
              <stop offset="1" stopColor="#E0D7FE" />
            </linearGradient>
            <linearGradient id="pedestalUpperTop" x1="50" y1="130" x2="210" y2="130" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="0.5" stopColor="#F5F3FF" />
              <stop offset="1" stopColor="#EDE9FE" />
            </linearGradient>

            {/* Target 3D Radial Gradients */}
            <radialGradient id="outerPurpleRing" cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="65%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#5B21B6" />
            </radialGradient>

            <radialGradient id="whiteGapRing" cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="80%" stopColor="#F5F3FF" />
              <stop offset="100%" stopColor="#E4DCFD" />
            </radialGradient>

            <radialGradient id="midPurpleRing" cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
              <stop offset="0%" stopColor="#9333EA" />
              <stop offset="70%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#6D28D9" />
            </radialGradient>

            <radialGradient id="centerBullseyeRing" cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="80%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#4C1D95" />
            </radialGradient>

            {/* Arrow & Shadow Filters */}
            <linearGradient id="arrowPoleGrad" x1="130" y1="90" x2="168" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="0.5" stopColor="#E2E8F0" />
              <stop offset="1" stopColor="#CBD5E1" />
            </linearGradient>

            <filter id="softTargetShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#5B21B6" floodOpacity="0.25" />
            </filter>
            <filter id="pedestalBaseShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#7C3AED" floodOpacity="0.18" />
            </filter>
          </defs>

          {/* Tier 1: Lower Wide Pedestal */}
          <g filter="url(#pedestalBaseShadow)">
            <ellipse cx="130" cy="170" rx="90" ry="18" fill="#DDD6FE" opacity="0.6" />
            <path d="M40 152 C40 140 220 140 220 152 L220 170 C220 182 40 182 40 170 Z" fill="url(#pedestalLowerSide)" />
            <ellipse cx="130" cy="152" rx="90" ry="16" fill="url(#pedestalLowerTop)" />
          </g>

          {/* Tier 2: Upper Inner Pedestal */}
          <g>
            <path d="M60 136 C60 126 200 126 200 136 L200 150 C200 160 60 160 60 150 Z" fill="url(#pedestalUpperSide)" />
            <ellipse cx="130" cy="136" rx="70" ry="13" fill="url(#pedestalUpperTop)" />
          </g>

          {/* 3D Isometric Target Board */}
          <g filter="url(#softTargetShadow)" transform="translate(130, 84) rotate(-6) translate(-130, -84)">
            {/* Target 3D Extrusion Depth Backing */}
            <ellipse cx="130" cy="92" rx="58" ry="58" fill="#4C1D95" opacity="0.45" />
            
            {/* Ring 1 (Outer Deep Purple) */}
            <circle cx="130" cy="84" r="56" fill="url(#outerPurpleRing)" />
            
            {/* Ring 2 (White Gap) */}
            <circle cx="130" cy="84" r="45" fill="url(#whiteGapRing)" />
            
            {/* Ring 3 (Mid Purple) */}
            <circle cx="130" cy="84" r="33" fill="url(#midPurpleRing)" />
            
            {/* Ring 4 (White Gap) */}
            <circle cx="130" cy="84" r="21" fill="url(#whiteGapRing)" />
            
            {/* Center Bullseye */}
            <circle cx="130" cy="84" r="10" fill="url(#centerBullseyeRing)" />
            <circle cx="130" cy="84" r="4.5" fill="#FFFFFF" opacity="0.9" />

            {/* 3D Arrow Hitting Bullseye */}
            <g>
              {/* Arrow Shadow on Target Face */}
              <line x1="130" y1="84" x2="160" y2="34" stroke="#3B0764" strokeWidth="4" opacity="0.3" strokeLinecap="round" />
              
              {/* Arrow Shaft */}
              <line x1="130" y1="84" x2="168" y2="28" stroke="url(#arrowPoleGrad)" strokeWidth="5" strokeLinecap="round" />
              <line x1="130" y1="84" x2="168" y2="28" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

              {/* Arrow Purple Fletching / Flag */}
              <path d="M166 30 L180 18 L178 34 L165 39 Z" fill="#7C3AED" />
              <path d="M166 30 L176 22 L174 32 L165 35 Z" fill="#9333EA" />
              <path d="M168 28 L178 20 L177 24 L168 30 Z" fill="#C4B5FD" opacity="0.8" />
            </g>
          </g>
        </svg>
      </motion.div>

      {/* 4. Floating Left 3D Code Cube ("</>") */}
      <motion.div
        className="absolute left-2 bottom-3 z-20 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B5CF6] via-[#7C3AED] to-[#5B21B6] text-white text-xs font-mono font-black shadow-xl shadow-purple-900/35 border border-purple-300/50"
        animate={{
          y: [0, -8, 0],
          rotate: [-8, 2, -8],
          scale: [1, 1.04, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 3.4,
          ease: "easeInOut",
        }}
      >
        <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">&lt;/&gt;</span>
      </motion.div>

      {/* 5. Floating Right 3D Code Cube ("{}") */}
      <motion.div
        className="absolute right-1 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9333EA] via-[#7C3AED] to-[#6D28D9] text-white text-sm font-mono font-black shadow-xl shadow-purple-900/35 border border-purple-300/50"
        animate={{
          y: [0, -9, 0],
          rotate: [10, -3, 10],
          scale: [1, 1.04, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 3.8,
          ease: "easeInOut",
          delay: 0.4,
        }}
      >
        <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">{"{}"}</span>
      </motion.div>
    </div>
  );
}

export default Target3DIllustration;
