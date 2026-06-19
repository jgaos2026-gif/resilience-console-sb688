import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Shield, Activity, Eye, CheckCircle2, Zap, Star, ArrowRight,
  Lock, Layers, Brain, Heart, Database, Radio, Award,
  ChevronDown, ChevronUp, Building2, Info
} from "lucide-react";
import ProofBadge from "@/components/jga/ProofBadge";
import VerifiedBusinessProof from "@/components/jga/VerifiedBusinessProof";

const GOLD = "#C9A84C";
const OE = { fontFamily: "'UnifrakturMaguntia', serif" };

/* ── Gold Five-Point Crown SVG ───────────────────────────────────── */
function GoldCrown({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="20,2 25,14 38,14 28,22 32,34 20,26 8,34 12,22 2,14 15,14" fill={GOLD} />
      <polygon points="20,5 24,14 35,14 27,21 30,31 20,24 10,31 13,21 5,14 16,14" fill="#a07828" opacity="0.4" />
    </svg>
  );
}

/* Certification Stamp */
function CrownStamp({ label = "CERTIFIED", size = "md" }) {
  const s = size === "lg" ? 40 : size === "sm" ? 18 : 28;
  return (
    <div className="inline-flex flex-col items-center gap-0.5">
      <GoldCrown size={s} />
      <span className="text-[7px] font-black tracking-[0.3em] uppercase" style={{ color: GOLD }}>{label}</span>
    </div>
  );
}

const IMGS = {
  flyer:   "https://media.base44.com/images/public/69d5af52688205fc104c687c/336e66e85_FF2B5757-3BC6-4E14-9251-BF3005F719D7.png",
  logo:    "https://media.base44.com/images/public/69d5af52688205fc104c687c/a27bf93c0_IMG_0843_Original_Original.jpeg",
  sb712:   "https://media.base44.com/images/public/69d5af52688205fc104c687c/cab0b693b_10E06BC3-278A-42DB-9012-1281571C15D8.png",
  founder: "https://media.base44.com/images/public/69d5af52688205fc104c687c/006aa7b4e_IMG_1321_Original_Original.jpeg",
};

