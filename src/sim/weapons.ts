/**
 * 《无尽狂潮（Swarm）》Patch 14.14 官方 5 武器槽 + 6 被动槽 + 武器进化系统
 * 数值严格对齐 map33.bin.json / strawberry_jinx.bin.json / zh_cn items.json。
 */

export const MAX_WEAPON_SLOTS = 5;
export const MAX_PASSIVE_SLOTS = 6;
export const WEAPON_MAX_BASE_LEVEL = 5;
export const WEAPON_EVOLVED_LEVEL = 6;
export const PASSIVE_MAX_LEVEL = 5;

export type PassiveId =
  | 'damage'
  | 'haste'
  | 'crit'
  | 'projectiles'
  | 'area'
  | 'duration'
  | 'maxHp'
  | 'armor'
  | 'hpRegen'
  | 'moveSpeed'
  | 'pickup'
  | 'xp';

export type WeaponId =
  | 'jinx_meow'
  | 'uwu_blaster'
  | 'cyclonic'
  | 'radiant'
  | 'statikk'
  | 'crossbow'
  | 'boomerang'
  | 'bunnymega'
  | 'mines'
  | 'iceblast';

export interface PassiveDef {
  id: PassiveId;
  name: string;
  shortName: string;
  icon: string;
  maxLevel: number;
  /** Lv.1..5 累计加成数值（对应 map33.bin.json StatAmount[1..5]） */
  values: [number, number, number, number, number];
  evolvesWeapons: WeaponId[];
  formatVal: (v: number) => string;
  desc: (nextLevel: number) => string;
}

export interface WeaponDef {
  id: WeaponId;
  name: string;
  shortName: string;
  evolvedName: string;
  evolvedShortName: string;
  icon: string;
  evolvePassive: PassiveId;
  maxBaseLevel: number;
  /** Lv.1..5 基础冷却 + Lv.6 进化冷却（秒） */
  cd: [number, number, number, number, number, number];
  /** Lv.1..5 基础伤害 + Lv.6 进化伤害 */
  dmg: [number, number, number, number, number, number];
  /** Lv.1..5 飞弹/目标/地雷数量 + Lv.6 进化数量 */
  count: [number, number, number, number, number, number];
  /** Lv.1..5 范围/半径（米） + Lv.6 进化范围 */
  radius: [number, number, number, number, number, number];
  /** Lv.1..5 持续时间（秒） + Lv.6 进化持续时间 */
  duration: [number, number, number, number, number, number];
  /** 额外暴击率加成（战兔十字弩 / 战兔巨爆） */
  bonusCrit?: [number, number, number, number, number, number];
  desc: (nextLevel: number) => string;
  evolvedDesc: string;
}

