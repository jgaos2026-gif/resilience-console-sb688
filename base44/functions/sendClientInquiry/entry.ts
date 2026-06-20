import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { name, email, phone, business_name, service, notes, budget_range, deadline } = body;

    const emailBody = `
New Design Request from JGA Client Portal

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Business: ${business_name || "Not provided"}
Service: ${service || "Not specified"}
Budget: ${budget_range || "Not provided"}
Deadline: ${deadline || "Not specified"}

Notes:
${notes || "None"}

---
Submitted via JGA Client Portal
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: "jgaos2026@outlook.com",
      from_name: "JGA Client Portal",
      subject: `New Design Request: ${name}${business_name ? ` — ${business_name}` : ""}`,
      body: emailBody,
    });

    console.log(`Client inquiry sent for: ${name} (${email})`);
    return Response.json({ success: true });
  } catch (error) {
    console.error("sendClientInquiry error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});