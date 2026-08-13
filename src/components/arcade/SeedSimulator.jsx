import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";

const GOLD = "#C9A84C";

const STEPS = [
  { label: "Plant Verified Seed", desc: "Initializing verified seed package…", duration: 800, icon: "🌱" },
  { label: "Check Folder Structure", desc: "Scanning directory integrity and expected paths…", duration: 900, icon: "📂" },
  { label: "Check Memory Pressure", desc: "Measuring RAM headroom — loading lean config…", duration: 1000, icon: "💾" },
  { label: "Load Only Needed Bricks", desc: "Selecting minimum verified brick set for this environment…", duration: 1100, icon: "🧱" },
  { label: "Create Checkpoint", desc: "Sealing verified starting state — checkpoint recorded…", duration: 900, icon: "✅" },
  { label: "Report Ready Status", desc: "System verified · Seed rooted · Bricks loaded · Ready.", duration: 800, icon: "🚀" },
];

function SeedViz({ step }) {
  const progress = step / STEPS.length;
  const W = 300, H = 160;
  const rootCount = Math.min(step, 5);

  const roots = Array.from({ length: rootCount }, (_, i) => {
    const angle = -90 + (i - Math.floor(rootCount / 2)) * 28;
    const rad = (angle * Math.PI) / 180;
    const len = 55 + i * 8;
    return {
      x2: W / 2 + Math.cos(rad) * len,
      y2: H - 20 + Math.sin(rad) * len,
    };
  });

  const bricks = step >= 4 ? [
    { x: 60, y: 20 }, { x: 130, y: 20 }, { x: 200, y: 20 },
    { x: 90, y: 50 }, { x: 165, y: 50 },
  ] : [];

  return (
    <div className="rounded-2xl border overflow-hidden flex items-center justify-center py-4"
      style={{ background: "hsl(220,18%,7%)", borderColor: "rgba(201,168,76,0.15)" }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: 320 }}>
        <defs>
          <radialGradient id="seedGlow" cx="50%" cy="80%" r="40%">
            <stop offset="0%" stopColor={GOLD} stopOpacity="0.3" />
            <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
          </radialGradient>
          <filter id="sg">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {step > 0 && <ellipse cx={W/2} cy={H - 10} rx={80} ry={25} fill="url(#seedGlow)" />}

        {/* Roots */}
        {roots.map((r, i) => (
          <line key={i} x1={W/2} y1={H - 20} x2={r.x2} y2={r.y2}
            stroke={GOLD} strokeWidth="2" strokeOpacity="0.7" filter="url(#sg)"
            style={{ animation: "fadeIn 0.5s ease-out" }} />
        ))}

        {/* Seed */}
        {step >= 0 && (
          <ellipse cx={W/2} cy={H - 20} rx={step >= 1 ? 14 : 8} ry={step >= 1 ? 18 : 10}
            fill={GOLD} opacity="0.9" filter="url(#sg)" />
        )}

        {/* Bricks */}
        {bricks.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={38} height={18} rx={4}
            fill="none" stroke={GOLD} strokeWidth="1.2" strokeOpacity="0.5"
            style={{ animation: `fadeIn 0.4s ease-out ${i * 0.12}s both` }} />
        ))}

        {/* Old laptop icon when step >= 5 */}
        {step >= 5 && (
          <g transform="translate(120, 55)">
            <rect x="0" y="0" width="60" height="38" rx="4" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeOpacity="0.6" />
            <rect x="-5" y="38" width="70" height="5" rx="2" fill="#4ade80" fillOpacity="0.3" />
            <text x="30" y="23" textAnchor="middle" fontSize="10" fill="#4ade80" opacity="0.8">✓ ONLINE</text>
          </g>
        )}

        {/* Progress ring */}
        <circle cx={W/2} cy={H - 20} r={step >= 1 ? 22 : 14}
          fill="none" stroke={GOLD} strokeWidth="0.8" strokeOpacity="0.2" strokeDasharray="4 6" />
      </svg>
    </div>
  );
}

export default function SeedSimulator() {
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);

  const runSeed = async () => {
    if (running) return;
    setRunning(true);
    setStep(-1);
    for (let i = 0; i < STEPS.length; i++) {
      await new Promise(r => setTimeout(r, STEPS[i].duration));
      setStep(i);
    }
    setRunning(false);
  };

  const reset = () => { setStep(-1); setRunning(false); };

  return (
    <section className="py-16 px-4" style={{ background: "hsl(220,22%,4%)" }}>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <div className="text-[9px] tracking-[4px] uppercase font-mono mb-2" style={{ color: "rgba(201,168,76,0.4)" }}>Mini Game</div>
          <h2 className="text-xl font-black font-cinzel" style={{ color: GOLD }}>Seed Method Simulator</h2>
          <p className="text-xs text-muted-foreground mt-1">Watch the system plant, verify, and grow brick by brick</p>
        </div>

        <SeedViz step={step} />

        {/* Step list */}
        <div className="space-y-2">
          {STEPS.map((s, i) => {
            const done = step > i;
            const active = step === i;
            const pending = step < i;
            return (
              <div key={i} className="flex items-center gap-3 rounded-xl border px-4 py-2.5 transition-all"
                style={{
                  background: done ? "rgba(74,222,128,0.04)" : active ? `${GOLD}06` : "hsl(220,18%,7%)",
                  borderColor: done ? "rgba(74,222,128,0.2)" : active ? `${GOLD}30` : "rgba(255,255,255,0.05)",
                }}>
                <div className="text-xl w-7 text-center flex-shrink-0">{s.icon}</div>
                <div className="flex-1">
                  <div className="text-xs font-bold" style={{ color: done ? "#4ade80" : active ? GOLD : "rgba(255,255,255,0.4)" }}>
                    {s.label}
                  </div>
                  {(done || active) && (
                    <div className="text-[9px] text-muted-foreground mt-0.5">{s.desc}</div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {done && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                  {active && <Loader2 className="w-4 h-4 animate-spin" style={{ color: GOLD }} />}
                  {pending && <div className="w-4 h-4 rounded-full border" style={{ borderColor: "rgba(255,255,255,0.1)" }} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Complete message */}
        {step === STEPS.length - 1 && !running && (
          <div className="rounded-2xl border p-5 text-center space-y-2"
            style={{ background: "rgba(74,222,128,0.04)", borderColor: "rgba(74,222,128,0.25)" }}>
            <p className="text-xs font-bold text-green-400">✓ Seed Rooted. System Ready.</p>
            <p className="text-[10px] text-muted-foreground max-w-md mx-auto leading-relaxed">
              The Seed Method lets JGA start small, verify the package, load only what is needed, and grow the system brick by brick. This is how useful systems can run on older equipment instead of wasting memory.
            </p>
          </div>
        )}

        <div className="flex justify-center gap-3">
          <Button onClick={runSeed} disabled={running}
            className="font-bold gap-2"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #7a5010)`, color: "#080808" }}>
            {running ? <><Loader2 className="w-4 h-4 animate-spin" /> Growing…</> : "🌱 Plant Verified Seed"}
          </Button>
          {step >= 0 && !running && (
            <Button onClick={reset} variant="outline" className="gap-2">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}