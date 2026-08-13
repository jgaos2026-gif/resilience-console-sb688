import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Shield, Radio, Lock, Layers, Activity, Cpu, BookOpen } from "lucide-react";
import { CrownIcon, LionIcon } from "@/components/sb688/WarriorCrest";

const GOLD = "#C9A84C";
const TEXT = "#E8D9B0";
const DIM  = "rgba(232,217,176,0.55)";
const BG   = "#050608";
const CARD = "rgba(12,11,8,0.95)";

function Section({ icon: Icon, color, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: CARD, borderColor: open ? color + "40" : "rgba(201,168,76,0.12)" }}>
      <button className="w-full flex items-center justify-between px-6 py-4 text-left" onClick={() => setOpen(v => !v)}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: color + "15", border: `1px solid ${color}30` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <span className="text-sm font-bold" style={{ color: open ? color : TEXT }}>{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4" style={{ color: DIM }} /> : <ChevronDown className="w-4 h-4" style={{ color: DIM }} />}
      </button>
      {open && (
        <div className="px-6 pb-6 space-y-4">
          <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${color}25,transparent)` }} />
          {children}
        </div>
      )}
    </div>
  );
}

function MathBox({ label, formula, plain }) {
  return (
    <div className="rounded-xl border p-4 space-y-2" style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(201,168,76,0.15)" }}>
      <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "rgba(201,168,76,0.5)" }}>{label}</div>
      <div className="font-mono text-sm font-bold" style={{ color: GOLD }}>{formula}</div>
      <div className="text-xs leading-relaxed" style={{ color: DIM }}>{plain}</div>
    </div>
  );
}

function Step({ n, title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs"
        style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", color: GOLD }}>{n}</div>
      <div>
        <div className="text-sm font-bold mb-1" style={{ color: TEXT }}>{title}</div>
        <div className="text-xs leading-relaxed" style={{ color: DIM }}>{desc}</div>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <div className="min-h-screen font-inter" style={{ background: BG, color: TEXT }}>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b"
        style={{ background: "#07080A", borderColor: "rgba(201,168,76,0.2)", boxShadow: "0 2px 24px rgba(0,0,0,0.8)" }}>
        <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} />
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: 28 }}>
              <CrownIcon size={16} color={GOLD} />
              <LionIcon size={20} color={GOLD} />
            </div>
            <div className="w-px h-8" style={{ background: "linear-gradient(180deg,transparent,rgba(201,168,76,0.45),transparent)" }} />
            <div>
              <div className="text-xs font-bold tracking-widest font-cinzel" style={{ color: GOLD }}>SB688 — How It Works</div>
              <div className="text-[9px] tracking-widest uppercase" style={{ color: "rgba(201,168,76,0.45)" }}>Plain English · Math · Operation Guide</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/sb688" className="text-[10px] px-3 py-1.5 rounded border font-semibold transition-all"
              style={{ color: GOLD, borderColor: "rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.06)" }}>
              ← SB688 Console
            </Link>
            <Link to="/" className="text-[10px] px-3 py-1.5 rounded border font-semibold transition-all"
              style={{ color: "rgba(201,168,76,0.5)", borderColor: "rgba(201,168,76,0.15)" }}>
              Main Console
            </Link>
          </div>
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.2),transparent)" }} />
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center gap-2">
            <CrownIcon size={44} color={GOLD} />
            <LionIcon size={52} color={GOLD} />
          </div>
          <h1 className="text-3xl font-bold font-cinzel" style={{ color: GOLD }}>How SB688 Works</h1>
          <p className="text-sm leading-relaxed max-w-2xl mx-auto" style={{ color: DIM }}>
            No jargon. No gatekeeping. This page explains exactly what SB688 does, how to operate it, and why the math behind it matters — in plain English anyone can follow.
          </p>
        </div>

        {/* The Big Idea */}
        <div className="rounded-2xl border p-6 space-y-3" style={{ background: "rgba(201,168,76,0.04)", borderColor: "rgba(201,168,76,0.2)" }}>
          <h2 className="text-base font-bold" style={{ color: GOLD }}>The Big Idea — In One Sentence</h2>
          <p className="text-sm leading-relaxed" style={{ color: TEXT }}>
            SB688 is a self-healing system that begins its heal sequence automatically at <strong style={{ color: GOLD }}>99.8% integrity</strong>. At <strong style={{ color: GOLD }}>99.9% degradation</strong> — right before total collapse — it releases a <strong style={{ color: GOLD }}>Formate Node</strong> that scans and captures the full system state, then the system completes its controlled death and rebuilds itself to <strong style={{ color: GOLD }}>100% with zero data loss</strong>. All without specialized hardware.
          </p>
          <p className="text-xs leading-relaxed" style={{ color: DIM }}>
            Think of it like a building that senses it's about to fall. At 99.8% damage it starts reinforcing itself. At 99.9% — a single instant before collapse — it sends out a scout that photographs every room, every wall, every brick. Then it falls intentionally, controlled, and rebuilds from those photographs perfectly. Nothing is lost. Nothing is forgotten.
          </p>
        </div>

        {/* Section 1 — Brick Stitch */}
        <Section icon={Layers} color="#C9A84C" title="1. The Brick Stitch — Why It Doesn't Collapse" defaultOpen={true}>
          <p className="text-sm leading-relaxed" style={{ color: DIM }}>
            Traditional systems stack their parts directly on top of each other — like a column of coins. Knock one coin out and the whole column falls. SB688 uses a <strong style={{ color: GOLD }}>Brick Stitch pattern</strong>: every brick is offset by half a brick width, exactly like real brickwork on a wall.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MathBox
              label="Load Distribution Rule"
              formula="1 node → 2 support nodes"
              plain="Every node in the system is supported by two nodes beneath it. If one support fails, the other absorbs the full load — no crash."
            />
            <MathBox
              label="Failure Tolerance"
              formula="38% node loss = system still alive"
              plain="You can lose more than a third of the entire system before anything collapses. Traditional columnar stacks fail at just 7% loss."
            />
            <MathBox
              label="Infrastructure Cost"
              formula="150% overhead (not 300%)"
              plain="Normal triple-mirroring costs 3× your base infrastructure. Brick Stitch costs only 1.5× — half the price for more resilience."
            />
            <MathBox
              label="Failure Mode"
              formula="Graceful degradation, not cascade"
              plain="Instead of one failure causing a chain reaction, each failure is absorbed locally. The system slows down — it does not fall down."
            />
          </div>
        </Section>

        {/* Section 2 — The Spine */}
        <Section icon={Cpu} color="#3b82f6" title="2. The Spine — Brain and Stem">
          <p className="text-sm leading-relaxed" style={{ color: DIM }}>
            The Spine is the backbone of the system. It has two parts: the <strong style={{ color: "#3b82f6" }}>Brain</strong> (core logic) and the <strong style={{ color: "#a78bfa" }}>Stem</strong> (the connector that holds modular bricks).
          </p>
          <div className="space-y-3">
            <div className="rounded-xl border p-4 space-y-2" style={{ borderColor: "rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.04)" }}>
              <div className="text-sm font-bold" style={{ color: "#3b82f6" }}>The Brain</div>
              <p className="text-xs leading-relaxed" style={{ color: DIM }}>
                Wrapped in 4 layers of cryptographic protection (HMAC signatures, SHA3-256 hash rings, Merkle boundaries, and a zero-trust perimeter). Nothing gets in or out without passing all four checks. It's like a bank vault with four separate locks — you need all four keys.
              </p>
            </div>
            <div className="rounded-xl border p-4 space-y-2" style={{ borderColor: "rgba(167,139,250,0.2)", background: "rgba(167,139,250,0.04)" }}>
              <div className="text-sm font-bold" style={{ color: "#a78bfa" }}>The Stem</div>
              <p className="text-xs leading-relaxed" style={{ color: DIM }}>
                The Stem is rigid but accepts "bricks" that snap on and off without shutting the system down (hot-swapping). Each brick needs a verified <strong style={{ color: "#a78bfa" }}>Clip-ID</strong> — like a badge scan before a door opens. No badge, no entry, no resources.
              </p>
              <MathBox
                label="The 45-Minute Temporal Hold"
                formula="Stem holds state for 45 min even if Brain = offline"
                plain="If the Brain shuts down for a stress test or emergency, the Stem keeps holding the last known good state for 45 minutes. Nothing is lost. The Brain comes back online and picks up exactly where it left off."
              />
            </div>
          </div>
        </Section>

        {/* Section 3 — Truth Nodes */}
        <Section icon={Shield} color="#22c55e" title="3. Truth Nodes — The Lie Detector">
          <p className="text-sm leading-relaxed" style={{ color: DIM }}>
            Truth Nodes are like referees. Every piece of logic that runs through the system gets checked against the <strong style={{ color: "#22c55e" }}>Sovereign Truth</strong> — the last confirmed, signed, correct state of the system. If anything drifts from that truth, the Truth Node calls it out immediately.
          </p>
          <div className="space-y-3">
            {[
              { name: "Truth-α (Consensus Anchor)", desc: "Holds the master copy of what the system is supposed to look like. Everything gets compared to this." },
              { name: "Truth-β (Hallucination Guard)", desc: "Specifically watches for AI logic drift — when an AI model starts producing outputs that don't match reality. Catches it before it spreads." },
              { name: "Truth-γ (Break-Heal Trigger)", desc: "When a planned 'system suicide' stress test happens, Truth-γ is the one that says 'this was planned, start healing now.' Without it, the system wouldn't know the difference between a real crash and a test." },
              { name: "Truth-δ (Sovereign Validator)", desc: "Final sign-off. Every heal, every recovery, every ledger update must pass Truth-δ before it's sealed as official." },
            ].map((tn, i) => (
              <div key={i} className="rounded-xl border p-3 space-y-1" style={{ borderColor: "rgba(34,197,94,0.15)", background: "rgba(34,197,94,0.03)" }}>
                <div className="text-xs font-bold" style={{ color: "#22c55e" }}>{tn.name}</div>
                <p className="text-xs leading-relaxed" style={{ color: DIM }}>{tn.desc}</p>
              </div>
            ))}
          </div>
          <MathBox
            label="Consensus Formula"
            formula="Valid = (Runtime State) ∩ (Golden Directive) ≠ ∅"
            plain="A logic stream is only valid if its output overlaps with the approved golden directive. If there's no overlap — it's rejected and a break-heal reset fires automatically."
          />
        </Section>

        {/* Section 4 — Ghost Nodes + Formate Node */}
        <Section icon={Radio} color="#a78bfa" title="4. Ghost Nodes & The Formate Node — The Silent Guards">
          <p className="text-sm leading-relaxed" style={{ color: DIM }}>
            Ghost Nodes are decoys placed at the edges of the system. They look exactly like real nodes from the outside, but they have <strong style={{ color: "#a78bfa" }}>no write access</strong> to any trusted data. If a hacker, a bad probe, or a faulty signal hits the system, it hits a Ghost Node first.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "What happens to the probe", val: "Ghost absorbs it. Logs it. Flags it for the operator." },
              { label: "What happens to the core", val: "Nothing. The core never sees the probe at all." },
              { label: "What happens to trusted state", val: "Zero change. Ghost nodes cannot write to the ledger." },
              { label: "What the operator sees", val: "A telemetry alert with the probe's fingerprint — full attribution." },
            ].map((r, i) => (
              <div key={i} className="rounded-xl border p-3" style={{ borderColor: "rgba(167,139,250,0.15)", background: "rgba(167,139,250,0.04)" }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: "#a78bfa" }}>{r.label}</div>
                <div className="text-xs leading-relaxed" style={{ color: DIM }}>{r.val}</div>
              </div>
            ))}
          </div>

          {/* Formate Node */}
          <div className="rounded-xl border p-5 space-y-3 mt-2" style={{ borderColor: "rgba(201,168,76,0.35)", background: "rgba(201,168,76,0.04)" }}>
            <div className="text-sm font-bold" style={{ color: GOLD }}>The Formate Node — Released at 99.9%</div>
            <p className="text-xs leading-relaxed" style={{ color: DIM }}>
              The Formate Node is a special emergency node that the system releases at the <strong style={{ color: GOLD }}>exact moment integrity hits 99.9%</strong> — one step before total collapse. It is not a passive observer. It is an active scanner that captures a complete snapshot of the system's entire state in that final instant.
            </p>
            <div className="space-y-2">
              {[
                { step: "99.8%", color: "#f59e0b", title: "Heal Sequence Begins", desc: "The system detects degradation at 99.8% and immediately begins its self-heal protocol — rerouting, reinforcing, and preparing a recovery path." },
                { step: "99.9%", color: "#ef4444", title: "Formate Node Released", desc: "One step before total collapse, the Formate Node is ejected from the Stem. It scans the entire system — every node, every stitch, every ledger entry — and carries that snapshot safely outside the dying system." },
                { step: "100%", color: "#ef4444", title: "Controlled System Death", desc: "The system completes its controlled collapse. Nothing unsafe is committed. The ledger does not advance. The Formate Node holds the last clean state." },
                { step: "REBUILD", color: "#22c55e", title: "Rebuild to 100% — Zero Data Loss", desc: "Using the Formate Node's snapshot, the system rebuilds every component to its exact pre-death state. The ledger advances once — only after every node passes verification. Data loss: 0.0000%." },
              ].map((s, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="flex-shrink-0 text-[9px] font-bold font-mono px-2 py-1 rounded"
                    style={{ background: s.color + "12", color: s.color, border: `1px solid ${s.color}30`, minWidth: 58, textAlign: "center" }}>
                    {s.step}
                  </div>
                  <div>
                    <div className="text-xs font-bold" style={{ color: s.color }}>{s.title}</div>
                    <div className="text-xs leading-relaxed" style={{ color: DIM }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg px-3 py-2 text-[10px] font-mono" style={{ background: "rgba(0,0,0,0.4)", color: GOLD, border: "1px solid rgba(201,168,76,0.15)" }}>
              Heal threshold: 99.8% → Formate release: 99.9% → Rebuild: 100% · Data loss: 0.0000%
            </div>
          </div>
        </Section>

        {/* Section 5 — The Ledger */}
        <Section icon={Lock} color="#f59e0b" title="5. The Immutable Ledger — The Receipt">
          <p className="text-sm leading-relaxed" style={{ color: DIM }}>
            Every verified action in the system is written to a ledger that <strong style={{ color: "#f59e0b" }}>cannot be edited, deleted, or overwritten</strong>. It only grows — one entry at a time, always forward. Think of it as a permanent paper receipt that prints automatically every time something important happens.
          </p>
          <MathBox
            label="Ledger Integrity Rule"
            formula="Entry(n+1) = Hash( Entry(n) + Event )"
            plain="Each new entry in the ledger includes a cryptographic fingerprint of the entry before it. Change anything in the past and every entry after it becomes invalid — immediately detectable."
          />
          <p className="text-xs leading-relaxed" style={{ color: DIM }}>
            This means you can always prove: <strong style={{ color: "#f59e0b" }}>what happened, when it happened, and that nobody changed the record afterward.</strong> Courts, auditors, and regulators can verify it independently.
          </p>
        </Section>

        {/* Section 6 — How to Operate It */}
        <Section icon={Activity} color="#C9A84C" title="6. How to Operate the System — Step by Step">
          <p className="text-sm leading-relaxed" style={{ color: DIM }}>
            You don't need to understand all the math to run the system. Here's what each control does in plain English.
          </p>
          <div className="space-y-4">
            <Step n={1} title="Select Your Industry"
              desc="The system adapts its language, components, and scenarios to your sector — healthcare, defense, finance, energy, etc. This changes the labels and examples but not the underlying architecture." />
            <Step n={2} title="Load a Scenario"
              desc="Pick a problem — a driver failure, a storage corruption, a hacker intrusion. Loading it sets up the system in a realistic broken state so you can see how it responds." />
            <Step n={3} title="Simulate the Problem"
              desc="Hit Simulate. The system intentionally breaks one or more components. You'll see the topology map show which nodes are affected and watch the system begin rerouting around the damage." />
            <Step n={4} title="Watch the Recovery"
              desc="The system detects the failure, reroutes traffic through healthy nodes, and begins the heal sequence. Ghost Nodes absorb any probes. Truth Nodes verify the recovery is legitimate." />
            <Step n={5} title="Run Recovery"
              desc="Hit Recover. The system pulls the last trusted checkpoint from the ledger and restores all affected components to their last known good state. The ledger records the recovery." />
            <Step n={6} title="Run Proof Suite"
              desc="Hit Run Proof. The system runs 7 automated tests and shows you pass/fail results with explanations. This is your verifiable evidence that the recovery worked correctly." />
            <Step n={7} title="Program Bricks (Sovereign Terminal)"
              desc='Open the Sovereign Terminal and type commands like "program encryption brick onto the stem." The AI understands the system architecture and will snap the brick on with a verified Clip-ID.' />
            <Step n={8} title="Commit a Checkpoint"
              desc="After a clean recovery, commit a checkpoint. This seals the current healthy state into the ledger as the new reference point for all future recoveries." />
          </div>
        </Section>

        {/* Section 7 — The Math Summary */}
        <Section icon={BookOpen} color="#3b82f6" title="7. The Math — All of It, Simply">
          <p className="text-sm leading-relaxed" style={{ color: DIM }}>
            You don't need a PhD. Here's every key number and formula in plain English.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { formula: "Heal begins at 99.8% degradation", plain: "The moment integrity drops to 99.8%, self-heal fires automatically — no human needed." },
              { formula: "Formate Node released at 99.9%", plain: "One instant before collapse, a scanner node captures the full system state and holds it safely." },
              { formula: "0.0000% data loss on rebuild", plain: "Rebuild from the Formate snapshot restores every node to its exact pre-death state. Nothing is lost." },
              { formula: "38% node loss tolerance", plain: "Lose more than a third of your system — it still runs. Braid geometry absorbs the load." },
              { formula: "150% overhead (not 300%)", plain: "Half the cost of traditional triple-mirroring. More resilience, lower price." },
              { formula: "1:2 node support ratio", plain: "Each node is held up by two neighbors — load redistributes automatically on failure." },
              { formula: "45-minute temporal hold", plain: "Stem keeps state alive for 45 minutes without the Brain. Brain rejoins with zero loss." },
              { formula: "SHA3-256 hash per ledger entry", plain: "Every record is cryptographically fingerprinted — tampering is instantly detectable." },
              { formula: "4-layer Brain casing", plain: "Four independent security checks before anything touches the core logic." },
              { formula: "7/7 proof suite tests", plain: "Seven automated verifications confirm every recovery is legitimate." },
            ].map((m, i) => (
              <div key={i} className="rounded-xl border p-3 space-y-1" style={{ borderColor: "rgba(59,130,246,0.15)", background: "rgba(59,130,246,0.03)" }}>
                <div className="text-xs font-bold font-mono" style={{ color: "#3b82f6" }}>{m.formula}</div>
                <div className="text-xs leading-relaxed" style={{ color: DIM }}>{m.plain}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Final quote */}
        <div className="rounded-2xl border p-8 text-center space-y-4"
          style={{ background: "rgba(201,168,76,0.03)", borderColor: "rgba(201,168,76,0.2)" }}>
          <div className="flex flex-col items-center gap-1">
            <CrownIcon size={28} color="rgba(201,168,76,0.6)" />
            <LionIcon size={34} color="rgba(201,168,76,0.6)" />
          </div>
          <blockquote className="text-base font-cinzel italic leading-relaxed" style={{ color: GOLD }}>
            "Don't ever let anyone tell you that you can't,<br />when you know damn well you can."
          </blockquote>
          <p className="text-[10px]" style={{ color: "rgba(201,168,76,0.4)" }}>— John E. Arenz · JGA Enterprise · BSS-2026-ARCH-01</p>
        </div>

        {/* Nav footer */}
        <div className="flex items-center justify-center gap-4 pb-6 flex-wrap">
          <Link to="/sb688" className="px-5 py-2.5 rounded-lg border text-xs font-bold transition-all"
            style={{ background: "rgba(201,168,76,0.06)", color: GOLD, borderColor: "rgba(201,168,76,0.3)" }}>
            ← SB688 Console
          </Link>
          <Link to="/observe" className="px-5 py-2.5 rounded-lg border text-xs font-semibold transition-all"
            style={{ background: "rgba(34,197,94,0.04)", color: "#86efac", borderColor: "rgba(34,197,94,0.2)" }}>
            Watch Live Demos →
          </Link>
          <Link to="/jga-story" className="px-5 py-2.5 rounded-lg border text-xs font-semibold transition-all"
            style={{ color: "rgba(201,168,76,0.55)", borderColor: "rgba(201,168,76,0.15)" }}>
            JGA Story →
          </Link>
        </div>
      </main>
    </div>
  );
}