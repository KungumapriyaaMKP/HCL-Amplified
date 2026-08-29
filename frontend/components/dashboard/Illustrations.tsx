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

/**
 * 3D Waving Astronaut/Robot Mascot Header Graphic
 */
export function WavingRobotMascot({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="body-grad" x1="60" y1="20" x2="60" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#EFF6FF" />
            <stop offset="100%" stopColor="#DBEAFE" />
          </linearGradient>
          <linearGradient id="visor-grad" x1="45" y1="35" x2="75" y2="65" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Ambient Halo & Sparkles */}
        <circle cx="60" cy="60" r="50" fill="url(#ring-grad)" />
        <path d="M102 26 L104 20 L106 26 L112 28 L106 30 L104 36 L102 30 L96 28 Z" fill="#60A5FA" />
        <path d="M18 42 L19.5 38 L21 42 L25 43.5 L21 45 L19.5 49 L18 45 L14 43.5 Z" fill="#93C5FD" opacity="0.8" />
        <circle cx="28" cy="22" r="2" fill="#3B82F6" opacity="0.6" />
        <circle cx="95" cy="85" r="2.5" fill="#60A5FA" opacity="0.5" />

        {/* Helmet / Head */}
        <ellipse cx="60" cy="50" rx="28" ry="24" fill="url(#body-grad)" stroke="#BFDBFE" strokeWidth="2.5" />
        {/* Left / Right Ear Cylinders */}
        <rect x="29" y="44" width="4" height="12" rx="2" fill="#93C5FD" />
        <rect x="87" y="44" width="4" height="12" rx="2" fill="#93C5FD" />

        {/* Blue Visor Screen */}
        <ellipse cx="60" cy="50" rx="19" ry="14" fill="url(#visor-grad)" />
        {/* Cute Blue Glow Eyes / Cheerful Face */}
        <ellipse cx="53" cy="49" rx="3" ry="4" fill="#93C5FD" />
        <ellipse cx="67" cy="49" rx="3" ry="4" fill="#93C5FD" />
        <ellipse cx="54" cy="48" rx="1.2" ry="1.5" fill="#FFFFFF" />
        <ellipse cx="68" cy="48" rx="1.2" ry="1.5" fill="#FFFFFF" />
        {/* Visor Glare Reflex */}
        <path d="M47 42 C51 39, 58 39, 63 41" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />

        {/* Torso */}
        <path d="M42 72 C42 66, 78 66, 78 72 L82 92 C82 98, 38 98, 38 92 Z" fill="url(#body-grad)" stroke="#BFDBFE" strokeWidth="2" />
        {/* Chest Core Badge */}
        <rect x="52" y="74" width="16" height="10" rx="3" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1" />
        <circle cx="60" cy="79" r="2.5" fill="#3B82F6" />

        {/* Left Arm (Relaxed) */}
        <path d="M38 72 Q 30 78, 32 88" stroke="#DBEAFE" strokeWidth="7" strokeLinecap="round" />
        <circle cx="32" cy="88" r="4.5" fill="#BFDBFE" />

        {/* Right Arm (Waving!) */}
        <path d="M80 72 Q 95 62, 98 46" stroke="#DBEAFE" strokeWidth="7" strokeLinecap="round" />
        <circle cx="98" cy="46" r="5" fill="#93C5FD" />
        {/* Waving Hand Palm & Fingers */}
        <circle cx="102" cy="42" r="4" fill="#BFDBFE" />
      </svg>
    </div>
  );
}

/**
 * Blue & Gold Wreath Trophy Shield Badge
 */
export function WreathTrophyShield({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="shield-grad" x1="15" y1="10" x2="45" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="cup-grad" x1="20" y1="18" x2="40" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="60%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>

        {/* Blue Shield Base */}
        <path
          d="M30 6 C42 6, 48 10, 48 18 C48 34, 38 48, 30 54 C22 48, 12 34, 12 18 C12 10, 18 6, 30 6 Z"
          fill="url(#shield-grad)"
          stroke="#93C5FD"
          strokeWidth="1.5"
        />

        {/* Left Laurel Wreath Leaves */}
        <path d="M16 22 Q 13 28, 16 35 Q 20 42, 26 46" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="14" cy="24" r="2" fill="#93C5FD" />
        <circle cx="13" cy="30" r="2" fill="#93C5FD" />
        <circle cx="15" cy="36" r="2" fill="#93C5FD" />
        <circle cx="20" cy="42" r="2" fill="#93C5FD" />

        {/* Right Laurel Wreath Leaves */}
        <path d="M44 22 Q 47 28, 44 35 Q 40 42, 34 46" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="46" cy="24" r="2" fill="#93C5FD" />
        <circle cx="47" cy="30" r="2" fill="#93C5FD" />
        <circle cx="45" cy="36" r="2" fill="#93C5FD" />
        <circle cx="40" cy="42" r="2" fill="#93C5FD" />

        {/* Gold Trophy Cup in Center */}
        <path d="M22 18 H38 V26 C38 31, 33 34, 30 34 C27 34, 22 31, 22 26 Z" fill="url(#cup-grad)" />
        {/* Left Cup Handle */}
        <path d="M22 20 H18 C17 20, 17 26, 22 26" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Right Cup Handle */}
        <path d="M38 20 H42 C43 20, 43 26, 38 26" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Trophy Base */}
        <rect x="27" y="34" width="6" height="4" fill="#D97706" />
        <rect x="24" y="38" width="12" height="3" rx="1" fill="#F59E0B" />
        {/* Trophy Star */}
        <path d="M30 22 L31 24.5 L33.5 25 L31.5 26.5 L32 29 L30 27.5 L28 29 L28.5 26.5 L26.5 25 L29 24.5 Z" fill="#FEF9C3" />

        {/* Bottom Ribbon / Banner */}
        <path d="M18 48 Q 30 52, 42 48 L44 54 Q 30 58, 16 54 Z" fill="#1E40AF" stroke="#60A5FA" strokeWidth="1" />
      </svg>
    </div>
  );
}

/**
 * Domain Corner Pastel Illustrations Matching Design with Dynamic Animations
 */
