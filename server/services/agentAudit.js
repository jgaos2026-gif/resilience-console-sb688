/**
 * agentAudit.js — a verifiable record of everything Muse AI does.
 *
 * Every event the External Agent API writes is sealed at the moment it is written:
 *
 *   seal = sha256(prev_seal | id | type | actor | created_at | data)
 *
 * Verification recomputes each seal from the stored event and walks the links
 * between them, so it can tell the difference between:
 *   - an edited event   -> no longer matches its seal            -> broken
 *   - a removed seal    -> gap in the link chain                 -> broken
 *   - an unsealed write -> agent event with no seal recorded     -> unsealed
 *
 * This function names what fails, entry by entry. It does not certify anything.
 */

import { getDb } from '../db/database.js';
import { sha256 } from './braidEngine.js';

export const AGENT_ACTOR = 'muse-external-agent';

const GENESIS = 'GENESIS';

export function computeSeal(event, prevSeal) {
  return sha256(
    `${prevSeal || GENESIS}|${event.id}|${event.event_type}|${event.actor_id}|${event.created_at}|${event.data}`,
  );
}

/**
 * Seal one event. Idempotent — an event that is already sealed is left alone,
 * because the seal must describe the bytes as they were first written.
 */
export function sealEvent(eventId, actor = AGENT_ACTOR) {
  const db = getDb();
  const event = db.prepare(
    'SELECT id, event_type, data, actor_id, created_at FROM spine_events WHERE id = ?',
  ).get(Number(eventId));

  if (!event) return null;

  const existing = db.prepare('SELECT seal FROM ledger_seals WHERE event_id = ?').get(event.id);
  if (existing) return existing.seal;

  const prev = db.prepare('SELECT seal FROM ledger_seals ORDER BY event_id DESC LIMIT 1').get();
  const prevSeal = prev?.seal || GENESIS;
  const seal = computeSeal(event, prevSeal);

  db.prepare('INSERT INTO ledger_seals (event_id, seal, prev_seal, actor) VALUES (?, ?, ?, ?)')
    .run(event.id, seal, prevSeal, String(actor));

  return seal;
}

/**
 * Read the record: the agent's events, the verification result, and counts.
 * Verification always covers EVERY sealed entry, not just the page returned.
 */
export function readAgentAudit({ limit = 200 } = {}) {
  const db = getDb();

  const sealed = db.prepare(`
    SELECT s.event_id, s.seal, s.prev_seal,
           e.event_type, e.actor_id, e.created_at, e.data
    FROM ledger_seals s
    LEFT JOIN spine_events e ON e.id = s.event_id
    ORDER BY s.event_id ASC
  `).all();

  const broken = [];
  let previousSeal = GENESIS;
  let headSeal = null;

  for (const row of sealed) {
    if (!row.event_type) {
      broken.push({ event_id: row.event_id, reason: 'Sealed event is missing from the ledger.' });
      previousSeal = row.seal;
      continue;
    }

    if ((row.prev_seal || GENESIS) !== previousSeal) {
      broken.push({
        event_id: row.event_id,
        reason: 'Chain link broken — a sealed entry is missing or was reordered.',
      });
    }

    const recomputed = computeSeal({
      id: row.event_id,
      event_type: row.event_type,
      actor_id: row.actor_id,
      created_at: row.created_at,
      data: row.data,
    }, row.prev_seal);

    if (recomputed !== row.seal) {
      broken.push({ event_id: row.event_id, reason: 'Entry altered after it was sealed.' });
    }

    previousSeal = row.seal;
    headSeal = row.seal;
  }

  const unsealed = db.prepare(`
    SELECT COUNT(*) AS c FROM spine_events e
    WHERE e.actor_id = ?
      AND NOT EXISTS (SELECT 1 FROM ledger_seals s WHERE s.event_id = e.id)
  `).get(AGENT_ACTOR)?.c ?? 0;

  const rows = db.prepare(`
    SELECT e.id, e.event_type, e.actor_id, e.created_at, e.data, s.seal
    FROM spine_events e
    LEFT JOIN ledger_seals s ON s.event_id = e.id
    WHERE e.actor_id = ?
    ORDER BY e.id DESC
    LIMIT ?
  `).all(AGENT_ACTOR, Math.min(Math.max(Number(limit) || 200, 1), 1000));

  const brokenIds = new Set(broken.map(b => b.event_id));

  const entries = rows.map(row => {
    let payload = null;
    try { payload = JSON.parse(row.data || 'null'); }
    catch (_) { payload = { raw: String(row.data || '').slice(0, 300) }; }

    return {
      event_id: row.id,
      type: row.event_type,
      actor: row.actor_id,
      created_at: row.created_at,
      payload,
      seal: row.seal || null,
      status: !row.seal ? 'unsealed' : brokenIds.has(row.id) ? 'broken' : 'sealed',
    };
  });

  const byType = db.prepare(
    'SELECT event_type, COUNT(*) AS c FROM spine_events WHERE actor_id = ? GROUP BY event_type',
  ).all(AGENT_ACTOR).reduce((acc, row) => ({ ...acc, [row.event_type]: row.c }), {});

  const total = Object.values(byType).reduce((sum, c) => sum + c, 0);
  const control = byType.AGENT_CONTROL || 0;
  const security = byType.SECURITY || 0;

  return {
    actor: AGENT_ACTOR,
    entries,
    summary: {
      total_events: total,
      control_requests: control,
      outcomes: total - control - security,
      security_events: security,
      by_type: byType,
    },
    verification: {
      status: total === 0 ? 'empty' : broken.length === 0 && unsealed === 0 ? 'verified' : 'broken',
      sealed_events: sealed.length,
      unsealed_events: unsealed,
      broken,
      head_seal: headSeal,
      checked_at: new Date().toISOString(),
    },
  };
}