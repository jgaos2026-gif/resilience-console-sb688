import { SYSTEM_COMPONENTS, SYSTEM_LINKS } from "@/lib/systemRegistry";

const HEALTH_KEY = "jga_ava_system_health_v2";
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
    checked_at: checkedAt,
  }]));
  writeJSON(HEALTH_KEY, next);
  addProof?.("SYSTEM_INVENTORY", "AVA recorded declared system inventory without promoting runtime trust", {
    checked_at: checkedAt,
    states: Object.values(next).map(x => ({ id: x.id, status: x.status })),
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
  const item = {
    id: crypto.randomUUID(),
    correlation_id: correlationId,
    command: raw,
    target: target?.id || "ava",
    created_at: new Date().toISOString(),
    execution: "blocked_until_verified_runtime_adapter",
    target_status: target?.status || "unknown",
  };
  writeJSON(COMMAND_KEY, [item, ...getCommandLog()].slice(0, 200));
  addProof?.("SYSTEM_COMMAND_BLOCKED", `AVA preserved command without execution for ${target?.name || "unknown target"}`, item);
  return {
    ok: false,
    item,
    message: `${target?.name || "Target"} command blocked: no independently verified runtime adapter is active. Correlation ID ${correlationId}.`,
  };
}

export function getSystemTopology() {
  return {
    components: SYSTEM_COMPONENTS,
    links: SYSTEM_LINKS.map(([from, to]) => ({ from, to })),
  };
}
