"""
SB688 Resilience Console — Sovereign Stitch Tests
JGA Enterprise · NODE: MENDOTA-IL

Tests for the core SB688 resilience engine:
- Initial state creation
- Scenario loading
- Problem simulation (Sovereign Stitch rerouting)
- Smart recovery
- Proof suite
- Factory reset
"""

import pytest
from backend.engine import (
    COMPONENT_KEYS,
    INDUSTRIES,
    SCENARIOS,
    create_initial_state,
    factory_reset,
    load_scenario,
    run_proof_suite,
    run_recovery,
    simulate_problem,
)


# ── Fixtures ──────────────────────────────────────────────────────────────────


@pytest.fixture()
def baseline_state():
    """Return a clean baseline system state."""
    return create_initial_state()


@pytest.fixture()
def loaded_network_failure(baseline_state):
    """Baseline state with 'network_failure' scenario loaded."""
    return load_scenario(baseline_state, "network_failure")


@pytest.fixture()
def post_simulation(loaded_network_failure):
    """State after network_failure simulation."""
    return simulate_problem(loaded_network_failure)


@pytest.fixture()
def post_recovery(post_simulation):
    """State after smart recovery following network_failure simulation."""
    return run_recovery(post_simulation)


# ── create_initial_state ──────────────────────────────────────────────────────


class TestCreateInitialState:
    def test_all_components_healthy(self, baseline_state):
        for key in COMPONENT_KEYS:
            assert baseline_state["components"][key]["status"] == "healthy", (
                f"Expected {key} to be healthy on init"
            )

    def test_default_industry_is_universal(self, baseline_state):
        assert baseline_state["industry"] == "universal"

    def test_resilience_and_continuity_at_100(self, baseline_state):
        assert baseline_state["resilienceScore"] == 100
        assert baseline_state["continuityScore"] == 100

    def test_operational_state_nominal(self, baseline_state):
        assert baseline_state["operationalState"] == "Nominal"

    def test_initial_route_is_primary(self, baseline_state):
        assert baseline_state["routeType"] == "primary"
        assert len(baseline_state["approvedRoute"]) >= 2

    def test_trusted_record_at_version_1(self, baseline_state):
        assert baseline_state["trustedRecordVersion"] == 1
        assert len(baseline_state["trustedRecords"]) == 1

    def test_each_component_has_checkpoint_id(self, baseline_state):
        for key in COMPONENT_KEYS:
            chk = baseline_state["components"][key]["checkpointId"]
            assert chk.startswith("chk-"), f"Unexpected checkpointId for {key}: {chk}"

    def test_event_log_has_init_entry(self, baseline_state):
        assert len(baseline_state["eventLog"]) >= 1
        assert "initialized" in baseline_state["eventLog"][0]["message"].lower()


# ── load_scenario ─────────────────────────────────────────────────────────────


class TestLoadScenario:
    def test_scenario_loaded_flag_set(self, loaded_network_failure):
        assert loaded_network_failure["scenarioLoaded"] is True

    def test_scenario_id_stored(self, loaded_network_failure):
        assert loaded_network_failure["scenario"] == "network_failure"

    def test_problem_not_yet_simulated(self, loaded_network_failure):
        assert loaded_network_failure["problemSimulated"] is False

    def test_event_log_updated(self, loaded_network_failure):
        first_msg = loaded_network_failure["eventLog"][0]["message"]
        assert "network_failure" in first_msg.lower() or "network path" in first_msg.lower()

    def test_load_unknown_scenario_returns_unchanged_state(self, baseline_state):
        result = load_scenario(baseline_state, "nonexistent_scenario_xyz")
        assert result["scenario"] is None
        assert result["scenarioLoaded"] is False

    @pytest.mark.parametrize("scenario_id", list(SCENARIOS.keys()))
    def test_all_scenarios_loadable(self, baseline_state, scenario_id):
        state = load_scenario(baseline_state, scenario_id)
        assert state["scenarioLoaded"] is True
        assert state["scenario"] == scenario_id


# ── simulate_problem (Sovereign Stitch rerouting) ─────────────────────────────


