import React, { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Play, Pause, SkipBack, SkipForward, Camera, Trash2,
  Activity, Shield, Clock, Zap, CheckCircle2, AlertTriangle,
  Radio, TrendingUp, TrendingDown, Minus
} from "lucide-react";
import { INDUSTRIES } from "@/lib/sb688Engine";
import moment from "moment";

// ── Snapshot capture utility ──────────────────────────────────────────────────
export function captureSnapshot(state, label = "") {
  return {
    id: Date.now(),
    ts: Date.now(),
    label: label || state.operationalState,
    resilienceScore: state.resilienceScore,
    continuityScore: state.continuityScore,
    operationalState: state.operationalState,
    routeType: state.routeType,
    routeTime: state.routeTime,
    trustedRecordVersion: state.trustedRecordVersion,
    proofRun: state.proofRun,
    proofPassed: state.proofRun ? state.proofResults.filter(p => p.pass).length : null,
    proofTotal: state.proofRun ? state.proofResults.length : null,
    industry: state.industry,
    scenario: state.scenario,
    componentStatuses: Object.fromEntries(
      Object.entries(state.components).map(([k, v]) => [k, v.status])
    ),
    eventCount: state.eventLog.length,
    problemSimulated: state.problemSimulated,
    recoveryRun: state.recoveryRun,
  };
}

// ── Metric delta indicator ────────────────────────────────────────────────────
function Delta({ current, prev, suffix = "" }) {
  if (prev === undefined || prev === null) return null;
  const diff = current - prev;
  if (diff === 0) return <Minus className="w-3 h-3 text-muted-foreground/40 inline-block ml-1" />;
  if (diff > 0) return (
    <span className="text-teal-400 text-[9px] font-bold ml-1 inline-flex items-center gap-0.5">
      <TrendingUp className="w-3 h-3" />+{diff}{suffix}
    </span>
  );
  return (
    <span className="text-red-400 text-[9px] font-bold ml-1 inline-flex items-center gap-0.5">
      <TrendingDown className="w-3 h-3" />{diff}{suffix}
    </span>
  );
}

// ── Mini sparkline ────────────────────────────────────────────────────────────
function Sparkline({ data, color = "#C9A84C", height = 36, width = 120 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point dot */}
      {data.length > 0 && (() => {
        const last = data[data.length - 1];
        const x = width;
        const y = height - ((last - min) / range) * height;
        return <circle cx={x} cy={y} r={2.5} fill={color} />;
      })()}
    </svg>
  );
}

// ── Component status pill ─────────────────────────────────────────────────────
function StatusPill({ status }) {
  const cfg = {
    healthy:  { color: "text-teal-400",   bg: "bg-teal-500/10 border-teal-500/25",   dot: "bg-teal-400" },
    degraded: { color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/25", dot: "bg-amber-400" },
    isolated: { color: "text-red-400",    bg: "bg-red-500/10 border-red-500/25",     dot: "bg-red-400" },
  }[status] || { color: "text-muted-foreground", bg: "bg-secondary border-border", dot: "bg-muted-foreground" };

  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

// ── Snapshot card ─────────────────────────────────────────────────────────────
function SnapshotCard({ snap, prev, isActive, onClick }) {
  const industry = INDUSTRIES[snap.industry];
  const stateColor =
    snap.operationalState === "Nominal" ? "text-teal-400" :
    snap.operationalState.includes("Degraded") ? "text-amber-400" :
    "text-red-400";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-3 space-y-2 transition-all duration-200 ${
        isActive
          ? "border-primary/60 bg-primary/5 shadow-[0_0_12px_rgba(201,168,76,0.12)]"
          : "border-border bg-card hover:border-border/80 hover:bg-card/80"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isActive ? "bg-primary animate-pulse" : "bg-muted-foreground/30"}`} />
          <span className="text-[10px] font-bold text-muted-foreground font-mono">
            {moment(snap.ts).format("HH:mm:ss")}
          </span>
        </div>
        <Badge className={`text-[8px] border ${
          snap.problemSimulated && !snap.recoveryRun
            ? "bg-red-500/10 text-red-400 border-red-500/20"
            : snap.recoveryRun
            ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
            : "bg-secondary text-muted-foreground border-border"
        }`}>
          {snap.problemSimulated && !snap.recoveryRun ? "Incident" : snap.recoveryRun ? "Recovered" : "Baseline"}
        </Badge>
      </div>

      {/* Resilience */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">Resilience</span>
        <span className="text-sm font-bold font-mono text-primary">
          {snap.resilienceScore}%
          <Delta current={snap.resilienceScore} prev={prev?.resilienceScore} suffix="%" />
        </span>
      </div>

      {/* Continuity */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">Continuity</span>
        <span className="text-sm font-bold font-mono text-blue-400">
          {snap.continuityScore}%
          <Delta current={snap.continuityScore} prev={prev?.continuityScore} suffix="%" />
        </span>
      </div>

      {/* Route + state */}
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-semibold ${stateColor}`}>{snap.operationalState}</span>
        <Badge className="text-[8px] border bg-secondary text-muted-foreground border-border">
          {snap.routeType} · {snap.routeTime}ms
        </Badge>
      </div>

      {/* Proof */}
      {snap.proofRun && (
        <div className="flex items-center gap-1 text-[9px]">
          <CheckCircle2 className="w-3 h-3 text-teal-400" />
          <span className="text-teal-400 font-bold">{snap.proofPassed}/{snap.proofTotal} proofs</span>
        </div>
      )}
    </button>
  );
}

