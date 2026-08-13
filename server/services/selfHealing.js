/**
 * selfHealing.js — Rollback-to-checkpoint recovery engine
 *
 * Stages:
 *   1. Detect  — anomaly identified (hash mismatch / invariant drift)
 *   2. Quarantine — affected chain isolated
 *   3. Rollback   — revert to last verified checkpoint
 *   4. Repair     — reconstruct from verified sources
 *   5. Re-verify  — run triple-mark on repaired state
 *   6. Certify    — re-enter trusted chain
 */

import { verifyChain, appendBlock, sha256 } from './braidEngine.js';
import { getDb } from '../db/database.js';
import { writeAudit } from '../middleware/audit.js';

export const RECOVERY_STAGES = ['detection', 'quarantine', 'rollback', 'repair', 're-verification', 'certification'];

/**
 * Detect anomalies across all node states.
 * Returns list of compromised node IDs.
 */
export function detectAnomalies() {
  const db = getDb();
  const nodes = db.prepare('SELECT * FROM node_states').all();
  const compromised = [];

  for (const node of nodes) {
    let chain = [];
    try { chain = JSON.parse(node.braid_chain || '[]'); } catch (_) {}
    if (chain.length === 0) continue;

    const result = verifyChain(chain);
    if (!result.valid) {
      compromised.push({ id: node.id, name: node.name, errors: result.errors });
    }
  }
  return compromised;
}

/**
 * Run Phoenix recovery for a node or the full system.
 * @param {number|null} nodeId  null = full system recovery
 * @param {string} actorId
 */
export async function runRecovery(nodeId, actorId = 'system') {
  const db = getDb();
  const log = [];
  const addLog = (stage, msg) => log.push({ stage, msg, ts: new Date().toISOString() });

  // 1. Detection
  addLog('detection', nodeId ? `Anomaly scan on node ${nodeId}` : 'Full system anomaly scan');

  const nodes = nodeId
    ? db.prepare('SELECT * FROM node_states WHERE id = ?').all(nodeId)
    : db.prepare('SELECT * FROM node_states').all();

  let recovered = 0;
  let failed = 0;

  for (const node of nodes) {
    let chain = [];
    try { chain = JSON.parse(node.braid_chain || '[]'); } catch (_) {}

    const result = verifyChain(chain);
    if (result.valid && result.integrityPct === 100) {
      addLog('detection', `Node ${node.name}: healthy — skip`);
      continue;
    }

    // 2. Quarantine
    addLog('quarantine', `Node ${node.name}: isolated — errors: ${result.errors.join('; ')}`);
    db.prepare(`UPDATE node_states SET status = 'quarantined', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(node.id);

    // 3. Rollback — find last good block
    let goodChain = [];
    for (let i = chain.length - 1; i >= 0; i--) {
      const slice = chain.slice(0, i + 1);
      const check = verifyChain(slice);
      if (check.valid) { goodChain = slice; break; }
    }

    if (goodChain.length === 0) {
      addLog('rollback', `Node ${node.name}: no valid checkpoint found — marking critical`);
      db.prepare(`UPDATE node_states SET status = 'critical', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(node.id);
      failed++;
      continue;
    }
    addLog('rollback', `Node ${node.name}: rolled back to block ${goodChain.length - 1}`);

    // 4. Repair — append a recovery marker block
    const prev = goodChain[goodChain.length - 1];
    const repairData = `RECOVERY:${node.name}:${actorId}:${Date.now()}`;
    const repairBlock = appendBlock(prev, repairData, goodChain);
    const repairedChain = [...goodChain, repairBlock];
    addLog('repair', `Node ${node.name}: repair block appended — hash ${repairBlock.hash.slice(0, 12)}…`);

    // 5. Re-verify
    const recheck = verifyChain(repairedChain);
    if (!recheck.valid) {
      addLog('re-verification', `Node ${node.name}: re-verify FAILED — ${recheck.errors.join('; ')}`);
      db.prepare(`UPDATE node_states SET status = 'critical', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(node.id);
      failed++;
      continue;
    }
    addLog('re-verification', `Node ${node.name}: re-verify PASSED — integrity ${recheck.integrityPct}%`);

    // 6. Certification — restore to active
    db.prepare(`
      UPDATE node_states
      SET status = 'active', braid_chain = ?, last_verified = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(JSON.stringify(repairedChain), node.id);
    addLog('certification', `Node ${node.name}: certified ACTIVE — braid invariant restored`);
    recovered++;
  }

  // Record recovery event in spine
  const summary = `Phoenix recovery: ${recovered} recovered, ${failed} critical`;
  db.prepare(`
    INSERT INTO spine_events (event_type, data, actor_id, created_at)
    VALUES ('recovery', ?, ?, CURRENT_TIMESTAMP)
  `).run(JSON.stringify({ recovered, failed, log }), actorId);

  writeAudit('self-healing', actorId, { recovered, failed, nodeId, summary });

  return { recovered, failed, log, summary };
}