export interface UpgradeOffer {
  kind: 'evolve' | 'weapon' | 'passive';
  id: WeaponId | PassiveId;
  nextLevel: number;
  isNew: boolean;
  icon: string;
  tag: string;
  name: string;
  sub: string;
  desc: string;
  evolveHint?: string;
  evolvePartnerIcon?: string;
  evolveReady?: boolean;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

export const PASSIVE_DEFS: PassiveDef[] = [
  {
    id: 'damage', name: '伤害强化', shortName: '伤害', icon: './assets/ui/passives/damage.webp', maxLevel: 5,
    values: [0.10, 0.20, 0.30, 0.40, 0.50],
    evolvesWeapons: [],
    formatVal: (v) => `+${pct(v)}`,
    desc: (lvl) => `所有武器与技能伤害 +${pct(0.10 * lvl)}（+10%/级）`,
  },
  {
    id: 'haste', name: '技能急速', shortName: '急速', icon: './assets/ui/passives/haste.webp', maxLevel: 5,
    values: [10, 20, 30, 40, 50],
    evolvesWeapons: ['jinx_meow', 'uwu_blaster'],
    formatVal: (v) => `+${v}`,
    desc: (lvl) => `技能急速 +${10 * lvl}（+10/级），缩短武器与技能冷却`,
  },
  {
    id: 'crit', name: '暴击几率', shortName: '暴击', icon: './assets/ui/passives/crit.webp', maxLevel: 5,
    values: [0.08, 0.16, 0.24, 0.32, 0.40],
    evolvesWeapons: ['crossbow', 'bunnymega'],
    formatVal: (v) => `+${pct(v)}`,
    desc: (lvl) => `暴击几率 +${pct(0.08 * lvl)}（+8%/级，暴击造成 200% 伤害）`,
  },
  {
    id: 'projectiles', name: '飞弹数量', shortName: '弹数', icon: './assets/ui/passives/projectiles.webp', maxLevel: 5,
    values: [1, 1, 2, 2, 3],
    evolvesWeapons: [],
    formatVal: (v) => `+${v}`,
    desc: (lvl) => `发射型武器额外增加 +${[1, 1, 2, 2, 3][lvl - 1]} 枚飞弹`,
  },
  {
    id: 'area', name: '效果范围', shortName: '范围', icon: './assets/ui/passives/area.webp', maxLevel: 5,
    values: [0.11, 0.22, 0.33, 0.44, 0.55],
    evolvesWeapons: ['mines'],
    formatVal: (v) => `+${pct(v)}`,
    desc: (lvl) => `爆炸与力场效果范围 +${pct(0.11 * lvl)}（+11%/级）`,
  },
  {
    id: 'duration', name: '持续时间', shortName: '持续', icon: './assets/ui/passives/duration.webp', maxLevel: 5,
    values: [0.12, 0.24, 0.36, 0.48, 0.60],
    evolvesWeapons: [],
    formatVal: (v) => `+${pct(v)}`,
    desc: (lvl) => `技能与持续武器效果时长 +${pct(0.12 * lvl)}（+12%/级）`,
  },
  {
    id: 'maxHp', name: '最大生命值', shortName: '生命', icon: './assets/ui/passives/maxHp.webp', maxLevel: 5,
    values: [150, 300, 450, 600, 750],
    evolvesWeapons: ['radiant', 'statikk'],
    formatVal: (v) => `+${v}`,
    desc: (lvl) => `最大生命值 +${150 * lvl}（每级 +150 并回复等量生命）`,
  },
  {
    id: 'armor', name: '护甲', shortName: '护甲', icon: './assets/ui/passives/armor.webp', maxLevel: 5,
    values: [8, 16, 24, 32, 40],
    evolvesWeapons: ['iceblast'],
    formatVal: (v) => `+${v}`,
    desc: (lvl) => `护甲 +${8 * lvl}（+8/级，按 100/(100+护甲) 减免伤害）`,
  },
  {
    id: 'hpRegen', name: '生命回复', shortName: '回血', icon: './assets/ui/passives/hpRegen.webp', maxLevel: 5,
    values: [4, 8, 12, 16, 20],
    evolvesWeapons: ['cyclonic'],
    formatVal: (v) => `+${v}/s`,
    desc: (lvl) => `每秒自动回复 ${4 * lvl} 点生命值（+4/秒/级）`,
  },
  {
    id: 'moveSpeed', name: '移动速度', shortName: '移速', icon: './assets/ui/passives/moveSpeed.webp', maxLevel: 5,
    values: [0.09, 0.18, 0.27, 0.36, 0.45],
    evolvesWeapons: ['boomerang'],
    formatVal: (v) => `+${pct(v)}`,
    desc: (lvl) => `移动速度 +${pct(0.09 * lvl)}（+9%/级）`,
  },
  {
    id: 'pickup', name: '拾取半径', shortName: '拾取', icon: './assets/ui/passives/pickup.webp', maxLevel: 5,
    values: [0.35, 0.70, 1.05, 1.40, 1.75],
    evolvesWeapons: [],
    formatVal: (v) => `+${pct(v)}`,
    desc: (lvl) => `经验晶片拾取半径 +${pct(0.35 * lvl)}（+35%/级）`,
  },
  {
    id: 'xp', name: '经验获取', shortName: '经验', icon: './assets/ui/passives/xp.webp', maxLevel: 5,
    values: [0.10, 0.20, 0.30, 0.40, 0.50],
    evolvesWeapons: [],
    formatVal: (v) => `+${pct(v)}`,
    desc: (lvl) => `经验值获取效率 +${pct(0.10 * lvl)}（+10%/级）`,
  },
];

export const WEAPON_DEFS: WeaponDef[] = [
  {
    id: 'jinx_meow',
    name: '喵喵枪',
    shortName: '喵喵枪',
    evolvedName: '战猫弹幕',
    evolvedShortName: '战猫弹幕',
    icon: './assets/ui/weapons/jinx_meow.webp',
    evolvePassive: 'haste',
    maxBaseLevel: 5,
    cd: [2.5, 2.5, 2.5, 2.5, 2.5, 1.25],
    dmg: [60, 80, 100, 120, 140, 140],
    count: [3, 4, 5, 6, 7, 7],
    radius: [15.0, 15.0, 15.0, 15.0, 15.0, 15.0],
    duration: [0, 0, 0, 0, 0, 0],
    desc: (l) => `朝目标方向连射 ${[3, 4, 5, 6, 7][l - 1]} 发高爆弹，单发 ${[60, 80, 100, 120, 140][l - 1]} 伤害`,
    evolvedDesc: '子弹可穿透所有敌人（后续伤害递减，最低 40%），冷却时间减半（2.5s → 1.25s）',
  },
  {
    id: 'uwu_blaster',
    name: 'UwU 魔爆炮',
    shortName: '魔爆炮',
    evolvedName: 'OwO 魔爆炮',
    evolvedShortName: 'OwO炮',
    icon: './assets/ui/weapons/uwu_blaster.webp',
    evolvePassive: 'haste',
    maxBaseLevel: 5,
    cd: [1.0, 0.85, 0.70, 0.65, 0.50, 0.25],
    dmg: [45, 50, 55, 60, 65, 70],
    count: [1, 1, 2, 2, 3, 3],
    radius: [10.5, 10.5, 10.5, 10.5, 10.5, 11.5],
    duration: [0, 0, 0, 0, 0, 0],
    desc: (l) => `极速锁定最近敌人发射 ${[1, 1, 2, 2, 3][l - 1]} 发弹丸，伤害 ${[45, 50, 55, 60, 65][l - 1]}，冷却 ${[1.0, 0.85, 0.7, 0.65, 0.5][l - 1]}s`,
    evolvedDesc: '以 0.25s 极速连续倾泻高能魔爆弹（单发 70 伤害 × 3 枚）',
  },
  {
    id: 'cyclonic',
    name: '旋风切割器',
    shortName: '切割器',
    evolvedName: '不息气旋',
    evolvedShortName: '不息气旋',
    icon: './assets/ui/weapons/cyclonic.webp',
    evolvePassive: 'hpRegen',
    maxBaseLevel: 5,
    cd: [7, 7, 7, 7, 7, 3],
    dmg: [50, 50, 55, 55, 60, 60],
    count: [2, 3, 4, 5, 6, 6],
    radius: [2.3, 2.3, 2.3, 2.3, 2.3, 3.4],
    duration: [7, 8, 8, 9, 9, 999],
    desc: (l) => `生成 ${[2, 3, 4, 5, 6][l - 1]} 枚环绕飞刃，伤害 ${[50, 50, 55, 55, 60][l - 1]} 并击退敌人，持续 ${[7, 8, 8, 9, 9][l - 1]}s`,
    evolvedDesc: '飞刃化为永久环绕护体气旋，大幅扩大环绕与切割范围',
  },
  {
    id: 'radiant',
    name: '耀光力场',
    shortName: '耀光场',
    evolvedName: '爆破之拥',
    evolvedShortName: '爆破之拥',
    icon: './assets/ui/weapons/radiant.webp',
    evolvePassive: 'maxHp',
    maxBaseLevel: 5,
    cd: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    dmg: [5, 15, 25, 35, 45, 45],
    count: [1, 1, 1, 1, 1, 1],
    radius: [2.2, 2.6, 2.75, 3.4, 3.8, 3.85],
    duration: [0, 0, 0, 0, 0, 0],
    desc: (l) => `每 0.5s 灼烧 ${[2.2, 2.6, 2.75, 3.4, 3.8][l - 1]}m 内敌人，造成 ${[5, 15, 25, 35, 45][l - 1]} + 2.5% 最大生命值伤害`,
    evolvedDesc: '在力场内击杀敌人时触发 2.0m 范围 300 伤害炽热爆炸',
  },
  {
    id: 'statikk',
    name: '斯塔缇克之剑',
    shortName: '电刀',
    evolvedName: '普朗比斯电雕机',
    evolvedShortName: '电雕机',
    icon: './assets/ui/weapons/statikk.webp',
    evolvePassive: 'maxHp',
    maxBaseLevel: 5,
    cd: [5.5, 4.0, 4.0, 2.5, 2.5, 2.5],
    dmg: [100, 190, 280, 370, 460, 460],
    count: [5, 5, 7, 7, 9, 9],
    radius: [11, 11, 11, 11, 11, 11],
    duration: [0, 0, 0, 0, 0, 3],
    desc: (l) => `在至多 ${[5, 5, 7, 7, 9][l - 1]} 名高血量敌人间弹跳闪电，造成 ${[100, 190, 280, 370, 460][l - 1]} 伤害`,
    evolvedDesc: '命中目标周围生成持续 3s 的风暴区，每 0.5s 额外造成 80 伤害',
  },
  {
    id: 'crossbow',
    name: '战兔十字弩',
    shortName: '十字弩',
    evolvedName: '战兔至尊弩炮',
    evolvedShortName: '至尊弩炮',
    icon: './assets/ui/weapons/crossbow.webp',
    evolvePassive: 'crit',
    maxBaseLevel: 5,
    cd: [2.5, 2.25, 2.25, 2.0, 2.0, 2.0],
    dmg: [90, 110, 130, 150, 170, 170],
    count: [3, 3, 4, 4, 5, 25],
    radius: [11, 11, 11, 11, 11, 12],
    duration: [0, 0, 0, 0, 0, 0],
    bonusCrit: [0.1, 0.2, 0.2, 0.3, 0.3, 0.3],
    desc: (l) => `锥形齐射 ${[3, 3, 4, 4, 5][l - 1]} 支弩箭（+${pct([0.1, 0.2, 0.2, 0.3, 0.3][l - 1])} 暴击），暴击时穿透所有敌人`,
    evolvedDesc: '单轮齐射暴增至 25 支超高速弩箭，暴击穿透全图敌人',
  },
  {
    id: 'boomerang',
    name: '回旋刃',
    shortName: '回旋刃',
    evolvedName: '四重回旋刃',
    evolvedShortName: '四重刃',
    icon: './assets/ui/weapons/boomerang.webp',
    evolvePassive: 'moveSpeed',
    maxBaseLevel: 5,
    cd: [6, 5, 5, 4, 4, 4],
    dmg: [40, 50, 60, 70, 80, 110],
    count: [1, 2, 3, 4, 5, 5],
    radius: [9.5, 9.5, 9.5, 9.5, 9.5, 10.5],
    duration: [0, 0, 0, 0, 0, 0],
    desc: (l) => `朝最近敌人掷出 ${[1, 2, 3, 4, 5][l - 1]} 枚穿透回旋刃，往返各造成 ${[40, 50, 60, 70, 80][l - 1]} 伤害`,
    evolvedDesc: '单枚基础伤害提升至 110，并在到达折返顶点时分裂出 4 枚追踪小回旋刃',
  },
  {
    id: 'bunnymega',
    name: '战兔巨爆',
    shortName: '巨爆',
    evolvedName: '疾速兔降',
    evolvedShortName: '疾速兔降',
    icon: './assets/ui/weapons/bunnymega.webp',
    evolvePassive: 'crit',
    maxBaseLevel: 5,
    cd: [7, 7, 5.5, 5.5, 4, 4],
    dmg: [120, 170, 220, 270, 320, 370],
    count: [2, 3, 3, 4, 4, 5],
    radius: [1.8, 1.8, 1.8, 1.8, 1.8, 2.0],
    duration: [0, 0, 0, 0, 0, 0],
    bonusCrit: [0.1, 0.1, 0.2, 0.2, 0.3, 0.3],
    desc: (l) => `召唤 ${[2, 3, 3, 4, 4][l - 1]} 道轨道打击，造成 ${[120, 170, 220, 270, 320][l - 1]} 范围伤害（+${pct([0.1, 0.1, 0.2, 0.2, 0.3][l - 1])} 暴击）`,
    evolvedDesc: '轰炸次数升至 5 发（370 伤），并在末段追加一次超大范围终结轨道轰炸',
  },
  {
    id: 'mines',
    name: '幻灵地雷',
    shortName: '地雷',
    evolvedName: '金克丝三连炸',
    evolvedShortName: '三连炸',
    icon: './assets/ui/weapons/mines.webp',
    evolvePassive: 'area',
    maxBaseLevel: 5,
    cd: [7, 6, 6, 5, 5, 5],
    dmg: [60, 85, 110, 135, 160, 160],
    count: [3, 3, 4, 4, 5, 5],
    radius: [3.0, 3.5, 3.5, 4.0, 4.0, 4.0],
    duration: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4],
    desc: (l) => `环形投掷 ${[3, 3, 4, 4, 5][l - 1]} 枚定时炸弹，0.4s 后引爆造成 ${[60, 85, 110, 135, 160][l - 1]} 伤害`,
    evolvedDesc: '主炸弹爆炸后每枚额外释放 3 次连环次级爆炸（每发 70 伤害 / 3.0m）',
  },
  {
    id: 'iceblast',
    name: '冰爆护甲',
    shortName: '冰爆',
    evolvedName: '深度冻结',
    evolvedShortName: '深度冻结',
    icon: './assets/ui/weapons/iceblast.webp',
    evolvePassive: 'armor',
    maxBaseLevel: 5,
    cd: [15, 15, 14, 14, 13, 13],
    dmg: [50, 85, 120, 155, 190, 190],
    count: [1, 1, 1, 1, 1, 1],
    radius: [6.0, 6.4, 6.8, 7.2, 7.6, 8.0],
    duration: [2, 3, 3, 4, 4, 5],
    desc: (l) => `冻结周围 ${[6.0, 6.4, 6.8, 7.2, 7.6][l - 1]}m 敌人 ${[2, 3, 3, 4, 4][l - 1]}s，造成 ${[50, 85, 120, 155, 190][l - 1]} + 2.5×护甲伤害`,
    evolvedDesc: '同时提供 200 + 20% 最大生命值寒冰护盾，护盾失效时再次冻结周围全部敌人',
  },
];

