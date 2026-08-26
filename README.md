# Resilience Console SB688

**Hardened operational system founded on braided computational topology.**

Braid group B₇ · SHA-256 hash-chains · Alexander polynomial invariants · Triple-mark verification · Append-only audit ledger

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Vite/React)              │
│   OperationsCenter · NodeMesh · VerificationGates   │
│   SystemSpine · MemoryBraid · ProofVault · AVA       │
└──────────────────────┬──────────────────────────────┘
                       │ fetch + JWT bearer
┌──────────────────────▼──────────────────────────────┐
│           Backend (Express + SQLite)                 │
│   /api/health  /api/spine   /api/nodes              │
│   /api/verification   /api/proof   /api/reports     │
│   /api/recovery   /api/auth                         │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│       Braided Topology Engine                       │
│   Braid group Bₙ generators σᵢ^±1                  │
│   SHA-256 block hash-chains                         │
│   Burau representation (reduced)                    │
│   Alexander polynomial invariant fingerprint        │
│   Append-only SQLite ledger + JSONL audit log       │
└─────────────────────────────────────────────────────┘
```

## Prerequisites

- Node.js 20+
- (Optional) Docker + Docker Compose

## Setup

```bash
# 1. Clone
git clone https://github.com/jgaos2026-gif/resilience-console-sb688.git
cd resilience-console-sb688

# 2. Copy env and fill in secrets
cp .env.example .env.local
# Edit .env.local — set JWT_SECRET and ADMIN_PASSWORD

# 3. Install all deps
npm install
cd server && npm install && cd ..

# 4. Run (frontend + backend concurrently)
npm run dev
# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
```

## Docker

```bash
cp .env.example .env
# Edit .env
docker compose up --build
```

## API Routes

| Route | Auth | Description |
|-------|------|-------------|
| POST /api/auth/login | public | Obtain JWT token |
| GET  /api/health | public | System health + strand utilization |
| GET  /api/spine | ✓ | Spine state + braid verification |
| GET  /api/nodes | ✓ | All node states with invariants |
| POST /api/nodes/:id/append | ✓ | Append a braid block |
| GET  /api/verification | ✓ | State items pipeline |
| POST /api/verification | ✓ | Inject new state item |
| POST /api/verification/:id/advance | ✓ | Run triple-mark verification |
| GET  /api/proof | ✓ | Proof records |
| POST /api/proof/generate | ✓ | Generate certified proof packet |
| GET  /api/proof/:id/verify | ✓ | Verify topology preservation |
| GET  /api/reports | ✓ | Daily system reports |
| POST /api/reports/generate | ✓ | Snapshot current state |
| GET  /api/recovery/scan | ✓ | Detect braid anomalies |
| POST /api/recovery/run | ✓ (operator+) | Phoenix recovery |
| GET  /api/supabase/status | ✓ | Verify hardened Supabase connectivity |
| GET  /api/supabase/http-test-readiness | ✓ (operator+) | Check whether hard HTTP readiness gates have passed |
| POST /api/supabase/field-simulations | ✓ (operator+) | Run hard field simulations before declaring readiness |
| POST /api/supabase/push | ✓ (operator+) | Push a controlled sync event to Supabase |

## Braided Computational Topology

Every state transition is encoded as a crossing event in braid group B₇:

- **σᵢ** — strand i crosses over strand i+1 (positive crossing)
- **σᵢ⁻¹** — strand i crosses under strand i+1 (negative crossing)
- Each data block derives its generator from `SHA-256(data + prevHash)[0:2]`
- The braid word (σ₁σ₃⁻¹σ₂σ₅…) is the verifiable proof sequence
- The **Alexander polynomial** fingerprint (Burau representation at t=0.3, t=0.7)
  is recomputed on every verification — if topology is tampered, the invariant drifts
- Integrity = 100% only if all block hashes are valid AND invariant is stable

## Audit Log

All events are appended to `server/logs/audit.jsonl` — never overwritten, never deleted.

```jsonc
{"ts":"2026-08-13T05:44:00.000Z","action":"login_success","actorId":"admin","ip":"127.0.0.1","role":"admin"}
{"ts":"2026-08-13T05:44:01.000Z","action":"verification","actorId":"1","itemId":3,"result":"PASS","nextStage":"trusted"}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | ✅ | Minimum 32-char secret for JWT signing |
| `ADMIN_PASSWORD` | ✅ | Admin login password, minimum 12 characters |
| `PORT` | optional | Backend port (default 3001) |
| `DB_PATH` | optional | SQLite DB path (default ./data/resilience.db) |
| `FRONTEND_ORIGIN` | optional | CORS origin (default http://localhost:5173) |
| `VITE_API_BASE_URL` | optional | Frontend API base (default http://localhost:3001) |
| `ALLOW_DEV_AUTH_BYPASS` | optional | Set `true` only for local development when intentionally bypassing JWT auth |
| `SUPABASE_URL` | optional | Supabase project URL, must be paired with `SUPABASE_SERVICE_ROLE_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY` | optional | Service-role key used only by the backend for controlled sync writes |
| `SUPABASE_SCHEMA` | optional | Supabase schema for sync events (default `public`) |
| `SUPABASE_EVENTS_TABLE` | optional | Supabase table for sync events (default `sb688_sync_events`) |

## Supabase Backend

The backend can verify and push controlled sync events into Supabase when the service-role credentials are configured.

- `GET /api/supabase/status` checks whether the configured schema and table are reachable
- `GET /api/supabase/http-test-readiness` combines upstream verification with hard dry-run guard checks
- `POST /api/supabase/field-simulations` runs hard simulations, including oversized-payload and system-field tamper attempts
- `POST /api/supabase/push` writes a bounded JSON payload through the backend after auth, role checks, and rate limiting
- If either Supabase credential is missing, the integration fails closed and reports `configured: false`

Recommended Supabase table:

```sql
create table if not exists public.sb688_sync_events (
  id bigint generated by default as identity primary key,
  event_type text not null,
  actor_id text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);
```
