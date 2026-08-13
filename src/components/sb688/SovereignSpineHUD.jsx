import React, { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Radio, Lock, CheckCircle2, Activity, Cpu, BatteryCharging, Network, Key, Plus } from "lucide-react";
import { CrownIcon, LionIcon } from "@/components/sb688/WarriorCrest";
import GovernanceReportGenerator from "@/components/sb688/GovernanceReportGenerator";

// ── 1211 Color Palette — Nuclear-Hardened Gold ────────────────────────────────
const GOLD    = "#FFD700";   // Sovereign Gold — Braid
const GOLD_DIM= "rgba(255,215,0,0.45)";
const GOLD_BG = "rgba(255,215,0,0.07)";
const RED     = "#FF0000";   // Impurity Red — corruption/wilt
const BLUE    = "#00F2FF";   // Ghost Blue — scan/activation
const BG      = "#000000";   // Abyssal Black
const CHASSIS = "#2C2C2C";   // Gunmetal Grey — brick chassis
const WHITE   = "#FFFFFF";

// ── Modular Programmable Bricks ───────────────────────────────────────────────
const BRICKS = [
  { id: "enc",    label: "Encryption Brick",    icon: Lock,          color: GOLD,  desc: "AES-512 layer stitched",        param: "encryption_level=512" },
  { id: "energy", label: "Energy-Saver Brick",  icon: BatteryCharging,color: "#22c55e", desc: "Power draw reduced 40%",   param: "power_mode=eco" },
  { id: "neural", label: "Neural-Bridge Brick", icon: Cpu,           color: BLUE,  desc: "AI-to-AI channel opened",       param: "neural_bridge=active" },
  { id: "net",    label: "Net-Hardened Brick",  icon: Network,       color: "#a78bfa", desc: "Zero-trust perimeter +1",   param: "net_hardening=max" },
  { id: "ghost2", label: "Ghost Sentinel Brick",icon: Radio,         color: BLUE,  desc: "Ghost Node #1 deployed",        param: "ghost_nodes=2" },
  { id: "pulse",  label: "Pulse Amplifier Brick",icon: Zap,          color: GOLD,  desc: "Resurrection speed ×2",         param: "pulse_amp=2x" },
];

// ── Immutable Ledger seed ─────────────────────────────────────────────────────
const SEED_LEDGER = [
  { id: 1, ts: "2026-04-27T00:00:00Z", event: "Day Zero — Mendota Node ACTIVATED",         hash: "a3f9d2c…e71" },
  { id: 2, ts: "2026-04-27T00:01:04Z", event: "Golden State Hash initialized — v1.0",      hash: "8b1fc04…a22" },
  { id: 3, ts: "2026-04-27T00:02:18Z", event: "Zero-Trust boundary sealed",                 hash: "ff3220b…d9e" },
  { id: 4, ts: "2026-04-27T00:03:51Z", event: "Triple-Braid geometry locked",              hash: "1a77e9c…b03" },
  { id: 5, ts: "2026-04-27T00:05:00Z", event: "Ghost Node #0 online at mesh boundary",     hash: "5c9d841…f18" },
  { id: 6, ts: "2026-04-27T00:06:22Z", event: "Sovereign Spine v1.0 — Production Ready",  hash: "0d2fa3e…c55" },
];

