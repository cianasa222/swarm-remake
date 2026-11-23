/**
 * Q-30：战兔巨爆（14.14 原版 StarStrike）逐层渲染（Three.js，现行渲染器）。
 *
 * - 落点：每个未结算的 `orbital_strike` 区域按原版 4 层绘制（普通 / 进化普通 / 进化大落点三套颜色），
 *   时间轴对齐为"各层缩放归零 = 命中"（TARGET_LEAD）。不存状态，每帧直接由区域的 t / dur 计算。
 * - 爆炸：`spawnExplosion()` 由 vfx.ts 的 explode(kind='orbital') 事件触发，按原版 9 层绘制；
 *   粒子不存状态：每个爆炸只记 位置 / 年龄 / 种子，各粒子的随机量由种子算出（零 GC）。
 * - 每层一个 InstancedMesh（落点 4 + 爆炸 9 = 13 次绘制，与数量无关）。
 *
 * 数据与换算见 `starstrike_14_14.ts`。只改画面，不改伤害 / 时机 / 判定。
 * ⚠️ 未编译、未实机验收（Quick AI 环境没有 TypeScript / WebGL）。
 */
import * as THREE from 'three';
import type { Game } from '../sim/game';
import { getTexture, loadScbGeo } from './assets';
import {
  STARSTRIKE_14_14, STARSTRIKE_TEX, STARSTRIKE_MESH, STAR_UNITS, TARGET_LEAD,
  type StarLayer, type StarSystemKey,
  sampleCurve, sampleTable, rand01, emitTimes, particleLife, systemDuration, dragDisp, srgbToLinear,
} from './starstrike_14_14';

