import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { BOSS, BUDGET, XP } from '../config';
import type { Game } from '../sim/game';
import { type HeroRig, JinxRig } from './hero_jinx';
import { addOutline, blobShadowTex, merge, OUTLINE_MAT, paint, place, toon, toonUnique } from './style';

const D = new THREE.Object3D();
const C = new THREE.Color();
const WHITE = new THREE.Color(1, 1, 1);
const FLASH = new THREE.Color(2.6, 2.6, 2.6);
const BIND = new THREE.Color(0.75, 1.7, 1.9);
const ELITE = new THREE.Color(1.45, 1.05, 0.62);

/** 实例化网格 + 同步描边层 */
class InstGroup {
  body: THREE.InstancedMesh;
  outline: THREE.InstancedMesh;
  n = 0;
  constructor(root: THREE.Group, geo: THREE.BufferGeometry, mat: THREE.Material, cap: number, outlineScale = 1.07, cast = true) {
    this.body = new THREE.InstancedMesh(geo, mat, cap);
    this.outline = new THREE.InstancedMesh(geo, OUTLINE_MAT, cap);
    for (const m of [this.body, this.outline]) {
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      m.frustumCulled = false;
      m.count = 0;
      root.add(m);
    }
    this.body.castShadow = cast;
    this.body.setColorAt(0, WHITE);
    this.os = outlineScale;
  }
  private os: number;
  private tmp = new THREE.Matrix4();
  private sm = new THREE.Matrix4();
  begin() { this.n = 0; }
  push(m: THREE.Matrix4, color: THREE.Color) {
    const i = this.n++;
    this.body.setMatrixAt(i, m);
    this.body.setColorAt(i, color);
    this.sm.makeScale(this.os, this.os, this.os);
    this.tmp.multiplyMatrices(m, this.sm);
    this.outline.setMatrixAt(i, this.tmp);
  }
  end() {
    this.body.count = this.n;
    this.outline.count = this.n;
    this.body.instanceMatrix.needsUpdate = true;
    this.outline.instanceMatrix.needsUpdate = true;
    if (this.body.instanceColor) this.body.instanceColor.needsUpdate = true;
  }
}

/** 简单实例化（无描边） */
function mkInst(root: THREE.Group, geo: THREE.BufferGeometry, mat: THREE.Material, cap: number) {
  const m = new THREE.InstancedMesh(geo, mat, cap);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.frustumCulled = false;
  m.count = 0;
  root.add(m);
  return m;
}

// ───────────────────────── 异兽几何（原创造型，顶点色） ─────────────────────────

/** 爬壳虫：矮宽贴地，深青色壳甲 + 紫褐短足 + 黄绿复眼 */
function crawlerGeo() {
  const shell = 0x1f6a70, ridge = 0x15474c, leg = 0x5a3a48, eye = 0xd9ff4a, belly = 0x2c3d44;
  const p: THREE.BufferGeometry[] = [
    paint(place(new THREE.SphereGeometry(0.55, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0, 0.12, -0.02, 0, 0, 0, [1.05, 0.62, 1.0]), shell),
    paint(place(new THREE.CylinderGeometry(0.56, 0.5, 0.14, 12), 0, 0.1, -0.02, 0, 0, 0, [1.05, 1, 1]), belly),
    paint(place(new THREE.BoxGeometry(0.1, 0.1, 0.95), 0, 0.42, -0.04), ridge),
    paint(place(new THREE.BoxGeometry(0.9, 0.08, 0.1), 0, 0.35, -0.2), ridge),
    paint(place(new THREE.BoxGeometry(0.85, 0.08, 0.1), 0, 0.33, 0.15), ridge),
    paint(place(new THREE.BoxGeometry(0.42, 0.22, 0.26), 0, 0.17, 0.5), belly),
    paint(place(new THREE.SphereGeometry(0.08, 6, 5), -0.12, 0.25, 0.62), eye),
    paint(place(new THREE.SphereGeometry(0.08, 6, 5), 0.12, 0.25, 0.62), eye),
    // 前颚
    paint(place(new THREE.ConeGeometry(0.06, 0.25, 5), -0.15, 0.12, 0.7, Math.PI / 2, 0, 0.3), 0xe7dcc2),
    paint(place(new THREE.ConeGeometry(0.06, 0.25, 5), 0.15, 0.12, 0.7, Math.PI / 2, 0, -0.3), 0xe7dcc2),
  ];
  for (const s of [-1, 1]) {
    for (const z of [-0.3, 0.02, 0.32]) {
      p.push(paint(place(new THREE.BoxGeometry(0.42, 0.08, 0.09), s * 0.62, 0.08, z, 0, 0, s * -0.45), leg));
    }
  }
  return merge(p);
}

/** 刺囊兽本体（发光囊单独实例化）：墨绿色躯体、背部骨刺、粗壮短腿 */
function spitterGeo() {
  const body = 0x2f5a3d, dark = 0x1e3a28, spike = 0xe6d9bd, leg = 0x4a3442;
  const p: THREE.BufferGeometry[] = [
    paint(place(new THREE.SphereGeometry(0.5, 12, 9), 0, 0.5, 0, 0, 0, 0, [0.9, 0.75, 1.1]), body),
    paint(place(new THREE.SphereGeometry(0.3, 10, 8), 0, 0.5, 0.52, 0, 0, 0, [1, 0.85, 0.9]), dark),
    // 口器（朝前）
    paint(place(new THREE.CylinderGeometry(0.14, 0.2, 0.25, 8), 0, 0.48, 0.78, Math.PI / 2), 0x6b2a4a),
    paint(place(new THREE.SphereGeometry(0.07, 6, 5), -0.16, 0.62, 0.7), 0xffe24a),
    paint(place(new THREE.SphereGeometry(0.07, 6, 5), 0.16, 0.62, 0.7), 0xffe24a),
  ];
  for (const s of [-1, 1]) {
    for (const z of [-0.25, 0.25]) {
      p.push(paint(place(new THREE.CylinderGeometry(0.09, 0.07, 0.45, 6), s * 0.38, 0.2, z, 0, 0, s * 0.35), leg));
    }
  }
  // 囊周骨刺
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    p.push(paint(place(new THREE.ConeGeometry(0.06, 0.3, 5), Math.cos(a) * 0.32, 0.95, -0.15 + Math.sin(a) * 0.32, Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7), spike));
  }
  return merge(p);
}

