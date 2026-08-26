import React from "react";
import { INDUSTRIES } from "@/lib/sb688Engine";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, XOctagon, CheckCircle2 } from "lucide-react";

const statusConfig = {
  healthy: { label: "Healthy", color: "bg-teal-500/20 text-teal-400 border-teal-500/30", icon: CheckCircle2 },
  degraded: { label: "Degraded", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: AlertTriangle },
  isolated: { label: "Isolated", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XOctagon },
};

export default function ComponentList({ state }) {
  const industry = INDUSTRIES[state.industry];
  const componentKeys = Object.keys(industry.components);

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">System Components</h3>
      <div className="space-y-2">
        {componentKeys.map((key) => {
          const comp = industry.components[key];
          const status = state.components[key]?.status || "healthy";
          const cfg = statusConfig[status];
          const Icon = cfg.icon;
          const checkpoint = state.components[key]?.checkpointId || "—";

          return (
            <div
              key={key}
              className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50 transition-all duration-300"
            >
              <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${status === "healthy" ? "text-teal-400" : status === "degraded" ? "text-amber-400" : "text-red-400"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">{comp.label}</span>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cfg.color} border`}>
                    {cfg.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{comp.role}</p>
                <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">Checkpoint: {checkpoint}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}