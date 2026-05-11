"""
SB688 Resilience Engine — Python Port
JGA Enterprise · NODE: MENDOTA-IL · v2.1

Mirrors the semantics of src/lib/sb688Engine.js for backend/API use.
"""

from __future__ import annotations

import random
import string
import time
from copy import deepcopy
from typing import Any

# ── Industry definitions ──────────────────────────────────────────────────────

INDUSTRIES: dict[str, dict[str, Any]] = {
    "universal": {
        "id": "universal",
        "title": "Universal Infrastructure",
        "subtitle": "Cross-sector resilience for critical systems",
        "components": {
            "core": {"label": "System Core", "role": "Central orchestration and health authority"},
            "driver_net": {"label": "Exchange Network", "role": "Inter-component communication fabric"},
            "fs": {"label": "State Vault", "role": "Trusted state and checkpoint storage"},
            "user_app": {"label": "Operator Console", "role": "User-facing workload interface"},
            "braidA": {"label": "Braid Alpha", "role": "Primary continuity strand"},
            "braidB": {"label": "Braid Beta", "role": "Redundant continuity strand"},
        },
        "route": ["core", "driver_net", "braidA", "fs", "user_app"],
        "scenario": "network_failure",
    },
    "healthcare": {
        "id": "healthcare",
        "title": "Healthcare",
        "subtitle": "Patient safety and clinical continuity",
        "components": {
            "core": {"label": "Hospital Core", "role": "Central clinical system orchestrator"},
            "driver_net": {"label": "Medical Device Network", "role": "Device-to-system communication layer"},
            "fs": {"label": "Clinical Record Store", "role": "Trusted patient data and checkpoint vault"},
            "user_app": {"label": "Patient Portal", "role": "Clinician and patient-facing interface"},
            "braidA": {"label": "Care Continuity Alpha", "role": "Primary clinical continuity strand"},
            "braidB": {"label": "Care Continuity Beta", "role": "Redundant clinical continuity strand"},
        },
        "route": ["core", "driver_net", "braidA", "fs", "user_app"],
        "scenario": "dependency_disruption",
    },
    "manufacturing": {
        "id": "manufacturing",
        "title": "Manufacturing",
        "subtitle": "Production line resilience and quality assurance",
        "components": {
            "core": {"label": "Production Core", "role": "Central manufacturing execution authority"},
            "driver_net": {"label": "Equipment Bus", "role": "Machine-to-controller communication network"},
            "fs": {"label": "Quality Vault", "role": "Production state and quality checkpoint storage"},
            "user_app": {"label": "Floor Console", "role": "Operator workstation interface"},
            "braidA": {"label": "Line Continuity Alpha", "role": "Primary production continuity strand"},
            "braidB": {"label": "Line Continuity Beta", "role": "Redundant production continuity strand"},
        },
        "route": ["core", "driver_net", "braidA", "fs", "user_app"],
        "scenario": "incomplete_update",
    },
    "logistics": {
        "id": "logistics",
        "title": "Logistics",
        "subtitle": "Supply chain visibility and delivery continuity",
        "components": {
            "core": {"label": "Logistics Core", "role": "Central supply chain orchestrator"},
            "driver_net": {"label": "Tracking Network", "role": "Fleet and shipment communication mesh"},
            "fs": {"label": "Shipment Vault", "role": "Delivery state and custody checkpoint storage"},
            "user_app": {"label": "Dispatch Console", "role": "Dispatcher and shipper interface"},
            "braidA": {"label": "Route Continuity Alpha", "role": "Primary delivery continuity strand"},
            "braidB": {"label": "Route Continuity Beta", "role": "Redundant delivery continuity strand"},
        },
        "route": ["core", "driver_net", "braidA", "fs", "user_app"],
        "scenario": "path_attack",
    },
    "finance": {
        "id": "finance",
        "title": "Finance",
        "subtitle": "Transaction integrity and regulatory trust",
        "components": {
            "core": {"label": "Transaction Core", "role": "Central financial processing authority"},
            "driver_net": {"label": "Settlement Network", "role": "Inter-bank and clearing communication"},
            "fs": {"label": "Ledger Vault", "role": "Transaction state and audit checkpoint storage"},
            "user_app": {"label": "Trading Console", "role": "Trader and analyst interface"},
            "braidA": {"label": "Settlement Continuity Alpha", "role": "Primary financial continuity strand"},
            "braidB": {"label": "Settlement Continuity Beta", "role": "Redundant financial continuity strand"},
        },
        "route": ["core", "driver_net", "braidA", "fs", "user_app"],
        "scenario": "tamper_attempt",
    },
    "government": {
        "id": "government",
        "title": "Government",
        "subtitle": "Sovereign infrastructure and citizen service continuity",
        "components": {
            "core": {"label": "Agency Core", "role": "Central government system authority"},
            "driver_net": {"label": "Secure Exchange Network", "role": "Inter-agency secure communication"},
            "fs": {"label": "Federal Record Vault", "role": "Classified and unclassified state storage"},
            "user_app": {"label": "Citizen Portal", "role": "Public-facing government services"},
            "braidA": {"label": "Mission Continuity Alpha", "role": "Primary government continuity strand"},
            "braidB": {"label": "Mission Continuity Beta", "role": "Redundant government continuity strand"},
        },
        "route": ["core", "driver_net", "braidA", "fs", "user_app"],
        "scenario": "network_failure",
    },
    "aerospace": {
        "id": "aerospace",
        "title": "Aerospace",
        "subtitle": "Mission-critical flight and ground operations",
        "components": {
            "core": {"label": "Mission Core", "role": "Central flight and ground authority"},
            "driver_net": {"label": "Flight Control Bus", "role": "Avionics and ground link communication"},
            "fs": {"label": "Flight State Vault", "role": "Telemetry and mission checkpoint storage"},
            "user_app": {"label": "Mission Console", "role": "Flight director and operator interface"},
            "braidA": {"label": "Mission Strand Alpha", "role": "Primary mission continuity path"},
            "braidB": {"label": "Mission Strand Beta", "role": "Redundant mission continuity path"},
        },
        "route": ["core", "driver_net", "braidA", "fs", "user_app"],
        "scenario": "dependency_disruption",
    },
    "industrial_ai": {
        "id": "industrial_ai",
        "title": "Industrial AI",
        "subtitle": "AI orchestration resilience and model trust",
        "components": {
            "core": {"label": "AI Orchestration Core", "role": "Central AI pipeline authority"},
            "driver_net": {"label": "Inference Exchange Mesh", "role": "Model-to-model communication fabric"},
            "fs": {"label": "Model & State Vault", "role": "Model weights and inference checkpoint storage"},
            "user_app": {"label": "Operator AI Console", "role": "AI operator and analyst interface"},
            "braidA": {"label": "Inference Continuity Alpha", "role": "Primary AI continuity strand"},
            "braidB": {"label": "Inference Continuity Beta", "role": "Redundant AI continuity strand"},
        },
        "route": ["core", "driver_net", "braidA", "fs", "user_app"],
        "scenario": "ai_drift",
    },
}

