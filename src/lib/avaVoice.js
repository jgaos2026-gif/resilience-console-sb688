const VOICE_KEY = "jga_ava_voice_enabled_v1";

const FEMALE_VOICE_HINTS = [
  "Samantha", "Zira", "Jenny", "Aria", "Ava", "Eva", "Susan", "Victoria",
  "Karen", "Moira", "Tessa", "Serena", "Female", "Google UK English Female"
];

export function isAVAVoiceEnabled() {
  return localStorage.getItem(VOICE_KEY) !== "off";
}

export function setAVAVoiceEnabled(enabled) {
  localStorage.setItem(VOICE_KEY, enabled ? "on" : "off");
}

function chooseAVAVoice() {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  return voices.find(v => FEMALE_VOICE_HINTS.some(h => v.name.toLowerCase().includes(h.toLowerCase())))
    || voices.find(v => /en-US|en_US|English/i.test(v.lang || v.name))
    || voices[0]
    || null;
}

export function speakAVA(message, priority = false) {
  if (!isAVAVoiceEnabled()) return false;
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  if (priority) window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.voice = chooseAVAVoice();
  utterance.rate = 0.88;
  utterance.pitch = 1.18;
  utterance.volume = 0.92;
  window.speechSynthesis.speak(utterance);
  return true;
}