export const PASSIVE_BY_ID: Record<PassiveId, PassiveDef> = Object.fromEntries(
  PASSIVE_DEFS.map((d) => [d.id, d]),
) as Record<PassiveId, PassiveDef>;

export const WEAPON_BY_ID: Record<WeaponId, WeaponDef> = Object.fromEntries(
  WEAPON_DEFS.map((d) => [d.id, d]),
) as Record<WeaponId, WeaponDef>;

export function getEvolvableWeapons(
  weapons: Partial<Record<WeaponId, number>>,
  passives: Partial<Record<PassiveId, number>>,
): WeaponId[] {
  const out: WeaponId[] = [];
  for (const wId of Object.keys(weapons) as WeaponId[]) {
    const lv = weapons[wId] ?? 0;
    if (lv !== WEAPON_MAX_BASE_LEVEL) continue;
    const def = WEAPON_BY_ID[wId];
    if ((passives[def.evolvePassive] ?? 0) >= 1) out.push(wId);
  }
  return out;
}

function makeOfferForWeapon(
  wId: WeaponId,
  curLv: number,
  passives: Partial<Record<PassiveId, number>>,
  evolve: boolean,
): UpgradeOffer {
  const def = WEAPON_BY_ID[wId];
  const pDef = PASSIVE_BY_ID[def.evolvePassive];
  const hasPassive = (passives[def.evolvePassive] ?? 0) >= 1;
  if (evolve) {
    return {
      kind: 'evolve',
      id: wId,
      nextLevel: WEAPON_EVOLVED_LEVEL,
      isNew: false,
      icon: def.icon,
      tag: '★ 武器进化',
      name: def.evolvedName,
      sub: `${def.name} → 进化`,
      desc: def.evolvedDesc,
      evolveHint: `已配合被动「${pDef.name}」达成进化条件`,
      evolvePartnerIcon: pDef.icon,
      evolveReady: true,
    };
  }
  const next = curLv + 1;
  return {
    kind: 'weapon',
    id: wId,
    nextLevel: next,
    isNew: curLv === 0,
    icon: def.icon,
    tag: curLv === 0 ? '新武器' : `武器 Lv.${next}`,
    name: def.name,
    sub: curLv === 0 ? '加入武器槽' : `Lv.${curLv} → Lv.${next}`,
    desc: def.desc(next),
    evolveHint: `进化需要：${pDef.name}`,
    evolvePartnerIcon: pDef.icon,
    evolveReady: hasPassive,
  };
}