// ── Triple-Braid Canvas ───────────────────────────────────────────────────────
function TripleBraidCanvas({ integrity, killPhase, shaking, clippedBrick }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const tRef      = useRef(0);
  const pulseRef  = useRef(0); // brick clip pulse timer

  useEffect(() => {
    if (clippedBrick) pulseRef.current = 1.0;
  }, [clippedBrick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * (window.devicePixelRatio || 1);
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
    };
    resize();

    const corruption = Math.max(0, Math.min(1, (100 - integrity) / 100));

    function lerpColor(t) {
      // gold #FFD700 → red #FF0000
      const r1=0xFF,g1=0xD7,b1=0x00;
      const r2=0xFF,g2=0x00,b2=0x00;
      return `rgb(${Math.round(r1+(r2-r1)*t)},${Math.round(g1+(g2-g1)*t)},${Math.round(b1+(b2-b1)*t)})`;
    }

    const draw = () => {
      tRef.current += 0.018;
      const t = tRef.current;
      if (pulseRef.current > 0) pulseRef.current = Math.max(0, pulseRef.current - 0.025);

      const W = canvas.width, H = canvas.height;
      const cx = W/2, cy = H/2;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = BG;
      ctx.fillRect(0,0,W,H);

      // Blackout / beacon
      if (killPhase === "blackout") {
        animRef.current = requestAnimationFrame(draw); return;
      }
      if (killPhase === "beacon") {
        const pulse = 0.5 + 0.5*Math.sin(t*9);
        // Golden beacon pulse (1211 signal)
        const g = ctx.createRadialGradient(cx,cy,0,cx,cy,80*(0.7+pulse*0.3));
        g.addColorStop(0,   `rgba(255,215,0,${0.95*pulse})`);
        g.addColorStop(0.35,`rgba(255,215,0,${0.3*pulse})`);
        g.addColorStop(1,   "rgba(255,215,0,0)");
        ctx.beginPath(); ctx.arc(cx,cy,80*(0.7+pulse*0.3),0,Math.PI*2);
        ctx.fillStyle=g; ctx.fill();
        // KEY: 1211 text
        ctx.font=`bold ${W*0.055}px monospace`;
        ctx.textAlign="center"; ctx.fillStyle=`rgba(255,215,0,${pulse*0.9})`;
        ctx.fillText("1211",cx,cy+8);
        animRef.current = requestAnimationFrame(draw); return;
      }
      if (killPhase === "ghost_scan") {
        // Ghost blue scan
        const scanY = ((t*55) % (H+60))-30;
        const sg = ctx.createLinearGradient(0,scanY-22,0,scanY+22);
        sg.addColorStop(0,"rgba(0,242,255,0)");
        sg.addColorStop(0.5,"rgba(0,242,255,0.65)");
        sg.addColorStop(1,"rgba(0,242,255,0)");
        ctx.fillStyle=sg; ctx.fillRect(0,scanY-22,W,44);
        // Orb carrying Golden Snapshot
        const ox = cx+Math.sin(t*0.75)*cx*0.45;
        const oy = cy+Math.cos(t*0.5)*cy*0.28;
        const og = ctx.createRadialGradient(ox,oy,0,ox,oy,30);
        og.addColorStop(0,"rgba(0,242,255,0.92)"); og.addColorStop(1,"rgba(0,242,255,0)");
        ctx.beginPath(); ctx.arc(ox,oy,30,0,Math.PI*2); ctx.fillStyle=og; ctx.fill();
        // Golden snapshot dot inside orb
        ctx.beginPath(); ctx.arc(ox,oy,6,0,Math.PI*2);
        ctx.fillStyle=GOLD; ctx.fill();
        animRef.current = requestAnimationFrame(draw); return;
      }

      // Watermark
      ctx.save();
      ctx.font=`bold ${W*0.065}px serif`; ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.fillStyle="rgba(255,215,0,0.025)"; ctx.fillText("SB688",cx,cy);
      ctx.restore();

      const braidColor = lerpColor(corruption);
      const alpha = Math.max(0.25, integrity/100);
      const skipChance = corruption>0.5?(corruption-0.5)*1.9:0;
      const isResurrect = killPhase==="resurrect";
      const pulseBoost = pulseRef.current;

      for (let strand=0;strand<3;strand++) {
        const off = (strand*Math.PI*2)/3;
        ctx.beginPath();
        let started=false;
        for (let i=0;i<=320;i++) {
          if (skipChance>0 && Math.random()<skipChance*0.09) { started=false; continue; }
          const angle=(i/320)*Math.PI*8+t+off;
          const r=(Math.min(W,H)*0.32)+Math.sin(angle*0.5+t)*(Math.min(W,H)*0.055);
          const braid=Math.sin(angle*1.5+t*2+off)*(Math.min(W,H)*0.068);
          const x=cx+r*Math.cos(angle)-braid*Math.sin(angle);
          const y=cy+r*Math.sin(angle)+braid*Math.cos(angle);
          if (!started){ctx.moveTo(x,y);started=true;} else ctx.lineTo(x,y);
        }
        ctx.strokeStyle = pulseBoost>0.01 ? `rgba(255,215,0,${0.7+pulseBoost*0.3})` : braidColor;
        ctx.lineWidth   = isResurrect ? 3 : 2;
        ctx.globalAlpha = isResurrect ? 1 : alpha;
        ctx.shadowColor = pulseBoost>0.01 ? GOLD : braidColor;
        ctx.shadowBlur  = isResurrect ? 22 : pulseBoost>0.01 ? 28+pulseBoost*30 : integrity>70?12:4;
        ctx.stroke();
        ctx.globalAlpha=1; ctx.shadowBlur=0;
      }

      // Center node
      const ng = ctx.createRadialGradient(cx,cy,0,cx,cy,22);
      ng.addColorStop(0,`${braidColor}dd`); ng.addColorStop(1,`${braidColor}00`);
      ctx.beginPath(); ctx.arc(cx,cy,22,0,Math.PI*2);
      ctx.fillStyle=ng; ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [integrity, killPhase]);

  return (
    <canvas ref={canvasRef}
      style={{ width:"100%", height:"100%", display:"block",
        background: BG,
        transform: shaking ? `translate(${(Math.random()-0.5)*6}px,${(Math.random()-0.5)*4}px)` : "none",
        transition: shaking ? "none" : "transform 0.1s",
        borderRadius: 10 }} />
  );
}

// ── 1211 Auth Terminal ────────────────────────────────────────────────────────
function AuthTerminal({ onUnlock, unlocked }) {
  const [input, setInput] = useState("");
  const [error, setError]  = useState(false);
  const [glowing, setGlowing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { if (!unlocked) inputRef.current?.focus(); }, [unlocked]);

  const handleKey = (e) => {
    if (e.key === "Enter") {
      if (input === "1211") {
        setGlowing(true);
        onUnlock();
      } else {
        setError(true);
        setInput("");
        setTimeout(() => setError(false), 900);
      }
    }
  };

  if (unlocked) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(2px)" }}>
      <div className="rounded-xl p-7 space-y-4 text-center w-80"
        style={{
          background: CHASSIS,
          border: `2px solid ${error ? RED : glowing ? GOLD : "rgba(255,215,0,0.35)"}`,
          boxShadow: `0 0 ${error?24:glowing?40:16}px ${error?RED:GOLD}${error?"80":"30"}`,
          transition: "border-color 0.2s, box-shadow 0.2s"
        }}>
        <div className="flex items-center justify-center gap-2">
          <Key className="w-5 h-5" style={{ color: GOLD }} />
          <span className="text-xs font-bold tracking-widest uppercase font-mono" style={{ color: GOLD }}>
            ENTER OWNER KEY TO RECONFIG
          </span>
        </div>
        <div className="text-[9px] font-mono" style={{ color: "rgba(255,215,0,0.4)" }}>
          MASTER ARCHITECTURAL LAYER · ZERO-TRUST AUTH
        </div>
        <input
          ref={inputRef}
          type="password"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          maxLength={4}
          placeholder="····"
          className="w-full text-center text-2xl font-bold font-mono tracking-[0.5em] outline-none rounded-lg py-3 px-4"
          style={{
            background: "#111",
            border: `1px solid ${error ? RED : "rgba(255,215,0,0.25)"}`,
            color: error ? RED : GOLD,
            caretColor: GOLD,
            letterSpacing: "0.5em"
          }}
        />
        {error && (
          <div className="text-xs font-bold font-mono" style={{ color: RED }}>
            ✗ INVALID KEY — ACCESS DENIED
          </div>
        )}
        <div className="text-[8px] font-mono" style={{ color: "rgba(255,215,0,0.25)" }}>
          Press ENTER to authenticate
        </div>
      </div>
    </div>
  );
}