class TestSimulateProblem:
    def test_problem_simulated_flag_set(self, post_simulation):
        assert post_simulation["problemSimulated"] is True

    def test_resilience_score_reduced(self, post_simulation, baseline_state):
        assert post_simulation["resilienceScore"] < baseline_state["resilienceScore"]
        assert post_simulation["resilienceScore"] >= 20  # floor enforced

    def test_continuity_score_reduced(self, post_simulation, baseline_state):
        assert post_simulation["continuityScore"] < baseline_state["continuityScore"]
        assert post_simulation["continuityScore"] >= 30  # floor enforced

    def test_route_type_switches_to_alternate(self, post_simulation):
        assert post_simulation["routeType"] == "alternate"

    def test_affected_components_degraded(self, loaded_network_failure):
        scenario = SCENARIOS["network_failure"]
        state = simulate_problem(loaded_network_failure)
        for c in scenario["affectedComponents"]:
            assert state["components"][c]["status"] in ("degraded", "isolated"), (
                f"Expected {c} to be degraded or isolated after network_failure"
            )

    def test_isolated_components_for_tamper_scenario(self, baseline_state):
        state = load_scenario(baseline_state, "tamper_attempt")
        state = simulate_problem(state)
        for c in SCENARIOS["tamper_attempt"]["isolatedComponents"]:
            assert state["components"][c]["status"] == "isolated", (
                f"Expected {c} to be isolated for tamper_attempt"
            )

    def test_trusted_record_version_advanced(self, post_simulation, baseline_state):
        assert post_simulation["trustedRecordVersion"] == baseline_state["trustedRecordVersion"] + 1

    def test_event_log_has_scenario_entries(self, post_simulation):
        messages = [e["message"] for e in post_simulation["eventLog"]]
        scenario_msgs = SCENARIOS["network_failure"]["logEntries"]
        for expected in scenario_msgs:
            assert any(expected in msg for msg in messages), (
                f"Expected log entry not found: {expected}"
            )

    def test_simulate_without_scenario_returns_unchanged(self, baseline_state):
        result = simulate_problem(baseline_state)
        assert result["problemSimulated"] is False

    def test_alternate_route_excludes_affected_component(self, loaded_network_failure):
        scenario = SCENARIOS["network_failure"]
        state = simulate_problem(loaded_network_failure)
        isolated = scenario["isolatedComponents"]
        for c in isolated:
            assert c not in state["approvedRoute"], (
                f"Isolated component {c} should not appear in approved route"
            )

    def test_route_still_has_start_and_end(self, post_simulation):
        route = post_simulation["approvedRoute"]
        assert "core" in route or post_simulation["routeStart"] in route
        assert "user_app" in route or post_simulation["routeEnd"] in route


# ── run_recovery ──────────────────────────────────────────────────────────────


class TestRunRecovery:
    def test_recovery_run_flag_set(self, post_recovery):
        assert post_recovery["recoveryRun"] is True

    def test_all_components_healthy_after_recovery(self, post_recovery):
        for key in COMPONENT_KEYS:
            assert post_recovery["components"][key]["status"] == "healthy", (
                f"Expected {key} to be healthy after recovery"
            )

    def test_route_type_restored_to_primary(self, post_recovery):
        assert post_recovery["routeType"] == "primary"

    def test_resilience_score_increased(self, post_simulation, post_recovery):
        assert post_recovery["resilienceScore"] > post_simulation["resilienceScore"]
        assert post_recovery["resilienceScore"] <= 100

    def test_continuity_score_increased(self, post_simulation, post_recovery):
        assert post_recovery["continuityScore"] > post_simulation["continuityScore"]
        assert post_recovery["continuityScore"] <= 100

    def test_trusted_record_advanced_again(self, post_simulation, post_recovery):
        assert post_recovery["trustedRecordVersion"] == post_simulation["trustedRecordVersion"] + 1

    def test_checkpoints_regenerated(self, post_recovery):
        for key in COMPONENT_KEYS:
            chk = post_recovery["components"][key]["checkpointId"]
            assert chk.startswith("chk-"), f"Unexpected checkpointId after recovery for {key}"

    def test_recovery_route_matches_industry(self, post_recovery):
        expected_route = INDUSTRIES[post_recovery["industry"]]["route"]
        assert post_recovery["approvedRoute"] == expected_route

    def test_operational_state_nominal_or_recovering(self, post_recovery):
        assert post_recovery["operationalState"] in ("Nominal", "Recovering")


# ── run_proof_suite ───────────────────────────────────────────────────────────


