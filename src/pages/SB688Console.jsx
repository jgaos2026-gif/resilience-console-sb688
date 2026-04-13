import React, { useState, useEffect, useRef, useCallback } from "react";

// ── Topology data ─────────────────────────────────────────────────────────────
const NODES = [
  { id: "core",    label: "Core",    x: 0.50, y: 0.10 },
  { id: "gate",    label: "Gate",    x: 0.18, y: 0.35 },
  { id: "driver",  label: "Driver",  x: 0.82, y: 0.35 },
  { id: "storage", label: "Storage", x: 0.50, y: 0.55 },
  { id: "policy",  label: "Policy",  x: 0.18, y: 0.75 },
  { id: "output",  label: "Output",  x: 0.82, y: 0.75 },
  { id: "ledger",  label: "Ledger",  x: 0.50, y: 0.90 },
];

const EDGES = [
  { from: "core",    to: "gate",    type: "active" },
  { from: "core",    to: "driver",  type: "active" },
  { from: "gate",    to: "storage", type: "active" },
  { from: "driver",  to: "storage", type: "active" },
  { from: "storage", to: "policy",  type: "cold" },
  { from: "storage", to: "output",  type: "active" },
  { from: "policy",  to: "ledger",  type: "cold" },
  { from: "output",  to: "ledger",  type: "active" },
  { from: "gate",    to: "policy",  type: "cold" },
  { from: "driver",  to: "output",  type: "cold" },
];

const INCIDENTS = [
  { id: "driver",  label: "Driver fault",       affects: ["driver"] },
  { id: "gate",    label: "Gate isolation",      affects: ["gate"] },
  { id: "storage", label: "Storage corrupt",     affects: ["storage"] },
  { id: "policy",  label: "Policy violation",    affects: ["policy"] },
  { id: "hacker",  label: "Hacker Trap/Suicide", affects: ["core","gate","driver","storage","policy","output","ledger"] },
];

