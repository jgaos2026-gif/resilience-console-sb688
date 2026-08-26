/**
 * spine.js — /api/spine routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';
import { verifyChain, strandHealth, appendBlock } from '../services/braidEngine.js';
import { writeAudit } from '../middleware/audit.js';

const router = Router();

/** GET /api/spine — spine status + full braid verification */
router.get('/', requireAuth, (req, res) => {
  const db    = getDb();
  const nodes = db.prepare('SELECT * FROM node_states').all();
  const events = db.prepare('SELECT * FROM spine_events ORDER BY id DESC LIMIT 50').all();

  const nodeResults = nodes.map(n => {
    let chain = [];
    try { chain = JSON.parse(n.braid_chain || '[]'); } catch (_) {}
    const verify = verifyChain(chain);
    return {
      id:           n.id,
      name:         n.name,
      category:     n.category,
      status:       n.status,
      chainLength:  chain.length,
      integrityPct: verify.integrityPct,
      valid:        verify.valid,
      invariant:    verify.invariant,
      strands:      strandHealth(chain),
      lastVerified: n.last_verified,
    };
  });

  res.json({
    nodes:  nodeResults,
    events: events.map(e => ({ ...e, data: JSON.parse(e.data) })),
    ts:     new Date().toISOString(),
  });
});

/** POST /api/spine/event — append a spine event */
const eventSchema = z.object({
  event_type: z.string().min(1).max(64),
  data:       z.record(z.unknown()).optional().default({}),
});

router.post('/event', requireAuth, (req, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });

  const { event_type, data } = parsed.data;
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO spine_events (event_type, data, actor_id) VALUES (?, ?, ?)
  `).run(event_type, JSON.stringify(data), req.user.id);

  writeAudit('spine_event', req.user.id, { event_type, insertId: result.lastInsertRowid });
  res.json({ ok: true, id: result.lastInsertRowid });
});

export default router;
