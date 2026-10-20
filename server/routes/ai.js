/**
 * ai.js — /api/ai routes
 *
 * The hardened AI bridge. Every answer is grounded in live, verified console
 * state read from SQLite — never in model improvisation about system status.
 * Every exchange is written to the append-only spine and the audit log.
 */

import { Router } from 'express';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';

import { getDb } from '../db/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { writeAudit } from '../middleware/audit.js';
import { sha256 } from '../services/braidEngine.js';
import { publicProvider, verifyProvider, chatCompletion } from '../services/aiProvider.js';
import { buildGroundingSnapshot, groundingBriefing, composeOfflineReply } from '../services/stateGrounding.js';

const router = Router();

const AVA_LAW = 'NO ACTIVE STATE BECOMES TRUSTED STATE WITHOUT VERIFICATION';

const MODE_LANES = Object.freeze({
  business:   'Business lane: contracts, pricing, deposits, client delivery, contractor control.',
  system:     'System lane: spine, braid integrity, nodes, gates, recovery.',
  compliance: 'Compliance lane: retention, auditability, chain of custody, state tagging.',
  systemb:    'System B lane: independent contractor expansion — contractors never hold money, pricing, refunds, or final files.',
  personal:   'Personal lane: direct, warm, owner-facing conversation.',
  prompt:     'Prompt lane: help the owner sharpen instructions and system prompts.',
  proof:      'Proof lane: evidence, hashes, verification status, and what is still unproven.',
  quiet:      'Quiet lane: short, minimal answers.',
});

function buildSystemPrompt(mode, briefing) {
  return [
    'You are AVA — the Autonomous Virtual Authority of the Resilience Console SB688.',
    `Primary law: ${AVA_LAW}.`,
    MODE_LANES[mode] || MODE_LANES.system,
    '',
    briefing,
    '',
    'Rules:',
    '- Cite only values present in VERIFIED SYSTEM STATE above. If a value is absent, say you do not know it. Never estimate, extrapolate, or invent system status.',
    '- Never claim a system is live, connected, or verified unless the state block says so.',
    '- Distinguish observed from verified: a stored stage is not a certified outcome.',
    '- Be concise and direct. Two short paragraphs at most unless the owner asks for detail.',
  ].join('\n');
}

function toProviderRole(role) {
  if (role === 'owner' || role === 'user') return 'user';
  if (role === 'ava' || role === 'assistant') return 'assistant';
  return 'system';
}

/** GET /api/ai/status — provider configuration, safe to display. */
router.get('/status', requireAuth, (req, res) => {
  res.json({
    ok: true,
    provider: publicProvider(),
    lanes: Object.keys(MODE_LANES),
    ts: new Date().toISOString(),
  });
});

/** GET /api/ai/grounding — the exact verified state the AI is grounded on. */
router.get('/grounding', requireAuth, (req, res) => {
  const snapshot = buildGroundingSnapshot();
  res.json({ ok: true, snapshot, briefing: groundingBriefing(snapshot) });
});

/** POST /api/ai/verify — real round-trip verification of the provider. */
router.post('/verify', requireAuth, requireRole('admin', 'operator'), aiLimiter, async (req, res) => {
  const result = await verifyProvider();

  writeAudit('ai_provider_verify', req.user.id, {
    requestId: req.requestId,
    provider: result.id,
    state: result.state,
    verified: result.verified,
    latency_ms: result.latency_ms,
    correlation_id: result.correlation_id,
  });

  res.json({ ok: true, result });
});

const chatSchema = z.object({
  prompt: z.string().min(1).max(4000).optional(),
  messages: z.array(z.object({
    role: z.enum(['owner', 'ava', 'user', 'assistant', 'system']),
    content: z.string().min(1).max(4000),
  })).max(40).optional(),
  mode: z.enum(Object.keys(MODE_LANES)).optional().default('system'),
}).refine(v => v.prompt || (v.messages && v.messages.length > 0), {
  message: 'A prompt or at least one message is required.',
});

/** POST /api/ai/chat — grounded AVA conversation. */
router.post('/chat', requireAuth, requireRole('admin', 'operator'), aiLimiter, async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
  }

  const { prompt, messages = [], mode } = parsed.data;
  const snapshot = buildGroundingSnapshot();
  const briefing = groundingBriefing(snapshot);

  const history = messages.length
    ? messages.slice(-12).map(m => ({ role: toProviderRole(m.role), content: m.content }))
    : [{ role: 'user', content: prompt }];

  const call = await chatCompletion({
    messages: [{ role: 'system', content: buildSystemPrompt(mode, briefing) }, ...history],
  });

  const asked = prompt || history[history.length - 1]?.content || '';
  const usedFallback = !call.ok || call.offline || !call.content;
  const reply = usedFallback ? composeOfflineReply(asked, snapshot) : call.content;

  const record = {
    exchange_id: randomUUID(),
    request_id: req.requestId || null,
    correlation_id: call.correlationId || null,
    provider: call.provider || null,
    model: call.model || null,
    mode,
    grounded_on: snapshot.source,
    fallback_used: usedFallback,
    question_sha256: sha256(asked),
    reply_sha256: sha256(reply),
    latency_ms: call.latencyMs ?? null,
    state: usedFallback ? (call.state || 'provider_unavailable') : call.state,
  };

  getDb().prepare(
    "INSERT INTO spine_events(event_type, data, actor_id, created_at) VALUES ('ai_exchange', ?, ?, CURRENT_TIMESTAMP)",
  ).run(JSON.stringify(record), String(req.user.id));

  writeAudit('ai_exchange', req.user.id, record);

  res.json({
    ok: true,
    reply,
    provider: publicProvider(),
    grounding: snapshot,
    evidence: record,
  });
});

export default router;