import React, { useState } from "react";
import { CrownIcon, LionIcon } from "@/components/sb688/WarriorCrest";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Music, Mic2, Globe, Users, Zap, Star, BookOpen, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const CHAPTERS = [
  {
    year: "Origin",
    title: "Before the Band",
    icon: BookOpen,
    color: "#C9A84C",
    text: `John Arenz didn't start as a musician. He started as a builder — someone who took broken things apart to understand why they failed, and then rebuilt them better. That instinct for systems, for structure, for finding the integrity underneath the noise — that's the foundation everything else grew from.

Before JGA was a band, it was a philosophy: that what you build should be honest, resilient, and worth standing behind. That the work should hold up under pressure. That failure isn't the end — it's the diagnostic.`
  },
  {
    year: "Formation",
    title: "The JGA Sound",
    icon: Music,
    color: "#C9A84C",
    text: `JGA — John Arenz's musical project — fuses hard-driving original rock with the kind of architectural thinking that runs through everything John touches. The name isn't a brand. It's a signature. Everything that carries JGA on it is built with the same standard: if it's worth making, it's worth making right.

The sound is unapologetically original. Built on groove, driven by intensity, and structured around the idea that a band — like a resilient system — is only as strong as its weakest link. Which is why every link gets tested.`
  },
  {
    year: "The Stage",
    title: "Live & Loud",
    icon: Mic2,
    color: "#C9A84C",
    text: `JGA's live performances are built the same way the SB688 architecture is built — no single point of failure, every piece doing its job, and when something goes wrong (because it always can), the system keeps moving. That's not a backup plan. That's the plan.

Live shows aren't a pitch. They're proof of concept. You don't explain resilience. You demonstrate it. Same principle applies on stage as it does in a server rack: the audience (or the operator) should never have to wonder if it's going to hold.`
  },
  {
    year: "Architecture",
    title: "Music Meets Engineering",
    icon: Zap,
    color: "#C9A84C",
    text: `The JGA band and the JGA architecture share more than initials. Both are built around the same design principles: redundancy without waste, integrity without bureaucracy, and recovery without pretending the failure didn't happen.

The Brick Stitch geometry — the patented infrastructure architecture John developed — came from the same intuition that makes a rhythm section hold together under pressure: offset the load, stagger the structure, and make every piece aware of the whole. A braid that heals. A mesh that doesn't break. A band that keeps playing.`
  },
  {
    year: "Now",
    title: "The National Resilience Council",
    icon: Globe,
    color: "#C9A84C",
    text: `SB688 and the National Resilience Council represent John's most ambitious build to date — a cross-sector resilience platform designed to protect the systems that matter most: healthcare, defense, finance, infrastructure, government.

The same obsessive attention to proof, to honest disclosure, to building things that work under pressure — all of it flows directly from the same source as the music. JGA isn't two different things. It's one person building, in every medium available, toward the same standard: if it carries my name, it holds.`
  },
  {
    year: "Mission",
    title: "What JGA Stands For",
    icon: Star,
    color: "#C9A84C",
    text: `"Build systems where elegance serves consequence. Where the interface tells the truth. Where recovery is not a hope — it is a mechanism. Where proof is not a promise — it is a test you can run."

That's the JGA standard. Applied to music. Applied to infrastructure. Applied to every room we walk into and every system we touch. The name is the warranty.`
  },
];

const TIMELINE = [
  { year: "2018", event: "JGA — first original compositions written" },
  { year: "2019", event: "First live performances — original setlist only" },
  { year: "2021", event: "Brick Stitch architecture concept developed" },
  { year: "2022", event: "SB688 resilience engine — first prototype" },
  { year: "2023", event: "National Resilience Council direction formalized" },
  { year: "2024", event: "SB688 Universal Console — multi-industry platform launch" },
  { year: "2025", event: "Cross-sector deployment architecture finalized" },
  { year: "2026", event: "JGA Live Rebuild — public demo console launched" },
];

