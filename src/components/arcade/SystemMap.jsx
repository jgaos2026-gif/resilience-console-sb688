import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { X, Shield, Eye, Layers, Cpu, Zap, Box, Lock, GitBranch, Infinity, Palette } from "lucide-react";

const GOLD = "#C9A84C";

const NODES = [
  {
    id: "sb688", label: "SB688", icon: Shield, color: GOLD, x: 50, y: 15,
    title: "SB688: Sovereign Stitch Protocol",
    status: "Core Doctrine / Verification Foundation", statusColor: GOLD,
    desc: "SB688 is the foundational verification philosophy. It represents the rule that no system, file, memory, output, or active state becomes trusted without verification. It is the stitch law — the discipline that keeps the system from trusting noise, drift, or unproven claims.",
    points: ["Verification before trust","Stitch-based system organization","Protects the Spine","Prevents unverified data from becoming trusted","Foundation for braided topology"],
  },
  {
    id: "sb689", label: "SB689", icon: Eye, color: "#60a5fa", x: 20, y: 38,
    title: "SB689: Watchdog and Guarded Runtime",
    status: "Runtime Guardian / Watchdog Concept", statusColor: "#60a5fa",
    desc: "SB689 represents the guarded runtime layer. It watches the system, checks for drift, tracks health, supports ledger-style accountability, and helps detect when something moves out of trusted condition.",
    points: ["Watchdog monitoring","Health checks","Drift detection","Ledger awareness","Recovery trigger support"],
  },
  {
    id: "sbv3", label: "SBV3", icon: Layers, color: "#a78bfa", x: 80, y: 38,
    title: "SBV3: Advanced System Expansion Layer",
    status: "Expansion / Advanced Prototype Layer", statusColor: "#a78bfa",
    desc: "SBV3 is the expansion layer that brings stronger interaction, better modular control, deeper automation, and upgraded system intelligence into the JGA/SB family.",
    points: ["Better control rooms","More interactive system behavior","Stronger automation paths","Human-friendly system explanation","Bridge toward business-ready modules"],
  },
  {
    id: "sb700", label: "SB700", icon: Cpu, color: "#34d399", x: 12, y: 65,
    title: "SB700: Local Foundation Intelligence Core",
    status: "Local Core Concept", statusColor: "#34d399",
    desc: "SB700 represents the local intelligence foundation. It focuses on running useful system logic on practical hardware without needing oversized cloud dependency for every action.",
    points: ["Local-first thinking","Lightweight execution","Useful on old hardware","Supports business automation","Helps keep systems lean"],
  },
  {
    id: "sb712", label: "SB712", icon: Zap, color: "#f472b6", x: 88, y: 65,
    title: "SB712: Sovereign Möbius Runtime",
    status: "Unified Runtime Direction / Active Build Concept", statusColor: "#f472b6",
    desc: "SB712 is the larger runtime vision where verification, braided memory, watchdogs, rollback, Phoenix recovery, seed deployment, and modular business tools work together.",
    points: ["Braided memory","Verified pockets","Rollback checkpoints","Phoenix recovery","RAM Guard thinking","Modular business tools","Grade A release discipline"],
  },
  {
    id: "brick01", label: "Brick01", icon: Box, color: "#fb923c", x: 35, y: 82,
    title: "Stitch Brick01: First Modular Business Brick",
    status: "First Modular Brick / Business Launch Piece", statusColor: "#fb923c",
    desc: "Stitch Brick01 is the first business-ready brick concept. It represents a small, useful, verified module that can plug into the larger JGA system without needing the whole platform at once.",
    points: ["Small deployable unit","Easier to test","Easier to repair","Easier to expand","Can connect into Oasis later"],
  },
  {
    id: "sovereign", label: "Sovereign\nProtocol", icon: Lock, color: "#e879f9", x: 65, y: 82,
    title: "The Sovereign Protocol",
    status: "Governance Protocol", statusColor: "#e879f9",
    desc: "The Sovereign Protocol is the rule system that protects trust. It defines how data enters, how it gets checked, how it gets promoted, and how the system avoids calling something trusted before it earns that status.",
    points: ["Quarantine first","Verify before promote","Ledger records","Certification gates","Human approval where needed"],
  },
  {
    id: "braid", label: "Braided\nTopology", icon: GitBranch, color: "#38bdf8", x: 20, y: 95,
    title: "Braided Topology",
    status: "Architecture Model", statusColor: "#38bdf8",
    desc: "Braided Topology is the architecture idea behind JGA/SB systems. Instead of one fragile straight line, the system uses multiple braided strands, pockets, checkpoints, and verification paths so the whole structure is stronger, more modular, and easier to recover.",
    points: ["Multiple support strands","Memory pockets","Verification zones","No unverified access to the Spine","Modular growth","Recovery paths"],
  },
  {
    id: "universe", label: "Braided\nUniverse", icon: Infinity, color: "rgba(201,168,76,0.6)", x: 80, y: 95,
    title: "Braided Topology and the Universe",
    status: "⚠ Theory-Inspired Visualization — Not Proven Physics", statusColor: "#fbbf24",
    desc: "This is a theory-inspired visualization that uses braids, pockets, loops, scales, and layers to help people imagine how complex systems can connect. It is presented as a metaphor and visual learning model, NOT proven physics.",
    disclaimer: true,
    points: ["Layered reality metaphor","Connection zones","Scale changes","Loops and pockets","Educational visualization only"],
  },
];

