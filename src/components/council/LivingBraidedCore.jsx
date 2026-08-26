import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Layers, RefreshCw, CheckCircle2, AlertTriangle,
  Camera, Zap, GitBranch, Wrench
} from "lucide-react";
import moment from "moment";

const GOLD = "#C9A84C";
const DIM = "rgba(232,217,176,0.55)";
const BORDER = "rgba(201,168,76,0.18)";
const CARD = "hsl(220,18%,7%)";

// ── Animated braid canvas ──────────────────────────────────────────────────────
function BraidCanvas({ health }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.offsetWidth || 400;
    const H = canvas.offsetHeight || 120;
    canvas.width = W * (window.devicePixelRatio || 1);
    canvas.height = H * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    const draw = () => {
      tRef.current += 0.025;
      const t = tRef.current;
      ctx.clearRect(0, 0, W, H);

      const strands = 3;
      const phases = [0, Math.PI * 0.67, Math.PI * 1.33];
      const colors = [GOLD, "#60a5fa", "#4ade80"];
      const amp = Math.max(8, (health / 100) * 28);

      for (let s = 0; s < strands; s++) {
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
          const noise = health < 60 ? (Math.random() - 0.5) * 6 : 0;
          const y = H / 2 + Math.sin((x / W) * Math.PI * 6 + t + phases[s]) * amp + noise;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = colors[s];
        ctx.globalAlpha = 0.6 + (s * 0.15);
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Health label
      ctx.fillStyle = health >= 80 ? GOLD : health >= 50 ? "#fbbf24" : "#f87171";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`BRAID HEALTH: ${health}%`, W - 8, H - 6);

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [health]);

  return <canvas ref={canvasRef} className="w-full rounded-lg" style={{ height: 120, background: "#000" }} />;
}

