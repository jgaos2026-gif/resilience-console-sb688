import React from "react";
import { INDUSTRIES, SCENARIOS } from "@/lib/sb688Engine";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, RotateCcw, Zap, Trash2, ShieldCheck, Loader2 } from "lucide-react";

const ROUTE_NODES = [
  { value: "core", label: "Core" },
  { value: "driver_net", label: "Exchange Network" },
  { value: "fs", label: "State Vault" },
  { value: "user_app", label: "Operator Console" },
  { value: "braidA", label: "Braid Alpha" },
  { value: "braidB", label: "Braid Beta" },
];

export default function ControlPanel({
  state,
  onIndustryChange,
  onScenarioChange,
  onRouteStartChange,
  onRouteEndChange,
  onLoadScenario,
  onSimulate,
  onRecover,
  onReset,
  onProof,
  onClear,
}) {
  const industry = INDUSTRIES[state.industry];

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Control Panel</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Industry</label>
          <Select value={state.industry} onValueChange={onIndustryChange}>
            <SelectTrigger className="bg-secondary border-border text-foreground w-full truncate">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(INDUSTRIES).map((ind) => (
                <SelectItem key={ind.id} value={ind.id}>{ind.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Scenario</label>
          <Select value={state.scenario || ""} onValueChange={onScenarioChange}>
            <SelectTrigger className="bg-secondary border-border text-foreground">
              <SelectValue placeholder="Select scenario..." />
            </SelectTrigger>
            <SelectContent>
              {Object.values(SCENARIOS).map((sc) => (
                <SelectItem key={sc.id} value={sc.id}>{sc.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Route Start</label>
          <Select value={state.routeStart} onValueChange={onRouteStartChange}>
            <SelectTrigger className="bg-secondary border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROUTE_NODES.map((n) => (
                <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Route End</label>
          <Select value={state.routeEnd} onValueChange={onRouteEndChange}>
            <SelectTrigger className="bg-secondary border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROUTE_NODES.map((n) => (
                <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Button
          onClick={onLoadScenario}
          disabled={!state.scenario}
          className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold"
        >
          <Loader2 className="w-3.5 h-3.5 mr-1.5" /> Load Scenario
        </Button>
        <Button
          onClick={onSimulate}
          disabled={!state.scenarioLoaded || state.problemSimulated}
          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
        >
          <Play className="w-3.5 h-3.5 mr-1.5" /> Start Problem
        </Button>
        <Button
          onClick={onRecover}
          disabled={!state.problemSimulated}
          className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
        >
          <Zap className="w-3.5 h-3.5 mr-1.5" /> Smart Recovery
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
          className="border-border text-foreground hover:bg-secondary text-xs font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Factory Reset
        </Button>
        <Button
          onClick={onProof}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
        >
          <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Run Proof Suite
        </Button>
        <Button
          onClick={onClear}
          variant="outline"
          className="border-border text-muted-foreground hover:bg-secondary text-xs font-semibold"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear Results
        </Button>
      </div>
    </div>
  );
}