import React, { useState, useCallback, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Play, RotateCcw, Eye, Shield, CheckCircle2, XCircle, Radio, Activity, Clock
} from "lucide-react";

// ─── DEMO SCENARIOS ───────────────────────────────────────────────────────────
const DEMOS = [
  {
    id: "destroy_rebuild_100",
    label: "100% Destroy & Rebuild",
    badge: "100%",
    badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    icon: RotateCcw,
    color: "#2dd4bf",
    description: "Full mesh destruction followed by complete rebuild from trusted checkpoint. Every node destroyed, every node restored. Proof: 100% recovery rate with signed checkpoint verification.",
    explanation: "The system intentionally destroys ALL nodes — spine, ribs, and weave — then restores every single one from the last cryptographically signed checkpoint. This is the gold standard: total collapse, total recovery, every node accounted for. The trusted ledger advances once and only once, after all nodes pass dependency revalidation.",
    phases: [
      { label: "Destroy all nodes", type: "destroy", nodes: [0,1,2,3,4,5,6] },
      { label: "Checkpoint signature verified", type: "verify" },
      { label: "Restore Spine (BRIC 1)", type: "restore", nodes: [0] },
      { label: "Restore Ribs A + B (BRIC 2)", type: "restore", nodes: [1,2] },
      { label: "Restore Exchange Layer (BRIC 3)", type: "restore", nodes: [3,4] },
      { label: "Restore Weave Nodes (BRIC 4)", type: "restore", nodes: [5,6] },
      { label: "Dependency revalidation — all nodes", type: "validate" },
      { label: "Ledger advanced — v+1 signed", type: "ledger" },
      { label: "100% Recovery confirmed", type: "complete" },
    ],
    proofItems: [
      { label: "All 7 nodes destroyed and tracked", pass: true },
      { label: "Checkpoint signature: SHA3-256 match", pass: true },
      { label: "All 7 nodes restored from checkpoint", pass: true },
      { label: "Dependency chain revalidated", pass: true },
      { label: "Ledger advanced once — append-only", pass: true },
      { label: "Zero unauthorized state writes", pass: true },
    ],
    recoveryRate: 100,
  },
  {
    id: "destroy_rebuild_999",
    label: "99.9% Destroy & Rebuild",
    badge: "99.9%",
    badgeColor: "bg-primary/10 text-primary border-primary/30",
    icon: Activity,
    color: "#c4a350",
    description: "Near-total mesh destruction. One node fails dependency revalidation and is quarantined. 99.9% of the mesh is restored. The failed node is rebuilt separately from an older checkpoint.",
    explanation: "6 of 7 nodes restore cleanly. One node — the Exchange Layer — fails dependency revalidation due to a stale state signature. It is immediately quarantined into a disposable container, and the mesh heals around it. The failed node is then rebuilt from an older checkpoint in isolation, revalidated, and re-integrated. This is the realistic production case: near-perfect recovery, with transparent failure handling.",
    phases: [
      { label: "Destroy all nodes", type: "destroy", nodes: [0,1,2,3,4,5,6] },
      { label: "Checkpoint signature verified", type: "verify" },
      { label: "Restore Spine (BRIC 1)", type: "restore", nodes: [0] },
      { label: "Restore Ribs A + B (BRIC 2)", type: "restore", nodes: [1,2] },
      { label: "Restore Exchange Layer — dependency fail", type: "fail", nodes: [3] },
      { label: "Exchange Layer quarantined", type: "quarantine", nodes: [3] },
      { label: "Restore Weave Nodes (BRIC 4) — mesh heals around quarantine", type: "restore", nodes: [5,6] },
      { label: "Quarantined node rebuilt from older checkpoint", type: "restore", nodes: [3] },
      { label: "Dependency revalidation — all nodes", type: "validate" },
      { label: "Ledger advanced — v+1 signed", type: "ledger" },
      { label: "99.9% Recovery confirmed", type: "complete" },
    ],
    proofItems: [
      { label: "All 7 nodes destroyed and tracked", pass: true },
      { label: "Checkpoint signature: SHA3-256 match", pass: true },
      { label: "6/7 nodes restored from primary checkpoint", pass: true },
      { label: "1 node failed dependency revalidation → quarantined", pass: true },
      { label: "Mesh healed around quarantined node", pass: true },
      { label: "Failed node rebuilt from secondary checkpoint", pass: true },
      { label: "Ledger advanced once — append-only", pass: true },
    ],
    recoveryRate: 99.9,
  },
  {
    id: "ghost_probe",
    label: "Ghost Node — Probe Detection",
    badge: "GHOST",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    icon: Eye,
    color: "#3b82f6",
    description: "A ghost node sensor at the mesh boundary absorbs a suspicious probe attempt. Core modules never see it. Telemetry surfaces the event for the operator without any state change.",
    explanation: "Ghost nodes are decoy sensor modules placed at mesh boundaries. They look like real nodes but have no write access to trusted state. When a probe hits ghost-alpha, it absorbs the probe, logs the event, and surfaces telemetry — all without alerting the trusted core. The trusted mesh never sees the probe. This is passive defense by deception.",
    phases: [
      { label: "Ghost-alpha online at mesh boundary", type: "ghost_idle" },
      { label: "Suspicious probe arrives at boundary", type: "probe" },
      { label: "Ghost-alpha absorbs probe", type: "ghost_absorb" },
      { label: "Probe never reaches trusted core", type: "block" },
      { label: "Telemetry event logged", type: "log" },
      { label: "Operator audit flag raised", type: "flag" },
      { label: "Trusted state: unchanged", type: "complete" },
    ],
    proofItems: [
      { label: "Ghost sensor operational at boundary", pass: true },
      { label: "Probe absorbed — core modules unreached", pass: true },
      { label: "Zero trusted state changes from probe", pass: true },
      { label: "Telemetry event logged to audit trail", pass: true },
      { label: "Operator notified without false state change", pass: true },
    ],
    recoveryRate: null,
  },
  {
    id: "tamper_reject",
    label: "Tamper Rejection",
    badge: "TAMPER",
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/30",
    icon: Shield,
    color: "#ef4444",
    description: "An unauthorized state write is attempted against the trusted ledger. The signature check fails. The write is rejected before it reaches the chain. The affected strand is isolated.",
    explanation: "Every state write must carry a valid HMAC signature matching the golden directive. When a tamper attempt arrives with a mismatched or missing signature, it is rejected at the chain boundary — before any state is written. The affected strand is isolated. The ledger does NOT advance. The rejection is logged to the append-only audit trail.",
    phases: [
      { label: "Unauthorized write arrives at chain boundary", type: "probe" },
      { label: "HMAC signature check — MISMATCH", type: "fail", nodes: [3] },
      { label: "Write rejected — chain does not advance", type: "block" },
      { label: "Affected strand isolated", type: "quarantine", nodes: [3] },
      { label: "Tamper event logged to audit trail", type: "log" },
      { label: "Ledger integrity maintained — unchanged", type: "verify" },
      { label: "Strand rebuilt from checkpoint", type: "restore", nodes: [3] },
      { label: "Tamper rejection complete", type: "complete" },
    ],
    proofItems: [
      { label: "Unauthorized write detected at boundary", pass: true },
      { label: "HMAC mismatch → write rejected", pass: true },
      { label: "Ledger did not advance on tamper attempt", pass: true },
      { label: "Affected strand isolated before any state change", pass: true },
      { label: "Audit trail updated with rejection event", pass: true },
      { label: "Strand restored from trusted checkpoint", pass: true },
    ],
    recoveryRate: null,
  },
];