class TestRunProofSuite:
    def test_proof_run_flag_set(self, post_recovery):
        state = run_proof_suite(post_recovery)
        assert state["proofRun"] is True

    def test_proof_results_has_five_items(self, post_recovery):
        state = run_proof_suite(post_recovery)
        assert len(state["proofResults"]) == 5

    def test_all_proofs_have_required_fields(self, post_recovery):
        state = run_proof_suite(post_recovery)
        for proof in state["proofResults"]:
            assert "title" in proof
            assert "pass" in proof
            assert "explanation" in proof
            assert isinstance(proof["pass"], bool)

    def test_baseline_route_proof_passes_after_recovery(self, post_recovery):
        state = run_proof_suite(post_recovery)
        route_proof = next(
            p for p in state["proofResults"] if "Baseline Approved Route" in p["title"]
        )
        assert route_proof["pass"] is True

    def test_reroute_proof_passes_after_simulate_and_recover(self, post_recovery):
        state = run_proof_suite(post_recovery)
        reroute_proof = next(
            p for p in state["proofResults"] if "Reroutes" in p["title"]
        )
        assert reroute_proof["pass"] is True

    def test_trusted_record_proof_passes_after_recovery(self, post_recovery):
        state = run_proof_suite(post_recovery)
        tr_proof = next(
            p for p in state["proofResults"] if "Trusted Record" in p["title"]
        )
        assert tr_proof["pass"] is True

    def test_proof_event_log_entry_added(self, post_recovery):
        state = run_proof_suite(post_recovery)
        messages = [e["message"] for e in state["eventLog"]]
        assert any("proof suite" in m.lower() for m in messages)

    def test_proof_suite_on_baseline_state(self, baseline_state):
        state = run_proof_suite(baseline_state)
        assert len(state["proofResults"]) == 5
        # Baseline route exists
        route_proof = next(
            p for p in state["proofResults"] if "Baseline Approved Route" in p["title"]
        )
        assert route_proof["pass"] is True


# ── factory_reset ─────────────────────────────────────────────────────────────


class TestFactoryReset:
    def test_reset_returns_clean_state(self):
        state = factory_reset()
        assert state["resilienceScore"] == 100
        assert state["problemSimulated"] is False
        assert state["scenarioLoaded"] is False

    @pytest.mark.parametrize("industry", list(INDUSTRIES.keys()))
    def test_reset_works_for_all_industries(self, industry):
        state = factory_reset(industry)
        assert state["industry"] == industry
        expected_route = INDUSTRIES[industry]["route"]
        assert state["approvedRoute"] == expected_route

    def test_reset_unknown_industry_defaults_to_universal(self):
        state = factory_reset("unknown_industry_xyz")
        assert state["industry"] == "unknown_industry_xyz"
        assert state["approvedRoute"] == INDUSTRIES["universal"]["route"]


# ── Sovereign Stitch: end-to-end flow ─────────────────────────────────────────


class TestSovereignStitchEndToEnd:
    """
    Validates the complete Sovereign Stitch flow:
    init → load_scenario → simulate_problem → run_recovery → run_proof_suite
    """

    @pytest.mark.parametrize("scenario_id", list(SCENARIOS.keys()))
    def test_full_flow_for_all_scenarios(self, scenario_id):
        state = create_initial_state()
        state = load_scenario(state, scenario_id)
        assert state["scenarioLoaded"] is True

        state = simulate_problem(state)
        assert state["problemSimulated"] is True
        assert state["resilienceScore"] < 100

        pre_recovery_score = state["resilienceScore"]
        state = run_recovery(state)
        assert state["recoveryRun"] is True
        assert state["resilienceScore"] > pre_recovery_score  # score improved after recovery

        state = run_proof_suite(state)
        assert state["proofRun"] is True
        assert len(state["proofResults"]) == 5

        # After full flow, route proof should pass
        route_proof = next(
            p for p in state["proofResults"] if "Baseline Approved Route" in p["title"]
        )
        assert route_proof["pass"] is True

    def test_trusted_chain_grows_through_full_flow(self):
        state = create_initial_state()
        v0 = state["trustedRecordVersion"]

        state = load_scenario(state, "network_failure")
        state = simulate_problem(state)
        v1 = state["trustedRecordVersion"]
        assert v1 > v0

        state = run_recovery(state)
        v2 = state["trustedRecordVersion"]
        assert v2 > v1

    def test_all_components_healthy_after_end_to_end(self):
        state = create_initial_state()
        state = load_scenario(state, "path_attack")
        state = simulate_problem(state)
        state = run_recovery(state)

        for key in COMPONENT_KEYS:
            assert state["components"][key]["status"] == "healthy", (
                f"Expected {key} healthy after end-to-end flow"
            )
