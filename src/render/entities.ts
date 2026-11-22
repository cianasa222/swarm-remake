import * as THREE from 'three';
import { BUDGET, ENEMY_SCALES, XP } from '../config';
import type { Enemy, Game } from '../sim/game';
import { getTexture, loadGLB } from './assets';
import { RekSaiRig } from './boss_reksai';
import { EliteBruiserPool, InstancedEnemyModel, type VatClipKey } from './enemy_models';
import { type HeroRig, JinxRig } from './hero_jinx';
import { JinxVfxSystem } from './jinx_vfx';
import { WeaponVfxRenderer } from './weapon_vfx';
import { blobShadowTex, merge, OUTLINE_MAT, paint, place, toon } from './style';

const D = new THREE.Object3D();
const WHITE = new THREE.Color(1, 1, 1);
const FLASH = new THREE.Color(2.6, 2.6, 2.6);
const BIND = new THREE.Color(0.75, 1.7, 1.9);

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

// ───────────────────────── 拾取物与地雷几何 ─────────────────────────

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

  // 玩家角色 & 首领
  private heroRig: HeroRig;
  readonly reksaiRig: RekSaiRig;
  private elitePool: EliteBruiserPool;
  private eliteBuf: Enemy[] = [];
  private lastPlayer: Game['player'] | null = null;
  /** Q-22：记录每只小怪进入当前状态的时刻，用于攻击动作从头播放 */
  private attackClock = new WeakMap<Enemy, number>();

  // 原版小怪合批
  private pixPool: InstancedEnemyModel;
  private ghoulPool: InstancedEnemyModel;
  private hunterPool: InstancedEnemyModel;
  private dasherPool: InstancedEnemyModel;
  private shadows: THREE.InstancedMesh;

  readonly weaponVfx: WeaponVfxRenderer;
  private ultRocket: THREE.Group | null = null;

  private eBullets: THREE.InstancedMesh;
  private eHalos: THREE.InstancedMesh;

  private shards: InstGroup;
  private kits: InstGroup;
  private mines: InstGroup;
  private mineFields: THREE.InstancedMesh;
  private mineFieldMat: THREE.MeshBasicMaterial;
  private cardGroup: THREE.InstancedMesh;
  private cardBeacons: THREE.InstancedMesh;
  private boxInst: THREE.InstancedMesh | null = null;
  private boxGlow: THREE.InstancedMesh;
  private boxBeacon: THREE.InstancedMesh;

  constructor(scene: THREE.Scene) {
    scene.add(this.root);
    const shadowMat = new THREE.MeshBasicMaterial({ map: blobShadowTex(), transparent: true, depthWrite: false });
    const shadowGeo = new THREE.PlaneGeometry(1.6, 1.6);
    shadowGeo.rotateX(-Math.PI / 2);

    // ═════════ 玩家角色（金克丝原版模型） & 最终首领（雷克塞） ═════════
    this.heroRig = new JinxRig(this.root);
    this.reksaiRig = new RekSaiRig(this.root, true);
    this.elitePool = new EliteBruiserPool(this.root, 6, true);

    // ═════════ 原版 3D 小怪合批 ═════════
    const N = BUDGET.maxEnemies;
    this.pixPool = new InstancedEnemyModel(this.root, './assets/enemies/enemy_pix.glb', './assets/enemies/enemy_pix.webp', N);
    this.ghoulPool = new InstancedEnemyModel(this.root, './assets/enemies/enemy_ghoul.glb', './assets/enemies/enemy_ghoul.webp', N);
    this.hunterPool = new InstancedEnemyModel(this.root, './assets/enemies/enemy_hunter.glb', './assets/enemies/enemy_hunter.webp', N, true);
    this.dasherPool = new InstancedEnemyModel(this.root, './assets/enemies/enemy_dasher.glb', './assets/enemies/enemy_dasher.webp', N, true);
    this.shadows = mkInst(this.root, shadowGeo, shadowMat, N + XP.maxShards + 32);
    this.shadows.renderOrder = 1;

    // ═════════ 官方 10 武器 VFX 渲染器 ═════════
    this.weaponVfx = new WeaponVfxRenderer(this.root);

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
    this.mines = new InstGroup(this.root, mineGeo(), toon(0xffffff, { vertexColors: true }), 24, 1.1);
    const mfGeo = new THREE.RingGeometry(0.86, 1.0, 40); mfGeo.rotateX(-Math.PI / 2);
    this.mineFieldMat = new THREE.MeshBasicMaterial({ color: 0xff9b35, transparent: true, opacity: 0.55, depthWrite: false });
    this.mineFields = mkInst(this.root, mfGeo, this.mineFieldMat, 32);
    this.mineFields.renderOrder = 5;

    // 精英访问卡（金色旋转卡牌 + 光柱）
    const cGeo = new THREE.BoxGeometry(0.55, 0.78, 0.08);
    this.cardGroup = mkInst(this.root, cGeo, new THREE.MeshBasicMaterial({ color: 0xffd54a }), 12);
    this.cardGroup.renderOrder = 10;
    const cbGeo = new THREE.CylinderGeometry(0.28, 0.42, 4.2, 12, 1, true);
    cbGeo.translate(0, 2.1, 0);
    this.cardBeacons = mkInst(
      this.root, cbGeo,
      new THREE.MeshBasicMaterial({ color: 0xffe066, transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }),
      12,
    );
    this.cardBeacons.renderOrder = 7;

    // ═════════ 66 个原版可破坏金属补给箱 ═════════
    const bgTex = getTexture('./assets/map1/vfx/box_glow.webp');

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

    const boxTex = getTexture('./assets/map1/props/metalbox.webp', { flipY: false });
    const boxMat = new THREE.MeshStandardMaterial({
      map: boxTex,
      roughness: 0.58,
      metalness: 0.34,
      side: THREE.DoubleSide,
    });
    loadGLB('./assets/map1/props/metalbox.glb').then((gltf) => {
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

  attachJinxVfx(jinxVfx: JinxVfxSystem) {
    this.ultRocket = jinxVfx.rocketGroup;
  }

  loadStage2() {
    this.hunterPool.ensureLoaded();
    this.dasherPool.ensureLoaded();
    this.elitePool.ensureLoaded();
    this.reksaiRig.ensureLoaded();
  }

  heroReady(): Promise<void> {
    return this.heroRig instanceof JinxRig ? this.heroRig.ready : Promise.resolve();
  }

  /** 返回该敌人进入当前 state 的时刻（渲染侧记录，不改模拟） */
  private clipTime(e: Enemy, animated: boolean, attack: boolean, now: number): number {
    if (!animated) return 0;
    if (!attack) {
      this.attackClock.delete(e);
      return now + e.id * 0.137;
    }
    let start = this.attackClock.get(e);
    if (start === undefined) {
      start = now;
      this.attackClock.set(e, start);
    }
    return now - start;
  }

  update(g: Game, dt = 1 / 60) {
    const t = g.clock;
    // Game.reset creates a new player object, even if no frame at clock zero was rendered.
    if (this.lastPlayer !== g.player) {
      this.elitePool.reset();
      this.attackClock = new WeakMap();
      this.lastPlayer = g.player;
    }

    // ═════════ 玩家角色 ═════════
    this.heroRig.update(g, dt);

    // ═════════ 原版 3D 敌人 & 精英 ═════════
    this.pixPool.begin();
    this.ghoulPool.begin();
    this.hunterPool.begin();
    this.dasherPool.begin();
    this.eliteBuf.length = 0;

    let shi = 0;
    for (const e of g.enemies) {
      if (!e.alive || e.kind === 'boss') continue;
      if (e.kind === 'elite') {
        this.eliteBuf.push(e);
        continue;
      }

      const emerge = Math.min(1, e.age / 0.35);
      D.position.set(e.x, 0.015, e.z);
      D.rotation.set(0, 0, 0);
      D.scale.setScalar((e.r / 0.55) * 1.15 * emerge);
      D.updateMatrix();
      if (shi < this.shadows.instanceMatrix.count) this.shadows.setMatrixAt(shi++, D.matrix);

      const col = e.flash > 0.25 ? FLASH : e.bindT > 0 ? BIND : WHITE;
      // Q-22：模型带原版动作时播 VAT 动作（攻击类状态 → attack，其余 → run），
      // 并去掉为「静止模型」补的正弦起伏 / 前倾；没有动作时保持旧效果不变。
      const atk = e.state === 'windup' || e.state === 'attack' || e.state === 'dash';
      const clip: VatClipKey = atk ? 'attack' : 'run';
      if (e.kind === 'crawler') {
        const isPix = e.variant === 'pix';
        const pool = isPix ? this.pixPool : this.ghoulPool;
        const baseScale = isPix ? ENEMY_SCALES.pix : ENEMY_SCALES.ghoul;
        if (pool.animated) {
          D.position.set(e.x, isPix ? 0.35 : 0, e.z);
          D.rotation.set(0, e.face, 0);
        } else {
          const bob = isPix ? 0.35 + Math.sin(t * 7 + e.id) * 0.08 : Math.abs(Math.sin(t * 14 + e.id)) * 0.04;
          const wob = Math.sin(t * 14 + e.id) * 0.06;
          D.position.set(e.x, bob, e.z);
          D.rotation.set(0, e.face, wob);
        }
        D.scale.setScalar(baseScale * emerge);
        D.updateMatrix();
        pool.push(D.matrix, col, clip, this.clipTime(e, pool.animated, atk, t));
      } else if (e.kind === 'spitter') {
        const wind = e.state === 'windup';
        if (this.hunterPool.animated) {
          D.position.set(e.x, 0, e.z);
          D.rotation.set(0, e.face, 0);
        } else {
          D.position.set(e.x, Math.sin(t * 6 + e.id) * 0.03, e.z);
          D.rotation.set(wind ? -0.18 : 0, e.face, 0);
        }
        D.scale.setScalar(ENEMY_SCALES.hunter * emerge);
        D.updateMatrix();
        this.hunterPool.push(D.matrix, col, clip, this.clipTime(e, this.hunterPool.animated, atk, t));
      } else {
        const wind = e.state === 'windup';
        const dash = e.state === 'dash';
        const s = ENEMY_SCALES.dasher * emerge;
        if (this.dasherPool.animated) {
          D.position.set(e.x, 0.04, e.z);
          D.rotation.set(0, e.face, 0);
          D.scale.setScalar(s);
        } else {
          D.position.set(e.x, 0.04 + Math.sin(t * 10 + e.id) * 0.03, e.z);
          D.rotation.set(wind ? 0.38 : dash ? 0.24 : Math.sin(t * 8 + e.id) * 0.04, e.face, wind ? Math.sin(t * 36) * 0.05 : 0);
          D.scale.set(s, s * (wind ? 0.88 : 1), s);
        }
        D.updateMatrix();
        this.dasherPool.push(D.matrix, col, clip, this.clipTime(e, this.dasherPool.animated, atk, t));
      }
    }
    this.pixPool.end();
    this.ghoulPool.end();
    this.hunterPool.end();
    this.dasherPool.end();
    this.elitePool.update(this.eliteBuf, dt);

    // ═════════ 最终首领：雷克塞 ═════════
    this.reksaiRig.update(g, dt);

    // ═════════ 官方武器投射物与场内特效 + R 超究极死神飞弹 ═════════
    this.weaponVfx.update(g, dt);
    if (this.ultRocket) this.ultRocket.visible = false;
    for (const pr of g.projectiles) {
      if (!pr.alive || pr.kind !== 'ult_r') continue;
      if (this.ultRocket) {
        this.ultRocket.visible = true;
        this.ultRocket.position.set(pr.x, 1.05, pr.z);
        this.ultRocket.rotation.y = Math.atan2(pr.vx, pr.vz);
      }
    }

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

    // ═════════ 幻灵地雷（仅地雷类显示橙色倒计时圈）& 精英访问卡 ═════════
    this.mines.begin();
    let fi = 0;
    for (const z of g.weaponZones) {
      if (z.kind !== 'mine' && z.kind !== 'mine_sub') continue;
      D.position.set(z.x, 0.09, z.z);
      D.rotation.set(0, t * 2.4, 0);
      D.scale.setScalar(z.kind === 'mine_sub' ? 0.72 : 1);
      D.updateMatrix();
      this.mines.push(D.matrix, Math.sin(t * 18) > 0 ? BIND : WHITE);
      if (fi < this.mineFields.instanceMatrix.count) {
        D.position.set(z.x, 0.05, z.z);
        D.rotation.set(0, t * 1.1, 0);
        D.scale.setScalar(z.r);
        D.updateMatrix();
        this.mineFields.setMatrixAt(fi++, D.matrix);
      }
    }
    this.mines.end();
    this.mineFields.count = fi;
    this.mineFields.instanceMatrix.needsUpdate = true;

    let aci = 0;
    for (const c of g.accessCards) {
      if (!c.alive || aci >= this.cardGroup.instanceMatrix.count) continue;
      D.position.set(c.x, 0.85 + Math.sin(t * 4 + c.x) * 0.15, c.z);
      D.rotation.set(0.2, t * 2.8, 0);
      D.scale.setScalar(1);
      D.updateMatrix();
      this.cardGroup.setMatrixAt(aci, D.matrix);
      D.position.set(c.x, 0, c.z);
      D.rotation.set(0, 0, 0);
      D.scale.setScalar(1);
      D.updateMatrix();
      this.cardBeacons.setMatrixAt(aci++, D.matrix);
    }
    this.cardGroup.count = aci;
    this.cardBeacons.count = aci;
    this.cardGroup.instanceMatrix.needsUpdate = true;
    this.cardBeacons.instanceMatrix.needsUpdate = true;

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
