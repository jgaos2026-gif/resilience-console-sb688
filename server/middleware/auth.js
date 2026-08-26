/**
 * auth.js — JWT verification middleware
 */

import jwt from 'jsonwebtoken';
import { config } from '../config.js';

if (!config.jwtSecret && config.allowDevAuthBypass) {
  console.warn('[auth] WARNING: explicit development auth bypass is active. DO NOT use in production.');
}

/**
 * requireAuth — Express middleware that verifies a JWT ******
 * In development only (NODE_ENV != production, no JWT_SECRET) it allows all requests
 * with a synthetic dev user. In production, JWT_SECRET absence causes process exit at startup.
 */
export function requireAuth(req, res, next) {
  if (!config.jwtSecret && config.allowDevAuthBypass) {
    req.user = { id: 'dev', username: 'dev', role: 'admin' };
    return next();
  }

  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * requireRole — check that req.user.role is in the allowed list.
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Role '${req.user.role}' not permitted` });
    }
    next();
  };
}

/**
 * Sign a JWT token for a user payload.
 */
export function signToken(payload, expiresIn = '8h') {
  if (!config.jwtSecret) return 'dev-token';
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
}
