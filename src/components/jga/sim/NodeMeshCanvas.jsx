import React, { useEffect, useRef } from "react";

const GOLD = "#C9A84C";

// 25 node types placed in mesh positions
const NODES = [
  // Core spine area (center)
  { id: "spine", label: "SPINE", x: 0.5, y: 0.5, color: GOLD, size: 14, critical: true },
  // Verification braid (top arc)
  { id: "truth_a", label: "Truth A", x: 0.28, y: 0.22, color: "#C9A84C", size: 9 },
  { id: "truth_b", label: "Truth B", x: 0.44, y: 0.18, color: "#C9A84C", size: 9 },
  { id: "verif", label: "Verif", x: 0.62, y: 0.2, color: "#84cc16", size: 9 },
  { id: "valid", label: "Valid", x: 0.76, y: 0.28, color: "#22d3ee", size: 9 },
  { id: "cert", label: "Cert", x: 0.72, y: 0.42, color: "#4ade80", size: 9 },
  // Hunter/Warrior cluster (left)
  { id: "hunter_a", label: "Hunter A", x: 0.14, y: 0.38, color: "#94a3b8", size: 8 },
  { id: "hunter_b", label: "Hunter B", x: 0.1, y: 0.52, color: "#94a3b8", size: 8 },
  { id: "warrior", label: "Warrior", x: 0.18, y: 0.62, color: "#ef4444", size: 9 },
  { id: "silence", label: "Silence", x: 0.22, y: 0.48, color: "#6366f1", size: 8 },
  // Ghost/Phoenix cluster (bottom-left)
  { id: "ghost", label: "Ghost", x: 0.2, y: 0.75, color: "#94a3b8", size: 8 },
  { id: "phoenix", label: "Phoenix", x: 0.34, y: 0.82, color: "#f97316", size: 9 },
  { id: "anchor", label: "Anchor", x: 0.14, y: 0.88, color: GOLD, size: 8 },
  // Memory/RAM cluster (right)
  { id: "ram_guard", label: "RAM Guard", x: 0.84, y: 0.4, color: "#ec4899", size: 8 },
  { id: "cooling", label: "Cooling", x: 0.88, y: 0.54, color: "#06b6d4", size: 8 },
  { id: "memory_pocket", label: "Mem Pocket", x: 0.82, y: 0.67, color: "#60a5fa", size: 8 },
  { id: "relaxation", label: "Relaxation", x: 0.76, y: 0.78, color: "#a78bfa", size: 7 },
  // Business cluster (bottom-right)
  { id: "client_intake", label: "Client Intake", x: 0.58, y: 0.82, color: "#fbbf24", size: 8 },
  { id: "contractor", label: "Contractor", x: 0.44, y: 0.86, color: "#f59e0b", size: 8 },
  { id: "payment", label: "Payment", x: 0.66, y: 0.9, color: "#22c55e", size: 7 },
  { id: "policy", label: "Policy", x: 0.52, y: 0.74, color: "#84cc16", size: 7 },
  // System nodes
  { id: "ledger", label: "Ledger", x: 0.36, y: 0.62, color: GOLD, size: 9 },
  { id: "health", label: "Health", x: 0.38, y: 0.35, color: "#4ade80", size: 8 },
  { id: "builder", label: "Builder", x: 0.62, y: 0.6, color: "#a78bfa", size: 7 },
  { id: "cleaner", label: "Cleaner", x: 0.26, y: 0.35, color: "#06b6d4", size: 7 },
];

// Edges (connections)
const EDGES = [
  ["spine", "cert"], ["spine", "ledger"], ["spine", "health"], ["spine", "builder"],
  ["truth_a", "truth_b"], ["truth_b", "verif"], ["verif", "valid"], ["valid", "cert"],
  ["cert", "spine"], ["health", "ledger"], ["ledger", "phoenix"], ["ghost", "phoenix"],
  ["hunter_a", "hunter_b"], ["hunter_a", "warrior"], ["warrior", "silence"],
  ["silence", "ledger"], ["ghost", "anchor"], ["anchor", "spine"],
  ["ram_guard", "cooling"], ["cooling", "memory_pocket"], ["memory_pocket", "verif"],
  ["client_intake", "policy"], ["policy", "ledger"], ["contractor", "verif"],
  ["payment", "policy"], ["cleaner", "cert"], ["builder", "cert"],
  ["relaxation", "cooling"], ["hunter_b", "ledger"], ["truth_a", "cleaner"],
  ["phoenix", "cert"], ["warrior", "hunter_a"], ["ledger", "builder"],
];

const STATE_NODE_OVERRIDES = {
  healthy: {},
  drifting: { hunter_a: "#fbbf24", hunter_b: "#fbbf24", ledger: "#fbbf24" },
  corrupted: { memory_pocket: "#ef4444", ledger: "#ef4444", truth_a: "#ef4444", relaxation: "#7f1d1d", cooling: "#f97316" },
  healing: { phoenix: "#4ade80", ghost: "#4ade80", cert: "#a78bfa", warrior: "#a78bfa" },
  recovering: { phoenix: "#60a5fa", cert: "#60a5fa", ledger: "#4ade80", spine: "#4ade80" },
  certified: {},
};

