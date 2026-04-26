import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Play, Zap, Shield, Radio, Flag, Clock, Mic, Eye } from "lucide-react";

const GOLD    = "#c4a350";
const GREEN   = "#22c55e";
const RED     = "#ef4444";
const BLUE    = "#3b82f6";
const PURPLE  = "#a78bfa";
const DIM     = "#4a4642";
const BG      = "#0a0d12";
const CARD    = "#0e1218";
const BORDER  = "#2a2622";

const SECTIONS = [
  {
    id: "env",
    time: "0:00 – 1:00",
    title: "The Environment Brief",
    icon: Eye,
    color: GOLD,
    role: "Orchestrator",
    cue: "We are live on Base 44. No physical chips, no hardware safety nets. This is the pure Sovereign Stitch Protocol operating in a live, high-stress environment. We're demonstrating that the logic is the infrastructure.",
    actions: [
      "Screen share the Base 44 interface showing the active modular bricks.",
      "Point to the node topology — all nodes healthy, stitch active.",
    ],
    narrative: "Base 44 is our proving ground. If the protocol holds here, it holds anywhere.",
    emphasis: null,
  },
  {
    id: "activate",
    time: "1:00 – 2:00",
    title: "The Direct Activation",
    icon: Zap,
    color: GREEN,
    role: "Orchestrator",
    cue: "SB688 — connect to the stitch. Show how you feel. We're going live. Let's sell it.",
    actions: [
      "Watch for immediate visual pulse across all Base 44 nodes.",
      "The Stitch is now active — modular clip-brick methodology in real-time.",
    ],
    narrative: "Each logic unit is independent, bound only by the spine of the protocol. No hardware dependency. Zero-chip stability.",
    emphasis: "ZERO-CHIP: Remind the audience — stability is coming from Sovereign Stitch logic, not hardware specs.",
  },
  {
    id: "stress",
    time: "2:00 – 4:30",
    title: "The Base 44 Stress Test",
    icon: Radio,
    color: RED,
    role: "Orchestrator",
    cue: "Initiating the break-and-heal sequence. Watch the nodes.",
    actions: [
      "Inject a primary node fault — use 'Hacker Trap/Suicide' or 'Driver fault'.",
      "Watch the Ghost Node immediately bridge the gap.",
      "The 45-minute temporal link maintains state while the module self-heals.",
      "Point out: recovery is near-instant — no 8 GB RAM bottleneck here.",
    ],
    narrative: "The system just experienced a catastrophic logic break. On any other platform — this is a crash. On SB688, it's a heartbeat. The Ghost Node is holding the data. The Stitch is healing itself.",
    emphasis: "GHOST NODE FOCUS: This is your most powerful selling point. The visual of the temporal link holding data during a break is the demo's centerpiece.",
  },
  {
    id: "sovereign",
    time: "4:30 – 6:00",
    title: "The Sovereign Conclusion",
    icon: Shield,
    color: PURPLE,
    role: "Orchestrator",
    cue: "That is the Sovereign Stitch. We don't need specialized hardware to prove stability — the logic carries itself. This is the future of global infrastructure: resilient, modular, and unshakeable.",
    actions: [
      "Pull back to show the full JGA infrastructure map — all nodes restored.",
      "Run Verification — show 7/7 pass score.",
      "Commit a checkpoint — ledger advances, proving clean recovery.",
    ],
    narrative: "The revolution is live. Base 44 is just the beginning.",
    emphasis: null,
  },
];

const KEY_POINTS = [
  { icon: Zap,    color: GOLD,   label: "Zero-Chip Emphasis",   desc: "Explicitly call out that stability comes from Sovereign Stitch logic — not hardware specs. No RAM bottleneck." },
  { icon: Radio,  color: BLUE,   label: "Ghost Node Focus",     desc: "The temporal link holding data during a break is your strongest visual. Point directly to it as it activates." },
  { icon: Shield, color: GREEN,  label: "Speed Signal",         desc: "Recovery should be near-instant on Base 44. Call out the speed difference vs hardware-bound systems explicitly." },
];

