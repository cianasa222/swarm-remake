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
  /** 原版 Strawberry_Jinx: baseHP=1000, baseMoveSpeed=350, collisionRadius=35 */
  maxHp: 1000,
  radius: 0.35,
  speed: 3.5,
  pickupRadius: 3.2,
  /** 经验晶片被吸取后的飞行速度 */
  magnetSpeed: 13,
  /** 受伤后短暂无敌，避免同帧多段伤害叠爆 */
  hurtIFrames: 0.45,
  /** 自动索敌射程 */
  targetRange: 10.5,
};

export const MG = {
  name: '铆钉机枪',
  baseRate: 4,
  maxRate: 6,
  damage: 12,
  /** 每层提速 (发/秒) */
  ratePerStack: 0.25,
  /** 层数衰减速度（层/秒），在转火或断开攻击后触发 */
  stackDecay: 6,
  /** 超过该时间未命中同一目标即开始掉层 */
  stackGrace: 0.45,
  bulletSpeed: 28,
  bulletRadius: 0.14,
  range: 9.5,
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

/** 敌人基础属性（移速与碰撞伤害对齐原版 CharacterRecord 比例，hp 随时间乘 hpScale(t)） */
export const ENEMIES = {
  crawler: { name: '爬壳虫', hp: 20, speed: 1.55, radius: 0.4, contact: 80, xp: 1 },
  spitter: {
    name: '刺囊兽', hp: 34, speed: 1.3, radius: 0.45, contact: 80, xp: 2,
    keepDist: 7.5, windup: 1.1, cooldown: 4.8, bullets: 3, spreadDeg: 34,
    bulletSpeed: 3.8, bulletDamage: 85, bulletRadius: 0.26, bulletLife: 5,
  },
  charger: {
    name: '裂甲兽', hp: 55, speed: 2.1, radius: 0.45, contact: 100, xp: 3,
    triggerDist: 8, windup: 0.95, dashSpeed: 10.5, dashLen: 8, dashWidth: 1.3, dashDamage: 120, cooldown: 4.5,
  },
  elite: {
    name: '重甲裂甲兽', hp: 520, speed: 1.95, radius: 0.85, contact: 160, xp: 25,
    triggerDist: 10, windup: 1.0, dashSpeed: 10.5, dashLen: 10, dashWidth: 2.0, dashDamage: 180, cooldown: 3.6,
  },
};

/** 敌人生命随时间的倍率 */
export function hpScale(t: number): number {
  const m = t / 60;
  return 1 + 0.03 * m + 0.0018 * m * m;
}

export const BOSS = {
  name: '断潮督军 · 雷克塞',
  hp: 3000,
  radius: 2.5, // 原版 RekSai pathfindingCollisionRadius=250
  speed: 1.35, // 原版 RekSai baseMoveSpeed=105..150
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
  /** 首领战期间仍刷少量爬壳虫，提供经验与充能 */
  addsInterval: 9,
  addsCount: 5,
};

/** 升级经验需求：第 n 级 -> n+1 级 */
export function xpForLevel(level: number): number {
  return Math.round(20 + 9 * (level - 1) + 3.2 * (level - 1) * (level - 1));
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
  maxPlayerProjectiles: 220,
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
  x: -1.62,
  z: -3.53,
  innerRadius: 8.1,
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
