import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Activity, Eye, CheckCircle2, Zap, Star, ArrowRight, Lock, Layers, Brain, Heart, Database, Radio, Award, ChevronDown, ChevronUp, Building2 } from "lucide-react";

const GOLD = "#C9A84C";
const OE = { fontFamily: "'UnifrakturMaguntia', serif" };

const IMGS = {
  flyer:     "https://media.base44.com/images/public/69d5af52688205fc104c687c/336e66e85_FF2B5757-3BC6-4E14-9251-BF3005F719D7.png",
  logo:      "https://media.base44.com/images/public/69d5af52688205fc104c687c/a27bf93c0_IMG_0843_Original_Original.jpeg",
  sb712:     "https://media.base44.com/images/public/69d5af52688205fc104c687c/cab0b693b_10E06BC3-278A-42DB-9012-1281571C15D8.png",
  founder:   "https://media.base44.com/images/public/69d5af52688205fc104c687c/006aa7b4e_IMG_1321_Original_Original.jpeg",
};

const MODULES = [
  { code: "SB688", name: "Sovereign Stitch Protocol", desc: { simple: "Protects your system by weaving data into a braided structure that can't be silently changed.", tech: "Append-only ledger with SHA-256 hash-chain verification, brick-stitch topology, and triple-mark certification gates.", investor: "Core IP — braided data integrity layer that eliminates single-point-of-failure risks and creates verifiable audit trails." }, icon: Shield, color: "#C9A84C" },
  { code: "SB689", name: "Guarded Runtime Body", desc: { simple: "Keeps the running system safe by watching for unexpected changes in real time.", tech: "Runtime integrity monitor with drift detection, memory guard rails, and automated quarantine triggers.", investor: "Continuous runtime protection — reduces breach dwell time and ensures operational continuity." }, icon: Lock, color: "#60a5fa" },
  { code: "SB712", name: "Sovereign Möbius Runtime", desc: { simple: "A self-checking loop that never stops verifying the system is healthy.", tech: "Infinite-loop verification architecture with Möbius-surface state continuity and checkpoint recovery.", investor: "Always-on verification engine — the system continuously proves its own integrity without manual intervention." }, icon: Radio, color: "#a78bfa" },
  { code: "OMEGA", name: "Omega / V3 Integration Layer", desc: { simple: "Connects all the pieces together into one unified system.", tech: "Orchestration layer binding SB688/689/712 with business logic, memory braid, and node mesh via verified API gates.", investor: "Integration backbone — turns individual modules into a unified, licensable platform." }, icon: Layers, color: "#f59e0b" },
  { code: "JGA-OS", name: "JGA Enterprise OS", desc: { simple: "The business command center for managing clients, orders, contractors, and payments.", tech: "Full business automation suite with deposit policies, watermark controls, contractor routing, and triple-verified payment workflows.", investor: "Revenue engine — handles the full client lifecycle from intake to final delivery with built-in compliance." }, icon: Activity, color: "#22c55e" },
  { code: "AVA", name: "AVA / VERA Assistant Layer", desc: { simple: "AI assistants that help run the business and answer questions safely.", tech: "LLM-powered assistants with verified memory pockets, quarantined responses, and audit-logged interactions.", investor: "AI integration layer — assistants that operate within the verification-first doctrine, not outside it." }, icon: Brain, color: "#ec4899" },
  { code: "PHOENIX", name: "Phoenix Recovery Protocol", desc: { simple: "When something goes wrong, the system finds a safe checkpoint and rebuilds from there.", tech: "Ghost checkpoint location, bad-state isolation, clean-state restoration, ledger update, and trusted-state recertification.", investor: "Self-healing capability — reduces downtime and recovery costs by automating rollback and restoration." }, icon: Heart, color: "#ef4444" },
  { code: "BRAID", name: "Braid Memory / Pocket Loading", desc: { simple: "Memory is organized into verified pockets that are only loaded when trusted.", tech: "66-strand braid architecture with comprehension weave, 22-strand speech branch, cold storage, and RAM guard integration.", investor: "Efficient, verifiable memory architecture — reduces RAM usage while maintaining full audit trail of what's loaded." }, icon: Database, color: "#06b6d4" },
  { code: "TVE", name: "Triple Verification Engine", desc: { simple: "Everything gets checked three times before it becomes trusted.", tech: "Sequential verification → validation → certification pipeline with independent reviewers and rollback on any failure.", investor: "Core differentiator — no state becomes trusted without three independent marks. Creates legally defensible audit trails." }, icon: CheckCircle2, color: "#84cc16" },
  { code: "RAM-G", name: "RAM Guard / Cold Storage Memory", desc: { simple: "Protects the computer's memory and stores unused data safely offline.", tech: "Active memory monitoring with cold-storage offload, pocket verification before load, and guard-rail enforcement.", investor: "Resource optimization layer — reduces operational costs while maintaining security through verified memory management." }, icon: Zap, color: "#f97316" },
];

