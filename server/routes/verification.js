/**
 * verification.js — /api/verification routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';
import { verifyItem, STAGES } from '../services/verificationEngine.js';
import { genesisBlock } from '../services/braidEngine.js';
import { writeAudit } from '../middleware/audit.js';

const router = Router();

/** GET /api/verification — list all state items */
router.get('/', requireAuth, (req, res) => {
  const db    = getDb();
  const items = db.prepare('SELECT * FROM verification_gates ORDER BY id DESC').all();
  res.json(items.map(i => ({
    ...i,
    marks_passed: JSON.parse(i.marks_passed || '[]'),
    mark_errors:  JSON.parse(i.mark_errors  || '[]'),
    braid_chain:  JSON.parse(i.braid_chain  || '[]'),
  })));
});

/** POST /api/verification — create a new state item */
const createSchema = z.object({
  data:       z.string().min(1).max(4096),
  source:     z.string().min(1).max(128).optional().default('operator'),
  risk_score: z.number().min(0).max(100).optional().default(0),
});

router.post('/', requireAuth, (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });

  const { data, source, risk_score } = parsed.data;
  const db = getDb();

  // Create genesis braid block for this item
  const genesis = genesisBlock(`STATE_ITEM:${data}:${source}`);

  const result = db.prepare(`
    INSERT INTO verification_gates (data, source, risk_score, current_stage, braid_chain)
    VALUES (?, ?, ?, 'input', ?)
  `).run(data, source, risk_score, JSON.stringify([genesis]));

  writeAudit('state_item_created', req.user.id, { itemId: result.lastInsertRowid, source });
  res.json({ ok: true, id: result.lastInsertRowid });
});

/** POST /api/verification/:id/advance — advance through triple-mark pipeline */
router.post('/:id/advance', requireAuth, async (req, res) => {
  try {
    const result = await verifyItem(parseInt(req.params.id), req.user.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/** POST /api/verification/:id/reject — manually reject an item */
router.post('/:id/reject', requireAuth, (req, res) => {
  const db   = getDb();
  const item = db.prepare('SELECT id FROM verification_gates WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  db.prepare(`
    UPDATE verification_gates SET current_stage = 'rejected', gate_result = 'fail',
    updated_at = datetime('now') WHERE id = ?
  `).run(req.params.id);

  writeAudit('state_item_rejected', req.user.id, { itemId: req.params.id });
  res.json({ ok: true });
});

export default router;
