/**
 * MemoryBraid.jsx — Wired to real /api/nodes (memory-category nodes)
 * Visualises the braid topology of the Memory Braid node.
 */
import React, { useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Database, Lock, Zap } from "lucide-react";
import api from "@/api/apiClient";

const GOLD = "#C9A84C";
const STRAND_COLORS = ["#C9A84C","#f59e0b","#fcd34d","#a78bfa","#60a5fa","#ec4899","#4ade80"];

function BraidCanvas({ chain }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !chain || chain.length === 0) return;
    const ctx = canvas.getContext("2d");
    let t = 0;

    const n = 7; // B₇
    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = "rgba(201,168,76,0.04)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

      // Draw strands based on actual chain generators
      for (let si = 0; si < n - 1; si++) {
        const amp   = 24 + si * 4;
        const baseY = (H / n) * (si + 1);
        const speed = 0.6 + si * 0.1;
        const phase = (si * Math.PI * 2) / n;

        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
          // Modulate amplitude near generator crossings
          const progress = x / W;
          const nearCrossing = chain.some((b, bi) => {
            const bx = (bi / chain.length) * W;
            return b.generator === si + 1 && Math.abs(bx - x) < 15;
          });
          const a = nearCrossing ? amp * 2 : amp;
          const y = baseY + Math.sin((x / W) * Math.PI * 4 + t * speed + phase) * a;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const grd = ctx.createLinearGradient(0,0,W,0);
        grd.addColorStop(0, `${STRAND_COLORS[si]}00`);
        grd.addColorStop(0.2, STRAND_COLORS[si]);
        grd.addColorStop(0.8, STRAND_COLORS[si]);
        grd.addColorStop(1, `${STRAND_COLORS[si]}00`);
        ctx.strokeStyle = grd;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.7;
        ctx.stroke();

        // Mark crossing events
        chain.forEach((b, bi) => {
          if (b.generator === si + 1) {
            const bx = (bi / Math.max(chain.length, 1)) * W;
            const by = baseY + Math.sin((bx / W) * Math.PI * 4 + t * speed + phase) * amp;
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(bx, by, 4, 0, Math.PI * 2);
            ctx.fillStyle = b.sign === 1 ? STRAND_COLORS[si] : "#f87171";
            ctx.fill();
          }
        });

        ctx.globalAlpha = 1;
      }

      t += 0.008;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [chain]);

  return (
    <canvas
      ref={canvasRef}
      width={700}
      height={200}
      className="w-full rounded-lg border border-border/30"
      style={{ background: "hsl(220,22%,4%)" }}
    />
  );
}

export default function MemoryBraid() {
  const qc = useQueryClient();
  const { data: nodes = [], isLoading } = useQuery({
    queryKey: ["nodes"],
    queryFn:  () => api.get("/api/nodes"),
    refetchInterval: 15000,
  });

  const appendMutation = useMutation({
    mutationFn: ({ id, data }) => api.post(`/api/nodes/${id}/append`, { data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nodes"] }),
  });

  // Find the memory braid node
  const memNode = nodes.find(n => n.name?.toLowerCase().includes("memory")) || nodes[0];
  const chain = memNode?.chain || [];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold font-mono" style={{ color: GOLD }}>Memory Braid</h1>
        <p className="text-xs text-muted-foreground">Braid group B₇ — crossing events animate the topology</p>
      </div>

      {/* Braid Canvas */}
      <div className="rounded-xl border border-border p-4 space-y-3" style={{ background: "hsl(220,18%,7%)" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-mono" style={{ color: GOLD }}>Live Braid Topology</h2>
          <span className="text-[9px] font-mono text-muted-foreground">{chain.length} blocks · B₇</span>
        </div>
        {isLoading
          ? <p className="text-xs text-muted-foreground font-mono py-8 text-center">Fetching braid chain…</p>
          : <BraidCanvas chain={memNode?.strands ? [] : chain} />
        }
        <div className="flex gap-2 flex-wrap">
          {STRAND_COLORS.map((c, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 rounded-full" style={{ background: c }} />
              <span className="text-[9px] font-mono text-muted-foreground">σ{i+1}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-[9px] font-mono text-muted-foreground">σ⁻¹ (negative)</span>
          </div>
        </div>
      </div>

      {/* Node Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {nodes.filter(n => ["memory", "security", "recovery"].includes(n.category)).map(n => (
          <div key={n.id} className="rounded-xl border border-border p-4 space-y-3" style={{ background: "hsl(220,18%,7%)" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono">{n.name}</span>
              <Badge className="text-[9px] font-mono border"
                style={n.valid
                  ? { background: "rgba(74,222,128,0.1)", color: "#4ade80", borderColor: "rgba(74,222,128,0.3)" }
                  : { background: "rgba(239,68,68,0.1)", color: "#f87171", borderColor: "rgba(239,68,68,0.3)" }}>
                {n.integrityPct}%
              </Badge>
            </div>
            {n.invariant && (
              <p className="text-[9px] font-mono text-muted-foreground">
                tr₀.₃={n.invariant.trace03?.toFixed(4)} · tr₀.₇={n.invariant.trace07?.toFixed(4)}
              </p>
            )}
            <Button size="sm" disabled={appendMutation.isPending}
              className="w-full h-7 text-[10px] font-mono"
              style={{ background: "rgba(201,168,76,0.08)", color: GOLD, border: "1px solid rgba(201,168,76,0.2)" }}
              onClick={() => appendMutation.mutate({ id: n.id, data: `MEMORY_WRITE:${n.name}:${Date.now()}` })}>
              <Zap className="w-3 h-3 mr-1" /> Write Memory Block
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
