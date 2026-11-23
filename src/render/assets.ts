import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export interface ScbJson {
  pos: number[];
  uv: number[];
  alpha?: number[];
}

export interface TextureOpts {
  flipY?: boolean;
  repeat?: boolean;
  channel?: number;
  anisotropy?: number;
  srgb?: boolean;
  unique?: boolean;
}

export interface AssetStats {
  assetBase: string;
  networkFetches: number;
  cacheHits: number;
  glbCount: number;
  imageCount: number;
  jsonCount: number;
  stage1Done: boolean;
  stage2Done: boolean;
  warmupMs: number;
}

// Vite injects import.meta.env in the browser; raw Node regression tests do not.
const rawBase = (import.meta.env?.VITE_ASSET_BASE_URL as string | undefined)?.trim() || '.';
const ASSET_BASE = rawBase.replace(/\/+$/, '');

export function hasCustomAssetBase(): boolean {
  return ASSET_BASE !== '.';
}

export function assetUrl(relPath: string): string {
  let clean = relPath.trim().replace(/^\.\//, '');
  if (clean.startsWith('/')) clean = clean.slice(1);
  if (!clean.startsWith('assets/')) clean = `assets/${clean}`;
  if (/\.png(\?.*)?$/i.test(clean)) {
    clean = clean.replace(/\.png(\?.*)?$/i, '.webp$1');
  }
  return `${ASSET_BASE}/${clean}`;
}

const gltfLoader = new GLTFLoader();
gltfLoader.setCrossOrigin('anonymous');
gltfLoader.setMeshoptDecoder(MeshoptDecoder as never);

const glbCache = new Map<string, Promise<GLTF>>();
const imageCache = new Map<string, Promise<HTMLImageElement>>();
const uiIconPromiseCache = new Map<string, Promise<string>>();
const uiIconUrlMap = new Map<string, string>();
const texCache = new Map<string, THREE.Texture>();
const spriteCache = new Map<string, THREE.CanvasTexture>();
const jsonCache = new Map<string, Promise<ScbJson>>();
const scbGeoCache = new Map<string, Promise<THREE.BufferGeometry>>();

let networkFetches = 0;
let cacheHits = 0;
let stage1Done = false;
let stage2Done = false;
let warmupMs = 0;
let stage1Promise: Promise<void> | null = null;
let stage2Promise: Promise<void> | null = null;

export function setWarmupMs(ms: number) {
  warmupMs = Math.round(ms);
}

export function getAssetStats(): AssetStats {
  return {
    assetBase: ASSET_BASE,
    networkFetches,
    cacheHits,
    glbCount: glbCache.size,
    imageCount: imageCache.size,
    jsonCount: jsonCache.size,
    stage1Done,
    stage2Done,
    warmupMs,
  };
}

export function loadGLB(relPath: string): Promise<GLTF> {
  const url = assetUrl(relPath);
  const existing = glbCache.get(url);
  if (existing) {
    cacheHits++;
    return existing;
  }
  networkFetches++;
  const p = (async () => {
    await MeshoptDecoder.ready;
    return await new Promise<GLTF>((resolve, reject) => {
      gltfLoader.load(url, resolve, undefined, reject);
    });
  })().catch((err) => {
    glbCache.delete(url);
    throw err;
  });
  glbCache.set(url, p);
  return p;
}

export function loadImage(relPath: string): Promise<HTMLImageElement> {
  const url = assetUrl(relPath);
  const existing = imageCache.get(url);
  if (existing) {
    cacheHits++;
    return existing;
  }
  networkFetches++;
  const p = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    if (ASSET_BASE !== '.') img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image: ${url} (${String(e)})`));
    img.src = url;
  }).catch((err) => {
    imageCache.delete(url);
    throw err;
  });
  imageCache.set(url, p);
  return p;
}

export function preloadUiIcon(relPath: string): Promise<string> {
  const url = assetUrl(relPath);
  const existing = uiIconPromiseCache.get(url);
  if (existing) {
    cacheHits++;
    return existing;
  }
  // If an existing <img> in DOM already loaded this same-origin asset, snapshot it without a 2nd HTTP request
  const domImg = document.querySelector<HTMLImageElement>(`img[src="${url}"], img[src="./${url.replace(/^\.\//, '')}"]`);
  if (domImg && ASSET_BASE === '.') {
    const p = new Promise<string>((resolve) => {
      const capture = () => {
        try {
          const cv = document.createElement('canvas');
          cv.width = domImg.naturalWidth || 64;
          cv.height = domImg.naturalHeight || 64;
          cv.getContext('2d')?.drawImage(domImg, 0, 0);
          const dataUrl = cv.toDataURL('image/webp', 0.92);
          uiIconUrlMap.set(url, dataUrl);
          resolve(dataUrl);
        } catch {
          resolve(url);
        }
      };
      if (domImg.complete && domImg.naturalWidth > 0) capture();
      else {
        domImg.addEventListener('load', capture, { once: true });
        domImg.addEventListener('error', () => resolve(url), { once: true });
      }
    });
    cacheHits++;
    uiIconPromiseCache.set(url, p);
    return p;
  }
  networkFetches++;
  const p = fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
      return r.blob();
    })
    .then((blob) => {
      const objUrl = URL.createObjectURL(blob);
      uiIconUrlMap.set(url, objUrl);
      return objUrl;
    })
    .catch((err) => {
      uiIconPromiseCache.delete(url);
      throw err;
    });
  uiIconPromiseCache.set(url, p);
  return p;
}

export function uiIconUrl(relPath: string): string {
  const url = assetUrl(relPath);
  return uiIconUrlMap.get(url) ?? url;
}

function applyTexOpts(tex: THREE.Texture, opts: TextureOpts) {
  const flipY = opts.flipY ?? true;
  const repeat = opts.repeat ?? false;
  const channel = opts.channel ?? 0;
  const anisotropy = opts.anisotropy ?? 1;
  const srgb = opts.srgb ?? true;

  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.flipY = flipY;
  tex.channel = channel;
  tex.anisotropy = anisotropy;
  tex.wrapS = repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  tex.wrapT = repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
}

export function getTexture(relPath: string, opts: TextureOpts = {}): THREE.Texture {
  const url = assetUrl(relPath);
  const flipY = opts.flipY ?? true;
  const repeat = opts.repeat ?? false;
  const channel = opts.channel ?? 0;
  const anisotropy = opts.anisotropy ?? 1;
  const srgb = opts.srgb ?? true;

  if (!opts.unique) {
    const key = `${url}|${flipY ? 1 : 0}|${repeat ? 1 : 0}|${channel}|${anisotropy}|${srgb ? 1 : 0}`;
    const existing = texCache.get(key);
    if (existing) {
      cacheHits++;
      return existing;
    }
    const tex = new THREE.Texture();
    applyTexOpts(tex, opts);
    texCache.set(key, tex);
    loadImage(relPath)
      .then((img) => {
        tex.image = img;
        tex.needsUpdate = true;
      })
      .catch((err) => {
        texCache.delete(key);
        console.warn('[assets] tex load failed:', url, err);
      });
    return tex;
  }

  const tex = new THREE.Texture();
  applyTexOpts(tex, opts);
  loadImage(relPath)
    .then((img) => {
      tex.image = img;
      tex.needsUpdate = true;
    })
    .catch((err) => console.warn('[assets] tex load failed:', url, err));
  return tex;
}

export async function preloadTexture(relPath: string, opts: TextureOpts = {}): Promise<THREE.Texture> {
  const tex = getTexture(relPath, opts);
  await loadImage(relPath);
  return tex;
}

/**
 * Three.js PointsMaterial ignores Texture.repeat/offset; crop sprite-sheet cells
 * into a fixed-size CanvasTexture (never mutating canvas.width/height inside onload).
 */
export function loadSpriteCell(
  relPath: string,
  col: number,
  row: number,
  cols: number,
  rows: number,
  opts: { size?: number; glow?: boolean } = {},
): THREE.CanvasTexture {
  const size = opts.size ?? 256;
  const glow = opts.glow ?? false;
  const url = assetUrl(relPath);
  const key = `${url}|${col}|${row}|${cols}|${rows}|${size}|${glow ? 1 : 0}`;
  const existing = spriteCache.get(key);
  if (existing) {
    cacheHits++;
    return existing;
  }

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = true;
  spriteCache.set(key, tex);

  loadImage(relPath)
    .then((img) => {
      const cw = img.width / cols;
      const ch = img.height / rows;
      ctx.clearRect(0, 0, size, size);
      if (glow) {
        const half = size * 0.5;
        const grad = ctx.createRadialGradient(half, half, size * 0.045, half, half, half * 0.96);
        grad.addColorStop(0, 'rgba(110, 255, 190, 0.55)');
        grad.addColorStop(0.5, 'rgba(30, 255, 140, 0.18)');
        grad.addColorStop(1, 'rgba(0, 255, 120, 0.0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
      }
      ctx.drawImage(img, col * cw, row * ch, cw, ch, 0, 0, size, size);
      tex.needsUpdate = true;
    })
    .catch((err) => console.warn('[assets] sprite cell load failed:', url, err));

  return tex;
}

export function loadScbJson(relPath: string): Promise<ScbJson> {
  const url = assetUrl(relPath);
  const existing = jsonCache.get(url);
  if (existing) {
    cacheHits++;
    return existing;
  }
  networkFetches++;
  const p = fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
      return r.json() as Promise<ScbJson>;
    })
    .catch((err) => {
      jsonCache.delete(url);
      throw err;
    });
  jsonCache.set(url, p);
  return p;
}

export function buildScbGeo(d: ScbJson, withAlpha = false): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(d.pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(d.uv, 2));
  if (withAlpha) {
    const vertCount = d.pos.length / 3;
    const alphas = d.alpha && d.alpha.length === vertCount ? d.alpha : new Float32Array(vertCount).fill(1);
    geo.setAttribute('aAlpha', new THREE.Float32BufferAttribute(alphas, 1));
  }
  geo.computeVertexNormals();
  return geo;
}

export function loadScbGeo(relPath: string, withAlpha = false): Promise<THREE.BufferGeometry> {
  const url = assetUrl(relPath);
  const key = `${url}|${withAlpha ? 1 : 0}`;
  const existing = scbGeoCache.get(key);
  if (existing) {
    cacheHits++;
    return existing;
  }
  const p = loadScbJson(relPath)
    .then((d) => buildScbGeo(d, withAlpha))
    .catch((err) => {
      scbGeoCache.delete(key);
      throw err;
    });
  scbGeoCache.set(key, p);
  return p;
}

async function runPool<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<unknown>,
  onStep?: (done: number, total: number) => void,
) {
  let idx = 0;
  let done = 0;
  const total = items.length;
  const workers = Array.from({ length: Math.min(concurrency, total) }, async () => {
    while (idx < total) {
      const cur = idx++;
      try {
        await worker(items[cur]);
      } catch (err) {
        console.warn('[assets] preload item failed:', items[cur], err);
      } finally {
        done++;
        onStep?.(done, total);
      }
    }
  });
  await Promise.all(workers);
}

const STAGE1_GLBS = [
  'map1/warehouse_map1.glb',
  'heroes/jinx/strawberry_jinx.glb',
  'map1/props/metalbox.glb',
  'enemies/enemy_pix.glb',
  'enemies/enemy_ghoul.glb',
];

const STAGE1_IMAGES = [
  'heroes/jinx/body.webp',
  'heroes/jinx/weapon.webp',
  'map1/props/metalbox.webp',
  'map1/vfx/box_glow.webp',
  'enemies/enemy_pix.webp',
  'enemies/enemy_ghoul.webp',
  ...Array.from({ length: 22 }, (_, i) => `map1/lightmaps/${i}.webp`),
  'heroes/jinx/vfx/props_tx.webp',
  'heroes/jinx/vfx/project_bolts.webp',
  'heroes/jinx/vfx/muzzle_flash.webp',
  'heroes/jinx/vfx/aura_self.webp',
  'heroes/jinx/vfx/passive_ring.webp',
  'heroes/jinx/vfx/cat_logo.webp',
  'map1/vfx/hex_plus.webp',
  'map1/vfx/lilstar.webp',
  'map1/vfx/base_timer_mult_05.webp',
  'map1/vfx/base_timer_mult_06.webp',
  'map1/vfx/base_timer_mult_07.webp',
  'map1/vfx/base_timer_mult_08.webp',
  'map1/vfx/base_timer_mult_09.webp',
  'map1/vfx/healingstation_scan_lines.webp',
  'map1/vfx/healingstation_glow_hardedge.webp',
  'map1/vfx/healingstation_base_glowstar_02.webp',
  'map1/vfx/healingstation_pointstaradd.webp',
  'map1/vfx/healingstation_circle_mis.webp',
  'map1/vfx/healingstation_meshmult.webp',
  'map1/vfx/healingstation_shockwave_trail.webp',
  'map1/vfx/healingstation_trail_silk_01.webp',
  'map1/vfx/healingstation__infernal_smoke_trail.webp',
  'map1/vfx/music_aura.webp',
];

const STAGE1_SCB = [
  'map1/vfx/fountain_sphere.json',
  'map1/vfx/fountain_baseedge.json',
  'map1/vfx/fountain_wave.json',
  'map1/vfx/fountain_timer.json',
  'map1/vfx/fountain_timer_start.json',
  'map1/vfx/fountain_beam.json',
  'map1/vfx/fountain_nova_flame.json',
  'map1/vfx/fountain_nova_ring.json',
  'map1/vfx/fountain_nova_swirl.json',
  'map1/vfx/fountain_nova_shape.json',
  'map1/vfx/fountain_nova_indicator.json',
  'heroes/jinx/vfx/r_rocket.json',
  'heroes/jinx/vfx/cat_rocket.json',
];

const STAGE2_GLBS = [
  'enemies/enemy_hunter.glb',
  'enemies/enemy_dasher.glb',
  'enemies/miniboss_bruiser.glb',
  'enemies/reksai.glb',
];

const STAGE2_IMAGES = [
  'enemies/enemy_hunter.webp',
  'enemies/enemy_dasher.webp',
  'enemies/miniboss_bruiser.webp',
  'enemies/reksai.webp',
  'heroes/jinx/vfx/r_trail.webp',
  'heroes/jinx/vfx/r_conetexture.webp',
  'heroes/jinx/vfx/r_shape.webp',
  'heroes/jinx/vfx/catpaw.webp',
  'heroes/jinx/vfx/base_glow.webp',
  'heroes/jinx/vfx/base_glow2.webp',
  'heroes/jinx/vfx/gun_hit.webp',
  'heroes/jinx/vfx/rocket_hit.webp',
  'heroes/jinx/vfx/catlogo_outline.webp',
  'heroes/jinx/vfx/q_shapes02.webp',
  'heroes/jinx/vfx/r_shapes01.webp',
  'heroes/jinx/vfx/e_praxis.webp',
  'heroes/jinx/vfx/e_erosion.webp',
  'heroes/jinx/vfx/r_energy.webp',
  'heroes/jinx/vfx/crater_01.webp',
  'heroes/jinx/vfx/r_craterobsi.webp',
  'heroes/jinx/vfx/circle_mis.webp',
  'heroes/jinx/vfx/lilstar_4x2.webp',
  'heroes/jinx/vfx/cat_faces.webp',
  'heroes/jinx/vfx/hit_squares.webp',
  'heroes/jinx/vfx/base_pixel.webp',
  'heroes/jinx/vfx/sand_streaks.webp',
  'heroes/jinx/vfx/r_rocks_2x2.webp',
  'heroes/jinx/vfx/cloud_face_flipbook.webp',
  'heroes/jinx/vfx/particles_1_9.webp',
  'heroes/jinx/vfx/r_ground_smoke02.webp',
  'heroes/jinx/vfx/speed_impact.webp',
  'weapons/vfx/uwu_ball.webp',
  'weapons/vfx/crossbow_bolt.webp',
  'weapons/vfx/boom_mis.webp',
  'weapons/vfx/boom_mis_evo.webp',
  'weapons/vfx/bauble_blade.webp',
  'weapons/vfx/bauble_blade_evo.webp',
  'weapons/vfx/hr_glow.webp',
  'weapons/vfx/hr_noise.webp',
  'weapons/vfx/frost_shield.webp',
  'weapons/vfx/statikk_bolt.webp',
  // Q-30：战兔巨爆原版 StarStrike 14 张贴图（tools/q30/fetch_starstrike_14_14.mjs 生成）
  'weapons/vfx/starstrike/augment_orbitallaser_laser_corehardedge.webp',
  'weapons/vfx/starstrike/aurelionsol_base_cata_sharpedges_gradientmask.webp',
  'weapons/vfx/starstrike/aurelionsol_base_r_groundtrail_color-bellcurve.webp',
  'weapons/vfx/starstrike/base_revive_ground_crack.webp',
  'weapons/vfx/starstrike/belveth_base_basicgradient.webp',
  'weapons/vfx/starstrike/cracks_light.webp',
  'weapons/vfx/starstrike/leona_skin53_lensflare.webp',
  'weapons/vfx/starstrike/strawberry_leona_base_erosionsphere02.webp',
  'weapons/vfx/starstrike/strawberry_leona_skin10_beam_2.webp',
  'weapons/vfx/starstrike/strawberry_poi_mapd_turret_base_smoke_trail.webp',
  'weapons/vfx/starstrike/strawberry_weapon_starstrike_deca_xtarget.webp',
  'weapons/vfx/starstrike/strawberry_weapon_starstrike_decal_outline_perf.webp',
  'weapons/vfx/starstrike/strawberry_weapon_starstrike_decal_perf.webp',
  'weapons/vfx/starstrike/sylas_skin24_shapes01.webp',
  'weapons/vfx/frost_crack.webp',
  'weapons/vfx/frost_tile.webp',
];

const STAGE2_UI_ICONS = [
  'ui/weapons/jinx_meow.webp',
  'ui/weapons/uwu_blaster.webp',
  'ui/weapons/cyclonic.webp',
  'ui/weapons/radiant.webp',
  'ui/weapons/statikk.webp',
  'ui/weapons/crossbow.webp',
  'ui/weapons/boomerang.webp',
  'ui/weapons/bunnymega.webp',
  'ui/weapons/vortex.webp',
  'ui/weapons/iceblast.webp',
  'ui/passives/damage.webp',
  'ui/passives/haste.webp',
  'ui/passives/crit.webp',
  'ui/passives/projectiles.webp',
  'ui/passives/area.webp',
  'ui/passives/duration.webp',
  'ui/passives/maxHp.webp',
  'ui/passives/armor.webp',
  'ui/passives/hpRegen.webp',
  'ui/passives/moveSpeed.webp',
  'ui/passives/pickup.webp',
  'ui/passives/xp.webp',
];

const STAGE2_SCB = [
  'heroes/jinx/vfx/r_conehead.json',
  'heroes/jinx/vfx/passive_swirl.json',
  'heroes/jinx/vfx/r_dome.json',
  'heroes/jinx/vfx/r_swirl.json',
  'heroes/jinx/vfx/r_praxis.json',
  'heroes/jinx/vfx/r_animeburst.json',
  'heroes/jinx/vfx/q_praxis.json',
  'heroes/jinx/vfx/q_animeburst.json',
  'heroes/jinx/vfx/crater.json',
  'heroes/jinx/vfx/r_castring.json',
  'weapons/vfx/hr_outline.json',
  'weapons/vfx/hr_fire.json',
  'weapons/vfx/star_burst.json',
  'weapons/vfx/frost_ring.json',
];

export function preloadStage1(onProgress?: (pct: number, label: string) => void): Promise<void> {
  if (stage1Promise) return stage1Promise;

  const tasks: Array<{ kind: 'glb' | 'img' | 'scb'; path: string }> = [
    ...STAGE1_GLBS.map((path) => ({ kind: 'glb' as const, path })),
    ...STAGE1_IMAGES.map((path) => ({ kind: 'img' as const, path })),
    ...STAGE1_SCB.map((path) => ({ kind: 'scb' as const, path })),
  ];

  onProgress?.(0, '加载仓库区 3D 场景与金克丝模型...');

  stage1Promise = runPool(
    tasks,
    6,
    (item) => {
      if (item.kind === 'glb') return loadGLB(item.path);
      if (item.kind === 'img') return loadImage(item.path);
      return loadScbJson(item.path);
    },
    (done, total) => {
      const pct = Math.min(100, Math.round((done / total) * 100));
      const label =
        pct < 45
          ? '加载仓库区 3D 场景与金克丝模型...'
          : '加载烘焙光照贴图与核心特效...';
      onProgress?.(pct, label);
    },
  ).then(() => {
    stage1Done = true;
    onProgress?.(100, '仓库区核心资源就绪');
  });

  return stage1Promise;
}

export function preloadStage2(onDone?: () => void): Promise<void> {
  if (stage2Promise) return stage2Promise;

  const tasks: Array<{ kind: 'glb' | 'img' | 'ui' | 'scb'; path: string }> = [
    ...STAGE2_GLBS.map((path) => ({ kind: 'glb' as const, path })),
    ...STAGE2_IMAGES.map((path) => ({ kind: 'img' as const, path })),
    ...STAGE2_UI_ICONS.map((path) => ({ kind: 'ui' as const, path })),
    ...STAGE2_SCB.map((path) => ({ kind: 'scb' as const, path })),
  ];

  stage2Promise = runPool(tasks, 4, (item) => {
    if (item.kind === 'glb') return loadGLB(item.path);
    if (item.kind === 'img') return loadImage(item.path);
    if (item.kind === 'ui') return preloadUiIcon(item.path);
    return loadScbJson(item.path);
  }).then(() => {
    stage2Done = true;
    onDone?.();
  });

  return stage2Promise;
}
