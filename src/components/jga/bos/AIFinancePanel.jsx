import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { DollarSign, TrendingUp, FileText, Heart, Loader2, ChevronDown, ChevronUp, Landmark, PiggyBank, ReceiptText, Scale } from "lucide-react";

const GOLD = "#C9A84C";

const MODULES = [
  {
    id: "banking",
    icon: Landmark,
    label: "Banking & Record Keeping",
    color: "#60a5fa",
    prompt: (data) => `You are an AI CFO for a small creative business called JGA Enterprises (Jay's Graphic Arts) in Mendota, IL. 
Business data: ${JSON.stringify(data)}
Provide a banking and record-keeping summary including:
1. Cash flow health assessment
2. Recommended banking practices (separate accounts, reserve fund rules)
3. Record keeping checklist (what to track daily/weekly/monthly)
4. Red flags to watch for
5. Action items this week
Be specific, practical, and speak like a trusted financial advisor.`,
    schema: { type: "object", properties: { health: { type: "string" }, banking_tips: { type: "array", items: { type: "string" } }, record_checklist: { type: "array", items: { type: "string" } }, red_flags: { type: "array", items: { type: "string" } }, actions: { type: "array", items: { type: "string" } } } }
  },
  {
    id: "taxes",
    icon: ReceiptText,
    label: "Taxes, Write-Offs & Year-End",
    color: "#4ade80",
    prompt: (data) => `You are a tax strategist for JGA Enterprises, a graphic arts LLC in Illinois.
Business data: ${JSON.stringify(data)}
Provide a comprehensive tax strategy including:
1. Estimated quarterly tax obligations
2. Top write-off categories for a design/creative business
3. Year-end tax checklist (what to do before Dec 31)
4. Home office, vehicle, equipment deductions guide
5. Illinois-specific tax considerations
6. Retirement accounts to reduce taxable income
Be specific with dollar thresholds and percentages where relevant.`,
    schema: { type: "object", properties: { quarterly_estimate: { type: "string" }, write_offs: { type: "array", items: { type: "string" } }, year_end_checklist: { type: "array", items: { type: "string" } }, illinois_notes: { type: "string" }, retirement_tip: { type: "string" } } }
  },
  {
    id: "compliance",
    icon: Scale,
    label: "Compliance & Legal",
    color: "#a78bfa",
    prompt: (data) => `You are a compliance officer for JGA Enterprises, a creative services LLC in Illinois.
Business data: ${JSON.stringify(data)}
Provide a compliance health report including:
1. LLC compliance checklist for Illinois
2. Contract requirements for design/creative work
3. Payment terms and refund policy legal language requirements
4. Data privacy obligations (client data)
5. Contractor vs employee classification risks
6. IP ownership clauses to include in every agreement`,
    schema: { type: "object", properties: { llc_checklist: { type: "array", items: { type: "string" } }, contract_requirements: { type: "array", items: { type: "string" } }, legal_language: { type: "string" }, privacy_obligations: { type: "array", items: { type: "string" } }, contractor_risks: { type: "string" }, ip_clauses: { type: "array", items: { type: "string" } } } }
  },
  {
    id: "investment",
    icon: TrendingUp,
    label: "Investment & Angel Repayment",
    color: GOLD,
    prompt: (data) => `You are an investment strategist for JGA Enterprises, a creative tech startup seeking angel investment.
Business data: ${JSON.stringify(data)}
Provide an investment and repayment strategy including:
1. Angel investor pitch summary (what to highlight)
2. Repayment structure options (revenue share, equity, convertible note)
3. Valuation approach for a pre-revenue creative tech company
4. Investor update cadence and reporting requirements
5. Key metrics investors want to see monthly
6. Red lines — what NOT to give away`,
    schema: { type: "object", properties: { pitch_summary: { type: "string" }, repayment_options: { type: "array", items: { type: "string" } }, valuation_approach: { type: "string" }, investor_updates: { type: "string" }, key_metrics: { type: "array", items: { type: "string" } }, red_lines: { type: "array", items: { type: "string" } } } }
  },
  {
    id: "charity",
    icon: Heart,
    label: "Charity & Donation Strategy",
    color: "#ef4444",
    prompt: (data) => `You are a charitable giving strategist for JGA Enterprises in Illinois.
Business data: ${JSON.stringify(data)}
Provide a charitable giving and community strategy including:
1. How to structure charitable giving for maximum tax benefit
2. In-kind donation strategy (design services as donations)
3. Best charity structures for a small LLC (donor-advised fund, direct donations)
4. Community impact initiatives that also build brand
5. Illinois charitable deduction rules
6. How to document and prove donations for IRS`,
    schema: { type: "object", properties: { tax_structure: { type: "string" }, in_kind_strategy: { type: "string" }, charity_options: { type: "array", items: { type: "string" } }, brand_initiatives: { type: "array", items: { type: "string" } }, illinois_rules: { type: "string" }, documentation: { type: "array", items: { type: "string" } } } }
  },
  {
    id: "sales",
    icon: DollarSign,
    label: "Sales Follow-Ups & Pipeline",
    color: "#f97316",
    prompt: (data) => `You are a sales coach for JGA Enterprises, a graphic arts and design business.
Business data: ${JSON.stringify(data)}
Provide a sales strategy including:
1. Follow-up sequence (day 1, 3, 7, 14 scripts)
2. Cold outreach templates for design services
3. Upsell opportunities for existing clients
4. How to handle objections (price, timeline, quality concerns)
5. Referral program structure
6. Best platforms and channels for JGA to find new clients`,
    schema: { type: "object", properties: { followup_sequence: { type: "array", items: { type: "object", properties: { day: { type: "string" }, script: { type: "string" } } } }, cold_outreach: { type: "string" }, upsell_ideas: { type: "array", items: { type: "string" } }, objection_handling: { type: "array", items: { type: "object", properties: { objection: { type: "string" }, response: { type: "string" } } } }, referral_structure: { type: "string" }, best_channels: { type: "array", items: { type: "string" } } } }
  },
];

