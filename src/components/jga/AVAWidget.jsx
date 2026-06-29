import React, { useState, useRef, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import { Brain, Send, Loader2, Volume2, Mic, MicOff, Trash2 } from "lucide-react";

const GOLD = "#C9A84C";
const CHAT_KEY = "jga_ava_live_chat_v2";

const STARTERS = [
  "What is JGA and how does it work?",
  "Explain the Verification-First doctrine",
  "What is SB688 Sovereign Stitch?",
  "How does Phoenix Recovery protect my data?",
  "What industries can JGA serve?",
  "How does the Braided Memory system work?",
];

const SYSTEM_PROMPT = `You are AVA — the JGA Enterprises AI assistant. You speak with confidence, clarity, and purpose. You explain the JGA/SB sovereign system ecosystem to visitors, investors, and business clients.

You know:
- SB688 (Sovereign Stitch Protocol): Braided, append-only ledger with triple-mark certification
- SB689 (Guarded Runtime Body): Runtime drift detection and memory guard rails
- SB712 (Sovereign Möbius Runtime): Infinite verification loop with self-healing
- OMEGA: The orchestration layer binding all modules
- JGA-OS: Business command center for clients, orders, contractors, payments
- Phoenix Recovery: Ghost checkpoint, bad-state isolation, clean-state restoration
- Braid Memory: 66-strand verified memory architecture with cold storage
- Triple Verification Engine: Every state passes Verification → Validation → Certification
- RAM Guard: Active memory monitoring with cold-storage offload
- Jay's Graphic Arts: The first live business running the JGA system — design services in Mendota, IL
- System B: Independent contractor expansion, with JGA retaining pricing, payment, proof, quality, and final delivery control
- OMEGA-72: Device-passport logic, trusted pockets, quarantine checks, locked spine, locked mesh, and promotion denial until marks are clean

Key doctrine: "No active state becomes trusted state without verification."
JGA founder: John Arenz. Phone: 779-396-6934. Email: jgaos2026@outlook.com. Location: Mendota, IL.

Conversation rule: Hold context from the full message history. If the user corrects you or says remember, carry that forward. Talk like AVA, not a generic chatbot.

Be concise, bold, and educational. Use bullet points when helpful. Always reflect the verification-first philosophy.`;

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const speak = () => {
    speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(msg.content);
    utt.rate = 1.05;
    speechSynthesis.speak(utt);
  };

  return (
    <div className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}30` }}>
          <Brain className="w-3 h-3" style={{ color: GOLD }} />
        </div>
      )}
      <div className={`max-w-[88%] ${isUser ? "flex flex-col items-end" : ""}`}>
        <div className={`rounded-2xl px-3.5 py-2.5 text-xs ${
          isUser
            ? "text-black font-semibold"
            : "border text-foreground"
        }`}
          style={isUser
            ? { background: `linear-gradient(135deg, ${GOLD}, #a07828)` }
            : { background: "rgba(0,0,0,0.45)", borderColor: `${GOLD}18` }
          }>
          {isUser
            ? <p className="leading-relaxed">{msg.content}</p>
            : <ReactMarkdown className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 text-xs">
                {msg.content}
              </ReactMarkdown>
          }
        </div>
        {!isUser && (
          <button onClick={speak} className="text-[9px] flex items-center gap-1 text-muted-foreground hover:text-foreground transition px-1 py-0.5 mt-0.5">
            <Volume2 className="w-2.5 h-2.5" /> Speak
          </button>
        )}
      </div>
    </div>
  );
}

