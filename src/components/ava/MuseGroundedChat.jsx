import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import api from "@/api/apiClient";

const GOLD = "#C9A84C";
const MODES = ["system", "business", "compliance", "systemb", "personal", "prompt", "proof", "quiet"];

export default function MuseGroundedChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("system");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "owner", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/api/ai/chat", {
        prompt: text,
        mode,
        messages: next.slice(-12).map(m => ({ role: m.role, content: m.content })),
      });
      if (!res) { setError("Sign in to the console backend to talk to AVA."); return; }
      setMessages(prev => [...prev, { role: "ava", content: res.reply, meta: res.evidence, actions: res.actions || [] }]);
    } catch (err) {
      setError(err?.message || "The AI bridge did not answer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border p-4 space-y-3" style={{ background: "#0b0b0b", borderColor: `${GOLD}28` }}>
      <div>
        <h2 className="text-sm font-black font-cinzel" style={{ color: GOLD }}>AVA — Grounded Intelligence</h2>
        <p className="text-[10px] text-muted-foreground">
          Answers are stamped with provider, model, latency, and a reply hash. Status claims come only from verified state, and every action taken is listed under the reply.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {MODES.map(m => (
          <button key={m} onClick={() => setMode(m)}
            className="px-2 py-1 rounded-md text-[9px] font-black uppercase border"
            style={mode === m
              ? { background: GOLD, color: "#080808", borderColor: GOLD }
              : { color: `${GOLD}90`, borderColor: `${GOLD}20`, background: "rgba(0,0,0,.35)" }}>
            {m}
          </button>
        ))}
      </div>

      <div className="h-72 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Ask about spine health, braid integrity, the trust ledger, or the verification gates — or tell AVA to act. She can read state, contain a node, intake and verify items, record evidence, and configure herself. Phoenix recovery stays owner-only.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "owner" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[85%] space-y-1">
              <div className="rounded-xl px-3 py-2 text-xs whitespace-pre-wrap"
                style={m.role === "owner"
                  ? { background: GOLD, color: "#080808" }
                  : { background: "rgba(255,255,255,0.06)", color: "rgba(232,217,176,0.9)", border: `1px solid ${GOLD}16` }}>
                {m.content}
              </div>
              {m.actions?.length > 0 && (
                <div className="rounded-lg border px-2 py-1.5 space-y-0.5"
                  style={{ borderColor: `${GOLD}22`, background: "rgba(0,0,0,.35)" }}>
                  <p className="text-[9px] uppercase font-black tracking-widest" style={{ color: `${GOLD}90` }}>
                    Actions taken
                  </p>
                  {m.actions.map((a, k) => (
                    <p key={k} className="text-[10px]"
                      style={{ color: a.ok ? "#4ade80" : a.refused ? "#f0b429" : "#f87171" }}>
                      {a.action} — {a.summary || a.error}
                    </p>
                  ))}
                </div>
              )}
              {m.meta && (
                <p className="text-[9px] text-muted-foreground px-1">
                  {m.meta.provider} · {m.meta.model} · {m.meta.latency_ms ?? "—"}ms · {m.meta.state}
                  {m.meta.tool_steps ? ` · ${m.meta.tool_steps} tool step(s)` : ""}
                  {m.meta.fallback_used ? " · grounded state fallback" : ""}
                </p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" style={{ color: GOLD }} /> AVA is checking verified state…
          </div>
        )}
      </div>

      {error && <p className="text-[11px] text-red-300">{error}</p>}

      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          disabled={loading}
          placeholder="Ask AVA about verified console state…"
          className="flex-1 bg-black border rounded-xl px-3 py-3 text-xs"
          style={{ borderColor: `${GOLD}25` }} />
        <button onClick={send} disabled={loading || !input.trim()}
          className="px-4 rounded-xl disabled:opacity-40" style={{ background: GOLD, color: "#080808" }}>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}