import React, { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield, Eye, Lock, Radio, Zap, CheckCircle2, RotateCcw, Activity, Download,
  Tv2, Youtube, Instagram, Twitter, Share2, BookOpen, Wifi
} from "lucide-react";
import { CrownIcon, LionIcon } from "@/components/sb688/WarriorCrest";
import { Link } from "react-router-dom";

// ── Color tokens ──────────────────────────────────────────────────────────────
const T = {
  bg:        "#050608",
  card:      "#0A0B0E",
  border:    "rgba(201,168,76,0.18)",
  gold:      "#C9A84C",
  goldDim:   "rgba(201,168,76,0.45)",
  goldFaint: "rgba(201,168,76,0.1)",
  green:     "#22c55e",
  red:       "#ef4444",
  amber:     "#f59e0b",
  purple:    "#8b5cf6",
  text:      "#E8D9B0",
  textDim:   "rgba(232,217,176,0.55)",
};

// ── Nodes & Edges ─────────────────────────────────────────────────────────────
const OBS_NODES = [
  { id: "A", label: "Core Ω",   x: 260, y: 65,  role: "Orchestration", braid: false },
  { id: "B", label: "Mesh ∆",   x: 120, y: 175, role: "Exchange",      braid: false },
  { id: "C", label: "Vault ∑",  x: 400, y: 175, role: "State",         braid: false },
  { id: "D", label: "Braid α",  x: 80,  y: 310, role: "Continuity",    braid: true  },
  { id: "E", label: "Braid β",  x: 260, y: 310, role: "Redundancy",    braid: true  },
  { id: "F", label: "Portal Φ", x: 440, y: 310, role: "Interface",     braid: false },
];

const OBS_EDGES = [
  ["A","B"],["A","C"],["B","D"],["B","E"],["C","E"],["C","F"],["D","F"],["E","F"],["D","E"],
];

// ── Node status styling ───────────────────────────────────────────────────────
const NS = {
  healthy:   { fill: "rgba(34,197,94,0.15)",  stroke: T.green,   text: "#86efac", label: "Healthy",      dot: T.green },
  degraded:  { fill: "rgba(245,158,11,0.15)", stroke: T.amber,   text: "#fcd34d", label: "Degraded",     dot: T.amber },
  isolated:  { fill: "rgba(239,68,68,0.15)",  stroke: T.red,     text: "#fca5a5", label: "Isolated",     dot: T.red   },
  dead:      { fill: "rgba(15,15,20,0.7)",    stroke: "#222",    text: "#444",    label: "Offline",      dot: "#333"  },
  rebuild:   { fill: "rgba(201,168,76,0.18)", stroke: T.gold,    text: "#e2c97e", label: "Healing…",     dot: T.gold  },
  probe:     { fill: "rgba(139,92,246,0.18)", stroke: T.purple,  text: "#c4b5fd", label: "Probed",       dot: T.purple},
  ghost:     { fill: "rgba(139,92,246,0.3)",  stroke: "#a78bfa", text: "#ddd6fe", label: "Ghost Active", dot: "#a78bfa"},
  tamper:    { fill: "rgba(239,68,68,0.2)",   stroke: T.red,     text: "#fca5a5", label: "Tamper",       dot: T.red   },
  braid_heal:{ fill: "rgba(201,168,76,0.25)", stroke: "#e2c97e", text: "#f0d86e", label: "Braid Heal",   dot: "#e2c97e"},
};

