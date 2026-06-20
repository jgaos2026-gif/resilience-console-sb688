import React, { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, Map, Trophy, RotateCcw, Zap } from "lucide-react";

const GOLD = "#C9A84C";

const ITEMS = [
  { id: "new_client",   label: "New Client File",         emoji: "📁", zone: "quarantine",  reason: "Unknown origin — must be verified before entering trusted pipeline." },
  { id: "untested",     label: "Untested Code",           emoji: "💻", zone: "quarantine",  reason: "Code without verification is a liability. Quarantine until tested." },
  { id: "verified",     label: "Verified Report",         emoji: "📋", zone: "trusted",     reason: "Passed all gates. Verified, validated, certified. Trusted state earned." },
  { id: "broken",       label: "Broken Module",           emoji: "⚠️", zone: "quarantine",  reason: "Broken = untrustworthy. Isolate, repair, re-verify before promotion." },
  { id: "checkpoint",   label: "Signed Checkpoint",       emoji: "✅", zone: "trusted",     reason: "Checkpoint is sealed and signed. It has earned trusted state." },
  { id: "unknown_mem",  label: "Unknown Memory Pocket",   emoji: "🧩", zone: "quarantine",  reason: "Unknown pockets are potential drift sources. Quarantine first." },
  { id: "grade_a",      label: "Grade A Tested Release",  emoji: "🏆", zone: "trusted",     reason: "Grade A release passed every gate. It belongs in trusted state." },
  { id: "roadmap_idea", label: "Roadmap Idea",            emoji: "🗺️", zone: "roadmap",     reason: "Not yet built. Good ideas live in the roadmap until they are verified." },
  { id: "theory_viz",   label: "Theory Visualization",    emoji: "🌌", zone: "roadmap",     reason: "Theory and visualization are valuable — but not trusted state. Roadmap/Demo." },
];

