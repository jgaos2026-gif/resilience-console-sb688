import React from "react";
import { Cpu, Database, HardDrive, CheckCircle2, RotateCcw, Box, Monitor, Wrench } from "lucide-react";

const GOLD = "#C9A84C";

const CARDS = [
  { icon: Cpu,         label: "8GB RAM Thinking",      desc: "Design for the machine you have, not the one you wish for. Lean logic runs everywhere.", color: GOLD },
  { icon: Box,         label: "Modular Loading",        desc: "Only load what you need. Each brick loads itself — no bloat, no guessing.", color: "#60a5fa" },
  { icon: HardDrive,   label: "Cold Storage",           desc: "Verified pockets can sleep in cold storage and wake only when called — no idle waste.", color: "#a78bfa" },
  { icon: CheckCircle2,label: "Verified Pockets",       desc: "Even small memory pockets earn trust through verification before they are used.", color: "#4ade80" },
  { icon: Database,    label: "Reduced Bloat",          desc: "Every piece that gets added must earn its place. No unnecessary weight.", color: "#fb923c" },
  { icon: RotateCcw,   label: "Checkpoint Recovery",    desc: "When something breaks, the system rolls back to its last verified clean checkpoint.", color: "#f472b6" },
  { icon: Monitor,     label: "Local-First Tools",      desc: "Not every action needs the cloud. Local execution builds independence and speed.", color: "#34d399" },
  { icon: Wrench,      label: "Practical Business Use", desc: "Tools built for real work, real businesses, and real people with real budgets.", color: "#fbbf24" },
];

export default function OldEquipmentSection() {
  return (
    <section className="py-16 px-4" style={{ background: "hsl(220,20%,5%)" }}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <div className="text-[9px] tracking-[4px] uppercase font-mono mb-2" style={{ color: "rgba(201,168,76,0.4)" }}>Design Philosophy</div>
          <h2 className="text-xl font-black font-cinzel" style={{ color: GOLD }}>Why We Build For Real Machines</h2>
        </div>

        <div className="rounded-2xl border p-6"
          style={{ background: "hsl(220,18%,7%)", borderColor: "rgba(201,168,76,0.15)" }}>
          <p className="text-sm text-muted-foreground leading-relaxed text-center max-w-2xl mx-auto">
            Not every business starts with expensive equipment. JGA builds with real-world limits in mind.{" "}
            <strong className="text-foreground">Old hardware teaches discipline.</strong>{" "}
            If a system can run lean, verify itself, and avoid waste on limited equipment, it becomes stronger when scaled up.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CARDS.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="rounded-xl border p-4 space-y-2 hover:scale-105 transition-transform"
                style={{ background: "hsl(220,18%,7%)", borderColor: `${c.color}18` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${c.color}10`, border: `1px solid ${c.color}25` }}>
                  <Icon style={{ color: c.color, width: 16, height: 16 }} />
                </div>
                <div className="text-[11px] font-bold" style={{ color: c.color }}>{c.label}</div>
                <div className="text-[9px] text-muted-foreground leading-relaxed">{c.desc}</div>
              </div>
            );
          })}
        </div>

        {/* Quote */}
        <div className="text-center">
          <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${GOLD}30,transparent)`, marginBottom: 20 }} />
          <p className="text-xs italic" style={{ color: "rgba(201,168,76,0.6)" }}>
            "A system that can survive on old hardware will thrive on new hardware. Build lean. Verify everything. Grow with purpose."
          </p>
        </div>
      </div>
    </section>
  );
}