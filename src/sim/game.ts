/**
 * 战斗模拟核心。纯逻辑，不依赖 Three.js / DOM / 音频。
 * 渲染、音频、UI 通过读取状态与 events 列表实现解耦，便于后续移植微信小游戏。
 */
import {
  ARENA, BOSS, BUDGET, DASH, ENEMIES, FOUNTAIN, JINX_E, JINX_PASSIVE, JINX_R, MATCH, MG, PLAYER, SIM, SPAWN_RING, SUPPLY_BOX,
  XP, hpScale, xpForLevel,
} from '../config';
import { SpatialGrid } from './grid';
import { WalkableMap } from './map_grid';
import { angleDiff, clamp, distToSegment, len, makeRng, sweepCircle } from './math';
import {
  PASSIVE_BY_ID, PassiveId, UpgradeOffer, WEAPON_BY_ID, WEAPON_EVOLVED_LEVEL, WeaponId, rollLevelUpOffers,
} from './weapons';
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
  variant?: 'pix' | 'ghoul';
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

export type ProjKind =
  | 'meow' | 'meow_evo' | 'rocket_e' | 'ult_r'
  | 'uwu' | 'crossbow' | 'boomerang' | 'boomerang_mini';

export interface Projectile {
  kind: ProjKind;
  x: number; z: number;
  vx: number; vz: number;
  r: number;
  dmg: number;
  travel: number;
  range: number;
  pierce: number;
  hits: number[];
  alive: boolean;
  tier: number;
  isCrit?: boolean;
  returnMode?: boolean;
  falloff?: number;
  aoeR?: number;
  ownerId?: number;
}

export interface OrbitalBlade {
  x: number; z: number;
  ang: number;
  r: number;
  dmg: number;
  evolved: boolean;
  hitCd: Map<number, number>;
}

export interface LightningArc {
  x0: number; z0: number;
  x1: number; z1: number;
  age: number; life: number;
}

export interface WeaponZone {
  kind: 'storm' | 'mine' | 'mine_sub' | 'orbital_strike';
  x: number; z: number;
  r: number;
  t: number;
  dur: number;
  dmg: number;
  tickT: number;
  evolved: boolean;
  isCrit?: boolean;
  resolved?: boolean;
}

export interface AccessCard {
  x: number; z: number;
  alive: boolean;
  age: number;
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
  | { type: 'shoot'; weapon: 'mg' | 'cn' | 'ult'; x: number; z: number; ang: number; tier: number; ownerId?: number }
  | { type: 'hit'; x: number; z: number; kind: string; crit?: boolean; ownerId?: number }
  | { type: 'explode'; x: number; z: number; r: number; kind: 'cn' | 'ult' | 'mine' | 'pulse' | 'shard' | 'rocket_e' | 'ult_r' | 'radiant' | 'iceblast' | 'orbital'; ownerId?: number }
  | { type: 'kill'; x: number; z: number; kind: Kind }
  | { type: 'playerHurt'; dmg: number }
  | { type: 'pickup'; kind: 'xp' | 'heal' | 'card' }
  | { type: 'fountainHeal'; x: number; z: number; heal: number }
  | { type: 'fountainReady'; x: number; z: number }
  | { type: 'boxBreak'; x: number; z: number }
  | { type: 'levelUp'; level: number; isCard?: boolean }
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
  shield: number;
  faceX: number; faceZ: number;
  lastMoveX: number; lastMoveZ: number;
  moving: boolean;
  weapon: Weapon;
  autoAim: boolean;
  swapT: number;
  fireCd: number;
  mgStacks: number;
  mgTargetId: number;
  mgLastHit: number;
  mgRetargetUntil: number;
  targetId: number;
  eCd: number;
  eVolleyLeft: number;
  eVolleyT: number;
  rCd: number;
  rMaxCd: number;
  rReadyAnnounced: boolean;
  dashCd: number;
  dashT: number;
  dashX: number; dashZ: number;
  iframe: number;
  hurtT: number;
  overloadT: number;
  overloadCd: number;
  passiveKills: number;
  meowBurstLeft: number;
  meowBurstT: number;
  meowBurstAng: number;
  weapons: Partial<Record<WeaponId, number>>;
  weaponOrder: WeaponId[];
  passives: Partial<Record<PassiveId, number>>;
  passiveOrder: PassiveId[];
  weaponCds: Partial<Record<WeaponId, number>>;
  radiantT: number;
  cyclonicT: number;
  level: number;
  xp: number;
  recoil: number;
}

