import React from "react";
import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import { describeEntry, formatAuditTime } from "@/lib/museAudit";

const TONE = {
  control: { color: "#f0b429", bg: "rgba(240,180,41,.07)", border: "rgba(240,180,41,.28)" },
  outcome: { color: "#60a5fa", bg: "rgba(96,165,250,.07)", border: "rgba(96,165,250,.25)" },
  ok: { color: "#4ade80", bg: "rgba(74,222,128,.07)", border: "rgba(74,222,128,.25)" },
  warn: { color: "#f59e0b", bg: "rgba(245,158,11,.07)", border: "rgba(245,158,11,.28)" },
  bad: { color: "#f87171", bg: "rgba(248,113,113,.07)", border: "rgba(248,113,113,.28)" },
  note: { color: "rgba(232,217,176,.8)", bg: "rgba(255,255,255,.03)", border: "rgba(201,168,76,.18)" },
};

const SEAL = {
  sealed: { icon: ShieldCheck, color: "#4ade80", label: "Sealed" },
  unsealed: { icon: ShieldQuestion, color: "#f59e0b", label: "Unsealed" },
  broken: { icon: ShieldAlert, color: "#f87171", label: "Breaks verification" },
};

export default function MuseAuditEntry({ entry }) {
  const tone = TONE[describeEntry(entry).tone] || TONE.note;
  const { label, target } = describeEntry(entry);
  const seal = SEAL[entry.status] || SEAL.unsealed;
  const SealIcon = seal.icon;

  return (
    <div className="rounded-xl border p-3 space-y-1.5"
      style={{ borderColor: tone.border, background: tone.bg }}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold leading-snug" style={{ color: tone.color }}>{label}</p>
        <span className="flex items-center gap-1 flex-shrink-0 text-[9px] font-black uppercase tracking-wider"
          style={{ color: seal.color }}>
          <SealIcon className="w-3 h-3" />{seal.label}
        </span>
      </div>

      {target && <p className="text-[11px] text-muted-foreground break-words">{target}</p>}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-mono text-muted-foreground/70">
        <span>#{entry.event_id}</span>
        <span>{formatAuditTime(entry.created_at)}</span>
        {entry.seal && <span className="break-all">{String(entry.seal).slice(0, 16)}…</span>}
      </div>
    </div>
  );
}