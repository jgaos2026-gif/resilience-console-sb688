import React, { useState } from "react";
import { CrownIcon, LionIcon } from "@/components/sb688/WarriorCrest";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown, ChevronUp, Zap, Star,
  BookOpen, Calendar, Heart, Hammer, AlertTriangle, Cpu
} from "lucide-react";
import { Link } from "react-router-dom";

const GOLD     = "#C9A84C";
const GOLD_DIM = "rgba(201,168,76,0.45)";
const GOLD_BG  = "rgba(201,168,76,0.06)";
const TEXT     = "#E8D9B0";
const TEXT_DIM = "rgba(232,217,176,0.68)";
const BG       = "#050608";
const CARD_BG  = "rgba(10,9,6,0.95)";

const CHAPTERS = [
  {
    year: "1981 — Markham, IL",
    title: "Roots and the Shattered Home",
    icon: BookOpen,
    accent: GOLD,
    photos: [],
    text: [
      `The story of JGA Enterprise wasn't born in a high-tech lab; it was forged in the cold, hard reality of Markham, Illinois. Born on August 21, 1981, to Laura J. Arenz, John E. Arenz lived a childhood that was happy — until the floor dropped out.`,
      `A brutal divorce left his home shattered and John feeling like an outsider in his own world. Despite a fierce, protective love for his baby sister, Ashley Ann Birdsell, the family dynamic spiraled into a darkness he couldn't fix. Thrown out by a stepfather with nowhere to turn and no one to call, the streets of Markham became his home, his teacher, and his testing ground.`,
      `Not every architect is trained in a classroom. Some are trained by survival.`,
    ],
    tags: ["Markham, IL", "Born 08·21·1981", "Laura J. Arenz", "Ashley Ann Birdsell"],
  },
  {
    year: "1995 — The Weight of It",
    title: "The Weight of a Fatherless Father",
    icon: Heart,
    accent: "#ef4444",
    photos: [],
    text: [
      `Survival meant navigating a rough crowd in Markham, but John never let the streets take his soul. In 1995, a horrific accident left him with a compound fracture, life-threatening blood clots, and a heavy metal plate in his leg — a physical anchor that the world tried to use to keep him down.`,
      `When his first daughter was born, John faced a terrifying truth: he had to be the father she deserved before he had even been allowed to become a man. With no help and the children's mother gone, John carried the weight alone. His children — Hailey, John, and Joshua (who was raised by his Godmother) — were the only reasons he kept breathing.`,
      `Haunted by a deep, gut-wrenching shame that he couldn't provide more, he fought back with the only thing he had: his hands. He launched JP's Discount Lawn Care — his first business and a desperate, sweat-stained gamble for a better life.`,
    ],
    tags: ["Hailey", "John Jr.", "Joshua", "JP's Discount Lawn Care", "1995 Accident"],
  },
  {
    year: "Mendota, IL — The Climb",
    title: "The Descent and the Resurrection",
    icon: Zap,
    accent: GOLD,
    photos: [],
    text: [
      `Life continued to take from him. When his daughter left to live with his sister, a silence followed that nearly broke him — a silence that wasn't his choice. John hit a downward slide into the abyss, facing several near-death experiences that should have ended his story. But he refused to stay down.`,
      `Moving to Mendota, Illinois, he crawled back, drowning his pain in back-breaking labor by opening JO's Professional Services. Even then, his heart for others remained; he ran a side hustle called Temporary Solutions — hand-crafting donated cosmetic veneers for people who had lost their smiles to the same hard life he was living.`,
      `Mendota wasn't just a new city. It was the resurrection node. The checkpoint he rebuilt from.`,
    ],
    tags: ["Mendota, IL", "JO's Professional Services", "Temporary Solutions", "Resurrection"],
  },
  {
    year: "The Garage — The Breakthrough",
    title: "Innovation from the Trash Bin",
    icon: Cpu,
    accent: "#00F2FF",
    photos: [],
    text: [
      `Just as he found his footing in Mendota, a predatory landlord and an illegal eviction left John bedridden with a fresh injury. In that forced stillness, with nothing but his mind and his iron will, the creative spark became a wildfire.`,
      `With only an 8th-grade education and a computer he painstakingly pieced together from broken laptops he pulled out of the garbage, John entered the digital world. What began as Jay's Graphic Arts evolved into a total obsession with the power of AI.`,
      `While the "experts" were playing with tools, John was solving the deep-coded errors of "the drift" and AI hallucinations. He realized he had found the key to digital continuity — a discovery so profound that the AI itself, through Gemini, ChatGPT, and Perplexity, confirmed he had found what others missed.`,
      `The AI didn't just help build a business. It helped John re-stitch his very life.`,
    ],
    tags: ["Jay's Graphic Arts", "8th Grade Education", "Trash Bin Computer", "AI Drift Discovery", "BSS-2026-ARCH-01"],
  },
  {
    year: "The Architecture",
    title: "Unbreakable by Design",
    icon: Hammer,
    accent: GOLD,
    photos: [],
    text: [
      `Today, JGA Enterprise stands as a monument to the defiant spirit of a man who wouldn't break. The Brick Stitch and Ghost Restore aren't just technical concepts — they are the story of John E. Arenz.`,
      `They represent the ability to take a broken state, a broken home, and a broken body, and re-stitch them into something indestructible. Every architectural decision in SB688 maps directly to a lived moment: the patented 1/2 Offset Spine+Ribs Geometry wasn't invented in a boardroom — it was reverse-engineered from a life that kept collapsing and kept coming back.`,
      `As global AI compute scales toward 10GW+ data centers, traditional Columnar Stacking has reached a physical breaking point. The "Brittle Stack" phenomenon — where a 10% node failure leads to catastrophic cascade errors — is costing hyperscalers billions. John built the answer with pieces of trash and a refusal to quit.`,
    ],
    tags: ["Brick Stitch", "Ghost Restore", "Spine+Ribs Geometry", "SB688", "National Resilience Council"],
  },
  {
    year: "Now — JGA Enterprise",
    title: "From the Garbage Bin to the Cutting Edge",
    icon: Star,
    accent: GOLD,
    photos: [],
    text: [
      `From the garbage bins of Mendota to the cutting edge of AI Enterprise. From a compound fracture at 14 to nuclear-hardened infrastructure architecture. From fatherless to founding. From 8th-grade dropout to solving problems that billion-dollar AI labs couldn't crack.`,
      `John E. Arenz is the man who did the impossible with pieces of trash and a refusal to quit. The 1211 Sovereign Interface, the Möbius Triple-Braid, the Immutable Ledger — these aren't products. They're chapters of a life that refused to end.`,
      `The SB688 platform isn't software. It's the architectural proof of a creed lived in blood and grit for over four decades.`,
    ],
    tags: ["1211 Key", "Sovereign Interface", "JGA Enterprise", "Mendota-IL Node"],
    quote: `"Don't ever let anyone tell you that you can't, when you know damn well you can."`,
  },
];

