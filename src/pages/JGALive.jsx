import React, { useState, useCallback, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Zap, CheckCircle2, Clock, AlertTriangle, Layers, Database, Lock, Globe, Play, RotateCcw, Eye, Radio } from "lucide-react";

// ── BRIC sequence definition ─────────────────────────────────────────────────
const BRIC_SEQUENCE = [
  {
    id: "spine",
    number: "BRIC 1",
    label: "Spine — Core Strategy Engine",
    sublabel: "Invisible activation layer",
    icon: Zap,
    color: "text-primary",
    border: "border-primary/30",
    bg: "bg-primary/5",
    dotColor: "bg-primary",
    publicMessage: "Core strategy engine online.",
    technicalDetail: "AI logic environment activated. Pricing logic tested. Workflow automation connected. Sovereign Guardian HMAC golden directive initialized. No customer data. No public interface. Brain online.",
    items: [
      "AI logic environment · active",
      "HMAC golden directive · sealed",
      "Workflow automation · connected",
      "Pricing logic · tested",
      "Sovereign Stitch signature · generated",
    ],
    duration: 1800,
  },
  {
    id: "systemB",
    number: "BRIC 2",
    label: "System B — Operational Engine",
    sublabel: "Public interface layer",
    icon: Globe,
    color: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    dotColor: "bg-blue-400",
    publicMessage: "Operational engine online.",
    technicalDetail: "Onboarding portal activated. Project intake form live. Automated estimate system online. Confirmation email pipeline connected. This is not just a website — this is a modular business operating system.",
    items: [
      "Onboarding portal · live",
      "Project intake form · active",
      "Automated estimate system · online",
      "Confirmation email pipeline · connected",
      "Client-facing interface · deployed",
    ],
    duration: 1800,
  },
  {
    id: "stateBric",
    number: "BRIC 3",
    label: "State BRIC Framework",
    sublabel: "Geographic expansion layer",
    icon: Database,
    color: "text-teal-400",
    border: "border-teal-500/30",
    bg: "bg-teal-500/5",
    dotColor: "bg-teal-400",
    publicMessage: "State BRIC framework activated. Illinois ACTIVE. Expansion capacity online.",
    technicalDetail: "State BRIC Template activated. Customer ID vault online. Contract vault sealed. Project storage allocated. Payment ledger initialized. Geographic state expansion begins with Illinois — dormant states ready for activation.",
    items: [
      "State BRIC Template · active",
      "Customer ID vault · sealed",
      "Contract vault · online",
      "Project storage · allocated",
      "Payment ledger · initialized",
    ],
    states: [
      { name: "Illinois", status: "ACTIVE" },
      { name: "Wisconsin", status: "Dormant" },
      { name: "Iowa", status: "Dormant" },
      { name: "Indiana", status: "Dormant" },
    ],
    duration: 1800,
  },
  {
    id: "ownersRoom",
    number: "BRIC 4",
    label: "Owner Oversight Layer",
    sublabel: "Executive control — restricted",
    icon: Lock,
    color: "text-amber-400",
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    dotColor: "bg-amber-400",
    publicMessage: "Executive oversight layer activated.",
    technicalDetail: "Revenue dashboard online. System health monitoring active. BRIC activation controls sealed behind dual-control. Read-only summaries available. No exports. Sovereign engine watches Kernel A from Kernel B (Sovereign Feedback Loop).",
    items: [
      "Revenue dashboard · read-only",
      "System health monitor · active",
      "BRIC activation controls · dual-control locked",
      "Sovereign feedback loop · watching",
      "Operator audit trail · logging",
    ],
    duration: 1800,
  },
];

// ── Phase states ──────────────────────────────────────────────────────────────
// idle → collapse → rebuilding → complete

