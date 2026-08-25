export const SYSTEM_COMPONENTS = [
  { id: "ava", name: "AVA Digital Organism Room", type: "control-plane", repo: "jgaos2026-gif/resilience-console-sb688", status: "connected", role: "Unified operator, memory, proof, voice, system map" },
  { id: "oasis", name: "OASIS", type: "runtime", repo: "jgaos2026-gif/oasis", status: "connected", role: "Room-door runtime and orchestration layer" },
  { id: "oasis3w", name: "OASIS 3W", type: "runtime", repo: "jgaos2026-gif/oasis-3w", status: "connected", role: "Extended OASIS runtime" },
  { id: "jgaos", name: "JGA OS", type: "platform", repo: "jgaos2026-gif/jga-os", status: "connected", role: "Primary operating-system layer" },
  { id: "stitch", name: "Sovereign Stitch", type: "governance-memory", repo: "jgaos2026-gif/Sovereign-Stitch-JGA", status: "connected", role: "Rules, braid, memory spine, trust law" },
  { id: "sb688", name: "SB-688", type: "proof-resilience", repo: "jgaos2026-gif/sb688", status: "connected", role: "Proof, integrity, resilience harness" },
  { id: "sb688public", name: "SB-688 Public", type: "proof-public", repo: "jgaos2026-gif/sb688-public", status: "connected", role: "Public proof surface" },
  { id: "sb688console", name: "SB-688 Resilience Console", type: "console", repo: "jgaos2026-gif/resilience-console-sb688", status: "connected", role: "AVA room and resilience UI" },
  { id: "sb689", name: "SB-689", type: "resilience", repo: "jgaos2026-gif/sb689", status: "connected", role: "Adjacent resilience system" },
  { id: "bct", name: "Braided Computational Topology", type: "research-core", repo: "jgaos2026-gif/Braided-Computational-Topology-", status: "connected", role: "Braided computational architecture" },
  { id: "immune", name: "AI Immune System", type: "integrity", repo: "jgaos2026-gif/multi-industry-data-integrity-and-ai-immune-system", status: "connected", role: "Cross-industry integrity and immune layer" },
  { id: "jga", name: "Jays Graphic Arts", type: "product", repo: "jgaos2026-gif/Jays-Graphic-Arts", status: "connected", role: "JGA product and design surface" },
  { id: "copilot", name: "JGA Copilot Pack", type: "proof-test", repo: "jgaos2026-gif/jga_copilot_pack", status: "connected", role: "Copilot tests and packaged evidence" },
  { id: "powershell", name: "PowerShell", type: "automation", repo: "jgaos2026-gif/PowerShell", status: "connected", role: "Install, launch, repair and automation scripts" },
  { id: "worldmonitor", name: "World Monitor", type: "monitoring", repo: "jgaos2026-gif/worldmonitor", status: "connected", role: "Monitoring and external observation surface" },
  { id: "jaysgraphicarts-ai", name: "jaysgraphicarts-ai", type: "external-repo", repo: "jaysgraphicarts-ai", status: "pending-access", role: "External JGA AI repository/account" },
  { id: "jgaenterpises360", name: "jgaenterpises360", type: "external-repo", repo: "jgaenterpises360", status: "pending-access", role: "External enterprise repository/account" },
];

export const SYSTEM_LINKS = [
  ["ava", "oasis"], ["ava", "jgaos"], ["ava", "stitch"], ["ava", "sb688"],
  ["ava", "sb688console"], ["ava", "powershell"], ["ava", "copilot"], ["ava", "immune"],
  ["stitch", "bct"], ["sb688", "sb688public"], ["sb688", "sb689"], ["jgaos", "jga"],
  ["jgaos", "worldmonitor"], ["oasis", "oasis3w"], ["ava", "jaysgraphicarts-ai"], ["ava", "jgaenterpises360"],
];

export function getConnectedComponents() {
  return SYSTEM_COMPONENTS.filter((component) => component.status === "connected");
}

export function getPendingComponents() {
  return SYSTEM_COMPONENTS.filter((component) => component.status !== "connected");
}
