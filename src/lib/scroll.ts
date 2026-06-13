import { CHAPTERS } from "@/config/chapters";

/**
 * Single source of truth for scroll progress, written by the ScrollTrigger in
 * ScrollDriver and read every frame by the camera rig and the HUD. Kept as a
 * plain mutable object (not React state) so 60fps reads never trigger renders.
 */
export const scrollState = {
  /** Normalized scroll across the whole experience, 0 → 1. */
  progress: 0,
};

/** Active chapter index derived from progress (n-1 segments between poses). */
export function chapterIndexFromProgress(progress: number): number {
  const segments = CHAPTERS.length - 1;
  const idx = Math.round(progress * segments);
  return Math.min(CHAPTERS.length - 1, Math.max(0, idx));
}

/** easeInOutCubic — smooths the per-segment camera interpolation. */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