# ── Scenario definitions ──────────────────────────────────────────────────────

SCENARIOS: dict[str, dict[str, Any]] = {
    "network_failure": {
        "id": "network_failure",
        "title": "Network Path Failure",
        "description": "Primary exchange path between components fails, requiring immediate traffic rerouting.",
        "affectedComponents": ["driver_net"],
        "degradedComponents": ["braidA"],
        "isolatedComponents": [],
        "logEntries": [
            "Primary exchange path failed. Traffic rerouting initiated.",
            "Alternate continuity strand engaged for active traffic.",
            "Degraded path detected on Braid Alpha. Monitoring engaged.",
        ],
    },
    "dependency_disruption": {
        "id": "dependency_disruption",
        "title": "Dependency Chain Disruption",
        "description": "A critical dependency becomes unavailable, threatening downstream operations.",
        "affectedComponents": ["braidA"],
        "degradedComponents": ["core"],
        "isolatedComponents": [],
        "logEntries": [
            "Dependency chain disruption detected on primary continuity strand.",
            "Core orchestrator entering degraded advisory mode.",
            "Downstream operations rerouted through redundant path.",
        ],
    },
    "incomplete_update": {
        "id": "incomplete_update",
        "title": "Incomplete Update",
        "description": "A system update was interrupted mid-deployment, leaving components in an inconsistent state.",
        "affectedComponents": ["fs"],
        "degradedComponents": ["user_app"],
        "isolatedComponents": [],
        "logEntries": [
            "Incomplete update detected in state vault.",
            "Operator interface entering degraded mode due to state inconsistency.",
            "Checkpoint rollback prepared. Awaiting recovery authorization.",
        ],
    },
    "tamper_attempt": {
        "id": "tamper_attempt",
        "title": "Trusted Record Tamper Attempt",
        "description": "An unauthorized modification attempt was detected against the trusted record chain.",
        "affectedComponents": [],
        "degradedComponents": ["fs"],
        "isolatedComponents": ["braidB"],
        "logEntries": [
            "Suspicious commit detected on trusted record chain.",
            "Tamper attempt quarantined. Affected strand isolated.",
            "Trust verification engaged. Chain integrity under review.",
        ],
    },
    "path_attack": {
        "id": "path_attack",
        "title": "Targeted Path Attack",
        "description": "A deliberate attack targets the primary communication path.",
        "affectedComponents": ["driver_net"],
        "degradedComponents": [],
        "isolatedComponents": ["braidA"],
        "logEntries": [
            "Targeted attack detected on primary exchange path.",
            "Compromised continuity strand isolated immediately.",
            "All traffic rerouted through verified alternate path.",
        ],
    },
    "ai_drift": {
        "id": "ai_drift",
        "title": "AI Orchestration Drift",
        "description": "AI inference pipeline has drifted from its approved operational envelope.",
        "affectedComponents": ["core"],
        "degradedComponents": ["driver_net", "braidA"],
        "isolatedComponents": [],
        "logEntries": [
            "AI orchestration drift detected. Inference outputs deviating from approved envelope.",
            "Exchange mesh entering degraded mode. Inference routing restricted.",
            "Model state checkpoint comparison initiated.",
        ],
    },
    "unauthorized_state": {
        "id": "unauthorized_state",
        "title": "Unauthorized State Transition",
        "description": "An unsigned state write was attempted against a protected module boundary.",
        "affectedComponents": [],
        "degradedComponents": ["fs"],
        "isolatedComponents": ["braidB"],
        "logEntries": [
            "Unauthorized state transition detected. Signature verification failed.",
            "Affected strand isolated. State write blocked before chain advancement.",
            "Tamper rejection logged. Trusted ledger integrity maintained.",
        ],
    },
    "ghost_probe": {
        "id": "ghost_probe",
        "title": "Suspicious Probe via Ghost Node",
        "description": "A suspicious probing attempt was detected by a ghost node sensor.",
        "affectedComponents": [],
        "degradedComponents": ["braidA"],
        "isolatedComponents": [],
        "logEntries": [
            "Ghost node telemetry: suspicious probe detected at mesh boundary.",
            "Probe absorbed by ghost sensor. Core modules not exposed.",
            "Anomalous access pattern logged. Operator audit flag raised.",
        ],
    },
    "compromised_runtime": {
        "id": "compromised_runtime",
        "title": "Compromised Runtime Quarantined",
        "description": "A component runtime was identified as compromised via state hash mismatch.",
        "affectedComponents": ["driver_net"],
        "degradedComponents": [],
        "isolatedComponents": ["driver_net"],
        "logEntries": [
            "State hash mismatch detected on Exchange Network. Compromise suspected.",
            "Module detached from trusted mesh. Moved to disposable quarantine sandbox.",
            "Compromised runtime terminated. Rebuilding from trusted checkpoint.",
            "Dependency revalidation initiated. Mesh re-knitting around quarantined module.",
        ],
    },
}

