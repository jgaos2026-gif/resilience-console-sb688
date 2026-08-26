import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DB_PATH = path.resolve(__dirname, '../data/resilience.db');
const DEFAULT_FRONTEND_ORIGIN = 'http://localhost:5173';
const IDENTIFIER_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

const rawEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).optional().default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).optional().default(3001),
  DB_PATH: z.string().min(1).optional().default(DEFAULT_DB_PATH),
  FRONTEND_ORIGIN: z.string().url().optional().default(DEFAULT_FRONTEND_ORIGIN),
  JWT_SECRET: z.string().min(32).optional(),
  ADMIN_PASSWORD: z.string().min(12).optional(),
  ALLOW_DEV_AUTH_BYPASS: z.enum(['true', 'false']).optional().default('false'),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_SCHEMA: z.string().regex(IDENTIFIER_RE).optional().default('public'),
  SUPABASE_EVENTS_TABLE: z.string().regex(IDENTIFIER_RE).optional().default('sb688_sync_events'),
});

function validateHttpsUrl(value, fieldName, isDev) {
  if (!value) return;
  const url = new URL(value);
  if (isDev && url.protocol === 'http:') return;
  if (url.protocol !== 'https:') {
    throw new Error(`${fieldName} must use https outside development.`);
  }
}

function parseEnv() {
  const parsed = rawEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`);
  }

  const env = parsed.data;
  const isDev = env.NODE_ENV !== 'production';
  const allowDevAuthBypass = env.ALLOW_DEV_AUTH_BYPASS === 'true';

  validateHttpsUrl(env.FRONTEND_ORIGIN, 'FRONTEND_ORIGIN', isDev);
  validateHttpsUrl(env.SUPABASE_URL, 'SUPABASE_URL', isDev);

  if (!env.JWT_SECRET && !(isDev && allowDevAuthBypass)) {
    throw new Error('JWT_SECRET must be set to at least 32 characters. For local development only, set ALLOW_DEV_AUTH_BYPASS=true to enable the explicit auth bypass.');
  }

  if (env.ADMIN_PASSWORD && env.ADMIN_PASSWORD === 'CHANGEME_SET_AT_BOOT') {
    throw new Error('ADMIN_PASSWORD must be changed from the bootstrap placeholder.');
  }

  if (!!env.SUPABASE_URL !== !!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be provided together.');
  }

  return {
    nodeEnv: env.NODE_ENV,
    isDev,
    port: env.PORT,
    dbPath: env.DB_PATH,
    frontendOrigin: env.FRONTEND_ORIGIN,
    jwtSecret: env.JWT_SECRET || '',
    allowDevAuthBypass,
    adminPassword: env.ADMIN_PASSWORD || '',
    supabase: {
      enabled: Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
      url: env.SUPABASE_URL || '',
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY || '',
      schema: env.SUPABASE_SCHEMA,
      eventsTable: env.SUPABASE_EVENTS_TABLE,
    },
  };
}

export const config = Object.freeze(parseEnv());
