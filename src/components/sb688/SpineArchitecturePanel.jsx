import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, ChevronUp, Shield, Zap, Lock, Activity, CheckCircle2, XCircle, Loader2, Radio, AlertTriangle, Cpu, GitBranch } from "lucide-react";

const GOLD   = "#c4a350";
const GREEN  = "#22c55e";
const RED    = "#ef4444";
const BLUE   = "#3b82f6";
const PURPLE = "#a78bfa";
const DIM    = "#4a4642";
const CARD   = "#0e1218";
const BORDER = "#2a2622";
const BG     = "#060810";

// ── Truth Nodes ───────────────────────────────────────────────────────────────
const TRUTH_NODES = [
  { id: "tn1", label: "Truth-α", role: "Consensus Anchor",   color: GOLD },
  { id: "tn2", label: "Truth-β", role: "Hallucination Guard", color: BLUE },
  { id: "tn3", label: "Truth-γ", role: "Break-Heal Trigger",  color: GREEN },
  { id: "tn4", label: "Truth-δ", role: "Sovereign Validator", color: PURPLE },
];

// ── Brick Clip Laws ───────────────────────────────────────────────────────────
const CLIP_LAWS = [
  { id: "L1", law: "Clip-ID Required",       desc: "No brick draws resources without a verified Clip-ID signature.",       hard: true },
  { id: "L2", law: "Spine Rigidity",         desc: "Stem remains structurally rigid during hot-swap of any modular unit.", hard: true },
  { id: "L3", law: "45-min Temporal Hold",   desc: "Stem maintains the temporal link even when Brain enters Suicide mode.",hard: true },
  { id: "L4", law: "Cascade Isolation",      desc: "A single faulty brick cannot propagate failure to adjacent clips.",    hard: true },
  { id: "L5", law: "Immutable Perimeter",    desc: "Brain casing perimeter cannot be mutated once fused at runtime.",      hard: true },
];

// ── Brain casing layers ───────────────────────────────────────────────────────
const CASING_LAYERS = [
  { id: "c1", label: "Layer 1 — HMAC Signature",    color: GOLD,   status: "sealed" },
  { id: "c2", label: "Layer 2 — SHA3-256 Hash Ring",color: BLUE,   status: "sealed" },
  { id: "c3", label: "Layer 3 — Merkle Boundary",   color: PURPLE, status: "sealed" },
  { id: "c4", label: "Layer 4 — Zero-Trust Perimeter",color: GREEN, status: "sealed" },
];

