/**
 * BAB-01 · B4 模拟层事件（SimEvent）→ 14.14 原版 EffectDef 路由表（引擎无关纯 TS）
 *
 * 作者：Gemini（GM-09）· 2026-11-23
 * 约束：
 * - 不 import 任何渲染引擎或 DOM，也不修改 `src/sim/`；
 * - 所有引用的 effectId 必须 100% 存在于 PR #10 的 157 套 14.14 数据中；
 * - 严格遵守 QC-15（Crossbow=PierceShot、Bunnymega=StarStrike、Cyclonic=HolyBauble）
 *   与 QC-19 / 用户 18:16 决策：不自动绑定 `inGame: false` 系统（金币、AnimaSquad_Card、血条/狂暴、出生特效）。
 */

import type { EffectImportance, EffectOwner, EffectSpawnRequest, Vec3 } from './effect_def';

export interface SimEventLike {
  type: string;
  x?: number;
  z?: number;
  y?: number;
  ang?: number;
  r?: number;
  tier?: number;
  weapon?: string;
  kind?: string;
  cue?: string;
  evolved?: boolean;
  on?: boolean;
  move?: string;
  ownerId?: number;
  localPlayerId?: number;
  targetX?: number;
  targetZ?: number;
}

export interface RouteContext {
  localPlayerId?: number;
  playerPos?: Vec3;
  playerYaw?: number;
  fountainPos?: Vec3;
}

const DEFAULT_FOUNTAIN_POS: Vec3 = [-0.45, 0, -2.4];

function resolveOwner(ev: SimEventLike, ctx: RouteContext, defaultOwner: EffectOwner = 'self'): EffectOwner {
  if (ev.ownerId === undefined || ctx.localPlayerId === undefined) return defaultOwner;
  return ev.ownerId === ctx.localPlayerId ? 'self' : 'teammate';
}

function posOf(ev: SimEventLike, fallback: Vec3 = [0, 0, 0]): Vec3 {
  if (typeof ev.x === 'number' && typeof ev.z === 'number') {
    return [ev.x, typeof ev.y === 'number' ? ev.y : 0, ev.z];
  }
  return [fallback[0], fallback[1], fallback[2]];
}

function req(
  effectId: string,
  position: Vec3,
  owner: EffectOwner,
  importance: EffectImportance,
  extra?: Partial<EffectSpawnRequest>,
): EffectSpawnRequest {
  return { effectId, position, owner, importance, ...extra };
}

