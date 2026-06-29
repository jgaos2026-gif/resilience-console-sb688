const VOICE_KEY = "jga_ava_voice_enabled_v1";

export function isAVAVoiceEnabled() {
  return localStorage.getItem(VOICE_KEY) !== "off";
}

export function setAVAVoiceEnabled(enabled) {
  localStorage.setItem(VOICE_KEY, enabled ? "on" : "off");
}

export function speakAVA(message, priority = false) {
  if (!isAVAVoiceEnabled()) return false;
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  if (priority) window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  const voices = window.speechSynthesis.getVoices?.() || [];
  utterance.voice = voices.find(v => /female|zira|samantha|eva|aria|jenny/i.test(v.name)) || voices[0] || null;
  utterance.rate = 0.92;
  utterance.pitch = 0.95;
  utterance.volume = 0.9;
  window.speechSynthesis.speak(utterance);
  return true;
}