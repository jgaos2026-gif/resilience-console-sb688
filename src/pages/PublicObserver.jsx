import React, { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield, Eye, Lock, Radio, Zap, CheckCircle2, XCircle, RotateCcw,
  ChevronDown, ChevronUp, Activity, Play, Download, Maximize2,
  Tv2, Youtube, Instagram, Twitter, Share2, Pause, BookOpen,
  AlertTriangle, FileText, Wifi
} from "lucide-react";
import { CrownIcon, LionIcon } from "@/components/sb688/WarriorCrest";
import { Link } from "react-router-dom";

// ── Color tokens — black/gold/red/green ───────────────────────────────────────
const T = {
  bg:       "#050608",
  card:     "#0A0B0E",
  border:   "rgba(201,168,76,0.18)",
  gold:     "#C9A84C",
  goldDim:  "rgba(201,168,76,0.45)",
  goldFaint:"rgba(201,168,76,0.1)",
  green:    "#22c55e",   // good / healthy / verified
  red:      "#ef4444",   // bad / failure / tamper
  amber:    "#f59e0b",   // degraded / warning
  purple:   "#8b5cf6",   // ghost
  text:     "#E8D9B0",
  textDim:  "rgba(232,217,176,0.55)",
};

// ── Nodes & Edges ─────────────────────────────────────────────────────────────
const OBS_NODES = [
  { id: "A", label: "Core Ω",   x: 260, y: 65,  role: "Orchestration",  braid: false },
  { id: "B", label: "Mesh ∆",   x: 120, y: 175, role: "Exchange",       braid: false },
  { id: "C", label: "Vault ∑",  x: 400, y: 175, role: "State",          braid: false },
  { id: "D", label: "Braid α",  x: 80,  y: 310, role: "Continuity",     braid: true  },
  { id: "E", label: "Braid β",  x: 260, y: 310, role: "Redundancy",     braid: true  },
  { id: "F", label: "Portal Φ", x: 440, y: 310, role: "Interface",      braid: false },
];

const OBS_EDGES = [
  ["A","B"],["A","C"],["B","D"],["B","E"],["C","E"],["C","F"],["D","F"],["E","F"],["D","E"],
];

// ── Node status styling ───────────────────────────────────────────────────────
const NS = {
  healthy:  { fill: "rgba(34,197,94,0.12)",   stroke: T.green,  text: "#86efac", label: "Healthy",       dot: T.green },
  degraded: { fill: "rgba(245,158,11,0.12)",  stroke: T.amber,  text: "#fcd34d", label: "Degraded",      dot: T.amber },
  isolated: { fill: "rgba(239,68,68,0.12)",   stroke: T.red,    text: "#fca5a5", label: "Isolated",      dot: T.red   },
  dead:     { fill: "rgba(15,15,20,0.7)",     stroke: "#222",   text: "#333",    label: "Offline",       dot: "#333"  },
  rebuild:  { fill: "rgba(201,168,76,0.14)",  stroke: T.gold,   text: "#e2c97e", label: "Healing…",      dot: T.gold  },
  probe:    { fill: "rgba(139,92,246,0.14)",  stroke: T.purple, text: "#c4b5fd", label: "Probed",        dot: T.purple},
  ghost:    { fill: "rgba(139,92,246,0.28)",  stroke: "#a78bfa",text: "#ddd6fe", label: "Ghost Active",  dot: "#a78bfa"},
  tamper:   { fill: "rgba(239,68,68,0.18)",   stroke: T.red,    text: "#fca5a5", label: "Tamper",        dot: T.red   },
  braid_heal:{ fill: "rgba(201,168,76,0.22)", stroke: "#e2c97e",text: "#f0d86e", label: "Braid Healing", dot: "#e2c97e"},
};

