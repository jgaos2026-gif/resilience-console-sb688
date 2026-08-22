// Live Supabase adversarial test harness.
// Requires SUPABASE_URL plus four independently authenticated JWTs/UUIDs.
// No service-role key is accepted by this harness.
import assert from 'node:assert/strict';

const URL = process.env.SUPABASE_URL;
const actors = {
  producer: { jwt: process.env.PRODUCER_JWT, id: process.env.PRODUCER_ID },
  verifier: { jwt: process.env.VERIFIER_JWT, id: process.env.VERIFIER_ID },
  validator: { jwt: process.env.VALIDATOR_JWT, id: process.env.VALIDATOR_ID },
  certifier: { jwt: process.env.CERTIFIER_JWT, id: process.env.CERTIFIER_ID },
};

function required() {
  assert(URL, 'SUPABASE_URL required');
  for (const [name, actor] of Object.entries(actors)) {
    assert(actor.jwt && actor.id, `${name} JWT and ID required`);
  }
}

async function callDecision(actor, body) {
  return fetch(`${URL}/functions/v1/sovereign-decision`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${actor.jwt}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function run() {
  required();
  const itemId = process.env.TEST_ITEM_ID;
  assert(itemId, 'TEST_ITEM_ID required; submit an input item as producer first');

  // Attack 1: producer attempts self-verification.
  let r = await callDecision(actors.producer, { itemId, phase: 'verification', result: 'pass', evidence: { test: 'self-certification-attack' } });
  assert.notEqual(r.status, 200, 'producer self-verification must fail');

  // Attack 2: validator tries to skip verification.
  r = await callDecision(actors.validator, { itemId, phase: 'validation', result: 'pass', evidence: { test: 'skip-stage-attack' } });
  assert.notEqual(r.status, 200, 'validation before verification must fail');

  // Correct verification.
  r = await callDecision(actors.verifier, { itemId, phase: 'verification', result: 'pass', evidence: { test: 'independent-verification' } });
  assert.equal(r.status, 200, await r.text());

  // Attack 3: verifier tries to validate its own verification.
  r = await callDecision(actors.verifier, { itemId, phase: 'validation', result: 'pass', evidence: { test: 'same-actor-attack' } });
  assert.notEqual(r.status, 200, 'same actor cannot validate');

  r = await callDecision(actors.validator, { itemId, phase: 'validation', result: 'pass', evidence: { test: 'independent-validation' } });
  assert.equal(r.status, 200, await r.text());

  r = await callDecision(actors.certifier, { itemId, phase: 'certification', result: 'pass', evidence: { test: 'independent-certification' } });
  assert.equal(r.status, 200, await r.text());

  console.log('PASS: independent VERIFY -> VALIDATE -> CERTIFY chain enforced; bypass attacks rejected.');
}

run().catch(err => { console.error(err); process.exit(1); });
