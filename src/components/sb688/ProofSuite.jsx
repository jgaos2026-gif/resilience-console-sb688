import React from "react";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";

export default function ProofSuite({ state }) {
  if (!state.proofRun || state.proofResults.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5" /> Proof & Verification Suite
        </h3>
        <p className="text-sm text-muted-foreground italic">Run the Proof Suite from the Control Panel to see verification results.</p>
      </div>
    );
  }

  const passCount = state.proofResults.filter((p) => p.pass).length;
  const total = state.proofResults.length;

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5" /> Proof & Verification Suite
        </h3>
        <Badge
          className={`text-xs font-bold ${passCount === total ? "bg-teal-500/20 text-teal-400 border-teal-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"} border`}
        >
          {passCount}/{total} Passed
        </Badge>
      </div>
      <div className="space-y-2">
        {state.proofResults.map((proof, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg border transition-all duration-300 ${
              proof.pass
                ? "bg-teal-500/5 border-teal-500/20"
                : "bg-red-500/5 border-red-500/20"
            }`}
          >
            <div className="flex items-center gap-2">
              {proof.pass ? (
                <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              )}
              <span className="text-sm font-semibold text-foreground">{proof.title}</span>
              <Badge
                variant="outline"
                className={`ml-auto text-[10px] px-1.5 py-0 ${
                  proof.pass ? "text-teal-400 border-teal-500/30" : "text-red-400 border-red-500/30"
                }`}
              >
                {proof.pass ? "PASS" : "FAIL"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 ml-6">{proof.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}