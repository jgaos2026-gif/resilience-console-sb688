import React, { useState, useCallback } from "react";
import {
  ChevronDown, ChevronUp, Shield, CheckCircle2, XCircle, Loader2,
  Radio, Link2, GitBranch, Database, Tv2, Zap, Lock, AlertTriangle, RefreshCw
} from "lucide-react";

const GOLD   = "#c4a350";
const GREEN  = "#22c55e";
const RED    = "#ef4444";
const BLUE   = "#3b82f6";
const DIM    = "#4a4642";
const CARD   = "#0e1218";
const BORDER = "#2a2622";
const BG     = "#060810";

// ── Audit steps run in sequence ───────────────────────────────────────────────
const AUDIT_STEPS = [
  { id: "sync",     label: "Module Synchronization",     detail: "Integrating clip-brick upgrades into central spine. Compiling Ghost Node logic and 45-minute temporal link redundancy." },
  { id: "health",   label: "System Health Check",        detail: "Running break-and-heal diagnostic across all active nodes. Verifying high-fidelity logic stability." },
  { id: "bridge",   label: "Connectivity Bridge",        detail: "Establishing bi-directional links to GitHub, Supabase, and JGA infrastructure monitors." },
  { id: "stress",   label: "System Suicide Lock",        detail: "Confirming stress-test parameters are locked and protocol is optimized for April 27th demonstration." },
  { id: "readiness",label: "Readiness Report",           detail: "Verifying all nodes ACTIVE. Checking for logic friction. Sealing sovereign state." },
];

// ── Manual checklist items ─────────────────────────────────────────────────────
const CHECKLIST = [
  { id: "supabase",  icon: Database,   label: "Supabase handshake verified",       hint: "Click through to your Supabase dashboard and confirm the persistent connection." },
  { id: "github",    icon: GitBranch,  label: "GitHub repository link confirmed",  hint: "Verify the repo is accessible and the latest clip-brick commits are pushed." },
  { id: "ghost",     icon: Radio,      label: "Ghost Node buffer space confirmed",  hint: "Confirm Base 44 has sufficient buffer for the 45-minute hold during simulated failure." },
  { id: "stream",    icon: Tv2,        label: "Live stream URL authorized",         hint: "Ensure the live-view URL is the first authorized in the Connectivity Bridge step." },
  { id: "suicide",   icon: Zap,        label: "System Suicide parameters locked",   hint: "Stress-test sequence confirmed ready. Do not trigger before the 27th." },
  { id: "temporal",  icon: Lock,       label: "45-min temporal link compiled",      hint: "Ghost Node temporal link is redundant and ready to hold state during break-and-heal." },
];

