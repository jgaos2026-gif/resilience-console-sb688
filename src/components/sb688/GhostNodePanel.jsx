import React, { useState, useCallback } from "react";
import { Eye, AlertTriangle, CheckCircle2, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Ghost node alert log — simulated sensor events
const GHOST_ALERT_LIBRARY = [
  { id: 1, severity: "high",   ts: null, source: "ghost-alpha", type: "Suspicious Probe", msg: "Unauthorized read attempt detected against trusted state boundary. Ghost node absorbed probe — core modules not exposed.", action: "Probe logged and quarantined" },
  { id: 2, severity: "medium", ts: null, source: "ghost-beta",  type: "Invalid State Transition", msg: "Attempted state write with unverified signature. Ghost node rejected transition before it could reach the trusted chain.", action: "Transition rejected, hash mismatch logged" },
  { id: 3, severity: "high",   ts: null, source: "ghost-alpha", type: "Lateral Movement Attempt", msg: "Anomalous cross-module traversal pattern detected. Ghost node surfaced the telemetry — no trusted modules were reached.", action: "Movement vector blocked, audit trail updated" },
  { id: 4, severity: "low",    ts: null, source: "ghost-beta",  type: "Telemetry Anomaly", msg: "Unusual scan pattern observed on mesh boundary. Ghost node telemetry flagged for operator review.", action: "Flagged for review, no state change" },
  { id: 5, severity: "high",   ts: null, source: "ghost-alpha", type: "Tamper Probe Against Ledger", msg: "Unauthenticated write attempt targeting append-only ledger detected. Ghost node surfaced the attempt — ledger integrity maintained.", action: "Write blocked, tamper event recorded" },
];

const SEVERITY_CONFIG = {
  high:   { color: "text-red-400",   border: "border-red-500/20",   bg: "bg-red-500/5",   dot: "bg-red-400",   label: "HIGH" },
  medium: { color: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/5", dot: "bg-amber-400", label: "MEDIUM" },
  low:    { color: "text-blue-400",  border: "border-blue-500/20",  bg: "bg-blue-500/5",  dot: "bg-blue-400",  label: "LOW" },
};

export default function GhostNodePanel({ state }) {
  const [alerts, setAlerts] = useState([]);
  const [nextIdx, setNextIdx] = useState(0);
  const [monitoring, setMonitoring] = useState(false);

  const simulateAlert = useCallback(() => {
    const alert = { ...GHOST_ALERT_LIBRARY[nextIdx % GHOST_ALERT_LIBRARY.length], ts: Date.now(), uid: Date.now() };
    setAlerts(prev => [alert, ...prev].slice(0, 20));
    setNextIdx(i => i + 1);
  }, [nextIdx]);

  const toggleMonitoring = useCallback(() => {
    setMonitoring(v => !v);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
    setNextIdx(0);
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Ghost Node Alerts
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xl leading-relaxed">
            Ghost nodes are simulated defensive sensor modules deployed at mesh boundaries. They surface suspicious probing, invalid state attempts, and anomalous traversal patterns — without exposing trusted core modules. This is a simulated defensive sensor within this demo console.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${monitoring ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
          <span className="text-[10px] text-muted-foreground">{monitoring ? "Ghost Monitoring Active" : "Monitoring Standby"}</span>
        </div>
      </div>

      {/* Ghost Node Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "Ghost Node Alpha", src: "ghost-alpha", desc: "Mesh boundary sensor — deployed at the outer perimeter of the trusted state zone.", active: true },
          { label: "Ghost Node Beta", src: "ghost-beta",  desc: "Internal decoy sensor — positioned near high-value module boundaries to detect lateral probes.", active: true },
          { label: "Ghost Brick (Disposable)", src: "ghost-brick", desc: "A disposable decoy brick that mimics a real trusted module. Lures unauthorized access attempts, absorbs probes, and reports telemetry without affecting real state.", active: false },
        ].map((node, i) => (
          <div key={i} className={`bg-card border rounded-xl p-4 space-y-2 ${node.active ? "border-primary/20" : "border-border"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className={`w-4 h-4 ${node.active ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                <span className="text-xs font-bold text-foreground">{node.label}</span>
              </div>
              <Badge className={`text-[9px] border ${node.active ? "bg-teal-500/10 text-teal-400 border-teal-500/30" : "bg-secondary text-muted-foreground border-border"}`}>
                {node.active ? "SENSOR ACTIVE" : "STANDBY"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{node.desc}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={simulateAlert} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
          <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
          Simulate Ghost Alert
        </Button>
        <Button onClick={toggleMonitoring} variant="outline" className="border-border text-foreground text-xs">
          <Radio className="w-3.5 h-3.5 mr-1.5" />
          {monitoring ? "Pause Monitoring" : "Activate Monitoring"}
        </Button>
        {alerts.length > 0 && (
          <Button onClick={clearAlerts} variant="outline" className="border-border text-muted-foreground text-xs">
            Clear Alerts
          </Button>
        )}
      </div>

      {/* Alert Feed */}
      {alerts.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-6 text-center space-y-2">
          <Eye className="w-8 h-8 text-muted-foreground/30 mx-auto" />
          <p className="text-xs text-muted-foreground">No ghost node alerts yet. Simulate an alert or activate monitoring to see telemetry.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {alerts.map((alert, i) => {
            const cfg = SEVERITY_CONFIG[alert.severity];
            return (
              <div key={alert.uid} className={`bg-card border rounded-xl p-4 space-y-2 ${cfg.border}`}>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <span className="text-xs font-bold text-foreground">{alert.type}</span>
                    <Badge className={`text-[9px] border ${cfg.bg} ${cfg.color} ${cfg.border}`}>{cfg.label}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="text-[9px] border bg-secondary text-muted-foreground border-border">{alert.source}</Badge>
                    <span className="text-[9px] text-muted-foreground font-mono">{new Date(alert.ts).toLocaleTimeString()}</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{alert.msg}</p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-teal-400 flex-shrink-0" />
                  <span className="text-[10px] text-teal-400 font-medium">{alert.action}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-secondary/40 border border-border rounded-xl p-4 text-[11px] text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Defensive Sensor Disclosure:</strong> Ghost nodes and ghost bricks are simulated defensive decoys within this demo console.
        In a production deployment, ghost nodes would be deployed as isolated sensor modules that surface suspicious behavior through telemetry — without exposing real trusted state.
        This platform uses ghost-node telemetry to demonstrate containment and recoverability, not to claim perfect intrusion prevention.
      </div>
    </div>
  );
}