import React from "react";

/**
 * QuestLearn Q Ribbon Brand Logo
 */
export function QuestLearnBrandIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="ql-brand-grad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="60%" stopColor="#4C1D95" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>
      </defs>
      <path
        d="M20 4C11.163 4 4 11.163 4 20C4 28.837 11.163 36 20 36C23.6 36 26.9 34.8 29.5 32.8L34 36V26H24L27.6 29.6C25.4 31.1 22.8 32 20 32C13.373 32 8 26.627 8 20C8 13.373 13.373 8 20 8C25.2 8 29.5 11.3 31.2 16H35.5C33.6 9 27.4 4 20 4Z"
        fill="url(#ql-brand-grad)"
      />
      <circle cx="20" cy="20" r="4.5" fill="#6D28D9" />
    </svg>
  );
}

/**
 * Exact 3D Golden Star Hexagon Badge (First Steps)
 */
export function StarHexagonBadge({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        <defs>
          <linearGradient id="hex-gold-outer" x1="32" y1="2" x2="32" y2="62" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="40%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="hex-gold-inner" x1="32" y1="6" x2="32" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF9C3" />
            <stop offset="60%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Outer Hexagon Bevel */}
        <path
          d="M32 4 C34 4, 54 15, 55 17 C56 19, 56 45, 55 47 C54 49, 34 60, 32 60 C30 60, 10 49, 9 47 C8 45, 8 19, 9 17 C10 15, 30 4, 32 4 Z"
          fill="url(#hex-gold-outer)"
        />

        {/* Inner Hexagon Face */}
        <path
          d="M32 8 C33.5 8, 50 17.5, 51 19 C52 20.5, 52 43.5, 51 45 C50 46.5, 33.5 56, 32 56 C30.5 56, 14 46.5, 13 45 C12 43.5, 12 20.5, 13 19 C14 17.5, 30.5 8, 32 8 Z"
          fill="url(#hex-gold-inner)"
        />

        {/* Subtle Top Gloss Arc */}
        <path
          d="M16 20 C 22 14, 42 14, 48 20 C 44 26, 20 26, 16 20 Z"
          fill="white"
          fillOpacity="0.35"
        />

        {/* Center Brown/Bronze Star */}
        <path
          d="M32 20 L35.2 26.8 L42.5 27.8 L37.2 33 L38.5 40.5 L32 36.8 L25.5 40.5 L26.8 33 L21.5 27.8 L28.8 26.8 Z"
          fill="#78350F"
        />
      </svg>
    </div>
  );
}

/**
 * Exact 3D Purple Flame Hexagon Badge (Streak Starter)
 */
export function FlameHexagonBadge({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        <defs>
          <linearGradient id="hex-purple-outer" x1="32" y1="2" x2="32" y2="62" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#DDD6FE" />
            <stop offset="40%" stopColor="#C4B5FD" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
          <linearGradient id="hex-purple-inner" x1="32" y1="6" x2="32" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F5F3FF" />
            <stop offset="50%" stopColor="#EDE9FE" />
            <stop offset="100%" stopColor="#DDD6FE" />
          </linearGradient>
        </defs>

        {/* Outer Hexagon Bevel */}
        <path
          d="M32 4 C34 4, 54 15, 55 17 C56 19, 56 45, 55 47 C54 49, 34 60, 32 60 C30 60, 10 49, 9 47 C8 45, 8 19, 9 17 C10 15, 30 4, 32 4 Z"
          fill="url(#hex-purple-outer)"
        />

        {/* Inner Hexagon Face */}
        <path
          d="M32 8 C33.5 8, 50 17.5, 51 19 C52 20.5, 52 43.5, 51 45 C50 46.5, 33.5 56, 32 56 C30.5 56, 14 46.5, 13 45 C12 43.5, 12 20.5, 13 19 C14 17.5, 30.5 8, 32 8 Z"
          fill="url(#hex-purple-inner)"
        />

        {/* Subtle Top Gloss Arc */}
        <path
          d="M16 20 C 22 14, 42 14, 48 20 C 44 26, 20 26, 16 20 Z"
          fill="white"
          fillOpacity="0.45"
        />

        {/* Center Dark Purple Flame */}
        <path
          d="M32 18 C32 18, 41 26, 41 33.5 C41 38.5, 37 42.5, 32 42.5 C27 42.5, 23 38.5, 23 33.5 C23 27, 29.5 23, 29.5 23 C29.5 23, 28.5 28.5, 32 30.5 C34.2 31.5, 35.5 28.5, 35.5 28.5 C35.5 28.5, 37.5 31.5, 36.5 34.5 C35.8 36.5, 33.8 37.5, 32 37.5 C30.2 37.5, 28.5 36.5, 28.5 34.5 C28.5 31.5, 32 28, 32 18 Z"
          fill="#3B0764"
        />
      </svg>
    </div>
  );
}

