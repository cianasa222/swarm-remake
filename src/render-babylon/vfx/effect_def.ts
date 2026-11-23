/**
 * BAB-01 · B4 通用 VFX 数据结构（与渲染引擎解耦）
 *
 * Quick AI（AWS Quick）2026-11-23 编写，编号 BAB-Q01。**纯 TypeScript 类型，不 import 任何引擎**，
 * Three.js 旧渲染器、Babylon.js 新渲染器、离线工具和测试都只依赖这一份定义。
 *
 * 数据来源：Patch 14.14 `VfxSystemDefinitionData`（map33.bin.json、角色 skin0.bin.json），
 * 由 `tools/bab/extract_vfx_14_14.cjs` 逐字段转换，**数值保持原版单位，不做换算**；
 * 换算规则集中在 `EFFECT_UNITS`，由运行器统一处理，避免各模块各写一套（见 jinx_14.14.md 6.1 节的历史问题）。
 *
 * 状态：⚠️ 未编译（Quick AI 环境没有 TypeScript）。字段名以原版为准，接入 Babylon 运行器时如需调整，
 * 改这里并同步修改转换脚本的 `SCHEMA_VERSION`。
 */

export const EFFECT_SCHEMA_VERSION = 1;

/** 原版单位约定。运行器读取后自行换算，数据文件里永远是原值。 */
export const EFFECT_UNITS = {
  /** 原版 1 单位 = 1 cm；项目世界坐标 1 = 1 m */
  worldScale: 0.01,
  /**
   * 平面粒子（quad）宽度换算：全宽 m = 2 × birthScale / 100。
   * ⚠️ 这条规则来自喷泉审计（fountain_emitters_14.14.md），**还没有用原版截图验证**；
   * 金克丝特效目前用的是这个值的 55–65%（jinx_14.14.md 6.1 节）。B4 验收时先用 1 张原版截图定系数。
   */
  quadFullWidthPerBirthScale: 0.02,
  /** 网格粒子：缩放 = birthScale / 100 × 系统 transform（与 docs/tasks/missing_assets_14.14.md 一致） */
  meshScalePerBirthScale: 0.01,
} as const;

// ───────────────────────── 数值与曲线 ─────────────────────────

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type Rgba = [number, number, number, number];
export type Scalar = number | Vec2 | Vec3 | Rgba;

/**
 * 原版 ValueFloat / ValueVector2 / ValueVector3 / ValueColor 的统一表示。
 * - `c`：constantValue（无曲线时直接用）
 * - `t` / `v`：dynamics 关键帧（时间 0..1 归一化到粒子寿命或发射器寿命，由所在字段决定）
 * - `rnd`：probabilityTables（每个分量一张随机表，`t`=keyTimes、`v`=keyValues，含义同原版）
 * - `integrated`：原版 IntegratedValue*（对曲线积分后使用，例如 UV 滚动量）
 * - `flex`：原版 Flex*（运行时由游戏逻辑覆盖的可调值）
 */
export interface Curve<T extends Scalar = Scalar> {
  c?: T;
  t?: number[];
  v?: T[];
  rnd?: { t: number[]; v: number[] }[];
  integrated?: boolean;
  flex?: boolean;
}

// ───────────────────────── 图元与材质 ─────────────────────────

/** 原版 primitive.__type 的归类 */
export type PrimitiveKind =
  | 'billboard'          // 无 primitive（默认面向相机的四边形）
  | 'quad'               // VfxPrimitiveArbitraryQuad（任意朝向四边形，常用于贴地 / 贴花）
  | 'cameraUnitQuad'     // VfxPrimitiveCameraUnitQuad
  | 'mesh'               // VfxPrimitiveMesh（SCB / SCO 网格）
  | 'attachedMesh'       // VfxPrimitiveAttachedMesh（贴在角色骨骼网格上）
  | 'ray'                // VfxPrimitiveRay（沿速度方向拉伸）
  | 'beam'               // VfxPrimitiveBeam（两点之间的光带，如闪电链）
  | 'cameraTrail'        // VfxPrimitiveCameraTrail
  | 'arbitraryTrail'     // VfxPrimitiveArbitraryTrail
  | 'planarProjection'   // VfxPrimitivePlanarProjection（投影贴花）
  | 'unknown';

/**
 * 原版 blendMode。目前项目内一致采用：1 = 普通 alpha 混合、4 = 叠加（additive）。
 * 2 / 3 / 5 的确切含义**未经截图验证**，保留原值，运行器遇到时打印一次警告并按 alpha 处理。
 */
