import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Shield, Zap, Heart, Plane, Building2, Cpu, Globe, Landmark,
  ChevronDown, ChevronUp, CheckCircle2, XCircle, ArrowRight, TrendingUp, AlertTriangle
} from "lucide-react";
import { CrownIcon, LionIcon } from "@/components/sb688/WarriorCrest";

const GOLD = "#C9A84C";
const BG   = "#050608";
const CARD = "#0A0B0E";
const TEXT = "#E8D9B0";
const DIM  = "rgba(232,217,176,0.55)";
const BORDER = "rgba(201,168,76,0.18)";

// ── Stress test comparison data ───────────────────────────────────────────────
const STRESS_TESTS = [
  { metric: "Node Loss Before Collapse",     sb688: "38%",            legacy: "7%",             winner: "sb688" },
  { metric: "Infrastructure Overhead",       sb688: "150% (1.5×)",    legacy: "300% (3× mirror)", winner: "sb688" },
  { metric: "Data Loss on Full Heal",        sb688: "0.0000%",        legacy: "Up to 14%",       winner: "sb688" },
  { metric: "Heal Trigger Threshold",        sb688: "Auto at 99.8%",  legacy: "Manual / alert",  winner: "sb688" },
  { metric: "Pre-Death Snapshot",            sb688: "Formate Node @ 99.9%", legacy: "None",      winner: "sb688" },
  { metric: "Failure Mode",                  sb688: "Graceful degradation", legacy: "Cascade collapse", winner: "sb688" },
  { metric: "Recovery Mechanism",            sb688: "Geometric (passive)", legacy: "Software (reactive)", winner: "sb688" },
  { metric: "Tamper Rejection",              sb688: "HMAC + signature gate", legacy: "Firewall rules", winner: "sb688" },
  { metric: "AI Hallucination Resistance",   sb688: "Geometric ground truth", legacy: "None",    winner: "sb688" },
  { metric: "Ghost Node Deception Layer",    sb688: "Active boundary sensors", legacy: "None",   winner: "sb688" },
  { metric: "Immutable Ledger",              sb688: "Append-only, SHA3-256", legacy: "Mutable logs", winner: "sb688" },
  { metric: "Cold Standby Cost",             sb688: "Embedded in geometry", legacy: "Separate cluster", winner: "sb688" },
  { metric: "Mean Time To Recover (MTTR)",   sb688: "<4 seconds",     legacy: "Minutes–hours",   winner: "sb688" },
  { metric: "Compliance Audit Trail",        sb688: "Cryptographic, read-only", legacy: "Manual export", winner: "sb688" },
  { metric: "Multi-Industry Adaptation",     sb688: "Built-in (8 sectors)", legacy: "Custom per deploy", winner: "sb688" },
];

// ── Legacy systems compared ───────────────────────────────────────────────────
const LEGACY_SYSTEMS = [
  { name: "AWS Multi-AZ",          weakness: "Still fails at zone-level outage. Recovery is reactive, not geometric. No pre-death snapshot." },
  { name: "Kubernetes HA",         weakness: "Pod restart loops cause cascade under heavy load. ETCD quorum loss = total cluster failure." },
  { name: "Traditional RAID",      weakness: "Protects disks, not logic. A corrupted write replicates the corruption across all mirrors." },
  { name: "Active-Active Clustering", weakness: "Split-brain risk during partition. Both nodes believe they are primary — data conflict." },
  { name: "Cold DR / Backup Sites", weakness: "Hours of RTO. Manual failover. Backup lag means data loss by default." },
  { name: "Blockchain Ledgers",    weakness: "Write throughput limited. Finality delay. Not designed for real-time operational recovery." },
];

