import React from "react";
import { Shield, Zap, FileCheck, Globe, Clock, Lock, CheckCircle2, ArrowRight } from "lucide-react";

const capabilities = [
  { icon: Zap, title: "Detects Trouble Fast", desc: "Continuous health monitoring identifies degradation and failure before they cascade." },
  { icon: ArrowRight, title: "Keeps Operations Moving", desc: "Automatic rerouting through alternate approved paths maintains mission continuity." },
  { icon: FileCheck, title: "Restores from Trust", desc: "Smart Recovery restores systems from verified trusted checkpoints — not guesswork." },
  { icon: Shield, title: "Proves Recovery", desc: "Every recovery is verifiable. Run the proof suite to demonstrate compliance and integrity." },
  { icon: Globe, title: "Adapts by Industry", desc: "Language, components, and business outcomes transform to match your sector." },
];

const valuePoints = [
  { icon: Clock, title: "Reduce Downtime", desc: "Cut unplanned outages by restoring from trusted checkpoints in seconds, not hours." },
  { icon: Lock, title: "Contain Risk", desc: "Isolate compromised components immediately. Stop cascading failures before they spread." },
  { icon: CheckCircle2, title: "Prove Recovery", desc: "Verifiable proof suite demonstrates recovery integrity to auditors and regulators." },
  { icon: Globe, title: "Adapt to Sector Needs", desc: "Industry-specific language and workflows make SB688 native to your operating environment." },
];

export default function OverviewTab() {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-2xl font-bold text-foreground">Universal Resilience Platform</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          SB688 is a mission-grade resilience system that detects trouble fast, keeps operations moving,
          restores from trust, and proves recovery — across any industry. Built for organizations where
          failure has real consequences.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Core Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
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

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Buyer Value</h3>
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
    </div>
  );
}