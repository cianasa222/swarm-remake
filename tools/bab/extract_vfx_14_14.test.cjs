/**
 * BAB-01 Q01-01 & Q01-02 分类与提取回归测试（Gemini GM-02）
 * 运行：node --test tools/bab/extract_vfx_14_14.test.cjs
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { classifyMap33 } = require('./extract_vfx_14_14.cjs');

test('Q01-01: Boomerang base, evolve, return, and mini missile all classify to boomerang', () => {
  const keys = [
    'Maps/Shipping/Map33/Particles/Weapons/Strawberry_Weapon_Boomerang_Missile',
    'Maps/Shipping/Map33/Particles/Weapons/Strawberry_Weapon_Boomerang_Mis_02',
    'Maps/Shipping/Map33/Particles/Weapons/Strawberry_Weapon_BoomerangEvolve_Missile',
    'Maps/Shipping/Map33/Particles/Weapons/Strawberry_Weapon_BoomerangEvolve_Missile_Return',
    'Maps/Shipping/Map33/Particles/Weapons/Strawberry_Weapon_BoomerangEvolve_Mini_Missile',
  ];
  for (const k of keys) {
    const cls = classifyMap33(k);
    assert.ok(cls, `Expected classification for ${k}`);
    assert.equal(cls.category, 'weapon');
    assert.equal(cls.gameRefs.weapon, 'boomerang');
    assert.equal(cls.gameRefs.riot, 'Boomerang');
  }
});

test('QC-15 guardrail: non-Map33 weapons and shop items remain excluded', () => {
  const excluded = [
    'Maps/Shipping/Map33/Particles/Weapons/Strawberry_Weapon_Nuke_Explosion',
    'Maps/Shipping/Map33/Particles/Weapons/Strawberry_Weapon_ScatterArrows_Mis',
    'Maps/Shipping/Map33/Particles/Weapons/Strawberry_Weapon_CircleShot_Mis',
    'Maps/Shipping/Map33/Particles/Shop/Strawberry_ItemToBuy_Weapon_HollowRadiance',
    'Maps/Shipping/Map33/Particles/Shop/Strawberry_ItemToBuy_Weapon_HolyBauble',
  ];
  for (const k of excluded) {
    assert.equal(classifyMap33(k), null, `Expected null for ${k}`);
  }
});

test('Q01-02: Elite glow systems classify to enemy with elite flag', () => {
  for (const id of ['Strawberry_Elite_Glow', 'Strawberry_Elite_Zone_Glow', 'Strawberry_Elite_MissileFast_Glow']) {
    const cls = classifyMap33(`Maps/Shipping/Map33/Particles/Environment/${id}`);
    assert.ok(cls, `Expected enemy classification for ${id}`);
    assert.equal(cls.category, 'enemy');
    assert.equal(cls.gameRefs.enemy, true);
    assert.equal(cls.gameRefs.elite, true);
  }
});

test('Q01-02: Supply boxes, drops/pickups, and core player feedback classify to map', () => {
  const cases = [
    ['Maps/Shipping/Map33/Particles/Default/Strawberry_Destructible_MetalBox_Idle_01', { destructible: 'metalbox', simEvent: 'boxIdle' }],
    ['Maps/Shipping/Map33/Particles/Default/Strawberry_Destructible_MetalBox_Explosion', { destructible: 'metalbox', simEvent: 'boxBreak' }],
    ['Maps/Shipping/Map33/Particles/Default/Strawberry_Destructible_MetalBox_Spawn', { destructible: 'metalbox', simEvent: 'boxSpawn' }],
    ['Maps/Shipping/Map33/Particles/Default/Strawberry_Drop_XP_Pickup', { pickup: 'xp', simEvent: 'pickup' }],
    ['Maps/Shipping/Map33/Particles/Default/Strawberry_Drop_XP_High_Pickup', { pickup: 'xp', simEvent: 'pickup' }],
    ['Maps/Shipping/Map33/Particles/Default/Strawberry_Drop_Health_Heal', { pickup: 'heal', simEvent: 'pickup' }],
    ['Maps/Shipping/Map33/Particles/Default/Strawberry_Rebuild_Drop_Health', { pickup: 'heal', simEvent: 'dropIdle' }],
    ['Maps/Shipping/Map33/Particles/Default/Strawberry_Rebuild_Drop_Health_Missile', { pickup: 'heal', simEvent: 'dropMissile' }],
    ['Maps/Shipping/Map33/Particles/Default/Strawberry_Rebuild_Drop_Gold_Pickup', { pickup: 'gold', inGame: false, simEvent: 'pickup' }],
    ['Maps/Shipping/Map33/Particles/Default/Strawberry_AnimaSquad_Card', { pickup: 'card', inGame: false, simEvent: 'dropIdle' }],
    ['Maps/Shipping/Map33/Particles/Default/Strawberry_Drop_Card_Pickup', { pickup: 'card', simEvent: 'pickup' }],
    ['Maps/Shipping/Map33/Particles/Default/Strawberry_Player_Hit', { player: 'hurt', simEvent: 'playerHurt' }],
    ['Maps/Shipping/Map33/Particles/Default/Strawberry_AugmentSelection_InWorld_Ceremony', { player: 'levelUp', simEvent: 'levelUp' }],
    ['Maps/Shipping/Map33/Particles/Default/Strawberry_Rebuild_TargeterOrientation', { player: 'aim', simEvent: 'aimRing' }],
  ];
  for (const [k, expectedRefs] of cases) {
    const cls = classifyMap33(k);
    assert.ok(cls, `Expected map classification for ${k}`);
    assert.equal(cls.category, 'map');
    assert.deepEqual(cls.gameRefs, expectedRefs);
  }
});

test('QC-19 source-verified elite/boss UI and spawn are inactive without original video validation', () => {
 for (const id of ['Strawberry_MiniBoss_HealthBar','Strawberry_MapBoss_Healthbar','Strawberry_MapBoss_Enraged','Strawberry_Spawner_SpawnVFX','Strawberry_Spawner_SpawnVFX_Eye']) {
   const cls = classifyMap33('Maps/Shipping/Map33/Particles/Default/' + id);
   assert.ok(cls); assert.equal(cls.gameRefs.inGame, false); assert.equal(cls.gameRefs.binding,'name');
 }
});
test('QC-19 gold and AnimaSquad card stay disabled in the present game', () => {
 for(const id of ['Strawberry_Rebuild_Drop_Gold','Strawberry_Rebuild_Drop_Gold_Missile','Strawberry_Rebuild_Drop_Gold_Pickup','Strawberry_AnimaSquad_Card'])
  assert.equal(classifyMap33('Maps/Shipping/Map33/Particles/Default/'+id).gameRefs.inGame,false);
});

test('QC-19 newly imported attachedMesh layers are indexed but not auto-bound', () => {
  const map = require('../../src/render-babylon/vfx/data/14.14/asset_map.json');
  const expected = [['Strawberry_Spawner_SpawnVFX',3],['Strawberry_Spawner_SpawnVFX_Eye',2],['Strawberry_Spawner_SpawnVFX_Eye',3],['Strawberry_MapBoss_Enraged',0],['Strawberry_MapBoss_Enraged',1]];
  assert.equal(map.summary.attachedMeshEntityBindings, map.attachedMeshBindings.length);
  for (const [id, index] of expected) {
    const record = map.attachedMeshBindings.find(r => r.systemId === id && r.index === index);
    assert.ok(record, `${id}[${index}] is missing`);
    assert.equal(record.gameRefs.inGame, false);
    assert.equal(record.bindingTarget, 'unverified_original_mesh');
  }
});