// SVG connector lines between nodes
const CONNECTIONS = [
  ["sb688","sb689"],["sb688","sbv3"],["sb688","sb700"],["sb688","sb712"],
  ["sb689","brick01"],["sbv3","sovereign"],["sb700","braid"],["sb712","universe"],
  ["brick01","braid"],["sovereign","universe"],
];

function NodeDot({ node, active, onClick }) {
  const Icon = node.icon;
  return (
    <button
      onClick={() => onClick(node)}
      style={{ position: "absolute", left: `${node.x}%`, top: `${node.y}%`, transform: "translate(-50%,-50%)" }}
      className="group flex flex-col items-center gap-1 z-10"
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ background: node.color, animationDuration: "2s" }} />
        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${active ? "scale-125" : "group-hover:scale-110"}`}
          style={{
            background: active ? `${node.color}22` : "rgba(0,0,0,0.8)",
            borderColor: node.color,
            boxShadow: `0 0 ${active ? 18 : 8}px ${node.color}66`,
          }}>
          <Icon style={{ color: node.color, width: 16, height: 16 }} />
        </div>
      </div>
      <span className="text-[9px] font-bold text-center leading-tight whitespace-pre-line"
        style={{ color: node.color, textShadow: `0 0 8px ${node.color}` }}>
        {node.label}
      </span>
    </button>
  );
}

function NodeModal({ node, onClose }) {
  if (!node) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}
      style={{ background: "rgba(0,0,0,0.85)" }}>
      <div className="relative max-w-lg w-full rounded-2xl border p-6 space-y-4 max-h-[85vh] overflow-y-auto"
        style={{ background: "hsl(220,18%,7%)", borderColor: `${node.color}40` }}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${node.color}12`, border: `1px solid ${node.color}30` }}>
            <node.icon style={{ color: node.color, width: 20, height: 20 }} />
          </div>
          <div>
            <h3 className="text-sm font-black font-cinzel" style={{ color: node.color }}>{node.title}</h3>
            <Badge className="mt-1 text-[8px] border font-bold"
              style={{ background: `${node.statusColor}12`, color: node.statusColor, borderColor: `${node.statusColor}30` }}>
              {node.status}
            </Badge>
          </div>
        </div>

        {node.disclaimer && (
          <div className="rounded-lg border px-3 py-2 text-[10px] text-yellow-300/80"
            style={{ background: "rgba(251,191,36,0.05)", borderColor: "rgba(251,191,36,0.25)" }}>
            ⚠ Theory-inspired visualization / metaphor for layered connection, verification zones, and system structure. <strong>Not presented as proven physics.</strong>
          </div>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed">{node.desc}</p>

        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: node.color }}>Key Points</div>
          <ul className="space-y-1.5">
            {node.points.map((p, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span style={{ color: node.color }}>◆</span> {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function SystemMap() {
  const [active, setActive] = useState(null);

  return (
    <section className="py-16 px-4" style={{ background: "hsl(220,20%,5%)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-[9px] tracking-[4px] uppercase font-mono mb-2" style={{ color: "rgba(201,168,76,0.4)" }}>Interactive</div>
          <h2 className="text-xl font-black font-cinzel" style={{ color: GOLD }}>System Map</h2>
          <p className="text-xs text-muted-foreground mt-1">Click any glowing node to learn more</p>
        </div>

        {/* Map container */}
        <div className="relative rounded-2xl border overflow-hidden"
          style={{ background: "rgba(0,0,0,0.6)", borderColor: "rgba(201,168,76,0.15)", paddingBottom: "110%", maxWidth: 600, margin: "0 auto" }}>

          {/* SVG connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 105" preserveAspectRatio="none">
            <defs>
              <linearGradient id="connGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={GOLD} stopOpacity="0.15" />
                <stop offset="100%" stopColor={GOLD} stopOpacity="0.05" />
              </linearGradient>
            </defs>
            {CONNECTIONS.map(([a, b], i) => {
              const na = NODES.find(n => n.id === a);
              const nb = NODES.find(n => n.id === b);
              if (!na || !nb) return null;
              return (
                <line key={i}
                  x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                  stroke={GOLD} strokeWidth="0.4" strokeOpacity="0.2"
                  strokeDasharray="2 4" />
              );
            })}
          </svg>

          {/* Nodes */}
          {NODES.map(n => (
            <NodeDot key={n.id} node={n} active={active?.id === n.id} onClick={setActive} />
          ))}

          {/* Center label */}
          <div className="absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}>
            <div className="text-center opacity-20">
              <div className="text-[8px] font-mono uppercase tracking-widest" style={{ color: GOLD }}>JGA</div>
              <div className="text-[8px] font-mono uppercase tracking-widest" style={{ color: GOLD }}>ECOSYSTEM</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-[9px]">
          {[
            { color: GOLD,       label: "Core Doctrine" },
            { color: "#60a5fa",  label: "Runtime / Watchdog" },
            { color: "#4ade80",  label: "Local Core" },
            { color: "#f472b6",  label: "Unified Runtime" },
            { color: "#fb923c",  label: "Modular Brick" },
            { color: "#fbbf24",  label: "Theory Visualization" },
          ].map((l, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              <span className="text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <NodeModal node={active} onClose={() => setActive(null)} />
    </section>
  );
}