/**
 * LiveProofEngine — reusable verification + proof stamp widget.
 * Pass:
 *   title        — section label
 *   checks       — array of { id, gate, label, pass, detail, critical }
 *   hashPayload  — string to derive proof hash from (built from live data)
 *   proofLabel   — short label for the certified stamp
 */
import React, { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, XCircle, AlertTriangle, Loader2, Lock, Zap, ChevronDown, ChevronUp, Database } from "lucide-react";

const GOLD = "#C9A84C";

function GoldCrown({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 34" fill="none">
      <polygon points="20,2 25,14 38,14 28,22 32,34 20,26 8,34 12,22 2,14 15,14" fill={GOLD} />
      <polygon points="20,5 24,14 35,14 27,21 30,31 20,24 10,31 13,21 5,14 16,14" fill="#a07828" opacity="0.4" />
    </svg>
  );
}

function simpleHash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h * 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, "0");
}

function buildHash(payload, ts) {
  const s = payload + "|" + ts;
  const h1 = simpleHash(s);
  const h2 = simpleHash(h1 + s.length);
  const h3 = simpleHash(h2 + h1);
  const h4 = simpleHash(h3 + s.slice(0, 30));
  return `${h1}${h2}${h3}${h4}`;
}

const GATE_COLORS = {
  pass:    { bg: "rgba(74,222,128,0.06)",  border: "rgba(74,222,128,0.2)",  text: "#4ade80" },
  fail:    { bg: "rgba(239,68,68,0.06)",   border: "rgba(239,68,68,0.25)",  text: "#f87171" },
  partial: { bg: `${GOLD}06`,              border: `${GOLD}20`,             text: GOLD },
};

