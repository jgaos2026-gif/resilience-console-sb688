import React from "react";
import { Shield, Brain, Scale, RefreshCcw, Box, Users, Mic, WifiOff } from "lucide-react";

const GOLD = "#C9A84C";
const ITEMS = [
  ["AVA", "Local shell active", Brain, "#4ade80"],
  ["OASIS", "Room-door model mapped", Shield, GOLD],
  ["SB-712", "Verification law loaded", Shield, "#60a5fa"],
  ["Phoenix", "Recovery hooks local", RefreshCcw, "#a78bfa"],
  ["Clip Brick", "Isolation lane ready", Box, "#fb923c"],
  ["System B", "Contractor rules loaded", Users, "#f472b6"],
  ["Compliance", "State-silo doctrine active", Scale, "#4ade80"],
  ["Voice", "Visible launch only", Mic, GOLD],
  ["Adapters", "Offline stubs only", WifiOff, "#94a3b8"],
];

export default function AVAStatusGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {ITEMS.map(([name, status, Icon, color]) => (
        <div key={name} className="rounded-xl border p-4" style={{ background: "rgba(0,0,0,0.45)", borderColor: `${color}28` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <div className="text-xs font-black" style={{ color }}>{name}</div>
              <div className="text-[10px] text-muted-foreground">{status}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}