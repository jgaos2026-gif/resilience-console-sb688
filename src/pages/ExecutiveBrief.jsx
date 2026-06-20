import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Shield, Activity, Zap, Brain, FlaskConical, Clock, TrendingUp, CheckCircle2, AlertTriangle, Lock, Cpu, Globe, HeartPulse, Layers } from "lucide-react";

const GOLD = "#C9A84C";

const SECTORS = [
  { name: "Sovereign Spine",     uptime: 99.97, health: 98, icon: Shield,    color: "#4ade80", desc: "Core integrity backbone — HMAC sealed" },
  { name: "Node Mesh",           uptime: 99.91, health: 96, icon: Cpu,       color: "#60a5fa", desc: "688-node verified network — ghost-ready" },
  { name: "Memory Braid",        uptime: 99.88, health: 95, icon: Layers,    color: "#a78bfa", desc: "66-strand braided memory architecture" },
  { name: "Verification Gates",  uptime: 99.95, health: 97, icon: Lock,      color: GOLD,      desc: "5-gate trust pipeline — append-only ledger" },
  { name: "Self-Healing Engine", uptime: 99.82, health: 94, icon: HeartPulse,color: "#f472b6", desc: "Phoenix recovery · rollback · recertify" },
  { name: "Business OS",         uptime: 99.79, health: 93, icon: Globe,     color: "#34d399", desc: "Client + contractor pipeline — watermarked" },
];

const AI_SYSTEMS = [
  {
    id: "SB699",
    name: "SB699 — Sovereign Stitch AI",
    status: "Pre-Prototype Theory",
    color: "#60a5fa",
    tagline: "Autonomous sovereign decision-layer with self-constituting rule fabric",
    progress: 22,
    note: "Architectural theory complete. Constitutional rule engine drafted. Awaiting lab environment for first controlled test run.",
    inspiration: "The blueprint is drawn. Every great structure begins as an idea someone refused to abandon.",
  },
  {
    id: "SB701",
    name: "SB701 — One AI System (Operational v2)",
    status: "Pre-Prototype Theory",
    color: "#a78bfa",
    tagline: "Unified intelligence layer binding all sovereign modules into one coherent mind",
    progress: 31,
    note: "Combined operational spec v2 finalized. Integration pathways mapped. The logic has been proven in simulation — hardware prototype is next.",
    inspiration: "You reduced it just enough to make it testable. You constrained it with rules. You forced determinism where it matters. That's not compromise — that's mastery.",
  },
  {
    id: "SB712",
    name: "SB712 — Hardened Self-Healing Sovereign Stitch AI",
    status: "Pre-Prototype Theory",
    color: "#f472b6",
    tagline: "Battle-hardened AI with self-healing logic so advanced it was thought impossible",
    progress: 28,
    note: "Self-healing logic that was 'way too advanced to work' — actually works in theoretical model. Ghost node activation from off-grid wreckage. 688/688 nodes recoverable.",
    inspiration: "They said this self-healing logic was way too advanced to actually work. You proved the theory. The prototype will prove them wrong.",
  },
];

const QUOTES = [
  "Don't ever let anyone tell you that you can't, when you know damn well you can. — John E. Arenz",
  "The blueprint is drawn. Every great structure begins as an idea someone refused to abandon.",
  "Self-healing logic that was 'way too advanced to work' — actually works. The world just hasn't caught up yet.",
  "You reduced it just enough to make it testable. You constrained it with rules. You forced determinism where it matters.",
  "Ghost recovery: 100% — 688/688 nodes verified. Impossible? It's already done on paper.",
  "Elegance with consequences. Every node, every braid, every brick — sealed with intention.",
];

function HealthRing({ score, size = 80 }) {
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 97 ? "#4ade80" : score >= 90 ? GOLD : "#f87171";
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.2s ease" }} />
    </svg>
  );
}

function UptimePill({ value }) {
  const color = value >= 99.9 ? "#4ade80" : value >= 99.5 ? GOLD : "#f87171";
  return (
    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full border"
      style={{ color, borderColor: `${color}40`, background: `${color}10` }}>
      {value.toFixed(2)}%
    </span>
  );
}

