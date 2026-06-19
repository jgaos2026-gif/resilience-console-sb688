import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { Brain, ChevronRight, ChevronLeft, Sparkles, Loader2, CheckCircle2 } from "lucide-react";

const GOLD = "#C9A84C";

const QUESTIONS = [
  { id: "core_feeling", label: "When someone experiences your brand, what's the ONE feeling you want them to walk away with?", type: "text", placeholder: "e.g. Trust, power, warmth, excitement..." },
  { id: "enemy", label: "What does your brand stand AGAINST? Every powerful brand has an enemy.", type: "choice", options: ["Mediocrity", "Dishonesty", "Complexity", "Exclusivity", "Stagnation", "Conformity"] },
  { id: "persona", label: "If your brand were a person walking into a room, how do they show up?", type: "choice", options: ["The CEO — commanding and polished", "The Artist — creative and unexpected", "The Rebel — bold and unapologetic", "The Mentor — wise and approachable", "The Hustler — relentless and energetic", "The Visionary — futuristic and mysterious"] },
  { id: "color_energy", label: "Which color energy speaks to your brand's soul?", type: "colorpick", options: [
    { label: "Gold / Black", desc: "Power, luxury, authority", colors: ["#C9A84C", "#0a0c10"] },
    { label: "Deep Blue / White", desc: "Trust, clarity, precision", colors: ["#1e3a5f", "#ffffff"] },
    { label: "Crimson / Dark", desc: "Passion, boldness, urgency", colors: ["#b91c1c", "#1a0a0a"] },
    { label: "Forest / Earth", desc: "Growth, nature, grounded", colors: ["#14532d", "#78350f"] },
    { label: "Purple / Silver", desc: "Innovation, wisdom, futurism", colors: ["#6d28d9", "#94a3b8"] },
    { label: "Electric / Neon", desc: "Energy, disruption, youth", colors: ["#06b6d4", "#f0abfc"] },
  ]},
  { id: "words", label: "Pick 3 words that MUST describe your brand:", type: "multiselect", max: 3, options: ["Bold", "Trustworthy", "Innovative", "Elegant", "Raw", "Disciplined", "Warm", "Sharp", "Fearless", "Authentic", "Premium", "Grounded", "Disruptive", "Timeless", "Energetic"] },
  { id: "audience_soul", label: "Your ideal client — what keeps them up at night?", type: "text", placeholder: "What's their deepest pain, fear, or ambition?" },
  { id: "legacy", label: "In 10 years, your brand is legendary. What are people saying about it?", type: "text", placeholder: "The legacy statement..." },
  { id: "secret_weapon", label: "What's the one thing ONLY your brand can offer that no one else can copy?", type: "text", placeholder: "Your unfair advantage..." },
];

