import React from "react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Palette, DollarSign, Layers, Globe, ArrowRight, Crown } from "lucide-react";

const GOLD = "#C9A84C";

const SERVICES = [
  { icon: Palette,    label: "Logo & Branding",     desc: "Professional brand identity from concept to delivery" },
  { icon: Globe,      label: "Digital Pages",        desc: "Web pages and digital presence built with intention" },
  { icon: Layers,     label: "Flyers & Banners",     desc: "Print-ready and digital marketing materials" },
  { icon: DollarSign, label: "Verified Pipeline",    desc: "Every order moves through the SB688 verification system" },
];

const ROADMAP = [
  { phase: "Now",     label: "Jay's Graphic Arts",    desc: "Design services funding the JGA system build",          color: "#4ade80" },
  { phase: "Next",    label: "Oasis Platform",         desc: "Verified business hub — clients, payments, automation",  color: GOLD      },
  { phase: "Future",  label: "Modular Brick Licensing",desc: "Stitch bricks available for other businesses to deploy", color: "#60a5fa" },
  { phase: "Vision",  label: "SB712 Ecosystem",        desc: "Full sovereign runtime serving enterprise clients",      color: "#a78bfa" },
];

export default function JGAFundingLane() {
  return (
    <section className="py-16 px-4" style={{ background: "hsl(220,22%,4%)" }}>
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="text-[9px] tracking-[4px] uppercase font-mono" style={{ color: "rgba(201,168,76,0.4)" }}>The Launch Lane</div>
          <h2 className="text-xl font-black font-cinzel" style={{ color: GOLD }}>Jay's Graphic Arts</h2>
          <p className="text-sm text-muted-foreground">The First Public Release Lane</p>
        </div>

        {/* Main card */}
        <div className="rounded-2xl border overflow-hidden"
          style={{ borderColor: "rgba(201,168,76,0.25)" }}>

          {/* Gold header strip */}
          <div className="px-6 py-4 flex items-center gap-3"
            style={{ background: `linear-gradient(135deg, ${GOLD}15, rgba(201,168,76,0.04))`, borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
            <Crown className="w-5 h-5 flex-shrink-0" style={{ color: GOLD }} />
            <div>
              <div className="text-xs font-black font-cinzel" style={{ color: GOLD }}>Jay's Graphic Arts LLC</div>
              <div className="text-[9px] text-muted-foreground">Mendota, IL · 779-396-6934 · jaysgraphicarts@outlook.com</div>
            </div>
            <Badge className="ml-auto text-[8px] border flex-shrink-0" style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", borderColor: "rgba(74,222,128,0.25)" }}>
              ● ACTIVE
            </Badge>
          </div>

          <div className="p-6 space-y-6" style={{ background: "hsl(220,18%,7%)" }}>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Jay's Graphic Arts is the creative business front. It offers{" "}
              <strong className="text-foreground">graphics, branding, digital pages, flyers, and design services</strong> — and every order flows through the JGA verification pipeline. This isn't just a design studio. It is the{" "}
              <strong style={{ color: GOLD }}>first funded lane</strong> that proves the system works in real business conditions, generating the resources to build Oasis, the modular brick architecture, and the larger JGA ecosystem.
            </p>

            {/* Services */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SERVICES.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="rounded-xl border p-3 space-y-1.5"
                    style={{ background: "rgba(0,0,0,0.3)", borderColor: "rgba(201,168,76,0.12)" }}>
                    <Icon className="w-4 h-4" style={{ color: GOLD }} />
                    <div className="text-[10px] font-bold" style={{ color: GOLD }}>{s.label}</div>
                    <div className="text-[9px] text-muted-foreground leading-relaxed">{s.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* Taglines */}
            <div className="rounded-xl border px-4 py-3 text-center space-y-1"
              style={{ background: `${GOLD}04`, borderColor: `${GOLD}20` }}>
              <p className="text-xs italic font-cinzel" style={{ color: GOLD }}>"Your designs only bolder."</p>
              <p className="text-[10px] text-muted-foreground italic">"Elegance with Consequences."</p>
            </div>
          </div>
        </div>

        {/* Funding roadmap */}
        <div>
          <h3 className="text-sm font-black font-cinzel mb-4 text-center" style={{ color: GOLD }}>The Growth Path</h3>
          <div className="space-y-3">
            {ROADMAP.map((r, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border p-4"
                style={{ background: "hsl(220,18%,7%)", borderColor: `${r.color}18` }}>
                <div className="text-[8px] font-black uppercase tracking-widest rounded-lg px-2 py-1 flex-shrink-0"
                  style={{ background: `${r.color}12`, color: r.color, border: `1px solid ${r.color}30`, minWidth: 50, textAlign: "center" }}>
                  {r.phase}
                </div>
                {i < ROADMAP.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0 hidden sm:block" />}
                <div className="flex-1">
                  <div className="text-xs font-bold" style={{ color: r.color }}>{r.label}</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-3">
          <p className="text-xs text-muted-foreground">Ready to work with JGA? Start with a design order.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <a href="tel:7793966934"
              className="px-5 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #7a5010)`, color: "#080808" }}>
              📞 Call JGA — 779-396-6934
            </a>
            <Link to="/client-portal"
              className="px-5 py-2.5 rounded-xl font-bold text-sm border"
              style={{ borderColor: "rgba(201,168,76,0.3)", color: GOLD, background: "rgba(201,168,76,0.06)" }}>
              Client Portal →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}