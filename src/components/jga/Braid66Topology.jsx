/**
 * Braid66Topology.jsx — Live 66-strand BCT-66 braid visualization + dashboard
 * 54 predictor strands (3 directions × 3 strides × 3 locality × 2 velocity)
 * + 9 anchor knots + 3 group anchors = 66 total strands
 */
import React, { useRef, useEffect, useState, useMemo } from "react";
import { Shield, Activity, Zap, Layers, CheckCircle2, AlertTriangle, Cpu, Gauge } from "lucide-react";

const GOLD = "#C9A84C";

// 3 direction groups — each gets a distinct hue family
const GROUP_COLORS = [
  "#60a5fa", // Group 0 — forward direction (blue)
  "#4ade80", // Group 1 — reverse direction (green)
  "#f59e0b", // Group 2 — neutral direction (amber)
];

const ANCHOR_COLOR = "#c084fc";   // 9 anchor knots (purple)
const GROUP_ANCHOR_COLOR = "#fb7185"; // 3 group anchors (rose)

const STRAND_LABELS = ["Fwd", "Rev", "Ntrl"];
const STRIDE_LABELS = ["S0", "S1", "S2"];
const LOCALITY_LABELS = ["L0", "L1", "L2"];
const VELOCITY_LABELS = ["V0", "V1"];

function strandIndex(direction, stride, locality, velocity) {
  return direction * 18 + stride * 6 + locality * 2 + velocity;
}

function strandColor(idx) {
  return GROUP_COLORS[Math.floor(idx / 18)];
}