export type BlendKind = 'alpha' | 'additive' | 'mode2' | 'mode3' | 'mode5' | 'default';

export interface TextureRef {
  /** 原版路径，如 ASSETS/Maps/Particles/Strawberry/Healing_Shockwave.StrawberryRebuild.dds */
  path: string;
  /** CommunityDragon 14.14 对应的 PNG（全部小写、扩展名改 .png）；是否真的存在见报告的「贴图可用性」 */
  cdragonPng: string;
  /** 项目内已转换的运行时文件（`public/assets/...`），未知时为 null，由迁移者按需补登 */
  project?: string | null;
}

export interface MaterialDef {
  texture: TextureRef | null;
  /** 原版 textureMult（第二张叠乘贴图）及其 UV 参数，原样保留 */
  textureMult?: { texture: TextureRef | null; params: Record<string, unknown> } | null;
  blend: BlendKind;
  blendModeRiot: number | null;
  alphaRef?: number;
  /** 原版 pass：同一系统内的绘制顺序 */
  pass?: number;
  depthBiasFactors?: Vec2;
  disableBackfaceCull?: boolean;
  miscRenderFlags?: number;
  meshRenderFlags?: number;
  texAddressModeBase?: number;
  textureFlipU?: boolean;
  textureFlipV?: boolean;
  /** 原版 particleColorTexture（按寿命或速度查色的渐变贴图） */
  colorTexture?: TextureRef | null;
  colorLookUp?: { typeX?: number; typeY?: number; scales?: Vec2; offsets?: Vec2 } | null;
  palette?: Record<string, unknown> | null;
  alphaErosion?: Record<string, unknown> | null;
  softParticle?: Record<string, unknown> | null;
}

export interface UvDef {
  /** 翻页动画：图集列 × 行 */
  texDiv?: Vec2;
  numFrames?: number;
  startFrame?: number;
  isRandomStartFrame?: boolean;
  frameRate?: number;
  birthFrameRate?: Curve;
  uvScale?: Curve;
  birthUvOffset?: Curve;
  birthUvScrollRate?: Curve;
  particleUvScrollRate?: Curve;
  emitterUvScrollRate?: Curve;
  uvRotation?: Curve;
  particleUvRotateRate?: Curve;
  birthUvRotateRate?: Curve;
  uvScrollClamp?: boolean;
  uvMode?: number;
  uvTransformCenter?: Vec2;
}

// ───────────────────────── 图层（= 原版 emitter） ─────────────────────────

export interface EffectLayer {
  /** 原版 emitterName（同系统内唯一时可作为稳定 id） */
  name: string;
  /** 在系统 emitter 数组里的下标（emitterName 重复时用它区分） */
  index: number;
  emitterKind: 'complex' | 'simple';
  primitive: PrimitiveKind;
  /** 原版 primitive 对象原样保留（网格名、trail / beam 参数等） */
  primitiveRaw?: Record<string, unknown> | null;
  /** 网格路径（SCB / SCO / SKN），primitive 为 mesh / attachedMesh 时有值 */
  mesh?: string | null;

  // —— 时间 ——
  /** 发射器寿命（秒）；-1 / 缺省 = 跟随系统 */
  emitterLifetime?: number;
  timeBeforeFirstEmission?: number;
  isSingleParticle?: boolean;
  rate?: Curve;
  particleLifetime?: Curve;
  particleLinger?: number;
  emitterLinger?: number;

  // —— 生成与运动 ——
  emitterPosition?: Curve;
  spawnShape?: Record<string, unknown> | null;
  birthVelocity?: Curve;
  velocity?: Curve;
  birthAcceleration?: Curve;
  acceleration?: Curve;
  worldAcceleration?: Curve;
  birthDrag?: Curve;
  drag?: Curve;
  birthOrbitalVelocity?: Curve;
  directionVelocityScale?: number;

  // —— 变换 ——
  birthScale?: Curve;
  scale?: Curve;
  isUniformScale?: boolean;
  birthRotation?: Curve;
  rotation?: Curve;
  birthRotationalVelocity?: Curve;
  isRotationEnabled?: boolean;
  isDirectionOriented?: boolean;
  isLocalOrientation?: boolean;
  particleIsLocalOrientation?: boolean;
  isGroundLayer?: boolean;
  isFollowingTerrain?: boolean;
  bindWeight?: Curve;
  importance?: number;

