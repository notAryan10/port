"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { Vector3 } from "three";
import { CHAPTERS } from "@/config/chapters";
import { scrollState, easeInOutCubic } from "@/lib/scroll";

const poses = CHAPTERS.map((c) => ({
  position: new Vector3(...c.camera.position),
  lookAt: new Vector3(...c.camera.lookAt),
}));

/**
 * Flies the camera along the chapter poses based on scrollState.progress.
 * Progress 0→1 maps across (n-1) segments; within each segment we ease and
 * lerp both position and look-at target. Damped so scroll flicks feel smooth.
 */
export default function CameraRig() {
  const camera = useThree((s) => s.camera);
  const target = useRef(new Vector3().copy(poses[0].lookAt));
  const desiredPos = useRef(new Vector3().copy(poses[0].position));
  const desiredLook = useRef(new Vector3().copy(poses[0].lookAt));

  useFrame((_, delta) => {
    const segments = poses.length - 1;
    const scaled = scrollState.progress * segments;
    const i = Math.min(segments - 1, Math.floor(scaled));
    const f = easeInOutCubic(scaled - i);

    desiredPos.current.copy(poses[i].position).lerp(poses[i + 1].position, f);
    desiredLook.current.copy(poses[i].lookAt).lerp(poses[i + 1].lookAt, f);

    // Critically-damped follow so the camera never snaps on fast scroll.
    const damp = 1 - Math.exp(-6 * delta);
    camera.position.lerp(desiredPos.current, damp);
    target.current.lerp(desiredLook.current, damp);
    camera.lookAt(target.current);
  });

  return null;
}
