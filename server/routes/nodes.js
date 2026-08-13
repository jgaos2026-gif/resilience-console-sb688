/**
 * nodes.js — /api/nodes routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';
import { verifyChain, strandHealth, appendBlock } from '../services/braidEngine.js';
import { writeAudit } from '../middleware/audit.js';

const router = Router();

/** GET /api/nodes */
router.get('/', requireAuth, (req, res) => {
  const db    = getDb();
  const nodes = db.prepare('SELECT * FROM node_states').all();

  res.json(nodes.map(n => {
    let chain = [];
    try { chain = JSON.parse(n.braid_chain || '[]'); } catch (_) {}
    const v = verifyChain(chain);
    return {
      id:           n.id,
      name:         n.name,
      category:     n.category,
      status:       n.status,
      chainLength:  chain.length,
      integrityPct: v.integrityPct,
      valid:        v.valid,
      invariant:    v.invariant,
      strands:      strandHealth(chain),
      lastVerified: n.last_verified,
      meta:         JSON.parse(n.meta || '{}'),
    };
  }));
});

/** GET /api/nodes/:id */
router.get('/:id', requireAuth, (req, res) => {
  const db   = getDb();
  const node = db.prepare('SELECT * FROM node_states WHERE id = ?').get(req.params.id);
  if (!node) return res.status(404).json({ error: 'Node not found' });

  let chain = [];
  try { chain = JSON.parse(node.braid_chain || '[]'); } catch (_) {}
  const v = verifyChain(chain);

  res.json({
    ...node,
    chain,
    integrityPct: v.integrityPct,
    valid:        v.valid,
    errors:       v.errors,
    invariant:    v.invariant,
    strands:      strandHealth(chain),
  });
});

/** POST /api/nodes/:id/append — append a block to a node's braid chain */
const appendSchema = z.object({
  data: z.string().min(1).max(4096),
});

router.post('/:id/append', requireAuth, (req, res) => {
  const parsed = appendSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });

  const db   = getDb();
  const node = db.prepare('SELECT * FROM node_states WHERE id = ?').get(req.params.id);
  if (!node) return res.status(404).json({ error: 'Node not found' });

  let chain = [];
  try { chain = JSON.parse(node.braid_chain || '[]'); } catch (_) {}

  if (chain.length === 0) {
    return res.status(400).json({ error: 'Node has no genesis block — re-seed required' });
  }

  const prev     = chain[chain.length - 1];
  const newBlock = appendBlock(prev, parsed.data.data, chain);
  const newChain = [...chain, newBlock];

  db.prepare(`
    UPDATE node_states SET braid_chain = ?, last_verified = datetime('now'), updated_at = datetime('now') WHERE id = ?
  `).run(JSON.stringify(newChain), node.id);

  writeAudit('node_append', req.user.id, { nodeId: node.id, blockIndex: newBlock.index });
  res.json({ ok: true, block: newBlock, chainLength: newChain.length });
});

export default router;
