import React, { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, RefreshCcw, Activity, Globe, DollarSign, Cpu, AlertTriangle, CheckCircle2 } from "lucide-react";
import { alertAVA } from "@/lib/avaVoice";
import OASISVoiceBridge from "@/components/jga/OASISVoiceBridge";

const GOLD = "#C9A84C";

const SECTORS = [
  { id: "aerospace",  label: "Aerospace / SpaceX",    icon: Globe,       color: "#60a5fa", freq: 220, desc: "Sovereign runtime integrity sweep — orbital handoff verified" },
  { id: "fintech",    label: "Fintech / Banking",      icon: DollarSign,  color: "#4ade80", freq: 330, desc: "Ledger hash validation — all payment chains certified" },
  { id: "healthcare", label: "Healthcare / HIPAA",     icon: Activity,    color: "#f472b6", freq: 180, desc: "Compliance audit complete — data isolation confirmed" },
  { id: "defense",    label: "Defense / Gov Systems",  icon: Shield,      color: "#fb923c", freq: 110, desc: "Ghost checkpoint sealed — quarantine walls active" },
  { id: "logistics",  label: "Logistics / Supply",     icon: RefreshCcw,  color: "#a78bfa", freq: 260, desc: "State rollback initiated — chain-of-custody restored" },
  { id: "enterprise", label: "Enterprise OS",          icon: Cpu,         color: GOLD,      freq: 440, desc: "Memory braid verified — brick set re-certified" },
];

function playTone(freq, duration = 0.18, type = "sine") {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
    setTimeout(() => ctx.close(), 500);
  } catch (e) {}
}

function playHeartbeat() {
  playTone(60, 0.08, "square");
  setTimeout(() => playTone(90, 0.06, "square"), 100);
}

function HeartbeatLine({ bpm = 72, color = GOLD }) {
  const canvasRef = useRef(null);
  const phaseRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.offsetWidth || 300;
    const H = 48;
    canvas.width = W;
    canvas.height = H;

    const speed = (bpm / 60) * 2.5;

    function ekg(x, phase) {
      const t = ((x / W) * 6 + phase) % 1;
      if (t < 0.35) return 0;
      if (t < 0.4) return (t - 0.35) / 0.05 * -6;
      if (t < 0.45) return ((t - 0.4) / 0.05) * 28;
      if (t < 0.5) return 28 - ((t - 0.45) / 0.05) * 34;
      if (t < 0.55) return -6 + ((t - 0.5) / 0.05) * 10;
      if (t < 0.62) return 4 - ((t - 0.55) / 0.07) * 4;
      return 0;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const y = H / 2 - ekg(x, phaseRef.current);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.stroke();
      phaseRef.current = (phaseRef.current + speed * 0.004) % 1;
      rafRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [bpm, color]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: 48 }} />;
}

function RecoveryLog({ entries }) {
  return (
    <div className="max-h-36 overflow-y-auto space-y-0.5 font-mono">
      {entries.length === 0 ? (
        <div className="text-[10px] text-muted-foreground text-center py-4">Awaiting recovery trigger…</div>
      ) : entries.map((e, i) => (
        <div key={i} className="flex items-start gap-2 text-[10px] py-0.5">
          <span className="text-muted-foreground flex-shrink-0">{e.ts}</span>
          <span style={{ color: e.color }}>{e.msg}</span>
        </div>
      ))}
    </div>
  );
}

