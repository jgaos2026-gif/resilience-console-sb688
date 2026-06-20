import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, CheckCircle2 } from "lucide-react";

const GOLD = "#C9A84C";

const STRANDS = [
  { id: "memory",       label: "Memory Strand",       color: "#a78bfa", desc: "Stores verified state in isolated pockets" },
  { id: "verification", label: "Verification Strand",  color: GOLD,      desc: "No data passes without passing all gates" },
  { id: "watchdog",     label: "Watchdog Strand",      color: "#60a5fa", desc: "Monitors for drift and unexpected changes" },
  { id: "recovery",     label: "Recovery Strand",      color: "#f472b6", desc: "Phoenix rollback — system recovers to clean state" },
  { id: "business",     label: "Business Strand",      color: "#34d399", desc: "Client intake, orders, payments — all verified" },
  { id: "design",       label: "Design Strand",        color: "#fb923c", desc: "Creative output routed through Jay's Graphic Arts" },
  { id: "ledger",       label: "Ledger Strand",        color: "#fbbf24", desc: "Append-only record — nothing deleted, nothing hidden" },
  { id: "seed",         label: "Seed Strand",          color: "#e879f9", desc: "Seed method — start small, verify, grow brick by brick" },
];

function BraidViz({ added }) {
  if (added.length === 0) return (
    <div className="rounded-2xl border flex items-center justify-center h-48 text-[10px] text-muted-foreground"
      style={{ background: "hsl(220,18%,7%)", borderColor: "rgba(201,168,76,0.1)" }}>
      Add strands below to build your braid
    </div>
  );

  const W = 600;
  const H = 120 + added.length * 18;
  const spacing = W / (added.length + 1);

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "hsl(220,18%,7%)", borderColor: "rgba(201,168,76,0.15)" }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          {added.map((s, i) => (
            <linearGradient key={s.id} id={`sg_${s.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={s.color} stopOpacity="0" />
              <stop offset="50%" stopColor={s.color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
          <filter id="glow2">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Horizontal strands */}
        {added.map((s, i) => {
          const y = 30 + i * 22;
          return (
            <g key={s.id}>
              <line x1="0" y1={y} x2={W} y2={y}
                stroke={`url(#sg_${s.id})`} strokeWidth="3" filter="url(#glow2)"
                style={{ animation: `slideIn 0.5s ease-out` }} />
              {/* Braid cross points */}
              {[1,2,3,4,5].map(j => (
                <circle key={j} cx={j * spacing} cy={y} r="3.5"
                  fill={s.color} opacity="0.7" filter="url(#glow2)" />
              ))}
              {/* Label */}
              <text x="8" y={y + 4} fontSize="9" fill={s.color} opacity="0.7" fontFamily="monospace">
                {s.label}
              </text>
            </g>
          );
        })}

        {/* Vertical connector lines (the "stitch") */}
        {added.length > 1 && [1,2,3,4,5].map(j => (
          <line key={j}
            x1={j * spacing} y1={30}
            x2={j * spacing} y2={30 + (added.length - 1) * 22}
            stroke={GOLD} strokeWidth="0.6" strokeOpacity="0.15" strokeDasharray="3 6" />
        ))}
      </svg>
    </div>
  );
}

export default function BraidBuilder() {
  const [added, setAdded] = useState([]);
  const complete = added.length === STRANDS.length;

  const addStrand = (s) => {
    if (added.find(a => a.id === s.id)) return;
    setAdded(prev => [...prev, s]);
  };

  const reset = () => setAdded([]);

  return (
    <section className="py-16 px-4" style={{ background: "hsl(220,20%,5%)" }}>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <div className="text-[9px] tracking-[4px] uppercase font-mono mb-2" style={{ color: "rgba(201,168,76,0.4)" }}>Mini Game</div>
          <h2 className="text-xl font-black font-cinzel" style={{ color: GOLD }}>Braid Builder</h2>
          <p className="text-xs text-muted-foreground mt-1">Click strands to weave them into the JGA architecture braid</p>
        </div>

        {/* Visualization */}
        <BraidViz added={added} />

        {/* Counter */}
        <div className="text-center">
          <span className="text-sm font-mono font-bold" style={{ color: GOLD }}>{added.length}</span>
          <span className="text-xs text-muted-foreground"> / {STRANDS.length} strands woven</span>
        </div>

        {/* Strand buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STRANDS.map(s => {
            const isAdded = !!added.find(a => a.id === s.id);
            return (
              <button key={s.id} onClick={() => addStrand(s)} disabled={isAdded}
                className="rounded-xl border p-3 text-left space-y-1 transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-default"
                style={{
                  background: isAdded ? `${s.color}12` : "hsl(220,18%,7%)",
                  borderColor: isAdded ? `${s.color}50` : "rgba(255,255,255,0.08)",
                }}>
                <div className="flex items-center justify-between">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
                  {isAdded && <CheckCircle2 style={{ color: s.color, width: 12, height: 12 }} />}
                </div>
                <div className="text-[10px] font-bold" style={{ color: isAdded ? s.color : "rgba(255,255,255,0.7)" }}>
                  {s.label}
                </div>
                <div className="text-[8px] text-muted-foreground leading-relaxed">{s.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Completion message */}
        {complete && (
          <div className="rounded-2xl border p-6 text-center space-y-3"
            style={{ background: "rgba(201,168,76,0.05)", borderColor: "rgba(201,168,76,0.4)" }}>
            <div className="text-lg font-black font-cinzel" style={{ color: GOLD }}>Braid Complete.</div>
            <p className="text-sm" style={{ color: "rgba(201,168,76,0.8)" }}>
              "You built a stronger system. One strand can break. A verified braid can recover."
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              The braid model teaches how JGA thinks about system strength. Each strand has a job. The system is stronger when design, business, verification, memory, recovery, and proof are woven together.
            </p>
            <Button onClick={reset} variant="outline" className="gap-2 border-primary/40 text-primary">
              <RotateCcw className="w-3.5 h-3.5" /> Rebuild Braid
            </Button>
          </div>
        )}

        {!complete && added.length > 0 && (
          <div className="text-center">
            <button onClick={reset} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        )}
      </div>
    </section>
  );
}