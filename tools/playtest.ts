/**
 * 无头自动试玩：用机器人跑完整时间线，验证两条构筑能否通关并输出关键数据。
 * 运行：npm run playtest            （默认每条构筑 3 个种子）
 *       npm run playtest -- 6 0.8   （6 个种子，机器人反应 0.8）
 */
import { Game, SimInput, hazardContains } from '../src/sim/game';
import { UpgradeId } from '../src/sim/upgrades';
import { ARENA, BOSS, ENEMIES, MATCH, PLAYER, ULT } from '../src/config';
import { len } from '../src/sim/math';
declare const process: { argv: string[] };

export type Build = 'mg' | 'cn';

export const PRIORITY: Record<Build, UpgradeId[]> = {
  mg: ['mgRate', 'mgPierce', 'mgFocus', 'vitality', 'speed', 'overload', 'cooldown', 'magnet', 'mineCharge', 'mineArea', 'cnBlast', 'cnShards', 'cnPulse'],
  cn: ['cnBlast', 'cnShards', 'cnPulse', 'vitality', 'mineArea', 'mineCharge', 'speed', 'cooldown', 'magnet', 'overload', 'mgRate', 'mgPierce', 'mgFocus'],
};

const DIRS: [number, number][] = [[0, 0]];
for (let i = 0; i < 16; i++) DIRS.push([Math.cos((i / 16) * Math.PI * 2), Math.sin((i / 16) * Math.PI * 2)]);
const TS = [0.15, 0.3, 0.45, 0.65, 0.9];

/** 评估往某方向以给定速度移动后的危险分（越低越好） */
function scoreDir(g: Game, dx: number, dz: number, speed: number, dashing: boolean): number {
  const p = g.player;
  let s = 0;
  const pr = PLAYER.radius;
  for (const t of TS) {
    const tt = dashing ? Math.min(t, 0.22) : t;
    const x = p.x + dx * speed * tt, z = p.z + dz * speed * tt;
    const inv = dashing && t <= 0.18;
    const w = 1.3 - t;
    if (!g.map.isWalkable(x, z)) s += 140 * w;
    if (!inv) {
      for (const b of g.enemyBullets) {
        const bx = b.x + b.vx * t, bz = b.z + b.vz * t;
        if (Math.abs(bx - x) > 2 || Math.abs(bz - z) > 2) continue;
        const d = len(bx - x, bz - z);
        if (d < b.r + pr + 0.2) s += 100 * w;
        else if (d < b.r + pr + 0.7) s += 10 * w;
      }
      for (const h of g.hazards) {
        if (h.resolved || h.dmg <= 0) continue;
        const dtHit = h.t1 - g.time;
        if (dtHit < t + 0.35 && hazardContains(h, x, z, pr + 0.25)) s += 120 * (dtHit < t + 0.1 ? 1 : 0.5);
        else if (hazardContains(h, x, z, pr + 0.4)) s += 6;
      }
      for (const e of g.enemies) {
        const ex = e.x + (e.state === 'dash' ? e.dirX * (e.kind === 'elite' ? ENEMIES.elite.dashSpeed : ENEMIES.charger.dashSpeed) * t : e.vx * t);
        const ez = e.z + (e.state === 'dash' ? e.dirZ * (e.kind === 'elite' ? ENEMIES.elite.dashSpeed : ENEMIES.charger.dashSpeed) * t : e.vz * t);
        if (Math.abs(ex - x) > 4 || Math.abs(ez - z) > 4) continue;
        const d = len(ex - x, ez - z);
        if (d < e.r + pr + 0.25) s += 70 * w;
      }
    }
  }
  // 软项：期望站位
  const fx = p.x + dx * speed * 0.6, fz = p.z + dz * speed * 0.6;
  for (const e of g.enemies) {
    const d = len(e.x - fx, e.z - fz);
    const keep = e.kind === 'boss' ? 9 : e.kind === 'elite' ? 5 : e.kind === 'charger' && e.state === 'windup' ? 6 : 3;
    if (d < keep + e.r) s += (keep + e.r - d) * (e.kind === 'boss' ? 3 : 1.2);
    if ((e.kind === 'charger' || e.kind === 'elite') && e.state === 'windup') {
      // 冲锋路线
      const px = fx - e.x, pz = fz - e.z;
      const along = px * e.dirX + pz * e.dirZ;
      const side = Math.abs(px * -e.dirZ + pz * e.dirX);
      if (along > -1 && along < 12 && side < 1.6) s += 25;
    }
  }
  // 地形墙体避让
  if (!g.map.isWalkable(fx, fz)) s += 35;
  return s;
}

