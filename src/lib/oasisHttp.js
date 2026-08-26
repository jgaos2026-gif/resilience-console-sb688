import { addProof } from "@/lib/avaLocal";

const OASIS_BASE = "http://127.0.0.1:7888";
const STATUS_PATH = "/api/status";
const SUPABASE_STATUS_PATH = "/api/supabase/status";
const CORRUPTION_PROOF_STATUS_PATH = "/api/proof/corruption-test/status";
const CORRUPTION_PROOF_RUN_PATH = "/api/proof/corruption-test";
const TOKEN_KEY = "jga_ava_oasis_read_token_v1";
const EVIDENCE_KEY = "jga_ava_oasis_http_evidence_v1";
let proofExecutionToken = "";

function readEvidence() {
  try { return JSON.parse(localStorage.getItem(EVIDENCE_KEY) || "[]"); }
  catch { return []; }
}

function writeEvidence(entry) {
  const next = [entry, ...readEvidence()].slice(0, 500);
  localStorage.setItem(EVIDENCE_KEY, JSON.stringify(next));
  return entry;
}

async function sha256Hex(text = "") {
  if (!globalThis.crypto?.subtle) throw new Error("Web Crypto SHA-256 is unavailable in this runtime.");
  const bytes = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function findServerLedgerProof(proofs, correlationId, event = "AvaReadStatus") {
  return Array.isArray(proofs) && proofs.some(record =>
    record?.event === event && record?.data?.correlationId === correlationId
  );
}

export function setOasisReadToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getOasisReadToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setOasisProofExecutionToken(token) {
  proofExecutionToken = token || "";
}

export function clearOasisProofExecutionToken() {
  proofExecutionToken = "";
}

export function getOasisHttpEvidence() {
  return readEvidence();
}

function timeoutSignal(ms = 10000) {
  if (typeof AbortSignal !== "undefined" && AbortSignal.timeout) return AbortSignal.timeout(ms);
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

async function requestJson(path, { method = "GET", scope = "status:read", token = "", timeoutMs = 10000 } = {}) {
  const correlationId = crypto.randomUUID();
  const issuedAt = new Date().toISOString();
  const readToken = getOasisReadToken();
  const headers = {
    Accept: "application/json",
    "Cache-Control": "no-store",
    "X-AVA-Correlation-ID": correlationId,
    "X-AVA-Authorization": scope,
  };
  if (scope === "status:read" && readToken) headers["X-OASIS-AVA-Token"] = readToken;
  if (scope === "proof:execute" && token) headers["X-OASIS-AVA-Proof-Token"] = token;

  const url = `${OASIS_BASE}${path}`;
  try {
    const response = await fetch(url, { method, headers, cache: "no-store", signal: timeoutSignal(timeoutMs) });
    const raw = await response.text();
    let body;
    try { body = raw ? JSON.parse(raw) : null; }
    catch { body = { raw: raw.slice(0, 4000) }; }

    const headerCorrelation = response.headers.get("X-AVA-Correlation-ID");
    const bodyCorrelation = body?.correlationId || null;
    const correlationVerified = headerCorrelation === correlationId && (bodyCorrelation === null || bodyCorrelation === correlationId);
    const payloadSha256 = await sha256Hex(raw || "");
    const evidence = writeEvidence({
      correlationId,
      headerCorrelation,
      bodyCorrelation,
      correlationVerified,
      path,
      url,
      method,
      issued_at: issuedAt,
      completed_at: new Date().toISOString(),
      http_status: response.status,
      authorization_scope: scope,
      payload_hash_algorithm: "sha256",
      payload_sha256: payloadSha256,
      state: response.ok ? "http_success" : `http_${response.status}`,
    });

    addProof(response.ok ? "HTTP_RUNTIME" : "HTTP_FAILURE", `AVA OASIS ${method} ${path} -> ${response.status}`, evidence);
    return {
      configured: true,
      live: response.ok,
      tested: true,
      verified: response.ok && correlationVerified,
      correlationId,
      headerCorrelation,
      bodyCorrelation,
      correlationVerified,
      payloadSha256,
      status: response.status,
      body,
      evidence,
    };
  } catch (error) {
    const errorText = String(error?.message || error);
    const hash = await sha256Hex(`${correlationId}|${method}|${path}|${errorText}`);
    const failure = writeEvidence({
      correlationId,
      path,
      url,
      method,
      issued_at: issuedAt,
      completed_at: new Date().toISOString(),
      state: "request_failed",
      error: errorText,
      hash_algorithm: "sha256",
      hash,
    });
    addProof("HTTP_FAILURE", `AVA OASIS ${method} ${path} failed`, failure);
    return { configured: true, live: false, tested: true, verified: false, ...failure };
  }
}

export async function getOasisStatus() {
  return requestJson(STATUS_PATH, { method: "GET", scope: "status:read" });
}

export async function getOasisSupabaseStatus() {
  return requestJson(SUPABASE_STATUS_PATH, { method: "GET", scope: "status:read" });
}

export async function getCorruptionProofStatus() {
  return requestJson(CORRUPTION_PROOF_STATUS_PATH, { method: "GET", scope: "status:read" });
}

export async function runCorruptionProof() {
  if (!proofExecutionToken) {
    const blocked = {
      configured: true,
      live: false,
      tested: false,
      verified: false,
      state: "blocked_missing_proof_execution_token",
    };
    addProof("PROOF_EXECUTION_BLOCKED", "Corruption proof execution blocked: no in-memory proof token", blocked);
    return blocked;
  }

  const result = await requestJson(CORRUPTION_PROOF_RUN_PATH, {
    method: "POST",
    scope: "proof:execute",
    token: proofExecutionToken,
    timeoutMs: 120000,
  });
  clearOasisProofExecutionToken();

  const proofVerified = !!(
    result.verified &&
    result.body?.sandboxed === true &&
    result.body?.productionDataTouched === false &&
    result.body?.configured === true &&
    result.body?.live === true &&
    result.body?.tested === true &&
    result.body?.verified === true &&
    result.body?.outputSha256
  );

  const finalResult = { ...result, verified: proofVerified, proofVerified };
  addProof(proofVerified ? "CORRUPTION_PROOF_VERIFIED" : "CORRUPTION_PROOF_FAILED", "Sovereign Stitch corruption inject-detect-heal-validate proof", finalResult);
  return finalResult;
}

export async function verifyOasisReadOnlyEndToEnd() {
  const first = await getOasisStatus();
  if (!first.verified) return { configured: true, live: first.live, tested: true, verified: false, first, state: "first_request_failed" };

  const second = await getOasisStatus();
  const distinctRequests = second.verified && second.correlationId !== first.correlationId;
  const ledgerProofForFirst = findServerLedgerProof(second.body?.proofs, first.correlationId, "AvaReadStatus");
  const clientEvidence = getOasisHttpEvidence().filter(x => x.path === STATUS_PATH).slice(0, 2);
  const clientEvidenceSha256 = await sha256Hex(JSON.stringify(clientEvidence));
  const verified = !!(distinctRequests && ledgerProofForFirst);

  const result = {
    configured: true,
    live: !!second.live,
    tested: true,
    verified,
    first,
    second,
    independent_verification: {
      distinct_request_ids: !!distinctRequests,
      server_ledger_proof_for_first_request: !!ledgerProofForFirst,
    },
    client_evidence_entries: clientEvidence.length,
    client_evidence_hash_algorithm: "sha256",
    client_evidence_sha256: clientEvidenceSha256,
    state: verified ? "verified_read_only" : "independent_verification_failed",
  };
  addProof(verified ? "HTTP_E2E_VERIFIED" : "HTTP_E2E_FAILED", "AVA -> OASIS read-only end-to-end verification", result);
  return result;
}

export const OASIS_HTTP_CONTRACT = Object.freeze({
  baseUrl: OASIS_BASE,
  readOnly: [STATUS_PATH, SUPABASE_STATUS_PATH, CORRUPTION_PROOF_STATUS_PATH],
  executableProofs: [CORRUPTION_PROOF_RUN_PATH],
  source: "jgaos2026-gif/oasis runtime/Start-OASISControlRoom.ps1",
});
