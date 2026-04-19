import React, { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Radio, Lock, AlertTriangle, CheckCircle2, Activity, Key, Cpu, Layers, Wifi, BrainCircuit, Battery } from "lucide-react";
import { CrownIcon, LionIcon } from "@/components/sb688/WarriorCrest";

// ── 1211 COLOR PALETTE — Golden State Industrial ──────────────────────────────
const GOLD    = "#FFD700";   // Sovereign Gold — glowing, high-intensity
const RED     = "#FF0000";   // Impurity Red — corruption / wilt
const BLUE    = "#00F2FF";   // Ghost Blue — Ghost Node activation
const BG      = "#000000";   // Abyssal Black — total isolation
const GUNMETAL= "#2C2C2C";   // Gunmetal Grey — chassis / bricks
const WHITE   = "#FFFFFF";

// ── MODULAR PROGRAMMABLE BRICKS ───────────────────────────────────────────────
const BRICKS = [
  { id: "enc",    label: "Encryption Brick",    icon: Lock,        color: GOLD,  desc: "AES-256 + SHA3-256 packet-level seal",    effect: "Packet integrity hardened — all writes HMAC-signed" },
  { id: "energy", label: "Energy-Saver Brick",  icon: Battery,     color: "#00FF88", desc: "Low-power mesh routing protocol",        effect: "Route latency reduced 40% — idle nodes throttled" },
  { id: "neural", label: "Neural-Bridge Brick", icon: BrainCircuit,color: BLUE,  desc: "AI-to-AI orchestration bridge",           effect: "AI channel open — Sovereign ↔ Worker link stitched" },
  { id: "ghost2", label: "Ghost-Expand Brick",  icon: Radio,       color: "#a78bfa", desc: "Deploy 2nd Ghost Node at outer boundary", effect: "Ghost Node #1 online — dual boundary coverage" },
  { id: "layer",  label: "Redundancy Brick",    icon: Layers,      color: "#00F2FF", desc: "1/2 Offset braid redundancy layer",      effect: "Braid redundancy +1 — offset geometry stacked" },
  { id: "zero",   label: "Zero-Trust Brick",    icon: Shield,      color: GOLD,  desc: "Enforce zero-trust on all packets",        effect: "Zero-Trust layer active — no implicit trust granted" },
];

// ── SEED LEDGER ───────────────────────────────────────────────────────────────
const SEED_LEDGER = [
  { id: 1, ts: "2026-04-27T00:00:00Z", event: "Day Zero — Mendota Node ACTIVATED",          hash: "a3f9d2c…e71", sealed: true },
  { id: 2, ts: "2026-04-27T00:01:04Z", event: "Golden State Hash initialized — v1.0",       hash: "8b1fc04…a22", sealed: true },
  { id: 3, ts: "2026-04-27T00:02:18Z", event: "Zero-Trust boundary sealed",                  hash: "ff3220b…d9e", sealed: true },
  { id: 4, ts: "2026-04-27T00:03:51Z", event: "Triple-Braid geometry locked",               hash: "1a77e9c…b03", sealed: true },
  { id: 5, ts: "2026-04-27T00:05:00Z", event: "Ghost Node #0 online at mesh boundary",      hash: "5c9d841…f18", sealed: true },
  { id: 6, ts: "2026-04-27T00:06:22Z", event: "1211 Sovereign Spine — Production Ready",   hash: "0d2fa3e…c55", sealed: true },
];

