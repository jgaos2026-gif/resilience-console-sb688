/**
 * OperationsCenter.jsx — Live system status dashboard (homepage)
 * All data fetched from real API — no hardcoded stats.
 */
import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Shield, Activity, Lock, AlertTriangle, Database, RotateCcw,
  CheckCircle2, Layers, Cpu, Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import api from '@/api/apiClient';

const GOLD = '#C9A84C';

function StatCard({ label, value, color, icon: Icon, sublabel }) {
  return (
    <div className="rounded-xl border border-border p-4 space-y-2 flex flex-col justify-between" style={{ background: 'hsl(220,18%,7%)' }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="text-2xl font-bold font-mono" style={{ color }}>
        {value ?? '—'}
      </div>
      {sublabel && <p className="text-[10px] text-muted-foreground">{sublabel}</p>}
    </div>
  );
}

function StrandBar({ strand, crossings, maxCrossings }) {
  const pct = maxCrossings > 0 ? (crossings / maxCrossings) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="font-mono w-8 text-muted-foreground">{strand.label || `σ${strand.strand}`}</span>
      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: GOLD, opacity: 0.7 + pct / 333 }} />
      </div>
      <span className="font-mono w-6 text-right text-muted-foreground">{crossings}</span>
    </div>
  );
}

export default function OperationsCenter() {
  const { data: health, isLoading, refetch } = useQuery({
    queryKey: ['health'],
    queryFn:  () => api.get('/api/health'),
    refetchInterval: 10000,
  });

  // Auto-refetch on mount
  const mounted = useRef(false);
  useEffect(() => { if (!mounted.current) { mounted.current = true; refetch(); } }, [refetch]);

  const statusColor = health?.status === 'OPERATIONAL' ? '#4ade80'
    : health?.status === 'DEGRADED' ? '#fbbf24' : '#f87171';

  const maxCrossings = Math.max(1, ...(health?.strands || []).map(s => s.crossings));

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="rounded-xl border border-border p-6 space-y-3"
        style={{ background: 'linear-gradient(135deg, hsl(220,22%,5%) 0%, hsl(220,18%,8%) 100%)' }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-mono" style={{ color: GOLD }}>OPERATIONS CENTER</h1>
            <p className="text-xs text-muted-foreground">SB688 · Braided Computational Topology Runtime</p>
          </div>
          <Badge className="text-xs px-3 py-1 font-bold border font-mono"
            style={{ background: `${statusColor}18`, color: statusColor, borderColor: `${statusColor}40` }}>
            {isLoading ? '● CONNECTING' : `● ${health?.status ?? 'UNKNOWN'}`}
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground font-mono">
          Braid group B₇ · {health?.strandCount ?? '—'} strands · SHA-256 hash-chains · Alexander polynomial invariants
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Spine Health"    value={health ? `${health.spineHealth}%`  : '—'} color={health?.spineHealth === 100 ? '#4ade80' : '#fbbf24'} icon={Activity}     sublabel="Active node ratio" />
        <StatCard label="Chain Integrity" value={health ? `${health.integrityPct}%` : '—'} color={health?.integrityPct >= 100 ? '#4ade80' : '#f87171'} icon={Lock}         sublabel="Hash-chain validity" />
        <StatCard label="Active Nodes"    value={health ? `${health.activeNodes}/${health.totalNodes}` : '—'} color={GOLD} icon={Cpu}          sublabel="Protected modules" />
        <StatCard label="Trusted Items"   value={health?.trustedItems  ?? '—'} color="#4ade80"  icon={CheckCircle2} sublabel="Verified state count" />
        <StatCard label="Spine Events"    value={health?.spineEvents   ?? '—'} color="#60a5fa"  icon={Database}     sublabel="Append-only ledger" />
        <StatCard label="Rejected Items"  value={health?.rejectedItems ?? '—'} color="#f87171"  icon={AlertTriangle} sublabel="Failed verification" />
        <StatCard label="Chain Blocks"    value={health?.chainBlocks   ?? '—'} color={GOLD}     icon={Layers}       sublabel="Total braid blocks" />
        <StatCard label="Strands"         value={health?.strandCount   ?? '—'} color="#a78bfa"  icon={Zap}          sublabel="Braid group Bₙ" />
      </div>

      {/* Strand Health */}
      {health?.strands && health.strands.length > 0 && (
        <div className="rounded-xl border border-border p-5 space-y-4" style={{ background: 'hsl(220,18%,7%)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-mono" style={{ color: GOLD }}>BRAID STRAND UTILIZATION</h2>
            <span className="text-[10px] text-muted-foreground font-mono">σ₁ … σ{health.strandCount - 1}</span>
          </div>
          <div className="space-y-2">
            {health.strands.map(s => (
              <StrandBar key={s.strand} strand={s} crossings={s.crossings} maxCrossings={maxCrossings} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Nav */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { path: '/system-spine',      label: 'System Spine',        icon: Shield,        desc: 'Braid chain integrity' },
          { path: '/node-mesh',         label: 'Node Mesh',           icon: Cpu,           desc: 'Protected module states' },
          { path: '/verification-gates',label: 'Verification Gates',  icon: CheckCircle2,  desc: 'Triple-mark pipeline' },
          { path: '/memory-braid',      label: 'Memory Braid',        icon: Database,      desc: 'Strand memory topology' },
          { path: '/self-healing',      label: 'Self-Healing',        icon: RotateCcw,     desc: 'Phoenix recovery engine' },
          { path: '/proof-vault',       label: 'Proof Vault',         icon: Lock,          desc: 'Certified proof records' },
        ].map(({ path, label, icon: Icon, desc }) => (
          <Link key={path} to={path}
            className="rounded-xl border border-border p-4 space-y-2 hover:border-[rgba(201,168,76,0.4)] transition-colors group"
            style={{ background: 'hsl(220,18%,7%)' }}>
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 group-hover:text-[#C9A84C] transition-colors" style={{ color: 'rgba(201,168,76,0.7)' }} />
              <span className="text-xs font-bold font-mono" style={{ color: GOLD }}>{label}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{desc}</p>
          </Link>
        ))}
      </div>

      <p className="text-center text-[9px] text-muted-foreground/40 font-mono pt-2">
        SB688 · Braid group B₇ · SHA-256 · Alexander polynomial invariants · Append-only audit ledger
      </p>
    </div>
  );
}
