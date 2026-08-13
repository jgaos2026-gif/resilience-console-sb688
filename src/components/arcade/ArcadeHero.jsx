import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Map, Mail, Zap } from "lucide-react";

const GOLD = "#C9A84C";

function GoldCrown({ size = 32 }) {
  return (
    <svg width={size} height={size * 0.85} viewBox="0 0 50 43" fill="none">
      <polygon points="25,2 31,18 48,18 35,28 40,43 25,33 10,43 15,28 2,18 19,18" fill={GOLD} />
      <polygon points="25,6 30,18 44,18 34,26 38,40 25,31 12,40 16,26 6,18 20,18" fill="#7a5010" opacity="0.45" />
    </svg>
  );
}

// Animated SVG circuit / braid background
function CircuitBg() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="gl1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={GOLD} stopOpacity="0" />
          <stop offset="50%" stopColor={GOLD} stopOpacity="0.35" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Diagonal braided lines */}
      {[0,1,2,3,4,5].map(i => (
        <line key={i}
          x1={`${-10 + i * 22}%`} y1="0%" x2={`${30 + i * 22}%`} y2="100%"
          stroke="url(#gl1)" strokeWidth="1.2" filter="url(#glow)"
          style={{ animation: `pulse ${2.5 + i * 0.4}s ease-in-out infinite alternate` }}
        />
      ))}
      {/* Horizontal circuit ticks */}
      {[15,35,55,75].map((y, i) => (
        <line key={`h${i}`} x1="0%" y1={`${y}%`} x2="100%" y2={`${y}%`}
          stroke={GOLD} strokeWidth="0.4" strokeOpacity="0.08" strokeDasharray="8 20" />
      ))}
      {/* Corner ornaments */}
      <circle cx="5%" cy="5%" r="30" fill="none" stroke={GOLD} strokeWidth="0.6" strokeOpacity="0.15" />
      <circle cx="95%" cy="95%" r="30" fill="none" stroke={GOLD} strokeWidth="0.6" strokeOpacity="0.15" />
      <circle cx="5%" cy="5%" r="18" fill="none" stroke={GOLD} strokeWidth="0.4" strokeOpacity="0.1" />
      <circle cx="95%" cy="95%" r="18" fill="none" stroke={GOLD} strokeWidth="0.4" strokeOpacity="0.1" />
    </svg>
  );
}

export default function ArcadeHero({ onNav }) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 px-4 text-center"
      style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.1) 0%, transparent 70%), hsl(220,22%,4%)" }}>
      <CircuitBg />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        {/* Crown */}
        <div className="flex justify-center">
          <GoldCrown size={48} />
        </div>

        {/* Badge row */}
        <div className="flex justify-center gap-2 flex-wrap">
          <Badge className="text-[9px] border" style={{ background: "rgba(201,168,76,0.1)", color: GOLD, borderColor: "rgba(201,168,76,0.3)" }}>
            JGA ENTERPRISES
          </Badge>
          <Badge className="text-[9px] border" style={{ background: "rgba(201,168,76,0.06)", color: "rgba(201,168,76,0.7)", borderColor: "rgba(201,168,76,0.2)" }}>
            JAY'S GRAPHIC ARTS LLC
          </Badge>
          <Badge className="text-[9px] border" style={{ background: "rgba(74,222,128,0.08)", color: "#4ade80", borderColor: "rgba(74,222,128,0.25)" }}>
            ● INTERACTIVE DEMO
          </Badge>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl sm:text-5xl font-black font-cinzel leading-tight" style={{ color: GOLD }}>
            JGA Sovereign Systems
          </h1>
          <h2 className="text-xl sm:text-3xl font-black font-cinzel mt-1" style={{ color: "rgba(201,168,76,0.7)" }}>
            Demo Arcade
          </h2>
        </div>

        {/* Subtitle */}
        <p className="text-sm sm:text-base font-semibold tracking-wider" style={{ color: "rgba(201,168,76,0.6)" }}>
          Learn the system. Test the logic. Unlock the bricks.
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${GOLD}50,transparent)`, maxWidth: 400, margin: "0 auto" }} />

        {/* Description */}
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          JGA is building a <strong className="text-foreground">verified business ecosystem</strong> where design, automation, memory, modular tools, and proof-based release standards work together. <strong className="text-foreground">Jay's Graphic Arts</strong> is the first public launch lane — funding the larger business system, Oasis, and the modular brick architecture.
        </p>

        {/* Core Rule */}
        <div className="inline-block rounded-xl border px-5 py-3 text-xs font-mono"
          style={{ background: "rgba(201,168,76,0.05)", borderColor: "rgba(201,168,76,0.25)", color: "rgba(201,168,76,0.85)" }}>
          Core Rule: "No active state becomes trusted state without verification, validation, and certification."
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Button onClick={() => onNav("system-map")}
            className="font-bold gap-2 text-sm"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #7a5010)`, color: "#080808" }}>
            <Map className="w-4 h-4" /> Explore System Map
          </Button>
          <Button onClick={() => onNav("verification-game")} variant="outline"
            className="font-bold gap-2 text-sm border-primary/40 text-primary hover:bg-primary/10">
            <Play className="w-4 h-4" /> Play Verification Game
          </Button>
          <Button onClick={() => onNav("braid-builder")} variant="outline"
            className="font-bold gap-2 text-sm"
            style={{ borderColor: "rgba(201,168,76,0.3)", color: "rgba(201,168,76,0.8)" }}>
            <Zap className="w-4 h-4" /> Build a Braid
          </Button>
          <Button asChild variant="outline" className="font-bold gap-2 text-sm border-border text-muted-foreground hover:text-foreground">
            <a href="tel:7793966934"><Mail className="w-4 h-4" /> Contact JGA</a>
          </Button>
        </div>

        {/* Taglines */}
        <div className="flex justify-center gap-6 text-[10px] uppercase tracking-widest pt-2" style={{ color: "rgba(201,168,76,0.4)" }}>
          <span>"Your designs only bolder."</span>
          <span>·</span>
          <span>"Elegance with Consequences."</span>
        </div>
      </div>
    </section>
  );
}