/**
 * Exact 3D Sky Blue Compass Needle Hexagon Badge (Explorer)
 */
export function CompassHexagonBadge({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        <defs>
          <linearGradient id="hex-blue-outer" x1="32" y1="2" x2="32" y2="62" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#BAE6FD" />
            <stop offset="40%" stopColor="#7DD3FC" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <linearGradient id="hex-blue-inner" x1="32" y1="6" x2="32" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F0F9FF" />
            <stop offset="50%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>
        </defs>

        {/* Outer Hexagon Bevel */}
        <path
          d="M32 4 C34 4, 54 15, 55 17 C56 19, 56 45, 55 47 C54 49, 34 60, 32 60 C30 60, 10 49, 9 47 C8 45, 8 19, 9 17 C10 15, 30 4, 32 4 Z"
          fill="url(#hex-blue-outer)"
        />

        {/* Inner Hexagon Face */}
        <path
          d="M32 8 C33.5 8, 50 17.5, 51 19 C52 20.5, 52 43.5, 51 45 C50 46.5, 33.5 56, 32 56 C30.5 56, 14 46.5, 13 45 C12 43.5, 12 20.5, 13 19 C14 17.5, 30.5 8, 32 8 Z"
          fill="url(#hex-blue-inner)"
        />

        {/* Subtle Top Gloss Arc */}
        <path
          d="M16 20 C 22 14, 42 14, 48 20 C 44 26, 20 26, 16 20 Z"
          fill="white"
          fillOpacity="0.45"
        />

        {/* 4 Background Sparkle Stars */}
        <g fill="#38BDF8">
          <path d="M32 17 L33 20 L36 21 L33 22 L32 25 L31 22 L28 21 L31 20 Z" />
          <path d="M43 32 L44 34 L46 35 L44 36 L43 38 L42 36 L40 35 L42 34 Z" opacity="0.8" />
          <path d="M21 32 L22 34 L24 35 L22 36 L21 38 L20 36 L18 35 L20 34 Z" opacity="0.8" />
          <path d="M32 44 L33 46 L35 47 L33 48 L32 50 L31 48 L29 47 L31 46 Z" opacity="0.8" />
        </g>

        {/* 3D Diagonal Compass Needle */}
        <g transform="translate(32, 32) rotate(45)">
          {/* North Point (Dark Blue) */}
          <polygon points="0,-15 4,0 0,-1 -4,0" fill="#1E1B4B" />
          {/* North Light Facet */}
          <polygon points="0,-15 0,-1 -4,0" fill="#312E81" />
          {/* South Point (Silver / Light) */}
          <polygon points="0,15 4,0 0,1 -4,0" fill="#CBD5E1" />
          {/* South Light Facet */}
          <polygon points="0,15 0,1 -4,0" fill="#FFFFFF" />
          {/* Center Pin */}
          <circle cx="0" cy="0" r="2" fill="#1E1B4B" stroke="#FFFFFF" strokeWidth="0.8" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Astronaut Stargazer Cute Card Illustration
 */
export function StargazerIllustration({ className = "w-full h-24" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      <svg viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="sky-grad" x1="0" y1="0" x2="200" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF7ED" />
            <stop offset="60%" stopColor="#FEE2E2" />
            <stop offset="100%" stopColor="#EDE9FE" />
          </linearGradient>
          <linearGradient id="hill-grad" x1="0" y1="60" x2="200" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#311042" />
            <stop offset="100%" stopColor="#1E0A2A" />
          </linearGradient>
        </defs>

        <rect width="200" height="100" fill="url(#sky-grad)" />

        <g fill="#F59E0B">
          <path d="M165 15 L166.5 10 L168 15 L173 16.5 L168 18 L166.5 23 L165 18 L160 16.5 Z" />
          <path d="M40 25 L41 22 L42 25 L45 26 L42 27 L41 30 L40 27 L37 26 Z" opacity="0.6" />
          <circle cx="25" cy="45" r="1.5" opacity="0.5" />
          <circle cx="90" cy="20" r="1.2" opacity="0.5" />
          <circle cx="140" cy="35" r="1.5" opacity="0.5" />
        </g>

        <path d="M0 65 Q 60 45, 120 70 T 200 65 L 200 100 L 0 100 Z" fill="url(#hill-grad)" />
        <path d="M40 75 Q 120 55, 200 80 L 200 100 L 40 100 Z" fill="#180524" />

        <g transform="translate(142, 44) scale(0.65)">
          <line x1="12" y1="24" x2="4" y2="40" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="12" y1="24" x2="20" y2="40" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="2" y1="14" x2="24" y2="28" stroke="#A78BFA" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="2" cy="14" r="3" fill="#DDD6FE" />
          <ellipse cx="32" cy="32" rx="7" ry="9" fill="#F8FAFC" stroke="#64748B" strokeWidth="1" />
          <rect x="36" y="26" width="4" height="10" rx="2" fill="#94A3B8" />
          <circle cx="30" cy="20" r="6" fill="#F8FAFC" stroke="#64748B" strokeWidth="1" />
          <ellipse cx="28" cy="20" rx="3.5" ry="3" fill="#6366F1" />
          <circle cx="24" cy="27" r="2" fill="#94A3B8" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Panoramic Mountain Vector Background for Current Quest Hero Card
 */
export function MountainHeroLandscape() {
  return (
    <svg
      viewBox="0 0 540 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute right-0 bottom-0 h-full w-auto pointer-events-none select-none opacity-95"
      preserveAspectRatio="xMaxYMax meet"
    >
      <defs>
        <linearGradient id="sun-grad" x1="240" y1="40" x2="300" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE2E4" />
          <stop offset="60%" stopColor="#E0D4FD" />
          <stop offset="100%" stopColor="#C4B5FD" />
        </linearGradient>
        <linearGradient id="mount-far" x1="200" y1="60" x2="450" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EDE9FE" />
          <stop offset="50%" stopColor="#DDD6FE" />
          <stop offset="100%" stopColor="#C4B5FD" />
        </linearGradient>
        <linearGradient id="mount-mid" x1="280" y1="80" x2="520" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="mount-front" x1="320" y1="120" x2="540" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6D28D9" />
          <stop offset="50%" stopColor="#5B21B6" />
          <stop offset="100%" stopColor="#4C1D95" />
        </linearGradient>
      </defs>

      <circle cx="270" cy="80" r="26" fill="url(#sun-grad)" opacity="0.8" />

      <g stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" opacity="0.5">
        <path d="M295 48 Q 299 44, 303 48 Q 307 44, 311 48" fill="none" />
        <path d="M315 38 Q 318 35, 321 38 Q 324 35, 327 38" fill="none" />
        <path d="M328 54 Q 330 52, 332 54 Q 334 52, 336 54" fill="none" />
      </g>

      <path
        d="M160 240 L220 160 L270 190 L330 110 L410 180 L490 120 L540 160 L540 240 Z"
        fill="url(#mount-far)"
        opacity="0.85"
      />

      <path
        d="M230 240 L310 130 L360 170 L430 90 L480 150 L540 100 L540 240 Z"
        fill="url(#mount-mid)"
        opacity="0.75"
      />

      <path
        d="M310 240 L380 140 L430 180 L490 110 L540 160 L540 240 Z"
        fill="url(#mount-front)"
        opacity="0.9"
      />

      <polygon points="430,90 410,180 430,170" fill="#DDD6FE" opacity="0.4" />
      <polygon points="490,110 470,190 490,180" fill="#C4B5FD" opacity="0.4" />
    </svg>
  );
}

/**
 * 40% Complete Radial Progress Gauge
 */
export function CircularProgress40({ className = "w-24 h-24" }: { className?: string }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (40 / 100) * circumference;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="#E2E8F0"
          strokeWidth="6.5"
          fill="transparent"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="#7C3AED"
          strokeWidth="6.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-sm font-extrabold text-slate-900 leading-none">40%</span>
        <span className="text-[9px] font-medium text-slate-400 leading-none mt-0.5">Complete</span>
      </div>
    </div>
  );
}