function ResultDisplay({ id, data }) {
  if (id === "banking") return (
    <div className="space-y-3 text-xs">
      <div className="p-3 rounded-lg border" style={{ background: "rgba(96,165,250,0.05)", borderColor: "rgba(96,165,250,0.2)" }}>
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Cash Flow Health</p>
        <p className="text-foreground">{data.health}</p>
      </div>
      <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Banking Tips</p>
        {data.banking_tips?.map((t, i) => <p key={i} className="text-muted-foreground py-0.5">• {t}</p>)}</div>
      <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Record Checklist</p>
        {data.record_checklist?.map((t, i) => <p key={i} className="text-muted-foreground py-0.5">☐ {t}</p>)}</div>
      <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">⚠ Red Flags</p>
        {data.red_flags?.map((t, i) => <p key={i} className="text-red-400 py-0.5">• {t}</p>)}</div>
      <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">This Week</p>
        {data.actions?.map((t, i) => <p key={i} style={{ color: GOLD }} className="py-0.5">→ {t}</p>)}</div>
    </div>
  );
  if (id === "taxes") return (
    <div className="space-y-3 text-xs">
      <div className="p-3 rounded-lg border" style={{ background: "rgba(74,222,128,0.05)", borderColor: "rgba(74,222,128,0.2)" }}>
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Quarterly Estimate</p>
        <p className="text-foreground">{data.quarterly_estimate}</p>
      </div>
      <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Top Write-Offs</p>
        {data.write_offs?.map((t, i) => <p key={i} className="text-muted-foreground py-0.5">✓ {t}</p>)}</div>
      <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Year-End Checklist</p>
        {data.year_end_checklist?.map((t, i) => <p key={i} className="text-muted-foreground py-0.5">☐ {t}</p>)}</div>
      <p className="text-[10px] text-muted-foreground"><span style={{ color: GOLD }}>IL Note:</span> {data.illinois_notes}</p>
      <p className="text-[10px]" style={{ color: "#4ade80" }}>💡 {data.retirement_tip}</p>
    </div>
  );
  if (id === "compliance") return (
    <div className="space-y-3 text-xs">
      <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">LLC Checklist</p>
        {data.llc_checklist?.map((t, i) => <p key={i} className="text-muted-foreground py-0.5">☐ {t}</p>)}</div>
      <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Contract Requirements</p>
        {data.contract_requirements?.map((t, i) => <p key={i} className="text-muted-foreground py-0.5">• {t}</p>)}</div>
      <p className="text-[10px] text-muted-foreground"><span style={{ color: "#a78bfa" }}>Contractor Risk:</span> {data.contractor_risks}</p>
      <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">IP Clauses</p>
        {data.ip_clauses?.map((t, i) => <p key={i} className="text-muted-foreground py-0.5">• {t}</p>)}</div>
    </div>
  );
  if (id === "investment") return (
    <div className="space-y-3 text-xs">
      <div className="p-3 rounded-lg border" style={{ background: `${GOLD}08`, borderColor: `${GOLD}25` }}>
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Pitch Summary</p>
        <p className="text-foreground">{data.pitch_summary}</p>
      </div>
      <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Repayment Options</p>
        {data.repayment_options?.map((t, i) => <p key={i} className="text-muted-foreground py-0.5">• {t}</p>)}</div>
      <p className="text-[10px] text-muted-foreground"><span style={{ color: GOLD }}>Valuation:</span> {data.valuation_approach}</p>
      <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Key Metrics</p>
        {data.key_metrics?.map((t, i) => <p key={i} className="text-muted-foreground py-0.5">📊 {t}</p>)}</div>
      <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1 text-red-400">Red Lines — Never Give Away</p>
        {data.red_lines?.map((t, i) => <p key={i} className="text-red-400 py-0.5">✗ {t}</p>)}</div>
    </div>
  );
  if (id === "charity") return (
    <div className="space-y-3 text-xs">
      <p className="text-[10px] text-muted-foreground">{data.tax_structure}</p>
      <p className="text-[10px]" style={{ color: "#ef4444" }}>💝 {data.in_kind_strategy}</p>
      <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Brand Initiatives</p>
        {data.brand_initiatives?.map((t, i) => <p key={i} className="text-muted-foreground py-0.5">• {t}</p>)}</div>
      <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Documentation Required</p>
        {data.documentation?.map((t, i) => <p key={i} className="text-muted-foreground py-0.5">☐ {t}</p>)}</div>
    </div>
  );
  if (id === "sales") return (
    <div className="space-y-3 text-xs">
      <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-2">Follow-Up Sequence</p>
        {data.followup_sequence?.map((s, i) => (
          <div key={i} className="mb-2 p-2 rounded border border-border/40" style={{ background: "rgba(249,115,22,0.05)" }}>
            <p className="font-bold" style={{ color: "#f97316" }}>Day {s.day}</p>
            <p className="text-muted-foreground mt-0.5">{s.script}</p>
          </div>
        ))}</div>
      <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Upsell Ideas</p>
        {data.upsell_ideas?.map((t, i) => <p key={i} className="text-muted-foreground py-0.5">💰 {t}</p>)}</div>
      <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Best Channels</p>
        {data.best_channels?.map((t, i) => <p key={i} style={{ color: "#f97316" }} className="py-0.5">→ {t}</p>)}</div>
    </div>
  );
  return <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>;
}