const BUILDER_PROMPT = `SB-688 Command Console — Builder Export Prompt

Create a single-page, browser-only web application called "SB-688 Command Console" that functions as a live operating model for a graph-based control plane.

Key Components:
- Owner login (owner / sb688) unlocking incident controls
- Public dashboard showing system health, active route, ledger head, heal actions, test score
- Live SVG topology graph with animated fault injection (10s wilt), instant self-heal, hacker brick+ledger-rollback sequence
- Incident controls: Driver fault, Gate isolation, Storage corrupt, Policy violation, Hacker Trap/Suicide
- Self-heal, Commit checkpoint, Run verification, Reset demo actions
- Route inspector with source/destination compute
- Verification panel with pass/fail tests
- Spine ledger showing trusted checkpoint history
- Operations log with timestamped events
- Builder prompt export (copy to clipboard)

Visual Style: Dark technical console aesthetic, gold accent, clean typography.
Stack: React + Tailwind CSS, no backend, all state client-side.

Recreate in Base44, Lovable, Famous AI, or any app builder.`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function ts() {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

function lerp(a, b, t) { return a + (b - a) * t; }

function interpolateColor(r1, g1, b1, r2, g2, b2, t) {
  return `rgb(${Math.round(lerp(r1, r2, t))},${Math.round(lerp(g1, g2, t))},${Math.round(lerp(b1, b2, t))})`;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SB688Console() {
  // Auth
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  // System state
  const [incident, setIncident] = useState(null);        // null | INCIDENTS[i]
  const [nodeStates, setNodeStates] = useState({});       // key → "healthy"|"degraded"|"isolated"|"bricked"
  const [healCount, setHealCount] = useState(0);
  const [ledgerVersion, setLedgerVersion] = useState(4);
  const [ledgerLog, setLedgerLog] = useState([
    { v: 1, msg: "Genesis checkpoint. All nodes trusted." },
    { v: 2, msg: "Route optimised. Cold standby registered." },
    { v: 3, msg: "Policy node re-integrated. Stitch confirmed." },
    { v: 4, msg: "Full topology verified. Trusted checkpoint sealed." },
  ]);
  const [opsLog, setOpsLog] = useState([
    { t: ts(), msg: "Console initialised. System stable." },
    { t: ts(), msg: "Ledger at v4. All nodes healthy." },
  ]);

  // Topology animation
  const [wiltProgress, setWiltProgress] = useState(0);    // 0 = green, 1 = red
  const [isBricked, setIsBricked] = useState(false);
  const wiltRef = useRef(null);

  // Route inspector
  const [routeSrc, setRouteSrc] = useState("core");
  const [routeDst, setRouteDst] = useState("ledger");
  const [computedRoute, setComputedRoute] = useState(null);

  // Verification
  const [verifyResults, setVerifyResults] = useState([]);
  const [verified, setVerified] = useState(false);

  // Derived
  const healthPct = incident ? (isBricked ? "0.0%" : wiltProgress > 0.7 ? "62.1%" : "81.4%") : "99.8%";
  const routeStatus = incident && !isBricked && wiltProgress > 0.5 ? "Rerouted" : incident && !isBricked ? "Degraded" : isBricked ? "Offline" : "Online";
  const testScore = verified ? `${verifyResults.filter(r => r.pass).length}/${verifyResults.length}` : "0/0";

  // ── Auth ────────────────────────────────────────────────────────────────────
  const unlock = () => {
    if (username === "owner" && password === "sb688") {
      setIsOwner(true);
      setShowLogin(false);
      setLoginError("");
      addLog("Owner authenticated. Incident controls unlocked.");
    } else {
      setLoginError("Invalid credentials. Try owner / sb688.");
    }
  };

  // ── Logging ──────────────────────────────────────────────────────────────────
  const addLog = useCallback((msg) => {
    setOpsLog(prev => [{ t: ts(), msg }, ...prev].slice(0, 50));
  }, []);

  // ── Wilt animation ───────────────────────────────────────────────────────────
  const startWilt = useCallback(() => {
    setWiltProgress(0);
    const start = Date.now();
    const duration = 10000; // 10 seconds
    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(elapsed / duration, 1);
      setWiltProgress(t);
      if (t < 1) {
        wiltRef.current = requestAnimationFrame(tick);
      }
    };
    wiltRef.current = requestAnimationFrame(tick);
  }, []);

  const stopWilt = useCallback(() => {
    if (wiltRef.current) cancelAnimationFrame(wiltRef.current);
    setWiltProgress(0);
    setIsBricked(false);
  }, []);

  useEffect(() => () => { if (wiltRef.current) cancelAnimationFrame(wiltRef.current); }, []);

  // ── Incident injection ───────────────────────────────────────────────────────
  const injectFault = useCallback((inc) => {
    if (wiltRef.current) cancelAnimationFrame(wiltRef.current);
    setIsBricked(false);
    setWiltProgress(0);

    if (inc.id === "hacker") {
      setIncident(inc);
      addLog("⚠ Hacker intrusion detected. Trap triggered.");
      addLog("☠ Hacker Intervention noticed and trapped. System suicide initiated.");
      // Immediate brick
      setIsBricked(true);
      setNodeStates(Object.fromEntries(NODES.map(n => [n.id, "bricked"])));
      // After 1.2s: instant ledger rollback to v4
      setTimeout(() => {
        setIsBricked(false);
        setWiltProgress(0);
        setNodeStates({});
        setIncident(null);
        addLog("✔ Ledger rollback to v4 complete. System restored. All nodes healthy.");
      }, 1200);
    } else {
      setIncident(inc);
      setNodeStates(Object.fromEntries(inc.affects.map(k => [k, "isolated"])));
      addLog(`Fault injected: ${inc.label}. Affected: ${inc.affects.join(", ")}.`);
      startWilt();
    }
  }, [addLog, startWilt]);

  // ── Self-heal ────────────────────────────────────────────────────────────────
  const selfHeal = useCallback(() => {
    if (!incident) return;
    stopWilt();
    setNodeStates({});
    setHealCount(c => c + 1);
    const newV = ledgerVersion + 1;
    setLedgerVersion(newV);
    setLedgerLog(prev => [...prev, { v: newV, msg: `Heal action #${healCount + 1}. ${incident.label} resolved.` }]);
    addLog(`Self-heal executed. ${incident.label} resolved. Ledger advanced to v${newV}.`);
    setIncident(null);
  }, [incident, stopWilt, healCount, ledgerVersion, addLog]);

  // ── Commit checkpoint ────────────────────────────────────────────────────────
  const commitCheckpoint = useCallback(() => {
    if (incident) { addLog("Cannot commit checkpoint during active incident."); return; }
    const newV = ledgerVersion + 1;
    setLedgerVersion(newV);
    setLedgerLog(prev => [...prev, { v: newV, msg: `Manual checkpoint committed. System clean.` }]);
    addLog(`Checkpoint committed. Ledger now at v${newV}.`);
  }, [incident, ledgerVersion, addLog]);

  // ── Verification ─────────────────────────────────────────────────────────────
  const runVerification = useCallback(() => {
    const results = [
      { name: "Core node reachable",        pass: !nodeStates["core"] || nodeStates["core"] === "healthy" },
      { name: "Active stitch count ≥ 4",    pass: !incident },
      { name: "Ledger head integrity",       pass: !incident },
      { name: "Policy compliance check",     pass: !nodeStates["policy"] },
      { name: "Cold standby registered",     pass: true },
      { name: "No unsafe state committed",   pass: !incident },
      { name: "Output node responsive",      pass: !nodeStates["output"] },
    ];
    setVerifyResults(results);
    setVerified(true);
    const passed = results.filter(r => r.pass).length;
    addLog(`Verification complete: ${passed}/${results.length} tests passed.`);
  }, [nodeStates, incident]);

  // ── Route compute ─────────────────────────────────────────────────────────────
  const computeRoute = useCallback(() => {
    // Simple BFS on healthy edges
    const healthy = NODES.map(n => n.id).filter(id => !nodeStates[id] || nodeStates[id] === "healthy");
    const adj = {};
    healthy.forEach(n => { adj[n] = []; });
    EDGES.forEach(e => {
      if (healthy.includes(e.from) && healthy.includes(e.to)) {
        adj[e.from]?.push({ to: e.to, type: e.type });
        adj[e.to]?.push({ to: e.from, type: e.type });
      }
    });
    // BFS
    const visited = new Set();
    const queue = [{ node: routeSrc, path: [routeSrc], types: [] }];
    while (queue.length) {
      const { node, path, types } = queue.shift();
      if (node === routeDst) {
        setComputedRoute({ path, types });
        addLog(`Route computed: ${path.join(" → ")} (${types.includes("cold") ? "uses cold standby" : "active stitches only"})`);
        return;
      }
      if (visited.has(node)) continue;
      visited.add(node);
      (adj[node] || []).forEach(({ to, type }) => {
        if (!visited.has(to)) queue.push({ node: to, path: [...path, to], types: [...types, type] });
      });
    }
    setComputedRoute({ path: [], types: [] });
    addLog(`No route found from ${routeSrc} to ${routeDst} — path blocked.`);
  }, [routeSrc, routeDst, nodeStates, addLog]);

  // ── Reset ────────────────────────────────────────────────────────────────────
  const resetDemo = useCallback(() => {
    stopWilt();
    setIncident(null);
    setNodeStates({});
    setHealCount(0);
    setLedgerVersion(4);
    setLedgerLog([
      { v: 1, msg: "Genesis checkpoint. All nodes trusted." },
      { v: 2, msg: "Route optimised. Cold standby registered." },
      { v: 3, msg: "Policy node re-integrated. Stitch confirmed." },
      { v: 4, msg: "Full topology verified. Trusted checkpoint sealed." },
    ]);
    setOpsLog([{ t: ts(), msg: "Demo reset. System stable." }]);
    setVerifyResults([]);
    setVerified(false);
    setComputedRoute(null);
    addLog("Demo reset complete.");
  }, [stopWilt, addLog]);

  // ── Node color for SVG ────────────────────────────────────────────────────────
  function nodeColor(id) {
    if (isBricked) return "#3a3a3a";
    const st = nodeStates[id];
    if (!st || st === "healthy") {
      // interpolate green → red based on wiltProgress if this node is affected
      if (incident && incident.affects.includes(id) && wiltProgress > 0) {
        return interpolateColor(20, 184, 166, 239, 68, 68, wiltProgress);
      }
      return "#14b8a6";
    }
    if (st === "degraded") return "#f59e0b";
    if (st === "isolated") return interpolateColor(20, 184, 166, 239, 68, 68, wiltProgress);
    if (st === "bricked")  return "#3a3a3a";
    return "#14b8a6";
  }

  function edgeColor(edge) {
    if (isBricked) return "#333";
    const fromSt = nodeStates[edge.from];
    const toSt   = nodeStates[edge.to];
    if (fromSt === "isolated" || toSt === "isolated")
      return interpolateColor(34, 197, 94, 239, 68, 68, wiltProgress);
    if (edge.type === "cold") return "rgba(196,163,80,0.25)";
    return "#22c55e";
  }

  const W = 500, H = 320;

  return (
    <div className="min-h-screen bg-[#090c10] text-[#d8d3c8] font-mono">
      {/* Header */}
      <header className="border-b border-[#c4a350]/20 bg-[#0c0f14]/90 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[#c4a350] font-bold text-base tracking-widest">SB-688 COMMAND CONSOLE</div>
            <div className="text-[10px] text-[#6b6558] mt-0.5">
              Routing, healing, governance, ledger, and builder export in one demo.{" "}
              <span className="text-[#22c55e]">System stable.</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            {!isOwner ? (
              <>
                <button onClick={() => setShowLogin(v => !v)}
                  className="px-3 py-1 border border-[#c4a350]/40 text-[#c4a350] hover:bg-[#c4a350]/10 rounded text-[10px] transition">
                  Open owner access
                </button>
                <a href="#console" className="px-3 py-1 border border-[#3a3632] text-[#6b6558] hover:text-[#d8d3c8] rounded text-[10px] transition">
                  Jump to console
                </a>
                <button onClick={() => {
                  const blob = new Blob([JSON.stringify({ incident, nodeStates, ledgerVersion, healCount, opsLog }, null, 2)], { type: "application/json" });
                  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
                  a.download = "sb688-state.json"; a.click();
                }} className="px-3 py-1 border border-[#3a3632] text-[#6b6558] hover:text-[#d8d3c8] rounded text-[10px] transition">
                  Export state JSON
                </button>
              </>
            ) : (
              <span className="px-3 py-1 bg-[#c4a350]/10 border border-[#c4a350]/30 text-[#c4a350] rounded text-[10px]">
                ● OWNER MODE
              </span>
            )}
          </div>
        </div>

        {/* Login panel */}
        {showLogin && !isOwner && (
          <div className="border-t border-[#c4a350]/15 bg-[#0e1218]">
            <div className="max-w-6xl mx-auto px-5 py-4 flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-[#6b6558] uppercase tracking-wider">Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="owner"
                  className="bg-[#131820] border border-[#2a2622] text-[#d8d3c8] text-sm px-3 py-1.5 rounded focus:outline-none focus:border-[#c4a350]/50 w-36"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-[#6b6558] uppercase tracking-wider">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••"
                  onKeyDown={e => e.key === "Enter" && unlock()}
                  className="bg-[#131820] border border-[#2a2622] text-[#d8d3c8] text-sm px-3 py-1.5 rounded focus:outline-none focus:border-[#c4a350]/50 w-36"
                />
              </div>
              <button onClick={unlock}
                className="px-4 py-1.5 bg-[#c4a350] text-[#090c10] font-bold text-sm rounded hover:bg-[#d4b360] transition">
                Unlock console
              </button>
              <button onClick={() => setShowLogin(false)}
                className="px-4 py-1.5 border border-[#3a3632] text-[#6b6558] text-sm rounded hover:text-[#d8d3c8] transition">
                Stay public only
              </button>
              {loginError && <span className="text-[#ef4444] text-xs">{loginError}</span>}
            </div>
          </div>
        )}
      </header>

      <main id="console" className="max-w-6xl mx-auto px-5 py-6 space-y-6">

        {/* Status panels */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "System health", value: healthPct, sub: incident && !isBricked ? "Incident active." : isBricked ? "System bricked." : "All core nodes trusted." },
            { label: "Active route",  value: routeStatus, sub: incident && !isBricked ? "Alternate path active." : isBricked ? "All paths down." : "Primary route ready.", green: !incident && !isBricked },
            { label: "Ledger head",   value: `v${ledgerVersion}`, sub: "Trusted checkpoint ready." },
            { label: "Heal actions",  value: healCount,   sub: healCount === 0 ? "No interventions needed." : `${healCount} heal(s) logged.` },
            { label: "Test score",    value: testScore,   sub: verified ? "Verification complete." : "Run verification to score this build." },
          ].map((kpi, i) => (
            <div key={i} className="bg-[#0e1218] border border-[#2a2622] rounded-lg p-4">
              <div className="text-[10px] text-[#6b6558] uppercase tracking-wider mb-1">{kpi.label}</div>
              <div className={`text-xl font-bold mb-1 ${kpi.green ? "text-[#22c55e]" : incident ? (isBricked ? "text-[#555]" : "text-[#f59e0b]") : "text-[#c4a350]"}`}>
                {kpi.value}
              </div>
              <div className="text-[10px] text-[#4a4642] leading-tight">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Core Features */}
        <div className="bg-[#0e1218] border border-[#2a2622] rounded-lg p-4">
          <div className="text-[10px] text-[#c4a350] uppercase tracking-widest mb-3">Core Features</div>
          <div className="flex flex-wrap gap-2">
            {["Real route computation","Cold-stitch fallback","Ledger head growth on heal","Verification panel","Builder prompt export"].map(f => (
              <span key={f} className="px-3 py-1 border border-[#22c55e]/20 text-[#22c55e] text-[10px] rounded-full">✓ {f}</span>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Topology */}
          <div className="bg-[#0e1218] border border-[#2a2622] rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] text-[#c4a350] uppercase tracking-widest">Live Topology</div>
              {incident && !isBricked && (
                <span className="text-[10px] text-[#f59e0b] animate-pulse">
                  WILTING... {Math.round(wiltProgress * 100)}%
                </span>
              )}
              {isBricked && (
                <span className="text-[10px] text-[#ef4444] animate-pulse">SYSTEM BRICKED</span>
              )}
            </div>

            {/* Color key */}
            <div className="flex flex-wrap gap-3 text-[9px] text-[#6b6558]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#14b8a6] inline-block" /> Healthy</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b] inline-block" /> Degraded</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444] inline-block" /> Isolated</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#555] inline-block" /> Bricked</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#22c55e] inline-block" /> Active stitch</span>
              <span className="flex items-center gap-1 opacity-60"><span className="w-3 h-0.5 border-t border-dashed border-[#c4a350] inline-block" /> Cold standby</span>
            </div>

            <div className="rounded overflow-hidden" style={{ background: "#060810" }}>
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
                {/* Edges */}
                {EDGES.map((e, i) => {
                  const fn = NODES.find(n => n.id === e.from);
                  const tn = NODES.find(n => n.id === e.to);
                  if (!fn || !tn) return null;
                  const col = edgeColor(e);
                  return (
                    <line key={i}
                      x1={fn.x * W} y1={fn.y * H}
                      x2={tn.x * W} y2={tn.y * H}
                      stroke={col}
                      strokeWidth={e.type === "active" ? 2 : 1}
                      strokeDasharray={e.type === "cold" ? "5 4" : undefined}
                      opacity={isBricked ? 0.2 : e.type === "active" ? 0.9 : 0.4}
                    />
                  );
                })}

                {/* Nodes */}
                {NODES.map(node => {
                  const col = nodeColor(node.id);
                  const x = node.x * W, y = node.y * H;
                  const isOnRoute = computedRoute?.path?.includes(node.id);
                  return (
                    <g key={node.id}>
                      {isOnRoute && <circle cx={x} cy={y} r={22} fill={col} opacity={0.1} />}
                      <circle cx={x} cy={y} r={18} fill={col} fillOpacity={0.12}
                        stroke={col} strokeWidth={isOnRoute ? 2.5 : 1.5} />
                      <text x={x} y={y + 4} textAnchor="middle" dominantBaseline="middle"
                        fill={col} fontSize={8} fontWeight="700"
                        style={{ userSelect: "none", pointerEvents: "none" }}>
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* AVA Roles */}
            <div className="border border-dashed border-[#2a2622] rounded p-3 text-[10px] text-[#3a3632] text-center">
              AVA ROLES — reserved for future governance detail
            </div>
          </div>

          {/* Controls + Route */}
          <div className="space-y-4">
            {/* Incident Controls */}
            <div className="bg-[#0e1218] border border-[#2a2622] rounded-lg p-4 space-y-3">
              <div className="text-[10px] text-[#c4a350] uppercase tracking-widest">Incident Controls</div>

              <div className="text-[10px] text-[#6b6558]">
                Status:{" "}
                <span className={incident ? "text-[#ef4444]" : "text-[#22c55e]"}>
                  {incident ? incident.label : "No active incident."}
                </span>
              </div>

              <div className="space-y-2">
                <div className="text-[9px] text-[#4a4642] uppercase tracking-wider">Fault Injection</div>
                <div className="flex flex-wrap gap-1.5">
                  {INCIDENTS.map(inc => (
                    <button key={inc.id}
                      disabled={!isOwner || !!incident}
                      onClick={() => injectFault(inc)}
                      className={`px-2.5 py-1 text-[10px] border rounded transition ${
                        !isOwner ? "border-[#2a2622] text-[#3a3632] cursor-not-allowed" :
                        incident ? "border-[#2a2622] text-[#4a4642] cursor-not-allowed" :
                        inc.id === "hacker"
                          ? "border-[#ef4444]/40 text-[#ef4444] hover:bg-[#ef4444]/10"
                          : "border-[#c4a350]/30 text-[#c4a350] hover:bg-[#c4a350]/10"
                      }`}>
                      {inc.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[9px] text-[#4a4642] uppercase tracking-wider">Actions</div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "Self-heal",          fn: selfHeal,          disabled: !isOwner || !incident || isBricked, color: "green" },
                    { label: "Commit checkpoint",  fn: commitCheckpoint,  disabled: !isOwner || !!incident, color: "blue" },
                    { label: "Run verification",   fn: runVerification,   disabled: false, color: "gold" },
                    { label: "Reset demo",         fn: resetDemo,         disabled: !isOwner, color: "red" },
                  ].map(btn => (
                    <button key={btn.label}
                      disabled={btn.disabled}
                      onClick={btn.fn}
                      className={`px-2.5 py-1 text-[10px] border rounded transition ${
                        btn.disabled ? "border-[#2a2622] text-[#3a3632] cursor-not-allowed" :
                        btn.color === "green" ? "border-[#22c55e]/40 text-[#22c55e] hover:bg-[#22c55e]/10" :
                        btn.color === "blue"  ? "border-[#3b82f6]/40 text-[#3b82f6] hover:bg-[#3b82f6]/10" :
                        btn.color === "gold"  ? "border-[#c4a350]/40 text-[#c4a350] hover:bg-[#c4a350]/10" :
                                                "border-[#ef4444]/40 text-[#ef4444] hover:bg-[#ef4444]/10"
                      }`}>
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {!isOwner && (
                <div className="text-[9px] text-[#3a3632] border border-dashed border-[#2a2622] rounded p-2 text-center">
                  Incident controls are owner-restricted. Login to unlock.
                </div>
              )}
            </div>

            {/* Route Inspector */}
            <div className="bg-[#0e1218] border border-[#2a2622] rounded-lg p-4 space-y-3">
              <div className="text-[10px] text-[#c4a350] uppercase tracking-widest">Route Inspector</div>
              <p className="text-[10px] text-[#4a4642] leading-relaxed">
                Computes the best reachable path right now, preferring active stitches before cold standbys.
              </p>
              <div className="flex items-end gap-2 flex-wrap">
                <div className="space-y-1">
                  <label className="text-[9px] text-[#6b6558] uppercase tracking-wider">Source</label>
                  <select value={routeSrc} onChange={e => setRouteSrc(e.target.value)}
                    className="bg-[#131820] border border-[#2a2622] text-[#d8d3c8] text-xs px-2 py-1 rounded focus:outline-none focus:border-[#c4a350]/50">
                    {NODES.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-[#6b6558] uppercase tracking-wider">Destination</label>
                  <select value={routeDst} onChange={e => setRouteDst(e.target.value)}
                    className="bg-[#131820] border border-[#2a2622] text-[#d8d3c8] text-xs px-2 py-1 rounded focus:outline-none focus:border-[#c4a350]/50">
                    {NODES.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                  </select>
                </div>
                <button onClick={computeRoute}
                  className="px-3 py-1.5 border border-[#3b82f6]/40 text-[#3b82f6] text-xs rounded hover:bg-[#3b82f6]/10 transition">
                  Compute route
                </button>
              </div>
              {computedRoute && (
                <div className={`text-[10px] p-2 rounded border ${computedRoute.path.length === 0 ? "border-[#ef4444]/20 text-[#ef4444] bg-[#ef4444]/5" : "border-[#22c55e]/20 text-[#22c55e] bg-[#22c55e]/5"}`}>
                  {computedRoute.path.length === 0
                    ? "✗ No route available — path blocked by incident."
                    : `✓ ${computedRoute.path.join(" → ")} ${computedRoute.types.includes("cold") ? "(uses cold standby)" : "(active stitches)"}`
                  }
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Verification */}
          <div className="bg-[#0e1218] border border-[#2a2622] rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] text-[#c4a350] uppercase tracking-widest">Verification Results</div>
              <button onClick={runVerification}
                className="text-[9px] border border-[#c4a350]/30 text-[#c4a350] px-2 py-0.5 rounded hover:bg-[#c4a350]/10 transition">
                Retest
              </button>
            </div>
            {verifyResults.length === 0 ? (
              <p className="text-[10px] text-[#3a3632] italic">Run verification to see results.</p>
            ) : (
              <div className="space-y-1.5">
                {verifyResults.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px]">
                    <span className={r.pass ? "text-[#22c55e]" : "text-[#ef4444]"}>{r.pass ? "✓" : "✗"}</span>
                    <span className={r.pass ? "text-[#8a8578]" : "text-[#ef4444]/70"}>{r.name}</span>
                  </div>
                ))}
                <div className="pt-1 border-t border-[#2a2622] text-[10px] font-bold text-[#c4a350]">
                  {verifyResults.filter(r => r.pass).length}/{verifyResults.length} passed
                </div>
              </div>
            )}
          </div>

          {/* Spine Ledger */}
          <div className="bg-[#0e1218] border border-[#2a2622] rounded-lg p-4 space-y-3">
            <div className="text-[10px] text-[#c4a350] uppercase tracking-widest">Spine Ledger</div>
            <p className="text-[9px] text-[#3a3632] leading-relaxed">Unsafe state does not commit. Only verified checkpoints appear here.</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {[...ledgerLog].reverse().map((entry, i) => (
                <div key={i} className="flex items-start gap-2 text-[10px]">
                  <span className="text-[#c4a350] font-bold shrink-0">v{entry.v}</span>
                  <span className="text-[#6b6558] leading-tight">{entry.msg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Operations Log */}
          <div className="bg-[#0e1218] border border-[#2a2622] rounded-lg p-4 space-y-3">
            <div className="text-[10px] text-[#c4a350] uppercase tracking-widest">Operations Log</div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {opsLog.map((e, i) => (
                <div key={i} className="flex items-start gap-2 text-[10px]">
                  <span className="text-[#3a3632] font-mono shrink-0">{e.t}</span>
                  <span className={`leading-tight ${
                    e.msg.includes("Hacker") || e.msg.includes("suicide") || e.msg.includes("bricked") ? "text-[#ef4444]" :
                    e.msg.includes("rollback") || e.msg.includes("restored") || e.msg.includes("heal") ? "text-[#22c55e]" :
                    e.msg.includes("Fault") || e.msg.includes("incident") ? "text-[#f59e0b]" :
                    "text-[#5a5550]"
                  }`}>{e.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Builder Export */}
        <div className="bg-[#0e1218] border border-[#2a2622] rounded-lg p-4 space-y-3">
          <div className="text-[10px] text-[#c4a350] uppercase tracking-widest">Builder Export</div>
          <p className="text-[10px] text-[#4a4642]">
            Paste this into Base44, Famous AI, Lovable, or another app builder to recreate the system as a fuller product.
          </p>
          <div className="flex items-start gap-3">
            <textarea readOnly value={BUILDER_PROMPT} rows={5}
              className="flex-1 bg-[#060810] border border-[#2a2622] text-[#5a5550] text-[10px] font-mono p-3 rounded resize-none focus:outline-none leading-relaxed"
            />
            <button onClick={() => { navigator.clipboard.writeText(BUILDER_PROMPT); addLog("Builder prompt copied to clipboard."); }}
              className="px-3 py-2 border border-[#c4a350]/40 text-[#c4a350] text-xs rounded hover:bg-[#c4a350]/10 transition whitespace-nowrap">
              Copy prompt
            </button>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#c4a350]/10 bg-[#0c0f14] mt-8">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between text-[9px] text-[#3a3632] flex-wrap gap-2">
          <span>SB-688 Command Console — JGA Black + Gold Edition</span>
          <span>StitchBrick / J.G.A. © {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}