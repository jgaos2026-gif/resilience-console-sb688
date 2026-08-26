import { verifyChain, appendBlock } from './braidEngine.js';
import { getDb } from '../db/database.js';
import { writeAudit } from '../middleware/audit.js';
import { recordTrustDecision, getTrustDecisions } from './trustLedger.js';

export const STAGES = ['input','verification','validation','certification','trusted','rejected','rollback'];

function runChecks(item) {
  const structureErrors = [];
  if (!item.data || typeof item.data !== 'string' || !item.data.trim()) structureErrors.push('data field missing or empty');
  if (!item.source || typeof item.source !== 'string') structureErrors.push('source field required');
  if (typeof item.risk_score !== 'number' || item.risk_score < 0 || item.risk_score > 100) structureErrors.push('risk_score must be 0-100');

  const policyErrors = [];
  if (item.risk_score > 75) policyErrors.push(`risk_score ${item.risk_score} exceeds policy threshold (75)`);
  if (item.quarantine_count > 3) policyErrors.push(`quarantine_count ${item.quarantine_count} exceeds max retries (3)`);

  let chain = [];
  try { chain = JSON.parse(item.braid_chain || '[]'); } catch (_) {}
  const braid = chain.length ? verifyChain(chain) : { valid:false, integrityPct:0, errors:['no braid chain'] };
  const braidErrors = [...(braid.errors || [])];
  if (braid.integrityPct !== 100) braidErrors.push(`chain integrity ${braid.integrityPct}% - must be 100%`);

  const checks = [
    { check:'structure', passed:structureErrors.length === 0, errors:structureErrors },
    { check:'policy', passed:policyErrors.length === 0, errors:policyErrors },
    { check:'braid', passed:braidErrors.length === 0, errors:braidErrors, invariant:braid.invariant },
  ];
  return { passed: checks.every(c => c.passed), checks, chain, errors: checks.flatMap(c => c.errors) };
}

/**
 * One call performs exactly one governed trust phase.
 * verification -> verifier, validation -> validator, certification -> certifier.
 * The same actor may never decide two phases for the same item.
 */
export async function advanceItem(itemId, actor) {
  const db = getDb();
  const item = db.prepare('SELECT * FROM verification_gates WHERE id=?').get(itemId);
  if (!item) throw new Error(`State item ${itemId} not found`);
  if (['trusted','rejected'].includes(item.current_stage)) throw new Error(`Item is already ${item.current_stage}`);

  const decisions = getTrustDecisions(itemId);
  const phase = !decisions.some(d => d.phase === 'verification' && d.result === 'pass') ? 'verification'
    : !decisions.some(d => d.phase === 'validation' && d.result === 'pass') ? 'validation'
    : 'certification';

  const checked = runChecks(item);
  const result = checked.passed ? 'pass' : 'fail';
  const decision = recordTrustDecision({
    itemId,
    phase,
    actor,
    result,
    evidence: { checks: checked.checks, source:item.source, riskScore:item.risk_score },
  });

  const nextStage = !checked.passed ? 'rejected'
    : phase === 'verification' ? 'validation'
    : phase === 'validation' ? 'certification'
    : 'trusted';

  const evidenceBlock = appendBlock(
    checked.chain[checked.chain.length - 1],
    JSON.stringify({ type:'trust-decision', phase, actorId:String(actor.id), actorRole:actor.role, result, decisionHash:decision.decisionHash }),
    checked.chain,
  );
  const newChain = [...checked.chain, evidenceBlock];

  db.prepare(`UPDATE verification_gates
    SET current_stage=?, gate_result=?, marks_passed=?, mark_errors=?, braid_chain=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?`).run(nextStage,result,JSON.stringify(checked.checks),JSON.stringify(checked.errors),JSON.stringify(newChain),itemId);

  writeAudit('trust_decision', actor.id, { itemId, phase, role:actor.role, result, decisionHash:decision.decisionHash, nextStage });
  return { passed:checked.passed, phase, nextStage, checks:checked.checks, errors:checked.errors, decisionHash:decision.decisionHash };
}

// Compatibility export. Callers must now supply a full actor object.
export async function verifyItem(itemId, actor) {
  if (!actor || typeof actor === 'string') throw new Error('verifyItem now requires an authenticated actor object with independent role');
  return advanceItem(itemId, actor);
}
