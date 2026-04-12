import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield, Zap, AlertTriangle, CheckCircle2, Clock, Loader2,
  ArrowRight, Lock, Database, Cpu, GitBranch, Activity,
  RotateCcw, Play, StopCircle, Eye
} from "lucide-react";

// ─── Hot Path vs Off-Path ───────────────────────────────────────────────────
const HOT_PATH_OPS = [
  { id: "append", label: "Append", icon: Zap, desc: "Write brick to spine" },
  { id: "verify", label: "Verify", icon: Shield, desc: "Hash check on append" },
  { id: "checkpoint", label: "Checkpoint Marker", icon: Database, desc: "Seal trusted state" },
  { id: "mount", label: "Mount / Unmount", icon: Cpu, desc: "State transition gating" },
];
const OFF_PATH_OPS = [
  { id: "braid", label: "Braid Analysis", icon: GitBranch, desc: "Graph-heavy, deferred" },
  { id: "sanity", label: "Sanity Scans", icon: Eye, desc: "Noncritical, async" },
  { id: "import", label: "Large Import Inspect", icon: Database, desc: "Staged, not live" },
  { id: "report", label: "Dashboard Aggregation", icon: Activity, desc: "Async read-only" },
];

// ─── Staging Pipeline ────────────────────────────────────────────────────────
const STAGING_STAGES = [
  { id: "ingest", label: "Ingest", color: "text-muted-foreground", bg: "bg-secondary/50 border-border/40" },
  { id: "stage", label: "Stage", color: "text-amber-400", bg: "bg-amber-500/5 border-amber-500/20" },
  { id: "validate", label: "Validate", color: "text-blue-400", bg: "bg-blue-500/5 border-blue-500/20" },
  { id: "approve", label: "Approve", color: "text-primary", bg: "bg-primary/5 border-primary/20" },
  { id: "activate", label: "Activate", color: "text-teal-400", bg: "bg-teal-500/5 border-teal-500/20" },
];

// ─── Recovery Node Status ────────────────────────────────────────────────────
const RECOVERY_ACTIONS = [
  "Corrupted runtime → reload from last trusted checkpoint",
  "Broken brick state → re-register only validated bricks",
  "Replay failure → reload from verified replay package",
  "Bad upgrade → rollback to pre-upgrade checkpoint",
  "Continuity fracture → restore spine from Merkle root",
];

// ─── Module Map ──────────────────────────────────────────────────────────────
const MODULE_MAP = [
  {
    layer: "Resilience",
    color: "text-primary border-primary/20 bg-primary/5",
    modules: ["Merkle Stitch Engine", "Sovereign AI Guardian", "Proof Suite", "Trusted Record Chain"],
  },
  {
    layer: "Continuity",
    color: "text-blue-400 border-blue-500/20 bg-blue-500/5",
    modules: ["Checkpoint Manager", "Approved Route Solver", "Emergency Recovery Node", "Replay Package Loader"],
  },
  {
    layer: "Operation",
    color: "text-teal-400 border-teal-500/20 bg-teal-500/5",
    modules: ["Hot Path Controller", "Staging Pipeline", "Brick Validator", "Mount/Unmount Gate"],
  },
  {
    layer: "Stability",
    color: "text-amber-400 border-amber-500/20 bg-amber-500/5",
    modules: ["Bottleneck Monitor", "Short-Circuit Breaker", "Loss Prevention Layer", "Sanity Scanner (async)"],
  },
];

// ─── Build Priority ───────────────────────────────────────────────────────────
const BUILD_PRIORITY = [
  { order: 1, name: "Stability", desc: "Hot path integrity, short-circuit prevention, fail-closed defaults", color: "text-amber-400" },
  { order: 2, name: "Continuity", desc: "Checkpoint sealing, recovery node readiness, replay package prep", color: "text-blue-400" },
  { order: 3, name: "Operation", desc: "Staging pipeline, import validation, brick registration flow", color: "text-teal-400" },
  { order: 4, name: "Resilience", desc: "Proof suite, Merkle stitch, sovereign guardian, braid analysis", color: "text-primary" },
  { order: 5, name: "Speed", desc: "Hot path optimization, async off-path delegation, cache tuning", color: "text-muted-foreground" },
];

