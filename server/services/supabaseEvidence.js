const URL = process.env.SUPABASE_URL;
const SECRET = process.env.SUPABASE_SECRET_KEY;

export function supabaseEvidenceEnabled() {
  return Boolean(URL && SECRET);
}

async function insert(table, body) {
  if (!supabaseEvidenceEnabled()) return { replicated: false, reason: 'not-configured' };
  const response = await fetch(`${URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SECRET,
      Authorization: `Bearer ${SECRET}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase evidence replication failed (${response.status}): ${detail.slice(0, 300)}`);
  }
  return { replicated: true };
}

export async function replicateDecision(decision) {
  return insert('sovereign_decisions', {
    item_id: decision.itemId,
    phase: decision.phase,
    actor_id: decision.actorId,
    actor_role: decision.actorRole,
    result: decision.result,
    evidence: decision.evidence,
    prev_hash: decision.prevHash,
    decision_hash: decision.decisionHash,
  });
}

export async function replicateRecoveryEvidence(evidence) {
  return insert('sovereign_recovery_evidence', evidence);
}
