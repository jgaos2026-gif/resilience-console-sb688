import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Lock, ChevronDown, ChevronUp } from "lucide-react";
import BrandProofCard from "@/components/jga/BrandProofCard";

const GOLD = "#C9A84C";

export const BRAND_ASSETS = [
  {
    id: "jga_seal_elegance_consequences",
    title: "JGA Gold Seal — Elegance with Consequences",
    src: "https://media.base44.com/images/public/69d5af52688205fc104c687c/a27bf93c0_IMG_0843_Original_Original.jpeg",
    width: 1263, height: 1263,
    sha256: "6d3e683b3b32fdfd2a9a66ecef0f7ac349841d269cb72602dde2208318909525",
    shortHash: "6d3e683b3b32",
    use: "Main app seal, Gold Room, footer, Proof Vault identity",
    visibility: "public",
    status: "verified",
    placements: ["Header Logo", "Gold Room", "Footer Seal", "Proof Vault"],
    uploadDate: "2026-06-01",
  },
  {
    id: "jga_sb_ecosystem_flyer",
    title: "JGA / SB Ecosystem Council Flyer",
    src: "https://media.base44.com/images/public/69d5af52688205fc104c687c/336e66e85_FF2B5757-3BC6-4E14-9251-BF3005F719D7.png",
    width: 1024, height: 1536,
    sha256: "d9f4835107b68c154135e505262e344b327b53d8d142850793a9b3ad7698ba38",
    shortHash: "d9f4835107b6",
    use: "Demo Council hero, investor proof packet, roadmap, council briefing",
    visibility: "investor",
    status: "verified",
    placements: ["Demo Council Hero", "Investor Snapshot", "Roadmap", "Proof Packet"],
    uploadDate: "2026-06-01",
  },
  {
    id: "jga_your_design_only_bolder",
    title: "Your Design, Only Bolder",
    src: "https://media.base44.com/images/public/69d5af52688205fc104c687c/613968635_attA7unPJGrpTYwuyQc5YClrQ6F5ddwCpnVff6J3ufotx4_Original.jpeg",
    width: 1024, height: 1024,
    sha256: "cfdb48f8992c5f1e60eaf6b3a279c97bd0e180a17d51c84aa793e9048381c85c",
    shortHash: "cfdb48f8992c",
    use: "Client Portal, brand discovery form, service identity, design intake",
    visibility: "public",
    status: "verified",
    placements: ["Client Portal", "Brand Intake", "Business OS", "Marketing Panel"],
    uploadDate: "2026-06-01",
  },
  {
    id: "jga_origin_archive_asset",
    title: "Early JGA Origin Proof Asset",
    src: "https://media.base44.com/images/public/69d5af52688205fc104c687c/006aa7b4e_IMG_1321_Original_Original.jpeg",
    width: 655, height: 712,
    sha256: "0f943c63aad9c075416d764cdec837d3caab3ac9d26704d8f1ac14e48815ac81",
    shortHash: "0f943c63aad9",
    use: "Founder Story, Legacy Wall, brand evolution timeline, archive proof",
    visibility: "internal",
    status: "verified",
    placements: ["Founder Story", "Legacy Wall", "Brand Evolution", "Archive"],
    uploadDate: "2026-06-01",
  },
];

const BRAND_TIMELINE = [
  { era: "Origin", label: "Early JGA Identity", desc: "Jay's Graphic Arts LLC — the founding brand, built from the block.", color: "#94a3b8", asset: "jga_origin_archive_asset" },
  { era: "Service", label: "JGA Graphic Arts Identity", desc: "Your Design, Only Bolder — client-facing service mark.", color: "#60a5fa", asset: "jga_your_design_only_bolder" },
  { era: "Premium", label: "Elegance With Consequences Seal", desc: "The luxury brand mark — gold geometric sovereign identity.", color: GOLD, asset: "jga_seal_elegance_consequences" },
  { era: "Council", label: "SB Ecosystem / Demo Council", desc: "Full sovereign architecture — council-ready command center.", color: "#a78bfa", asset: "jga_sb_ecosystem_flyer" },
];

export default function BrandProofAssets() {
  const [timelineOpen, setTimelineOpen] = useState(true);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" style={{ color: GOLD }} />
          <h1 className="text-xl font-bold font-cinzel gold-shimmer">Brand Proof Assets</h1>
        </div>
        <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
          Each JGA visual asset is treated as a verified proof record. SHA-256 fingerprints confirm visual identity continuity — if an image is changed, the hash changes.
        </p>
      </div>

      {/* Doctrine banner */}
      <div className="rounded-xl border p-4 text-center space-y-1" style={{ background: "rgba(201,168,76,0.04)", borderColor: "rgba(201,168,76,0.2)" }}>
        <p className="text-xs font-bold font-cinzel" style={{ color: GOLD }}>Brand Proof Verification</p>
        <p className="text-[10px] text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          These assets are used as brand proof and visual continuity markers. They show the evolution from Jay's Graphic Arts into the JGA Demo Council and SB Ecosystem. Each asset is stored as a proof record with a hash, timestamp, and system placement so the council can verify that the identity layer is consistent and traceable.
        </p>
        <p className="text-[9px] italic text-muted-foreground pt-1">
          Note: Image hashes prove visual identity continuity only — not that the full software system is live. Full system proof requires live logs, daily reports, verification events, recovery simulations, and ledger records.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Assets", value: "4", color: GOLD, icon: Shield },
          { label: "Verified", value: "4/4", color: "#4ade80", icon: Shield },
          { label: "Public", value: "2", color: "#4ade80", icon: Eye },
          { label: "Internal", value: "1", color: "#60a5fa", icon: Lock },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="rounded-xl border p-4 space-y-1" style={{ background: "hsl(220,18%,7%)", borderColor: `${s.color}20` }}>
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
              <div className="text-xl font-black font-mono" style={{ color: s.color }}>{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Brand Evolution Timeline */}
      <div className="rounded-xl border border-border overflow-hidden" style={{ background: "hsl(220,18%,7%)" }}>
        <button onClick={() => setTimelineOpen(v => !v)}
          className="w-full flex items-center justify-between p-5 hover:bg-secondary/20 transition">
          <span className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Brand Evolution Timeline</span>
          {timelineOpen ? <ChevronUp className="w-4 h-4" style={{ color: GOLD }} /> : <ChevronDown className="w-4 h-4" style={{ color: GOLD }} />}
        </button>
        {timelineOpen && (
          <div className="px-5 pb-5">
            <div className="relative">
              {/* Spine line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5" style={{ background: `linear-gradient(180deg, ${GOLD}60, transparent)` }} />
              <div className="space-y-6 pl-12">
                {BRAND_TIMELINE.map((item, i) => (
                  <div key={i} className="relative">
                    {/* Node */}
                    <div className="absolute -left-8 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                      style={{ background: `${item.color}20`, borderColor: item.color, boxShadow: `0 0 10px ${item.color}40` }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                    </div>
                    <div>
                      <Badge className="text-[8px] font-black border mb-1" style={{ background: `${item.color}10`, color: item.color, borderColor: `${item.color}30` }}>{item.era}</Badge>
                      <h4 className="text-xs font-bold text-foreground">{item.label}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Asset Grid */}
      <div>
        <h2 className="text-sm font-bold font-cinzel mb-4" style={{ color: GOLD }}>Verified Asset Records</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {BRAND_ASSETS.map(asset => (
            <BrandProofCard key={asset.id} asset={asset} />
          ))}
        </div>
      </div>

    </div>
  );
}