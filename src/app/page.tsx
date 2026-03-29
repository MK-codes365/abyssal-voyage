"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";


import HeroSection from "@/components/sections/HeroSection";
import DiveIntro from "@/components/sections/DiveIntro";
import Section from "@/components/sections/Section";
import DepthMeter from "@/components/sections/DepthMeter";
import ZoneIndicator from "@/components/sections/ZoneIndicator";
import ResurfaceFooter from "@/components/sections/ResurfaceFooter";

import CustomCursor from "@/components/effects/CustomCursor";

import SoundManager from "@/components/effects/SoundManager";
import PressureOverlay from "@/components/effects/PressureOverlay";
import LoadingScreen from "@/components/layout/LoadingScreen";

// Zone data with colors and facts
const ZONES = [
  {
    id: "epipelagic",
    depth: "0m – 200m",
    title: "The Sunlight Zone",
    color: "#00d4aa",
    facts: [
      { label: "Temperature", value: "20°C – 25°C" },
      { label: "Pressure", value: "1 – 20 atm" },
      { label: "Notable Species", value: "Coral reefs, dolphins, tuna" },
    ],
    videoSrc: "/sunlight.mp4",
    text: "Here, life is fueled by the sun. Vibrant coral reefs and dancing schools of fish populate these warm, shallow waters. Photosynthesis drives the entire food web. Ninety percent of all marine life inhabits this thin, luminous layer.",
  },
  {
    id: "mesopelagic",
    depth: "200m – 1,000m",
    title: "The Twilight Zone",
    color: "#4f46e5",
    facts: [
      { label: "Temperature", value: "5°C – 20°C" },
      { label: "Pressure", value: "20 – 100 atm" },
      { label: "Notable Species", value: "Jellyfish, hatchetfish, squid" },
    ],
    videoSrc: "/twilight.mp4",
    text: "Daylight fades into a spectrum of indigo. The pressure mounts and temperatures plummet. Bioluminescent jellyfish begin their spectral migrations — living lanterns in an ocean of perpetual dusk. Here, creatures make their own light to survive.",
  },
  {
    id: "bathypelagic",
    depth: "1,000m – 4,000m",
    title: "The Midnight Zone",
    color: "#1e1b4b",
    facts: [
      { label: "Temperature", value: "2°C – 4°C" },
      { label: "Pressure", value: "100 – 400 atm" },
      { label: "Notable Species", value: "Anglerfish, giant squid" },
    ],
    videoSrc: "/midnight.mp4",
    text: "No trace of sunlight reaches these depths. The only illumination comes from the residents themselves — ghostly anglerfish with their flickering lures, prowling through absolute darkness. Pressure here would crush a human instantly.",
  },
  {
    id: "abyssopelagic",
    depth: "4,000m – 6,000m",
    title: "The Abyssal Zone",
    color: "#06b6d4",
    facts: [
      { label: "Temperature", value: "1°C – 2°C" },
      { label: "Pressure", value: "400 – 600 atm" },
      { label: "Notable Species", value: "Sea cucumbers, deep-sea worms" },
    ],
    videoSrc: "/abyssal.mp4",
    text: "A vast, silent graveyard. The water is near freezing, and the pressure is crushing. Sustenance arrives as \"marine snow\" — a slow, constant rain of organic matter from the worlds above. Life here is patient, ancient, and strange.",
  },
  {
    id: "hadalpelagic",
    depth: "6,000m – 11,000m",
    title: "The Hadal Zone",
    color: "#dc2626",
    facts: [
      { label: "Temperature", value: "1°C – 4°C" },
      { label: "Pressure", value: "600 – 1,100 atm" },
      { label: "Notable Species", value: "Snailfish, amphipods" },
    ],
    videoSrc: "/hadal.mp4",
    text: "Named after Hades, king of the underworld. In these deepest gashes in the Earth's crust, life exists against impossible odds. The Mariana Trench plunges 11,034 meters — deeper than Everest is tall. Yet even here, life persists.",
  },
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showDiveIntro, setShowDiveIntro] = useState(false);
  const [hasDived, setHasDived] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    setIsMounted(true);
  }, []);

  // Set up scroll animations only after dive intro completes
  useEffect(() => {
    if (!hasDived || !containerRef.current) return;

    // Small delay to let the DOM settle after intro unmounts
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();

      const sections = containerRef.current?.querySelectorAll("section[id]:not(#hero)");
      if (!sections) return;

      sections.forEach((section) => {
        const heading = section.querySelector("h2");
        const body = section.querySelector("div.max-w-xl");
        const depthLabel =
          section.querySelector("[data-depth-label]") ||
          section.querySelector(".flex.items-center.gap-4");

        if (heading) {
          gsap.fromTo(
            heading,
            { y: 80, opacity: 0, filter: "blur(10px)" },
            {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              duration: 1.5,
              ease: "expo.out",
              scrollTrigger: {
                trigger: section,
                start: "top 75%",
                end: "top 30%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        if (body) {
          gsap.fromTo(
            body,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.2,
              delay: 0.2,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: "top 65%",
                end: "top 25%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        if (depthLabel) {
          gsap.fromTo(
            depthLabel,
            { x: -30, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: "top 70%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      });
    }, 300);

    return () => {
      clearTimeout(timeout);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [hasDived]);

  const handleDiveClick = () => {
    setShowDiveIntro(true);
  };

  const handleIntroComplete = () => {
    setShowDiveIntro(false);
    setHasDived(true);

    // Scroll to first zone after intro
    setTimeout(() => {
      const firstZone = document.getElementById("epipelagic");
      if (firstZone) {
        firstZone.scrollIntoView({ behavior: "smooth" });
      }
    }, 200);
  };

  if (!isMounted) return <div className="min-h-screen bg-[#000a1a]" />;

  return (
    <>
      {/* Loading Screen */}
      <LoadingScreen />

      {/* Dive Intro — full-screen video takeover */}
      {showDiveIntro && <DiveIntro onComplete={handleIntroComplete} />}

      <main ref={containerRef} className="relative bg-[#000a1a] select-none">
        {/* Fixed Background Layers */ /* Removed 3D Canvas & Overlays to ensure pure 60fps video performance */}
        <CustomCursor />

        {/* Fixed UI — only show after dive */}
        {hasDived && (
          <>
            <DepthMeter />
            <ZoneIndicator />
            <SoundManager />
            <PressureOverlay />
          </>
        )}

        {/* Scrollable Content */}
        <div 
          className="relative z-10 origin-center will-change-transform transform-gpu"
          style={{
            transform: `skewY(var(--scroll-skew, 0deg)) scaleY(var(--scroll-scale, 1))`,
            filter: `blur(var(--scroll-blur, 0px))`,
            transition: "transform 0.1s ease-out, filter 0.1s ease-out",
          }}
        >
          {/* Hero */}
          {!hasDived && <HeroSection onDive={handleDiveClick} />}

          {/* Ocean Zones */}
          {ZONES.map((zone) => (
            <Section
              key={zone.id}
              id={zone.id}
              depth={zone.depth}
              title={zone.title}
              zoneColor={zone.color}
              facts={zone.facts}
              videoSrc={zone.videoSrc}
            >
              <p>{zone.text}</p>
            </Section>
          ))}

          {/* Resurface Footer */}
          <ResurfaceFooter />
        </div>
      </main>
    </>
  );
}