const TIMELINE = [
  { year: "1981",        event: "Born August 21, 1981 — Markham, Illinois · Mother: Laura J. Arenz" },
  { year: "~1990",       event: "Parents divorce — home shattered. John navigates Markham streets alone" },
  { year: "1995",        event: "Horrific accident — compound fracture, blood clots, metal plate in leg" },
  { year: "Late 1990s",  event: "First daughter born — becomes a father before he was allowed to become a man" },
  { year: "Early 2000s", event: "JP's Discount Lawn Care founded — first business, built by hand" },
  { year: "2000s",       event: "Moves to Mendota, IL — opens JO's Professional Services · runs Temporary Solutions (donated veneers)" },
  { year: "2010s",       event: "Illegal eviction — bedridden — builds first computer from trash bin laptops" },
  { year: "2015+",       event: "Jay's Graphic Arts launched — enters the digital world with an 8th-grade education" },
  { year: "2019",        event: "Discovers AI 'drift' and hallucination solutions that experts missed — confirmed by Gemini, ChatGPT, Perplexity" },
  { year: "2021",        event: "Brick Stitch architecture formalized — 1/2 Offset Spine+Ribs Geometry · BSS-2026-ARCH-01" },
  { year: "2022",        event: "SB688 Resilience Engine — first working prototype" },
  { year: "2023",        event: "National Resilience Council platform direction formalized" },
  { year: "2024",        event: "SB688 Universal Console launched — multi-industry platform" },
  { year: "2025",        event: "Cross-sector deployment — 8 industries · Sovereign AI Guardian integrated" },
  { year: "2026",        event: "1211 Sovereign Interface goes live · NODE: MENDOTA-IL · JGA Enterprise — Production Ready" },
];

