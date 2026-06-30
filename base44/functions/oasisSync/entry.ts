import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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
    const body = await req.json();
    const source = body.source || 'SB688 Command Console';
    const records = Array.isArray(body.records) ? body.records.slice(0, 50) : [];

    if (records.length === 0) {
      return Response.json({ success: false, error: 'No OASIS records received.' }, { status: 400 });
    }

    const synced = [];
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const content = safeString(record.content).slice(0, 4000);
      const recordKey = record.record_key || `${source}:${record.record_type || 'record'}:${record.title || i}`.toLowerCase().replace(/[^a-z0-9:_-]/g, '-');
      const hash = await sha256(`${recordKey}|${content}|${record.status || 'trusted'}`);
      const data = {
        record_key: recordKey,
        source,
        record_type: record.record_type || 'console_state',
        title: record.title || 'OASIS Record',
        content,
        linked_module: record.linked_module || 'SB688',
        status: record.status || 'trusted',
        verification_stage: record.verification_stage || 'verified',
        hash,
        last_synced: new Date().toISOString(),
        metadata: safeString(record.metadata || {}).slice(0, 2000),
      };

      const existing = await base44.asServiceRole.entities.OasisRecord.filter({ record_key: recordKey }, '-updated_date', 1);
      const saved = existing.length > 0
        ? await base44.asServiceRole.entities.OasisRecord.update(existing[0].id, data)
        : await base44.asServiceRole.entities.OasisRecord.create(data);
      synced.push({ id: saved.id, record_key: recordKey, hash });
    }

    return Response.json({ success: true, count: synced.length, records: synced });
  } catch (error) {
    console.error('oasisSync error:', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});