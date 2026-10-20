/**
 * agent.js — /api/agent/* — the External Agent Control API.
 *
 * Authenticated by bearer token only (server-to-server). Two scopes:
 *   read    — status, ledger, health.
 *   control — verify, ledger/append, quarantine, restore.
 *
 * Hard rules enforced here, by construction:
 *   - There is no delete endpoint of any kind.
 *   - No endpoint touches user accounts, passwords, or token settings — token
 *     management lives on a separate console-JWT route (/api/agent-admin), so an
 *     agent token can never alter the credentials that govern it.
 *   - Every control action writes its audit entry to the ledger BEFORE the action
 *     runs, so a failed action still leaves evidence of the attempt.
 *   - Failed authentication and scope violations are recorded as SECURITY events.
 *   - Restore re-verifies the node first: a node whose chain does not verify is
 *     not returned to active duty. Repair stays owner-only.
 *   - Nothing here certifies anything.
 */

import { Router } from 'express';
import { z } from 'zod';

import { getDb } from '../db/database.js';
import { agentLimiter } from '../middleware/rateLimit.js';
import { writeAudit } from '../middleware/audit.js';
import { verifyChain, sha256 } from '../services/braidEngine.js';
import { verifyTrustLedger } from '../services/trustLedger.js';
import { runSystemPulse } from '../services/systemPulse.js';
import { resolveToken, scopeAllows, SCOPES, ACTOR } from '../services/agentTokens.js';

const router = Router();

// ── ledger helpers ────────────────────────────────────────────────────────────
// `spine_events` is the console's append-only history. It is the ledger this API
// reads and appends to. There is deliberately no update or delete path to it.

function ledgerAppend(type, payload, actor = ACTOR) {
  const db = getDb();
  const data = JSON.stringify(payload || {});
  const info = db.prepare(
    'INSERT INTO spine_events (event_type, data, actor_id, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
  ).run(String(type), data, String(actor));

  return db.prepare('SELECT id, event_type, actor_id, created_at FROM spine_events WHERE id = ?')
    .get(info.lastInsertRowid);
}

function ledgerHead() {
  const db = getDb();
  const last = db.prepare(
    'SELECT id, event_type, data, actor_id, created_at FROM spine_events ORDER BY id DESC LIMIT 1',
  ).get();

  return {
    head_hash: last
      ? sha256(`${last.id}:${last.event_type}:${last.data}:${last.actor_id}:${last.created_at}`)
      : null,
    head_event_id: last?.id ?? null,
    entries: db.prepare('SELECT COUNT(*) AS c FROM spine_events').get()?.c ?? 0,
  };
}

function securityEvent(req, action, detail = {}) {
  ledgerAppend('SECURITY', {
    action,
    actor: ACTOR,
    ip: req.ip || null,
    path: req.path,
    method: req.method,
    ...detail,
    ts: new Date().toISOString(),
  });
  writeAudit(action, ACTOR, { ip: req.ip, path: req.path, ...detail });
}

// ── auth ──────────────────────────────────────────────────────────────────────

function requireAgentScope(required) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

    if (!token) {
      securityEvent(req, 'agent_auth_missing_token', { required_scope: required });
      return res.status(401).json({ error: 'Bearer token required.' });
    }

    const resolved = resolveToken(token, req.ip);

    if (!resolved) {
      // Only a short prefix is ever recorded — never the token itself.
      securityEvent(req, 'agent_auth_invalid_token', {
        required_scope: required,
        token_prefix: token.slice(0, 12),
      });
      return res.status(401).json({ error: 'Invalid or revoked token.' });
    }

    if (!scopeAllows(resolved.scope, required)) {
      securityEvent(req, 'agent_auth_insufficient_scope', {
        required_scope: required,
        granted_scope: resolved.scope,
        token_prefix: token.slice(0, 12),
      });
      return res.status(403).json({
        error: `This endpoint requires the '${required}' scope; the presented token has '${resolved.scope}'.`,
      });
    }

    req.agent = resolved;
    next();
  };
}

router.use(agentLimiter);

// ── read endpoints ────────────────────────────────────────────────────────────

