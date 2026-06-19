import React from "react";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, CheckCircle2 } from "lucide-react";

const GOLD = "#C9A84C";
const OE = { fontFamily: "'UnifrakturMaguntia', serif" };

const IMAGES = {
  sb712: "https://media.base44.com/images/public/69d5af52688205fc104c687c/cab0b693b_10E06BC3-278A-42DB-9012-1281571C15D8.png",
  flyer: "https://media.base44.com/images/public/69d5af52688205fc104c687c/336e66e85_FF2B5757-3BC6-4E14-9251-BF3005F719D7.png",
  vision: "https://media.base44.com/images/public/69d5af52688205fc104c687c/03dac8b58_8EDA198E-AF1C-4D7F-821D-CD54C0824ACB_Original.jpeg",
  cloudPhoto: "https://media.base44.com/images/public/69d5af52688205fc104c687c/d45280968_IMG_1807_Original.jpeg",
  logo: "https://media.base44.com/images/public/69d5af52688205fc104c687c/a27bf93c0_IMG_0843_Original_Original.jpeg",
  signage: "https://media.base44.com/images/public/69d5af52688205fc104c687c/80eeb006b_2025-08-13_043206_Original.jpeg",
  teamPhoto: "https://media.base44.com/images/public/69d5af52688205fc104c687c/006aa7b4e_IMG_1321_Original_Original.jpeg",
  logo2: "https://media.base44.com/images/public/69d5af52688205fc104c687c/cd185f92f_attn6fDpb-mCfVpupFYduvEAZe_rqorlnK97u61_ZHOnxw_Original.jpeg",
  bolder: "https://media.base44.com/images/public/69d5af52688205fc104c687c/613968635_attA7unPJGrpTYwuyQc5YClrQ6F5ddwCpnVff6J3ufotx4_Original.jpeg",
};