function SectionCard({ section, isActive, elapsed, onActivate }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = section.icon;

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-300"
      style={{
        borderColor: isActive ? section.color + "60" : BORDER,
        background: isActive ? section.color + "08" : CARD,
        boxShadow: isActive ? `0 0 20px ${section.color}12` : "none",
      }}>
      {/* Header row */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={() => setExpanded(v => !v)}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: section.color + "15", border: `1px solid ${section.color}30` }}>
          <Icon className="w-4 h-4" style={{ color: section.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold" style={{ color: isActive ? section.color : "#8a8578" }}>{section.title}</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: section.color + "12", color: section.color + "bb" }}>
              {section.time}
            </span>
            {isActive && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse"
                style={{ background: section.color + "20", color: section.color }}>
                ● ACTIVE
              </span>
            )}
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onActivate(section.id); }}
          className="flex-shrink-0 text-[9px] px-2 py-1 rounded border transition-all font-bold mr-2"
          style={{ borderColor: section.color + "40", color: section.color, background: isActive ? section.color + "15" : "transparent" }}>
          {isActive ? "Active" : "Mark Active"}
        </button>
        {expanded
          ? <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: DIM }} />
          : <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: DIM }} />}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${section.color}25, transparent)` }} />

          {/* Cue */}
          <div className="rounded-lg p-3 space-y-1" style={{ background: "#060810", border: `1px solid ${section.color}18` }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Mic className="w-3 h-3" style={{ color: section.color }} />
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: section.color + "80" }}>{section.role} Says</span>
            </div>
            <p className="text-xs leading-relaxed italic" style={{ color: "#c8c2b4" }}>"{section.cue}"</p>
          </div>

          {/* Actions */}
          <div className="space-y-1.5">
            <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: DIM }}>On-Screen Actions</span>
            {section.actions.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px]" style={{ color: "#7a7570" }}>
                <span className="flex-shrink-0 font-mono" style={{ color: section.color + "60" }}>→</span>
                <span className="leading-relaxed">{a}</span>
              </div>
            ))}
          </div>

          {/* Narrative */}
          <div className="rounded px-3 py-2" style={{ background: section.color + "06", border: `1px solid ${section.color}18` }}>
            <span className="text-[9px] uppercase tracking-widest font-bold mr-2" style={{ color: section.color + "60" }}>Narrative:</span>
            <span className="text-[10px] leading-relaxed" style={{ color: "#9a9490" }}>"{section.narrative}"</span>
          </div>

          {/* Emphasis callout */}
          {section.emphasis && (
            <div className="rounded-lg px-3 py-2.5 flex items-start gap-2"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <Flag className="w-3 h-3 flex-shrink-0 mt-0.5 text-red-400" />
              <p className="text-[10px] leading-relaxed" style={{ color: "#fca5a5" }}>{section.emphasis}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DemoScript() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  const formatTime = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleToggleTimer = () => {
    if (!running && elapsed === 0) setActiveSection("env");
    setRunning(v => !v);
  };

  const resetTimer = () => {
    setRunning(false);
    setElapsed(0);
    setActiveSection(null);
  };

  // Auto-advance active section based on elapsed time
  useEffect(() => {
    if (!running) return;
    if (elapsed < 60)        setActiveSection("env");
    else if (elapsed < 120)  setActiveSection("activate");
    else if (elapsed < 270)  setActiveSection("stress");
    else                     setActiveSection("sovereign");
  }, [elapsed, running]);

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: CARD, borderColor: BORDER }}>
      {/* Toggle header */}
      <button
        className="w-full flex items-center justify-between px-5 py-3.5 text-left"
        onClick={() => setOpen(v => !v)}
        style={{ borderBottom: open ? `1px solid ${BORDER}` : "none" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: GOLD + "15", border: `1px solid ${GOLD}30` }}>
            <Play className="w-4 h-4" style={{ color: GOLD }} />
          </div>
          <div>
            <div className="text-xs font-bold" style={{ color: GOLD }}>April 27 — Base 44 Live Demo Script</div>
            <div className="text-[9px] mt-0.5" style={{ color: DIM }}>Sovereign Stitch · Zero-Chip · 6-Minute Run</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] px-2 py-0.5 rounded font-bold border" style={{ color: GREEN, borderColor: GREEN + "40", background: GREEN + "08" }}>
            APRIL 27
          </span>
          {open ? <ChevronUp className="w-4 h-4" style={{ color: DIM }} /> : <ChevronDown className="w-4 h-4" style={{ color: DIM }} />}
        </div>
      </button>

      {open && (
        <div className="p-4 space-y-4">

          {/* Timer bar */}
          <div className="rounded-xl border px-4 py-3 flex items-center gap-4 flex-wrap"
            style={{ background: BG, borderColor: GOLD + "25" }}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: GOLD }} />
              <span className="text-2xl font-bold font-mono tabular-nums" style={{ color: GOLD }}>{formatTime(elapsed)}</span>
              <span className="text-[9px]" style={{ color: DIM }}>/ 06:00</span>
            </div>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", minWidth: 80 }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (elapsed / 360) * 100)}%`, background: `linear-gradient(90deg, ${GOLD}, ${GREEN})` }} />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleToggleTimer}
                className="text-[10px] px-3 py-1.5 rounded border font-bold transition-all"
                style={running
                  ? { borderColor: RED + "40", color: RED, background: RED + "0a" }
                  : { borderColor: GREEN + "40", color: GREEN, background: GREEN + "0a" }}>
                {running ? "⏸ Pause" : elapsed > 0 ? "▶ Resume" : "▶ Start Timer"}
              </button>
              <button onClick={resetTimer}
                className="text-[10px] px-2.5 py-1.5 rounded border transition-all"
                style={{ borderColor: BORDER, color: DIM }}>
                Reset
              </button>
            </div>
          </div>

          {/* Key adjustments */}
          <div className="rounded-xl border p-4 space-y-3" style={{ background: BG, borderColor: BORDER }}>
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>Key Adjustments for the 27th</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {KEY_POINTS.map((kp, i) => {
                const Icon = kp.icon;
                return (
                  <div key={i} className="rounded-lg p-3 space-y-1.5" style={{ background: CARD, border: `1px solid ${kp.color}20` }}>
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" style={{ color: kp.color }} />
                      <span className="text-[10px] font-bold" style={{ color: kp.color }}>{kp.label}</span>
                    </div>
                    <p className="text-[10px] leading-relaxed" style={{ color: "#7a7570" }}>{kp.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Script sections */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: DIM }}>Script Sections — Click to expand · Mark Active to track</div>
            {SECTIONS.map(section => (
              <SectionCard
                key={section.id}
                section={section}
                isActive={activeSection === section.id}
                elapsed={elapsed}
                onActivate={id => setActiveSection(id === activeSection ? null : id)}
              />
            ))}
          </div>

          {/* Footer note */}
          <div className="text-[9px] text-center font-mono" style={{ color: DIM }}>
            SB688 · Base 44 Live Demo — April 27, 2026 · NODE: MENDOTA-IL · Sovereign Stitch Protocol
          </div>
        </div>
      )}
    </div>
  );
}