function botInput(g: Game, build: Build, skill: number): SimInput {
  const p = g.player;
  const speed = g.moveSpeed;
  let best = 0, bestS = Infinity;
  // 拾取吸引
  let tx = 0, tz = 0;
  let bd = 14;
  for (const s of g.shards) {
    const d = len(s.x - p.x, s.z - p.z);
    if (d < bd) { bd = d; tx = s.x; tz = s.z; }
  }
  for (const h of g.pickups) if (p.hp < p.maxHp * 0.85) { tx = h.x; tz = h.z; bd = len(h.x - p.x, h.z - p.z); }
  for (let i = 0; i < DIRS.length; i++) {
    const [dx, dz] = DIRS[i];
    let s = scoreDir(g, dx, dz, speed, false);
    if (bd < 14 && (dx || dz)) s -= ((dx * (tx - p.x) + dz * (tz - p.z)) / (bd || 1)) * 1.5;
    // 首领绕行
    if (g.boss && g.boss.alive && (dx || dz)) {
      const bx = p.x - g.boss.x, bz = p.z - g.boss.z;
      const l = len(bx, bz) || 1;
      s -= ((dx * -bz + dz * bx) / l) * 0.6;
    }
    // 反应误差
    s += g.rand() * (1 - skill) * 40;
    if (s < bestS) { bestS = s; best = i; }
  }
  const [mx, mz] = DIRS[best];
  // 闪避：当前最佳方向仍然危险，且冲刺方向更安全
  let dash = false;
  if (bestS > 60 && p.dashCd <= 0 && g.rand() < skill) {
    const dirX = mx || p.lastMoveX, dirZ = mz || p.lastMoveZ;
    if (scoreDir(g, dirX, dirZ, 4.6 / 0.22, true) < bestS * 0.5) dash = true;
  }
  let nearCount = 0, eliteNear = false;
  for (const e of g.enemies) {
    const d = len(e.x - p.x, e.z - p.z);
    if (d < 7) nearCount++;
    if ((e.kind === 'elite' || e.kind === 'boss') && d < 12) eliteNear = true;
  }
  let want: 'mg' | 'cn';
  if (build === 'mg') want = nearCount >= 10 && !eliteNear ? 'cn' : 'mg';
  else want = eliteNear && nearCount <= 5 ? 'mg' : 'cn';
  const swap = p.weapon !== want && p.swapT <= 0 && g.rand() < 0.04;
  const mine = nearCount >= 5 && g.rand() < 0.08;
  const ult = p.ult >= ULT.chargeNeeded && (eliteNear || nearCount >= 8);
  return { mx, mz, swap, mine, ult, dash };
}

export function run(build: Build, seed: number, skill = 0.85) {
  const g = new Game(seed);
  let steps = 0;
  let inp: SimInput = { mx: 0, mz: 0, swap: false, mine: false, ult: false, dash: false };
  const maxSteps = 60 * 60 * 25;
  let maxEnemies = 0, maxBullets = 0;
  const dmgBy: Record<number, number> = {};
  while (steps < maxSteps && (g.state === 'play' || g.state === 'levelup')) {
    if (g.state === 'levelup') {
      const pick = PRIORITY[build].find((id) => g.offer.includes(id)) ?? g.offer[0];
      g.chooseUpgrade(pick);
      continue;
    }
    if (steps % 3 === 0) inp = botInput(g, build, skill);
    else inp = { ...inp, swap: false, mine: false, ult: false, dash: false };
    g.step(inp);
    for (const ev of g.events) if (ev.type === 'playerHurt') dmgBy[ev.dmg] = (dmgBy[ev.dmg] ?? 0) + ev.dmg;
    g.events.length = 0;
    maxEnemies = Math.max(maxEnemies, g.enemies.length);
    maxBullets = Math.max(maxBullets, g.enemyBullets.length);
    steps++;
  }
  const s = g.stats;
  return {
    build, seed, result: g.state, time: Math.round(g.time), level: g.player.level,
    lvlT: s.levelTimes.slice(0, 3).join('/'),
    lvlAtBoss: s.bossLevel, hpAtBoss: s.bossHpAtStart,
    bossFight: s.bossDefeatedAt > 0 ? Math.round(s.bossDefeatedAt - s.bossReachedAt)
      : g.boss ? `x${Math.round(g.time - s.bossReachedAt)}s ${Math.round(((g.boss?.hp ?? 0) / BOSS.hp) * 100)}%` : '-',
    ult1: Math.round(s.firstUltAt), ovl: s.overloadCount, kills: g.kills, dmg: Math.round(s.damageTaken),
    mg: Math.round((s.weaponTime.mg / Math.max(1, s.weaponTime.mg + s.weaponTime.cn)) * 100) + '%',
    maxE: maxEnemies, maxB: maxBullets, dmgBy: JSON.stringify(dmgBy),
  };
}

if (process.argv[1]?.includes('playtest')) {
  const n = Number(process.argv[2] ?? 3);
  const skill = Number(process.argv[3] ?? 0.85);
  const rows = [];
  for (const build of ['mg', 'cn'] as Build[]) {
    for (let i = 0; i < n; i++) rows.push(run(build, 1000 + i * 17, skill));
  }
  console.table(rows);
  console.log('bossTime', MATCH.bossTime, 'skill', skill);
}
