import * as THREE from 'three';
import type { Game } from '../sim/game';
import { getTexture, loadScbGeo, type TextureOpts } from './assets';

function mkCrossedPlaneGeo(w: number, l: number): THREE.BufferGeometry {
  // 两片均沿 Z 轴延展且贴图前端朝 +Z 飞行方向（一片水平 XZ，一片竖直 YZ）
  const g1 = new THREE.PlaneGeometry(w, l);
  g1.rotateX(-Math.PI / 2);
  g1.rotateY(Math.PI);
  const g2 = new THREE.PlaneGeometry(w, l);
  g2.rotateX(-Math.PI / 2);
  g2.rotateY(Math.PI);
  g2.rotateZ(Math.PI / 2);
  const p1 = g1.attributes.position.array as Float32Array;
  const p2 = g2.attributes.position.array as Float32Array;
  const u1 = g1.attributes.uv.array as Float32Array;
  const u2 = g2.attributes.uv.array as Float32Array;
  const pos = new Float32Array(p1.length + p2.length);
  pos.set(p1, 0); pos.set(p2, p1.length);
  const uv = new Float32Array(u1.length + u2.length);
  uv.set(u1, 0); uv.set(u2, u1.length);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const i1 = Array.from(g1.index!.array);
  const i2 = Array.from(g2.index!.array).map((v) => v + 4);
  geo.setIndex([...i1, ...i2]);
  g1.dispose(); g2.dispose();
  return geo;
}

function mkFlatGeo(w: number, l: number): THREE.BufferGeometry {
  const g = new THREE.PlaneGeometry(w, l);
  g.rotateX(-Math.PI / 2);
  return g;
}

function mkInst(root: THREE.Group, geo: THREE.BufferGeometry, mat: THREE.Material, cap: number, order = 9) {
  const m = new THREE.InstancedMesh(geo, mat, cap);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.frustumCulled = false;
  m.count = 0;
  m.renderOrder = order;
  root.add(m);
  return m;
}

const D = new THREE.Object3D();
const WHITE = new THREE.Color(1, 1, 1);

interface SkyBeam {
  group: THREE.Group;
  age: number;
  life: number;
  active: boolean;
}

interface BurstItem {
  mesh: THREE.Mesh;
  age: number;
  life: number;
  s0: number;
  s1: number;
  maxOp: number;
  active: boolean;
}

/**
 * 《无尽狂潮》全部 10 把官方武器 1:1 视觉 VFX 渲染器（池化零 GC）：
 * - E 鱼骨头 3D 猫猫火箭（cat_rocket.json + props_tx.png）
 * - 喵喵枪 / 战猫弹幕（project_bolts.png 双交叉发光光弹）
 * - UwU / 十字弩 / 回旋刃 / 旋风切割器（官方武器贴图）
 * - 耀光力场（3D hr_outline.json + hr_fire.json + 滚动 hr_noise.png）
 * - 斯塔缇克闪电链（0.72m 宽幅官方闪电光带）
 * - 战兔巨爆（star_target 准星 + 13m 垂直激光柱 + star_burst 3D 爆裂 + star_crack 地裂）
 * - 冰爆护甲（3D frost_ring.json + frost_crack 地裂 + frost_shield 进化冰盾）
 */
export class WeaponVfxRenderer {
  readonly root = new THREE.Group();

  // 投射物官方贴图池
  private meowInst: THREE.InstancedMesh;
  private uwuInst: THREE.InstancedMesh;
  private crossbowInst: THREE.InstancedMesh;
  private boomInst: THREE.InstancedMesh;
  private boomEvoInst: THREE.InstancedMesh;
  private orbitalInst: THREE.InstancedMesh;
  private orbitalEvoInst: THREE.InstancedMesh;

  // E 鱼骨头 3D 猫猫火箭池
  private catRocketPool: THREE.Group[] = [];
  private catGeo: THREE.BufferGeometry | null = null;
  private catMat: THREE.MeshStandardMaterial;
  private catGlowGeo: THREE.BufferGeometry;
  private catGlowMat: THREE.MeshBasicMaterial;

  // 耀光力场官方 3D 网格
  private hrGroup = new THREE.Group();
  private hrOutlineMesh: THREE.Mesh | null = null;
  private hrFireMesh: THREE.Mesh | null = null;
  private hrNoiseTex: THREE.Texture;
  private hrGlowTex: THREE.Texture;

  // 进化冰盾官方贴图球罩
  private iceShieldMesh: THREE.Mesh;

