"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { CHAPTERS, ACCENT_HEX, ORIGIN_INDEX, type Chapter } from "@/config/chapters";
import OriginScene from "./scenes/OriginScene";

/** Deterministic pseudo-random so clusters are stable between renders. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Block {
  position: [number, number, number];
  scale: number;
}

function ClusterMesh({ chapter, index }: { chapter: Chapter; index: number }) {
  const group = useRef<Group>(null);
  const color = ACCENT_HEX[chapter.accent];

  const blocks = useMemo<Block[]>(() => {
    const rng = mulberry32(index * 1009 + 7);
    const count = 28;
    return Array.from({ length: count }, () => {
      const spread = 7;
      return {
        position: [
          (rng() - 0.5) * spread * 2,
          (rng() - 0.5) * spread,
          (rng() - 0.5) * spread * 2,
        ],
        scale: 0.6 + rng() * 1.8,
      };
    });
  }, [index]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.08;
  });

  return (
    <group position={chapter.cluster}>
      {/* Core block — the "you are here" anchor of each greybox cluster. */}
      <mesh>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
      {/* Orbiting fragments. */}
      <group ref={group}>
        {blocks.map((b, i) => (
          <mesh key={i} position={b.position} scale={b.scale}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.35}
              metalness={0.2}
              roughness={0.6}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function PlaceholderWorld() {
  return (
    <>
      {CHAPTERS.map((chapter, index) => {
        // Intro (index 0): real autoplay world-gen scene is TBD — render nothing
        // for now so its greybox cubes don't sit on top of the spawn camera.
        if (index === 0) return null;
        if (index === ORIGIN_INDEX) return <OriginScene key={chapter.id} />;
        return <ClusterMesh key={chapter.id} chapter={chapter} index={index} />;
      })}
    </>
  );
}
