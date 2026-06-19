import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus, CheckCircle2, AlertTriangle, RotateCcw, ShieldCheck, Clock, ChevronDown, ChevronUp } from "lucide-react";

const GOLD = "#C9A84C";

const ACTION_TYPES = [
  { value: "manual_intervention", label: "Manual Intervention", color: "#f59e0b", icon: AlertTriangle },
  { value: "recovery_action",     label: "Recovery Action",     color: "#ef4444", icon: RotateCcw },
  { value: "verification",        label: "Verification",        color: "#60a5fa", icon: ShieldCheck },
  { value: "approval",            label: "Approval",            color: "#4ade80", icon: CheckCircle2 },
];

const VERIFICATION_STATUSES = [
  { value: "pending",   label: "Pending",   color: "#f59e0b" },
  { value: "verified",  label: "Verified",  color: "#4ade80" },
  { value: "failed",    label: "Failed",    color: "#ef4444" },
  { value: "certified", label: "Certified", color: GOLD },
];

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    timeZone: "America/Chicago",
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
    hour12: true,
  }) + " CT";
}

const INIT_LOGS = [
  { id: 1, ts: Date.now() - 1000 * 60 * 12, action: "verification",        note: "System spine hash verification completed", verificationStatus: "certified" },
  { id: 2, ts: Date.now() - 1000 * 60 * 35, action: "manual_intervention", note: "Manual override: client deposit marked non-refundable after 24-hr window", verificationStatus: "verified" },
  { id: 3, ts: Date.now() - 1000 * 60 * 72, action: "recovery_action",     note: "Phoenix rollback triggered — ledger mismatch detected and repaired", verificationStatus: "verified" },
];

export default function InterventionLog() {
  const [logs, setLogs] = useState(INIT_LOGS);
  const [expanded, setExpanded] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ action: "manual_intervention", note: "", verificationStatus: "pending" });

  const addLog = () => {
    if (!form.note.trim()) return;
    setLogs(prev => [{ id: Date.now(), ts: Date.now(), ...form }, ...prev]);
    setForm({ action: "manual_intervention", note: "", verificationStatus: "pending" });
    setAdding(false);
  };

  const updateStatus = (id, verificationStatus) => {
    setLogs(prev => prev.map(l => l.id === id ? { ...l, verificationStatus } : l));
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden" style={{ background: "hsl(220,18%,7%)" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 cursor-pointer select-none"
        style={{ borderBottom: expanded ? `1px solid hsl(var(--border))` : "none", background: `${GOLD}08` }}
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4" style={{ color: GOLD }} />
          <span className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Intervention &amp; Recovery Log</span>
          <Badge className="text-[8px] border font-bold ml-1" style={{ background: `${GOLD}15`, color: GOLD, borderColor: `${GOLD}40` }}>
            {logs.length} records
          </Badge>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </div>

      {expanded && (
        <div className="p-4 space-y-3">
          {/* Add Entry Button */}
          {!adding ? (
            <Button
              size="sm"
              onClick={() => setAdding(true)}
              className="text-[10px] h-7 px-3 gap-1 border"
              style={{ background: `${GOLD}12`, color: GOLD, borderColor: `${GOLD}30` }}
            >
              <Plus className="w-3 h-3" /> Log Intervention / Action
            </Button>
          ) : (
            <div className="rounded-xl border border-border p-4 space-y-3" style={{ background: "rgba(0,0,0,0.3)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>New Log Entry</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-muted-foreground">Action Type</label>
                  <select
                    value={form.action}
                    onChange={e => setForm(f => ({ ...f, action: e.target.value }))}
                    className="w-full text-xs rounded-lg px-3 py-2 border border-border bg-input text-foreground"
                  >
                    {ACTION_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-muted-foreground">Verification Status</label>
                  <select
                    value={form.verificationStatus}
                    onChange={e => setForm(f => ({ ...f, verificationStatus: e.target.value }))}
                    className="w-full text-xs rounded-lg px-3 py-2 border border-border bg-input text-foreground"
                  >
                    {VERIFICATION_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-muted-foreground">Description</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Describe the intervention or recovery action..."
                  className="w-full text-xs rounded-lg px-3 py-2 border border-border bg-input text-foreground placeholder:text-muted-foreground"
                  onKeyDown={e => e.key === "Enter" && addLog()}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={addLog} className="text-[10px] h-7 px-4 font-bold" style={{ background: `linear-gradient(135deg,${GOLD},#8a6018)`, color: "#0a0c10" }}>
                  Record Entry
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="text-[10px] h-7 px-3 text-muted-foreground">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Log Entries */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {logs.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-6">No interventions recorded yet.</p>
            )}
            {logs.map(log => {
              const actionMeta = ACTION_TYPES.find(a => a.value === log.action) || ACTION_TYPES[0];
              const statusMeta = VERIFICATION_STATUSES.find(s => s.value === log.verificationStatus) || VERIFICATION_STATUSES[0];
              const ActionIcon = actionMeta.icon;
              return (
                <div key={log.id} className="flex items-start gap-3 rounded-xl border p-3 transition-all hover:border-border"
                  style={{ background: "rgba(0,0,0,0.25)", borderColor: `${actionMeta.color}18` }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${actionMeta.color}12`, border: `1px solid ${actionMeta.color}25` }}>
                    <ActionIcon className="w-3.5 h-3.5" style={{ color: actionMeta.color }} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center flex-wrap gap-1.5">
                      <Badge className="text-[8px] border font-bold px-1.5 py-0"
                        style={{ background: `${actionMeta.color}12`, color: actionMeta.color, borderColor: `${actionMeta.color}30` }}>
                        {actionMeta.label}
                      </Badge>
                      <select
                        value={log.verificationStatus}
                        onChange={e => updateStatus(log.id, e.target.value)}
                        onClick={e => e.stopPropagation()}
                        className="text-[8px] rounded px-1.5 py-0.5 border font-bold cursor-pointer"
                        style={{ background: `${statusMeta.color}12`, color: statusMeta.color, borderColor: `${statusMeta.color}30` }}
                      >
                        {VERIFICATION_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    <p className="text-[10px] text-foreground leading-relaxed">{log.note}</p>
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTime(log.ts)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}