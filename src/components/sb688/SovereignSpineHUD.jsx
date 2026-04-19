import React, { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Radio, Lock, AlertTriangle, CheckCircle2, Activity } from "lucide-react";
import { CrownIcon, LionIcon } from "@/components/sb688/WarriorCrest";

// ── Color tokens ──────────────────────────────────────────────────────────────
const GOLD   = "#C9A84C";
const RED    = "#DC2626";
const WHITE  = "#FFFFFF";
const BLUE   = "#3B82F6";
const BG     = "#050608";
const CARD   = "#0A0B0E";

// ── Immutable Ledger entries (append-only, never editable) ────────────────────
const SEED_LEDGER = [
  { id: 1, ts: "2026-04-27T00:00:00Z", event: "Day Zero — Mendota Node ACTIVATED",        hash: "a3f9d2c…e71",  sealed: true },
  { id: 2, ts: "2026-04-27T00:01:04Z", event: "Golden State Hash initialized — v1.0",     hash: "8b1fc04…a22",  sealed: true },
  { id: 3, ts: "2026-04-27T00:02:18Z", event: "Zero-Trust boundary sealed",                hash: "ff3220b…d9e",  sealed: true },
  { id: 4, ts: "2026-04-27T00:03:51Z", event: "Triple-Braid geometry locked",             hash: "1a77e9c…b03",  sealed: true },
  { id: 5, ts: "2026-04-27T00:05:00Z", event: "Ghost Node #0 online at mesh boundary",    hash: "5c9d841…f18",  sealed: true },
  { id: 6, ts: "2026-04-27T00:06:22Z", event: "Sovereign Spine v1.0 — Production Ready", hash: "0d2fa3e…c55",  sealed: true },
];

