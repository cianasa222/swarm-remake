import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { ENEMY_SCALES } from '../config';
import type { Enemy } from '../sim/game';
import { getTexture, loadGLB } from './assets';
import { blobShadowTex } from './style';

/**
 * 把（可能经 M4 量化压缩的）蒙皮网格烘焙成静态 Float32 几何体，供 InstancedMesh 合批使用。
 *
 * M4 的 `quantize` 把 POSITION 存成 Int16 归一化（取值 −1…1）。蒙皮网格的节点变换不生效，
 * 反量化缩放被写进了骨骼的 inverseBindMatrices。如果只读原始顶点、丢掉蒙皮属性，
 * 小怪会只有 1 个单位大小，再乘 ENEMY_SCALES（约 0.01）就只剩 1–2 cm，画面上只看得见阴影。
 * 这里在静止姿态下逐顶点执行一次骨骼变换（applyBoneTransform），把反量化和绑定矩阵一并烘焙进去。
 */
function bakeStaticGeometry(obj: THREE.Mesh): THREE.BufferGeometry | null {
  const src = obj.geometry;
  const pos = src.getAttribute('position');
  if (!pos) return null;
  const uvAttr = src.getAttribute('uv');
  const n = pos.count;
  const skinned =
    obj instanceof THREE.SkinnedMesh && !!obj.skeleton && !!src.getAttribute('skinIndex') && !!src.getAttribute('skinWeight');

  const outPos = new Float32Array(n * 3);
  const outUv = new Float32Array(n * 2);
  const v = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(pos, i); // 自动按 normalized 反量化
    if (skinned) (obj as THREE.SkinnedMesh).applyBoneTransform(i, v);
    v.applyMatrix4(obj.matrixWorld);
    outPos[i * 3] = v.x;
    outPos[i * 3 + 1] = v.y;
    outPos[i * 3 + 2] = v.z;
    if (uvAttr) {
      outUv[i * 2] = uvAttr.getX(i);
      outUv[i * 2 + 1] = uvAttr.getY(i);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(outPos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(outUv, 2));
  if (src.index) g.setIndex(Array.from(src.index.array as ArrayLike<number>));
  g.computeVertexNormals(); // 量化法线也会被骨骼变换改变朝向，统一在烘焙后重算
  if (!g.index) return g;
  const nonIdx = g.toNonIndexed();
  g.dispose();
  return nonIdx;
}

// ═══════════════════════════════════════════════════════════════════════
// Q-22 顶点动画贴图（VAT）：小怪在加载时把原版骨骼动作烘焙进浮点贴图，
// 顶点着色器按「实例的动作编号 + 相位」取顶点位置/法线，几百只仍是单 DrawCall。
// 原版 .glb 里没有动作（或烘焙失败）时自动退回旧的静止姿态合批，行为与改动前一致。
// ═══════════════════════════════════════════════════════════════════════

export type VatClipKey = 'run' | 'attack' | 'idle';

interface VatClip {
  start: number;
  frames: number;
  duration: number;
  loop: boolean;
}

/** 每段动作采样帧率与上限（帧间在着色器里线性插值） */
const VAT_FPS = 20;
const VAT_MAX_FRAMES = 36;
/** 原版动作名匹配（按优先级取第一个命中的 clip） */
const VAT_CLIP_RX: Record<VatClipKey, RegExp[]> = {
  run: [/run(?!.*haste)/i, /run/i, /walk/i, /move/i],
  attack: [/attack1/i, /attack/i, /spell1/i],
  idle: [/idle/i],
};

interface VatSource {
  mesh: THREE.Mesh;
  pos: THREE.BufferAttribute | THREE.InterleavedBufferAttribute;
  uv: THREE.BufferAttribute | THREE.InterleavedBufferAttribute | undefined;
  index: ArrayLike<number> | null;
  count: number;
  skinIndex: THREE.BufferAttribute | THREE.InterleavedBufferAttribute | undefined;
  skinWeight: THREE.BufferAttribute | THREE.InterleavedBufferAttribute | undefined;
}

interface VatBake {
  geometry: THREE.BufferGeometry;
  posTex: THREE.DataTexture;
  nrmTex: THREE.DataTexture;
  texW: number;
  vertCount: number;
  clips: Partial<Record<VatClipKey, VatClip>>;
}

function pickClip(clips: THREE.AnimationClip[], key: VatClipKey): THREE.AnimationClip | null {
  for (const rx of VAT_CLIP_RX[key]) {
    const c = clips.find((cl) => rx.test(cl.name) && cl.duration > 0.05);
    if (c) return c;
  }
  return null;
}

/**
 * 在 CPU 上逐帧蒙皮并写入 HalfFloat 贴图。
 * 蒙皮公式与 THREE.SkinnedMesh.applyBoneTransform 相同（含 M4 量化的反量化缩放），
 * 再乘 mesh.matrixWorld —— 与旧的 bakeStaticGeometry() 静止姿态完全一致，只是多了时间维度。
 */
function bakeVat(gltf: { scene: THREE.Object3D; animations: THREE.AnimationClip[] }): VatBake | null {
  const picked: { key: VatClipKey; clip: THREE.AnimationClip }[] = [];
  for (const key of ['run', 'attack', 'idle'] as VatClipKey[]) {
    const clip = pickClip(gltf.animations ?? [], key);
    if (clip && !picked.some((p) => p.clip === clip)) picked.push({ key, clip });
  }
  if (!picked.length) return null;

  const scene = gltf.scene;
  scene.updateMatrixWorld(true);
  const sources: VatSource[] = [];
  scene.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh) || !obj.visible) return;
    const g = obj.geometry as THREE.BufferGeometry;
    const pos = g.getAttribute('position');
    if (!pos) return;
    sources.push({
      mesh: obj,
      pos,
      uv: g.getAttribute('uv'),
      index: g.index ? (g.index.array as ArrayLike<number>) : null,
      count: pos.count,
      skinIndex: g.getAttribute('skinIndex'),
      skinWeight: g.getAttribute('skinWeight'),
    });
  });
  if (!sources.length) return null;

  // ── 合并几何体（自己合并，保证 vatId 与贴图里的顶点顺序一一对应） ──
  let V = 0;
  let I = 0;
  for (const s of sources) {
    V += s.count;
    I += s.index ? s.index.length : s.count;
  }
  const uvOut = new Float32Array(V * 2);
  const idOut = new Float32Array(V);
  const restOut = new Float32Array(V * 3);
  const idxOut = V > 65535 ? new Uint32Array(I) : new Uint16Array(I);
  {
    let vo = 0;
    let io = 0;
    for (const s of sources) {
      for (let i = 0; i < s.count; i++) {
        idOut[vo + i] = vo + i;
        if (s.uv) {
          uvOut[(vo + i) * 2] = s.uv.getX(i);
          uvOut[(vo + i) * 2 + 1] = s.uv.getY(i);
        }
      }
      if (s.index) for (let k = 0; k < s.index.length; k++) idxOut[io++] = s.index[k] + vo;
      else for (let k = 0; k < s.count; k++) idxOut[io++] = k + vo;
      vo += s.count;
    }
  }

  let totalFrames = 0;
  const clipInfo: Partial<Record<VatClipKey, VatClip>> = {};
  const plan: { key: VatClipKey; clip: THREE.AnimationClip; frames: number; loop: boolean }[] = [];
  for (const p of picked) {
    const loop = p.key !== 'attack';
    const frames = Math.max(2, Math.min(VAT_MAX_FRAMES, Math.round(p.clip.duration * VAT_FPS) + (loop ? 0 : 1)));
    clipInfo[p.key] = { start: totalFrames, frames, duration: p.clip.duration, loop };
    plan.push({ ...p, frames, loop });
    totalFrames += frames;
  }

  const texW = 2048;
  const texels = totalFrames * V;
  const texH = Math.ceil(texels / texW);
  if (texH > 4096) return null; // 顶点过多：放弃 VAT，走静止姿态
  const posData = new Uint16Array(texW * texH * 4);
  const nrmData = new Uint16Array(texW * texH * 4);
  const toHalf = THREE.DataUtils.toHalfFloat;

  // 记录所有节点的原始姿态，烘焙完恢复（失败退回静止姿态时也要用原始姿态）
  const saved: { o: THREE.Object3D; p: THREE.Vector3; q: THREE.Quaternion; s: THREE.Vector3 }[] = [];
  scene.traverse((o) => saved.push({ o, p: o.position.clone(), q: o.quaternion.clone(), s: o.scale.clone() }));
  const restorePose = () => {
    for (const r of saved) {
      r.o.position.copy(r.p);
      r.o.quaternion.copy(r.q);
      r.o.scale.copy(r.s);
    }
    scene.updateMatrixWorld(true);
  };
  /** 兼容 InterleavedBufferAttribute（M4 量化后 vec3 会被补齐成交错布局） */
  const comp = (attr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute, i: number, c: number) =>
    c === 0 ? attr.getX(i) : c === 1 ? attr.getY(i) : c === 2 ? attr.getZ(i) : attr.getW(i);

  const mixer = new THREE.AnimationMixer(scene);
  const v = new THREE.Vector3();
  const base = new THREE.Vector3();
  const acc = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const framePos = new Float32Array(V * 3);
  const frameNrm = new Float32Array(V * 3);
  const boneMats: THREE.Matrix4[][] = sources.map((s) =>
    s.mesh instanceof THREE.SkinnedMesh && s.mesh.skeleton ? s.mesh.skeleton.bones.map(() => new THREE.Matrix4()) : [],
  );

  const writeFrame = (frameIdx: number) => {
    scene.updateMatrixWorld(true);
    let vo = 0;
    for (let si = 0; si < sources.length; si++) {
      const s = sources[si];
      const mesh = s.mesh;
      const skinned =
        mesh instanceof THREE.SkinnedMesh && !!mesh.skeleton && !!s.skinIndex && !!s.skinWeight && boneMats[si].length > 0;
      if (skinned) {
        const sm = mesh as THREE.SkinnedMesh;
        const bones = sm.skeleton.bones;
        for (let b = 0; b < bones.length; b++) {
          // M_b = matrixWorld · bindMatrixInverse · bone.matrixWorld · boneInverse · bindMatrix
          boneMats[si][b]
            .multiplyMatrices(bones[b].matrixWorld, sm.skeleton.boneInverses[b])
            .premultiply(sm.bindMatrixInverse)
            .premultiply(sm.matrixWorld)
            .multiply(sm.bindMatrix);
        }
      }
      for (let i = 0; i < s.count; i++) {
        v.fromBufferAttribute(s.pos, i);
        if (skinned) {
          acc.set(0, 0, 0);
          base.copy(v);
          for (let c = 0; c < 4; c++) {
            const w = comp(s.skinWeight!, i, c);
            if (w === 0) continue;
            const bi = Math.round(comp(s.skinIndex!, i, c));
            const bm = boneMats[si][bi];
            if (!bm) continue;
            acc.addScaledVector(tmp.copy(base).applyMatrix4(bm), w);
          }
          v.copy(acc);
        } else {
          v.applyMatrix4(mesh.matrixWorld);
        }
        const o = (vo + i) * 3;
        framePos[o] = v.x;
        framePos[o + 1] = v.y;
        framePos[o + 2] = v.z;
      }
      vo += s.count;
    }
    // 逐帧重算平滑法线（与旧代码「烘焙后统一重算法线」一致，规避量化法线被骨骼扭曲）
    frameNrm.fill(0);
    for (let k = 0; k + 2 < idxOut.length; k += 3) {
      const a = idxOut[k] * 3;
      const b = idxOut[k + 1] * 3;
      const c = idxOut[k + 2] * 3;
      const e1x = framePos[b] - framePos[a], e1y = framePos[b + 1] - framePos[a + 1], e1z = framePos[b + 2] - framePos[a + 2];
      const e2x = framePos[c] - framePos[a], e2y = framePos[c + 1] - framePos[a + 1], e2z = framePos[c + 2] - framePos[a + 2];
      const nx = e1y * e2z - e1z * e2y;
      const ny = e1z * e2x - e1x * e2z;
      const nz = e1x * e2y - e1y * e2x;
      frameNrm[a] += nx; frameNrm[a + 1] += ny; frameNrm[a + 2] += nz;
      frameNrm[b] += nx; frameNrm[b + 1] += ny; frameNrm[b + 2] += nz;
      frameNrm[c] += nx; frameNrm[c + 1] += ny; frameNrm[c + 2] += nz;
    }
    const rowBase = frameIdx * V;
    for (let i = 0; i < V; i++) {
      const o = i * 3;
      let nx = frameNrm[o], ny = frameNrm[o + 1], nz = frameNrm[o + 2];
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len; ny /= len; nz /= len;
      const t4 = (rowBase + i) * 4;
      posData[t4] = toHalf(framePos[o]);
      posData[t4 + 1] = toHalf(framePos[o + 1]);
      posData[t4 + 2] = toHalf(framePos[o + 2]);
      posData[t4 + 3] = toHalf(1);
      nrmData[t4] = toHalf(nx);
      nrmData[t4 + 1] = toHalf(ny);
      nrmData[t4 + 2] = toHalf(nz);
      nrmData[t4 + 3] = toHalf(0);
      if (frameIdx === 0) {
        restOut[o] = framePos[o];
        restOut[o + 1] = framePos[o + 1];
        restOut[o + 2] = framePos[o + 2];
      }
    }
  };

  try {
    for (const p of plan) {
      mixer.stopAllAction();
      restorePose(); // 每段动作从原始姿态开始，避免上一段没覆盖到的骨骼残留
      const action = mixer.clipAction(p.clip);
      action.reset();
      action.setLoop(p.loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
      action.clampWhenFinished = !p.loop;
      action.play();
      const info = clipInfo[p.key]!;
      for (let f = 0; f < p.frames; f++) {
        const tt = p.loop ? (f / p.frames) * p.clip.duration : (f / (p.frames - 1)) * p.clip.duration * 0.999;
        mixer.setTime(tt);
        writeFrame(info.start + f);
      }
    }
  } finally {
    mixer.stopAllAction();
    mixer.uncacheRoot(scene);
    restorePose();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(restOut, 3)); // 仅用于包围盒，真实位置来自贴图
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvOut, 2));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(new Float32Array(V * 3), 3));
  geometry.setAttribute('vatId', new THREE.Float32BufferAttribute(idOut, 1));
  geometry.setIndex(new THREE.BufferAttribute(idxOut, 1));

  const mk = (data: Uint16Array<ArrayBuffer>) => {
    const tex = new THREE.DataTexture(data, texW, texH, THREE.RGBAFormat, THREE.HalfFloatType);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.flipY = false;
    tex.needsUpdate = true;
    return tex;
  };
  return { geometry, posTex: mk(posData), nrmTex: mk(nrmData), texW, vertCount: V, clips: clipInfo };
}

