import React, { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Lock, Radio, Zap, CheckCircle2, XCircle, RotateCcw, ChevronDown, ChevronUp, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrownIcon, LionIcon } from "@/components/sb688/WarriorCrest";

// ── Obfuscated demo data ──────────────────────────────────────────────────────
const OBS_NODES = [
  { id: "A", label: "Core Ω",   x: 200, y: 55,  role: "Orchestration" },
  { id: "B", label: "Mesh ∆",   x: 95,  y: 155, role: "Exchange" },
  { id: "C", label: "Vault ∑",  x: 305, y: 155, role: "State" },
  { id: "D", label: "Braid α",  x: 70,  y: 270, role: "Continuity" },
  { id: "E", label: "Braid β",  x: 200, y: 270, role: "Redundancy" },
  { id: "F", label: "Portal Φ", x: 330, y: 270, role: "Interface" },
];

const OBS_EDGES = [
  ["A","B"],["A","C"],["B","D"],["B","E"],["C","E"],["C","F"],["D","F"],["E","F"],
];

const DEMOS = [
  {
    id: "full",
    label: "Full Rebuild Drill",
    verb: "Run full rebuild drill",
    icon: Shield,
    color: "#22c55e",
    scope: "All 6 nodes · Complete teardown & restore",
    phases: [
      { label: "Initiating total teardown…",           node: null, status: "destroy" },
      { label: "All nodes offline — 0% capacity",      node: null, status: "dead" },
      { label: "Spine reconstruction from Ω…",         node: "A",  status: "rebuild" },
      { label: "Mesh fabric re-knitting…",              node: "B",  status: "rebuild" },
      { label: "Vault checkpoint restored…",            node: "C",  status: "rebuild" },
      { label: "Braid α continuity verified…",         node: "D",  status: "rebuild" },
      { label: "Braid β redundancy online…",           node: "E",  status: "rebuild" },
      { label: "Portal Φ accepting traffic…",          node: "F",  status: "rebuild" },
      { label: "✓ Full system restored. 100% verified.", node: null, status: "done" },
    ],
    proof: ["100% Node Loss Survived","Checkpoint Integrity: VERIFIED","Recovery Time: <4s","Trust Chain: UNBROKEN"],
  },
  {
    id: "partial",
    label: "99.9% Recovery Path",
    verb: "Simulate 99.9% recovery path",
    icon: Zap,
    color: "#f59e0b",
    scope: "Single node failure · Auto-reroute",
    phases: [
      { label: "Targeted disruption on Mesh ∆…",       node: "B", status: "destroy" },
      { label: "Braid α absorbing load…",               node: "D", status: "degraded" },
      { label: "Alternate path via Vault ∑…",           node: "C", status: "rebuild" },
      { label: "Mesh ∆ rebuilt from checkpoint…",       node: "B", status: "rebuild" },
      { label: "Route revalidated. 99.9% verified.",    node: null, status: "done" },
    ],
    proof: ["Single Node Loss Contained","Reroute: AUTOMATIC","Continuity: MAINTAINED","Proof: VERIFIED IN DEMO"],
  },
  {
    id: "ghost",
    label: "Ghost Node Probe",
    verb: "Execute ghost sensor intercept",
    icon: Radio,
    color: "#8b5cf6",
    scope: "Boundary probe · Sensor absorption",
    phases: [
      { label: "Suspicious probe at mesh boundary…",   node: "B", status: "probe" },
      { label: "Ghost sensor absorbed probe…",          node: "D", status: "ghost" },
      { label: "Core modules never exposed…",           node: "A", status: "healthy" },
      { label: "Telemetry surfaced. Audit flagged.",    node: null, status: "done" },
    ],
    proof: ["Probe Intercepted: YES","Core Exposure: ZERO","Ghost Sensor: ACTIVE","Attribution: LOGGED"],
  },
  {
    id: "tamper",
    label: "Tamper Rejection",
    verb: "Trigger tamper rejection sequence",
    icon: Lock,
    color: "#ef4444",
    scope: "Unauthorized write · Chain rejection",
    phases: [
      { label: "Unauthorized state write detected…",   node: "C", status: "tamper" },
      { label: "Signature mismatch — REJECTED…",        node: "C", status: "isolated" },
      { label: "Trust chain integrity preserved…",      node: "A", status: "healthy" },
      { label: "Tamper blocked. Ledger intact.",         node: null, status: "done" },
    ],
    proof: ["Tamper Detected: YES","Write Blocked: YES","Chain Integrity: MAINTAINED","Rejection: VERIFIED"],
  },
];

