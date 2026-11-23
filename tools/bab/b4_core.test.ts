/**
 * BAB-01 · B4 纯 TS 核心底座回归测试（Gemini GM-09）
 * 在有 tsx 的仓库环境中直接运行：npx tsx --test tools/bab/b4_core.test.ts
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  birthScaleToWorld,
  evalCurveColor,
  evalCurveNumber,
  evalCurveVec2,
  sampleProbTable,
  shouldSpawnByBudget,
} from '../../src/render-babylon/vfx/curve_eval';
import {
  PERSISTENT_EFFECT_IDS,
  REFERENCED_EFFECT_IDS,
  resolveSimEventToVfx,
} from '../../src/render-babylon/vfx/sim_to_vfx';

test('curve_eval: keyframes, probabilityTables, integrated curve & flex override', () => {
  assert.equal(evalCurveNumber({ t: [0, 0.5, 1], v: [0, 10, 20] }, 0.25), 5);
  assert.equal(evalCurveNumber({ t: [0, 1], v: [2, 6] }, 1.5), 6);
  assert.equal(sampleProbTable({ t: [0, 1], v: [0.5, 1.5] }, 0.5), 1.0);
  const rolled = evalCurveNumber({ c: 10, rnd: [{ t: [0, 1], v: [0.5, 1.5] }] }, 0, 0, { rng: () => 1 });
  assert.equal(rolled, 15);
  const integ = evalCurveNumber({ c: 4, integrated: true }, 0.5);
  assert.ok(Math.abs(integ - 2.0) < 1e-6);
  const uv = evalCurveVec2({ c: [2, -4], integrated: true }, 0.5);
  assert.ok(Math.abs(uv[0] - 1.0) < 1e-6 && Math.abs(uv[1] - -2.0) < 1e-6);
  assert.equal(evalCurveNumber({ c: 1, flex: true }, 0, 0, { flexOverride: 99 }), 99);
  const col = evalCurveColor({ t: [0, 1], v: [[1, 0, 0, 1], [0, 1, 0, 0]] }, 0.5);
  assert.deepEqual(col, [0.5, 0.5, 0, 0.5]);
});

test('curve_eval: EFFECT_UNITS scaling & enemy/critical budget immunity', () => {
  assert.deepEqual(birthScaleToWorld([100, 100, 100], 'quad', 1), [2, 2, 2]);
  const ms = birthScaleToWorld([100, 100, 100], 'mesh', 1.75);
  assert.ok(ms.every((v) => Math.abs(v - 1.75) < 1e-12));

  const lowBudget = { decorScale: 0, decorBudget: 0, teammateDecorScale: 0, reduceFlash: true };
  assert.equal(shouldSpawnByBudget('enemy', 'decor', 999, lowBudget), true);
  assert.equal(shouldSpawnByBudget('self', 'critical', 999, lowBudget), true);
  assert.equal(shouldSpawnByBudget('teammate', 'gameplay', 999, lowBudget), true);
  assert.equal(shouldSpawnByBudget('teammate', 'decor', 0, lowBudget), false);
});

test('sim_to_vfx: routes core events accurately & separates self vs teammate', () => {
  const ult = resolveSimEventToVfx({ type: 'explode', kind: 'ult_r', x: 5, z: -3, r: 6, ownerId: 1 }, { localPlayerId: 1 });
  assert.equal(ult.length, 1);
  assert.equal(ult[0].effectId, 'Strawberry_Jinx_Base_R_Tar');
  assert.equal(ult[0].owner, 'self');

  const teammateHit = resolveSimEventToVfx({ type: 'hit', kind: 'statikk', evolved: true, x: 1, z: 2, ownerId: 2 }, { localPlayerId: 1 });
  assert.equal(teammateHit[0].effectId, 'StatikkShiv_Impact_Evo');
  assert.equal(teammateHit[0].owner, 'teammate');
  assert.equal(teammateHit[0].importance, 'decor');

  const bossWarn = resolveSimEventToVfx({ type: 'bossWarn', x: 0, z: 0 });
  assert.equal(bossWarn[0].owner, 'enemy');
  assert.equal(bossWarn[0].importance, 'critical');
});

test('sim_to_vfx: zero dangling IDs and zero inGame:false auto-bindings against 157 PR #10 systems', () => {
  const dataDir = path.resolve(process.cwd(), 'src/render-babylon/vfx/data/14.14');
  if (!fs.existsSync(dataDir)) return;
  const allIds = new Map<string, { inGame?: boolean }>();
  for (const f of ['fountain.json', 'weapons.json', 'jinx.json', 'enemy.json', 'reksai.json', 'map.json']) {
    const p = path.join(dataDir, f);
    if (!fs.existsSync(p)) continue;
    for (const sys of JSON.parse(fs.readFileSync(p, 'utf8'))) {
      allIds.set(sys.id, sys.gameRefs || {});
    }
  }
  assert.ok(allIds.size >= 152, `Expected >=152 systems, got ${allIds.size}`);
  for (const id of REFERENCED_EFFECT_IDS) {
    assert.ok(allIds.has(id), `Dangling effectId: ${id}`);
    assert.notEqual(allIds.get(id)?.inGame, false, `Must not auto-bind inGame:false system: ${id}`);
  }
  assert.ok(PERSISTENT_EFFECT_IDS.boomerangEvoReturn === 'Strawberry_Weapon_BoomerangEvolve_Missile_Return');
});
