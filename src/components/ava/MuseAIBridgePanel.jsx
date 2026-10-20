import React, { useCallback, useEffect, useState } from "react";
import { AlertTriangle, PlugZap, RefreshCw } from "lucide-react";
import api from "@/api/apiClient";

const GOLD = "#C9A84C";

function Gate({ label, value }) {
  return (
    <span className="px-2.5 py-1 rounded-full border text-[10px] font-black uppercase"
      style={{
        color: value ? "#4ade80" : "#f87171",
        borderColor: value ? "rgba(74,222,128,.3)" : "rgba(248,113,113,.3)",
        background: value ? "rgba(74,222,128,.06)" : "rgba(248,113,113,.06)",
      }}>
      {label}: {value ? "TRUE" : "FALSE"}
    </span>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border px-3 py-2" style={{ borderColor: `${GOLD}18`, background: "rgba(0,0,0,.3)" }}>
      <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">{label}</p>
      <p className="text-xs font-bold" style={{ color: GOLD }}>{value}</p>
    </div>
  );
}

export default function MuseAIBridgePanel() {
  const [provider, setProvider] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [verification, setVerification] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setBusy("load");
    setError("");
    try {
      const [status, grounding] = await Promise.all([
        api.get("/api/ai/status"),
        api.get("/api/ai/grounding"),
      ]);
      if (!status) { setError("Sign in to the console backend to read provider status."); return; }
      setProvider(status.provider);
      if (grounding?.snapshot) setSnapshot(grounding.snapshot);
    } catch (err) {
      setError(err?.message || "Could not reach the console backend.");
    } finally {
      setBusy("");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const verify = async () => {
    setBusy("verify");
    setError("");
    try {
      const res = await api.post("/api/ai/verify", {});
      if (!res) { setError("Sign in to the console backend to verify the provider."); return; }
      setVerification(res.result);
    } catch (err) {
      setError(err?.message || "Provider verification failed.");
    } finally {
      setBusy("");
    }
  };

  const spine = snapshot?.spine;
  const ledger = snapshot?.trust_ledger;
  const gates = snapshot?.gates;
  const missing = provider?.missing_env || [];

  return (
    <div className="rounded-2xl border p-4 sm:p-5 space-y-4"
      style={{ background: "linear-gradient(135deg,#090909,#0c0b06)", borderColor: `${GOLD}28` }}>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <PlugZap className="w-5 h-5" style={{ color: GOLD }} />
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: GOLD }}>Muse AI Bridge</h2>
            <p className="text-xs text-muted-foreground">
              Provider credentials live in the console backend, never in the browser. Verification is a real round-trip.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={load} disabled={!!busy}
            className="px-3 py-2 rounded-lg text-[10px] font-black uppercase border disabled:opacity-50"
            style={{ color: GOLD, borderColor: `${GOLD}35` }}>
            <RefreshCw className="w-3 h-3 inline mr-1" />{busy === "load" ? "Reading…" : "Refresh State"}
          </button>
          <button onClick={verify} disabled={!!busy}
            className="px-3 py-2 rounded-lg text-[10px] font-black uppercase border disabled:opacity-50"
            style={{ background: GOLD, color: "#080808", borderColor: GOLD }}>
            {busy === "verify" ? "Verifying…" : "Verify Provider"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border px-3 py-2 flex items-start gap-2"
          style={{ borderColor: "rgba(248,113,113,.3)", background: "rgba(248,113,113,.06)" }}>
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-red-400" />
          <p className="text-[11px] text-red-300">{error}</p>
        </div>
      )}

      <div className="rounded-xl border p-3 space-y-3" style={{ borderColor: `${GOLD}20`, background: "rgba(0,0,0,.25)" }}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Stat label="Provider" value={provider?.label || "—"} />
          <Stat label="Model" value={provider?.model || "—"} />
          <Stat label="Endpoint Host" value={provider?.base_url_host || (provider?.offline ? "local only" : "not set")} />
          <Stat label="API Key" value={provider?.api_key_present ? "present" : "absent"} />
        </div>
        {missing.length > 0 && (
          <p className="text-[11px]" style={{ color: "#f0b429" }}>
            Set {missing.join(" and ")} in the backend environment, then restart it.
          </p>
        )}
        {provider?.reason && <p className="text-[11px] text-red-300">{provider.reason}</p>}
      </div>

      {verification && (
        <div className="rounded-xl border p-3 space-y-3" style={{ borderColor: `${GOLD}20`, background: "rgba(0,0,0,.3)" }}>
          <div className="flex flex-wrap gap-2">
            <Gate label="Configured" value={!!verification.configured} />
            <Gate label="Live" value={!!verification.live} />
            <Gate label="Tested" value={!!verification.tested} />
            <Gate label="Verified" value={!!verification.verified} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
            <div><span className="text-muted-foreground">State:</span> {verification.state}</div>
            <div><span className="text-muted-foreground">Latency:</span> {verification.latency_ms ?? "—"} ms</div>
            <div><span className="text-muted-foreground">Correlation:</span> {verification.correlation_id || "—"}</div>
            <div className="md:col-span-3 break-all"><span className="text-muted-foreground">Response SHA-256:</span> {verification.response_sha256 || "not available"}</div>
            {verification.error && <div className="md:col-span-3 text-red-300">{verification.error}</div>}
          </div>
        </div>
      )}

      {spine && (
        <div className="rounded-xl border p-3 space-y-3" style={{ borderColor: `${GOLD}20`, background: "rgba(0,0,0,.25)" }}>
          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
            Grounding — live verified state AVA may cite
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <Stat label="Nodes Active" value={`${spine.active_nodes}/${spine.total_nodes}`} />
            <Stat label="Braid Integrity" value={`${spine.integrity_pct}%`} />
            <Stat label="Trust Ledger" value={ledger?.integrity_valid ? `VALID · ${ledger.decisions}` : "FAILED"} />
            <Stat label="Gates" value={`${gates?.total ?? 0} (${gates?.trusted ?? 0} trusted)`} />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {spine.non_active_nodes === 0
              ? "All nodes active. No unrepaired candidates pending."
              : `${spine.non_active_nodes} node(s) not active.`}
            {" "}Snapshot read {new Date(snapshot.generated_at).toLocaleTimeString()}.
          </p>
        </div>
      )}
    </div>
  );
}