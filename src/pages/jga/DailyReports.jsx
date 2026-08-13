/**
 * DailyReports.jsx — Wired to real /api/reports
 */
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/apiClient";

const GOLD = "#C9A84C";

export default function DailyReports() {
  const qc = useQueryClient();
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["dailyReports"],
    queryFn:  () => api.get("/api/reports"),
    refetchInterval: 60000,
  });

  const generateMutation = useMutation({
    mutationFn: () => api.post("/api/reports/generate"),
    onSuccess: (data) => { qc.invalidateQueries({ queryKey: ["dailyReports"] }); toast.success(`Report generated — ${data.date}`); },
    onError: err => toast.error(err.message),
  });

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold font-mono" style={{ color: GOLD }}>Daily Reports</h1>
          <p className="text-xs text-muted-foreground">Automated system snapshots with braid invariant records</p>
        </div>
        <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}
          className="text-xs font-bold font-mono"
          style={{ background: "rgba(201,168,76,0.12)", color: GOLD, border: "1px solid rgba(201,168,76,0.3)" }}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Generate Report
        </Button>
      </div>

      {isLoading && <p className="text-xs text-muted-foreground font-mono">Loading reports…</p>}

      <div className="space-y-3">
        {reports.map(r => (
          <div key={r.id} className="rounded-xl border border-border p-5 space-y-3" style={{ background: "hsl(220,18%,7%)" }}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold font-mono" style={{ color: GOLD }}>{r.report_date}</h3>
              <Badge className="text-[9px] font-mono border"
                style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", borderColor: "rgba(74,222,128,0.3)" }}>
                RECORDED
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Spine Health",   value: `${r.spine_health}%`,    color: r.spine_health >= 100 ? "#4ade80" : "#fbbf24" },
                { label: "Integrity",      value: `${r.integrity_pct}%`,   color: r.integrity_pct >= 100 ? "#4ade80" : "#fbbf24" },
                { label: "Active Nodes",   value: `${r.nodes_active}/${r.nodes_total}`, color: GOLD },
                { label: "Chain Blocks",   value: r.chain_length,           color: "#60a5fa" },
                { label: "Trusted Items",  value: r.trusted_states,         color: "#4ade80" },
                { label: "Rejected",       value: r.rejected_states,        color: "#f87171" },
                { label: "Recoveries",     value: r.recovery_count,         color: "#a78bfa" },
                { label: "tr₀.₃",          value: r.invariant?.trace03?.toFixed(4) ?? "—", color: "#94a3b8" },
              ].map(s => (
                <div key={s.label} className="rounded-lg border border-border/40 p-2" style={{ background: "hsl(220,20%,6%)" }}>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{s.label}</p>
                  <p className="text-sm font-bold font-mono mt-0.5" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            {r.summary && <p className="text-[10px] text-muted-foreground font-mono">{r.summary}</p>}
          </div>
        ))}
        {reports.length === 0 && !isLoading && (
          <p className="text-xs text-muted-foreground font-mono text-center py-8">No reports yet. Generate the first snapshot above.</p>
        )}
      </div>
    </div>
  );
}
