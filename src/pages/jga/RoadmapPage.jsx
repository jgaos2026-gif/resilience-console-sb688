import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Map, CheckCircle2, Clock, Circle, Star } from "lucide-react";

const GOLD = "#C9A84C";
const PHASES = [
  {
    id: "phase_1", label: "Phase 1", subtitle: "Illinois Pilot", color: "#4ade80",
    items: [
      { title: "Local demo council", status: "completed", cat: "business" },
      { title: "Illinois-only pilot", status: "in_progress", cat: "expansion" },
      { title: "JGA design intake", status: "completed", cat: "business" },
      { title: "Client portal", status: "completed", cat: "business" },
      { title: "Contractor portal", status: "completed", cat: "business" },
      { title: "Proof vault", status: "completed", cat: "technical" },
      { title: "Daily reports", status: "completed", cat: "compliance" },
    ],
  },
  {
    id: "phase_2", label: "Phase 2", subtitle: "Five-State Expansion", color: "#60a5fa",
    items: [
      { title: "Five-state expansion", status: "planned", cat: "expansion" },
      { title: "More contractor routing", status: "planned", cat: "business" },
      { title: "Better quote engine", status: "planned", cat: "business" },
      { title: "More automated proof reports", status: "planned", cat: "technical" },
    ],
  },
  {
    id: "phase_3", label: "Phase 3", subtitle: "Fifteen-State Expansion", color: "#a78bfa",
    items: [
      { title: "Fifteen-state expansion", status: "future", cat: "expansion" },
      { title: "Multi-state tax/compliance review", status: "future", cat: "compliance" },
      { title: "Advanced business analytics", status: "future", cat: "technical" },
    ],
  },
  {
    id: "phase_4", label: "Phase 4", subtitle: "National Scale", color: GOLD,
    items: [
      { title: "All 50 states", status: "future", cat: "expansion" },
      { title: "Full JGA Enterprise OS", status: "future", cat: "business" },
      { title: "AVA / VERA assistant integration", status: "future", cat: "technical" },
      { title: "Deeper reporting and automation", status: "future", cat: "technical" },
    ],
  },
];

const TECH_ROADMAP = [
  "Supabase integration", "Email integration", "Payment integration", "File storage",
  "Auth roles", "Real audit logs", "Desktop agent bridge", "Local watchdog bridge", "Optional PowerShell launcher bridge",
];

const STATUS_ICONS = { completed: CheckCircle2, in_progress: Clock, planned: Circle, future: Star };
const STATUS_COLORS = { completed: "#4ade80", in_progress: "#fbbf24", planned: "#94a3b8", future: "rgba(201,168,76,0.4)" };

export default function RoadmapPage() {
  const [selectedPhase, setSelectedPhase] = useState("all");

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold font-cinzel" style={{ color: GOLD }}>Roadmap</h1>
        <p className="text-xs text-muted-foreground">Staged rollout from Illinois pilot to national scale</p>
      </div>

      {/* Phase filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setSelectedPhase("all")} className="px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all"
          style={selectedPhase === "all" ? { background: "rgba(201,168,76,0.15)", color: GOLD } : { color: "rgba(255,255,255,0.35)" }}>All Phases</button>
        {PHASES.map(p => (
          <button key={p.id} onClick={() => setSelectedPhase(p.id)} className="px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all"
            style={selectedPhase === p.id ? { background: `${p.color}20`, color: p.color } : { color: "rgba(255,255,255,0.35)" }}>{p.label}</button>
        ))}
      </div>

      {/* Phases */}
      <div className="space-y-4">
        {PHASES.filter(p => selectedPhase === "all" || selectedPhase === p.id).map(phase => (
          <div key={phase.id} className="rounded-xl border border-border p-5 space-y-4" style={{ background: "hsl(220,18%,7%)" }}>
            <div className="flex items-center gap-3">
              <div className="w-3 h-10 rounded-full" style={{ background: phase.color }} />
              <div>
                <h2 className="text-sm font-bold font-cinzel" style={{ color: phase.color }}>{phase.label}</h2>
                <p className="text-[10px] text-muted-foreground">{phase.subtitle}</p>
              </div>
            </div>
            <div className="space-y-2 pl-6">
              {phase.items.map((item, i) => {
                const Icon = STATUS_ICONS[item.status];
                const sc = STATUS_COLORS[item.status];
                return (
                  <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border/20 last:border-0">
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: sc }} />
                    <span className="text-xs text-foreground flex-1">{item.title}</span>
                    <Badge className="text-[8px] border" style={{ background: `${sc}10`, color: sc, borderColor: `${sc}30` }}>
                      {item.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Technical Roadmap */}
      <div className="rounded-xl border border-border p-6 space-y-4" style={{ background: "hsl(220,18%,7%)" }}>
        <h2 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Technical Roadmap</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TECH_ROADMAP.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] py-1.5">
              <Circle className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}