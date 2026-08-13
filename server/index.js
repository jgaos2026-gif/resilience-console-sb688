/**
 * server/index.js — Hardened Express backend for Resilience Console SB688
 *
 * Founded on braided computational topology:
 *   - All data integrity uses SHA-256 braid hash-chains
 *   - Alexander polynomial invariants detect topology-breaking tampering
 *   - Braid group Bₙ generators encode every state transition
 */

import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDb, getDb } from './db/database.js';
import { auditMiddleware, writeAudit } from './middleware/audit.js';
import { apiLimiter } from './middleware/rateLimit.js';

import authRoutes       from './routes/auth.js';
import healthRoutes     from './routes/health.js';
import spineRoutes      from './routes/spine.js';
import nodesRoutes      from './routes/nodes.js';
import verifyRoutes     from './routes/verification.js';
import proofRoutes      from './routes/proof.js';
import reportsRoutes    from './routes/reports.js';
import recoveryRoutes   from './routes/recovery.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT      = process.env.PORT || 3001;
const DB_PATH   = process.env.DB_PATH || path.resolve(__dirname, '../data/resilience.db');
const ORIGIN    = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// ── Initialize DB ─────────────────────────────────────────────────────────────
initDb(DB_PATH);

// ── Set admin password on first boot if provided ──────────────────────────────
const adminPass = process.env.ADMIN_PASSWORD;
if (adminPass) {
  const db   = getDb();
  const user = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
  if (user && user.password_hash === 'CHANGEME_SET_AT_BOOT') {
    const hash = bcrypt.hashSync(adminPass, 12);
    db.prepare("UPDATE users SET password_hash = ? WHERE username = 'admin'").run(hash);
    writeAudit('admin_password_set', 'system', { source: 'env' });
    console.log('[boot] Admin password set from ADMIN_PASSWORD env var.');
  }
}

// ── Express app ───────────────────────────────────────────────────────────────
const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:'],
      connectSrc: ["'self'", ORIGIN],
    },
  },
}));

app.use(cors({
  origin: ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '256kb' }));
app.use(apiLimiter);
app.use(auditMiddleware);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/health',       healthRoutes);
app.use('/api/spine',        spineRoutes);
app.use('/api/nodes',        nodesRoutes);
app.use('/api/verification', verifyRoutes);
app.use('/api/proof',        proofRoutes);
app.use('/api/reports',      reportsRoutes);
app.use('/api/recovery',     recoveryRoutes);

// ── 404 + error handlers ──────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

 
app.use((err, req, res, _next) => {
  console.error('[server error]', err);
  writeAudit('server_error', req.user?.id || 'anonymous', { message: err.message, path: req.path });
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[SB688] Resilience Console backend — port ${PORT}`);
  console.log(`[SB688] DB: ${DB_PATH}`);
  console.log(`[SB688] CORS origin: ${ORIGIN}`);
  console.log(`[SB688] Braided topology engine: B₇ (7 strands, SHA-256, Alexander invariant)`);
});

export default app;