export function WebDevPastelIllustration({ className = "w-28 h-20" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Soft Ambient Glow */}
        <ellipse cx="60" cy="50" rx="45" ry="30" fill="#EDE9FE" opacity="0.6" className="transition-opacity duration-300 group-hover:opacity-90" />
        
        {/* Browser Window (Floats dynamically) */}
        <g className="animate-code-float transition-transform duration-300 group-hover:scale-105">
          <rect x="25" y="15" width="80" height="60" rx="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" className="shadow-xs" />
          <path d="M25 25 H105" stroke="#E2E8F0" strokeWidth="1.5" />
          <circle cx="33" cy="20" r="2" fill="#FCA5A5" />
          <circle cx="39" cy="20" r="2" fill="#FDE047" />
          <circle cx="45" cy="20" r="2" fill="#86EFAC" />

          {/* Floating Code Card with hover interaction */}
          <g className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-1">
            <rect x="35" y="32" width="45" height="34" rx="6" fill="url(#web-card-grad)" stroke="#A78BFA" strokeWidth="1" />
            <path d="M48 44 L44 49 L48 54 M67 44 L71 49 L67 54 M59 42 L56 56" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>

        <defs>
          <linearGradient id="web-card-grad" x1="35" y1="32" x2="80" y2="66" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function DataSciencePastelIllustration({ className = "w-28 h-20" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Soft Ambient Glow */}
        <ellipse cx="65" cy="50" rx="45" ry="30" fill="#E0F2FE" opacity="0.6" className="transition-opacity duration-300 group-hover:opacity-90" />

        {/* Dynamic Animated Rising Bars */}
        <rect x="30" y="45" width="10" height="30" rx="3" fill="#BAE6FD" className="animate-bar-1" />
        <rect x="44" y="32" width="10" height="43" rx="3" fill="#60A5FA" className="animate-bar-2" />
        <rect x="58" y="20" width="10" height="55" rx="3" fill="#3B82F6" className="animate-bar-3" />

        {/* Dynamic Rotating Pie Chart on hover */}
        <g className="transition-transform duration-700 ease-out group-hover:rotate-45" style={{ transformOrigin: "85px 38px" }}>
          <circle cx="85" cy="38" r="18" fill="#93C5FD" opacity="0.5" />
          <path d="M85 38 L85 20 A18 18 0 0 1 103 38 Z" fill="#2563EB" />
          <path d="M85 38 L103 38 A18 18 0 0 1 85 56 Z" fill="#60A5FA" />
          <circle cx="85" cy="38" r="8" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );
}

export function AiMlPastelIllustration({ className = "w-28 h-20" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Soft Mint Ambient Glow */}
        <ellipse cx="65" cy="50" rx="45" ry="30" fill="#D1FAE5" opacity="0.6" className="transition-opacity duration-300 group-hover:opacity-90" />

        {/* Floating Robot Character */}
        <g className="animate-soft-float">
          {/* Radar Waves from Antenna */}
          <circle cx="70" cy="18" r="6" stroke="#34D399" strokeWidth="1" fill="none" className="animate-radar" style={{ transformOrigin: "70px 18px" }} />

          {/* Antenna */}
          <path d="M70 27 V20" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
          <circle cx="70" cy="18" r="3" fill="#059669" />

          {/* Cute AI Mint Robot Head */}
          <ellipse cx="70" cy="46" rx="22" ry="19" fill="#FFFFFF" stroke="#A7F3D0" strokeWidth="2" />
          <rect x="46" y="41" width="3" height="10" rx="1.5" fill="#6EE7B7" />
          <rect x="91" y="41" width="3" height="10" rx="1.5" fill="#6EE7B7" />

          {/* Visor Screen */}
          <rect x="55" y="38" width="30" height="16" rx="8" fill="#065F46" />
          
          {/* Animated Blinking Eyes */}
          <g className="animate-eye-blink">
            <circle cx="63" cy="46" r="3" fill="#34D399" />
            <circle cx="77" cy="46" r="3" fill="#34D399" />
            <circle cx="64" cy="45" r="1" fill="#FFFFFF" />
            <circle cx="78" cy="45" r="1" fill="#FFFFFF" />
          </g>

          {/* Cheeks */}
          <circle cx="56" cy="56" r="2.5" fill="#F472B6" opacity="0.6" />
          <circle cx="84" cy="56" r="2.5" fill="#F472B6" opacity="0.6" />

          {/* Body Base */}
          <path d="M54 65 Q 70 60, 86 65 L88 78 Q 70 82, 52 78 Z" fill="#F0FDF4" stroke="#A7F3D0" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

export function CloudDevOpsPastelIllustration({ className = "w-28 h-20" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Soft Amber Glow */}
        <ellipse cx="65" cy="50" rx="45" ry="30" fill="#FEF3C7" opacity="0.6" className="transition-opacity duration-300 group-hover:opacity-90" />

        {/* Animated Floating Cloud */}
        <g className="animate-cloud-bob">
          <path
            d="M50 40 C45 40, 40 45, 42 50 C38 52, 38 58, 43 60 H90 C96 60, 96 52, 91 50 C91 42, 82 40, 78 44 C74 36, 56 34, 50 40 Z"
            fill="#FFFBEB"
            stroke="#FCD34D"
            strokeWidth="1.5"
          />
        </g>

        {/* Server Box Rack with Pulsing LEDs */}
        <g className="transition-transform duration-300 group-hover:-translate-y-1">
          <rect x="52" y="52" width="40" height="24" rx="4" fill="#FFFFFF" stroke="#FBBF24" strokeWidth="1.5" />
          <line x1="58" y1="59" x2="78" y2="59" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
          <circle cx="85" cy="59" r="2" fill="#10B981" className="animate-pulse" />
          <line x1="58" y1="67" x2="78" y2="67" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
          <circle cx="85" cy="67" r="2" fill="#F59E0B" className="animate-pulse" />
        </g>
      </svg>
    </div>
  );
}

