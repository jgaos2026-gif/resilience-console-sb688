/**
 * aiProvider.js — Provider-agnostic AI transport for Resilience Console SB688.
 *
 * Selected entirely by environment so no key ever lives in the browser bundle:
 *
 *   AI_PROVIDER=muse    Muse AI, or any Muse-compatible /chat/completions root
 *   AI_PROVIDER=openai  OpenAI
 *   AI_PROVIDER=none    No external call; the console answers from verified state
 *
 * Nothing in here invents a live call. If the provider is not configured, the
 * result says so explicitly and the caller falls back to grounded state.
 */

import { randomUUID } from 'node:crypto';
import { sha256 } from './braidEngine.js';

export const PROVIDERS = Object.freeze({
  muse: {
    label: 'Muse AI',
    baseUrlEnv: 'MUSE_BASE_URL',
    apiKeyEnv: 'MUSE_API_KEY',
    modelEnv: 'MUSE_MODEL',
    defaultModel: 'muse-1',
    requiresBaseUrl: true,
  },
  openai: {
    label: 'OpenAI',
    baseUrlEnv: 'OPENAI_BASE_URL',
    apiKeyEnv: 'OPENAI_API_KEY',
    modelEnv: 'OPENAI_MODEL',
    defaultModel: 'gpt-4o-mini',
    defaultBaseUrl: 'https://api.openai.com/v1',
    requiresBaseUrl: false,
  },
});

const OFFLINE_ID = 'none';

function safeJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch (_) { return { raw: String(text).slice(0, 800) }; }
}

function hostOf(url) {
  try { return new URL(url).host; } catch (_) { return null; }
}

/**
 * Resolve the configured provider. Returns the API key for internal use only —
 * callers that answer HTTP requests must use publicProvider() instead.
 */
export function resolveProvider() {
  const requested = String(process.env.AI_PROVIDER || 'muse').trim().toLowerCase();

  if (requested === OFFLINE_ID || requested === 'offline') {
    return {
      id: OFFLINE_ID,
      label: 'Grounded state responder',
      model: 'sb688-grounded-state',
      configured: true,
      offline: true,
      apiKey: null,
      baseUrl: null,
      missing: [],
    };
  }

  const spec = PROVIDERS[requested];
  if (!spec) {
    return {
      id: requested,
      label: requested,
      model: null,
      configured: false,
      offline: false,
      apiKey: null,
      baseUrl: null,
      missing: [],
      reason: `Unknown AI_PROVIDER '${requested}'. Supported: ${Object.keys(PROVIDERS).join(', ')}, none.`,
    };
  }

  const baseUrl = String(process.env[spec.baseUrlEnv] || spec.defaultBaseUrl || '').trim().replace(/\/+$/, '');
  const apiKey = String(process.env[spec.apiKeyEnv] || '').trim();
  const model = String(process.env[spec.modelEnv] || spec.defaultModel).trim();

  const missing = [];
  if (spec.requiresBaseUrl && !baseUrl) missing.push(spec.baseUrlEnv);
  if (!apiKey) missing.push(spec.apiKeyEnv);

  return {
    id: requested,
    label: spec.label,
    model,
    baseUrl,
    apiKey,
    missing,
    configured: missing.length === 0,
    offline: false,
  };
}

/** Provider description that is safe to return over HTTP — never includes the key. */
export function publicProvider(provider = resolveProvider()) {
  return {
    id: provider.id,
    label: provider.label,
    model: provider.model,
    base_url_host: hostOf(provider.baseUrl),
    configured: !!provider.configured,
    offline: !!provider.offline,
    api_key_present: !!provider.apiKey,
    missing_env: provider.missing || [],
    reason: provider.reason || null,
  };
}

