"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  Color,
  DoubleSide,
  InstancedMesh,
  Matrix4,
  Mesh,
  Points,
  ShaderMaterial,
} from "three";
import { generateIsland, type Vec3 } from "@/lib/voxelIsland";
import { chapterLocalProgress, clamp01 } from "@/lib/scroll";
import { CHAPTERS, ORIGIN_INDEX, ORIGIN_WORLD_INDEX } from "@/config/chapters";

const CYAN = "#00d9ff";
const PURPLE = "#8a2eff";
const localProgress = () => chapterLocalProgress(ORIGIN_WORLD_INDEX);

/** Instanced set of unit blocks at the given positions. */
function Blocks({
  positions,
  color,
  emissive,
  emissiveIntensity,
}: {
  positions: Vec3[];
  color: string;
  emissive: string;
  emissiveIntensity: number;
}) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new Matrix4();
    positions.forEach((p, i) => {
      m.setPosition(p[0], p[1], p[2]);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [positions]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, positions.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        metalness={0.1}
        roughness={0.75}
      />
    </instancedMesh>
  );
}

const coreVertex = /* glsl */ `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const coreFragment = /* glsl */ `
  varying vec3 vPos;
  uniform float uOpen;
  uniform vec3 uColor;
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  void main() {
    float n = hash(floor(vPos * 4.0));
    float threshold = uOpen * 1.15;
    if (n < threshold - 0.06) discard;            // dissolved away
    float rim = smoothstep(threshold - 0.06, threshold + 0.12, n);
    vec3 col = mix(uColor * 2.4, uColor * 0.5, rim); // bright at the opening edge
    gl_FragColor = vec4(col, 1.0);
  }
`;

/** Glowing core block whose shell dissolves open as the chapter progresses. */
function Core() {
  const shellRef = useRef<ShaderMaterial>(null);
  const innerRef = useRef<Mesh>(null);
  const uniforms = useMemo(
    () => ({ uOpen: { value: 0 }, uColor: { value: new Color(CYAN) } }),
    [],
  );

  useFrame((state) => {
    const lp = localProgress();
    const open = clamp01((lp - 0.35) / 0.5); // opens from 35%→85% of the chapter
    if (shellRef.current) shellRef.current.uniforms.uOpen.value = open;
    if (innerRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.06;
      innerRef.current.scale.setScalar((0.4 + open * 0.5) * pulse);
    }
  });

  return (
    <group position={[0, 6, 0]}>
      {/* Outer dissolving shell */}
      <mesh>
        <boxGeometry args={[2.4, 2.4, 2.4]} />
        <shaderMaterial
          ref={shellRef}
          vertexShader={coreVertex}
          fragmentShader={coreFragment}
          uniforms={uniforms}
          side={DoubleSide}
          transparent
        />
      </mesh>
      {/* Bright inner core */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={CYAN} toneMapped={false} />
      </mesh>
      <pointLight color={CYAN} intensity={40} distance={30} />
    </group>
  );
}

/** Holographic memory planes that fan out inside the core as it opens. */
function Memories() {
  const group = useRef<Mesh[]>([]);
  const count = 5;
  const planes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        return { x: Math.cos(a) * 2.6, z: Math.sin(a) * 2.6, ry: -a };
      }),
    [],
  );

  useFrame(() => {
    const lp = localProgress();
    const reveal = clamp01((lp - 0.5) / 0.35);
    group.current.forEach((m, i) => {
      if (!m) return;
      const d = clamp01(reveal - i * 0.08);
      m.scale.set(d * 1.4, d * 1.9, 1);
      (m.material as unknown as { opacity: number }).opacity = d * 0.85;
    });
  });

  return (
    <group position={[0, 6.5, 0]}>
      {planes.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) group.current[i] = el;
          }}
          position={[p.x, 0, p.z]}
          rotation={[0, p.ry, 0]}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            color={i % 2 ? PURPLE : CYAN}
            transparent
            opacity={0}
            side={DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Particles that escape the core and stream upward late in the chapter. */
function AscendingParticles() {
  const ref = useRef<Points>(null);
  const count = 260;
  const data = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = 6 + Math.random() * 4;
      positions[i * 3 + 2] = Math.sin(a) * r;
      speeds[i] = 2 + Math.random() * 4;
    }
    return { positions, speeds };
  }, []);

  useFrame((_, delta) => {
    const points = ref.current;
    if (!points) return;
    const lp = localProgress();
    const emit = clamp01((lp - 0.6) / 0.4);
    const attr = points.geometry.getAttribute("position") as BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += data.speeds[i] * delta * emit;
      if (arr[i * 3 + 1] > 30) arr[i * 3 + 1] = 6;
    }
    attr.needsUpdate = true;
    (points.material as unknown as { opacity: number }).opacity = emit * 0.9;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[data.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={CYAN}
        size={0.16}
        sizeAttenuation
        transparent
        opacity={0}
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

export default function OriginScene() {
  const island = useMemo(() => generateIsland(9), []);
  const cluster = CHAPTERS[ORIGIN_INDEX].cluster;

  return (
    <group position={cluster}>
      <Blocks
        positions={island.stone}
        color="#16233f"
        emissive="#0a1830"
        emissiveIntensity={0.25}
      />
      <Blocks
        positions={island.grass}
        color="#1f5c5a"
        emissive="#0d3a3a"
        emissiveIntensity={0.3}
      />
      <Blocks
        positions={island.cyan}
        color={CYAN}
        emissive={CYAN}
        emissiveIntensity={1.4}
      />
      <Blocks
        positions={island.purple}
        color={PURPLE}
        emissive={PURPLE}
        emissiveIntensity={1.4}
      />
      <Core />
      <Memories />
      <AscendingParticles />
    </group>
  );
}
