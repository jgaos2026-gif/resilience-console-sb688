/**
 * systemPulse.js — the system verification / pulse check.
 *
 * Read-only. It recomputes braid integrity across the mesh, re-verifies the trust
 * ledger, and rescans for corrupted nodes. It reports what it found as data; it
 * certifies nothing. Certification stays with the governed trust flow.
 */

import { getDb } from '../db/database.js';
import { verifyChain } from './braidEngine.js';
import { verifyTrustLedger } from './trustLedger.js';
import { detectAnomalies } from './selfHealing.js';

export function runSystemPulse() {
  const db = getDb();
  const nodes = db.prepare('SELECT id, name, status, braid_chain FROM node_states').all();

  let blocks = 0;
  let goodBlocks = 0;
  const failing = [];

  for (const node of nodes) {
    let chain = [];
    try { chain = JSON.parse(node.braid_chain || '[]'); } catch (_) { chain = []; }

    const result = verifyChain(chain);
    blocks += chain.length;
    goodBlocks += Math.round((result.integrityPct / 100) * chain.length);

    if (!result.valid) {
      failing.push({ id: node.id, name: node.name, status: node.status, errors: result.errors });
    }
  }

  const integrityPct = blocks > 0 ? Number(((goodBlocks / blocks) * 100).toFixed(2)) : 100;
  const ledger = verifyTrustLedger();
  const anomalies = detectAnomalies();
  const active = nodes.filter(n => n.status === 'active').length;

  let overall = 'OPERATIONAL';
  if (!ledger.valid || anomalies.length > 0) overall = 'CRITICAL';
  else if (active < nodes.length || integrityPct < 100) overall = 'DEGRADED';

  return {
    overall,
    ran_at: new Date().toISOString(),
    nodes: { total: nodes.length, active, non_active: nodes.length - active },
    braid: { chain_blocks: blocks, integrity_pct: integrityPct, failing_nodes: failing },
    trust_ledger: {
      valid: ledger.valid,
      decisions: ledger.count,
      head: ledger.head,
      errors: ledger.errors || [],
    },
    anomalies: { count: anomalies.length, nodes: anomalies.map(a => ({ id: a.id, name: a.name })) },
    certified: false,
    note: 'Reported as data. This check does not certify anything — certification stays with the governed trust flow.',
  };
}