const MODULES = [
  {
    code: "SB688", name: "Sovereign Stitch Protocol", path: "/system-spine",
    proofStatus: "DEMO_VISUALIZATION",
    proofNote: "Interactive simulation available. Live backend connection and signed deployment not yet in production.",
    desc: {
      simple: "Protects your system by weaving data into a braided structure that can't be silently changed.",
      tech: "Append-only ledger with SHA-256 hash-chain verification, brick-stitch topology, and triple-mark certification gates.",
      investor: "Core IP — braided data integrity layer that eliminates single-point-of-failure risks and creates verifiable audit trails.",
    },
    icon: Shield, color: GOLD,
  },
  {
    code: "SB689", name: "Guarded Runtime Body", path: "/node-mesh",
    proofStatus: "NEEDS_TECH_VALIDATION",
    proofNote: "Runtime drift detection is visualized in the demo. Full watchdog integration requires live backend deployment.",
    desc: {
      simple: "Keeps the running system safe by watching for unexpected changes in real time.",
      tech: "Runtime integrity monitor with drift detection, memory guard rails, and automated quarantine triggers.",
      investor: "Continuous runtime protection — reduces breach dwell time and ensures operational continuity.",
    },
    icon: Lock, color: "#b0b8c8",
  },
  {
    code: "SB712", name: "Sovereign Möbius Runtime", path: "/self-healing",
    proofStatus: "DEMO_VISUALIZATION",
    proofNote: "Architecture diagram and simulation available. Loop verification logic shown conceptually — not in live production.",
    desc: {
      simple: "A self-checking loop that never stops verifying the system is healthy.",
      tech: "Infinite-loop verification architecture with Möbius-surface state continuity and checkpoint recovery.",
      investor: "Always-on verification engine — continuously proves its own integrity without manual intervention.",
    },
    icon: Radio, color: "#b08840",
  },
  {
    code: "OMEGA", name: "Omega / V3 Integration Layer", path: "/system-spine",
    proofStatus: "NEEDS_TECH_VALIDATION",
    proofNote: "Orchestration layer designed and documented. Full API gate wiring requires live backend and security review.",
    desc: {
      simple: "Connects all the pieces together into one unified system.",
      tech: "Orchestration layer binding SB688/689/712 with business logic, memory braid, and node mesh via verified API gates.",
      investor: "Integration backbone — turns individual modules into a unified, licensable platform.",
    },
    icon: Layers, color: "#c8a840",
  },
  {
    code: "JGA-OS", name: "JGA Enterprise OS", path: "/business-os",
    proofStatus: "DEMO_VISUALIZATION",
    proofNote: "Business OS dashboard is live in demo mode. Payment processor, email automation, and final billing require external integration.",
    desc: {
      simple: "The business command center for managing clients, orders, contractors, and payments.",
      tech: "Full business automation suite with deposit policies, watermark controls, contractor routing, and triple-verified payment workflows.",
      investor: "Revenue engine — handles the full client lifecycle from intake to final delivery with built-in compliance.",
    },
    icon: Activity, color: "#c8a840",
  },
  {
    code: "AVA", name: "AVA / VERA Assistant Layer", path: "/business-os",
    proofStatus: "NEEDS_TECH_VALIDATION",
    proofNote: "LLM calls demonstrated. Persistent memory pockets with verified load/unload require live backend agent runtime.",
    desc: {
      simple: "AI assistants that help run the business and answer questions safely.",
      tech: "LLM-powered assistants with verified memory pockets, quarantined responses, and audit-logged interactions.",
      investor: "AI integration layer — assistants that operate within the verification-first doctrine, not outside it.",
    },
    icon: Brain, color: "#a08060",
  },
  {
    code: "PHOENIX", name: "Phoenix Recovery Protocol", path: "/self-healing",
    proofStatus: "SIMULATION",
    proofNote: "Phoenix rollback shown as a simulation. Real deployment requires live checkpoint storage and backend integration.",
    desc: {
      simple: "When something goes wrong, the system finds a safe checkpoint and rebuilds from there.",
      tech: "Ghost checkpoint location, bad-state isolation, clean-state restoration, ledger update, and trusted-state recertification.",
      investor: "Self-healing capability — reduces downtime and recovery costs by automating rollback and restoration.",
    },
    icon: Heart, color: "#b04040",
  },
  {
    code: "BRAID", name: "Braid Memory / Pocket Loading", path: "/memory-braid",
    proofStatus: "DEMO_VISUALIZATION",
    proofNote: "Memory braid visualization available. Cold storage offload and RAM guard require live system integration.",
    desc: {
      simple: "Memory is organized into verified pockets that are only loaded when trusted.",
      tech: "66-strand braid architecture with comprehension weave, 22-strand speech branch, cold storage, and RAM guard integration.",
      investor: "Efficient, verifiable memory architecture — reduces RAM usage while maintaining full audit trail of what's loaded.",
    },
    icon: Database, color: "#406090",
  },
  {
    code: "TVE", name: "Triple Verification Engine", path: "/verification-gates",
    proofStatus: "DEMO_VISUALIZATION",
    proofNote: "Three-gate pipeline shown interactively. Live independent reviewer integration and rollback require backend deployment.",
    desc: {
      simple: "Everything gets checked three times before it becomes trusted.",
      tech: "Sequential verification → validation → certification pipeline with independent reviewers and rollback on any failure.",
      investor: "Core differentiator — no state becomes trusted without three independent marks. Legally defensible audit trails.",
    },
    icon: CheckCircle2, color: "#608040",
  },
  {
    code: "RAM-G", name: "RAM Guard / Cold Storage Memory", path: "/memory-braid",
    proofStatus: "NEEDS_TECH_VALIDATION",
    proofNote: "Concept demonstrated in memory braid visualization. Active RAM monitoring requires live OS-level integration.",
    desc: {
      simple: "Protects the computer's memory and stores unused data safely offline.",
      tech: "Active memory monitoring with cold-storage offload, pocket verification before load, and guard-rail enforcement.",
      investor: "Resource optimization — reduces operational costs while maintaining security through verified memory management.",
    },
    icon: Zap, color: "#906030",
  },
];

