import React, { useRef, useEffect, useCallback } from "react";
import { INDUSTRIES } from "@/lib/sb688Engine";

const NODE_POSITIONS = {
  core: { x: 0.5, y: 0.12 },
  driver_net: { x: 0.5, y: 0.34 },
  braidA: { x: 0.28, y: 0.56 },
  braidB: { x: 0.72, y: 0.56 },
  fs: { x: 0.5, y: 0.72 },
  user_app: { x: 0.5, y: 0.92 },
};

const EDGES = [
  ["core", "driver_net"],
  ["driver_net", "braidA"],
  ["driver_net", "braidB"],
  ["braidA", "fs"],
  ["braidB", "fs"],
  ["fs", "user_app"],
];

const STATUS_COLORS = {
  healthy: "#2dd4bf",
  degraded: "#f59e0b",
  isolated: "#ef4444",
};

export default function TopologyMap({ state }) {
  const canvasRef = useRef(null);
  const industry = INDUSTRIES[state.industry];

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    ctx.clearRect(0, 0, W, H);

    const getPos = (key) => ({
      x: NODE_POSITIONS[key].x * W,
      y: NODE_POSITIONS[key].y * H,
    });

    // Draw edges
    EDGES.forEach(([from, to]) => {
      const p1 = getPos(from);
      const p2 = getPos(to);
      const isOnRoute = state.approvedRoute.includes(from) && state.approvedRoute.includes(to);
      const fromIdx = state.approvedRoute.indexOf(from);
      const toIdx = state.approvedRoute.indexOf(to);
      const isActiveEdge = isOnRoute && Math.abs(fromIdx - toIdx) === 1;

      const fromStatus = state.components[from]?.status;
      const toStatus = state.components[to]?.status;
      const isDegraded = fromStatus === "degraded" || toStatus === "degraded";
      const isIsolated = fromStatus === "isolated" || toStatus === "isolated";

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);

      if (isIsolated) {
        ctx.strokeStyle = "rgba(239,68,68,0.3)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
      } else if (isActiveEdge) {
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([]);
        ctx.shadowColor = "#3b82f6";
        ctx.shadowBlur = 8;
      } else if (isDegraded) {
        ctx.strokeStyle = "rgba(245,158,11,0.5)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 3]);
      } else {
        ctx.strokeStyle = "rgba(196,163,80,0.25)";
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    });

    // Draw nodes
    Object.keys(NODE_POSITIONS).forEach((key) => {
      const pos = getPos(key);
      const status = state.components[key]?.status || "healthy";
      const color = STATUS_COLORS[status];
      const label = industry.components[key]?.label || key;
      const r = 18;

      // Glow
      if (status !== "isolated") {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r + 6, 0, Math.PI * 2);
        ctx.fillStyle = status === "healthy" ? "rgba(45,212,191,0.08)" : status === "degraded" ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)";
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.fillStyle = "#1a1d24";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Label
      ctx.fillStyle = "rgba(196,163,80,0.9)";
      ctx.font = "600 10px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, pos.x, pos.y + r + 14);
    });
  }, [state, industry]);

  useEffect(() => {
    draw();
    const handleResize = () => draw();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [draw]);

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">System Map</h3>
      <div className="relative w-full" style={{ paddingBottom: "85%" }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
      </div>
      <div className="flex flex-wrap gap-3 text-[10px]">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-400" /> Healthy</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Degraded</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Isolated</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-blue-500 rounded" /> Active Route</span>
      </div>
    </div>
  );
}