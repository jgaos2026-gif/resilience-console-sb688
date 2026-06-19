import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Activity, Eye, CheckCircle2, Zap, Star, ArrowRight, Lock, Layers, Brain, Heart, Database, Radio, Award, ChevronDown, ChevronUp, Building2 } from "lucide-react";

const GOLD = "#C9A84C";
const MODULES = [
  { code: "SB688", name: "Sovereign Stitch Protocol", desc: { simple: "Protects your system by weaving data into a braided structure that can't be silently changed.", tech: "Append-only ledger with SHA-256 hash-chain verification, brick-stitch topology, and triple-mark certification gates.", investor: "Core IP — braided data integrity layer that eliminates single-point-of-failure risks and creates verifiable audit trails." }, icon: Shield, color: "#C9A84C" },
  { code: "SB689", name: "Guarded Runtime Body", desc: { simple: "Keeps the running system safe by watching for unexpected changes in real time.", tech: "Runtime integrity monitor with drift detection, memory guard rails, and automated quarantine triggers.", investor: "Continuous runtime protection — reduces breach dwell time and ensures operational continuity." }, icon: Lock, color: "#60a5fa" },
  { code: "SB712", name: "Sovereign Möbius Runtime", desc: { simple: "A self-checking loop that never stops verifying the system is healthy.", tech: "Infinite-loop verification architecture with Möbius-surface state continuity and checkpoint recovery.", investor: "Always-on verification engine — the system continuously proves its own integrity without manual intervention." }, icon: Radio, color: "#a78bfa" },
  { code: "OMEGA", name: "Omega / V3 Integration Layer", desc: { simple: "Connects all the pieces together into one unified system.", tech: "Orchestration layer binding SB688/689/712 with business logic, memory braid, and node mesh via verified API gates.", investor: "Integration backbone — turns individual modules into a unified, licensable platform." }, icon: Layers, color: "#f59e0b" },
  { code: "JGA-OS", name: "JGA Enterprise OS", desc: { simple: "The business command center for managing clients, orders, contractors, and payments.", tech: "Full business automation suite with deposit policies, watermark controls, contractor routing, and triple-verified payment workflows.", investor: "Revenue engine — handles the full client lifecycle from intake to final delivery with built-in compliance." }, icon: Activity, color: "#22c55e" },
  { code: "AVA", name: "AVA / VERA Assistant Layer", desc: { simple: "AI assistants that help run the business and answer questions safely.", tech: "LLM-powered assistants with verified memory pockets, quarantined responses, and audit-logged interactions.", investor: "AI integration layer — assistants that operate within the verification-first doctrine, not outside it." }, icon: Brain, color: "#ec4899" },
  { code: "PHOENIX", name: "Phoenix Recovery Protocol", desc: { simple: "When something goes wrong, the system finds a safe checkpoint and rebuilds from there.", tech: "Ghost checkpoint location, bad-state isolation, clean-state restoration, ledger update, and trusted-state recertification.", investor: "Self-healing capability — reduces downtime and recovery costs by automating rollback and restoration." }, icon: Heart, color: "#ef4444" },
  { code: "BRAID", name: "Braid Memory / Pocket Loading", desc: { simple: "Memory is organized into verified pockets that are only loaded when trusted.", tech: "66-strand braid architecture with comprehension weave, 22-strand speech branch, cold storage, and RAM guard integration.", investor: "Efficient, verifiable memory architecture — reduces RAM usage while maintaining full audit trail of what's loaded." }, icon: Database, color: "#06b6d4" },
  { code: "TVE", name: "Triple Verification Engine", desc: { simple: "Everything gets checked three times before it becomes trusted.", tech: "Sequential verification → validation → certification pipeline with independent reviewers and rollback on any failure.", investor: "Core differentiator — no state becomes trusted without three independent marks. Creates legally defensible audit trails." }, icon: CheckCircle2, color: "#84cc16" },
  { code: "RAM-G", name: "RAM Guard / Cold Storage Memory", desc: { simple: "Protects the computer's memory and stores unused data safely offline.", tech: "Active memory monitoring with cold-storage offload, pocket verification before load, and guard-rail enforcement.", investor: "Resource optimization layer — reduces operational costs while maintaining security through verified memory management." }, icon: Zap, color: "#f97316" },
];

const VIEW_MODES = ["simple", "tech", "investor"];
const VIEW_LABELS = { simple: "Simple", tech: "Technical", investor: "Investor" };

