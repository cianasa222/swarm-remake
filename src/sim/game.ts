/**
 * 战斗模拟核心。纯逻辑，不依赖 Three.js / DOM / 音频。
 * 渲染、音频、UI 通过读取状态与 events 列表实现解耦，便于后续移植微信小游戏。
 */
import {
  ARENA, BOSS, BUDGET, CANNON, DASH, ENEMIES, FOUNTAIN, MATCH, MG, MINE, OVERLOAD, PLAYER, SIM, SPAWN_RING, SUPPLY_BOX, SWAP, ULT, UPGRADES,
  XP, hpScale, xpForLevel,
} from '../config';
import { SpatialGrid } from './grid';
import { WalkableMap } from './map_grid';
import { angleDiff, clamp, distToSegment, len, makeRng, sweepCircle } from './math';
import { UPGRADE_BY_ID, UpgradeId, rollUpgrades } from './upgrades';
import { EnemyKind, WAVES, WaveDef, trickleInterval } from './waves';

export type Weapon = 'mg' | 'cn';
export type GameState = 'play' | 'levelup' | 'won' | 'lost';
export type Kind = EnemyKind | 'boss';

export interface SimInput {
  mx: number;
  mz: number;
  swap: boolean;
  mine: boolean;
  ult: boolean;
  dash: boolean;
}

export interface Enemy {
  id: number;
  kind: Kind;
  x: number; z: number;
  vx: number; vz: number;
  hp: number; maxHp: number;
  r: number;
  speed: number;
  alive: boolean;
  /** move | windup | dash | recover | enter | attack | window | transition */
  state: string;
  stateT: number;
  cd: number;
  dirX: number; dirZ: number;
  dashLeft: number;
  bindT: number;
  slowT: number;
  slowF: number;
  flash: number;
  age: number;
  /** 渲染用：朝向角 */
  face: number;
  hazardId: number;
}

export interface Projectile {
  kind: 'mg' | 'cn' | 'shard' | 'ult';
  x: number; z: number;
  vx: number; vz: number;
  r: number;
  dmg: number;
  travel: number;
  range: number;
  pierce: number;
  hits: number[];
  alive: boolean;
  /** mg 的强化外观 */
  tier: number;
}

export interface EnemyBullet {
  x: number; z: number; vx: number; vz: number; r: number; dmg: number; life: number; alive: boolean;
}

export type HazardKind = 'sector' | 'circle' | 'line';
export interface Hazard {
  id: number;
  kind: HazardKind;
  x: number; z: number;
  /** sector/circle 半径；line 长度 */
  r: number;
  /** 朝向角（sector 中线 / line 方向） */
  ang: number;
  /** 扇形全角 */
  arc: number;
  /** 线宽 */
  w: number;
  t0: number;
  t1: number;
  /** 0 表示纯预警（伤害由实体结算，如冲锋） */
  dmg: number;
  resolved: boolean;
  /** 结算后保留的显示时间 */
  linger: number;
}

export interface Shard { x: number; z: number; value: number; magnet: boolean; life: number; alive: boolean }
export interface Pickup { x: number; z: number; heal: number; alive: boolean; age: number }
export interface Mine {
  x: number; z: number; age: number; triggered: boolean; fieldT: number; alive: boolean; scale: number;
}

export interface FountainState {
  x: number;
  z: number;
  zoneRadius: number;
  state: 'ready' | 'charging' | 'cooldown';
  charge: number;
  cooldownLeft: number;
}

export interface SupplyBox {
  id: number;
  x: number;
  z: number;
  hp: number;
  maxHp: number;
  r: number;
  alive: boolean;
  flash: number;
  rotY: number;
  respawnT: number;
}

export interface WaveWarn { entrance: string; t: number; until: number; tag?: string }

export type GameEvent =
  | { type: 'shoot'; weapon: Weapon | 'ult'; x: number; z: number; ang: number; tier: number }
  | { type: 'hit'; x: number; z: number; kind: string; crit?: boolean }
  | { type: 'explode'; x: number; z: number; r: number; kind: 'cn' | 'ult' | 'mine' | 'pulse' | 'shard' }
  | { type: 'kill'; x: number; z: number; kind: Kind }
  | { type: 'playerHurt'; dmg: number }
  | { type: 'pickup'; kind: 'xp' | 'heal' }
  | { type: 'fountainHeal'; x: number; z: number; heal: number }
  | { type: 'fountainReady'; x: number; z: number }
  | { type: 'boxBreak'; x: number; z: number }
  | { type: 'levelUp'; level: number }
  | { type: 'swap'; weapon: Weapon }
  | { type: 'swapReady'; weapon: Weapon }
  | { type: 'mine'; x: number; z: number }
  | { type: 'dash'; x: number; z: number; dx: number; dz: number }
  | { type: 'overload'; on: boolean }
  | { type: 'ultReady' }
  | { type: 'waveWarn'; entrance: string; tag?: string }
  | { type: 'enemyCharge'; kind: string; x: number; z: number }
  | { type: 'enemyShoot'; x: number; z: number }
  | { type: 'hazardHit'; id: number; x: number; z: number; kind: HazardKind }
  | { type: 'bossWarn' }
  | { type: 'bossEnter' }
  | { type: 'bossLand'; x: number; z: number }
  | { type: 'bossAttack'; move: string }
  | { type: 'bossPhase' }
  | { type: 'bossDead'; x: number; z: number }
  | { type: 'cooldownReady'; what: 'mine' | 'dash' }
  | { type: 'victory' }
  | { type: 'defeat' };

export interface PlayerState {
  x: number; z: number;
  vx: number; vz: number;
  hp: number; maxHp: number;
  faceX: number; faceZ: number;
  lastMoveX: number; lastMoveZ: number;
  moving: boolean;
  weapon: Weapon;
  swapT: number;
  fireCd: number;
  mgStacks: number;
  mgTargetId: number;
  mgLastHit: number;
  mgRetargetUntil: number;
  targetId: number;
  mineCharges: number;
  mineCd: number;
  dashCd: number;
  dashT: number;
  dashX: number; dashZ: number;
  iframe: number;
  hurtT: number;
  overloadT: number;
  overloadCd: number;
  killTimes: number[];
  ult: number;
  ultReadyAnnounced: boolean;
  level: number;
  xp: number;
  recoil: number;
}

export interface MatchStats {
  time: number;
  kills: number;
  level: number;
  build: { id: UpgradeId; name: string; level: number }[];
  bossReachedAt: number;
  bossLevel: number;
  bossHpAtStart: number;
  bossDefeatedAt: number;
  overloadCount: number;
  ultCount: number;
  firstUltAt: number;
  levelTimes: number[];
  damageTaken: number;
  weaponTime: Record<Weapon, number>;
}

let _hid = 1;

