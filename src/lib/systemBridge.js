import { SYSTEM_COMPONENTS, SYSTEM_LINKS } from "@/lib/systemRegistry";
import { verifyOasisReadOnlyEndToEnd } from "@/lib/oasisHttp";

const HEALTH_KEY = "jga_ava_system_health_v3";
const COMMAND_KEY = "jga_ava_system_commands_v2";

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getSystemHealth() {
  return readJSON(HEALTH_KEY, {});
}

export function getCommandLog() {
  return readJSON(COMMAND_KEY, []);
}

export function recordSystemInventory(addProof) {
  const checkedAt = new Date().toISOString();
  const next = Object.fromEntries(SYSTEM_COMPONENTS.map(component => [component.id, {
    id: component.id,
    name: component.name,
    repo: component.repo,
    status: component.status,
    configured: false,
    live: false,
    tested: false,
    verified: false,
    checked_at: checkedAt,
  }]));
  writeJSON(HEALTH_KEY, next);
  addProof?.("SYSTEM_INVENTORY", "AVA recorded declared system inventory without promoting runtime trust", {
    checked_at: checkedAt,
    states: Object.values(next).map(x => ({ id: x.id, status: x.status })),
  });
  return next;
}

export async function runSystemHealthSweep(addProof) {
  const next = recordSystemInventory(addProof);

  const oasis = await verifyOasisReadOnlyEndToEnd();
  next.oasis = {
    ...next.oasis,
    configured: !!oasis.configured,
    live: !!oasis.live,
    tested: !!oasis.tested,
    verified: !!oasis.verified,
    status: oasis.verified ? "verified_runtime" : "blocked_listener_unverified",
    note: oasis.verified
      ? "Real OASIS HTTP status route passed two independent read-only requests."
      : `OASIS HTTP verification failed closed: ${oasis.state || "unverified"}.`,
    correlation_id_1: oasis.first?.correlationId || null,
    correlation_id_2: oasis.second?.correlationId || null,
    ledger_hash: oasis.ledger_hash || null,
    checked_at: new Date().toISOString(),
  };

  writeJSON(HEALTH_KEY, next);
  addProof?.(oasis.verified ? "SYSTEM_HEALTH_VERIFIED" : "SYSTEM_HEALTH_BLOCKED", "AVA completed real runtime health sweep", {
    oasis: next.oasis,
    blocked: Object.values(next).filter(x => !x.verified).map(x => ({ id: x.id, status: x.status })),
  });
  return next;
}

export function routeSystemCommand(command, addProof) {
  const raw = String(command || "").trim();
  if (!raw) return { ok: false, message: "No command supplied." };
  const normalized = raw.toLowerCase();
  const target = SYSTEM_COMPONENTS.find(component =>
    normalized.includes(component.id.toLowerCase()) || normalized.includes(component.name.toLowerCase())
  );
  const correlationId = crypto.randomUUID();
  const health = getSystemHealth()[target?.id];
  const item = {
    id: crypto.randomUUID(),
    correlation_id: correlationId,
    command: raw,
    target: target?.id || "ava",
    created_at: new Date().toISOString(),
    execution: "blocked_read_only_phase",
    target_status: health?.status || target?.status || "unknown",
  };
  writeJSON(COMMAND_KEY, [item, ...getCommandLog()].slice(0, 200));
  addProof?.("SYSTEM_COMMAND_BLOCKED", `AVA preserved command without execution for ${target?.name || "unknown target"}`, item);
  return {
    ok: false,
    item,
    message: `${target?.name || "Target"} command blocked: current integration phase is read-only health/status verification. Correlation ID ${correlationId}.`,
  };
}

export function getSystemTopology() {
  return {
    components: SYSTEM_COMPONENTS,
    links: SYSTEM_LINKS.map(([from, to]) => ({ from, to })),
  };
}
