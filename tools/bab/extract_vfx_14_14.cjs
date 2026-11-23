/**
 * BAB-01 · B4：把 Patch 14.14 原版 VFX（VfxSystemDefinitionData）转换成引擎无关的 EffectDef JSON。
 * 结构定义见 src/render-babylon/vfx/effect_def.ts（SCHEMA_VERSION 必须一致）。
 *
 * Quick AI（AWS Quick）2026-11-23，编号 BAB-Q01。无第三方依赖，Node ≥ 18。
 *
 * 用法（原版 bin.json 不进公开仓库，从 Cloudflare KV `ref/14.14/` 或本机解包目录取）：
 *   node tools/bab/extract_vfx_14_14.cjs \
 *     --map33  <map33.bin.json> \
 *     --jinx   <strawberry_jinx/skins/skin0.bin.json> \
 *     --reksai <strawberry_boss_reksai/skins/skin0.bin.json> \
 *     --out    src/render-babylon/vfx/data/14.14
 *
 * 输出：fountain.json / weapons.json / jinx.json / enemy.json / reksai.json / index.json
 * 数值保持原版单位；换算见 effect_def.ts 的 EFFECT_UNITS。
 */
'use strict';

const SCHEMA_VERSION = 1;

// ───────────── 分类规则 ─────────────
// 武器 ↔ 原版对应以 docs/audit/live_vs_14.14.md 第 0 节为准（QC-15 更正后）：
// UwU=RapidShot、旋风切割器=HolyBauble、耀光=HollowRadiance、斯塔缇克=StatikkShiv、
// 十字弩=PierceShot、回旋刃=Boomerang、战兔巨爆=StarStrike、地雷=Mine、冰爆=FrostNova。
// 注意：ScatterArrows / Nuke / CircleShot(NeonLotus) 是**别的武器**，不要混用。
const WEAPONS = [
  { weapon: 'uwu_blaster', riot: 'RapidShot' },
  { weapon: 'cyclonic', riot: 'HolyBauble' },
  { weapon: 'radiant', riot: 'HollowRadiance' },
  { weapon: 'statikk', riot: 'StatikkShiv' },
  { weapon: 'crossbow', riot: 'PierceShot' },
  { weapon: 'boomerang', riot: 'Boomerang' },
  { weapon: 'bunnymega', riot: 'StarStrike' },
  { weapon: 'mines', riot: 'Mine' },
  { weapon: 'iceblast', riot: 'FrostNova' },
];

function classifyMap33(key) {
  const last = key.split('/').pop();
  if (/Fountain|Foutain/i.test(last)) return { category: 'fountain', gameRefs: { fountain: true } };
  if (/RekSai|Reksai|BossSpawn|FallingDebris/i.test(last)) return { category: 'reksai', gameRefs: { boss: 'reksai' } };
  if (/^EliteSpell_|Elite_Missile|Strawberry_Enemy_|PoisonZone/i.test(last)) return { category: 'enemy', gameRefs: { enemy: true } };
  if (/ItemToBuy/i.test(last)) return null; // 商店展示用，不是战斗特效
  if (/\/Particles\/Weapons\//.test(key) || /^Augment_/i.test(last)) {
    for (const w of WEAPONS) {
      const re = new RegExp(`(^|_)${w.riot}(_|$)`, 'i');
      if (re.test(last) || (w.riot === 'StarStrike' && /Starstrike/i.test(last))) return { category: 'weapon', gameRefs: { weapon: w.weapon, riot: w.riot } };
    }
    return null; // 第一关没有实装的其他武器（Nuke、ScatterArrows、Tibbers…）不导出
  }
  return null;
}

