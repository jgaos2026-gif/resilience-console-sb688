import React, { useState } from "react";
import { Search, Save } from "lucide-react";

const GOLD = "#C9A84C";

export default function AVAMemoryPanel({ memories, onRemember }) {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const shown = memories.filter(m => m.text.toLowerCase().includes(query.toLowerCase())).slice(0, 8);

  const save = () => { if (!text.trim()) return; onRemember(text.trim()); setText(""); };

  return (
    <div className="rounded-2xl border p-4 space-y-3" style={{ background: "#0b0b0b", borderColor: `${GOLD}24` }}>
      <h2 className="text-sm font-black font-cinzel" style={{ color: GOLD }}>Offline Owner Memory</h2>
      <div className="flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Save owner note locally…" className="flex-1 bg-black border rounded-lg px-3 py-2 text-xs" style={{ borderColor: `${GOLD}20` }} />
        <button onClick={save} className="px-3 rounded-lg" style={{ background: GOLD, color: "#080808" }}><Save className="w-4 h-4" /></button>
      </div>
      <div className="flex items-center gap-2 bg-black border rounded-lg px-3 py-2" style={{ borderColor: `${GOLD}16` }}>
        <Search className="w-3 h-3" style={{ color: GOLD }} />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find memory…" className="bg-transparent outline-none text-xs flex-1" />
      </div>
      <div className="space-y-2 max-h-56 overflow-y-auto">
        {shown.length ? shown.map(m => <div key={m.id} className="text-[10px] border rounded-lg p-2" style={{ borderColor: `${GOLD}12` }}>{m.text}<div className="text-muted-foreground mt-1">{m.hash}</div></div>) : <div className="text-[10px] text-muted-foreground">No local memory found.</div>}
      </div>
    </div>
  );
}