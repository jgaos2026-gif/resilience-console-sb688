import React, { useRef, useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, AlertTriangle, Activity, Lock, Zap, RotateCcw } from "lucide-react";

// ── Node layout: 5 rows × offset cols, Brick Stitch 1/2 geometry ─────────────
const COLS = 7;
const ROWS = 5;

function buildNodes(W, H) {
  const brickW = Math.floor(W / (COLS + 0.5)) - 4;
  const brickH = Math.floor(H / ROWS) - 8;
  const gap = 4;
  const nodes = [];

  const ROLES = ["Spine", "Rib-L", "Rib-R", "Weave", "Anchor"];
  const NAMES = [
    ["S-00","S-01","S-02","S-03","S-04","S-05","S-06"],
    ["R-10","R-11","R-12","R-13","R-14","R-15"],
    ["W-20","W-21","W-22","W-23","W-24","W-25","W-26"],
    ["A-30","A-31","A-32","A-33","A-34","A-35"],
    ["S-40","S-41","S-42","S-43","S-44","S-45","S-46"],
  ];

  for (let row = 0; row < ROWS; row++) {
    const isOffset = row % 2 === 1;
    const colCount = isOffset ? COLS - 1 : COLS;
    const offset = isOffset ? brickW / 2 + gap / 2 : 0;

    for (let col = 0; col < colCount; col++) {
      const x = offset + col * (brickW + gap) + gap;
      const y = row * (brickH + gap) + gap;
      const isSpine = col === Math.floor(colCount / 2);
      nodes.push({
        id: `${row}-${col}`,
        name: NAMES[row]?.[col] ?? `N-${row}${col}`,
        row, col,
        x, y, w: brickW, h: brickH,
        cx: x + brickW / 2,
        cy: y + brickH / 2,
        role: isSpine ? "Spine" : ROLES[row] ?? "Node",
        isSpine,
      });
    }
  }
  return nodes;
}

// ── Per-node simulated state ──────────────────────────────────────────────────
function makeNodeState(id, row, col) {
  const seed = (row * 13 + col * 7) % 100;
  const integrity = 92 + (seed % 8);
  const hmac = `sha3:${Math.abs((id.charCodeAt(0) * 997 + col * 31) % 65535).toString(16).padStart(4,"0")}…`;
  const events = [];
  if (seed < 20) events.push({ ts: "09:41:02Z", type: "recover", msg: "Recovered from adjacent node fault" });
  if (seed < 40) events.push({ ts: "09:38:17Z", type: "verify",  msg: "Checkpoint verified — hash match" });
  events.push(     { ts: "09:31:55Z", type: "ok",      msg: "Heartbeat nominal" });
  return { integrity, hmac, events, load: 42 + (seed % 45) };
}

// ── Colors ────────────────────────────────────────────────────────────────────
const GOLD    = "#C9A84C";
const GOLD_DIM= "rgba(201,168,76,0.35)";
const RED     = "#ef4444";
const GREEN   = "#22c55e";
const BLUE    = "#3b82f6";
const BG      = "rgba(10,9,6,0.95)";

