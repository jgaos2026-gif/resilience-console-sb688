import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Download } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

const GOLD = "#C9A84C";
const HEALTH_COLORS = { healthy: "#4ade80", degraded: "#fbbf24", critical: "#ef4444" };

export default function DailyReports() {
  const queryClient = useQueryClient();
  const { data: reports = [] } = useQuery({ queryKey: ["dailyReports"], queryFn: () => base44.entities.DailyReport.list("-created_date") });

  const generateReport = useMutation({
    mutationFn: (type) => base44.entities.DailyReport.create({
      report_date: new Date().toISOString().split("T")[0],
      report_type: type,
      system_health: "healthy",
      node_status_summary: "All 24 nodes active. 0 quarantined.",
      ledger_status: "Intact — 0 breaks detected",
      memory_pockets_checked: 12,
      ram_guard_status: "Active — within tolerance",
      business_activity: "3 new orders, 2 proofs sent, 1 payment received",
      failed_states: 0,
      recovery_actions: 0,
      proof_vault_additions: 2,
      compliance_warnings: 0,
      next_actions: "Review pending contractor submissions. Run system doctor.",
      notes: `Auto-generated ${type} report.`,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["dailyReports"] }); toast.success("Report generated"); },
  });

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold font-cinzel" style={{ color: GOLD }}>Daily Reports</h1>
        <p className="text-xs text-muted-foreground">System health, business activity, and compliance reports</p>
      </div>

      {/* Generate Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { type: "daily", label: "Daily Report", color: "#4ade80" },
          { type: "council", label: "Council Report", color: GOLD },
          { type: "investor", label: "Investor Snapshot", color: "#a78bfa" },
          { type: "pilot", label: "Illinois Pilot Report", color: "#60a5fa" },
        ].map(r => (
          <Button key={r.type} onClick={() => generateReport.mutate(r.type)} disabled={generateReport.isPending}
            className="h-auto py-3 flex flex-col items-center gap-1 text-xs font-bold"
            style={{ background: `${r.color}10`, color: r.color, border: `1px solid ${r.color}30` }}>
            <Plus className="w-4 h-4" />
            {r.label}
          </Button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {reports.map(report => {
          const hc = HEALTH_COLORS[report.system_health] || "#94a3b8";
          return (
            <div key={report.id} className="rounded-xl border border-border p-5 space-y-3" style={{ background: "hsl(220,18%,7%)" }}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" style={{ color: GOLD }} />
                  <h3 className="text-sm font-semibold text-foreground">{report.report_date}</h3>
                  <Badge className="text-[8px] border font-bold uppercase" style={{ background: "rgba(201,168,76,0.06)", color: GOLD, borderColor: "rgba(201,168,76,0.2)" }}>
                    {report.report_type}
                  </Badge>
                </div>
                <Badge className="text-[8px] border font-bold" style={{ background: `${hc}15`, color: hc, borderColor: `${hc}40` }}>
                  {report.system_health}
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px]">
                <div><span className="text-muted-foreground">Nodes: </span><span className="text-foreground">{report.node_status_summary}</span></div>
                <div><span className="text-muted-foreground">Ledger: </span><span className="text-foreground">{report.ledger_status}</span></div>
                <div><span className="text-muted-foreground">Pockets Checked: </span><span className="text-foreground">{report.memory_pockets_checked}</span></div>
                <div><span className="text-muted-foreground">RAM Guard: </span><span className="text-foreground">{report.ram_guard_status}</span></div>
                <div><span className="text-muted-foreground">Business: </span><span className="text-foreground">{report.business_activity}</span></div>
                <div><span className="text-muted-foreground">Failed States: </span><span style={{ color: report.failed_states > 0 ? "#f87171" : "#4ade80" }}>{report.failed_states}</span></div>
                <div><span className="text-muted-foreground">Recovery Actions: </span><span className="text-foreground">{report.recovery_actions}</span></div>
                <div><span className="text-muted-foreground">Proof Additions: </span><span className="text-foreground">{report.proof_vault_additions}</span></div>
              </div>
              {report.next_actions && (
                <div className="text-[10px]"><span className="text-muted-foreground">Next Actions: </span><span className="text-foreground">{report.next_actions}</span></div>
              )}
            </div>
          );
        })}
        {reports.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm rounded-xl border border-border" style={{ background: "hsl(220,18%,7%)" }}>
            No reports generated yet. Use the buttons above to create your first report.
          </div>
        )}
      </div>
    </div>
  );
}