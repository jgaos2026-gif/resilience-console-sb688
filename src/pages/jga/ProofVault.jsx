import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Archive, Search, Plus, CheckCircle2, Shield, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const GOLD = "#C9A84C";
const STAGE_COLORS = { unverified: "#94a3b8", verified: "#60a5fa", validated: "#a78bfa", certified: "#4ade80" };
const VIS_COLORS = { private: "#ef4444", internal: "#f59e0b", investor: "#a78bfa", public: "#4ade80" };

export default function ProofVault() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const queryClient = useQueryClient();
  const { data: proofs = [] } = useQuery({ queryKey: ["proofRecords"], queryFn: () => base44.entities.ProofRecord.list() });

  const createMutation = useMutation({
    mutationFn: () => base44.entities.ProofRecord.create({
      title: `Proof Packet — ${new Date().toLocaleDateString()}`,
      category: "system",
      related_module: "Council",
      status: "generated",
      hash: `sha256:${Math.random().toString(36).substring(2, 14)}`,
      verification_stage: "unverified",
      visibility: "internal",
      notes: "Auto-generated proof packet summary from Demo Council.",
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["proofRecords"] }); toast.success("Proof packet generated"); },
  });

  const cats = ["all", "system", "business", "node", "memory", "recovery", "client", "contractor", "compliance", "daily_report"];
  const filtered = proofs.filter(p => {
    if (catFilter !== "all" && p.category !== catFilter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold font-cinzel" style={{ color: GOLD }}>Proof Vault</h1>
          <p className="text-xs text-muted-foreground">{proofs.length} records — evidence, reports, and verification proof</p>
        </div>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="text-xs font-bold"
          style={{ background: "rgba(201,168,76,0.1)", color: GOLD, border: `1px solid rgba(201,168,76,0.3)` }}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Generate Proof Packet
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search proofs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-xs bg-secondary border-border" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {cats.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className="px-2.5 py-1 rounded-md text-[9px] font-semibold uppercase tracking-wider transition-all"
              style={catFilter === c ? { background: "rgba(201,168,76,0.15)", color: GOLD } : { color: "rgba(255,255,255,0.3)" }}>
              {c.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Proof Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(proof => {
          const stageColor = STAGE_COLORS[proof.verification_stage] || "#94a3b8";
          const visColor = VIS_COLORS[proof.visibility] || "#94a3b8";
          return (
            <div key={proof.id} className="rounded-xl border border-border p-4 space-y-2" style={{ background: "hsl(220,18%,7%)" }}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">{proof.title}</h3>
                <Badge className="text-[8px] border font-bold uppercase flex-shrink-0" style={{ background: `${stageColor}15`, color: stageColor, borderColor: `${stageColor}40` }}>
                  {proof.verification_stage}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-[9px]">
                <Badge className="text-[8px] border" style={{ background: "rgba(201,168,76,0.06)", color: "rgba(201,168,76,0.5)", borderColor: "rgba(201,168,76,0.15)" }}>
                  {proof.category?.replace(/_/g, " ")}
                </Badge>
                <Badge className="text-[8px] border" style={{ background: `${visColor}10`, color: visColor, borderColor: `${visColor}30` }}>
                  {proof.visibility}
                </Badge>
                {proof.related_module && <span className="text-muted-foreground">· {proof.related_module}</span>}
              </div>
              {proof.hash && <div className="text-[9px] font-mono text-muted-foreground truncate">{proof.hash}</div>}
              {proof.notes && <p className="text-[10px] text-muted-foreground">{proof.notes}</p>}
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No proof records found.</div>}
    </div>
  );
}