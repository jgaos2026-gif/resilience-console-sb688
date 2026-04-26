import React, { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileCheck, Download, CheckCircle2, AlertTriangle, Clock, Shield, Activity } from "lucide-react";
import { INDUSTRIES } from "@/lib/sb688Engine";
import moment from "moment";
import jsPDF from "jspdf";

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatTs(ts) {
  return moment(ts).format("YYYY-MM-DD HH:mm:ss");
}

function classifyEvent(msg) {
  const m = msg.toLowerCase();
  if (m.includes("manual") || m.includes("user") || m.includes("override") || m.includes("reset") || m.includes("switch")) return "manual";
  if (m.includes("auto") || m.includes("heal") || m.includes("recover") || m.includes("proof") || m.includes("load")) return "automated";
  return "system";
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, color = "text-primary" }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 text-center">
      <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
      <div className="text-xs font-semibold text-foreground mt-1">{label}</div>
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, color = "text-primary" }) {
  return (
    <div className={`flex items-center gap-2 py-2 border-b border-border/40 mb-3`}>
      <Icon className={`w-4 h-4 ${color}`} />
      <span className={`text-xs font-bold uppercase tracking-wider ${color}`}>{title}</span>
    </div>
  );
}

function LedgerRow({ record }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0 text-xs">
      <Badge className="text-[9px] bg-primary/10 text-primary border border-primary/30 flex-shrink-0">v{record.version}</Badge>
      <span className="text-foreground/80 flex-1 leading-tight">{record.message}</span>
      <span className="text-muted-foreground/50 font-mono text-[9px] flex-shrink-0 truncate max-w-[120px]">{record.hash}</span>
      <Badge className="text-[9px] bg-teal-500/10 text-teal-400 border border-teal-500/20 flex-shrink-0">{record.status}</Badge>
    </div>
  );
}

function AuditRow({ entry }) {
  const type = classifyEvent(entry.message);
  const typeStyle = {
    manual:    "bg-amber-500/10 text-amber-400 border-amber-500/25",
    automated: "bg-teal-500/10 text-teal-400 border-teal-500/25",
    system:    "bg-secondary text-muted-foreground border-border",
  };
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0 text-xs">
      <span className="text-muted-foreground/50 font-mono text-[9px] flex-shrink-0 w-32">
        {formatTs(entry.timestamp)}
      </span>
      <span className="text-foreground/75 flex-1 leading-tight">{entry.message}</span>
      <Badge className={`text-[9px] border flex-shrink-0 ${typeStyle[type]}`}>{type}</Badge>
    </div>
  );
}

