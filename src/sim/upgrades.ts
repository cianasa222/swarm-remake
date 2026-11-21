import { UPGRADES as U, MINE, OVERLOAD } from '../config';

export type UpgradeId =
  | 'mgRate' | 'mgPierce' | 'mgFocus'
  | 'cnBlast' | 'cnShards' | 'cnPulse'
  | 'mineArea' | 'mineCharge'
  | 'speed' | 'vitality' | 'magnet' | 'cooldown' | 'overload';

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  /** 'mg' | 'cn' 为武器强化，其余公共 */
  group: 'mg' | 'cn' | 'skill' | 'common';
  maxLevel: number;
  /** 依赖：需要另一张卡先达到某等级（武器三级路线按顺序解锁） */
  requires?: UpgradeId;
  /** 是否属于“改变打法”的关键升级 */
  key?: boolean;
  desc: (nextLevel: number) => string;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

export const UPGRADE_DEFS: UpgradeDef[] = [
  {
    id: 'mgRate', name: '铆钉机枪 I · 快速供弹', group: 'mg', maxLevel: 1,
    desc: () => `机枪起手与上限攻速 +${pct(U.mgRate.rateMul)}（4→4.8 / 6→7.2 发每秒），掉层速度减半`,
  },
  {
    id: 'mgPierce', name: '铆钉机枪 II · 贯钉', group: 'mg', maxLevel: 1, requires: 'mgRate', key: true,
    desc: () => `机枪子弹穿透 ${U.mgPierce.pierce} 名敌人，每发伤害 +${U.mgPierce.dmg}。弹道变长并带双色尾迹`,
  },
  {
    id: 'mgFocus', name: '铆钉机枪 III · 锁喉连射', group: 'mg', maxLevel: 1, requires: 'mgPierce',
    desc: () => `叠满攻速层时伤害 +${pct(U.mgFocus.fullStackBonus)}；对精英与首领额外 +${pct(U.mgFocus.bossBonus)}。枪管满层发光`,
  },
  {
    id: 'cnBlast', name: '震荡炮 I · 扩爆装药', group: 'cn', maxLevel: 1,
    desc: () => `直击伤害 +${U.cnBlast.directAdd}，爆炸半径 +${pct(U.cnBlast.radiusMul)}（1.8→2.4 米），溅射伤害 +${U.cnBlast.splashAdd}`,
  },
  {
    id: 'cnShards', name: '震荡炮 II · 碎弹', group: 'cn', maxLevel: 1, requires: 'cnBlast', key: true,
    desc: () => `炮弹爆炸后向前方射出 ${U.cnShards.count} 枚碎弹，每枚 ${U.cnShards.damage} 伤害，飞行 ${U.cnShards.range} 米`,
  },
  {
    id: 'cnPulse', name: '震荡炮 III · 磁索共振', group: 'cn', maxLevel: 1, requires: 'cnShards', key: true,
    desc: () => `炮击命中磁索区域时追加 ${U.cnPulse.damage} 伤害脉冲（${U.cnPulse.radius} 米）；所有炮击使敌人减速 ${pct(U.cnPulse.slow)} ${U.cnPulse.slowTime} 秒`,
  },
  {
    id: 'mineArea', name: '磁索地雷 · 广域线圈', group: 'skill', maxLevel: 2,
    desc: (l) => `地雷束缚与减速范围 +${pct(U.mineArea.mul)}（第 ${l} 级，累计 +${pct(U.mineArea.mul * l)}）`,
  },
  {
    id: 'mineCharge', name: '磁索地雷 · 双联弹匣', group: 'skill', maxLevel: 1,
    desc: () => `地雷充能 +${U.mineCharge.add}（最多同时储备 ${MINE.charges + U.mineCharge.add} 枚）`,
  },
  {
    id: 'speed', name: '轻装推进', group: 'common', maxLevel: 3,
    desc: (l) => `移动速度 +${pct(U.speed.mul)}（第 ${l} 级，累计 +${pct(U.speed.mul * l)}）`,
  },
  {
    id: 'vitality', name: '加固护甲', group: 'common', maxLevel: 3,
    desc: () => `最大生命 +${U.vitality.maxHp}，立即回复 ${U.vitality.heal} 生命`,
  },
  {
    id: 'magnet', name: '磁吸背包', group: 'common', maxLevel: 2,
    desc: (l) => `经验拾取范围 +${pct(U.magnet.mul)}（第 ${l} 级）`,
  },
  {
    id: 'cooldown', name: '快修工具组', group: 'common', maxLevel: 3,
    desc: () => `地雷与闪避冷却 -${pct(U.cooldown.mul)}，大招充能 +${pct(U.cooldown.mul)}`,
  },
  {
    id: 'overload', name: '过载调校', group: 'common', maxLevel: 2,
    desc: () => `过载持续 +${U.overload.duration} 秒（基础 ${OVERLOAD.duration} 秒），触发冷却 -${U.overload.cooldown} 秒`,
  },
];

export const UPGRADE_BY_ID: Record<UpgradeId, UpgradeDef> = Object.fromEntries(
  UPGRADE_DEFS.map((d) => [d.id, d]),
) as Record<UpgradeId, UpgradeDef>;

/**
 * 从可选池抽三张。
 * - 满级与未解锁项不进入候选。
 * - 前三次升级保证至少一张武器强化（若仍有可选）。
 * - preferWeapon：某些测试/机器人可传入偏好（不影响正式抽卡）。
 */
export function rollUpgrades(
  levels: Partial<Record<UpgradeId, number>>,
  levelUpsSoFar: number,
  rand: () => number,
): UpgradeId[] {
  const available = UPGRADE_DEFS.filter((d) => {
    const cur = levels[d.id] ?? 0;
    if (cur >= d.maxLevel) return false;
    if (d.requires && (levels[d.requires] ?? 0) < 1) return false;
    return true;
  });
  const pick: UpgradeId[] = [];
  const pool = available.slice();
  const take = (filter: (d: UpgradeDef) => boolean) => {
    const cands = pool.filter(filter);
    if (!cands.length) return;
    const d = cands[Math.floor(rand() * cands.length)];
    pick.push(d.id);
    pool.splice(pool.indexOf(d), 1);
  };
  if (levelUpsSoFar < 3) {
    take((d) => d.group === 'mg');
    take((d) => d.group === 'cn');
  } else if (rand() < 0.6) {
    take((d) => d.group === 'mg' || d.group === 'cn');
  }
  while (pick.length < 3 && pool.length) take(() => true);
  // 打乱顺序
  for (let i = pick.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pick[i], pick[j]] = [pick[j], pick[i]];
  }
  return pick;
}
