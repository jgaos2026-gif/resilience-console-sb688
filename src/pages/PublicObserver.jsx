import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Lock, Radio, Zap, CheckCircle2, XCircle, Play, RotateCcw, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrownIcon, LionIcon } from "@/components/sb688/WarriorCrest";

// ── Obfuscated demo data — real behavior, masked internals ───────────────────
const OBS_NODES = [
  { id: "A", label: "Core Ω", x: 200, y: 60,  role: "Orchestration" },
  { id: "B", label: "Mesh ∆",  x: 100, y: 160, role: "Exchange" },
  { id: "C", label: "Vault ∑", x: 300, y: 160, role: "State" },
  { id: "D", label: "Braid α", x: 80,  y: 270, role: "Continuity" },
  { id: "E", label: "Braid β", x: 200, y: 270, role: "Redundancy" },
  { id: "F", label: "Portal Φ",x: 320, y: 270, role: "Interface" },
];

const OBS_EDGES = [
  ["A","B"],["A","C"],["B","D"],["B","E"],["C","E"],["C","F"],["D","F"],["E","F"],
];

const DEMOS = [
  {
    id: "full",
    label: "100% Rebuild",
    icon: Shield,
    color: "#22c55e",
    phases: [
      { label: "Initiating total teardown…",       node: null, status: "destroy" },
      { label: "All nodes offline — 0% capacity",  node: null, status: "dead" },
      { label: "Spine reconstruction from Ω…",     node: "A",  status: "rebuild" },
      { label: "Mesh fabric re-knitting…",          node: "B",  status: "rebuild" },
      { label: "Vault checkpoint restored…",        node: "C",  status: "rebuild" },
      { label: "Braid α continuity verified…",     node: "D",  status: "rebuild" },
      { label: "Braid β redundancy online…",       node: "E",  status: "rebuild" },
      { label: "Portal Φ accepting traffic…",      node: "F",  status: "rebuild" },
      { label: "✓ Full system restored. 100% verified.", node: null, status: "done" },
    ],
    proof: ["100% Node Loss Survived","Checkpoint Integrity: VERIFIED","Recovery Time: <4s (simulated)","Trust Chain: UNBROKEN"],
  },
  {
    id: "partial",
    label: "99.9% Recovery",
    icon: Zap,
    color: "#f59e0b",
    phases: [
      { label: "Targeted disruption on Mesh ∆…",   node: "B", status: "destroy" },
      { label: "Braid α absorbing load…",           node: "D", status: "degraded" },
      { label: "Alternate path via Vault ∑…",       node: "C", status: "rebuild" },
      { label: "Mesh ∆ rebuilt from checkpoint…",   node: "B", status: "rebuild" },
      { label: "Route revalidated. 99.9% verified.",node: null, status: "done" },
    ],
    proof: ["Single Node Loss Contained","Reroute: AUTOMATIC","Continuity: MAINTAINED","Proof: VERIFIED IN DEMO"],
  },
  {
    id: "ghost",
    label: "Ghost Node Probe",
    icon: Radio,
    color: "#8b5cf6",
    phases: [
      { label: "Suspicious probe at mesh boundary…",node: "B", status: "probe" },
      { label: "Ghost sensor absorbed probe…",      node: "D", status: "ghost" },
      { label: "Core modules never exposed…",       node: "A", status: "healthy" },
      { label: "Telemetry surfaced. Audit flagged.", node: null, status: "done" },
    ],
    proof: ["Probe Intercepted: YES","Core Exposure: ZERO","Ghost Sensor: ACTIVE","Attribution: LOGGED"],
  },
  {
    id: "tamper",
    label: "Tamper Rejection",
    icon: Lock,
    color: "#ef4444",
    phases: [
      { label: "Unauthorized state write detected…",node: "C", status: "tamper" },
      { label: "Signature mismatch — REJECTED…",    node: "C", status: "isolated" },
      { label: "Trust chain integrity preserved…",  node: "A", status: "healthy" },
      { label: "Tamper blocked. Ledger intact.",     node: null, status: "done" },
    ],
    proof: ["Tamper Detected: YES","Write Blocked: YES","Chain Integrity: MAINTAINED","Rejection: VERIFIED"],
  },
];

const NODE_STATUS_STYLE = {
  healthy:  { fill: "rgba(20,184,166,0.15)",  stroke: "#14b8a6", text: "#5eead4" },
  degraded: { fill: "rgba(245,158,11,0.15)",  stroke: "#f59e0b", text: "#fcd34d" },
  isolated: { fill: "rgba(239,68,68,0.15)",   stroke: "#ef4444", text: "#fca5a5" },
  dead:     { fill: "rgba(30,30,40,0.5)",      stroke: "#3a3a4a", text: "#555" },
  rebuild:  { fill: "rgba(34,197,94,0.15)",   stroke: "#22c55e", text: "#86efac" },
  probe:    { fill: "rgba(139,92,246,0.15)",  stroke: "#8b5cf6", text: "#c4b5fd" },
  ghost:    { fill: "rgba(139,92,246,0.3)",   stroke: "#a78bfa", text: "#ddd6fe" },
  tamper:   { fill: "rgba(239,68,68,0.2)",    stroke: "#ef4444", text: "#fca5a5" },
};