export default function NodeMeshCanvas({ braidState, healPct, activeEvent }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const cw = canvas.offsetWidth;
    const ch = canvas.offsetHeight;
    canvas.width = cw * dpr;
    canvas.height = ch * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const overrides = STATE_NODE_OVERRIDES[braidState] || {};
    const glitch = braidState === "corrupted" || braidState === "drifting";
    const healing = braidState === "healing" || braidState === "recovering";

    const draw = () => {
      tRef.current += 0.018;
      const t = tRef.current;
      ctx.clearRect(0, 0, cw, ch);

      // Space background
      ctx.fillStyle = "hsl(220,22%,4%)";
      ctx.fillRect(0, 0, cw, ch);

      // Stars
      for (let i = 0; i < 60; i++) {
        const sx = ((i * 137 + 23) % cw);
        const sy = ((i * 89 + 71) % ch);
        const alpha = 0.2 + 0.15 * Math.sin(t * 0.5 + i);
        ctx.beginPath();
        ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      }

      // Corruption particles
      if (glitch) {
        for (let i = 0; i < 12; i++) {
          if (Math.random() < 0.35) {
            ctx.beginPath();
            ctx.arc(Math.random() * cw, Math.random() * ch, Math.random() * 2 + 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(239,68,68,${Math.random() * 0.6})`;
            ctx.fill();
          }
        }
      }

      // Healing shimmer
      if (healing) {
        const grd = ctx.createRadialGradient(cw * 0.5, ch * 0.5, 0, cw * 0.5, ch * 0.5, cw * 0.4);
        grd.addColorStop(0, `rgba(74,222,128,${0.03 + 0.02 * Math.sin(t * 2)})`);
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, cw, ch);
      }

      // Draw edges
      EDGES.forEach(([aId, bId]) => {
        const a = NODES.find(n => n.id === aId);
        const b = NODES.find(n => n.id === bId);
        if (!a || !b) return;
        const ax = a.x * cw, ay = a.y * ch;
        const bx = b.x * cw, by = b.y * ch;
        const aColor = overrides[aId] || a.color;
        const bColor = overrides[bId] || b.color;
        const corruptEdge = glitch && (overrides[aId] || overrides[bId]);
        const edgeAlpha = corruptEdge ? 0.15 + 0.1 * Math.sin(t * 8) : 0.18;

        const grd = ctx.createLinearGradient(ax, ay, bx, by);
        grd.addColorStop(0, aColor + "40");
        grd.addColorStop(1, bColor + "40");
        ctx.beginPath();
        ctx.strokeStyle = grd;
        ctx.lineWidth = corruptEdge ? 0.5 : 1;
        ctx.globalAlpha = edgeAlpha;
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Traveling packet along edges during healing
        if (healing && Math.random() < 0.015) {
          const pct = (t * 0.6) % 1;
          const px = ax + (bx - ax) * pct;
          const py = ay + (by - ay) * pct;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = braidState === "recovering" ? "#60a5fa" : "#4ade80";
          ctx.globalAlpha = 0.7;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });

      // Draw nodes
      NODES.forEach(node => {
        const nx = node.x * cw;
        const ny = node.y * ch;
        const color = overrides[node.id] || node.color;
        const r = node.size;
        const isCorrupted = !!overrides[node.id] && glitch;
        const pulse = healing && (node.id === "phoenix" || node.id === "cert" || node.id === "ghost");
        const pulseR = pulse ? r + 2 * Math.sin(t * 3) : r;

        // Outer glow
        const glow = ctx.createRadialGradient(nx, ny, 0, nx, ny, pulseR * 3);
        glow.addColorStop(0, color + (isCorrupted ? "30" : "1A"));
        glow.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(nx, ny, pulseR * 3, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Node body
        ctx.beginPath();
        ctx.arc(nx, ny, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = node.critical ? color : "hsl(220,18%,9%)";
        ctx.strokeStyle = isCorrupted ? `rgba(239,68,68,${0.5 + 0.4 * Math.sin(t * 6)})` : color + "CC";
        ctx.lineWidth = node.critical ? 2 : 1.5;
        ctx.fill();
        ctx.stroke();

        // Glitch flicker
        if (isCorrupted && Math.random() < 0.3) {
          ctx.beginPath();
          ctx.arc(nx, ny, pulseR, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(239,68,68,0.3)";
          ctx.fill();
        }

        // Label
        ctx.font = `bold ${node.critical ? 9 : 7}px monospace`;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.85;
        ctx.textAlign = "center";
        ctx.fillText(node.label, nx, ny + pulseR + 10);
        ctx.globalAlpha = 1;
      });

      // Heal progress ring around spine
      if (healPct > 0) {
        const spineNode = NODES[0];
        const sx = spineNode.x * cw, sy = spineNode.y * ch;
        ctx.beginPath();
        ctx.arc(sx, sy, 28, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * healPct / 100));
        ctx.strokeStyle = healPct === 100 ? GOLD : "#4ade80";
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [braidState, healPct]);

  const STATE_LABELS = {
    healthy: { text: "ALL NODES NOMINAL", color: "#4ade80" },
    drifting: { text: "DRIFT DETECTED — HUNTERS ACTIVE", color: "#fbbf24" },
    corrupted: { text: "CORRUPTION SPREADING", color: "#ef4444" },
    healing: { text: "PHOENIX PROTOCOL ACTIVE", color: "#a78bfa" },
    recovering: { text: "RESTORING FROM GHOST CHECKPOINT", color: "#60a5fa" },
    certified: { text: "CERTIFIED — SPINE CLEAN", color: GOLD },
  };
  const label = STATE_LABELS[braidState] || STATE_LABELS.healthy;

  return (
    <div className="rounded-2xl border border-border overflow-hidden" style={{ background: "hsl(220,20%,4%)" }}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">25-Node SB Mesh · Live Visualization</span>
        <span className="text-[10px] font-bold font-mono" style={{ color: label.color }}>● {label.text}</span>
      </div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 380, display: "block" }} />
    </div>
  );
}