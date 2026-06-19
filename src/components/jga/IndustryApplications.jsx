import React, { useState } from "react";

const GOLD = "#C9A84C";

const LEVELS = ["simple", "tech", "lab"];
const LEVEL_LABELS = { simple: "Simple", tech: "Technical", lab: "Lab / R&D" };

const INDUSTRIES = [
  {
    industry: "Tesla / EV Manufacturing",
    icon: "⚡",
    color: "#e11d48",
    simple: "Every part of a car assembly line becomes a checkpoint. If a robot arm or sensor goes wrong, the system catches it before a bad car gets built — automatically, no human needed.",
    tech: "Node mesh maps assembly-line sensors and actuators as verified nodes. Drift in torque, weld integrity, or cell voltage triggers immediate quarantine. Append-only ledger backs NHTSA recall defense with tamper-evident production logs.",
    lab: "Distributed Byzantine-fault-tolerant mesh over heterogeneous PLCs. Deterministic state machine: each node transitions through Input→Quarantine→Verify→Validate→Certify before actuator command. Hash-chain ledger provides cryptographic proof for regulatory discovery.",
  },
  {
    industry: "SpaceX / Aerospace",
    icon: "🚀",
    color: "#7c3aed",
    simple: "Rockets can't be fixed mid-flight by a human. This system monitors every critical part and if something starts to go wrong, it finds the last safe state and recovers on its own — no ground crew needed.",
    tech: "Flight computer and avionics nodes are triple-verified before state transitions. A failing node self-quarantines and triggers Phoenix recovery — rolling back to last certified checkpoint without ground control intervention.",
    lab: "Autonomous sovereign runtime with sub-100ms Phoenix rollback on node failure. Zero-trust command architecture: no actuator command reaches 'trusted' without tri-mark certification. Designed for 20+ min comms-lag deep-space autonomy extension.",
  },
  {
    industry: "Deep Space Travel / NASA",
    icon: "🌌",
    color: "#0ea5e9",
    simple: "In deep space, signals take 20+ minutes to reach Earth. No human can fix a problem in time. This mesh watches itself, finds problems, and repairs them on its own — keeping the crew safe without waiting for help.",
    tech: "Fully autonomous mesh with no Earth uplink dependency. Life support, nav, and power nodes self-verify continuously. Memory braid ensures only certified knowledge loads into active context. Phoenix recovery operates within verified loop without ground authorization.",
    lab: "Möbius-surface runtime verification loop: infinite-loop architecture with checkpoint recovery at every strand junction. RAM Guard prevents memory injection attacks in radiation-exposed environments. Proof hash generated from live node telemetry — state provable offline, verifiable on Earth retrospectively.",
  },
  {
    industry: "Law Enforcement / Justice",
    icon: "⚖️",
    color: "#d97706",
    simple: "Evidence can never be quietly changed. Every file, video, or record is locked with a unique fingerprint the moment it enters the system. Any tampering is instantly detected and flagged — making proof court-ready by design.",
    tech: "Body cam, evidence, and case file nodes are SHA-256 hash-verified on intake. Every access is append-only logged. Modification triggers a tamper alert with full audit trail. Proof records are structurally court-admissible — no silent edits possible.",
    lab: "Cryptographic chain-of-custody: each evidence node carries an immutable hash-chain record from intake through disposition. Triple-gate certification required before evidence status changes. Rollback capability preserves pre-modification state for forensic analysis. Compliant with FBI CJIS and FRE Rule 901(b)(9).",
  },
  {
    industry: "National Security / DoD",
    icon: "🛡️",
    color: "#dc2626",
    simple: "If an insider threat or hacker tries to change anything on a classified network, this system notices the second a node behaves differently than expected — and locks it out before damage is done.",
    tech: "Classified network nodes operate in verified mesh. Lateral movement and insider threats detected when any node deviates from certified behavior. RAM Guard blocks memory injection. Every command chain requires tri-mark certification before execution.",
    lab: "Zero-trust sovereign architecture with behavioral baseline fingerprinting per node. Deviations from certified runtime signature trigger automated quarantine and forensic snapshot capture. Command execution requires sequential Verify→Validate→Certify before dispatch — no single point of compromise. Designed for NSA CSfC and DISA STIG alignment.",
  },
  {
    industry: "FinTech / Banking",
    icon: "🏦",
    color: "#16a34a",
    simple: "Every payment goes through three separate checks before it's approved. If fraud is detected at any step, it's stopped immediately. Every transaction is permanently logged — giving regulators a clean, unchallengeable record.",
    tech: "Transaction, ledger update, and account state nodes each pass three verification gates. Fraud attempts quarantined in real time. Dispute resolution backed by immutable proof records. No payment reaches trusted state without triple certification.",
    lab: "Append-only ledger with hash-chain integrity on every state transition. Triple-gate pipeline mirrors SWIFT GPI and ISO 20022 compliance requirements. Rollback-capable ledger supports regulatory stress-test scenarios. Proof vault enables real-time SOX and PCI-DSS audit export without manual reconciliation.",
  },
  {
    industry: "ComEd / Utility Grids",
    icon: "🔋",
    color: "#ca8a04",
    simple: "Smart meters and power substations are monitored as nodes. If one starts reporting bad data, it's isolated before it causes a blackout. The grid heals itself automatically and logs everything for regulators.",
    tech: "Grid substations and smart meter nodes monitored for drift. Anomalous load data quarantined before cascade. Phoenix recovery restores last known good grid state within seconds. Every grid event logged for FERC compliance.",
    lab: "Real-time mesh over SCADA/ICS endpoints with sub-second quarantine trigger on telemetry deviation beyond certified threshold. Certified state snapshots enable deterministic rollback to pre-fault grid topology. Proof records satisfy NERC CIP-007 / CIP-010 audit requirements without manual reporting.",
  },
  {
    industry: "Healthcare / Hospital Systems",
    icon: "🏥",
    color: "#0891b2",
    simple: "Patient records, dosing systems, and diagnostic results are checked before they're used. Nothing affects a treatment decision until it's been verified three times. Every action is permanently logged for HIPAA compliance.",
    tech: "Patient data, dosing, and diagnostic machine nodes enter quarantine on intake. Anomalous data cannot affect treatment until triple-verified. Medication dispensing nodes certified before activation. HIPAA audit trail built-in.",
    lab: "Clinical decision support nodes operate within sovereign verification envelope. EHR state changes require tri-mark certification before downstream propagation. Hash-chain proof on every dosing event satisfies 21 CFR Part 11 electronic record requirements. Rollback capability supports adverse event reconstruction for FDA review.",
  },
  {
    industry: "AI / LLM Infrastructure",
    icon: "🧠",
    color: "#8b5cf6",
    simple: "AI responses, training data, and memory are all treated as nodes that need to be checked before being used. A hallucinated or poisoned answer is caught and quarantined before it reaches anyone. Only verified knowledge gets loaded.",
    tech: "Every LLM response, training batch, and memory pocket is a mesh node. Poisoned outputs quarantined before reaching users. Model weight updates require three-gate certification. Memory braid loads only verified knowledge into active context.",
    lab: "Sovereign AI runtime with quarantined inference outputs: no response transitions to 'trusted' without Verify→Validate→Certify pipeline. Memory pocket architecture (66-strand braid) enforces verified load/unload with RAM Guard. Designed to address NIST AI RMF Govern 1.7 / Measure 2.5 requirements for AI output integrity and traceable audit trails.",
  },
];

