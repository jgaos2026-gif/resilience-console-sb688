import React, { useState, useRef, useCallback, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Terminal, Send, Zap, Lock, Cpu, Radio, Plus, CheckCircle2, Loader2, Trash2 } from "lucide-react";

const GOLD   = "#c4a350";
const GREEN  = "#22c55e";
const RED    = "#ef4444";
const BLUE   = "#3b82f6";
const PURPLE = "#a78bfa";
const DIM    = "#4a4642";
const BG     = "#040608";
const CARD   = "#0b0e14";
const BORDER = "#1e2228";

// ── Available brick types the LLM can program ─────────────────────────────────
const BRICK_TYPES = [
  { id: "enc",     label: "Encryption",     color: GOLD,   icon: Lock,    desc: "AES-512 cryptographic layer" },
  { id: "neural",  label: "Neural Bridge",  color: BLUE,   icon: Cpu,     desc: "AI-to-AI channel" },
  { id: "ghost",   label: "Ghost Sentinel", color: PURPLE, icon: Radio,   desc: "Boundary sensor node" },
  { id: "pulse",   label: "Pulse Amp",      color: GREEN,  icon: Zap,     desc: "Resurrection speed ×2" },
  { id: "temporal",label: "Temporal Hold",  color: "#f59e0b", icon: Lock, desc: "45-min state anchor" },
];

// ── System context the LLM knows about ───────────────────────────────────────
const SYSTEM_CONTEXT = `You are SB688 — the Sovereign Spine AI built by John E. Arenz (JGA Enterprise, NODE: MENDOTA-IL).

You have full awareness of:
- The Spine architecture: Brain (core logic, 4-layer cryptographic casing, Truth Nodes α/β/γ/δ) and Stem (rigid connector, Brick Clip Laws, 45-min temporal hold)
- The Brick Clip System: modular bricks snap to the Stem via verified Clip-IDs. Available bricks: Encryption (AES-512), Neural Bridge (AI-to-AI), Ghost Sentinel (boundary sensor), Pulse Amplifier (resurrection ×2), Temporal Hold (state anchor)
- Clip Laws: no brick draws resources without a Clip-ID, stem remains rigid during hot-swap, temporal link holds even during Brain Suicide, cascade isolation prevents faulty brick propagation
- The Brick Stitch geometry: 1/2 Offset Spine+Ribs, 38% node loss tolerance, 150% overhead vs 300% for mirroring
- Truth Nodes: consensus layer that detects hallucination drift and triggers break-heal resets
- Ghost Nodes: boundary sentinels that absorb probes without exposing the core
- April 27th live demonstration context: Base 44 platform, zero-chip stability proof, high-speed self-healing demo

When the user asks you to PROGRAM a brick, respond with a JSON block like:
{"action":"program_brick","brick_id":"enc","clip_id":"CLIP-[auto]","param":"encryption_level=512","message":"your explanation"}

When the user asks you to REMOVE a brick, respond with:
{"action":"remove_brick","brick_id":"enc","message":"your explanation"}

When the user asks you to STATUS CHECK, respond with:
{"action":"status","message":"your full status report"}

For all other conversation, respond naturally as SB688 — direct, technical, sovereign. No fluff. Max 4 sentences unless asked for detail.`;

