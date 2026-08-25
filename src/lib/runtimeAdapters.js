import { SYSTEM_COMPONENTS } from "@/lib/systemRegistry";

const ADAPTER_KEY = "jga_ava_runtime_adapters_v1";

const DEFAULT_ADAPTERS = {
  oasis: { kind: "http", baseUrl: "", healthPath: "/health", commandPath: "/api/ava/command", enabled: false },
  stitch: { kind: "http", baseUrl: "", healthPath: "/health", commandPath: "/api/ava/command", enabled: false },
  sb688: { kind: "http", baseUrl: "", healthPath: "/health", commandPath: "/api/ava/command", enabled: false },
  powershell: { kind: "local-bridge", baseUrl: "http://127.0.0.1:6888", healthPath: "/health", commandPath: "/command", enabled: false },
};

function read() {
  try { return { ...DEFAULT_ADAPTERS, ...(JSON.parse(localStorage.getItem(ADAPTER_KEY) || "{}")) }; }
  catch { return { ...DEFAULT_ADAPTERS }; }
}

function write(value) {
  localStorage.setItem(ADAPTER_KEY, JSON.stringify(value));
}

export function getRuntimeAdapters() { return read(); }

export function configureRuntimeAdapter(id, patch) {
  const adapters = read();
  adapters[id] = { ...(adapters[id] || {}), ...patch };
  write(adapters);
  return adapters[id];
}

function timeoutSignal(ms = 4500) {
  if (typeof AbortSignal !== "undefined" && AbortSignal.timeout) return AbortSignal.timeout(ms);
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

export async function checkRuntimeAdapter(id) {
  const adapter = read()[id];
  const component = SYSTEM_COMPONENTS.find(x => x.id === id);
  if (!adapter) return { ok: false, id, state: "missing-adapter", verified: false };
  if (!adapter.enabled) return { ok: false, id, state: "disabled", verified: false };
  if (!adapter.baseUrl) return { ok: false, id, state: "unconfigured", verified: false };

  try {
    const response = await fetch(`${adapter.baseUrl}${adapter.healthPath || "/health"}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: timeoutSignal(),
    });
    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text.slice(0, 500) }; }
    return {
      ok: response.ok,
      id,
      name: component?.name || id,
      state: response.ok ? "verified-live" : `http-${response.status}`,
      verified: response.ok,
      status: response.status,
      data,
      checked_at: new Date().toISOString(),
    };
  } catch (error) {
    return {
      ok: false,
      id,
      name: component?.name || id,
      state: "unreachable",
      verified: false,
      error: String(error?.message || error),
      checked_at: new Date().toISOString(),
    };
  }
}

export async function executeRuntimeCommand(id, command, addProof) {
  const adapter = read()[id];
  const component = SYSTEM_COMPONENTS.find(x => x.id === id);
  if (!adapter?.enabled || !adapter?.baseUrl) {
    const result = { ok: false, executed: false, verified: false, id, state: "adapter-not-enabled" };
    addProof?.("RUNTIME_BLOCK", `AVA blocked ${component?.name || id} command: runtime adapter not enabled`, { command, ...result });
    return result;
  }

  const health = await checkRuntimeAdapter(id);
  if (!health.verified) {
    const result = { ok: false, executed: false, verified: false, id, state: "health-verification-failed", health };
    addProof?.("RUNTIME_BLOCK", `AVA blocked ${component?.name || id} command: health verification failed`, { command, ...result });
    return result;
  }

  try {
    const response = await fetch(`${adapter.baseUrl}${adapter.commandPath || "/api/ava/command"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ command, source: "AVA Digital Organism Room", issued_at: new Date().toISOString() }),
      signal: timeoutSignal(10000),
    });
    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text.slice(0, 1000) }; }
    const result = {
      ok: response.ok,
      executed: response.ok,
      verified: response.ok,
      id,
      status: response.status,
      state: response.ok ? "executed-verified" : `http-${response.status}`,
      data,
      completed_at: new Date().toISOString(),
    };
    addProof?.(response.ok ? "RUNTIME_EXECUTION" : "RUNTIME_FAILURE", `AVA ${response.ok ? "executed" : "failed"} ${component?.name || id} command`, { command, ...result });
    return result;
  } catch (error) {
    const result = { ok: false, executed: false, verified: false, id, state: "execution-error", error: String(error?.message || error) };
    addProof?.("RUNTIME_FAILURE", `AVA runtime command failed for ${component?.name || id}`, { command, ...result });
    return result;
  }
}

export async function sweepRuntimeAdapters(addProof) {
  const adapters = read();
  const ids = Object.keys(adapters);
  const results = await Promise.all(ids.map(checkRuntimeAdapter));
  addProof?.("RUNTIME_SWEEP", "AVA completed runtime-adapter verification sweep", {
    verified: results.filter(x => x.verified).map(x => x.id),
    unavailable: results.filter(x => !x.verified).map(x => ({ id: x.id, state: x.state })),
  });
  return results;
}