export function resolveSimEventToVfx(ev: SimEventLike, ctx: RouteContext = {}): EffectSpawnRequest[] {
  const playerPos = ctx.playerPos ?? [0, 0, 0];
  const p = posOf(ev, playerPos);
  const owner = resolveOwner(ev, ctx, 'self');
  const yaw = typeof ev.ang === 'number' ? ev.ang : ctx.playerYaw;

  switch (ev.type) {
    case 'shoot': {
      if (ev.weapon === 'mg') {
        return [req('Strawberry_Jinx_Base_Q_Minigun_Cas', p, owner, 'decor', { yaw })];
      }
      if (ev.weapon === 'cn') {
        return [req('Strawberry_Jinx_Base_Q_Rocket_Cas', p, owner, 'gameplay', { yaw })];
      }
      if (ev.weapon === 'ult') {
        return [req('Strawberry_Jinx_Base_R_Cas', p, owner, 'gameplay', { yaw })];
      }
      return [];
    }

    case 'hit': {
      if (ev.kind === 'statikk') {
        return [req(ev.evolved ? 'StatikkShiv_Impact_Evo' : 'StatikkShiv_Impact', p, owner, 'decor')];
      }
      if (ev.kind === 'uwu' || ev.kind === 'crossbow' || ev.kind === 'boomerang' || ev.kind === 'boomerang_mini' || ev.kind === 'cyclonic') {
        return [req('Strawberry_Enemy_Hit', p, owner, 'decor')];
      }
      return [req('Strawberry_Jinx_Base_Q_Minigun_Tar', p, owner, 'decor')];
    }

    case 'explode': {
      switch (ev.kind) {
        case 'ult':
        case 'ult_r':
          return [req('Strawberry_Jinx_Base_R_Tar', p, owner, 'gameplay', { scale: ev.r })];
        case 'rocket_e':
        case 'cn':
          return [req('Strawberry_Jinx_Base_Q_Rocket_GroundAOE', p, owner, 'gameplay', { scale: ev.r })];
        case 'mine':
          return [req('Strawberry_Weapon_Mine_tar', p, owner, 'gameplay', { scale: ev.r })];
        case 'iceblast':
        case 'pulse':
          return [req('Strawberry_Weapon_FrostNova', p, owner, 'gameplay', { scale: ev.r })];
        case 'orbital':
          return [req('Strawberry_Weapon_StarStrike_Karthus_Explosion', p, owner, 'gameplay', { scale: ev.r })];
        case 'radiant':
          return [req('Strawberry_Weapon_HollowRadiance_Evolve_Explosion', p, owner, 'gameplay', { scale: ev.r })];
        default:
          return [req('Strawberry_Enemy_Hit', p, owner, 'decor')];
      }
    }

    case 'weaponAudio': {
      if (ev.cue === 'starWarning') {
        return [req(
          ev.evolved ? 'Strawberry_Weapon_Starstrike_Evolve_Target' : 'Strawberry_Weapon_StarStrike_Karthus_Target',
          p,
          owner,
          'gameplay',
          { scale: ev.r },
        )];
      }
      return [];
    }

    case 'kill':
      return [req('Strawberry_Enemy_Death', p, 'enemy', 'decor')];

    case 'playerHurt':
      return [req('Strawberry_Player_Hit', playerPos, owner, 'critical')];

    case 'boxBreak':
      return [req('Strawberry_Destructible_MetalBox_Explosion', p, 'world', 'gameplay')];

    case 'pickup': {
      if (ev.kind === 'xp') return [req('Strawberry_Drop_XP_Pickup', p, owner, 'decor')];
      if (ev.kind === 'heal') return [req('Strawberry_Drop_Health_Heal', p, owner, 'gameplay')];
      if (ev.kind === 'card') return [req('Strawberry_Drop_Card_Pickup', p, owner, 'gameplay')];
      return [];
    }

    case 'levelUp':
      return [req('Strawberry_AugmentSelection_InWorld_Ceremony', playerPos, owner, 'gameplay')];

    case 'overload':
      return ev.on ? [req('Strawberry_Jinx_Base_Passive_Buff', playerPos, owner, 'gameplay')] : [];

    case 'fountainHeal':
      return [req('Strawberry_MapA_Fountain_Nova', ctx.fountainPos ?? DEFAULT_FOUNTAIN_POS, 'world', 'critical')];

    case 'bossEnter':
      return [
        req('Strawberry_MapC_BossSpawn_MapWide', p, 'enemy', 'critical'),
        req('Strawberry_Boss_RekSai_Base_Z_Spawn_AOE_Explosion', p, 'enemy', 'critical'),
      ];

    case 'bossWarn':
      return [req('Strawberry_Boss_RekSai_Base_Z_Spawn_AOE_Warning', p, 'enemy', 'critical')];

    case 'bossLand':
      return [req('Strawberry_Boss_RekSai_Base_Burrowed_W_cas_knockup', p, 'enemy', 'critical')];

    case 'bossAttack': {
      if (ev.move === 'sweep') {
        return [req('Strawberry_Boss_RekSai_Base_Q_swipe_cas', p, 'enemy', 'critical', { yaw })];
      }
      return [req('Strawberry_Boss_RekSai_Base_Z_FallingDebris_Warning', p, 'enemy', 'critical')];
    }

    case 'enemyShoot':
      return [req('EliteSpell_FastMissile', p, 'enemy', 'critical', { yaw })];

    default:
      return [];
  }
}

