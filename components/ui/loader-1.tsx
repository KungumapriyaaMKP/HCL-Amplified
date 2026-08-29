"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface LoaderProps {
  className?: string;
  size?: number | string;
  label?: string;
}

export function PencilLoader({ className, size = 120, label }: LoaderProps) {
  const numericSize = typeof size === "number" ? size : 120;

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 p-4", className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height={`${numericSize}px`}
        width={`${numericSize}px`}
        viewBox="0 0 200 200"
        className="pencil"
      >
        <defs>
          <clipPath id="pencil-eraser">
            <rect height="30" width="30" ry="5" rx="5" />
          </clipPath>
        </defs>
        <circle
          transform="rotate(-113,100,100)"
          strokeLinecap="round"
          strokeDashoffset="439.82"
          strokeDasharray="439.82 439.82"
          strokeWidth="2"
          stroke="currentColor"
          fill="none"
          r="70"
          className="pencil__stroke text-[#7C3AED]"
        />
        <g transform="translate(100,100)" className="pencil__rotate">
          <g fill="none">
            <circle
              transform="rotate(-90)"
              strokeDashoffset="402"
              strokeDasharray="402.12 402.12"
              strokeWidth="30"
              stroke="hsl(265,90%,50%)"
              r="64"
              className="pencil__body1"
            />
            <circle
              transform="rotate(-90)"
              strokeDashoffset="465"
              strokeDasharray="464.96 464.96"
              strokeWidth="10"
              stroke="hsl(265,90%,65%)"
              r="74"
              className="pencil__body2"
            />
            <circle
              transform="rotate(-90)"
              strokeDashoffset="339"
              strokeDasharray="339.29 339.29"
              strokeWidth="10"
              stroke="hsl(265,90%,40%)"
              r="54"
              className="pencil__body3"
            />
          </g>
          <g transform="rotate(-90) translate(49,0)" className="pencil__eraser">
            <g className="pencil__eraser-skew">
              <rect height="30" width="30" ry="5" rx="5" fill="hsl(330,85%,65%)" />
              <rect clipPath="url(#pencil-eraser)" height="30" width="5" fill="hsl(330,85%,55%)" />
              <rect height="20" width="30" fill="hsl(223,10%,90%)" />
              <rect height="20" width="15" fill="hsl(223,10%,70%)" />
              <rect height="20" width="5" fill="hsl(223,10%,80%)" />
              <rect height="2" width="30" y="6" fill="hsla(223,10%,10%,0.2)" />
              <rect height="2" width="30" y="13" fill="hsla(223,10%,10%,0.2)" />
            </g>
          </g>
          <g transform="rotate(-90) translate(49,-30)" className="pencil__point">
            <polygon points="15 0,30 30,0 30" fill="hsl(33,90%,70%)" />
            <polygon points="15 0,6 30,0 30" fill="hsl(33,90%,50%)" />
            <polygon points="15 0,20 10,10 10" fill="hsl(223,10%,10%)" />
          </g>
        </g>
      </svg>
      {label && (
        <p className="text-xs font-semibold text-slate-500 animate-pulse tracking-wide">{label}</p>
      )}
    </div>
  );
}

export const Component = PencilLoader;
export default PencilLoader;
