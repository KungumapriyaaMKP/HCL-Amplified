import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoaderOneProps {
  className?: string;
  dotClassName?: string;
}

export const LoaderOne = ({ className, dotClassName }: LoaderOneProps) => {
  return (
    <div className={cn("flex items-center justify-center gap-1.5", className)}>
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className={cn("h-2.5 w-2.5 rounded-full bg-[#7C3AED]", dotClassName)}
          initial={{ x: 0 }}
          animate={{
            x: [0, 8, 0],
            opacity: [0.45, 1, 0.45],
            scale: [0.9, 1.25, 0.9],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default LoaderOne;
