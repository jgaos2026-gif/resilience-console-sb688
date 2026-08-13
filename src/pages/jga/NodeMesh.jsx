/**
 * NodeMesh.jsx — Wired to real /api/nodes
 */
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, Search, Shield, Lock, AlertTriangle, Database, Cpu } from "lucide-react";
import api from "@/api/apiClient";

const GOLD = "#C9A84C";
const STATUS_COLORS = {
  active:      { bg: "rgba(34,197,94,0.1)",   color: "#4ade80", border: "rgba(34,197,94,0.3)" },
  warning:     { bg: "rgba(251,191,36,0.1)",  color: "#fbbf24", border: "rgba(251,191,36,0.3)" },
  quarantined: { bg: "rgba(239,68,68,0.1)",   color: "#f87171", border: "rgba(239,68,68,0.3)" },
  critical:    { bg: "rgba(239,68,68,0.1)",   color: "#f87171", border: "rgba(239,68,68,0.3)" },
  sleeping:    { bg: "rgba(148,163,184,0.1)", color: "#94a3b8", border: "rgba(148,163,184,0.3)" },
  repairing:   { bg: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "rgba(167,139,250,0.3)" },
};

export default function NodeMesh() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [pulse, setPulse] = useState(true);

  const { data: nodes = [], isLoading } = useQuery({
    queryKey: ["nodes"],
    queryFn:  () => api.get("/api/nodes"),
    refetchInterval: 15000,
  });

  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 1500);
    return () => clearInterval(t);
  }, []);

  const appendMutation = useMutation({
    mutationFn: ({ id }) => api.post(`/api/nodes/${id}/append`, { data: `HEARTBEAT:${Date.now()}` }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nodes"] }),
  });

  const cats = ["all", ...new Set(nodes.map(n => n.category).filter(Boolean))];
  const filtered = nodes.filter(n => {
    if (catFilter !== "all" && n.category !== catFilter) return false;
    if (search && !n.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold font-mono" style={{ color: GOLD }}>Node Mesh</h1>
          <p className="text-xs text-muted-foreground">{nodes.length} nodes · Heartbeat {pulse ? "●" : "○"}</p>
        </div>
        <Badge className="text-[10px] border font-bold font-mono flex items-center gap-1.5"
          style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80", borderColor: "rgba(34,197,94,0.3)" }}>
          <span className={`w-2 h-2 rounded-full bg-green-400 ${pulse ? "animate-pulse" : ""}`} />
          MESH ACTIVE
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search nodes…" value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-secondary border-border font-mono" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {cats.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono uppercase border transition-all"
              style={catFilter === c
                ? { background: "rgba(201,168,76,0.15)", color: GOLD, borderColor: "rgba(201,168,76,0.4)" }
                : { background: "transparent", color: "rgba(232,217,176,0.4)", borderColor: "rgba(232,217,176,0.1)" }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Node Grid */}
      {isLoading && <p className="text-xs text-muted-foreground font-mono">Loading live node data…</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(n => {
          const sc = STATUS_COLORS[n.status] || STATUS_COLORS.sleeping;
          return (
            <div key={n.id} className="rounded-xl border p-4 space-y-3"
              style={{ background: "hsl(220,18%,7%)", borderColor: sc.border }}>
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold font-mono">{n.name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{n.category}</p>
                </div>
                <Badge className="text-[9px] font-mono border flex-shrink-0"
                  style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>
                  {n.status?.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border/40 p-2 space-y-0.5" style={{ background: "hsl(220,20%,6%)" }}>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Blocks</p>
                  <p className="text-sm font-bold font-mono" style={{ color: GOLD }}>{n.chainLength ?? "—"}</p>
                </div>
                <div className="rounded-lg border border-border/40 p-2 space-y-0.5" style={{ background: "hsl(220,20%,6%)" }}>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Integrity</p>
                  <p className="text-sm font-bold font-mono" style={{ color: n.integrityPct >= 100 ? "#4ade80" : "#fbbf24" }}>
                    {n.integrityPct != null ? `${n.integrityPct}%` : "—"}
                  </p>
                </div>
              </div>

              {n.invariant && (
                <p className="text-[9px] font-mono text-muted-foreground">
                  tr₀.₃={n.invariant.trace03?.toFixed(3)} · tr₀.₇={n.invariant.trace07?.toFixed(3)}
                </p>
              )}

              <Button size="sm" disabled={appendMutation.isPending}
                className="w-full text-[10px] h-7 font-mono"
                style={{ background: "rgba(201,168,76,0.08)", color: GOLD, border: "1px solid rgba(201,168,76,0.2)" }}
                onClick={() => appendMutation.mutate({ id: n.id })}>
                ↯ Heartbeat
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
