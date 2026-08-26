import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Shield, Database, Archive, Zap, ChevronDown, ChevronUp } from "lucide-react";

const GOLD = "#C9A84C";
const DIAMOND = "#a5f3fc"; // cyan-200

const LIVE_DATA = {
  self_heal: {
    status: "SELF_HEAL_COMPLETE",
    time: "2026-06-19T00:00:03.332422",
    rule: "NO ACTIVE STATE BECOMES TRUSTED STATE WITHOUT VERIFICATION, VALIDATION, AND CERTIFICATION THREE TIMES MARKED.",
  },
  proof: {
    system: "DIAMOND_HUNTER_CORE",
    time: "2026-06-18T23:05:29.056045",
    reports: {
      self_heal_report: { status: "SELF_HEAL_COMPLETE", fixed: [], time: "2026-06-18T23:05:28.991086" },
      ghost_report: {
        status: "GHOST_CREATED",
        snapshot: "C:\\JGA\\DIAMOND_HUNTER_CORE\\GHOST_SNAPSHOTS\\ghost_20260618_230528",
        copied: [
          "SPINE\\spine_manifest.json",
          "ledgers\\hunter_ledger.jsonl",
          "reports\\self_heal_report.json",
        ],
      },
      phoenix_report: "MISSING",
      ledger_verify: { status: "CHAIN_OK", time: "2026-06-18T23:05:29.000083" },
      pocket_status: { pockets: [{ pocket: "core_seed", status: "PRESENT" }] },
      quarantine_status: { count: 0, items: [] },
    },
  },
  doctor: {
    time: "2026-06-18T23:05:29.058044",
    checks: {
      "SPINE\\spine_manifest.json": "OK",
      "SILENCE_MESH\\silence_node_01.json": "OK",
      "DIAMOND_CAGE\\diamond_node_01.json": "OK",
      "ledgers\\hunter_ledger.jsonl": "OK",
    },
  },
  ledger: { time: "2026-06-19T00:00:02.270372", status: "CHAIN_OK", entries: 479, errors: [] },
  pockets: { time: "2026-06-19T00:00:04.189405", pockets: [{ pocket: "core_seed", status: "CORRUPTED" }] },
  quarantine: { time: "2026-06-18T23:59:48.777788", count: 0, items: [] },
};

function ts(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function StatusPill({ status }) {
  const map = {
    OK: { bg: "rgba(34,197,94,0.12)", color: "#4ade80", border: "rgba(34,197,94,0.3)" },
    SELF_HEAL_COMPLETE: { bg: "rgba(34,197,94,0.12)", color: "#4ade80", border: "rgba(34,197,94,0.3)" },
    CHAIN_OK: { bg: "rgba(34,197,94,0.12)", color: "#4ade80", border: "rgba(34,197,94,0.3)" },
    GHOST_CREATED: { bg: "rgba(139,92,246,0.12)", color: "#a78bfa", border: "rgba(139,92,246,0.3)" },
    PRESENT: { bg: "rgba(96,165,250,0.12)", color: "#60a5fa", border: "rgba(96,165,250,0.3)" },
    CORRUPTED: { bg: "rgba(239,68,68,0.12)", color: "#f87171", border: "rgba(239,68,68,0.4)" },
    MISSING: { bg: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "rgba(251,191,36,0.3)" },
  };
  const s = map[status] || { bg: "rgba(148,163,184,0.1)", color: "#94a3b8", border: "rgba(148,163,184,0.2)" };
  return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded border font-mono" style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {status}
    </span>
  );
}

