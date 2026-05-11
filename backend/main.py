"""
SB688 Resilience Console — FastAPI Application
JGA Enterprise · NODE: MENDOTA-IL · v2.1

Run:
    uvicorn backend.main:app --reload --port 8000
"""

from __future__ import annotations

import os
from pathlib import Path

import yaml
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.engine import (
    INDUSTRIES,
    SCENARIOS,
    create_initial_state,
    factory_reset,
    load_scenario,
    run_proof_suite,
    run_recovery,
    simulate_problem,
)
from backend.models import (
    ConstitutionResponse,
    ErrorResponse,
    FactoryResetRequest,
    HealthResponse,
    IndustriesResponse,
    InitStateRequest,
    LoadScenarioRequest,
    RunProofSuiteRequest,
    RunRecoveryRequest,
    ScenariosResponse,
    SimulateProblemRequest,
    StateResponse,
)

# ── App setup ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="SB688 Resilience Console API",
    description="Sovereign-grade infrastructure resilience backend — JGA Enterprise · NODE: MENDOTA-IL",
    version="2.1.0",
    contact={"name": "JGA Enterprise", "url": "https://github.com/jgaos2026-gif/resilience-console-sb688"},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_REPO_ROOT = Path(__file__).parent.parent
_CONSTITUTION_PATH = _REPO_ROOT / "config" / "constitution.yaml"

# ── Routes ─────────────────────────────────────────────────────────────────────


@app.get("/health", response_model=HealthResponse, tags=["System"])
def health() -> HealthResponse:
    """System health check."""
    return HealthResponse()


@app.get("/api/industries", response_model=IndustriesResponse, tags=["Reference"])
def list_industries() -> IndustriesResponse:
    """Return all supported industry definitions."""
    return IndustriesResponse(industries=INDUSTRIES)


@app.get("/api/scenarios", response_model=ScenariosResponse, tags=["Reference"])
def list_scenarios() -> ScenariosResponse:
    """Return all available resilience scenarios."""
    return ScenariosResponse(scenarios=SCENARIOS)


@app.get("/api/constitution", response_model=ConstitutionResponse, tags=["Reference"])
def get_constitution() -> ConstitutionResponse:
    """Return the parsed sovereign constitution."""
    if not _CONSTITUTION_PATH.exists():
        raise HTTPException(status_code=404, detail="constitution.yaml not found")
    with _CONSTITUTION_PATH.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    return ConstitutionResponse(constitution=data)


@app.post("/api/state/init", response_model=StateResponse, tags=["Engine"])
def init_state(req: InitStateRequest) -> StateResponse:
    """Initialize a fresh system state for the given industry."""
    state = factory_reset(req.industry)
    return StateResponse(state=state)


@app.post("/api/scenario/load", response_model=StateResponse, tags=["Engine"])
def api_load_scenario(req: LoadScenarioRequest) -> StateResponse:
    """Load a resilience scenario into the provided state."""
    if req.scenario_id not in SCENARIOS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown scenario '{req.scenario_id}'. Valid: {list(SCENARIOS.keys())}",
        )
    new_state = load_scenario(req.state, req.scenario_id)
    return StateResponse(state=new_state)


@app.post("/api/scenario/simulate", response_model=StateResponse, tags=["Engine"])
def api_simulate_problem(req: SimulateProblemRequest) -> StateResponse:
    """Simulate the loaded scenario's failure on the provided state."""
    if not req.state.get("scenarioLoaded"):
        raise HTTPException(status_code=400, detail="No scenario loaded. Call /api/scenario/load first.")
    new_state = simulate_problem(req.state)
    return StateResponse(state=new_state)


@app.post("/api/recovery/run", response_model=StateResponse, tags=["Engine"])
def api_run_recovery(req: RunRecoveryRequest) -> StateResponse:
    """Execute smart recovery on the provided state."""
    new_state = run_recovery(req.state)
    return StateResponse(state=new_state)


@app.post("/api/proof/run", response_model=StateResponse, tags=["Engine"])
def api_run_proof_suite(req: RunProofSuiteRequest) -> StateResponse:
    """Run the 5-point proof suite against the provided state."""
    new_state = run_proof_suite(req.state)
    return StateResponse(state=new_state)


@app.post("/api/state/reset", response_model=StateResponse, tags=["Engine"])
def api_factory_reset(req: FactoryResetRequest) -> StateResponse:
    """Factory-reset the system state for the given industry."""
    state = factory_reset(req.industry)
    return StateResponse(state=state)
