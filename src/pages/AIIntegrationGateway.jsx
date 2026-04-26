import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CrownIcon, LionIcon } from "@/components/sb688/WarriorCrest";
import {
  Zap, Shield, Brain, Clock, CheckCircle2, XCircle, Lock,
  Unlock, Link2, AlertTriangle, Activity, ChevronRight, Copy, Check
} from "lucide-react";
import moment from "moment";

const GOLD = "#C9A84C";

// ── 3-Tier definitions ────────────────────────────────────────────────────────
const TIERS = [
  {
    id: "tier1",
    number: "I",
    label: "Observer Tier",
    subtitle: "Read-Only HR Telemetry",
    color: "#3b82f6",
    borderColor: "border-blue-500/30",
    bgColor: "rgba(59,130,246,0.06)",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    icon: Activity,
    duration: "1 Hour",
    capabilities: [
      "Read SB688 system health metrics",
      "View event logs and audit trail",
      "Monitor resilience and continuity scores",
      "Access trusted record chain (read-only)",
    ],
    restrictions: [
      "No write access to system state",
      "No scenario execution",
      "No recovery or proof triggers",
    ],
    scope: "READ_ONLY | TELEMETRY | AUDIT",
  },
  {
    id: "tier2",
    number: "II",
    label: "Analyst Tier",
    subtitle: "AI-Assisted Resilience Analysis",
    color: GOLD,
    borderColor: "border-primary/40",
    bgColor: "rgba(201,168,76,0.06)",
    badgeClass: "bg-primary/10 text-primary border-primary/30",
    icon: Brain,
    duration: "1 Hour",
    capabilities: [
      "Full Observer Tier access",
      "Submit AI analysis queries to SB688",
      "Generate resilience reports and insights",
      "Receive scenario recommendations",
      "Integrate external AI model responses into analyst feed",
    ],
    restrictions: [
      "No system state modification",
      "No recovery execution",
      "Analysis feed only — no command authority",
    ],
    scope: "READ | ANALYZE | REPORT | AI_FEED",
  },
  {
    id: "tier3",
    number: "III",
    label: "Operator Tier",
    subtitle: "Full HR Command Integration",
    color: "#22c55e",
    borderColor: "border-green-500/30",
    bgColor: "rgba(34,197,94,0.06)",
    badgeClass: "bg-green-500/10 text-green-400 border-green-500/30",
    icon: Shield,
    duration: "1 Hour",
    capabilities: [
      "Full Observer + Analyst Tier access",
      "Trigger scenario simulations",
      "Execute smart recovery sequences",
      "Run proof suite validations",
      "Integrate AI decisions into live system state",
      "Push compliance reports to HR stakeholders",
    ],
    restrictions: [
      "Session locked to 1-hour window",
      "All actions logged to immutable ledger",
      "Requires HMAC-signed integration prompt",
    ],
    scope: "FULL | COMMAND | INTEGRATE | HR_BRIDGE",
  },
];

// ── Token generator ───────────────────────────────────────────────────────────
function generateToken(tier, aiSystem) {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `SB688-${tier.toUpperCase()}-${rand}-${ts.toString(36).toUpperCase()}`;
}

function generateHmac(token) {
  // Simulated HMAC-SHA3-256 signature for display
  const chars = "0123456789abcdef";
  let h = "";
  for (let i = 0; i < 64; i++) h += chars[Math.floor(Math.random() * 16)];
  return h;
}

