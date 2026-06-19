import React from "react";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Building2, Users, DollarSign, FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const GOLD = "#C9A84C";

function StatCard({ label, value, sub, color, icon: Icon }) {
  return (
    <div className="rounded-xl border border-border p-4 space-y-1" style={{ background: "hsl(220,18%,7%)" }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="text-xl font-bold font-mono" style={{ color }}>{value}</div>
      {sub && <div className="text-[9px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

const ORDER_STATUS_COLORS = {
  intake: "#94a3b8", deposit_pending: "#f59e0b", in_progress: "#60a5fa", proof_sent: "#a78bfa",
  revision: "#fbbf24", approved: "#4ade80", watermarked: "#ec4899", final_released: GOLD,
  completed: "#22c55e", refund_window: "#f97316", cancelled: "#ef4444",
};

export default function JGABusinessOS() {
  const { data: clients = [] } = useQuery({ queryKey: ["bizClients"], queryFn: () => base44.entities.BusinessClient.list() });
  const { data: orders = [] } = useQuery({ queryKey: ["bizOrders"], queryFn: () => base44.entities.DesignOrder.list() });
  const { data: payments = [] } = useQuery({ queryKey: ["bizPayments"], queryFn: () => base44.entities.PaymentRecord.list() });
  const { data: contractors = [] } = useQuery({ queryKey: ["bizContractors"], queryFn: () => base44.entities.Contractor.list() });

  const totalRevenue = payments.filter(p => p.status === "completed").reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold font-cinzel" style={{ color: GOLD }}>JGA Business OS</h1>
        <p className="text-xs text-muted-foreground">Business command center — orders, clients, contractors, payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Clients" value={clients.length} color="#60a5fa" icon={Users} sub="Total registered" />
        <StatCard label="Active Orders" value={orders.filter(o => !["completed", "cancelled"].includes(o.status)).length} color={GOLD} icon={FileText} sub={`${orders.length} total`} />
        <StatCard label="Revenue" value={`$${totalRevenue.toLocaleString()}`} color="#4ade80" icon={DollarSign} sub="Completed payments" />
        <StatCard label="Contractors" value={contractors.length} color="#a78bfa" icon={Building2} sub="Active roster" />
      </div>

      {/* Business Rules */}
      <div className="rounded-xl border border-border p-5 space-y-3" style={{ background: "hsl(220,18%,7%)" }}>
        <h2 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Business Rules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
          {[
            "35% upfront deposit required before work begins",
            "24-hour full refund window after deposit payment",
            "After 24 hours, deposit becomes non-refundable as work begins",
            "25% of System B deposit may go toward contractor/sales payout",
            "Final work released only after watermark removal and final payment",
            "Three reminders before escalation; phone call after reminders",
            "Print markup: 5% applied to all print orders",
            "Professional, legally cautious language in all communications",
          ].map((rule, i) => (
            <div key={i} className="flex items-start gap-2 py-1">
              <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: GOLD }} />
              <span className="text-muted-foreground">{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two Tracks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border p-5 space-y-3" style={{ background: "hsl(220,18%,7%)" }}>
          <Badge className="text-[9px] border font-bold" style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", borderColor: "rgba(96,165,250,0.3)" }}>SYSTEM A</Badge>
          <h3 className="text-sm font-semibold text-foreground">AI Automation Track</h3>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            {["Intake", "Pricing", "Design Brief", "Proofing", "Invoice", "Report"].map((s, i) => (
              <div key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" />{s}</div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border p-5 space-y-3" style={{ background: "hsl(220,18%,7%)" }}>
          <Badge className="text-[9px] border font-bold" style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", borderColor: "rgba(167,139,250,0.3)" }}>SYSTEM B</Badge>
          <h3 className="text-sm font-semibold text-foreground">Contractor Marketplace Track</h3>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            {["Contractor Assignment", "Contractor Payout", "Proof Upload", "Client Approval", "Final Release"].map((s, i) => (
              <div key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" />{s}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-border overflow-hidden" style={{ background: "hsl(220,18%,7%)" }}>
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Client</th>
                <th className="text-left p-3">Track</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Amount</th>
                <th className="text-left p-3">Watermark</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const sc = ORDER_STATUS_COLORS[order.status] || "#94a3b8";
                return (
                  <tr key={order.id} className="border-b border-border/30 hover:bg-secondary/20">
                    <td className="p-3 font-semibold text-foreground">{order.title}</td>
                    <td className="p-3 text-muted-foreground">{order.client_name}</td>
                    <td className="p-3">
                      <Badge className="text-[8px] border" style={order.track === "system_a" ? { background: "rgba(96,165,250,0.1)", color: "#60a5fa", borderColor: "rgba(96,165,250,0.3)" } : { background: "rgba(167,139,250,0.1)", color: "#a78bfa", borderColor: "rgba(167,139,250,0.3)" }}>
                        {order.track === "system_a" ? "A" : "B"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className="text-[8px] border font-bold" style={{ background: `${sc}15`, color: sc, borderColor: `${sc}40` }}>
                        {order.status?.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono" style={{ color: "#4ade80" }}>${order.amount?.toLocaleString() || "—"}</td>
                    <td className="p-3">
                      <span className="text-[9px]" style={{ color: order.watermark_status === "active" ? "#ec4899" : order.watermark_status === "removed" ? "#4ade80" : "#94a3b8" }}>
                        {order.watermark_status || "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No orders yet.</div>}
      </div>
    </div>
  );
}