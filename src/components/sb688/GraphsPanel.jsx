import React, { useRef, useEffect, useCallback } from "react";

function drawChart(canvas, data, labels, title, color, suffix = "") {
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

  const padding = { top: 30, right: 16, bottom: 28, left: 42 };
  const chartW = W - padding.left - padding.right;
  const chartH = H - padding.top - padding.bottom;

  const maxVal = Math.max(...data, 1);
  const minVal = 0;

  // Title
  ctx.fillStyle = "rgba(196,163,80,0.8)";
  ctx.font = "600 11px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(title, padding.left, 16);

  // Y axis lines
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartH * i) / 4;
    const val = Math.round(maxVal - (maxVal * i) / 4);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(W - padding.right, y);
    ctx.strokeStyle = "rgba(196,163,80,0.06)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "rgba(196,163,80,0.3)";
    ctx.font = "400 9px Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${val}${suffix}`, padding.left - 6, y + 3);
  }

  if (data.length < 2) {
    // Single point
    const x = padding.left + chartW / 2;
    const y = padding.top + chartH * (1 - data[0] / maxVal);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    if (labels[0]) {
      ctx.fillStyle = "rgba(196,163,80,0.4)";
      ctx.font = "400 9px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(labels[0], x, H - 6);
    }
    return;
  }

  const step = chartW / (data.length - 1);

  // Area fill
  ctx.beginPath();
  data.forEach((val, i) => {
    const x = padding.left + step * i;
    const y = padding.top + chartH * (1 - val / maxVal);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(padding.left + step * (data.length - 1), padding.top + chartH);
  ctx.lineTo(padding.left, padding.top + chartH);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
  grad.addColorStop(0, color + "20");
  grad.addColorStop(1, color + "02");
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  data.forEach((val, i) => {
    const x = padding.left + step * i;
    const y = padding.top + chartH * (1 - val / maxVal);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Points
  data.forEach((val, i) => {
    const x = padding.left + step * i;
    const y = padding.top + chartH * (1 - val / maxVal);
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.strokeStyle = color + "40";
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // X labels
  labels.forEach((label, i) => {
    const x = padding.left + step * i;
    ctx.fillStyle = "rgba(196,163,80,0.4)";
    ctx.font = "400 9px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x, H - 6);
  });
}

export default function GraphsPanel({ state, isLive = false }) {
  const resRef = useRef(null);
  const routeRef = useRef(null);
  const contRef = useRef(null);

  const drawAll = useCallback(() => {
    drawChart(resRef.current, state.graphData.resilienceTimeline, state.graphData.labels, "Resilience Score Timeline", "#2dd4bf", "%");
    drawChart(routeRef.current, state.graphData.routeTimeComparison, state.graphData.labels, "Route Time Comparison", "#3b82f6", "ms");
    drawChart(contRef.current, state.graphData.continuityOutcome, state.graphData.labels, "Mission Continuity", "#c4a350", "%");
  }, [state.graphData]);

  useEffect(() => {
    drawAll();
    const handleResize = () => drawAll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawAll]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Live System Health Graphs</h3>
          <p className="text-[11px] text-muted-foreground">Updates from workspace telemetry events, separate from AI analysis.</p>
        </div>
        <span className={`text-[9px] px-2 py-1 rounded-full border font-semibold ${isLive ? "text-teal-400 border-teal-500/30 bg-teal-500/10" : "text-muted-foreground border-border bg-secondary/40"}`}>
          {isLive ? "● Streaming" : "Paused"}
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <canvas ref={resRef} className="w-full" style={{ height: 200 }} />
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <canvas ref={routeRef} className="w-full" style={{ height: 200 }} />
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <canvas ref={contRef} className="w-full" style={{ height: 200 }} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">What These Metrics Mean</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground leading-relaxed">
          <div>
            <p className="font-semibold text-teal-400 mb-1">Resilience Score</p>
            <p>Measures the system's overall ability to withstand and recover from disruptions. 100% means all components are healthy and all paths are active. Score drops during incidents and recovers after Smart Recovery.</p>
          </div>
          <div>
            <p className="font-semibold text-blue-400 mb-1">Route Time</p>
            <p>The time in milliseconds for data to traverse the approved route from origin to destination. Lower is better. Alternate routes typically have higher latency than primary paths.</p>
          </div>
          <div>
            <p className="font-semibold text-primary mb-1">Mission Continuity</p>
            <p>Represents the percentage of operational capability maintained during and after an incident. High continuity means the mission keeps running even when individual components fail.</p>
          </div>
        </div>
      </div>
    </div>
  );
}