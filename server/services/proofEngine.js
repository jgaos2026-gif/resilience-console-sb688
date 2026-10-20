/**
 * proofEngine.js — evidence snapshot generation.
 *
 * Extracted from the proof route so both the HTTP route and the governed AI
 * action layer produce byte-identical evidence. Generation is NOT certification.
 */

import { getDb } from '../db/database.js';
import { sha256, alexanderFingerprint } from './braidEngine.js';
import { verifyTrustLedger } from './trustLedger.js';

/**
 * Weld every node's braid word into one topological fingerprint and store it
 * as an evidence-only proof record.
 *
 * @returns {{id:number,title:string,hash:string,invariant:object,chainIndex:number,status:string,certified:boolean,trustLedger:object}}
 */
export function generateEvidenceSnapshot({
  title = null,
  category = 'system',
  visibility = 'internal',
  notes = null,
} = {}) {
  const db = getDb();
  const nodes = db.prepare('SELECT * FROM node_states').all();

  const combinedWord = nodes.flatMap(n => {
    try { return JSON.parse(n.braid_chain || '[]').map(b => ({ i: b.generator, sign: b.sign })); }
    catch (_) { return []; }
  });

  const invariant = alexanderFingerprint(combinedWord);
  const chainIndex = combinedWord.length;
  const ledger = verifyTrustLedger();

  const proofData = JSON.stringify({
    invariant, chainIndex, category,
    trustLedgerHead: ledger.head,
    trustLedgerValid: ledger.valid,
    ts: new Date().toISOString(),
  });

  const hash = `sha256:${sha256(proofData)}`;
  const proofTitle = title || `Evidence Snapshot - ${new Date().toLocaleDateString()}`;

  const info = db.prepare(`
    INSERT INTO proof_records(title,category,status,hash,chain_index,invariant,visibility,notes)
    VALUES (?,?,'evidence-only',?,?,?,?,?)
  `).run(proofTitle, category, hash, chainIndex, JSON.stringify(invariant), visibility, notes || null);

  return {
    id: info.lastInsertRowid,
    title: proofTitle,
    hash,
    invariant,
    chainIndex,
    status: 'evidence-only',
    certified: false,
    trustLedger: ledger,
  };
}