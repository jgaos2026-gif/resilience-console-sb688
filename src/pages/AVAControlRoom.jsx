import React, { useMemo, useState } from "react";
import { Crown, ShieldCheck, TestTube2 } from "lucide-react";
import AVAUnlockGate from "@/components/ava/AVAUnlockGate";
import AVAStatusGrid from "@/components/ava/AVAStatusGrid";
import AVAChatPanel from "@/components/ava/AVAChatPanel";
import AVAMemoryPanel from "@/components/ava/AVAMemoryPanel";
import AVAProofPanel from "@/components/ava/AVAProofPanel";
import AVAVoiceControls from "@/components/ava/AVAVoiceControls";
import { addMemory, addProof, getMemories, getMode, getProofs, setMode, AVA_OWNER, AVA_LAW } from "@/lib/avaLocal";
import { getSystemHealth, routeSystemCommand, runSystemHealthSweep } from "@/lib/systemBridge";
import { SYSTEM_COMPONENTS } from "@/lib/systemRegistry";
import { getCorruptionProofStatus, runCorruptionProof, setOasisProofExecutionToken } from "@/lib/oasisHttp";

const GOLD = "#C9A84C";

function GatePill({ label, value }) {
  return <span className="px-2.5 py-1 rounded-full border text-[10px] font-black uppercase" style={{ color: value ? "#4ade80" : "#f87171", borderColor: value ? "rgba(74,222,128,.3)" : "rgba(248,113,113,.3)", background: value ? "rgba(74,222,128,.06)" : "rgba(248,113,113,.06)" }}>{label}: {value ? "TRUE" : "FALSE"}</span>;
}