const VERT = /* glsl */ `
attribute vec4 aColor;
attribute vec4 aUv;
attribute vec4 aMisc;
uniform float uMode;
varying vec2 vUv;
varying vec2 vUv2;
varying vec4 vColor;
void main() {
  vColor = aColor;
  vUv = uv * aUv.zw + aUv.xy;
  vec2 c = uv - 0.5;
  float s = sin(aMisc.x);
  float co = cos(aMisc.x);
  vUv2 = vec2(co * c.x - s * c.y, s * c.x + co * c.y) + 0.5;
  vec4 wp;
  if (uMode < 0.5) {
    wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
  } else {
    // 绕轴朝向镜头：轴 = instanceMatrix 第 2 列（长度 = 高），宽 = 第 1 列长度
    vec3 ctr = (modelMatrix * vec4(instanceMatrix[3].xyz, 1.0)).xyz;
    vec3 ax = instanceMatrix[1].xyz;
    float h = length(ax);
    if (h > 1e-5) { ax = ax / h; } else { ax = vec3(0.0, 1.0, 0.0); }
    float w = length(instanceMatrix[0].xyz);
    vec3 toCam = normalize(cameraPosition - ctr);
    vec3 rt = cross(ax, toCam);
    float rl = length(rt);
    if (rl > 1e-4) { rt = rt / rl; } else { rt = vec3(1.0, 0.0, 0.0); }
    wp = vec4(ctr + rt * position.x * w + ax * position.y * h, 1.0);
  }
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const FRAG = /* glsl */ `
uniform sampler2D uMap;
uniform sampler2D uMult;
uniform float uHasMult;
uniform float uMultFlipV;
varying vec2 vUv;
varying vec2 vUv2;
varying vec4 vColor;
void main() {
  vec4 t = texture2D(uMap, vUv);
  if (uHasMult > 0.5) {
    vec2 m = clamp(vUv2, 0.0, 1.0);
    if (uMultFlipV > 0.5) m.y = 1.0 - m.y;
    t *= texture2D(uMult, m);
  }
  vec4 col = t * vColor;
  if (col.a < 0.003) discard;
  gl_FragColor = col;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

interface Batch {
  mesh: THREE.InstancedMesh;
  aColor: THREE.InstancedBufferAttribute;
  aUv: THREE.InstancedBufferAttribute;
  aMisc: THREE.InstancedBufferAttribute;
  cap: number;
  n: number;
}

interface Blast { x: number; z: number; k: number; age: number; seed: number; active: boolean }

const TARGET_CAP = 32;
const BLAST_CAP = 24;
const DEG = Math.PI / 180;

const M4 = new THREE.Matrix4();
const Q4 = new THREE.Quaternion();
const P3 = new THREE.Vector3();
const S3 = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const tS: number[] = [1, 1, 1];
const tC: number[] = [1, 1, 1, 1];

/** 渲染顺序：按原版 pass（0–12 地面 / 网格，200+ 天空光柱最后画） */
function orderOf(L: StarLayer): number {
  return L.pass >= 200 ? 17 + (L.pass - 200) * 0.5 : 6 + L.pass * 0.5;
}

function needsRepeat(L: StarLayer): boolean {
  const u = L.uv;
  if (!u) return false;
  return !!(u.scroll || u.scale || (u.div && (u.div[0] < 1 || u.div[1] < 1)) || u.offset);
}

function attachInst(geo: THREE.BufferGeometry, b: Pick<Batch, 'aColor' | 'aUv' | 'aMisc'>) {
  geo.setAttribute('aColor', b.aColor);
  geo.setAttribute('aUv', b.aUv);
  geo.setAttribute('aMisc', b.aMisc);
}

export class StarStrikeVfx {
  readonly root = new THREE.Group();
  /** 落点 4 层（三套落点系统层结构、贴图一致，只是颜色不同，共用合批） */
  private targetBatches: Batch[] = [];
  private explBatches: Batch[] = [];
  private explTimes: number[][] = [];
  private blasts: Blast[] = [];
  private blastDur: number;
  private seedN = 1;

  constructor(parent: THREE.Group) {
    parent.add(this.root);
    const tgt = STARSTRIKE_14_14.target.layers;
    for (const L of tgt) this.targetBatches.push(this.mkBatch(L, TARGET_CAP));
    const ex = STARSTRIKE_14_14.explosion.layers;
    for (const L of ex) {
      const ts = emitTimes(L);
      this.explTimes.push(ts);
      this.explBatches.push(this.mkBatch(L, BLAST_CAP * ts.length));
    }
    this.blastDur = systemDuration(STARSTRIKE_14_14.explosion);
    for (let i = 0; i < BLAST_CAP; i++) this.blasts.push({ x: 0, z: 0, k: 1, age: 0, seed: 0, active: false });
  }

  private mkBatch(L: StarLayer, cap: number): Batch {
    const aColor = new THREE.InstancedBufferAttribute(new Float32Array(cap * 4), 4).setUsage(THREE.DynamicDrawUsage);
    const aUv = new THREE.InstancedBufferAttribute(new Float32Array(cap * 4), 4).setUsage(THREE.DynamicDrawUsage);
    const aMisc = new THREE.InstancedBufferAttribute(new Float32Array(cap * 4), 4).setUsage(THREE.DynamicDrawUsage);
    const holder = { aColor, aUv, aMisc };

    let geo: THREE.BufferGeometry;
    if (L.prim === 'ground') {
      geo = new THREE.PlaneGeometry(1, 1);
      geo.rotateX(-Math.PI / 2);
    } else if (L.prim === 'ray') {
      geo = new THREE.PlaneGeometry(1, 1);
      geo.translate(0, 0.5, 0); // 底部在发射点
    } else if (L.prim === 'axial') {
      geo = new THREE.PlaneGeometry(1, 1);
    } else if (L.mesh === 'lightInside') {
      // 占位：原版 Strawberry_StarStrike_Light_Inside.scb 尚未转换进项目；用开口圆柱（网格单位，约 0.9 m 半径 × 1.3 m 高 @ 缩放 1）
      geo = new THREE.CylinderGeometry(700, 700, 1000, 24, 1, true);
      geo.translate(0, 500, 0);
    } else {
      geo = new THREE.BufferGeometry(); // 等网格加载
    }
    attachInst(geo, holder);

    const repeat = needsRepeat(L);
    const map = getTexture(STARSTRIKE_TEX[L.tex], { repeat });
    const mult = L.mult ? getTexture(STARSTRIKE_TEX[L.mult.tex]) : map;
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uMap: { value: map },
        uMult: { value: mult },
        uHasMult: { value: L.mult ? 1 : 0 },
        uMultFlipV: { value: L.mult?.flipV ? 1 : 0 },
        uMode: { value: L.prim === 'ray' || L.prim === 'axial' ? 1 : 0 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
      blending: L.blend === 'add' ? THREE.AdditiveBlending : THREE.NormalBlending,
    });

    const mesh = new THREE.InstancedMesh(geo, mat, cap);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    mesh.count = 0;
    mesh.renderOrder = orderOf(L);
    this.root.add(mesh);
    const b: Batch = { mesh, aColor, aUv, aMisc, cap, n: 0 };

    if (L.prim === 'mesh') {
      if (L.mesh === 'burst') mesh.visible = false;
      loadScbGeo(STARSTRIKE_MESH[L.mesh ?? 'burst'])
        .then((g) => {
          const c = g.clone();
          attachInst(c, holder);
          const old = mesh.geometry;
          mesh.geometry = c;
          old.dispose();
          mesh.visible = true;
        })
        .catch(() => { /* lightInside 缺失时保留圆柱占位；burst 缺失时该层不显示 */ });
    }
    return b;
  }

  /** vfx.ts 收到 explode(kind='orbital') 时调用；radius = 实际爆炸半径（含范围加成 / 进化大落点） */
  spawnExplosion(x: number, z: number, radius: number) {
    const b = this.blasts.find((v) => !v.active);
    if (!b) return;
    b.active = true;
    b.x = x; b.z = z;
    b.k = Math.max(0.25, radius / STAR_UNITS.baseRadius);
    b.age = 0;
    b.seed = Math.imul(this.seedN++, 0x9e3779b1) >>> 0;
  }

  update(g: Game, dt: number) {
    for (const b of this.targetBatches) b.n = 0;
    for (const b of this.explBatches) b.n = 0;

    // 1. 落点
    for (const z of g.weaponZones) {
      if (z.kind !== 'orbital_strike' || z.resolved) continue;
      const tl = z.t - (z.dur - TARGET_LEAD);
      if (tl < 0) continue;
      const main = z.evolved && Math.abs(z.r - 3.6 * g.areaMul) < 1e-3;
      const key: StarSystemKey = !z.evolved ? 'target' : main ? 'targetEvolveMain' : 'targetEvolve';
      const layers = STARSTRIKE_14_14[key].layers;
      const seed = (Math.floor(z.x * 1000) * 73856093) ^ (Math.floor(z.z * 1000) * 19349663) ^ Math.floor(z.dur * 1000);
      const k = Math.max(0.25, z.r / STAR_UNITS.baseRadius);
      for (let li = 0; li < layers.length && li < this.targetBatches.length; li++) {
        this.put(this.targetBatches[li], layers[li], z.x, z.z, k, tl, seed >>> 0, li, 0);
      }
    }

    // 2. 爆炸
    const ex = STARSTRIKE_14_14.explosion.layers;
    for (const bl of this.blasts) {
      if (!bl.active) continue;
      bl.age += dt;
      if (bl.age > this.blastDur) { bl.active = false; continue; }
      for (let li = 0; li < ex.length; li++) {
        const ts = this.explTimes[li];
        for (let pi = 0; pi < ts.length; pi++) {
          this.put(this.explBatches[li], ex[li], bl.x, bl.z, bl.k, bl.age - ts[pi], bl.seed, li, pi);
        }
      }
    }

    for (const b of this.targetBatches) this.flush(b);
    for (const b of this.explBatches) this.flush(b);
  }

  private flush(b: Batch) {
    b.mesh.count = b.n;
    if (b.n === 0) return;
    b.mesh.instanceMatrix.needsUpdate = true;
    b.aColor.needsUpdate = true;
    b.aUv.needsUpdate = true;
    b.aMisc.needsUpdate = true;
  }

  /** 写一个粒子实例。age = 粒子出生后的秒数 */
  private put(b: Batch, L: StarLayer, cx: number, cz: number, k: number, age: number, seed: number, li: number, pi: number) {
    if (age < 0 || b.n >= b.cap) return;
    const life = particleLife(L, seed, li, pi);
    const u = age / life;
    if (u >= 1) return;
    const r = (slot: number) => rand01(seed, li * 64 + pi, slot);
    const W = STAR_UNITS.world;

    // 尺寸
    sampleCurve(L.scale, u, tS, 3, 1);
    const bx = Math.abs(L.bs[0] ?? 1) * sampleTable(L.bsRnd?.[0], r(10));
    const by = Math.abs(L.bs[1] ?? 1) * sampleTable(L.bsRnd?.[1], r(11));
    const bz = Math.abs(L.bs[2] ?? 1) * sampleTable(L.bsRnd?.[2], r(12));

    // 颜色（birthColor × color(t)，转线性；透明度原样）
    sampleCurve(L.color, u, tC, 4, 1);
    const bcA = (L.bc[3] ?? 1) * sampleTable(L.bcRnd?.[3], r(13));
    const cr = srgbToLinear(Math.max(0, (L.bc[0] ?? 1) * tC[0]));
    const cg = srgbToLinear(Math.max(0, (L.bc[1] ?? 1) * tC[1]));
    const cb = srgbToLinear(Math.max(0, (L.bc[2] ?? 1) * tC[2]));
    const ca = Math.max(0, Math.min(1, bcA * tC[3]));
    if (ca < 0.002 && L.blend === 'alpha') return;

    // 朝向（度）：原版 birthRotation × 随机表；发射形状的随机 0–360° 偏航；角速度
    const rotY = (L.rot[1] ?? 0) * sampleTable(L.rotRnd?.[1], r(14));
    let yaw = rotY + (L.rot[2] ?? 0) + (L.randYaw ? r(15) * 360 : 0) + (L.rotVel ? (L.rotVel[1] ?? 0) * age : 0);
    yaw *= DEG;

    // 位置（cm → m，水平按 k 放大）
    let px = 0, py = 0, pz = 0;
    px += (L.pos[0] ?? 0) + (L.offset?.[0] ?? 0);
    py += (L.pos[1] ?? 0) + (L.offset?.[1] ?? 0);
    pz += (L.pos[2] ?? 0) + (L.offset?.[2] ?? 0);
    if (L.cyl) {
      const a = r(16) * Math.PI * 2, rr = Math.sqrt(r(17)) * L.cyl[0];
      px += Math.cos(a) * rr; pz += Math.sin(a) * rr; py += r(18) * L.cyl[1];
    }
    let vx = 0, vy = 0, vz = 0;
    if (L.vel) {
      // 原版速度在发射器本地坐标；这里按每粒子随机偏航展开成一圈（原版发射器无旋转数据，碎片方向是近似）
      const sx = (L.vel[0] ?? 0) * sampleTable(L.velRnd?.[0], r(19));
      const sy = (L.vel[1] ?? 0) * sampleTable(L.velRnd?.[1], r(20));
      const sz = (L.vel[2] ?? 0) * sampleTable(L.velRnd?.[2], r(21));
      const va = r(22) * Math.PI * 2;
      vx = sx * Math.cos(va) - sz * Math.sin(va);
      vz = sx * Math.sin(va) + sz * Math.cos(va);
      vy = sy;
      const d = L.drag ?? [0, 0, 0];
      px += dragDisp(vx, d[0] ?? 0, age);
      py += dragDisp(vy, d[1] ?? 0, age);
      pz += dragDisp(vz, d[2] ?? 0, age);
      const ex = Math.exp(-(d[0] ?? 0) * age), ey = Math.exp(-(d[1] ?? 0) * age);
      vx *= ex; vz *= ex; vy *= ey;
    }
    const wx = cx + px * W * k;
    const wz = cz + pz * W * k;
    let wy = py * W;

    const Kq = STAR_UNITS.quad;
    const idx = b.n;
    if (L.prim === 'ground') {
      // 平面片按 x 统一缩放（原版这几层的 scale.y 常为 0，只有 x 有效）
      const w = bx * tS[0] * Kq * k;
      const d = (by > 1 ? by : bx) * tS[0] * Kq * k;
      if (w <= 1e-4) return;
      wy = Math.max(wy, 0.02) + 0.002 * li + 0.03;
      Q4.setFromAxisAngle(UP, yaw);
      M4.compose(P3.set(wx, wy, wz), Q4, S3.set(w, 1, d));
    } else if (L.prim === 'ray') {
      const w = bx * tS[0] * Kq * k;
      const h = by * tS[1] * Kq;
      if (w <= 1e-4 || h <= 1e-4) return;
      M4.set(
        w, 0, 0, wx,
        0, h, 0, Math.max(0, wy),
        0, 0, 1, wz,
        0, 0, 0, 1,
      );
    } else if (L.prim === 'axial') {
      const w = bx * tS[0] * Kq * k;
      const h = by * tS[1] * Kq * k;
      if (w <= 1e-4 || h <= 1e-4) return;
      let ax = vx * k, ay = vy, az = vz * k;
      const len = Math.hypot(ax, ay, az);
      if (len < 1e-5) { ax = 0; ay = 1; az = 0; } else { ax /= len; ay /= len; az /= len; }
      M4.set(
        w, ax * h, 0, wx,
        0, ay * h, 0, Math.max(0.05, wy),
        0, az * h, 1, wz,
        0, 0, 0, 1,
      );
    } else {
      const Km = STAR_UNITS.mesh * k;
      const sx = bx * tS[0] * Km, sy = by * tS[1] * Km, sz = bz * tS[2] * Km;
      if (sx <= 1e-6 && sy <= 1e-6) return;
      Q4.setFromAxisAngle(UP, yaw);
      M4.compose(P3.set(wx, Math.max(0, wy) + 0.02, wz), Q4, S3.set(sx, sy, sz));
    }
    b.mesh.setMatrixAt(idx, M4);

    // UV：图集格 / uvScale / 滚动 / 偏移
    let ox = 0, oy = 0, scx = 1, scy = 1;
    const U = L.uv;
    if (U) {
      if (U.div) {
        const dx = U.div[0] || 1, dy = U.div[1] || 1;
        scx = 1 / dx; scy = 1 / dy;
        if (dx >= 1 && dy >= 1 && U.frame !== undefined) {
          const f = Math.max(0, Math.floor(U.frame)) % Math.max(1, Math.round(dx * dy));
          const col = f % Math.round(dx), row = Math.floor(f / Math.round(dx));
          ox = col / dx; oy = 1 - (row + 1) / dy;
        }
      }
      if (U.scale) { scx *= U.scale[0] ?? 1; scy *= U.scale[1] ?? 1; }
      if (U.offset) { ox += U.offset[0] ?? 0; oy += U.offset[1] ?? 0; }
      if (U.scroll) { ox += (U.scroll[0] ?? 0) * age; oy += (U.scroll[1] ?? 0) * age; }
    }
    b.aUv.setXYZW(idx, ox, oy, scx, scy);
    b.aColor.setXYZW(idx, cr, cg, cb, ca);
    b.aMisc.setXYZW(idx, L.mult ? L.mult.rotRate * Math.PI * 2 * age : 0, 0, 0, 0);
    b.n++;
  }

  dispose() {
    for (const b of [...this.targetBatches, ...this.explBatches]) {
      b.mesh.geometry.dispose();
      (b.mesh.material as THREE.Material).dispose();
      b.mesh.dispose();
    }
    this.root.removeFromParent();
  }
}
