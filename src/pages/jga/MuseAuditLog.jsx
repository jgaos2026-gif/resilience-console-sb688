import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollText, RefreshCw, Ban, Inbox } from "lucide-react";
import api from "@/api/apiClient";
import MuseAuditSummary from "@/components/jga/MuseAuditSummary";
import MuseAuditEntry from "@/components/jga/MuseAuditEntry";
import { AUDIT_FILTERS, categoryOf } from "@/lib/museAudit";

const GOLD = "#C9A84C";

export default function MuseAuditLog() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/agent-admin/audit?limit=200");
      if (!res) {
        setError("Sign in as a console admin to read the Muse AI audit record.");
        return;
      }
      setData(res);
    } catch (err) {
      setError(
        err?.message && err.message !== "Failed to fetch"
          ? err.message
          : "The console backend is not reachable from here. This page reads the sealed ledger on the server and will not invent entries.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const entries = useMemo(() => {
    const list = data?.entries || [];
    return filter === "all" ? list : list.filter(e => categoryOf(e.type) === filter);
  }, [data, filter]);

  const total = data?.summary?.total_events ?? 0;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      <div className="rounded-3xl border p-5 space-y-3"
        style={{ background: "linear-gradient(135deg,#080808,#111,#0e0c00)", borderColor: `${GOLD}32` }}>
        <div className="flex items-center gap-3">
          <ScrollText className="w-7 h-7 flex-shrink-0" style={{ color: GOLD }} />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: `${GOLD}80` }}>Muse AI activity</p>
            <h1 className="text-2xl sm:text-4xl font-black font-cinzel gold-shimmer">Audit Log</h1>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Every control request Muse AI initiates, recorded and sealed at the moment it is written.
        </p>
        <button onClick={load} disabled={loading}
          className="px-3 py-2 rounded-lg text-[10px] font-black uppercase border disabled:opacity-50 flex items-center gap-1.5"
          style={{ color: GOLD, borderColor: `${GOLD}35` }}>
          <RefreshCw className="w-3 h-3" />{loading ? "Reading…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border p-3 flex items-start gap-2"
          style={{ borderColor: "rgba(248,113,113,.3)", background: "rgba(248,113,113,.06)" }}>
          <Ban className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
          <p className="text-[11px] text-red-300">{error}</p>
        </div>
      )}

      {!error && data && (
        <>
          <MuseAuditSummary summary={data.summary} verification={data.verification} />

          <div className="flex flex-wrap gap-1.5">
            {AUDIT_FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border"
                style={filter === f.key
                  ? { background: GOLD, color: "#080808", borderColor: GOLD }
                  : { color: `${GOLD}90`, borderColor: `${GOLD}24`, background: "rgba(0,0,0,0.35)" }}>
                {f.label}
              </button>
            ))}
          </div>

          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Showing {entries.length} of {total} recorded events
          </p>

          {entries.length === 0 ? (
            <div className="rounded-2xl border p-6 text-center space-y-2"
              style={{ background: "#090909", borderColor: `${GOLD}20` }}>
              <Inbox className="w-6 h-6 mx-auto" style={{ color: `${GOLD}70` }} />
              <p className="text-xs text-muted-foreground">
                {total === 0
                  ? "Muse AI has not initiated any control requests yet. Nothing is recorded until it does."
                  : "No events in this category."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map(entry => <MuseAuditEntry key={entry.event_id} entry={entry} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}