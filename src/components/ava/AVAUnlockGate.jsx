import React, { useState } from "react";
import { Lock, Crown } from "lucide-react";

const GOLD = "#C9A84C";

export default function AVAUnlockGate({ onUnlock }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const unlock = () => {
    if (code === "1211") onUnlock();
    else setError("Access denied. Owner code required.");
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border p-6 text-center space-y-5" style={{ background: "#080808", borderColor: `${GOLD}35` }}>
        <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}35` }}>
          <Crown className="w-8 h-8" style={{ color: GOLD }} />
        </div>
        <div>
          <h1 className="text-2xl font-black font-cinzel" style={{ color: GOLD }}>AVA Locked</h1>
          <p className="text-xs text-muted-foreground mt-2">Autonomous Virtual Authority awaits owner code.</p>
        </div>
        <input value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === "Enter" && unlock()} type="password" placeholder="Enter owner code" className="w-full bg-black border rounded-xl px-4 py-3 text-center tracking-[0.4em]" style={{ borderColor: `${GOLD}30`, color: GOLD }} />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button onClick={unlock} className="w-full rounded-xl py-3 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2" style={{ background: `linear-gradient(135deg, ${GOLD}, #8a6018)`, color: "#080808" }}>
          <Lock className="w-4 h-4" /> Unleash AVA
        </button>
      </div>
    </div>
  );
}