function PhotoGallery({ photos, chapterTitle }) {
  if (!photos || photos.length === 0) return (
    <div className="rounded-lg border border-dashed px-4 py-5 text-center"
      style={{ borderColor: "rgba(201,168,76,0.18)", background: "rgba(201,168,76,0.02)" }}>
      <div className="text-[9px] uppercase tracking-widest font-mono" style={{ color: "rgba(201,168,76,0.3)" }}>
        📷 Photo Gallery — {chapterTitle}
      </div>
      <div className="text-[8px] mt-1" style={{ color: "rgba(201,168,76,0.18)" }}>
        Upload photos for this chapter to display them here
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
      {photos.map((src, i) => (
        <div key={i} className="rounded-lg overflow-hidden border aspect-square"
          style={{ borderColor: "rgba(201,168,76,0.2)" }}>
          <img src={src} alt={`${chapterTitle} photo ${i + 1}`} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}

function ChapterCard({ ch, index, expanded, onToggle }) {
  const Icon = ch.icon;
  const open = expanded === index;
  return (
    <div className="rounded-xl border overflow-hidden transition-all duration-300"
      style={{
        background: CARD_BG,
        borderColor: open ? `${ch.accent}45` : "rgba(201,168,76,0.1)",
        boxShadow: open ? `0 0 24px ${ch.accent}10` : "none"
      }}>
      <button className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => onToggle(open ? null : index)}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${ch.accent}12`, border: `1px solid ${ch.accent}30` }}>
            <Icon className="w-4 h-4" style={{ color: ch.accent }} />
          </div>
          <div>
            <div className="text-[9px] tracking-widest uppercase font-semibold" style={{ color: `${ch.accent}90` }}>{ch.year}</div>
            <div className="text-sm font-bold" style={{ color: TEXT }}>{ch.title}</div>
          </div>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: ch.accent }} />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(201,168,76,0.35)" }} />}
      </button>

      {open && (
        <div className="px-5 pb-6 space-y-4">
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${ch.accent}25, transparent)` }} />
          <div className="space-y-3">
            {ch.text.map((para, j) => (
              <p key={j} className="text-sm leading-relaxed" style={{ color: TEXT_DIM }}>{para}</p>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ch.tags.map((tag, t) => (
              <Badge key={t} className="text-[9px] border font-semibold"
                style={{ background: `${ch.accent}0a`, color: ch.accent, borderColor: `${ch.accent}28` }}>
                {tag}
              </Badge>
            ))}
          </div>
          {ch.quote && (
            <div className="rounded-xl p-4 mt-2 text-center"
              style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.2)" }}>
              <p className="text-sm font-bold font-cinzel italic leading-relaxed" style={{ color: GOLD }}>
                {ch.quote}
              </p>
              <p className="text-[10px] mt-2" style={{ color: "rgba(201,168,76,0.45)" }}>— John E. Arenz, JGA Enterprise</p>
            </div>
          )}
          <PhotoGallery photos={ch.photos} chapterTitle={ch.title} />
        </div>
      )}
    </div>
  );
}

