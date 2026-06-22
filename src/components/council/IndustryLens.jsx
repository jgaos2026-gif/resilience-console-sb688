import React, { useState } from "react";
import { ChevronDown, Rocket, Shield, Building2, Cpu, Truck, Heart, Landmark, Zap } from "lucide-react";
import PrototypeReadinessCheck from "@/components/council/PrototypeReadinessCheck";

const GOLD = "#C9A84C";

const INDUSTRIES = [
  {
    id: "general",
    label: "General Overview",
    icon: Building2,
    color: GOLD,
    tagline: "Platform baseline — all systems active",
    pitch: null,
    metrics: [
      { label: "Verification Pipeline", value: "3-Gate", sub: "Verify → Validate → Certify" },
      { label: "Recovery Time", value: "< 2s", sub: "Phoenix rollback target" },
      { label: "Audit Trail Depth", value: "100%", sub: "Every state logged" },
      { label: "Module Coverage", value: "10 / 10", sub: "Full stack active" },
    ],
    useCases: [],
  },
  {
    id: "spacex",
    label: "SpaceX / Aerospace",
    icon: Rocket,
    color: "#60a5fa",
    tagline: "Mission-critical state integrity for launch & telemetry systems",
    pitch: {
      headline: "Why SpaceX & Aerospace Need This",
      body: "A single unverified state in a launch sequence can cost a mission. JGA's triple-verified pipeline is designed so telemetry packets, staging commands, and system handoffs can pass independent certification gates before they're trusted — with append-only audit logs built for failure review. Phoenix Recovery is shown as a prototype recovery pattern targeting fast rollback to the last certified checkpoint. The value is the architecture: fewer blind trust points in a zero-tolerance environment.",
      who: ["Mission assurance engineers", "Ground control systems architects", "DoD / NASA program managers", "Launch vehicle software leads"],
      badge: "ZERO TOLERANCE",
      badgeColor: "#60a5fa",
    },
    metrics: [
      { label: "State Cert Gates", value: "3x", sub: "Independent mark per event" },
      { label: "Rollback Target", value: "< 2s", sub: "Phoenix checkpoint recovery" },
      { label: "Telemetry Integrity", value: "100%", sub: "Append-only, hash-verified" },
      { label: "Failure Isolation", value: "Auto", sub: "Quarantine on drift detect" },
    ],
    useCases: [
      "Launch telemetry state verification",
      "Staging event audit trail",
      "Ground control command integrity",
      "Post-mission data certification",
    ],
  },
  {
    id: "national_security",
    label: "National Security / DoD",
    icon: Shield,
    color: "#f87171",
    tagline: "Sovereign runtime architecture for classified state management",
    pitch: {
      headline: "Why National Security Demands This",
      body: "Classified environments require systems with strong internal proof of integrity. JGA's Sovereign Stitch Protocol is designed as a braided, append-only ledger where silent alteration becomes detectable. The SB689 Guarded Runtime Body represents drift monitoring and quarantine logic before compromised states propagate. The SB712 Möbius loop shows a continuous re-certification pattern. The big idea: infrastructure should not just store truth — it should prove when truth changed.",
      who: ["DoD systems integrators", "Intelligence community architects", "Cybersecurity program leads", "CMMC / FedRAMP compliance officers"],
      badge: "SOVEREIGN",
      badgeColor: "#f87171",
    },
    metrics: [
      { label: "Ledger Tamper Detect", value: "Real-Time", sub: "SHA-256 hash chain" },
      { label: "Drift Response", value: "Instant", sub: "Auto-quarantine on breach" },
      { label: "Self-Certification", value: "Möbius Loop", sub: "Continuous re-verify" },
      { label: "State Sovereignty", value: "100%", sub: "No external trust required" },
    ],
    useCases: [
      "Classified data state management",
      "Runtime integrity monitoring",
      "Zero-trust architecture enforcement",
      "Incident rollback and certification",
    ],
  },
  {
    id: "finance",
    label: "Finance / Banking",
    icon: Landmark,
    color: "#4ade80",
    tagline: "Triple-verified payment rails with dispute-proof audit trails",
    pitch: {
      headline: "Why Finance Needs Verification-First",
      body: "Every disputed transaction, every audit finding, every regulatory fine traces back to one problem: unverified state transitions. JGA's payment verification layer quarantines every financial event before marking it trusted. Deposits, payouts, refunds, and reversals each pass through a three-gate certification pipeline. The append-only ledger creates a legally defensible chain of custody for every dollar. When a regulator or auditor asks 'prove it' — the system already has, in real time, at the moment the transaction occurred.",
      who: ["Banking compliance officers", "Fintech infrastructure engineers", "Payment processing architects", "Regulatory audit teams"],
      badge: "AUDIT-READY",
      badgeColor: "#4ade80",
    },
    metrics: [
      { label: "Payment Gates", value: "3-Layer", sub: "Quarantine → Verify → Certify" },
      { label: "Dispute Defense", value: "Chain-of-Custody", sub: "Every event logged" },
      { label: "Refund Window", value: "Policy-Enforced", sub: "Automated compliance" },
      { label: "Regulatory Readiness", value: "Built-In", sub: "Audit trail always live" },
    ],
    useCases: [
      "Payment event certification",
      "Deposit policy enforcement",
      "Contractor payout verification",
      "Regulatory audit trail generation",
    ],
  },
  {
    id: "healthcare",
    label: "Healthcare / MedTech",
    icon: Heart,
    color: "#e879f9",
    tagline: "HIPAA-aligned state integrity for patient data and device logs",
    pitch: {
      headline: "Why Healthcare Needs State Sovereignty",
      body: "Patient records altered without a verified audit trail are a liability. Medical device state changes without certification are a safety risk. JGA's triple-verification engine is designed so patient data updates, device log entries, or clinical workflow states can pass through a certified pipeline — with Phoenix Recovery shown as a rollback pattern to the last trusted checkpoint. The append-only memory braid means nothing is silently overwritten. This supports HIPAA-style accountability, while real deployment would still require legal and security review.",
      who: ["Hospital IT & compliance leads", "Medical device firmware engineers", "EHR systems architects", "FDA / HIPAA audit teams"],
      badge: "HIPAA-ALIGNED",
      badgeColor: "#e879f9",
    },
    metrics: [
      { label: "Record Integrity", value: "Append-Only", sub: "Nothing silently overwritten" },
      { label: "Device State Certs", value: "3-Gate", sub: "Per clinical event" },
      { label: "PHI Chain of Custody", value: "100%", sub: "Every access logged" },
      { label: "Rollback Safety", value: "< 2s", sub: "Phoenix to last certified state" },
    ],
    useCases: [
      "Patient record state verification",
      "Medical device log certification",
      "Clinical workflow audit trail",
      "HIPAA compliance chain-of-custody",
    ],
  },
  {
    id: "logistics",
    label: "Logistics / Supply Chain",
    icon: Truck,
    color: "#fb923c",
    tagline: "Verified chain-of-custody from origin to final delivery",
    pitch: {
      headline: "Why Supply Chain Runs on Verification",
      body: "A single unverified handoff in a supply chain — a forged document, an altered timestamp, a missed checkpoint — can invalidate an entire shipment or trigger a regulatory seizure. JGA's braided ledger creates an immutable record of every state transition in the chain: pickup, transit, inspection, customs, delivery. Each event is hash-verified and triple-certified before it advances. If a bad state is injected, Phoenix isolates it and rolls back to the last trusted node. Your chain of custody is the product.",
      who: ["Supply chain integrity officers", "Customs & trade compliance leads", "Cold chain logistics engineers", "Third-party logistics (3PL) auditors"],
      badge: "CHAIN-OF-CUSTODY",
      badgeColor: "#fb923c",
    },
    metrics: [
      { label: "Handoff Verification", value: "Per-Event", sub: "Every state transition logged" },
      { label: "Tamper Detection", value: "Real-Time", sub: "Hash mismatch alert" },
      { label: "Chain Integrity", value: "100%", sub: "Append-only ledger" },
      { label: "Bad State Isolation", value: "Auto", sub: "Phoenix quarantine" },
    ],
    useCases: [
      "Shipment state certification",
      "Customs documentation integrity",
      "Cold chain event verification",
      "Last-mile delivery audit",
    ],
  },
  {
    id: "ai",
    label: "AI / LLM Infrastructure",
    icon: Cpu,
    color: "#a78bfa",
    tagline: "Verified memory pockets and quarantined AI responses",
    pitch: {
      headline: "Why AI Systems Need State Verification",
      body: "An LLM that can access any memory, load any context, and return any response without verification is a liability in an enterprise environment. JGA's Braid Memory architecture organizes AI context into 66 verified pockets — each one certified before it's loaded into active memory. Responses pass through the quarantine pipeline before they're trusted. The RAM Guard enforces memory limits and prevents poisoned context from propagating. This is the missing architecture layer for enterprise AI deployments: a sovereign, verified, auditable memory and response pipeline.",
      who: ["Enterprise AI architects", "LLM deployment engineers", "AI safety & alignment teams", "Regulated industry AI leads"],
      badge: "AI-SOVEREIGN",
      badgeColor: "#a78bfa",
    },
    metrics: [
      { label: "Memory Pockets", value: "66-Strand", sub: "Verified before load" },
      { label: "Response Quarantine", value: "Active", sub: "Before trusted output" },
      { label: "RAM Guard", value: "Enforced", sub: "Memory limit compliance" },
      { label: "Context Integrity", value: "100%", sub: "Hash-verified at load" },
    ],
    useCases: [
      "LLM context state management",
      "AI response certification pipeline",
      "Memory pocket load/unload auditing",
      "Enterprise AI guardrail enforcement",
    ],
  },
  {
    id: "energy",
    label: "Energy / Critical Infrastructure",
    icon: Zap,
    color: "#facc15",
    tagline: "Sovereign runtime integrity for grid, plant, and pipeline control",
    pitch: {
      headline: "Why Critical Infrastructure Needs Sovereign Runtime",
      body: "A power grid, a pipeline, a water treatment plant — these systems operate in environments where a single unverified state transition can cascade into a national emergency. JGA's SB689 Guarded Runtime Body monitors every process state in real time, detecting drift the moment it occurs and triggering automatic quarantine before propagation. The SB712 Möbius loop continuously re-certifies operational states without human intervention. Phoenix Recovery restores the last certified checkpoint in under two seconds. For critical infrastructure, verification isn't a feature — it's the minimum viable standard.",
      who: ["SCADA / ICS systems engineers", "Grid operations architects", "NERC CIP compliance officers", "Energy sector cybersecurity leads"],
      badge: "CRITICAL-GRADE",
      badgeColor: "#facc15",
    },
    metrics: [
      { label: "Drift Detection", value: "Real-Time", sub: "SCADA state monitoring" },
      { label: "Auto Quarantine", value: "Instant", sub: "On anomaly detection" },
      { label: "Self-Recertification", value: "Continuous", sub: "Möbius verification loop" },
      { label: "Recovery Speed", value: "< 2s", sub: "To last certified checkpoint" },
    ],
    useCases: [
      "SCADA state event certification",
      "Grid fault isolation and rollback",
      "Pipeline monitoring integrity",
      "NERC CIP audit trail generation",
    ],
  },
];

