import { jsPDF } from "jspdf";
import { INDUSTRIES, SCENARIOS } from "@/lib/sb688Engine";

// ── Helpers ───────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function statusColor(status) {
  if (status === "healthy")  return [20, 184, 166];
  if (status === "degraded") return [245, 158, 11];
  return [239, 68, 68];
}

function drawHRule(doc, y, r = 196, g = 163, b = 80, opacity = 0.25) {
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.3);
  doc.line(20, y, 190, y);
}

function sectionHeader(doc, text, y) {
  doc.setFillColor(30, 34, 42);
  doc.rect(20, y - 5, 170, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(196, 163, 80);
  doc.text(text.toUpperCase(), 23, y + 1);
  return y + 10;
}

function labelValue(doc, label, value, x, y, valueColor = [220, 215, 200]) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 115, 105);
  doc.text(label + ":", x, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...valueColor);
  doc.text(String(value), x + 45, y);
}

// ── Main Generator ────────────────────────────────────────────────────────────
export function generateResilienceReport(state) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const industry = INDUSTRIES[state.industry];
  const scenario = state.scenario ? SCENARIOS[state.scenario] : null;
  const now = new Date();
  const timestamp = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";
  const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  let y = 20;

  // ── Cover Header ──────────────────────────────────────────────────────────
  doc.setFillColor(15, 19, 24);
  doc.rect(0, 0, 210, 50, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(196, 163, 80);
  doc.text("SB688 RESILIENCE REPORT", 20, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(150, 145, 130);
  doc.text("Universal Resilience Console — JGA Black + Gold Edition", 20, 30);
  doc.text(`Generated: ${timestamp}`, 20, 37);
  doc.text(`Industry: ${industry.title}`, 20, 44);

  // Report ID
  const reportId = `SB688-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 96, 85);
  doc.text(`Report ID: ${reportId}`, 190, 44, { align: "right" });

  y = 60;

  // ── Executive Summary ─────────────────────────────────────────────────────
  y = sectionHeader(doc, "Executive Summary", y);

  const passCount  = state.proofResults.filter(p => p.pass).length;
  const totalProof = state.proofResults.length;
  const summaryLines = [
    `This report documents the resilience state of the SB688 system configured for the`,
    `${industry.title} sector as of ${dateStr}.`,
    "",
    `Operational State: ${state.operationalState}   |   Resilience Score: ${state.resilienceScore}%   |   Continuity: ${state.continuityScore}%`,
    `Trusted Record Version: v${state.trustedRecordVersion}   |   Proof Suite: ${totalProof > 0 ? `${passCount}/${totalProof} tests passed` : "Not executed"}`,
    `Route Type: ${state.routeType}   |   Route Latency: ${state.routeTime}ms`,
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  summaryLines.forEach(line => {
    if (line === "") { y += 2; return; }
    doc.setTextColor(line.includes("|") ? 196 : 200, line.includes("|") ? 163 : 195, line.includes("|") ? 80 : 185);
    if (line.includes("|")) { doc.setFont("helvetica", "bold"); } else { doc.setFont("helvetica", "normal"); }
    doc.text(line, 23, y);
    y += 5.5;
  });
  y += 4;
  drawHRule(doc, y);
  y += 6;

  // ── Active Scenario ───────────────────────────────────────────────────────
  y = sectionHeader(doc, "Active Scenario", y);
  if (scenario) {
    labelValue(doc, "Scenario", scenario.title, 23, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(170, 165, 150);
    const descLines = doc.splitTextToSize(scenario.description || "—", 160);
    doc.text(descLines, 23, y);
    y += descLines.length * 5 + 2;
    labelValue(doc, "Problem Simulated", state.problemSimulated ? "Yes" : "No", 23, y,
      state.problemSimulated ? [239, 68, 68] : [20, 184, 166]);
    y += 6;
    labelValue(doc, "Recovery Run", state.recoveryRun ? "Yes — Smart Recovery Executed" : "No", 23, y,
      state.recoveryRun ? [20, 184, 166] : [245, 158, 11]);
    y += 6;
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(100, 96, 85);
    doc.text("No scenario was active at time of report generation.", 23, y);
    y += 6;
  }
  y += 4;
  drawHRule(doc, y);
  y += 6;

  // ── Component Health ──────────────────────────────────────────────────────
  y = sectionHeader(doc, "Component Health Status", y);

  const compKeys = Object.keys(state.components);
  const colW = 55;
  let col = 0;
  compKeys.forEach((key, i) => {
    const comp = state.components[key];
    const label = industry.components[key]?.label || key;
    const role  = industry.components[key]?.role  || "";
    const [r, g, b] = statusColor(comp.status);
    const cx = 23 + col * colW;

    doc.setFillColor(r, g, b);
    doc.setFillColor(r * 0.15, g * 0.15, b * 0.15);
    doc.roundedRect(cx, y, colW - 3, 18, 2, 2, "F");
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.roundedRect(cx, y, colW - 3, 18, 2, 2, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(r, g, b);
    const shortLabel = doc.splitTextToSize(label, colW - 8);
    doc.text(shortLabel[0], cx + 3, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(120, 115, 105);
    doc.text(comp.status.toUpperCase(), cx + 3, y + 12);
    doc.text(comp.checkpointId || "—", cx + 3, y + 16.5);

    col++;
    if (col >= 3) { col = 0; y += 22; }
  });
  if (col > 0) y += 22;
  y += 4;
  drawHRule(doc, y);
  y += 6;

  // ── Approved Route ────────────────────────────────────────────────────────
  y = sectionHeader(doc, "Approved Route", y);
  const routeLabels = state.approvedRoute.map(k => industry.components[k]?.label || k);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(34, 197, 94);
  doc.text(routeLabels.join("  →  "), 23, y);
  y += 6;
  labelValue(doc, "Route Type", state.routeType === "primary" ? "Primary (Optimal)" : "Alternate (Rerouted)", 23, y,
    state.routeType === "primary" ? [20, 184, 166] : [245, 158, 11]);
  y += 6;
  labelValue(doc, "Latency", `${state.routeTime}ms`, 23, y);
  y += 10;
  drawHRule(doc, y);
  y += 6;

  // ── Proof Suite ───────────────────────────────────────────────────────────
  y = sectionHeader(doc, "Proof Suite Results", y);

  if (!state.proofRun || totalProof === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(100, 96, 85);
    doc.text("Proof suite was not executed prior to report generation.", 23, y);
    y += 8;
  } else {
    // Header row
    doc.setFillColor(22, 27, 34);
    doc.rect(23, y - 2, 164, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(196, 163, 80);
    doc.text("Test", 26, y + 3);
    doc.text("Result", 155, y + 3);
    y += 9;

    state.proofResults.forEach((p, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const [r, g, b] = p.pass ? [20, 184, 166] : [239, 68, 68];
      doc.setFillColor(i % 2 === 0 ? 18 : 22, i % 2 === 0 ? 22 : 27, i % 2 === 0 ? 28 : 34);
      doc.rect(23, y - 2, 164, 7, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(200, 195, 185);
      doc.text(p.title || `Test ${i + 1}`, 26, y + 3);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(r, g, b);
      doc.text(p.pass ? "PASS" : "FAIL", 164, y + 3);
      y += 8;
    });

    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    const allPass = passCount === totalProof;
    doc.setTextColor(allPass ? 20 : 239, allPass ? 184 : 68, allPass ? 166 : 68);
    doc.text(`Overall: ${passCount}/${totalProof} tests passed (${Math.round((passCount/totalProof)*100)}%)`, 23, y);
    y += 8;
  }
  drawHRule(doc, y);
  y += 6;

  // ── Audit Trail ───────────────────────────────────────────────────────────
  if (y > 240) { doc.addPage(); y = 20; }
  y = sectionHeader(doc, "Audit Trail — Event Log", y);

  const events = state.eventLog.slice(0, 20);
  events.forEach((ev, i) => {
    if (y > 275) { doc.addPage(); y = 20; }
    const evDate = new Date(ev.timestamp);
    const timeStr = evDate.toLocaleTimeString("en-US", { hour12: false });
    const dateSmall = evDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(120, 115, 105);
    doc.text(`${dateSmall} ${timeStr}`, 23, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(190, 185, 170);
    const msgLines = doc.splitTextToSize(ev.message, 140);
    doc.text(msgLines, 62, y);
    y += Math.max(msgLines.length * 4.5, 5.5);
  });

  y += 4;
  drawHRule(doc, y);
  y += 6;

  // ── Trusted Record Chain ──────────────────────────────────────────────────
  if (y > 240) { doc.addPage(); y = 20; }
  y = sectionHeader(doc, "Trusted Record Chain", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(196, 163, 80);
  doc.text(`Current Version: v${state.trustedRecordVersion}`, 23, y);
  y += 6;

  state.trustedChain?.slice(0, 8).forEach((rec) => {
    if (y > 275) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(150, 145, 130);
    doc.text(`v${rec.version}`, 23, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(190, 185, 170);
    doc.text(rec.message || "—", 35, y);
    doc.setTextColor(80, 76, 68);
    doc.setFontSize(6.5);
    doc.text(rec.hash || "—", 23, y + 4);
    y += 10;
  });

  // ── Footer (all pages) ────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(15, 19, 24);
    doc.rect(0, 286, 210, 12, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(80, 76, 68);
    doc.text("SB688 Universal Resilience Console — JGA Black + Gold Edition — StitchBrick / J.G.A.", 20, 292);
    doc.text(`Page ${i} of ${pageCount}  |  ${reportId}`, 190, 292, { align: "right" });
  }

  const fileName = `SB688-Report-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}.pdf`;
  doc.save(fileName);
  return fileName;
}