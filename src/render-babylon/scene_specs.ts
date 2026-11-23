/**
 * BAB-01 · B2（仓库区地图/光照/镜头）与 B3（金克丝/雷克塞骨骼动画状态机）精确迁移规格
 * 严格对齐现主线 src/render/map_warehouse.ts、hero_jinx.ts、boss_reksai.ts（AG-09）与 14.14 参数。
 * 零外部依赖纯 TypeScript，供 Babylon B2/B3 渲染实现直接引用。
 */

export const WAREHOUSE_SCENE_SPEC = {
  clearColorHex: '#5fa8d3',
  hemisphereLight: {
    skyHex: '#b4f5ff',
    groundHex: '#566c8e',
    intensity: 0.95,
  },
  sunLight: {
    colorHex: '#f9f0dd',
    intensity: 1.95,
    position: [-24, 34, 28] as const,
    shadowMapSize: 2048,
    shadowOrthoExtent: 28,
    shadowNear: 5,
    shadowFar: 120,
  },
  seaPlane: {
    size: 520,
    colorHex: '#0b3c52',
    roughness: 0.35,
  },
  lightmap: {
    uvSetIndex: 1,
    /** 14.14 烘焙光照图走贴图乘法叠加而非阴影遮罩 */
    useLightmapAsShadowmap: false,
    expectedBakedTextures: 22,
  },
  camera: {
    fovDeg: 40,
    height: 22.5,
    back: 17.8,
    /** 竖屏最大拉远倍率（对齐 M0-B 与 ui_camera_audio_14.14.md） */
    portraitMaxZoom: 1.42,
    referenceAspect: 16 / 9,
  },
} as const;

/**
 * 计算 Babylon 相机相对目标点的偏移量（桌面 16:9 与竖屏自适应拉远）。
 */
export function computeCameraOffset(aspect: number, camDistScale = 1): {
  height: number;
  back: number;
  zoomFactor: number;
} {
  const safeAspect = Math.max(0.35, Number.isFinite(aspect) ? aspect : WAREHOUSE_SCENE_SPEC.camera.referenceAspect);
  const portraitRatio = safeAspect < 1 ? Math.min(WAREHOUSE_SCENE_SPEC.camera.portraitMaxZoom, 1 / safeAspect) : 1;
  const zoomFactor = portraitRatio * Math.max(0.25, camDistScale);
  return {
    height: WAREHOUSE_SCENE_SPEC.camera.height * zoomFactor,
    back: WAREHOUSE_SCENE_SPEC.camera.back * zoomFactor,
    zoomFactor,
  };
}

/** B3：金克丝 12 个核心动画状态键（对齐 hero_jinx.ts） */
export type JinxClipKey =
  | 'mg_idle'
  | 'mg_run_f'
  | 'mg_run_b'
  | 'mg_run_l'
  | 'mg_run_r'
  | 'mg_atk_idle'
  | 'cn_idle'
  | 'cn_run'
  | 'cn_atk_idle'
  | 'cn_atk_run'
  | 'ult'
  | 'death';

export interface JinxAnimStateInput {
  alive: boolean;
  castingUlt: boolean;
  weapon: 'mg' | 'cn';
  moving: boolean;
  attacking: boolean;
  /** 移动方向相对朝向的本地分量（前正后负，右正左负） */
  localForward?: number;
  localRight?: number;
}

export function resolveJinxClipKey(input: JinxAnimStateInput): JinxClipKey {
  if (!input.alive) return 'death';
  if (input.castingUlt) return 'ult';

  if (input.weapon === 'cn') {
    if (input.moving) return input.attacking ? 'cn_atk_run' : 'cn_run';
    return input.attacking ? 'cn_atk_idle' : 'cn_idle';
  }

  if (!input.moving) return input.attacking ? 'mg_atk_idle' : 'mg_idle';
  const fwd = input.localForward ?? 1;
  const right = input.localRight ?? 0;
  if (Math.abs(right) > Math.abs(fwd)) {
    return right >= 0 ? 'mg_run_r' : 'mg_run_l';
  }
  return fwd >= 0 ? 'mg_run_f' : 'mg_run_b';
}

/** B3：首领雷克塞 17 段精确动作绑定规则与 AG-09 隐藏子网格规格（对齐 boss_reksai.ts） */
export type RekSaiClipKey =
  | 'idle'
  | 'idleAlt'
  | 'idleBurrowed'
  | 'run'
  | 'runInjured'
  | 'burrow'
  | 'unburrow'
  | 'emerge'
  | 'attack'
  | 'frenzy'
  | 'attackBasic'
  | 'bite'
  | 'stomp'
  | 'cast'
  | 'channelWindup'
  | 'channelLoop'
  | 'death';

export interface RekSaiClipSpec {
  key: RekSaiClipKey;
  pattern: RegExp;
  loop: boolean;
}

export const REKSAI_RIG_SPEC = {
  modelUrl: './assets/enemies/reksai.glb',
  textureUrl: './assets/enemies/reksai.webp',
  /** 官方 skinScale = 2.75，按 100 LOL 单位 = 1 米换算为 0.0275 */
  scale: 0.0275,
  roughness: 0.68,
  metalness: 0.16,
  /** 依据 skin0.bin.json (initialSubmeshToHide: "Wrap Plane") 必须隐藏的 2 个子网格 */
  hiddenSubmeshNames: ['Wrap', 'Plane'] as const,
  visibleSubmeshNames: ['Body', 'Fin', 'Scale'] as const,
  clips: [
    { key: 'idle', pattern: /_idle01\./i, loop: true },
    { key: 'idleAlt', pattern: /_idle02\./i, loop: true },
    { key: 'idleBurrowed', pattern: /_idle01_burrowed\./i, loop: true },
    { key: 'run', pattern: /_runhaste\./i, loop: true },
    { key: 'runInjured', pattern: /_run_injured\./i, loop: true },
    { key: 'burrow', pattern: /_run_burrowed\./i, loop: true },
    { key: 'unburrow', pattern: /_spell2_unburrow\./i, loop: false },
    { key: 'emerge', pattern: /_spell4_emerge\./i, loop: false },
    { key: 'attack', pattern: /_spell1\./i, loop: true },
    { key: 'frenzy', pattern: /_spell1_frenzy_mirror\./i, loop: true },
    { key: 'attackBasic', pattern: /_attack1\./i, loop: true },
    { key: 'bite', pattern: /_spell3\./i, loop: true },
    { key: 'stomp', pattern: /_spell2_knockup\./i, loop: true },
    { key: 'cast', pattern: /_spell4_cast\./i, loop: true },
    { key: 'channelWindup', pattern: /_channel_windup\./i, loop: false },
    { key: 'channelLoop', pattern: /_channel_loop\./i, loop: true },
    { key: 'death', pattern: /_death\./i, loop: false },
  ] as readonly RekSaiClipSpec[],
} as const;

export function shouldHideRekSaiSubmesh(submeshName: string): boolean {
  const lower = submeshName.trim().toLowerCase();
  return REKSAI_RIG_SPEC.hiddenSubmeshNames.some((h) => lower === h.toLowerCase() || lower.startsWith(`${h.toLowerCase()}_`));
}
