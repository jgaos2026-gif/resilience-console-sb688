/**
 * reports.js — /api/reports routes
 */

import { Router } from 'express';
import { getDb } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';
import { verifyChain, strandHealth, alexanderFingerprint } from '../services/braidEngine.js';
import { writeAudit } from '../middleware/audit.js';

const router = Router();

/** GET /api/reports — list daily reports */
router.get('/', requireAuth, (req, res) => {
  const db = getDb();
  const reports = db.prepare('SELECT * FROM daily_reports ORDER BY report_date DESC LIMIT 30').all();
  res.json(reports.map(r => ({ ...r, invariant: JSON.parse(r.invariant || '{}') })));
});

/** POST /api/reports/generate — snapshot the current system state as a daily report */
router.post('/generate', requireAuth, (req, res) => {
  const db    = getDb();
  const today = new Date().toISOString().slice(0, 10);

  const nodes = db.prepare('SELECT * FROM node_states').all();
  const totalNodes  = nodes.length;
  const activeNodes = nodes.filter(n => n.status === 'active').length;

  let totalBlocks = 0;
  let goodBlocks  = 0;
  const combinedWord = [];

  for (const n of nodes) {
    let chain = [];
    try { chain = JSON.parse(n.braid_chain || '[]'); } catch (_) {}
    totalBlocks += chain.length;
    const r = verifyChain(chain);
    goodBlocks += Math.round((r.integrityPct / 100) * chain.length);
    combinedWord.push(...chain.map(b => ({ i: b.generator, sign: b.sign })));
  }

  const integrityPct  = totalBlocks > 0 ? parseFloat(((goodBlocks / totalBlocks) * 100).toFixed(2)) : 100;
  const spineHealth   = parseFloat(((activeNodes / Math.max(totalNodes, 1)) * 100).toFixed(1));
  const invariant     = alexanderFingerprint(combinedWord);

  const trustedStates  = db.prepare("SELECT COUNT(*) as c FROM verification_gates WHERE current_stage = 'trusted'").get()?.c ?? 0;
  const rejectedStates = db.prepare("SELECT COUNT(*) as c FROM verification_gates WHERE current_stage = 'rejected'").get()?.c ?? 0;
  const recoveryCount  = db.prepare("SELECT COUNT(*) as c FROM spine_events WHERE event_type = 'recovery'").get()?.c ?? 0;
  const summary = `System: ${activeNodes}/${totalNodes} nodes active. Integrity: ${integrityPct}%. Trusted: ${trustedStates}. Rejected: ${rejectedStates}.`;

  db.prepare(`
    INSERT OR REPLACE INTO daily_reports
      (report_date, spine_health, nodes_active, nodes_total, trusted_states, rejected_states,
       recovery_count, chain_length, integrity_pct, invariant, summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(today, spineHealth, activeNodes, totalNodes, trustedStates, rejectedStates,
         recoveryCount, totalBlocks, integrityPct, JSON.stringify(invariant), summary);

  writeAudit('report_generated', req.user.id, { date: today });
  res.json({ ok: true, date: today, spineHealth, integrityPct, summary, invariant });
});

export default router;