/** 给 MeshStandardMaterial 注入 VAT 顶点取样（保留原有贴图、实例颜色、雾、环境光等全部功能） */
function applyVatShader(mat: THREE.MeshStandardMaterial, bake: VatBake) {
  const uniforms = {
    vatPos: { value: bake.posTex },
    vatNrm: { value: bake.nrmTex },
    vatW: { value: bake.texW },
    vatV: { value: bake.vertCount },
  };
  mat.customProgramCacheKey = () => 'enemy-vat-v2';
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
uniform highp sampler2D vatPos;
uniform highp sampler2D vatNrm;
uniform int vatW;
uniform int vatV;
attribute float vatId;
attribute vec4 vatAnim; // 起始帧、帧数、相位 0..1、是否循环
vec4 vatFetch(highp sampler2D t, int idx) { return texelFetch(t, ivec2(idx - (idx / vatW) * vatW, idx / vatW), 0); }
vec3 vatP;`,
      )
      .replace(
        '#include <beginnormal_vertex>',
        `float vatFc = max(vatAnim.y, 1.0);
bool vatLoop = vatAnim.w > 0.5;
float vatF = clamp(vatAnim.z, 0.0, 1.0) * (vatLoop ? vatFc : vatFc - 1.0);
float vatI0f = floor(vatF);
float vatA = vatF - vatI0f;
int vatI0 = int(vatAnim.x + (vatLoop ? mod(vatI0f, vatFc) : min(vatI0f, vatFc - 1.0)) + 0.5);
int vatI1 = int(vatAnim.x + (vatLoop ? mod(vatI0f + 1.0, vatFc) : min(vatI0f + 1.0, vatFc - 1.0)) + 0.5);
int vatVid = int(vatId + 0.5);
vatP = mix(vatFetch(vatPos, vatI0 * vatV + vatVid).xyz, vatFetch(vatPos, vatI1 * vatV + vatVid).xyz, vatA);
vec3 objectNormal = normalize(mix(vatFetch(vatNrm, vatI0 * vatV + vatVid).xyz, vatFetch(vatNrm, vatI1 * vatV + vatVid).xyz, vatA));
#ifdef USE_TANGENT
  vec3 objectTangent = vec3( tangent.xyz );
#endif`,
      )
      .replace(
        '#include <begin_vertex>',
        `vec3 transformed = vatP;
#ifdef USE_ALPHAHASH
  vPosition = vatP;
#endif`,
      );
  };
  mat.needsUpdate = true;
}

