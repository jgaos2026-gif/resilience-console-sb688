import React, { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, AlertTriangle, Shield, RotateCcw, CheckCircle2, Search, Zap, Activity } from "lucide-react";
import moment from "moment";

const GOLD = "#C9A84C";

const SCENARIOS = [
  { id: "drift", label: "Simulate Drift", icon: Activity, color: "#fbbf24" },
  { id: "node", label: "Node Failure", icon: AlertTriangle, color: "#f87171" },
  { id: "memory", label: "Memory Pocket Failure", icon: Zap, color: "#a78bfa" },
  { id: "client", label: "Failed Client Intake", icon: Search, color: "#60a5fa" },
  { id: "payment", label: "Payment Verification Failure", icon: Shield, color: "#ef4444" },
  { id: "phoenix", label: "Run Phoenix Recovery", icon: Heart, color: "#ec4899" },
];

const RECOVERY_STEPS = [
  { label: "Detection", desc: "Anomaly identified in system state" },
  { label: "Quarantine", desc: "Affected state isolated from trusted chain" },
  { label: "Rollback", desc: "System reverts to last verified checkpoint" },
  { label: "Repair", desc: "Corrupted data reconstructed from verified sources" },
  { label: "Re-verification", desc: "Repaired state undergoes triple verification" },
  { label: "Certification", desc: "State certified and returned to trusted chain" },
];

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

export default function SelfHealingDemo() {
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [scenario, setScenario] = useState(null);
  const [log, setLog] = useState([]);
  const [proofLog, setProofLog] = useState([]);

  const addLog = useCallback((msg, color = "rgba(232,217,176,0.55)") => {
    setLog(p => [{ msg, color, ts: Date.now() }, ...p].slice(0, 50));
  }, []);

  const runScenario = useCallback(async (id) => {
    if (running) return;
    setRunning(true);
    setScenario(id);
    setCurrentStep(-1);

    const phoenixLang = [
      "Ghost checkpoint located…",
      "Bad state isolated — quarantine active…",
      "Clean state restored from checkpoint…",
      "Ledger updated — append-only record created…",
      "Trusted state recertified — triple mark applied…",
    ];

    addLog(`▶ Scenario started: ${id.replace(/_/g, " ")}`, GOLD);

    for (let i = 0; i < RECOVERY_STEPS.length; i++) {
      setCurrentStep(i);
      addLog(`● ${RECOVERY_STEPS[i].label}: ${RECOVERY_STEPS[i].desc}`, i < 2 ? "#f87171" : i < 4 ? "#fbbf24" : "#4ade80");
      if (i < phoenixLang.length) {
        await delay(400);
        addLog(`  ↳ ${phoenixLang[i]}`, "#a78bfa");
      }
      await delay(600);
    }

    setCurrentStep(RECOVERY_STEPS.length);
    addLog("✓ RECOVERY COMPLETE — system returned to trusted state", "#4ade80");
    setProofLog(p => [...p, { scenario: id, ts: Date.now(), result: "recovered" }]);
    setRunning(false);
  }, [running, addLog]);

  const generateProofLog = useCallback(() => {
    const entry = { scenario: "proof_generation", ts: Date.now(), result: "proof_packet_generated" };
    setProofLog(p => [...p, entry]);
    addLog("📋 Proof log generated — recovery evidence packet created", GOLD);
  }, [addLog]);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold font-cinzel" style={{ color: GOLD }}>Self-Healing Demo</h1>
        <p className="text-xs text-muted-foreground">Safe simulation of failure detection, quarantine, rollback, and Phoenix recovery</p>
      </div>

      {/* Scenario Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SCENARIOS.map(s => {
          const Icon = s.icon;
          return (
            <Button key={s.id} disabled={running} onClick={() => runScenario(s.id)}
              className="h-auto py-4 flex flex-col items-center gap-2 text-xs font-bold"
              style={{ background: `${s.color}10`, color: s.color, border: `1px solid ${s.color}30` }}>
              <Icon className="w-5 h-5" />
              {s.label}
            </Button>
          );
        })}
      </div>

      <div className="flex gap-3 flex-wrap">
        <Button onClick={generateProofLog} disabled={running} className="text-xs font-bold"
          style={{ background: "rgba(201,168,76,0.1)", color: GOLD, border: `1px solid rgba(201,168,76,0.3)` }}>
          Generate Proof Log
        </Button>
        <Button onClick={() => { setLog([]); setProofLog([]); setCurrentStep(-1); setScenario(null); }}
          variant="outline" className="text-xs">
          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
        </Button>
      </div>

      {/* Recovery Pipeline */}
      <div className="rounded-xl border border-border p-5 space-y-4" style={{ background: "hsl(220,18%,7%)" }}>
        <h2 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Recovery Pipeline</h2>
        <div className="space-y-2">
          {RECOVERY_STEPS.map((step, i) => {
            const done = currentStep > i;
            const active = currentStep === i;
            const color = done ? "#4ade80" : active ? "#fbbf24" : "rgba(255,255,255,0.15)";
            return (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0">
                <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: color, background: done ? "rgba(34,197,94,0.1)" : "transparent" }}>
                  {done ? <CheckCircle2 className="w-4 h-4 text-green-400" /> :
                   active ? <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" /> :
                   <span className="text-[10px] font-mono" style={{ color }}>{i + 1}</span>}
                </div>
                <div>
                  <div className="text-xs font-semibold" style={{ color }}>{step.label}</div>
                  <div className="text-[10px] text-muted-foreground">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
        {currentStep >= RECOVERY_STEPS.length && (
          <div className="rounded-lg p-3 text-center" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <span className="text-xs font-bold text-green-400">✓ System returned to trusted state — Phoenix recovery complete</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Log */}
        <div className="rounded-xl border border-border p-5 space-y-3" style={{ background: "hsl(220,18%,7%)" }}>
          <h2 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Activity Log</h2>
          <div className="max-h-64 overflow-y-auto space-y-1 font-mono">
            {log.length === 0 ? (
              <div className="text-[10px] text-muted-foreground text-center py-8">Run a scenario to see activity.</div>
            ) : log.map((e, i) => (
              <div key={i} className="text-[10px] flex items-start gap-2">
                <span className="text-muted-foreground flex-shrink-0">{moment(e.ts).format("HH:mm:ss")}</span>
                <span style={{ color: e.color }}>{e.msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Proof Log */}
        <div className="rounded-xl border border-border p-5 space-y-3" style={{ background: "hsl(220,18%,7%)" }}>
          <h2 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Proof Log</h2>
          {proofLog.length === 0 ? (
            <div className="text-[10px] text-muted-foreground text-center py-8">No proof entries yet.</div>
          ) : proofLog.map((p, i) => (
            <div key={i} className="flex items-center justify-between text-[10px] py-1.5 border-b border-border/20 last:border-0">
              <span className="text-foreground">{p.scenario.replace(/_/g, " ")}</span>
              <Badge className="text-[8px] border" style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80", borderColor: "rgba(34,197,94,0.3)" }}>
                {p.result}
              </Badge>
              <span className="text-muted-foreground">{moment(p.ts).format("HH:mm:ss")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}