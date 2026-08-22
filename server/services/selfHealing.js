import { verifyChain, appendBlock } from './braidEngine.js';
import { getDb } from '../db/database.js';
import { writeAudit } from '../middleware/audit.js';

export const RECOVERY_STAGES=['detection','quarantine','rollback','repair','re-verification','awaiting-independent-certification'];

export function detectAnomalies(){
  const db=getDb(); const compromised=[];
  for(const node of db.prepare('SELECT * FROM node_states').all()){
    let chain=[]; try{chain=JSON.parse(node.braid_chain||'[]')}catch(_){}
    if(!chain.length) continue;
    const r=verifyChain(chain); if(!r.valid) compromised.push({id:node.id,name:node.name,errors:r.errors});
  }
  return compromised;
}

/** Phoenix may detect, quarantine, roll back, repair, and integrity-check.
 * It MUST NOT certify its own repair. Successful repairs remain quarantined
 * as pending_verification until a separate governed trust flow promotes them.
 */
export async function runRecovery(nodeId,actorId='system'){
  const db=getDb(),log=[]; const add=(stage,msg)=>log.push({stage,msg,ts:new Date().toISOString()});
  const nodes=nodeId?db.prepare('SELECT * FROM node_states WHERE id=?').all(nodeId):db.prepare('SELECT * FROM node_states').all();
  let repaired=0,failed=0;
  for(const node of nodes){
    let chain=[]; try{chain=JSON.parse(node.braid_chain||'[]')}catch(_){}
    const initial=verifyChain(chain);
    if(initial.valid&&initial.integrityPct===100){add('detection',`Node ${node.name}: healthy - skip`);continue;}
    db.prepare(`UPDATE node_states SET status='quarantined',updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(node.id);
    add('quarantine',`Node ${node.name}: isolated; original evidence retained in recovery event`);
    let good=[];
    for(let i=chain.length-1;i>=0;i--){const slice=chain.slice(0,i+1);if(verifyChain(slice).valid){good=slice;break;}}
    if(!good.length){db.prepare(`UPDATE node_states SET status='critical',updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(node.id);add('rollback',`Node ${node.name}: no valid checkpoint`);failed++;continue;}
    add('rollback',`Node ${node.name}: checkpoint block ${good.length-1}`);
    const block=appendBlock(good[good.length-1],`RECOVERY:${node.name}:${actorId}:${Date.now()}`,good);
    const candidate=[...good,block]; const check=verifyChain(candidate);
    if(!check.valid){db.prepare(`UPDATE node_states SET status='critical',updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(node.id);add('re-verification',`Node ${node.name}: candidate integrity failed`);failed++;continue;}
    db.prepare(`UPDATE node_states SET status='pending_verification',braid_chain=?,last_verified=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(JSON.stringify(candidate),node.id);
    add('re-verification',`Node ${node.name}: repaired candidate integrity passed ${check.integrityPct}%`);
    add('awaiting-independent-certification',`Node ${node.name}: Phoenix has NO authority to certify; separate verifier/validator/certifier required`);
    db.prepare(`INSERT INTO spine_events(event_type,data,actor_id,created_at) VALUES('recovery_candidate',?,?,CURRENT_TIMESTAMP)`).run(JSON.stringify({nodeId:node.id,nodeName:node.name,originalChain:chain,candidateChain:candidate,initialErrors:initial.errors||[],log}),actorId);
    repaired++;
  }
  const summary=`Phoenix recovery: ${repaired} repaired candidates awaiting independent certification, ${failed} critical`;
  writeAudit('self-healing',actorId,{repaired,failed,nodeId,summary});
  return {repaired,failed,log,summary,certified:0};
}
