import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const GOLD = "#C9A84C";

export const PROOF_STATUSES = {
  VERIFIED_FACT:          { label: "VERIFIED FACT",           color: "#4ade80", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.3)" },
  DEMO_VISUALIZATION:     { label: "DEMO VISUALIZATION",      color: GOLD,      bg: "rgba(201,168,76,0.08)", border: "rgba(201,168,76,0.3)" },
  PROTOTYPE_ASSET:        { label: "PROTOTYPE ASSET",          color: GOLD,      bg: "rgba(201,168,76,0.1)",  border: "rgba(201,168,76,0.38)" },
  SIMULATION:             { label: "SIMULATION",               color: "#60a5fa", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.3)" },
  THEORY_INSPIRED:        { label: "THEORY-INSPIRED MODEL",   color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.3)" },
  BUSINESS_POLICY:        { label: "BUSINESS POLICY TEMPLATE",color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.3)" },
  NEEDS_LEGAL_REVIEW:     { label: "NEEDS LEGAL REVIEW",      color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.3)" },
  NEEDS_TECH_VALIDATION:  { label: "NEEDS TECH VALIDATION",   color: "#f97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.3)" },
  PLACEHOLDER:            { label: "PLACEHOLDER / COMING SOON",color: "#94a3b8",bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.3)" },
  OWNER_CLAIM:            { label: "OWNER CLAIM / FOUNDER STORY",color: GOLD,   bg: "rgba(201,168,76,0.06)", border: "rgba(201,168,76,0.2)" },
  INVESTOR_PROJECTION:    { label: "INVESTOR PROJECTION",     color: "#22c55e", bg: "rgba(34,197,94,0.06)",   border: "rgba(34,197,94,0.25)" },
};

/**
 * ProofBadge - inline expandable proof status widget
 * status: key from PROOF_STATUSES
 * proof: what proves it (string)
 * missing: what's still missing (string)
 * note: disclaimer / context (string)
 * updated: last updated label (string)
 * record: related proof record label (optional string)
 */
export default function ProofBadge({ status = "DEMO_VISUALIZATION", proof, missing, note, updated, record, compact = false }) {
  const [open, setOpen] = useState(false);
  const meta = PROOF_STATUSES[status] || PROOF_STATUSES.DEMO_VISUALIZATION;

  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border cursor-pointer select-none"
        style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}
        onClick={() => setOpen(v => !v)}
        title={note || meta.label}
      >
        ◆ {meta.label}
      </span>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden text-[9px]" style={{ borderColor: meta.border, background: meta.bg }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-1.5 gap-2 font-black uppercase tracking-wider"
        style={{ color: meta.color }}
      >
        <span>◆ {meta.label}</span>
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <div className="px-3 pb-2.5 space-y-1" style={{ color: "rgba(255,255,255,0.65)" }}>
          {proof   && <p><span className="font-bold" style={{ color: meta.color }}>Proof: </span>{proof}</p>}
          {missing && <p><span className="font-bold text-amber-400">Missing: </span>{missing}</p>}
          {note    && <p className="italic leading-relaxed">{note}</p>}
          {updated && <p className="text-muted-foreground">Updated: {updated}</p>}
          {record  && <p><span className="font-bold" style={{ color: meta.color }}>Record: </span>{record}</p>}
        </div>
      )}
    </div>
  );
}