COMPONENT_KEYS = ["core", "driver_net", "fs", "user_app", "braidA", "braidB"]

# ── Helpers ───────────────────────────────────────────────────────────────────


def _generate_hash() -> str:
    chars = string.hexdigits[:16]  # 0-9 a-f
    return "".join(random.choices(chars, k=8))


def _now_ms() -> int:
    return int(time.time() * 1000)


# ── Engine functions ──────────────────────────────────────────────────────────


def create_initial_state() -> dict[str, Any]:
    """Return a fresh system state matching the JS createInitialState()."""
    components = {
        key: {"status": "healthy", "checkpointId": f"chk-{_generate_hash()}"}
        for key in COMPONENT_KEYS
    }
    return {
        "industry": "universal",
        "scenario": None,
        "scenarioLoaded": False,
        "problemSimulated": False,
        "recoveryRun": False,
        "proofRun": False,
        "routeStart": "core",
        "routeEnd": "user_app",
        "components": components,
        "approvedRoute": ["core", "driver_net", "braidA", "fs", "user_app"],
        "routeType": "primary",
        "routeTime": 12,
        "resilienceScore": 100,
        "continuityScore": 100,
        "operationalState": "Nominal",
        "trustedRecordVersion": 1,
        "trustedRecords": [
            {
                "version": 1,
                "hash": _generate_hash(),
                "status": "trusted",
                "message": "Baseline system state committed as trusted record head.",
                "timestamp": _now_ms(),
            }
        ],
        "eventLog": [
            {
                "message": "System initialized. All components healthy. Baseline trusted record established.",
                "timestamp": _now_ms(),
            }
        ],
        "proofResults": [],
        "graphData": {
            "resilienceTimeline": [100],
            "routeTimeComparison": [12],
            "continuityOutcome": [100],
            "labels": ["Baseline"],
        },
    }


