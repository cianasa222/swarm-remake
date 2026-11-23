/**
 * BAB-01 · B4：把 Patch 14.14 原版 VFX（VfxSystemDefinitionData）转换成引擎无关的 EffectDef JSON。
 * 结构定义见 src/render-babylon/vfx/effect_def.ts（SCHEMA_VERSION 必须一致）。
 *
 * 原作者：Quick AI（AWS Quick）2026-11-23（BAB-Q01）。
 * 修订：Gemini（GM-02）2026-11-23 — 修复 GPT-13 验收缺陷 Q01-01（回旋刃 3 个进化系统）与 Q01-02（补给箱、掉落拾取、精英光环、玩家核心反馈），无第三方依赖，Node ≥ 18。
 *
 * 用法（原版 bin.json 不进公开仓库，从 Cloudflare KV `ref/14.14/` 或本机解包目录取）：
 *   node tools/bab/extract_vfx_14_14.cjs \
 *     --map33  <map33.bin.json> \
 *     --jinx   <strawberry_jinx/skins/skin0.bin.json> \
 *     --reksai <strawberry_boss_reksai/skins/skin0.bin.json> \
 *     --out    src/render-babylon/vfx/data/14.14
 *
 * 输出：fountain.json / weapons.json / jinx.json / enemy.json / reksai.json / map.json / index.json
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
  // Q01-02：补齐 Strawberry_Elite_Glow / Strawberry_Elite_Zone_Glow（原正则仅匹配 Elite_Missile）
  if (/^EliteSpell_|^Strawberry_Elite_|Elite_Missile|Strawberry_Enemy_|PoisonZone/i.test(last)) {
    const isElite = /Elite/i.test(last);
    return { category: 'enemy', gameRefs: isElite ? { enemy: true, elite: true } : { enemy: true } };
  }
  if (/ItemToBuy/i.test(last)) return null; // 商店展示用，不是战斗特效
  if (/\/Particles\/Weapons\//.test(key) || /^Augment_/i.test(last)) {
    for (const w of WEAPONS) {
      // Q01-01：允许词尾紧接 Evolve（如 Strawberry_Weapon_BoomerangEvolve_Missile / _Return / _Mini_Missile）
      const re = new RegExp(`(^|_)${w.riot}(Evolve)?(_|$)`, 'i');
      if (re.test(last) || (w.riot === 'StarStrike' && /Starstrike/i.test(last))) {
        return { category: 'weapon', gameRefs: { weapon: w.weapon, riot: w.riot } };
      }
    }
    return null; // 第一关没有实装的其他武器（Nuke、ScatterArrows、Tibbers…）不导出
  }
  // Q01-02：当前第一关已实装玩法对应的补给箱、掉落拾取与核心玩家反馈（对照 src/sim/game.ts 事件）
  if (/^Strawberry_Destructible_MetalBox_(Idle_01|Explosion|Spawn)$/i.test(last)) {
    return {
      category: 'map',
      gameRefs: {
        destructible: 'metalbox',
        simEvent: /Explosion/i.test(last) ? 'boxBreak' : (/Spawn/i.test(last) ? 'boxSpawn' : 'boxIdle'),
      },
    };
  }
  if (/^Strawberry_Drop_XP(_|$)/i.test(last)) {
    return {
      category: 'map',
      gameRefs: {
        pickup: 'xp',
        simEvent: /Pickup/i.test(last) ? 'pickup' : (/Missile/i.test(last) ? 'dropMissile' : 'dropIdle'),
      },
    };
  }
  if (/^Strawberry_(Rebuild_Drop_Health|Drop_Health_Heal)(_|$)/i.test(last)) {
    return {
      category: 'map',
      gameRefs: {
        pickup: 'heal',
        simEvent: /_Heal$/i.test(last) ? 'pickup' : (/Missile/i.test(last) ? 'dropMissile' : 'dropIdle'),
      },
    };
  }
  if (/^Strawberry_(AnimaSquad_Card|Drop_Card_Pickup)$/i.test(last)) {
    return {
      category: 'map',
      gameRefs: {
        pickup: 'card',
        inGame: !/AnimaSquad_Card/i.test(last), // Unverified original effect: do not auto-bind
        simEvent: /Pickup/i.test(last) ? 'pickup' : 'dropIdle',
      },
    };
  }
  if (/^Strawberry_Rebuild_Drop_Gold(_|$)/i.test(last)) {
    return {
      category: 'map',
      gameRefs: {
        pickup: 'gold',
        inGame: false, // No gold events exist in the current simulation
        simEvent: /Pickup/i.test(last) ? 'pickup' : (/Missile/i.test(last) ? 'dropMissile' : 'dropIdle'),
      },
    };
  }
  // QC-19: confirmed in 14.14 BIN, but event/UI assignment unverified
  if (/^Strawberry_(MiniBoss_HealthBar|MapBoss_Healthbar|MapBoss_Enraged)$/i.test(last))
    return { category: 'map', gameRefs: { ui: /MiniBoss/i.test(last) ? 'eliteHealth' : /Enraged/i.test(last) ? 'bossEnraged' : 'bossHealth', binding: 'name', inGame: false } };
  if (/^Strawberry_Spawner_SpawnVFX(_Eye)?$/i.test(last))
    return { category: 'enemy', gameRefs: { enemy: true, role: /_Eye$/i.test(last) ? 'spawnEye' : 'spawn', binding: 'name', inGame: false } };
  if (/^Strawberry_Player_Hit$/i.test(last)) {
    return { category: 'map', gameRefs: { player: 'hurt', simEvent: 'playerHurt' } };
  }
  if (/^Strawberry_AugmentSelection_InWorld_Ceremony$/i.test(last)) {
    return { category: 'map', gameRefs: { player: 'levelUp', simEvent: 'levelUp' } };
  }
  if (/^Strawberry_Rebuild_TargeterOrientation(_Manual)?$/i.test(last)) {
    return { category: 'map', gameRefs: { player: 'aim', simEvent: 'aimRing' } };
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

const UNSUPPORTED_KEYS = new Set([
  'distortionDefinition', 'reflectionDefinition', 'fieldCollectionDefinition', 'FlexShapeDefinition',
  'FlexInstanceScale', 'flexBirthUVOffset', 'flexScaleBirthScale', 'flexParticleLifetime',
  'paletteDefinition', 'colorLookUpTypeX', 'colorLookUpTypeY', 'colorLookUpScales', 'colorLookUpOffsets',
  'alphaErosionDefinition', 'softParticleParams', 'stencilMode', 'stencilRef', 'useNavmeshMask',
  'censorModulateValue', 'sliceTechniqueRange', 'materialOverrideDefinitions', 'rateByVelocityFunction',
  'uvParallaxScale', 'falloffTexture', 'Filtering', 'childParticleSetDefinition', 'doesCastShadow',
]);

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
  const prune = (o) => {
    for (const k of Object.keys(o)) {
      if (o[k] === undefined) delete o[k];
      else if (
        o[k] && typeof o[k] === 'object' && !Array.isArray(o[k]) &&
        k !== 'extra' && k !== 'primitiveRaw' && k !== 'spawnShape' &&
        k !== 'children' && k !== 'fields' && k !== 'palette' &&
        k !== 'alphaErosion' && k !== 'softParticle' && k !== 'params'
      ) prune(o[k]);
    }
  };
  prune(L);
  return L;
}

const SYS_KEYS = new Set([
  '__type', 'particleName', 'particlePath', 'complexEmitterDefinitionData', 'simpleEmitterDefinitionData',
  'flags', 'visibilityRadius', 'transform', 'soundOnCreateDefault', 'soundPersistentDefault', 'buildUpTime',
  'scaleDynamicallyWithAttachedBone', 'overrideScaleCap', 'drawingLayer',
]);

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

function collectSpellRefs(bin, idSet) {
  const refs = new Map();
  const resolve = new Map();
  for (const x of Object.values(bin))
    if (x && x.__type === 'ResourceResolver' && x.resourceMap)
      for (const [k, v] of Object.entries(x.resourceMap))
        if (typeof v === 'string') resolve.set(k, v.split('/').pop());
  const walk = (o, path, spell) => {
    if (typeof o === 'string') {
      const id = resolve.get(o) || o.split('/').pop();
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

function convertAll(input) {
  const out = { fountain: [], weapons: [], jinx: [], enemy: [], reksai: [], map: [] };
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
  const ids = new Set();
  for (const list of Object.values(out)) for (const d of list) ids.add(d.id);
  const refs = collectSpellRefs(input.map33, ids);
  for (const list of Object.values(out)) for (const d of list) if (refs.has(d.id)) d.usedBySpells = refs.get(d.id);
  for (const list of Object.values(out)) list.sort((a, b) => a.id.localeCompare(b.id));
  const index = {
    schema: SCHEMA_VERSION,
    generatedBy: 'tools/bab/extract_vfx_14_14.cjs (Quick AI BAB-Q01 + Gemini GM-02/03 + GPT-16 QC-19 fixes)',
    patch: '14.14',
    files: input.files,
    counts: Object.fromEntries(Object.entries(out).map(([k, v]) => [k, { systems: v.length, layers: v.reduce((s, d) => s + d.layers.length, 0) }])),
  };
  return { out, index };
}

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

if (typeof module !== 'undefined' && module.exports) module.exports = { convertAll, convertSystem, classifyMap33, collectSpellRefs, curve, SCHEMA_VERSION, WEAPONS };
if (typeof globalThis !== 'undefined') globalThis.__babExtract = { convertAll, convertSystem, classifyMap33, curve, SCHEMA_VERSION, WEAPONS };
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) main(process.argv.slice(2));
