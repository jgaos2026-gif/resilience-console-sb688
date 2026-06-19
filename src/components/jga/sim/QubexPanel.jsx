import React from "react";
import { Badge } from "@/components/ui/badge";

const GOLD = "#C9A84C";

const SCORE_COLOR = (s) => s >= 70 ? "#4ade80" : s >= 50 ? "#fbbf24" : s >= 30 ? "#f97316" : "#ef4444";
const SCORE_LABEL = (s) => s >= 70 ? "PASS" : s >= 50 ? "REVIEW" : s >= 30 ? "UNCERTAIN" : "FAIL";

const RESULT_STYLE = {
  TRUSTED: { color: GOLD, bg: "rgba(201,168,76,0.1)", border: "rgba(201,168,76,0.3)" },
  CHECKING: { color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)" },
  DISAGREEMENT: { color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" },
  QUARANTINE: { color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)" },
};

const getResult = (braidState, q1, q2) => {
  if (braidState === "certified" || braidState === "healthy") return "TRUSTED";
  if (braidState === "corrupted" || braidState === "drifting") {
    if (Math.abs(q1 - q2) > 30 || q1 < 30 || q2 < 30) return "DISAGREEMENT";
    return "QUARANTINE";
  }
  if (braidState === "healing" || braidState === "recovering") return "CHECKING";
  return "TRUSTED";
};

export default function QubexPanel({ braidState, qubexLive }) {
  const { q1, q2 } = qubexLive;
  const result = getResult(braidState, q1, q2);
  const rs = RESULT_STYLE[result] || RESULT_STYLE.TRUSTED;

  const stateScores = {
    healthy: { q1: 97, q2: 95 },
    drifting: { q1: 61, q2: 38 },
    corrupted: { q1: q1, q2: q2 },
    healing: { q1: 72, q2: 68 },
    recovering: { q1: 88, q2: 84 },
    certified: { q1: 96, q2: 94 },
  };
  const scores = stateScores[braidState] || stateScores.healthy;

  return (
    <div className="rounded-2xl border border-border p-4 space-y-3" style={{ background: "hsl(220,18%,7%)" }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold font-cinzel" style={{ color: GOLD }}>QUBEX Paired Witness System</h3>
          <p className="text-[9px] text-muted-foreground">Quantum-inspired binary evidence exchange — both nodes must agree</p>
        </div>
        <Badge className="text-[9px] font-bold border" style={{ background: rs.bg, color: rs.color, borderColor: rs.border }}>
          {result}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[{ id: "QUBEX-1", role: "Forward Observer", score: scores.q1 },
          { id: "QUBEX-2", role: "Mirror Challenger", score: scores.q2 }].map(q => (
          <div key={q.id} className="rounded-xl border p-3 space-y-2"
            style={{ background: "rgba(0,0,0,0.2)", borderColor: `${SCORE_COLOR(q.score)}25` }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono" style={{ color: SCORE_COLOR(q.score) }}>{q.id}</span>
              <span className="text-[8px] text-muted-foreground">{q.role}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold font-mono" style={{ color: SCORE_COLOR(q.score) }}>{q.score}</span>
              <span className="text-[9px] text-muted-foreground mb-0.5">/100</span>
              <span className="text-[8px] font-bold font-mono ml-auto" style={{ color: SCORE_COLOR(q.score) }}>{SCORE_LABEL(q.score)}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${q.score}%`, background: SCORE_COLOR(q.score) }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-1.5 text-center">
        {[
          { range: "0–29", label: "QUARANTINE", color: "#ef4444" },
          { range: "30–49", label: "HUNTER", color: "#f97316" },
          { range: "50–69", label: "REVIEW", color: "#fbbf24" },
          { range: "70–100", label: "PASS*", color: "#4ade80" },
        ].map(r => (
          <div key={r.range} className="rounded-lg p-1.5" style={{ background: `${r.color}08`, border: `1px solid ${r.color}20` }}>
            <div className="text-[8px] font-bold font-mono" style={{ color: r.color }}>{r.range}</div>
            <div className="text-[7px] text-muted-foreground">{r.label}</div>
          </div>
        ))}
      </div>
      <p className="text-[8px] text-muted-foreground">*Even 100/100 must still pass TVE certification before reaching trusted state.</p>
    </div>
  );
}