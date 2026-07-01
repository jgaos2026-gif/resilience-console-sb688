import React, { useState } from "react";
import { AlertTriangle, Brain, CheckCircle2, Loader2, Radio } from "lucide-react";
import { base44 } from "@/api/base44Client";

const GOLD = "#C9A84C";
const HEALTH = { healthy: "#4ade80", degraded: "#fbbf24", critical: "#ef4444" };

export default function AVADailyBriefingPanel() {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const res = await base44.functions.invoke("dailySystemReport", { report_type: "daily" });
    setBriefing(res.data?.briefing || null);
    setLoading(false);
  };

  const healthColor = briefing ? HEALTH[briefing.system_health] : GOLD;

  return (
    <div className="px-4 sm:px-6 py-6">
      <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: `${GOLD}28`, background: "#080808" }}>
        <div className="px-5 py-4 border-b flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: `${GOLD}18`, background: "linear-gradient(135deg, #0e0c00, #0a0a0a)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}35` }}>
              <Brain className="w-4 h-4" style={{ color: GOLD }} />
            </div>
            <div>
              <div className="text-xs font-black font-cinzel tracking-wider" style={{ color: GOLD }}>AVA Daily Briefing</div>
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground">System health · OASIS · critical attention</div>
            </div>
          </div>
          <button onClick={generate} disabled={loading} className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-50" style={{ background: `linear-gradient(135deg, ${GOLD}, #7a5010)`, color: "#080808" }}>
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Radio className="w-3 h-3" />}
            Generate Briefing
          </button>
        </div>

        {!briefing ? (
          <div className="p-5 text-xs text-muted-foreground leading-relaxed">
            Ask AVA for today’s briefing and she’ll scan system health, OASIS verified records, recovery events, logs, orders, and payment watch items.
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-sm font-black" style={{ color: GOLD }}>{briefing.briefing_title}</h3>
              <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: healthColor, borderColor: `${healthColor}55`, background: `${healthColor}12` }}>
                {briefing.system_health}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-foreground/80">{briefing.executive_summary}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border p-4" style={{ background: "rgba(0,0,0,0.35)", borderColor: "rgba(239,68,68,0.22)" }}>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-3 text-red-300"><AlertTriangle className="w-3.5 h-3.5" /> Immediate Attention</div>
                <ul className="space-y-2 text-[11px] text-muted-foreground">
                  {briefing.immediate_attention.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div className="rounded-xl border p-4" style={{ background: "rgba(0,0,0,0.35)", borderColor: `${GOLD}20` }}>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: GOLD }}><CheckCircle2 className="w-3.5 h-3.5" /> Next Moves</div>
                <ul className="space-y-2 text-[11px] text-muted-foreground">
                  {briefing.next_actions.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            </div>

            <div className="rounded-xl border p-4 text-[11px] leading-relaxed" style={{ background: `${GOLD}06`, borderColor: `${GOLD}18`, color: "rgba(232,217,176,0.75)" }}>
              <span className="font-bold" style={{ color: GOLD }}>OASIS:</span> {briefing.oasis_context}
            </div>
            <p className="text-xs italic font-cinzel" style={{ color: GOLD }}>{briefing.ava_note}</p>
          </div>
        )}
      </div>
    </div>
  );
}