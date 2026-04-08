import React from "react";

const steps = [
  {
    step: 1,
    title: "Pick Your Industry",
    description: "Start by selecting your industry from the Control Panel dropdown or the Industries tab. The entire console — component names, role descriptions, business outcomes, and scenario language — will adapt to your sector. This is not cosmetic. It changes the conversation.",
  },
  {
    step: 2,
    title: "Load a Scenario",
    description: "Choose a scenario from the Control Panel. This tells the system what kind of disruption to simulate — a network path failure, a tamper attempt, an AI drift event, and more. Click 'Load Scenario' to prepare the simulation.",
  },
  {
    step: 3,
    title: "Start the Problem Simulation",
    description: "Click 'Start Problem' to inject the disruption. Watch the System Map change. Components will shift to degraded or isolated states. The route will reroute. Metrics will drop. The event log will record what happened. This is real simulation logic, not animation.",
  },
  {
    step: 4,
    title: "Run Smart Recovery",
    description: "Click 'Smart Recovery' to initiate a recovery from the last trusted checkpoint. The system restores healthy state, recomputes the primary route, advances the trusted record chain, and logs every step. Metrics improve. Components return to healthy.",
  },
  {
    step: 5,
    title: "Run the Proof Suite",
    description: "Click 'Run Proof Suite' to verify the system's behavior. Each proof test checks a real condition — does the route exist? Did rerouting work? Was isolation applied? Did recovery advance the trust chain? Results are PASS or FAIL, not opinions.",
  },
  {
    step: 6,
    title: "Use Graphs to Explain Value",
    description: "Switch to the Graphs tab to see resilience, route time, and continuity plotted over the lifecycle of the demo. Use these visuals to explain to stakeholders: this is the baseline, this is the incident, this is the recovery. The numbers tell the story.",
  },
];

export default function UserManualTab() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-foreground">User Manual</h2>
        <p className="text-sm text-muted-foreground">A step-by-step guide for running a complete demo walkthrough.</p>
      </div>
      <div className="space-y-4">
        {steps.map((s) => (
          <div key={s.step} className="flex gap-4 p-5 bg-card border border-border rounded-xl">
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">{s.step}</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}