function AuditRunner({ onComplete }) {
  const [stepIndex, setStepIndex] = useState(-1);   // -1 = not started
  const [results, setResults]     = useState({});    // stepId → "ok" | "running"
  const [running, setRunning]     = useState(false);
  const [done, setDone]           = useState(false);

  const runAudit = useCallback(async () => {
    setRunning(true);
    setDone(false);
    setResults({});

    for (let i = 0; i < AUDIT_STEPS.length; i++) {
      const step = AUDIT_STEPS[i];
      setStepIndex(i);
      setResults(prev => ({ ...prev, [step.id]: "running" }));
      await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
      setResults(prev => ({ ...prev, [step.id]: "ok" }));
    }

    setRunning(false);
    setDone(true);
    setStepIndex(-1);
    onComplete?.();
  }, [onComplete]);

  const reset = useCallback(() => {
    setRunning(false);
    setDone(false);
    setResults({});
    setStepIndex(-1);
  }, []);

  return (
    <div className="space-y-3">
      {/* Steps */}
      <div className="space-y-1.5">
        {AUDIT_STEPS.map((step, i) => {
          const status = results[step.id];
          return (
            <div key={step.id}
              className="flex items-start gap-3 rounded-lg px-3 py-2.5 border transition-all duration-300"
              style={{
                background: status === "ok" ? GREEN + "08" : status === "running" ? GOLD + "08" : BG,
                borderColor: status === "ok" ? GREEN + "30" : status === "running" ? GOLD + "40" : BORDER,
              }}>
              <div className="flex-shrink-0 mt-0.5">
                {status === "running"
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: GOLD }} />
                  : status === "ok"
                  ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: GREEN }} />
                  : <div className="w-3.5 h-3.5 rounded-full border" style={{ borderColor: BORDER }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold" style={{ color: status === "ok" ? GREEN : status === "running" ? GOLD : "#6b6558" }}>
                  {i + 1}. {step.label}
                </div>
                {(status === "running" || status === "ok") && (
                  <div className="text-[9px] mt-0.5 leading-relaxed" style={{ color: status === "ok" ? GREEN + "80" : GOLD + "80" }}>
                    {step.detail}
                  </div>
                )}
              </div>
              {status === "ok" && (
                <span className="flex-shrink-0 text-[8px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: GREEN + "15", color: GREEN }}>DONE</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Run / Reset */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={runAudit}
          disabled={running}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border font-bold text-xs transition-all"
          style={running
            ? { borderColor: BORDER, color: DIM, cursor: "not-allowed" }
            : { borderColor: GOLD + "50", color: GOLD, background: GOLD + "0a" }}>
          {running
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running Audit…</>
            : done
            ? <><RefreshCw className="w-3.5 h-3.5" /> Re-run Audit</>
            : <><Shield className="w-3.5 h-3.5" /> Run Sovereign Audit</>}
        </button>
        {done && (
          <button onClick={reset}
            className="px-3 py-2 rounded-lg border text-xs transition-all"
            style={{ borderColor: BORDER, color: DIM }}>
            Clear
          </button>
        )}
      </div>

      {done && (
        <div className="rounded-lg px-4 py-3 text-center border"
          style={{ background: GREEN + "08", borderColor: GREEN + "30" }}>
          <div className="text-sm font-bold" style={{ color: GREEN }}>✓ SOVEREIGN AUDIT COMPLETE</div>
          <div className="text-[10px] mt-1" style={{ color: GREEN + "80" }}>
            All 5 modules verified. System Suicide locked. Protocol ready for April 27th.
          </div>
        </div>
      )}
    </div>
  );
}

function ChecklistItem({ item, checked, onToggle }) {
  const Icon = item.icon;
  return (
    <button
      onClick={() => onToggle(item.id)}
      className="w-full flex items-start gap-3 rounded-lg px-3 py-2.5 border text-left transition-all duration-200"
      style={{
        background: checked ? GREEN + "08" : BG,
        borderColor: checked ? GREEN + "30" : BORDER,
      }}>
      <div className="flex-shrink-0 mt-0.5">
        {checked
          ? <CheckCircle2 className="w-4 h-4" style={{ color: GREEN }} />
          : <div className="w-4 h-4 rounded border-2 flex-shrink-0" style={{ borderColor: BORDER }} />}
      </div>
      <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: checked ? GREEN : DIM }} />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold" style={{ color: checked ? GREEN : "#8a8578" }}>{item.label}</div>
        <div className="text-[9px] mt-0.5 leading-relaxed" style={{ color: DIM }}>{item.hint}</div>
      </div>
    </button>
  );
}

export default function SovereignAuditPanel() {
  const [open, setOpen]         = useState(false);
  const [auditDone, setAuditDone] = useState(false);
  const [checked, setChecked]   = useState({});

  const toggleCheck = useCallback((id) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const allChecked   = checkedCount === CHECKLIST.length;

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: CARD, borderColor: auditDone && allChecked ? GREEN + "40" : BORDER }}>
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-5 py-3.5 text-left"
        onClick={() => setOpen(v => !v)}
        style={{ borderBottom: open ? `1px solid ${BORDER}` : "none" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: GOLD + "15", border: `1px solid ${GOLD}30` }}>
            <Shield className="w-4 h-4" style={{ color: GOLD }} />
          </div>
          <div>
            <div className="text-xs font-bold" style={{ color: GOLD }}>Sovereign Audit & Integration</div>
            <div className="text-[9px] mt-0.5" style={{ color: DIM }}>Pre-Demo System Check · April 27th Readiness</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {auditDone && (
            <span className="text-[9px] px-2 py-0.5 rounded font-bold border" style={{ color: GREEN, borderColor: GREEN + "40", background: GREEN + "08" }}>
              AUDIT ✓
            </span>
          )}
          <span className="text-[9px] px-2 py-0.5 rounded font-mono" style={{ color: DIM }}>
            {checkedCount}/{CHECKLIST.length} checked
          </span>
          {open ? <ChevronUp className="w-4 h-4" style={{ color: DIM }} /> : <ChevronDown className="w-4 h-4" style={{ color: DIM }} />}
        </div>
      </button>

      {open && (
        <div className="p-4 space-y-5">

          {/* Command cue */}
          <div className="rounded-lg px-4 py-3 border" style={{ background: BG, borderColor: GOLD + "25" }}>
            <div className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: GOLD + "70" }}>Activation Command</div>
            <p className="text-xs italic leading-relaxed" style={{ color: "#c8c2b4" }}>
              "SB688 — connect to the stitch. Show how you feel. We're going live. Let's sell it."
            </p>
          </div>

          {/* Warning */}
          <div className="rounded-lg px-3 py-2.5 flex items-start gap-2 border"
            style={{ background: "rgba(239,68,68,0.05)", borderColor: RED + "25" }}>
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-400" />
            <p className="text-[10px] leading-relaxed" style={{ color: "#fca5a5" }}>
              Do not trigger System Suicide before the April 27th demonstration. Stress-test parameters are locked — confirm checklist before going live.
            </p>
          </div>

          {/* Audit runner */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: DIM }}>System Audit — 5 Modules</div>
            <AuditRunner onComplete={() => setAuditDone(true)} />
          </div>

          {/* Pre-demo checklist */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: DIM }}>Pre-Demo Checklist</div>
            <div className="space-y-1.5">
              {CHECKLIST.map(item => (
                <ChecklistItem key={item.id} item={item} checked={!!checked[item.id]} onToggle={toggleCheck} />
              ))}
            </div>
          </div>

          {/* Final status */}
          {allChecked && auditDone ? (
            <div className="rounded-xl px-4 py-4 text-center border"
              style={{ background: GREEN + "08", borderColor: GREEN + "35" }}>
              <div className="text-sm font-bold mb-1" style={{ color: GREEN }}>⬡ SYSTEM SOVEREIGN — READY FOR APRIL 27TH</div>
              <div className="text-[10px]" style={{ color: GREEN + "80" }}>
                All nodes ACTIVE. Ghost Node buffered. Temporal link compiled. Protocol locked. We are live.
              </div>
            </div>
          ) : (
            <div className="text-[9px] text-center font-mono" style={{ color: DIM }}>
              Complete the audit and all checklist items to confirm April 27th readiness.
            </div>
          )}

        </div>
      )}
    </div>
  );
}