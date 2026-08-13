import React, { useState } from "react";
import { INDUSTRIES } from "@/lib/sb688Engine";

// Fixed node positions (normalized 0-1)
const NODE_POSITIONS = {
  core:       { x: 0.50, y: 0.12 },
  driver_net: { x: 0.50, y: 0.38 },
  braidA:     { x: 0.22, y: 0.62 },
  braidB:     { x: 0.78, y: 0.62 },
  fs:         { x: 0.50, y: 0.62 },
  user_app:   { x: 0.50, y: 0.88 },
};

// All possible edges (from → to)
const ALL_EDGES = [
  { id: "core-driver_net",  from: "core",       to: "driver_net" },
  { id: "driver_net-braidA",from: "driver_net", to: "braidA" },
  { id: "driver_net-braidB",from: "driver_net", to: "braidB" },
  { id: "driver_net-fs",    from: "driver_net", to: "fs" },
  { id: "braidA-fs",        from: "braidA",     to: "fs" },
  { id: "braidB-fs",        from: "braidB",     to: "fs" },
  { id: "fs-user_app",      from: "fs",         to: "user_app" },
  { id: "braidA-user_app",  from: "braidA",     to: "user_app" },
];

const STATUS_COLOR = {
  healthy:  { fill: "#14b8a6", stroke: "#0d9488", text: "#ccfbf1", ring: "rgba(20,184,166,0.25)" },
  degraded: { fill: "#f59e0b", stroke: "#d97706", text: "#fef3c7", ring: "rgba(245,158,11,0.25)" },
  isolated: { fill: "#ef4444", stroke: "#dc2626", text: "#fee2e2", ring: "rgba(239,68,68,0.25)" },
};

function getEdgeStyle(fromKey, toKey, approvedRoute, components) {
  const fromStatus = components[fromKey]?.status || "healthy";
  const toStatus   = components[toKey]?.status   || "healthy";

  // Is this edge on the approved route?
  const routeIdx = approvedRoute.indexOf(fromKey);
  const onRoute = routeIdx >= 0 && approvedRoute[routeIdx + 1] === toKey;

  if (fromStatus === "isolated" || toStatus === "isolated")
    return { stroke: "#ef4444", strokeWidth: 2, dash: "6 3", opacity: 0.7 };
  if (fromStatus === "degraded" || toStatus === "degraded")
    return { stroke: "#f59e0b", strokeWidth: 1.5, dash: "5 4", opacity: 0.6 };
  if (onRoute)
    return { stroke: "#22c55e", strokeWidth: 2.5, dash: "none", opacity: 1 };
  return { stroke: "rgba(196,163,80,0.2)", strokeWidth: 1, dash: "none", opacity: 0.5 };
}

// Tooltip card
function NodeTooltip({ node, comp, label, role, x, y, W, H }) {
  const cfg = STATUS_COLOR[comp.status] || STATUS_COLOR.healthy;
  // Keep tooltip within bounds
  const tipW = 160, tipH = 80;
  let tx = x - tipW / 2;
  let ty = y - tipH - 16;
  if (tx < 4) tx = 4;
  if (tx + tipW > W - 4) tx = W - tipW - 4;
  if (ty < 4) ty = y + 20;

  return (
    <g>
      <rect x={tx} y={ty} width={tipW} height={tipH} rx={8} ry={8}
        fill="#0f1318" stroke={cfg.stroke} strokeWidth={1} opacity={0.97} />
      <text x={tx + 10} y={ty + 18} fill={cfg.fill} fontSize={11} fontWeight="700">{label}</text>
      <text x={tx + 10} y={ty + 34} fill="rgba(255,255,255,0.5)" fontSize={9}>{role?.slice(0, 32)}</text>
      <rect x={tx + 10} y={ty + 42} width={50} height={14} rx={4} fill={cfg.fill} opacity={0.15} />
      <text x={tx + 35} y={ty + 52} fill={cfg.fill} fontSize={9} fontWeight="700" textAnchor="middle">
        {comp.status.toUpperCase()}
      </text>
      <text x={tx + 10} y={ty + 68} fill="rgba(255,255,255,0.3)" fontSize={8} fontFamily="monospace">
        {comp.checkpointId}
      </text>
    </g>
  );
}

