"""
SB688 Resilience Console — Pydantic Models
JGA Enterprise · NODE: MENDOTA-IL · v2.1
"""

from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel, Field


# ── Request models ─────────────────────────────────────────────────────────────


class InitStateRequest(BaseModel):
    industry: str = Field(default="universal", description="Industry overlay to apply on init")


class LoadScenarioRequest(BaseModel):
    state: dict[str, Any] = Field(..., description="Current system state")
    scenario_id: str = Field(..., description="Scenario identifier from the scenarios registry")


class SimulateProblemRequest(BaseModel):
    state: dict[str, Any] = Field(..., description="Current system state with a loaded scenario")


class RunRecoveryRequest(BaseModel):
    state: dict[str, Any] = Field(..., description="Current system state (post-simulation)")


class RunProofSuiteRequest(BaseModel):
    state: dict[str, Any] = Field(..., description="Current system state to prove")


class FactoryResetRequest(BaseModel):
    industry: str = Field(default="universal", description="Industry to reset to")


# ── Response models ────────────────────────────────────────────────────────────


class HealthResponse(BaseModel):
    status: str = "ok"
    system: str = "SB688 National Resilience Console"
    version: str = "2.1"
    build: str = "BSS-2026-PROD-01"
    node: str = "MENDOTA-IL"


class StateResponse(BaseModel):
    state: dict[str, Any]


class IndustriesResponse(BaseModel):
    industries: dict[str, Any]


class ScenariosResponse(BaseModel):
    scenarios: dict[str, Any]


class ConstitutionResponse(BaseModel):
    constitution: dict[str, Any]


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
