"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { Vector3 } from "three";
import { scrollState } from "@/lib/scroll";
import { sampleCamera } from "@/lib/camera";
import { getPhase } from "@/lib/phase";

/**
 * Flies the camera along the global keyframe timeline based on scroll progress,
 * then critically-damps toward it so fast scroll flicks never snap.
 */
export default function CameraRig() {
  const camera = useThree((s) => s.camera);
  const target = useRef(new Vector3());
  const desiredPos = useRef(new Vector3());
  const desiredLook = useRef(new Vector3());
  const init = useRef(false);

  useFrame((_, delta) => {
    // During the intro autoplay, IntroWorld owns the camera.
    if (getPhase() !== "world") return;

    sampleCamera(scrollState.progress, desiredPos.current, desiredLook.current);

    if (!init.current) {
      camera.position.copy(desiredPos.current);
      target.current.copy(desiredLook.current);
      init.current = true;
    }

    const damp = 1 - Math.exp(-6 * delta);
    camera.position.lerp(desiredPos.current, damp);
    target.current.lerp(desiredLook.current, damp);
    camera.lookAt(target.current);
  });

  return null;
}
