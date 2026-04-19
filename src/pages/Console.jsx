import React, { useState, useCallback } from "react";
import { INDUSTRIES, createInitialState, loadScenario, simulateProblem, runRecovery, runProofSuite, factoryReset } from "@/lib/sb688Engine";
// AI communications are handled via base44.integrations.Core.InvokeLLM — no external API keys needed.
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Wrench, BookOpen, Building2, BarChart3, Users, Brain, Layers, RotateCcw, ListOrdered, LayoutDashboard, FileCheck, FlaskConical, XOctagon, Radio, Award, Play, Link2, Check, EyeOff } from "lucide-react";
import PublicObserver from "./PublicObserver";
import KpiStrip from "@/components/sb688/KpiStrip";
import ControlPanel from "@/components/sb688/ControlPanel";
import ComponentList from "@/components/sb688/ComponentList";
import TopologyMap from "@/components/sb688/TopologyMap";
import RouteInspector from "@/components/sb688/RouteInspector";
import TrustedRecordLog from "@/components/sb688/TrustedRecordLog";
import ProofSuite from "@/components/sb688/ProofSuite";
import GraphsPanel from "@/components/sb688/GraphsPanel";
import IndustryCards from "@/components/sb688/IndustryCards";
import OverviewTab from "@/components/sb688/OverviewTab";
import UserManualTab from "@/components/sb688/UserManualTab";
import CreatorsTab from "@/components/sb688/CreatorsTab";
import SovereignGuardian from "@/components/sb688/SovereignGuardian";
import AIMissionAnalyst from "@/components/sb688/AIMissionAnalyst";
import AIScenarioNarrator from "@/components/sb688/AIScenarioNarrator";
import BrickStitchTab from "@/components/sb688/BrickStitchTab";
import RecoveryArchitectureTab from "@/components/sb688/RecoveryArchitectureTab";
import EventTimeline from "@/components/sb688/EventTimeline";
import ResilienceDashboard from "@/components/sb688/ResilienceDashboard";
import GovernanceReportPanel from "@/components/sb688/GovernanceReportPanel";
import WarriorCrest, { CrownIcon, LionIcon } from "@/components/sb688/WarriorCrest";
import PolicySandboxTab from "@/components/sb688/PolicySandboxTab";
import LiveCapabilityDemo from "@/components/sb688/LiveCapabilityDemo";
import SecurityPosturePanel from "@/components/sb688/SecurityPosturePanel";
import GhostNodePanel from "@/components/sb688/GhostNodePanel";
import QuarantinePanel from "@/components/sb688/QuarantinePanel";
import VerifiableProofSnapshot from "@/components/sb688/VerifiableProofSnapshot";
import BuilderAttributionPanel from "@/components/sb688/BuilderAttributionPanel";
import SovereignSpineHUD from "@/components/sb688/SovereignSpineHUD";

const tabs = [
  { id: "sovereign", label: "Sovereign Spine", icon: Shield },
  { id: "overview", label: "Overview", icon: Eye },
  { id: "demo", label: "Live Demo", icon: Play },
  { id: "workspace", label: "Workspace", icon: Wrench },
  { id: "manual", label: "User Manual", icon: BookOpen },
  { id: "industries", label: "Industries", icon: Building2 },
  { id: "graphs", label: "Graphs", icon: BarChart3 },
  { id: "brickstitch", label: "Brick Stitch", icon: Layers },
  { id: "recovery", label: "Recovery", icon: RotateCcw },
  { id: "timeline", label: "Timeline", icon: ListOrdered },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "ai", label: "AI Analyst", icon: Brain },
  { id: "governance", label: "Governance", icon: FileCheck },
  { id: "policy", label: "Policy Sandbox", icon: FlaskConical },
  { id: "security", label: "Security Posture", icon: Shield },
  { id: "ghost", label: "Ghost Nodes", icon: Radio },
  { id: "quarantine", label: "Quarantine", icon: XOctagon },
  { id: "proof_snapshot", label: "Proof Snapshot", icon: FileCheck },
  { id: "attribution", label: "Attribution", icon: Award },
  { id: "creators", label: "Creators", icon: Users },
];

