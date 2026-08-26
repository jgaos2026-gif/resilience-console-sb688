import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain, TrendingUp, Shield, BookOpen, Loader2, ArrowRight, Zap, Clock, RefreshCw, ChevronDown, ChevronUp
} from "lucide-react";
import { INDUSTRIES } from "@/lib/sb688Engine";

// ── Risk color helpers ────────────────────────────────────────────────────────
const RISK_STYLE = {
  critical: { badge: "bg-red-500/10 text-red-400 border-red-500/30", bar: "#ef4444" },
  high:     { badge: "bg-amber-500/10 text-amber-400 border-amber-500/30", bar: "#f59e0b" },
  medium:   { badge: "bg-blue-500/10 text-blue-400 border-blue-500/30", bar: "#3b82f6" },
  low:      { badge: "bg-teal-500/10 text-teal-400 border-teal-500/30", bar: "#2dd4bf" },
};

function RiskBadge({ level }) {
  const s = RISK_STYLE[level] || RISK_STYLE.medium;
  return (
    <Badge className={`text-[9px] border font-bold uppercase ${s.badge}`}>{level}</Badge>
  );
}

function RiskBar({ pct, level }) {
  const s = RISK_STYLE[level] || RISK_STYLE.medium;
  return (
    <div className="w-full h-1.5 rounded-full bg-secondary/60 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: s.bar, boxShadow: `0 0 6px ${s.bar}60` }} />
    </div>
  );
}

// ── Collapsible section ───────────────────────────────────────────────────────
function Section({ title, icon: SectionIcon, color = "text-primary", children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button className="w-full flex items-center justify-between px-5 py-3.5 text-left"
        onClick={() => setOpen(v => !v)}>
        <div className="flex items-center gap-2">
          <SectionIcon className={`w-4 h-4 ${color}`} />
          <span className={`text-sm font-bold ${color}`}>{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-3 border-t border-border/40">{children}</div>}
    </div>
  );
}

// ── Forecast card ─────────────────────────────────────────────────────────────
function ForecastCard({ item, i }) {
  return (
    <div className="rounded-xl border p-4 space-y-2"
      style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-muted-foreground/50">#{i + 1}</span>
          <span className="text-xs font-bold text-foreground">{item.component}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <RiskBadge level={item.risk} />
          <span className="text-[10px] font-mono text-muted-foreground">{item.probability}%</span>
        </div>
      </div>
      <RiskBar pct={item.probability} level={item.risk} />
      <p className="text-[11px] text-muted-foreground leading-relaxed">{item.forecast}</p>
      <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "#f59e0b" }}>
        <Clock className="w-3 h-3" /> Est. window: {item.timeWindow}
      </div>
    </div>
  );
}

