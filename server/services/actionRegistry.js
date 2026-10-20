/**
 * actionRegistry.js — the governed action catalog.
 *
 * This is the single source of truth for what the AI bridge is allowed to do.
 * Muse may read state, contain a compromised node, intake and verify a state
 * item, record evidence, and configure AVA. It may NOT run Phoenix recovery:
 * restoring a braid chain is a human decision.
 *
 * Three tiers:
 *   read        — safe to run unattended, nothing is mutated.
 *   write       — mutates governed state. Audit-logged and written to the spine.
 *   owner_only  — never executed on the AI's behalf, by any path. The model can
 *                 only recommend it; an admin must run it from the console.
 *
 * The console's own doctrine is enforced structurally, not by instruction:
 *   - Containment is allowed, repair is not.
 *   - The AI acts as `verifier` only, so trustLedger's independence rule stops
 *     it from ever deciding two phases of the same item — no self-certification.
 */

import { getDb } from '../db/database.js';
import { writeAudit } from '../middleware/audit.js';
import { verifyChain, strandHealth, genesisBlock } from './braidEngine.js';
import { buildGroundingSnapshot } from './stateGrounding.js';
import { detectAnomalies, runRecovery } from './selfHealing.js';
import { advanceItem } from './verificationEngine.js';
import { generateEvidenceSnapshot } from './proofEngine.js';
import {
  AVA_MODES,
  getAvaControl,
  setMode,
  setVoice,
  setDirective,
  addAvaMemory,
  listAvaMemory,
} from './avaControl.js';

export const TIER = Object.freeze({
  READ: 'read',
  WRITE: 'write',
  OWNER: 'owner_only',
});

/** The identity the model acts as. Deliberately `verifier` — never a certifier. */
export const MUSE_ACTOR = Object.freeze({ id: 'muse-ai', role: 'verifier' });

// ── helpers ───────────────────────────────────────────────────────────────────

function spineEvent(eventType, data, actorId) {
  getDb().prepare(
    'INSERT INTO spine_events(event_type, data, actor_id, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
  ).run(eventType, JSON.stringify(data), String(actorId));
}

function findNode(ref) {
  const db = getDb();
  const numeric = Number(ref);
  return Number.isInteger(numeric) && String(ref).trim() !== ''
    ? db.prepare('SELECT * FROM node_states WHERE id = ?').get(numeric)
    : db.prepare('SELECT * FROM node_states WHERE name = ?').get(String(ref));
}

function parseChain(raw) {
  try { return JSON.parse(raw || '[]'); } catch (_) { return []; }
}

// ── the catalog ───────────────────────────────────────────────────────────────