export default function JGAAbout() {
  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">

      {/* HERO — JGA Brand Banner */}
      <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: 320 }}>
        <img src={IMAGES.flyer} alt="JGA Enterprises" className="w-full object-cover object-top" style={{ maxHeight: 520 }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 sm:p-8">
          <Badge className="mb-2 text-[10px] border font-bold" style={{ background: "rgba(201,168,76,0.15)", color: GOLD, borderColor: "rgba(201,168,76,0.4)" }}>
            ♛ JGA ENTERPRISES
          </Badge>
          <h1 className="text-3xl sm:text-5xl gold-shimmer leading-none" style={{ ...OE, textShadow: "0 2px 20px rgba(201,168,76,0.6)" }}>
            Jay's Graphic Arts
          </h1>
          <p className="text-sm mt-2 font-cinzel" style={{ color: GOLD }}>Elegance With Consequences · Built From Struggle. Fueled By Vision.</p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="rounded-2xl border border-border p-6 space-y-4" style={{ background: "hsl(220,18%,7%)" }}>
        <h2 className="text-base font-bold font-cinzel" style={{ color: GOLD }}>Contact JGA Enterprises</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Phone, label: "Phone", value: "779-396-6934", href: "tel:7793966934" },
            { icon: Mail, label: "Primary Email", value: "jgaos2026@outlook.com", href: "mailto:jgaos2026@outlook.com" },
            { icon: Mail, label: "Design Email", value: "johnarenz@jaysgraphicarts.com", href: "mailto:johnarenz@jaysgraphicarts.com" },
            { icon: MapPin, label: "Location", value: "Mendota, IL", href: null },
          ].map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.12)" }}>
                <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: GOLD }} />
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{c.label}</div>
                  {c.href ? (
                    <a href={c.href} className="text-xs font-semibold hover:underline" style={{ color: GOLD }}>{c.value}</a>
                  ) : (
                    <div className="text-xs font-semibold text-foreground">{c.value}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Owner / Cloud Photo — PROMINENTLY FEATURED here */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
        <div className="rounded-2xl overflow-hidden border-2" style={{ borderColor: "rgba(201,168,76,0.25)", maxHeight: 440 }}>
          <img src={IMAGES.cloudPhoto} alt="John Arenz — JGA Founder" className="w-full h-full object-cover object-top" style={{ minHeight: 360 }} />
        </div>
        <div className="space-y-4 p-2">
          <Badge className="text-[9px] border font-bold" style={{ background: "rgba(201,168,76,0.1)", color: GOLD, borderColor: "rgba(201,168,76,0.3)" }}>♛ FOUNDER & ARCHITECT</Badge>
          <h2 className="text-2xl font-bold font-cinzel" style={{ color: GOLD }}>John Arenz</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Built JGA Enterprises from the ground up in Mendota, IL. Jay's Graphic Arts is the engine that funds the vision. The profit fuels the platform. The platform builds the future.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Architect of the SB688 / SB689 / SB712 sovereign runtime ecosystem — the first live deployment of braided verification infrastructure inside a real, operating business.
          </p>
          <div className="space-y-2 text-xs">
            {[
              "Active Testing & Real-World Refinement",
              "Real Business Automation — Live",
              "AI Workflow Integration (AVA / VERA)",
              "Verification & Self-Healing Recovery Systems",
              "Operational Continuity Validation",
              "Illinois Phase 1 Pilot — Demo Ready",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#4ade80" }} />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Signage photo */}
      <div className="rounded-2xl overflow-hidden border border-border" style={{ maxHeight: 380 }}>
        <img src={IMAGES.signage} alt="Jay's Graphic Arts LLC Sign" className="w-full h-full object-cover" />
      </div>

      {/* SB712 Architecture Visual */}
      <div className="rounded-2xl overflow-hidden border border-border">
        <img src={IMAGES.sb712} alt="SB712 Sovereign Möbius Runtime" className="w-full object-contain" style={{ maxHeight: 560, background: "#000" }} />
      </div>
      <div className="text-center text-xs text-muted-foreground -mt-6">
        SB712 — Sovereign Möbius Runtime Architecture · Developed by JGA Enterprises
      </div>

      {/* Your Vision Secured */}
      <div className="rounded-2xl overflow-hidden border border-border">
        <img src={IMAGES.vision} alt="Your Vision Secured" className="w-full object-contain" style={{ maxHeight: 700, background: "#000" }} />
      </div>

      {/* Logo grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl overflow-hidden border border-border aspect-square">
          <img src={IMAGES.logo} alt="JGA Logo — Elegance With Consequences" className="w-full h-full object-cover" />
        </div>
        <div className="rounded-2xl overflow-hidden border border-border aspect-square">
          <img src={IMAGES.logo2} alt="JGA Logo 2" className="w-full h-full object-cover" />
        </div>
        <div className="rounded-2xl overflow-hidden border border-border aspect-square">
          <img src={IMAGES.bolder} alt="Your Design Only Bolder" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="rounded-2xl border-2 text-center p-8 space-y-3" style={{ borderColor: "rgba(201,168,76,0.3)", background: "linear-gradient(135deg, hsl(220,22%,5%), hsl(40,12%,7%))" }}>
        <p className="text-[10px] tracking-widest uppercase text-muted-foreground">From the Block to the Boardroom</p>
        <h3 className="text-3xl gold-shimmer" style={OE}>JGA Enterprises</h3>
        <p className="text-lg font-bold font-cinzel" style={{ color: GOLD }}>WE BUILD. WE PRINT. WE WIN.</p>
        <p className="text-xs" style={{ color: GOLD }}>THIS IS JGA. THIS IS JUST THE BEGINNING.</p>
        <p className="text-[10px] italic text-muted-foreground">DISCIPLINE IS FREEDOM. CONTROL IS POWER. PEACE IS THE GOAL. — JGA</p>
      </div>

    </div>
  );
}