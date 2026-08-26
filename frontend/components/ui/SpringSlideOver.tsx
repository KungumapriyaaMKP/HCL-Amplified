"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { X } from "lucide-react";

interface SpringSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: string;
}

export function SpringSlideOver({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = "max-w-md",
}: SpringSlideOverProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 280,
            }}
            className={`fixed inset-y-0 right-0 z-50 w-full ${width} bg-canvas border-l border-border shadow-2xl flex flex-col`}
          >
            {/* Header */}
            <div className="p-5 border-b border-border flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-ink">{title}</h3>
                {subtitle && (
                  <p className="text-xs text-muted mt-0.5">{subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-muted hover:text-ink p-1 rounded-md transition-colors leading-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
