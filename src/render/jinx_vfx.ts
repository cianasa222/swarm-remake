import * as THREE from 'three';
import { getTexture, loadScbGeo, loadSpriteCell as loadAssetSpriteCell } from './assets';

export function loadSpriteCell(url: string, cols: number, rows: number, col = 0, row = 0): THREE.Texture {
  return loadAssetSpriteCell(url, col, row, cols, rows, { size: 64 });
}

interface BurstPlane {
  mesh: THREE.Mesh;
  age: number;
  life: number;
  s0: number;
  s1: number;
  rotSpeed: number;
  maxOp: number;
  active: boolean;
}

interface BurstMesh {
  mesh: THREE.Mesh;
  age: number;
  life: number;
  s0: number;
  s1: number;
  rotY: number;
  maxOp: number;
  active: boolean;
}

interface StarParticle {
  active: boolean;
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  age: number; life: number;
  r: number; g: number; b: number;
}

/**
 * 拳头 Patch 14.14 官方《无尽狂潮》金克丝全套 1:1 技能与武器 VFX 系统：
 * - R 死神飞弹飞行：3D 本体 + 3D 旋转气浪锥 + 青蓝光晕 + 地面投影 + 双色交叉尾焰 + 周期双色扩散尾环
 * - R 8 层核爆：黑曜石焦痕 + 3D 弹坑 + 致盲闪光 + 3D 穹顶 + 3D 涡流 + 3D 二次元爆裂网 + 3D 刃环 + 巨型猫脸 & 星辰
 * - E 鱼骨头 5 层爆炸：地面闪光 + 3D q_animeburst + 3D q_praxis + 猫脸爆裂 + 3D 弹坑 + 星辰
 * - 罪恶快感 5 层官方光环：深蓝底环 + 亮金旋转环 + 脉冲猫脸徽章 + 3D 漩涡 + 外扩疾跑环
 */
export class JinxVfxSystem {
  readonly root = new THREE.Group();
  readonly rocketGroup = new THREE.Group();
  private rocketCone: THREE.Mesh | null = null;
  private rocketRingSpawnT = 0;

  private passiveGroup = new THREE.Group();
  private passiveDarkBg: THREE.Mesh;
  private passiveGoldRing: THREE.Mesh;
  private passiveCat: THREE.Mesh;
  private passiveCatOut: THREE.Mesh;
  private passiveSwirl: THREE.Mesh | null = null;
  private passivePulseRing: THREE.Mesh;

  private muzzlePlane: THREE.Mesh;
  private muzzlePaw: THREE.Mesh;
  private muzzleT = 0;

  private planes: BurstPlane[] = [];
  private meshes: BurstMesh[] = [];

  private geoDome: THREE.BufferGeometry | null = null;
  private geoSwirl: THREE.BufferGeometry | null = null;
  private geoRPraxis: THREE.BufferGeometry | null = null;
  private geoRAnime: THREE.BufferGeometry | null = null;
  private geoQPraxis: THREE.BufferGeometry | null = null;
  private geoQAnime: THREE.BufferGeometry | null = null;
  private geoCrater: THREE.BufferGeometry | null = null;
  private geoCastRing: THREE.BufferGeometry | null = null;

  private texAura: THREE.Texture;
  private texGlow2: THREE.Texture;
  private texGunHit: THREE.Texture;
  private texRocketHit: THREE.Texture;
  private texCatLogo: THREE.Texture;
  private texCatOut: THREE.Texture;
  private texQShapes02: THREE.Texture;
  private texRShapes01: THREE.Texture;
  private texEPraxis: THREE.Texture;
  private texEErosion: THREE.Texture;
  private texREnergy: THREE.Texture;
  private texCrater: THREE.Texture;
  private texCraterObsi: THREE.Texture;
  private texCircleMis: THREE.Texture;

  private starPts: THREE.Points;
  private starGeo: THREE.BufferGeometry;
  private starPos: Float32Array;
  private starCol: Float32Array;
  private stars: StarParticle[] = [];
  private readonly maxStars = 220;

  /** 预留「减轻队友特效」缩放因子 */
  teammateVfxScale = 1.0;

