import React, { useState, useCallback } from "react";
import { XOctagon, RotateCcw, CheckCircle2, AlertTriangle, Shield, Play, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { INDUSTRIES } from "@/lib/sb688Engine";

const QUARANTINE_STEPS = [
  { id: "detect",    label: "Detect Compromise",           desc: "Suspicious or compromised module identified via state hash mismatch or ghost-node telemetry.", icon: AlertTriangle, color: "text-red-400" },
  { id: "detach",    label: "Detach from Trusted Mesh",    desc: "Module is immediately detached from the trusted mesh. No state promotion from this point forward.", icon: XOctagon, color: "text-red-400" },
  { id: "quarantine",label: "Isolate to Disposable Sandbox", desc: "Module is moved into an isolated, disposable quarantine container. Cannot write to or read from trusted state.", icon: Shield, color: "text-amber-400" },
  { id: "block",     label: "Block State Promotion",       desc: "All pending state writes from the quarantined module are blocked and discarded.", icon: XOctagon, color: "text-amber-400" },
  { id: "terminate", label: "Terminate Compromised Runtime", desc: "The compromised runtime is terminated within the disposable container. No attempt is made to repair it in-place.", icon: XOctagon, color: "text-red-400" },
  { id: "restore",   label: "Restore from Trusted Checkpoint", desc: "A new module instance is provisioned from the last cryptographically verified, approved checkpoint.", icon: RotateCcw, color: "text-blue-400" },
  { id: "revalidate",label: "Revalidate Dependencies",     desc: "All modules that depend on the restored component are revalidated against expected state before traffic resumes.", icon: GitBranch, color: "text-primary" },
  { id: "heal",      label: "Heal System Around Compromise", desc: "The system heals around the compromise. The trusted mesh re-knits without the quarantined runtime.", icon: CheckCircle2, color: "text-teal-400" },
];

function QuarantineSequence({ componentKey, componentLabel, onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);
  const [running, setRunning] = useState(false);

  const runNextStep = useCallback(async () => {
    if (currentStep >= QUARANTINE_STEPS.length) {
      setDone(true);
      onComplete && onComplete();
      return;
    }
    setRunning(true);
    await new Promise(r => setTimeout(r, 600));
    setCurrentStep(s => s + 1);
    setRunning(false);
  }, [currentStep, onComplete]);

  const autoRun = useCallback(async () => {
    setRunning(true);
    for (let i = currentStep; i < QUARANTINE_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 500));
      setCurrentStep(i + 1);
    }
    setDone(true);
    setRunning(false);
    onComplete && onComplete();
  }, [currentStep, onComplete]);

  return (
    <div className="bg-card border border-red-500/20 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <span className="text-xs font-bold text-red-400">Quarantine Sequence — {componentLabel}</span>
          {done && <Badge className="ml-2 text-[9px] bg-teal-500/10 text-teal-400 border border-teal-500/30">REBUILT</Badge>}
          {!done && currentStep > 0 && <Badge className="ml-2 text-[9px] bg-red-500/10 text-red-400 border border-red-500/30">QUARANTINED</Badge>}
        </div>
        {!done && (
          <div className="flex gap-2">
            <Button onClick={runNextStep} disabled={running || done} size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs">
              <Play className="w-3 h-3 mr-1" /> Step
            </Button>
            <Button onClick={autoRun} disabled={running || done} size="sm" variant="outline" className="border-border text-xs">
              Run All
            </Button>
            <Button onClick={onCancel} disabled={running} size="sm" variant="outline" className="border-border text-muted-foreground text-xs">
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {QUARANTINE_STEPS.map((step, i) => {
          const Icon = step.icon;
          const isComplete = i < currentStep;
          const isActive = i === currentStep && !done;
          return (
            <div key={step.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${
              isComplete ? "bg-teal-500/5 border-teal-500/20 opacity-100" :
              isActive   ? "bg-amber-500/5 border-amber-500/30 animate-pulse" :
              "bg-secondary/20 border-border/30 opacity-40"
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isComplete ? "bg-teal-500/20" : isActive ? "bg-amber-500/20" : "bg-secondary"
              }`}>
                {isComplete ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> : <Icon className={`w-3.5 h-3.5 ${isActive ? step.color : "text-muted-foreground"}`} />}
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">{step.label}</div>
                <div className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {done && (
        <div className="p-3 rounded-lg bg-teal-500/5 border border-teal-500/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <div>
            <span className="text-xs font-bold text-teal-400">System healed around compromise. </span>
            <span className="text-[11px] text-muted-foreground">Module rebuilt from trusted checkpoint. Mesh re-knitted without the compromised runtime.</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuarantinePanel({ state }) {
  const [activeSequence, setActiveSequence] = useState(null);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState("driver_net");

  const industry = INDUSTRIES[state?.industry || "universal"];

  const startQuarantine = useCallback(() => {
    setActiveSequence({ key: selectedTarget, label: industry.components[selectedTarget]?.label || selectedTarget, ts: Date.now() });
  }, [selectedTarget, industry]);

  const handleComplete = useCallback(() => {
    setCompletedEvents(prev => [{
      key: activeSequence.key,
      label: activeSequence.label,
      ts: activeSequence.ts,
      completedTs: Date.now(),
    }, ...prev]);
  }, [activeSequence]);

  const handleCancel = useCallback(() => {
    setActiveSequence(null);
  }, []);

  const handleDone = useCallback(() => {
    setActiveSequence(null);
  }, []);

  const compromised = Object.entries(state?.components || {}).filter(([, c]) => c.status === "isolated" || c.status === "degraded");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <XOctagon className="w-5 h-5 text-red-400" />
          Quarantine Events
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5 max-w-xl leading-relaxed">
          Demonstrates defensive disposable containment. Suspicious or compromised modules are detached from the trusted mesh, isolated in a disposable sandbox, terminated, and rebuilt from a trusted checkpoint — without repairing the compromised runtime in-place.
        </p>
      </div>

      {/* Live compromised modules */}
      {compromised.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs font-bold text-red-400">Modules Requiring Quarantine Evaluation</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {compromised.map(([key, comp]) => (
              <Badge key={key} className={`text-[10px] border ${comp.status === "isolated" ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"}`}>
                {industry.components[key]?.label || key} — {comp.status.toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Quarantine launcher */}
      {!activeSequence && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Initiate Quarantine Sequence</h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Select a module to simulate the full quarantine-and-rebuild workflow. This demonstrates defensive disposable containment against a compromised runtime.
          </p>
          <div className="flex items-end gap-3 flex-wrap">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Target Module</label>
              <select value={selectedTarget} onChange={e => setSelectedTarget(e.target.value)}
                className="bg-secondary border border-border text-foreground text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-primary/50">
                {Object.entries(industry.components).map(([key, comp]) => (
                  <option key={key} value={key}>{comp.label}</option>
                ))}
              </select>
            </div>
            <Button onClick={startQuarantine} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold">
              <XOctagon className="w-3.5 h-3.5 mr-1.5" />
              Simulate Quarantine
            </Button>
          </div>
        </div>
      )}

      {/* Active sequence */}
      {activeSequence && (
        <QuarantineSequence
          componentKey={activeSequence.key}
          componentLabel={activeSequence.label}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      )}

      {/* Completed quarantine history */}
      {completedEvents.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Quarantine History</h3>
          {completedEvents.map((ev, i) => (
            <div key={i} className="bg-card border border-teal-500/20 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-xs font-bold text-foreground">{ev.label}</span>
                <span className="text-[11px] text-muted-foreground ml-2">— Quarantined, terminated, rebuilt from checkpoint</span>
              </div>
              <div className="flex gap-2">
                <Badge className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/30">QUARANTINED</Badge>
                <Badge className="text-[9px] bg-teal-500/10 text-teal-400 border border-teal-500/30">REBUILT</Badge>
              </div>
              <span className="text-[9px] text-muted-foreground font-mono">{new Date(ev.completedTs).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}

      <div className="bg-secondary/40 border border-border rounded-xl p-4 text-[11px] text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Containment Disclaimer:</strong> This simulation demonstrates the quarantine-and-rebuild pattern.
        It isolates suspicious runtime into a disposable quarantine, rejects unauthorized state transitions, and rebuilds from trusted checkpoints.
        It does not claim to prevent all compromise — it demonstrates that the system can contain and recover around compromise.
      </div>
    </div>
  );
}