import React, { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Play, Pause, ChevronRight, ChevronLeft,
  Clock, Shield, Zap, Radio, Lock, CheckCircle2, SkipBack, Activity
} from "lucide-react";

const GOLD   = "#C9A84C";
const GREEN  = "#22c55e";
const RED    = "#ef4444";
const BLUE   = "#3b82f6";
const PURPLE = "#a78bfa";
const AMBER  = "#f59e0b";
const TEAL   = "#2dd4bf";
const DIM    = "rgba(232,217,176,0.45)";
const TEXT   = "#E8D9B0";
const BG     = "#050608";
const CARD   = "#0A0B0E";

// ── Ledger event library ──────────────────────────────────────────────────────
const LEDGER_EVENTS = [
  {
    id: "evt_001",
    ts: "2026-04-27T00:05:12Z",
    type: "break_heal",
    title: "Driver Node Fault — Full Recovery",
    severity: "critical",
    hash: "a3f9d2c…e71",
    duration: "4.2s",
    icon: Zap,
    color: AMBER,
    summary: "Driver node isolated after HMAC mismatch. Ghost Node absorbed residual traffic. Spine re-stitched from v4 checkpoint.",
    steps: [
      { id: 1, label: "Driver node fault detected",         type: "fault",   nodes: ["driver"],           detail: "HMAC signature drift detected on Driver. Integrity check failed." },
      { id: 2, label: "Driver isolated — traffic rerouted", type: "isolate", nodes: ["driver"],           detail: "Node quarantined. Cascade Guard engaged. Traffic rerouted via Cold Standby." },
      { id: 3, label: "Ghost Node absorbing residual load", type: "ghost",   nodes: ["gate"],             detail: "Ghost Sentinel intercepted residual probe at Gate boundary." },
      { id: 4, label: "Checkpoint v4 loaded — Spine prep",  type: "prep",    nodes: [],                   detail: "Trusted checkpoint v4 authenticated. SHA3-256 hash verified. Spine staging." },
      { id: 5, label: "Driver node rebuilding",             type: "rebuild", nodes: ["driver"],           detail: "Driver being reconstructed from checkpoint. Dependency chain re-validating." },
      { id: 6, label: "Stitch re-confirmed — all nodes OK", type: "heal",    nodes: ["driver", "output"], detail: "Stitch geometry restored. All 7 nodes verified. Data loss: 0.0000%." },
      { id: 7, label: "Ledger advanced → v5",               type: "ledger",  nodes: [],                   detail: "Trusted record v5 sealed. SHA3-256: 8b1fc04…a22. System golden state restored." },
    ],
  },
  {
    id: "evt_002",
    ts: "2026-04-27T00:11:44Z",
    type: "break_heal",
    title: "Hacker Trap — System Suicide & Rollback",
    severity: "critical",
    hash: "ff3220b…d9e",
    duration: "1.2s",
    icon: Shield,
    color: RED,
    summary: "Adversarial intrusion triggered System Suicide protocol. All nodes bricked. Ghost Node carried Golden Snapshot. Ledger rolled back to v4. Full restore in 1.2s.",
    steps: [
      { id: 1, label: "Adversarial intrusion detected",         type: "fault",   nodes: ["core","gate","driver","storage","policy","output","ledger"], detail: "Hacker Trap triggered. Unauthorized write detected at Core boundary." },
      { id: 2, label: "System Suicide initiated",               type: "isolate", nodes: ["core","gate","driver","storage","policy","output","ledger"], detail: "All nodes bricked immediately. No state committed. Poison-pill active." },
      { id: 3, label: "Ghost Node → carrying Golden Snapshot",  type: "ghost",   nodes: [],                                                            detail: "Ghost Sentinel #0 captured last Golden State (v4). Temporal link holding." },
      { id: 4, label: "Ledger rollback → v4",                   type: "prep",    nodes: [],                                                            detail: "Immutable ledger rolled back to v4. All post-intrusion entries discarded." },
      { id: 5, label: "Full restore from Golden Snapshot",      type: "rebuild", nodes: ["core","gate","driver","storage","policy","output","ledger"], detail: "All 7 nodes rebuilding simultaneously from Ghost-held snapshot." },
      { id: 6, label: "Stitch verified — 100% clean",           type: "heal",    nodes: ["core","gate","driver","storage","policy","output","ledger"], detail: "Hacker locked out. System clean. All nodes verified. 0.0000% data loss." },
      { id: 7, label: "Ledger sealed → v4 (clean)",             type: "ledger",  nodes: [],                                                            detail: "Trusted record v4 re-sealed. Intrusion event logged. System sovereign." },
    ],
  },
  {
    id: "evt_003",
    ts: "2026-04-27T00:18:03Z",
    type: "break_heal",
    title: "Storage Corruption — Braid Heal",
    severity: "major",
    hash: "1a77e9c…b03",
    duration: "6.8s",
    icon: Activity,
    color: PURPLE,
    summary: "Storage node corrupted by cascade fault. Braid geometry absorbed load. Cold standby activated. Storage rebuilt. Full recovery via Brick Stitch 1/2 offset.",
    steps: [
      { id: 1, label: "Storage node corruption detected",       type: "fault",   nodes: ["storage"],            detail: "Data integrity check failed on Storage. SHA3 mismatch. Node flagged." },
      { id: 2, label: "Policy + Output on cold standby",        type: "isolate", nodes: ["policy", "output"],   detail: "Cold standby links activated. Policy and Output rerouting through Braid." },
      { id: 3, label: "Braid geometry absorbing load",          type: "ghost",   nodes: ["ledger"],             detail: "Brick Stitch 1/2 offset geometry redistributing load to adjacent nodes." },
      { id: 4, label: "Storage wiped — checkpoint v5 loaded",   type: "prep",    nodes: ["storage"],            detail: "Corrupted storage wiped. Checkpoint v5 loaded. Dependency chain verified." },
      { id: 5, label: "Storage rebuilding",                     type: "rebuild", nodes: ["storage"],            detail: "Storage reconstructing from v5. Policy and Output still on cold standby." },
      { id: 6, label: "Policy + Output returned to primary",    type: "heal",    nodes: ["policy", "output"],   detail: "Storage verified. Primary routes restored. Cold standby released." },
      { id: 7, label: "Full stitch confirmed — Ledger → v6",    type: "ledger",  nodes: [],                     detail: "All nodes healthy. Brick Stitch geometry nominal. v6 sealed." },
    ],
  },
  {
    id: "evt_004",
    ts: "2026-04-27T00:29:55Z",
    type: "break_heal",
    title: "Policy Violation — Gate Isolation",
    severity: "major",
    hash: "5c9d841…f18",
    duration: "3.1s",
    icon: Lock,
    color: BLUE,
    summary: "Gate node transmitted unauthorized policy. Isolated before propagation. Policy revalidated from trusted directive. Gate rebuilt. No data loss.",
    steps: [
      { id: 1, label: "Unauthorized policy transmission detected", type: "fault",   nodes: ["gate"],   detail: "Gate node sent a policy directive not matching Golden Standard. Flagged." },
      { id: 2, label: "Gate isolated — policy blocked",            type: "isolate", nodes: ["gate"],   detail: "Gate quarantined. Policy write blocked at chain boundary. Ledger unchanged." },
      { id: 3, label: "Ghost Sentinel monitoring Gate boundary",   type: "ghost",   nodes: ["gate"],   detail: "Ghost Sentinel absorbing all residual Gate traffic. Core unexposed." },
      { id: 4, label: "Trusted policy directive reloaded",         type: "prep",    nodes: [],         detail: "Golden Directive reloaded from checkpoint v6. SHA3-256 verified." },
      { id: 5, label: "Gate rebuilding with valid policy",         type: "rebuild", nodes: ["gate"],   detail: "Gate reconstructing. Policy directive re-applied from Golden Standard." },
      { id: 6, label: "Gate rejoined — stitch clean",              type: "heal",    nodes: ["gate"],   detail: "Gate verified and re-integrated. Policy validated. 0 unauthorized writes." },
      { id: 7, label: "Ledger advanced → v7",                      type: "ledger",  nodes: [],         detail: "v7 sealed. Policy violation contained. System sovereign." },
    ],
  },
  {
    id: "evt_005",
    ts: "2026-04-27T00:41:18Z",
    type: "break_heal",
    title: "Full Mesh Stress Test — 99.9% Recovery",
    severity: "major",
    hash: "0d2fa3e…c55",
    duration: "9.4s",
    icon: Radio,
    color: TEAL,
    summary: "Intentional full mesh stress test. 6/7 nodes destroyed and rebuilt. Ledger node held as Temporal Anchor. 99.9% recovery rate confirmed.",
    steps: [
      { id: 1, label: "Stress test initiated — 6 nodes destroyed",    type: "fault",   nodes: ["core","gate","driver","storage","policy","output"], detail: "Intentional full mesh teardown. Ledger node retained as temporal anchor." },
      { id: 2, label: "Ledger holding as Temporal Anchor",             type: "ghost",   nodes: ["ledger"],                                          detail: "Ledger node isolated from destruction. Serving as 45-min temporal anchor." },
      { id: 3, label: "Checkpoint v7 authenticated",                   type: "prep",    nodes: [],                                                  detail: "v7 checkpoint SHA3-256 verified. All 6 node rebuild sequences staged." },
      { id: 4, label: "Spine + Ribs rebuilding first",                 type: "rebuild", nodes: ["core"],                                            detail: "Core node (Spine) rebuilt first per Brick Stitch build order." },
      { id: 5, label: "Gate + Driver + Storage rebuilding",            type: "rebuild", nodes: ["gate","driver","storage"],                         detail: "Rib layer rebuilding. Dependencies resolving against rebuilt Core." },
      { id: 6, label: "Policy + Output rebuilding — Weave layer",      type: "rebuild", nodes: ["policy","output"],                                 detail: "Weave layer rebuilding. All dependencies met. Stitch geometry closing." },
      { id: 7, label: "Full mesh restored — 99.9% · Ledger → v8",     type: "ledger",  nodes: [],                                                  detail: "All 7 nodes verified. 1 micro-event flagged for review. v8 sealed." },
    ],
  },
];

