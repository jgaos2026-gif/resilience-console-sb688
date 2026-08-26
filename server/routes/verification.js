import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';
import { advanceItem } from '../services/verificationEngine.js';
import { genesisBlock } from '../services/braidEngine.js';
import { getTrustDecisions, verifyTrustLedger } from '../services/trustLedger.js';
import { writeAudit } from '../middleware/audit.js';

const router = Router();
router.get('/', requireAuth, (req,res) => {
  const db=getDb();
  const items=db.prepare('SELECT * FROM verification_gates ORDER BY id DESC').all();
  res.json(items.map(i=>({ ...i, marks_passed:JSON.parse(i.marks_passed||'[]'), mark_errors:JSON.parse(i.mark_errors||'[]'), braid_chain:JSON.parse(i.braid_chain||'[]'), decisions:getTrustDecisions(i.id) })));
});

const createSchema=z.object({ data:z.string().min(1).max(4096), source:z.string().min(1).max(128).optional().default('operator'), risk_score:z.number().min(0).max(100).optional().default(0) });
router.post('/', requireAuth, (req,res) => {
  const parsed=createSchema.safeParse(req.body);
  if(!parsed.success) return res.status(400).json({error:'Invalid input',details:parsed.error.issues});
  const {data,source,risk_score}=parsed.data;
  const genesis=genesisBlock(`STATE_ITEM:${data}:${source}`);
  const info=getDb().prepare(`INSERT INTO verification_gates(data,source,risk_score,current_stage,braid_chain) VALUES (?,?,?,'input',?)`).run(data,source,risk_score,JSON.stringify([genesis]));
  writeAudit('state_item_created',req.user.id,{itemId:info.lastInsertRowid,source});
  res.json({ok:true,id:info.lastInsertRowid,currentStage:'input',requiredNextRole:'verifier'});
});

router.post('/:id/advance', requireAuth, async (req,res) => {
  try { res.json(await advanceItem(Number(req.params.id),req.user)); }
  catch(err) { res.status(403).json({error:err.message}); }
});

router.get('/ledger/verify', requireAuth, (req,res) => res.json(verifyTrustLedger()));

router.post('/:id/reject', requireAuth, (req,res) => {
  const db=getDb();
  if(!db.prepare('SELECT id FROM verification_gates WHERE id=?').get(req.params.id)) return res.status(404).json({error:'Item not found'});
  db.prepare(`UPDATE verification_gates SET current_stage='rejected',gate_result='fail',updated_at=datetime('now') WHERE id=?`).run(req.params.id);
  writeAudit('state_item_rejected',req.user.id,{itemId:req.params.id,role:req.user.role});
  res.json({ok:true});
});
export default router;
