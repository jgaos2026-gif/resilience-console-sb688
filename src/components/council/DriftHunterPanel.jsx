import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Radio, Activity, Zap
} from "lucide-react";
import moment from "moment";

const GOLD = "#C9A84C";
const DIM = "rgba(232,217,176,0.55)";
const BORDER = "rgba(201,168,76,0.18)";
const CARD = "hsl(220,18%,7%)";

// ── Drift radar canvas ─────────────────────────────────────────────────────────
function DriftRadar({ driftScore, nodes }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = Math.min(canvas.offsetWidth, canvas.offsetHeight) || 200;
    canvas.width = size * (window.devicePixelRatio || 1);
    canvas.height = size * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    const cx = size / 2, cy = size / 2, r = size * 0.42;

    const draw = () => {
      tRef.current += 0.015;
      const t = tRef.current;
      ctx.clearRect(0, 0, size, size);

      // Rings
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, r * (i / 4), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(201,168,76,${0.08 + i * 0.03})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Sweep line
      const sweepAngle = t * 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * r, cy + Math.sin(sweepAngle) * r);
      ctx.strokeStyle = `rgba(201,168,76,0.5)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Sweep glow arc
      ctx.beginPath();
      ctx.arc(cx, cy, r, sweepAngle - 0.6, sweepAngle);
      ctx.strokeStyle = "rgba(201,168,76,0.12)";
      ctx.lineWidth = 12;
      ctx.stroke();

      // Node blips
      nodes.forEach(n => {
        const angle = n.angle;
        const dist = n.dist * r;
        const nx = cx + Math.cos(angle) * dist;
        const ny = cy + Math.sin(angle) * dist;
        const drift = n.drift;
        const color = drift > 60 ? "#f87171" : drift > 30 ? "#fbbf24" : "#4ade80";
        const blipR = drift > 60 ? 5 : drift > 30 ? 4 : 3;

        // Fade in after sweep passes
        const sweepDiff = ((sweepAngle - angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        if (sweepDiff < 0.7) {
          ctx.beginPath();
          ctx.arc(nx, ny, blipR * 3, 0, Math.PI * 2);
          ctx.fillStyle = `${color}30`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(nx, ny, blipR, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        if (n.label) {
          ctx.fillStyle = color;
          ctx.font = "8px monospace";
          ctx.textAlign = "center";
          ctx.fillText(n.label, nx, ny - blipR - 2);
        }
      });

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = GOLD;
      ctx.fill();

      // Drift score label
      const scoreColor = driftScore > 60 ? "#f87171" : driftScore > 30 ? "#fbbf24" : "#4ade80";
      ctx.fillStyle = scoreColor;
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`DRIFT: ${driftScore}`, cx, size - 8);

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [driftScore, nodes]);

  return (
    <canvas ref={canvasRef} className="w-full rounded-xl"
      style={{ height: 220, background: "#000", maxWidth: 220, margin: "0 auto", display: "block" }} />
  );
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Build radar nodes from drift detections ────────────────────────────────────
function buildRadarNodes(detections) {
  return detections.map((d, i) => ({
    angle: (i / Math.max(detections.length, 1)) * Math.PI * 2 + 0.3,
    dist:  0.2 + (d.drift / 100) * 0.75,
    drift: d.drift,
    label: d.nodeId,
  }));
}

export default function DriftHunterPanel({ coreState, patchCore }) {
  const [scanning, setScanning] = useState(false);
  const [detections, setDetections] = useState([]);
  const [scanLog, setScanLog] = useState([]);
  const [remediated, setRemediated] = useState([]);
  const [scanCycles, setScanCycles] = useState(0);
  const [continuousMode, setContinuousMode] = useState(false);
  const continuousRef = useRef(null);

  const addLog = useCallback((msg, color = DIM) => {
    setScanLog(p => [{ msg, color, ts: Date.now() }, ...p].slice(0, 50));
  }, []);

  // ── Single scan ───────────────────────────────────────────────────────────────
  const runScan = useCallback(async () => {
    if (scanning) return;
    setScanning(true);
    setScanCycles(c => c + 1);
    addLog("Drift Hunter scan initiated — sweeping all braid nodes…", GOLD);

    await delay(600);

    // Generate drift detections probabilistically
    const nodeCount = 8 + Math.floor(Math.random() * 6);
    const newDetections = [];
    for (let i = 0; i < nodeCount; i++) {
      const drift = Math.floor(Math.random() * 80) + Math.floor(coreState.driftScore * 0.3);
      newDetections.push({
        nodeId: `N${String(i).padStart(2, "0")}`,
        drift: Math.min(100, drift),
        ts: Date.now(),
        status: drift > 60 ? "CRITICAL" : drift > 30 ? "DEGRADED" : "NOMINAL",
      });
    }

    const critCount = newDetections.filter(d => d.status === "CRITICAL").length;
    const degraded  = newDetections.filter(d => d.status === "DEGRADED").length;
    const nominal   = newDetections.filter(d => d.status === "NOMINAL").length;

    setDetections(newDetections);

    // Update global drift score (average of critical nodes)
    const avgDrift = Math.floor(newDetections.reduce((a, b) => a + b.drift, 0) / newDetections.length);
    patchCore({ driftScore: avgDrift });

    addLog(`Scan complete — ${nodeCount} nodes: ${nominal} NOMINAL, ${degraded} DEGRADED, ${critCount} CRITICAL`, GOLD);
    if (critCount > 0) addLog(`⚠ ${critCount} CRITICAL node(s) detected — consider remediation`, "#f87171");

    setScanning(false);
  }, [scanning, coreState.driftScore, patchCore, addLog]);

  // ── Remediate all critical nodes ──────────────────────────────────────────────
  const remediate = useCallback(async () => {
    const critNodes = detections.filter(d => d.status === "CRITICAL");
    if (critNodes.length === 0) { addLog("No critical nodes to remediate.", DIM); return; }

    addLog(`Remediating ${critNodes.length} critical node(s)…`, "#a78bfa");
    for (const node of critNodes) {
      await delay(300);
      addLog(`✓ ${node.nodeId} drift corrected: ${node.drift} → 0`, "#4ade80");
      setRemediated(p => [...p, { ...node, remediatedTs: Date.now() }]);
    }

    const newDetections = detections.map(d => d.status === "CRITICAL" ? { ...d, drift: 0, status: "NOMINAL" } : d);
    setDetections(newDetections);
    const avgDrift = Math.floor(newDetections.reduce((a, b) => a + b.drift, 0) / Math.max(newDetections.length, 1));
    patchCore({ driftScore: avgDrift });
    addLog("Remediation complete — all critical nodes reset to nominal", "#4ade80");
  }, [detections, patchCore, addLog]);

  // ── Continuous mode ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (continuousMode) {
      continuousRef.current = setInterval(() => {
        runScan();
      }, 5000);
    } else {
      clearInterval(continuousRef.current);
    }
    return () => clearInterval(continuousRef.current);
  }, [continuousMode, runScan]);

  const radarNodes = buildRadarNodes(detections);

  return (
    <div className="space-y-6">
      {/* Header strip */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5" style={{ color: GOLD }} />
          <h2 className="text-base font-bold font-cinzel" style={{ color: GOLD }}>Drift Hunter Node</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="text-[9px] border"
            style={{ background: coreState.driftScore > 60 ? "rgba(239,68,68,0.1)" : coreState.driftScore > 30 ? "rgba(251,191,36,0.1)" : "rgba(34,197,94,0.1)",
                     color: coreState.driftScore > 60 ? "#f87171" : coreState.driftScore > 30 ? "#fbbf24" : "#4ade80",
                     borderColor: coreState.driftScore > 60 ? "rgba(239,68,68,0.3)" : coreState.driftScore > 30 ? "rgba(251,191,36,0.3)" : "rgba(34,197,94,0.3)" }}>
            Drift Score: {coreState.driftScore}
          </Badge>
          <Badge className="text-[9px] border"
            style={{ background: "rgba(201,168,76,0.08)", color: GOLD, borderColor: "rgba(201,168,76,0.25)" }}>
            {scanCycles} scan cycle{scanCycles !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Radar + controls */}
        <div className="space-y-4">
          <div className="rounded-xl border p-4 space-y-3" style={{ background: CARD, borderColor: BORDER }}>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: GOLD }}>Drift Radar</h3>
            <DriftRadar driftScore={coreState.driftScore} nodes={radarNodes} />
            <div className="flex gap-2 text-[9px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block bg-green-400" />Nominal</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block bg-amber-400" />Degraded</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block bg-red-400" />Critical</span>
            </div>
          </div>

          <div className="rounded-xl border p-4 space-y-2" style={{ background: CARD, borderColor: BORDER }}>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: GOLD }}>Scan Controls</h3>
            <Button className="w-full text-xs font-bold h-9"
              style={{ background: "rgba(201,168,76,0.1)", color: GOLD, border: `1px solid rgba(201,168,76,0.3)` }}
              disabled={scanning} onClick={runScan}>
              <Radio className="w-3.5 h-3.5 mr-2" />
              {scanning ? "Scanning…" : "Run Drift Scan"}
            </Button>
            <Button className="w-full text-xs font-bold h-9"
              style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}
              onClick={remediate}>
              <Zap className="w-3.5 h-3.5 mr-2" />
              Remediate Critical Nodes
            </Button>
            <button
              onClick={() => setContinuousMode(m => !m)}
              className="w-full text-xs font-bold h-9 rounded-md border transition-all flex items-center justify-center gap-2"
              style={continuousMode
                ? { background: "rgba(34,197,94,0.1)", color: "#4ade80", borderColor: "rgba(34,197,94,0.3)" }
                : { background: "rgba(255,255,255,0.03)", color: DIM, borderColor: "rgba(255,255,255,0.1)" }}>
              <Activity className="w-3.5 h-3.5" />
              {continuousMode ? "Stop Continuous Scan" : "Start Continuous Scan (5s)"}
            </button>
          </div>
        </div>

        {/* Center — Detection list */}
        <div className="space-y-4">
          <div className="rounded-xl border p-4 space-y-3" style={{ background: CARD, borderColor: BORDER }}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: GOLD }}>Node Detections</h3>
              {detections.length > 0 && (
                <div className="flex gap-2 text-[9px]">
                  <span className="text-green-400 font-bold">{detections.filter(d => d.status === "NOMINAL").length}N</span>
                  <span className="text-amber-400 font-bold">{detections.filter(d => d.status === "DEGRADED").length}D</span>
                  <span className="text-red-400 font-bold">{detections.filter(d => d.status === "CRITICAL").length}C</span>
                </div>
              )}
            </div>
            {detections.length === 0 ? (
              <div className="text-[10px] text-center py-8" style={{ color: DIM }}>
                Run a scan to detect node drift states.
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-1">
                {[...detections].sort((a, b) => b.drift - a.drift).map((d, i) => {
                  const color = d.status === "CRITICAL" ? "#f87171" : d.status === "DEGRADED" ? "#fbbf24" : "#4ade80";
                  const bg = d.status === "CRITICAL" ? "rgba(239,68,68,0.06)" : d.status === "DEGRADED" ? "rgba(251,191,36,0.06)" : "transparent";
                  return (
                    <div key={i} className="flex items-center justify-between px-2 py-1.5 rounded text-[10px] border"
                      style={{ background: bg, borderColor: `${color}20` }}>
                      <span className="font-mono font-bold" style={{ color }}>{d.nodeId}</span>
                      <div className="flex-1 mx-3 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div className="h-full rounded-full" style={{ width: `${d.drift}%`, background: color }} />
                      </div>
                      <span className="font-mono font-bold w-8 text-right" style={{ color }}>{d.drift}</span>
                      <Badge className="ml-2 text-[7px] border font-bold"
                        style={{ background: `${color}12`, color, borderColor: `${color}30` }}>
                        {d.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Stats */}
          {detections.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Peak Drift", value: Math.max(...detections.map(d => d.drift)), color: "#f87171" },
                { label: "Avg Drift",  value: Math.floor(detections.reduce((a, b) => a + b.drift, 0) / detections.length), color: GOLD },
                { label: "Nominal",    value: detections.filter(d => d.status === "NOMINAL").length, color: "#4ade80" },
                { label: "Critical",   value: detections.filter(d => d.status === "CRITICAL").length, color: "#f87171" },
              ].map((s, i) => (
                <div key={i} className="rounded-lg border p-3 text-center"
                  style={{ background: CARD, borderColor: BORDER }}>
                  <div className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[9px] mt-0.5" style={{ color: DIM }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — Scan log + remediation history */}
        <div className="space-y-4">
          <div className="rounded-xl border p-4 space-y-2" style={{ background: CARD, borderColor: BORDER }}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: GOLD }}>Scan Log</h3>
              {scanLog.length > 0 && (
                <Button size="sm" variant="outline" className="text-[9px] h-6 px-2 border-border text-muted-foreground"
                  onClick={() => setScanLog([])}>Clear</Button>
              )}
            </div>
            {scanLog.length === 0 ? (
              <div className="text-[10px] text-center py-6" style={{ color: DIM }}>No scan events yet.</div>
            ) : (
              <div className="max-h-52 overflow-y-auto space-y-1 font-mono">
                {scanLog.map((e, i) => (
                  <div key={i} className="text-[10px] flex items-start gap-2">
                    <span className="text-muted-foreground flex-shrink-0">{moment(e.ts).format("HH:mm:ss")}</span>
                    <span style={{ color: e.color || DIM }}>{e.msg}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Remediation history */}
          {remediated.length > 0 && (
            <div className="rounded-xl border p-4 space-y-2" style={{ background: CARD, borderColor: BORDER }}>
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "#4ade80" }}>Remediation History</h3>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {[...remediated].reverse().map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-[9px] font-mono py-1 border-b last:border-0"
                    style={{ borderColor: "rgba(255,255,255,0.04)", color: DIM }}>
                    <span className="text-green-400 font-bold">{r.nodeId}</span>
                    <span>Drift {r.drift} → 0</span>
                    <span>{moment(r.remediatedTs).format("HH:mm:ss")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}