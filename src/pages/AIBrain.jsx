import React, { useState, useRef, useCallback, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CrownIcon, LionIcon } from "@/components/sb688/WarriorCrest";
import ReactMarkdown from "react-markdown";
import {
  Brain, Mic, MicOff, Send, Loader2, FileText, Mail,
  ListChecks, MessageSquare, Copy, Trash2, Volume2
} from "lucide-react";

const GOLD = "#C9A84C";

const MODES = [
  { id: "chat",     label: "General Chat",  icon: MessageSquare, color: "text-primary" },
  { id: "tasks",    label: "Task Manager",  icon: ListChecks,    color: "text-teal-400" },
  { id: "document", label: "Documents",     icon: FileText,      color: "text-blue-400" },
  { id: "email",    label: "Email Drafts",  icon: Mail,          color: "text-purple-400" },
];

const STARTERS = {
  chat:     ["What is Brick Stitch architecture?", "Summarize SB688 resilience principles", "Explain Ghost Node defense"],
  tasks:    ["Create a resilience audit task list", "Prioritize my infrastructure tasks this week", "Break down a disaster recovery plan into steps"],
  document: ["Draft a technical summary of SB688", "Summarize the Brick Stitch white paper", "Create an executive brief on AI resilience"],
  email:    ["Draft an email to stakeholders about system recovery", "Write a follow-up on the resilience audit", "Compose an incident report email"],
};

function ModeButton({ mode, active, onClick }) {
  const Icon = mode.icon;
  return (
    <button onClick={() => onClick(mode.id)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
        active
          ? "border-primary/50 bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}>
      <Icon className={`w-3.5 h-3.5 ${active ? "text-primary" : mode.color}`} />
      {mode.label}
    </button>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // TTS
  const speak = () => {
    const utt = new SpeechSynthesisUtterance(msg.content);
    utt.rate = 1.05;
    speechSynthesis.speak(utt);
  };

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)" }}>
          <Brain className="w-3.5 h-3.5" style={{ color: GOLD }} />
        </div>
      )}
      <div className={`max-w-[82%] space-y-1 ${isUser ? "items-end flex flex-col" : ""}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card border border-border text-foreground"
        }`}>
          {isUser
            ? <p className="leading-relaxed">{msg.content}</p>
            : <ReactMarkdown className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 text-foreground">
                {msg.content}
              </ReactMarkdown>
          }
        </div>
        {!isUser && (
          <div className="flex gap-1.5 pl-1">
            <button onClick={copy} className="text-[10px] flex items-center gap-1 text-muted-foreground hover:text-foreground transition px-1.5 py-0.5 rounded">
              <Copy className="w-3 h-3" /> {copied ? "Copied" : "Copy"}
            </button>
            <button onClick={speak} className="text-[10px] flex items-center gap-1 text-muted-foreground hover:text-foreground transition px-1.5 py-0.5 rounded">
              <Volume2 className="w-3 h-3" /> Speak
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AIBrain() {
  const [mode, setMode] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Reset conversation on mode change
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setMessages([]);
    setError(null);
  };

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    setError(null);

    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const res = await base44.functions.invoke("aiBrain", {
      messages: newMessages,
      mode,
    });

    const reply = res.data?.reply;
    if (reply) {
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } else {
      setError(res.data?.error || "No response received.");
    }
    setLoading(false);
  }, [messages, mode]);

  const handleSend = () => sendMessage(input);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Voice recording
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
          transcribeAudio: true,
          audioBase64: base64,
          mimeType: "audio/webm",
        });
        const transcription = res.data?.transcription;
        if (transcription) {
          setInput(transcription);
        }
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

  const currentMode = MODES.find(m => m.id === mode);

  return (
    <div className="min-h-screen bg-background text-foreground font-inter flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border"
        style={{ background: "hsl(220,22%,5%)", boxShadow: "0 1px 0 rgba(201,168,76,0.18)" }}>
        <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} />
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: 28 }}>
              <CrownIcon size={16} color={GOLD} />
              <LionIcon size={20} color={GOLD} />
            </div>
            <div className="w-px h-8" style={{ background: "linear-gradient(180deg,transparent,rgba(201,168,76,0.45),transparent)" }} />
            <div>
              <div className="text-xs font-bold tracking-widest font-cinzel" style={{ color: GOLD }}>JGA AI Brain</div>
              <div className="text-[9px] tracking-widest uppercase" style={{ color: "rgba(201,168,76,0.45)" }}>GPT-4o · Voice · Tasks · Documents · Email</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="text-[9px] border bg-primary/10 text-primary border-primary/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
              GPT-4o Active
            </Badge>
            <Link to="/" className="text-[10px] px-3 py-1.5 rounded border font-semibold"
              style={{ color: GOLD, borderColor: "rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.06)" }}>
              ← Console
            </Link>
          </div>
        </div>
      </header>

      {/* Mode selector */}
      <div className="border-b border-border bg-background/80">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center gap-2 flex-wrap">
          {MODES.map(m => (
            <ModeButton key={m.id} mode={m} active={mode === m.id} onClick={handleModeChange} />
          ))}
          {messages.length > 0 && (
            <button onClick={() => { setMessages([]); setError(null); }}
              className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition">
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 space-y-4 overflow-y-auto">

        {/* Empty state with starters */}
        {messages.length === 0 && (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2">
              <div className="flex flex-col items-center gap-1">
                <CrownIcon size={32} color="rgba(201,168,76,0.5)" />
                <LionIcon size={38} color="rgba(201,168,76,0.5)" />
              </div>
              <h2 className="text-lg font-bold font-cinzel" style={{ color: GOLD }}>
                {currentMode?.label} Mode
              </h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Type, speak, or choose a starter below. GPT-4o is ready.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {STARTERS[mode].map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)}
                  className="text-left px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-xs text-muted-foreground hover:text-foreground">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}

        {/* Loading */}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)" }}>
              <Brain className="w-3.5 h-3.5 animate-pulse" style={{ color: GOLD }} />
            </div>
            <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Thinking…</span>
            </div>
          </div>
        )}

        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error} — Make sure your OPENAI_API_KEY is set in dashboard settings.
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-end gap-2">
            {/* Voice button */}
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={loading}
              className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                recording
                  ? "bg-red-500/20 border-red-500/50 text-red-400 animate-pulse"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
              title="Hold to record voice">
              {recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Text input */}
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={recording ? "Listening… release to transcribe" : `Message AI Brain (${currentMode?.label})…`}
                rows={1}
                disabled={loading || recording}
                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:border-primary/50 transition-all"
                style={{ minHeight: 42, maxHeight: 120 }}
              />
            </div>

            {/* Send */}
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-10 h-10 p-0 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-[9px] text-muted-foreground/40 text-center mt-2">
            Hold mic to speak · Enter to send · GPT-4o powered · Voice reads back with speaker icon
          </p>
        </div>
      </div>
    </div>
  );
}