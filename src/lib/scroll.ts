import { CHAPTERS } from "@/config/chapters";

/**
 * Single source of truth for scroll progress, written by the ScrollTrigger in
 * ScrollDriver and read every frame by the camera rig, scenes, and the HUD.
 * Plain mutable object (not React state) so 60fps reads never trigger renders.
 */
export const scrollState = {
  /** Normalized scroll across the whole experience, 0 → 1. */
  progress: 0,
};

export function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

/** Active chapter index — each chapter owns an equal 1/n slice of scroll. */
export function chapterIndexFromProgress(progress: number): number {
  const n = CHAPTERS.length;
  return Math.min(n - 1, Math.max(0, Math.floor(progress * n)));
}

/** Local 0→1 progress within a given chapter's scroll slice. */
export function chapterLocalProgress(index: number): number {
  const n = CHAPTERS.length;
  return clamp01((scrollState.progress - index / n) * n);
}

/** easeInOutCubic — smooths per-segment camera interpolation. */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
