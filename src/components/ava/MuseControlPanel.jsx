import React, { useCallback, useEffect, useState } from "react";
import { Brain, Crown, Loader2, RefreshCw, ShieldCheck, Wrench } from "lucide-react";
import api from "@/api/apiClient";

const GOLD = "#C9A84C";

const TIER_STYLE = {
  read:       { label: "Check",      color: "#60a5fa" },
  write:      { label: "Modify",     color: "#f0b429" },
  owner_only: { label: "Owner Only", color: "#f87171" },
};

const TIER_ORDER = ["read", "write", "owner_only"];

function TierBadge({ tier }) {
  const style = TIER_STYLE[tier] || TIER_STYLE.read;
  return (
    <span className="px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest flex-shrink-0"
      style={{ color: style.color, borderColor: `${style.color}44`, background: `${style.color}12` }}>
      {style.label}
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

export default function MuseControlPanel() {
  const [tools, setTools] = useState([]);
  const [control, setControl] = useState(null);
  const [modes, setModes] = useState([]);
  const [memory, setMemory] = useState([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [lastResult, setLastResult] = useState(null);
  const [pending, setPending] = useState(null);

  const load = useCallback(async () => {
    setBusy("load");
    setError("");
    try {
      const [toolRes, controlRes] = await Promise.all([
        api.get("/api/ai/tools"),
        api.get("/api/ai/control"),
      ]);
      if (!toolRes) { setError("Sign in to the console backend to use the control surface."); return; }
      setTools(toolRes.tools || []);
      setControl(controlRes?.control || null);
      setModes(controlRes?.modes || []);
      setMemory(controlRes?.memory || []);
    } catch (err) {
      setError(err?.message || "Could not reach the console backend.");
    } finally {
      setBusy("");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const runAction = useCallback(async (id, params = {}) => {
    setBusy(id);
    setError("");
    setLastResult(null);
    try {
      const res = await api.post("/api/ai/act", { action: id, params });
      if (!res) { setError("Sign in to the console backend to run this action."); return; }
      setLastResult(res.result);
      if (!res.result?.ok && !res.result?.refused) setError(res.result?.error || "The action was refused.");
      await load();
    } catch (err) {
      setError(err?.message || "The action could not be run.");
    } finally {
      setBusy("");
      setPending(null);
    }
  }, [load]);

  const grouped = TIER_ORDER.map(tier => ({ tier, items: tools.filter(t => t.tier === tier) }));

  return (
    <div className="rounded-2xl border p-4 sm:p-5 space-y-4"
      style={{ background: "linear-gradient(135deg,#090909,#0c0b06)", borderColor: `${GOLD}28` }}>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5" style={{ color: GOLD }} />
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: GOLD }}>Muse Control Surface</h2>
            <p className="text-xs text-muted-foreground">
              Everything the AI is allowed to do here, and the state it can change. Containment is allowed; repair is not.
            </p>
          </div>
        </div>
        <button onClick={load} disabled={!!busy}
          className="px-3 py-2 rounded-lg text-[10px] font-black uppercase border disabled:opacity-50"
          style={{ color: GOLD, borderColor: `${GOLD}35` }}>
          <RefreshCw className="w-3 h-3 inline mr-1" />{busy === "load" ? "Reading…" : "Refresh"}
        </button>
      </div>

      {error && (
        <p className="text-[11px] text-red-300 rounded-xl border px-3 py-2"
          style={{ borderColor: "rgba(248,113,113,.3)", background: "rgba(248,113,113,.06)" }}>{error}</p>
      )}

      {lastResult && (
        <div className="rounded-xl border px-3 py-2 text-[11px]"
          style={{
            borderColor: lastResult.ok ? "rgba(74,222,128,.3)" : "rgba(248,113,113,.3)",
            background: lastResult.ok ? "rgba(74,222,128,.06)" : "rgba(248,113,113,.06)",
          }}>
          <span className="font-black" style={{ color: lastResult.ok ? "#4ade80" : "#f87171" }}>
            {lastResult.action} {lastResult.ok ? "· done" : lastResult.refused ? "· refused" : "· failed"}
          </span>
          {" "}{lastResult.summary || lastResult.error}
        </div>
      )}

      {control && (
        <div className="rounded-xl border p-3 space-y-3" style={{ borderColor: `${GOLD}20`, background: "rgba(0,0,0,.28)" }}>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4" style={{ color: GOLD }} />
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">AVA control state</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <Stat label="Lane" value={control.mode} />
            <Stat label="Voice" value={control.voice_enabled ? "on" : "off"} />
            <Stat label="Directives" value={control.directives.length} />
            <Stat label="Memory" value={control.active_memory} />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Set AVA lane</p>
            <div className="flex flex-wrap gap-1.5">
              {modes.map(m => (
                <button key={m} onClick={() => runAction("ava_set_mode", { mode: m })} disabled={!!busy}
                  className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase border disabled:opacity-50"
                  style={control.mode === m
                    ? { background: GOLD, color: "#080808", borderColor: GOLD }
                    : { color: `${GOLD}90`, borderColor: `${GOLD}20`, background: "rgba(0,0,0,.35)" }}>
                  {m}
                </button>
              ))}
              <button onClick={() => runAction("ava_set_voice", { enabled: !control.voice_enabled })} disabled={!!busy}
                className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase border disabled:opacity-50"
                style={{ color: GOLD, borderColor: `${GOLD}35`, background: "rgba(0,0,0,.35)" }}>
                {control.voice_enabled ? "Mute voice" : "Enable voice"}
              </button>
              {control.directives.length > 0 && (
                <button onClick={() => runAction("ava_set_directive", { clear_all: true })} disabled={!!busy}
                  className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase border disabled:opacity-50"
                  style={{ color: "#f87171", borderColor: "rgba(248,113,113,.35)", background: "rgba(0,0,0,.35)" }}>
                  Clear directives
                </button>
              )}
            </div>
          </div>

          {control.directives.length > 0 && (
            <ul className="space-y-1">
              {control.directives.map(d => (
                <li key={d.id} className="text-[11px] text-muted-foreground">
                  • {d.text} <span className="opacity-60">— set by {d.set_by}</span>
                </li>
              ))}
            </ul>
          )}

          {memory.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Durable memory</p>
              {memory.slice(0, 4).map(m => (
                <p key={m.id} className="text-[11px] text-muted-foreground">• {m.text}</p>
              ))}
            </div>
          )}

          {control.last_changed_at && (
            <p className="text-[10px] text-muted-foreground">
              Last changed {new Date(control.last_changed_at).toLocaleString()} by {control.last_changed_by}.
            </p>
          )}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" style={{ color: GOLD }} />
          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
            Governed actions — {tools.length} available to the AI
          </p>
        </div>

        {grouped.map(({ tier, items }) => items.length > 0 && (
          <div key={tier} className="space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: TIER_STYLE[tier].color }}>
              {TIER_STYLE[tier].label}
            </p>
            {items.map(t => (
              <div key={t.id} className="rounded-lg border px-3 py-2 flex flex-wrap items-center gap-2 justify-between"
                style={{ borderColor: `${GOLD}16`, background: "rgba(0,0,0,.25)" }}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <TierBadge tier={t.tier} />
                    <span className="text-[11px] font-bold" style={{ color: "rgba(232,217,176,.9)" }}>{t.title}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{t.description}</p>
                </div>

                {tier === "owner_only" && (
                  pending === t.id ? (
                    <div className="flex gap-1.5">
                      <button onClick={() => runAction(t.id, {})} disabled={!!busy}
                        className="px-2.5 py-1.5 rounded-md text-[9px] font-black uppercase disabled:opacity-50"
                        style={{ background: "#f87171", color: "#080808" }}>
                        {busy === t.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
                      </button>
                      <button onClick={() => setPending(null)}
                        className="px-2.5 py-1.5 rounded-md text-[9px] font-black uppercase border"
                        style={{ color: GOLD, borderColor: `${GOLD}35` }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setPending(t.id)}
                      className="px-2.5 py-1.5 rounded-md text-[9px] font-black uppercase border flex items-center gap-1"
                      style={{ color: "#f87171", borderColor: "rgba(248,113,113,.4)" }}>
                      <Crown className="w-3 h-3" /> Run
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}