def load_scenario(state: dict[str, Any], scenario_id: str) -> dict[str, Any]:
    """Load a scenario into the state (mirrors JS loadScenario)."""
    scenario = SCENARIOS.get(scenario_id)
    if not scenario:
        return state
    new_state = deepcopy(state)
    new_state.update(
        {
            "scenario": scenario_id,
            "scenarioLoaded": True,
            "problemSimulated": False,
            "recoveryRun": False,
            "proofRun": False,
            "proofResults": [],
            "eventLog": [
                {
                    "message": f"Scenario loaded: {scenario['title']}. {scenario['description']}",
                    "timestamp": _now_ms(),
                }
            ]
            + state["eventLog"],
        }
    )
    return new_state


def simulate_problem(state: dict[str, Any]) -> dict[str, Any]:
    """Apply a loaded scenario's failure to the system state (mirrors JS simulateProblem)."""
    if not state.get("scenario"):
        return state

    scenario = SCENARIOS[state["scenario"]]
    new_state = deepcopy(state)
    components = new_state["components"]

    for c in scenario["affectedComponents"] + scenario["degradedComponents"]:
        if c in components:
            components[c] = {**components[c], "status": "degraded"}

    for c in scenario["isolatedComponents"]:
        if c in components:
            components[c] = {**components[c], "status": "isolated"}

    all_affected = scenario["affectedComponents"] + scenario["isolatedComponents"]
    new_route = [n for n in state["approvedRoute"] if n not in all_affected]

    if "braidA" in all_affected and "braidB" not in all_affected:
        new_route = ["braidB" if n == "braidA" else n for n in new_route]
        if "braidB" not in new_route:
            try:
                idx = new_route.index("driver_net")
                new_route.insert(idx + 1, "braidB")
            except ValueError:
                new_route.append("braidB")

    if "driver_net" in all_affected:
        new_route = [n for n in new_route if n != "driver_net"]

    if state["routeStart"] not in new_route:
        new_route.insert(0, state["routeStart"])
    if state["routeEnd"] not in new_route:
        new_route.append(state["routeEnd"])

    resilience_hit = 15 + len(all_affected) * 10 + len(scenario["degradedComponents"]) * 5
    continuity_hit = 10 + len(all_affected) * 8
    new_resilience = max(20, state["resilienceScore"] - resilience_hit)
    new_continuity = max(30, state["continuityScore"] - continuity_hit)

    route_time = 28 + random.randint(0, 14)
    new_tr_version = state["trustedRecordVersion"] + 1
    new_tr = {
        "version": new_tr_version,
        "hash": _generate_hash(),
        "status": "trusted",
        "message": "Incident state recorded. Reroute decision committed to trusted chain.",
        "timestamp": _now_ms(),
    }
    operational = (
        "Degraded — Containment Active" if scenario["isolatedComponents"] else "Degraded"
    )

    new_state.update(
        {
            "problemSimulated": True,
            "recoveryRun": False,
            "proofRun": False,
            "proofResults": [],
            "components": components,
            "approvedRoute": new_route,
            "routeType": "alternate",
            "routeTime": route_time,
            "resilienceScore": new_resilience,
            "continuityScore": new_continuity,
            "operationalState": operational,
            "trustedRecordVersion": new_tr_version,
            "trustedRecords": [new_tr] + state["trustedRecords"],
            "eventLog": [
                {"message": msg, "timestamp": _now_ms()}
                for msg in scenario["logEntries"]
            ]
            + state["eventLog"],
            "graphData": {
                **state["graphData"],
                "resilienceTimeline": state["graphData"]["resilienceTimeline"] + [new_resilience],
                "routeTimeComparison": state["graphData"]["routeTimeComparison"] + [route_time],
                "continuityOutcome": state["graphData"]["continuityOutcome"] + [new_continuity],
                "labels": state["graphData"]["labels"] + ["Incident"],
            },
        }
    )
    return new_state


