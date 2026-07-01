import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ALLOWED_TYPES = new Set(['console_state', 'ledger', 'operation_log', 'verification', 'recovery', 'topology', 'proof', 'memory']);
const ALLOWED_STATUS = new Set(['trusted', 'warning', 'quarantined', 'rejected', 'certified']);
const ALLOWED_STAGES = new Set(['mirrored', 'verified', 'validated', 'certified']);

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function safeString(value) {
  if (typeof value === 'string') return value;
  return JSON.stringify(value || {});
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ success: false, error: 'OASIS sync requires an authenticated admin session.' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ success: false, error: 'OASIS sync is restricted to admins.' }, { status: 403 });

    const body = await req.json();
    const source = safeString(body.source || 'SB688 Command Console').slice(0, 120);
    const records = Array.isArray(body.records) ? body.records.slice(0, 50) : [];

    if (records.length === 0) {
      return Response.json({ success: false, error: 'No OASIS records received.' }, { status: 400 });
    }

    const synced = [];
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const content = safeString(record.content).slice(0, 4000);
      const recordKey = safeString(record.record_key || `${source}:${record.record_type || 'record'}:${record.title || i}`).toLowerCase().replace(/[^a-z0-9:_-]/g, '-').slice(0, 180);
      const recordType = ALLOWED_TYPES.has(record.record_type) ? record.record_type : 'console_state';
      const status = ALLOWED_STATUS.has(record.status) ? record.status : 'trusted';
      const verificationStage = ALLOWED_STAGES.has(record.verification_stage) ? record.verification_stage : 'verified';
      const hash = await sha256(`${recordKey}|${content}|${status}`);
      const data = {
        record_key: recordKey,
        source,
        record_type: recordType,
        title: safeString(record.title || 'OASIS Record').slice(0, 180),
        content,
        linked_module: safeString(record.linked_module || 'SB688').slice(0, 120),
        status,
        verification_stage: verificationStage,
        hash,
        last_synced: new Date().toISOString(),
        metadata: safeString({ ...(record.metadata || {}), synced_by: user.email, verification_hash: hash }).slice(0, 2000),
      };

      const existing = await base44.asServiceRole.entities.OasisRecord.filter({ record_key: recordKey }, '-updated_date', 1);
      const saved = existing.length > 0
        ? await base44.asServiceRole.entities.OasisRecord.update(existing[0].id, data)
        : await base44.asServiceRole.entities.OasisRecord.create(data);
      synced.push({ id: saved.id, record_key: recordKey, hash, verification_stage: verificationStage });
    }

    return Response.json({ success: true, count: synced.length, records: synced });
  } catch (error) {
    console.error('oasisSync error:', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});