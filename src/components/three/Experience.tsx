"use client";

import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import CameraRig from "./CameraRig";
import PlaceholderWorld from "./PlaceholderWorld";

/**
 * Fixed full-viewport WebGL layer. The HUD and scroll spacer sit above it in
 * the DOM; this just renders the world and is driven entirely by scroll
 * progress via CameraRig.
 */
export default function Experience() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ fov: 45, near: 0.1, far: 2000, position: [0, 2, 14] }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#050816"]} />
        <fog attach="fog" args={["#050816", 30, 220]} />

        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 10]} intensity={0.6} />
        <pointLight position={[0, 10, 0]} intensity={120} color="#00d9ff" />

        <Stars radius={300} depth={120} count={4000} factor={5} fade speed={0.5} />

        <PlaceholderWorld />
        <CameraRig />
      </Canvas>
    </div>
  );
}
