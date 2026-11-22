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
  /** 可选速度、阻力、重力（沙尘、碎石、烟、像素、风） */
  vx: number; vy: number; vz: number;
  drag: number;
  gravity: number;
  /** 可选翻页动画帧序列（如 CloudFace4 2×2） */
  frames: THREE.Texture[] | null;
  /** 可选颜色插值目标（如 SolidBeams 黄 → 青） */
  c0: number;
  c1: number;
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
  /** 可选 Y 轴独立缩放终值倍率（如 R_Swirl 2→0.1、Speed_impact 5→25） */
  ayEnd: number;
  /** 可选颜色插值目标 */
  c0: number;
  c1: number;
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
 * Antigravity AG-05（2026-11-23）：从 CommunityDragon 14.14 拉取并补齐全部原版缺失贴图层：
 *   E 爆炸 SandBurst；R 飞行 Left/Right Wind、Dark/Add Smoke、Spots 猫脸点、LittleStar、Mid PixelCast、Speed_impact 3D 环、R_Swirl 3D 尾环；
 *   R 爆炸 CloudFace4 2×2 翻页动画、fast 碎石、Dark Smoke 黑烟、SolidBeams 光束。
 * 尺寸统一换算：平面全宽 = 2 × birthScale.x / 100 m（贴地平面只取 x）；网格缩放 = birthScale / 100；再乘系统 transform。
 */
export class JinxVfxSystem {
  readonly root = new THREE.Group();
  readonly rocketGroup = new THREE.Group();
  private rocketCone: THREE.Mesh | null = null;
  private rocketRingSpawnT = 0;
  private rocketWindAcc = 0;
  private rocketSmokeAcc = 0;
  private rocketAddSmokeAcc = 0;
  private rocketSpotAcc = 0;
  private rocketStarAcc = 0;
  private rocketPixelAcc = 0;

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
  private texSpeedImpact: THREE.Texture;

  private sandCells: THREE.Texture[] = [];
  private rockCells: THREE.Texture[] = [];
  private cloudFaceCells: THREE.Texture[] = [];
  private smokeCells: THREE.Texture[] = [];
  private windCells: THREE.Texture[] = [];
  private catFaceCells: THREE.Texture[] = [];
  private beamCells: THREE.Texture[] = [];
  private readonly tmpC0 = new THREE.Color();
  private readonly tmpC1 = new THREE.Color();

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
    this.texSpeedImpact = loadTex('./assets/heroes/jinx/vfx/speed_impact.webp');

