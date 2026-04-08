import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileCheck, Clock } from "lucide-react";
import moment from "moment";

export default function TrustedRecordLog({ state }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
        <FileCheck className="w-3.5 h-3.5" /> Trusted Record & Event Log
      </h3>

      {/* Trusted Records */}
      <div className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Trusted Chain</p>
        <ScrollArea className="h-32">
          <div className="space-y-1.5 pr-3">
            {state.trustedRecords.map((tr, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-secondary/40 border border-border/40 text-xs">
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-primary/10 text-primary border-primary/30 flex-shrink-0">
                  v{tr.version}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground/80 leading-tight">{tr.message}</p>
                  <p className="text-[9px] text-muted-foreground/50 font-mono mt-0.5">{tr.hash}</p>
                </div>
                <Badge variant="outline" className="text-[9px] px-1 py-0 bg-teal-500/10 text-teal-400 border-teal-500/20 flex-shrink-0">
                  {tr.status}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Event Log */}
      <div className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Event Log</p>
        <ScrollArea className="h-40">
          <div className="space-y-1 pr-3">
            {state.eventLog.map((entry, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5 text-xs border-b border-border/20 last:border-0">
                <Clock className="w-3 h-3 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                <span className="text-foreground/70 leading-tight">{entry.message}</span>
                <span className="text-[9px] text-muted-foreground/40 ml-auto flex-shrink-0">
                  {moment(entry.timestamp).format("HH:mm:ss")}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}