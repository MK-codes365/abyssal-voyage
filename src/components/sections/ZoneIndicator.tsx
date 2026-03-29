"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

const ZONES = [
  { id: "epipelagic", name: "Sunlight", color: "#00d4aa" },
  { id: "mesopelagic", name: "Twilight", color: "#4f46e5" },
  { id: "bathypelagic", name: "Midnight", color: "#1e1b4b" },
  { id: "abyssopelagic", name: "Abyss", color: "#06b6d4" },
  { id: "hadalpelagic", name: "Hadal", color: "#dc2626" },
];

export default function ZoneIndicator() {
  const [activeZone, setActiveZone] = useState(ZONES[0].id);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const triggers: ScrollTrigger[] = [];

    ZONES.forEach((zone) => {
      const trigger = ScrollTrigger.create({
        trigger: `#${zone.id}`,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          if (self.isActive) setActiveZone(zone.id);
        },
      });
      triggers.push(trigger);
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, []);

  const activeZoneData = ZONES.find((z) => z.id === activeZone);

  return (
    <div className="fixed left-6 md:left-8 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-5">
      {ZONES.map((zone) => {
        const isActive = activeZone === zone.id;
        return (
          <a
            key={zone.id}
            href={`#${zone.id}`}
            className={cn(
              "group flex items-center gap-3 transition-all duration-500",
              isActive ? "opacity-100" : "opacity-25 hover:opacity-60"
            )}
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById(zone.id);
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <div
              className="h-[2px] rounded-full transition-all duration-500"
              style={{
                width: isActive ? "40px" : "16px",
                backgroundColor: isActive ? zone.color : "white",
                boxShadow: isActive ? `0 0 8px ${zone.color}66` : "none",
              }}
            />
            <span
              className={cn(
                "text-[9px] tracking-[0.2em] uppercase transition-all duration-500",
                isActive
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-2 opacity-0 group-hover:opacity-80 group-hover:translate-x-0"
              )}
              style={{
                fontFamily: "var(--font-mono)",
                color: isActive ? zone.color : "white",
              }}
            >
              {zone.name}
            </span>
          </a>
        );
      })}
    </div>
  );
}
