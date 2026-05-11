# Changelog

All notable changes to the SB688 Resilience Console are documented here.

---

## [2.1.0] — 2026-04-27 — Day Zero Production (BSS-2026-PROD-01)

### Added
- **Backend:** Python FastAPI backend (`backend/`) with full SB688 engine port
- **Config:** `config/config.yaml` and `config/constitution.yaml` — sovereign governance layer
- **Docs:** Full documentation suite (`docs/`) aligned with sb689 structure
- **Tests:** pytest suite with `tests/test_sovereign_stitch.py` covering core engine logic
- **Scripts:** `scripts/init.sh` environment bootstrap script
- **Sovereign Spine HUD:** Live sovereign spine health-up display
- **Historical Replay:** Braid replay with event timeline scrubbing
- **Compliance Report Tab:** Regulatory compliance summary with proof signatures
- **Predictive Intelligence Tab:** AI-powered risk forecasting panel
- **Verifiable Proof Snapshot:** Exportable signed proof record
- **Builder Attribution Panel:** Architect and build provenance record
- **Ghost Node Panel:** Real-time ghost node telemetry display
- **Quarantine Panel:** Active quarantine status and management
- **Security Posture Panel:** Security posture overview
- **Policy Sandbox Tab:** Live policy DSL authoring and testing
- **Live Capability Demo:** Guided interactive demonstration mode

### Changed
- Ledger sealed at genesis hash — NODE: MENDOTA-IL — April 27, 2026
- 20 protocols sealed across all five namespaces
- README updated to reflect full monorepo structure

---

## [2.0.0] — 2026-03-15

### Added
- **Sovereign Guardian:** Constitutional authority enforcement layer
- **AI Mission Analyst:** GPT-4o powered resilience analyst panel
- **AI Scenario Narrator:** Natural-language scenario walkthroughs
- **Brick Stitch Tab:** Visual brick-stitch recovery graph
- **Recovery Architecture Tab:** Deep-dive recovery flow documentation
- **Event Timeline:** Chronological incident and recovery timeline
- **Resilience Dashboard:** KPI aggregation and trend charts
- **Governance Report Panel:** Signed governance report generator and viewer
- **Daily System Report:** Automated email via Microsoft Graph / Outlook
- **AI Brain function:** Full multi-mode AI assistant (chat, email, document, tasks, voice)
- **Braid Replay:** Session snapshot capture and timeline replay

### Changed
- Proof suite extended from 3 to 5 verifiable checks
- Resilience score algorithm updated to reflect dual-braid weight

---

## [1.2.0] — 2026-02-10

### Added
- Proof Suite with HMAC-style signature generation
- Governance report export (JSON + localStorage persistence)
- Industry overlay system (8 industry profiles)
- Scenario library (10 resilience scenarios)

---

## [1.1.0] — 2026-01-20

### Added
- Topology Map with live component status visualization
- Route Inspector with primary/alternate path display
- Trusted Record Log with version-stamped entries
- KPI Strip with resilience and continuity scores

---

## [1.0.0] — 2026-01-05 — Initial Release (v0.1 Alpha)

### Added
- SB688 engine core: `createInitialState`, `loadScenario`, `simulateProblem`, `runRecovery`
- React frontend with Vite + Tailwind + Radix UI
- Base44 platform integration (auth, serverless functions)
- Control Panel with scenario select, problem simulation, and smart recovery
- Component list with health status indicators
