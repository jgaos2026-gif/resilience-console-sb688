import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Upload, FileText, Shield } from "lucide-react";

const GOLD = "#C9A84C";
const STATUS_COLORS = {
  assigned: "#f59e0b", accepted: "#60a5fa", draft_uploaded: "#a78bfa",
  revision: "#fbbf24", final_submitted: "#22c55e", approved: "#4ade80", paid_out: GOLD, cancelled: "#ef4444",
};

export default function ContractorPortal() {
  const queryClient = useQueryClient();
  const { data: assignments = [] } = useQuery({ queryKey: ["contractorAssignments"], queryFn: () => base44.entities.ContractorAssignment.list() });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ContractorAssignment.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contractorAssignments"] }),
  });

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold font-cinzel" style={{ color: GOLD }}>Contractor Portal</h1>
        <p className="text-xs text-muted-foreground">View assignments, upload work, track payouts</p>
      </div>

      {/* Verification Notice */}
      <div className="rounded-xl border p-4 flex items-start gap-3" style={{ background: "rgba(201,168,76,0.04)", borderColor: "rgba(201,168,76,0.15)" }}>
        <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: GOLD }} />
        <div className="text-[10px] text-muted-foreground space-y-1">
          <p className="font-semibold" style={{ color: GOLD }}>Contractor Upload Verification</p>
          <p>All uploaded files enter quarantine → file check → watermark application → client proof view. Final files released only after client payment. Contractor payouts processed after client approval.</p>
        </div>
      </div>

      {/* Assignments */}
      <div className="space-y-3">
        {assignments.map(a => {
          const sc = STATUS_COLORS[a.status] || "#94a3b8";
          return (
            <div key={a.id} className="rounded-xl border border-border p-5 space-y-3" style={{ background: "hsl(220,18%,7%)" }}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{a.order_title}</h3>
                  <p className="text-[10px] text-muted-foreground">Assigned to: {a.contractor_name}</p>
                </div>
                <Badge className="text-[8px] border font-bold uppercase" style={{ background: `${sc}15`, color: sc, borderColor: `${sc}40` }}>
                  {a.status?.replace(/_/g, " ")}
                </Badge>
              </div>
              {a.client_brief && (
                <div className="text-[10px] text-muted-foreground rounded-lg p-3" style={{ background: "rgba(0,0,0,0.2)" }}>
                  <span className="font-semibold text-foreground">Brief: </span>{a.client_brief}
                </div>
              )}
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Deadline: <span className="text-foreground">{a.deadline || "—"}</span></span>
                <span className="text-muted-foreground">Payout: <span className="font-mono" style={{ color: "#4ade80" }}>${a.payout_estimate?.toLocaleString() || "—"}</span></span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {a.status === "assigned" && (
                  <Button size="sm" className="text-[9px] h-7 px-3 font-bold" style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.3)" }}
                    onClick={() => updateMutation.mutate({ id: a.id, data: { status: "accepted" } })}>Accept Job</Button>
                )}
                {a.status === "accepted" && (
                  <Button size="sm" className="text-[9px] h-7 px-3 font-bold" style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.3)" }}
                    onClick={() => updateMutation.mutate({ id: a.id, data: { status: "draft_uploaded" } })}>
                    <Upload className="w-3 h-3 mr-1" /> Upload Draft
                  </Button>
                )}
                {a.status === "draft_uploaded" && (
                  <Button size="sm" className="text-[9px] h-7 px-3 font-bold" style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}
                    onClick={() => updateMutation.mutate({ id: a.id, data: { status: "final_submitted" } })}>Submit Final</Button>
                )}
                {a.status === "revision" && (
                  <Button size="sm" className="text-[9px] h-7 px-3 font-bold" style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}
                    onClick={() => updateMutation.mutate({ id: a.id, data: { status: "draft_uploaded" } })}>Upload Revision</Button>
                )}
              </div>
            </div>
          );
        })}
        {assignments.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm rounded-xl border border-border" style={{ background: "hsl(220,18%,7%)" }}>
            No assignments. Seed data to populate contractor jobs.
          </div>
        )}
      </div>
    </div>
  );
}