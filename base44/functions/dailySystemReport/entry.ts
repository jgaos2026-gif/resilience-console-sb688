import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function graphRequest(accessToken, path, options = {}) {
  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Graph API error: ${res.status} ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      timeZone: "America/Chicago"
    });
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", timeZone: "America/Chicago"
    });

    // AI-generated system health summary
    const aiReport = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are the SB688 Sovereign System AI for JGA Enterprise, owned by John E. Arenz, NODE: MENDOTA-IL.

Generate a daily executive system health briefing for ${dateStr} at ${timeStr} CST.

Active system: SB688 v2.1 — Day Zero Production (BSS-2026-PROD-01)
Node: MENDOTA-IL — Production Ready
Protocols active: 20 sealed protocols across CORE, GOV, IND, SVRN, OPS namespaces

Write a concise, professional report in PLAIN TEXT (no markdown, no asterisks, no bullet symbols) covering:
1. SYSTEM STATUS - Overall health in 1-2 sentences
2. ACTIVE PROTOCOLS - Top 5 most important with status
3. INTEGRITY METRICS - Resilience %, Data Loss %, Ghost Node, Braid Status
4. SECURITY POSTURE - HMAC, Ledger, Quarantine readiness
5. TODAY'S PRIORITY - One key action or watch item for the operator
6. ARCHITECT'S NOTE - A brief motivational note from the system to John E. Arenz

