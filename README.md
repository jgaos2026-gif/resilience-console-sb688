# SB688 National Resilience Console

**JGA Enterprise · NODE: MENDOTA-IL · v2.1 — Day Zero Production (BSS-2026-PROD-01)**

> *"Don't ever let anyone tell you that you can't, when you know damn well you can."*
> — John E. Arenz · Markham to Mendota · 1981 → ∞

---

## Overview

SB688 is a sovereign-grade infrastructure resilience platform. It detects failures fast, reroutes
automatically through verified alternate paths, restores from trusted checkpoints, and **proves**
every recovery step to auditors and regulators — across healthcare, finance, manufacturing,
government, aerospace, industrial AI, and more.

See [`docs/overview.md`](docs/overview.md) for the full system overview.

---

## Repository Structure

```
resilience-console-sb688/
├── backend/                 — Python FastAPI backend (SB688 engine API)
│   ├── __init__.py
│   ├── engine.py            — Resilience engine (Python port of sb688Engine.js)
│   ├── main.py              — FastAPI application entry point
│   └── models.py            — Pydantic request/response models
├── base44/
│   └── functions/           — Deno serverless functions (Base44 platform)
│       ├── aiBrain/         — AI Brain (GPT-4o, voice transcription, email, tasks)
│       └── dailySystemReport/ — Automated daily HTML email via Microsoft Graph
├── config/
│   ├── config.yaml          — System configuration
│   └── constitution.yaml    — Sovereign governance constitution (10 articles)
├── docs/
│   ├── architecture.md      — Full system architecture
│   ├── changelog.md         — Version history
│   ├── contributing.md      — Contribution guidelines
│   ├── getting-started.md   — Setup instructions
│   └── overview.md          — System overview
├── scripts/
│   └── init.sh              — Environment bootstrap script
├── src/                     — React frontend (Vite + Tailwind + Radix UI)
│   ├── api/                 — Base44 client
│   ├── components/          — UI components (ui/ and sb688/ subsets)
│   ├── hooks/               — Custom React hooks
│   ├── lib/                 — Engine, auth, utilities
│   └── pages/               — Route-level page components
└── tests/                   — Python backend tests (pytest)
    ├── __init__.py
    └── test_sovereign_stitch.py
```

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/jgaos2026-gif/resilience-console-sb688.git
cd resilience-console-sb688

# 2. Bootstrap (installs frontend + backend deps, creates .env.local)
chmod +x scripts/init.sh && ./scripts/init.sh

# 3. Add your Base44 credentials to .env.local
#    VITE_BASE44_APP_ID=your_app_id
#    VITE_BASE44_APP_BASE_URL=https://your-app.base44.app

# 4. Start the frontend
npm run dev

# 5. Start the backend (optional)
source .venv/bin/activate
uvicorn backend.main:app --reload --port 8000
```

See [`docs/getting-started.md`](docs/getting-started.md) for detailed instructions.

---

## Frontend

| Command | Description |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint with ESLint |
| `npm run lint:fix` | Auto-fix lint issues |

**Environment variables (`.env.local`):**

```env
VITE_BASE44_APP_ID=your_base44_app_id
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
```

---

## Backend

| Command | Description |
|---|---|
| `pip install -r requirements.txt` | Install Python deps |
| `uvicorn backend.main:app --reload --port 8000` | Start API server |
| `pytest tests/ -v` | Run test suite |

**API endpoints:** `GET /health` · `POST /api/state/init` · `POST /api/scenario/load` ·
`POST /api/scenario/simulate` · `POST /api/recovery/run` · `POST /api/proof/run`

Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Protocol Namespaces (20 Sealed Protocols)

| Namespace | Description |
|---|---|
| `SB688-CORE` | Resilience Engine, HMAC, Merkle Stitch, Ghost Node, Quarantine |
| `SB688-GOV` | Governance Reports, Proof Suite, Policy DSL, Industry Layer |
| `SB688-IND` | Industry-specific resilience overlays |
| `SB688-SVRN` | 1211 Auth, Triple-Braid, Clipping, Ledger, Kill/Resurrect |
| `SB688-OPS` | Daily Report, Observer Mode, White Paper Archive, Prod Seal |

---

## Documentation

| Doc | Description |
|---|---|
| [`docs/overview.md`](docs/overview.md) | System overview and capabilities |
| [`docs/architecture.md`](docs/architecture.md) | Full technical architecture |
| [`docs/getting-started.md`](docs/getting-started.md) | Setup and first run |
| [`docs/contributing.md`](docs/contributing.md) | Contribution guidelines |
| [`docs/changelog.md`](docs/changelog.md) | Version history |

---

## Base44 Platform

This project runs on [Base44.com](https://base44.com). Changes pushed to this repository
are automatically reflected in the Base44 Builder. To publish to production, open Base44
and click **Publish**.

- Documentation: [https://docs.base44.com](https://docs.base44.com)
- Support: [https://app.base44.com/support](https://app.base44.com/support)

