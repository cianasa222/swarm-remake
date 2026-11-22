import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, quantize, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';

const SRC_DIR = 'c:/七星/游戏/tideline/_assets_raw_backup';
const DST_DIR = 'c:/七星/游戏/tideline/tideline/public/assets';
const MAT_JSON = 'c:/七星/游戏/tideline/tideline/src/sim/map1_materials.json';

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const fmtMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2);

async function main() {
  if (!fs.existsSync(SRC_DIR)) {
    throw new Error(`Raw backup directory missing: ${SRC_DIR}`);
  }

  await MeshoptEncoder.ready;

  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'meshopt.encoder': MeshoptEncoder,
    });

  const files = walk(SRC_DIR);
  const glbs = [];
  const pngs = [];
  const jsons = [];
  const others = [];

  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    if (ext === '.glb') glbs.push(f);
    else if (ext === '.png') pngs.push(f);
    else if (ext === '.json') jsons.push(f);
    else others.push(f);
  }

  // Clean stale .png files in DST_DIR before writing compressed assets
  if (fs.existsSync(DST_DIR)) {
    for (const f of walk(DST_DIR)) {
      if (f.toLowerCase().endsWith('.png')) {
        fs.unlinkSync(f);
      }
    }
  }

  let totalBefore = 0;
  let totalAfter = 0;
  let glbBefore = 0;
  let glbAfter = 0;
  let texBefore = 0;
  let texAfter = 0;
  let jsonBefore = 0;
  let jsonAfter = 0;
  let maxFile = { rel: '', bytes: 0 };

  console.log('\n=== 1. GLB Compression (dedup + quantize [excl TEXCOORD_1] + meshopt) ===');
  for (const srcPath of glbs) {
    const rel = path.relative(SRC_DIR, srcPath).replace(/\\/g, '/');
    const dstPath = path.join(DST_DIR, rel);
    fs.mkdirSync(path.dirname(dstPath), { recursive: true });

    const beforeBytes = fs.statSync(srcPath).size;
    totalBefore += beforeBytes;
    glbBefore += beforeBytes;

    const doc = await io.read(srcPath);
    const root = doc.getRoot();
    const meshCount = root.listMeshes().length;
    const matCount = root.listMaterials().length;
    const animBefore = root.listAnimations().length;

    await doc.transform(
      dedup(),
      quantize({
        quantizePosition: 14,
        quantizeNormal: 10,
        quantizeTexcoord: 12,
        pattern: /^(?!TEXCOORD_1$).*$/,
      }),
      meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
    );

    const animAfter = doc.getRoot().listAnimations().length;
    if (animBefore !== animAfter) {
      throw new Error(`Animation count changed for ${rel}: ${animBefore} -> ${animAfter}`);
    }

    await io.write(dstPath, doc);
    const afterBytes = fs.statSync(dstPath).size;
    totalAfter += afterBytes;
    glbAfter += afterBytes;
    if (afterBytes > maxFile.bytes) maxFile = { rel, bytes: afterBytes };

    const pct = (((beforeBytes - afterBytes) / beforeBytes) * 100).toFixed(1);
    console.log(
      `${rel.padEnd(36)} | meshes:${String(meshCount).padStart(4)} mats:${String(matCount).padStart(3)} anims:${String(animAfter).padStart(2)} | ${fmtMB(beforeBytes)} MB -> ${fmtMB(afterBytes)} MB (-${pct}%)`,
    );
  }

  console.log('\n=== 2. PNG -> WebP Compression ===');
  let pngCount = 0;
  const CONCURRENCY = 8;
  for (let i = 0; i < pngs.length; i += CONCURRENCY) {
    const batch = pngs.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (srcPath) => {
        const relPng = path.relative(SRC_DIR, srcPath).replace(/\\/g, '/');
        const relWebp = relPng.replace(/\.png$/i, '.webp');
        const dstPath = path.join(DST_DIR, relWebp);
        fs.mkdirSync(path.dirname(dstPath), { recursive: true });

        const beforeBytes = fs.statSync(srcPath).size;
        totalBefore += beforeBytes;
        texBefore += beforeBytes;

        let webpOpts;
        if (relPng.startsWith('map1/lightmaps/')) {
          webpOpts = { quality: 92, effort: 5 };
        } else if (/\/(vfx|ui|icons)\//.test('/' + relPng)) {
          webpOpts = { quality: 90, alphaQuality: 95, effort: 5 };
        } else {
          webpOpts = { quality: 84, alphaQuality: 92, effort: 5 };
        }

        await sharp(srcPath).webp(webpOpts).toFile(dstPath);
        const afterBytes = fs.statSync(dstPath).size;
        totalAfter += afterBytes;
        texAfter += afterBytes;
        pngCount++;
        if (afterBytes > maxFile.bytes) maxFile = { rel: relWebp, bytes: afterBytes };
      }),
    );
  }
  console.log(`Converted ${pngCount} PNGs -> WebP: ${fmtMB(texBefore)} MB -> ${fmtMB(texAfter)} MB (-${(((texBefore - texAfter) / texBefore) * 100).toFixed(1)}%)`);

  console.log('\n=== 3. JSON & Other Files ===');
  for (const srcPath of jsons) {
    const rel = path.relative(SRC_DIR, srcPath).replace(/\\/g, '/');
    const dstPath = path.join(DST_DIR, rel);
    fs.mkdirSync(path.dirname(dstPath), { recursive: true });
    const beforeBytes = fs.statSync(srcPath).size;
    const raw = fs.readFileSync(srcPath, 'utf8');
    const minified = JSON.stringify(JSON.parse(raw));
    fs.writeFileSync(dstPath, minified, 'utf8');
    const afterBytes = fs.statSync(dstPath).size;
    totalBefore += beforeBytes;
    totalAfter += afterBytes;
    jsonBefore += beforeBytes;
    jsonAfter += afterBytes;
    if (afterBytes > maxFile.bytes) maxFile = { rel, bytes: afterBytes };
  }
  for (const srcPath of others) {
    const rel = path.relative(SRC_DIR, srcPath).replace(/\\/g, '/');
    const dstPath = path.join(DST_DIR, rel);
    fs.mkdirSync(path.dirname(dstPath), { recursive: true });
    fs.copyFileSync(srcPath, dstPath);
    const sz = fs.statSync(dstPath).size;
    totalBefore += sz;
    totalAfter += sz;
    if (sz > maxFile.bytes) maxFile = { rel, bytes: sz };
  }
  console.log(`JSON (${jsons.length} files): ${fmtMB(jsonBefore)} MB -> ${fmtMB(jsonAfter)} MB`);

  // Update src/sim/map1_materials.json .png -> .webp
  if (fs.existsSync(MAT_JSON)) {
    const matRaw = fs.readFileSync(MAT_JSON, 'utf8');
    const matUpdated = matRaw.replace(/\.png"/g, '.webp"');
    fs.writeFileSync(MAT_JSON, matUpdated, 'utf8');
    console.log(`Updated ${MAT_JSON} (.png -> .webp)`);
  }

  console.log('\n=== SUMMARY ===');
  console.log(`GLB (${glbs.length}):      ${fmtMB(glbBefore)} MB -> ${fmtMB(glbAfter)} MB (-${(((glbBefore - glbAfter) / glbBefore) * 100).toFixed(1)}%)`);
  console.log(`Textures (${pngCount}): ${fmtMB(texBefore)} MB -> ${fmtMB(texAfter)} MB (-${(((texBefore - texAfter) / texBefore) * 100).toFixed(1)}%)`);
  console.log(`JSON (${jsons.length}):     ${fmtMB(jsonBefore)} MB -> ${fmtMB(jsonAfter)} MB`);
  console.log(`TOTAL:        ${fmtMB(totalBefore)} MB -> ${fmtMB(totalAfter)} MB (-${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1)}%)`);
  console.log(`Largest file: ${maxFile.rel} (${fmtMB(maxFile.bytes)} MB)`);

  if (maxFile.bytes >= 25 * 1024 * 1024) {
    throw new Error(`Largest file ${maxFile.rel} exceeds 25 MiB Cloudflare Pages limit!`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
