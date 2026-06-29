import React, { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { generateAVAReply, getChat, saveChat } from "@/lib/avaLocal";

const GOLD = "#C9A84C";

export default function AVAChatPanel({ helpers }) {
  const [messages, setMessages] = useState(() => getChat());
  const [input, setInput] = useState("");

  useEffect(() => { saveChat(messages); }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const user = { role: "owner", content: input.trim() };
    const reply = { role: "ava", content: generateAVAReply(input, helpers) };
    setMessages(prev => [...prev, user, reply].slice(-80));
    setInput("");
  };

  return (
    <div className="rounded-2xl border p-4 space-y-3" style={{ background: "#0b0b0b", borderColor: `${GOLD}28` }}>
      <div><h2 className="text-sm font-black font-cinzel" style={{ color: GOLD }}>AVA Offline Personal Chat</h2><p className="text-[10px] text-muted-foreground">Local-first. No hidden listener. No fake live claims.</p></div>
      <div className="h-80 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && <div className="text-xs text-muted-foreground">Owner code accepted. AVA unleashed. Ask “who are you”, “status”, “remember …”, or “mode business”.</div>}
        {messages.map((m, i) => <div key={i} className={`flex ${m.role === "owner" ? "justify-end" : "justify-start"}`}><div className="max-w-[85%] rounded-xl px-3 py-2 text-xs whitespace-pre-wrap" style={m.role === "owner" ? { background: GOLD, color: "#080808" } : { background: "rgba(255,255,255,0.06)", color: "rgba(232,217,176,0.9)", border: `1px solid ${GOLD}16` }}>{m.content}</div></div>)}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Speak to AVA locally…" className="flex-1 bg-black border rounded-xl px-3 py-3 text-xs" style={{ borderColor: `${GOLD}25` }} />
        <button onClick={send} className="px-4 rounded-xl" style={{ background: GOLD, color: "#080808" }}><Send className="w-4 h-4" /></button>
      </div>
    </div>
  );
}