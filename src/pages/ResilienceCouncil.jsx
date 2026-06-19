import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, Brain, Radio, LayoutDashboard, Layers, Lock,
  GitBranch, Activity, CheckCircle2
} from "lucide-react";
import { CrownIcon, LionIcon } from "@/components/sb688/WarriorCrest";
import MasterControlPanel from "@/components/council/MasterControlPanel";
import LivingBraidedCore from "@/components/council/LivingBraidedCore";
import DriftHunterPanel from "@/components/council/DriftHunterPanel";
import CouncilPDFReport from "@/components/council/CouncilPDFReport";

const GOLD = "#C9A84C";
const BORDER = "rgba(201,168,76,0.18)";

const TABS = [
  { id: "master",  label: "Master Control",       icon: LayoutDashboard },
  { id: "core",    label: "Living Braided Core",   icon: Layers },
  { id: "drift",   label: "Drift Hunter",          icon: Radio },
];

export default function ResilienceCouncil() {
  const [activeTab, setActiveTab] = useState("master");

  // Shared state lifted to top so all panels share context
  const [coreState, setCoreState] = useState({
    spineStatus: "PROTECTED",
    ledgerVersion: 1,
    ledgerHash: "sha256:a4f2b3c1d8...",
    ledgerChain: [
      { v: 1, hash: "sha256:a4f2b3c1d8e9f0a1", label: "Genesis Block", ts: Date.now() - 120000 },
    ],
    braidHealth: 100,
    driftScore: 0,
    noDeleteViolations: 0,
    snapshotVault: [],
    selfHealLog: [],
    pocketCerts: [],
    systemLocked: false,
    lastDoctorRun: null,
    doctorReport: null,
    packetTests: [],
    omega72Active: false,
    sb712Active: false,
    stitchBrickMode: "NOMINAL",
  });

  const patchCore = useCallback((patch) => {
    setCoreState(prev => ({ ...prev, ...patch }));
  }, []);

  return (
    <div className="min-h-screen font-inter" style={{ background: "hsl(220,20%,4%)", color: "hsl(43,35%,88%)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b"
        style={{ background: "hsl(220,22%,5%)", borderColor: BORDER, boxShadow: "0 2px 24px rgba(0,0,0,0.8)" }}>
        <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} />
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: 28 }}>
              <CrownIcon size={16} color={GOLD} />
              <LionIcon  size={20} color={GOLD} />
            </div>
            <div className="w-px h-8" style={{ background: `linear-gradient(180deg,transparent,rgba(201,168,76,0.45),transparent)` }} />
            <div>
              <div className="text-xs font-bold tracking-widest font-cinzel" style={{ color: GOLD }}>
                Resilience Council · Living Braided Core
              </div>
              <div className="text-[9px] tracking-widest uppercase" style={{ color: "rgba(201,168,76,0.45)" }}>
                OMEGA-72 · SB712 · STITCH-BRICK · Drift Hunter · Spine Protection · Local Proof System
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="text-[9px] border font-bold"
              style={{ background: coreState.systemLocked ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
                       color: coreState.systemLocked ? "#f87171" : "#4ade80",
                       borderColor: coreState.systemLocked ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)" }}>
              {coreState.systemLocked ? "🔒 LOCKED" : "● LIVE"}
            </Badge>
            <Badge className="text-[9px] border"
              style={{ background: "rgba(201,168,76,0.08)", color: GOLD, borderColor: "rgba(201,168,76,0.25)" }}>
              Ledger v{coreState.ledgerVersion}
            </Badge>
            <Badge className="text-[9px] border"
              style={{ background: "rgba(59,130,246,0.08)", color: "#60a5fa", borderColor: "rgba(59,130,246,0.2)" }}>
              Drift: {coreState.driftScore}
            </Badge>
            <CouncilPDFReport coreState={coreState} />
            <Link to="/" className="text-[9px] px-3 py-1.5 rounded border font-semibold"
              style={{ color: GOLD, borderColor: "rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.06)" }}>
              ← Console
            </Link>
          </div>
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg,transparent,rgba(201,168,76,0.2),transparent)` }} />
      </header>

      {/* Tab nav */}
      <div className="border-b" style={{ background: "hsl(220,20%,5%)", borderColor: BORDER }}>
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent h-auto p-0 gap-0 rounded-none flex w-max min-w-full">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.id} value={tab.id}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-muted-foreground hover:text-foreground px-4 py-3 text-xs font-medium transition-all whitespace-nowrap flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 mr-1.5" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Disclaimer */}
        <div className="rounded-lg border px-4 py-2.5 text-[10px] leading-relaxed"
          style={{ background: "rgba(201,168,76,0.04)", borderColor: "rgba(201,168,76,0.15)", color: "rgba(232,217,176,0.5)" }}>
          <strong style={{ color: "rgba(201,168,76,0.7)" }}>Local Proof System Disclosure:</strong> All simulations, hash-chain logs, drift detection, self-heal sequences, and proof reports run entirely in-browser. This is a demonstrational resilience council dashboard — not a certified production security system. Language used (e.g. "verified", "certified") refers to local simulation outcomes only.
        </div>

        {activeTab === "master" && (
          <MasterControlPanel coreState={coreState} patchCore={patchCore} />
        )}
        {activeTab === "core" && (
          <LivingBraidedCore coreState={coreState} patchCore={patchCore} />
        )}
        {activeTab === "drift" && (
          <DriftHunterPanel coreState={coreState} patchCore={patchCore} />
        )}
      </main>

      <footer className="border-t mt-12 py-4" style={{ borderColor: BORDER, background: "hsl(220,20%,4%)" }}>
        <div style={{ height: 1, background: `linear-gradient(90deg,transparent,rgba(201,168,76,0.2),transparent)`, marginBottom: 12 }} />
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4 flex-wrap text-[9px]" style={{ color: "rgba(201,168,76,0.4)" }}>
          <span className="font-cinzel font-semibold">SB688 · Resilience Council · Living Braided Core</span>
          <span>OMEGA-72 / SB712 / STITCH-BRICK · Local proof system · John E. Arenz — J.G.A. © {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}