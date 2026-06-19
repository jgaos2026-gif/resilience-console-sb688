import React from "react";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Shield, FileText, Lock, Eye } from "lucide-react";

const GOLD = "#C9A84C";
const STATUS_COLORS = { compliant: "#4ade80", review_needed: "#fbbf24", non_compliant: "#ef4444", pending: "#94a3b8", waived: "#60a5fa" };
const RISK_COLORS = { low: "#4ade80", medium: "#fbbf24", high: "#f97316", critical: "#ef4444" };

const CHECKPOINTS = [
  "Deposit collected before work begins",
  "24-hour refund window enforced",
  "Watermark applied to all proofs",
  "Final files held until payment confirmed",
  "Contractor uploads quarantined before client view",
  "Triple verification on all state transitions",
  "Append-only logging — no record deletions",
  "Human approval required for escalations",
  "Privacy-first — no unnecessary data collection",
  "All AI responses logged and auditable",
];

export default function RiskCompliance() {
  const { data: items = [] } = useQuery({ queryKey: ["complianceItems"], queryFn: () => base44.entities.ComplianceItem.list() });

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold font-cinzel" style={{ color: GOLD }}>Risk / Compliance</h1>
        <p className="text-xs text-muted-foreground">Audit readiness, policy tracking, and compliance monitoring</p>
      </div>

      {/* Business Registration Block */}
      <div className="rounded-xl border p-5 space-y-4" style={{ background: `${GOLD}08`, borderColor: `${GOLD}30` }}>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4" style={{ color: GOLD }} />
          <h2 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Business Registration & Standing</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: "Legal Entity",         value: "LLC – Corporation",            sub: "Jays Graphic Arts LLC · File #0906787-6",  color: "#4ade80" },
            { label: "Tax Election",          value: "S-Corporation Election",       sub: "IRS Form SS-4 / CP575G filed",         color: "#4ade80" },
            { label: "Business Name",         value: "Jays Graphic Arts LLC",        sub: "DBA Jps Professional Services",        color: GOLD },
            { label: "Owner",                 value: "John E. Arenz",                sub: "Sole Member / Organizer",              color: GOLD },
            { label: "Address",               value: "603 6th Ave Uppr",             sub: "Mendota IL 61342-2149 · LaSalle Co.",  color: "#60a5fa" },
            { label: "EIN",                   value: "39-3127122",                   sub: "IRS-issued · Notice CP575G · 07/09/2025", color: "#4ade80" },
            { label: "IL Good Standing",      value: "Good Standing ✓",              sub: "IL Sec of State · Organized 07/21/2025", color: "#4ade80" },
            { label: "IL Biz Authorization",  value: "Cert #4362-4189",              sub: "IDOR · Sales & use tax · Loc 050-0015-7-001", color: "#4ade80" },
            { label: "REG-1 Tax Account",     value: "Active ✓",                     sub: "Business Income Tax begin 08/12/2025", color: "#4ade80" },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-border p-3 space-y-0.5" style={{ background: "rgba(0,0,0,0.3)" }}>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{item.label}</p>
              <p className="text-xs font-bold" style={{ color: item.color }}>{item.value}</p>
              <p className="text-[9px] text-muted-foreground">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Warning */}
      <div className="rounded-xl border p-4 flex items-start gap-3" style={{ background: "rgba(239,68,68,0.04)", borderColor: "rgba(239,68,68,0.15)" }}>
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
        <div className="text-[10px] text-muted-foreground">
          <p className="font-semibold text-red-400">Legal Disclaimer</p>
          <p>Policies shown are operational templates and should be reviewed by a qualified attorney before public use. This system does not provide legal advice. Customer may be responsible for lawful collection and court-related costs where legally allowed.</p>
        </div>
      </div>

      {/* Audit Readiness */}
      <div className="rounded-xl border border-border p-6 space-y-4" style={{ background: "hsl(220,18%,7%)" }}>
        <h2 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Human Approval Checkpoints</h2>
        <div className="space-y-2">
          {CHECKPOINTS.map((cp, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border/20 last:border-0">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-green-400" />
              <span className="text-xs text-foreground">{cp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chain of Custody */}
      <div className="rounded-xl border border-border p-6 space-y-3" style={{ background: "hsl(220,18%,7%)" }}>
        <h2 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Chain-of-Custody Tracking</h2>
        <p className="text-[10px] text-muted-foreground">Every file, payment, and state change is logged with timestamp, source, and verification status. Logs are append-only — records accumulate forward only. This creates a defensible chain of custody for all business operations.</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Append-Only Logs", icon: Lock, desc: "No deletions allowed" },
            { label: "Triple Verification", icon: Shield, desc: "Every state verified 3x" },
            { label: "Audit Trail", icon: Eye, desc: "Full visibility" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="rounded-lg border border-border p-3 text-center space-y-1" style={{ background: "rgba(201,168,76,0.04)" }}>
                <Icon className="w-5 h-5 mx-auto" style={{ color: GOLD }} />
                <div className="text-[10px] font-semibold text-foreground">{item.label}</div>
                <div className="text-[9px] text-muted-foreground">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compliance Items */}
      <div className="rounded-xl border border-border overflow-hidden" style={{ background: "hsl(220,18%,7%)" }}>
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Compliance Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Risk</th>
                <th className="text-left p-3">Last Reviewed</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-border/30 hover:bg-secondary/20">
                  <td className="p-3 font-semibold text-foreground">{item.title}</td>
                  <td className="p-3 text-muted-foreground">{item.category?.replace(/_/g, " ")}</td>
                  <td className="p-3">
                    <Badge className="text-[8px] border font-bold" style={{ background: `${STATUS_COLORS[item.status]}15`, color: STATUS_COLORS[item.status], borderColor: `${STATUS_COLORS[item.status]}40` }}>
                      {item.status?.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <span className="font-semibold" style={{ color: RISK_COLORS[item.risk_level] }}>{item.risk_level}</span>
                  </td>
                  <td className="p-3 text-muted-foreground">{item.last_reviewed || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No compliance items. Seed data to populate.</div>}
      </div>
    </div>
  );
}