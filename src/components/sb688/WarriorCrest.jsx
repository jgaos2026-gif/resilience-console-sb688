import React from "react";

// 5-point heraldic crown SVG
export function CrownIcon({ size = 32, color = "#C9A84C", className = "" }) {
  const s = size;
  return (
    <svg width={s} height={s * 0.72} viewBox="0 0 64 46" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Base band */}
      <rect x="4" y="32" width="56" height="10" rx="3" fill={color} opacity="0.95" />
      {/* Left outer point */}
      <polygon points="4,32 4,8 16,20 24,32" fill={color} opacity="0.85" />
      {/* Left inner point */}
      <polygon points="16,20 24,32 32,10 24,32" fill={color} opacity="0.9" />
      {/* Center top point */}
      <polygon points="24,32 32,10 40,32" fill={color} opacity="0.98" />
      {/* Right inner point */}
      <polygon points="40,32 32,10 40,32 48,20" fill={color} opacity="0.9" />
      {/* Right outer point */}
      <polygon points="48,20 40,32 60,32 60,8" fill={color} opacity="0.85" />
      {/* Gem dots */}
      <circle cx="32" cy="38" r="3" fill="#0a0c10" opacity="0.7" />
      <circle cx="18" cy="38" r="2.2" fill="#0a0c10" opacity="0.6" />
      <circle cx="46" cy="38" r="2.2" fill="#0a0c10" opacity="0.6" />
    </svg>
  );
}

// Heraldic lion SVG (simplified bold silhouette)
export function LionIcon({ size = 36, color = "#C9A84C", className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Body */}
      <ellipse cx="32" cy="42" rx="14" ry="10" fill={color} opacity="0.9" />
      {/* Head */}
      <circle cx="44" cy="28" r="10" fill={color} opacity="0.95" />
      {/* Mane */}
      <circle cx="44" cy="28" r="14" fill={color} opacity="0.3" />
      {/* Tail */}
      <path d="M18 42 Q8 34 10 24 Q12 18 16 22" stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.85" />
      {/* Tail tuft */}
      <circle cx="14" cy="21" r="4" fill={color} opacity="0.7" />
      {/* Front legs */}
      <rect x="28" y="50" width="5" height="10" rx="2.5" fill={color} opacity="0.85" />
      <rect x="36" y="50" width="5" height="10" rx="2.5" fill={color} opacity="0.85" />
      {/* Rear legs */}
      <rect x="18" y="50" width="5" height="9" rx="2.5" fill={color} opacity="0.75" />
      {/* Face detail — eye */}
      <circle cx="47" cy="26" r="2" fill="#0a0c10" opacity="0.8" />
      {/* Face detail — nose */}
      <circle cx="51" cy="30" r="1.2" fill="#0a0c10" opacity="0.5" />
      {/* Whisker lines */}
      <line x1="52" y1="29" x2="60" y2="27" stroke="#0a0c10" strokeWidth="1" opacity="0.4" />
      <line x1="52" y1="31" x2="60" y2="32" stroke="#0a0c10" strokeWidth="1" opacity="0.4" />
      {/* Raised paw */}
      <ellipse cx="54" cy="38" rx="5" ry="4" fill={color} opacity="0.85" />
      {/* Claws */}
      <line x1="51" y1="41" x2="49" y2="44" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="54" y1="42" x2="53" y2="45" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="57" y1="41" x2="57" y2="44" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

// Full crest: crown over lion, for use in header / hero sections
export default function WarriorCrest({ size = "md", className = "" }) {
  const sizes = {
    sm: { crown: 28, lion: 32, gap: "gap-0.5" },
    md: { crown: 40, lion: 46, gap: "gap-1" },
    lg: { crown: 56, lion: 64, gap: "gap-1.5" },
  };
  const s = sizes[size] || sizes.md;
  return (
    <div className={`flex flex-col items-center ${s.gap} ${className}`}>
      <CrownIcon size={s.crown} />
      <LionIcon size={s.lion} />
    </div>
  );
}