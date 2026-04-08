import React, { useState, useRef, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { INDUSTRIES, SCENARIOS } from "@/lib/sb688Engine";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Loader2, Bot, User, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";

const SYSTEM_CONTEXT = `You are the SB688 Mission Analyst — an AI embedded in the SB688 Universal Resilience Console.

Your role: help operators, sales engineers, and executives understand what the system is doing, why it matters, and what the business implications are.

You have access to real-time system state. Answer questions about:
- Current system health and component status
- Resilience and continuity scores
- Scenario explanations in plain English
- Recovery actions and their meaning
- Trusted record chain integrity
- Proof suite results
- Industry-specific implications
- Brick Stitch architecture (1/2 Offset Spine+Ribs geometry, Merkle Stitch, Sovereign AI Guardian)
- SB688 value proposition

Style: confident, precise, plain-English, aerospace-grade. No fluff. No jargon without explanation. Speak as if briefing an executive who is technically literate but time-constrained.`;

const STARTER_PROMPTS = [
  "Explain what just happened in plain English",
  "What does the resilience score mean for my business?",
  "How does the Brick Stitch architecture prevent cascading failures?",
  "What would happen if we didn't run Smart Recovery?",
  "Explain the Sovereign AI Guardian to a non-technical executive",
  "How does this prove compliance to auditors?",
];

export default function AIMissionAnalyst({ state }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Mission Analyst online. I have full visibility into the current system state. Ask me anything — about what's happening, what it means for your industry, or how to explain this to stakeholders.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildStateContext = useCallback(() => {
    const industry = INDUSTRIES[state.industry];
    const scenario = state.scenario ? SCENARIOS[state.scenario] : null;
    const componentStatuses = Object.entries(state.components)
      .map(([key, comp]) => `${industry.components[key]?.label || key}: ${comp.status}`)
      .join(", ");

    return `
LIVE SYSTEM STATE:
- Industry Mode: ${industry.title}
- Operational State: ${state.operationalState}
- Resilience Score: ${state.resilienceScore}%
- Mission Continuity: ${state.continuityScore}%
- Active Scenario: ${scenario ? scenario.title : "None loaded"}
- Problem Simulated: ${state.problemSimulated ? "Yes" : "No"}
- Smart Recovery Run: ${state.recoveryRun ? "Yes" : "No"}
- Proof Suite: ${state.proofRun ? `${state.proofResults.filter(p => p.pass).length}/${state.proofResults.length} passed` : "Not run"}
- Approved Route: ${state.approvedRoute.map(k => industry.components[k]?.label || k).join(" → ")}
- Route Type: ${state.routeType}
- Route Time: ${state.routeTime}ms
- Trusted Record Version: v${state.trustedRecordVersion}
- Component Status: ${componentStatuses}
- Recent Events: ${state.eventLog.slice(0, 3).map(e => e.message).join("; ")}
`;
  }, [state]);

  const sendMessage = useCallback(async (userInput) => {
    const text = userInput || input.trim();
    if (!text || isThinking) return;
    setInput("");

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    const stateContext = buildStateContext();
    const conversationHistory = messages
      .slice(-6)
      .map((m) => `${m.role === "user" ? "Operator" : "Mission Analyst"}: ${m.content}`)
      .join("\n");

    const prompt = `${SYSTEM_CONTEXT}

${stateContext}

CONVERSATION HISTORY:
${conversationHistory}

Operator: ${text}

Mission Analyst:`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    setMessages((prev) => [...prev, { role: "assistant", content: result }]);
    setIsThinking(false);
  }, [input, isThinking, messages, buildStateContext]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4 flex flex-col" style={{ minHeight: 480 }}>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
          <Bot className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-primary">AI Mission Analyst</h3>
          <p className="text-[10px] text-muted-foreground">Live system awareness • Plain-English briefings • Powered by AI</p>
        </div>
        <div className="ml-auto w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
      </div>

      {/* Starter prompts */}
      <div className="flex flex-wrap gap-1.5">
        {STARTER_PROMPTS.slice(0, 3).map((p, i) => (
          <button
            key={i}
            onClick={() => sendMessage(p)}
            disabled={isThinking}
            className="text-[10px] px-2 py-1 rounded-full border border-primary/20 text-primary/70 hover:bg-primary/10 hover:text-primary transition-all"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ maxHeight: 320 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-blue-400" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
              msg.role === "user"
                ? "bg-primary/10 border border-primary/20 text-foreground"
                : "bg-secondary/60 border border-border/40 text-foreground/85"
            }`}>
              {msg.role === "assistant" ? (
                <ReactMarkdown
                  className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1 [&_strong]:text-primary"
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
            )}
          </div>
        ))}
        {isThinking && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="px-3 py-2 rounded-xl bg-secondary/60 border border-border/40">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the Mission Analyst anything..."
          rows={2}
          className="flex-1 resize-none bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
        />
        <Button
          onClick={() => sendMessage()}
          disabled={isThinking || !input.trim()}
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}