// ── Mitigation card ───────────────────────────────────────────────────────────
function MitigationCard({ item, i }) {
  return (
    <div className="rounded-xl border p-4 space-y-2 border-blue-500/15 bg-blue-500/3">
      <div className="flex items-start gap-2">
        <span className="text-xs font-bold text-blue-400 flex-shrink-0">{i + 1}.</span>
        <div className="space-y-1">
          <div className="text-xs font-bold text-foreground">{item.action}</div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{item.rationale}</p>
          <div className="flex gap-2 flex-wrap pt-0.5">
            <Badge className="text-[9px] border bg-blue-500/10 text-blue-400 border-blue-500/25">
              {item.effort} effort
            </Badge>
            <Badge className="text-[9px] border bg-teal-500/10 text-teal-400 border-teal-500/25">
              {item.impact} impact
            </Badge>
            {item.priority === "immediate" && (
              <Badge className="text-[9px] border bg-red-500/10 text-red-400 border-red-500/25">
                Immediate
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Playbook step ─────────────────────────────────────────────────────────────
function PlaybookStep({ step, i }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/30 last:border-0">
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
        style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.25)" }}>
        {i + 1}
      </div>
      <div className="space-y-0.5 flex-1">
        <div className="text-xs font-bold text-foreground">{step.action}</div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{step.detail}</p>
        <div className="flex items-center gap-2 pt-0.5">
          <Badge className="text-[9px] border bg-secondary text-muted-foreground border-border">
            {step.owner}
          </Badge>
          <span className="text-[9px] text-muted-foreground/50">{step.duration}</span>
        </div>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0 mt-1" />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PredictiveIntelligenceTab({ state }) {
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(null); // "forecast"|"mitigation"|"playbook"
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const industry = INDUSTRIES[state.industry];

  const buildPrompt = useCallback(() => {
    const componentHealth = (state.components || []).map(c => `${c.id}: ${c.status}`).join(", ");
    const recentEvents = (state.eventLog || []).slice(0, 5).map(e => e.message).join("; ");

    return `You are an elite resilience intelligence engine analyzing the SB688 platform for the ${industry.title} sector.

LIVE TELEMETRY SNAPSHOT:
- Industry: ${industry.title}
- Operational State: ${state.operationalState}
- Resilience Score: ${state.resilienceScore}%
- Route Type: ${state.routeType}
- Trusted Record Version: v${state.trustedRecordVersion}
- Proof Suite Run: ${state.proofRun ? `Yes — ${(state.proofResults || []).filter(p => p.pass).length}/${(state.proofResults || []).length} passed` : "Not run"}
- Component Health: ${componentHealth || "All nominal"}
- Recent Events: ${recentEvents || "None"}
- Active Scenario: ${state.scenario}

Generate a full predictive intelligence report with EXACTLY this JSON structure:
{
  "forecasts": [
    {
      "component": "component name",
      "risk": "critical|high|medium|low",
      "probability": 0-100,
      "forecast": "specific prediction based on telemetry",
      "timeWindow": "e.g. 2-4 hours, 24-48 hours"
    }
  ],
  "mitigations": [
    {
      "action": "specific action title",
      "rationale": "why this addresses the vulnerability",
      "effort": "low|medium|high",
      "impact": "low|medium|high",
      "priority": "immediate|short-term|planned"
    }
  ],
  "playbook": {
    "title": "Incident Response Playbook title",
    "scenario": "brief scenario description",
    "steps": [
      {
        "action": "step title",
        "detail": "specific instructions",
        "owner": "role responsible e.g. SRE, Incident Commander",
        "duration": "e.g. 0-5 min"
      }
    ]
  },
  "summary": "2-sentence executive summary of overall risk posture"
}

Generate 4 forecasts, 5 mitigations, and 6-8 playbook steps. Be specific to the ${industry.title} industry and the actual telemetry values above. Return only valid JSON.`;
  }, [state, industry]);

  const runAnalysis = useCallback(async (section) => {
    setLoading(true);
    setActiveSection(section);
    setError(null);
    setResults(null);

    const prompt = buildPrompt();
    const schema = {
      type: "object",
      properties: {
        forecasts: { type: "array" },
        mitigations: { type: "array" },
        playbook: { type: "object" },
        summary: { type: "string" },
      },
    };

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema,
    });

    setResults(result);
    setLoading(false);
  }, [buildPrompt]);

  const runAll = useCallback(() => runAnalysis("all"), [runAnalysis]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Predictive Intelligence Engine
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl leading-relaxed">
            AI-driven failure forecasting, proactive mitigation strategies, and automated incident response playbooks — generated from live telemetry for the <strong className="text-foreground">{industry.title}</strong> sector.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="text-[10px] border bg-primary/10 text-primary border-primary/30">
            {industry.title}
          </Badge>
          <Badge className={`text-[10px] border ${state.resilienceScore > 70 ? "bg-teal-500/10 text-teal-400 border-teal-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"}`}>
            Resilience: {state.resilienceScore}%
          </Badge>
        </div>
      </div>

      {/* Telemetry snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Op State", value: state.operationalState, color: state.operationalState === "Healthy" ? "text-teal-400" : "text-amber-400" },
          { label: "Resilience", value: `${state.resilienceScore}%`, color: state.resilienceScore > 70 ? "text-teal-400" : "text-red-400" },
          { label: "Route", value: state.routeType, color: "text-blue-400" },
          { label: "Record", value: `v${state.trustedRecordVersion}`, color: "text-primary" },
        ].map((m, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-3 text-center">
            <div className={`text-base font-bold font-mono ${m.color}`}>{m.value}</div>
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={runAll} disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold">
          {loading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Brain className="w-3.5 h-3.5 mr-1.5" />}
          Run Full Intelligence Report
        </Button>
        {results && (
          <Button onClick={runAll} disabled={loading} variant="outline"
            className="border-border text-xs">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
          </Button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <div className="text-sm font-semibold text-foreground">Analyzing live telemetry…</div>
          <p className="text-xs text-muted-foreground text-center max-w-sm">
            Generating predictive failure forecasts, mitigation strategies, and incident response playbook for {industry.title}.
          </p>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div className="space-y-4">

          {/* Executive Summary */}
          {results.summary && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
              <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Executive Summary</div>
                <p className="text-sm text-foreground/85 leading-relaxed">{results.summary}</p>
              </div>
            </div>
          )}

          {/* Predictive Failure Forecasts */}
          {results.forecasts?.length > 0 && (
            <Section title="Predictive Failure Forecasts" icon={TrendingUp} color="text-amber-400" defaultOpen>
              <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.forecasts.map((item, i) => (
                  <ForecastCard key={i} item={item} i={i} />
                ))}
              </div>
            </Section>
          )}

          {/* Mitigation Strategies */}
          {results.mitigations?.length > 0 && (
            <Section title="Proactive Mitigation Strategies" icon={Shield} color="text-blue-400" defaultOpen>
              <div className="pt-3 space-y-2">
                {results.mitigations.map((item, i) => (
                  <MitigationCard key={i} item={item} i={i} />
                ))}
              </div>
            </Section>
          )}

          {/* Incident Response Playbook */}
          {results.playbook && (
            <Section title="Automated Incident Response Playbook" icon={BookOpen} color="text-primary" defaultOpen>
              <div className="pt-3 space-y-3">
                <div className="rounded-lg border border-primary/20 p-3 bg-primary/5">
                  <div className="text-xs font-bold text-primary">{results.playbook.title}</div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{results.playbook.scenario}</p>
                </div>
                <div className="space-y-0">
                  {(results.playbook.steps || []).map((step, i) => (
                    <PlaybookStep key={i} step={step} i={i} />
                  ))}
                </div>
              </div>
            </Section>
          )}

        </div>
      )}

      {/* Idle state */}
      {!results && !loading && (
        <div className="bg-secondary/30 border border-border rounded-xl p-8 text-center space-y-3">
          <Brain className="w-10 h-10 text-muted-foreground/20 mx-auto" />
          <div className="text-sm font-semibold text-muted-foreground">Predictive Intelligence Ready</div>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Click <strong>Run Full Intelligence Report</strong> to analyze live telemetry and generate failure forecasts, mitigation strategies, and a tailored incident response playbook for the {industry.title} sector.
          </p>
        </div>
      )}

      <div className="text-[10px] text-muted-foreground/40 leading-relaxed">
        Analysis generated from live telemetry snapshot. Results are AI-modeled forecasts — not certified operational guidance. Refresh after state changes for updated predictions.
      </div>
    </div>
  );
}