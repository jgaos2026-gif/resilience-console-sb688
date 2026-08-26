import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";

const GOLD = "#C9A84C";

function buildPDF(coreState) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const now = new Date();

  // ── Helpers ────────────────────────────────────────────────────────────
  const line  = (y) => { doc.setDrawColor(180, 140, 60); doc.setLineWidth(0.3); doc.line(14, y, W - 14, y); };
  const title = (text, y, size = 11) => {
    doc.setFontSize(size);
    doc.setTextColor(180, 140, 60);
    doc.setFont("helvetica", "bold");
    doc.text(text, 14, y);
  };
  const body  = (text, y, color = [190, 175, 140]) => {
    doc.setFontSize(8.5);
    doc.setTextColor(...color);
    doc.setFont("helvetica", "normal");
    doc.text(text, 14, y);
  };
  const kv = (label, value, y, labelColor = [140, 110, 50], valColor = [200, 185, 145]) => {
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...labelColor);
    doc.text(label + ":", 14, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...valColor);
    doc.text(String(value), 65, y);
  };

  // ── Cover ──────────────────────────────────────────────────────────────
  // Black header bar
  doc.setFillColor(10, 12, 20);
  doc.rect(0, 0, W, 52, "F");

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(201, 168, 76);
  doc.text("JGA RESILIENCE COUNCIL", W / 2, 18, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(160, 140, 90);
  doc.text("System Integrity & Manual Intervention Audit Report", W / 2, 26, { align: "center" });

  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.5);
  doc.line(14, 31, W - 14, 31);

  doc.setFontSize(8);
  doc.setTextColor(120, 100, 60);
  doc.text(`Generated: ${now.toLocaleString("en-US", { timeZone: "America/Chicago" })} CT`, W / 2, 38, { align: "center" });
  doc.text(`Report ID: RC-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}-${String(now.getHours()).padStart(2,"0")}${String(now.getMinutes()).padStart(2,"0")}`, W / 2, 44, { align: "center" });

  let y = 62;

  // ── Section 1: System Integrity Stats ─────────────────────────────────
  title("1. SYSTEM INTEGRITY STATISTICS", y); y += 6;
  line(y); y += 5;

  kv("Spine Status",         coreState.spineStatus,                               y); y += 6;
  kv("Braid Health",         `${coreState.braidHealth}%`,                         y); y += 6;
  kv("Drift Score",          coreState.driftScore,                                y); y += 6;
  kv("System Locked",        coreState.systemLocked ? "YES — Lockdown Active" : "No", y); y += 6;
  kv("Ledger Version",       `v${coreState.ledgerVersion}`,                       y); y += 6;
  kv("Ledger Hash",          coreState.ledgerHash,                                y); y += 6;
  kv("No-Delete Violations", coreState.noDeleteViolations,                        y); y += 6;
  kv("OMEGA-72 Active",      coreState.omega72Active ? "YES" : "No",              y); y += 6;
  kv("SB712 Active",         coreState.sb712Active   ? "YES" : "No",              y); y += 6;
  kv("Stitch-Brick Mode",    coreState.stitchBrickMode,                           y); y += 6;
  kv("Last Doctor Run",      coreState.lastDoctorRun ? new Date(coreState.lastDoctorRun).toLocaleString() : "Not run", y); y += 6;

  y += 4; line(y); y += 8;

  // ── Section 2: Ledger Chain ────────────────────────────────────────────
  title("2. IMMUTABLE LEDGER CHAIN", y); y += 6;
  line(y); y += 5;

  if (coreState.ledgerChain.length === 0) {
    body("No ledger entries recorded.", y); y += 6;
  } else {
    coreState.ledgerChain.forEach((entry, i) => {
      if (y > 265) { doc.addPage(); y = 20; }
      body(`[v${entry.v}] ${entry.label}`, y, [180, 165, 120]); y += 4.5;
      body(`     Hash: ${entry.hash}`, y, [120, 105, 70]); y += 4.5;
      body(`     Time: ${new Date(entry.ts).toLocaleString()}`, y, [100, 88, 55]); y += 5;
    });
  }

  y += 4; line(y); y += 8;

  // ── Section 3: Snapshot Vault ──────────────────────────────────────────
  if (y > 240) { doc.addPage(); y = 20; }
  title("3. SNAPSHOT VAULT", y); y += 6;
  line(y); y += 5;

  if (coreState.snapshotVault.length === 0) {
    body("No snapshots captured in this session.", y); y += 6;
  } else {
    coreState.snapshotVault.forEach((snap, i) => {
      if (y > 265) { doc.addPage(); y = 20; }
      body(`[${i+1}] ${snap.label || `Snapshot #${i+1}`} — ${snap.ts ? new Date(snap.ts).toLocaleString() : "—"}`, y, [180, 165, 120]); y += 4.5;
      if (snap.hash) { body(`     Hash: ${snap.hash}`, y, [120, 105, 70]); y += 4.5; }
    });
  }

  y += 4; line(y); y += 8;

  // ── Section 4: Self-Heal Log (Manual Interventions) ───────────────────
  if (y > 230) { doc.addPage(); y = 20; }
  title("4. MANUAL INTERVENTION AUDIT LOG", y); y += 6;
  line(y); y += 5;

  if (coreState.selfHealLog.length === 0) {
    body("No manual interventions or self-heal events recorded in this session.", y); y += 6;
  } else {
    coreState.selfHealLog.forEach((entry, i) => {
      if (y > 265) { doc.addPage(); y = 20; }
      const text = typeof entry === "string" ? entry : JSON.stringify(entry);
      const wrapped = doc.splitTextToSize(`[${i+1}] ${text}`, W - 28);
      wrapped.forEach(l => {
        if (y > 270) { doc.addPage(); y = 20; }
        body(l, y, [170, 155, 105]); y += 4.5;
      });
    });
  }

  y += 4; line(y); y += 8;

  // ── Section 5: Pocket Certifications ──────────────────────────────────
  if (y > 230) { doc.addPage(); y = 20; }
  title("5. POCKET CERTIFICATIONS", y); y += 6;
  line(y); y += 5;

  if (coreState.pocketCerts.length === 0) {
    body("No pocket certifications recorded.", y); y += 6;
  } else {
    coreState.pocketCerts.forEach((cert, i) => {
      if (y > 265) { doc.addPage(); y = 20; }
      const text = typeof cert === "string" ? cert : JSON.stringify(cert);
      body(`[${i+1}] ${text}`, y, [170, 155, 105]); y += 5;
    });
  }

  y += 4; line(y); y += 8;

  // ── Section 6: Doctor Report ───────────────────────────────────────────
  if (coreState.doctorReport) {
    if (y > 230) { doc.addPage(); y = 20; }
    title("6. SYSTEM DOCTOR REPORT", y); y += 6;
    line(y); y += 5;
    const reportText = typeof coreState.doctorReport === "string"
      ? coreState.doctorReport
      : JSON.stringify(coreState.doctorReport, null, 2);
    const wrapped = doc.splitTextToSize(reportText, W - 28);
    wrapped.forEach(l => {
      if (y > 270) { doc.addPage(); y = 20; }
      body(l, y, [160, 145, 100]); y += 4.5;
    });
    y += 4; line(y); y += 8;
  }

  // ── Footer on every page ───────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(80, 65, 35);
    doc.setFont("helvetica", "normal");
    doc.text("JGA Resilience Council · Local Proof System · John E. Arenz — J.G.A. · Demonstrational only — not a certified production system.", W / 2, 290, { align: "center" });
    doc.text(`Page ${p} of ${totalPages}`, W - 14, 290, { align: "right" });
  }

  return doc;
}

export { buildPDF as generateCouncilPDF };

export default function CouncilPDFReport({ coreState }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    setLoading(true);
    setTimeout(() => {
      const doc = buildPDF(coreState);
      const now = new Date();
      const stamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}_${String(now.getHours()).padStart(2,"0")}${String(now.getMinutes()).padStart(2,"0")}`;
      doc.save(`JGA_Resilience_Council_Report_${stamp}.pdf`);
      setLoading(false);
    }, 150);
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      size="sm"
      className="text-[10px] h-7 px-3 font-bold gap-1.5 border"
      style={{
        background: loading ? "rgba(201,168,76,0.08)" : "linear-gradient(135deg,#C9A84C,#8a6018)",
        color: loading ? GOLD : "#0a0c10",
        borderColor: "rgba(201,168,76,0.4)",
      }}
    >
      {loading
        ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</>
        : <><Download className="w-3 h-3" /> Download PDF Report</>
      }
    </Button>
  );
}