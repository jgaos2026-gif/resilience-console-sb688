# Getting Started with SB688 Resilience Console

**JGA Enterprise · NODE: MENDOTA-IL · v2.1 — Day Zero Production**

---

## Prerequisites

| Tool | Minimum Version | Purpose |
|---|---|---|
| Node.js | 18.x | Frontend build and dev server |
| npm | 9.x | Frontend package management |
| Python | 3.11 | Backend API server |
| pip | 23.x | Python package management |
| Git | 2.x | Version control |

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/jgaos2026-gif/resilience-console-sb688.git
cd resilience-console-sb688
```

### 2. Initialize the Environment

The `init.sh` script installs all dependencies and creates a starter `.env.local`:

```bash
chmod +x scripts/init.sh
./scripts/init.sh
```

Or set up manually:

```bash
# Frontend
npm install

# Backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_BASE44_APP_ID=your_base44_app_id
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
```

> **Where to find these values:**
> Log in to [Base44.com](https://base44.com), open your app, and copy the App ID
> and base URL from the project settings.

### 4. Start the Frontend

```bash
npm run dev
```

The console is available at [http://localhost:5173](http://localhost:5173).

### 5. Start the Backend (Optional)

```bash
source .venv/bin/activate
uvicorn backend.main:app --reload --port 8000
```

The backend API is available at [http://localhost:8000](http://localhost:8000).
Interactive API docs: [http://localhost:8000/docs](http://localhost:8000/docs).

---

## Project Structure

```
resilience-console-sb688/
├── backend/                — Python FastAPI backend
│   ├── __init__.py
│   ├── engine.py           — SB688 resilience engine
│   ├── main.py             — FastAPI application
│   └── models.py           — Pydantic models
├── base44/
│   └── functions/          — Deno serverless functions
│       ├── aiBrain/        — AI Brain (GPT-4o, voice, email, tasks)
│       └── dailySystemReport/ — Automated daily report emailer
├── config/
│   ├── config.yaml         — System configuration
│   └── constitution.yaml   — Sovereign governance constitution
├── docs/                   — Documentation
│   ├── architecture.md
│   ├── changelog.md
│   ├── contributing.md
│   ├── getting-started.md  — This file
│   └── overview.md
├── scripts/
│   └── init.sh             — Environment bootstrap
├── src/                    — React frontend
│   ├── api/                — Base44 client
│   ├── components/         — UI components
│   ├── hooks/              — Custom hooks
│   ├── lib/                — Engine, auth, utilities
│   └── pages/              — Page components
└── tests/                  — Python backend tests
    ├── __init__.py
    └── test_sovereign_stitch.py
```

---

## Running Tests

### Frontend Linting

```bash
npm run lint
```

### Backend Tests

```bash
source .venv/bin/activate
pytest tests/ -v
```

---

## Key URLs (Development)

| Service | URL |
|---|---|
| Frontend (Vite) | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |

---

## Console Navigation

| Route | Description |
|---|---|
| `/` | Primary SB688 Operator Console — full tab interface |
| `/sb688` | Dedicated SB688 control panel |
| `/observe` | Public read-only observer view |
| `/jga-live` | Live JGA telemetry feed |
| `/jga-story` | JGA project story and history |
| `/braid-analytics` | Braid strand analytics |
| `/whitepaper-timeline` | White paper version timeline |
| `/how-it-works` | Technical explainer |
| `/industry-comparison` | Side-by-side industry profiles |
| `/ai-brain` | AI assistant interface |
| `/ai-gateway` | AI integration gateway |
| `/quantum-braid` | Quantum braid power visualization |

---

## Publishing Changes

After making changes locally, push to GitHub. The Base44 platform automatically
syncs with the repository. To publish to production:

1. Open [Base44.com](https://base44.com)
2. Navigate to your app
3. Click **Publish**

---

## Support

- Documentation: [https://docs.base44.com](https://docs.base44.com)
- Support: [https://app.base44.com/support](https://app.base44.com/support)
- JGA Enterprise: See `docs/contributing.md`
