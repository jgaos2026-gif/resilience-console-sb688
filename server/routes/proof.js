import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';
import { proofLimiter } from '../middleware/rateLimit.js';
import { sha256, alexanderFingerprint } from '../services/braidEngine.js';
import { verifyTrustLedger } from '../services/trustLedger.js';
import { writeAudit } from '../middleware/audit.js';
const router=Router();

router.get('/',requireAuth,(req,res)=>{const proofs=getDb().prepare('SELECT * FROM proof_records ORDER BY id DESC LIMIT 100').all();res.json(proofs.map(p=>({...p,invariant:JSON.parse(p.invariant||'{}')})));});
const schema=z.object({title:z.string().min(1).max(256).optional(),category:z.string().max(64).optional().default('system'),visibility:z.enum(['private','internal','public']).optional().default('internal'),notes:z.string().max(2048).optional()});

/** Generates an evidence snapshot only. Generation is NOT certification. */
router.post('/generate',requireAuth,proofLimiter,(req,res)=>{
  const parsed=schema.safeParse(req.body); if(!parsed.success)return res.status(400).json({error:'Invalid input',details:parsed.error.issues});
  const {title,category,visibility,notes}=parsed.data,db=getDb();
  const nodes=db.prepare('SELECT * FROM node_states').all();
  const combinedWord=nodes.flatMap(n=>{try{return JSON.parse(n.braid_chain||'[]').map(b=>({i:b.generator,sign:b.sign}))}catch(_){return[]}});
  const invariant=alexanderFingerprint(combinedWord),chainIndex=combinedWord.length,ledger=verifyTrustLedger();
  const proofData=JSON.stringify({invariant,chainIndex,category,trustLedgerHead:ledger.head,trustLedgerValid:ledger.valid,ts:new Date().toISOString()});
  const hash=`sha256:${sha256(proofData)}`,proofTitle=title||`Evidence Snapshot - ${new Date().toLocaleDateString()}`;
  const info=db.prepare(`INSERT INTO proof_records(title,category,status,hash,chain_index,invariant,visibility,notes) VALUES (?,?,'evidence-only',?,?,?,?,?)`).run(proofTitle,category,hash,chainIndex,JSON.stringify(invariant),visibility,notes||null);
  writeAudit('proof_evidence_generated',req.user.id,{proofId:info.lastInsertRowid,hash,status:'evidence-only'});
  res.json({ok:true,id:info.lastInsertRowid,hash,invariant,chainIndex,status:'evidence-only',certified:false,trustLedger:ledger});
});

router.get('/:id/verify',requireAuth,(req,res)=>{
  const db=getDb(),proof=db.prepare('SELECT * FROM proof_records WHERE id=?').get(req.params.id); if(!proof)return res.status(404).json({error:'Proof not found'});
  const nodes=db.prepare('SELECT * FROM node_states').all();
  const word=nodes.flatMap(n=>{try{return JSON.parse(n.braid_chain||'[]').map(b=>({i:b.generator,sign:b.sign}))}catch(_){return[]}});
  const current=alexanderFingerprint(word),stored=JSON.parse(proof.invariant||'{}');
  const drift=stored.trace03!==undefined&&(Math.abs(stored.trace03-current.trace03)>0.01||Math.abs(stored.trace07-current.trace07)>0.01);
  res.json({id:proof.id,title:proof.title,hash:proof.hash,storedInvariant:stored,currentInvariant:current,topologyPreserved:!drift,status:drift?'TOPOLOGY_DRIFT':'INTEGRITY_CHECK_PASSED',certified:proof.status==='certified'});
});
export default router;