/** GET /api/agent/status */
router.get('/status', requireAgentScope(SCOPES.READ), (req, res) => {
  const db = getDb();
  const rows = db.prepare(
    'SELECT id, name, category, status, braid_chain, last_verified FROM node_states ORDER BY id ASC',
  ).all();

  const nodes = rows.map(row => {
    let chain = [];
    try { chain = JSON.parse(row.braid_chain || '[]'); } catch (_) { chain = []; }
    const v = verifyChain(chain);
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      status: row.status,
      integrity_pct: v.integrityPct,
      valid: v.valid,
      chain_length: chain.length,
      last_verified: row.last_verified,
    };
  });

  const totalBlocks = nodes.reduce((sum, n) => sum + n.chain_length, 0);
  const goodBlocks = nodes.reduce((sum, n) => sum + Math.round((n.integrity_pct / 100) * n.chain_length), 0);
  const integrityPct = totalBlocks > 0 ? Number(((goodBlocks / totalBlocks) * 100).toFixed(2)) : 100;
  const activeCount = nodes.filter(n => n.status === 'active').length;
  const ledger = verifyTrustLedger();

  const moduleState = matcher => {
    const node = nodes.find(n => matcher(n.name));
    return node
      ? { name: node.name, status: node.status, integrity_pct: node.integrity_pct }
      : { name: null, status: 'not_registered', integrity_pct: null };
  };

  let overall = 'OPERATIONAL';
  if (!ledger.valid) overall = 'CRITICAL';
  else if (activeCount < nodes.length || integrityPct < 100) overall = 'DEGRADED';

  res.json({
    ok: true,
    status: overall,
    agent: { scope: req.agent.scope, source: req.agent.source },
    nodes,
    modules: {
      SB688: moduleState(name => /SB688|Sovereign Stitch/i.test(name)),
      SB689: moduleState(name => /SB689|Guarded Runtime/i.test(name)),
      AVA:   moduleState(name => /AVA/i.test(name)),
    },
    mesh: {
      total_nodes: nodes.length,
      active_nodes: activeCount,
      non_active_nodes: nodes.length - activeCount,
      chain_blocks: totalBlocks,
      integrity_pct: integrityPct,
    },
    ledger: ledgerHead(),
    trust_ledger: { valid: ledger.valid, decisions: ledger.count, head: ledger.head },
    ts: new Date().toISOString(),
  });
});

/** GET /api/agent/ledger?limit=N */
router.get('/ledger', requireAgentScope(SCOPES.READ), (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 200);
  const rows = getDb().prepare(
    'SELECT id, event_type, actor_id, created_at, data FROM spine_events ORDER BY id DESC LIMIT ?',
  ).all(limit);

  res.json({
    ok: true,
    limit,
    count: rows.length,
    head: ledgerHead(),
    entries: rows.map(row => {
      let data = null;
      try { data = JSON.parse(row.data || 'null'); } catch (_) { data = { raw: String(row.data).slice(0, 500) }; }
      return { id: row.id, type: row.event_type, actor_id: row.actor_id, created_at: row.created_at, payload: data };
    }),
    ts: new Date().toISOString(),
  });
});

/** GET /api/agent/health */
router.get('/health', requireAgentScope(SCOPES.READ), (req, res) => {
  const db = getDb();
  const uptime = Math.floor(process.uptime());
  const lastDecision = db.prepare(
    'SELECT id, item_id, phase, actor_id, actor_role, result, created_at FROM trust_decisions ORDER BY id DESC LIMIT 1',
  ).get();

  const ledger = verifyTrustLedger();

  res.json({
    ok: true,
    uptime_seconds: uptime,
    started_at: new Date(Date.now() - uptime * 1000).toISOString(),
    last_verification: lastDecision
      ? {
          decision_id: lastDecision.id,
          item_id: lastDecision.item_id,
          phase: lastDecision.phase,
          result: lastDecision.result,
          actor_id: lastDecision.actor_id,
          actor_role: lastDecision.actor_role,
          created_at: lastDecision.created_at,
        }
      : null,
    ledger: ledgerHead(),
    trust_ledger: { valid: ledger.valid, decisions: ledger.count, head: ledger.head },
    ts: new Date().toISOString(),
  });
});

// ── control endpoints ─────────────────────────────────────────────────────────

/** POST /api/agent/verify */
router.post('/verify', requireAgentScope(SCOPES.CONTROL), (req, res) => {
  // Audit first — the attempt is evidence whether or not the check succeeds.
  const audit = ledgerAppend('AGENT_CONTROL', {
    action: 'verify', actor: ACTOR, ip: req.ip || null, ts: new Date().toISOString(),
  });

  const result = runSystemPulse();

  ledgerAppend('AGENT_VERIFY_RESULT', {
    audit_entry_id: audit.id, overall: result.overall,
    integrity_pct: result.braid.integrity_pct, anomalies: result.anomalies.count,
  });

  res.json({ ok: true, audit_entry_id: audit.id, result });
});

