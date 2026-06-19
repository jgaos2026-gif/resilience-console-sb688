import React from "react";

const GOLD = "#C9A84C";

const ALL_SILENCE = [
  "Quarantine Silence", "Spine Silence", "Chain-Link Silence",
  "Memory Pocket Silence", "Heartbeat Silence", "Recovery Silence",
];

export default function SilenceMeshStatus({ braidState, activeEvent }) {
  const active = activeEvent?.silenceMesh || [];
  const stateActive = {
    healthy: ["Spine Silence", "Memory Pocket Silence"],
    drifting: ["Heartbeat Silence", "Chain-Link Silence", "Spine Silence"],
    corrupted: [...active],
    healing: ["Recovery Silence", "Spine Silence", "Chain-Link Silence"],
    recovering: ["Recovery Silence", "Spine Silence"],
    certified: ["Spine Silence", "Memory Pocket Silence"],
  }[braidState] || ["Spine Silence"];

  return (
    <div className="rounded-2xl border border-border overflow-hidden" style={{ background: "hsl(220,18%,7%)" }}>
      <div className="px-4 py-2.5 border-b border-border">
        <h3 className="text-[10px] font-bold font-cinzel" style={{ color: GOLD }}>Silence Mesh Status</h3>
        <p className="text-[8px] text-muted-foreground">Active containment layers</p>
      </div>
      <div className="p-3 space-y-1.5">
        {ALL_SILENCE.map(s => {
          const on = stateActive.includes(s) || active.includes(s);
          return (
            <div key={s} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-all"
              style={on ? { background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)" }
                : { background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: on ? GOLD : "#374151" }} />
              <span className="text-[9px] font-mono" style={{ color: on ? "#e2d9b3" : "#374151" }}>{s}</span>
              <span className="ml-auto text-[7px] font-bold" style={{ color: on ? GOLD : "#374151" }}>{on ? "ACTIVE" : "IDLE"}</span>
            </div>
          );
        })}
        {active.filter(a => !ALL_SILENCE.includes(a)).map(s => (
          <div key={s} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[9px] font-mono text-amber-200">{s}</span>
            <span className="ml-auto text-[7px] font-bold text-amber-400">ACTIVE</span>
          </div>
        ))}
        <div className="pt-1 text-[8px] text-muted-foreground text-center font-mono">
          Silence Mesh Law: Bad signals are contained before they become system noise.
        </div>
      </div>
    </div>
  );
}