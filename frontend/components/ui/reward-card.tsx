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
          particleCount: 100,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#8B5CF6', '#A855F7', '#06B6D4', '#10B981', '#F59E0B', '#3B82F6'],
          scalar: 1.15,
          ticks: 220,
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
        'relative w-full max-w-xl overflow-hidden rounded-none border border-purple-100/90 bg-white p-5 sm:p-6 text-slate-900 shadow-sm space-y-4',
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
            className="relative mt-2"
          >
            <div
              ref={sliderRef}
              className="relative h-14 w-full rounded-none bg-slate-100/90 border border-slate-200/80 overflow-hidden flex items-center shadow-inner"
            >
              <motion.div
                ref={handleRef}
                drag="x"
                dragConstraints={{ left: 0, right: dragConstraint }}
                dragElastic={0.08}
                style={{ x }}
                onDragEnd={onDragEnd}
                className="absolute left-1 top-1 bottom-1 z-10 flex h-12 w-12 cursor-grab items-center justify-center rounded-none bg-gradient-to-r from-[#6366F1] to-[#7C3AED] text-white shadow-md active:cursor-grabbing hover:opacity-95"
              >
                <ChevronRightIcon className="h-5 w-5 stroke-[2.5]" />
              </motion.div>
              <motion.span
                style={{ opacity: textOpacity }}
                className={cn(
                  'absolute inset-0 flex items-center justify-center pl-12 text-xs font-bold uppercase tracking-wider text-slate-500 select-none pointer-events-none',
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
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full"
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
