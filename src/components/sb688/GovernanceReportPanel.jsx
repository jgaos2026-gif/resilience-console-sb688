import React, { useState, useCallback, useEffect } from "react";
import {
  buildGovernanceReport, saveReport, loadAllReports,
  deleteReport, downloadReportAsJSON, verifyReport
} from "@/lib/governanceReport";
import { INDUSTRIES, SCENARIOS } from "@/lib/sb688Engine";

// ── Helpers ───────────────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const color =
    status === "healthy"  ? "bg-[#22c55e]" :
    status === "degraded" ? "bg-[#f59e0b]" : "bg-[#ef4444]";
  return <span className={`inline-block w-2 h-2 rounded-full ${color} flex-shrink-0`} />;
}

function ScorePill({ value, label }) {
  const color = value >= 80 ? "text-[#22c55e]" : value >= 50 ? "text-[#f59e0b]" : "text-[#ef4444]";
  return (
    <div className="text-center">
      <div className={`text-lg font-bold font-mono ${color}`}>{value}</div>
      <div className="text-[9px] text-[#4a4642]">{label}</div>
    </div>
  );
}

// ── Report Detail Modal ───────────────────────────────────────────────────────
function ReportDetail({ report, onClose }) {
  if (!report) return null;
  const isValid = verifyReport(report);
  const industry = INDUSTRIES[report.industry];
  const scenario = report.scenario ? SCENARIOS[report.scenario] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0e1218] border border-[#c4a350]/30 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2622]">
          <div>
            <div className="text-[#c4a350] font-bold text-sm tracking-wider">{report.reportId}</div>
            <div className="text-[10px] text-[#4a4642] mt-0.5">
              {new Date(report.generatedAt).toLocaleString()} · {industry?.title || report.industry}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] px-2 py-0.5 rounded border font-bold ${isValid ? "border-[#22c55e]/30 text-[#22c55e] bg-[#22c55e]/5" : "border-[#ef4444]/30 text-[#ef4444] bg-[#ef4444]/5"}`}>
              {isValid ? "✔ SIGNATURE VALID" : "✗ SIGNATURE INVALID"}
            </span>
            <button onClick={onClose} className="text-[#4a4642] hover:text-[#d8d3c8] text-lg px-2 transition">×</button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5 font-mono text-[11px]">
          {/* Scores */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#131820] border border-[#2a2622] rounded-lg p-3 flex justify-around">
              <ScorePill value={report.resilienceScore} label="Resilience" />
              <ScorePill value={report.continuityScore} label="Continuity" />
            </div>
            <div className="bg-[#131820] border border-[#2a2622] rounded-lg p-3 space-y-1">
              <div className="text-[9px] text-[#4a4642] uppercase tracking-wider mb-1">Operational</div>
              <div className="text-[#c4a350] font-bold text-xs">{report.operationalState}</div>
              <div className="text-[#4a4642]">Route: <span className={report.routeType === "primary" ? "text-[#22c55e]" : "text-[#f59e0b]"}>{report.routeType}</span></div>
              <div className="text-[#4a4642]">Latency: <span className="text-[#d8d3c8]">{report.routeTime}ms</span></div>
            </div>
            <div className="bg-[#131820] border border-[#2a2622] rounded-lg p-3 space-y-1">
              <div className="text-[9px] text-[#4a4642] uppercase tracking-wider mb-1">Proof Suite</div>
              {report.proofRun && report.proofResults.length > 0 ? (
                <>
                  <div className="text-[#c4a350] font-bold">{report.proofResults.filter(p=>p.pass).length}/{report.proofResults.length} passed</div>
                  {report.proofResults.map((p, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className={p.pass ? "text-[#22c55e]" : "text-[#ef4444]"}>{p.pass ? "✓" : "✗"}</span>
                      <span className="text-[#4a4642] truncate">{p.title || `Test ${i+1}`}</span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-[#4a4642] italic">Not run</div>
              )}
            </div>
          </div>

          {/* Components */}
          <div>
            <div className="text-[9px] text-[#c4a350] uppercase tracking-widest mb-2">Component Health</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {Object.entries(report.components).map(([key, comp]) => (
                <div key={key} className="flex items-center gap-2 bg-[#131820] border border-[#2a2622] rounded px-2 py-1.5">
                  <StatusDot status={comp.status} />
                  <span className="text-[#d8d3c8] flex-1 truncate">{industry?.components?.[key]?.label || key}</span>
                  <span className={`text-[9px] font-bold ${comp.status === "healthy" ? "text-[#22c55e]" : comp.status === "degraded" ? "text-[#f59e0b]" : "text-[#ef4444]"}`}>
                    {comp.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Scenario */}
          {scenario && (
            <div className="bg-[#131820] border border-[#2a2622] rounded-lg p-3 space-y-1">
              <div className="text-[9px] text-[#c4a350] uppercase tracking-widest mb-1">Active Scenario</div>
              <div className="text-[#d8d3c8] font-bold">{scenario.title}</div>
              <div className="flex gap-4 text-[10px]">
                <span>Problem: <span className={report.problemSimulated ? "text-[#ef4444]" : "text-[#22c55e]"}>{report.problemSimulated ? "Yes" : "No"}</span></span>
                <span>Recovery: <span className={report.recoveryRun ? "text-[#22c55e]" : "text-[#f59e0b]"}>{report.recoveryRun ? "Yes" : "No"}</span></span>
              </div>
            </div>
          )}

          {/* Event Log */}
          {report.eventLog?.length > 0 && (
            <div>
              <div className="text-[9px] text-[#c4a350] uppercase tracking-widest mb-2">Event Log ({report.eventLog.length} entries)</div>
              <div className="bg-[#060810] border border-[#2a2622] rounded-lg p-3 max-h-48 overflow-y-auto space-y-1">
                {report.eventLog.map((e, i) => (
                  <div key={i} className="flex gap-2 text-[10px]">
                    <span className="text-[#3a3632] shrink-0">{new Date(e.timestamp).toLocaleTimeString()}</span>
                    <span className="text-[#5a5550] leading-tight">{e.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signature */}
          <div className="bg-[#060810] border border-[#2a2622] rounded-lg p-3 space-y-1">
            <div className="text-[9px] text-[#c4a350] uppercase tracking-widest">Cryptographic Signature</div>
            <div className="text-[#3a3632] break-all leading-relaxed">{report._signature}</div>
            <div className="text-[9px] text-[#3a3632]">Schema: {report.schemaVersion} · {report.architect}</div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 border-t border-[#2a2622] flex items-center gap-2">
          <button onClick={() => downloadReportAsJSON(report)}
            className="px-3 py-1.5 border border-[#c4a350]/40 text-[#c4a350] text-[10px] rounded hover:bg-[#c4a350]/10 transition">
            ↓ Download JSON
          </button>
          <button onClick={onClose}
            className="px-3 py-1.5 border border-[#3a3632] text-[#6b6558] text-[10px] rounded hover:text-[#d8d3c8] transition ml-auto">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export default function GovernanceReportPanel({ state }) {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [justExported, setJustExported] = useState(false);

  useEffect(() => {
    setReports(loadAllReports());
  }, []);

  const handleExport = useCallback(() => {
    const report = buildGovernanceReport(state, { note });
    saveReport(report);
    downloadReportAsJSON(report);
    setReports(loadAllReports());
    setNote("");
    setJustExported(true);
    setTimeout(() => setJustExported(false), 2000);
  }, [state, note]);

  const handleDelete = useCallback((id, e) => {
    e.stopPropagation();
    deleteReport(id);
    setReports(loadAllReports());
  }, []);

  const industry = INDUSTRIES[state?.industry];

  return (
    <div className="bg-[#0e1218] border border-[#c4a350]/20 rounded-lg p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <div className="text-[10px] text-[#c4a350] uppercase tracking-widest font-bold">
            Governance Report Generator
          </div>
          <div className="text-[9px] text-[#4a4642] mt-0.5">
            Cryptographically signed JSON snapshot · Regulatory compliance · Full state capture
          </div>
        </div>
        <span className="text-[9px] px-2 py-0.5 border border-[#c4a350]/20 text-[#c4a350]/60 rounded">
          {reports.length} report{reports.length !== 1 ? "s" : ""} stored
        </span>
      </div>

      {/* Export controls */}
      <div className="flex items-end gap-2 flex-wrap">
        <div className="flex-1 min-w-48 space-y-1">
          <label className="text-[9px] text-[#4a4642] uppercase tracking-wider">Audit Note (optional)</label>
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. Post-incident compliance export"
            className="w-full bg-[#060810] border border-[#2a2622] text-[#d8d3c8] text-[10px] px-3 py-1.5 rounded focus:outline-none focus:border-[#c4a350]/40 placeholder-[#3a3632]"
          />
        </div>
        <button onClick={handleExport}
          className={`px-4 py-1.5 border text-[10px] font-bold rounded transition ${
            justExported
              ? "border-[#22c55e]/50 text-[#22c55e] bg-[#22c55e]/5"
              : "border-[#c4a350]/50 text-[#c4a350] hover:bg-[#c4a350]/10"
          }`}>
          {justExported ? "✔ Exported" : "⬇ Export Signed Report"}
        </button>
      </div>

      {/* What's captured */}
      <div className="flex flex-wrap gap-1.5">
        {["Operational State","Component Health","Active Incidents","Event Log","Proof Suite","Trusted Chain","Route Analysis","HMAC Signature"].map(tag => (
          <span key={tag} className="text-[9px] px-2 py-0.5 border border-[#22c55e]/15 text-[#22c55e]/60 rounded-full">✓ {tag}</span>
        ))}
      </div>

      {/* History viewer */}
      {reports.length > 0 && (
        <div>
          <div className="text-[9px] text-[#c4a350] uppercase tracking-widest mb-2">Incident Report History</div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {reports.map((r) => {
              const isValid = verifyReport(r);
              const d = new Date(r.generatedAt);
              const ind = INDUSTRIES[r.industry];
              const healthy = Object.values(r.components || {}).filter(c => c.status === "healthy").length;
              const total = Object.values(r.components || {}).length;
              return (
                <div key={r.reportId}
                  onClick={() => setSelected(r)}
                  className="flex items-center gap-3 bg-[#131820] border border-[#2a2622] hover:border-[#c4a350]/30 rounded-lg px-3 py-2 cursor-pointer transition group">
                  {/* Validity dot */}
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isValid ? "bg-[#22c55e]" : "bg-[#ef4444]"}`} />

                  {/* Date */}
                  <div className="text-[9px] text-[#4a4642] font-mono shrink-0 w-28">
                    {d.toLocaleDateString()} {d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}
                  </div>

                  {/* Industry + state */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-[#d8d3c8] truncate font-semibold">{r.reportId}</div>
                    <div className="text-[9px] text-[#4a4642] truncate">
                      {ind?.title || r.industry} · {r.operationalState} · {healthy}/{total} healthy
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="hidden sm:flex items-center gap-3 text-[9px] shrink-0">
                    <span className={r.resilienceScore >= 80 ? "text-[#22c55e]" : r.resilienceScore >= 50 ? "text-[#f59e0b]" : "text-[#ef4444]"}>
                      R:{r.resilienceScore}%
                    </span>
                    <span className={r.continuityScore >= 80 ? "text-[#22c55e]" : r.continuityScore >= 50 ? "text-[#f59e0b]" : "text-[#ef4444]"}>
                      C:{r.continuityScore}%
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={e => { e.stopPropagation(); downloadReportAsJSON(r); }}
                      className="text-[9px] px-2 py-0.5 border border-[#c4a350]/30 text-[#c4a350] rounded hover:bg-[#c4a350]/10 transition">
                      ↓
                    </button>
                    <button onClick={e => handleDelete(r.reportId, e)}
                      className="text-[9px] px-2 py-0.5 border border-[#ef4444]/20 text-[#ef4444]/60 rounded hover:bg-[#ef4444]/10 transition">
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {reports.length === 0 && (
        <div className="text-center py-6 text-[#3a3632] text-[10px] border border-dashed border-[#2a2622] rounded-lg">
          No reports yet. Export your first governance snapshot above.
        </div>
      )}

      {/* Detail modal */}
      {selected && <ReportDetail report={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}