const ACTIONS = [
  // ── CHECK ───────────────────────────────────────────────────────────────────
  {
    id: 'system_read_state',
    tier: TIER.READ,
    title: 'Read verified system state',
    description: 'The complete verified console snapshot: node mesh, braid integrity, trust ledger, verification gates, and recovery candidates. This is the same ground truth used to answer the owner.',
    params: {},
    run: async () => buildGroundingSnapshot(),
    summarize: d => `${d.spine.active_nodes}/${d.spine.total_nodes} nodes active, braid integrity ${d.spine.integrity_pct}%.`,
  },
  {
    id: 'system_read_nodes',
    tier: TIER.READ,
    title: 'Read node mesh detail',
    description: 'Every node with its status, chain length, recomputed braid integrity, and per-strand crossing health.',
    params: {},
    run: async () => {
      const nodes = getDb().prepare('SELECT * FROM node_states ORDER BY id ASC').all();
      return nodes.map(n => {
        const chain = parseChain(n.braid_chain);
        const v = verifyChain(chain);
        return {
          id: n.id, name: n.name, category: n.category, status: n.status,
          chain_length: chain.length, integrity_pct: v.integrityPct, valid: v.valid,
          errors: v.errors, strands: strandHealth(chain), last_verified: n.last_verified,
        };
      });
    },
    summarize: d => `${d.length} node(s); ${d.filter(n => n.status === 'active').length} active, ${d.filter(n => !n.valid).length} with chain errors.`,
  },
  {
    id: 'system_read_spine_log',
    tier: TIER.READ,
    title: 'Read the spine event log',
    description: 'The most recent append-only spine events — the console\'s own evidence trail of state changes.',
    params: {
      limit: { type: 'number', description: 'How many recent events to return (1-100, default 25).' },
    },
    run: async ({ limit = 25 }) => {
      const n = Math.min(Math.max(Number(limit) || 25, 1), 100);
      return getDb().prepare(
        'SELECT id, event_type, actor_id, created_at, data FROM spine_events ORDER BY id DESC LIMIT ?',
      ).all(n).map(r => ({
        id: r.id, event_type: r.event_type, actor_id: r.actor_id, created_at: r.created_at,
        data: String(r.data || '').slice(0, 500),
      }));
    },
    summarize: d => `Read ${d.length} spine event(s).`,
  },
  {
    id: 'system_scan_anomalies',
    tier: TIER.READ,
    title: 'Scan for corrupted nodes',
    description: 'Run a real integrity scan across every node braid chain and report which ones fail verification. Detection only — nothing is changed or repaired.',
    params: {},
    run: async () => {
      const anomalies = detectAnomalies();
      return { count: anomalies.length, clean: anomalies.length === 0, anomalies };
    },
    summarize: d => d.clean ? 'Scan clean — no corrupted node chains.' : `Scan found ${d.count} compromised node(s).`,
  },
  {
    id: 'ava_read_control',
    tier: TIER.READ,
    title: 'Read AVA control state',
    description: 'AVA\'s current operating lane, voice setting, standing directives, and durable memory.',
    params: {},
    run: async () => {
      const control = getAvaControl();
      return {
        mode: control.mode,
        voice_enabled: control.voice_enabled,
        directives: control.directives,
        memory: listAvaMemory(10),
        active_memory: control.active_memory,
      };
    },
    summarize: d => `AVA lane ${d.mode}, voice ${d.voice_enabled ? 'on' : 'off'}, ${d.directives.length} directive(s), ${d.active_memory} memory item(s).`,
  },

  // ── MODIFY ──────────────────────────────────────────────────────────────────
  {
    id: 'system_quarantine_node',
    tier: TIER.WRITE,
    title: 'Quarantine a node',
    description: 'Contain a suspicious node by moving it to quarantined status so it is isolated from the trusted spine. This is containment only — it never repairs, rolls back, or certifies. Quarantine before repair.',
    params: {
      node: { type: 'string', required: true, maxLength: 128, description: 'Node name or numeric node id.' },
      reason: { type: 'string', maxLength: 400, description: 'Why the node is being contained. Recorded on the spine.' },
    },
    run: async ({ node, reason }, ctx) => {
      const row = findNode(node);
      if (!row) throw new Error(`No node matches '${node}'.`);

      const chain = parseChain(row.braid_chain);
      const v = verifyChain(chain);
      const previous = row.status;

      getDb().prepare(
        "UPDATE node_states SET status = 'quarantined', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      ).run(row.id);

      spineEvent('node_quarantined', {
        nodeId: row.id, nodeName: row.name, previousStatus: previous,
        reason: reason || 'not stated', source: ctx.source,
        integrityPct: v.integrityPct, chainErrors: v.errors,
      }, ctx.actorId);

      return {
        node_id: row.id, node_name: row.name, previous_status: previous,
        new_status: 'quarantined', integrity_pct: v.integrityPct, chain_errors: v.errors,
        note: 'Containment only. Phoenix repair is owner-only.',
      };
    },
    summarize: d => `${d.node_name} quarantined (was ${d.previous_status}).`,
  },
  {
    id: 'system_intake_state_item',
    tier: TIER.WRITE,
    title: 'Intake a state item',
    description: 'Open a new item at the input gate of the verification pipeline. It starts unverified and must pass verification, validation, and certification before it can become trusted.',
    params: {
      data: { type: 'string', required: true, maxLength: 4096, description: 'The item content to be governed.' },
      source: { type: 'string', maxLength: 128, description: 'Where this item came from.' },
      risk_score: { type: 'number', description: 'Risk 0-100. Above 75 the policy check rejects it.' },
    },
    run: async ({ data, source, risk_score }) => {
      const genesis = genesisBlock(`STATE_ITEM:${data}:${source}`);
      const info = getDb().prepare(
        "INSERT INTO verification_gates(data,source,risk_score,current_stage,braid_chain) VALUES (?,?,?,'input',?)",
      ).run(data, source, Number(risk_score) || 0, JSON.stringify([genesis]));

      return {
        item_id: info.lastInsertRowid, current_stage: 'input',
        required_next_role: 'verifier',
        note: 'Unverified. It is not trusted state.',
      };
    },
    summarize: d => `State item #${d.item_id} opened at the input gate.`,
  },
  {
    id: 'system_advance_trust_phase',
    tier: TIER.WRITE,
    title: 'Advance one trust phase',
    description: 'Run exactly one governed trust decision on a state item. The AI acts only as verifier, so the independence rule prevents it from deciding a second phase on the same item — validation and certification must come from other actors.',
    params: {
      item_id: { type: 'number', required: true, description: 'The verification gate item id.' },
    },
    run: async ({ item_id }) => {
      const result = await advanceItem(Number(item_id), MUSE_ACTOR);
      return { ...result, actor: MUSE_ACTOR.id, actor_role: MUSE_ACTOR.role };
    },
    summarize: (d, p) => `Item #${p.item_id} phase '${d.phase}' ${d.passed ? 'passed' : 'failed'} → stage '${d.nextStage}'.`,
  },
  {
    id: 'system_record_proof',
    tier: TIER.WRITE,
    title: 'Record an evidence snapshot',
    description: 'Weld the current braid topology into a hashed evidence record. This generates evidence only — it does not certify anything.',
    params: {
      title: { type: 'string', maxLength: 256, description: 'Title for the evidence record.' },
      category: { type: 'string', maxLength: 64, description: 'Category, e.g. system, compliance, recovery.' },
      notes: { type: 'string', maxLength: 2048, description: 'Notes to store with the evidence.' },
    },
    run: async ({ title, category, notes }) =>
      generateEvidenceSnapshot({ title, category: category || 'system', notes }),
    summarize: d => `Evidence #${d.id} recorded (${d.status}).`,
  },
  {
    id: 'ava_set_mode',
    tier: TIER.WRITE,
    title: 'Set AVA operating lane',
    description: 'Change AVA\'s operating lane. The lane is persisted and injected into every AVA prompt, so it actually changes how AVA answers.',
    params: {
      mode: { type: 'string', required: true, enum: AVA_MODES, description: 'The lane AVA should operate in.' },
    },
    run: async ({ mode }, ctx) => setMode(mode, ctx.source === 'muse' ? MUSE_ACTOR.id : ctx.actorId),
    summarize: d => `AVA lane set to ${d.mode}.`,
  },
  {
    id: 'ava_set_voice',
    tier: TIER.WRITE,
    title: 'Set AVA voice output',
    description: 'Enable or disable AVA\'s spoken voice output.',
    params: {
      enabled: { type: 'boolean', required: true, description: 'true to speak, false to stay silent.' },
    },
    run: async ({ enabled }, ctx) => setVoice(enabled, ctx.source === 'muse' ? MUSE_ACTOR.id : ctx.actorId),
    summarize: d => `AVA voice ${d.voice_enabled ? 'enabled' : 'disabled'}.`,
  },
  {
    id: 'ava_set_directive',
    tier: TIER.WRITE,
    title: 'Set a standing directive',
    description: 'Add a standing directive AVA must follow in every future exchange, or clear all of them. Directives bind AVA within the primary law.',
    params: {
      directive: { type: 'string', maxLength: 400, description: 'The directive text. Required unless clear_all is true.' },
      clear_all: { type: 'boolean', description: 'true to remove every standing directive.' },
    },
    run: async ({ directive, clear_all }, ctx) => {
      const actor = ctx.source === 'muse' ? MUSE_ACTOR.id : ctx.actorId;
      const next = setDirective({ directive, clear_all: clear_all === true }, actor);
      return { count: next.directives.length, directives: next.directives, cleared: clear_all === true };
    },
    summarize: d => d.cleared ? 'All AVA standing directives cleared.' : `Directive set — ${d.count} now active.`,
  },
  {
    id: 'ava_remember',
    tier: TIER.WRITE,
    title: 'Write to AVA durable memory',
    description: 'Store a durable memory that survives restarts and is fed back into AVA\'s prompts. Memory is archived rather than deleted.',
    params: {
      text: { type: 'string', required: true, maxLength: 2000, description: 'What to remember.' },
      source: { type: 'string', maxLength: 64, description: 'Where it came from, e.g. owner or muse.' },
    },
    run: async ({ text, source }, ctx) =>
      addAvaMemory({ text, source: source || ctx.source }, ctx.source === 'muse' ? MUSE_ACTOR.id : ctx.actorId),
    summarize: d => `Memory #${d.id} stored (${d.hash.slice(0, 12)}…).`,
  },

  // ── OWNER-ONLY CONTROL ──────────────────────────────────────────────────────
  {
    id: 'system_run_recovery',
    tier: TIER.OWNER,
    title: 'Run Phoenix recovery',
    description: 'Owner-only. Rolls a compromised node back to its last valid checkpoint and rebuilds a repaired candidate. This rewrites braid history, so no AI may trigger it — the model may only recommend it.',
    params: {
      node_id: { type: 'number', description: 'Limit recovery to one node id. Omit to recover every damaged node.' },
    },
    run: async ({ node_id }, ctx) => runRecovery(node_id ? Number(node_id) : null, ctx.actorId),
    summarize: d => d.summary,
  },
];

// ── descriptor → schema / validation ──────────────────────────────────────────

function toJsonSchema(params = {}) {
  const properties = {};
  const required = [];
  for (const [name, spec] of Object.entries(params)) {
    const prop = { type: spec.type === 'number' ? 'number' : spec.type === 'boolean' ? 'boolean' : 'string' };
    if (spec.description) prop.description = spec.description;
    if (Array.isArray(spec.enum)) prop.enum = spec.enum;
    properties[name] = prop;
    if (spec.required) required.push(name);
  }
  return { type: 'object', properties, required, additionalProperties: false };
}

function validateParams(descriptor = {}, raw = {}) {
  const errors = [];
  const clean = {};

  for (const [name, spec] of Object.entries(descriptor)) {
    const value = raw?.[name];
    if (value === undefined || value === null || value === '') {
      if (spec.required) errors.push(`'${name}' is required`);
      continue;
    }

    let parsed = value;
    if (spec.type === 'number') {
      parsed = Number(value);
      if (!Number.isFinite(parsed)) { errors.push(`'${name}' must be a number`); continue; }
    } else if (spec.type === 'boolean') {
      parsed = value === true || value === 'true';
    } else {
      parsed = String(value).trim();
      if (spec.maxLength && parsed.length > spec.maxLength) {
        errors.push(`'${name}' exceeds ${spec.maxLength} characters`);
        continue;
      }
    }

    if (Array.isArray(spec.enum) && !spec.enum.includes(parsed)) {
      errors.push(`'${name}' must be one of: ${spec.enum.join(', ')}`);
      continue;
    }

    clean[name] = parsed;
  }

  return { ok: errors.length === 0, errors, params: clean };
}

// ── public surface ────────────────────────────────────────────────────────────

/** Catalog safe to render in the UI — no handlers, no internals. */
export function getToolCatalog() {
  return ACTIONS.map(a => ({
    id: a.id,
    tier: a.tier,
    title: a.title,
    description: a.description,
    params: Object.entries(a.params).map(([name, spec]) => ({
      name,
      type: spec.type,
      required: !!spec.required,
      description: spec.description || '',
      enum: spec.enum || null,
    })),
  }));
}

/** OpenAI-compatible tool definitions for the provider call. */
export function buildProviderTools() {
  return ACTIONS.map(a => ({
    type: 'function',
    function: {
      name: a.id,
      description: `${a.title}. ${a.description}${a.tier === TIER.OWNER ? ' [OWNER-ONLY: you may recommend this, you cannot execute it.]' : ''}`,
      parameters: toJsonSchema(a.params),
    },
  }));
}

/** Rules the model must know before it is handed any tool. */
export function buildToolBriefing() {
  const lines = ['YOUR TOOLS — you can check, modify, and control this console.'];
  for (const tier of [TIER.READ, TIER.WRITE, TIER.OWNER]) {
    const group = ACTIONS.filter(a => a.tier === tier);
    if (!group.length) continue;
    lines.push('', `[${tier === TIER.OWNER ? 'OWNER-ONLY — recommend, never execute' : tier.toUpperCase()}]`);
    for (const a of group) lines.push(`- ${a.id}: ${a.description}`);
  }
  lines.push(
    '',
    'Tool rules:',
    '- Call a tool instead of guessing. If a value is not in the state block, read it.',
    '- Containment yes, repair no. You may quarantine; you may not run Phoenix recovery.',
    '- You act as verifier only. You can never certify your own work or yours alone.',
    '- Report exactly what the tool returned, including refusals and errors. Never describe an action you did not take as done.',
  );
  return lines.join('\n');
}

/** Execute one governed action. Always resolves — never throws. */
export async function executeAction(actionId, rawParams = {}, ctx = {}) {
  const actorId = String(ctx.actorId || 'unknown');
  const source = ctx.source || 'muse';
  const ts = new Date().toISOString();

  const finish = result => {
    writeAudit('ai_action', actorId, {
      action: result.action, tier: result.tier, ok: result.ok, source,
      refused: !!result.refused, summary: result.summary || null, error: result.error || null,
    });
    return result;
  };

  const action = ACTIONS.find(a => a.id === actionId);
  if (!action) {
    return finish({ ok: false, action: actionId, tier: null, error: `Unknown action '${actionId}'.`, ts, actor: actorId });
  }

  const validated = validateParams(action.params, rawParams);
  if (!validated.ok) {
    return finish({
      ok: false, action: action.id, tier: action.tier, ts, actor: actorId,
      error: `Invalid parameters — ${validated.errors.join('; ')}.`,
    });
  }

  // Structural guarantee: owner-only actions are unreachable except by an owner.
  if (action.tier === TIER.OWNER && source !== 'owner') {
    spineEvent('ai_action_refused', {
      action: action.id, actor: actorId, source, reason: 'owner_only',
    }, actorId);
    return finish({
      ok: false, refused: true, action: action.id, tier: action.tier, ts, actor: actorId,
      error: `${action.title} is owner-only and was not executed. Only a console admin may run it.`,
    });
  }

  try {
    const data = await action.run(validated.params, { ...ctx, actorId, source });
    const summary = typeof action.summarize === 'function'
      ? action.summarize(data, validated.params)
      : `${action.title} completed.`;

    if (action.tier !== TIER.READ) {
      spineEvent('ai_action', {
        action: action.id, actor: actorId, source,
        params: validated.params, summary,
      }, actorId);
    }

    return finish({ ok: true, action: action.id, tier: action.tier, summary, data, ts, actor: actorId });
  } catch (error) {
    const message = String(error?.message || error);
    spineEvent('ai_action_failed', { action: action.id, actor: actorId, source, error: message }, actorId);
    return finish({ ok: false, action: action.id, tier: action.tier, error: message, ts, actor: actorId });
  }
}