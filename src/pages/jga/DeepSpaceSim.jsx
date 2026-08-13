import React, { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import NodeMeshCanvas from "@/components/jga/sim/NodeMeshCanvas";
import SpaceEventPanel from "@/components/jga/sim/SpaceEventPanel";
import NodePairViewer from "@/components/jga/sim/NodePairViewer";
import SilenceMeshStatus from "@/components/jga/sim/SilenceMeshStatus";
import QubexPanel from "@/components/jga/sim/QubexPanel";

const GOLD = "#C9A84C";

export const SPACE_EVENTS = [
  {
    id: "cosmic_radiation",
    icon: "☢️",
    label: "Cosmic Radiation Burst",
    color: "#f97316",
    severity: "CRITICAL",
    desc: "Gamma-ray burst from a magnetar. Corrupts memory pockets and flips ledger bits mid-chain.",
    affectedNodes: ["Memory Pocket", "Ledger Node", "RAM Guard", "Hunter Node"],
    silenceMesh: ["Memory Pocket Silence", "Noise-to-Ledger Silence", "Chain-Link Silence"],
    qubexScore: { q1: 12, q2: 18 },
    phases: [
      { t: 0, type: "error", msg: "☢️ GAMMA BURST DETECTED — flux 10^18 eV inbound" },
      { t: 800, type: "warn", msg: "RAM Guard triggered — memory drift in Logic Strand B" },
      { t: 1600, type: "error", msg: "Memory Pockets #3, #7, #11 — CORRUPTED — quarantined" },
      { t: 2400, type: "warn", msg: "QUBEX-1/QUBEX-2 disagreement — ledger timestamp mismatch" },
      { t: 3200, type: "info", msg: "Hunter Nodes A+B scanning — silent drift detected in pocket #7" },
      { t: 4000, type: "info", msg: "Ghost Node: clean checkpoint captured before cascade" },
      { t: 4800, type: "warn", msg: "Silencing Node: error storm contained — Spine silence maintained" },
      { t: 5600, type: "info", msg: "Phoenix Protocol: rolling back to verified ghost checkpoint" },
      { t: 6400, type: "info", msg: "TVE: Triple re-verification pass on restored pockets" },
      { t: 7200, type: "success", msg: "Certification Node: 3/3 marks — recovery CERTIFIED" },
      { t: 8000, type: "success", msg: "CHAIN_OK — Ledger intact — 0 errors — SPINE CLEAN" },
    ],
  },
  {
    id: "vacuum_pressure",
    icon: "🌌",
    label: "Deep Space Vacuum Pressure",
    color: "#06b6d4",
    severity: "HIGH",
    desc: "Zero-pressure decompression failure. Data expands and fragments across strands simultaneously.",
    affectedNodes: ["Cooling Node", "Anchor Node", "RAM Guard", "Verification Node"],
    silenceMesh: ["Heartbeat Silence", "Chain-Link Silence", "Spine Silence"],
    qubexScore: { q1: 34, q2: 29 },
    phases: [
      { t: 0, type: "warn", msg: "🌌 VACUUM EVENT — atmospheric integrity 0% — pressure drop" },
      { t: 700, type: "warn", msg: "RAM Guard: memory pressure differential — cells decompressing" },
      { t: 1400, type: "error", msg: "Logic Strand A: 22% drift from baseline — Anchor Node triggered" },
      { t: 2100, type: "error", msg: "QUBEX-1 reads clean — QUBEX-2 detects hash drift — DISAGREEMENT" },
      { t: 2800, type: "info", msg: "Cooling Node activated — noncritical tasks slowed — pressure easing" },
      { t: 3500, type: "info", msg: "Spine Silence: Verification Gate sealed — no raw input to Spine" },
      { t: 4200, type: "info", msg: "Cold storage pockets unaffected — sealed before event onset" },
      { t: 4900, type: "info", msg: "SB712 Möbius continuity holding state reference intact" },
      { t: 5600, type: "info", msg: "Selective reload from cold storage — TVE re-verification pass" },
      { t: 6300, type: "success", msg: "Anchor Node: baseline restored — 0 drift — CHAIN_OK" },
    ],
  },
  {
    id: "solar_flare",
    icon: "🌞",
    label: "Solar EMP Flare",
    color: "#fbbf24",
    severity: "HIGH",
    desc: "Electromagnetic pulse from a coronal mass ejection overloads RAM and node connections simultaneously.",
    affectedNodes: ["Health Node", "Cooling Node", "RAM Guard", "Relaxation Node"],
    silenceMesh: ["Error Storm Silence", "Heartbeat Silence", "Recovery Silence"],
    qubexScore: { q1: 41, q2: 38 },
    phases: [
      { t: 0, type: "error", msg: "🌞 EMP STRIKE — coronal mass ejection impact detected" },
      { t: 600, type: "error", msg: "Health Node: 6 nodes reporting critical heartbeat — RAM spike" },
      { t: 1200, type: "warn", msg: "Cooling Node: RAM at 97% — emergency cold pocket offload" },
      { t: 1800, type: "warn", msg: "QUBEX RAM Pair: RAM Guard + Cooling in sync — pressure dropping" },
      { t: 2400, type: "info", msg: "Relaxation Node: low-priority jobs paused — queues cleared" },
      { t: 3000, type: "info", msg: "Error Storm Silence: 847 duplicate warnings grouped — 1 log entry" },
      { t: 3600, type: "info", msg: "Ghost Nodes: pre-EMP checkpoints verified intact" },
      { t: 4200, type: "info", msg: "Warrior Node: lockdown released — damage radius confirmed 3 nodes" },
      { t: 4800, type: "success", msg: "Phoenix + Certification: 3 nodes restored and certified" },
      { t: 5400, type: "success", msg: "SELF_HEAL_COMPLETE — heartbeat GREEN — system nominal" },
    ],
  },
  {
    id: "silent_drift",
    icon: "👻",
    label: "Silent Memory Drift",
    color: "#a78bfa",
    severity: "EXTREME",
    desc: "Subtle bit-flip corruption slowly changes data without triggering obvious alarms. The most dangerous failure mode.",
    affectedNodes: ["Hunter Node", "Truth Node", "Ledger Node", "Ghost Node"],
    silenceMesh: ["Noise-to-Ledger Silence", "Proof Silence", "Recovery Silence"],
    qubexScore: { q1: 67, q2: 31 },
    phases: [
      { t: 0, type: "info", msg: "👻 Silent drift begins — single bit flip in Logic Strand C" },
      { t: 900, type: "info", msg: "No alarm triggered — drift 0.001% — below threshold" },
      { t: 1800, type: "warn", msg: "Hunter Node A: baseline deviation 0.003% — pattern building" },
      { t: 2700, type: "warn", msg: "QUBEX Truth Pair: Truth A says clean — Truth B flags anomaly" },
      { t: 3600, type: "error", msg: "Hunter Node B: pattern confirmed — NOT random noise — DRIFT" },
      { t: 4500, type: "error", msg: "Strand C quarantined — Ledger: hash mismatch at entry #341" },
      { t: 5400, type: "info", msg: "Ghost checkpoint located — pre-entry #341 state verified clean" },
      { t: 6300, type: "info", msg: "Rollback: entries #341–479 pulled — TVE re-run initiated" },
      { t: 7200, type: "info", msg: "Certification Node: 3/3 marks — strand C rebuilt clean" },
      { t: 8100, type: "success", msg: "SELF_HEAL_COMPLETE — silent drift neutralized — system hardened" },
    ],
  },
  {
    id: "ai_hallucination",
    icon: "🤖",
    label: "AI Hallucination Cascade",
    color: "#ec4899",
    severity: "HIGH",
    desc: "Unverified AI output attempts to inject false state into trusted pipeline. QUBEX disagreement catches it.",
    affectedNodes: ["QUBEX-1", "QUBEX-2", "Quarantine", "Certification Node"],
    silenceMesh: ["Quarantine Silence", "Proof Silence", "Contractor Silence"],
    qubexScore: { q1: 88, q2: 14 },
    phases: [
      { t: 0, type: "info", msg: "🤖 AI response received — entering quarantine gate" },
      { t: 600, type: "info", msg: "QUBEX-1: structure clean — score 88 — forward pass" },
      { t: 1200, type: "error", msg: "QUBEX-2: hash mismatch, source unverifiable — score 14 — CHALLENGE" },
      { t: 1800, type: "error", msg: "QUBEX disagreement — item stays quarantined — Hunter notified" },
      { t: 2400, type: "error", msg: "Truth Node: cross-reference fails — hallucinated claim detected" },
      { t: 3000, type: "error", msg: "State REJECTED — Spine never contacted — 0 trusted corruption" },
      { t: 3600, type: "info", msg: "Ledger: false state logged as evidence in append-only record" },
      { t: 4200, type: "info", msg: "Hunter Node: flagged pattern stored — watchlist updated" },
      { t: 4800, type: "info", msg: "AI re-prompted with verified context — fresh quarantine run" },
      { t: 5400, type: "success", msg: "TVE: 3/3 marks — new response CERTIFIED TRUSTED" },
    ],
  },
  {
    id: "ransomware",
    icon: "💀",
    label: "Ransomware Strike",
    color: "#ef4444",
    severity: "CRITICAL",
    desc: "Ransomware attempts to encrypt and lock the ledger. Append-only architecture makes it impossible.",
    affectedNodes: ["Warrior Node", "Silencing Node", "Ledger Node", "Anchor Node"],
    silenceMesh: ["Spine Silence", "Quarantine Silence", "Payment Silence", "Chain-Link Silence"],
    qubexScore: { q1: 4, q2: 6 },
    phases: [
      { t: 0, type: "error", msg: "💀 RANSOMWARE PAYLOAD — encryption attempt at input gate" },
      { t: 500, type: "error", msg: "QUBEX-1 score 4 / QUBEX-2 score 6 — IMMEDIATE QUARANTINE" },
      { t: 1000, type: "error", msg: "Payload attempts Ledger write — BLOCKED: append-only enforced" },
      { t: 1500, type: "error", msg: "Payload attempts Ledger delete — BLOCKED: no delete capability" },
      { t: 2000, type: "warn", msg: "Warrior Node: lockdown activated — threat logged in Ledger" },
      { t: 2500, type: "info", msg: "Silencing Node: payload muted — chain-link silence preventing spread" },
      { t: 3000, type: "info", msg: "Diamond-Crusted Silencing Layer: payload hits hardened mesh boundary" },
      { t: 3500, type: "info", msg: "Ghost Nodes: clean checkpoints verified — recovery ready" },
      { t: 4000, type: "success", msg: "Spine Silence: payload never touched Spine — SPINE CLEAN" },
      { t: 4500, type: "success", msg: "CHAIN_OK — 0 ledger entries modified — system certified" },
    ],
  },
];

const CORRUPTION_TOGGLE_STATES = ["healthy", "drifting", "corrupted", "healing", "certified"];

export default function DeepSpaceSim() {
  const [activeEvent, setActiveEvent] = useState(null);
  const [simRunning, setSimRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [braidState, setBraidState] = useState("healthy");
  const [healPct, setHealPct] = useState(0);
  const [manualState, setManualState] = useState("healthy");
  const [isManual, setIsManual] = useState(false);
  const [qubexLive, setQubexLive] = useState({ q1: 100, q2: 100, result: "TRUSTED" });
  const intervalRef = useRef(null);

  const stopSim = useCallback(() => {
    clearInterval(intervalRef.current);
    setSimRunning(false);
  }, []);

  const runSim = useCallback((event) => {
    setLogs([]);
    setHealPct(0);
    setBraidState("healthy");
    setIsManual(false);
    setSimRunning(true);
    setQubexLive({ q1: event.qubexScore.q1, q2: event.qubexScore.q2, result: "CHECKING" });

    const phases = event.phases;
    let i = 0;

    const tick = () => {
      if (i >= phases.length) {
        setBraidState("certified");
        setHealPct(100);
        setQubexLive({ q1: 96, q2: 94, result: "TRUSTED" });
        clearInterval(intervalRef.current);
        setSimRunning(false);
        return;
      }
      const p = phases[i];
      setLogs(prev => [...prev, { ...p, id: i }]);
      const pct = i / phases.length;
      if (pct < 0.2) setBraidState("healthy");
      else if (pct < 0.4) setBraidState("drifting");
      else if (pct < 0.6) setBraidState("corrupted");
      else if (pct < 0.8) setBraidState("healing");
      else setBraidState("recovering");
      setHealPct(Math.round((i / (phases.length - 1)) * 100));
      i++;
    };
    tick();
    intervalRef.current = setInterval(tick, 850);
  }, []);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const currentState = isManual ? manualState : braidState;

  const cycleManual = () => {
    if (simRunning) return;
    setIsManual(true);
    const idx = CORRUPTION_TOGGLE_STATES.indexOf(manualState);
    const next = CORRUPTION_TOGGLE_STATES[(idx + 1) % CORRUPTION_TOGGLE_STATES.length];
    setManualState(next);
  };

  const STATE_COLORS = {
    healthy: "#4ade80", drifting: "#fbbf24", corrupted: "#ef4444",
    healing: "#a78bfa", recovering: "#60a5fa", certified: GOLD,
  };
  const STATE_LABELS = {
    healthy: "BRAID NOMINAL", drifting: "DRIFT DETECTED", corrupted: "CORRUPTION ACTIVE",
    healing: "HEALING IN PROGRESS", recovering: "RESTORING FROM GHOST", certified: "CERTIFIED TRUSTED",
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* HEADER */}
      <div className="rounded-2xl border border-border p-5 space-y-2" style={{ background: "linear-gradient(135deg, hsl(220,22%,5%), hsl(220,18%,8%))" }}>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge className="text-[9px] font-bold border" style={{ background: "rgba(201,168,76,0.1)", color: GOLD, borderColor: "rgba(201,168,76,0.3)" }}>
            ♛ SB688 · SB689 · SB712 · QUBEX
          </Badge>
          <Badge className="text-[9px] font-bold border" style={{ background: "rgba(6,182,212,0.08)", color: "#06b6d4", borderColor: "rgba(6,182,212,0.2)" }}>
            DEEP SPACE RESILIENCE SIMULATION
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-cinzel gold-shimmer">Node Mesh · Corruption & Healing Viewer</h1>
        <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
          Choose a catastrophic deep-space event. Watch the 25-node mesh break, the QUBEX paired witness system detect disagreement,
          the Silence Mesh contain corruption, and Ghost/Phoenix certify recovery. Toggle manual corruption states to test any phase.
        </p>
        {/* Manual toggle */}
        <div className="flex flex-wrap gap-2 items-center pt-1">
          <span className="text-[10px] text-muted-foreground font-mono">MANUAL STATE:</span>
          {CORRUPTION_TOGGLE_STATES.map(s => (
            <button key={s} onClick={() => { setIsManual(true); setManualState(s); if (simRunning) stopSim(); }}
              className="text-[9px] font-bold px-2 py-0.5 rounded border transition-all font-mono"
              style={currentState === s
                ? { background: `${STATE_COLORS[s]}18`, color: STATE_COLORS[s], borderColor: `${STATE_COLORS[s]}50` }
                : { background: "rgba(0,0,0,0.2)", color: "#6b7280", borderColor: "rgba(255,255,255,0.05)" }
              }>
              {s.toUpperCase()}
            </button>
          ))}
          <span className="ml-2 text-[10px] font-bold font-mono" style={{ color: STATE_COLORS[currentState] }}>
            ● {STATE_LABELS[currentState]}
          </span>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* LEFT: Node mesh canvas + QUBEX */}
        <div className="xl:col-span-2 space-y-4">
          <NodeMeshCanvas braidState={currentState} healPct={healPct} activeEvent={activeEvent} />
          <QubexPanel braidState={currentState} qubexLive={qubexLive} />
        </div>
        {/* RIGHT: Event selector + Silence Mesh */}
        <div className="space-y-4">
          <SpaceEventPanel
            events={SPACE_EVENTS}
            active={activeEvent}
            onSelect={setActiveEvent}
            onRun={() => activeEvent && runSim(activeEvent)}
            onReset={() => { stopSim(); setLogs([]); setHealPct(0); setBraidState("healthy"); setIsManual(false); }}
            running={simRunning}
          />
          <SilenceMeshStatus braidState={currentState} activeEvent={activeEvent} />
        </div>
      </div>

      {/* NODE PAIRS ROW */}
      <NodePairViewer braidState={currentState} activeEvent={activeEvent} />

      {/* LOG */}
      {(logs.length > 0 || simRunning) && (
        <div className="rounded-2xl border border-border overflow-hidden" style={{ background: "hsl(220,20%,5%)" }}>
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Live System Log — {activeEvent?.label}</span>
            {simRunning && <span className="flex items-center gap-1.5 text-[9px] font-mono text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />{healPct}% COMPLETE</span>}
          </div>
          <SimLogInline logs={logs} />
        </div>
      )}
    </div>
  );
}

function SimLogInline({ logs }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);
  const T = { info: { c: "#60a5fa", p: "INFO" }, warn: { c: "#fbbf24", p: "WARN" }, error: { c: "#f87171", p: "CRIT" }, success: { c: "#4ade80", p: "HEAL" } };
  return (
    <div className="p-3 h-48 overflow-y-auto font-mono text-[10px] space-y-1">
      {logs.map((l, i) => {
        const s = T[l.type] || T.info;
        return (
          <div key={l.id ?? i} className="flex items-start gap-2">
            <span className="font-bold w-8 flex-shrink-0" style={{ color: s.c }}>[{s.p}]</span>
            <span style={{ color: s.c === "#f87171" ? "#fca5a5" : s.c === "#fbbf24" ? "#fde68a" : "rgba(232,220,180,0.8)" }}>{l.msg}</span>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}