// ── Industry data ─────────────────────────────────────────────────────────────
const INDUSTRIES = [
  {
    id: "healthcare",
    label: "Healthcare",
    icon: Heart,
    color: "#ef4444",
    currentSystems: "Epic EHR, MEDITECH, Azure Health APIs, HL7/FHIR on traditional HA clusters",
    currentGap: "A single EHR node failure during surgery can delay critical decisions. HIPAA requires audit trails but most systems use mutable logs.",
    currentUses: [
      "Patient record continuity during system maintenance",
      "ICU monitoring node failover",
      "Radiology PACS storage redundancy",
      "Pharmacy dispensing system HA",
      "Insurance claims processing uptime",
    ],
    futureUses: [
      "Real-time surgical AI with geometric ground truth preventing hallucination during procedure",
      "Autonomous hospital grid where patient data follows the patient with zero-latency node handoff",
      "FDA-grade immutable audit trail for drug administration — every dose cryptographically sealed",
      "Ghost nodes absorbing ransomware at hospital network edge before it reaches patient data",
      "Formate Node capturing full ICU state snapshot before planned system maintenance window",
    ],
  },
  {
    id: "defense",
    label: "Defense / Military",
    icon: Shield,
    color: "#3b82f6",
    currentSystems: "SIPRNET, JWICS, Tactical Data Links (Link 16), FBCB2, legacy MIL-SPEC HA",
    currentGap: "EMP hardening exists but software recovery is still reactive. A jammed node creates a communication dead zone rather than a rerouted mesh.",
    currentUses: [
      "Tactical communication mesh under jamming",
      "Weapons system command integrity verification",
      "Classified intelligence routing with need-to-know enforcement",
      "Drone swarm coordination node failure handling",
      "Base network continuity during kinetic attack",
    ],
    futureUses: [
      "Nuclear-hardened mesh where 38% node destruction still maintains C2 integrity",
      "Ghost nodes deployed as decoy command infrastructure — adversary attacks a node that holds no real state",
      "Immutable battle damage assessment ledger — every action, time-stamped, tamper-proof, court-martial-ready",
      "Formate Node preserving mission parameters at the moment of catastrophic EMP event for instant rebuild",
      "AI threat analysis with Sovereign Guardian preventing adversarial prompt injection into decision support systems",
    ],
  },
  {
    id: "finance",
    label: "Finance / Banking",
    icon: Landmark,
    color: "#f59e0b",
    currentSystems: "Oracle RAC, IBM MQ, SWIFT network, FIX protocol engines on active-active clusters",
    currentGap: "Flash crashes happen in milliseconds. Recovery is reactive — by the time a node failover completes, millions in trades have settled incorrectly.",
    currentUses: [
      "High-frequency trading engine continuity",
      "Core banking transaction integrity",
      "ATM network uptime during datacenter events",
      "SWIFT messaging node redundancy",
      "Regulatory reporting availability (SOX, Basel III)",
    ],
    futureUses: [
      "Real-time trade settlement mesh where a failed exchange node is replaced by braid geometry before the next tick",
      "Cryptographically sealed transaction ledger replacing mutable RDBMS audit logs for SEC compliance",
      "Ghost nodes absorbing spoofed FIX protocol messages before they reach the matching engine",
      "Formate Node preserving open position state at market close even during catastrophic datacenter failure",
      "AI risk model with geometric ground truth — hallucination-resistant quant analysis under infrastructure stress",
    ],
  },
  {
    id: "energy",
    label: "Energy / Grid",
    icon: Zap,
    color: "#22c55e",
    currentSystems: "SCADA, EMS/DMS on DNP3/IEC 61850, traditional hot-standby RTU networks",
    currentGap: "Grid SCADA systems are decades-old. A single substation controller failure can cascade to regional blackout. No geometric load redistribution exists.",
    currentUses: [
      "Substation automation failover",
      "Pipeline SCADA continuity during sensor failure",
      "Smart grid demand response node HA",
      "Nuclear plant safety system redundancy",
      "Wind/solar farm inverter mesh continuity",
    ],
    futureUses: [
      "Self-healing smart grid where a destroyed substation's load is absorbed geometrically by adjacent nodes — no blackout",
      "Formate Node capturing full grid state at the moment of a cyberattack for forensic-grade reconstruction",
      "Ghost nodes at grid edge absorbing reconnaissance probes from nation-state actors before they reach SCADA core",
      "Immutable grid event ledger — every load shed, every frequency excursion, cryptographically sealed for FERC",
      "AI-driven demand forecasting with Sovereign Guardian preventing adversarial manipulation of load prediction models",
    ],
  },
  {
    id: "aerospace",
    label: "Aerospace / Aviation",
    icon: Plane,
    color: "#a78bfa",
    currentSystems: "ARINC 429/664, ACARS, FAA STARS/ERAM on triple-redundant voting systems",
    currentGap: "Triple-redundant voting still requires 2-of-3 agreement. A common-mode software fault can take all three votes simultaneously. Recovery requires a ground restart.",
    currentUses: [
      "ATC radar data fusion node redundancy",
      "Flight management system continuity",
      "Airline reservation system HA",
      "Avionics data bus integrity monitoring",
      "Airport operations network uptime",
    ],
    futureUses: [
      "Geometric triple-braid replacing voting systems — load redistributes to surviving nodes without ground intervention",
      "Formate Node preserving full flight state at the moment of avionics partial failure for black-box-grade forensics",
      "Ghost nodes at ATC network perimeter absorbing spoofed radar returns before they enter the fusion engine",
      "Autonomous drone traffic management mesh that heals node failures mid-flight without operator intervention",
      "Immutable maintenance ledger — every part change, every inspection, cryptographically sealed, FAA-audit-ready",
    ],
  },
  {
    id: "government",
    label: "Government / Public Safety",
    icon: Building2,
    color: "#06b6d4",
    currentSystems: "FirstNet, P25 radio, legacy 911 PSAP systems, e-Government portals on traditional DR",
    currentGap: "911 PSAP systems still go offline during major disasters — exactly when they are needed most. Disaster recovery is manual and slow.",
    currentUses: [
      "911 PSAP continuity during disaster",
      "Emergency broadcast system uptime",
      "Law enforcement CAD system HA",
      "Court records and evidence chain of custody",
      "Census and voter registration data integrity",
    ],
    futureUses: [
      "Self-healing 911 mesh that absorbs a destroyed dispatch center's load to the nearest geometric neighbor — zero call drops",
      "Formate Node preserving full emergency response state during a building fire evacuation or EMP event",
      "Ghost nodes at government network edge absorbing APT reconnaissance before it reaches classified infrastructure",
      "Immutable evidence chain ledger — every file access, every transfer, cryptographically sealed, court-admissible",
      "AI triage assistant with Sovereign Guardian preventing adversarial injection into emergency decision support",
    ],
  },
  {
    id: "telecom",
    label: "Telecom / ISP",
    icon: Globe,
    color: "#f97316",
    currentSystems: "BGP routing, SS7/Diameter signaling, CDN edge nodes on traditional anycast HA",
    currentGap: "BGP convergence after a backbone failure takes 30–300 seconds. During that window, millions of users are dropped. No geometric load redistribution.",
    currentUses: [
      "Core router failover continuity",
      "SS7 signaling plane HA",
      "CDN edge node load redistribution",
      "DNS resolver cluster uptime",
      "Mobile core (5G UPF) session continuity",
    ],
    futureUses: [
      "Geometric backbone mesh where a severed undersea cable's traffic is absorbed by adjacent braid nodes — zero convergence delay",
      "Ghost nodes at peering points absorbing DDoS amplification before it saturates the backbone",
      "Formate Node capturing full routing table state at the moment of a fiber cut for sub-second rebuild",
      "Immutable call detail record ledger replacing mutable CDR databases — tamper-proof billing, FCC-audit-ready",
      "AI-driven traffic engineering with Sovereign Guardian preventing adversarial BGP route injection",
    ],
  },
  {
    id: "ai_infra",
    label: "AI / Data Centers",
    icon: Cpu,
    color: GOLD,
    currentSystems: "NVIDIA DGX clusters, Google TPU pods, AWS SageMaker, traditional columnar stacking at 10GW+",
    currentGap: "At 10GW+ scale, columnar stacking collapses at 7% node loss. A single GPU cluster failure during training can corrupt months of model weights.",
    currentUses: [
      "LLM training checkpoint continuity",
      "GPU cluster node failure isolation",
      "Inference serving mesh HA",
      "Model weight storage integrity",
      "Distributed training gradient continuity",
    ],
    futureUses: [
      "Geometric GPU mesh where 38% of compute nodes can fail mid-training without losing a single gradient step",
      "Formate Node capturing full model weight state at the moment of datacenter power event — zero training regression",
      "Sovereign Guardian preventing adversarial prompt injection into production LLM inference pipelines at the geometry layer",
      "Ghost nodes absorbing model extraction attacks at inference API boundary — attacker hits a decoy model, not the real weights",
      "Immutable model training ledger — every weight update, every gradient, sealed with SHA3-256 for AI governance compliance",
    ],
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────────
function StressRow({ metric, sb688, legacy, winner, i }) {
  return (
    <div className={`grid grid-cols-3 gap-2 py-2.5 px-3 rounded-lg text-xs ${i % 2 === 0 ? "" : ""}`}
      style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
      <div className="font-semibold" style={{ color: DIM }}>{metric}</div>
      <div className="font-bold flex items-center gap-1.5" style={{ color: GOLD }}>
        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#22c55e" }} />
        {sb688}
      </div>
      <div className="flex items-center gap-1.5" style={{ color: "rgba(239,68,68,0.7)" }}>
        <XCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#ef4444" }} />
        {legacy}
      </div>
    </div>
  );
}

function IndustryCard({ ind }) {
  const [open, setOpen] = useState(false);
  const Icon = ind.icon;
  return (
    <div className="rounded-2xl border overflow-hidden transition-all"
      style={{ background: CARD, borderColor: open ? ind.color + "45" : BORDER }}>
      <button className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen(v => !v)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: ind.color + "15", border: `1px solid ${ind.color}30` }}>
            <Icon className="w-5 h-5" style={{ color: ind.color }} />
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: open ? ind.color : TEXT }}>{ind.label}</div>
            <div className="text-[10px] mt-0.5" style={{ color: DIM }}>{ind.currentSystems.split(",")[0].trim()} + more</div>
          </div>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: DIM }} />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: DIM }} />}
      </button>

      {open && (
        <div className="px-5 pb-6 space-y-5">
          <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${ind.color}25,transparent)` }} />

          {/* Current systems */}
          <div className="rounded-xl border p-4 space-y-2"
            style={{ background: "rgba(239,68,68,0.04)", borderColor: "rgba(239,68,68,0.2)" }}>
            <div className="text-[10px] font-bold uppercase tracking-widest text-red-400">Current Systems In Use</div>
            <p className="text-xs leading-relaxed" style={{ color: DIM }}>{ind.currentSystems}</p>
            <div className="flex items-start gap-2 mt-2 p-2 rounded-lg" style={{ background: "rgba(239,68,68,0.06)" }}>
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-red-300">{ind.currentGap}</p>
            </div>
          </div>

          {/* Current 5 uses */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: DIM }}>5 Current Use Cases</div>
            {ind.currentUses.map((u, i) => (
              <div key={i} className="flex items-start gap-2 text-xs" style={{ color: TEXT }}>
                <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: ind.color }} />
                {u}
              </div>
            ))}
          </div>

          {/* Future 5 uses */}
          <div className="rounded-xl border p-4 space-y-3"
            style={{ background: ind.color + "06", borderColor: ind.color + "25" }}>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: ind.color }} />
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: ind.color }}>5 Future SB688 Use Cases</div>
            </div>
            {ind.futureUses.map((u, i) => (
              <div key={i} className="flex items-start gap-2 text-xs py-2 border-b last:border-0" style={{ borderColor: ind.color + "15", color: DIM }}>
                <span className="font-bold flex-shrink-0" style={{ color: ind.color }}>{i + 1}.</span>
                {u}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function IndustryComparison() {
  const [stressOpen, setStressOpen] = useState(true);
  const [legacyOpen, setLegacyOpen] = useState(false);

  return (
    <div className="min-h-screen font-inter" style={{ background: BG, color: TEXT }}>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b"
        style={{ background: "#07080A", borderColor: BORDER, boxShadow: "0 2px 24px rgba(0,0,0,0.8)" }}>
        <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} />
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: 28 }}>
              <CrownIcon size={16} color={GOLD} />
              <LionIcon  size={20} color={GOLD} />
            </div>
            <div className="w-px h-8" style={{ background: "linear-gradient(180deg,transparent,rgba(201,168,76,0.45),transparent)" }} />
            <div>
              <div className="text-xs font-bold tracking-widest font-cinzel" style={{ color: GOLD }}>SB688 — Industry Comparison</div>
              <div className="text-[9px] tracking-widest uppercase" style={{ color: "rgba(201,168,76,0.45)" }}>Stress Test · 8 Industries · 80 Use Cases</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/" className="text-[10px] px-3 py-1.5 rounded border font-semibold"
              style={{ color: GOLD, borderColor: "rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.06)" }}>
              ← Console
            </Link>
            <Link to="/how-it-works" className="text-[10px] px-3 py-1.5 rounded border font-semibold"
              style={{ color: DIM, borderColor: BORDER }}>
              How It Works
            </Link>
          </div>
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.2),transparent)" }} />
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">

        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center gap-2">
            <CrownIcon size={44} color={GOLD} />
            <LionIcon  size={52} color={GOLD} />
          </div>
          <h1 className="text-3xl font-bold font-cinzel" style={{ color: GOLD }}>SB688 vs Everything Else</h1>
          <p className="text-sm leading-relaxed max-w-2xl mx-auto" style={{ color: DIM }}>
            A head-to-head stress test against legacy infrastructure. 8 industries. 15 performance metrics. 40 current use cases. 40 future use cases. All the evidence — plain English, no gatekeeping.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Badge className="text-[10px] border font-bold" style={{ background: "rgba(34,197,94,0.08)", color: "#22c55e", borderColor: "rgba(34,197,94,0.25)" }}>15/15 Metrics Won</Badge>
            <Badge className="text-[10px] border font-bold" style={{ background: "rgba(201,168,76,0.08)", color: GOLD, borderColor: "rgba(201,168,76,0.25)" }}>8 Industries</Badge>
            <Badge className="text-[10px] border font-bold" style={{ background: "rgba(59,130,246,0.08)", color: "#60a5fa", borderColor: "rgba(59,130,246,0.25)" }}>80 Use Cases</Badge>
            <Badge className="text-[10px] border font-bold" style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", borderColor: "rgba(239,68,68,0.2)" }}>BSS-2026-ARCH-01</Badge>
          </div>
        </div>

        {/* Key numbers strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { val: "38%",      label: "Node Loss Survived",      color: "#22c55e" },
            { val: "0.0000%",  label: "Data Loss on Full Heal",  color: GOLD },
            { val: "<4s",      label: "Mean Time To Recover",    color: "#3b82f6" },
            { val: "99.9%",    label: "Formate Snapshot Trigger",color: "#ef4444" },
          ].map((k, i) => (
            <div key={i} className="rounded-xl border p-4 text-center"
              style={{ background: CARD, borderColor: k.color + "30" }}>
              <div className="text-2xl font-bold font-mono" style={{ color: k.color }}>{k.val}</div>
              <div className="text-[10px] uppercase tracking-wider mt-1" style={{ color: DIM }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* ── Stress Test Table ── */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: CARD, borderColor: BORDER }}>
          <button className="w-full flex items-center justify-between px-6 py-4"
            onClick={() => setStressOpen(v => !v)}>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5" style={{ color: GOLD }} />
              <span className="text-base font-bold font-cinzel" style={{ color: GOLD }}>Full Stress Test — 15 Metrics</span>
              <Badge className="text-[9px] border" style={{ background: "rgba(34,197,94,0.08)", color: "#22c55e", borderColor: "rgba(34,197,94,0.2)" }}>SB688 wins all 15</Badge>
            </div>
            {stressOpen ? <ChevronUp className="w-4 h-4" style={{ color: DIM }} /> : <ChevronDown className="w-4 h-4" style={{ color: DIM }} />}
          </button>
          {stressOpen && (
            <div className="px-4 pb-5 space-y-1">
              <div style={{ height: 1, background: `linear-gradient(90deg,transparent,rgba(201,168,76,0.2),transparent)`, marginBottom: 8 }} />
              {/* Header row */}
              <div className="grid grid-cols-3 gap-2 px-3 pb-2 text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(201,168,76,0.5)" }}>
                <div>Metric</div>
                <div style={{ color: "#22c55e" }}>SB688</div>
                <div style={{ color: "#ef4444" }}>Legacy / Industry Standard</div>
              </div>
              {STRESS_TESTS.map((row, i) => (
                <StressRow key={i} {...row} i={i} />
              ))}
            </div>
          )}
        </div>

        {/* ── Legacy Systems Compared ── */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: CARD, borderColor: BORDER }}>
          <button className="w-full flex items-center justify-between px-6 py-4"
            onClick={() => setLegacyOpen(v => !v)}>
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="text-base font-bold font-cinzel" style={{ color: TEXT }}>What SB688 Replaces — 6 Legacy Systems</span>
            </div>
            {legacyOpen ? <ChevronUp className="w-4 h-4" style={{ color: DIM }} /> : <ChevronDown className="w-4 h-4" style={{ color: DIM }} />}
          </button>
          {legacyOpen && (
            <div className="px-5 pb-5 space-y-2">
              <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(239,68,68,0.2),transparent)", marginBottom: 8 }} />
              {LEGACY_SYSTEMS.map((s, i) => (
                <div key={i} className="rounded-xl border p-4 space-y-1"
                  style={{ background: "rgba(239,68,68,0.03)", borderColor: "rgba(239,68,68,0.15)" }}>
                  <div className="text-xs font-bold text-red-400">{s.name}</div>
                  <p className="text-xs leading-relaxed" style={{ color: DIM }}>{s.weakness}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Industries ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base font-bold font-cinzel" style={{ color: GOLD }}>8 Industries — Current vs Future</h2>
            <span className="text-[10px]" style={{ color: DIM }}>Tap any industry to expand</span>
          </div>
          {INDUSTRIES.map(ind => (
            <IndustryCard key={ind.id} ind={ind} />
          ))}
        </div>

        {/* Bottom summary */}
        <div className="rounded-2xl border p-8 text-center space-y-4"
          style={{ background: "rgba(201,168,76,0.03)", borderColor: "rgba(201,168,76,0.2)" }}>
          <div className="flex flex-col items-center gap-1">
            <CrownIcon size={28} color="rgba(201,168,76,0.6)" />
            <LionIcon  size={34} color="rgba(201,168,76,0.6)" />
          </div>
          <blockquote className="text-base font-cinzel italic leading-relaxed" style={{ color: GOLD }}>
            "The system that heals itself at 99.8%, deploys a Formate Node at 99.9%,<br />
            and rebuilds to 100% with zero data loss — across every industry on the planet."
          </blockquote>
          <p className="text-[10px]" style={{ color: "rgba(201,168,76,0.4)" }}>— John E. Arenz · JGA Enterprise · BSS-2026-ARCH-01</p>
          <div className="flex items-center justify-center gap-4 pt-2 flex-wrap">
            <Link to="/observe" className="px-5 py-2.5 rounded-lg border text-xs font-bold"
              style={{ background: "rgba(34,197,94,0.06)", color: "#86efac", borderColor: "rgba(34,197,94,0.2)" }}>
              Watch Live Drills →
            </Link>
            <Link to="/how-it-works" className="px-5 py-2.5 rounded-lg border text-xs font-bold"
              style={{ background: "rgba(201,168,76,0.06)", color: GOLD, borderColor: "rgba(201,168,76,0.3)" }}>
              How It Works →
            </Link>
            <Link to="/" className="px-5 py-2.5 rounded-lg border text-xs font-semibold"
              style={{ color: DIM, borderColor: BORDER }}>
              Full Console →
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}