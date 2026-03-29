"use client";

import { useEffect, useRef, ReactNode } from "react";
import Lenis from "lenis";

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initializing Lenis directly from the core library
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard easing
      smoothWheel: true,
      wheelMultiplier: 1,
      lerp: 0.1,
    });

    lenisRef.current = lenis;

    // Velocity-driven motion blur & skew effect via CSS Variables
    lenis.on("scroll", (e: any) => {
      const velocity = e.velocity;
      const absVelocity = Math.abs(velocity);
      
      const skewAmt = Math.min(Math.max(velocity * 0.15, -3), 3); 
      const blurAmt = Math.min(absVelocity * 0.1, 4);

      // Injecting dynamic variables into the root to avoid breaking fixed positioning
      document.documentElement.style.setProperty('--scroll-skew', `${skewAmt}deg`);
      document.documentElement.style.setProperty('--scroll-scale', `${1 + absVelocity * 0.002}`);
      document.documentElement.style.setProperty('--scroll-blur', blurAmt > 0.5 ? `${blurAmt}px` : '0px');
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