/** 刺囊：高背发光囊 */
function sacGeo() {
  const g = new THREE.SphereGeometry(0.38, 12, 10);
  g.scale(1, 1.15, 1);
  return g;
}

/** 裂甲兽：细长前倾、紫褐甲壳、骨白前刃、长腿 */
function chargerGeo() {
  const shell = 0x5c2e52, plate = 0x7a3d68, under = 0x2b2532, blade = 0xeee2c8, leg = 0x2d2a36, eye = 0xff6a3a;
  const p: THREE.BufferGeometry[] = [
    paint(place(new THREE.SphereGeometry(0.45, 12, 8), 0, 0.72, -0.05, 0, 0, 0, [0.8, 0.7, 1.7]), shell),
    paint(place(new THREE.BoxGeometry(0.55, 0.14, 0.5), 0, 1.02, -0.35, -0.15), plate),
    paint(place(new THREE.BoxGeometry(0.5, 0.14, 0.45), 0, 1.04, 0.1, -0.05), plate),
    paint(place(new THREE.BoxGeometry(0.4, 0.12, 0.4), 0, 0.98, 0.5, 0.15), plate),
    paint(place(new THREE.SphereGeometry(0.26, 10, 8), 0, 0.72, 0.78, 0, 0, 0, [1, 0.9, 1.2]), under),
    // 前刃（两侧向前）
    paint(place(new THREE.ConeGeometry(0.09, 0.85, 5), -0.2, 0.62, 1.15, Math.PI / 2 - 0.15, 0, 0.2), blade),
    paint(place(new THREE.ConeGeometry(0.09, 0.85, 5), 0.2, 0.62, 1.15, Math.PI / 2 - 0.15, 0, -0.2), blade),
    paint(place(new THREE.SphereGeometry(0.06, 6, 5), -0.12, 0.85, 0.98), eye),
    paint(place(new THREE.SphereGeometry(0.06, 6, 5), 0.12, 0.85, 0.98), eye),
    // 尾刺
    paint(place(new THREE.ConeGeometry(0.1, 0.6, 5), 0, 0.8, -0.95, -Math.PI / 2 - 0.4, 0, 0), blade),
  ];
  for (const s of [-1, 1]) {
    for (const z of [-0.45, 0.0, 0.45]) {
      p.push(paint(place(new THREE.CylinderGeometry(0.06, 0.04, 0.85, 5), s * 0.42, 0.36, z, 0, 0, s * 0.5), leg));
    }
  }
  return merge(p);
}

/** 经验晶片：上下双锥 */
function shardGeo() {
  const g = new THREE.OctahedronGeometry(0.24, 0);
  g.scale(0.85, 1.25, 0.85);
  return g;
}

/** 维修包：白箱 + 绿十字 */
function kitGeo() {
  return merge([
    paint(new THREE.BoxGeometry(0.62, 0.42, 0.62), 0xf8fafb),
    paint(place(new THREE.BoxGeometry(0.42, 0.06, 0.14), 0, 0.23, 0), 0x2fd06a),
    paint(place(new THREE.BoxGeometry(0.14, 0.06, 0.42), 0, 0.23, 0), 0x2fd06a),
  ]);
}

/** 磁索地雷 */
function mineGeo() {
  return merge([
    paint(new THREE.CylinderGeometry(0.42, 0.5, 0.18, 12), 0x2b3640),
    paint(place(new THREE.TorusGeometry(0.4, 0.06, 6, 16), 0, 0.12, 0, Math.PI / 2), 0xf2c230),
    paint(place(new THREE.CylinderGeometry(0.14, 0.14, 0.16, 10), 0, 0.17, 0), 0xffffff),
  ]);
}

// ───────────────────────── 渲染器 ─────────────────────────

export class EntityRenderer {
  private root = new THREE.Group();

  // 玩家角色
  private heroRig: HeroRig;

