import React, { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";

const STEPS = [
  "Prototype visuals identified",
  "Industry lens selected",
  "Metrics matched to buyer",
  "Use cases explained",
  "Deployment needs marked",
];

export default function PrototypeReadinessCheck({ color, label }) {
  const [checked, setChecked] = useState([0, 1]);
  const score = useMemo(() => Math.round((checked.length / STEPS.length) * 100), [checked]);

  const toggle = (index) => {
    setChecked(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  return (
    <div className="rounded-xl border p-4 space-y-3" style={{ background: "rgba(0,0,0,0.35)", borderColor: `${color}24` }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[9px] uppercase tracking-widest" style={{ color: `${color}75` }}>Interactive Prototype Check</p>
          <h4 className="text-xs font-black" style={{ color }}>Readiness for {label}</h4>
        </div>
        <div className="text-lg font-black font-mono" style={{ color }}>{score}%</div>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-black/50">
        <div className="h-full transition-all duration-300" style={{ width: `${score}%`, background: color }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {STEPS.map((step, index) => {
          const active = checked.includes(index);
          return (
            <button key={step} onClick={() => toggle(index)}
              className="flex items-center gap-2 text-left rounded-lg border px-3 py-2 transition-all"
              style={{ background: active ? `${color}12` : "rgba(255,255,255,0.02)", borderColor: active ? `${color}45` : "rgba(255,255,255,0.08)" }}>
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: active ? color : "rgba(255,255,255,0.25)" }} />
              <span className="text-[10px] text-muted-foreground">{step}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}