function makeOfferForPassive(
  pId: PassiveId,
  curLv: number,
  weapons: Partial<Record<WeaponId, number>>,
): UpgradeOffer {
  const def = PASSIVE_BY_ID[pId];
  const next = curLv + 1;
  const ownedMatches = def.evolvesWeapons.filter((w) => (weapons[w] ?? 0) > 0).map((w) => WEAPON_BY_ID[w].name);
  const allMatches = def.evolvesWeapons.map((w) => WEAPON_BY_ID[w].name);
  const firstMatch = def.evolvesWeapons[0];
  const hint = allMatches.length
    ? (ownedMatches.length ? `✓ 可进化已拥有：${ownedMatches.join('、')}` : `可进化武器：${allMatches.join('、')}`)
    : '通用核心属性';
  return {
    kind: 'passive',
    id: pId,
    nextLevel: next,
    isNew: curLv === 0,
    icon: def.icon,
    tag: curLv === 0 ? '新被动' : `被动 Lv.${next}`,
    name: def.name,
    sub: curLv === 0 ? '加入被动槽' : `Lv.${curLv} → Lv.${next}`,
    desc: def.desc(next),
    evolveHint: hint,
    evolvePartnerIcon: firstMatch ? WEAPON_BY_ID[firstMatch].icon : undefined,
    evolveReady: ownedMatches.length > 0,
  };
}