  // —— 颜色 ——
  birthColor?: Curve<Rgba>;
  color?: Curve<Rgba>;
  modulationFactor?: Curve;

  material: MaterialDef;
  uv: UvDef;

  /** 子系统（原版 childParticleSetDefinition） */
  children?: Record<string, unknown> | null;
  /** 原版力场（fieldCollectionDefinition） */
  fields?: Record<string, unknown> | null;

  /**
   * 运行器**目前不支持**、但原版用到的字段（键名）。B4 运行器每支持一项就从这里移除。
   * 不能静默丢弃：验收时按这份清单逐项说明替代方案或待办。
   */
  unsupported: string[];
  /** 没有映射到上面任何字段的原版键值，原样保留，避免信息丢失 */
  extra: Record<string, unknown>;
}

// ───────────────────────── 系统（= 原版 VfxSystemDefinitionData） ─────────────────────────

export type EffectCategory =
  | 'fountain'
  | 'weapon'
  | 'jinx'
  | 'enemy'
  | 'reksai'
  | 'map'
  | 'other';

export interface EffectSource {
  /** 原版文件（KV `ref/14.14/...` 路径） */
  file: string;
  /** 系统在 bin 里的键 */
  key: string;
  particleName?: string;
  particlePath?: string;
  /** 该系统原始 JSON（JSON.stringify 原顺序）的 SHA-256，用来确认数据没被改过 */
  sha256: string;
  patch: '14.14';
}

export interface EffectDef {
  schema: typeof EFFECT_SCHEMA_VERSION;
  /** 稳定 id：系统键的最后一段 */
  id: string;
  category: EffectCategory;
  source: EffectSource;
  /** 项目里的对应对象，例如 { weapon: 'bunnymega' }、{ fountain: true }、{ boss: 'reksai' } */
  gameRefs: Record<string, string | boolean>;
  /** 引用这个系统的原版 SpellObject（脚本名 → 字段名） */
  usedBySpells?: { spell: string; field: string }[];

  flags?: number;
  visibilityRadius?: number;
  /** 系统 4×4 变换（原版 transform，行主序原样保留） */
  transform?: number[][] | null;
  soundOnCreate?: string | null;
  soundPersistent?: string | null;
  buildUpTime?: number;
  scaleDynamicallyWithAttachedBone?: boolean;
  overrideScaleCap?: number;
  drawingLayer?: number;

  layers: EffectLayer[];
  /** 系统级未映射字段 */
  extra: Record<string, unknown>;
}

// ───────────────────────── 运行时实例（引擎无关） ─────────────────────────

/** 谁的特效：用于「减轻队友特效」只降队友装饰，不影响敌方预警和命中反馈 */
export type EffectOwner = 'self' | 'teammate' | 'enemy' | 'world';

/** 特效重要性：决定低画质下能不能被裁掉 */
export type EffectImportance = 'critical' | 'gameplay' | 'decor';

/**
 * 运行器每次播放一个系统时收到的参数。来自模拟层事件（sim 不依赖本类型，由渲染侧适配）。
 * 运行器不得改变模拟状态；裁掉的只是渲染对象。
 */
export interface EffectSpawnRequest {
  effectId: string;
  /** 世界坐标（m） */
  position: Vec3;
  /** 朝向（弧度，绕 Y 轴） */
  yaw?: number;
  /** 两点类特效（闪电链 / 光带）的终点，必须用模拟事件的真实端点 */
  target?: Vec3;
  /** 额外缩放（例如武器范围 / 被动「效果范围」加成） */
  scale?: number;
  owner: EffectOwner;
  ownerId?: number;
  importance: EffectImportance;
  /** 挂点：实体 id + 骨骼名，空时为世界空间 */
  attach?: { entityId: number; bone?: string } | null;
  /** 时长覆盖（秒），例如持续型区域 */
  duration?: number;
  seed?: number;
}

/** 画质对特效的约束（由 quality.ts 提供，运行器只读） */
export interface EffectQualityBudget {
  /** 装饰粒子倍率（对应现有 fxScale） */
  decorScale: number;
  /** 装饰粒子上限（对应现有 particleBudget） */
  decorBudget: number;
  /** 队友装饰倍率（对应现有 teammateVfxScale）；只作用于 owner = 'teammate' 且 importance = 'decor' */
  teammateDecorScale: number;
  /** 减弱闪光（无障碍选项） */
  reduceFlash: boolean;
}