export default function JGAStory() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="min-h-screen font-inter" style={{ background: "#050608", color: "#E8D9B0" }}>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ background: "#080A0C", borderColor: "rgba(201,168,76,0.25)", boxShadow: "0 2px 24px rgba(0,0,0,0.8)" }}>
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #C9A84C, #C9A84C, transparent)" }} />
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center" style={{ width: 32 }}>
              <CrownIcon size={18} color="#C9A84C" />
              <LionIcon size={22} color="#C9A84C" />
            </div>
            <div className="w-px h-9" style={{ background: "linear-gradient(180deg, transparent, rgba(201,168,76,0.5), transparent)" }} />
            <div>
              <div className="text-xs font-bold tracking-widest font-cinzel" style={{ color: "#C9A84C" }}>J·G·A</div>
              <div className="text-[9px] tracking-widest uppercase" style={{ color: "rgba(201,168,76,0.5)" }}>John Arenz · The Story</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/observe" className="text-[10px] px-3 py-1.5 rounded border font-semibold transition-all"
              style={{ color: "#C9A84C", borderColor: "rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.06)" }}>
              ← Observer
            </Link>
            <Link to="/" className="text-[10px] px-3 py-1.5 rounded border font-semibold transition-all"
              style={{ color: "rgba(201,168,76,0.6)", borderColor: "rgba(201,168,76,0.15)", background: "rgba(201,168,76,0.03)" }}>
              Console
            </Link>
          </div>
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)" }} />
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-12">

        {/* Hero */}
        <div className="text-center space-y-5">
          <div className="flex flex-col items-center gap-2">
            <CrownIcon size={52} color="#C9A84C" />
            <LionIcon size={62} color="#C9A84C" />
          </div>
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.6), transparent)", maxWidth: 240, margin: "0 auto" }} />
          <h1 className="text-4xl font-bold font-cinzel" style={{ color: "#C9A84C", textShadow: "0 0 40px rgba(201,168,76,0.3)" }}>
            John Arenz · JGA
          </h1>
          <p className="text-sm leading-relaxed max-w-xl mx-auto" style={{ color: "rgba(232,217,176,0.7)" }}>
            Builder. Musician. Architect. The story behind the band, the system, and the standard.
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {["Original Rock", "Resilience Architecture", "National Resilience Council", "Brick Stitch System"].map(tag => (
              <Badge key={tag} className="text-[10px] border font-semibold"
                style={{ background: "rgba(201,168,76,0.08)", color: "#C9A84C", borderColor: "rgba(201,168,76,0.25)" }}>
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Chapter Cards */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold font-cinzel tracking-widest uppercase" style={{ color: "#C9A84C" }}>The Story</h2>
          {CHAPTERS.map((ch, i) => {
            const Icon = ch.icon;
            const open = expanded === i;
            return (
              <div key={i} className="rounded-xl border overflow-hidden"
                style={{ background: "rgba(12,10,6,0.9)", borderColor: open ? "rgba(201,168,76,0.4)" : "rgba(201,168,76,0.12)" }}>
                <button className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setExpanded(open ? null : i)}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}>
                      <Icon className="w-4 h-4" style={{ color: "#C9A84C" }} />
                    </div>
                    <div>
                      <div className="text-[9px] tracking-widest uppercase font-semibold" style={{ color: "rgba(201,168,76,0.5)" }}>{ch.year}</div>
                      <div className="text-sm font-bold" style={{ color: "#E8D9B0" }}>{ch.title}</div>
                    </div>
                  </div>
                  {open
                    ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "#C9A84C" }} />
                    : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(201,168,76,0.4)" }} />}
                </button>
                {open && (
                  <div className="px-5 pb-5">
                    <div style={{ height: 1, background: "rgba(201,168,76,0.1)", marginBottom: 16 }} />
                    {ch.text.split("\n\n").map((para, j) => (
                      <p key={j} className="text-sm leading-relaxed mb-3" style={{ color: "rgba(232,217,176,0.75)" }}>
                        {para}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold font-cinzel tracking-widest uppercase" style={{ color: "#C9A84C" }}>
            <Calendar className="w-4 h-4 inline mr-2" />Timeline
          </h2>
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 bottom-0 w-px" style={{ background: "linear-gradient(180deg, rgba(201,168,76,0.4), rgba(201,168,76,0.05))" }} />
            {TIMELINE.map((item, i) => (
              <div key={i} className="relative flex items-start gap-4 mb-4">
                <div className="absolute -left-4 top-1 w-2 h-2 rounded-full" style={{ background: "#C9A84C", boxShadow: "0 0 8px rgba(201,168,76,0.5)" }} />
                <div className="text-[10px] font-bold font-mono flex-shrink-0 w-10" style={{ color: "#C9A84C" }}>{item.year}</div>
                <div className="text-xs leading-relaxed" style={{ color: "rgba(232,217,176,0.65)" }}>{item.event}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission quote */}
        <div className="rounded-2xl p-8 text-center space-y-4"
          style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.2)" }}>
          <CrownIcon size={28} color="rgba(201,168,76,0.6)" />
          <blockquote className="text-base leading-relaxed font-cinzel italic" style={{ color: "#C9A84C" }}>
            "Build systems where elegance serves consequence. Where the interface tells the truth. Where recovery is not a hope — it is a mechanism."
          </blockquote>
          <p className="text-[11px]" style={{ color: "rgba(201,168,76,0.5)" }}>— John Arenz, J.G.A.</p>
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-center gap-4 pb-6 flex-wrap">
          <Link to="/observe"
            className="px-5 py-2.5 rounded-lg border text-xs font-bold transition-all"
            style={{ background: "rgba(201,168,76,0.08)", color: "#C9A84C", borderColor: "rgba(201,168,76,0.3)" }}>
            ← Watch Live Demos
          </Link>
          <Link to="/"
            className="px-5 py-2.5 rounded-lg border text-xs font-semibold transition-all"
            style={{ background: "rgba(201,168,76,0.04)", color: "rgba(201,168,76,0.6)", borderColor: "rgba(201,168,76,0.15)" }}>
            Full Console →
          </Link>
        </div>
      </main>
    </div>
  );
}