# Contributing to SB688 Resilience Console

Thank you for contributing to the SB688 National Resilience Console.
Please read this guide before submitting changes.

---

## Governance

All contributions operate under the **SB688 Sovereign Constitution** (`config/constitution.yaml`).
Key principles that affect contributions:

- **CONST-01:** State changes must be cryptographically signed.
- **CONST-05:** Governance reports require proof suite validation.
- **CONST-10:** Recovery logic must remain provable.

If your change touches the engine, proof suite, or trusted chain, it requires a test.

---

## Repository Structure

```
resilience-console-sb688/
├── backend/            — Python FastAPI backend
├── base44/functions/   — Deno serverless functions (Base44 platform)
├── config/             — YAML configuration and constitution
├── docs/               — Documentation
├── scripts/            — Setup and operational scripts
├── src/                — React frontend (Vite)
│   ├── api/            — Base44 client
│   ├── components/     — UI components (ui/ and sb688/ subsets)
│   ├── hooks/          — Custom React hooks
│   ├── lib/            — Engine, auth, utilities
│   └── pages/          — Route-level page components
└── tests/              — Python pytest tests (backend)
```

---

## Frontend (React)

### Setup

```bash
npm install
cp .env.example .env.local   # add VITE_BASE44_APP_ID and VITE_BASE44_APP_BASE_URL
npm run dev
```

### Conventions

- Components live in `src/components/sb688/` (SB688-specific) or `src/components/ui/` (shared primitives).
- New pages go in `src/pages/` and must be registered in `src/App.jsx`.
- Use the `cn()` utility from `src/lib/utils.js` for conditional class merging.
- The shared `Button` component supports `asChild` (Radix Slot) for rendering links with button styles.
- Engine logic belongs in `src/lib/sb688Engine.js` — do not duplicate state logic in components.
- Keep component files under 300 lines; extract sub-components when larger.

### Linting

```bash
npm run lint          # check
npm run lint:fix      # auto-fix
```

---

## Backend (Python)

### Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r ../requirements.txt
uvicorn main:app --reload --port 8000
```

### Conventions

- Engine logic lives in `backend/engine.py` and must mirror `src/lib/sb688Engine.js` semantics.
- All request/response shapes are defined as Pydantic models in `backend/models.py`.
- No business logic in `backend/main.py` — route handlers delegate to `engine.py`.
- Use type hints on all function signatures.

### Running Tests

```bash
pytest tests/ -v
```

Tests live in `tests/`. File names must start with `test_`. Every engine function that modifies
state must have at least one test.

---

## Pull Request Guidelines

1. **Branch naming:** `feat/<short-description>`, `fix/<short-description>`, `docs/<short-description>`
2. **PR title:** Imperative mood — "Add quarantine panel UI", not "Added quarantine panel UI"
3. **Tests required** for any backend engine change.
4. **Linting must pass** (`npm run lint`) before merge.
5. **Update `docs/changelog.md`** under the `[Unreleased]` section.
6. Reference the relevant constitutional article if your change touches governance logic.

---

## Commit Message Format

```
<type>(<scope>): <short summary>

Types: feat | fix | docs | refactor | test | chore
Scopes: engine | ui | backend | docs | config | scripts | tests

Examples:
  feat(engine): add ghost_probe scenario to SCENARIOS registry
  fix(ui): correct braid replay snapshot timestamp format
  docs(architecture): update topology diagram with quarantine subsystem
  test(backend): add sovereign stitch isolation recovery test
```

---

## Security

- Never commit secrets, tokens, or API keys.
- Do not weaken HMAC signature logic — see CONST-01 and CONST-09.
- Ghost node telemetry must remain read-only — see CONST-03.
- Any change to the quarantine subsystem requires review by the sovereign architect.

---

## Questions

Open an issue or contact JGA Enterprise directly.
