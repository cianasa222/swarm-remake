// Q-30 release gate. Source files are intentionally not shipped before approved conversion.
// Use: node tools/q30/fetch_starstrike_14_14.mjs; node tools/q30/verify_assets.mjs
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const names = [
  'augment_orbitallaser_laser_corehardedge',
  'aurelionsol_base_cata_sharpedges_gradientmask',
  'aurelionsol_base_r_groundtrail_color-bellcurve',
  'base_revive_ground_crack', 'belveth_base_basicgradient', 'cracks_light',
  'leona_skin53_lensflare', 'strawberry_leona_base_erosionsphere02',
  'strawberry_leona_skin10_beam_2', 'strawberry_poi_mapd_turret_base_smoke_trail',
  'strawberry_weapon_starstrike_deca_xtarget',
  'strawberry_weapon_starstrike_decal_outline_perf',
  'strawberry_weapon_starstrike_decal_perf', 'sylas_skin24_shapes01',
];
const failures=[];
for(const k of names){const p=join(root,'public/assets/weapons/vfx/starstrike',k+'.webp');try{const b=await readFile(p);const info=await sharp(b).metadata();if(info.format!=='webp')throw Error('wrong format');}catch(e){failures.push(k+': '+e.message)}}
if(failures.length){console.error('Q-30 missing/invalid original textures: '+failures.length+'/'+names.length);for(const x of failures)console.error(' - '+x);process.exitCode=1;}else console.log('Q-30 original textures: 14/14 present and valid');
