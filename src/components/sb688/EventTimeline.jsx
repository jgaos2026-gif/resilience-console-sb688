import React, { useState, useCallback, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { INDUSTRIES, SCENARIOS } from "@/lib/sb688Engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, RotateCcw, Activity, Info, Zap,
  Filter, ChevronDown, ChevronRight, Loader2, X, Clock, Database
} from "lucide-react";
import moment from "moment";

// ── Event type classifier ────────────────────────────────────────────────────
function classifyEvent(message) {
  const m = message.toLowerCase();
  if (/tamper|attack|compromised|suspicious|adversarial|isolated/.test(m))
    return "Emergency";
  if (/recovery|restored|checkpoint restored|smart recovery|recover|rollback/.test(m))
    return "Recovery";
  if (/short.circuit|bottleneck|breaker|blocked|quarantine/.test(m))
    return "ShortCircuit";
  if (/proof suite|verification|proof|passed|failed/.test(m))
    return "Proof";
  if (/degraded|failure|disruption|drift|reroute|alternate|incident|rerouting/.test(m))
    return "Alert";
  return "StateChange";
}

const EVENT_TYPES = ["All", "Emergency", "Recovery", "Alert", "ShortCircuit", "Proof", "StateChange"];

const TYPE_CONFIG = {
  Emergency:   { label: "Emergency",     color: "text-red-400",     bg: "bg-red-500/10 border-red-500/30",     dot: "bg-red-400",     icon: AlertTriangle },
  Recovery:    { label: "Recovery",      color: "text-teal-400",    bg: "bg-teal-500/10 border-teal-500/30",   dot: "bg-teal-400",    icon: RotateCcw },
  Alert:       { label: "Alert",         color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/30", dot: "bg-amber-400",   icon: Zap },
  ShortCircuit:{ label: "Short-Circuit", color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/30",dot:"bg-orange-400",  icon: Activity },
  Proof:       { label: "Proof",         color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/30",   dot: "bg-blue-400",    icon: Database },
  StateChange: { label: "State Change",  color: "text-primary",     bg: "bg-primary/10 border-primary/30",     dot: "bg-primary",     icon: Info },
};

// ── Anomaly Detail Panel ──────────────────────────────────────────────────────
function AnomalyDetail({ event, state, onClose }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    const industry = INDUSTRIES[state.industry];
    const scenario = state.scenario ? SCENARIOS[state.scenario] : null;
    const prompt = `You are the SB688 Anomaly Analyst. Explain why the following system event triggered a short-circuit or alert in plain English for a technical operator.

Event: "${event.message}"
Event Type: ${event.type}
Timestamp: ${moment(event.timestamp).format("YYYY-MM-DD HH:mm:ss")}
Industry Context: ${industry.title}
Active Scenario: ${scenario ? scenario.title + " — " + scenario.description : "None"}
System Operational State: ${state.operationalState}
Resilience Score at time: ${state.resilienceScore}%

Explain in 3-4 sentences:
1. What triggered this event
2. Why the short-circuit or containment action was the correct response
3. What the operator should verify next

Be precise, plain-English, and actionable. No bullet points — flowing prose.`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    setAnalysis(result);
    setLoading(false);
  }, [event, state]);

  const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG.StateChange;
  const Icon = cfg.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg space-y-5 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
              <Icon className={`w-4 h-4 ${cfg.color}`} />
            </div>
            <div>
              <Badge className={`text-[10px] border mb-1 ${cfg.bg} ${cfg.color}`}>{cfg.label}</Badge>
              <p className="text-sm font-semibold text-foreground leading-snug">{event.message}</p>
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {moment(event.timestamp).format("MMM D, YYYY — HH:mm:ss")}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground mt-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!analysis && !loading && (
          <Button onClick={runAnalysis} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs">
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            Run Anomaly Analysis
          </Button>
        )}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-lg bg-secondary/50">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            Analysing event context via AI...
          </div>
        )}
        {analysis && !loading && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-foreground/80 leading-relaxed">
              {analysis}
            </div>
            <Button onClick={runAnalysis} size="sm" variant="outline" className="w-full border-border text-muted-foreground text-xs">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Re-analyse
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Checkpoint Jump Row ───────────────────────────────────────────────────────
function CheckpointRow({ record, onJump }) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/40 border border-border/40 text-xs group hover:border-primary/30 transition-all">
      <Database className="w-3.5 h-3.5 text-primary flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-foreground/80 truncate">{record.message}</p>
        <p className="text-[10px] text-muted-foreground font-mono">v{record.version} · {record.hash} · {moment(record.timestamp).fromNow()}</p>
      </div>
      <Button onClick={() => onJump(record)} size="sm" variant="ghost"
        className="h-6 px-2 text-[10px] text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity">
        Jump
      </Button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function EventTimeline({ state, onCheckpointJump }) {
  const [filter, setFilter] = useState("All");
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [anomalyEvent, setAnomalyEvent] = useState(null);
  const [showCheckpoints, setShowCheckpoints] = useState(false);

  // Enrich events with type
  const enrichedEvents = useMemo(() =>
    state.eventLog.map((e, i) => ({
      ...e,
      type: classifyEvent(e.message),
      idx: i,
    })), [state.eventLog]);

  const filtered = useMemo(() =>
    filter === "All" ? enrichedEvents : enrichedEvents.filter((e) => e.type === filter),
    [enrichedEvents, filter]);

  const counts = useMemo(() => {
    const c = {};
    EVENT_TYPES.forEach((t) => {
      c[t] = t === "All" ? enrichedEvents.length : enrichedEvents.filter((e) => e.type === t).length;
    });
    return c;
  }, [enrichedEvents]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Event Timeline</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Live log of state transitions, recovery actions, and system alerts.</p>
        </div>
        <Button
          onClick={() => setShowCheckpoints((v) => !v)}
          size="sm"
          variant="outline"
          className="border-border text-foreground text-xs"
        >
          <Database className="w-3.5 h-3.5 mr-1.5" />
          Checkpoints
          {showCheckpoints ? <ChevronDown className="w-3 h-3 ml-1" /> : <ChevronRight className="w-3 h-3 ml-1" />}
        </Button>
      </div>

      {/* Checkpoint drawer */}
      {showCheckpoints && (
        <div className="bg-card border border-primary/20 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
            Trusted Checkpoints — Jump to Historical State
          </p>
          {state.trustedRecords.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No checkpoints recorded yet.</p>
          )}
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {state.trustedRecords.map((rec, i) => (
              <CheckpointRow key={i} record={rec} onJump={onCheckpointJump} />
            ))}
          </div>
        </div>
      )}

      {/* Filter pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        {EVENT_TYPES.map((t) => {
          const cfg = t === "All" ? null : TYPE_CONFIG[t];
          const isActive = filter === t;
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                isActive
                  ? cfg ? `${cfg.bg} ${cfg.color}` : "bg-primary/10 text-primary border-primary/30"
                  : "bg-secondary/40 text-muted-foreground border-border/40 hover:border-border"
              }`}
            >
              {t !== "All" && cfg && (
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              )}
              {t === "All" ? `All (${counts.All})` : `${cfg.label} (${counts[t]})`}
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="relative space-y-0">
        {/* Vertical line */}
        <div className="absolute left-[18px] top-4 bottom-4 w-px bg-border/40" />

        {filtered.length === 0 && (
          <div className="pl-10 text-xs text-muted-foreground italic py-6">No events match this filter.</div>
        )}

        {filtered.map((event, i) => {
          const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG.StateChange;
          const Icon = cfg.icon;
          const isExpanded = expandedIdx === event.idx;
          const canAnalyse = ["Emergency", "ShortCircuit", "Alert"].includes(event.type);

          return (
            <div key={event.idx} className="flex items-start gap-4 py-2 group relative">
              {/* Dot */}
              <div className={`w-9 h-9 rounded-full border flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                isExpanded ? cfg.bg : "bg-card border-border/50 group-hover:border-border"
              }`}>
                <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-2 border-b border-border/20 last:border-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`text-[9px] px-1.5 py-0 border ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {moment(event.timestamp).fromNow()} · {moment(event.timestamp).format("HH:mm:ss")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/85 mt-1 leading-snug">{event.message}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {canAnalyse && (
                      <Button
                        onClick={() => setAnomalyEvent(event)}
                        size="sm"
                        className="h-6 px-2 text-[10px] bg-blue-600/20 text-blue-400 border border-blue-500/20 hover:bg-blue-600/30"
                      >
                        <Zap className="w-3 h-3 mr-1" /> Analyse
                      </Button>
                    )}
                    <button
                      onClick={() => setExpandedIdx(isExpanded ? null : event.idx)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-2 p-3 rounded-lg bg-secondary/40 border border-border/40 text-[11px] text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground/50">Type:</span>
                      <span className={cfg.color}>{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground/50">Timestamp:</span>
                      <span className="font-mono">{moment(event.timestamp).format("YYYY-MM-DD HH:mm:ss.SSS")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground/50">Relative:</span>
                      <span>{moment(event.timestamp).fromNow()}</span>
                    </div>
                    {canAnalyse && (
                      <Button
                        onClick={() => setAnomalyEvent(event)}
                        size="sm"
                        className="mt-1 h-6 px-2 text-[10px] bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Zap className="w-3 h-3 mr-1" /> Run Anomaly Detail
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Anomaly Detail Modal */}
      {anomalyEvent && (
        <AnomalyDetail
          event={anomalyEvent}
          state={state}
          onClose={() => setAnomalyEvent(null)}
        />
      )}
    </div>
  );
}