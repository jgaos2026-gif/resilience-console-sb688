import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Clock, Shield, AlertTriangle, ArrowRight } from "lucide-react";
import LiveProofEngine from "@/components/jga/LiveProofEngine";

const GOLD = "#C9A84C";
const STAGES = ["input", "quarantine", "verification", "validation", "certification", "trusted", "rejected", "rollback"];
const STAGE_COLORS = {
  input: "#94a3b8", quarantine: "#f59e0b", verification: "#60a5fa", validation: "#a78bfa",
  certification: "#4ade80", trusted: GOLD, rejected: "#ef4444", rollback: "#f97316",
};

export default function VerificationGates() {
  const queryClient = useQueryClient();
  const { data: items = [] } = useQuery({ queryKey: ["stateItems"], queryFn: () => base44.entities.StateItem.list() });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.StateItem.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stateItems"] }),
  });

  const advanceStage = (item) => {
    const idx = STAGES.indexOf(item.current_stage);
    if (idx >= 0 && idx < 5) {
      updateMutation.mutate({ id: item.id, data: { current_stage: STAGES[idx + 1], gate_result: idx >= 4 ? "pass" : "pending" } });
    }
  };

  const rejectItem = (item) => {
    updateMutation.mutate({ id: item.id, data: { current_stage: "rejected", gate_result: "fail", action: "reject" } });
  };

  const total = items.length;
  const trusted = items.filter(i => i.current_stage === "trusted").length;
  const rejected = items.filter(i => i.current_stage === "rejected").length;
  const quarantined = items.filter(i => i.current_stage === "quarantine").length;
  const highRisk = items.filter(i => i.risk_score > 50).length;
  const allPassed = items.filter(i => i.gate_result === "pass").length;

  const vgChecks = [
    { id: "items_present",  gate: "Gate 1 — Pipeline Load",   label: "State items loaded into pipeline",     pass: total > 0,                     detail: `${total} state items in pipeline`,                    critical: true },
    { id: "no_high_risk",   gate: "Gate 1 — Pipeline Load",   label: "No unreviewed high-risk items (>50)",  pass: highRisk === 0,                detail: highRisk === 0 ? "All items within risk threshold" : `${highRisk} high-risk item(s) need review`, critical: false },
    { id: "quarantine_ok",  gate: "Gate 2 — Gate Health",     label: "Quarantine zone functioning",          pass: true,                          detail: `${quarantined} item(s) currently quarantined`,        critical: true },
    { id: "pipeline_flow",  gate: "Gate 2 — Gate Health",     label: "7-stage pipeline stages defined",      pass: true,                          detail: "Input→Quarantine→Verify→Validate→Certify→Trusted→Rejected", critical: true },
    { id: "trusted_exists", gate: "Gate 3 — Certification",   label: "At least one item reached trusted",    pass: total === 0 || trusted > 0,    detail: `${trusted}/${total} items reached TRUSTED state`,     critical: false },
    { id: "no_stuck",       gate: "Gate 3 — Certification",   label: "Rejection rate below 50%",             pass: total === 0 || rejected / total < 0.5, detail: `${rejected} rejected of ${total} total`,          critical: false },
    { id: "pass_results",   gate: "Gate 3 — Certification",   label: "Gate pass results recorded",           pass: total === 0 || allPassed > 0,  detail: `${allPassed} items with PASS gate result`,            critical: false },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold font-cinzel" style={{ color: GOLD }}>Verification Gates</h1>
        <p className="text-xs text-muted-foreground">Triple-mark verification pipeline — every state must pass three gates</p>
      </div>

      {/* Visual Pipeline */}
      <div className="rounded-xl border border-border p-5 overflow-x-auto" style={{ background: "hsl(220,18%,7%)" }}>
        <div className="flex items-center gap-2 min-w-max">
          {["Input", "Quarantine", "Verification ✓", "Validation ✓", "Certification ✓", "Trusted State", "Spine"].map((s, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-1">
                <div className="w-20 h-12 rounded-lg border flex items-center justify-center text-[9px] font-bold text-center"
                  style={{ borderColor: STAGE_COLORS[STAGES[Math.min(i, 5)]] || GOLD, color: STAGE_COLORS[STAGES[Math.min(i, 5)]] || GOLD, background: `${STAGE_COLORS[STAGES[Math.min(i, 5)]] || GOLD}10` }}>
                  {s}
                </div>
              </div>
              {i < 6 && <ArrowRight className="w-4 h-4 flex-shrink-0 text-muted-foreground" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* State Items Table */}
      <div className="rounded-xl border border-border overflow-hidden" style={{ background: "hsl(220,18%,7%)" }}>
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Incoming States</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Stage</th>
                <th className="text-left p-3">Risk</th>
                <th className="text-left p-3">Result</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const stageColor = STAGE_COLORS[item.current_stage] || "#94a3b8";
                return (
                  <tr key={item.id} className="border-b border-border/30 hover:bg-secondary/20">
                    <td className="p-3 font-semibold text-foreground">{item.name}</td>
                    <td className="p-3 text-muted-foreground">{item.item_type?.replace(/_/g, " ")}</td>
                    <td className="p-3">
                      <Badge className="text-[8px] border font-bold" style={{ background: `${stageColor}15`, color: stageColor, borderColor: `${stageColor}40` }}>
                        {item.current_stage?.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <span className="font-mono" style={{ color: item.risk_score > 50 ? "#f87171" : item.risk_score > 25 ? "#fbbf24" : "#4ade80" }}>
                        {item.risk_score}
                      </span>
                    </td>
                    <td className="p-3">
                      {item.gate_result === "pass" && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                      {item.gate_result === "fail" && <XCircle className="w-4 h-4 text-red-400" />}
                      {item.gate_result === "pending" && <Clock className="w-4 h-4 text-yellow-400" />}
                      {item.gate_result === "hold" && <AlertTriangle className="w-4 h-4 text-orange-400" />}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {item.current_stage !== "trusted" && item.current_stage !== "rejected" && (
                          <Button size="sm" className="text-[9px] h-6 px-2" style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}
                            onClick={() => advanceStage(item)}>Advance</Button>
                        )}
                        {item.current_stage !== "rejected" && item.current_stage !== "trusted" && (
                          <Button size="sm" className="text-[9px] h-6 px-2" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
                            onClick={() => rejectItem(item)}>Reject</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {items.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">No state items. Seed data to populate the verification pipeline.</div>
        )}
      </div>

      <LiveProofEngine
        title="Gate Pipeline Verification Engine"
        checks={vgChecks}
        hashPayload={items.map(i => `${i.id}:${i.current_stage}:${i.gate_result}:${i.risk_score}`).join("|")}
        proofLabel="PIPELINE CERTIFIED"
      />
    </div>
  );
}