export default function BrandingQuestionnaire() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [multiSel, setMultiSel] = useState([]);

  const q = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  const handleAnswer = (val) => {
    setAnswers(prev => ({ ...prev, [q.id]: val }));
  };

  const handleMultiToggle = (opt) => {
    setMultiSel(prev => {
      if (prev.includes(opt)) return prev.filter(x => x !== opt);
      if (prev.length >= q.max) return prev;
      return [...prev, opt];
    });
  };

  const canNext = () => {
    if (q.type === "multiselect") return multiSel.length === q.max;
    return !!answers[q.id];
  };

  const next = () => {
    if (q.type === "multiselect") {
      setAnswers(prev => ({ ...prev, [q.id]: multiSel.join(", ") }));
    }
    if (isLast) {
      generateBranding();
    } else {
      setStep(s => s + 1);
      setMultiSel([]);
    }
  };

  const generateBranding = async () => {
    setLoading(true);
    const allAnswers = q.type === "multiselect" ? { ...answers, [q.id]: multiSel.join(", ") } : answers;
    const prompt = `You are a world-class brand strategist and psychologist. Based on these deep psychological brand discovery answers, create a complete brand identity report.

Answers:
${QUESTIONS.map(qq => `${qq.label}\nAnswer: ${allAnswers[qq.id] || "—"}`).join("\n\n")}

Generate a comprehensive brand identity that includes:
1. Brand Essence (one powerful sentence)
2. Brand Archetype (which of the 12 Jungian archetypes)
3. Brand Voice & Tone (3 descriptors + how to speak)
4. Color Psychology (primary, secondary, accent with hex codes and why)
5. Typography Direction (font personality, not specific fonts)
6. Brand Tagline (3 options, each with different energy)
7. Logo Concept Direction (visual metaphor and shape language)
8. Brand Story Hook (the opening line that hooks your audience)
9. Marketing Positioning Statement
10. The ONE thing to never compromise on

Be bold, strategic, and psychologically precise. This is high-stakes brand work.`;

    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          brand_essence: { type: "string" },
          archetype: { type: "string" },
          archetype_description: { type: "string" },
          voice_descriptors: { type: "array", items: { type: "string" } },
          voice_guide: { type: "string" },
          colors: { type: "array", items: { type: "object", properties: { role: { type: "string" }, hex: { type: "string" }, name: { type: "string" }, why: { type: "string" } } } },
          typography: { type: "string" },
          taglines: { type: "array", items: { type: "object", properties: { line: { type: "string" }, energy: { type: "string" } } } },
          logo_concept: { type: "string" },
          brand_story_hook: { type: "string" },
          positioning: { type: "string" },
          never_compromise: { type: "string" },
        }
      }
    });
    setResult(res);
    setLoading(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2 className="w-10 h-10 animate-spin" style={{ color: GOLD }} />
      <p className="text-sm font-cinzel" style={{ color: GOLD }}>AI is analyzing your brand DNA...</p>
      <p className="text-xs text-muted-foreground">Psychological profiling in progress</p>
    </div>
  );

  if (result) return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <CheckCircle2 className="w-10 h-10 mx-auto" style={{ color: GOLD }} />
        <h3 className="text-lg font-black font-cinzel gold-shimmer">Your Brand Identity Report</h3>
        <p className="text-xs text-muted-foreground">Psychologically engineered for maximum impact</p>
      </div>

      <div className="rounded-xl border-2 p-5 space-y-2" style={{ borderColor: `${GOLD}50`, background: "linear-gradient(135deg,#0d0f1a,#1a1200)" }}>
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Brand Essence</p>
        <p className="text-base font-bold font-cinzel italic" style={{ color: GOLD }}>"{result.brand_essence}"</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border p-4 space-y-1" style={{ background: "hsl(220,18%,7%)" }}>
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Brand Archetype</p>
          <p className="text-sm font-bold" style={{ color: GOLD }}>{result.archetype}</p>
          <p className="text-[10px] text-muted-foreground">{result.archetype_description}</p>
        </div>
        <div className="rounded-xl border border-border p-4 space-y-2" style={{ background: "hsl(220,18%,7%)" }}>
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Color Palette</p>
          <div className="flex gap-2 flex-wrap">
            {(result.colors || []).map((c, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded" style={{ background: c.hex, border: "1px solid rgba(255,255,255,0.2)" }} />
                <span className="text-[9px] text-muted-foreground">{c.role}</span>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground">{result.typography}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border p-4 space-y-2" style={{ background: "hsl(220,18%,7%)" }}>
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Tagline Options</p>
        {(result.taglines || []).map((t, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-[10px] font-bold italic" style={{ color: GOLD }}>"{t.line}"</span>
            <Badge className="text-[8px] border ml-auto flex-shrink-0" style={{ background: "rgba(201,168,76,0.1)", color: GOLD, borderColor: `${GOLD}30` }}>{t.energy}</Badge>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border p-4 space-y-2" style={{ background: "hsl(220,18%,7%)" }}>
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Brand Story Hook</p>
        <p className="text-sm italic text-foreground/90">"{result.brand_story_hook}"</p>
      </div>

      <div className="rounded-xl border border-border p-4 space-y-1" style={{ background: "hsl(220,18%,7%)" }}>
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Logo Concept Direction</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{result.logo_concept}</p>
      </div>

      <div className="rounded-xl border border-border p-4 space-y-1" style={{ background: "hsl(220,18%,7%)" }}>
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Never Compromise On</p>
        <p className="text-[11px] font-bold" style={{ color: "#ef4444" }}>{result.never_compromise}</p>
      </div>

      <Button onClick={() => { setResult(null); setStep(0); setAnswers({}); setMultiSel([]); }}
        className="w-full text-xs font-bold" variant="outline">
        Retake Questionnaire
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-[9px] text-muted-foreground">
          <span>Question {step + 1} of {QUESTIONS.length}</span>
          <span>{Math.round(((step + 1) / QUESTIONS.length) * 100)}% complete</span>
        </div>
        <div className="h-1 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%`, background: `linear-gradient(90deg, ${GOLD}, #8a6018)` }} />
        </div>
      </div>

      {/* Question */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Brain className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: GOLD }} />
          <p className="text-sm font-semibold text-foreground leading-relaxed">{q.label}</p>
        </div>

        {q.type === "text" && (
          <textarea
            className="w-full rounded-xl border border-border bg-card text-foreground text-sm p-4 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            rows={3}
            placeholder={q.placeholder}
            value={answers[q.id] || ""}
            onChange={e => handleAnswer(e.target.value)}
          />
        )}

        {q.type === "choice" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.options.map(opt => (
              <button key={opt} onClick={() => handleAnswer(opt)}
                className="text-left p-3 rounded-xl border text-xs font-medium transition-all"
                style={answers[q.id] === opt
                  ? { background: `${GOLD}15`, borderColor: `${GOLD}60`, color: GOLD }
                  : { background: "hsl(220,18%,7%)", borderColor: "hsl(var(--border))", color: "rgba(232,217,176,0.6)" }}>
                {opt}
              </button>
            ))}
          </div>
        )}

        {q.type === "colorpick" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {q.options.map(opt => (
              <button key={opt.label} onClick={() => handleAnswer(opt.label)}
                className="p-3 rounded-xl border text-left transition-all space-y-2"
                style={answers[q.id] === opt.label
                  ? { borderColor: `${GOLD}60`, background: `${GOLD}10` }
                  : { borderColor: "hsl(var(--border))", background: "hsl(220,18%,7%)" }}>
                <div className="flex gap-1">
                  {opt.colors.map((c, i) => <div key={i} className="w-5 h-5 rounded" style={{ background: c }} />)}
                </div>
                <p className="text-[10px] font-bold text-foreground">{opt.label}</p>
                <p className="text-[9px] text-muted-foreground">{opt.desc}</p>
              </button>
            ))}
          </div>
        )}

        {q.type === "multiselect" && (
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground">Select exactly {q.max} ({multiSel.length}/{q.max} chosen)</p>
            <div className="flex flex-wrap gap-2">
              {q.options.map(opt => {
                const sel = multiSel.includes(opt);
                return (
                  <button key={opt} onClick={() => handleMultiToggle(opt)}
                    className="px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all"
                    style={sel
                      ? { background: `${GOLD}15`, borderColor: `${GOLD}60`, color: GOLD }
                      : { background: "hsl(220,18%,7%)", borderColor: "hsl(var(--border))", color: "rgba(232,217,176,0.5)" }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex gap-2">
        {step > 0 && (
          <Button variant="outline" size="sm" onClick={() => setStep(s => s - 1)} className="gap-1 text-xs">
            <ChevronLeft className="w-3 h-3" /> Back
          </Button>
        )}
        <Button size="sm" disabled={!canNext()} onClick={next}
          className="ml-auto gap-1 text-xs font-bold"
          style={{ background: `linear-gradient(135deg, ${GOLD}, #8a6018)`, color: "#0a0c10" }}>
          {isLast ? <><Sparkles className="w-3 h-3" /> Generate My Brand</> : <>Next <ChevronRight className="w-3 h-3" /></>}
        </Button>
      </div>
    </div>
  );
}