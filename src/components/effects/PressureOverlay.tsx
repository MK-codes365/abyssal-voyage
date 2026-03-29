"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function PressureOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (overlayRef.current) {
      ScrollTrigger.create({
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          // Calculate extreme crushing pressure vignette based on strict scroll progress
          // Progress is 0.0 to 1.0 (Surface to Hadal zone)
          // Starts appearing prominently at 0.5 (Bathypelagic), nearly opaque black around edges at 1.0
          const pressure = Math.max(0, (self.progress - 0.4) * 1.8); 
          overlayRef.current!.style.opacity = Math.min(pressure, 0.98).toString();
        }
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.vars.trigger === "body" && t.vars.onUpdate?.toString().includes("pressure")) {
          t.kill();
        }
      });
    }
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[40] pointer-events-none opacity-0"
      style={{
        background: `radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.85) 85%, rgba(0,0,0,1) 100%)`,
        boxShadow: `inset 0 0 150px rgba(0,0,0,1)`
      }}
    />
  );
}