export default function DemoCouncil() {
  const [viewMode, setViewMode] = useState("simple");
  const [goldRoomOpen, setGoldRoomOpen] = useState(false);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8">
      {/* Hero */}
      <div className="rounded-2xl border border-border p-6 sm:p-10 text-center space-y-4" style={{ background: "linear-gradient(135deg, hsl(220,22%,5%) 0%, hsl(220,18%,8%) 50%, hsl(220,22%,5%) 100%)" }}>
        <div className="flex justify-center">
          <Badge className="text-[10px] px-3 py-1 font-bold border" style={{ background: "rgba(201,168,76,0.1)", color: GOLD, borderColor: "rgba(201,168,76,0.3)" }}>
            ♛ COUNCIL COMMAND ROOM
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold font-cinzel gold-shimmer">JGA DEMO COUNCIL</h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          JGA Demo Council brings the Stitch Brick architecture, braided memory, node mesh verification, Phoenix recovery, and JGA business automation into one council-ready command room. Every state is quarantined first. Every trusted state is verified, validated, and certified. Nothing touches the Spine.
        </p>
        <p className="text-[10px] font-mono italic" style={{ color: "rgba(201,168,76,0.6)" }}>
          "No active state becomes trusted state without verification, validation, and certification three times marked."
        </p>
      </div>

      {/* Readiness Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Demo Readiness", value: "92%", color: "#4ade80" },
          { label: "Modules Connected", value: "10/10", color: GOLD },
          { label: "Proof Available", value: "47 records", color: "#60a5fa" },
          { label: "Illinois Pilot", value: "Phase 1", color: "#a78bfa" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border p-4 text-center" style={{ background: "hsl(220,18%,7%)" }}>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{s.label}</div>
            <div className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Council View Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold font-cinzel" style={{ color: GOLD }}>Core Modules</h2>
        <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
          {VIEW_MODES.map(m => (
            <button key={m} onClick={() => setViewMode(m)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
              style={viewMode === m ? { background: "rgba(201,168,76,0.15)", color: GOLD } : { color: "rgba(255,255,255,0.4)" }}>
              {VIEW_LABELS[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MODULES.map(mod => {
          const Icon = mod.icon;
          return (
            <div key={mod.code} className="rounded-xl border border-border p-5 space-y-3 hover:border-primary/30 transition-all" style={{ background: "hsl(220,18%,7%)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5" style={{ color: mod.color }} />
                  <div>
                    <span className="text-[10px] font-mono font-bold" style={{ color: mod.color }}>{mod.code}</span>
                    <h3 className="text-sm font-semibold text-foreground">{mod.name}</h3>
                  </div>
                </div>
                <Badge className="text-[9px] border" style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80", borderColor: "rgba(34,197,94,0.3)" }}>
                  DEMO ACTIVE
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{mod.desc[viewMode]}</p>
            </div>
          );
        })}
      </div>

      {/* Council Briefing */}
      <div className="rounded-xl border border-border p-6 space-y-4" style={{ background: "hsl(220,18%,7%)" }}>
        <h2 className="text-lg font-bold font-cinzel" style={{ color: GOLD }}>Council Briefing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">What JGA is Building</h3>
            <p className="text-muted-foreground leading-relaxed">A verification-first business automation platform that organizes design services, contractor management, client onboarding, and financial compliance into one auditable system backed by sovereign runtime architecture.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Why Verification-First Matters</h3>
            <p className="text-muted-foreground leading-relaxed">Every data point, every payment, every file upload enters quarantine before becoming trusted. This creates defensible audit trails, reduces disputes, and demonstrates operational discipline to investors and regulators.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Illinois Pilot Readiness</h3>
            <p className="text-muted-foreground leading-relaxed">Phase 1 targets Illinois-only operations with local demo council, JGA design intake, client/contractor portals, proof vault, and daily reporting. Infrastructure is demo-ready for investor review.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Expansion Plan</h3>
            <p className="text-muted-foreground leading-relaxed">Phase 2: Five-state expansion. Phase 3: Fifteen states. Phase 4: All 50 states with full Enterprise OS, AVA/VERA assistant integration, and advanced analytics. Each phase adds verified modules.</p>
          </div>
        </div>
      </div>

      {/* Enter Gold Room */}
      <div className="text-center">
        <Button
          onClick={() => setGoldRoomOpen(!goldRoomOpen)}
          className="px-8 py-3 text-sm font-bold font-cinzel h-auto"
          style={{ background: "linear-gradient(135deg, #C9A84C, #a07828)", color: "#0a0c10" }}
        >
          <Star className="w-4 h-4 mr-2" />
          {goldRoomOpen ? "Close the Gold Room" : "Enter the Gold Room"}
          {goldRoomOpen ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </Button>
      </div>

      {/* Gold Room */}
      {goldRoomOpen && (
        <div className="rounded-2xl border-2 p-6 sm:p-8 space-y-6" style={{ borderColor: "rgba(201,168,76,0.4)", background: "linear-gradient(135deg, hsl(220,22%,5%) 0%, hsl(40,15%,8%) 50%, hsl(220,22%,5%) 100%)" }}>
          <div className="text-center space-y-2">
            <Badge className="text-[10px] px-3 py-1 font-bold border" style={{ background: "rgba(201,168,76,0.15)", color: GOLD, borderColor: "rgba(201,168,76,0.5)" }}>
              ♛ THE GOLD ROOM
            </Badge>
            <h2 className="text-xl font-bold font-cinzel gold-shimmer">Owner Command Summary</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "System Heartbeat", value: "NOMINAL", sub: "All nodes reporting", color: "#4ade80", icon: Activity },
              { label: "Business Readiness", value: "READY", sub: "Client intake active", color: GOLD, icon: Building2 },
              { label: "Proof Readiness", value: "47 RECORDS", sub: "Vault certified", color: "#60a5fa", icon: Award },
              { label: "Pilot Readiness", value: "PHASE 1", sub: "Illinois demo live", color: "#a78bfa", icon: Eye },
              { label: "Recovery Readiness", value: "ARMED", sub: "Phoenix on standby", color: "#ef4444", icon: Heart },
              { label: "Next Best Action", value: "DEMO", sub: "Run investor walkthrough", color: "#f59e0b", icon: ArrowRight },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="rounded-xl border p-4 space-y-2" style={{ background: "rgba(0,0,0,0.3)", borderColor: "rgba(201,168,76,0.15)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{card.label}</span>
                    <Icon className="w-4 h-4" style={{ color: card.color }} />
                  </div>
                  <div className="text-lg font-bold font-mono" style={{ color: card.color }}>{card.value}</div>
                  <div className="text-[10px] text-muted-foreground">{card.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}