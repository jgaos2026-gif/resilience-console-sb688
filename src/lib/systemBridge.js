import { SYSTEM_COMPONENTS, SYSTEM_LINKS } from "@/lib/systemRegistry";

const HEALTH_KEY = "jga_ava_system_health_v1";
const COMMAND_KEY = "jga_ava_system_commands_v1";

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

export async function runSystemHealthSweep(addProof) {
  const checkedAt = new Date().toISOString();
  const previous = getSystemHealth();
  const next = {};

  for (const component of SYSTEM_COMPONENTS) {
    const status = component.status === "connected" ? "registered" : "pending-access";
    next[component.id] = {
      id: component.id,
      name: component.name,
      repo: component.repo,
      status,
      checked_at: checkedAt,
      note: status === "registered"
        ? "Registry link verified. Live runtime endpoint not configured in this browser session."
        : "Repository/runtime access is not available to this integration yet.",
    };
  }

  writeJSON(HEALTH_KEY, { ...previous, ...next });
  addProof?.("HEALTH_SWEEP", `AVA verified ${SYSTEM_COMPONENTS.length} registered system entries`, {
    checked_at: checkedAt,
    registered: Object.values(next).filter(x => x.status === "registered").length,
    pending: Object.values(next).filter(x => x.status !== "registered").length,
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

  const action = normalized.includes("health") || normalized.includes("status") ? "health"
    : normalized.includes("proof") ? "proof"
    : normalized.includes("recover") || normalized.includes("heal") || normalized.includes("phoenix") ? "recovery"
    : normalized.includes("sync") || normalized.includes("connect") ? "sync"
    : "inspect";

  const item = {
    id: crypto.randomUUID(),
    command: raw,
    target: target?.id || "ava",
    action,
    created_at: new Date().toISOString(),
    execution: target?.status === "connected" ? "accepted-local-route" : "blocked-pending-access",
  };

  writeJSON(COMMAND_KEY, [item, ...getCommandLog()].slice(0, 200));
  addProof?.("SYSTEM_COMMAND", `AVA routed ${action} command to ${target?.name || "AVA"}`, item);

  if (target && target.status !== "connected") {
    return { ok: false, item, message: `${target.name} is registered but access is pending; command was logged and not falsely executed.` };
  }

  return {
    ok: true,
    item,
    message: `${action.toUpperCase()} routed to ${target?.name || "AVA"}. Local proof recorded; external execution requires a configured runtime adapter.`,
  };
}

export function getSystemTopology() {
  return {
    components: SYSTEM_COMPONENTS,
    links: SYSTEM_LINKS.map(([from, to]) => ({ from, to })),
  };
}