const appendSchema = z.object({
  type: z.string().min(1).max(64),
  payload: z.any().optional(),
});

/** POST /api/agent/ledger/append */
router.post('/ledger/append', requireAgentScope(SCOPES.CONTROL), (req, res) => {
  const parsed = appendSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
  }

  const serialized = JSON.stringify(parsed.data.payload ?? {});
  if (serialized.length > 8000) {
    return res.status(413).json({ error: 'Payload exceeds 8000 characters.' });
  }

  const audit = ledgerAppend('AGENT_CONTROL', {
    action: 'ledger/append', entry_type: parsed.data.type, actor: ACTOR,
    ip: req.ip || null, ts: new Date().toISOString(),
  });

  const entry = ledgerAppend(parsed.data.type, parsed.data.payload ?? {});

  res.json({ ok: true, audit_entry_id: audit.id, entry, head: ledgerHead() });
});

const nodeSchema = z.object({
  node_id: z.number().int().positive(),
});

/** POST /api/agent/quarantine */
router.post('/quarantine', requireAgentScope(SCOPES.CONTROL), (req, res) => {
  const parsed = nodeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
  }

  const db = getDb();
  const node = db.prepare('SELECT * FROM node_states WHERE id = ?').get(parsed.data.node_id);
  if (!node) return res.status(404).json({ error: `Node ${parsed.data.node_id} not found.` });

  let chain = [];
  try { chain = JSON.parse(node.braid_chain || '[]'); } catch (_) { chain = []; }
  const integrity = verifyChain(chain);
  const previous = node.status;

  const audit = ledgerAppend('AGENT_CONTROL', {
    action: 'quarantine', node_id: node.id, node_name: node.name,
    actor: ACTOR, ip: req.ip || null, ts: new Date().toISOString(),
  });

  db.prepare("UPDATE node_states SET status = 'quarantined', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(node.id);

  ledgerAppend('AGENT_NODE_QUARANTINED', {
    audit_entry_id: audit.id, node_id: node.id, node_name: node.name,
    previous_status: previous, integrity_pct: integrity.integrityPct,
  });

  res.json({
    ok: true,
    audit_entry_id: audit.id,
    node: { id: node.id, name: node.name, previous_status: previous, status: 'quarantined' },
    integrity_pct: integrity.integrityPct,
  });
});

/** POST /api/agent/restore */
router.post('/restore', requireAgentScope(SCOPES.CONTROL), (req, res) => {
  const parsed = nodeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
  }

  const db = getDb();
  const node = db.prepare('SELECT * FROM node_states WHERE id = ?').get(parsed.data.node_id);
  if (!node) return res.status(404).json({ error: `Node ${parsed.data.node_id} not found.` });

  let chain = [];
  try { chain = JSON.parse(node.braid_chain || '[]'); } catch (_) { chain = []; }
  const integrity = verifyChain(chain);

  const audit = ledgerAppend('AGENT_CONTROL', {
    action: 'restore', node_id: node.id, node_name: node.name,
    actor: ACTOR, ip: req.ip || null, ts: new Date().toISOString(),
  });

  // A node only returns to active duty if its chain still verifies end to end.
  if (!integrity.valid || integrity.integrityPct !== 100) {
    ledgerAppend('AGENT_RESTORE_REFUSED', {
      audit_entry_id: audit.id, node_id: node.id, node_name: node.name,
      integrity_pct: integrity.integrityPct, errors: integrity.errors,
    });

    return res.status(409).json({
      ok: false,
      restored: false,
      audit_entry_id: audit.id,
      node: { id: node.id, name: node.name, status: node.status },
      integrity_pct: integrity.integrityPct,
      errors: integrity.errors,
      error: `Restore refused: chain integrity is ${integrity.integrityPct}%, not 100%. The node stays quarantined. Repair is owner-only.`,
    });
  }

  db.prepare("UPDATE node_states SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(node.id);

  ledgerAppend('AGENT_NODE_RESTORED', {
    audit_entry_id: audit.id, node_id: node.id, node_name: node.name,
    previous_status: node.status, integrity_pct: integrity.integrityPct,
  });

  res.json({
    ok: true,
    restored: true,
    audit_entry_id: audit.id,
    node: { id: node.id, name: node.name, previous_status: node.status, status: 'active' },
    integrity_pct: integrity.integrityPct,
  });
});

export default router;