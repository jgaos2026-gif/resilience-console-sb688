import React, { useState, useCallback } from "react";
import { INDUSTRIES } from "@/lib/sb688Engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, BookOpen, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

// ── DSL Reference ─────────────────────────────────────────────────────────────
const DSL_REFERENCE = [
  { keyword: "IF component.<name>.status == \"isolated\"", desc: "Check a component's current status" },
  { keyword: "IF resilience < 50", desc: "Check a numeric metric (resilience, continuity, routeTime)" },
  { keyword: "IF scenario == \"tamper_attempt\"", desc: "Check which scenario is active" },
  { keyword: "IF problemSimulated == true", desc: "Check simulation flags" },
  { keyword: "THEN isolate <component>", desc: "Isolate a component immediately" },
  { keyword: "THEN restore <component>", desc: "Force a component to healthy" },
  { keyword: "THEN set resilience <value>", desc: "Override resilience score (0-100)" },
  { keyword: "THEN reroute via braidB", desc: "Force route through braidB" },
  { keyword: "THEN block recovery", desc: "Prevent recovery from running" },
  { keyword: "THEN flag audit", desc: "Add an audit flag to the outcome log" },
];

const EXAMPLE_POLICIES = [
  {
    name: "Zero-Trust Tamper Lock",
    code: `IF scenario == "tamper_attempt"
THEN isolate braidB
THEN flag audit
THEN set resilience 40`,
  },
  {
    name: "Auto-Reroute on Low Resilience",
    code: `IF resilience < 60
THEN reroute via braidB
THEN flag audit`,
  },
  {
    name: "Block Recovery Until Audit",
    code: `IF problemSimulated == true
IF resilience < 70
THEN block recovery
THEN flag audit`,
  },
  {
    name: "Aggressive Isolation",
    code: `IF component.driver_net.status == "degraded"
THEN isolate driver_net
THEN set resilience 55`,
  },
];

// ── DSL Interpreter ───────────────────────────────────────────────────────────
function parseDSL(code) {
  const lines = code.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"));
  const conditions = [];
  const actions = [];

  for (const line of lines) {
    if (line.startsWith("IF ")) {
      const expr = line.slice(3).trim();
      conditions.push(expr);
    } else if (line.startsWith("THEN ")) {
      const action = line.slice(5).trim();
      actions.push(action);
    }
  }

  return { conditions, actions };
}

function evaluateCondition(expr, state) {
  // component.<name>.status == "value"
  const compMatch = expr.match(/^component\.(\w+)\.status\s*==\s*"(\w+)"$/);
  if (compMatch) {
    const [, name, expected] = compMatch;
    return state.components[name]?.status === expected;
  }

  // resilience / continuity / routeTime < > == value
  const metricMatch = expr.match(/^(resilience|continuity|routeTime)\s*(<=|>=|==|<|>)\s*(\d+)$/);
  if (metricMatch) {
    const [, metric, op, rawVal] = metricMatch;
    const val = Number(rawVal);
    const actual = metric === "resilience" ? state.resilienceScore
      : metric === "continuity" ? state.continuityScore
      : state.routeTime;
    if (op === "<") return actual < val;
    if (op === ">") return actual > val;
    if (op === "<=") return actual <= val;
    if (op === ">=") return actual >= val;
    if (op === "==") return actual === val;
  }

  // scenario == "value"
  const scenMatch = expr.match(/^scenario\s*==\s*"([\w_]+)"$/);
  if (scenMatch) return state.scenario === scenMatch[1];

  // problemSimulated / recoveryRun / scenarioLoaded == true/false
  const flagMatch = expr.match(/^(problemSimulated|recoveryRun|scenarioLoaded)\s*==\s*(true|false)$/);
  if (flagMatch) {
    const val = flagMatch[2] === "true";
    return state[flagMatch[1]] === val;
  }

  return null; // unknown
}

