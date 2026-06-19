import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Brain, Database, Shield, Zap, CheckCircle2, Lock, Download, AlertTriangle } from "lucide-react";

const GOLD = "#C9A84C";
const POCKET_STATUS_COLORS = {
  loaded: { bg: "rgba(34,197,94,0.1)", color: "#4ade80", border: "rgba(34,197,94,0.3)" },
  unloaded: { bg: "rgba(148,163,184,0.1)", color: "#94a3b8", border: "rgba(148,163,184,0.3)" },
  quarantined: { bg: "rgba(239,68,68,0.1)", color: "#f87171", border: "rgba(239,68,68,0.3)" },
  cold: { bg: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "rgba(96,165,250,0.3)" },
  verifying: { bg: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "rgba(251,191,36,0.3)" },
};

const BRAID_STRANDS = [
  { name: "Logic Strand A", type: "Thick Logic", color: GOLD },
  { name: "Logic Strand B", type: "Thick Logic", color: GOLD },
  { name: "Logic Strand C", type: "Thick Logic", color: GOLD },
  { name: "Comprehension Weave", type: "Comprehension", color: "#a78bfa" },
  { name: "Speech Branch", type: "22-Strand Branch", color: "#60a5fa" },
  { name: "Emotion Loop", type: "22-Strand Branch", color: "#ec4899" },
];

export default function MemoryBraid() {
  const queryClient = useQueryClient();
  const { data: pockets = [] } = useQuery({ queryKey: ["memoryPockets"], queryFn: () => base44.entities.MemoryPocket.list() });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MemoryPocket.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["memoryPockets"] }),
  });

  const handleAction = (pocket, action) => {
    const updates = {
      load: { status: "loaded", loaded_active: true },
      unload: { status: "unloaded", loaded_active: false },
      quarantine: { status: "quarantined", loaded_active: false },
      cold: { status: "cold", loaded_active: false },
      verify: { status: "verifying" },
    };
    updateMutation.mutate({ id: pocket.id, data: updates[action] });
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold font-cinzel" style={{ color: GOLD }}>Memory Braid</h1>
        <p className="text-xs text-muted-foreground">66-strand braid architecture — memory is loaded only through verified pockets</p>
      </div>

      {/* Braid Architecture Visual */}
      <div className="rounded-xl border border-border p-6 space-y-4" style={{ background: "hsl(220,18%,7%)" }}>
        <h2 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Braid Architecture</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BRAID_STRANDS.map((s, i) => (
            <div key={i} className="rounded-lg border p-3 flex items-center gap-3" style={{ borderColor: `${s.color}30`, background: `${s.color}08` }}>
              <div className="w-3 h-12 rounded-full" style={{ background: `linear-gradient(180deg, ${s.color}, ${s.color}40)` }} />
              <div>
                <div className="text-xs font-semibold" style={{ color: s.color }}>{s.name}</div>
                <div className="text-[9px] text-muted-foreground">{s.type}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground pt-2">
          <span className="flex items-center gap-1"><Brain className="w-3 h-3" /> 66 total strands</span>
          <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> 3 thick logic strands</span>
          <span className="flex items-center gap-1"><Database className="w-3 h-3" /> 22-strand speech/text/emotion branch</span>
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> RAM Guard active</span>
        </div>
      </div>

      {/* Key Doctrine */}
      <div className="rounded-xl border p-4 text-center" style={{ background: "rgba(201,168,76,0.04)", borderColor: "rgba(201,168,76,0.15)" }}>
        <p className="text-xs font-semibold" style={{ color: GOLD }}>
          Memory is not blindly trusted. It is loaded only through verified pockets. RAM Guard monitors active memory. Unverified pockets remain in cold storage.
        </p>
      </div>

      {/* Memory Pockets */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Memory Pockets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pockets.map(pocket => {
            const sc = POCKET_STATUS_COLORS[pocket.status] || POCKET_STATUS_COLORS.unloaded;
            return (
              <div key={pocket.id} className="rounded-xl border p-4 space-y-3" style={{ background: "hsl(220,18%,7%)", borderColor: "rgba(201,168,76,0.1)" }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{pocket.pocket_name}</h3>
                  <Badge className="text-[8px] border font-bold uppercase" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>
                    {pocket.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div><span className="text-muted-foreground">Type:</span> <span className="text-foreground">{pocket.pocket_type}</span></div>
                  <div><span className="text-muted-foreground">Trust:</span> <span style={{ color: pocket.trust_score >= 80 ? "#4ade80" : "#fbbf24" }}>{pocket.trust_score}%</span></div>
                  <div><span className="text-muted-foreground">Size:</span> <span className="text-foreground">{pocket.size_estimate || "—"}</span></div>
                  <div><span className="text-muted-foreground">Active:</span> <span className={pocket.loaded_active ? "text-green-400" : "text-muted-foreground"}>{pocket.loaded_active ? "Yes" : "No"}</span></div>
                </div>
                {pocket.hash && <div className="text-[9px] font-mono text-muted-foreground truncate">Hash: {pocket.hash}</div>}
                <div className="flex gap-1 flex-wrap">
                  <Button size="sm" className="text-[8px] h-6 px-2" onClick={() => handleAction(pocket, "verify")}
                    style={{ background: "rgba(251,191,36,0.08)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>Verify</Button>
                  <Button size="sm" className="text-[8px] h-6 px-2" onClick={() => handleAction(pocket, "load")}
                    style={{ background: "rgba(34,197,94,0.08)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }}>Load</Button>
                  <Button size="sm" className="text-[8px] h-6 px-2" onClick={() => handleAction(pocket, "unload")}
                    style={{ background: "rgba(148,163,184,0.08)", color: "#94a3b8", border: "1px solid rgba(148,163,184,0.25)" }}>Unload</Button>
                  <Button size="sm" className="text-[8px] h-6 px-2" onClick={() => handleAction(pocket, "quarantine")}
                    style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>Quarantine</Button>
                  <Button size="sm" className="text-[8px] h-6 px-2" onClick={() => handleAction(pocket, "cold")}
                    style={{ background: "rgba(96,165,250,0.08)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.25)" }}>Cold Storage</Button>
                </div>
              </div>
            );
          })}
        </div>
        {pockets.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm rounded-xl border border-border" style={{ background: "hsl(220,18%,7%)" }}>
            No memory pockets. Seed data to populate the braid.
          </div>
        )}
      </div>
    </div>
  );
}