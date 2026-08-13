/**
 * health.js — /api/health
 */

import { Router } from 'express';
import { getDb } from '../db/database.js';
import { verifyChain, strandHealth, STRAND_COUNT } from '../services/braidEngine.js';

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();

  const nodes      = db.prepare('SELECT * FROM node_states').all();
  const totalNodes = nodes.length;
  const activeNodes = nodes.filter(n => n.status === 'active').length;
  const spineEvents = db.prepare('SELECT COUNT(*) as c FROM spine_events').get()?.c ?? 0;
  const trustedItems = db.prepare("SELECT COUNT(*) as c FROM verification_gates WHERE current_stage = 'trusted'").get()?.c ?? 0;
  const rejectedItems = db.prepare("SELECT COUNT(*) as c FROM verification_gates WHERE current_stage = 'rejected'").get()?.c ?? 0;

  // Compute aggregate braid integrity
  let totalBlocks = 0;
  let goodBlocks  = 0;
  let combinedWord = [];
  for (const node of nodes) {
    let chain = [];
    try { chain = JSON.parse(node.braid_chain || '[]'); } catch (_) {}
    totalBlocks += chain.length;
    const r = verifyChain(chain);
    goodBlocks += Math.round((r.integrityPct / 100) * chain.length);
    combinedWord.push(...chain.map(b => ({ i: b.generator, sign: b.sign })));
  }

  const integrityPct = totalBlocks > 0 ? parseFloat(((goodBlocks / totalBlocks) * 100).toFixed(2)) : 100;
  const spineHealth  = activeNodes === totalNodes ? 100 : parseFloat(((activeNodes / Math.max(totalNodes, 1)) * 100).toFixed(1));

  // Aggregate strand health across all nodes
  const strands = strandHealth(
    nodes.flatMap(n => { try { return JSON.parse(n.braid_chain || '[]'); } catch (_) { return []; } })
  );

  res.json({
    status:       spineHealth === 100 ? 'OPERATIONAL' : spineHealth >= 80 ? 'DEGRADED' : 'CRITICAL',
    spineHealth,
    integrityPct,
    totalNodes,
    activeNodes,
    spineEvents,
    trustedItems,
    rejectedItems,
    chainBlocks:  totalBlocks,
    strandCount:  STRAND_COUNT,
    strands,
    ts:           new Date().toISOString(),
  });
});

export default router;
