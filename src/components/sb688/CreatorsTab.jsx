import React from "react";
import { User, Brain, AlertTriangle, Layers, Lock, Zap } from "lucide-react";

export default function CreatorsTab() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-foreground">Creators</h2>
        <p className="text-sm text-muted-foreground">The people and principles behind the console.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">John Arenz (JGA)</h3>
            <p className="text-xs text-muted-foreground">Creator & Independent Builder</p>
          </div>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">
          John Arenz designed and built the SB688 resilience architecture as an independent builder. The philosophy
          is simple: systems that matter must be systems you can trust. Every design decision prioritizes clarity,
          provability, and honest engineering over marketing polish. If it works, it should be demonstrable.
          If it fails, it should be containable. If it recovers, it should be verifiable.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
            <Brain className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">AI-Assisted System Engineering</h3>
            <p className="text-xs text-muted-foreground">Design Multiplier</p>
          </div>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">
          This console was built with AI-assisted engineering as a force multiplier. AI did not make the design
          decisions — it accelerated execution. The architecture, terminology, industry adaptations, and simulation
          logic reflect human judgment about what matters in resilience engineering. AI made it possible to express
          that judgment in a single, cohesive, working system at this level of detail.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Mission Statement</h3>
        <p className="text-sm text-foreground/80 leading-relaxed italic">
          "Build systems where elegance serves consequence. Where the interface tells the truth. Where recovery
          is not a hope — it is a mechanism. Where proof is not a promise — it is a test you can run."
        </p>
      </div>

      {/* Three pillars of the architecture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Lock, color: "text-primary", bg: "bg-primary/10 border-primary/20", title: "Sovereign AI Guardian", desc: "HMAC-based cryptographic immune system for AI. Detects prompt injection, cognitive drift, and adversarial attacks using SHA3-256 golden directive signatures and a Merkle Stitch tree for granular neural integrity checks." },
          { icon: Layers, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", title: "Brick Stitch Architecture", desc: "Patented 1/2 Offset Spine+Ribs Geometry. Shifts infrastructure from reactive redundancy to inherent structural integrity. Withstands 38% node loss. 150% overhead vs 300% for triple mirroring." },
          { icon: Zap, color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20", title: "SB688 Resilience Engine", desc: "Universal resilience layer with trusted checkpoint recovery, approved route computation, isolation controls, and verifiable proof suite. Industry-adaptive across 8 sectors. All logic runs locally — no backend dependency." },
        ].map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={i} className={`rounded-xl p-4 border ${p.bg} space-y-2`}>
              <Icon className={`w-5 h-5 ${p.color}`} />
              <h4 className="text-sm font-bold text-foreground">{p.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-amber-400">Honest Disclosure</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          This is a fully operational standalone demo console. It demonstrates real simulation logic, genuine
          state management, and working verification — all running locally in your browser. It is not a certified
          production backend, a compliance-certified nuclear system, or a replacement for proper infrastructure
          engineering. It is an honest, working demonstration of the SB688 resilience architecture and its
          value proposition across industries.
        </p>
      </div>
    </div>
  );
}