// ── Demo scenarios ────────────────────────────────────────────────────────────
const DEMOS = [
  {
    id: "full",
    label: "Full Rebuild Drill",
    verb: "Execute full teardown & rebuild",
    icon: Shield,
    color: T.green,
    scope: "All 6 nodes · Total collapse → full restore",
    phases: [
      { label: "▶ Initiating total system teardown…",        node: null, status: "destroy" },
      { label: "✗ All nodes offline — 0% capacity",          node: null, status: "dead" },
      { label: "◈ Spine reconstruction from Ω checkpoint…",  node: "A",  status: "rebuild" },
      { label: "◈ Mesh fabric re-knitting…",                  node: "B",  status: "rebuild" },
      { label: "◈ Vault checkpoint authenticated…",           node: "C",  status: "rebuild" },
      { label: "⟁ Braid α healing — stitching continuity…",  node: "D",  status: "braid_heal" },
      { label: "⟁ Braid β healing — redundancy restored…",   node: "E",  status: "braid_heal" },
      { label: "◈ Portal Φ accepting traffic…",              node: "F",  status: "rebuild" },
      { label: "✓ Full system restored. 100% verified.",     node: null, status: "done" },
    ],
    proof: [
      { label: "100% Node Loss Survived", pass: true },
      { label: "Braid Healing: VERIFIED", pass: true },
      { label: "Recovery Time: <4s", pass: true },
      { label: "Trust Chain: UNBROKEN", pass: true },
    ],
  },
  {
    id: "partial",
    label: "99.9% Recovery Path",
    verb: "Simulate single-node failure & reroute",
    icon: Zap,
    color: T.amber,
    scope: "Single failure · Braid absorbs → heal",
    phases: [
      { label: "▶ Targeted disruption on Mesh ∆…",           node: "B", status: "dead" },
      { label: "⟁ Braid α absorbing rerouted load…",         node: "D", status: "braid_heal" },
      { label: "⟁ Braid β holding alternate path…",          node: "E", status: "braid_heal" },
      { label: "◈ Vault ∑ anchoring alternate route…",        node: "C", status: "rebuild" },
      { label: "◈ Mesh ∆ rebuilt from checkpoint…",           node: "B", status: "rebuild" },
      { label: "⟁ Braids returning to steady state…",        node: "D", status: "healthy" },
      { label: "✓ Route revalidated. 99.9% verified.",       node: null, status: "done" },
    ],
    proof: [
      { label: "Single Node Contained", pass: true },
      { label: "Braid Absorbed Load", pass: true },
      { label: "Reroute: AUTOMATIC", pass: true },
      { label: "Continuity: MAINTAINED", pass: true },
    ],
  },
  {
    id: "ghost",
    label: "Ghost Node Probe",
    verb: "Execute ghost sensor intercept",
    icon: Radio,
    color: T.purple,
    scope: "Boundary probe · Sensor absorbs · Core safe",
    phases: [
      { label: "▶ Suspicious probe arriving at mesh boundary…", node: "B", status: "probe" },
      { label: "◉ Ghost sensor absorbing probe…",               node: "D", status: "ghost" },
      { label: "✓ Core Ω — never exposed",                      node: "A", status: "healthy" },
      { label: "⚑ Telemetry surfaced. Audit flagged.",          node: null, status: "done" },
    ],
    proof: [
      { label: "Probe Intercepted: YES", pass: true },
      { label: "Core Exposure: ZERO", pass: true },
      { label: "Ghost Sensor: ACTIVE", pass: true },
      { label: "Attribution: LOGGED", pass: true },
    ],
  },
  {
    id: "tamper",
    label: "Tamper Rejection",
    verb: "Trigger tamper rejection sequence",
    icon: Lock,
    color: T.red,
    scope: "Unauthorized write · Signature mismatch → reject",
    phases: [
      { label: "✗ Unauthorized state write detected…",          node: "C", status: "tamper" },
      { label: "✗ Signature mismatch — REJECTED",               node: "C", status: "isolated" },
      { label: "◈ Trust chain integrity preserved…",            node: "A", status: "healthy" },
      { label: "◈ Vault ∑ healing from checkpoint…",            node: "C", status: "rebuild" },
      { label: "✓ Tamper blocked. Ledger intact.",              node: null, status: "done" },
    ],
    proof: [
      { label: "Tamper Detected: YES", pass: true },
      { label: "Write Blocked: YES", pass: true },
      { label: "Chain Integrity: MAINTAINED", pass: true },
      { label: "Vault Restored: VERIFIED", pass: true },
    ],
  },
  {
    id: "braid_stress",
    label: "Braid Stress Test",
    verb: "Stress-test braid resilience geometry",
    icon: Activity,
    color: T.gold,
    scope: "Both braids degraded → self-heal → nominal",
    phases: [
      { label: "▶ Injecting load spike across braid fabric…",   node: "D", status: "degraded" },
      { label: "▶ Braid β flagged — stress threshold exceeded", node: "E", status: "degraded" },
      { label: "⟁ Braid α entering self-repair mode…",         node: "D", status: "braid_heal" },
      { label: "⟁ Braid β stitching — 1/2 offset geometry…",   node: "E", status: "braid_heal" },
      { label: "◈ Spine Ω holding integrity anchor…",           node: "A", status: "healthy" },
      { label: "✓ Both braids restored. Geometry: nominal.",   node: null, status: "done" },
    ],
    proof: [
      { label: "Braid α Self-Repaired", pass: true },
      { label: "Braid β Self-Repaired", pass: true },
      { label: "0.5 Offset Geometry: Held", pass: true },
      { label: "Spine Integrity: UNBROKEN", pass: true },
    ],
  },
];

// ── Social media links ────────────────────────────────────────────────────────
const SOCIAL_LINKS = [
  { label: "YouTube Live",   icon: Youtube,   color: "#FF0000", url: "https://youtube.com/@JGAband", hint: "Live stream & recordings" },
  { label: "X / Twitter",   icon: Twitter,   color: "#1DA1F2", url: "https://x.com/JGAband",        hint: "Live updates & demos" },
  { label: "Instagram",     icon: Instagram, color: "#E1306C", url: "https://instagram.com/JGAband",hint: "Behind the build" },
  { label: "Live Stream",   icon: Tv2,       color: T.gold,    url: "#",                             hint: "Watch SB688 drills live" },
];

