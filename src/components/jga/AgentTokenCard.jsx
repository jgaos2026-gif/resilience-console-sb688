import React, { useState } from "react";
import { Check, Copy, KeyRound, Loader2, RefreshCw, ShieldAlert, Trash2 } from "lucide-react";

const GOLD = "#C9A84C";

/**
 * One scope's token card: current state, rotation, revocation, and the
 * one-time plaintext reveal.
 */
export default function AgentTokenCard({
  scope, title, description, active, envVar, fresh, busy, onGenerate, onRevoke, onDismiss,
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fresh);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-2xl border p-4 space-y-3"
      style={{ background: "linear-gradient(135deg,#090909,#0c0b06)", borderColor: `${GOLD}28` }}>

      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 flex-shrink-0" style={{ color: GOLD }} />
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: GOLD }}>{title}</h3>
            <p className="text-[11px] text-muted-foreground">{description}</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full border text-[10px] font-black uppercase"
          style={{
            color: active ? "#4ade80" : "#f0b429",
            borderColor: active ? "rgba(74,222,128,.3)" : "rgba(240,180,41,.3)",
            background: active ? "rgba(74,222,128,.06)" : "rgba(240,180,41,.06)",
          }}>
          {active ? "Active" : "Not generated"}
        </span>
      </div>

      {active && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
          <div><span className="text-muted-foreground">Prefix:</span> <span className="font-mono">{active.token_prefix}…</span></div>
          <div><span className="text-muted-foreground">Created:</span> {new Date(active.created_at).toLocaleString()}</div>
          <div><span className="text-muted-foreground">Last used:</span> {active.last_used_at ? new Date(active.last_used_at).toLocaleString() : "never"}</div>
        </div>
      )}

      {!active && envVar && (
        <p className="text-[11px]" style={{ color: "#f0b429" }}>
          No stored token, but {envVar} is set in the server environment and is accepted. Rotate here to take
          over, or remove the environment variable and restart to retire it.
        </p>
      )}

      {fresh && (
        <div className="rounded-xl border p-3 space-y-2"
          style={{ borderColor: "rgba(74,222,128,.35)", background: "rgba(74,222,128,.06)" }}>
          <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "#4ade80" }}>
            Shown once — copy it now
          </p>
          <p className="text-[11px] font-mono break-all rounded-lg px-2 py-2"
            style={{ background: "rgba(0,0,0,.55)", color: "rgba(232,217,176,.95)" }}>
            {fresh}
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={copy}
              className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border flex items-center gap-1"
              style={{ color: "#4ade80", borderColor: "rgba(74,222,128,.4)" }}>
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button onClick={onDismiss}
              className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border"
              style={{ color: GOLD, borderColor: `${GOLD}35` }}>
              I have saved it — hide
            </button>
          </div>
          <p className="text-[10px] flex items-start gap-1.5" style={{ color: "#f0b429" }}>
            <ShieldAlert className="w-3 h-3 mt-0.5 flex-shrink-0" />
            Do not paste this into any chat. Enter it directly into the agent's secure vault.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={onGenerate} disabled={!!busy}
          className="px-3 py-2 rounded-lg text-[10px] font-black uppercase border disabled:opacity-50 flex items-center gap-1.5"
          style={{ background: GOLD, color: "#080808", borderColor: GOLD }}>
          {busy === `gen-${scope}`
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : <RefreshCw className="w-3 h-3" />}
          {active ? "Regenerate (revokes current)" : "Generate token"}
        </button>

        {active && (
          <button onClick={onRevoke} disabled={!!busy}
            className="px-3 py-2 rounded-lg text-[10px] font-black uppercase border disabled:opacity-50 flex items-center gap-1.5"
            style={{ color: "#f87171", borderColor: "rgba(248,113,113,.4)" }}>
            {busy === `revoke-${scope}`
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <Trash2 className="w-3 h-3" />}
            Revoke now
          </button>
        )}
      </div>
    </div>
  );
}