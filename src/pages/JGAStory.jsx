import React, { useState } from "react";
import { CrownIcon, LionIcon } from "@/components/sb688/WarriorCrest";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Music, Mic2, Globe, Users, Zap, Star, BookOpen, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const CHAPTERS = [
  {
    year: "1981",
    title: "Born in Illinois",
    icon: BookOpen,
    color: "#C9A84C",
    text: `John E. Arenz was born on August 21, 1981 in Illinois. From the very beginning, he was wired differently — the kind of kid who took apart every machine in the house just to see what made it tick, and then put it back together better than it was. Growing up in the heartland, surrounded by working people who built things with their hands, John absorbed a foundational truth early: if something carries your name, it better hold.

That Illinois upbringing — Mendota, the small-town grit, the no-shortcuts work ethic — became the bedrock of everything that followed. Not privilege. Not connections. Just an unshakeable instinct for how things are supposed to work, and a refusal to accept when they don't.`
  },
  {
    year: "Early Years",
    title: "The Builder's Instinct",
    icon: Zap,
    color: "#C9A84C",
    text: `Before John ever picked up a guitar or wrote a line of code, he was a builder. Engines, wiring, structures — anything with moving parts that could fail. He didn't study failure in a classroom. He studied it in garages, in shops, in the real world where things break and someone has to fix them before morning.

That hands-on education shaped everything. While other kids were playing video games, John was reverse-engineering how systems actually worked under stress. It wasn't a hobby. It was a compulsion. The question was never "what does it do?" — it was always "what happens when it breaks, and how fast can I bring it back?"

This is where the Brick Stitch concept was born — not in a lab, but in the lived experience of watching systems fail and understanding that the architecture itself had to be the solution.`
  },
  {
    year: "The Music",
    title: "JGA — The Band",
    icon: Music,
    color: "#C9A84C",
    text: `Music hit John the same way engineering did — as a system that either holds or it doesn't. JGA became the outlet for everything he couldn't express in blueprints. Hard-driving original rock, built on groove and intensity, with zero tolerance for filler.

The band wasn't a side project. It was the same philosophy in a different language. A live set is a stress test. The audience is the operator. If the rhythm section breaks, the whole system goes down. So you build redundancy into the arrangement. You offset the load. You make sure every player knows their role and can absorb the hit when something shifts.

JGA's sound is Mendota in every note — blue-collar, honest, and built to last. No covers. No compromise. Original music from a guy who treats a song the same way he treats a server rack: if it can't survive the pressure, it doesn't ship.`
  },
  {
    year: "Jay's Graphic Arts",
    title: "The Business",
    icon: Globe,
    color: "#C9A84C",
    text: `Jay's Graphic Arts started as John's business — a graphic design and printing operation built from scratch in Mendota, IL. No investors. No startup culture. Just a man, his skills, and the willingness to outwork anyone in the room.

The business became the proving ground for everything John believed about systems. Customer management, production workflows, financial tracking, project delivery — every piece of the operation was a system that needed to be resilient. When something broke (and things always break), the question was never "who do we blame?" — it was "how fast do we recover, and how do we make sure it never happens the same way twice?"

Jay's Graphic Arts wasn't just a company. It was the first real-world deployment of the philosophy that would become SB688: build modular, recover fast, prove it worked, and never drift from the standard.`
  },
  {
    year: "Architecture",
    title: "The SB688 Vision",
    icon: Zap,
    color: "#C9A84C",
    text: `The SB688 resilience architecture didn't come from a Silicon Valley think tank. It came from a guy in Mendota, Illinois who had spent his entire life building things that had to work under pressure and rebuilding them when they didn't.

The Brick Stitch geometry — the patented infrastructure pattern — was born from the same instinct that kept John's businesses running when competitors folded: offset the load, stagger the structure, make every piece aware of the whole. A braid that heals. A mesh that doesn't break.

The National Resilience Council direction came from watching critical infrastructure fail — healthcare systems going down, financial networks crashing, government systems exposed — and knowing, from decades of hands-on experience, that the architecture itself was the problem. Not the people. Not the budget. The geometry was wrong. So John built a new one.`
  },
  {
    year: "Now",
    title: "The Living Machine",
    icon: Star,
    color: "#C9A84C",
    text: `Today, John E. Arenz stands at the intersection of everything he's built — music, business, architecture, and the 1211 Sovereign Interface. The SB688 platform isn't software. It's a living machine built through AI-to-AI orchestration, designed to never drift, and controlled by the one key that matters: 1211.

From Mendota, IL to the National Resilience Council. From garage repairs to nuclear-hardened infrastructure. From a kid who took things apart to understand them, to a man who builds systems that protect the systems that matter most.

The mission hasn't changed since August 21, 1981. Build things that hold. Prove they hold. And when they break — because everything breaks — bring them back faster than anyone thought possible, with zero data loss and full integrity.

"If it carries my name, it holds." That's not marketing. That's a life.`
  },
];

const TIMELINE = [
  { year: "1981", event: "Born August 21, 1981 — Mendota, Illinois" },
  { year: "1990s", event: "Grew up building, repairing, and reverse-engineering machines — the foundation of everything" },
  { year: "Early 2000s", event: "Jay's Graphic Arts founded in Mendota, IL — graphic design and print operations built from scratch" },
  { year: "Mid 2000s", event: "JGA band formed — original rock compositions, zero covers, zero compromise" },
  { year: "2010s", event: "First live JGA performances — full original setlist" },
  { year: "2018", event: "JGA music catalog expanded — serious studio development begins" },
  { year: "2021", event: "Brick Stitch architecture concept formalized — 1/2 Offset Spine+Ribs Geometry" },
  { year: "2022", event: "SB688 resilience engine — first working prototype" },
  { year: "2023", event: "National Resilience Council platform direction formalized" },
  { year: "2024", event: "SB688 Universal Console — multi-industry platform deployed" },
  { year: "2025", event: "Cross-sector deployment architecture finalized — 8 industries" },
  { year: "2026", event: "1211 Sovereign Interface launched — JGA Live Rebuild goes public · NODE: MENDOTA-IL" },
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