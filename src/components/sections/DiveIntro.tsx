"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

interface DiveIntroProps {
  onComplete: () => void;
}

// Narration sequence — timed text overlays during the intro video
// The audioSrc points to your baked-in AWS Polly MP3 files!
const NARRATION_STEPS = [
  { time: 0.5, text: "Take a deep breath. The surface is calm.", duration: 3.0, audioSrc: "/audio/narration-1.mp3" },
  { time: 4.0, text: "But beneath these shimmering waves...", duration: 2.5, audioSrc: "/audio/narration-2.mp3" },
  { time: 6.8, text: "An alien world quietly waits.", duration: 2.5, audioSrc: "/audio/narration-3.mp3" },
  { time: 9.6, text: "A realm of darkness and crushing pressure.", duration: 3.5, audioSrc: "/audio/narration-4.mp3" },
  { time: 13.5, text: "Where sunlight is a distant memory.", duration: 2.5, audioSrc: "/audio/narration-5.mp3" },
  { time: 16.5, text: "Prepare your descent into the abyss.", duration: 2.5, audioSrc: "/audio/narration-6.mp3" },
  { time: 19.5, text: "Dive in. Explore the unseen.", duration: 2.5, audioSrc: "/audio/narration-7.mp3" },
];

export default function DiveIntro({ onComplete }: DiveIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const narrationRef = useRef<HTMLDivElement>(null);
  const depthCounterRef = useRef<HTMLSpanElement>(null);
  const [currentText, setCurrentText] = useState("");
  const [depthValue, setDepthValue] = useState(0);
  const [isEnding, setIsEnding] = useState(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  
  const activeAudioRef = useRef<HTMLAudioElement[]>([]);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Preload cinematic background music for the intro
    if (typeof window !== "undefined") {
      const bgm = new Audio("/audio.mp3");
      bgm.volume = 0.25; // Ducked volume to 25% so AWS Polly is easily hearable
      bgm.loop = true;
      bgmRef.current = bgm;
    }
  }, []);

  const startNarration = useCallback(() => {
    // Stop any previously playing speech/audio
    activeAudioRef.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    activeAudioRef.current = [];

    // Play background music
    bgmRef.current?.play().catch(e => console.warn("BGM autoplay blocked:", e));

    // Schedule each narration text and corresponding AWS Polly audio
    NARRATION_STEPS.forEach((step) => {
      const showTimeout = setTimeout(() => {
        setCurrentText(step.text);

        // --- Baked-In Voice Narration (AWS Polly MP3s) ---
        try {
          const audio = new Audio(step.audioSrc);
          audio.volume = 1;
          audio.play().catch(e => console.warn("Audio autoplay blocked by browser:", e));
          activeAudioRef.current.push(audio);
        } catch (e) {
          console.error("Failed to play narration audio:", e);
        }

        // Animate text in
        if (narrationRef.current) {
          gsap.fromTo(
            narrationRef.current,
            { y: 20, opacity: 0, filter: "blur(4px)" },
            { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.3, ease: "power2.out" }
          );
        }
      }, step.time * 1000);

      const hideTimeout = setTimeout(() => {
        if (narrationRef.current) {
          gsap.to(narrationRef.current, {
            opacity: 0,
            y: -10,
            duration: 0.3,
            ease: "power2.in",
          });
        }
      }, (step.time + step.duration) * 1000);

      timeoutsRef.current.push(showTimeout, hideTimeout);
    });

    // Depth counter animation (0 → 200m as video dives)
    const depthInterval = setInterval(() => {
      setDepthValue((prev) => {
        if (prev >= 200) {
          clearInterval(depthInterval);
          return 200;
        }
        return prev + 1;
      });
    }, 50);
    timeoutsRef.current.push(depthInterval as unknown as NodeJS.Timeout);
  }, []);

  const handleFinalDive = useCallback(() => {
    // Stop any audio that might still be playing
    activeAudioRef.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    activeAudioRef.current = [];
    
    // Stop background music
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
    }

    // Scale + blur transition out
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        scale: 1.1,
        opacity: 0,
        filter: "blur(12px)",
        duration: 1.5,
        ease: "power3.inOut",
        onComplete: () => {
          onComplete();
        },
      });
    }
  }, [onComplete]);

  const handleVideoEnd = useCallback(() => {
    setIsEnding(true);
    // Video loops automatically — no pause needed
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Start narration when video starts playing
    const onPlay = () => startNarration();
    video.addEventListener("play", onPlay);

    // Handle video end
    video.addEventListener("ended", handleVideoEnd);

    // Auto-play the video
    video.play().catch(() => {
      // Autoplay blocked — show anyway and let user interact
    });

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("ended", handleVideoEnd);
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [startNarration, handleVideoEnd]);

  // 3D perspective zoom effect on scroll/time
  useEffect(() => {
    if (!containerRef.current) return;

    // Subtle continuous zoom into the video for depth immersion
    gsap.fromTo(
      containerRef.current.querySelector("video"),
      { scale: 1 },
      {
        scale: 1.15,
        duration: 20,
        ease: "none",
      }
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[10000] bg-black overflow-hidden"
      style={{ perspective: "1200px" }}
    >
      {/* Intro Video — full screen */}
      <video
        ref={videoRef}
        playsInline
        muted
        loop
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transformOrigin: "center center",
          willChange: "transform",
        }}
      >
        <source src="/intro.mp4" type="video/mp4" />
      </video>

      {/* Dark vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,10,26,0.6) 100%)",
        }}
      />

      {/* Bottom gradient for text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 30%, transparent 50%, rgba(0,10,26,0.7) 100%)",
        }}
      />

      {/* Narration Text & Persistent Dive Button */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        
        {/* Text Area */}
        <div
          ref={narrationRef}
          className="text-center opacity-0 mb-12"
        >
          <p
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white/90 tracking-wide max-w-4xl px-6"
            style={{
              fontFamily: "var(--font-serif)",
              textShadow: "0 0 40px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            {currentText}
          </p>
        </div>

        {/* Persistent DIVE IN button beneath text */}
        <button
          onClick={handleFinalDive}
          className="group relative px-10 py-5 cursor-crosshair pointer-events-auto mt-4 translate-y-8"
        >
          {/* Target bracket corners */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/50 group-hover:border-[var(--zone-epipelagic)] transition-colors duration-300" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/50 group-hover:border-[var(--zone-epipelagic)] transition-colors duration-300" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/50 group-hover:border-[var(--zone-epipelagic)] transition-colors duration-300" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/50 group-hover:border-[var(--zone-epipelagic)] transition-colors duration-300" />

          <span className="text-sm font-bold text-white tracking-[0.4em] uppercase group-hover:text-[var(--zone-epipelagic)] transition-colors duration-300" style={{ fontFamily: "var(--font-mono)" }}>
            DIVE IN
          </span>
          
          <div className="absolute inset-x-0 -bottom-8 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <span className="text-[9px] text-[var(--zone-epipelagic)] font-mono tracking-[0.3em] uppercase">SKIP CINEMATIC</span>
          </div>
        </button>
      </div>

      {/* Depth Counter — bottom right */}
      <div className="absolute bottom-12 right-12 pointer-events-none">
        <div className="flex items-baseline gap-2">
          <span
            ref={depthCounterRef}
            className="text-3xl md:text-5xl font-bold text-white/60 tabular-nums"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {depthValue}
          </span>
          <span
            className="text-lg text-white/30"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            m
          </span>
        </div>
        <div
          className="text-[9px] text-white/20 tracking-[0.3em] uppercase mt-1"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Depth
        </div>
      </div>

      {/* Sonar-style scan line */}
      <div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--zone-epipelagic)] to-transparent opacity-20 pointer-events-none"
        style={{
          top: "30%",
          animation: "sonar-line 4s linear infinite",
          transformOrigin: "center",
        }}
      />

      {/* Animated bubbles rising from bottom */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute bottom-0 rounded-full border border-white/10"
            style={{
              left: `${10 + i * 12}%`,
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              animation: `bubble-rise ${3 + Math.random() * 4}s ease-out ${i * 0.5}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
