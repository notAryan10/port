"use client";

import { useEffect, useState } from "react";
import { introState, smoothstep } from "@/lib/intro";
import { usePhase } from "@/lib/phase";

const LINES: [number, string][] = [
  [0.02, "> Generating World..."],
  [0.14, "> Loading Chunks..."],
  [0.26, "> Loading Projects..."],
  [0.38, "> Loading Experience..."],
  [0.5, "> Spawning Player..."],
];

/** Terminal boot text → title → "scroll to enter" prompt, driven by introState.t. */
export default function IntroOverlay() {
  const phase = usePhase();
  const [t, setT] = useState(0);

  useEffect(() => {
    if (phase !== "intro") return;
    let raf = 0;
    let last = -1;
    const loop = () => {
      const cur = introState.t;
      if (Math.abs(cur - last) > 0.008) {
        last = cur;
        setT(cur);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  if (phase !== "intro") return null;

  const terminalOpacity = 1 - smoothstep(0.72, 0.86, t);
  const titleOpacity = smoothstep(0.78, 0.96, t);
  const showPrompt = t > 0.985;

  return (
    <div className="pointer-events-none fixed inset-0 z-20 font-mono text-cyan-300">
      {/* Terminal boot log */}
      <div
        className="absolute left-10 top-1/2 -translate-y-1/2 text-sm leading-7 tracking-wide md:left-16 md:text-base"
        style={{ opacity: terminalOpacity }}
      >
        {LINES.map(([threshold, label]) =>
          t >= threshold ? (
            <div key={label} className="text-glow-cyan">
              {label}
            </div>
          ) : null,
        )}
      </div>

      {/* Title */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center"
        style={{ opacity: titleOpacity }}
      >
        <h1 className="font-display text-6xl font-bold tracking-[0.12em] text-text text-glow-cyan md:text-8xl">
          ARYAN VERMA
        </h1>
        <p className="mt-4 text-xs tracking-[0.4em] text-cyan-300 md:text-sm">
          ENGINEER • BUILDER • CREATOR
        </p>
      </div>

      {/* Enter prompt */}
      <div
        className="absolute inset-x-0 bottom-16 text-center text-xs tracking-[0.4em] transition-opacity duration-700"
        style={{ opacity: showPrompt ? 1 : 0 }}
      >
        <span className="animate-pulse">SCROLL TO ENTER</span>
      </div>
    </div>
  );
}
