"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ScrambledText = ({ text }: { text: string }) => {
  const [display, setDisplay] = useState("...");
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if(entries[0].isIntersecting) {
         let loops = 0;
         const finalLoops = 20; // Scrambles for ~1 second
         const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=";
         
         const interval = setInterval(() => {
            if(loops >= finalLoops) {
               setDisplay(text);
               clearInterval(interval);
            } else {
               setDisplay(text.split('').map(c => c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]).join(''));
               loops++;
            }
         }, 50);
         observer.disconnect();
      }
    });
    
    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [text]);

  return <span ref={elementRef} style={{ fontVariantNumeric: "tabular-nums" }}>{display}</span>;
}

interface ZoneFact {
  label: string;
  value: string;
}

interface SectionProps {
  children: ReactNode;
  id: string;
  className?: string;
  title: string;
  depth: string;
  zoneColor?: string;
  facts?: ZoneFact[];
  videoSrc?: string;
}

export default function Section({
  children,
  id,
  className,
  title,
  depth,
  zoneColor = "#00d4aa",
  facts = [],
  videoSrc,
}: SectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const parallaxLayerRef = useRef<HTMLDivElement>(null);
  const flashlightRef = useRef<HTMLDivElement>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const cardsColumnRef = useRef<HTMLDivElement>(null);

  // Determine if flashlight is needed
  const isDarkZone = ["bathypelagic", "abyssopelagic", "hadalpelagic"].includes(id);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Flashlight math
    if (isDarkZone && flashlightRef.current) {
        requestAnimationFrame(() => {
          if (flashlightRef.current) {
            flashlightRef.current.style.background = `radial-gradient(circle 600px at ${x}px ${y}px, transparent 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.98) 80%)`;
          }
        });
    }

    // 3D Parallax math
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const deltaX = (x - centerX) / centerX; // normalizes -1 to 1
    const deltaY = (y - centerY) / centerY; // normalizes -1 to 1

    if (contentRef.current) {
       gsap.to(contentRef.current, {
          rotateX: deltaY * -5, // Tilt towards mouse
          rotateY: deltaX * 5,
          x: deltaX * -15,
          y: deltaY * -15,
          duration: 0.6,
          ease: "power2.out",
          transformPerspective: 1500
       });
    }
    if (videoWrapperRef.current) {
       gsap.to(videoWrapperRef.current, {
          rotateX: deltaY * 2, // Tilt opposite background layer slightly
          rotateY: deltaX * -2,
          x: deltaX * 15,
          y: deltaY * 15,
          duration: 1.2,
          ease: "power2.out",
          transformPerspective: 1500
       });
    }
  };

  const handleMouseLeave = () => {
    if (contentRef.current) {
       gsap.to(contentRef.current, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 1.5, ease: "power2.out" });
    }
    if (videoWrapperRef.current) {
       gsap.to(videoWrapperRef.current, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 2, ease: "power2.out" });
    }
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!sectionRef.current || !parallaxLayerRef.current) return;

    // Parallax: gradient layers move at 0.3x scroll speed
    gsap.to(parallaxLayerRef.current, {
      yPercent: -20,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }, []);

  // Separate observer for Fact Cards to guarantee they animate instantly on view
  useEffect(() => {
    if (!cardsColumnRef.current) return;
    const cards = Array.from(cardsColumnRef.current.querySelectorAll('.fact-card'));
    
    // Hide initially
    gsap.set(cards, { x: 80, opacity: 0, filter: "blur(10px)" });

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && entries[0].intersectionRatio > 0.1) {
        gsap.to(
          cards,
          {
            x: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1,
            ease: "power3.out",
            stagger: 0.15,
            overwrite: true
          }
        );
        observer.disconnect(); // Only animate in once for cinematic feel
      }
    }, { threshold: 0.1 });

    observer.observe(cardsColumnRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={cn(
        "relative min-h-screen flex flex-col items-center justify-center p-6 md:p-24 overflow-hidden perspective-1500",
        className
      )}
      style={{ perspective: "1500px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dynamic Flashlight Overlay for Deep Zones */}
      {isDarkZone && (
        <div 
          ref={flashlightRef}
          className="absolute inset-0 pointer-events-none z-[100]"
          style={{
            background: `radial-gradient(circle 600px at 50% 50%, transparent 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.98) 80%)`
          }}
        />
      )}

      {/* Video background wrapper with 3D Parallax */}
      {videoSrc && (
        <div ref={videoWrapperRef} className="absolute inset-0 z-0 overflow-hidden scale-[1.1]" style={{ willChange: "transform" }}>
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>
      )}

      {/* Parallax gradient overlays - only render if no video to optimize performance */}
      {!videoSrc && (
        <div
          ref={parallaxLayerRef}
          className="absolute inset-0 pointer-events-none"
          style={{ willChange: "transform" }}
        >
          {/* Layer 1: Radial glow from zone color */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              background: `radial-gradient(ellipse at 30% 50%, ${zoneColor} 0%, transparent 60%)`,
            }}
          />
          {/* Layer 2: Top gradient veil */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              background: `linear-gradient(180deg, ${zoneColor}22 0%, transparent 40%, transparent 60%, ${zoneColor}11 100%)`,
            }}
          />
          {/* Layer 3: Side atmospheric glow */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              background: `radial-gradient(ellipse at 80% 70%, ${zoneColor} 0%, transparent 50%)`,
            }}
          />
        </div>
      )}

      {/* Content wrapper with Foreground 3D Parallax */}
      <div 
         ref={contentRef} 
         className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row gap-12 md:gap-16 items-start transform-gpu"
         style={{ willChange: "transform", transformStyle: "preserve-3d" }}
      >
        {/* Text Column */}
        <div className="flex-1 space-y-6">
          {/* Depth label */}
          <div className="flex items-center gap-4">
            <span
              className="h-px w-10 block"
              style={{ backgroundColor: `${zoneColor}66` }}
            />
            <span
              className="text-sm tracking-[0.2em] uppercase"
              style={{
                fontFamily: "var(--font-mono)",
                color: zoneColor,
                opacity: 0.8,
              }}
            >
              {depth}
            </span>
          </div>

          {/* Title with zone-colored text shadow */}
          <h2
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-white/90"
            style={{
              fontFamily: "var(--font-serif)",
              textShadow: `0 0 60px ${zoneColor}33, 0 0 120px ${zoneColor}11`,
            }}
          >
            {title}
          </h2>

          {/* Body text */}
          <div className="max-w-xl text-base md:text-lg leading-relaxed text-white/50">
            {children}
          </div>
        </div>

        {/* Fact Cards Column */}
        {facts.length > 0 && (
          <div ref={cardsColumnRef} className="flex flex-col gap-4 md:mt-20 w-full md:w-80 shrink-0">
            {facts.map((fact, i) => (
              <div
                key={i}
                className="fact-card relative overflow-hidden backdrop-blur-xl bg-[#000a1a]/60 border px-6 py-5 opacity-0 transition-all duration-500 cursor-crosshair group shadow-2xl"
                style={{
                  borderColor: `${zoneColor}44`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = zoneColor;
                  e.currentTarget.style.boxShadow = `0 10px 40px -10px ${zoneColor}88, inset 0 0 20px ${zoneColor}33`;
                  e.currentTarget.style.transform = "translateY(-6px) scale(1.02) translateZ(20px)";
                  e.currentTarget.style.backgroundColor = "rgba(0,10,26,0.8)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${zoneColor}44`;
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.5)";
                  e.currentTarget.style.transform = "translateY(0) scale(1) translateZ(0)";
                  e.currentTarget.style.backgroundColor = "rgba(0,10,26,0.6)";
                }}
              >
                {/* Glowing border accent bar */}
                <div 
                  className="absolute top-0 left-0 w-1.5 h-full transition-all duration-500 group-hover:w-full group-hover:opacity-[0.15] opacity-80" 
                  style={{ backgroundColor: zoneColor }} 
                />

                <div className="relative z-10 flex flex-col gap-1.5 pointer-events-none">
                  <div
                    className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: zoneColor,
                      textShadow: `0 0 10px ${zoneColor}66`
                    }}
                  >
                    {fact.label}
                  </div>
                  <div
                    className="text-lg md:text-xl font-medium text-white tracking-wide"
                    style={{ fontFamily: "var(--font-serif)", textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}
                  >
                    <ScrambledText text={fact.value} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