// ───────────── 值转换 ─────────────
function isValueObj(v) {
  return v && typeof v === 'object' && typeof v.__type === 'string' && /^(Integrated|Flex)?Value(Float|Vector2|Vector3|Color)$|^FlexValue(Float|Vector2|Vector3)$|^FlexTypeFloat$/.test(v.__type);
}
function curve(v) {
  if (v === undefined || v === null) return undefined;
  if (typeof v === 'number' || Array.isArray(v)) return { c: v };
  if (!isValueObj(v)) return undefined;
  const out = {};
  if (v.__type.startsWith('Integrated')) out.integrated = true;
  if (v.__type.startsWith('Flex')) out.flex = true;
  let base = v;
  if (v.__type.startsWith('Integrated') || v.__type.startsWith('Flex')) {
    // Integrated / Flex 包一层：实际曲线在同名字段或 dynamics 里
    const inner = Object.values(v).find((x) => isValueObj(x));
    if (inner) base = inner;
  }
  if (base.constantValue !== undefined) out.c = base.constantValue;
  const d = base.dynamics;
  if (d && typeof d === 'object') {
    if (Array.isArray(d.times)) out.t = d.times;
    if (Array.isArray(d.values)) out.v = d.values;
    if (Array.isArray(d.probabilityTables)) out.rnd = d.probabilityTables.map((p) => ({ t: p.keyTimes || [], v: p.keyValues || [] }));
  }
  return out;
}

function cdragonPng(p) {
  if (!p || typeof p !== 'string') return '';
  return `https://raw.communitydragon.org/14.14/game/${p.toLowerCase().replace(/\.(dds|tex)$/i, '.png')}`;
}
function tex(p) {
  return p ? { path: p, cdragonPng: cdragonPng(p), project: null } : null;
}

const BLEND = { 1: 'alpha', 4: 'additive', 2: 'mode2', 3: 'mode3', 5: 'mode5' };

const PRIM = {
  VfxPrimitiveArbitraryQuad: 'quad',
  VfxPrimitiveCameraUnitQuad: 'cameraUnitQuad',
  VfxPrimitiveMesh: 'mesh',
  VfxPrimitiveAttachedMesh: 'attachedMesh',
  VfxPrimitiveRay: 'ray',
  VfxPrimitiveBeam: 'beam',
  VfxPrimitiveCameraTrail: 'cameraTrail',
  VfxPrimitiveArbitraryTrail: 'arbitraryTrail',
  VfxPrimitivePlanarProjection: 'planarProjection',
};

/** 运行器第一版暂不支持、必须在验收清单里说明的字段 */
const UNSUPPORTED_KEYS = new Set([
  'distortionDefinition', 'reflectionDefinition', 'fieldCollectionDefinition', 'FlexShapeDefinition',
  'FlexInstanceScale', 'flexBirthUVOffset', 'flexScaleBirthScale', 'flexParticleLifetime',
  'paletteDefinition', 'colorLookUpTypeX', 'colorLookUpTypeY', 'colorLookUpScales', 'colorLookUpOffsets',
  'alphaErosionDefinition', 'softParticleParams', 'stencilMode', 'stencilRef', 'useNavmeshMask',
  'censorModulateValue', 'sliceTechniqueRange', 'materialOverrideDefinitions', 'rateByVelocityFunction',
  'uvParallaxScale', 'falloffTexture', 'Filtering', 'childParticleSetDefinition', 'doesCastShadow',
]);

