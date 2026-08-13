/**
 * auth.js — JWT verification middleware
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn('[auth] WARNING: JWT_SECRET not set. Authentication disabled in dev mode.');
}

/**
 * requireAuth — Express middleware that verifies a ******
 * In development (no JWT_SECRET) it allows all requests and sets req.user to { id: 'dev', role: 'admin' }.
 */
export function requireAuth(req, res, next) {
  if (!JWT_SECRET) {
    req.user = { id: 'dev', role: 'admin' };
    return next();
  }

  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
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
  if (!JWT_SECRET) return 'dev-token';
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}