export function MobileDevPastelIllustration({ className = "w-28 h-20" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Soft Pink Glow */}
        <ellipse cx="65" cy="50" rx="45" ry="30" fill="#FCE7F3" opacity="0.6" className="transition-opacity duration-300 group-hover:opacity-90" />

        {/* Smartphone tilts on group hover */}
        <g className="transition-transform duration-300 group-hover:rotate-[-4deg] group-hover:scale-105" style={{ transformOrigin: "70px 45px" }}>
          <rect x="52" y="16" width="36" height="60" rx="7" fill="#FFFFFF" stroke="#F472B6" strokeWidth="2" />
          {/* Speaker / Notch */}
          <line x1="65" y1="21" x2="75" y2="21" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
          
          {/* Screen Display with Animated Rocket */}
          <rect x="56" y="26" width="28" height="42" rx="3" fill="#FDF2F8" />
          
          <g className="animate-rocket-thrust">
            <path d="M70 33 C73 37, 75 42, 75 48 H65 C65 42, 67 37, 70 33 Z" fill="#EC4899" />
            <circle cx="70" cy="40" r="2" fill="#FFFFFF" />
            <path d="M66 48 L64 52 H76 L74 48 Z" fill="#F43F5E" />
            {/* Pulsing Rocket Thruster Flame */}
            <path d="M68 52 L70 57 L72 52 Z" fill="#FBBF24" className="animate-pulse" />
          </g>

          {/* Bottom Bar Indicator */}
          <line x1="64" y1="71" x2="76" y2="71" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

export function CybersecurityPastelIllustration({ className = "w-28 h-20" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Soft Purple Glow */}
        <ellipse cx="65" cy="50" rx="45" ry="30" fill="#EDE9FE" opacity="0.6" className="transition-opacity duration-300 group-hover:opacity-90" />

        {/* Security Shield with dynamic pulse */}
        <g className="animate-shield-glow">
          <path
            d="M70 18 C82 18, 88 22, 88 30 C88 46, 78 58, 70 64 C62 58, 52 46, 52 30 C52 22, 58 18, 70 18 Z"
            fill="url(#sec-shield-grad)"
            stroke="#818CF8"
            strokeWidth="1.8"
          />
        </g>
        <defs>
          <linearGradient id="sec-shield-grad" x1="52" y1="18" x2="88" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EEF2FF" />
            <stop offset="100%" stopColor="#C7D2FE" />
          </linearGradient>
        </defs>

        {/* Padlock with interactive Shackle movement */}
        <g className="transition-transform duration-300 group-hover:scale-105">
          {/* Shackle lifts on group hover */}
          <path d="M66 37 V32 C66 29.5, 74 29.5, 74 32 V37" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" fill="none" className="transition-transform duration-300 group-hover:-translate-y-1" />
          {/* Padlock Body */}
          <rect x="63" y="37" width="14" height="12" rx="2.5" fill="#4F46E5" />
          <circle cx="70" cy="42" r="1.5" fill="#FFFFFF" />
          <path d="M70 43.5 V46" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}



/**
 * 3D Student Anime Avatar with Backpack & Floating XP Sparkles
 */
export function StudentAvatarIllustration({ className = "w-36 h-36" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
        <defs>
          <radialGradient id="face-glow" cx="0.5" cy="0.4" r="0.6">
            <stop offset="0%" stopColor="#FFF2E8" />
            <stop offset="100%" stopColor="#FDBA74" />
          </radialGradient>
          <linearGradient id="jacket-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="hair-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient id="xp-coin-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>

        {/* Floating Sparkles & XP Badge */}
        <g className="animate-pulse">
          <circle cx="118" cy="34" r="10" fill="url(#xp-coin-grad)" stroke="#BAE6FD" strokeWidth="1.5" />
          <text x="118" y="37.5" fill="white" fontSize="7.5" fontWeight="900" textAnchor="middle">XP</text>
          
          {/* Sparkles */}
          <path d="M22 38 L24 43 L29 45 L24 47 L22 52 L20 47 L15 45 L20 43 Z" fill="#FBBF24" />
          <path d="M126 68 L127.5 71.5 L131 73 L127.5 74.5 L126 78 L124.5 74.5 L121 73 L124.5 71.5 Z" fill="#34D399" />
          <circle cx="120" cy="18" r="2" fill="#FDE047" />
          <circle cx="28" cy="62" r="1.5" fill="#60A5FA" />
        </g>

        {/* Backpack Straps */}
        <path d="M44 80 C38 92, 40 114, 46 124" stroke="#2563EB" strokeWidth="7" strokeLinecap="round" />
        <path d="M96 80 C102 92, 100 114, 94 124" stroke="#2563EB" strokeWidth="7" strokeLinecap="round" />

        {/* Jacket Body with depth */}
        <path d="M42 85 C42 74, 98 74, 98 85 L104 128 H36 Z" fill="url(#jacket-grad)" />
        {/* Collar & Tie */}
        <path d="M58 85 L70 108 L82 85 Z" fill="#FFFFFF" />
        <path d="M66 102 L70 128 L74 102 Z" fill="#EF4444" />
        <path d="M65 85 L70 95 L75 85 Z" fill="#DC2626" />

        {/* Neck */}
        <rect x="62" y="68" width="16" height="14" rx="4" fill="#FED7AA" />

        {/* 3D Round Face */}
        <ellipse cx="70" cy="50" rx="25" ry="27" fill="url(#face-glow)" />

        {/* Ears with inner detail */}
        <circle cx="44" cy="51" r="5.5" fill="#FED7AA" />
        <circle cx="44" cy="51" r="3" fill="#FDBA74" />
        <circle cx="96" cy="51" r="5.5" fill="#FED7AA" />
        <circle cx="96" cy="51" r="3" fill="#FDBA74" />

        {/* 3D Wavy Anime Hair */}
        <path d="M42 46 C42 26, 54 18, 70 18 C86 18, 98 26, 98 46 C98 38, 93 30, 85 28 C78 26, 62 26, 55 28 C47 30, 42 38, 42 46 Z" fill="url(#hair-grad)" />
        <path d="M44 42 C49 38, 54 46, 58 46 C63 46, 66 36, 72 36 C78 36, 82 46, 86 46 C90 46, 94 38, 97 42 C93 32, 83 26, 70 26 C57 26, 47 32, 44 42 Z" fill="#334155" />

        {/* Big Bright 3D Anime Eyes */}
        <ellipse cx="58" cy="50" rx="4.5" ry="6" fill="#0F172A" />
        <ellipse cx="82" cy="50" rx="4.5" ry="6" fill="#0F172A" />
        <circle cx="60" cy="48" r="1.8" fill="white" />
        <circle cx="84" cy="48" r="1.8" fill="white" />
        <circle cx="57" cy="53" r="0.8" fill="white" />
        <circle cx="81" cy="53" r="0.8" fill="white" />

        {/* Rosy Cheeks & Cheerful Smile */}
        <ellipse cx="52" cy="57" rx="3.5" ry="2" fill="#F472B6" opacity="0.75" />
        <ellipse cx="88" cy="57" rx="3.5" ry="2" fill="#F472B6" opacity="0.75" />
        <path d="M64 58 Q 70 65, 76 58" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

/**
 * 3D Biometric Face Hologram Scanner
 */
export function FaceHologramIllustration({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        <defs>
          <radialGradient id="holo-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="head-3d" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>

        {/* Ambient Glow */}
        <circle cx="50" cy="50" r="42" fill="url(#holo-glow)" className="animate-pulse" />

        {/* Scan Bracket Targets */}
        <path d="M20 34 V20 H34" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
        <path d="M80 34 V20 H66" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
        <path d="M20 66 V80 H34" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
        <path d="M80 66 V80 H66" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />

        {/* 3D Cyan Facial Mesh */}
        <ellipse cx="50" cy="50" rx="19" ry="24" fill="url(#head-3d)" />
        <ellipse cx="50" cy="50" rx="15" ry="20" fill="#38BDF8" opacity="0.8" />
        
        {/* Facial Details */}
        <circle cx="44" cy="46" r="2.5" fill="#0C4A6E" />
        <circle cx="56" cy="46" r="2.5" fill="#0C4A6E" />
        <path d="M50 45 V53 H53" stroke="#0C4A6E" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M45 58 Q 50 62, 55 58" stroke="#0C4A6E" strokeWidth="1.8" strokeLinecap="round" fill="none" />

        {/* Horizontal Laser Scanning Line */}
        <line x1="28" y1="50" x2="72" y2="50" stroke="#E0F2FE" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      </svg>
    </div>
  );
}

/**
 * 3D Folder Cloud Upload Illustration
 */
export function FolderUploadIllustration({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        <defs>
          <linearGradient id="folder-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="folder-back" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>

        {/* Ambient Cloud */}
        <path
          d="M66 28 C63 28, 60 31, 61 34 C58 35, 58 39, 61 40 H77 C81 40, 81 35, 78 34 C78 29, 72 28, 69 30 C66 25, 54 24, 66 28 Z"
          fill="#EFF6FF"
          stroke="#93C5FD"
          strokeWidth="1.5"
        />

        {/* Back Folder Flap */}
        <path d="M18 36 C18 33, 20 32, 23 32 H38 L44 38 H77 C80 38, 82 40, 82 43 V70 C82 73, 80 75, 77 75 H23 C20 75, 18 73, 18 70 Z" fill="url(#folder-back)" />

        {/* White Documents sticking out */}
        <rect x="26" y="24" width="46" height="30" rx="3" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        <line x1="32" y1="30" x2="52" y2="30" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        <line x1="32" y1="36" x2="62" y2="36" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />

        {/* Front Isometric Folder Pocket */}
        <path d="M16 46 C16 43, 18 42, 21 42 H79 C82 42, 84 43, 84 46 L82 75 C82 78, 80 80, 77 80 H23 C20 80, 18 78, 16 75 Z" fill="url(#folder-front)" />

        {/* Cloud Upload Arrow in Foreground */}
        <g className="transition-transform duration-300 group-hover:-translate-y-1">
          <ellipse cx="64" cy="62" rx="14" ry="12" fill="#FFFFFF" />
          <path d="M64 54 L58 60 H61 V68 H67 V60 H70 Z" fill="#2563EB" />
        </g>
      </svg>
    </div>
  );
}

/**
 * 3D Calendar Icon with Spiral Binding & Colorful Day Blocks
 */
export function Calendar3DIllustration({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        {/* Calendar Card Body */}
        <rect x="14" y="18" width="52" height="52" rx="10" fill="#7C3AED" />
        <rect x="14" y="30" width="52" height="40" rx="8" fill="#F8FAFC" />

        {/* Spiral Top Rings */}
        <rect x="24" y="12" width="5" height="12" rx="2.5" fill="#CBD5E1" />
        <rect x="38" y="12" width="5" height="12" rx="2.5" fill="#CBD5E1" />
        <rect x="52" y="12" width="5" height="12" rx="2.5" fill="#CBD5E1" />

        {/* Heatmap Blocks inside Calendar */}
        <rect x="22" y="38" width="8" height="8" rx="2" fill="#C084FC" />
        <rect x="36" y="38" width="8" height="8" rx="2" fill="#FCD34D" />
        <rect x="50" y="38" width="8" height="8" rx="2" fill="#F472B6" />
        <rect x="22" y="52" width="8" height="8" rx="2" fill="#60A5FA" />
        <rect x="36" y="52" width="8" height="8" rx="2" fill="#34D399" />
        <rect x="50" y="52" width="8" height="8" rx="2" fill="#A78BFA" />
      </svg>
    </div>
  );
}

/**
 * 3D Cute Purple Brain Mascot
 */
export function CuteBrainMascotIllustration({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        {/* Ambient Soft Glow */}
        <ellipse cx="50" cy="55" rx="35" ry="25" fill="#EDE9FE" opacity="0.6" className="animate-pulse" />

        {/* Brain Body Folds */}
        <path
          d="M35 35 C28 35, 24 42, 25 50 C22 55, 25 65, 32 68 C35 76, 45 78, 50 76 C55 78, 65 76, 68 68 C75 65, 78 55, 75 50 C76 42, 72 35, 65 35 C62 26, 52 26, 50 30 C48 26, 38 26, 35 35 Z"
          fill="#8B5CF6"
        />
        <path
          d="M38 38 C32 38, 28 44, 29 51 C27 55, 29 63, 35 65 C38 72, 46 74, 50 72 C54 74, 62 72, 65 65 C71 63, 73 55, 71 51 C72 44, 68 38, 62 38 C60 30, 52 30, 50 33 C48 30, 40 30, 38 38 Z"
          fill="#A78BFA"
        />

        {/* Sparkle Eyes */}
        <ellipse cx="44" cy="52" rx="3.5" ry="4.5" fill="#1E1B4B" />
        <ellipse cx="56" cy="52" rx="3.5" ry="4.5" fill="#1E1B4B" />
        <circle cx="45" cy="50" r="1.2" fill="#FFFFFF" />
        <circle cx="57" cy="50" r="1.2" fill="#FFFFFF" />

        {/* Cute Pink Cheeks & Smile */}
        <circle cx="39" cy="57" r="2.5" fill="#F472B6" opacity="0.8" />
        <circle cx="61" cy="57" r="2.5" fill="#F472B6" opacity="0.8" />
        <path d="M47 57 Q 50 61, 53 57" stroke="#1E1B4B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

/**
 * 3D Pastel Floating Sky Island with Castle / Trees
 */
export function FloatingSkyIsland({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none ${className}`}>
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        {/* Soft Cloud Puff below */}
        <ellipse cx="60" cy="90" rx="32" ry="10" fill="#F1F5F9" opacity="0.9" />

        {/* Rock Bottom Island */}
        <path d="M28 58 C38 72, 46 90, 60 90 C74 90, 82 72, 92 58 Z" fill="#94A3B8" />
        <path d="M22 54 C22 50, 98 50, 98 54 C98 60, 84 66, 60 66 C36 66, 22 60, 22 54 Z" fill="#86EFAC" />
        <ellipse cx="60" cy="53" rx="36" ry="6.5" fill="#4ADE80" />

        {/* Mini Trees & Castle */}
        <ellipse cx="40" cy="42" rx="7" ry="9" fill="#22C55E" />
        <ellipse cx="76" cy="40" rx="8" ry="11" fill="#16A34A" />
        <rect x="52" y="34" width="14" height="14" rx="2" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
        <path d="M52 34 L59 26 L66 34 Z" fill="#60A5FA" />
      </svg>
    </div>
  );
}

/**
 * 3D Island with Flag
 */
export function IslandWithFlagIllustration({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none ${className}`}>
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        {/* Soft Cloud Puff below */}
        <ellipse cx="60" cy="92" rx="30" ry="9" fill="#F1F5F9" opacity="0.9" />

        {/* Rock Bottom Island */}
        <path d="M30 62 C38 74, 46 88, 60 88 C74 88, 82 74, 90 62 Z" fill="#94A3B8" />
        <path d="M24 58 C24 54, 96 54, 96 58 C96 64, 82 70, 60 70 C38 70, 24 64, 24 58 Z" fill="#86EFAC" />
        <ellipse cx="60" cy="57" rx="34" ry="6" fill="#4ADE80" />

        {/* Trees */}
        <ellipse cx="75" cy="46" rx="8" ry="10" fill="#22C55E" />
        <ellipse cx="42" cy="48" rx="6" ry="8" fill="#16A34A" />

        {/* Flag Pole & Blue Flag */}
        <line x1="56" y1="28" x2="56" y2="58" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M56 28 L72 35 L56 42 Z" fill="#3B82F6" />
      </svg>
    </div>
  );
}

/**
 * 3D Gold Laurel Wreath Medal for Leaderboard Rank #1
 */
export function GoldRankMedal({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="gold-leaf-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="gold-coin-outer" x1="24" y1="6" x2="24" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="40%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="gold-coin-inner" x1="24" y1="9" x2="24" y2="35" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="50%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
        <linearGradient id="gold-ribbon-tail" x1="24" y1="32" x2="24" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>

      {/* Ribbon Tails */}
      <path d="M17 32 L13 44 L20 40 L24 43 L23 35 Z" fill="url(#gold-ribbon-tail)" />
      <path d="M31 32 L35 44 L28 40 L24 43 L25 35 Z" fill="url(#gold-ribbon-tail)" />

      {/* Laurel Wreath - Left Branch */}
      <path d="M10 17 C7.5 19 6.5 24 10 28 C9 26 9.5 22 13 20 Z" fill="url(#gold-leaf-grad)" />
      <path d="M7 23 C5 26 5 31 10 34 C9 31 9.5 28 13 27 Z" fill="url(#gold-leaf-grad)" />
      <path d="M13 12 C10.5 14 10 18 14 21 C13 19 14.5 16 17 15 Z" fill="url(#gold-leaf-grad)" />
      <path d="M18 8 C15.5 10 15.5 14 20 16 C19 14 20 12 22 11 Z" fill="url(#gold-leaf-grad)" />

      {/* Laurel Wreath - Right Branch */}
      <path d="M38 17 C40.5 19 41.5 24 38 28 C39 26 38.5 22 35 20 Z" fill="url(#gold-leaf-grad)" />
      <path d="M41 23 C43 26 43 31 38 34 C39 31 38.5 28 35 27 Z" fill="url(#gold-leaf-grad)" />
      <path d="M35 12 C37.5 14 38 18 34 21 C35 19 33.5 16 31 15 Z" fill="url(#gold-leaf-grad)" />
      <path d="M30 8 C32.5 10 32.5 14 28 16 C29 14 28 12 26 11 Z" fill="url(#gold-leaf-grad)" />

      {/* Outer Coin Bevel */}
      <circle cx="24" cy="22" r="14" fill="url(#gold-coin-outer)" />

      {/* Inner Coin Surface */}
      <circle cx="24" cy="22" r="11.5" fill="url(#gold-coin-inner)" stroke="#FEF08A" strokeWidth="0.75" />

      {/* Subtle Inner Ring */}
      <circle cx="24" cy="22" r="9.5" fill="none" stroke="#F59E0B" strokeWidth="0.6" strokeDasharray="1.2 0.8" opacity="0.6" />

      {/* Rank Number 1 */}
      <text
        x="24"
        y="27.5"
        fill="#78350F"
        fontSize="15"
        fontWeight="900"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      >
        1
      </text>
    </svg>
  );
}

/**
 * 3D Silver Laurel Wreath Medal for Leaderboard Rank #2
 */
export function SilverRankMedal({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="silver-leaf-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="50%" stopColor="#BAE6FD" />
          <stop offset="100%" stopColor="#7DD3FC" />
        </linearGradient>
        <linearGradient id="silver-coin-outer" x1="24" y1="6" x2="24" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="40%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
        <linearGradient id="silver-coin-inner" x1="24" y1="9" x2="24" y2="35" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
        <linearGradient id="silver-ribbon-tail" x1="24" y1="32" x2="24" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>

      {/* Ribbon Tails */}
      <path d="M17 32 L13 44 L20 40 L24 43 L23 35 Z" fill="url(#silver-ribbon-tail)" />
      <path d="M31 32 L35 44 L28 40 L24 43 L25 35 Z" fill="url(#silver-ribbon-tail)" />

      {/* Laurel Wreath - Left Branch */}
      <path d="M10 17 C7.5 19 6.5 24 10 28 C9 26 9.5 22 13 20 Z" fill="url(#silver-leaf-grad)" />
      <path d="M7 23 C5 26 5 31 10 34 C9 31 9.5 28 13 27 Z" fill="url(#silver-leaf-grad)" />
      <path d="M13 12 C10.5 14 10 18 14 21 C13 19 14.5 16 17 15 Z" fill="url(#silver-leaf-grad)" />
      <path d="M18 8 C15.5 10 15.5 14 20 16 C19 14 20 12 22 11 Z" fill="url(#silver-leaf-grad)" />

      {/* Laurel Wreath - Right Branch */}
      <path d="M38 17 C40.5 19 41.5 24 38 28 C39 26 38.5 22 35 20 Z" fill="url(#silver-leaf-grad)" />
      <path d="M41 23 C43 26 43 31 38 34 C39 31 38.5 28 35 27 Z" fill="url(#silver-leaf-grad)" />
      <path d="M35 12 C37.5 14 38 18 34 21 C35 19 33.5 16 31 15 Z" fill="url(#silver-leaf-grad)" />
      <path d="M30 8 C32.5 10 32.5 14 28 16 C29 14 28 12 26 11 Z" fill="url(#silver-leaf-grad)" />

      {/* Outer Coin Bevel */}
      <circle cx="24" cy="22" r="14" fill="url(#silver-coin-outer)" />

      {/* Inner Coin Surface */}
      <circle cx="24" cy="22" r="11.5" fill="url(#silver-coin-inner)" stroke="#FFFFFF" strokeWidth="0.75" />

      {/* Subtle Inner Ring */}
      <circle cx="24" cy="22" r="9.5" fill="none" stroke="#94A3B8" strokeWidth="0.6" strokeDasharray="1.2 0.8" opacity="0.6" />

      {/* Rank Number 2 */}
      <text
        x="24"
        y="27.5"
        fill="#1E293B"
        fontSize="15"
        fontWeight="900"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      >
        2
      </text>
    </svg>
  );
}

/**
 * 3D Bronze Laurel Wreath Medal for Leaderboard Rank #3
 */
export function BronzeRankMedal({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="bronze-leaf-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="50%" stopColor="#FDBA74" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
        <linearGradient id="bronze-coin-outer" x1="24" y1="6" x2="24" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFEDD5" />
          <stop offset="40%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
        <linearGradient id="bronze-coin-inner" x1="24" y1="9" x2="24" y2="35" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF7ED" />
          <stop offset="50%" stopColor="#FED7AA" />
          <stop offset="100%" stopColor="#FDBA74" />
        </linearGradient>
        <linearGradient id="bronze-ribbon-tail" x1="24" y1="32" x2="24" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#9A3412" />
        </linearGradient>
      </defs>

      {/* Ribbon Tails */}
      <path d="M17 32 L13 44 L20 40 L24 43 L23 35 Z" fill="url(#bronze-ribbon-tail)" />
      <path d="M31 32 L35 44 L28 40 L24 43 L25 35 Z" fill="url(#bronze-ribbon-tail)" />

      {/* Laurel Wreath - Left Branch */}
      <path d="M10 17 C7.5 19 6.5 24 10 28 C9 26 9.5 22 13 20 Z" fill="url(#bronze-leaf-grad)" />
      <path d="M7 23 C5 26 5 31 10 34 C9 31 9.5 28 13 27 Z" fill="url(#bronze-leaf-grad)" />
      <path d="M13 12 C10.5 14 10 18 14 21 C13 19 14.5 16 17 15 Z" fill="url(#bronze-leaf-grad)" />
      <path d="M18 8 C15.5 10 15.5 14 20 16 C19 14 20 12 22 11 Z" fill="url(#bronze-leaf-grad)" />

      {/* Laurel Wreath - Right Branch */}
      <path d="M38 17 C40.5 19 41.5 24 38 28 C39 26 38.5 22 35 20 Z" fill="url(#bronze-leaf-grad)" />
      <path d="M41 23 C43 26 43 31 38 34 C39 31 38.5 28 35 27 Z" fill="url(#bronze-leaf-grad)" />
      <path d="M35 12 C37.5 14 38 18 34 21 C35 19 33.5 16 31 15 Z" fill="url(#bronze-leaf-grad)" />
      <path d="M30 8 C32.5 10 32.5 14 28 16 C29 14 28 12 26 11 Z" fill="url(#bronze-leaf-grad)" />

      {/* Outer Coin Bevel */}
      <circle cx="24" cy="22" r="14" fill="url(#bronze-coin-outer)" />

      {/* Inner Coin Surface */}
      <circle cx="24" cy="22" r="11.5" fill="url(#bronze-coin-inner)" stroke="#FFF7ED" strokeWidth="0.75" />

      {/* Subtle Inner Ring */}
      <circle cx="24" cy="22" r="9.5" fill="none" stroke="#EA580C" strokeWidth="0.6" strokeDasharray="1.2 0.8" opacity="0.6" />

      {/* Rank Number 3 */}
      <text
        x="24"
        y="27.5"
        fill="#7C2D12"
        fontSize="15"
        fontWeight="900"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      >
        3
      </text>
    </svg>
  );
}

/**
 * Professional Ultra-Sleek Explorer Shield Badge
 */
export function ExplorerShieldBadge({ className = "w-14 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="exp-border" x1="0" y1="0" x2="56" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#4C1D95" />
        </linearGradient>
        <linearGradient id="exp-bg" x1="28" y1="4" x2="28" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="60%" stopColor="#6D28D9" />
          <stop offset="100%" stopColor="#4C1D95" />
        </linearGradient>
        <linearGradient id="exp-inner" x1="28" y1="12" x2="28" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#EDE9FE" />
        </linearGradient>
      </defs>

      {/* Outer Shield with Crisp Bevel */}
      <path
        d="M28 3 C44 3, 53 8, 53 18 C53 38, 41 54, 28 61 C15 54, 3 38, 3 18 C3 8, 12 3, 28 3 Z"
        fill="url(#exp-border)"
      />
      {/* Inner Shield Body */}
      <path
        d="M28 6 C41 6, 49 10, 49 19 C49 36, 38 50, 28 56 C18 50, 7 36, 7 19 C7 10, 15 6, 28 6 Z"
        fill="url(#exp-bg)"
      />
      {/* Top Specular Arc */}
      <path d="M12 16 C20 10, 36 10, 44 16 C40 21, 16 21, 12 16 Z" fill="white" fillOpacity="0.2" />

      {/* Compass Circular Bevel */}
      <circle cx="28" cy="30" r="14.5" fill="url(#exp-inner)" stroke="#C4B5FD" strokeWidth="1" />
      <circle cx="28" cy="30" r="12" fill="#2E1065" />
      {/* Ring markings */}
      <circle cx="28" cy="30" r="10" fill="none" stroke="#8B5CF6" strokeWidth="0.75" strokeDasharray="1 2.14" />

      {/* Compass Rose Stars */}
      <polygon points="28,21 30,28 37,28 31,32 33,38 28,34 23,38 25,32 19,28 26,28" fill="#FBBF24" opacity="0.3" />

      {/* 3D Directional Compass Needle */}
      <g transform="translate(28, 30) rotate(-45)">
        <polygon points="0,-10 3.5,0 0,-1 -3.5,0" fill="#EF4444" />
        <polygon points="0,-10 0,-1 -3.5,0" fill="#B91C1C" />
        <polygon points="0,10 3.5,0 0,1 -3.5,0" fill="#CBD5E1" />
        <polygon points="0,10 0,1 -3.5,0" fill="#FFFFFF" />
        <circle cx="0" cy="0" r="2.5" fill="#FBBF24" stroke="#78350F" strokeWidth="0.8" />
      </g>
    </svg>
  );
}

/**
 * Professional Ultra-Sleek Quick Learner Shield Badge
 */
export function QuickLearnerShieldBadge({ className = "w-14 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="ql-border" x1="0" y1="0" x2="56" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#86EFAC" />
          <stop offset="50%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#14532D" />
        </linearGradient>
        <linearGradient id="ql-bg" x1="28" y1="4" x2="28" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="60%" stopColor="#16A34A" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
        <linearGradient id="ql-star-facet" x1="28" y1="16" x2="28" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* Outer Shield Bevel */}
      <path
        d="M28 3 C44 3, 53 8, 53 18 C53 38, 41 54, 28 61 C15 54, 3 38, 3 18 C3 8, 12 3, 28 3 Z"
        fill="url(#ql-border)"
      />
      {/* Inner Shield Body */}
      <path
        d="M28 6 C41 6, 49 10, 49 19 C49 36, 38 50, 28 56 C18 50, 7 36, 7 19 C7 10, 15 6, 28 6 Z"
        fill="url(#ql-bg)"
      />
      {/* Specular Highlight */}
      <path d="M12 16 C20 10, 36 10, 44 16 C40 21, 16 21, 12 16 Z" fill="white" fillOpacity="0.25" />

      {/* 3D Sharp Golden Star */}
      <g transform="translate(28, 30)">
        {/* Glow */}
        <circle cx="0" cy="0" r="14" fill="#FEF08A" opacity="0.15" />
        {/* Star Main */}
        <polygon
          points="0,-14 4.2,-4.2 14.5,-2.8 6.8,4.5 9,14.5 0,9.2 -9,14.5 -6.8,4.5 -14.5,-2.8 -4.2,-4.2"
          fill="url(#ql-star-facet)"
          stroke="#FEF9C3"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* Star Shading Facets */}
        <polygon points="0,-14 0,9.2 9,14.5" fill="#D97706" opacity="0.35" />
        <polygon points="0,-14 0,9.2 -9,14.5" fill="white" opacity="0.3" />
        <polygon points="0,-14 4.2,-4.2 0,0" fill="white" opacity="0.4" />
      </g>
    </svg>
  );
}

/**
 * Professional Ultra-Sleek Consistent Shield Badge
 */
export function ConsistentShieldBadge({ className = "w-14 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="con-border" x1="0" y1="0" x2="56" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#9A3412" />
        </linearGradient>
        <linearGradient id="con-bg" x1="28" y1="4" x2="28" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="con-bolt-grad" x1="28" y1="14" x2="28" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#FEF9C3" />
          <stop offset="100%" stopColor="#FDE047" />
        </linearGradient>
      </defs>

      {/* Outer Shield Bevel */}
      <path
        d="M28 3 C44 3, 53 8, 53 18 C53 38, 41 54, 28 61 C15 54, 3 38, 3 18 C3 8, 12 3, 28 3 Z"
        fill="url(#con-border)"
      />
      {/* Inner Shield Body */}
      <path
        d="M28 6 C41 6, 49 10, 49 19 C49 36, 38 50, 28 56 C18 50, 7 36, 7 19 C7 10, 15 6, 28 6 Z"
        fill="url(#con-bg)"
      />
      {/* Specular Highlight */}
      <path d="M12 16 C20 10, 36 10, 44 16 C40 21, 16 21, 12 16 Z" fill="white" fillOpacity="0.3" />

      {/* 3D Razor-Sharp Lightning Bolt */}
      <g transform="translate(28, 30)">
        <polygon
          points="3,-15 -8,2 2,2 -2,15 10,-2 0,-2"
          fill="url(#con-bolt-grad)"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* Bolt Shading */}
        <polygon points="3,-15 2,2 -2,15" fill="#F59E0B" opacity="0.35" />
        <polygon points="3,-15 -8,2 2,2" fill="white" opacity="0.45" />
      </g>
    </svg>
  );
}

/**
 * Professional Ultra-Sleek Sharpshooter Shield Badge
 */
export function SharpshooterShieldBadge({ className = "w-14 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="sharp-border" x1="0" y1="0" x2="56" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCA5A5" />
          <stop offset="50%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>
        <linearGradient id="sharp-bg" x1="28" y1="4" x2="28" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="60%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>
      </defs>

      {/* Outer Shield Bevel */}
      <path
        d="M28 3 C44 3, 53 8, 53 18 C53 38, 41 54, 28 61 C15 54, 3 38, 3 18 C3 8, 12 3, 28 3 Z"
        fill="url(#sharp-border)"
      />
      {/* Inner Shield Body */}
      <path
        d="M28 6 C41 6, 49 10, 49 19 C49 36, 38 50, 28 56 C18 50, 7 36, 7 19 C7 10, 15 6, 28 6 Z"
        fill="url(#sharp-bg)"
      />
      {/* Specular Highlight */}
      <path d="M12 16 C20 10, 36 10, 44 16 C40 21, 16 21, 12 16 Z" fill="white" fillOpacity="0.25" />

      {/* High-Precision Target Bullseye */}
      <circle cx="28" cy="30" r="14" fill="white" stroke="#FECACA" strokeWidth="1" />
      <circle cx="28" cy="30" r="10.5" fill="#EF4444" />
      <circle cx="28" cy="30" r="7" fill="white" />
      <circle cx="28" cy="30" r="3.5" fill="#EF4444" />
      {/* Target Crosshair Ticks */}
      <line x1="28" y1="13" x2="28" y2="17" stroke="#DC2626" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="28" y1="43" x2="28" y2="47" stroke="#DC2626" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="11" y1="30" x2="15" y2="30" stroke="#DC2626" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="41" y1="30" x2="45" y2="30" stroke="#DC2626" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Professional Ultra-Sleek Locked Shield Badge
 */
export function LockedShieldBadge({ className = "w-14 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="lock-border" x1="0" y1="0" x2="56" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="50%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
        <linearGradient id="lock-bg" x1="28" y1="4" x2="28" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="60%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
      </defs>

      {/* Outer Shield Bevel */}
      <path
        d="M28 3 C44 3, 53 8, 53 18 C53 38, 41 54, 28 61 C15 54, 3 38, 3 18 C3 8, 12 3, 28 3 Z"
        fill="url(#lock-border)"
      />
      {/* Inner Shield Body */}
      <path
        d="M28 6 C41 6, 49 10, 49 19 C49 36, 38 50, 28 56 C18 50, 7 36, 7 19 C7 10, 15 6, 28 6 Z"
        fill="url(#lock-bg)"
      />

      {/* Sleek Minimalist Padlock */}
      <path
        d="M23 27 V23 C23 20, 33 20, 33 23 V27"
        stroke="#64748B"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="18" y="27" width="20" height="15" rx="3.5" fill="#64748B" />
      <circle cx="28" cy="33.5" r="2" fill="white" />
      <path d="M28 35.5 V38.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Cute 3D Smiling Fire Flame Mascot
 */
export function CuteFireMascotIllustration({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        <defs>
          <linearGradient id="fire-outer-grad" x1="32" y1="4" x2="32" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="40%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="fire-inner-grad" x1="32" y1="20" x2="32" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Outer Flame Body */}
        <path
          d="M32 4 C32 4, 48 18, 48 36 C48 48, 41 58, 32 58 C23 58, 16 48, 16 36 C16 22, 28 16, 28 16 C28 16, 24 24, 29 27 C34 30, 32 20, 32 4 Z"
          fill="url(#fire-outer-grad)"
        />
        {/* Inner Warm Flame Core */}
        <path
          d="M32 20 C32 20, 42 30, 42 42 C42 50, 38 55, 32 55 C26 55, 22 50, 22 42 C22 34, 30 28, 32 20 Z"
          fill="url(#fire-inner-grad)"
        />

        {/* Cute Sparkle Eyes */}
        <ellipse cx="28" cy="40" rx="2.5" ry="3.5" fill="#431407" />
        <ellipse cx="36" cy="40" rx="2.5" ry="3.5" fill="#431407" />
        <circle cx="27.2" cy="38.5" r="1" fill="white" />
        <circle cx="35.2" cy="38.5" r="1" fill="white" />

        {/* Rosy Cheeks */}
        <circle cx="24" cy="44" r="2.2" fill="#EF4444" opacity="0.6" />
        <circle cx="40" cy="44" r="2.2" fill="#EF4444" opacity="0.6" />

        {/* Happy Open Smile */}
        <path d="M29 44 Q 32 48, 35 44" stroke="#431407" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

/**
 * Professional Championship Gold Trophy on Stage (Quest Master)
 */
export function TrophyPodiumIllustration({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="trophy-metal-gold" x1="40" y1="12" x2="40" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="30%" stopColor="#FCD34D" />
            <stop offset="70%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="pedestal-sleek" x1="40" y1="46" x2="40" y2="74" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="60%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>
        </defs>

        {/* Ambient Glow */}
        <circle cx="40" cy="40" r="32" fill="#FBBF24" opacity="0.12" />

        {/* Sleek Stage Pedestal */}
        <rect x="16" y="58" width="48" height="14" rx="4" fill="url(#pedestal-sleek)" stroke="#60A5FA" strokeWidth="0.8" />
        <rect x="24" y="50" width="32" height="10" rx="3" fill="#2563EB" />
        <line x1="24" y1="50" x2="56" y2="50" stroke="#93C5FD" strokeWidth="1" strokeLinecap="round" />

        {/* Championship Cup */}
        <path d="M28 16 H52 V28 C52 35, 45 39, 40 39 C35 39, 28 35, 28 28 Z" fill="url(#trophy-metal-gold)" />
        {/* Left Handle */}
        <path d="M28 18 H22 C19.5 18, 19.5 28, 28 28" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Right Handle */}
        <path d="M52 18 H58 C60.5 18, 60.5 28, 52 28" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Cup Specular Highlight */}
        <path d="M30 18 H35 V27 C35 32, 33 34, 30 36 Z" fill="white" opacity="0.3" />

        {/* Trophy Stem & Plinth */}
        <rect x="37" y="39" width="6" height="6" fill="#D97706" />
        <rect x="31" y="45" width="18" height="5" rx="1.5" fill="#F59E0B" />
        <circle cx="40" cy="26" r="3.5" fill="#FFFBEB" />
        <path d="M40 23 L41 25.5 L43.5 26 L41.5 27.5 L42 30 L40 28.5 L38 30 L38.5 27.5 L36.5 26 L39 25.5 Z" fill="#F59E0B" />
      </svg>
    </div>
  );
}

/**
 * Professional Amethyst / Crystal Trophy (Top Performer)
 */
export function PurpleTrophyIllustration({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="purp-cup-metal" x1="40" y1="14" x2="40" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F5F3FF" />
            <stop offset="30%" stopColor="#C4B5FD" />
            <stop offset="70%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#5B21B6" />
          </linearGradient>
          <linearGradient id="purp-plinth" x1="40" y1="50" x2="40" y2="72" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#2E1065" />
          </linearGradient>
        </defs>

        {/* Ambient Violet Glow */}
        <circle cx="40" cy="40" r="32" fill="#8B5CF6" opacity="0.12" />

        {/* Purple Trophy Cup */}
        <path d="M28 16 H52 V28 C52 35, 45 39, 40 39 C35 39, 28 35, 28 28 Z" fill="url(#purp-cup-metal)" />
        {/* Handles */}
        <path d="M28 18 H22 C19.5 18, 19.5 28, 28 28" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M52 18 H58 C60.5 18, 60.5 28, 52 28" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Cup Specular */}
        <path d="M30 18 H35 V27 C35 32, 33 34, 30 36 Z" fill="white" opacity="0.35" />

        {/* Stem & Tiered Base */}
        <rect x="37" y="39" width="6" height="7" fill="#6D28D9" />
        <rect x="32" y="46" width="16" height="5" rx="1.5" fill="#8B5CF6" />
        <rect x="22" y="51" width="36" height="15" rx="3.5" fill="url(#purp-plinth)" stroke="#A78BFA" strokeWidth="0.8" />
        <line x1="24" y1="52" x2="56" y2="52" stroke="#DDD6FE" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/**
 * Professional Modern 30-Day Streak Calendar (Streak Legend)
 */
export function Calendar30Illustration({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="cal-header-grad" x1="16" y1="16" x2="64" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
        </defs>

        {/* Ambient Glow */}
        <circle cx="40" cy="40" r="32" fill="#F97316" opacity="0.1" />

        {/* Calendar Body */}
        <rect x="16" y="20" width="48" height="48" rx="10" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        {/* Calendar Top Banner */}
        <path d="M16 28 C16 23.5, 20.5 20, 26 20 H54 C59.5 20, 64 23.5, 64 28 V32 H16 Z" fill="url(#cal-header-grad)" />

        {/* Spiral Binder Rings */}
        <rect x="25" y="14" width="4" height="10" rx="2" fill="#94A3B8" />
        <rect x="38" y="14" width="4" height="10" rx="2" fill="#94A3B8" />
        <rect x="51" y="14" width="4" height="10" rx="2" fill="#94A3B8" />

        {/* Bold 30 */}
        <text
          x="40"
          y="56"
          fill="#1E293B"
          fontSize="22"
          fontWeight="900"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          letterSpacing="-0.5"
        >
          30
        </text>

        {/* Mini Accent Dot */}
        <circle cx="56" cy="60" r="2" fill="#F97316" />
      </svg>
    </div>
  );
}

/**
 * 3D Blasting Rocket Mascot for Sidebar Promo Card
 */
export function RocketBlastingIllustration({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <g transform="translate(30, 30) rotate(-45) translate(-30, -30)">
          {/* Flame */}
          <path d="M26 40 Q 30 54, 34 40 Z" fill="#F59E0B" />
          <path d="M28 40 Q 30 48, 32 40 Z" fill="#FEF08A" />

          {/* Fins */}
          <path d="M20 34 L25 28 V38 Z" fill="#7C3AED" />
          <path d="M40 34 L35 28 V38 Z" fill="#7C3AED" />

          {/* Fuselage */}
          <path d="M24 24 C24 14, 30 8, 30 8 C30 8, 36 14, 36 24 V38 H24 Z" fill="#FFFFFF" stroke="#DDD6FE" strokeWidth="1" />
          {/* Nose Cone */}
          <path d="M24 18 C24 12, 30 8, 30 8 C30 8, 36 12, 36 18 Z" fill="#6D28D9" />

          {/* Porthole */}
          <circle cx="30" cy="24" r="3.5" fill="#38BDF8" stroke="#E0F2FE" strokeWidth="1" />
        </g>
        {/* Sparkles */}
        <circle cx="12" cy="18" r="1.5" fill="#FBBF24" />
        <circle cx="48" cy="14" r="1.2" fill="#A78BFA" />
        <circle cx="14" cy="46" r="1" fill="#38BDF8" />
      </svg>
    </div>
  );
}

/**
 * 3D Isometric Stack of Books with Device for Resources Promo Card
 */
export function NeedResourcesBooksIllustration({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="book-bot-grad" x1="12" y1="46" x2="58" y2="62" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4338CA" />
          </linearGradient>
          <linearGradient id="book-top-grad" x1="18" y1="36" x2="62" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="device-screen-grad" x1="32" y1="12" x2="56" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EDE9FE" />
            <stop offset="100%" stopColor="#DDD6FE" />
          </linearGradient>
        </defs>

        {/* Ambient Glow */}
        <circle cx="38" cy="38" r="28" fill="#C4B5FD" opacity="0.25" />

        {/* Bottom Book (Blue/Indigo) */}
        <path d="M12 50 L38 62 L60 52 L34 40 Z" fill="url(#book-bot-grad)" />
        <path d="M12 50 L12 54 L38 66 L38 62 Z" fill="#3730A3" />
        <path d="M38 62 L38 66 L60 56 L60 52 Z" fill="#F8FAFC" />
        <path d="M38 63 L38 65 L58 55 L58 53 Z" fill="#E2E8F0" />

        {/* Middle Book (Purple) */}
        <path d="M16 42 L42 54 L62 44 L36 32 Z" fill="url(#book-top-grad)" />
        <path d="M16 42 L16 46 L42 58 L42 54 Z" fill="#6B21A8" />
        <path d="M42 54 L42 58 L62 48 L62 44 Z" fill="#F8FAFC" />
        <path d="M42 55 L42 57 L60 47 L60 45 Z" fill="#E2E8F0" />

        {/* Leaning Glowing Device */}
        <g transform="translate(36, 10) rotate(15)">
          <rect x="0" y="0" width="22" height="32" rx="4" fill="#FFFFFF" stroke="#C4B5FD" strokeWidth="1.2" />
          <rect x="2" y="2" width="18" height="28" rx="2.5" fill="url(#device-screen-grad)" />
          {/* Graduation Cap Icon on screen */}
          <path d="M11 8 L18 12 L11 16 L4 12 Z" fill="#7C3AED" />
          <path d="M7 14 V19 C7 21, 15 21, 15 19 V14" stroke="#7C3AED" strokeWidth="1" fill="none" />
          <path d="M16 13 V18" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" />
          <circle cx="16" cy="18.5" r="0.8" fill="#F59E0B" />
        </g>
      </svg>
    </div>
  );
}

