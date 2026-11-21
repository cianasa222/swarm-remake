import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * 统一美术风格工具：
 * - 三阶卡通明暗（MeshToonMaterial + 渐变贴图），日景下干净、明亮、轮廓清楚
 * - 反向外壳描边，保证小屏上角色与首领轮廓可读
 * - 顶点色合并几何：一个 InstancedMesh 即可绘制多色异兽
 */

let _grad: THREE.DataTexture | null = null;
export function toonGradient(): THREE.DataTexture {
  if (_grad) return _grad;
  const data = new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]);
  _grad = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  _grad.minFilter = THREE.NearestFilter;
  _grad.magFilter = THREE.NearestFilter;
  _grad.needsUpdate = true;
  return _grad;
}

const matCache = new Map<string, THREE.MeshToonMaterial>();
export function toon(hex: number, opts: { emissive?: number; vertexColors?: boolean } = {}): THREE.MeshToonMaterial {
  const key = `${hex}_${opts.emissive ?? 0}_${opts.vertexColors ? 1 : 0}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshToonMaterial({
      color: hex,
      gradientMap: toonGradient(),
      emissive: opts.emissive ?? 0x000000,
      vertexColors: !!opts.vertexColors,
    });
    matCache.set(key, m);
  }
  return m;
}

/** 不共享缓存的独立材质（需要单独改 emissive 时使用） */
export function toonUnique(hex: number): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({ color: hex, gradientMap: toonGradient() });
}

export const OUTLINE_MAT = new THREE.MeshBasicMaterial({ color: 0x14202c, side: THREE.BackSide });

/** 为一个 Group 里的所有网格加反向外壳描边 */
export function addOutline(group: THREE.Object3D, thickness = 0.045, mat = OUTLINE_MAT) {
  const list: THREE.Mesh[] = [];
  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh && !(o as THREE.Mesh).userData.noOutline) list.push(o as THREE.Mesh);
  });
  for (const m of list) {
    const geo = m.geometry as THREE.BufferGeometry;
    geo.computeBoundingBox();
    const size = new THREE.Vector3();
    geo.boundingBox!.getSize(size);
    const o = new THREE.Mesh(geo, mat);
    o.userData.noOutline = true;
    o.scale.set(
      1 + (thickness * 2) / Math.max(size.x, 0.05),
      1 + (thickness * 2) / Math.max(size.y, 0.05),
      1 + (thickness * 2) / Math.max(size.z, 0.05),
    );
    o.castShadow = false;
    m.add(o);
  }
}

/** 给几何体写入统一顶点色 */
export function paint(geo: THREE.BufferGeometry, hex: number): THREE.BufferGeometry {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const c = new THREE.Color(hex);
  const n = g.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  // 统一属性集合，便于合并
  if (g.attributes.uv) g.deleteAttribute('uv');
  return g;
}

export function place(geo: THREE.BufferGeometry, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, s: number | [number, number, number] = 1) {
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz));
  const sc = Array.isArray(s) ? new THREE.Vector3(...s) : new THREE.Vector3(s, s, s);
  m.compose(new THREE.Vector3(x, y, z), q, sc);
  geo.applyMatrix4(m);
  return geo;
}

export function merge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const g = mergeGeometries(parts, false)!;
  g.computeVertexNormals();
  return g;
}

/** 柔和圆形粒子贴图 */
let _soft: THREE.CanvasTexture | null = null;
export function softDot(): THREE.CanvasTexture {
  if (_soft) return _soft;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.35, 'rgba(255,255,255,0.85)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  _soft = new THREE.CanvasTexture(c);
  return _soft;
}

/** 接地柔影贴图 */
let _blob: THREE.CanvasTexture | null = null;
export function blobShadowTex(): THREE.CanvasTexture {
  if (_blob) return _blob;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(32, 32, 4, 32, 32, 31);
  grd.addColorStop(0, 'rgba(20,32,44,0.55)');
  grd.addColorStop(0.6, 'rgba(20,32,44,0.32)');
  grd.addColorStop(1, 'rgba(20,32,44,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  _blob = new THREE.CanvasTexture(c);
  return _blob;
}