/**
 * 抽取 3 张强化/进化选项：
 * - 严格遵守 5 武器槽 + 6 被动槽上限
 * - 若 forceEvolveCard=true（精英掉落访问卡），优先列出所有可进化武器
 */
export function rollLevelUpOffers(
  weapons: Partial<Record<WeaponId, number>>,
  passives: Partial<Record<PassiveId, number>>,
  levelUpsTaken: number,
  rand: () => number,
  forceEvolveCard = false,
): UpgradeOffer[] {
  const weaponCount = (Object.keys(weapons) as WeaponId[]).filter((k) => (weapons[k] ?? 0) > 0).length;
  const passiveCount = (Object.keys(passives) as PassiveId[]).filter((k) => (passives[k] ?? 0) > 0).length;
  const evolvable = getEvolvableWeapons(weapons, passives);

  const weaponCands: UpgradeOffer[] = [];
  for (const def of WEAPON_DEFS) {
    const cur = weapons[def.id] ?? 0;
    if (cur === 0 && weaponCount >= MAX_WEAPON_SLOTS) continue;
    if (cur >= WEAPON_MAX_BASE_LEVEL) continue;
    weaponCands.push(makeOfferForWeapon(def.id, cur, passives, false));
  }

  const passiveCands: UpgradeOffer[] = [];
  for (const def of PASSIVE_DEFS) {
    const cur = passives[def.id] ?? 0;
    if (cur === 0 && passiveCount >= MAX_PASSIVE_SLOTS) continue;
    if (cur >= def.maxLevel) continue;
    passiveCands.push(makeOfferForPassive(def.id, cur, weapons));
  }

  const pick: UpgradeOffer[] = [];
  const used = new Set<string>();
  const add = (o: UpgradeOffer) => {
    const key = `${o.kind}:${o.id}`;
    if (used.has(key)) return false;
    used.add(key);
    pick.push(o);
    return true;
  };

  if (forceEvolveCard && evolvable.length > 0) {
    for (const wId of evolvable) {
      if (pick.length >= 3) break;
      add(makeOfferForWeapon(wId, WEAPON_MAX_BASE_LEVEL, passives, true));
    }
  } else if (evolvable.length > 0 && rand() < 0.72) {
    const wId = evolvable[Math.floor(rand() * evolvable.length)];
    add(makeOfferForWeapon(wId, WEAPON_MAX_BASE_LEVEL, passives, true));
  }

  const takeRandom = (pool: UpgradeOffer[]) => {
    const rem = pool.filter((o) => !used.has(`${o.kind}:${o.id}`));
    if (!rem.length) return;
    // 优先推进已装备武器/被动的等级（55%概率偏向已有槽位）
    const owned = rem.filter((o) => !o.isNew);
    const chosenPool = owned.length > 0 && rand() < 0.58 ? owned : rem;
    add(chosenPool[Math.floor(rand() * chosenPool.length)]);
  };

  if (levelUpsTaken < 4) {
    if (pick.length < 3) takeRandom(weaponCands);
    if (pick.length < 3) takeRandom(passiveCands);
  } else {
    if (pick.length < 3 && weaponCands.length > 0 && rand() < 0.55) takeRandom(weaponCands);
    if (pick.length < 3 && passiveCands.length > 0 && rand() < 0.55) takeRandom(passiveCands);
  }

  const merged = [...weaponCands, ...passiveCands];
  while (pick.length < 3) {
    const rem = merged.filter((o) => !used.has(`${o.kind}:${o.id}`));
    if (!rem.length) break;
    takeRandom(rem);
  }

  // 非访问卡时轻微打乱位置；访问卡把进化卡置顶左侧
  if (!forceEvolveCard) {
    for (let i = pick.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [pick[i], pick[j]] = [pick[j], pick[i]];
    }
  }
  return pick;
}
