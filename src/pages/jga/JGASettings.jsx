import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Settings, Users } from "lucide-react";

const GOLD = "#C9A84C";

const DEFAULTS = {
  demoMode: true,
  councilLevel: "simple",
  heartbeat: true,
  proofGeneration: true,
  tripleVerification: true,
  memoryPocketSim: true,
  businessWarnings: true,
};

const ROLES = [
  { name: "Owner", desc: "Full system access, Gold Room, all controls", color: GOLD },
  { name: "Council Viewer", desc: "View council briefings and system status", color: "#60a5fa" },
  { name: "Investor Viewer", desc: "View investor-level summaries and proof vault", color: "#a78bfa" },
  { name: "Client", desc: "Client portal access — submit requests, view proofs", color: "#4ade80" },
  { name: "Contractor", desc: "Contractor portal — view jobs, upload work", color: "#f59e0b" },
  { name: "Admin", desc: "Administrative access — manage users and settings", color: "#ec4899" },
  { name: "Compliance Reviewer", desc: "Risk/compliance dashboard and audit trails", color: "#ef4444" },
];

export default function JGASettings() {
  const [settings, setSettings] = useState(DEFAULTS);

  const toggle = (key) => setSettings(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold font-cinzel" style={{ color: GOLD }}>Settings</h1>
        <p className="text-xs text-muted-foreground">Demo configuration and role management</p>
      </div>

      {/* Demo Settings */}
      <div className="rounded-xl border border-border p-6 space-y-4" style={{ background: "hsl(220,18%,7%)" }}>
        <h2 className="text-sm font-bold font-cinzel flex items-center gap-2" style={{ color: GOLD }}>
          <Settings className="w-4 h-4" /> Demo Configuration
        </h2>
        <div className="space-y-4">
          {[
            { key: "demoMode", label: "Demo Mode", desc: "Run in demonstration mode (no real data affected)" },
            { key: "heartbeat", label: "Simulated Heartbeat", desc: "Show pulsing heartbeat animation across the system" },
            { key: "proofGeneration", label: "Proof Generation Demo", desc: "Enable mock proof packet generation" },
            { key: "tripleVerification", label: "Strict Triple Verification", desc: "Require all three marks before trust" },
            { key: "memoryPocketSim", label: "Memory Pocket Simulation", desc: "Enable memory braid and pocket loading demos" },
            { key: "businessWarnings", label: "Business Policy Warnings", desc: "Show deposit, refund, and watermark policy notices" },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
              <div>
                <div className="text-xs font-semibold text-foreground">{item.label}</div>
                <div className="text-[10px] text-muted-foreground">{item.desc}</div>
              </div>
              <Switch checked={settings[item.key]} onCheckedChange={() => toggle(item.key)} />
            </div>
          ))}
        </div>
      </div>

      {/* Council Explanation Level */}
      <div className="rounded-xl border border-border p-6 space-y-3" style={{ background: "hsl(220,18%,7%)" }}>
        <h2 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Council Explanation Level</h2>
        <div className="flex gap-2">
          {["simple", "technical", "investor"].map(level => (
            <button key={level} onClick={() => setSettings(p => ({ ...p, councilLevel: level }))}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
              style={settings.councilLevel === level ? { background: "rgba(201,168,76,0.15)", color: GOLD, border: "1px solid rgba(201,168,76,0.4)" } : { border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Roles */}
      <div className="rounded-xl border border-border p-6 space-y-4" style={{ background: "hsl(220,18%,7%)" }}>
        <h2 className="text-sm font-bold font-cinzel flex items-center gap-2" style={{ color: GOLD }}>
          <Users className="w-4 h-4" /> System Roles
        </h2>
        <div className="space-y-2">
          {ROLES.map((role, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: role.color }} />
              <div className="flex-1">
                <div className="text-xs font-semibold" style={{ color: role.color }}>{role.name}</div>
                <div className="text-[10px] text-muted-foreground">{role.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mode indicator */}
      <div className="rounded-xl border p-4 text-center" style={{ background: settings.demoMode ? "rgba(34,197,94,0.04)" : "rgba(239,68,68,0.04)", borderColor: settings.demoMode ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)" }}>
        <Badge className="text-[10px] border font-bold" style={settings.demoMode ? { background: "rgba(34,197,94,0.1)", color: "#4ade80", borderColor: "rgba(34,197,94,0.3)" } : { background: "rgba(239,68,68,0.1)", color: "#f87171", borderColor: "rgba(239,68,68,0.3)" }}>
          {settings.demoMode ? "DEMO MODE ACTIVE" : "PRODUCTION PLANNING MODE"}
        </Badge>
      </div>
    </div>
  );
}