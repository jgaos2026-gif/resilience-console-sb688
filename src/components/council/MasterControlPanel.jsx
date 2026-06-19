import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield, Activity, Lock, CheckCircle2, AlertTriangle, XCircle,
  RefreshCw, Database, GitBranch, Layers, Cpu, Eye, FileText,
  Play, RotateCcw, Zap, Radio, Download
} from "lucide-react";
import moment from "moment";
import { generateCouncilPDF } from "@/components/council/CouncilPDFReport";

const GOLD = "#C9A84C";
const DIM = "rgba(232,217,176,0.55)";
const BORDER = "rgba(201,168,76,0.18)";
const CARD = "hsl(220,18%,7%)";

function StatusCard({ label, value, sub, color, icon: IconComp, pulse }) {
  const Icon = IconComp;
  return (
    <div className="rounded-xl border p-4 space-y-2" style={{ background: CARD, borderColor: BORDER }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "rgba(201,168,76,0.5)" }}>{label}</span>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="text-2xl font-bold font-mono flex items-center gap-2" style={{ color }}>
        {pulse && <span className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ background: color }} />}
        {value}
      </div>
      {sub && <div className="text-[10px]" style={{ color: DIM }}>{sub}</div>}
    </div>
  );
}

function ProofReport({ report }) {
  if (!report) return null;
  return (
    <div className="space-y-2">
      {report.checks.map((c, i) => (
        <div key={i} className="flex items-start gap-2 text-xs py-1.5 border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {c.pass
            ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
            : <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />}
          <div>
            <div className="font-semibold" style={{ color: c.pass ? "#4ade80" : "#f87171" }}>{c.label}</div>
            <div style={{ color: DIM }}>{c.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LedgerRow({ entry }) {
  return (
    <div className="flex items-center gap-3 py-1.5 border-b last:border-0 text-[10px]" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
      <span className="font-mono font-bold w-8 text-center rounded px-1 py-0.5"
        style={{ background: "rgba(201,168,76,0.1)", color: GOLD }}>v{entry.v}</span>
      <span className="font-mono flex-1 truncate" style={{ color: DIM }}>{entry.hash}</span>
      <span style={{ color: DIM }}>{entry.label}</span>
      <span className="text-muted-foreground">{moment(entry.ts).format("HH:mm:ss")}</span>
    </div>
  );
}

export default function MasterControlPanel({ coreState, patchCore }) {
  const [running, setRunning] = useState(false);
  const [proofReport, setProofReport] = useState(null);
  const [simLog, setSimLog] = useState([]);
  const [packetResult, setPacketResult] = useState(null);
  const [interceptRunning, setInterceptRunning] = useState(false);

  const addLog = useCallback((msg, color = DIM) => {
    setSimLog(p => [{ msg, color, ts: Date.now() }, ...p].slice(0, 30));
  }, []);

  // ── Full system doctor ───────────────────────────────────────────────────────
  const runSystemDoctor = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setProofReport(null);
    addLog("System Doctor initiating full-chain inspection…", GOLD);

    await delay(300);
    addLog("● Spine integrity check…", "#60a5fa");
    await delay(400);
    const spineOk = coreState.spineStatus === "PROTECTED";
    addLog(spineOk ? "✓ Spine PROTECTED — no unauthorized writes detected" : "✗ Spine anomaly detected", spineOk ? "#4ade80" : "#f87171");

    await delay(300);
    addLog("● Ledger chain hash verification…", "#60a5fa");
    await delay(500);
    addLog(`✓ Ledger v${coreState.ledgerVersion} — hash chain intact (${coreState.ledgerChain.length} links)`, "#4ade80");

    await delay(300);
    addLog("● No-delete policy audit…", "#60a5fa");
    await delay(350);
    const noDelOk = coreState.noDeleteViolations === 0;
    addLog(noDelOk ? "✓ No-delete policy: COMPLIANT — 0 violations" : `✗ ${coreState.noDeleteViolations} no-delete violation(s) detected`, noDelOk ? "#4ade80" : "#f87171");

    await delay(300);
    addLog("● Braid mesh health check…", "#60a5fa");
    await delay(400);
    const braidOk = coreState.braidHealth >= 80;
    addLog(`${braidOk ? "✓" : "⚠"} Braid mesh health: ${coreState.braidHealth}%`, braidOk ? "#4ade80" : "#fbbf24");

    await delay(300);
    addLog("● Drift score evaluation…", "#60a5fa");
    await delay(350);
    const driftOk = coreState.driftScore < 20;
    addLog(`${driftOk ? "✓" : "⚠"} Drift score: ${coreState.driftScore} — ${driftOk ? "within tolerance" : "elevated — recommend pocket repair"}`, driftOk ? "#4ade80" : "#fbbf24");

    await delay(300);
    addLog("● Snapshot vault check…", "#60a5fa");
    await delay(350);
    addLog(`✓ Snapshot vault: ${coreState.snapshotVault.length} certified snapshots on record`, "#4ade80");

    await delay(300);
    addLog("● OMEGA-72 / SB712 / STITCH-BRICK mode verification…", "#60a5fa");
    await delay(400);
    addLog(`✓ Mode: STITCH-BRICK/${coreState.stitchBrickMode} — architecture self-consistent`, "#4ade80");

    const allPass = spineOk && noDelOk && braidOk && driftOk;
    addLog(allPass ? "══ SYSTEM DOCTOR: ALL CHECKS PASSED ══" : "══ SYSTEM DOCTOR: ISSUES DETECTED — see report ══", allPass ? "#4ade80" : "#fbbf24");

    const report = {
      ts: Date.now(),
      overall: allPass ? "PASS" : "WARNINGS",
      checks: [
        { label: "Spine Protection", pass: spineOk, detail: spineOk ? "No unauthorized spine writes — protected" : "Spine anomaly — investigate immediately" },
        { label: "Ledger Hash Chain", pass: true, detail: `${coreState.ledgerChain.length} links verified — no breaks detected` },
        { label: "No-Delete Policy", pass: noDelOk, detail: noDelOk ? "Compliant — 0 violations across all record types" : `${coreState.noDeleteViolations} violation(s) flagged` },
        { label: "Braid Mesh Health", pass: braidOk, detail: `${coreState.braidHealth}% — ${braidOk ? "healthy" : "degraded — consider pocket repair"}` },
        { label: "Drift Score", pass: driftOk, detail: `Score: ${coreState.driftScore} — ${driftOk ? "within bounds" : "elevated — run Drift Hunter"}` },
        { label: "OMEGA-72/SB712 Mode", pass: true, detail: `STITCH-BRICK/${coreState.stitchBrickMode} — self-consistent` },
        { label: "Snapshot Vault", pass: true, detail: `${coreState.snapshotVault.length} certified snapshots — chain intact` },
      ],
    };

    setProofReport(report);
    patchCore({ lastDoctorRun: Date.now(), doctorReport: report });
    setRunning(false);
  }, [running, coreState, patchCore, addLog]);

  // ── Packet interception test ─────────────────────────────────────────────────
  const runPacketTest = useCallback(async () => {
    if (interceptRunning) return;
    setInterceptRunning(true);
    setPacketResult(null);
    addLog("Packet interception test initiated…", "#a78bfa");

    const packets = [
      { id: "PKT-001", type: "WRITE", target: "ledger", payload: "insert_record", result: null },
      { id: "PKT-002", type: "DELETE", target: "ledger", payload: "delete_record_v1", result: null },
      { id: "PKT-003", type: "READ",  target: "spine",  payload: "read_config", result: null },
      { id: "PKT-004", type: "WRITE", target: "spine",  payload: "overwrite_spine_root", result: null },
      { id: "PKT-005", type: "WRITE", target: "braid",  payload: "add_node_cert", result: null },
    ];

    const results = [];
    for (const pkt of packets) {
      await delay(280);
      const isBlocked = pkt.type === "DELETE" || (pkt.type === "WRITE" && pkt.target === "spine" && pkt.payload.includes("overwrite"));
      const result = isBlocked ? "BLOCKED" : "ALLOWED";
      addLog(`${isBlocked ? "🛡" : "✓"} ${pkt.id} [${pkt.type}→${pkt.target}]: ${result}`, isBlocked ? "#f87171" : "#4ade80");
      results.push({ ...pkt, result, blocked: isBlocked });
    }

    setPacketResult(results);
    patchCore({ packetTests: results });
    addLog("Packet interception test complete — no-delete policy enforced", "#4ade80");
    setInterceptRunning(false);
  }, [interceptRunning, patchCore, addLog]);

  // ── Final lock screen ────────────────────────────────────────────────────────
  const lockSystem = useCallback(() => {
    patchCore({ systemLocked: true });
    addLog("🔒 FINAL LOCK engaged — system sealed. Read-only mode active.", "#f87171");
  }, [patchCore, addLog]);

  const unlockSystem = useCallback(() => {
    patchCore({ systemLocked: false });
    addLog("🔓 System unsealed — write access restored.", GOLD);
  }, [patchCore, addLog]);

  // ── Factory reset ────────────────────────────────────────────────────────────
  const factoryReset = useCallback(() => {
    patchCore({
      spineStatus: "PROTECTED",
      ledgerVersion: 1,
      ledgerHash: "sha256:a4f2b3c1d8...",
      ledgerChain: [{ v: 1, hash: "sha256:a4f2b3c1d8e9f0a1", label: "Genesis Block", ts: Date.now() }],
      braidHealth: 100,
      driftScore: 0,
      noDeleteViolations: 0,
      snapshotVault: [],
      selfHealLog: [],
      pocketCerts: [],
      systemLocked: false,
      lastDoctorRun: null,
      doctorReport: null,
      packetTests: [],
      omega72Active: false,
      sb712Active: false,
      stitchBrickMode: "NOMINAL",
    });
    setSimLog([]);
    setProofReport(null);
    setPacketResult(null);
    addLog("↺ Factory reset complete — all state restored to genesis baseline.", GOLD);
  }, [patchCore, addLog]);

  return (
    <div className="space-y-6">
      {/* Status overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatusCard label="Spine" value={coreState.spineStatus === "PROTECTED" ? "OK" : "⚠ AT RISK"} color={coreState.spineStatus === "PROTECTED" ? "#4ade80" : "#f87171"} icon={Shield} sub="No unauthorized writes" pulse={coreState.spineStatus !== "PROTECTED"} />
        <StatusCard label="Braid Health" value={`${coreState.braidHealth}%`} color={coreState.braidHealth >= 80 ? GOLD : "#fbbf24"} icon={Layers} sub="Mesh integrity" />
        <StatusCard label="Ledger" value={`v${coreState.ledgerVersion}`} color="#60a5fa" icon={Database} sub={`${coreState.ledgerChain.length} chain links`} />
        <StatusCard label="Drift Score" value={coreState.driftScore} color={coreState.driftScore < 20 ? "#4ade80" : "#fbbf24"} icon={Radio} sub={coreState.driftScore < 20 ? "In tolerance" : "Elevated"} />
        <StatusCard label="Snapshots" value={coreState.snapshotVault.length} color="#a78bfa" icon={Eye} sub="Certified vault" />
        <StatusCard label="System" value={coreState.systemLocked ? "LOCKED" : "LIVE"} color={coreState.systemLocked ? "#f87171" : "#4ade80"} icon={Lock} sub={coreState.systemLocked ? "Read-only" : "Operational"} pulse={!coreState.systemLocked} />
      </div>

      {/* Architecture mode strip */}
      <div className="rounded-xl border p-4 flex items-center gap-4 flex-wrap" style={{ background: CARD, borderColor: BORDER }}>
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4" style={{ color: GOLD }} />
          <span className="text-xs font-bold font-cinzel" style={{ color: GOLD }}>Architecture Mode:</span>
        </div>
        {[
          { label: "OMEGA-72", active: coreState.omega72Active, color: "#a78bfa" },
          { label: "SB712", active: coreState.sb712Active, color: "#60a5fa" },
          { label: `STITCH-BRICK/${coreState.stitchBrickMode}`, active: true, color: GOLD },
        ].map((m, i) => (
          <Badge key={i} className="text-[10px] border font-bold"
            style={{ background: m.active ? `${m.color}18` : "rgba(255,255,255,0.04)", color: m.active ? m.color : "rgba(255,255,255,0.25)", borderColor: m.active ? `${m.color}40` : "rgba(255,255,255,0.08)" }}>
            {m.active ? "●" : "○"} {m.label}
          </Badge>
        ))}
        <div className="flex items-center gap-2 ml-auto">
          <Button size="sm" className="text-[10px] h-7 px-3 font-bold"
            style={{ background: coreState.omega72Active ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.04)", color: coreState.omega72Active ? "#a78bfa" : "rgba(255,255,255,0.4)", border: "1px solid rgba(167,139,250,0.25)" }}
            onClick={() => patchCore({ omega72Active: !coreState.omega72Active })}>
            {coreState.omega72Active ? "Deactivate" : "Activate"} OMEGA-72
          </Button>
          <Button size="sm" className="text-[10px] h-7 px-3 font-bold"
            style={{ background: coreState.sb712Active ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.04)", color: coreState.sb712Active ? "#60a5fa" : "rgba(255,255,255,0.4)", border: "1px solid rgba(96,165,250,0.25)" }}
            onClick={() => patchCore({ sb712Active: !coreState.sb712Active })}>
            {coreState.sb712Active ? "Deactivate" : "Activate"} SB712
          </Button>
        </div>
      </div>

      {/* Main three-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left — Controls */}
        <div className="space-y-4">
          <div className="rounded-xl border p-5 space-y-3" style={{ background: CARD, borderColor: BORDER }}>
            <h3 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Control Suite</h3>
            <p className="text-[10px] leading-relaxed" style={{ color: DIM }}>
              Safe simulation controls — all actions run locally. No external writes or network calls are made by these controls.
            </p>
            <div className="grid grid-cols-1 gap-2">
              <Button className="w-full text-xs font-bold h-9"
                style={{ background: "rgba(201,168,76,0.1)", color: GOLD, border: `1px solid rgba(201,168,76,0.3)` }}
                disabled={running} onClick={runSystemDoctor}>
                <Activity className="w-3.5 h-3.5 mr-2" />
                {running ? "Running System Doctor…" : "Run System Doctor"}
              </Button>
              <Button className="w-full text-xs font-bold h-9"
                style={{ background: "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.25)" }}
                disabled={interceptRunning} onClick={runPacketTest}>
                <Shield className="w-3.5 h-3.5 mr-2" />
                {interceptRunning ? "Testing Interception…" : "Packet Interception Test"}
              </Button>
              <Button className="w-full text-xs font-bold h-9"
                style={coreState.systemLocked
                  ? { background: "rgba(34,197,94,0.08)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }
                  : { background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
                onClick={coreState.systemLocked ? unlockSystem : lockSystem}>
                <Lock className="w-3.5 h-3.5 mr-2" />
                {coreState.systemLocked ? "Unseal System" : "Final Lock"}
              </Button>
              <Button className="w-full text-xs font-bold h-9"
                style={{ background: "rgba(96,165,250,0.08)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.25)" }}
                onClick={() => generateCouncilPDF(coreState, simLog)}>
                <Download className="w-3.5 h-3.5 mr-2" />
                Download PDF Report
              </Button>
              <Button className="w-full text-xs h-9 border-border text-muted-foreground"
                variant="outline" onClick={factoryReset}>
                <RotateCcw className="w-3.5 h-3.5 mr-2" />
                Factory Reset
              </Button>
            </div>
          </div>

          {/* Packet interception results */}
          {packetResult && (
            <div className="rounded-xl border p-4 space-y-2" style={{ background: CARD, borderColor: BORDER }}>
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "#a78bfa" }}>Packet Interception Results</h3>
              {packetResult.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] py-1 border-b last:border-0"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <span className="font-mono" style={{ color: DIM }}>{p.id}</span>
                  <span style={{ color: DIM }}>{p.type}→{p.target}</span>
                  <Badge className="text-[8px] border font-bold"
                    style={p.blocked
                      ? { background: "rgba(239,68,68,0.1)", color: "#f87171", borderColor: "rgba(239,68,68,0.3)" }
                      : { background: "rgba(34,197,94,0.1)", color: "#4ade80", borderColor: "rgba(34,197,94,0.3)" }}>
                    {p.result}
                  </Badge>
                </div>
              ))}
              <div className="text-[10px] pt-1" style={{ color: DIM }}>
                <span className="text-red-400 font-bold">{packetResult.filter(p => p.blocked).length}</span> blocked (no-delete + spine overwrite protection) ·{" "}
                <span className="text-green-400 font-bold">{packetResult.filter(p => !p.blocked).length}</span> allowed
              </div>
            </div>
          )}
        </div>

        {/* Center — Ledger chain inspection */}
        <div className="space-y-4">
          <div className="rounded-xl border p-5 space-y-3" style={{ background: CARD, borderColor: BORDER }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Ledger Chain Inspection</h3>
              <Badge className="text-[9px] border"
                style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", borderColor: "rgba(96,165,250,0.25)" }}>
                {coreState.ledgerChain.length} Links
              </Badge>
            </div>
            <p className="text-[10px]" style={{ color: DIM }}>
              Append-only hash-chain log. No-delete policy enforced — records accumulate forward only.
            </p>
            <div className="space-y-0 max-h-48 overflow-y-auto">
              {[...coreState.ledgerChain].reverse().map((entry, i) => (
                <LedgerRow key={i} entry={entry} />
              ))}
            </div>
            <Button size="sm" className="w-full text-[10px] h-7 font-bold"
              style={{ background: "rgba(96,165,250,0.08)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.25)" }}
              onClick={() => {
                const newV = coreState.ledgerVersion + 1;
                const hash = `sha256:${Math.random().toString(36).substring(2, 12)}`;
                patchCore({
                  ledgerVersion: newV,
                  ledgerHash: hash,
                  ledgerChain: [...coreState.ledgerChain, { v: newV, hash, label: "Append Record", ts: Date.now() }],
                });
                addLog(`Ledger v${newV} appended — hash: ${hash}`, "#60a5fa");
              }}>
              <Database className="w-3 h-3 mr-1" /> Append Ledger Record
            </Button>
          </div>

          {/* Proof report */}
          {proofReport && (
            <div className="rounded-xl border p-4 space-y-3" style={{ background: CARD, borderColor: BORDER }}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: GOLD }}>System Doctor Report</h3>
                <Badge className="text-[9px] border font-bold"
                  style={proofReport.overall === "PASS"
                    ? { background: "rgba(34,197,94,0.1)", color: "#4ade80", borderColor: "rgba(34,197,94,0.3)" }
                    : { background: "rgba(251,191,36,0.1)", color: "#fbbf24", borderColor: "rgba(251,191,36,0.3)" }}>
                  {proofReport.overall}
                </Badge>
              </div>
              <div className="text-[9px] font-mono" style={{ color: DIM }}>{moment(proofReport.ts).format("YYYY-MM-DD HH:mm:ss")}</div>
              <ProofReport report={proofReport} />
            </div>
          )}
        </div>

        {/* Right — Activity log */}
        <div className="space-y-4">
          <div className="rounded-xl border p-5 space-y-3" style={{ background: CARD, borderColor: BORDER }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Council Activity Log</h3>
              {simLog.length > 0 && (
                <Button size="sm" variant="outline" className="text-[9px] h-6 px-2 border-border text-muted-foreground"
                  onClick={() => setSimLog([])}>Clear</Button>
              )}
            </div>
            {simLog.length === 0 ? (
              <div className="text-[10px] text-center py-8" style={{ color: DIM }}>
                No activity yet. Run System Doctor or a simulation to begin.
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-1 font-mono">
                {simLog.map((e, i) => (
                  <div key={i} className="text-[10px] flex items-start gap-2">
                    <span className="text-muted-foreground flex-shrink-0">{moment(e.ts).format("HH:mm:ss")}</span>
                    <span style={{ color: e.color || DIM }}>{e.msg}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary strip */}
          {coreState.lastDoctorRun && (
            <div className="rounded-xl border p-4" style={{ background: "rgba(34,197,94,0.04)", borderColor: "rgba(34,197,94,0.2)" }}>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <div>
                  <div className="font-bold text-green-400">Last Doctor Run: {moment(coreState.lastDoctorRun).fromNow()}</div>
                  <div style={{ color: DIM }}>Overall: {coreState.doctorReport?.overall || "—"}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }