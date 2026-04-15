import React from "react";
import { Shield, Zap, FileCheck, Globe, Clock, Lock, CheckCircle2, ArrowRight, Eye, XOctagon, Database, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import WarriorCrest, { CrownIcon, LionIcon } from "@/components/sb688/WarriorCrest";

const capabilities = [
  { icon: Zap, title: "Detects & Contains Fast", desc: "Continuous health monitoring identifies degradation before it cascades. Suspicious activity is surfaced by ghost-node sensors at mesh boundaries." },
  { icon: ArrowRight, title: "Keeps Operations Moving", desc: "Automatic rerouting through alternate approved paths maintains mission continuity when primary paths degrade or are blocked." },
  { icon: XOctagon, title: "Quarantine & Rebuild", desc: "Compromised modules are detached, isolated into a disposable sandbox, terminated, and rebuilt from a trusted checkpoint — not repaired in place." },
  { icon: FileCheck, title: "Restores from Trust", desc: "Smart Recovery restores from cryptographically signed, approved checkpoints. Unauthorized state never re-enters the trusted chain." },
  { icon: Shield, title: "Proves Recovery", desc: "Every recovery claim is labeled VERIFIED IN DEMO, MODELED HERE, or NOT CLAIMED YET — visible, honest, testable proof." },
  { icon: Globe, title: "Adapts by Industry", desc: "Language, components, and business outcomes transform across 8 sectors — healthcare, finance, aerospace, government, and more." },
];

const securityControls = [
  { label: "Signed Checkpoints", status: "verified" },
  { label: "Append-Only Ledger", status: "verified" },
  { label: "Tamper Rejection", status: "verified" },
  { label: "Ghost-Node Telemetry", status: "modeled" },
  { label: "Quarantine Before Restore", status: "modeled" },
  { label: "Dependency Revalidation", status: "verified" },
  { label: "Least-Privilege Boundaries", status: "modeled" },
  { label: "Audit Trail", status: "verified" },
];

const STATUS_STYLE = {
  verified: "bg-teal-500/10 text-teal-400 border-teal-500/30",
  modeled:  "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

const valuePoints = [
  { icon: Clock, title: "Reduce Downtime", desc: "Restore from trusted checkpoints in seconds. Contain cascading failures before they reach end users." },
  { icon: Lock, title: "Demonstrate Containment", desc: "Isolates suspicious runtime into disposable quarantine. Rejects unauthorized state transitions. Does not claim perfect security — demonstrates recoverability." },
  { icon: CheckCircle2, title: "Verifiable Proof", desc: "Every major claim is labeled by evidence status. VERIFIED IN DEMO means working logic is shown — not marketing copy." },
  { icon: Globe, title: "Adapt to Sector", desc: "Industry-specific language and workflows make SB688 native to your operating environment across 8 sectors." },
];

export default function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        {/* Warrior crest */}
        <div className="flex flex-col items-center gap-2">
          <CrownIcon size={48} color="#C9A84C" />
          <LionIcon size={56} color="#C9A84C" />
        </div>
        {/* Gold divider */}
        <div className="warrior-divider mx-auto w-48" />
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Badge className="text-[10px] bg-primary/10 text-primary border border-primary/30 font-cinzel tracking-wider">National Resilience Council</Badge>
          <Badge className="text-[10px] bg-secondary text-muted-foreground border border-border">SB688 · JGA Architecture</Badge>
        </div>
        <h2 className="text-2xl font-bold font-cinzel" style={{ color: "#C9A84C", textShadow: "0 0 30px rgba(201,168,76,0.25)" }}>Universal Resilience Platform</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          SB688 is a next-generation cross-sector resilience platform. It detects compromise fast, keeps operations moving, isolates suspicious runtimes into disposable containment, restores from trusted checkpoints, and proves recovery — across any industry.
          It does not claim perfect security. It demonstrates containment and recoverability.
        </p>
      </div>

      {/* Core Capabilities */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Core Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-2">
                <Icon className="w-5 h-5 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">{cap.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{cap.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Controls Strip */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
            <Shield className="w-4 h-4" /> Visible Security Controls
          </h3>
          <div className="flex gap-2">
            <Badge className="text-[9px] bg-teal-500/10 text-teal-400 border border-teal-500/30">VERIFIED IN DEMO</Badge>
            <Badge className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/30">MODELED HERE</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {securityControls.map((ctrl, i) => (
            <Badge key={i} className={`text-[10px] border ${STATUS_STYLE[ctrl.status]}`}>{ctrl.label}</Badge>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
          This platform demonstrates defensive containment, not perfect security. See the Security Posture tab for full control details and evidence labeling.
        </p>
      </div>

      {/* Buyer Value */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Platform Value</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {valuePoints.map((vp, i) => {
            const Icon = vp.icon;
            return (
              <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">{vp.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{vp.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attribution strip */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="text-xs font-bold text-primary">SB688 Architecture by John Arenz — J.G.A.</span>
          <p className="text-[11px] text-muted-foreground mt-0.5">Brick Stitch Geometry · Sovereign Guardian · Ghost Node Concept · Quarantine Pattern · National Resilience Council Direction</p>
        </div>
        <Badge className="text-[10px] bg-secondary text-muted-foreground border border-border">Attribution Tab for full details</Badge>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-amber-400">Scope:</strong> This is a fully operational standalone demo console demonstrating the SB688 resilience architecture. It is not a certified production system, a compliance-certified backend, or a replacement for proper infrastructure engineering. All logic runs locally in your browser. It does not claim to prevent all compromise — it demonstrates that systems can contain, recover, and prove recovery around compromise.
        </p>
      </div>
    </div>
  );
}