import { sha256 } from './braidEngine.js';
import { getDb } from '../db/database.js';

export const PHASE_ROLE = Object.freeze({
  verification: 'verifier',
  validation: 'validator',
  certification: 'certifier',
});

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function getTrustDecisions(itemId) {
  return getDb().prepare(`
    SELECT id, item_id, phase, actor_id, actor_role, result, evidence_json,
           prev_hash, decision_hash, created_at
    FROM trust_decisions
    WHERE item_id = ?
    ORDER BY id ASC
  `).all(itemId).map(row => ({ ...row, evidence: JSON.parse(row.evidence_json || '{}') }));
}

export function recordTrustDecision({ itemId, phase, actor, result, evidence = {} }) {
  const db = getDb();
  const requiredRole = PHASE_ROLE[phase];
  if (!requiredRole) throw new Error(`Unknown trust phase '${phase}'`);
  if (!actor?.id || !actor?.role) throw new Error('Authenticated actor with id and role is required');
  if (actor.role !== requiredRole) {
    throw new Error(`Phase '${phase}' requires role '${requiredRole}', not '${actor.role}'`);
  }

  const prior = db.prepare(`
    SELECT actor_id, phase, result FROM trust_decisions
    WHERE item_id = ? ORDER BY id ASC
  `).all(itemId);

  if (prior.some(d => d.actor_id === String(actor.id))) {
    throw new Error('Independent authority violation: the same actor cannot decide more than one trust phase');
  }

  const requiredPrior = phase === 'validation' ? ['verification']
    : phase === 'certification' ? ['verification', 'validation']
    : [];
  for (const p of requiredPrior) {
    const decision = prior.find(d => d.phase === p && d.result === 'pass');
    if (!decision) throw new Error(`Cannot ${phase}: missing successful ${p} decision`);
  }

  const last = db.prepare('SELECT decision_hash FROM trust_decisions ORDER BY id DESC LIMIT 1').get();
  const prevHash = last?.decision_hash || 'GENESIS';
  const payload = {
    itemId: Number(itemId),
    phase,
    actorId: String(actor.id),
    actorRole: actor.role,
    result,
    evidence,
    prevHash,
  };
  const decisionHash = sha256(canonical(payload));

  const info = db.prepare(`
    INSERT INTO trust_decisions
      (item_id, phase, actor_id, actor_role, result, evidence_json, prev_hash, decision_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    Number(itemId), phase, String(actor.id), actor.role, result,
    JSON.stringify(evidence), prevHash, decisionHash,
  );

  return { id: info.lastInsertRowid, ...payload, decisionHash };
}

export function verifyTrustLedger() {
  const rows = getDb().prepare('SELECT * FROM trust_decisions ORDER BY id ASC').all();
  let expectedPrev = 'GENESIS';
  const errors = [];

  for (const row of rows) {
    if (row.prev_hash !== expectedPrev) {
      errors.push(`decision ${row.id}: prev_hash mismatch`);
    }
    const payload = {
      itemId: row.item_id,
      phase: row.phase,
      actorId: row.actor_id,
      actorRole: row.actor_role,
      result: row.result,
      evidence: JSON.parse(row.evidence_json || '{}'),
      prevHash: row.prev_hash,
    };
    const calculated = sha256(canonical(payload));
    if (calculated !== row.decision_hash) {
      errors.push(`decision ${row.id}: decision_hash mismatch`);
    }
    expectedPrev = row.decision_hash;
  }

  return { valid: errors.length === 0, count: rows.length, errors, head: expectedPrev };
}
