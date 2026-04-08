import React from "react";
import { INDUSTRIES } from "@/lib/sb688Engine";
import { Route, Clock, ArrowRight } from "lucide-react";

export default function RouteInspector({ state }) {
  const industry = INDUSTRIES[state.industry];
  const hasRoute = state.approvedRoute.length >= 2;

  const routeLabels = state.approvedRoute.map(
    (key) => industry.components[key]?.label || key
  );

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
        <Route className="w-3.5 h-3.5" /> Route Inspector
      </h3>
      {hasRoute ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {routeLabels.map((label, i) => (
              <React.Fragment key={i}>
                <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                  {label}
                </span>
                {i < routeLabels.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Route time: <span className="text-foreground font-semibold">{state.routeTime}ms</span>
            </span>
            <span>
              Type: <span className={`font-semibold ${state.routeType === "primary" ? "text-teal-400" : "text-amber-400"}`}>
                {state.routeType === "primary" ? "Primary" : "Alternate"}
              </span>
            </span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">No approved route currently established.</p>
      )}
    </div>
  );
}