import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff } from "lucide-react";

const GOLD = "#C9A84C";

const VISIBILITY_STYLE = {
  public:   { color: "#4ade80", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)",   label: "Public" },
  investor: { color: GOLD,      bg: "rgba(201,168,76,0.1)",  border: "rgba(201,168,76,0.3)",  label: "Investor" },
  internal: { color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.3)",  label: "Internal" },
};

export default function BrandProofCard({ asset }) {
  const [showFull, setShowFull] = useState(false);
  const vs = VISIBILITY_STYLE[asset.visibility] || VISIBILITY_STYLE.internal;

  return (
    <div className="rounded-2xl border overflow-hidden transition-all hover:scale-[1.01] group"
      style={{ background: "linear-gradient(135deg,#0d0f1a,#120e00)", borderColor: `${GOLD}28`, boxShadow: "0 0 0 rgba(0,0,0,0)" }}>

      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 220 }}>
        <img src={asset.src} alt={asset.title} className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(13,15,26,0.92) 100%)" }} />
        <div className="absolute top-3 right-3">
          <Badge className="text-[8px] font-black border uppercase" style={{ background: vs.bg, color: vs.color, borderColor: vs.border }}>{vs.label}</Badge>
        </div>
        <div className="absolute bottom-3 left-3">
          <Badge className="text-[8px] font-black border uppercase" style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", borderColor: "rgba(34,197,94,0.3)" }}>
            ✓ Verified Brand Asset
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>{asset.title}</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{asset.use}</p>
        </div>

        {/* Dimensions */}
        <div className="flex gap-3 text-[9px] text-muted-foreground">
          <span>📐 {asset.width} × {asset.height}px</span>
          <span>🗂 {asset.id}</span>
        </div>

        {/* Hash */}
        <div className="rounded-lg p-3 space-y-1" style={{ background: "#06080f", border: `1px solid ${GOLD}15` }}>
          <div className="text-[8px] uppercase tracking-widest text-muted-foreground">SHA-256 Fingerprint</div>
          <div className="font-mono text-[9px] break-all" style={{ color: showFull ? GOLD : "rgba(201,168,76,0.6)" }}>
            {showFull ? asset.sha256 : `${asset.shortHash}${"•".repeat(12)}…`}
          </div>
          <button onClick={() => setShowFull(v => !v)}
            className="flex items-center gap-1 text-[8px] hover:opacity-80 transition mt-1"
            style={{ color: `${GOLD}70` }}>
            {showFull ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
            {showFull ? "Hide full hash" : "Reveal full hash"}
          </button>
        </div>

        {/* Placements */}
        <div className="space-y-1">
          <div className="text-[8px] uppercase tracking-widest text-muted-foreground">System Placements</div>
          <div className="flex flex-wrap gap-1">
            {asset.placements.map((p, i) => (
              <span key={i} className="text-[8px] px-2 py-0.5 rounded-md font-bold border" style={{ background: `${GOLD}08`, color: `${GOLD}80`, borderColor: `${GOLD}20` }}>{p}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}