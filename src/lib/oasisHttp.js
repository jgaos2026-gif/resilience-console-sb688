import { addProof, localHash } from "@/lib/avaLocal";

const OASIS_BASE = "http://127.0.0.1:7888";
const STATUS_PATH = "/api/status";
const SUPABASE_STATUS_PATH = "/api/supabase/status";
const TOKEN_KEY = "jga_ava_oasis_read_token_v1";
const EVIDENCE_KEY = "jga_ava_oasis_http_evidence_v1";

function readEvidence() {
  try { return JSON.parse(localStorage.getItem(EVIDENCE_KEY) || "[]"); }
  catch { return []; }
}

function writeEvidence(entry) {
  const next = [entry, ...readEvidence()].slice(0, 500);
  localStorage.setItem(EVIDENCE_KEY, JSON.stringify(next));
  return entry;
}

export function setOasisReadToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getOasisReadToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function getOasisHttpEvidence() {
  return readEvidence();
}

function timeoutSignal(ms = 5000) {
  if (typeof AbortSignal !== "undefined" && AbortSignal.timeout) return AbortSignal.timeout(ms);
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

async function getJson(path, authorization = {}) {
  const correlationId = crypto.randomUUID();
  const token = getOasisReadToken();
  const issuedAt = new Date().toISOString();

  if (authorization.subject !== "AVA" || authorization.scope !== "status:read") {
    const blocked = writeEvidence({
      correlationId,
      path,
      issued_at: issuedAt,
      state: "blocked_authorization",
      authorization,
      hash: localHash(JSON.stringify({ correlationId, path, issuedAt, authorization })),
    });
    addProof("HTTP_BLOCK", "AVA blocked OASIS HTTP request: missing status:read authorization", blocked);
    return { configured: true, live: false, tested: false, verified: false, ...blocked };
  }

  const headers = {
    Accept: "application/json",
    "Cache-Control": "no-store",
    "X-AVA-Correlation-ID": correlationId,
    "X-AVA-Authorization": "status:read",
  };
  if (token) headers["X-OASIS-AVA-Token"] = token;

  const url = `${OASIS_BASE}${path}`;
  try {
    const response = await fetch(url, { method: "GET", headers, cache: "no-store", signal: timeoutSignal() });
    const raw = await response.text();
    let body;
    try { body = raw ? JSON.parse(raw) : null; }
    catch { body = { raw: raw.slice(0, 4000) }; }

    const responseCorrelation = response.headers.get("X-AVA-Correlation-ID") || body?.correlationId || null;
    const payloadHash = localHash(raw || "");
    const evidence = writeEvidence({
      correlationId,
      responseCorrelation,
      path,
      url,
      issued_at: issuedAt,
      completed_at: new Date().toISOString(),
      http_status: response.status,
      authorization_scope: "status:read",
      request_authenticated: !!token,
      payload_hash: payloadHash,
      state: response.ok ? "http_success" : `http_${response.status}`,
    });

    addProof(response.ok ? "HTTP_READ" : "HTTP_FAILURE", `AVA OASIS GET ${path} -> ${response.status}`, evidence);

    return {
      configured: true,
      live: response.ok,
      tested: true,
      verified: response.ok && (!responseCorrelation || responseCorrelation === correlationId),
      correlationId,
      responseCorrelation,
      payloadHash,
      status: response.status,
      body,
      evidence,
    };
  } catch (error) {
    const failure = writeEvidence({
      correlationId,
      path,
      url,
      issued_at: issuedAt,
      completed_at: new Date().toISOString(),
      state: "request_failed",
      error: String(error?.message || error),
      hash: localHash(`${correlationId}|${path}|${String(error?.message || error)}`),
    });
    addProof("HTTP_FAILURE", `AVA OASIS GET ${path} failed`, failure);
    return { configured: true, live: false, tested: true, verified: false, ...failure };
  }
}

export async function getOasisStatus() {
  return getJson(STATUS_PATH, { subject: "AVA", scope: "status:read" });
}

export async function getOasisSupabaseStatus() {
  return getJson(SUPABASE_STATUS_PATH, { subject: "AVA", scope: "status:read" });
}

export async function verifyOasisReadOnlyEndToEnd() {
  const first = await getOasisStatus();
  if (!first.verified) return { configured: true, live: first.live, tested: true, verified: false, first, state: "first_request_failed" };

  const second = await getOasisStatus();
  const independent = second.verified && second.correlationId !== first.correlationId && second.payloadHash;
  const ledger = getOasisHttpEvidence().filter(x => x.path === STATUS_PATH).slice(0, 2);
  const ledgerHash = localHash(JSON.stringify(ledger));
  const result = {
    configured: true,
    live: !!second.live,
    tested: true,
    verified: !!independent,
    first,
    second,
    ledger_entries: ledger.length,
    ledger_hash: ledgerHash,
    state: independent ? "verified_read_only" : "independent_verification_failed",
  };
  addProof(independent ? "HTTP_E2E_VERIFIED" : "HTTP_E2E_FAILED", "AVA -> OASIS read-only end-to-end verification", result);
  return result;
}

export const OASIS_HTTP_CONTRACT = Object.freeze({
  baseUrl: OASIS_BASE,
  readOnly: [STATUS_PATH, SUPABASE_STATUS_PATH],
  source: "jgaos2026-gif/oasis runtime/Start-OASISControlRoom.ps1",
});