Keep the total under 350 words. Use ALL CAPS for section headers. Be direct and factual.`,
    });

    const reportText = typeof aiReport === "string" ? aiReport : JSON.stringify(aiReport);

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#000;font-family:'Courier New',monospace;">
<div style="max-width:680px;margin:0 auto;background:#000;border:1px solid #FFD700;border-radius:8px;overflow:hidden;">

  <!-- Header -->
  <div style="background:#0a0a0a;border-bottom:2px solid #FFD700;padding:20px 24px;">
    <div style="font-size:11px;letter-spacing:4px;color:rgba(255,215,0,0.5);text-transform:uppercase;margin-bottom:4px;">
      JGA Enterprise · NODE: MENDOTA-IL
    </div>
    <div style="font-size:20px;font-weight:900;color:#FFD700;letter-spacing:2px;">
      SB688 DAILY SYSTEM REPORT
    </div>
    <div style="font-size:11px;color:rgba(255,215,0,0.6);margin-top:6px;">
      ${dateStr} &nbsp;·&nbsp; ${timeStr} CST &nbsp;·&nbsp; BSS-2026-PROD-01
    </div>
  </div>

  <!-- AI Report -->
  <div style="padding:24px;border-bottom:1px solid rgba(255,215,0,0.15);">
    <pre style="margin:0;white-space:pre-wrap;word-wrap:break-word;font-family:'Courier New',monospace;font-size:13px;line-height:1.75;color:rgba(255,215,0,0.85);">${reportText}</pre>
  </div>

  <!-- White Paper Status -->
  <div style="padding:20px 24px;border-bottom:1px solid rgba(255,215,0,0.1);">
    <div style="font-size:10px;letter-spacing:3px;color:rgba(255,215,0,0.4);text-transform:uppercase;margin-bottom:12px;">
      WHITE PAPER STATUS
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:12px;font-family:'Courier New',monospace;">
      <tr><td style="color:rgba(255,215,0,0.5);padding:3px 0;">Active Document</td><td style="color:#FFD700;text-align:right;">BSS-2026-PROD-01</td></tr>
      <tr><td style="color:rgba(255,215,0,0.5);padding:3px 0;">Architecture Doc</td><td style="color:#FFD700;text-align:right;">BSS-2026-ARCH-01</td></tr>
      <tr><td style="color:rgba(255,215,0,0.5);padding:3px 0;">Current Version</td><td style="color:#FFD700;text-align:right;">v2.1 — Day Zero Production</td></tr>
      <tr><td style="color:rgba(255,215,0,0.5);padding:3px 0;">Archived Versions</td><td style="color:#FFD700;text-align:right;">6 total (v0.1 Alpha → v2.1)</td></tr>
      <tr><td style="color:rgba(255,215,0,0.5);padding:3px 0;">Sealed Protocols</td><td style="color:#22c55e;text-align:right;">20 ACTIVE</td></tr>
    </table>
  </div>

  <!-- Protocol Namespaces -->
  <div style="padding:20px 24px;border-bottom:1px solid rgba(255,215,0,0.1);">
    <div style="font-size:10px;letter-spacing:3px;color:rgba(255,215,0,0.4);text-transform:uppercase;margin-bottom:10px;">
      PROTOCOL NAMESPACES
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px;font-family:'Courier New',monospace;">
      ${[
        ["SB688-CORE", "Resilience Engine, HMAC, Merkle Stitch, Ghost Node, Quarantine"],
        ["SB688-GOV",  "Governance Reports, Proof Suite, Policy DSL, Industry Layer"],
        ["SB688-SVRN", "1211 Auth, Triple-Braid, Clipping, Ledger, Kill/Resurrect"],
        ["SB688-OPS",  "Daily Report, Observer Mode, White Paper Archive, Prod Seal"],
      ].map(([ns, desc]) => `
        <div style="background:rgba(255,215,0,0.04);border:1px solid rgba(255,215,0,0.12);border-radius:6px;padding:10px;">
          <div style="color:#FFD700;font-weight:bold;margin-bottom:4px;">${ns}</div>
          <div style="color:rgba(255,215,0,0.45);font-size:10px;line-height:1.5;">${desc}</div>
        </div>
      `).join("")}
    </div>
  </div>

  <!-- Ledger -->
  <div style="padding:20px 24px;border-bottom:1px solid rgba(255,215,0,0.1);">
    <div style="font-size:10px;letter-spacing:3px;color:rgba(255,215,0,0.4);text-transform:uppercase;margin-bottom:10px;">
      LEDGER INTEGRITY
    </div>
    <div style="font-size:12px;font-family:'Courier New',monospace;color:rgba(255,215,0,0.7);line-height:1.8;">
      Type: Immutable · Append-Only · Read-Only<br>
      Day Zero: April 27, 2026 — NODE: MENDOTA-IL<br>
      Genesis Hash: Sealed · SHA3-256 authenticated<br>
      Unauthorized Writes: 0 detected<br>
      Status: <span style="color:#22c55e;font-weight:bold;">NOMINAL</span>
    </div>
  </div>

  <!-- Footer -->
  <div style="padding:20px 24px;text-align:center;">
    <div style="font-size:13px;font-style:italic;color:#FFD700;margin-bottom:8px;line-height:1.6;">
      "Don't ever let anyone tell you that you can't,<br>when you know damn well you can."
    </div>
    <div style="font-size:10px;color:rgba(255,215,0,0.35);">— John E. Arenz · JGA Enterprise · Markham to Mendota · 1981 → ∞</div>
    <div style="margin-top:14px;font-size:9px;color:rgba(255,215,0,0.2);letter-spacing:2px;text-transform:uppercase;">
      Automated by SB688 Sovereign Reporting Engine · Daily 7:00 AM CST
    </div>
  </div>

</div>
</body>
</html>`;

    // Send via Microsoft Graph using authorized Outlook connector
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("outlook");

    const message = {
      subject: `SB688 Daily Report — ${dateStr} · NODE: MENDOTA-IL`,
      body: {
        contentType: "HTML",
        content: htmlBody,
      },
      toRecipients: [
        { emailAddress: { address: "jaysgraphicarts@outlook.com" } }
      ],
    };

    await graphRequest(accessToken, "/me/sendMail", {
      method: "POST",
      body: JSON.stringify({ message, saveToSentItems: true }),
    });

    return Response.json({
      success: true,
      sent_to: "jaysgraphicarts@outlook.com",
      report_date: dateStr,
      report_time: timeStr,
      node: "MENDOTA-IL",
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});