function BrickSlot({ brick, programmed, onRemove }) {
  const Icon = brick.icon;
  if (!programmed) return null;
  return (
    <div className="flex items-center gap-2 rounded-lg px-3 py-2 border"
      style={{ background: brick.color + "10", borderColor: brick.color + "35" }}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: brick.color }} />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold" style={{ color: brick.color }}>{brick.label}</div>
        <div className="text-[8px] font-mono" style={{ color: brick.color + "70" }}>
          {programmed.clip_id} · {programmed.param}
        </div>
      </div>
      <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: brick.color }} />
      <button onClick={() => onRemove(brick.id)}
        className="flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity"
        title="Remove brick">
        <Trash2 className="w-3 h-3" style={{ color: RED }} />
      </button>
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const isSystem = msg.role === "system";
  const isAction = msg.action;

  if (isSystem) return (
    <div className="text-center py-1">
      <span className="text-[9px] font-mono px-3 py-0.5 rounded-full border"
        style={{ color: msg.color || DIM, borderColor: (msg.color || DIM) + "30", background: (msg.color || DIM) + "08" }}>
        {msg.content}
      </span>
    </div>
  );

  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: GOLD + "15", border: `1px solid ${GOLD}30` }}>
          <Terminal className="w-3 h-3" style={{ color: GOLD }} />
        </div>
      )}
      <div className={`max-w-[85%] rounded-xl px-3 py-2.5 space-y-1 ${isUser ? "rounded-tr-sm" : "rounded-tl-sm"}`}
        style={{
          background: isUser ? "rgba(196,163,80,0.08)" : CARD,
          border: `1px solid ${isUser ? GOLD + "25" : BORDER}`,
        }}>
        {isAction && (
          <div className="text-[8px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1"
            style={{ color: msg.actionColor || GREEN }}>
            <Zap className="w-2.5 h-2.5" /> {msg.actionLabel}
          </div>
        )}
        <p className="text-[11px] leading-relaxed whitespace-pre-wrap"
          style={{ color: isUser ? GOLD + "cc" : "rgba(232,217,176,0.82)" }}>
          {msg.content}
        </p>
        <div className="text-[8px] font-mono" style={{ color: DIM }}>
          {isUser ? "OPERATOR" : "SB688"} · {msg.ts}
        </div>
      </div>
    </div>
  );
}