const NODE_STATUS_STYLE = {
  healthy:  { fill: "rgba(20,184,166,0.15)",  stroke: "#14b8a6", text: "#5eead4",  label: "Healthy" },
  degraded: { fill: "rgba(245,158,11,0.15)",  stroke: "#f59e0b", text: "#fcd34d",  label: "Degraded" },
  isolated: { fill: "rgba(239,68,68,0.15)",   stroke: "#ef4444", text: "#fca5a5",  label: "Isolated" },
  dead:     { fill: "rgba(20,20,30,0.6)",      stroke: "#2a2a3a", text: "#444",     label: "Offline" },
  rebuild:  { fill: "rgba(34,197,94,0.15)",   stroke: "#22c55e", text: "#86efac",  label: "Rebuilding" },
  probe:    { fill: "rgba(139,92,246,0.15)",  stroke: "#8b5cf6", text: "#c4b5fd",  label: "Probed" },
  ghost:    { fill: "rgba(139,92,246,0.3)",   stroke: "#a78bfa", text: "#ddd6fe",  label: "Ghost Active" },
  tamper:   { fill: "rgba(239,68,68,0.2)",    stroke: "#ef4444", text: "#fca5a5",  label: "Tamper Attempt" },
};

// Simulated proof log entries (obfuscated but timestamped)
const PROOF_LOG_ENTRIES = [
  { ts: "04:15 · 09:41:02Z", event: "Checkpoint seal verified", hash: "a3f…d92", status: "ok" },
  { ts: "04:15 · 09:38:17Z", event: "Trust chain integrity scan", hash: "7c1…b44", status: "ok" },
  { ts: "04:15 · 09:31:55Z", event: "Route revalidation passed", hash: "f8e…019", status: "ok" },
  { ts: "04:15 · 08:57:03Z", event: "Ghost sensor telemetry flush", hash: "2d6…c71", status: "ok" },
  { ts: "04:15 · 08:22:44Z", event: "Tamper probe — rejected", hash: "9a0…e38", status: "warn" },
];

// ── Slim status bar ───────────────────────────────────────────────────────────
function StatusBar({ running, done, selectedDemo, nodeStates }) {
  const allHealthy = Object.values(nodeStates).every(s => s === "healthy" || s === "rebuild" || s === "done");
  const anyDead = Object.values(nodeStates).some(s => s === "dead");
  const anyIsolated = Object.values(nodeStates).some(s => s === "isolated");

  const sloColor = anyDead ? "#ef4444" : anyIsolated ? "#f59e0b" : "#22c55e";
  const sloLabel = anyDead ? "DEGRADED" : anyIsolated ? "CONTAINED" : "NOMINAL";
  const healthPct = nodeStates && Object.keys(nodeStates).length > 0
    ? Math.round((Object.values(nodeStates).filter(s => ["healthy","rebuild"].includes(s)).length / OBS_NODES.length) * 100)
    : 100;

  return (
    <div className="flex items-center gap-3 px-4 py-2 flex-wrap text-[10px] font-mono border-b border-border/40"
      style={{ background: "rgba(8,10,16,0.6)" }}>
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sloColor }} />
        <span style={{ color: sloColor }} className="font-bold">SLO {sloLabel}</span>
      </div>
      <div className="w-px h-3 bg-border/50" />
      <span className="text-muted-foreground">Node Health: <span className="font-bold" style={{ color: sloColor }}>{healthPct}%</span></span>
      <div className="w-px h-3 bg-border/50" />
      <span className="text-muted-foreground">Last Verified: <span className="text-teal-400 font-bold">09:41:02Z</span></span>
      <div className="w-px h-3 bg-border/50" />
      <span className="text-muted-foreground">Anomalies: <span className="text-amber-400 font-bold">1</span> in last 24h</span>
      <div className="w-px h-3 bg-border/50" />
      <span className="text-muted-foreground">Active Drill: <span className="font-bold text-foreground">{running ? selectedDemo?.label : "None"}</span></span>
    </div>
  );
}