// ── Brick Slot (draggable) ────────────────────────────────────────────────────
function BrickSlot({ brick, clipped, onClip }) {
  const Icon = brick.icon;
  return (
    <button
      onClick={() => onClip(brick)}
      disabled={clipped}
      className="w-full text-left rounded-lg px-3 py-2.5 border transition-all space-y-1 group"
      style={{
        background: clipped ? `${brick.color}18` : CHASSIS,
        borderColor: clipped ? brick.color : "rgba(255,215,0,0.15)",
        opacity: clipped ? 1 : 0.85,
        cursor: clipped ? "default" : "pointer",
        boxShadow: clipped ? `0 0 12px ${brick.color}40` : "none",
      }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: brick.color }} />
          <span className="text-[10px] font-bold" style={{ color: clipped ? brick.color : "rgba(255,215,0,0.8)" }}>
            {brick.label}
          </span>
        </div>
        {clipped
          ? <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: brick.color }} />
          : <Plus className="w-3 h-3 flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: GOLD }} />}
      </div>
      {clipped && (
        <div className="text-[9px] font-mono" style={{ color: `${brick.color}aa` }}>
          ✓ STITCHED · {brick.desc}
        </div>
      )}
    </button>
  );
}

// ── Ghost Telemetry Panel ─────────────────────────────────────────────────────
function GhostTelemetry({ pulseCount, ghostActive, lastHeal, integrity, clippedBricks }) {
  const events = [
    { ts: "00:00:00", msg: "Ghost Node #0 · boundary ACTIVE",       type: "ok" },
    { ts: "00:01:04", msg: "Zero-Trust perimeter sealed",            type: "ok" },
    { ts: "00:02:18", msg: "Packet verification active",             type: "ok" },
    ...(pulseCount>0?[{ts:new Date().toLocaleTimeString(),msg:`⟁ 1211 Resurrection pulse #${pulseCount}`,type:"heal"}]:[]),
    ...(ghostActive ?[{ts:new Date().toLocaleTimeString(),msg:"◉ Ghost scan carrying Golden Snapshot",type:"scan"}]:[]),
    ...(lastHeal    ?[{ts:lastHeal,msg:"✓ INTEGRITY 100% · DATA LOSS 0.0000%",type:"ok"}]:[]),
    ...clippedBricks.map(b=>({ts:new Date().toLocaleTimeString(),msg:`⬡ ${b.label} STITCHED`,type:"heal"})),
  ];

  const intColor = integrity>70?"#22c55e":integrity>30?"#f59e0b":RED;

  return (
    <div className="flex flex-col h-full space-y-3 p-4 rounded-xl border overflow-hidden"
      style={{ background: "#0a0a0a", borderColor: "rgba(255,215,0,0.18)" }}>
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: GOLD }}>
          <Radio className="w-3.5 h-3.5" /> Ghost Telemetry
        </h3>
        <Badge className="text-[9px] border font-bold" style={{
          background: ghostActive?"rgba(0,242,255,0.1)":"rgba(34,197,94,0.08)",
          color: ghostActive?BLUE:"#22c55e",
          borderColor: ghostActive?"rgba(0,242,255,0.3)":"rgba(34,197,94,0.2)"
        }}>
          <span className="w-1.5 h-1.5 rounded-full inline-block mr-1 animate-pulse"
            style={{ background: ghostActive?BLUE:"#22c55e" }} />
          {ghostActive?"SCANNING":"MONITORING"}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label:"Ghost Node #0", value:"ACTIVE",         color:"#22c55e" },
          { label:"Pulse Count",   value:pulseCount,       color:GOLD },
          { label:"Data Loss",     value:"0.0000%",        color:"#22c55e" },
          { label:"Integrity",     value:`${integrity.toFixed(1)}%`, color:intColor },
        ].map((m,i)=>(
          <div key={i} className="rounded p-2 text-center"
            style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,215,0,0.08)" }}>
            <div className="text-sm font-bold font-mono" style={{ color:m.color }}>{m.value}</div>
            <div className="text-[8px] uppercase tracking-wider mt-0.5" style={{ color:"rgba(255,215,0,0.35)" }}>{m.label}</div>
          </div>
        ))}
      </div>
      <div className="flex-1 rounded p-2 space-y-1 overflow-y-auto font-mono"
        style={{ background:"rgba(0,0,0,0.6)", border:"1px solid rgba(255,215,0,0.06)" }}>
        {events.slice().reverse().map((e,i)=>(
          <div key={i} className="flex gap-2 text-[9px]">
            <span style={{ color:"rgba(255,215,0,0.25)", flexShrink:0 }}>{e.ts}</span>
            <span style={{ color:e.type==="heal"?GOLD:e.type==="scan"?BLUE:"rgba(255,215,0,0.55)" }}>{e.msg}</span>
          </div>
        ))}
      </div>
      <div className="space-y-1">
        {[{law:"Law #4",text:"Ghost absorbs — core unreachable"},{law:"Law #7",text:"Immutable · End of Drift"}].map((l,i)=>(
          <div key={i} className="flex items-center gap-2 text-[9px] px-2 py-1 rounded"
            style={{ background:"rgba(255,215,0,0.04)", border:"1px solid rgba(255,215,0,0.08)" }}>
            <Lock className="w-2.5 h-2.5" style={{ color:GOLD }} />
            <span className="font-bold" style={{ color:GOLD }}>{l.law}:</span>
            <span style={{ color:"rgba(255,215,0,0.5)" }}>{l.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Immutable Ledger Panel ────────────────────────────────────────────────────
function ImmutableLedger({ entries }) {
  const bottomRef = useRef(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[entries]);
  return (
    <div className="flex flex-col h-full space-y-3 p-4 rounded-xl border"
      style={{ background:"#0a0a0a", borderColor:"rgba(255,215,0,0.18)" }}>
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color:GOLD }}>
          <Lock className="w-3.5 h-3.5" /> Immutable Ledger
        </h3>
        <Badge className="text-[8px] border font-bold"
          style={{ background:"rgba(255,215,0,0.07)", color:GOLD, borderColor:"rgba(255,215,0,0.25)" }}>
          READ-ONLY · LAW #7
        </Badge>
      </div>
      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {entries.map(entry=>(
          <div key={entry.id} className="rounded p-2 border"
            style={{ background:"rgba(255,215,0,0.03)", borderColor:"rgba(255,215,0,0.1)" }}>
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="text-[8px] font-bold font-mono" style={{ color:GOLD }}>#{entry.id}</span>
              <span className="text-[7px] font-mono" style={{ color:"rgba(255,215,0,0.25)" }}>{entry.hash}</span>
              <Lock className="w-2 h-2" style={{ color:"rgba(255,215,0,0.3)" }} />
            </div>
            <p className="text-[9px] font-semibold leading-tight" style={{ color:"rgba(255,215,0,0.85)" }}>{entry.event}</p>
            <p className="text-[7px] font-mono mt-0.5" style={{ color:"rgba(255,215,0,0.25)" }}>{entry.ts}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="text-[7px] text-center font-mono" style={{ color:"rgba(255,215,0,0.25)" }}>
        ∅ No edits · No deletions · No overrides
      </div>
    </div>
  );
}

// ── Kill Overlay ──────────────────────────────────────────────────────────────
function KillOverlay({ killPhase, healTime }) {
  if (!killPhase || killPhase==="idle") return null;
  if (killPhase==="complete") return (
    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl z-20 pointer-events-none"
      style={{ background:"rgba(0,0,0,0.88)" }}>
      <CheckCircle2 className="w-14 h-14 mb-3" style={{ color:GOLD, filter:`drop-shadow(0 0 18px ${GOLD})` }} />
      <div className="text-2xl font-bold font-mono mb-1" style={{ color:GOLD, textShadow:`0 0 24px ${GOLD}` }}>
        SYSTEM RESURRECTED.
      </div>
      <div className="text-base font-bold font-mono" style={{ color:GOLD }}>
        OWNER 1211 RE-STITCH COMPLETE.
      </div>
      <div className="mt-3 space-y-0.5 text-center">
        <div className="text-sm font-mono" style={{ color:"#22c55e" }}>INTEGRITY: 100%</div>
        <div className="text-sm font-mono" style={{ color:"rgba(34,197,94,0.7)" }}>DATA LOSS: 0.0000%</div>
        <div className="text-sm font-mono" style={{ color:GOLD }}>TIME TO HEAL: {healTime}s</div>
      </div>
    </div>
  );
  const msgs = {
    blackout:   {text:"INTEGRITY: 0.1% · TOTAL COLLAPSE",        color:RED,   sub:"Braid shattered. Core offline."},
    beacon:     {text:"⬟ 1211 BEACON — GOLDEN PULSE IN THE VOID",color:GOLD,  sub:"Ghost Node #0 carrying Golden Snapshot…"},
    ghost_scan: {text:"◉ GHOST NODE SCANNING",                   color:BLUE,  sub:"Carrying Golden Snapshot to Spine…"},
    resurrect:  {text:"⟁ 1211 RE-STITCH IN PROGRESS",           color:GOLD,  sub:"Triple-Braid reforming at 2× speed…"},
  };
  const m = msgs[killPhase]; if(!m) return null;
  return (
    <div className="absolute inset-x-0 bottom-4 flex justify-center z-20 pointer-events-none">
      <div className="rounded-lg px-5 py-2.5 text-center"
        style={{ background:"rgba(0,0,0,0.92)", border:`1px solid ${m.color}50`,
          boxShadow:`0 0 20px ${m.color}30` }}>
        <div className="text-sm font-bold font-mono" style={{ color:m.color }}>{m.text}</div>
        <div className="text-[10px] mt-0.5 font-mono" style={{ color:`${m.color}70` }}>{m.sub}</div>
      </div>
    </div>
  );
}

// ── Integrity Ticker ──────────────────────────────────────────────────────────
function IntegrityTicker({ integrity }) {
  const color = integrity>70?"#22c55e":integrity>30?"#f59e0b":RED;
  const label = integrity>90?"GOLDEN STATE":integrity>50?"DEGRADED":integrity>10?"CRITICAL":"NEAR ZERO";
  return (
    <div className="text-center space-y-1.5">
      <div className="text-[8px] uppercase tracking-widest font-mono" style={{ color:"rgba(255,215,0,0.4)" }}>System Integrity</div>
      <div className="text-5xl font-bold font-mono tabular-nums" style={{ color, textShadow:`0 0 22px ${color}70` }}>
        {integrity.toFixed(1)}%
      </div>
      <Badge className="text-[9px] border font-bold px-3 py-0.5"
        style={{ background:`${color}12`, color, borderColor:`${color}45` }}>{label}</Badge>
      <div className="w-full h-2 rounded-full overflow-hidden"
        style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.04)" }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width:`${integrity}%`, background:`linear-gradient(90deg,${color},${color}bb)`,
            boxShadow:`0 0 10px ${color}80` }} />
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function SovereignSpineHUD() {
  const [integrity, setIntegrity]       = useState(100);
  const [killPhase, setKillPhase]       = useState("idle");
  const [pulseCount, setPulseCount]     = useState(0);
  const [ghostActive, setGhostActive]   = useState(false);
  const [lastHeal, setLastHeal]         = useState(null);
  const [healTime, setHealTime]         = useState(0);
  const [ledger, setLedger]             = useState(SEED_LEDGER);
  const [running, setRunning]           = useState(false);
  const [unlocked, setUnlocked]         = useState(false);
  const [showAuth, setShowAuth]         = useState(false);
  const [clippedBricks, setClippedBricks] = useState([]);
  const [shaking, setShaking]           = useState(false);
  const [borderGlow, setBorderGlow]     = useState(false);
  const [clippedBrick, setClippedBrick] = useState(null); // last clipped for pulse
  const wiltRef = useRef(null);
  const killRef = useRef([]);

  const appendLedger = useCallback((event) => {
    setLedger(prev => [...prev, {
      id:   prev.length+1,
      ts:   new Date().toISOString(),
      event,
      hash: Math.random().toString(36).slice(2,8)+"…"+Math.random().toString(36).slice(2,5),
    }]);
  }, []);

  const handleUnlock = useCallback(() => {
    setUnlocked(true);
    setShowAuth(false);
    setBorderGlow(true);
    appendLedger("⚡ 1211 KEY ACCEPTED — Master Architectural Layer UNLOCKED");
    // If running corruption, force heal
    if (running) {
      clearTimeout(wiltRef.current);
      killRef.current.forEach(clearTimeout);
      setIntegrity(100); setKillPhase("idle"); setGhostActive(false); setRunning(false);
      appendLedger("⚡ 1211 Override — Forced Heal executed by Orchestrator");
      setLastHeal(new Date().toLocaleTimeString());
    }
  }, [running, appendLedger]);

  const handleClipBrick = useCallback((brick) => {
    if (!unlocked || clippedBricks.find(b=>b.id===brick.id)) return;
    // Screen shake
    setShaking(true);
    setTimeout(()=>setShaking(false), 320);
    setClippedBrick(brick);
    setTimeout(()=>setClippedBrick(null), 1200);
    setClippedBricks(prev=>[...prev, brick]);
    appendLedger(`⬡ ${brick.label} CLIPPED — param: ${brick.param} — STITCHED into Spine`);
  }, [unlocked, clippedBricks, appendLedger]);

  // Corruption cycle
  const runCorruptionCycle = useCallback(() => {
    if (running) return;
    setRunning(true); setKillPhase("idle");
    appendLedger("Corruption cycle initiated — integrity ticker live");
    let val=100;
    const step=()=>{
      val -= 1.5+Math.random()*1.5;
      if (val<=0.2) val=0.2;
      setIntegrity(parseFloat(val.toFixed(1)));
      if (val>0.2){ wiltRef.current=setTimeout(step,110); }
      else {
        appendLedger("Auto-Heal triggered — 99.8% threshold reached");
        setTimeout(()=>{
          setIntegrity(100); setKillPhase("idle");
          setLastHeal(new Date().toLocaleTimeString());
          appendLedger("✓ Auto-Heal complete — Golden State restored");
          setRunning(false);
        },600);
      }
    };
    wiltRef.current=setTimeout(step,180);
  }, [running, appendLedger]);

  const triggerManualHeal = useCallback(() => {
    clearTimeout(wiltRef.current); killRef.current.forEach(clearTimeout);
    setKillPhase("idle"); setGhostActive(false); setIntegrity(100);
    setLastHeal(new Date().toLocaleTimeString());
    appendLedger("⚡ Manual Override — Orchestrator triggered heal");
    setRunning(false);
  }, [appendLedger]);

  // Kill sequence
  const runKillSequence = useCallback(() => {
    if (running) return;
    setRunning(true); setKillPhase("idle");
    appendLedger("KILL SEQUENCE — 99.9% death protocol initiated");
    let val=100;
    const drop=()=>{
      val-=5;
      if (val<=0.1){
        setIntegrity(0.1); setKillPhase("blackout");
        appendLedger("⬛ Total collapse — 0.1% · Braid shattered");
        const t0=Date.now();
        const t1=setTimeout(()=>{ setKillPhase("beacon"); appendLedger("⬟ 1211 Beacon — Golden pulse in the void"); },1300);
        const t2=setTimeout(()=>{ setKillPhase("ghost_scan"); setGhostActive(true); appendLedger("◉ Ghost Node carrying Golden Snapshot — scanning"); },2600);
        const t3=setTimeout(()=>{ setKillPhase("resurrect"); setIntegrity(100); setPulseCount(p=>p+1); appendLedger("⟁ 1211 Re-Stitch — Triple-Braid reforming"); },3900);
        const t4=setTimeout(()=>{
          const elapsed=((Date.now()-t0)/1000).toFixed(1);
          setKillPhase("complete"); setGhostActive(false);
          setHealTime(elapsed); setLastHeal(new Date().toLocaleTimeString());
          appendLedger(`✓ SYSTEM RESURRECTED · INTEGRITY 100% · DATA LOSS 0.0000% · HEAL ${elapsed}s`);
          setRunning(false);
        },5800);
        killRef.current=[t1,t2,t3,t4]; return;
      }
      setIntegrity(parseFloat(val.toFixed(1)));
      wiltRef.current=setTimeout(drop,55);
    };
    wiltRef.current=setTimeout(drop,80);
  }, [running, appendLedger]);

  const resetAll = useCallback(() => {
    clearTimeout(wiltRef.current); killRef.current.forEach(clearTimeout);
    setIntegrity(100); setKillPhase("idle"); setGhostActive(false);
    setRunning(false); setUnlocked(false); setBorderGlow(false); setShowAuth(false);
    setClippedBricks([]); setClippedBrick(null);
    appendLedger("Factory reset — Golden State re-established");
  }, [appendLedger]);

  const handleBraidClick = useCallback(()=>{
    if (killPhase==="complete"){ setKillPhase("idle"); }
  },[killPhase]);

  return (
    <div className="space-y-0 font-inter"
      style={{
        background: BG, color: "rgba(255,215,0,0.88)", minHeight:"100vh",
        border: borderGlow ? `2px solid ${GOLD}` : "2px solid transparent",
        boxShadow: borderGlow ? `0 0 40px ${GOLD}25, inset 0 0 60px rgba(255,215,0,0.03)` : "none",
        transition: "border-color 0.4s, box-shadow 0.4s",
        borderRadius: 12,
      }}>

      {/* ── TOP HEADER ── */}
      <div className="flex items-center justify-between px-5 py-3 flex-wrap gap-3"
        style={{ background:"#0a0a0a", borderBottom:`1px solid rgba(255,215,0,0.2)`,
          boxShadow:`0 1px 0 rgba(255,215,0,0.15), 0 4px 20px rgba(0,0,0,0.8)` }}>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center flex-shrink-0">
            <CrownIcon size={20} color={GOLD} />
            <LionIcon  size={24} color={GOLD} />
          </div>
          <div className="w-px h-9" style={{ background:`linear-gradient(180deg,transparent,${GOLD}55,transparent)` }} />
          <div>
            <h2 className="text-sm font-bold tracking-widest font-cinzel leading-tight" style={{ color:GOLD, textShadow:`0 0 18px ${GOLD}50` }}>
              JGA ENTERPRISE | SB688 COMMAND
            </h2>
            <p className="text-[8px] tracking-widest uppercase mt-0.5" style={{ color:"rgba(255,215,0,0.4)" }}>
              Sovereign Spine v1.0 · Nuclear-Hardened · Mendota Revolution · John E. Arenz
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="text-[9px] border font-bold" style={{ background:"rgba(255,215,0,0.08)", color:GOLD, borderColor:"rgba(255,215,0,0.3)" }}>v1.0 PRODUCTION</Badge>
          <Badge className="text-[9px] border font-bold flex items-center gap-1" style={{ background:"rgba(34,197,94,0.08)", color:"#22c55e", borderColor:"rgba(34,197,94,0.25)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block bg-green-400" />
            MENDOTA NODE: ACTIVE
          </Badge>
          <Badge className="text-[9px] border font-bold" style={{ background:unlocked?"rgba(255,215,0,0.12)":"rgba(255,0,0,0.07)", color:unlocked?GOLD:"#ef4444", borderColor:unlocked?"rgba(255,215,0,0.35)":"rgba(255,0,0,0.2)" }}>
            AUTH: {unlocked?"ORCHESTRATOR — 1211":"LOCKED"}
          </Badge>
        </div>
      </div>

      {/* ── CONTROLS BAR ── */}
      <div className="flex items-center gap-2 px-5 py-3 flex-wrap"
        style={{ background:"#080808", borderBottom:`1px solid rgba(255,215,0,0.1)` }}>
        <span className="text-[9px] font-bold uppercase tracking-widest mr-2" style={{ color:"rgba(255,215,0,0.45)" }}>
          ORCHESTRATOR:
        </span>
        <Button onClick={runCorruptionCycle} disabled={running} size="sm"
          className="text-[10px] font-bold h-7 px-3"
          style={{ background:"rgba(255,0,0,0.12)", color:RED, border:`1px solid rgba(255,0,0,0.3)` }}>
          <Activity className="w-3 h-3 mr-1" /> Demo 1 — Corruption Cycle
        </Button>
        <Button onClick={runKillSequence} disabled={running} size="sm"
          className="text-[10px] font-bold h-7 px-3"
          style={{ background:"rgba(139,92,246,0.1)", color:"#a78bfa", border:`1px solid rgba(139,92,246,0.25)` }}>
          <Radio className="w-3 h-3 mr-1" /> Demo 2 — Kill Sequence (99.9%)
        </Button>
        <Button onClick={triggerManualHeal} disabled={!running} size="sm"
          className="text-[10px] font-bold h-7 px-3"
          style={{ background:`rgba(255,215,0,0.1)`, color:GOLD, border:`1px solid rgba(255,215,0,0.3)` }}>
          <Zap className="w-3 h-3 mr-1" /> Force Heal
        </Button>
        <Button onClick={()=>setShowAuth(true)} size="sm"
          className="text-[10px] font-bold h-7 px-3"
          style={{ background: unlocked?"rgba(255,215,0,0.15)":"rgba(255,215,0,0.07)", color:GOLD, border:`1px solid ${unlocked?"rgba(255,215,0,0.45)":"rgba(255,215,0,0.2)"}`,
            boxShadow: unlocked?`0 0 12px ${GOLD}30`:"none" }}>
          <Key className="w-3 h-3 mr-1" />
          {unlocked?"1211 UNLOCKED":"Enter 1211 Key"}
        </Button>
        <Button onClick={resetAll} size="sm" variant="outline"
          className="text-[10px] h-7 px-3 border-border text-muted-foreground ml-auto">
          <Shield className="w-3 h-3 mr-1" /> Reset
        </Button>
      </div>

      {/* ── MAIN 3-PANE HUD ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-0" style={{ minHeight: 560 }}>

        {/* LEFT — Immutable Ledger */}
        <div className="xl:col-span-3 p-3" style={{ borderRight:`1px solid rgba(255,215,0,0.1)` }}>
          <ImmutableLedger entries={ledger} />
        </div>

        {/* CENTER — Braid + Integrity */}
        <div className="xl:col-span-6 flex flex-col gap-3 p-3"
          style={{ borderRight:`1px solid rgba(255,215,0,0.1)` }}>
          {/* Integrity ticker */}
          <div className="rounded-xl border p-4"
            style={{ background:"#0a0a0a", borderColor:"rgba(255,215,0,0.18)" }}>
            <IntegrityTicker integrity={integrity} />
          </div>
          {/* Braid canvas */}
          <div className="relative flex-1 rounded-xl overflow-hidden"
            style={{ minHeight:300, cursor:"pointer",
              border:`1px solid ${integrity<30?"rgba(255,0,0,0.4)":integrity<70?"rgba(255,100,0,0.25)":"rgba(255,215,0,0.18)"}`,
              boxShadow: integrity>90?`0 0 20px rgba(255,215,0,0.08)`:"none" }}
            onClick={handleBraidClick}>
            <TripleBraidCanvas integrity={integrity} killPhase={killPhase} shaking={shaking} clippedBrick={clippedBrick} />
            <KillOverlay killPhase={killPhase} healTime={healTime} />
            {/* Auth terminal overlay */}
            {showAuth && <AuthTerminal onUnlock={handleUnlock} unlocked={unlocked} />}
            {killPhase==="idle" && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
                <span className="text-[8px] font-mono px-2 py-0.5 rounded"
                  style={{ background:"rgba(0,0,0,0.8)", color:"rgba(255,215,0,0.35)", border:"1px solid rgba(255,215,0,0.1)" }}>
                  Möbius Triple-Braid · JGA Enterprise · {unlocked?"1211 ACTIVE":"LOCKED"}
                </span>
              </div>
            )}
          </div>

          {/* 1211 Brick Panel (only visible when unlocked) */}
          {unlocked && (
            <div className="rounded-xl border p-3 space-y-2"
              style={{ background:"#0a0a0a", borderColor:GOLD_DIM, boxShadow:`0 0 20px ${GOLD}15` }}>
              <div className="flex items-center gap-2">
                <Key className="w-3.5 h-3.5" style={{ color:GOLD }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color:GOLD }}>
                  1211 Modular Clipping Protocol — Snap Bricks to Braid
                </span>
                <Badge className="text-[8px] border ml-auto" style={{ background:GOLD_BG, color:GOLD, borderColor:GOLD_DIM }}>
                  MASTER LAYER ACTIVE
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {BRICKS.map(brick=>(
                  <BrickSlot key={brick.id} brick={brick}
                    clipped={!!clippedBricks.find(b=>b.id===brick.id)}
                    onClip={handleClipBrick} />
                ))}
              </div>
              <p className="text-[8px] font-mono" style={{ color:"rgba(255,215,0,0.3)" }}>
                Click any Brick to CLIP it to the Spine. No reboots. Live DNA shift. The Braid pulses Gold to confirm.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT — Ghost Telemetry + Report Generator */}
        <div className="xl:col-span-3 p-3 flex flex-col gap-3">
          <GhostTelemetry
            pulseCount={pulseCount}
            ghostActive={ghostActive}
            lastHeal={lastHeal}
            integrity={integrity}
            clippedBricks={clippedBricks}
          />
          <GovernanceReportGenerator
            ledger={ledger}
            clippedBricks={clippedBricks}
            pulseCount={pulseCount}
            lastHeal={lastHeal}
            integrity={integrity}
          />
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-2.5"
        style={{ background:"#0a0a0a", borderTop:`1px solid rgba(255,215,0,0.15)` }}>
        <div className="flex items-center gap-3 flex-wrap text-[8px] font-mono" style={{ color:"rgba(255,215,0,0.5)" }}>
          <span>NODE: MENDOTA-IL</span>
          <span style={{ color:"rgba(255,215,0,0.2)" }}>|</span>
          <span>AUTH: {unlocked?"ORCHESTRATOR":"PENDING"}</span>
          <span style={{ color:"rgba(255,215,0,0.2)" }}>|</span>
          <span>KEY: {unlocked?"1211":"----"}</span>
          <span style={{ color:"rgba(255,215,0,0.2)" }}>|</span>
          <span>Day Zero: April 27, 2026</span>
          <span style={{ color:"rgba(255,215,0,0.2)" }}>|</span>
          <span>Architecture: John E. Arenz — JGA Enterprise</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {clippedBricks.length>0 && (
            <Badge className="text-[8px] border font-bold"
              style={{ background:GOLD_BG, color:GOLD, borderColor:GOLD_DIM }}>
              {clippedBricks.length} BRICK{clippedBricks.length>1?"S":""} STITCHED
            </Badge>
          )}
          <Badge className="text-[8px] border"
            style={{ background:"rgba(255,0,0,0.05)", color:"rgba(255,100,100,0.55)", borderColor:"rgba(255,0,0,0.1)" }}>
            Strongest Tech on the Planet · AI-to-AI Orchestrated
          </Badge>
        </div>
      </div>
    </div>
  );
}