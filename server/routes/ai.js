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
import { AVA_LANES, AVA_MODES, getAvaControl, listAvaMemory, avaControlBriefing } from '../services/avaControl.js';
import { getToolCatalog, buildProviderTools, buildToolBriefing, executeAction } from '../services/actionRegistry.js';

const router = Router();

const AVA_LAW = 'NO ACTIVE STATE BECOMES TRUSTED STATE WITHOUT VERIFICATION';

/** Ceiling on tool round-trips inside a single conversation turn. */
const MAX_TOOL_STEPS = 3;

function buildSystemPrompt(mode, briefing, control) {
  return [
    'You are AVA — the Autonomous Virtual Authority of the Resilience Console SB688.',
    `Primary law: ${AVA_LAW}.`,
    AVA_LANES[mode] || AVA_LANES.system,
    '',
    briefing,
    '',
    avaControlBriefing(control),
    '',
    buildToolBriefing(),
    '',
    'Rules:',
    '- Cite only values present in VERIFIED SYSTEM STATE above, or returned by a tool you actually called. If a value is absent, say you do not know it. Never estimate, extrapolate, or invent system status.',
    '- Never claim a system is live, connected, or verified unless the state block says so.',
    '- Distinguish observed from verified: a stored stage is not a certified outcome.',
    '- When you change anything, state plainly what you changed and what the tool returned.',
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

/** GET /api/ai/tools — the governed action catalog, for display. */
router.get('/tools', requireAuth, (req, res) => {
  res.json({
    ok: true,
    tools: getToolCatalog(),
    max_steps_per_turn: MAX_TOOL_STEPS,
    ts: new Date().toISOString(),
  });
});

/** GET /api/ai/control — AVA's persisted control state. */
router.get('/control', requireAuth, (req, res) => {
  res.json({
    ok: true,
    control: getAvaControl(),
    modes: AVA_MODES,
    memory: listAvaMemory(10),
    ts: new Date().toISOString(),
  });
});

const actSchema = z.object({
  action: z.string().min(1).max(64),
  params: z.record(z.any()).optional().default({}),
});

/**
 * POST /api/ai/act — run one governed action directly from the console.
 *
 * Privilege boundary: only a console `admin` counts as an owner, so owner-only
 * actions (Phoenix recovery) are reachable here by admins and refused for
 * everyone else. The AI itself is never an owner on any path.
 */
router.post('/act', requireAuth, requireRole('admin', 'operator'), aiLimiter, async (req, res) => {
  const parsed = actSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
  }

  const result = await executeAction(parsed.data.action, parsed.data.params, {
    actorId: req.user.id,
    role: req.user.role,
    source: req.user.role === 'admin' ? 'owner' : 'operator',
  });

  // `error` mirrors the reason so an HTTP client sees it on the non-2xx path too.
  res.status(result.ok ? 200 : result.refused ? 403 : 400).json({
    ok: result.ok,
    result,
    error: result.error || undefined,
  });
});

const chatSchema = z.object({
  prompt: z.string().min(1).max(4000).optional(),
  messages: z.array(z.object({
    role: z.enum(['owner', 'ava', 'user', 'assistant', 'system']),
    content: z.string().min(1).max(4000),
  })).max(40).optional(),
  mode: z.enum(AVA_MODES).optional().default('system'),
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
  const control = getAvaControl();

  const history = messages.length
    ? messages.slice(-12).map(m => ({ role: toProviderRole(m.role), content: m.content }))
    : [{ role: 'user', content: prompt }];

  const thread = [{ role: 'system', content: buildSystemPrompt(mode, briefing, control) }, ...history];

  // The AI is never an owner: even when an admin is chatting, anything the model
  // triggers is sourced as 'muse' so owner-only actions stay structurally out of reach.
  const ctx = { actorId: req.user.id, role: req.user.role, source: 'muse' };

  const tools = buildProviderTools();
  const actions = [];
  let call = await chatCompletion({ messages: thread, tools, toolChoice: 'auto' });
  let steps = 0;

  while (call.ok && call.toolCalls?.length) {
    if (steps >= MAX_TOOL_STEPS) {
      // Step budget spent — force prose with tool calling switched off.
      call = await chatCompletion({ messages: thread, temperature: 0.3 });
      break;
    }
    steps += 1;

    thread.push({
      role: 'assistant',
      content: call.content || null,
      tool_calls: call.toolCalls.map(tc => ({
        id: tc.id, type: 'function', function: { name: tc.name, arguments: tc.arguments },
      })),
    });

    for (const tc of call.toolCalls) {
      let args = {};
      try { args = JSON.parse(tc.arguments || '{}'); } catch (_) { args = {}; }

      const result = await executeAction(tc.name, args, ctx);

      actions.push({
        action: result.action,
        tier: result.tier,
        ok: result.ok,
        refused: !!result.refused,
        summary: result.summary || null,
        error: result.error || null,
      });

      // Bound what the model sees so one large read cannot blow the context.
      thread.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: JSON.stringify(result).slice(0, 6000),
      });
    }

    call = await chatCompletion({ messages: thread, tools, toolChoice: 'auto' });
  }

  const asked = prompt || history[history.length - 1]?.content || '';
  const usedFallback = !call?.ok || call.offline || !call.content;
  const reply = usedFallback ? composeOfflineReply(asked, snapshot) : call.content;

  const record = {
    exchange_id: randomUUID(),
    request_id: req.requestId || null,
    correlation_id: call?.correlationId || null,
    provider: call?.provider || null,
    model: call?.model || null,
    mode,
    grounded_on: snapshot.source,
    fallback_used: usedFallback,
    tools_offered: tools.length,
    tool_steps: steps,
    actions_taken: actions,
    question_sha256: sha256(asked),
    reply_sha256: sha256(reply),
    latency_ms: call?.latencyMs ?? null,
    state: usedFallback ? (call?.state || 'provider_unavailable') : call.state,
  };

  getDb().prepare(
    "INSERT INTO spine_events(event_type, data, actor_id, created_at) VALUES ('ai_exchange', ?, ?, CURRENT_TIMESTAMP)",
  ).run(JSON.stringify(record), String(req.user.id));

  writeAudit('ai_exchange', req.user.id, record);

  res.json({
    ok: true,
    reply,
    actions,
    control: getAvaControl(),
    provider: publicProvider(),
    grounding: snapshot,
    evidence: record,
  });
});

export default router;