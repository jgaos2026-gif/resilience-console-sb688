import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw } from "lucide-react";

const SEV_COLORS = { CRITICAL: "#ef4444", HIGH: "#f97316", EXTREME: "#dc2626" };
const GOLD = "#C9A84C";

export default function SpaceEventPanel({ events, active, onSelect, onRun, onReset, running }) {
  return (
    <div className="rounded-2xl border border-border overflow-hidden" style={{ background: "hsl(220,18%,7%)" }}>
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Space Catastrophe Events</h2>
        <p className="text-[10px] text-muted-foreground">Select event — watch node mesh respond</p>
      </div>
      <div className="p-3 space-y-1.5 max-h-64 overflow-y-auto">
        {events.map(e => {
          const sel = active?.id === e.id;
          return (
            <button key={e.id} onClick={() => !running && onSelect(e)} disabled={running}
              className="w-full text-left rounded-xl p-2.5 transition-all border"
              style={sel ? { background: `${e.color}10`, borderColor: `${e.color}35` } : { background: "rgba(0,0,0,0.2)", borderColor: "rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-2">
                <span className="text-sm">{e.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-foreground">{e.label}</span>
                    <Badge className="text-[7px] border font-bold px-1 py-0" style={{ background: `${SEV_COLORS[e.severity]}10`, color: SEV_COLORS[e.severity], borderColor: `${SEV_COLORS[e.severity]}25` }}>{e.severity}</Badge>
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">{e.desc}</div>
                </div>
              </div>
              {sel && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {e.affectedNodes.map(n => (
                    <span key={n} className="text-[8px] px-1.5 py-0.5 rounded font-mono" style={{ background: `${e.color}12`, color: e.color }}>{n}</span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
      {active && (
        <div className="px-3 py-3 border-t border-border">
          <div className="flex gap-2">
            <Button onClick={onRun} disabled={running} className="flex-1 text-xs font-bold h-8"
              style={{ background: running ? "rgba(34,197,94,0.1)" : `linear-gradient(135deg, ${active.color}, ${active.color}bb)`, color: running ? "#4ade80" : "#0a0c10" }}>
              <Play className="w-3 h-3 mr-1" />
              {running ? "Running…" : "Run Simulation"}
            </Button>
            <Button onClick={onReset} variant="outline" className="text-xs h-8 px-3" disabled={running}>
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}