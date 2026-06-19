import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import IndustryApplications from "@/components/jga/IndustryApplications";

const GOLD = "#C9A84C";

const SECTORS = [
  {
    id: "spacex",
    icon: "🚀",
    label: "SpaceX / Aerospace",
    color: "#7c3aed",
    tagline: "Mission-critical autonomous recovery",
    without: [
      { risk: "Node failure mid-flight", impact: "Manual ground override required", severity: "critical" },
      { risk: "Telemetry drift undetected", impact: "Stage separation on bad data", severity: "critical" },
      { risk: "No rollback capability", impact: "Mission abort or loss of vehicle", severity: "critical" },
      { risk: "Single-point trust model", impact: "One compromised node = system failure", severity: "high" },
    ],
    with: [
      { feature: "Phoenix Auto-Recovery", result: "Sub-100ms rollback to certified checkpoint, no ground auth needed", gain: "100% autonomous" },
      { feature: "Triple-Gate Certification", result: "Every actuator command verified → validated → certified before execution", gain: "Zero unverified commands" },
      { feature: "Node Quarantine", result: "Drifting node self-isolates, mesh continues on remaining certified nodes", gain: "No cascade failure" },
      { feature: "Hash-Chain Telemetry", result: "Every sensor reading cryptographically chained — tamper-evident post-mission review", gain: "Court-grade audit trail" },
    ],
    metrics: [
      { label: "Recovery Time", before: "Minutes (human)", after: "<100ms (autonomous)", delta: "99.9% faster" },
      { label: "Failure Detection", before: "Ground crew review", after: "Real-time node drift", delta: "Instant" },
      { label: "Command Trust", before: "Single auth layer", after: "Triple-certified", delta: "3x verification" },
      { label: "Audit Coverage", before: "Post-mission logs", after: "Live hash-chain", delta: "100% provable" },
    ],
  },
  {
    id: "national_security",
    icon: "🛡️",
    label: "National Security / DoD",
    color: "#dc2626",
    tagline: "Zero-trust sovereign command architecture",
    without: [
      { risk: "Insider threat on classified network", impact: "Lateral movement undetected for days/weeks", severity: "critical" },
      { risk: "Memory injection attacks", impact: "Malicious code in active runtime", severity: "critical" },
      { risk: "Single-auth command execution", impact: "One credential compromise = full access", severity: "critical" },
      { risk: "No behavioral baseline per node", impact: "Anomalous activity invisible until damage done", severity: "high" },
    ],
    with: [
      { feature: "Behavioral Baseline Fingerprinting", result: "Every node has a certified runtime signature — deviation triggers instant quarantine", gain: "Insider threat detected in ms" },
      { feature: "RAM Guard", result: "Blocks all memory injection attempts at OS level before execution", gain: "Zero memory exploits" },
      { feature: "Tri-Mark Command Chain", result: "No command executes without Verify→Validate→Certify — single compromise insufficient", gain: "3-layer command defense" },
      { feature: "Forensic Snapshot on Quarantine", result: "Full node state captured at moment of anomaly — court-ready evidence immediately", gain: "Instant forensic capture" },
    ],
    metrics: [
      { label: "Threat Detection Speed", before: "Days (SIEM review)", after: "Milliseconds (node drift)", delta: "Millions x faster" },
      { label: "Memory Attack Surface", before: "Full runtime exposed", after: "RAM Guard enforced", delta: "Near-zero" },
      { label: "Command Auth Layers", before: "1 (credential)", after: "3 (tri-mark)", delta: "3x harder to breach" },
      { label: "Forensic Readiness", before: "Post-incident reconstruction", after: "Live snapshot at quarantine", delta: "Immediate" },
    ],
  },
  {
    id: "fintech",
    icon: "🏦",
    label: "FinTech / Banking",
    color: "#16a34a",
    tagline: "Triple-verified ledger with rollback defense",
    without: [
      { risk: "Fraud attempt reaches settlement", impact: "Funds moved before detection", severity: "critical" },
      { risk: "Ledger state manipulation", impact: "Balance discrepancy, regulatory violation", severity: "critical" },
      { risk: "No rollback on failed transaction", impact: "Partial writes create corrupt state", severity: "high" },
      { risk: "Manual SOX/PCI audit trail assembly", impact: "Weeks of reconciliation, human error risk", severity: "high" },
    ],
    with: [
      { feature: "Real-Time Fraud Quarantine", result: "Transaction node flagged and isolated before reaching settlement layer", gain: "Pre-settlement protection" },
      { feature: "Rollback-Capable Ledger", result: "Any failed or corrupted transaction rolls back to last certified balance state", gain: "Zero corrupt-state risk" },
      { feature: "Triple-Gate Payment Pipeline", result: "No payment trusted without three independent verification marks", gain: "3x fraud gate" },
      { feature: "Auto Audit Export", result: "SOX/PCI-DSS proof records generated continuously — no manual assembly", gain: "Instant regulatory proof" },
    ],
    metrics: [
      { label: "Fraud Detection Point", before: "Post-settlement", after: "Pre-settlement (quarantine)", delta: "Before money moves" },
      { label: "Ledger Integrity", before: "Periodic reconciliation", after: "Continuous hash-chain", delta: "Always provable" },
      { label: "Audit Prep Time", before: "Weeks manual", after: "On-demand export", delta: "~100% reduction" },
      { label: "Payment Auth Layers", before: "1-2 checks", after: "3 certified gates", delta: "3x stronger" },
    ],
  },
  {
    id: "healthcare",
    icon: "🏥",
    label: "Healthcare / Hospital",
    color: "#0891b2",
    tagline: "Certified-before-treatment patient data integrity",
    without: [
      { risk: "Incorrect dosing data propagates", impact: "Patient harm from unverified data", severity: "critical" },
      { risk: "EHR record tampered silently", impact: "Treatment decision on wrong history", severity: "critical" },
      { risk: "HIPAA breach undetected", impact: "Regulatory fine, patient exposure", severity: "high" },
      { risk: "No adverse event reconstruction", impact: "FDA review impossible without complete trail", severity: "high" },
    ],
    with: [
      { feature: "Dosing Node Certification", result: "No medication dispensing command executes without tri-mark sign-off", gain: "Zero uncertified dosing" },
      { feature: "EHR Hash-Lock on Intake", result: "Patient records cryptographically locked on entry — any modification flagged", gain: "Tamper-evident records" },
      { feature: "HIPAA Append-Only Log", result: "Every access and change permanently logged — deletion impossible by design", gain: "Full HIPAA compliance" },
      { feature: "Adverse Event Rollback", result: "Pre-modification state preserved — full reconstruction for FDA audit", gain: "21 CFR Part 11 ready" },
    ],
    metrics: [
      { label: "Dosing Error Prevention", before: "Manual double-check", after: "3-gate certification", delta: "Systematic, not human" },
      { label: "Record Tamper Detection", before: "Periodic audit", after: "Real-time hash alert", delta: "Instant detection" },
      { label: "HIPAA Audit Readiness", before: "Manual log assembly", after: "Continuous proof log", delta: "Always ready" },
      { label: "FDA Reconstruction", before: "Partial record recovery", after: "Full rollback available", delta: "100% traceable" },
    ],
  },
  {
    id: "deepspace",
    icon: "🌌",
    label: "Deep Space / NASA",
    color: "#0ea5e9",
    tagline: "Fully autonomous — no Earth uplink required",
    without: [
      { risk: "20+ min comms lag to Earth", impact: "No human can intervene in real time", severity: "critical" },
      { risk: "Life support node failure", impact: "Crew at risk while awaiting ground response", severity: "critical" },
      { risk: "Radiation-induced memory corruption", impact: "Silent data corruption in nav or power nodes", severity: "critical" },
      { risk: "No autonomous recovery loop", impact: "Single failure cascades without intervention", severity: "critical" },
    ],
    with: [
      { feature: "Fully Autonomous Sovereign Loop", result: "Möbius-surface verification loop runs indefinitely with zero Earth dependency", gain: "100% self-sufficient" },
      { feature: "Life Support Node Mesh", result: "Continuous verification of O2, pressure, power nodes — self-healing on deviation", gain: "Crew safety, autonomous" },
      { feature: "RAM Guard (Radiation-Hardened)", result: "Memory injection protection designed for radiation-exposed environments", gain: "Space-grade protection" },
      { feature: "Retrospective Proof Verification", result: "Hash-chain proof generated locally — verifiable on Earth after any comms blackout", gain: "Truth survives lag" },
    ],
    metrics: [
      { label: "Earth Dependency for Recovery", before: "100% (human uplink)", after: "0% (autonomous loop)", delta: "Fully independent" },
      { label: "Comms Blackout Resilience", before: "System degraded/failed", after: "Continues self-healing", delta: "No impact" },
      { label: "Memory Corruption Response", before: "Undetected until review", after: "Real-time RAM Guard", delta: "Caught immediately" },
      { label: "Post-Mission Auditability", before: "Partial telemetry", after: "Full hash-chain proof", delta: "100% provable" },
    ],
  },
  {
    id: "law",
    icon: "⚖️",
    label: "Law Enforcement / Justice",
    color: "#d97706",
    tagline: "Court-admissible chain of custody by design",
    without: [
      { risk: "Evidence tampered post-intake", impact: "Case dismissed, officer liability", severity: "critical" },
      { risk: "Body cam footage chain broken", impact: "Inadmissible in court", severity: "critical" },
      { risk: "Case file access unlogged", impact: "No accountability for data exposure", severity: "high" },
      { risk: "Manual custody transfer records", impact: "Human error, lost evidence, legal risk", severity: "high" },
    ],
    with: [
      { feature: "SHA-256 Evidence Hash on Intake", result: "Every piece of evidence cryptographically fingerprinted the moment it enters the system", gain: "Tamper-proof from intake" },
      { feature: "Append-Only Access Log", result: "Every view, download, or transfer permanently recorded — deletion impossible", gain: "Full accountability" },
      { feature: "Tamper Alert on Modification", result: "Any attempt to alter evidence triggers instant alert and quarantine of modified node", gain: "Real-time tamper detection" },
      { feature: "Auto Chain-of-Custody Records", result: "Every custody transfer cryptographically signed and logged — court-ready instantly", gain: "CJIS / FRE 901 aligned" },
    ],
    metrics: [
      { label: "Evidence Integrity", before: "Assumed (manual)", after: "Cryptographically proven", delta: "Unbreakable chain" },
      { label: "Tamper Detection", before: "Discovery in court", after: "Real-time alert", delta: "Before damage done" },
      { label: "Access Accountability", before: "Partial logs", after: "100% append-only", delta: "Full coverage" },
      { label: "Court Prep Time", before: "Manual assembly", after: "Auto-generated proof", delta: "Minutes not weeks" },
    ],
  },
];

