import React from "react";

/**
 * Exact 3D Vector Illustration matching Image 1:
 * - 3D Purple Clipboard with crisp white sheet & metallic clip
 * - Large 3D Green Circular Badge with White Checkmark (✓)
 * - Soft Pastel Leaves behind clipboard
 * - 3D Stack of Colorful Books on Left (Purple, Blue, Green)
 * - Potted Succulent Plant in Ceramic Purple Pot on Right
 * - Floating Confetti & Star Sparkles
 */
export function ReviewCelebrationIllustration({ className = "w-72 h-56" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 340 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md overflow-visible"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="clipboardBodyGrad" x1="170" y1="30" x2="170" y2="230" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C4B5FD" />
            <stop offset="60%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>

          <linearGradient id="paperGrad" x1="170" y1="50" x2="170" y2="220" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F8FAFC" />
          </linearGradient>

          <linearGradient id="checkCircleGrad" x1="170" y1="85" x2="170" y2="155" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="clipGrad" x1="170" y1="20" x2="170" y2="55" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#5B21B6" />
          </linearGradient>

          <linearGradient id="purplePotGrad" x1="260" y1="180" x2="260" y2="225" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>

          <linearGradient id="leafGrad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          <linearGradient id="leafGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A7F3D0" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>

          {/* Filters */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#7C3AED" floodOpacity="0.18" />
          </filter>

          <filter id="badgeShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#059669" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* 1. SOFT PASTEL BACKGROUND BOTANICAL LEAVES */}
        <g opacity="0.45">
          <path
            d="M 125 150 C 100 130 95 90 120 70 C 135 95 140 130 125 150 Z"
            fill="url(#leafGrad2)"
          />
          <path
            d="M 215 150 C 240 130 245 90 220 70 C 205 95 200 130 215 150 Z"
            fill="url(#leafGrad2)"
          />
        </g>

        {/* 2. FLOATING CONFETTI & SPARKLES */}
        {/* Left confetti */}
        <polygon points="85,60 90,65 85,70 80,65" fill="#FBBF24" />
        <rect x="70" y="95" width="6" height="6" rx="1.5" fill="#C084FC" transform="rotate(25 70 95)" />
        <circle cx="105" cy="45" r="3" fill="#60A5FA" />
        <polygon points="120,35 122,40 120,45 118,40" fill="#34D399" />

        {/* Right confetti */}
        <polygon points="255,55 260,60 255,65 250,60" fill="#A855F7" />
        <rect x="270" y="85" width="7" height="4" rx="1" fill="#F59E0B" transform="rotate(-30 270 85)" />
        <circle cx="240" cy="40" r="3.5" fill="#34D399" />
        <polygon points="275,120 278,124 275,128 272,124" fill="#38BDF8" />

        {/* 3. MAIN 3D CLIPBOARD */}
        <g filter="url(#softShadow)">
          {/* Clipboard Outer Shell */}
          <rect
            x="105"
            y="35"
            width="130"
            height="185"
            rx="18"
            fill="url(#clipboardBodyGrad)"
            stroke="#DDD6FE"
            strokeWidth="2"
          />

          {/* Paper Sheet */}
          <rect
            x="114"
            y="48"
            width="112"
            height="162"
            rx="12"
            fill="url(#paperGrad)"
            stroke="#F1F5F9"
            strokeWidth="1.5"
          />

          {/* Paper subtle lines on bottom */}
          <rect x="130" y="175" width="45" height="4" rx="2" fill="#E2E8F0" />
          <rect x="130" y="185" width="65" height="4" rx="2" fill="#E2E8F0" />
          <circle cx="122" cy="177" r="2.5" fill="#CBD5E1" />
          <circle cx="122" cy="187" r="2.5" fill="#CBD5E1" />

          {/* Metallic Clip at Top */}
          <path
            d="M 148 40 C 148 28, 192 28, 192 40 L 192 48 L 148 48 Z"
            fill="url(#clipGrad)"
            stroke="#DDD6FE"
            strokeWidth="1.5"
          />
          <circle cx="170" cy="34" r="5" fill="#FAF5FF" stroke="#7C3AED" strokeWidth="1.5" />
        </g>

        {/* 4. LARGE 3D GREEN CIRCULAR BADGE WITH WHITE CHECKMARK */}
        <g filter="url(#badgeShadow)">
          {/* Outer circle */}
          <circle cx="170" cy="120" r="32" fill="url(#checkCircleGrad)" />
          {/* Inner ring highlight */}
          <circle cx="170" cy="120" r="29" fill="none" stroke="#6EE7B7" strokeWidth="1.5" opacity="0.6" />
          {/* Checkmark */}
          <path
            d="M 156 120 L 166 130 L 186 110"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* 5. 3D STACK OF COLORFUL BOOKS ON LEFT */}
        <g transform="translate(10, 15)">
          {/* Bottom Book (Green) */}
          <g>
            <rect x="65" y="185" width="55" height="10" rx="3" fill="#10B981" />
            <rect x="68" y="187" width="50" height="6" rx="2" fill="#34D399" />
            <rect x="114" y="187" width="4" height="6" fill="#F8FAFC" />
          </g>

          {/* Middle Book (Blue/Cyan) */}
          <g>
            <rect x="63" y="174" width="55" height="10" rx="3" fill="#0284C7" />
            <rect x="66" y="176" width="50" height="6" rx="2" fill="#38BDF8" />
            <rect x="112" y="176" width="4" height="6" fill="#F8FAFC" />
          </g>

          {/* Top Book (Purple) */}
          <g>
            <rect x="66" y="163" width="50" height="10" rx="3" fill="#6D28D9" />
            <rect x="69" y="165" width="45" height="6" rx="2" fill="#8B5CF6" />
            <rect x="110" y="165" width="4" height="6" fill="#F8FAFC" />
          </g>
        </g>

        {/* 6. POTTED SUCCULENT PLANT IN CERAMIC PURPLE POT ON RIGHT */}
        <g transform="translate(10, 10)">
          {/* Succulent Leaves */}
          <path
            d="M 260 172 C 255 160 265 145 272 152 C 278 160 268 172 260 172 Z"
            fill="#10B981"
          />
          <path
            d="M 248 174 C 242 165 248 152 256 156 C 262 162 255 174 248 174 Z"
            fill="#34D399"
          />
          <path
            d="M 270 174 C 278 165 274 152 266 156 C 260 162 264 174 270 174 Z"
            fill="#059669"
          />
          <circle cx="260" cy="168" r="6" fill="#6EE7B7" />

          {/* Pot Rim */}
          <rect x="246" y="176" width="28" height="6" rx="2.5" fill="#8B5CF6" stroke="#DDD6FE" strokeWidth="1" />

          {/* Pot Body */}
          <path
            d="M 248 182 L 251 202 C 251 204 269 204 269 202 L 272 182 Z"
            fill="url(#purplePotGrad)"
          />
        </g>
      </svg>
    </div>
  );
}