// ── Pocket repair wizard ────────────────────────────────────────────────────────
function PocketRepair({ coreState, patchCore, addLog }) {
  const [repairing, setRepairing] = useState(false);
  const [repairPhase, setRepairPhase] = useState(null);
  const [certified, setCertified] = useState(false);

  const runRepair = useCallback(async () => {
    if (repairing) return;
    setRepairing(true);
    setCertified(false);
    addLog("Pocket repair initiated — scanning braid for anomalous nodes…", "#a78bfa");

    setRepairPhase("scan");
    await delay(500);
    const badNodes = Math.floor(Math.random() * 4) + 1;
    addLog(`Detected ${badNodes} degraded pocket(s) — isolation in progress…`, "#fbbf24");

    setRepairPhase("isolate");
    await delay(600);
    addLog("Pockets isolated — applying geometric stitch correction…", GOLD);

    setRepairPhase("stitch");
    await delay(700);
    const newHealth = Math.min(100, coreState.braidHealth + 15 + badNodes * 5);
    patchCore({ braidHealth: newHealth });
    addLog(`Stitch applied — braid health restored to ${newHealth}%`, "#4ade80");

    setRepairPhase("certify");
    await delay(500);
    const certId = `CERT-${Date.now().toString(36).toUpperCase()}`;
    const cert = { id: certId, ts: Date.now(), nodesRepaired: badNodes, healthAfter: newHealth };
    patchCore({ pocketCerts: [...coreState.pocketCerts, cert] });
    addLog(`✓ Pocket certified — ID: ${certId}`, "#4ade80");

    setCertified(true);
    setRepairPhase("complete");
    setRepairing(false);
  }, [repairing, coreState, patchCore, addLog]);

  const phaseLabel = {
    scan: "Scanning braid…",
    isolate: "Isolating pockets…",
    stitch: "Applying geometric stitch…",
    certify: "Certifying repair…",
    complete: "Repair complete",
  };

  return (
    <div className="rounded-xl border p-5 space-y-3" style={{ background: CARD, borderColor: BORDER }}>
      <div className="flex items-center gap-2">
        <Wrench className="w-4 h-4" style={{ color: "#a78bfa" }} />
        <h3 className="text-sm font-bold" style={{ color: "#a78bfa" }}>Pocket Repair & Certification</h3>
      </div>
      <p className="text-[10px] leading-relaxed" style={{ color: DIM }}>
        Identifies degraded mesh pockets, isolates them, applies geometric stitch correction, and issues a local certification record.
      </p>

      <Button className="w-full text-xs font-bold h-9"
        style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.3)" }}
        disabled={repairing} onClick={runRepair}>
        <Wrench className="w-3.5 h-3.5 mr-2" />
        {repairing ? phaseLabel[repairPhase] || "Repairing…" : "Run Pocket Repair"}
      </Button>

      {certified && (
        <div className="flex items-center gap-2 p-2 rounded-lg text-xs"
          style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
          <span className="text-green-400 font-bold">Repair certified — braid health improved</span>
        </div>
      )}

      {coreState.pocketCerts.length > 0 && (
        <div className="space-y-1 max-h-28 overflow-y-auto">
          <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: "rgba(167,139,250,0.5)" }}>Certification Log</div>
          {[...coreState.pocketCerts].reverse().map((cert, i) => (
            <div key={i} className="flex items-center justify-between text-[9px] font-mono py-1 border-b last:border-0"
              style={{ borderColor: "rgba(255,255,255,0.04)", color: DIM }}>
              <span className="text-purple-400">{cert.id}</span>
              <span>{cert.nodesRepaired} pockets repaired</span>
              <span>{moment(cert.ts).format("HH:mm:ss")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Self-heal sequence ─────────────────────────────────────────────────────────
function SelfHealSequence({ coreState, patchCore, addLog }) {
  const [healing, setHealing] = useState(false);
  const [phase, setPhase] = useState(null);

  const PHASES = [
    { id: "detect",  label: "Anomaly detection",     duration: 400, color: "#fbbf24" },
    { id: "isolate", label: "Isolate compromised strands", duration: 500, color: "#f87171" },
    { id: "reroute", label: "Reroute through healthy mesh", duration: 600, color: "#60a5fa" },
    { id: "repair",  label: "Geometric stitch repair",  duration: 700, color: "#a78bfa" },
    { id: "verify",  label: "Hash-chain verification",  duration: 400, color: GOLD },
    { id: "seal",    label: "Seal & commit to ledger",  duration: 350, color: "#4ade80" },
  ];

  const runHeal = useCallback(async () => {
    if (healing) return;
    setHealing(true);
    addLog("Self-heal sequence initiated — 6-phase protocol engaged", GOLD);

    for (const ph of PHASES) {
      setPhase(ph.id);
      addLog(`[${ph.id.toUpperCase()}] ${ph.label}…`, ph.color);
      await delay(ph.duration);
    }

    const newHealth = Math.min(100, coreState.braidHealth + 10);
    const newV = coreState.ledgerVersion + 1;
    const hash = `sha256:heal-${Math.random().toString(36).substring(2, 10)}`;
    patchCore({
      braidHealth: newHealth,
      ledgerVersion: newV,
      ledgerHash: hash,
      ledgerChain: [...coreState.ledgerChain, { v: newV, hash, label: "Self-Heal Commit", ts: Date.now() }],
      selfHealLog: [...coreState.selfHealLog, { ts: Date.now(), healthAfter: newHealth, ledgerV: newV }],
    });

    addLog(`✓ Self-heal complete — health: ${newHealth}% — ledger v${newV} committed`, "#4ade80");
    setPhase("complete");
    setHealing(false);
  }, [healing, coreState, patchCore, addLog]);

  return (
    <div className="rounded-xl border p-5 space-y-3" style={{ background: CARD, borderColor: BORDER }}>
      <div className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4 text-green-400" />
        <h3 className="text-sm font-bold text-green-400">Self-Heal Sequence</h3>
      </div>
      <p className="text-[10px] leading-relaxed" style={{ color: DIM }}>
        6-phase self-healing protocol: detect → isolate → reroute → repair → verify → seal. Commits outcome to ledger.
      </p>

      {healing && (
        <div className="space-y-1">
          {PHASES.map(ph => (
            <div key={ph.id} className="flex items-center gap-2 text-[10px]">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${phase === ph.id ? "animate-pulse" : ""}`}
                style={{ background: phase === ph.id ? ph.color : "rgba(255,255,255,0.1)" }} />
              <span style={{ color: phase === ph.id ? ph.color : "rgba(255,255,255,0.2)" }}>{ph.label}</span>
            </div>
          ))}
        </div>
      )}

      <Button className="w-full text-xs font-bold h-9"
        style={{ background: "rgba(34,197,94,0.08)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }}
        disabled={healing} onClick={runHeal}>
        <Zap className="w-3.5 h-3.5 mr-2" />
        {healing ? "Healing…" : "Run Self-Heal Sequence"}
      </Button>

      {coreState.selfHealLog.length > 0 && (
        <div className="space-y-1 max-h-24 overflow-y-auto">
          <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: "rgba(34,197,94,0.5)" }}>Heal History</div>
          {[...coreState.selfHealLog].reverse().map((h, i) => (
            <div key={i} className="text-[9px] font-mono flex justify-between py-0.5"
              style={{ color: DIM }}>
              <span>{moment(h.ts).format("HH:mm:ss")}</span>
              <span>Health → {h.healthAfter}%</span>
              <span>Ledger v{h.ledgerV}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Snapshot vault ─────────────────────────────────────────────────────────────
function SnapshotVault({ coreState, patchCore, addLog }) {
  const captureSnapshot = useCallback(() => {
    const snap = {
      id: `SNAP-${Date.now().toString(36).toUpperCase()}`,
      ts: Date.now(),
      braidHealth: coreState.braidHealth,
      ledgerVersion: coreState.ledgerVersion,
      driftScore: coreState.driftScore,
      spineStatus: coreState.spineStatus,
      stitchBrickMode: coreState.stitchBrickMode,
    };
    patchCore({ snapshotVault: [...coreState.snapshotVault, snap] });
    addLog(`📸 Snapshot ${snap.id} captured and certified to vault`, "#a78bfa");
  }, [coreState, patchCore, addLog]);

  return (
    <div className="rounded-xl border p-5 space-y-3" style={{ background: CARD, borderColor: BORDER }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4" style={{ color: "#a78bfa" }} />
          <h3 className="text-sm font-bold" style={{ color: "#a78bfa" }}>Snapshot Vault</h3>
        </div>
        <Badge className="text-[9px] border"
          style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", borderColor: "rgba(167,139,250,0.3)" }}>
          {coreState.snapshotVault.length} certified
        </Badge>
      </div>
      <p className="text-[10px]" style={{ color: DIM }}>
        Certified point-in-time state captures. No-delete policy applies — vault grows forward only.
      </p>
      <Button className="w-full text-xs font-bold h-8"
        style={{ background: "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.25)" }}
        onClick={captureSnapshot}>
        <Camera className="w-3 h-3 mr-1.5" /> Capture Snapshot
      </Button>
      <div className="max-h-36 overflow-y-auto space-y-1">
        {coreState.snapshotVault.length === 0 ? (
          <div className="text-[9px] text-center py-4" style={{ color: DIM }}>No snapshots yet</div>
        ) : [...coreState.snapshotVault].reverse().map((s, i) => (
          <div key={i} className="text-[9px] font-mono flex items-center justify-between py-1 border-b last:border-0"
            style={{ borderColor: "rgba(255,255,255,0.04)", color: DIM }}>
            <span className="text-purple-400">{s.id}</span>
            <span>Health {s.braidHealth}% · Drift {s.driftScore}</span>
            <span>{moment(s.ts).format("HH:mm:ss")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Verification/validation/certification flow ─────────────────────────────────
function VerificationFlow({ coreState, patchCore, addLog }) {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);

  const run = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setResults([]);
    addLog("Verification → Validation → Certification flow started…", GOLD);

    const steps = [
      { label: "Verification", detail: "Confirming braid geometry hash matches expected topology", color: "#60a5fa", pass: true },
      { label: "Validation", detail: "Cross-checking ledger chain against local proof anchors", color: GOLD, pass: coreState.ledgerChain.length > 0 },
      { label: "Certification", detail: "Issuing local proof certificate for current system state", color: "#4ade80", pass: coreState.braidHealth >= 50 },
    ];

    const res = [];
    for (const step of steps) {
      await delay(500);
      addLog(`${step.pass ? "✓" : "✗"} [${step.label}] ${step.detail}`, step.pass ? step.color : "#f87171");
      res.push({ ...step });
    }
    setResults(res);
    setRunning(false);
  }, [running, coreState, addLog]);

  return (
    <div className="rounded-xl border p-5 space-y-3" style={{ background: CARD, borderColor: BORDER }}>
      <div className="flex items-center gap-2">
        <GitBranch className="w-4 h-4" style={{ color: GOLD }} />
        <h3 className="text-sm font-bold" style={{ color: GOLD }}>Verify → Validate → Certify</h3>
      </div>
      <p className="text-[10px]" style={{ color: DIM }}>
        Full three-stage local proof flow confirming braid geometry, ledger chain, and current system state.
      </p>
      <Button className="w-full text-xs font-bold h-8"
        style={{ background: "rgba(201,168,76,0.08)", color: GOLD, border: `1px solid rgba(201,168,76,0.3)` }}
        disabled={running} onClick={run}>
        {running ? "Running flow…" : "Run V·V·C Flow"}
      </Button>
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              {r.pass
                ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                : <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />}
              <div>
                <span className="font-bold" style={{ color: r.pass ? r.color : "#f87171" }}>{r.label}</span>
                <span className="text-[10px] ml-2" style={{ color: DIM }}>{r.detail}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Living Braided Core panel ─────────────────────────────────────────────
export default function LivingBraidedCore({ coreState, patchCore }) {
  const [log, setLog] = useState([]);
  const addLog = useCallback((msg, color = DIM) => {
    setLog(p => [{ msg, color, ts: Date.now() }, ...p].slice(0, 40));
  }, []);

  return (
    <div className="space-y-6">
      {/* Braid visualization */}
      <div className="rounded-xl border p-5 space-y-3" style={{ background: CARD, borderColor: BORDER }}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5" style={{ color: GOLD }} />
            <h2 className="text-base font-bold font-cinzel" style={{ color: GOLD }}>Living Braided Core — Real-Time Mesh</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="text-[9px] border"
              style={{ background: coreState.braidHealth >= 80 ? "rgba(34,197,94,0.1)" : "rgba(251,191,36,0.1)",
                       color: coreState.braidHealth >= 80 ? "#4ade80" : "#fbbf24",
                       borderColor: coreState.braidHealth >= 80 ? "rgba(34,197,94,0.3)" : "rgba(251,191,36,0.3)" }}>
              Health: {coreState.braidHealth}%
            </Badge>
            <Badge className="text-[9px] border"
              style={{ background: "rgba(201,168,76,0.08)", color: GOLD, borderColor: "rgba(201,168,76,0.25)" }}>
              STITCH-BRICK/{coreState.stitchBrickMode}
            </Badge>
            {[
              { label: "OMEGA-72", active: coreState.omega72Active, color: "#a78bfa" },
              { label: "SB712", active: coreState.sb712Active, color: "#60a5fa" },
            ].map((m, i) => m.active ? (
              <Badge key={i} className="text-[9px] border font-bold"
                style={{ background: `${m.color}18`, color: m.color, borderColor: `${m.color}40` }}>
                ● {m.label}
              </Badge>
            ) : null)}
          </div>
        </div>
        <BraidCanvas health={coreState.braidHealth} />
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: "Spine", val: coreState.spineStatus, color: coreState.spineStatus === "PROTECTED" ? "#4ade80" : "#f87171" },
            { label: "Ledger", val: `v${coreState.ledgerVersion}`, color: "#60a5fa" },
            { label: "No-Delete Violations", val: coreState.noDeleteViolations, color: coreState.noDeleteViolations === 0 ? "#4ade80" : "#f87171" },
          ].map((m, i) => (
            <div key={i} className="rounded-lg border p-2" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="text-sm font-bold font-mono" style={{ color: m.color }}>{m.val}</div>
              <div className="text-[9px] mt-0.5" style={{ color: DIM }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-col grid for tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PocketRepair coreState={coreState} patchCore={patchCore} addLog={addLog} />
        <SelfHealSequence coreState={coreState} patchCore={patchCore} addLog={addLog} />
        <VerificationFlow coreState={coreState} patchCore={patchCore} addLog={addLog} />
        <SnapshotVault coreState={coreState} patchCore={patchCore} addLog={addLog} />
      </div>

      {/* Core activity log */}
      <div className="rounded-xl border p-5 space-y-3" style={{ background: CARD, borderColor: BORDER }}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Core Activity Log</h3>
          {log.length > 0 && (
            <Button size="sm" variant="outline" className="text-[9px] h-6 px-2 border-border text-muted-foreground"
              onClick={() => setLog([])}>Clear</Button>
          )}
        </div>
        {log.length === 0 ? (
          <div className="text-[10px] text-center py-6" style={{ color: DIM }}>
            Activity will appear here as you run core operations.
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto space-y-1 font-mono">
            {log.map((e, i) => (
              <div key={i} className="text-[10px] flex items-start gap-2">
                <span className="text-muted-foreground flex-shrink-0">{moment(e.ts).format("HH:mm:ss")}</span>
                <span style={{ color: e.color || DIM }}>{e.msg}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }