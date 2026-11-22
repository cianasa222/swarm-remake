/**
 * 《潮线封锁》v0.1 —— 全部关键数值集中在此文件。
 * 单位：距离 = 米，时间 = 秒，速度 = 米/秒，伤害 = 点。
 * 修改这里即可调整试玩手感，战斗逻辑不写死数字。
 */

export const SIM = {
  /** 固定时间步（秒） */
  dt: 1 / 60,
  /** 单帧最多追赶的步数，防止卡顿后螺旋 */
  maxSubSteps: 5,
};

export const ARENA = {
  /** 可活动区域半宽 / 半高（对应原版 boundsMax = [18000, 18000]，100 LOL 单位 = 1 米） */
  halfW: 90,
  halfH: 90,
  lolPerMeter: 100,
  /** 兼容旧场景引用 */
  towerRadius: 1.9,
  blocks: [] as [number, number, number, number][],
  entrances: {
    N: { name: '北侧通道', x: 0, z: -25.5, spread: 6 },
    S: { name: '南侧通道', x: 0, z: 25.5, spread: 6 },
    W: { name: '西侧通道', x: -32.5, z: 0, spread: 5 },
    E: { name: '东侧通道', x: 32.5, z: 0, spread: 5 },
  } as Record<string, { name: string; x: number; z: number; spread: number }>,
};

/** 原版围绕玩家视野外圈刷怪环（InnerRadius: 2000, OuterRadius: 2300, maxDistance: 3000） */
export const SPAWN_RING = {
  inner: 20,
  outer: 23,
  maxDist: 30,
};

export const MATCH = {
  /** 首领登场时刻（原版 MapA 20 波总时长：42 + 19*45 = 897s） */
  bossTime: 897,
  /** 入口预警提前量 */
  waveWarn: 1.4,
  /** 生命补给拾取回复（对齐 1000 HP 基准） */
  healPickup: 250,
  /** 普通敌人掉落小型维修包的概率与回复量 */
  kitChance: 0.024,
  kitHeal: 120,
};

export const PLAYER = {
  /** 原版 Strawberry_Jinx: baseHP=1000, baseMoveSpeed=350, pathfindingCollisionRadius=35 */
  maxHp: 1000,
  radius: 0.35,
  /** 受击判定半径：原版 overrideGameplayCollisionRadius=20（Quick AI Q-13，14.14 对齐） */
  hurtRadius: 0.2,
  speed: 3.5,
  pickupRadius: 3.2,
  /** 经验晶片被吸取后的飞行速度 */
  magnetSpeed: 13,
  /** 受伤后短暂无敌，避免同帧多段伤害叠爆 */
  hurtIFrames: 0.45,
  /** 自动索敌射程：原版 Strawberry_JinxAutoAttack castRange=900（Quick AI Q-13） */
  targetRange: 9.0,
};

export const JINX_E = {
  /**
   * Patch 14.14 Strawberry_JinxE：cooldownTime=8, mCastTime=0.35, RocketCount=9, RocketAoERadius=300,
   * RocketDamage = 55 + 6 ×（角色等级 − 1）（ByCharLevelBreakpointsCalculationPart）。
   * 火箭弹道 {69358b90}：castRange=2200（mProjectTargetToCastRange，飞满 22 m）、mMissileSpec.mSpeed=1800。
   * LoL Wiki「Swarm/Jinx」：9 枚火箭在 90° 锥形内随机方向直线飞行，宽 80，爆炸对主目标和周围敌人造成同等伤害。
   * （Quick AI Q-13 按原版重建；旧值：range 9.25 / speed 17.5 / 伤害 95+8×等级 / 规则 3×3 扇形）
   */
  cooldown: 8,
  castTime: 0.35,
  rocketCount: 9,
  fireInterval: 0.045,
  coneDeg: 90,
  range: 22,
  speed: 18,
  /** 火箭碰撞半径（宽 80 → 半径 0.4 m） */
  radius: 0.4,
  aoeRadius: 3.0,
  aoeIncrease: [0.15, 0.30, 0.45, 0.60, 0.75, 0.90],
  level1Damage: 55,
  dmgPerLevel: 6,
  critDmgBonus: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
};

export const JINX_R = {
  /**
   * Patch 14.14 Strawberry_JinxR：cooldownTime=50, mCastTime=0.5, castRange=2500, mLineWidth=140（全宽 280），
   * mMissileSpec.mSpeed=2000, ExplosionSize=500..1100, Damage = 500 + 50 ×（角色等级 − 1），MaxDamage = Damage × DamageMulti(3)。
   * LoL Wiki「Swarm/Jinx」：命中第一个敌人或飞到最远距离时爆炸，爆炸伤害按目标已损失生命 +0%–200%。
   * （Quick AI Q-13 按原版重建；旧值：speed 17 / 伤害 380+38×等级、穿透普通怪、爆炸 ×1.45）
   */
  cooldown: 50,
  /** 开局冷却（原版数据无此字段，沿用项目设定） */
  initCooldown: 12,
  castTime: 0.5,
  range: 25,
  /** 飞弹全宽 2.8 m（碰撞半径 1.4 m） */
  width: 2.8,
  speed: 20,
  level1Damage: 500,
  dmgPerLevel: 50,
  /** 按目标已损失生命比例额外 +0%–200% */
  missingHpBonus: 2.0,
  baseExplodeRadius: 5.0,
  maxExplodeRadius: 11.0,
};

