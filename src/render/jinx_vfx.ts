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
  /** 各轴尺寸系数（平面：x 宽、z 长） */
  ax: number; ay: number; az: number;
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
  /** 各轴缩放系数（网格局部 x / y / z，对应原版 birthScale 三个分量） */
  ax: number; ay: number; az: number;
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
 *
 * Quick AI Q-13（2026-11-23）：被动光环、R 飞行、E / R 爆炸按 14.14 skin0.bin.json 重建。
 * 尺寸统一换算：平面全宽 = 2 × birthScale.x / 100 m（贴地平面只取 x）；网格缩放 = birthScale / 100；再乘系统 transform。
 * 与中央喷泉（map_warehouse.ts）同一规则。原版缺贴图的层（SandBurst、风、烟、碎石、CloudFace 等）未做，见 docs/audit/jinx_14.14.md。
 */
export class JinxVfxSystem {
  readonly root = new THREE.Group();
  readonly rocketGroup = new THREE.Group();
  private rocketCone: THREE.Mesh | null = null;
  private rocketRingSpawnT = 0;

  private passiveGroup = new THREE.Group();
  private passiveDarkBg: THREE.Mesh;
  private passiveRingDots: THREE.Mesh[] = [];
  private passiveGoldRings: THREE.Mesh[] = [];
  private passiveCats: THREE.Mesh[] = [];
  private passiveCatOuts: THREE.Mesh[] = [];
  private passiveSwirl: THREE.Mesh | null = null;
  private passiveStreakAcc = 0;
  private rGroundMat: THREE.MeshBasicMaterial;
  private rocketAge = 0;

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
  private texHitSquares: THREE.Texture;
  private texPixel: THREE.Texture;

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
    this.texHitSquares = loadTex('./assets/heroes/jinx/vfx/hit_squares.webp');
    this.texPixel = loadTex('./assets/heroes/jinx/vfx/base_pixel.webp');

    // 1. R 超究极死神飞弹完整飞行组件
    this.rocketGroup.visible = false;
    const mkAdd = (tex: THREE.Texture, color: number, opacity: number) => new THREE.MeshBasicMaterial({
      map: tex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false,
    });

    // 青蓝大光晕 + 双交叉尾焰 + 地面前导投影
    // 原版 R_Mis「Glow」：Aura_Self (0, 0.667, 1) α 0.502，2 × 275 / 100 = 5.5 m（Quick AI Q-13，旧值 2.8 × 6.2、α 0.72）
    const rGlowGeo = new THREE.PlaneGeometry(5.5, 5.5);
    rGlowGeo.rotateX(-Math.PI / 2);
    rGlowGeo.translate(0, 0.05, 0);
    const rGlow = new THREE.Mesh(rGlowGeo, mkAdd(this.texAura, 0x00aaff, 0.502));

    // 原版 R_Mis「Ground Front Glow」：R_Shape 2 × 800 / 100 × 0.85 = 13.6 m，颜色随飞行时间变化（见 update）（Quick AI Q-13，旧值 4.2 × 7.2）
    const rGroundGeo = new THREE.PlaneGeometry(13.6, 13.6);
    rGroundGeo.rotateX(-Math.PI / 2);
    this.rGroundMat = mkAdd(rShapeTex, 0xffaaff, 0.75);
    const rGround = new THREE.Mesh(rGroundGeo, this.rGroundMat);
    rGround.position.set(0, -0.96, 0);
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

    // 2. 罪恶快感 Strawberry_Jinx_Base_Passive_Buff（Quick AI Q-13 按 14.14 原版重建）
    //    DarkBG 常驻 2.2 m；GlowRing 2.3 m / CatFace 2.5 m / Outline 2.5 m / RingGlowDot 1.9 m 每秒 1.5 个新环，
    //    寿命 1 s，0.8 → 1.0 倍外扩并淡入淡出（原版不旋转）；SpeedRing（Passive_Swirl 网格 ×0.007）每秒 1 个、寿命 0.5 s；
    //    Streak 速度线见 update。旧版为 5 层常驻旋转 + 正弦脉动、尺寸约原版 60%
    this.passiveGroup.visible = false;
    const flatPlane = (size: number) => {
      const g = new THREE.PlaneGeometry(size, size);
      g.rotateX(-Math.PI / 2);
      return g;
    };
    this.passiveDarkBg = new THREE.Mesh(
      flatPlane(2.2),
      new THREE.MeshBasicMaterial({ map: ringTex, color: 0x052854, transparent: true, opacity: 0.451, depthWrite: false }),
    );
    this.passiveDarkBg.position.y = 0.04;
    this.passiveDarkBg.renderOrder = 5;
    this.passiveGroup.add(this.passiveDarkBg);