function timeoutSignal(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

/**
 * Perform a real chat-completions call.
 * Returns a structured result — never throws for provider-side problems.
 */
export async function chatCompletion({ messages = [], temperature = 0.3, maxTokens = 900, retries = 1 } = {}) {
  const provider = resolveProvider();
  const correlationId = randomUUID();
  const startedAt = Date.now();

  if (provider.offline) {
    return {
      ok: true, offline: true, provider: provider.id, model: provider.model,
      correlationId, latencyMs: 0, content: null, state: 'offline_provider_selected',
    };
  }

  if (!provider.configured) {
    return {
      ok: false, offline: false, provider: provider.id, model: provider.model,
      correlationId, latencyMs: 0, content: null, state: 'not_configured',
      error: provider.reason || `AI provider '${provider.id}' is not configured. Missing environment: ${provider.missing.join(', ')}.`,
    };
  }

  const url = `${provider.baseUrl}/chat/completions`;
  const budgetMs = Number(process.env.AI_TIMEOUT_MS || 45000);
  const payload = { model: provider.model, messages, temperature, max_tokens: maxTokens, stream: false };

  let last = { state: 'no_attempt', error: 'No provider call was attempted.' };

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const clock = timeoutSignal(budgetMs);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: clock.signal,
      });
      const raw = await response.text();

      if (!response.ok) {
        const body = safeJson(raw);
        const message = body?.error?.message || body?.message || `Provider returned HTTP ${response.status}.`;
        last = { state: `http_${response.status}`, error: message };
        // Retry only on transient provider conditions.
        if (response.status >= 500 || response.status === 429) continue;
        break;
      }

      const body = safeJson(raw);
      const content = body?.choices?.[0]?.message?.content;
      if (typeof content !== 'string' || !content.trim()) {
        last = { state: 'malformed_response', error: 'Provider returned no message content.' };
        break;
      }

      return {
        ok: true, offline: false, provider: provider.id,
        model: body?.model || provider.model,
        correlationId, latencyMs: Date.now() - startedAt,
        content,
        usage: body?.usage || null,
        response_sha256: sha256(content),
        state: 'live_response',
      };
    } catch (error) {
      const aborted = error?.name === 'AbortError' || error?.name === 'TimeoutError';
      last = aborted
        ? { state: 'timeout', error: `Provider call exceeded ${budgetMs}ms.` }
        : { state: 'network_error', error: String(error?.message || error) };
    } finally {
      clock.clear();
    }
  }

  return {
    ok: false, offline: false, provider: provider.id, model: provider.model,
    correlationId, latencyMs: Date.now() - startedAt, content: null, ...last,
  };
}

/**
 * Real round-trip verification of the configured provider.
 * `verified` is only true when the provider echoed the exact challenge token.
 */
export async function verifyProvider() {
  const provider = resolveProvider();

  if (provider.offline) {
    return {
      ...publicProvider(provider),
      configured: true, live: false, tested: true, verified: true,
      state: 'offline_provider_selected',
      detail: 'AI_PROVIDER=none — the console answers from verified state without an external call.',
    };
  }

  const challenge = 'SB688-LINK-OK';
  const call = await chatCompletion({
    messages: [
      { role: 'system', content: 'You are a connectivity probe. Reply with the challenge token and nothing else.' },
      { role: 'user', content: `Reply with exactly: ${challenge}` },
    ],
    temperature: 0,
    maxTokens: 32,
    retries: 0,
  });

  const content = String(call.content || '').trim();
  const reachable = call.ok === true;
  const matched = reachable && content.toUpperCase().includes(challenge);
  const excerpt = content.slice(0, 200);

  return {
    ...publicProvider(provider),
    live: reachable,
    tested: true,
    verified: reachable && matched,
    state: reachable ? (matched ? 'verified_live' : 'live_response_unexpected') : (call.state || 'unreachable'),
    correlation_id: call.correlationId || null,
    latency_ms: call.latencyMs ?? null,
    response_sha256: call.response_sha256 || null,
    response_excerpt: excerpt || null,
    error: call.error || null,
  };
}