export default function Console() {
  const [state, setState] = useState(createInitialState);
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);
  const [observerMode, setObserverMode] = useState(false);

  const handleCopyObserverLink = () => {
    const url = `${window.location.origin}/observe`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const industry = INDUSTRIES[state.industry];

  const handleIndustryChange = useCallback((id) => {
    setState((prev) => {
      const ind = INDUSTRIES[id];
      return {
        ...prev,
        industry: id,
        approvedRoute: ind.route,
        scenario: ind.scenario,
        eventLog: [
          { message: `Industry switched to ${ind.title}. Components and language adapted.`, timestamp: Date.now() },
          ...prev.eventLog,
        ],
      };
    });
  }, []);

  const handleScenarioChange = useCallback((id) => {
    setState((prev) => ({ ...prev, scenario: id }));
  }, []);

  const handleLoadScenario = useCallback(() => {
    setState((prev) => loadScenario(prev, prev.scenario));
  }, []);

  const handleSimulate = useCallback(() => {
    setState((prev) => simulateProblem(prev));
  }, []);

  const handleRecover = useCallback(() => {
    setState((prev) => runRecovery(prev));
  }, []);

  const handleReset = useCallback(() => {
    setState(factoryReset());
  }, []);

  const handleProof = useCallback(() => {
    setState((prev) => runProofSuite(prev));
  }, []);

  const handleClear = useCallback(() => {
    setState((prev) => ({
      ...prev,
      proofRun: false,
      proofResults: [],
    }));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50" style={{ background: "linear-gradient(180deg, hsl(220,22%,5%) 0%, hsl(220,18%,7%) 100%)", boxShadow: "0 1px 0 rgba(201,168,76,0.18), 0 4px 24px rgba(0,0,0,0.6)" }}>
        {/* Gold top rule */}
        <div className="warrior-divider" />
        <div className="max-w-[1400px] mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Crest + Title */}
            <div className="flex items-center gap-3">
              {/* Crown + Lion crest mark */}
              <div className="flex flex-col items-center justify-center flex-shrink-0" style={{ width: 36 }}>
                <CrownIcon size={22} color="#C9A84C" />
                <LionIcon size={26} color="#C9A84C" />
              </div>
              {/* Divider */}
              <div className="w-px h-10 bg-gradient-to-b from-transparent via-primary/40 to-transparent flex-shrink-0" />
              <div>
                <h1 className="text-sm font-bold tracking-widest leading-tight font-cinzel" style={{ color: "#C9A84C", textShadow: "0 0 20px rgba(201,168,76,0.35)" }}>
                  SB688 · NATIONAL RESILIENCE COUNCIL
                </h1>
                <p className="text-[9px] text-muted-foreground tracking-widest uppercase mt-0.5">
                  Warrior-Grade Resilience · Trusted Recovery · Verifiable Proof · J.G.A.
                </p>
              </div>
            </div>
            {/* Right badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-semibold" style={{ background: "rgba(201,168,76,0.08)", color: "#C9A84C", borderColor: "rgba(201,168,76,0.3)" }}>
                {industry.title}
              </Badge>
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 border-blue-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
                AI Active
              </Badge>
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 hidden sm:flex" style={{ background: "rgba(201,168,76,0.06)", color: "rgba(201,168,76,0.6)", borderColor: "rgba(201,168,76,0.2)" }}>
                ♛ JGA Black &amp; Gold
              </Badge>
              <button
                onClick={handleCopyObserverLink}
                className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded border transition-all font-semibold"
                style={{ background: "rgba(34,197,94,0.08)", color: copied ? "#22c55e" : "#86efac", borderColor: copied ? "rgba(34,197,94,0.5)" : "rgba(34,197,94,0.2)" }}
                title="Copy public observer link"
              >
                {copied ? <Check className="w-3 h-3" /> : <Link2 className="w-3 h-3" />}
                {copied ? "Copied!" : "Share Observer Link"}
              </button>
              <button
                onClick={() => setObserverMode(v => !v)}
                className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded border transition-all font-semibold"
                style={observerMode
                  ? { background: "rgba(201,168,76,0.12)", color: "#C9A84C", borderColor: "rgba(201,168,76,0.5)" }
                  : { background: "rgba(139,92,246,0.08)", color: "#a78bfa", borderColor: "rgba(139,92,246,0.25)" }
                }
                title={observerMode ? "Switch to Owner View" : "Preview as Public Observer"}
              >
                {observerMode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {observerMode ? "Owner View" : "Observer Preview"}
              </button>
            </div>
          </div>
        </div>
        {/* Gold bottom rule */}
        <div className="warrior-divider" />
      </header>

      {/* Observer mode banner */}
      {observerMode && (
        <div className="sticky top-[57px] z-40 flex items-center justify-between px-4 py-1.5 text-[10px] font-semibold" style={{ background: "rgba(139,92,246,0.12)", borderBottom: "1px solid rgba(139,92,246,0.25)", color: "#c4b5fd" }}>
          <span className="flex items-center gap-1.5"><Eye className="w-3 h-3" /> You are previewing the <strong>Public Observer</strong> view — this is exactly what visitors without access will see.</span>
          <button onClick={() => setObserverMode(false)} className="underline hover:text-white transition">Back to Owner View</button>
        </div>
      )}

      {/* Observer mode: render PublicObserver inline */}
      {observerMode ? (
        <div className="pointer-events-auto">
          <PublicObserver />
        </div>
      ) : (
      <>

      {/* Navigation */}
      <div className="border-b border-border" style={{ background: "hsl(220,20%,5%)" }}>
        <div className="max-w-[1400px] mx-auto px-4 overflow-x-auto scrollbar-none">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent h-auto p-0 gap-0 rounded-none flex w-max min-w-full">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-muted-foreground hover:text-foreground px-3 py-2.5 text-xs font-medium transition-all whitespace-nowrap flex-shrink-0"
                  >
                    <Icon className="w-3.5 h-3.5 mr-1" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        {/* KPI Strip — always visible */}
        <KpiStrip state={state} />

        {/* Tab Content */}
        {activeTab === "sovereign" && <SovereignSpineHUD />}

        {activeTab === "overview" && <OverviewTab />}

        {activeTab === "demo" && <LiveCapabilityDemo />}

        {activeTab === "workspace" && (
          <div className="space-y-6">
            <ControlPanel
              state={state}
              onIndustryChange={handleIndustryChange}
              onScenarioChange={handleScenarioChange}
              onRouteStartChange={(v) => setState((p) => ({ ...p, routeStart: v }))}
              onRouteEndChange={(v) => setState((p) => ({ ...p, routeEnd: v }))}
              onLoadScenario={handleLoadScenario}
              onSimulate={handleSimulate}
              onRecover={handleRecover}
              onReset={handleReset}
              onProof={handleProof}
              onClear={handleClear}
            />

            {/* AI Scenario Narrator — auto-generates plain-English mission narrative after state changes */}
            <AIScenarioNarrator state={state} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <ComponentList state={state} />
                <RouteInspector state={state} />
                {/* Sovereign AI Guardian — HMAC drift detection + Merkle Stitch */}
                <SovereignGuardian state={state} />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <TopologyMap state={state} />
                <TrustedRecordLog state={state} />
                <ProofSuite state={state} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "manual" && <UserManualTab />}

        {activeTab === "industries" && (
          <IndustryCards currentIndustry={state.industry} onSelect={handleIndustryChange} />
        )}

        {activeTab === "graphs" && <GraphsPanel state={state} />}

        {activeTab === "brickstitch" && <BrickStitchTab />}

        {activeTab === "recovery" && <RecoveryArchitectureTab />}

        {activeTab === "timeline" && (
          <EventTimeline
            state={state}
            onCheckpointJump={(record) => {
              setState((prev) => ({
                ...prev,
                eventLog: [
                  { message: `Checkpoint jump: viewing trusted record v${record.version} — "${record.message}"`, timestamp: Date.now() },
                  ...prev.eventLog,
                ],
              }));
            }}
          />
        )}

        {activeTab === "dashboard" && <ResilienceDashboard state={state} />}

        {activeTab === "ai" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <AIMissionAnalyst state={state} />
            </div>
            <div className="xl:col-span-1 space-y-4">
              <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-primary">Live System Snapshot</h3>
                <div className="space-y-2 text-xs">
                  {[
                    { label: "Industry", value: INDUSTRIES[state.industry].title },
                    { label: "Operational State", value: state.operationalState },
                    { label: "Resilience", value: `${state.resilienceScore}%` },
                    { label: "Route Type", value: state.routeType },
                    { label: "Trusted Record", value: `v${state.trustedRecordVersion}` },
                    { label: "Proof Suite", value: state.proofRun ? `${state.proofResults.filter(p=>p.pass).length}/${state.proofResults.length}` : "Not run" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-border/30 last:border-0">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-foreground font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground/60 leading-relaxed">The AI Analyst has full awareness of this state. Ask it anything about what is happening, what it means, or how to explain it to stakeholders.</p>
              </div>
              <SovereignGuardian state={state} />
            </div>
          </div>
        )}

        {activeTab === "governance" && <GovernanceReportPanel state={state} />}

        {activeTab === "policy" && <PolicySandboxTab state={state} />}

        {activeTab === "security" && <SecurityPosturePanel />}

        {activeTab === "ghost" && <GhostNodePanel state={state} />}

        {activeTab === "quarantine" && <QuarantinePanel state={state} />}

        {activeTab === "proof_snapshot" && <VerifiableProofSnapshot state={state} />}

        {activeTab === "attribution" && <BuilderAttributionPanel />}

        {activeTab === "creators" && <CreatorsTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12" style={{ background: "hsl(220,20%,4%)" }}>
        <div className="warrior-divider" />
        <div className="max-w-[1400px] mx-auto px-4 py-4 space-y-2">
          <div className="flex items-center justify-between gap-4 flex-wrap text-[10px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <CrownIcon size={16} color="#C9A84C" />
              <span className="font-cinzel font-semibold" style={{ color: "rgba(201,168,76,0.7)" }}>SB688 · National Resilience Council</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Ghost Node Sensors · Quarantine Containment · Trusted Restore · Verifiable Proof
              </span>
              <span className="text-muted-foreground/60">Architecture &amp; Direction: John Arenz — J.G.A. © {new Date().getFullYear()}</span>
            </div>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-[9px] text-muted-foreground/40 leading-relaxed">
              Demonstrates defensive containment and recoverability. Does not claim perfect security. All simulation logic runs locally. Not a certified production system.
            </div>
            <div className="flex items-center gap-2">
              <a href="/observe" className="text-[9px] text-green-400/60 hover:text-green-400 transition border border-green-500/20 hover:border-green-500/40 rounded px-2 py-0.5">
                👁 Public Observer →
              </a>
              <a href="/jga-live" className="text-[9px] text-primary/60 hover:text-primary transition border border-primary/20 hover:border-primary/40 rounded px-2 py-0.5">
                JGA Live Rebuild →
              </a>
            </div>
          </div>
        </div>
      </footer>
      </>
      )}
    </div>
  );
}