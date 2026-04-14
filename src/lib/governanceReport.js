/**
 * SB-688 Governance Report Generator
 * Captures full console state, signs it with a deterministic HMAC-style fingerprint,
 * and persists it to localStorage for the history viewer.
 */

const STORAGE_KEY = "sb688_governance_reports";

// ── Deterministic hash (no async crypto.subtle needed) ────────────────────────
function hashString(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const combined = (4294967296 * (2097151 & h2) + (h1 >>> 0));
  return combined.toString(16).padStart(16, "0");
}

function generateReportId(now) {
  const d = now;
  return `SB688-GOV-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
}

// ── Compute a signature over the payload ─────────────────────────────────────
function signPayload(payload) {
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  const h1 = hashString(canonical);
  const h2 = hashString(canonical.split("").reverse().join(""));
  return `sb688-hmac-${h1}-${h2}`;
}

// ── Build the full governance snapshot ───────────────────────────────────────
export function buildGovernanceReport(state, options = {}) {
  const now = new Date();
  const reportId = generateReportId(now);

  // Sanitise component snapshot
  const componentSnapshot = Object.fromEntries(
    Object.entries(state.components).map(([k, v]) => [k, {
      status: v.status,
      checkpointId: v.checkpointId,
    }])
  );

  const payload = {
    reportId,
    generatedAt: now.toISOString(),
    schemaVersion: "1.0.0",
    architect: "John E. Arenz — SB-688 Fortress Build",
    industry: state.industry,
    operationalState: state.operationalState,
    resilienceScore: state.resilienceScore,
    continuityScore: state.continuityScore,
    routeType: state.routeType,
    routeTime: state.routeTime,
    approvedRoute: state.approvedRoute,
    trustedRecordVersion: state.trustedRecordVersion,
    scenario: state.scenario || null,
    scenarioLoaded: !!state.scenarioLoaded,
    problemSimulated: !!state.problemSimulated,
    recoveryRun: !!state.recoveryRun,
    proofRun: !!state.proofRun,
    proofResults: state.proofResults || [],
    components: componentSnapshot,
    trustedChain: (state.trustedChain || []).slice(0, 20),
    eventLog: (state.eventLog || []).slice(0, 50).map(e => ({
      message: e.message,
      timestamp: e.timestamp,
    })),
    meta: {
      exportedBy: options.exportedBy || "operator",
      note: options.note || "",
      consoleBuild: "JGA Black + Gold Edition",
    },
  };

  const signature = signPayload(payload);

  return {
    ...payload,
    _signature: signature,
    _verified: true,
  };
}

// ── Verify a report's signature ───────────────────────────────────────────────
export function verifyReport(report) {
  const { _signature, _verified, ...payload } = report;
  if (!_signature) return false;
  const expected = signPayload(payload);
  return expected === _signature;
}

// ── Persist to localStorage ───────────────────────────────────────────────────
export function saveReport(report) {
  const existing = loadAllReports();
  existing.unshift(report);
  // Keep last 50 reports
  const trimmed = existing.slice(0, 50);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn("SB688: Could not persist governance report to localStorage", e);
  }
  return report;
}

export function loadAllReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function deleteReport(reportId) {
  const updated = loadAllReports().filter(r => r.reportId !== reportId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// ── Download as signed JSON ───────────────────────────────────────────────────
export function downloadReportAsJSON(report) {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const d = new Date(report.generatedAt);
  a.download = `${report.reportId}.json`;
  a.click();
  URL.revokeObjectURL(url);
}