// ── MÖBIUS TRIPLE-BRAID CANVAS ────────────────────────────────────────────────
function TripleBraidCanvas({ integrity, killPhase, clipPulse }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const tRef      = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width  = canvas.offsetWidth  * dpr;
    const H = canvas.height = canvas.offsetHeight * dpr;
    const cx = W / 2, cy = H / 2;
    const corruption = Math.max(0, Math.min(1, (100 - integrity) / 100));

    function lerpColor(t) {
      // Gold (#FFD700) → Red (#FF0000)
      const r = 0xFF;
      const g = Math.round(0xD7 * (1 - t));
      const b = 0;
      return `rgb(${r},${g},${b})`;
    }

    const draw = () => {
      tRef.current += 0.018;
      const t = tRef.current;
      ctx.clearRect(0, 0, W, H);

      // Blackout / beacon / ghost scan phases
      if (killPhase === "blackout" || killPhase === "beacon") {
        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, W, H);
        if (killPhase === "beacon") {
          // Golden 1211 beacon pulse
          const pulse = 0.5 + 0.5 * Math.sin(t * 8);
          const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80 + 20 * pulse);
          g1.addColorStop(0,   `rgba(255,215,0,${0.95 * pulse})`);
          g1.addColorStop(0.4, `rgba(255,215,0,${0.3 * pulse})`);
          g1.addColorStop(1,   "rgba(255,215,0,0)");
          ctx.beginPath();
          ctx.arc(cx, cy, 80 + 20 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = g1;
          ctx.fill();
          // "1211" text
          ctx.font = `bold ${W * 0.09}px monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = `rgba(255,215,0,${0.7 * pulse})`;
          ctx.fillText("1211", cx, cy);
        }
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      if (killPhase === "ghost_scan") {
        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, W, H);
        // Ghost blue sweep
        const scanY = ((t * 55) % (H + 60)) - 30;
        const sg = ctx.createLinearGradient(0, scanY - 24, 0, scanY + 24);
        sg.addColorStop(0,   "rgba(0,242,255,0)");
        sg.addColorStop(0.5, "rgba(0,242,255,0.55)");
        sg.addColorStop(1,   "rgba(0,242,255,0)");
        ctx.fillStyle = sg;
        ctx.fillRect(0, scanY - 24, W, 48);
        // Ghost orb — carrying Golden Snapshot
        const ox = cx + Math.sin(t * 0.7) * cx * 0.45;
        const oy = cy + Math.cos(t * 0.55) * cy * 0.3;
        const og = ctx.createRadialGradient(ox, oy, 0, ox, oy, 32);
        og.addColorStop(0,   "rgba(0,242,255,0.9)");
        og.addColorStop(0.5, "rgba(255,215,0,0.25)");
        og.addColorStop(1,   "rgba(0,242,255,0)");
        ctx.beginPath(); ctx.arc(ox, oy, 32, 0, Math.PI * 2);
        ctx.fillStyle = og; ctx.fill();
        // Label on orb
        ctx.font = `bold ${W * 0.025}px monospace`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(255,215,0,0.85)";
        ctx.fillText("SNAPSHOT", ox, oy);
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const ctx2 = ctx; // alias for clarity
      // Watermark
      ctx2.save();
      ctx2.font = `bold ${W * 0.06}px serif`;
      ctx2.textAlign = "center"; ctx2.textBaseline = "middle";
      ctx2.fillStyle = "rgba(255,215,0,0.04)";
      ctx2.fillText("1211", cx, cy);
      ctx2.restore();

      const braidColor = lerpColor(corruption);
      const alpha = killPhase === "resurrect" ? 1 : Math.max(0.25, integrity / 100);
      const skipChance = corruption > 0.5 ? (corruption - 0.5) * 2 : 0;

      // Clip pulse — gold ring flash
      if (clipPulse > 0) {
        const pulseAlpha = Math.max(0, 1 - (1 - clipPulse));
        ctx2.beginPath();
        ctx2.arc(cx, cy, Math.min(W,H) * 0.38 * (1 + (1-clipPulse)*0.15), 0, Math.PI * 2);
        ctx2.strokeStyle = GOLD;
        ctx2.lineWidth = 4;
        ctx2.globalAlpha = clipPulse * 0.8;
        ctx2.shadowColor = GOLD; ctx2.shadowBlur = 20;
        ctx2.stroke();
        ctx2.globalAlpha = 1; ctx2.shadowBlur = 0;
      }

      // 3 braid strands
      for (let strand = 0; strand < 3; strand++) {
        const off = (strand * Math.PI * 2) / 3;
        ctx2.beginPath();
        let started = false;
        for (let i = 0; i <= 320; i++) {
          if (skipChance > 0 && Math.random() < skipChance * 0.1) { started = false; continue; }
          const angle = (i / 320) * Math.PI * 8 + t + off;
          const R = Math.min(W,H) * 0.32 + Math.sin(angle * 0.5 + t) * Math.min(W,H) * 0.055;
          const braid = Math.sin(angle * 1.5 + t * 2 + off) * Math.min(W,H) * 0.065;
          const x = cx + R * Math.cos(angle) - braid * Math.sin(angle);
          const y = cy + R * Math.sin(angle) + braid * Math.cos(angle);
          if (!started) { ctx2.moveTo(x,y); started = true; } else ctx2.lineTo(x,y);
        }
        ctx2.strokeStyle = braidColor;
        ctx2.lineWidth   = killPhase === "resurrect" ? 3 : 2;
        ctx2.globalAlpha = alpha;
        ctx2.shadowColor = braidColor;
        ctx2.shadowBlur  = killPhase === "resurrect" ? 22 : integrity > 70 ? 12 : 5;
        ctx2.stroke();
        ctx2.globalAlpha = 1; ctx2.shadowBlur = 0;
      }

      // Center node
      if (killPhase !== "blackout") {
        const ng = ctx2.createRadialGradient(cx, cy, 0, cx, cy, 22);
        ng.addColorStop(0, `${braidColor}dd`);
        ng.addColorStop(1, `${braidColor}00`);
        ctx2.beginPath(); ctx2.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx2.fillStyle = ng; ctx2.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    const ctx = canvas.getContext("2d");
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [integrity, killPhase, clipPulse]);

  return (
    <canvas ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block", background: BG, borderRadius: 8 }} />
  );
}

// ── KILL OVERLAY ──────────────────────────────────────────────────────────────
function KillOverlay({ killPhase, healTime }) {
  if (!killPhase || killPhase === "idle") return null;

  if (killPhase === "complete") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded z-20 pointer-events-none"
        style={{ background: "rgba(0,0,0,0.88)" }}>
        <div className="text-3xl font-bold font-mono mb-1" style={{ color: GOLD, textShadow: `0 0 24px ${GOLD}` }}>
          SYSTEM RESURRECTED
        </div>
        <div className="text-base font-mono" style={{ color: GOLD }}>OWNER 1211 RE-STITCH COMPLETE</div>
        <div className="mt-3 space-y-1 text-center">
          <div className="text-lg font-bold font-mono" style={{ color: "#22FF88" }}>INTEGRITY: 100%</div>
          <div className="text-sm font-mono" style={{ color: "rgba(34,255,136,0.7)" }}>DATA LOSS: 0.0000%</div>
          <div className="text-sm font-mono" style={{ color: GOLD }}>TIME TO HEAL: {healTime}s</div>
        </div>
      </div>
    );
  }

  const msgs = {
    blackout:   { text: "INTEGRITY: 0.1% — TOTAL COLLAPSE",      color: RED,  sub: "Braid shattered. Core dark." },
    beacon:     { text: "⬟ 1211 BEACON — GOLDEN SNAPSHOT LOCKED", color: GOLD, sub: "Ghost Node #0 activating…" },
    ghost_scan: { text: "◉ GHOST NODE — CARRYING GOLDEN SNAPSHOT", color: BLUE, sub: "Sweeping shattered fragments…" },
    resurrect:  { text: "⟁ 1211 RE-STITCH IN PROGRESS",           color: GOLD, sub: "Triple-Braid reforming…" },
  };
  const m = msgs[killPhase];
  if (!m) return null;

  return (
    <div className="absolute inset-x-0 bottom-3 flex justify-center z-20 pointer-events-none">
      <div className="rounded px-4 py-2 text-center" style={{ background: "rgba(0,0,0,0.92)", border: `1px solid ${m.color}50` }}>
        <div className="text-xs font-bold font-mono" style={{ color: m.color }}>{m.text}</div>
        <div className="text-[10px] mt-0.5" style={{ color: `${m.color}70` }}>{m.sub}</div>
      </div>
    </div>
  );
}

// ── INTEGRITY TICKER ──────────────────────────────────────────────────────────
function IntegrityTicker({ integrity }) {
  const color = integrity > 70 ? "#22FF88" : integrity > 30 ? "#FFD700" : "#FF0000";
  const label = integrity > 90 ? "GOLDEN STATE" : integrity > 50 ? "DEGRADED" : integrity > 10 ? "CRITICAL" : "NEAR ZERO";
  return (
    <div className="text-center space-y-2">
      <div className="text-[9px] uppercase tracking-widest font-mono" style={{ color: "rgba(255,215,0,0.4)" }}>SYSTEM INTEGRITY</div>
      <div className="text-6xl font-bold font-mono tabular-nums" style={{ color, textShadow: `0 0 24px ${color}80` }}>
        {integrity.toFixed(1)}%
      </div>
      <div className="inline-block px-3 py-0.5 rounded text-[10px] font-bold font-mono border"
        style={{ background: `${color}15`, color, borderColor: `${color}50` }}>
        {label}
      </div>
      <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${integrity}%`, background: color, boxShadow: `0 0 10px ${color}90` }} />
      </div>
    </div>
  );
}

