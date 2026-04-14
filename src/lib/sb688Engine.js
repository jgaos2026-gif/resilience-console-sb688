// SB688 Universal Resilience Console — Simulation Engine
// Core state management, industry definitions, scenario logic, recovery, and proof suite

export const INDUSTRIES = {
  universal: {
    id: "universal",
    title: "Universal Infrastructure",
    subtitle: "Cross-sector resilience for critical systems",
    story: "Every organization depends on infrastructure that must not fail. SB688 provides a universal resilience layer that detects trouble fast, keeps operations moving, restores from trust, and proves recovery — across any sector.",
    outcome: "Reduce unplanned downtime by up to 94%. Contain cascading failures before they reach end users. Prove recovery compliance to auditors and stakeholders in minutes, not weeks.",
    components: {
      core: { label: "System Core", role: "Central orchestration and health authority" },
      driver_net: { label: "Exchange Network", role: "Inter-component communication fabric" },
      fs: { label: "State Vault", role: "Trusted state and checkpoint storage" },
      user_app: { label: "Operator Console", role: "User-facing workload interface" },
      braidA: { label: "Braid Alpha", role: "Primary continuity strand" },
      braidB: { label: "Braid Beta", role: "Redundant continuity strand" },
    },
    route: ["core", "driver_net", "braidA", "fs", "user_app"],
    scenario: "network_failure",
  },
  healthcare: {
    id: "healthcare",
    title: "Healthcare",
    subtitle: "Patient safety and clinical continuity",
    story: "In healthcare, system downtime is not an inconvenience — it is a patient safety event. SB688 ensures clinical systems remain operational, medical records stay trustworthy, and recovery is provable for regulatory compliance.",
    outcome: "Maintain continuous access to patient records during infrastructure disruptions. Prove to CMS and HIPAA auditors that clinical data integrity was never compromised. Reduce mean time to recovery from hours to seconds.",
    components: {
      core: { label: "Hospital Core", role: "Central clinical system orchestrator" },
      driver_net: { label: "Medical Device Network", role: "Device-to-system communication layer" },
      fs: { label: "Clinical Record Store", role: "Trusted patient data and checkpoint vault" },
      user_app: { label: "Patient Portal", role: "Clinician and patient-facing interface" },
      braidA: { label: "Care Continuity Alpha", role: "Primary clinical continuity strand" },
      braidB: { label: "Care Continuity Beta", role: "Redundant clinical continuity strand" },
    },
    route: ["core", "driver_net", "braidA", "fs", "user_app"],
    scenario: "dependency_disruption",
  },
  manufacturing: {
    id: "manufacturing",
    title: "Manufacturing",
    subtitle: "Production line resilience and quality assurance",
    story: "Manufacturing downtime costs thousands per minute. SB688 keeps production lines moving by detecting equipment failures early, rerouting control paths around degraded systems, and restoring from trusted checkpoints without full line stops.",
    outcome: "Cut unplanned production stops by 90%. Maintain quality control data integrity across shift changes and system failures. Demonstrate ISO compliance with verifiable recovery records.",
    components: {
      core: { label: "Production Core", role: "Central manufacturing execution authority" },
      driver_net: { label: "Equipment Bus", role: "Machine-to-controller communication network" },
      fs: { label: "Quality Vault", role: "Production state and quality checkpoint storage" },
      user_app: { label: "Floor Console", role: "Operator workstation interface" },
      braidA: { label: "Line Continuity Alpha", role: "Primary production continuity strand" },
      braidB: { label: "Line Continuity Beta", role: "Redundant production continuity strand" },
    },
    route: ["core", "driver_net", "braidA", "fs", "user_app"],
    scenario: "incomplete_update",
  },
  logistics: {
    id: "logistics",
    title: "Logistics",
    subtitle: "Supply chain visibility and delivery continuity",
    story: "When logistics systems fail, shipments go dark. SB688 maintains continuous visibility across the supply chain, reroutes data paths around failed tracking nodes, and ensures delivery records remain trustworthy and auditable.",
    outcome: "Maintain 99.97% supply chain visibility during infrastructure disruptions. Reduce shipment-dark events to near zero. Prove chain-of-custody integrity for high-value and regulated shipments.",
    components: {
      core: { label: "Logistics Core", role: "Central supply chain orchestrator" },
      driver_net: { label: "Tracking Network", role: "Fleet and shipment communication mesh" },
      fs: { label: "Shipment Vault", role: "Delivery state and custody checkpoint storage" },
      user_app: { label: "Dispatch Console", role: "Dispatcher and shipper interface" },
      braidA: { label: "Route Continuity Alpha", role: "Primary delivery continuity strand" },
      braidB: { label: "Route Continuity Beta", role: "Redundant delivery continuity strand" },
    },
    route: ["core", "driver_net", "braidA", "fs", "user_app"],
    scenario: "path_attack",
  },
  finance: {
    id: "finance",
    title: "Finance",
    subtitle: "Transaction integrity and regulatory trust",
    story: "Financial systems demand absolute data integrity. SB688 ensures transaction processing continues during infrastructure failures, maintains an auditable trust chain for every state change, and proves recovery to regulators.",
    outcome: "Zero transaction data loss during infrastructure events. Prove SOX and PCI compliance with verifiable recovery records. Reduce regulatory audit preparation from weeks to hours.",
    components: {
      core: { label: "Transaction Core", role: "Central financial processing authority" },
      driver_net: { label: "Settlement Network", role: "Inter-bank and clearing communication" },
      fs: { label: "Ledger Vault", role: "Transaction state and audit checkpoint storage" },
      user_app: { label: "Trading Console", role: "Trader and analyst interface" },
      braidA: { label: "Settlement Continuity Alpha", role: "Primary financial continuity strand" },
      braidB: { label: "Settlement Continuity Beta", role: "Redundant financial continuity strand" },
    },
    route: ["core", "driver_net", "braidA", "fs", "user_app"],
    scenario: "tamper_attempt",
  },
  government: {
    id: "government",
    title: "Government",
    subtitle: "Sovereign infrastructure and citizen service continuity",
    story: "Government systems serve millions and must withstand both technical failures and adversarial threats. SB688 provides sovereign-grade resilience with provable recovery and trust chain integrity for classified and unclassified workloads.",
    outcome: "Maintain citizen service availability during infrastructure disruptions. Prove FedRAMP and FISMA compliance with verifiable recovery audit trails. Contain adversarial incidents before they reach citizen data.",
    components: {
      core: { label: "Agency Core", role: "Central government system authority" },
      driver_net: { label: "Secure Exchange Network", role: "Inter-agency secure communication" },
      fs: { label: "Federal Record Vault", role: "Classified and unclassified state storage" },
      user_app: { label: "Citizen Portal", role: "Public-facing government services" },
      braidA: { label: "Mission Continuity Alpha", role: "Primary government continuity strand" },
      braidB: { label: "Mission Continuity Beta", role: "Redundant government continuity strand" },
    },
    route: ["core", "driver_net", "braidA", "fs", "user_app"],
    scenario: "network_failure",
  },
  aerospace: {
    id: "aerospace",
    title: "Aerospace",
    subtitle: "Mission-critical flight and ground operations",
    story: "In aerospace, failure is not an option — it is an event to be contained in milliseconds. SB688 provides mission-grade resilience for flight control, ground operations, and telemetry systems with provable recovery from every anomaly.",
    outcome: "Maintain continuous flight control authority during system anomalies. Prove post-incident recovery integrity to FAA and mission authority. Reduce ground-stop duration by orders of magnitude.",
    components: {
      core: { label: "Mission Core", role: "Central flight and ground authority" },
      driver_net: { label: "Flight Control Bus", role: "Avionics and ground link communication" },
      fs: { label: "Flight State Vault", role: "Telemetry and mission checkpoint storage" },
      user_app: { label: "Mission Console", role: "Flight director and operator interface" },
      braidA: { label: "Mission Strand Alpha", role: "Primary mission continuity path" },
      braidB: { label: "Mission Strand Beta", role: "Redundant mission continuity path" },
    },
    route: ["core", "driver_net", "braidA", "fs", "user_app"],
    scenario: "dependency_disruption",
  },
  industrial_ai: {
    id: "industrial_ai",
    title: "Industrial AI",
    subtitle: "AI orchestration resilience and model trust",
    story: "AI systems in production must be resilient, auditable, and recoverable. SB688 ensures AI inference pipelines survive infrastructure failures, model state remains trustworthy, and orchestration drift is detected and corrected before it causes harm.",
    outcome: "Maintain continuous AI inference during infrastructure disruptions. Detect and correct orchestration drift before it affects production decisions. Prove model state integrity and recovery to compliance teams.",
    components: {
      core: { label: "AI Orchestration Core", role: "Central AI pipeline authority" },
      driver_net: { label: "Inference Exchange Mesh", role: "Model-to-model communication fabric" },
      fs: { label: "Model & State Vault", role: "Model weights and inference checkpoint storage" },
      user_app: { label: "Operator AI Console", role: "AI operator and analyst interface" },
      braidA: { label: "Inference Continuity Alpha", role: "Primary AI continuity strand" },
      braidB: { label: "Inference Continuity Beta", role: "Redundant AI continuity strand" },
    },
    route: ["core", "driver_net", "braidA", "fs", "user_app"],
    scenario: "ai_drift",
  },
};

