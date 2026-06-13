/**
 * Shared intro timeline state, animated by GSAP in IntroWorld and read by the
 * in-canvas content, the camera, and the DOM overlay. Plain mutable object so
 * 60fps reads never trigger React renders.
 */
export const introState = {
  /** Autoplay progress of the world-gen sequence, 0 → 1. */
  t: 0,
  /** Beacon-dive progress once the user enters, 0 → 1. */
  dive: 0,
};

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
