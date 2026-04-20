import React, { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Play, Pause, SkipBack, SkipForward, Zap, Lock, Cpu, BatteryCharging, Network, Radio, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { CrownIcon } from "@/components/sb688/WarriorCrest";

const GOLD   = "#FFD700";
const RED    = "#FF0000";
const BLUE   = "#00F2FF";
const GREEN  = "#22c55e";
const BG     = "#000000";

// ── Simulated incident history ────────────────────────────────────────────────
function generateHistory() {
  const brickDefs = [
    { id: "enc",    label: "Encryption Brick",     icon: "🔒", color: GOLD },
    { id: "neural", label: "Neural-Bridge Brick",  icon: "🧠", color: BLUE },
    { id: "energy", label: "Energy-Saver Brick",   icon: "⚡", color: GREEN },
    { id: "net",    label: "Net-Hardened Brick",   icon: "🌐", color: "#a78bfa" },
    { id: "ghost2", label: "Ghost Sentinel Brick", icon: "👁", color: BLUE },
    { id: "pulse",  label: "Pulse Amplifier Brick",icon: "⚙", color: GOLD },
  ];

  const incidents = [
    { t: 12,  type: "corruption",  label: "Corruption Spike",         drop: 38, bricks: ["enc"] },
    { t: 28,  type: "kill",        label: "99.9% Kill Sequence",      drop: 99, bricks: ["enc", "neural"] },
    { t: 45,  type: "tamper",      label: "Tamper Injection",         drop: 22, bricks: ["net"] },
    { t: 61,  type: "corruption",  label: "Cascade Corruption",       drop: 55, bricks: ["energy", "enc"] },
    { t: 78,  type: "ghost",       label: "Ghost Probe Absorbed",     drop: 8,  bricks: [] },
    { t: 92,  type: "kill",        label: "Full Collapse Drill",      drop: 99, bricks: ["enc", "neural", "pulse"] },
    { t: 108, type: "corruption",  label: "Drift Event",              drop: 14, bricks: ["energy"] },
    { t: 125, type: "tamper",      label: "Zero-Day Probe Blocked",   drop: 5,  bricks: ["ghost2"] },
  ];

  const points = [];
  let integrity = 100;
  let activeIncident = null;
  let healing = false;

  for (let t = 0; t <= 140; t++) {
    const incident = incidents.find(i => i.t === t);
    if (incident) {
      activeIncident = incident;
      healing = false;
    }

    if (activeIncident && !healing) {
      const elapsed = t - activeIncident.t;
      if (elapsed === 0) integrity = Math.max(100 - activeIncident.drop, 0.1);
      else if (elapsed <= 3) integrity = Math.max(integrity - 2, 0.1);
      else {
        healing = true;
        activeIncident = null;
      }
    }

    if (healing || (!activeIncident && integrity < 100)) {
      integrity = Math.min(100, integrity + 4 + Math.random() * 3);
    }

    integrity = Math.min(100, Math.max(0, integrity + (Math.random() - 0.5) * 0.8));

    points.push({
      t,
      integrity: parseFloat(integrity.toFixed(2)),
      golden: 100,
      divergence: parseFloat((100 - integrity).toFixed(2)),
      incident: incidents.find(i => i.t === t) || null,
      bricksStitched: incidents.find(i => i.t === t)?.bricks.map(id => brickDefs.find(b => b.id === id)).filter(Boolean) || [],
    });
  }
  return points;
}

const HISTORY = generateHistory();

// ── Divergence canvas ─────────────────────────────────────────────────────────
function DivergenceChart({ history, scrubIndex, onScrub }) {
  const canvasRef = useRef(null);
  const [hovering, setHovering] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = canvas.offsetWidth  * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    const PAD = { top: 24, right: 20, bottom: 36, left: 48 };
    const cW = W - PAD.left - PAD.right;
    const cH = H - PAD.top  - PAD.bottom;

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.setLineDash([2, 6]);
    ctx.strokeStyle = "rgba(255,215,0,0.06)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = PAD.top + (cH / 4) * i;
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + cW, y); ctx.stroke();
    }
    ctx.setLineDash([]);

    // Y axis labels
    ctx.fillStyle = "rgba(255,215,0,0.3)";
    ctx.font = "10px monospace"; ctx.textAlign = "right";
    ["100%","75%","50%","25%","0%"].forEach((lbl, i) => {
      ctx.fillText(lbl, PAD.left - 6, PAD.top + (cH / 4) * i + 4);
    });

    const xOf = (t) => PAD.left + (t / (history.length - 1)) * cW;
    const yOf = (v) => PAD.top  + ((100 - v) / 100) * cH;

    // Golden State baseline
    ctx.beginPath();
    ctx.strokeStyle = `rgba(255,215,0,0.25)`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.moveTo(xOf(0), yOf(100));
    ctx.lineTo(xOf(history.length - 1), yOf(100));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255,215,0,0.3)";
    ctx.font = "9px monospace"; ctx.textAlign = "left";
    ctx.fillText("Golden State Baseline", xOf(0) + 4, yOf(100) - 5);

    // Divergence fill
    ctx.beginPath();
    history.forEach((p, i) => {
      if (i === 0) ctx.moveTo(xOf(i), yOf(p.integrity));
      else ctx.lineTo(xOf(i), yOf(p.integrity));
    });
    ctx.lineTo(xOf(history.length - 1), yOf(100));
    ctx.lineTo(xOf(0), yOf(100));
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + cH);
    fillGrad.addColorStop(0, "rgba(255,0,0,0.18)");
    fillGrad.addColorStop(1, "rgba(255,0,0,0.02)");
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // Integrity line
    ctx.beginPath();
    history.forEach((p, i) => {
      const x = xOf(i), y = yOf(p.integrity);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    const lineGrad = ctx.createLinearGradient(PAD.left, 0, PAD.left + cW, 0);
    lineGrad.addColorStop(0, GOLD);
    lineGrad.addColorStop(0.5, "#ff8800");
    lineGrad.addColorStop(1, GOLD);
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Incident markers
    history.forEach((p, i) => {
      if (!p.incident) return;
      const x = xOf(i), y = yOf(p.integrity);
      const color = p.incident.type === "kill" ? RED : p.incident.type === "tamper" ? "#f59e0b" : "#a78bfa";
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color; ctx.shadowBlur = 10;
      ctx.fill(); ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.strokeStyle = `${color}50`; ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Scrub line
    if (scrubIndex >= 0 && scrubIndex < history.length) {
      const x = xOf(scrubIndex);
      ctx.beginPath();
      ctx.moveTo(x, PAD.top); ctx.lineTo(x, PAD.top + cH);
      ctx.strokeStyle = "rgba(255,215,0,0.6)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.stroke(); ctx.setLineDash([]);
      const p = history[scrubIndex];
      ctx.beginPath(); ctx.arc(x, yOf(p.integrity), 6, 0, Math.PI * 2);
      ctx.fillStyle = GOLD; ctx.shadowColor = GOLD; ctx.shadowBlur = 12;
      ctx.fill(); ctx.shadowBlur = 0;
    }

    // X axis time labels
    ctx.fillStyle = "rgba(255,215,0,0.3)";
    ctx.font = "9px monospace"; ctx.textAlign = "center";
    [0, 20, 40, 60, 80, 100, 120, 140].forEach(t => {
      if (t < history.length) ctx.fillText(`T${t}`, xOf(t), PAD.top + cH + 16);
    });
  }, [history, scrubIndex]);

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const PAD_LEFT = 48, PAD_RIGHT = 20;
    const cW = canvas.offsetWidth - PAD_LEFT - PAD_RIGHT;
    const idx = Math.round(((x - PAD_LEFT) / cW) * (history.length - 1));
    if (idx >= 0 && idx < history.length) onScrub(idx);
  };

  return (
    <canvas ref={canvasRef} onClick={handleClick}
      style={{ width: "100%", height: "100%", display: "block", cursor: "crosshair", background: BG }} />
  );
}

