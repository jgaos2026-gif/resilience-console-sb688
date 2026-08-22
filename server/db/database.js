/**
 * database.js — SQLite schema init and singleton accessor
 */
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { genesisBlock } from '../services/braidEngine.js';

let _db = null;
export function getDb() { if (!_db) throw new Error('Database not initialized. Call initDb() first.'); return _db; }

export function initDb(dbPath) {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  _db = new Database(dbPath);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  _db.exec(`
    CREATE TABLE IF NOT EXISTS spine_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT, event_type TEXT NOT NULL,
      data TEXT NOT NULL DEFAULT '{}', actor_id TEXT NOT NULL DEFAULT 'system',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS node_states (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL DEFAULT 'system', status TEXT NOT NULL DEFAULT 'active',
      braid_chain TEXT NOT NULL DEFAULT '[]', last_verified TEXT,
      meta TEXT NOT NULL DEFAULT '{}', updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS verification_gates (
      id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'system', risk_score REAL NOT NULL DEFAULT 0,
      current_stage TEXT NOT NULL DEFAULT 'input', gate_result TEXT,
      marks_passed TEXT NOT NULL DEFAULT '[]', mark_errors TEXT NOT NULL DEFAULT '[]',
      quarantine_count INTEGER NOT NULL DEFAULT 0, braid_chain TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS trust_decisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      phase TEXT NOT NULL CHECK(phase IN ('verification','validation','certification')),
      actor_id TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      result TEXT NOT NULL CHECK(result IN ('pass','fail')),
      evidence_json TEXT NOT NULL DEFAULT '{}',
      prev_hash TEXT NOT NULL,
      decision_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(item_id, phase),
      FOREIGN KEY(item_id) REFERENCES verification_gates(id)
    );
    CREATE TRIGGER IF NOT EXISTS trust_decisions_no_update
      BEFORE UPDATE ON trust_decisions BEGIN SELECT RAISE(ABORT, 'trust_decisions is append-only'); END;
    CREATE TRIGGER IF NOT EXISTS trust_decisions_no_delete
      BEFORE DELETE ON trust_decisions BEGIN SELECT RAISE(ABORT, 'trust_decisions is append-only'); END;

    CREATE TABLE IF NOT EXISTS proof_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'system', status TEXT NOT NULL DEFAULT 'pending',
      hash TEXT NOT NULL, chain_index INTEGER NOT NULL DEFAULT 0,
      invariant TEXT NOT NULL DEFAULT '{}', visibility TEXT NOT NULL DEFAULT 'internal',
      notes TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS daily_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT, report_date TEXT NOT NULL UNIQUE,
      spine_health REAL NOT NULL DEFAULT 100, nodes_active INTEGER NOT NULL DEFAULT 0,
      nodes_total INTEGER NOT NULL DEFAULT 0, trusted_states INTEGER NOT NULL DEFAULT 0,
      rejected_states INTEGER NOT NULL DEFAULT 0, recovery_count INTEGER NOT NULL DEFAULT 0,
      chain_length INTEGER NOT NULL DEFAULT 0, integrity_pct REAL NOT NULL DEFAULT 100,
      invariant TEXT NOT NULL DEFAULT '{}', summary TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'operator',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  seed(_db);
  return _db;
}

function seed(db) {
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!existing) db.prepare(`INSERT INTO users (username,password_hash,role) VALUES (?,?,'admin')`).run('admin','CHANGEME_SET_AT_BOOT');
  const coreNodes = [
    ['Sovereign Stitch (SB688)','security'], ['Guarded Runtime (SB689)','security'],
    ['Möbius Loop (SB712)','recovery'], ['Omega Gate','security'], ['JGA-OS','business'],
    ['AVA Shell','ai'], ['Phoenix Recovery','recovery'], ['Memory Braid','memory'],
    ['Proof Ledger','compliance'], ['RAM-Guard','security'],
  ];
  for (const [name, category] of coreNodes) {
    if (!db.prepare('SELECT id FROM node_states WHERE name=?').get(name)) {
      const genesis = genesisBlock(`NODE_INIT:${name}:${category}`);
      db.prepare(`INSERT INTO node_states(name,category,status,braid_chain,last_verified) VALUES (?,?,'active',?,datetime('now'))`).run(name,category,JSON.stringify([genesis]));
    }
  }
}
