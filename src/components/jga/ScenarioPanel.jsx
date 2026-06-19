import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw } from "lucide-react";

const GOLD = "#C9A84C";
const SEV_COLORS = { CRITICAL: "#ef4444", HIGH: "#f97316", EXTREME: "#dc2626" };

export default function ScenarioPanel({ scenarios, selected, onSelect, onRun, onReset, running }) {
  return (
    <div className="rounded-2xl border border-border space-y-0 overflow-hidden" style={{ background: "hsl(220,18%,7%)" }}>
      <div className="px-5 py-3 border-b border-border">
        <h2 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Choose a Catastrophe</h2>
        <p className="text-[10px] text-muted-foreground">Select a real-world failure scenario and run the simulation</p>
      </div>

      <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
        {scenarios.map(s => {
          const isSelected = selected?.id === s.id;
          return (
            <button
              key={s.id}
              onClick={() => !running && onSelect(s)}
              disabled={running}
              className="w-full text-left rounded-xl p-3 transition-all border"
              style={isSelected
                ? { background: `${s.color}12`, borderColor: `${s.color}40` }
                : { background: "rgba(0,0,0,0.2)", borderColor: "rgba(255,255,255,0.05)" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{s.label}</span>
                    <Badge className="text-[7px] border font-bold px-1 py-0" style={{ background: `${SEV_COLORS[s.severity]}10`, color: SEV_COLORS[s.severity], borderColor: `${SEV_COLORS[s.severity]}30` }}>
                      {s.severity}
                    </Badge>
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{s.desc}</div>
                </div>
              </div>
              {isSelected && (
                <div className="mt-2 text-[9px] font-mono" style={{ color: s.color }}>
                  MODULE: {s.branch}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="px-4 py-3 border-t border-border space-y-2">
          <div className="text-[10px] text-muted-foreground leading-relaxed">{selected.desc}</div>
          <div className="flex gap-2">
            <Button
              onClick={onRun}
              disabled={running}
              className="flex-1 text-xs font-bold h-9"
              style={{ background: running ? "rgba(34,197,94,0.1)" : `linear-gradient(135deg, ${selected.color}, ${selected.color}aa)`, color: running ? "#4ade80" : "#0a0c10" }}
            >
              <Play className="w-3.5 h-3.5 mr-1" />
              {running ? "Simulation Running…" : "Run Simulation"}
            </Button>
            <Button onClick={onReset} variant="outline" className="text-xs h-9 px-3" disabled={running}>
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}