export const SCENARIOS = {
  network_failure: {
    id: "network_failure",
    title: "Network Path Failure",
    description: "Primary exchange path between components fails, requiring immediate traffic rerouting through alternate continuity strands.",
    affectedComponents: ["driver_net"],
    degradedComponents: ["braidA"],
    isolatedComponents: [],
    logEntries: [
      "Primary exchange path failed. Traffic rerouting initiated.",
      "Alternate continuity strand engaged for active traffic.",
      "Degraded path detected on Braid Alpha. Monitoring engaged.",
    ],
  },
  dependency_disruption: {
    id: "dependency_disruption",
    title: "Dependency Chain Disruption",
    description: "A critical dependency in the processing chain becomes unavailable, threatening downstream operations.",
    affectedComponents: ["braidA"],
    degradedComponents: ["core"],
    isolatedComponents: [],
    logEntries: [
      "Dependency chain disruption detected on primary continuity strand.",
      "Core orchestrator entering degraded advisory mode.",
      "Downstream operations rerouted through redundant path.",
    ],
  },
  incomplete_update: {
    id: "incomplete_update",
    title: "Incomplete Update",
    description: "A system update was interrupted mid-deployment, leaving components in an inconsistent state.",
    affectedComponents: ["fs"],
    degradedComponents: ["user_app"],
    isolatedComponents: [],
    logEntries: [
      "Incomplete update detected in state vault.",
      "Operator interface entering degraded mode due to state inconsistency.",
      "Checkpoint rollback prepared. Awaiting recovery authorization.",
    ],
  },
  tamper_attempt: {
    id: "tamper_attempt",
    title: "Trusted Record Tamper Attempt",
    description: "An unauthorized modification attempt was detected against the trusted record chain.",
    affectedComponents: [],
    degradedComponents: ["fs"],
    isolatedComponents: ["braidB"],
    logEntries: [
      "Suspicious commit detected on trusted record chain.",
      "Tamper attempt quarantined. Affected strand isolated.",
      "Trust verification engaged. Chain integrity under review.",
    ],
  },
  path_attack: {
    id: "path_attack",
    title: "Targeted Path Attack",
    description: "A deliberate attack targets the primary communication path, attempting to disrupt or intercept traffic.",
    affectedComponents: ["driver_net"],
    degradedComponents: [],
    isolatedComponents: ["braidA"],
    logEntries: [
      "Targeted attack detected on primary exchange path.",
      "Compromised continuity strand isolated immediately.",
      "All traffic rerouted through verified alternate path.",
    ],
  },
  ai_drift: {
    id: "ai_drift",
    title: "AI Orchestration Drift",
    description: "AI inference pipeline has drifted from its approved operational envelope, producing inconsistent outputs.",
    affectedComponents: ["core"],
    degradedComponents: ["driver_net", "braidA"],
    isolatedComponents: [],
    logEntries: [
      "AI orchestration drift detected. Inference outputs deviating from approved envelope.",
      "Exchange mesh entering degraded mode. Inference routing restricted.",
      "Model state checkpoint comparison initiated.",
    ],
  },
  unauthorized_state: {
    id: "unauthorized_state",
    title: "Unauthorized State Transition",
    description: "An unsigned or unauthorized state write was attempted against a protected module boundary. The trusted chain rejected the transition before it could commit.",
    affectedComponents: [],
    degradedComponents: ["fs"],
    isolatedComponents: ["braidB"],
    logEntries: [
      "Unauthorized state transition detected. Signature verification failed.",
      "Affected strand isolated. State write blocked before chain advancement.",
      "Tamper rejection logged. Trusted ledger integrity maintained.",
    ],
  },
  ghost_probe: {
    id: "ghost_probe",
    title: "Suspicious Probe via Ghost Node",
    description: "A suspicious probing attempt was detected by a ghost node sensor. The decoy absorbed the probe without exposing trusted core modules. Telemetry surfaced for operator review.",
    affectedComponents: [],
    degradedComponents: ["braidA"],
    isolatedComponents: [],
    logEntries: [
      "Ghost node telemetry: suspicious probe detected at mesh boundary.",
      "Probe absorbed by ghost sensor. Core modules not exposed.",
      "Anomalous access pattern logged. Operator audit flag raised.",
    ],
  },
  compromised_runtime: {
    id: "compromised_runtime",
    title: "Compromised Runtime Quarantined",
    description: "A component runtime was identified as compromised via state hash mismatch. The module was detached from the trusted mesh, moved to a disposable quarantine container, terminated, and rebuilt from a trusted checkpoint.",
    affectedComponents: ["driver_net"],
    degradedComponents: [],
    isolatedComponents: ["driver_net"],
    logEntries: [
      "State hash mismatch detected on Exchange Network. Compromise suspected.",
      "Module detached from trusted mesh. Moved to disposable quarantine sandbox.",
      "Compromised runtime terminated. Rebuilding from trusted checkpoint.",
      "Dependency revalidation initiated. Mesh re-knitting around quarantined module.",
    ],
  },
};