export default function AVAControlRoom() {
  const [unlocked, setUnlocked] = useState(false);
  const [memories, setMemories] = useState(() => getMemories());
  const [proofs, setProofs] = useState(() => getProofs());
  const [mode, setLocalMode] = useState(() => getMode());
  const [health, setHealth] = useState(() => getSystemHealth());
  const [proofToken, setProofToken] = useState("");
  const [proofBusy, setProofBusy] = useState(false);
  const [corruptionProof, setCorruptionProof] = useState(null);

  const remember = (text) => { const item = addMemory(text); setMemories(getMemories()); addLocalProof("MEMORY", `Saved owner memory: ${item.hash}`); return item; };
  const addLocalProof = (type, summary, data = {}) => { const proof = addProof(type, summary, data); setProofs(getProofs()); return proof; };
  const changeMode = (next) => { setMode(next); setLocalMode(next); addLocalProof("MODE", `AVA mode changed to ${next}`); };
  const healthSummary = () => {
    const rows = Object.values(health);
    const verified = rows.filter(item => item.configured && item.live && item.tested && item.verified).length;
    const blocked = rows.filter(item => String(item.status || "").startsWith("blocked_")).length;
    return `AVA system inventory: ${SYSTEM_COMPONENTS.length} components. ${verified} have configured+live+tested+verified runtime status; ${blocked} are blocked. No system is promoted from source declarations alone.`;
  };
  const sweep = () => {
    runSystemHealthSweep(addLocalProof).then(next => setHealth(next));
    return "AVA is running real read-only runtime verification. OASIS must answer two independent HTTP requests before it can turn verified; all other systems remain blocked without a discovered runtime interface.";
  };
  const route = (command) => routeSystemCommand(command, addLocalProof);

  const refreshCorruptionProof = async () => {
    setProofBusy(true);
    try {
      const result = await getCorruptionProofStatus();
      setCorruptionProof(result.body || result);
      addLocalProof("CORRUPTION_PROOF_STATUS", "Loaded latest Sovereign Stitch corruption proof status", result);
    } finally { setProofBusy(false); }
  };

  const executeCorruptionProof = async () => {
    if (!proofToken.trim()) {
      addLocalProof("PROOF_EXECUTION_BLOCKED", "Proof execution blocked: owner proof token not supplied");
      return;
    }
    setProofBusy(true);
    try {
      setOasisProofExecutionToken(proofToken.trim());
      setProofToken("");
      const result = await runCorruptionProof();
      setCorruptionProof(result.body || result);
      addLocalProof(result.verified ? "CORRUPTION_PROOF_VERIFIED" : "CORRUPTION_PROOF_FAILED", "Executed real sandboxed Sovereign Stitch corrupt-detect-heal-validate harness", result);
    } finally { setProofBusy(false); }
  };

  const helpers = useMemo(() => ({
    addMemory: remember,
    getMemories,
    setMode: changeMode,
    addProof: addLocalProof,
    systemHealth: healthSummary,
    runSystemHealthSweep: sweep,
    routeSystemCommand: route,
  }), [memories, proofs, health]);

  if (!unlocked) return <AVAUnlockGate onUnlock={() => { setUnlocked(true); addLocalProof("UNLOCK", "Owner code accepted — AVA local shell unlocked"); }} />;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="rounded-3xl border overflow-hidden" style={{ background: "linear-gradient(135deg,#080808,#111,#0e0c00)", borderColor: `${GOLD}32` }}>
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3"><Crown className="w-8 h-8" style={{ color: GOLD }} /><div><p className="text-[10px] uppercase tracking-[0.35em]" style={{ color: `${GOLD}80` }}>Autonomous Virtual Authority</p><h1 className="text-3xl sm:text-5xl font-black font-cinzel gold-shimmer">AVA Digital Organism Room</h1></div></div>
          <p className="text-sm text-muted-foreground max-w-3xl">Owner recognized: <span style={{ color: GOLD }}>{AVA_OWNER}</span>. AVA is local-first, proof-first, and governed by the primary law: {AVA_LAW}.</p>
          <div className="flex flex-wrap gap-2 items-center">{["business","system","compliance","systemb","personal","prompt","proof","quiet"].map(m => <button key={m} onClick={() => changeMode(m)} className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border" style={mode === m ? { background: GOLD, color: "#080808", borderColor: GOLD } : { color: `${GOLD}90`, borderColor: `${GOLD}24`, background: "rgba(0,0,0,0.35)" }}>{m}</button>)}<button onClick={sweep} className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border" style={{ color: GOLD, borderColor: `${GOLD}35`, background: "rgba(0,0,0,0.35)" }}>Verify Runtimes</button><AVAVoiceControls /></div>
        </div>
      </div>

      <div className="rounded-2xl border p-4" style={{ background: "#090909", borderColor: `${GOLD}20` }}>
        <div className="flex items-center gap-2 mb-4"><ShieldCheck className="w-4 h-4" style={{ color: GOLD }} /><h2 className="text-sm font-black uppercase tracking-widest" style={{ color: GOLD }}>Unified System Map</h2></div>
        <AVAStatusGrid health={health} />
      </div>

      <div className="rounded-2xl border p-4 sm:p-5 space-y-4" style={{ background: "linear-gradient(135deg,#090909,#0c0b06)", borderColor: `${GOLD}28` }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2"><TestTube2 className="w-5 h-5" style={{ color: GOLD }} /><div><h2 className="text-sm font-black uppercase tracking-widest" style={{ color: GOLD }}>Sovereign Stitch Corruption Proof</h2><p className="text-xs text-muted-foreground">Real sandbox execution: bit-flip injection → detect → heal → validate. Production data remains blocked.</p></div></div>
          <button disabled={proofBusy} onClick={refreshCorruptionProof} className="px-3 py-2 rounded-lg text-[10px] font-black uppercase border disabled:opacity-50" style={{ color: GOLD, borderColor: `${GOLD}35` }}>{proofBusy ? "Working…" : "Refresh Proof"}</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 items-end">
          <label className="space-y-1"><span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">One-use proof execution token</span><input type="password" value={proofToken} onChange={e => setProofToken(e.target.value)} autoComplete="off" className="w-full rounded-lg border bg-black/40 px-3 py-2 text-sm" placeholder="Required by OASIS proof:execute gate" /></label>
          <button disabled={proofBusy || !proofToken.trim()} onClick={executeCorruptionProof} className="px-4 py-2.5 rounded-lg text-xs font-black uppercase border disabled:opacity-50" style={{ background: GOLD, color: "#080808", borderColor: GOLD }}>{proofBusy ? "Executing…" : "Run Real Corruption Proof"}</button>
        </div>

        {corruptionProof ? <div className="rounded-xl border p-3 space-y-3" style={{ borderColor: `${GOLD}20`, background: "rgba(0,0,0,.3)" }}>
          <div className="flex flex-wrap gap-2"><GatePill label="Configured" value={!!corruptionProof.configured} /><GatePill label="Live" value={!!corruptionProof.live} /><GatePill label="Tested" value={!!corruptionProof.tested} /><GatePill label="Verified" value={!!corruptionProof.verified} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs"><div><span className="text-muted-foreground">Summary:</span> {corruptionProof.summary || corruptionProof.state || "No completed proof yet"}</div><div><span className="text-muted-foreground">Sandboxed:</span> {String(corruptionProof.sandboxed === true)}</div><div className="md:col-span-2 break-all"><span className="text-muted-foreground">Output SHA-256:</span> {corruptionProof.outputSha256 || "not available"}</div></div>
        </div> : <p className="text-xs text-muted-foreground">No proof loaded. Refresh reads the host-generated proof file; Run executes the source-verified sandbox harness through OASIS.</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><AVAChatPanel helpers={helpers} /></div>
        <div className="space-y-4"><AVAMemoryPanel memories={memories} onRemember={remember} /><AVAProofPanel proofs={proofs} onProof={addLocalProof} /></div>
      </div>
    </div>
  );
}