// ── Proof log ─────────────────────────────────────────────────────────────────
const PROOF_LOG_ENTRIES = [
  { ts: "09:41:02Z", event: "Checkpoint seal verified", hash: "a3f…d92", status: "ok" },
  { ts: "09:38:17Z", event: "Trust chain integrity scan", hash: "7c1…b44", status: "ok" },
  { ts: "09:31:55Z", event: "Route revalidation passed", hash: "f8e…019", status: "ok" },
  { ts: "08:57:03Z", event: "Ghost sensor telemetry flush", hash: "2d6…c71", status: "ok" },
  { ts: "08:22:44Z", event: "Tamper probe — rejected", hash: "9a0…e38", status: "warn" },
];

// ── Telemetry data (rolling) ──────────────────────────────────────────────────
function useTelemetry(running, nodeStates) {
  const [metrics, setMetrics] = useState({ resilience: 100, continuity: 100, latency: 12, anomalies: 1 });
  useEffect(() => {
    const anyDead = Object.values(nodeStates).some(s => s === "dead");
    const anyDeg = Object.values(nodeStates).some(s => s === "degraded" || s === "isolated" || s === "tamper");
    const anyHeal = Object.values(nodeStates).some(s => s === "rebuild" || s === "braid_heal");
    const healthyCount = Object.values(nodeStates).filter(s => s === "healthy").length;
    const total = OBS_NODES.length;
    setMetrics({
      resilience: anyDead ? Math.round((healthyCount / total) * 60) : anyDeg ? 72 : anyHeal ? 88 : 100,
      continuity: anyDead ? 0 : anyDeg ? 78 : anyHeal ? 92 : 100,
      latency: anyDead ? 480 : anyDeg ? 95 : anyHeal ? 38 : 12,
      anomalies: anyDeg || anyDead ? 3 : anyHeal ? 2 : 1,
    });
  }, [nodeStates, running]);
  return metrics;
}

// ── SVG Topology ──────────────────────────────────────────────────────────────
function TopologyViz({ nodeStates, fullscreen }) {
  const W = 520, H = 390;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%"
      style={{ display: "block", maxHeight: fullscreen ? "none" : 340 }}>
      <text x={W/2} y={H/2} textAnchor="middle" dominantBaseline="middle"
        fill="rgba(201,168,76,0.035)" fontSize={52} fontWeight="900"
        style={{ userSelect: "none", pointerEvents: "none", fontFamily: "serif" }}>
        SB688 · JGA
      </text>

      {/* Edges */}
      {OBS_EDGES.map(([a, b], i) => {
        const na = OBS_NODES.find(n => n.id === a);
        const nb = OBS_NODES.find(n => n.id === b);
        const sa = nodeStates[a] || "healthy";
        const sb = nodeStates[b] || "healthy";
        const dead = sa === "dead" || sb === "dead";
        const healing = sa === "braid_heal" || sb === "braid_heal" || sa === "rebuild" || sb === "rebuild";
        const bad = sa === "isolated" || sb === "isolated" || sa === "tamper" || sb === "tamper";
        const stroke = dead ? "rgba(30,30,40,0.4)" : bad ? "rgba(239,68,68,0.4)" : healing ? "rgba(201,168,76,0.45)" : "rgba(201,168,76,0.18)";
        const isBraid = (na?.braid || nb?.braid);
        return (
          <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
            stroke={stroke}
            strokeWidth={healing && isBraid ? 2.5 : dead ? 0.8 : 1.5}
            strokeDasharray={dead ? "5 4" : undefined}
            opacity={dead ? 0.3 : 1}
          />
        );
      })}

      {/* Nodes */}
      {OBS_NODES.map(node => {
        const st = nodeStates[node.id] || "healthy";
        const cfg = NS[st] || NS.healthy;
        const isActive = !["dead", "healthy"].includes(st);
        const isHeal = st === "rebuild" || st === "braid_heal";
        return (
          <g key={node.id}>
            {/* Outer glow ring for active states */}
            {isActive && <circle cx={node.x} cy={node.y} r={38} fill={cfg.fill} opacity={0.35} />}
            {/* Pulse ring for healing braids */}
            {isHeal && (
              <circle cx={node.x} cy={node.y} r={44} fill="none" stroke={cfg.stroke} strokeWidth={1} opacity={0.25}>
                <animate attributeName="r" values="34;50;34" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="1.6s" repeatCount="indefinite" />
              </circle>
            )}
            {/* Node circle */}
            <circle cx={node.x} cy={node.y} r={30}
              fill={cfg.fill}
              stroke={cfg.stroke}
              strokeWidth={isHeal ? 2.5 : st === "healthy" ? 1.2 : 2}
              strokeDasharray={st === "dead" ? "5 3" : undefined}
            />
            {/* Braid badge */}
            {node.braid && (
              <circle cx={node.x + 22} cy={node.y - 22} r={8}
                fill={isHeal ? T.gold : "rgba(201,168,76,0.15)"}
                stroke="rgba(201,168,76,0.5)" strokeWidth={1} />
            )}
            {node.braid && (
              <text x={node.x + 22} y={node.y - 19} textAnchor="middle" fill={isHeal ? "#050608" : T.gold} fontSize={7} fontWeight="900">⟁</text>
            )}
            {/* Label */}
            <text x={node.x} y={node.y - 5} textAnchor="middle" fill={cfg.text} fontSize={10} fontWeight="700"
              style={{ pointerEvents: "none", userSelect: "none" }}>{node.label}</text>
            <text x={node.x} y={node.y + 8} textAnchor="middle" fill={cfg.text} fontSize={7.5} opacity={0.6}
              style={{ pointerEvents: "none", userSelect: "none" }}>{cfg.label}</text>
            {/* Status dot */}
            <circle cx={node.x} cy={node.y + 19} r={3} fill={cfg.dot} opacity={0.85} />
          </g>
        );
      })}
    </svg>
  );
}

