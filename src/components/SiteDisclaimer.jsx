import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function SiteDisclaimer() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="sticky top-0 z-[100] w-full"
      style={{
        background: "linear-gradient(90deg, rgba(201,168,76,0.12), rgba(201,168,76,0.06), rgba(201,168,76,0.12))",
        borderBottom: "1px solid rgba(201,168,76,0.25)",
        backdropFilter: "blur(12px)",
      }}>
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#C9A84C" }} />
        <p className="text-[11px] leading-relaxed flex-1" style={{ color: "rgba(232,217,176,0.85)" }}>
          <strong style={{ color: "#C9A84C" }}>DEMO ENVIRONMENT:</strong>{" "}
          This is a <strong>demonstration interface</strong> for visualization and simulation purposes only.
          The real SB688 / OMEGA-72 system exists and is built with{" "}
          <strong>Python 3</strong>, <strong>PowerShell 7</strong> backend,{" "}
          <strong>Supabase</strong> database, developed in <strong>VS Code</strong>.
          All logic shown here is a faithful representation of the production architecture — not the production system itself.
        </p>
        <button onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition"
          style={{ color: "rgba(201,168,76,0.6)" }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}