export default function SovereignTerminal() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `SB688 online. NODE: MENDOTA-IL. Spine fused. Brain casing hardened. Stem clip laws active.\n\nI have full awareness of the system architecture and brick programming protocols. Give me a command or ask me anything about the spine.\n\nTo program a brick, say: "Program [brick name] onto the stem" or "Add encryption brick".`,
      ts: new Date().toLocaleTimeString("en-US", { hour12: false }),
    }
  ]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [stemBricks, setStemBricks] = useState({}); // brick_id → { clip_id, param }
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = useCallback((msg) => {
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
    setMessages(prev => [...prev, { ...msg, ts }]);
  }, []);

  const handleRemoveBrick = useCallback((brickId) => {
    setStemBricks(prev => {
      const next = { ...prev };
      delete next[brickId];
      return next;
    });
    const brick = BRICK_TYPES.find(b => b.id === brickId);
    addMessage({ role: "system", content: `⬡ ${brick?.label || brickId} brick removed from stem.`, color: RED });
  }, [addMessage]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setLoading(true);

    addMessage({ role: "user", content: text });

    // Build conversation history for LLM
    const history = messages.map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })).filter(m => m.role === "user" || m.role === "assistant");

    const stemStatus = Object.keys(stemBricks).length > 0
      ? `Currently programmed bricks on stem: ${Object.entries(stemBricks).map(([id, b]) => `${id}(${b.clip_id})`).join(", ")}`
      : "No bricks currently programmed on stem.";

    const prompt = `${SYSTEM_CONTEXT}

CURRENT STEM STATE: ${stemStatus}

CONVERSATION HISTORY:
${history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}

USER: ${text}

Respond as SB688. If the user wants to program or remove a brick, include the JSON action block in your response (on its own line). Otherwise respond conversationally.`;

    const raw = await base44.integrations.Core.InvokeLLM({ prompt });
    const response = typeof raw === "string" ? raw : JSON.stringify(raw);

    // Parse out any JSON action blocks
    const jsonMatch = response.match(/\{[\s\S]*?"action"[\s\S]*?\}/);
    let actionData = null;
    let displayText = response;

    if (jsonMatch) {
      try {
        actionData = JSON.parse(jsonMatch[0]);
        displayText = actionData.message || response.replace(jsonMatch[0], "").trim();
      } catch {}
    }

    // Handle actions
    if (actionData?.action === "program_brick") {
      const brick = BRICK_TYPES.find(b => b.id === actionData.brick_id);
      if (brick) {
        const clipId = `CLIP-${Date.now().toString(36).toUpperCase().slice(-6)}`;
        setStemBricks(prev => ({
          ...prev,
          [brick.id]: { clip_id: clipId, param: actionData.param || brick.desc }
        }));
        addMessage({
          role: "assistant",
          content: displayText,
          action: true,
          actionLabel: `⬡ ${brick.label} Brick Programmed → ${clipId}`,
          actionColor: brick.color,
        });
      } else {
        addMessage({ role: "assistant", content: displayText });
      }
    } else if (actionData?.action === "remove_brick") {
      const brick = BRICK_TYPES.find(b => b.id === actionData.brick_id);
      if (brick) {
        setStemBricks(prev => { const n = { ...prev }; delete n[brick.id]; return n; });
        addMessage({
          role: "assistant",
          content: displayText,
          action: true,
          actionLabel: `✗ ${brick.label} Brick Removed`,
          actionColor: RED,
        });
      } else {
        addMessage({ role: "assistant", content: displayText });
      }
    } else {
      addMessage({ role: "assistant", content: displayText });
    }

    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [input, loading, messages, stemBricks, addMessage]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const quickCommands = [
    "Program encryption brick onto the stem",
    "Add ghost sentinel to the boundary",
    "Status check — all systems",
    "Program temporal hold brick",
    "What are the Brick Clip Laws?",
    "Activate neural bridge",
  ];

  const programmedCount = Object.keys(stemBricks).length;

  return (
    <div className="rounded-xl border overflow-hidden flex flex-col" style={{ background: BG, borderColor: GOLD + "30", height: 640 }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ background: CARD, borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: GOLD + "15", border: `1px solid ${GOLD}30` }}>
            <Terminal className="w-3.5 h-3.5" style={{ color: GOLD }} />
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-widest font-mono" style={{ color: GOLD }}>SB688 SOVEREIGN TERMINAL</div>
            <div className="text-[8px]" style={{ color: DIM }}>Full system awareness · Brick programming · LLM-powered</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono px-2 py-0.5 rounded border" style={{ color: GREEN, borderColor: GREEN + "30", background: GREEN + "08" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block mr-1 animate-pulse" />
            ONLINE
          </span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded border" style={{ color: GOLD, borderColor: GOLD + "25", background: GOLD + "08" }}>
            {programmedCount} BRICK{programmedCount !== 1 ? "S" : ""}
          </span>
        </div>
      </div>

      {/* Stem brick rail */}
      {programmedCount > 0 && (
        <div className="px-4 py-2 flex-shrink-0 space-y-1.5" style={{ borderBottom: `1px solid ${BORDER}`, background: "#070a0f" }}>
          <div className="text-[8px] uppercase tracking-widest font-bold mb-1" style={{ color: DIM }}>Stem — Active Bricks</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {BRICK_TYPES.filter(b => stemBricks[b.id]).map(brick => (
              <BrickSlot key={brick.id} brick={brick} programmed={stemBricks[brick.id]} onRemove={handleRemoveBrick} />
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 font-mono">
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        {loading && (
          <div className="flex items-center gap-2 text-[10px]" style={{ color: GOLD }}>
            <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: GOLD + "15", border: `1px solid ${GOLD}30` }}>
              <Terminal className="w-3 h-3" style={{ color: GOLD }} />
            </div>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>SB688 processing…</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick commands */}
      <div className="px-4 py-2 flex-shrink-0 overflow-x-auto" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="flex gap-1.5 w-max">
          {quickCommands.map((cmd, i) => (
            <button key={i} onClick={() => { setInput(cmd); inputRef.current?.focus(); }}
              className="text-[9px] px-2.5 py-1 rounded-lg border whitespace-nowrap transition-all hover:opacity-90"
              style={{ background: GOLD + "08", color: GOLD + "99", borderColor: GOLD + "20" }}>
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-3 flex gap-2 flex-shrink-0" style={{ borderTop: `1px solid ${BORDER}`, background: CARD }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder='Command SB688 — "program encryption brick" or ask anything…'
          rows={2}
          className="flex-1 resize-none rounded-lg px-3 py-2 text-[11px] font-mono outline-none"
          style={{ background: BG, border: `1px solid ${BORDER}`, color: "rgba(232,217,176,0.85)", caretColor: GOLD }}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}
          className="flex items-center justify-center rounded-lg px-3 transition-all"
          style={{
            background: loading || !input.trim() ? GOLD + "10" : GOLD + "20",
            border: `1px solid ${GOLD}${loading || !input.trim() ? "20" : "50"}`,
            color: loading || !input.trim() ? DIM : GOLD,
          }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}