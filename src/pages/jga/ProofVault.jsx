/**
 * ProofVault.jsx — Wired to real /api/proof
 */
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Archive, Search, Plus, CheckCircle2, Shield, Lock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/apiClient";

const GOLD = "#C9A84C";

export default function ProofVault() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: proofs = [], isLoading } = useQuery({
    queryKey: ["proofRecords"],
    queryFn:  () => api.get("/api/proof"),
    refetchInterval: 30000,
  });

  const generateMutation = useMutation({
    mutationFn: () => api.post("/api/proof/generate", { category: "system", visibility: "internal" }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["proofRecords"] });
      toast.success(`Proof generated — ${data.hash?.slice(0, 20)}…`);
    },
    onError: err => toast.error(err.message),
  });

  const verifyMutation = useMutation({
    mutationFn: id => api.get(`/api/proof/${id}/verify`),
    onSuccess: data => {
      toast[data.topologyPreserved ? "success" : "error"](
        data.topologyPreserved ? "Topology preserved ✓" : `Topology drift detected! ${data.status}`
      );
    },
  });

  const filtered = proofs.filter(p =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold font-mono" style={{ color: GOLD }}>Proof Vault</h1>
          <p className="text-xs text-muted-foreground">{proofs.length} records — Alexander invariant certified proofs</p>
        </div>
        <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}
          className="text-xs font-bold font-mono"
          style={{ background: "rgba(201,168,76,0.12)", color: GOLD, border: "1px solid rgba(201,168,76,0.3)" }}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Generate Proof Packet
        </Button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search proofs…" value={search} onChange={e => setSearch(e.target.value)}
          className="pl-9 h-9 text-xs bg-secondary border-border font-mono" />
      </div>

      {isLoading && <p className="text-xs text-muted-foreground font-mono">Loading vault…</p>}

      <div className="space-y-2">
        {filtered.map(p => (
          <div key={p.id} className="rounded-xl border border-border p-4 space-y-2" style={{ background: "hsl(220,18%,7%)" }}>
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="space-y-0.5 flex-1 min-w-0">
                <p className="text-xs font-bold font-mono truncate">{p.title}</p>
                <p className="text-[9px] text-muted-foreground font-mono truncate">{p.hash}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="text-[9px] font-mono border"
                  style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", borderColor: "rgba(74,222,128,0.3)" }}>
                  {p.status?.toUpperCase()}
                </Badge>
                <Badge className="text-[9px] font-mono border"
                  style={{ background: "rgba(201,168,76,0.08)", color: GOLD, borderColor: "rgba(201,168,76,0.2)" }}>
                  {p.visibility}
                </Badge>
              </div>
            </div>
            {p.invariant && (
              <p className="text-[9px] font-mono text-muted-foreground">
                tr₀.₃={p.invariant.trace03?.toFixed(4)} · tr₀.₇={p.invariant.trace07?.toFixed(4)} · blocks={p.chain_index}
              </p>
            )}
            <p className="text-[9px] text-muted-foreground">{p.created_at?.slice(0, 19)}</p>
            <Button size="sm" disabled={verifyMutation.isPending}
              className="h-7 text-[10px] font-mono"
              style={{ background: "rgba(96,165,250,0.08)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}
              onClick={() => verifyMutation.mutate(p.id)}>
              <Shield className="w-3 h-3 mr-1" /> Verify Topology
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
