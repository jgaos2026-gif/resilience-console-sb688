import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Shield, Layers, LayoutGrid, CheckSquare, Brain, Heart, Building2, Users, Wrench as HardHat, Archive, FileText, AlertTriangle, Map, Settings, Menu, X, Star, Gem, Zap } from "lucide-react";

const NAV = [
  { path: "/", label: "Demo Council", icon: Shield },
  { path: "/system-spine", label: "System Spine", icon: Layers },
  { path: "/node-mesh", label: "Node Mesh", icon: LayoutGrid },
  { path: "/verification-gates", label: "Verification Gates", icon: CheckSquare },
  { path: "/memory-braid", label: "Memory Braid", icon: Brain },
  { path: "/self-healing", label: "Self-Healing Demo", icon: Heart },
  { path: "/business-os", label: "JGA Business OS", icon: Building2 },
  { path: "/client-portal", label: "Client Portal", icon: Users },
  { path: "/contractor-portal", label: "Contractor Portal", icon: HardHat },
  { path: "/proof-vault", label: "Proof Vault", icon: Archive },
  { path: "/daily-reports", label: "Daily Reports", icon: FileText },
  { path: "/risk-compliance", label: "Risk / Compliance", icon: AlertTriangle },
  { path: "/roadmap", label: "Roadmap", icon: Map },
  { path: "/jga-settings", label: "Settings", icon: Settings },
  { path: "/jga-about", label: "About JGA", icon: Star },
  { path: "/diamond-hunter", label: "Diamond Hunter Core", icon: Gem },
  { path: "/resilience-sim", label: "Resilience Simulator", icon: Zap },
  { path: "/deep-space-sim", label: "Deep Space Sim", icon: Star },
];

const GOLD = "#C9A84C";

export default function JGALayout() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      {/* Top Banner */}
      <div className="warrior-divider" />
      <div className="border-b border-border px-4 py-2 text-center" style={{ background: "hsl(220,22%,5%)" }}>
        <span className="text-[10px] sm:text-xs tracking-widest uppercase font-bold" style={{ color: GOLD }}>
          JGA Demo Council · Verification-First Business Automation &amp; Sovereign Runtime Architecture
        </span>
      </div>
      <div className="warrior-divider" />

      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-20 left-3 z-50 p-2 rounded-lg bg-card border border-border shadow-lg"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="w-5 h-5" style={{ color: GOLD }} /> : <Menu className="w-5 h-5" style={{ color: GOLD }} />}
      </button>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 left-0 h-screen w-60 border-r border-border z-40 overflow-y-auto flex-shrink-0 transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
          style={{ background: "hsl(220,22%,5%)" }}
        >
          <div className="p-4 border-b border-border space-y-2">
            <div className="flex items-center gap-2">
              <img src="https://media.base44.com/images/public/69d5af52688205fc104c687c/a27bf93c0_IMG_0843_Original_Original.jpeg" alt="JGA Logo" className="w-8 h-8 rounded object-cover flex-shrink-0" />
              <div>
                <h2 className="text-xs font-bold gold-shimmer" style={{ fontFamily: "'Cinzel', serif" }}>JGA Enterprises</h2>
                <p className="text-[8px] text-muted-foreground">Jay's Graphic Arts</p>
              </div>
            </div>
            <p className="text-[8px] text-muted-foreground">SB688 / SB689 / SB712 / Omega</p>
          </div>
          <nav className="p-2 space-y-0.5">
            {NAV.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${active ? "font-bold" : "hover:bg-secondary/50"}`}
                  style={active ? { background: "rgba(201,168,76,0.12)", color: GOLD } : { color: "rgba(232,217,176,0.6)" }}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 mt-4 border-t border-border">
            <Link to="/sb688" className="text-[9px] block text-muted-foreground hover:text-primary transition">
              → Legacy SB688 Console
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-h-screen">
          <Outlet />
          {/* Footer */}
          <footer className="border-t border-border mt-8" style={{ background: "hsl(220,20%,4%)" }}>
            <div className="warrior-divider" />
            <div className="max-w-6xl mx-auto px-6 py-4 text-center space-y-1">
              <p className="text-[10px] text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                This demo illustrates authorized integrity monitoring, business automation, audit readiness, and recovery workflows. Real deployment requires legal, security, payment, and compliance review.
              </p>
              <p className="text-[9px] text-muted-foreground/50">
              JGA Enterprises (Jay's Graphic Arts) · John Arenz · <a href="tel:7793966934" className="hover:underline">779-396-6934</a> · Mendota, IL · © {new Date().getFullYear()}
            </p>
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setOpen(false)} />}
    </div>
  );
}