/**
 * database.js — SQLite schema init and singleton accessor
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import {
  genesisBlock, appendBlock, STRAND_COUNT,
} from '../services/braidEngine.js';

let _db = null;

export function getDb() {
  if (!_db) throw new Error('Database not initialized. Call initDb() first.');
  return _db;
}

export function initDb(dbPath) {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  _db = new Database(dbPath);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  _db.exec(`
    -- ── Spine Events (append-only ledger) ───────────────────────────────
    CREATE TABLE IF NOT EXISTS spine_events (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type  TEXT    NOT NULL,
      data        TEXT    NOT NULL DEFAULT '{}',
      actor_id    TEXT    NOT NULL DEFAULT 'system',
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ── Node States ──────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS node_states (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL UNIQUE,
      category      TEXT    NOT NULL DEFAULT 'system',
      status        TEXT    NOT NULL DEFAULT 'active',
      braid_chain   TEXT    NOT NULL DEFAULT '[]',
      last_verified TEXT,
      meta          TEXT    NOT NULL DEFAULT '{}',
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ── Verification Gates (state items pipeline) ────────────────────────
    CREATE TABLE IF NOT EXISTS verification_gates (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      data             TEXT    NOT NULL,
      source           TEXT    NOT NULL DEFAULT 'system',
      risk_score       REAL    NOT NULL DEFAULT 0,
      current_stage    TEXT    NOT NULL DEFAULT 'input',
      gate_result      TEXT,
      marks_passed     TEXT    NOT NULL DEFAULT '[]',
      mark_errors      TEXT    NOT NULL DEFAULT '[]',
      quarantine_count INTEGER NOT NULL DEFAULT 0,
      braid_chain      TEXT    NOT NULL DEFAULT '[]',
      created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ── Proof Records (proof vault) ──────────────────────────────────────
    CREATE TABLE IF NOT EXISTS proof_records (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      title         TEXT    NOT NULL,
      category      TEXT    NOT NULL DEFAULT 'system',
      status        TEXT    NOT NULL DEFAULT 'pending',
      hash          TEXT    NOT NULL,
      chain_index   INTEGER NOT NULL DEFAULT 0,
      invariant     TEXT    NOT NULL DEFAULT '{}',
      visibility    TEXT    NOT NULL DEFAULT 'internal',
      notes         TEXT,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ── Daily Reports ────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS daily_reports (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      report_date     TEXT    NOT NULL UNIQUE,
      spine_health    REAL    NOT NULL DEFAULT 100,
      nodes_active    INTEGER NOT NULL DEFAULT 0,
      nodes_total     INTEGER NOT NULL DEFAULT 0,
      trusted_states  INTEGER NOT NULL DEFAULT 0,
      rejected_states INTEGER NOT NULL DEFAULT 0,
      recovery_count  INTEGER NOT NULL DEFAULT 0,
      chain_length    INTEGER NOT NULL DEFAULT 0,
      integrity_pct   REAL    NOT NULL DEFAULT 100,
      invariant       TEXT    NOT NULL DEFAULT '{}',
      summary         TEXT,
      created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ── Users (JWT auth) ─────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS users (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      username     TEXT    NOT NULL UNIQUE,
      password_hash TEXT   NOT NULL,
      role         TEXT    NOT NULL DEFAULT 'operator',
      created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  seed(_db);
  return _db;
}

// ── Seed ──────────────────────────────────────────────────────────────────────

function seed(db) {
  // Default admin user (password set via env JWT_ADMIN_PASS_HASH or skipped if already exists)
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!existing) {
    // bcrypt hash for "changeme" — operator must change on first boot
    // We store the placeholder — actual hash injected at server start via bcrypt
    db.prepare(`INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')`)
      .run('admin', 'CHANGEME_SET_AT_BOOT');
  }

  // Seed initial node states with real braid chains
  const coreNodes = [
    { name: 'Sovereign Stitch (SB688)', category: 'security' },
    { name: 'Guarded Runtime (SB689)',  category: 'security' },
    { name: 'Möbius Loop (SB712)',      category: 'recovery' },
    { name: 'Omega Gate',               category: 'security' },
    { name: 'JGA-OS',                   category: 'business' },
    { name: 'AVA Shell',                category: 'ai'       },
    { name: 'Phoenix Recovery',         category: 'recovery' },
    { name: 'Memory Braid',             category: 'memory'   },
    { name: 'Proof Ledger',             category: 'compliance' },
    { name: 'RAM-Guard',                category: 'security' },
  ];

  for (const node of coreNodes) {
    const exists = db.prepare('SELECT id FROM node_states WHERE name = ?').get(node.name);
    if (!exists) {
      const genesis = genesisBlock(`NODE_INIT:${node.name}:${node.category}`);
      db.prepare(`
        INSERT INTO node_states (name, category, status, braid_chain, last_verified)
        VALUES (?, ?, 'active', ?, datetime('now'))
      `).run(node.name, node.category, JSON.stringify([genesis]));
    }
  }
}
