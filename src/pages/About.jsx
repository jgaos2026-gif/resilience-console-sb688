import React from "react";
import { Link } from "react-router-dom";

const GOLD = "#C9A84C";

export default function About() {
  return (
    <div className="min-h-screen" style={{ background: "#080808" }}>
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">

        {/* Header */}
        <div className="space-y-3">
          <p className="text-[10px] tracking-[0.5em] uppercase font-bold" style={{ color: `${GOLD}60` }}>
            About
          </p>
          <h1 className="text-3xl sm:text-4xl font-black font-cinzel leading-tight" style={{ color: GOLD }}>
            About JGA Enterprises
          </h1>
          <div className="h-px max-w-xs" style={{ background: `linear-gradient(90deg, ${GOLD}60, transparent)` }} />
        </div>

        {/* Main description */}
        <div className="rounded-2xl border p-6 sm:p-8 space-y-5"
          style={{ background: "linear-gradient(135deg, #0e0c00, #111111)", borderColor: `${GOLD}28` }}>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "rgba(232,217,176,0.88)" }}>
            JGA Enterprises is a verification-first business automation platform and creative design studio built from the ground up in Mendota, Illinois. The platform combines sovereign runtime architecture — including the SB688 Sovereign Stitch Protocol, SB689 Guarded Runtime Body, and SB712 Sovereign Möbius Runtime — with a full-featured business operating system designed for real-world creative service businesses.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The platform is built for small business owners, creative entrepreneurs, contractors, and investors who need systems that prove their work rather than just claim it. Every feature, every state, and every transaction inside JGA Enterprises must pass through a verified pipeline before it is trusted. This is not corporate marketing language — it is a working doctrine that drives every decision made inside the system.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            JGA Enterprises was built by Jay Arenz, a self-taught creator and systems builder based in Mendota, Illinois. Jay built the platform from limited resources, real business needs, and a commitment to showing the work rather than hiding behind polish. The brand carries a black-and-gold standard, an urban Chicago edge, and a business-first discipline. Jay's Graphic Arts — the design studio operating inside the JGA system — serves clients in branding, logo design, print materials, social media graphics, and custom visual identity.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The system is currently in demo and Phase 1 pilot mode, targeting Illinois-based operations with plans to expand to additional states as the platform matures. Features shown on this site include interactive demos, verified business documentation, daily system reports, client and contractor portals, a proof vault, AI-assisted workflows, and self-healing recovery simulations. Every feature is labeled honestly — verified, demo, simulation, or prototype — so visitors always know exactly what they are looking at.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(201,168,76,0.75)" }}>
            This is not fake luxury. This is earned polish. Proof over promises. Every trusted state earns its mark. Built from the block to the boardroom — Elegance With Consequences.
          </p>
        </div>

        {/* Key facts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Founded", value: "Mendota, IL", sub: "Illinois, USA" },
            { label: "Focus", value: "Design + Systems", sub: "Creative & Automation" },
            { label: "Standard", value: "Verification-First", sub: "Proof before trust" },
          ].map((f, i) => (
            <div key={i} className="rounded-xl border p-4 text-center space-y-1"
              style={{ background: "#0d0c0a", borderColor: `${GOLD}18` }}>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{f.label}</p>
              <p className="text-sm font-black" style={{ color: GOLD }}>{f.value}</p>
              <p className="text-[10px] text-muted-foreground">{f.sub}</p>
            </div>
          ))}
        </div>

        {/* Nav links */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Link to="/"
            className="text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-xl border transition hover:opacity-80"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #8a6018)`, color: "#080808", borderColor: "transparent" }}>
            ← Back to Demo Council
          </Link>
          <Link to="/contact"
            className="text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-xl border transition hover:opacity-80"
            style={{ color: GOLD, borderColor: `${GOLD}35`, background: `${GOLD}08` }}>
            Contact Us →
          </Link>
        </div>

      </div>
    </div>
  );
}