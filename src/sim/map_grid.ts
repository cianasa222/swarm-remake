import map1Data from './map1_data.json';
import { clamp, len } from './math';

function decodeBase64(b64: string): Uint8Array {
  if (typeof atob === 'function') {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  const B = (globalThis as unknown as { Buffer: { from(s: string, enc: string): Uint8Array } }).Buffer;
  return new Uint8Array(B.from(b64, 'base64'));
}

export interface MapLandmark {
  name: string;
  wx: number;
  wz: number;
  lx: number;
  lz: number;
}

/**
 * 仓库区 180x180 可行走栅格碰撞与点位查询（1m / 格，对应原版 18000x18000）。
 * 浏览器与无头 playtest 共用同一份 map1_data.json，零异步竞态。
 */
export class WalkableMap {
  readonly size = map1Data.size;
  readonly half = map1Data.size / 2;
  readonly res = map1Data.gridRes;
  readonly grid: Uint8Array;
  readonly playerSpawn = { x: map1Data.playerSpawn.wx, z: map1Data.playerSpawn.wz };
  readonly landmarks = map1Data.landmarks as {
    fountain: MapLandmark;
    bossArena: MapLandmark;
    reksaiSpawn: MapLandmark;
    shop: MapLandmark;
    factory: MapLandmark;
  };
  readonly boxSpawns = map1Data.boxSpawns;
  readonly spireSpawns = map1Data.spireSpawns;

  constructor() {
    this.grid = decodeBase64(map1Data.walkableB64);
  }

  isWalkable(wx: number, wz: number): boolean {
    const gx = Math.floor(wx + this.half);
    const gz = Math.floor(wz + this.half);
    if (gx < 0 || gx >= this.res || gz < 0 || gz >= this.res) return false;
    return this.grid[gz * this.res + gx] === 1;
  }

  /** 圆与 1m 不可走格的平滑贴墙推出（2 次迭代避免拐角抖动） */
  resolveCircle(e: { x: number; z: number }, r: number) {
    const lim = this.half - 1 - r;
    e.x = clamp(e.x, -lim, lim);
    e.z = clamp(e.z, -lim, lim);

    for (let iter = 0; iter < 2; iter++) {
      const gx0 = Math.max(0, Math.floor(e.x - r + this.half));
      const gx1 = Math.min(this.res - 1, Math.floor(e.x + r + this.half));
      const gz0 = Math.max(0, Math.floor(e.z - r + this.half));
      const gz1 = Math.min(this.res - 1, Math.floor(e.z + r + this.half));

      for (let gz = gz0; gz <= gz1; gz++) {
        for (let gx = gx0; gx <= gx1; gx++) {
          if (this.grid[gz * this.res + gx] === 1) continue;
          const x0 = gx - this.half;
          const z0 = gz - this.half;
          const nx = clamp(e.x, x0, x0 + 1);
          const nz = clamp(e.z, z0, z0 + 1);
          const dx = e.x - nx;
          const dz = e.z - nz;
          const d = len(dx, dz);
          if (d < r) {
            if (d > 1e-4) {
              e.x = nx + (dx / d) * r;
              e.z = nz + (dz / d) * r;
            } else {
              // 圆心落在不可走格内：朝最近边推出
              const cx = x0 + 0.5;
              const cz = z0 + 0.5;
              const ox = 0.5 - Math.abs(e.x - cx);
              const oz = 0.5 - Math.abs(e.z - cz);
              if (ox < oz) e.x = cx + Math.sign(e.x - cx || 1) * (0.5 + r);
              else e.z = cz + Math.sign(e.z - cz || 1) * (0.5 + r);
            }
          }
        }
      }
    }
  }

  /** 在围绕 (cx, cz) 的 [minR, maxR] 环形区域内采样可行走出生点 */
  findWalkableAround(cx: number, cz: number, minR: number, maxR: number, rand: () => number): { x: number; z: number } {
    for (let i = 0; i < 24; i++) {
      const a = rand() * Math.PI * 2;
      const r = minR + rand() * (maxR - minR);
      const x = cx + Math.cos(a) * r;
      const z = cz + Math.sin(a) * r;
      if (this.isWalkable(x, z)) return { x, z };
    }
    // 放宽半径回退（确保不卡死在走廊或边缘）
    for (let rad = minR * 0.6; rad <= maxR + 18; rad += 4) {
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2 + rand() * 0.25;
        const x = cx + Math.cos(a) * rad;
        const z = cz + Math.sin(a) * rad;
        if (this.isWalkable(x, z)) return { x, z };
      }
    }
    return { x: this.playerSpawn.x, z: this.playerSpawn.z };
  }
}
