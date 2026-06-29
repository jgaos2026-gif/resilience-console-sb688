import React from "react";
import { FileCheck } from "lucide-react";

const GOLD = "#C9A84C";

export default function AVAProofPanel({ proofs, onProof }) {
  return (
    <div className="rounded-2xl border p-4 space-y-3" style={{ background: "#0b0b0b", borderColor: `${GOLD}24` }}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-black font-cinzel" style={{ color: GOLD }}>Proof Ledger</h2>
        <button onClick={() => onProof("DAILY", "Owner opened AVA local control room")} className="text-[9px] font-black uppercase px-3 py-1 rounded-lg" style={{ background: `${GOLD}16`, color: GOLD }}>Write Proof</button>
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {proofs.length ? proofs.slice(0, 12).map(p => (
          <div key={p.id} className="border rounded-lg p-3 text-[10px]" style={{ borderColor: `${GOLD}14` }}>
            <div className="flex items-center gap-2 font-black" style={{ color: GOLD }}><FileCheck className="w-3 h-3" />{p.type}</div>
            <div className="text-muted-foreground mt-1">{p.summary}</div>
            <div className="mt-1 font-mono" style={{ color: "rgba(201,168,76,0.55)" }}>{p.hash}</div>
          </div>
        )) : <div className="text-[10px] text-muted-foreground">No proof records yet.</div>}
      </div>
    </div>
  );
}