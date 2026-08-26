import React from "react";
import { Network } from "lucide-react";
import { SYSTEM_COMPONENTS } from "@/lib/systemRegistry";

const COLORS = {
  verified_runtime: "#4ade80",
  local_ui: "#60a5fa",
  blocked_listener_unverified: "#f59e0b",
  blocked_no_runtime_interface: "#ef4444",
};

export default function AVAStatusGrid({ health = {} }) {
  const items = SYSTEM_COMPONENTS.map((component) => {
    const observed = health[component.id];
    const state = observed?.status || component.status;
    return {
      name: component.name,
      status: state,
      detail: component.role,
      color: COLORS[state] || "#94a3b8",
    };
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map(({ name, status, detail, color }) => (
        <div key={name} className="rounded-xl border p-4" style={{ background: "rgba(0,0,0,0.45)", borderColor: `${color}28` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
              <Network className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <div className="text-xs font-black" style={{ color }}>{name}</div>
              <div className="text-[10px] text-muted-foreground">{status}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{detail}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