const VIEW_MODES = ["simple", "tech", "investor"];
const VIEW_LABELS = { simple: "Simple", tech: "Technical", investor: "Investor" };

export default function DemoCouncil() {
  const [viewMode, setViewMode] = useState("simple");
  const [goldRoomOpen, setGoldRoomOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-0" style={{ background: "#060810" }}>

      {/* ══════════════════════════════════════════
          HERO — Full flyer image dominant
      ══════════════════════════════════════════ */}
      <div className="relative overflow-hidden" style={{ minHeight: 640 }}>
        <img src={IMGS.flyer} alt="JGA Enterprises" className="w-full object-cover object-top" style={{ maxHeight: 720, opacity: 0.97 }} />
        {/* bottom fade into page */}
        <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: "linear-gradient(to bottom, transparent, #060810)" }} />
        {/* corner gold accents */}
        <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2" style={{ borderColor: GOLD }} />
        <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2" style={{ borderColor: GOLD }} />
      </div>

      {/* ══════════════════════════════════════════
          URBAN MARQUEE STRIP
      ══════════════════════════════════════════ */}
      <div className="overflow-hidden py-3" style={{ background: `linear-gradient(90deg, #0a0c10, #1a1200, #0a0c10)`, borderTop: `1px solid ${GOLD}40`, borderBottom: `1px solid ${GOLD}40` }}>
        <div className="flex gap-12 whitespace-nowrap animate-marquee text-[11px] font-bold tracking-widest uppercase" style={{ color: GOLD, animation: "marquee 18s linear infinite" }}>
          {["♛ JGA ENTERPRISES", "⬥ ELEGANCE WITH CONSEQUENCES", "♛ BUILT FROM STRUGGLE", "⬥ FUELED BY VISION", "♛ SB688 · SB689 · SB712", "⬥ VERIFICATION FIRST", "♛ ILLINOIS PILOT PHASE 1", "⬥ FROM THE BLOCK TO THE BOARDROOM", "♛ WE BUILD. WE PRINT. WE WIN.", "⬥"].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
          {["♛ JGA ENTERPRISES", "⬥ ELEGANCE WITH CONSEQUENCES", "♛ BUILT FROM STRUGGLE", "⬥ FUELED BY VISION", "♛ SB688 · SB689 · SB712", "⬥ VERIFICATION FIRST"].map((t, i) => (
            <span key={`b${i}`}>{t}</span>
          ))}
        </div>
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>

      {/* ══════════════════════════════════════════
          SPLIT: Logo + Founder quote
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
        {/* Logo left */}
        <div className="relative overflow-hidden" style={{ minHeight: 340 }}>
          <img src={IMGS.logo} alt="Elegance With Consequences" className="w-full h-full object-cover" style={{ minHeight: 340 }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(6,8,16,0.1), rgba(6,8,16,0.55))" }} />
        </div>
        {/* Quote right */}
        <div className="flex flex-col justify-center p-8 space-y-5" style={{ background: "linear-gradient(135deg, #0d0f1a, #1a1200)" }}>
          <div className="text-4xl" style={{ color: GOLD }}>♛</div>
          <h2 className="text-3xl sm:text-4xl leading-tight" style={{ ...OE, color: GOLD, textShadow: "0 0 30px rgba(201,168,76,0.5)" }}>
            JGA Enterprises
          </h2>
          <div className="warrior-divider" />
          <p className="text-base font-cinzel italic leading-relaxed" style={{ color: "rgba(201,168,76,0.85)" }}>
            "This isn't a demo.<br />This is the proof.<br />This is the foundation."
          </p>
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground">
            — Built From Struggle · Fueled By Vision · Engineered To Empower
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <a href="tel:7793966934" className="text-[11px] font-bold px-3 py-1.5 rounded-lg border transition hover:opacity-80" style={{ color: GOLD, borderColor: `${GOLD}40`, background: `${GOLD}0d` }}>📞 779-396-6934</a>
            <a href="mailto:jgaos2026@outlook.com" className="text-[11px] font-bold px-3 py-1.5 rounded-lg border transition hover:opacity-80" style={{ color: GOLD, borderColor: `${GOLD}40`, background: `${GOLD}0d` }}>✉ jgaos2026@outlook.com</a>
            <span className="text-[11px] px-3 py-1.5 rounded-lg border" style={{ color: "rgba(201,168,76,0.5)", borderColor: `${GOLD}20` }}>📍 Mendota, IL</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          KPI STRIP
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px" style={{ background: `${GOLD}20` }}>
        {[
          { label: "Demo Readiness", value: "92%", color: "#4ade80" },
          { label: "Modules Live", value: "10/10", color: GOLD },
          { label: "Proof Records", value: "47", color: "#60a5fa" },
          { label: "Illinois Pilot", value: "Phase 1", color: "#a78bfa" },
        ].map((s, i) => (
          <div key={i} className="p-5 text-center" style={{ background: "#0a0c14" }}>
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">{s.label}</div>
            <div className="text-2xl font-black font-mono" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          SB712 ARCHITECTURE VISUAL — full width
      ══════════════════════════════════════════ */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-12" style={{ background: "linear-gradient(to bottom, #060810, transparent)", zIndex: 2 }} />
        <img src={IMGS.sb712} alt="SB712 Sovereign Möbius Runtime" className="w-full object-cover" style={{ maxHeight: 600, background: "#000", opacity: 0.96 }} />
        <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: "linear-gradient(to top, #060810, transparent)", zIndex: 2 }} />
      </div>

      {/* ══════════════════════════════════════════
          DOCTRINE QUOTE
      ══════════════════════════════════════════ */}
      <div className="text-center px-6 py-8 space-y-2" style={{ background: "#060810" }}>
        <p className="text-[9px] tracking-[0.4em] uppercase text-muted-foreground">System Law</p>
        <p className="text-lg sm:text-2xl font-black font-cinzel" style={{ color: GOLD, textShadow: "0 0 30px rgba(201,168,76,0.4)" }}>
          "No active state becomes trusted state without verification."
        </p>
        <div className="warrior-divider max-w-xs mx-auto mt-3" />
      </div>

      {/* ══════════════════════════════════════════
          COUNCIL BRIEFING — urban card style
      ══════════════════════════════════════════ */}
      <div className="px-4 sm:px-6">
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: `${GOLD}25`, background: "linear-gradient(135deg, #0d0f1a, #120e00)" }}>
          <div className="px-6 pt-6 pb-3 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}60)` }} />
            <h2 className="text-xs font-black tracking-[0.4em] uppercase" style={{ color: GOLD }}>Council Briefing</h2>
            <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${GOLD}60, transparent)` }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 text-xs">
            {[
              { title: "What JGA Is Building", body: "A verification-first business automation platform organizing design services, contractor management, client onboarding, and financial compliance — backed by sovereign runtime architecture." },
              { title: "Why Verification-First", body: "Every payment, upload, and data point enters quarantine before trust. Creates defensible audit trails, reduces disputes, and demonstrates discipline to investors and regulators." },
              { title: "Illinois Pilot Readiness", body: "Phase 1 targets Illinois-only operations with demo council, JGA design intake, client/contractor portals, proof vault, and daily reporting — demo-ready for investor review." },
              { title: "Expansion Roadmap", body: "Phase 2: 5 states. Phase 3: 15 states. Phase 4: All 50 states with full Enterprise OS, AVA/VERA AI integration, and advanced analytics — each phase adding verified modules." },
            ].map((b, i) => (
              <div key={i} className="space-y-1.5 p-4 rounded-xl border" style={{ background: "rgba(0,0,0,0.3)", borderColor: `${GOLD}18` }}>
                <h3 className="font-black text-xs uppercase tracking-wider" style={{ color: GOLD }}>{b.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MODULE CARDS
      ══════════════════════════════════════════ */}
      <div className="px-4 sm:px-6 space-y-4 pt-2 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1 rounded-full" style={{ background: `linear-gradient(180deg, ${GOLD}, transparent)` }} />
            <h2 className="text-sm font-black tracking-widest uppercase" style={{ color: GOLD }}>Core Modules</h2>
          </div>
          <div className="flex gap-1 rounded-xl p-1" style={{ background: "#0d0f1a", border: `1px solid ${GOLD}20` }}>
            {VIEW_MODES.map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                style={viewMode === m
                  ? { background: `linear-gradient(135deg, ${GOLD}, #a07828)`, color: "#0a0c10" }
                  : { color: "rgba(201,168,76,0.4)" }}>
                {VIEW_LABELS[m]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MODULES.map(mod => {
            const Icon = mod.icon;
            return (
              <div key={mod.code}
                className="rounded-xl border p-5 space-y-3 transition-all hover:scale-[1.01]"
                style={{ background: "linear-gradient(135deg, #0d0f1a, #110e00)", borderColor: `${mod.color}22`, boxShadow: `0 0 20px ${mod.color}08` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${mod.color}15`, border: `1px solid ${mod.color}30` }}>
                      <Icon className="w-4 h-4" style={{ color: mod.color }} />
                    </div>
                    <div>
                      <span className="text-[9px] font-black tracking-widest uppercase font-mono" style={{ color: mod.color }}>{mod.code}</span>
                      <h3 className="text-xs font-bold text-foreground leading-tight">{mod.name}</h3>
                    </div>
                  </div>
                  <Badge className="text-[8px] border font-black uppercase" style={{ background: "rgba(34,197,94,0.08)", color: "#4ade80", borderColor: "rgba(34,197,94,0.25)" }}>LIVE</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{mod.desc[viewMode]}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          FOUNDER SPLIT — hip hop portrait style
      ══════════════════════════════════════════ */}
      <div className="relative overflow-hidden mx-4 sm:mx-6 rounded-2xl border" style={{ borderColor: `${GOLD}30` }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
          <div className="relative overflow-hidden" style={{ minHeight: 300 }}>
            <img src={IMGS.founder} alt="JGA Founder" className="w-full h-full object-cover object-top" style={{ minHeight: 300 }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent 60%, #0d0f1a 100%)" }} />
          </div>
          <div className="flex flex-col justify-center p-7 space-y-4" style={{ background: "#0d0f1a" }}>
            <p className="text-[9px] tracking-[0.4em] uppercase" style={{ color: `${GOLD}80` }}>First Live Deployment</p>
            <h3 className="text-xl font-black font-cinzel leading-tight" style={{ color: GOLD }}>
              Jay's Graphic Arts<br />
              <span className="text-sm font-normal text-muted-foreground">The SB Ecosystem — Live In A Real Business</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We're not just building software. We're building it inside a real business, in real time. Testing now. Launching soon. Funding the future.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {["Active Testing", "Real Automation", "AI Integration", "Recovery Systems", "Production Routing", "Phase 1 Live"].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px]">
                  <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: "#4ade80" }} />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          GOLD ROOM
      ══════════════════════════════════════════ */}
      <div className="px-4 sm:px-6 pb-6 pt-2 space-y-4">
        <div className="text-center">
          <Button
            onClick={() => setGoldRoomOpen(!goldRoomOpen)}
            className="px-10 py-3 text-sm font-black uppercase tracking-widest h-auto font-cinzel"
            style={{ background: `linear-gradient(135deg, #C9A84C, #8a6018)`, color: "#0a0c10", boxShadow: "0 0 30px rgba(201,168,76,0.3)" }}
          >
            <Star className="w-4 h-4 mr-2" />
            {goldRoomOpen ? "Close the Gold Room" : "♛ Enter the Gold Room"}
            {goldRoomOpen ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
        </div>

        {goldRoomOpen && (
          <div className="rounded-2xl border-2 p-6 sm:p-8 space-y-6" style={{ borderColor: `${GOLD}50`, background: "linear-gradient(135deg, #0d0f1a 0%, #1a1200 50%, #0d0f1a 100%)", boxShadow: `0 0 60px ${GOLD}15` }}>
            <div className="text-center space-y-2">
              <Badge className="text-[10px] px-4 py-1.5 font-black border uppercase tracking-widest" style={{ background: `${GOLD}15`, color: GOLD, borderColor: `${GOLD}50` }}>♛ THE GOLD ROOM</Badge>
              <h2 className="text-xl font-bold font-cinzel gold-shimmer">Owner Command Summary</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: "System Heartbeat", value: "NOMINAL", sub: "All nodes reporting", color: "#4ade80", icon: Activity },
                { label: "Business Readiness", value: "READY", sub: "Client intake active", color: GOLD, icon: Building2 },
                { label: "Proof Readiness", value: "47 RECORDS", sub: "Vault certified", color: "#60a5fa", icon: Award },
                { label: "Pilot Readiness", value: "PHASE 1", sub: "Illinois demo live", color: "#a78bfa", icon: Eye },
                { label: "Recovery Readiness", value: "ARMED", sub: "Phoenix on standby", color: "#ef4444", icon: Heart },
                { label: "Next Best Action", value: "DEMO", sub: "Run investor walkthrough", color: "#f59e0b", icon: ArrowRight },
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <div key={i} className="rounded-xl border p-4 space-y-2 transition-all hover:scale-[1.02]"
                    style={{ background: "rgba(0,0,0,0.4)", borderColor: `${card.color}25`, boxShadow: `0 0 15px ${card.color}08` }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{card.label}</span>
                      <Icon className="w-4 h-4" style={{ color: card.color }} />
                    </div>
                    <div className="text-lg font-black font-mono" style={{ color: card.color }}>{card.value}</div>
                    <div className="text-[9px] text-muted-foreground">{card.sub}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          BOTTOM BANNER
      ══════════════════════════════════════════ */}
      <div className="text-center py-10 px-6 space-y-3" style={{ background: "linear-gradient(180deg, #060810, #0d0900)", borderTop: `1px solid ${GOLD}25` }}>
        <p className="text-[9px] tracking-[0.5em] uppercase text-muted-foreground">From the Block to the Boardroom</p>
        <h3 className="text-2xl sm:text-4xl font-black font-cinzel gold-shimmer">WE BUILD. WE PRINT. WE WIN.</h3>
        <p className="text-xs font-cinzel" style={{ color: GOLD }}>THIS IS JGA. THIS IS JUST THE BEGINNING.</p>
        <p className="text-[10px] italic text-muted-foreground">DISCIPLINE IS FREEDOM. CONTROL IS POWER. PEACE IS THE GOAL. — JGA</p>
      </div>

    </div>
  );
}