export default function IndustryApplications() {
  const [level, setLevel] = useState("simple");

  return (
    <div className="space-y-5 pt-4 border-t" style={{ borderColor: `${GOLD}20` }}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-[9px] tracking-[0.4em] uppercase text-muted-foreground">Real-World Impact</p>
          <h2 className="text-sm font-black font-cinzel" style={{ color: GOLD }}>
            What This Node Mesh Does Across Industries
          </h2>
        </div>
        {/* Level Toggle */}
        <div className="flex gap-1 rounded-xl p-1 self-start sm:self-auto" style={{ background: "#111111", border: `1px solid ${GOLD}18` }}>
          {LEVELS.map(l => (
            <button key={l} onClick={() => setLevel(l)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
              style={level === l
                ? { background: `linear-gradient(135deg, ${GOLD}, #a07828)`, color: "#080808" }
                : { color: "rgba(201,168,76,0.4)" }}>
              {LEVEL_LABELS[l]}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground max-w-2xl">
        {level === "simple" && "Plain English — what this actually does for each industry."}
        {level === "tech" && "Technical overview — systems, protocols, and integration points."}
        {level === "lab" && "Research & development depth — standards, specs, and compliance alignment."}
      </p>

      {/* Industry Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {INDUSTRIES.map((item, i) => (
          <div key={i}
            className="rounded-xl border p-4 space-y-3 transition-all hover:scale-[1.01]"
            style={{ background: "hsl(220,18%,7%)", borderColor: `${item.color}22` }}>
            {/* Card Header */}
            <div className="flex items-center gap-2">
              <span className="text-lg leading-none">{item.icon}</span>
              <h3 className="text-[11px] font-black uppercase tracking-wide leading-tight" style={{ color: item.color }}>
                {item.industry}
              </h3>
            </div>
            {/* Explanation */}
            <p className="text-[10px] leading-relaxed"
              style={{ color: level === "lab" ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.55)" }}>
              {item[level]}
            </p>
            {/* Level indicator pill */}
            <div className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md self-start inline-block"
              style={{ background: `${item.color}10`, color: `${item.color}80`, border: `1px solid ${item.color}20` }}>
              {LEVEL_LABELS[level]} VIEW
            </div>
          </div>
        ))}
      </div>

      {/* Footer callout */}
      <div className="rounded-xl border p-4 text-center space-y-1.5" style={{ background: "#0e0c00", borderColor: `${GOLD}25` }}>
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: GOLD }}>
          The Core Principle Is The Same Everywhere
        </p>
        <p className="text-[10px] text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Any system where a silent failure, undetected change, or unverified state can cause harm —
          financial loss, injury, national security risk, or legal liability — is a candidate for this architecture.
          <span className="font-bold" style={{ color: GOLD }}> No state becomes trusted without earning it.</span>
        </p>
      </div>
    </div>
  );
}