import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WEAPON_SFX_EXTENDED_14_14,
  ENEMY_DEATH_SFX_14_14,
  WORLD_SFX_14_14,
  BGM_MANIFEST_14_14,
  MINIMAL_ASSET_SYNC_FILES,
  resolveEnemyDeathSfx,
  type CurrentEnemyKind,
} from '../src/audio/audio_uia_map';

test('UIA-1: 9 把副武器映射完整且遵守 QC-15（禁止误用 scatterarrows/circleshot/nuke 哈希）', () => {
  const forbiddenQc15Hashes = new Set([
    'global/352190091.ogg', // scatterarrowsmis_OnMissileCast
    'global/1065080604.ogg', // scatterarrowsmis_cast
    'global/27850350.ogg', // scatterarrowmis_wall_hit
    'global/1071518114.ogg', // circleshotmis_OnHit
    'global/1008939446.ogg', // nuke_warning
    'global/164331754.ogg', // nuke_explosion
  ]);

  const cues = Object.entries(WEAPON_SFX_EXTENDED_14_14);
  assert.ok(cues.length >= 22, `Expected >=22 weapon cues, got ${cues.length}`);

  for (const [cue, list] of cues) {
    assert.ok(list.length > 0, `Cue ${cue} must not be empty`);
    const seen = new Set<string>();
    for (const p of list) {
      assert.match(p, /^global\/\d+\.ogg$/, `Invalid path format in ${cue}: ${p}`);
      assert.ok(!seen.has(p), `Duplicate sample in ${cue}: ${p}`);
      assert.ok(!forbiddenQc15Hashes.has(p), `QC-15 violation in ${cue}: ${p}`);
      seen.add(p);
    }
  }
});

test('UIA-2: 敌人按怪种死亡映射覆盖全部 23 组且当前 5 种 Kind 均可路由', () => {
  const species = Object.entries(ENEMY_DEATH_SFX_14_14);
  assert.equal(species.length, 23);

  for (const [sp, list] of species) {
    assert.ok(list.length > 0, `Species ${sp} must not be empty`);
    for (const p of list) {
      assert.match(p, /^global\/\d+\.ogg$/, `Invalid enemy death path in ${sp}: ${p}`);
    }
  }

  const kinds: CurrentEnemyKind[] = ['crawler', 'spitter', 'charger', 'elite', 'boss'];
  for (const k of kinds) {
    assert.ok(resolveEnemyDeathSfx(k).length > 0);
  }
  assert.deepEqual(resolveEnemyDeathSfx('crawler', 'pix'), ENEMY_DEATH_SFX_14_14.pix);
  assert.deepEqual(resolveEnemyDeathSfx('crawler', 'ghoul'), ENEMY_DEATH_SFX_14_14.basicMelee);
  assert.deepEqual(resolveEnemyDeathSfx('spitter'), ENEMY_DEATH_SFX_14_14.hunter);
  assert.deepEqual(resolveEnemyDeathSfx('charger'), ENEMY_DEATH_SFX_14_14.miniDasher);
  assert.deepEqual(resolveEnemyDeathSfx('elite'), ENEMY_DEATH_SFX_14_14.minibossBruiser);
});

test('UIA-3 & 世界音效: 补给箱、金币、BGM 核验路径格式正确且最小增量清单无重复', () => {
  assert.equal(WORLD_SFX_14_14.boxBreak.length, 3);
  assert.equal(BGM_MANIFEST_14_14.verified.mainIntroMapA.path, 'music/307974760.ogg');
  assert.equal(BGM_MANIFEST_14_14.verified.victoryBanner.path, 'music/91455257.ogg');
  assert.equal(BGM_MANIFEST_14_14.verified.defeatBanner.path, 'music/632537467.ogg');

  const uniq = new Set(MINIMAL_ASSET_SYNC_FILES);
  assert.equal(uniq.size, MINIMAL_ASSET_SYNC_FILES.length, 'MINIMAL_ASSET_SYNC_FILES has duplicates');
  assert.equal(MINIMAL_ASSET_SYNC_FILES.length, 23);
});
