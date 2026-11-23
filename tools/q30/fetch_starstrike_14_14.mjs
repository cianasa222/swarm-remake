// Q-30：下载战兔巨爆原版 StarStrike 用到的 14 张贴图（CommunityDragon Patch 14.14），转 webp 放进 public/。
// 用法（项目根目录）：node tools/q30/fetch_starstrike_14_14.mjs
// 需要外网 + devDependencies 里的 sharp。已存在的文件跳过；加 --force 重新下载。
// 版权：Riot Games 资源，与 public/assets/ 里其他运行时资产同样处理（用户 2026-11-22 21:55 决定保留在仓库）。
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'public', 'assets', 'weapons', 'vfx', 'starstrike');
const FORCE = process.argv.includes('--force');

const TEX = {
  "augment_orbitallaser_laser_corehardedge": "https://raw.communitydragon.org/14.14/game/assets/maps/particles/strawberry/augment_orbitallaser_laser_corehardedge.strawberryrebuild.png",
  "aurelionsol_base_cata_sharpedges_gradientmask": "https://raw.communitydragon.org/14.14/game/assets/maps/particles/strawberry/aurelionsol_base_cata_sharpedges_gradientmask.strawberryrebuild.png",
  "aurelionsol_base_r_groundtrail_color-bellcurve": "https://raw.communitydragon.org/14.14/game/assets/maps/particles/strawberry/aurelionsol_base_r_groundtrail_color-bellcurve.strawberryrebuild.png",
  "base_revive_ground_crack": "https://raw.communitydragon.org/14.14/game/assets/maps/particles/strawberry/base_revive_ground_crack.strawberryrebuild.png",
  "belveth_base_basicgradient": "https://raw.communitydragon.org/14.14/game/assets/maps/particles/strawberry/belveth_base_basicgradient.strawberryrebuild.png",
  "cracks_light": "https://raw.communitydragon.org/14.14/game/assets/maps/particles/strawberry/cracks_light.strawberryrebuild.png",
  "leona_skin53_lensflare": "https://raw.communitydragon.org/14.14/game/assets/maps/particles/strawberry/leona_skin53_lensflare.strawberryrebuild.png",
  "strawberry_leona_base_erosionsphere02": "https://raw.communitydragon.org/14.14/game/assets/maps/particles/strawberry/strawberry_leona_base_erosionsphere02.strawberryrebuild.png",
  "strawberry_leona_skin10_beam_2": "https://raw.communitydragon.org/14.14/game/assets/maps/particles/strawberry/strawberry_leona_skin10_beam_2.strawberryrebuild.png",
  "strawberry_poi_mapd_turret_base_smoke_trail": "https://raw.communitydragon.org/14.14/game/assets/maps/particles/strawberry/strawberry_poi_mapd_turret_base_smoke_trail.strawberryrebuild.png",
  "strawberry_weapon_starstrike_deca_xtarget": "https://raw.communitydragon.org/14.14/game/assets/maps/particles/strawberry/strawberry_weapon_starstrike_deca_xtarget.strawberryrebuild.png",
  "strawberry_weapon_starstrike_decal_outline_perf": "https://raw.communitydragon.org/14.14/game/assets/maps/particles/strawberry/strawberry_weapon_starstrike_decal_outline_perf.strawberryrebuild.png",
  "strawberry_weapon_starstrike_decal_perf": "https://raw.communitydragon.org/14.14/game/assets/maps/particles/strawberry/strawberry_weapon_starstrike_decal_perf.strawberryrebuild.png",
  "sylas_skin24_shapes01": "https://raw.communitydragon.org/14.14/game/assets/maps/particles/strawberry/sylas_skin24_shapes01.strawberryrebuild.png"
};

await mkdir(OUT, { recursive: true });
let ok = 0, skip = 0;
const fail = [];
for (const [key, url] of Object.entries(TEX)) {
  const dst = join(OUT, `${key}.webp`);
  if (!FORCE) {
    try { const bytes = await readFile(dst); await sharp(bytes).metadata(); skip++; continue; } catch { /* 不存在或文件损坏，重新下载 */ }
  }
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 8 || !Buffer.from([137,80,78,71,13,10,26,10]).equals(buf.subarray(0, 8))) throw new Error('not a PNG (invalid 8-byte signature)');
    const meta = await sharp(buf).metadata();
    // 保留 alpha；特效贴图对色带敏感，用高质量有损 + alphaQuality 100
    const webp = await sharp(buf).webp({ quality: 90, alphaQuality: 100, effort: 5 }).toBuffer();
    await writeFile(dst, webp);
    console.log(`OK  ${key}  ${meta.width}x${meta.height}  png ${buf.length} → webp ${webp.length}`);
    ok++;
  } catch (e) {
    fail.push(key);
    console.error(`ERR ${key}  ${url}  ${e.message}`);
  }
}
console.log(`done: ${ok} downloaded, ${skip} skipped, ${fail.length} failed`);
if (fail.length) process.exit(1);