  // 首领
  private boss = new THREE.Group();
  private bossBody = new THREE.Group();
  private bossArm = new THREE.Group();
  private bossHead = new THREE.Group();
  private bossSkinMat: THREE.MeshToonMaterial;
  private bossEyeMat: THREE.MeshBasicMaterial;
  private bossShadow: THREE.Mesh;

  // 批处理
  private crawlers: InstGroup;
  private spitters: InstGroup;
  private sacs: THREE.InstancedMesh;
  private chargers: InstGroup;
  private shadows: THREE.InstancedMesh;

  private mgBullets: THREE.InstancedMesh;
  private mgOutlines: THREE.InstancedMesh;
  private cnShells: THREE.InstancedMesh;
  private cnOutlines: THREE.InstancedMesh;
  private ult: THREE.Group;

  private eBullets: THREE.InstancedMesh;
  private eHalos: THREE.InstancedMesh;

  private shards: InstGroup;
  private kits: InstGroup;
  private mines: InstGroup;
  private mineFields: THREE.InstancedMesh;
  private mineFieldMat: THREE.MeshBasicMaterial;
  private boxInst: THREE.InstancedMesh | null = null;
  private boxGlow: THREE.InstancedMesh;
  private boxBeacon: THREE.InstancedMesh;

  constructor(scene: THREE.Scene) {
    scene.add(this.root);
    const shadowMat = new THREE.MeshBasicMaterial({ map: blobShadowTex(), transparent: true, depthWrite: false });
    const shadowGeo = new THREE.PlaneGeometry(1.6, 1.6);
    shadowGeo.rotateX(-Math.PI / 2);

    // ═════════ 玩家角色（金克丝原版模型） ═════════
    this.heroRig = new JinxRig(this.root);

    // ═════════ 断潮督军：背负船甲、手提重锚的巨型异兽 ═════════
    this.bossSkinMat = toonUnique(0x2b4654);
    const belly = toon(0x5d7f86), hullRed = toon(0xb24a2e), hullWhite = toon(0xeef1f2), hullDark = toon(0x2a2f35);
    const iron = toon(0x2e3842), ironHi = toon(0x56636e), barnacle = toon(0xd9d2bf), horn = toon(0xe6dcc6);
    this.bossEyeMat = new THREE.MeshBasicMaterial({ color: 0xff2e88 });

    const bShadowGeo = new THREE.PlaneGeometry(6.5, 6.5); bShadowGeo.rotateX(-Math.PI / 2);
    this.bossShadow = new THREE.Mesh(bShadowGeo, shadowMat);
    this.bossShadow.position.y = 0.03;

    const B = this.bossBody;
    const torsoB = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 12), this.bossSkinMat);
    torsoB.scale.set(1.15, 0.95, 1.05); torsoB.position.set(0, 2.0, 0);
    const bellyB = new THREE.Mesh(new THREE.SphereGeometry(1.1, 14, 10), belly);
    bellyB.scale.set(1, 0.9, 0.6); bellyB.position.set(0, 1.75, 0.82);
    // 粗腿
    for (const s of [-1, 1]) {
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.42, 1.2, 10), this.bossSkinMat);
      thigh.position.set(s * 0.95, 0.75, 0.1);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.35, 1.1), this.bossSkinMat);
      foot.position.set(s * 0.98, 0.18, 0.3);
      for (let k = -1; k <= 1; k++) {
        const claw = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.32, 5), horn);
        claw.rotation.x = Math.PI / 2; claw.position.set(s * 0.98 + k * 0.25, 0.12, 0.9);
        B.add(claw);
      }
      B.add(thigh, foot);
    }
    // 背负船甲：红色船底 + 白色舷线 + 舷窗 + 断烟囱 + 藤壶
    const hull = new THREE.Group();
    const keel = new THREE.Mesh(new THREE.BoxGeometry(3.3, 1.0, 2.5), hullRed); keel.position.y = 0;
    const keelBottom = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 3.3, 12, 1, false, 0, Math.PI), hullRed);
    keelBottom.rotation.z = Math.PI / 2; keelBottom.position.y = -0.45; keelBottom.scale.set(1, 1, 0.5);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.45, 2.6), hullWhite); rail.position.y = 0.68;
    const deckB = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 2.4), toon(0x9b7a55)); deckB.position.y = 0.95;
    const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 1.4, 10), hullDark); stack.position.set(-0.7, 1.6, -0.3); stack.rotation.z = 0.25;
    const stackBand = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.22, 10), hullRed); stackBand.position.set(-0.84, 2.05, -0.3); stackBand.rotation.z = 0.25;
    const cabinB = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.7, 1.0), hullWhite); cabinB.position.set(0.7, 1.35, -0.2);
    const winB = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.2, 1.02), this.bossEyeMat); winB.position.set(0.7, 1.45, -0.2);
    winB.userData.noOutline = true;
    hull.add(keel, keelBottom, rail, deckB, stack, stackBand, cabinB, winB);
    for (let i = 0; i < 4; i++) {
      for (const s of [-1, 1]) {
        const port = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 10), hullDark);
        port.rotation.x = Math.PI / 2; port.position.set(-1.1 + i * 0.72, 0.15, s * 1.27);
        port.userData.noOutline = true;
        hull.add(port);
      }
    }
    for (let i = 0; i < 9; i++) {
      const b = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.18, 6), barnacle);
      b.position.set(-1.5 + (i % 5) * 0.75, -0.5 + Math.floor(i / 5) * 0.4, -1.2 + (i % 2) * 0.1);
      b.rotation.x = -Math.PI / 2;
      b.userData.noOutline = true;
      hull.add(b);
    }
    hull.position.set(0, 3.15, -0.55);
    hull.rotation.x = -0.28;
    // 头：装甲额板 + 双角 + 玫红眼
    const H = this.bossHead;
    const skull = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.85, 1.0), this.bossSkinMat);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 0.6), iron); brow.position.set(0, 0.38, 0.25);
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.3, 0.8), belly); jaw.position.set(0, -0.42, 0.25);
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.06), this.bossEyeMat); eyeL.position.set(-0.32, 0.12, 0.52);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.06), this.bossEyeMat); eyeR.position.set(0.32, 0.12, 0.52);
    eyeL.userData.noOutline = true; eyeR.userData.noOutline = true;
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.8, 6), horn); hornL.position.set(-0.6, 0.6, 0); hornL.rotation.z = 0.6;
    const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.8, 6), horn); hornR.position.set(0.6, 0.6, 0); hornR.rotation.z = -0.6;
    for (let k = -2; k <= 2; k++) {
      const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 4), horn);
      tooth.rotation.x = Math.PI; tooth.position.set(k * 0.2, -0.22, 0.62);
      tooth.userData.noOutline = true;
      H.add(tooth);
    }
    H.add(skull, brow, jaw, eyeL, eyeR, hornL, hornR);
    H.position.set(0, 2.75, 1.35);
    // 左臂利爪
    const armLB = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.3, 1.5, 10), this.bossSkinMat);
    armLB.position.set(-1.75, 1.85, 0.4); armLB.rotation.set(0.5, 0, 0.35);
    const clawL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.6), iron); clawL.position.set(-2.0, 1.25, 0.95);
    // 右臂 + 重锚（可抬起/横扫）
    const A = this.bossArm;
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.36, 1.4, 10), this.bossSkinMat);
    upper.position.set(0, -0.5, 0.2); upper.rotation.x = 0.5;
    const fist = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.7), iron); fist.position.set(0, -0.95, 0.85);
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 3.6), iron); shaft.position.set(0, -0.95, 2.35);
    const stock = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.22, 0.22), ironHi); stock.position.set(0, -0.95, 1.1);
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.08, 6, 12), ironHi); ringA.position.set(0, -0.95, 0.55);
    const crown = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.34, 0.5), iron); crown.position.set(0, -0.95, 4.05);
    const flukeL = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.9, 4), ironHi); flukeL.position.set(-1.25, -0.95, 3.65); flukeL.rotation.set(Math.PI / 2 + 0.6, 0, 0.0); flukeL.rotation.order = 'YXZ';
    const flukeR = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.9, 4), ironHi); flukeR.position.set(1.25, -0.95, 3.65); flukeR.rotation.set(Math.PI / 2 + 0.6, 0, 0.0);
    // 锚链
    for (let i = 0; i < 4; i++) {
      const link = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.05, 5, 10), ironHi);
      link.position.set(0.3, -0.3 - i * 0.28, 0.1 - i * 0.05);
      link.rotation.y = i % 2 ? Math.PI / 2 : 0;
      link.userData.noOutline = true;
      A.add(link);
    }
    A.add(upper, fist, shaft, stock, ringA, crown, flukeL, flukeR);
    A.position.set(1.85, 2.6, 0.3);

    B.add(torsoB, bellyB, hull, H, armLB, clawL, A);
    addOutline(B, 0.06);
    B.traverse((o) => { if ((o as THREE.Mesh).isMesh && !(o as THREE.Mesh).userData.noOutline) o.castShadow = true; });
    this.boss.add(this.bossShadow, B);
    this.boss.visible = false;
    this.root.add(this.boss);

    // ═════════ 批处理异兽 ═════════
    const vmat = toon(0xffffff, { vertexColors: true });
    const N = BUDGET.maxEnemies;
    this.crawlers = new InstGroup(this.root, crawlerGeo(), vmat, N, 1.08);
    this.spitters = new InstGroup(this.root, spitterGeo(), vmat, N, 1.08);
    this.sacs = mkInst(this.root, sacGeo(), new THREE.MeshBasicMaterial({ color: 0xffffff }), N);
    this.sacs.setColorAt(0, WHITE);
    this.chargers = new InstGroup(this.root, chargerGeo(), vmat, N, 1.07);
    this.shadows = mkInst(this.root, shadowGeo, shadowMat, N + XP.maxShards + 32);
    this.shadows.renderOrder = 1;

    // ═════════ 友方投射物 ═════════
    const P = BUDGET.maxPlayerProjectiles;
    const mgGeo = new THREE.CapsuleGeometry(0.075, 0.5, 2, 6); mgGeo.rotateX(Math.PI / 2);
    this.mgBullets = mkInst(this.root, mgGeo, new THREE.MeshBasicMaterial({ color: 0x5ff6ff }), P);
    this.mgOutlines = mkInst(this.root, mgGeo, new THREE.MeshBasicMaterial({ color: 0x0b3a66, side: THREE.BackSide }), P);
    this.mgBullets.renderOrder = 9; this.mgOutlines.renderOrder = 8;
    const shellGeo = new THREE.SphereGeometry(0.24, 10, 8); shellGeo.scale(1, 1, 1.35);
    this.cnShells = mkInst(this.root, shellGeo, new THREE.MeshBasicMaterial({ color: 0xffb02e }), 48);
    this.cnOutlines = mkInst(this.root, shellGeo, new THREE.MeshBasicMaterial({ color: 0x6b2e05, side: THREE.BackSide }), 48);
    this.cnShells.renderOrder = 9; this.cnOutlines.renderOrder = 8;

    this.ult = new THREE.Group();
    const ultCore = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 1.3, 4, 10), new THREE.MeshBasicMaterial({ color: 0xe8ffff }));
    ultCore.rotation.x = Math.PI / 2;
    const ultGlow = new THREE.Mesh(new THREE.CapsuleGeometry(0.62, 1.7, 4, 10), new THREE.MeshBasicMaterial({ color: 0x3ff2ff, transparent: true, opacity: 0.45, depthWrite: false }));
    ultGlow.rotation.x = Math.PI / 2;
    const ultOut = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 1.36, 4, 10), new THREE.MeshBasicMaterial({ color: 0x063a5a, side: THREE.BackSide }));
    ultOut.rotation.x = Math.PI / 2;
    this.ult.add(ultOut, ultCore, ultGlow);
    this.ult.visible = false;
    this.root.add(this.ult);

    // ═════════ 敌弹：玫红芯 + 深紫外环，最高渲染优先级 ═════════
    const B2 = BUDGET.maxEnemyBullets;
    this.eHalos = mkInst(this.root, new THREE.SphereGeometry(0.4, 12, 8), new THREE.MeshBasicMaterial({ color: 0x3d0a4f, depthTest: false }), B2);
    this.eBullets = mkInst(this.root, new THREE.SphereGeometry(0.25, 12, 8), new THREE.MeshBasicMaterial({ color: 0xff2e8e, depthTest: false }), B2);
    this.eHalos.renderOrder = 30;
    this.eBullets.renderOrder = 31;

    // ═════════ 拾取物与地雷 ═════════
    this.shards = new InstGroup(this.root, shardGeo(), new THREE.MeshBasicMaterial({ color: 0xc4ff3a }), 260, 1.35, false);
    this.shards.outline.material = new THREE.MeshBasicMaterial({ color: 0x1d4a12, side: THREE.BackSide });
    this.kits = new InstGroup(this.root, kitGeo(), toon(0xffffff, { vertexColors: true }), 24, 1.12);
    this.mines = new InstGroup(this.root, mineGeo(), toon(0xffffff, { vertexColors: true }), 12, 1.1);
    const mfGeo = new THREE.RingGeometry(0.9, 1.0, 40); mfGeo.rotateX(-Math.PI / 2);
    this.mineFieldMat = new THREE.MeshBasicMaterial({ color: 0x2fe4ff, transparent: true, opacity: 0.55, depthWrite: false });
    this.mineFields = mkInst(this.root, mfGeo, this.mineFieldMat, 12);
    this.mineFields.renderOrder = 5;

    // ═════════ 66 个原版可破坏金属补给箱 ═════════
    const texLoader = new THREE.TextureLoader();
    const bgTex = texLoader.load('./assets/map1/vfx/box_glow.png');
    bgTex.colorSpace = THREE.SRGBColorSpace;

    const bgGeo = new THREE.PlaneGeometry(2.3, 2.3);
    bgGeo.rotateX(-Math.PI / 2);
    this.boxGlow = mkInst(
      this.root,
      bgGeo,
      new THREE.MeshBasicMaterial({
        map: bgTex,
        color: 0x3ef2ff,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
      72,
    );
    this.boxGlow.renderOrder = 3;

    // 原版 Temp_GroundGlow15 竖直蓝青光束信标
    const b1 = new THREE.PlaneGeometry(0.95, 3.8);
    b1.translate(0, 1.9, 0);
    const b2 = b1.clone().rotateY(Math.PI / 2);
    const beaconGeo = new THREE.BufferGeometry();
    const bpA = b1.attributes.position.array as Float32Array;
    const bpB = b2.attributes.position.array as Float32Array;
    const buA = b1.attributes.uv.array as Float32Array;
    const buB = b2.attributes.uv.array as Float32Array;
    const bPos = new Float32Array(bpA.length + bpB.length);
    bPos.set(bpA, 0); bPos.set(bpB, bpA.length);
    const bUv = new Float32Array(buA.length + buB.length);
    bUv.set(buA, 0); bUv.set(buB, buA.length);
    beaconGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
    beaconGeo.setAttribute('uv', new THREE.BufferAttribute(bUv, 2));
    beaconGeo.setIndex([...Array.from(b1.index!.array), ...Array.from(b2.index!.array).map((v) => v + 4)]);
    this.boxBeacon = mkInst(
      this.root,
      beaconGeo,
      new THREE.MeshBasicMaterial({
        map: bgTex,
        color: 0x5990ff,
        transparent: true,
        opacity: 0.34,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
      72,
    );
    this.boxBeacon.renderOrder = 6;

    const boxTex = texLoader.load('./assets/map1/props/metalbox.png');
    boxTex.colorSpace = THREE.SRGBColorSpace;
    boxTex.flipY = false;
    const boxMat = new THREE.MeshStandardMaterial({
      map: boxTex,
      roughness: 0.58,
      metalness: 0.34,
      side: THREE.DoubleSide,
    });
    new GLTFLoader().load('./assets/map1/props/metalbox.glb', (gltf) => {
      let boxGeo: THREE.BufferGeometry | null = null;
      gltf.scene.traverse((o) => {
        if (!boxGeo && o instanceof THREE.Mesh && o.geometry) {
          boxGeo = o.geometry.clone();
        }
      });
      if (!boxGeo) return;
      const g0 = boxGeo as THREE.BufferGeometry;
      g0.computeBoundingBox();
      const minY = g0.boundingBox ? g0.boundingBox.min.y : 0;
      g0.translate(0, -minY, 0);
      g0.scale(0.0058, 0.0058, 0.0058);

      const im = new THREE.InstancedMesh(g0, boxMat, 72);
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      im.frustumCulled = false;
      im.castShadow = true;
      im.receiveShadow = true;
      im.count = 0;
      im.setColorAt(0, WHITE);
      this.root.add(im);
      this.boxInst = im;
    });
  }

  update(g: Game, dt = 1 / 60) {
    const t = g.clock;

    // ═════════ 玩家角色 ═════════
    this.heroRig.update(g, dt);

    // ═════════ 异兽 ═════════
    this.crawlers.begin(); this.spitters.begin(); this.chargers.begin();
    let si = 0, shi = 0;
    for (const e of g.enemies) {
      if (!e.alive || e.kind === 'boss') continue;
      const sc = e.kind === 'elite' ? 1.9 : 1;
      const emerge = Math.min(1, e.age / 0.35);
      D.position.set(e.x, 0.015, e.z);
      D.rotation.set(0, 0, 0);
      D.scale.setScalar((e.r / 0.55) * 1.1 * emerge);
      D.updateMatrix();
      if (shi < this.shadows.instanceMatrix.count) this.shadows.setMatrixAt(shi++, D.matrix);

      const col = e.flash > 0.25 ? FLASH : e.bindT > 0 ? BIND : e.kind === 'elite' ? ELITE : WHITE;
      if (e.kind === 'crawler') {
        const wob = Math.sin(t * 16 + e.id) * 0.05;
        D.position.set(e.x, Math.abs(Math.sin(t * 16 + e.id)) * 0.04, e.z);
        D.rotation.set(0, e.face, wob);
        D.scale.setScalar(1.15 * emerge);
        D.updateMatrix();
        this.crawlers.push(D.matrix, col);
      } else if (e.kind === 'spitter') {
        const wind = e.state === 'windup';
        D.position.set(e.x, Math.sin(t * 6 + e.id) * 0.03, e.z);
        D.rotation.set(wind ? -0.15 : 0, e.face, 0);
        D.scale.setScalar(1.15 * emerge);
        D.updateMatrix();
        this.spitters.push(D.matrix, col);
        // 高背发光囊：平时暗玫红，蓄力时膨胀并快速闪亮
        const pulse = wind ? 1.25 + Math.sin(t * 26) * 0.15 : 0.95 + Math.sin(t * 3 + e.id) * 0.04;
        D.position.set(e.x - Math.sin(e.face) * 0.17, 1.12 * 1.15, e.z - Math.cos(e.face) * 0.17);
        D.rotation.set(0, 0, 0);
        D.scale.setScalar(pulse * emerge);
        D.updateMatrix();
        this.sacs.setMatrixAt(si, D.matrix);
        C.setHex(wind ? (Math.sin(t * 26) > 0 ? 0xff5cb5 : 0xffb0dc) : 0xa8336f);
        this.sacs.setColorAt(si++, C);
      } else {
        const wind = e.state === 'windup';
        const dash = e.state === 'dash';
        D.position.set(e.x, 0, e.z);
        // 蓄力：明显前倾并压低；冲刺：前冲姿态
        D.rotation.set(wind ? 0.42 : dash ? 0.25 : Math.sin(t * 8 + e.id) * 0.03, e.face, wind ? Math.sin(t * 40) * 0.04 : 0);
        D.scale.set(sc * 1.1 * emerge, sc * 1.1 * (wind ? 0.88 : 1) * emerge, sc * 1.1 * emerge);
        D.updateMatrix();
        this.chargers.push(D.matrix, col);
      }
    }
    this.crawlers.end(); this.spitters.end(); this.chargers.end();
    this.sacs.count = si;
    this.sacs.instanceMatrix.needsUpdate = true;
    if (this.sacs.instanceColor) this.sacs.instanceColor.needsUpdate = true;

    // ═════════ 首领 ═════════
    const b = g.boss;
    if (b && b.alive) {
      this.boss.visible = true;
      const entering = b.state === 'enter';
      const k = entering ? b.stateT / BOSS.entranceTime : 1;
      const jump = entering ? Math.sin(k * Math.PI) * 6 : 0;
      this.boss.position.set(b.x, 0, b.z);
      this.bossBody.position.y = jump;
      this.bossShadow.scale.setScalar(entering ? 0.5 + k * 0.5 : 1);
      this.boss.rotation.y = b.face;
      const phase2 = g.bossPhase === 2;
      this.bossSkinMat.emissive.setHex(b.flash > 0.25 ? 0x777777 : phase2 ? 0x3a0d22 : 0x000000);
      this.bossEyeMat.color.setHex(phase2 ? (Math.sin(t * 10) > 0 ? 0xff3ea8 : 0xff8fd0) : 0xff2e88);

      const anim = g.bossAnim;
      const u = Math.min(1, (g.time - anim.t0) / anim.dur);
      const A = this.bossArm;
      let bodyLean = 0, bodyTwist = 0, headTilt = 0, squash = 1;
      if (entering) {
        A.rotation.set(-1.0, 0, 0);
        headTilt = -0.3;
      } else if (b.state === 'transition') {
        // 转阶段：仰头咆哮，锚高举
        const s = Math.min(1, b.stateT / 0.5);
        A.rotation.set(-1.7 * s, 0, 0.3 * s);
        headTilt = -0.55 * s;
        bodyLean = -0.18 * s;
        squash = 1 + Math.sin(t * 30) * 0.02;
      } else if (anim.move === 'sweep' && u < 1) {
        // 拖锚横扫：大幅抬锚蓄力（向后拉），然后横扫
        const wind = 0.74;
        if (u < wind) {
          const s = u / wind;
          A.rotation.set(-1.25 * s, 1.1 * s, 0.25 * s);
          bodyTwist = 0.45 * s;
          bodyLean = -0.08 * s;
        } else {
          const s = (u - wind) / (1 - wind);
          A.rotation.set(-1.25 + 1.25 * s, 1.1 - 2.6 * s, 0.25);
          bodyTwist = 0.45 - 1.0 * s;
          bodyLean = 0.12;
        }
      } else if (anim.move === 'stomp' && u < 1) {
        // 断浪三踏：三次蹲起
        const s = Math.abs(Math.sin(u * Math.PI * 3));
        squash = 1 - s * 0.12;
        A.rotation.set(-0.6 + s * 0.5, 0, 0);
        bodyLean = s * 0.15;
      } else if (anim.move === 'ring' && u < 1) {
        // 潮门：锚举过头顶后重砸
        const s = Math.sin(u * Math.PI);
        A.rotation.set(-1.9 * s, 0, 0);
        headTilt = -0.3 * s;
      } else {
        A.rotation.set(Math.sin(t * 1.8) * 0.06, 0, 0);
        bodyLean = Math.sin(t * 1.8) * 0.02;
      }
      this.bossBody.rotation.set(bodyLean, bodyTwist, 0);
      this.bossBody.scale.set(1, squash, 1);
      this.bossHead.rotation.x = headTilt;
    } else {
      this.boss.visible = false;
    }

    // ═════════ 投射物 ═════════
    let mi = 0, ci = 0;
    this.ult.visible = false;
    for (const pr of g.projectiles) {
      if (!pr.alive) continue;
      const yawp = Math.atan2(pr.vx, pr.vz);
      if (pr.kind === 'mg' || pr.kind === 'shard') {
        D.position.set(pr.x, 0.9, pr.z);
        D.rotation.set(0, yawp, 0);
        if (pr.kind === 'shard') D.scale.set(1.5, 1.5, 0.7);
        else D.scale.set(1 + pr.tier * 0.25, 1 + pr.tier * 0.25, 1 + pr.tier * 0.55);
        D.updateMatrix();
        this.mgBullets.setMatrixAt(mi, D.matrix);
        D.scale.multiplyScalar(1.45);
        D.updateMatrix();
        this.mgOutlines.setMatrixAt(mi++, D.matrix);
      } else if (pr.kind === 'cn') {
        D.position.set(pr.x, 0.95 + Math.sin((pr.travel / Math.max(1, pr.range)) * Math.PI) * 0.8, pr.z);
        D.rotation.set(0, yawp, 0);
        D.scale.setScalar(1 + pr.tier * 0.12);
        D.updateMatrix();
        this.cnShells.setMatrixAt(ci, D.matrix);
        D.scale.multiplyScalar(1.3);
        D.updateMatrix();
        this.cnOutlines.setMatrixAt(ci++, D.matrix);
      } else {
        this.ult.visible = true;
        this.ult.position.set(pr.x, 1.0, pr.z);
        this.ult.rotation.y = yawp;
        this.ult.children[2].scale.setScalar(1 + Math.sin(t * 40) * 0.12);
      }
    }
    this.mgBullets.count = mi; this.mgOutlines.count = mi;
    this.cnShells.count = ci; this.cnOutlines.count = ci;
    for (const m of [this.mgBullets, this.mgOutlines, this.cnShells, this.cnOutlines]) m.instanceMatrix.needsUpdate = true;

    // ═════════ 敌弹 ═════════
    let ei = 0;
    const pulse = 1 + Math.sin(t * 14) * 0.08;
    for (const eb of g.enemyBullets) {
      if (!eb.alive) continue;
      D.position.set(eb.x, 0.85, eb.z);
      D.rotation.set(0, 0, 0);
      D.scale.setScalar((eb.r / 0.26) * pulse);
      D.updateMatrix();
      this.eHalos.setMatrixAt(ei, D.matrix);
      D.scale.setScalar(eb.r / 0.26);
      D.updateMatrix();
      this.eBullets.setMatrixAt(ei++, D.matrix);
    }
    this.eBullets.count = ei; this.eHalos.count = ei;
    this.eBullets.instanceMatrix.needsUpdate = true; this.eHalos.instanceMatrix.needsUpdate = true;

    // ═════════ 经验晶片 / 维修包 ═════════
    this.shards.begin();
    for (const s of g.shards) {
      if (!s.alive) continue;
      D.position.set(s.x, 0.42 + Math.sin(t * 4 + s.x * 2) * 0.1, s.z);
      D.rotation.set(0, t * 2.4 + s.z, 0);
      D.scale.setScalar(s.value >= 4 ? 1.6 : s.value >= 2 ? 1.25 : 1);
      D.updateMatrix();
      this.shards.push(D.matrix, WHITE);
      D.position.y = 0.015;
      D.scale.setScalar(0.32 * (s.value >= 2 ? 1.3 : 1));
      D.updateMatrix();
      if (shi < this.shadows.instanceMatrix.count) this.shadows.setMatrixAt(shi++, D.matrix);
    }
    this.shards.end();
    this.kits.begin();
    for (const k of g.pickups) {
      if (!k.alive) continue;
      D.position.set(k.x, 0.4 + Math.sin(t * 3) * 0.1, k.z);
      D.rotation.set(0, t * 1.6, 0);
      D.scale.setScalar(k.heal >= 25 ? 1.35 : 1);
      D.updateMatrix();
      this.kits.push(D.matrix, WHITE);
    }
    this.kits.end();
    this.shadows.count = Math.min(shi, this.shadows.instanceMatrix.count);
    this.shadows.instanceMatrix.needsUpdate = true;

    // ═════════ 磁索地雷 ═════════
    this.mines.begin();
    let fi = 0;
    for (const m of g.mines) {
      if (!m.alive) continue;
      if (!m.triggered) {
        const blink = m.age > 0.3 && Math.sin(t * 10) > 0;
        D.position.set(m.x, 0.09, m.z);
        D.rotation.set(0, t * 1.5, 0);
        D.scale.setScalar(1);
        D.updateMatrix();
        this.mines.push(D.matrix, blink ? BIND : WHITE);
      } else {
        D.position.set(m.x, 0.04, m.z);
        D.rotation.set(0, t * 0.8, 0);
        D.scale.setScalar(3.4 * m.scale * (0.97 + Math.sin(t * 9) * 0.03));
        D.updateMatrix();
        this.mineFields.setMatrixAt(fi++, D.matrix);
      }
    }
    this.mines.end();
    this.mineFields.count = fi;
    this.mineFields.instanceMatrix.needsUpdate = true;

    // ═════════ 原版金属补给箱 ═════════
    let bgi = 0;
    let bi = 0;
    for (const b of g.boxes) {
      if (!b.alive) continue;
      const sc = b.flash > 0 ? 1 + b.flash * 0.08 : 1;
      D.position.set(b.x, 0.04, b.z);
      D.rotation.set(0, 0, 0);
      D.scale.setScalar(0.95 + Math.sin(t * 3.5 + b.id) * 0.06);
      D.updateMatrix();
      if (bgi < this.boxGlow.instanceMatrix.count) {
        this.boxGlow.setMatrixAt(bgi, D.matrix);
        D.position.set(b.x, 0.25, b.z);
        D.scale.set(1, 0.92 + Math.sin(t * 2.8 + b.id) * 0.1, 1);
        D.updateMatrix();
        this.boxBeacon.setMatrixAt(bgi, D.matrix);
        bgi++;
      }

      if (this.boxInst && bi < this.boxInst.instanceMatrix.count) {
        D.position.set(b.x, 0, b.z);
        D.rotation.set(0, b.rotY, 0);
        D.scale.set(sc, b.flash > 0 ? 1 - b.flash * 0.08 : 1, sc);
        D.updateMatrix();
        this.boxInst.setMatrixAt(bi, D.matrix);
        this.boxInst.setColorAt(bi, b.flash > 0.2 ? FLASH : WHITE);
        bi++;
      }
    }
    this.boxGlow.count = bgi;
    this.boxGlow.instanceMatrix.needsUpdate = true;
    this.boxBeacon.count = bgi;
    this.boxBeacon.instanceMatrix.needsUpdate = true;
    if (this.boxInst) {
      this.boxInst.count = bi;
      this.boxInst.instanceMatrix.needsUpdate = true;
      if (this.boxInst.instanceColor) this.boxInst.instanceColor.needsUpdate = true;
    }
  }
}
