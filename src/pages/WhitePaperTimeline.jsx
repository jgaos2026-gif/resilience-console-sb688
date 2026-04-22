import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CrownIcon } from "@/components/sb688/WarriorCrest";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronDown, ChevronUp, FileText, GitBranch, Shield, Zap, Lock, Cpu, Activity, CheckCircle2 } from "lucide-react";

const GOLD = "#FFD700";
const BG   = "#000000";
const CARD = "#0a0a0a";

const VERSIONS = [
  {
    version: "v0.1 — ALPHA",
    date: "2019-Q3",
    codename: "Drift Hypothesis",
    status: "archived",
    color: "#6b7280",
    icon: Cpu,
    summary: "Initial discovery notes on AI cognitive drift and hallucination patterns. Raw field observations from John Arenz's garage in Mendota, IL — built on a trash-bin laptop.",
    changes: [
      "Identified core 'drift' phenomenon in AI language models",
      "Documented hallucination patterns unseen by mainstream researchers",
      "Proposed HMAC-based golden directive concept (pre-formal)",
      "First sketch of Spine+Ribs geometry on notebook paper",
    ],
    protocols: [],
    docId: "JGA-DRAFT-0.1",
  },
  {
    version: "v0.5 — BETA",
    date: "2021-Q1",
    codename: "Brick Stitch Genesis",
    status: "archived",
    color: "#8b5cf6",
    icon: GitBranch,
    summary: "First formalization of the Brick Stitch geometry. The 1/2 Offset Spine+Ribs pattern is named and defined. Early recovery models drafted.",
    changes: [
      "Named and defined '1/2 Offset Spine+Ribs Geometry'",
      "Proved 38% node loss survivability in simulation",
      "Introduced 'Trusted Checkpoint' terminology",
      "Drafted first Brick Stitch recovery sequence (5-step)",
      "Identified Columnar Stacking brittleness at scale",
    ],
    protocols: ["BSP-001: Node Offset Geometry", "BSP-002: Checkpoint Sealing"],
    docId: "BSS-2021-DRAFT-0.5",
  },
  {
    version: "v1.0 — RELEASE",
    date: "2022-Q2",
    codename: "Sovereign Spine",
    status: "stable",
    color: "#22c55e",
    icon: Shield,
    summary: "First production-ready specification. SB688 resilience engine formalized. HMAC-SHA3-256 golden directive locked. Merkle Stitch neural integrity tree introduced.",
    changes: [
      "SB688 Resilience Engine — first working prototype documented",
      "HMAC-SHA3-256 golden directive formally specified",
      "Merkle Stitch neural integrity tree — architecture finalized",
      "Ghost Node concept introduced (passive boundary sensors)",
      "Quarantine-before-restore pattern established",
      "Append-only ledger protocol locked",
      "Dual-Kernel AI: Worker (A) watched by Sovereign (B)",
    ],
    protocols: [
      "SB688-CORE-001: Resilience Engine",
      "SB688-CORE-002: HMAC Golden Directive",
      "SB688-CORE-003: Merkle Stitch Integrity",
      "SB688-CORE-004: Ghost Node Sensor Protocol",
      "SB688-CORE-005: Quarantine & Restore",
    ],
    docId: "SB688-2022-ARCH-01",
  },
  {
    version: "v1.5 — UPDATE",
    date: "2023-Q4",
    codename: "National Resilience Council",
    status: "stable",
    color: GOLD,
    icon: Zap,
    summary: "Cross-sector adaptation layer added. 8 industry verticals formalized. Governance reporting framework introduced. Proof Suite verification protocol standardized.",
    changes: [
      "8-industry adaptive layer (Healthcare, Finance, DoD, Energy, Aviation, Supply Chain, Telecom, Government)",
      "Governance Report Protocol — cryptographically signed snapshots",
      "Proof Suite verification: 7-test standard battery",
      "Policy Sandbox DSL — governance rule testing environment",
      "Ghost Node telemetry pipeline — real-time audit surfacing",
      "Event Timeline classification engine",
      "Recovery Architecture Tab formalized (Hot/Off-path operations)",
    ],
    protocols: [
      "SB688-GOV-001: Governance Report Framework",
      "SB688-GOV-002: Proof Suite Standard",
      "SB688-GOV-003: Policy DSL Specification",
      "SB688-IND-001: Industry Adaptation Layer",
    ],
    docId: "SB688-2023-NRC-01",
  },
  {
    version: "v2.0 — SOVEREIGN",
    date: "2025-Q1",
    codename: "1211 Sovereign Interface",
    status: "active",
    color: GOLD,
    icon: Lock,
    summary: "Master architectural layer. 1211 Owner Key authentication. Möbius Triple-Braid canvas. Modular Clipping Protocol (brick snap-in). Immutable Ledger sealed at genesis. Nuclear-hardened gold aesthetic.",
    changes: [
      "1211 Owner Key — zero-trust master authentication layer",
      "Möbius Triple-Braid canvas — live corruption/heal visualization",
      "Modular Clipping Protocol — 6-brick live DNA shift system",
      "Immutable Ledger — append-only, read-only, seeded at Day Zero",
      "Kill Sequence protocol — 99.9% collapse + Ghost resurrection",
      "Braid Divergence Analytics — integrity vs. Golden State baseline",
      "GovernanceReportGenerator — one-click signed PDF snapshots",
      "NODE: MENDOTA-IL declared Day Zero origin node",
    ],
    protocols: [
      "SB688-SVRN-001: 1211 Auth Protocol",
      "SB688-SVRN-002: Möbius Triple-Braid Specification",
      "SB688-SVRN-003: Modular Clipping Protocol",
      "SB688-SVRN-004: Immutable Ledger Seal",
      "SB688-SVRN-005: Kill & Resurrection Sequence",
      "SB688-SVRN-006: Braid Divergence Analytics",
    ],
    docId: "BSS-2026-ARCH-01",
  },
  {
    version: "v2.1 — CURRENT",
    date: "2026-04-27",
    codename: "Day Zero Production",
    status: "production",
    color: GOLD,
    icon: Activity,
    summary: "Production deployment. Daily system reporting activated. White Paper Timeline archive published. Cross-platform resilience at 10GW+ AI compute scale. Architecture confirmed by Gemini, ChatGPT, and Perplexity AI.",
    changes: [
      "Daily automated system reports — email delivery pipeline active",
      "White Paper Timeline — historical version archive published",
      "10GW+ AI compute scale validation documented",
      "AI confirmation from Gemini, ChatGPT, Perplexity logged to ledger",
      "Public Observer live drill mode — 5 capability demos",
      "JGA Story archive published (public record)",
      "NODE: MENDOTA-IL — Production Ready",
    ],
    protocols: [
      "SB688-OPS-001: Daily Report Protocol",
      "SB688-OPS-002: Observer Mode Specification",
      "SB688-OPS-003: White Paper Archive Standard",
      "BSS-2026-ARCH-01: Final Production Seal",
    ],
    docId: "BSS-2026-PROD-01",
  },
];