const SEVERITY_STYLE = {
  critical: { bg: "rgba(239,68,68,0.08)", color: "#f87171", border: "rgba(239,68,68,0.25)", label: "CRITICAL" },
  high:     { bg: "rgba(251,191,36,0.08)", color: "#fbbf24", border: "rgba(251,191,36,0.25)", label: "HIGH" },
};

function ComparisonTable({ sector }) {
  return (
    <div className="space-y-4">
      {/* Without vs With */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* WITHOUT */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
          <div className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest"
            style={{ background: "rgba(239,68,68,0.06)", color: "#f87171", borderBottom: "1px solid rgba(239,68,68,0.15)" }}>
            ✗ Without SB688 — Exposure & Risk
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {sector.without.map((row, i) => {
              const s = SEVERITY_STYLE[row.severity];
              return (
                <div key={i} className="px-4 py-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-semibold text-foreground">{row.risk}</span>
                    <span className="text-[7px] font-black px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground">{row.impact}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* WITH */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "rgba(74,222,128,0.2)" }}>
          <div className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest"
            style={{ background: "rgba(74,222,128,0.06)", color: "#4ade80", borderBottom: "1px solid rgba(74,222,128,0.15)" }}>
            ♛ With SB688 — Protection & Proof
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {sector.with.map((row, i) => (
              <div key={i} className="px-4 py-3 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-semibold" style={{ color: sector.color }}>{row.feature}</span>
                  <span className="text-[7px] font-black px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{ background: `${sector.color}10`, color: sector.color, border: `1px solid ${sector.color}30` }}>
                    {row.gain}
                  </span>
                </div>
                <p className="text-[9px] text-muted-foreground">{row.result}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: `${sector.color}20` }}>
        <div className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest"
          style={{ background: `${sector.color}06`, color: sector.color, borderBottom: `1px solid ${sector.color}15` }}>
          ◈ Impact Metrics — Before vs After
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {sector.metrics.map((m, i) => (
            <div key={i} className="p-3 space-y-2">
              <p className="text-[8px] uppercase tracking-wider text-muted-foreground font-bold">{m.label}</p>
              <div className="text-[9px] text-muted-foreground line-through">{m.before}</div>
              <div className="text-[10px] font-semibold" style={{ color: sector.color }}>{m.after}</div>
              <div className="text-[8px] font-black px-1.5 py-0.5 rounded inline-block"
                style={{ background: `${sector.color}12`, color: sector.color }}>
                {m.delta}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function IndustryImpact() {
  const [active, setActive] = useState("spacex");
  const sector = SECTORS.find(s => s.id === active);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-[9px] tracking-[0.4em] uppercase text-muted-foreground">SB688 Sovereign Stitch Protocol</p>
        <h1 className="text-xl font-bold font-cinzel" style={{ color: GOLD }}>Industry Impact Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Real comparison tables — exposure without SB688 vs. verified protection with it — across 6 high-stakes sectors.
        </p>
      </div>

      {/* Sector Selector — scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {SECTORS.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wide transition-all"
            style={active === s.id
              ? { background: `${s.color}15`, color: s.color, borderColor: `${s.color}50`, boxShadow: `0 0 12px ${s.color}15` }
              : { background: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.35)", borderColor: "rgba(255,255,255,0.08)" }}>
            <span className="text-base leading-none">{s.icon}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Active Sector Header */}
      {sector && (
        <div className="rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between"
          style={{ background: `${sector.color}06`, borderColor: `${sector.color}30` }}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{sector.icon}</span>
            <div>
              <h2 className="text-sm font-black font-cinzel" style={{ color: sector.color }}>{sector.label}</h2>
              <p className="text-[10px] text-muted-foreground">{sector.tagline}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge className="text-[8px] border font-bold"
              style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", borderColor: "rgba(239,68,68,0.25)" }}>
              {sector.without.filter(r => r.severity === "critical").length} Critical Risks Without SB688
            </Badge>
            <Badge className="text-[8px] border font-bold"
              style={{ background: "rgba(74,222,128,0.08)", color: "#4ade80", borderColor: "rgba(74,222,128,0.25)" }}>
              {sector.with.length} Verified Protections With SB688
            </Badge>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {sector && <ComparisonTable sector={sector} />}

      {/* All Industries Level Toggle Section */}
      <div className="pt-2">
        <IndustryApplications />
      </div>
    </div>
  );
}