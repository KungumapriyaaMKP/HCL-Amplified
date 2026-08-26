import React from "react";
import {
  Sprout,
  Target,
  BrainCircuit,
  Flame,
  Zap,
  Award,
} from "lucide-react";

interface BadgeIconProps {
  icon: string;
  className?: string;
  size?: number;
}

export function BadgeIcon({ icon, className = "w-6 h-6", size }: BadgeIconProps) {
  switch (icon) {
    case "\u{1F331}":
      return <Sprout className={className} size={size} />;
    case "\u{1F3AF}":
      return <Target className={className} size={size} />;
    case "\u{1F9E0}":
      return <BrainCircuit className={className} size={size} />;
    case "\u{1F525}":
      return <Flame className={className} size={size} />;
    case "\u{26A1}":
      return <Zap className={className} size={size} />;
    default:
      return <Award className={className} size={size} />;
  }
}