    const ringLayer = (tex: THREE.Texture, size: number, additive: boolean, y: number, order: number): THREE.Mesh[] => {
      const out: THREE.Mesh[] = [];
      for (let j = 0; j < 2; j++) {
        const m = new THREE.Mesh(flatPlane(size), new THREE.MeshBasicMaterial({
          map: tex, color: 0xffffff, transparent: true, opacity: 0,
          blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, side: THREE.DoubleSide, depthWrite: false,
        }));
        m.position.y = y;
        m.renderOrder = order;
        m.visible = false;
        this.passiveGroup.add(m);
        out.push(m);
      }
      return out;
    };
    this.passiveRingDots = ringLayer(ringTex, 1.9, false, 0.05, 6);
    this.passiveGoldRings = ringLayer(ringTex, 2.3, true, 0.06, 6);
    this.passiveCats = ringLayer(this.texCatLogo, 2.5, true, 0.07, 7);
    this.passiveCatOuts = ringLayer(this.texCatOut, 2.5, true, 0.08, 7);
    this.root.add(this.passiveGroup);

    loadScbGeo('./assets/heroes/jinx/vfx/passive_swirl.json').then((geo) => {
      const m = new THREE.Mesh(geo, mkAdd(this.texCircleMis, 0xffff7f, 0.27));
      m.scale.setScalar(0.007);
      m.renderOrder = 7;
      m.visible = false;
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

    // 4. 广告牌特效池（160 个）与 3D SCB 特效池（36 个）
    const unitGeo = new THREE.PlaneGeometry(1, 1);
    unitGeo.rotateX(-Math.PI / 2);
    for (let i = 0; i < 160; i++) {
      const m = new THREE.Mesh(unitGeo, mkAdd(this.texGunHit, 0xffffff, 0.9));
      m.visible = false;
      m.renderOrder = 13;
      this.root.add(m);
      this.planes.push({ mesh: m, age: 0, life: 0.3, s0: 1, s1: 2, rotSpeed: 0, maxOp: 0.9, active: false, ax: 1, ay: 1, az: 1 });
    }

    const dummyGeo = new THREE.BufferGeometry();
    for (let i = 0; i < 36; i++) {
      const m = new THREE.Mesh(dummyGeo, mkAdd(this.texREnergy, 0xffffff, 0.85));
      m.visible = false;
      m.renderOrder = 15;
      this.root.add(m);
      this.meshes.push({ mesh: m, age: 0, life: 0.4, s0: 0.01, s1: 0.05, rotY: 0, maxOp: 0.85, active: false, ax: 1, ay: 1, az: 1 });
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
    ax = 1, az = 1,
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
    b.ax = ax;
    b.ay = 1;
    b.az = az;
    b.mesh.visible = true;
    b.mesh.position.set(x, y, z);
    if (verticalYaw !== null) {
      b.mesh.rotation.set(Math.PI / 2, verticalYaw, 0, 'YXZ');
    } else {
      b.mesh.rotation.set(0, Math.random() * Math.PI * 2, 0);
    }
    b.mesh.scale.set(s0 * ax, s0, s0 * az);
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
    ax = 1, ay = 1, az = 1,
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
    b.ax = ax;
    b.ay = ay;
    b.az = az;
    b.mesh.geometry = geo;
    b.mesh.visible = true;
    b.mesh.position.set(x, y, z);
    b.mesh.rotation.set(0, Math.random() * Math.PI * 2, 0);
    b.mesh.scale.set(s0 * ax, s0 * ay, s0 * az);
    const mat = b.mesh.material as THREE.MeshBasicMaterial;
    mat.map = tex;
    mat.color.setHex(hex);
    mat.opacity = maxOp;
    mat.blending = additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    mat.needsUpdate = true;
  }

  /** 罪恶快感外扩环：设置一帧的可见、缩放、颜色（原版 sRGB 数值）与透明度 */
  private setPassiveRing(m: THREE.Mesh, alive: boolean, s: number, r: number, g: number, b: number, a: number) {
    m.visible = alive && a > 0.002;
    if (!m.visible) return;
    m.scale.setScalar(s);
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.color.setRGB(r, g, b, THREE.SRGBColorSpace);
    mat.opacity = a;
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

  /**
   * E 鱼骨头爆炸：Strawberry_Jinx_Base_Q_Rocket_GroundAOE（系统整体 ×0.5；按爆炸半径相对基础 3 m 等比放大）
   * Quick AI Q-13 按 14.14 原版重建：去掉原版没有的猫脸、rocket_hit 两层和星星；补 PixelHit；
   * SandBurst（SandStreaks 贴图未导出）暂缺。弹坑节流防 9 枚齐射叠糊。
   */
  spawnRocketEBlast(x: number, z: number, radius: number) {
    const k = radius / 3.0;
    // Jinx_E_FloorFlash：Aura_Self 蓝 (0, 0.59, 1)，2 × 450 / 100 × 0.5 = 4.5 m，0.2 s 内缩到 0.75 倍
    this.allocPlane(x, 0.08, z, this.texAura, 0x0096ff, 4.5 * k, 3.375 * k, 0.2, 1.0, 0);
    if (this.eCraterCooldownT <= 0) {
      this.eCraterCooldownT = 0.16;
      // Jinx_E_Crater：Crater_01 网格 bS (7, 5, 3.4) × 0.5，普通混合，1.25 s，0.7 → 1.01 倍
      this.allocMesh(this.geoCrater, x, 0.04, z, this.texCrater, 0xd1c2ba, 0.7, 1.01, 1.25, 0.34, 0, false, 0.035 * k, 0.025 * k, 0.017 * k);
    }
    // Jinx_E_Swirls：Q_AnimeBurstMesh02 bS (4, 2.75, 2.75) × 0.5，E_ErosionSphere02，0.35 s，0.5 → 1.2 倍，自转 100°/s
    this.allocMesh(this.geoQAnime, x, 0.12, z, this.texEErosion, 0xffff00, 0.5, 1.2, 0.35, 1.0, 1.745, true, 0.02 * k, 0.01375 * k, 0.01375 * k);
    // Jinx_E_RingOut：Q_Praxis bS (3.25, 1.25, 1.0) × 0.5，E_Praxis，0.45 s，黄色 α 0.4
    this.allocMesh(this.geoQPraxis, x, 0.15, z, this.texEPraxis, 0xffff7f, 1, 1, 0.45, 0.4, 0, true, 0.01625 * k, 0.00625 * k, 0.005 * k);
    // Jinx_E_PixelHit：Pixel 像素块 8 个，2 × 30 / 100 × 0.5 = 0.3 m，0.65 s
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * 0.9 * k;
      this.allocPlane(x + Math.cos(a) * d, 0.25, z + Math.sin(a) * d, this.texPixel, 0xffff00, 0.3 * k, 0.6 * k, 0.65, 1.0, 0);
    }
  }

  /**
   * R 超究极死神飞弹爆炸：Strawberry_Jinx_Base_R_Tar（按爆炸半径相对基础 5 m 等比放大）
   * Quick AI Q-13 按 14.14 原版重建：去掉原版没有的弹坑网格、穹顶、R_Swirl、巨型猫脸和外框；Swirls 贴图改回 E_ErosionSphere02；
   * 补 CloudFaceBackGlow、PixelCast；焦痕 1.85 s → 1.0 s。CloudFace 翻页图、碎石、黑烟、SolidBeams 暂缺。
   */
  spawnUltDome(x: number, z: number, radius: number) {
    const k = radius / 5.0;
    // vortex：R_CraterObsi 焦痕 2 × 580 / 100 = 11.6 m，普通混合，1.0 s，0.5 → 1.0 倍
    this.allocPlane(x, 0.03, z, this.texCraterObsi, 0xc8c8c8, 5.8 * k, 11.6 * k, 1.0, 1.0, 0, false);
    // Hit_Flash：Glow2 黄白 (1, 1, 0.498)，2 × 500 / 100 = 10 m，0.2 s 内收缩
    this.allocPlane(x, 0.28, z, this.texGlow2, 0xffff7f, 10 * k, 5 * k, 0.2, 1.0, 0);
    // CloudFaceBackGlow：Aura_Self 2 × 425 / 100 = 8.5 m，y = 1.2 m，0.45 s，0.7 → 1.0 倍，黄 → 青 → 蓝
    this.allocPlane(x, 1.2, z, this.texAura, 0xffff00, 5.95 * k, 8.5 * k, 0.45, 1.0, 0);
    // Swirls：R_AnimeBurstMesh02 bS (4, 2.75, 2.75)，E_ErosionSphere02，0.375 s，0.5 → 1.2 倍，自转 100°/s，α 0.659
    this.allocMesh(this.geoRAnime, x, 0.12, z, this.texEErosion, 0xffff00, 0.5, 1.2, 0.375, 0.659, 1.745, true, 0.04 * k, 0.0275 * k, 0.0275 * k);
    // EnergyRing_Out：R_Praxis bS (2.65, 1.25, 1.0)，E_Praxis，0.45 s，黄色，峰值 α 0.4 × 0.647
    this.allocMesh(this.geoRPraxis, x, 0.18, z, this.texEPraxis, 0xffff00, 1, 1, 0.45, 0.26, 0, true, 0.0265 * k, 0.0125 * k, 0.01 * k);
    // PixelCast：Pixel 15 个，2 × 25 / 100 = 0.5 m，0.65 s
    for (let i = 0; i < 15; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * 2.0 * k;
      this.allocPlane(x + Math.cos(a) * d, 0.25, z + Math.sin(a) * d, this.texPixel, 0xffff00, 0.5 * k, 1.0 * k, 0.65, 1.0, 0);
    }
    // LingerBoxes：lilStar 4 颗，黄 (1, 0.867, 0.184)
    this.spawnStars(x, z, 4, 6.0, 0xffdd2f);
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

    const opScale = reduceFlash ? 0.5 : 1.0;

    // R 飞弹飞行：气浪锥旋转 + 地面前导投影变色 + 双色尾环（Quick AI Q-13 按 14.14 R_Mis 重建）
    if (this.rocketGroup.visible) {
      this.rocketAge += dt;
      // Ground Front Glow 颜色曲线（粒子寿命 50 s，原版时间点 0 / 0.005 / 0.01 / 0.02 / 1 → 0 / 0.25 / 0.5 / 1 / 50 s）
      const ta = this.rocketAge;
      const gk: [number, number, number, number][] = [
        [1, 0.667, 1, 0.75], [1, 1, 0, 0.75], [0, 0.843, 1, 0.435], [0.67, 1, 1, 0.157], [0.33, 1, 1, 0],
      ];
      const gt = [0, 0.25, 0.5, 1.0, 50];
      let gi = 0;
      while (gi < gt.length - 2 && ta > gt[gi + 1]) gi++;
      const gf = Math.min(1, Math.max(0, (ta - gt[gi]) / (gt[gi + 1] - gt[gi])));
      const c0 = gk[gi];
      const c1 = gk[gi + 1];
      this.rGroundMat.color.setRGB(
        c0[0] + (c1[0] - c0[0]) * gf, c0[1] + (c1[1] - c0[1]) * gf, c0[2] + (c1[2] - c0[2]) * gf, THREE.SRGBColorSpace,
      );
      this.rGroundMat.opacity = (c0[3] + (c1[3] - c0[3]) * gf) * opScale;

      if (this.rocketCone) this.rocketCone.rotation.y += dt * 12;
      this.rocketRingSpawnT -= dt;
      if (this.rocketRingSpawnT <= 0) {
        // 原版 Ring Blue Big / Ring Yellow Small：各每秒 3 个，寿命 0.35 s，生成在飞弹前方 1 m（EmitterPosition z = 100）
        // （旧版每 0.065 s 一对，约为原版 5 倍；原版为 R_Swirl 3D 网格，此处仍用竖直平面近似）
        this.rocketRingSpawnT = 1 / 3;
        const rx = this.rocketGroup.position.x;
        const ry = this.rocketGroup.position.y;
        const rz = this.rocketGroup.position.z;
        const yaw = this.rocketGroup.rotation.y;
        const bx = rx + Math.sin(yaw) * 1.0;
        const bz = rz + Math.cos(yaw) * 1.0;
        this.allocPlane(bx, ry, bz, this.texCircleMis, 0x00a5a5, 0.65, 1.85, 0.35, 0.769, 0, true, yaw);
        this.allocPlane(bx, ry, bz, this.texCircleMis, 0xffaa00, 0.45, 1.35, 0.35, 0.769, 0, true, yaw);
      }
    } else {
      this.rocketAge = 0;
      this.rocketRingSpawnT = 0;
    }

    // 罪恶快感 Passive_Buff（Quick AI Q-13 按 14.14 原版重建：外扩环每秒 1.5 个、寿命 1 s，不旋转）
    this.passiveGroup.visible = excited;
    if (excited) {
      this.passiveGroup.position.set(px, 0, pz);
      (this.passiveDarkBg.material as THREE.MeshBasicMaterial).opacity = 0.451 * opScale;
      const ph = clock * 1.5;
      for (let j = 0; j < 2; j++) {
        const age = ((((ph - j) % 2) + 2) % 2) / 1.5;
        const alive = age < 1;
        const s = 0.8 + 0.2 * Math.min(1, age);
        // GlowRing / CatFace / Outline：α 0 →（0.2）峰值 → 0；峰值 = birthColor.a × color.a
        const fade = age < 0.2 ? age / 0.2 : Math.max(0, (1 - age) / 0.8);
        this.setPassiveRing(this.passiveGoldRings[j], alive, s, 1, 1, 0.498, 0.62 * 0.451 * fade * opScale);
        this.setPassiveRing(this.passiveCats[j], alive, s, 1, 1, 1, 0.28 * 0.43 * fade * opScale);
        this.setPassiveRing(this.passiveCatOuts[j], alive, s, 1, 1, 1, 0.65 * 0.49 * fade * opScale);
        // RingGlowDot：0.226 前黄 (1, 1, 0) → 0.388 青 (0.333, 1, 1) → 0.8 (0, 1, 1)；α 0.42，0.8 后渐隐
        let dr = 1;
        let db = 0;
        if (age >= 0.388) {
          dr = age < 0.8 ? 0.333 * (1 - (age - 0.388) / 0.412) : 0;
          db = 1;
        } else if (age > 0.226) {
          const f = (age - 0.226) / 0.162;
          dr = 1 - 0.667 * f;
          db = f;
        }
        const dotA = age < 0.8 ? 0.42 : Math.max(0, (0.42 * (1 - age)) / 0.2);
        this.setPassiveRing(this.passiveRingDots[j], alive, s, dr, 1, db, dotA * opScale);
      }
      // SpeedRing：Passive_Swirl 网格，每秒 1 个、寿命 0.5 s；缩放 (1, 2, 1) → (1.25, 1.25, 1.25)；黄 → 青 → 紫并渐隐
      if (this.passiveSwirl) {
        const age = clock % 1;
        const on = age < 0.5;
        this.passiveSwirl.visible = on;
        if (on) {
          const k = age / 0.5;
          this.passiveSwirl.scale.set(0.007 * (1 + 0.25 * k), 0.007 * (2 - 0.75 * k), 0.007 * (1 + 0.25 * k));
          const mat = this.passiveSwirl.material as THREE.MeshBasicMaterial;
          if (k < 0.5) {
            const f = k / 0.5;
            mat.color.setRGB(1 - 0.667 * f, 1, 0.498 + 0.502 * f, THREE.SRGBColorSpace);
          } else if (k < 0.7) {
            mat.color.setRGB(0.333, 1, 1, THREE.SRGBColorSpace);
          } else {
            mat.color.setRGB(0.333, 1 - (k - 0.7) / 0.3, 1, THREE.SRGBColorSpace);
          }
          mat.opacity = (k < 0.7 ? 0.27 : 0.27 * (1 - (k - 0.7) / 0.3)) * opScale;
        }
      }
      // Jinx_P_Streak：hit_squares 速度线，每秒 15 条，寿命 0.3 s，2 × (5, 80) / 100 = 0.1 m × 1.6 m 竖直
      this.passiveStreakAcc += dt * 15;
      while (this.passiveStreakAcc >= 1) {
        this.passiveStreakAcc -= 1;
        this.allocPlane(px, 0.8, pz + 0.1, this.texHitSquares, 0xffff00, 1, 1, 0.3, 1.0, 0, true, 0, 0.1, 1.6);
      }
    } else {
      this.passiveStreakAcc = 0;
    }

    for (const b of this.planes) {
      if (!b.active) continue;
      b.age += dt;
      if (b.age >= b.life) { b.active = false; b.mesh.visible = false; continue; }
      const k = b.age / b.life;
      const ease = 1 - Math.pow(1 - k, 2);
      const sP = b.s0 + (b.s1 - b.s0) * ease;
      b.mesh.scale.set(sP * b.ax, sP * b.ay, sP * b.az);
      if (b.rotSpeed) b.mesh.rotation.y += b.rotSpeed * dt;
      (b.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - k) * b.maxOp * opScale;
    }

    for (const b of this.meshes) {
      if (!b.active) continue;
      b.age += dt;
      if (b.age >= b.life) { b.active = false; b.mesh.visible = false; continue; }
      const k = b.age / b.life;
      const ease = 1 - Math.pow(1 - k, 2);
      const sM = b.s0 + (b.s1 - b.s0) * ease;
      b.mesh.scale.set(sM * b.ax, sM * b.ay, sM * b.az);
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