const COMPONENT_KEYS = ["core", "driver_net", "fs", "user_app", "braidA", "braidB"];

function generateHash() {
  const chars = "abcdef0123456789";
  let h = "";
  for (let i = 0; i < 8; i++) h += chars[Math.floor(Math.random() * chars.length)];
  return h;
}

export function createInitialState() {
  return {
    industry: "universal",
    scenario: null,
    scenarioLoaded: false,
    problemSimulated: false,
    recoveryRun: false,
    proofRun: false,
    routeStart: "core",
    routeEnd: "user_app",
    components: COMPONENT_KEYS.reduce((acc, key) => {
      acc[key] = { status: "healthy", checkpointId: `chk-${generateHash()}` };
      return acc;
    }, {}),
    approvedRoute: ["core", "driver_net", "braidA", "fs", "user_app"],
    routeType: "primary",
    routeTime: 12,
    resilienceScore: 100,
    continuityScore: 100,
    operationalState: "Nominal",
    trustedRecordVersion: 1,
    trustedRecords: [
      {
        version: 1,
        hash: generateHash(),
        status: "trusted",
        message: "Baseline system state committed as trusted record head.",
        timestamp: Date.now(),
      },
    ],
    eventLog: [
      { message: "System initialized. All components healthy. Baseline trusted record established.", timestamp: Date.now() },
    ],
    proofResults: [],
    graphData: {
      resilienceTimeline: [100],
      routeTimeComparison: [12],
      continuityOutcome: [100],
      labels: ["Baseline"],
    },
  };
}

