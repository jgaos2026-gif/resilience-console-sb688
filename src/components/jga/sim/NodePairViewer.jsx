import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";

const GOLD = "#C9A84C";

const NODE_PAIRS = [
  { a: "Truth Node A", b: "Truth Node B", purpose: "QUBEX Truth Pair", desc: "Two truth readings compare facts, hashes, and claims. Both must survive.", color: GOLD, activeOn: ["drifting", "corrupted", "healing"] },
  { a: "Verification", b: "Validation", purpose: "Trust Gate 1+2", desc: "Is it real? Does it belong? Both gates before certification.", color: "#84cc16", activeOn: ["healthy", "healing", "recovering", "certified"] },
  { a: "Validation", b: "Certification", purpose: "Trust Gate 2+3", desc: "Valid is ready. Certified is trusted. Final mark before Spine access.", color: "#4ade80", activeOn: ["healing", "recovering", "certified"] },
  { a: "Hunter Node A", b: "Hunter Node B", purpose: "QUBEX Hunter Pair", desc: "One hunts active drift. The other hunts silent mismatch.", color: "#94a3b8", activeOn: ["drifting", "corrupted"] },
  { a: "Hunter Node", b: "Warrior Node", purpose: "Threat Response", desc: "Find it fast. Lock it clean. Warrior locks affected area.", color: "#ef4444", activeOn: ["corrupted"] },
  { a: "Ghost Node", b: "Phoenix Node", purpose: "Recovery Pair", desc: "Ghost remembers. Phoenix rises. Cert decides if recovery is trusted.", color: "#f97316", activeOn: ["healing", "recovering"] },
  { a: "RAM Guard", b: "Cooling Node", purpose: "Low-RAM Survival", desc: "RAM Guard watches pressure. Cooling slows the system. Survive together.", color: "#06b6d4", activeOn: ["corrupted", "healing"] },
  { a: "Ledger Node", b: "Proof Node", purpose: "Evidence Generation", desc: "The ledger writes. The proof explains. Chain becomes council-ready.", color: GOLD, activeOn: ["healing", "recovering", "certified"] },
  { a: "Silencing Node", b: "Anchor Node", purpose: "Noise Containment", desc: "Bad noise gets muted. The trusted baseline stands firm.", color: "#6366f1", activeOn: ["corrupted", "drifting"] },
  { a: "Client Intake", b: "Policy Node", purpose: "Business Gate", desc: "A job without policy is a loose wire. Policy must agree with intake.", color: "#fbbf24", activeOn: ["healthy", "certified"] },
  { a: "Contractor Routing", b: "Payment Verification", purpose: "Release Lock", desc: "Work can be finished before it is releasable. Payment unlocks.", color: "#22c55e", activeOn: ["healthy", "certified"] },
  { a: "Builder Node", b: "Tester Node", purpose: "Build-Test Pair", desc: "Built is not done until tested. No unchecked output enters trust.", color: "#a78bfa", activeOn: ["healthy", "recovering", "certified"] },
];

const THREE_BRAIDS = [
  { a: "Verification", b: "Validation", c: "Certification", label: "Main Trust Gate", desc: "Every active state must pass this braid before becoming trusted.", color: "#4ade80" },
  { a: "Hunter", b: "Quarantine", c: "Repair", label: "Failure Handling", desc: "Find it. Isolate it. Fix it outside the Spine.", color: "#ef4444" },
  { a: "Ghost", b: "Phoenix", c: "Certification", label: "Recovery Proof", desc: "Ghost provides. Phoenix restores. Cert confirms.", color: "#f97316" },
];