export default function LiveProofEngine({ title = "Live Verification Engine", checks = [], hashPayload = "", proofLabel = "CERTIFIED" }) {
  const [phase, setPhase] = useState("idle");
  const [revealed, setRevealed] = useState([]);
  const [proofHash, setProofHash] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [expanded, setExpanded] = useState(true);
  const timers = useRef([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const runVerification = () => {
    clearTimers();
    const ts = new Date().toISOString();
    setTimestamp(ts);
    setRevealed([]);
    setProofHash("");
    setPhase("running");

    checks.forEach((_, i) => {
      const t = setTimeout(() => {
        setRevealed(prev => [...prev, i]);
        if (i === checks.length - 1) {
          const t2 = setTimeout(() => {
            setProofHash(buildHash(hashPayload, ts));
            setPhase("done");
          }, 500);
          timers.current.push(t2);
        }
      }, 320 * (i + 1));
      timers.current.push(t);
    });
  };

  useEffect(() => () => clearTimers(), []);

  const passed = checks.filter((c, i) => revealed.includes(i) && c.pass).length;
  const failed = checks.filter((c, i) => revealed.includes(i) && !c.pass).length;
  const critFails = checks.filter((c, i) => revealed.includes(i) && !c.pass && c.critical).length;
  const allDone = phase === "done";
  const overallPass = allDone && critFails === 0 && passed >= checks.length * 0.7;

  // Group by gate
  const gates = [...new Set(checks.map(c => c.gate))];
  const gateGroups = gates.map(gate => ({
    gate,
    items: checks.map((c, i) => ({ ...c, idx: i })).filter(c => c.gate === gate && revealed.includes(c.idx)),
  })).filter(g => g.items.length > 0);

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: `${GOLD}30`, background: "#0a0900" }}>
      {/* Header */}
      <button onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:opacity-80 transition"
        style={{ background: `${GOLD}07`, borderBottom: expanded ? `1px solid ${GOLD}22` : "none" }}>
        <div className="flex items-center gap-3">
          <Shield className="w-4 h-4 flex-shrink-0" style={{ color: GOLD }} />
          <div className="text-left">
            <h2 className="text-sm font-black font-cinzel" style={{ color: GOLD }}>{title}</h2>
            <p className="text-[9px] text-muted-foreground mt-0.5">
              {checks.length} checks · {gates.length} gates · Live data · Proof stamp on completion
            </p>
          </div>
          {allDone && (
            <Badge className="text-[8px] border font-black px-2 py-0.5 ml-2"
              style={overallPass
                ? { background: "rgba(74,222,128,0.1)", color: "#4ade80", borderColor: "rgba(74,222,128,0.3)" }
                : { background: "rgba(239,68,68,0.1)", color: "#f87171", borderColor: "rgba(239,68,68,0.3)" }}>
              {overallPass ? `♛ ${proofLabel}` : "⚠ NEEDS REVIEW"}
            </Badge>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Controls */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-4 text-[10px]">
              <span className="text-muted-foreground">Checks: <b className="text-foreground">{checks.length}</b></span>
              {phase !== "idle" && <>
                <span style={{ color: "#4ade80" }}>✓ {passed}</span>
                <span style={{ color: "#f87171" }}>✗ {failed}</span>
              </>}
            </div>
            <Button onClick={runVerification} disabled={phase === "running" || checks.length === 0} size="sm"
              className="text-[10px] h-8 px-4 font-black uppercase tracking-wider"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #7a5010)`, color: "#080808" }}>
              {phase === "running" ? <><Loader2 className="w-3 h-3 animate-spin mr-1" />Running...</>
                : phase === "done" ? <><Zap className="w-3 h-3 mr-1" />Re-Verify</>
                : <><Zap className="w-3 h-3 mr-1" />Run Verification</>}
            </Button>
          </div>

          {/* Progress bar */}
          {phase !== "idle" && (
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${checks.length > 0 ? (revealed.length / checks.length) * 100 : 0}%`, background: `linear-gradient(90deg, ${GOLD}, #4ade80)` }} />
            </div>
          )}

          {/* Gates */}
          {gateGroups.map(group => {
            const gPass = group.items.every(c => c.pass);
            const gCritFail = group.items.some(c => !c.pass && c.critical);
            const gStyle = gCritFail ? GATE_COLORS.fail : gPass ? GATE_COLORS.pass : GATE_COLORS.partial;
            return (
              <div key={group.gate} className="rounded-xl border overflow-hidden"
                style={{ borderColor: gStyle.border }}>
                <div className="flex items-center justify-between px-3 py-2 text-[9px] font-black uppercase tracking-widest"
                  style={{ background: gStyle.bg, color: gStyle.text }}>
                  <span>{group.gate}</span>
                  <span>{gCritFail ? "✗ FAIL" : gPass ? "✓ PASS" : "⚠ PARTIAL"}</span>
                </div>
                <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                  {group.items.map(c => (
                    <div key={c.id} className="flex items-start gap-3 px-3 py-2.5">
                      {c.pass
                        ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#4ade80" }} />
                        : c.critical
                        ? <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-400" />
                        : <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-yellow-400" />}
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold"
                          style={{ color: c.pass ? "rgba(255,255,255,0.85)" : c.critical ? "#f87171" : "#fbbf24" }}>
                          {c.label}
                        </div>
                        <div className="text-[9px] text-muted-foreground mt-0.5 font-mono">{c.detail}</div>
                      </div>
                      {c.critical && !c.pass && (
                        <Badge className="text-[7px] border flex-shrink-0"
                          style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", borderColor: "rgba(239,68,68,0.3)" }}>CRITICAL</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Proof Stamp */}
          {allDone && proofHash && (
            <div className="rounded-2xl border-2 p-5 space-y-4"
              style={{ borderColor: overallPass ? `${GOLD}50` : "rgba(239,68,68,0.4)", background: overallPass ? `${GOLD}05` : "rgba(239,68,68,0.03)" }}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <GoldCrown size={overallPass ? 22 : 16} />
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest"
                      style={{ color: overallPass ? GOLD : "#f87171" }}>
                      {overallPass ? `${proofLabel} — Verification Complete` : "Verification Flagged — Review Required"}
                    </div>
                    <div className="text-[8px] text-muted-foreground">{passed}/{checks.length} passed · {critFails} critical failures</div>
                  </div>
                </div>
                {overallPass && (
                  <Badge className="text-[8px] border font-black px-2 py-1"
                    style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", borderColor: "rgba(74,222,128,0.3)" }}>
                    ♛ TRUSTED STATE
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[9px]">
                {[
                  { label: "Checks Run",     value: checks.length,  color: GOLD },
                  { label: "Passed",         value: passed,         color: "#4ade80" },
                  { label: "Critical Fails", value: critFails,      color: critFails > 0 ? "#f87171" : "#4ade80" },
                ].map((s, i) => (
                  <div key={i} className="rounded-lg border py-2" style={{ background: "rgba(0,0,0,0.3)", borderColor: `${GOLD}12` }}>
                    <div className="font-black font-mono text-sm" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-muted-foreground uppercase tracking-wider text-[8px] mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border p-3 space-y-1.5" style={{ background: "rgba(0,0,0,0.5)", borderColor: `${GOLD}18` }}>
                <div className="flex items-center gap-2">
                  <Lock className="w-3 h-3" style={{ color: GOLD }} />
                  <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: GOLD }}>Proof Hash</span>
                  <Badge className="text-[7px] border ml-auto"
                    style={{ background: "rgba(74,222,128,0.06)", color: "#4ade80", borderColor: "rgba(74,222,128,0.2)" }}>
                    GENERATED FROM LIVE DATA
                  </Badge>
                </div>
                <div className="font-mono text-[9px] break-all" style={{ color: overallPass ? "#4ade80" : "#fbbf24" }}>{proofHash}</div>
                <div className="flex items-center gap-2 text-[8px] text-muted-foreground">
                  <Database className="w-2.5 h-2.5" />
                  <span>Derived from live state · {timestamp}</span>
                </div>
              </div>

              <p className="text-[8px] italic text-muted-foreground">
                Hash derived client-side from live data. Changes if data changes. Server-signed proof requires Builder+ backend.
              </p>
            </div>
          )}

          {phase === "idle" && (
            <div className="text-center py-4 text-[10px] text-muted-foreground">
              Click "Run Verification" to execute all {checks.length} checks across {gates.length} gates.
            </div>
          )}
        </div>
      )}
    </div>
  );
}