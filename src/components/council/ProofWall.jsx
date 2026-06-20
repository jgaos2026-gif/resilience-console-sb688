import React, { useState } from "react";
import { Shield, FileText, BarChart2, Cpu, CheckCircle2, Clock } from "lucide-react";

const GOLD = "#C9A84C";

const PROOF_ITEMS = [
  {
    icon: Shield,
    label: "Verification Pipeline",
    type: "DEMO RESULT",
    typeColor: "#4ade80",
    desc: "Full 5-stage verification flow: Quarantine → Verify → Validate → Certify → Trust. Interactive and running.",
    status: "demo",
  },
  {
    icon: FileText,
    label: "Daily System Reports",
    type: "VERIFIED FACT",
    typeColor: GOLD,
    desc: "Automated daily reports generated and logged. Report structure built, templates active, output demonstrated.",
    status: "verified",
  },
  {
    icon: BarChart2,
    label: "Client Intake Flow",
    type: "DEMO RESULT",
    typeColor: "#4ade80",
    desc: "Brand discovery questionnaire, intake form, email notification, and record creation — all working in demo.",
    status: "demo",
  },
  {
    icon: Cpu,
    label: "Node Mesh Monitor",
    type: "DEMO VISUALIZATION",
    typeColor: "#60a5fa",
    desc: "Real-time heartbeat animation, trust-level scoring, and status badges. Logic visualized — not live production nodes.",
    status: "demo",
  },
  {
    icon: CheckCircle2,
    label: "Memory Braid System",
    type: "DEMO VISUALIZATION",
    typeColor: "#60a5fa",
    desc: "66-strand braid architecture shown with animated canvas. Pocket load/unload simulation demonstrated.",
    status: "demo",
  },
  {
    icon: FileText,
    label: "Business Registration",
    type: "VERIFIED FACT",
    typeColor: GOLD,
    desc: "Jay's Graphic Arts, LLC — registered, EIN active, state filing documented, bank account open. Documents uploaded.",
    status: "verified",
  },
  {
    icon: Shield,
    label: "Phoenix Recovery Demo",
    type: "SIMULATION",
    typeColor: "#f59e0b",
    desc: "Rollback, checkpoint, and restoration logic demonstrated in simulation. Not yet in live production backend.",
    status: "simulation",
  },
  {
    icon: BarChart2,
    label: "JGA Brand Assets",
    type: "VERIFIED FACT",
    typeColor: GOLD,
    desc: "Flyers, logos, founder imagery, and design samples. Physical and digital assets on record in Proof Vault.",
    status: "verified",
  },
  {
    icon: Clock,
    label: "Contractor Portal",
    type: "PROTOTYPE",
    typeColor: "#d97706",
    desc: "Assignment board, payout tracking, and submission workflow built. Requires payment integration for live use.",
    status: "prototype",
  },
];

const STATUS_STYLE = {
  verified:   { bg: `${GOLD}12`,      border: `${GOLD}35`,    dot: GOLD },
  demo:       { bg: "rgba(96,165,250,0.07)", border: "rgba(96,165,250,0.3)", dot: "#60a5fa" },
  simulation: { bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.3)", dot: "#f59e0b" },
  prototype:  { bg: "rgba(217,119,6,0.07)", border: "rgba(217,119,6,0.3)", dot: "#d97706" },
};

export default function ProofWall() {
  const [filter, setFilter] = useState("all");

  const filters = [
    { id: "all",        label: "All" },
    { id: "verified",   label: "Verified" },
    { id: "demo",       label: "Demo" },
    { id: "simulation", label: "Simulation" },
    { id: "prototype",  label: "Prototype" },
  ];

  const visible = filter === "all" ? PROOF_ITEMS : PROOF_ITEMS.filter(p => p.status === filter);

  return (
    <div className="px-4 sm:px-6 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}40)` }} />
        <div className="text-center space-y-1">
          <p className="text-[9px] tracking-[0.5em] uppercase" style={{ color: `${GOLD}60` }}>Evidence</p>
          <h2 className="text-xl sm:text-2xl font-black font-cinzel" style={{ color: GOLD }}>The Proof Wall</h2>
        </div>
        <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${GOLD}40, transparent)` }} />
      </div>

      {/* Sub-headline */}
      <p className="text-center text-xs text-muted-foreground max-w-xl mx-auto leading-relaxed">
        We do not just talk. We show the work. Every card below represents a real demo, verified fact, or documented system component.
      </p>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className="px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all"
            style={filter === f.id
              ? { background: `${GOLD}18`, borderColor: `${GOLD}50`, color: GOLD }
              : { background: "transparent", borderColor: `${GOLD}15`, color: `${GOLD}45` }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Proof cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map((item, i) => {
          const Icon = item.icon;
          const s = STATUS_STYLE[item.status];
          return (
            <div key={i} className="rounded-xl border p-4 space-y-3 transition-all hover:scale-[1.01]"
              style={{ background: s.bg, borderColor: s.border }}>
              <div className="flex items-start justify-between gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${s.dot}15`, border: `1px solid ${s.dot}30` }}>
                  <Icon className="w-4 h-4" style={{ color: s.dot }} />
                </div>
                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border"
                  style={{ color: item.typeColor, borderColor: `${item.typeColor}40`, background: `${item.typeColor}10` }}>
                  {item.type}
                </span>
              </div>
              <h3 className="text-xs font-black" style={{ color: "rgba(232,217,176,0.9)" }}>{item.label}</h3>
              <p className="text-[11px] leading-relaxed text-muted-foreground">{item.desc}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: `${s.dot}80` }}>
                  {item.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom statement */}
      <div className="text-center pt-2">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${GOLD}50` }}>
          ★ Proof over promises · Every trusted state earns its mark ★
        </p>
      </div>
    </div>
  );
}