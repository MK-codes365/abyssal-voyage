"use client";

import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [depthCounter, setDepthCounter] = useState(11000);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Counter animation: 11000 → 0
    const startTime = Date.now();
    const duration = 2200;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Eased countdown
      const eased = 1 - Math.pow(1 - progress, 3);
      setDepthCounter(Math.round(11000 * (1 - eased)));

      if (progress >= 1) {
        clearInterval(interval);
        // Start fade out
        setFadeOut(true);
        setTimeout(() => setIsLoading(false), 800);
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  if (!isLoading) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#000a1a] transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Sonar rings */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border border-[var(--zone-epipelagic)]"
            style={{
              animation: `sonar-ping 2s ease-out ${i * 0.6}s infinite`,
              opacity: 0,
            }}
          />
        ))}

        {/* Sonar sweep line */}
        <div
          className="absolute w-full h-full"
          style={{ animation: "sonar-line 2s linear infinite" }}
        >
          <div
            className="absolute top-1/2 left-1/2 w-1/2 h-px origin-left"
            style={{
              background:
                "linear-gradient(90deg, var(--zone-epipelagic) 0%, transparent 100%)",
              opacity: 0.6,
            }}
          />
        </div>

        {/* Center dot */}
        <div
          className="w-2 h-2 rounded-full bg-[var(--zone-epipelagic)]"
          style={{ boxShadow: "0 0 12px var(--zone-epipelagic)" }}
        />
      </div>

      {/* Depth counter */}
      <div className="mt-10 flex flex-col items-center gap-2">
        <span
          className="text-5xl md:text-7xl font-bold text-white/90 tabular-nums tracking-tighter"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {depthCounter.toLocaleString()}
        </span>
        <span
          className="text-xs text-white/30 tracking-[0.3em] uppercase"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          meters to surface
        </span>
      </div>

      {/* Loading text */}
      <div className="mt-8">
        <span
          className="text-[10px] text-white/20 tracking-[0.4em] uppercase animate-pulse"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Initializing descent
        </span>
      </div>
    </div>
  );
}