/**
 * 单 DrawCall 合批 3D 小怪渲染器（基于官方 .glb 几何体 + 官方贴图）。
 * 支持受击闪白与束缚染色，零额外 GC。
 * Q-22：有原版动作时用 VAT 播放跑/攻击/待机；没有时退回静止姿态（旧行为）。
 * Q-22：小怪不再投实时阴影（已有圆形软影 blob shadow，避免双重影子和几百只的阴影绘制）。
 */
export class InstancedEnemyModel {
  private inst: THREE.InstancedMesh | null = null;
  private count = 0;
  private loadStarted = false;
  private vatClips: Partial<Record<VatClipKey, VatClip>> | null = null;
  private vatAttr: THREE.InstancedBufferAttribute | null = null;

  constructor(
    private parent: THREE.Group,
    private glbUrl: string,
    private texUrl: string,
    private maxCount: number,
    defer = false,
  ) {
    if (!defer) this.ensureLoaded();
  }

  /** 是否在播放原版骨骼动作（VAT）。false 时调用方继续用旧的正弦起伏 */
  get animated(): boolean {
    return this.vatClips !== null;
  }

  ensureLoaded() {
    if (this.loadStarted) return;
    this.loadStarted = true;

    const tex = getTexture(this.texUrl, { flipY: false, anisotropy: 4 });
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      color: 0xffffff,
      roughness: 0.72,
      metalness: 0.12,
      envMapIntensity: 0.45,
      side: THREE.DoubleSide,
    });

    loadGLB(this.glbUrl)
      .then((gltf) => {
        let geometry: THREE.BufferGeometry | null = null;

        // ── 优先：原版动作烘焙成 VAT ──
        try {
          const bake = bakeVat(gltf);
          if (bake) {
            geometry = bake.geometry;
            applyVatShader(mat, bake);
            this.vatClips = bake.clips;
            const arr = new Float32Array(this.maxCount * 4);
            const runClip = bake.clips.run ?? bake.clips.idle ?? bake.clips.attack!;
            for (let i = 0; i < this.maxCount; i++) {
              arr[i * 4] = runClip.start;
              arr[i * 4 + 1] = runClip.frames;
              arr[i * 4 + 3] = runClip.loop ? 1 : 0;
            }
            this.vatAttr = new THREE.InstancedBufferAttribute(arr, 4);
            this.vatAttr.setUsage(THREE.DynamicDrawUsage);
            geometry.setAttribute('vatAnim', this.vatAttr);
            console.info(
              '[InstancedEnemyModel] VAT',
              this.glbUrl,
              Object.fromEntries(Object.entries(bake.clips).map(([k, c]) => [k, `${c!.frames}f/${c!.duration.toFixed(2)}s`])),
            );
          }
        } catch (err) {
          console.warn('[InstancedEnemyModel] VAT bake failed, fallback to rest pose:', this.glbUrl, err);
          geometry = null;
          this.vatClips = null;
          this.vatAttr = null;
        }

        // ── 退回：静止姿态合批（Q-05 旧逻辑） ──
        if (!geometry) {
          const geos: THREE.BufferGeometry[] = [];
          gltf.scene.updateMatrixWorld(true);
          gltf.scene.traverse((obj) => {
            if (!(obj instanceof THREE.Mesh) || !obj.visible) return;
            const g = bakeStaticGeometry(obj);
            if (g) geos.push(g);
          });
          if (!geos.length) return;
          const merged = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
          if (geos.length > 1) geos.forEach((g) => g.dispose());
          if (!merged) return;
          geometry = merged;
        }

        const mesh = new THREE.InstancedMesh(geometry, mat, this.maxCount);
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        mesh.frustumCulled = false;
        mesh.castShadow = false;
        mesh.receiveShadow = true;
        mesh.count = 0;
        const white = new THREE.Color(0xffffff);
        for (let i = 0; i < this.maxCount; i++) mesh.setColorAt(i, white);
        this.inst = mesh;
        this.parent.add(mesh);
      })
      .catch((err) => console.error('[InstancedEnemyModel] load failed:', this.glbUrl, err));
  }

  begin() {
    this.count = 0;
  }

  /**
   * @param clip   想播的动作；模型里没有这段时依次退回 run → idle
   * @param clipT  该动作已播放的秒数（循环动作可传全局时钟 + 个体偏移）
   */
  push(matrix: THREE.Matrix4, color: THREE.Color, clip: VatClipKey = 'run', clipT = 0) {
    if (!this.loadStarted) this.ensureLoaded();
    if (!this.inst || this.count >= this.maxCount) return;
    const i = this.count;
    this.inst.setMatrixAt(i, matrix);
    this.inst.setColorAt(i, color);
    if (this.vatClips && this.vatAttr) {
      const c = this.vatClips[clip] ?? this.vatClips.run ?? this.vatClips.idle ?? this.vatClips.attack;
      if (c) {
        const u = clipT / c.duration;
        const phase = c.loop ? u - Math.floor(u) : Math.min(1, Math.max(0, u));
        const arr = this.vatAttr.array as Float32Array;
        arr[i * 4] = c.start;
        arr[i * 4 + 1] = c.frames;
        arr[i * 4 + 2] = phase;
        arr[i * 4 + 3] = c.loop ? 1 : 0;
      }
    }
    this.count++;
  }

  end() {
    if (!this.inst) return;
    this.inst.count = this.count;
    this.inst.instanceMatrix.needsUpdate = true;
    if (this.inst.instanceColor) this.inst.instanceColor.needsUpdate = true;
    if (this.vatAttr) {
      this.vatAttr.clearUpdateRanges();
      this.vatAttr.addUpdateRange(0, Math.max(1, this.count) * 4);
      this.vatAttr.needsUpdate = true;
    }
  }
}

