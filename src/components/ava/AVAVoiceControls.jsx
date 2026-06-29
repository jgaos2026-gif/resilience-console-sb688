import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isAVAVoiceEnabled, setAVAVoiceEnabled, speakAVA } from "@/lib/avaVoice";

const GOLD = "#C9A84C";

export default function AVAVoiceControls() {
  const [enabled, setEnabled] = useState(() => isAVAVoiceEnabled());

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setAVAVoiceEnabled(next);
    if (next) speakAVA("AVA voice feedback armed. Critical system events will be spoken out loud.", true);
  };

  return (
    <button onClick={toggle} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest" style={{ borderColor: enabled ? `${GOLD}45` : "rgba(255,255,255,0.14)", color: enabled ? GOLD : "rgba(255,255,255,0.45)", background: enabled ? `${GOLD}10` : "rgba(255,255,255,0.03)" }}>
      {enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      AVA Voice {enabled ? "Armed" : "Muted"}
    </button>
  );
}