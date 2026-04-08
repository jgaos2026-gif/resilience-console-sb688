import React from "react";
import { Shield, Route, FileCheck, Activity, Award } from "lucide-react";

const kpiConfig = [
  { key: "operationalState", label: "Operational State", icon: Activity },
  { key: "resilienceScore", label: "Resilience Score", icon: Shield, suffix: "%" },
  { key: "approvedRoute", label: "Approved Route", icon: Route },
  { key: "trustedRecordVersion", label: "Trusted Record", icon: FileCheck, prefix: "v" },
  { key: "proofScore", label: "Proof Suite", icon: Award },
];

export default function KpiStrip({ state }) {
  const passCount = state.proofResults.filter((p) => p.pass).length;
  const total = state.proofResults.length;
  const values = {
    operationalState: state.operationalState,
    resilienceScore: state.resilienceScore,
    approvedRoute: state.routeType === "primary" ? "Primary Active" : state.routeType === "alternate" ? "Alternate Active" : "—",
    trustedRecordVersion: state.trustedRecordVersion,
    proofScore: state.proofRun ? `${passCount}/${total}` : "Not Run",
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {kpiConfig.map((kpi) => {
        const Icon = kpi.icon;
        const val = values[kpi.key];
        const display = `${kpi.prefix || ""}${val}${kpi.suffix || ""}`;
        const isNominal = state.operationalState === "Nominal";
        const stateColor = kpi.key === "operationalState"
          ? isNominal ? "text-teal-400" : "text-amber-400"
          : "";

        return (
          <div
            key={kpi.key}
            className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2 transition-all duration-300"
          >
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider">
              <Icon className="w-3.5 h-3.5 text-primary" />
              {kpi.label}
            </div>
            <div className={`text-lg font-bold ${stateColor || "text-foreground"}`}>
              {display}
            </div>
          </div>
        );
      })}
    </div>
  );
}