/** 本脚本显式映射的 emitter 字段 → 读取方式 */
function mapEmitter(em, index, kind) {
  const used = new Set(['__type', 'emitterName']);
  const take = (k) => { used.add(k); return em[k]; };
  const prim = take('primitive');
  const primType = prim && prim.__type;
  const mesh = prim && prim.mMesh ? (prim.mMesh.mSimpleMeshName || prim.mMesh.mMeshName || null) : null;
  const L = {
    name: em.emitterName || `emitter_${index}`,
    index,
    emitterKind: kind,
    primitive: primType ? (PRIM[primType] || 'unknown') : 'billboard',
    primitiveRaw: prim || null,
    mesh,
    emitterLifetime: take('lifetime'),
    timeBeforeFirstEmission: take('timeBeforeFirstEmission'),
    isSingleParticle: take('isSingleParticle') === undefined ? undefined : !!em.isSingleParticle,
    rate: curve(take('rate')),
    particleLifetime: curve(take('particleLifetime')),
    particleLinger: take('particleLinger'),
    emitterLinger: take('emitterLinger'),
    emitterPosition: curve(take('EmitterPosition')),
    spawnShape: take('SpawnShape') || null,
    birthVelocity: curve(take('birthVelocity')),
    velocity: curve(take('velocity')),
    birthAcceleration: curve(take('birthAcceleration')),
    acceleration: curve(take('acceleration')),
    worldAcceleration: curve(take('worldAcceleration')),
    birthDrag: curve(take('birthDrag')),
    drag: curve(take('drag')),
    birthOrbitalVelocity: curve(take('birthOrbitalVelocity')),
    directionVelocityScale: take('directionVelocityScale'),
    birthScale: curve(take('birthScale0')),
    scale: curve(take('scale0')),
    isUniformScale: take('isUniformScale') === undefined ? undefined : !!em.isUniformScale,
    birthRotation: curve(take('birthRotation0')),
    rotation: curve(take('rotation0')),
    birthRotationalVelocity: curve(take('birthRotationalVelocity0')),
    isRotationEnabled: take('isRotationEnabled'),
    isDirectionOriented: take('isDirectionOriented'),
    isLocalOrientation: take('isLocalOrientation'),
    particleIsLocalOrientation: take('particleIsLocalOrientation'),
    isGroundLayer: take('isGroundLayer'),
    isFollowingTerrain: take('isFollowingTerrain'),
    bindWeight: curve(take('bindWeight')),
    importance: take('importance'),
    birthColor: curve(take('birthColor')),
    color: curve(take('color')),
    modulationFactor: curve(take('modulationFactor')),
    material: {
      texture: tex(take('texture')),
      textureMult: (() => {
        const tm = take('textureMult');
        if (!tm) return null;
        const { textureMult: tp, ...params } = tm;
        return { texture: tex(tp), params };
      })(),
      blend: (() => { const b = take('blendMode'); return b === undefined ? 'default' : (BLEND[b] || `mode${b}`); })(),
      blendModeRiot: em.blendMode === undefined ? null : em.blendMode,
      alphaRef: take('alphaRef'),
      pass: take('pass'),
      depthBiasFactors: take('depthBiasFactors'),
      disableBackfaceCull: take('disableBackfaceCull'),
      miscRenderFlags: take('miscRenderFlags'),
      meshRenderFlags: take('meshRenderFlags'),
      texAddressModeBase: take('texAddressModeBase'),
      textureFlipU: take('TextureFlipU'),
      textureFlipV: take('TextureFlipV'),
      colorTexture: tex(take('particleColorTexture')),
      colorLookUp: (em.colorLookUpTypeX !== undefined || em.colorLookUpTypeY !== undefined || em.colorLookUpScales || em.colorLookUpOffsets)
        ? { typeX: take('colorLookUpTypeX'), typeY: take('colorLookUpTypeY'), scales: take('colorLookUpScales'), offsets: take('colorLookUpOffsets') }
        : null,
      palette: take('paletteDefinition') || null,
      alphaErosion: take('alphaErosionDefinition') || null,
      softParticle: take('softParticleParams') || null,
    },
    uv: {
      texDiv: take('texDiv'),
      numFrames: take('numFrames'),
      startFrame: take('startFrame'),
      isRandomStartFrame: take('isRandomStartFrame'),
      frameRate: take('frameRate'),
      birthFrameRate: curve(take('birthFrameRate')),
      uvScale: curve(take('uvScale')),
      birthUvOffset: curve(take('birthUVOffset')),
      birthUvScrollRate: curve(take('birthUvScrollRate')),
      particleUvScrollRate: curve(take('particleUVScrollRate')),
      emitterUvScrollRate: curve(take('emitterUvScrollRate')),
      uvRotation: curve(take('uvRotation')),
      particleUvRotateRate: curve(take('particleUVRotateRate')),
      birthUvRotateRate: curve(take('birthUvRotateRate')),
      uvScrollClamp: take('uvScrollClamp'),
      uvMode: take('uvMode'),
      uvTransformCenter: take('uvTransformCenter'),
    },
    children: take('childParticleSetDefinition') || null,
    fields: take('fieldCollectionDefinition') || null,
    unsupported: [],
    extra: {},
  };
  for (const [k, v] of Object.entries(em)) {
    if (UNSUPPORTED_KEYS.has(k)) L.unsupported.push(k);
    if (!used.has(k)) L.extra[k] = v;
  }
  // 删除 undefined，JSON 更小
  const prune = (o) => { for (const k of Object.keys(o)) { if (o[k] === undefined) delete o[k]; else if (o[k] && typeof o[k] === 'object' && !Array.isArray(o[k]) && k !== 'extra' && k !== 'primitiveRaw' && k !== 'spawnShape' && k !== 'children' && k !== 'fields' && k !== 'palette' && k !== 'alphaErosion' && k !== 'softParticle' && k !== 'params') prune(o[k]); } };
  prune(L);
  return L;
}