export class Game {
  rand: () => number;
  state: GameState = 'play';
  time = 0;
  /** 模拟总步数（含首领战后），用于动画 */
  clock = 0;
  kills = 0;
  player!: PlayerState;
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];
  enemyBullets: EnemyBullet[] = [];
  hazards: Hazard[] = [];
  shards: Shard[] = [];
  pickups: Pickup[] = [];
  mines: Mine[] = [];
  fountain!: FountainState;
  boxes: SupplyBox[] = [];
  warnings: WaveWarn[] = [];
  events: GameEvent[] = [];
  upgrades: Partial<Record<UpgradeId, number>> = {};
  levelUpsTaken = 0;
  offer: UpgradeId[] = [];
  boss: Enemy | null = null;
  bossPhase = 1;
  bossSeq: { move: string; t: number }[] = [];
  bossCycle = 0;
  /** 首领入场演出强度 0..1，供渲染做浪涌与设备晃动 */
  bossAlarm = 0;
  stats: MatchStats;
  endDelay = -1;
  dev = { invincible: false };

  private waveIdx = 0;
  private spawnQueue: { t: number; kind: EnemyKind; entrance: string }[] = [];
  private trickleT = 0;
  private bossAddsT = 0;
  private bossWarned = false;
  private nextId = 1;
  private grid: SpatialGrid;
  readonly map = new WalkableMap();

  constructor(seed = Date.now() & 0xffff) {
    this.rand = makeRng(seed);
    this.grid = new SpatialGrid(-ARENA.halfW - 6, -ARENA.halfH - 6, ARENA.halfW + 6, ARENA.halfH + 6, 4, 512);
    this.stats = this.freshStats();
    this.reset(seed);
  }

  private freshStats(): MatchStats {
    return {
      time: 0, kills: 0, level: 1, build: [], bossReachedAt: -1, bossLevel: 0, bossHpAtStart: 0,
      bossDefeatedAt: -1, overloadCount: 0, ultCount: 0, firstUltAt: -1, levelTimes: [], damageTaken: 0,
      weaponTime: { mg: 0, cn: 0 },
    };
  }

  reset(seed = Date.now() & 0xffff) {
    this.rand = makeRng(seed);
    this.state = 'play';
    this.time = 0;
    this.clock = 0;
    this.kills = 0;
    this.enemies = [];
    this.projectiles = [];
    this.enemyBullets = [];
    this.hazards = [];
    this.shards = [];
    this.pickups = [];
    this.mines = [];
    this.fountain = {
      x: FOUNTAIN.x,
      z: FOUNTAIN.z,
      zoneRadius: FOUNTAIN.zoneRadius,
      state: 'ready',
      charge: 0,
      cooldownLeft: 0,
    };
    this.boxes = this.map.boxSpawns.map((s, idx) => ({
      id: idx + 1,
      x: s.wx,
      z: s.wz,
      hp: SUPPLY_BOX.hp,
      maxHp: SUPPLY_BOX.hp,
      r: SUPPLY_BOX.radius,
      alive: true,
      flash: 0,
      rotY: this.rand() * Math.PI * 2,
      respawnT: 0,
    }));
    this.warnings = [];
    this.events = [];
    this.upgrades = {};
    this.levelUpsTaken = 0;
    this.offer = [];
    this.boss = null;
    this.bossPhase = 1;
    this.bossSeq = [];
    this.bossCycle = 0;
    this.bossAlarm = 0;
    this.endDelay = -1;
    this.waveIdx = 0;
    this.spawnQueue = [];
    this.trickleT = 0;
    this.bossAddsT = 0;
    this.bossWarned = false;
    this.stats = this.freshStats();
    this.player = {
      x: this.map.playerSpawn.x, z: this.map.playerSpawn.z, vx: 0, vz: 0,
      hp: PLAYER.maxHp, maxHp: PLAYER.maxHp,
      faceX: 0, faceZ: -1, lastMoveX: 0, lastMoveZ: -1, moving: false,
      weapon: 'mg', swapT: 0, fireCd: 0.3,
      mgStacks: 0, mgTargetId: -1, mgLastHit: -10, mgRetargetUntil: 0, targetId: -1,
      mineCharges: MINE.charges, mineCd: 0, dashCd: 0, dashT: 0, dashX: 0, dashZ: 0,
      iframe: 0, hurtT: 0, overloadT: 0, overloadCd: 0, killTimes: [],
      ult: 0, ultReadyAnnounced: false, level: 1, xp: 0, recoil: 0,
    };
  }

  // ───────────────────────── 派生属性 ─────────────────────────
  lvl(id: UpgradeId) { return this.upgrades[id] ?? 0; }
  get xpNeed() { return xpForLevel(this.player.level); }
  get moveSpeed() {
    const p = this.player;
    return PLAYER.speed * (1 + UPGRADES.speed.mul * this.lvl('speed')) * (p.overloadT > 0 ? 1 + OVERLOAD.moveBonus : 1);
  }
  get pickupRadius() { return PLAYER.pickupRadius * (1 + UPGRADES.magnet.mul * this.lvl('magnet')); }
  get cdMul() { return 1 - UPGRADES.cooldown.mul * this.lvl('cooldown'); }
  get mineCharges() { return MINE.charges + (this.lvl('mineCharge') ? UPGRADES.mineCharge.add : 0); }
  get mineScale() { return 1 + UPGRADES.mineArea.mul * this.lvl('mineArea'); }
  get mgMaxStacks() { return Math.round((MG.maxRate - MG.baseRate) / MG.ratePerStack); }
  get mgRate() {
    const p = this.player;
    const base = MG.baseRate + Math.min(p.mgStacks, this.mgMaxStacks) * MG.ratePerStack;
    return base * (1 + (this.lvl('mgRate') ? UPGRADES.mgRate.rateMul : 0)) * (p.overloadT > 0 ? 1 + OVERLOAD.rateBonus : 1);
  }
  get cnRate() { return CANNON.rate * (this.player.overloadT > 0 ? 1 + OVERLOAD.rateBonus : 1); }
  get splashRadius() { return CANNON.splashRadius * (1 + (this.lvl('cnBlast') ? UPGRADES.cnBlast.radiusMul : 0)); }
  get overloadDuration() { return OVERLOAD.duration + UPGRADES.overload.duration * this.lvl('overload'); }
  get overloadCooldown() { return OVERLOAD.cooldown - UPGRADES.overload.cooldown * this.lvl('overload'); }
  get missionProgress() { return clamp(this.time / MATCH.bossTime, 0, 1); }

  // ───────────────────────── 主循环 ─────────────────────────
  step(input: SimInput) {
    const dt = SIM.dt;
    if (this.state !== 'play') return;
    this.clock += dt;
    if (this.endDelay >= 0) {
      this.endDelay -= dt;
      this.updateParticlesOnly(dt);
      if (this.endDelay < 0) this.finish();
      return;
    }
    this.time += dt;
    this.stats.weaponTime[this.player.weapon] += dt;

    this.updatePlayer(dt, input);
    this.updateSpawning(dt);
    this.rebuildGrid();
    this.updateEnemies(dt);
    this.updateBoss(dt);
    this.rebuildGrid();
    this.updateFiring(dt);
    this.updateProjectiles(dt);
    this.updateEnemyBullets(dt);
    this.updateHazards();
    this.updateMines(dt);
    this.updateFountain(dt);
    this.updateBoxes(dt);
    this.updateShards(dt);
    this.updatePickups(dt);
    this.compact();
    this.checkLevelUp();
    this.checkEnd();
  }

  private updateParticlesOnly(dt: number) {
    for (const b of this.enemyBullets) b.alive = false;
    this.hazards.length = 0;
    this.updateShards(dt);
    this.compact();
  }

  // ───────────────────────── 玩家 ─────────────────────────
  private updatePlayer(dt: number, inp: SimInput) {
    const p = this.player;
    p.iframe = Math.max(0, p.iframe - dt);
    p.hurtT = Math.max(0, p.hurtT - dt);
    p.recoil = Math.max(0, p.recoil - dt * 6);
    const prevMine = p.mineCd, prevDash = p.dashCd;
    if (p.mineCharges < this.mineCharges) {
      p.mineCd -= dt;
      if (p.mineCd <= 0) {
        p.mineCharges++;
        p.mineCd = p.mineCharges < this.mineCharges ? MINE.cooldown * this.cdMul : 0;
        this.events.push({ type: 'cooldownReady', what: 'mine' });
      }
    }
    if (p.dashCd > 0) {
      p.dashCd -= dt;
      if (p.dashCd <= 0 && prevDash > 0) this.events.push({ type: 'cooldownReady', what: 'dash' });
    }
    void prevMine;

    // 过载
    if (p.overloadT > 0) {
      p.overloadT -= dt;
      if (p.overloadT <= 0) this.events.push({ type: 'overload', on: false });
    }
    if (p.overloadCd > 0) p.overloadCd -= dt;

    // 换枪
    if (p.swapT > 0) {
      p.swapT -= dt;
      if (p.swapT <= 0) this.events.push({ type: 'swapReady', weapon: p.weapon });
    }
    if (inp.swap && p.swapT <= 0) {
      p.weapon = p.weapon === 'mg' ? 'cn' : 'mg';
      p.swapT = SWAP.time;
      p.fireCd = 0;
      p.mgStacks = 0;
      this.events.push({ type: 'swap', weapon: p.weapon });
    }

    // 移动输入
    let mx = inp.mx, mz = inp.mz;
    const ml = len(mx, mz);
    if (ml > 1) { mx /= ml; mz /= ml; }
    p.moving = ml > 0.12;
    if (p.moving) {
      const l = len(mx, mz);
      p.lastMoveX = mx / l;
      p.lastMoveZ = mz / l;
    }

    // 闪避
    if (inp.dash && p.dashCd <= 0 && p.dashT <= 0) {
      p.dashX = p.moving ? p.lastMoveX : p.lastMoveX;
      p.dashZ = p.moving ? p.lastMoveZ : p.lastMoveZ;
      p.dashT = DASH.duration;
      p.iframe = Math.max(p.iframe, DASH.iframes);
      p.dashCd = DASH.cooldown * this.cdMul;
      this.events.push({ type: 'dash', x: p.x, z: p.z, dx: p.dashX, dz: p.dashZ });
    }

    if (p.dashT > 0) {
      const sp = DASH.distance / DASH.duration;
      p.vx = p.dashX * sp;
      p.vz = p.dashZ * sp;
      p.dashT -= dt;
      if (p.dashT <= 0) { p.dashT = 0; p.vx = 0; p.vz = 0; }
    } else {
      const sp = this.moveSpeed;
      p.vx = p.moving ? mx * sp : 0;
      p.vz = p.moving ? mz * sp : 0;
    }
    p.x += p.vx * dt;
    p.z += p.vz * dt;
    this.collideStatic(p, PLAYER.radius, true);

    // 地雷：移动方向优先，否则朝向
    if (inp.mine && p.mineCharges > 0) {
      const dx = p.moving ? p.lastMoveX : p.faceX;
      const dz = p.moving ? p.lastMoveZ : p.faceZ;
      const mx2 = clamp(p.x + dx * MINE.placeDist, -ARENA.halfW, ARENA.halfW);
      const mz2 = clamp(p.z + dz * MINE.placeDist, -ARENA.halfH, ARENA.halfH);
      const active = this.mines.filter((m) => m.alive && !m.triggered);
      if (active.length >= MINE.maxActive) active[0].alive = false;
      this.mines.push({ x: mx2, z: mz2, age: 0, triggered: false, fieldT: 0, alive: true, scale: this.mineScale });
      if (p.mineCharges === this.mineCharges) p.mineCd = MINE.cooldown * this.cdMul;
      p.mineCharges--;
      this.events.push({ type: 'mine', x: mx2, z: mz2 });
    }

    // 大招
    if (inp.ult && p.ult >= ULT.chargeNeeded) this.fireUlt();
  }

  /** 与场景边界和仓库区 180x180 可行走栅格障碍的碰撞（玩家与敌人共用） */
  private collideStatic(e: { x: number; z: number }, r: number, _strictBounds?: boolean) {
    this.map.resolveCircle(e, r);
  }

  hurtPlayer(dmg: number) {
    const p = this.player;
    if (p.iframe > 0 || this.dev.invincible || this.endDelay >= 0) return false;
    p.hp -= dmg;
    p.iframe = PLAYER.hurtIFrames;
    p.hurtT = 0.3;
    this.stats.damageTaken += dmg;
    this.events.push({ type: 'playerHurt', dmg });
    return true;
  }

  // ───────────────────────── 刷怪 ─────────────────────────
  private updateSpawning(dt: number) {
    const t = this.time;
    // 波次预警与入队
    while (this.waveIdx < WAVES.length && WAVES[this.waveIdx].t - MATCH.waveWarn <= t) {
      const w = WAVES[this.waveIdx++];
      this.queueWave(w);
    }
    // 环境补充（围绕玩家外圈可行走区）
    const ti = trickleInterval(t);
    if (ti > 0 && !this.boss) {
      this.trickleT -= dt;
      if (this.trickleT <= 0) {
        this.trickleT = ti;
        const r = this.rand();
        const kind: EnemyKind = t > 267 && r < 0.22 ? 'charger' : t > 87 && r < 0.42 ? 'spitter' : 'crawler';
        this.queueWave({ t: t + MATCH.waveWarn, entrance: 'RING', units: [[kind, 2]], spacing: 0.3 });
      }
    }
    // 首领
    if (!this.bossWarned && t >= MATCH.bossTime - 5) {
      this.bossWarned = true;
      this.events.push({ type: 'bossWarn' });
      this.warnings.push({ entrance: 'RING', t, until: MATCH.bossTime + 1, tag: 'boss' });
    }
    if (!this.boss && t >= MATCH.bossTime) this.spawnBoss();
    if (this.boss && this.boss.alive && this.boss.state !== 'enter') {
      this.bossAddsT -= dt;
      if (this.bossAddsT <= 0) {
        this.bossAddsT = BOSS.addsInterval;
        this.queueWave({
          t: t + MATCH.waveWarn, entrance: 'RING',
          units: [['crawler', BOSS.addsCount]], spacing: 0.25,
        });
      }
    }
    // 出队
    const alive = this.enemies.length;
    let budget = BUDGET.maxEnemies - alive;
    for (let i = 0; i < this.spawnQueue.length && budget > 0; i++) {
      const s = this.spawnQueue[i];
      if (s.t <= t) {
        this.spawnEnemy(s.kind, s.entrance);
        this.spawnQueue.splice(i--, 1);
        budget--;
      }
    }
    this.warnings = this.warnings.filter((w) => w.until > t);
  }

  private queueWave(w: WaveDef) {
    this.warnings.push({ entrance: w.entrance, t: this.time, until: w.t + 0.4, tag: w.tag });
    this.events.push({ type: 'waveWarn', entrance: w.entrance, tag: w.tag });
    let k = 0;
    for (const [kind, n] of w.units) {
      for (let i = 0; i < n; i++) this.spawnQueue.push({ t: w.t + (k++) * w.spacing, kind, entrance: w.entrance });
    }
  }

  private makeEnemy(kind: Kind, x: number, z: number): Enemy {
    const scale = kind === 'boss' ? 1 : hpScale(this.time);
    const base = kind === 'boss' ? { hp: BOSS.hp, speed: BOSS.speed, radius: BOSS.radius } : ENEMIES[kind];
    const hp = base.hp * scale;
    return {
      id: this.nextId++, kind, x, z, vx: 0, vz: 0, hp, maxHp: hp, r: base.radius,
      speed: base.speed * (0.92 + this.rand() * 0.16), alive: true, state: 'move', stateT: 0,
      cd: 1 + this.rand() * 2, dirX: 0, dirZ: 0, dashLeft: 0, bindT: 0, slowT: 0, slowF: 1, flash: 0,
      age: 0, face: 0, hazardId: 0,
    };
  }

  private spawnEnemy(kind: EnemyKind, _entrance: string) {
    const pos = this.map.findWalkableAround(this.player.x, this.player.z, SPAWN_RING.inner, SPAWN_RING.outer, this.rand);
    this.enemies.push(this.makeEnemy(kind, pos.x, pos.z));
  }

  private spawnBoss() {
    // 对齐原版：玩家传送至东北首领竞技场，首领在 RekSaiSpawnPoint 破土登场
    const arena = this.map.landmarks.bossArena;
    const sp = this.map.landmarks.reksaiSpawn;
    this.player.x = arena.wx;
    this.player.z = arena.wz;
    this.map.resolveCircle(this.player, PLAYER.radius);
    for (const o of this.enemies) {
      if (o.alive && len(o.x - arena.wx, o.z - arena.wz) > 26) o.alive = false;
    }
    for (const eb of this.enemyBullets) eb.alive = false;

    const b = this.makeEnemy('boss', sp.wx, sp.wz);
    b.state = 'enter';
    b.stateT = 0;
    this.boss = b;
    this.enemies.push(b);
    this.stats.bossReachedAt = this.time;
    this.stats.bossLevel = this.player.level;
    this.stats.bossHpAtStart = Math.round(this.player.hp);
    this.events.push({ type: 'bossEnter' });
  }

  // ───────────────────────── 网格 ─────────────────────────
  private rebuildGrid() {
    this.grid.clear();
    const es = this.enemies;
    for (let i = 0; i < es.length; i++) {
      const e = es[i];
      if (e.alive && e.kind !== 'boss') this.grid.insert(i, e.x, e.z);
    }
  }

  /** 查询与圆相交的存活敌人（含首领） */
  forEnemiesInCircle(x: number, z: number, r: number, cb: (e: Enemy) => void) {
    const m = r + 1.2;
    this.grid.query(x - m, z - m, x + m, z + m, (i) => {
      const e = this.enemies[i];
      if (e.alive && len(e.x - x, e.z - z) < r + e.r) cb(e);
    });
    const b = this.boss;
    if (b && b.alive && len(b.x - x, b.z - z) < r + b.r) cb(b);
  }

  // ───────────────────────── 敌人 ─────────────────────────
  private updateEnemies(dt: number) {
    const p = this.player;
    const es = this.enemies;
    for (let i = 0; i < es.length; i++) {
      const e = es[i];
      if (!e.alive || e.kind === 'boss') continue;
      e.age += dt;
      e.flash = Math.max(0, e.flash - dt * 6);
      if (e.slowT > 0) { e.slowT -= dt; if (e.slowT <= 0) e.slowF = 1; }
      const dx = p.x - e.x, dz = p.z - e.z;
      const d = len(dx, dz) || 1e-4;
      // 原版 TeleportDistance：离玩家过远（>30m）时重新传送到视野外圈 [20m, 23m]
      if (!this.boss && d > SPAWN_RING.maxDist) {
        if (e.hazardId) this.cancelWindup(e);
        const np = this.map.findWalkableAround(p.x, p.z, SPAWN_RING.inner, SPAWN_RING.outer, this.rand);
        e.x = np.x;
        e.z = np.z;
        continue;
      }
      const ux = dx / d, uz = dz / d;
      let speed = e.speed * e.slowF;
      let wantX = ux, wantZ = uz;
      if (e.bindT > 0) {
        e.bindT -= dt;
        if (e.state === 'windup') this.cancelWindup(e);
        e.vx = 0; e.vz = 0;
        continue;
      }
      e.cd -= dt;
      if (e.kind === 'spitter') {
        const S = ENEMIES.spitter;
        if (e.state === 'windup') {
          e.stateT -= dt;
          speed = 0;
          if (e.stateT <= 0) {
            e.state = 'move';
            e.cd = S.cooldown * (0.85 + this.rand() * 0.3);
            this.spitterFire(e, ux, uz);
          }
        } else {
          if (d < S.keepDist - 1) { wantX = -ux; wantZ = -uz; speed *= 0.7; }
          else if (d < S.keepDist + 1) { wantX = -uz; wantZ = ux; speed *= 0.4; }
          if (e.cd <= 0 && d < 12 && e.age > 1.2) {
            e.state = 'windup';
            e.stateT = S.windup;
            this.events.push({ type: 'enemyCharge', kind: 'spitter', x: e.x, z: e.z });
          }
        }
      } else if (e.kind === 'charger' || e.kind === 'elite') {
        const C = e.kind === 'elite' ? ENEMIES.elite : ENEMIES.charger;
        if (e.state === 'windup') {
          speed = 0;
          e.stateT -= dt;
          if (e.stateT <= 0) {
            e.state = 'dash';
            e.dashLeft = C.dashLen;
          }
        } else if (e.state === 'dash') {
          const step = C.dashSpeed * dt;
          e.x += e.dirX * step;
          e.z += e.dirZ * step;
          e.dashLeft -= step;
          if (len(p.x - e.x, p.z - e.z) < C.dashWidth / 2 + PLAYER.radius) this.hurtPlayer(C.dashDamage);
          if (e.dashLeft <= 0) {
            e.state = 'recover';
            e.stateT = 0.5;
            this.removeHazard(e.hazardId);
          }
          this.collideStatic(e, e.r, e.age > 3);
          continue;
        } else if (e.state === 'recover') {
          e.stateT -= dt;
          speed *= 0.3;
          if (e.stateT <= 0) { e.state = 'move'; e.cd = C.cooldown * (0.8 + this.rand() * 0.4); }
        } else if (e.cd <= 0 && d < C.triggerDist && e.age > 1.5) {
          e.state = 'windup';
          e.stateT = C.windup;
          e.dirX = ux; e.dirZ = uz;
          e.face = Math.atan2(ux, uz);
          const h = this.addHazard({
            kind: 'line', x: e.x, z: e.z, r: C.dashLen, ang: Math.atan2(uz, ux), arc: 0, w: C.dashWidth,
            t0: this.time, t1: this.time + C.windup, dmg: 0, linger: C.dashLen / C.dashSpeed,
          });
          e.hazardId = h.id;
          this.events.push({ type: 'enemyCharge', kind: e.kind, x: e.x, z: e.z });
        }
      }
      // 移动 + 分离
      let sx = 0, sz = 0;
      const rr = e.r * 2.2;
      this.grid.query(e.x - rr, e.z - rr, e.x + rr, e.z + rr, (j) => {
        if (j === i) return;
        const o = es[j];
        if (!o.alive) return;
        const ox = e.x - o.x, oz = e.z - o.z;
        const od = len(ox, oz);
        const min = e.r + o.r;
        if (od < min && od > 1e-4) {
          const f = (min - od) / min;
          sx += (ox / od) * f;
          sz += (oz / od) * f;
        }
      });
      e.vx = wantX * speed + sx * 3;
      e.vz = wantZ * speed + sz * 3;
      e.x += e.vx * dt;
      e.z += e.vz * dt;
      if (e.state !== 'windup') e.face = Math.atan2(wantX, wantZ);
      if (e.state === 'windup' && e.kind === 'spitter') e.face = Math.atan2(ux, uz);
      const inside = Math.abs(e.x) < ARENA.halfW - e.r && Math.abs(e.z) < ARENA.halfH - e.r;
      this.collideStatic(e, e.r, inside && e.age > 0.5);
      // 接触伤害
      if (d < e.r + PLAYER.radius) {
        const c = (ENEMIES as Record<string, { contact: number }>)[e.kind].contact;
        this.hurtPlayer(c);
      }
    }
  }

  private cancelWindup(e: Enemy) {
    e.state = 'move';
    e.cd = 1.2;
    if (e.hazardId) this.removeHazard(e.hazardId);
  }

  private spitterFire(e: Enemy, ux: number, uz: number) {
    const S = ENEMIES.spitter;
    // 生成前限额：首领战为潮门预留弹幕额度
    const reserve = this.boss ? BOSS.ring.count * 2 : 0;
    if (this.enemyBullets.length + S.bullets > BUDGET.maxEnemyBullets - reserve) return;
    const base = Math.atan2(uz, ux);
    const spread = (S.spreadDeg * Math.PI) / 180;
    for (let k = 0; k < S.bullets; k++) {
      const a = base + (k / (S.bullets - 1) - 0.5) * spread;
      this.enemyBullets.push({
        x: e.x, z: e.z, vx: Math.cos(a) * S.bulletSpeed, vz: Math.sin(a) * S.bulletSpeed,
        r: S.bulletRadius, dmg: S.bulletDamage, life: S.bulletLife, alive: true,
      });
    }
    this.events.push({ type: 'enemyShoot', x: e.x, z: e.z });
  }

  // ───────────────────────── 首领 ─────────────────────────
  private updateBoss(dt: number) {
    const b = this.boss;
    if (!b || !b.alive) return;
    const p = this.player;
    b.flash = Math.max(0, b.flash - dt * 6);
    b.stateT += dt;
    const dx = p.x - b.x, dz = p.z - b.z;
    const d = len(dx, dz) || 1e-4;
    this.bossAlarm = Math.max(0, this.bossAlarm - dt * 0.4);

    if (b.state === 'enter') {
      const T = BOSS.entranceTime;
      const sp = this.map.landmarks.reksaiSpawn;
      this.bossAlarm = 1;
      b.x = sp.wx;
      b.z = sp.wz;
      b.face = Math.atan2(dx, dz);
      if (b.stateT >= T) {
        b.state = 'window';
        b.stateT = 0;
        b.cd = 1.2;
        this.events.push({ type: 'bossLand', x: b.x, z: b.z });
        // 落地冲击推开玩家
        if (d < 5) {
          p.x += (dx / d) * 2;
          p.z += (dz / d) * 2;
          this.map.resolveCircle(p, PLAYER.radius);
        }
      }
      return;
    }
    if (b.state === 'transition') {
      if (b.stateT >= 2) { b.state = 'window'; b.stateT = 0; b.cd = 0.8; }
      return;
    }
    // 面向玩家（攻击中锁定）
    if (b.state !== 'attack') b.face = Math.atan2(dx, dz);

    if (b.state === 'window') {
      // 输出窗口：缓慢逼近
      const sp = (d > 5 ? BOSS.speed : 0) * (this.bossPhase === 2 ? 1.15 : 1);
      b.x += (dx / d) * sp * dt;
      b.z += (dz / d) * sp * dt;
      this.collideStatic(b, b.r, true);
      b.cd -= dt;
      if (b.cd <= 0) this.startBossCombo();
    } else if (b.state === 'attack') {
      // 依序执行招式
      while (this.bossSeq.length && this.bossSeq[0].t <= b.stateT) {
        const m = this.bossSeq.shift()!;
        this.bossMove(m.move);
      }
      if (!this.bossSeq.length && b.stateT > b.dashLeft) {
        b.state = 'window';
        b.stateT = 0;
        b.cd = BOSS.window[this.bossPhase - 1];
      }
    }
    if (d < b.r + PLAYER.radius) this.hurtPlayer(BOSS.contact);
  }

  /** 招式组合：阶段一单招，阶段二两两组合；每组后留输出窗口 */
  private startBossCombo() {
    const b = this.boss!;
    const P1 = [['sweep'], ['stomp'], ['ring'], ['sweep'], ['ring'], ['stomp']];
    const P2 = [['sweep', 'ring'], ['stomp', 'sweep'], ['ring', 'stomp'], ['ring', 'ring2'], ['stomp', 'ring']];
    const list = this.bossPhase === 1 ? P1 : P2;
    const combo = list[this.bossCycle++ % list.length];
    const haste = this.bossPhase === 2 ? BOSS.phase2Haste : 1;
    const dur: Record<string, number> = { sweep: 1.9, stomp: 2.4, ring: 1.6, ring2: 1.6 };
    let t = 0;
    this.bossSeq = [];
    for (const m of combo) {
      this.bossSeq.push({ move: m, t });
      t += dur[m] * haste;
    }
    b.state = 'attack';
    b.stateT = 0;
    b.dashLeft = t + 0.3; // 本组总时长
  }

  /** 当前首领动画状态，供渲染：move 名称与 0..1 进度 */
  bossAnim = { move: '', t0: 0, dur: 1 };

  private bossMove(move: string) {
    const b = this.boss!;
    const p = this.player;
    const now = this.time;
    this.events.push({ type: 'bossAttack', move });
    if (move === 'sweep') {
      const S = BOSS.sweep;
      const ang = Math.atan2(p.z - b.z, p.x - b.x);
      b.face = Math.atan2(p.x - b.x, p.z - b.z);
      this.addHazard({
        kind: 'sector', x: b.x, z: b.z, r: S.radius, ang, arc: (S.arcDeg * Math.PI) / 180, w: 0,
        t0: now, t1: now + S.windup, dmg: S.damage, linger: 0.35,
      });
      this.bossAnim = { move: 'sweep', t0: now, dur: S.windup + 0.4 };
    } else if (move === 'stomp') {
      const S = BOSS.stomp;
      // 沿玩家前进路线附近：用当前速度预判；静止时沿首领→玩家方向延伸
      let dx = p.vx, dz = p.vz;
      const v = len(dx, dz);
      if (v < 0.5) { dx = p.x - b.x; dz = p.z - b.z; }
      const l = len(dx, dz) || 1;
      dx /= l; dz /= l;
      for (let i = 0; i < 3; i++) {
        const t1 = now + S.firstDelay + i * S.gap;
        const lead = v >= 0.5 ? v * S.lead * (i + 1) * 0.6 : 0;
        const x = clamp(p.x + dx * (lead + (i - 0.5) * S.spacing * 0.8), -ARENA.halfW + 1, ARENA.halfW - 1);
        const z = clamp(p.z + dz * (lead + (i - 0.5) * S.spacing * 0.8), -ARENA.halfH + 1, ARENA.halfH - 1);
        this.addHazard({
          kind: 'circle', x, z, r: S.radius, ang: 0, arc: 0, w: 0, t0: now + i * 0.12, t1, dmg: S.damage, linger: 0.3,
        });
      }
      this.bossAnim = { move: 'stomp', t0: now, dur: S.firstDelay + 2 * S.gap + 0.3 };
    } else if (move === 'ring' || move === 'ring2') {
      const R = BOSS.ring;
      const toP = Math.atan2(p.z - b.z, p.x - b.x);
      // 缺口偏离玩家方向 35–80 度，迫使玩家走位进缺口
      const off = ((35 + this.rand() * 45) * Math.PI) / 180 * (this.rand() < 0.5 ? -1 : 1);
      const gapCenter = move === 'ring2' ? toP - off : toP + off;
      const gap = (R.gapDeg * Math.PI) / 180;
      const delay = 0.55;
      this.bossAnim = { move: 'ring', t0: now, dur: delay + 0.3 };
      // 潮门是延迟发射：先放一个短促的环形预警（纯显示）
      this.addHazard({
        kind: 'circle', x: b.x, z: b.z, r: b.r + 0.6, ang: gapCenter, arc: gap, w: 0,
        t0: now, t1: now + delay, dmg: 0, linger: 0,
      });
      this.pendingRings.push({ at: now + delay, gapCenter, gap });
    }
  }

  pendingRings: { at: number; gapCenter: number; gap: number }[] = [];

  private fireRings() {
    const b = this.boss;
    if (!b || !b.alive) { this.pendingRings.length = 0; return; }
    for (let i = 0; i < this.pendingRings.length; i++) {
      const r = this.pendingRings[i];
      if (r.at > this.time) continue;
      this.pendingRings.splice(i--, 1);
      const R = BOSS.ring;
      const free = BUDGET.maxEnemyBullets - this.enemyBullets.length;
      const count = Math.min(R.count, Math.max(12, free));
      for (let k = 0; k < count; k++) {
        const a = (k / count) * Math.PI * 2;
        if (Math.abs(angleDiff(a, r.gapCenter)) < r.gap / 2) continue;
        this.enemyBullets.push({
          x: b.x + Math.cos(a) * b.r, z: b.z + Math.sin(a) * b.r,
          vx: Math.cos(a) * R.speed, vz: Math.sin(a) * R.speed,
          r: R.radius, dmg: R.damage, life: R.life, alive: true,
        });
      }
      this.events.push({ type: 'enemyShoot', x: b.x, z: b.z });
    }
  }

  // ───────────────────────── 危险区 ─────────────────────────
  addHazard(h: Omit<Hazard, 'id' | 'resolved'>): Hazard {
    const hz: Hazard = { ...h, id: _hid++, resolved: false };
    this.hazards.push(hz);
    return hz;
  }
  removeHazard(id: number) {
    const i = this.hazards.findIndex((h) => h.id === id);
    if (i >= 0) this.hazards.splice(i, 1);
  }

  private updateHazards() {
    this.fireRings();
    const p = this.player;
    for (let i = 0; i < this.hazards.length; i++) {
      const h = this.hazards[i];
      if (!h.resolved && this.time >= h.t1) {
        h.resolved = true;
        if (h.dmg > 0) {
          this.events.push({ type: 'hazardHit', id: h.id, x: h.x, z: h.z, kind: h.kind });
          if (hazardContains(h, p.x, p.z, PLAYER.radius)) this.hurtPlayer(h.dmg);
        }
      }
      if (h.resolved && this.time >= h.t1 + h.linger) this.hazards.splice(i--, 1);
    }
  }

  // ───────────────────────── 射击 ─────────────────────────
  private findAimTarget(): { id: number; x: number; z: number; isBox: boolean } | null {
    const p = this.player;
    let best: Enemy | null = null;
    let bd = PLAYER.targetRange;
    let cur: Enemy | null = null;
    for (const e of this.enemies) {
      if (!e.alive || (e.kind === 'boss' && e.state === 'enter')) continue;
      const d = len(e.x - p.x, e.z - p.z) - e.r * 0.5;
      if (e.id === p.targetId) cur = e;
      if (d < bd) { bd = d; best = e; }
    }
    // 轻微粘滞：当前目标仍在射程且不比最近者远太多则保持，避免抖动掉层
    if (cur && best && cur !== best) {
      const dc = len(cur.x - p.x, cur.z - p.z) - cur.r * 0.5;
      if (dc < PLAYER.targetRange && dc < bd * 1.2 + 0.3) best = cur;
    }
    if (best && bd < 7.5) return { id: best.id, x: best.x, z: best.z, isBox: false };

    // 周围 7.5m 内无近身怪物时，优先顺手打碎附近 7.5m 的补给箱
    let nearBox: SupplyBox | null = null;
    let bbd = 7.5;
    for (const box of this.boxes) {
      if (!box.alive) continue;
      const d = len(box.x - p.x, box.z - p.z);
      if (d < bbd) { bbd = d; nearBox = box; }
    }
    if (nearBox) return { id: -nearBox.id, x: nearBox.x, z: nearBox.z, isBox: true };
    if (best) return { id: best.id, x: best.x, z: best.z, isBox: false };
    return null;
  }

  private updateFiring(dt: number) {
    const p = this.player;
    const target = this.findAimTarget();
    p.targetId = target && !target.isBox ? target.id : -1;
    if (target) {
      const dx = target.x - p.x, dz = target.z - p.z;
      const l = len(dx, dz) || 1;
      p.faceX = dx / l; p.faceZ = dz / l;
    } else if (p.moving) {
      p.faceX = p.lastMoveX; p.faceZ = p.lastMoveZ;
    }
    // 机枪掉层
    if (p.weapon === 'mg') {
      if (target && target.id !== p.mgTargetId) {
        p.mgTargetId = target.id;
        p.mgRetargetUntil = this.time + 0.5;
      }
      const decaying = this.time < p.mgRetargetUntil || this.time - p.mgLastHit > MG.stackGrace;
      if (decaying && p.mgStacks > 0) {
        const rate = MG.stackDecay * (this.lvl('mgRate') ? 0.5 : 1);
        p.mgStacks = Math.max(0, p.mgStacks - rate * dt);
      }
    }
    p.fireCd -= dt;
    if (!target || p.swapT > 0 || p.dashT > 0) return;
    if (p.fireCd > 0) return;
    const ang = Math.atan2(p.faceZ, p.faceX);
    if (p.weapon === 'mg') {
      p.fireCd += 1 / this.mgRate;
      if (p.fireCd < 0) p.fireCd = 0;
      const spread = (this.rand() - 0.5) * 0.06;
      const a = ang + spread;
      const full = p.mgStacks >= this.mgMaxStacks - 0.01;
      const tier = (this.lvl('mgPierce') ? 1 : 0) + (this.lvl('mgFocus') && full ? 1 : 0);
      if (this.projectiles.length < BUDGET.maxPlayerProjectiles) {
        this.projectiles.push({
          kind: 'mg', x: p.x + Math.cos(a) * 0.6, z: p.z + Math.sin(a) * 0.6,
          vx: Math.cos(a) * MG.bulletSpeed, vz: Math.sin(a) * MG.bulletSpeed,
          r: MG.bulletRadius, dmg: MG.damage + (this.lvl('mgPierce') ? UPGRADES.mgPierce.dmg : 0),
          travel: 0, range: MG.range + 1, pierce: this.lvl('mgPierce') ? UPGRADES.mgPierce.pierce : 0,
          hits: [], alive: true, tier,
        });
      }
      p.recoil = Math.min(1, p.recoil + 0.35);
      this.events.push({ type: 'shoot', weapon: 'mg', x: p.x, z: p.z, ang: a, tier });
    } else {
      p.fireCd += 1 / this.cnRate;
      if (p.fireCd < 0) p.fireCd = 0;
      const dist = clamp(len(target.x - p.x, target.z - p.z), 2, CANNON.range);
      this.projectiles.push({
        kind: 'cn', x: p.x + Math.cos(ang) * 0.7, z: p.z + Math.sin(ang) * 0.7,
        vx: Math.cos(ang) * CANNON.shellSpeed, vz: Math.sin(ang) * CANNON.shellSpeed,
        r: CANNON.shellRadius, dmg: CANNON.directDamage, travel: 0, range: dist + 0.6, pierce: 0,
        hits: [], alive: true, tier: (this.lvl('cnBlast') ? 1 : 0) + (this.lvl('cnShards') ? 1 : 0) + (this.lvl('cnPulse') ? 1 : 0),
      });
      p.recoil = 1;
      this.events.push({ type: 'shoot', weapon: 'cn', x: p.x, z: p.z, ang, tier: 0 });
    }
  }

  private fireUlt() {
    const p = this.player;
    let dx: number, dz: number;
    const t = this.enemies.find((e) => e.id === p.targetId && e.alive);
    if (p.moving) { dx = p.lastMoveX; dz = p.lastMoveZ; }
    else if (t) { const l = len(t.x - p.x, t.z - p.z) || 1; dx = (t.x - p.x) / l; dz = (t.z - p.z) / l; }
    else { dx = p.faceX; dz = p.faceZ; }
    p.ult = 0;
    p.ultReadyAnnounced = false;
    this.projectiles.push({
      kind: 'ult', x: p.x + dx * 0.8, z: p.z + dz * 0.8, vx: dx * ULT.speed, vz: dz * ULT.speed,
      r: ULT.radius, dmg: ULT.pierceDamage, travel: 0, range: ULT.range, pierce: 999, hits: [], alive: true, tier: 0,
    });
    p.recoil = 1;
    this.stats.ultCount++;
    if (this.stats.firstUltAt < 0) this.stats.firstUltAt = this.time;
    this.events.push({ type: 'shoot', weapon: 'ult', x: p.x, z: p.z, ang: Math.atan2(dz, dx), tier: 0 });
  }

  // ───────────────────────── 投射物（连续碰撞） ─────────────────────────
  private updateProjectiles(dt: number) {
    const cands: { e: Enemy; t: number }[] = [];
    for (const pr of this.projectiles) {
      if (!pr.alive) continue;
      const x0 = pr.x, z0 = pr.z;
      let stepLen = len(pr.vx, pr.vz) * dt;
      let endByRange = false;
      if (pr.travel + stepLen >= pr.range) { stepLen = pr.range - pr.travel; endByRange = true; }
      const sp = len(pr.vx, pr.vz) || 1;
      const x1 = x0 + (pr.vx / sp) * stepLen, z1 = z0 + (pr.vz / sp) * stepLen;
      // 候选：线段 AABB 扩展
      cands.length = 0;
      const m = pr.r + 1.2;
      this.grid.query(Math.min(x0, x1) - m, Math.min(z0, z1) - m, Math.max(x0, x1) + m, Math.max(z0, z1) + m, (i) => {
        const e = this.enemies[i];
        if (!e.alive || pr.hits.includes(e.id)) return;
        const t = sweepCircle(x0, z0, x1, z1, pr.r, e.x, e.z, e.r);
        if (t >= 0) cands.push({ e, t });
      });
      const b = this.boss;
      if (b && b.alive && b.state !== 'enter' && !pr.hits.includes(b.id)) {
        const t = sweepCircle(x0, z0, x1, z1, pr.r, b.x, b.z, b.r);
        if (t >= 0) cands.push({ e: b, t });
      }
      cands.sort((a, c) => a.t - c.t);
      let stopT = -1;
      for (const { e, t } of cands) {
        const hx = x0 + (x1 - x0) * t, hz = z0 + (z1 - z0) * t;
        if (pr.kind === 'mg' || pr.kind === 'shard') {
          this.damageEnemy(e, this.mgDamageAgainst(pr, e), pr.kind);
          if (pr.kind === 'mg' && e.id === this.player.mgTargetId && this.time >= this.player.mgRetargetUntil) {
            this.player.mgStacks = Math.min(this.mgMaxStacks, this.player.mgStacks + 1);
            this.player.mgLastHit = this.time;
          } else if (pr.kind === 'mg' && e.id === this.player.mgTargetId) {
            this.player.mgLastHit = this.time;
          }
          this.events.push({ type: 'hit', x: hx, z: hz, kind: pr.kind });
          pr.hits.push(e.id);
          if (pr.hits.length > pr.pierce) { stopT = t; break; }
        } else if (pr.kind === 'cn') {
          this.cannonExplode(hx, hz, e, Math.atan2(pr.vz, pr.vx));
          stopT = t;
          break;
        } else if (pr.kind === 'ult') {
          if (e.kind === 'elite' || e.kind === 'boss') {
            this.ultExplode(hx, hz);
            stopT = t;
            break;
          }
          this.damageEnemy(e, ULT.pierceDamage, 'ult');
          this.events.push({ type: 'hit', x: hx, z: hz, kind: 'ult' });
          pr.hits.push(e.id);
        }
      }
      if (stopT >= 0) {
        pr.alive = false;
        pr.x = x0 + (x1 - x0) * stopT;
        pr.z = z0 + (z1 - z0) * stopT;
        continue;
      }
      // 补给箱命中判定
      for (const box of this.boxes) {
        if (!box.alive) continue;
        const bt = sweepCircle(x0, z0, x1, z1, pr.r, box.x, box.z, box.r);
        if (bt >= 0) {
          const bx = x0 + (x1 - x0) * bt;
          const bz = z0 + (z1 - z0) * bt;
          if (pr.kind === 'cn') {
            this.damageBoxesInCircle(bx, bz, this.splashRadius, CANNON.directDamage);
            this.events.push({ type: 'explode', x: bx, z: bz, r: this.splashRadius, kind: 'cn' });
            stopT = bt;
            break;
          } else {
            this.damageBox(box, pr.dmg);
            this.events.push({ type: 'hit', x: bx, z: bz, kind: pr.kind });
            if (pr.kind !== 'ult') {
              stopT = bt;
              break;
            }
          }
        }
      }
      if (stopT >= 0) {
        pr.alive = false;
        pr.x = x0 + (x1 - x0) * stopT;
        pr.z = z0 + (z1 - z0) * stopT;
        continue;
      }
      pr.x = x1; pr.z = z1;
      pr.travel += stepLen;
      if (endByRange) {
        pr.alive = false;
        if (pr.kind === 'cn') this.cannonExplode(x1, z1, null, Math.atan2(pr.vz, pr.vx));
        else if (pr.kind === 'ult') this.ultExplode(x1, z1);
      }
    }
  }

  private mgDamageAgainst(pr: Projectile, e: Enemy) {
    if (pr.kind === 'shard') return pr.dmg;
    let d = pr.dmg;
    if (this.lvl('mgFocus')) {
      if (this.player.mgStacks >= this.mgMaxStacks - 0.01) d *= 1 + UPGRADES.mgFocus.fullStackBonus;
      if (e.kind === 'elite' || e.kind === 'boss') d *= 1 + UPGRADES.mgFocus.bossBonus;
    }
    return d;
  }

  private cannonExplode(x: number, z: number, direct: Enemy | null, ang: number) {
    const R = this.splashRadius;
    const splash = CANNON.splashDamage + (this.lvl('cnBlast') ? UPGRADES.cnBlast.splashAdd : 0);
    const slow = this.lvl('cnPulse') ? UPGRADES.cnPulse : null;
    if (direct) {
      this.damageEnemy(direct, CANNON.directDamage + (this.lvl('cnBlast') ? UPGRADES.cnBlast.directAdd : 0), 'cn');
      if (slow) this.slowEnemy(direct, slow.slow, slow.slowTime);
    }
    this.forEnemiesInCircle(x, z, R, (e) => {
      if (e === direct) return; // 直接命中目标只结算一次
      this.damageEnemy(e, splash, 'cn');
      if (slow) this.slowEnemy(e, slow.slow, slow.slowTime);
    });
    this.events.push({ type: 'explode', x, z, r: R, kind: 'cn' });
    // 碎弹
    if (this.lvl('cnShards')) {
      const S = UPGRADES.cnShards;
      for (let k = 0; k < S.count; k++) {
        const a = ang + (k === 0 ? -0.45 : 0.45);
        this.projectiles.push({
          kind: 'shard', x, z, vx: Math.cos(a) * 14, vz: Math.sin(a) * 14, r: 0.2, dmg: S.damage,
          travel: 0, range: S.range, pierce: 0, hits: direct ? [direct.id] : [], alive: true, tier: 0,
        });
      }
    }
    // 磁索共振
    if (slow) {
      const field = this.mines.find((m) => m.alive && m.triggered && m.fieldT > 0 && len(m.x - x, m.z - z) < MINE.slowRadius * m.scale);
      if (field) {
        const P = UPGRADES.cnPulse;
        this.forEnemiesInCircle(field.x, field.z, P.radius * field.scale, (e) => {
          this.damageEnemy(e, P.damage, 'pulse');
          if (e.kind !== 'boss') e.bindT = Math.max(e.bindT, 0.3);
        });
        this.events.push({ type: 'explode', x: field.x, z: field.z, r: P.radius * field.scale, kind: 'pulse' });
      }
    }
  }

  private ultExplode(x: number, z: number) {
    this.forEnemiesInCircle(x, z, ULT.explodeRadius, (e) => this.damageEnemy(e, ULT.explodeDamage, 'ult'));
    this.damageBoxesInCircle(x, z, ULT.explodeRadius, ULT.explodeDamage);
    this.events.push({ type: 'explode', x, z, r: ULT.explodeRadius, kind: 'ult' });
  }

  // ───────────────────────── 中央治愈喷泉 & 补给箱 ─────────────────────────
  private updateFountain(dt: number) {
    const f = this.fountain;
    if (f.state === 'cooldown') {
      f.cooldownLeft = Math.max(0, f.cooldownLeft - dt);
      if (f.cooldownLeft <= 0) {
        f.state = 'ready';
        f.charge = 0;
        this.events.push({ type: 'fountainReady', x: f.x, z: f.z });
      }
      return;
    }

    const p = this.player;
    const inZone = p.hp > 0 && len(p.x - f.x, p.z - f.z) <= f.zoneRadius ? 1 : 0;
    if (inZone > 0) {
      f.state = 'charging';
      f.charge = Math.min(1, f.charge + (dt * inZone) / FOUNTAIN.chargeTime);
      if (f.charge >= 1) {
        const heal = Math.round(p.maxHp * FOUNTAIN.healFraction);
        p.hp = Math.min(p.maxHp, p.hp + heal);
        f.state = 'cooldown';
        f.charge = 0;
        f.cooldownLeft = FOUNTAIN.cooldown;
        this.events.push({ type: 'fountainHeal', x: f.x, z: f.z, heal });
      }
    } else {
      f.charge = Math.max(0, f.charge - dt * FOUNTAIN.decayRate);
      f.state = f.charge > 0.001 ? 'charging' : 'ready';
    }
  }

  private updateBoxes(dt: number) {
    const p = this.player;
    for (const b of this.boxes) {
      if (b.flash > 0) b.flash = Math.max(0, b.flash - dt * 6);
      if (!b.alive) {
        b.respawnT -= dt;
        if (b.respawnT <= 0 && len(p.x - b.x, p.z - b.z) > 18) {
          b.alive = true;
          b.hp = b.maxHp;
          b.flash = 0;
        }
      }
    }
  }

  private damageBoxesInCircle(x: number, z: number, r: number, dmg: number) {
    for (const b of this.boxes) {
      if (b.alive && len(b.x - x, b.z - z) <= r + b.r) {
        this.damageBox(b, dmg);
      }
    }
  }

  private damageBox(b: SupplyBox, dmg: number) {
    if (!b.alive) return;
    b.hp -= dmg;
    b.flash = 1;
    if (b.hp <= 0) {
      b.alive = false;
      b.respawnT = SUPPLY_BOX.respawnTime;
      this.events.push({ type: 'boxBreak', x: b.x, z: b.z });
      for (let i = 0; i < SUPPLY_BOX.xpDrops; i++) {
        this.dropXp(b.x, b.z, SUPPLY_BOX.xpValue);
      }
      if (this.rand() < SUPPLY_BOX.healChance) {
        this.pickups.push({ x: b.x, z: b.z, heal: MATCH.kitHeal, alive: true, age: 0 });
      }
      if (this.rand() < SUPPLY_BOX.ultChance) {
        const p = this.player;
        const before = p.ult;
        p.ult = Math.min(ULT.chargeNeeded, p.ult + SUPPLY_BOX.ultGain);
        if (before < ULT.chargeNeeded && p.ult >= ULT.chargeNeeded && !p.ultReadyAnnounced) {
          p.ultReadyAnnounced = true;
          this.events.push({ type: 'ultReady' });
        }
      }
    }
  }

  private slowEnemy(e: Enemy, f: number, t: number) {
    if (e.kind === 'boss') return;
    e.slowF = Math.min(e.slowF, 1 - f);
    e.slowT = Math.max(e.slowT, t);
  }

  damageEnemy(e: Enemy, dmg: number, _src: string) {
    if (!e.alive) return;
    if (e.kind === 'boss' && (e.state === 'enter' || e.state === 'transition')) return;
    e.hp -= dmg;
    e.flash = 1;
    if (e.kind === 'boss' && this.bossPhase === 1 && e.hp <= e.maxHp * BOSS.phase2At) {
      this.bossPhase = 2;
      e.hp = e.maxHp * BOSS.phase2At;
      e.state = 'transition';
      e.stateT = 0;
      this.bossSeq = [];
      this.bossCycle = 0;
      this.bossAlarm = 1;
      // 清除阶段一残留弹幕，给玩家喘息
      for (const b of this.enemyBullets) b.alive = false;
      this.hazards = this.hazards.filter((h) => h.dmg === 0 && h.resolved);
      this.events.push({ type: 'bossPhase' });
      return;
    }
    if (e.hp <= 0) this.killEnemy(e);
  }

  private killEnemy(e: Enemy) {
    e.alive = false;
    if (e.hazardId) this.removeHazard(e.hazardId);
    this.kills++;
    const p = this.player;
    this.events.push({ type: 'kill', x: e.x, z: e.z, kind: e.kind });
    if (e.kind === 'boss') {
      this.stats.bossDefeatedAt = this.time;
      this.events.push({ type: 'bossDead', x: e.x, z: e.z });
      for (const b of this.enemyBullets) b.alive = false;
      this.hazards.length = 0;
      this.pendingRings.length = 0;
      this.endDelay = 2.2;
      for (const o of this.enemies) if (o.alive && o !== e) { o.alive = false; this.events.push({ type: 'kill', x: o.x, z: o.z, kind: o.kind }); }
      return;
    }
    // 掉落
    const xp = ENEMIES[e.kind].xp;
    this.dropXp(e.x, e.z, xp);
    if (e.kind !== 'elite' && this.rand() < MATCH.kitChance) {
      this.pickups.push({ x: e.x, z: e.z, heal: MATCH.kitHeal, alive: true, age: 0 });
    }
    if (e.kind === 'elite') {
      this.pickups.push({ x: e.x, z: e.z, heal: MATCH.healPickup, alive: true, age: 0 });
      this.dropXp(e.x + 0.8, e.z, 4);
      this.dropXp(e.x - 0.8, e.z, 4);
    }
    // 大招充能
    const before = p.ult;
    p.ult = Math.min(ULT.chargeNeeded, p.ult + (ULT.chargePerKill[e.kind] ?? 1) * (1 + UPGRADES.cooldown.mul * this.lvl('cooldown')));
    if (before < ULT.chargeNeeded && p.ult >= ULT.chargeNeeded && !p.ultReadyAnnounced) {
      p.ultReadyAnnounced = true;
      this.events.push({ type: 'ultReady' });
    }
    // 过载
    p.killTimes.push(this.time);
    while (p.killTimes.length && p.killTimes[0] < this.time - OVERLOAD.killWindow) p.killTimes.shift();
    const trig = p.killTimes.length >= OVERLOAD.killsNeeded || e.kind === 'elite';
    // 已激活时不续时，冷却中不触发：限制后期无限续杯
    if (trig && p.overloadT <= 0 && p.overloadCd <= 0) {
      p.overloadT = this.overloadDuration;
      p.overloadCd = this.overloadCooldown;
      p.killTimes.length = 0;
      this.stats.overloadCount++;
      this.events.push({ type: 'overload', on: true });
    }
  }

  private dropXp(x: number, z: number, value: number) {
    if (this.shards.length >= XP.maxShards) {
      // 合并到最旧的晶片，保证经验不丢
      const s = this.shards[0];
      s.value += value;
      return;
    }
    this.shards.push({
      x: x + (this.rand() - 0.5) * 0.5, z: z + (this.rand() - 0.5) * 0.5, value, magnet: false, life: XP.life, alive: true,
    });
  }

  // ───────────────────────── 敌弹 ─────────────────────────
  private updateEnemyBullets(dt: number) {
    const p = this.player;
    for (const b of this.enemyBullets) {
      if (!b.alive) continue;
      const x0 = b.x, z0 = b.z;
      b.x += b.vx * dt;
      b.z += b.vz * dt;
      b.life -= dt;
      if (b.life <= 0 || Math.abs(b.x) > ARENA.halfW + 4 || Math.abs(b.z) > ARENA.halfH + 4) { b.alive = false; continue; }
      if (sweepCircle(x0, z0, b.x, b.z, b.r, p.x, p.z, PLAYER.radius * 0.85) >= 0) {
        if (this.hurtPlayer(b.dmg)) b.alive = false;
      }
    }
  }

  // ───────────────────────── 地雷 ─────────────────────────
  private updateMines(dt: number) {
    for (const m of this.mines) {
      if (!m.alive) continue;
      m.age += dt;
      if (m.triggered) {
        m.fieldT -= dt;
        if (m.fieldT <= 0) m.alive = false;
        continue;
      }
      if (m.age > MINE.life) { m.alive = false; continue; }
      if (m.age < MINE.armTime) continue;
      let hit = false;
      this.forEnemiesInCircle(m.x, m.z, MINE.triggerRadius, (e) => { if (e.kind !== 'boss' || e.state !== 'enter') hit = true; });
      if (!hit) continue;
      m.triggered = true;
      m.fieldT = MINE.fieldTime;
      const s = m.scale;
      this.forEnemiesInCircle(m.x, m.z, MINE.slowRadius * s, (e) => {
        const d = len(e.x - m.x, e.z - m.z);
        this.damageEnemy(e, MINE.damage, 'mine');
        if (e.kind === 'boss') return; // 首领免疫硬控
        if (d < MINE.bindRadius * s + e.r) {
          e.bindT = Math.max(e.bindT, MINE.bindTime);
        }
        this.slowEnemy(e, MINE.slowFactor, MINE.slowTime);
      });
      this.events.push({ type: 'explode', x: m.x, z: m.z, r: MINE.slowRadius * s, kind: 'mine' });
    }
  }

  // ───────────────────────── 经验 / 补给 ─────────────────────────
  private updateShards(dt: number) {
    const p = this.player;
    const pr = this.pickupRadius;
    for (const s of this.shards) {
      if (!s.alive) continue;
      s.life -= dt;
      const dx = p.x - s.x, dz = p.z - s.z;
      const d = len(dx, dz);
      if (!s.magnet && (d < pr || this.endDelay >= 0)) s.magnet = true;
      if (s.magnet) {
        const sp = PLAYER.magnetSpeed * dt;
        if (d <= sp + 0.3) {
          s.alive = false;
          p.xp += s.value;
          this.events.push({ type: 'pickup', kind: 'xp' });
          continue;
        }
        s.x += (dx / d) * sp;
        s.z += (dz / d) * sp;
      } else if (s.life <= 0) s.alive = false;
    }
  }

  private updatePickups(dt: number) {
    const p = this.player;
    for (const h of this.pickups) {
      if (!h.alive) continue;
      h.age += dt;
      if (len(p.x - h.x, p.z - h.z) < PLAYER.radius + 0.9) {
        h.alive = false;
        p.hp = Math.min(p.maxHp, p.hp + h.heal);
        this.events.push({ type: 'pickup', kind: 'heal' });
      }
    }
  }

  private compact() {
    if (this.enemies.some((e) => !e.alive)) this.enemies = this.enemies.filter((e) => e.alive);
    this.projectiles = this.projectiles.filter((p) => p.alive);
    this.enemyBullets = this.enemyBullets.filter((b) => b.alive);
    this.shards = this.shards.filter((s) => s.alive);
    this.pickups = this.pickups.filter((s) => s.alive);
    this.mines = this.mines.filter((s) => s.alive);
  }

  // ───────────────────────── 升级 ─────────────────────────
  private checkLevelUp() {
    const p = this.player;
    if (p.xp >= this.xpNeed && this.endDelay < 0) {
      p.xp -= this.xpNeed;
      p.level++;
      this.stats.levelTimes.push(Math.round(this.time));
      this.offer = rollUpgrades(this.upgrades, this.levelUpsTaken, this.rand);
      this.events.push({ type: 'levelUp', level: p.level });
      if (this.offer.length) this.state = 'levelup';
    }
  }

  chooseUpgrade(id: UpgradeId) {
    if (this.state !== 'levelup' || !this.offer.includes(id)) return;
    const cur = this.upgrades[id] ?? 0;
    this.upgrades[id] = cur + 1;
    this.levelUpsTaken++;
    const p = this.player;
    if (id === 'vitality') {
      p.maxHp += UPGRADES.vitality.maxHp;
      p.hp = Math.min(p.maxHp, p.hp + UPGRADES.vitality.heal);
    }
    if (id === 'mineCharge') {
      p.mineCharges++;
    }
    this.offer = [];
    this.state = 'play';
    this.checkLevelUp();
  }

  // ───────────────────────── 胜负 ─────────────────────────
  private checkEnd() {
    if (this.player.hp <= 0 && this.endDelay < 0) {
      this.player.hp = 0;
      this.endDelay = 1.2;
      this.lostFlag = true;
    }
  }
  private lostFlag = false;

  private finish() {
    this.state = this.lostFlag ? 'lost' : 'won';
    this.events.push({ type: this.lostFlag ? 'defeat' : 'victory' });
    this.stats.time = this.time;
    this.stats.kills = this.kills;
    this.stats.level = this.player.level;
    this.stats.build = (Object.keys(this.upgrades) as UpgradeId[]).map((id) => ({
      id, name: UPGRADE_BY_ID[id].name, level: this.upgrades[id]!,
    }));
  }

  /** 重开（同一 Game 实例复用，渲染层对象池不受影响） */
  restart(seed?: number) {
    this.lostFlag = false;
    this.pendingRings = [];
    this.reset(seed);
  }

  // ───────────────────────── 开发工具（仅 DEV 使用） ─────────────────────────
  devSkipTo(t: number) {
    this.time = t;
    while (this.waveIdx < WAVES.length && WAVES[this.waveIdx].t < t) this.waveIdx++;
    this.bossWarned = t >= MATCH.bossTime - 5;
  }
  devSpawnBoss() {
    if (this.boss) return;
    this.devSkipTo(MATCH.bossTime - 0.1);
    this.bossWarned = true;
  }
  devLevelUp() { this.player.xp += this.xpNeed; }
  devFillUlt() { this.player.ult = ULT.chargeNeeded; }
}

/** 危险区判定：渲染预警与伤害结算共用同一函数和数据 */
export function hazardContains(h: Hazard, x: number, z: number, pr: number): boolean {
  if (h.kind === 'circle') return len(x - h.x, z - h.z) < h.r + pr;
  if (h.kind === 'sector') {
    const d = len(x - h.x, z - h.z);
    if (d > h.r + pr) return false;
    if (d < pr + 0.3) return true;
    const a = Math.atan2(z - h.z, x - h.x);
    // 角度判定按玩家半径适当放宽
    const slack = Math.asin(Math.min(1, pr / Math.max(d, 1e-3)));
    return Math.abs(angleDiff(a, h.ang)) <= h.arc / 2 + slack;
  }
  // line
  const x1 = h.x + Math.cos(h.ang) * h.r, z1 = h.z + Math.sin(h.ang) * h.r;
  return distToSegment(x, z, h.x, h.z, x1, z1) < h.w / 2 + pr;
}