    // AG-05：原版 14.14 切格贴图（2×2 / 1×2 / 2×1）
    const sliceGrid = (url: string, cols: number, rows: number, size: number) => {
      const out: THREE.Texture[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          out.push(loadAssetSpriteCell(url, c, r, cols, rows, { size }));
        }
      }
      return out;
    };
    this.sandCells = sliceGrid('./assets/heroes/jinx/vfx/sand_streaks.webp', 2, 2, 128);
    this.rockCells = sliceGrid('./assets/heroes/jinx/vfx/r_rocks_2x2.webp', 2, 2, 64);
    this.cloudFaceCells = sliceGrid('./assets/heroes/jinx/vfx/cloud_face_flipbook.webp', 2, 2, 256);
    this.smokeCells = sliceGrid('./assets/heroes/jinx/vfx/particles_1_9.webp', 2, 2, 64);
    this.windCells = sliceGrid('./assets/heroes/jinx/vfx/r_ground_smoke02.webp', 1, 2, 128);
    this.catFaceCells = sliceGrid('./assets/heroes/jinx/vfx/cat_faces.webp', 2, 1, 128);
    this.beamCells = sliceGrid('./assets/heroes/jinx/vfx/r_shapes01.webp', 2, 2, 128);

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

    // 4. 广告牌特效池（280 个）与 3D SCB 特效池（64 个）
    const unitGeo = new THREE.PlaneGeometry(1, 1);
    unitGeo.rotateX(-Math.PI / 2);
    for (let i = 0; i < 280; i++) {
      const m = new THREE.Mesh(unitGeo, mkAdd(this.texGunHit, 0xffffff, 0.9));
      m.visible = false;
      m.renderOrder = 13;
      this.root.add(m);
      this.planes.push({
        mesh: m, age: 0, life: 0.3, s0: 1, s1: 2, rotSpeed: 0, maxOp: 0.9, active: false,
        ax: 1, ay: 1, az: 1, vx: 0, vy: 0, vz: 0, drag: 0, gravity: 0, frames: null, c0: -1, c1: -1,
      });
    }

    const dummyGeo = new THREE.BufferGeometry();
    for (let i = 0; i < 64; i++) {
      const m = new THREE.Mesh(dummyGeo, mkAdd(this.texREnergy, 0xffffff, 0.85));
      m.visible = false;
      m.renderOrder = 15;
      this.root.add(m);
      this.meshes.push({
        mesh: m, age: 0, life: 0.4, s0: 0.01, s1: 0.05, rotY: 0, maxOp: 0.85, active: false,
        ax: 1, ay: 1, az: 1, ayEnd: 1, c0: -1, c1: -1,
      });
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
    opts?: {
      flatYaw?: number;
      vx?: number; vy?: number; vz?: number;
      drag?: number; gravity?: number;
      frames?: THREE.Texture[];
      c1?: number;
      renderOrder?: number;
    },
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
    b.vx = opts?.vx ?? 0;
    b.vy = opts?.vy ?? 0;
    b.vz = opts?.vz ?? 0;
    b.drag = opts?.drag ?? 0;
    b.gravity = opts?.gravity ?? 0;
    b.frames = opts?.frames ?? null;
    b.c0 = opts?.c1 !== undefined ? hex : -1;
    b.c1 = opts?.c1 ?? -1;
    b.mesh.visible = true;
    b.mesh.renderOrder = opts?.renderOrder ?? 13;
    b.mesh.position.set(x, y, z);
    if (verticalYaw !== null) {
      b.mesh.rotation.set(Math.PI / 2, verticalYaw, 0, 'YXZ');
    } else {
      b.mesh.rotation.set(0, opts?.flatYaw ?? (Math.random() * Math.PI * 2), 0);
    }
    b.mesh.scale.set(s0 * ax, s0, s0 * az);
    const mat = b.mesh.material as THREE.MeshBasicMaterial;
    mat.map = b.frames ? b.frames[0] : tex;
    mat.color.setHex(hex);
    mat.opacity = maxOp;
    mat.blending = additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    mat.needsUpdate = true;
  }

  private allocMesh(
    geo: THREE.BufferGeometry | null, x: number, y: number, z: number, tex: THREE.Texture,
    hex: number, s0: number, s1: number, life: number, maxOp = 0.85, rotY = 0, additive = true,
    ax = 1, ay = 1, az = 1,
    opts?: { verticalYaw?: number; ayEnd?: number; c1?: number },
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
    b.ayEnd = opts?.ayEnd ?? 1;
    b.c0 = opts?.c1 !== undefined ? hex : -1;
    b.c1 = opts?.c1 ?? -1;
    b.mesh.geometry = geo;
    b.mesh.visible = true;
    b.mesh.position.set(x, y, z);
    if (opts?.verticalYaw !== undefined) {
      b.mesh.rotation.set(Math.PI / 2, opts.verticalYaw, 0, 'YXZ');
    } else {
      b.mesh.rotation.set(0, Math.random() * Math.PI * 2, 0);
    }
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
   * Quick AI Q-13 + Antigravity AG-05 按 14.14 原版全层重建（含 SandBurst 沙尘）：
   * FloorFlash + Crater + SandBurst + RingOut + Swirls + PixelHit。弹坑节流防 9 枚齐射叠糊。
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
    // Jinx_E_SandBrust（AG-05 补齐）：SandStreaks 2×2，bS (120, 160) × 0.5 → 1.2 × 1.6 m，普通混合，0.75 s，向外冲出并受阻力减速
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const spd = (4.8 + Math.random() * 1.4) * k;
      const cell = this.sandCells[i & 3];
      this.allocPlane(
        x + Math.cos(a) * 0.25 * k, 0.18, z + Math.sin(a) * 0.25 * k,
        cell, 0xfff2f2, 0.85 * k, 1.52 * k, 0.75, 0.62, 0, false, null, 1.15, 1.55,
        {
          flatYaw: Math.atan2(Math.cos(a), Math.sin(a)),
          vx: Math.cos(a) * spd, vy: (0.9 + Math.random() * 0.5) * k, vz: Math.sin(a) * spd,
          drag: 2.6, renderOrder: 12,
        },
      );
    }
    // Jinx_E_Swirls：Q_AnimeBurstMesh02 bS (4, 2.75, 2.75) × 0.5，E_ErosionSphere02，0.35 s，0.5 → 1.2 倍，自转 100°/s
    this.allocMesh(this.geoQAnime, x, 0.12, z, this.texEErosion, 0xffff00, 0.5, 1.2, 0.35, 1.0, 1.745, true, 0.02 * k, 0.01375 * k, 0.01375 * k);
    // Jinx_E_RingOut：Q_Praxis bS (3.25, 1.25, 1.0) × 0.5，E_Praxis，0.45 s，黄色 α 0.4
    this.allocMesh(this.geoQPraxis, x, 0.15, z, this.texEPraxis, 0xffff7f, 1, 1, 0.45, 0.4, 0, true, 0.01625 * k, 0.00625 * k, 0.005 * k);
    // Jinx_E_PixelHit：Pixel 像素块 8 个，2 × 30 / 100 × 0.5 = 0.3 m，0.65 s，向外飞散
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * 0.6 * k;
      const spd = (5.0 + Math.random() * 3.0) * k;
      this.allocPlane(
        x + Math.cos(a) * d, 0.25, z + Math.sin(a) * d, this.texPixel, 0xffff00, 0.3 * k, 0.6 * k, 0.65, 1.0, 0, true, null, 1, 1,
        { vx: Math.cos(a) * spd, vy: 1.5, vz: Math.sin(a) * spd, drag: 7.5, c1: 0x55ffff },
      );
    }
  }

  /**
   * R 超究极死神飞弹爆炸：Strawberry_Jinx_Base_R_Tar（按爆炸半径相对基础 5 m 等比放大）
   * Quick AI Q-13 + Antigravity AG-05 按 14.14 原版全 11 层重建：
   * vortex 焦痕 + Hit_Flash + CloudFaceBackGlow + CloudFace4 2×2 翻页动画 + fast 碎石 + Dark Smoke 黑烟 +
   * Swirls + EnergyRing_Out + SolidBeams 光束 + PixelCast + LingerBoxes 星星。
   */
  spawnUltDome(x: number, z: number, radius: number) {
    const k = radius / 5.0;
    // 1. vortex：R_CraterObsi 焦痕 2 × 580 / 100 = 11.6 m，普通混合，1.0 s，0.5 → 1.0 倍
    this.allocPlane(x, 0.03, z, this.texCraterObsi, 0xc8c8c8, 5.8 * k, 11.6 * k, 1.0, 1.0, 0, false, null, 1, 1, { renderOrder: 9 });
    // 2. Hit_Flash：Glow2 黄白 (1, 1, 0.498)，2 × 500 / 100 = 10 m，0.2 s 内收缩
    this.allocPlane(x, 0.28, z, this.texGlow2, 0xffff7f, 10 * k, 5 * k, 0.2, 1.0, 0);
    // 3. CloudFaceBackGlow：Aura_Self 2 × 425 / 100 = 8.5 m，y = 1.2 m，0.45 s，0.7 → 1.0 倍，黄 → 青 → 蓝
    this.allocPlane(x, 1.2, z, this.texAura, 0xffff00, 5.95 * k, 8.5 * k, 0.45, 0.95, 0, true, null, 1, 1, { c1: 0x00aaff, renderOrder: 14 });
    // 4. CloudFace4（AG-05 补齐）：Strawberry_Jinx_Flipbook 2×2 4 帧翻页动画，bS (300, 210) → 6.0 × 4.2 m，0.7 → 1.0 倍，0.38 s
    this.allocPlane(
      x, 1.28, z, this.cloudFaceCells[0], 0xffffff, 0.7 * k, 1.0 * k, 0.38, 0.95, 0, true, null, 6.0, 4.2,
      { flatYaw: 0, frames: this.cloudFaceCells, renderOrder: 16 },
    );
    // 5. Dark Smoke（AG-05 补齐）：Particles_1_9 2×2，15 团，bS 65 → 1.3 m 扩至 3× (3.9 m)，普通混合，0.45 s，[0.38,0.38,0.38]
    for (let i = 0; i < 15; i++) {
      const a = (i / 15) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
      const spd = (5.5 + Math.random() * 4.0) * k;
      this.allocPlane(
        x + Math.cos(a) * 0.4 * k, 0.22 + Math.random() * 0.35, z + Math.sin(a) * 0.4 * k,
        this.smokeCells[i & 3], 0x616161, 1.3 * k, 3.6 * k, 0.45, 0.72, (Math.random() - 0.5) * 2.5, false, null, 1, 1,
        { vx: Math.cos(a) * spd, vy: 1.2 + Math.random() * 1.4, vz: Math.sin(a) * spd, drag: 2.2, renderOrder: 11 },
      );
    }
    // 6. fast 碎石（AG-05 补齐）：R_Rocks_2x2 2×2，14 块，普通混合，深紫灰 [0.26, 0.22, 0.33]，高速向外向上抛射
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const spd = (6.5 + Math.random() * 3.5) * k;
      this.allocPlane(
        x + Math.cos(a) * 0.3 * k, 0.35, z + Math.sin(a) * 0.3 * k,
        this.rockCells[i & 3], 0x423854, 0.85 * k, 1.15 * k, 0.42, 0.9, (Math.random() - 0.5) * 6, false, null, 0.85, 1.15,
        { vx: Math.cos(a) * spd, vy: 5.5 + Math.random() * 5.0, vz: Math.sin(a) * spd, drag: 3.5, gravity: 18, renderOrder: 12 },
      );
    }
    // 7. SolidBeams 光束（AG-05 补齐）：R_Shapes01 2×2，8 道径向光束，bS (25, 110) → 0.5 × 2.2 m 拉伸至 6.0 m，0.28 s，黄 → 青
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
      this.allocPlane(
        x + Math.cos(a) * 1.6 * k, 0.38, z + Math.sin(a) * 1.6 * k,
        this.beamCells[i & 3], 0xffe840, 1.0 * k, 2.2 * k, 0.28, 0.88, 0, true, null, 0.55, 2.4,
        { flatYaw: Math.atan2(Math.cos(a), Math.sin(a)), vx: Math.cos(a) * 4.0 * k, vz: Math.sin(a) * 4.0 * k, drag: 2.0, c1: 0x55ffff, renderOrder: 15 },
      );
    }
    // 8. Swirls：R_AnimeBurstMesh02 bS (4, 2.75, 2.75)，E_ErosionSphere02，0.375 s，0.5 → 1.2 倍，自转 100°/s，α 0.659
    this.allocMesh(this.geoRAnime, x, 0.12, z, this.texEErosion, 0xffff00, 0.5, 1.2, 0.375, 0.659, 1.745, true, 0.04 * k, 0.0275 * k, 0.0275 * k);
    // 9. EnergyRing_Out：R_Praxis bS (2.65, 1.25, 1.0)，E_Praxis，0.45 s，黄色，峰值 α 0.4 × 0.647
    this.allocMesh(this.geoRPraxis, x, 0.18, z, this.texEPraxis, 0xffff00, 1, 1, 0.45, 0.26, 0, true, 0.0265 * k, 0.0125 * k, 0.01 * k);
    // 10. PixelCast：Pixel 15 个，2 × 25 / 100 = 0.5 m，0.65 s，向外飞散
    for (let i = 0; i < 15; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * 1.2 * k;
      const spd = (8.0 + Math.random() * 5.0) * k;
      this.allocPlane(
        x + Math.cos(a) * d, 0.28, z + Math.sin(a) * d, this.texPixel, 0xffff00, 0.5 * k, 1.0 * k, 0.65, 1.0, 0, true, null, 1, 1,
        { vx: Math.cos(a) * spd, vy: 2.2, vz: Math.sin(a) * spd, drag: 7.5, c1: 0x9b69ff },
      );
    }
    // 11. LingerBoxes：lilStar 4 颗，黄 (1, 0.867, 0.184)
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
      const rx = this.rocketGroup.position.x;
      const ry = this.rocketGroup.position.y;
      const rz = this.rocketGroup.position.z;
      const yaw = this.rocketGroup.rotation.y;
      const fwdX = Math.sin(yaw);
      const fwdZ = Math.cos(yaw);
      const rightX = Math.cos(yaw);
      const rightZ = -Math.sin(yaw);

      this.rocketRingSpawnT -= dt;
      if (this.rocketRingSpawnT <= 0) {
        // 原版 Ring Blue Big / Ring Yellow Small（R_Swirl 3D 网格）+ Speed_impact（R_CastRing_01 3D 网格）：均每秒 3 个
        this.rocketRingSpawnT = 1 / 3;
        const bx = rx + fwdX * 1.0;
        const bz = rz + fwdZ * 1.0;
        if (this.geoSwirl) {
          this.allocMesh(
            this.geoSwirl, bx, ry, bz, this.texCircleMis, 0x00a5a5, 1.0, 1.0, 0.35, 0.769, 0, true,
            0.01, 0.02, 0.007, { verticalYaw: yaw, ayEnd: 0.05 },
          );
          this.allocMesh(
            this.geoSwirl, bx, ry, bz, this.texCircleMis, 0xffaa00, 1.0, 1.0, 0.35, 0.769, 0, true,
            0.0085, 0.02, 0.007, { verticalYaw: yaw, ayEnd: 0.05 },
          );
        } else {
          this.allocPlane(bx, ry, bz, this.texCircleMis, 0x00a5a5, 0.65, 1.85, 0.35, 0.769, 0, true, yaw);
          this.allocPlane(bx, ry, bz, this.texCircleMis, 0xffaa00, 0.45, 1.35, 0.35, 0.769, 0, true, yaw);
        }
        // Speed_impact：R_CastRing_01 网格 + speed_impact.webp，bS (3.5, 5, 5)，sc 5→10 (y 5→25)，0.30 s，粉 → 青 → 橙
        if (this.geoCastRing) {
          this.allocMesh(
            this.geoCastRing, rx - fwdX * 0.6, ry, rz - fwdZ * 0.6, this.texSpeedImpact, 0x55ffff,
            5.0, 10.0, 0.30, 0.85, 0, true, 0.035, 0.05, 0.05, { verticalYaw: yaw, ayEnd: 2.5, c1: 0xffaa00 },
          );
        }
      }

      // AG-05 补齐 R_Mis 左右地面风（Left/Right Wind）：r_ground_smoke02 1×2，普通混合，[0.7, 0.67, 0.56]，0.45 s
      this.rocketWindAcc += dt * 18;
      while (this.rocketWindAcc >= 1) {
        this.rocketWindAcc -= 1;
        for (const side of [-1, 1]) {
          const wx = rx - fwdX * 0.8 + rightX * side * 1.35;
          const wz = rz - fwdZ * 0.8 + rightZ * side * 1.35;
          const splayYaw = yaw + side * 0.35;
          this.allocPlane(
            wx, 0.09, wz, this.windCells[Math.random() < 0.5 ? 0 : 1], 0xb3ab8f,
            1.0, 1.35, 0.45, 0.44, 0, false, null, 2.4, 2.2,
            {
              flatYaw: splayYaw,
              vx: rightX * side * 1.4 - fwdX * 1.2, vy: 0.45, vz: rightZ * side * 1.4 - fwdZ * 1.2,
              drag: 1.5, renderOrder: 10,
            },
          );
        }
      }

      // AG-05 补齐 R_Mis Dark Smoke-Blended（15/s，普通混合 0x334d70）与 Add Smoke（9/s，叠加 0xa6a6a6）
      this.rocketSmokeAcc += dt * 15;
      while (this.rocketSmokeAcc >= 1) {
        this.rocketSmokeAcc -= 1;
        const jx = (Math.random() - 0.5) * 0.6;
        const jz = (Math.random() - 0.5) * 0.6;
        this.allocPlane(
          rx - fwdX * 1.8 + jx, Math.max(0.25, ry - 0.2), rz - fwdZ * 1.8 + jz,
          this.smokeCells[(Math.random() * 4) | 0], 0x334d70, 1.0, 1.35, 0.45, 0.55, (Math.random() - 0.5) * 3, false, null, 1, 1,
          { vx: -fwdX * 1.5, vy: -0.4, vz: -fwdZ * 1.5, renderOrder: 11 },
        );
      }
      this.rocketAddSmokeAcc += dt * 9;
      while (this.rocketAddSmokeAcc >= 1) {
        this.rocketAddSmokeAcc -= 1;
        const jx = (Math.random() - 0.5) * 0.5;
        const jz = (Math.random() - 0.5) * 0.5;
        this.allocPlane(
          rx - fwdX * 1.6 + jx, Math.max(0.3, ry - 0.1), rz - fwdZ * 1.6 + jz,
          this.smokeCells[(Math.random() * 4) | 0], 0xa6a6a6, 0.95, 1.3, 0.45, 0.48, (Math.random() - 0.5) * 3, true, null, 1, 1,
          { vx: -fwdX * 1.2, vy: -0.3, vz: -fwdZ * 1.2, renderOrder: 12 },
        );
      }

      // AG-05 补齐 R_Mis Spots 猫脸点（3/s，cat_faces 2×1，[0.08, 1, 0.69]）
      this.rocketSpotAcc += dt * 3;
      while (this.rocketSpotAcc >= 1) {
        this.rocketSpotAcc -= 1;
        const side = (Math.random() - 0.5) * 1.4;
        this.allocPlane(
          rx - fwdX * 1.2 + rightX * side, ry + 0.15, rz - fwdZ * 1.2 + rightZ * side,
          this.catFaceCells[Math.random() < 0.5 ? 0 : 1], 0x14ffb0, 0.45, 0.55, 0.9, 0.85, 0, true, null, 1, 1,
          { vx: -fwdX * 3.0 + rightX * side, vy: 0.4, vz: -fwdZ * 3.0 + rightZ * side, drag: 1.5, renderOrder: 15 },
        );
      }

      // AG-05 补齐 R_Mis LittleStar（12/s）与 [Mid]PixelCast（5/s）
      this.rocketStarAcc += dt * 12;
      while (this.rocketStarAcc >= 1) {
        this.rocketStarAcc -= 1;
        this.spawnStars(rx - fwdX * 1.0, rz - fwdZ * 1.0, 1, 3.8, Math.random() < 0.5 ? 0x55ffff : 0xffee55);
      }
      this.rocketPixelAcc += dt * 5;
      while (this.rocketPixelAcc >= 1) {
        this.rocketPixelAcc -= 1;
        const side = (Math.random() - 0.5) * 1.1;
        this.allocPlane(
          rx - fwdX * 1.1 + rightX * side, ry + 0.05, rz - fwdZ * 1.1 + rightZ * side,
          this.texPixel, 0x55ffff, 0.55, 0.85, 0.7, 0.9, 0, true, null, 1.0, 0.55,
          { vx: -fwdX * 3.0, vy: 0.2, vz: -fwdZ * 3.0, drag: 2.5, c1: 0xffaa00, renderOrder: 15 },
        );
      }
    } else {
      this.rocketAge = 0;
      this.rocketRingSpawnT = 0;
      this.rocketWindAcc = 0;
      this.rocketSmokeAcc = 0;
      this.rocketAddSmokeAcc = 0;
      this.rocketSpotAcc = 0;
      this.rocketStarAcc = 0;
      this.rocketPixelAcc = 0;
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
      if (b.vx || b.vy || b.vz || b.gravity) {
        if (b.drag > 0) {
          const damp = Math.exp(-b.drag * dt);
          b.vx *= damp;
          b.vy *= damp;
          b.vz *= damp;
        }
        if (b.gravity) b.vy -= b.gravity * dt;
        b.mesh.position.x += b.vx * dt;
        b.mesh.position.y = Math.max(0.05, b.mesh.position.y + b.vy * dt);
        b.mesh.position.z += b.vz * dt;
      }
      if (b.rotSpeed) b.mesh.rotation.y += b.rotSpeed * dt;
      const mat = b.mesh.material as THREE.MeshBasicMaterial;
      if (b.frames) {
        const fi = Math.min(b.frames.length - 1, Math.floor(k * b.frames.length));
        if (mat.map !== b.frames[fi]) {
          mat.map = b.frames[fi];
          mat.needsUpdate = true;
        }
        // Flipbook 淡入淡出：0→0.15 淡入，0.75→1 淡出
        const fade = k < 0.15 ? k / 0.15 : k > 0.75 ? (1 - k) / 0.25 : 1;
        mat.opacity = fade * b.maxOp * opScale;
      } else {
        mat.opacity = (1 - k) * b.maxOp * opScale;
      }
      if (b.c0 >= 0 && b.c1 >= 0) {
        this.tmpC0.setHex(b.c0);
        this.tmpC1.setHex(b.c1);
        mat.color.copy(this.tmpC0).lerp(this.tmpC1, k);
      }
    }

    for (const b of this.meshes) {
      if (!b.active) continue;
      b.age += dt;
      if (b.age >= b.life) { b.active = false; b.mesh.visible = false; continue; }
      const k = b.age / b.life;
      const ease = 1 - Math.pow(1 - k, 2);
      const sM = b.s0 + (b.s1 - b.s0) * ease;
      const yMul = 1 + (b.ayEnd - 1) * k;
      b.mesh.scale.set(sM * b.ax, sM * b.ay * yMul, sM * b.az);
      if (b.rotY) b.mesh.rotation.y += b.rotY * dt;
      const mat = b.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - k) * b.maxOp * opScale;
      if (b.c0 >= 0 && b.c1 >= 0) {
        this.tmpC0.setHex(b.c0);
        this.tmpC1.setHex(b.c1);
        mat.color.copy(this.tmpC0).lerp(this.tmpC1, k);
      }
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
