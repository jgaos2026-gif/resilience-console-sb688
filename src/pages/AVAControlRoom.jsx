import React, { useMemo, useState } from "react";
import { Crown, ShieldCheck } from "lucide-react";
import AVAUnlockGate from "@/components/ava/AVAUnlockGate";
import AVAStatusGrid from "@/components/ava/AVAStatusGrid";
import AVAChatPanel from "@/components/ava/AVAChatPanel";
import AVAMemoryPanel from "@/components/ava/AVAMemoryPanel";
import AVAProofPanel from "@/components/ava/AVAProofPanel";
import AVAVoiceControls from "@/components/ava/AVAVoiceControls";
import { addMemory, addProof, getMemories, getMode, getProofs, setMode, AVA_OWNER, AVA_LAW } from "@/lib/avaLocal";
import { getSystemHealth, routeSystemCommand, runSystemHealthSweep } from "@/lib/systemBridge";
import { SYSTEM_COMPONENTS } from "@/lib/systemRegistry";

const GOLD = "#C9A84C";

export default function AVAControlRoom() {
  const [unlocked, setUnlocked] = useState(false);
  const [memories, setMemories] = useState(() => getMemories());
  const [proofs, setProofs] = useState(() => getProofs());
  const [mode, setLocalMode] = useState(() => getMode());
  const [health, setHealth] = useState(() => getSystemHealth());

  const remember = (text) => { const item = addMemory(text); setMemories(getMemories()); addLocalProof("MEMORY", `Saved owner memory: ${item.hash}`); return item; };
  const addLocalProof = (type, summary, data = {}) => { const proof = addProof(type, summary, data); setProofs(getProofs()); return proof; };
  const changeMode = (next) => { setMode(next); setLocalMode(next); addLocalProof("MODE", `AVA mode changed to ${next}`); };
  const healthSummary = () => {
    const registered = Object.values(health).filter(item => item.status === "registered").length;
    const pending = Object.values(health).filter(item => item.status === "pending-access").length;
    return `AVA system registry: ${SYSTEM_COMPONENTS.length} components. Last local sweep shows ${registered} registered and ${pending} pending-access. Runtime execution is only claimed when a configured adapter proves it.`;
  };
  const sweep = () => {
    runSystemHealthSweep(addLocalProof).then(next => setHealth(next));
    return "AVA health sweep started locally. Registry state will be proof-logged; external runtimes are not claimed live without adapters.";
  };
  const route = (command) => routeSystemCommand(command, addLocalProof);
  const helpers = useMemo(() => ({
    addMemory: remember,
    getMemories,
    setMode: changeMode,
    addProof: addLocalProof,
    systemHealth: healthSummary,
    runSystemHealthSweep: sweep,
    routeSystemCommand: route,
  }), [memories, proofs, health]);

  if (!unlocked) return <AVAUnlockGate onUnlock={() => { setUnlocked(true); addLocalProof("UNLOCK", "Owner code 1211 accepted — AVA local shell unleashed"); }} />;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="rounded-3xl border overflow-hidden" style={{ background: "linear-gradient(135deg,#080808,#111,#0e0c00)", borderColor: `${GOLD}32` }}>
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3"><Crown className="w-8 h-8" style={{ color: GOLD }} /><div><p className="text-[10px] uppercase tracking-[0.35em]" style={{ color: `${GOLD}80` }}>Autonomous Virtual Authority</p><h1 className="text-3xl sm:text-5xl font-black font-cinzel gold-shimmer">AVA Digital Organism Room</h1></div></div>
          <p className="text-sm text-muted-foreground max-w-3xl">Owner recognized: <span style={{ color: GOLD }}>{AVA_OWNER}</span>. AVA is local-first, honest, JGA-branded, and governed by the primary law: {AVA_LAW}.</p>
          <div className="flex flex-wrap gap-2 items-center">{["business","system","compliance","systemb","personal","prompt","proof","quiet"].map(m => <button key={m} onClick={() => changeMode(m)} className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border" style={mode === m ? { background: GOLD, color: "#080808", borderColor: GOLD } : { color: `${GOLD}90`, borderColor: `${GOLD}24`, background: "rgba(0,0,0,0.35)" }}>{m}</button>)}<button onClick={sweep} className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border" style={{ color: GOLD, borderColor: `${GOLD}35`, background: "rgba(0,0,0,0.35)" }}>Health Sweep</button><AVAVoiceControls /></div>
        </div>
      </div>

      <div className="rounded-2xl border p-4" style={{ background: "#090909", borderColor: `${GOLD}20` }}>
        <div className="flex items-center gap-2 mb-4"><ShieldCheck className="w-4 h-4" style={{ color: GOLD }} /><h2 className="text-sm font-black uppercase tracking-widest" style={{ color: GOLD }}>Unified System Map</h2></div>
        <AVAStatusGrid health={health} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><AVAChatPanel helpers={helpers} /></div>
        <div className="space-y-4"><AVAMemoryPanel memories={memories} onRemember={remember} /><AVAProofPanel proofs={proofs} onProof={addLocalProof} /></div>
      </div>
    </div>
  );
}