// ── Demo scenarios ────────────────────────────────────────────────────────────
const DEMOS = [
  {
    id: "full", label: "Full Rebuild", icon: Shield, color: T.green,
    scope: "Total collapse → full restore",
    phases: [
      { label: "▶ Total system teardown…",              node: null, status: "destroy" },
      { label: "✗ All nodes offline — 0%",              node: null, status: "dead" },
      { label: "◈ Spine rebuilt from checkpoint…",      node: "A",  status: "rebuild" },
      { label: "◈ Mesh fabric re-knitting…",            node: "B",  status: "rebuild" },
      { label: "◈ Vault authenticated…",                node: "C",  status: "rebuild" },
      { label: "⟁ Braid α healing…",                   node: "D",  status: "braid_heal" },
      { label: "⟁ Braid β restored…",                  node: "E",  status: "braid_heal" },
      { label: "◈ Portal Φ accepting traffic…",         node: "F",  status: "rebuild" },
      { label: "✓ Full system restored. 100%.",        node: null, status: "done" },
    ],
    proof: [
      { label: "100% Node Loss Survived" },
      { label: "Braid Healing: VERIFIED" },
      { label: "Recovery Time: <4s" },
      { label: "Trust Chain: UNBROKEN" },
    ],
  },
  {
    id: "partial", label: "99.9% Recovery", icon: Zap, color: T.amber,
    scope: "Single failure · Braid absorbs",
    phases: [
      { label: "▶ Disruption on Mesh ∆…",              node: "B", status: "dead" },
      { label: "⟁ Braid α absorbing load…",            node: "D", status: "braid_heal" },
      { label: "⟁ Braid β holding alternate…",         node: "E", status: "braid_heal" },
      { label: "◈ Vault anchoring route…",             node: "C", status: "rebuild" },
      { label: "◈ Mesh ∆ rebuilt…",                    node: "B", status: "rebuild" },
      { label: "⟁ Braids returning to steady…",        node: "D", status: "healthy" },
      { label: "✓ Route revalidated. 99.9%.",          node: null, status: "done" },
    ],
    proof: [
      { label: "Single Node Contained" },
      { label: "Braid Absorbed Load" },
      { label: "Reroute: AUTOMATIC" },
      { label: "Continuity: MAINTAINED" },
    ],
  },
  {
    id: "ghost", label: "Ghost Probe", icon: Radio, color: T.purple,
    scope: "Boundary probe · Sensor absorbs",
    phases: [
      { label: "▶ Probe at mesh boundary…",            node: "B", status: "probe" },
      { label: "◉ Ghost sensor absorbing…",            node: "D", status: "ghost" },
      { label: "✓ Core Ω — never exposed",             node: "A", status: "healthy" },
      { label: "⚑ Telemetry surfaced. Audit flagged.", node: null, status: "done" },
    ],
    proof: [
      { label: "Probe Intercepted: YES" },
      { label: "Core Exposure: ZERO" },
      { label: "Ghost Sensor: ACTIVE" },
      { label: "Attribution: LOGGED" },
    ],
  },
  {
    id: "tamper", label: "Tamper Reject", icon: Lock, color: T.red,
    scope: "Unauthorized write → rejected",
    phases: [
      { label: "✗ Unauthorized write detected…",       node: "C", status: "tamper" },
      { label: "✗ Signature mismatch — REJECTED",      node: "C", status: "isolated" },
      { label: "◈ Trust chain preserved…",             node: "A", status: "healthy" },
      { label: "◈ Vault healing from checkpoint…",     node: "C", status: "rebuild" },
      { label: "✓ Tamper blocked. Ledger intact.",     node: null, status: "done" },
    ],
    proof: [
      { label: "Tamper Detected: YES" },
      { label: "Write Blocked: YES" },
      { label: "Chain Integrity: OK" },
      { label: "Vault Restored: YES" },
    ],
  },
  {
    id: "braid_stress", label: "Braid Stress", icon: Activity, color: T.gold,
    scope: "Both braids degraded → self-heal",
    phases: [
      { label: "▶ Load spike across braid fabric…",    node: "D", status: "degraded" },
      { label: "▶ Braid β stress threshold exceeded",  node: "E", status: "degraded" },
      { label: "⟁ Braid α entering self-repair…",      node: "D", status: "braid_heal" },
      { label: "⟁ Braid β stitching geometry…",        node: "E", status: "braid_heal" },
      { label: "◈ Spine Ω holding anchor…",            node: "A", status: "healthy" },
      { label: "✓ Both braids restored. Nominal.",    node: null, status: "done" },
    ],
    proof: [
      { label: "Braid α Self-Repaired" },
      { label: "Braid β Self-Repaired" },
      { label: "0.5 Offset Geometry: Held" },
      { label: "Spine Integrity: UNBROKEN" },
    ],
  },
];

