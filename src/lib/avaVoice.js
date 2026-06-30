const VOICE_KEY = "jga_ava_voice_enabled_v1";

const FEMALE_VOICE_HINTS = [
  "Samantha", "Microsoft Jenny", "Microsoft Aria", "Microsoft Zira", "Google UK English Female",
  "Ava", "Eva", "Susan", "Victoria", "Karen", "Moira", "Tessa", "Serena", "Female"
];

export function isAVAVoiceEnabled() {
  return localStorage.getItem(VOICE_KEY) !== "off";
}

export function setAVAVoiceEnabled(enabled) {
  localStorage.setItem(VOICE_KEY, enabled ? "on" : "off");
}

function getVoices() {
  return window.speechSynthesis?.getVoices?.() || [];
}

function chooseAVAVoice() {
  const voices = getVoices();
  return voices.find(v => FEMALE_VOICE_HINTS.some(h => v.name.toLowerCase().includes(h.toLowerCase())))
    || voices.find(v => /female|woman|girl/i.test(v.name))
    || voices.find(v => /en-US|en_US|English/i.test(v.lang || v.name))
    || voices[0]
    || null;
}

export function getAVAVoiceStatus() {
  const voice = chooseAVAVoice();
  return { available: Boolean(voice), voiceName: voice?.name || "" };
}

export function speakAVA(message, priority = false) {
  if (!isAVAVoiceEnabled()) return false;
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  if (priority) window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.voice = chooseAVAVoice();
  utterance.rate = 0.84;
  utterance.pitch = 1.14;
  utterance.volume = 0.94;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function alertAVA(event, detail = "") {
  const phrases = {
    armed: "OASIS alert. Recovery sequence armed. I am watching the system with you.",
    quarantine: "Critical event detected. Quarantine walls are raised. I am isolating the bad state now.",
    checkpoint: "Clean ghost checkpoint found. I have a verified path back to trusted state.",
    certified: "Recovery complete. Verification passed. Trusted state restored and certified."
  };
  return speakAVA(`${phrases[event] || "AVA alert."} ${detail}`, event === "armed");
}