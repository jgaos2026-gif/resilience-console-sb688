import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

const GOLD = "#C9A84C";

function GoldCrown({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="20,2 25,14 38,14 28,22 32,34 20,26 8,34 12,22 2,14 15,14" fill={GOLD} />
      <polygon points="20,5 24,14 35,14 27,21 30,31 20,24 10,31 13,21 5,14 16,14" fill="#a07828" opacity="0.4" />
    </svg>
  );
}

const PROOF_DOCS = [
  {
    id: "IL-SOS",
    title: "Illinois Certificate of Good Standing",
    issuer: "Illinois Secretary of State — Jesse White",
    date: "July 6, 2025",
    details: "Jays Graphic Arts, LLC — Organized July 21, 2025. In good standing as a domestic LLC in the State of Illinois.",
    fileNumber: "0906787-6",
    verifiable: "cyberdriveillinois.com · Auth #: 2021303556",
    img: "https://media.base44.com/images/public/69d5af52688205fc104c687c/cb14dee8a_IMG_1092_Original_Original.png",
    status: "VERIFIED FACT",
    statusColor: "#4ade80",
  },
  {
    id: "IRS-EIN",
    title: "IRS Employer Identification Number (EIN)",
    issuer: "IRS — Department of the Treasury, Internal Revenue Service",
    date: "July 9, 2025",
    details: "EIN 39-3127122 assigned to Jays Graphic Arts / JPS Professional Services, % John E Arenz I, Sole Mbr — 505 4th Ave, Mendota, IL 61342. Form SS-4, Notice CP575G.",
    fileNumber: "EIN 39-3127122",
    verifiable: "IRS.gov · Form SS-4 / CP575G",
    img: "https://media.base44.com/images/public/69d5af52688205fc104c687c/3a14083ad_IMG_0764_Original_Original.png",
    status: "VERIFIED FACT",
    statusColor: "#4ade80",
  },
  {
    id: "IL-BIZ-AUTH",
    title: "Illinois Business Authorization — Certificate of Registration",
    issuer: "Illinois Department of Revenue",
    date: "Issued July 2, 2025 · Expiration July 2, 2025",
    details: "Jays Graphic Arts DBA Jps Professional Services. Location: Mendota, La Salle County. Sales and use taxes and fees. Loc. Code: 050-0015-7-001. Cert #4362-4189.",
    fileNumber: "Cert #4362-4189",
    verifiable: "Illinois Dept of Revenue · IDOR",
    img: "https://media.base44.com/images/public/69d5af52688205fc104c687c/1bcd3fa87_IMG_1091_Original_Original.png",
    status: "VERIFIED FACT",
    statusColor: "#4ade80",
  },
  {
    id: "IL-REG1-A",
    title: "REG-1 New Business Registration — Illinois Dept of Revenue",
    issuer: "Illinois Department of Revenue",
    date: "Business Income Tax Begin Date: 8/12/2025",
    details: "Business Legal Name: JAYS GRAPHIC ARTS LLC. Address: 603 6th Ave Uppr, Mendota IL 61342-2149. Organization Type: LLC – Corporation.",
    fileNumber: "REG-1",
    verifiable: "Illinois Dept of Revenue — IDOR REG-1",
    img: "https://media.base44.com/images/public/69d5af52688205fc104c687c/a965a6c6a_IMG_0766_Original_Original.png",
    status: "VERIFIED FACT",
    statusColor: "#4ade80",
  },
  {
    id: "IL-REG1-B",
    title: "REG-1 New Business Registration (Copy 2)",
    issuer: "Illinois Department of Revenue",
    date: "Business Income Tax Begin Date: 8/12/2025",
    details: "Duplicate copy of REG-1. Business Legal Name: JAYS GRAPHIC ARTS LLC. Address: 603 6th Ave Uppr, Mendota IL 61342-2149. Organization Type: LLC – Corporation.",
    fileNumber: "REG-1 (Copy 2)",
    verifiable: "Illinois Dept of Revenue — IDOR REG-1",
    img: "https://media.base44.com/images/public/69d5af52688205fc104c687c/8d094d6de_IMG_0766_Original_Original.png",
    status: "VERIFIED FACT",
    statusColor: "#4ade80",
  },
];

