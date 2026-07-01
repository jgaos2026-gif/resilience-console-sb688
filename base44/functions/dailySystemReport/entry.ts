import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function clip(value, max = 1800) {
  const text = typeof value === 'string' ? value : JSON.stringify(value || {});
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const reportType = payload.report_type || 'daily';
    const now = new Date();
    const reportDate = now.toISOString().split('T')[0];
    const localTime = now.toLocaleString('en-US', { timeZone: 'America/Chicago', dateStyle: 'full', timeStyle: 'short' });

    const [nodes, simulations, oasisRecords, logs, payments, orders] = await Promise.all([
      base44.asServiceRole.entities.Node.list('-updated_date', 30),
      base44.asServiceRole.entities.HealingSimulation.list('-updated_date', 20),
      base44.asServiceRole.entities.OasisRecord.list('-updated_date', 12),
      base44.asServiceRole.entities.SystemLog.list('-created_date', 20),
      base44.asServiceRole.entities.PaymentRecord.list('-created_date', 20),
      base44.asServiceRole.entities.DesignOrder.list('-created_date', 20),
    ]);

    const warningNodes = nodes.filter(n => ['warning', 'quarantined', 'repairing'].includes(n.status));
    const criticalLogs = logs.filter(l => ['critical', 'error', 'warning'].includes(l.level));
    const failedPayments = payments.filter(p => ['failed', 'pending'].includes(p.status));
    const activeRecoveries = simulations.filter(s => !['healthy', 'recovered', 'certified'].includes(s.status));

    const systemSnapshot = {
      generated_at: localTime,
      node_count: nodes.length,
      warning_nodes: warningNodes.map(n => ({ name: n.name, status: n.status, trust_level: n.trust_level, recent_log: n.recent_log })),
      active_recovery_events: activeRecoveries.map(s => ({ name: s.name, status: s.status, result: s.result, description: s.description })),
      critical_logs: criticalLogs.slice(0, 8).map(l => ({ level: l.level, module: l.module, message: l.message, details: l.details })),
      oasis_verified_records: oasisRecords.map(r => ({ title: r.title, status: r.status, stage: r.verification_stage, hash: String(r.hash || '').slice(0, 12), content: r.content })),
      business_orders: orders.slice(0, 10).map(o => ({ title: o.title, client: o.client_name, status: o.status, deposit_status: o.deposit_status, final_payment_status: o.final_payment_status, deadline: o.deadline })),
      payment_watch: failedPayments.slice(0, 10).map(p => ({ type: p.payment_type, amount: p.amount, status: p.status, client: p.client_name, order: p.order_title })),
    };

    const briefing = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are AVA, JGA's intelligent command-room partner. Generate today's operator briefing for John.

Current snapshot:
${clip(systemSnapshot, 8000)}

Write like a sharp young-adult strategic partner: warm, direct, protective, and useful. Do not sound generic. Highlight what needs immediate attention first. Treat OASIS records as verified context and mention their verification when relevant.`,
      response_json_schema: {
        type: 'object',
        properties: {
          briefing_title: { type: 'string' },
          system_health: { type: 'string', enum: ['healthy', 'degraded', 'critical'] },
          executive_summary: { type: 'string' },
          immediate_attention: { type: 'array', items: { type: 'string' } },
          critical_events: { type: 'array', items: { type: 'string' } },
          oasis_context: { type: 'string' },
          next_actions: { type: 'array', items: { type: 'string' } },
          ava_note: { type: 'string' }
        },
        required: ['briefing_title', 'system_health', 'executive_summary', 'immediate_attention', 'critical_events', 'oasis_context', 'next_actions', 'ava_note']
      }
    });

    const report = await base44.asServiceRole.entities.DailyReport.create({
      report_date: reportDate,
      report_type: reportType,
      system_health: briefing.system_health,
      node_status_summary: `${nodes.length} nodes scanned; ${warningNodes.length} need attention.`,
      ledger_status: oasisRecords.length ? `${oasisRecords.length} OASIS record(s) mirrored and hash-marked.` : 'No OASIS records synced yet.',
      memory_pockets_checked: oasisRecords.length,
      ram_guard_status: warningNodes.some(n => n.node_type === 'ram_guard') ? 'Attention needed' : 'Nominal',
      business_activity: `${orders.length} recent order(s); ${failedPayments.length} payment item(s) on watch.`,
      failed_states: activeRecoveries.length + warningNodes.length,
      recovery_actions: activeRecoveries.length,
      proof_vault_additions: oasisRecords.length,
      compliance_warnings: criticalLogs.length,
      next_actions: briefing.next_actions.join(' | '),
      notes: `AVA DAILY BRIEFING\n\n${briefing.executive_summary}\n\nIMMEDIATE ATTENTION\n${briefing.immediate_attention.join('\n')}\n\nCRITICAL EVENTS\n${briefing.critical_events.join('\n')}\n\nOASIS\n${briefing.oasis_context}\n\nAVA NOTE\n${briefing.ava_note}`,
    });

    return Response.json({ success: true, briefing, report });
  } catch (error) {
    console.error('dailySystemReport error:', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});