/**
 * SelfHealingDemo.jsx — Wired to real /api/recovery
 */
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, AlertTriangle, RotateCcw, CheckCircle2, Activity, Shield } from "lucide-react";
import api from "@/api/apiClient";

const GOLD = "#C9A84C";

const RECOVERY_STAGES = ["detection", "quarantine", "rollback", "repair", "re-verification", "certification"];

export default function SelfHealingPanel() {
  const qc = useQueryClient();
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);

  const { data: scan } = useQuery({
    queryKey: ["recovery-scan"],
    queryFn:  () => api.get("/api/recovery/scan"),
    refetchInterval: 20000,
  });

  const runMutation = useMutation({
    mutationFn: (nodeId) => api.post("/api/recovery/run", nodeId ? { nodeId } : {}),
    onMutate:   ()       => setRunning(true),
    onSuccess:  (data)   => { setLog(data.log || []); setRunning(false); qc.invalidateQueries({ queryKey: ["nodes", "spine", "recovery-scan"] }); },
    onError:    (err)    => { setRunning(false); setLog([{ stage: "error", msg: err.message, ts: new Date().toISOString() }]); },
  });

  const anomalies = scan?.anomalies || [];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold font-mono" style={{ color: GOLD }}>Self-Healing Panel</h1>
        <p className="text-xs text-muted-foreground">Phoenix recovery — braided rollback + re-verification engine</p>
      </div>

      {/* Recovery Stage Flow */}
      <div className="rounded-xl border border-border p-5 space-y-3" style={{ background: "hsl(220,18%,7%)" }}>
        <h2 className="text-sm font-bold font-mono" style={{ color: GOLD }}>Recovery Pipeline</h2>
        <div className="flex flex-wrap gap-2">
          {RECOVERY_STAGES.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className="px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold border capitalize"
                style={{ background: "hsl(220,20%,6%)", borderColor: "rgba(201,168,76,0.2)", color: GOLD }}>
                {i + 1}. {s}
              </div>
              {i < RECOVERY_STAGES.length - 1 && <span className="text-muted-foreground text-xs">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Anomaly Scan */}
      <div className="rounded-xl border border-border p-5 space-y-3" style={{ background: "hsl(220,18%,7%)" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-mono" style={{ color: GOLD }}>Anomaly Scan</h2>
          <Badge className="text-[10px] font-mono border"
            style={anomalies.length === 0
              ? { background: "rgba(74,222,128,0.1)", color: "#4ade80", borderColor: "rgba(74,222,128,0.3)" }
              : { background: "rgba(239,68,68,0.1)", color: "#f87171", borderColor: "rgba(239,68,68,0.3)" }}>
            {anomalies.length === 0 ? "CLEAN" : `${anomalies.length} ANOMALIES`}
          </Badge>
        </div>
        {anomalies.length > 0 && (
          <div className="space-y-2">
            {anomalies.map(a => (
              <div key={a.id} className="rounded-lg border border-red-900/30 p-3 space-y-1" style={{ background: "rgba(239,68,68,0.05)" }}>
                <p className="text-xs font-bold font-mono text-red-400">{a.name}</p>
                {a.errors.map((e, i) => <p key={i} className="text-[9px] text-red-300 font-mono">⚠ {e}</p>)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Run Recovery */}
      <div className="rounded-xl border border-border p-5 space-y-4" style={{ background: "hsl(220,18%,7%)" }}>
        <h2 className="text-sm font-bold font-mono" style={{ color: GOLD }}>Phoenix Recovery</h2>
        <Button
          disabled={running}
          className="text-xs font-bold font-mono"
          style={{ background: "rgba(201,168,76,0.12)", color: GOLD, border: "1px solid rgba(201,168,76,0.35)" }}
          onClick={() => runMutation.mutate(null)}>
          <Heart className="w-4 h-4 mr-2" />
          {running ? "Recovery in progress…" : "Run Full Phoenix Recovery"}
        </Button>

        {log.length > 0 && (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {log.map((entry, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px] font-mono py-1 border-b border-border/20 last:border-0">
                <span className="text-muted-foreground flex-shrink-0 w-16 capitalize">{entry.stage}</span>
                <span style={{ color: entry.stage === "certification" ? "#4ade80" : entry.stage === "error" ? "#f87171" : "rgba(232,217,176,0.7)" }}>
                  {entry.msg}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