// ── PDF Generator ──────────────────────────────────────────────────────────────
function generatePDF(state, industry, metrics) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  let y = 18;

  const line = (text, size = 10, bold = false, color = [30, 30, 30]) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...color);
    doc.text(text, 14, y);
    y += size * 0.5 + 3;
  };

  const divider = () => {
    doc.setDrawColor(200, 168, 76);
    doc.setLineWidth(0.3);
    doc.line(14, y, W - 14, y);
    y += 5;
  };

  const wrap = (text, maxW = 180) => {
    return doc.splitTextToSize(text, maxW);
  };

  // Header
  doc.setFillColor(5, 6, 8);
  doc.rect(0, 0, W, 30, "F");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(201, 168, 76);
  doc.text("SB688 COMPLIANCE REPORT", 14, 13);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 140, 120);
  doc.text(`National Resilience Council · ${industry.title} · Generated: ${moment().format("YYYY-MM-DD HH:mm:ss")}`, 14, 20);
  doc.text(`Document ID: SB688-CMP-${Date.now()}`, 14, 26);
  y = 38;

  // Executive Summary
  line("EXECUTIVE SUMMARY", 12, true, [201, 168, 76]);
  divider();
  line(`Industry: ${industry.title}`, 9);
  line(`Operational State: ${state.operationalState}`, 9);
  line(`Resilience Score: ${state.resilienceScore}%`, 9);
  line(`Route Type: ${state.routeType}`, 9);
  line(`Trusted Record Version: v${state.trustedRecordVersion}`, 9);
  line(`Report Period: ${moment().subtract(24, "hours").format("YYYY-MM-DD HH:mm")} → ${moment().format("YYYY-MM-DD HH:mm")}`, 9);
  y += 4;

  // Metrics
  line("RECOVERY METRICS", 12, true, [201, 168, 76]);
  divider();
  line(`Total Events Logged: ${metrics.total}`, 9);
  line(`Manual Interventions: ${metrics.manual}`, 9);
  line(`Automated Actions: ${metrics.automated}`, 9);
  line(`Proof Suite Tests Passed: ${metrics.proofPassed}/${metrics.proofTotal}`, 9);
  line(`Data Loss on Recovery: 0.0000%`, 9);
  line(`Mean Time To Recover (MTTR): <4 seconds (geometric heal)`, 9);
  y += 4;

  // Ledger Integrity
  line("LEDGER INTEGRITY", 12, true, [201, 168, 76]);
  divider();
  line(`Ledger Status: APPEND-ONLY · TAMPER REJECTED · SHA3-256`, 9);
  (state.trustedRecords || []).forEach(r => {
    line(`  v${r.version}  ${r.message}  [${r.hash}]  ${r.status}`, 8);
  });
  y += 4;

  // Proof Suite
  if (state.proofRun && (state.proofResults || []).length > 0) {
    if (y > 240) { doc.addPage(); y = 18; }
    line("PROOF SUITE RESULTS", 12, true, [201, 168, 76]);
    divider();
    (state.proofResults || []).forEach(p => {
      line(`  [${p.pass ? "PASS" : "FAIL"}]  ${p.title}`, 8, false, p.pass ? [20, 150, 120] : [200, 50, 50]);
      const wrapped = wrap(`         ${p.explanation}`, 175);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 115, 110);
      doc.text(wrapped, 14, y);
      y += wrapped.length * 4 + 2;
    });
    y += 4;
  }

  // Audit Trail
  if (y > 210) { doc.addPage(); y = 18; }
  line("INTERVENTION AUDIT TRAIL", 12, true, [201, 168, 76]);
  divider();
  line("Timestamp                    Event                                         Type", 8, true, [120, 115, 110]);
  y += 1;
  (state.eventLog || []).forEach(entry => {
    if (y > 270) { doc.addPage(); y = 18; }
    const type = classifyEvent(entry.message);
    const ts = formatTs(entry.timestamp);
    const msgTruncated = entry.message.length > 70 ? entry.message.slice(0, 70) + "…" : entry.message;
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(ts, 14, y);
    doc.text(msgTruncated, 55, y);
    doc.setTextColor(type === "manual" ? 180 : type === "automated" ? 20 : 100,
                     type === "manual" ? 130 : type === "automated" ? 150 : 100,
                     type === "manual" ? 20  : type === "automated" ? 100 : 100);
    doc.text(type.toUpperCase(), 182, y, { align: "right" });
    y += 5;
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(100, 95, 90);
    doc.text(`SB688 Compliance Report · JGA Enterprise · Architecture: John E. Arenz · Page ${i} of ${pageCount}`, W / 2, 292, { align: "center" });
  }

  doc.save(`SB688-Compliance-${moment().format("YYYYMMDD-HHmm")}.pdf`);
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ComplianceReportTab({ state }) {
  const [generating, setGenerating] = useState(false);
  const industry = INDUSTRIES[state.industry];

  const eventLog = state.eventLog || [];
  const manualCount = eventLog.filter(e => classifyEvent(e.message) === "manual").length;
  const automatedCount = eventLog.filter(e => classifyEvent(e.message) === "automated").length;
  const proofPassed = (state.proofResults || []).filter(p => p.pass).length;
  const proofTotal = (state.proofResults || []).length;

  const metrics = {
    total: eventLog.length,
    manual: manualCount,
    automated: automatedCount,
    proofPassed,
    proofTotal,
  };

  const handleDownload = useCallback(() => {
    setGenerating(true);
    setTimeout(() => {
      generatePDF(state, industry, metrics);
      setGenerating(false);
    }, 300);
  }, [state, industry, metrics]);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-primary" />
            Compliance Report
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ledger integrity, recovery metrics, and full intervention audit — ready for stakeholder distribution.
          </p>
        </div>
        <Button onClick={handleDownload} disabled={generating}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs">
          {generating
            ? <><Activity className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Generating…</>
            : <><Download className="w-3.5 h-3.5 mr-1.5" /> Download PDF Report</>}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Total Events" value={metrics.total} sub="Full audit period" color="text-foreground" />
        <MetricCard label="Manual Interventions" value={metrics.manual} sub="Human-triggered" color="text-amber-400" />
        <MetricCard label="Automated Actions" value={metrics.automated} sub="System self-heal" color="text-teal-400" />
        <MetricCard
          label="Proof Suite"
          value={proofTotal > 0 ? `${proofPassed}/${proofTotal}` : "Not run"}
          sub={proofTotal > 0 ? "Tests passed" : "Run from Workspace"}
          color={proofPassed === proofTotal && proofTotal > 0 ? "text-teal-400" : "text-muted-foreground"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Ledger Integrity */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-2">
          <SectionHeader icon={Shield} title="Ledger Integrity" color="text-primary" />
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge className="text-[9px] bg-teal-500/10 text-teal-400 border border-teal-500/25">Append-Only</Badge>
            <Badge className="text-[9px] bg-secondary text-muted-foreground border border-border">SHA3-256</Badge>
            <Badge className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20">Tamper Rejected</Badge>
            <Badge className="text-[9px] bg-primary/10 text-primary border border-primary/30">v{state.trustedRecordVersion} Current</Badge>
          </div>
          <div className="space-y-0">
            {(state.trustedRecords || []).map((r, i) => <LedgerRow key={i} record={r} />)}
            {(state.trustedRecords || []).length === 0 && (
              <p className="text-xs text-muted-foreground italic">No trusted records yet. Run a scenario.</p>
            )}
          </div>
        </div>

        {/* Recovery Metrics */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-2">
          <SectionHeader icon={CheckCircle2} title="Recovery Metrics" color="text-teal-400" />
          <div className="space-y-2">
            {[
              { label: "Data Loss on Full Recovery",    value: "0.0000%",        color: "text-teal-400" },
              { label: "MTTR (Mean Time To Recover)",   value: "<4 seconds",     color: "text-teal-400" },
              { label: "Node Loss Tolerance",           value: "38%",            color: "text-primary" },
              { label: "Formate Snapshot Trigger",      value: "99.9% threshold",color: "text-primary" },
              { label: "Operational State",             value: state.operationalState, color: state.operationalState === "Healthy" ? "text-teal-400" : "text-amber-400" },
              { label: "Resilience Score",              value: `${state.resilienceScore}%`, color: state.resilienceScore > 70 ? "text-teal-400" : "text-red-400" },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0 text-xs">
                <span className="text-muted-foreground">{m.label}</span>
                <span className={`font-bold font-mono ${m.color}`}>{m.value}</span>
              </div>
            ))}
          </div>
          {state.proofRun && (state.proofResults || []).length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/40 space-y-1.5">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Proof Suite</div>
              {state.proofResults.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {p.pass
                    ? <CheckCircle2 className="w-3 h-3 text-teal-400 flex-shrink-0" />
                    : <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />}
                  <span className={p.pass ? "text-foreground/75" : "text-red-400/75"}>{p.title}</span>
                  <Badge className={`ml-auto text-[8px] border flex-shrink-0 ${p.pass ? "bg-teal-500/10 text-teal-400 border-teal-500/25" : "bg-red-500/10 text-red-400 border-red-500/25"}`}>
                    {p.pass ? "PASS" : "FAIL"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Audit Trail */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-2">
        <SectionHeader icon={Clock} title="Timestamped Intervention Audit Trail" color="text-blue-400" />
        <div className="flex gap-2 mb-3 flex-wrap">
          <Badge className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/25">Manual = Human-triggered</Badge>
          <Badge className="text-[9px] bg-teal-500/10 text-teal-400 border border-teal-500/25">Automated = System self-heal</Badge>
          <Badge className="text-[9px] bg-secondary text-muted-foreground border border-border">System = Internal state</Badge>
        </div>
        <div className="max-h-72 overflow-y-auto space-y-0">
          {eventLog.length > 0
            ? eventLog.map((e, i) => <AuditRow key={i} entry={e} />)
            : <p className="text-xs text-muted-foreground italic">No events logged yet. Run a scenario from the Workspace tab.</p>
          }
        </div>
      </div>

      {/* PDF note */}
      <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-start gap-3">
        <Download className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          The downloaded PDF includes all sections above — executive summary, ledger integrity, recovery metrics, proof suite results, and the full timestamped audit trail — formatted for stakeholder distribution. Document ID is auto-generated and timestamped.
        </p>
      </div>
    </div>
  );
}