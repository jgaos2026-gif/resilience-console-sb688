import React, { useState, useCallback, useMemo } from "react";
import { generateResilienceReport } from "./ReportGenerator";
import { base44 } from "@/api/base44Client";
import { INDUSTRIES, SCENARIOS } from "@/lib/sb688Engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, Activity, Zap, AlertTriangle, CheckCircle2,
  XCircle, Clock, Loader2, RefreshCw, GitBranch, Eye, Database, FileDown
} from "lucide-react";

// ── Derived metrics from state ───────────────────────────────────────────────
function deriveMetrics(state) {
  const componentKeys = Object.keys(state.components);
  const healthyCount = componentKeys.filter(k => state.components[k].status === "healthy").length;
  const degradedCount = componentKeys.filter(k => state.components[k].status === "degraded").length;
  const isolatedCount = componentKeys.filter(k => state.components[k].status === "isolated").length;
  const total = componentKeys.length;

  // Bottleneck Monitor: flag if route time is high or alternate path is active
  const bottleneckTriggered = state.routeType === "alternate" || state.routeTime > 20;
  const bottleneckSeverity = state.routeTime > 40 ? "critical" : state.routeTime > 20 ? "degraded" : "nominal";

  // Short-Circuit Breaker: active if any component is isolated
  const shortCircuitActive = isolatedCount > 0;
  const shortCircuitTrips = isolatedCount;

  // Proof Suite
  const proofPassCount = state.proofResults.filter(p => p.pass).length;
  const proofTotal = state.proofResults.length;
  const proofScore = proofTotal > 0 ? Math.round((proofPassCount / proofTotal) * 100) : null;

  // Off-path pending tasks
  const pendingTasks = [];
  if (degradedCount > 0) pendingTasks.push({ id: "braid", label: "Braid Repair Analysis", desc: `${degradedCount} degraded component(s) need braid integrity analysis`, severity: "high" });
  if (state.problemSimulated && !state.recoveryRun) pendingTasks.push({ id: "sanity", label: "Post-Incident Sanity Scan", desc: "Incident occurred — sanity scan not yet run", severity: "high" });
  if (!state.proofRun && state.scenarioLoaded) pendingTasks.push({ id: "proof", label: "Proof Suite Pending", desc: "Scenario loaded but proof suite has not been run", severity: "medium" });
  if (state.routeType === "alternate") pendingTasks.push({ id: "route", label: "Primary Route Re-evaluation", desc: "System is on alternate route — primary path needs re-validation", severity: "medium" });
  if (state.trustedRecordVersion > 3) pendingTasks.push({ id: "audit", label: "Trust Chain Audit", desc: `${state.trustedRecordVersion} record versions accumulated — full audit recommended`, severity: "low" });

  // Overall stability score (weighted)
  const componentScore = Math.round((healthyCount / total) * 40);
  const resilienceScore = Math.round((state.resilienceScore / 100) * 30);
  const continuityScore = Math.round((state.continuityScore / 100) * 20);
  const proofContrib = proofTotal > 0 ? Math.round((proofPassCount / proofTotal) * 10) : 10;
  const stabilityScore = componentScore + resilienceScore + continuityScore + proofContrib;

  return {
    stabilityScore,
    healthyCount, degradedCount, isolatedCount, total,
    bottleneckTriggered, bottleneckSeverity,
    shortCircuitActive, shortCircuitTrips,
    proofScore, proofPassCount, proofTotal,
    pendingTasks,
  };
}

// ── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, label, size = 80 }) {
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score));
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 80 ? "#2dd4bf" : pct >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
          fill={color} fontSize={size < 70 ? 13 : 16} fontWeight="700"
          className="rotate-90" style={{ transform: `rotate(90deg) translate(0px, -${size}px)` }}>
        </text>
      </svg>
      {/* score overlay using div */}
      <div style={{ marginTop: -size - 4, height: size, width: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color, fontSize: size < 70 ? 14 : 18, fontWeight: 700 }}>{pct}</span>
      </div>
      <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