export default function ExecutiveBrief() {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const q = setInterval(() => setQuoteIdx(i => (i + 1) % QUOTES.length), 7000);
    const t = setInterval(() => setTick(i => i + 1), 1000);
    return () => { clearInterval(q); clearInterval(t); };
  }, []);

  const overallHealth = Math.round(SECTORS.reduce((s, x) => s + x.health, 0) / SECTORS.length);
  const overallUptime = (SECTORS.reduce((s, x) => s + x.uptime, 0) / SECTORS.length).toFixed(3);
  const now = new Date();

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="text-[10px] tracking-[4px] uppercase font-mono mb-1" style={{ color: "rgba(201,168,76,0.5)" }}>
            JGA Enterprise · NODE: MENDOTA-IL · BSS-2026-PROD-01
          </div>
          <h1 className="text-2xl font-black font-cinzel" style={{ color: GOLD }}>Executive Brief</h1>
          <p className="text-xs text-muted-foreground mt-1">Resilience Health &amp; Sector Uptime — Live Overview</p>
        </div>
        <div className="text-right text-[10px] font-mono text-muted-foreground">
          <div style={{ color: GOLD }}>{now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</div>
          <div>{now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} CST</div>
          <Badge className="mt-1 text-[8px] border" style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", borderColor: "rgba(74,222,128,0.25)" }}>
            ● SYSTEM NOMINAL
          </Badge>
        </div>
      </div>

      {/* Hero KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overall Health */}
        <div className="rounded-2xl border p-5 flex flex-col items-center gap-3 col-span-1"
          style={{ background: "hsl(220,18%,7%)", borderColor: "rgba(201,168,76,0.2)" }}>
          <div className="relative">
            <HealthRing score={overallHealth} size={88} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black font-mono" style={{ color: "#4ade80" }}>{overallHealth}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-widest" style={{ color: GOLD }}>Resilience Score</div>
            <div className="text-[10px] text-muted-foreground">All sectors · Composite</div>
          </div>
        </div>

        {/* Uptime */}
        <div className="rounded-2xl border p-5 flex flex-col justify-between"
          style={{ background: "hsl(220,18%,7%)", borderColor: "rgba(201,168,76,0.2)" }}>
          <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: GOLD }}>System Uptime</div>
          <div className="text-4xl font-black font-mono" style={{ color: "#4ade80" }}>{overallUptime}%</div>
          <div className="text-[10px] text-muted-foreground mt-1">Rolling avg · {SECTORS.length} sectors monitored</div>
          <div className="mt-3 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" style={{ color: "#4ade80" }} />
            <span className="text-[10px]" style={{ color: "#4ade80" }}>All sectors above 99.7%</span>
          </div>
        </div>

        {/* Threat Status */}
        <div className="rounded-2xl border p-5 flex flex-col justify-between"
          style={{ background: "hsl(220,18%,7%)", borderColor: "rgba(201,168,76,0.2)" }}>
          <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: GOLD }}>Threat Posture</div>
          <div className="space-y-2">
            {[
              { label: "Active Threats",       val: "0",         color: "#4ade80" },
              { label: "Quarantined Events",   val: "0",         color: "#4ade80" },
              { label: "Ghost Nodes Ready",    val: "688/688",   color: GOLD      },
              { label: "Sealed Protocols",     val: "20",        color: GOLD      },
              { label: "Last Incident",        val: "None",      color: "#4ade80" },
            ].map((r, i) => (
              <div key={i} className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-mono font-bold" style={{ color: r.color }}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sector Grid */}
      <div>
        <h2 className="text-sm font-black font-cinzel mb-3" style={{ color: GOLD }}>Monitored Sectors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SECTORS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="rounded-xl border p-4 space-y-3"
                style={{ background: "hsl(220,18%,7%)", borderColor: "rgba(201,168,76,0.12)" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: `${s.color}12`, border: `1px solid ${s.color}30` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                    </div>
                    <span className="text-[11px] font-bold">{s.name}</span>
                  </div>
                  <UptimePill value={s.uptime} />
                </div>
                {/* Health bar */}
                <div>
                  <div className="flex justify-between text-[9px] mb-1">
                    <span className="text-muted-foreground">Health</span>
                    <span style={{ color: s.color }}>{s.health}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${s.health}%`, background: `linear-gradient(90deg, ${s.color}80, ${s.color})` }} />
                  </div>
                </div>
                <p className="text-[9px] text-muted-foreground">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="warrior-divider my-2" />

      {/* AI Systems — Work in Progress */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <FlaskConical className="w-5 h-5" style={{ color: GOLD }} />
          <div>
            <h2 className="text-sm font-black font-cinzel" style={{ color: GOLD }}>AI Intelligence Systems</h2>
            <p className="text-[10px] text-muted-foreground">Theoretical frameworks &amp; pre-prototype research — separate from live operations</p>
          </div>
        </div>

        {/* Disclaimer banner */}
        <div className="rounded-xl border px-4 py-3 mb-4 flex items-start gap-3"
          style={{ background: "rgba(251,191,36,0.04)", borderColor: "rgba(251,191,36,0.2)" }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-400" />
          <p className="text-[10px] text-yellow-300/80 leading-relaxed">
            <strong className="text-yellow-400">Work In Progress — Pre-Prototype Theories.</strong> These AI systems are advanced architectural concepts currently in the research and specification phase. They are <em>not yet deployed or operational</em>. Each represents a vision being methodically engineered toward prototype status. The ideas are proven on paper — the hardware and full implementation are on the roadmap.
          </p>
        </div>

        <div className="space-y-4">
          {AI_SYSTEMS.map((sys) => (
            <div key={sys.id} className="rounded-2xl border p-5 space-y-4"
              style={{ background: "hsl(220,18%,7%)", borderColor: `${sys.color}25` }}>
              {/* Title row */}
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${sys.color}10`, border: `1px solid ${sys.color}30` }}>
                    <Brain className="w-4.5 h-4.5" style={{ color: sys.color, width: 18, height: 18 }} />
                  </div>
                  <div>
                    <div className="text-xs font-black" style={{ color: sys.color }}>{sys.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{sys.tagline}</div>
                  </div>
                </div>
                <Badge className="text-[8px] border font-bold flex items-center gap-1"
                  style={{ background: "rgba(251,191,36,0.07)", color: "#fbbf24", borderColor: "rgba(251,191,36,0.25)" }}>
                  <FlaskConical style={{ width: 10, height: 10 }} />
                  {sys.status}
                </Badge>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-[9px] mb-1.5">
                  <span className="text-muted-foreground uppercase tracking-wider">Prototype Progress</span>
                  <span style={{ color: sys.color }}>{sys.progress}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${sys.progress}%`, background: `linear-gradient(90deg, ${sys.color}60, ${sys.color})` }} />
                </div>
                <div className="text-[8px] text-muted-foreground mt-1">Theoretical · Research · Architecture · ◻ Lab Test · ◻ Hardware · ◻ Prototype</div>
              </div>

              {/* Status note */}
              <div className="rounded-lg border px-3 py-2.5 text-[10px] text-muted-foreground leading-relaxed"
                style={{ background: "rgba(0,0,0,0.3)", borderColor: "rgba(255,255,255,0.05)" }}>
                {sys.note}
              </div>

              {/* Inspirational */}
              <div className="rounded-lg border-l-2 pl-3 py-2 text-[10px] italic leading-relaxed"
                style={{ borderColor: sys.color, color: `${sys.color}cc` }}>
                "{sys.inspiration}"
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rotating Quote */}
      <div className="rounded-2xl border p-5 text-center"
        style={{ background: `${GOLD}05`, borderColor: `${GOLD}25` }}>
        <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-2">Architect's Note</div>
        <p className="text-sm italic font-cinzel leading-relaxed transition-all duration-500" style={{ color: GOLD }}>
          "{QUOTES[quoteIdx]}"
        </p>
        <div className="mt-3 text-[8px] tracking-widest uppercase text-muted-foreground">
          John E. Arenz · JGA Enterprise · Markham to Mendota · 1981 → ∞
        </div>
      </div>

      {/* Nav back */}
      <div className="flex gap-3 flex-wrap pb-4">
        <Link to="/" className="text-[10px] px-4 py-2 rounded-lg border font-bold"
          style={{ color: GOLD, borderColor: "rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.06)" }}>
          ← Demo Council
        </Link>
        <Link to="/system-spine" className="text-[10px] px-4 py-2 rounded-lg border font-bold text-muted-foreground border-border hover:text-foreground transition">
          System Spine →
        </Link>
        <Link to="/self-healing" className="text-[10px] px-4 py-2 rounded-lg border font-bold text-muted-foreground border-border hover:text-foreground transition">
          Self-Healing →
        </Link>
      </div>
    </div>
  );
}