"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ZONE_AUDIO_CONFIG = [
  { id: "epipelagic", narrationSrc: "/audio/story-epi.mp3" },
  { id: "mesopelagic", narrationSrc: "/audio/story-meso.mp3" },
  { id: "bathypelagic", narrationSrc: "/audio/story-bathy.mp3" },
  { id: "abyssopelagic", narrationSrc: "/audio/story-abysso.mp3" },
  { id: "hadalpelagic", narrationSrc: "/audio/story-hadal.mp3" },
];

export default function SoundManager() {
  const [isMuted, setIsMuted] = useState(true);
  const [activeZone, setActiveZone] = useState(0);
  const narrationSourcesRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const bgVoiceRef = useRef<HTMLAudioElement | null>(null);
  const hasInteracted = useRef(false);
  const lastZoneRef = useRef(-1);

  // Global Auto-Unlock: The moment the user clicks anywhere (like the "Dive In" button),
  // we initialize audio and unmute automatically.
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted.current) {
        initAudio();
        setIsMuted(false);
      }
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  // ScrollTrigger to track which zone user is in
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const trigger = ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const index = Math.min(
          Math.floor(self.progress * ZONE_AUDIO_CONFIG.length),
          ZONE_AUDIO_CONFIG.length - 1
        );
        setActiveZone(index);
      },
    });

    return () => {
      trigger.kill();
      narrationSourcesRef.current.forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
    };
  }, []);

  const initAudio = () => {
    if (hasInteracted.current) return;
    hasInteracted.current = true;

    try {
      // 1. Setup continuous background voice (/bg-voice.mp4)
      const bgVoice = new Audio("/bg-voice.mp4");
      bgVoice.volume = 0.15; // Low background volume — ducked under narration
      bgVoice.loop = true;
      bgVoice.play().catch(() => {});
      bgVoiceRef.current = bgVoice;

      // 2. Setup per-zone storytelling narrations
      ZONE_AUDIO_CONFIG.forEach((config) => {
        if (config.narrationSrc) {
          const narAudio = new Audio(config.narrationSrc);
          narAudio.volume = 1; // Full volume so narration is clearly hearable
          narAudio.loop = false;

          // When narration starts playing, duck the background voice
          narAudio.addEventListener("play", () => {
            if (bgVoiceRef.current) {
              gsap.to(bgVoiceRef.current, { volume: 0.05, duration: 0.5 });
            }
          });

          // When narration finishes or pauses, restore background voice
          narAudio.addEventListener("ended", () => {
            if (bgVoiceRef.current) {
              gsap.to(bgVoiceRef.current, { volume: 0.15, duration: 1 });
            }
          });
          narAudio.addEventListener("pause", () => {
            if (bgVoiceRef.current) {
              gsap.to(bgVoiceRef.current, { volume: 0.15, duration: 1 });
            }
          });

          narrationSourcesRef.current.set(config.id, narAudio);
        }
      });
    } catch {
      // Web Audio API not supported — graceful degradation
    }
  };

  // Handle zone changes — play/pause narration per zone
  useEffect(() => {
    if (!hasInteracted.current) return;

    // Only trigger when zone actually changes
    if (lastZoneRef.current === activeZone) return;
    lastZoneRef.current = activeZone;

    ZONE_AUDIO_CONFIG.forEach((config, index) => {
      const narAudio = narrationSourcesRef.current.get(config.id);
      if (!narAudio) return;

      if (index === activeZone) {
        // Entering this zone — play its narration
        if (!isMuted) {
          narAudio.currentTime = 0; // Restart from beginning for this zone
          narAudio.play().catch(() => {});
        }
      } else {
        // Not the active zone — stop its narration
        narAudio.pause();
        narAudio.currentTime = 0;
      }
    });
  }, [activeZone, isMuted]);

  // Handle mute/unmute for background voice
  useEffect(() => {
    if (!bgVoiceRef.current) return;
    if (isMuted) {
      bgVoiceRef.current.pause();
    } else {
      bgVoiceRef.current.play().catch(() => {});
    }
  }, [isMuted]);

  const toggleMute = () => {
    if (!hasInteracted.current) {
      initAudio();
    }
    setIsMuted((prev) => !prev);
  };

  return (
    <button
      onClick={toggleMute}
      className="fixed bottom-8 right-8 z-50 w-10 h-10 rounded-full glass-card 
        flex items-center justify-center cursor-pointer
        transition-all duration-300 hover:scale-110
        group"
      style={{
        borderColor: isMuted ? "rgba(255,255,255,0.1)" : "rgba(0,212,170,0.3)",
      }}
      aria-label={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-white/40 group-hover:text-white/70 transition-colors"
        >
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-[var(--zone-epipelagic)] group-hover:text-white/90 transition-colors"
        >
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}
    </button>
  );
}