export default function NodePairViewer({ braidState, activeEvent }) {
  const [tab, setTab] = useState("pairs");

  return (
    <div className="rounded-2xl border border-border overflow-hidden" style={{ background: "hsl(220,18%,7%)" }}>
      <div className="flex items-center gap-0 border-b border-border">
        {[{ id: "pairs", label: "Node Pairs" }, { id: "braids", label: "3-Node Braids" }, { id: "silence", label: "Silence Laws" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 text-[10px] font-bold py-2.5 transition-all border-b-2"
            style={tab === t.id
              ? { color: GOLD, borderColor: GOLD, background: "rgba(201,168,76,0.05)" }
              : { color: "#6b7280", borderColor: "transparent" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "pairs" && (
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {NODE_PAIRS.map((pair, i) => {
            const active = pair.activeOn.includes(braidState);
            return (
              <div key={i} className="rounded-xl border p-3 transition-all"
                style={active
                  ? { background: `${pair.color}08`, borderColor: `${pair.color}30` }
                  : { background: "rgba(0,0,0,0.15)", borderColor: "rgba(255,255,255,0.04)" }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: active ? pair.color : "#374151" }} />
                  <span className="text-[8px] font-bold font-mono" style={{ color: active ? pair.color : "#4b5563" }}>{pair.purpose}</span>
                </div>
                <div className="flex items-center gap-1 mb-1.5">
                  <span className="text-[9px] font-semibold" style={{ color: active ? "#e2d9b3" : "#4b5563" }}>{pair.a}</span>
                  <span className="text-[8px] text-muted-foreground">⟷</span>
                  <span className="text-[9px] font-semibold" style={{ color: active ? "#e2d9b3" : "#4b5563" }}>{pair.b}</span>
                </div>
                <p className="text-[8px] leading-relaxed" style={{ color: active ? "#94a3b8" : "#374151" }}>{pair.desc}</p>
              </div>
            );
          })}
        </div>
      )}

      {tab === "braids" && (
        <div className="p-3 space-y-2">
          {THREE_BRAIDS.map((b, i) => (
            <div key={i} className="rounded-xl border p-4" style={{ background: `${b.color}06`, borderColor: `${b.color}25` }}>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="text-[8px] font-bold border px-2" style={{ background: `${b.color}10`, color: b.color, borderColor: `${b.color}30` }}>{b.label}</Badge>
              </div>
              <div className="flex items-center gap-2 mb-2">
                {[b.a, b.b, b.c].map((node, j) => (
                  <React.Fragment key={j}>
                    <div className="rounded-lg px-2 py-1 text-[9px] font-bold font-mono" style={{ background: `${b.color}12`, color: b.color, border: `1px solid ${b.color}25` }}>{node}</div>
                    {j < 2 && <span className="text-muted-foreground text-[10px]">→</span>}
                  </React.Fragment>
                ))}
              </div>
              <p className="text-[9px] text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}
          <div className="rounded-xl border p-3 text-center" style={{ background: "rgba(201,168,76,0.04)", borderColor: "rgba(201,168,76,0.15)" }}>
            <p className="text-[9px] font-semibold" style={{ color: GOLD }}>
              System Law: No active state becomes trusted state without verification, validation, and certification — three times marked.
            </p>
          </div>
        </div>
      )}

      {tab === "silence" && (
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { name: "Quarantine Silence", desc: "Incoming untrusted items held until checked. Spine never receives raw input.", color: "#f97316" },
            { name: "Error Storm Silence", desc: "Repeated errors grouped — not allowed to flood the system.", color: "#ef4444" },
            { name: "Chain-Link Silence", desc: "A failed node cannot contaminate connected nodes.", color: "#fbbf24" },
            { name: "Spine Silence", desc: "Spine does not listen to anything that has not passed all trust gates.", color: GOLD },
            { name: "Memory Pocket Silence", desc: "Inactive pockets stay cold and quiet until requested.", color: "#60a5fa" },
            { name: "Heartbeat Silence", desc: "Listens for missed heartbeats but does not panic over one weak signal.", color: "#4ade80" },
            { name: "Proof Silence", desc: "Claims do not get promoted without proof. No loud claims with no evidence.", color: GOLD },
            { name: "Recovery Silence", desc: "A restored state does not shout fixed until it passes re-certification.", color: "#a78bfa" },
            { name: "Payment Silence", desc: "Final delivery locked until payment rules satisfied.", color: "#22c55e" },
            { name: "Noise-to-Ledger Silence", desc: "Errors are recorded cleanly instead of flooding the screen.", color: "#06b6d4" },
            { name: "Contractor Silence", desc: "Contractor files enter quarantine before client visibility.", color: "#f59e0b" },
            { name: "Diamond-Crusted Layer", desc: "Hardened mesh boundary. Only certified signal passes through.", color: "#818cf8" },
          ].map((s, i) => (
            <div key={i} className="rounded-lg border p-2.5" style={{ background: `${s.color}06`, borderColor: `${s.color}20` }}>
              <div className="text-[9px] font-bold font-mono mb-0.5" style={{ color: s.color }}>{s.name}</div>
              <div className="text-[8px] text-muted-foreground leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}