// ── Main Replay Panel ─────────────────────────────────────────────────────────
export default function BraidReplay({ state, snapshots, onClearSnapshots }) {
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1500);
  const playRef = useRef(null);

  // Auto-advance cursor during playback
  useEffect(() => {
    if (playing) {
      playRef.current = setInterval(() => {
        setCursor(c => {
          if (c >= snapshots.length - 1) {
            setPlaying(false);
            return c;
          }
          return c + 1;
        });
      }, playSpeed);
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [playing, playSpeed, snapshots.length]);

  // Stop playback if snapshots empty
  useEffect(() => {
    if (snapshots.length === 0) { setPlaying(false); setCursor(0); }
  }, [snapshots.length]);

  // Sync cursor to latest when new snap added (unless playing or scrubbing)
  useEffect(() => {
    if (!playing) setCursor(Math.max(0, snapshots.length - 1));
  }, [snapshots.length]);

  const activeSnap = snapshots[cursor];
  const prevSnap = cursor > 0 ? snapshots[cursor - 1] : null;

  // Build sparkline data from all snapshots
  const resilienceData = snapshots.map(s => s.resilienceScore);
  const continuityData = snapshots.map(s => s.continuityScore);
  const routeData = snapshots.map(s => s.routeTime);

  const handleSlider = useCallback((e) => {
    setPlaying(false);
    setCursor(Number(e.target.value));
  }, []);

  if (snapshots.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center space-y-3">
        <Camera className="w-10 h-10 text-muted-foreground/20 mx-auto" />
        <h3 className="text-sm font-bold text-foreground">Braid Replay</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Snapshots are captured automatically when you simulate problems, run recovery, or run the proof suite.
          Run a simulation in the <strong>Workspace</strong> tab to start capturing replay data.
        </p>
        <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/50">
          <Activity className="w-3 h-3" /> Auto-captures on every state change
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Braid Replay
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Scrub through {snapshots.length} captured state snapshot{snapshots.length !== 1 ? "s" : ""} to review how metrics evolved during simulation events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="text-[9px] border bg-primary/10 text-primary border-primary/30">
            <Camera className="w-2.5 h-2.5 mr-1" />
            {snapshots.length} Snapshot{snapshots.length !== 1 ? "s" : ""}
          </Badge>
          {onClearSnapshots && (
            <Button onClick={onClearSnapshots} size="sm" variant="outline"
              className="text-[10px] h-7 px-2.5 border-border text-muted-foreground hover:text-red-400 hover:border-red-500/30">
              <Trash2 className="w-3 h-3 mr-1" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Scrubber + controls */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        {/* Timeline label */}
        <div className="flex items-center justify-between text-[9px] text-muted-foreground font-mono">
          <span>{snapshots[0] ? moment(snapshots[0].ts).format("HH:mm:ss") : ""}</span>
          <span className="text-primary font-bold">
            {activeSnap ? moment(activeSnap.ts).format("HH:mm:ss") : ""} · #{cursor + 1} of {snapshots.length}
          </span>
          <span>{snapshots[snapshots.length - 1] ? moment(snapshots[snapshots.length - 1].ts).format("HH:mm:ss") : ""}</span>
        </div>

        {/* Slider */}
        <div className="relative">
          {/* Colored track segments */}
          <div className="w-full h-2 rounded-full overflow-hidden flex" style={{ background: "rgba(255,255,255,0.05)" }}>
            {snapshots.map((s, i) => (
              <div key={s.id} className="flex-1 h-full"
                style={{
                  background: s.problemSimulated && !s.recoveryRun
                    ? "rgba(239,68,68,0.4)"
                    : s.recoveryRun
                    ? "rgba(34,197,94,0.35)"
                    : "rgba(201,168,76,0.25)",
                  borderRight: i < snapshots.length - 1 ? "1px solid rgba(0,0,0,0.3)" : "none",
                }}
              />
            ))}
          </div>
          {/* Cursor needle */}
          <input
            type="range"
            min={0}
            max={Math.max(0, snapshots.length - 1)}
            value={cursor}
            onChange={handleSlider}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
            style={{ height: 8 }}
          />
          {/* Visual needle */}
          <div
            className="absolute top-0 h-2 w-0.5 bg-primary rounded-full shadow-[0_0_6px_rgba(201,168,76,0.8)] pointer-events-none"
            style={{ left: `calc(${snapshots.length <= 1 ? 0 : (cursor / (snapshots.length - 1)) * 100}% - 1px)` }}
          />
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-border"
              onClick={() => { setPlaying(false); setCursor(0); }}>
              <SkipBack className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-border"
              onClick={() => { setPlaying(false); setCursor(c => Math.max(0, c - 1)); }}>
              <SkipBack className="w-3 h-3 scale-x-[-1]" />
            </Button>
            <Button size="sm"
              className="h-7 px-3 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30"
              onClick={() => setPlaying(p => !p)}>
              {playing ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
              {playing ? "Pause" : "Play"}
            </Button>
            <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-border"
              onClick={() => { setPlaying(false); setCursor(c => Math.min(snapshots.length - 1, c + 1)); }}>
              <SkipForward className="w-3 h-3 scale-x-[-1]" />
            </Button>
            <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-border"
              onClick={() => { setPlaying(false); setCursor(snapshots.length - 1); }}>
              <SkipForward className="w-3 h-3" />
            </Button>
          </div>

          {/* Speed */}
          <div className="flex items-center gap-1 ml-2">
            <span className="text-[9px] text-muted-foreground">Speed:</span>
            {[{ label: "0.5×", ms: 3000 }, { label: "1×", ms: 1500 }, { label: "2×", ms: 750 }].map(s => (
              <button key={s.ms} onClick={() => setPlaySpeed(s.ms)}
                className={`text-[9px] px-2 py-0.5 rounded border font-bold transition-all ${
                  playSpeed === s.ms
                    ? "bg-primary/15 text-primary border-primary/35"
                    : "text-muted-foreground border-border hover:text-foreground"
                }`}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Phase legend */}
          <div className="flex items-center gap-3 ml-auto text-[9px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: "rgba(201,168,76,0.4)" }} />Baseline</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: "rgba(239,68,68,0.4)" }} />Incident</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: "rgba(34,197,94,0.35)" }} />Recovered</span>
          </div>
        </div>
      </div>

      {/* Active snapshot detail */}
      {activeSnap && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Left — key metrics */}
          <div className="xl:col-span-1 space-y-4">
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Snapshot Detail</h3>
                <span className="text-[9px] font-mono text-muted-foreground">{moment(activeSnap.ts).format("HH:mm:ss.SSS")}</span>
              </div>

              {[
                { label: "Resilience Score",   value: `${activeSnap.resilienceScore}%`,  prevVal: prevSnap?.resilienceScore,  color: "text-primary", suffix: "%" },
                { label: "Continuity Score",   value: `${activeSnap.continuityScore}%`,  prevVal: prevSnap?.continuityScore,  color: "text-blue-400", suffix: "%" },
                { label: "Route Time",         value: `${activeSnap.routeTime}ms`,        prevVal: prevSnap?.routeTime,        color: "text-foreground", suffix: "ms" },
                { label: "Trusted Record",     value: `v${activeSnap.trustedRecordVersion}`, prevVal: null, color: "text-muted-foreground", suffix: "" },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0 text-xs">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className={`font-bold font-mono ${m.color}`}>
                    {m.value}
                    {m.prevVal !== undefined && m.prevVal !== null && (
                      <Delta current={parseInt(m.value)} prev={m.prevVal} suffix={m.suffix} />
                    )}
                  </span>
                </div>
              ))}

              <div className="flex items-center justify-between py-1.5 text-xs">
                <span className="text-muted-foreground">Operational State</span>
                <span className={`font-semibold ${
                  activeSnap.operationalState === "Nominal" ? "text-teal-400" :
                  activeSnap.operationalState.includes("Degraded") ? "text-amber-400" : "text-red-400"
                }`}>{activeSnap.operationalState}</span>
              </div>

              {activeSnap.proofRun && (
                <div className="flex items-center gap-2 p-2 rounded-lg border border-teal-500/20 bg-teal-500/5 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                  <span className="text-teal-400 font-bold">{activeSnap.proofPassed}/{activeSnap.proofTotal} proofs passed</span>
                </div>
              )}
            </div>

            {/* Component statuses */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Component States</h3>
              {Object.entries(activeSnap.componentStatuses).map(([key, status]) => (
                <div key={key} className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground capitalize">{key.replace("_", " ")}</span>
                  <StatusPill status={status} />
                </div>
              ))}
            </div>
          </div>

          {/* Center — sparklines */}
          <div className="xl:col-span-1 space-y-4">
            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Metric Trends</h3>

              {[
                { label: "Resilience %",  data: resilienceData,  color: "#C9A84C" },
                { label: "Continuity %",  data: continuityData,  color: "#3b82f6" },
                { label: "Route Time ms", data: routeData,        color: "#a78bfa" },
              ].map((chart, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">{chart.label}</span>
                    <span className="font-bold font-mono" style={{ color: chart.color }}>
                      {chart.data[cursor]}
                      {chart.label.includes("%") ? "%" : "ms"}
                    </span>
                  </div>
                  <div className="relative bg-black/20 rounded p-1.5">
                    <Sparkline data={chart.data} color={chart.color} width={240} height={38} />
                    {/* Cursor marker */}
                    {chart.data.length > 1 && (
                      <div className="absolute top-1.5 bottom-1.5 w-px bg-white/25 pointer-events-none"
                        style={{ left: `calc(${(cursor / (chart.data.length - 1)) * 100}%)` }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — snapshot list */}
          <div className="xl:col-span-1">
            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">All Snapshots</h3>
                <span className="text-[9px] text-muted-foreground">{snapshots.length} total</span>
              </div>
              <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                {[...snapshots].reverse().map((snap, i) => {
                  const realIdx = snapshots.length - 1 - i;
                  const prevReal = realIdx > 0 ? snapshots[realIdx - 1] : null;
                  return (
                    <SnapshotCard
                      key={snap.id}
                      snap={snap}
                      prev={prevReal}
                      isActive={realIdx === cursor}
                      onClick={() => { setPlaying(false); setCursor(realIdx); }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Summary bar */}
      {snapshots.length >= 2 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              {
                label: "Peak Resilience",
                value: `${Math.max(...snapshots.map(s => s.resilienceScore))}%`,
                color: "text-teal-400",
              },
              {
                label: "Lowest Resilience",
                value: `${Math.min(...snapshots.map(s => s.resilienceScore))}%`,
                color: "text-red-400",
              },
              {
                label: "Incidents Captured",
                value: snapshots.filter(s => s.problemSimulated && !s.recoveryRun).length,
                color: "text-amber-400",
              },
              {
                label: "Recovery Events",
                value: snapshots.filter(s => s.recoveryRun).length,
                color: "text-primary",
              },
            ].map((stat, i) => (
              <div key={i}>
                <div className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}