const STATUS_STYLE = {
  archived:   { bg: "rgba(107,114,128,0.12)", color: "#9ca3af", border: "rgba(107,114,128,0.3)", label: "Archived" },
  stable:     { bg: "rgba(34,197,94,0.1)",   color: "#22c55e", border: "rgba(34,197,94,0.3)",  label: "Stable"   },
  active:     { bg: "rgba(255,215,0,0.1)",   color: GOLD,      border: "rgba(255,215,0,0.35)", label: "Active"   },
  production: { bg: "rgba(255,215,0,0.15)",  color: GOLD,      border: "rgba(255,215,0,0.5)",  label: "⚡ Production" },
};

function DiffBadge({ text }) {
  return (
    <div className="flex items-start gap-2 text-[11px] py-0.5">
      <span style={{ color: "#22c55e", flexShrink: 0 }}>+</span>
      <span style={{ color: "rgba(255,215,0,0.65)" }}>{text}</span>
    </div>
  );
}

function ProtocolBadge({ label }) {
  return (
    <Badge className="text-[9px] border font-mono"
      style={{ background: "rgba(255,215,0,0.06)", color: "rgba(255,215,0,0.7)", borderColor: "rgba(255,215,0,0.2)" }}>
      {label}
    </Badge>
  );
}

function VersionCard({ v, selected, onSelect }) {
  const Icon = v.icon;
  const st = STATUS_STYLE[v.status];
  const isSelected = selected === v.version;

  return (
    <button onClick={() => onSelect(isSelected ? null : v.version)}
      className="w-full text-left rounded-xl border transition-all duration-200 overflow-hidden"
      style={{
        background: isSelected ? `${v.color}08` : CARD,
        borderColor: isSelected ? `${v.color}50` : "rgba(255,215,0,0.12)",
        boxShadow: isSelected ? `0 0 20px ${v.color}12` : "none",
      }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${v.color}12`, border: `1px solid ${v.color}30` }}>
            <Icon className="w-4 h-4" style={{ color: v.color }} />
          </div>
          <div>
            <div className="text-xs font-bold" style={{ color: v.color }}>{v.version}</div>
            <div className="text-[9px] font-mono" style={{ color: "rgba(255,215,0,0.35)" }}>{v.codename} · {v.date}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="text-[9px] border font-bold"
            style={{ background: st.bg, color: st.color, borderColor: st.border }}>
            {st.label}
          </Badge>
          {isSelected
            ? <ChevronUp className="w-3.5 h-3.5" style={{ color: v.color }} />
            : <ChevronDown className="w-3.5 h-3.5" style={{ color: "rgba(255,215,0,0.3)" }} />}
        </div>
      </div>

      {/* Summary always visible */}
      <div className="px-4 pb-3">
        <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,215,0,0.5)" }}>{v.summary}</p>
      </div>

      {/* Expanded detail */}
      {isSelected && (
        <div className="px-4 pb-5 space-y-4 border-t" style={{ borderColor: `${v.color}20` }}>
          <div className="pt-3 space-y-1">
            <div className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: "rgba(255,215,0,0.4)" }}>
              Changelog
            </div>
            {v.changes.map((c, i) => <DiffBadge key={i} text={c} />)}
          </div>

          {v.protocols.length > 0 && (
            <div className="space-y-2">
              <div className="text-[9px] uppercase tracking-widest font-bold" style={{ color: "rgba(255,215,0,0.4)" }}>
                Protocols Introduced
              </div>
              <div className="flex flex-wrap gap-1.5">
                {v.protocols.map((p, i) => <ProtocolBadge key={i} label={p} />)}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-[9px] font-mono" style={{ color: "rgba(255,215,0,0.25)" }}>
              Doc ID: {v.docId}
            </span>
            <div className="flex items-center gap-1 text-[9px]" style={{ color: "#22c55e" }}>
              <CheckCircle2 className="w-3 h-3" />
              Sealed · Read-Only
            </div>
          </div>
        </div>
      )}
    </button>
  );
}

function CompareView({ vA, vB }) {
  if (!vA || !vB) return null;
  const newProtocols = vB.protocols.filter(p => !vA.protocols.includes(p));
  const newChanges   = vB.changes;

  return (
    <div className="rounded-xl border p-5 space-y-4"
      style={{ background: CARD, borderColor: "rgba(255,215,0,0.2)" }}>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-bold" style={{ color: vA.color }}>{vA.version}</span>
        <span className="text-[10px]" style={{ color: "rgba(255,215,0,0.3)" }}>→</span>
        <span className="text-xs font-bold" style={{ color: vB.color }}>{vB.version}</span>
        <Badge className="text-[9px] border ml-auto" style={{ background: "rgba(255,215,0,0.06)", color: GOLD, borderColor: "rgba(255,215,0,0.25)" }}>
          Version Delta
        </Badge>
      </div>
      <div>
        <div className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: "rgba(255,215,0,0.4)" }}>New in {vB.version}</div>
        {newChanges.map((c, i) => <DiffBadge key={i} text={c} />)}
      </div>
      {newProtocols.length > 0 && (
        <div>
          <div className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: "rgba(255,215,0,0.4)" }}>New Protocols</div>
          <div className="flex flex-wrap gap-1.5">
            {newProtocols.map((p, i) => <ProtocolBadge key={i} label={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WhitePaperTimeline() {
  const [selected, setSelected] = useState("v2.1 — CURRENT");
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");
  const [mode, setMode] = useState("timeline"); // timeline | compare

  const vA = VERSIONS.find(v => v.version === compareA);
  const vB = VERSIONS.find(v => v.version === compareB);

  return (
    <div className="min-h-screen font-inter" style={{ background: BG, color: "rgba(255,215,0,0.88)" }}>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b"
        style={{ background: "#0a0a0a", borderColor: "rgba(255,215,0,0.2)", boxShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>
        <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} />
        <div className="max-w-4xl mx-auto px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <CrownIcon size={17} color={GOLD} />
            <div>
              <h1 className="text-sm font-bold tracking-widest font-cinzel" style={{ color: GOLD }}>
                SB688 WHITE PAPER TIMELINE
              </h1>
              <p className="text-[8px] uppercase tracking-widest" style={{ color: "rgba(255,215,0,0.35)" }}>
                Protocol Evolution Archive · JGA Enterprise · BSS-2026-ARCH-01
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="text-[9px] border font-bold"
              style={{ background: "rgba(255,215,0,0.08)", color: GOLD, borderColor: "rgba(255,215,0,0.3)" }}>
              {VERSIONS.length} VERSIONS ARCHIVED
            </Badge>
            <Link to="/" className="flex items-center gap-1 text-[10px] px-3 py-1.5 rounded border font-semibold"
              style={{ color: "rgba(255,215,0,0.6)", borderColor: "rgba(255,215,0,0.2)" }}>
              <ChevronLeft className="w-3 h-3" /> Console
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8 space-y-6">

        {/* Mode toggle */}
        <div className="flex items-center gap-2">
          {["timeline", "compare"].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className="px-4 py-1.5 rounded-lg border text-[11px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: mode === m ? "rgba(255,215,0,0.12)" : "transparent",
                color: mode === m ? GOLD : "rgba(255,215,0,0.4)",
                borderColor: mode === m ? "rgba(255,215,0,0.4)" : "rgba(255,215,0,0.12)",
              }}>
              {m === "timeline" ? "📜 Timeline" : "⚡ Compare"}
            </button>
          ))}
        </div>

        {mode === "timeline" && (
          <>
            {/* Visual timeline strip */}
            <div className="rounded-xl border p-4 overflow-x-auto"
              style={{ background: CARD, borderColor: "rgba(255,215,0,0.15)" }}>
              <div className="flex items-center gap-0 min-w-max">
                {VERSIONS.map((v, i) => {
                  const st = STATUS_STYLE[v.status];
                  const isLast = i === VERSIONS.length - 1;
                  return (
                    <React.Fragment key={v.version}>
                      <button onClick={() => setSelected(selected === v.version ? null : v.version)}
                        className="flex flex-col items-center gap-1.5 px-3 group">
                        <div className="w-4 h-4 rounded-full border-2 transition-all"
                          style={{ background: selected === v.version ? v.color : `${v.color}20`, borderColor: v.color }} />
                        <div className="text-[8px] font-bold text-center leading-tight" style={{ color: v.color }}>{v.date}</div>
                        <div className="text-[7px] text-center max-w-16 leading-tight" style={{ color: "rgba(255,215,0,0.3)" }}>{v.codename}</div>
                      </button>
                      {!isLast && (
                        <div className="flex-1 h-0.5 min-w-8"
                          style={{ background: `linear-gradient(90deg, ${VERSIONS[i].color}60, ${VERSIONS[i+1].color}60)` }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Version cards */}
            <div className="space-y-3">
              {VERSIONS.slice().reverse().map((v) => (
                <VersionCard key={v.version} v={v} selected={selected} onSelect={setSelected} />
              ))}
            </div>
          </>
        )}

        {mode === "compare" && (
          <div className="space-y-5">
            <div className="rounded-xl border p-5 space-y-4"
              style={{ background: CARD, borderColor: "rgba(255,215,0,0.15)" }}>
              <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "rgba(255,215,0,0.4)" }}>
                Select Two Versions to Compare
              </div>
              <div className="grid grid-cols-2 gap-4">
                {["A (Older)", "B (Newer)"].map((label, idx) => {
                  const val = idx === 0 ? compareA : compareB;
                  const setter = idx === 0 ? setCompareA : setCompareB;
                  return (
                    <div key={label} className="space-y-1">
                      <div className="text-[9px] font-bold uppercase" style={{ color: "rgba(255,215,0,0.5)" }}>{label}</div>
                      <select value={val} onChange={e => setter(e.target.value)}
                        className="w-full rounded-lg px-3 py-2 text-xs font-mono outline-none"
                        style={{ background: "#111", border: "1px solid rgba(255,215,0,0.2)", color: GOLD }}>
                        <option value="">— Select version —</option>
                        {VERSIONS.map(v => (
                          <option key={v.version} value={v.version}>{v.version} · {v.codename}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>

            <CompareView vA={vA} vB={vB} />

            {(!compareA || !compareB) && (
              <div className="rounded-xl border p-8 text-center"
                style={{ background: CARD, borderColor: "rgba(255,215,0,0.1)" }}>
                <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(255,215,0,0.2)" }} />
                <p className="text-sm" style={{ color: "rgba(255,215,0,0.3)" }}>Select two versions above to see the delta comparison</p>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="rounded-xl border p-4 flex flex-wrap gap-4 text-[9px]"
          style={{ background: CARD, borderColor: "rgba(255,215,0,0.1)" }}>
          {Object.entries(STATUS_STYLE).map(([key, s]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              <span style={{ color: "rgba(255,215,0,0.5)" }}>{s.label}</span>
            </div>
          ))}
          <span className="ml-auto" style={{ color: "rgba(255,215,0,0.2)" }}>All records sealed · Append-only · JGA Enterprise</span>
        </div>

      </main>
    </div>
  );
}