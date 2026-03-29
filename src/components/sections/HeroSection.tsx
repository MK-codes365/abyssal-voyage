"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface HeroSectionProps {
  onDive: () => void;
}

export default function HeroSection({ onDive }: HeroSectionProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const topNavRef = useRef<HTMLDivElement>(null);
  const leftDetailsRef = useRef<HTMLDivElement>(null);
  const bottomRefs = useRef<HTMLDivElement>(null);
  const title1Ref = useRef<HTMLHeadingElement>(null);
  const title2Ref = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [askingDive, setAskingDive] = useState(false);

  useEffect(() => {
    if (hasPlayed) return;

    const timeline = gsap.timeline({ delay: 0.3 });

    // UI elements fade in
    timeline.fromTo(
      [topNavRef.current, leftDetailsRef.current, bottomRefs.current],
      { opacity: 0 },
      { opacity: 1, duration: 1.5, ease: "power2.out" }
    );

    // Title 1 (Outline) rises
    timeline.fromTo(
      title1Ref.current,
      { y: 40, opacity: 0, filter: "blur(8px)" },
      { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.2, ease: "expo.out" },
      "-=1.0"
    );

    // Title 2 (Solid) rises
    timeline.fromTo(
      title2Ref.current,
      { y: 40, opacity: 0, filter: "blur(8px)" },
      { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.2, ease: "expo.out" },
      "-=1.0"
    );

    // Subtitle & CTA fade in
    timeline.fromTo(
      [subtitleRef.current, ctaRef.current],
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power2.out", stagger: 0.2 },
      "-=0.6"
    );

    setHasPlayed(true);
  }, [hasPlayed]);

  const handleDive = () => {
    // Fade out entire hero
    const tl = gsap.timeline({
      onComplete: () => onDive(),
    });

    tl.to(heroRef.current?.children || [], {
      opacity: 0,
      scale: 1.05,
      filter: "blur(10px)",
      duration: 1,
      ease: "power2.inOut",
      stagger: 0.05,
    });
  };

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden font-sans"
    >
      {/* Full-screen video background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ willChange: "auto" }}
        >
          <source src="/background.mp4" type="video/mp4" />
        </video>

        {/* Cinematic dark overlay */}
        <div className="absolute inset-0 bg-[#000a1a]/40" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,10,26,0.3) 0%, transparent 40%, transparent 60%, rgba(0,10,26,0.8) 100%)",
          }}
        />
      </div>

      {/* Top Nav */}
      <div ref={topNavRef} className="absolute top-8 left-8 right-8 z-20 flex justify-between items-start opacity-0">
        {/* Real Logo from public folder */}
        <div className="h-16 md:h-24 flex items-center relative z-50">
          <img 
            src="/logo.png" 
            alt="Abyssal Voyage Logo" 
            className="h-full w-auto object-contain opacity-90 sepia-[0.3] hue-rotate-180 brightness-150" 
          />
        </div>

        {/* Language */}
        <div className="text-[10px] sm:text-xs text-white uppercase tracking-widest font-mono cursor-pointer flex items-center gap-1">
          EN
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Left Data Overlay */}
      <div
        ref={leftDetailsRef}
        className="hidden md:flex absolute top-40 left-8 z-20 flex-col gap-1.5 text-[9px] text-white/80 font-mono tracking-[0.2em] uppercase opacity-0"
      >
        <p>{">"} DETAIL: CONNECTED</p>
        <p>{">"} LOCATION: MARIANA TRENCH</p>
        <p>{">"} COORDINATES: 11.349° N / 142.199° E</p>
      </div>

      {/* Bottom Corner Icons */}
      <div ref={bottomRefs} className="absolute bottom-8 left-8 right-8 z-20 flex justify-between items-end opacity-0 pointer-events-none">
        {/* Bottom Left Radar widget */}
        <div className="w-10 h-10 border border-white/20 flex items-center justify-center relative overflow-hidden bg-white/5">
          {/* Target reticle crosshairs */}
          <div className="absolute w-full h-[1px] bg-white/20" />
          <div className="absolute h-full w-[1px] bg-white/20" />
          {/* Center dot */}
          <div className="absolute w-1 h-1 rounded-full bg-white/50" />
          {/* Rotating radar line */}
          <div 
            className="absolute w-1/2 h-[1px] top-1/2 left-0 origin-right"
            style={{ 
              background: "linear-gradient(90deg, transparent, var(--zone-epipelagic))",
              animation: 'sonar-line 3s linear infinite' 
            }}
          />
        </div>

        {/* Bottom Right text & cross */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-[8px] text-right font-mono tracking-[0.25em] uppercase text-white/60 leading-[1.6]">
            <p>ABYSSAL VOYAGE INITIATIVE</p>
            <p>ALL RIGHTS RESERVED</p>
            <p>COPYRIGHT 2026</p>
          </div>
          <div className="w-10 h-10 border border-white/20 flex items-center justify-center relative bg-white/5 overflow-hidden">
            {/* Static center status LED */}
            <div className="absolute w-1.5 h-1.5 rounded-full bg-[var(--zone-epipelagic)] shadow-[0_0_10px_var(--zone-epipelagic)]" />
            
            {/* Emitting sonar ping ring */}
            <div 
               className="w-full h-full rounded-full border border-[var(--zone-epipelagic)]"
               style={{ animation: 'sonar-ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}
             />
          </div>
        </div>
      </div>

      {/* Center Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full mt-10 md:mt-20 px-4">
        <div className="flex flex-col items-center leading-none select-none text-center">
          <h1
            ref={title1Ref}
            className="text-5xl sm:text-7xl md:text-[6rem] lg:text-[8rem] font-light tracking-[0.05em] uppercase"
            style={{
              color: "transparent",
              WebkitTextStroke: "1px rgba(255,255,255,0.9)",
              fontFamily: "var(--font-serif)",
            }}
          >
            THE ABYSSAL
          </h1>
          <h1
            ref={title2Ref}
            className="text-6xl sm:text-8xl md:text-[7rem] lg:text-[9.5rem] font-bold tracking-tight text-white uppercase -mt-2 md:-mt-6"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            VOYAGE
          </h1>
        </div>

        <p
          ref={subtitleRef}
          className="text-[9px] sm:text-[10px] md:text-xs text-white/70 font-mono tracking-[0.25em] uppercase mt-12 mb-6"
        >
          WE USE AUDIO TO ENHANCE YOUR EXPERIENCE.
        </p>

        <button
          ref={ctaRef}
          onClick={handleDive}
          className="relative px-8 py-4 group cursor-pointer"
        >
          {/* Target bracket corners */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/50 group-hover:border-white transition-colors duration-300" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/50 group-hover:border-white transition-colors duration-300" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/50 group-hover:border-white transition-colors duration-300" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/50 group-hover:border-white transition-colors duration-300" />

          <span className="text-[10px] md:text-[11px] font-bold text-white tracking-[0.3em] uppercase group-hover:text-[var(--zone-epipelagic)] transition-colors duration-300" style={{ fontFamily: "var(--font-mono)" }}>
            LET'S BEGIN
          </span>
        </button>
      </div>
    </section>
  );
}
