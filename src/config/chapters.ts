import type { Vector3Tuple } from "three";

export type Accent = "cyan" | "purple";

export interface Pose {
  position: Vector3Tuple;
  lookAt: Vector3Tuple;
  /** Local position within the chapter's scroll slice, 0→1. Defaults to 0.5. */
  at?: number;
}

export interface Chapter {
  /** Nav id, e.g. "01" */
  id: string;
  /** Short nav label */
  nav: string;
  /** Full title shown in HUD */
  title: string;
  subtitle: string;
  accent: Accent;
  /** World-space center of this scene's cluster / hero asset. */
  cluster: Vector3Tuple;
  /** Single resting pose (used when no multi-keyframe path is given). */
  camera: { position: Vector3Tuple; lookAt: Vector3Tuple };
  /** Optional intra-chapter camera path; overrides `camera` when present. */
  path?: Pose[];
}

/**
 * Scenes are strung through 3D space so scroll flies the camera between them.
 * Per the Option-B architecture (docs/camera-spec.md) these become discrete
 * mount/unmount scenes; metadata + camera poses carry over. Chapter 01 (Origin)
 * is the first fully-built hero scene; the rest remain greybox clusters.
 */
const ORIGIN_CORE: Vector3Tuple = [0, 6, -40];

export const CHAPTERS: Chapter[] = [
  {
    id: "00",
    nav: "INTRO",
    title: "WORLD GENERATION",
    subtitle: "Spawning player…",
    accent: "cyan",
    cluster: [0, 0, 0],
    camera: { position: [0, 2, 14], lookAt: [0, 0, 0] },
  },
  {
    id: "01",
    nav: "ORIGIN",
    title: "ORIGIN",
    subtitle: "Every journey begins with a single block.",
    accent: "cyan",
    cluster: [0, 0, -40],
    camera: { position: [8, 6, -29], lookAt: ORIGIN_CORE },
    // Orbit the core → push in as it opens → rise, following the particles up.
    path: [
      { at: 0.0, position: [13, 6, -31], lookAt: ORIGIN_CORE },
      { at: 0.45, position: [7, 6.5, -34], lookAt: ORIGIN_CORE },
      { at: 0.75, position: [2.5, 7, -36.5], lookAt: [0, 7, -40] },
      { at: 1.0, position: [0, 17, -37.5], lookAt: [0, 26, -40] },
    ],
  },
  {
    id: "02",
    nav: "LEARNING",
    title: "LEARNING REALM",
    subtitle: "Every skill is a block. Every block builds mastery.",
    accent: "cyan",
    cluster: [30, 10, -90],
    camera: { position: [34, 14, -70], lookAt: [30, 10, -90] },
  },
  {
    id: "03",
    nav: "PROJECTS",
    title: "PROJECT CITY",
    subtitle: "Where ideas become reality.",
    accent: "cyan",
    cluster: [-20, 20, -150],
    camera: { position: [-14, 24, -130], lookAt: [-20, 20, -150] },
  },
  {
    id: "04",
    nav: "EXPERIENCE",
    title: "EXPERIENCE NETWORK",
    subtitle: "Every experience connected the dots.",
    accent: "purple",
    cluster: [0, -30, -210],
    camera: { position: [4, -22, -190], lookAt: [0, -30, -210] },
  },
  {
    id: "05",
    nav: "ACHIEVEMENTS",
    title: "ACHIEVEMENT CONSTELLATION",
    subtitle: "Milestones that shaped the journey.",
    accent: "purple",
    cluster: [40, 40, -280],
    camera: { position: [46, 44, -260], lookAt: [40, 40, -280] },
  },
  {
    id: "06",
    nav: "FINAL CHAPTER",
    title: "THE FUTURE AWAITS",
    subtitle: "I don't build projects. I build worlds.",
    accent: "cyan",
    cluster: [0, 80, -350],
    camera: { position: [0, 86, -328], lookAt: [0, 80, -350] },
  },
];

/** All scenes including the Intro (index 0) — used for world-space placement. */
export const ORIGIN_INDEX = 1;
export const ORIGIN_CORE_POSITION = ORIGIN_CORE;

/**
 * The scroll-driven chapters (Origin → Future). The Intro is an autoplay phase
 * outside the scroll range, so scroll progress 0 maps to Origin. Camera
 * keyframes, scroll height, HUD nav, and the active-chapter index all use these.
 */
export const WORLD_CHAPTERS = CHAPTERS.slice(1);
export const ORIGIN_WORLD_INDEX = 0;

export const ACCENT_HEX: Record<Accent, string> = {
  cyan: "#00d9ff",
  purple: "#8a2eff",
};