interface EliteSlot {
  root: THREE.Group;
  model: THREE.Object3D;
  mat: THREE.MeshStandardMaterial;
  mixer: THREE.AnimationMixer;
  actions: Record<string, THREE.AnimationAction>;
  curKey: string;
  /** Q-28：脚下红圈（死亡时隐藏） */
  ring: THREE.Mesh;
  /** Q-28：死亡动作剩余时间（秒），> 0 表示正在播放死亡动作 */
  dyingT: number;
}

/**
 * 第一关重装精英（Strawberry_MiniBoss_Bruiser）骨骼动画对象池：
 * 同屏精英数量极少（<=6），使用真实骨骼动画展现奔跑与重击姿态。
 * Q-28：槽位按敌人 id 固定（原来按数组下标，前一只死掉后后面的精英会「换槽」跳动作）；
 * 精英从存活列表消失时原地播放原版 `bw_ironback_death`（约 1.63 s），播完再隐藏。只改渲染，不改模拟。
 */
export class EliteBruiserPool {
  private slots: EliteSlot[] = [];
  private template: THREE.Object3D | null = null;
  private clips: THREE.AnimationClip[] = [];
  private baseTex: THREE.Texture | null = null;
  private loadStarted = false;
  /** Q-28：敌人 id → 槽位下标 */
  private byId = new Map<number, number>();
  private tracked = new Map<number, Enemy>();

