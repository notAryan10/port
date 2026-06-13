"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
} from "three";
import { introState, smoothstep } from "@/lib/intro";
import { setPhase } from "@/lib/phase";

const CYAN = "#00d9ff";
const matrix = new Matrix4();
const DURATION = 6.5; // seconds for the autoplay world-gen
const DIVE_DURATION = 1.1; // seconds for the beacon dive

interface Chunk {
  position: [number, number, number];
  delay: number;
}

/**
 * The autoplay world-gen sequence. Timing is driven off R3F's frame delta
 * (introState.t 0→1): a single voxel glows in, chunks spawn outward into low
 * terrain, and a beacon erupts skyward while the camera dollies into a slow
 * orbit. The first user input starts the beacon dive (introState.dive 0→1)
 * which, under a white flash, hands control to the scroll-driven world.
 */
export default function IntroWorld() {
  const camera = useThree((s) => s.camera);
  const chunkRef = useRef<InstancedMesh>(null);
  const beaconRef = useRef<Mesh>(null);
  const voxelRef = useRef<Mesh>(null);

  const diving = useRef(false);
  const handedOff = useRef(false);
  const flashEl = useRef<HTMLElement | null>(null);

  const chunks = useMemo<Chunk[]>(() => {
    const out: Chunk[] = [];
    const count = 280;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 3 + Math.random() * 19;
      out.push({
        position: [Math.cos(a) * r, -2 + Math.random() * 2.5, Math.sin(a) * r],
        delay: (r / 22) * 0.7 + Math.random() * 0.1,
      });
    }
    return out;
  }, []);

  useLayoutEffect(() => {
    introState.t = 0;
    introState.dive = 0;
    flashEl.current = document.getElementById("intro-flash");
    const mesh = chunkRef.current;
    if (mesh) {
      matrix.makeScale(0, 0, 0);
      for (let i = 0; i < chunks.length; i++) mesh.setMatrixAt(i, matrix);
      mesh.instanceMatrix.needsUpdate = true;
    }
  }, [chunks]);

  // First input after the sequence settles → begin the beacon dive.
  useEffect(() => {
    const onInput = () => {
      if (diving.current || introState.t < 0.98) return;
      diving.current = true;
    };
    window.addEventListener("wheel", onInput, { passive: true });
    window.addEventListener("touchstart", onInput, { passive: true });
    window.addEventListener("keydown", onInput);
    window.addEventListener("pointerdown", onInput);
    return () => {
      window.removeEventListener("wheel", onInput);
      window.removeEventListener("touchstart", onInput);
      window.removeEventListener("keydown", onInput);
      window.removeEventListener("pointerdown", onInput);
    };
  }, []);

  useFrame((_, delta) => {
    // Advance timeline / dive off the render clock.
    if (!diving.current) {
      introState.t = Math.min(1, introState.t + delta / DURATION);
    } else {
      introState.dive = Math.min(1, introState.dive + delta / DIVE_DURATION);
      if (flashEl.current)
        flashEl.current.style.opacity = String(
          smoothstep(0.45, 1, introState.dive),
        );
      if (introState.dive >= 1 && !handedOff.current) {
        handedOff.current = true;
        setPhase("world");
        if (flashEl.current) {
          flashEl.current.style.transition = "opacity 0.6s ease";
          flashEl.current.style.opacity = "0";
        }
      }
    }

    const t = introState.t;
    const dive = introState.dive;

    // Camera: dolly in (radius shrinks), rise, then slow orbit.
    const orbit = smoothstep(0.45, 1, t) * 0.8;
    const radius = 24 - smoothstep(0, 1, t) * 9;
    const height = 3 + smoothstep(0.3, 1, t) * 4.5;
    let cx = Math.sin(orbit) * radius;
    let cy = height;
    let cz = Math.cos(orbit) * radius;
    let ly = 2 + smoothstep(0.4, 1, t) * 3;

    if (dive > 0) {
      const d = dive * dive; // ease-in dive into the beacon shaft
      cx *= 1 - d;
      cz = cz * (1 - d) + 1.5 * d;
      cy = height * (1 - d) + 55 * d;
      ly = ly * (1 - d) + 60 * d;
    }
    camera.position.set(cx, cy, cz);
    camera.lookAt(0, ly, 0);

    // Single voxel glows in early, fades as chunks take over.
    if (voxelRef.current) {
      const mat = voxelRef.current.material as MeshBasicMaterial;
      mat.opacity = smoothstep(0.04, 0.18, t) * (1 - smoothstep(0.45, 0.7, t));
      voxelRef.current.scale.setScalar(0.6 + Math.sin(t * 40) * 0.04);
    }

    // Chunks spawn outward, staggered by radius.
    const grow = smoothstep(0.4, 0.9, t);
    const mesh = chunkRef.current;
    if (mesh) {
      for (let i = 0; i < chunks.length; i++) {
        const c = chunks[i];
        const s = Math.min(1, Math.max(0, (grow - c.delay) / 0.25));
        matrix.makeScale(s, s, s);
        matrix.setPosition(c.position[0], c.position[1], c.position[2]);
        mesh.setMatrixAt(i, matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }

    // Beacon erupts.
    const bH = smoothstep(0.6, 0.98, t) * 60;
    if (beaconRef.current) {
      beaconRef.current.scale.set(1, Math.max(bH, 0.001), 1);
      beaconRef.current.position.y = bH / 2;
    }
  });

  return (
    <group>
      <mesh ref={voxelRef} position={[0, 2, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0} toneMapped={false} />
      </mesh>

      <instancedMesh ref={chunkRef} args={[undefined, undefined, chunks.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#1f6f86"
          emissive="#0d3346"
          emissiveIntensity={0.4}
          metalness={0.1}
          roughness={0.7}
        />
      </instancedMesh>

      {/* Beacon shaft (scales up from the base). */}
      <mesh ref={beaconRef} position={[0, 0, 0]}>
        <boxGeometry args={[1.1, 1, 1.1]} />
        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={0.7}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      {/* Beacon base glow. */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 1, 2]} />
        <meshBasicMaterial color={CYAN} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 4, 0]} color={CYAN} intensity={60} distance={40} />
    </group>
  );
}