const SOCIAL_LINKS = [
  { label: "YouTube", icon: Youtube,   color: "#FF0000", url: "https://youtube.com/@JGAband" },
  { label: "Twitter", icon: Twitter,   color: "#1DA1F2", url: "https://x.com/JGAband" },
  { label: "Instagram",icon: Instagram,color: "#E1306C", url: "https://instagram.com/JGAband" },
  { label: "Live",    icon: Tv2,       color: T.gold,    url: "https://www.jgaos2026-gif.com" },
];

const PROOF_LOG_ENTRIES = [
  { ts: "09:41Z", event: "Checkpoint seal verified",       hash: "a3f…d92", status: "ok" },
  { ts: "09:38Z", event: "Trust chain integrity scan",     hash: "7c1…b44", status: "ok" },
  { ts: "09:31Z", event: "Route revalidation passed",      hash: "f8e…019", status: "ok" },
  { ts: "08:57Z", event: "Ghost sensor telemetry flush",   hash: "2d6…c71", status: "ok" },
  { ts: "08:22Z", event: "Tamper probe — rejected",        hash: "9a0…e38", status: "warn" },
];

const LEGEND = [
  { color: T.green,  label: "Healthy" },
  { color: T.gold,   label: "Healing" },
  { color: T.amber,  label: "Degraded" },
  { color: T.red,    label: "Failure" },
  { color: T.purple, label: "Ghost" },
  { color: "#333",   label: "Offline" },
];

// ── Telemetry hook ────────────────────────────────────────────────────────────
function useTelemetry(running, nodeStates) {
  const [metrics, setMetrics] = useState({ resilience: 100, continuity: 100, latency: 12, anomalies: 1 });
  useEffect(() => {
    const anyDead = Object.values(nodeStates).some(s => s === "dead");
    const anyDeg  = Object.values(nodeStates).some(s => ["degraded","isolated","tamper"].includes(s));
    const anyHeal = Object.values(nodeStates).some(s => ["rebuild","braid_heal"].includes(s));
    const healthyCount = Object.values(nodeStates).filter(s => s === "healthy").length;
    setMetrics({
      resilience: anyDead ? Math.round((healthyCount / OBS_NODES.length) * 60) : anyDeg ? 72 : anyHeal ? 88 : 100,
      continuity: anyDead ? 0 : anyDeg ? 78 : anyHeal ? 92 : 100,
      latency:    anyDead ? 480 : anyDeg ? 95 : anyHeal ? 38 : 12,
      anomalies:  anyDeg || anyDead ? 3 : anyHeal ? 2 : 1,
    });
  }, [nodeStates, running]);
  return metrics;
}