const VIEW_MODES = ["simple", "tech", "investor"];
const VIEW_LABELS = { simple: "Simple View", tech: "Technical", investor: "Investor" };

/* Verification flow step */
function FlowStep({ label, certified, active }) {
  return (
    <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border text-center transition-all ${active ? "scale-105" : ""}`}
      style={{
        background: certified ? `${GOLD}12` : active ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.3)",
        borderColor: certified ? `${GOLD}50` : active ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)",
        minWidth: 80,
      }}>
      {certified
        ? <GoldCrown size={20} />
        : <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: active ? GOLD : "rgba(255,255,255,0.2)" }}>
            {active && <div className="w-2 h-2 rounded-full" style={{ background: GOLD }} />}
          </div>
      }
      <span className="text-[8px] font-black uppercase tracking-wider leading-tight"
        style={{ color: certified ? GOLD : active ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)" }}>
        {label}
      </span>
    </div>
  );
}

export default function DemoCouncil() {
  const [viewMode, setViewMode] = useState("simple");
  const [goldRoomOpen, setGoldRoomOpen] = useState(false);
  const [flowStep, setFlowStep] = useState(0);

  const FLOW = ["Unknown State", "Quarantine", "Verification", "Validation", "Certification", "Trusted State ♛"];

  return (
    <div className="max-w-6xl mx-auto space-y-0" style={{ background: "#080808" }}>

      {/* ════ GLOBAL FACT-AWARENESS BANNER ════ */}
      <div className="px-4 py-2 text-center text-[9px] font-bold tracking-widest uppercase border-b"
        style={{ background: "#0e0c00", borderColor: `${GOLD}25`, color: `${GOLD}80` }}>
        Proof over promises · Every trusted state earns its mark · Certified before trusted
      </div>

      {/* ════ HERO ════ */}
      <div className="relative overflow-hidden" style={{ minHeight: 620 }}>
        <img src={IMGS.flyer} alt="JGA Enterprises" className="w-full object-cover object-top" style={{ maxHeight: 700, opacity: 0.95 }} />
        <div className="absolute bottom-0 left-0 right-0 h-40" style={{ background: "linear-gradient(to bottom, transparent, #080808)" }} />
        <div className="absolute top-0 left-0 w-14 h-14 border-l-2 border-t-2" style={{ borderColor: GOLD }} />
        <div className="absolute top-0 right-0 w-14 h-14 border-r-2 border-t-2" style={{ borderColor: GOLD }} />
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          <ProofBadge
            status="OWNER_CLAIM"
            proof="Physical flyer and brand assets uploaded to Proof Vault"
            missing="Notarized brand registration"
            note="This brand image is founder-owned. Asset continuity demonstrated — not a guaranteed legal trademark claim."
            updated="June 2026"
            compact
          />
        </div>
      </div>

      {/* ════ MARQUEE ════ */}
      <div className="overflow-hidden py-3" style={{
        background: "linear-gradient(90deg, #080808, #120e00, #080808)",
        borderTop: `1px solid ${GOLD}35`,
        borderBottom: `1px solid ${GOLD}35`,
      }}>
        <div className="flex gap-12 whitespace-nowrap text-[11px] font-bold tracking-widest uppercase" style={{ color: GOLD, animation: "marquee 20s linear infinite" }}>
          {["★ JGA ENTERPRISES", "· ELEGANCE WITH CONSEQUENCES", "★ PROOF OVER PROMISES", "· FROM THE BLOCK TO THE BOARDROOM", "★ VERIFIED BEFORE TRUSTED", "· BLACK AND GOLD", "★ CERTIFIED WITH THE FIVE-POINT CROWN", "· YOUR DESIGN, ONLY BOLDER", "★ SB688 · SB689 · SB712", "·"].map((t, i) => <span key={i}>{t}</span>)}
          {["★ JGA ENTERPRISES", "· ELEGANCE WITH CONSEQUENCES", "★ PROOF OVER PROMISES", "· FROM THE BLOCK TO THE BOARDROOM"].map((t, i) => <span key={`b${i}`}>{t}</span>)}
        </div>
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>

      {/* ════ VERIFIED BUSINESS PROOF ════ */}
      <div className="px-4 sm:px-6 py-4">
        <VerifiedBusinessProof />
      </div>

      {/* ════ LOGO + CONTACT SPLIT ════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
        <div className="relative overflow-hidden" style={{ minHeight: 340 }}>
          <img src={IMGS.logo} alt="Elegance With Consequences" className="w-full h-full object-cover" style={{ minHeight: 340 }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(8,8,8,0.05), rgba(8,8,8,0.55))" }} />
          <div className="absolute bottom-3 left-3">
            <ProofBadge status="VERIFIED_FACT" proof="Uploaded brand image in Proof Vault" missing="None for visual identity" note="This proves brand asset continuity." compact />
          </div>
        </div>
        <div className="flex flex-col justify-center p-8 space-y-5" style={{ background: "linear-gradient(135deg, #0e0c00, #111111)" }}>
          <GoldCrown size={36} />
          <h2 className="text-3xl sm:text-4xl leading-tight" style={{ ...OE, color: GOLD, textShadow: "0 0 28px rgba(201,168,76,0.45)" }}>
            JGA Enterprises
          </h2>
          <div className="warrior-divider" />
          <p className="text-base font-cinzel italic leading-relaxed" style={{ color: "rgba(201,168,76,0.85)" }}>
            "This isn't a demo.<br />This is the proof.<br />This is the foundation."
          </p>
          <p className="text-[9px] tracking-widest uppercase text-muted-foreground">
            Built From Pressure · Grounded In Proof · Certified Before Trusted
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <a href="tel:7793966934" className="text-[11px] font-bold px-3 py-1.5 rounded-lg border transition hover:opacity-75"
              style={{ color: GOLD, borderColor: `${GOLD}40`, background: `${GOLD}10` }}>📞 779-396-6934</a>
            <a href="mailto:jgaos2026@outlook.com" className="text-[11px] font-bold px-3 py-1.5 rounded-lg border transition hover:opacity-75"
              style={{ color: GOLD, borderColor: `${GOLD}40`, background: `${GOLD}10` }}>✉ jgaos2026@outlook.com</a>
            <span className="text-[11px] px-3 py-1.5 rounded-lg border"
              style={{ color: "rgba(201,168,76,0.45)", borderColor: `${GOLD}18` }}>📍 Mendota, IL</span>
          </div>
          <ProofBadge
            status="OWNER_CLAIM"
            proof="Founder narrative, phone, and email on record"
            missing="Full business registration document upload"
            note="This contact info is founder-provided. Treat as narrative context unless connected to a verified proof record."
            updated="June 2026"
          />
        </div>
      </div>

      {/* ════ KPI STRIP ════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px" style={{ background: `${GOLD}18` }}>
        {[
          { label: "Demo Readiness",  value: "92%",      color: "#4ade80", note: "DEMO VISUALIZATION" },
          { label: "Modules Active",  value: "10 / 10",  color: GOLD,      note: "DEMO VISUALIZATION" },
          { label: "Proof Records",   value: "47",        color: "#b0b8c8", note: "VERIFIED FACT" },
          { label: "Illinois Pilot",  value: "Phase 1",  color: GOLD,      note: "INVESTOR PROJECTION" },
        ].map((s, i) => (
          <div key={i} className="p-5 text-center" style={{ background: "#0d0c0a" }}>
            <div className="text-[8px] uppercase tracking-widest text-muted-foreground mb-1">{s.label}</div>
            <div className="text-2xl font-black font-mono" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[7px] mt-1 font-bold uppercase tracking-wider" style={{ color: `${s.color}70` }}>{s.note}</div>
          </div>
        ))}
      </div>

      {/* ════ SB712 VISUAL ════ */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-12 z-10" style={{ background: "linear-gradient(to bottom, #080808, transparent)" }} />
        <img src={IMGS.sb712} alt="SB712 Sovereign Möbius Runtime" className="w-full object-cover" style={{ maxHeight: 560, background: "#000", opacity: 0.94 }} />
        <div className="absolute inset-x-0 bottom-0 h-24 z-10" style={{ background: "linear-gradient(to top, #080808, transparent)" }} />
        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
          <ProofBadge
            status="DEMO_VISUALIZATION"
            proof="Architecture diagram rendered from design documentation"
            missing="Live backend connection, signed deployment"
            note="This diagram shows system logic visually, not a live production event."
            updated="June 2026"
            compact
          />
        </div>
      </div>

      {/* ════ SYSTEM LAW ════ */}
      <div className="text-center px-6 py-10 space-y-3" style={{ background: "#080808" }}>
        <p className="text-[9px] tracking-[0.4em] uppercase text-muted-foreground">System Law</p>
        <p className="text-lg sm:text-2xl font-black font-cinzel" style={{ color: GOLD, textShadow: "0 0 28px rgba(201,168,76,0.35)" }}>
          "No active state becomes trusted state without verification."
        </p>
        <p className="text-[10px] italic text-muted-foreground max-w-lg mx-auto">
          Trust is not a switch. Trust is a grade.
        </p>
        <div className="warrior-divider max-w-xs mx-auto mt-3" />
      </div>

      {/* ════ INTERACTIVE FLOW SIMULATOR ════ */}
      <div className="px-4 sm:px-6 pb-2">
        <div className="rounded-2xl border p-5 space-y-4" style={{ background: "#0e0c00", borderColor: `${GOLD}25` }}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-black font-cinzel" style={{ color: GOLD }}>Verification Flow Simulator</h2>
              <p className="text-[9px] text-muted-foreground mt-0.5">Click ADVANCE to walk a state through the full certification pipeline.</p>
            </div>
            <ProofBadge status="SIMULATION" proof="Interactive demo" missing="Live backend" note="This is a simulation showing system logic, not a live event." compact />
          </div>
          {/* Flow Steps */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {FLOW.map((step, i) => (
              <React.Fragment key={i}>
                <FlowStep label={step} certified={i < flowStep} active={i === flowStep} />
                {i < FLOW.length - 1 && <div className="w-4 h-px flex-shrink-0" style={{ background: i < flowStep ? GOLD : "rgba(255,255,255,0.1)" }} />}
              </React.Fragment>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" onClick={() => setFlowStep(v => Math.min(v + 1, FLOW.length - 1))}
              className="text-[10px] h-7 px-4 font-black"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #8a6018)`, color: "#080808" }}
              disabled={flowStep >= FLOW.length - 1}>
              Advance State →
            </Button>
            {flowStep >= FLOW.length - 1 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg border font-black text-[10px]"
                style={{ borderColor: `${GOLD}40`, color: GOLD, background: `${GOLD}10` }}>
                <GoldCrown size={16} /> TRUSTED STATE — CROWN CERTIFIED
              </div>
            )}
            {flowStep > 0 && (
              <Button size="sm" variant="ghost" onClick={() => setFlowStep(0)}
                className="text-[10px] h-7 px-3 text-muted-foreground">
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ════ COUNCIL BRIEFING ════ */}
      <div className="px-4 sm:px-6 pb-2">
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: `${GOLD}22`, background: "linear-gradient(135deg, #0e0c00, #111111)" }}>
          <div className="px-6 pt-6 pb-3 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}50)` }} />
            <h2 className="text-xs font-black tracking-[0.4em] uppercase" style={{ color: GOLD }}>Council Briefing</h2>
            <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${GOLD}50, transparent)` }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 text-xs">
            {[
              {
                title: "What JGA Is Building",
                body: "A verification-first business automation platform organizing design services, contractor management, client onboarding, and financial compliance — backed by sovereign runtime architecture.",
                proof: "DEMO_VISUALIZATION",
                proofNote: "Platform shown in demo mode. Live production requires full backend, payment, and legal integration.",
              },
              {
                title: "Why Verification-First",
                body: "Every payment, upload, and data point enters quarantine before trust. Creates defensible audit trails, reduces disputes, and demonstrates discipline to investors and regulators.",
                proof: "BUSINESS_POLICY",
                proofNote: "This policy approach is a working framework. Legal review recommended before public deployment.",
              },
              {
                title: "Illinois Pilot Readiness",
                body: "Phase 1 targets Illinois-only operations with demo council, JGA design intake, client/contractor portals, proof vault, and daily reporting — demo-ready for investor review.",
                proof: "DEMO_VISUALIZATION",
                proofNote: "Pilot is in demo phase. Real-world deployment requires legal entity, contracts, and operational infrastructure.",
              },
              {
                title: "Expansion Roadmap",
                body: "Phase 2: 5 states. Phase 3: 15 states. Phase 4: All 50 states with full Enterprise OS, AVA/VERA AI integration, and advanced analytics.",
                proof: "INVESTOR_PROJECTION",
                proofNote: "Expansion plans are founder projections. Actual growth depends on funding, legal review, and demand.",
              },
            ].map((b, i) => (
              <div key={i} className="space-y-2 p-4 rounded-xl border" style={{ background: "rgba(0,0,0,0.35)", borderColor: `${GOLD}14` }}>
                <h3 className="font-black text-xs uppercase tracking-wider" style={{ color: GOLD }}>{b.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{b.body}</p>
                <ProofBadge status={b.proof} note={b.proofNote} updated="June 2026" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════ CORE MODULES ════ */}
      <div className="px-4 sm:px-6 space-y-4 pt-2 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1 rounded-full" style={{ background: `linear-gradient(180deg, ${GOLD}, transparent)` }} />
            <h2 className="text-sm font-black tracking-widest uppercase" style={{ color: GOLD }}>Core Modules</h2>
          </div>
          <div className="flex gap-1 rounded-xl p-1" style={{ background: "#111111", border: `1px solid ${GOLD}18` }}>
            {VIEW_MODES.map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                style={viewMode === m
                  ? { background: `linear-gradient(135deg, ${GOLD}, #a07828)`, color: "#080808" }
                  : { color: "rgba(201,168,76,0.38)" }}>
                {VIEW_LABELS[m]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MODULES.map(mod => {
            const Icon = mod.icon;
            return (
              <Link to={mod.path} key={mod.code}
                className="rounded-xl border p-5 space-y-3 transition-all hover:scale-[1.01] block"
                style={{ background: "linear-gradient(135deg, #0e0c00, #111111)", borderColor: `${GOLD}18`, boxShadow: `0 0 18px ${GOLD}06` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${mod.color}12`, border: `1px solid ${mod.color}28` }}>
                      <Icon className="w-4 h-4" style={{ color: mod.color }} />
                    </div>
                    <div>
                      <span className="text-[9px] font-black tracking-widest uppercase font-mono" style={{ color: mod.color }}>{mod.code}</span>
                      <h3 className="text-xs font-bold text-foreground leading-tight">{mod.name}</h3>
                    </div>
                  </div>
                  <ProofBadge status={mod.proofStatus} note={mod.proofNote} updated="June 2026" compact />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{mod.desc[viewMode]}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ════ FOUNDER SECTION ════ */}
      <div className="relative overflow-hidden mx-4 sm:mx-6 rounded-2xl border" style={{ borderColor: `${GOLD}28` }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
          <div className="relative overflow-hidden" style={{ minHeight: 300 }}>
            <img src={IMGS.founder} alt="JGA Founder" className="w-full h-full object-cover object-top" style={{ minHeight: 300 }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent 60%, #111111 100%)" }} />
          </div>
          <div className="flex flex-col justify-center p-7 space-y-4" style={{ background: "#111111" }}>
            <p className="text-[9px] tracking-[0.4em] uppercase" style={{ color: `${GOLD}70` }}>First Live Deployment</p>
            <h3 className="text-xl font-black font-cinzel leading-tight" style={{ color: GOLD }}>
              Jay's Graphic Arts<br />
              <span className="text-sm font-normal text-muted-foreground">The SB Ecosystem — Live In A Real Business</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Built from pressure. Running inside a real business in real time. Testing now. Every feature earns its mark before it goes live.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Active Testing",     "DEMO_VISUALIZATION"],
                ["Real Automation",    "NEEDS_TECH_VALIDATION"],
                ["AI Integration",     "NEEDS_TECH_VALIDATION"],
                ["Recovery Systems",   "SIMULATION"],
                ["Production Routing", "NEEDS_TECH_VALIDATION"],
                ["Phase 1 Demo Live",  "DEMO_VISUALIZATION"],
              ].map(([item, status], i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px]">
                  <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: GOLD }} />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
            <ProofBadge
              status="OWNER_CLAIM"
              proof="Founder narrative and business context"
              missing="Third-party business audit"
              note="This section describes the founder's story and deployment intent. Treat as narrative context unless connected to a proof record."
              updated="June 2026"
            />
          </div>
        </div>
      </div>

      {/* ════ GOLD ROOM ════ */}
      <div className="px-4 sm:px-6 pb-6 pt-4 space-y-4">
        <div className="text-center">
          <Button
            onClick={() => setGoldRoomOpen(!goldRoomOpen)}
            className="px-10 py-3 text-sm font-black uppercase tracking-widest h-auto font-cinzel"
            style={{ background: `linear-gradient(135deg, #C9A84C, #7a5010)`, color: "#080808", boxShadow: "0 0 28px rgba(201,168,76,0.25)" }}
          >
            <GoldCrown size={18} />
            <span className="ml-2">{goldRoomOpen ? "Close the Gold Room" : "Enter the Gold Room"}</span>
            {goldRoomOpen ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
        </div>

        {goldRoomOpen && (
          <div className="rounded-2xl border-2 p-6 sm:p-8 space-y-6"
            style={{ borderColor: `${GOLD}45`, background: "linear-gradient(135deg, #0e0c00 0%, #111111 50%, #0e0c00 100%)", boxShadow: `0 0 50px ${GOLD}12` }}>
            <div className="text-center space-y-3">
              <Badge className="text-[10px] px-4 py-1.5 font-black border uppercase tracking-widest"
                style={{ background: `${GOLD}12`, color: GOLD, borderColor: `${GOLD}45` }}>
                THE GOLD ROOM
              </Badge>
              <div className="flex justify-center">
                <div className="w-28 h-28 rounded-2xl overflow-hidden border-2" style={{ borderColor: `${GOLD}45`, boxShadow: `0 0 28px ${GOLD}28` }}>
                  <img src={IMGS.logo} alt="Gold Room Seal" className="w-full h-full object-cover" />
                </div>
              </div>
              <CrownStamp label="GOLD ROOM CERTIFIED" size="lg" />
              <h2 className="text-xl font-bold font-cinzel gold-shimmer">Owner Command Summary</h2>
              <p className="text-[10px] italic font-cinzel" style={{ color: `${GOLD}65` }}>
                Gold Room Seal · Elegance with Consequences · Certified before trusted.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: "System Heartbeat", value: "NOMINAL",      sub: "All nodes reporting",       color: "#4ade80", icon: Activity,   path: "/node-mesh",       proof: "SIMULATION" },
                { label: "Business Readiness",value: "DEMO READY",  sub: "Client intake configured",  color: GOLD,      icon: Building2,  path: "/business-os",     proof: "DEMO_VISUALIZATION" },
                { label: "Proof Records",     value: "47",           sub: "Vault entries",             color: "#b0b8c8", icon: Award,      path: "/proof-vault",     proof: "VERIFIED_FACT" },
                { label: "Pilot Phase",       value: "PHASE 1",      sub: "Illinois demo live",        color: GOLD,      icon: Eye,        path: "/roadmap",         proof: "INVESTOR_PROJECTION" },
                { label: "Recovery Systems",  value: "DEMO ARMED",  sub: "Phoenix on standby",        color: "#b04040", icon: Heart,      path: "/self-healing",    proof: "SIMULATION" },
                { label: "Next Action",       value: "RUN DEMO",     sub: "Investor walkthrough",      color: GOLD,      icon: ArrowRight, path: "/jga-about",       proof: "DEMO_VISUALIZATION" },
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <Link to={card.path} key={i}
                    className="rounded-xl border p-4 space-y-2 transition-all hover:scale-[1.02] block"
                    style={{ background: "rgba(0,0,0,0.45)", borderColor: `${card.color}22` }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{card.label}</span>
                      <Icon className="w-4 h-4" style={{ color: card.color }} />
                    </div>
                    <div className="text-base font-black font-mono" style={{ color: card.color }}>{card.value}</div>
                    <div className="text-[9px] text-muted-foreground">{card.sub}</div>
                    <ProofBadge status={card.proof} compact />
                  </Link>
                );
              })}
            </div>

            <div className="text-center pt-2">
              <Link to="/brand-proof"
                className="inline-flex items-center gap-2 text-[10px] font-bold px-4 py-2 rounded-xl border hover:opacity-75 transition"
                style={{ color: GOLD, borderColor: `${GOLD}28`, background: `${GOLD}08` }}>
                <Shield className="w-3.5 h-3.5" />
                View Brand Proof Asset Vault →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ════ DISCLAIMER STRIP ════ */}
      <div className="px-4 sm:px-6 pb-4">
        <div className="rounded-xl border p-4 space-y-2" style={{ background: "#0e0c00", borderColor: `${GOLD}18` }}>
          <div className="flex items-start gap-2">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: GOLD }} />
            <div className="text-[9px] leading-relaxed text-muted-foreground space-y-1">
              <p><span className="font-bold" style={{ color: GOLD }}>Site Disclaimer:</span> This demo council illustrates authorized integrity monitoring, business automation, and recovery workflows. Features labeled "SIMULATION" or "DEMO VISUALIZATION" show system logic visually — they are not live production events.</p>
              <p>Business policies shown are working templates and should be reviewed by a qualified attorney before public use. Expansion projections are founder estimates, not guaranteed outcomes. Graded topology concepts are theory-inspired design language, not proven physics.</p>
              <p>Real deployment requires legal, security, payment integration, and operational testing. <span className="font-bold" style={{ color: GOLD }}>Every trusted state earns its mark. Certified before trusted.</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* ════ BOTTOM BANNER ════ */}
      <div className="text-center py-10 px-6 space-y-3" style={{ background: "linear-gradient(180deg, #080808, #0e0c00)", borderTop: `1px solid ${GOLD}22` }}>
        <p className="text-[9px] tracking-[0.5em] uppercase text-muted-foreground">Black and Gold · Grounded in Proof · Built from Pressure</p>
        <h3 className="text-2xl sm:text-4xl font-black font-cinzel gold-shimmer">WE BUILD. WE PRINT. WE WIN.</h3>
        <CrownStamp label="JGA CERTIFIED" size="md" />
        <p className="text-xs font-cinzel" style={{ color: GOLD }}>ELEGANCE WITH CONSEQUENCES. YOUR DESIGN, ONLY BOLDER.</p>
        <p className="text-[10px] italic text-muted-foreground">DISCIPLINE IS FREEDOM. CONTROL IS POWER. PEACE IS THE GOAL. — JGA</p>
      </div>

    </div>
  );
}