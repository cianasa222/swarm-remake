/**
 * 无头自动试玩：用机器人跑完整时间线，验证两套 5 武器 + 6 被动进化构筑能否通关并输出关键数据。
 * 运行：npm run playtest            （默认每条构筑 3 个种子）
 *       npm run playtest -- 2 0.85  （2 个种子，机器人反应 0.85）
 */
import { Game, SimInput, hazardContains } from '../src/sim/game';
import { BOSS, ENEMIES, MATCH, PLAYER } from '../src/config';
import { len } from '../src/sim/math';
import { WEAPON_EVOLVED_LEVEL } from '../src/sim/weapons';
declare const process: { argv: string[] };

export type Build = 'haste_crit' | 'tank_aoe';

const PRIORITY: Record<Build, string[]> = {
  haste_crit: [
    'jinx_meow', 'uwu_blaster', 'crossbow', 'bunnymega', 'statikk',
    'haste', 'crit', 'projectiles', 'damage', 'maxHp', 'moveSpeed',
  ],
  tank_aoe: [
    'jinx_meow', 'cyclonic', 'radiant', 'mines', 'iceblast',
    'maxHp', 'hpRegen', 'area', 'armor', 'haste', 'damage',
  ],
};

const DIRS: [number, number][] = [[0, 0]];
for (let i = 0; i < 16; i++) DIRS.push([Math.cos((i / 16) * Math.PI * 2), Math.sin((i / 16) * Math.PI * 2)]);
const TS = [0.15, 0.3, 0.45, 0.65, 0.9];

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
  const fx = p.x + dx * speed * 0.6, fz = p.z + dz * speed * 0.6;
  for (const e of g.enemies) {
    const d = len(e.x - fx, e.z - fz);
    const keep = e.kind === 'boss' ? 9 : e.kind === 'elite' ? 5 : e.kind === 'charger' && e.state === 'windup' ? 6 : 3;
    if (d < keep + e.r) s += (keep + e.r - d) * (e.kind === 'boss' ? 3 : 1.2);
  }
  if (!g.map.isWalkable(fx, fz)) s += 35;
  return s;
}

function botInput(g: Game, skill: number): SimInput {
  const p = g.player;
  const speed = g.moveSpeed;
  let best = 0, bestS = Infinity;
  let tx = 0, tz = 0;
  let bd = 14;
  for (const c of g.accessCards) {
    const d = len(c.x - p.x, c.z - p.z);
    if (d < bd) { bd = d; tx = c.x; tz = c.z; }
  }
  if (bd >= 14) {
    for (const s of g.shards) {
      const d = len(s.x - p.x, s.z - p.z);
      if (d < bd) { bd = d; tx = s.x; tz = s.z; }
    }
  }
  for (const h of g.pickups) if (p.hp < p.maxHp * 0.85) { tx = h.x; tz = h.z; bd = len(h.x - p.x, h.z - p.z); }
  for (let i = 0; i < DIRS.length; i++) {
    const [dx, dz] = DIRS[i];
    let s = scoreDir(g, dx, dz, speed, false);
    if (bd < 14 && (dx || dz)) s -= ((dx * (tx - p.x) + dz * (tz - p.z)) / (bd || 1)) * 1.5;
    if (g.boss && g.boss.alive && (dx || dz)) {
      const bx = p.x - g.boss.x, bz = p.z - g.boss.z;
      const l = len(bx, bz) || 1;
      s -= ((dx * -bz + dz * bx) / l) * 0.6;
    }
    s += g.rand() * (1 - skill) * 40;
    if (s < bestS) { bestS = s; best = i; }
  }
  const [mx, mz] = DIRS[best];
  let dash = false;
  if (bestS > 60 && p.dashCd <= 0 && g.rand() < skill) {
    const dirX = mx || p.lastMoveX, dirZ = mz || p.lastMoveZ;
    if (scoreDir(g, dirX, dirZ, 4.6 / 0.22, true) < bestS * 0.5) dash = true;
  }
  let nearCount = 0, eliteNear = false;
  for (const e of g.enemies) {
    const d = len(e.x - p.x, e.z - p.z);
    if (d < 8) nearCount++;
    if ((e.kind === 'elite' || e.kind === 'boss') && d < 14) eliteNear = true;
  }
  const mine = p.eCd <= 0 && (nearCount >= 4 || eliteNear);
  const ult = p.rCd <= 0 && (eliteNear || nearCount >= 8);
  return { mx, mz, swap: false, mine, ult, dash };
}

export function run(build: Build, seed: number, skill = 0.85) {
  const g = new Game(seed);
  let steps = 0;
  let inp: SimInput = { mx: 0, mz: 0, swap: false, mine: false, ult: false, dash: false };
  const maxSteps = 60 * 60 * 25;
  let maxEnemies = 0, maxBullets = 0;
  while (steps < maxSteps && (g.state === 'play' || g.state === 'levelup')) {
    if (g.state === 'levelup') {
      const evoIdx = g.offer.findIndex((o) => o.kind === 'evolve');
      if (evoIdx >= 0) {
        g.chooseOffer(evoIdx);
        continue;
      }
      let bestIdx = 0, bestRank = 999;
      g.offer.forEach((o, i) => {
        const rank = PRIORITY[build].indexOf(o.id);
        const r = rank >= 0 ? rank : 100 + i;
        if (r < bestRank) { bestRank = r; bestIdx = i; }
      });
      g.chooseOffer(bestIdx);
      continue;
    }
    if (steps % 3 === 0) inp = botInput(g, skill);
    else inp = { ...inp, swap: false, mine: false, ult: false, dash: false };
    g.step(inp);
    g.events.length = 0;
    maxEnemies = Math.max(maxEnemies, g.enemies.length);
    maxBullets = Math.max(maxBullets, g.enemyBullets.length);
    steps++;
  }
  const s = g.stats;
  const evolvedCount = Object.values(g.player.weapons).filter((lv) => (lv ?? 0) >= WEAPON_EVOLVED_LEVEL).length;
  return {
    build, seed, result: g.state, time: Math.round(g.time), level: g.player.level,
    weapons: g.player.weaponOrder.length, passives: g.player.passiveOrder.length, evolved: evolvedCount,
    lvlAtBoss: s.bossLevel, hpAtBoss: s.bossHpAtStart,
    bossFight: s.bossDefeatedAt > 0 ? Math.round(s.bossDefeatedAt - s.bossReachedAt)
      : g.boss ? `x${Math.round(g.time - s.bossReachedAt)}s ${Math.round(((g.boss?.hp ?? 0) / BOSS.hp) * 100)}%` : '-',
    ovl: s.overloadCount, kills: g.kills, dmg: Math.round(s.damageTaken),
    maxE: maxEnemies, maxB: maxBullets,
  };
}

if (process.argv[1]?.includes('playtest')) {
  const n = Number(process.argv[2] ?? 3);
  const skill = Number(process.argv[3] ?? 0.85);
  const rows = [];
  for (const build of ['haste_crit', 'tank_aoe'] as Build[]) {
    for (let i = 0; i < n; i++) rows.push(run(build, 1000 + i * 17, skill));
  }
  console.table(rows);
  console.log('bossTime', MATCH.bossTime, 'skill', skill);
}
