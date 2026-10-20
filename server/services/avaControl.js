/**
 * avaControl.js — AVA's controllable state.
 *
 * Mode, voice, standing directives, and durable memory live here so that a
 * controlled change is a real, persisted, attributable change — not a value
 * that only exists in one browser tab.
 *
 * Every write records who made it. Memory is archived, never deleted: the
 * console does not erase evidence.
 */

import { randomUUID } from 'node:crypto';
import { getDb } from '../db/database.js';
import { sha256 } from './braidEngine.js';

/** Operating lanes. Mirrored into every AVA prompt so the lane actually binds. */
export const AVA_LANES = Object.freeze({
  business:   'Business lane: contracts, pricing, deposits, client delivery, contractor control.',
  system:     'System lane: spine, braid integrity, nodes, gates, recovery.',
  compliance: 'Compliance lane: retention, auditability, chain of custody, state tagging.',
  systemb:    'System B lane: independent contractor expansion — contractors never hold money, pricing, refunds, or final files.',
  personal:   'Personal lane: direct, warm, owner-facing conversation.',
  prompt:     'Prompt lane: help the owner sharpen instructions and system prompts.',
  proof:      'Proof lane: evidence, hashes, verification status, and what is still unproven.',
  quiet:      'Quiet lane: short, minimal answers.',
});

export const AVA_MODES = Object.keys(AVA_LANES);

export const MAX_DIRECTIVES = 12;
export const MAX_DIRECTIVE_CHARS = 400;

const DEFAULTS = { mode: 'system', voice_enabled: true, directives: [] };

function readKey(key) {
  const row = getDb().prepare('SELECT value FROM ava_control WHERE key = ?').get(key);
  if (!row) return null;
  try { return JSON.parse(row.value); } catch (_) { return null; }
}

function writeKey(key, value, actorId) {
  getDb().prepare(`
    INSERT INTO ava_control (key, value, updated_by, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value,
      updated_by = excluded.updated_by, updated_at = CURRENT_TIMESTAMP
  `).run(key, JSON.stringify(value), String(actorId));
}

/** Current control state, with provenance. */
export function getAvaControl() {
  const mode = readKey('mode');
  const voice = readKey('voice_enabled');
  const directives = readKey('directives');
  const meta = getDb().prepare('SELECT updated_at, updated_by FROM ava_control ORDER BY updated_at DESC LIMIT 1').get();

  const memoryCount = getDb()
    .prepare("SELECT COUNT(*) AS c FROM ava_memory WHERE status = 'active'").get()?.c ?? 0;

  return {
    mode: AVA_MODES.includes(mode) ? mode : DEFAULTS.mode,
    voice_enabled: typeof voice === 'boolean' ? voice : DEFAULTS.voice_enabled,
    directives: Array.isArray(directives) ? directives : DEFAULTS.directives,
    active_memory: memoryCount,
    last_changed_at: meta?.updated_at || null,
    last_changed_by: meta?.updated_by || null,
  };
}

/** Set AVA's operating lane. */
export function setMode(mode, actorId) {
  if (!AVA_MODES.includes(mode)) {
    throw new Error(`Unknown mode '${mode}'. Allowed: ${AVA_MODES.join(', ')}`);
  }
  writeKey('mode', mode, actorId);
  return getAvaControl();
}

/** Enable or disable AVA's voice. */
export function setVoice(enabled, actorId) {
  writeKey('voice_enabled', enabled === true, actorId);
  return getAvaControl();
}

/**
 * Add a standing directive AVA must follow, or clear all of them.
 * Directives are injective instructions — the text is quoted into AVA's prompt
 * as owner-supplied direction, never as system authority.
 */
export function setDirective({ directive = null, clear_all = false } = {}, actorId = 'owner') {
  if (clear_all) {
    writeKey('directives', [], actorId);
    return getAvaControl();
  }

  const text = String(directive || '').trim();
  if (!text) throw new Error('A directive text is required unless clear_all is true.');
  if (text.length > MAX_DIRECTIVE_CHARS) {
    throw new Error(`Directive exceeds ${MAX_DIRECTIVE_CHARS} characters.`);
  }

  const current = getAvaControl().directives;
  const entry = {
    id: randomUUID(),
    text,
    set_by: String(actorId),
    created_at: new Date().toISOString(),
  };
  const next = [...current, entry].slice(-MAX_DIRECTIVES);
  writeKey('directives', next, actorId);
  return { ...getAvaControl(), added: entry };
}

/** Store a durable AVA memory. */
export function addAvaMemory({ text, source = 'owner' } = {}, actorId = 'owner') {
  const clean = String(text || '').trim();
  if (!clean) throw new Error('Memory text is required.');

  const info = getDb().prepare(
    'INSERT INTO ava_memory (text, source, actor_id, hash) VALUES (?, ?, ?, ?)',
  ).run(clean.slice(0, 2000), String(source).slice(0, 64), String(actorId), sha256(clean));

  return { id: info.lastInsertRowid, text: clean, hash: sha256(clean), source, actor_id: String(actorId) };
}

export function listAvaMemory(limit = 20) {
  return getDb().prepare(
    "SELECT id, text, source, actor_id, hash, created_at FROM ava_memory WHERE status = 'active' ORDER BY id DESC LIMIT ?",
  ).all(Math.min(Math.max(Number(limit) || 20, 1), 100));
}

/** Prompt fragment that makes the current control state bind on AVA. */
export function avaControlBriefing(control = getAvaControl()) {
  const lines = [
    'AVA CONTROL STATE (persisted — this is your current configuration):',
    `- Operating lane: ${control.mode}. ${AVA_LANES[control.mode] || ''}`,
    `- Voice output: ${control.voice_enabled ? 'enabled' : 'disabled'}.`,
  ];

  if (control.directives.length) {
    lines.push('- Standing directives from the owner. Follow these within the primary law:');
    for (const d of control.directives) lines.push(`  • ${d.text} (set by ${d.set_by})`);
  } else {
    lines.push('- Standing directives: none.');
  }

  const memories = listAvaMemory(6);
  if (memories.length) {
    lines.push('- Recent durable memory:');
    for (const m of memories) lines.push(`  • ${m.text} [${m.source}]`);
  }

  return lines.join('\n');
}