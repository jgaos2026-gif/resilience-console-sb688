import React from "react";
import { INDUSTRIES } from "@/lib/sb688Engine";
import { Badge } from "@/components/ui/badge";
import { Building2, Heart, Factory, Truck, Landmark, Shield, Plane, Brain } from "lucide-react";

const industryIcons = {
  universal: Building2,
  healthcare: Heart,
  manufacturing: Factory,
  logistics: Truck,
  finance: Landmark,
  government: Shield,
  aerospace: Plane,
  industrial_ai: Brain,
};

export default function IndustryCards({ currentIndustry, onSelect }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Industry Adaptation</h2>
        <p className="text-sm text-muted-foreground">SB688 adapts its language, components, and business outcomes to your sector. Select an industry to see how the console transforms.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(INDUSTRIES).map((ind) => {
          const Icon = industryIcons[ind.id];
          const isActive = currentIndustry === ind.id;
          return (
            <button
              key={ind.id}
              onClick={() => onSelect(ind.id)}
              className={`text-left p-5 rounded-xl border transition-all duration-300 ${
                isActive
                  ? "bg-primary/10 border-primary shadow-lg shadow-primary/5"
                  : "bg-card border-border hover:border-primary/40 hover:bg-card/80"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <h3 className="text-sm font-bold text-foreground">{ind.title}</h3>
                {isActive && (
                  <Badge className="ml-auto text-[9px] bg-primary text-primary-foreground">Active</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">{ind.subtitle}</p>
              <p className="text-[11px] text-foreground/60 leading-relaxed">{ind.story.slice(0, 120)}...</p>
            </button>
          );
        })}
      </div>

      {/* Active industry detail */}
      {(() => {
        const ind = INDUSTRIES[currentIndustry];
        const Icon = industryIcons[currentIndustry];
        return (
          <div className="bg-card border border-primary/30 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Icon className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-lg font-bold text-foreground">{ind.title}</h3>
                <p className="text-xs text-muted-foreground">{ind.subtitle}</p>
              </div>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{ind.story}</p>
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Business Outcome</p>
              <p className="text-sm text-foreground/70 leading-relaxed">{ind.outcome}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Adapted Components</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.values(ind.components).map((comp, i) => (
                  <div key={i} className="p-2 rounded-md bg-secondary/50 border border-border/50 text-xs">
                    <p className="font-semibold text-foreground">{comp.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{comp.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}