function nodeColor(status, isSpine) {
  if (status === "failed")   return { fill: "rgba(239,68,68,0.15)",    stroke: RED };
  if (status === "healing")  return { fill: "rgba(245,158,11,0.15)",   stroke: "#f59e0b" };
  if (isSpine)               return { fill: "rgba(201,168,76,0.14)",   stroke: GOLD };
  return                            { fill: "rgba(201,168,76,0.07)",   stroke: GOLD_DIM };
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function BrickStitchGraph() {
  const containerRef = useRef(null);
  const canvasRef    = useRef(null);
  const [dims, setDims]             = useState({ W: 600, H: 300 });
  const [nodes, setNodes]           = useState([]);
  const [nodeStates, setNodeStates] = useState({});
  const [hovered, setHovered]       = useState(null); // node id
  const [tooltip, setTooltip]       = useState({ x: 0, y: 0 });
  const [failed, setFailed]         = useState(new Set());
  const [healing, setHealing]       = useState(new Set());
  const animRef = useRef(null);
  const tRef    = useRef(0);

  // Build nodes whenever dims change
  useEffect(() => {
    const built = buildNodes(dims.W, dims.H);
    setNodes(built);
    const states = {};
    built.forEach(n => { states[n.id] = makeNodeState(n.id, n.row, n.col); });
    setNodeStates(states);
  }, [dims]);

  // Observe container resize
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      const h = Math.round(width * 0.48);
      setDims({ W: Math.round(width), H: h });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Canvas draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = dims.W * dpr;
    canvas.height = dims.H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const draw = () => {
      tRef.current += 0.02;
      const t = tRef.current;
      ctx.clearRect(0, 0, dims.W, dims.H);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, dims.W, dims.H);

      // Watermark
      ctx.save();
      ctx.font = `bold ${dims.W * 0.055}px serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(201,168,76,0.025)";
      ctx.fillText("SB688", dims.W / 2, dims.H / 2);
      ctx.restore();

      // Draw rib load arrows (mid row)
      const midRow = 2;
      const isOffset = midRow % 2 === 1;
      const brickW = Math.floor(dims.W / (COLS + 0.5)) - 4;
      const brickH = Math.floor(dims.H / ROWS) - 8;
      const gap = 4;
      const midCols = isOffset ? COLS - 1 : COLS;
      const midOffset = isOffset ? brickW / 2 + gap / 2 : 0;
      const centerCol = Math.floor(midCols / 2);
      const cx = midOffset + centerCol * (brickW + gap) + gap + brickW / 2;
      const cy = midRow * (brickH + gap) + gap + brickH / 2;

      [-1, 1].forEach(dir => {
        const tx = cx + dir * (brickW + gap) * 1.5;
        const pulse = 0.4 + 0.3 * Math.sin(t * 2 + dir);
        ctx.beginPath();
        ctx.moveTo(cx + dir * 6, cy);
        ctx.lineTo(tx, cy);
        ctx.strokeStyle = `rgba(59,130,246,${pulse})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(tx, cy - 4);
        ctx.lineTo(tx + dir * 7, cy);
        ctx.lineTo(tx, cy + 4);
        ctx.strokeStyle = `rgba(59,130,246,${pulse + 0.2})`;
        ctx.lineWidth = 1; ctx.stroke();
      });

      // Draw nodes
      nodes.forEach(node => {
        const status = failed.has(node.id) ? "failed" : healing.has(node.id) ? "healing" : "ok";
        const isHovered = hovered === node.id;
        const { fill, stroke } = nodeColor(status, node.isSpine);
        const { x, y, w, h } = node;
        const r = 4;

        // Hover glow
        if (isHovered) {
          ctx.shadowColor = node.isSpine ? GOLD : BLUE;
          ctx.shadowBlur = 18;
        } else if (status === "healing") {
          const p = 0.5 + 0.5 * Math.sin(t * 5);
          ctx.shadowColor = "#f59e0b";
          ctx.shadowBlur = 10 * p;
        }

        // Rounded rect
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fillStyle = isHovered ? (node.isSpine ? "rgba(201,168,76,0.22)" : "rgba(59,130,246,0.12)") : fill;
        ctx.strokeStyle = isHovered ? (node.isSpine ? GOLD : BLUE) : stroke;
        ctx.lineWidth = isHovered ? 1.8 : 1;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Spine line
        if (node.isSpine) {
          ctx.beginPath();
          ctx.moveTo(x + w / 2, y + 4);
          ctx.lineTo(x + w / 2, y + h - 4);
          ctx.strokeStyle = status === "failed" ? "rgba(239,68,68,0.5)" : "rgba(201,168,76,0.6)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Health dot
        const dotColor = status === "failed" ? RED : status === "healing" ? "#f59e0b" : GREEN;
        ctx.beginPath();
        ctx.arc(x + w - 6, y + 6, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();

        // Node label (small)
        if (w > 40) {
          ctx.fillStyle = isHovered ? (node.isSpine ? GOLD : BLUE) : "rgba(201,168,76,0.4)";
          ctx.font = `bold ${Math.min(8, w / 7)}px monospace`;
          ctx.textAlign = "center";
          ctx.fillText(node.name, x + w / 2, y + h / 2 + 3);
        }
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [nodes, dims, hovered, failed, healing]);

  // Mouse → find hovered node
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const found = nodes.find(n => mx >= n.x && mx <= n.x + n.w && my >= n.y && my <= n.y + n.h);
    setHovered(found ? found.id : null);
    setTooltip({ x: mx, y: my });
  }, [nodes]);

  const handleMouseLeave = useCallback(() => setHovered(null), []);

  // Click → toggle failed
  const handleClick = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const found = nodes.find(n => mx >= n.x && mx <= n.x + n.w && my >= n.y && my <= n.y + n.h);
    if (!found) return;
    const id = found.id;
    setFailed(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); return next; }
      next.add(id);
      // Auto-heal after 2.5s
      setTimeout(() => {
        setHealing(h => { const nh = new Set(h); nh.add(id); return nh; });
        setTimeout(() => {
          setFailed(f => { const nf = new Set(f); nf.delete(id); return nf; });
          setHealing(h => { const nh = new Set(h); nh.delete(id); return nh; });
        }, 1200);
      }, 2500);
      return next;
    });
  }, [nodes]);

  const resetAll = useCallback(() => { setFailed(new Set()); setHealing(new Set()); }, []);

  // Tooltip node data
  const hoveredNode = hovered ? nodes.find(n => n.id === hovered) : null;
  const hoveredState = hoveredNode ? nodeStates[hoveredNode.id] : null;
  const hoveredStatus = hoveredNode
    ? (failed.has(hoveredNode.id) ? "failed" : healing.has(hoveredNode.id) ? "healing" : "ok")
    : null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-primary">Interactive Brick Stitch Node Graph</span>
          <Badge className="text-[9px] border bg-primary/10 text-primary border-primary/30 ml-1">LIVE</Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground hidden sm:block">Click node to simulate fault · Hover for details</span>
          <button onClick={resetAll}
            className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded border transition-all font-semibold"
            style={{ color: GOLD, borderColor: "rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.06)" }}>
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="relative w-full select-none cursor-crosshair"
        onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={handleClick}>
        <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: dims.H }} />

        {/* Tooltip */}
        {hoveredNode && hoveredState && (
          <div
            className="absolute z-30 pointer-events-none"
            style={{
              left: tooltip.x + 14,
              top:  Math.max(8, tooltip.y - 120),
              maxWidth: 240,
            }}>
            <div className="rounded-xl border shadow-2xl overflow-hidden"
              style={{ background: "#05060A", borderColor: "rgba(201,168,76,0.4)", boxShadow: "0 0 24px rgba(201,168,76,0.12)" }}>

              {/* Tooltip header */}
              <div className="px-3 py-2 border-b flex items-center justify-between gap-3"
                style={{ borderColor: "rgba(201,168,76,0.15)", background: "rgba(201,168,76,0.06)" }}>
                <span className="text-[11px] font-bold font-mono" style={{ color: GOLD }}>{hoveredNode.name}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold border"
                  style={{
                    color: hoveredStatus === "failed" ? "#fca5a5" : hoveredStatus === "healing" ? "#fcd34d" : "#86efac",
                    borderColor: hoveredStatus === "failed" ? "rgba(239,68,68,0.35)" : hoveredStatus === "healing" ? "rgba(245,158,11,0.35)" : "rgba(34,197,94,0.35)",
                    background: hoveredStatus === "failed" ? "rgba(239,68,68,0.1)" : hoveredStatus === "healing" ? "rgba(245,158,11,0.1)" : "rgba(34,197,94,0.08)",
                  }}>
                  {hoveredStatus === "failed" ? "FAULT" : hoveredStatus === "healing" ? "HEALING" : "NOMINAL"}
                </span>
              </div>

              <div className="px-3 py-2.5 space-y-2.5">
                {/* Role + integrity */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[8px] uppercase tracking-wider mb-0.5" style={{ color: "rgba(201,168,76,0.4)" }}>Role</div>
                    <div className="text-[11px] font-bold" style={{ color: GOLD }}>{hoveredNode.role}</div>
                  </div>
                  <div>
                    <div className="text-[8px] uppercase tracking-wider mb-0.5" style={{ color: "rgba(201,168,76,0.4)" }}>Integrity</div>
                    <div className="text-[11px] font-bold" style={{ color: hoveredState.integrity >= 95 ? GREEN : "#f59e0b" }}>
                      {hoveredStatus === "failed" ? "0.0%" : `${hoveredState.integrity.toFixed(1)}%`}
                    </div>
                  </div>
                </div>

                {/* Load */}
                <div>
                  <div className="flex justify-between text-[8px] mb-1" style={{ color: "rgba(201,168,76,0.4)" }}>
                    <span className="uppercase tracking-wider">Node Load</span>
                    <span style={{ color: GOLD }}>{hoveredStatus === "failed" ? "—" : `${hoveredState.load}%`}</span>
                  </div>
                  <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: hoveredStatus === "failed" ? "0%" : `${hoveredState.load}%`,
                        background: hoveredState.load > 75 ? RED : GOLD }} />
                  </div>
                </div>

                {/* HMAC */}
                <div>
                  <div className="text-[8px] uppercase tracking-wider mb-0.5 flex items-center gap-1" style={{ color: "rgba(201,168,76,0.4)" }}>
                    <Lock className="w-2.5 h-2.5" /> Cryptographic Hash
                  </div>
                  <div className="font-mono text-[9px]" style={{ color: hoveredStatus === "failed" ? "rgba(239,68,68,0.6)" : "rgba(201,168,76,0.65)" }}>
                    {hoveredStatus === "failed" ? "SIGNATURE MISMATCH" : hoveredState.hmac}
                  </div>
                </div>

                {/* Recent events */}
                <div>
                  <div className="text-[8px] uppercase tracking-wider mb-1" style={{ color: "rgba(201,168,76,0.4)" }}>Recent Events</div>
                  <div className="space-y-0.5">
                    {(hoveredStatus === "failed"
                      ? [{ ts: "now", type: "fault", msg: "Node fault detected — neighbors absorbing load" }]
                      : hoveredStatus === "healing"
                      ? [{ ts: "now", type: "heal",  msg: "Brick Stitch healing — checkpoint restore in progress" }]
                      : hoveredState.events
                    ).map((ev, i) => (
                      <div key={i} className="flex gap-1.5 text-[9px] items-start">
                        <span style={{ color: "rgba(201,168,76,0.25)", flexShrink: 0, fontFamily: "monospace" }}>{ev.ts}</span>
                        <span style={{
                          color: ev.type === "fault" ? "#fca5a5" : ev.type === "heal" ? "#fcd34d" : ev.type === "recover" ? "#86efac" : "rgba(232,217,176,0.55)"
                        }}>{ev.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {hoveredStatus === "failed" && (
                  <div className="rounded px-2 py-1.5 text-center text-[9px] font-bold"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
                    Adjacent nodes absorbing load · Auto-heal in 2.5s
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 py-2.5 border-t flex-wrap" style={{ borderColor: "rgba(201,168,76,0.12)", background: "rgba(201,168,76,0.02)" }}>
        {[
          { color: GOLD,     label: "Spine Node (authoritative)" },
          { color: GOLD_DIM, label: "Rib / Weave" },
          { color: GREEN,    label: "Nominal" },
          { color: "#f59e0b",label: "Healing" },
          { color: RED,      label: "Fault" },
          { color: BLUE,     label: "Load redistribution" },
        ].map((l, i) => (
          <span key={i} className="flex items-center gap-1.5 text-[9px]" style={{ color: "rgba(201,168,76,0.5)" }}>
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}