import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import ArcadeHero from "@/components/arcade/ArcadeHero";
import SystemMap from "@/components/arcade/SystemMap";
import VerificationGame from "@/components/arcade/VerificationGame";
import BraidBuilder from "@/components/arcade/BraidBuilder";
import SeedSimulator from "@/components/arcade/SeedSimulator";
import OldEquipmentSection from "@/components/arcade/OldEquipmentSection";
import JGAFundingLane from "@/components/arcade/JGAFundingLane";

const GOLD = "#C9A84C";

export default function DemoArcade() {
  const sections = useRef({});

  const scrollTo = (id) => {
    sections.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-inter overflow-x-hidden">
      {/* Animated top border */}
      <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${GOLD}, #fff8dc, ${GOLD}, transparent)` }} />

      <ArcadeHero onNav={scrollTo} />

      <div ref={el => sections.current["system-map"] = el}>
        <SystemMap />
      </div>

      <div ref={el => sections.current["verification-game"] = el}>
        <VerificationGame />
      </div>

      <div ref={el => sections.current["braid-builder"] = el}>
        <BraidBuilder />
      </div>

      <div ref={el => sections.current["seed-sim"] = el}>
        <SeedSimulator />
      </div>

      <OldEquipmentSection />
      <JGAFundingLane />

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center space-y-2"
        style={{ background: "hsl(220,22%,4%)" }}>
        <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${GOLD}55,transparent)`, marginBottom: 16 }} />
        <p className="text-xs italic font-cinzel" style={{ color: GOLD }}>
          "Elegance with Consequences."
        </p>
        <p className="text-[9px] text-muted-foreground">
          JGA Enterprises · Jay's Graphic Arts LLC · John E. Arenz · Mendota, IL · © {new Date().getFullYear()}
        </p>
        <p className="text-[8px] text-muted-foreground/40 max-w-2xl mx-auto px-4">
          Proof over promises. Working concepts, demo concepts, and theory visualizations are clearly labeled. No physics claims are made. Braided Topology visualizations are metaphors for system architecture, not proven physics.
        </p>
        <Link to="/" className="inline-block mt-2 text-[10px] px-4 py-1.5 rounded-lg border font-bold"
          style={{ color: GOLD, borderColor: "rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.06)" }}>
          ← Back to Demo Council
        </Link>
      </footer>
    </div>
  );
}