import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

let client;

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
  const record = {
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