const SYS_KEYS = new Set(['__type', 'particleName', 'particlePath', 'complexEmitterDefinitionData', 'simpleEmitterDefinitionData',
  'flags', 'visibilityRadius', 'transform', 'soundOnCreateDefault', 'soundPersistentDefault', 'buildUpTime',
  'scaleDynamicallyWithAttachedBone', 'overrideScaleCap', 'drawingLayer']);

function convertSystem(key, sys, file, cls, sha256) {
  const layers = [];
  (sys.complexEmitterDefinitionData || []).forEach((em, i) => layers.push(mapEmitter(em, i, 'complex')));
  const n = layers.length;
  (sys.simpleEmitterDefinitionData || []).forEach((em, i) => layers.push(mapEmitter(em, n + i, 'simple')));
  const extra = {};
  for (const [k, v] of Object.entries(sys)) if (!SYS_KEYS.has(k)) extra[k] = v;
  const def = {
    schema: SCHEMA_VERSION,
    id: key.split('/').pop(),
    category: cls.category,
    source: { file, key, particleName: sys.particleName, particlePath: sys.particlePath, sha256, patch: '14.14' },
    gameRefs: cls.gameRefs,
    flags: sys.flags,
    visibilityRadius: sys.visibilityRadius,
    transform: sys.transform || null,
    soundOnCreate: sys.soundOnCreateDefault || null,
    soundPersistent: sys.soundPersistentDefault || null,
    buildUpTime: sys.buildUpTime,
    scaleDynamicallyWithAttachedBone: sys.scaleDynamicallyWithAttachedBone,
    overrideScaleCap: sys.overrideScaleCap,
    drawingLayer: sys.drawingLayer,
    layers,
    extra,
  };
  for (const k of Object.keys(def)) if (def[k] === undefined) delete def[k];
  return def;
}

/** 收集 SpellObject 里引用到的系统名（字符串值等于系统 id 或 particleName） */
function collectSpellRefs(bin, idSet) {
  const refs = new Map();
  const walk = (o, path, spell) => {
    if (typeof o === 'string') {
      const id = o.split('/').pop();
      if (idSet.has(id)) {
        if (!refs.has(id)) refs.set(id, []);
        refs.get(id).push({ spell, field: path });
      }
      return;
    }
    if (Array.isArray(o)) { o.forEach((x, i) => walk(x, `${path}[${i}]`, spell)); return; }
    if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) walk(v, path ? `${path}.${k}` : k, spell);
  };
  for (const [k, v] of Object.entries(bin)) {
    if (!v || v.__type !== 'SpellObject') continue;
    walk(v, '', v.mScriptName || k);
  }
  return refs;
}

/**
 * @param {{map33: object, jinx?: object, reksai?: object, files: {map33:string, jinx?:string, reksai?:string}, sha256: (s:string)=>string}} input
 */