export default function AIFinancePanel({ payments, clients, orders, contractors }) {
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(null);
  const [results, setResults] = useState({});

  const bizData = {
    total_revenue: payments.filter(p => p.status === "completed").reduce((s, p) => s + (p.amount || 0), 0),
    pending_payments: payments.filter(p => p.status === "pending").reduce((s, p) => s + (p.amount || 0), 0),
    total_clients: clients.length,
    active_orders: orders.filter(o => !["completed", "cancelled"].includes(o.status)).length,
    contractors: contractors.length,
    location: "Mendota, IL",
    business_type: "Graphic Arts / Creative Services LLC",
    phase: "Illinois Pilot Phase 1",
  };

  const run = async (mod) => {
    setLoading(mod.id);
    setExpanded(mod.id);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: mod.prompt(bizData),
      response_json_schema: mod.schema,
      model: "claude_sonnet_4_6",
    });
    setResults(prev => ({ ...prev, [mod.id]: res }));
    setLoading(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-muted-foreground italic">Note: AI Finance modules use Claude Sonnet — higher quality AI, uses more integration credits.</p>
      {MODULES.map(mod => {
        const Icon = mod.icon;
        const isOpen = expanded === mod.id;
        const isLoading = loading === mod.id;
        const hasResult = !!results[mod.id];
        return (
          <div key={mod.id} className="rounded-xl border border-border overflow-hidden" style={{ background: "hsl(220,18%,7%)" }}>
            <button
              className="w-full flex items-center justify-between p-4 text-left transition hover:bg-secondary/20"
              onClick={() => {
                if (!hasResult && !isLoading) run(mod);
                else setExpanded(isOpen ? null : mod.id);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${mod.color}15`, border: `1px solid ${mod.color}30` }}>
                  <Icon className="w-4 h-4" style={{ color: mod.color }} />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{mod.label}</p>
                  <p className="text-[9px] text-muted-foreground">AI-powered analysis</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasResult && <Badge className="text-[8px] border" style={{ background: "rgba(74,222,128,0.08)", color: "#4ade80", borderColor: "rgba(74,222,128,0.25)" }}>Ready</Badge>}
                {isLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: mod.color }} />
                  : isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-border p-4">
                {isLoading
                  ? <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-3.5 h-3.5 animate-spin" /> AI analyzing your business data...</div>
                  : hasResult
                    ? <ResultDisplay id={mod.id} data={results[mod.id]} />
                    : null}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}