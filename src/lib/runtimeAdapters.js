import { SYSTEM_COMPONENTS } from "@/lib/systemRegistry";

const ADAPTER_KEY = "jga_ava_runtime_adapters_v2";
const FAILURE_KEY = "jga_ava_runtime_failures_v1";

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function preserveFailure(entry) {
  const failures = readJSON(FAILURE_KEY, []);
  writeJSON(FAILURE_KEY, [entry, ...failures].slice(0, 500));
}

function newCorrelationId() {
  return crypto.randomUUID();
}

function timeoutSignal(ms = 4500) {
  if (typeof AbortSignal !== "undefined" && AbortSignal.timeout) return AbortSignal.timeout(ms);
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

export function getRuntimeAdapters() {
  return readJSON(ADAPTER_KEY, {});
}

export function getRuntimeFailures() {
  return readJSON(FAILURE_KEY, []);
}

export function registerVerifiedRuntimeAdapter(id, discovery) {
  if (!discovery?.verifiedByRealRequest) throw new Error("Adapter registration requires a successful real HTTP verification request.");
  if (!discovery?.baseUrl || !discovery?.statusPath) throw new Error("Verified baseUrl and statusPath are required.");
  if (!Array.isArray(discovery?.allowedReadOnlyActions) || discovery.allowedReadOnlyActions.length === 0) throw new Error("At least one source-confirmed read-only action is required.");

  const adapters = getRuntimeAdapters();
  const adapter = {
    id,
    baseUrl: discovery.baseUrl,
    statusPath: discovery.statusPath,
    healthPath: discovery.healthPath || discovery.statusPath,
    allowedReadOnlyActions: discovery.allowedReadOnlyActions,
    auth: discovery.auth || null,
    sourceEvidence: discovery.sourceEvidence,
    verificationEvidence: discovery.verificationEvidence,
    enabled: true,
    configured_at: new Date().toISOString(),
  };
  adapters[id] = adapter;
  writeJSON(ADAPTER_KEY, adapters);
  return adapter;
}

export function blockRuntimeAdapter(id, reason = "blocked_no_runtime_interface") {
  const adapters = getRuntimeAdapters();
  adapters[id] = { id, enabled: false, state: reason, blocked_at: new Date().toISOString() };
  writeJSON(ADAPTER_KEY, adapters);
  return adapters[id];
}

function buildHeaders(adapter, correlationId) {
  const headers = {
    Accept: "application/json",
    "X-AVA-Correlation-ID": correlationId,
  };
  if (adapter.auth?.type === "bearer" && adapter.auth?.token) headers.Authorization = `Bearer ${adapter.auth.token}`;
  if (adapter.auth?.type === "header" && adapter.auth?.name && adapter.auth?.value) headers[adapter.auth.name] = adapter.auth.value;
  return headers;
}

export async function readRuntimeStatus(id, addProof) {
  const adapter = getRuntimeAdapters()[id];
  const component = SYSTEM_COMPONENTS.find(x => x.id === id);
  const correlationId = newCorrelationId();
  const startedAt = new Date().toISOString();

  if (!adapter?.enabled || !adapter?.baseUrl || !adapter?.statusPath) {
    const failure = { id, correlationId, started_at: startedAt, state: adapter?.state || "blocked_no_runtime_interface", preserved: true };
    preserveFailure(failure);
    addProof?.("RUNTIME_BLOCK", `AVA blocked read-only status request for ${component?.name || id}`, failure);
    return { configured: false, live: false, tested: false, verified: false, ...failure };
  }

  try {
    const url = `${adapter.baseUrl}${adapter.statusPath}`;
    const response = await fetch(url, {
      method: "GET",
      headers: buildHeaders(adapter, correlationId),
      cache: "no-store",
      signal: timeoutSignal(),
    });
    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text.slice(0, 2000) }; }

    if (!response.ok) {
      const failure = { id, correlationId, url, status: response.status, body: data, state: `http_${response.status}`, preserved: true, completed_at: new Date().toISOString() };
      preserveFailure(failure);
      addProof?.("RUNTIME_FAILURE", `AVA read-only status failed for ${component?.name || id}`, failure);
      return { configured: true, live: true, tested: true, verified: false, ...failure };
    }

    const evidence = {
      id,
      correlationId,
      url,
      status: response.status,
      response: data,
      sourceEvidence: adapter.sourceEvidence,
      verificationEvidence: adapter.verificationEvidence,
      completed_at: new Date().toISOString(),
    };
    addProof?.("RUNTIME_READ_VERIFIED", `AVA verified read-only runtime status for ${component?.name || id}`, evidence);
    return { configured: true, live: true, tested: true, verified: true, state: "verified_read_only", ...evidence };
  } catch (error) {
    const failure = { id, correlationId, state: "request_failed", error: String(error?.message || error), preserved: true, completed_at: new Date().toISOString() };
    preserveFailure(failure);
    addProof?.("RUNTIME_FAILURE", `AVA read-only status request failed for ${component?.name || id}`, failure);
    return { configured: true, live: false, tested: true, verified: false, ...failure };
  }
}

export async function independentVerifyRuntimeStatus(id, priorResult, addProof) {
  if (!priorResult?.verified) return { configured: !!priorResult?.configured, live: !!priorResult?.live, tested: !!priorResult?.tested, verified: false, state: "prior_request_not_verified" };
  const second = await readRuntimeStatus(id, addProof);
  const verified = second.verified && second.correlationId !== priorResult.correlationId;
  const result = { ...second, verified, independent_verification: verified };
  addProof?.(verified ? "RUNTIME_INDEPENDENT_VERIFY" : "RUNTIME_INDEPENDENT_VERIFY_FAILED", `Independent status verification for ${id}`, {
    firstCorrelationId: priorResult.correlationId,
    secondCorrelationId: second.correlationId,
    verified,
  });
  return result;
}
