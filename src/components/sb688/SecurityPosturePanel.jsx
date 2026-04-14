import React from "react";
import { Shield, Lock, CheckCircle2, AlertTriangle, Eye, Database, GitBranch, Users, XOctagon, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CONTROLS = [
  { icon: Lock, label: "Signed Checkpoints", desc: "Every state commit is cryptographically signed before entering the trusted chain.", status: "active" },
  { icon: Database, label: "Append-Only Trusted Ledger", desc: "Ledger entries are appended, never overwritten. Unauthorized rewrites are rejected.", status: "active" },
  { icon: Shield, label: "State Hash Verification", desc: "System state is hashed and compared against the baseline golden record on every recovery.", status: "active" },
  { icon: Lock, label: "Per-Module Permission Boundaries", desc: "Each module operates within a defined permission boundary. Cross-boundary access is blocked.", status: "active" },
  { icon: Users, label: "Least-Privilege Access", desc: "Components receive only the access needed for their defined role — nothing more.", status: "active" },
  { icon: CheckCircle2, label: "Trusted Route Approvals", desc: "Only pre-approved routes are used for live traffic. Unapproved path attempts are rejected.", status: "active" },
  { icon: XOctagon, label: "Quarantine Before Restore", desc: "Compromised modules are quarantined before any restore action begins. No unsafe state re-enters.", status: "active" },
  { icon: GitBranch, label: "Dependency Revalidation After Recovery", desc: "All downstream dependencies are revalidated after a module is restored from checkpoint.", status: "active" },
  { icon: Shield, label: "Tamper Rejection", desc: "Unauthorized state transitions are detected and rejected before they can commit to the trusted chain.", status: "active" },
  { icon: RotateCcw, label: "Restore from Last Approved Checkpoint", desc: "Recovery always begins from the last cryptographically verified, approved checkpoint.", status: "active" },
  { icon: Users, label: "Dual-Control for Sensitive Actions", desc: "High-consequence actions — such as ledger rollback and full recovery — require dual confirmation in production use.", status: "modeled" },
  { icon: Database, label: "Disposable Containers for High-Risk Workloads", desc: "Suspicious or compromised runtimes are moved into isolated disposable containers, not repaired in-place.", status: "active" },
  { icon: Eye, label: "Audit Trail for Operator Decisions", desc: "Every operator action is logged with a timestamp and committed to the append-only audit record.", status: "active" },
];

const STATUS_CONFIG = {
  active: { label: "VERIFIED IN DEMO", color: "bg-teal-500/10 text-teal-400 border-teal-500/30" },
  modeled: { label: "MODELED HERE", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  claimed: { label: "NOT CLAIMED YET", color: "bg-secondary text-muted-foreground border-border" },
};

export default function SecurityPosturePanel() {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Security Posture
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xl leading-relaxed">
            This platform does not claim to be unhackable or perfectly secure. It demonstrates defensive containment, 
            trusted restore, tamper rejection, and recoverability — with visible, verifiable controls.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/30">VERIFIED IN DEMO</Badge>
          <Badge className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30">MODELED HERE</Badge>
          <Badge className="text-[10px] bg-secondary text-muted-foreground border border-border">NOT CLAIMED YET</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CONTROLS.map((ctrl, i) => {
          const Icon = ctrl.icon;
          const cfg = STATUS_CONFIG[ctrl.status];
          return (
            <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-foreground">{ctrl.label}</span>
                  <Badge className={`text-[9px] border flex-shrink-0 ${cfg.color}`}>{cfg.label}</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{ctrl.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-1.5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-400">Honest Scope</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Controls marked <span className="text-teal-400 font-semibold">VERIFIED IN DEMO</span> are demonstrated in this simulation console with working logic.
          Controls marked <span className="text-blue-400 font-semibold">MODELED HERE</span> reflect real architectural patterns that would be enforced in a production deployment.
          No control is marked as guaranteed in adversarial conditions. This platform demonstrates containment and recoverability — not perfect security.
        </p>
      </div>
    </div>
  );
}