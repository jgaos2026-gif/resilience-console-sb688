import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { INDUSTRIES, SCENARIOS } from "@/lib/sb688Engine";
import { Loader2, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AIScenarioNarrator({ state }) {
  const [narrative, setNarrative] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastStateKey, setLastStateKey] = useState(null);

  const stateKey = `${state.industry}-${state.scenario}-${state.problemSimulated}-${state.recoveryRun}-${state.operationalState}`;

  const generateNarrative = useCallback(async () => {
    setIsGenerating(true);
    const industry = INDUSTRIES[state.industry];
    const scenario = state.scenario ? SCENARIOS[state.scenario] : null;

    const phase = state.recoveryRun
      ? "post-recovery"
      : state.problemSimulated
      ? "active-incident"
      : state.scenarioLoaded
      ? "pre-incident"
      : "baseline";

    const prompt = `You are writing a live mission narrative for the SB688 Universal Resilience Console.

Industry: ${industry.title}
Phase: ${phase}
Operational State: ${state.operationalState}
Resilience Score: ${state.resilienceScore}%
Active Scenario: ${scenario ? scenario.title + " — " + scenario.description : "No scenario active"}
Problem Simulated: ${state.problemSimulated}
Recovery Run: ${state.recoveryRun}
Approved Route: ${state.approvedRoute.map(k => industry.components[k]?.label || k).join(" → ")}
Route Type: ${state.routeType}
Trusted Record Version: v${state.trustedRecordVersion}

Write a 2-3 sentence plain-English mission narrative that explains:
- What is currently happening in this ${industry.title} environment
- What the system did or is doing about it
- What the business outcome is

Write in present tense. Be specific to the industry. Be precise. No bullet points — flowing prose only.`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    setNarrative(result);
    setLastStateKey(stateKey);
    setIsGenerating(false);
  }, [state, stateKey]);

  // Auto-generate when state changes meaningfully
  useEffect(() => {
    if (stateKey !== lastStateKey && (state.problemSimulated || state.recoveryRun || state.scenarioLoaded)) {
      generateNarrative();
    }
  }, [stateKey, lastStateKey, generateNarrative, state.problemSimulated, state.recoveryRun, state.scenarioLoaded]);

  if (!narrative && !isGenerating) return null;

  return (
    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold">AI Mission Narrative</span>
        </div>
        {narrative && !isGenerating && (
          <Button
            onClick={generateNarrative}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-blue-400"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        )}
      </div>
      {isGenerating ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
          Generating mission narrative...
        </div>
      ) : (
        <p className="text-xs text-foreground/80 leading-relaxed">{narrative}</p>
      )}
    </div>
  );
}