// ── Animated BRIC Card ────────────────────────────────────────────────────────
function BricCard({ bric, status }) {
  // status: pending | activating | active
  const Icon = bric.icon;
  const isActive = status === "active";
  const isActivating = status === "activating";

  return (
    <div className={`rounded-xl border p-5 space-y-3 transition-all duration-700 ${
      isActive    ? `${bric.bg} ${bric.border} opacity-100` :
      isActivating? "bg-card border-amber-500/30 opacity-100 animate-pulse" :
      "bg-card border-border opacity-30"
    }`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? bric.dotColor + " animate-pulse" : isActivating ? "bg-amber-400 animate-ping" : "bg-muted-foreground/30"}`} />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{bric.number}</span>
        </div>
        <Badge className={`text-[9px] border ${
          isActive    ? `${bric.bg} ${bric.color} ${bric.border}` :
          isActivating? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
          "bg-secondary text-muted-foreground border-border"
        }`}>
          {isActive ? "ONLINE" : isActivating ? "ACTIVATING…" : "DORMANT"}
        </Badge>
      </div>

      <div className="space-y-0.5">
        <div className={`text-sm font-bold ${isActive ? bric.color : "text-foreground/50"}`}>{bric.label}</div>
        <div className="text-[10px] text-muted-foreground">{bric.sublabel}</div>
      </div>

      {(isActive || isActivating) && (
        <div className="space-y-1">
          {bric.items.map((item, i) => (
            <div key={i} className={`flex items-center gap-2 text-[10px] transition-all duration-300 ${isActive ? "opacity-100" : "opacity-60"}`}>
              <CheckCircle2 className={`w-3 h-3 flex-shrink-0 ${isActive ? bric.color : "text-muted-foreground"}`} />
              <span className="text-muted-foreground font-mono">{item}</span>
            </div>
          ))}
        </div>
      )}

      {isActive && bric.states && (
        <div className="space-y-1 pt-1 border-t border-border/30">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider">State BRICS</div>
          <div className="flex flex-wrap gap-1.5">
            {bric.states.map((s, i) => (
              <Badge key={i} className={`text-[9px] border ${s.status === "ACTIVE" ? "bg-teal-500/10 text-teal-400 border-teal-500/30" : "bg-secondary text-muted-foreground border-border"}`}>
                [{s.name}] {s.status}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {isActive && (
        <div className="pt-2 border-t border-border/20">
          <p className="text-[10px] text-muted-foreground/70 leading-relaxed italic">"{bric.publicMessage}"</p>
        </div>
      )}
    </div>
  );
}

// ── Collapse Phase ────────────────────────────────────────────────────────────
function CollapseScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const collapseLog = [
    "Temporary builders archived…",
    "Incoming project intake frozen…",
    "Site assets packaged…",
    "Traffic redirected to rebuild dashboard…",
    "Visible shell dismantled. Core preserved.",
    "Nothing real destroyed. Ready to rebuild.",
  ];

  useEffect(() => {
    if (step >= collapseLog.length) {
      const t = setTimeout(onComplete, 800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep(s => s + 1), 500);
    return () => clearTimeout(t);
  }, [step, onComplete]);

  return (
    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
        <span className="text-sm font-bold text-red-400 uppercase tracking-wider">Phase 1 — Controlled Collapse</span>
      </div>
      <p className="text-xs text-muted-foreground">The visible shell is being dismantled. Nothing real is destroyed. Only the surface changes.</p>
      <div className="bg-black/40 rounded-lg p-4 font-mono space-y-1 min-h-32">
        {collapseLog.slice(0, step).map((line, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px]">
            <span className="text-red-400/60">[{String(i).padStart(2, "0")}]</span>
            <span className={i === step - 1 ? "text-red-300" : "text-muted-foreground/60"}>{line}</span>
          </div>
        ))}
        {step < collapseLog.length && (
          <div className="text-red-400/40 text-[11px] animate-pulse">▌</div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function JGALive() {
  const [phase, setPhase] = useState("idle"); // idle | collapse | rebuilding | complete
  const [activeBric, setActiveBric] = useState(-1); // index into BRIC_SEQUENCE
  const [bricStatuses, setBricStatuses] = useState(BRIC_SEQUENCE.map(() => "pending"));
  const [log, setLog] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const logRef = useRef(null);

  const addLog = useCallback((msg, type = "info") => {
    setLog(prev => [{ msg, type, ts: Date.now() }, ...prev].slice(0, 30));
  }, []);

  // Timer
  useEffect(() => {
    if (phase === "rebuilding" || phase === "collapse") {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // BRIC activation sequence
  useEffect(() => {
    if (phase !== "rebuilding") return;
    if (activeBric >= BRIC_SEQUENCE.length) {
      setPhase("complete");
      addLog("Full system reveal — all BRIC layers online.", "success");
      return;
    }
    if (activeBric < 0) return;

    // Mark current as activating
    setBricStatuses(prev => prev.map((s, i) => i === activeBric ? "activating" : s));
    addLog(`Activating ${BRIC_SEQUENCE[activeBric].number} — ${BRIC_SEQUENCE[activeBric].label}…`, "info");

    const bric = BRIC_SEQUENCE[activeBric];
    const t = setTimeout(() => {
      setBricStatuses(prev => prev.map((s, i) => i === activeBric ? "active" : s));
      addLog(`${bric.number} ONLINE: ${bric.publicMessage}`, "success");
      setActiveBric(idx => idx + 1);
    }, bric.duration);
    return () => clearTimeout(t);
  }, [activeBric, phase, addLog]);

  const startSequence = useCallback(() => {
    setPhase("collapse");
    setElapsed(0);
    setActiveBric(-1);
    setBricStatuses(BRIC_SEQUENCE.map(() => "pending"));
    setLog([]);
    addLog("Phase 1: Controlled collapse initiated.", "warn");
  }, [addLog]);

  const handleCollapseComplete = useCallback(() => {
    addLog("Visible shell dismantled. Core preserved intact.", "info");
    addLog("Phase 2: BRIC activation sequence beginning…", "info");
    setPhase("rebuilding");
    setActiveBric(0);
  }, [addLog]);

  const reset = useCallback(() => {
    setPhase("idle");
    setActiveBric(-1);
    setBricStatuses(BRIC_SEQUENCE.map(() => "pending"));
    setLog([]);
    setElapsed(0);
  }, []);

  const formatElapsed = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const allOnline = bricStatuses.every(s => s === "active");
  const onlineCount = bricStatuses.filter(s => s === "active").length;

  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Layers className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground tracking-wide">JGA Live Rebuild</h1>
              <p className="text-[10px] text-muted-foreground">BRIC Stitch Method — Demolition → Assembly · J.G.A. · John Arenz</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {phase !== "idle" && (
              <Badge variant="outline" className="text-[10px] font-mono bg-secondary border-border">
                <Clock className="w-3 h-3 mr-1" />{formatElapsed(elapsed)}
              </Badge>
            )}
            <Badge variant="outline" className={`text-[10px] ${
              phase === "complete"   ? "bg-teal-500/10 text-teal-400 border-teal-500/30" :
              phase === "rebuilding" ? "bg-primary/10 text-primary border-primary/30 animate-pulse" :
              phase === "collapse"   ? "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse" :
              "bg-secondary text-muted-foreground border-border"
            }`}>
              {phase === "idle"      ? "STANDBY" :
               phase === "collapse"  ? "COLLAPSING" :
               phase === "rebuilding"? "REBUILDING" :
               "SYSTEM ONLINE"}
            </Badge>
            <Badge variant="outline" className="text-[10px] bg-secondary text-muted-foreground border-border hidden sm:flex">
              {onlineCount}/{BRIC_SEQUENCE.length} BRICS Online
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 py-8 space-y-8">

        {/* Hero message */}
        <div className={`rounded-xl border p-6 text-center space-y-3 transition-all duration-700 ${
          phase === "complete"    ? "bg-teal-500/5 border-teal-500/20" :
          phase === "rebuilding"  ? "bg-primary/5 border-primary/20" :
          phase === "collapse"    ? "bg-red-500/5 border-red-500/20" :
          "bg-card border-border"
        }`}>
          {phase === "idle" && (
            <>
              <h2 className="text-2xl font-bold text-foreground">Jay's Graphic Arts is rebuilding its engine live.</h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Watch the system come back online — piece by piece. BRIC by BRIC. This is not a website relaunch. This is a modular business operating system assembling itself in public.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
                <Button onClick={startSequence} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm px-6">
                  <Play className="w-4 h-4 mr-2" /> Begin Live Rebuild
                </Button>
              </div>
            </>
          )}
          {phase === "collapse" && (
            <>
              <h2 className="text-2xl font-bold text-red-400">Controlled Collapse in Progress</h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">Dismantling the visible shell. The core is preserved. Nothing real is being destroyed.</p>
            </>
          )}
          {phase === "rebuilding" && (
            <>
              <h2 className="text-xl font-bold text-primary animate-pulse">
                {activeBric < BRIC_SEQUENCE.length ? `Activating ${BRIC_SEQUENCE[Math.min(activeBric, BRIC_SEQUENCE.length - 1)]?.number}…` : "Final assembly…"}
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">System assembling layer by layer. Watch each BRIC come online.</p>
            </>
          )}
          {phase === "complete" && (
            <>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Badge className="text-sm bg-teal-500/10 text-teal-400 border border-teal-500/30 px-3 py-1">REBUILT ARCHITECTURE ONLINE</Badge>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Jay's Graphic Arts</h2>
              <div className="flex items-center justify-center gap-3 flex-wrap text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-400" />System B Operational</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-400" />State BRICS Expanding</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-400" />Owner Oversight Active</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-400" />Spine Sealed</span>
              </div>
              <p className="text-xs text-muted-foreground italic">Visitors just watched the entire infrastructure appear step-by-step. That's memorable.</p>
              <Button onClick={reset} variant="outline" size="sm" className="border-border text-foreground text-xs mt-2">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Sequence
              </Button>
            </>
          )}
        </div>

        {/* Visual Timeline bar */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            <span>BRIC Activation Timeline</span>
            <span>{formatElapsed(elapsed)}</span>
          </div>
          <div className="relative">
            {/* Track */}
            <div className="absolute top-3 left-0 right-0 h-0.5 bg-border/50 z-0" />
            <div className="flex items-start justify-between relative z-10">
              {/* Collapse node */}
              <div className="flex flex-col items-center gap-1.5 w-16">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                  phase !== "idle" ? "bg-red-500/20 border-red-500/60" : "bg-secondary border-border"
                }`}>
                  <AlertTriangle className={`w-3 h-3 ${phase !== "idle" ? "text-red-400" : "text-muted-foreground/30"}`} />
                </div>
                <span className="text-[9px] text-muted-foreground text-center leading-tight">Collapse</span>
              </div>
              {BRIC_SEQUENCE.map((bric, i) => {
                const Icon = bric.icon;
                const s = bricStatuses[i];
                return (
                  <div key={bric.id} className="flex flex-col items-center gap-1.5 w-16">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                      s === "active"     ? `${bric.bg} border-current` :
                      s === "activating" ? "bg-amber-500/20 border-amber-500/60 animate-pulse" :
                      "bg-secondary border-border"
                    }`}>
                      <Icon className={`w-3 h-3 ${s === "active" ? bric.color : s === "activating" ? "text-amber-400" : "text-muted-foreground/30"}`} />
                    </div>
                    <span className="text-[9px] text-muted-foreground text-center leading-tight">{bric.number}</span>
                  </div>
                );
              })}
              {/* Final reveal node */}
              <div className="flex flex-col items-center gap-1.5 w-16">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                  phase === "complete" ? "bg-teal-500/20 border-teal-500/60" : "bg-secondary border-border"
                }`}>
                  <CheckCircle2 className={`w-3 h-3 ${phase === "complete" ? "text-teal-400" : "text-muted-foreground/30"}`} />
                </div>
                <span className="text-[9px] text-muted-foreground text-center leading-tight">Full Reveal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Collapse phase */}
        {phase === "collapse" && (
          <CollapseScreen onComplete={handleCollapseComplete} />
        )}

        {/* BRIC grid */}
        {(phase === "rebuilding" || phase === "complete") && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" /> BRIC Activation — Phase 2
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BRIC_SEQUENCE.map((bric, i) => (
                <BricCard key={bric.id} bric={bric} status={bricStatuses[i]} />
              ))}
            </div>
          </div>
        )}

        {/* Idle state: explain the concept */}
        {phase === "idle" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* What viewers see */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" /> What Viewers See
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">People normally see: Website → services → checkout. You're showing:</p>
              <div className="space-y-2">
                {["Architecture activates", "Engine comes online", "System assembles", "Geographic expansion begins", "Full infrastructure visible"].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-primary">{i + 1}</div>
                    <span className="text-foreground/80">{step}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground/60 italic leading-relaxed">Humans love watching things assemble — cities, machines, Lego sets. Same instinct.</p>
            </div>
            {/* Safety rules */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Safety Rules — Show Stays Controlled
              </h3>
              <div className="space-y-2">
                {[
                  { rule: "No real customer data during rebuild", status: "enforced" },
                  { rule: "Demo data only — Spine invisible", status: "enforced" },
                  { rule: "BRIC activation is gradual — not simultaneous", status: "enforced" },
                  { rule: "Static fallback page if something breaks", status: "enforced" },
                  { rule: "Nothing real destroyed — only visible shell changes", status: "enforced" },
                  { rule: "Dual-control on Owner Layer (BRIC 4)", status: "enforced" },
                ].map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{r.rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activity log */}
        {log.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Live Rebuild Log</h3>
              <div className={`w-1.5 h-1.5 rounded-full ml-auto ${phase !== "idle" && phase !== "complete" ? "bg-primary animate-ping" : "bg-muted-foreground"}`} />
            </div>
            <div ref={logRef} className="bg-black/40 rounded-lg p-3 space-y-1 max-h-52 overflow-y-auto font-mono">
              {log.map((entry, i) => (
                <div key={i} className={`text-[10px] flex gap-2 ${
                  entry.type === "success" ? "text-teal-400" :
                  entry.type === "warn"    ? "text-amber-400" :
                  "text-muted-foreground/70"
                }`}>
                  <span className="text-muted-foreground/30 shrink-0">{new Date(entry.ts).toLocaleTimeString()}</span>
                  <span>{entry.msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical foundation strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-primary/20 rounded-xl p-4 space-y-2">
            <div className="text-[10px] text-primary uppercase tracking-widest font-bold">BSS-2026-ARCH-01</div>
            <h4 className="text-sm font-bold text-foreground">Brick Stitch System</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">1/2 Offset Spine+Ribs geometry. Withstands 38% node loss. 150% overhead vs 300% for triple mirroring. Passive recovery via geometry — not reactive software.</p>
          </div>
          <div className="bg-card border border-blue-500/20 rounded-xl p-4 space-y-2">
            <div className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">Sovereign AI Guardian</div>
            <h4 className="text-sm font-bold text-foreground">Cryptographic Immune System</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">HMAC-SHA3-256 golden directive. Merkle Stitch neural integrity tree. Dual-Kernel AI: Worker (A) watched by Sovereign (B). Re-stitches to Golden State on drift detection.</p>
          </div>
          <div className="bg-card border border-teal-500/20 rounded-xl p-4 space-y-2">
            <div className="text-[10px] text-teal-400 uppercase tracking-widest font-bold">State BRIC Framework</div>
            <h4 className="text-sm font-bold text-foreground">Geographic Expansion Layer</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">State-level BRIC activation: Customer ID vault, Contract vault, Project storage, Payment ledger. Illinois ACTIVE — Wisconsin, Iowa, Indiana dormant and ready.</p>
          </div>
        </div>

        {/* Attribution */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="text-xs font-bold text-primary">Architecture by John Arenz — J.G.A. (Jay's Graphic Arts)</span>
            <p className="text-[11px] text-muted-foreground mt-0.5">johnarenz@jaysgraphicarts.com · Brick Stitch Geometry · Sovereign Guardian · BRIC State Framework</p>
          </div>
          <Badge className="text-[10px] bg-secondary text-muted-foreground border border-border">Proprietary / Strategic Infrastructure</Badge>
        </div>

      </main>
    </div>
  );
}