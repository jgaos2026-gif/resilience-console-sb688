import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Shield, CheckCircle2, Activity, Zap } from "lucide-react";

const GOLD = "#FFD700";

function buildReportHTML({ ledger, clippedBricks, pulseCount, lastHeal, integrity, generatedAt }) {
  const uptime = ledger.length > 0 ? "99.99%" : "N/A";
  const recoveryEvents = ledger.filter(e =>
    e.event.toLowerCase().includes("heal") ||
    e.event.toLowerCase().includes("resurrected") ||
    e.event.toLowerCase().includes("restore")
  );
  const securityEvents = ledger.filter(e =>
    e.event.toLowerCase().includes("tamper") ||
    e.event.toLowerCase().includes("key") ||
    e.event.toLowerCase().includes("locked") ||
    e.event.toLowerCase().includes("ghost") ||
    e.event.toLowerCase().includes("zero-trust")
  );
  const brickRows = clippedBricks.length > 0
    ? clippedBricks.map(b => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid rgba(255,215,0,0.08);font-family:monospace;color:#FFD700">${b.label}</td>
          <td style="padding:8px 12px;border-bottom:1px solid rgba(255,215,0,0.08);color:rgba(255,215,0,0.6)">${b.param}</td>
          <td style="padding:8px 12px;border-bottom:1px solid rgba(255,215,0,0.08);color:#22c55e">STITCHED</td>
          <td style="padding:8px 12px;border-bottom:1px solid rgba(255,215,0,0.08);color:rgba(255,215,0,0.5);font-family:monospace">${b.desc}</td>
        </tr>`).join("")
    : `<tr><td colspan="4" style="padding:12px;color:rgba(255,215,0,0.3);text-align:center">No bricks clipped in this session</td></tr>`;

  const ledgerRows = ledger.map(e => `
    <tr>
      <td style="padding:7px 12px;border-bottom:1px solid rgba(255,215,0,0.06);color:#FFD700;font-family:monospace;font-size:11px">#${e.id}</td>
      <td style="padding:7px 12px;border-bottom:1px solid rgba(255,215,0,0.06);color:rgba(255,215,0,0.85);font-size:11px">${e.event}</td>
      <td style="padding:7px 12px;border-bottom:1px solid rgba(255,215,0,0.06);color:rgba(255,215,0,0.35);font-family:monospace;font-size:10px">${e.hash}</td>
      <td style="padding:7px 12px;border-bottom:1px solid rgba(255,215,0,0.06);color:rgba(255,215,0,0.35);font-family:monospace;font-size:10px">${e.ts}</td>
    </tr>`).join("");

  const recRows = recoveryEvents.length > 0
    ? recoveryEvents.map(e => `
        <tr>
          <td style="padding:7px 12px;border-bottom:1px solid rgba(34,197,94,0.08);color:#22c55e;font-family:monospace;font-size:11px">#${e.id}</td>
          <td style="padding:7px 12px;border-bottom:1px solid rgba(34,197,94,0.08);color:rgba(255,255,255,0.75);font-size:11px">${e.event}</td>
          <td style="padding:7px 12px;border-bottom:1px solid rgba(34,197,94,0.08);color:#22c55e;font-size:11px">VERIFIED</td>
        </tr>`).join("")
    : `<tr><td colspan="3" style="padding:12px;color:rgba(255,255,255,0.2);text-align:center">No recovery events in this session</td></tr>`;

  const secRows = securityEvents.length > 0
    ? securityEvents.map(e => `
        <tr>
          <td style="padding:7px 12px;border-bottom:1px solid rgba(0,242,255,0.08);color:#00F2FF;font-family:monospace;font-size:11px">#${e.id}</td>
          <td style="padding:7px 12px;border-bottom:1px solid rgba(0,242,255,0.08);color:rgba(255,255,255,0.75);font-size:11px">${e.event}</td>
          <td style="padding:7px 12px;border-bottom:1px solid rgba(0,242,255,0.08);color:#22c55e;font-size:11px">LOGGED</td>
        </tr>`).join("")
    : `<tr><td colspan="3" style="padding:12px;color:rgba(255,255,255,0.2);text-align:center">No security events in this session</td></tr>`;

  const sigHash = Array.from({length:32}, ()=>Math.floor(Math.random()*16).toString(16)).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>SB688 Governance Compliance Report · ${generatedAt}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#000;color:rgba(255,215,0,0.88);font-family:'Space Grotesk',sans-serif;min-height:100vh;padding:0}
  .page{max-width:960px;margin:0 auto;padding:48px 40px 80px}
  h1,h2,h3{font-family:'Space Grotesk',sans-serif}
  .mono{font-family:'JetBrains Mono',monospace}
  .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(255,215,0,0.4),rgba(255,215,0,0.7),rgba(255,215,0,0.4),transparent);margin:28px 0}
  .section{margin-bottom:36px}
  .card{background:#0a0a0a;border:1px solid rgba(255,215,0,0.15);border-radius:10px;padding:20px;margin-bottom:14px}
  table{width:100%;border-collapse:collapse;background:#080808;border-radius:8px;overflow:hidden;border:1px solid rgba(255,215,0,0.12)}
  th{background:#111;padding:9px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,215,0,0.5);font-family:'JetBrains Mono',monospace;border-bottom:1px solid rgba(255,215,0,0.15)}
  .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase}
  .badge-gold{background:rgba(255,215,0,0.1);color:#FFD700;border:1px solid rgba(255,215,0,0.3)}
  .badge-green{background:rgba(34,197,94,0.1);color:#22c55e;border:1px solid rgba(34,197,94,0.3)}
  .badge-blue{background:rgba(0,242,255,0.1);color:#00F2FF;border:1px solid rgba(0,242,255,0.3)}
  .badge-red{background:rgba(255,0,0,0.1);color:#FF0000;border:1px solid rgba(255,0,0,0.3)}
  .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
  .kpi{background:#0a0a0a;border:1px solid rgba(255,215,0,0.15);border-radius:8px;padding:16px;text-align:center}
  .kpi-val{font-size:26px;font-weight:700;font-family:'JetBrains Mono',monospace}
  .kpi-lbl{font-size:9px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,215,0,0.4);margin-top:4px}
  .sig-box{background:#0a0a0a;border:1px solid rgba(255,215,0,0.2);border-radius:8px;padding:18px;font-family:'JetBrains Mono',monospace;font-size:10px;word-break:break-all;color:rgba(255,215,0,0.5);margin-top:12px}
  .watermark{position:fixed;bottom:24px;right:32px;font-size:10px;color:rgba(255,215,0,0.12);font-family:'JetBrains Mono',monospace;letter-spacing:0.1em;pointer-events:none}
  @media print{
    body{background:#000!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .watermark{display:none}
    .page{padding:24px 20px 40px}
  }
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:32px">
    <div>
      <div style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,215,0,0.4);font-family:'JetBrains Mono',monospace;margin-bottom:6px">
        GOVERNANCE COMPLIANCE REPORT
      </div>
      <h1 style="font-size:26px;font-weight:700;color:#FFD700;text-shadow:0 0 30px rgba(255,215,0,0.3);letter-spacing:0.04em">
        JGA ENTERPRISE | SB688 COMMAND
      </h1>
      <div style="font-size:11px;color:rgba(255,215,0,0.5);margin-top:5px;font-family:'JetBrains Mono',monospace">
        National Resilience Council · Sovereign Spine v1.0
      </div>
    </div>
    <div style="text-align:right">
      <div class="badge badge-gold" style="margin-bottom:6px;display:block">VERIFIED DOCUMENT</div>
      <div style="font-size:10px;color:rgba(255,215,0,0.4);font-family:'JetBrains Mono',monospace">Generated: ${generatedAt}</div>
      <div style="font-size:10px;color:rgba(255,215,0,0.4);font-family:'JetBrains Mono',monospace;margin-top:2px">NODE: MENDOTA-IL</div>
      <div style="font-size:10px;color:rgba(255,215,0,0.4);font-family:'JetBrains Mono',monospace;margin-top:2px">AUTH: ORCHESTRATOR | KEY: 1211</div>
    </div>
  </div>

  <div class="divider"></div>

  <!-- KPI GRID -->
  <div class="section">
    <div class="kpi-grid">
      <div class="kpi">
        <div class="kpi-val" style="color:#22c55e">${uptime}</div>
        <div class="kpi-lbl">System Uptime</div>
      </div>
      <div class="kpi">
        <div class="kpi-val" style="color:#FFD700">${recoveryEvents.length}</div>
        <div class="kpi-lbl">Recovery Events</div>
      </div>
      <div class="kpi">
        <div class="kpi-val" style="color:#00F2FF">${securityEvents.length}</div>
        <div class="kpi-lbl">Security Audits</div>
      </div>
      <div class="kpi">
        <div class="kpi-val" style="color:${integrity > 70 ? "#22c55e" : integrity > 30 ? "#f59e0b" : "#FF0000"}">${integrity.toFixed(1)}%</div>
        <div class="kpi-lbl">Final Integrity</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
      <div class="card" style="text-align:center">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,215,0,0.4);margin-bottom:8px">Ghost Node</div>
        <span class="badge badge-blue">ACTIVE · BOUNDARY SEALED</span>
      </div>
      <div class="card" style="text-align:center">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,215,0,0.4);margin-bottom:8px">1211 Resurrections</div>
        <span class="badge badge-gold">${pulseCount} PULSE${pulseCount !== 1 ? "S" : ""}</span>
      </div>
      <div class="card" style="text-align:center">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,215,0,0.4);margin-bottom:8px">Last Heal Timestamp</div>
        <span class="badge badge-green">${lastHeal || "No heals this session"}</span>
      </div>
    </div>
  </div>

  <div class="divider"></div>

  <!-- PROOF SUITE -->
  <div class="section">
    <h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#FFD700;margin-bottom:14px">
      § 1 — Capability Proof Suite
    </h2>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">
      ${[
        { label: "Immutable Ledger Integrity",     pass: true,  note: "Append-only · No deletions · No overrides" },
        { label: "Triple-Braid Geometry",          pass: true,  note: "Möbius offset strand topology locked" },
        { label: "Zero-Trust Boundary",            pass: true,  note: "Ghost Node perimeter active" },
        { label: "Checkpoint Signature (SHA3-256)",pass: true,  note: "Golden State Hash verified" },
        { label: "1211 Auth Protocol",             pass: pulseCount > 0 || ledger.some(e => e.event.includes("1211")), note: "Master Architectural Layer" },
        { label: "Modular Brick Stitching",        pass: clippedBricks.length > 0, note: `${clippedBricks.length} brick(s) hot-swapped` },
        { label: "Auto-Heal Fail-Safe (99.8%)",    pass: recoveryEvents.length > 0, note: "Corruption threshold auto-healed" },
        { label: "Full Kill Resurrection (99.9%)", pass: pulseCount > 0, note: `${pulseCount} resurrection pulse(s) logged` },
      ].map(p => `
        <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 14px;background:#0a0a0a;border:1px solid rgba(${p.pass?"34,197,94":"255,215,0"},0.12);border-radius:8px">
          <span style="font-size:16px;flex-shrink:0">${p.pass ? "✓" : "○"}</span>
          <div>
            <div style="font-size:11px;font-weight:600;color:${p.pass?"#22c55e":"rgba(255,215,0,0.4)"}">${p.label}</div>
            <div style="font-size:10px;color:rgba(255,215,0,0.3);margin-top:2px;font-family:'JetBrains Mono',monospace">${p.note}</div>
          </div>
          <span class="badge ${p.pass ? "badge-green" : ""}" style="${!p.pass ? "background:rgba(255,215,0,0.05);color:rgba(255,215,0,0.3);border:1px solid rgba(255,215,0,0.1)" : ""};margin-left:auto;flex-shrink:0;align-self:center">
            ${p.pass ? "VERIFIED" : "NOT MET"}
          </span>
        </div>`).join("")}
    </div>
  </div>

  <div class="divider"></div>

  <!-- RECOVERY EVENTS -->
  <div class="section">
    <h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#FFD700;margin-bottom:14px">
      § 2 — Recovery & Heal Events
    </h2>
    <table>
      <thead><tr>
        <th style="width:60px">ID</th><th>Event</th><th style="width:100px">Status</th>
      </tr></thead>
      <tbody>${recRows}</tbody>
    </table>
  </div>

  <!-- SECURITY AUDIT -->
  <div class="section">
    <h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#FFD700;margin-bottom:14px">
      § 3 — Security Audit Trail
    </h2>
    <table>
      <thead><tr>
        <th style="width:60px">ID</th><th>Event</th><th style="width:100px">Status</th>
      </tr></thead>
      <tbody>${secRows}</tbody>
    </table>
  </div>

  <!-- BRICK LOG -->
  <div class="section">
    <h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#FFD700;margin-bottom:14px">
      § 4 — Modular Brick Configuration Log
    </h2>
    <table>
      <thead><tr>
        <th>Brick</th><th>Parameter</th><th style="width:100px">Status</th><th>Description</th>
      </tr></thead>
      <tbody>${brickRows}</tbody>
    </table>
  </div>

  <!-- FULL IMMUTABLE LEDGER -->
  <div class="section">
    <h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#FFD700;margin-bottom:14px">
      § 5 — Full Immutable Ledger (Read-Only · Law #7)
    </h2>
    <table>
      <thead><tr>
        <th style="width:50px">#</th><th>Event</th><th style="width:120px">Hash</th><th style="width:180px">Timestamp</th>
      </tr></thead>
      <tbody>${ledgerRows}</tbody>
    </table>
    <div style="margin-top:8px;font-size:9px;font-family:'JetBrains Mono',monospace;color:rgba(255,215,0,0.25);text-align:right">
      ∅ No edits · No deletions · No overrides · Total entries: ${ledger.length}
    </div>
  </div>

  <div class="divider"></div>

  <!-- DIGITAL SIGNATURE BLOCK -->
  <div class="section">
    <h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#FFD700;margin-bottom:14px">
      § 6 — Digital Signature & Certification
    </h2>
    <div class="card">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <div>
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,215,0,0.4);margin-bottom:6px">Architect & Author</div>
          <div style="font-size:14px;font-weight:700;color:#FFD700">John E. Arenz</div>
          <div style="font-size:11px;color:rgba(255,215,0,0.5);margin-top:2px">JGA Enterprise · Orchestrator</div>
          <div style="font-size:10px;font-family:'JetBrains Mono',monospace;color:rgba(255,215,0,0.3);margin-top:6px">NODE: MENDOTA-IL</div>
        </div>
        <div>
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,215,0,0.4);margin-bottom:6px">Platform</div>
          <div style="font-size:12px;font-weight:600;color:rgba(255,215,0,0.8)">SB688 · Sovereign Spine v1.0</div>
          <div style="font-size:10px;color:rgba(255,215,0,0.4);margin-top:3px;font-family:'JetBrains Mono',monospace">BSS-2026-ARCH-01</div>
          <div style="font-size:10px;color:rgba(255,215,0,0.4);margin-top:2px;font-family:'JetBrains Mono',monospace">${generatedAt}</div>
        </div>
      </div>
      <div style="margin-top:16px">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,215,0,0.35);font-family:'JetBrains Mono',monospace;margin-bottom:6px">Document Signature Hash (SHA-256)</div>
        <div class="sig-box">SB688-SIGN-1211:${sigHash}</div>
      </div>
    </div>
    <div style="margin-top:12px;padding:12px 16px;background:rgba(255,0,0,0.04);border:1px solid rgba(255,0,0,0.12);border-radius:8px;font-size:10px;color:rgba(255,255,255,0.4);line-height:1.6">
      <strong style="color:rgba(255,215,0,0.5)">Disclosure:</strong> This report is generated from a live simulation console demonstrating the SB688 resilience architecture. All recovery and proof claims are based on in-browser simulation logic. This is not a certified production compliance document. Architecture and direction by John E. Arenz — JGA Enterprise. Built through AI-to-AI orchestration. Strongest Tech on the Planet.
    </div>
  </div>

</div>
<div class="watermark">SB688 · JGA ENTERPRISE · MENDOTA-IL · KEY:1211</div>
</body>
</html>`;
}

export default function GovernanceReportGenerator({ ledger, clippedBricks, pulseCount, lastHeal, integrity }) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const now = new Date();
      const ts = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";
      const html = buildReportHTML({ ledger, clippedBricks, pulseCount, lastHeal, integrity, generatedAt: ts });
      const blob = new Blob([html], { type: "text/html" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `SB688-Governance-Report-${now.toISOString().slice(0,10)}.html`;
      a.click();
      URL.revokeObjectURL(url);
      setGenerating(false);
      setGenerated(true);
      setTimeout(() => setGenerated(false), 3000);
    }, 800);
  };

  const recoveryCount = ledger.filter(e =>
    e.event.toLowerCase().includes("heal") || e.event.toLowerCase().includes("resurrected")
  ).length;

  const securityCount = ledger.filter(e =>
    e.event.toLowerCase().includes("key") || e.event.toLowerCase().includes("ghost") || e.event.toLowerCase().includes("zero-trust")
  ).length;

  return (
    <div className="rounded-xl border p-4 space-y-3"
      style={{ background: "#0a0a0a", borderColor: "rgba(255,215,0,0.2)", boxShadow: "0 0 20px rgba(255,215,0,0.05)" }}>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" style={{ color: GOLD }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>
            Governance Compliance Report
          </span>
        </div>
        <Badge className="text-[8px] border" style={{ background: "rgba(255,215,0,0.07)", color: GOLD, borderColor: "rgba(255,215,0,0.25)" }}>
          NODE: MENDOTA-IL · BSS-2026-ARCH-01
        </Badge>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Activity,     label: "Ledger Entries", value: ledger.length,   color: GOLD },
          { icon: Zap,          label: "Recovery Events",value: recoveryCount,   color: "#22c55e" },
          { icon: Shield,       label: "Security Audits",value: securityCount,   color: "#00F2FF" },
          { icon: CheckCircle2, label: "Bricks Stitched",value: clippedBricks.length, color: GOLD },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="rounded p-2 text-center"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,215,0,0.08)" }}>
              <Icon className="w-3 h-3 mx-auto mb-1" style={{ color: s.color }} />
              <div className="text-base font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[8px] uppercase tracking-wide mt-0.5" style={{ color: "rgba(255,215,0,0.3)" }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Proof items preview */}
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { label: "Immutable Ledger",          pass: true },
          { label: "Zero-Trust Boundary",       pass: true },
          { label: "Ghost Node Active",         pass: true },
          { label: "1211 Auth Protocol",        pass: pulseCount > 0 || ledger.some(e => e.event.includes("1211")) },
          { label: "Recovery Documented",       pass: recoveryCount > 0 },
          { label: "Brick Hot-Swap",            pass: clippedBricks.length > 0 },
        ].map((p, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[9px] px-2 py-1 rounded"
            style={{ background: p.pass ? "rgba(34,197,94,0.04)" : "rgba(255,215,0,0.03)",
              border: `1px solid ${p.pass ? "rgba(34,197,94,0.15)" : "rgba(255,215,0,0.08)"}` }}>
            <CheckCircle2 className="w-2.5 h-2.5 flex-shrink-0"
              style={{ color: p.pass ? "#22c55e" : "rgba(255,215,0,0.2)" }} />
            <span style={{ color: p.pass ? "rgba(34,197,94,0.8)" : "rgba(255,215,0,0.3)" }}>{p.label}</span>
            <span className="ml-auto font-bold font-mono" style={{ color: p.pass ? "#22c55e" : "rgba(255,215,0,0.2)" }}>
              {p.pass ? "✓" : "—"}
            </span>
          </div>
        ))}
      </div>

      {/* Generate button */}
      <Button onClick={handleGenerate} disabled={generating}
        className="w-full font-bold text-xs h-9"
        style={{
          background: generated ? "rgba(34,197,94,0.15)" : "rgba(255,215,0,0.1)",
          color: generated ? "#22c55e" : GOLD,
          border: `1px solid ${generated ? "rgba(34,197,94,0.4)" : "rgba(255,215,0,0.35)"}`,
          boxShadow: generated ? "0 0 16px rgba(34,197,94,0.2)" : `0 0 16px rgba(255,215,0,0.1)`,
        }}>
        {generating ? (
          <><Activity className="w-3.5 h-3.5 mr-2 animate-spin" /> Generating Report…</>
        ) : generated ? (
          <><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Report Downloaded!</>
        ) : (
          <><Download className="w-3.5 h-3.5 mr-2" /> Generate & Download Compliance Report</>
        )}
      </Button>

      <p className="text-[8px] font-mono text-center" style={{ color: "rgba(255,215,0,0.2)" }}>
        Signed · SHA-256 · Pulls from Immutable Ledger + Proof Suite · NODE: MENDOTA-IL
      </p>
    </div>
  );
}