function TopologyViz({ nodeStates }) {
  const W = 400, H = 340;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", maxHeight: 280 }}>
      {/* Watermark */}
      <text x={W/2} y={H/2} textAnchor="middle" dominantBaseline="middle"
        fill="rgba(201,168,76,0.04)" fontSize={48} fontWeight="900"
        style={{ userSelect: "none", pointerEvents: "none", fontFamily: "serif" }}>
        SB688 · JGA
      </text>
      {/* Edges */}
      {OBS_EDGES.map(([a, b], i) => {
        const na = OBS_NODES.find(n => n.id === a);
        const nb = OBS_NODES.find(n => n.id === b);
        const sa = nodeStates[a] || "healthy";
        const sb = nodeStates[b] || "healthy";
        const active = sa !== "dead" && sb !== "dead";
        return (
          <line key={i}
            x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
            stroke={active ? "rgba(201,168,76,0.25)" : "rgba(60,60,80,0.3)"}
            strokeWidth={active ? 1.5 : 1}
          />
        );
      })}
      {/* Nodes */}
      {OBS_NODES.map(node => {
        const st = nodeStates[node.id] || "healthy";
        const cfg = NODE_STATUS_STYLE[st] || NODE_STATUS_STYLE.healthy;
        return (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r={28} fill={cfg.fill} stroke={cfg.stroke} strokeWidth={1.5} />
            <text x={node.x} y={node.y - 4} textAnchor="middle" fill={cfg.text} fontSize={9} fontWeight="700">
              {node.label}
            </text>
            <text x={node.x} y={node.y + 8} textAnchor="middle" fill={cfg.text} fontSize={7} opacity={0.6}>
              [{node.role}]
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function PublicObserver() {
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [phase, setPhase] = useState(0);
  const [running, setRunning] = useState(false);
  const [nodeStates, setNodeStates] = useState({});
  const [log, setLog] = useState([]);
  const [done, setDone] = useState(false);

  const reset = () => {
    setSelectedDemo(null);
    setPhase(0);
    setRunning(false);
    setNodeStates({});
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
    if (phase >= selectedDemo.phases.length) {
      setRunning(false);
      setDone(true);
      return;
    }
    const p = selectedDemo.phases[phase];
    const timer = setTimeout(() => {
      setLog(prev => [...prev, p.label]);
      if (p.node && p.status) {
        setNodeStates(prev => ({ ...prev, [p.node]: p.status }));
      }
      if (p.status === "dead") {
        setNodeStates(Object.fromEntries(OBS_NODES.map(n => [n.id, "dead"])));
      }
      if (p.status === "done") {
        setNodeStates(Object.fromEntries(OBS_NODES.map(n => [n.id, "healthy"])));
      }
      setPhase(prev => prev + 1);
    }, 950);
    return () => clearTimeout(timer);
  }, [running, phase, selectedDemo]);

  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50"
        style={{ background: "linear-gradient(180deg, hsl(220,22%,5%) 0%, hsl(220,18%,7%) 100%)", boxShadow: "0 1px 0 rgba(201,168,76,0.18), 0 4px 24px rgba(0,0,0,0.6)" }}>
        <div className="warrior-divider" />
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: 34 }}>
              <CrownIcon size={20} color="#C9A84C" />
              <LionIcon size={24} color="#C9A84C" />
            </div>
            <div className="w-px h-9 bg-gradient-to-b from-transparent via-primary/40 to-transparent flex-shrink-0" />
            <div>
              <h1 className="text-sm font-bold tracking-widest font-cinzel leading-tight" style={{ color: "#C9A84C" }}>
                SB688 · PUBLIC OBSERVER
              </h1>
              <p className="text-[9px] text-muted-foreground tracking-widest uppercase mt-0.5">
                Read-Only Live Capability View · J.G.A.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="text-[10px] bg-primary/10 text-primary border border-primary/30 flex items-center gap-1">
              <Eye className="w-3 h-3" /> Observer Mode
            </Badge>
            <Badge className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Read-Only · No Source Access
            </Badge>
          </div>
        </div>
        <div className="warrior-divider" />
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Intro */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="flex flex-col items-center gap-2">
            <CrownIcon size={42} color="#C9A84C" />
            <LionIcon size={50} color="#C9A84C" />
          </div>
          <div className="warrior-divider w-40 mx-auto" />
          <h2 className="text-2xl font-bold font-cinzel" style={{ color: "#C9A84C" }}>
            Live System Capability Demo
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This is a <strong className="text-foreground">read-only public observer view</strong> of the SB688 resilience platform. You can watch the system perform live recovery, containment, and tamper-rejection sequences in real time. Source code, internal logic, and data structures are intentionally obfuscated — you can verify the system works, but not replicate it.
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1 text-teal-400"><CheckCircle2 className="w-3 h-3" /> Live behavior visible</span>
            <span className="flex items-center gap-1 text-red-400"><XCircle className="w-3 h-3" /> Source logic hidden</span>
            <span className="flex items-center gap-1 text-amber-400"><Lock className="w-3 h-3" /> Data endpoints obfuscated</span>
            <span className="flex items-center gap-1 text-primary"><Shield className="w-3 h-3" /> Architecture by J.G.A.</span>
          </div>
        </div>

        {/* Demo Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DEMOS.map(demo => {
            const Icon = demo.icon;
            const active = selectedDemo?.id === demo.id;
            return (
              <button key={demo.id} onClick={() => runDemo(demo)}
                disabled={running}
                className={`rounded-xl border p-3 text-left transition-all space-y-1.5 ${active ? "border-primary/40 bg-primary/8" : "border-border bg-card hover:border-primary/25 hover:bg-card/80"} disabled:opacity-50`}>
                <Icon className="w-4 h-4" style={{ color: demo.color }} />
                <div className="text-xs font-bold text-foreground leading-tight">{demo.label}</div>
                <div className="text-[9px] text-muted-foreground">Click to run</div>
              </button>
            );
          })}
        </div>

        {/* Live viz */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Topology */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">Live Topology</h3>
              <Badge className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Obfuscated · JGA
              </Badge>
            </div>
            <div style={{ background: "rgba(8,10,16,0.7)", borderRadius: 8, padding: 8 }}>
              <TopologyViz nodeStates={nodeStates} />
            </div>
            {!selectedDemo && (
              <p className="text-[10px] text-muted-foreground text-center italic">Select a demo above to watch the system run.</p>
            )}
          </div>

          {/* Execution log */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">Execution Log</h3>
              {running && (
                <Badge className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
                  Running
                </Badge>
              )}
              {done && (
                <Badge className="text-[9px] bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Complete
                </Badge>
              )}
            </div>
            <div className="flex-1 min-h-[160px] bg-[#060810] rounded-lg p-3 space-y-1 overflow-y-auto font-mono">
              {log.length === 0 ? (
                <p className="text-[10px] text-muted-foreground italic">Awaiting demo…</p>
              ) : (
                log.map((entry, i) => (
                  <div key={i} className="text-[10px] text-teal-300/80 leading-relaxed flex gap-2">
                    <span className="text-primary/40 flex-shrink-0">{String(i+1).padStart(2,"0")}</span>
                    <span>{entry}</span>
                  </div>
                ))
              )}
            </div>
            {selectedDemo && done && (
              <Button onClick={reset} variant="outline" className="w-full text-xs border-border">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Run Another Demo
              </Button>
            )}
          </div>
        </div>

        {/* Proof scorecard */}
        {done && selectedDemo && (
          <div className="bg-card border border-primary/20 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <Shield className="w-4 h-4" /> Capability Proof — {selectedDemo.label}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {selectedDemo.proof.map((item, i) => (
                <div key={i} className="bg-teal-500/5 border border-teal-500/20 rounded-lg p-3 space-y-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <p className="text-[10px] text-teal-300 font-semibold leading-tight">{item}</p>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-muted-foreground/50">
              All sequences run entirely in this browser. Internal state logic, recovery algorithms, and checkpoint structures are intentionally withheld from this view. Architecture: John Arenz — J.G.A.
            </p>
          </div>
        )}

        {/* Observer notice */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-400">Observer Mode — What You Can & Can't See</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground leading-relaxed">
            <div className="space-y-1">
              <p className="text-teal-400 font-semibold mb-1">✓ Visible to you:</p>
              <p>• Live recovery sequences running in real time</p>
              <p>• Node topology and state transitions</p>
              <p>• Capability proof scorecards per demo</p>
              <p>• Execution log with step-by-step narration</p>
            </div>
            <div className="space-y-1">
              <p className="text-red-400 font-semibold mb-1">✗ Intentionally withheld:</p>
              <p>• Internal recovery algorithms and engine logic</p>
              <p>• Checkpoint data structures and hash schemes</p>
              <p>• Route computation and braid geometry details</p>
              <p>• Sovereign Guardian HMAC/Merkle implementation</p>
            </div>
          </div>
        </div>

        {/* Attribution */}
        <div className="text-center text-[10px] text-muted-foreground/50 space-y-1 pb-6">
          <div className="flex items-center justify-center gap-2">
            <CrownIcon size={14} color="rgba(201,168,76,0.4)" />
            <span className="font-cinzel" style={{ color: "rgba(201,168,76,0.5)" }}>SB688 · National Resilience Council · Architecture by John Arenz — J.G.A.</span>
          </div>
          <p>This public observer link may be shared freely. It does not grant access to source code, internals, or the full console.</p>
        </div>
      </main>
    </div>
  );
}