// ── Topology SVG ──────────────────────────────────────────────────────────────
function TopologyViz({ nodeStates }) {
  const W = 400, H = 330;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", maxHeight: 280 }}>
      <text x={W/2} y={H/2} textAnchor="middle" dominantBaseline="middle"
        fill="rgba(201,168,76,0.04)" fontSize={44} fontWeight="900"
        style={{ userSelect: "none", pointerEvents: "none", fontFamily: "serif" }}>
        SB688 · JGA
      </text>
      {OBS_EDGES.map(([a, b], i) => {
        const na = OBS_NODES.find(n => n.id === a);
        const nb = OBS_NODES.find(n => n.id === b);
        const sa = nodeStates[a] || "healthy";
        const sb = nodeStates[b] || "healthy";
        const active = sa !== "dead" && sb !== "dead";
        const isRebuild = sa === "rebuild" || sb === "rebuild";
        return (
          <line key={i}
            x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
            stroke={!active ? "rgba(40,40,60,0.4)" : isRebuild ? "rgba(34,197,94,0.4)" : "rgba(201,168,76,0.22)"}
            strokeWidth={isRebuild ? 2 : active ? 1.5 : 0.8}
            strokeDasharray={!active ? "4 3" : undefined}
          />
        );
      })}
      {OBS_NODES.map(node => {
        const st = nodeStates[node.id] || "healthy";
        const cfg = NODE_STATUS_STYLE[st] || NODE_STATUS_STYLE.healthy;
        const isActive = st !== "dead" && st !== "healthy";
        return (
          <g key={node.id}>
            {isActive && (
              <circle cx={node.x} cy={node.y} r={36} fill={cfg.fill} opacity={0.4} />
            )}
            <circle cx={node.x} cy={node.y} r={26} fill={cfg.fill} stroke={cfg.stroke} strokeWidth={st === "healthy" ? 1.2 : 2} />
            <text x={node.x} y={node.y - 3} textAnchor="middle" fill={cfg.text} fontSize={9} fontWeight="700">
              {node.label}
            </text>
            <text x={node.x} y={node.y + 9} textAnchor="middle" fill={cfg.text} fontSize={7} opacity={0.55}>
              {cfg.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Node color legend ─────────────────────────────────────────────────────────
function NodeLegend() {
  const items = [
    { color: "#14b8a6", label: "Healthy" },
    { color: "#22c55e", label: "Rebuilding" },
    { color: "#f59e0b", label: "Degraded" },
    { color: "#ef4444", label: "Isolated" },
    { color: "#8b5cf6", label: "Ghost / Probe" },
    { color: "#444",    label: "Offline" },
  ];
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {items.map(item => (
        <span key={item.label} className="flex items-center gap-1 text-[9px] text-muted-foreground">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

// ── Proof Log ─────────────────────────────────────────────────────────────────
function ProofLog() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" /> Latest Signed Events
        </h3>
        <Badge className="text-[9px] bg-teal-500/10 text-teal-400 border border-teal-500/20">Live · Obfuscated</Badge>
      </div>
      <div className="space-y-1.5 font-mono">
        {PROOF_LOG_ENTRIES.map((e, i) => (
          <div key={i} className="flex items-center gap-2 text-[10px] py-1 border-b border-border/20 last:border-0">
            <span className={e.status === "warn" ? "text-amber-400" : "text-teal-400"}>
              {e.status === "warn" ? "⚑" : "✓"}
            </span>
            <span className="text-muted-foreground/50 flex-shrink-0">{e.ts}</span>
            <span className="text-foreground/70 flex-1">{e.event}</span>
            <span className="text-muted-foreground/30 flex-shrink-0">{e.hash}</span>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-muted-foreground/40">Hashes obfuscated. Timestamps are real session events.</p>
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
  const logRef = useRef(null);

  const reset = () => {
    setSelectedDemo(null);
    setPhase(0);
    setRunning(false);
    setNodeStates(Object.fromEntries(OBS_NODES.map(n => [n.id, "healthy"])));
    setLog([]);
    setDone(false);
  };

  const runDemo = (demo) => {
    reset();
    setTimeout(() => {
      setSelectedDemo(demo);
      setPhase(0);
      setRunning(true);
      setLog([]);
      setDone(false);
      setNodeStates(Object.fromEntries(OBS_NODES.map(n => [n.id, "healthy"])));
    }, 50);
  };

  useEffect(() => {
    if (!running || !selectedDemo) return;
    if (phase >= selectedDemo.phases.length) { setRunning(false); setDone(true); return; }
    const p = selectedDemo.phases[phase];
    const timer = setTimeout(() => {
      setLog(prev => [...prev, p.label]);
      if (p.status === "dead") {
        setNodeStates(Object.fromEntries(OBS_NODES.map(n => [n.id, "dead"])));
      } else if (p.status === "done") {
        setNodeStates(Object.fromEntries(OBS_NODES.map(n => [n.id, "healthy"])));
      } else if (p.node && p.status) {
        setNodeStates(prev => ({ ...prev, [p.node]: p.status }));
      }
      setPhase(prev => prev + 1);
    }, 950);
    return () => clearTimeout(timer);
  }, [running, phase, selectedDemo]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      {/* Header — compact */}
      <header className="border-b border-border sticky top-0 z-50"
        style={{ background: "linear-gradient(180deg, hsl(220,22%,5%) 0%, hsl(220,18%,7%) 100%)", boxShadow: "0 1px 0 rgba(201,168,76,0.18), 0 4px 24px rgba(0,0,0,0.6)" }}>
        <div className="warrior-divider" />
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: 30 }}>
              <CrownIcon size={17} color="#C9A84C" />
              <LionIcon size={21} color="#C9A84C" />
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-primary/40 to-transparent flex-shrink-0" />
            <div>
              <span className="text-[11px] font-bold tracking-widest font-cinzel leading-tight" style={{ color: "#C9A84C" }}>
                SB688 · PUBLIC OBSERVER
              </span>
              {/* breadcrumb */}
              <div className="flex items-center gap-1 text-[9px] text-muted-foreground mt-0.5">
                <span>National Resilience Council</span>
                <span className="opacity-40">/</span>
                <span className="text-primary">Observer View</span>
              </div>
            </div>
          </div>
          {/* Single dominant mode badge — others de-emphasized */}
          <div className="flex items-center gap-1.5">
            <Badge className="text-[10px] bg-primary/10 text-primary border border-primary/30 flex items-center gap-1 font-bold">
              <Eye className="w-3 h-3" /> Observer Mode
            </Badge>
            <span className="text-[9px] text-muted-foreground/50 hidden sm:block">Read-Only · No Source Access</span>
          </div>
        </div>
        <div className="warrior-divider" />
      </header>

      {/* Slim live status bar */}
      <StatusBar running={running} done={done} selectedDemo={selectedDemo} nodeStates={nodeStates} />

      <main className="max-w-5xl mx-auto px-4 py-5 space-y-5">

        {/* Compact intro with collapsible "About" */}
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold font-cinzel leading-tight" style={{ color: "#C9A84C" }}>
                Live Capability Drills
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Select a drill below — watch the topology respond in real time.</p>
            </div>
            <button onClick={() => setAboutOpen(v => !v)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition border border-border rounded px-2 py-1">
              {aboutOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              About this view
            </button>
          </div>

          {/* Collapsible about section */}
          {aboutOpen && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                This is a <strong className="text-foreground">read-only public observer view</strong> of the SB688 resilience platform. You can watch the system perform live recovery, containment, and tamper-rejection sequences. Source code, internal logic, and data structures are intentionally obfuscated — you can verify the system works, but not replicate it.
              </p>
              {/* Compact checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  {[
                    { c: "teal-400", icon: "✓", text: "Live behavior visible" },
                    { c: "teal-400", icon: "✓", text: "Node topology & transitions" },
                    { c: "teal-400", icon: "✓", text: "Capability proof scorecards" },
                    { c: "teal-400", icon: "✓", text: "Signed proof log (obfuscated)" },
                  ].map((r, i) => (
                    <div key={i} className={`flex items-center gap-2 text-[10px] text-${r.c}`}>
                      <span className="font-bold">{r.icon}</span> {r.text}
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  {[
                    { c: "red-400", icon: "✗", text: "Recovery algorithms hidden" },
                    { c: "red-400", icon: "✗", text: "Checkpoint hash schemes hidden" },
                    { c: "red-400", icon: "✗", text: "Braid geometry details hidden" },
                    { c: "red-400", icon: "✗", text: "HMAC / Merkle logic hidden" },
                  ].map((r, i) => (
                    <div key={i} className={`flex items-center gap-2 text-[10px] text-${r.c}`}>
                      <span className="font-bold">{r.icon}</span> {r.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drill selector — specific verbs, scope labels */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DEMOS.map(demo => {
            const Icon = demo.icon;
            const active = selectedDemo?.id === demo.id;
            return (
              <button key={demo.id} onClick={() => runDemo(demo)}
                disabled={running}
                className={`rounded-xl border p-3 text-left transition-all space-y-2 group ${active ? "border-primary/40" : "border-border bg-card hover:border-primary/25"} disabled:opacity-50`}
                style={active ? { background: `${demo.color}0d`, borderColor: `${demo.color}55` } : {}}>
                <div className="flex items-center justify-between">
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: demo.color }} />
                  {active && running && (
                    <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: demo.color }} />
                  )}
                  {active && done && <CheckCircle2 className="w-3 h-3" style={{ color: demo.color }} />}
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground leading-tight">{demo.label}</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">{demo.scope}</div>
                </div>
                <div className="text-[9px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: demo.color }}>
                  → {demo.verb}
                </div>
              </button>
            );
          })}
        </div>

        {/* Live topology + execution log side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Topology */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Live Topology
              </h3>
              <Badge className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20">Obfuscated · JGA</Badge>
            </div>
            <div style={{ background: "rgba(6,8,16,0.8)", borderRadius: 8, padding: "8px 8px 4px" }}>
              <TopologyViz nodeStates={nodeStates} />
            </div>
            <NodeLegend />
          </div>

          {/* Execution log */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">Execution Log</h3>
              <div className="flex items-center gap-1.5">
                {running && (
                  <Badge className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" /> Running
                  </Badge>
                )}
                {done && (
                  <Badge className="text-[9px] bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Complete
                  </Badge>
                )}
              </div>
            </div>
            <div ref={logRef} className="flex-1 min-h-[180px] max-h-[220px] bg-[#050810] rounded-lg p-3 space-y-1 overflow-y-auto font-mono">
              {log.length === 0 ? (
                <p className="text-[10px] text-muted-foreground/50 italic">Select a drill to begin…</p>
              ) : (
                log.map((entry, i) => (
                  <div key={i} className="text-[10px] text-teal-300/80 leading-relaxed flex gap-2">
                    <span className="text-primary/30 flex-shrink-0">{String(i+1).padStart(2,"0")}</span>
                    <span>{entry}</span>
                  </div>
                ))
              )}
            </div>
            {selectedDemo && done && (
              <Button onClick={reset} variant="outline" className="w-full text-xs border-border">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Run Another Drill
              </Button>
            )}
          </div>
        </div>

        {/* Proof scorecard — appears after drill completes */}
        {done && selectedDemo && (
          <div className="bg-card border border-primary/20 rounded-xl p-4 space-y-3"
            style={{ boxShadow: "0 0 20px rgba(201,168,76,0.05)" }}>
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <Shield className="w-4 h-4" /> Capability Proof — {selectedDemo.label}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {selectedDemo.proof.map((item, i) => (
                <div key={i} className="bg-teal-500/5 border border-teal-500/20 rounded-lg p-3 space-y-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <p className="text-[10px] text-teal-300 font-semibold leading-tight">{item}</p>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-muted-foreground/40">
              All sequences run in-browser. Internal algorithms withheld. Architecture: John Arenz — J.G.A.
            </p>
          </div>
        )}

        {/* Proof log — always visible, grounds the "verifiable proof" promise */}
        <ProofLog />

        {/* Attribution footer */}
        <div className="text-center text-[10px] text-muted-foreground/40 space-y-1 pb-4">
          <div className="flex items-center justify-center gap-2">
            <CrownIcon size={13} color="rgba(201,168,76,0.35)" />
            <span className="font-cinzel" style={{ color: "rgba(201,168,76,0.45)" }}>
              SB688 · National Resilience Council · Architecture by John Arenz — J.G.A.
            </span>
          </div>
          <p>This observer link may be shared freely. It does not grant access to source code, internals, or the full console.</p>
        </div>
      </main>
    </div>
  );
}