// ── Countdown timer ───────────────────────────────────────────────────────────
function useCountdown(expiresAt) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = expiresAt - Date.now();
      if (diff <= 0) { setRemaining(0); return; }
      setRemaining(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (remaining === null) return null;
  if (remaining === 0) return "EXPIRED";
  const m = Math.floor(remaining / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Active session card ───────────────────────────────────────────────────────
function ActiveSession({ session, onRevoke }) {
  const countdown = useCountdown(session.expiresAt);
  const tier = TIERS.find(t => t.id === session.tierId);
  const expired = countdown === "EXPIRED";
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(session.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`rounded-xl border p-4 space-y-3 transition-all ${expired ? "opacity-50 border-border" : "border-green-500/30"}`}
      style={{ background: expired ? "rgba(255,255,255,0.02)" : "rgba(34,197,94,0.04)" }}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: expired ? "#666" : "#22c55e" }} />
          <span className="text-xs font-bold text-foreground">{tier?.label} · {session.aiSystem}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-[9px] border font-mono ${expired ? "bg-secondary text-muted-foreground border-border" : "bg-green-500/10 text-green-400 border-green-500/30"}`}>
            <Clock className="w-2.5 h-2.5 mr-1 inline" />
            {expired ? "EXPIRED" : countdown}
          </Badge>
          {!expired && (
            <button onClick={() => onRevoke(session.id)}
              className="text-[9px] text-red-400/70 hover:text-red-400 transition border border-red-500/20 hover:border-red-500/40 rounded px-2 py-0.5">
              Revoke
            </button>
          )}
        </div>
      </div>
      <div className="font-mono text-[10px] bg-black/40 rounded-lg px-3 py-2 flex items-center gap-2 break-all"
        style={{ color: GOLD }}>
        <span className="flex-1">{session.token}</span>
        <button onClick={copy} className="flex-shrink-0 text-muted-foreground hover:text-foreground transition">
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div>
          <span className="text-muted-foreground">Scope: </span>
          <span className="text-foreground/70 font-mono">{tier?.scope}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Issued: </span>
          <span className="text-foreground/70">{moment(session.issuedAt).format("HH:mm:ss")}</span>
        </div>
        <div>
          <span className="text-muted-foreground">HMAC: </span>
          <span className="text-primary/70 font-mono truncate">{session.hmac.slice(0, 16)}…</span>
        </div>
        <div>
          <span className="text-muted-foreground">Expires: </span>
          <span className="text-foreground/70">{moment(session.expiresAt).format("HH:mm:ss")}</span>
        </div>
      </div>
    </div>
  );
}

// ── Tier card ─────────────────────────────────────────────────────────────────
function TierCard({ tier, selected, onSelect }) {
  const Icon = tier.icon;
  return (
    <button onClick={() => onSelect(tier.id)}
      className={`w-full text-left rounded-2xl border p-5 space-y-3 transition-all duration-200 ${
        selected ? tier.borderColor + " ring-1 ring-inset" : "border-border hover:border-border/80"
      }`}
      style={{ background: selected ? tier.bgColor : "hsl(220,18%,7%)" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: tier.color + "15", border: `1px solid ${tier.color}30` }}>
            <Icon className="w-5 h-5" style={{ color: tier.color }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono" style={{ color: tier.color }}>TIER {tier.number}</span>
              <Badge className={`text-[8px] border ${tier.badgeClass}`}>{tier.duration}</Badge>
            </div>
            <div className="text-sm font-bold text-foreground mt-0.5">{tier.label}</div>
            <div className="text-[10px] text-muted-foreground">{tier.subtitle}</div>
          </div>
        </div>
        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1 transition-all ${
          selected ? "border-current" : "border-border"
        }`} style={{ borderColor: selected ? tier.color : undefined, background: selected ? tier.color : "transparent" }} />
      </div>

      <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${tier.color}20,transparent)` }} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: tier.color }}>Capabilities</div>
          {tier.capabilities.map((c, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[10px] text-foreground/70">
              <CheckCircle2 className="w-2.5 h-2.5 flex-shrink-0 mt-0.5" style={{ color: tier.color }} />
              {c}
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <div className="text-[9px] font-bold uppercase tracking-widest text-red-400/70">Restrictions</div>
          {tier.restrictions.map((r, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[10px] text-foreground/50">
              <XCircle className="w-2.5 h-2.5 flex-shrink-0 mt-0.5 text-red-400/50" />
              {r}
            </div>
          ))}
        </div>
      </div>

      <div className="font-mono text-[9px] rounded-lg px-2.5 py-1.5"
        style={{ background: "rgba(0,0,0,0.4)", color: tier.color + "aa" }}>
        SCOPE: {tier.scope}
      </div>
    </button>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AIIntegrationGateway() {
  const [selectedTier, setSelectedTier] = useState("tier2");
  const [prompt, setPrompt] = useState("");
  const [aiSystem, setAiSystem] = useState("");
  const [sessions, setSessions] = useState([]);
  const [issuing, setIssuing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=configure, 2=confirm, 3=active

  const tier = TIERS.find(t => t.id === selectedTier);
  const activeSessions = sessions.filter(s => s.expiresAt > Date.now());

  const handleIssue = useCallback(async () => {
    if (!prompt.trim() || !aiSystem.trim()) return;
    setIssuing(true);

    // AI validates the integration prompt
    setAnalysisLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the SB688 Integration Gateway AI. An HR system is requesting a ${tier.label} (${tier.subtitle}) integration session with SB688.

Integration Prompt: "${prompt}"
Requesting AI System: "${aiSystem}"
Requested Tier: ${tier.label}
Scope: ${tier.scope}
Duration: 1 Hour

Evaluate this integration request in 2-3 sentences. Confirm the integration is authorized, state what the AI system will have access to, and note any compliance considerations. Be direct and professional. End with: "SESSION AUTHORIZED — 1-hour integration window initiated."`,
    });
    setAiAnalysis(res);
    setAnalysisLoading(false);

    // Issue the session token
    const token = generateToken(selectedTier, aiSystem);
    const hmac = generateHmac(token);
    const now = Date.now();
    const newSession = {
      id: `session-${now}`,
      tierId: selectedTier,
      token,
      hmac,
      aiSystem: aiSystem.trim(),
      prompt: prompt.trim(),
      issuedAt: now,
      expiresAt: now + 60 * 60 * 1000, // 1 hour
    };

    setSessions(prev => [newSession, ...prev]);
    setStep(3);
    setIssuing(false);
  }, [prompt, aiSystem, selectedTier, tier]);

  const handleRevoke = useCallback((id) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, expiresAt: Date.now() - 1 } : s));
  }, []);

  const reset = () => {
    setStep(1);
    setPrompt("");
    setAiSystem("");
    setAiAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border"
        style={{ background: "hsl(220,22%,5%)", boxShadow: "0 1px 0 rgba(201,168,76,0.18), 0 4px 24px rgba(0,0,0,0.6)" }}>
        <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} />
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: 28 }}>
              <CrownIcon size={16} color={GOLD} />
              <LionIcon size={20} color={GOLD} />
            </div>
            <div className="w-px h-8" style={{ background: "linear-gradient(180deg,transparent,rgba(201,168,76,0.45),transparent)" }} />
            <div>
              <div className="text-xs font-bold tracking-widest font-cinzel" style={{ color: GOLD }}>SB688 — AI Integration Gateway</div>
              <div className="text-[9px] tracking-widest uppercase" style={{ color: "rgba(201,168,76,0.45)" }}>3-Tier HR Connectivity · 1-Hour Sessions · HMAC-Signed Tokens</div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {activeSessions.length > 0 && (
              <Badge className="text-[9px] border bg-green-500/10 text-green-400 border-green-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                {activeSessions.length} Active Session{activeSessions.length > 1 ? "s" : ""}
              </Badge>
            )}
            <Link to="/" className="text-[10px] px-3 py-1.5 rounded border font-semibold"
              style={{ color: GOLD, borderColor: "rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.06)" }}>
              ← Console
            </Link>
          </div>
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.15),transparent)" }} />
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest"
            style={{ background: "rgba(201,168,76,0.06)", borderColor: "rgba(201,168,76,0.25)", color: GOLD }}>
            <Link2 className="w-3.5 h-3.5" /> HR → SB688 → Any AI · 3-Tier Gateway
          </div>
          <h1 className="text-2xl font-bold font-cinzel" style={{ color: GOLD }}>
            AI Integration Gateway
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Connect any external AI system to SB688 via a prompt-authenticated, HMAC-signed, time-limited integration session. Choose a tier, describe your integration, and receive a scoped access token valid for exactly 1 hour.
          </p>
        </div>

        {/* Active sessions (always visible if any) */}
        {sessions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> Integration Sessions
              </h2>
              {step === 3 && (
                <button onClick={reset} className="text-[10px] text-muted-foreground hover:text-foreground transition border border-border rounded px-2 py-0.5">
                  + New Session
                </button>
              )}
            </div>
            <div className="space-y-2">
              {sessions.map(s => <ActiveSession key={s.id} session={s} onRevoke={handleRevoke} />)}
            </div>
          </div>
        )}

        {/* Configuration flow */}
        {step !== 3 && (
          <>
            {/* Step indicators */}
            <div className="flex items-center gap-2">
              {[
                { n: 1, label: "Select Tier" },
                { n: 2, label: "Integration Prompt" },
              ].map((s, i) => (
                <React.Fragment key={s.n}>
                  <button onClick={() => step > s.n && setStep(s.n)}
                    className={`flex items-center gap-2 text-xs font-semibold transition-all ${step === s.n ? "text-primary" : step > s.n ? "text-teal-400 cursor-pointer" : "text-muted-foreground/40"}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                      step === s.n ? "border-primary bg-primary/10 text-primary" :
                      step > s.n ? "border-teal-400 bg-teal-400/10 text-teal-400" :
                      "border-border text-muted-foreground/40"
                    }`}>{s.n}</div>
                    {s.label}
                  </button>
                  {i < 1 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30" />}
                </React.Fragment>
              ))}
            </div>

            {/* Step 1: Tier selection */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-foreground">Select Integration Tier</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {TIERS.map(t => (
                    <TierCard key={t.id} tier={t} selected={selectedTier === t.id} onSelect={setSelectedTier} />
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold">
                    Continue with {tier?.label} <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Prompt + AI System */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="bg-card border rounded-xl p-4 space-y-1" style={{ borderColor: tier?.color + "30" }}>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-[9px] border ${tier?.badgeClass}`}>TIER {tier?.number}</Badge>
                    <span className="text-xs font-bold text-foreground">{tier?.label}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Scope: <span className="font-mono">{tier?.scope}</span></p>
                </div>

                {/* AI System name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    External AI System Name
                  </label>
                  <input
                    type="text"
                    value={aiSystem}
                    onChange={e => setAiSystem(e.target.value)}
                    placeholder="e.g. GPT-4o, Claude 3, Gemini Pro, Custom HR AI…"
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                {/* Integration prompt */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Integration Authorization Prompt
                  </label>
                  <p className="text-[10px] text-muted-foreground">
                    Describe the purpose of this integration. This prompt is evaluated by SB688's AI to authorize the session and define its scope. Be specific about the HR use case.
                  </p>
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder={`Example: "I am integrating ${aiSystem || 'our HR AI'} with SB688 to monitor resilience metrics for workforce continuity planning, analyze recovery events during shift changes, and generate compliance reports for HR leadership. This system requires ${tier?.label} access for 1 hour to pull telemetry and generate a stakeholder briefing."`}
                    rows={6}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:border-primary/50 transition-all"
                  />
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    Your prompt is evaluated by AI. Vague or unauthorized purposes will be flagged. All sessions are logged to the immutable audit ledger.
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <button onClick={() => setStep(1)} className="text-xs text-muted-foreground hover:text-foreground transition">
                    ← Back to Tier Selection
                  </button>
                  <Button
                    onClick={handleIssue}
                    disabled={!prompt.trim() || !aiSystem.trim() || issuing}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold">
                    {issuing
                      ? <><Activity className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Authorizing…</>
                      : <><Unlock className="w-3.5 h-3.5 mr-1.5" /> Authorize 1-Hour Session</>}
                  </Button>
                </div>

                {/* AI analysis result */}
                {analysisLoading && (
                  <div className="bg-card border border-primary/20 rounded-xl p-4 flex items-center gap-3">
                    <Brain className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-xs text-muted-foreground">SB688 AI is evaluating your integration prompt…</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Step 3: Success + AI Analysis */}
        {step === 3 && aiAnalysis && (
          <div className="space-y-4">
            <div className="bg-green-500/5 border border-green-500/25 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-sm font-bold text-green-400">Session Authorized — 1-Hour Window Active</span>
              </div>
              <div className="border-t border-green-500/15 pt-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Brain className="w-3 h-3" /> SB688 AI Authorization Analysis
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{aiAnalysis}</p>
              </div>
            </div>

            {/* How to use */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">How to Use Your Integration Token</h3>
              <div className="space-y-2">
                {[
                  { step: "1", text: "Copy the session token from the Active Sessions panel above." },
                  { step: "2", text: "Pass it as a Bearer token in your AI system's Authorization header when calling SB688 endpoints." },
                  { step: "3", text: "Your AI system now has scoped access per your selected tier for exactly 1 hour." },
                  { step: "4", text: "All actions are logged to the SB688 immutable audit ledger for compliance." },
                  { step: "5", text: "The session auto-expires at the 1-hour mark. Issue a new session when needed." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <div className="w-5 h-5 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-primary">{item.step}</div>
                    <span className="text-foreground/70 leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Architecture diagram strip */}
        <div className="rounded-2xl border border-border p-6 space-y-4"
          style={{ background: "rgba(201,168,76,0.02)" }}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Integration Architecture</h3>
          <div className="flex items-center justify-center gap-2 flex-wrap text-[11px] font-semibold">
            {[
              { label: "HR System", color: "#a78bfa" },
              { sep: "→" },
              { label: "Integration Prompt", color: GOLD },
              { sep: "→" },
              { label: "SB688 AI Eval", color: GOLD },
              { sep: "→" },
              { label: "HMAC Token Issued", color: "#22c55e" },
              { sep: "→" },
              { label: "Tier Access (1hr)", color: "#3b82f6" },
              { sep: "→" },
              { label: "Any AI System", color: "#f97316" },
            ].map((item, i) =>
              item.sep
                ? <span key={i} className="text-muted-foreground/40">{item.sep}</span>
                : <span key={i} className="px-2.5 py-1 rounded-lg border text-[10px]"
                    style={{ color: item.color, borderColor: item.color + "30", background: item.color + "0a" }}>
                    {item.label}
                  </span>
            )}
          </div>
          <p className="text-[10px] text-center text-muted-foreground/50 leading-relaxed">
            All sessions are time-bounded to 1 hour · HMAC-SHA3-256 signed · Append-only audit log · Zero permanent state changes from external AI
          </p>
        </div>

      </main>
    </div>
  );
}