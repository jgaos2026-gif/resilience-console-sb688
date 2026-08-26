import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { supabaseWriteLimiter } from '../middleware/rateLimit.js';
import { writeAudit } from '../middleware/audit.js';
import {
  getSupabasePayloadByteLimit,
  getSupabaseStatus,
  isSupabasePayloadWithinLimit,
  pushSupabaseEvent,
  runSupabaseFieldSimulations,
} from '../services/supabase.js';

const router = Router();

const pushSchema = z.object({
  eventType: z.string().min(1).max(64),
  source: z.string().min(1).max(64).optional().default('sb688-console'),
  data: z.record(z.unknown()).optional().default({}),
}).superRefine((value, ctx) => {
  if (!isSupabasePayloadWithinLimit(value.data || {})) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `data payload must be ${getSupabasePayloadByteLimit()} bytes or smaller`,
      path: ['data'],
    });
  }
});

const simulationSchema = z.object({
  liveWrite: z.boolean().optional().default(false),
});

router.get('/status', requireAuth, async (req, res, next) => {
  try {
    const status = await getSupabaseStatus();
    writeAudit('supabase_status_checked', req.user.id, { configured: status.configured, verified: status.verified });
    res.json(status);
  } catch (error) {
    next(error);
  }
});

router.get('/http-test-readiness', requireAuth, requireRole('admin', 'operator'), async (req, res, next) => {
  try {
    const status = await getSupabaseStatus();
    const simulations = await runSupabaseFieldSimulations({
      actorId: req.user.id,
      actorRole: req.user.role,
      liveWrite: false,
    });

    const ready = Boolean(status.verified && simulations.passed);
    const blockers = [
      ...(status.verified ? [] : [status.reason || 'Supabase upstream is not verified.']),
      ...simulations.blockers,
    ];

    writeAudit('supabase_http_test_readiness_checked', req.user.id, { ready, blockers });
    res.json({
      ready,
      hardened: true,
      status,
      simulations,
      blockers,
      note: ready
        ? 'HTTP readiness passed hard dry-run simulations.'
        : 'Not ready: one or more hard-readiness checks failed or the upstream remains unverified.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/push', requireAuth, requireRole('admin', 'operator'), supabaseWriteLimiter, async (req, res, next) => {
  try {
    const parsed = pushSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
    }

    const remote = await pushSupabaseEvent({
      ...parsed.data,
      actorId: req.user.id,
      actorRole: req.user.role,
    });

    writeAudit('supabase_event_pushed', req.user.id, {
      eventType: parsed.data.eventType,
      remoteId: remote.id || null,
    });

    res.status(201).json({ ok: true, remote });
  } catch (error) {
    next(error);
  }
});

router.post('/field-simulations', requireAuth, requireRole('admin', 'operator'), supabaseWriteLimiter, async (req, res, next) => {
  try {
    const parsed = simulationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
    }

    const simulations = await runSupabaseFieldSimulations({
      actorId: req.user.id,
      actorRole: req.user.role,
      liveWrite: parsed.data.liveWrite,
    });

    writeAudit('supabase_field_simulations_ran', req.user.id, {
      mode: simulations.mode,
      passed: simulations.passed,
      blockers: simulations.blockers,
    });

    res.status(simulations.passed ? 200 : 409).json(simulations);
  } catch (error) {
    next(error);
  }
});

export default router;