  constructor(private parent: THREE.Group, private maxSlots = 6, defer = false) {
    if (!defer) this.ensureLoaded();
  }

  ensureLoaded() {
    if (this.loadStarted) return;
    this.loadStarted = true;
    this.baseTex = getTexture('./assets/enemies/miniboss_bruiser.webp', { flipY: false, anisotropy: 4 });
    loadGLB('./assets/enemies/miniboss_bruiser.glb')
      .then((gltf) => {
        this.template = gltf.scene;
        this.clips = gltf.animations;
        for (let i = 0; i < this.maxSlots; i++) this.slots.push(this.createSlot());
      })
      .catch((err) => console.error('[EliteBruiserPool] load failed:', err));
  }

  private createSlot(): EliteSlot {
    const root = new THREE.Group();
    root.visible = false;

    const ringGeo = new THREE.RingGeometry(0.95, 1.12, 28);
    ringGeo.rotateX(-Math.PI / 2);
    const ring = new THREE.Mesh(
      ringGeo,
      new THREE.MeshBasicMaterial({ color: 0xff3b5c, transparent: true, opacity: 0.72, depthWrite: false }),
    );
    ring.position.y = 0.04;

    const shadowGeo = new THREE.PlaneGeometry(2.6, 2.6);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadow = new THREE.Mesh(
      shadowGeo,
      new THREE.MeshBasicMaterial({ map: blobShadowTex(), transparent: true, opacity: 0.5, depthWrite: false }),
    );
    shadow.position.y = 0.02;

    const mat = new THREE.MeshStandardMaterial({
      map: this.baseTex,
      roughness: 0.66,
      metalness: 0.18,
      envMapIntensity: 0.55,
      side: THREE.DoubleSide,
    });

    const model = cloneSkinned(this.template!);
    model.scale.setScalar(ENEMY_SCALES.bruiser);
    model.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      obj.material = mat;
      obj.castShadow = true;
      obj.receiveShadow = true;
    });

    root.add(shadow, ring, model);
    this.parent.add(root);

    const mixer = new THREE.AnimationMixer(model);
    const actions: Record<string, THREE.AnimationAction> = {};
    const bind = (key: string, rx: RegExp) => {
      const clip = this.clips.find((c) => rx.test(c.name));
      if (clip) actions[key] = mixer.clipAction(clip);
    };
    bind('run', /bruiser_run/i);
    bind('attack', /attack1/i);
    bind('idle', /idle1/i);
    bind('death', /death/i); // Q-28：原版 bw_ironback_death（以前导出了但没用）
    if (actions.run) actions.run.play();

    return { root, model, mat, mixer, actions, curKey: actions.run ? 'run' : '', ring, dyingT: 0 };
  }

  /** Q-28：槽位分给新精英时恢复到奔跑状态 */
  private resetSlot(slot: EliteSlot) {
    slot.mixer.stopAllAction();
    slot.dyingT = 0;
    slot.ring.visible = true;
    slot.mat.emissive.setHex(0x000000);
    if (slot.actions.run) {
      slot.actions.run.reset().play();
      slot.curKey = 'run';
    } else {
      slot.curKey = '';
    }
  }

  /** Q-28：原地播放死亡动作；模型没有 death 时直接隐藏（旧行为） */
  private startDeath(slot: EliteSlot) {
    const death = slot.actions.death;
    if (!slot.root.visible || !death) {
      slot.root.visible = false;
      slot.dyingT = 0;
      return;
    }
    if (slot.curKey && slot.curKey !== 'death') slot.actions[slot.curKey]?.fadeOut(0.1);
    death.reset();
    death.setLoop(THREE.LoopOnce, 1);
    death.clampWhenFinished = true;
    death.fadeIn(0.1).play();
    slot.curKey = 'death';
    slot.mat.emissive.setHex(0x000000);
    slot.ring.visible = false;
    slot.dyingT = death.getClip().duration + 0.25;
  }

  reset() {
    this.byId.clear();
    this.tracked.clear();
    for (const slot of this.slots) {
      slot.mixer.stopAllAction();
      slot.dyingT = 0;
      slot.root.visible = false;
      slot.curKey = '';
    }
  }

  update(elites: Enemy[], dt: number) {
    if (elites.length > 0 && !this.loadStarted) this.ensureLoaded();
    if (!this.slots.length) return;

    // 1) 仅真正耗尽 HP 的精英播放死亡动画；Boss 清场等移除直接隐藏。
    const alive = new Set<number>();
    for (const e of elites) alive.add(e.id);
    for (const [id, si] of [...this.byId]) {
      if (alive.has(id)) continue;
      this.byId.delete(id);
      const e = this.tracked.get(id);
      this.tracked.delete(id);
      const slot = this.slots[si];
      if (e && e.hp <= 0) this.startDeath(slot);
      else {
        slot.mixer.stopAllAction();
        slot.root.visible = false;
        slot.dyingT = 0;
      }
    }

    // 2) 新出现的精英分配槽位（优先空闲槽，其次抢正在播死亡动作的槽）
    const used = new Set<number>(this.byId.values());
    for (const e of elites) {
      if (this.byId.has(e.id)) continue;
      let si = this.slots.findIndex((s, i) => !used.has(i) && s.dyingT <= 0);
      if (si < 0) si = this.slots.findIndex((_, i) => !used.has(i));
      if (si < 0) continue; // 超过槽位数：与旧逻辑一致，多出的不显示
      this.byId.set(e.id, si);
      used.add(si);
      this.resetSlot(this.slots[si]);
    }

    // 3) 正在死亡 / 空闲的槽
    for (let i = 0; i < this.slots.length; i++) {
      if (used.has(i)) continue;
      const slot = this.slots[i];
      if (slot.dyingT > 0) {
        slot.dyingT -= dt;
        slot.mixer.update(dt);
        if (slot.dyingT <= 0) slot.root.visible = false;
      } else {
        slot.root.visible = false;
      }
    }

    // 4) 存活精英（逻辑与原来相同）
    for (const e of elites) {
      const si = this.byId.get(e.id);
      if (si === undefined) continue;
      const slot = this.slots[si];
      this.tracked.set(e.id, e);
      slot.root.visible = true;
      const emerge = Math.min(1, e.age / 0.35);
      slot.root.position.set(e.x, 0, e.z);
      slot.root.rotation.y = e.face;
      slot.model.scale.setScalar(ENEMY_SCALES.bruiser * emerge);

      if (e.flash > 0.25) slot.mat.emissive.setHex(0x777777);
      else if (e.bindT > 0) slot.mat.emissive.setHex(0x1f5578);
      else slot.mat.emissive.setHex(0x000000);

      const want = e.state === 'windup' || e.state === 'dash' ? 'attack' : 'run';
      if (want !== slot.curKey && slot.actions[want]) {
        slot.actions[slot.curKey]?.fadeOut(0.12);
        slot.actions[want].reset().fadeIn(0.12).play();
        slot.curKey = want;
      }
      slot.mixer.update(dt);
    }
  }
}
