const MEMORY_KEY = "jga_ava_memory_v1";
const PROOF_KEY = "jga_ava_proof_v1";
const CHAT_KEY = "jga_ava_chat_v1";
const MODE_KEY = "jga_ava_mode_v1";

export const AVA_OWNER = "Jay / John Arenz";
export const AVA_LAW = "NO ACTIVE STATE BECOMES TRUSTED STATE WITHOUT VERIFICATION";

export function loadLocal(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

export function saveLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function localHash(text = "") {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return `AVA-${(hash >>> 0).toString(16).toUpperCase()}`;
}

export function getMemories() { return loadLocal(MEMORY_KEY); }
export function getProofs() { return loadLocal(PROOF_KEY); }
export function getChat() { return loadLocal(CHAT_KEY); }
export function getMode() { return localStorage.getItem(MODE_KEY) || "personal"; }
export function setMode(mode) { localStorage.setItem(MODE_KEY, mode); }
export function saveChat(messages) { saveLocal(CHAT_KEY, messages.slice(-80)); }

export function addMemory(text, source = "owner") {
  const item = { id: crypto.randomUUID(), text, source, created_at: new Date().toISOString(), hash: localHash(text) };
  saveLocal(MEMORY_KEY, [item, ...getMemories()].slice(0, 300));
  return item;
}

export function addProof(type, summary, data = {}) {
  const payload = { type, summary, data, owner: AVA_OWNER, law: AVA_LAW, created_at: new Date().toISOString() };
  const hashPass1 = localHash(JSON.stringify(payload));
  const hashPass2 = localHash(hashPass1 + payload.created_at);
  const hashPass3 = localHash(hashPass2 + AVA_LAW);
  const item = { id: crypto.randomUUID(), ...payload, hash: hashPass3, hash_pass_1: hashPass1, hash_pass_2: hashPass2, hash_pass_3: hashPass3, verification_scope: "local_offline_hash_chain" };
  saveLocal(PROOF_KEY, [item, ...getProofs()].slice(0, 200));
  return item;
}

export function generateAVAReply(input, helpers) {
  const text = input.toLowerCase().trim();
  if (text.includes("who are you")) return "I am AVA — Autonomous Virtual Authority for JGA Enterprise OS. Jay / John Arenz is owner and final authority. I operate local-first, proof-first, and I will not fake live systems.";
  if (text === "status" || text.includes("ava status")) return "AVA local shell is unleashed. OASIS, SB-712, Phoenix, Clip Brick, System B, compliance, voice, sync, and adapters are represented as honest local control modules. Live integrations remain stubs until configured and tested.";
  if (text.startsWith("remember ")) { const memory = helpers.addMemory(input.slice(9), "owner-chat"); return `Saved locally for the owner. Memory hash: ${memory.hash}`; }
  if (text.startsWith("find ")) { const q = input.slice(5).toLowerCase(); const hits = helpers.getMemories().filter(m => m.text.toLowerCase().includes(q)).slice(0, 5); return hits.length ? `Found ${hits.length} local memory item(s):\n${hits.map(h => `- ${h.text}`).join("\n")}` : "I did not find that in local memory yet."; }
  if (text.startsWith("mode ")) { const mode = text.replace("mode ", "").trim(); helpers.setMode(mode); return `Mode set to ${mode}. I will keep responses aligned with that operating lane.`; }
  if (text.includes("deposit")) return "Business gate: JGA requires 35% deposit cleared before production starts. I will not mark production ready without payment proof.";
  if (text.includes("final") || text.includes("delivery")) return "Release gate: clean final files stay locked until the remaining 65% final payment is cleared through JGA-controlled payment records.";
  if (text.includes("contractor") || text.includes("system b")) return "System B rule: contractors cannot bind JGA, change pricing, promise refunds, handle money, receive cash, or deliver final files. Commission stays proof-gated.";
  if (text.includes("compliance") || text.includes("tax")) return "Compliance rule: records must be state-tagged, siloed, retained, and audit-ready. I will not delete compliance records inside retention windows.";
  if (text.includes("phoenix")) return "Phoenix is the recovery lane: checkpoint first, restore proof second, no destructive restore without backup.";
  if (text.includes("clip") || text.includes("unknown")) return "Unknown data belongs in Clip Brick isolation first. Nothing unverified touches the Spine.";
  helpers.addProof("FOLLOW_UP", "AVA did not know the answer and logged a follow-up", { input });
  return "I do not know that yet, Owner. I logged it as a local follow-up instead of guessing.";
}