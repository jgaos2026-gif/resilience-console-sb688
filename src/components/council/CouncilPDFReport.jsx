import jsPDF from "jspdf";
import moment from "moment";

export function generateCouncilPDF(coreState, simLog) {
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

  const checkPage = (needed = 20) => {
    if (y > 297 - needed) { doc.addPage(); y = 18; }
  };

  // ── Header ────────────────────────────────────────────────────────────────────
  doc.setFillColor(5, 6, 8);
  doc.rect(0, 0, W, 32, "F");
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(201, 168, 76);
  doc.text("RESILIENCE COUNCIL — SYSTEM INTEGRITY REPORT", 14, 14);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 140, 120);
  doc.text(`SB688 · OMEGA-72 · STITCH-BRICK · Generated: ${moment().format("YYYY-MM-DD HH:mm:ss")}`, 14, 21);
  doc.text(`Document ID: RC-${Date.now().toString(36).toUpperCase()} · Demo Environment — Real system: Python 3 / PowerShell 7 / Supabase / VS Code`, 14, 27);
  y = 40;

  // ── Executive Summary ─────────────────────────────────────────────────────────
  line("EXECUTIVE SUMMARY", 13, true, [201, 168, 76]);
  divider();
  line(`Spine Status: ${coreState.spineStatus}`, 9);
  line(`Braid Mesh Health: ${coreState.braidHealth}%`, 9);
  line(`Ledger Version: v${coreState.ledgerVersion} (${coreState.ledgerChain.length} chain links)`, 9);
  line(`Drift Score: ${coreState.driftScore}`, 9);
  line(`No-Delete Violations: ${coreState.noDeleteViolations}`, 9);
  line(`System Lock: ${coreState.systemLocked ? "LOCKED (read-only)" : "OPERATIONAL"}`, 9);
  line(`OMEGA-72: ${coreState.omega72Active ? "ACTIVE" : "INACTIVE"} | SB712: ${coreState.sb712Active ? "ACTIVE" : "INACTIVE"} | STITCH-BRICK: ${coreState.stitchBrickMode}`, 9);
  line(`Snapshot Vault: ${coreState.snapshotVault.length} certified snapshots`, 9);
  line(`Pocket Certifications: ${coreState.pocketCerts.length} issued`, 9);
  line(`Self-Heal Events: ${coreState.selfHealLog.length} completed`, 9);
  y += 4;

  // ── System Doctor Report ──────────────────────────────────────────────────────
  checkPage(40);
  line("SYSTEM DOCTOR REPORT", 13, true, [201, 168, 76]);
  divider();

  if (coreState.doctorReport) {
    line(`Last Run: ${moment(coreState.doctorReport.ts).format("YYYY-MM-DD HH:mm:ss")}`, 9);
    line(`Overall Result: ${coreState.doctorReport.overall}`, 9, true, coreState.doctorReport.overall === "PASS" ? [34, 197, 94] : [251, 191, 36]);
    y += 2;

    coreState.doctorReport.checks.forEach(check => {
      checkPage(12);
      const icon = check.pass ? "[PASS]" : "[FAIL]";
      const color = check.pass ? [34, 197, 94] : [239, 68, 68];
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...color);
      doc.text(`${icon} ${check.label}`, 18, y);
      y += 4.5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 95, 90);
      const wrapped = doc.splitTextToSize(check.detail, 170);
      doc.text(wrapped, 22, y);
      y += wrapped.length * 4 + 3;
    });
  } else {
    line("System Doctor has not been run yet. Run it from Master Control to populate this section.", 9, false, [120, 115, 110]);
  }
  y += 4;

  // ── Ledger Chain ──────────────────────────────────────────────────────────────
  checkPage(30);
  line("LEDGER CHAIN INTEGRITY", 13, true, [201, 168, 76]);
  divider();
  line(`Total Links: ${coreState.ledgerChain.length}`, 9);
  line("Policy: APPEND-ONLY · NO-DELETE · SHA-256 Hash Chain", 9);
  y += 2;

  line("Version    Hash                        Label                    Timestamp", 8, true, [120, 115, 110]);
  y += 1;
  coreState.ledgerChain.forEach(entry => {
    checkPage(8);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`v${entry.v}`, 18, y);
    doc.text(entry.hash, 32, y);
    doc.text(entry.label, 100, y);
    doc.text(moment(entry.ts).format("HH:mm:ss"), 162, y);
    y += 5;
  });
  y += 4;

  // ── Packet Interception Results ───────────────────────────────────────────────
  if (coreState.packetTests && coreState.packetTests.length > 0) {
    checkPage(30);
    line("PACKET INTERCEPTION AUDIT", 13, true, [201, 168, 76]);
    divider();
    line(`Packets Tested: ${coreState.packetTests.length}`, 9);
    line(`Blocked: ${coreState.packetTests.filter(p => p.blocked).length} | Allowed: ${coreState.packetTests.filter(p => !p.blocked).length}`, 9);
    y += 2;

    coreState.packetTests.forEach(pkt => {
      checkPage(8);
      const color = pkt.blocked ? [239, 68, 68] : [34, 197, 94];
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...color);
      doc.text(`${pkt.id}  [${pkt.type}→${pkt.target}]  ${pkt.result}`, 18, y);
      y += 5;
    });
    y += 4;
  }

  // ── Snapshot Vault ────────────────────────────────────────────────────────────
  if (coreState.snapshotVault.length > 0) {
    checkPage(30);
    line("SNAPSHOT VAULT", 13, true, [201, 168, 76]);
    divider();

    coreState.snapshotVault.forEach(snap => {
      checkPage(8);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(`${snap.id}  |  Health: ${snap.braidHealth}%  |  Drift: ${snap.driftScore}  |  Spine: ${snap.spineStatus}  |  ${moment(snap.ts).format("HH:mm:ss")}`, 18, y);
      y += 5;
    });
    y += 4;
  }

  // ── Self-Heal Log ─────────────────────────────────────────────────────────────
  if (coreState.selfHealLog.length > 0) {
    checkPage(30);
    line("SELF-HEAL LOG", 13, true, [201, 168, 76]);
    divider();

    coreState.selfHealLog.forEach(heal => {
      checkPage(8);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(`${moment(heal.ts).format("HH:mm:ss")}  |  Health After: ${heal.healthAfter}%  |  Ledger: v${heal.ledgerV}`, 18, y);
      y += 5;
    });
    y += 4;
  }

  // ── Pocket Certifications ─────────────────────────────────────────────────────
  if (coreState.pocketCerts.length > 0) {
    checkPage(30);
    line("POCKET REPAIR CERTIFICATIONS", 13, true, [201, 168, 76]);
    divider();

    coreState.pocketCerts.forEach(cert => {
      checkPage(8);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(`${cert.id}  |  Pockets Repaired: ${cert.nodesRepaired}  |  Health After: ${cert.healthAfter}%  |  ${moment(cert.ts).format("HH:mm:ss")}`, 18, y);
      y += 5;
    });
    y += 4;
  }

  // ── Manual Intervention Audit Trail ───────────────────────────────────────────
  if (simLog && simLog.length > 0) {
    checkPage(30);
    line("MANUAL INTERVENTION AUDIT TRAIL", 13, true, [201, 168, 76]);
    divider();
    line(`Total Events: ${simLog.length}`, 9);
    y += 2;

    simLog.forEach(entry => {
      checkPage(8);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(moment(entry.ts).format("HH:mm:ss"), 18, y);
      const msgTruncated = entry.msg.length > 85 ? entry.msg.slice(0, 85) + "…" : entry.msg;
      doc.text(msgTruncated, 42, y);
      y += 5;
    });
  }

  // ── Footer ────────────────────────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(100, 95, 90);
    doc.text(`Resilience Council Report · JGA Enterprise · Architecture: John E. Arenz · Demo Environment · Page ${i} of ${pageCount}`, W / 2, 290, { align: "center" });
  }

  doc.save(`RC-Integrity-Report-${moment().format("YYYYMMDD-HHmm")}.pdf`);
}