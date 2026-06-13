"use client";

import { useEffect, useRef, useState } from "react";
import { WORLD_CHAPTERS } from "@/config/chapters";
import { scrollState, chapterIndexFromProgress } from "@/lib/scroll";
import { usePhase } from "@/lib/phase";

/**
 * DOM overlay. Polls scrollState on a rAF loop (never coupled to React state at
 * 60fps): the progress bar is mutated directly via ref, and chapter index is
 * lifted to state only when it actually changes. Hidden during the intro.
 */
export default function Hud() {
  const phase = usePhase();
  const [active, setActive] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase !== "world") return;
    let raf = 0;
    let last = -1;
    const loop = () => {
      const p = scrollState.progress;
      if (barRef.current) barRef.current.style.width = `${p * 100}%`;
      const idx = chapterIndexFromProgress(p);
      if (idx !== last) {
        last = idx;
        setActive(idx);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  if (phase !== "world") return null;

  const chapter = WORLD_CHAPTERS[active];

  return (
    <div className="pointer-events-none fixed inset-0 z-10 font-mono">
      {/* Top nav */}
      <header className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-5 md:px-10">
        <div className="leading-tight">
          <div className="font-display text-sm font-bold tracking-[0.2em] text-text">
            ARYAN VERMA
          </div>
          <div className="text-[0.65rem] tracking-[0.3em] text-muted">
            DIGITAL PORTFOLIO
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-[0.7rem] tracking-[0.15em] md:flex">
          {WORLD_CHAPTERS.map((c, i) => {
            const isActive = active === i;
            return (
              <span
                key={c.id}
                className={
                  isActive
                    ? "border-b-2 border-cyan-500 pb-1 text-cyan-400 text-glow-cyan"
                    : "pb-1 text-muted"
                }
              >
                {c.id} {c.nav}
              </span>
            );
          })}
        </nav>
      </header>

      {/* Left chapter panel */}
      <div className="absolute left-6 top-1/2 max-w-[28rem] -translate-y-1/2 md:left-10">
        <div className="mb-3 text-[0.7rem] tracking-[0.3em] text-cyan-400">
          {active === WORLD_CHAPTERS.length - 1
            ? "FINAL CHAPTER"
            : `CHAPTER ${chapter.id} OF ${WORLD_CHAPTERS.length}`}
        </div>
        <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-text md:text-7xl">
          {chapter.title}
        </h1>
        <p className="mt-4 max-w-md font-sans text-base text-cyan-200/80">
          {chapter.subtitle}
        </p>
      </div>

      {/* Bottom progress + prompt */}
      <footer className="absolute inset-x-0 bottom-0 px-6 pb-6 md:px-10">
        <div className="mb-3 text-center text-[0.65rem] tracking-[0.4em] text-muted">
          SCROLL TO EXPLORE
        </div>
        <div className="mx-auto h-px w-full max-w-3xl bg-white/10">
          <div
            ref={barRef}
            className="h-px bg-cyan-500 glow-cyan"
            style={{ width: "0%" }}
          />
        </div>
      </footer>
    </div>
  );
}