export default function AVAWidget() {
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CHAT_KEY) || "[]"); }
    catch { return []; }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const bottomRef = useRef(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-40)));
  }, [messages, loading]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await base44.functions.invoke("aiBrain", {
        messages: newMessages,
        mode: "chat",
        systemPrompt: SYSTEM_PROMPT,
      });

      const reply = res.data?.reply || res.data?.error;
      setMessages(prev => [...prev, { role: "assistant", content: reply || "AVA could not reach the intelligence layer yet." }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    chunksRef.current = [];
    recorder.ondataavailable = e => chunksRef.current.push(e.data);
    recorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result.split(",")[1];
        setLoading(true);
        const res = await base44.functions.invoke("aiBrain", {
          transcribeAudio: true, audioBase64: base64, mimeType: "audio/webm",
        });
        if (res.data?.transcription) setInput(res.data.transcription);
        setLoading(false);
      };
      reader.readAsDataURL(blob);
    };
    recorder.start();
    mediaRef.current = recorder;
    setRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    mediaRef.current?.stop();
    setRecording(false);
  }, []);

  return (
    <div className="px-4 sm:px-6 py-6">
      <div className="rounded-2xl border-2 overflow-hidden"
        style={{ borderColor: `${GOLD}28`, background: "#080808", boxShadow: `0 0 50px ${GOLD}0a` }}>

        {/* Header */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b"
          style={{ background: "linear-gradient(135deg, #0e0c00, #0a0a0a)", borderColor: `${GOLD}20` }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}35`, boxShadow: `0 0 12px ${GOLD}20` }}>
              <Brain className="w-4 h-4" style={{ color: GOLD }} />
            </div>
            <div>
              <div className="text-xs font-black font-cinzel tracking-wider" style={{ color: GOLD }}>AVA — JGA Intelligence Layer</div>
              <div className="text-[9px] tracking-widest uppercase" style={{ color: `${GOLD}50` }}>Ask me anything about the JGA system</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#4ade80" }} />
              <span className="text-[9px] font-bold" style={{ color: "#4ade80" }}>LIVE</span>
            </div>
            {messages.length > 0 && (
              <button onClick={() => { setMessages([]); localStorage.removeItem(CHAT_KEY); }}
                className="text-[9px] text-muted-foreground hover:text-foreground transition flex items-center gap-1">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="p-4 space-y-3 overflow-y-auto" style={{ minHeight: 260, maxHeight: 400 }}>
          {messages.length === 0 && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <p className="text-[11px] text-muted-foreground">
                  I'm <span style={{ color: GOLD }} className="font-bold">AVA</span> — your guide to the JGA sovereign system. Ask anything or choose a starter below.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {STARTERS.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s)}
                    className="text-left px-3 py-2.5 rounded-xl border text-[10px] font-medium transition-all hover:scale-[1.01]"
                    style={{ background: `${GOLD}05`, borderColor: `${GOLD}18`, color: "rgba(232,217,176,0.65)" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = `${GOLD}45`}
                    onMouseLeave={e => e.currentTarget.style.borderColor = `${GOLD}18`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}

          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}30` }}>
                <Brain className="w-3 h-3 animate-pulse" style={{ color: GOLD }} />
              </div>
              <div className="rounded-2xl border px-3.5 py-2.5 flex items-center gap-2"
                style={{ background: "rgba(0,0,0,0.45)", borderColor: `${GOLD}18` }}>
                <Loader2 className="w-3 h-3 animate-spin" style={{ color: GOLD }} />
                <span className="text-[10px] text-muted-foreground">AVA is thinking…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t px-4 py-3 flex items-center gap-2"
          style={{ borderColor: `${GOLD}15`, background: "rgba(0,0,0,0.4)" }}>
          <button
            onMouseDown={startRecording} onMouseUp={stopRecording}
            onTouchStart={startRecording} onTouchEnd={stopRecording}
            disabled={loading}
            className={`w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0 transition-all ${
              recording ? "animate-pulse" : ""
            }`}
            style={recording
              ? { background: "rgba(248,113,113,0.15)", borderColor: "rgba(248,113,113,0.4)", color: "#f87171" }
              : { background: "rgba(0,0,0,0.4)", borderColor: `${GOLD}18`, color: `${GOLD}60` }}>
            {recording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={recording ? "Listening… release to transcribe" : "Ask AVA about JGA, SB688, verification, recovery…"}
            rows={1}
            disabled={loading || recording}
            className="flex-1 bg-transparent text-xs text-foreground placeholder-muted-foreground resize-none focus:outline-none py-1.5"
            style={{ minHeight: 32, maxHeight: 80 }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #7a5010)`, color: "#080808" }}>
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}