const ZONES = [
  { id: "trusted",   label: "Trusted",       icon: CheckCircle2, color: "#4ade80", desc: "Verified · Validated · Certified" },
  { id: "quarantine",label: "Quarantine",    icon: AlertTriangle,color: "#f87171", desc: "Hold · Inspect · Verify First" },
  { id: "roadmap",   label: "Roadmap / Demo",icon: Map,          color: "#60a5fa", desc: "Future · Theory · Not Yet Built" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function VerificationGame() {
  const [queue, setQueue] = useState(() => shuffle(ITEMS));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const [gradeA, setGradeA] = useState(false);
  const [history, setHistory] = useState([]);

  const item = queue[current];

  const choose = useCallback((zone) => {
    if (!item || feedback) return;
    const correct = zone === item.zone;
    const newStreak = correct ? streak + 1 : 0;
    const newScore = score + (correct ? 10 : 0);
    const newMax = Math.max(maxStreak, newStreak);
    const newGradeA = gradeA || (newStreak >= 3);

    setStreak(newStreak);
    setMaxStreak(newMax);
    setScore(newScore);
    setGradeA(newGradeA);
    setFeedback({ correct, reason: item.reason, zone: item.zone });
    setHistory(h => [...h, { item, correct, chosen: zone }]);

    setTimeout(() => {
      setFeedback(null);
      if (current + 1 >= queue.length) {
        setDone(true);
      } else {
        setCurrent(c => c + 1);
      }
    }, 2200);
  }, [item, streak, score, maxStreak, gradeA, feedback, current, queue]);

  const reset = () => {
    setQueue(shuffle(ITEMS));
    setCurrent(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setFeedback(null);
    setDone(false);
    setGradeA(false);
    setHistory([]);
  };

  return (
    <section className="py-16 px-4" style={{ background: "hsl(220,22%,4%)" }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-[9px] tracking-[4px] uppercase font-mono mb-2" style={{ color: "rgba(201,168,76,0.4)" }}>Mini Game</div>
          <h2 className="text-xl font-black font-cinzel" style={{ color: GOLD }}>Verification Gate</h2>
          <p className="text-xs text-muted-foreground mt-1">Can It Become Trusted? Sort each item into its correct zone.</p>
        </div>

        {/* Score bar */}
        <div className="flex gap-4 justify-center flex-wrap mb-6">
          {[
            { label: "Trust Score", val: score, color: GOLD },
            { label: "Streak", val: streak, color: "#4ade80" },
            { label: "Max Streak", val: maxStreak, color: "#60a5fa" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border px-4 py-2 text-center min-w-[80px]"
              style={{ background: "hsl(220,18%,7%)", borderColor: "rgba(201,168,76,0.15)" }}>
              <div className="text-lg font-black font-mono" style={{ color: s.color }}>{s.val}</div>
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </div>
          ))}
          {gradeA && (
            <div className="rounded-xl border px-4 py-2 text-center"
              style={{ background: "rgba(201,168,76,0.08)", borderColor: "rgba(201,168,76,0.35)" }}>
              <Trophy className="w-5 h-5 mx-auto" style={{ color: GOLD }} />
              <div className="text-[9px] uppercase tracking-wider" style={{ color: GOLD }}>Grade A!</div>
            </div>
          )}
        </div>

        {done ? (
          <div className="rounded-2xl border p-8 text-center space-y-4"
            style={{ background: "hsl(220,18%,7%)", borderColor: "rgba(74,222,128,0.3)" }}>
            <div className="text-2xl font-black font-cinzel" style={{ color: "#4ade80" }}>Gate Passed.</div>
            <p className="text-sm" style={{ color: GOLD }}>"You verified before trust."</p>
            <p className="text-xs text-muted-foreground">Final Score: <strong style={{ color: GOLD }}>{score}</strong> / {queue.length * 10}</p>
            <p className="text-xs text-muted-foreground">Best Streak: <strong style={{ color: "#4ade80" }}>{maxStreak}</strong></p>
            {gradeA && <p className="text-xs font-bold" style={{ color: GOLD }}>🏆 Grade A Unlock — Verification Mastered</p>}
            <Button onClick={reset} className="gap-2" style={{ background: `linear-gradient(135deg, ${GOLD}, #7a5010)`, color: "#080808" }}>
              <RotateCcw className="w-4 h-4" /> Play Again
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress */}
            <div className="text-center text-[10px] text-muted-foreground">
              Item {current + 1} of {queue.length}
            </div>
            <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(current / queue.length) * 100}%`, background: `linear-gradient(90deg, ${GOLD}, #4ade80)` }} />
            </div>

            {/* Item card */}
            {item && (
              <div className="rounded-2xl border p-6 text-center space-y-2"
                style={{ background: "hsl(220,18%,7%)", borderColor: "rgba(201,168,76,0.2)" }}>
                <div className="text-5xl">{item.emoji}</div>
                <div className="text-base font-black" style={{ color: GOLD }}>{item.label}</div>
                <div className="text-[10px] text-muted-foreground">Where does this belong?</div>
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div className="rounded-xl border px-4 py-3 text-center text-xs transition-all"
                style={{
                  background: feedback.correct ? "rgba(74,222,128,0.08)" : "rgba(239,68,68,0.08)",
                  borderColor: feedback.correct ? "rgba(74,222,128,0.3)" : "rgba(239,68,68,0.3)",
                  color: feedback.correct ? "#4ade80" : "#f87171",
                }}>
                <div className="font-bold mb-1">{feedback.correct ? "✓ Correct!" : "✗ Not quite."}</div>
                <div className="text-muted-foreground">{feedback.reason}</div>
                {!feedback.correct && (
                  <div className="mt-1 text-[10px]">Correct zone: <strong style={{ color: GOLD }}>{ZONES.find(z => z.id === feedback.zone)?.label}</strong></div>
                )}
              </div>
            )}

            {/* Zone buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ZONES.map(zone => {
                const Icon = zone.icon;
                return (
                  <button key={zone.id} onClick={() => choose(zone.id)} disabled={!!feedback}
                    className="rounded-xl border p-4 text-center space-y-2 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: `${zone.color}08`, borderColor: `${zone.color}30` }}>
                    <Icon className="w-5 h-5 mx-auto" style={{ color: zone.color }} />
                    <div className="text-xs font-black" style={{ color: zone.color }}>{zone.label}</div>
                    <div className="text-[9px] text-muted-foreground">{zone.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}