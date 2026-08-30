"use client";

import React from "react";

export function WebDev3DHeaderIllustration({ className = "w-[300px] h-[170px]" }: { className?: string }) {
  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 320 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible drop-shadow-[0_12px_24px_rgba(124,58,237,0.12)]"
      >
        <defs>
          {/* Ambient Glows & Gradients */}
          <linearGradient id="browserBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F1F5F9" />
          </linearGradient>

          <linearGradient id="terminalBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E1E2E" />
            <stop offset="100%" stopColor="#11111B" />
          </linearGradient>

          <linearGradient id="purpleBubbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>

          <linearGradient id="blueBubbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>

          <linearGradient id="tagCardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F8FAFC" />
          </linearGradient>

          {/* Filters for 3D Clay Soft Shadows */}
          <filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0F172A" floodOpacity="0.08" />
          </filter>

          <filter id="popShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#6D28D9" floodOpacity="0.2" />
          </filter>

          <filter id="bluePopShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#4F46E5" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* ================= 1. BACKGROUND BROWSER WINDOW ================= */}
        <g filter="url(#softShadow)">
          <rect
            x="70"
            y="20"
            width="200"
            height="125"
            rx="16"
            fill="url(#browserBg)"
            stroke="#E2E8F0"
            strokeWidth="1.5"
          />

          {/* Browser Header Bar */}
          <line x1="70" y1="44" x2="270" y2="44" stroke="#F1F5F9" strokeWidth="1.5" />
          
          {/* Browser Dots */}
          <circle cx="88" cy="32" r="3" fill="#CBD5E1" />
          <circle cx="98" cy="32" r="3" fill="#E2E8F0" />
          <circle cx="108" cy="32" r="3" fill="#E2E8F0" />

          {/* Subtle Wireframe Lines in Browser */}
          <rect x="180" y="58" width="65" height="6" rx="3" fill="#E2E8F0" />
          <rect x="180" y="70" width="45" height="5" rx="2.5" fill="#F1F5F9" />

          {/* Code Symbol Card on Right */}
          <g filter="url(#softShadow)">
            <rect
              x="185"
              y="85"
              width="60"
              height="48"
              rx="12"
              fill="url(#tagCardGrad)"
              stroke="#EDE9FE"
              strokeWidth="1.5"
            />
            {/* Purple </> icon */}
            <path
              d="M205 104 L199 109 L205 114"
              stroke="#7C3AED"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M213 103 L217 115"
              stroke="#8B5CF6"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M225 104 L231 109 L225 114"
              stroke="#7C3AED"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>

        {/* ================= 2. FOREGROUND FLOATING CODE EDITOR TERMINAL ================= */}
        <g filter="url(#softShadow)">
          <rect
            x="64"
            y="48"
            width="125"
            height="105"
            rx="16"
            fill="url(#terminalBg)"
            stroke="#334155"
            strokeWidth="1"
          />

          {/* Terminal Title Bar Controls */}
          <circle cx="78" cy="62" r="3.2" fill="#F43F5E" />
          <circle cx="88" cy="62" r="3.2" fill="#FBBF24" />
          <circle cx="98" cy="62" r="3.2" fill="#10B981" />

          {/* Vibrant Syntax Highlighter Lines */}
          {/* Line 1: import ... */}
          <rect x="78" y="76" width="18" height="4.5" rx="2" fill="#818CF8" />
          <rect x="100" y="76" width="38" height="4.5" rx="2" fill="#38BDF8" />

          {/* Line 2: function dev() { */}
          <rect x="78" y="87" width="28" height="4.5" rx="2" fill="#C084FC" />
          <rect x="110" y="87" width="48" height="4.5" rx="2" fill="#4ADE80" />

          {/* Line 3: indent return data */}
          <rect x="88" y="98" width="16" height="4" rx="2" fill="#F472B6" />
          <rect x="108" y="98" width="30" height="4" rx="2" fill="#FCD34D" />

          {/* Line 4: indent await fetch() */}
          <rect x="88" y="108" width="24" height="4" rx="2" fill="#38BDF8" />
          <rect x="116" y="108" width="42" height="4" rx="2" fill="#818CF8" />

          {/* Line 5: closing } */}
          <rect x="78" y="119" width="32" height="4.5" rx="2" fill="#A78BFA" />

          {/* Line 6: export default */}
          <rect x="78" y="130" width="22" height="4" rx="2" fill="#34D399" />
          <rect x="104" y="130" width="26" height="4" rx="2" fill="#F472B6" />
        </g>

        {/* ================= 3. TOP-RIGHT 3D PURPLE CHAT BUBBLE ================= */}
        <g filter="url(#popShadow)">
          {/* Bubble body */}
          <rect
            x="215"
            y="12"
            width="54"
            height="40"
            rx="14"
            fill="url(#purpleBubbleGrad)"
          />
          {/* Speech tail */}
          <path
            d="M228 50 C226 56, 220 58, 220 58 C224 58, 235 56, 238 51 Z"
            fill="#7C3AED"
          />

          {/* 3 Glossy White Dots */}
          <circle cx="230" cy="32" r="3.2" fill="#FFFFFF" />
          <circle cx="242" cy="32" r="3.2" fill="#FFFFFF" />
          <circle cx="254" cy="32" r="3.2" fill="#FFFFFF" />

          {/* Gloss highlight */}
          <path
            d="M222 20 C226 16, 246 16, 252 18"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeOpacity="0.45"
          />
        </g>

        {/* ================= 4. BOTTOM-LEFT 3D PERIWINKLE HEART BUBBLE ================= */}
        <g filter="url(#bluePopShadow)">
          {/* Bubble body */}
          <rect
            x="28"
            y="98"
            width="56"
            height="44"
            rx="14"
            fill="url(#blueBubbleGrad)"
          />
          {/* Speech tail */}
          <path
            d="M40 140 C38 147, 32 150, 32 150 C37 150, 48 147, 51 141 Z"
            fill="#6366F1"
          />

          {/* 3D Glossy White Heart */}
          <path
            d="M56 112 C52 108, 45 111, 45 117 C45 124, 56 129, 56 129 C56 129, 67 124, 67 117 C67 111, 60 108, 56 112 Z"
            fill="#FFFFFF"
            filter="drop-shadow(0 2px 4px rgba(79, 70, 229, 0.25))"
          />

          {/* Gloss highlight */}
          <path
            d="M36 106 C42 102, 60 102, 66 104"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeOpacity="0.45"
          />
        </g>

        {/* Ambient Decorative Tiny Plus & Dots */}
        <circle cx="48" cy="38" r="1.5" fill="#C084FC" />
        <circle cx="288" cy="78" r="1.5" fill="#818CF8" />
        <path d="M294 30 H298 M296 28 V32" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M38 70 H42 M40 68 V72" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
