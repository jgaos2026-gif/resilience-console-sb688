import React, { useState, useCallback, useRef } from "react";

// ── Seal helpers ──────────────────────────────────────────────────────────────
function generateSeal(brickName, state) {
  const data = brickName + "|" + state;
  let hash = 0x12345678;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) ^ hash ^ data.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0") + "-sb688";
}

function freshBricks() {
  const defs = {
    core:        "HEALED",
    driver_net:  "HEALED",
    vault_brick: "HEALED",
    user_app:    "HEALED",
    trap_q1:     "ACTIVE",
  };
  const out = {};
  for (const [k, v] of Object.entries(defs)) {
    out[k] = { state: v, seal: generateSeal(k, v) };
  }
  return out;
}

const BRICK_LABELS = {
  core:        "Core",
  driver_net:  "Driver Net",
  vault_brick: "Vault Brick",
  user_app:    "User App",
  trap_q1:     "Trap Q1",
};

function brickColor(state) {
  if (state === "HEALED")   return { text: "text-[#22c55e]", border: "border-[#22c55e]/30", bg: "bg-[#22c55e]/5" };
  if (state === "ACTIVE")   return { text: "text-[#3b82f6]", border: "border-[#3b82f6]/30", bg: "bg-[#3b82f6]/5" };
  if (state.startsWith("CONTAINING")) return { text: "text-[#ef4444]", border: "border-[#ef4444]/40", bg: "bg-[#ef4444]/8" };
  if (state === "QUARANTINED") return { text: "text-[#ef4444]", border: "border-[#ef4444]/40", bg: "bg-[#ef4444]/5" };
  if (state.includes("HALLUCINATING") || state.includes("TAMPERED")) return { text: "text-[#f59e0b]", border: "border-[#f59e0b]/40", bg: "bg-[#f59e0b]/5" };
  return { text: "text-[#6b6558]", border: "border-[#2a2622]", bg: "bg-[#0e1218]" };
}

