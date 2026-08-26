/**
 * rateLimit.js — Per-IP rate limiting via express-rate-limit
 */

import rateLimit from 'express-rate-limit';

/** Strict limiter for auth endpoints */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Try again in 15 minutes.' },
});

/** Standard limiter for all API endpoints */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. Max 200 requests per minute.' },
});

/** Strict limiter for proof generation (expensive operation) */
export const proofLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Proof rate limit exceeded. Max 20 per minute.' },
});

/** Tight limiter for upstream sync operations */
export const supabaseWriteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Supabase sync rate limit exceeded. Max 30 per minute.' },
});
