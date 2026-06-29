import React from "react";
import { Cpu, Lock, ShieldCheck, AlertTriangle } from "lucide-react";

const GOLD = "#C9A84C";
const CHECKS = [
  ["Health", "100 GREEN", "#4ade80"],
  ["RAM", "53% SAFE", "#4ade80"],
  ["Watchdog", "TRUSTED", "#60a5fa"],
  ["Spine", "LOCKED", GOLD],
  ["Mesh", "LOCKED", GOLD],
  ["Promotion", "DENIED UNTIL MARKED", "#f87171"],
];

export default function DevicePassportPanel() {
  return (
    <div className="rounded-2xl border p-4 space-y-4" style={{ background: "linear-gradient(135deg,#050505,#100d05)", borderColor: `${GOLD}28` }}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3"><Cpu className="w-5 h-5" style={{ color: GOLD }} /><div><h3 className="text-sm font-black" style={{ color: GOLD }}>OMEGA-72 Device Passport</h3><p className="text-[10px] text-muted-foreground">DESKTOP-9D6F0A1 · Windows 10 · ProBook 8GB Safe Mode V4</p></div></div>
        <Lock className="w-5 h-5" style={{ color: GOLD }} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {CHECKS.map(([label, value, color]) => <div key={label} className="rounded-lg border p-3" style={{ borderColor: `${color}24`, background: `${color}08` }}><div className="text-[8px] uppercase text-muted-foreground">{label}</div><div className="text-[10px] font-black" style={{ color }}>{value}</div></div>)}
      </div>
      <div className="rounded-xl border p-3 flex items-start gap-2" style={{ borderColor: "rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.06)" }}>
        <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">Promotion stays denied until quarantine and hunter marks are proven clean. That is the point: power is not trusted just because it looks strong.</p>
      </div>
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest" style={{ color: GOLD }}><ShieldCheck className="w-4 h-4" /> No active state becomes trusted without verification.</div>
    </div>
  );
}