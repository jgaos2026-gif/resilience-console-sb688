import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Activity, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

const GOLD = "#C9A84C";
const STATUS_COLORS = {
  active: { bg: "rgba(34,197,94,0.1)", color: "#4ade80", border: "rgba(34,197,94,0.3)" },
  warning: { bg: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "rgba(251,191,36,0.3)" },
  quarantined: { bg: "rgba(239,68,68,0.1)", color: "#f87171", border: "rgba(239,68,68,0.3)" },
  sleeping: { bg: "rgba(148,163,184,0.1)", color: "#94a3b8", border: "rgba(148,163,184,0.3)" },
  repairing: { bg: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "rgba(167,139,250,0.3)" },
};
const CATEGORIES = ["all", "security", "business", "memory", "recovery", "compliance", "demo"];

export default function NodeMesh() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [pulse, setPulse] = useState(true);

  const { data: nodes = [] } = useQuery({
    queryKey: ["nodes"],
    queryFn: () => base44.entities.Node.list(),
  });

  // Heartbeat animation
  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 1500);
    return () => clearInterval(t);
  }, []);

  const filtered = nodes.filter(n => {
    if (filter !== "all" && n.category !== filter) return false;
    if (search && !n.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold font-cinzel" style={{ color: GOLD }}>Node Mesh</h1>
          <p className="text-xs text-muted-foreground">{nodes.length} nodes · System heartbeat {pulse ? "●" : "○"}</p>
        </div>
        <Badge className="text-[10px] border font-bold flex items-center gap-1.5"
          style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80", borderColor: "rgba(34,197,94,0.3)" }}>
          <span className={`w-2 h-2 rounded-full bg-green-400 ${pulse ? "animate-pulse" : ""}`} />
          MESH ACTIVE
        </Badge>
      </div>

      {/* Heartbeat Rhythm */}
      <div className="rounded-xl border border-border p-4 flex items-center gap-3 overflow-hidden" style={{ background: "hsl(220,18%,7%)" }}>
        <Activity className="w-5 h-5 flex-shrink-0" style={{ color: GOLD }} />
        <div className="flex gap-1 flex-1 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-1.5 rounded-full transition-all duration-700"
              style={{
                height: `${Math.sin((i + (pulse ? 5 : 0)) * 0.5) * 12 + 16}px`,
                background: i % 5 === 0 ? GOLD : "rgba(201,168,76,0.3)",
                opacity: pulse ? 1 : 0.5
              }} />
          ))}
        </div>
        <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0">Heartbeat Rhythm</span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search nodes..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-secondary border-border" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className="px-3 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all"
              style={filter === c ? { background: "rgba(201,168,76,0.15)", color: GOLD } : { color: "rgba(255,255,255,0.35)" }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Node Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(node => {
          const sc = STATUS_COLORS[node.status] || STATUS_COLORS.active;
          return (
            <div key={node.id} className="rounded-xl border p-4 space-y-2.5 hover:border-primary/30 transition-all"
              style={{ background: "hsl(220,18%,7%)", borderColor: "rgba(201,168,76,0.1)" }}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">{node.name}</h3>
                <Badge className="text-[8px] border font-bold uppercase" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>
                  {node.status}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">{node.purpose}</p>
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-muted-foreground">Trust: <span className="font-bold" style={{ color: node.trust_level >= 80 ? "#4ade80" : "#fbbf24" }}>{node.trust_level}%</span></span>
                <span className="text-muted-foreground">{node.connected_module}</span>
              </div>
              {node.recent_log && (
                <div className="text-[9px] font-mono px-2 py-1 rounded" style={{ background: "rgba(0,0,0,0.3)", color: "rgba(201,168,76,0.5)" }}>
                  {node.recent_log}
                </div>
              )}
              <div className="flex items-center justify-between">
                <Badge className="text-[8px] border" style={{ background: "rgba(201,168,76,0.06)", color: "rgba(201,168,76,0.5)", borderColor: "rgba(201,168,76,0.15)" }}>
                  {node.node_type?.replace(/_/g, " ")}
                </Badge>
                <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <span className={`w-1.5 h-1.5 rounded-full ${node.status === "active" ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`} />
                  {node.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No nodes found. {nodes.length === 0 ? "Seed data to populate the mesh." : "Try adjusting filters."}
        </div>
      )}
    </div>
  );
}