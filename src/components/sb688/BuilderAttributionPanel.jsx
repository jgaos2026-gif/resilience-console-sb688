import React from "react";
import { User, Shield, Layers, Zap, Brain, AlertTriangle, Award, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CrownIcon, LionIcon } from "@/components/sb688/WarriorCrest";

export default function BuilderAttributionPanel() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Builder Attribution / Origin
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">Architecture, platform direction, and design authorship.</p>
      </div>

      {/* Primary Attribution */}
      <div className="bg-card border border-primary/20 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex flex-col items-center gap-0 flex-shrink-0">
            <CrownIcon size={32} color="#C9A84C" />
            <LionIcon size={38} color="#C9A84C" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-cinzel" style={{ color: "#C9A84C" }}>John Arenz — JGA</h3>
            <p className="text-xs text-muted-foreground">Resilience Architecture · Platform Direction · System Design</p>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              <Badge className="text-[9px] bg-primary/10 text-primary border border-primary/30">Architecture</Badge>
              <Badge className="text-[9px] bg-primary/10 text-primary border border-primary/30">Platform Direction</Badge>
              <Badge className="text-[9px] bg-secondary text-muted-foreground border border-border">Independent Builder</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <p className="text-sm text-foreground/85 leading-relaxed">
              John Arenz designed the SB688 resilience architecture as an independent builder. The platform direction — including the Brick Stitch geometry, the Sovereign Guardian model, the quarantine-and-rebuild containment pattern, and the ghost-node sensor concept — originates from J.G.A.
            </p>
            <p className="text-sm text-foreground/75 leading-relaxed">
              Every design decision prioritizes clarity, provability, and honest engineering. If it works, it must be demonstrable. If it fails, it must be containable. If it recovers, it must be verifiable.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Architectural Contributions</div>
            {[
              "Brick Stitch System — 1/2 Offset Spine+Ribs Geometry",
              "Sovereign AI Guardian — HMAC-based cognitive integrity",
              "SB688 Resilience Engine — trusted checkpoint recovery",
              "Ghost Node / Ghost Brick — defensive sensor concept",
              "Quarantine Brick — disposable containment pattern",
              "National Resilience Council platform direction",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                <span className="text-foreground/75">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Architecture Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: Layers, color: "text-primary", bg: "bg-primary/10 border-primary/20",
            title: "Brick Stitch Architecture",
            ref: "BSS-2026-ARCH-01 · JGA",
            desc: "Patented 1/2 Offset Spine+Ribs Geometry. Inherent structural integrity over reactive redundancy. Withstands 38% node loss vs 7% for columnar stacks. 150% overhead vs 300% triple mirroring.",
          },
          {
            icon: Shield, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20",
            title: "Sovereign AI Guardian",
            ref: "HMAC-SHA3-256 · Merkle Stitch",
            desc: "Cryptographic cognitive immune system. Detects prompt injection, orchestration drift, and adversarial attacks using golden directive signatures and a Merkle neural integrity tree.",
          },
          {
            icon: Zap, color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20",
            title: "SB688 Resilience Engine",
            ref: "Universal · 8 Industry Sectors",
            desc: "Trusted checkpoint recovery, approved route computation, ghost-node telemetry, quarantine-and-rebuild containment, and verifiable proof suite. Industry-adaptive. All logic runs locally.",
          },
        ].map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={i} className={`rounded-xl p-4 border ${p.bg} space-y-2`}>
              <Icon className={`w-5 h-5 ${p.color}`} />
              <h4 className="text-sm font-bold text-foreground">{p.title}</h4>
              <div className="text-[9px] text-muted-foreground/60 font-mono">{p.ref}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          );
        })}
      </div>

      {/* AI Assist disclosure */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">AI-Assisted Engineering — Design Multiplier</h3>
            <p className="text-[11px] text-muted-foreground">Execution accelerator, not decision-maker</p>
          </div>
        </div>
        <p className="text-sm text-foreground/75 leading-relaxed">
          This console was built with AI-assisted engineering as a force multiplier. AI accelerated execution — it did not make architecture or design decisions. The resilience architecture, security posture model, ghost-node concept, quarantine pattern, and industry adaptations reflect human judgment by John Arenz (JGA). Builder attribution is clearly separate from system proof claims.
        </p>
      </div>

      {/* Mission statement */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-2">
        <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">Mission Statement</h3>
        <p className="text-sm text-foreground/80 leading-relaxed italic">
          "Build systems where elegance serves consequence. Where the interface tells the truth. Where recovery is not a hope — it is a mechanism. Where proof is not a promise — it is a test you can run. And where when something goes wrong, the system can contain it, recover from it, and prove it recovered."
        </p>
        <p className="text-[10px] text-muted-foreground/60">— John Arenz, J.G.A.</p>
      </div>

      {/* Honest disclosure */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-amber-400">Honest Scope</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          This platform does not claim to be unhackable or perfectly secure. It demonstrates defensive containment, tamper rejection, trusted restore, and recoverability — with verifiable, labeled evidence for every claim. It is a fully operational standalone demo console running in your browser. Not a certified production system. An honest, working demonstration of the SB688 resilience architecture and the National Resilience Council platform direction.
        </p>
      </div>
    </div>
  );
}