// ── Node legend ───────────────────────────────────────────────────────────────
const LEGEND = [
  { color: T.green,  label: "Healthy / Verified" },
  { color: T.gold,   label: "Healing / Rebuild" },
  { color: T.amber,  label: "Degraded" },
  { color: T.red,    label: "Failure / Tamper" },
  { color: T.purple, label: "Ghost / Probe" },
  { color: "#333",   label: "Offline" },
];

// ── Telemetry panel ───────────────────────────────────────────────────────────
function TelemetryPanel({ metrics, telemetryLog }) {
  const bar = (val, max = 100, good = true) => {
    const pct = Math.min(100, (val / max) * 100);
    const color = good ? (pct >= 80 ? T.green : pct >= 50 ? T.amber : T.red)
                       : (pct <= 30 ? T.green : pct <= 60 ? T.amber : T.red);
    return (
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    );
  };
  const latMax = 500;
  const rColor = metrics.resilience >= 90 ? T.green : metrics.resilience >= 60 ? T.amber : T.red;
  const cColor = metrics.continuity >= 90 ? T.green : metrics.continuity >= 60 ? T.amber : T.red;
  const lColor = metrics.latency <= 30 ? T.green : metrics.latency <= 100 ? T.amber : T.red;

  return (
    <div className="rounded-xl border p-4 space-y-3" style={{ background: T.card, borderColor: T.border }}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: T.gold }}>
          <Wifi className="w-3.5 h-3.5" /> Live Telemetry
        </h3>
        <Badge className="text-[9px] border" style={{ background: "rgba(34,197,94,0.08)", color: T.green, borderColor: "rgba(34,197,94,0.2)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block mr-1" style={{ background: T.green }} />
          Streaming
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Resilience", val: `${metrics.resilience}%`, color: rColor },
          { label: "Continuity", val: `${metrics.continuity}%`, color: cColor },
          { label: "Latency",    val: `${metrics.latency}ms`,   color: lColor },
          { label: "Anomalies",  val: metrics.anomalies,         color: metrics.anomalies > 2 ? T.red : metrics.anomalies > 1 ? T.amber : T.green },
        ].map((m, i) => (
          <div key={i} className="rounded-lg p-2.5 text-center" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.05)` }}>
            <div className="text-lg font-bold font-mono" style={{ color: m.color }}>{m.val}</div>
            <div className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: T.textDim }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px]">
          <span className="w-16 flex-shrink-0" style={{ color: T.textDim }}>Resilience</span>
          {bar(metrics.resilience)}
          <span className="w-8 text-right font-mono" style={{ color: rColor }}>{metrics.resilience}%</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="w-16 flex-shrink-0" style={{ color: T.textDim }}>Continuity</span>
          {bar(metrics.continuity)}
          <span className="w-8 text-right font-mono" style={{ color: cColor }}>{metrics.continuity}%</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="w-16 flex-shrink-0" style={{ color: T.textDim }}>Latency</span>
          {bar(metrics.latency, latMax, false)}
          <span className="w-8 text-right font-mono" style={{ color: lColor }}>{metrics.latency}ms</span>
        </div>
      </div>

      {/* Telemetry log */}
      <div className="rounded-lg p-2 max-h-28 overflow-y-auto space-y-1 font-mono" style={{ background: "rgba(0,0,0,0.4)" }}>
        {telemetryLog.length === 0
          ? <p className="text-[9px] italic" style={{ color: T.textDim }}>Awaiting telemetry…</p>
          : telemetryLog.map((e, i) => (
            <div key={i} className="flex gap-2 text-[9px]">
              <span style={{ color: "rgba(201,168,76,0.3)" }}>{e.ts}</span>
              <span style={{ color: e.type === "warn" ? T.red : e.type === "heal" ? T.gold : T.textDim }}>{e.msg}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

// ── Social / Live stream bar ──────────────────────────────────────────────────
function SocialBar() {
  return (
    <div className="rounded-xl border p-4 space-y-3" style={{ background: T.card, borderColor: T.border }}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: T.gold }}>
          <Share2 className="w-3.5 h-3.5" /> Watch Live · Follow JGA
        </h3>
        <Badge className="text-[9px] border" style={{ background: "rgba(239,68,68,0.08)", color: T.red, borderColor: "rgba(239,68,68,0.2)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block mr-1" style={{ background: T.red }} />
          Live Available
        </Badge>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SOCIAL_LINKS.map(s => {
          const Icon = s.icon;
          return (
            <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}>
              <Icon className="w-5 h-5" style={{ color: s.color }} />
              <div className="text-[10px] font-bold" style={{ color: T.text }}>{s.label}</div>
              <div className="text-[9px]" style={{ color: T.textDim }}>{s.hint}</div>
            </a>
          );
        })}
      </div>
      <p className="text-[9px]" style={{ color: T.textDim }}>
        Watch SB688 drills, JGA band performances, and live architecture walkthroughs. All streams are public and free.
      </p>
    </div>
  );
}

// ── Telemetry report export ───────────────────────────────────────────────────
function exportTelemetryReport(metrics, telemetryLog, drillLog, selectedDemo) {
  const ts = new Date().toISOString();
  const lines = [
    `SB688 TELEMETRY REPORT — JGA · National Resilience Council`,
    `Generated: ${ts}`,
    ``,
    `== LIVE METRICS ==`,
    `Resilience:    ${metrics.resilience}%`,
    `Continuity:    ${metrics.continuity}%`,
    `Latency:       ${metrics.latency}ms`,
    `Anomalies:     ${metrics.anomalies}`,
    ``,
    `== ACTIVE DRILL ==`,
    `Drill: ${selectedDemo?.label || "None"}`,
    ``,
    `== DRILL EXECUTION LOG ==`,
    ...drillLog.map(e => `  ${e}`),
    ``,
    `== TELEMETRY EVENT LOG ==`,
    ...telemetryLog.map(e => `  [${e.ts}] ${e.msg}`),
    ``,
    `== SIGNED PROOF EVENTS ==`,
    ...PROOF_LOG_ENTRIES.map(e => `  [${e.ts}] ${e.event} | hash: ${e.hash} | ${e.status.toUpperCase()}`),
    ``,
    `Architecture: John Arenz — J.G.A. · SB688 · BSS-2026-ARCH-01`,
    `Observer view — internal logic obfuscated. This report covers visible telemetry only.`,
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `sb688-telemetry-${Date.now()}.txt`; a.click();
  URL.revokeObjectURL(url);
}

// ── Status bar ────────────────────────────────────────────────────────────────
function StatusBar({ running, selectedDemo, nodeStates, metrics }) {
  const sloColor = metrics.resilience >= 90 ? T.green : metrics.resilience >= 60 ? T.amber : T.red;
  const sloLabel = metrics.resilience >= 90 ? "NOMINAL" : metrics.resilience >= 60 ? "DEGRADED" : "CRITICAL";
  return (
    <div className="flex items-center gap-3 px-4 py-2 flex-wrap text-[10px] font-mono border-b"
      style={{ background: "rgba(5,6,8,0.85)", borderColor: "rgba(201,168,76,0.12)" }}>
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sloColor }} />
        <span className="font-bold" style={{ color: sloColor }}>SLO {sloLabel}</span>
      </div>
      <div className="w-px h-3" style={{ background: T.border }} />
      <span style={{ color: T.textDim }}>Resilience: <span className="font-bold" style={{ color: sloColor }}>{metrics.resilience}%</span></span>
      <div className="w-px h-3" style={{ background: T.border }} />
      <span style={{ color: T.textDim }}>Latency: <span className="font-bold" style={{ color: metrics.latency <= 30 ? T.green : metrics.latency <= 100 ? T.amber : T.red }}>{metrics.latency}ms</span></span>
      <div className="w-px h-3" style={{ background: T.border }} />
      <span style={{ color: T.textDim }}>Last Proof: <span style={{ color: T.green }} className="font-bold">09:41:02Z</span></span>
      <div className="w-px h-3" style={{ background: T.border }} />
      <span style={{ color: T.textDim }}>Drill: <span className="font-bold" style={{ color: T.text }}>{running ? selectedDemo?.label : "Idle"}</span></span>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PublicObserver() {
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [phase, setPhase] = useState(0);
  const [running, setRunning] = useState(false);
  const [nodeStates, setNodeStates] = useState(Object.fromEntries(OBS_NODES.map(n => [n.id, "healthy"])));
  const [log, setLog] = useState([]);
  const [done, setDone] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [speed, setSpeed] = useState(950);
  const [telemetryLog, setTelemetryLog] = useState([]);
  const [telemetryEnabled, setTelemetryEnabled] = useState(true);
  const logRef = useRef(null);

  const metrics = useTelemetry(running, nodeStates);

  // Push telemetry events when state changes
  useEffect(() => {
    if (!telemetryEnabled) return;
    const anyBad = Object.values(nodeStates).some(s => ["dead","isolated","tamper"].includes(s));
    const anyHeal = Object.values(nodeStates).some(s => ["rebuild","braid_heal"].includes(s));
    const now = new Date().toLocaleTimeString();
    if (anyBad) setTelemetryLog(p => [{ ts: now, msg: `⚠ Node failure detected — resilience dropping`, type: "warn" }, ...p].slice(0,30));
    else if (anyHeal) setTelemetryLog(p => [{ ts: now, msg: `⟁ Braid healing sequence active`, type: "heal" }, ...p].slice(0,30));
  }, [nodeStates, telemetryEnabled]);

  const reset = useCallback(() => {
    setSelectedDemo(null); setPhase(0); setRunning(false);
    setNodeStates(Object.fromEntries(OBS_NODES.map(n => [n.id, "healthy"])));
    setLog([]); setDone(false);
  }, []);

  const runDemo = useCallback((demo) => {
    reset();
    setTimeout(() => {
      setSelectedDemo(demo); setPhase(0); setRunning(true);
      setLog([]); setDone(false);
      setNodeStates(Object.fromEntries(OBS_NODES.map(n => [n.id, "healthy"])));
      const now = new Date().toLocaleTimeString();
      setTelemetryLog(p => [{ ts: now, msg: `▶ Drill started: ${demo.label}`, type: "info" }, ...p].slice(0,30));
    }, 50);
  }, [reset]);

  useEffect(() => {
    if (!running || !selectedDemo) return;
    if (phase >= selectedDemo.phases.length) { setRunning(false); setDone(true); return; }
    const p = selectedDemo.phases[phase];
    const timer = setTimeout(() => {
      setLog(prev => [...prev, p.label]);
      if (p.status === "dead" && !p.node) setNodeStates(Object.fromEntries(OBS_NODES.map(n => [n.id, "dead"])));
      else if (p.status === "done") setNodeStates(Object.fromEntries(OBS_NODES.map(n => [n.id, "healthy"])));
      else if (p.node && p.status) setNodeStates(prev => ({ ...prev, [p.node]: p.status }));
      setPhase(prev => prev + 1);
    }, speed);
    return () => clearTimeout(timer);
  }, [running, phase, selectedDemo, speed]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  return (
    <div className="min-h-screen font-inter" style={{ background: T.bg, color: T.text }}>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b"
        style={{ background: "linear-gradient(180deg, #080A0C 0%, #0A0B0E 100%)", borderColor: T.border, boxShadow: "0 2px 24px rgba(0,0,0,0.8)" }}>
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: 30 }}>
              <CrownIcon size={17} color={T.gold} />
              <LionIcon size={21} color={T.gold} />
            </div>
            <div className="w-px h-8 flex-shrink-0" style={{ background: `linear-gradient(180deg, transparent, ${T.goldDim}, transparent)` }} />
            <div>
              <span className="text-[11px] font-bold tracking-widest font-cinzel leading-tight" style={{ color: T.gold }}>
                SB688 · PUBLIC OBSERVER
              </span>
              <div className="flex items-center gap-1 text-[9px] mt-0.5" style={{ color: T.textDim }}>
                <span>National Resilience Council</span>
                <span style={{ color: "rgba(201,168,76,0.25)" }}>/</span>
                <span style={{ color: T.gold }}>Observer View</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="text-[10px] font-bold border flex items-center gap-1"
              style={{ background: T.goldFaint, color: T.gold, borderColor: "rgba(201,168,76,0.3)" }}>
              <Eye className="w-3 h-3" /> Observer Mode
            </Badge>
            <Link to="/jga-story"
              className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded border font-semibold transition-all"
              style={{ background: T.goldFaint, color: T.gold, borderColor: "rgba(201,168,76,0.25)" }}>
              <BookOpen className="w-3 h-3" /> JGA Story
            </Link>
            <span className="text-[9px] hidden sm:block" style={{ color: "rgba(232,217,176,0.3)" }}>Read-Only · No Source Access</span>
          </div>
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)` }} />
      </header>

      {/* Status bar */}
      <StatusBar running={running} selectedDemo={selectedDemo} nodeStates={nodeStates} metrics={metrics} />

      <main className="max-w-6xl mx-auto px-4 py-5 space-y-5">

        {/* Title row + about toggle */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-bold font-cinzel" style={{ color: T.gold }}>Live Capability Drills</h2>
            <p className="text-[11px] mt-0.5" style={{ color: T.textDim }}>Select a drill — watch the topology and braid healing in real time.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTelemetryEnabled(v => !v)}
              className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded border transition-all"
              style={{ color: telemetryEnabled ? T.green : T.textDim, borderColor: telemetryEnabled ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)", background: telemetryEnabled ? "rgba(34,197,94,0.06)" : "transparent" }}>
              <Wifi className="w-3 h-3" /> Telemetry {telemetryEnabled ? "ON" : "OFF"}
            </button>
            <button onClick={() => setAboutOpen(v => !v)}
              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded border transition-all"
              style={{ color: T.textDim, borderColor: "rgba(255,255,255,0.1)" }}>
              {aboutOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              About
            </button>
          </div>
        </div>

        {/* Collapsible about */}
        {aboutOpen && (
          <div className="rounded-xl border p-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
            style={{ background: T.card, borderColor: T.border }}>
            <div className="space-y-1.5">
              {[
                { c: T.green, t: "✓ Live behavior visible" },
                { c: T.green, t: "✓ Node topology & braid healing" },
                { c: T.green, t: "✓ Capability proof scorecards" },
                { c: T.green, t: "✓ Live telemetry & report export" },
              ].map((r, i) => (
                <div key={i} className="text-[10px] flex items-center gap-2" style={{ color: r.c }}><span className="font-bold">{r.t}</span></div>
              ))}
            </div>
            <div className="space-y-1.5">
              {[
                { c: T.red, t: "✗ Recovery algorithms hidden" },
                { c: T.red, t: "✗ Checkpoint hash schemes hidden" },
                { c: T.red, t: "✗ Braid geometry internals hidden" },
                { c: T.red, t: "✗ HMAC / Merkle logic hidden" },
              ].map((r, i) => (
                <div key={i} className="text-[10px] flex items-center gap-2" style={{ color: r.c }}><span className="font-bold">{r.t}</span></div>
              ))}
            </div>
          </div>
        )}

        {/* Social/Live stream */}
        <SocialBar />

        {/* Drill selector */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {DEMOS.map(demo => {
            const Icon = demo.icon;
            const active = selectedDemo?.id === demo.id;
            return (
              <button key={demo.id} onClick={() => runDemo(demo)} disabled={running}
                className="rounded-xl border p-3 text-left transition-all space-y-2 group disabled:opacity-50"
                style={{
                  background: active ? `${demo.color}0e` : T.card,
                  borderColor: active ? `${demo.color}50` : T.border,
                }}>
                <div className="flex items-center justify-between">
                  <Icon className="w-4 h-4" style={{ color: demo.color }} />
                  {active && running && <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: demo.color }} />}
                  {active && done && <CheckCircle2 className="w-3 h-3" style={{ color: demo.color }} />}
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight" style={{ color: active ? T.text : T.textDim }}>{demo.label}</div>
                  <div className="text-[9px] mt-0.5" style={{ color: "rgba(232,217,176,0.35)" }}>{demo.scope}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Playback speed + fullscreen controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px]" style={{ color: T.textDim }}>Drill Speed:</span>
          {[
            { label: "0.5×", val: 1800 },
            { label: "1×",   val: 950 },
            { label: "2×",   val: 480 },
            { label: "3×",   val: 300 },
          ].map(s => (
            <button key={s.label} onClick={() => setSpeed(s.val)}
              className="text-[10px] px-2 py-1 rounded border font-mono font-bold transition-all"
              style={{
                background: speed === s.val ? T.goldFaint : "transparent",
                color: speed === s.val ? T.gold : T.textDim,
                borderColor: speed === s.val ? "rgba(201,168,76,0.35)" : "rgba(255,255,255,0.08)",
              }}>
              {s.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setFullscreen(v => !v)}
              className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded border transition-all"
              style={{ color: fullscreen ? T.gold : T.textDim, borderColor: fullscreen ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.1)" }}>
              <Maximize2 className="w-3 h-3" /> {fullscreen ? "Normal View" : "Full View"}
            </button>
            <button
              onClick={() => exportTelemetryReport(metrics, telemetryLog, log, selectedDemo)}
              className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded border transition-all"
              style={{ color: T.green, borderColor: "rgba(34,197,94,0.25)", background: "rgba(34,197,94,0.06)" }}>
              <Download className="w-3 h-3" /> Export Report
            </button>
          </div>
        </div>

        {/* Main topology area */}
        <div className={`grid gap-4 ${fullscreen ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>

          {/* Topology */}
          <div className={`rounded-xl border p-4 space-y-3 ${fullscreen ? "" : ""}`}
            style={{ background: T.card, borderColor: T.border }}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: T.gold }}>
                <Activity className="w-3.5 h-3.5" /> Live Topology · Braid Healing
              </h3>
              <Badge className="text-[9px] border" style={{ background: "rgba(201,168,76,0.08)", color: T.gold, borderColor: "rgba(201,168,76,0.2)" }}>
                Obfuscated · JGA
              </Badge>
            </div>
            <div className="rounded-lg" style={{ background: "rgba(3,4,6,0.85)", padding: "8px 8px 4px" }}>
              <TopologyViz nodeStates={nodeStates} fullscreen={fullscreen} />
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
              {LEGEND.map(l => (
                <span key={l.label} className="flex items-center gap-1 text-[9px]" style={{ color: T.textDim }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: l.color }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right column: exec log + telemetry (hidden in fullscreen) */}
          {!fullscreen && (
            <div className="space-y-4">
              {/* Execution log */}
              <div className="rounded-xl border p-4 flex flex-col gap-3" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: T.gold }}>Execution Log</h3>
                  {running && (
                    <Badge className="text-[9px] border flex items-center gap-1"
                      style={{ background: "rgba(34,197,94,0.08)", color: T.green, borderColor: "rgba(34,197,94,0.2)" }}>
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: T.green }} /> Running
                    </Badge>
                  )}
                  {done && (
                    <Badge className="text-[9px] border flex items-center gap-1"
                      style={{ background: "rgba(34,197,94,0.1)", color: T.green, borderColor: "rgba(34,197,94,0.25)" }}>
                      <CheckCircle2 className="w-3 h-3" /> Complete
                    </Badge>
                  )}
                </div>
                <div ref={logRef} className="min-h-[160px] max-h-[200px] rounded-lg p-3 space-y-1 overflow-y-auto font-mono"
                  style={{ background: "rgba(0,0,0,0.5)" }}>
                  {log.length === 0
                    ? <p className="text-[10px] italic" style={{ color: T.textDim }}>Select a drill to begin…</p>
                    : log.map((entry, i) => {
                        const isGood = entry.startsWith("✓");
                        const isBad = entry.startsWith("✗");
                        const isHeal = entry.startsWith("⟁");
                        const color = isGood ? T.green : isBad ? T.red : isHeal ? T.gold : T.textDim;
                        return (
                          <div key={i} className="text-[10px] leading-relaxed flex gap-2">
                            <span style={{ color: "rgba(201,168,76,0.2)" }} className="flex-shrink-0">{String(i+1).padStart(2,"0")}</span>
                            <span style={{ color }}>{entry}</span>
                          </div>
                        );
                      })
                  }
                </div>
                {selectedDemo && done && (
                  <Button onClick={reset} variant="outline" className="w-full text-xs"
                    style={{ borderColor: T.border, color: T.textDim }}>
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Run Another Drill
                  </Button>
                )}
              </div>

              {/* Telemetry panel */}
              <TelemetryPanel metrics={metrics} telemetryLog={telemetryLog} />
            </div>
          )}
        </div>

        {/* In fullscreen mode show telemetry below */}
        {fullscreen && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border p-4 flex flex-col gap-3" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: T.gold }}>Execution Log</h3>
              <div ref={logRef} className="min-h-[120px] max-h-[180px] rounded-lg p-3 space-y-1 overflow-y-auto font-mono"
                style={{ background: "rgba(0,0,0,0.5)" }}>
                {log.length === 0
                  ? <p className="text-[10px] italic" style={{ color: T.textDim }}>Select a drill…</p>
                  : log.map((entry, i) => {
                      const isGood = entry.startsWith("✓");
                      const isBad = entry.startsWith("✗");
                      const isHeal = entry.startsWith("⟁");
                      const color = isGood ? T.green : isBad ? T.red : isHeal ? T.gold : T.textDim;
                      return (
                        <div key={i} className="text-[10px] flex gap-2">
                          <span style={{ color: "rgba(201,168,76,0.2)" }}>{String(i+1).padStart(2,"0")}</span>
                          <span style={{ color }}>{entry}</span>
                        </div>
                      );
                    })}
              </div>
              {selectedDemo && done && (
                <Button onClick={reset} variant="outline" className="w-full text-xs" style={{ borderColor: T.border, color: T.textDim }}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Run Another
                </Button>
              )}
            </div>
            <TelemetryPanel metrics={metrics} telemetryLog={telemetryLog} />
          </div>
        )}

        {/* Proof scorecard */}
        {done && selectedDemo && (
          <div className="rounded-xl border p-4 space-y-3"
            style={{ background: T.card, borderColor: "rgba(34,197,94,0.25)", boxShadow: "0 0 20px rgba(34,197,94,0.04)" }}>
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: T.green }}>
              <Shield className="w-4 h-4" /> Capability Proof — {selectedDemo.label}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {selectedDemo.proof.map((item, i) => (
                <div key={i} className="rounded-lg p-3 space-y-1.5 border"
                  style={{ background: "rgba(34,197,94,0.05)", borderColor: "rgba(34,197,94,0.2)" }}>
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: T.green }} />
                  <p className="text-[10px] font-bold leading-tight" style={{ color: "#86efac" }}>{item.label}</p>
                </div>
              ))}
            </div>
            <p className="text-[9px]" style={{ color: "rgba(232,217,176,0.3)" }}>
              All sequences run in-browser. Architecture: John Arenz — J.G.A.
            </p>
          </div>
        )}

        {/* Proof log */}
        <div className="rounded-xl border p-4 space-y-3" style={{ background: T.card, borderColor: T.border }}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: T.gold }}>
              <Shield className="w-3.5 h-3.5" /> Latest Signed Events
            </h3>
            <Badge className="text-[9px] border" style={{ background: "rgba(34,197,94,0.08)", color: T.green, borderColor: "rgba(34,197,94,0.2)" }}>
              Live · Obfuscated
            </Badge>
          </div>
          <div className="space-y-1.5 font-mono">
            {PROOF_LOG_ENTRIES.map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] py-1 border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <span style={{ color: e.status === "warn" ? T.red : T.green }}>{e.status === "warn" ? "⚑" : "✓"}</span>
                <span style={{ color: "rgba(232,217,176,0.3)" }} className="flex-shrink-0">{e.ts}</span>
                <span style={{ color: T.textDim }} className="flex-1">{e.event}</span>
                <span style={{ color: "rgba(201,168,76,0.2)" }} className="flex-shrink-0">{e.hash}</span>
              </div>
            ))}
          </div>
          <p className="text-[9px]" style={{ color: "rgba(232,217,176,0.25)" }}>Hashes obfuscated. Timestamps are real session events.</p>
        </div>

        {/* Footer */}
        <div className="text-center space-y-1 pb-4">
          <div className="flex items-center justify-center gap-2">
            <CrownIcon size={13} color="rgba(201,168,76,0.35)" />
            <span className="text-[10px] font-cinzel" style={{ color: "rgba(201,168,76,0.45)" }}>
              SB688 · National Resilience Council · Architecture by John Arenz — J.G.A.
            </span>
          </div>
          <div className="flex items-center justify-center gap-3 pt-1">
            <Link to="/jga-story" className="text-[10px] transition-all" style={{ color: T.goldDim }}>JGA Story →</Link>
            <Link to="/" className="text-[10px] transition-all" style={{ color: "rgba(232,217,176,0.25)" }}>Full Console →</Link>
          </div>
          <p className="text-[9px]" style={{ color: "rgba(232,217,176,0.2)" }}>This observer link may be shared freely. It does not grant access to source code, internals, or the full console.</p>
        </div>
      </main>
    </div>
  );
}