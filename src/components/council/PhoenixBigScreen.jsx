import React, { useState } from "react";
import { AlertTriangle, Play, RotateCcw, ShieldCheck, Zap } from "lucide-react";

const GOLD = "#C9A84C";
const STAGES = { idle: "STABLE", corrupt: "CORRUPTION EVENT", healing: "PHOENIX 1 WAKE UP", recovered: "99.8% RECOVERED" };

function BraidStrand({ index, stage }) {
  const colors = stage === "corrupt" ? ["#ef4444", "#f97316", "#7f1d1d", "#dc2626"] : stage === "healing" ? ["#ef4444", "#60a5fa", GOLD, "#4ade80"] : [GOLD, "#60a5fa", "#a78bfa", "#4ade80"];
  return <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${72 + index * 4}%`, background: `linear-gradient(90deg, ${colors.join(",")})`, boxShadow: stage === "corrupt" ? "0 0 18px #ef4444" : `0 0 14px ${colors[index % colors.length]}`, transform: stage === "corrupt" ? `translateX(${index % 2 ? -8 : 8}px)` : "translateX(0)" }} />;
}

function TriangleNode({ stage }) {
  const red = stage === "corrupt";
  const heal = stage === "healing" || stage === "recovered";
  return (
    <svg viewBox="0 0 300 240" className="w-full h-64">
      <polygon points="150,22 270,208 30,208" fill="none" stroke={red ? "#ef4444" : GOLD} strokeWidth="3" strokeDasharray={red ? "8 9" : "0"} />
      {[ [150,22,"PHOENIX"], [270,208,"SPINE"], [30,208,"MESH"], [150,150,"CORE"] ].map(([x,y,label]) => <g key={label}><circle cx={x} cy={y} r={label === "CORE" ? 22 : 15} fill={red ? "#7f1d1d" : heal ? "#052e16" : "#080808"} stroke={heal ? "#4ade80" : red ? "#ef4444" : GOLD} strokeWidth="3" className={red ? "animate-pulse" : ""} /><text x={x} y={y + 38} textAnchor="middle" fontSize="10" fill={heal ? "#4ade80" : red ? "#fca5a5" : GOLD} fontWeight="900">{label}</text></g>)}
      {heal && <circle cx="150" cy="150" r="58" fill="none" stroke="#4ade80" strokeWidth="2" opacity="0.7" className="animate-ping" />}
    </svg>
  );
}

export default function PhoenixBigScreen() {
  const [stage, setStage] = useState("idle");
  const trigger = () => { setStage("corrupt"); setTimeout(() => setStage("healing"), 1800); setTimeout(() => setStage("recovered"), 4200); };
  const isRed = stage === "corrupt";

  return (
    <div className="rounded-3xl border overflow-hidden" style={{ background: "#020202", borderColor: isRed ? "#ef4444" : `${GOLD}36`, boxShadow: isRed ? "0 0 55px rgba(239,68,68,0.35)" : `0 0 45px ${GOLD}12` }}>
      <div className="px-5 py-3 border-b flex items-center justify-between gap-3" style={{ borderColor: isRed ? "rgba(239,68,68,0.35)" : `${GOLD}20`, background: isRed ? "rgba(127,29,29,0.35)" : "linear-gradient(90deg,#080808,#121006)" }}>
        <div className="flex items-center gap-2"><Zap className="w-4 h-4" style={{ color: isRed ? "#ef4444" : GOLD }} /><span className="text-xs font-black uppercase tracking-widest" style={{ color: isRed ? "#fca5a5" : GOLD }}>Big Screen Integrity Demo</span></div>
        <span className="text-[10px] font-black font-mono" style={{ color: isRed ? "#ef4444" : "#4ade80" }}>{STAGES[stage]}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5">
        <div className="rounded-2xl border p-4" style={{ borderColor: isRed ? "rgba(239,68,68,0.35)" : `${GOLD}20`, background: "rgba(255,255,255,0.02)" }}><TriangleNode stage={stage} /></div>
        <div className="space-y-4">
          <div className="space-y-3">{[0,1,2,3,4,5,6].map(i => <BraidStrand key={i} index={i} stage={stage} />)}</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {["CORRUPT", "ISOLATE", "RESURRECT"].map((x,i) => <div key={x} className="rounded-xl border p-3" style={{ borderColor: i === 0 && isRed ? "#ef4444" : `${GOLD}20` }}><div className="text-[9px] font-black" style={{ color: i === 0 && isRed ? "#ef4444" : GOLD }}>{x}</div></div>)}
          </div>
          <div className="text-5xl font-black font-mono" style={{ color: stage === "recovered" ? "#4ade80" : isRed ? "#ef4444" : GOLD }}>{stage === "recovered" ? "99.8%" : stage === "healing" ? "WAKE" : isRed ? "RED" : "ARMED"}</div>
          <p className="text-xs text-muted-foreground">Simulate a catastrophic braid corruption. Watch red lights fire, Clip Brick isolate the damage, Phoenix triangle wake up, and the trusted braid re-certify.</p>
          <div className="flex gap-2 flex-wrap"><button onClick={trigger} className="px-4 py-2 rounded-xl text-xs font-black uppercase" style={{ background: "#ef4444", color: "#fff" }}><Play className="inline w-3 h-3 mr-1" />Simulate Horrible</button><button onClick={() => setStage("idle")} className="px-4 py-2 rounded-xl text-xs font-black uppercase border" style={{ borderColor: `${GOLD}30`, color: GOLD }}><RotateCcw className="inline w-3 h-3 mr-1" />Reset</button></div>
        </div>
      </div>
      {stage === "recovered" && <div className="px-5 py-3 border-t flex items-center gap-2 text-xs font-black" style={{ borderColor: "rgba(74,222,128,0.25)", color: "#4ade80", background: "rgba(74,222,128,0.06)" }}><ShieldCheck className="w-4 h-4" /> Phoenix recovered the braid. Trusted state restored only after verification.</div>}
      {isRed && <div className="px-5 py-3 border-t flex items-center gap-2 text-xs font-black text-red-300" style={{ borderColor: "rgba(239,68,68,0.35)", background: "rgba(127,29,29,0.22)" }}><AlertTriangle className="w-4 h-4" /> Catastrophic corruption detected — red lights active.</div>}
    </div>
  );
}