function DocCard({ doc }) {
  const [expanded, setExpanded] = useState(false);
  const [imgOpen, setImgOpen] = useState(false);

  return (
    <div className="rounded-xl border overflow-hidden transition-all"
      style={{ background: "linear-gradient(135deg, #0e0c00, #111111)", borderColor: `${GOLD}28` }}>
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        {/* Thumbnail */}
        <button onClick={() => setImgOpen(true)}
          className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border hover:opacity-80 transition"
          style={{ borderColor: `${GOLD}35` }}>
          <img src={doc.img} alt={doc.title} className="w-full h-full object-cover object-top" />
        </button>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <span className="text-[8px] font-black tracking-widest uppercase font-mono" style={{ color: `${GOLD}80` }}>{doc.id}</span>
            <Badge className="text-[7px] border font-black uppercase px-1.5 py-0 flex items-center gap-1"
              style={{ background: "rgba(74,222,128,0.08)", color: doc.statusColor, borderColor: `${doc.statusColor}35` }}>
              <CheckCircle2 className="w-2.5 h-2.5" /> {doc.status}
            </Badge>
          </div>
          <h3 className="text-[11px] font-bold leading-snug" style={{ color: GOLD }}>{doc.title}</h3>
          <p className="text-[9px] text-muted-foreground">{doc.issuer} · {doc.date}</p>
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2 text-[9px] font-bold uppercase tracking-wider border-t transition hover:opacity-80"
        style={{ borderColor: `${GOLD}15`, color: `${GOLD}80` }}>
        <span>{expanded ? "Hide Details" : "View Details"}</span>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 text-[10px]">
          <p className="text-foreground leading-relaxed">{doc.details}</p>
          <div className="flex flex-wrap gap-3 pt-1">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Shield className="w-3 h-3" style={{ color: GOLD }} />
              <span className="font-bold" style={{ color: GOLD }}>File #:</span> {doc.fileNumber}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <ExternalLink className="w-3 h-3" style={{ color: GOLD }} />
              {doc.verifiable}
            </span>
          </div>
          <button onClick={() => setImgOpen(true)}
            className="mt-2 text-[9px] font-bold px-3 py-1.5 rounded-lg border transition hover:opacity-75"
            style={{ color: GOLD, borderColor: `${GOLD}30`, background: `${GOLD}08` }}>
            View Full Document Image →
          </button>
        </div>
      )}

      {/* Full image modal */}
      {imgOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={() => setImgOpen(false)}>
          <div className="relative max-w-2xl w-full max-h-[90vh] overflow-auto rounded-2xl border-2"
            style={{ borderColor: `${GOLD}50` }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b"
              style={{ background: "#0e0c00", borderColor: `${GOLD}30` }}>
              <div className="flex items-center gap-2">
                <GoldCrown size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: GOLD }}>{doc.title}</span>
              </div>
              <button onClick={() => setImgOpen(false)} className="text-muted-foreground hover:text-foreground text-lg leading-none">✕</button>
            </div>
            <img src={doc.img} alt={doc.title} className="w-full" />
            <div className="px-4 py-2 text-center text-[8px] text-muted-foreground border-t"
              style={{ background: "#0e0c00", borderColor: `${GOLD}20` }}>
              ◆ VERIFIED FACT — {doc.issuer} · {doc.date}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifiedBusinessProof() {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: `${GOLD}35`, background: "#0a0900" }}>
      {/* Section Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 transition hover:opacity-80"
        style={{ background: `${GOLD}08`, borderBottom: open ? `1px solid ${GOLD}25` : "none" }}>
        <div className="flex items-center gap-3">
          <GoldCrown size={22} />
          <div className="text-left">
            <h2 className="text-sm font-black font-cinzel" style={{ color: GOLD }}>Verified Business Proof Records</h2>
            <p className="text-[9px] text-muted-foreground mt-0.5">5 government-issued documents · VERIFIED FACT status · Jays Graphic Arts LLC</p>
          </div>
          <Badge className="text-[8px] border font-black px-2 py-0.5 flex items-center gap-1 ml-2"
            style={{ background: "rgba(74,222,128,0.08)", color: "#4ade80", borderColor: "rgba(74,222,128,0.3)" }}>
            <CheckCircle2 className="w-2.5 h-2.5" /> 5 VERIFIED
          </Badge>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>

      {open && (
        <div className="p-4 space-y-3">
          {/* Summary strip */}
          <div className="rounded-xl border p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-[9px]"
            style={{ background: "rgba(0,0,0,0.4)", borderColor: `${GOLD}18` }}>
            {[
              { label: "LLC Status",      value: "GOOD STANDING", color: "#4ade80" },
              { label: "EIN",             value: "39-3127122",     color: GOLD },
              { label: "State",           value: "Illinois",       color: GOLD },
              { label: "Organized",       value: "July 21, 2025",  color: "#b0b8c8" },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-muted-foreground uppercase tracking-wider mb-0.5">{s.label}</div>
                <div className="font-black font-mono" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Document cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PROOF_DOCS.map(doc => <DocCard key={doc.id} doc={doc} />)}
          </div>

          {/* Disclaimer */}
          <p className="text-[8px] italic text-muted-foreground px-1 leading-relaxed">
            These documents are uploaded government-issued records. Proof status "VERIFIED FACT" applies to the authenticity of these filings as displayed.
            Operational claims about the SB system software remain labeled separately per their own proof status.
          </p>
        </div>
      )}
    </div>
  );
}