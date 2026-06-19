import React, { useEffect, useRef } from "react";

const TYPE_STYLES = {
  info: { color: "#60a5fa", prefix: "INFO" },
  warn: { color: "#fbbf24", prefix: "WARN" },
  error: { color: "#f87171", prefix: "CRIT" },
  success: { color: "#4ade80", prefix: "HEAL" },
};

export default function SimLog({ logs, running, phase, total }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const progress = total > 0 ? Math.round((phase / (total - 1)) * 100) : 0;

  return (
    <div className="rounded-2xl border border-border overflow-hidden" style={{ background: "hsl(220,20%,5%)" }}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">System Log</span>
        {running && (
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[9px] font-mono text-green-400">{progress}% COMPLETE</span>
          </div>
        )}
      </div>
      <div className="p-3 space-y-1 h-64 overflow-y-auto font-mono text-[10px]">
        {logs.length === 0 && (
          <div className="text-muted-foreground text-center py-8">
            Select a scenario and run the simulation to see live system logs.
          </div>
        )}
        {logs.map((log, i) => {
          const s = TYPE_STYLES[log.type] || TYPE_STYLES.info;
          return (
            <div key={log.id} className="flex items-start gap-2 animate-in fade-in duration-300">
              <span className="font-bold flex-shrink-0 w-8" style={{ color: s.color }}>[{s.prefix}]</span>
              <span style={{ color: s.color === "#f87171" ? "#fca5a5" : s.color === "#fbbf24" ? "#fde68a" : "rgba(232,220,180,0.8)" }}>
                {log.msg}
              </span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
    </div>
  );
}