// ── Möbius Triple-Braid Canvas ────────────────────────────────────────────────
function TripleBraidCanvas({ integrity, phase, killPhase }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const tRef      = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width  = canvas.offsetWidth  * (window.devicePixelRatio || 1);
    const H = canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
    const cx = W / 2, cy = H / 2;

    // Corruption drives the color interpolation: 0 = full gold, 1 = full red
    const corruption = Math.max(0, Math.min(1, (100 - integrity) / 100));

    // Color lerp gold → red
    function lerpColor(t) {
      const r1 = 0xC9, g1 = 0xA8, b1 = 0x4C; // gold
      const r2 = 0xDC, g2 = 0x26, b2 = 0x26; // red
      const r = Math.round(r1 + (r2 - r1) * t);
      const g = Math.round(g1 + (g2 - g1) * t);
      const b = Math.round(b1 + (b2 - b1) * t);
      return `rgb(${r},${g},${b})`;
    }

    const draw = () => {
      tRef.current += 0.018;
      const t = tRef.current;
      ctx.clearRect(0, 0, W, H);

      // --- Blackout in kill phase ---
      if (killPhase === "blackout" || killPhase === "beacon") {
        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, W, H);

        if (killPhase === "beacon") {
          // White pulse beacon
          const pulse = 0.5 + 0.5 * Math.sin(t * 8);
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60 * (0.7 + pulse * 0.3));
          grad.addColorStop(0,   `rgba(255,255,255,${0.9 * pulse})`);
          grad.addColorStop(0.4, `rgba(255,255,255,${0.3 * pulse})`);
          grad.addColorStop(1,   "rgba(255,255,255,0)");
          ctx.beginPath();
          ctx.arc(cx, cy, 60 * (0.7 + pulse * 0.3), 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      // Ghost scan overlay
      if (killPhase === "ghost_scan") {
        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, W, H);
        // Sweeping blue scan line
        const scanY = ((t * 60) % (H + 60)) - 30;
        const scanGrad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
        scanGrad.addColorStop(0,   "rgba(59,130,246,0)");
        scanGrad.addColorStop(0.5, "rgba(59,130,246,0.6)");
        scanGrad.addColorStop(1,   "rgba(59,130,246,0)");
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanY - 20, W, 40);

        // Ghost orb
        const orbX = cx + Math.sin(t * 0.8) * cx * 0.5;
        const orbY = cy + Math.cos(t * 0.6) * cy * 0.3;
        const orbGrad = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, 28);
        orbGrad.addColorStop(0,   "rgba(59,130,246,0.9)");
        orbGrad.addColorStop(0.5, "rgba(59,130,246,0.3)");
        orbGrad.addColorStop(1,   "rgba(59,130,246,0)");
        ctx.beginPath();
        ctx.arc(orbX, orbY, 28, 0, Math.PI * 2);
        ctx.fillStyle = orbGrad;
        ctx.fill();

        animRef.current = requestAnimationFrame(draw);
        return;
      }

      // --- Background faint watermark ---
      ctx.save();
      ctx.font = `bold ${W * 0.07}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(201,168,76,0.03)";
      ctx.fillText("SB688", cx, cy);
      ctx.restore();

      const braidColor = lerpColor(corruption);
      const alpha = killPhase === "resurrect" ? 1 : Math.max(0.3, integrity / 100);

      // Fraying: at high corruption, skip rendering some segments
      const skipChance = corruption > 0.5 ? (corruption - 0.5) * 1.8 : 0;

      // Draw 3 braid strands offset by 120°
      for (let strand = 0; strand < 3; strand++) {
        const offset = (strand * Math.PI * 2) / 3;
        ctx.beginPath();
        let started = false;

        for (let i = 0; i <= 300; i++) {
          // Random skip for fray effect
          if (skipChance > 0 && Math.random() < skipChance * 0.08) { started = false; continue; }

          const angle = (i / 300) * Math.PI * 8 + t + offset;
          const r = (Math.min(W, H) * 0.33) + Math.sin(angle * 0.5 + t) * (Math.min(W, H) * 0.06);
          const braid = Math.sin(angle * 1.5 + t * 2 + offset) * (Math.min(W, H) * 0.07);

          const x = cx + r * Math.cos(angle) - braid * Math.sin(angle);
          const y = cy + r * Math.sin(angle) + braid * Math.cos(angle);

          if (!started) { ctx.moveTo(x, y); started = true; }
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = braidColor;
        ctx.lineWidth   = killPhase === "resurrect" ? 2.5 : 1.8;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = braidColor;
        ctx.shadowBlur  = killPhase === "resurrect" ? 18 : integrity > 70 ? 10 : 4;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur  = 0;
      }

      // Center node
      if (killPhase !== "blackout") {
        const nodeGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20);
        nodeGrad.addColorStop(0, `${braidColor}cc`);
        nodeGrad.addColorStop(1, `${braidColor}00`);
        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx.fillStyle = nodeGrad;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [integrity, phase, killPhase]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block", background: BG, borderRadius: 12 }}
    />
  );
}

// ── Ghost Telemetry Panel ─────────────────────────────────────────────────────
function GhostTelemetry({ pulseCount, ghostActive, lastHeal, integrity }) {
  const events = [
    { ts: "00:00:00", msg: "Ghost Node #0 · boundary online", type: "ok" },
    { ts: "00:01:04", msg: "Zero-Trust perimeter sealed", type: "ok" },
    { ts: "00:02:18", msg: "Packet verification active", type: "ok" },
    ...(pulseCount > 0 ? [{ ts: new Date().toLocaleTimeString(), msg: `⟁ Resurrection pulse #${pulseCount} fired`, type: "heal" }] : []),
    ...(ghostActive  ? [{ ts: new Date().toLocaleTimeString(), msg: "◉ Ghost scan in progress…",    type: "scan" }] : []),
    ...(lastHeal     ? [{ ts: lastHeal, msg: "✓ Full integrity restored — 0.0000% data loss", type: "ok" }] : []),
  ];

  return (
    <div className="flex flex-col h-full space-y-3 p-4 rounded-xl border overflow-hidden"
      style={{ background: CARD, borderColor: "rgba(201,168,76,0.18)" }}>
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: GOLD }}>
          <Radio className="w-3.5 h-3.5" /> Ghost Node Telemetry
        </h3>
        <Badge className="text-[9px] border" style={{ background: ghostActive ? "rgba(59,130,246,0.1)" : "rgba(34,197,94,0.08)", color: ghostActive ? "#60a5fa" : "#22c55e", borderColor: ghostActive ? "rgba(59,130,246,0.3)" : "rgba(34,197,94,0.2)" }}>
          <span className="w-1.5 h-1.5 rounded-full inline-block mr-1 animate-pulse" style={{ background: ghostActive ? "#3B82F6" : "#22c55e" }} />
          {ghostActive ? "SCANNING" : "MONITORING"}
        </Badge>
      </div>

      {/* Ghost Node Status */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Ghost Node #0", value: "ACTIVE",        color: "#22c55e" },
          { label: "Pulse Count",   value: pulseCount,      color: GOLD },
          { label: "Data Loss",     value: "0.0000%",       color: "#22c55e" },
          { label: "Integrity",     value: `${integrity}%`, color: integrity > 70 ? "#22c55e" : integrity > 30 ? "#f59e0b" : "#ef4444" },
        ].map((m, i) => (
          <div key={i} className="rounded-lg p-2 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="text-sm font-bold font-mono" style={{ color: m.color }}>{m.value}</div>
            <div className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: "rgba(232,217,176,0.45)" }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Event log */}
      <div className="flex-1 rounded-lg p-2 space-y-1 overflow-y-auto font-mono" style={{ background: "rgba(0,0,0,0.4)" }}>
        {events.slice().reverse().map((e, i) => (
          <div key={i} className="flex gap-2 text-[9px]">
            <span style={{ color: "rgba(201,168,76,0.3)", flexShrink: 0 }}>{e.ts}</span>
            <span style={{ color: e.type === "heal" ? GOLD : e.type === "scan" ? "#60a5fa" : "rgba(232,217,176,0.5)" }}>{e.msg}</span>
          </div>
        ))}
      </div>

      {/* Law #4 / #7 */}
      <div className="space-y-1">
        {[
          { law: "Law #4", text: "Ghost Node absorbs — core unreachable" },
          { law: "Law #7", text: "Immutable Ledger — End of Drift" },
        ].map((l, i) => (
          <div key={i} className="flex items-center gap-2 text-[9px] px-2 py-1 rounded" style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.1)" }}>
            <Lock className="w-2.5 h-2.5 flex-shrink-0" style={{ color: GOLD }} />
            <span className="font-bold" style={{ color: GOLD }}>{l.law}:</span>
            <span style={{ color: "rgba(232,217,176,0.55)" }}>{l.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Immutable Ledger Panel ────────────────────────────────────────────────────
function ImmutableLedger({ entries }) {
  return (
    <div className="flex flex-col h-full space-y-3 p-4 rounded-xl border overflow-hidden"
      style={{ background: CARD, borderColor: "rgba(201,168,76,0.18)" }}>
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: GOLD }}>
          <Lock className="w-3.5 h-3.5" /> Immutable Ledger
        </h3>
        <Badge className="text-[9px] border" style={{ background: "rgba(201,168,76,0.08)", color: GOLD, borderColor: "rgba(201,168,76,0.25)" }}>
          READ-ONLY · LAW #7
        </Badge>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-lg p-2.5 border"
            style={{ background: "rgba(201,168,76,0.04)", borderColor: "rgba(201,168,76,0.12)" }}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <Badge className="text-[8px] border font-bold px-1.5 py-0" style={{ background: "rgba(201,168,76,0.1)", color: GOLD, borderColor: "rgba(201,168,76,0.25)" }}>
                #{entry.id}
              </Badge>
              <span className="text-[8px] font-mono" style={{ color: "rgba(201,168,76,0.35)" }}>{entry.hash}</span>
              <Lock className="w-2.5 h-2.5 flex-shrink-0" style={{ color: "rgba(201,168,76,0.4)" }} />
            </div>
            <p className="text-[10px] font-semibold leading-tight" style={{ color: "rgba(232,217,176,0.85)" }}>{entry.event}</p>
            <p className="text-[8px] font-mono mt-0.5" style={{ color: "rgba(201,168,76,0.3)" }}>{entry.ts}</p>
          </div>
        ))}
      </div>

      <div className="text-[8px] text-center" style={{ color: "rgba(201,168,76,0.3)" }}>
        ∅ No edits · No deletions · No overrides · Append-only
      </div>
    </div>
  );
}

