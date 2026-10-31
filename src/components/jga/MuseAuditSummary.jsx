import React from "react";
import { ShieldCheck, ShieldAlert, ShieldQuestion, Ban, Activity, Lock } from "lucide-react";

const GOLD = "#C9A84C";

function Tile({ label, value, color }) {
  return (
    <div className="rounded-xl border p-3" style={{ borderColor: `${GOLD}20`, background: "rgba(0,0,0,.3)" }}>
      <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">{label}</p>
      <p className="text-xl font-black leading-tight" style={{ color }}>{value}</p>
    </div>
  );
}

const CHAIN = {
  verified: { icon: ShieldCheck, color: "#4ade80", label: "Record verifies end to end" },
  broken: { icon: ShieldAlert, color: "#f87171", label: "Record does not verify" },
  empty: { icon: ShieldQuestion, color: "#f0b429", label: "Nothing sealed yet" },
};

export default function MuseAuditSummary({ summary, verification }) {
  const status = verification?.status || "empty";
  const chain = CHAIN[status] || CHAIN.empty;
  const Icon = chain.icon;
  const broken = verification?.broken || [];

  return (
    <div className="rounded-2xl border p-4 space-y-3" style={{ background: "#090909", borderColor: `${GOLD}22` }}>
      <div className="rounded-xl border p-3 flex items-start gap-2.5"
        style={{ borderColor: `${chain.color}44`, background: `${chain.color}10` }}>
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: chain.color }} />
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-black uppercase tracking-wider" style={{ color: chain.color }}>{chain.label}</p>
          <p className="text-[10px] text-muted-foreground break-words">
            {verification?.sealed_events ?? 0} sealed entries checked
            {verification?.unsealed_events ? ` · ${verification.unsealed_events} unsealed` : ""}
            {verification?.head_seal ? ` · head ${String(verification.head_seal).slice(0, 12)}…` : ""}
          </p>
          {broken.length > 0 && (
            <ul className="text-[10px] space-y-0.5 pt-1" style={{ color: "#f87171" }}>
              {broken.slice(0, 3).map(b => (
                <li key={b.event_id}>Entry #{b.event_id}: {b.reason}</li>
              ))}
              {broken.length > 3 && <li>…and {broken.length - 3} more</li>}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Tile label="Control requests" value={summary?.control_requests ?? 0} color="#f0b429" />
        <Tile label="Outcomes" value={summary?.outcomes ?? 0} color="#60a5fa" />
        <Tile label="Security events" value={summary?.security_events ?? 0} color="#f87171" />
        <Tile label="Total events" value={summary?.total_events ?? 0} color={GOLD} />
      </div>

      <p className="text-[10px] text-muted-foreground flex items-start gap-1.5">
        <Lock className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: GOLD }} />
        Seals are written the moment an entry is recorded and cannot be edited or deleted. This view reports what it
        found — it does not certify the system.
      </p>
    </div>
  );
}