export const JINX_PASSIVE = {
  /**
   * Patch 14.14 Strawberry_JinxPassiveMarker：BuffDuration=8, AHBuff=150, MinionsToProcEvolve=70, MSBuff=2.5, MSDecayRate=0.95。
   * LoL Wiki「Swarm/Jinx」：击杀 70 个非精英或 1 个精英后 8 秒内 +150 技能急速，
   * +（2.5% × 累计兴奋次数）移速并在持续期间衰减，与其他移速加成相加。Wiki 未列攻速加成。
   * 衰减按 MSDecayRate 线性处理：持续结束时衰减掉 95%（此为推断，需实机录像确认）。
   * ASBuff（1.5–3.9）未在 Wiki 中出现，推测为奔跑动画速率，不作为攻速使用。
   * （Quick AI Q-13 按原版重建；旧值：固定 +100% 移速、+80% 攻速）
   */
  killsRequired: 70,
  duration: 8.0,
  ahBonus: 150,
  msPerStack: 0.025,
  msDecay: 0.95,
};

export const MG = {
  name: '喵喵枪',
  bulletSpeed: 35,
  /** 原版子弹 mMissileWidth=90（Wiki 宽 90）→ 碰撞半径 0.45 m；进化同宽（Quick AI Q-13，旧值 0.16 / 0.22） */
  bulletRadius: 0.45,
  range: 15.0,
  burstInterval: 0.075,
};

export const CANNON = {
  name: '震荡炮',
  rate: 1,
  directDamage: 30,
  splashDamage: 20,
  splashRadius: 1.8,
  shellSpeed: 17,
  shellRadius: 0.24,
  range: 9.5,
};

export const SWAP = { time: 0.7 };

export const MINE = {
  cooldown: 12,
  charges: 1,
  placeDist: 1.4,
  armTime: 0.3,
  triggerRadius: 1.3,
  /** 束缚半径与时长 */
  bindRadius: 2.2,
  bindTime: 1.0,
  /** 减速半径、比例、时长 */
  slowRadius: 3.4,
  slowFactor: 0.45,
  slowTime: 2.0,
  damage: 15,
  /** 触发后残留磁场（震荡炮共振判定区）时长 */
  fieldTime: 3.5,
  maxActive: 4,
  /** 未触发的地雷存在时长 */
  life: 25,
};

export const OVERLOAD = {
  killWindow: 3,
  killsNeeded: 5,
  duration: 4,
  moveBonus: 0.18,
  rateBonus: 0.25,
  cooldown: 14,
};

export const ULT = {
  /** 充满所需充能点 */
  chargeNeeded: 150,
  /** 每种击杀提供的充能 */
  chargePerKill: { crawler: 1, spitter: 2, charger: 2, elite: 20, boss: 0 } as Record<string, number>,
  speed: 22,
  range: 24,
  radius: 0.75,
  pierceDamage: 90,
  explodeDamage: 180,
  explodeRadius: 3.6,
};

export const DASH = {
  duration: 0.22,
  iframes: 0.2,
  distance: 3.8,
  cooldown: 5,
};

/** 第一关官方角色模型缩放（0.01 * SkinCharacterDataProperties.skinScale） */
export const ENEMY_SCALES = {
  pix: 0.0165,
  ghoul: 0.009,
  hunter: 0.009,
  dasher: 0.0082,
  bruiser: 0.0068,
  reksai: 0.0275,
} as const;

/** 敌人基础属性（M3 全武器体系校准为 Patch 14.14 量级） */
export const ENEMIES = {
  crawler: { name: '虚空水滴 / 食尸鬼', hp: 58, speed: 1.55, radius: 0.4, contact: 80, xp: 2 },
  spitter: {
    name: '虚空猎手', hp: 200, speed: 1.3, radius: 0.45, contact: 80, xp: 4,
    keepDist: 7.5, windup: 1.1, cooldown: 4.8, bullets: 3, spreadDeg: 34,
    bulletSpeed: 3.8, bulletDamage: 85, bulletRadius: 0.26, bulletLife: 5,
  },
  charger: {
    name: '迷你突进者', hp: 160, speed: 2.1, radius: 0.45, contact: 100, xp: 5,
    triggerDist: 8, windup: 0.95, dashSpeed: 10.5, dashLen: 8, dashWidth: 1.3, dashDamage: 120, cooldown: 4.5,
  },
  elite: {
    name: '重装精英 · 铁背', hp: 4200, speed: 1.95, radius: 0.85, contact: 160, xp: 35,
    triggerDist: 10, windup: 1.0, dashSpeed: 10.5, dashLen: 10, dashWidth: 2.0, dashDamage: 180, cooldown: 3.6,
  },
};