/**
 * Hanging Desk Lamp SVG (Top-Right Background Element)
 */
export function StudioHangingLamp({ className = "w-20 h-28" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Hanging Cord */}
      <line x1="40" y1="0" x2="40" y2="60" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="3 3" />
      {/* Lamp Cap */}
      <rect x="36" y="58" width="8" height="5" rx="1.5" fill="#94A3B8" />
      {/* Lamp Dome Shade */}
      <path d="M 22 80 C 22 66, 58 66, 58 80 Z" fill="#EDE9FE" stroke="#C4B5FD" strokeWidth="1.5" />
      {/* Inner Light Rim */}
      <ellipse cx="40" cy="80" rx="18" ry="4" fill="#DDD6FE" />
      {/* Warm Ambient Glow Cone */}
      <path d="M 22 80 L 10 120 L 70 120 L 58 80 Z" fill="url(#lampLightGlow)" opacity="0.35" />
      <defs>
        <linearGradient id="lampLightGlow" x1="40" y1="80" x2="40" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#DDD6FE" />
          <stop offset="100%" stopColor="#EDE9FE" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Dot Matrix Grid Decoration
 */
export function DotMatrixGrid({ rows = 5, cols = 5, className = "" }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={`grid gap-2 select-none pointer-events-none opacity-40 ${className}`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {Array.from({ length: rows * cols }).map((_, i) => (
        <div key={i} className="w-1 h-1 rounded-full bg-purple-300" />
      ))}
    </div>
  );
}

/**
 * Corner Bookshelf Decor (Books + Succulent)
 */
export function CornerStudyDecor({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Stacked books */}
      <rect x="15" y="70" width="55" height="10" rx="2" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
      <rect x="18" y="60" width="50" height="9" rx="2" fill="#EDE9FE" stroke="#DDD6FE" strokeWidth="1" />
      <rect x="22" y="52" width="42" height="7" rx="2" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />
      {/* Little plant on right */}
      <circle cx="78" cy="62" r="5" fill="#A7F3D0" />
      <rect x="74" y="67" width="8" height="8" rx="1.5" fill="#E2E8F0" />
    </svg>
  );
}
