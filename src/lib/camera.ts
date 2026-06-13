import { Vector3 } from "three";
import { CHAPTERS, type Pose } from "@/config/chapters";
import { easeInOutCubic } from "@/lib/scroll";

interface Keyframe {
  t: number;
  position: Vector3;
  lookAt: Vector3;
}

/**
 * Flattens every chapter's pose(s) into one global keyframe timeline. Each
 * chapter owns an equal 1/n slice; a pose's local `at` maps to global
 * t = (chapterIndex + at) / n. Chapters without a `path` contribute a single
 * pose at their slice center.
 */
function buildKeyframes(): Keyframe[] {
  const n = CHAPTERS.length;
  const kfs: Keyframe[] = [];
  CHAPTERS.forEach((chapter, i) => {
    const poses: Pose[] =
      chapter.path ?? [
        { position: chapter.camera.position, lookAt: chapter.camera.lookAt, at: 0.5 },
      ];
    for (const pose of poses) {
      const at = pose.at ?? 0.5;
      kfs.push({
        t: (i + at) / n,
        position: new Vector3(...pose.position),
        lookAt: new Vector3(...pose.lookAt),
      });
    }
  });
  return kfs.sort((a, b) => a.t - b.t);
}

const KEYFRAMES = buildKeyframes();

/** Samples the camera pose at a given global progress into the out-vectors. */
export function sampleCamera(progress: number, outPos: Vector3, outLook: Vector3) {
  const first = KEYFRAMES[0];
  const last = KEYFRAMES[KEYFRAMES.length - 1];

  if (progress <= first.t) {
    outPos.copy(first.position);
    outLook.copy(first.lookAt);
    return;
  }
  if (progress >= last.t) {
    outPos.copy(last.position);
    outLook.copy(last.lookAt);
    return;
  }

  let j = 0;
  while (j < KEYFRAMES.length - 1 && KEYFRAMES[j + 1].t <= progress) j++;
  const a = KEYFRAMES[j];
  const b = KEYFRAMES[j + 1];
  const f = easeInOutCubic((progress - a.t) / (b.t - a.t));
  outPos.copy(a.position).lerp(b.position, f);
  outLook.copy(a.lookAt).lerp(b.lookAt, f);
}