function SectionCard({ title, icon: Icon, iconColor, children }) {
  return (
    <div className="rounded-xl border border-border p-5 space-y-3" style={{ background: "hsl(220,18%,7%)" }}>
      <div className="flex items-center gap-2 pb-2 border-b border-border/40">
        <Icon className="w-4 h-4" style={{ color: iconColor || GOLD }} />
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider" style={{ color: iconColor || GOLD }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function DiamondHunterCore() {
  const [rawOpen, setRawOpen] = useState(false);
  const d = LIVE_DATA;
  const pocketCorrupted = d.pockets.pockets.some(p => p.status === "CORRUPTED");

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="rounded-2xl border-2 p-6 sm:p-8 space-y-3" style={{ borderColor: "rgba(165,243,252,0.25)", background: "linear-gradient(135deg, hsl(220,22%,5%) 0%, hsl(200,20%,7%) 100%)" }}>
        <div className="flex items-center gap-3 flex-wrap">
          <Badge className="text-[10px] px-3 py-1 font-bold border font-mono" style={{ background: "rgba(165,243,252,0.08)", color: DIAMOND, borderColor: "rgba(165,243,252,0.25)" }}>
            ◆ DIAMOND HUNTER CORE
          </Badge>
          <Badge className="text-[10px] px-2 py-1 font-bold border" style={{ background: "rgba(139,92,246,0.1)", color: "#a78bfa", borderColor: "rgba(139,92,246,0.25)" }}>
            SILENCE MESH ONLINE
          </Badge>
          <Badge className="text-[10px] px-2 py-1 font-bold border" style={{ background: "rgba(34,197,94,0.08)", color: "#4ade80", borderColor: "rgba(34,197,94,0.25)" }}>
            DIAMOND-CAGED
          </Badge>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight" style={{ color: DIAMOND }}>
          DIAMOND_HUNTER_CORE
        </h1>
        <p className="text-[10px] font-mono leading-relaxed" style={{ color: "rgba(165,243,252,0.5)" }}>
          {d.self_heal.rule}
        </p>
      </div>

      {/* Pocket Warning — prominent alert */}
      {pocketCorrupted && (
        <div className="rounded-xl border-2 p-4 flex items-center gap-3" style={{ borderColor: "rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.06)" }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <div>
            <p className="text-xs font-bold text-red-400">POCKET CORRUPTION DETECTED — core_seed</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">The core_seed pocket is reporting CORRUPTED status. Self-heal was triggered and completed. Phoenix report is MISSING — manual review recommended.</p>
          </div>
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Self Heal", value: "COMPLETE", color: "#4ade80" },
          { label: "Ledger Entries", value: d.ledger.entries, color: DIAMOND },
          { label: "Ledger Chain", value: d.ledger.status, color: "#4ade80" },
          { label: "Quarantine Items", value: d.quarantine.count, color: d.quarantine.count === 0 ? "#4ade80" : "#f87171" },
        ].map((k, i) => (
          <div key={i} className="rounded-xl border border-border p-4 text-center" style={{ background: "hsl(220,18%,7%)" }}>
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">{k.label}</div>
            <div className="text-lg font-bold font-mono" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Self Heal */}
        <SectionCard title="Self Heal Report" icon={Zap} iconColor="#4ade80">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <StatusPill status={d.self_heal.status} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Time</span>
              <span className="font-mono text-foreground">{ts(d.self_heal.time)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Fixed Issues</span>
              <span className="font-mono" style={{ color: "#4ade80" }}>0 (clean)</span>
            </div>
          </div>
        </SectionCard>

        {/* Ledger */}
        <SectionCard title="Hunter Ledger" icon={Database} iconColor={DIAMOND}>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Chain Status</span>
              <StatusPill status={d.ledger.status} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Entries</span>
              <span className="font-mono font-bold" style={{ color: DIAMOND }}>{d.ledger.entries}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Errors</span>
              <span className="font-mono" style={{ color: "#4ade80" }}>0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Verified At</span>
              <span className="font-mono text-foreground">{ts(d.ledger.time)}</span>
            </div>
          </div>
        </SectionCard>

        {/* Doctor Checks */}
        <SectionCard title="System Doctor" icon={Shield} iconColor={GOLD}>
          <div className="space-y-1.5">
            {Object.entries(d.doctor.checks).map(([path, status]) => (
              <div key={path} className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-muted-foreground truncate">{path}</span>
                <StatusPill status={status} />
              </div>
            ))}
            <div className="text-[9px] text-muted-foreground mt-1 pt-2 border-t border-border/30">{ts(d.doctor.time)}</div>
          </div>
        </SectionCard>

        {/* Memory Pockets */}
        <SectionCard title="Memory Pockets" icon={Archive} iconColor={pocketCorrupted ? "#f87171" : "#60a5fa"}>
          <div className="space-y-2">
            {d.pockets.pockets.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{ background: "rgba(0,0,0,0.2)" }}>
                <span className="text-xs font-mono text-foreground">{p.pocket}</span>
                <StatusPill status={p.status} />
              </div>
            ))}
            {pocketCorrupted && (
              <div className="text-[10px] text-red-400 pt-1">
                ⚠ Ghost snapshot captured before corruption. Phoenix report missing — verify manually.
              </div>
            )}
            <div className="text-[9px] text-muted-foreground pt-1 border-t border-border/30">{ts(d.pockets.time)}</div>
          </div>
        </SectionCard>

      </div>

      {/* Proof Reports Row */}
      <SectionCard title="Proof Reports — Full Cycle" icon={CheckCircle2} iconColor="#a78bfa">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "self_heal_report.json", status: d.proof.reports.self_heal_report.status, sub: ts(d.proof.reports.self_heal_report.time) },
            { label: "ghost_report.json", status: d.proof.reports.ghost_report.status, sub: d.proof.reports.ghost_report.snapshot?.split("\\").pop() },
            { label: "phoenix_report.json", status: "MISSING", sub: "Not generated this cycle" },
            { label: "ledger_verify.json", status: d.proof.reports.ledger_verify.status, sub: ts(d.proof.reports.ledger_verify.time) },
            { label: "pocket_status.json", status: d.proof.reports.pocket_status.pockets[0].status, sub: "core_seed — at proof time" },
            { label: "quarantine_status.json", status: d.proof.reports.quarantine_status.count === 0 ? "OK" : "ITEMS_FOUND", sub: `${d.proof.reports.quarantine_status.count} items` },
          ].map((r, i) => (
            <div key={i} className="rounded-lg p-3 space-y-1" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="text-[9px] font-mono text-muted-foreground truncate">{r.label}</div>
              <StatusPill status={r.status} />
              <div className="text-[9px] text-muted-foreground">{r.sub}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Ghost Snapshot */}
      <SectionCard title="Ghost Snapshot — Captured" icon={Shield} iconColor="#a78bfa">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Snapshot ID</span>
            <span className="font-mono text-foreground">ghost_20260618_230528</span>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Files Copied</div>
            <div className="space-y-1">
              {LIVE_DATA.proof.reports.ghost_report.copied.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-green-400" />
                  <span className="font-mono text-[10px] text-muted-foreground">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Raw JSON toggle */}
      <div>
        <button onClick={() => setRawOpen(v => !v)} className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground hover:text-foreground transition mb-2">
          {rawOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {rawOpen ? "Hide" : "View"} Raw Proof JSON
        </button>
        {rawOpen && (
          <pre className="rounded-xl border border-border p-4 text-[9px] font-mono text-muted-foreground overflow-x-auto leading-relaxed" style={{ background: "hsl(220,20%,5%)" }}>
            {JSON.stringify(LIVE_DATA, null, 2)}
          </pre>
        )}
      </div>

    </div>
  );
}