  constructor(parent: THREE.Group | THREE.Scene) {
    parent.add(this.root);

    const loadTex = (url: string, flipY = true) => getTexture(url, { flipY });

    const propsTex = loadTex('./assets/heroes/jinx/vfx/props_tx.webp', false);
    const trailTex = loadTex('./assets/heroes/jinx/vfx/r_trail.webp');
    const coneTex = loadTex('./assets/heroes/jinx/vfx/r_conetexture.webp');
    const rShapeTex = loadTex('./assets/heroes/jinx/vfx/r_shape.webp');
    const muzzleTex = loadTex('./assets/heroes/jinx/vfx/muzzle_flash.webp');
    const catPawTex = loadTex('./assets/heroes/jinx/vfx/catpaw.webp');
    const ringTex = loadTex('./assets/heroes/jinx/vfx/passive_ring.webp');

    this.texAura = loadTex('./assets/heroes/jinx/vfx/aura_self.webp');
    this.texGlow2 = loadTex('./assets/heroes/jinx/vfx/base_glow2.webp');
    this.texGunHit = loadTex('./assets/heroes/jinx/vfx/gun_hit.webp');
    this.texRocketHit = loadTex('./assets/heroes/jinx/vfx/rocket_hit.webp');
    this.texCatLogo = loadTex('./assets/heroes/jinx/vfx/cat_logo.webp');
    this.texCatOut = loadTex('./assets/heroes/jinx/vfx/catlogo_outline.webp');
    this.texQShapes02 = loadTex('./assets/heroes/jinx/vfx/q_shapes02.webp');
    this.texRShapes01 = loadTex('./assets/heroes/jinx/vfx/r_shapes01.webp');
    this.texEPraxis = loadTex('./assets/heroes/jinx/vfx/e_praxis.webp');
    this.texEErosion = loadTex('./assets/heroes/jinx/vfx/e_erosion.webp');
    this.texREnergy = loadTex('./assets/heroes/jinx/vfx/r_energy.webp');
    this.texCrater = loadTex('./assets/heroes/jinx/vfx/crater_01.webp');
    this.texCraterObsi = loadTex('./assets/heroes/jinx/vfx/r_craterobsi.webp');
    this.texCircleMis = loadTex('./assets/heroes/jinx/vfx/circle_mis.webp');

    // 1. R 超究极死神飞弹完整飞行组件
    this.rocketGroup.visible = false;
    const mkAdd = (tex: THREE.Texture, color: number, opacity: number) => new THREE.MeshBasicMaterial({
      map: tex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false,
    });

    // 青蓝大光晕 + 双交叉尾焰 + 地面前导投影
    const rGlowGeo = new THREE.PlaneGeometry(2.8, 6.2);
    rGlowGeo.rotateX(-Math.PI / 2);
    rGlowGeo.translate(0, 0.05, -0.6);
    const rGlow = new THREE.Mesh(rGlowGeo, mkAdd(this.texAura, 0x00aaff, 0.72));

    const rGroundGeo = new THREE.PlaneGeometry(4.2, 7.2);
    rGroundGeo.rotateX(-Math.PI / 2);
    const rGround = new THREE.Mesh(rGroundGeo, mkAdd(rShapeTex, 0x62f8ff, 0.52));
    rGround.position.set(0, -0.96, 1.1);
    rGround.renderOrder = 8;

    const trailGeo = new THREE.PlaneGeometry(1.6, 3.6);
    trailGeo.rotateX(-Math.PI / 2);
    trailGeo.translate(0, 0, -2.1);
    const tMat = mkAdd(trailTex, 0x72f8ff, 0.92);
    const trail1 = new THREE.Mesh(trailGeo, tMat);
    const trail2 = new THREE.Mesh(trailGeo, tMat);
    trail2.rotation.z = Math.PI / 2;

    this.rocketGroup.add(rGlow, rGround, trail1, trail2);
    this.root.add(this.rocketGroup);

    loadScbGeo('./assets/heroes/jinx/vfx/r_rocket.json').then((geo) => {
      const m = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({
          map: propsTex, roughness: 0.42, metalness: 0.25,
          emissive: new THREE.Color(0x225577), emissiveIntensity: 0.55, side: THREE.DoubleSide,
        }),
      );
      m.scale.setScalar(0.035);
      this.rocketGroup.add(m);
    }).catch(() => {});

