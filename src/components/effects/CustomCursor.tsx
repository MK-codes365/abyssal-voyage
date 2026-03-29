"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ZONE_COLORS = [
  "#00d4aa", // Epipelagic
  "#4f46e5", // Mesopelagic
  "#1e1b4b", // Bathypelagic
  "#06b6d4", // Abyssopelagic
  "#dc2626", // Hadalpelagic
];

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [color, setColor] = useState(ZONE_COLORS[0]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const bubbleIdRef = useRef(0);
  const lastBubbleTime = useRef(0);

  useEffect(() => {
    // Detect touch device
    setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const trigger = ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const index = Math.min(
          Math.floor(self.progress * ZONE_COLORS.length),
          ZONE_COLORS.length - 1
        );
        setColor(ZONE_COLORS[index]);
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!cursorRef.current || !ringRef.current) return;

      // Cursor follows instantly
      gsap.to(cursorRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: "power2.out",
      });

      // Ring follows with slight delay
      gsap.to(ringRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
        ease: "power2.out",
      });

      // Spawn bubbles with throttle
      const now = Date.now();
      if (now - lastBubbleTime.current > 120) {
        lastBubbleTime.current = now;
        const newBubble: Bubble = {
          id: bubbleIdRef.current++,
          x: e.clientX + (Math.random() - 0.5) * 10,
          y: e.clientY + (Math.random() - 0.5) * 10,
          size: 3 + Math.random() * 5,
          delay: Math.random() * 0.2,
        };
        setBubbles((prev) => [...prev.slice(-12), newBubble]);
      }
    },
    []
  );

  useEffect(() => {
    if (isTouchDevice) return;
    window.addEventListener("mousemove", handleMouseMove);
    
    // Play a procedurally generated, ultra-low latency UI "bloop" using Web Audio API
    const playHoverSound = () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const actx = new AudioContext();
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        
        osc.connect(gain);
        gain.connect(actx.destination);
        
        osc.type = "sine";
        // Frequency sweep for a deeply satisfying tech lock-on sound
        osc.frequency.setValueAtTime(350, actx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, actx.currentTime + 0.1);
        
        // Zero-pop volume envelope
        gain.gain.setValueAtTime(0, actx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, actx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.1);
        
        osc.start(actx.currentTime);
        osc.stop(actx.currentTime + 0.1);
      } catch(e) { /* Browser audio context not initialized yet */ }
    };

    // Add interactive click/hover detection
    const handleMouseOverInteractive = (e: MouseEvent) => {
       if (!ringRef.current) return;
       const target = e.target as HTMLElement;
       const isInteractive = target.closest('button, a, .fact-card, [role="button"]');
       
       if (isInteractive) {
         if (ringRef.current.dataset.hovering !== "true") {
           playHoverSound();
           ringRef.current.dataset.hovering = "true";
         }
         gsap.to(ringRef.current.children[0], { 
            scale: 2.2, 
            borderWidth: '2px', 
            backgroundColor: `${color}11`,
            duration: 0.3, 
            ease: "back.out(1.5)" 
         });
       } else {
         ringRef.current.dataset.hovering = "false";
         gsap.to(ringRef.current.children[0], { 
            scale: 1, 
            borderWidth: '1px', 
            backgroundColor: `transparent`,
            duration: 0.2, 
            ease: "power2.out" 
         });
       }
    };
    
    window.addEventListener("mouseover", handleMouseOverInteractive);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOverInteractive);
    }
  }, [isTouchDevice, handleMouseMove, color]);

  // Clean up old bubbles
  useEffect(() => {
    if (bubbles.length === 0) return;
    const timeout = setTimeout(() => {
      setBubbles((prev) => prev.slice(1));
    }, 800);
    return () => clearTimeout(timeout);
  }, [bubbles]);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Main cursor dot */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 z-[50000] pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: "transform" }}
      >
        <div
          className="w-2 h-2 rounded-full transition-colors duration-500"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}88, 0 0 20px ${color}44`,
          }}
        />
      </div>

      {/* Outer ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[49999] pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: "transform" }}
      >
        <div
          className="w-8 h-8 rounded-full border transition-colors duration-500"
          style={{
            borderColor: `${color}44`,
          }}
        />
      </div>

      {/* Bubble trail */}
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="fixed pointer-events-none z-[49998]"
          style={{
            left: bubble.x,
            top: bubble.y,
            width: bubble.size,
            height: bubble.size,
            borderRadius: "50%",
            border: `1px solid ${color}33`,
            animation: `bubble-rise 0.8s ease-out ${bubble.delay}s forwards`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </>
  );
}
