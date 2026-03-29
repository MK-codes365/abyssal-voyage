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
  const contentRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const scanlineRef = useRef<HTMLDivElement>(null);
  const [hasPlayed, setHasPlayed] = useState(false);

  // 3D Mouse Parallax for Hero
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const deltaX = (x - centerX) / centerX;
    const deltaY = (y - centerY) / centerY;

    // Content tilts towards cursor
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        rotateX: deltaY * -4,
        rotateY: deltaX * 4,
        x: deltaX * -12,
        y: deltaY * -12,
        duration: 0.8,
        ease: "power2.out",
        transformPerspective: 1200,
      });
    }

    // Video background tilts opposite for depth
    if (videoWrapperRef.current) {
      gsap.to(videoWrapperRef.current, {
        rotateX: deltaY * 2,
        rotateY: deltaX * -2,
        x: deltaX * 20,
        y: deltaY * 20,
        duration: 1.5,
        ease: "power2.out",
        transformPerspective: 1200,
      });
    }
  };

  const handleMouseLeave = () => {
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        rotateX: 0, rotateY: 0, x: 0, y: 0,
        duration: 2, ease: "power2.out",
      });
    }
    if (videoWrapperRef.current) {
      gsap.to(videoWrapperRef.current, {
        rotateX: 0, rotateY: 0, x: 0, y: 0,
        duration: 2.5, ease: "power2.out",
      });
    }
  };

  useEffect(() => {
    if (hasPlayed) return;

    const timeline = gsap.timeline({ delay: 0.3 });

    // UI elements fade in
    timeline.fromTo(
      [topNavRef.current, leftDetailsRef.current, bottomRefs.current],
      { opacity: 0 },
      { opacity: 1, duration: 1.5, ease: "power2.out" }
    );

    // Title 1 (Outline) rises with 3D rotation
    timeline.fromTo(
      title1Ref.current,
      { y: 60, opacity: 0, filter: "blur(12px)", rotateX: 20 },
      { y: 0, opacity: 1, filter: "blur(0px)", rotateX: 0, duration: 1.4, ease: "expo.out" },
      "-=1.0"
    );

    // Title 2 (Solid) rises with 3D rotation
    timeline.fromTo(
      title2Ref.current,
      { y: 60, opacity: 0, filter: "blur(12px)", rotateX: 20 },
      { y: 0, opacity: 1, filter: "blur(0px)", rotateX: 0, duration: 1.4, ease: "expo.out" },
      "-=1.0"
    );

    // Subtitle & CTA fade in
    timeline.fromTo(
      [subtitleRef.current, ctaRef.current],
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power2.out", stagger: 0.2 },
      "-=0.6"
    );

    // Continuous floating scan line animation
    if (scanlineRef.current) {
      gsap.to(scanlineRef.current, {
        top: "100%",
        duration: 6,
        ease: "none",
        repeat: -1,
        yoyo: true,
      });
    }

    setHasPlayed(true);
  }, [hasPlayed]);

  const handleDive = () => {
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
      style={{ perspective: "1200px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Full-screen video background with 3D parallax */}
      <div
        ref={videoWrapperRef}
        className="absolute inset-0 z-0 scale-[1.15]"
        style={{ willChange: "transform" }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
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

      {/* Animated scan line that sweeps vertically */}
      <div
        ref={scanlineRef}
        className="absolute left-0 right-0 h-px z-30 pointer-events-none"
        style={{
          top: "0%",
          background: "linear-gradient(90deg, transparent, rgba(0,212,170,0.4), transparent)",
          boxShadow: "0 0 20px rgba(0,212,170,0.3), 0 0 60px rgba(0,212,170,0.1)",
        }}
      />

      {/* Floating particle dust */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-particle ${8 + Math.random() * 12}s ease-in-out ${Math.random() * 5}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Top Nav */}
      <div ref={topNavRef} className="absolute top-8 left-8 right-8 z-20 flex justify-between items-start opacity-0">
        {/* Logo */}
        <div className="h-16 md:h-24 flex items-center relative z-50">
          <img
            src="/logo.png"
            alt="Abyssal Voyage Logo"
            className="h-full w-auto object-contain opacity-90 sepia-[0.3] hue-rotate-180 brightness-150 hover:brightness-200 transition-all duration-500 hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(0,212,170,0.5)]"
          />
        </div>

        {/* Language */}
        <div className="text-[10px] sm:text-xs text-white uppercase tracking-widest font-mono cursor-pointer flex items-center gap-1 hover:text-[var(--zone-epipelagic)] transition-colors duration-300">
          EN
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Left Data Overlay with typing animation feel */}
      <div
        ref={leftDetailsRef}
        className="hidden md:flex absolute top-40 left-8 z-20 flex-col gap-1.5 text-[9px] text-white/80 font-mono tracking-[0.2em] uppercase opacity-0"
      >
        <p className="hover:text-[var(--zone-epipelagic)] transition-colors duration-300 cursor-default">{">"} DETAIL: CONNECTED</p>
        <p className="hover:text-[var(--zone-epipelagic)] transition-colors duration-300 cursor-default">{">"} LOCATION: MARIANA TRENCH</p>
        <p className="hover:text-[var(--zone-epipelagic)] transition-colors duration-300 cursor-default">{">"} COORDINATES: 11.349° N / 142.199° E</p>
      </div>

      {/* Bottom Corner Widgets */}
      <div ref={bottomRefs} className="absolute bottom-8 left-8 right-8 z-20 flex justify-between items-end opacity-0 pointer-events-none">
        {/* Bottom Left Radar widget */}
        <div className="w-10 h-10 border border-white/20 flex items-center justify-center relative overflow-hidden bg-white/5 hover:border-[var(--zone-epipelagic)]/50 transition-colors duration-500">
          <div className="absolute w-full h-[1px] bg-white/20" />
          <div className="absolute h-full w-[1px] bg-white/20" />
          <div className="absolute w-1 h-1 rounded-full bg-white/50" />
          <div
            className="absolute w-1/2 h-[1px] top-1/2 left-0 origin-right"
            style={{
              background: "linear-gradient(90deg, transparent, var(--zone-epipelagic))",
              animation: 'sonar-line 3s linear infinite'
            }}
          />
        </div>

        {/* Bottom Right text & sonar */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-[8px] text-right font-mono tracking-[0.25em] uppercase text-white/60 leading-[1.6]">
            <p>ABYSSAL VOYAGE INITIATIVE</p>
            <p>ALL RIGHTS RESERVED</p>
            <p>COPYRIGHT 2026</p>
          </div>
          <div className="w-10 h-10 border border-white/20 flex items-center justify-center relative bg-white/5 overflow-hidden">
            <div className="absolute w-1.5 h-1.5 rounded-full bg-[var(--zone-epipelagic)] shadow-[0_0_10px_var(--zone-epipelagic)]" />
            <div
               className="w-full h-full rounded-full border border-[var(--zone-epipelagic)]"
               style={{ animation: 'sonar-ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}
             />
          </div>
        </div>
      </div>

      {/* Center Content with 3D parallax */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center justify-center w-full mt-10 md:mt-20 px-4 transform-gpu"
        style={{ willChange: "transform", transformStyle: "preserve-3d" }}
      >
        <div className="flex flex-col items-center leading-none select-none text-center">
          <h1
            ref={title1Ref}
            className="text-5xl sm:text-7xl md:text-[6rem] lg:text-[8rem] font-light tracking-[0.05em] uppercase opacity-0 hover:tracking-[0.12em] transition-all duration-700"
            style={{
              color: "transparent",
              WebkitTextStroke: "1px rgba(255,255,255,0.9)",
              fontFamily: "var(--font-serif)",
              transform: "translateZ(30px)",
              textShadow: "0 0 80px rgba(0,212,170,0.15)",
            }}
          >
            THE ABYSSAL
          </h1>
          <h1
            ref={title2Ref}
            className="text-6xl sm:text-8xl md:text-[7rem] lg:text-[9.5rem] font-bold tracking-tight text-white uppercase -mt-2 md:-mt-6 opacity-0 hover:text-[var(--zone-epipelagic)] transition-colors duration-700"
            style={{
              fontFamily: "var(--font-serif)",
              transform: "translateZ(60px)",
              textShadow: "0 0 100px rgba(0,212,170,0.2), 0 4px 30px rgba(0,0,0,0.5)",
            }}
          >
            VOYAGE
          </h1>
        </div>

        {/* Decorative horizontal line with glow */}
        <div className="w-40 h-px my-10 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--zone-epipelagic)]/30 to-transparent blur-sm" />
        </div>

        <p
          ref={subtitleRef}
          className="text-[9px] sm:text-[10px] md:text-xs text-white/70 font-mono tracking-[0.25em] uppercase mb-8 opacity-0"
          style={{ transform: "translateZ(20px)" }}
        >
          WE USE AUDIO TO ENHANCE YOUR EXPERIENCE.
        </p>

        {/* CTA Button with glow hover */}
        <button
          ref={ctaRef}
          onClick={handleDive}
          className="relative px-10 py-5 group cursor-pointer opacity-0"
          style={{ transform: "translateZ(40px)" }}
        >
          {/* Glow background on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-sm"
            style={{
              background: "radial-gradient(ellipse at center, rgba(0,212,170,0.15) 0%, transparent 70%)",
              boxShadow: "inset 0 0 30px rgba(0,212,170,0.1)",
            }}
          />

          {/* Target bracket corners with animated expansion on hover */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/50 group-hover:border-[var(--zone-epipelagic)] group-hover:w-5 group-hover:h-5 transition-all duration-500" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/50 group-hover:border-[var(--zone-epipelagic)] group-hover:w-5 group-hover:h-5 transition-all duration-500" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/50 group-hover:border-[var(--zone-epipelagic)] group-hover:w-5 group-hover:h-5 transition-all duration-500" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/50 group-hover:border-[var(--zone-epipelagic)] group-hover:w-5 group-hover:h-5 transition-all duration-500" />

          <span
            className="relative z-10 text-[10px] md:text-[12px] font-bold text-white tracking-[0.3em] uppercase group-hover:text-[var(--zone-epipelagic)] group-hover:tracking-[0.5em] transition-all duration-500"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            LET&apos;S BEGIN
          </span>
        </button>
      </div>
    </section>
  );
}