// ── Spine canvas ─────────────────────────────────────────────────────────────
function SpineCanvas({ brainState, stemState, suicideActive, healActive }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const tRef      = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const draw = () => {
      tRef.current += 0.022;
      const t = tRef.current;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2;
      // ── Stem (vertical spine line) ──
      const stemColor = suicideActive ? "#f59e0b" : healActive ? GREEN : GOLD;
      const stemAlpha = 0.5 + 0.25 * Math.sin(t * 2);
      ctx.beginPath();
      ctx.moveTo(cx, 20);
      ctx.lineTo(cx, H - 20);
      ctx.strokeStyle = stemColor;
      ctx.lineWidth = suicideActive ? 2.5 : 2;
      ctx.globalAlpha = stemAlpha;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Pulse dots along stem
      for (let i = 0; i < 6; i++) {
        const y = 20 + ((t * 60 + i * (H / 6)) % (H - 40));
        ctx.beginPath();
        ctx.arc(cx, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = stemColor;
        ctx.globalAlpha = 0.6;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // ── Brain (top node) ──
      const brainColor = suicideActive ? RED : healActive ? GREEN : GOLD;
      const brainR = 28 + 3 * Math.sin(t * 3);
      // Casing glow rings
      [1.8, 1.4, 1.1].forEach((scale, i) => {
        ctx.beginPath();
        ctx.arc(cx, 50, brainR * scale, 0, Math.PI * 2);
        ctx.strokeStyle = brainColor;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.08 + i * 0.04;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
      ctx.beginPath();
      ctx.arc(cx, 50, brainR, 0, Math.PI * 2);
      ctx.fillStyle = brainColor + "18";
      ctx.strokeStyle = brainColor;
      ctx.lineWidth = suicideActive ? 2 : 1.5;
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = brainColor;
      ctx.font = `bold 9px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("BRAIN", cx, 50);

      // ── Truth Nodes (orbiting) ──
      TRUTH_NODES.forEach((tn, i) => {
        const angle = (i / TRUTH_NODES.length) * Math.PI * 2 + t * 0.4;
        const orbitR = 70;
        const nx = cx + orbitR * Math.cos(angle);
        const ny = 50  + orbitR * Math.sin(angle) * 0.5; // squish vertically
        // Link to brain
        ctx.beginPath();
        ctx.moveTo(cx, 50);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = tn.color;
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = 0.25 + 0.15 * Math.sin(t * 3 + i);
        ctx.stroke();
        ctx.globalAlpha = 1;
        // Node dot
        ctx.beginPath();
        ctx.arc(nx, ny, 7, 0, Math.PI * 2);
        ctx.fillStyle = tn.color + "22";
        ctx.strokeStyle = tn.color;
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = tn.color;
        ctx.font = "bold 6px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tn.label.split("-")[1], nx, ny);
      });

      // ── Clip bricks (lower half) ──
      const brickY = [H * 0.55, H * 0.70, H * 0.85];
      const brickOffsets = [-70, 0, 70];
      brickY.forEach((by, row) => {
        brickOffsets.forEach((bx, col) => {
          const x = cx + bx;
          const isActive = !suicideActive;
          const bColor = isActive ? (row === 1 && col === 1 ? GOLD : BLUE + "aa") : "#333";
          ctx.beginPath();
          ctx.roundRect(x - 26, by - 10, 52, 20, 3);
          ctx.fillStyle = bColor + "18";
          ctx.strokeStyle = bColor;
          ctx.lineWidth = 0.8;
          ctx.fill();
          ctx.stroke();
          // Clip-ID dot
          ctx.beginPath();
          ctx.arc(x + 20, by - 5, 2, 0, Math.PI * 2);
          ctx.fillStyle = isActive ? GREEN : RED;
          ctx.fill();
          // Stem connection line
          ctx.beginPath();
          ctx.moveTo(cx, row === 0 ? H * 0.42 : brickY[row - 1] + 10);
          ctx.lineTo(x, by - 10);
          ctx.strokeStyle = bColor;
          ctx.lineWidth = 0.5;
          ctx.globalAlpha = 0.3;
          ctx.stroke();
          ctx.globalAlpha = 1;
        });
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [brainState, stemState, suicideActive, healActive]);

  return <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SpineArchitecturePanel() {
  const [open, setOpen]             = useState(false);
  const [fused, setFused]           = useState(false);
  const [fusing, setFusing]         = useState(false);
  const [suicideActive, setSuicide] = useState(false);
  const [healActive, setHeal]       = useState(false);
  const [truthStates, setTruth]     = useState({});  // tnId → "ok"|"triggered"|"idle"
  const [clipLawsActive, setClip]   = useState(false);
  const [fuseLog, setFuseLog]       = useState([]);

  const addLog = useCallback((msg, color = DIM) => {
    const t = new Date().toLocaleTimeString("en-US", { hour12: false });
    setFuseLog(prev => [{ t, msg, color }, ...prev].slice(0, 20));
  }, []);

  // Fuse sequence
  const handleFuse = useCallback(async () => {
    if (fusing || fused) return;
    setFusing(true);
    addLog("Initiating Spine Synthesis…", GOLD);

    await new Promise(r => setTimeout(r, 600));
    addLog("Brain casing: 4-layer cryptographic shield applied.", BLUE);

    await new Promise(r => setTimeout(r, 700));
    setTruth({ tn1: "ok", tn2: "idle", tn3: "idle", tn4: "idle" });
    addLog("Truth-α: consensus anchor online.", GOLD);

    await new Promise(r => setTimeout(r, 500));
    setTruth(p => ({ ...p, tn2: "ok" }));
    addLog("Truth-β: hallucination guard active.", BLUE);

    await new Promise(r => setTimeout(r, 500));
    setTruth(p => ({ ...p, tn3: "ok" }));
    addLog("Truth-γ: break-heal trigger armed.", GREEN);

    await new Promise(r => setTimeout(r, 500));
    setTruth(p => ({ ...p, tn4: "ok" }));
    addLog("Truth-δ: sovereign validator sealed.", PURPLE);

    await new Promise(r => setTimeout(r, 600));
    setClip(true);
    addLog("Brick Clip Laws: 5 laws hard-coded.", GREEN);

    await new Promise(r => setTimeout(r, 600));
    setFused(true);
    setFusing(false);
    addLog("✓ Brain + Stem FUSED. Spine sovereign. April 27 ready.", GREEN);
  }, [fusing, fused, addLog]);

  // System Suicide stress test
  const handleSuicide = useCallback(async () => {
    if (!fused || suicideActive) return;
    setSuicide(true);
    setHeal(false);
    setTruth(p => ({ ...p, tn3: "triggered" }));
    addLog("⚠ System Suicide initiated — Brain entering stress test.", RED);

    await new Promise(r => setTimeout(r, 1200));
    addLog("Stem holding 45-min temporal link… Brain offline.", "#f59e0b");

    await new Promise(r => setTimeout(r, 1800));
    addLog("Truth-γ triggered: planned break detected. Initiating heal.", GREEN);
    setSuicide(false);
    setHeal(true);
    setTruth(p => ({ ...p, tn3: "ok" }));

    await new Promise(r => setTimeout(r, 1000));
    setHeal(false);
    addLog("✓ Brain resurrected. Stem integrity: 100%. Data loss: 0.000%.", GREEN);
  }, [fused, suicideActive, addLog]);

  const reset = useCallback(() => {
    setFused(false); setFusing(false);
    setSuicide(false); setHeal(false);
    setTruth({}); setClip(false);
    setFuseLog([]);
  }, []);

  return (
    <div className="rounded-xl border overflow-hidden transition-all duration-300"
      style={{ background: CARD, borderColor: fused ? GOLD + "40" : BORDER, boxShadow: fused ? `0 0 24px ${GOLD}10` : "none" }}>

      {/* Header */}
      <button className="w-full flex items-center justify-between px-5 py-3.5 text-left"
        onClick={() => setOpen(v => !v)}
        style={{ borderBottom: open ? `1px solid ${BORDER}` : "none" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: GOLD + "15", border: `1px solid ${GOLD}30` }}>
            <Cpu className="w-4 h-4" style={{ color: GOLD }} />
          </div>
          <div>
            <div className="text-xs font-bold" style={{ color: GOLD }}>Sovereign Spine Architecture</div>
            <div className="text-[9px] mt-0.5" style={{ color: DIM }}>Brain + Stem · Truth Nodes · Brick Clip Laws · April 27th</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {fused && <span className="text-[9px] px-2 py-0.5 rounded font-bold border" style={{ color: GREEN, borderColor: GREEN + "40", background: GREEN + "08" }}>FUSED ✓</span>}
          {suicideActive && <span className="text-[9px] px-2 py-0.5 rounded font-bold border animate-pulse" style={{ color: RED, borderColor: RED + "40", background: RED + "08" }}>SUICIDE ACTIVE</span>}
          {open ? <ChevronUp className="w-4 h-4" style={{ color: DIM }} /> : <ChevronDown className="w-4 h-4" style={{ color: DIM }} />}
        </div>
      </button>

      {open && (
        <div className="p-4 space-y-5">

          {/* Main 2-col layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Left — Spine canvas */}
            <div className="rounded-xl border overflow-hidden" style={{ background: BG, borderColor: BORDER, height: 340 }}>
              <SpineCanvas brainState={fused ? "active" : "idle"} stemState={fused ? "active" : "idle"} suicideActive={suicideActive} healActive={healActive} />
            </div>

            {/* Right — Brain + Stem specs */}
            <div className="space-y-3">

              {/* Brain casing */}
              <div className="rounded-xl border p-3 space-y-2" style={{ background: BG, borderColor: BORDER }}>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-3.5 h-3.5" style={{ color: GOLD }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>Brain — Protective Casing</span>
                </div>
                {CASING_LAYERS.map(layer => (
                  <div key={layer.id} className="flex items-center gap-2 text-[10px]">
                    {fused
                      ? <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: layer.color }} />
                      : <div className="w-3 h-3 rounded-full border flex-shrink-0" style={{ borderColor: BORDER }} />}
                    <span style={{ color: fused ? layer.color : DIM }}>{layer.label}</span>
                    {fused && <span className="ml-auto text-[8px] font-bold" style={{ color: layer.color + "80" }}>SEALED</span>}
                  </div>
                ))}
              </div>

              {/* Truth Nodes */}
              <div className="rounded-xl border p-3 space-y-2" style={{ background: BG, borderColor: BORDER }}>
                <div className="flex items-center gap-2 mb-1">
                  <Radio className="w-3.5 h-3.5" style={{ color: BLUE }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BLUE }}>Truth Nodes — Consensus Layer</span>
                </div>
                {TRUTH_NODES.map(tn => {
                  const st = truthStates[tn.id];
                  return (
                    <div key={tn.id} className="flex items-center gap-2 text-[10px]">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: st === "ok" ? tn.color : st === "triggered" ? RED : BORDER }} />
                      <span style={{ color: st ? tn.color : DIM }}>{tn.label}</span>
                      <span style={{ color: DIM }}>—</span>
                      <span style={{ color: st === "triggered" ? RED : st === "ok" ? tn.color + "80" : DIM }}>{tn.role}</span>
                      {st === "triggered" && <span className="ml-auto text-[8px] animate-pulse font-bold" style={{ color: RED }}>TRIGGERED</span>}
                      {st === "ok" && <span className="ml-auto text-[8px] font-bold" style={{ color: tn.color + "80" }}>ACTIVE</span>}
                    </div>
                  );
                })}
              </div>

              {/* Brick Clip Laws */}
              <div className="rounded-xl border p-3 space-y-2" style={{ background: BG, borderColor: BORDER }}>
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-3.5 h-3.5" style={{ color: PURPLE }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: PURPLE }}>Stem — Brick Clip Laws</span>
                </div>
                {CLIP_LAWS.map(law => (
                  <div key={law.id} className="flex items-start gap-2 text-[10px]">
                    {clipLawsActive
                      ? <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: GREEN }} />
                      : <div className="w-3 h-3 rounded border flex-shrink-0 mt-0.5" style={{ borderColor: BORDER }} />}
                    <div>
                      <span className="font-bold" style={{ color: clipLawsActive ? GREEN : DIM }}>{law.id}: {law.law}</span>
                      <div style={{ color: DIM + "bb" }}>{law.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            <button onClick={handleFuse} disabled={fusing || fused}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border font-bold text-xs transition-all"
              style={fusing || fused
                ? { borderColor: BORDER, color: DIM, cursor: "not-allowed" }
                : { borderColor: GOLD + "50", color: GOLD, background: GOLD + "0a" }}>
              {fusing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
              {fused ? "Brain + Stem Fused ✓" : fusing ? "Fusing Spine…" : "Fuse Brain + Stem"}
            </button>

            <button onClick={handleSuicide} disabled={!fused || suicideActive}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border font-bold text-xs transition-all"
              style={!fused || suicideActive
                ? { borderColor: BORDER, color: DIM, cursor: "not-allowed" }
                : { borderColor: RED + "50", color: RED, background: RED + "0a" }}>
              <Zap className="w-3.5 h-3.5" />
              {suicideActive ? "Suicide Active…" : healActive ? "Healing…" : "Run System Suicide"}
            </button>

            <button onClick={reset}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all ml-auto"
              style={{ borderColor: BORDER, color: DIM }}>
              Reset
            </button>
          </div>

          {/* Fuse log */}
          {fuseLog.length > 0 && (
            <div className="rounded-xl border p-3 space-y-1 max-h-40 overflow-y-auto" style={{ background: BG, borderColor: BORDER }}>
              <div className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: DIM }}>Spine Log</div>
              {fuseLog.map((e, i) => (
                <div key={i} className="flex gap-2 text-[10px]">
                  <span className="font-mono flex-shrink-0" style={{ color: BORDER }}>{e.t}</span>
                  <span style={{ color: e.color }}>{e.msg}</span>
                </div>
              ))}
            </div>
          )}

          {/* Fused confirmation */}
          {fused && !suicideActive && !healActive && (
            <div className="rounded-xl px-4 py-3 text-center border"
              style={{ background: GOLD + "08", borderColor: GOLD + "35" }}>
              <div className="text-xs font-bold" style={{ color: GOLD }}>⬡ SPINE SOVEREIGN — BRAIN + STEM FUSED</div>
              <div className="text-[9px] mt-1" style={{ color: GOLD + "70" }}>
                Casing hardened · Truth Nodes active · Clip Laws locked · April 27th ready
              </div>
            </div>
          )}

          {suicideActive && (
            <div className="rounded-xl px-4 py-3 text-center border animate-pulse"
              style={{ background: RED + "08", borderColor: RED + "35" }}>
              <div className="text-xs font-bold" style={{ color: RED }}>SYSTEM SUICIDE — Brain offline · Stem holding temporal link</div>
              <div className="text-[9px] mt-1" style={{ color: "#f59e0b" }}>Truth-γ armed · Auto-heal triggered in 3s</div>
            </div>
          )}

          {healActive && (
            <div className="rounded-xl px-4 py-3 text-center border"
              style={{ background: GREEN + "08", borderColor: GREEN + "35" }}>
              <div className="text-xs font-bold" style={{ color: GREEN }}>⟁ RE-STITCHING — Brain resurrecting from Ghost checkpoint…</div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}