  // 斯塔缇克宽幅 3D 闪电光带池
  private boltPool: THREE.Mesh[] = [];
  private boltGeo: THREE.BufferGeometry;

  // 战兔巨爆地面准星池 & 雷暴电圈池
  private starTargets: THREE.InstancedMesh;
  private stormRings: THREE.InstancedMesh;
  private skyBeams: SkyBeam[] = [];
  private vfxBursts: BurstItem[] = [];

  private geoStarBurst: THREE.BufferGeometry | null = null;
  private geoFrostRing: THREE.BufferGeometry | null = null;
  private unitFlatGeo: THREE.BufferGeometry;
  private texStarCrack: THREE.Texture;
  private texFrostCrack: THREE.Texture;
  private texStarInner: THREE.Texture;
  private texFrostTile: THREE.Texture;

  constructor(parent: THREE.Group) {
    parent.add(this.root);

    const loadTex = (url: string, opts?: TextureOpts) => getTexture(url, opts);

    const mkAdd = (tex: THREE.Texture, color = 0xffffff, opacity = 0.92) => new THREE.MeshBasicMaterial({
      map: tex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false,
    });

    // 1. 投射物官方贴图合批（网格材质原生 repeat/offset 裁剪单格）
    const boltTex = loadTex('./assets/heroes/jinx/vfx/project_bolts.webp', { unique: true });
    boltTex.repeat.set(0.5, 1);
    boltTex.offset.set(0, 0);
    this.meowInst = mkInst(this.root, mkCrossedPlaneGeo(0.45, 1.45), mkAdd(boltTex, 0xffffff, 0.96), 320, 10);
    this.meowInst.setColorAt(0, WHITE);

    const uwuTex = loadTex('./assets/weapons/vfx/uwu_ball.webp');
    this.uwuInst = mkInst(this.root, mkFlatGeo(0.95, 0.95), mkAdd(uwuTex, 0xff9be6, 0.95), 64, 10);

    const cbTex = loadTex('./assets/weapons/vfx/crossbow_bolt.webp', { unique: true });
    cbTex.repeat.set(0.38, 1);
    cbTex.offset.set(0, 0);
    this.crossbowInst = mkInst(this.root, mkCrossedPlaneGeo(0.55, 1.55), mkAdd(cbTex, 0xffffff, 0.95), 96, 10);
    this.crossbowInst.setColorAt(0, WHITE);

    const boomTex = loadTex('./assets/weapons/vfx/boom_mis.webp');
    const boomEvoTex = loadTex('./assets/weapons/vfx/boom_mis_evo.webp');
    this.boomInst = mkInst(this.root, mkFlatGeo(1.45, 1.45), mkAdd(boomTex, 0xffffff, 0.95), 36, 10);
    this.boomEvoInst = mkInst(this.root, mkFlatGeo(1.75, 1.75), mkAdd(boomEvoTex, 0xffffff, 0.98), 36, 10);

    const orbTex = loadTex('./assets/weapons/vfx/bauble_blade.webp');
    const orbEvoTex = loadTex('./assets/weapons/vfx/bauble_blade_evo.webp');
    this.orbitalInst = mkInst(this.root, mkFlatGeo(1.6, 1.6), mkAdd(orbTex, 0xffffff, 0.95), 16, 10);
    this.orbitalEvoInst = mkInst(this.root, mkFlatGeo(2.05, 2.05), mkAdd(orbEvoTex, 0xffffff, 0.98), 16, 10);

    // 2. E 鱼骨头 3D 猫猫火箭池（最多同屏 18 枚）
    const propsTex = loadTex('./assets/heroes/jinx/vfx/props_tx.webp', { flipY: false });
    this.catMat = new THREE.MeshStandardMaterial({
      map: propsTex, roughness: 0.45, metalness: 0.2,
      emissive: new THREE.Color(0x552210), emissiveIntensity: 0.45, side: THREE.DoubleSide,
    });
    const baseGlow = loadTex('./assets/heroes/jinx/vfx/base_glow.webp');
    this.catGlowGeo = mkFlatGeo(0.55, 1.35);
    this.catGlowMat = mkAdd(baseGlow, 0xff9e38, 0.78);

    loadScbGeo('./assets/heroes/jinx/vfx/cat_rocket.json').then((geo) => {
      this.catGeo = geo;
      for (let i = 0; i < 18; i++) {
        const g = new THREE.Group();
        const m = new THREE.Mesh(this.catGeo, this.catMat);
        m.scale.setScalar(0.020);
        const tail = new THREE.Mesh(this.catGlowGeo, this.catGlowMat);
        tail.position.z = -0.7;
        g.add(m, tail);
        g.visible = false;
        this.root.add(g);
        this.catRocketPool.push(g);
      }
    }).catch(() => {});

    // 3. 耀光力场官方 3D 网格
    this.hrGlowTex = loadTex('./assets/weapons/vfx/hr_glow.webp');
    this.hrNoiseTex = loadTex('./assets/weapons/vfx/hr_noise.webp', { repeat: true });
    this.hrGroup.visible = false;
    this.root.add(this.hrGroup);

    loadScbGeo('./assets/weapons/vfx/hr_outline.json').then((geo) => {
      this.hrOutlineMesh = new THREE.Mesh(geo, mkAdd(this.hrGlowTex, 0x55ff70, 0.72));
      this.hrOutlineMesh.position.y = 0.05;
      this.hrOutlineMesh.renderOrder = 6;
      this.hrGroup.add(this.hrOutlineMesh);
    }).catch(() => {});
    loadScbGeo('./assets/weapons/vfx/hr_fire.json').then((geo) => {
      this.hrFireMesh = new THREE.Mesh(geo, mkAdd(this.hrNoiseTex, 0x22cc44, 0.48));
      this.hrFireMesh.position.y = 0.04;
      this.hrFireMesh.renderOrder = 5;
      this.hrGroup.add(this.hrFireMesh);
    }).catch(() => {});

    // 4. 进化冰盾球罩
    const shieldTex = loadTex('./assets/weapons/vfx/frost_shield.webp');
    this.iceShieldMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 18, 14),
      mkAdd(shieldTex, 0x7ef2ff, 0.58),
    );
    this.iceShieldMesh.visible = false;
    this.iceShieldMesh.renderOrder = 12;
    this.root.add(this.iceShieldMesh);

    // 5. 斯塔缇克宽幅 3D 闪电光带池（32 条，UV 裁剪 4×1 单列）
    const boltWaveTex = loadTex('./assets/weapons/vfx/statikk_bolt.webp', { unique: true });
    boltWaveTex.repeat.set(0.25, 1);
    boltWaveTex.offset.set(0, 0);
    this.boltGeo = new THREE.PlaneGeometry(0.85, 1);
    this.boltGeo.rotateX(-Math.PI / 2);
    for (let i = 0; i < 32; i++) {
      const m = new THREE.Mesh(this.boltGeo, mkAdd(boltWaveTex, 0x7efaff, 0.95));
      m.visible = false;
      m.renderOrder = 16;
      this.root.add(m);
      this.boltPool.push(m);
    }

    // 6. 战兔巨爆地面准星（star_target.webp）& 电刀雷暴圆形电环（circle_mis.webp）
    const starTargetTex = loadTex('./assets/weapons/vfx/star_target.webp');
    this.starTargets = mkInst(this.root, mkFlatGeo(2.0, 2.0), mkAdd(starTargetTex, 0x72f8ff, 0.9), 24, 6);

    const stormTex = loadTex('./assets/heroes/jinx/vfx/circle_mis.webp');
    this.stormRings = mkInst(this.root, mkFlatGeo(1.0, 1.0), mkAdd(stormTex, 0x45f2ff, 0.58), 24, 6);

    // 7. 战兔巨爆 13m 垂直通天激光柱池（12 个）
    const beamCoreTex = loadTex('./assets/weapons/vfx/star_beam_core.webp');
    const beamCenterTex = loadTex('./assets/weapons/vfx/star_beam_center.webp');
    const bPlane = new THREE.PlaneGeometry(1.8, 14.0);
    bPlane.translate(0, 7.0, 0);
    const bMat1 = mkAdd(beamCoreTex, 0x8ef9ff, 0.95);
    const bMat2 = mkAdd(beamCenterTex, 0xffe485, 0.9);
    for (let i = 0; i < 12; i++) {
      const g = new THREE.Group();
      const pA = new THREE.Mesh(bPlane, bMat1);
      const pB = new THREE.Mesh(bPlane, bMat1);
      pB.rotation.y = Math.PI / 2;
      const pC = new THREE.Mesh(bPlane, bMat2);
      pC.scale.set(0.65, 1, 1);
      const pD = new THREE.Mesh(bPlane, bMat2);
      pD.rotation.y = Math.PI / 2;
      pD.scale.set(0.65, 1, 1);
      g.add(pA, pB, pC, pD);
      g.visible = false;
      g.renderOrder = 16;
      this.root.add(g);
      this.skyBeams.push({ group: g, age: 0, life: 0.42, active: false });
    }

    // 8. 通用炸裂贴花 / 3D SCB 池（星爆裂纹、冰爆环等）
    this.unitFlatGeo = mkFlatGeo(2.0, 2.0);
    this.texStarCrack = loadTex('./assets/weapons/vfx/star_crack.webp');
    this.texFrostCrack = loadTex('./assets/weapons/vfx/frost_crack.webp');
    this.texStarInner = loadTex('./assets/heroes/jinx/vfx/e_erosion.webp');
    this.texFrostTile = loadTex('./assets/weapons/vfx/frost_tile.webp');

    const dummy = new THREE.BufferGeometry();
    for (let i = 0; i < 24; i++) {
      const m = new THREE.Mesh(dummy, mkAdd(this.texStarCrack, 0xffffff, 0.9));
      m.visible = false;
      m.renderOrder = 11;
      this.root.add(m);
      this.vfxBursts.push({ mesh: m, age: 0, life: 0.5, s0: 1, s1: 2, maxOp: 0.9, active: false });
    }

    loadScbGeo('./assets/weapons/vfx/star_burst.json').then((geo) => {
      this.geoStarBurst = geo;
    }).catch(() => {});
    loadScbGeo('./assets/weapons/vfx/frost_ring.json').then((geo) => {
      this.geoFrostRing = geo;
    }).catch(() => {});
  }

  private allocBurst(
    geo: THREE.BufferGeometry | null, x: number, y: number, z: number,
    tex: THREE.Texture, hex: number, s0: number, s1: number, life: number, maxOp = 0.88, additive = true, order = 11,
  ) {
    if (!geo) return;
    const b = this.vfxBursts.find((v) => !v.active);
    if (!b) return;
    b.active = true;
    b.age = 0;
    b.life = life;
    b.s0 = s0;
    b.s1 = s1;
    b.maxOp = maxOp;
    b.mesh.geometry = geo;
    b.mesh.renderOrder = order;
    b.mesh.visible = true;
    b.mesh.position.set(x, y, z);
    b.mesh.rotation.set(0, Math.random() * Math.PI * 2, 0);
    b.mesh.scale.setScalar(s0);
    const mat = b.mesh.material as THREE.MeshBasicMaterial;
    mat.map = tex;
    mat.color.setHex(hex);
    mat.opacity = maxOp;
    mat.blending = additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    mat.needsUpdate = true;
  }

  spawnOrbitalBeam(x: number, z: number, radius: number) {
    const b = this.skyBeams.find((v) => !v.active);
    if (b) {
      b.active = true;
      b.age = 0;
      b.life = 0.42;
      b.group.visible = true;
      b.group.position.set(x, 0, z);
      b.group.scale.set(radius * 0.68, 1, radius * 0.68);
    }
    this.allocBurst(this.geoStarBurst, x, 0.1, z, this.texStarInner, 0x8ef9ff, radius * 0.004, radius / 104.7, 0.36, 0.9, true, 12);
    this.allocBurst(this.unitFlatGeo, x, 0.03, z, this.texStarCrack, 0xb8f8ff, radius * 0.72, radius * 1.0, 0.75, 0.34, false, 3);
  }

  spawnIceBlast(x: number, z: number, radius: number) {
    this.allocBurst(this.geoFrostRing, x, 0.08, z, this.texFrostTile, 0x8ef9ff, radius * 0.002, radius / 167.75, 0.48, 0.88, true, 11);
    this.allocBurst(this.unitFlatGeo, x, 0.04, z, this.texFrostCrack, 0xa8f8ff, radius * 0.45, radius * 0.65, 1.0, 0.72, true, 4);
  }

  update(g: Game, dt: number) {
    const t = g.clock;

    // 1. 友方投射物分流渲染
    let mIdx = 0, uIdx = 0, cbIdx = 0, bmIdx = 0, bmeIdx = 0, catIdx = 0;
    const COL_CYAN = new THREE.Color(0x52f2ff);
    const COL_GOLD = new THREE.Color(0xffd040);
    const COL_EVO = new THREE.Color(0xff5ce6);
    const COL_CRIT = new THREE.Color(0xffe95e);

    for (const gRocket of this.catRocketPool) gRocket.visible = false;

    for (let pi = 0; pi < g.projectiles.length; pi++) {
      const pr = g.projectiles[pi];
      if (!pr.alive || pr.kind === 'ult_r') continue;
      const yaw = Math.atan2(pr.vx, pr.vz);
      if (pr.kind === 'rocket_e') {
        if (catIdx < this.catRocketPool.length) {
          const rg = this.catRocketPool[catIdx++];
          rg.visible = true;
          rg.position.set(pr.x, 0.92, pr.z);
          rg.rotation.set(0, yaw, 0);
        }
      } else if (pr.kind === 'meow' || pr.kind === 'meow_evo') {
        if (mIdx < this.meowInst.instanceMatrix.count) {
          const evo = pr.kind === 'meow_evo';
          D.position.set(pr.x, 0.9, pr.z);
          D.rotation.set(0, yaw, 0);
          D.scale.set(evo ? 1.55 : 0.95, evo ? 1.55 : 0.95, evo ? 1.75 : 1.05);
          D.updateMatrix();
          this.meowInst.setMatrixAt(mIdx, D.matrix);
          this.meowInst.setColorAt(mIdx++, pr.isCrit ? COL_CRIT : evo ? COL_EVO : (pi % 2 === 0 ? COL_CYAN : COL_GOLD));
        }
      } else if (pr.kind === 'uwu') {
        if (uIdx < this.uwuInst.instanceMatrix.count) {
          D.position.set(pr.x, 0.88, pr.z);
          D.rotation.set(0, t * 8 + pi, 0);
          D.scale.setScalar(pr.tier >= 1 ? 1.25 : 0.95);
          D.updateMatrix();
          this.uwuInst.setMatrixAt(uIdx++, D.matrix);
        }
      } else if (pr.kind === 'crossbow') {
        if (cbIdx < this.crossbowInst.instanceMatrix.count) {
          D.position.set(pr.x, 0.9, pr.z);
          D.rotation.set(0, yaw, 0);
          D.scale.set(pr.isCrit ? 1.25 : 1, 1, pr.isCrit ? 1.4 : 1.1);
          D.updateMatrix();
          this.crossbowInst.setMatrixAt(cbIdx, D.matrix);
          this.crossbowInst.setColorAt(cbIdx++, pr.isCrit ? COL_GOLD : COL_CYAN);
        }
      } else if (pr.kind === 'boomerang' || pr.kind === 'boomerang_mini') {
        const isEvo = pr.tier >= 1;
        const inst = isEvo ? this.boomEvoInst : this.boomInst;
        const idx = isEvo ? bmeIdx : bmIdx;
        if (idx < inst.instanceMatrix.count) {
          D.position.set(pr.x, 0.85, pr.z);
          D.rotation.set(0, t * 14 + pi, 0);
          D.scale.setScalar(pr.kind === 'boomerang_mini' ? 0.65 : 1.1);
          D.updateMatrix();
          inst.setMatrixAt(idx, D.matrix);
          if (isEvo) bmeIdx++; else bmIdx++;
        }
      }
    }
    this.meowInst.count = mIdx; this.meowInst.instanceMatrix.needsUpdate = true;
    if (this.meowInst.instanceColor) this.meowInst.instanceColor.needsUpdate = true;
    this.uwuInst.count = uIdx; this.uwuInst.instanceMatrix.needsUpdate = true;
    this.crossbowInst.count = cbIdx; this.crossbowInst.instanceMatrix.needsUpdate = true;
    if (this.crossbowInst.instanceColor) this.crossbowInst.instanceColor.needsUpdate = true;
    this.boomInst.count = bmIdx; this.boomInst.instanceMatrix.needsUpdate = true;
    this.boomEvoInst.count = bmeIdx; this.boomEvoInst.instanceMatrix.needsUpdate = true;

    // 2. 旋风切割器 / 不息气旋官方刀刃
    let oIdx = 0, oeIdx = 0;
    for (const ob of g.orbitals) {
      const inst = ob.evolved ? this.orbitalEvoInst : this.orbitalInst;
      const idx = ob.evolved ? oeIdx : oIdx;
      if (idx >= inst.instanceMatrix.count) continue;
      D.position.set(ob.x, 0.72, ob.z);
      D.rotation.set(0, ob.ang + t * 8, 0);
      D.scale.setScalar(1);
      D.updateMatrix();
      inst.setMatrixAt(idx, D.matrix);
      if (ob.evolved) oeIdx++; else oIdx++;
    }
    this.orbitalInst.count = oIdx; this.orbitalInst.instanceMatrix.needsUpdate = true;
    this.orbitalEvoInst.count = oeIdx; this.orbitalEvoInst.instanceMatrix.needsUpdate = true;

    // 3. 耀光力场官方 3D 火焰网格（带 UV 旋转与进化红金切换）
    const radLv = g.weaponLv('radiant');
    this.hrGroup.visible = radLv > 0;
    if (radLv > 0) {
      const rad = [2.2, 2.6, 2.75, 3.4, 3.8, 3.85][radLv - 1] * g.areaMul;
      const evo = radLv >= 6;
      this.hrGroup.position.set(g.player.x, 0, g.player.z);
      this.hrGroup.scale.setScalar(rad / 102.0);
      this.hrNoiseTex.offset.y = (t * 0.45) % 1;
      if (this.hrOutlineMesh) {
        this.hrOutlineMesh.rotation.y = t * 0.4;
        (this.hrOutlineMesh.material as THREE.MeshBasicMaterial).color.setHex(evo ? 0xff7a38 : 0x55ff70);
      }
      if (this.hrFireMesh) {
        this.hrFireMesh.rotation.y = -t * 0.65;
        (this.hrFireMesh.material as THREE.MeshBasicMaterial).color.setHex(evo ? 0xff3b9a : 0x22cc44);
      }
    }

    // 4. 进化冰盾官方贴图球罩
    this.iceShieldMesh.visible = g.player.shield > 0;
    if (g.player.shield > 0) {
      this.iceShieldMesh.position.set(g.player.x, 0.85, g.player.z);
      this.iceShieldMesh.rotation.y = t * 1.2;
      this.iceShieldMesh.scale.setScalar(1 + Math.sin(t * 7) * 0.04);
    }

    // 5. 斯塔缇克宽幅 3D 闪电光带
    for (const m of this.boltPool) m.visible = false;
    for (let i = 0; i < g.lightningArcs.length && i < this.boltPool.length; i++) {
      const a = g.lightningArcs[i];
      const dx = a.x1 - a.x0, dz = a.z1 - a.z0;
      const dist = Math.hypot(dx, dz) || 0.1;
      const m = this.boltPool[i];
      m.visible = true;
      m.position.set((a.x0 + a.x1) * 0.5, 0.92, (a.z0 + a.z1) * 0.5);
      m.rotation.set(0, Math.atan2(dx, dz), 0);
      m.scale.set(1.1, 1, dist);
      (m.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - a.age / a.life);
    }

    // 6. 战兔巨爆准星 & 雷暴电圈（彻底与地雷橙环分离）
    let stIdx = 0, srIdx = 0;
    for (const z of g.weaponZones) {
      if (z.kind === 'orbital_strike' && !z.resolved && stIdx < this.starTargets.instanceMatrix.count) {
        D.position.set(z.x, 0.06, z.z);
        D.rotation.set(0, t * 2.5, 0);
        D.scale.setScalar(z.r * 0.95);
        D.updateMatrix();
        this.starTargets.setMatrixAt(stIdx++, D.matrix);
      } else if (z.kind === 'storm' && srIdx < this.stormRings.instanceMatrix.count) {
        D.position.set(z.x, 0.06, z.z);
        D.rotation.set(0, -t * 3.0, 0);
        D.scale.setScalar(z.r);
        D.updateMatrix();
        this.stormRings.setMatrixAt(srIdx++, D.matrix);
      }
    }
    this.starTargets.count = stIdx; this.starTargets.instanceMatrix.needsUpdate = true;
    this.stormRings.count = srIdx; this.stormRings.instanceMatrix.needsUpdate = true;

    // 7. 激光柱 & 炸裂寿命更新
    for (const b of this.skyBeams) {
      if (!b.active) continue;
      b.age += dt;
      if (b.age >= b.life) { b.active = false; b.group.visible = false; continue; }
      const k = b.age / b.life;
      const shrink = 1 - k * 0.65;
      b.group.scale.x = shrink * 1.4;
      b.group.scale.z = shrink * 1.4;
      b.group.rotation.y += dt * 4;
    }

    for (const b of this.vfxBursts) {
      if (!b.active) continue;
      b.age += dt;
      if (b.age >= b.life) { b.active = false; b.mesh.visible = false; continue; }
      const k = b.age / b.life;
      const ease = 1 - Math.pow(1 - k, 2);
      b.mesh.scale.setScalar(b.s0 + (b.s1 - b.s0) * ease);
      (b.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - k) * b.maxOp;
    }
  }
}