// ── IMMUTABLE LEDGER ──────────────────────────────────────────────────────────
function ImmutableLedger({ entries }) {
  return (
    <div className="flex flex-col h-full space-y-2 p-3 rounded border overflow-hidden"
      style={{ background: GUNMETAL, borderColor: "rgba(255,215,0,0.2)" }}>
      <div className="flex items-center justify-between flex-shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-widest font-mono flex items-center gap-1" style={{ color: GOLD }}>
          <Lock className="w-3 h-3" /> IMMUTABLE LEDGER
        </span>
        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded border" style={{ color: GOLD, borderColor: "rgba(255,215,0,0.3)", background: "rgba(255,215,0,0.06)" }}>
          LAW #7
        </span>
      </div>
      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {entries.map(e => (
          <div key={e.id} className="rounded p-2 border"
            style={{ background: "rgba(0,0,0,0.5)", borderColor: "rgba(255,215,0,0.1)" }}>
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="text-[8px] font-bold font-mono" style={{ color: GOLD }}>#{e.id}</span>
              <span className="text-[7px] font-mono" style={{ color: "rgba(255,215,0,0.3)" }}>{e.hash}</span>
              <Lock className="w-2 h-2 flex-shrink-0" style={{ color: "rgba(255,215,0,0.35)" }} />
            </div>
            <p className="text-[9px] font-semibold leading-tight font-mono" style={{ color: "rgba(255,255,255,0.8)" }}>{e.event}</p>
            <p className="text-[7px] mt-0.5 font-mono" style={{ color: "rgba(255,215,0,0.25)" }}>{e.ts}</p>
          </div>
        ))}
      </div>
      <div className="text-[7px] text-center font-mono flex-shrink-0" style={{ color: "rgba(255,215,0,0.25)" }}>
        ∅ NO EDITS · NO DELETIONS · NO OVERRIDES
      </div>
    </div>
  );
}