    loadScbGeo('./assets/heroes/jinx/vfx/r_conehead.json').then((geo) => {
      const m = new THREE.Mesh(geo, mkAdd(coneTex, 0x94f7ff, 0.82));
      // 官方 Strawberry_Jinx_Base_R_Mis sz=[2,5,1.7]：细长高速马赫锥，锥尖朝 +Z 飞行方向
      m.rotation.x = -Math.PI / 2;
      m.scale.set(0.022, 0.048, 0.020);
      m.position.z = 1.9;
      this.rocketCone = m;
      this.rocketGroup.add(m);
    }).catch(() => {});

    // 2. 罪恶快感 5 层官方脚底光环（严格对齐 skin0.bin.json 尺寸 ~1.45m，绕 Y 轴水平旋转）
    this.passiveGroup.visible = false;
    const flatPlane = (size: number) => {
      const g = new THREE.PlaneGeometry(size, size);
      g.rotateX(-Math.PI / 2);
      return g;
    };
    this.passiveDarkBg = new THREE.Mesh(
      flatPlane(1.35),
      new THREE.MeshBasicMaterial({ map: ringTex, color: 0x052854, transparent: true, opacity: 0.48, depthWrite: false }),
    );
    this.passiveDarkBg.position.y = 0.04;
    this.passiveDarkBg.renderOrder = 5;

    this.passiveGoldRing = new THREE.Mesh(flatPlane(1.45), mkAdd(ringTex, 0xffff7f, 0.62));
    this.passiveGoldRing.position.y = 0.06;
    this.passiveGoldRing.renderOrder = 6;

    this.passiveCat = new THREE.Mesh(flatPlane(1.35), mkAdd(this.texCatLogo, 0xff5ce0, 0.78));
    this.passiveCat.position.y = 0.07;
    this.passiveCat.renderOrder = 7;

    this.passiveCatOut = new THREE.Mesh(flatPlane(1.42), mkAdd(this.texCatOut, 0x6ef8ff, 0.65));
    this.passiveCatOut.position.y = 0.08;
    this.passiveCatOut.renderOrder = 7;

    this.passivePulseRing = new THREE.Mesh(flatPlane(1.2), mkAdd(this.texCircleMis, 0x72f8ff, 0.45));
    this.passivePulseRing.position.y = 0.05;
    this.passivePulseRing.renderOrder = 6;

    this.passiveGroup.add(this.passiveDarkBg, this.passiveGoldRing, this.passiveCat, this.passiveCatOut, this.passivePulseRing);
    this.root.add(this.passiveGroup);

    loadScbGeo('./assets/heroes/jinx/vfx/passive_swirl.json').then((geo) => {
      const m = new THREE.Mesh(geo, mkAdd(this.texREnergy, 0xff66cc, 0.72));
      m.scale.setScalar(0.0082);
      m.position.y = 0.18;
      m.renderOrder = 7;
      this.passiveSwirl = m;
      this.passiveGroup.add(m);
    }).catch(() => {});

    // 3. 喵喵枪 / 鱼骨头 官方枪口闪光 + 猫爪弧光
    const mfGeo = new THREE.PlaneGeometry(1.3, 1.3);
    mfGeo.rotateX(-Math.PI / 2);
    this.muzzlePlane = new THREE.Mesh(mfGeo, mkAdd(muzzleTex, 0x8ef9ff, 0.95));
    this.muzzlePlane.visible = false;
    this.muzzlePlane.renderOrder = 14;
    this.muzzlePaw = new THREE.Mesh(mfGeo, mkAdd(catPawTex, 0x55ffff, 0.65));
    this.muzzlePaw.visible = false;
    this.muzzlePaw.renderOrder = 14;
    this.root.add(this.muzzlePlane, this.muzzlePaw);