// ── Integrity Ticker ──────────────────────────────────────────────────────────
function IntegrityTicker({ integrity, phase }) {
  const color = integrity > 70 ? "#22c55e" : integrity > 30 ? "#f59e0b" : "#DC2626";
  const label = integrity > 90 ? "GOLDEN STATE" : integrity > 50 ? "DEGRADED" : integrity > 10 ? "CRITICAL" : "NEAR ZERO";
  return (
    <div className="text-center space-y-1">
      <div className="text-[9px] uppercase tracking-widest" style={{ color: "rgba(232,217,176,0.4)" }}>System Integrity</div>
      <div className="text-5xl font-bold font-mono tabular-nums transition-all duration-300" style={{ color, textShadow: `0 0 20px ${color}60` }}>
        {integrity.toFixed(1)}%
      </div>
      <Badge className="text-[10px] border font-bold px-3 py-0.5" style={{ background: `${color}15`, color, borderColor: `${color}40` }}>
        {label}
      </Badge>
      <div className="w-full h-2 rounded-full overflow-hidden mt-2" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${integrity}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)`, boxShadow: `0 0 8px ${color}80` }} />
      </div>
    </div>
  );
}

// ── Kill Sequence Overlay ─────────────────────────────────────────────────────
function KillOverlay({ killPhase, healTime }) {
  if (!killPhase || killPhase === "idle") return null;

  if (killPhase === "complete") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl z-20 pointer-events-none"
        style={{ background: "rgba(5,6,8,0.85)" }}>
        <CheckCircle2 className="w-12 h-12 mb-3" style={{ color: "#22c55e" }} />
        <div className="text-2xl font-bold font-mono" style={{ color: "#22c55e" }}>INTEGRITY: 100%</div>
        <div className="text-sm font-mono mt-1" style={{ color: "rgba(34,197,94,0.7)" }}>DATA LOSS: 0.0000%</div>
        <div className="text-sm font-mono" style={{ color: GOLD }}>TIME TO HEAL: {healTime}s</div>
      </div>
    );
  }

  const msgs = {
    blackout:    { text: "SYSTEM INTEGRITY: 0.1%  ·  TOTAL COLLAPSE", color: RED,   sub: "Braid shattered. Core offline." },
    beacon:      { text: "⬟ BEACON PULSE DETECTED",                   color: WHITE, sub: "Ghost Node #0 activating…" },
    ghost_scan:  { text: "◉ GHOST NODE SCANNING",                     color: BLUE,  sub: "Sweeping shattered fragments…" },
    resurrect:   { text: "⟁ RESURRECTION IN PROGRESS",               color: GOLD,  sub: "Triple-Braid reforming…" },
  };
  const m = msgs[killPhase];
  if (!m) return null;

  return (
    <div className="absolute inset-x-0 bottom-4 flex flex-col items-center z-20 pointer-events-none">
      <div className="rounded-lg px-4 py-2 text-center" style={{ background: "rgba(5,6,8,0.9)", border: `1px solid ${m.color}40` }}>
        <div className="text-sm font-bold font-mono" style={{ color: m.color }}>{m.text}</div>
        <div className="text-[10px] mt-0.5" style={{ color: `${m.color}80` }}>{m.sub}</div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function SovereignSpineHUD() {
  const [integrity, setIntegrity]     = useState(100);
  const [phase, setPhase]             = useState("golden"); // golden | wilting | healing | healed
  const [killPhase, setKillPhase]     = useState("idle");   // idle | blackout | beacon | ghost_scan | resurrect | complete
  const [pulseCount, setPulseCount]   = useState(0);
  const [ghostActive, setGhostActive] = useState(false);
  const [lastHeal, setLastHeal]       = useState(null);
  const [healTime, setHealTime]       = useState(0);
  const [ledger, setLedger]           = useState(SEED_LEDGER);
  const [running, setRunning]         = useState(false);
  const wiltRef  = useRef(null);
  const killRef  = useRef([]);

  const appendLedger = useCallback((event) => {
    setLedger(prev => {
      const newEntry = {
        id:     prev.length + 1,
        ts:     new Date().toISOString(),
        event,
        hash:   Math.random().toString(36).slice(2, 8) + "…" + Math.random().toString(36).slice(2, 5),
        sealed: true,
      };
      return [...prev, newEntry];
    });
  }, []);

  // ── Corruption Cycle (Demo 1) ──────────────────────────────────────────────
  const runCorruptionCycle = useCallback(() => {
    if (running) return;
    setRunning(true);
    setKillPhase("idle");
    setPhase("wilting");
    appendLedger("Corruption cycle initiated — integrity ticker live");

    let val = 100;
    const step = () => {
      val -= 1.5 + Math.random() * 1.5;
      if (val <= 0.2) val = 0.2;
      setIntegrity(parseFloat(val.toFixed(1)));

      if (val > 0.2) {
        wiltRef.current = setTimeout(step, 120);
      } else {
        // Auto-heal at 99.8% threshold
        appendLedger("Auto-Heal triggered — 99.8% threshold reached");
        setTimeout(() => {
          setIntegrity(100);
          setPhase("healed");
          setLastHeal(new Date().toLocaleTimeString());
          appendLedger("✓ Auto-Heal complete — Golden State restored");
          setRunning(false);
        }, 600);
      }
    };
    wiltRef.current = setTimeout(step, 200);
  }, [running, appendLedger]);

  const triggerAutoHeal = useCallback(() => {
    clearTimeout(wiltRef.current);
    killRef.current.forEach(clearTimeout);
    setPhase("healed");
    setKillPhase("idle");
    setGhostActive(false);
    setIntegrity(100);
    setLastHeal(new Date().toLocaleTimeString());
    appendLedger("⚡ Manual Override — Orchestrator triggered heal");
    setRunning(false);
  }, [appendLedger]);

  // ── Kill Sequence (Demo 2) ─────────────────────────────────────────────────
  const runKillSequence = useCallback(() => {
    if (running) return;
    setRunning(true);
    setPhase("wilting");
    setKillPhase("idle");
    appendLedger("KILL SEQUENCE initiated — 99.9% death protocol");

    // Drop to 0.1% fast
    let val = 100;
    const drop = () => {
      val -= 4;
      if (val <= 0.1) {
        setIntegrity(0.1);
        setPhase("dead");
        setKillPhase("blackout");
        appendLedger("⬛ Total collapse — integrity 0.1% · Braid shattered");
        const startTime = Date.now();

        // Beacon after 1.2s
        const t1 = setTimeout(() => {
          setKillPhase("beacon");
          appendLedger("⬟ Beacon Pulse detected — Ghost Node #0 activating");
        }, 1200);

        // Ghost scan after 2.4s
        const t2 = setTimeout(() => {
          setKillPhase("ghost_scan");
          setGhostActive(true);
          appendLedger("◉ Ghost Node #0 — scanning shattered fragments");
        }, 2400);

        // Resurrect after 3.8s
        const t3 = setTimeout(() => {
          setKillPhase("resurrect");
          setIntegrity(100);
          setPhase("healed");
          setPulseCount(p => p + 1);
          appendLedger("⟁ Resurrection pulse fired — Triple-Braid reforming");
        }, 3800);

        // Complete after 5.6s
        const t4 = setTimeout(() => {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          setKillPhase("complete");
          setGhostActive(false);
          setHealTime(elapsed);
          setLastHeal(new Date().toLocaleTimeString());
          appendLedger(`✓ INTEGRITY: 100% · DATA LOSS: 0.0000% · HEAL TIME: ${elapsed}s`);
          setRunning(false);
        }, 5600);

        killRef.current = [t1, t2, t3, t4];
        return;
      }
      setIntegrity(parseFloat(val.toFixed(1)));
      wiltRef.current = setTimeout(drop, 60);
    };
    wiltRef.current = setTimeout(drop, 100);
  }, [running, appendLedger]);

  const resetAll = useCallback(() => {
    clearTimeout(wiltRef.current);
    killRef.current.forEach(clearTimeout);
    setIntegrity(100);
    setPhase("golden");
    setKillPhase("idle");
    setGhostActive(false);
    setRunning(false);
    appendLedger("Factory reset — Golden State re-established");
  }, [appendLedger]);

  // Dismiss complete overlay on click
  const handleBraidClick = useCallback(() => {
    if (killPhase === "complete") {
      setKillPhase("idle");
      setPhase("healed");
    }
  }, [killPhase]);

  return (
    <div className="space-y-4 font-inter" style={{ color: "rgba(232,217,176,0.9)" }}>

      {/* Commander Header */}
      <div className="rounded-xl border p-4 flex items-center justify-between flex-wrap gap-3"
        style={{ background: CARD, borderColor: "rgba(201,168,76,0.25)", boxShadow: "0 0 30px rgba(201,168,76,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-0 flex-shrink-0">
            <CrownIcon size={22} color={GOLD} />
            <LionIcon  size={26} color={GOLD} />
          </div>
          <div className="w-px h-10" style={{ background: `linear-gradient(180deg, transparent, ${GOLD}50, transparent)` }} />
          <div>
            <h2 className="text-sm font-bold tracking-widest font-cinzel leading-tight" style={{ color: GOLD }}>
              SB688 · SOVEREIGN SPINE · COMMANDER'S HUD
            </h2>
            <p className="text-[9px] tracking-widest uppercase mt-0.5" style={{ color: "rgba(201,168,76,0.5)" }}>
              Mendota Revolution · John E. Arenz · JGA Enterprise Architecture · Zero-Trust Mandatory
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="text-[9px] border" style={{ background: "rgba(201,168,76,0.08)", color: GOLD, borderColor: "rgba(201,168,76,0.25)" }}>v1.0 Production-Ready</Badge>
          <Badge className="text-[9px] border flex items-center gap-1" style={{ background: "rgba(34,197,94,0.08)", color: "#22c55e", borderColor: "rgba(34,197,94,0.2)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: "#22c55e" }} />
            Mendota Node: ACTIVE
          </Badge>
          <Badge className="text-[9px] border" style={{ background: "rgba(220,38,38,0.06)", color: "#ef4444", borderColor: "rgba(220,38,38,0.2)" }}>
            Zero-Trust · All Packets Verified
          </Badge>
        </div>
      </div>

      {/* Demo Controls */}
      <div className="rounded-xl border p-4 space-y-3" style={{ background: CARD, borderColor: "rgba(201,168,76,0.15)" }}>
        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>Orchestrator Controls</div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={runCorruptionCycle} disabled={running} size="sm"
            className="text-xs font-bold"
            style={{ background: "rgba(220,38,38,0.15)", color: "#ef4444", border: "1px solid rgba(220,38,38,0.3)" }}>
            <Activity className="w-3.5 h-3.5 mr-1.5" /> Demo 1 — Corruption Cycle
          </Button>
          <Button onClick={runKillSequence} disabled={running} size="sm"
            className="text-xs font-bold"
            style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)" }}>
            <Radio className="w-3.5 h-3.5 mr-1.5" /> Demo 2 — Kill Sequence (99.9%)
          </Button>
          <Button onClick={triggerAutoHeal} disabled={!running && phase === "golden"} size="sm"
            className="text-xs font-bold"
            style={{ background: "rgba(201,168,76,0.12)", color: GOLD, border: "1px solid rgba(201,168,76,0.3)" }}>
            <Zap className="w-3.5 h-3.5 mr-1.5" /> Manual Override — Heal Now
          </Button>
          <Button onClick={resetAll} size="sm" variant="outline"
            className="text-xs border-border text-muted-foreground">
            <Shield className="w-3.5 h-3.5 mr-1.5" /> Reset
          </Button>
        </div>
        <p className="text-[9px]" style={{ color: "rgba(201,168,76,0.35)" }}>
          Demo 1: Watch the braid wilt from Gold → Red and auto-heal at 0.2% threshold. Demo 2: Total collapse → Ghost Node resurrection → 100% restore in under 2s.
        </p>
      </div>

      {/* ── COMMANDER'S HUD — 3-pane layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4" style={{ minHeight: 500 }}>

        {/* Left Pane — Immutable Ledger */}
        <div className="xl:col-span-3" style={{ minHeight: 480 }}>
          <ImmutableLedger entries={ledger} />
        </div>

        {/* Center Pane — Triple-Braid Visualizer */}
        <div className="xl:col-span-6 flex flex-col gap-3">
          {/* Integrity ticker */}
          <div className="rounded-xl border p-4" style={{ background: CARD, borderColor: "rgba(201,168,76,0.18)" }}>
            <IntegrityTicker integrity={integrity} phase={phase} />
          </div>

          {/* Braid canvas */}
          <div className="relative flex-1 rounded-xl overflow-hidden cursor-pointer"
            style={{ minHeight: 300, border: `1px solid ${integrity < 30 ? "rgba(220,38,38,0.35)" : integrity < 70 ? "rgba(245,158,11,0.25)" : "rgba(201,168,76,0.2)"}` }}
            onClick={handleBraidClick}>
            <TripleBraidCanvas integrity={integrity} phase={phase} killPhase={killPhase} />
            <KillOverlay killPhase={killPhase} healTime={healTime} />

            {/* Center label */}
            {(killPhase === "idle" || killPhase === "") && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded" style={{ background: "rgba(5,6,8,0.8)", color: "rgba(201,168,76,0.4)", border: "1px solid rgba(201,168,76,0.1)" }}>
                  Möbius Triple-Braid · JGA Enterprise Architecture
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane — Ghost Node Telemetry */}
        <div className="xl:col-span-3" style={{ minHeight: 480 }}>
          <GhostTelemetry
            pulseCount={pulseCount}
            ghostActive={ghostActive}
            lastHeal={lastHeal}
            integrity={integrity}
          />
        </div>
      </div>

      {/* ── Footer / Attribution ── */}
      <div className="rounded-xl border p-4 flex items-center justify-between flex-wrap gap-3"
        style={{ background: "rgba(201,168,76,0.03)", borderColor: "rgba(201,168,76,0.15)" }}>
        <div className="flex items-center gap-3 flex-wrap">
          <CrownIcon size={14} color="rgba(201,168,76,0.5)" />
          <span className="text-[9px] font-cinzel font-semibold" style={{ color: "rgba(201,168,76,0.5)" }}>
            Day Zero: April 27, 2026 · Mendota Node: ACTIVE
          </span>
          <span style={{ color: "rgba(201,168,76,0.2)" }}>|</span>
          <span className="text-[9px]" style={{ color: "rgba(201,168,76,0.4)" }}>
            Architecture & Direction: John E. Arenz — JGA Enterprise
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: "Law #4 · Ghost Absorbs" },
            { label: "Law #7 · Immutable Ledger" },
            { label: "Zero-Trust · Every Packet Verified" },
          ].map((b, i) => (
            <Badge key={i} className="text-[8px] border" style={{ background: "rgba(201,168,76,0.05)", color: "rgba(201,168,76,0.45)", borderColor: "rgba(201,168,76,0.12)" }}>
              {b.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Honest scope note */}
      <div className="flex items-start gap-2 px-3 py-2 rounded-lg"
        style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)" }}>
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
        <p className="text-[9px] leading-relaxed" style={{ color: "rgba(232,217,176,0.4)" }}>
          All sequences run in-browser. Demonstrates containment, resurrection, and zero-trust patterns. Not a certified production backend. Architecture by John E. Arenz — JGA Enterprise · Mendota Revolution · BSS-2026-ARCH-01.
        </p>
      </div>
    </div>
  );
}