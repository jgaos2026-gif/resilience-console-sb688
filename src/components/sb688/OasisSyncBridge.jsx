import React, { useState } from "react";
import { Database, Loader2, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function OasisSyncBridge({ records }) {
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState("Ready to mirror SB688 into OASIS.");

  const sync = async () => {
    setSyncing(true);
    try {
      const res = await base44.functions.invoke("oasisSync", { source: "SB688 Command Console", records });
      setStatus(res.data?.success ? `${res.data.count} secure, hash-verified record(s) synced to OASIS.` : "OASIS sync did not complete.");
    } catch (error) {
      setStatus(error.response?.data?.error || "OASIS sync requires an admin session.");
    }
    setSyncing(false);
  };

  return (
    <div className="bg-[#0e1218] border border-[#c4a350]/25 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg border border-[#c4a350]/35 bg-[#c4a350]/10 flex items-center justify-center flex-shrink-0">
          <Database className="w-4 h-4 text-[#c4a350]" />
        </div>
        <div>
          <div className="text-[10px] text-[#c4a350] uppercase tracking-widest font-bold">Secure OASIS Network Bridge</div>
          <div className="text-[10px] text-[#6b6558] mt-1">{status}</div>
        </div>
      </div>
      <button onClick={sync} disabled={syncing} className="px-3 py-2 bg-[#c4a350] text-[#090c10] font-bold text-[10px] rounded flex items-center gap-2 disabled:opacity-50">
        {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
        Sync SB688 → OASIS
      </button>
    </div>
  );
}