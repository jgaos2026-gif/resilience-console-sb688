import React, { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";

const GOLD = "#C9A84C";

// Strand color definitions
const STRAND_COLORS = {
  healthy: ["#C9A84C", "#C9A84C", "#a07828", "#a78bfa", "#60a5fa", "#60a5fa", "#22c55e", "#22c55e", "#ec4899"],
  warning: ["#fbbf24", "#fbbf24", "#f97316", "#a78bfa", "#94a3b8", "#60a5fa", "#fbbf24", "#22c55e", "#fbbf24"],
  corrupted: ["#ef4444", "#7f1d1d", "#ef4444", "#dc2626", "#991b1b", "#94a3b8", "#ef4444", "#7f1d1d", "#dc2626"],
  healing: ["#4ade80", "#fbbf24", "#ef4444", "#a78bfa", "#4ade80", "#fbbf24", "#4ade80", "#22c55e", "#fbbf24"],
  recovering: ["#4ade80", "#4ade80", "#C9A84C", "#a78bfa", "#60a5fa", "#4ade80", "#22c55e", "#4ade80", "#4ade80"],
};

const STATE_LABELS = {
  healthy: { text: "BRAID NOMINAL", color: "#4ade80" },
  warning: { text: "DRIFT DETECTED", color: "#fbbf24" },
  corrupted: { text: "CORRUPTION ACTIVE", color: "#ef4444" },
  healing: { text: "HEALING IN PROGRESS", color: "#a78bfa" },
  recovering: { text: "RESTORING FROM GHOST", color: "#60a5fa" },
};

export default function BraidCanvas({ braidState, healProgress, scenario, running }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    const H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    const colors = STRAND_COLORS[braidState] || STRAND_COLORS.healthy;
    const numStrands = 9;
    const amplitude = braidState === "corrupted" ? 55 : braidState === "healing" ? 30 : 20;
    const speed = braidState === "corrupted" ? 0.04 : braidState === "healing" ? 0.025 : 0.018;
    const glitch = braidState === "corrupted" || braidState === "warning";

    const draw = () => {
      timeRef.current += speed;
      const t = timeRef.current;

      ctx.clearRect(0, 0, w, h);

      // Background glow based on state
      const glowColor = braidState === "corrupted" ? "rgba(239,68,68,0.06)" :
        braidState === "healing" ? "rgba(167,139,250,0.06)" :
        braidState === "recovering" ? "rgba(96,165,250,0.06)" :
        "rgba(201,168,76,0.04)";
      ctx.fillStyle = glowColor;
      ctx.fillRect(0, 0, w, h);

      // Draw each strand as a sinusoidal wave
      for (let s = 0; s < numStrands; s++) {
        const offset = (s / numStrands) * Math.PI * 2;
        const yBase = (h / (numStrands + 1)) * (s + 1);
        const color = colors[s % colors.length];

        ctx.beginPath();
        ctx.strokeStyle = color;

        // Glitch effect for corruption
        const lineWidth = glitch && s % 3 === 0 ? 1 + Math.sin(t * 20 + s) * 2 : 2;
        ctx.lineWidth = lineWidth;

        const alpha = braidState === "corrupted" && s % 2 === 0 ? 0.4 + Math.sin(t * 15 + s) * 0.3 : 0.85;
        ctx.globalAlpha = alpha;

        for (let x = 0; x <= w; x += 2) {
          const glitchX = glitch && Math.random() < 0.002 ? x + (Math.random() - 0.5) * 20 : x;
          const y = yBase + Math.sin((glitchX / w) * Math.PI * 4 + t + offset) * amplitude
            + Math.sin((glitchX / w) * Math.PI * 8 + t * 1.3 + offset) * (amplitude * 0.3);
          if (x === 0) ctx.moveTo(glitchX, y);
          else ctx.lineTo(glitchX, y);
        }
        ctx.stroke();

        // Glow pass for healing/recovering
        if (braidState === "healing" || braidState === "recovering") {
          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.lineWidth = 6;
          ctx.globalAlpha = 0.08;
          for (let x = 0; x <= w; x += 4) {
            const y = yBase + Math.sin((x / w) * Math.PI * 4 + t + offset) * amplitude;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // Cross-weave connections (the braid effect)
      if (braidState !== "corrupted") {
        ctx.globalAlpha = 0.12;
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 1;
        for (let x = 40; x < w; x += 60) {
          const xi = x / w;
          for (let s = 0; s < numStrands - 1; s++) {
            const yA = ((h / (numStrands + 1)) * (s + 1)) + Math.sin(xi * Math.PI * 4 + t + (s / numStrands) * Math.PI * 2) * amplitude;
            const yB = ((h / (numStrands + 1)) * (s + 2)) + Math.sin(xi * Math.PI * 4 + t + ((s + 1) / numStrands) * Math.PI * 2) * amplitude;
            ctx.beginPath();
            ctx.moveTo(x, yA);
            ctx.lineTo(x, yB);
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
      }

      // Corruption sparks
      if (glitch) {
        for (let i = 0; i < 8; i++) {
          if (Math.random() < 0.3) {
            const sx = Math.random() * w;
            const sy = Math.random() * h;
            const r = Math.random() * 3 + 1;
            ctx.beginPath();
            ctx.arc(sx, sy, r, 0, Math.PI * 2);
            ctx.fillStyle = "#ef4444";
            ctx.globalAlpha = Math.random() * 0.7;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        }
      }

      // Healing particles
      if (braidState === "healing" || braidState === "recovering") {
        for (let i = 0; i < 5; i++) {
          if (Math.random() < 0.4) {
            const px = (t * 80 * (i + 1)) % w;
            const s = Math.floor(Math.random() * numStrands);
            const offset2 = (s / numStrands) * Math.PI * 2;
            const py = ((h / (numStrands + 1)) * (s + 1)) + Math.sin((px / w) * Math.PI * 4 + t + offset2) * amplitude;
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = braidState === "recovering" ? "#60a5fa" : "#4ade80";
            ctx.globalAlpha = 0.8;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        }
      }

      // Heal progress bar
      if (healProgress > 0 && healProgress < 100) {
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(10, h - 22, w - 20, 8);
        const barColor = braidState === "corrupted" ? "#ef4444" : braidState === "healing" ? "#a78bfa" : "#4ade80";
        ctx.fillStyle = barColor;
        ctx.fillRect(10, h - 22, (w - 20) * (healProgress / 100), 8);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [braidState, healProgress]);

  const label = STATE_LABELS[braidState] || STATE_LABELS.healthy;

  return (
    <div className="rounded-2xl border border-border overflow-hidden" style={{ background: "hsl(220,20%,5%)" }}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          66-Strand Braid · Live State
        </span>
        <span className="text-[10px] font-bold font-mono" style={{ color: label.color }}>
          ● {label.text}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: 280, display: "block" }}
      />
      {scenario && (
        <div className="px-4 py-2 border-t border-border flex items-center gap-2 flex-wrap">
          <span className="text-lg">{scenario.icon}</span>
          <span className="text-[10px] font-semibold" style={{ color: scenario.color }}>{scenario.label}</span>
          <Badge className="text-[8px] border font-bold ml-auto" style={{ background: `${scenario.color}10`, color: scenario.color, borderColor: `${scenario.color}30` }}>
            {scenario.severity}
          </Badge>
        </div>
      )}
    </div>
  );
}