# SB688 System Architecture

**JGA Enterprise · NODE: MENDOTA-IL · v2.1 — Day Zero Production**

## Overview

The SB688 National Resilience Console is a sovereign-grade infrastructure resilience platform
built on three foundational pillars: **detection**, **continuity**, and **provable recovery**.
It is designed to work across any critical-infrastructure sector — from healthcare and finance
to aerospace and industrial AI.

---

## Core Architectural Layers

### 1. Sovereign Spine

The Sovereign Spine is the central governance and orchestration authority. It maintains the
trusted record chain, evaluates system-wide health, and enforces constitutional protocols.
All state transitions flow through the Spine before being committed.

```
Sovereign Spine
├── Trusted Record Chain (append-only ledger)
├── HMAC Signature Engine (SHA3-256)
├── Protocol Namespace Registry (SB688-CORE / GOV / IND / SVRN / OPS)
└── Operator Authority Interface
```

### 2. Brick Stitch Protocol

Brick Stitch is the recovery-path knitting system. When a component fails, the Brick Stitch
engine evaluates all available checkpoints and weaves a new approved route around the failure.
Each stitch references a verified checkpoint; unverified stitches are invalid.

```
Brick Stitch Engine
├── Checkpoint Registry
├── Stitch Validator (verifies checkpoint signatures)
├── Route Weaver (constructs alternate paths)
└── Re-stitch Trigger (on checkpoint expiry)
```

### 3. Braid Continuity System

The system operates dual redundant braid strands — **Braid Alpha** and **Braid Beta** — that
carry system traffic in parallel. When Alpha is compromised or isolated, Beta assumes primary
continuity automatically. Dual-braid failure triggers sovereign lockdown.

```
Braid System
├── Braid Alpha — Primary continuity strand
└── Braid Beta  — Redundant continuity strand
```

### 4. Ghost Node Mesh

Ghost nodes are sovereign sensor nodes deployed at the mesh boundary. They absorb and log
suspicious probes without exposing the trusted core. Ghost node telemetry feeds the audit log
but has no write authority on the trusted chain.

```
Ghost Node Mesh
├── Mesh Boundary Sensors
├── Probe Absorbers (decoy endpoints)
├── Telemetry Emitter → Audit Log (read-only feed)
└── Anomaly Flagging Engine
```

### 5. Quarantine Subsystem

When a component is identified as compromised (via state hash mismatch or signature failure),
it is immediately detached from the trusted mesh, moved to a disposable quarantine container,
and terminated. Rebuild occurs only from a verified trusted checkpoint.

```
Quarantine Subsystem
├── Compromise Detector (hash mismatch / signature failure)
├── Mesh Detacher
├── Quarantine Sandbox
├── Termination Controller
└── Checkpoint Rebuilder
```

---

## Component Topology

```
┌────────────────────────────────────────────────────────────┐
│                     Sovereign Spine                        │
│              (Trusted Record · HMAC · Protocols)           │
└───────────────────────────┬────────────────────────────────┘
                            │
              ┌─────────────▼──────────────┐
              │        System Core         │
              │  (Central orchestration)   │
              └──────┬──────────────┬──────┘
                     │              │
          ┌──────────▼───┐   ┌──────▼──────────┐
          │ Exchange Net │   │  State Vault (FS)│
          │ (driver_net) │   │  (checkpoints)   │
          └────┬────┬────┘   └────────┬─────────┘
               │    │                 │
     ┌─────────▼┐  ┌▼──────────┐     │
     │Braid Alpha│  │Braid Beta │     │
     │(primary) │  │(redundant)│     │
     └─────┬────┘  └─────┬─────┘     │
           └──────┬───────┘           │
                  │                   │
          ┌───────▼───────────────────▼───┐
          │       Operator Console        │
          │        (user_app)             │
          └───────────────────────────────┘
```

---

## Frontend Architecture

**Stack:** React 18 · Vite · Tailwind CSS · Radix UI · TanStack Query

| Layer | Technology |
|---|---|
| Routing | React Router v6 |
| State Management | React local state + `useCallback` |
| UI Components | Radix UI primitives (shadcn/ui) |
| Charts | Recharts |
| Data Fetching | TanStack React Query |
| Platform | Base44 (serverless functions + auth) |

### Key Pages

| Route | Page | Purpose |
|---|---|---|
| `/` | Console | Primary SB688 operator console |
| `/sb688` | SB688Console | Dedicated SB688 control panel |
| `/jga-live` | JGALive | Live telemetry feed |
| `/observe` | PublicObserver | Read-only public view |
| `/ai-brain` | AIBrain | AI assistant interface |
| `/ai-gateway` | AIIntegrationGateway | AI integration control |
| `/braid-analytics` | BraidAnalytics | Braid strand analytics |
| `/quantum-braid` | QuantumBraidPower | Quantum braid visualization |

---

## Backend Architecture

**Stack:** Python 3.11+ · FastAPI · Pydantic · PyYAML · pytest

```
backend/
├── main.py          — FastAPI application entry point
├── engine.py        — SB688 resilience engine (Python port)
├── models.py        — Pydantic request/response models
└── __init__.py
```

### API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | System health check |
| `GET` | `/api/state` | Current system state |
| `POST` | `/api/state/init` | Initialize fresh system state |
| `POST` | `/api/scenario/load` | Load a resilience scenario |
| `POST` | `/api/scenario/simulate` | Simulate problem on loaded scenario |
| `POST` | `/api/recovery/run` | Execute smart recovery |
| `POST` | `/api/proof/run` | Run the proof suite |
| `POST` | `/api/proof/snapshot` | Generate verifiable proof snapshot |
| `GET` | `/api/industries` | List all supported industries |
| `GET` | `/api/scenarios` | List all available scenarios |
| `GET` | `/api/constitution` | Return parsed constitution |

---

## Serverless Functions (Base44 / Deno)

| Function | Path | Purpose |
|---|---|---|
| AI Brain | `base44/functions/aiBrain/entry.ts` | GPT-4o chat, email draft, task manager, voice |
| Daily System Report | `base44/functions/dailySystemReport/entry.ts` | Automated daily HTML email via Microsoft Graph |

---

## Security Architecture

| Mechanism | Implementation |
|---|---|
| HMAC Signatures | SHA3-256 deterministic hash, `sb688-hmac-{h1}-{h2}` format |
| Trusted Record Chain | Append-only, version-stamped, hash-linked |
| State Tamper Detection | Hash mismatch triggers quarantine |
| Ghost Nodes | Decoy endpoints that absorb and log probes |
| Quarantine | Compromised modules isolated before termination |
| Proof Suite | 5-point verifiable compliance proof per session |

---

## Compliance Alignment

| Framework | SB688 Coverage |
|---|---|
| HIPAA | Clinical data integrity + provable recovery |
| SOX / PCI | Transaction integrity + audit trail |
| FedRAMP / FISMA | Sovereign-grade recovery + trust chain |
| ISO 22301 | Business continuity with verifiable proof |
| FAA / Mission Auth | Flight-grade recovery + telemetry integrity |