    // 4. 广告牌特效池（64 个）与 3D SCB 特效池（36 个）
    const unitGeo = new THREE.PlaneGeometry(1, 1);
    unitGeo.rotateX(-Math.PI / 2);
    for (let i = 0; i < 64; i++) {
      const m = new THREE.Mesh(unitGeo, mkAdd(this.texGunHit, 0xffffff, 0.9));
      m.visible = false;
      m.renderOrder = 13;
      this.root.add(m);
      this.planes.push({ mesh: m, age: 0, life: 0.3, s0: 1, s1: 2, rotSpeed: 0, maxOp: 0.9, active: false });
    }

    const dummyGeo = new THREE.BufferGeometry();
    for (let i = 0; i < 36; i++) {
      const m = new THREE.Mesh(dummyGeo, mkAdd(this.texREnergy, 0xffffff, 0.85));
      m.visible = false;
      m.renderOrder = 15;
      this.root.add(m);
      this.meshes.push({ mesh: m, age: 0, life: 0.4, s0: 0.01, s1: 0.05, rotY: 0, maxOp: 0.85, active: false });
    }

    // 5. 离屏裁剪官方 lilstar_4x2.webp 星辰爆发粒子池
    const starTex = loadSpriteCell('./assets/heroes/jinx/vfx/lilstar_4x2.webp', 4, 2, 0, 0);
    this.starPos = new Float32Array(this.maxStars * 3);
    this.starCol = new Float32Array(this.maxStars * 3);
    this.starGeo = new THREE.BufferGeometry();
    this.starGeo.setAttribute('position', new THREE.BufferAttribute(this.starPos, 3));
    this.starGeo.setAttribute('color', new THREE.BufferAttribute(this.starCol, 3));
    this.starPts = new THREE.Points(
      this.starGeo,
      new THREE.PointsMaterial({
        size: 0.72, map: starTex, alphaTest: 0.05, vertexColors: true, transparent: true, opacity: 0.95,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }),
    );
    this.starPts.frustumCulled = false;
    this.starPts.renderOrder = 17;
    this.root.add(this.starPts);
    for (let i = 0; i < this.maxStars; i++) {
      this.stars.push({ active: false, x: 0, y: -99, z: 0, vx: 0, vy: 0, vz: 0, age: 0, life: 0.5, r: 1, g: 1, b: 1 });
    }