function applyAction(action, state, log) {
  // isolate <component>
  const isolateMatch = action.match(/^isolate (\w+)$/);
  if (isolateMatch) {
    const key = isolateMatch[1];
    if (state.components[key]) {
      state.components = { ...state.components, [key]: { ...state.components[key], status: "isolated" } };
      log.push({ type: "action", text: `Isolated component: ${key}` });
    } else {
      log.push({ type: "warn", text: `Unknown component: ${key}` });
    }
    return state;
  }

  // restore <component>
  const restoreMatch = action.match(/^restore (\w+)$/);
  if (restoreMatch) {
    const key = restoreMatch[1];
    if (state.components[key]) {
      state.components = { ...state.components, [key]: { ...state.components[key], status: "healthy" } };
      log.push({ type: "action", text: `Restored component: ${key}` });
    } else {
      log.push({ type: "warn", text: `Unknown component: ${key}` });
    }
    return state;
  }

  // set resilience <val>
  const setResMatch = action.match(/^set resilience (\d+)$/);
  if (setResMatch) {
    state.resilienceScore = Math.min(100, Math.max(0, Number(setResMatch[1])));
    log.push({ type: "action", text: `Resilience overridden to ${state.resilienceScore}%` });
    return state;
  }

  // reroute via <component>
  const rerouteMatch = action.match(/^reroute via (\w+)$/);
  if (rerouteMatch) {
    const via = rerouteMatch[1];
    if (!state.approvedRoute.includes(via)) {
      state.approvedRoute = [...state.approvedRoute, via];
    }
    state.routeType = "alternate";
    log.push({ type: "action", text: `Route forced via: ${via} (alternate)` });
    return state;
  }

  // block recovery
  if (action === "block recovery") {
    state._recoveryBlocked = true;
    log.push({ type: "action", text: "Recovery blocked by policy rule" });
    return state;
  }

  // flag audit
  if (action === "flag audit") {
    state._auditFlagged = true;
    log.push({ type: "action", text: "⚑ Audit flag raised — regulatory review required" });
    return state;
  }

  log.push({ type: "warn", text: `Unknown action: "${action}"` });
  return state;
}

function runPolicy(code, baseState) {
  const { conditions, actions } = parseDSL(code);
  const log = [];
  let errors = [];

  if (conditions.length === 0 && actions.length === 0) {
    return { log: [{ type: "warn", text: "No valid IF/THEN statements found." }], resultState: null, errors: [], triggered: false };
  }

  // Deep clone relevant parts of state
  let simState = {
    ...baseState,
    components: { ...baseState.components },
    approvedRoute: [...baseState.approvedRoute],
    _recoveryBlocked: false,
    _auditFlagged: false,
  };

  // Evaluate all conditions (AND logic)
  let allMet = true;
  for (const cond of conditions) {
    const result = evaluateCondition(cond, simState);
    if (result === null) {
      errors.push(`Could not evaluate condition: "${cond}"`);
      allMet = false;
    } else {
      log.push({ type: result ? "pass" : "fail", text: `Condition [${cond}] → ${result ? "TRUE" : "FALSE"}` });
      if (!result) allMet = false;
    }
  }

  if (allMet && actions.length > 0) {
    log.push({ type: "info", text: "All conditions met — executing actions:" });
    for (const action of actions) {
      simState = applyAction(action, simState, log);
    }
  } else if (!allMet) {
    log.push({ type: "info", text: "Not all conditions met — no actions applied." });
  }

  return { log, resultState: simState, errors, triggered: allMet };
}