// ── Node positions ────────────────────────────────────────────────────────────
const NODE_POSITIONS = {
  core:    { x: 0.50, y: 0.10, label: "Core"    },
  gate:    { x: 0.18, y: 0.35, label: "Gate"    },
  driver:  { x: 0.82, y: 0.35, label: "Driver"  },
  storage: { x: 0.50, y: 0.55, label: "Storage" },
  policy:  { x: 0.18, y: 0.75, label: "Policy"  },
  output:  { x: 0.82, y: 0.75, label: "Output"  },
  ledger:  { x: 0.50, y: 0.90, label: "Ledger"  },
};

const EDGES = [
  ["core","gate"],["core","driver"],["gate","storage"],["driver","storage"],
  ["storage","policy"],["storage","output"],["policy","ledger"],["output","ledger"],
  ["gate","policy"],["driver","output"],
];

// Step type → node state
const STEP_STATE = {
  fault:   "fault",
  isolate: "isolated",
  ghost:   "ghost",
  prep:    "prep",
  rebuild: "rebuilding",
  heal:    "healthy",
  ledger:  "healthy",
};

// Node color by state
function nodeColor(state) {
  switch (state) {
    case "healthy":   return TEAL;
    case "fault":     return RED;
    case "isolated":  return RED;
    case "ghost":     return PURPLE;
    case "prep":      return AMBER;
    case "rebuilding":return GOLD;
    default:          return TEAL;
  }
}

