/**
 * agentTokens.js — bearer token issuance and resolution for the External Agent API.
 *
 * Two scopes, deliberately separate:
 *   read    — may read status, ledger, health.
 *   control — read, plus verify / append / quarantine / restore.
 *
 * Tokens are stored as SHA-256 hashes. The plaintext exists only in the response
 * that created it and is never readable again by any endpoint. Regenerating a
 * scope revokes the previous token for that scope, so exactly one token is live
 * per scope at a time.
 *
 * Optional environment bootstrap: AGENT_READ_TOKEN / AGENT_CONTROL_TOKEN are
 * accepted as valid tokens so the API works before anyone visits the admin page.
 * Those are compared in constant time and can only be revoked by removing the
 * environment variable and restarting — which the admin page states plainly.
 */

import { randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { getDb } from '../db/database.js';

export const SCOPES = Object.freeze({ READ: 'read', CONTROL: 'control' });

export const SCOPE_LABEL = Object.freeze({
  read: 'Read only',
  control: 'Read + control',
});

const ENV_NAME = { read: 'AGENT_READ_TOKEN', control: 'AGENT_CONTROL_TOKEN' };
const TOKEN_PREFIX = { read: 'sb688_read_', control: 'sb688_ctl_' };

export const ACTOR = 'muse-external-agent';

export function hashToken(token) {
  return createHash('sha256').update(String(token)).digest('hex');
}

function constantTimeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function envToken(scope) {
  const value = String(process.env[ENV_NAME[scope]] || '').trim();
  return value || null;
}

/** Which scopes are satisfied by environment variables (no secret values returned). */
export function envTokenStatus() {
  return {
    read: envToken(  SCOPES.READ) ? ENV_NAME.read : null,
    control: envToken(SCOPES.CONTROL) ? ENV_NAME.control : null,
  };
}

/** true when `granted` covers `required`. Control inherits read. */
export function scopeAllows(granted, required) {
  if (required === SCOPES.READ) return granted === SCOPES.READ || granted === SCOPES.CONTROL;
  return granted === SCOPES.CONTROL;
}

/** Metadata only — never a token value. */
export function listTokens() {
  const rows = getDb().prepare(`
    SELECT id, scope, token_prefix, created_by, created_at,
           last_used_at, last_used_ip, revoked_at, revoked_by
    FROM agent_tokens ORDER BY id DESC
  `).all();

  const active = {};
  for (const scope of Object.values(SCOPES)) {
    active[scope] = rows.find(r => r.scope === scope && !r.revoked_at) || null;
  }

  return { tokens: rows, active, env: envTokenStatus(), scopes: SCOPE_LABEL };
}

/**
 * Issue (or re-issue) the token for a scope.
 * @returns {{id:number, scope:string, token:string, token_prefix:string}} — the only
 *          time the plaintext token is ever produced.
 */
export function generateToken(scope, actorId = 'owner') {
  if (!Object.values(SCOPES).includes(scope)) throw new Error(`Unknown scope '${scope}'.`);

  const db = getDb();
  const token = `${TOKEN_PREFIX[scope]}${randomBytes(32).toString('base64url')}`;

  // One live token per scope: issue the new one and retire the old in one step.
  db.prepare(
    "UPDATE agent_tokens SET revoked_at = datetime('now'), revoked_by = ? WHERE scope = ? AND revoked_at IS NULL",
  ).run(String(actorId), scope);

  const info = db.prepare(
    'INSERT INTO agent_tokens (scope, token_hash, token_prefix, created_by) VALUES (?, ?, ?, ?)',
  ).run(scope, hashToken(token), token.slice(0, 16), String(actorId));

  return { id: info.lastInsertRowid, scope, token, token_prefix: token.slice(0, 16) };
}

/** Revoke a token by row id. Instant — the next request with it gets a 401. */
export function revokeToken(id, actorId = 'owner') {
  const db = getDb();
  const row = db.prepare('SELECT * FROM agent_tokens WHERE id = ?').get(Number(id));
  if (!row) throw new Error(`Token ${id} not found.`);
  if (row.revoked_at) throw new Error('That token is already revoked.');

  db.prepare("UPDATE agent_tokens SET revoked_at = datetime('now'), revoked_by = ? WHERE id = ?")
    .run(String(actorId), row.id);

  return { id: row.id, scope: row.scope, token_prefix: row.token_prefix };
}

/**
 * Resolve an incoming bearer token.
 * @returns {{scope:string, source:'env'|'stored', id:number|null}|null} null when the
 *          token is unknown or revoked.
 */
export function resolveToken(token, ip = null) {
  if (!token) return null;

  const control = envToken(SCOPES.CONTROL);
  if (control && constantTimeEqual(control, token)) {
    return { scope: SCOPES.CONTROL, source: 'env', id: null };
  }

  const read = envToken(SCOPES.READ);
  if (read && constantTimeEqual(read, token)) {
    return { scope: SCOPES.READ, source: 'env', id: null };
  }

  const db = getDb();
  const row = db.prepare(
    'SELECT * FROM agent_tokens WHERE token_hash = ? AND revoked_at IS NULL LIMIT 1',
  ).get(hashToken(token));

  if (!row) return null;

  db.prepare("UPDATE agent_tokens SET last_used_at = datetime('now'), last_used_ip = ? WHERE id = ?")
    .run(ip || null, row.id);

  return { scope: row.scope, source: 'stored', id: row.id };
}