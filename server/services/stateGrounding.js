/**
 * stateGrounding.js — Live console state used to ground every AI answer.
 *
 * AVA may only cite what this module reads directly out of SQLite. Nothing here
 * is simulated: every figure is a real query, and every integrity number is
 * recomputed from the stored braid chains on each call.
 */

import { getDb } from '../db/database.js';
import { verifyChain, STRAND_COUNT } from './braidEngine.js';
import { verifyTrustLedger } from './trustLedger.js';

export function buildGroundingSnapshot() {
  const db = getDb();

  const nodes = db.prepare('SELECT name, category, status, braid_chain FROM node_states').all();

  let chainBlocks = 0;
  let goodBlocks = 0;
  const unhealthy = [];

  for (const node of nodes) {
    let chain = [];
    try { chain = JSON.parse(node.braid_chain || '[]'); } catch (_) { chain = []; }

    chainBlocks += chain.length;
    const result = verifyChain(chain);
    const integrity = typeof result?.integrityPct === 'number' ? result.integrityPct : 0;
    goodBlocks += Math.round((integrity / 100) * chain.length);

    if (node.status !== 'active') {
      unhealthy.push({
        name: node.name,
        category: node.category,
        status: node.status,
        integrity_pct: integrity,
      });
    }
  }

  const integrityPct = chainBlocks > 0 ? Number(((goodBlocks / chainBlocks) * 100).toFixed(2)) : 100;

  const gateRows = db.prepare('SELECT current_stage, COUNT(*) AS c FROM verification_gates GROUP BY current_stage').all();
  const byStage = Object.fromEntries(gateRows.map(r => [r.current_stage, r.c]));

  const ledger = verifyTrustLedger();

  const recoveryCandidates = db.prepare(
    "SELECT COUNT(*) AS c FROM spine_events WHERE event_type = 'recovery_candidate'",
  ).get()?.c ?? 0;

  const spineEvents = db.prepare('SELECT COUNT(*) AS c FROM spine_events').get()?.c ?? 0;
  const activeNodes = nodes.filter(n => n.status === 'active').length;

  return {
    generated_at: new Date().toISOString(),
    source: 'live_sqlite',
    spine: {
      total_nodes: nodes.length,
      active_nodes: activeNodes,
      non_active_nodes: nodes.length - activeNodes,
      integrity_pct: integrityPct,
      chain_blocks: chainBlocks,
      strand_count: STRAND_COUNT,
      spine_events: spineEvents,
      unhealthy_nodes: unhealthy,
    },
    trust_ledger: {
      integrity_valid: !!ledger.valid,
      decisions: ledger.count,
      head: ledger.head,
      errors: ledger.errors || [],
    },
    gates: {
      total: gateRows.reduce((sum, r) => sum + r.c, 0),
      trusted: byStage.trusted || 0,
      rejected: byStage.rejected || 0,
      by_stage: byStage,
    },
    recovery: {
      candidates_awaiting_certification: recoveryCandidates,
      phoenix_certifies_own_repairs: false,
    },
  };
}

/** Compact factual block injected into every AI prompt. */
export function groundingBriefing(snapshot) {
  const s = snapshot;
  const stageKeys = Object.keys(s.gates.by_stage);

  const lines = [
    'VERIFIED SYSTEM STATE (read live from the console database — this is your only ground truth):',
    `- Node mesh: ${s.spine.active_nodes}/${s.spine.total_nodes} nodes active; braid integrity ${s.spine.integrity_pct}% across ${s.spine.chain_blocks} chain block(s) on the B${s.spine.strand_count} topology.`,
    `- Trust ledger: integrity ${s.trust_ledger.integrity_valid ? 'VALID' : 'FAILED'}; ${s.trust_ledger.decisions} trust decision(s); head ${s.trust_ledger.head}.`,
    `- Verification gates: ${s.gates.total} state item(s) — trusted ${s.gates.trusted}, rejected ${s.gates.rejected}${stageKeys.length ? `, by stage ${JSON.stringify(s.gates.by_stage)}` : ''}.`,
    `- Recovery: ${s.recovery.candidates_awaiting_certification} repaired candidate(s) awaiting independent certification. Phoenix never certifies its own repair.`,
    `- Spine events recorded: ${s.spine.spine_events}.`,
  ];

  lines.push(s.spine.unhealthy_nodes.length
    ? `- Non-active nodes: ${s.spine.unhealthy_nodes.map(n => `${n.name} (${n.status})`).join('; ')}.`
    : '- Non-active nodes: none.');
  lines.push('- If something is not listed above, you do not know it. Say so instead of guessing.');

  return lines.join('\n');
}

/**
 * Deterministic answer composed straight from verified state.
 * Used when no external provider is configured or reachable — it never guesses.
 */
export function composeOfflineReply(question, snapshot) {
  const q = String(question || '').toLowerCase();
  const s = snapshot;

  const wantsHealth = /health|status|integrity|braid|spine|node|topology/.test(q);
  const wantsLedger = /ledger|trust|decision|tamper|hash|audit/.test(q);
  const wantsGates = /gate|verif|valid|certif|state item|quarantine|stage/.test(q);
  const wantsRecovery = /recovery|phoenix|repair|heal|rollback/.test(q);
  const targeted = wantsHealth || wantsLedger || wantsGates || wantsRecovery;

  const facts = [];
  if (!targeted || wantsHealth) {
    facts.push(`Spine: ${s.spine.active_nodes}/${s.spine.total_nodes} nodes active, braid integrity ${s.spine.integrity_pct}% across ${s.spine.chain_blocks} chain blocks (B${s.spine.strand_count}).`);
  }
  if (!targeted || wantsLedger) {
    facts.push(`Trust ledger: ${s.trust_ledger.integrity_valid ? 'VALID' : 'INTEGRITY FAILURE'}, ${s.trust_ledger.decisions} decision(s), head ${s.trust_ledger.head}.`);
  }
  if (!targeted || wantsGates) {
    facts.push(`Verification gates: ${s.gates.total} total — ${s.gates.trusted} trusted, ${s.gates.rejected} rejected.`);
  }
  if (!targeted || wantsRecovery) {
    facts.push(`Recovery: ${s.recovery.candidates_awaiting_certification} repaired candidate(s) awaiting independent certification.`);
  }
  if (s.spine.unhealthy_nodes.length) {
    facts.push(`Non-active nodes: ${s.spine.unhealthy_nodes.map(n => `${n.name} (${n.status})`).join(', ')}.`);
  }

  return [
    'No external AI provider is connected, so this answer is composed directly from verified console state.',
    '',
    ...facts.map(f => `• ${f}`),
    '',
    'If a value is not listed here, I do not know it — I will not guess.',
  ].join('\n');
}