// ── Canvas Renderer ───────────────────────────────────────────────────────────
function ReplayCanvas({ nodeStates, stepType, pulse }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const tRef      = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const draw = () => {
      tRef.current += 0.02;
      const t = tRef.current;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      // Watermark
      ctx.save();
      ctx.font = `bold ${W * 0.07}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(201,168,76,0.025)";
      ctx.fillText("SB688", W / 2, H / 2);
      ctx.restore();

      // Edges
      EDGES.forEach(([a, b]) => {
        const na = NODE_POSITIONS[a];
        const nb = NODE_POSITIONS[b];
        const sa = nodeStates[a] || "healthy";
        const sb = nodeStates[b] || "healthy";
        const dead = sa === "isolated" || sa === "fault" || sb === "isolated" || sb === "fault";
        const healing = sa === "rebuilding" || sb === "rebuilding";
        const ghostEdge = sa === "ghost" || sb === "ghost";

        ctx.beginPath();
        ctx.moveTo(na.x * W, na.y * H);
        ctx.lineTo(nb.x * W, nb.y * H);
        ctx.strokeStyle = dead ? `rgba(239,68,68,0.2)` : healing ? `rgba(201,168,76,${0.3 + 0.2 * Math.sin(t * 4)})` : ghostEdge ? `rgba(167,139,250,0.3)` : "rgba(201,168,76,0.15)";
        ctx.lineWidth = healing ? 2 : 1.5;
        ctx.strokeDasharray = dead ? "5 4" : "";
        if (dead) ctx.setLineDash([5, 4]); else ctx.setLineDash([]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Nodes
      Object.entries(NODE_POSITIONS).forEach(([id, pos]) => {
        const state = nodeStates[id] || "healthy";
        const color = nodeColor(state);
        const x = pos.x * W;
        const y = pos.y * H;
        const r = 20;
        const isActive = pulse && (nodeStates[id] && nodeStates[id] !== "healthy");

        // Pulse ring
        if (isActive) {
          const pr = r + 8 + 4 * Math.sin(t * 5);
          ctx.beginPath();
          ctx.arc(x, y, pr, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.2 + 0.15 * Math.sin(t * 5);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Node body
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = color + "18";
        ctx.strokeStyle = color;
        ctx.lineWidth = state === "rebuilding" ? 2.5 : 1.5;
        ctx.fill();
        ctx.stroke();

        // Spinning rebuild arc
        if (state === "rebuilding") {
          ctx.beginPath();
          ctx.arc(x, y, r + 5, t * 3, t * 3 + Math.PI * 1.2);
          ctx.strokeStyle = GOLD;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.7;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Label
        ctx.fillStyle = color;
        ctx.font = `bold 8px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pos.label, x, y);

        // State dot
        const dotColor = state === "healthy" ? GREEN : state === "rebuilding" ? GOLD : RED;
        ctx.beginPath();
        ctx.arc(x + r - 3, y - r + 3, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [nodeStates, pulse]);

  return (
    <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block", borderRadius: 8 }} />
  );
}

