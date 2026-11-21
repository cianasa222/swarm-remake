/**
 * 第一关仓库区波次时间线（对齐原版 strawberry_animasquad_map1.materials.bin.json 的 20 波 SubPhases）。
 * - Phase 1: 0s (dur 42s), Phase 2–20: 每 45s 一波（至 897s 登场最终首领）。
 * - 刷怪围绕玩家视野外圈 [20m, 23m] 的可行走区刷新（原版 InnerRadius=2000, OuterRadius=2300）。
 */
export type EnemyKind = 'crawler' | 'spitter' | 'charger' | 'elite';

export interface WaveDef {
  t: number;
  entrance: string;
  units: [EnemyKind, number][];
  /** 每只之间的出场间隔 */
  spacing: number;
  /** 标记高潮或精英波 */
  tag?: 'elite' | 'climax';
}

const waves: WaveDef[] = [];
const add = (t: number, units: [EnemyKind, number][], spacing = 0.2, tag?: WaveDef['tag']) =>
  waves.push({ t, entrance: 'RING', units, spacing, tag });

// ── 阶段 1–3（0s–132s）：Pix / Ghoul / Shy 初期近战 + 夹击 ──
for (let t = 2; t < 40; t += 9) add(t, [['crawler', 4 + Math.floor(t / 12)]], 0.45);
for (let t = 42; t < 85; t += 10) add(t, [['crawler', 7 + Math.floor((t - 42) / 15)]], 0.32);
for (let t = 87; t < 130; t += 11) {
  add(t, [['crawler', 8], ['spitter', 1]], 0.28);
}
add(112, [['crawler', 12]], 0.08); // 原版 WaveDef3_PixSandwich 夹击小潮

// ── 阶段 4–6（132s–267s）：MiniBoss_Bruiser 精英登场 + Hunter 远程 + 盾阵 ──
add(132, [['elite', 1], ['crawler', 6]], 0.35, 'elite');
for (let t = 148; t < 175; t += 12) add(t, [['crawler', 9], ['spitter', 2]], 0.24);
for (let t = 177; t < 220; t += 11) add(t, [['spitter', 3], ['crawler', 7]], 0.25);
add(222, [['elite', 1], ['crawler', 10]], 0.22, 'elite');
for (let t = 238; t < 265; t += 12) add(t, [['crawler', 12], ['spitter', 2]], 0.2);

// ── 阶段 7–9（267s–402s）：Swarmer 虫潮 + DasherBoss 冲锋怪 + MiniDasher ──
for (let t = 267; t < 310; t += 10) add(t, [['crawler', 15]], 0.14);
add(312, [['elite', 1], ['charger', 2], ['crawler', 8]], 0.22, 'elite');
for (let t = 328; t < 355; t += 12) add(t, [['charger', 2], ['crawler', 10]], 0.2);
for (let t = 357; t < 400; t += 10) add(t, [['charger', 3], ['crawler', 10]], 0.18);
add(380, [['elite', 1], ['charger', 2]], 0.25, 'elite');

// ── 阶段 10–13（402s–582s）：Red / Exploder / ArtilleryBoss / Daisy 混合施压 ──
for (let t = 402; t < 490; t += 11) {
  const k = Math.floor((t - 402) / 22);
  add(t, [['crawler', 12 + k], ['spitter', 3], ['charger', 2]], 0.16);
}
add(492, [['elite', 1], ['spitter', 4], ['crawler', 10]], 0.2, 'elite');
for (let t = 510; t < 580; t += 11) {
  add(t, [['crawler', 14], ['charger', 3], ['spitter', 3]], 0.15);
}

// ── 阶段 14–17（582s–762s）：Fast / Lancer / Spawner / BruiserBoss 密集怪潮 ──
for (let t = 582; t < 670; t += 10) {
  add(t, [['charger', 3], ['crawler', 14], ['spitter', 3]], 0.14);
}
add(672, [['elite', 1], ['charger', 3], ['crawler', 12]], 0.16, 'elite');
for (let t = 688; t < 760; t += 10) {
  add(t, [['crawler', 16], ['spitter', 4], ['charger', 3]], 0.13);
}
add(735, [['elite', 1], ['crawler', 10]], 0.18, 'elite');

// ── 阶段 18–20（762s–897s）：最终高潮波 + 870s–897s 首领前清场窗口 ──
for (let t = 762; t < 848; t += 10) {
  add(t, [['crawler', 18], ['charger', 4], ['spitter', 4]], 0.12, t >= 807 ? 'climax' : undefined);
}
add(807, [['elite', 1], ['charger', 4], ['crawler', 14]], 0.14, 'climax');
add(852, [['crawler', 18], ['charger', 4], ['spitter', 4]], 0.12, 'climax');
// 870–897 不再刷密集大波，留短暂清场窗口迎接 897s 首领战

waves.sort((a, b) => a.t - b.t);
export const WAVES: readonly WaveDef[] = waves;

/** 首领前环境刷怪（稀疏补充，保证视野不空） */
export function trickleInterval(t: number): number {
  if (t < 42) return 0;
  if (t >= 870) return 0;
  if (t < 267) return 3.2;
  if (t < 582) return 2.2;
  return 1.5;
}
