import * as THREE from 'three';
import type { Game } from '../sim/game';
import { getTexture, loadScbGeo, type TextureOpts } from './assets';
import { StarStrikeVfx } from './starstrike_vfx';

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
 * - 战兔巨爆（Q-30：原版 StarStrike 落点 4 层 + 爆炸 9 层，见 starstrike_vfx.ts）
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
  private hrOutlineBlendMesh: THREE.Mesh | null = null;
  private hrFireBlendMesh: THREE.Mesh | null = null;
  private hrNoiseTex: THREE.Texture;
  private hrGlowTex: THREE.Texture;

  // 进化冰盾官方贴图球罩
  private iceShieldMesh: THREE.Mesh;

  // 斯塔缇克宽幅 3D 闪电光带池
  private boltPool: THREE.Mesh[] = [];
  private boltGeo: THREE.BufferGeometry;

  // 雷暴电圈池；战兔巨爆（Q-30）改由 StarStrikeVfx 绘制
  private stormRings: THREE.InstancedMesh;
  private starStrike: StarStrikeVfx;
  private vfxBursts: BurstItem[] = [];

  private geoFrostRing: THREE.BufferGeometry | null = null;
  private unitFlatGeo: THREE.BufferGeometry;
  private texFrostCrack: THREE.Texture;
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
    // 原版 Q_Rocket_mis_child_Cat_CRIT「Rocket Booter_Backing」：R_SmokeShapes 青色 (0.333, 1, 1)，bS 70×35，父系统 ×1.2
    // → 0.84 m × 1.68 m（贴图暂用 base_glow 代替，原版 R_SmokeShapes 未导出）（Quick AI Q-13，旧值橙色 0.55×1.35）
    this.catGlowGeo = mkFlatGeo(0.84, 1.68);
    this.catGlowMat = mkAdd(baseGlow, 0x55ffff, 0.78);

    loadScbGeo('./assets/heroes/jinx/vfx/cat_rocket.json').then((geo) => {
      this.catGeo = geo;
      for (let i = 0; i < 18; i++) {
        const g = new THREE.Group();
        const m = new THREE.Mesh(this.catGeo, this.catMat);
        // 原版 missle_Main：Props_MD_Cat bS (1.15, 1.3, 1.3) × 父系统 1.2 / 100（Quick AI Q-13，旧值统一 0.020）
        m.scale.set(0.0138, 0.0156, 0.0156);
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

    // Q-28: HollowRadiance_AoeCircle 四层；两个 WebP 都有真实 alpha，不重复乘绿色通道。
    const mkBlend = (map: THREE.Texture, color: number, opacity: number) => new THREE.MeshBasicMaterial({
      map, color, opacity, transparent: true, side: THREE.DoubleSide, depthWrite: false,
    });
    loadScbGeo('./assets/weapons/vfx/hr_outline.json').then((geo) => {
      this.hrOutlineBlendMesh = new THREE.Mesh(geo, mkBlend(this.hrGlowTex, 0x69ff80, 0.45));
      this.hrOutlineBlendMesh.position.y = 0.05;
      this.hrOutlineBlendMesh.renderOrder = 6;
      this.hrOutlineMesh = new THREE.Mesh(geo, mkAdd(this.hrGlowTex, 0x73ff6e, 0.15));
      this.hrOutlineMesh.position.y = 0.055;
      this.hrOutlineMesh.renderOrder = 7;
      this.hrGroup.add(this.hrOutlineBlendMesh, this.hrOutlineMesh);
    }).catch(() => {});
    loadScbGeo('./assets/weapons/vfx/hr_fire.json').then((geo) => {
      this.hrFireBlendMesh = new THREE.Mesh(geo, mkBlend(this.hrNoiseTex, 0xff7a08, 0.4));
      this.hrFireBlendMesh.position.y = 0.035;
      this.hrFireBlendMesh.renderOrder = 4;
      this.hrFireMesh = new THREE.Mesh(geo, mkAdd(this.hrNoiseTex, 0x05ff00, 0.25));
      this.hrFireMesh.position.y = 0.04;
      this.hrFireMesh.renderOrder = 5;
      this.hrGroup.add(this.hrFireBlendMesh, this.hrFireMesh);
    }).catch(() => {});

    // 4. 进化冰盾球罩
    const shieldTex = loadTex('./assets/weapons/vfx/frost_shield.webp');
    this.iceShieldMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 18, 14),
      // Q-25：原版 FrostNova_EvolveShield「Bubble8」(0.09, 0.54, 0.95, 0.55) 深蓝（旧值浅青 0x7ef2ff α 0.58）
      mkAdd(shieldTex, 0x178af2, 0.55),
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

    // 6. 雷暴圆形电环（circle_mis.webp）；战兔巨爆（Q-30）：原版 StarStrike 落点 4 层 + 爆炸 9 层
    const stormTex = loadTex('./assets/heroes/jinx/vfx/circle_mis.webp');
    this.stormRings = mkInst(this.root, mkFlatGeo(1.0, 1.0), mkAdd(stormTex, 0x45f2ff, 0.58), 24, 6);
    this.starStrike = new StarStrikeVfx(this.root);

    // 8. 通用炸裂贴花 / 3D SCB 池（星爆裂纹、冰爆环等）
    this.unitFlatGeo = mkFlatGeo(2.0, 2.0);
    this.texFrostCrack = loadTex('./assets/weapons/vfx/frost_crack.webp');
    this.texFrostTile = loadTex('./assets/weapons/vfx/frost_tile.webp');

    const dummy = new THREE.BufferGeometry();
    for (let i = 0; i < 24; i++) {
      const m = new THREE.Mesh(dummy, mkAdd(this.texFrostCrack, 0xffffff, 0.9));
      m.visible = false;
      m.renderOrder = 11;
      this.root.add(m);
      this.vfxBursts.push({ mesh: m, age: 0, life: 0.5, s0: 1, s1: 2, maxOp: 0.9, active: false });
    }

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

  /** 战兔巨爆爆炸（Q-30：原版 StarStrike_Karthus_Explosion 9 层，普通 / 进化共用） */
  spawnOrbitalBeam(x: number, z: number, radius: number) {
    this.starStrike.spawnExplosion(x, z, radius);
  }

  spawnIceBlast(x: number, z: number, radius: number) {
    // Q-25：原版 FrostNova「Wind」(Frostwraith_RoundMesh) 无 birthColor（白色）α 0.72、寿命 1.5 s；
    // 「AABasic」(Frostwraith_CrackDecal) 白色 α 0.6、寿命 1.75 s。旧值青色 0x8ef9ff / 0xa8f8ff、0.48 s / 1.0 s。
    this.allocBurst(this.geoFrostRing, x, 0.08, z, this.texFrostTile, 0xffffff, radius * 0.002, radius / 167.75, 1.5, 0.72, true, 11);
    this.allocBurst(this.unitFlatGeo, x, 0.04, z, this.texFrostCrack, 0xffffff, radius * 0.45, radius * 0.65, 1.75, 0.6, true, 4);
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
          // 原版 Project_Bolts：普通 bS 75×15 → 1.5 m × 0.3 m；进化 bS 200×30 → 4.0 m × 0.6 m（几何基准 0.45 × 1.45）（Quick AI Q-13）
          D.scale.set(evo ? 1.333 : 0.667, evo ? 1.333 : 0.667, evo ? 2.759 : 1.034);
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
      const setL = (m: THREE.Mesh | null, rotY: number, hex: number, op: number) => {
        if (!m) return;
        m.rotation.y = rotY;
        const mat = m.material as THREE.MeshBasicMaterial;
        mat.color.setHex(hex);
        mat.opacity = op;
      };
      setL(this.hrOutlineBlendMesh, t * 0.4, evo ? 0xffd93d : 0x69ff80, evo ? 0.4 : 0.45);
      setL(this.hrOutlineMesh, t * 0.4, evo ? 0xff7a38 : 0x73ff6e, evo ? 0.5 : 0.15);
      setL(this.hrFireBlendMesh, -t * 0.65, evo ? 0xff1fd9 : 0xff7a08, evo ? 0.5 : 0.4);
      setL(this.hrFireMesh, -t * 0.65, evo ? 0xffb012 : 0x05ff00, evo ? 0.5 : 0.25);
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

    // 6. 雷暴电圈；战兔巨爆落点 + 爆炸（Q-30）
    let srIdx = 0;
    for (const z of g.weaponZones) {
      if (z.kind === 'storm' && srIdx < this.stormRings.instanceMatrix.count) {
        D.position.set(z.x, 0.06, z.z);
        D.rotation.set(0, -t * 3.0, 0);
        D.scale.setScalar(z.r);
        D.updateMatrix();
        this.stormRings.setMatrixAt(srIdx++, D.matrix);
      }
    }
    this.stormRings.count = srIdx; this.stormRings.instanceMatrix.needsUpdate = true;
    this.starStrike.update(g, dt);

    // 7. 炸裂寿命更新（冰爆）
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
