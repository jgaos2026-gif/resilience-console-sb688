import React, { useRef, useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Layers, Cpu, Zap, Activity, Brain, RefreshCw } from "lucide-react";
import BrickStitchGraph from "@/components/sb688/BrickStitchGraph";

const BENCHMARKS = [
  { metric: "Resilience Shear Point", standard: "7% Node Loss", brickStitch: "38% Node Loss", better: true },
  { metric: "Recovery Mechanism", standard: "Reactive (Software)", brickStitch: "Passive (Geometry)", better: true },
  { metric: "Infrastructure Overhead", standard: "300% (3x Mirror)", brickStitch: "150% (1.5x)", better: true },
  { metric: "Failure Mode", standard: "Catastrophic Cascade", brickStitch: "Graceful Degradation", better: true },
  { metric: "LLM Checkpoint Corruption", standard: "ms jitter → data loss", brickStitch: "Absorbed by adjacent nodes", better: true },
  { metric: "AI Hallucination Risk", standard: "High under node failure", brickStitch: "Drastically reduced (geometric ground)", better: true },
];

// Draw the Brick Stitch 1/2 Offset geometry on canvas
function drawBrickStitch(canvas, failedNodes = []) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  const W = rect.width;
  const H = rect.height;
  ctx.clearRect(0, 0, W, H);

  const cols = 7;
  const rows = 5;
  const brickW = Math.floor(W / (cols + 0.5)) - 4;
  const brickH = Math.floor(H / rows) - 8;
  const gap = 4;

  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 1 ? brickW / 2 + gap / 2 : 0;
    const colCount = row % 2 === 1 ? cols - 1 : cols;

    for (let col = 0; col < colCount; col++) {
      const x = offset + col * (brickW + gap) + gap;
      const y = row * (brickH + gap) + gap;
      const nodeId = `${row}-${col}`;
      const isFailed = failedNodes.includes(nodeId);

      // Shadow / glow
      if (!isFailed) {
        ctx.shadowColor = "rgba(196,163,80,0.12)";
        ctx.shadowBlur = 6;
      }

      ctx.beginPath();
      const r = 4;
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + brickW - r, y);
      ctx.quadraticCurveTo(x + brickW, y, x + brickW, y + r);
      ctx.lineTo(x + brickW, y + brickH - r);
      ctx.quadraticCurveTo(x + brickW, y + brickH, x + brickW - r, y + brickH);
      ctx.lineTo(x + r, y + brickH);
      ctx.quadraticCurveTo(x, y + brickH, x, y + brickH - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();

      if (isFailed) {
        ctx.fillStyle = "rgba(239,68,68,0.15)";
        ctx.strokeStyle = "rgba(239,68,68,0.4)";
      } else {
        ctx.fillStyle = "rgba(196,163,80,0.08)";
        ctx.strokeStyle = "rgba(196,163,80,0.35)";
      }
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Spine indicator (center column)
      if (col === Math.floor(colCount / 2)) {
        ctx.beginPath();
        ctx.moveTo(x + brickW / 2, y + 4);
        ctx.lineTo(x + brickW / 2, y + brickH - 4);
        ctx.strokeStyle = isFailed ? "rgba(239,68,68,0.4)" : "rgba(196,163,80,0.6)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  }

  // Draw "rib" load distribution arrows for middle row
  const midRow = 2;
  const midOffset = midRow % 2 === 1 ? brickW / 2 + gap / 2 : 0;
  const midCols = midRow % 2 === 1 ? cols - 1 : cols;
  const centerCol = Math.floor(midCols / 2);
  const cx = midOffset + centerCol * (brickW + gap) + gap + brickW / 2;
  const cy = midRow * (brickH + gap) + gap + brickH / 2;

  // Rib arrows left and right
  [-1, 1].forEach((dir) => {
    const tx = cx + dir * (brickW + gap) * 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + dir * 4, cy);
    ctx.lineTo(tx, cy);
    ctx.strokeStyle = "rgba(59,130,246,0.5)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(tx, cy - 4);
    ctx.lineTo(tx + dir * 6, cy);
    ctx.lineTo(tx, cy + 4);
    ctx.strokeStyle = "rgba(59,130,246,0.6)";
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Label
  ctx.fillStyle = "rgba(196,163,80,0.5)";
  ctx.font = "500 9px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("← SPINE + RIBS: 1/2 OFFSET GEOMETRY →", W / 2, H - 4);
}

export default function BrickStitchTab() {
  const canvasRef = useRef(null);
  const [failedNodes, setFailedNodes] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const redraw = useCallback(() => {
    drawBrickStitch(canvasRef.current, failedNodes);
  }, [failedNodes]);

  useEffect(() => {
    redraw();
    window.addEventListener("resize", redraw);
    return () => window.removeEventListener("resize", redraw);
  }, [redraw]);

  const simulateFailure = useCallback(() => {
    setIsSimulating(true);
    // Randomly fail 2-3 nodes
    const nodes = [];
    for (let i = 0; i < 3; i++) {
      const row = Math.floor(Math.random() * 5);
      const col = Math.floor(Math.random() * 5);
      nodes.push(`${row}-${col}`);
    }
    setFailedNodes(nodes);
    setTimeout(() => setIsSimulating(false), 400);
  }, []);

  const restoreAll = useCallback(() => {
    setFailedNodes([]);
  }, []);

  const getAIExplanation = useCallback(async () => {
    setIsLoadingAI(true);
    const prompt = `Explain the Brick Stitch System (1/2 Offset Spine and Ribs Geometry) to a C-level executive considering infrastructure investment.

Key facts about Brick Stitch:
- Inspired by high-load masonry: bricks offset by 50% so no joint lines up vertically
- 1:2 Node-Support Ratio: each node is supported by two adjacent nodes in the layer below
- The Spine: vertical source-of-truth for logical consistency
- The Ribs: lateral structures distributing load across neighboring nodes
- The Weave: self-supporting mesh — removing one node, its load is absorbed by two supporting nodes
- Resilience: withstands 38% node loss vs 7% for standard columnar stacks
- Infrastructure overhead: 150% vs 300% for triple mirroring
- Failure mode: graceful degradation vs catastrophic cascade
- AI benefit: provides geometric ground that reduces LLM hallucination risk under node failure
- Recovery: passive (geometric) not reactive (software) — no detection delay

Explain in 3-4 sentences why this matters for a CEO or CTO making infrastructure investment decisions. Focus on the business and operational case, not the math. Plain English. High consequence. No fluff.`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    setAiExplanation(result);
    setIsLoadingAI(false);
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-foreground">Brick Stitch Architecture</h2>
        <p className="text-sm text-muted-foreground">Patented 1/2 Offset Spine+Ribs Geometry — shifting from reactive redundancy to inherent structural integrity.</p>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">BSS-2026-ARCH-01</Badge>
          <Badge variant="outline" className="text-[10px] bg-secondary text-muted-foreground border-border">J.G.A. — John E. Arenz</Badge>
          <Badge variant="outline" className="text-[10px] bg-secondary text-muted-foreground border-border">Proprietary / Strategic Infrastructure</Badge>
        </div>
      </div>

      {/* Interactive Node Graph */}
      <BrickStitchGraph />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geometry Visualization */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
            <Layers className="w-4 h-4" /> Structural Geometry — Live Simulation
          </h3>
          <div className="relative w-full" style={{ paddingBottom: "55%" }}>
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={simulateFailure} disabled={isSimulating} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs">
              <Zap className="w-3.5 h-3.5 mr-1.5" /> Simulate Node Loss
            </Button>
            <Button onClick={restoreAll} size="sm" variant="outline" className="border-border text-foreground text-xs">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Restore All
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">Gold = spine/ribs mesh. Blue arrows = load redistribution. Red = failed nodes. When a node fails, adjacent nodes absorb load passively — no software detection delay.</p>
        </div>

        {/* Benchmark Table */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
            <Activity className="w-4 h-4" /> Performance Benchmarks
          </h3>
          <div className="space-y-2">
            {BENCHMARKS.map((b, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 text-xs py-2 border-b border-border/30 last:border-0">
                <div className="text-muted-foreground font-medium">{b.metric}</div>
                <div className="text-red-400/70">{b.standard}</div>
                <div className="text-teal-400 font-semibold">{b.brickStitch}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground/50 pt-1 border-t border-border/30">
            <div>Metric</div>
            <div className="text-red-400/40">Industry Standard</div>
            <div className="text-teal-400/40">Brick Stitch</div>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Cpu, title: "Mission-Critical Healthcare", desc: "Eliminates downtime in high-stakes environments like Northwestern Medicine where data integrity is tied to patient outcomes." },
          { icon: Zap, title: "Nuclear Hardened Defense", desc: "Maintains tactical communication meshes even when 30%+ of nodes are neutralized by adversarial action or radiation events." },
          { icon: Brain, title: "AI Hallucination Reduction", desc: "Provides a fixed geometric ground for data, preventing the drift that leads to LLM hallucinations under infrastructure stress." },
        ].map((uc, i) => {
          const Icon = uc.icon;
          return (
            <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-2">
              <Icon className="w-5 h-5 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">{uc.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{uc.desc}</p>
            </div>
          );
        })}
      </div>

      {/* AI Executive Brief */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
            <Brain className="w-4 h-4" /> AI Executive Brief
          </h3>
          <Button onClick={getAIExplanation} disabled={isLoadingAI} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
            {isLoadingAI ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Brain className="w-3.5 h-3.5 mr-1.5" />}
            Generate Brief
          </Button>
        </div>
        {isLoadingAI && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-lg bg-secondary/50">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            Generating executive brief via AI...
          </div>
        )}
        {aiExplanation && !isLoadingAI && (
          <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <p className="text-xs text-foreground/85 leading-relaxed">{aiExplanation}</p>
          </div>
        )}
        {!aiExplanation && !isLoadingAI && (
          <p className="text-xs text-muted-foreground italic">Click "Generate Brief" to get an AI-powered plain-English explanation for executive audiences.</p>
        )}
      </div>

      {/* Acquisition Note */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-2">
        <h3 className="text-sm font-semibold text-primary">Acquisition & Licensing</h3>
        <p className="text-xs text-foreground/70 leading-relaxed">
          The Brick Stitch System is available for strategic acquisition or tiered licensing. Valuation is based on projected annual OPEX savings for 10GW+ deployments. Full mathematical constants, routing protocols, and stress logs are available for Clean Room review following execution of a formal Mutual Non-Disclosure Agreement (MNDA).
        </p>
        <p className="text-xs text-muted-foreground">Contact: <span className="text-primary">johnarenz@jaysgraphicarts.com</span> — John E. Arenz, Founder J.G.A.</p>
      </div>
    </div>
  );
}