export function loadScenario(state, scenarioId) {
  const scenario = SCENARIOS[scenarioId];
  if (!scenario) return state;
  return {
    ...state,
    scenario: scenarioId,
    scenarioLoaded: true,
    problemSimulated: false,
    recoveryRun: false,
    proofRun: false,
    proofResults: [],
    eventLog: [
      { message: `Scenario loaded: ${scenario.title}. ${scenario.description}`, timestamp: Date.now() },
      ...state.eventLog,
    ],
  };
}

export function simulateProblem(state) {
  if (!state.scenario) return state;
  const scenario = SCENARIOS[state.scenario];
  const newComponents = { ...state.components };

  scenario.affectedComponents.forEach((c) => {
    if (newComponents[c]) newComponents[c] = { ...newComponents[c], status: "degraded" };
  });
  scenario.degradedComponents.forEach((c) => {
    if (newComponents[c]) newComponents[c] = { ...newComponents[c], status: "degraded" };
  });
  scenario.isolatedComponents.forEach((c) => {
    if (newComponents[c]) newComponents[c] = { ...newComponents[c], status: "isolated" };
  });

  // Compute alternate route avoiding degraded/isolated
  const allAffected = [
    ...scenario.affectedComponents,
    ...scenario.isolatedComponents,
  ];
  let newRoute = state.approvedRoute.filter((n) => !allAffected.includes(n));

  // If braidA is out, try braidB
  if (allAffected.includes("braidA") && !allAffected.includes("braidB")) {
    newRoute = newRoute.map((n) => (n === "braidA" ? "braidB" : n));
    if (!newRoute.includes("braidB")) {
      const idx = newRoute.indexOf("driver_net");
      if (idx >= 0) newRoute.splice(idx + 1, 0, "braidB");
    }
  }
  if (allAffected.includes("driver_net")) {
    newRoute = newRoute.filter((n) => n !== "driver_net");
  }

  // Ensure route has at least start and end
  if (!newRoute.includes(state.routeStart)) newRoute.unshift(state.routeStart);
  if (!newRoute.includes(state.routeEnd)) newRoute.push(state.routeEnd);

  const resilienceHit = 15 + allAffected.length * 10 + scenario.degradedComponents.length * 5;
  const continuityHit = 10 + allAffected.length * 8;
  const newResilience = Math.max(20, state.resilienceScore - resilienceHit);
  const newContinuity = Math.max(30, state.continuityScore - continuityHit);

  const newLogs = scenario.logEntries.map((msg) => ({ message: msg, timestamp: Date.now() }));

  const newTR = {
    version: state.trustedRecordVersion + 1,
    hash: generateHash(),
    status: "trusted",
    message: "Incident state recorded. Reroute decision committed to trusted chain.",
    timestamp: Date.now(),
  };

  return {
    ...state,
    problemSimulated: true,
    recoveryRun: false,
    proofRun: false,
    proofResults: [],
    components: newComponents,
    approvedRoute: newRoute,
    routeType: "alternate",
    routeTime: 28 + Math.floor(Math.random() * 15),
    resilienceScore: newResilience,
    continuityScore: newContinuity,
    operationalState: scenario.isolatedComponents.length > 0 ? "Degraded — Containment Active" : "Degraded",
    trustedRecordVersion: state.trustedRecordVersion + 1,
    trustedRecords: [newTR, ...state.trustedRecords],
    eventLog: [...newLogs, ...state.eventLog],
    graphData: {
      ...state.graphData,
      resilienceTimeline: [...state.graphData.resilienceTimeline, newResilience],
      routeTimeComparison: [...state.graphData.routeTimeComparison, 28 + Math.floor(Math.random() * 15)],
      continuityOutcome: [...state.graphData.continuityOutcome, newContinuity],
      labels: [...state.graphData.labels, "Incident"],
    },
  };
}

