import React from "react";
import { Crown } from "lucide-react";

const GOLD = "#C9A84C";

const ASSETS = [
  { label: "Royal Identity", src: "https://media.base44.com/images/public/69d5af52688205fc104c687c/763686464_ChatGPTImageJun23202602_29_25AM.png" },
  { label: "Self-Healing Proof", src: "https://media.base44.com/images/public/69d5af52688205fc104c687c/f361de42d_20260502_094706000_iOS.png" },
  { label: "JGA LLC Mark", src: "https://media.base44.com/images/public/69d5af52688205fc104c687c/80eeb006b_2025-08-13_043206_Original.jpeg" },
  { label: "Design Motto", src: "https://media.base44.com/images/public/69d5af52688205fc104c687c/613968635_attA7unPJGrpTYwuyQc5YClrQ6F5ddwCpnVff6J3ufotx4_Original.jpeg" },
  { label: "Lion Crown Standard", src: "https://media.base44.com/images/public/69d5af52688205fc104c687c/56968d5a0_JGA_Lion_logo.png" },
  { label: "Founder Authority", src: "https://media.base44.com/images/public/69d5af52688205fc104c687c/5ed84fbbf_ChatGPT_Image_Jun_23__2026__02_33_02_AM.png" },
];

export default function GoldAssetRail() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
      {ASSETS.map(asset => (
        <div key={asset.label} className="relative overflow-hidden rounded-xl border min-h-36" style={{ borderColor: `${GOLD}28`, background: "#050505" }}>
          <img src={asset.src} alt={asset.label} className="w-full h-36 object-cover opacity-90" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent 55%)" }} />
          <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5">
            <Crown className="w-3 h-3 flex-shrink-0" style={{ color: GOLD }} />
            <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: GOLD }}>{asset.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}