export default function TopologyMap({ state }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const W = 500, H = 340;

  const industry = INDUSTRIES[state.industry];

  const nodeEntries = Object.entries(NODE_POSITIONS).map(([key, pos]) => ({
    key,
    x: pos.x * W,
    y: pos.y * H,
    label: industry.components[key]?.label || key,
    role:  industry.components[key]?.role  || "",
    comp:  state.components[key] || { status: "healthy", checkpointId: "—" },
  }));

  const nodeMap = Object.fromEntries(nodeEntries.map(n => [n.key, n]));

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-primary">Live Topology Map</h3>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500 inline-block rounded" /> Active Route</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 inline-block rounded" /> Failed</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-400 inline-block rounded" style={{borderTop:"2px dashed"}} /> Degraded</span>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-lg" style={{ background: "rgba(10,13,18,0.6)" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ display: "block" }}
        >
          {/* Edges */}
          {ALL_EDGES.map((edge) => {
            const from = nodeMap[edge.from];
            const to   = nodeMap[edge.to];
            if (!from || !to) return null;
            const style = getEdgeStyle(edge.from, edge.to, state.approvedRoute, state.components);
            return (
              <line
                key={edge.id}
                x1={from.x} y1={from.y}
                x2={to.x}   y2={to.y}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.dash === "none" ? undefined : style.dash}
                opacity={style.opacity}
              />
            );
          })}

          {/* Nodes */}
          {nodeEntries.map((node) => {
            const cfg = STATUS_COLOR[node.comp.status] || STATUS_COLOR.healthy;
            const isHovered = hoveredNode === node.key;
            const r = isHovered ? 22 : 18;

            return (
              <g
                key={node.key}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredNode(node.key)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Glow ring */}
                <circle cx={node.x} cy={node.y} r={r + 6} fill={cfg.ring} opacity={isHovered ? 1 : 0.5} />
                {/* Node circle */}
                <circle
                  cx={node.x} cy={node.y} r={r}
                  fill={cfg.fill} fillOpacity={0.15}
                  stroke={cfg.stroke} strokeWidth={isHovered ? 2.5 : 1.5}
                />
                {/* Status pulse ring for degraded/isolated */}
                {node.comp.status !== "healthy" && (
                  <circle cx={node.x} cy={node.y} r={r + 10}
                    fill="none" stroke={cfg.stroke} strokeWidth={1} opacity={0.3} />
                )}
                {/* Label */}
                <text
                  x={node.x} y={node.y + 4}
                  textAnchor="middle" dominantBaseline="middle"
                  fill={cfg.fill} fontSize={8} fontWeight="600"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {node.label.split(" ").slice(0, 2).join("\n")}
                </text>
              </g>
            );
          })}

          {/* Tooltip (rendered last = on top) */}
          {hoveredNode && nodeMap[hoveredNode] && (() => {
            const n = nodeMap[hoveredNode];
            return (
              <NodeTooltip
                key={hoveredNode}
                node={hoveredNode}
                comp={n.comp}
                label={n.label}
                role={n.role}
                x={n.x} y={n.y}
                W={W} H={H}
              />
            );
          })()}
        </svg>
      </div>

      {/* Route annotation */}
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
        <span className="font-semibold text-foreground/50">Active Route:</span>
        {state.approvedRoute.map((key, i) => (
          <React.Fragment key={key}>
            <span className={`px-1.5 py-0.5 rounded font-medium ${
              state.components[key]?.status === "healthy" ? "text-teal-400" :
              state.components[key]?.status === "degraded" ? "text-amber-400" : "text-red-400"
            }`}>{industry.components[key]?.label || key}</span>
            {i < state.approvedRoute.length - 1 && <span className="text-muted-foreground/30">→</span>}
          </React.Fragment>
        ))}
        <span className={`ml-auto font-semibold ${state.routeType === "primary" ? "text-teal-400" : "text-amber-400"}`}>
          {state.routeType === "primary" ? "Primary" : "Alternate"} · {state.routeTime}ms
        </span>
      </div>
    </div>
  );
}