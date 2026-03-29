"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ZONE_COLORS = [
  "#00d4aa",
  "#4f46e5",
  "#1e1b4b",
  "#06b6d4",
  "#dc2626",
];

export default function DepthMeter() {
  const [depth, setDepth] = useState(0);
  const [zoneIndex, setZoneIndex] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const WAYPOINTS = [
      { p: 0, depth: 0, colorIndex: 0 },         // Epipelagic starts at Y=0
      { p: 0.2, depth: 200, colorIndex: 1 },     // Mesopelagic
      { p: 0.4, depth: 1000, colorIndex: 2 },    // Bathypelagic
      { p: 0.6, depth: 4000, colorIndex: 3 },    // Abyssopelagic
      { p: 0.8, depth: 6000, colorIndex: 4 },    // Hadalpelagic
      { p: 1.0, depth: 11000, colorIndex: 4 },   // Footer
    ];

    const getInterpolatedValues = (progress: number) => {
      for (let i = 0; i < WAYPOINTS.length - 1; i++) {
        const start = WAYPOINTS[i];
        const end = WAYPOINTS[i + 1];
        if (progress >= start.p && progress <= end.p) {
          const segmentProgress = (progress - start.p) / (end.p - start.p);
          // Ease the transition for a smoother readout
          const easedProgress = segmentProgress < 0.5
            ? 2 * segmentProgress * segmentProgress
            : 1 - Math.pow(-2 * segmentProgress + 2, 2) / 2;
            
          const currentDepth = start.depth + (end.depth - start.depth) * easedProgress;
          return { depth: Math.round(currentDepth), colorIndex: start.colorIndex };
        }
      }
      return { depth: 11000, colorIndex: 4 };
    };

    const trigger = ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const { depth, colorIndex } = getInterpolatedValues(self.progress);
        setDepth(depth);
        setZoneIndex(colorIndex);
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  const color = ZONE_COLORS[zoneIndex] || ZONE_COLORS[0];

  return (
    <div className="fixed top-6 right-6 md:top-8 md:right-8 z-50 flex flex-col items-end mix-blend-difference pointer-events-none">
      <div
        className="text-[9px] md:text-xs uppercase tracking-widest mb-1 transition-colors duration-700"
        style={{ fontFamily: "var(--font-mono)", color: `${color}88` }}
      >
        Current Depth
      </div>
      <div className="flex items-baseline gap-1 md:gap-2">
        <span
          className="text-2xl sm:text-4xl md:text-6xl font-bold text-white tracking-tighter tabular-nums transition-colors duration-700"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {depth.toLocaleString()}
        </span>
        <span
          className="text-base md:text-2xl font-medium transition-colors duration-700"
          style={{ color: `${color}99` }}
        >
          m
        </span>
      </div>
      <div className="w-20 md:w-32 h-0.5 md:h-1 bg-white/10 mt-2 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${(depth / 11000) * 100}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}
