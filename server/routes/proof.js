/**
 * proof.js — /api/proof routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';
import { proofLimiter } from '../middleware/rateLimit.js';
import { sha256, verifyChain, alexanderFingerprint, STRAND_COUNT } from '../services/braidEngine.js';
import { writeAudit } from '../middleware/audit.js';

const router = Router();

/** GET /api/proof — list proof records */
router.get('/', requireAuth, (req, res) => {
  const db     = getDb();
  const proofs = db.prepare('SELECT * FROM proof_records ORDER BY id DESC LIMIT 100').all();
  res.json(proofs.map(p => ({ ...p, invariant: JSON.parse(p.invariant || '{}') })));
});

/** POST /api/proof/generate — generate a new proof packet from current chain state */
const generateSchema = z.object({
  title:      z.string().min(1).max(256).optional(),
  category:   z.string().max(64).optional().default('system'),
  visibility: z.enum(['private','internal','public']).optional().default('internal'),
  notes:      z.string().max(2048).optional(),
});

router.post('/generate', requireAuth, proofLimiter, (req, res) => {
  const parsed = generateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });

  const { title, category, visibility, notes } = parsed.data;
  const db    = getDb();
  const nodes = db.prepare('SELECT * FROM node_states').all();

  // Build combined braid word across all nodes for invariant
  const combinedWord = nodes.flatMap(n => {
    try { return JSON.parse(n.braid_chain || '[]').map(b => ({ i: b.generator, sign: b.sign })); }
    catch (_) { return []; }
  });

  const invariant  = alexanderFingerprint(combinedWord);
  const chainIndex = combinedWord.length;
  const proofData  = JSON.stringify({ invariant, chainIndex, category, ts: new Date().toISOString() });
  const hash       = `sha256:${sha256(proofData)}`;
  const proofTitle = title || `Proof Packet — ${new Date().toLocaleDateString()}`;

  const result = db.prepare(`
    INSERT INTO proof_records (title, category, status, hash, chain_index, invariant, visibility, notes)
    VALUES (?, ?, 'certified', ?, ?, ?, ?, ?)
  `).run(proofTitle, category, hash, chainIndex, JSON.stringify(invariant), visibility, notes || null);

  writeAudit('proof_generated', req.user.id, { proofId: result.lastInsertRowid, hash });
  res.json({ ok: true, id: result.lastInsertRowid, hash, invariant, chainIndex });
});

/** GET /api/proof/:id/verify — verify a stored proof against current chain state */
router.get('/:id/verify', requireAuth, (req, res) => {
  const db    = getDb();
  const proof = db.prepare('SELECT * FROM proof_records WHERE id = ?').get(req.params.id);
  if (!proof) return res.status(404).json({ error: 'Proof not found' });

  const nodes = db.prepare('SELECT * FROM node_states').all();
  const combinedWord = nodes.flatMap(n => {
    try { return JSON.parse(n.braid_chain || '[]').map(b => ({ i: b.generator, sign: b.sign })); }
    catch (_) { return []; }
  });

  const currentInvariant = alexanderFingerprint(combinedWord);
  const storedInvariant  = JSON.parse(proof.invariant || '{}');

  const drift = storedInvariant.trace03 !== undefined &&
    (Math.abs(storedInvariant.trace03 - currentInvariant.trace03) > 0.01 ||
     Math.abs(storedInvariant.trace07 - currentInvariant.trace07) > 0.01);

  res.json({
    id:                proof.id,
    title:             proof.title,
    hash:              proof.hash,
    storedInvariant,
    currentInvariant,
    topologyPreserved: !drift,
    status:            drift ? 'TOPOLOGY_DRIFT' : 'VERIFIED',
  });
});

export default router;
