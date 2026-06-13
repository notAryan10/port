export type Vec3 = [number, number, number];

export interface IslandData {
  /** Top surface blocks. */
  grass: Vec3[];
  /** Body blocks below the surface, tapering to a point at the center. */
  stone: Vec3[];
  /** Emissive accent crystals (cyan). */
  cyan: Vec3[];
  /** Emissive accent crystals (purple). */
  purple: Vec3[];
}

/** Deterministic hash → [0,1) for a 2D integer coordinate. */
function rand2(x: number, z: number): number {
  let h = x * 374761393 + z * 668265263;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Smooth value noise from the integer hash. */
function noise2(x: number, z: number): number {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const xf = x - xi;
  const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = zf * zf * (3 - 2 * zf);
  const tl = rand2(xi, zi);
  const tr = rand2(xi + 1, zi);
  const bl = rand2(xi, zi + 1);
  const br = rand2(xi + 1, zi + 1);
  return lerp(lerp(tl, tr, u), lerp(bl, br, u), v);
}

/**
 * Generates a floating voxel island centered on the origin: a wobbly-edged
 * disc of terraced surface blocks over a body that deepens toward the center
 * (classic Minecraft floating-island silhouette), plus scattered emissive
 * crystals. Returns block positions grouped by material for instancing.
 */
export function generateIsland(radius = 9): IslandData {
  const grass: Vec3[] = [];
  const stone: Vec3[] = [];
  const cyan: Vec3[] = [];
  const purple: Vec3[] = [];

  for (let x = -radius; x <= radius; x++) {
    for (let z = -radius; z <= radius; z++) {
      const r = Math.hypot(x, z);
      // Wobbly island edge.
      const edge = radius - noise2(x * 0.25 + 11, z * 0.25 + 7) * 2.6;
      if (r > edge) continue;

      // Terraced surface, 0–2 blocks high.
      const top = Math.floor(noise2(x * 0.32, z * 0.32) * 2.6);
      grass.push([x, top, z]);

      // Tapered underside: deeper toward the center.
      const depth = Math.floor(2 + (1 - r / edge) * 7);
      for (let d = 1; d <= depth; d++) stone.push([x, top - d, z]);

      // Sparse surface crystals.
      const c = rand2(x + 100, z - 50);
      if (c > 0.94) cyan.push([x, top + 1, z]);
      else if (c < 0.04) purple.push([x, top + 1, z]);

      // A few crystals hanging from the underside.
      if (rand2(x - 200, z + 200) > 0.97) {
        purple.push([x, top - depth - 1, z]);
      }
    }
  }

  return { grass, stone, cyan, purple };
}
