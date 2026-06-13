"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CHAPTERS } from "@/config/chapters";
import { scrollState } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

/**
 * Owns scrolling. Renders the tall invisible spacer that gives the page its
 * scroll height, wires Lenis smooth-scroll into GSAP's ticker, and uses one
 * scrubbed ScrollTrigger to write normalized progress into scrollState.
 * Renders nothing visible — the world is a fixed-position Canvas behind it.
 */
export default function ScrollDriver() {
  useEffect(() => {
    const lenis = new Lenis({ smoothWheel: true });

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
    };
  }, []);

  // One viewport of scroll per chapter transition.
  const scrollVh = CHAPTERS.length * 100;

  return (
    <div id="scroll-track" style={{ height: `${scrollVh}vh` }} aria-hidden />
  );
}
