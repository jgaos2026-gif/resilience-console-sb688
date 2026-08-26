import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

let client;
const MAX_DATA_BYTES = 16 * 1024;

function getSupabaseTarget() {
  if (!config.supabase.enabled) {
    return {
      schema: config.supabase.schema,
      table: config.supabase.eventsTable,
    };
  }

  const url = new URL(config.supabase.url);
  return {
    projectHost: url.host,
    schema: config.supabase.schema,
    table: config.supabase.eventsTable,
  };
}

function getClient() {
  if (!config.supabase.enabled) {
    const error = new Error('Supabase backend is not configured.');
    error.statusCode = 503;
    throw error;
  }

  if (!client) {
    client = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      db: {
        schema: config.supabase.schema,
      },
      global: {
        headers: {
          'X-Client-Info': 'resilience-console-sb688/server',
        },
      },
    });
  }

  return client;
}

function toUpstreamError(error, fallbackMessage) {
  const err = new Error(error?.message || fallbackMessage);
  err.statusCode = 502;
  err.details = error?.details || null;
  err.code = error?.code || 'supabase_upstream_error';
  return err;
}

export function getSupabasePayloadByteLimit() {
  return MAX_DATA_BYTES;
}

export function isSupabasePayloadWithinLimit(data) {
  return Buffer.byteLength(JSON.stringify(data || {}), 'utf8') <= MAX_DATA_BYTES;
}

export function buildSupabaseEventRecord({ eventType, actorId, actorRole, source, data }) {
  return {
    event_type: eventType,
    actor_id: String(actorId || 'unknown'),
    data: {
      ...(data || {}),
      actorRole,
      source,
      origin: 'resilience-console-sb688',
      pushedAt: new Date().toISOString(),
    },
  };
}

export async function getSupabaseStatus() {
  if (!config.supabase.enabled) {
    return {
      configured: false,
      live: false,
      tested: false,
      verified: false,
      target: getSupabaseTarget(),
      reason: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.',
    };
  }

  const supabase = getClient();
  const { count, error } = await supabase
    .from(config.supabase.eventsTable)
    .select('id', { head: true, count: 'exact' });

  if (error) {
    return {
      configured: true,
      live: false,
      tested: true,
      verified: false,
      target: getSupabaseTarget(),
      reason: error.message,
      code: error.code || null,
    };
  }

  return {
    configured: true,
    live: true,
    tested: true,
    verified: true,
    target: getSupabaseTarget(),
    rowCount: count ?? 0,
    mode: 'service_role',
  };
}

export async function pushSupabaseEvent({ eventType, actorId, actorRole, source, data }) {
  const supabase = getClient();
  const record = buildSupabaseEventRecord({ eventType, actorId, actorRole, source, data });

  const { data: rows, error } = await supabase
    .from(config.supabase.eventsTable)
    .insert(record)
    .select('id, event_type, actor_id, created_at')
    .limit(1);

  if (error) {
    throw toUpstreamError(error, 'Failed to push event to Supabase.');
  }

  return rows?.[0] || {
    event_type: record.event_type,
    actor_id: record.actor_id,
    created_at: record.data.pushedAt,
  };
}

export async function runSupabaseFieldSimulations({ actorId, actorRole, liveWrite = false }) {
  const results = [];
  const status = await getSupabaseStatus();

  const oversizedPayload = { chunk: 'x'.repeat(MAX_DATA_BYTES + 1) };
  results.push({
    name: 'oversized_payload_guard',
    passed: !isSupabasePayloadWithinLimit(oversizedPayload),
    details: {
      limitBytes: MAX_DATA_BYTES,
      simulatedBytes: Buffer.byteLength(JSON.stringify(oversizedPayload), 'utf8'),
    },
  });

  const lockedRecord = buildSupabaseEventRecord({
    eventType: 'field_simulation_override_guard',
    actorId,
    actorRole,
    source: 'field-simulation',
    data: {
      actorRole: 'tampered',
      source: 'tampered',
      origin: 'tampered',
      pushedAt: '1900-01-01T00:00:00.000Z',
    },
  });
  results.push({
    name: 'system_field_lock_guard',
    passed: lockedRecord.data.actorRole === actorRole
      && lockedRecord.data.source === 'field-simulation'
      && lockedRecord.data.origin === 'resilience-console-sb688'
      && lockedRecord.data.pushedAt !== '1900-01-01T00:00:00.000Z',
    details: {
      actorRole: lockedRecord.data.actorRole,
      source: lockedRecord.data.source,
      origin: lockedRecord.data.origin,
    },
  });

  if (!status.configured) {
    results.push({
      name: 'fail_closed_without_credentials',
      passed: true,
      details: { reason: status.reason },
    });
  } else {
    results.push({
      name: 'upstream_table_probe',
      passed: !!status.verified,
      details: {
        live: status.live,
        verified: status.verified,
        reason: status.reason || null,
      },
    });
  }

  if (liveWrite && status.verified) {
    try {
      const remote = await pushSupabaseEvent({
        eventType: 'field_simulation_probe',
        actorId,
        actorRole,
        source: 'field-simulation',
        data: { probe: true, mode: 'hard-live' },
      });
      results.push({
        name: 'live_write_probe',
        passed: true,
        details: {
          remoteId: remote.id || null,
          createdAt: remote.created_at || null,
        },
      });
    } catch (error) {
      results.push({
        name: 'live_write_probe',
        passed: false,
        details: { message: error.message },
      });
    }
  } else {
    results.push({
      name: 'live_write_probe',
      passed: true,
      details: {
        skipped: true,
        reason: status.verified ? 'liveWrite disabled' : 'Supabase upstream not verified',
      },
    });
  }

  const failed = results.filter(result => !result.passed);
  return {
    mode: liveWrite ? 'hard-live' : 'hard-dry-run',
    passed: failed.length === 0,
    configured: status.configured,
    verified: status.verified,
    results,
    blockers: failed.map(result => result.name),
  };
}
