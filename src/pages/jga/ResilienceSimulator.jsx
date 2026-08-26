import React, { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import BraidCanvas from "@/components/jga/BraidCanvas";
import ScenarioPanel from "@/components/jga/ScenarioPanel";
import SimLog from "@/components/jga/SimLog";
import SystemModuleGrid from "@/components/jga/SystemModuleGrid";

const GOLD = "#C9A84C";

export const SCENARIOS = [
  {
    id: "cosmic_radiation",
    label: "Cosmic Radiation Burst",
    icon: "☢",
    color: "#f97316",
    desc: "A high-energy gamma-ray burst from a magnetar strike corrupts memory pockets and flips ledger bits mid-chain.",
    severity: "CRITICAL",
    branch: "SB689 + BRAID",
    phases: [
      { t: 0, msg: "ALERT: Cosmic radiation burst detected — gamma flux 10^18 eV", type: "warn" },
      { t: 600, msg: "SB689 RAM Guard triggered — memory drift detected in Logic Strand B", type: "error" },
      { t: 1200, msg: "Pockets 3, 7, 11 flagged CORRUPTED — entering quarantine", type: "error" },
      { t: 1800, msg: "Ledger chain integrity check triggered by SB688", type: "warn" },
      { t: 2400, msg: "Ghost snapshot captured by Phoenix before cascade", type: "info" },
      { t: 3000, msg: "SB688 TVE: Triple verification re-run on surviving pockets", type: "info" },
      { t: 3600, msg: "Corrupted strands isolated — silence mesh contains blast radius", type: "warn" },
      { t: 4200, msg: "Phoenix Protocol: rolling back to verified ghost checkpoint", type: "info" },
      { t: 4800, msg: "SB712 Möbius loop re-established — continuity restored", type: "success" },
      { t: 5400, msg: "SELF_HEAL_COMPLETE — 3 pockets rebuilt from cold storage", type: "success" },
      { t: 6000, msg: "Ledger chain re-verified: CHAIN_OK — 0 errors", type: "success" },
    ],
  },
  {
    id: "deep_space_vacuum",
    label: "Deep Space Vacuum Pressure",
    icon: "🌌",
    color: "#06b6d4",
    desc: "Zero-pressure environment causes memory decompression failure. Data expands and fragments across the braid simultaneously.",
    severity: "HIGH",
    branch: "SB688 + RAM-G",
    phases: [
      { t: 0, msg: "ALERT: Vacuum pressure event — atmospheric integrity 0%", type: "warn" },
      { t: 700, msg: "RAM Guard: memory pressure differential detected — cells expanding", type: "warn" },
      { t: 1400, msg: "Logic Strand A decompression failure — 22% drift from baseline", type: "error" },
      { t: 2100, msg: "SB688 Anchor Node: hash mismatch detected across 6 strands", type: "error" },
      { t: 2800, msg: "Spine isolation layer activated — Spine integrity preserved", type: "info" },
      { t: 3500, msg: "Verification Gate 1 sealed — inputs blocked until pressure normalized", type: "warn" },
      { t: 4200, msg: "Cold storage pockets unaffected — sealed before event", type: "success" },
      { t: 4900, msg: "SB712: Möbius continuity loop maintaining state reference", type: "info" },
      { t: 5600, msg: "Selective reload from cold storage — pockets re-verified via TVE", type: "info" },
      { t: 6300, msg: "CHAIN_OK — Ledger intact — braid re-braided from clean roots", type: "success" },
    ],
  },
  {
    id: "ai_hallucination",
    label: "AI Hallucination Cascade",
    icon: "🤖",
    color: "#a78bfa",
    desc: "Unverified AI output injects false state into the pipeline. Without SB688 verification gates, it would cascade system-wide.",
    severity: "HIGH",
    branch: "SB688 + TVE + AVA",
    phases: [
      { t: 0, msg: "AVA response received — content flagged for verification gate", type: "info" },
      { t: 600, msg: "Verification Gate 1: Input scan — AI response classified UNVERIFIED", type: "warn" },
      { t: 1200, msg: "State item enters quarantine — risk score 87/100", type: "error" },
      { t: 1800, msg: "TVE Verification: Mark 1 FAIL — hallucinated claim detected", type: "error" },
      { t: 2400, msg: "TVE Validation: Mark 2 FAIL — cross-reference mismatch", type: "error" },
      { t: 3000, msg: "State REJECTED — never reached Spine", type: "error" },
      { t: 3600, msg: "Hunter Node logs false state in append-only ledger", type: "info" },
      { t: 4200, msg: "System log: AI hallucination contained — 0 trusted states corrupted", type: "success" },
      { t: 4800, msg: "AVA re-prompted with verified context — re-running through gates", type: "info" },
      { t: 5400, msg: "TVE: 3/3 marks — new response CERTIFIED TRUSTED", type: "success" },
    ],
  },
  {
    id: "ransomware_strike",
    label: "Ransomware Strike",
    icon: "💀",
    color: "#ef4444",
    desc: "Ransomware attempts to encrypt and hold the ledger hostage. Append-only architecture makes it impossible to lock what can't be written over.",
    severity: "CRITICAL",
    branch: "SB688 + SPINE + LEDGER",
    phases: [
      { t: 0, msg: "ALERT: Ransomware payload detected at input gate", type: "error" },
      { t: 500, msg: "SB688 Quarantine Node: payload isolated before Spine contact", type: "warn" },
      { t: 1000, msg: "Attempt to write to Ledger — BLOCKED: append-only enforcement", type: "error" },
      { t: 1500, msg: "Attempt to delete Ledger — BLOCKED: no delete capability exists", type: "error" },
      { t: 2000, msg: "Warrior Node: unauthorized access attempt logged", type: "warn" },
      { t: 2500, msg: "Ghost Nodes: silent checkpoints pre-captured — recovery ready", type: "info" },
      { t: 3000, msg: "Spine Isolation Layer: payload never reached Spine — contained", type: "success" },
      { t: 3500, msg: "Payload quarantined — Doctor run — all checks OK", type: "success" },
      { t: 4000, msg: "Ledger CHAIN_OK — 0 entries modified — integrity preserved", type: "success" },
      { t: 4500, msg: "SELF_HEAL_COMPLETE — system nominal — incident logged", type: "success" },
    ],
  },
  {
    id: "node_cascade",
    label: "Node Cascade Failure",
    icon: "⚡",
    color: "#fbbf24",
    desc: "Multiple nodes fail simultaneously due to power surge. Brick-stitch geometry ensures no single failure propagates to neighbors.",
    severity: "HIGH",
    branch: "SB688 + OMEGA + PHOENIX",
    phases: [
      { t: 0, msg: "Power surge detected — nodes Alpha, Bravo, Charlie offline", type: "error" },
      { t: 700, msg: "Health Node: mesh integrity check — 3/24 nodes down", type: "warn" },
      { t: 1400, msg: "Brick-Stitch geometry: load redistributed to adjacent trusted nodes", type: "info" },
      { t: 2100, msg: "No cascade — geometric redundancy absorbs failure silently", type: "success" },
      { t: 2800, msg: "Phoenix Protocol: recovery sequence initiated for downed nodes", type: "info" },
      { t: 3500, msg: "Repair Node: rebuilding Alpha from last verified ghost checkpoint", type: "info" },
      { t: 4200, msg: "Node Alpha — RESTORED — TVE re-certification in progress", type: "info" },
      { t: 4900, msg: "Nodes Bravo, Charlie — RESTORED — ledger updated", type: "success" },
      { t: 5600, msg: "Omega Integration: mesh re-linked — all 24 nodes reporting", type: "success" },
      { t: 6300, msg: "SELF_HEAL_COMPLETE — CHAIN_OK — system nominal", type: "success" },
    ],
  },
  {
    id: "silent_drift",
    label: "Silent Memory Drift",
    icon: "👻",
    color: "#94a3b8",
    desc: "Subtle bit-flip corruption over time slowly changes data without triggering obvious alarms — the most dangerous failure mode.",
    severity: "EXTREME",
    branch: "SB689 + HUNTER + BRAID",
    phases: [
      { t: 0, msg: "Silent drift begins — single bit flip in Logic Strand C", type: "info" },
      { t: 900, msg: "No alarm triggered — drift below threshold", type: "warn" },
      { t: 1800, msg: "Hunter Node: baseline deviation detected — 0.003% drift", type: "warn" },
      { t: 2700, msg: "SB689 drift scanner: pattern confirmed — NOT random noise", type: "error" },
      { t: 3600, msg: "Strand C flagged — entering quarantine before drift spreads", type: "warn" },
      { t: 4500, msg: "Ledger audit: drift traced to entry #341 — hash mismatch", type: "error" },
      { t: 5400, msg: "Ghost checkpoint from before entry #341 located", type: "info" },
      { t: 6300, msg: "Rollback to verified checkpoint — entries #341-479 re-verified", type: "info" },
      { t: 7200, msg: "TVE re-certification complete — strand C rebuilt clean", type: "success" },
      { t: 8100, msg: "SELF_HEAL_COMPLETE — silent drift neutralized — system hardened", type: "success" },
    ],
  },
];

export default function ResilienceSimulator() {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [logs, setLogs] = useState([]);
  const [braidState, setBraidState] = useState("healthy");
  const [healProgress, setHealProgress] = useState(0);
  const intervalRef = useRef(null);

  const stopSim = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
  }, []);

  const runSimulation = useCallback((scenario) => {
    setLogs([]);
    setPhase(0);
    setHealProgress(0);
    setBraidState("healthy");
    setRunning(true);

    const phases = scenario.phases;
    let i = 0;

    const tick = () => {
      if (i >= phases.length) {
        setBraidState("healthy");
        setHealProgress(100);
        clearInterval(intervalRef.current);
        setRunning(false);
        return;
      }
      const p = phases[i];
      setLogs(prev => [...prev, { ...p, id: i }]);
      setPhase(i);

      // Drive braid visual state
      const progress = i / phases.length;
      if (progress < 0.25) setBraidState("healthy");
      else if (progress < 0.45) setBraidState("warning");
      else if (progress < 0.65) setBraidState("corrupted");
      else if (progress < 0.8) setBraidState("healing");
      else setBraidState("recovering");

      setHealProgress(Math.round((i / (phases.length - 1)) * 100));
      i++;
    };

    tick();
    intervalRef.current = setInterval(tick, 900);
  }, []);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const handleRun = () => {
    if (!selectedScenario) return;
    runSimulation(selectedScenario);
  };

  const handleReset = () => {
    stopSim();
    setLogs([]);
    setPhase(0);
    setHealProgress(0);
    setBraidState("healthy");
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-border p-5 sm:p-7 space-y-2" style={{ background: "linear-gradient(135deg, hsl(220,22%,5%), hsl(220,18%,8%))" }}>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge className="text-[10px] font-bold border" style={{ background: "rgba(201,168,76,0.1)", color: GOLD, borderColor: "rgba(201,168,76,0.3)" }}>
            ♛ SB688 RESILIENCE SIMULATOR
          </Badge>
          <Badge className="text-[10px] font-bold border" style={{ background: "rgba(34,197,94,0.08)", color: "#4ade80", borderColor: "rgba(34,197,94,0.2)" }}>
            INTERACTIVE · LIVE VISUAL
          </Badge>
        </div>
        <h1 className="text-xl sm:text-3xl font-bold font-cinzel gold-shimmer">Braid Corruption & Healing Demo</h1>
        <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
          Choose a real-world catastrophic scenario — cosmic radiation, ransomware, AI hallucination, node cascade, or silent drift.
          Watch the braid break in real time and observe every SB module respond, contain, and heal the system back to a certified state.
        </p>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* LEFT: Braid Visual */}
        <div className="space-y-4">
          <BraidCanvas braidState={braidState} healProgress={healProgress} scenario={selectedScenario} running={running} />
          <SystemModuleGrid braidState={braidState} scenario={selectedScenario} />
        </div>

        {/* RIGHT: Scenario + Log */}
        <div className="space-y-4">
          <ScenarioPanel
            scenarios={SCENARIOS}
            selected={selectedScenario}
            onSelect={setSelectedScenario}
            onRun={handleRun}
            onReset={handleReset}
            running={running}
          />
          <SimLog logs={logs} running={running} phase={phase} total={selectedScenario?.phases.length || 0} />
        </div>
      </div>
    </div>
  );
}