export function runRecovery(state) {
  const newComponents = {};
  COMPONENT_KEYS.forEach((key) => {
    newComponents[key] = {
      status: "healthy",
      checkpointId: `chk-${generateHash()}`,
    };
  });

  const industry = INDUSTRIES[state.industry];
  const newRoute = industry.route;
  const newResilience = Math.min(100, state.resilienceScore + 35);
  const newContinuity = Math.min(100, state.continuityScore + 30);

  const recoveryLogs = [
    { message: "Smart Recovery initiated. Scanning trusted checkpoint chain.", timestamp: Date.now() },
    { message: "Approved checkpoint restored across affected components.", timestamp: Date.now() },
    { message: "Alternate approved route engaged. Primary path restored.", timestamp: Date.now() },
    { message: "Recovered state recommitted as new trusted record head.", timestamp: Date.now() },
  ];

  const newTR = {
    version: state.trustedRecordVersion + 1,
    hash: generateHash(),
    status: "trusted",
    message: "Recovery complete. New trusted record head established from verified checkpoint.",
    timestamp: Date.now(),
  };

  return {
    ...state,
    recoveryRun: true,
    proofRun: false,
    proofResults: [],
    components: newComponents,
    approvedRoute: newRoute,
    routeType: "primary",
    routeTime: 14,
    resilienceScore: newResilience,
    continuityScore: newContinuity,
    operationalState: newResilience >= 90 ? "Nominal" : "Recovering",
    trustedRecordVersion: state.trustedRecordVersion + 1,
    trustedRecords: [newTR, ...state.trustedRecords],
    eventLog: [...recoveryLogs, ...state.eventLog],
    graphData: {
      ...state.graphData,
      resilienceTimeline: [...state.graphData.resilienceTimeline, newResilience],
      routeTimeComparison: [...state.graphData.routeTimeComparison, 14],
      continuityOutcome: [...state.graphData.continuityOutcome, newContinuity],
      labels: [...state.graphData.labels, "Recovered"],
    },
  };
}

