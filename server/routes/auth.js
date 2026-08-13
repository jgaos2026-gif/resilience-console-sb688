/**
 * auth.js — /api/auth routes
 */

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getDb } from '../db/database.js';
import { signToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { writeAudit } from '../middleware/audit.js';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(128),
});

router.post('/login', authLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
  }

  const { username, password } = parsed.data;
  const db   = getDb();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user) {
    writeAudit('login_fail', 'anonymous', { username, reason: 'user_not_found', ip: req.ip });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Handle first-boot placeholder
  if (user.password_hash === 'CHANGEME_SET_AT_BOOT') {
    return res.status(403).json({ error: 'Admin password not configured. Set ADMIN_PASSWORD in .env and restart.' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    writeAudit('login_fail', username, { reason: 'wrong_password', ip: req.ip });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken({ id: user.id, username: user.username, role: user.role });
  writeAudit('login_success', username, { ip: req.ip, role: user.role });

  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

router.post('/logout', (req, res) => {
  writeAudit('logout', req.user?.username || 'unknown', { ip: req.ip });
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ user: req.user });
});

export default router;