export default function SovereignStitchPanel() {
  const [bricks, setBricks] = useState(freshBricks);
  const [log, setLog] = useState([
    { t: "init", msg: "[SYSTEM] SB-688 Sovereign Stitch online. All bricks sealed." },
  ]);
  const [ghostKey, setGhostKey] = useState("");
  const [ghostStatus, setGhostStatus] = useState(null); // null | "healing" | "success" | "denied"
  const [sweeping, setSweeping] = useState(false);
  const timerRef = useRef(null);

  const addLog = useCallback((msg) => {
    const t = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLog(prev => [{ t, msg }, ...prev].slice(0, 40));
  }, []);

  // ── Sentinel Sweep ──────────────────────────────────────────────────────────
  const sentinelSweep = useCallback(() => {
    setSweeping(true);
    addLog("[SENTINEL] Commencing Byte-Level Integrity Sweep...");
    setTimeout(() => {
      setBricks(prev => {
        let clean = true;
        const next = { ...prev };
        for (const [name, data] of Object.entries(prev)) {
          if (name === "trap_q1") continue;
          const expected = generateSeal(name, data.state);
          if (expected !== data.seal) {
            clean = false;
            addLog(`[ALERT] BREACH DETECTED IN ${name.toUpperCase()}! Diverting to Trap.`);
            next[name] = { ...data, state: "QUARANTINED", seal: generateSeal(name, "QUARANTINED") };
            next["trap_q1"] = { ...next["trap_q1"], state: `CONTAINING_${name}` };
          }
        }
        if (clean) addLog("[SENTINEL] System Verified Clean. All seals intact.");
        return next;
      });
      setSweeping(false);
    }, 800);
  }, [addLog]);

  // ── Simulate corruption ─────────────────────────────────────────────────────
  const simulateCorrupt = useCallback(() => {
    setBricks(prev => ({
      ...prev,
      user_app: { state: "HALLUCINATING_TAMPERED_DATA", seal: "corrupted-xxxx" },
    }));
    addLog("[ACTION] user_app brick manually corrupted (simulated suicide).");
    addLog("[WARNING] Seal mismatch detected on user_app. Run Sentinel Sweep to isolate.");
  }, [addLog]);

  // ── Ghost Switch ────────────────────────────────────────────────────────────
  const activateGhost = useCallback(() => {
    if (ghostKey !== "1211") {
      setGhostStatus("denied");
      addLog("[GHOST] ACCESS DENIED. Invalid master key. System remains quarantined.");
      return;
    }
    setGhostStatus("healing");
    addLog("[GHOST] GHOST NODE ENERGIZED — OFF-GRID RECOVERY INITIATED.");
    addLog("[GHOST] Reeling system back to Sovereign Blueprint...");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setBricks(freshBricks());
      setGhostStatus("success");
      addLog("[SUCCESS] Global Infrastructure Reconstituted. Truth Verified. All seals restored.");
    }, 1400);
  }, [ghostKey, addLog]);

  const resetPanel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setBricks(freshBricks());
    setGhostKey("");
    setGhostStatus(null);
    setLog([{ t: "rst", msg: "[SYSTEM] Sovereign Stitch reset. All bricks sealed." }]);
  }, []);

  const anyBreached = Object.entries(bricks).some(
    ([k, v]) => k !== "trap_q1" && v.state !== "HEALED"
  );

  return (
    <div className="bg-[#0e1218] border border-[#c4a350]/20 rounded-lg p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-[10px] text-[#c4a350] uppercase tracking-widest font-bold">
            Sovereign Stitch Protocol — SB-688 Fortress Build
          </div>
          <div className="text-[9px] text-[#4a4642] mt-0.5">
            HMAC-SHA3-256 Sentinel · Ghost Reel-In · Trap-Brick Isolation · Architect: John E. Arenz
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${anyBreached ? "bg-[#ef4444] animate-pulse" : "bg-[#22c55e]"}`} />
          <span className={`text-[10px] font-bold ${anyBreached ? "text-[#ef4444]" : "text-[#22c55e]"}`}>
            {anyBreached ? "BREACH DETECTED" : "SYSTEM CLEAN"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Bricks + Controls */}
        <div className="space-y-4">
          {/* Brick grid */}
          <div>
            <div className="text-[9px] text-[#4a4642] uppercase tracking-wider mb-2">Clip-Brick Topology</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(bricks).map(([key, data]) => {
                const col = brickColor(data.state);
                return (
                  <div key={key} className={`rounded-lg border p-2.5 space-y-1 ${col.border} ${col.bg}`}>
                    <div className={`text-[10px] font-bold ${col.text}`}>{BRICK_LABELS[key]}</div>
                    <div className="text-[9px] text-[#4a4642] font-mono break-all leading-tight">{data.state}</div>
                    <div className="text-[8px] text-[#3a3632] font-mono">{data.seal.slice(0, 12)}…</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sentinel + Corrupt */}
          <div className="space-y-2">
            <div className="text-[9px] text-[#4a4642] uppercase tracking-wider">Sentinel Controls</div>
            <div className="flex flex-wrap gap-2">
              <button onClick={sentinelSweep} disabled={sweeping}
                className="px-3 py-1.5 border border-[#c4a350]/40 text-[#c4a350] text-[10px] rounded hover:bg-[#c4a350]/10 transition disabled:opacity-40">
                {sweeping ? "Sweeping…" : "⚡ Sentinel Sweep"}
              </button>
              <button onClick={simulateCorrupt}
                className="px-3 py-1.5 border border-[#f59e0b]/40 text-[#f59e0b] text-[10px] rounded hover:bg-[#f59e0b]/10 transition">
                ☠ Simulate Corruption
              </button>
              <button onClick={resetPanel}
                className="px-3 py-1.5 border border-[#3a3632] text-[#6b6558] text-[10px] rounded hover:text-[#d8d3c8] transition">
                Reset
              </button>
            </div>
          </div>

          {/* Ghost Switch */}
          <div className="border border-dashed border-[#ef4444]/20 rounded-lg p-3 space-y-2 bg-[#ef4444]/3">
            <div className="text-[9px] text-[#ef4444] uppercase tracking-wider font-bold">
              ◆ Ghost Emergency Switch — Off-Grid Reel-In
            </div>
            <p className="text-[9px] text-[#4a4642] leading-relaxed">
              Final line of defense. Enter remote master key to reconstitute from Sovereign Blueprint.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="password"
                value={ghostKey}
                onChange={e => setGhostKey(e.target.value)}
                onKeyDown={e => e.key === "Enter" && activateGhost()}
                placeholder="REMOTE MASTER KEY"
                className="bg-[#060810] border border-[#2a2622] text-[#d8d3c8] text-xs px-3 py-1.5 rounded focus:outline-none focus:border-[#ef4444]/50 w-44 font-mono tracking-widest"
              />
              <button onClick={activateGhost} disabled={ghostStatus === "healing"}
                className={`px-3 py-1.5 text-[10px] border rounded font-bold transition ${
                  ghostStatus === "healing"
                    ? "border-[#ef4444]/20 text-[#ef4444]/40 cursor-not-allowed"
                    : "border-[#ef4444]/50 text-[#ef4444] hover:bg-[#ef4444]/10"
                }`}>
                {ghostStatus === "healing" ? "REELING IN…" : "ACTIVATE GHOST"}
              </button>
            </div>
            {ghostStatus === "healing" && (
              <div className="text-[10px] text-[#ef4444] animate-pulse font-mono">
                ▶ GHOST NODE ENERGIZED — REELING SYSTEM TO SOVEREIGN BLUEPRINT…
              </div>
            )}
            {ghostStatus === "success" && (
              <div className="text-[10px] text-[#22c55e] font-mono">
                ✔ GLOBAL INFRASTRUCTURE RECONSTITUTED. TRUTH VERIFIED.
              </div>
            )}
            {ghostStatus === "denied" && (
              <div className="text-[10px] text-[#ef4444] font-mono">
                ✗ ACCESS DENIED. SYSTEM REMAINS IN QUARANTINE.
              </div>
            )}
          </div>
        </div>

        {/* Right: Log */}
        <div className="space-y-2">
          <div className="text-[9px] text-[#4a4642] uppercase tracking-wider">Sovereign Log</div>
          <div className="bg-[#060810] border border-[#2a2622] rounded-lg p-3 h-72 overflow-y-auto space-y-1.5 font-mono">
            {log.map((entry, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px]">
                <span className="text-[#3a3632] shrink-0">{entry.t}</span>
                <span className={`leading-tight ${
                  entry.msg.includes("BREACH") || entry.msg.includes("DENIED") || entry.msg.includes("HALT") ? "text-[#ef4444]" :
                  entry.msg.includes("SUCCESS") || entry.msg.includes("Clean") || entry.msg.includes("RECONSTITUTED") ? "text-[#22c55e]" :
                  entry.msg.includes("WARNING") || entry.msg.includes("corrupted") || entry.msg.includes("HALLUCINATING") ? "text-[#f59e0b]" :
                  entry.msg.includes("GHOST") || entry.msg.includes("ENERGIZED") ? "text-[#ef4444]" :
                  entry.msg.includes("SENTINEL") ? "text-[#c4a350]" :
                  "text-[#5a5550]"
                }`}>{entry.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}