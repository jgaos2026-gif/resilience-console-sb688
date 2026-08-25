export const SYSTEM_COMPONENTS = [
  { id: "ava", name: "AVA Digital Organism Room", type: "control-plane", repo: "jgaos2026-gif/resilience-console-sb688", status: "local_ui", role: "Unified operator, memory, proof, voice, system map" },
  { id: "oasis", name: "OASIS", type: "runtime", repo: "jgaos2026-gif/oasis", status: "blocked_listener_unverified", role: "Source exposes a loopback control-room API, but no approved listener has been live-verified in this test environment" },
  { id: "oasis3w", name: "OASIS 3W", type: "runtime", repo: "jgaos2026-gif/oasis-3w", status: "blocked_no_runtime_interface", role: "No live API interface verified" },
  { id: "jgaos", name: "JGA OS", type: "platform", repo: "jgaos2026-gif/jga-os", status: "blocked_no_runtime_interface", role: "No live API interface verified" },
  { id: "stitch", name: "Sovereign Stitch", type: "governance-memory", repo: "jgaos2026-gif/Sovereign-Stitch-JGA", status: "blocked_no_runtime_interface", role: "No live API interface verified" },
  { id: "sb688", name: "SB-688", type: "proof-resilience", repo: "jgaos2026-gif/sb688", status: "blocked_no_runtime_interface", role: "No live API interface verified" },
  { id: "sb688public", name: "SB-688 Public", type: "proof-public", repo: "jgaos2026-gif/sb688-public", status: "blocked_no_runtime_interface", role: "No live API interface verified" },
  { id: "sb688console", name: "SB-688 Resilience Console", type: "console", repo: "jgaos2026-gif/resilience-console-sb688", status: "local_ui", role: "AVA room and resilience UI in this repository" },
  { id: "sb689", name: "SB-689", type: "resilience", repo: "jgaos2026-gif/sb689", status: "blocked_no_runtime_interface", role: "No live API interface verified" },
  { id: "bct", name: "Braided Computational Topology", type: "research-core", repo: "jgaos2026-gif/Braided-Computational-Topology-", status: "blocked_no_runtime_interface", role: "Research/source repository; no live API interface verified" },
  { id: "immune", name: "AI Immune System", type: "integrity", repo: "jgaos2026-gif/multi-industry-data-integrity-and-ai-immune-system", status: "blocked_no_runtime_interface", role: "No live API interface verified" },
  { id: "jga", name: "Jays Graphic Arts", type: "product", repo: "jgaos2026-gif/Jays-Graphic-Arts", status: "blocked_no_runtime_interface", role: "No live API interface verified" },
  { id: "copilot", name: "JGA Copilot Pack", type: "proof-test", repo: "jgaos2026-gif/jga_copilot_pack", status: "blocked_no_runtime_interface", role: "Evidence repository; no live API interface verified" },
  { id: "powershell", name: "PowerShell", type: "automation", repo: "jgaos2026-gif/PowerShell", status: "blocked_no_runtime_interface", role: "Scripts exist, but no authenticated runtime API has been verified" },
  { id: "worldmonitor", name: "World Monitor", type: "monitoring", repo: "jgaos2026-gif/worldmonitor", status: "blocked_no_runtime_interface", role: "No live API interface verified" },
  { id: "jaysgraphicarts-ai", name: "jaysgraphicarts-ai", type: "external-repo", repo: "jaysgraphicarts-ai", status: "blocked_no_runtime_interface", role: "Repository/runtime unavailable to the current connection" },
  { id: "jgaenterpises360", name: "jgaenterpises360", type: "external-repo", repo: "jgaenterpises360", status: "blocked_no_runtime_interface", role: "Repository/runtime unavailable to the current connection" },
];

export const SYSTEM_LINKS = [
  ["ava", "oasis"], ["ava", "jgaos"], ["ava", "stitch"], ["ava", "sb688"],
  ["ava", "sb688console"], ["ava", "powershell"], ["ava", "copilot"], ["ava", "immune"],
  ["stitch", "bct"], ["sb688", "sb688public"], ["sb688", "sb689"], ["jgaos", "jga"],
  ["jgaos", "worldmonitor"], ["oasis", "oasis3w"], ["ava", "jaysgraphicarts-ai"], ["ava", "jgaenterpises360"],
];

export function getVerifiedRuntimeComponents() {
  return SYSTEM_COMPONENTS.filter((component) => component.status === "verified_runtime");
}

export function getBlockedComponents() {
  return SYSTEM_COMPONENTS.filter((component) => component.status.startsWith("blocked_"));
}