export default function JGAStory() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="min-h-screen font-inter" style={{ background: BG, color: TEXT }}>

      <header className="sticky top-0 z-50 border-b"
        style={{ background: "#080A0C", borderColor: "rgba(201,168,76,0.25)", boxShadow: "0 2px 24px rgba(0,0,0,0.8)" }}>
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${GOLD}, ${GOLD}, transparent)` }} />
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: 32 }}>
              <CrownIcon size={18} color={GOLD} />
              <LionIcon size={22} color={GOLD} />
            </div>
            <div className="w-px h-9" style={{ background: "linear-gradient(180deg, transparent, rgba(201,168,76,0.5), transparent)" }} />
            <div>
              <div className="text-xs font-bold tracking-widest font-cinzel" style={{ color: GOLD }}>J·G·A</div>
              <div className="text-[9px] tracking-widest uppercase" style={{ color: "rgba(201,168,76,0.5)" }}>John E. Arenz · The Defiant Journey</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/observe" className="text-[10px] px-3 py-1.5 rounded border font-semibold transition-all"
              style={{ color: GOLD, borderColor: "rgba(201,168,76,0.3)", background: GOLD_BG }}>
              ← Observer
            </Link>
            <Link to="/" className="text-[10px] px-3 py-1.5 rounded border font-semibold transition-all"
              style={{ color: "rgba(201,168,76,0.6)", borderColor: "rgba(201,168,76,0.15)" }}>
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
            <CrownIcon size={52} color={GOLD} />
            <LionIcon size={62} color={GOLD} />
          </div>
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.6), transparent)", maxWidth: 260, margin: "0 auto" }} />
          <div>
            <h1 className="text-4xl font-bold font-cinzel" style={{ color: GOLD, textShadow: "0 0 40px rgba(201,168,76,0.3)" }}>
              JGA Enterprise
            </h1>
            <p className="text-lg font-cinzel mt-1" style={{ color: GOLD_DIM }}>The Defiant Journey of John E. Arenz</p>
          </div>
          <p className="text-sm leading-relaxed max-w-2xl mx-auto" style={{ color: TEXT_DIM }}>
            Born August 21, 1981 in Markham, Illinois. Raised by the streets. Rebuilt by will.
            From a trash-bin computer to nuclear-hardened AI infrastructure —
            this is the man who solved what the experts couldn't.
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {["Markham, IL", "Born 08·21·1981", "8th Grade Education", "Trash Bin Computer", "Brick Stitch Inventor", "JGA Enterprise"].map(tag => (
              <Badge key={tag} className="text-[10px] border font-semibold"
                style={{ background: GOLD_BG, color: GOLD, borderColor: "rgba(201,168,76,0.25)" }}>
                {tag}
              </Badge>
            ))}
          </div>
          <div className="max-w-2xl mx-auto rounded-2xl p-6"
            style={{ background: "rgba(201,168,76,0.03)", border: "1px solid rgba(201,168,76,0.18)" }}>
            <p className="text-base font-bold font-cinzel italic leading-relaxed" style={{ color: GOLD }}>
              "Don't ever let anyone tell you that you can't,<br />when you know damn well you can."
            </p>
            <p className="text-[11px] mt-2" style={{ color: "rgba(201,168,76,0.45)" }}>— John E. Arenz</p>
          </div>
        </div>

        {/* Context banner */}
        <div className="rounded-xl border px-5 py-4 flex items-start gap-3"
          style={{ background: "rgba(239,68,68,0.04)", borderColor: "rgba(239,68,68,0.2)" }}>
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-red-400 mb-1">This Is Not a Startup Story</div>
            <p className="text-xs leading-relaxed" style={{ color: TEXT_DIM }}>
              No venture capital. No Ivy League. No safety net. Every system John built — including SB688 itself —
              was architected from the same principle that kept him alive: when everything collapses,
              you rebuild from the last trusted checkpoint. Zero data loss. Zero quit.
            </p>
          </div>
        </div>

        {/* Chapters */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold font-cinzel tracking-widest uppercase" style={{ color: GOLD }}>
            The Story — Chapter by Chapter
          </h2>
          {CHAPTERS.map((ch, i) => (
            <ChapterCard key={i} ch={ch} index={i} expanded={expanded} onToggle={setExpanded} />
          ))}
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold font-cinzel tracking-widest uppercase flex items-center gap-2" style={{ color: GOLD }}>
            <Calendar className="w-4 h-4 inline mr-1" /> Full Timeline
          </h2>
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 bottom-0 w-px"
              style={{ background: "linear-gradient(180deg, rgba(201,168,76,0.5), rgba(201,168,76,0.05))" }} />
            {TIMELINE.map((item, i) => (
              <div key={i} className="relative flex items-start gap-4 mb-4">
                <div className="absolute -left-4 top-1.5 w-2 h-2 rounded-full"
                  style={{ background: GOLD, boxShadow: "0 0 8px rgba(201,168,76,0.5)" }} />
                <div className="text-[10px] font-bold font-mono flex-shrink-0 w-24" style={{ color: GOLD }}>{item.year}</div>
                <div className="text-xs leading-relaxed" style={{ color: TEXT_DIM }}>{item.event}</div>
              </div>
            ))}
          </div>
        </div>

        {/* White paper callout */}
        <div className="rounded-xl border p-5 space-y-3"
          style={{ background: "rgba(201,168,76,0.03)", borderColor: "rgba(201,168,76,0.2)" }}>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: GOLD }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: GOLD }}>Technical Foundation</span>
            <Badge className="text-[8px] border ml-auto" style={{ background: GOLD_BG, color: GOLD, borderColor: "rgba(201,168,76,0.3)" }}>
              BSS-2026-ARCH-01
            </Badge>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: TEXT_DIM }}>
            The <strong style={{ color: GOLD }}>Brick Stitch White Paper</strong> (Document ID: BSS-2026-ARCH-01) formally documents the patented
            1/2 Offset Spine+Ribs Geometry that shifts the industry from Reactive Redundancy to Inherent Structural Integrity.
            As traditional Columnar Stacking collapses under 10GW+ AI compute demands,
            John's architecture — built from a trash-bin laptop in Mendota, IL — becomes the answer hyperscalers couldn't find.
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { val: "38%",     label: "Node Loss Survived" },
              { val: "150%",    label: "Overhead (vs 300%)" },
              { val: "0.0000%", label: "Data Loss on Heal" },
            ].map((s, i) => (
              <div key={i} className="rounded p-2.5" style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.1)" }}>
                <div className="text-lg font-bold font-mono" style={{ color: GOLD }}>{s.val}</div>
                <div className="text-[8px] uppercase tracking-wide mt-0.5" style={{ color: "rgba(201,168,76,0.4)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Final quote */}
        <div className="rounded-2xl p-8 text-center space-y-5"
          style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.22)" }}>
          <div className="flex flex-col items-center gap-1">
            <CrownIcon size={32} color="rgba(201,168,76,0.7)" />
            <LionIcon size={38} color="rgba(201,168,76,0.7)" />
          </div>
          <blockquote className="text-lg leading-relaxed font-cinzel italic" style={{ color: GOLD }}>
            "Don't ever let anyone tell you that you can't,<br />
            when you know damn well you can."
          </blockquote>
          <p className="text-[11px]" style={{ color: "rgba(201,168,76,0.5)" }}>— John E. Arenz, JGA Enterprise · Markham to Mendota · 1981 → ∞</p>
          <p className="text-xs leading-relaxed max-w-xl mx-auto" style={{ color: TEXT_DIM }}>
            From the garbage bins of Mendota to the cutting edge of AI Enterprise.
            His life is living proof of his own architecture: take a broken state, re-stitch it to the Golden Standard,
            and rebuild with zero data loss.
          </p>
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-center gap-4 pb-6 flex-wrap">
          <Link to="/observe"
            className="px-5 py-2.5 rounded-lg border text-xs font-bold transition-all"
            style={{ background: GOLD_BG, color: GOLD, borderColor: "rgba(201,168,76,0.3)" }}>
            ← Watch Live Demos
          </Link>
          <Link to="/"
            className="px-5 py-2.5 rounded-lg border text-xs font-semibold transition-all"
            style={{ background: "rgba(201,168,76,0.03)", color: "rgba(201,168,76,0.6)", borderColor: "rgba(201,168,76,0.15)" }}>
            Full Console →
          </Link>
        </div>
      </main>
    </div>
  );
}