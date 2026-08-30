'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

// ---PROPS---
export interface SlideToUnlockProps {
  children: React.ReactNode;
  onUnlock?: () => void;
  sliderText?: string;
  unlockedContent: React.ReactNode;
  className?: string;
  shimmer?: boolean;
}

// ---COMPONENT---
export const SlideToUnlock = ({
  children,
  onUnlock,
  sliderText = 'Swipe to open the gift',
  unlockedContent,
  className,
  shimmer = true,
}: SlideToUnlockProps) => {
  const [unlocked, setUnlocked] = useState(false);
  const [dragConstraint, setDragConstraint] = useState(0);
  const x = useMotionValue(0);

  const sliderRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  // Effect to calculate the correct drag constraint after the component mounts
  useEffect(() => {
    const sliderWidth = sliderRef.current?.offsetWidth || 0;
    const handleWidth = handleRef.current?.offsetWidth || 0;
    setDragConstraint(Math.max(0, sliderWidth - handleWidth));
  }, []);

  // When the drag ends, check if it's past the threshold
  const onDragEnd = (_event: any, info: any) => {
    if (dragConstraint > 0 && info.offset.x > dragConstraint * 0.75) {
      setUnlocked(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#A855F7', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'],
        });
      } catch {
        // Safe fallback
      }
      onUnlock?.();
    } else {
      // Snap back to the start
      x.set(0);
    }
  };

  const textOpacity = useTransform(x, [0, 50], [1, 0]);

  return (
    <div
      className={cn(
        'relative w-full max-w-sm overflow-hidden rounded-none border border-purple-200/90 bg-white p-6 text-slate-900 shadow-md',
        className
      )}
    >
      {children}
      <AnimatePresence mode="wait">
        {!unlocked ? (
          <motion.div
            key="slider"
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative mt-5"
          >
            <div
              ref={sliderRef}
              className="relative h-13 w-full rounded-none bg-slate-100 border border-slate-200 overflow-hidden flex items-center"
            >
              <motion.div
                ref={handleRef}
                drag="x"
                dragConstraints={{ left: 0, right: dragConstraint }}
                dragElastic={0.08}
                style={{ x }}
                onDragEnd={onDragEnd}
                className="absolute left-0 top-0 z-10 flex h-13 w-13 cursor-grab items-center justify-center rounded-none bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white shadow-md active:cursor-grabbing hover:opacity-95"
              >
                <ChevronRightIcon className="h-5 w-5 stroke-[2.5]" />
              </motion.div>
              <motion.span
                style={{ opacity: textOpacity }}
                className={cn(
                  'absolute inset-0 flex items-center justify-center pl-10 text-xs font-extrabold uppercase tracking-wider text-slate-600 select-none pointer-events-none',
                  shimmer &&
                    'animate-pulse bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 bg-clip-text text-transparent'
                )}
              >
                {sliderText}
              </motion.span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            {unlockedContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ---ICON---
const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default SlideToUnlock;
