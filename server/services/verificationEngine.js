/**
 * verificationEngine.js — Triple-mark verification pipeline
 *
 * Each state item must pass 3 independent verification marks:
 *   Mark 1 (Structure Gate)  — schema, required fields, data types
 *   Mark 2 (Policy Gate)     — business rules, risk threshold, quarantine history
 *   Mark 3 (Braid Gate)      — hash continuity + Alexander invariant check
 *
 * Only items that earn all three marks advance to TRUSTED state.
 */

import { sha256, verifyChain, appendBlock } from './braidEngine.js';
import { getDb } from '../db/database.js';
import { writeAudit } from '../middleware/audit.js';

// ── Stage constants ───────────────────────────────────────────────────────────

export const STAGES = ['input', 'quarantine', 'verification', 'validation', 'certification', 'trusted', 'rejected', 'rollback'];
export const STAGE_INDEX = Object.fromEntries(STAGES.map((s, i) => [s, i]));

// ── Mark 1: Structure Gate ────────────────────────────────────────────────────

function markStructure(item) {
  const errors = [];
  if (!item.data || typeof item.data !== 'string' || item.data.trim() === '') {
    errors.push('Mark 1: data field missing or empty');
  }
  if (!item.source || typeof item.source !== 'string') {
    errors.push('Mark 1: source field required');
  }
  if (typeof item.risk_score !== 'number' || item.risk_score < 0 || item.risk_score > 100) {
    errors.push('Mark 1: risk_score must be 0–100');
  }
  return { mark: 1, passed: errors.length === 0, errors };
}

// ── Mark 2: Policy Gate ───────────────────────────────────────────────────────

function markPolicy(item) {
  const errors = [];
  if (item.risk_score > 75) {
    errors.push(`Mark 2: risk_score ${item.risk_score} exceeds policy threshold (75)`);
  }
  if (item.quarantine_count > 3) {
    errors.push(`Mark 2: quarantine_count ${item.quarantine_count} exceeds max retries (3)`);
  }
  if (item.current_stage === 'rejected') {
    errors.push('Mark 2: item already rejected — re-entry requires manual override');
  }
  return { mark: 2, passed: errors.length === 0, errors };
}

// ── Mark 3: Braid Gate ────────────────────────────────────────────────────────

function markBraid(item, chainSlice) {
  const errors = [];
  if (!chainSlice || chainSlice.length === 0) {
    errors.push('Mark 3: no braid chain found for this item');
    return { mark: 3, passed: false, errors };
  }
  const result = verifyChain(chainSlice);
  if (!result.valid) {
    errors.push(...result.errors.map(e => `Mark 3: ${e}`));
  }
  if (result.integrityPct < 100) {
    errors.push(`Mark 3: chain integrity ${result.integrityPct}% — must be 100%`);
  }
  return { mark: 3, passed: errors.length === 0, errors, invariant: result.invariant };
}

// ── Run full triple-mark verification ────────────────────────────────────────

/**
 * Verify a state item through all three marks.
 * Updates the DB record and appends a braid block for the result.
 *
 * @param {number} itemId
 * @param {string} actorId  user/system performing verification
 * @returns {{ passed: boolean, marks: object[], nextStage: string }}
 */
export async function verifyItem(itemId, actorId = 'system') {
  const db = getDb();

  const item = db.prepare('SELECT * FROM verification_gates WHERE id = ?').get(itemId);
  if (!item) throw new Error(`State item ${itemId} not found`);

  // Parse stored braid chain
  let chainSlice = [];
  try { chainSlice = JSON.parse(item.braid_chain || '[]'); } catch (_) {}

  // Run three marks
  const m1 = markStructure(item);
  const m2 = markPolicy(item);
  const m3 = markBraid(item, chainSlice);

  const allPassed = m1.passed && m2.passed && m3.passed;
  const allErrors = [...m1.errors, ...m2.errors, ...m3.errors];

  // Determine next stage
  const currentIdx = STAGE_INDEX[item.current_stage] ?? 0;
  let nextStage;
  if (allPassed) {
    nextStage = currentIdx < 4 ? STAGES[currentIdx + 1] : 'trusted';
  } else {
    nextStage = 'rejected';
  }

  // Append result to braid chain
  const resultData = JSON.stringify({ verified: allPassed, marks: [m1.mark, m2.mark, m3.mark], actorId });
  let newChain = chainSlice;
  if (chainSlice.length > 0) {
    const prev = chainSlice[chainSlice.length - 1];
    const newBlock = appendBlock(prev, resultData, chainSlice);
    newChain = [...chainSlice, newBlock];
  }

  // Update DB
  db.prepare(`
    UPDATE verification_gates
    SET current_stage = ?, gate_result = ?, marks_passed = ?, mark_errors = ?,
        braid_chain = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    nextStage,
    allPassed ? 'pass' : 'fail',
    JSON.stringify([m1, m2, m3]),
    JSON.stringify(allErrors),
    JSON.stringify(newChain),
    itemId
  );

  // Audit
  writeAudit('verification', actorId, {
    itemId,
    result: allPassed ? 'PASS' : 'FAIL',
    nextStage,
    marks: [m1, m2, m3],
  });

  return { passed: allPassed, marks: [m1, m2, m3], nextStage, errors: allErrors };
}
