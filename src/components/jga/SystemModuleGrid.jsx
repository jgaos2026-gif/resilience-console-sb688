import React from "react";

const GOLD = "#C9A84C";

const MODULES = [
  { code: "SB688", name: "Sovereign Stitch", color: GOLD, activeOn: ["healthy", "warning", "corrupted", "healing", "recovering"] },
  { code: "SB689", name: "Runtime Guard", color: "#60a5fa", activeOn: ["warning", "corrupted", "healing"] },
  { code: "SB712", name: "Möbius Runtime", color: "#a78bfa", activeOn: ["healing", "recovering", "healthy"] },
  { code: "OMEGA", name: "Integration Layer", color: "#f59e0b", activeOn: ["recovering", "healthy"] },
  { code: "TVE", name: "Triple Verify", color: "#84cc16", activeOn: ["corrupted", "healing", "recovering"] },
  { code: "PHOENIX", name: "Recovery Proto", color: "#ef4444", activeOn: ["corrupted", "healing", "recovering"] },
  { code: "BRAID", name: "Memory Braid", color: "#06b6d4", activeOn: ["warning", "corrupted", "healing", "recovering"] },
  { code: "RAM-G", name: "RAM Guard", color: "#ec4899", activeOn: ["warning", "corrupted", "healing"] },
  { code: "HUNTER", name: "Ghost Nodes", color: "#94a3b8", activeOn: ["corrupted", "healing"] },
  { code: "AVA", name: "AI Layer", color: "#818cf8", activeOn: ["healthy", "recovering"] },
];

const STATE_STATUS = {
  healthy: "NOMINAL",
  warning: "ALERT",
  corrupted: "ENGAGED",
  healing: "HEALING",
  recovering: "RESTORING",
};

export default function SystemModuleGrid({ braidState, scenario }) {
  return (
    <div className="rounded-2xl border border-border overflow-hidden" style={{ background: "hsl(220,18%,7%)" }}>
      <div className="px-4 py-2 border-b border-border">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">SB Module Status</span>
      </div>
      <div className="p-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
        {MODULES.map(m => {
          const active = m.activeOn.includes(braidState);
          const status = active ? STATE_STATUS[braidState] : "STANDBY";
          const pulse = active && (braidState === "corrupted" || braidState === "healing");
          return (
            <div
              key={m.code}
              className="rounded-lg p-2 text-center transition-all"
              style={{
                background: active ? `${m.color}12` : "rgba(0,0,0,0.2)",
                border: `1px solid ${active ? m.color + "40" : "rgba(255,255,255,0.05)"}`,
              }}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pulse ? "animate-pulse" : ""}`}
                  style={{ background: active ? m.color : "#374151" }}
                />
              </div>
              <div className="text-[9px] font-bold font-mono" style={{ color: active ? m.color : "#4b5563" }}>{m.code}</div>
              <div className="text-[7px] text-muted-foreground">{m.name}</div>
              <div className="text-[7px] font-mono mt-0.5" style={{ color: active ? m.color : "#374151" }}>{status}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}