/** 敌人生命随时间的倍率（适配单人 15 分钟全武器成长曲线） */
export function hpScale(t: number): number {
  const m = t / 60;
  return 1 + 0.16 * m + 0.025 * m * m;
}

export const BOSS = {
  name: '深海魔鲨 · 雷克塞',
  hp: 30000,
  radius: 2.5, // 原版 RekSai pathfindingCollisionRadius=250
  speed: 1.05, // 原版 RekSai baseMoveSpeed=105
  contact: 140,
  phase2At: 0.5,
  entranceTime: 3.2,
  sweep: { windup: 1.15, radius: 7.5, arcDeg: 130, damage: 180 },
  stomp: { radius: 2.3, firstDelay: 0.95, gap: 0.42, damage: 140, lead: 0.55, spacing: 2.6 },
  ring: { count: 40, gapDeg: 70, speed: 4.1, damage: 110, radius: 0.32, life: 7 },
  /** 每组攻势后的输出窗口 */
  window: [2.8, 1.9],
  /** 阶段二招式间隔倍率 */
  phase2Haste: 0.72,
  /** 首领战期间仍刷少量爬壳虫，提供经验与被动击杀充能 */
  addsInterval: 9,
  addsCount: 5,
};

/** 官方 Map33 ExperienceCurveData {9f34b4bd} 增量经验曲线 */
const OFFICIAL_XP_CURVE = [
  5, 15, 30, 50, 75, 105, 140, 180, 225, 275,
  341, 413, 491, 575, 665, 761, 863, 971, 1085, 1205,
  1352, 1506, 1667, 1835, 2010, 2192, 2381, 2577, 2780, 2990,
];

/** 升级经验需求：第 level 级 -> level+1 级 */
export function xpForLevel(level: number): number {
  if (level <= 1) return OFFICIAL_XP_CURVE[0];
  if (level - 1 < OFFICIAL_XP_CURVE.length) {
    return OFFICIAL_XP_CURVE[level - 1] - OFFICIAL_XP_CURVE[level - 2];
  }
  return 210 + (level - OFFICIAL_XP_CURVE.length) * 28;
}

export const XP = {
  /** 晶片存在时长 */
  life: 90,
  /** 场上晶片上限，超出时合并 */
  maxShards: 220,
};

/** 预算（会被画质档位进一步缩放装饰部分） */
export const BUDGET = {
  maxEnemies: 160,
  maxEnemyBullets: 260,
  maxPlayerProjectiles: 420,
};

/** 升级卡数值 */
export const UPGRADES = {
  mgRate: { rateMul: 0.2 }, // 机枪 I：基础与上限攻速 +20%
  mgPierce: { pierce: 1, dmg: 2 }, // 机枪 II：穿透 1 名敌人，伤害 +2
  mgFocus: { fullStackBonus: 0.4, bossBonus: 0.25 }, // 机枪 III：满层伤害 +40%，对精英/首领再 +25%
  cnBlast: { radiusMul: 0.35, splashAdd: 8, directAdd: 10 }, // 炮 I：爆炸半径 +35%，溅射 +6
  cnShards: { count: 2, damage: 18, range: 4.5 }, // 炮 II：爆炸射出 2 枚碎弹
  cnPulse: { damage: 28, radius: 2.8, slow: 0.4, slowTime: 1.5 }, // 炮 III：磁索共振脉冲 + 炮击减速
  mineArea: { mul: 0.3 },
  mineCharge: { add: 1 },
  speed: { mul: 0.08 },
  vitality: { maxHp: 160, heal: 220 },
  magnet: { mul: 0.45 },
  cooldown: { mul: 0.12 },
  overload: { duration: 1, cooldown: 2 },
};

/** 第一关中央治愈喷泉（Fountain / HealingWell）原版机制参数 */
export const FOUNTAIN = {
  x: -0.45,
  z: -2.40,
  zoneRadius: 11.4,
  chargeTime: 10.0,
  decayRate: 0.35,
  healFraction: 0.60,
  cooldown: 75.0,
} as const;

/** 第一关可破坏金属补给箱（66 个原版点位） */
export const SUPPLY_BOX = {
  hp: 60,
  radius: 0.68,
  respawnTime: 90,
  xpDrops: 2,
  xpValue: 22,
  healChance: 0.30,
  ultChance: 0.25,
  ultGain: 8,
} as const;
