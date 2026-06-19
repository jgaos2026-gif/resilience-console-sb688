import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Activity, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import NodeVerificationEngine from "@/components/jga/NodeVerificationEngine";

const GOLD = "#C9A84C";
const STATUS_COLORS = {
  active: { bg: "rgba(34,197,94,0.1)", color: "#4ade80", border: "rgba(34,197,94,0.3)" },
  warning: { bg: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "rgba(251,191,36,0.3)" },
  quarantined: { bg: "rgba(239,68,68,0.1)", color: "#f87171", border: "rgba(239,68,68,0.3)" },
  sleeping: { bg: "rgba(148,163,184,0.1)", color: "#94a3b8", border: "rgba(148,163,184,0.3)" },
  repairing: { bg: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "rgba(167,139,250,0.3)" },
};
const CATEGORIES = ["all", "security", "business", "memory", "recovery", "compliance", "demo"];

export default function NodeMesh() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [pulse, setPulse] = useState(true);

  const { data: nodes = [] } = useQuery({
    queryKey: ["nodes"],
    queryFn: () => base44.entities.Node.list(),
  });

  // Heartbeat animation
  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 1500);
    return () => clearInterval(t);
  }, []);

  const filtered = nodes.filter(n => {
    if (filter !== "all" && n.category !== filter) return false;
    if (search && !n.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold font-cinzel" style={{ color: GOLD }}>Node Mesh</h1>
          <p className="text-xs text-muted-foreground">{nodes.length} nodes · System heartbeat {pulse ? "●" : "○"}</p>
        </div>
        <Badge className="text-[10px] border font-bold flex items-center gap-1.5"
          style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80", borderColor: "rgba(34,197,94,0.3)" }}>
          <span className={`w-2 h-2 rounded-full bg-green-400 ${pulse ? "animate-pulse" : ""}`} />
          MESH ACTIVE
        </Badge>
      </div>

      {/* Verification Engine */}
      <NodeVerificationEngine nodes={nodes} />

      {/* Heartbeat Rhythm */}
      <div className="rounded-xl border border-border p-4 flex items-center gap-3 overflow-hidden" style={{ background: "hsl(220,18%,7%)" }}>
        <Activity className="w-5 h-5 flex-shrink-0" style={{ color: GOLD }} />
        <div className="flex gap-1 flex-1 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-1.5 rounded-full transition-all duration-700"
              style={{
                height: `${Math.sin((i + (pulse ? 5 : 0)) * 0.5) * 12 + 16}px`,
                background: i % 5 === 0 ? GOLD : "rgba(201,168,76,0.3)",
                opacity: pulse ? 1 : 0.5
              }} />
          ))}
        </div>
        <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0">Heartbeat Rhythm</span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search nodes..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-secondary border-border" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className="px-3 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all"
              style={filter === c ? { background: "rgba(201,168,76,0.15)", color: GOLD } : { color: "rgba(255,255,255,0.35)" }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Node Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(node => {
          const sc = STATUS_COLORS[node.status] || STATUS_COLORS.active;
          return (
            <div key={node.id} className="rounded-xl border p-4 space-y-2.5 hover:border-primary/30 transition-all"
              style={{ background: "hsl(220,18%,7%)", borderColor: "rgba(201,168,76,0.1)" }}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">{node.name}</h3>
                <Badge className="text-[8px] border font-bold uppercase" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>
                  {node.status}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">{node.purpose}</p>
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-muted-foreground">Trust: <span className="font-bold" style={{ color: node.trust_level >= 80 ? "#4ade80" : "#fbbf24" }}>{node.trust_level}%</span></span>
                <span className="text-muted-foreground">{node.connected_module}</span>
              </div>
              {node.recent_log && (
                <div className="text-[9px] font-mono px-2 py-1 rounded" style={{ background: "rgba(0,0,0,0.3)", color: "rgba(201,168,76,0.5)" }}>
                  {node.recent_log}
                </div>
              )}
              <div className="flex items-center justify-between">
                <Badge className="text-[8px] border" style={{ background: "rgba(201,168,76,0.06)", color: "rgba(201,168,76,0.5)", borderColor: "rgba(201,168,76,0.15)" }}>
                  {node.node_type?.replace(/_/g, " ")}
                </Badge>
                <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <span className={`w-1.5 h-1.5 rounded-full ${node.status === "active" ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`} />
                  {node.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No nodes found. {nodes.length === 0 ? "Seed data to populate the mesh." : "Try adjusting filters."}
        </div>
      )}

      {/* Industry Applications */}
      <div className="space-y-4 pt-4 border-t" style={{ borderColor: `${GOLD}20` }}>
        <div className="text-center space-y-1">
          <p className="text-[9px] tracking-[0.4em] uppercase text-muted-foreground">Real-World Impact</p>
          <h2 className="text-sm font-black font-cinzel" style={{ color: GOLD }}>What This Node Mesh Architecture Can Do Across Industries</h2>
          <p className="text-[10px] text-muted-foreground max-w-2xl mx-auto">
            The same verification-first, self-healing node mesh running here can be deployed inside any organization that cannot afford silent failures.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              industry: "Tesla / EV Manufacturing",
              icon: "⚡",
              color: "#e11d48",
              use: "Real-time node mesh across vehicle assembly lines. Every sensor, robot arm, and quality check becomes a verified node. Drift in torque specs, weld integrity, or battery cell data triggers instant quarantine before a defective unit reaches the road.",
              proof: "Zero-defect gates on production floor. Append-only ledger for NHTSA recall defense.",
            },
            {
              industry: "SpaceX / Aerospace",
              icon: "🚀",
              color: "#7c3aed",
              use: "Mission-critical node validation for rocket telemetry, fuel systems, and avionics. Each flight computer node is triple-verified before state changes. A failing node triggers Phoenix recovery — clean checkpoint restoration mid-mission without human intervention.",
              proof: "Sovereign runtime on Falcon 9 health nodes. Verified checkpoint before every stage separation.",
            },
            {
              industry: "Deep Space Travel / NASA",
              icon: "🌌",
              color: "#0ea5e9",
              use: "Communication lag of 20+ minutes means no human can intervene in real time. This mesh runs autonomous verification and self-healing across life support, navigation, and power nodes. If a node drifts, it quarantines itself, rolls back to last certified state, and recertifies — all without ground control.",
              proof: "Fully autonomous sovereign system. Zero reliance on Earth uplink for recovery.",
            },
            {
              industry: "Law Enforcement / Justice",
              icon: "⚖️",
              color: "#d97706",
              use: "Body cam footage, evidence chain-of-custody, and case file nodes are hash-verified on intake. Any modification to evidence triggers a tamper alert. Every access event is append-only logged. Proof records are court-admissible by design — no silent edits, ever.",
              proof: "Chain-of-custody nodes. SHA-256 hash on every evidence record. Tamper-evident audit trail.",
            },
            {
              industry: "National Security / DoD",
              icon: "🛡️",
              color: "#dc2626",
              use: "Classified network nodes operate in verified mesh topology. Insider threats and lateral movement are detected when any node deviates from certified behavior. RAM Guard prevents memory injection. Triple verification before any command node transitions to 'trusted' state.",
              proof: "Zero-trust node architecture. Every command chain requires tri-mark certification before execution.",
            },
            {
              industry: "FinTech / Banking",
              icon: "🏦",
              color: "#16a34a",
              use: "Every transaction, ledger update, and account state change passes through the verification pipeline. No payment reaches 'trusted' without three independent gates. Fraud attempts are quarantined in real time. Dispute resolution is backed by immutable proof records — no 'he said / she said'.",
              proof: "Triple-verified payment nodes. Rollback-capable ledger. Regulatory audit trail on demand.",
            },
            {
              industry: "ComEd / Utility Grids",
              icon: "🔋",
              color: "#ca8a04",
              use: "Grid substations and smart meter nodes are monitored for drift. A node reporting anomalous load data is quarantined before it cascades into outages. Phoenix recovery restores last known good grid state within seconds. Proof vault logs every grid event for FERC compliance.",
              proof: "Self-healing grid node mesh. Real-time substation quarantine. FERC-ready audit trail.",
            },
            {
              industry: "Healthcare / Hospital Systems",
              icon: "🏥",
              color: "#0891b2",
              use: "Patient record nodes, dosing systems, and diagnostic machine outputs enter quarantine on intake. Any data point flagged as anomalous cannot affect treatment decisions until triple-verified. Medication dispensing nodes are certified before activation. HIPAA audit trail baked in.",
              proof: "Triple-verified patient data nodes. No dosing change without certification. HIPAA-ready proof log.",
            },
            {
              industry: "AI / LLM Infrastructure",
              icon: "🧠",
              color: "#8b5cf6",
              use: "Every AI model response, training data batch, and memory pocket is a node in this mesh. Hallucinated or poisoned outputs are quarantined before reaching users. Model weight updates require three-gate certification. Memory braid ensures only verified knowledge is loaded into active context.",
              proof: "Sovereign AI runtime. Quarantined LLM outputs. Verified memory pockets before load.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-xl border p-4 space-y-3 hover:scale-[1.01] transition-all"
              style={{ background: "hsl(220,18%,7%)", borderColor: `${item.color}20` }}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{item.icon}</span>
                <h3 className="text-[11px] font-black uppercase tracking-wide" style={{ color: item.color }}>{item.industry}</h3>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{item.use}</p>
              <div className="rounded-lg p-2 text-[9px] font-mono leading-relaxed"
                style={{ background: `${item.color}08`, color: `${item.color}90`, border: `1px solid ${item.color}15` }}>
                ♛ {item.proof}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border p-4 text-center space-y-1.5" style={{ background: "#0e0c00", borderColor: `${GOLD}25` }}>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: GOLD }}>The Core Principle Is The Same Everywhere</p>
          <p className="text-[10px] text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Any system where a silent failure, an undetected change, or an unverified state can cause harm — financial loss, injury, national security risk, or legal liability — is a candidate for the JGA Node Mesh architecture.
            <span className="font-bold" style={{ color: GOLD }}> No state becomes trusted without earning it.</span>
          </p>
        </div>
      </div>
    </div>
  );
}