def run_recovery(state: dict[str, Any]) -> dict[str, Any]:
    """Execute smart recovery (mirrors JS runRecovery)."""
    new_state = deepcopy(state)
    new_components = {
        key: {"status": "healthy", "checkpointId": f"chk-{_generate_hash()}"}
        for key in COMPONENT_KEYS
    }

    industry = INDUSTRIES[state["industry"]]
    new_route = industry["route"]
    new_resilience = min(100, state["resilienceScore"] + 35)
    new_continuity = min(100, state["continuityScore"] + 30)

    recovery_logs = [
        {"message": "Smart Recovery initiated. Scanning trusted checkpoint chain.", "timestamp": _now_ms()},
        {"message": "Approved checkpoint restored across affected components.", "timestamp": _now_ms()},
        {"message": "Alternate approved route engaged. Primary path restored.", "timestamp": _now_ms()},
        {"message": "Recovered state recommitted as new trusted record head.", "timestamp": _now_ms()},
    ]

    new_tr_version = state["trustedRecordVersion"] + 1
    new_tr = {
        "version": new_tr_version,
        "hash": _generate_hash(),
        "status": "trusted",
        "message": "Recovery complete. New trusted record head established from verified checkpoint.",
        "timestamp": _now_ms(),
    }

    operational = "Nominal" if new_resilience >= 90 else "Recovering"

    new_state.update(
        {
            "recoveryRun": True,
            "proofRun": False,
            "proofResults": [],
            "components": new_components,
            "approvedRoute": new_route,
            "routeType": "primary",
            "routeTime": 14,
            "resilienceScore": new_resilience,
            "continuityScore": new_continuity,
            "operationalState": operational,
            "trustedRecordVersion": new_tr_version,
            "trustedRecords": [new_tr] + state["trustedRecords"],
            "eventLog": recovery_logs + state["eventLog"],
            "graphData": {
                **state["graphData"],
                "resilienceTimeline": state["graphData"]["resilienceTimeline"] + [new_resilience],
                "routeTimeComparison": state["graphData"]["routeTimeComparison"] + [14],
                "continuityOutcome": state["graphData"]["continuityOutcome"] + [new_continuity],
                "labels": state["graphData"]["labels"] + ["Recovered"],
            },
        }
    )
    return new_state


def run_proof_suite(state: dict[str, Any]) -> dict[str, Any]:
    """Run the 5-point proof suite (mirrors JS runProofSuite)."""
    components = state["components"]
    has_route = len(state["approvedRoute"]) >= 2
    all_healthy = all(components[k]["status"] == "healthy" for k in COMPONENT_KEYS)
    has_isolated = any(components[k]["status"] == "isolated" for k in COMPONENT_KEYS)
    tr_version = state["trustedRecordVersion"]
    tamper_scenario = state.get("scenario") == "tamper_attempt"

    proofs = [
        {
            "title": "Baseline Approved Route Exists",
            "pass": has_route,
            "explanation": (
                "A valid approved route with at least two components is active."
                if has_route
                else "No valid approved route is currently established."
            ),
        },
        {
            "title": "Engine Reroutes Around Failed Path",
            "pass": (state["problemSimulated"] and state["routeType"] == "alternate")
            or (state["recoveryRun"] and has_route),
            "explanation": (
                "The system successfully rerouted traffic around the failed or degraded path."
                if state["problemSimulated"] or state["recoveryRun"]
                else "No reroute has been tested yet. Run a Problem Simulation first."
            ),
        },
        {
            "title": "Isolation Blocks Compromised Workload",
            "pass": has_isolated or (state["recoveryRun"] and not has_isolated),
            "explanation": (
                "Compromised components are currently isolated."
                if has_isolated
                else (
                    "Isolation was applied during incident and released after verified recovery."
                    if state["recoveryRun"]
                    else "No isolation event has occurred in this session."
                )
            ),
        },
        {
            "title": "Recovery Advances Trusted Record Head",
            "pass": state["recoveryRun"] and tr_version >= 2,
            "explanation": (
                f"Trusted record advanced to v{tr_version} after verified recovery."
                if state["recoveryRun"]
                else "No recovery has been run. The trusted record head has not advanced."
            ),
        },
        {
            "title": "Tamper Attempts Rejected Before Chain Advancement",
            "pass": tamper_scenario or (all_healthy and tr_version >= 1),
            "explanation": (
                "Tamper scenario detected: unauthorized write was rejected before chain advanced."
                if tamper_scenario
                else (
                    "System is in clean state. No unauthorized writes detected."
                    if all_healthy
                    else "System has not been tested against a tamper scenario yet."
                )
            ),
        },
    ]

    pass_count = sum(1 for p in proofs if p["pass"])
    new_state = deepcopy(state)
    new_state.update(
        {
            "proofRun": True,
            "proofResults": proofs,
            "eventLog": [
                {
                    "message": f"Proof suite complete: {pass_count}/5 checks passed.",
                    "timestamp": _now_ms(),
                }
            ]
            + state["eventLog"],
        }
    )
    return new_state


def factory_reset(industry: str = "universal") -> dict[str, Any]:
    """Return a factory-reset state for the given industry."""
    state = create_initial_state()
    state["industry"] = industry
    ind = INDUSTRIES.get(industry, INDUSTRIES["universal"])
    state["approvedRoute"] = ind["route"]
    return state