// ── Incident card ─────────────────────────────────────────────────────────────
function IncidentCard({ point, isActive }) {
  if (!point) return null;
  const inc = point.incident;
  const typeColor = !inc ? GREEN : inc.type === "kill" ? RED : inc.type === "tamper" ? "#f59e0b" : "#a78bfa";
  const typeLabel = !inc ? "NOMINAL" : inc.type === "kill" ? "KILL SEQ" : inc.type === "tamper" ? "TAMPER" : inc.type === "ghost" ? "GHOST PROBE" : "CORRUPTION";

  return (
    <div className="rounded-xl border p-4 space-y-3 transition-all duration-300"
      style={{ background: "#0a0a0a", borderColor: isActive && inc ? `${typeColor}40` : "rgba(255,215,0,0.15)",
        boxShadow: isActive && inc ? `0 0 20px ${typeColor}15` : "none" }}>

      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,215,0,0.4)" }}>Scrub Point — T{point.t}</span>
        <Badge className="text-[9px] border font-bold"
          style={{ background: `${typeColor}15`, color: typeColor, borderColor: `${typeColor}40` }}>
          {typeLabel}
        </Badge>
      </div>

      {inc && (
        <div className="rounded p-2 border" style={{ background: `${typeColor}08`, borderColor: `${typeColor}25` }}>
          <div className="text-xs font-bold" style={{ color: typeColor }}>{inc.label}</div>
          <div className="text-[9px] mt-1 font-mono" style={{ color: "rgba(255,215,0,0.4)" }}>
            Integrity drop: {inc.drop}% → Floor: {(100 - inc.drop).toFixed(1)}%
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Braid Integrity", value: `${point.integrity.toFixed(1)}%`, color: point.integrity > 70 ? GREEN : point.integrity > 30 ? "#f59e0b" : RED },
          { label: "Divergence",      value: `${point.divergence.toFixed(1)}%`, color: point.divergence > 50 ? RED : point.divergence > 10 ? "#f59e0b" : GREEN },
        ].map((m, i) => (
          <div key={i} className="rounded p-2.5 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,215,0,0.07)" }}>
            <div className="text-lg font-bold font-mono" style={{ color: m.color }}>{m.value}</div>
            <div className="text-[8px] uppercase tracking-wider mt-0.5" style={{ color: "rgba(255,215,0,0.3)" }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Bricks stitched */}
      <div>
        <div className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: "rgba(255,215,0,0.4)" }}>
          Bricks Stitched During Recovery
        </div>
        {point.bricksStitched.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {point.bricksStitched.map((b, i) => (
              <div key={i} className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold border"
                style={{ background: `${b.color}12`, color: b.color, borderColor: `${b.color}35` }}>
                <span>{b.icon}</span>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[9px] font-mono" style={{ color: "rgba(255,215,0,0.2)" }}>
            {inc ? "No bricks required — auto-heal handled" : "No bricks needed at this point"}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Timeline scrubber ─────────────────────────────────────────────────────────
function TimelineScrubber({ index, max, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={() => onChange(Math.max(0, index - 1))}
        className="w-7 h-7 rounded border flex items-center justify-center transition-all"
        style={{ background: "rgba(255,215,0,0.07)", borderColor: "rgba(255,215,0,0.2)", color: GOLD }}>
        <SkipBack className="w-3 h-3" />
      </button>
      <div className="flex-1 relative h-6 flex items-center">
        <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,215,0,0.1)" }}>
          <div className="h-full rounded-full" style={{ width: `${(index / max) * 100}%`, background: `linear-gradient(90deg,${GOLD},#ff8800)` }} />
        </div>
        <input type="range" min={0} max={max} value={index}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
        {/* Incident tick marks */}
        {HISTORY.filter(p => p.incident).map(p => (
          <div key={p.t} className="absolute w-0.5 h-3 rounded-full pointer-events-none"
            style={{ left: `${(p.t / max) * 100}%`, background: p.incident.type === "kill" ? RED : "#f59e0b", top: "50%", transform: "translateY(-50%)" }} />
        ))}
      </div>
      <button onClick={() => onChange(Math.min(max, index + 1))}
        className="w-7 h-7 rounded border flex items-center justify-center transition-all"
        style={{ background: "rgba(255,215,0,0.07)", borderColor: "rgba(255,215,0,0.2)", color: GOLD }}>
        <SkipForward className="w-3 h-3" />
      </button>
      <span className="text-[10px] font-mono w-12 text-right" style={{ color: GOLD }}>T{index}</span>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function BraidAnalytics() {
  const [scrubIndex, setScrubIndex]   = useState(0);
  const [playing, setPlaying]         = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const playRef = useRef(null);

  useEffect(() => {
    if (playing) {
      playRef.current = setInterval(() => {
        setScrubIndex(prev => {
          if (prev >= HISTORY.length - 1) { setPlaying(false); return prev; }
          return prev + 1;
        });
      }, 80);
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [playing]);

  const currentPoint = HISTORY[scrubIndex];

  const incidents = HISTORY.filter(p => p.incident);
  const maxDivergence = Math.max(...HISTORY.map(p => p.divergence));
  const avgIntegrity = (HISTORY.reduce((s, p) => s + p.integrity, 0) / HISTORY.length).toFixed(1);
  const totalBricksStitched = new Set(incidents.flatMap(p => p.bricksStitched.map(b => b.id))).size;

  return (
    <div className="min-h-screen font-inter" style={{ background: BG, color: "rgba(255,215,0,0.88)" }}>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b"
        style={{ background: "#0a0a0a", borderColor: "rgba(255,215,0,0.2)", boxShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>
        <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} />
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <CrownIcon size={18} color={GOLD} />
            <div>
              <h1 className="text-sm font-bold tracking-widest font-cinzel" style={{ color: GOLD }}>
                BRAID DIVERGENCE ANALYTICS
              </h1>
              <p className="text-[8px] uppercase tracking-widest" style={{ color: "rgba(255,215,0,0.35)" }}>
                JGA Enterprise · Integrity vs. Golden State Baseline · Incident Scrubber
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="text-[9px] border font-bold" style={{ background: "rgba(255,215,0,0.08)", color: GOLD, borderColor: "rgba(255,215,0,0.3)" }}>
              {incidents.length} INCIDENTS LOGGED
            </Badge>
            <Link to="/" className="flex items-center gap-1 text-[10px] px-3 py-1.5 rounded border font-semibold"
              style={{ color: "rgba(255,215,0,0.6)", borderColor: "rgba(255,215,0,0.2)" }}>
              <ChevronLeft className="w-3 h-3" /> Console
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-6 space-y-5">

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Avg Integrity",      value: `${avgIntegrity}%`,     color: "#22c55e" },
            { label: "Peak Divergence",    value: `${maxDivergence.toFixed(1)}%`, color: RED },
            { label: "Total Incidents",    value: incidents.length,        color: "#f59e0b" },
            { label: "Unique Bricks Used", value: totalBricksStitched,    color: GOLD },
          ].map((k, i) => (
            <div key={i} className="rounded-xl border p-3 text-center"
              style={{ background: "#0a0a0a", borderColor: "rgba(255,215,0,0.12)" }}>
              <div className="text-2xl font-bold font-mono" style={{ color: k.color, textShadow: `0 0 16px ${k.color}60` }}>{k.value}</div>
              <div className="text-[9px] uppercase tracking-wider mt-1" style={{ color: "rgba(255,215,0,0.35)" }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Main chart */}
        <div className="rounded-xl border overflow-hidden" style={{ background: "#0a0a0a", borderColor: "rgba(255,215,0,0.18)" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(255,215,0,0.1)" }}>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" style={{ color: GOLD }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>
                Braid Integrity vs. Golden State Baseline
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[9px]" style={{ color: "rgba(255,215,0,0.4)" }}>
                <div className="w-3 h-0.5" style={{ background: GOLD }} /> Braid Integrity
              </div>
              <div className="flex items-center gap-1.5 text-[9px]" style={{ color: "rgba(255,215,0,0.4)" }}>
                <div className="w-3 h-0.5 border-t border-dashed" style={{ borderColor: "rgba(255,215,0,0.4)" }} /> Golden Baseline
              </div>
              <div className="flex items-center gap-1.5 text-[9px]" style={{ color: "rgba(255,0,0,0.6)" }}>
                <div className="w-2 h-2 rounded-full" style={{ background: RED }} /> Incident
              </div>
            </div>
          </div>
          <div style={{ height: 280 }}>
            <DivergenceChart history={HISTORY} scrubIndex={scrubIndex} onScrub={setScrubIndex} />
          </div>
          {/* Scrubber */}
          <div className="px-4 py-3 border-t space-y-2" style={{ borderColor: "rgba(255,215,0,0.1)" }}>
            <div className="flex items-center gap-2 mb-1">
              <button onClick={() => { setScrubIndex(0); setPlaying(false); }}
                className="w-7 h-7 rounded border flex items-center justify-center"
                style={{ background: "rgba(255,215,0,0.07)", borderColor: "rgba(255,215,0,0.2)", color: GOLD }}>
                <SkipBack className="w-3 h-3" />
              </button>
              <button onClick={() => setPlaying(p => !p)}
                className="flex items-center gap-1.5 px-3 h-7 rounded border text-[10px] font-bold"
                style={{ background: playing ? "rgba(255,0,0,0.12)" : "rgba(255,215,0,0.1)", color: playing ? RED : GOLD, borderColor: playing ? "rgba(255,0,0,0.3)" : "rgba(255,215,0,0.3)" }}>
                {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {playing ? "Pause" : "Play Replay"}
              </button>
              <span className="text-[9px] font-mono ml-1" style={{ color: "rgba(255,215,0,0.4)" }}>
                Click chart or drag slider to scrub
              </span>
            </div>
            <TimelineScrubber index={scrubIndex} max={HISTORY.length - 1} onChange={setScrubIndex} />
          </div>
        </div>

        {/* Bottom: incident detail + incident list */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Current scrub detail */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>Scrub Detail</h3>
            <IncidentCard point={currentPoint} isActive={true} />
          </div>

          {/* All incidents */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>Incident Index</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {incidents.map((p, i) => {
                const typeColor = p.incident.type === "kill" ? RED : p.incident.type === "tamper" ? "#f59e0b" : p.incident.type === "ghost" ? BLUE : "#a78bfa";
                const isSelected = scrubIndex === p.t;
                return (
                  <button key={i} onClick={() => setScrubIndex(p.t)}
                    className="w-full text-left rounded-lg border px-3 py-2.5 transition-all space-y-1.5"
                    style={{ background: isSelected ? `${typeColor}0e` : "#0a0a0a", borderColor: isSelected ? `${typeColor}50` : "rgba(255,215,0,0.1)" }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: typeColor }} />
                        <span className="text-[10px] font-bold" style={{ color: isSelected ? typeColor : "rgba(255,215,0,0.8)" }}>
                          {p.incident.label}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono" style={{ color: "rgba(255,215,0,0.3)" }}>T{p.t}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px]" style={{ color: "rgba(255,215,0,0.4)" }}>
                        Drop: <span style={{ color: RED }}>{p.incident.drop}%</span>
                      </span>
                      {p.bricksStitched.map(b => (
                        <span key={b.id} className="text-[8px] px-1.5 py-0.5 rounded border"
                          style={{ background: `${b.color}10`, color: b.color, borderColor: `${b.color}30` }}>
                          {b.icon} {b.label}
                        </span>
                      ))}
                      {p.bricksStitched.length === 0 && (
                        <span className="text-[8px]" style={{ color: "rgba(255,215,0,0.2)" }}>Auto-heal</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="rounded-xl border p-4" style={{ background: "#0a0a0a", borderColor: "rgba(255,215,0,0.1)" }}>
          <div className="text-[9px] uppercase tracking-widest font-bold mb-3" style={{ color: "rgba(255,215,0,0.4)" }}>Chart Legend</div>
          <div className="flex flex-wrap gap-4 text-[9px]">
            {[
              { color: GOLD,     label: "Braid Integrity — real-time track" },
              { color: "rgba(255,215,0,0.4)", label: "Golden State Baseline — 100%" },
              { color: RED,      label: "Kill Sequence event" },
              { color: "#f59e0b",label: "Tamper injection event" },
              { color: "#a78bfa",label: "Corruption / drift event" },
              { color: BLUE,     label: "Ghost probe absorbed" },
            ].map((l, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.color }} />
                <span style={{ color: "rgba(255,215,0,0.5)" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}