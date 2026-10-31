/**
 * museAudit.js — display helpers for the Muse AI audit record.
 * Pure mapping only: no fetching, no state, no assumptions about what is missing.
 */

export const AUDIT_FILTERS = [
  { key: "all", label: "All" },
  { key: "control", label: "Control" },
  { key: "outcome", label: "Outcomes" },
  { key: "security", label: "Security" },
];

const CONTROL_ACTIONS = {
  verify: "Requested a system verification",
  "ledger/append": "Appended a ledger entry",
  quarantine: "Requested node quarantine",
  restore: "Requested node restore",
};

export function categoryOf(type = "") {
  if (type === "AGENT_CONTROL") return "control";
  if (type === "SECURITY") return "security";
  if (type.startsWith("AGENT_")) return "outcome";
  return "note";
}

export function describeEntry(entry) {
  const p = entry.payload || {};

  switch (entry.type) {
    case "AGENT_CONTROL":
      return {
        label: CONTROL_ACTIONS[p.action] || `Requested ${p.action || "a control action"}`,
        target: p.node_name
          ? `Node: ${p.node_name}`
          : p.entry_type
            ? `Entry type: ${p.entry_type}`
            : null,
        tone: "control",
      };

    case "AGENT_VERIFY_RESULT": {
      const parts = [
        p.overall,
        p.integrity_pct != null ? `${p.integrity_pct}% integrity` : null,
        p.anomalies != null ? `${p.anomalies} anomalies` : null,
      ].filter(Boolean);
      return { label: "Verification completed", target: parts.join(" · ") || null, tone: "outcome" };
    }

    case "AGENT_NODE_QUARANTINED":
      return {
        label: "Node quarantined",
        target: [p.node_name, p.previous_status ? `was ${p.previous_status}` : null].filter(Boolean).join(" · ") || null,
        tone: "warn",
      };

    case "AGENT_NODE_RESTORED":
      return { label: "Node restored to active duty", target: p.node_name || null, tone: "ok" };

    case "AGENT_RESTORE_REFUSED":
      return {
        label: "Restore refused",
        target: [
          p.node_name,
          p.integrity_pct != null ? `${p.integrity_pct}% integrity` : null,
        ].filter(Boolean).join(" · ") || null,
        tone: "bad",
      };

    case "SECURITY":
      return {
        label: "Authentication rejected",
        target: p.action ? String(p.action).replace(/_/g, " ") : null,
        tone: "bad",
      };

    default:
      return {
        label: String(entry.type || "event").replace(/_/g, " "),
        target: p.note || p.summary || null,
        tone: "note",
      };
  }
}

export function formatAuditTime(sqlTime) {
  if (!sqlTime) return "—";
  const date = new Date(`${String(sqlTime).replace(" ", "T")}Z`);
  return Number.isNaN(date.getTime()) ? String(sqlTime) : date.toLocaleString();
}