export default function RecoveryCommandPanel() {
  const [activeSector, setActiveSector] = useState(null);
  const [runningIds, setRunningIds] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [log, setLog] = useState([]);
  const [globalBeat, setGlobalBeat] = useState(true);

  const selectedSectors = SECTORS.filter(s => selectedIds.includes(s.id));
  const isRunningAny = runningIds.length > 0;

  // Global heartbeat sound
  useEffect(() => {
    if (!globalBeat) return;
    const interval = setInterval(() => playHeartbeat(), 1600);
    return () => clearInterval(interval);
  }, [globalBeat]);

  const addLog = (msg, color = "rgba(232,217,176,0.6)") => {
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLog(p => [{ msg, color, ts }, ...p].slice(0, 60));
  };

  const toggleSector = (id) => {
    if (isRunningAny) return;
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const recoverySteps = (sector) => [
    { msg: `▶ [${sector.label}] RECOVERY SEQUENCE INITIATED`, color: sector.color, delay: 0 },
    { msg: `  → Scanning sector state for anomalies…`, color: "#fbbf24", delay: 400 },
    { msg: `  → Quarantine walls raised — isolating bad state…`, color: "#f87171", delay: 900 },
    { msg: `  → Ghost checkpoint located — clean state confirmed…`, color: "#a78bfa", delay: 1500 },
    { msg: `  → Rolling back to verified checkpoint…`, color: "#fbbf24", delay: 2100 },
    { msg: `  → Re-verifying brick set — triple mark applied…`, color: "#60a5fa", delay: 2800 },
    { msg: `  → Ledger updated — append-only entry sealed…`, color: "#4ade80", delay: 3400 },
    { msg: `✓ [${sector.label}] RECOVERY COMPLETE — SECTOR CERTIFIED`, color: "#4ade80", delay: 3900 },
  ];

  const triggerBulkRecovery = () => {
    if (isRunningAny || selectedSectors.length === 0) return;
    const ids = selectedSectors.map(s => s.id);
    setRunningIds(ids);
    setActiveSector({
      label: selectedSectors.length === 1 ? selectedSectors[0].label : `${selectedSectors.length} SECTORS`,
      color: selectedSectors.length === 1 ? selectedSectors[0].color : GOLD,
      desc: selectedSectors.length === 1 ? selectedSectors[0].desc : "Bulk recovery sequence running across selected sectors simultaneously",
    });
    addLog(`⚡ OASIS LINK ACTIVE — BULK RECOVERY ARMED — ${selectedSectors.length} sector(s) selected`, GOLD);
    alertAVA("armed", `Bulk recovery is active across ${selectedSectors.length} selected sector${selectedSectors.length === 1 ? "" : "s"}. Phoenix sequence standing by.`);

    selectedSectors.forEach((sector) => {
      playTone(sector.freq, 0.25, "sawtooth");
      recoverySteps(sector).forEach((step) => {
        setTimeout(() => {
          addLog(step.msg, step.color);
          if (step.delay === 900) {
            playTone(sector.freq * 0.8, 0.12);
            alertAVA("quarantine", `${sector.label} is isolated.`);
          }
          if (step.delay === 1500) alertAVA("checkpoint", `${sector.label} has a clean rollback point.`);
          if (step.delay === 3900) playTone(sector.freq * 1.2, 0.28, "triangle");
        }, step.delay);
      });
    });

    setTimeout(() => {
      setRunningIds([]);
      setSelectedIds([]);
      addLog(`✓ OASIS CONFIRMED — BULK RECOVERY COMPLETE — ${selectedSectors.length} sector(s) certified`, "#4ade80");
      alertAVA("certified", `${selectedSectors.length} sector${selectedSectors.length === 1 ? "" : "s"} certified.`);
    }, 4300);
  };

  return (
    <div className="px-4 sm:px-6 py-6">
      <div className="rounded-2xl border-2 overflow-hidden"
        style={{ borderColor: `${GOLD}30`, background: "#080808", boxShadow: `0 0 40px ${GOLD}08` }}>

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3 border-b"
          style={{ background: "linear-gradient(135deg, #0e0c00, #0a0a0a)", borderColor: `${GOLD}20` }}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
            <span className="text-xs font-black font-cinzel tracking-widest uppercase" style={{ color: GOLD }}>
              Recovery Command Center
            </span>
            <Badge className="text-[8px] border" style={{ background: "rgba(74,222,128,0.08)", color: "#4ade80", borderColor: "rgba(74,222,128,0.25)" }}>
              ARMED
            </Badge>
          </div>
          <button
            className="text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-lg border transition"
            style={{ color: globalBeat ? "#f87171" : "rgba(255,255,255,0.3)", borderColor: globalBeat ? "rgba(248,113,113,0.3)" : "rgba(255,255,255,0.1)", background: globalBeat ? "rgba(248,113,113,0.06)" : "transparent" }}
            onClick={() => setGlobalBeat(b => !b)}>
            {globalBeat ? "♥ PULSE ON" : "○ PULSE OFF"}
          </button>
        </div>

        {/* Heartbeat Monitor */}
        <div className="px-6 py-3 border-b" style={{ borderColor: `${GOLD}10` }}>
          <div className="text-[8px] uppercase tracking-widest font-bold mb-1" style={{ color: `${GOLD}50` }}>
            System Heartbeat — {activeSector ? activeSector.label : "All Sectors Nominal"}
          </div>
          <HeartbeatLine bpm={isRunningAny ? 110 : 72} color={activeSector ? activeSector.color : GOLD} />
        </div>

        {/* Sector Buttons */}
        <div className="p-6 space-y-4">
          <div className="text-[9px] uppercase tracking-[3px] font-bold text-center mb-4" style={{ color: `${GOLD}40` }}>
            Select Multiple Sectors · Trigger Bulk Recovery
          </div>

          <OASISVoiceBridge />

          <div className="rounded-xl border p-3 flex flex-wrap items-center justify-between gap-3" style={{ background: "rgba(0,0,0,0.45)", borderColor: `${GOLD}18` }}>
            <div className="text-[10px] font-bold" style={{ color: selectedIds.length ? GOLD : "rgba(255,255,255,0.35)" }}>
              {selectedIds.length} sector(s) selected
            </div>
            <div className="flex flex-wrap gap-2">
              <button disabled={isRunningAny} onClick={() => setSelectedIds(SECTORS.map(s => s.id))}
                className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border disabled:opacity-30"
                style={{ color: GOLD, borderColor: `${GOLD}35`, background: `${GOLD}08` }}>
                Select All
              </button>
              <button disabled={isRunningAny || selectedIds.length === 0} onClick={() => setSelectedIds([])}
                className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border disabled:opacity-30"
                style={{ color: "rgba(255,255,255,0.55)", borderColor: "rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.03)" }}>
                Clear
              </button>
              <button disabled={isRunningAny || selectedIds.length === 0} onClick={triggerBulkRecovery}
                className="text-[9px] font-black uppercase tracking-widest px-4 py-1 rounded-lg border disabled:opacity-30"
                style={{ color: "#080808", borderColor: `${GOLD}60`, background: `linear-gradient(135deg, ${GOLD}, #8a6018)` }}>
                Recover Selected
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SECTORS.map(s => {
              const Icon = s.icon;
              const isRunning = runningIds.includes(s.id);
              const isSelected = selectedIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  disabled={isRunningAny && !isRunning}
                  onClick={() => toggleSector(s.id)}
                  className="relative overflow-hidden rounded-xl border p-4 text-left transition-all group"
                  style={{
                    background: isRunning ? `${s.color}14` : isSelected ? `${s.color}10` : "rgba(0,0,0,0.5)",
                    borderColor: isRunning || isSelected ? s.color : `${s.color}25`,
                    boxShadow: isRunning ? `0 0 20px ${s.color}30, inset 0 0 20px ${s.color}06` : isSelected ? `0 0 14px ${s.color}18` : "none",
                    opacity: isRunningAny && !isRunning ? 0.3 : 1,
                    cursor: isRunningAny && !isRunning ? "not-allowed" : "pointer",
                    transform: isRunning ? "scale(1.02)" : "scale(1)",
                  }}>
                  {/* Scan line animation when running */}
                  {isRunning && (
                    <div className="absolute inset-x-0 top-0 h-0.5 animate-bounce"
                      style={{ background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`, animationDuration: "0.8s" }} />
                  )}
                  <div className="absolute top-2 right-2 w-4 h-4 rounded border flex items-center justify-center"
                    style={{ borderColor: isSelected || isRunning ? s.color : `${s.color}30`, background: isSelected || isRunning ? `${s.color}18` : "rgba(0,0,0,0.3)" }}>
                    {(isSelected || isRunning) && <CheckCircle2 className="w-3 h-3" style={{ color: s.color }} />}
                  </div>
                  <div className="flex items-center gap-2 mb-2 pr-5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${s.color}12`, border: `1px solid ${s.color}30` }}>
                      <Icon style={{ color: s.color, width: 14, height: 14 }} />
                    </div>
                    {isRunning && (
                      <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ background: s.color }} />
                    )}
                  </div>
                  <div className="text-[10px] font-black leading-tight" style={{ color: isRunning || isSelected ? s.color : "rgba(255,255,255,0.7)" }}>
                    {s.label}
                  </div>
                  <div className="text-[8px] mt-1 leading-relaxed" style={{ color: isRunning || isSelected ? `${s.color}80` : "rgba(255,255,255,0.25)" }}>
                    {isRunning ? "● RECOVERING…" : isSelected ? "SELECTED" : "TAP TO SELECT"}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active recovery status */}
          {activeSector && isRunningAny && (
            <div className="rounded-xl border px-4 py-3 flex items-center gap-3"
              style={{ background: `${activeSector.color}06`, borderColor: `${activeSector.color}30` }}>
              <div className="w-3 h-3 rounded-full animate-pulse flex-shrink-0" style={{ background: activeSector.color }} />
              <div>
                <div className="text-[10px] font-black" style={{ color: activeSector.color }}>
                  BULK RECOVERY IN PROGRESS: {activeSector.label}
                </div>
                <div className="text-[9px] text-muted-foreground">{activeSector.desc}</div>
              </div>
            </div>
          )}
          {activeSector && !isRunningAny && (
            <div className="rounded-xl border px-4 py-3 flex items-center gap-3"
              style={{ background: "rgba(74,222,128,0.05)", borderColor: "rgba(74,222,128,0.25)" }}>
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-400" />
              <div className="text-[10px] font-black text-green-400">
                ✓ {activeSector.label} — RECOVERY CERTIFIED · TRUSTED STATE RESTORED
              </div>
            </div>
          )}

          {/* Log */}
          <div className="rounded-xl border p-4 space-y-2" style={{ background: "rgba(0,0,0,0.6)", borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="text-[8px] font-black uppercase tracking-widest" style={{ color: `${GOLD}50` }}>Recovery Log</div>
            <RecoveryLog entries={log} />
          </div>
        </div>
      </div>
    </div>
  );
}