// ── Step type styling ─────────────────────────────────────────────────────────
const STEP_META = {
  fault:   { color: RED,    label: "FAULT",    bg: "rgba(239,68,68,0.08)" },
  isolate: { color: RED,    label: "ISOLATE",  bg: "rgba(239,68,68,0.06)" },
  ghost:   { color: PURPLE, label: "GHOST",    bg: "rgba(167,139,250,0.06)" },
  prep:    { color: AMBER,  label: "PREP",     bg: "rgba(245,158,11,0.06)" },
  rebuild: { color: GOLD,   label: "REBUILD",  bg: "rgba(201,168,76,0.06)" },
  heal:    { color: GREEN,  label: "HEAL",     bg: "rgba(34,197,94,0.06)" },
  ledger:  { color: TEAL,   label: "LEDGER",   bg: "rgba(45,212,191,0.06)" },
};

const SEVERITY_CONFIG = {
  critical: { color: RED,    label: "CRITICAL" },
  major:    { color: AMBER,  label: "MAJOR"    },
  minor:    { color: GREEN,  label: "MINOR"    },
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function HistoricalReplay() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentStep,   setCurrentStep]   = useState(0);
  const [playing,       setPlaying]       = useState(false);
  const [speed,         setSpeed]         = useState(1200); // ms per step
  const [nodeStates,    setNodeStates]    = useState(
    Object.fromEntries(Object.keys(NODE_POSITIONS).map(k => [k, "healthy"]))
  );
  const timerRef = useRef(null);

  // Build node state from steps 0..currentStep
  const computeNodeStates = useCallback((event, upToStep) => {
    const states = Object.fromEntries(Object.keys(NODE_POSITIONS).map(k => [k, "healthy"]));
    if (!event) return states;
    for (let i = 0; i <= upToStep; i++) {
      const step = event.steps[i];
      if (!step) break;
      const targetState = STEP_STATE[step.type] || "healthy";
      step.nodes.forEach(n => {
        if (states[n] !== undefined) states[n] = targetState;
      });
    }
    return states;
  }, []);

  // Update node states whenever step or event changes
  useEffect(() => {
    if (!selectedEvent) return;
    setNodeStates(computeNodeStates(selectedEvent, currentStep));
  }, [selectedEvent, currentStep, computeNodeStates]);

  // Auto-play ticker
  useEffect(() => {
    if (!playing || !selectedEvent) return;
    timerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= selectedEvent.steps.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speed);
    return () => clearInterval(timerRef.current);
  }, [playing, selectedEvent, speed]);

  const selectEvent = useCallback((event) => {
    clearInterval(timerRef.current);
    setSelectedEvent(event);
    setCurrentStep(0);
    setPlaying(false);
    setNodeStates(computeNodeStates(event, 0));
  }, [computeNodeStates]);

  const reset = useCallback(() => {
    clearInterval(timerRef.current);
    setCurrentStep(0);
    setPlaying(false);
    if (selectedEvent) setNodeStates(computeNodeStates(selectedEvent, 0));
  }, [selectedEvent, computeNodeStates]);

  const step = selectedEvent?.steps[currentStep];
  const isComplete = selectedEvent && currentStep === selectedEvent.steps.length - 1;
  const EventIcon = selectedEvent?.icon || Shield;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" /> Historical Replay
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed max-w-2xl">
          Select any break-and-heal event from the immutable ledger and watch the system restore itself step-by-step on the live topology canvas.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* LEFT — Ledger event list */}
        <div className="xl:col-span-1 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: DIM }}>
            Immutable Ledger — Break &amp; Heal Events
          </div>
          {LEDGER_EVENTS.map(event => {
            const Icon = event.icon;
            const sev  = SEVERITY_CONFIG[event.severity];
            const selected = selectedEvent?.id === event.id;
            return (
              <button key={event.id} onClick={() => selectEvent(event)}
                className="w-full text-left rounded-xl border px-4 py-3 transition-all duration-200 space-y-2"
                style={{
                  background: selected ? event.color + "0a" : CARD,
                  borderColor: selected ? event.color + "55" : "rgba(201,168,76,0.1)",
                  boxShadow: selected ? `0 0 14px ${event.color}10` : "none",
                }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: event.color + "15", border: `1px solid ${event.color}30` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: event.color }} />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold leading-tight" style={{ color: selected ? TEXT : "rgba(232,217,176,0.7)" }}>
                        {event.title}
                      </div>
                      <div className="text-[9px] font-mono mt-0.5" style={{ color: DIM }}>
                        {new Date(event.ts).toLocaleTimeString()} · {event.duration}
                      </div>
                    </div>
                  </div>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{ background: sev.color + "12", color: sev.color, border: `1px solid ${sev.color}30` }}>
                    {sev.label}
                  </span>
                </div>
                <div className="text-[9px] leading-relaxed line-clamp-2" style={{ color: DIM }}>
                  {event.summary}
                </div>
                <div className="flex items-center gap-2 text-[8px] font-mono" style={{ color: "rgba(201,168,76,0.25)" }}>
                  <Lock className="w-2.5 h-2.5" /> {event.hash}
                </div>
              </button>
            );
          })}
        </div>

        {/* RIGHT — Canvas + controls */}
        <div className="xl:col-span-2 space-y-4">
          {!selectedEvent ? (
            <div className="rounded-xl border flex flex-col items-center justify-center py-20 space-y-3"
              style={{ background: CARD, borderColor: "rgba(201,168,76,0.1)" }}>
              <Clock className="w-10 h-10" style={{ color: "rgba(201,168,76,0.2)" }} />
              <p className="text-sm" style={{ color: DIM }}>Select a ledger event to begin replay</p>
            </div>
          ) : (
            <>
              {/* Event header */}
              <div className="rounded-xl border px-4 py-3 flex items-start gap-3"
                style={{ background: CARD, borderColor: selectedEvent.color + "30" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: selectedEvent.color + "15", border: `1px solid ${selectedEvent.color}30` }}>
                  <EventIcon className="w-4 h-4" style={{ color: selectedEvent.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold" style={{ color: TEXT }}>{selectedEvent.title}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: DIM }}>
                    {new Date(selectedEvent.ts).toLocaleTimeString()} · {selectedEvent.duration} total recovery · {selectedEvent.steps.length} steps
                  </div>
                  <div className="text-[10px] mt-1 leading-relaxed" style={{ color: "rgba(232,217,176,0.6)" }}>
                    {selectedEvent.summary}
                  </div>
                </div>
                {isComplete && (
                  <Badge className="flex-shrink-0 text-[9px] border"
                    style={{ background: GREEN + "08", color: GREEN, borderColor: GREEN + "30" }}>
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Complete
                  </Badge>
                )}
              </div>

              {/* Canvas */}
              <div className="rounded-xl border overflow-hidden"
                style={{ background: BG, borderColor: step ? STEP_META[step.type]?.color + "30" : "rgba(201,168,76,0.12)", height: 320 }}>
                <ReplayCanvas nodeStates={nodeStates} stepType={step?.type} pulse={playing} />
              </div>

              {/* Step detail */}
              {step && (
                <div className="rounded-xl border px-4 py-3 transition-all duration-300"
                  style={{
                    background: STEP_META[step.type]?.bg || CARD,
                    borderColor: (STEP_META[step.type]?.color || GOLD) + "30"
                  }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded border"
                      style={{ color: STEP_META[step.type]?.color || GOLD, borderColor: (STEP_META[step.type]?.color || GOLD) + "35", background: (STEP_META[step.type]?.color || GOLD) + "12" }}>
                      STEP {step.id} / {selectedEvent.steps.length} · {STEP_META[step.type]?.label}
                    </span>
                    <span className="text-xs font-bold" style={{ color: TEXT }}>{step.label}</span>
                  </div>
                  <p className="text-[10px] leading-relaxed" style={{ color: DIM }}>{step.detail}</p>
                  {step.nodes.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {step.nodes.map(n => (
                        <span key={n} className="text-[8px] font-bold px-2 py-0.5 rounded-full border uppercase"
                          style={{ color: STEP_META[step.type]?.color || GOLD, borderColor: (STEP_META[step.type]?.color || GOLD) + "30" }}>
                          {NODE_POSITIONS[n]?.label || n}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex gap-1.5">
                  {selectedEvent.steps.map((s, i) => {
                    const meta = STEP_META[s.type];
                    const done = i <= currentStep;
                    const active = i === currentStep;
                    return (
                      <button key={s.id} onClick={() => { clearInterval(timerRef.current); setPlaying(false); setCurrentStep(i); }}
                        className="flex-1 h-2 rounded-full transition-all duration-300 relative"
                        style={{ background: done ? meta?.color || GOLD : "rgba(255,255,255,0.06)", boxShadow: active ? `0 0 8px ${meta?.color}80` : "none" }}
                        title={s.label} />
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[9px]" style={{ color: DIM }}>
                  <span>Step {currentStep + 1} of {selectedEvent.steps.length}</span>
                  <span>{Math.round(((currentStep + 1) / selectedEvent.steps.length) * 100)}% complete</span>
                </div>
              </div>

              {/* Playback controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={reset} className="p-2 rounded-lg border transition-all hover:bg-white/5"
                  style={{ borderColor: "rgba(255,255,255,0.1)", color: DIM }} title="Restart">
                  <SkipBack className="w-4 h-4" />
                </button>
                <button onClick={() => { clearInterval(timerRef.current); setPlaying(false); setCurrentStep(p => Math.max(0, p - 1)); }}
                  disabled={currentStep === 0}
                  className="p-2 rounded-lg border transition-all hover:bg-white/5 disabled:opacity-30"
                  style={{ borderColor: "rgba(255,255,255,0.1)", color: DIM }}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPlaying(v => !v)} disabled={isComplete}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
                  style={{ background: playing ? RED + "12" : selectedEvent.color + "15", color: playing ? RED : selectedEvent.color, border: `1px solid ${playing ? RED : selectedEvent.color}40` }}>
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {playing ? "Pause" : isComplete ? "Done" : "Play"}
                </button>
                <button onClick={() => { clearInterval(timerRef.current); setPlaying(false); setCurrentStep(p => Math.min(selectedEvent.steps.length - 1, p + 1)); }}
                  disabled={isComplete}
                  className="p-2 rounded-lg border transition-all hover:bg-white/5 disabled:opacity-30"
                  style={{ borderColor: "rgba(255,255,255,0.1)", color: DIM }}>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Speed */}
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="text-[9px]" style={{ color: DIM }}>Speed:</span>
                  {[{ label: "0.5×", val: 2400 }, { label: "1×", val: 1200 }, { label: "2×", val: 600 }, { label: "3×", val: 320 }].map(s => (
                    <button key={s.label} onClick={() => setSpeed(s.val)}
                      className="text-[9px] px-2 py-1 rounded border font-mono font-bold transition-all"
                      style={{ background: speed === s.val ? GOLD + "12" : "transparent", color: speed === s.val ? GOLD : DIM, borderColor: speed === s.val ? GOLD + "35" : "rgba(255,255,255,0.08)" }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step list */}
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: "rgba(201,168,76,0.1)" }}>
                <div className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: "rgba(201,168,76,0.04)", color: DIM, borderBottom: "1px solid rgba(201,168,76,0.08)" }}>
                  Replay Timeline
                </div>
                <div className="divide-y" style={{ divideColor: "rgba(255,255,255,0.04)" }}>
                  {selectedEvent.steps.map((s, i) => {
                    const meta = STEP_META[s.type];
                    const done = i < currentStep;
                    const active = i === currentStep;
                    return (
                      <button key={s.id} onClick={() => { clearInterval(timerRef.current); setPlaying(false); setCurrentStep(i); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all hover:bg-white/[0.02]"
                        style={{ background: active ? meta?.bg : "transparent", borderLeft: active ? `2px solid ${meta?.color}` : "2px solid transparent" }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: done ? GREEN + "15" : active ? meta?.color + "18" : "rgba(255,255,255,0.03)", border: `1px solid ${done ? GREEN : active ? meta?.color : "rgba(255,255,255,0.06)"}40` }}>
                          {done
                            ? <CheckCircle2 className="w-3 h-3" style={{ color: GREEN }} />
                            : <span className="text-[8px] font-mono font-bold" style={{ color: active ? meta?.color : DIM }}>{i + 1}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold truncate" style={{ color: active ? TEXT : done ? "rgba(232,217,176,0.5)" : DIM }}>
                            {s.label}
                          </div>
                        </div>
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{ background: meta?.color + "10", color: meta?.color + "aa" }}>
                          {meta?.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
}