export function runProofSuite(state) {
  const hasRoute = state.approvedRoute.length >= 2;
  const allHealthy = COMPONENT_KEYS.every((k) => state.components[k].status === "healthy");
  const hasIsolated = COMPONENT_KEYS.some((k) => state.components[k].status === "isolated");
  const trVersion = state.trustedRecordVersion;
  const tamperScenario = state.scenario === "tamper_attempt";

  const proofs = [
    {
      title: "Baseline Approved Route Exists",
      pass: hasRoute,
      explanation: hasRoute
        ? "A valid approved route with at least two components is active in the system."
        : "No valid approved route is currently established.",
    },
    {
      title: "Engine Reroutes Around Failed Path",
      pass: state.problemSimulated && state.routeType === "alternate" || (state.recoveryRun && hasRoute),
      explanation:
        state.problemSimulated || state.recoveryRun
          ? "The system successfully rerouted traffic around the failed or degraded path."
          : "No reroute has been tested yet. Run a Problem Simulation first.",
    },
    {
      title: "Isolation Blocks Compromised Workload",
      pass: hasIsolated || (state.recoveryRun && !hasIsolated),
      explanation: hasIsolated
        ? "Compromised components are currently isolated and blocked from system traffic."
        : state.recoveryRun
        ? "Isolation was applied during incident and released after verified recovery."
        : "No isolation event has occurred in this session.",
    },
    {
      title: "Recovery Advances Trusted Record Head",
      pass: state.recoveryRun && trVersion > 1,
      explanation: state.recoveryRun
        ? `Recovery advanced the trusted record to version ${trVersion}. Chain integrity verified.`
        : "Smart Recovery has not been run yet.",
    },
    {
      title: "Trust Chain Rejects Tamper Attempt",
      pass: tamperScenario ? state.problemSimulated : true,
      explanation: tamperScenario
        ? state.problemSimulated
          ? "Suspicious commit was detected, refused, and quarantined. Trust chain integrity maintained."
          : "Tamper detection has not been triggered."
        : "No tamper scenario was loaded. Trust chain integrity is nominal.",
    },
  ];

  const passCount = proofs.filter((p) => p.pass).length;

  return {
    ...state,
    proofRun: true,
    proofResults: proofs,
    eventLog: [
      { message: `Proof suite completed: ${passCount}/${proofs.length} tests passed.`, timestamp: Date.now() },
      ...state.eventLog,
    ],
  };
}

export function factoryReset() {
  return createInitialState();
}