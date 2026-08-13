/**
 * recovery.js — /api/recovery routes
 */

import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { detectAnomalies, runRecovery } from '../services/selfHealing.js';

const router = Router();

/** GET /api/recovery/scan — detect anomalies */
router.get('/scan', requireAuth, (req, res) => {
  const anomalies = detectAnomalies();
  res.json({ anomalies, count: anomalies.length, clean: anomalies.length === 0 });
});

/** POST /api/recovery/run — run Phoenix recovery */
router.post('/run', requireAuth, requireRole('admin', 'operator'), async (req, res) => {
  const nodeId = req.body?.nodeId ? parseInt(req.body.nodeId) : null;
  try {
    const result = await runRecovery(nodeId, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