export const PERSISTENT_EFFECT_IDS = {
  fountainIdle: 'Strawberry_MapA_Fountain_Glow',
  fountainCharge: 'Strawberry_MapA_Fountain_Timer_Charge',
  fountainCooldown: 'Strawberry_MapA_Foutain_Idle_OnCD',
  metalBoxIdle: 'Strawberry_Destructible_MetalBox_Idle_01',
  metalBoxSpawn: 'Strawberry_Destructible_MetalBox_Spawn',
  dropXpIdle: 'Strawberry_Drop_XP',
  dropXpMissile: 'Strawberry_Drop_XP_Missile',
  dropXpHighIdle: 'Strawberry_Drop_XP_High',
  dropHealthIdle: 'Strawberry_Rebuild_Drop_Health',
  dropHealthMissile: 'Strawberry_Rebuild_Drop_Health_Missile',
  eliteGlow: 'Strawberry_Elite_Glow',
  eliteZoneGlow: 'Strawberry_Elite_Zone_Glow',
  uwuMis: 'Strawberry_RapidShot_Mis_Pink',
  uwuMisEvo: 'Strawberry_RapidShot_Mis_Pink_Evolve',
  crossbowMis: 'Strawberry_PierceShot_Mis',
  crossbowMisEvo: 'Strawberry_Pierceshot_MisEvolve',
  boomerangMis: 'Strawberry_Weapon_Boomerang_Missile',
  boomerangEvoMis: 'Strawberry_Weapon_BoomerangEvolve_Missile',
  boomerangEvoReturn: 'Strawberry_Weapon_BoomerangEvolve_Missile_Return',
  boomerangEvoMini: 'Strawberry_Weapon_BoomerangEvolve_Mini_Missile',
  cyclonicOrb: 'augment_holybauble_orbitalmis',
  cyclonicOrbEvo: 'Augment_Weapon_HolyBauble_Evolved',
  radiantAura: 'HollowRadiance_AoeCircle',
  radiantAuraEvo: 'HollowRadiance_AoeCircle_Evolve',
  statikkBeam: 'StatikkShiv_Beam',
  statikkBeamEvo: 'StatikkShiv_Beam_Evo',
  iceblastShieldEvo: 'Augment_Weapon_FrostNova_EvolveShield',
  mineMis: 'Strawberry_Weapon_Mine_mis',
  mineEvoMis: 'Strawberry_Weapon_Mine_Evolve_Mis',
  jinxUltMis: 'Strawberry_Jinx_Base_R_Mis',
  aimRing: 'Strawberry_Rebuild_TargeterOrientation',
} as const;

export const REFERENCED_EFFECT_IDS: readonly string[] = Array.from(new Set([
  'Strawberry_Jinx_Base_Q_Minigun_Cas',
  'Strawberry_Jinx_Base_Q_Rocket_Cas',
  'Strawberry_Jinx_Base_R_Cas',
  'StatikkShiv_Impact',
  'StatikkShiv_Impact_Evo',
  'Strawberry_Enemy_Hit',
  'Strawberry_Jinx_Base_Q_Minigun_Tar',
  'Strawberry_Jinx_Base_R_Tar',
  'Strawberry_Jinx_Base_Q_Rocket_GroundAOE',
  'Strawberry_Weapon_Mine_tar',
  'Strawberry_Weapon_FrostNova',
  'Strawberry_Weapon_StarStrike_Karthus_Explosion',
  'Strawberry_Weapon_HollowRadiance_Evolve_Explosion',
  'Strawberry_Weapon_StarStrike_Karthus_Target',
  'Strawberry_Weapon_Starstrike_Evolve_Target',
  'Strawberry_Enemy_Death',
  'Strawberry_Player_Hit',
  'Strawberry_Destructible_MetalBox_Explosion',
  'Strawberry_Drop_XP_Pickup',
  'Strawberry_Drop_Health_Heal',
  'Strawberry_Drop_Card_Pickup',
  'Strawberry_AugmentSelection_InWorld_Ceremony',
  'Strawberry_Jinx_Base_Passive_Buff',
  'Strawberry_MapA_Fountain_Nova',
  'Strawberry_MapC_BossSpawn_MapWide',
  'Strawberry_Boss_RekSai_Base_Z_Spawn_AOE_Explosion',
  'Strawberry_Boss_RekSai_Base_Z_Spawn_AOE_Warning',
  'Strawberry_Boss_RekSai_Base_Burrowed_W_cas_knockup',
  'Strawberry_Boss_RekSai_Base_Q_swipe_cas',
  'Strawberry_Boss_RekSai_Base_Z_FallingDebris_Warning',
  'EliteSpell_FastMissile',
  ...Object.values(PERSISTENT_EFFECT_IDS),
]));
