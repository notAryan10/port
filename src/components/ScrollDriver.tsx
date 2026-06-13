"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WORLD_CHAPTERS } from "@/config/chapters";
import { scrollState } from "@/lib/scroll";
import { usePhase } from "@/lib/phase";

gsap.registerPlugin(ScrollTrigger);

/**
 * Owns scrolling. Renders the tall invisible spacer that gives the page its
 * scroll height, wires Lenis into GSAP's ticker, and uses one scrubbed
 * ScrollTrigger to write normalized progress into scrollState. Scroll is locked
 * during the intro phase and released once the world begins.
 */
export default function ScrollDriver() {
  const phase = usePhase();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({ smoothWheel: true });
    lenisRef.current = lenis;
    lenis.stop(); // locked until the world phase begins

    lenis.on("scroll", ScrollTrigger.update);
    const ticker = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    const trigger = ScrollTrigger.create({
      trigger: "#scroll-track",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        scrollState.progress = self.progress;
      },
    });

    return () => {
      trigger.kill();
      gsap.ticker.remove(ticker);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (phase === "world") lenis.start();
    else lenis.stop();
  }, [phase]);

  const scrollVh = WORLD_CHAPTERS.length * 100;

  return (
    <div id="scroll-track" style={{ height: `${scrollVh}vh` }} aria-hidden />
  );
}
