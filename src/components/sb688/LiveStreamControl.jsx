import React from "react";
import { Radio, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LiveStreamControl({ active, onToggle, latestEvent }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Radio className={`w-4 h-4 ${active ? "text-teal-400 animate-pulse" : "text-muted-foreground"}`} />
          <h3 className="text-sm font-bold text-foreground">Live Data Streaming Simulation</h3>
          <Badge className={`text-[9px] border ${active ? "bg-teal-500/10 text-teal-400 border-teal-500/30" : "bg-secondary text-muted-foreground border-border"}`}>
            {active ? "Streaming" : "Paused"}
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Local telemetry drives the health metrics and graphs in real time. AI interpretation stays in the AI Analyst tab.
        </p>
        {latestEvent && <p className="text-[10px] text-primary/70 truncate max-w-3xl">Latest: {latestEvent}</p>}
      </div>
      <Button onClick={onToggle} variant={active ? "outline" : "default"} className="text-xs font-semibold shrink-0">
        {active ? <Pause className="w-3.5 h-3.5 mr-1.5" /> : <Play className="w-3.5 h-3.5 mr-1.5" />}
        {active ? "Pause Stream" : "Start Stream"}
      </Button>
    </div>
  );
}