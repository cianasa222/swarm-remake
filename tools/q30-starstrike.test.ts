// Q-30 回归测试（不需要 WebGL）：node --import tsx tools/q30-starstrike.test.ts
import assert from 'node:assert/strict';
import {
  STARSTRIKE_14_14, STARSTRIKE_TEX, TARGET_LEAD,
  sampleCurve, emitTimes, systemDuration, particleLife, rand01, dragDisp, srgbToLinear,
} from '../src/render/starstrike_14_14';

const S = STARSTRIKE_14_14;
const tmp = [0, 0, 0, 0];
const near = (a: number, b: number, eps = 1e-3) => Math.abs(a - b) <= eps;

// 1. 层数与原版一致：4 + 4 + 4 + 9 = 21
assert.equal(S.target.layers.length, 4);
assert.equal(S.targetEvolve.layers.length, 4);
assert.equal(S.targetEvolveMain.layers.length, 4);
assert.equal(S.explosion.layers.length, 9);
assert.equal(S.explosion.id, 'Strawberry_Weapon_StarStrike_Karthus_Explosion');

// 2. 三套落点层结构、贴图、混合一致（共用合批的前提）
for (let i = 0; i < 4; i++) {
  for (const k of ['targetEvolve', 'targetEvolveMain'] as const) {
    assert.equal(S[k].layers[i].tex, S.target.layers[i].tex, `${k}[${i}] tex`);
    assert.equal(S[k].layers[i].blend, S.target.layers[i].blend, `${k}[${i}] blend`);
    assert.equal(S[k].layers[i].prim, S.target.layers[i].prim, `${k}[${i}] prim`);
  }
}

// 3. 每张贴图都有项目路径
for (const sys of Object.values(S)) for (const L of sys.layers) {
  assert.ok(STARSTRIKE_TEX[L.tex], `tex ${L.tex}`);
  if (L.mult) assert.ok(STARSTRIKE_TEX[L.mult.tex], `mult ${L.mult.tex}`);
}
assert.equal(Object.keys(STARSTRIKE_TEX).length, 14);

// 4. 落点时间轴：各层缩放在 0.4 × 寿命归零，最晚 0.44 s = TARGET_LEAD
for (const L of S.target.layers) {
  const s = sampleCurve(L.scale, 0.4, tmp, 3, 1);
  assert.ok(near(s[0], 0), `${L.name} scale@0.4 = ${s[0]}`);
  assert.ok(0.4 * L.life <= TARGET_LEAD + 1e-6, `${L.name} 归零 ${0.4 * L.life}`);
}

// 5. 颜色：GPT-07 / QC-15 复核过的原版值
const bg4 = S.target.layers[2];
assert.deepEqual(bg4.bc.slice(0, 3).map((v) => +v.toFixed(2)), [0.14, 0.86, 0.77]);           // BG4 青色
assert.ok(near(bg4.life, 1.1));
const inner = S.explosion.layers.find((l) => l.name === 'StarS_Ground_Inner')!;
assert.deepEqual(inner.bc.slice(0, 3).map((v) => +v.toFixed(2)), [0.09, 0.92, 0.95]);         // Ground_Inner 青色
assert.ok(near(inner.life, 0.5));
const center = S.explosion.layers.find((l) => l.name === 'StarS_SkyBeam_Center')!;
assert.deepEqual(center.bc.slice(0, 3).map((v) => +v.toFixed(2)), [1, 0.88, 0.58]);          // 金色中心
assert.ok(near(center.life, 0.3));
const rim = S.explosion.layers.find((l) => l.name === 'StarS_EarthGround_LightRim')!;
assert.ok(near(rim.life, 0.7));
// 进化大落点是红橙色（Evolve_Target_Main 底图 t=0.25 时 (0.91, 0.09, 0.15)）
const mainBg = sampleCurve(S.targetEvolveMain.layers[0].color, 0.25, tmp, 4, 1);
assert.ok(mainBg[0] > 0.9 && mainBg[1] < 0.1, `main bg ${mainBg}`);
// 普通落点底图同一时刻是蓝色
const normBg = sampleCurve(S.target.layers[0].color, 0.25, tmp, 4, 1);
assert.ok(normBg[2] > 0.9 && normBg[0] < 0.1, `normal bg ${normBg}`);

// 6. 发射：碎片 5 个、地面光晕 2 个、天柱中心 1 个、竖条 3 个
const byName = (n: string) => S.explosion.layers.find((l) => l.name === n)!;
assert.equal(emitTimes(byName('StarS_Bits')).length, 5);
assert.equal(emitTimes(byName('StarS_GroundFlare')).length, 2);
assert.equal(emitTimes(byName('StarS_SkyBeam_Center')).length, 1);
assert.equal(emitTimes(byName('StarS_SkyBeam_VertBits')).length, 3);

// 7. 爆炸总时长 ≈ 1.0 s（地裂 StarS_EarthGround 寿命 1 s 最长）
const dur = systemDuration(S.explosion);
assert.ok(dur >= 0.99 && dur <= 1.01, `explosion dur ${dur}`);

// 8. 随机可复现，寿命在随机表范围内
assert.equal(rand01(123, 4, 5), rand01(123, 4, 5));
const bits = byName('StarS_Bits');
for (let i = 0; i < 50; i++) {
  const l = particleLife(bits, 1000 + i, 0, i % 5);
  assert.ok(l >= 0.7 * 0.4 - 1e-6 && l <= 0.7 * 1.2 + 1e-6, `bits life ${l}`);
}

// 9. 阻力位移、色彩空间
assert.ok(near(dragDisp(100, 0, 0.5), 50));
assert.ok(near(dragDisp(100, 5, 10), 20, 1e-2));
assert.ok(near(srgbToLinear(1), 1) && near(srgbToLinear(0), 0) && near(srgbToLinear(0.5), 0.214, 2e-3));

console.log('q30-starstrike: all checks passed');
