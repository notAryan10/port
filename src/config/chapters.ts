import type { Vector3Tuple } from "three";

export type Accent = "cyan" | "purple";

export interface Chapter {
  /** Nav id, e.g. "01" */
  id: string;
  /** Short nav label */
  nav: string;
  /** Full title shown in HUD */
  title: string;
  subtitle: string;
  accent: Accent;
  /** World-space center of this scene's placeholder cluster (greybox). */
  cluster: Vector3Tuple;
  /** Camera pose when this chapter is centered. Rig lerps between poses. */
  camera: {
    position: Vector3Tuple;
    lookAt: Vector3Tuple;
  };
}

/**
 * Phase 0 greybox layout. Scenes are strung through 3D space so flying the
 * camera between them visibly demonstrates scroll → camera sync. In Phase 1+
 * these become discrete mount/unmount scenes per the Option-B architecture
 * (see docs/camera-spec.md); the metadata + camera poses carry over.
 */
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
    camera: { position: [8, 3, -29], lookAt: [0, 0, -40] },
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

export const ACCENT_HEX: Record<Accent, string> = {
  cyan: "#00d9ff",
  purple: "#8a2eff",
};
