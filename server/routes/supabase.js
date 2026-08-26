import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { supabaseWriteLimiter } from '../middleware/rateLimit.js';
import { writeAudit } from '../middleware/audit.js';
import { getSupabaseStatus, pushSupabaseEvent } from '../services/supabase.js';

const router = Router();

const pushSchema = z.object({
  eventType: z.string().min(1).max(64),
  source: z.string().min(1).max(64).optional().default('sb688-console'),
  data: z.record(z.unknown()).optional().default({}),
}).superRefine((value, ctx) => {
  const size = Buffer.byteLength(JSON.stringify(value.data || {}), 'utf8');
  if (size > 16 * 1024) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'data payload must be 16KB or smaller',
      path: ['data'],
    });
  }
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

export default router;