    // 异步加载全部爆炸用官方 3D SCB 网格
    const loadGeo = (file: string, cb: (g: THREE.BufferGeometry) => void) => {
      loadScbGeo(`./assets/heroes/jinx/vfx/${file}`)
        .then(cb)
        .catch(() => {});
    };
    loadGeo('r_dome.json', (g) => { this.geoDome = g; });
    loadGeo('r_swirl.json', (g) => { this.geoSwirl = g; });
    loadGeo('r_praxis.json', (g) => { this.geoRPraxis = g; });
    loadGeo('r_animeburst.json', (g) => { this.geoRAnime = g; });
    loadGeo('q_praxis.json', (g) => { this.geoQPraxis = g; });
    loadGeo('q_animeburst.json', (g) => { this.geoQAnime = g; });
    loadGeo('crater.json', (g) => { this.geoCrater = g; });
    loadGeo('r_castring.json', (g) => { this.geoCastRing = g; });
  }

  private allocPlane(
    x: number, y: number, z: number, tex: THREE.Texture, hex: number,
    s0: number, s1: number, life: number, maxOp = 0.9, rotSpeed = 0, additive = true, verticalYaw: number | null = null,
  ) {
    const b = this.planes.find((p) => !p.active);
    if (!b) return;
    b.active = true;
    b.age = 0;
    b.life = life;
    b.s0 = s0;
    b.s1 = s1;
    b.rotSpeed = rotSpeed;
    b.maxOp = maxOp;
    b.mesh.visible = true;
    b.mesh.position.set(x, y, z);
    if (verticalYaw !== null) {
      b.mesh.rotation.set(Math.PI / 2, verticalYaw, 0, 'YXZ');
    } else {
      b.mesh.rotation.set(0, Math.random() * Math.PI * 2, 0);
    }
    b.mesh.scale.setScalar(s0);
    const mat = b.mesh.material as THREE.MeshBasicMaterial;
    mat.map = tex;
    mat.color.setHex(hex);
    mat.opacity = maxOp;
    mat.blending = additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    mat.needsUpdate = true;
  }

  private allocMesh(
    geo: THREE.BufferGeometry | null, x: number, y: number, z: number, tex: THREE.Texture,
    hex: number, s0: number, s1: number, life: number, maxOp = 0.85, rotY = 0, additive = true,
  ) {
    if (!geo) return;
    const b = this.meshes.find((m) => !m.active);
    if (!b) return;
    b.active = true;
    b.age = 0;
    b.life = life;
    b.s0 = s0;
    b.s1 = s1;
    b.rotY = rotY;
    b.maxOp = maxOp;
    b.mesh.geometry = geo;
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

  private spawnStars(x: number, z: number, count: number, speed: number, hex: number) {
    const c = new THREE.Color(hex);
    let n = 0;
    for (let i = 0; i < this.maxStars && n < count; i++) {
      const s = this.stars[i];
      if (s.active) continue;
      s.active = true;
      s.x = x; s.y = 0.45; s.z = z;
      const a = Math.random() * Math.PI * 2;
      const sp = speed * (0.45 + Math.random() * 0.75);
      s.vx = Math.cos(a) * sp;
      s.vy = 2.4 + Math.random() * speed * 0.55;
      s.vz = Math.sin(a) * sp;
      s.age = 0;
      s.life = 0.35 + Math.random() * 0.35;
      s.r = c.r; s.g = c.g; s.b = c.b;
      n++;
    }
  }

  triggerMuzzle(x: number, z: number, ang: number, weapon: 'mg' | 'cn' | 'ult', ownerId = 0) {
    const scale = ownerId > 0 ? this.teammateVfxScale : 1;
    const mx = x + Math.cos(ang) * 1.05;
    const mz = z + Math.sin(ang) * 1.05;
    this.muzzlePlane.position.set(mx, 0.92, mz);
    this.muzzlePlane.rotation.y = -ang + Math.PI / 2;
    const mat = this.muzzlePlane.material as THREE.MeshBasicMaterial;
    mat.color.setHex(weapon === 'mg' ? 0xffe455 : weapon === 'cn' ? 0xff9e3d : 0x72f8ff);
    mat.opacity = 0.95 * scale;
    this.muzzlePlane.scale.setScalar((weapon === 'mg' ? 0.95 : weapon === 'cn' ? 1.45 : 2.1) * scale);

    this.muzzlePaw.position.set(mx, 0.95, mz);
    this.muzzlePaw.rotation.y = -ang + Math.PI / 2;
    this.muzzlePaw.scale.setScalar((weapon === 'mg' ? 0.9 : 1.5) * scale);
    this.muzzleT = weapon === 'mg' ? 0.08 : 0.14;

    if (weapon === 'ult') {
      this.allocMesh(this.geoCastRing, mx, 0.9, mz, this.texAura, 0x6ef8ff, 0.12, 0.52, 0.38, 0.9, 6);
    }
  }

  spawnGunHit(x: number, z: number, crit = false, evolved = false) {
    this.allocPlane(x, 0.65, z, this.texRocketHit, crit ? 0xffe44d : evolved ? 0x5ef8ff : 0xffdf55, 0.45, crit ? 1.55 : 1.15, 0.2, 0.9, 2);
    this.allocPlane(x, 0.68, z, this.texQShapes02, evolved ? 0xff4ce2 : 0xff66cc, 0.35, 1.1, 0.22, 0.78, -3);
    if (crit || evolved) this.spawnStars(x, z, crit ? 7 : 4, 5.5, crit ? 0xffdd30 : 0x52f2ff);
  }

  private eCraterCooldownT = 0;

  /** E 鱼骨头 5 层官方爆炸（弹坑节流防 9 枚齐射叠糊） */
  spawnRocketEBlast(x: number, z: number, radius: number) {
    this.allocPlane(x, 0.08, z, this.texAura, 0x0096ff, radius * 0.5, radius * 1.4, 0.22, 0.52, 0);
    if (this.eCraterCooldownT <= 0) {
      this.eCraterCooldownT = 0.16;
      this.allocMesh(this.geoCrater, x, 0.04, z, this.texCrater, 0xd1c2ba, radius * 0.007, radius * 0.0095, 0.95, 0.42, 0, false);
    }
    this.allocMesh(this.geoQAnime, x, 0.12, z, this.texEErosion, 0xff9b42, radius * 0.0035, radius * 0.0095, 0.32, 0.72, 4);
    this.allocMesh(this.geoQPraxis, x, 0.15, z, this.texEPraxis, 0x7df9ff, radius * 0.0028, radius * 0.007, 0.36, 0.72, -3);
    this.allocPlane(x, 0.42, z, this.texCatLogo, 0xff7be0, radius * 0.35, radius * 0.72, 0.36, 0.72, 1.5, false);
    this.allocPlane(x, 0.36, z, this.texRocketHit, 0xffc852, radius * 0.4, radius * 1.05, 0.25, 0.82, 2);
    this.spawnStars(x, z, 6, 7.0, 0xffdd30);
  }

  /** R 超究极死神飞弹 8 层二次元核爆 */
  spawnUltDome(x: number, z: number, radius: number) {
    // 1. 黑曜石焦痕 & 3D 弹坑
    this.allocPlane(x, 0.03, z, this.texCraterObsi, 0x26202b, radius * 1.5, radius * 2.35, 1.85, 0.78, 0, false);
    this.allocMesh(this.geoCrater, x, 0.05, z, this.texCrater, 0xd8c8be, radius * 0.009, radius * 0.013, 1.45, 0.65, 0, false);
    // 2. 致盲白黄闪光
    this.allocPlane(x, 0.28, z, this.texGlow2, 0xffff80, radius * 0.8, radius * 2.5, 0.26, 0.95, 0);
    this.allocPlane(x, 0.24, z, this.texAura, 0xffff40, radius * 0.9, radius * 2.3, 0.38, 0.85, 0);
    // 3. 四重官方 3D SCB 特效网格（穹顶 + 涡流 + 二次元爆裂网 + 切割刃环）
    this.allocMesh(this.geoDome, x, 0.08, z, this.texREnergy, 0x64f6ff, radius * 0.006, radius / 52.3, 0.58, 0.88, 1.2);
    this.allocMesh(this.geoSwirl, x, 0.16, z, this.texEErosion, 0x52f2ff, radius * 0.004, radius / 91.6, 0.52, 0.82, 5.5);
    this.allocMesh(this.geoRAnime, x, 0.12, z, this.texRShapes01, 0xffe354, radius * 0.004, radius / 104.7, 0.44, 0.9, -2.5);
    this.allocMesh(this.geoRPraxis, x, 0.18, z, this.texEPraxis, 0xff70df, radius * 0.003, radius / 163.4, 0.52, 0.85, 3.2);
    // 4. 巨型猫脸徽章 + 外框 + 星辰爆发
    this.allocPlane(x, 0.45, z, this.texCatLogo, 0xff80e0, radius * 0.65, radius * 1.55, 0.65, 0.92, 1.4, false);
    this.allocPlane(x, 0.48, z, this.texCatOut, 0x62f8ff, radius * 0.7, radius * 1.7, 0.6, 0.85, -1.0);
    this.spawnStars(x, z, 28, 11.5, 0xffdd30);
  }

  update(dt: number, clock: number, px: number, pz: number, excited: boolean, reduceFlash: boolean) {
    if (this.eCraterCooldownT > 0) this.eCraterCooldownT -= dt;
    if (this.muzzleT > 0 && !reduceFlash) {
      this.muzzleT -= dt;
      this.muzzlePlane.visible = true;
      this.muzzlePaw.visible = true;
    } else {
      this.muzzlePlane.visible = false;
      this.muzzlePaw.visible = false;
    }

    // R 飞弹飞行时气浪锥旋转 + 每 0.06s 发射双色垂直扩散尾环
    if (this.rocketGroup.visible) {
      if (this.rocketCone) this.rocketCone.rotation.y += dt * 12;
      this.rocketRingSpawnT -= dt;
      if (this.rocketRingSpawnT <= 0) {
        this.rocketRingSpawnT = 0.065;
        const rx = this.rocketGroup.position.x;
        const ry = this.rocketGroup.position.y;
        const rz = this.rocketGroup.position.z;
        const yaw = this.rocketGroup.rotation.y;
        const bx = rx - Math.sin(yaw) * 1.1;
        const bz = rz - Math.cos(yaw) * 1.1;
        this.allocPlane(bx, ry, bz, this.texCircleMis, 0x00d8e6, 0.65, 1.85, 0.34, 0.8, 0, true, yaw);
        this.allocPlane(bx, ry, bz, this.texCircleMis, 0xffaa00, 0.45, 1.35, 0.28, 0.8, 0, true, yaw);
      }
    }

    // 罪恶快感 5 层光环（全绕 Y 轴水平旋转）
    this.passiveGroup.visible = excited;
    if (excited) {
      this.passiveGroup.position.set(px, 0, pz);
      this.passiveDarkBg.rotation.y = clock * 0.6;
      this.passiveGoldRing.rotation.y = clock * 2.6;
      const pulse = 1 + Math.sin(clock * 10) * 0.08;
      this.passiveGoldRing.scale.setScalar(pulse);
      const catPulse = 0.92 + Math.sin(clock * 8) * 0.1;
      this.passiveCat.scale.setScalar(catPulse);
      this.passiveCatOut.scale.setScalar(catPulse * 1.04);
      const ringK = (clock * 1.8) % 1;
      this.passivePulseRing.scale.setScalar(0.7 + ringK * 0.95);
      (this.passivePulseRing.material as THREE.MeshBasicMaterial).opacity = (1 - ringK) * 0.52;
      if (this.passiveSwirl) this.passiveSwirl.rotation.y = -clock * 4.2;
    }

    const opScale = reduceFlash ? 0.5 : 1.0;

    for (const b of this.planes) {
      if (!b.active) continue;
      b.age += dt;
      if (b.age >= b.life) { b.active = false; b.mesh.visible = false; continue; }
      const k = b.age / b.life;
      const ease = 1 - Math.pow(1 - k, 2);
      b.mesh.scale.setScalar(b.s0 + (b.s1 - b.s0) * ease);
      if (b.rotSpeed) b.mesh.rotation.y += b.rotSpeed * dt;
      (b.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - k) * b.maxOp * opScale;
    }

    for (const b of this.meshes) {
      if (!b.active) continue;
      b.age += dt;
      if (b.age >= b.life) { b.active = false; b.mesh.visible = false; continue; }
      const k = b.age / b.life;
      const ease = 1 - Math.pow(1 - k, 2);
      b.mesh.scale.setScalar(b.s0 + (b.s1 - b.s0) * ease);
      if (b.rotY) b.mesh.rotation.y += b.rotY * dt;
      (b.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - k) * b.maxOp * opScale;
    }

    let activeS = 0;
    for (let i = 0; i < this.maxStars; i++) {
      const s = this.stars[i];
      if (!s.active) { this.starPos[i * 3 + 1] = -99; continue; }
      s.age += dt;
      if (s.age >= s.life) { s.active = false; this.starPos[i * 3 + 1] = -99; continue; }
      s.vy -= 14 * dt;
      s.x += s.vx * dt;
      s.y = Math.max(0.08, s.y + s.vy * dt);
      s.z += s.vz * dt;
      const fade = 1 - s.age / s.life;
      this.starPos[i * 3] = s.x; this.starPos[i * 3 + 1] = s.y; this.starPos[i * 3 + 2] = s.z;
      this.starCol[i * 3] = s.r * fade; this.starCol[i * 3 + 1] = s.g * fade; this.starCol[i * 3 + 2] = s.b * fade;
      activeS++;
    }
    void activeS;
    this.starGeo.attributes.position.needsUpdate = true;
    this.starGeo.attributes.color.needsUpdate = true;
  }
}
