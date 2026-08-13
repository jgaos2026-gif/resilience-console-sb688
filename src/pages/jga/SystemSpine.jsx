/**
 * SystemSpine.jsx — Wired to real /api/spine
 */
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Lock, CheckCircle2, AlertTriangle, Database, Activity, Eye, RotateCcw, Zap } from "lucide-react";
import api from "@/api/apiClient";

const GOLD = "#C9A84C";

const RULES = [
  "Nothing touches the Spine directly.",
  "All active states enter quarantine first.",
  "Triple verification required before trust.",
  "Failed states roll back to checkpoint.",
  "Logs are append-only — no deletions.",
  "Proof is generated daily.",
];

function StrandRow({ s }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="font-mono text-[10px] w-8 text-muted-foreground">{s.label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (s.crossings || 0) * 5)}%`, background: GOLD, opacity: 0.75 }} />
      </div>
      <span className="font-mono text-[10px] w-6 text-right text-muted-foreground">{s.crossings}</span>
      <span className="text-[9px] text-muted-foreground">{s.positiveRate >= 0 ? `${(s.positiveRate * 100).toFixed(0)}%+` : ""}</span>
    </div>
  );
}

export default function SystemSpine() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["spine"],
    queryFn:  () => api.get("/api/spine"),
    refetchInterval: 15000,
  });

  const appendMutation = useMutation({
    mutationFn: ({ nodeId, eventData }) => api.post(`/api/nodes/${nodeId}/append`, { data: eventData }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["spine"] }),
  });

  const nodes  = data?.nodes  || [];
  const events = data?.events || [];

  const totalBlocks = nodes.reduce((s, n) => s + (n.chainLength || 0), 0);
  const avgIntegrity = nodes.length > 0
    ? (nodes.reduce((s, n) => s + (n.integrityPct || 0), 0) / nodes.length).toFixed(2)
    : "—";
  const allValid = nodes.every(n => n.valid);
  const activeCount = nodes.filter(n => n.status === "active").length;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-border p-6 text-center space-y-3"
        style={{ background: "linear-gradient(135deg, hsl(220,22%,5%) 0%, hsl(220,18%,8%) 100%)" }}>
        <Badge className="text-[10px] px-3 py-1 font-bold border"
          style={{ background: "rgba(201,168,76,0.1)", color: GOLD, borderColor: "rgba(201,168,76,0.3)" }}>
          PROTECTED CORE
        </Badge>
        <h1 className="text-2xl font-bold font-mono gold-shimmer">THE SPINE</h1>
        <p className="text-xs text-muted-foreground max-w-xl mx-auto">
          Braid group B₇ hash-chain integrity. All state transitions encoded as crossing events σᵢ^±1.
          Alexander polynomial invariants detect tampered topology.
        </p>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Spine Health",    value: isLoading ? "—" : (activeCount === nodes.length && nodes.length > 0 ? "100%" : `${((activeCount/Math.max(nodes.length,1))*100).toFixed(0)}%`), color: "#4ade80", icon: Activity },
          { label: "Protected Nodes", value: isLoading ? "—" : nodes.length,                                                                    color: GOLD,       icon: Shield },
          { label: "Chain Blocks",    value: isLoading ? "—" : totalBlocks,                                                                      color: "#60a5fa",  icon: Database },
          { label: "Avg Integrity",   value: isLoading ? "—" : `${avgIntegrity}%`,                                                              color: allValid ? "#4ade80" : "#fbbf24", icon: Lock },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="rounded-xl border border-border p-4 space-y-2" style={{ background: "hsl(220,18%,7%)" }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</span>
                <Icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <div className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Spine Rules */}
      <div className="rounded-xl border border-border p-5 space-y-3" style={{ background: "hsl(220,18%,7%)" }}>
        <h2 className="text-sm font-bold font-mono" style={{ color: GOLD }}>Spine Protection Rules</h2>
        {RULES.map((rule, i) => (
          <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border/30 last:border-0">
            <Shield className="w-4 h-4 flex-shrink-0" style={{ color: GOLD }} />
            <span className="text-xs text-foreground">{rule}</span>
          </div>
        ))}
      </div>

      {/* Node Braid Status */}
      <div className="rounded-xl border border-border p-5 space-y-4" style={{ background: "hsl(220,18%,7%)" }}>
        <h2 className="text-sm font-bold font-mono" style={{ color: GOLD }}>Node Braid Integrity</h2>
        {isLoading && <p className="text-xs text-muted-foreground">Loading live data…</p>}
        <div className="space-y-3">
          {nodes.map(n => (
            <div key={n.id} className="rounded-lg border border-border/50 p-3 space-y-2" style={{ background: "hsl(220,20%,6%)" }}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold font-mono">{n.name}</span>
                <div className="flex items-center gap-2">
                  <Badge className="text-[9px] font-mono border" style={{
                    background: n.valid ? "rgba(74,222,128,0.1)" : "rgba(239,68,68,0.1)",
                    color: n.valid ? "#4ade80" : "#f87171",
                    borderColor: n.valid ? "rgba(74,222,128,0.3)" : "rgba(239,68,68,0.3)",
                  }}>
                    {n.valid ? "VALID" : "COMPROMISED"}
                  </Badge>
                  <span className="text-[9px] text-muted-foreground font-mono">{n.chainLength} blocks</span>
                  <span className="text-[9px] font-mono" style={{ color: n.integrityPct >= 100 ? "#4ade80" : "#fbbf24" }}>
                    {n.integrityPct}%
                  </span>
                </div>
              </div>
              {n.invariant && (
                <div className="text-[9px] font-mono text-muted-foreground">
                  Alexander tr(0.3)={n.invariant.trace03?.toFixed(4)} tr(0.7)={n.invariant.trace07?.toFixed(4)}
                </div>
              )}
              {n.strands && n.strands.length > 0 && (
                <div className="space-y-1">
                  {n.strands.map(s => <StrandRow key={s.strand} s={s} />)}
                </div>
              )}
              <Button
                size="sm"
                disabled={appendMutation.isPending}
                className="text-[10px] h-7 font-mono"
                style={{ background: "rgba(201,168,76,0.08)", color: GOLD, border: "1px solid rgba(201,168,76,0.2)" }}
                onClick={() => appendMutation.mutate({ nodeId: n.id, eventData: `MANUAL_CHECKPOINT:${n.name}:${Date.now()}` })}
              >
                <Zap className="w-3 h-3 mr-1" /> Append Checkpoint
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Spine Events */}
      {events.length > 0 && (
        <div className="rounded-xl border border-border p-5 space-y-3" style={{ background: "hsl(220,18%,7%)" }}>
          <h2 className="text-sm font-bold font-mono" style={{ color: GOLD }}>Recent Spine Events</h2>
          <div className="space-y-1.5">
            {events.slice(0, 10).map(e => (
              <div key={e.id} className="flex items-center gap-3 text-[10px] font-mono py-1 border-b border-border/20 last:border-0">
                <span className="text-muted-foreground w-20 flex-shrink-0">{e.created_at?.slice(0, 19)}</span>
                <span style={{ color: GOLD }}>{e.event_type}</span>
                <span className="text-muted-foreground truncate">{typeof e.data === "string" ? e.data : JSON.stringify(e.data).slice(0, 80)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