// ── GHOST TELEMETRY ───────────────────────────────────────────────────────────
function GhostTelemetry({ pulseCount, ghostActive, lastHeal, integrity, clippedBricks }) {
  const events = [
    { ts: "00:00:00", msg: "Ghost Node #0 boundary online", type: "ok" },
    { ts: "00:01:04", msg: "Zero-Trust perimeter sealed", type: "ok" },
    ...(pulseCount > 0 ? [{ ts: new Date().toLocaleTimeString(), msg: `⟁ Resurrection pulse #${pulseCount} fired`, type: "heal" }] : []),
    ...(ghostActive   ? [{ ts: new Date().toLocaleTimeString(), msg: "◉ Ghost scan — carrying Golden Snapshot", type: "scan" }] : []),
    ...(lastHeal      ? [{ ts: lastHeal, msg: "✓ 1211 Re-Stitch — 0.0000% data loss", type: "ok" }] : []),
    ...clippedBricks.map(b => ({ ts: new Date().toLocaleTimeString(), msg: `⬡ CLIPPED: ${b}`, type: "clip" })),
  ];

  return (
    <div className="flex flex-col h-full space-y-2 p-3 rounded border overflow-hidden"
      style={{ background: GUNMETAL, borderColor: "rgba(0,242,255,0.2)" }}>
      <div className="flex items-center justify-between flex-shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-widest font-mono flex items-center gap-1" style={{ color: BLUE }}>
          <Radio className="w-3 h-3" /> GHOST TELEMETRY
        </span>
        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded border flex items-center gap-1"
          style={{ color: ghostActive ? BLUE : "#22FF88", borderColor: ghostActive ? "rgba(0,242,255,0.35)" : "rgba(34,255,136,0.25)", background: "rgba(0,0,0,0.3)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: ghostActive ? BLUE : "#22FF88" }} />
          {ghostActive ? "SCANNING" : "ACTIVE"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1.5 flex-shrink-0">
        {[
          { label: "Ghost Node #0", value: "ACTIVE",        color: "#22FF88" },
          { label: "Pulse Count",   value: pulseCount,      color: GOLD },
          { label: "Data Loss",     value: "0.0000%",       color: "#22FF88" },
          { label: "Integrity",     value: `${integrity}%`, color: integrity > 70 ? "#22FF88" : integrity > 30 ? GOLD : RED },
        ].map((m, i) => (
          <div key={i} className="rounded p-2 text-center" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-xs font-bold font-mono" style={{ color: m.color }}>{m.value}</div>
            <div className="text-[8px] uppercase tracking-wide mt-0.5 font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 rounded p-2 space-y-1 overflow-y-auto font-mono" style={{ background: "rgba(0,0,0,0.5)" }}>
        {events.slice().reverse().map((e, i) => (
          <div key={i} className="flex gap-2 text-[8px]">
            <span className="flex-shrink-0" style={{ color: "rgba(255,215,0,0.3)" }}>{e.ts}</span>
            <span style={{ color: e.type === "heal" || e.type === "clip" ? GOLD : e.type === "scan" ? BLUE : "rgba(255,255,255,0.45)" }}>{e.msg}</span>
          </div>
        ))}
      </div>

      <div className="flex-shrink-0 space-y-1">
        {[{ law: "Law #4", text: "Ghost absorbs — core unreachable" }, { law: "Law #7", text: "Ledger sealed — End of Drift" }].map((l,i)=>(
          <div key={i} className="flex items-center gap-1.5 text-[8px] px-2 py-1 rounded font-mono"
            style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.1)" }}>
            <Lock className="w-2 h-2 flex-shrink-0" style={{ color: GOLD }} />
            <span className="font-bold" style={{ color: GOLD }}>{l.law}:</span>
            <span style={{ color: "rgba(255,255,255,0.45)" }}>{l.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 1211 CLIP PANEL ───────────────────────────────────────────────────────────
function ClipPanel({ unlocked, clippedIds, onClip }) {
  if (!unlocked) return null;

  return (
    <div className="rounded border p-3 space-y-2"
      style={{ background: GUNMETAL, borderColor: "rgba(255,215,0,0.5)", boxShadow: `0 0 20px rgba(255,215,0,0.12)` }}>
      <div className="flex items-center gap-2">
        <Cpu className="w-3.5 h-3.5" style={{ color: GOLD }} />
        <span className="text-[10px] font-bold uppercase tracking-widest font-mono" style={{ color: GOLD }}>
          MODULAR PROGRAMMABLE BRICKS — DRAG TO CLIP
        </span>
        <span className="ml-auto text-[8px] font-mono px-1.5 py-0.5 rounded border" style={{ color: GOLD, borderColor: "rgba(255,215,0,0.4)", background: "rgba(255,215,0,0.08)" }}>
          1211 UNLOCKED
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {BRICKS.map(brick => {
          const Icon = brick.icon;
          const clipped = clippedIds.includes(brick.id);
          return (
            <button key={brick.id}
              onClick={() => !clipped && onClip(brick)}
              disabled={clipped}
              className="rounded p-2.5 text-left space-y-1 transition-all border group"
              style={{
                background: clipped ? "rgba(255,215,0,0.08)" : "rgba(0,0,0,0.5)",
                borderColor: clipped ? "rgba(255,215,0,0.6)" : "rgba(255,255,255,0.08)",
                cursor: clipped ? "default" : "pointer",
                boxShadow: clipped ? `0 0 12px rgba(255,215,0,0.2)` : "none",
              }}>
              <div className="flex items-center justify-between">
                <Icon className="w-3.5 h-3.5" style={{ color: brick.color }} />
                {clipped
                  ? <span className="text-[8px] font-bold font-mono" style={{ color: GOLD }}>CLIPPED ⬡</span>
                  : <span className="text-[8px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>CLIP →</span>}
              </div>
              <div className="text-[9px] font-bold font-mono" style={{ color: clipped ? GOLD : "rgba(255,255,255,0.7)" }}>{brick.label}</div>
              <div className="text-[8px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>{brick.desc}</div>
            </button>
          );
        })}
      </div>
      <p className="text-[8px] font-mono" style={{ color: "rgba(255,215,0,0.35)" }}>
        Click any Brick to clip it live onto the Spine. No reboots. No saving. Instant DNA shift.
      </p>
    </div>
  );
}

// ── 1211 AUTH TERMINAL ────────────────────────────────────────────────────────
function AuthTerminal({ onUnlock, onHeal, isRunning, phase }) {
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === "1211") {
      setFlash(true);
      setTimeout(() => setFlash(false), 800);
      onUnlock();
    } else if (input.length > 0) {
      setShake(true);
      setError(true);
      setTimeout(() => { setShake(false); setError(false); }, 600);
    }
    setInput("");
  };

  return (
    <div className={`rounded border p-3 space-y-2 transition-all duration-300 ${flash ? "ring-2" : ""}`}
      style={{
        background: "rgba(0,0,0,0.85)",
        borderColor: flash ? GOLD : "rgba(255,215,0,0.3)",
        boxShadow: flash ? `0 0 30px rgba(255,215,0,0.5), inset 0 0 20px rgba(255,215,0,0.05)` : "none",
      }}>
      <div className="flex items-center gap-2">
        <Key className="w-3.5 h-3.5" style={{ color: GOLD }} />
        <span className="text-[10px] font-bold uppercase tracking-widest font-mono" style={{ color: GOLD }}>
          ENTER OWNER KEY TO RECONFIG...
        </span>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          type="password"
          value={input}
          onChange={e => setInput(e.target.value)}
          maxLength={8}
          placeholder="_ _ _ _"
          className={`flex-1 rounded px-3 py-2 font-mono text-sm font-bold tracking-widest text-center outline-none border transition-all ${shake ? "animate-bounce" : ""}`}
          style={{
            background: "rgba(0,0,0,0.7)",
            color: error ? RED : GOLD,
            borderColor: error ? RED : "rgba(255,215,0,0.3)",
            caretColor: GOLD,
          }}
        />
        <button type="submit" className="px-3 py-2 rounded font-mono text-xs font-bold border transition-all"
          style={{ background: "rgba(255,215,0,0.1)", color: GOLD, borderColor: "rgba(255,215,0,0.4)" }}>
          EXEC
        </button>
      </form>
      {isRunning && (
        <button onClick={onHeal}
          className="w-full py-1.5 rounded font-mono text-xs font-bold border transition-all"
          style={{ background: "rgba(255,215,0,0.12)", color: GOLD, borderColor: "rgba(255,215,0,0.5)" }}>
          ⚡ 1211 OVERRIDE — FORCE HEAL NOW
        </button>
      )}
      <p className="text-[8px] font-mono" style={{ color: "rgba(255,215,0,0.3)" }}>
        {error ? "ACCESS DENIED — INVALID KEY" : "Sovereign Owner Key required to access Modular Clip Layer"}
      </p>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function SovereignSpineHUD() {
  const [integrity, setIntegrity]       = useState(100);
  const [phase, setPhase]               = useState("golden");
  const [killPhase, setKillPhase]       = useState("idle");
  const [pulseCount, setPulseCount]     = useState(0);
  const [ghostActive, setGhostActive]   = useState(false);
  const [lastHeal, setLastHeal]         = useState(null);
  const [healTime, setHealTime]         = useState(0);
  const [ledger, setLedger]             = useState(SEED_LEDGER);
  const [running, setRunning]           = useState(false);
  const [unlocked, setUnlocked]         = useState(false);
  const [clippedIds, setClippedIds]     = useState([]);
  const [clippedNames, setClippedNames] = useState([]);
  const [clipPulse, setClipPulse]       = useState(0);
  const [screenShake, setScreenShake]   = useState(false);
  const [borderFlash, setBorderFlash]   = useState(false);
  const wiltRef = useRef(null);
  const killRef = useRef([]);
  const clipRef = useRef(null);

  const appendLedger = useCallback((event) => {
    setLedger(prev => [...prev, {
      id: prev.length + 1,
      ts: new Date().toISOString(),
      event,
      hash: Math.random().toString(36).slice(2,8) + "…" + Math.random().toString(36).slice(2,5),
      sealed: true,
    }]);
  }, []);

  const handleUnlock = useCallback(() => {
    setUnlocked(true);
    setBorderFlash(true);
    setTimeout(() => setBorderFlash(false), 1000);
    appendLedger("🔑 1211 Owner Key accepted — Modular Clip Layer UNLOCKED");
  }, [appendLedger]);

  const handleClip = useCallback((brick) => {
    setClippedIds(p => [...p, brick.id]);
    setClippedNames(p => [...p, brick.label]);
    // Screen shake + gold pulse
    setScreenShake(true);
    setClipPulse(1);
    setTimeout(() => setScreenShake(false), 400);
    clearInterval(clipRef.current);
    let val = 1;
    clipRef.current = setInterval(() => {
      val -= 0.05;
      setClipPulse(Math.max(0, val));
      if (val <= 0) clearInterval(clipRef.current);
    }, 30);
    appendLedger(`⬡ BRICK CLIPPED: ${brick.label} — ${brick.effect}`);
  }, [appendLedger]);

  // Corruption Cycle (Demo 1)
  const runCorruptionCycle = useCallback(() => {
    if (running) return;
    setRunning(true); setKillPhase("idle"); setPhase("wilting");
    appendLedger("Corruption cycle initiated — Wilt sequence live");
    let val = 100;
    const step = () => {
      val -= 1.5 + Math.random() * 1.5;
      if (val <= 0.2) val = 0.2;
      setIntegrity(parseFloat(val.toFixed(1)));
      if (val > 0.2) { wiltRef.current = setTimeout(step, 110); }
      else {
        appendLedger("Auto-Heal triggered — 99.8% threshold breached");
        setTimeout(() => {
          setIntegrity(100); setPhase("healed");
          setLastHeal(new Date().toLocaleTimeString());
          appendLedger("✓ Auto-Heal complete — Golden State restored");
          setRunning(false);
        }, 600);
      }
    };
    wiltRef.current = setTimeout(step, 200);
  }, [running, appendLedger]);

  const triggerHeal = useCallback(() => {
    clearTimeout(wiltRef.current);
    killRef.current.forEach(clearTimeout);
    setPhase("healed"); setKillPhase("idle"); setGhostActive(false);
    setIntegrity(100); setLastHeal(new Date().toLocaleTimeString());
    appendLedger("⚡ 1211 Override — Orchestrator forced heal");
    setRunning(false);
  }, [appendLedger]);

  // Kill Sequence (Demo 2)
  const runKillSequence = useCallback(() => {
    if (running) return;
    setRunning(true); setPhase("wilting"); setKillPhase("idle");
    appendLedger("KILL SEQUENCE — 99.9% death protocol initiated");
    let val = 100;
    const drop = () => {
      val -= 5;
      if (val <= 0.1) {
        setIntegrity(0.1); setPhase("dead"); setKillPhase("blackout");
        appendLedger("⬛ Total collapse — Braid shattered · 0.1% integrity");
        const t0 = Date.now();
        const t1 = setTimeout(() => { setKillPhase("beacon"); appendLedger("⬟ 1211 Beacon — Golden Snapshot locked"); }, 1200);
        const t2 = setTimeout(() => { setKillPhase("ghost_scan"); setGhostActive(true); appendLedger("◉ Ghost Node #0 — sweeping with Golden Snapshot"); }, 2500);
        const t3 = setTimeout(() => { setKillPhase("resurrect"); setIntegrity(100); setPhase("healed"); setPulseCount(p=>p+1); appendLedger("⟁ 1211 Re-Stitch — Triple-Braid reforming"); }, 3900);
        const t4 = setTimeout(() => {
          const elapsed = ((Date.now()-t0)/1000).toFixed(1);
          setKillPhase("complete"); setGhostActive(false);
          setHealTime(elapsed); setLastHeal(new Date().toLocaleTimeString());
          appendLedger(`✓ RESURRECTED · INTEGRITY: 100% · DATA LOSS: 0.0000% · ${elapsed}s`);
          setRunning(false);
        }, 5800);
        killRef.current = [t1,t2,t3,t4];
        return;
      }
      setIntegrity(parseFloat(val.toFixed(1)));
      wiltRef.current = setTimeout(drop, 55);
    };
    wiltRef.current = setTimeout(drop, 80);
  }, [running, appendLedger]);

  const resetAll = useCallback(() => {
    clearTimeout(wiltRef.current);
    killRef.current.forEach(clearTimeout);
    setIntegrity(100); setPhase("golden"); setKillPhase("idle");
    setGhostActive(false); setRunning(false);
    setClippedIds([]); setClippedNames([]); setUnlocked(false);
    appendLedger("Factory reset — Golden State re-established · 1211 lock restored");
  }, [appendLedger]);

  const handleBraidClick = useCallback(() => {
    if (killPhase === "complete") { setKillPhase("idle"); setPhase("healed"); }
  }, [killPhase]);

  const borderColor = borderFlash ? GOLD : integrity < 30 ? RED : integrity < 70 ? "#FFD700" : "rgba(255,215,0,0.25)";

  return (
    <div className={`space-y-3 font-mono transition-all ${screenShake ? "animate-bounce" : ""}`}
      style={{ color: "rgba(255,255,255,0.85)", background: BG, padding: 2 }}>

      {/* ── HEADER ── */}
      <div className="rounded border p-3 flex items-center justify-between flex-wrap gap-2"
        style={{ background: GUNMETAL, borderColor: "rgba(255,215,0,0.4)", boxShadow: `0 0 20px rgba(255,215,0,0.07)` }}>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center flex-shrink-0">
            <CrownIcon size={20} color={GOLD} />
            <LionIcon  size={24} color={GOLD} />
          </div>
          <div className="w-px h-9 flex-shrink-0" style={{ background: `linear-gradient(180deg, transparent, ${GOLD}60, transparent)` }} />
          <div>
            <div className="text-xs font-bold tracking-widest font-cinzel leading-tight" style={{ color: GOLD }}>
              JGA ENTERPRISE | SB688 COMMAND
            </div>
            <div className="text-[8px] tracking-widest uppercase mt-0.5" style={{ color: "rgba(255,215,0,0.5)" }}>
              1211 Sovereign Spine · Mendota Revolution · Zero-Trust Mandatory
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[8px] px-2 py-0.5 rounded border font-mono" style={{ background: "rgba(255,215,0,0.08)", color: GOLD, borderColor: "rgba(255,215,0,0.3)" }}>v1.0 PRODUCTION</span>
          <span className="text-[8px] px-2 py-0.5 rounded border font-mono flex items-center gap-1" style={{ background: "rgba(34,255,136,0.06)", color: "#22FF88", borderColor: "rgba(34,255,136,0.25)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: "#22FF88" }} /> MENDOTA-IL: ACTIVE
          </span>
          <span className="text-[8px] px-2 py-0.5 rounded border font-mono" style={{ background: "rgba(0,242,255,0.06)", color: BLUE, borderColor: "rgba(0,242,255,0.25)" }}>GHOST NODE #0: ONLINE</span>
          {unlocked && <span className="text-[8px] px-2 py-0.5 rounded border font-mono" style={{ background: "rgba(255,215,0,0.12)", color: GOLD, borderColor: GOLD }}>🔑 1211 ACTIVE</span>}
        </div>
      </div>

      {/* ── DEMO CONTROLS ── */}
      <div className="rounded border p-3 space-y-2" style={{ background: GUNMETAL, borderColor: "rgba(255,215,0,0.2)" }}>
        <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>ORCHESTRATOR CONTROLS</div>
        <div className="flex flex-wrap gap-2">
          <button onClick={runCorruptionCycle} disabled={running}
            className="px-3 py-1.5 rounded text-[10px] font-bold border transition-all disabled:opacity-40"
            style={{ background: "rgba(255,0,0,0.12)", color: RED, borderColor: "rgba(255,0,0,0.4)" }}>
            <Activity className="w-3 h-3 inline mr-1" />DEMO 1 — WILT CYCLE
          </button>
          <button onClick={runKillSequence} disabled={running}
            className="px-3 py-1.5 rounded text-[10px] font-bold border transition-all disabled:opacity-40"
            style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", borderColor: "rgba(167,139,250,0.35)" }}>
            <Radio className="w-3 h-3 inline mr-1" />DEMO 2 — KILL 99.9%
          </button>
          <button onClick={triggerHeal} disabled={!running}
            className="px-3 py-1.5 rounded text-[10px] font-bold border transition-all disabled:opacity-40"
            style={{ background: "rgba(255,215,0,0.1)", color: GOLD, borderColor: "rgba(255,215,0,0.4)" }}>
            <Zap className="w-3 h-3 inline mr-1" />1211 OVERRIDE — HEAL
          </button>
          <button onClick={resetAll}
            className="px-3 py-1.5 rounded text-[10px] font-bold border transition-all"
            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", borderColor: "rgba(255,255,255,0.12)" }}>
            RESET
          </button>
        </div>
      </div>

      {/* ── 3-PANE COMMANDER'S HUD ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3" style={{ minHeight: 520 }}>

        {/* LEFT — Immutable Ledger */}
        <div className="xl:col-span-3" style={{ minHeight: 480 }}>
          <ImmutableLedger entries={ledger} />
        </div>

        {/* CENTER — Integrity + Braid */}
        <div className="xl:col-span-6 flex flex-col gap-3">
          <div className="rounded border p-3" style={{ background: GUNMETAL, borderColor: "rgba(255,215,0,0.2)" }}>
            <IntegrityTicker integrity={integrity} />
          </div>
          <div className="relative flex-1 rounded overflow-hidden cursor-pointer transition-all duration-300"
            style={{ minHeight: 310, border: `2px solid ${borderColor}`, boxShadow: borderFlash ? `0 0 30px ${GOLD}60` : "none" }}
            onClick={handleBraidClick}>
            <TripleBraidCanvas integrity={integrity} killPhase={killPhase} clipPulse={clipPulse} />
            <KillOverlay killPhase={killPhase} healTime={healTime} />
            {killPhase === "idle" && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
                <span className="text-[8px] font-mono px-2 py-0.5 rounded"
                  style={{ background: "rgba(0,0,0,0.85)", color: "rgba(255,215,0,0.4)", border: "1px solid rgba(255,215,0,0.12)" }}>
                  MÖBIUS TRIPLE-BRAID · JGA ENTERPRISE ARCHITECTURE
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Ghost Telemetry */}
        <div className="xl:col-span-3" style={{ minHeight: 480 }}>
          <GhostTelemetry
            pulseCount={pulseCount} ghostActive={ghostActive}
            lastHeal={lastHeal} integrity={integrity}
            clippedBricks={clippedNames}
          />
        </div>
      </div>

      {/* ── 1211 AUTH TERMINAL ── */}
      <AuthTerminal onUnlock={handleUnlock} onHeal={triggerHeal} isRunning={running} phase={phase} />

      {/* ── CLIP PANEL (unlocks after 1211) ── */}
      <ClipPanel unlocked={unlocked} clippedIds={clippedIds} onClip={handleClip} />

      {/* ── FOOTER ── */}
      <div className="rounded border p-3 flex items-center justify-between flex-wrap gap-2"
        style={{ background: "rgba(0,0,0,0.7)", borderColor: "rgba(255,215,0,0.15)" }}>
        <div className="flex items-center gap-3 flex-wrap text-[8px] font-mono">
          <CrownIcon size={12} color="rgba(255,215,0,0.5)" />
          <span style={{ color: "rgba(255,215,0,0.6)" }}>NODE: MENDOTA-IL</span>
          <span style={{ color: "rgba(255,215,0,0.3)" }}>|</span>
          <span style={{ color: "rgba(255,215,0,0.6)" }}>AUTH: ORCHESTRATOR</span>
          <span style={{ color: "rgba(255,215,0,0.3)" }}>|</span>
          <span style={{ color: "rgba(255,215,0,0.6)" }}>KEY: 1211</span>
          <span style={{ color: "rgba(255,215,0,0.3)" }}>|</span>
          <span style={{ color: "rgba(255,215,0,0.45)" }}>DAY ZERO: APRIL 27, 2026</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {["Law #4 · Ghost Absorbs", "Law #7 · Immutable", "Zero-Trust Mandatory"].map((b,i)=>(
            <span key={i} className="text-[7px] px-1.5 py-0.5 rounded border font-mono"
              style={{ color: "rgba(255,215,0,0.4)", borderColor: "rgba(255,215,0,0.12)", background: "rgba(255,215,0,0.04)" }}>{b}</span>
          ))}
        </div>
      </div>

      {/* Scope note */}
      <div className="flex items-start gap-2 px-3 py-2 rounded"
        style={{ background: "rgba(255,165,0,0.04)", border: "1px solid rgba(255,165,0,0.12)" }}>
        <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
        <p className="text-[8px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
          All sequences run in-browser. Demonstrates 1211 Clip architecture, resurrection, and zero-trust patterns. Architecture by John E. Arenz — JGA Enterprise · Mendota Revolution · BSS-2026-ARCH-01.
        </p>
      </div>
    </div>
  );
}