// ── SVG Topology — mobile-optimised larger nodes ──────────────────────────────
function TopologyViz({ nodeStates }) {
  const W = 520, H = 390;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <text x={W/2} y={H/2} textAnchor="middle" dominantBaseline="middle"
        fill="rgba(201,168,76,0.03)" fontSize={52} fontWeight="900"
        style={{ userSelect: "none", pointerEvents: "none", fontFamily: "serif" }}>
        SB688
      </text>

      {/* Edges */}
      {OBS_EDGES.map(([a, b], i) => {
        const na = OBS_NODES.find(n => n.id === a);
        const nb = OBS_NODES.find(n => n.id === b);
        const sa = nodeStates[a] || "healthy";
        const sb = nodeStates[b] || "healthy";
        const dead    = sa === "dead" || sb === "dead";
        const healing = ["braid_heal","rebuild"].includes(sa) || ["braid_heal","rebuild"].includes(sb);
        const bad     = ["isolated","tamper"].includes(sa) || ["isolated","tamper"].includes(sb);
        return (
          <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
            stroke={dead ? "rgba(30,30,40,0.35)" : bad ? "rgba(239,68,68,0.45)" : healing ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.2)"}
            strokeWidth={healing ? 2.5 : dead ? 0.8 : 1.8}
            strokeDasharray={dead ? "5 4" : undefined}
            opacity={dead ? 0.3 : 1}
          />
        );
      })}

      {/* Nodes — radius 34 for easy mobile readability */}
      {OBS_NODES.map(node => {
        const st  = nodeStates[node.id] || "healthy";
        const cfg = NS[st] || NS.healthy;
        const isHeal   = st === "rebuild" || st === "braid_heal";
        const isActive = !["dead","healthy"].includes(st);
        return (
          <g key={node.id}>
            {isActive && <circle cx={node.x} cy={node.y} r={44} fill={cfg.fill} opacity={0.3} />}
            {isHeal && (
              <circle cx={node.x} cy={node.y} r={50} fill="none" stroke={cfg.stroke} strokeWidth={1.5} opacity={0.2}>
                <animate attributeName="r" values="38;56;38" dur="1.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="1.4s" repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={node.x} cy={node.y} r={34}
              fill={cfg.fill}
              stroke={cfg.stroke}
              strokeWidth={isHeal ? 3 : st === "healthy" ? 1.5 : 2.5}
              strokeDasharray={st === "dead" ? "5 3" : undefined}
            />
            {/* Braid badge */}
            {node.braid && (
              <circle cx={node.x + 26} cy={node.y - 26} r={10}
                fill={isHeal ? T.gold : "rgba(201,168,76,0.12)"}
                stroke="rgba(201,168,76,0.5)" strokeWidth={1} />
            )}
            {node.braid && (
              <text x={node.x + 26} y={node.y - 22} textAnchor="middle" fill={isHeal ? "#050608" : T.gold} fontSize={9} fontWeight="900">⟁</text>
            )}
            {/* Node name — bigger for mobile */}
            <text x={node.x} y={node.y - 6} textAnchor="middle" fill={cfg.text} fontSize={12} fontWeight="800"
              style={{ pointerEvents: "none", userSelect: "none" }}>{node.label}</text>
            <text x={node.x} y={node.y + 10} textAnchor="middle" fill={cfg.text} fontSize={9} opacity={0.75}
              style={{ pointerEvents: "none", userSelect: "none" }}>{cfg.label}</text>
            <circle cx={node.x} cy={node.y + 23} r={4} fill={cfg.dot} opacity={0.9} />
          </g>
        );
      })}
    </svg>
  );
}

// ── Big status indicator for mobile ──────────────────────────────────────────
function BigStatusBar({ metrics, running, selectedDemo, done }) {
  const sloColor = metrics.resilience >= 90 ? T.green : metrics.resilience >= 60 ? T.amber : T.red;
  const sloLabel = metrics.resilience >= 90 ? "NOMINAL" : metrics.resilience >= 60 ? "DEGRADED" : "CRITICAL";
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-3 py-3"
      style={{ background: "#080A0C", borderBottom: `1px solid rgba(201,168,76,0.15)` }}>
      {[
        { label: "SLO", val: sloLabel, color: sloColor },
        { label: "Resilience", val: `${metrics.resilience}%`, color: sloColor },
        { label: "Latency", val: `${metrics.latency}ms`, color: metrics.latency <= 30 ? T.green : metrics.latency <= 100 ? T.amber : T.red },
        { label: "Drill", val: running ? "LIVE" : done ? "DONE" : "IDLE", color: running ? T.green : done ? T.gold : T.textDim },
      ].map((m, i) => (
        <div key={i} className="rounded-lg px-3 py-2 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="text-base font-bold font-mono leading-tight" style={{ color: m.color }}>{m.val}</div>
          <div className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: T.textDim }}>{m.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Telemetry bars ────────────────────────────────────────────────────────────
function TelemetryBars({ metrics }) {
  const rColor = metrics.resilience >= 90 ? T.green : metrics.resilience >= 60 ? T.amber : T.red;
  const cColor = metrics.continuity >= 90 ? T.green : metrics.continuity >= 60 ? T.amber : T.red;
  const lColor = metrics.latency <= 30 ? T.green : metrics.latency <= 100 ? T.amber : T.red;
  const bar = (pct, color) => (
    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
    </div>
  );
  return (
    <div className="space-y-2 px-1">
      {[
        { label: "Resilience", pct: metrics.resilience, color: rColor, val: `${metrics.resilience}%` },
        { label: "Continuity", pct: metrics.continuity, color: cColor, val: `${metrics.continuity}%` },
        { label: "Latency",    pct: (metrics.latency / 500) * 100, color: lColor, val: `${metrics.latency}ms` },
      ].map((m, i) => (
        <div key={i} className="flex items-center gap-2 text-[11px]">
          <span className="w-18 flex-shrink-0 font-mono" style={{ color: T.textDim, minWidth: 70 }}>{m.label}</span>
          {bar(m.pct, m.color)}
          <span className="w-10 text-right font-bold font-mono flex-shrink-0" style={{ color: m.color }}>{m.val}</span>
        </div>
      ))}
    </div>
  );
}

// ── Export helper ─────────────────────────────────────────────────────────────
function exportReport(metrics, log, selectedDemo) {
  const lines = [
    `SB688 TELEMETRY REPORT — JGA · National Resilience Council`,
    `Generated: ${new Date().toISOString()}`,
    `Drill: ${selectedDemo?.label || "None"}`,
    `Resilience: ${metrics.resilience}%  Continuity: ${metrics.continuity}%  Latency: ${metrics.latency}ms`,
    ``,
    `== DRILL LOG ==`,
    ...log.map(e => `  ${e}`),
    ``,
    `Architecture: John Arenz — J.G.A. · SB688 · BSS-2026-ARCH-01`,
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `sb688-report-${Date.now()}.txt`;
  a.click();
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PublicObserver() {
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [phase, setPhase]   = useState(0);
  const [running, setRunning] = useState(false);
  const [nodeStates, setNodeStates] = useState(Object.fromEntries(OBS_NODES.map(n => [n.id, "healthy"])));
  const [log, setLog]   = useState([]);
  const [done, setDone] = useState(false);
  const [speed, setSpeed] = useState(950);
  const logRef = useRef(null);
  const metrics = useTelemetry(running, nodeStates);

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

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b"
        style={{ background: "linear-gradient(180deg,#080A0C,#0A0B0E)", borderColor: T.border, boxShadow: "0 2px 24px rgba(0,0,0,0.8)" }}>
        <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${T.gold},transparent)` }} />
        <div className="px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: 28 }}>
              <CrownIcon size={16} color={T.gold} />
              <LionIcon  size={20} color={T.gold} />
            </div>
            <div className="w-px h-8 flex-shrink-0" style={{ background: `linear-gradient(180deg,transparent,${T.goldDim},transparent)` }} />
            <div>
              <div className="text-[12px] font-bold tracking-widest font-cinzel" style={{ color: T.gold }}>SB688 · LIVE OBSERVER</div>
              <div className="text-[9px] tracking-widest uppercase" style={{ color: T.textDim }}>National Resilience Council</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge className="text-[10px] font-bold border flex items-center gap-1"
              style={{ background: T.goldFaint, color: T.gold, borderColor: "rgba(201,168,76,0.3)" }}>
              <Eye className="w-3 h-3" /> Live
            </Badge>
            <Link to="/jga-story"
              className="text-[10px] px-2.5 py-1 rounded border font-semibold"
              style={{ background: T.goldFaint, color: T.gold, borderColor: "rgba(201,168,76,0.25)" }}>
              <BookOpen className="w-3 h-3 inline mr-1" />Story
            </Link>
          </div>
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg,transparent,rgba(201,168,76,0.2),transparent)` }} />
      </header>

      {/* ── Big live status bar — very prominent on mobile ── */}
      <BigStatusBar metrics={metrics} running={running} selectedDemo={selectedDemo} done={done} />

      <main className="px-3 py-4 space-y-4 max-w-2xl mx-auto">

        {/* ── Drill selector — 2 cols on mobile, 5 on sm+ ── */}
        <div>
          <h2 className="text-base font-bold font-cinzel mb-2" style={{ color: T.gold }}>Select a Drill</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {DEMOS.map(demo => {
              const Icon = demo.icon;
              const active = selectedDemo?.id === demo.id;
              return (
                <button key={demo.id} onClick={() => runDemo(demo)} disabled={running}
                  className="rounded-xl border p-3 text-left transition-all space-y-2 active:scale-95 disabled:opacity-50 touch-manipulation"
                  style={{
                    background: active ? `${demo.color}12` : T.card,
                    borderColor: active ? `${demo.color}55` : T.border,
                  }}>
                  <div className="flex items-center justify-between">
                    <Icon className="w-5 h-5" style={{ color: demo.color }} />
                    {active && running && <span className="w-2 h-2 rounded-full animate-ping" style={{ background: demo.color }} />}
                    {active && done    && <CheckCircle2 className="w-4 h-4" style={{ color: demo.color }} />}
                  </div>
                  <div className="text-xs font-bold leading-tight" style={{ color: active ? T.text : T.textDim }}>{demo.label}</div>
                  <div className="text-[9px] leading-tight" style={{ color: "rgba(232,217,176,0.3)" }}>{demo.scope}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Speed controls ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px]" style={{ color: T.textDim }}>Speed:</span>
          {[{ label: "0.5×", val: 1800 }, { label: "1×", val: 950 }, { label: "2×", val: 480 }, { label: "3×", val: 300 }].map(s => (
            <button key={s.label} onClick={() => setSpeed(s.val)}
              className="text-[11px] px-3 py-1.5 rounded border font-mono font-bold transition-all touch-manipulation"
              style={{
                background: speed === s.val ? T.goldFaint : "transparent",
                color:      speed === s.val ? T.gold : T.textDim,
                borderColor:speed === s.val ? "rgba(201,168,76,0.35)" : "rgba(255,255,255,0.1)",
              }}>
              {s.label}
            </button>
          ))}
          <button onClick={() => exportReport(metrics, log, selectedDemo)}
            className="ml-auto flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded border touch-manipulation"
            style={{ color: T.green, borderColor: "rgba(34,197,94,0.25)", background: "rgba(34,197,94,0.06)" }}>
            <Download className="w-3 h-3" /> Export
          </button>
        </div>

        {/* ── Live Topology Map ── */}
        <div className="rounded-xl border space-y-2 overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
          <div className="flex items-center justify-between px-4 pt-3">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: T.gold }}>
              <Activity className="w-3.5 h-3.5" /> Live Topology
            </h3>
            {running && (
              <Badge className="text-[9px] border flex items-center gap-1 animate-pulse"
                style={{ background: "rgba(34,197,94,0.1)", color: T.green, borderColor: "rgba(34,197,94,0.3)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> LIVE
              </Badge>
            )}
            {done && (
              <Badge className="text-[9px] border flex items-center gap-1"
                style={{ background: "rgba(201,168,76,0.1)", color: T.gold, borderColor: "rgba(201,168,76,0.3)" }}>
                <CheckCircle2 className="w-3 h-3" /> COMPLETE
              </Badge>
            )}
          </div>
          <div className="px-2 pb-1" style={{ background: "rgba(3,4,6,0.9)" }}>
            <TopologyViz nodeStates={nodeStates} />
          </div>
          {/* Legend — 3-col on mobile */}
          <div className="px-4 pb-3 grid grid-cols-3 sm:flex sm:flex-wrap gap-x-3 gap-y-1">
            {LEGEND.map(l => (
              <span key={l.label} className="flex items-center gap-1.5 text-[10px]" style={{ color: T.textDim }}>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Telemetry bars ── */}
        <div className="rounded-xl border p-4 space-y-3" style={{ background: T.card, borderColor: T.border }}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: T.gold }}>
              <Wifi className="w-3.5 h-3.5" /> Live Telemetry
            </h3>
            <Badge className="text-[9px] border" style={{ background: "rgba(34,197,94,0.08)", color: T.green, borderColor: "rgba(34,197,94,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block mr-1" style={{ background: T.green }} />Streaming
            </Badge>
          </div>
          <TelemetryBars metrics={metrics} />
        </div>

        {/* ── Execution log ── */}
        <div className="rounded-xl border p-4 space-y-2" style={{ background: T.card, borderColor: T.border }}>
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: T.gold }}>Execution Log</h3>
          <div ref={logRef} className="rounded-lg p-3 space-y-1 overflow-y-auto font-mono" style={{ background: "rgba(0,0,0,0.5)", minHeight: 100, maxHeight: 180 }}>
            {log.length === 0
              ? <p className="text-[11px] italic" style={{ color: T.textDim }}>Tap a drill above to begin…</p>
              : log.map((entry, i) => {
                  const color = entry.startsWith("✓") ? T.green : entry.startsWith("✗") ? T.red : entry.startsWith("⟁") ? T.gold : T.textDim;
                  return (
                    <div key={i} className="text-[11px] leading-relaxed flex gap-2">
                      <span className="flex-shrink-0" style={{ color: "rgba(201,168,76,0.25)" }}>{String(i+1).padStart(2,"0")}</span>
                      <span style={{ color }}>{entry}</span>
                    </div>
                  );
                })}
          </div>
          {done && selectedDemo && (
            <Button onClick={reset} variant="outline" className="w-full text-xs h-9 touch-manipulation"
              style={{ borderColor: T.border, color: T.textDim }}>
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Run Another Drill
            </Button>
          )}
        </div>

        {/* ── Proof scorecard ── */}
        {done && selectedDemo && (
          <div className="rounded-xl border p-4 space-y-3"
            style={{ background: T.card, borderColor: "rgba(34,197,94,0.3)" }}>
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: T.green }}>
              <Shield className="w-4 h-4" /> Capability Proof
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {selectedDemo.proof.map((item, i) => (
                <div key={i} className="rounded-lg p-3 border flex items-start gap-2"
                  style={{ background: "rgba(34,197,94,0.05)", borderColor: "rgba(34,197,94,0.2)" }}>
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: T.green }} />
                  <p className="text-[11px] font-bold leading-tight" style={{ color: "#86efac" }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Social links ── */}
        <div className="rounded-xl border p-4 space-y-3" style={{ background: T.card, borderColor: T.border }}>
          <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: T.gold }}>
            <Share2 className="w-3.5 h-3.5" /> Watch Live · Follow JGA
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {SOCIAL_LINKS.map(s => {
              const Icon = s.icon;
              return (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center touch-manipulation active:scale-95 transition-transform"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                  <Icon className="w-6 h-6" style={{ color: s.color }} />
                  <div className="text-[10px] font-bold" style={{ color: T.text }}>{s.label}</div>
                </a>
              );
            })}
          </div>
        </div>

        {/* ── Latest signed events ── */}
        <div className="rounded-xl border p-4 space-y-2" style={{ background: T.card, borderColor: T.border }}>
          <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: T.gold }}>
            <Shield className="w-3.5 h-3.5" /> Latest Signed Events
          </h3>
          <div className="space-y-1.5 font-mono">
            {PROOF_LOG_ENTRIES.map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] py-1 border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <span style={{ color: e.status === "warn" ? T.red : T.green }}>{e.status === "warn" ? "⚑" : "✓"}</span>
                <span className="flex-shrink-0" style={{ color: "rgba(201,168,76,0.35)" }}>{e.ts}</span>
                <span className="flex-1 truncate" style={{ color: T.textDim }}>{e.event}</span>
                <span className="flex-shrink-0 hidden sm:inline" style={{ color: "rgba(201,168,76,0.2)" }}>{e.hash}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="text-center space-y-2 pb-6">
          <div className="flex items-center justify-center gap-2">
            <CrownIcon size={12} color="rgba(201,168,76,0.3)" />
            <span className="text-[10px] font-cinzel" style={{ color: "rgba(201,168,76,0.4)" }}>
              SB688 · JGA · National Resilience Council
            </span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Link to="/jga-story" className="text-[10px]" style={{ color: T.goldDim }}>JGA Story →</Link>
            <Link to="/" className="text-[10px]" style={{ color: "rgba(232,217,176,0.25)" }}>Full Console →</Link>
          </div>
          <p className="text-[9px]" style={{ color: "rgba(232,217,176,0.2)" }}>
            Observer link — read-only. No source access.
          </p>
        </div>
      </main>
    </div>
  );
}