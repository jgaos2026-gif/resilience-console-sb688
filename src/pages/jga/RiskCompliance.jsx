/**
 * RiskCompliance.jsx — Wired to real /api/verification (compliance view)
 */
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Shield, Lock, Eye } from "lucide-react";
import api from "@/api/apiClient";

const GOLD = "#C9A84C";

const CHECKPOINTS = [
  "Deposit collected before work begins",
  "24-hour refund window enforced",
  "Watermark applied to all proofs",
  "Final files held until payment confirmed",
  "Contractor uploads quarantined before client view",
  "Triple verification on all state transitions",
  "Append-only logging — no record deletions",
  "Human approval required for escalations",
  "Privacy-first — no unnecessary data collection",
  "All braid topology invariants logged and auditable",
];

export default function RiskCompliance() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["stateItems"],
    queryFn:  () => api.get("/api/verification"),
    refetchInterval: 30000,
  });

  const { data: scan } = useQuery({
    queryKey: ["recovery-scan"],
    queryFn:  () => api.get("/api/recovery/scan"),
    refetchInterval: 30000,
  });

  const total   = items.length;
  const trusted = items.filter(i => i.current_stage === "trusted").length;
  const rejected = items.filter(i => i.current_stage === "rejected").length;
  const passRate = total > 0 ? ((trusted / total) * 100).toFixed(1) : "—";
  const anomalies = scan?.anomalies || [];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold font-mono" style={{ color: GOLD }}>Risk / Compliance</h1>
        <p className="text-xs text-muted-foreground">Audit readiness, policy tracking, and braid integrity monitoring</p>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pass Rate",    value: `${passRate}%`, color: "#4ade80", icon: CheckCircle2 },
          { label: "Trusted",      value: trusted,         color: "#4ade80", icon: Lock },
          { label: "Rejected",     value: rejected,         color: "#f87171", icon: AlertTriangle },
          { label: "Anomalies",    value: anomalies.length, color: anomalies.length === 0 ? "#4ade80" : "#f87171", icon: Shield },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-border p-4" style={{ background: "hsl(220,18%,7%)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</span>
                <Icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <p className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <div className="rounded-xl border border-red-900/40 p-5 space-y-2" style={{ background: "rgba(239,68,68,0.04)" }}>
          <h2 className="text-sm font-bold font-mono text-red-400">Active Topology Anomalies</h2>
          {anomalies.map(a => (
            <div key={a.id} className="rounded-lg border border-red-900/30 p-3 space-y-1">
              <p className="text-xs font-bold font-mono text-red-400">{a.name}</p>
              {a.errors.map((e, i) => <p key={i} className="text-[9px] font-mono text-red-300">⚠ {e}</p>)}
            </div>
          ))}
        </div>
      )}

      {/* Policy Checkpoints */}
      <div className="rounded-xl border border-border p-5 space-y-3" style={{ background: "hsl(220,18%,7%)" }}>
        <h2 className="text-sm font-bold font-mono" style={{ color: GOLD }}>Operational Policy Checkpoints</h2>
        <div className="space-y-2">
          {CHECKPOINTS.map((cp, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-400" />
              <span className="text-xs text-foreground">{cp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* High-risk items */}
      {items.filter(i => i.risk_score > 50).length > 0 && (
        <div className="rounded-xl border border-border p-5 space-y-3" style={{ background: "hsl(220,18%,7%)" }}>
          <h2 className="text-sm font-bold font-mono text-amber-400">High-Risk Items (risk_score &gt; 50)</h2>
          <div className="space-y-2">
            {items.filter(i => i.risk_score > 50).map(i => (
              <div key={i.id} className="flex items-center justify-between text-[10px] font-mono py-1.5 border-b border-border/20 last:border-0">
                <span className="truncate text-foreground">{i.data}</span>
                <span className="ml-4 text-amber-400 flex-shrink-0">risk={i.risk_score}</span>
                <span className="ml-3 flex-shrink-0" style={{ color: i.current_stage === "trusted" ? "#4ade80" : "#fbbf24" }}>
                  {i.current_stage}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