export default function IndustryLens() {
  const [selected, setSelected] = useState("general");
  const [dropOpen, setDropOpen] = useState(false);

  const industry = INDUSTRIES.find(i => i.id === selected);
  const Icon = industry.icon;

  return (
    <div className="px-4 sm:px-6 py-6 space-y-4">

      {/* ── AD HEADER ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border-2 overflow-hidden"
        style={{ borderColor: `${GOLD}35`, background: "linear-gradient(135deg, #0e0c00, #111111)" }}>

        {/* Banner */}
        <div className="px-4 sm:px-6 pt-5 pb-3 space-y-1 border-b" style={{ borderColor: `${GOLD}20` }}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[9px] tracking-[0.5em] uppercase font-bold" style={{ color: `${GOLD}60` }}>
                Industry Intelligence Lens™
              </p>
              <h2 className="text-base sm:text-lg font-black font-cinzel leading-tight" style={{ color: GOLD }}>
                See JGA Through Your Industry's Eyes
              </h2>
            </div>
            <span className="text-[8px] font-black px-2.5 py-1 rounded-lg border tracking-widest uppercase"
              style={{ background: `${GOLD}12`, borderColor: `${GOLD}40`, color: GOLD }}>
              INTERACTIVE PROTOTYPE
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
            Switch the dashboard to any industry — SpaceX, national security, healthcare, finance, and more — and instantly see the metrics that matter to that sector, the use cases JGA solves, and exactly who inside that organization would want this system.
          </p>
        </div>

        {/* Why it's a big deal */}
        <div className="px-4 sm:px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-3 border-b" style={{ borderColor: `${GOLD}14` }}>
          {[
            { icon: "🎯", title: "Contextual Metrics", body: "Every industry sees the numbers that actually matter to them — not a generic dashboard." },
            { icon: "⚡", title: "Instant Positioning", body: "Investors and buyers immediately understand the value in their own language." },
            { icon: "🔐", title: "Universal Architecture", body: "One sovereign system adapts to any regulated, high-stakes environment." },
          ].map((p, i) => (
            <div key={i} className="flex gap-3 items-start p-3 rounded-xl border"
              style={{ background: "rgba(0,0,0,0.3)", borderColor: `${GOLD}12` }}>
              <span className="text-base flex-shrink-0">{p.icon}</span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: GOLD }}>{p.title}</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{p.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Selector */}
        <div className="px-4 sm:px-6 py-4">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-2">Select Industry</p>
          <div className="relative w-full sm:w-auto sm:inline-block">
            <button
              onClick={() => setDropOpen(v => !v)}
              className="w-full sm:w-auto flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all"
              style={{ background: "rgba(0,0,0,0.5)", borderColor: `${GOLD}40`, minWidth: 260 }}>
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: industry.color }} />
              <span className="flex-1 text-sm font-black" style={{ color: industry.color }}>{industry.label}</span>
              <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform"
                style={{ color: `${GOLD}60`, transform: dropOpen ? "rotate(180deg)" : "none" }} />
            </button>
            {dropOpen && (
              <div className="absolute left-0 right-0 sm:right-auto sm:w-72 mt-1 rounded-xl border overflow-hidden z-50"
                style={{ background: "#111111", borderColor: `${GOLD}30`, boxShadow: `0 8px 40px rgba(0,0,0,0.7)` }}>
                {INDUSTRIES.map(ind => {
                  const IndIcon = ind.icon;
                  return (
                    <button key={ind.id}
                      onClick={() => { setSelected(ind.id); setDropOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all hover:opacity-80"
                      style={{
                        background: selected === ind.id ? `${GOLD}14` : "transparent",
                        borderBottom: `1px solid ${GOLD}10`,
                      }}>
                      <IndIcon className="w-4 h-4 flex-shrink-0" style={{ color: ind.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate" style={{ color: selected === ind.id ? ind.color : "rgba(232,217,176,0.75)" }}>
                          {ind.label}
                        </p>
                        <p className="text-[9px] text-muted-foreground truncate">{ind.tagline}</p>
                      </div>
                      {selected === ind.id && (
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ind.color }} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── INDUSTRY PANEL ─────────────────────────────────────────── */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ borderColor: `${industry.color}30`, background: "#0a0a0a" }}>

        {/* Industry header */}
        <div className="px-4 sm:px-6 py-4 border-b flex flex-wrap items-center gap-3"
          style={{ background: `linear-gradient(135deg, ${industry.color}08, transparent)`, borderColor: `${industry.color}20` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${industry.color}15`, border: `1px solid ${industry.color}35` }}>
            <Icon className="w-5 h-5" style={{ color: industry.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] uppercase tracking-widest" style={{ color: `${industry.color}70` }}>Active Lens</p>
            <h3 className="text-sm sm:text-base font-black font-cinzel leading-tight" style={{ color: industry.color }}>
              {industry.label}
            </h3>
            <p className="text-[10px] text-muted-foreground truncate">{industry.tagline}</p>
          </div>
          {industry.pitch && (
            <span className="text-[8px] font-black px-2.5 py-1 rounded-lg border tracking-widest uppercase flex-shrink-0"
              style={{ background: `${industry.pitch.badgeColor}12`, borderColor: `${industry.pitch.badgeColor}40`, color: industry.pitch.badgeColor }}>
              {industry.pitch.badge}
            </span>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px" style={{ background: `${industry.color}18` }}>
          {industry.metrics.map((m, i) => (
            <div key={i} className="px-4 py-4 text-center" style={{ background: "#0a0a0a" }}>
              <p className="text-[8px] uppercase tracking-widest text-muted-foreground mb-1">{m.label}</p>
              <p className="text-base sm:text-lg font-black font-mono leading-tight" style={{ color: industry.color }}>{m.value}</p>
              <p className="text-[8px] text-muted-foreground mt-0.5">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Pitch + use cases */}
        {industry.pitch ? (
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pitch copy */}
            <div className="space-y-3">
              <h4 className="text-xs font-black font-cinzel" style={{ color: industry.color }}>{industry.pitch.headline}</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{industry.pitch.body}</p>
            </div>
            {/* Who wants it + use cases */}
            <div className="space-y-4">
              <div>
                <p className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: `${industry.color}70` }}>
                  Who Inside This Industry Wants This
                </p>
                <ul className="space-y-1.5">
                  {industry.pitch.who.map((w, i) => (
                    <li key={i} className="flex items-center gap-2 text-[11px]">
                      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: industry.color }} />
                      <span className="text-muted-foreground">{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: `${industry.color}70` }}>
                  Use Cases
                </p>
                <ul className="space-y-1.5">
                  {industry.useCases.map((u, i) => (
                    <li key={i} className="flex items-center gap-2 text-[11px]">
                      <div className="w-3 h-px flex-shrink-0" style={{ background: `${industry.color}60` }} />
                      <span className="text-muted-foreground">{u}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="sm:col-span-2">
              <PrototypeReadinessCheck color={industry.color} label={industry.label} />
            </div>
          </div>
        ) : (
          <div className="px-4 sm:px-6 py-4">
            <p className="text-[11px] text-muted-foreground">Select an industry above to see tailored metrics, positioning, and use cases.</p>
          </div>
        )}
      </div>
    </div>
  );
}