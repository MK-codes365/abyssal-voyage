"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ZONE_AUDIO_CONFIG = [
  { id: "epipelagic", src: "/audio/waves.mp3", volume: 0.4, narrationSrc: "/audio/story-epi.mp3" },
  { id: "mesopelagic", src: "/audio/bubbles.mp3", volume: 0.3, narrationSrc: "/audio/story-meso.mp3" },
  { id: "bathypelagic", src: "/audio/whale.mp3", volume: 0.25, narrationSrc: "/audio/story-bathy.mp3" },
  { id: "abyssopelagic", src: "/audio/deep-rumble.mp3", volume: 0.2, narrationSrc: "/audio/story-abysso.mp3" },
  { id: "hadalpelagic", src: "/audio/hadal-ambience.mp3", volume: 0.15, narrationSrc: "/audio/story-hadal.mp3" },
];

export default function SoundManager() {
  const [isMuted, setIsMuted] = useState(true);
  const [activeZone, setActiveZone] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourcesRef = useRef<Map<string, { audio: HTMLAudioElement; gain: GainNode }>>(new Map());
  const narrationSourcesRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const hasInteracted = useRef(false);

  // Global Auto-Unlock: The moment the user clicks anywhere (like the "Dive In" button),
  // we initialize the audio engine and unmute it automatically to begin the cinematic journey.
  // We execute .play() SYNCHRONOUSLY here to bypass strict browser autoplay blockers!
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted.current) {
        initAudio();
        setIsMuted(false);
        
        // Force sync play on the current zone's voiceover to guarantee browser approval
        const currentStory = narrationSourcesRef.current.get(ZONE_AUDIO_CONFIG[activeZone].id);
        if (currentStory) {
           currentStory.play().catch(() => {});
        }
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
  }, [activeZone]);

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
      // Cleanup audio
      audioSourcesRef.current.forEach(({ audio }) => {
        audio.pause();
        audio.src = "";
      });
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
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      ZONE_AUDIO_CONFIG.forEach((config) => {
        // 1. Setup Ambient Looping Sounds (Web Audio API)
        const audio = new Audio(config.src);
        audio.loop = true;
        audio.crossOrigin = "anonymous";

        try {
          const source = ctx.createMediaElementSource(audio);
          const gain = ctx.createGain();
          gain.gain.value = 0;
          source.connect(gain);
          gain.connect(ctx.destination);
          audio.play().catch(() => {});
          audioSourcesRef.current.set(config.id, { audio, gain });
        } catch {
          // Audio file not found — graceful degradation
        }

        // 2. Setup AWS Polly Storytelling Voices (Raw HTML5 Audio)
        if (config.narrationSrc) {
          const narAudio = new Audio(config.narrationSrc);
          narAudio.volume = 1;
          narAudio.loop = false; // We don't want the narrator to repeat endlessly!
          narrationSourcesRef.current.set(config.id, narAudio);
        }
      });
    } catch {
      // Web Audio API not supported
    }
  };

  // Crossfade between zones and trigger AWS storytelling
  useEffect(() => {
    // 1. Handle Ambient Sound Crossfading
    if (audioContextRef.current && !isMuted) {
      ZONE_AUDIO_CONFIG.forEach((config, index) => {
        const source = audioSourcesRef.current.get(config.id);
        if (!source) return;

        const targetVolume = index === activeZone ? config.volume : 0;
        source.gain.gain.linearRampToValueAtTime(
          targetVolume,
          audioContextRef.current!.currentTime + 1.5
        );
      });
    }

    // 2. Handle Storytelling Playback State
    ZONE_AUDIO_CONFIG.forEach((config, index) => {
      const narAudio = narrationSourcesRef.current.get(config.id);
      if (!narAudio) return;

      if (index === activeZone) {
        // If we enter this zone (or unmute), tell the story!
        if (!isMuted) {
          narAudio.play().catch(() => {});
        } else {
          // Pause precisely where we left off if mutated mid-sentence
          narAudio.pause();
        }
      } else {
        // Not the active zone anymore. Silence the narrator and rewind the story chapter.
        narAudio.pause();
        narAudio.currentTime = 0;
      }
    });
  }, [activeZone, isMuted]);

  const toggleMute = () => {
    if (!hasInteracted.current) {
      initAudio();
    }
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (audioContextRef.current) {
        if (newMuted) {
          audioContextRef.current.suspend();
        } else {
          audioContextRef.current.resume();
        }
      }
      return newMuted;
    });
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