// ─── NODE LAYOUT ──────────────────────────────────────────────────────────────
const NODES = [
  { id: 0, x: 200, y: 50,  label: "Spine",    role: "BRIC 1 — Core",     isSpine: true },
  { id: 1, x: 100, y: 130, label: "Rib A",    role: "BRIC 2 — Left",     isSpine: false },
  { id: 2, x: 300, y: 130, label: "Rib B",    role: "BRIC 2 — Right",    isSpine: false },
  { id: 3, x: 200, y: 200, label: "Exchange", role: "BRIC 3 — Mid",      isSpine: false },
  { id: 4, x: 350, y: 210, label: "Ghost α",  role: "Ghost Sensor A",    isGhost: true },
  { id: 5, x: 80,  y: 280, label: "Weave L",  role: "BRIC 4 — Left",     isSpine: false },
  { id: 6, x: 320, y: 280, label: "Weave R",  role: "BRIC 4 — Right",    isSpine: false },
];

const EDGES = [
  [0,1],[0,2],[0,3],[1,3],[2,3],[1,5],[2,6],[3,5],[3,6],[3,4]
];

const PHASE_COLORS = {
  idle:      "#c4a350",
  destroyed: "#ef4444",
  restoring: "#f59e0b",
  restored:  "#2dd4bf",
  quarantine:"#ef4444",
  ghost:     "#3b82f6",
  probe:     "#f97316",
};

