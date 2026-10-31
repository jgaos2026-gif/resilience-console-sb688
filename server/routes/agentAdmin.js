/**
 * agentAdmin.js — /api/agent-admin/* — token management.
 *
 * Deliberately NOT part of /api/agent: these routes require a console admin
 * session (JWT + admin role), so an agent token can never reach the settings
 * that govern it. This is what keeps "no endpoint may alter these API settings"
 * true even for a leaked control token.
 *
 * The plaintext token is returned by the generate call and by nothing else.
 */

import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { writeAudit } from '../middleware/audit.js';
import { listTokens, generateToken, revokeToken, SCOPE_LABEL } from '../services/agentTokens.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

/** GET /api/agent-admin/tokens — metadata only. */
router.get('/tokens', (req, res) => {
  res.json({ ok: true, ...listTokens(), scopes: SCOPE_LABEL, ts: new Date().toISOString() });
});

/** POST /api/agent-admin/tokens/:scope/generate — issue or rotate; plaintext returned once. */
router.post('/tokens/:scope/generate', (req, res) => {
  const { scope } = req.params;
  if (!SCOPE_LABEL[scope]) {
    return res.status(400).json({ error: `Unknown scope '${scope}'. Use 'read' or 'control'.` });
  }

  try {
    const issued = generateToken(scope, req.user?.username || req.user?.id || 'owner');
    writeAudit('agent_token_generated', req.user?.username || 'owner', {
      scope, token_id: issued.id, token_prefix: issued.token_prefix,
    });
    res.json({
      ok: true,
      scope: issued.scope,
      id: issued.id,
      token: issued.token,
      token_prefix: issued.token_prefix,
      notice: 'Copy this now. It is shown once and cannot be retrieved again.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/agent-admin/tokens/:id/revoke — instant. */
router.post('/tokens/:id/revoke', (req, res) => {
  try {
    const revoked = revokeToken(req.params.id, req.user?.username || req.user?.id || 'owner');
    writeAudit('agent_token_revoked', req.user?.username || 'owner', {
      scope: revoked.scope, token_id: revoked.id, token_prefix: revoked.token_prefix,
    });
    res.json({ ok: true, revoked, ts: new Date().toISOString() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;