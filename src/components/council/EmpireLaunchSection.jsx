import React from "react";
import { Crown, FileText, Shield, Users } from "lucide-react";
import GoldAssetRail from "./GoldAssetRail";
import DevicePassportPanel from "./DevicePassportPanel";
import PhoenixBigScreen from "./PhoenixBigScreen";

const GOLD = "#C9A84C";
const PDF = "https://media.base44.com/files/public/69d5af52688205fc104c687c/b52cafeab_JGA_Autonomous_Empire_20_System_Launch_Proposal_FIXED.pdf";

export default function EmpireLaunchSection() {
  return (
    <section className="px-4 sm:px-6 py-6 space-y-5" style={{ background: "linear-gradient(180deg,#050505,#090805,#050505)" }}>
      <div className="rounded-3xl border overflow-hidden" style={{ borderColor: `${GOLD}34`, background: "radial-gradient(circle at top, rgba(201,168,76,0.13), #050505 46%)" }}>
        <div className="p-6 sm:p-8 space-y-5 text-center">
          <div className="flex justify-center"><Crown className="w-12 h-12" style={{ color: GOLD, filter: "drop-shadow(0 0 18px rgba(201,168,76,0.55))" }} /></div>
          <p className="text-[10px] uppercase tracking-[0.45em]" style={{ color: `${GOLD}80` }}>Autonomous Launch Grid · No Cartoon · Real Gold Standard</p>
          <h2 className="text-3xl sm:text-5xl font-black font-cinzel gold-shimmer">Integrity That Resurrects</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">JGA is built to look royal because the standard is royal: premium design quality, quarter-time production discipline, System B contractor reach, and Phoenix recovery that refuses to stay down.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            {[ [Shield,"State-of-Art Integrity","Corrupt it, isolate it, heal it, then certify it."], [Crown,"Crown-Level Quality","Black, real gold, luxury command room — no toy interface."], [Users,"System B Force","Independent contractors expand reach while JGA controls price, proof, money, and delivery." ] ].map(([Icon,title,body]) => <div key={title} className="rounded-2xl border p-4" style={{ borderColor: `${GOLD}22`, background: "rgba(0,0,0,0.45)" }}><Icon className="w-5 h-5 mb-3" style={{ color: GOLD }} /><h3 className="text-xs font-black" style={{ color: GOLD }}>{title}</h3><p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{body}</p></div>)}
          </div>
          <a href={PDF} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-xs font-black uppercase tracking-widest" style={{ borderColor: `${GOLD}38`, color: GOLD, background: `${GOLD}08` }}><FileText className="w-4 h-4" /> Open 20-System Launch Proposal</a>
        </div>
      </div>
      <GoldAssetRail />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2"><PhoenixBigScreen /></div>
        <DevicePassportPanel />
      </div>
    </section>
  );
}