// ── Diff between base and result state ───────────────────────────────────────
function computeDiff(base, result) {
  if (!result) return [];
  const diffs = [];

  // Component statuses
  for (const key of Object.keys(base.components)) {
    const before = base.components[key]?.status;
    const after = result.components[key]?.status;
    if (before !== after) diffs.push({ field: `component.${key}.status`, before, after });
  }

  if (base.resilienceScore !== result.resilienceScore)
    diffs.push({ field: "resilienceScore", before: base.resilienceScore, after: result.resilienceScore });
  if (base.routeType !== result.routeType)
    diffs.push({ field: "routeType", before: base.routeType, after: result.routeType });
  if (result._recoveryBlocked)
    diffs.push({ field: "recovery", before: "allowed", after: "BLOCKED" });
  if (result._auditFlagged)
    diffs.push({ field: "audit", before: "clear", after: "FLAGGED" });

  return diffs;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PolicySandboxTab({ state }) {
  const [code, setCode] = useState(EXAMPLE_POLICIES[0].code);
  const [runLog, setRunLog] = useState(null);
  const [diff, setDiff] = useState(null);
  const [triggered, setTriggered] = useState(null);
  const [errors, setErrors] = useState([]);
  const [showRef, setShowRef] = useState(false);

  const handleRun = useCallback(() => {
    const { log, resultState, errors: errs, triggered: trig } = runPolicy(code, state);
    setRunLog(log);
    setDiff(computeDiff(state, resultState));
    setTriggered(trig);
    setErrors(errs);
  }, [code, state]);

  const handleLoad = useCallback((policy) => {
    setCode(policy.code);
    setRunLog(null);
    setDiff(null);
    setTriggered(null);
    setErrors([]);
  }, []);

  const handleReset = useCallback(() => {
    setRunLog(null);
    setDiff(null);
    setTriggered(null);
    setErrors([]);
  }, []);

  const industry = INDUSTRIES[state?.industry];

  const logColor = (type) => {
    if (type === "pass") return "text-[#22c55e]";
    if (type === "fail") return "text-[#f59e0b]";
    if (type === "action") return "text-[#c4a350]";
    if (type === "warn") return "text-[#ef4444]";
    return "text-[#5a5550]";
  };

  return (
    <div className="space-y-5 font-mono">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-lg font-bold text-foreground tracking-wide">Policy Sandbox</h2>
          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
            DSL v1.0
          </Badge>
          <Badge variant="outline" className="text-[10px] bg-secondary text-muted-foreground border-border">
            Simulation Only — No Live State Changes
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground font-sans leading-relaxed">
          Draft custom governance rules in the SB-688 DSL and simulate how they would alter recovery outcomes against the current console state.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Editor + examples */}
        <div className="xl:col-span-2 space-y-4">
          {/* Example presets */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="text-[10px] text-primary uppercase tracking-widest font-bold">Example Policies</div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_POLICIES.map((p) => (
                <button key={p.name} onClick={() => handleLoad(p)}
                  className="text-[10px] px-2.5 py-1 border border-primary/20 text-primary/80 rounded hover:bg-primary/10 transition">
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Code editor */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] text-primary uppercase tracking-widest font-bold">Policy Editor</div>
              <button onClick={() => setShowRef(v => !v)}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition">
                <BookOpen className="w-3 h-3" />
                {showRef ? "Hide" : "Show"} DSL Reference
              </button>
            </div>

            {showRef && (
              <div className="bg-secondary/50 border border-border rounded-lg p-3 space-y-1.5">
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2">DSL Keywords</div>
                {DSL_REFERENCE.map((r, i) => (
                  <div key={i} className="flex gap-3 text-[10px]">
                    <code className="text-primary/80 shrink-0 w-64 truncate">{r.keyword}</code>
                    <span className="text-muted-foreground font-sans">{r.desc}</span>
                  </div>
                ))}
                <div className="text-[9px] text-muted-foreground/50 pt-2 font-sans">Components: core, driver_net, fs, user_app, braidA, braidB</div>
              </div>
            )}

            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              rows={10}
              spellCheck={false}
              className="w-full bg-[#060810] border border-border rounded-lg px-4 py-3 text-xs text-[#c4a350] placeholder-muted-foreground focus:outline-none focus:border-primary/50 resize-y leading-relaxed tracking-wide"
              placeholder={"IF scenario == \"tamper_attempt\"\nTHEN isolate braidB\nTHEN flag audit"}
            />

            <div className="flex gap-2">
              <Button onClick={handleRun}
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold">
                <Play className="w-3.5 h-3.5 mr-1.5" />
                Simulate Policy
              </Button>
              <Button onClick={handleReset} variant="outline"
                className="border-border text-muted-foreground text-xs">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Clear
              </Button>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-destructive/5 border border-destructive/30 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-2 text-destructive text-xs font-bold mb-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Parse Errors
              </div>
              {errors.map((e, i) => (
                <div key={i} className="text-[11px] text-destructive/80">{e}</div>
              ))}
            </div>
          )}

          {/* Execution Log */}
          {runLog && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-primary uppercase tracking-widest font-bold">Execution Log</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  triggered
                    ? "border-[#22c55e]/30 text-[#22c55e] bg-[#22c55e]/5"
                    : "border-[#f59e0b]/30 text-[#f59e0b] bg-[#f59e0b]/5"
                }`}>
                  {triggered ? "✔ POLICY TRIGGERED" : "○ CONDITIONS NOT MET"}
                </span>
              </div>
              <div className="bg-[#060810] border border-border rounded-lg p-3 space-y-1 max-h-52 overflow-y-auto">
                {runLog.map((entry, i) => (
                  <div key={i} className={`text-[10px] leading-relaxed flex gap-2 ${logColor(entry.type)}`}>
                    <span className="shrink-0 opacity-40">
                      {entry.type === "pass" ? "✓" : entry.type === "fail" ? "○" : entry.type === "action" ? "→" : entry.type === "warn" ? "!" : "·"}
                    </span>
                    <span>{entry.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Live context + diff */}
        <div className="space-y-4">
          {/* Current state snapshot */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="text-[10px] text-primary uppercase tracking-widest font-bold">Live Console State</div>
            <div className="space-y-1.5 text-[11px]">
              {[
                { label: "Industry", value: industry?.title || state?.industry },
                { label: "Scenario", value: state?.scenario || "None" },
                { label: "Operational", value: state?.operationalState },
                { label: "Resilience", value: `${state?.resilienceScore}%` },
                { label: "Continuity", value: `${state?.continuityScore}%` },
                { label: "Route Type", value: state?.routeType },
                { label: "Problem", value: state?.problemSimulated ? "Yes" : "No" },
                { label: "Recovery", value: state?.recoveryRun ? "Yes" : "No" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between border-b border-border/20 pb-1 last:border-0">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-foreground font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="pt-1">
              <div className="text-[9px] text-muted-foreground/50 uppercase tracking-wider mb-1.5">Components</div>
              <div className="space-y-1">
                {Object.entries(state?.components || {}).map(([key, comp]) => (
                  <div key={key} className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">{industry?.components?.[key]?.label || key}</span>
                    <span className={
                      comp.status === "healthy" ? "text-[#22c55e] font-bold" :
                      comp.status === "degraded" ? "text-[#f59e0b] font-bold" :
                      "text-[#ef4444] font-bold"
                    }>{comp.status.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Outcome diff */}
          {diff !== null && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="text-[10px] text-primary uppercase tracking-widest font-bold">Outcome Delta</div>
                <Badge variant="outline" className="text-[9px] bg-secondary border-border text-muted-foreground">
                  Simulated only
                </Badge>
              </div>
              {diff.length === 0 ? (
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
                  No state changes — policy had no effect on this state.
                </div>
              ) : (
                <div className="space-y-2">
                  {diff.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 text-[10px] p-2 rounded-lg bg-secondary/40 border border-border/30">
                      <span className="text-muted-foreground/60 font-mono w-36 shrink-0 truncate">{d.field}</span>
                      <span className="text-[#ef4444]/80 line-through shrink-0">{d.before}</span>
                      <span className="text-muted-foreground/40 shrink-0">→</span>
                      <span className="text-[#22c55e] font-bold shrink-0">{d.after}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[9px] text-muted-foreground/40 font-sans leading-relaxed">
                These changes are simulated only. No live console state was modified.
              </p>
            </div>
          )}

          {/* Tip */}
          <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] text-primary font-bold">
              <Lightbulb className="w-3.5 h-3.5" /> Policy Tip
            </div>
            <p className="text-[10px] text-muted-foreground font-sans leading-relaxed">
              Use the <span className="text-primary font-semibold">Workspace tab</span> to run a scenario first, then return here to simulate how a governance policy would have changed the outcome. Great for auditor walkthroughs and compliance testing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}