import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { initDb, getDb } from '../db/database.js';
import { genesisBlock } from '../services/braidEngine.js';
import { runChecks, decideTrustPhase } from '../services/verificationEngine.js';
import { verifyTrustLedger } from '../services/trustLedger.js';

const dbPath = path.join(os.tmpdir(), `sb688-${process.pid}-${Date.now()}.db`);
initDb(dbPath);

function newItem() {
  const db = getDb();
  const chain = [genesisBlock('TEST_ITEM')];
  return Number(db.prepare(`
    INSERT INTO verification_gates (data, source, risk_score, current_stage, braid_chain)
    VALUES ('payload', 'test', 1, 'input', ?)
  `).run(JSON.stringify(chain)).lastInsertRowid);
}

test('three checks do not independently promote trust', () => {
  const id = newItem();
  const checks = runChecks(id, 'producer');
  assert.equal(checks.passed, true);
  assert.equal(getDb().prepare('select current_stage from verification_gates where id=?').get(id).current_stage, 'verification');
});

test('wrong authority cannot verify', () => {
  const id = newItem();
  runChecks(id, 'producer');
  assert.throws(() => decideTrustPhase(id, { id: 'alice', role: 'operator' }), /requires role 'verifier'/);
});

test('same actor cannot verify and validate', () => {
  const id = newItem();
  runChecks(id, 'producer');
  decideTrustPhase(id, { id: 'alice', role: 'verifier' });
  assert.throws(() => decideTrustPhase(id, { id: 'alice', role: 'validator' }), /same actor cannot decide more than one trust phase/);
});

test('three distinct authorities can promote to trusted', () => {
  const id = newItem();
  runChecks(id, 'producer');
  assert.equal(decideTrustPhase(id, { id: 'v1', role: 'verifier' }).nextStage, 'validation');
  assert.equal(decideTrustPhase(id, { id: 'v2', role: 'validator' }).nextStage, 'certification');
  assert.equal(decideTrustPhase(id, { id: 'v3', role: 'certifier' }).nextStage, 'trusted');
  assert.equal(verifyTrustLedger().valid, true);
});

test('trust evidence cannot be updated or deleted', () => {
  assert.throws(() => getDb().prepare("update trust_decisions set result='fail' where id=1").run(), /append-only/);
  assert.throws(() => getDb().prepare('delete from trust_decisions where id=1').run(), /append-only/);
});

test.after(() => {
  for (const suffix of ['', '-wal', '-shm']) {
    try { fs.unlinkSync(dbPath + suffix); } catch (_) {}
  }
});
