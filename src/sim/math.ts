export interface Vec2 { x: number; z: number }

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function len(x: number, z: number) {
  return Math.sqrt(x * x + z * z);
}

export function angleDiff(a: number, b: number) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/** 可复现随机数（mulberry32），便于自动试玩复现 */
export function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 线段 p0→p1（带半径 pr）与圆 c（半径 r）首次接触的参数 t∈[0,1]，无接触返回 -1 */
export function sweepCircle(
  x0: number, z0: number, x1: number, z1: number, pr: number,
  cx: number, cz: number, r: number,
): number {
  const dx = x1 - x0, dz = z1 - z0;
  const fx = x0 - cx, fz = z0 - cz;
  const R = pr + r;
  const a = dx * dx + dz * dz;
  const c = fx * fx + fz * fz - R * R;
  if (c <= 0) return 0; // 起点已重叠
  if (a < 1e-9) return -1;
  const b = 2 * (fx * dx + fz * dz);
  const disc = b * b - 4 * a * c;
  if (disc < 0) return -1;
  const t = (-b - Math.sqrt(disc)) / (2 * a);
  return t >= 0 && t <= 1 ? t : -1;
}

/** 点到线段距离 */
export function distToSegment(px: number, pz: number, x0: number, z0: number, x1: number, z1: number) {
  const dx = x1 - x0, dz = z1 - z0;
  const l2 = dx * dx + dz * dz;
  let t = l2 > 0 ? ((px - x0) * dx + (pz - z0) * dz) / l2 : 0;
  t = clamp(t, 0, 1);
  return len(px - (x0 + dx * t), pz - (z0 + dz * t));
}
