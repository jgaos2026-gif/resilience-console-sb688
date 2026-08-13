import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  Shield, Layers, LayoutGrid, CheckSquare, Brain,
  Heart, Archive, FileText, AlertTriangle, Settings, Menu, X,
  Activity, Lock, LogOut, RotateCcw
} from "lucide-react";

const NAV = [
  { path: "/",                    label: "Operations Center",   icon: Activity },
  { path: "/system-spine",        label: "System Spine",        icon: Layers },
  { path: "/node-mesh",           label: "Node Mesh",           icon: LayoutGrid },
  { path: "/verification-gates",  label: "Verification Gates",  icon: CheckSquare },
  { path: "/memory-braid",        label: "Memory Braid",        icon: Brain },
  { path: "/self-healing",        label: "Self-Healing",        icon: RotateCcw },
  { path: "/proof-vault",         label: "Proof Vault",         icon: Archive },
  { path: "/daily-reports",       label: "Daily Reports",       icon: FileText },
  { path: "/risk-compliance",     label: "Risk / Compliance",   icon: AlertTriangle },
  { path: "/ava",                 label: "AVA Control Room",    icon: Brain },
  { path: "/sb688",               label: "SB688 Console",       icon: Shield },
  { path: "/jga-settings",        label: "Settings",            icon: Settings },
];

const GOLD = "#C9A84C";

export default function JGALayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-3 z-50 p-2 rounded-lg bg-card border border-border shadow-lg"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="w-5 h-5" style={{ color: GOLD }} /> : <Menu className="w-5 h-5" style={{ color: GOLD }} />}
      </button>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 left-0 h-screen w-56 border-r border-border z-40 overflow-y-auto flex-shrink-0 transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
          style={{ background: "hsl(220,22%,5%)" }}
        >
          <div className="p-4 border-b border-border space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 flex-shrink-0" style={{ color: GOLD }} />
              <div>
                <h2 className="text-xs font-bold font-mono" style={{ color: GOLD }}>SB688 CONSOLE</h2>
                <p className="text-[8px] text-muted-foreground font-mono">Braided Topology Runtime</p>
              </div>
            </div>
            {user && (
              <p className="text-[8px] text-muted-foreground font-mono truncate">
                ● {user.username} ({user.role})
              </p>
            )}
          </div>

          <nav className="p-2 space-y-0.5">
            {NAV.map(item => {
              const Icon   = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all font-mono ${active ? "font-bold" : "hover:bg-secondary/50"}`}
                  style={active
                    ? { background: "rgba(201,168,76,0.12)", color: GOLD }
                    : { color: "rgba(232,217,176,0.55)" }}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 mt-4 border-t border-border">
            <button
              onClick={logout}
              className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground hover:text-red-400 transition-colors w-full"
            >
              <LogOut className="w-3 h-3" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-h-screen">
          <Outlet />
          <footer className="border-t border-border mt-8 py-3 px-6 text-center" style={{ background: "hsl(220,20%,4%)" }}>
            <p className="text-[9px] text-muted-foreground/40 font-mono">
              SB688 · Braid group B₇ · SHA-256 · Alexander polynomial invariants · Append-only audit ledger
            </p>
          </footer>
        </main>
      </div>

      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setOpen(false)} />}
    </div>
  );
}