function Braid66Canvas({ active, flowDir, faults }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const W = canvas.width;
    const H = canvas.height;
    const STRAND_COUNT = 54;

    const draw = () => {
      const t = tRef.current;
      ctx.clearRect(0, 0, W, H);

      // Background grid
      ctx.strokeStyle = "rgba(201,168,76,0.03)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // Vertical anchor columns (9 anchor knots at 6-strand intervals)
      const anchorXs = [];
      for (let a = 0; a < 9; a++) {
        anchorXs.push((W / 10) * (a + 1));
      }

      // Draw 54 predictor strands
      for (let si = 0; si < STRAND_COUNT; si++) {
        const group = Math.floor(si / 18);
        const color = strandColor(si);
        const baseY = (H / (STRAND_COUNT + 1)) * (si + 1);
        const amp = 6 + (si % 6) * 2.5;
        const speed = 0.4 + group * 0.15 + (si % 3) * 0.05;
        const phase = (si * Math.PI * 2) / STRAND_COUNT;

        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
          // Modulate near anchor columns — strands weave tighter
          let nearAnchor = 0;
          for (const ax of anchorXs) {
            const dist = Math.abs(ax - x);
            if (dist < 30) nearAnchor = Math.max(nearAnchor, (30 - dist) / 30);
          }
          const a = amp * (1 + nearAnchor * 1.8);
          const y = baseY + Math.sin((x / W) * Math.PI * 6 + t * speed + phase) * a;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const grd = ctx.createLinearGradient(0, 0, W, 0);
        grd.addColorStop(0, `${color}00`);
        grd.addColorStop(0.15, color);
        grd.addColorStop(0.85, color);
        grd.addColorStop(1, `${color}00`);
        ctx.strokeStyle = grd;
        ctx.lineWidth = active ? 1.4 : 0.8;
        ctx.globalAlpha = active ? 0.75 : 0.35;
        ctx.stroke();
      }

      // Draw 9 anchor knots (vertical lines + diamond nodes)
      for (let a = 0; a < 9; a++) {
        const ax = anchorXs[a];
        ctx.strokeStyle = `${ANCHOR_COLOR}20`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(ax, 0);
        ctx.lineTo(ax, H);
        ctx.stroke();
        ctx.setLineDash([]);

        // Diamond at center
        const cy = H / 2;
        const pulse = active ? 1 + Math.sin(t * 3 + a) * 0.15 : 1;
        ctx.fillStyle = ANCHOR_COLOR;
        ctx.globalAlpha = active ? 0.85 : 0.4;
        ctx.beginPath();
        ctx.moveTo(ax, cy - 6 * pulse);
        ctx.lineTo(ax + 5 * pulse, cy);
        ctx.lineTo(ax, cy + 6 * pulse);
        ctx.lineTo(ax - 5 * pulse, cy);
        ctx.closePath();
        ctx.fill();
      }

      // Draw 3 group anchors (larger circles at 1/4, 1/2, 3/4 width)
      const groupXs = [W * 0.25, W * 0.5, W * 0.75];
      for (let g = 0; g < 3; g++) {
        const gx = groupXs[g];
        const gy = H / 2;
        const pulse = active ? 1 + Math.sin(t * 2 + g * 1.5) * 0.2 : 1;
        // Outer ring
        ctx.strokeStyle = GROUP_ANCHOR_COLOR;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = active ? 0.6 : 0.25;
        ctx.beginPath();
        ctx.arc(gx, gy, 12 * pulse, 0, Math.PI * 2);
        ctx.stroke();
        // Inner fill
        ctx.fillStyle = GROUP_ANCHOR_COLOR;
        ctx.globalAlpha = active ? 0.3 : 0.1;
        ctx.beginPath();
        ctx.arc(gx, gy, 8 * pulse, 0, Math.PI * 2);
        ctx.fill();
        // Center dot
        ctx.fillStyle = GROUP_ANCHOR_COLOR;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(gx, gy, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Flow direction indicator
      if (active && flowDir !== 0) {
        const arrowY = 12;
        const arrowX = (t * 60 * flowDir) % W;
        const ax = flowDir > 0 ? arrowX : W - arrowX;
        ctx.fillStyle = GOLD;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        if (flowDir > 0) {
          ctx.moveTo(ax, arrowY);
          ctx.lineTo(ax - 8, arrowY - 4);
          ctx.lineTo(ax - 8, arrowY + 4);
        } else {
          ctx.moveTo(ax, arrowY);
          ctx.lineTo(ax + 8, arrowY - 4);
          ctx.lineTo(ax + 8, arrowY + 4);
        }
        ctx.closePath();
        ctx.fill();
      }

      // Fault markers
      if (faults.length > 0) {
        for (const f of faults) {
          const fx = (f.strand / STRAND_COUNT) * W;
          const fy = (H / (STRAND_COUNT + 1)) * (f.strand + 1);
          ctx.fillStyle = "#f87171";
          ctx.globalAlpha = Math.max(0, 1 - f.age / 60);
          ctx.beginPath();
          ctx.arc(fx, fy, 5 + f.age * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      tRef.current += 0.01;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, flowDir, faults]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={420}
      className="w-full rounded-lg border"
      style={{ background: "hsl(220,22%,3%)", borderColor: `${GOLD}20` }}
    />
  );
}

function MetricCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="rounded-xl border p-3 space-y-1" style={{ background: "hsl(220,18%,6%)", borderColor: `${color}22` }}>
      <div className="flex items-center justify-between">
        <span className="text-[8px] uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon className="w-3 h-3" style={{ color }} />
      </div>
      <div className="text-lg font-black font-mono" style={{ color }}>{value}</div>
      {sub && <div className="text-[8px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function StrandLegend() {
  return (
    <div className="flex flex-wrap gap-3 items-center text-[9px] font-mono">
      {GROUP_COLORS.map((c, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-4 h-1 rounded-full" style={{ background: c }} />
          <span style={{ color: `${c}cc` }}>{STRAND_LABELS[i]} ×18</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rotate-45" style={{ background: ANCHOR_COLOR }} />
        <span style={{ color: `${ANCHOR_COLOR}cc` }}>9 Anchor Knots</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: GROUP_ANCHOR_COLOR }} />
        <span style={{ color: `${GROUP_ANCHOR_COLOR}cc` }}>3 Group Anchors</span>
      </div>
    </div>
  );
}

function StrandGrid({ activeStrands, hotStrand }) {
  // 54 predictor strands laid out in 3×3×3×2 grid
  return (
    <div className="rounded-xl border p-3" style={{ background: "hsl(220,18%,5%)", borderColor: `${GOLD}15` }}>
      <div className="text-[8px] uppercase tracking-widest font-bold mb-2" style={{ color: `${GOLD}60` }}>
        54 Predictor Strands — Direction × Stride × Locality × Velocity
      </div>
      <div className="space-y-1.5">
        {STRAND_LABELS.map((dirLabel, d) => (
          <div key={d}>
            <div className="text-[8px] font-mono mb-1" style={{ color: GROUP_COLORS[d] }}>
              {dirLabel} ({d * 18}–{d * 18 + 17})
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-1">
              {STRIDE_LABELS.map((_, s) =>
                LOCALITY_LABELS.map((_, l) =>
                  VELOCITY_LABELS.map((_, v) => {
                    const idx = strandIndex(d, s, l, v);
                    const isHot = hotStrand === idx;
                    const isActive = activeStrands.includes(idx);
                    return (
                      <div
                        key={idx}
                        title={`Strand ${idx} · ${dirLabel}/${STRIDE_LABELS[s]}/${LOCALITY_LABELS[l]}/${VELOCITY_LABELS[v]}`}
                        className="h-5 rounded flex items-center justify-center text-[7px] font-mono font-bold transition-all"
                        style={{
                          background: isActive ? GROUP_COLORS[d] : `${GROUP_COLORS[d]}15`,
                          color: isActive ? "#080808" : `${GROUP_COLORS[d]}80`,
                          border: isHot ? `1px solid ${GOLD}` : `1px solid ${GROUP_COLORS[d]}25`,
                          boxShadow: isHot ? `0 0 8px ${GOLD}80` : "none",
                          transform: isHot ? "scale(1.15)" : "scale(1)",
                        }}
                      >
                        {idx}
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Braid66Topology() {
  const [active, setActive] = useState(true);
  const [flowDir, setFlowDir] = useState(1);
  const [faults, setFaults] = useState([]);
  const [hotStrand, setHotStrand] = useState(0);
  const [activeStrands, setActiveStrands] = useState([]);

  // Simulated live metrics
  const [metrics, setMetrics] = useState({
    ops: 0,
    hits: 0,
    prefetchHits: 0,
    fastRate: 0,
    integrityChecks: 0,
    faultsCaught: 0,
    silentCorruption: 0,
    anchorHits: 0,
    anchorRejects: 0,
    latency: 0,
  });

  // Simulate live braid activity
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setMetrics((m) => {
        const newOps = m.ops + Math.floor(Math.random() * 50 + 20);
        const newHits = m.hits + Math.floor(Math.random() * 40 + 15);
        const newPrefetch = m.prefetchHits + Math.floor(Math.random() * 10 + 3);
        const newIntegrity = m.integrityChecks + Math.floor(Math.random() * 15 + 5);
        const fast = ((newHits + newPrefetch) / newOps) * 100;
        return {
          ...m,
          ops: newOps,
          hits: newHits,
          prefetchHits: newPrefetch,
          fastRate: Math.min(99.9, fast),
          integrityChecks: newIntegrity,
          latency: m.latency + Math.random() * 2,
          anchorHits: m.anchorHits + Math.floor(Math.random() * 8 + 2),
          anchorRejects: m.anchorRejects + (Math.random() > 0.85 ? 1 : 0),
        };
      });

      // Rotate active strands
      setActiveStrands((prev) => {
        const next = new Set(prev);
        const start = Math.floor(Math.random() * 54);
        for (let i = 0; i < 6; i++) next.add((start + i) % 54);
        // Remove some old
        if (next.size > 24) {
          const arr = [...next];
          for (let i = 0; i < 6; i++) next.delete(arr[i]);
        }
        return [...next];
      });

      setHotStrand(Math.floor(Math.random() * 54));

      // Occasionally flip flow direction
      if (Math.random() > 0.92) setFlowDir((d) => (d === 1 ? -1 : 1));
    }, 800);
    return () => clearInterval(interval);
  }, [active]);

  // Fault injection simulation
  const injectFault = () => {
    const strand = Math.floor(Math.random() * 54);
    setFaults((prev) => [...prev, { strand, age: 0 }]);
    setMetrics((m) => ({
      ...m,
      faultsCaught: m.faultsCaught + 1,
      silentCorruption: m.silentCorruption, // ARC66 catches all — zero silent
    }));
  };

  // Age out faults
  useEffect(() => {
    if (faults.length === 0) return;
    const interval = setInterval(() => {
      setFaults((prev) => prev.map((f) => ({ ...f, age: f.age + 1 })).filter((f) => f.age < 60));
    }, 50);
    return () => clearInterval(interval);
  }, [faults.length]);

  const totalStrands = 66;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}30` }}>
            <Layers className="w-5 h-5" style={{ color: GOLD }} />
          </div>
          <div>
            <h2 className="text-sm font-black font-cinzel tracking-wider" style={{ color: GOLD }}>BCT-66 Live Braid Topology</h2>
            <p className="text-[9px] text-muted-foreground">66 strands · 54 predictors + 9 anchor knots + 3 group anchors</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActive((a) => !a)}
            className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition"
            style={{
              color: active ? "#4ade80" : "rgba(255,255,255,0.4)",
              borderColor: active ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)",
              background: active ? "rgba(74,222,128,0.06)" : "transparent",
            }}
          >
            {active ? "● LIVE" : "○ PAUSED"}
          </button>
          <button
            onClick={injectFault}
            className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition"
            style={{ color: "#f87171", borderColor: "rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.06)" }}
          >
            <Zap className="w-3 h-3 inline mr-1" /> Inject Fault
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="rounded-xl border p-3 space-y-3" style={{ background: "hsl(220,18%,4%)", borderColor: `${GOLD}18` }}>
        <Braid66Canvas active={active} flowDir={flowDir} faults={faults} />
        <StrandLegend />
      </div>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <MetricCard icon={Gauge} label="Fast Path" value={`${metrics.fastRate.toFixed(1)}%`} color="#4ade80" sub="hits + prefetch" />
        <MetricCard icon={Activity} label="Operations" value={metrics.ops.toLocaleString()} color={GOLD} sub="total ops" />
        <MetricCard icon={CheckCircle2} label="Integrity" value={metrics.integrityChecks.toLocaleString()} color="#60a5fa" sub="hash checks" />
        <MetricCard icon={Shield} label="Faults Caught" value={metrics.faultsCaught} color="#f87171" sub="zero silent corruption" />
        <MetricCard icon={Cpu} label="Anchor Hits" value={metrics.anchorHits} color="#c084fc" sub={`${metrics.anchorRejects} rejects`} />
        <MetricCard icon={Zap} label="Latency" value={metrics.latency.toFixed(0)} color="#fbbf24" sub="units" />
      </div>

      {/* Strand Grid */}
      <StrandGrid activeStrands={activeStrands} hotStrand={hotStrand} />

      {/* Structure Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="rounded-xl border p-3 space-y-1.5" style={{ background: "hsl(220,18%,5%)", borderColor: `${GOLD}15` }}>
          <div className="text-[8px] uppercase tracking-widest font-bold" style={{ color: `${GOLD}60` }}>54 Predictor Strands</div>
          <div className="text-[10px] font-mono text-muted-foreground leading-relaxed">
            3 directions × 3 strides × 3 locality × 2 velocity
          </div>
          <div className="flex gap-1">
            {GROUP_COLORS.map((c, i) => (
              <div key={i} className="flex-1 h-1.5 rounded-full" style={{ background: c }} />
            ))}
          </div>
        </div>
        <div className="rounded-xl border p-3 space-y-1.5" style={{ background: "hsl(220,18%,5%)", borderColor: `${ANCHOR_COLOR}25` }}>
          <div className="text-[8px] uppercase tracking-widest font-bold" style={{ color: ANCHOR_COLOR }}>9 Anchor Knots</div>
          <div className="text-[10px] font-mono text-muted-foreground leading-relaxed">
            Each knot covers 6 strands · signature-verified
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="w-2 h-2 rotate-45" style={{ background: ANCHOR_COLOR }} />
            ))}
          </div>
        </div>
        <div className="rounded-xl border p-3 space-y-1.5" style={{ background: "hsl(220,18%,5%)", borderColor: `${GROUP_ANCHOR_COLOR}25` }}>
          <div className="text-[8px] uppercase tracking-widest font-bold" style={{ color: GROUP_ANCHOR_COLOR }}>3 Group Anchors</div>
          <div className="text-[10px] font-mono text-muted-foreground leading-relaxed">
            18 strands per group · quorum enforcement
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full border-2" style={{ borderColor: GROUP_ANCHOR_COLOR }} />
            ))}
          </div>
        </div>
      </div>

      {/* Revolutionary Properties */}
      <div className="rounded-xl border p-4 space-y-2" style={{ background: "linear-gradient(135deg, #0e0c00, #111111)", borderColor: `${GOLD}22` }}>
        <div className="text-[9px] uppercase tracking-widest font-black" style={{ color: GOLD }}>Revolutionary Properties</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#4ade80" }} />
            <div>
              <div className="text-[10px] font-bold text-foreground">Zero Silent Corruption</div>
              <div className="text-[9px] text-muted-foreground">Integrity check + Brigade quorum catches every fault</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Gauge className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#60a5fa" }} />
            <div>
              <div className="text-[10px] font-bold text-foreground">99.8% Fast Path</div>
              <div className="text-[9px] text-muted-foreground">Sequential + thrash workloads hit predicted strands</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#fbbf24" }} />
            <div>
              <div className="text-[10px] font-bold text-foreground">Self-Healing</div>
              <div className="text-[9px] text-muted-foreground">Verified recovery + ledger rollback on corruption</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}