// ─── Recovery Node Simulation ─────────────────────────────────────────────────
function RecoveryNodePanel() {
  const [status, setStatus] = useState("offline"); // offline | activating | live | restored
  const [log, setLog] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const addLog = (msg) => setLog((prev) => [{ msg, ts: Date.now() }, ...prev.slice(0, 9)]);

  const activateRecovery = useCallback(async () => {
    setIsRunning(true);
    setStatus("activating");
    addLog("Emergency Recovery Node: activation sequence initiated");
    await new Promise((r) => setTimeout(r, 600));
    addLog("Sanity checks running: trusted checkpoint integrity verified");
    await new Promise((r) => setTimeout(r, 600));
    addLog("Staging validated replay package — no direct live injection");
    await new Promise((r) => setTimeout(r, 600));
    addLog("Re-registering validated bricks only — unverified bricks quarantined");
    await new Promise((r) => setTimeout(r, 600));
    addLog("Merkle root cross-verified against Sovereign Guardian golden hash");
    await new Promise((r) => setTimeout(r, 600));
    addLog("Recovery node going live — all activation actions logged");
    setStatus("live");
    setIsRunning(false);
  }, []);

  const runRestore = useCallback(async () => {
    if (status !== "live") return;
    setIsRunning(true);
    addLog("Restore initiated: loading from last known clean checkpoint");
    await new Promise((r) => setTimeout(r, 500));
    addLog("Checkpoint v-RECOVERY loaded. Spine re-stitched.");
    await new Promise((r) => setTimeout(r, 400));
    addLog("Recovery complete. Node returning to standby.");
    setStatus("restored");
    setIsRunning(false);
  }, [status]);

  const standby = useCallback(() => {
    setStatus("offline");
    setLog([]);
    setAiReport(null);
  }, []);

  const getAIReport = useCallback(async () => {
    setIsLoadingAI(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are briefing a CTO on the Emergency Recovery Node architecture in the SB688 system.

The node is a documented, restricted standby recovery node that:
- Stays offline or tightly gated by default (not a hidden masternode — not a backdoor)
- Restores from trusted checkpoints sealed by the Merkle Stitch engine
- Reloads from verified replay packages only
- Re-registers only validated bricks — quarantines unverified ones
- Runs sanity checks before going live
- Logs every activation and recovery action for auditors

Current status: ${status}
Recent log: ${log.slice(0, 3).map(l => l.msg).join("; ")}

Write 3 sentences: why this design is stronger than a masternode, what the fail-closed guarantee means in practice, and what the CTO should tell their board about it. Plain English. No fluff.`
    });
    setAiReport(result);
    setIsLoadingAI(false);
  }, [status, log]);

  const statusConfig = {
    offline: { label: "Standby / Offline", color: "text-muted-foreground", border: "border-border", bg: "bg-secondary/50", dot: "bg-muted-foreground" },
    activating: { label: "Activating...", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/5", dot: "bg-amber-400 animate-pulse" },
    live: { label: "Live — Recovery Ready", color: "text-teal-400", border: "border-teal-500/30", bg: "bg-teal-500/5", dot: "bg-teal-400 animate-pulse" },
    restored: { label: "Restored — Returning to Standby", color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/5", dot: "bg-blue-400" },
  };
  const cfg = statusConfig[status];

  return (
    <div className={`bg-card border rounded-xl p-5 space-y-4 transition-all duration-500 ${cfg.border}`}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            Emergency Recovery Node
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">Documented standby — not a masternode, not a backdoor.</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${cfg.bg} ${cfg.border} ${cfg.color}`}>
          <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={activateRecovery} disabled={isRunning || status === "live" || status === "activating"} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs">
          <Play className="w-3.5 h-3.5 mr-1.5" /> Activate Node
        </Button>
        <Button onClick={runRestore} disabled={isRunning || status !== "live"} size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs">
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Run Restore
        </Button>
        <Button onClick={standby} disabled={isRunning} size="sm" variant="outline" className="border-border text-foreground text-xs">
          <StopCircle className="w-3.5 h-3.5 mr-1.5" /> Return to Standby
        </Button>
        <Button onClick={getAIReport} disabled={isLoadingAI || status === "offline"} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs ml-auto">
          {isLoadingAI ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Eye className="w-3.5 h-3.5 mr-1.5" />}
          AI Brief
        </Button>
      </div>

      {/* Recovery actions it handles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {RECOVERY_ACTIONS.map((a, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
            {a}
          </div>
        ))}
      </div>

      {/* Log */}
      {log.length > 0 && (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold">Activation Log</p>
          {log.map((entry, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px]">
              <span className="text-muted-foreground/40 font-mono flex-shrink-0">{new Date(entry.ts).toLocaleTimeString()}</span>
              <span className="text-foreground/70">{entry.msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* AI Report */}
      {aiReport && !isLoadingAI && (
        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs text-foreground/80 leading-relaxed">
          {aiReport}
        </div>
      )}
      {isLoadingAI && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" /> Generating CTO brief...
        </div>
      )}
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────
export default function RecoveryArchitectureTab() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-foreground">Recovery Architecture</h2>
        <p className="text-sm text-muted-foreground">Smooth-run engineering: hot path discipline, staging pipeline, fail-closed defaults, and a documented emergency recovery node.</p>
      </div>

      {/* Emergency Recovery Node */}
      <RecoveryNodePanel />

      {/* Hot Path vs Off-Path */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Hot Path — Critical Only
          </h3>
          <p className="text-xs text-muted-foreground">Only these four operations traverse the spine. Everything else is delegated off-path.</p>
          <div className="space-y-2">
            {HOT_PATH_OPS.map((op) => {
              const Icon = op.icon;
              return (
                <div key={op.id} className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/15">
                  <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{op.label}</p>
                    <p className="text-[10px] text-muted-foreground">{op.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" /> Off-Path — Deferred / Async
          </h3>
          <p className="text-xs text-muted-foreground">Heavy operations are pushed off the hot path. They run async, staged, or on-demand — never blocking live runtime.</p>
          <div className="space-y-2">
            {OFF_PATH_OPS.map((op) => {
              const Icon = op.icon;
              return (
                <div key={op.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/40">
                  <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{op.label}</p>
                    <p className="text-[10px] text-muted-foreground">{op.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Staging Pipeline */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-blue-400" /> Staging Pipeline — Nothing Uncertain Touches Live
        </h3>
        <p className="text-xs text-muted-foreground">Imports, bricks, braid repairs, and recovery plans all pass through staging before activation. Fail closed. Recover clean.</p>
        <div className="flex flex-wrap items-center gap-2">
          {STAGING_STAGES.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={`px-4 py-2.5 rounded-lg border text-xs font-semibold ${s.bg} ${s.color}`}>
                {s.label}
              </div>
              {i < STAGING_STAGES.length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {[
            { title: "Do not guess", desc: "When uncertain, fall back to safe degraded mode. Never auto-promote unvalidated state." },
            { title: "Do not auto-promote", desc: "No bypass of evidence. Explicit approval required before staging moves to activate." },
            { title: "Do not bypass evidence", desc: "Recovery never skips the proof chain. Merkle root must match before re-activation." },
          ].map((r, i) => (
            <div key={i} className="p-3 rounded-lg bg-red-500/5 border border-red-500/15 space-y-1">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <p className="text-xs font-semibold text-red-400">{r.title}</p>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Module Map */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" /> Module Map — Build Priority Order
        </h3>
        <p className="text-xs text-muted-foreground">Four layers. Build order: Stability → Continuity → Operation → Resilience → Speed.</p>
        <div className="space-y-3">
          {MODULE_MAP.map((layer, i) => {
            const priority = BUILD_PRIORITY[i];
            return (
              <div key={layer.layer} className={`p-4 rounded-xl border space-y-2 ${layer.color}`}>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${layer.color}`}>
                    {priority.order}. {layer.layer}
                  </span>
                  <p className="text-[10px] text-muted-foreground">{priority.desc}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {layer.modules.map((m) => (
                    <span key={m} className="text-[11px] px-2.5 py-1 rounded-md bg-background/50 border border-border/40 text-foreground/80 font-medium">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-primary">From Concept → Operating System Pattern</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: "Database Schema", desc: "Translate module map to entity tables: bricks, checkpoints, routes, recovery events, proof records." },
            { title: "Module Map", desc: "Wire each module to its controller: hot path controller, staging pipeline, checkpoint manager, recovery node." },
            { title: "Runtime Controller", desc: "Orchestrates hot path, mount/unmount transitions, off-path delegation, and live state." },
            { title: "Recovery Controller", desc: "Manages the emergency node lifecycle: activation, restore, standby, audit log — one clean authority." },
          ].map((step, i) => (
            <div key={i} className="p-3 rounded-lg bg-card border border-border space-y-1.5">
              <p className="text-xs font-bold text-foreground">{step.title}</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}