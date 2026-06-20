import React, { useState } from "react";

const GOLD = "#C9A84C";

const WHY_CARDS = [
  {
    num: "01",
    title: "Real Story",
    body: "Built from lived experience, not borrowed image. Every system, design, and idea came from real pressure and real work.",
    tag: "VERIFIED NARRATIVE",
    tagColor: "#4ade80",
  },
  {
    num: "02",
    title: "Verified Work",
    body: "Proof, reports, demos, and process matter here. Nothing gets the crown unless it's been shown, tested, and documented.",
    tag: "VERIFIED FACT",
    tagColor: GOLD,
  },
  {
    num: "03",
    title: "Creative Edge",
    body: "Design with flavor, structure, and consequence. Chicago-influenced. Bold enough to stand out. Sharp enough for the boardroom.",
    tag: "BRAND IDENTITY",
    tagColor: "#b0b8c8",
  },
  {
    num: "04",
    title: "Business Discipline",
    body: "Bold visuals, but still professional and client-ready. Elegance with consequences means every move has intention behind it.",
    tag: "BUSINESS POLICY",
    tagColor: GOLD,
  },
  {
    num: "05",
    title: "Learning Built In",
    body: "Visitors don't just look — they learn what each part means. Every label, badge, and system is explained honestly.",
    tag: "DEMO VISUALIZATION",
    tagColor: "#60a5fa",
  },
];

export default function BuiltFromRealLife() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="px-4 sm:px-6 py-8 space-y-10">

      {/* ── Built From Real Life ── */}
      <div className="space-y-6">
        {/* Section header */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}40)` }} />
          <div className="text-center space-y-1">
            <p className="text-[9px] tracking-[0.5em] uppercase" style={{ color: `${GOLD}60` }}>Origin</p>
            <h2 className="text-xl sm:text-2xl font-black font-cinzel" style={{ color: GOLD }}>Built From Real Life</h2>
          </div>
          <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${GOLD}40, transparent)` }} />
        </div>

        {/* Main copy block */}
        <div className="rounded-2xl border p-6 sm:p-8 space-y-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0e0c00, #111111)", borderColor: `${GOLD}28` }}>
          {/* Corner marks */}
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2" style={{ borderColor: `${GOLD}50` }} />
          <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2" style={{ borderColor: `${GOLD}50` }} />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2" style={{ borderColor: `${GOLD}50` }} />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2" style={{ borderColor: `${GOLD}50` }} />

          <div className="space-y-2">
            <p className="text-[9px] tracking-[0.4em] uppercase font-bold" style={{ color: `${GOLD}60` }}>
              From the Founder
            </p>
            <p className="text-sm sm:text-base leading-relaxed font-semibold" style={{ color: "rgba(232,217,176,0.92)" }}>
              JGA is built on work, verification, creativity, survival, and discipline. It is not about pretending. It is about showing the process, proving the work, and building something real.
            </p>
          </div>

          <div className="warrior-divider" />

          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "rgba(201,168,76,0.75)" }}>
            JGA Enterprises was built from the ground up by Jay, a self-taught creator who believes real work should leave evidence. The brand carries an urban Chicago edge, a creative mind, and a business-first standard. This is not fake luxury. This is earned polish. Every design, system, demo, and idea is built to be shown, tested, improved, and verified.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {["Self-Taught", "Chicago Roots", "Verification-First", "Earned — Not Borrowed"].map((tag, i) => (
              <span key={i} className="text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border"
                style={{ borderColor: `${GOLD}30`, color: `${GOLD}80`, background: `${GOLD}08` }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Why It Feels Different ── */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}40)` }} />
          <div className="text-center space-y-1">
            <p className="text-[9px] tracking-[0.5em] uppercase" style={{ color: `${GOLD}60` }}>Identity</p>
            <h2 className="text-xl sm:text-2xl font-black font-cinzel" style={{ color: GOLD }}>Why It Feels Different</h2>
          </div>
          <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${GOLD}40, transparent)` }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {WHY_CARDS.map((card, i) => (
            <button
              key={i}
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="text-left rounded-xl border p-5 space-y-3 transition-all hover:scale-[1.01] block w-full"
              style={{
                background: expanded === i ? `${GOLD}0a` : "linear-gradient(135deg, #0e0c00, #111111)",
                borderColor: expanded === i ? `${GOLD}50` : `${GOLD}18`,
              }}>
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-black font-mono" style={{ color: `${GOLD}40` }}>{card.num}</span>
                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border"
                  style={{ color: card.tagColor, borderColor: `${card.tagColor}40`, background: `${card.tagColor}10` }}>
                  {card.tag}
                </span>
              </div>
              <h3 className="text-sm font-black font-cinzel" style={{ color: GOLD }}>{card.title}</h3>
              <p className="text-[11px] leading-relaxed" style={{ color: expanded === i ? "rgba(232,217,176,0.85)" : "rgba(201,168,76,0.5)" }}>
                {card.body}
              </p>
              <div className="text-[9px] font-bold" style={{ color: `${GOLD}50` }}>
                {expanded === i ? "▲ Less" : "▼ More"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── CTA Strip ── */}
      <div className="rounded-2xl border p-6 text-center space-y-4"
        style={{ background: "linear-gradient(135deg, #0e0c00, #111111)", borderColor: `${GOLD}25` }}>
        <p className="text-[9px] tracking-[0.5em] uppercase" style={{ color: `${GOLD}60` }}>
          JGA Enterprises · Black & Gold · Chicago
        </p>
        <h3 className="text-lg sm:text-xl font-black font-cinzel" style={{ color: GOLD }}>
          Where Bold Design, Verified Systems,<br className="hidden sm:block" /> and Real-Life Discipline Meet.
        </h3>
        <p className="text-xs text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Built with a black-and-gold standard, urban creative energy, and business-ready execution. For people who want work that has presence, proof, and purpose.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {[
            { label: "See the Proof",          href: "/proof-vault" },
            { label: "Explore Demo Council",    href: "#modules" },
            { label: "Start a Project",         href: "/client-portal" },
            { label: "Learn the System",        href: "/system-spine" },
          ].map((cta, i) => (
            <a key={i} href={cta.href}
              className="text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-xl border transition-all hover:opacity-80"
              style={i === 0
                ? { background: `linear-gradient(135deg, ${GOLD}, #8a6018)`, color: "#080808", borderColor: "transparent" }
                : { color: GOLD, borderColor: `${GOLD}35`, background: `${GOLD}08` }}>
              {cta.label}
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}