/**
 * VerificationGates.jsx — Wired to real /api/verification
 */
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Clock, Shield, AlertTriangle, Plus } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/apiClient";

const GOLD = "#C9A84C";
const STAGE_COLORS = {
  input: "#94a3b8", quarantine: "#f59e0b", verification: "#60a5fa", validation: "#a78bfa",
  certification: "#4ade80", trusted: GOLD, rejected: "#ef4444", rollback: "#f97316",
};

export default function VerificationGates() {
  const qc = useQueryClient();
  const [newData,   setNewData]   = useState("");
  const [riskScore, setRiskScore] = useState(0);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["stateItems"],
    queryFn:  () => api.get("/api/verification"),
    refetchInterval: 10000,
  });

  const createMutation = useMutation({
    mutationFn: () => api.post("/api/verification", { data: newData, source: "operator", risk_score: Number(riskScore) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stateItems"] }); setNewData(""); setRiskScore(0); toast.success("State item created"); },
    onError: err => toast.error(err.message),
  });

  const advanceMutation = useMutation({
    mutationFn: id => api.post(`/api/verification/${id}/advance`),
    onSuccess: r => { qc.invalidateQueries({ queryKey: ["stateItems"] }); toast.success(`→ ${r.nextStage}`); },
    onError: err => toast.error(err.message),
  });

  const rejectMutation = useMutation({
    mutationFn: id => api.post(`/api/verification/${id}/reject`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stateItems"] }); toast.info("Item rejected"); },
  });

  const trusted    = items.filter(i => i.current_stage === "trusted").length;
  const rejected   = items.filter(i => i.current_stage === "rejected").length;
  const quarantine = items.filter(i => i.current_stage === "quarantine").length;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold font-mono" style={{ color: GOLD }}>Verification Gates</h1>
        <p className="text-xs text-muted-foreground">Triple-mark pipeline — Structure · Policy · Braid topology</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Items",  value: items.length, color: "#60a5fa" },
          { label: "Trusted",      value: trusted,      color: "#4ade80" },
          { label: "Quarantined",  value: quarantine,   color: "#fbbf24" },
          { label: "Rejected",     value: rejected,     color: "#f87171" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border p-4" style={{ background: "hsl(220,18%,7%)" }}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</p>
            <p className="text-2xl font-bold font-mono mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Create Item */}
      <div className="rounded-xl border border-border p-5 space-y-3" style={{ background: "hsl(220,18%,7%)" }}>
        <h2 className="text-sm font-bold font-mono" style={{ color: GOLD }}>Inject State Item</h2>
        <div className="flex gap-2 flex-wrap">
          <Input placeholder="State data…" value={newData} onChange={e => setNewData(e.target.value)}
            className="flex-1 min-w-[200px] h-9 text-xs bg-secondary border-border font-mono" />
          <Input type="number" placeholder="Risk 0-100" value={riskScore} onChange={e => setRiskScore(e.target.value)}
            min={0} max={100} className="w-28 h-9 text-xs bg-secondary border-border font-mono" />
          <Button onClick={() => createMutation.mutate()} disabled={!newData || createMutation.isPending}
            className="h-9 text-xs font-bold font-mono"
            style={{ background: "rgba(201,168,76,0.12)", color: GOLD, border: "1px solid rgba(201,168,76,0.3)" }}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Inject
          </Button>
        </div>
      </div>

      {/* Items Pipeline */}
      {isLoading && <p className="text-xs text-muted-foreground font-mono">Loading pipeline…</p>}
      <div className="space-y-2">
        {items.map(item => {
          const stageColor = STAGE_COLORS[item.current_stage] || "#94a3b8";
          const errors = item.mark_errors || [];
          return (
            <div key={item.id} className="rounded-xl border border-border p-4 space-y-3" style={{ background: "hsl(220,18%,7%)" }}>
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="space-y-0.5 flex-1 min-w-0">
                  <p className="text-xs font-mono truncate">{item.data}</p>
                  <p className="text-[9px] text-muted-foreground font-mono">
                    risk={item.risk_score} · src={item.source} · blocks={item.braid_chain?.length ?? 0}
                  </p>
                </div>
                <Badge className="text-[9px] font-mono border flex-shrink-0"
                  style={{ background: `${stageColor}18`, color: stageColor, borderColor: `${stageColor}30` }}>
                  {item.current_stage?.toUpperCase()}
                </Badge>
              </div>

              {/* Mark results */}
              {item.marks_passed && item.marks_passed.length > 0 && (
                <div className="flex gap-2">
                  {item.marks_passed.map((m, i) => (
                    <div key={i} className="flex items-center gap-1 text-[9px] font-mono"
                      style={{ color: m.passed ? "#4ade80" : "#f87171" }}>
                      {m.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      M{m.mark}
                    </div>
                  ))}
                </div>
              )}

              {errors.length > 0 && (
                <div className="text-[9px] text-red-400 font-mono space-y-0.5">
                  {errors.slice(0, 3).map((e, i) => <p key={i}>⚠ {e}</p>)}
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" disabled={["trusted","rejected"].includes(item.current_stage) || advanceMutation.isPending}
                  className="h-7 text-[10px] font-mono"
                  style={{ background: "rgba(74,222,128,0.08)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}
                  onClick={() => advanceMutation.mutate(item.id)}>
                  Advance →
                </Button>
                <Button size="sm" disabled={item.current_stage === "rejected" || rejectMutation.isPending}
                  className="h-7 text-[10px] font-mono"
                  style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
                  onClick={() => rejectMutation.mutate(item.id)}>
                  Reject ✕
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
