"use client";

import { useState, useCallback } from "react";

export default function ResurfaceFooter() {
  const [bubbles, setBubbles] = useState<number[]>([]);

  const handleResurface = useCallback(() => {
    // Spawn rising bubbles
    const newBubbles = Array.from({ length: 15 }, (_, i) => Date.now() + i);
    setBubbles(newBubbles);

    // Scroll to top
    const heroEl = document.getElementById("hero");
    if (heroEl) {
      heroEl.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Clean bubbles after animation
    setTimeout(() => setBubbles([]), 2000);
  }, []);

  return (
    <footer className="relative min-h-[60vh] flex flex-col items-center justify-center gap-8 overflow-hidden">
      {/* Bubble animation on click */}
      {bubbles.map((id, i) => (
        <div
          key={id}
          className="fixed bottom-0 pointer-events-none z-40"
          style={{
            left: `${20 + Math.random() * 60}%`,
            animation: `bubble-rise ${1.5 + Math.random()}s ease-out forwards`,
            animationDelay: `${i * 0.08}s`,
          }}
        >
          <div
            className="rounded-full border border-white/20"
            style={{
              width: `${6 + Math.random() * 12}px`,
              height: `${6 + Math.random() * 12}px`,
            }}
          />
        </div>
      ))}

      {/* Message */}
      <div className="text-center space-y-4 px-6">
        <p
          className="text-sm text-white/20 tracking-[0.3em] uppercase"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          You&apos;ve reached the bottom
        </p>
        <h3
          className="text-3xl md:text-5xl font-light text-white/60"
          style={{
            fontFamily: "var(--font-serif)",
            textShadow: "0 0 40px rgba(220, 38, 38, 0.15)",
          }}
        >
          11,034 meters below the surface
        </h3>
      </div>

      {/* Resurface Button */}
      <button
        onClick={handleResurface}
        className="group relative mt-4 cursor-pointer"
      >
        <div
          className="relative px-10 py-4 rounded-full border border-white/20
          text-white/60 text-sm tracking-[0.25em] uppercase
          transition-all duration-500 
          hover:border-[var(--zone-epipelagic)] hover:text-[var(--zone-epipelagic)]
          hover:shadow-[0_0_30px_rgba(0,212,170,0.15)]
          backdrop-blur-sm"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span className="flex items-center gap-3">
            {/* Up arrow */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="transition-transform duration-300 group-hover:-translate-y-1"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            Resurface
          </span>
        </div>
      </button>

      {/* Credits */}
      <p
        className="mt-12 text-[10px] text-white/10 tracking-[0.2em] uppercase"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Abyssal Voyage — An Immersive Ocean Experience
      </p>
    </footer>
  );
}