export interface MatchStats {
  time: number;
  kills: number;
  level: number;
  build: { id: string; name: string; level: number }[];
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
  orbitals: OrbitalBlade[] = [];
  lightningArcs: LightningArc[] = [];
  weaponZones: WeaponZone[] = [];
  accessCards: AccessCard[] = [];
  fountain!: FountainState;
  boxes: SupplyBox[] = [];
  warnings: WaveWarn[] = [];
  events: GameEvent[] = [];
  levelUpsTaken = 0;
  offer: UpgradeOffer[] = [];
  levelUpIsCard = false;
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
    this.orbitals = [];
    this.lightningArcs = [];
    this.weaponZones = [];
    this.accessCards = [];
    this.fountain = {
      x: FOUNTAIN.x,
      z: FOUNTAIN.z,
      zoneRadius: FOUNTAIN.zoneRadius,
      state: 'ready',
      charge: 0,
      cooldownLeft: 0,
    };
    // 注：原版数据中 31/32 号箱定位器同坐标 (-44.7, 31.5)，32 号已在 map1_data.json
    // 中沿 +x 挪 1.5m 至 (-43.2, 31.5)（可走格内），避免两箱完全重叠。
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
    this.levelUpsTaken = 0;
    this.offer = [];
    this.levelUpIsCard = false;
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
      hp: PLAYER.maxHp, maxHp: PLAYER.maxHp, shield: 0,
      faceX: 0, faceZ: -1, lastMoveX: 0, lastMoveZ: -1, moving: false,
      weapon: 'mg', autoAim: true, swapT: 0, fireCd: 0.25,
      mgStacks: 0, mgTargetId: -1, mgLastHit: -10, mgRetargetUntil: 0, targetId: -1,
      eCd: 0, eVolleyLeft: 0, eVolleyT: 0,
      rCd: JINX_R.initCooldown, rMaxCd: JINX_R.cooldown, rReadyAnnounced: false,
      dashCd: 0, dashT: 0, dashX: 0, dashZ: 0,
      iframe: 0, hurtT: 0, overloadT: 0, overloadCd: 0, passiveKills: 0,
      meowBurstLeft: 0, meowBurstT: 0, meowBurstAng: 0,
      weapons: { jinx_meow: 1 },
      weaponOrder: ['jinx_meow'],
      passives: {},
      passiveOrder: [],
      weaponCds: { jinx_meow: 0.25 },
      radiantT: 0, cyclonicT: 0,
      level: 1, xp: 0, recoil: 0,
    };
  }

  // ───────────────────────── 派生属性（严格对齐 Patch 14.14 StatAmount） ─────────────────────────
  weaponLv(id: WeaponId): number { return this.player.weapons[id] ?? 0; }
  passiveLv(id: PassiveId): number { return this.player.passives[id] ?? 0; }
  passiveVal(id: PassiveId): number {
    const lv = this.passiveLv(id);
    return lv > 0 ? PASSIVE_BY_ID[id].values[lv - 1] : 0;
  }
  get xpNeed() { return xpForLevel(this.player.level); }
  get maxHpTotal() { return PLAYER.maxHp + this.passiveVal('maxHp'); }
  get damageMul() { return 1 + this.passiveVal('damage'); }
  get abilityHaste() { return this.passiveVal('haste') + (this.player.overloadT > 0 ? JINX_PASSIVE.ahBonus : 0); }
  get cdMul() { return 100 / (100 + this.abilityHaste); }
  get critChance() { return this.passiveVal('crit'); }
  get bonusProjectiles() { return this.passiveVal('projectiles'); }
  get areaMul() { return 1 + this.passiveVal('area'); }
  get durationMul() { return 1 + this.passiveVal('duration'); }
  get armor() { return this.passiveVal('armor'); }
  get armorDR() { return 100 / (100 + this.armor); }
  get hpRegen() { return this.passiveVal('hpRegen'); }
  get moveSpeed() {
    const p = this.player;
    return PLAYER.speed * (1 + this.passiveVal('moveSpeed')) * (p.overloadT > 0 ? 1 + JINX_PASSIVE.msBonus : 1);
  }
  get pickupRadius() { return PLAYER.pickupRadius * (1 + this.passiveVal('pickup')); }
  get xpMul() { return 1 + this.passiveVal('xp'); }
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

    // 生命回复被动
    if (p.hp > 0 && p.hp < p.maxHp && this.hpRegen > 0) {
      p.hp = Math.min(p.maxHp, p.hp + this.hpRegen * dt);
    }

    const prevDash = p.dashCd;
    if (p.dashCd > 0) {
      p.dashCd = Math.max(0, p.dashCd - dt);
      if (p.dashCd <= 0 && prevDash > 0) this.events.push({ type: 'cooldownReady', what: 'dash' });
    }
    if (p.eCd > 0) {
      const prevE = p.eCd;
      p.eCd = Math.max(0, p.eCd - dt);
      if (p.eCd <= 0 && prevE > 0) this.events.push({ type: 'cooldownReady', what: 'mine' });
    }
    if (p.rCd > 0) {
      p.rCd = Math.max(0, p.rCd - dt);
      if (p.rCd <= 0 && !p.rReadyAnnounced) {
        p.rReadyAnnounced = true;
        this.events.push({ type: 'ultReady' });
      }
    }

    // 罪恶快感被动
    if (p.overloadT > 0) {
      p.overloadT -= dt;
      if (p.overloadT <= 0) {
        p.overloadT = 0;
        this.events.push({ type: 'overload', on: false });
      }
    }

    // Q：切换自动瞄准 / 移动朝向瞄准
    if (inp.swap) {
      p.autoAim = !p.autoAim;
      this.events.push({ type: 'swap', weapon: p.autoAim ? 'mg' : 'cn' });
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

    // 空格：闪避
    if (inp.dash && p.dashCd <= 0 && p.dashT <= 0) {
      p.dashX = p.lastMoveX;
      p.dashZ = p.lastMoveZ;
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

    // E：鱼骨头 9 连发射火箭（Strawberry_JinxE）
    if (inp.mine && p.eCd <= 0 && p.eVolleyLeft <= 0) {
      p.eVolleyLeft = JINX_E.rocketCount;
      p.eVolleyT = 0;
      p.eCd = JINX_E.cooldown * this.cdMul;
      p.weapon = 'cn';
      this.events.push({ type: 'mine', x: p.x, z: p.z });
    }
    if (p.eVolleyLeft > 0) {
      p.eVolleyT -= dt;
      while (p.eVolleyLeft > 0 && p.eVolleyT <= 0) {
        p.eVolleyT += JINX_E.fireInterval;
        const firedIdx = JINX_E.rocketCount - p.eVolleyLeft;
        p.eVolleyLeft--;
        const baseAng = Math.atan2(p.faceZ, p.faceX);
        // 有规律的 3x3 紧凑扇形齐射角（不再随机乱飞）
        const fan = ((firedIdx % 3) - 1) * 0.16 + (Math.floor(firedIdx / 3) - 1) * 0.035;
        const a = baseAng + fan;
        const eTier = Math.min(5, Math.floor((p.level - 1) / 3));
        const eDmg = (JINX_E.baseDamage + p.level * JINX_E.dmgPerLevel) * this.damageMul;
        const isCrit = this.rand() < this.critChance;
        const critMult = isCrit ? (2 + JINX_E.critDmgBonus[eTier]) : 1;
        this.projectiles.push({
          kind: 'rocket_e',
          x: p.x + Math.cos(a) * 0.75,
          z: p.z + Math.sin(a) * 0.75,
          vx: Math.cos(a) * JINX_E.speed,
          vz: Math.sin(a) * JINX_E.speed,
          r: 0.28,
          dmg: eDmg * critMult,
          travel: 0,
          range: JINX_E.range,
          pierce: 0,
          hits: [],
          alive: true,
          tier: 0,
          isCrit,
          aoeR: JINX_E.aoeRadius * (1 + JINX_E.aoeIncrease[eTier]) * this.areaMul,
        });
        p.recoil = 1;
        this.events.push({ type: 'shoot', weapon: 'cn', x: p.x, z: p.z, ang: a, tier: 0 });
      }
      if (p.eVolleyLeft === 0) p.weapon = 'mg';
    }

    // R：超究极死神飞弹（Strawberry_JinxR）
    if (inp.ult && p.rCd <= 0) this.fireUlt();
  }

  /** 与场景边界和仓库区 180x180 可行走栅格障碍的碰撞（玩家与敌人共用） */
  private collideStatic(e: { x: number; z: number }, r: number, _strictBounds?: boolean) {
    this.map.resolveCircle(e, r);
  }

  hurtPlayer(dmg: number) {
    const p = this.player;
    if (p.iframe > 0 || this.dev.invincible || this.endDelay >= 0) return false;
    const raw = Math.max(1, Math.round(dmg * this.armorDR));
    let rem = raw;
    if (p.shield > 0) {
      const absorbed = Math.min(p.shield, rem);
      p.shield -= absorbed;
      rem -= absorbed;
      // 进化冰爆护甲（深度冻结）：护盾破裂时再次触发免费冰爆
      if (p.shield <= 0 && this.weaponLv('iceblast') >= WEAPON_EVOLVED_LEVEL) {
        this.triggerIceBlast(6);
      }
    }
    p.hp -= rem;
    p.iframe = PLAYER.hurtIFrames;
    p.hurtT = 0.3;
    this.stats.damageTaken += raw;
    this.events.push({ type: 'playerHurt', dmg: raw });
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
    const variant = kind === 'crawler'
      ? (this.time < 42 || (this.time >= 105 && this.time <= 125) ? 'pix' : 'ghoul')
      : undefined;
    return {
      id: this.nextId++, kind, variant, x, z, vx: 0, vz: 0, hp, maxHp: hp, r: base.radius,
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
      const sp = (d > 5 ? BOSS.speed : 0) * (this.bossPhase === 2 ? 1.28 : 1);
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

  private findNearestEnemy(maxDist: number, x = this.player.x, z = this.player.z): Enemy | null {
    let best: Enemy | null = null;
    let bd = maxDist;
    for (const e of this.enemies) {
      if (!e.alive || (e.kind === 'boss' && e.state === 'enter')) continue;
      const d = len(e.x - x, e.z - z) - e.r * 0.5;
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }

  private rollDmg(base: number, bonusCrit = 0): { dmg: number; isCrit: boolean } {
    const isCrit = this.rand() < clamp(this.critChance + bonusCrit, 0, 1);
    const dmg = base * this.damageMul * (isCrit ? 2 : 1);
    return { dmg, isCrit };
  }

  private updateFiring(dt: number) {
    const p = this.player;
    const target = p.autoAim ? this.findAimTarget() : null;
    p.targetId = target && !target.isBox ? target.id : -1;
    if (target) {
      const dx = target.x - p.x, dz = target.z - p.z;
      const l = len(dx, dz) || 1;
      p.faceX = dx / l; p.faceZ = dz / l;
    } else if (p.moving) {
      p.faceX = p.lastMoveX; p.faceZ = p.lastMoveZ;
    }

    // 1. 驱动所有已装备的武器槽（5 槽独立自动施放）
    this.updateWeapons(dt, target);
    this.updateOrbitals(dt);
    this.updateWeaponZones(dt);
    this.updateLightningArcs(dt);
  }

  private updateWeapons(dt: number, target: { id: number; x: number; z: number; isBox: boolean } | null) {
    const p = this.player;
    const ang = Math.atan2(p.faceZ, p.faceX);

    // 金克丝喵喵枪连发弹流
    if (p.meowBurstLeft > 0) {
      p.meowBurstT -= dt;
      while (p.meowBurstLeft > 0 && p.meowBurstT <= 0) {
        p.meowBurstT += MG.burstInterval / (p.overloadT > 0 ? 1 + JINX_PASSIVE.asBonus : 1);
        p.meowBurstLeft--;
        const lv = this.weaponLv('jinx_meow');
        if (lv <= 0) break;
        const evolved = lv >= WEAPON_EVOLVED_LEVEL;
        const def = WEAPON_BY_ID.jinx_meow;
        const spread = (this.rand() - 0.5) * 0.1;
        const a = p.meowBurstAng + spread;
        const { dmg, isCrit } = this.rollDmg(def.dmg[lv - 1]);
        if (this.projectiles.length < BUDGET.maxPlayerProjectiles) {
          this.projectiles.push({
            kind: evolved ? 'meow_evo' : 'meow',
            x: p.x + Math.cos(a) * 0.65,
            z: p.z + Math.sin(a) * 0.65,
            vx: Math.cos(a) * MG.bulletSpeed,
            vz: Math.sin(a) * MG.bulletSpeed,
            r: evolved ? 0.22 : MG.bulletRadius,
            dmg,
            travel: 0,
            range: def.radius[lv - 1],
            pierce: evolved ? 999 : 0,
            hits: [],
            alive: true,
            tier: evolved ? 2 : lv >= 3 ? 1 : 0,
            isCrit,
            falloff: evolved ? 0.6 : 1,
          });
        }
        p.recoil = Math.min(1, p.recoil + 0.35);
        this.events.push({ type: 'shoot', weapon: 'mg', x: p.x, z: p.z, ang: a, tier: evolved ? 2 : 0 });
      }
    }

    for (const wId of p.weaponOrder) {
      const lv = p.weapons[wId] ?? 0;
      if (lv <= 0) continue;
      const def = WEAPON_BY_ID[wId];
      const evolved = lv >= WEAPON_EVOLVED_LEVEL;

      if (wId === 'radiant') {
        p.radiantT -= dt;
        if (p.radiantT <= 0) {
          p.radiantT = def.cd[lv - 1];
          const rad = def.radius[lv - 1] * this.areaMul;
          const base = def.dmg[lv - 1] + this.maxHpTotal * 0.025;
          this.forEnemiesInCircle(p.x, p.z, rad, (e) => {
            const { dmg } = this.rollDmg(base);
            this.damageEnemy(e, dmg, 'radiant');
          });
          this.damageBoxesInCircle(p.x, p.z, rad, base * 0.5);
        }
        continue;
      }

      if (wId === 'cyclonic') {
        if (p.cyclonicT > 0) {
          p.cyclonicT -= dt;
          if (p.cyclonicT <= 0 && !evolved) this.orbitals.length = 0;
        }
        p.weaponCds[wId] = Math.max(0, (p.weaponCds[wId] ?? 0) - dt);
        const wantCount = def.count[lv - 1] + this.bonusProjectiles;
        if (evolved) {
          if (this.orbitals.length !== wantCount) this.spawnOrbitals(wantCount, def.radius[lv - 1], def.dmg[lv - 1], true);
          continue;
        }
        if ((p.weaponCds[wId] ?? 0) <= 0 && p.cyclonicT <= 0) {
          p.cyclonicT = def.duration[lv - 1] * this.durationMul;
          p.weaponCds[wId] = def.cd[lv - 1] * this.cdMul;
          this.spawnOrbitals(wantCount, def.radius[lv - 1], def.dmg[lv - 1], false);
        }
        continue;
      }

      p.weaponCds[wId] = Math.max(0, (p.weaponCds[wId] ?? 0) - dt);
      if ((p.weaponCds[wId] ?? 0) > 0) continue;

      if (wId === 'jinx_meow') {
        if (!target || p.dashT > 0) continue;
        p.weaponCds[wId] = def.cd[lv - 1] * this.cdMul;
        // 官方 ProjectileMultiplier = 3：每 +1 飞弹数量额外 +3 发机枪弹
        p.meowBurstLeft = Math.min(16, def.count[lv - 1] + this.bonusProjectiles * 3);
        p.meowBurstT = 0;
        p.meowBurstAng = ang;
      } else if (wId === 'uwu_blaster') {
        const near = this.findNearestEnemy(def.radius[lv - 1]);
        const tx = near ? near.x : target?.x;
        const tz = near ? near.z : target?.z;
        if (tx == null || tz == null) continue;
        p.weaponCds[wId] = def.cd[lv - 1] * this.cdMul;
        const a0 = Math.atan2(tz - p.z, tx - p.x);
        const n = def.count[lv - 1] + this.bonusProjectiles;
        for (let k = 0; k < n; k++) {
          const a = a0 + (n > 1 ? (k - (n - 1) / 2) * 0.1 : 0);
          const { dmg, isCrit } = this.rollDmg(def.dmg[lv - 1]);
          if (this.projectiles.length < BUDGET.maxPlayerProjectiles) {
            this.projectiles.push({
              kind: 'uwu',
              x: p.x + Math.cos(a) * 0.5, z: p.z + Math.sin(a) * 0.5,
              vx: Math.cos(a) * 26, vz: Math.sin(a) * 26,
              r: 0.18, dmg, travel: 0, range: def.radius[lv - 1], pierce: 0, hits: [], alive: true, tier: evolved ? 1 : 0, isCrit,
            });
          }
        }
      } else if (wId === 'statikk') {
        const cands = this.enemies
          .filter((e) => e.alive && (e.kind !== 'boss' || e.state !== 'enter') && len(e.x - p.x, e.z - p.z) <= def.radius[lv - 1])
          .sort((a, b) => b.hp - a.hp);
        if (!cands.length) continue;
        p.weaponCds[wId] = def.cd[lv - 1] * this.cdMul;
        const chainN = Math.min(cands.length, def.count[lv - 1] + this.bonusProjectiles);
        let px = p.x, pz = p.z;
        for (let k = 0; k < chainN; k++) {
          const e = cands[k];
          const { dmg, isCrit } = this.rollDmg(def.dmg[lv - 1]);
          this.damageEnemy(e, dmg, 'statikk');
          this.events.push({ type: 'hit', x: e.x, z: e.z, kind: 'statikk', crit: isCrit });
          this.lightningArcs.push({ x0: px, z0: pz, x1: e.x, z1: e.z, age: 0, life: 0.24 });
          px = e.x; pz = e.z;
          if (evolved) {
            this.weaponZones.push({
              kind: 'storm', x: e.x, z: e.z, r: 2.2 * this.areaMul, t: 0,
              dur: 3.0 * this.durationMul, dmg: 80, tickT: 0.2, evolved: true,
            });
          }
        }
      } else if (wId === 'crossbow') {
        const near = this.findNearestEnemy(def.radius[lv - 1]);
        if (!near && !target) continue;
        p.weaponCds[wId] = def.cd[lv - 1] * this.cdMul;
        const baseA = this.rand() * Math.PI * 2;
        const aimA = near ? Math.atan2(near.z - p.z, near.x - p.x) : baseA;
        const n = def.count[lv - 1] + this.bonusProjectiles;
        const bCrit = def.bonusCrit ? def.bonusCrit[lv - 1] : 0;
        const spread = evolved ? Math.PI * 1.4 : 0.72;
        for (let k = 0; k < n; k++) {
          const a = aimA + (n > 1 ? (k / (n - 1) - 0.5) * spread : 0);
          const { dmg, isCrit } = this.rollDmg(def.dmg[lv - 1], bCrit);
          if (this.projectiles.length < BUDGET.maxPlayerProjectiles) {
            this.projectiles.push({
              kind: 'crossbow',
              x: p.x + Math.cos(a) * 0.5, z: p.z + Math.sin(a) * 0.5,
              vx: Math.cos(a) * 24, vz: Math.sin(a) * 24,
              r: 0.2, dmg, travel: 0, range: def.radius[lv - 1], pierce: isCrit ? 999 : 0, hits: [], alive: true, tier: evolved ? 1 : 0, isCrit,
            });
          }
        }
      } else if (wId === 'boomerang') {
        const near = this.findNearestEnemy(def.radius[lv - 1]);
        if (!near && !target) continue;
        p.weaponCds[wId] = def.cd[lv - 1] * this.cdMul;
        const aimA = near ? Math.atan2(near.z - p.z, near.x - p.x) : ang;
        const n = def.count[lv - 1] + this.bonusProjectiles;
        for (let k = 0; k < n; k++) {
          const a = aimA + (n > 1 ? (k / n) * Math.PI * 2 * (n > 3 ? 0.5 : 0.18) : 0);
          const { dmg, isCrit } = this.rollDmg(def.dmg[lv - 1]);
          if (this.projectiles.length < BUDGET.maxPlayerProjectiles) {
            this.projectiles.push({
              kind: 'boomerang',
              x: p.x + Math.cos(a) * 0.5, z: p.z + Math.sin(a) * 0.5,
              vx: Math.cos(a) * 15, vz: Math.sin(a) * 15,
              r: 0.42, dmg, travel: 0, range: def.radius[lv - 1], pierce: 999, hits: [], alive: true, tier: evolved ? 1 : 0, isCrit,
            });
          }
        }
      } else if (wId === 'bunnymega') {
        const cands = this.enemies.filter((e) => e.alive && (e.kind !== 'boss' || e.state !== 'enter') && len(e.x - p.x, e.z - p.z) <= 10.5);
        if (!cands.length) continue;
        p.weaponCds[wId] = def.cd[lv - 1] * this.cdMul;
        const n = def.count[lv - 1] + this.bonusProjectiles;
        const bCrit = def.bonusCrit ? def.bonusCrit[lv - 1] : 0;
        for (let k = 0; k < n; k++) {
          const tE = cands[Math.floor(this.rand() * cands.length)];
          const { dmg, isCrit } = this.rollDmg(def.dmg[lv - 1], bCrit);
          this.weaponZones.push({
            kind: 'orbital_strike', x: tE.x, z: tE.z, r: def.radius[lv - 1] * this.areaMul,
            t: 0, dur: 0.35 + k * 0.14, dmg, tickT: 0, evolved, isCrit,
          });
        }
        if (evolved) {
          const bossOrFirst = this.boss?.alive ? this.boss : cands[0];
          const { dmg, isCrit } = this.rollDmg(def.dmg[lv - 1] * 1.8, bCrit);
          this.weaponZones.push({
            kind: 'orbital_strike', x: bossOrFirst.x, z: bossOrFirst.z, r: 3.6 * this.areaMul,
            t: 0, dur: 0.85, dmg, tickT: 0, evolved: true, isCrit,
          });
        }
      } else if (wId === 'mines') {
        p.weaponCds[wId] = def.cd[lv - 1] * this.cdMul;
        const n = def.count[lv - 1] + this.bonusProjectiles;
        const rad = def.radius[lv - 1] * this.areaMul;
        for (let k = 0; k < n; k++) {
          const a = (k / n) * Math.PI * 2 + this.rand() * 0.4;
          const dist = 2.6 + this.rand() * 2.2;
          const mx = clamp(p.x + Math.cos(a) * dist, -ARENA.halfW + 1, ARENA.halfW - 1);
          const mz = clamp(p.z + Math.sin(a) * dist, -ARENA.halfH + 1, ARENA.halfH - 1);
          this.weaponZones.push({
            kind: 'mine', x: mx, z: mz, r: rad, t: 0, dur: 0.4, dmg: def.dmg[lv - 1], tickT: 0, evolved,
          });
        }
      } else if (wId === 'iceblast') {
        p.weaponCds[wId] = def.cd[lv - 1] * this.cdMul;
        this.triggerIceBlast(lv);
      }
    }
  }

  private spawnOrbitals(count: number, rad: number, dmg: number, evolved: boolean) {
    this.orbitals.length = 0;
    const r = rad * this.areaMul;
    for (let i = 0; i < count; i++) {
      this.orbitals.push({
        x: this.player.x, z: this.player.z,
        ang: (i / count) * Math.PI * 2,
        r, dmg, evolved, hitCd: new Map(),
      });
    }
  }

  private updateOrbitals(dt: number) {
    if (!this.orbitals.length) return;
    const p = this.player;
    const speed = 3.6;
    for (const o of this.orbitals) {
      o.ang += speed * dt;
      o.x = p.x + Math.cos(o.ang) * o.r;
      o.z = p.z + Math.sin(o.ang) * o.r;
      for (const [id, cd] of o.hitCd) {
        if (cd - dt <= 0) o.hitCd.delete(id);
        else o.hitCd.set(id, cd - dt);
      }
      this.forEnemiesInCircle(o.x, o.z, 0.7 * this.areaMul, (e) => {
        if (o.hitCd.has(e.id)) return;
        o.hitCd.set(e.id, 0.35);
        const { dmg, isCrit } = this.rollDmg(o.dmg);
        this.damageEnemy(e, dmg, 'cyclonic');
        this.events.push({ type: 'hit', x: e.x, z: e.z, kind: 'cyclonic', crit: isCrit });
        if (e.kind !== 'boss') {
          const dx = e.x - p.x, dz = e.z - p.z;
          const d = len(dx, dz) || 1;
          e.x += (dx / d) * 0.45;
          e.z += (dz / d) * 0.45;
        }
      });
    }
  }

  private updateWeaponZones(dt: number) {
    for (let i = 0; i < this.weaponZones.length; i++) {
      const z = this.weaponZones[i];
      z.t += dt;
      if (z.kind === 'storm') {
        z.tickT -= dt;
        if (z.tickT <= 0) {
          z.tickT = 0.5;
          this.forEnemiesInCircle(z.x, z.z, z.r, (e) => {
            const { dmg } = this.rollDmg(z.dmg);
            this.damageEnemy(e, dmg, 'statikk_storm');
          });
        }
        if (z.t >= z.dur) this.weaponZones.splice(i--, 1);
      } else if (z.kind === 'mine' || z.kind === 'mine_sub') {
        if (z.t >= z.dur) {
          this.forEnemiesInCircle(z.x, z.z, z.r, (e) => {
            const { dmg } = this.rollDmg(z.dmg);
            this.damageEnemy(e, dmg, 'mines');
          });
          this.damageBoxesInCircle(z.x, z.z, z.r, z.dmg);
          this.events.push({ type: 'explode', x: z.x, z: z.z, r: z.r, kind: 'mine' });
          if (z.kind === 'mine' && z.evolved) {
            for (let k = 0; k < 3; k++) {
              const a = (k / 3) * Math.PI * 2 + this.rand() * 0.5;
              this.weaponZones.push({
                kind: 'mine_sub',
                x: z.x + Math.cos(a) * 1.9, z: z.z + Math.sin(a) * 1.9,
                r: 3.0 * this.areaMul, t: 0, dur: 0.25 + k * 0.08, dmg: 70, tickT: 0, evolved: false,
              });
            }
          }
          this.weaponZones.splice(i--, 1);
        }
      } else if (z.kind === 'orbital_strike') {
        if (!z.resolved && z.t >= z.dur) {
          z.resolved = true;
          this.forEnemiesInCircle(z.x, z.z, z.r, (e) => {
            this.damageEnemy(e, z.dmg, 'bunnymega');
          });
          this.damageBoxesInCircle(z.x, z.z, z.r, z.dmg);
          this.events.push({ type: 'explode', x: z.x, z: z.z, r: z.r, kind: 'orbital' });
        }
        if (z.t >= z.dur + 0.22) this.weaponZones.splice(i--, 1);
      }
    }
  }

  private updateLightningArcs(dt: number) {
    for (let i = 0; i < this.lightningArcs.length; i++) {
      this.lightningArcs[i].age += dt;
      if (this.lightningArcs[i].age >= this.lightningArcs[i].life) this.lightningArcs.splice(i--, 1);
    }
  }

  private triggerIceBlast(lv: number) {
    const p = this.player;
    const def = WEAPON_BY_ID.iceblast;
    const rad = def.radius[lv - 1] * this.areaMul;
    const freezeDur = def.duration[lv - 1] * this.durationMul;
    const baseDmg = def.dmg[lv - 1] + 2.5 * this.armor;
    this.forEnemiesInCircle(p.x, p.z, rad, (e) => {
      const { dmg } = this.rollDmg(baseDmg);
      this.damageEnemy(e, dmg, 'iceblast');
      if (e.kind !== 'boss') {
        e.bindT = Math.max(e.bindT, freezeDur);
      }
    });
    if (lv >= WEAPON_EVOLVED_LEVEL) {
      p.shield = Math.max(p.shield, 200 + this.maxHpTotal * 0.2);
    }
    this.events.push({ type: 'explode', x: p.x, z: p.z, r: rad, kind: 'iceblast' });
  }

  private fireUlt() {
    const p = this.player;
    let dx: number, dz: number;
    let t = this.enemies.find((e) => e.id === p.targetId && e.alive);
    if (!t && p.autoAim) {
      t = this.enemies.find((e) => e.alive && (e.kind === 'boss' || e.kind === 'elite') && e.state !== 'enter' && len(e.x - p.x, e.z - p.z) <= JINX_R.range)
        ?? this.findNearestEnemy(JINX_R.range)
        ?? undefined;
    }
    if (t) {
      const l = len(t.x - p.x, t.z - p.z) || 1;
      dx = (t.x - p.x) / l; dz = (t.z - p.z) / l;
      p.faceX = dx; p.faceZ = dz;
    } else if (p.moving) { dx = p.lastMoveX; dz = p.lastMoveZ; }
    else { dx = p.faceX; dz = p.faceZ; }
    p.rMaxCd = JINX_R.cooldown * this.cdMul;
    p.rCd = p.rMaxCd;
    p.rReadyAnnounced = false;
    const base = (JINX_R.baseDamage + p.level * JINX_R.dmgPerLevel) * this.damageMul;
    this.projectiles.push({
      kind: 'ult_r', x: p.x + dx * 0.9, z: p.z + dz * 0.9, vx: dx * JINX_R.speed, vz: dz * JINX_R.speed,
      r: JINX_R.width * 0.55, dmg: base, travel: 0, range: JINX_R.range, pierce: 999, hits: [], alive: true, tier: 0,
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
        if (pr.kind === 'rocket_e') {
          this.rocketEExplode(hx, hz, pr.dmg, pr.aoeR ?? JINX_E.aoeRadius * this.areaMul, e);
          stopT = t;
          break;
        } else if (pr.kind === 'ult_r') {
          if (e.kind === 'elite' || e.kind === 'boss') {
            this.ultExplode(hx, hz, pr.dmg);
            stopT = t;
            break;
          }
          this.damageEnemy(e, pr.dmg * 0.55, 'ult_r');
          this.events.push({ type: 'hit', x: hx, z: hz, kind: 'ult_r', crit: pr.isCrit });
          pr.hits.push(e.id);
        } else {
          // meow / meow_evo / uwu / crossbow / boomerang / boomerang_mini
          let hitDmg = pr.dmg;
          if (pr.kind === 'meow_evo' && pr.hits.length > 0) {
            hitDmg = pr.dmg * Math.max(0.4, Math.pow(0.6, pr.hits.length));
          }
          this.damageEnemy(e, hitDmg, pr.kind);
          this.events.push({ type: 'hit', x: hx, z: hz, kind: pr.kind, crit: pr.isCrit });
          pr.hits.push(e.id);
          if (pr.hits.length > pr.pierce) { stopT = t; break; }
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
          if (pr.kind === 'rocket_e') {
            this.rocketEExplode(bx, bz, pr.dmg, pr.aoeR ?? JINX_E.aoeRadius * this.areaMul, null);
            stopT = bt;
            break;
          } else {
            this.damageBox(box, pr.dmg);
            this.events.push({ type: 'hit', x: bx, z: bz, kind: pr.kind });
            if (pr.pierce === 0) {
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
        if (pr.kind === 'boomerang' && !pr.returnMode) {
          pr.returnMode = true;
          pr.travel = 0;
          pr.vx = -pr.vx;
          pr.vz = -pr.vz;
          pr.hits.length = 0;
          if (pr.tier >= 1) {
            for (let k = 0; k < 4; k++) {
              const a = (k / 4) * Math.PI * 2 + 0.35;
              this.projectiles.push({
                kind: 'boomerang_mini', x: x1, z: z1,
                vx: Math.cos(a) * 14, vz: Math.sin(a) * 14,
                r: 0.28, dmg: pr.dmg * 0.55, travel: 0, range: 5.5, pierce: 999, hits: [], alive: true, tier: 0, isCrit: pr.isCrit,
              });
            }
          }
        } else {
          pr.alive = false;
          if (pr.kind === 'rocket_e') this.rocketEExplode(x1, z1, pr.dmg, pr.aoeR ?? JINX_E.aoeRadius * this.areaMul, null);
          else if (pr.kind === 'ult_r') this.ultExplode(x1, z1, pr.dmg);
        }
      }
    }
  }

  private rocketEExplode(x: number, z: number, dmg: number, r: number, direct: Enemy | null) {
    if (direct) this.damageEnemy(direct, dmg, 'rocket_e');
    this.forEnemiesInCircle(x, z, r, (e) => {
      if (e !== direct) this.damageEnemy(e, dmg * 0.85, 'rocket_e');
    });
    this.damageBoxesInCircle(x, z, r, dmg);
    this.events.push({ type: 'explode', x, z, r, kind: 'rocket_e' });
  }

  private ultExplode(x: number, z: number, baseDmg: number) {
    const r = Math.min(JINX_R.maxExplodeRadius, JINX_R.baseExplodeRadius + Math.floor(this.player.level / 4)) * this.areaMul;
    this.forEnemiesInCircle(x, z, r, (e) => this.damageEnemy(e, baseDmg * 1.45, 'ult_r'));
    this.damageBoxesInCircle(x, z, r, baseDmg);
    this.events.push({ type: 'explode', x, z, r, kind: 'ult_r' });
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
        const before = p.rCd;
        p.rCd = Math.max(0, p.rCd - SUPPLY_BOX.ultGain);
        if (before > 0 && p.rCd <= 0 && !p.rReadyAnnounced) {
          p.rReadyAnnounced = true;
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
      this.accessCards.push({ x: e.x + 0.7, z: e.z + 0.4, alive: true, age: 0 });
      this.dropXp(e.x + 0.8, e.z, 6);
      this.dropXp(e.x - 0.8, e.z, 6);
    }
    // 进化耀光力场（爆破之拥）：击杀力场内敌人触发 2m / 300 伤害爆炸
    if (this.weaponLv('radiant') >= WEAPON_EVOLVED_LEVEL) {
      const rRad = WEAPON_BY_ID.radiant.radius[5] * this.areaMul;
      if (len(e.x - p.x, e.z - p.z) <= rRad + 0.4) {
        const expR = 2.0 * this.areaMul;
        const { dmg } = this.rollDmg(300);
        this.forEnemiesInCircle(e.x, e.z, expR, (o) => {
          if (o !== e) this.damageEnemy(o, dmg, 'radiant_evo');
        });
        this.events.push({ type: 'explode', x: e.x, z: e.z, r: expR, kind: 'radiant' });
      }
    }
    // 金克丝官方被动「罪恶快感」：每击杀 70 只小怪或击杀精英触发 8s +100% 移速 & +150 技能急速
    if (e.kind === 'elite') {
      this.activateGetExcited();
    } else {
      p.passiveKills++;
      if (p.passiveKills >= JINX_PASSIVE.killsRequired) {
        p.passiveKills -= JINX_PASSIVE.killsRequired;
        this.activateGetExcited();
      }
    }
  }

  private activateGetExcited() {
    const p = this.player;
    const wasOff = p.overloadT <= 0;
    p.overloadT = JINX_PASSIVE.duration;
    if (wasOff) this.stats.overloadCount++;
    this.events.push({ type: 'overload', on: true });
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

  // ───────────────────────── 经验 / 补给 / 访问卡 ─────────────────────────
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
          p.xp += s.value * this.xpMul;
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
    for (const c of this.accessCards) {
      if (!c.alive) continue;
      c.age += dt;
      if (len(p.x - c.x, p.z - c.z) < PLAYER.radius + 1.0 && this.state === 'play' && this.endDelay < 0) {
        c.alive = false;
        this.events.push({ type: 'pickup', kind: 'card' });
        this.openAccessCardOffer();
        break;
      }
    }
  }

  private compact() {
    if (this.enemies.some((e) => !e.alive)) this.enemies = this.enemies.filter((e) => e.alive);
    this.projectiles = this.projectiles.filter((p) => p.alive);
    this.enemyBullets = this.enemyBullets.filter((b) => b.alive);
    this.shards = this.shards.filter((s) => s.alive);
    this.pickups = this.pickups.filter((s) => s.alive);
    this.accessCards = this.accessCards.filter((c) => c.alive);
  }

  // ───────────────────────── 升级与访问卡进化 ─────────────────────────
  private checkLevelUp() {
    const p = this.player;
    if (this.state !== 'play') return;
    if (p.xp >= this.xpNeed && this.endDelay < 0) {
      p.xp -= this.xpNeed;
      p.level++;
      this.stats.levelTimes.push(Math.round(this.time));
      this.levelUpIsCard = false;
      this.offer = rollLevelUpOffers(p.weapons, p.passives, this.levelUpsTaken, this.rand, false);
      this.events.push({ type: 'levelUp', level: p.level, isCard: false });
      if (this.offer.length) this.state = 'levelup';
    }
  }

  openAccessCardOffer() {
    const p = this.player;
    this.levelUpIsCard = true;
    this.offer = rollLevelUpOffers(p.weapons, p.passives, this.levelUpsTaken, this.rand, true);
    this.events.push({ type: 'levelUp', level: p.level, isCard: true });
    if (this.offer.length) this.state = 'levelup';
  }

  chooseOffer(index: number) {
    const picked = this.offer[index];
    if (this.state !== 'levelup' || !picked) return;
    const p = this.player;
    if (picked.kind === 'evolve' || picked.kind === 'weapon') {
      const wId = picked.id as WeaponId;
      const prev = p.weapons[wId] ?? 0;
      p.weapons[wId] = picked.nextLevel;
      if (prev === 0 && !p.weaponOrder.includes(wId)) p.weaponOrder.push(wId);
      if (picked.kind === 'evolve' && wId === 'iceblast') {
        this.triggerIceBlast(WEAPON_EVOLVED_LEVEL);
      }
    } else {
      const pId = picked.id as PassiveId;
      const prev = p.passives[pId] ?? 0;
      const oldMax = this.maxHpTotal;
      p.passives[pId] = picked.nextLevel;
      if (prev === 0 && !p.passiveOrder.includes(pId)) p.passiveOrder.push(pId);
      if (pId === 'maxHp') {
        const diff = this.maxHpTotal - oldMax;
        p.maxHp = this.maxHpTotal;
        p.hp = Math.min(p.maxHp, p.hp + Math.max(0, diff));
      }
    }
    this.levelUpsTaken++;
    this.offer = [];
    this.levelUpIsCard = false;
    this.state = 'play';
    this.checkLevelUp();
  }

  /** 兼容旧调用 */
  chooseUpgrade(idxOrId: number | string) {
    if (typeof idxOrId === 'number') {
      this.chooseOffer(idxOrId);
      return;
    }
    const i = this.offer.findIndex((o) => o.id === idxOrId);
    this.chooseOffer(i >= 0 ? i : 0);
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
    const built: { id: string; name: string; level: number }[] = [];
    for (const wId of this.player.weaponOrder) {
      const lv = this.player.weapons[wId] ?? 0;
      if (lv <= 0) continue;
      const def = WEAPON_BY_ID[wId];
      built.push({ id: wId, name: lv >= WEAPON_EVOLVED_LEVEL ? `★${def.evolvedName}` : def.name, level: lv });
    }
    for (const pId of this.player.passiveOrder) {
      const lv = this.player.passives[pId] ?? 0;
      if (lv <= 0) continue;
      built.push({ id: pId, name: PASSIVE_BY_ID[pId].name, level: lv });
    }
    this.stats.build = built;
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
  devFillUlt() {
    this.player.rCd = 0;
    this.player.eCd = 0;
    this.player.rReadyAnnounced = true;
  }
  devGrantEvolvedArsenal() {
    const p = this.player;
    p.weapons = { jinx_meow: 6, cyclonic: 6, radiant: 6, statikk: 6, bunnymega: 6 };
    p.weaponOrder = ['jinx_meow', 'cyclonic', 'radiant', 'statikk', 'bunnymega'];
    p.passives = { haste: 5, hpRegen: 5, maxHp: 5, crit: 5, area: 5, projectiles: 5 };
    p.passiveOrder = ['haste', 'hpRegen', 'maxHp', 'crit', 'area', 'projectiles'];
    p.maxHp = this.maxHpTotal;
    p.hp = p.maxHp;
    p.level = 25;
    this.activateGetExcited();
  }
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
