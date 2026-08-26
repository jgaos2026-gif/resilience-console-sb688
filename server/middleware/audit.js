/**
 * audit.js — Append-only audit log middleware
 *
 * Writes JSON lines to logs/audit.jsonl — no deletes, no overwrites.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR  = path.resolve(__dirname, '../../server/logs');
const LOG_FILE = path.join(LOG_DIR, 'audit.jsonl');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

/**
 * Write an audit entry (append-only, non-blocking).
 */
export function writeAudit(action, actorId, data = {}) {
  const entry = JSON.stringify({
    ts:      new Date().toISOString(),
    action,
    actorId,
    ...data,
  });
  fs.appendFile(LOG_FILE, entry + '\n', 'utf8', (err) => {
    if (err) console.error('[audit] write error:', err.message);
  });
}

/**
 * Express middleware — logs every request.
 */
export function auditMiddleware(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    writeAudit('http', req.user?.id || 'anonymous', {
      method:  req.method,
      path:    req.path,
      status:  res.statusCode,
      ms:      Date.now() - start,
      ip:      req.ip,
    });
  });
  next();
}
