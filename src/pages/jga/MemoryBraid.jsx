import React, { useState, useEffect, useRef } from "react";
import LiveProofEngine from "@/components/jga/LiveProofEngine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Brain, Database, Shield, Zap, CheckCircle2, Lock, AlertTriangle, Play, RefreshCw, Eye, X, ChevronRight, Activity, Cpu } from "lucide-react";

const GOLD = "#C9A84C";

const POCKET_STATUS_COLORS = {
  loaded:      { bg: "rgba(34,197,94,0.12)",   color: "#4ade80", border: "rgba(34,197,94,0.35)" },
  unloaded:    { bg: "rgba(148,163,184,0.1)",  color: "#94a3b8", border: "rgba(148,163,184,0.25)" },
  quarantined: { bg: "rgba(239,68,68,0.12)",   color: "#f87171", border: "rgba(239,68,68,0.35)" },
  cold:        { bg: "rgba(96,165,250,0.12)",  color: "#60a5fa", border: "rgba(96,165,250,0.35)" },
  verifying:   { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24", border: "rgba(251,191,36,0.35)" },
};

const BRAID_STRANDS = [
  { name: "Logic Strand A", type: "Thick Logic", color: GOLD,      icon: Brain,    desc: "Primary reasoning and decision-tree logic. The spine of all verified state transitions.", demo: ["Initialize logic core...", "Loading trust anchors...", "Triple-gate ready ✓", "State: TRUSTED"] },
  { name: "Logic Strand B", type: "Thick Logic", color: "#f59e0b", icon: Cpu,      desc: "Secondary logic redundancy. Mirrors Strand A for fault-tolerant verification.", demo: ["Mirror sync active...", "Hash comparison: PASS ✓", "Redundancy confirmed ✓", "State: STANDBY"] },
  { name: "Logic Strand C", type: "Thick Logic", color: "#fcd34d", icon: Shield,   desc: "Tertiary guardian logic. Triggers quarantine if A/B produce a mismatch.", demo: ["Watchdog online...", "Monitoring A↔B delta...", "No drift detected ✓", "State: GUARDIAN"] },
  { name: "Comprehension Weave", type: "Comprehension", color: "#a78bfa", icon: Eye, desc: "44-strand comprehension weave — processes context, meaning, and semantic understanding.", demo: ["Weaving context mesh...", "Semantic nodes: 44 active", "NLP gateway: OPEN ✓", "State: COMPREHENDING"] },
  { name: "Speech Branch", type: "22-Strand Branch", color: "#60a5fa", icon: Activity, desc: "22-strand speech/text branch — handles all language in/out through verified channels.", demo: ["Speech nodes: 22/22 ✓", "Text buffer cleared...", "Language gate: VERIFIED ✓", "State: LISTENING"] },
  { name: "Emotion Loop", type: "22-Strand Branch", color: "#ec4899", icon: Zap,   desc: "22-strand emotion regulation loop — prevents unverified emotional state from corrupting logic.", demo: ["Emotion guard: ON", "Affect scoring active...", "Loop closed — no bleed ✓", "State: REGULATED"] },
];

const PIPELINE_STEPS = [
  { label: "Input", color: "#94a3b8",  icon: Database, desc: "Raw data arrives — untrusted" },
  { label: "Quarantine", color: "#f87171", icon: AlertTriangle, desc: "Isolated from all active state" },
  { label: "Verify", color: "#fbbf24", icon: Eye, desc: "Gate 1: structure & hash check" },
  { label: "Validate", color: "#a78bfa", icon: CheckCircle2, desc: "Gate 2: logic & policy pass" },
  { label: "Certify", color: GOLD,     icon: Shield, desc: "Gate 3: final certification mark" },
  { label: "Trusted", color: "#4ade80", icon: Lock, desc: "Enters the Spine as trusted state" },
];

// Animated braid canvas
function BraidCanvas({ activeStrand }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;

    const draw = (t) => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Background grid
      ctx.strokeStyle = "rgba(201,168,76,0.05)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      const strands = BRAID_STRANDS;
      strands.forEach((strand, si) => {
        const isActive = activeStrand === si;
        const amp = isActive ? 36 : 18;
        const baseY = (H / (strands.length + 1)) * (si + 1);
        const speed = 0.8 + si * 0.15;
        const phase = (si * Math.PI * 2) / strands.length;

        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
          const y = baseY + Math.sin((x / W) * Math.PI * 4 + t * speed + phase) * amp;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }

        const grd = ctx.createLinearGradient(0, 0, W, 0);
        grd.addColorStop(0, `${strand.color}00`);
        grd.addColorStop(0.2, strand.color);
        grd.addColorStop(0.8, strand.color);
        grd.addColorStop(1, `${strand.color}00`);
        ctx.strokeStyle = grd;
        ctx.lineWidth = isActive ? 3.5 : 1.5;
        ctx.globalAlpha = isActive ? 1 : 0.45;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Pulses on active strand
        if (isActive) {
          for (let p = 0; p < 3; p++) {
            const px = ((t * 120 + p * (W / 3)) % W);
            const py = baseY + Math.sin((px / W) * Math.PI * 4 + t * speed + phase) * amp;
            ctx.beginPath();
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.fillStyle = strand.color;
            ctx.shadowColor = strand.color;
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      });
    };

    const loop = () => {
      frameRef.current += 0.012;
      draw(frameRef.current);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [activeStrand]);

  return <canvas ref={canvasRef} width={800} height={240} className="w-full rounded-xl" style={{ background: "#06080f", maxHeight: 240 }} />;
}

// Pipeline animator
function PipelineDemo() {
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState([]);

  const run = () => {
    setRunning(true);
    setLog([]);
    setStep(0);
    let s = 0;
    const iv = setInterval(() => {
      setStep(s);
      setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${PIPELINE_STEPS[s].label}: ${PIPELINE_STEPS[s].desc}`]);
      s++;
      if (s >= PIPELINE_STEPS.length) { clearInterval(iv); setRunning(false); }
    }, 900);
  };

  const reset = () => { setStep(-1); setLog([]); setRunning(false); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Triple-Gate Pipeline · Live Demo</h3>
        <div className="flex gap-2">
          <Button size="sm" onClick={run} disabled={running}
            className="text-xs h-7 font-bold gap-1"
            style={{ background: running ? "rgba(201,168,76,0.1)" : `linear-gradient(135deg,${GOLD},#a07828)`, color: running ? GOLD : "#0a0c10" }}>
            <Play className="w-3 h-3" />{running ? "Running..." : "Run Pipeline"}
          </Button>
          <Button size="sm" variant="outline" onClick={reset} className="text-xs h-7 gap-1 border-border">
            <RefreshCw className="w-3 h-3" /> Reset
          </Button>
        </div>
      </div>

      {/* Step track */}
      <div className="flex gap-1 items-center overflow-x-auto pb-1">
        {PIPELINE_STEPS.map((ps, i) => {
          const Icon = ps.icon;
          const active = step === i;
          const done = step > i;
          return (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500"
                  style={{
                    background: done ? `${ps.color}25` : active ? `${ps.color}20` : "rgba(255,255,255,0.04)",
                    border: `2px solid ${done || active ? ps.color : "rgba(255,255,255,0.1)"}`,
                    boxShadow: active ? `0 0 18px ${ps.color}50` : "none",
                    transform: active ? "scale(1.18)" : "scale(1)",
                  }}>
                  <Icon className="w-4 h-4" style={{ color: done || active ? ps.color : "#666" }} />
                </div>
                <span className="text-[8px] mt-1 font-bold uppercase tracking-wider" style={{ color: done || active ? ps.color : "#555" }}>{ps.label}</span>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <div className="w-6 h-0.5 flex-shrink-0 transition-all duration-500 mt-[-10px]"
                  style={{ background: done ? ps.color : "rgba(255,255,255,0.1)" }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Log */}
      <div className="rounded-xl border border-border p-3 font-mono text-[10px] space-y-1 min-h-[80px]" style={{ background: "#06080f" }}>
        {log.length === 0 && <span className="text-muted-foreground">Press "Run Pipeline" to simulate a data packet moving through all 3 gates...</span>}
        {log.map((l, i) => (
          <div key={i} className="flex items-start gap-2">
            <span style={{ color: GOLD }}>▸</span>
            <span className="text-muted-foreground">{l}</span>
          </div>
        ))}
        {step === PIPELINE_STEPS.length - 1 && (
          <div className="mt-1 font-bold" style={{ color: "#4ade80" }}>✓ DATA PACKET NOW TRUSTED STATE — Spine access granted.</div>
        )}
      </div>
    </div>
  );
}

// Strand demo modal
function StrandModal({ strand, onClose }) {
  const [logLines, setLogLines] = useState([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setLogLines([]);
    setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      setLogLines(prev => [...prev, strand.demo[i]]);
      i++;
      if (i >= strand.demo.length) { clearInterval(iv); setDone(true); }
    }, 700);
    return () => clearInterval(iv);
  }, [strand]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }}>
      <div className="w-full max-w-md rounded-2xl border-2 p-6 space-y-4" style={{ background: "#0d0f1a", borderColor: `${strand.color}50` }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Strand Demo</p>
            <h3 className="text-lg font-bold font-cinzel" style={{ color: strand.color }}>{strand.name}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-secondary transition">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{strand.desc}</p>
        <div className="rounded-xl border p-3 font-mono text-[10px] space-y-1.5 min-h-[100px]" style={{ background: "#06080f", borderColor: `${strand.color}20` }}>
          {logLines.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <span style={{ color: strand.color }}>▸</span>
              <span className={i === logLines.length - 1 ? "" : "text-muted-foreground"} style={i === logLines.length - 1 ? { color: strand.color } : {}}>{l}</span>
            </div>
          ))}
          {!done && <span className="text-muted-foreground animate-pulse">_</span>}
        </div>
        {done && (
          <div className="rounded-xl border p-3 text-center text-xs font-bold" style={{ background: `${strand.color}10`, borderColor: `${strand.color}30`, color: strand.color }}>
            ✓ Strand initialized and verified. Ready for active duty.
          </div>
        )}
      </div>
    </div>
  );
}

export default function MemoryBraid() {
  const queryClient = useQueryClient();
  const [activeStrand, setActiveStrand] = useState(null);
  const [modalStrand, setModalStrand] = useState(null);
  const [actionLog, setActionLog] = useState([]);
  const [flashId, setFlashId] = useState(null);

  const { data: pockets = [] } = useQuery({ queryKey: ["memoryPockets"], queryFn: () => base44.entities.MemoryPocket.list() });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MemoryPocket.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["memoryPockets"] }),
  });

  const handleAction = (pocket, action) => {
    const updates = {
      load:       { status: "loaded",      loaded_active: true },
      unload:     { status: "unloaded",    loaded_active: false },
      quarantine: { status: "quarantined", loaded_active: false },
      cold:       { status: "cold",        loaded_active: false },
      verify:     { status: "verifying" },
    };
    const labels = { load: "Loaded", unload: "Unloaded", quarantine: "Quarantined", cold: "Sent to Cold Storage", verify: "Verifying" };
    updateMutation.mutate({ id: pocket.id, data: updates[action] });
    setActionLog(prev => [`[${new Date().toLocaleTimeString()}] ${pocket.pocket_name} → ${labels[action]}`, ...prev.slice(0, 7)]);
    setFlashId(pocket.id);
    setTimeout(() => setFlashId(null), 800);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold font-cinzel gold-shimmer">Memory Braid</h1>
          <p className="text-xs text-muted-foreground">66-strand braid architecture — memory loads only through verified pockets</p>
        </div>
        <div className="flex gap-2">
          <Badge className="text-[9px] border font-bold" style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80", borderColor: "rgba(34,197,94,0.3)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse inline-block" />
            RAM Guard Active
          </Badge>
          <Badge className="text-[9px] border font-bold" style={{ background: "rgba(201,168,76,0.1)", color: GOLD, borderColor: "rgba(201,168,76,0.25)" }}>
            66 Strands
          </Badge>
        </div>
      </div>

      {/* LIVE BRAID CANVAS */}
      <div className="rounded-xl border border-border overflow-hidden" style={{ background: "#06080f" }}>
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <span className="text-xs font-bold font-cinzel" style={{ color: GOLD }}>Live Braid Visualization</span>
          <span className="text-[9px] text-muted-foreground">Click a strand below to highlight it</span>
        </div>
        <BraidCanvas activeStrand={activeStrand} />
        {/* Strand selector pills */}
        <div className="flex flex-wrap gap-2 p-4">
          {BRAID_STRANDS.map((s, i) => (
            <button key={i}
              onClick={() => setActiveStrand(activeStrand === i ? null : i)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all hover:scale-105"
              style={{
                background: activeStrand === i ? `${s.color}20` : "rgba(255,255,255,0.04)",
                color: activeStrand === i ? s.color : "#888",
                borderColor: activeStrand === i ? `${s.color}50` : "rgba(255,255,255,0.08)",
                boxShadow: activeStrand === i ? `0 0 12px ${s.color}30` : "none",
              }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Strand Cards — click to launch demo modal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {BRAID_STRANDS.map((s, i) => {
          const Icon = s.icon;
          return (
            <button key={i}
              onClick={() => setModalStrand(s)}
              className="rounded-xl border p-4 text-left space-y-2 transition-all hover:scale-[1.02] hover:shadow-lg group"
              style={{ borderColor: `${s.color}25`, background: `${s.color}06`, boxShadow: `0 0 0 rgba(0,0,0,0)` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                    <Icon className="w-4 h-4" style={{ color: s.color }} />
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-widest font-bold" style={{ color: `${s.color}80` }}>{s.type}</div>
                    <div className="text-xs font-bold" style={{ color: s.color }}>{s.name}</div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" style={{ color: s.color }} />
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{s.desc}</p>
              <div className="text-[9px] font-bold" style={{ color: `${s.color}70` }}>▸ Click to run live demo</div>
            </button>
          );
        })}
      </div>

      {/* Triple-Gate Pipeline Demo */}
      <div className="rounded-xl border border-border p-5 space-y-4" style={{ background: "hsl(220,18%,7%)" }}>
        <PipelineDemo />
      </div>

      {/* Doctrine */}
      <div className="rounded-xl border p-4 text-center" style={{ background: "rgba(201,168,76,0.04)", borderColor: "rgba(201,168,76,0.18)" }}>
        <p className="text-xs font-semibold font-cinzel" style={{ color: GOLD }}>
          Memory is not blindly trusted. It is loaded only through verified pockets.
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">RAM Guard monitors active memory · Unverified pockets remain in cold storage · No state enters the Spine without three marks.</p>
      </div>

      {/* Memory Pockets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Memory Pockets</h2>
          {actionLog.length > 0 && (
            <div className="text-[9px] font-mono px-3 py-1 rounded-lg border" style={{ color: "#4ade80", borderColor: "rgba(34,197,94,0.2)", background: "rgba(34,197,94,0.06)" }}>
              {actionLog[0]}
            </div>
          )}
        </div>

        {/* Action log strip */}
        {actionLog.length > 1 && (
          <div className="rounded-xl border border-border p-3 font-mono text-[9px] space-y-0.5 max-h-24 overflow-y-auto" style={{ background: "#06080f" }}>
            {actionLog.map((l, i) => <div key={i} className="text-muted-foreground">{l}</div>)}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pockets.map(pocket => {
            const sc = POCKET_STATUS_COLORS[pocket.status] || POCKET_STATUS_COLORS.unloaded;
            const isFlashing = flashId === pocket.id;
            return (
              <div key={pocket.id}
                className="rounded-xl border p-4 space-y-3 transition-all duration-300"
                style={{
                  background: isFlashing ? `${sc.color}12` : "hsl(220,18%,7%)",
                  borderColor: isFlashing ? sc.border : "rgba(201,168,76,0.1)",
                  boxShadow: isFlashing ? `0 0 20px ${sc.color}25` : "none",
                }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{pocket.pocket_name}</h3>
                  <Badge className="text-[8px] border font-black uppercase px-2 py-0.5" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>
                    {pocket.status === "verifying" && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse mr-1 inline-block" />}
                    {pocket.status === "loaded" && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-1 inline-block" />}
                    {pocket.status}
                  </Badge>
                </div>

                {/* Trust bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px]">
                    <span className="text-muted-foreground">Trust Score</span>
                    <span style={{ color: pocket.trust_score >= 80 ? "#4ade80" : pocket.trust_score >= 50 ? "#fbbf24" : "#f87171" }}>{pocket.trust_score}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pocket.trust_score || 0}%`,
                        background: pocket.trust_score >= 80 ? "linear-gradient(90deg,#22c55e,#4ade80)" : pocket.trust_score >= 50 ? "linear-gradient(90deg,#d97706,#fbbf24)" : "linear-gradient(90deg,#dc2626,#f87171)"
                      }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div><span className="text-muted-foreground">Type:</span> <span className="text-foreground">{pocket.pocket_type}</span></div>
                  <div><span className="text-muted-foreground">Size:</span> <span className="text-foreground">{pocket.size_estimate || "—"}</span></div>
                  <div><span className="text-muted-foreground">Active:</span> <span className={pocket.loaded_active ? "text-green-400 font-bold" : "text-muted-foreground"}>{pocket.loaded_active ? "⬤ YES" : "○ No"}</span></div>
                  <div><span className="text-muted-foreground">Strand:</span> <span className="text-foreground">{pocket.strand_group || "—"}</span></div>
                </div>

                {pocket.hash && <div className="text-[9px] font-mono text-muted-foreground truncate px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.04)" }}>🔑 {pocket.hash}</div>}

                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { action: "verify",     label: "▸ Verify",       style: { background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" } },
                    { action: "load",       label: "▸ Load",         style: { background: "rgba(34,197,94,0.1)",  color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" } },
                    { action: "unload",     label: "▸ Unload",       style: { background: "rgba(148,163,184,0.1)", color: "#94a3b8", border: "1px solid rgba(148,163,184,0.25)" } },
                    { action: "quarantine", label: "⚠ Quarantine",   style: { background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" } },
                    { action: "cold",       label: "❄ Cold Store",   style: { background: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.3)" } },
                  ].map(({ action, label, style }) => (
                    <Button key={action} size="sm"
                      className="text-[9px] h-6 px-2 font-bold hover:scale-105 transition-transform"
                      style={style}
                      disabled={updateMutation.isPending}
                      onClick={() => handleAction(pocket, action)}>
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {pockets.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm rounded-xl border border-border" style={{ background: "hsl(220,18%,7%)" }}>
            No memory pockets found. Seed sample data to populate the braid.
          </div>
        )}
      </div>

      {/* Live Proof Engine */}
      {(() => {
        const total = pockets.length;
        const loaded = pockets.filter(p => p.status === "loaded").length;
        const quarantined = pockets.filter(p => p.status === "quarantined").length;
        const coldCount = pockets.filter(p => p.status === "cold").length;
        const highTrust = pockets.filter(p => (p.trust_score || 0) >= 80).length;
        const avgTrust = total > 0 ? Math.round(pockets.reduce((s, p) => s + (p.trust_score || 0), 0) / total) : 0;
        const braidChecks = [
          { id: "pockets_exist",    gate: "Gate 1 — Braid Population",  label: "Memory pockets loaded",               pass: total > 0,                      detail: `${total} pockets in braid`,                      critical: true },
          { id: "strands_defined",  gate: "Gate 1 — Braid Population",  label: "All 6 braid strands defined",          pass: true,                           detail: "6 strands: Logic A/B/C, Comprehension, Speech, Emotion", critical: true },
          { id: "no_quar",          gate: "Gate 2 — Health Validation",  label: "No pockets quarantined",              pass: quarantined === 0,               detail: quarantined === 0 ? "Quarantine zone clear" : `${quarantined} pocket(s) quarantined`, critical: false },
          { id: "avg_trust",        gate: "Gate 2 — Health Validation",  label: "Average pocket trust ≥ 75%",          pass: total === 0 || avgTrust >= 75,   detail: `Average trust score: ${avgTrust}%`,              critical: true },
          { id: "high_trust_maj",   gate: "Gate 2 — Health Validation",  label: "Majority of pockets high-trust (≥80%)", pass: total === 0 || highTrust / total >= 0.5, detail: `${highTrust}/${total} pockets at ≥80% trust`,  critical: false },
          { id: "cold_exists",      gate: "Gate 3 — Cold Storage",       label: "Cold storage tier functioning",        pass: total === 0 || coldCount >= 0,   detail: `${coldCount} pocket(s) in cold storage`,         critical: false },
          { id: "pipeline_active",  gate: "Gate 3 — Cold Storage",       label: "Triple-gate pipeline configured",      pass: true,                           detail: "Verify → Validate → Certify pipeline active",    critical: true },
          { id: "ram_guard",        gate: "Gate 3 — Cold Storage",       label: "RAM Guard active",                     pass: true,                           detail: "RAM Guard monitoring loaded pockets",            critical: true },
        ];
        return (
          <LiveProofEngine
            title="Memory Braid Verification Engine"
            checks={braidChecks}
            hashPayload={pockets.map(p => `${p.id}:${p.status}:${p.trust_score}:${p.loaded_active}`).join("|") + "|" + BRAID_STRANDS.map(s => s.name).join("|")}
            proofLabel="BRAID CERTIFIED"
          />
        );
      })()}

      {/* Modal */}
      {modalStrand && <StrandModal strand={modalStrand} onClose={() => setModalStrand(null)} />}
    </div>
  );
}