function convertAll(input) {
  const out = { fountain: [], weapons: [], jinx: [], enemy: [], reksai: [] };
  const push = (def) => {
    const bucket = def.category === 'weapon' ? 'weapons' : def.category;
    (out[bucket] = out[bucket] || []).push(def);
  };
  const isSys = (v) => v && v.__type === 'VfxSystemDefinitionData';
  for (const [k, v] of Object.entries(input.map33)) {
    if (!isSys(v)) continue;
    const cls = classifyMap33(k);
    if (!cls) continue;
    push(convertSystem(k, v, input.files.map33, cls, input.sha256(JSON.stringify(v))));
  }
  if (input.jinx) for (const [k, v] of Object.entries(input.jinx)) {
    if (!isSys(v)) continue;
    push(convertSystem(k, v, input.files.jinx, { category: 'jinx', gameRefs: { hero: 'jinx' } }, input.sha256(JSON.stringify(v))));
  }
  if (input.reksai) for (const [k, v] of Object.entries(input.reksai)) {
    if (!isSys(v)) continue;
    push(convertSystem(k, v, input.files.reksai, { category: 'reksai', gameRefs: { boss: 'reksai' } }, input.sha256(JSON.stringify(v))));
  }
  // SpellObject 引用（只在 map33 里找，角色 bin 的技能引用由角色动画图驱动）
  const ids = new Set();
  for (const list of Object.values(out)) for (const d of list) ids.add(d.id);
  const refs = collectSpellRefs(input.map33, ids);
  for (const list of Object.values(out)) for (const d of list) if (refs.has(d.id)) d.usedBySpells = refs.get(d.id);
  for (const list of Object.values(out)) list.sort((a, b) => a.id.localeCompare(b.id));
  const index = {
    schema: SCHEMA_VERSION,
    generatedBy: 'tools/bab/extract_vfx_14_14.cjs (Quick AI BAB-Q01)',
    patch: '14.14',
    files: input.files,
    counts: Object.fromEntries(Object.entries(out).map(([k, v]) => [k, { systems: v.length, layers: v.reduce((s, d) => s + d.layers.length, 0) }])),
  };
  return { out, index };
}

// ───────────── CLI ─────────────
function main(argv) {
  const fs = require('fs');
  const path = require('path');
  const crypto = require('crypto');
  const arg = (name) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : undefined; };
  const map33 = arg('map33');
  const outDir = arg('out');
  if (!map33 || !outDir) {
    console.error('用法：node tools/bab/extract_vfx_14_14.cjs --map33 <map33.bin.json> [--jinx <skin0.bin.json>] [--reksai <skin0.bin.json>] --out <dir>');
    process.exit(2);
  }
  const read = (p) => (p ? JSON.parse(fs.readFileSync(p, 'utf8')) : undefined);
  const sha256 = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
  const files = { map33: 'ref/14.14/data/maps/shipping/map33/map33.bin.json' };
  if (arg('jinx')) files.jinx = 'ref/14.14/data/characters/strawberry_jinx/skins/skin0.bin.json';
  if (arg('reksai')) files.reksai = 'ref/14.14/data/characters/strawberry_boss_reksai/skins/skin0.bin.json';
  const { out, index } = convertAll({ map33: read(map33), jinx: read(arg('jinx')), reksai: read(arg('reksai')), files, sha256 });
  fs.mkdirSync(outDir, { recursive: true });
  for (const [k, v] of Object.entries(out)) fs.writeFileSync(path.join(outDir, `${k}.json`), JSON.stringify(v, null, 1));
  fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(index, null, 1));
  console.log(JSON.stringify(index.counts));
}

if (typeof module !== 'undefined' && module.exports) module.exports = { convertAll, convertSystem, classifyMap33, curve, SCHEMA_VERSION, WEAPONS };
if (typeof globalThis !== 'undefined') globalThis.__babExtract = { convertAll, convertSystem, classifyMap33, curve, SCHEMA_VERSION, WEAPONS };
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) main(process.argv.slice(2));