// ── Monitor Card ─────────────────────────────────────────────────────────────
function MonitorCard({ title, icon: Icon, status, statusLabel, children, borderColor }) {
  return (
    <div className={`bg-card border rounded-xl p-4 space-y-3 transition-all ${borderColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground">{title}</span>
        </div>
        <Badge className={`text-[9px] border ${status}`}>{statusLabel}</Badge>
      </div>
      {children}
    </div>
  );
}

// ── Severity dot ─────────────────────────────────────────────────────────────
const SEVERITY = {
  high:   { dot: "bg-red-400",    text: "text-red-400",   label: "High" },
  medium: { dot: "bg-amber-400",  text: "text-amber-400", label: "Medium" },
  low:    { dot: "bg-blue-400",   text: "text-blue-400",  label: "Low" },
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ResilienceDashboard({ state }) {
  const [auditResult, setAuditResult] = useState(null);
  const [auditing, setAuditing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = useCallback(() => {
    setExporting(true);
    setTimeout(() => {
      generateResilienceReport(state);
      setExporting(false);
    }, 100);
  }, [state]);

  const m = useMemo(() => deriveMetrics(state), [state]);
  const industry = INDUSTRIES[state.industry];

  const runHealthAudit = useCallback(async () => {
    setAuditing(true);
    setAuditResult(null);
    const scenario = state.scenario ? SCENARIOS[state.scenario] : null;

    const prompt = `You are the SB688 Health Audit Engine performing a forced full-system re-scan.

System Snapshot:
- Industry: ${industry.title}
- Operational State: ${state.operationalState}
- Stability Score: ${m.stabilityScore}/100
- Resilience: ${state.resilienceScore}% | Continuity: ${state.continuityScore}%
- Components: ${m.healthyCount} healthy, ${m.degradedCount} degraded, ${m.isolatedCount} isolated
- Route: ${state.routeType} (${state.routeTime}ms)
- Bottleneck Monitor: ${m.bottleneckSeverity}
- Short-Circuit Breaker: ${m.shortCircuitActive ? `ACTIVE — ${m.shortCircuitTrips} trip(s)` : "Nominal"}
- Proof Suite: ${m.proofTotal > 0 ? `${m.proofPassCount}/${m.proofTotal} passed` : "Not run"}
- Active Scenario: ${scenario ? scenario.title : "None"}
- Pending Off-Path Tasks: ${m.pendingTasks.length > 0 ? m.pendingTasks.map(t => t.label).join(", ") : "None"}
- Trusted Record Version: v${state.trustedRecordVersion}

Perform a Health Audit. Output 3 sections in plain prose (no headers, no bullets):
1. Overall system health verdict (1 sentence)
2. The single most critical issue found, why it matters, and what to do about it (2 sentences)
3. What should be prioritized next across all pending off-path tasks (1-2 sentences)

Tone: direct, aerospace-grade, plain English.`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    setAuditResult(result);
    setAuditing(false);
  }, [state, m, industry]);

  const stableColor = m.stabilityScore >= 80 ? "text-teal-400" : m.stabilityScore >= 50 ? "text-amber-400" : "text-red-400";
  const stableBorder = m.stabilityScore >= 80 ? "border-teal-500/20" : m.stabilityScore >= 50 ? "border-amber-500/20" : "border-red-500/20";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Resilience Dashboard</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Live health aggregation — Bottleneck Monitor · Short-Circuit Breaker · Proof Suite</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportPDF}
            disabled={exporting}
            variant="outline"
            className="border-border text-foreground hover:bg-secondary text-xs font-semibold"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5 mr-1.5" />}
            Export PDF
          </Button>
          <Button
            onClick={runHealthAudit}
            disabled={auditing}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold"
          >
            {auditing ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
            Health Audit
          </Button>
        </div>
      </div>

      {/* Audit Result */}
      {(auditing || auditResult) && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Health Audit Result
          </p>
          {auditing ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> Running full system re-scan...
            </div>
          ) : (
            <p className="text-xs text-foreground/85 leading-relaxed">{auditResult}</p>
          )}
        </div>
      )}

      {/* Score Strip */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex flex-wrap items-center gap-8 justify-around">
          <ScoreRing score={m.stabilityScore} label="Stability" />
          <ScoreRing score={state.resilienceScore} label="Resilience" />
          <ScoreRing score={state.continuityScore} label="Continuity" />
          {m.proofScore !== null && <ScoreRing score={m.proofScore} label="Proof Suite" />}
          <div className="flex flex-col items-center gap-2">
            <div className={`text-3xl font-bold ${stableColor}`}>{state.operationalState}</div>
            <span className="text-[10px] text-muted-foreground">Operational State</span>
          </div>
        </div>
      </div>

      {/* Three monitors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bottleneck Monitor */}
        <MonitorCard
          title="Bottleneck Monitor"
          icon={Activity}
          status={m.bottleneckSeverity === "nominal" ? "bg-teal-500/10 text-teal-400 border-teal-500/30" : m.bottleneckSeverity === "degraded" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"}
          statusLabel={m.bottleneckSeverity === "nominal" ? "Nominal" : m.bottleneckSeverity === "degraded" ? "Degraded" : "Critical"}
          borderColor={m.bottleneckSeverity === "nominal" ? "border-border" : m.bottleneckSeverity === "degraded" ? "border-amber-500/20" : "border-red-500/20"}
        >
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Route Type</span>
              <span className={state.routeType === "primary" ? "text-teal-400 font-semibold" : "text-amber-400 font-semibold"}>
                {state.routeType === "primary" ? "Primary" : "Alternate"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Route Time</span>
              <span className={state.routeTime > 30 ? "text-red-400 font-semibold" : state.routeTime > 20 ? "text-amber-400 font-semibold" : "text-teal-400 font-semibold"}>
                {state.routeTime}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Path Pressure</span>
              <span className={m.bottleneckTriggered ? "text-amber-400" : "text-teal-400"}>
                {m.bottleneckTriggered ? "Elevated" : "Normal"}
              </span>
            </div>
          </div>
        </MonitorCard>

        {/* Short-Circuit Breaker */}
        <MonitorCard
          title="Short-Circuit Breaker"
          icon={Zap}
          status={m.shortCircuitActive ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-teal-500/10 text-teal-400 border-teal-500/30"}
          statusLabel={m.shortCircuitActive ? `${m.shortCircuitTrips} Trip(s) Active` : "No Trips"}
          borderColor={m.shortCircuitActive ? "border-red-500/20" : "border-border"}
        >
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Isolated</span>
              <span className={m.isolatedCount > 0 ? "text-red-400 font-semibold" : "text-teal-400 font-semibold"}>
                {m.isolatedCount} component(s)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Degraded</span>
              <span className={m.degradedCount > 0 ? "text-amber-400 font-semibold" : "text-teal-400 font-semibold"}>
                {m.degradedCount} component(s)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Healthy</span>
              <span className="text-teal-400 font-semibold">{m.healthyCount}/{m.total}</span>
            </div>
          </div>
        </MonitorCard>

        {/* Proof Suite */}
        <MonitorCard
          title="Proof Suite"
          icon={ShieldCheck}
          status={!state.proofRun ? "bg-secondary text-muted-foreground border-border" : m.proofScore === 100 ? "bg-teal-500/10 text-teal-400 border-teal-500/30" : m.proofScore >= 60 ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"}
          statusLabel={!state.proofRun ? "Not Run" : `${m.proofScore}%`}
          borderColor={!state.proofRun ? "border-border" : m.proofScore === 100 ? "border-teal-500/20" : "border-amber-500/20"}
        >
          <div className="space-y-1.5">
            {state.proofRun && state.proofResults.length > 0 ? (
              state.proofResults.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {p.pass
                    ? <CheckCircle2 className="w-3 h-3 text-teal-400 flex-shrink-0" />
                    : <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />}
                  <span className="text-muted-foreground truncate">{p.title}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic">Run Proof Suite in the Workspace tab.</p>
            )}
          </div>
        </MonitorCard>
      </div>

      {/* Off-path pending tasks */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Pending Off-Path Analysis Tasks
          </h3>
          <Badge className={`text-[10px] border ${m.pendingTasks.length > 0 ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-teal-500/10 text-teal-400 border-teal-500/30"}`}>
            {m.pendingTasks.length} pending
          </Badge>
        </div>
        {m.pendingTasks.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-teal-400 p-3 rounded-lg bg-teal-500/5 border border-teal-500/20">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            All off-path tasks are clear. No deferred analysis required.
          </div>
        ) : (
          <div className="space-y-2">
            {m.pendingTasks.map((task) => {
              const sev = SEVERITY[task.severity];
              return (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/40 border border-border/40">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${sev.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">{task.label}</span>
                      <span className={`text-[10px] font-semibold ${sev.text}`}>{sev.label}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{task.desc}</p>
                  </div>
                  {task.id === "braid" && <GitBranch className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0 mt-0.5" />}
                  {task.id === "sanity" && <Eye className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0 mt-0.5" />}
                  {task.id === "proof" && <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0 mt-0.5" />}
                  {task.id === "route" && <Activity className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0 mt-0.5" />}
                  {task.id === "audit" && <Database className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0 mt-0.5" />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Component health strip */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" /> Component Health — Live
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {Object.entries(state.components).map(([key, comp]) => {
            const label = industry.components[key]?.label || key;
            const color = comp.status === "healthy" ? "text-teal-400 border-teal-500/20 bg-teal-500/5"
              : comp.status === "degraded" ? "text-amber-400 border-amber-500/20 bg-amber-500/5"
              : "text-red-400 border-red-500/20 bg-red-500/5";
            return (
              <div key={key} className={`p-2.5 rounded-lg border text-center space-y-1 ${color}`}>
                <p className="text-[10px] font-semibold text-foreground/70 leading-tight">{label}</p>
                <p className="text-[10px] capitalize font-bold">{comp.status}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}