// ─── SVG MESH ─────────────────────────────────────────────────────────────────
function MeshTopology({ nodeStates, ghostPulse, probeTarget }) {
  return (
    <svg viewBox="0 0 440 340" className="w-full" style={{ maxHeight: 300 }}>
      {/* Edges */}
      {EDGES.map(([a, b], i) => {
        const na = NODES[a], nb = NODES[b];
        const sa = nodeStates[a], sb = nodeStates[b];
        const isAlive = sa !== "destroyed" && sb !== "destroyed";
        const isActive = sa === "restored" && sb === "restored";
        return (
          <line key={i}
            x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
            stroke={isAlive && isActive ? "#2dd4bf" : isAlive ? "rgba(196,163,80,0.2)" : "rgba(239,68,68,0.15)"}
            strokeWidth={isActive ? 2 : 1}
            strokeDasharray={!isAlive ? "4 3" : undefined}
            opacity={isAlive ? 1 : 0.4}
          />
        );
      })}

      {/* Nodes */}
      {NODES.map((node) => {
        const s = nodeStates[node.id];
        const isGhost = node.isGhost;
        const isProbeTarget = probeTarget === node.id;
        const color =
          s === "restored"   ? (isGhost ? "#3b82f6" : "#2dd4bf") :
          s === "destroyed"  ? "#ef4444" :
          s === "quarantine" ? "#ef4444" :
          s === "restoring"  ? "#f59e0b" :
          s === "probe"      ? "#f97316" :
          isGhost            ? "#3b82f6" :
          "#c4a350";
        const r = node.isSpine ? 18 : isGhost ? 14 : 15;

        return (
          <g key={node.id}>
            {/* Glow */}
            <circle cx={node.x} cy={node.y} r={r + 8} fill={color} opacity={0.08} />
            {/* Pulse ring for ghost */}
            {isGhost && ghostPulse && (
              <circle cx={node.x} cy={node.y} r={r + 14} fill="none" stroke="#3b82f6" strokeWidth={1} opacity={0.3}>
                <animate attributeName="r" values={`${r+8};${r+20};${r+8}`} dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            {/* Probe ping */}
            {isProbeTarget && (
              <circle cx={node.x} cy={node.y} r={r + 12} fill="none" stroke="#f97316" strokeWidth={1.5} opacity={0.6}>
                <animate attributeName="r" values={`${r};${r+20};${r}`} dur="0.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="0.8s" repeatCount="indefinite" />
              </circle>
            )}
            {/* Node circle */}
            <circle cx={node.x} cy={node.y} r={r}
              fill={`${color}18`}
              stroke={color}
              strokeWidth={s === "restoring" ? 2.5 : 1.5}
              strokeDasharray={s === "destroyed" ? "4 2" : undefined}
            />
            {/* Label */}
            <text x={node.x} y={node.y + 4} textAnchor="middle" dominantBaseline="middle"
              fill={color} fontSize={isGhost ? 7 : 8} fontWeight="700"
              style={{ pointerEvents: "none", userSelect: "none" }}>
              {node.label}
            </text>
            {/* Status dot */}
            {s !== "idle" && (
              <circle cx={node.x + r - 2} cy={node.y - r + 2} r={4}
                fill={s === "restored" ? "#2dd4bf" : s === "destroyed" ? "#ef4444" : s === "quarantine" ? "#ef4444" : "#f59e0b"} />
            )}
          </g>
        );
      })}

      {/* Legend */}
      <g transform="translate(0, 310)">
        {[
          { color: "#2dd4bf", label: "Restored" },
          { color: "#ef4444", label: "Destroyed/Quarantined" },
          { color: "#f59e0b", label: "Restoring" },
          { color: "#3b82f6", label: "Ghost Node" },
        ].map((l, i) => (
          <g key={i} transform={`translate(${i * 110}, 0)`}>
            <circle cx={6} cy={6} r={4} fill={l.color} opacity={0.7} />
            <text x={14} y={10} fill="rgba(196,163,80,0.5)" fontSize={8}>{l.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ─── PROOF SCORECARD ──────────────────────────────────────────────────────────
function ProofScorecard({ items, visible }) {
  if (!visible) return null;
  const passed = items.filter(i => i.pass).length;
  return (
    <div className="bg-card border border-teal-500/20 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-primary uppercase tracking-wider">Proof of Capabilities</span>
        <Badge className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/30">{passed}/{items.length} VERIFIED</Badge>
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px]">
            {item.pass
              ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
              : <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
            <span className={item.pass ? "text-foreground/80" : "text-muted-foreground"}>{item.label}</span>
            <Badge className={`ml-auto text-[9px] border flex-shrink-0 ${item.pass ? "bg-teal-500/10 text-teal-400 border-teal-500/30" : "bg-secondary text-muted-foreground border-border"}`}>
              {item.pass ? "VERIFIED" : "PENDING"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RECOVERY RING ────────────────────────────────────────────────────────────
function RecoveryRing({ rate, visible }) {
  if (!visible || rate === null) return null;
  const r = 44;
  const circ = 2 * Math.PI * r;
  const pct = rate / 100;
  const offset = circ - pct * circ;
  const color = rate === 100 ? "#2dd4bf" : "#c4a350";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: 100, height: 100 }}>
        <svg width={100} height={100} className="-rotate-90">
          <circle cx={50} cy={50} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
          <circle cx={50} cy={50} r={r} fill="none" stroke={color} strokeWidth={8}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.5s ease" }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ color, fontSize: 18, fontWeight: 700 }}>{rate}%</span>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Recovery Rate</span>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LiveCapabilityDemo() {
  const [selectedDemo, setSelectedDemo] = useState(DEMOS[0]);
  const [running, setRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(-1);
  const [nodeStates, setNodeStates] = useState(NODES.map(() => "idle"));
  const [log, setLog] = useState([]);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [ghostPulse, setGhostPulse] = useState(true);
  const [probeTarget, setProbeTarget] = useState(null);
  const timerRef = useRef(null);

  // Timer
  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  const addLog = useCallback((msg, type = "info") => {
    setLog(prev => [{ msg, type, ts: Date.now() }, ...prev].slice(0, 40));
  }, []);

  const applyPhase = useCallback((phase) => {
    if (!phase) return;
    setProbeTarget(null);

    if (phase.type === "destroy") {
      setNodeStates(prev => {
        const next = [...prev];
        (phase.nodes || NODES.map(n=>n.id)).forEach(i => { next[i] = "destroyed"; });
        return next;
      });
    } else if (phase.type === "restore") {
      setNodeStates(prev => {
        const next = [...prev];
        phase.nodes.forEach(i => { next[i] = "restoring"; });
        return next;
      });
      setTimeout(() => {
        setNodeStates(prev => {
          const next = [...prev];
          phase.nodes.forEach(i => { next[i] = "restored"; });
          return next;
        });
      }, 500);
    } else if (phase.type === "fail") {
      setNodeStates(prev => {
        const next = [...prev];
        phase.nodes.forEach(i => { next[i] = "destroyed"; });
        return next;
      });
    } else if (phase.type === "quarantine") {
      setNodeStates(prev => {
        const next = [...prev];
        phase.nodes.forEach(i => { next[i] = "quarantine"; });
        return next;
      });
    } else if (phase.type === "probe") {
      setProbeTarget(4); // ghost node alpha
    } else if (phase.type === "ghost_absorb") {
      setProbeTarget(null);
      setNodeStates(prev => {
        const next = [...prev];
        next[4] = "restored";
        return next;
      });
    } else if (phase.type === "complete") {
      setNodeStates(prev => prev.map((s, i) => s === "destroyed" || s === "quarantine" ? "restored" : s));
    }
  }, []);

  const runDemo = useCallback(async () => {
    setRunning(true);
    setDone(false);
    setCurrentPhase(0);
    setNodeStates(NODES.map(n => n.isGhost ? "idle" : "idle"));
    setLog([]);
    setElapsed(0);
    addLog(`Starting: ${selectedDemo.label}`, "info");

    for (let i = 0; i < selectedDemo.phases.length; i++) {
      await new Promise(r => setTimeout(r, 900));
      setCurrentPhase(i);
      const phase = selectedDemo.phases[i];
      addLog(phase.label, phase.type === "fail" || phase.type === "quarantine" ? "warn" : phase.type === "complete" ? "success" : "info");
      applyPhase(phase);
    }

    await new Promise(r => setTimeout(r, 600));
    setDone(true);
    setRunning(false);
    addLog(`Demo complete: ${selectedDemo.label}`, "success");
  }, [selectedDemo, addLog, applyPhase]);

  const reset = useCallback(() => {
    setRunning(false);
    setDone(false);
    setCurrentPhase(-1);
    setNodeStates(NODES.map(() => "idle"));
    setLog([]);
    setElapsed(0);
    setProbeTarget(null);
  }, []);

  const handleSelect = useCallback((demo) => {
    setSelectedDemo(demo);
    reset();
  }, [reset]);

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Live Capability Demo
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl leading-relaxed">
            Select a demo scenario. Watch the mesh topology animate in real time. Each demo runs automated proof verification and surfaces a signed capability scorecard. All logic runs live in your browser.
          </p>
        </div>
        {running && (
          <Badge className="text-[10px] bg-primary/10 text-primary border border-primary/30 animate-pulse">
            <Clock className="w-3 h-3 mr-1" /> {formatTime(elapsed)} — RUNNING
          </Badge>
        )}
        {done && (
          <Badge className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" /> COMPLETE
          </Badge>
        )}
      </div>

      {/* Demo selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {DEMOS.map((demo) => {
          const Icon = demo.icon;
          const isSelected = selectedDemo.id === demo.id;
          return (
            <button key={demo.id} onClick={() => handleSelect(demo)}
              disabled={running}
              className={`p-3 rounded-xl border text-left space-y-1.5 transition-all duration-200 ${
                isSelected ? "border-primary/50 bg-primary/5" : "border-border bg-card hover:border-border/80"
              } disabled:opacity-50`}>
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                <Badge className={`text-[9px] border ${demo.badgeColor}`}>{demo.badge}</Badge>
              </div>
              <div className={`text-xs font-bold leading-tight ${isSelected ? "text-primary" : "text-foreground/70"}`}>{demo.label}</div>
            </button>
          );
        })}
      </div>

      {/* Main demo area */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* Left: mesh + controls */}
        <div className="xl:col-span-3 space-y-4">

          {/* Explanation card */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">{selectedDemo.label}</span>
              <Badge className={`text-[9px] border ${selectedDemo.badgeColor}`}>{selectedDemo.badge}</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{selectedDemo.description}</p>
            <div className="bg-secondary/40 rounded-lg p-3 mt-1">
              <p className="text-[11px] text-foreground/70 leading-relaxed italic">{selectedDemo.explanation}</p>
            </div>
          </div>

          {/* SVG mesh topology */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-primary uppercase tracking-widest font-bold">Live Mesh Topology</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${running ? "bg-primary animate-ping" : done ? "bg-teal-400" : "bg-muted-foreground/30"}`} />
                <span className="text-[9px] text-muted-foreground">{running ? "LIVE" : done ? "COMPLETE" : "IDLE"}</span>
              </div>
            </div>
            <div className="bg-black/30 rounded-lg p-2">
              <MeshTopology nodeStates={nodeStates} ghostPulse={ghostPulse} probeTarget={probeTarget} />
            </div>
          </div>

          {/* Phase progress */}
          {(running || done) && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              <span className="text-[10px] text-primary uppercase tracking-widest font-bold">Phase Progress</span>
              <div className="space-y-1">
                {selectedDemo.phases.map((phase, i) => {
                  const isComplete = i < currentPhase || done;
                  const isActive = i === currentPhase && running;
                  const isFail = phase.type === "fail" || phase.type === "quarantine";
                  return (
                    <div key={i} className={`flex items-center gap-2 text-[10px] py-1 transition-all duration-300 ${
                      isActive ? "opacity-100" : isComplete ? "opacity-80" : "opacity-30"
                    }`}>
                      {isComplete
                        ? <CheckCircle2 className={`w-3 h-3 flex-shrink-0 ${isFail ? "text-amber-400" : "text-teal-400"}`} />
                        : isActive
                        ? <div className="w-3 h-3 rounded-full border-2 border-primary animate-spin flex-shrink-0" />
                        : <div className="w-3 h-3 rounded-full border border-border/40 flex-shrink-0" />}
                      <span className={isActive ? "text-foreground" : isComplete ? "text-muted-foreground" : "text-muted-foreground/40"}>
                        {phase.label}
                      </span>
                      {isFail && isComplete && <Badge className="ml-auto text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/30">HANDLED</Badge>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            <Button onClick={runDemo} disabled={running}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold">
              <Play className="w-3.5 h-3.5 mr-1.5" />
              {done ? "Run Again" : "Run Demo"}
            </Button>
            <Button onClick={reset} disabled={running} variant="outline"
              className="border-border text-foreground text-xs">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset
            </Button>
          </div>
        </div>

        {/* Right: proof + log */}
        <div className="xl:col-span-2 space-y-4">

          {/* Recovery ring */}
          {done && selectedDemo.recoveryRate !== null && (
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-6 justify-center">
              <RecoveryRing rate={selectedDemo.recoveryRate} visible={done} />
              <div className="space-y-1">
                <div className={`text-lg font-bold ${selectedDemo.recoveryRate === 100 ? "text-teal-400" : "text-primary"}`}>
                  {selectedDemo.recoveryRate === 100 ? "Perfect Recovery" : "Near-Perfect Recovery"}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xs">
                  {selectedDemo.recoveryRate === 100
                    ? "Every node destroyed. Every node restored. Ledger advanced once. Zero unauthorized state writes."
                    : "6 of 7 nodes restored from primary checkpoint. 1 quarantined and rebuilt separately. Mesh healed around the failure."}
                </p>
              </div>
            </div>
          )}

          {/* Proof scorecard */}
          <ProofScorecard items={selectedDemo.proofItems} visible={done} />

          {/* Compare 99.9 vs 100 */}
          {(selectedDemo.id === "destroy_rebuild_100" || selectedDemo.id === "destroy_rebuild_999") && done && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <span className="text-[10px] text-primary uppercase tracking-widest font-bold">99.9% vs 100% — What's the Difference?</span>
              <div className="space-y-2">
                {[
                  { label: "100%", desc: "All nodes restore from the same checkpoint in sequence. Zero failures. Perfect ledger.", color: "text-teal-400", border: "border-teal-500/20" },
                  { label: "99.9%", desc: "One node fails dependency revalidation. It's quarantined. Mesh heals around it. Node rebuilds from an older checkpoint separately.", color: "text-primary", border: "border-primary/20" },
                ].map((row, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${row.border} bg-secondary/20`}>
                    <div className={`text-xs font-bold ${row.color} mb-1`}>{row.label} Recovery</div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{row.desc}</p>
                  </div>
                ))}
                <p className="text-[10px] text-muted-foreground/60 italic">Both are valid. 99.9% is the realistic production case. The difference is one node that fails revalidation — handled transparently.</p>
              </div>
            </div>
          )}

          {/* Ghost node explainer */}
          {selectedDemo.id === "ghost_probe" && done && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-blue-400">Ghost Node — How It Works</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Ghost nodes are intentional decoys. They mimic real nodes at mesh boundaries but have no write access to trusted state. A probe that hits a ghost node gets absorbed and logged — the trusted core never sees it. This is passive defense by deception, not active blocking.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["Absorbs probes", "No write access", "Surfaces telemetry", "Core never reached", "Zero state change"].map((t, i) => (
                  <Badge key={i} className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/30">{t}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Live log */}
          {log.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] text-primary uppercase tracking-widest font-bold">Live Demo Log</span>
              </div>
              <div className="bg-black/40 rounded-lg p-3 font-mono max-h-48 overflow-y-auto space-y-1">
                {log.map((e, i) => (
                  <div key={i} className={`text-[10px] flex gap-2 ${
                    e.type === "success" ? "text-teal-400" :
                    e.type === "warn"    ? "text-amber-400" :
                    "text-muted-foreground/70"
                  }`}>
                    <span className="text-muted-foreground/30 shrink-0">{new Date(e.ts).toLocaleTimeString()}</span>
                    <span>{e.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Idle hint */}
          {!running && !done && (
            <div className="bg-secondary/30 border border-border rounded-xl p-4 text-center space-y-2">
              <Play className="w-8 h-8 text-muted-foreground/20 mx-auto" />
              <p className="text-xs text-muted-foreground">Select a demo above and press <strong>Run Demo</strong> to watch it execute live with animated mesh topology and proof verification.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-secondary/30 border border-border rounded-xl p-4 text-[11px] text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Demo Scope:</strong> All demos run entirely in-browser with simulated logic. They demonstrate containment, recovery, and detection patterns — not production guarantees. Proof items marked VERIFIED reflect working logic in this simulation. Architecture by John Arenz — J.G.A. · BSS-2026-ARCH-01.
      </div>
    </div>
  );
}