import React, { useEffect, useState } from "react";
import { Radio, Volume2, Waves } from "lucide-react";
import { getAVAVoiceStatus, speakAVA } from "@/lib/avaVoice";

const GOLD = "#C9A84C";

export default function OASISVoiceBridge() {
  const [status, setStatus] = useState(getAVAVoiceStatus());

  useEffect(() => {
    const refresh = () => setStatus(getAVAVoiceStatus());
    refresh();
    window.speechSynthesis?.addEventListener?.("voiceschanged", refresh);
    return () => window.speechSynthesis?.removeEventListener?.("voiceschanged", refresh);
  }, []);

  const testVoice = () => {
    speakAVA("OASIS voice bridge online. AVA is monitoring critical recovery events with you.", true);
    setStatus(getAVAVoiceStatus());
  };

  return (
    <div className="rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ background: "rgba(201,168,76,0.06)", borderColor: `${GOLD}25` }}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}35` }}>
          <Radio className="w-4 h-4" style={{ color: GOLD }} />
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: GOLD }}>OASIS Voice Bridge · AVA Online</div>
          <div className="text-[9px] text-muted-foreground mt-1">Natural female voice selected: {status.voiceName || "device voice loading"}</div>
        </div>
      </div>
      <button onClick={testVoice} className="text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg border flex items-center gap-2" style={{ color: "#080808", borderColor: `${GOLD}60`, background: `linear-gradient(135deg, ${GOLD}, #8a6018)` }}>
        <Volume2 className="w-3 h-3" /> Test AVA
        <Waves className="w-3 h-3" />
      </button>
    </div>
  );
}