import React, { useCallback, useEffect, useState } from "react";
import { KeyRound, RefreshCw, ShieldAlert, Terminal } from "lucide-react";
import api from "@/api/apiClient";
import AgentTokenCard from "@/components/jga/AgentTokenCard";

const GOLD = "#C9A84C";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const SCOPES = [
  {
    scope: "read",
    title: "Read token",
    description: "Status, ledger, and health. Cannot change anything.",
    envVar: "AGENT_READ_TOKEN",
  },
  {
    scope: "control",
    title: "Control token",
    description: "Everything above, plus verify, ledger append, quarantine, and restore.",
    envVar: "AGENT_CONTROL_TOKEN",
  },
];

export default function AgentAccess() {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [fresh, setFresh] = useState({});

  const load = useCallback(async () => {
    setBusy(b => b || "load");
    setError("");
    try {
      const res = await api.get("/api/agent-admin/tokens");
      if (!res) { setError("Sign in as a console admin to manage agent tokens."); return; }
      setData(res);
    } catch (err) {
      setError(err?.message || "Could not read token state from the console backend.");
    } finally {
      setBusy("");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const generate = async scope => {
    setBusy(`gen-${scope}`);
    setError("");
    try {
      const res = await api.post(`/api/agent-admin/tokens/${scope}/generate`, {});
      if (!res) { setError("Sign in as a console admin to generate a token."); return; }
      setFresh(prev => ({ ...prev, [scope]: res.token }));
      await load();
    } catch (err) {
      setError(err?.message || "Token generation failed.");
    } finally {
      setBusy("");
    }
  };

  const revoke = async scope => {
    const active = data?.active?.[scope];
    if (!active) return;
    setBusy(`revoke-${scope}`);
    setError("");
    try {
      await api.post(`/api/agent-admin/tokens/${active.id}/revoke`, {});
      setFresh(prev => ({ ...prev, [scope]: null }));
      await load();
    } catch (err) {
      setError(err?.message || "Revocation failed.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      <div className="rounded-3xl border p-5 sm:p-6 space-y-3"
        style={{ background: "linear-gradient(135deg,#080808,#111,#0e0c00)", borderColor: `${GOLD}32` }}>
        <div className="flex items-center gap-3">
          <KeyRound className="w-7 h-7 flex-shrink-0" style={{ color: GOLD }} />
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em]" style={{ color: `${GOLD}80` }}>External agent access</p>
            <h1 className="text-2xl sm:text-4xl font-black font-cinzel gold-shimmer">Agent Access</h1>
          </div>
        </div>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Two tokens, two scopes. Each is shown exactly once, at the moment it is created. Anyone holding the
          control token can quarantine and restore nodes, so treat it as an owner credential.
        </p>
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="text-muted-foreground">Agent API base URL:</span>
          <span className="font-mono rounded-md px-2 py-1" style={{ background: "rgba(0,0,0,.5)", color: GOLD }}>{API_BASE}</span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border px-3 py-2 flex items-start gap-2"
          style={{ borderColor: "rgba(248,113,113,.3)", background: "rgba(248,113,113,.06)" }}>
          <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
          <p className="text-[11px] text-red-300">{error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={load} disabled={!!busy}
          className="px-3 py-2 rounded-lg text-[10px] font-black uppercase border disabled:opacity-50 flex items-center gap-1.5"
          style={{ color: GOLD, borderColor: `${GOLD}35` }}>
          <RefreshCw className="w-3 h-3" />{busy === "load" ? "Reading…" : "Refresh"}
        </button>
      </div>

      {SCOPES.map(cfg => (
        <AgentTokenCard
          key={cfg.scope}
          scope={cfg.scope}
          title={cfg.title}
          description={cfg.description}
          active={data?.active?.[cfg.scope] || null}
          envVar={data?.env?.[cfg.scope] || null}
          fresh={fresh[cfg.scope] || null}
          busy={busy}
          onGenerate={() => generate(cfg.scope)}
          onRevoke={() => revoke(cfg.scope)}
          onDismiss={() => setFresh(prev => ({ ...prev, [cfg.scope]: null }))}
        />
      ))}

      <div className="rounded-2xl border p-4 space-y-2" style={{ background: "#090909", borderColor: `${GOLD}20` }}>
        <p className="text-[10px] uppercase font-black tracking-widest" style={{ color: GOLD }}>Handling</p>
        <ul className="text-[11px] text-muted-foreground space-y-1 list-disc pl-4">
          <li>Copy a token only into the agent's own secure vault. Never paste it into a chat, ticket, or document.</li>
          <li>Revocation is immediate — the very next request carrying that token gets a 401.</li>
          <li>Tokens are stored server-side as SHA-256 hashes. No endpoint can read them back.</li>
          <li>Every failed authentication and scope violation is written to the ledger as a SECURITY event.</li>
          <li>
            <Terminal className="w-3 h-3 inline" /> Token management lives on this admin route, which requires a console
            admin session — an agent token cannot reach it.
          </li>
        </ul>
      </div>
    </div>
  );
}