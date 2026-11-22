# Tideline (Swarm Map33 Remake) — 最新完整源代码全集 (FULL_SOURCE_BUNDLE)

> 本文件包含项目全部核心 TypeScript / HTML / CSS / 工具脚本最新未压缩源码，配合 [AI_HANDOVER.md](./AI_HANDOVER.md)、[PROGRESS.md](./PROGRESS.md)、[AGENTS.md](./AGENTS.md) 以及同域下的 `/src/*` 原始文件与 `/assets/*` 3D/WebP 资源，供任何在线 AI 直接读取还原。


---

## File: `package.json`

```json
{
  "name": "tideline",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "playtest": "tsx tools/playtest.ts"
  },
  "keywords": [],
  "type": "commonjs",
  "dependencies": {
    "three": "^0.170.0"
  },
  "devDependencies": {
    "@gltf-transform/core": "^4.5.1",
    "@gltf-transform/extensions": "^4.5.1",
    "@gltf-transform/functions": "^4.5.1",
    "@types/three": "^0.170.0",
    "meshoptimizer": "^1.3.0",
    "playwright-core": "^1.65.1",
    "sharp": "^0.35.5",
    "tsx": "^4.23.15",
    "typescript": "^7.0.2",
    "vite": "^5.4.21"
  },
  "allowScripts": {
    "esbuild@0.28.2": true,
    "esbuild@0.21.5": true
  }
}

```

---

## File: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "strict": true,
    "noUnusedLocals": false,
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "types": ["vite/client"],
    "noEmit": true
  },
  "include": ["src", "tools"]
}

```

---

## File: `vite.config.ts`

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
  },
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
});

```

---

## File: `index.html`

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <link rel="icon" href="data:," />
  <title>无尽狂潮 · 仓库区</title>
</head>
<body>
  <canvas id="gl"></canvas>

  <!-- 触控左半屏摇杆区 -->
  <div id="stick-zone">
    <div id="stick-base"><div id="stick-knob"></div></div>
  </div>

  <!-- 战斗 HUD -->
  <div id="hud" class="hidden">
    <!-- 顶部：计时器 / 首领血条 / 右上小地图 -->
    <div class="hud-top">
      <div class="mobile-top-left">
        <div class="m-portrait">
          <img src="./assets/ui/jinx_circle.webp" alt="金克丝" />
          <span id="m-lvl" class="lvl-tag">1</span>
        </div>
        <div class="m-bars">
          <div class="bar-wrap hp-wrap">
            <div id="m-hp-fill" class="bar-fill"></div>
            <div id="m-sh-fill" class="bar-shield"></div>
            <span id="m-hp-text" class="bar-label">1000 / 1000</span>
          </div>
          <div class="bar-wrap xp-wrap">
            <div id="m-xp-fill" class="bar-fill"></div>
            <span id="m-xp-text" class="bar-label">Lv.1</span>
          </div>
          <div id="m-build-mini" class="m-slots"></div>
        </div>
      </div>

      <div class="center-col">
        <div id="timer">00:00</div>
        <div id="mission-sub">距首领 14:57 · 击杀 <span id="kills">0</span></div>
        <div id="boss-bar" class="hidden">
          <div class="boss-name">深海魔鲨 · 雷克塞 <span id="boss-phase">P1</span></div>
          <div class="boss-track"><div id="boss-fill"></div><div class="boss-half"></div></div>
        </div>
      </div>

      <div class="right-col">
        <div id="minimap-box">
          <img src="./assets/map1/minimap.webp" alt="小地图" />
          <canvas id="minimap-cv" width="128" height="128"></canvas>
        </div>
        <button id="btn-pause" class="icon-btn" aria-label="暂停">⏸</button>
      </div>
    </div>

    <div id="banner" class="hidden"></div>
    <div id="overload-badge" class="hidden">⚡ 罪恶快感！+100% 移速 · +150 技能急速</div>

    <!-- PC 底部居中原版《无尽狂潮》战斗中控台 -->
    <div id="swarm-hud">
      <!-- 悬停提示浮窗 -->
      <div id="hud-tooltip" class="hidden"></div>

      <!-- 左侧 2x4 实时属性 -->
      <div id="hero-stats">
        <div class="st-cell"><span>伤害</span><b id="st-dmg">100%</b></div>
        <div class="st-cell"><span>急速</span><b id="st-ah">0</b></div>
        <div class="st-cell"><span>暴击</span><b id="st-crit">0%</b></div>
        <div class="st-cell"><span>弹数</span><b id="st-proj">+0</b></div>
        <div class="st-cell"><span>范围</span><b id="st-area">100%</b></div>
        <div class="st-cell"><span>护甲</span><b id="st-armor">0</b></div>
        <div class="st-cell"><span>移速</span><b id="st-ms">350</b></div>
        <div class="st-cell"><span>回血</span><b id="st-regen">0/s</b></div>
      </div>

      <!-- 英雄圆形头像 + 等级徽章 -->
      <div id="hero-portrait" data-tip-kind="skill" data-tip-id="passive">
        <img src="./assets/ui/jinx_circle.webp" alt="金克丝" />
        <span id="lvl-badge">Lv.1</span>
      </div>

      <!-- 中央技能栏 + 通栏血条/护盾/经验条 -->
      <div class="hud-center-deck">
        <div class="skill-strip">
          <div id="sk-passive" class="sk-slot" data-tip-kind="skill" data-tip-id="passive">
            <img src="./assets/heroes/jinx/icons/passive.webp" alt="被动" />
            <span class="sk-key">P</span>
            <span id="sk-passive-val" class="sk-badge">0/70</span>
          </div>
          <button id="pc-btn-swap" class="sk-slot clickable" data-tip-kind="skill" data-tip-id="aim">
            <img src="./assets/ui/weapons/jinx_meow.webp" alt="瞄准" />
            <span class="sk-key">C</span>
            <span id="pc-aim-val" class="sk-badge cyan">自瞄</span>
          </button>
          <button id="pc-btn-e" class="sk-slot clickable" data-tip-kind="skill" data-tip-id="e">
            <img src="./assets/heroes/jinx/icons/e.webp" alt="鱼骨头" />
            <div id="pc-e-mask" class="sk-cd-mask"></div>
            <span class="sk-key">E</span>
            <span id="pc-e-val" class="sk-cd-num"></span>
          </button>
          <button id="pc-btn-r" class="sk-slot ult-slot clickable" data-tip-kind="skill" data-tip-id="r">
            <img src="./assets/heroes/jinx/icons/r.webp" alt="死神飞弹" />
            <div id="pc-r-mask" class="sk-cd-mask"></div>
            <span class="sk-key">R</span>
            <span id="pc-r-val" class="sk-cd-num">12</span>
          </button>
          <button id="pc-btn-dash" class="sk-slot dash-slot clickable" data-tip-kind="skill" data-tip-id="dash">
            <span class="sk-dash-txt">闪避</span>
            <div id="pc-dash-mask" class="sk-cd-mask"></div>
            <span class="sk-key">空格</span>
            <span id="pc-dash-val" class="sk-cd-num"></span>
          </button>
        </div>

        <div class="bar-wrap hp-wrap pc-hp">
          <div id="hp-fill" class="bar-fill"></div>
          <div id="sh-fill" class="bar-shield"></div>
          <span id="hp-text" class="bar-label">1000 / 1000</span>
        </div>
        <div class="bar-wrap xp-wrap pc-xp">
          <div id="xp-fill" class="bar-fill"></div>
          <span id="xp-text" class="bar-label">0 / 5 EXP</span>
        </div>
      </div>

      <!-- 右侧 5 武器 + 6 被动官方图标槽位 -->
      <div id="build-panel">
        <div id="weapon-slots" class="icon-slot-row"></div>
        <div id="passive-slots" class="icon-slot-row"></div>
      </div>
    </div>

    <!-- PC 左下角极简操作提示（技能键位已标于技能槽内） -->
    <div id="pc-hints">WASD 移动 · Esc 暂停</div>

    <!-- 移动端右下角全彩官方图标技能区（桌面端自动隐藏） -->
    <div id="skills">
      <button id="btn-swap" class="skill-btn swap-btn">
        <img class="sk-icon" src="./assets/ui/weapons/jinx_meow.webp" alt="" />
        <span class="sk-title" id="swap-name">自瞄</span>
        <span class="sk-sub" id="swap-cd">C 切换</span>
      </button>
      <button id="btn-mine" class="skill-btn mine-btn">
        <img class="sk-icon" src="./assets/heroes/jinx/icons/e.webp" alt="" />
        <span class="sk-title">鱼骨头</span>
        <span class="sk-sub" id="mine-cd">就绪</span>
      </button>
      <button id="btn-ult" class="skill-btn ult-btn">
        <img class="sk-icon" src="./assets/heroes/jinx/icons/r.webp" alt="" />
        <span class="sk-title">飞弹</span>
        <span class="sk-sub" id="ult-pct">12s</span>
      </button>
      <button id="btn-dash" class="skill-btn dash-btn">
        <span class="sk-title">闪避</span>
        <span class="sk-sub" id="dash-cd">空格</span>
      </button>
    </div>
  </div>

  <!-- 开局封面 -->
  <div id="screen-start" class="modal">
    <div class="panel start-panel">
      <h1>无尽狂潮 <small>Patch 14.14 · 仓库区</small></h1>
      <p class="subtitle">第一关：仓库区（180m × 180m）· 5 武器 + 6 被动进化 · 击败深海魔鲨雷克塞</p>
      <div class="tips">
        <div><b>PC 操作：</b>WASD 移动、C/Q 切换自动瞄准、E 鱼骨头 9 连火箭、R 超究极死神飞弹、空格闪避、1/2/3 选卡</div>
        <div><b>移动触控：</b>左半屏拖动虚拟摇杆移动，右下角全彩技能键释放大招/火箭/闪避</div>
      </div>
      <div class="opt-row">
        <span>画质：</span>
        <div class="seg" id="start-quality">
          <button data-q="auto">自动</button>
          <button data-q="low">低</button>
          <button data-q="medium">中</button>
          <button data-q="high">高</button>
        </div>
        <span id="q-rec" class="muted"></span>
      </div>
      <div class="opt-row checks">
        <label><input type="checkbox" id="opt-flash" /> 减弱闪光</label>
        <label><input type="checkbox" id="opt-shake" /> 关闭震屏</label>
        <label><input type="checkbox" id="opt-mute" /> 静音</label>
      </div>
      <div id="preload-box" class="preload-box">
        <div class="preload-meta">
          <span id="preload-label">正在预载仓库区资源...</span>
          <span id="preload-pct">0%</span>
        </div>
        <div class="preload-track"><div id="preload-fill"></div></div>
      </div>
      <button id="btn-start" class="primary-btn" disabled>资源加载中...</button>
    </div>
  </div>

  <!-- 升级 / 访问卡三选一 -->
  <div id="screen-levelup" class="modal hidden">
    <div class="panel lvl-panel swarm-modal">
      <h2 id="levelup-title">等级提升 · 选择强化</h2>
      <div id="cards" class="cards"></div>
    </div>
  </div>

  <!-- 暂停菜单 -->
  <div id="screen-pause" class="modal hidden">
    <div class="panel pause-panel">
      <h2 id="pause-title">任务暂停</h2>
      <div class="opt-row">
        <span>画质：</span>
        <div class="seg" id="pause-quality">
          <button data-q="auto">自动</button>
          <button data-q="low">低</button>
          <button data-q="medium">中</button>
          <button data-q="high">高</button>
        </div>
      </div>
      <div class="opt-row checks">
        <label><input type="checkbox" id="p-flash" /> 减弱闪光</label>
        <label><input type="checkbox" id="p-shake" /> 关闭震屏</label>
        <label><input type="checkbox" id="p-mute" /> 静音</label>
      </div>
      <div class="btn-row">
        <button id="btn-resume" class="primary-btn">继续战斗</button>
        <button id="btn-pause-restart" class="sec-btn">重新开始</button>
      </div>
    </div>
  </div>

  <!-- 胜负结算 -->
  <div id="screen-end" class="modal hidden">
    <div class="panel end-panel">
      <h2 id="end-title">任务完成</h2>
      <div id="end-stats" class="end-stats"></div>
      <div id="end-build" class="end-build"></div>
      <button id="btn-restart" class="primary-btn">立即重开</button>
    </div>
  </div>

  <!-- 仅开发环境调试条 -->
  <div id="dev-bar" class="hidden">
    <button data-dev="t420">跳 7:00</button>
    <button data-dev="t870">跳 14:30</button>
    <button data-dev="boss">刷首领</button>
    <button data-dev="lvl">升 1 级</button>
    <button data-dev="ult">满大招</button>
    <button data-dev="god">无敌:关</button>
    <button data-dev="closeup">特写:关</button>
  </div>

  <script type="module" src="/src/main.ts"></script>
</body>
</html>

```

---

## File: `src/config.ts`

```ts
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

export const JINX_E = {
  /** 官方 Strawberry_JinxE: cooldownTime=8, castTime=0.35, castRange=925, missileSpeed=1750, RocketAoERadius=300, RocketCount=9 */
  cooldown: 8,
  rocketCount: 9,
  fireInterval: 0.045,
  range: 9.25,
  speed: 17.5,
  aoeRadius: 3.0,
  aoeIncrease: [0.15, 0.30, 0.45, 0.60, 0.75, 0.90],
  baseDamage: 95,
  dmgPerLevel: 8,
  critDmgBonus: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
};

export const JINX_R = {
  /** 官方 Strawberry_JinxR: cooldownTime=50, castRange=2500, mLineWidth=140, missileSpeed=1700, ExplosionSize=500..1000 */
  cooldown: 50,
  initCooldown: 12,
  range: 25,
  width: 1.4,
  speed: 17.0,
  baseDamage: 380,
  dmgPerLevel: 38,
  baseExplodeRadius: 5.0,
  maxExplodeRadius: 10.0,
};

export const JINX_PASSIVE = {
  /** 官方 Strawberry_JinxPassiveMarker: BuffDuration=8, AHBuff=150, MinionsToProcEvolve=70 */
  killsRequired: 70,
  duration: 8.0,
  msBonus: 1.0,
  ahBonus: 150,
  asBonus: 0.8,
};

export const MG = {
  name: '喵喵枪',
  bulletSpeed: 35,
  bulletRadius: 0.16,
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

```

---

## File: `src/main.ts`

```ts
import './style.css';
import { DASH, FOUNTAIN, JINX_E, JINX_PASSIVE, JINX_R, MATCH, SIM } from './config';
import { AudioFX } from './audio/audio';
import { InputManager } from './input/input';
import { webPlatform } from './platform/platform';
import { assetUrl, getAssetStats, hasCustomAssetBase, preloadStage1, preloadStage2, uiIconUrl } from './render/assets';
import { QualityManager, QualitySetting } from './render/quality';
import { Renderer } from './render/renderer';
import { Game, SimInput } from './sim/game';
import {
  MAX_PASSIVE_SLOTS, MAX_WEAPON_SLOTS, PASSIVE_BY_ID, PassiveId, WEAPON_BY_ID, WEAPON_EVOLVED_LEVEL, WeaponId,
} from './sim/weapons';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const canvas = $<HTMLCanvasElement>('gl');
const minimapCv = $<HTMLCanvasElement>('minimap-cv');
const minimapCtx = minimapCv.getContext('2d');
const hud = $('hud');
const startModal = $('screen-start');
const levelupModal = $('screen-levelup');
const pauseModal = $('screen-pause');
const endModal = $('screen-end');

const quality = new QualityManager(webPlatform);
const renderer = new Renderer(canvas, quality);
const audio = new AudioFX();
const game = new Game();

// 统一映射静态 HTML 图标到 assetUrl（仅当配置了 VITE_ASSET_BASE_URL CDN 前缀时重写）
if (hasCustomAssetBase()) {
  document.querySelectorAll<HTMLImageElement>('img[src^="./assets/"]').forEach((img) => {
    const raw = img.getAttribute('src');
    if (raw) img.src = assetUrl(raw);
  });
}

const preloadLabel = $('preload-label');
const preloadPct = $('preload-pct');
const preloadFill = $('preload-fill');
const btnStart = $<HTMLButtonElement>('btn-start');

preloadStage1((pct, label) => {
  preloadFill.style.width = `${pct}%`;
  preloadPct.textContent = `${pct}%`;
  preloadLabel.textContent = label;
}).then(async () => {
  preloadLabel.textContent = '正在编译 WebGL 着色器...';
  await renderer.warmup();
  btnStart.disabled = false;
  btnStart.textContent = '开始任务';
  preloadLabel.textContent = '✓ 仓库区核心资源就绪（后台预热首领与全武器特效...）';
  renderer.startStage2();
  preloadStage2(() => {
    preloadLabel.textContent = '✓ 全部资源预载就绪';
  });
});

const input = new InputManager($('stick-zone'), {
  swap: $('btn-swap'),
  mine: $('btn-mine'),
  ult: $('btn-ult'),
  dash: $('btn-dash'),
});

let started = false;
let manualPaused = false;
let acc = 0;
let lastMs = webPlatform.now();
let bannerTimer = 0;

// ── 选项同步（画质 / 减弱闪光 / 关闭震屏 / 静音） ──
const TIER_LABEL = { low: '低', medium: '中', high: '高' } as const;
$('q-rec').textContent = `（设备推荐：${TIER_LABEL[quality.recommended]}）`;

function syncOptionUI() {
  for (const group of ['start-quality', 'pause-quality']) {
    $(group).querySelectorAll('button').forEach((b) => {
      b.classList.toggle('active', b.dataset.q === quality.setting);
    });
  }
  const rf = renderer.vfx.reduceFlash;
  const ns = renderer.vfx.noShake;
  const mu = audio.muted;
  ($<HTMLInputElement>('opt-flash')).checked = rf;
  ($<HTMLInputElement>('p-flash')).checked = rf;
  ($<HTMLInputElement>('opt-shake')).checked = ns;
  ($<HTMLInputElement>('p-shake')).checked = ns;
  ($<HTMLInputElement>('opt-mute')).checked = mu;
  ($<HTMLInputElement>('p-mute')).checked = mu;
}

for (const group of ['start-quality', 'pause-quality']) {
  $(group).addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('button');
    if (!btn?.dataset.q) return;
    quality.setSetting(btn.dataset.q as QualitySetting, performance.now() / 1000);
    renderer.applyQuality();
    syncOptionUI();
    audio.click();
  });
}

const bindToggle = (ids: string[], get: () => boolean, set: (v: boolean) => void) => {
  for (const id of ids) {
    $(id).addEventListener('change', (e) => {
      set((e.target as HTMLInputElement).checked);
      syncOptionUI();
    });
  }
};
bindToggle(['opt-flash', 'p-flash'], () => renderer.vfx.reduceFlash, (v) => { renderer.vfx.reduceFlash = v; });
bindToggle(['opt-shake', 'p-shake'], () => renderer.vfx.noShake, (v) => { renderer.vfx.noShake = v; });
bindToggle(['opt-mute', 'p-mute'], () => audio.muted, (v) => audio.setMuted(v));
syncOptionUI();

// ── 横竖屏与安全区适配 ──
const onResize = () => renderer.resize(window.innerWidth, window.innerHeight);
window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', () => setTimeout(onResize, 120));

// ── 切后台自动暂停，回来手动继续 ──
function openPause(fromBackground = false) {
  if (!started || game.state !== 'play' || manualPaused) return;
  manualPaused = true;
  input.clear();
  input.enabled = false;
  audio.suspend();
  $('pause-title').textContent = fromBackground ? '已切回前台 · 任务暂停' : '任务暂停';
  pauseModal.classList.remove('hidden');
}

function closePause() {
  if (!manualPaused) return;
  manualPaused = false;
  pauseModal.classList.add('hidden');
  audio.resume();
  input.clear();
  input.enabled = game.state === 'play';
  lastMs = webPlatform.now();
}

webPlatform.onHide(() => openPause(true));
input.onPause = () => {
  if (manualPaused) closePause();
  else openPause(false);
};
$('btn-pause').addEventListener('click', () => openPause(false));
$('btn-resume').addEventListener('click', () => { audio.click(); closePause(); });
$('btn-pause-restart').addEventListener('click', () => { audio.click(); closePause(); restartMatch(); });

// ── 开始任务 & 立即重开 ──
$('btn-start').addEventListener('click', () => {
  audio.unlock();
  audio.click();
  started = true;
  startModal.classList.add('hidden');
  hud.classList.remove('hidden');
  input.clear();
  input.enabled = true;
  lastMs = webPlatform.now();
});

$('btn-restart').addEventListener('click', () => {
  audio.click();
  restartMatch();
});

function restartMatch() {
  game.restart();
  manualPaused = false;
  acc = 0;
  endModal.classList.add('hidden');
  levelupModal.classList.add('hidden');
  pauseModal.classList.add('hidden');
  hud.classList.remove('hidden');
  input.clear();
  input.enabled = true;
  audio.resume();
  showBanner('仓库区防线已部署，守住前 15 分钟！', 2.6);
}

// ── 升级 / 访问卡三选一（含官方图标 + 5 星进度点 + 1/2/3 快捷键） ──
let cardsShownKey = '';

function pickOfferIndex(idx: number) {
  if (game.state !== 'levelup' || !game.offer[idx]) return;
  audio.pick();
  game.chooseOffer(idx);
  if (game.state === 'levelup') {
    cardsShownKey = '';
    showLevelUp();
  } else {
    cardsShownKey = '';
    levelupModal.classList.add('hidden');
    input.clear();
    input.enabled = true;
  }
}

window.addEventListener('keydown', (e) => {
  if (game.state !== 'levelup') return;
  if (e.code === 'Digit1') pickOfferIndex(0);
  else if (e.code === 'Digit2') pickOfferIndex(1);
  else if (e.code === 'Digit3') pickOfferIndex(2);
});

function showLevelUp() {
  const key = `${game.player.level}:${game.levelUpIsCard ? 'C' : 'L'}:${game.offer.map((o) => o.id + o.nextLevel).join(',')}`;
  if (cardsShownKey === key) return;
  cardsShownKey = key;
  input.clear();
  input.enabled = false;
  $('levelup-title').textContent = game.levelUpIsCard ? '★ 精英访问卡 · 武器进化 / 强化' : `Lv.${game.player.level} 等级提升 · 选择强化`;
  const wrap = $('cards');
  wrap.innerHTML = '';
  game.offer.forEach((o, idx) => {
    const card = document.createElement('button');
    card.className = `card${o.kind === 'evolve' ? ' evo-card' : ''}`;
    const pips = o.kind === 'evolve'
      ? '<span class="card-pip on"></span>'.repeat(5)
      : Array.from({ length: 5 }, (_, i) => `<span class="card-pip${i < o.nextLevel ? ' on' : ''}"></span>`).join('');
    const partnerImg = o.evolvePartnerIcon ? `<img src="${uiIconUrl(o.evolvePartnerIcon)}" alt="" />` : '';
    card.innerHTML = `
      <div class="card-top">
        <img class="card-icon" src="${uiIconUrl(o.icon)}" alt="${o.name}" />
        <div class="card-head">
          <span class="card-tag ${o.kind}">${o.tag}</span>
          <div class="card-name">${o.name}</div>
          <div class="card-sub">${o.sub}</div>
          <div class="card-pips">${pips}</div>
        </div>
      </div>
      <div class="card-desc">${o.desc}</div>
      <div class="card-footer">
        <div class="card-hint${o.evolveReady ? ' ready' : ''}">${partnerImg}<span>${o.evolveHint ?? ''}</span></div>
        <span class="card-key">按 ${idx + 1}</span>
      </div>
    `;
    card.addEventListener('click', () => pickOfferIndex(idx));
    wrap.appendChild(card);
  });
  levelupModal.classList.remove('hidden');
}

// ── 结算界面 ──
function showEnd() {
  input.clear();
  input.enabled = false;
  const won = game.state === 'won';
  $('end-title').textContent = won ? '防线守住 · 深海魔鲨雷克塞已击破！' : '防线失守 · 金克丝已撤离';
  const s = game.stats;
  $('end-stats').innerHTML = `
    <div class="stat-box"><b>${fmtTime(s.time)}</b><span>生存时长</span></div>
    <div class="stat-box"><b>${s.kills}</b><span>击杀异兽</span></div>
    <div class="stat-box"><b>Lv.${s.level}</b><span>最终等级</span></div>
  `;
  const buildEl = $('end-build');
  buildEl.innerHTML = s.build.length
    ? s.build.map((b) => `<span class="build-pill">${b.name}${b.level > 1 ? ` ×${b.level}` : ''}</span>`).join('')
    : '<span class="muted">本局未选择强化</span>';
  endModal.classList.remove('hidden');
}

function showBanner(text: string, dur = 2.4) {
  const el = $('banner');
  el.textContent = text;
  el.classList.remove('hidden');
  bannerTimer = dur;
}

function fmtTime(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

// ── 音频与横幅事件消费 ──
function handleAudioAndBanner() {
  for (const ev of game.events) {
    if (ev.type === 'shoot') {
      if (ev.weapon === 'mg') audio.mg(ev.tier);
      else if (ev.weapon === 'cn') audio.cannon();
      else audio.ult();
    } else if (ev.type === 'hit') audio.hit();
    else if (ev.type === 'explode') {
      if (ev.kind === 'mine') audio.mineBurst();
      else if (ev.kind === 'pulse') audio.pulse();
      else audio.explode(ev.kind === 'ult');
    } else if (ev.type === 'kill') audio.kill();
    else if (ev.type === 'playerHurt') { audio.hurt(); webPlatform.vibrate(35); }
    else if (ev.type === 'pickup') ev.kind === 'xp' ? audio.xp() : ev.kind === 'card' ? audio.levelUp() : audio.heal();
    else if (ev.type === 'levelUp') audio.levelUp();
    else if (ev.type === 'swap') { audio.swap(ev.weapon); showBanner(game.player.autoAim ? '已切换：自动瞄准' : '已切换：移动朝向瞄准', 1.4); }
    else if (ev.type === 'swapReady') audio.swapReady();
    else if (ev.type === 'mine') audio.mine();
    else if (ev.type === 'dash') audio.dash();
    else if (ev.type === 'overload') audio.overload(ev.on);
    else if (ev.type === 'ultReady') { audio.ultReady(); showBanner('超究极死神飞弹已就绪 (R)', 2.2); }
    else if (ev.type === 'waveWarn') {
      audio.waveWarn(ev.tag);
      if (ev.tag === 'elite') showBanner('警告：重装精英「铁背」正在逼近！', 2.8);
      else if (ev.tag === 'climax') showBanner('警报：大规模异兽潮逼近防线！', 2.8);
    } else if (ev.type === 'enemyCharge') audio.enemyCharge(ev.kind);
    else if (ev.type === 'enemyShoot') audio.enemyShoot();
    else if (ev.type === 'bossWarn') { audio.alarm(); showBanner('警告！「深海魔鲨 · 雷克塞」即将登堤！', 4.0); }
    else if (ev.type === 'bossEnter') { audio.roar(); showBanner('深海魔鲨 · 雷克塞登场！', 3.2); }
    else if (ev.type === 'bossLand') audio.slam();
    else if (ev.type === 'bossAttack') {
      if (ev.move === 'sweep') audio.whoosh();
      else audio.telegraph();
    } else if (ev.type === 'bossPhase') { audio.phase(); showBanner('雷克塞进入狂暴二阶段！', 3.0); }
    else if (ev.type === 'fountainHeal') { audio.levelUp(); showBanner(`治愈喷泉已激活！恢复 ${ev.heal} 生命`, 2.6); }
    else if (ev.type === 'fountainReady') { audio.swap('mg'); showBanner('中央治愈喷泉已重新就绪', 2.2); }
    else if (ev.type === 'boxBreak') audio.pick();
    else if (ev.type === 'victory') audio.victory();
    else if (ev.type === 'defeat') audio.defeat();
  }
}

// ── PC 悬停提示卡片 & 中控台快捷点击 ──
const tooltipEl = $('hud-tooltip');
$('pc-btn-swap').addEventListener('click', () => {
  if (!input.enabled) return;
  game.player.autoAim = !game.player.autoAim;
  audio.swap(game.player.autoAim ? 'mg' : 'cn');
  showBanner(game.player.autoAim ? '已切换：自动瞄准' : '已切换：移动朝向瞄准', 1.4);
});
$('pc-btn-e').addEventListener('click', () => {
  if (input.enabled && game.player.eCd <= 0) window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE' }));
});
$('pc-btn-r').addEventListener('click', () => {
  if (input.enabled && game.player.rCd <= 0) window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyR' }));
});
$('pc-btn-dash').addEventListener('click', () => {
  if (input.enabled && game.player.dashCd <= 0) window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
});

function renderTooltip(kind: string, id: string) {
  let title = '';
  let badge = '';
  let desc = '';
  let sub = '';
  if (kind === 'weapon') {
    const wId = id as WeaponId;
    const def = WEAPON_BY_ID[wId];
    const lv = game.weaponLv(wId);
    const evo = lv >= WEAPON_EVOLVED_LEVEL;
    const pDef = PASSIVE_BY_ID[def.evolvePassive];
    title = evo ? def.evolvedName : def.name;
    badge = evo ? '★ 已进化' : `Lv.${lv} / 5`;
    const realCd = (def.cd[lv - 1] * game.cdMul).toFixed(2);
    const realDmg = Math.round(def.dmg[lv - 1] * game.damageMul);
    desc = `${evo ? def.evolvedDesc : def.desc(lv)}（当前实时：${realDmg} 伤 / ${realCd}s 冷却）`;
    sub = evo ? `已配合「${pDef.name}」进化` : `进化搭档：${pDef.name}${(game.passiveLv(def.evolvePassive) > 0) ? '（✓ 已拥有）' : ''}`;
  } else if (kind === 'passive') {
    const pId = id as PassiveId;
    const def = PASSIVE_BY_ID[pId];
    const lv = game.passiveLv(pId);
    title = def.name;
    badge = `Lv.${lv} / ${def.maxLevel}`;
    desc = def.desc(lv);
    sub = def.evolvesWeapons.length
      ? `可进化武器：${def.evolvesWeapons.map((w) => WEAPON_BY_ID[w].name).join('、')}`
      : '通用核心属性加成';
  } else if (kind === 'skill') {
    if (id === 'passive') {
      title = '罪恶快感（金克丝被动）';
      badge = game.player.overloadT > 0 ? `激活 ${game.player.overloadT.toFixed(1)}s` : `${game.player.passiveKills}/${JINX_PASSIVE.killsRequired}`;
      desc = `每击杀 ${JINX_PASSIVE.killsRequired} 只小怪或击杀重装精英时，获得 8 秒 +100% 移速与 +150 技能急速。`;
      sub = '官方 Patch 14.14 机制对齐';
    } else if (id === 'aim') {
      title = '瞄准模式切换';
      badge = '快捷键 C / Q';
      desc = `当前：${game.player.autoAim ? '自动锁定射程内最近目标' : '沿移动方向瞄准'}。`;
      sub = '点击或按 C 键随时切换';
    } else if (id === 'e') {
      title = '鱼骨头火箭发射器（E）';
      badge = game.player.eCd <= 0 ? '已就绪' : `${game.player.eCd.toFixed(1)}s`;
      desc = `扇形齐射 ${JINX_E.rocketCount} 枚鱼骨头猫猫火箭，命中爆炸造成范围伤害（当前冷却 ${(JINX_E.cooldown * game.cdMul).toFixed(1)}s）。`;
      sub = `射程 ${JINX_E.range}m · 基础爆炸半径 ${JINX_E.aoeRadius}m`;
    } else if (id === 'r') {
      title = '超究极死神飞弹（R）';
      badge = game.player.rCd <= 0 ? '已就绪' : `${Math.ceil(game.player.rCd)}s`;
      desc = `发射全图级超究极死神飞弹，穿透普通怪物并在命中精英/首领或终点时触发超大核爆（当前冷却 ${(JINX_R.cooldown * game.cdMul).toFixed(1)}s）。`;
      sub = `射程 ${JINX_R.range}m · 爆炸半径随等级提升`;
    } else if (id === 'dash') {
      title = '战术闪避（空格）';
      badge = game.player.dashCd <= 0 ? '已就绪' : `${game.player.dashCd.toFixed(1)}s`;
      desc = `朝移动方向高速冲刺 ${DASH.distance}m 并获得短暂无敌帧，躲避致命弹幕与预警（冷却 ${(DASH.cooldown * game.cdMul).toFixed(1)}s）。`;
    }
  }
  if (!title) return;
  tooltipEl.innerHTML = `
    <div class="tt-head"><b>${title}</b><span>${badge}</span></div>
    <div class="tt-desc">${desc}</div>
    ${sub ? `<div class="tt-sub">${sub}</div>` : ''}
  `;
  tooltipEl.classList.remove('hidden');
}

$('swarm-hud').addEventListener('mouseover', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-tip-kind]');
  if (!el || !el.dataset.tipKind || !el.dataset.tipId) return;
  renderTooltip(el.dataset.tipKind, el.dataset.tipId);
});
$('swarm-hud').addEventListener('mouseout', (e) => {
  const related = e.relatedTarget as HTMLElement | null;
  if (!related || !$('swarm-hud').contains(related) || !related.closest('[data-tip-kind]')) {
    tooltipEl.classList.add('hidden');
  }
});

// ── HUD 刷新（PC 底部居中原版 HUD + 移动端同步） ──
function updateHUD() {
  const p = game.player;
  const hpPct = Math.max(0, (p.hp / p.maxHp) * 100);
  const shPct = Math.min(100, (p.shield / p.maxHp) * 100);
  const shText = p.shield > 0 ? ` (+${Math.round(p.shield)}盾)` : '';
  const hpStr = `${Math.ceil(p.hp)} / ${p.maxHp}${shText}`;
  const xpPct = Math.min(100, (p.xp / game.xpNeed) * 100);
  const excited = p.overloadT > 0;

  // PC 底部中控台条
  $('hp-fill').style.width = `${hpPct}%`;
  $('sh-fill').style.width = `${shPct}%`;
  $('hp-text').textContent = hpStr;
  $('xp-fill').style.width = `${xpPct}%`;
  $('xp-text').textContent = `${Math.floor(p.xp)} / ${game.xpNeed} EXP`;
  $('lvl-badge').textContent = `Lv.${p.level}`;
  $('hero-portrait').classList.toggle('excited', excited);

  // 移动端左上条
  $('m-hp-fill').style.width = `${hpPct}%`;
  $('m-sh-fill').style.width = `${shPct}%`;
  $('m-hp-text').textContent = hpStr;
  $('m-xp-fill').style.width = `${xpPct}%`;
  $('m-xp-text').textContent = `Lv.${p.level}`;
  $('m-lvl').textContent = String(p.level);
  const mPort = document.querySelector('.m-portrait');
  if (mPort) mPort.classList.toggle('excited', excited);

  // PC 左侧 2x4 实时属性
  $('st-dmg').textContent = `${Math.round(game.damageMul * 100)}%`;
  $('st-ah').textContent = String(Math.round(game.abilityHaste));
  $('st-crit').textContent = `${Math.round(game.critChance * 100)}%`;
  $('st-proj').textContent = `+${game.bonusProjectiles}`;
  $('st-area').textContent = `${Math.round(game.areaMul * 100)}%`;
  $('st-armor').textContent = String(Math.round(game.armor));
  $('st-ms').textContent = String(Math.round(game.moveSpeed * 100));
  $('st-regen').textContent = `${Math.round(game.hpRegen)}/s`;

  // 顶部计时与首领血条
  $('timer').textContent = fmtTime(game.time);
  $('kills').textContent = String(game.kills);
  const sub = $('mission-sub');
  if (game.boss) {
    sub.innerHTML = `最终首领战 · 击杀 <span id="kills">${game.kills}</span>`;
    $('boss-bar').classList.remove('hidden');
    $('boss-fill').style.width = `${Math.max(0, (game.boss.hp / game.boss.maxHp) * 100)}%`;
    $('boss-phase').textContent = game.bossPhase === 2 ? 'P2 狂暴' : 'P1';
  } else {
    const left = Math.max(0, MATCH.bossTime - game.time);
    sub.innerHTML = `距首领 ${fmtTime(left)} · 击杀 <span id="kills">${game.kills}</span>`;
    $('boss-bar').classList.add('hidden');
  }
  $('overload-badge').classList.toggle('hidden', !excited);

  // PC 5 武器 + 6 被动官方图标槽位（带缓存）
  const wSlots = $('weapon-slots');
  const pSlots = $('passive-slots');
  const wHtml: string[] = [];
  const mHtml: string[] = [];
  for (let i = 0; i < MAX_WEAPON_SLOTS; i++) {
    const id = p.weaponOrder[i];
    if (!id) {
      wHtml.push('<div class="i-slot empty"></div>');
    } else {
      const lv = p.weapons[id] ?? 1;
      const def = WEAPON_BY_ID[id];
      const evo = lv >= WEAPON_EVOLVED_LEVEL;
      const pips = Array.from({ length: 5 }, (_, k) => `<span class="i-pip${evo || k < lv ? ' on' : ''}"></span>`).join('');
      wHtml.push(
        `<div class="i-slot${evo ? ' evo' : ''}" data-tip-kind="weapon" data-tip-id="${id}">`
        + `<img src="${uiIconUrl(def.icon)}" alt="${def.name}" />`
        + (evo ? '<span class="i-evo-star">★</span>' : '')
        + `<div class="i-pips">${pips}</div></div>`,
      );
      mHtml.push(`<div class="m-slot-ic${evo ? ' evo' : ''}"><img src="${uiIconUrl(def.icon)}" alt="" /></div>`);
    }
  }
  const wStr = wHtml.join('');
  if (wSlots.dataset.last !== wStr) {
    wSlots.dataset.last = wStr;
    wSlots.innerHTML = wStr;
  }

  const pHtml: string[] = [];
  for (let i = 0; i < MAX_PASSIVE_SLOTS; i++) {
    const id = p.passiveOrder[i];
    if (!id) {
      pHtml.push('<div class="i-slot passive empty"></div>');
    } else {
      const lv = p.passives[id] ?? 1;
      const def = PASSIVE_BY_ID[id];
      const pips = Array.from({ length: 5 }, (_, k) => `<span class="i-pip${k < lv ? ' on' : ''}"></span>`).join('');
      pHtml.push(
        `<div class="i-slot passive" data-tip-kind="passive" data-tip-id="${id}">`
        + `<img src="${uiIconUrl(def.icon)}" alt="${def.name}" />`
        + `<div class="i-pips">${pips}</div></div>`,
      );
      mHtml.push(`<div class="m-slot-ic"><img src="${uiIconUrl(def.icon)}" alt="" /></div>`);
    }
  }
  const pStr = pHtml.join('');
  if (pSlots.dataset.last !== pStr) {
    pSlots.dataset.last = pStr;
    pSlots.innerHTML = pStr;
  }
  const mMini = $('m-build-mini');
  const mStr = mHtml.join('');
  if (mMini.dataset.last !== mStr) {
    mMini.dataset.last = mStr;
    mMini.innerHTML = mStr;
  }

  // PC 技能冷却状态
  $('sk-passive-val').textContent = excited ? `${p.overloadT.toFixed(1)}s` : `${p.passiveKills}/${JINX_PASSIVE.killsRequired}`;
  $('pc-aim-val').textContent = p.autoAim ? '自瞄' : '朝向';

  const eMax = JINX_E.cooldown * game.cdMul;
  const ePct = p.eCd > 0 ? Math.min(100, (p.eCd / Math.max(0.1, eMax)) * 100) : 0;
  $('pc-e-mask').style.height = `${ePct}%`;
  $('pc-e-val').textContent = p.eVolleyLeft > 0 ? `${p.eVolleyLeft}` : p.eCd > 0 ? p.eCd.toFixed(1) : '';

  const rMax = Math.max(1, p.rMaxCd);
  const rPct = p.rCd > 0 ? Math.min(100, (p.rCd / rMax) * 100) : 0;
  $('pc-r-mask').style.height = `${rPct}%`;
  $('pc-r-val').textContent = p.rCd > 0 ? String(Math.ceil(p.rCd)) : '';
  $('pc-btn-r').classList.toggle('ready', p.rCd <= 0);

  const dMax = DASH.cooldown * game.cdMul;
  const dPct = p.dashCd > 0 ? Math.min(100, (p.dashCd / Math.max(0.1, dMax)) * 100) : 0;
  $('pc-dash-mask').style.height = `${dPct}%`;
  $('pc-dash-val').textContent = p.dashCd > 0 ? p.dashCd.toFixed(1) : '';

  // 移动端技能按钮状态
  $('swap-name').textContent = p.autoAim ? '自瞄' : '朝向';
  $('swap-cd').textContent = '切换';
  $('btn-swap').classList.toggle('on-cd', !p.autoAim);
  $('mine-cd').textContent = p.eVolleyLeft > 0 ? `${p.eVolleyLeft}发` : p.eCd > 0 ? `${p.eCd.toFixed(1)}s` : '就绪';
  $('btn-mine').classList.toggle('on-cd', p.eCd > 0 && p.eVolleyLeft === 0);
  $('btn-mine').classList.toggle('ready', p.eCd <= 0);
  $('ult-pct').textContent = p.rCd <= 0 ? '就绪' : `${Math.ceil(p.rCd)}s`;
  $('btn-ult').classList.toggle('ready', p.rCd <= 0);
  $('btn-ult').classList.toggle('on-cd', p.rCd > 0);
  $('dash-cd').textContent = p.dashCd > 0 ? `${p.dashCd.toFixed(1)}s` : '闪避';
  $('btn-dash').classList.toggle('on-cd', p.dashCd > 0);

  if (minimapCtx) {
    const W = minimapCv.width;
    const H = minimapCv.height;
    const S = game.map.size;
    const toX = (wx: number) => ((wx + S / 2) / S) * W;
    const toY = (wz: number) => ((wz + S / 2) / S) * H;
    minimapCtx.clearRect(0, 0, W, H);

    // 中央治愈喷泉圈状态
    if (game.fountain) {
      const f = game.fountain;
      minimapCtx.strokeStyle = f.state === 'cooldown' ? 'rgba(130,150,165,0.45)' : f.state === 'charging' ? '#ffd452' : '#38ff9c';
      minimapCtx.lineWidth = 1.6;
      minimapCtx.beginPath();
      minimapCtx.arc(toX(f.x), toY(f.z), 5.5, 0, Math.PI * 2);
      minimapCtx.stroke();
    }

    // 存活补给箱微点
    minimapCtx.fillStyle = 'rgba(255, 200, 82, 0.72)';
    for (const b of game.boxes) {
      if (!b.alive) continue;
      minimapCtx.fillRect(toX(b.x) - 1, toY(b.z) - 1, 2, 2);
    }

    // 首领竞技场金色提示圈
    const arena = game.map.landmarks.bossArena;
    if (arena) {
      minimapCtx.strokeStyle = 'rgba(255, 196, 64, 0.75)';
      minimapCtx.lineWidth = 1.5;
      minimapCtx.beginPath();
      minimapCtx.arc(toX(arena.wx), toY(arena.wz), 6, 0, Math.PI * 2);
      minimapCtx.stroke();
    }

    // 精英与首领红点
    for (const e of game.enemies) {
      if (!e.alive || (e.kind !== 'elite' && e.kind !== 'boss')) continue;
      minimapCtx.fillStyle = e.kind === 'boss' ? '#ff2e88' : '#ff8c3a';
      minimapCtx.beginPath();
      minimapCtx.arc(toX(e.x), toY(e.z), e.kind === 'boss' ? 4.5 : 2.8, 0, Math.PI * 2);
      minimapCtx.fill();
    }

    // 玩家亮青点与朝向短线
    const px = toX(p.x);
    const py = toY(p.z);
    minimapCtx.strokeStyle = '#6efaff';
    minimapCtx.lineWidth = 2;
    minimapCtx.beginPath();
    minimapCtx.moveTo(px, py);
    minimapCtx.lineTo(px + p.faceX * 8, py + p.faceZ * 8);
    minimapCtx.stroke();

    minimapCtx.fillStyle = '#32f4ff';
    minimapCtx.strokeStyle = '#072233';
    minimapCtx.lineWidth = 1.5;
    minimapCtx.beginPath();
    minimapCtx.arc(px, py, 3.8, 0, Math.PI * 2);
    minimapCtx.fill();
    minimapCtx.stroke();
  }
}

// ── 仅开发环境调试入口 ──
if (import.meta.env.DEV) {
  const devSpots: Record<string, [number, number]> = {
    hub: [-6.5, 6.0],
    fountain: [FOUNTAIN.x, FOUNTAIN.z + 12.2],
    warehouse: [14.5, 22.0],
    park: [-10.0, -18.0],
    barricade: [-18.0, 26.0],
    box: [-4.5, 29.0],
  };
  const qs = new URLSearchParams(location.search);
  const spotKey = qs.get('spot');
  if (spotKey && devSpots[spotKey]) {
    const [sx, sz] = devSpots[spotKey];
    game.player.x = sx;
    game.player.z = sz;
    game.dev.invincible = true;
  }
  if (qs.get('cam') === 'fountain') {
    renderer.camTargetOverride = { x: FOUNTAIN.x, y: 1.2, z: FOUNTAIN.z - 0.6 };
    renderer.camDistScale = Number(qs.get('camDist')) || 1.15;
  }

  const devBar = $('dev-bar');
  devBar.classList.remove('hidden');
  devBar.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('button');
    if (!btn?.dataset.dev) return;
    const act = btn.dataset.dev;
    if (act === 't420') game.devSkipTo(420);
    if (act === 't870') game.devSkipTo(870);
    if (act === 'boss') game.devSpawnBoss();
    if (act === 'lvl') game.devLevelUp();
    if (act === 'ult') game.devFillUlt();
    if (act === 'god') {
      game.dev.invincible = !game.dev.invincible;
      btn.textContent = `无敌:${game.dev.invincible ? '开' : '关'}`;
    }
    if (act === 'closeup') {
      renderer.closeup = !renderer.closeup;
      btn.textContent = `特写:${renderer.closeup ? '开' : '关'}`;
    }
  });
}

// ── 主循环 ──
const simIn: SimInput = { mx: 0, mz: 0, swap: false, mine: false, ult: false, dash: false };

function frame(now: number) {
  requestAnimationFrame(frame);
  const dtMs = Math.min(100, Math.max(0, now - lastMs));
  lastMs = now;
  const dt = dtMs / 1000;

  if (bannerTimer > 0) {
    bannerTimer -= dt;
    if (bannerTimer <= 0) $('banner').classList.add('hidden');
  }

  if (started && !manualPaused) {
    if (game.state === 'play') {
      if (quality.sampleFrame(dtMs, now / 1000)) {
        renderer.applyQuality();
        syncOptionUI();
      }
      acc += dt;
      let steps = 0;
      while (acc >= SIM.dt && steps < SIM.maxSubSteps && game.state === 'play') {
        input.read(simIn);
        game.step(simIn);
        handleAudioAndBanner();
        // 渲染消费 events
        renderer.vfx.consumeEvents(game, quality.spec.fxScale, quality.spec.particleBudget);
        game.events.length = 0;
        acc -= SIM.dt;
        steps++;
      }
      if (steps >= SIM.maxSubSteps) acc = 0;
    }

    const st: string = game.state;
    if (st === 'levelup') showLevelUp();
    else if (st === 'won' || st === 'lost') showEnd();
  }

  updateHUD();
  renderer.render(dt, game);
}

requestAnimationFrame(frame);

// 暴露只读调试句柄给自动化验收脚本（不影响正式玩法）
(window as unknown as { __TIDELINE__: unknown }).__TIDELINE__ = {
  game,
  quality,
  renderer,
  assets: { getStats: getAssetStats, assetUrl },
};

```

---

## File: `src/style.css`

```css
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
html, body {
  margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden;
  background: #88caf2; font-family: system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  user-select: none; -webkit-user-select: none; touch-action: none;
}
#gl { display: block; width: 100%; height: 100%; }
.hidden { display: none !important; }

/* 触控摇杆区 */
#stick-zone {
  position: fixed; left: 0; top: 0; width: 55%; height: 100%; z-index: 5;
  touch-action: none; pointer-events: none;
}
#stick-base {
  position: fixed; left: 0; top: 0; width: 112px; height: 112px; margin: -56px 0 0 -56px;
  border-radius: 50%; border: 2px solid rgba(255,255,255,0.65); background: rgba(16,44,68,0.22);
  opacity: 0; pointer-events: none; transition: opacity 0.1s;
}
#stick-knob {
  position: absolute; left: 50%; top: 50%; width: 46px; height: 46px; margin: -23px 0 0 -23px;
  border-radius: 50%; background: rgba(66,245,255,0.85); box-shadow: 0 2px 10px rgba(0,0,0,0.25);
}

/* HUD 容器 */
#hud {
  position: fixed; inset: 0; z-index: 10; pointer-events: none;
  padding: max(10px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(10px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
}
.hud-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.mobile-top-left { display: none; }

.center-col { text-align: center; margin: 0 auto; max-width: 380px; }
#timer {
  font-size: 24px; font-weight: 800; color: #fff; letter-spacing: 1.2px;
  text-shadow: 0 2px 6px rgba(8,22,38,0.85);
}
#mission-sub {
  font-size: 11px; font-weight: 700; color: #f2fbff; text-shadow: 0 1px 3px rgba(8,22,38,0.9);
}
#boss-bar { margin-top: 4px; width: min(320px, 60vw); margin-left: auto; margin-right: auto; }
.boss-name { font-size: 12px; font-weight: 800; color: #ffeef5; text-shadow: 0 1px 3px #280616; margin-bottom: 2px; }
.boss-track {
  position: relative; height: 12px; background: rgba(34,8,20,0.85); border-radius: 6px;
  border: 1px solid rgba(255,100,160,0.75); overflow: hidden;
}
#boss-fill { height: 100%; width: 100%; background: linear-gradient(90deg, #ff2e88, #ff6c47); transition: width 0.08s linear; }
.boss-half { position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; background: rgba(255,255,255,0.78); }

.right-col { position: fixed; right: max(12px, env(safe-area-inset-right)); top: max(10px, env(safe-area-inset-top)); display: flex; align-items: flex-start; gap: 8px; }
#minimap-box {
  position: relative; width: 116px; height: 116px; border-radius: 10px; overflow: hidden;
  border: 2px solid rgba(110, 235, 255, 0.58); background: rgba(12, 20, 28, 0.88);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.38);
}
#minimap-box img, #minimap-cv { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.icon-btn {
  pointer-events: auto; width: 38px; height: 38px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.42); background: rgba(12,26,42,0.78); color: #fff; font-size: 15px; cursor: pointer;
}

#banner {
  position: fixed; left: 50%; top: 88px; transform: translateX(-50%);
  padding: 5px 16px; border-radius: 999px; background: rgba(12,24,40,0.86); color: #fff;
  font-size: 12px; font-weight: 700; border: 1px solid rgba(255,95,160,0.75); white-space: nowrap;
}
#overload-badge {
  position: fixed; left: 50%; top: 60px; transform: translateX(-50%);
  padding: 3px 12px; border-radius: 999px;
  background: linear-gradient(90deg, rgba(255,92,190,0.92), rgba(75,247,255,0.92));
  color: #071b2b; font-size: 11px; font-weight: 800; box-shadow: 0 0 12px rgba(90,240,255,0.5);
}

/* 进度条通用 */
.bar-wrap {
  position: relative; height: 18px; background: rgba(9,18,30,0.88); border-radius: 5px; overflow: hidden;
  border: 1px solid rgba(110,205,255,0.34);
}
.xp-wrap { height: 13px; border-color: rgba(110,235,255,0.28); }
.bar-fill { height: 100%; width: 100%; transition: width 0.08s linear; }
.bar-shield {
  position: absolute; left: 0; top: 0; bottom: 0; width: 0%;
  background: linear-gradient(90deg, rgba(115,245,255,0.55), rgba(210,255,255,0.72));
  border-right: 2px solid #e6ffff; transition: width 0.08s linear; pointer-events: none;
}
#hp-fill, #m-hp-fill { background: linear-gradient(90deg, #1fc772, #4cf29a); }
#xp-fill, #m-xp-fill { background: linear-gradient(90deg, #1a9ef5, #5df6ff); width: 0%; }
.bar-label {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #fff; text-shadow: 0 1px 2px #000;
}
.xp-wrap .bar-label { font-size: 9px; color: #d8f8ff; }

/* ═════════ PC 原版《无尽狂潮》底部居中战斗中控台 ═════════ */
#swarm-hud {
  position: fixed; left: 50%; bottom: 10px; transform: translateX(-50%);
  display: flex; align-items: center; gap: 10px; padding: 8px 12px;
  background: linear-gradient(180deg, rgba(11,22,38,0.92), rgba(7,14,26,0.96));
  border: 1.5px solid rgba(90,215,255,0.48); border-radius: 14px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.52), inset 0 1px 0 rgba(255,255,255,0.14);
  pointer-events: auto;
}

/* 左侧 2x4 实时属性 */
#hero-stats {
  display: grid; grid-template-columns: repeat(2, 62px); gap: 3px 6px;
  padding-right: 8px; border-right: 1px solid rgba(110,205,255,0.22);
}
.st-cell {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 10px; color: #8cb2d1; background: rgba(255,255,255,0.04); padding: 2px 5px; border-radius: 4px;
}
.st-cell b { color: #eef9ff; font-weight: 700; font-size: 10px; }

/* 金克丝官方圆形头像 + 等级徽章 */
#hero-portrait {
  position: relative; width: 64px; height: 64px; flex-shrink: 0;
  border-radius: 50%; padding: 2px; cursor: help;
  background: linear-gradient(135deg, #5ef5ff, #23689c);
  box-shadow: 0 0 14px rgba(72,240,255,0.4);
}
#hero-portrait.excited {
  background: linear-gradient(135deg, #ff66cc, #ffe14d, #5ef5ff);
  box-shadow: 0 0 20px rgba(255,102,204,0.85);
}
#hero-portrait img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; background: #0d1d30; }
#lvl-badge {
  position: absolute; right: -4px; bottom: -2px; padding: 1px 6px; border-radius: 999px;
  background: #0d1d30; border: 1.5px solid #ffd54a; color: #ffe785;
  font-size: 10px; font-weight: 800; box-shadow: 0 2px 6px rgba(0,0,0,0.6);
}

/* 中央技能格 + 宽血条 */
.hud-center-deck { display: flex; flex-direction: column; gap: 5px; width: 286px; }
.skill-strip { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.sk-slot {
  position: relative; width: 46px; height: 46px; border-radius: 8px; overflow: hidden;
  border: 1.5px solid rgba(110,225,255,0.52); background: #0c1b2d;
  padding: 0; display: flex; align-items: center; justify-content: center;
}
.sk-slot.clickable { cursor: pointer; }
.sk-slot.clickable:hover { border-color: #ffd54a; }
.sk-slot img { width: 100%; height: 100%; object-fit: cover; display: block; }
.sk-slot.ult-slot { width: 50px; height: 50px; border-color: #ffd54a; }
.sk-slot.ult-slot.ready { box-shadow: 0 0 14px rgba(82,248,255,0.75); border-color: #62f8ff; }
.sk-slot.dash-slot { width: 44px; height: 44px; border-color: #6df5b2; background: linear-gradient(150deg, #0d2b2e, #0a1826); }
.sk-dash-txt { font-size: 12px; font-weight: 800; color: #8cffcb; }
.sk-key {
  position: absolute; left: 2px; bottom: 2px; padding: 0 4px; border-radius: 3px;
  background: rgba(5,12,20,0.88); color: #dceeff; font-size: 9px; font-weight: 800; z-index: 3;
}
.sk-badge {
  position: absolute; right: 2px; top: 2px; padding: 0 4px; border-radius: 3px;
  background: rgba(6,16,28,0.88); color: #ffd54a; font-size: 9px; font-weight: 800; z-index: 3;
}
.sk-badge.cyan { color: #6ef8ff; }
.sk-cd-mask {
  position: absolute; inset: 0; background: rgba(5,10,18,0.74); height: 0%; z-index: 2; pointer-events: none;
}
.sk-cd-num {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; color: #fff; text-shadow: 0 1px 3px #000; z-index: 3; pointer-events: none;
}
.pc-hp { height: 18px; }
.pc-xp { height: 12px; }

/* 右侧 5 武器 + 6 被动官方图标槽 */
#build-panel {
  display: flex; flex-direction: column; gap: 5px;
  padding-left: 8px; border-left: 1px solid rgba(110,205,255,0.22);
}
.icon-slot-row { display: flex; gap: 4px; align-items: center; }
.i-slot {
  position: relative; width: 38px; height: 38px; border-radius: 7px;
  border: 1.5px solid rgba(110,210,255,0.42); background: rgba(10,20,34,0.85);
  overflow: hidden; display: flex; align-items: center; justify-content: center;
}
.i-slot.passive { width: 31px; height: 31px; border-radius: 6px; border-color: rgba(105,245,175,0.42); }
.i-slot.empty { border-style: dashed; border-color: rgba(255,255,255,0.18); background: rgba(8,15,26,0.45); }
.i-slot img { width: 100%; height: 100%; object-fit: cover; display: block; }
.i-slot.evo {
  border-color: #ffd54a; box-shadow: 0 0 10px rgba(255,213,74,0.65);
}
.i-pips {
  position: absolute; left: 2px; right: 2px; bottom: 2px; display: flex; justify-content: center; gap: 2px;
  background: rgba(4,10,18,0.72); border-radius: 3px; padding: 1px 0;
}
.i-pip { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.25); }
.i-pip.on { background: #62f8ff; }
.i-slot.passive .i-pip.on { background: #6df5b2; }
.i-slot.evo .i-pip.on { background: #ffd54a; }
.i-evo-star {
  position: absolute; right: 1px; top: 0px; font-size: 10px; color: #ffd54a; text-shadow: 0 1px 2px #000;
}

/* PC 官方悬停提示窗 */
#hud-tooltip {
  position: absolute; left: 50%; bottom: calc(100% + 10px); transform: translateX(-50%);
  width: 290px; padding: 10px 12px; border-radius: 10px;
  background: rgba(9,18,32,0.96); border: 1.5px solid #ffd54a;
  box-shadow: 0 8px 24px rgba(0,0,0,0.65); color: #e8f6ff; pointer-events: none; z-index: 30;
}
.tt-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.tt-head b { font-size: 13px; color: #ffe27a; }
.tt-head span { font-size: 10px; padding: 1px 6px; border-radius: 999px; background: rgba(94,245,255,0.16); color: #7afaff; }
.tt-desc { font-size: 11px; line-height: 1.45; color: #cde6fa; }
.tt-sub { margin-top: 5px; font-size: 10px; color: #8be8b6; font-weight: 700; }

#pc-hints {
  position: fixed; left: 12px; bottom: 10px; z-index: 10;
  padding: 4px 10px; border-radius: 8px; background: rgba(8,16,28,0.68);
  border: 1px solid rgba(255,255,255,0.16); color: #c8e6ff; font-size: 10px;
}

/* 移动端技能按钮：默认桌面端隐藏 */
#skills { display: none; }

/* ═════════ 移动端 / 触控端响应式布局（与左半屏摇杆零重叠） ═════════ */
@media (pointer: coarse), (max-width: 960px), (max-height: 520px) {
  #stick-zone { pointer-events: auto; }
  #swarm-hud, #pc-hints, #hud-tooltip { display: none !important; }
  #dev-bar { top: auto !important; bottom: 8px; left: 8px; opacity: 0.78; }
  .mobile-top-left {
    display: flex; align-items: flex-start; gap: 7px; width: min(230px, 46vw);
  }
  .m-portrait {
    position: relative; width: 42px; height: 42px; flex-shrink: 0; border-radius: 50%; padding: 2px;
    background: linear-gradient(135deg, #5ef5ff, #23689c);
  }
  .m-portrait.excited { background: linear-gradient(135deg, #ff66cc, #ffe14d); box-shadow: 0 0 12px #ff66cc; }
  .m-portrait img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; }
  .lvl-tag {
    position: absolute; right: -3px; bottom: -2px; font-size: 9px; font-weight: 800;
    background: #0c1828; color: #ffd54a; border: 1px solid #ffd54a; border-radius: 999px; padding: 0 4px;
  }
  .m-bars { flex: 1; display: flex; flex-direction: column; gap: 3px; }
  .m-bars .hp-wrap { height: 15px; }
  .m-bars .xp-wrap { height: 11px; }
  .m-slots { display: flex; flex-wrap: wrap; gap: 2px; }
  .m-slot-ic {
    width: 18px; height: 18px; border-radius: 4px; border: 1px solid rgba(110,225,255,0.5); overflow: hidden;
  }
  .m-slot-ic.evo { border-color: #ffd54a; }
  .m-slot-ic img { width: 100%; height: 100%; object-fit: cover; display: block; }
  #minimap-box { width: 78px; height: 78px; }
  #timer { font-size: 18px; }

  #skills {
    position: fixed; right: max(12px, env(safe-area-inset-right)); bottom: max(12px, env(safe-area-inset-bottom));
    display: grid; grid-template-columns: repeat(2, 62px); gap: 9px; z-index: 12; pointer-events: none;
  }
  .skill-btn {
    position: relative; overflow: hidden; pointer-events: auto; width: 62px; height: 62px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.72); background: #0c1b2e; color: #fff;
    display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
    cursor: pointer; transition: transform 0.08s; padding: 0 0 6px 0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.45);
  }
  .sk-icon { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.86; pointer-events: none; }
  .sk-title, .sk-sub {
    position: relative; z-index: 1; background: rgba(6,12,22,0.76); padding: 0 5px; border-radius: 4px;
    text-shadow: 0 1px 2px #000;
  }
  .skill-btn.pressed { transform: scale(0.9); }
  .skill-btn.on-cd { opacity: 0.52; }
  .skill-btn.ready { border-color: #4bf7ff; box-shadow: 0 0 14px rgba(75,247,255,0.8); }
  .sk-title { font-size: 10px; font-weight: 800; line-height: 1.15; }
  .sk-sub { font-size: 9px; margin-top: 1px; color: #ffd54a; }
}

/* 弹窗通用 */
.modal {
  position: fixed; inset: 0; z-index: 20; display: flex; align-items: center; justify-content: center;
  background: rgba(6,14,24,0.62); backdrop-filter: blur(5px); padding: 14px;
}
.panel {
  width: min(560px, 100%); background: #f6fbff; color: #0e2438; border-radius: 16px;
  padding: 20px; box-shadow: 0 18px 50px rgba(8,22,38,0.38); border: 2px solid rgba(255,255,255,0.8);
}
.panel h1 { margin: 0 0 6px; font-size: 26px; }
.panel h1 small { font-size: 13px; color: #1982a8; font-weight: 700; }
.panel h2 { margin: 0 0 12px; font-size: 20px; }
.subtitle { margin: 0 0 14px; font-size: 13px; color: #47627a; }
.tips {
  background: #e9f4fc; border-radius: 10px; padding: 10px 12px; font-size: 12px; line-height: 1.6;
  margin-bottom: 14px; color: #1f3c56;
}
.opt-row { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; font-size: 13px; }
.seg { display: inline-flex; border: 1px solid #b8cfe0; border-radius: 8px; overflow: hidden; }
.seg button { border: 0; background: #fff; padding: 6px 12px; font-size: 12px; cursor: pointer; color: #244057; }
.seg button.active { background: #1094c9; color: #fff; font-weight: 700; }
.checks label { display: inline-flex; align-items: center; gap: 4px; margin-right: 8px; cursor: pointer; }
.muted { color: #678196; font-size: 12px; }
.btn-row { display: flex; gap: 10px; }
.preload-box {
  margin-bottom: 12px; padding: 9px 11px; border-radius: 10px;
  background: #e4f1fb; border: 1px solid #c3dcf0;
}
.preload-meta {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 12px; font-weight: 700; color: #194466; margin-bottom: 6px;
}
.preload-track {
  width: 100%; height: 8px; border-radius: 999px; background: #c9dfef; overflow: hidden;
}
#preload-fill {
  width: 0%; height: 100%; border-radius: 999px;
  background: linear-gradient(90deg, #1094c9, #22e6b8, #ff5ce0);
  transition: width 0.12s ease-out;
}
.primary-btn {
  width: 100%; border: 0; border-radius: 12px; padding: 12px 18px; font-size: 16px; font-weight: 800;
  color: #fff; background: linear-gradient(135deg, #ff7a1c, #f2551d); cursor: pointer;
}
.primary-btn:disabled {
  opacity: 0.62; cursor: wait; filter: grayscale(0.25);
}
.sec-btn {
  width: 100%; border: 1px solid #b5cadb; border-radius: 12px; padding: 12px 18px; font-size: 15px; font-weight: 700;
  color: #1c3a52; background: #fff; cursor: pointer;
}

/* 升级 / 进化暗黑霓虹卡牌弹窗（官方 Swarm 风格） */
.swarm-modal {
  width: min(800px, 100%);
  background: linear-gradient(180deg, rgba(13,24,42,0.96), rgba(8,15,28,0.98));
  color: #eef8ff; border: 1.5px solid rgba(92,225,255,0.52);
}
.swarm-modal h2 { text-align: center; color: #6ef8ff; letter-spacing: 0.6px; }
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
@media (max-width: 680px) { .cards { grid-template-columns: 1fr; } }
.card {
  position: relative; text-align: left; border: 1.5px solid rgba(110,210,255,0.36); border-radius: 12px;
  background: linear-gradient(170deg, rgba(20,38,62,0.92), rgba(11,21,36,0.96)); padding: 12px;
  cursor: pointer; display: flex; flex-direction: column; gap: 8px; color: #eef8ff;
  transition: transform 0.1s, border-color 0.1s, box-shadow 0.1s;
}
.card:hover { transform: translateY(-2px); border-color: #62f8ff; box-shadow: 0 0 18px rgba(98,248,255,0.28); }
.card.evo-card {
  border: 2px solid #ffd54a;
  background: linear-gradient(160deg, rgba(64,34,12,0.94), rgba(46,16,44,0.96));
  box-shadow: 0 0 22px rgba(255, 213, 74, 0.42);
}
.card-top { display: flex; gap: 10px; align-items: center; }
.card-icon {
  width: 58px; height: 58px; flex-shrink: 0; border-radius: 10px;
  border: 1.5px solid rgba(120,225,255,0.5); background: #091322; object-fit: cover;
}
.card.evo-card .card-icon { border-color: #ffd54a; box-shadow: 0 0 10px rgba(255,213,74,0.5); }
.card-head { flex: 1; min-width: 0; }
.card-tag {
  display: inline-block; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 999px; margin-bottom: 4px;
}
.card-tag.evolve { background: #ffd54a; color: #2b1300; }
.card-tag.weapon { background: rgba(255,155,58,0.24); color: #ffc56e; }
.card-tag.passive { background: rgba(92,245,175,0.22); color: #7dffbe; }
.card-name { font-size: 15px; font-weight: 800; color: #ffffff; }
.card-sub { font-size: 11px; color: #8cb7d8; }
.card-pips { display: flex; gap: 4px; margin-top: 2px; }
.card-pip { width: 10px; height: 5px; border-radius: 2px; background: rgba(255,255,255,0.18); }
.card-pip.on { background: #62f8ff; }
.card.evo-card .card-pip.on { background: #ffd54a; }
.card-desc { font-size: 12px; color: #cde6fa; line-height: 1.45; }
.card-footer { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-top: auto; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.1); }
.card-hint { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #9cb8d0; }
.card-hint img { width: 18px; height: 18px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.3); }
.card-hint.ready { color: #7dffbe; font-weight: 700; }
.card-key { font-size: 10px; font-weight: 800; color: #ffd54a; background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; white-space: nowrap; flex-shrink: 0; }

/* 结算 */
.end-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 12px 0; }
.stat-box { background: #e8f1f8; border-radius: 10px; padding: 10px; text-align: center; }
.stat-box b { display: block; font-size: 18px; color: #0e2e47; }
.stat-box span { font-size: 11px; color: #567086; }
.end-build { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
.build-pill { font-size: 12px; padding: 4px 10px; border-radius: 999px; background: #e2edf5; font-weight: 600; }

/* DEV 调试条 */
#dev-bar {
  position: fixed; left: 10px; top: 10px; z-index: 25; display: flex; flex-wrap: wrap; gap: 4px;
}
#dev-bar button {
  font-size: 11px; padding: 4px 7px; border-radius: 6px; border: 1px solid #fff;
  background: rgba(15,30,45,0.75); color: #fff; cursor: pointer;
}

```

---

## File: `src/types/three-libs.d.ts`

```ts
declare module 'three/examples/jsm/libs/meshopt_decoder.module.js' {
  export const MeshoptDecoder: {
    ready: Promise<void>;
    supported: boolean;
  };
}

```

---

## File: `src/input/input.ts`

```ts
/**
 * 输入层：键盘 + 触控浮动摇杆 + 技能按钮。输出与平台无关的 SimInput。
 * 所有指针按 pointerId 独立追踪，支持摇杆与技能同时按下。
 */
import type { SimInput } from '../sim/game';

type Action = 'swap' | 'mine' | 'ult' | 'dash';

export class InputManager {
  private keys = new Set<string>();
  private pressed = new Set<Action>();
  private stick = { id: -1, ox: 0, oy: 0, x: 0, y: 0, active: false };
  private stickRadius = 56;
  onPause: (() => void) | null = null;
  enabled = false;

  stickBase: HTMLElement;
  stickKnob: HTMLElement;

  constructor(private zone: HTMLElement, buttons: Record<Action, HTMLElement>) {
    this.stickBase = document.getElementById('stick-base')!;
    this.stickKnob = document.getElementById('stick-knob')!;

    window.addEventListener('keydown', (e) => {
      if (e.repeat) { if (['Space', 'KeyQ', 'KeyC', 'KeyE', 'KeyR'].includes(e.code)) e.preventDefault(); return; }
      this.keys.add(e.code);
      if (!this.enabled) return;
      if (e.code === 'Space') { this.pressed.add('dash'); e.preventDefault(); }
      if (e.code === 'KeyQ' || e.code === 'KeyC') this.pressed.add('swap');
      if (e.code === 'KeyE') this.pressed.add('mine');
      if (e.code === 'KeyR') this.pressed.add('ult');
      if (e.code === 'Escape' || e.code === 'KeyP') this.onPause?.();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));

    // 浮动摇杆：左半屏任意位置按下即为原点
    zone.addEventListener('pointerdown', (e) => {
      if (!this.enabled || this.stick.id !== -1) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      this.stick = { id: e.pointerId, ox: e.clientX, oy: e.clientY, x: 0, y: 0, active: true };
      try { zone.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      this.drawStick();
    });
    zone.addEventListener('pointermove', (e) => {
      if (e.pointerId !== this.stick.id) return;
      let dx = e.clientX - this.stick.ox, dy = e.clientY - this.stick.oy;
      const l = Math.hypot(dx, dy);
      const R = this.stickRadius;
      if (l > R) {
        // 拖得太远时原点跟随，保持手感
        const k = (l - R) / l;
        this.stick.ox += dx * k; this.stick.oy += dy * k;
        dx = e.clientX - this.stick.ox; dy = e.clientY - this.stick.oy;
      }
      this.stick.x = dx / R;
      this.stick.y = dy / R;
      this.drawStick();
    });
    const end = (e: PointerEvent) => {
      if (e.pointerId !== this.stick.id) return;
      this.releaseStick();
    };
    zone.addEventListener('pointerup', end);
    zone.addEventListener('pointercancel', end);
    zone.addEventListener('lostpointercapture', end);

    for (const [act, el] of Object.entries(buttons) as [Action, HTMLElement][]) {
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!this.enabled) return;
        this.pressed.add(act);
        el.classList.add('pressed');
        setTimeout(() => el.classList.remove('pressed'), 120);
      });
    }
    // 防止长按菜单 / 双击缩放
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('gesturestart', (e) => e.preventDefault());
  }

  private releaseStick() {
    this.stick = { id: -1, ox: 0, oy: 0, x: 0, y: 0, active: false };
    this.drawStick();
  }

  private drawStick() {
    const s = this.stick;
    if (!s.active) {
      this.stickBase.style.opacity = '0';
      return;
    }
    this.stickBase.style.opacity = '1';
    this.stickBase.style.transform = `translate(${s.ox}px, ${s.oy}px)`;
    this.stickKnob.style.transform = `translate(${s.x * this.stickRadius}px, ${s.y * this.stickRadius}px)`;
  }

  /** 清空全部输入（暂停、切后台、升级弹窗、结算时调用），不残留移动或冲刺 */
  clear() {
    this.keys.clear();
    this.pressed.clear();
    this.releaseStick();
  }

  /** 取得本帧输入；动作为单次触发，读取后清空 */
  read(out: SimInput): SimInput {
    let mx = 0, mz = 0;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) mx -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) mx += 1;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) mz -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) mz += 1;
    if (this.stick.active) {
      const l = Math.hypot(this.stick.x, this.stick.y);
      if (l > 0.18) {
        const k = Math.min(1, (l - 0.1) / 0.75) / l;
        mx = this.stick.x * k; mz = this.stick.y * k;
      }
    }
    const l = Math.hypot(mx, mz);
    if (l > 1) { mx /= l; mz /= l; }
    out.mx = mx; out.mz = mz;
    out.swap = this.pressed.has('swap');
    out.mine = this.pressed.has('mine');
    out.ult = this.pressed.has('ult');
    out.dash = this.pressed.has('dash');
    this.pressed.clear();
    return out;
  }
}

```

---

## File: `src/audio/audio.ts`

```ts
/**
 * 程序化音效（Web Audio）。在玩家点击「开始任务」时 unlock()。
 * 所有声音由振荡器与噪声合成，带同类节流，避免高峰期爆音。
 */
export class AudioFX {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private last: Record<string, number> = {};
  muted = false;
  private volume = 0.55;

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : this.volume;
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 6;
      this.master.connect(comp).connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 0.6;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  suspend() { this.ctx?.suspend(); }
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : this.volume;
  }

  private gate(key: string, minGap: number) {
    if (!this.ctx || this.muted) return false;
    const t = this.ctx.currentTime;
    if ((this.last[key] ?? -1) + minGap > t) return false;
    this.last[key] = t;
    return true;
  }

  private tone(type: OscillatorType, f0: number, f1: number, dur: number, vol: number, delay = 0) {
    const c = this.ctx!;
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master!);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  private noise(dur: number, vol: number, freq: number, q = 1, type: BiquadFilterType = 'bandpass', delay = 0, f1?: number) {
    const c = this.ctx!;
    const t = c.currentTime + delay;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    f.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(this.master!);
    s.start(t, Math.random() * 0.3);
    s.stop(t + dur + 0.02);
  }

  // ── 武器 ──
  mg(tier: number) {
    if (!this.gate('mg', 0.05)) return;
    this.noise(0.05, 0.22, 3200 + tier * 600, 2);
    this.tone('square', 1300 + tier * 150, 700, 0.04, 0.05);
  }
  cannon() {
    if (!this.gate('cn', 0.08)) return;
    this.tone('sine', 140, 45, 0.28, 0.5);
    this.noise(0.22, 0.35, 600, 0.8, 'lowpass', 0, 150);
  }
  explode(big: boolean) {
    if (!this.gate(big ? 'exb' : 'ex', big ? 0.05 : 0.07)) return;
    this.noise(big ? 0.7 : 0.28, big ? 0.6 : 0.25, big ? 900 : 1400, 0.7, 'lowpass', 0, 90);
    this.tone('sine', big ? 90 : 120, 35, big ? 0.6 : 0.22, big ? 0.5 : 0.22);
  }
  hit() {
    if (!this.gate('hit', 0.04)) return;
    this.tone('triangle', 900, 500, 0.03, 0.05);
  }
  kill() {
    if (!this.gate('kill', 0.05)) return;
    this.noise(0.09, 0.1, 2200, 3);
  }
  swap(w: 'mg' | 'cn') {
    if (!this.gate('swap', 0.1)) return;
    this.noise(0.06, 0.2, 4000, 4);
    if (w === 'cn') { this.tone('sawtooth', 160, 90, 0.22, 0.12, 0.05); this.noise(0.1, 0.25, 900, 2, 'bandpass', 0.18); }
    else { this.tone('square', 600, 1200, 0.12, 0.08, 0.05); this.noise(0.04, 0.18, 5000, 4, 'bandpass', 0.15); }
  }
  swapReady() {
    if (!this.gate('swr', 0.1)) return;
    this.tone('triangle', 1400, 1400, 0.05, 0.06);
  }
  mine() {
    if (!this.gate('mine', 0.1)) return;
    this.tone('square', 300, 520, 0.12, 0.08);
    this.tone('square', 780, 780, 0.05, 0.05, 0.12);
  }
  mineBurst() {
    if (!this.gate('mineb', 0.1)) return;
    this.tone('sawtooth', 220, 880, 0.18, 0.12);
    this.tone('sine', 880, 220, 0.4, 0.1, 0.05);
  }
  pulse() {
    if (!this.gate('pulse', 0.12)) return;
    this.tone('sine', 1200, 300, 0.25, 0.14);
  }
  dash() {
    if (!this.gate('dash', 0.1)) return;
    this.noise(0.22, 0.3, 800, 1, 'bandpass', 0, 3000);
  }
  overload(on: boolean) {
    if (!this.gate('ovl' + on, 0.3)) return;
    if (on) {
      this.tone('sawtooth', 220, 880, 0.35, 0.16);
      this.tone('square', 440, 1760, 0.35, 0.06, 0.05);
      this.tone('triangle', 1760, 1760, 0.15, 0.1, 0.4);
    } else this.tone('triangle', 880, 330, 0.25, 0.08);
  }
  ultReady() {
    if (!this.gate('ultr', 0.5)) return;
    [660, 880, 1320].forEach((f, i) => this.tone('triangle', f, f, 0.12, 0.12, i * 0.08));
  }
  ult() {
    if (!this.gate('ult', 0.3)) return;
    this.tone('sawtooth', 90, 40, 0.5, 0.35);
    this.noise(0.45, 0.45, 2000, 0.6, 'lowpass', 0, 200);
    this.tone('sine', 1800, 300, 0.3, 0.12);
  }
  // ── 拾取 / 升级 ──
  xp() {
    if (!this.gate('xp', 0.035)) return;
    this.tone('sine', 1500 + Math.random() * 400, 2200, 0.05, 0.05);
  }
  heal() {
    if (!this.gate('heal', 0.2)) return;
    [523, 659, 784].forEach((f, i) => this.tone('sine', f, f, 0.14, 0.14, i * 0.06));
  }
  levelUp() {
    if (!this.gate('lvl', 0.3)) return;
    [523, 659, 784, 1046].forEach((f, i) => this.tone('triangle', f, f * 1.01, 0.18, 0.14, i * 0.07));
  }
  pick() {
    if (!this.gate('pick', 0.1)) return;
    this.tone('square', 880, 1320, 0.08, 0.08);
  }
  hurt() {
    if (!this.gate('hurt', 0.15)) return;
    this.tone('sawtooth', 220, 90, 0.18, 0.2);
    this.noise(0.12, 0.2, 500, 1);
  }
  // ── 敌人 ──
  enemyCharge(kind: string) {
    if (!this.gate('ech' + kind, 0.25)) return;
    if (kind === 'spitter') this.tone('sine', 300, 700, 0.5, 0.05);
    else this.tone('sawtooth', 120, 260, 0.6, 0.06);
  }
  enemyShoot() {
    if (!this.gate('esh', 0.1)) return;
    this.tone('square', 520, 260, 0.1, 0.05);
  }
  waveWarn(tag?: string) {
    if (!this.gate('wave', 0.6)) return;
    const f = tag === 'climax' || tag === 'elite' ? 440 : 660;
    this.tone('triangle', f, f, 0.1, 0.07);
    this.tone('triangle', f, f, 0.1, 0.07, 0.16);
  }
  // ── 首领 ──
  alarm() {
    if (!this.gate('alarm', 0.9)) return;
    for (let i = 0; i < 3; i++) {
      this.tone('square', 740, 520, 0.35, 0.12, i * 0.45);
    }
  }
  roar() {
    if (!this.gate('roar', 1)) return;
    const c = this.ctx!;
    const t = c.currentTime;
    const o = c.createOscillator();
    const lfo = c.createOscillator();
    const lg = c.createGain();
    const g = c.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(70, t);
    o.frequency.linearRampToValueAtTime(48, t + 1.4);
    lfo.frequency.value = 18;
    lg.gain.value = 14;
    lfo.connect(lg).connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.45, t + 0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 700;
    o.connect(f).connect(g).connect(this.master!);
    o.start(t); lfo.start(t);
    o.stop(t + 1.6); lfo.stop(t + 1.6);
    this.noise(1.2, 0.3, 400, 0.6, 'lowpass', 0.05, 80);
  }
  slam() {
    if (!this.gate('slam', 0.12)) return;
    this.tone('sine', 80, 30, 0.45, 0.55);
    this.noise(0.35, 0.4, 500, 0.6, 'lowpass', 0, 80);
  }
  whoosh() {
    if (!this.gate('whoosh', 0.3)) return;
    this.noise(0.5, 0.35, 300, 0.8, 'bandpass', 0, 1800);
  }
  telegraph() {
    if (!this.gate('tele', 0.2)) return;
    this.tone('triangle', 980, 980, 0.07, 0.06);
  }
  phase() {
    if (!this.gate('phase', 1)) return;
    this.roar();
    [392, 370, 349, 330].forEach((f, i) => this.tone('square', f, f, 0.25, 0.08, 0.3 + i * 0.22));
  }
  victory() {
    [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone('triangle', f, f, 0.3, 0.16, i * 0.12));
  }
  defeat() {
    [392, 330, 262, 196].forEach((f, i) => this.tone('triangle', f, f * 0.98, 0.35, 0.14, i * 0.18));
  }
  click() {
    if (!this.gate('click', 0.05)) return;
    this.tone('triangle', 1000, 800, 0.05, 0.08);
  }
}

```

---

## File: `src/platform/platform.ts`

```ts
/**
 * 平台适配层。网页版实现放在这里；后续移植微信小游戏时，
 * 只需提供同接口的实现（wx.onShow/onHide、wx.getStorageSync、wx.createInnerAudioContext 等）。
 */
export interface Platform {
  name: string;
  now(): number;
  onHide(cb: () => void): void;
  onShow(cb: () => void): void;
  load(key: string): string | null;
  save(key: string, value: string): void;
  /** 设备信息，用于画质推荐 */
  deviceInfo(): { memoryGB: number; cores: number; dpr: number; mobile: boolean; width: number; height: number };
  vibrate(ms: number): void;
}

export const webPlatform: Platform = {
  name: 'web',
  now: () => performance.now(),
  onHide(cb) {
    document.addEventListener('visibilitychange', () => { if (document.hidden) cb(); });
    window.addEventListener('blur', cb);
    window.addEventListener('pagehide', cb);
  },
  onShow(cb) {
    document.addEventListener('visibilitychange', () => { if (!document.hidden) cb(); });
  },
  load(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  save(key, value) {
    try { localStorage.setItem(key, value); } catch { /* 隐私模式忽略 */ }
  },
  deviceInfo() {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const mobile = /Android|iPhone|iPad|iPod|Mobile|HarmonyOS/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && window.innerWidth < 1100);
    return {
      memoryGB: nav.deviceMemory ?? (mobile ? 3 : 8),
      cores: navigator.hardwareConcurrency ?? 4,
      dpr: window.devicePixelRatio || 1,
      mobile,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  },
  vibrate(ms) {
    try { navigator.vibrate?.(ms); } catch { /* ignore */ }
  },
};

```

---

## File: `src/sim/math.ts`

```ts
export interface Vec2 { x: number; z: number }

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function len(x: number, z: number) {
  return Math.sqrt(x * x + z * z);
}

export function angleDiff(a: number, b: number) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/** 可复现随机数（mulberry32），便于自动试玩复现 */
export function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 线段 p0→p1（带半径 pr）与圆 c（半径 r）首次接触的参数 t∈[0,1]，无接触返回 -1 */
export function sweepCircle(
  x0: number, z0: number, x1: number, z1: number, pr: number,
  cx: number, cz: number, r: number,
): number {
  const dx = x1 - x0, dz = z1 - z0;
  const fx = x0 - cx, fz = z0 - cz;
  const R = pr + r;
  const a = dx * dx + dz * dz;
  const c = fx * fx + fz * fz - R * R;
  if (c <= 0) return 0; // 起点已重叠
  if (a < 1e-9) return -1;
  const b = 2 * (fx * dx + fz * dz);
  const disc = b * b - 4 * a * c;
  if (disc < 0) return -1;
  const t = (-b - Math.sqrt(disc)) / (2 * a);
  return t >= 0 && t <= 1 ? t : -1;
}

/** 点到线段距离 */
export function distToSegment(px: number, pz: number, x0: number, z0: number, x1: number, z1: number) {
  const dx = x1 - x0, dz = z1 - z0;
  const l2 = dx * dx + dz * dz;
  let t = l2 > 0 ? ((px - x0) * dx + (pz - z0) * dz) / l2 : 0;
  t = clamp(t, 0, 1);
  return len(px - (x0 + dx * t), pz - (z0 + dz * t));
}

```

---

## File: `src/sim/grid.ts`

```ts
/** 均匀空间网格：每步重建，用于缩小敌人碰撞候选 */
export class SpatialGrid {
  readonly cell: number;
  readonly minX: number;
  readonly minZ: number;
  readonly cols: number;
  readonly rows: number;
  private head: Int32Array;
  private next: Int32Array;

  constructor(minX: number, minZ: number, maxX: number, maxZ: number, cell: number, capacity: number) {
    this.cell = cell;
    this.minX = minX;
    this.minZ = minZ;
    this.cols = Math.ceil((maxX - minX) / cell);
    this.rows = Math.ceil((maxZ - minZ) / cell);
    this.head = new Int32Array(this.cols * this.rows).fill(-1);
    this.next = new Int32Array(capacity).fill(-1);
  }

  clear() {
    this.head.fill(-1);
  }

  private cx(x: number) {
    const c = Math.floor((x - this.minX) / this.cell);
    return c < 0 ? 0 : c >= this.cols ? this.cols - 1 : c;
  }
  private cz(z: number) {
    const c = Math.floor((z - this.minZ) / this.cell);
    return c < 0 ? 0 : c >= this.rows ? this.rows - 1 : c;
  }

  insert(i: number, x: number, z: number) {
    if (i >= this.next.length) {
      const n = new Int32Array(this.next.length * 2).fill(-1);
      n.set(this.next);
      this.next = n;
    }
    const k = this.cz(z) * this.cols + this.cx(x);
    this.next[i] = this.head[k];
    this.head[k] = i;
  }

  /** 遍历 AABB 覆盖的格子内所有索引 */
  query(x0: number, z0: number, x1: number, z1: number, cb: (i: number) => void) {
    const a = this.cx(Math.min(x0, x1)), b = this.cx(Math.max(x0, x1));
    const c = this.cz(Math.min(z0, z1)), d = this.cz(Math.max(z0, z1));
    for (let r = c; r <= d; r++) {
      for (let col = a; col <= b; col++) {
        let i = this.head[r * this.cols + col];
        while (i !== -1) {
          cb(i);
          i = this.next[i];
        }
      }
    }
  }
}

```

---

## File: `src/sim/map_grid.ts`

```ts
import map1Data from './map1_data.json';
import { clamp, len } from './math';

function decodeBase64(b64: string): Uint8Array {
  if (typeof atob === 'function') {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  const B = (globalThis as unknown as { Buffer: { from(s: string, enc: string): Uint8Array } }).Buffer;
  return new Uint8Array(B.from(b64, 'base64'));
}

export interface MapLandmark {
  name: string;
  wx: number;
  wz: number;
  lx: number;
  lz: number;
}

/**
 * 仓库区 180x180 可行走栅格碰撞与点位查询（1m / 格，对应原版 18000x18000）。
 * 浏览器与无头 playtest 共用同一份 map1_data.json，零异步竞态。
 */
export class WalkableMap {
  readonly size = map1Data.size;
  readonly half = map1Data.size / 2;
  readonly res = map1Data.gridRes;
  readonly grid: Uint8Array;
  readonly playerSpawn = { x: map1Data.playerSpawn.wx, z: map1Data.playerSpawn.wz };
  readonly landmarks = map1Data.landmarks as {
    fountain: MapLandmark;
    bossArena: MapLandmark;
    reksaiSpawn: MapLandmark;
    shop: MapLandmark;
    factory: MapLandmark;
  };
  readonly boxSpawns = map1Data.boxSpawns;
  readonly spireSpawns = map1Data.spireSpawns;

  constructor() {
    this.grid = decodeBase64(map1Data.walkableB64);
  }

  isWalkable(wx: number, wz: number): boolean {
    const gx = Math.floor(wx + this.half);
    const gz = Math.floor(wz + this.half);
    if (gx < 0 || gx >= this.res || gz < 0 || gz >= this.res) return false;
    return this.grid[gz * this.res + gx] === 1;
  }

  /** 圆与 1m 不可走格的平滑贴墙推出（2 次迭代避免拐角抖动） */
  resolveCircle(e: { x: number; z: number }, r: number) {
    const lim = this.half - 1 - r;
    e.x = clamp(e.x, -lim, lim);
    e.z = clamp(e.z, -lim, lim);

    for (let iter = 0; iter < 2; iter++) {
      const gx0 = Math.max(0, Math.floor(e.x - r + this.half));
      const gx1 = Math.min(this.res - 1, Math.floor(e.x + r + this.half));
      const gz0 = Math.max(0, Math.floor(e.z - r + this.half));
      const gz1 = Math.min(this.res - 1, Math.floor(e.z + r + this.half));

      for (let gz = gz0; gz <= gz1; gz++) {
        for (let gx = gx0; gx <= gx1; gx++) {
          if (this.grid[gz * this.res + gx] === 1) continue;
          const x0 = gx - this.half;
          const z0 = gz - this.half;
          const nx = clamp(e.x, x0, x0 + 1);
          const nz = clamp(e.z, z0, z0 + 1);
          const dx = e.x - nx;
          const dz = e.z - nz;
          const d = len(dx, dz);
          if (d < r) {
            if (d > 1e-4) {
              e.x = nx + (dx / d) * r;
              e.z = nz + (dz / d) * r;
            } else {
              // 圆心落在不可走格内：朝最近边推出
              const cx = x0 + 0.5;
              const cz = z0 + 0.5;
              const ox = 0.5 - Math.abs(e.x - cx);
              const oz = 0.5 - Math.abs(e.z - cz);
              if (ox < oz) e.x = cx + Math.sign(e.x - cx || 1) * (0.5 + r);
              else e.z = cz + Math.sign(e.z - cz || 1) * (0.5 + r);
            }
          }
        }
      }
    }
  }

  /** 在围绕 (cx, cz) 的 [minR, maxR] 环形区域内采样可行走出生点 */
  findWalkableAround(cx: number, cz: number, minR: number, maxR: number, rand: () => number): { x: number; z: number } {
    for (let i = 0; i < 24; i++) {
      const a = rand() * Math.PI * 2;
      const r = minR + rand() * (maxR - minR);
      const x = cx + Math.cos(a) * r;
      const z = cz + Math.sin(a) * r;
      if (this.isWalkable(x, z)) return { x, z };
    }
    // 放宽半径回退（确保不卡死在走廊或边缘）
    for (let rad = minR * 0.6; rad <= maxR + 18; rad += 4) {
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2 + rand() * 0.25;
        const x = cx + Math.cos(a) * rad;
        const z = cz + Math.sin(a) * rad;
        if (this.isWalkable(x, z)) return { x, z };
      }
    }
    return { x: this.playerSpawn.x, z: this.playerSpawn.z };
  }
}

```

---

## File: `src/sim/waves.ts`

```ts
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

```

---

## File: `src/sim/weapons.ts`

```ts
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

```

---

## File: `src/sim/upgrades.ts`

```ts
export * from './weapons';

```

---

## File: `src/sim/game.ts`

```ts
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
        p.rCd = Math.max(0, p.rCd - 5);
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

```

---

## File: `src/render/assets.ts`

```ts
import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export interface ScbJson {
  pos: number[];
  uv: number[];
  alpha?: number[];
}

export interface TextureOpts {
  flipY?: boolean;
  repeat?: boolean;
  channel?: number;
  anisotropy?: number;
  srgb?: boolean;
  unique?: boolean;
}

export interface AssetStats {
  assetBase: string;
  networkFetches: number;
  cacheHits: number;
  glbCount: number;
  imageCount: number;
  jsonCount: number;
  stage1Done: boolean;
  stage2Done: boolean;
  warmupMs: number;
}

const rawBase = (import.meta.env.VITE_ASSET_BASE_URL as string | undefined)?.trim() || '.';
const ASSET_BASE = rawBase.replace(/\/+$/, '');

export function hasCustomAssetBase(): boolean {
  return ASSET_BASE !== '.';
}

export function assetUrl(relPath: string): string {
  let clean = relPath.trim().replace(/^\.\//, '');
  if (clean.startsWith('/')) clean = clean.slice(1);
  if (!clean.startsWith('assets/')) clean = `assets/${clean}`;
  if (/\.png(\?.*)?$/i.test(clean)) {
    clean = clean.replace(/\.png(\?.*)?$/i, '.webp$1');
  }
  return `${ASSET_BASE}/${clean}`;
}

const gltfLoader = new GLTFLoader();
gltfLoader.setCrossOrigin('anonymous');
gltfLoader.setMeshoptDecoder(MeshoptDecoder as never);

const glbCache = new Map<string, Promise<GLTF>>();
const imageCache = new Map<string, Promise<HTMLImageElement>>();
const uiIconPromiseCache = new Map<string, Promise<string>>();
const uiIconUrlMap = new Map<string, string>();
const texCache = new Map<string, THREE.Texture>();
const spriteCache = new Map<string, THREE.CanvasTexture>();
const jsonCache = new Map<string, Promise<ScbJson>>();
const scbGeoCache = new Map<string, Promise<THREE.BufferGeometry>>();

let networkFetches = 0;
let cacheHits = 0;
let stage1Done = false;
let stage2Done = false;
let warmupMs = 0;
let stage1Promise: Promise<void> | null = null;
let stage2Promise: Promise<void> | null = null;

export function setWarmupMs(ms: number) {
  warmupMs = Math.round(ms);
}

export function getAssetStats(): AssetStats {
  return {
    assetBase: ASSET_BASE,
    networkFetches,
    cacheHits,
    glbCount: glbCache.size,
    imageCount: imageCache.size,
    jsonCount: jsonCache.size,
    stage1Done,
    stage2Done,
    warmupMs,
  };
}

export function loadGLB(relPath: string): Promise<GLTF> {
  const url = assetUrl(relPath);
  const existing = glbCache.get(url);
  if (existing) {
    cacheHits++;
    return existing;
  }
  networkFetches++;
  const p = (async () => {
    await MeshoptDecoder.ready;
    return await new Promise<GLTF>((resolve, reject) => {
      gltfLoader.load(url, resolve, undefined, reject);
    });
  })().catch((err) => {
    glbCache.delete(url);
    throw err;
  });
  glbCache.set(url, p);
  return p;
}

export function loadImage(relPath: string): Promise<HTMLImageElement> {
  const url = assetUrl(relPath);
  const existing = imageCache.get(url);
  if (existing) {
    cacheHits++;
    return existing;
  }
  networkFetches++;
  const p = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    if (ASSET_BASE !== '.') img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image: ${url} (${String(e)})`));
    img.src = url;
  }).catch((err) => {
    imageCache.delete(url);
    throw err;
  });
  imageCache.set(url, p);
  return p;
}

export function preloadUiIcon(relPath: string): Promise<string> {
  const url = assetUrl(relPath);
  const existing = uiIconPromiseCache.get(url);
  if (existing) {
    cacheHits++;
    return existing;
  }
  // If an existing <img> in DOM already loaded this same-origin asset, snapshot it without a 2nd HTTP request
  const domImg = document.querySelector<HTMLImageElement>(`img[src="${url}"], img[src="./${url.replace(/^\.\//, '')}"]`);
  if (domImg && ASSET_BASE === '.') {
    const p = new Promise<string>((resolve) => {
      const capture = () => {
        try {
          const cv = document.createElement('canvas');
          cv.width = domImg.naturalWidth || 64;
          cv.height = domImg.naturalHeight || 64;
          cv.getContext('2d')?.drawImage(domImg, 0, 0);
          const dataUrl = cv.toDataURL('image/webp', 0.92);
          uiIconUrlMap.set(url, dataUrl);
          resolve(dataUrl);
        } catch {
          resolve(url);
        }
      };
      if (domImg.complete && domImg.naturalWidth > 0) capture();
      else {
        domImg.addEventListener('load', capture, { once: true });
        domImg.addEventListener('error', () => resolve(url), { once: true });
      }
    });
    cacheHits++;
    uiIconPromiseCache.set(url, p);
    return p;
  }
  networkFetches++;
  const p = fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
      return r.blob();
    })
    .then((blob) => {
      const objUrl = URL.createObjectURL(blob);
      uiIconUrlMap.set(url, objUrl);
      return objUrl;
    })
    .catch((err) => {
      uiIconPromiseCache.delete(url);
      throw err;
    });
  uiIconPromiseCache.set(url, p);
  return p;
}

export function uiIconUrl(relPath: string): string {
  const url = assetUrl(relPath);
  return uiIconUrlMap.get(url) ?? url;
}

function applyTexOpts(tex: THREE.Texture, opts: TextureOpts) {
  const flipY = opts.flipY ?? true;
  const repeat = opts.repeat ?? false;
  const channel = opts.channel ?? 0;
  const anisotropy = opts.anisotropy ?? 1;
  const srgb = opts.srgb ?? true;

  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.flipY = flipY;
  tex.channel = channel;
  tex.anisotropy = anisotropy;
  tex.wrapS = repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  tex.wrapT = repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
}

export function getTexture(relPath: string, opts: TextureOpts = {}): THREE.Texture {
  const url = assetUrl(relPath);
  const flipY = opts.flipY ?? true;
  const repeat = opts.repeat ?? false;
  const channel = opts.channel ?? 0;
  const anisotropy = opts.anisotropy ?? 1;
  const srgb = opts.srgb ?? true;

  if (!opts.unique) {
    const key = `${url}|${flipY ? 1 : 0}|${repeat ? 1 : 0}|${channel}|${anisotropy}|${srgb ? 1 : 0}`;
    const existing = texCache.get(key);
    if (existing) {
      cacheHits++;
      return existing;
    }
    const tex = new THREE.Texture();
    applyTexOpts(tex, opts);
    texCache.set(key, tex);
    loadImage(relPath)
      .then((img) => {
        tex.image = img;
        tex.needsUpdate = true;
      })
      .catch((err) => {
        texCache.delete(key);
        console.warn('[assets] tex load failed:', url, err);
      });
    return tex;
  }

  const tex = new THREE.Texture();
  applyTexOpts(tex, opts);
  loadImage(relPath)
    .then((img) => {
      tex.image = img;
      tex.needsUpdate = true;
    })
    .catch((err) => console.warn('[assets] tex load failed:', url, err));
  return tex;
}

export async function preloadTexture(relPath: string, opts: TextureOpts = {}): Promise<THREE.Texture> {
  const tex = getTexture(relPath, opts);
  await loadImage(relPath);
  return tex;
}

/**
 * Three.js PointsMaterial ignores Texture.repeat/offset; crop sprite-sheet cells
 * into a fixed-size CanvasTexture (never mutating canvas.width/height inside onload).
 */
export function loadSpriteCell(
  relPath: string,
  col: number,
  row: number,
  cols: number,
  rows: number,
  opts: { size?: number; glow?: boolean } = {},
): THREE.CanvasTexture {
  const size = opts.size ?? 256;
  const glow = opts.glow ?? false;
  const url = assetUrl(relPath);
  const key = `${url}|${col}|${row}|${cols}|${rows}|${size}|${glow ? 1 : 0}`;
  const existing = spriteCache.get(key);
  if (existing) {
    cacheHits++;
    return existing;
  }

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = true;
  spriteCache.set(key, tex);

  loadImage(relPath)
    .then((img) => {
      const cw = img.width / cols;
      const ch = img.height / rows;
      ctx.clearRect(0, 0, size, size);
      if (glow) {
        const half = size * 0.5;
        const grad = ctx.createRadialGradient(half, half, size * 0.045, half, half, half * 0.96);
        grad.addColorStop(0, 'rgba(110, 255, 190, 0.55)');
        grad.addColorStop(0.5, 'rgba(30, 255, 140, 0.18)');
        grad.addColorStop(1, 'rgba(0, 255, 120, 0.0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
      }
      ctx.drawImage(img, col * cw, row * ch, cw, ch, 0, 0, size, size);
      tex.needsUpdate = true;
    })
    .catch((err) => console.warn('[assets] sprite cell load failed:', url, err));

  return tex;
}

export function loadScbJson(relPath: string): Promise<ScbJson> {
  const url = assetUrl(relPath);
  const existing = jsonCache.get(url);
  if (existing) {
    cacheHits++;
    return existing;
  }
  networkFetches++;
  const p = fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
      return r.json() as Promise<ScbJson>;
    })
    .catch((err) => {
      jsonCache.delete(url);
      throw err;
    });
  jsonCache.set(url, p);
  return p;
}

export function buildScbGeo(d: ScbJson, withAlpha = false): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(d.pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(d.uv, 2));
  if (withAlpha) {
    const vertCount = d.pos.length / 3;
    const alphas = d.alpha && d.alpha.length === vertCount ? d.alpha : new Float32Array(vertCount).fill(1);
    geo.setAttribute('aAlpha', new THREE.Float32BufferAttribute(alphas, 1));
  }
  geo.computeVertexNormals();
  return geo;
}

export function loadScbGeo(relPath: string, withAlpha = false): Promise<THREE.BufferGeometry> {
  const url = assetUrl(relPath);
  const key = `${url}|${withAlpha ? 1 : 0}`;
  const existing = scbGeoCache.get(key);
  if (existing) {
    cacheHits++;
    return existing;
  }
  const p = loadScbJson(relPath)
    .then((d) => buildScbGeo(d, withAlpha))
    .catch((err) => {
      scbGeoCache.delete(key);
      throw err;
    });
  scbGeoCache.set(key, p);
  return p;
}

async function runPool<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<unknown>,
  onStep?: (done: number, total: number) => void,
) {
  let idx = 0;
  let done = 0;
  const total = items.length;
  const workers = Array.from({ length: Math.min(concurrency, total) }, async () => {
    while (idx < total) {
      const cur = idx++;
      try {
        await worker(items[cur]);
      } catch (err) {
        console.warn('[assets] preload item failed:', items[cur], err);
      } finally {
        done++;
        onStep?.(done, total);
      }
    }
  });
  await Promise.all(workers);
}

const STAGE1_GLBS = [
  'map1/warehouse_map1.glb',
  'heroes/jinx/strawberry_jinx.glb',
  'map1/props/metalbox.glb',
  'enemies/enemy_pix.glb',
  'enemies/enemy_ghoul.glb',
];

const STAGE1_IMAGES = [
  'heroes/jinx/body.webp',
  'heroes/jinx/weapon.webp',
  'map1/props/metalbox.webp',
  'map1/vfx/box_glow.webp',
  'enemies/enemy_pix.webp',
  'enemies/enemy_ghoul.webp',
  ...Array.from({ length: 22 }, (_, i) => `map1/lightmaps/${i + 1}.webp`),
  'heroes/jinx/vfx/props_tx.webp',
  'heroes/jinx/vfx/project_bolts.webp',
  'heroes/jinx/vfx/muzzle_flash.webp',
  'heroes/jinx/vfx/aura_self.webp',
  'heroes/jinx/vfx/passive_ring.webp',
  'heroes/jinx/vfx/cat_logo.webp',
  'map1/vfx/hex_plus.webp',
  'map1/vfx/lilstar.webp',
];

const STAGE1_SCB = [
  'map1/vfx/fountain_sphere.json',
  'map1/vfx/fountain_baseedge.json',
  'map1/vfx/fountain_wave.json',
  'map1/vfx/fountain_timer.json',
  'map1/vfx/fountain_timer_start.json',
  'heroes/jinx/vfx/r_rocket.json',
  'heroes/jinx/vfx/cat_rocket.json',
];

const STAGE2_GLBS = [
  'enemies/enemy_hunter.glb',
  'enemies/enemy_dasher.glb',
  'enemies/miniboss_bruiser.glb',
  'enemies/reksai.glb',
];

const STAGE2_IMAGES = [
  'enemies/enemy_hunter.webp',
  'enemies/enemy_dasher.webp',
  'enemies/miniboss_bruiser.webp',
  'enemies/reksai.webp',
  'heroes/jinx/vfx/r_trail.webp',
  'heroes/jinx/vfx/r_conetexture.webp',
  'heroes/jinx/vfx/r_shape.webp',
  'heroes/jinx/vfx/catpaw.webp',
  'heroes/jinx/vfx/base_glow.webp',
  'heroes/jinx/vfx/base_glow2.webp',
  'heroes/jinx/vfx/gun_hit.webp',
  'heroes/jinx/vfx/rocket_hit.webp',
  'heroes/jinx/vfx/catlogo_outline.webp',
  'heroes/jinx/vfx/q_shapes02.webp',
  'heroes/jinx/vfx/r_shapes01.webp',
  'heroes/jinx/vfx/e_praxis.webp',
  'heroes/jinx/vfx/e_erosion.webp',
  'heroes/jinx/vfx/r_energy.webp',
  'heroes/jinx/vfx/crater_01.webp',
  'heroes/jinx/vfx/r_craterobsi.webp',
  'heroes/jinx/vfx/circle_mis.webp',
  'heroes/jinx/vfx/lilstar_4x2.webp',
  'weapons/vfx/uwu_ball.webp',
  'weapons/vfx/crossbow_bolt.webp',
  'weapons/vfx/boom_mis.webp',
  'weapons/vfx/boom_mis_evo.webp',
  'weapons/vfx/bauble_blade.webp',
  'weapons/vfx/bauble_blade_evo.webp',
  'weapons/vfx/hr_glow.webp',
  'weapons/vfx/hr_noise.webp',
  'weapons/vfx/frost_shield.webp',
  'weapons/vfx/statikk_bolt.webp',
  'weapons/vfx/star_target.webp',
  'weapons/vfx/star_beam_core.webp',
  'weapons/vfx/star_beam_center.webp',
  'weapons/vfx/star_crack.webp',
  'weapons/vfx/frost_crack.webp',
  'weapons/vfx/frost_tile.webp',
];

const STAGE2_UI_ICONS = [
  'ui/weapons/jinx_meow.webp',
  'ui/weapons/uwu_blaster.webp',
  'ui/weapons/cyclonic.webp',
  'ui/weapons/radiant.webp',
  'ui/weapons/statikk.webp',
  'ui/weapons/crossbow.webp',
  'ui/weapons/boomerang.webp',
  'ui/weapons/bunnymega.webp',
  'ui/weapons/vortex.webp',
  'ui/weapons/iceblast.webp',
  'ui/passives/damage.webp',
  'ui/passives/haste.webp',
  'ui/passives/crit.webp',
  'ui/passives/projectiles.webp',
  'ui/passives/area.webp',
  'ui/passives/duration.webp',
  'ui/passives/maxHp.webp',
  'ui/passives/armor.webp',
  'ui/passives/hpRegen.webp',
  'ui/passives/moveSpeed.webp',
  'ui/passives/pickup.webp',
  'ui/passives/xp.webp',
];

const STAGE2_SCB = [
  'heroes/jinx/vfx/r_conehead.json',
  'heroes/jinx/vfx/passive_swirl.json',
  'heroes/jinx/vfx/r_dome.json',
  'heroes/jinx/vfx/r_swirl.json',
  'heroes/jinx/vfx/r_praxis.json',
  'heroes/jinx/vfx/r_animeburst.json',
  'heroes/jinx/vfx/q_praxis.json',
  'heroes/jinx/vfx/q_animeburst.json',
  'heroes/jinx/vfx/crater.json',
  'heroes/jinx/vfx/r_castring.json',
  'weapons/vfx/hr_outline.json',
  'weapons/vfx/hr_fire.json',
  'weapons/vfx/star_burst.json',
  'weapons/vfx/frost_ring.json',
];

export function preloadStage1(onProgress?: (pct: number, label: string) => void): Promise<void> {
  if (stage1Promise) return stage1Promise;

  const tasks: Array<{ kind: 'glb' | 'img' | 'scb'; path: string }> = [
    ...STAGE1_GLBS.map((path) => ({ kind: 'glb' as const, path })),
    ...STAGE1_IMAGES.map((path) => ({ kind: 'img' as const, path })),
    ...STAGE1_SCB.map((path) => ({ kind: 'scb' as const, path })),
  ];

  onProgress?.(0, '加载仓库区 3D 场景与金克丝模型...');

  stage1Promise = runPool(
    tasks,
    6,
    (item) => {
      if (item.kind === 'glb') return loadGLB(item.path);
      if (item.kind === 'img') return loadImage(item.path);
      return loadScbJson(item.path);
    },
    (done, total) => {
      const pct = Math.min(100, Math.round((done / total) * 100));
      const label =
        pct < 45
          ? '加载仓库区 3D 场景与金克丝模型...'
          : '加载烘焙光照贴图与核心特效...';
      onProgress?.(pct, label);
    },
  ).then(() => {
    stage1Done = true;
    onProgress?.(100, '仓库区核心资源就绪');
  });

  return stage1Promise;
}

export function preloadStage2(onDone?: () => void): Promise<void> {
  if (stage2Promise) return stage2Promise;

  const tasks: Array<{ kind: 'glb' | 'img' | 'ui' | 'scb'; path: string }> = [
    ...STAGE2_GLBS.map((path) => ({ kind: 'glb' as const, path })),
    ...STAGE2_IMAGES.map((path) => ({ kind: 'img' as const, path })),
    ...STAGE2_UI_ICONS.map((path) => ({ kind: 'ui' as const, path })),
    ...STAGE2_SCB.map((path) => ({ kind: 'scb' as const, path })),
  ];

  stage2Promise = runPool(tasks, 4, (item) => {
    if (item.kind === 'glb') return loadGLB(item.path);
    if (item.kind === 'img') return loadImage(item.path);
    if (item.kind === 'ui') return preloadUiIcon(item.path);
    return loadScbJson(item.path);
  }).then(() => {
    stage2Done = true;
    onDone?.();
  });

  return stage2Promise;
}

```

---

## File: `src/render/quality.ts`

```ts
import type { Platform } from '../platform/platform';

export type QualitySetting = 'auto' | 'low' | 'medium' | 'high';
export type QualityTier = 'low' | 'medium' | 'high';

export interface QualitySpec {
  tier: QualityTier;
  maxDpr: number;
  resScale: number;
  shadows: boolean;
  /** 装饰粒子预算（Points） */
  particleBudget: number;
  /** 每波特效（火花/碎片）预算倍率 */
  fxScale: number;
  waterSegments: number;
}

export const QUALITY_SPECS: Record<QualityTier, QualitySpec> = {
  low: { tier: 'low', maxDpr: 1.25, resScale: 0.78, shadows: false, particleBudget: 180, fxScale: 0.45, waterSegments: 1 },
  medium: { tier: 'medium', maxDpr: 1.75, resScale: 0.92, shadows: false, particleBudget: 420, fxScale: 0.8, waterSegments: 16 },
  high: { tier: 'high', maxDpr: 2.0, resScale: 1.0, shadows: true, particleBudget: 800, fxScale: 1.0, waterSegments: 32 },
};

/**
 * 画质管理器：
 * - 首次进入依据设备信息保守推荐
 * - 自动档用平滑帧时间 + 滞回 + 冷却（至少 8 秒不重复升降）避免来回跳变
 * - 降低画质时仅缩减装饰粒子、分辨率与实时阴影；核心弹幕/预警/命中反馈始终可见
 */
export class QualityManager {
  setting: QualitySetting = 'auto';
  active: QualityTier = 'medium';
  recommended: QualityTier;
  private emaMs = 16.6;
  private lastSwitchAt = -10;
  private badSec = 0;
  private goodSec = 0;

  constructor(private platform: Platform) {
    const d = platform.deviceInfo();
    // 保守推荐：手机默认中/低，桌面默认高/中
    if (d.mobile) {
      this.recommended = d.memoryGB >= 6 && d.cores >= 6 ? 'medium' : 'low';
    } else {
      this.recommended = d.cores >= 4 && d.memoryGB >= 4 ? 'high' : 'medium';
    }
    const saved = platform.load('tideline_quality') as QualitySetting | null;
    if (saved && ['auto', 'low', 'medium', 'high'].includes(saved)) {
      this.setting = saved;
    }
    this.active = this.setting === 'auto' ? this.recommended : this.setting;
  }

  get spec(): QualitySpec {
    return QUALITY_SPECS[this.active];
  }

  setSetting(s: QualitySetting, nowSec: number) {
    this.setting = s;
    this.platform.save('tideline_quality', s);
    this.active = s === 'auto' ? this.recommended : s;
    this.lastSwitchAt = nowSec;
    this.badSec = 0;
    this.goodSec = 0;
  }

  /** 每帧调用，返回是否发生了档位切换 */
  sampleFrame(dtMs: number, nowSec: number): boolean {
    if (dtMs > 0 && dtMs < 200) {
      this.emaMs = this.emaMs * 0.92 + dtMs * 0.08;
    }
    if (this.setting !== 'auto') return false;
    if (nowSec - this.lastSwitchAt < 8) return false; // 冷却 8 秒

    const dtSec = Math.min(0.1, dtMs / 1000);
    // 滞回阈值：>24ms 持续 2.5s 降档；<14.5ms 持续 6s 升档
    if (this.emaMs > 24 && this.active !== 'low') {
      this.badSec += dtSec;
      this.goodSec = 0;
      if (this.badSec > 2.5) {
        this.active = this.active === 'high' ? 'medium' : 'low';
        this.lastSwitchAt = nowSec;
        this.badSec = 0;
        return true;
      }
    } else if (this.emaMs < 14.5 && this.active !== 'high') {
      this.goodSec += dtSec;
      this.badSec = 0;
      if (this.goodSec > 6.0) {
        this.active = this.active === 'low' ? 'medium' : 'high';
        this.lastSwitchAt = nowSec;
        this.goodSec = 0;
        return true;
      }
    } else {
      this.badSec = Math.max(0, this.badSec - dtSec * 0.5);
      this.goodSec = Math.max(0, this.goodSec - dtSec * 0.5);
    }
    return false;
  }
}

```

---

## File: `src/render/style.ts`

```ts
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * 统一美术风格工具：
 * - 三阶卡通明暗（MeshToonMaterial + 渐变贴图），日景下干净、明亮、轮廓清楚
 * - 反向外壳描边，保证小屏上角色与首领轮廓可读
 * - 顶点色合并几何：一个 InstancedMesh 即可绘制多色异兽
 */

let _grad: THREE.DataTexture | null = null;
export function toonGradient(): THREE.DataTexture {
  if (_grad) return _grad;
  const data = new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]);
  _grad = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  _grad.minFilter = THREE.NearestFilter;
  _grad.magFilter = THREE.NearestFilter;
  _grad.needsUpdate = true;
  return _grad;
}

const matCache = new Map<string, THREE.MeshToonMaterial>();
export function toon(hex: number, opts: { emissive?: number; vertexColors?: boolean } = {}): THREE.MeshToonMaterial {
  const key = `${hex}_${opts.emissive ?? 0}_${opts.vertexColors ? 1 : 0}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshToonMaterial({
      color: hex,
      gradientMap: toonGradient(),
      emissive: opts.emissive ?? 0x000000,
      vertexColors: !!opts.vertexColors,
    });
    matCache.set(key, m);
  }
  return m;
}

/** 不共享缓存的独立材质（需要单独改 emissive 时使用） */
export function toonUnique(hex: number): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({ color: hex, gradientMap: toonGradient() });
}

export const OUTLINE_MAT = new THREE.MeshBasicMaterial({ color: 0x14202c, side: THREE.BackSide });

/** 为一个 Group 里的所有网格加反向外壳描边 */
export function addOutline(group: THREE.Object3D, thickness = 0.045, mat = OUTLINE_MAT) {
  const list: THREE.Mesh[] = [];
  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh && !(o as THREE.Mesh).userData.noOutline) list.push(o as THREE.Mesh);
  });
  for (const m of list) {
    const geo = m.geometry as THREE.BufferGeometry;
    geo.computeBoundingBox();
    const size = new THREE.Vector3();
    geo.boundingBox!.getSize(size);
    const o = new THREE.Mesh(geo, mat);
    o.userData.noOutline = true;
    o.scale.set(
      1 + (thickness * 2) / Math.max(size.x, 0.05),
      1 + (thickness * 2) / Math.max(size.y, 0.05),
      1 + (thickness * 2) / Math.max(size.z, 0.05),
    );
    o.castShadow = false;
    m.add(o);
  }
}

/** 给几何体写入统一顶点色 */
export function paint(geo: THREE.BufferGeometry, hex: number): THREE.BufferGeometry {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const c = new THREE.Color(hex);
  const n = g.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  // 统一属性集合，便于合并
  if (g.attributes.uv) g.deleteAttribute('uv');
  return g;
}

export function place(geo: THREE.BufferGeometry, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, s: number | [number, number, number] = 1) {
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz));
  const sc = Array.isArray(s) ? new THREE.Vector3(...s) : new THREE.Vector3(s, s, s);
  m.compose(new THREE.Vector3(x, y, z), q, sc);
  geo.applyMatrix4(m);
  return geo;
}

export function merge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const g = mergeGeometries(parts, false)!;
  g.computeVertexNormals();
  return g;
}

/** 柔和圆形粒子贴图 */
let _soft: THREE.CanvasTexture | null = null;
export function softDot(): THREE.CanvasTexture {
  if (_soft) return _soft;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.35, 'rgba(255,255,255,0.85)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  _soft = new THREE.CanvasTexture(c);
  return _soft;
}

/** 接地柔影贴图 */
let _blob: THREE.CanvasTexture | null = null;
export function blobShadowTex(): THREE.CanvasTexture {
  if (_blob) return _blob;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(32, 32, 4, 32, 32, 31);
  grd.addColorStop(0, 'rgba(20,32,44,0.55)');
  grd.addColorStop(0.6, 'rgba(20,32,44,0.32)');
  grd.addColorStop(1, 'rgba(20,32,44,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  _blob = new THREE.CanvasTexture(c);
  return _blob;
}

```

---

## File: `src/render/env.ts`

```ts
import * as THREE from 'three';

/**
 * 程序化晴日海岸环境贴图（IBL）：
 * 无需外部 HDR 文件，通过 PMREMGenerator 生成包含天光、海平线亮带、地面反光与太阳高光的环境贴图，
 * 赋予 PBR 材质（金属机械臂、护目镜、武器、防浪外套）真实的高光反射层次。
 */
export function buildSunnyEnv(gl: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(gl);
  pmrem.compileEquirectangularShader();

  const envScene = new THREE.Scene();

  const skyGeo = new THREE.SphereGeometry(20, 32, 20);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        vec3 zenith = vec3(0.345, 0.698, 0.922);   // #58b2eb
        vec3 horizon = vec3(0.851, 0.953, 1.000);  // #d9f3ff
        vec3 ground = vec3(0.722, 0.710, 0.671);   // #b8b5ab
        vec3 col = d.y >= 0.0
          ? mix(horizon, zenith, pow(d.y, 0.58))
          : mix(horizon * 0.92, ground, pow(-d.y, 0.45));
        vec3 sunDir = normalize(vec3(0.45, 0.82, 0.35));
        float sunDot = max(dot(d, sunDir), 0.0);
        col += vec3(1.0, 0.96, 0.86) * (pow(sunDot, 28.0) * 1.35 + pow(sunDot, 4.0) * 0.22);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  envScene.add(sky);

  // 两块柔光面板增强金属与护目镜的反射带
  const panelGeo = new THREE.PlaneGeometry(10, 4);
  const warmPanelMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.05, 1.8), side: THREE.DoubleSide });
  const warmPanel = new THREE.Mesh(panelGeo, warmPanelMat);
  warmPanel.position.set(7, 8, 6);
  warmPanel.lookAt(0, 0, 0);

  const coolPanelMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.4, 1.9, 2.2), side: THREE.DoubleSide });
  const coolPanel = new THREE.Mesh(panelGeo, coolPanelMat);
  coolPanel.position.set(-8, 6, -5);
  coolPanel.lookAt(0, 0, 0);

  envScene.add(warmPanel, coolPanel);

  const rt = pmrem.fromScene(envScene, 0.03);

  skyGeo.dispose();
  skyMat.dispose();
  panelGeo.dispose();
  warmPanelMat.dispose();
  coolPanelMat.dispose();
  pmrem.dispose();

  return rt.texture;
}

```

---

## File: `src/render/world.ts`

```ts
import * as THREE from 'three';
import { ARENA } from '../config';
import type { FountainState } from '../sim/game';
import { addOutline, merge, paint, place, toon } from './style';

/**
 * 「晴日海堤货运站」场景（美术重制版）
 * 色彩分工：
 *   - 环境：蓝天青海、浅暖灰混凝土、白色防浪墙、橘黄港机 —— 明亮但低饱和/低对比
 *   - 玩法：敌弹玫红、预警玫红、经验晶片黄绿、友方青蓝/金橙 —— 高饱和，只留给战斗信息
 * 构图：高大的岸桥只放在北侧海面（画面上方），不遮挡角色；南侧只放低矮设施。
 */
export interface WorldView {
  group: THREE.Group;
  sun: THREE.DirectionalLight;
  ready?: Promise<void>;
  update(t: number, progress: number, alarm: number, warnings: { entrance: string; tag?: string }[], tier: string, fountain?: FountainState): void;
  setShadows(on: boolean): void;
}

const HW = ARENA.halfW;
const HH = ARENA.halfH;

export function buildWorld(scene: THREE.Scene): WorldView {
  scene.background = new THREE.Color(0x7cc7ea);
  scene.fog = null;
  const group = new THREE.Group();
  scene.add(group);

  // ── 光照：天光 + 暖色日光 ──
  group.add(new THREE.HemisphereLight(0xd8f1ff, 0xb9a58a, 1.25));
  group.add(new THREE.AmbientLight(0xffffff, 0.25));
  const sun = new THREE.DirectionalLight(0xfff0d4, 2.1);
  sun.position.set(22, 40, 16);
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.near = 5; sc.far = 120; sc.left = -46; sc.right = 46; sc.top = 40; sc.bottom = -40;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.03;
  group.add(sun, sun.target);

  // ── 海水：单张四边形 + 着色器（浪纹、日光闪烁、岸边白沫、首领浪涌） ──
  const waterUniforms = {
    uTime: { value: 0 },
    uAlarm: { value: 0 },
    uHalf: { value: new THREE.Vector2(HW + 3.2, HH + 3.2) },
    uDetail: { value: 1 },
  };
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 320),
    new THREE.ShaderMaterial({
      uniforms: waterUniforms,
      vertexShader: /* glsl */ `
        varying vec2 vW;
        void main(){
          vec4 w = modelMatrix * vec4(position,1.0);
          vW = w.xz;
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime; uniform float uAlarm; uniform vec2 uHalf; uniform float uDetail;
        varying vec2 vW;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
        float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
          return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
        void main(){
          // 到平台边缘的距离（矩形 SDF）
          vec2 d = abs(vW) - uHalf;
          float dist = length(max(d,0.0)) + min(max(d.x,d.y),0.0);
          float sp = 1.0 + uAlarm * 1.6;
          float t = uTime * sp;
          vec3 deep = vec3(0.07,0.42,0.62);
          vec3 shallow = vec3(0.16,0.72,0.80);
          vec3 col = mix(shallow, deep, smoothstep(2.0, 26.0, dist));
          // 斜向浪纹
          float w1 = sin(vW.x*0.35 + vW.y*0.22 + t*1.3 + n(vW*0.15)*4.0);
          float w2 = sin(vW.x*-0.18 + vW.y*0.41 - t*1.0 + n(vW*0.2+7.0)*3.0);
          float waves = (w1 + w2) * 0.5;
          col += vec3(0.05,0.08,0.08) * waves * uDetail;
          // 日光闪烁
          float g = n(vW*1.6 + vec2(t*0.6, -t*0.4)) * n(vW*0.9 - vec2(t*0.3, t*0.5));
          col += vec3(1.0) * smoothstep(0.42, 0.62, g) * 0.55 * uDetail;
          // 岸边白沫（随时间呼吸，首领入场时更宽）
          float foamW = 1.1 + 0.35*sin(t*1.7 + vW.x*0.3) + uAlarm*1.8;
          float foam = smoothstep(foamW, 0.0, dist) * (0.65 + 0.35*n(vW*2.5 + t));
          col = mix(col, vec3(0.97,0.99,1.0), clamp(foam,0.0,1.0)*0.9);
          // 首领警报：远处浪涌白线
          float surge = smoothstep(0.93, 1.0, sin(dist*0.55 - t*3.0)) * uAlarm;
          col = mix(col, vec3(0.95,0.98,1.0), surge*0.6);
          gl_FragColor = vec4(col,1.0);
          #include <colorspace_fragment>
        }`,
    }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = -1.3;
  group.add(water);

  // ── 货运平台：混凝土甲板 + 侧壁 ──
  const deckW = HW * 2 + 6, deckH = HH * 2 + 6;
  const deckSide = new THREE.Mesh(new THREE.BoxGeometry(deckW, 1.6, deckH), toon(0xa9b0b4));
  deckSide.position.y = -0.82;
  group.add(deckSide);
  const deckTex = makeDeckTexture(deckW, deckH);
  const deck = new THREE.Mesh(
    new THREE.PlaneGeometry(deckW, deckH),
    new THREE.MeshToonMaterial({ map: deckTex, gradientMap: undefined }),
  );
  deck.rotation.x = -Math.PI / 2;
  deck.position.y = 0;
  deck.receiveShadow = true;
  group.add(deck);

  // 岸线黄色警示边 + 黑色橡胶护舷（东/西/北三侧临海）
  const curbMat = toon(0xf2c230);
  const fenderMat = toon(0x24292e);
  const addCurb = (x: number, z: number, w: number, d: number) => {
    const c = new THREE.Mesh(new THREE.BoxGeometry(w, 0.22, d), curbMat);
    c.position.set(x, 0.11, z);
    c.receiveShadow = true;
    group.add(c);
  };
  addCurb(0, -deckH / 2 + 0.2, deckW, 0.4);
  addCurb(0, deckH / 2 - 0.2, deckW, 0.4);
  addCurb(-deckW / 2 + 0.2, 0, 0.4, deckH);
  addCurb(deckW / 2 - 0.2, 0, 0.4, deckH);
  const fenderGeo = new THREE.CylinderGeometry(0.42, 0.42, 1.1, 10);
  const fenders = new THREE.InstancedMesh(fenderGeo, fenderMat, 64);
  let fi = 0;
  const dummy = new THREE.Object3D();
  for (let x = -deckW / 2 + 4; x < deckW / 2 - 2; x += 6) {
    for (const z of [-deckH / 2 - 0.3, deckH / 2 + 0.3]) {
      dummy.position.set(x, -0.55, z);
      dummy.rotation.set(0, 0, Math.PI / 2);
      dummy.updateMatrix();
      fenders.setMatrixAt(fi++, dummy.matrix);
    }
  }
  for (let z = -deckH / 2 + 4; z < deckH / 2 - 2; z += 6) {
    for (const x of [-deckW / 2 - 0.3, deckW / 2 + 0.3]) {
      dummy.position.set(x, -0.55, z);
      dummy.rotation.set(Math.PI / 2, 0, 0);
      dummy.updateMatrix();
      fenders.setMatrixAt(fi++, dummy.matrix);
    }
  }
  fenders.count = fi;
  group.add(fenders);

  // 系船柱（沿岸一圈）
  const bollardGeo = merge([
    paint(place(new THREE.CylinderGeometry(0.22, 0.28, 0.5, 10), 0, 0.25, 0), 0x2f3a44),
    paint(place(new THREE.CylinderGeometry(0.34, 0.34, 0.12, 10), 0, 0.52, 0), 0x2f3a44),
  ]);
  const bollards = new THREE.InstancedMesh(bollardGeo, toon(0xffffff, { vertexColors: true }), 48);
  let bi = 0;
  for (let x = -deckW / 2 + 7; x < deckW / 2 - 4; x += 9) {
    for (const z of [deckH / 2 - 0.9]) {
      dummy.position.set(x, 0, z); dummy.rotation.set(0, 0, 0); dummy.updateMatrix();
      bollards.setMatrixAt(bi++, dummy.matrix);
    }
  }
  bollards.count = bi;
  bollards.castShadow = true;
  group.add(bollards);

  // ── 白色防浪墙（四边分段，留出入口） ──
  const wallMat = toon(0xf4f6f8);
  const wallCapMat = toon(0xdfe5ea);
  const stripeMat = toon(0x2f7fa8);
  const addWall = (x: number, z: number, w: number, d: number, h = 1.35) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    m.position.set(x, h / 2, z);
    m.castShadow = true; m.receiveShadow = true;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.16, 0.18, d + 0.16), wallCapMat);
    cap.position.set(x, h + 0.09, z);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.14, d + 0.02), stripeMat);
    stripe.position.set(x, h * 0.62, z);
    group.add(m, cap, stripe);
  };
  // 北（临海，较高）
  addWall(-17, -HH - 1.4, 22, 1.2, 1.6);
  addWall(17, -HH - 1.4, 22, 1.2, 1.6);
  // 南（较低）
  addWall(-17.5, HH + 1.4, 21, 1.0, 0.9);
  addWall(17.5, HH + 1.4, 21, 1.0, 0.9);
  // 东西
  addWall(-HW - 1.4, -14, 1.0, 16, 1.1);
  addWall(-HW - 1.4, 14, 1.0, 16, 1.1);
  addWall(HW + 1.4, -14, 1.0, 16, 1.1);
  addWall(HW + 1.4, 14, 1.0, 16, 1.1);

  // 北侧海中消波块（四脚体，实例化）
  const tetraGeo = makeTetrapod();
  const tetraMat = toon(0xe9edf0);
  const tetras = new THREE.InstancedMesh(tetraGeo, tetraMat, 90);
  let ti = 0;
  const rnd = mulberry(7);
  for (let x = -deckW / 2 - 6; x < deckW / 2 + 6; x += 2.3) {
    for (let row = 0; row < 2; row++) {
      if (Math.abs(x) < 5.5 && row === 0) continue; // 北堤缺口：异兽从这里爬上来
      dummy.position.set(x + rnd() * 0.8, -1.0 + rnd() * 0.3, -deckH / 2 - 2.0 - row * 2.1 - rnd() * 0.6);
      dummy.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
      dummy.scale.setScalar(0.9 + rnd() * 0.35);
      dummy.updateMatrix();
      tetras.setMatrixAt(ti++, dummy.matrix);
    }
  }
  tetras.count = ti;
  group.add(tetras);

  // ── 集装箱堆（与 ARENA.blocks 碰撞体对齐） ──
  const containerColors = [0xe8742c, 0x2f7e9e, 0xf0e2c4, 0x3f8a6a, 0xd2453b, 0x2b4f7a];
  let ci = 0;
  for (const [cx, cz, hw, hh] of ARENA.blocks) {
    const pillar = hw < 1.6 && hh < 1.6;
    if (pillar) {
      group.add(makeGatePillar(cx, cz, hw, hh));
      continue;
    }
    // 两层堆叠，上层略错位，增加层次
    const stack = new THREE.Group();
    const vertical = hh > hw;
    const len = (vertical ? hh : hw) * 2;
    const wid = (vertical ? hw : hh) * 2;
    const nCols = Math.max(1, Math.round(wid / 2.4));
    for (let k = 0; k < nCols; k++) {
      const off = -wid / 2 + (k + 0.5) * (wid / nCols);
      const c1 = makeContainer(len - 0.2, wid / nCols - 0.15, containerColors[ci++ % containerColors.length]);
      const c2 = makeContainer(len * 0.62, wid / nCols - 0.15, containerColors[ci++ % containerColors.length]);
      c1.position.set(vertical ? off : 0, 0, vertical ? 0 : off);
      c2.position.set(vertical ? off : len * 0.14, 2.6, vertical ? -len * 0.14 : off);
      if (vertical) { c1.rotation.y = Math.PI / 2; c2.rotation.y = Math.PI / 2; }
      stack.add(c1);
      if ((ci + k) % 3 !== 0) stack.add(c2);
    }
    stack.position.set(cx, 0, cz);
    group.add(stack);
  }

  // ── 北侧岸桥（橘黄港机，位于画面上方海面，不遮挡战斗） ──
  const craneA = makeQuayCrane();
  craneA.position.set(-15, 0, -HH - 4.6);
  const craneB = makeQuayCrane();
  craneB.position.set(15, 0, -HH - 4.6);
  group.add(craneA, craneB);

  // ── 中央维修塔（任务进度） ──
  const tower = makeTower();
  group.add(tower.group);

  // ── 外围装饰：油桶、托盘、锥桶、灯柱、救生圈 ──
  addProps(group, rnd);

  // ── 刷怪入口：地面箭头信标 ──
  const entMarks: Record<string, { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial }> = {};
  const chevronGeo = makeChevrons();
  for (const [k, e] of Object.entries(ARENA.entrances)) {
    const mat = new THREE.MeshBasicMaterial({ color: 0xff2f86, transparent: true, opacity: 0, depthWrite: false });
    const m = new THREE.Mesh(chevronGeo, mat);
    const px = clamp(e.x, HW - 1.8), pz = clamp(e.z, HH - 1.8);
    m.position.set(px, 0.03, pz);
    m.rotation.y = Math.atan2(-px, -pz); // 箭头指向场内
    m.renderOrder = 11;
    group.add(m);
    entMarks[k] = { mesh: m, mat };
  }

  // ── 云影（极低对比，漂过甲板，强化晴日感） ──
  const cloudMat = new THREE.MeshBasicMaterial({ map: cloudTex(), transparent: true, opacity: 0.11, depthWrite: false, color: 0x1d3550 });
  const clouds: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const c = new THREE.Mesh(new THREE.PlaneGeometry(26, 16), cloudMat);
    c.rotation.x = -Math.PI / 2;
    c.position.set(-60 + i * 34, 0.02, -20 + (i % 2) * 26);
    c.renderOrder = 1;
    group.add(c);
    clouds.push(c);
  }

  // ── 海鸥 ──
  const gullGeo = merge([
    paint(place(new THREE.BoxGeometry(0.9, 0.05, 0.22), -0.42, 0, 0, 0, 0, 0.25), 0xffffff),
    paint(place(new THREE.BoxGeometry(0.9, 0.05, 0.22), 0.42, 0, 0, 0, 0, -0.25), 0xffffff),
    paint(place(new THREE.BoxGeometry(0.16, 0.12, 0.5), 0, 0, 0), 0xf3f3f3),
  ]);
  const gulls = new THREE.InstancedMesh(gullGeo, new THREE.MeshBasicMaterial({ vertexColors: true }), 7);
  gulls.frustumCulled = false;
  group.add(gulls);

  let lastProg = -1;
  return {
    group,
    sun,
    setShadows(on) {
      sun.castShadow = on;
      deck.receiveShadow = on;
    },
    update(t, progress, alarm, warnings, tier) {
      waterUniforms.uTime.value = t;
      waterUniforms.uAlarm.value = alarm;
      waterUniforms.uDetail.value = tier === 'low' ? 0.4 : 1;

      // 岸桥与塔顶随警报晃动
      const sway = alarm > 0.01 ? Math.sin(t * 22) * 0.012 * alarm : 0;
      craneA.rotation.z = sway;
      craneB.rotation.z = -sway * 0.8;
      tower.update(t, progress, alarm);
      if (Math.abs(progress - lastProg) > 0.002) lastProg = progress;

      // 云影漂移
      for (const c of clouds) {
        c.position.x += 0.016;
        if (c.position.x > 80) c.position.x = -80;
      }
      // 海鸥绕圈
      for (let i = 0; i < 7; i++) {
        const a = t * (0.12 + i * 0.015) + i * 0.9;
        const r = 30 + (i % 3) * 7;
        dummy.position.set(Math.cos(a) * r, 7 + (i % 2) * 2 + Math.sin(t * 2 + i) * 0.3, Math.sin(a) * r * 0.75 - 6);
        dummy.rotation.set(0, -a, Math.sin(t * 7 + i) * 0.35);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        gulls.setMatrixAt(i, dummy.matrix);
      }
      gulls.instanceMatrix.needsUpdate = true;

      // 入口预警
      const act = new Map<string, string | undefined>();
      for (const w of warnings) act.set(w.entrance, w.tag);
      for (const [k, v] of Object.entries(entMarks)) {
        if (act.has(k)) {
          const p = 0.5 + 0.5 * Math.sin(t * 12);
          v.mat.opacity = 0.55 + p * 0.4;
          v.mesh.scale.setScalar(act.get(k) === 'boss' ? 1.8 : 1 + p * 0.12);
        } else {
          v.mat.opacity = 0;
        }
      }
    },
  };
}

// ───────────────────────── 构件 ─────────────────────────

function makeContainer(len: number, wid: number, hex: number): THREE.Group {
  const g = new THREE.Group();
  const h = 2.5;
  const body = new THREE.Mesh(new THREE.BoxGeometry(len, h, wid), toon(hex));
  body.position.y = h / 2;
  body.castShadow = true; body.receiveShadow = true;
  g.add(body);
  // 波纹板：竖向细肋（顶部可见），用略深色
  const dark = new THREE.Color(hex).multiplyScalar(0.78).getHex();
  const ribMat = toon(dark);
  const ribs: THREE.BufferGeometry[] = [];
  for (let x = -len / 2 + 0.35; x < len / 2 - 0.2; x += 0.5) {
    ribs.push(place(new THREE.BoxGeometry(0.12, h - 0.25, wid + 0.06), x, h / 2, 0));
  }
  const ribMesh = new THREE.Mesh(merge(ribs), ribMat);
  g.add(ribMesh);
  // 顶框
  const frame = new THREE.Mesh(new THREE.BoxGeometry(len + 0.05, 0.12, wid + 0.05), toon(0x3a4148));
  frame.position.y = h;
  g.add(frame);
  return g;
}

function makeGatePillar(cx: number, cz: number, hw: number, hh: number): THREE.Group {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(hw * 2, 1.8, hh * 2), toon(0xf07a24));
  base.position.y = 0.9;
  base.castShadow = true;
  // 黑黄警示斜纹
  const stripes: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 4; i++) {
    stripes.push(place(new THREE.BoxGeometry(hw * 2 + 0.04, 0.16, hh * 2 + 0.04), 0, 0.25 + i * 0.42, 0, 0, 0, 0.35));
  }
  const s = new THREE.Mesh(merge(stripes), toon(0x23272b));
  const cap = new THREE.Mesh(new THREE.BoxGeometry(hw * 2 + 0.3, 0.3, hh * 2 + 0.3), toon(0x3a4249));
  cap.position.y = 1.95;
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.3, 10), new THREE.MeshBasicMaterial({ color: 0xffb02e }));
  lamp.position.y = 2.25;
  g.add(base, s, cap, lamp);
  g.position.set(cx, 0, cz);
  // 低矮道闸臂
  const arm = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.16, 0.16), toon(0xffffff));
  arm.position.set(cx < 0 ? 3.2 : -3.2, 1.0, 0.0);
  g.add(arm);
  return g;
}

function makeQuayCrane(): THREE.Group {
  const g = new THREE.Group();
  const orange = toon(0xf07120);
  const dark = toon(0x2e3a44);
  const white = toon(0xf2f4f6);
  // 四条腿（在海堤外侧）
  for (const [x, z] of [[-3.2, 0], [3.2, 0], [-3.2, -6], [3.2, -6]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.75, 11, 0.75), orange);
    leg.position.set(x, 5.5 - 1.2, z);
    leg.castShadow = true;
    g.add(leg);
  }
  // 横梁与斜撑
  for (const z of [0, -6]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.8, 0.8), orange);
    beam.position.set(0, 9.6, z);
    g.add(beam);
    const brace = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8.0, 0.3), orange);
    brace.position.set(0, 5.6, z);
    brace.rotation.z = 0.68;
    g.add(brace);
  }
  // 吊臂伸向北方海面
  const boom = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 24), orange);
  boom.position.set(0, 11.2, -10);
  boom.castShadow = true;
  g.add(boom);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.4, 1.8), white);
  cabin.position.set(0, 10.1, -3);
  g.add(cabin);
  const win = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.5, 0.5), new THREE.MeshBasicMaterial({ color: 0x5fd0ef }));
  win.position.set(0, 10.25, -2.2);
  g.add(win);
  const machine = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.0, 3.4), white);
  machine.position.set(0, 12.6, -4.5);
  g.add(machine);
  const apex = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.5, 0.5), orange);
  apex.position.set(0, 14.0, -3);
  g.add(apex);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff3a3a }));
  tip.position.set(0, 16.3, -3);
  g.add(tip);
  void dark;
  addOutline(g, 0.04);
  return g;
}

function makeTower() {
  const g = new THREE.Group();
  const R = ARENA.towerRadius;
  // 底座平台
  const base = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.1, R + 0.35, 0.5, 24), toon(0x5a6873));
  base.position.y = 0.25;
  base.receiveShadow = true; base.castShadow = true;
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.12, R + 0.12, 0.12, 24), toon(0xf2c230));
  ring.position.y = 0.52;
  g.add(base, ring);
  // 桁架主体
  const orange = toon(0xf26a1b);
  const legs: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 4.4, 0.28), orange);
    leg.position.set(Math.cos(a) * 0.95, 2.7, Math.sin(a) * 0.95);
    leg.rotation.set(Math.sin(a) * 0.08, 0, -Math.cos(a) * 0.08);
    leg.castShadow = true;
    legs.push(leg);
    g.add(leg);
  }
  for (const y of [1.4, 2.6, 3.8]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.98 - (y - 1.4) * 0.04, 0.07, 6, 16), orange);
    band.rotation.x = Math.PI / 2;
    band.position.y = y;
    g.add(band);
  }
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 4.2, 12), toon(0xe9edf0));
  core.position.y = 2.6;
  core.castShadow = true;
  g.add(core);
  // 进度光柱：竖直能量条随进度上升
  const barMat = new THREE.MeshBasicMaterial({ color: 0x3ff0ff });
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 1, 12), barMat);
  bar.position.y = 0.6;
  g.add(bar);
  // 顶部平台与信标
  const top = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.2, 0.35, 16), toon(0x36434e));
  top.position.y = 4.95;
  g.add(top);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0x45f2ff });
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.7, 10), beaconMat);
  beacon.position.y = 5.5;
  g.add(beacon);
  const lampArm = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 0.3), toon(0x36434e));
  lampArm.position.y = 5.9;
  g.add(lampArm);
  addOutline(g, 0.035);

  // 地面进度刻度：12 段围绕塔基
  const segs: THREE.MeshBasicMaterial[] = [];
  for (let i = 0; i < 12; i++) {
    const a0 = Math.PI / 2 - (i / 12) * Math.PI * 2;
    const geo = new THREE.RingGeometry(R + 0.55, R + 1.0, 6, 1, a0 - (Math.PI * 2) / 12 + 0.05, (Math.PI * 2) / 12 - 0.1);
    geo.rotateX(-Math.PI / 2);
    const m = new THREE.MeshBasicMaterial({ color: 0x9fb0ba, transparent: true, opacity: 0.55, depthWrite: false });
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.y = 0.025;
    mesh.renderOrder = 2;
    g.add(mesh);
    segs.push(m);
  }

  return {
    group: g,
    update(t: number, progress: number, alarm: number) {
      const h = Math.max(0.05, progress) * 4.0;
      bar.scale.y = h;
      bar.position.y = 0.55 + h / 2;
      barMat.color.setHex(progress >= 1 ? 0xff3a86 : 0x3ff0ff);
      const lit = Math.floor(progress * 12 + 1e-4);
      for (let i = 0; i < 12; i++) {
        const s = segs[i];
        if (progress >= 1) {
          s.color.setHex(0xff3a86); s.opacity = 0.6 + 0.3 * Math.sin(t * 8 + i);
        } else if (i < lit) {
          s.color.setHex(0x2fd8f0); s.opacity = 0.85;
        } else if (i === lit) {
          s.color.setHex(0x2fd8f0); s.opacity = 0.3 + 0.35 * (0.5 + 0.5 * Math.sin(t * 4));
        } else {
          s.color.setHex(0x9fb0ba); s.opacity = 0.45;
        }
      }
      if (alarm > 0.01) beaconMat.color.setHex(Math.sin(t * 14) > 0 ? 0xff2b6d : 0xffb32b);
      else beaconMat.color.setHex(progress >= 1 ? 0xff3a86 : 0x45f2ff);
      beacon.rotation.y = t * 2;
      lampArm.rotation.y = t * 1.2;
      g.position.x = alarm > 0.01 ? Math.sin(t * 30) * 0.03 * alarm : 0;
    },
  };
}

function addProps(group: THREE.Group, rnd: () => number) {
  const drumGeo = merge([
    paint(new THREE.CylinderGeometry(0.34, 0.34, 0.9, 12), 0x2f7e9e),
    paint(place(new THREE.TorusGeometry(0.34, 0.03, 4, 12), 0, 0.2, 0, Math.PI / 2), 0x1d4e63),
    paint(place(new THREE.TorusGeometry(0.34, 0.03, 4, 12), 0, -0.2, 0, Math.PI / 2), 0x1d4e63),
  ]);
  const drumRed = merge([
    paint(new THREE.CylinderGeometry(0.34, 0.34, 0.9, 12), 0xd2453b),
    paint(place(new THREE.TorusGeometry(0.34, 0.03, 4, 12), 0, 0.2, 0, Math.PI / 2), 0x8a2a22),
  ]);
  const palletGeo = merge([
    paint(new THREE.BoxGeometry(1.2, 0.14, 1.0), 0xc79a62),
    paint(place(new THREE.BoxGeometry(1.0, 0.7, 0.85), 0, 0.42, 0), 0xe6d2a8),
    paint(place(new THREE.BoxGeometry(1.02, 0.08, 0.87), 0, 0.5, 0), 0x9a7448),
  ]);
  const coneGeo = merge([
    paint(new THREE.BoxGeometry(0.5, 0.06, 0.5), 0x2a2f34),
    paint(place(new THREE.ConeGeometry(0.2, 0.62, 10), 0, 0.34, 0), 0xff7a1f),
    paint(place(new THREE.CylinderGeometry(0.13, 0.15, 0.1, 10), 0, 0.36, 0), 0xffffff),
  ]);
  const lampGeo = merge([
    paint(new THREE.CylinderGeometry(0.08, 0.1, 3.0, 8), 0x4b5863),
    paint(place(new THREE.BoxGeometry(0.7, 0.12, 0.25), 0.25, 1.5, 0), 0x4b5863),
    paint(place(new THREE.BoxGeometry(0.3, 0.1, 0.2), 0.5, 1.43, 0), 0xfff2b0),
  ]);
  const mat = toon(0xffffff, { vertexColors: true });
  const dummy = new THREE.Object3D();
  const spots: [THREE.BufferGeometry, number, number, number][] = [];
  // 集装箱附近散落
  const clusters: [number, number][] = [[-22.5, -18], [22.5, 18], [-22.5, 19], [22.5, -19], [-6, -19.5], [6, 19.5], [-14, 19], [14, -19]];
  for (const [cx, cz] of clusters) {
    const n = 3 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const r = rnd();
      const geo = r < 0.3 ? drumGeo : r < 0.45 ? drumRed : r < 0.75 ? palletGeo : coneGeo;
      spots.push([geo, cx + (rnd() - 0.5) * 3, cz + (rnd() - 0.5) * 2, rnd() * Math.PI]);
    }
  }
  // 灯柱沿南北两侧
  for (const x of [-24, -8, 8, 24]) {
    spots.push([lampGeo, x, -HH + 0.4, Math.PI / 2]);
  }
  const byGeo = new Map<THREE.BufferGeometry, [number, number, number][]>();
  for (const [geo, x, z, r] of spots) {
    if (!byGeo.has(geo)) byGeo.set(geo, []);
    byGeo.get(geo)!.push([x, z, r]);
  }
  for (const [geo, list] of byGeo) {
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    const yOff = geo === drumGeo || geo === drumRed ? 0.45 : geo === lampGeo ? 1.5 : 0.07;
    list.forEach(([x, z, r], i) => {
      dummy.position.set(x, yOff, z);
      dummy.rotation.set(0, r, 0);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
    });
    im.castShadow = true;
    group.add(im);
  }
}

function makeTetrapod(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const dirs = [[0, 1, 0], [0.94, -0.33, 0], [-0.47, -0.33, 0.82], [-0.47, -0.33, -0.82]];
  for (const [x, y, z] of dirs) {
    const c = new THREE.CylinderGeometry(0.16, 0.34, 1.0, 7);
    c.translate(0, 0.5, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x, y, z).normalize());
    c.applyQuaternion(q);
    parts.push(c);
  }
  for (const p of parts) if (p.attributes.uv) p.deleteAttribute('uv');
  return merge(parts);
}

function makeChevrons(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-1.1, 0); shape.lineTo(0, 0.9); shape.lineTo(1.1, 0);
  shape.lineTo(1.1, -0.45); shape.lineTo(0, 0.45); shape.lineTo(-1.1, -0.45); shape.closePath();
  const a = new THREE.ShapeGeometry(shape);
  const b = a.clone().translate(0, -1.1, 0);
  const g = merge([a, b]);
  g.rotateX(-Math.PI / 2);
  // 让箭头指向 -Z（局部前方），再由外部旋转到场内方向
  g.rotateY(Math.PI);
  return g;
}

function makeDeckTexture(w: number, h: number): THREE.CanvasTexture {
  const ppm = 28; // 每米像素
  const c = document.createElement('canvas');
  c.width = Math.min(2048, Math.round(w * ppm));
  c.height = Math.min(2048, Math.round(h * ppm));
  const sx = c.width / w, sy = c.height / h;
  const g = c.getContext('2d')!;
  const rnd = mulberry(42);
  const X = (x: number) => (x + w / 2) * sx;
  const Y = (z: number) => (z + h / 2) * sy;

  // 底色：浅暖灰混凝土
  g.fillStyle = '#c9cdcf';
  g.fillRect(0, 0, c.width, c.height);
  // 板块：4m 一块，轻微色差
  const slab = 4;
  for (let x = -w / 2; x < w / 2; x += slab) {
    for (let z = -h / 2; z < h / 2; z += slab) {
      const v = 196 + Math.floor((rnd() - 0.5) * 12);
      g.fillStyle = `rgb(${v},${v + 3},${v + 5})`;
      g.fillRect(X(x) + 1, Y(z) + 1, slab * sx - 2, slab * sy - 2);
    }
  }
  // 细噪点
  const img = g.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rnd() - 0.5) * 10;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  // 接缝
  g.strokeStyle = 'rgba(120,130,138,0.35)';
  g.lineWidth = 2;
  for (let x = -w / 2; x <= w / 2; x += slab) { g.beginPath(); g.moveTo(X(x), 0); g.lineTo(X(x), c.height); g.stroke(); }
  for (let z = -h / 2; z <= h / 2; z += slab) { g.beginPath(); g.moveTo(0, Y(z)); g.lineTo(c.width, Y(z)); g.stroke(); }
  // 油渍与轮胎印
  for (let i = 0; i < 26; i++) {
    const x = X((rnd() - 0.5) * w * 0.9), y = Y((rnd() - 0.5) * h * 0.9);
    const r = (0.8 + rnd() * 2.2) * sx;
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, 'rgba(90,96,104,0.16)');
    grd.addColorStop(1, 'rgba(90,96,104,0)');
    g.fillStyle = grd;
    g.beginPath(); g.ellipse(x, y, r, r * (0.5 + rnd() * 0.5), rnd() * 3, 0, Math.PI * 2); g.fill();
  }
  g.strokeStyle = 'rgba(80,86,92,0.10)';
  g.lineWidth = 0.35 * sx;
  for (let i = 0; i < 6; i++) {
    const z0 = (rnd() - 0.5) * h * 0.8;
    g.beginPath();
    g.moveTo(X(-w / 2), Y(z0));
    g.bezierCurveTo(X(-8), Y(z0 + 6 * (rnd() - 0.5)), X(8), Y(z0 + 6 * (rnd() - 0.5)), X(w / 2), Y(z0 + 4 * (rnd() - 0.5)));
    g.stroke();
  }
  // 中央导流圈（黄色虚线，低饱和）
  g.setLineDash([0.9 * sx, 0.6 * sx]);
  g.strokeStyle = 'rgba(214,170,60,0.55)';
  g.lineWidth = 0.22 * sx;
  g.beginPath(); g.arc(X(0), Y(0), 7 * sx, 0, Math.PI * 2); g.stroke();
  g.setLineDash([]);
  // 十字车道线（白色，淡）
  g.strokeStyle = 'rgba(255,255,255,0.45)';
  g.lineWidth = 0.18 * sx;
  for (const off of [-1.6, 1.6]) {
    g.beginPath(); g.moveTo(X(off), Y(-h / 2 + 3)); g.lineTo(X(off), Y(-8)); g.stroke();
    g.beginPath(); g.moveTo(X(off), Y(8)); g.lineTo(X(off), Y(h / 2 - 3)); g.stroke();
    g.beginPath(); g.moveTo(X(-w / 2 + 3), Y(off)); g.lineTo(X(-8), Y(off)); g.stroke();
    g.beginPath(); g.moveTo(X(8), Y(off)); g.lineTo(X(w / 2 - 3), Y(off)); g.stroke();
  }
  // 导流箭头（指向中心）
  g.fillStyle = 'rgba(255,255,255,0.40)';
  const arrow = (x: number, z: number, ang: number) => {
    g.save(); g.translate(X(x), Y(z)); g.rotate(ang);
    g.beginPath();
    g.moveTo(0, -0.9 * sy); g.lineTo(0.55 * sx, 0); g.lineTo(0.2 * sx, 0); g.lineTo(0.2 * sx, 0.9 * sy);
    g.lineTo(-0.2 * sx, 0.9 * sy); g.lineTo(-0.2 * sx, 0); g.lineTo(-0.55 * sx, 0); g.closePath(); g.fill();
    g.restore();
  };
  arrow(0, -15, Math.PI); arrow(0, 15, 0); arrow(-20, 0, Math.PI / 2); arrow(20, 0, -Math.PI / 2);
  // 泊位编号
  g.fillStyle = 'rgba(70,84,96,0.28)';
  g.font = `bold ${Math.round(1.6 * sy)}px sans-serif`;
  g.textAlign = 'center';
  const labels: [string, number, number][] = [['A1', -12, -12], ['A2', 12, -12], ['B1', -12, 12], ['B2', 12, 12]];
  for (const [s, x, z] of labels) g.fillText(s, X(x), Y(z));
  // 场地外圈黄黑警示带
  const band = 0.5;
  for (let i = 0, x = -w / 2; x < w / 2; x += 0.8, i++) {
    g.fillStyle = i % 2 ? 'rgba(242,194,48,0.85)' : 'rgba(40,44,48,0.75)';
    g.fillRect(X(x), Y(-h / 2 + 0.4), 0.8 * sx, band * sy);
    g.fillRect(X(x), Y(h / 2 - 0.4 - band), 0.8 * sx, band * sy);
  }
  // 维修塔周围放射状排水槽
  g.strokeStyle = 'rgba(100,110,118,0.35)';
  g.lineWidth = 0.12 * sx;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.beginPath();
    g.moveTo(X(Math.cos(a) * 3.4), Y(Math.sin(a) * 3.4));
    g.lineTo(X(Math.cos(a) * 5.2), Y(Math.sin(a) * 5.2));
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function cloudTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 160;
  const g = c.getContext('2d')!;
  const rnd = mulberry(3);
  for (let i = 0; i < 9; i++) {
    const x = 50 + rnd() * 156, y = 40 + rnd() * 80, r = 30 + rnd() * 30;
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, 'rgba(255,255,255,0.9)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 160);
  }
  return new THREE.CanvasTexture(c);
}

function clamp(v: number, m: number) {
  return v < -m ? -m : v > m ? m : v;
}

function mulberry(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

```

---

## File: `src/render/map_warehouse.ts`

```ts
import * as THREE from 'three';
import { FOUNTAIN } from '../config';
import map1Data from '../sim/map1_data.json';
import map1Lightmaps from '../sim/map1_lightmaps.json';
import map1Materials from '../sim/map1_materials.json';
import { getTexture, loadGLB, loadScbGeo, loadSpriteCell as loadAssetSpriteCell } from './assets';
import type { WorldView } from './world';

interface MatEntry {
  url: string;
  alpha?: 'cutout' | 'blend';
}

const MAT_MAP = map1Materials as Record<string, MatEntry>;

function loadScbMesh(url: string, mat: THREE.Material, onReady?: (m: THREE.Mesh) => void): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
  mesh.frustumCulled = false;
  loadScbGeo(url, true)
    .then((geo) => {
      mesh.geometry.dispose();
      mesh.geometry = geo;
      onReady?.(mesh);
    })
    .catch((e) => console.warn('[VFX SCB] load failed:', url, e));
  return mesh;
}

function loadSpriteCell(url: string, col: number, row: number, cols: number, rows: number, glow = false): THREE.CanvasTexture {
  return loadAssetSpriteCell(url, col, row, cols, rows, { size: 256, glow });
}

/**
 * 第一关「仓库区」原版 3D 场景：
 * - 直接加载由拳头 14.14 官方 Map33.wad.client 解包并转换的 `warehouse_map1.glb`
 * - 1:1 映射 104 套原版贴图并与 `map1_data.json` 180m × 180m 碰撞网格严格对齐
 * - 中央治愈喷泉使用原版 5 套 `.scb` 3D 特效网格 + 12 张原版特效贴图还原全套光效
 */
export function buildWarehouseWorld(scene: THREE.Scene, gl: THREE.WebGLRenderer): WorldView {
  scene.background = new THREE.Color(0x5fa8d3);
  scene.fog = null;

  const group = new THREE.Group();
  scene.add(group);

  group.add(new THREE.HemisphereLight(0xb4f5ff, 0x566c8e, 0.95));

  const sun = new THREE.DirectionalLight(0xf9f0dd, 1.95);
  sun.position.set(-24, 34, 28);
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.near = 5;
  sc.far = 120;
  sc.left = -28;
  sc.right = 28;
  sc.top = 28;
  sc.bottom = -28;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.025;
  group.add(sun, sun.target);

  // 底层深海延展平面
  const sea = new THREE.Mesh(
    new THREE.PlaneGeometry(520, 520),
    new THREE.MeshStandardMaterial({ color: 0x0b3c52, roughness: 0.35, metalness: 0.1 }),
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -2.2;
  group.add(sea);

  const maxAniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
  const matCache = new Map<string, THREE.MeshLambertMaterial>();
  const LM_MAP = map1Lightmaps as Record<string, number[]>;

  const getTex = (url: string, flipY = false) =>
    getTexture(url, { flipY, repeat: true, anisotropy: maxAniso });

  const getLightmap = (idx: number) =>
    getTexture(`./assets/map1/lightmaps/${idx}.webp`, {
      flipY: false,
      repeat: false,
      channel: 1,
      anisotropy: maxAniso,
    });

  const getMat = (matName: string, lmIdx: number | null): THREE.MeshLambertMaterial | null => {
    const entry = MAT_MAP[matName];
    if (!entry) return null;
    const key = lmIdx !== null ? `${matName}|lm${lmIdx}` : matName;
    let m = matCache.get(key);
    if (!m) {
      const isCutout = entry.alpha === 'cutout';
      const isBlend = entry.alpha === 'blend';
      const isGlow = /healingwell|hologram|crystal|glow/i.test(matName);
      m = new THREE.MeshLambertMaterial({
        map: getTex(entry.url, false),
        lightMap: lmIdx !== null ? getLightmap(lmIdx) : null,
        lightMapIntensity: 1.85,
        color: 0xffffff,
        alphaTest: isCutout ? 0.42 : 0,
        transparent: isBlend,
        opacity: isBlend ? 0.88 : 1.0,
        depthWrite: !isBlend,
        side: THREE.DoubleSide,
        emissive: isGlow ? new THREE.Color(0x0c222e) : new THREE.Color(0x000000),
        emissiveIntensity: isGlow ? 0.28 : 0,
      });
      if (lmIdx !== null) {
        m.customProgramCacheKey = () => 'baked-lm-v3';
        m.onBeforeCompile = (shader) => {
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <lights_fragment_maps>',
            `#ifdef USE_LIGHTMAP
              vec3 lmTexel = texture2D( lightMap, vLightMapUv ).rgb;
              float lmLen = lmTexel.r + lmTexel.g + lmTexel.b;
              if (lmLen > 0.01) {
                vec3 baked = max(lmTexel, vec3(0.24, 0.31, 0.44)) * lightMapIntensity;
                reflectedLight.directDiffuse *= 0.35;
                reflectedLight.indirectDiffuse = diffuseColor.rgb * baked;
              }
            #endif`,
          );
        };
      }
      matCache.set(key, m);
    }
    return m;
  };

  const allMeshes: THREE.Mesh[] = [];
  const elevatedMeshes: THREE.Mesh[] = [];
  let shadowsOn = true;

  const mapReady = loadGLB('./assets/map1/warehouse_map1.glb')
    .then((gltf) => {
      const root = gltf.scene;
      root.rotation.set(0, 0, 0);
      root.scale.set(0.01, 0.01, -0.01);
      root.position.set(-90, -0.085, 90);
      root.updateMatrixWorld(true);

      const box = new THREE.Box3();
      root.traverse((obj) => {
        if (obj instanceof THREE.Light) {
          obj.visible = false;
          return;
        }
        if (!(obj instanceof THREE.Mesh)) return;
        const srcMat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
        const mName = srcMat?.name ?? '';

        if (/GrayBox_MAT|Board_LandingSite/i.test(mName)) {
          obj.visible = false;
          return;
        }

        const instMatch = (obj.name || obj.parent?.name || '').match(/MapGeo_Instance_(\d+)/);
        const lmData = instMatch ? LM_MAP[instMatch[1]] : undefined;
        let uv1Attr = obj.geometry.attributes.uv1 as THREE.BufferAttribute | undefined;
        let lmIdx: number | null = null;
        if (lmData && lmData[0] !== 0 && uv1Attr) {
          lmIdx = lmData[0];
          if (!obj.geometry.userData.lmScaled) {
            if (uv1Attr.normalized) {
              const arr = new Float32Array(uv1Attr.count * 2);
              for (let i = 0; i < uv1Attr.count; i++) {
                arr[i * 2] = uv1Attr.getX(i);
                arr[i * 2 + 1] = uv1Attr.getY(i);
              }
              uv1Attr = new THREE.Float32BufferAttribute(arr, 2);
              obj.geometry.setAttribute('uv1', uv1Attr);
            }
            const [, sx, sy, bx, by] = lmData;
            for (let i = 0; i < uv1Attr.count; i++) {
              uv1Attr.setXY(i, uv1Attr.getX(i) * sx + bx, uv1Attr.getY(i) * sy + by);
            }
            uv1Attr.needsUpdate = true;
            obj.geometry.userData.lmScaled = true;
          }
        }

        const boundMat = getMat(mName, lmIdx);
        if (boundMat) {
          obj.material = boundMat;
        } else if (srcMat && 'side' in srcMat) {
          (srcMat as THREE.Material).side = THREE.DoubleSide;
        }

        obj.receiveShadow = true;
        allMeshes.push(obj);

        box.setFromObject(obj);
        if (lmIdx === null && !/Strawberry_Ground_/i.test(mName) && box.max.y > 0.65 && !boundMat?.transparent) {
          obj.castShadow = shadowsOn;
          elevatedMeshes.push(obj);
        }
      });

      group.add(root);
    })
    .catch((err) => {
      console.error('[Map33 GLB] Failed to load warehouse_map1.glb:', err);
    });

  // ═══════════════════════════════════════════════════════════════
  // 中央治愈喷泉原版 3D 特效组（Fountain_Glow + Timer_Charge + Nova）
  // ═══════════════════════════════════════════════════════════════
  const fx = FOUNTAIN.x;
  const fz = FOUNTAIN.z;
  const fGroup = new THREE.Group();
  fGroup.position.set(fx, 0, fz);
  group.add(fGroup);

  const vfxTex = (name: string) => getTex(`./assets/map1/vfx/${name}`, true);
  const noiseTex = vfxTex('noise_02.png');

  // 1. 水池上空 y=3.5m 悬浮 3D 全息蜂窝能量球核（官方 EmitterPosition=[0,350,0], bS=0.98/1.0）
  const sphereGroup = new THREE.Group();
  sphereGroup.position.y = 3.5;
  fGroup.add(sphereGroup);

  const sphereUniforms = {
    uTime: { value: 0 },
    uCooldown: { value: 0 },
    uCharging: { value: 0 },
    uNoise: { value: noiseTex },
    uHexTile: { value: vfxTex('hextile.png') },
    uHexTileInv: { value: vfxTex('hextile_inv.png') },
    uTrailDark: { value: vfxTex('trail_dark.png') },
  };

  // 半透明深海靛蓝内芯（depthWrite=false，透出玻璃全息体积感）
  const sphereCoreMat = new THREE.ShaderMaterial({
    uniforms: sphereUniforms,
    transparent: true,
    blending: THREE.NormalBlending,
    depthWrite: false,
    side: THREE.FrontSide,
    vertexShader: /* glsl */ `
      varying vec3 vNormalView;
      varying vec3 vViewPos;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mvPos.xyz;
        vNormalView = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uCooldown;
      uniform float uCharging;
      uniform sampler2D uNoise;
      varying vec3 vNormalView;
      varying vec3 vViewPos;
      varying vec2 vUv;
      void main() {
        vec3 n = normalize(vNormalView);
        vec3 v = normalize(vViewPos);
        float fresnel = pow(1.0 - max(0.0, abs(dot(n, v))), 1.9);
        float n1 = texture2D(uNoise, vUv * 2.0 + vec2(uTime * 0.12, -uTime * 0.16)).r;
        float n2 = texture2D(uNoise, vUv * 1.4 + vec2(-uTime * 0.08, uTime * 0.10)).g;
        float noise = 0.5 * n1 + 0.5 * n2;
        vec3 deepBlue = vec3(0.03, 0.13, 0.30);
        vec3 deepTeal = vec3(0.0, 0.24, 0.22);
        vec3 col = mix(deepBlue, deepTeal, smoothstep(0.25, 0.85, noise) * 0.72);
        col += vec3(0.04, 0.42, 0.38) * fresnel * (0.65 + 0.35 * uCharging);
        float alpha = mix(0.28, 0.68, fresnel) * mix(1.0, 0.0, uCooldown);
        gl_FragColor = vec4(col, alpha);
        #include <colorspace_fragment>
      }
    `,
  });
  const sphereCore = loadScbMesh('./assets/map1/vfx/fountain_sphere.json', sphereCoreMat);
  sphereCore.scale.setScalar(0.0098);
  sphereCore.renderOrder = 10;

  // Edge12/13/15：极区平滑混入 XZ 平面投影彻底消除北极星芒捏合
  const sphereHexMat = new THREE.ShaderMaterial({
    uniforms: sphereUniforms,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide,
    vertexShader: /* glsl */ `
      varying vec3 vNormalView;
      varying vec3 vViewPos;
      varying vec3 vObjPos;
      varying vec3 vObjNorm;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vObjPos = position;
        vObjNorm = normalize(position);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mvPos.xyz;
        vNormalView = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uCooldown;
      uniform float uCharging;
      uniform sampler2D uHexTile;
      uniform sampler2D uHexTileInv;
      varying vec3 vNormalView;
      varying vec3 vViewPos;
      varying vec3 vObjPos;
      varying vec3 vObjNorm;
      varying vec2 vUv;
      void main() {
        vec3 n = normalize(vNormalView);
        vec3 v = normalize(vViewPos);
        float f = pow(1.0 - max(0.0, abs(dot(n, v))), 2.3);
        float scrollSpd = mix(0.05, 0.14, uCharging);
        vec2 eqUv = vUv * vec2(3.5, 1.75) + vec2(0.0, uTime * scrollSpd);
        vec2 capUv = vObjPos.xz * 0.0075 + vec2(0.0, uTime * scrollSpd);
        float poleW = smoothstep(0.55, 0.88, abs(vObjNorm.y));
        vec4 h1 = mix(texture2D(uHexTile, eqUv), texture2D(uHexTile, capUv), poleW);
        vec4 h2 = mix(texture2D(uHexTileInv, eqUv), texture2D(uHexTileInv, capUv), poleW);
        float m1 = max(h1.a, max(h1.r, h1.g));
        float m2 = max(h2.a, max(h2.r, h2.g));
        vec3 edge12 = vec3(0.08, 0.92, 0.58) * m1 * (0.16 + 0.72 * f);
        vec3 edge13 = vec3(0.45, 0.98, 0.92) * m2 * (0.08 + 0.36 * f);
        vec3 edge15 = pow(f, 1.6) * mix(vec3(0.0, 0.95, 0.55), vec3(0.45, 0.95, 0.92), f) * 0.72;
        vec3 col = (edge12 + edge13 + edge15) * (1.0 + 0.20 * uCharging) * mix(1.0, 0.0, uCooldown);
        float alpha = clamp((m1 * 0.38 + m2 * 0.22 + f * 0.65) * mix(1.0, 0.0, uCooldown), 0.0, 0.92);
        gl_FragColor = vec4(col, alpha);
        #include <colorspace_fragment>
      }
    `,
  });
  const sphereHex = loadScbMesh('./assets/map1/vfx/fountain_sphere.json', sphereHexMat);
  sphereHex.scale.setScalar(0.010);
  sphereHex.renderOrder = 11;

  // Edge16：柔和流动翡翠光带
  const sphereSwirlMat = new THREE.ShaderMaterial({
    uniforms: sphereUniforms,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uCooldown;
      uniform float uCharging;
      uniform sampler2D uTrailDark;
      uniform sampler2D uNoise;
      varying vec2 vUv;
      void main() {
        float spd = mix(1.0, 1.8, uCharging);
        vec4 tr = texture2D(uTrailDark, vUv * vec2(2.0, 1.0) + vec2(uTime * 0.14 * spd, -uTime * 0.10 * spd));
        vec4 nz = texture2D(uNoise, vUv * vec2(3.0, 1.0) + vec2(uTime * 0.10 * spd, uTime * 0.30 * spd));
        float m = max(tr.a, tr.r) * (0.40 + 0.80 * nz.r);
        float alpha = m * mix(0.28, 0.44, uCharging) * mix(1.0, 0.0, uCooldown);
        vec3 col = vec3(0.02, 0.95, 0.56) * (1.0 + 0.22 * uCharging);
        gl_FragColor = vec4(col, alpha);
        #include <colorspace_fragment>
      }
    `,
  });
  const sphereSwirl = loadScbMesh('./assets/map1/vfx/fountain_sphere.json', sphereSwirlMat);
  sphereSwirl.scale.setScalar(0.0102);
  sphereSwirl.renderOrder = 12;

  // Basic4 面向相机的球核柔光光晕 Billboard（官方 bS=330）
  const sphereHaloMat = new THREE.SpriteMaterial({
    map: vfxTex('glow_ring.png'),
    color: 0x16d48e,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const sphereHalo = new THREE.Sprite(sphereHaloMat);
  sphereHalo.scale.set(6.6, 6.6, 1);
  sphereHalo.renderOrder = 13;
  sphereGroup.add(sphereCore, sphereHex, sphereSwirl, sphereHalo);

  // 2. 水池内部多层贴图圈（严丝合缝贴合 r<3.4m 真实水池凹槽，杜绝穿模 3 座基座）
  const mkDecalPlane = (size: number, y: number, texName: string, hex: number, opacity: number, additive = true, order = 8) => {
    const mat = new THREE.MeshBasicMaterial({
      map: vfxTex(texName),
      color: hex,
      transparent: true,
      opacity,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.y = y;
    m.renderOrder = order;
    fGroup.add(m);
    return { mesh: m, mat };
  };

  const sharpUniforms = {
    uTex: { value: vfxTex('sharp_circle.png') },
    uOpacity: { value: 0.92 },
    uDim: { value: 0 },
  };
  const sharpMat = new THREE.ShaderMaterial({
    uniforms: sharpUniforms,
    transparent: true,
    blending: THREE.NormalBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uTex;
      uniform float uOpacity;
      uniform float uDim;
      varying vec2 vUv;
      void main() {
        float r = length(vUv - 0.5);
        float edgeMask = smoothstep(0.50, 0.37, r);
        if (edgeMask < 0.005) discard;
        vec4 tex = texture2D(uTex, vUv);
        vec3 col = mix(vec3(0.07, 0.30, 0.72), vec3(0.04, 0.14, 0.28), uDim) * (0.55 + 0.65 * tex.rgb);
        float alpha = tex.a * edgeMask * uOpacity;
        gl_FragColor = vec4(col, alpha);
        #include <colorspace_fragment>
      }
    `,
  });
  const sharpCircleMesh = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 8.6), sharpMat);
  sharpCircleMesh.rotation.x = -Math.PI / 2;
  sharpCircleMesh.position.y = 0.72;
  sharpCircleMesh.renderOrder = 6;
  fGroup.add(sharpCircleMesh);

  const crecents1 = [
    mkDecalPlane(7.6, 0.90, 'timer_outline.png', 0x2ef88a, 0.0, true, 8),
    mkDecalPlane(7.6, 0.91, 'timer_outline.png', 0x2ef88a, 0.0, true, 8),
  ];
  const crecents2 = [
    mkDecalPlane(10.0, 0.89, 'glow_ring.png', 0x03ff6e, 0.0, true, 7),
    mkDecalPlane(10.0, 0.895, 'glow_ring.png', 0x03ff6e, 0.0, true, 7),
  ];
  const outerGraphic1 = [
    mkDecalPlane(10.0, 0.92, 'glow_ring.png', 0x05ff85, 0.0, true, 8),
    mkDecalPlane(10.0, 0.925, 'glow_ring.png', 0x05ff85, 0.0, true, 8),
  ];

  // 3. 喷泉底座光边（Edge10: 官方 bS=3.2）+ outer_graphic（官方 bS=1400）
  const baseEdgeTex = vfxTex('hollow_decal.png').clone();
  baseEdgeTex.needsUpdate = true;
  baseEdgeTex.wrapS = THREE.RepeatWrapping;
  baseEdgeTex.wrapT = THREE.RepeatWrapping;
  baseEdgeTex.repeat.set(9, 1);
  const baseEdges = [0, 0.5].map((phase, idx) => {
    const mat = new THREE.MeshBasicMaterial({
      map: baseEdgeTex,
      color: 0x00ff6b,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const mesh = loadScbMesh('./assets/map1/vfx/fountain_baseedge.json', mat);
    mesh.scale.setScalar(0.032);
    mesh.position.y = 0.14 + idx * 0.01;
    mesh.renderOrder = 5;
    fGroup.add(mesh);
    return { mesh, mat, phase };
  });

  const outerGraphic = mkDecalPlane(28.0, 0.10, 'glowring_outer.png', 0x00ff60, 0.08, true, 4);

  // 4. 修复后的 3D 脉冲波浪罩（Shockwave_blend: scale=(0.235, 0.055, 0.235) 贴地柔和脉冲）
  const waveUniforms = {
    uPhase: { value: 0 },
    uOpacity: { value: 0.42 },
    uTex: { value: vfxTex('shockwave.png') },
  };
  const waveMat = new THREE.ShaderMaterial({
    uniforms: waveUniforms,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      attribute float aAlpha;
      varying vec2 vUv;
      varying float vAlpha;
      void main() {
        vUv = uv;
        vAlpha = aAlpha;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uPhase;
      uniform float uOpacity;
      uniform sampler2D uTex;
      varying vec2 vUv;
      varying float vAlpha;
      void main() {
        float v = vUv.y * 0.6 - 0.8 + uPhase * 1.1;
        if (v < 0.0 || v > 1.0) discard;
        vec4 tex = texture2D(uTex, vec2(vUv.x, v));
        float m = max(tex.a, max(tex.r, tex.g));
        float a = m * vAlpha * uOpacity;
        if (a < 0.004) discard;
        gl_FragColor = vec4(vec3(0.0, 1.0, 0.45), a);
        #include <colorspace_fragment>
      }
    `,
  });
  const waveMesh = loadScbMesh('./assets/map1/vfx/fountain_wave.json', waveMat);
  waveMesh.scale.set(0.25, 0.08, 0.25);
  waveMesh.position.y = 0.12;
  waveMesh.renderOrder = 9;
  fGroup.add(waveMesh);

  // 5. 飘升的原版六边形 "+" 治疗十字粒子与空心六边形粒子（hex_plus.png 2x2 + 柔光底晕）
  const hexCount = 24;
  const hexPos = new Float32Array(hexCount * 3);
  const hexMeta: { a: number; r: number; y: number; sp: number }[] = [];
  for (let i = 0; i < hexCount; i++) {
    const a = (i / hexCount) * Math.PI * 2 + i * 0.85;
    const r = 0.6 + ((i * 19) % 24) * 0.1;
    const y = 0.8 + ((i * 13) % 52) * 0.1;
    hexMeta.push({ a, r, y, sp: 1.45 + (i % 5) * 0.25 });
    hexPos[i * 3] = Math.cos(a) * r;
    hexPos[i * 3 + 1] = y;
    hexPos[i * 3 + 2] = Math.sin(a) * r;
  }
  const hexGeo = new THREE.BufferGeometry();
  hexGeo.setAttribute('position', new THREE.BufferAttribute(hexPos, 3));
  const hexMat = new THREE.PointsMaterial({
    size: 0.82,
    map: loadSpriteCell('./assets/map1/vfx/hex_plus.png', 0, 0, 2, 2, true),
    color: 0x2eff98,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const hexPts = new THREE.Points(hexGeo, hexMat);
  hexPts.renderOrder = 12;
  fGroup.add(hexPts);

  const hex2Count = 16;
  const hex2Pos = new Float32Array(hex2Count * 3);
  const hex2Meta: { a: number; r: number; y: number; sp: number }[] = [];
  for (let i = 0; i < hex2Count; i++) {
    const a = (i / hex2Count) * Math.PI * 2 + i * 1.15;
    const r = 0.9 + ((i * 23) % 22) * 0.1;
    const y = 0.7 + ((i * 17) % 48) * 0.1;
    hex2Meta.push({ a, r, y, sp: 1.15 + (i % 4) * 0.22 });
    hex2Pos[i * 3] = Math.cos(a) * r;
    hex2Pos[i * 3 + 1] = y;
    hex2Pos[i * 3 + 2] = Math.sin(a) * r;
  }
  const hex2Geo = new THREE.BufferGeometry();
  hex2Geo.setAttribute('position', new THREE.BufferAttribute(hex2Pos, 3));
  const hex2Mat = new THREE.PointsMaterial({
    size: 0.72,
    map: loadSpriteCell('./assets/map1/vfx/hex_plus.png', 0, 1, 2, 2, true),
    color: 0x38ff85,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const hex2Pts = new THREE.Points(hex2Geo, hex2Mat);
  hex2Pts.renderOrder = 12;
  fGroup.add(hex2Pts);

  // 6. 站圈外沿精致窄环（r=11.05..11.40m）+ 原生 3D 进度弧（scale=1.06 对齐 8.8..10.6m 走道，零切穿高塔与基座）
  const zoneGeo = new THREE.RingGeometry(FOUNTAIN.zoneRadius - 0.35, FOUNTAIN.zoneRadius, 72);
  zoneGeo.rotateX(-Math.PI / 2);
  const zoneTex = vfxTex('edge_08.png').clone();
  zoneTex.needsUpdate = true;
  zoneTex.repeat.set(8, 1);
  const zoneMat = new THREE.MeshBasicMaterial({
    map: zoneTex,
    color: 0x2ef89a,
    transparent: true,
    opacity: 0.40,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const zoneRing = new THREE.Mesh(zoneGeo, zoneMat);
  zoneRing.position.y = 0.13;
  zoneRing.renderOrder = 5;
  fGroup.add(zoneRing);

  const timerUniforms = {
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uDots: { value: vfxTex('dots.png') },
    uEdge08: { value: vfxTex('edge_08.png') },
    uEdge09: { value: vfxTex('edge_09.png') },
    uEdge06: { value: vfxTex('edge_06.png') },
    uNoise: { value: noiseTex },
  };
  const timerBgMat = new THREE.ShaderMaterial({
    uniforms: timerUniforms,
    transparent: true,
    blending: THREE.NormalBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uProgress;
      uniform sampler2D uDots;
      varying vec2 vUv;
      void main() {
        if (uProgress <= 0.005 || vUv.x > uProgress) discard;
        vec4 d = texture2D(uDots, vUv * vec2(120.0, 4.0));
        float dotMask = max(d.a, d.r);
        vec3 bgCol = vec3(0.0, 0.34, 0.20);
        vec3 dotCol = vec3(0.28, 0.92, 0.80);
        vec3 col = mix(bgCol, dotCol, dotMask * 0.38);
        gl_FragColor = vec4(col, 0.56);
        #include <colorspace_fragment>
      }
    `,
  });
  const timerBgMesh = loadScbMesh('./assets/map1/vfx/fountain_timer.json', timerBgMat);
  timerBgMesh.scale.set(0.92, 1, 0.92);
  timerBgMesh.rotation.y = Math.PI;
  timerBgMesh.position.y = 0.15;
  timerBgMesh.visible = false;
  timerBgMesh.renderOrder = 6;
  fGroup.add(timerBgMesh);

  const timerTechMat = new THREE.ShaderMaterial({
    uniforms: timerUniforms,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uProgress;
      uniform float uTime;
      uniform sampler2D uEdge08;
      uniform sampler2D uEdge09;
      uniform sampler2D uEdge06;
      uniform sampler2D uNoise;
      varying vec2 vUv;
      void main() {
        if (uProgress <= 0.005 || vUv.x > uProgress) discard;
        float e8 = texture2D(uEdge08, vUv * vec2(14.0, 1.0)).r;
        float e9 = texture2D(uEdge09, vUv * vec2(4.0, 1.0)).r;
        float e6 = texture2D(uEdge06, vUv * vec2(16.0, 1.0) + vec2(0.5, 0.0)).r;
        float nz = texture2D(uNoise, vUv * vec2(8.0, 1.0) + vec2(-uTime * 0.15, 0.0)).r;
        float head = smoothstep(0.022, 0.0, uProgress - vUv.x);
        vec3 cyanCol = vec3(0.28, 0.92, 0.96);
        vec3 warmCol = vec3(1.0, 0.85, 0.35);
        vec3 baseTint = mix(cyanCol, warmCol, smoothstep(0.75, 1.0, uProgress));
        float energy = e8 * 0.34 + e9 * 0.44 + e6 * 0.34 + nz * 0.18 + head * 0.65;
        vec3 col = baseTint * energy + vec3(0.20, 0.95, 0.65) * head * 0.55;
        float alpha = clamp(energy * 0.62, 0.0, 0.82);
        gl_FragColor = vec4(col, alpha);
        #include <colorspace_fragment>
      }
    `,
  });
  const timerTechMesh = loadScbMesh('./assets/map1/vfx/fountain_timer.json', timerTechMat);
  timerTechMesh.scale.set(0.92, 1, 0.92);
  timerTechMesh.rotation.y = Math.PI;
  timerTechMesh.position.y = 0.16;
  timerTechMesh.visible = false;
  timerTechMesh.renderOrder = 7;
  fGroup.add(timerTechMesh);

  const timerStartMat = new THREE.MeshBasicMaterial({
    map: vfxTex('edge_start_01.png'),
    color: 0x6ef5ff,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const timerStartMesh = loadScbMesh('./assets/map1/vfx/fountain_timer_start.json', timerStartMat);
  timerStartMesh.scale.set(0.92, 1, 0.92);
  timerStartMesh.rotation.y = Math.PI * (178.8 / 180);
  timerStartMesh.position.y = 0.165;
  timerStartMesh.visible = false;
  timerStartMesh.renderOrder = 8;
  fGroup.add(timerStartMesh);

  // 7. 站圈充能旋转星芒（lilstar.png 4x2 独立裁剪单格 + 环绕）
  const starTex = loadSpriteCell('./assets/map1/vfx/lilstar.png', 0, 0, 4, 2);
  const chargeCount = 36;
  const chargePos = new Float32Array(chargeCount * 3);
  for (let i = 0; i < chargeCount; i++) {
    const a = (i / chargeCount) * Math.PI * 2;
    chargePos[i * 3] = Math.cos(a) * 8.5;
    chargePos[i * 3 + 1] = 0.4 + (i % 4) * 0.35;
    chargePos[i * 3 + 2] = Math.sin(a) * 8.5;
  }
  const chargeGeo = new THREE.BufferGeometry();
  chargeGeo.setAttribute('position', new THREE.BufferAttribute(chargePos, 3));
  const chargeMat = new THREE.PointsMaterial({
    size: 0.85,
    map: starTex,
    color: 0x40ff87,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const chargePts = new THREE.Points(chargeGeo, chargeMat);
  chargePts.renderOrder = 11;
  fGroup.add(chargePts);

  // 8. 满充 Nova 爆发（上下软渐隐紧凑光柱 + 地面冲击光 + 金星闪光，绝不切穿外围建筑）
  const beamUniforms = {
    uTex: { value: vfxTex('decal_light_01.png') },
    uOpacity: { value: 0 },
  };
  const beamMat = new THREE.ShaderMaterial({
    uniforms: beamUniforms,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uTex;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        float vFade = smoothstep(0.0, 0.22, vUv.y) * smoothstep(1.0, 0.30, vUv.y);
        if (vFade < 0.005) discard;
        vec4 tex = texture2D(uTex, vUv);
        float m = max(tex.a, max(tex.r, tex.g));
        gl_FragColor = vec4(vec3(0.15, 1.0, 0.72) * (0.6 + 0.6 * m), m * vFade * uOpacity);
        #include <colorspace_fragment>
      }
    `,
  });
  const beamMesh = loadScbMesh('./assets/map1/vfx/fountain_beam.json', beamMat);
  beamMesh.scale.set(0.012, 0.010, 0.012);
  beamMesh.visible = false;
  beamMesh.renderOrder = 13;
  fGroup.add(beamMesh);

  const novaGlowMat = new THREE.MeshBasicMaterial({
    map: vfxTex('base_glow.png'),
    color: 0x2effa1,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const novaGlow = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), novaGlowMat);
  novaGlow.rotation.x = -Math.PI / 2;
  novaGlow.position.y = 1.0;
  novaGlow.visible = false;
  novaGlow.renderOrder = 13;
  fGroup.add(novaGlow);

  const novaStarMat = new THREE.MeshBasicMaterial({
    map: vfxTex('star1.png'),
    color: 0xffd159,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const novaStar = new THREE.Mesh(new THREE.PlaneGeometry(8.0, 8.0), novaStarMat);
  novaStar.rotation.x = -Math.PI / 2;
  novaStar.position.y = 2.0;
  novaStar.visible = false;
  novaStar.renderOrder = 14;
  fGroup.add(novaStar);

  // 地面低矮地标光环（首领竞技场 & 首领出生点）
  const mkBeaconRing = (x: number, z: number, rIn: number, rOut: number, hex: number, opacity: number) => {
    const g = new THREE.RingGeometry(rIn, rOut, 48);
    g.rotateX(-Math.PI / 2);
    const m = new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity, depthWrite: false });
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(x, 0.04, z);
    mesh.renderOrder = 3;
    group.add(mesh);
    return mesh;
  };
  const { bossArena, reksaiSpawn } = map1Data.landmarks;
  let bossRing: THREE.Mesh | null = null;
  if (bossArena) bossRing = mkBeaconRing(bossArena.wx, bossArena.wz, 6.2, 6.55, 0xffb838, 0.32);
  if (reksaiSpawn) mkBeaconRing(reksaiSpawn.wx, reksaiSpawn.wz, 2.2, 2.55, 0xff2e88, 0.4);

  let prevT = 0;
  let lastFState = 'ready';
  let novaT = 0;
  let cdShrinkT = 0;
  const cTmp = new THREE.Color();

  return {
    group,
    sun,
    ready: mapReady,
    setShadows(on: boolean) {
      shadowsOn = on;
      sun.castShadow = on;
      for (const m of allMeshes) m.receiveShadow = on;
      for (const m of elevatedMeshes) m.castShadow = on;
    },
    update(t, _progress, alarm, _warnings, _tier, fountain) {
      const dt = Math.min(0.1, Math.max(0, t - prevT));
      prevT = t;

      const fState = fountain?.state ?? 'ready';
      const charge = fountain?.charge ?? 0;
      const onCd = fState === 'cooldown';
      const charging = fState === 'charging';

      if (lastFState !== 'cooldown' && fState === 'cooldown') {
        novaT = 0.85;
        cdShrinkT = 0.15;
      }
      lastFState = fState;

      // 悬浮 3D 蜂窝全息球核动画（进入冷却 0.15s 快速收缩消隐，绝不留暗灰球）
      if (cdShrinkT > 0) cdShrinkT = Math.max(0, cdShrinkT - dt);
      const shrinkScale = onCd ? cdShrinkT / 0.15 : 1.0;
      sphereGroup.visible = !onCd || cdShrinkT > 0;
      sphereGroup.scale.setScalar(Math.max(0.001, shrinkScale));
      sphereGroup.position.y = 3.5 + Math.sin(t * 2.1) * 0.14;
      sphereUniforms.uTime.value = t;
      sphereUniforms.uCooldown.value = 0;
      sphereUniforms.uCharging.value = charging ? 1 : 0;
      const rotSpd = charging ? 0.9 : 0.35;
      sphereCore.rotation.y = t * rotSpd;
      sphereHex.rotation.y = t * rotSpd;
      sphereSwirl.rotation.y = -t * rotSpd * 1.3;
      sphereHaloMat.opacity = (charging ? 0.34 : 0.22) * shrinkScale;

      // 水池多层动画环（Basic5 + Crecents1 + Crecents2 + outer_graphic1）
      sharpUniforms.uDim.value = onCd ? 1 : 0;
      sharpUniforms.uOpacity.value = onCd ? 0.45 : charging ? 0.96 : 0.92;
      const visMul = onCd ? 0.0 : charging ? 1.05 : 0.85;

      for (let i = 0; i < crecents1.length; i++) {
        const k = (t + i * 0.5) % 1;
        const c = crecents1[i];
        c.mesh.visible = !onCd;
        c.mesh.scale.setScalar(1.3 - k * 0.8);
        c.mesh.rotation.z = t * 0.35 + i * 1.57;
        const a = k < 0.4 ? k / 0.4 : (1 - k) / 0.6;
        c.mat.opacity = a * 0.42 * visMul;
        if (k < 0.4) cTmp.setRGB(0.01 + (0.17 * k) / 0.4, 1.0, 0.85 - (0.39 * k) / 0.4);
        else cTmp.setRGB(0.18 - (0.17 * (k - 0.4)) / 0.6, 1.0, 0.46 - (0.31 * (k - 0.4)) / 0.6);
        c.mat.color.copy(cTmp);
      }

      for (let i = 0; i < crecents2.length; i++) {
        const k = (t + i * 0.5) % 1;
        const c = crecents2[i];
        c.mesh.visible = !onCd;
        const sc = k < 0.8 ? 0.7 + (0.45 * k) / 0.8 : 1.15 + (0.1 * (k - 0.8)) / 0.2;
        c.mesh.scale.setScalar(sc);
        c.mesh.rotation.z = -t * 0.28 + i * 1.57;
        const a = k < 0.3 ? k / 0.3 : (1 - k) / 0.7;
        c.mat.opacity = a * 0.28 * visMul;
      }

      for (let i = 0; i < outerGraphic1.length; i++) {
        const k = (t * 0.5 + i * 0.5) % 1;
        const c = outerGraphic1[i];
        c.mesh.visible = !onCd;
        c.mesh.scale.setScalar(1.0 - k);
        c.mesh.rotation.z = t * 0.2 + i * 2.1;
        const a = k < 0.4 ? k / 0.4 : (1 - k) / 0.6;
        c.mat.opacity = a * 0.34 * visMul;
        if (k < 0.4) cTmp.setRGB(0.02, 0.66 + (0.34 * k) / 0.4, 0.98 - (0.46 * k) / 0.4);
        else cTmp.setRGB(0.02 - (0.01 * (k - 0.4)) / 0.6, 1.0, 0.52 - (0.34 * (k - 0.4)) / 0.6);
        c.mat.color.copy(cTmp);
      }

      // 外沿底座光边（Edge10 双层交错呼吸）
      for (const b of baseEdges) {
        b.mesh.visible = !onCd;
        if (!onCd) {
          const k = (t * 0.25 + b.phase) % 1;
          const fade = k < 0.5 ? k * 2 : (1 - k) * 2;
          b.mat.opacity = fade * (charging ? 0.55 : 0.42);
          b.mesh.rotation.y = t * 0.052 + b.phase * Math.PI;
        }
      }
      outerGraphic.mat.opacity = onCd ? 0.02 : charging ? 0.15 : 0.08;

      // 3D 脉冲波浪罩（Shockwave_blend 2s UV 径向滚动）
      waveMesh.visible = !onCd;
      if (!onCd) {
        const wPhase = (t * 0.5) % 1;
        waveUniforms.uPhase.value = wPhase;
        const env = wPhase < 0.3 ? wPhase / 0.3 : wPhase < 0.6 ? 1.0 : (1 - wPhase) / 0.4;
        waveUniforms.uOpacity.value = env * (charging ? 0.56 : 0.42);
      }

      // 六边形 "+" 治疗粒子与空心六边形粒子飘升
      hexPts.visible = !onCd;
      hex2Pts.visible = !onCd;
      if (!onCd) {
        hexMat.opacity = charging ? 0.98 : 0.88;
        hex2Mat.opacity = charging ? 0.9 : 0.78;
        const speedMul = charging ? 1.7 : 1.0;
        const arr = hexGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < hexCount; i++) {
          const hm = hexMeta[i];
          hm.y += hm.sp * speedMul * dt;
          if (hm.y > 6.2) hm.y = 0.8;
          const a = hm.a + t * (charging ? 1.0 : 0.38);
          arr[i * 3] = Math.cos(a) * hm.r;
          arr[i * 3 + 1] = hm.y;
          arr[i * 3 + 2] = Math.sin(a) * hm.r;
        }
        hexGeo.attributes.position.needsUpdate = true;

        const arr2 = hex2Geo.attributes.position.array as Float32Array;
        for (let i = 0; i < hex2Count; i++) {
          const hm = hex2Meta[i];
          hm.y += hm.sp * speedMul * dt;
          if (hm.y > 5.8) hm.y = 0.7;
          const a = hm.a - t * (charging ? 0.8 : 0.3);
          arr2[i * 3] = Math.cos(a) * hm.r;
          arr2[i * 3 + 1] = hm.y;
          arr2[i * 3 + 2] = Math.sin(a) * hm.r;
        }
        hex2Geo.attributes.position.needsUpdate = true;
      }

      // 外圈站圈环 & 原生 3D 充能进度弧（fountain_timer.json + fountain_timer_start.json）
      zoneTex.offset.x = (t * (charging ? 0.12 : 0.03)) % 1;
      zoneMat.color.setHex(onCd ? 0x33505c : charging ? 0x5effb2 : 0x2ef89a);
      zoneMat.opacity = onCd ? 0.15 : charging ? 0.68 : 0.40;

      const showTimer = !onCd && charge > 0.005;
      timerBgMesh.visible = showTimer;
      timerTechMesh.visible = showTimer;
      timerStartMesh.visible = showTimer;
      timerUniforms.uProgress.value = charge;
      timerUniforms.uTime.value = t;

      chargePts.visible = !onCd && charging;
      if (chargePts.visible) {
        chargePts.rotation.y = t * 1.4;
      }

      // Nova 爆发（0.85s，上下软渐隐光柱 + 低矮冲击光 + 金星闪光）
      if (novaT > 0) {
        novaT = Math.max(0, novaT - dt);
        const k = 1 - novaT / 0.85;
        beamMesh.visible = true;
        beamMesh.rotation.y = t * 2.5;
        beamMesh.scale.set(0.011 + k * 0.003, 0.009 + k * 0.005, 0.011 + k * 0.003);
        beamUniforms.uOpacity.value = (1 - k) * 0.78;

        novaGlow.visible = k < 0.7;
        novaGlow.scale.setScalar(0.65 + k * 0.95);
        novaGlowMat.opacity = Math.max(0, 1 - k * 1.45) * 0.62;

        novaStar.visible = k < 0.6;
        novaStar.rotation.z = t * 4;
        novaStar.scale.setScalar(0.5 + k * 1.8);
        novaStarMat.opacity = Math.max(0, 1 - k * 1.7);
      } else {
        beamMesh.visible = false;
        novaGlow.visible = false;
        novaStar.visible = false;
      }

      if (bossRing) {
        const mat = bossRing.material as THREE.MeshBasicMaterial;
        mat.opacity = alarm > 0.01 ? 0.45 + Math.sin(t * 10) * 0.25 : 0.28;
      }
    },
  };
}

```

---

## File: `src/render/hero_jinx.ts`

```ts
import * as THREE from 'three';
import type { Game } from '../sim/game';
import { angleDiff } from '../sim/math';
import { getTexture, loadGLB } from './assets';
import { blobShadowTex } from './style';

export interface HeroRig {
  readonly root: THREE.Group;
  update(g: Game, dt: number): void;
}

/**
 * 拳头官方《无尽狂潮》金克丝（Strawberry_Jinx）3D 骨骼模型与四向走A动画状态机：
 * - 加载 14.14 客户端原版 `strawberry_jinx.glb`（133 根骨骼、18 套战斗动作）
 * - 支持前/后/左/右四向奔跑与四向开火走A、火箭炮切换、过载疾跑、大招与阵亡平滑过渡
 */
export class JinxRig implements HeroRig {
  readonly root = new THREE.Group();
  private modelHolder = new THREE.Group();
  private mixer: THREE.AnimationMixer | null = null;
  private actions: Record<string, THREE.AnimationAction> = {};
  private currentKey = '';
  private mats: THREE.MeshStandardMaterial[] = [];

  private aimYaw = 0;
  private firingT = 0;
  private ultAnimT = 0;
  readonly ready: Promise<void>;

  private auraRing: THREE.Mesh;
  private aimTri: THREE.Mesh;

  constructor(parent: THREE.Group) {
    parent.add(this.root);

    // 脚底柔和投影
    const pShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.75, 1.75),
      new THREE.MeshBasicMaterial({ map: blobShadowTex(), transparent: true, opacity: 0.58, depthWrite: false }),
    );
    pShadow.rotation.x = -Math.PI / 2;
    pShadow.position.y = 0.02;
    pShadow.renderOrder = 2;
    this.root.add(pShadow);

    // 脚底青蓝指示光环与瞄准三角
    this.auraRing = new THREE.Mesh(
      new THREE.RingGeometry(0.64, 0.72, 32),
      new THREE.MeshBasicMaterial({ color: 0x52f2ff, transparent: true, opacity: 0.52, depthWrite: false }),
    );
    this.auraRing.rotation.x = -Math.PI / 2;
    this.auraRing.position.y = 0.045;
    this.auraRing.renderOrder = 4;

    const triShape = new THREE.Shape();
    triShape.moveTo(0, 0.22);
    triShape.lineTo(-0.14, -0.05);
    triShape.lineTo(0.14, -0.05);
    triShape.closePath();
    const triGeo = new THREE.ShapeGeometry(triShape);
    triGeo.rotateX(-Math.PI / 2);
    this.aimTri = new THREE.Mesh(
      triGeo,
      new THREE.MeshBasicMaterial({ color: 0x8efaff, transparent: true, opacity: 0.9, depthWrite: false }),
    );
    this.aimTri.position.set(0, 0.05, 0.78);
    this.aimTri.renderOrder = 5;

    this.root.add(this.auraRing, this.aimTri, this.modelHolder);

    const loadTex = (url: string) => getTexture(url, { flipY: false });
    const bodyTex = loadTex('./assets/heroes/jinx/body.webp');
    const weaponTex = loadTex('./assets/heroes/jinx/weapon.webp');

    const bodyMat = new THREE.MeshStandardMaterial({
      map: bodyTex,
      roughness: 0.72,
      metalness: 0.14,
      envMapIntensity: 0.65,
      side: THREE.DoubleSide,
    });
    const weaponMat = new THREE.MeshStandardMaterial({
      map: weaponTex,
      roughness: 0.62,
      metalness: 0.24,
      envMapIntensity: 0.85,
      side: THREE.DoubleSide,
    });
    this.mats.push(bodyMat, weaponMat);

    this.ready = loadGLB('./assets/heroes/jinx/strawberry_jinx.glb')
      .then((gltf) => {
        const model = gltf.scene;
        // 配合《无尽狂潮》紧凑俯视镜头比例，保持原版清晰轮廓
        model.scale.setScalar(0.0096);
        model.position.set(0, 0, 0);

        model.traverse((obj) => {
          if (!(obj instanceof THREE.Mesh)) return;
          const srcMat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
          const mName = srcMat?.name ?? obj.name ?? '';

          // 依据 skin0.bin.json initialSubmeshToHide 隐藏回城水母部件
          if (/JellySpikes|JellyHead|JellyBase/i.test(mName)) {
            obj.visible = false;
            return;
          }

          if (/Weapon/i.test(mName)) obj.material = weaponMat;
          else obj.material = bodyMat;

          obj.castShadow = true;
          obj.receiveShadow = true;
          obj.frustumCulled = false;
        });

        this.modelHolder.add(model);

        // 绑定 18 套原版战斗骨骼动画（含四向走A）
        const mixer = new THREE.AnimationMixer(model);
        this.mixer = mixer;
        const pick = (re: RegExp) => gltf.animations.find((a) => re.test(a.name));
        const bindClip = (key: string, re: RegExp, loopOnce = false) => {
          const clip = pick(re);
          if (!clip) return;
          const act = mixer.clipAction(clip);
          if (loopOnce) {
            act.setLoop(THREE.LoopOnce, 1);
            act.clampWhenFinished = true;
          }
          this.actions[key] = act;
        };

        bindClip('mg_idle', /^jinx_minigun_idle1$/i);
        bindClip('mg_haste', /^minigun_runhaste$/i);
        bindClip('mg_run_f', /^jinx_strawberry_minigun_run\.strawberryrebuild$/i);
        bindClip('mg_run_b', /^jinx_strawberry_minigun_run_back/i);
        bindClip('mg_run_l', /^jinx_strawberry_minigun_run_left/i);
        bindClip('mg_run_r', /^jinx_strawberry_minigun_run_right/i);

        bindClip('mg_atk_idle', /^jinx_strawberry_minigun_attack1_idle/i);
        bindClip('mg_atk_f', /^jinx_strawberry_minigun_attack1\.strawberryrebuild$/i);
        bindClip('mg_atk_b', /^jinx_strawberry_minigun_attack1_back/i);
        bindClip('mg_atk_l', /^jinx_strawberry_minigun_attack1_left/i);
        bindClip('mg_atk_r', /^jinx_strawberry_minigun_attack1_right/i);

        bindClip('cn_idle', /^jinx_rlauncher_idle1$/i);
        bindClip('cn_run', /^jinx_rlauncher_run$/i);
        bindClip('cn_atk_idle', /rlauncher_attack2_idle|rlauncher_attack1/i);
        bindClip('cn_atk_run', /rlauncher_attack2_run|rlauncher_run/i);

        bindClip('ult', /rlauncher_spell4/i, true);
        bindClip('death', /minigun_death/i, true);

        const initAct = this.actions.mg_idle ?? Object.values(this.actions)[0];
        if (initAct) {
          initAct.play();
          this.currentKey = 'mg_idle';
        }
      })
      .catch((err) => {
        console.error('[JinxRig] Failed to load strawberry_jinx.glb:', err);
      });
  }

  private playState(key: string, timeScale = 1) {
    const next = this.actions[key] ?? this.actions.mg_idle;
    if (!next) return;
    next.timeScale = timeScale;
    if (this.currentKey === key) return;

    const prev = this.actions[this.currentKey];
    next.reset();
    next.play();
    if (prev && prev !== next) {
      prev.crossFadeTo(next, 0.12, true);
    }
    this.currentKey = key;
  }

  update(g: Game, dt: number) {
    const p = g.player;
    this.root.position.set(p.x, 0, p.z);

    // 平滑转向目标瞄准角
    const targetYaw = Math.atan2(p.faceX, p.faceZ);
    this.aimYaw = this.aimYaw + angleDiff(targetYaw, this.aimYaw) * Math.min(1, dt * 18);
    this.modelHolder.rotation.y = this.aimYaw;

    this.aimTri.position.set(Math.sin(this.aimYaw) * 0.84, 0.05, Math.cos(this.aimYaw) * 0.84);
    this.aimTri.rotation.y = this.aimYaw;

    // 追踪开火与大招动作窗口（避免机枪连射间隔动画闪烁）
    this.firingT = Math.max(0, this.firingT - dt);
    this.ultAnimT = Math.max(0, this.ultAnimT - dt);
    if (p.recoil > 0.01) this.firingT = 0.28;
    for (const ev of g.events) {
      if (ev.type === 'shoot') {
        if (ev.weapon === 'ult') this.ultAnimT = 0.65;
        else this.firingT = 0.28;
      }
    }

    const overloaded = p.overloadT > 0;
    this.auraRing.visible = !overloaded;
    const auraMat = this.auraRing.material as THREE.MeshBasicMaterial;
    auraMat.color.setHex(0x52f2ff);
    auraMat.opacity = 0.48;

    // 受击闪白 / 过载微光
    const hitFlash = p.hurtT > 0 && Math.floor(g.clock * 20) % 2 === 0;
    for (const m of this.mats) {
      if (hitFlash) {
        m.emissive.setHex(0x664444);
        m.emissiveIntensity = 0.8;
      } else if (overloaded) {
        m.emissive.setHex(0x165566);
        m.emissiveIntensity = 0.35;
      } else {
        m.emissive.setHex(0x000000);
        m.emissiveIntensity = 0;
      }
    }

    if (this.mixer) {
      const spd = Math.hypot(p.vx, p.vz);
      const isCn = p.eVolleyLeft > 0 || p.weapon === 'cn';
      const firing = this.firingT > 0 || p.eVolleyLeft > 0;

      if (p.hp <= 0 || g.state === 'lost') {
        this.playState('death', 1);
      } else if (this.ultAnimT > 0 && this.actions.ult) {
        this.playState('ult', 1.25);
      } else if (p.moving || spd > 0.25) {
        const moveYaw = spd > 0.1 ? Math.atan2(p.vx, p.vz) : Math.atan2(p.lastMoveX, p.lastMoveZ);
        const rel = angleDiff(moveYaw, this.aimYaw);
        const absRel = Math.abs(rel);
        const dir = absRel <= Math.PI * 0.28 ? 'f' : absRel >= Math.PI * 0.72 ? 'b' : rel > 0 ? 'l' : 'r';
        const runScale = Math.max(0.85, spd / 3.4);

        if (!isCn) {
          if (firing) {
            const k = `mg_atk_${dir}`;
            this.playState(this.actions[k] ? k : `mg_run_${dir}`, runScale);
          } else if ((p.dashT > 0 || overloaded) && this.actions.mg_haste) {
            this.playState('mg_haste', Math.max(0.95, spd / 4.2));
          } else {
            this.playState(`mg_run_${dir}`, runScale);
          }
        } else {
          this.playState(firing ? 'cn_atk_run' : 'cn_run', runScale);
        }
      } else if (firing) {
        this.playState(isCn ? 'cn_atk_idle' : 'mg_atk_idle', isCn ? 1.15 : 1.4);
      } else {
        this.playState(isCn ? 'cn_idle' : 'mg_idle', 1);
      }
      this.mixer.update(dt);
    }
  }
}

```

---

## File: `src/render/boss_reksai.ts`

```ts
import * as THREE from 'three';
import { BOSS, ENEMY_SCALES } from '../config';
import type { Game } from '../sim/game';
import { getTexture, loadGLB } from './assets';
import { blobShadowTex } from './style';

/**
 * 第一关最终首领「深海魔鲨 · 雷克塞（Strawberry_Boss_RekSai）」3D 骨骼模型与动画状态机：
 * - 加载 14.14 官方 `reksai.glb`（隐藏 `Wrap`、`Plane` 辅助网格）与 `reksai.png`
 * - 官方 `skinScale = 2.75`（`ENEMY_SCALES.reksai = 0.0275`）
 * - 支持破土登场（潜行 `run_burrowed` -> 破土 `spell2_unburrow`）、扫尾/重踏/弹幕技能动画、转阶段与受击闪白
 */
export class RekSaiRig {
  readonly root = new THREE.Group();
  private modelHolder = new THREE.Group();
  private mixer: THREE.AnimationMixer | null = null;
  private actions: Record<string, THREE.AnimationAction> = {};
  private currentKey = '';
  private mat: THREE.MeshStandardMaterial;
  private shadow: THREE.Mesh;
  private loadStarted = false;

  constructor(parent: THREE.Group, defer = false) {
    parent.add(this.root);
    this.root.visible = false;

    const shadowGeo = new THREE.PlaneGeometry(6.8, 6.8);
    shadowGeo.rotateX(-Math.PI / 2);
    this.shadow = new THREE.Mesh(
      shadowGeo,
      new THREE.MeshBasicMaterial({ map: blobShadowTex(), transparent: true, opacity: 0.56, depthWrite: false }),
    );
    this.shadow.position.y = 0.03;
    this.shadow.renderOrder = 2;

    const tex = getTexture('./assets/enemies/reksai.webp', { flipY: false });

    this.mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.68,
      metalness: 0.16,
      envMapIntensity: 0.55,
      side: THREE.DoubleSide,
    });

    this.root.add(this.shadow, this.modelHolder);
    if (!defer) this.ensureLoaded();
  }

  ensureLoaded() {
    if (this.loadStarted) return;
    this.loadStarted = true;

    loadGLB('./assets/enemies/reksai.glb')
      .then((gltf) => {
        const model = gltf.scene;
        model.scale.setScalar(ENEMY_SCALES.reksai);
        model.traverse((obj) => {
          if (!(obj instanceof THREE.Mesh)) return;
          const srcMat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
          const mName = srcMat?.name ?? obj.name ?? '';
          // 依据 skin0.bin.json initialSubmeshToHide: "Wrap Plane"
          if (/^(Wrap|Plane)$/i.test(mName) || /^(Wrap|Plane)$/i.test(obj.name)) {
            obj.visible = false;
            return;
          }
          obj.material = this.mat;
          obj.castShadow = true;
          obj.receiveShadow = true;
        });

        this.modelHolder.add(model);
        this.mixer = new THREE.AnimationMixer(model);

        const bindClip = (key: string, rx: RegExp, loop = true) => {
          const clip = gltf.animations.find((c) => rx.test(c.name));
          if (!clip || !this.mixer) return;
          const act = this.mixer.clipAction(clip);
          if (!loop) {
            act.setLoop(THREE.LoopOnce, 1);
            act.clampWhenFinished = true;
          }
          this.actions[key] = act;
        };

        bindClip('idle', /idle01/i);
        bindClip('run', /runhaste/i);
        bindClip('burrow', /run_burrowed/i);
        bindClip('unburrow', /spell2_unburrow/i, false);
        bindClip('attack', /attack1/i);
        bindClip('stomp', /spell2_knockup/i);
        bindClip('cast', /spell4_cast/i);
        bindClip('death', /death/i, false);

        this.play('idle', 0);
      })
      .catch((err) => console.error('[RekSaiRig] Failed to load reksai.glb:', err));
  }

  private play(key: string, fade = 0.14) {
    const next = this.actions[key] ?? this.actions.idle;
    if (!next || this.currentKey === key) return;
    const prev = this.actions[this.currentKey];
    if (prev) prev.fadeOut(fade);
    next.reset().fadeIn(fade).play();
    this.currentKey = key;
  }

  update(g: Game, dt: number) {
    const b = g.boss;
    if (!b || !b.alive) {
      this.root.visible = false;
      return;
    }

    this.ensureLoaded();
    this.root.visible = true;
    const t = g.clock;
    const entering = b.state === 'enter';
    const k = entering ? Math.min(1, b.stateT / BOSS.entranceTime) : 1;

    this.root.position.set(b.x, 0, b.z);
    this.root.rotation.y = b.face;
    this.shadow.scale.setScalar(entering ? 0.45 + k * 0.55 : 1);

    if (entering && k < 0.65) {
      this.modelHolder.position.y = -1.2 + (k / 0.65) * 0.9;
    } else if (entering) {
      const p = (k - 0.65) / 0.35;
      this.modelHolder.position.y = -0.3 * (1 - p);
    } else {
      this.modelHolder.position.y = 0;
    }

    const phase2 = g.bossPhase === 2;
    if (b.flash > 0.25) {
      this.mat.emissive.setHex(0x888888);
    } else if (phase2) {
      const pulse = Math.sin(t * 9) > 0 ? 0x3a0b22 : 0x1e0512;
      this.mat.emissive.setHex(pulse);
    } else {
      this.mat.emissive.setHex(0x000000);
    }

    const anim = g.bossAnim;
    const u = Math.min(1, (g.time - anim.t0) / Math.max(0.01, anim.dur));

    if (entering) {
      this.play(k < 0.65 ? 'burrow' : 'unburrow', 0.1);
    } else if (b.state === 'transition') {
      this.play('cast', 0.12);
    } else if (b.state === 'attack' && u < 1) {
      if (anim.move === 'sweep') this.play('attack', 0.1);
      else if (anim.move === 'stomp') this.play('stomp', 0.1);
      else this.play('cast', 0.1);
    } else if (b.state === 'window') {
      const d = Math.hypot(g.player.x - b.x, g.player.z - b.z);
      this.play(d > 5.2 ? 'run' : 'idle', 0.16);
    } else {
      this.play('idle', 0.16);
    }

    this.mixer?.update(dt);
  }
}

```

---

## File: `src/render/enemy_models.ts`

```ts
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { ENEMY_SCALES } from '../config';
import type { Enemy } from '../sim/game';
import { getTexture, loadGLB } from './assets';
import { blobShadowTex } from './style';

/**
 * 单 DrawCall 合批 3D 小怪渲染器（基于官方 .glb 几何体 + 官方贴图）。
 * 支持受击闪白与束缚染色，零额外 GC。
 */
export class InstancedEnemyModel {
  private inst: THREE.InstancedMesh | null = null;
  private count = 0;
  private loadStarted = false;

  constructor(
    private parent: THREE.Group,
    private glbUrl: string,
    private texUrl: string,
    private maxCount: number,
    defer = false,
  ) {
    if (!defer) this.ensureLoaded();
  }

  ensureLoaded() {
    if (this.loadStarted) return;
    this.loadStarted = true;

    const tex = getTexture(this.texUrl, { flipY: false });
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      color: 0xffffff,
      roughness: 0.72,
      metalness: 0.12,
      envMapIntensity: 0.45,
      side: THREE.DoubleSide,
    });

    loadGLB(this.glbUrl)
      .then((gltf) => {
        const geos: THREE.BufferGeometry[] = [];
        gltf.scene.updateMatrixWorld(true);
        gltf.scene.traverse((obj) => {
          if (!(obj instanceof THREE.Mesh) || !obj.visible) return;
          const g = obj.geometry.clone();
          g.applyMatrix4(obj.matrixWorld);
          if (!g.attributes.normal) g.computeVertexNormals();
          // 统一属性集，防止 mergeGeometries 因额外皮肤属性失败
          for (const key of Object.keys(g.attributes)) {
            if (key !== 'position' && key !== 'normal' && key !== 'uv') {
              g.deleteAttribute(key);
            }
          }
          const nonIdx = g.index ? g.toNonIndexed() : g;
          if (g.index) g.dispose();
          geos.push(nonIdx);
        });
        if (!geos.length) return;
        const merged = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
        if (geos.length > 1) geos.forEach((g) => g.dispose());
        if (!merged) return;

        const mesh = new THREE.InstancedMesh(merged, mat, this.maxCount);
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        mesh.frustumCulled = false;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.count = 0;
        const white = new THREE.Color(0xffffff);
        for (let i = 0; i < this.maxCount; i++) mesh.setColorAt(i, white);
        this.inst = mesh;
        this.parent.add(mesh);
      })
      .catch((err) => console.error('[InstancedEnemyModel] load failed:', this.glbUrl, err));
  }

  begin() {
    this.count = 0;
  }

  push(matrix: THREE.Matrix4, color: THREE.Color) {
    if (!this.loadStarted) this.ensureLoaded();
    if (!this.inst || this.count >= this.maxCount) return;
    this.inst.setMatrixAt(this.count, matrix);
    this.inst.setColorAt(this.count, color);
    this.count++;
  }

  end() {
    if (!this.inst) return;
    this.inst.count = this.count;
    this.inst.instanceMatrix.needsUpdate = true;
    if (this.inst.instanceColor) this.inst.instanceColor.needsUpdate = true;
  }
}

interface EliteSlot {
  root: THREE.Group;
  model: THREE.Object3D;
  mat: THREE.MeshStandardMaterial;
  mixer: THREE.AnimationMixer;
  actions: Record<string, THREE.AnimationAction>;
  curKey: string;
}

/**
 * 第一关重装精英（Strawberry_MiniBoss_Bruiser）骨骼动画对象池：
 * 同屏精英数量极少（<=6），使用真实骨骼动画展现奔跑与重击姿态。
 */
export class EliteBruiserPool {
  private slots: EliteSlot[] = [];
  private template: THREE.Object3D | null = null;
  private clips: THREE.AnimationClip[] = [];
  private baseTex: THREE.Texture | null = null;
  private loadStarted = false;

  constructor(private parent: THREE.Group, private maxSlots = 6, defer = false) {
    if (!defer) this.ensureLoaded();
  }

  ensureLoaded() {
    if (this.loadStarted) return;
    this.loadStarted = true;
    this.baseTex = getTexture('./assets/enemies/miniboss_bruiser.webp', { flipY: false });
    loadGLB('./assets/enemies/miniboss_bruiser.glb')
      .then((gltf) => {
        this.template = gltf.scene;
        this.clips = gltf.animations;
        for (let i = 0; i < this.maxSlots; i++) this.slots.push(this.createSlot());
      })
      .catch((err) => console.error('[EliteBruiserPool] load failed:', err));
  }

  private createSlot(): EliteSlot {
    const root = new THREE.Group();
    root.visible = false;

    const ringGeo = new THREE.RingGeometry(0.95, 1.12, 28);
    ringGeo.rotateX(-Math.PI / 2);
    const ring = new THREE.Mesh(
      ringGeo,
      new THREE.MeshBasicMaterial({ color: 0xff3b5c, transparent: true, opacity: 0.72, depthWrite: false }),
    );
    ring.position.y = 0.04;

    const shadowGeo = new THREE.PlaneGeometry(2.6, 2.6);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadow = new THREE.Mesh(
      shadowGeo,
      new THREE.MeshBasicMaterial({ map: blobShadowTex(), transparent: true, opacity: 0.5, depthWrite: false }),
    );
    shadow.position.y = 0.02;

    const mat = new THREE.MeshStandardMaterial({
      map: this.baseTex,
      roughness: 0.66,
      metalness: 0.18,
      envMapIntensity: 0.55,
      side: THREE.DoubleSide,
    });

    const model = cloneSkinned(this.template!);
    model.scale.setScalar(ENEMY_SCALES.bruiser);
    model.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      obj.material = mat;
      obj.castShadow = true;
      obj.receiveShadow = true;
    });

    root.add(shadow, ring, model);
    this.parent.add(root);

    const mixer = new THREE.AnimationMixer(model);
    const actions: Record<string, THREE.AnimationAction> = {};
    const bind = (key: string, rx: RegExp) => {
      const clip = this.clips.find((c) => rx.test(c.name));
      if (clip) actions[key] = mixer.clipAction(clip);
    };
    bind('run', /bruiser_run/i);
    bind('attack', /attack1/i);
    bind('idle', /idle1/i);
    if (actions.run) actions.run.play();

    return { root, model, mat, mixer, actions, curKey: actions.run ? 'run' : '' };
  }

  update(elites: Enemy[], dt: number) {
    if (elites.length > 0 && !this.loadStarted) this.ensureLoaded();
    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];
      const e = elites[i];
      if (!e) {
        slot.root.visible = false;
        continue;
      }
      slot.root.visible = true;
      const emerge = Math.min(1, e.age / 0.35);
      slot.root.position.set(e.x, 0, e.z);
      slot.root.rotation.y = e.face;
      slot.model.scale.setScalar(ENEMY_SCALES.bruiser * emerge);

      if (e.flash > 0.25) slot.mat.emissive.setHex(0x777777);
      else if (e.bindT > 0) slot.mat.emissive.setHex(0x1f5578);
      else slot.mat.emissive.setHex(0x000000);

      const want = e.state === 'windup' || e.state === 'dash' ? 'attack' : 'run';
      if (want !== slot.curKey && slot.actions[want]) {
        slot.actions[slot.curKey]?.fadeOut(0.12);
        slot.actions[want].reset().fadeIn(0.12).play();
        slot.curKey = want;
      }
      slot.mixer.update(dt);
    }
  }
}

```

---

## File: `src/render/jinx_vfx.ts`

```ts
import * as THREE from 'three';
import { getTexture, loadScbGeo, loadSpriteCell as loadAssetSpriteCell } from './assets';

export function loadSpriteCell(url: string, cols: number, rows: number, col = 0, row = 0): THREE.Texture {
  return loadAssetSpriteCell(url, col, row, cols, rows, { size: 64 });
}

interface BurstPlane {
  mesh: THREE.Mesh;
  age: number;
  life: number;
  s0: number;
  s1: number;
  rotSpeed: number;
  maxOp: number;
  active: boolean;
}

interface BurstMesh {
  mesh: THREE.Mesh;
  age: number;
  life: number;
  s0: number;
  s1: number;
  rotY: number;
  maxOp: number;
  active: boolean;
}

interface StarParticle {
  active: boolean;
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  age: number; life: number;
  r: number; g: number; b: number;
}

/**
 * 拳头 Patch 14.14 官方《无尽狂潮》金克丝全套 1:1 技能与武器 VFX 系统：
 * - R 死神飞弹飞行：3D 本体 + 3D 旋转气浪锥 + 青蓝光晕 + 地面投影 + 双色交叉尾焰 + 周期双色扩散尾环
 * - R 8 层核爆：黑曜石焦痕 + 3D 弹坑 + 致盲闪光 + 3D 穹顶 + 3D 涡流 + 3D 二次元爆裂网 + 3D 刃环 + 巨型猫脸 & 星辰
 * - E 鱼骨头 5 层爆炸：地面闪光 + 3D q_animeburst + 3D q_praxis + 猫脸爆裂 + 3D 弹坑 + 星辰
 * - 罪恶快感 5 层官方光环：深蓝底环 + 亮金旋转环 + 脉冲猫脸徽章 + 3D 漩涡 + 外扩疾跑环
 */
export class JinxVfxSystem {
  readonly root = new THREE.Group();
  readonly rocketGroup = new THREE.Group();
  private rocketCone: THREE.Mesh | null = null;
  private rocketRingSpawnT = 0;

  private passiveGroup = new THREE.Group();
  private passiveDarkBg: THREE.Mesh;
  private passiveGoldRing: THREE.Mesh;
  private passiveCat: THREE.Mesh;
  private passiveCatOut: THREE.Mesh;
  private passiveSwirl: THREE.Mesh | null = null;
  private passivePulseRing: THREE.Mesh;

  private muzzlePlane: THREE.Mesh;
  private muzzlePaw: THREE.Mesh;
  private muzzleT = 0;

  private planes: BurstPlane[] = [];
  private meshes: BurstMesh[] = [];

  private geoDome: THREE.BufferGeometry | null = null;
  private geoSwirl: THREE.BufferGeometry | null = null;
  private geoRPraxis: THREE.BufferGeometry | null = null;
  private geoRAnime: THREE.BufferGeometry | null = null;
  private geoQPraxis: THREE.BufferGeometry | null = null;
  private geoQAnime: THREE.BufferGeometry | null = null;
  private geoCrater: THREE.BufferGeometry | null = null;
  private geoCastRing: THREE.BufferGeometry | null = null;

  private texAura: THREE.Texture;
  private texGlow2: THREE.Texture;
  private texGunHit: THREE.Texture;
  private texRocketHit: THREE.Texture;
  private texCatLogo: THREE.Texture;
  private texCatOut: THREE.Texture;
  private texQShapes02: THREE.Texture;
  private texRShapes01: THREE.Texture;
  private texEPraxis: THREE.Texture;
  private texEErosion: THREE.Texture;
  private texREnergy: THREE.Texture;
  private texCrater: THREE.Texture;
  private texCraterObsi: THREE.Texture;
  private texCircleMis: THREE.Texture;

  private starPts: THREE.Points;
  private starGeo: THREE.BufferGeometry;
  private starPos: Float32Array;
  private starCol: Float32Array;
  private stars: StarParticle[] = [];
  private readonly maxStars = 220;

  /** 预留「减轻队友特效」缩放因子 */
  teammateVfxScale = 1.0;

  constructor(parent: THREE.Group | THREE.Scene) {
    parent.add(this.root);

    const loadTex = (url: string, flipY = true) => getTexture(url, { flipY });

    const propsTex = loadTex('./assets/heroes/jinx/vfx/props_tx.webp', false);
    const trailTex = loadTex('./assets/heroes/jinx/vfx/r_trail.webp');
    const coneTex = loadTex('./assets/heroes/jinx/vfx/r_conetexture.webp');
    const rShapeTex = loadTex('./assets/heroes/jinx/vfx/r_shape.webp');
    const muzzleTex = loadTex('./assets/heroes/jinx/vfx/muzzle_flash.webp');
    const catPawTex = loadTex('./assets/heroes/jinx/vfx/catpaw.webp');
    const ringTex = loadTex('./assets/heroes/jinx/vfx/passive_ring.webp');

    this.texAura = loadTex('./assets/heroes/jinx/vfx/aura_self.webp');
    this.texGlow2 = loadTex('./assets/heroes/jinx/vfx/base_glow2.webp');
    this.texGunHit = loadTex('./assets/heroes/jinx/vfx/gun_hit.webp');
    this.texRocketHit = loadTex('./assets/heroes/jinx/vfx/rocket_hit.webp');
    this.texCatLogo = loadTex('./assets/heroes/jinx/vfx/cat_logo.webp');
    this.texCatOut = loadTex('./assets/heroes/jinx/vfx/catlogo_outline.webp');
    this.texQShapes02 = loadTex('./assets/heroes/jinx/vfx/q_shapes02.webp');
    this.texRShapes01 = loadTex('./assets/heroes/jinx/vfx/r_shapes01.webp');
    this.texEPraxis = loadTex('./assets/heroes/jinx/vfx/e_praxis.webp');
    this.texEErosion = loadTex('./assets/heroes/jinx/vfx/e_erosion.webp');
    this.texREnergy = loadTex('./assets/heroes/jinx/vfx/r_energy.webp');
    this.texCrater = loadTex('./assets/heroes/jinx/vfx/crater_01.webp');
    this.texCraterObsi = loadTex('./assets/heroes/jinx/vfx/r_craterobsi.webp');
    this.texCircleMis = loadTex('./assets/heroes/jinx/vfx/circle_mis.webp');

    // 1. R 超究极死神飞弹完整飞行组件
    this.rocketGroup.visible = false;
    const mkAdd = (tex: THREE.Texture, color: number, opacity: number) => new THREE.MeshBasicMaterial({
      map: tex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false,
    });

    // 青蓝大光晕 + 双交叉尾焰 + 地面前导投影
    const rGlowGeo = new THREE.PlaneGeometry(2.8, 6.2);
    rGlowGeo.rotateX(-Math.PI / 2);
    rGlowGeo.translate(0, 0.05, -0.6);
    const rGlow = new THREE.Mesh(rGlowGeo, mkAdd(this.texAura, 0x00aaff, 0.72));

    const rGroundGeo = new THREE.PlaneGeometry(4.2, 7.2);
    rGroundGeo.rotateX(-Math.PI / 2);
    const rGround = new THREE.Mesh(rGroundGeo, mkAdd(rShapeTex, 0x62f8ff, 0.52));
    rGround.position.set(0, -0.96, 1.1);
    rGround.renderOrder = 8;

    const trailGeo = new THREE.PlaneGeometry(1.6, 3.6);
    trailGeo.rotateX(-Math.PI / 2);
    trailGeo.translate(0, 0, -2.1);
    const tMat = mkAdd(trailTex, 0x72f8ff, 0.92);
    const trail1 = new THREE.Mesh(trailGeo, tMat);
    const trail2 = new THREE.Mesh(trailGeo, tMat);
    trail2.rotation.z = Math.PI / 2;

    this.rocketGroup.add(rGlow, rGround, trail1, trail2);
    this.root.add(this.rocketGroup);

    loadScbGeo('./assets/heroes/jinx/vfx/r_rocket.json').then((geo) => {
      const m = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({
          map: propsTex, roughness: 0.42, metalness: 0.25,
          emissive: new THREE.Color(0x225577), emissiveIntensity: 0.55, side: THREE.DoubleSide,
        }),
      );
      m.scale.setScalar(0.035);
      this.rocketGroup.add(m);
    }).catch(() => {});

    loadScbGeo('./assets/heroes/jinx/vfx/r_conehead.json').then((geo) => {
      const m = new THREE.Mesh(geo, mkAdd(coneTex, 0x94f7ff, 0.82));
      // 官方 Strawberry_Jinx_Base_R_Mis sz=[2,5,1.7]：细长高速马赫锥，锥尖朝 +Z 飞行方向
      m.rotation.x = -Math.PI / 2;
      m.scale.set(0.022, 0.048, 0.020);
      m.position.z = 1.9;
      this.rocketCone = m;
      this.rocketGroup.add(m);
    }).catch(() => {});

    // 2. 罪恶快感 5 层官方脚底光环（严格对齐 skin0.bin.json 尺寸 ~1.45m，绕 Y 轴水平旋转）
    this.passiveGroup.visible = false;
    const flatPlane = (size: number) => {
      const g = new THREE.PlaneGeometry(size, size);
      g.rotateX(-Math.PI / 2);
      return g;
    };
    this.passiveDarkBg = new THREE.Mesh(
      flatPlane(1.35),
      new THREE.MeshBasicMaterial({ map: ringTex, color: 0x052854, transparent: true, opacity: 0.48, depthWrite: false }),
    );
    this.passiveDarkBg.position.y = 0.04;
    this.passiveDarkBg.renderOrder = 5;

    this.passiveGoldRing = new THREE.Mesh(flatPlane(1.45), mkAdd(ringTex, 0xffff7f, 0.62));
    this.passiveGoldRing.position.y = 0.06;
    this.passiveGoldRing.renderOrder = 6;

    this.passiveCat = new THREE.Mesh(flatPlane(1.35), mkAdd(this.texCatLogo, 0xff5ce0, 0.78));
    this.passiveCat.position.y = 0.07;
    this.passiveCat.renderOrder = 7;

    this.passiveCatOut = new THREE.Mesh(flatPlane(1.42), mkAdd(this.texCatOut, 0x6ef8ff, 0.65));
    this.passiveCatOut.position.y = 0.08;
    this.passiveCatOut.renderOrder = 7;

    this.passivePulseRing = new THREE.Mesh(flatPlane(1.2), mkAdd(this.texCircleMis, 0x72f8ff, 0.45));
    this.passivePulseRing.position.y = 0.05;
    this.passivePulseRing.renderOrder = 6;

    this.passiveGroup.add(this.passiveDarkBg, this.passiveGoldRing, this.passiveCat, this.passiveCatOut, this.passivePulseRing);
    this.root.add(this.passiveGroup);

    loadScbGeo('./assets/heroes/jinx/vfx/passive_swirl.json').then((geo) => {
      const m = new THREE.Mesh(geo, mkAdd(this.texREnergy, 0xff66cc, 0.72));
      m.scale.setScalar(0.0082);
      m.position.y = 0.18;
      m.renderOrder = 7;
      this.passiveSwirl = m;
      this.passiveGroup.add(m);
    }).catch(() => {});

    // 3. 喵喵枪 / 鱼骨头 官方枪口闪光 + 猫爪弧光
    const mfGeo = new THREE.PlaneGeometry(1.3, 1.3);
    mfGeo.rotateX(-Math.PI / 2);
    this.muzzlePlane = new THREE.Mesh(mfGeo, mkAdd(muzzleTex, 0x8ef9ff, 0.95));
    this.muzzlePlane.visible = false;
    this.muzzlePlane.renderOrder = 14;
    this.muzzlePaw = new THREE.Mesh(mfGeo, mkAdd(catPawTex, 0x55ffff, 0.65));
    this.muzzlePaw.visible = false;
    this.muzzlePaw.renderOrder = 14;
    this.root.add(this.muzzlePlane, this.muzzlePaw);

    // 4. 广告牌特效池（64 个）与 3D SCB 特效池（36 个）
    const unitGeo = new THREE.PlaneGeometry(1, 1);
    unitGeo.rotateX(-Math.PI / 2);
    for (let i = 0; i < 64; i++) {
      const m = new THREE.Mesh(unitGeo, mkAdd(this.texGunHit, 0xffffff, 0.9));
      m.visible = false;
      m.renderOrder = 13;
      this.root.add(m);
      this.planes.push({ mesh: m, age: 0, life: 0.3, s0: 1, s1: 2, rotSpeed: 0, maxOp: 0.9, active: false });
    }

    const dummyGeo = new THREE.BufferGeometry();
    for (let i = 0; i < 36; i++) {
      const m = new THREE.Mesh(dummyGeo, mkAdd(this.texREnergy, 0xffffff, 0.85));
      m.visible = false;
      m.renderOrder = 15;
      this.root.add(m);
      this.meshes.push({ mesh: m, age: 0, life: 0.4, s0: 0.01, s1: 0.05, rotY: 0, maxOp: 0.85, active: false });
    }

    // 5. 离屏裁剪官方 lilstar_4x2.webp 星辰爆发粒子池
    const starTex = loadSpriteCell('./assets/heroes/jinx/vfx/lilstar_4x2.webp', 4, 2, 0, 0);
    this.starPos = new Float32Array(this.maxStars * 3);
    this.starCol = new Float32Array(this.maxStars * 3);
    this.starGeo = new THREE.BufferGeometry();
    this.starGeo.setAttribute('position', new THREE.BufferAttribute(this.starPos, 3));
    this.starGeo.setAttribute('color', new THREE.BufferAttribute(this.starCol, 3));
    this.starPts = new THREE.Points(
      this.starGeo,
      new THREE.PointsMaterial({
        size: 0.72, map: starTex, alphaTest: 0.05, vertexColors: true, transparent: true, opacity: 0.95,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }),
    );
    this.starPts.frustumCulled = false;
    this.starPts.renderOrder = 17;
    this.root.add(this.starPts);
    for (let i = 0; i < this.maxStars; i++) {
      this.stars.push({ active: false, x: 0, y: -99, z: 0, vx: 0, vy: 0, vz: 0, age: 0, life: 0.5, r: 1, g: 1, b: 1 });
    }

    // 异步加载全部爆炸用官方 3D SCB 网格
    const loadGeo = (file: string, cb: (g: THREE.BufferGeometry) => void) => {
      loadScbGeo(`./assets/heroes/jinx/vfx/${file}`)
        .then(cb)
        .catch(() => {});
    };
    loadGeo('r_dome.json', (g) => { this.geoDome = g; });
    loadGeo('r_swirl.json', (g) => { this.geoSwirl = g; });
    loadGeo('r_praxis.json', (g) => { this.geoRPraxis = g; });
    loadGeo('r_animeburst.json', (g) => { this.geoRAnime = g; });
    loadGeo('q_praxis.json', (g) => { this.geoQPraxis = g; });
    loadGeo('q_animeburst.json', (g) => { this.geoQAnime = g; });
    loadGeo('crater.json', (g) => { this.geoCrater = g; });
    loadGeo('r_castring.json', (g) => { this.geoCastRing = g; });
  }

  private allocPlane(
    x: number, y: number, z: number, tex: THREE.Texture, hex: number,
    s0: number, s1: number, life: number, maxOp = 0.9, rotSpeed = 0, additive = true, verticalYaw: number | null = null,
  ) {
    const b = this.planes.find((p) => !p.active);
    if (!b) return;
    b.active = true;
    b.age = 0;
    b.life = life;
    b.s0 = s0;
    b.s1 = s1;
    b.rotSpeed = rotSpeed;
    b.maxOp = maxOp;
    b.mesh.visible = true;
    b.mesh.position.set(x, y, z);
    if (verticalYaw !== null) {
      b.mesh.rotation.set(Math.PI / 2, verticalYaw, 0, 'YXZ');
    } else {
      b.mesh.rotation.set(0, Math.random() * Math.PI * 2, 0);
    }
    b.mesh.scale.setScalar(s0);
    const mat = b.mesh.material as THREE.MeshBasicMaterial;
    mat.map = tex;
    mat.color.setHex(hex);
    mat.opacity = maxOp;
    mat.blending = additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    mat.needsUpdate = true;
  }

  private allocMesh(
    geo: THREE.BufferGeometry | null, x: number, y: number, z: number, tex: THREE.Texture,
    hex: number, s0: number, s1: number, life: number, maxOp = 0.85, rotY = 0, additive = true,
  ) {
    if (!geo) return;
    const b = this.meshes.find((m) => !m.active);
    if (!b) return;
    b.active = true;
    b.age = 0;
    b.life = life;
    b.s0 = s0;
    b.s1 = s1;
    b.rotY = rotY;
    b.maxOp = maxOp;
    b.mesh.geometry = geo;
    b.mesh.visible = true;
    b.mesh.position.set(x, y, z);
    b.mesh.rotation.set(0, Math.random() * Math.PI * 2, 0);
    b.mesh.scale.setScalar(s0);
    const mat = b.mesh.material as THREE.MeshBasicMaterial;
    mat.map = tex;
    mat.color.setHex(hex);
    mat.opacity = maxOp;
    mat.blending = additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    mat.needsUpdate = true;
  }

  private spawnStars(x: number, z: number, count: number, speed: number, hex: number) {
    const c = new THREE.Color(hex);
    let n = 0;
    for (let i = 0; i < this.maxStars && n < count; i++) {
      const s = this.stars[i];
      if (s.active) continue;
      s.active = true;
      s.x = x; s.y = 0.45; s.z = z;
      const a = Math.random() * Math.PI * 2;
      const sp = speed * (0.45 + Math.random() * 0.75);
      s.vx = Math.cos(a) * sp;
      s.vy = 2.4 + Math.random() * speed * 0.55;
      s.vz = Math.sin(a) * sp;
      s.age = 0;
      s.life = 0.35 + Math.random() * 0.35;
      s.r = c.r; s.g = c.g; s.b = c.b;
      n++;
    }
  }

  triggerMuzzle(x: number, z: number, ang: number, weapon: 'mg' | 'cn' | 'ult', ownerId = 0) {
    const scale = ownerId > 0 ? this.teammateVfxScale : 1;
    const mx = x + Math.cos(ang) * 1.05;
    const mz = z + Math.sin(ang) * 1.05;
    this.muzzlePlane.position.set(mx, 0.92, mz);
    this.muzzlePlane.rotation.y = -ang + Math.PI / 2;
    const mat = this.muzzlePlane.material as THREE.MeshBasicMaterial;
    mat.color.setHex(weapon === 'mg' ? 0xffe455 : weapon === 'cn' ? 0xff9e3d : 0x72f8ff);
    mat.opacity = 0.95 * scale;
    this.muzzlePlane.scale.setScalar((weapon === 'mg' ? 0.95 : weapon === 'cn' ? 1.45 : 2.1) * scale);

    this.muzzlePaw.position.set(mx, 0.95, mz);
    this.muzzlePaw.rotation.y = -ang + Math.PI / 2;
    this.muzzlePaw.scale.setScalar((weapon === 'mg' ? 0.9 : 1.5) * scale);
    this.muzzleT = weapon === 'mg' ? 0.08 : 0.14;

    if (weapon === 'ult') {
      this.allocMesh(this.geoCastRing, mx, 0.9, mz, this.texAura, 0x6ef8ff, 0.12, 0.52, 0.38, 0.9, 6);
    }
  }

  spawnGunHit(x: number, z: number, crit = false, evolved = false) {
    this.allocPlane(x, 0.65, z, this.texRocketHit, crit ? 0xffe44d : evolved ? 0x5ef8ff : 0xffdf55, 0.45, crit ? 1.55 : 1.15, 0.2, 0.9, 2);
    this.allocPlane(x, 0.68, z, this.texQShapes02, evolved ? 0xff4ce2 : 0xff66cc, 0.35, 1.1, 0.22, 0.78, -3);
    if (crit || evolved) this.spawnStars(x, z, crit ? 7 : 4, 5.5, crit ? 0xffdd30 : 0x52f2ff);
  }

  private eCraterCooldownT = 0;

  /** E 鱼骨头 5 层官方爆炸（弹坑节流防 9 枚齐射叠糊） */
  spawnRocketEBlast(x: number, z: number, radius: number) {
    this.allocPlane(x, 0.08, z, this.texAura, 0x0096ff, radius * 0.5, radius * 1.4, 0.22, 0.52, 0);
    if (this.eCraterCooldownT <= 0) {
      this.eCraterCooldownT = 0.16;
      this.allocMesh(this.geoCrater, x, 0.04, z, this.texCrater, 0xd1c2ba, radius * 0.007, radius * 0.0095, 0.95, 0.42, 0, false);
    }
    this.allocMesh(this.geoQAnime, x, 0.12, z, this.texEErosion, 0xff9b42, radius * 0.0035, radius * 0.0095, 0.32, 0.72, 4);
    this.allocMesh(this.geoQPraxis, x, 0.15, z, this.texEPraxis, 0x7df9ff, radius * 0.0028, radius * 0.007, 0.36, 0.72, -3);
    this.allocPlane(x, 0.42, z, this.texCatLogo, 0xff7be0, radius * 0.35, radius * 0.72, 0.36, 0.72, 1.5, false);
    this.allocPlane(x, 0.36, z, this.texRocketHit, 0xffc852, radius * 0.4, radius * 1.05, 0.25, 0.82, 2);
    this.spawnStars(x, z, 6, 7.0, 0xffdd30);
  }

  /** R 超究极死神飞弹 8 层二次元核爆 */
  spawnUltDome(x: number, z: number, radius: number) {
    // 1. 黑曜石焦痕 & 3D 弹坑
    this.allocPlane(x, 0.03, z, this.texCraterObsi, 0x26202b, radius * 1.5, radius * 2.35, 1.85, 0.78, 0, false);
    this.allocMesh(this.geoCrater, x, 0.05, z, this.texCrater, 0xd8c8be, radius * 0.009, radius * 0.013, 1.45, 0.65, 0, false);
    // 2. 致盲白黄闪光
    this.allocPlane(x, 0.28, z, this.texGlow2, 0xffff80, radius * 0.8, radius * 2.5, 0.26, 0.95, 0);
    this.allocPlane(x, 0.24, z, this.texAura, 0xffff40, radius * 0.9, radius * 2.3, 0.38, 0.85, 0);
    // 3. 四重官方 3D SCB 特效网格（穹顶 + 涡流 + 二次元爆裂网 + 切割刃环）
    this.allocMesh(this.geoDome, x, 0.08, z, this.texREnergy, 0x64f6ff, radius * 0.006, radius / 52.3, 0.58, 0.88, 1.2);
    this.allocMesh(this.geoSwirl, x, 0.16, z, this.texEErosion, 0x52f2ff, radius * 0.004, radius / 91.6, 0.52, 0.82, 5.5);
    this.allocMesh(this.geoRAnime, x, 0.12, z, this.texRShapes01, 0xffe354, radius * 0.004, radius / 104.7, 0.44, 0.9, -2.5);
    this.allocMesh(this.geoRPraxis, x, 0.18, z, this.texEPraxis, 0xff70df, radius * 0.003, radius / 163.4, 0.52, 0.85, 3.2);
    // 4. 巨型猫脸徽章 + 外框 + 星辰爆发
    this.allocPlane(x, 0.45, z, this.texCatLogo, 0xff80e0, radius * 0.65, radius * 1.55, 0.65, 0.92, 1.4, false);
    this.allocPlane(x, 0.48, z, this.texCatOut, 0x62f8ff, radius * 0.7, radius * 1.7, 0.6, 0.85, -1.0);
    this.spawnStars(x, z, 28, 11.5, 0xffdd30);
  }

  update(dt: number, clock: number, px: number, pz: number, excited: boolean, reduceFlash: boolean) {
    if (this.eCraterCooldownT > 0) this.eCraterCooldownT -= dt;
    if (this.muzzleT > 0 && !reduceFlash) {
      this.muzzleT -= dt;
      this.muzzlePlane.visible = true;
      this.muzzlePaw.visible = true;
    } else {
      this.muzzlePlane.visible = false;
      this.muzzlePaw.visible = false;
    }

    // R 飞弹飞行时气浪锥旋转 + 每 0.06s 发射双色垂直扩散尾环
    if (this.rocketGroup.visible) {
      if (this.rocketCone) this.rocketCone.rotation.y += dt * 12;
      this.rocketRingSpawnT -= dt;
      if (this.rocketRingSpawnT <= 0) {
        this.rocketRingSpawnT = 0.065;
        const rx = this.rocketGroup.position.x;
        const ry = this.rocketGroup.position.y;
        const rz = this.rocketGroup.position.z;
        const yaw = this.rocketGroup.rotation.y;
        const bx = rx - Math.sin(yaw) * 1.1;
        const bz = rz - Math.cos(yaw) * 1.1;
        this.allocPlane(bx, ry, bz, this.texCircleMis, 0x00d8e6, 0.65, 1.85, 0.34, 0.8, 0, true, yaw);
        this.allocPlane(bx, ry, bz, this.texCircleMis, 0xffaa00, 0.45, 1.35, 0.28, 0.8, 0, true, yaw);
      }
    }

    // 罪恶快感 5 层光环（全绕 Y 轴水平旋转）
    this.passiveGroup.visible = excited;
    if (excited) {
      this.passiveGroup.position.set(px, 0, pz);
      this.passiveDarkBg.rotation.y = clock * 0.6;
      this.passiveGoldRing.rotation.y = clock * 2.6;
      const pulse = 1 + Math.sin(clock * 10) * 0.08;
      this.passiveGoldRing.scale.setScalar(pulse);
      const catPulse = 0.92 + Math.sin(clock * 8) * 0.1;
      this.passiveCat.scale.setScalar(catPulse);
      this.passiveCatOut.scale.setScalar(catPulse * 1.04);
      const ringK = (clock * 1.8) % 1;
      this.passivePulseRing.scale.setScalar(0.7 + ringK * 0.95);
      (this.passivePulseRing.material as THREE.MeshBasicMaterial).opacity = (1 - ringK) * 0.52;
      if (this.passiveSwirl) this.passiveSwirl.rotation.y = -clock * 4.2;
    }

    const opScale = reduceFlash ? 0.5 : 1.0;

    for (const b of this.planes) {
      if (!b.active) continue;
      b.age += dt;
      if (b.age >= b.life) { b.active = false; b.mesh.visible = false; continue; }
      const k = b.age / b.life;
      const ease = 1 - Math.pow(1 - k, 2);
      b.mesh.scale.setScalar(b.s0 + (b.s1 - b.s0) * ease);
      if (b.rotSpeed) b.mesh.rotation.y += b.rotSpeed * dt;
      (b.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - k) * b.maxOp * opScale;
    }

    for (const b of this.meshes) {
      if (!b.active) continue;
      b.age += dt;
      if (b.age >= b.life) { b.active = false; b.mesh.visible = false; continue; }
      const k = b.age / b.life;
      const ease = 1 - Math.pow(1 - k, 2);
      b.mesh.scale.setScalar(b.s0 + (b.s1 - b.s0) * ease);
      if (b.rotY) b.mesh.rotation.y += b.rotY * dt;
      (b.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - k) * b.maxOp * opScale;
    }

    let activeS = 0;
    for (let i = 0; i < this.maxStars; i++) {
      const s = this.stars[i];
      if (!s.active) { this.starPos[i * 3 + 1] = -99; continue; }
      s.age += dt;
      if (s.age >= s.life) { s.active = false; this.starPos[i * 3 + 1] = -99; continue; }
      s.vy -= 14 * dt;
      s.x += s.vx * dt;
      s.y = Math.max(0.08, s.y + s.vy * dt);
      s.z += s.vz * dt;
      const fade = 1 - s.age / s.life;
      this.starPos[i * 3] = s.x; this.starPos[i * 3 + 1] = s.y; this.starPos[i * 3 + 2] = s.z;
      this.starCol[i * 3] = s.r * fade; this.starCol[i * 3 + 1] = s.g * fade; this.starCol[i * 3 + 2] = s.b * fade;
      activeS++;
    }
    void activeS;
    this.starGeo.attributes.position.needsUpdate = true;
    this.starGeo.attributes.color.needsUpdate = true;
  }
}

```

---

## File: `src/render/weapon_vfx.ts`

```ts
import * as THREE from 'three';
import type { Game } from '../sim/game';
import { getTexture, loadScbGeo, type TextureOpts } from './assets';

function mkCrossedPlaneGeo(w: number, l: number): THREE.BufferGeometry {
  // 两片均沿 Z 轴延展且贴图前端朝 +Z 飞行方向（一片水平 XZ，一片竖直 YZ）
  const g1 = new THREE.PlaneGeometry(w, l);
  g1.rotateX(-Math.PI / 2);
  g1.rotateY(Math.PI);
  const g2 = new THREE.PlaneGeometry(w, l);
  g2.rotateX(-Math.PI / 2);
  g2.rotateY(Math.PI);
  g2.rotateZ(Math.PI / 2);
  const p1 = g1.attributes.position.array as Float32Array;
  const p2 = g2.attributes.position.array as Float32Array;
  const u1 = g1.attributes.uv.array as Float32Array;
  const u2 = g2.attributes.uv.array as Float32Array;
  const pos = new Float32Array(p1.length + p2.length);
  pos.set(p1, 0); pos.set(p2, p1.length);
  const uv = new Float32Array(u1.length + u2.length);
  uv.set(u1, 0); uv.set(u2, u1.length);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const i1 = Array.from(g1.index!.array);
  const i2 = Array.from(g2.index!.array).map((v) => v + 4);
  geo.setIndex([...i1, ...i2]);
  g1.dispose(); g2.dispose();
  return geo;
}

function mkFlatGeo(w: number, l: number): THREE.BufferGeometry {
  const g = new THREE.PlaneGeometry(w, l);
  g.rotateX(-Math.PI / 2);
  return g;
}

function mkInst(root: THREE.Group, geo: THREE.BufferGeometry, mat: THREE.Material, cap: number, order = 9) {
  const m = new THREE.InstancedMesh(geo, mat, cap);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.frustumCulled = false;
  m.count = 0;
  m.renderOrder = order;
  root.add(m);
  return m;
}

const D = new THREE.Object3D();
const WHITE = new THREE.Color(1, 1, 1);

interface SkyBeam {
  group: THREE.Group;
  age: number;
  life: number;
  active: boolean;
}

interface BurstItem {
  mesh: THREE.Mesh;
  age: number;
  life: number;
  s0: number;
  s1: number;
  maxOp: number;
  active: boolean;
}

/**
 * 《无尽狂潮》全部 10 把官方武器 1:1 视觉 VFX 渲染器（池化零 GC）：
 * - E 鱼骨头 3D 猫猫火箭（cat_rocket.json + props_tx.png）
 * - 喵喵枪 / 战猫弹幕（project_bolts.png 双交叉发光光弹）
 * - UwU / 十字弩 / 回旋刃 / 旋风切割器（官方武器贴图）
 * - 耀光力场（3D hr_outline.json + hr_fire.json + 滚动 hr_noise.png）
 * - 斯塔缇克闪电链（0.72m 宽幅官方闪电光带）
 * - 战兔巨爆（star_target 准星 + 13m 垂直激光柱 + star_burst 3D 爆裂 + star_crack 地裂）
 * - 冰爆护甲（3D frost_ring.json + frost_crack 地裂 + frost_shield 进化冰盾）
 */
export class WeaponVfxRenderer {
  readonly root = new THREE.Group();

  // 投射物官方贴图池
  private meowInst: THREE.InstancedMesh;
  private uwuInst: THREE.InstancedMesh;
  private crossbowInst: THREE.InstancedMesh;
  private boomInst: THREE.InstancedMesh;
  private boomEvoInst: THREE.InstancedMesh;
  private orbitalInst: THREE.InstancedMesh;
  private orbitalEvoInst: THREE.InstancedMesh;

  // E 鱼骨头 3D 猫猫火箭池
  private catRocketPool: THREE.Group[] = [];
  private catGeo: THREE.BufferGeometry | null = null;
  private catMat: THREE.MeshStandardMaterial;
  private catGlowGeo: THREE.BufferGeometry;
  private catGlowMat: THREE.MeshBasicMaterial;

  // 耀光力场官方 3D 网格
  private hrGroup = new THREE.Group();
  private hrOutlineMesh: THREE.Mesh | null = null;
  private hrFireMesh: THREE.Mesh | null = null;
  private hrNoiseTex: THREE.Texture;
  private hrGlowTex: THREE.Texture;

  // 进化冰盾官方贴图球罩
  private iceShieldMesh: THREE.Mesh;

  // 斯塔缇克宽幅 3D 闪电光带池
  private boltPool: THREE.Mesh[] = [];
  private boltGeo: THREE.BufferGeometry;

  // 战兔巨爆地面准星池 & 雷暴电圈池
  private starTargets: THREE.InstancedMesh;
  private stormRings: THREE.InstancedMesh;
  private skyBeams: SkyBeam[] = [];
  private vfxBursts: BurstItem[] = [];

  private geoStarBurst: THREE.BufferGeometry | null = null;
  private geoFrostRing: THREE.BufferGeometry | null = null;
  private unitFlatGeo: THREE.BufferGeometry;
  private texStarCrack: THREE.Texture;
  private texFrostCrack: THREE.Texture;
  private texStarInner: THREE.Texture;
  private texFrostTile: THREE.Texture;

  constructor(parent: THREE.Group) {
    parent.add(this.root);

    const loadTex = (url: string, opts?: TextureOpts) => getTexture(url, opts);

    const mkAdd = (tex: THREE.Texture, color = 0xffffff, opacity = 0.92) => new THREE.MeshBasicMaterial({
      map: tex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false,
    });

    // 1. 投射物官方贴图合批（网格材质原生 repeat/offset 裁剪单格）
    const boltTex = loadTex('./assets/heroes/jinx/vfx/project_bolts.webp', { unique: true });
    boltTex.repeat.set(0.5, 1);
    boltTex.offset.set(0, 0);
    this.meowInst = mkInst(this.root, mkCrossedPlaneGeo(0.45, 1.45), mkAdd(boltTex, 0xffffff, 0.96), 320, 10);
    this.meowInst.setColorAt(0, WHITE);

    const uwuTex = loadTex('./assets/weapons/vfx/uwu_ball.webp');
    this.uwuInst = mkInst(this.root, mkFlatGeo(0.95, 0.95), mkAdd(uwuTex, 0xff9be6, 0.95), 64, 10);

    const cbTex = loadTex('./assets/weapons/vfx/crossbow_bolt.webp', { unique: true });
    cbTex.repeat.set(0.38, 1);
    cbTex.offset.set(0, 0);
    this.crossbowInst = mkInst(this.root, mkCrossedPlaneGeo(0.55, 1.55), mkAdd(cbTex, 0xffffff, 0.95), 96, 10);
    this.crossbowInst.setColorAt(0, WHITE);

    const boomTex = loadTex('./assets/weapons/vfx/boom_mis.webp');
    const boomEvoTex = loadTex('./assets/weapons/vfx/boom_mis_evo.webp');
    this.boomInst = mkInst(this.root, mkFlatGeo(1.45, 1.45), mkAdd(boomTex, 0xffffff, 0.95), 36, 10);
    this.boomEvoInst = mkInst(this.root, mkFlatGeo(1.75, 1.75), mkAdd(boomEvoTex, 0xffffff, 0.98), 36, 10);

    const orbTex = loadTex('./assets/weapons/vfx/bauble_blade.webp');
    const orbEvoTex = loadTex('./assets/weapons/vfx/bauble_blade_evo.webp');
    this.orbitalInst = mkInst(this.root, mkFlatGeo(1.6, 1.6), mkAdd(orbTex, 0xffffff, 0.95), 16, 10);
    this.orbitalEvoInst = mkInst(this.root, mkFlatGeo(2.05, 2.05), mkAdd(orbEvoTex, 0xffffff, 0.98), 16, 10);

    // 2. E 鱼骨头 3D 猫猫火箭池（最多同屏 18 枚）
    const propsTex = loadTex('./assets/heroes/jinx/vfx/props_tx.webp', { flipY: false });
    this.catMat = new THREE.MeshStandardMaterial({
      map: propsTex, roughness: 0.45, metalness: 0.2,
      emissive: new THREE.Color(0x552210), emissiveIntensity: 0.45, side: THREE.DoubleSide,
    });
    const baseGlow = loadTex('./assets/heroes/jinx/vfx/base_glow.webp');
    this.catGlowGeo = mkFlatGeo(0.55, 1.35);
    this.catGlowMat = mkAdd(baseGlow, 0xff9e38, 0.78);

    loadScbGeo('./assets/heroes/jinx/vfx/cat_rocket.json').then((geo) => {
      this.catGeo = geo;
      for (let i = 0; i < 18; i++) {
        const g = new THREE.Group();
        const m = new THREE.Mesh(this.catGeo, this.catMat);
        m.scale.setScalar(0.020);
        const tail = new THREE.Mesh(this.catGlowGeo, this.catGlowMat);
        tail.position.z = -0.7;
        g.add(m, tail);
        g.visible = false;
        this.root.add(g);
        this.catRocketPool.push(g);
      }
    }).catch(() => {});

    // 3. 耀光力场官方 3D 网格
    this.hrGlowTex = loadTex('./assets/weapons/vfx/hr_glow.webp');
    this.hrNoiseTex = loadTex('./assets/weapons/vfx/hr_noise.webp', { repeat: true });
    this.hrGroup.visible = false;
    this.root.add(this.hrGroup);

    loadScbGeo('./assets/weapons/vfx/hr_outline.json').then((geo) => {
      this.hrOutlineMesh = new THREE.Mesh(geo, mkAdd(this.hrGlowTex, 0x55ff70, 0.72));
      this.hrOutlineMesh.position.y = 0.05;
      this.hrOutlineMesh.renderOrder = 6;
      this.hrGroup.add(this.hrOutlineMesh);
    }).catch(() => {});
    loadScbGeo('./assets/weapons/vfx/hr_fire.json').then((geo) => {
      this.hrFireMesh = new THREE.Mesh(geo, mkAdd(this.hrNoiseTex, 0x22cc44, 0.48));
      this.hrFireMesh.position.y = 0.04;
      this.hrFireMesh.renderOrder = 5;
      this.hrGroup.add(this.hrFireMesh);
    }).catch(() => {});

    // 4. 进化冰盾球罩
    const shieldTex = loadTex('./assets/weapons/vfx/frost_shield.webp');
    this.iceShieldMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 18, 14),
      mkAdd(shieldTex, 0x7ef2ff, 0.58),
    );
    this.iceShieldMesh.visible = false;
    this.iceShieldMesh.renderOrder = 12;
    this.root.add(this.iceShieldMesh);

    // 5. 斯塔缇克宽幅 3D 闪电光带池（32 条，UV 裁剪 4×1 单列）
    const boltWaveTex = loadTex('./assets/weapons/vfx/statikk_bolt.webp', { unique: true });
    boltWaveTex.repeat.set(0.25, 1);
    boltWaveTex.offset.set(0, 0);
    this.boltGeo = new THREE.PlaneGeometry(0.85, 1);
    this.boltGeo.rotateX(-Math.PI / 2);
    for (let i = 0; i < 32; i++) {
      const m = new THREE.Mesh(this.boltGeo, mkAdd(boltWaveTex, 0x7efaff, 0.95));
      m.visible = false;
      m.renderOrder = 16;
      this.root.add(m);
      this.boltPool.push(m);
    }

    // 6. 战兔巨爆地面准星（star_target.webp）& 电刀雷暴圆形电环（circle_mis.webp）
    const starTargetTex = loadTex('./assets/weapons/vfx/star_target.webp');
    this.starTargets = mkInst(this.root, mkFlatGeo(2.0, 2.0), mkAdd(starTargetTex, 0x72f8ff, 0.9), 24, 6);

    const stormTex = loadTex('./assets/heroes/jinx/vfx/circle_mis.webp');
    this.stormRings = mkInst(this.root, mkFlatGeo(1.0, 1.0), mkAdd(stormTex, 0x45f2ff, 0.58), 24, 6);

    // 7. 战兔巨爆 13m 垂直通天激光柱池（12 个）
    const beamCoreTex = loadTex('./assets/weapons/vfx/star_beam_core.webp');
    const beamCenterTex = loadTex('./assets/weapons/vfx/star_beam_center.webp');
    const bPlane = new THREE.PlaneGeometry(1.8, 14.0);
    bPlane.translate(0, 7.0, 0);
    const bMat1 = mkAdd(beamCoreTex, 0x8ef9ff, 0.95);
    const bMat2 = mkAdd(beamCenterTex, 0xffe485, 0.9);
    for (let i = 0; i < 12; i++) {
      const g = new THREE.Group();
      const pA = new THREE.Mesh(bPlane, bMat1);
      const pB = new THREE.Mesh(bPlane, bMat1);
      pB.rotation.y = Math.PI / 2;
      const pC = new THREE.Mesh(bPlane, bMat2);
      pC.scale.set(0.65, 1, 1);
      const pD = new THREE.Mesh(bPlane, bMat2);
      pD.rotation.y = Math.PI / 2;
      pD.scale.set(0.65, 1, 1);
      g.add(pA, pB, pC, pD);
      g.visible = false;
      g.renderOrder = 16;
      this.root.add(g);
      this.skyBeams.push({ group: g, age: 0, life: 0.42, active: false });
    }

    // 8. 通用炸裂贴花 / 3D SCB 池（星爆裂纹、冰爆环等）
    this.unitFlatGeo = mkFlatGeo(2.0, 2.0);
    this.texStarCrack = loadTex('./assets/weapons/vfx/star_crack.webp');
    this.texFrostCrack = loadTex('./assets/weapons/vfx/frost_crack.webp');
    this.texStarInner = loadTex('./assets/heroes/jinx/vfx/e_erosion.webp');
    this.texFrostTile = loadTex('./assets/weapons/vfx/frost_tile.webp');

    const dummy = new THREE.BufferGeometry();
    for (let i = 0; i < 24; i++) {
      const m = new THREE.Mesh(dummy, mkAdd(this.texStarCrack, 0xffffff, 0.9));
      m.visible = false;
      m.renderOrder = 11;
      this.root.add(m);
      this.vfxBursts.push({ mesh: m, age: 0, life: 0.5, s0: 1, s1: 2, maxOp: 0.9, active: false });
    }

    loadScbGeo('./assets/weapons/vfx/star_burst.json').then((geo) => {
      this.geoStarBurst = geo;
    }).catch(() => {});
    loadScbGeo('./assets/weapons/vfx/frost_ring.json').then((geo) => {
      this.geoFrostRing = geo;
    }).catch(() => {});
  }

  private allocBurst(
    geo: THREE.BufferGeometry | null, x: number, y: number, z: number,
    tex: THREE.Texture, hex: number, s0: number, s1: number, life: number, maxOp = 0.88, additive = true, order = 11,
  ) {
    if (!geo) return;
    const b = this.vfxBursts.find((v) => !v.active);
    if (!b) return;
    b.active = true;
    b.age = 0;
    b.life = life;
    b.s0 = s0;
    b.s1 = s1;
    b.maxOp = maxOp;
    b.mesh.geometry = geo;
    b.mesh.renderOrder = order;
    b.mesh.visible = true;
    b.mesh.position.set(x, y, z);
    b.mesh.rotation.set(0, Math.random() * Math.PI * 2, 0);
    b.mesh.scale.setScalar(s0);
    const mat = b.mesh.material as THREE.MeshBasicMaterial;
    mat.map = tex;
    mat.color.setHex(hex);
    mat.opacity = maxOp;
    mat.blending = additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    mat.needsUpdate = true;
  }

  spawnOrbitalBeam(x: number, z: number, radius: number) {
    const b = this.skyBeams.find((v) => !v.active);
    if (b) {
      b.active = true;
      b.age = 0;
      b.life = 0.42;
      b.group.visible = true;
      b.group.position.set(x, 0, z);
      b.group.scale.set(radius * 0.68, 1, radius * 0.68);
    }
    this.allocBurst(this.geoStarBurst, x, 0.1, z, this.texStarInner, 0x8ef9ff, radius * 0.004, radius / 104.7, 0.36, 0.9, true, 12);
    this.allocBurst(this.unitFlatGeo, x, 0.03, z, this.texStarCrack, 0xb8f8ff, radius * 0.72, radius * 1.0, 0.75, 0.34, false, 3);
  }

  spawnIceBlast(x: number, z: number, radius: number) {
    this.allocBurst(this.geoFrostRing, x, 0.08, z, this.texFrostTile, 0x8ef9ff, radius * 0.002, radius / 167.75, 0.48, 0.88, true, 11);
    this.allocBurst(this.unitFlatGeo, x, 0.04, z, this.texFrostCrack, 0xa8f8ff, radius * 0.45, radius * 0.65, 1.0, 0.72, true, 4);
  }

  update(g: Game, dt: number) {
    const t = g.clock;

    // 1. 友方投射物分流渲染
    let mIdx = 0, uIdx = 0, cbIdx = 0, bmIdx = 0, bmeIdx = 0, catIdx = 0;
    const COL_CYAN = new THREE.Color(0x52f2ff);
    const COL_GOLD = new THREE.Color(0xffd040);
    const COL_EVO = new THREE.Color(0xff5ce6);
    const COL_CRIT = new THREE.Color(0xffe95e);

    for (const gRocket of this.catRocketPool) gRocket.visible = false;

    for (let pi = 0; pi < g.projectiles.length; pi++) {
      const pr = g.projectiles[pi];
      if (!pr.alive || pr.kind === 'ult_r') continue;
      const yaw = Math.atan2(pr.vx, pr.vz);
      if (pr.kind === 'rocket_e') {
        if (catIdx < this.catRocketPool.length) {
          const rg = this.catRocketPool[catIdx++];
          rg.visible = true;
          rg.position.set(pr.x, 0.92, pr.z);
          rg.rotation.set(0, yaw, 0);
        }
      } else if (pr.kind === 'meow' || pr.kind === 'meow_evo') {
        if (mIdx < this.meowInst.instanceMatrix.count) {
          const evo = pr.kind === 'meow_evo';
          D.position.set(pr.x, 0.9, pr.z);
          D.rotation.set(0, yaw, 0);
          D.scale.set(evo ? 1.55 : 0.95, evo ? 1.55 : 0.95, evo ? 1.75 : 1.05);
          D.updateMatrix();
          this.meowInst.setMatrixAt(mIdx, D.matrix);
          this.meowInst.setColorAt(mIdx++, pr.isCrit ? COL_CRIT : evo ? COL_EVO : (pi % 2 === 0 ? COL_CYAN : COL_GOLD));
        }
      } else if (pr.kind === 'uwu') {
        if (uIdx < this.uwuInst.instanceMatrix.count) {
          D.position.set(pr.x, 0.88, pr.z);
          D.rotation.set(0, t * 8 + pi, 0);
          D.scale.setScalar(pr.tier >= 1 ? 1.25 : 0.95);
          D.updateMatrix();
          this.uwuInst.setMatrixAt(uIdx++, D.matrix);
        }
      } else if (pr.kind === 'crossbow') {
        if (cbIdx < this.crossbowInst.instanceMatrix.count) {
          D.position.set(pr.x, 0.9, pr.z);
          D.rotation.set(0, yaw, 0);
          D.scale.set(pr.isCrit ? 1.25 : 1, 1, pr.isCrit ? 1.4 : 1.1);
          D.updateMatrix();
          this.crossbowInst.setMatrixAt(cbIdx, D.matrix);
          this.crossbowInst.setColorAt(cbIdx++, pr.isCrit ? COL_GOLD : COL_CYAN);
        }
      } else if (pr.kind === 'boomerang' || pr.kind === 'boomerang_mini') {
        const isEvo = pr.tier >= 1;
        const inst = isEvo ? this.boomEvoInst : this.boomInst;
        const idx = isEvo ? bmeIdx : bmIdx;
        if (idx < inst.instanceMatrix.count) {
          D.position.set(pr.x, 0.85, pr.z);
          D.rotation.set(0, t * 14 + pi, 0);
          D.scale.setScalar(pr.kind === 'boomerang_mini' ? 0.65 : 1.1);
          D.updateMatrix();
          inst.setMatrixAt(idx, D.matrix);
          if (isEvo) bmeIdx++; else bmIdx++;
        }
      }
    }
    this.meowInst.count = mIdx; this.meowInst.instanceMatrix.needsUpdate = true;
    if (this.meowInst.instanceColor) this.meowInst.instanceColor.needsUpdate = true;
    this.uwuInst.count = uIdx; this.uwuInst.instanceMatrix.needsUpdate = true;
    this.crossbowInst.count = cbIdx; this.crossbowInst.instanceMatrix.needsUpdate = true;
    if (this.crossbowInst.instanceColor) this.crossbowInst.instanceColor.needsUpdate = true;
    this.boomInst.count = bmIdx; this.boomInst.instanceMatrix.needsUpdate = true;
    this.boomEvoInst.count = bmeIdx; this.boomEvoInst.instanceMatrix.needsUpdate = true;

    // 2. 旋风切割器 / 不息气旋官方刀刃
    let oIdx = 0, oeIdx = 0;
    for (const ob of g.orbitals) {
      const inst = ob.evolved ? this.orbitalEvoInst : this.orbitalInst;
      const idx = ob.evolved ? oeIdx : oIdx;
      if (idx >= inst.instanceMatrix.count) continue;
      D.position.set(ob.x, 0.72, ob.z);
      D.rotation.set(0, ob.ang + t * 8, 0);
      D.scale.setScalar(1);
      D.updateMatrix();
      inst.setMatrixAt(idx, D.matrix);
      if (ob.evolved) oeIdx++; else oIdx++;
    }
    this.orbitalInst.count = oIdx; this.orbitalInst.instanceMatrix.needsUpdate = true;
    this.orbitalEvoInst.count = oeIdx; this.orbitalEvoInst.instanceMatrix.needsUpdate = true;

    // 3. 耀光力场官方 3D 火焰网格（带 UV 旋转与进化红金切换）
    const radLv = g.weaponLv('radiant');
    this.hrGroup.visible = radLv > 0;
    if (radLv > 0) {
      const rad = [2.2, 2.6, 2.75, 3.4, 3.8, 3.85][radLv - 1] * g.areaMul;
      const evo = radLv >= 6;
      this.hrGroup.position.set(g.player.x, 0, g.player.z);
      this.hrGroup.scale.setScalar(rad / 102.0);
      this.hrNoiseTex.offset.y = (t * 0.45) % 1;
      if (this.hrOutlineMesh) {
        this.hrOutlineMesh.rotation.y = t * 0.4;
        (this.hrOutlineMesh.material as THREE.MeshBasicMaterial).color.setHex(evo ? 0xff7a38 : 0x55ff70);
      }
      if (this.hrFireMesh) {
        this.hrFireMesh.rotation.y = -t * 0.65;
        (this.hrFireMesh.material as THREE.MeshBasicMaterial).color.setHex(evo ? 0xff3b9a : 0x22cc44);
      }
    }

    // 4. 进化冰盾官方贴图球罩
    this.iceShieldMesh.visible = g.player.shield > 0;
    if (g.player.shield > 0) {
      this.iceShieldMesh.position.set(g.player.x, 0.85, g.player.z);
      this.iceShieldMesh.rotation.y = t * 1.2;
      this.iceShieldMesh.scale.setScalar(1 + Math.sin(t * 7) * 0.04);
    }

    // 5. 斯塔缇克宽幅 3D 闪电光带
    for (const m of this.boltPool) m.visible = false;
    for (let i = 0; i < g.lightningArcs.length && i < this.boltPool.length; i++) {
      const a = g.lightningArcs[i];
      const dx = a.x1 - a.x0, dz = a.z1 - a.z0;
      const dist = Math.hypot(dx, dz) || 0.1;
      const m = this.boltPool[i];
      m.visible = true;
      m.position.set((a.x0 + a.x1) * 0.5, 0.92, (a.z0 + a.z1) * 0.5);
      m.rotation.set(0, Math.atan2(dx, dz), 0);
      m.scale.set(1.1, 1, dist);
      (m.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - a.age / a.life);
    }

    // 6. 战兔巨爆准星 & 雷暴电圈（彻底与地雷橙环分离）
    let stIdx = 0, srIdx = 0;
    for (const z of g.weaponZones) {
      if (z.kind === 'orbital_strike' && !z.resolved && stIdx < this.starTargets.instanceMatrix.count) {
        D.position.set(z.x, 0.06, z.z);
        D.rotation.set(0, t * 2.5, 0);
        D.scale.setScalar(z.r * 0.95);
        D.updateMatrix();
        this.starTargets.setMatrixAt(stIdx++, D.matrix);
      } else if (z.kind === 'storm' && srIdx < this.stormRings.instanceMatrix.count) {
        D.position.set(z.x, 0.06, z.z);
        D.rotation.set(0, -t * 3.0, 0);
        D.scale.setScalar(z.r);
        D.updateMatrix();
        this.stormRings.setMatrixAt(srIdx++, D.matrix);
      }
    }
    this.starTargets.count = stIdx; this.starTargets.instanceMatrix.needsUpdate = true;
    this.stormRings.count = srIdx; this.stormRings.instanceMatrix.needsUpdate = true;

    // 7. 激光柱 & 炸裂寿命更新
    for (const b of this.skyBeams) {
      if (!b.active) continue;
      b.age += dt;
      if (b.age >= b.life) { b.active = false; b.group.visible = false; continue; }
      const k = b.age / b.life;
      const shrink = 1 - k * 0.65;
      b.group.scale.x = shrink * 1.4;
      b.group.scale.z = shrink * 1.4;
      b.group.rotation.y += dt * 4;
    }

    for (const b of this.vfxBursts) {
      if (!b.active) continue;
      b.age += dt;
      if (b.age >= b.life) { b.active = false; b.mesh.visible = false; continue; }
      const k = b.age / b.life;
      const ease = 1 - Math.pow(1 - k, 2);
      b.mesh.scale.setScalar(b.s0 + (b.s1 - b.s0) * ease);
      (b.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - k) * b.maxOp;
    }
  }
}

```

---

## File: `src/render/entities.ts`

```ts
import * as THREE from 'three';
import { BUDGET, ENEMY_SCALES, XP } from '../config';
import type { Enemy, Game } from '../sim/game';
import { getTexture, loadGLB } from './assets';
import { RekSaiRig } from './boss_reksai';
import { EliteBruiserPool, InstancedEnemyModel } from './enemy_models';
import { type HeroRig, JinxRig } from './hero_jinx';
import { JinxVfxSystem } from './jinx_vfx';
import { WeaponVfxRenderer } from './weapon_vfx';
import { blobShadowTex, merge, OUTLINE_MAT, paint, place, toon } from './style';

const D = new THREE.Object3D();
const WHITE = new THREE.Color(1, 1, 1);
const FLASH = new THREE.Color(2.6, 2.6, 2.6);
const BIND = new THREE.Color(0.75, 1.7, 1.9);

/** 实例化网格 + 同步描边层 */
class InstGroup {
  body: THREE.InstancedMesh;
  outline: THREE.InstancedMesh;
  n = 0;
  constructor(root: THREE.Group, geo: THREE.BufferGeometry, mat: THREE.Material, cap: number, outlineScale = 1.07, cast = true) {
    this.body = new THREE.InstancedMesh(geo, mat, cap);
    this.outline = new THREE.InstancedMesh(geo, OUTLINE_MAT, cap);
    for (const m of [this.body, this.outline]) {
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      m.frustumCulled = false;
      m.count = 0;
      root.add(m);
    }
    this.body.castShadow = cast;
    this.body.setColorAt(0, WHITE);
    this.os = outlineScale;
  }
  private os: number;
  private tmp = new THREE.Matrix4();
  private sm = new THREE.Matrix4();
  begin() { this.n = 0; }
  push(m: THREE.Matrix4, color: THREE.Color) {
    const i = this.n++;
    this.body.setMatrixAt(i, m);
    this.body.setColorAt(i, color);
    this.sm.makeScale(this.os, this.os, this.os);
    this.tmp.multiplyMatrices(m, this.sm);
    this.outline.setMatrixAt(i, this.tmp);
  }
  end() {
    this.body.count = this.n;
    this.outline.count = this.n;
    this.body.instanceMatrix.needsUpdate = true;
    this.outline.instanceMatrix.needsUpdate = true;
    if (this.body.instanceColor) this.body.instanceColor.needsUpdate = true;
  }
}

/** 简单实例化（无描边） */
function mkInst(root: THREE.Group, geo: THREE.BufferGeometry, mat: THREE.Material, cap: number) {
  const m = new THREE.InstancedMesh(geo, mat, cap);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.frustumCulled = false;
  m.count = 0;
  root.add(m);
  return m;
}

// ───────────────────────── 拾取物与地雷几何 ─────────────────────────

/** 经验晶片：上下双锥 */
function shardGeo() {
  const g = new THREE.OctahedronGeometry(0.24, 0);
  g.scale(0.85, 1.25, 0.85);
  return g;
}

/** 维修包：白箱 + 绿十字 */
function kitGeo() {
  return merge([
    paint(new THREE.BoxGeometry(0.62, 0.42, 0.62), 0xf8fafb),
    paint(place(new THREE.BoxGeometry(0.42, 0.06, 0.14), 0, 0.23, 0), 0x2fd06a),
    paint(place(new THREE.BoxGeometry(0.14, 0.06, 0.42), 0, 0.23, 0), 0x2fd06a),
  ]);
}

/** 磁索地雷 */
function mineGeo() {
  return merge([
    paint(new THREE.CylinderGeometry(0.42, 0.5, 0.18, 12), 0x2b3640),
    paint(place(new THREE.TorusGeometry(0.4, 0.06, 6, 16), 0, 0.12, 0, Math.PI / 2), 0xf2c230),
    paint(place(new THREE.CylinderGeometry(0.14, 0.14, 0.16, 10), 0, 0.17, 0), 0xffffff),
  ]);
}

// ───────────────────────── 渲染器 ─────────────────────────

export class EntityRenderer {
  private root = new THREE.Group();

  // 玩家角色 & 首领
  private heroRig: HeroRig;
  private reksaiRig: RekSaiRig;
  private elitePool: EliteBruiserPool;
  private eliteBuf: Enemy[] = [];

  // 原版小怪合批
  private pixPool: InstancedEnemyModel;
  private ghoulPool: InstancedEnemyModel;
  private hunterPool: InstancedEnemyModel;
  private dasherPool: InstancedEnemyModel;
  private shadows: THREE.InstancedMesh;

  readonly weaponVfx: WeaponVfxRenderer;
  private ultRocket: THREE.Group | null = null;

  private eBullets: THREE.InstancedMesh;
  private eHalos: THREE.InstancedMesh;

  private shards: InstGroup;
  private kits: InstGroup;
  private mines: InstGroup;
  private mineFields: THREE.InstancedMesh;
  private mineFieldMat: THREE.MeshBasicMaterial;
  private cardGroup: THREE.InstancedMesh;
  private cardBeacons: THREE.InstancedMesh;
  private boxInst: THREE.InstancedMesh | null = null;
  private boxGlow: THREE.InstancedMesh;
  private boxBeacon: THREE.InstancedMesh;

  constructor(scene: THREE.Scene) {
    scene.add(this.root);
    const shadowMat = new THREE.MeshBasicMaterial({ map: blobShadowTex(), transparent: true, depthWrite: false });
    const shadowGeo = new THREE.PlaneGeometry(1.6, 1.6);
    shadowGeo.rotateX(-Math.PI / 2);

    // ═════════ 玩家角色（金克丝原版模型） & 最终首领（雷克塞） ═════════
    this.heroRig = new JinxRig(this.root);
    this.reksaiRig = new RekSaiRig(this.root, true);
    this.elitePool = new EliteBruiserPool(this.root, 6, true);

    // ═════════ 原版 3D 小怪合批 ═════════
    const N = BUDGET.maxEnemies;
    this.pixPool = new InstancedEnemyModel(this.root, './assets/enemies/enemy_pix.glb', './assets/enemies/enemy_pix.webp', N);
    this.ghoulPool = new InstancedEnemyModel(this.root, './assets/enemies/enemy_ghoul.glb', './assets/enemies/enemy_ghoul.webp', N);
    this.hunterPool = new InstancedEnemyModel(this.root, './assets/enemies/enemy_hunter.glb', './assets/enemies/enemy_hunter.webp', N, true);
    this.dasherPool = new InstancedEnemyModel(this.root, './assets/enemies/enemy_dasher.glb', './assets/enemies/enemy_dasher.webp', N, true);
    this.shadows = mkInst(this.root, shadowGeo, shadowMat, N + XP.maxShards + 32);
    this.shadows.renderOrder = 1;

    // ═════════ 官方 10 武器 VFX 渲染器 ═════════
    this.weaponVfx = new WeaponVfxRenderer(this.root);

    // ═════════ 敌弹：玫红芯 + 深紫外环，最高渲染优先级 ═════════
    const B2 = BUDGET.maxEnemyBullets;
    this.eHalos = mkInst(this.root, new THREE.SphereGeometry(0.4, 12, 8), new THREE.MeshBasicMaterial({ color: 0x3d0a4f, depthTest: false }), B2);
    this.eBullets = mkInst(this.root, new THREE.SphereGeometry(0.25, 12, 8), new THREE.MeshBasicMaterial({ color: 0xff2e8e, depthTest: false }), B2);
    this.eHalos.renderOrder = 30;
    this.eBullets.renderOrder = 31;

    // ═════════ 拾取物与地雷 ═════════
    this.shards = new InstGroup(this.root, shardGeo(), new THREE.MeshBasicMaterial({ color: 0xc4ff3a }), 260, 1.35, false);
    this.shards.outline.material = new THREE.MeshBasicMaterial({ color: 0x1d4a12, side: THREE.BackSide });
    this.kits = new InstGroup(this.root, kitGeo(), toon(0xffffff, { vertexColors: true }), 24, 1.12);
    this.mines = new InstGroup(this.root, mineGeo(), toon(0xffffff, { vertexColors: true }), 24, 1.1);
    const mfGeo = new THREE.RingGeometry(0.86, 1.0, 40); mfGeo.rotateX(-Math.PI / 2);
    this.mineFieldMat = new THREE.MeshBasicMaterial({ color: 0xff9b35, transparent: true, opacity: 0.55, depthWrite: false });
    this.mineFields = mkInst(this.root, mfGeo, this.mineFieldMat, 32);
    this.mineFields.renderOrder = 5;

    // 精英访问卡（金色旋转卡牌 + 光柱）
    const cGeo = new THREE.BoxGeometry(0.55, 0.78, 0.08);
    this.cardGroup = mkInst(this.root, cGeo, new THREE.MeshBasicMaterial({ color: 0xffd54a }), 12);
    this.cardGroup.renderOrder = 10;
    const cbGeo = new THREE.CylinderGeometry(0.28, 0.42, 4.2, 12, 1, true);
    cbGeo.translate(0, 2.1, 0);
    this.cardBeacons = mkInst(
      this.root, cbGeo,
      new THREE.MeshBasicMaterial({ color: 0xffe066, transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }),
      12,
    );
    this.cardBeacons.renderOrder = 7;

    // ═════════ 66 个原版可破坏金属补给箱 ═════════
    const bgTex = getTexture('./assets/map1/vfx/box_glow.webp');

    const bgGeo = new THREE.PlaneGeometry(2.3, 2.3);
    bgGeo.rotateX(-Math.PI / 2);
    this.boxGlow = mkInst(
      this.root,
      bgGeo,
      new THREE.MeshBasicMaterial({
        map: bgTex,
        color: 0x3ef2ff,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
      72,
    );
    this.boxGlow.renderOrder = 3;

    // 原版 Temp_GroundGlow15 竖直蓝青光束信标
    const b1 = new THREE.PlaneGeometry(0.95, 3.8);
    b1.translate(0, 1.9, 0);
    const b2 = b1.clone().rotateY(Math.PI / 2);
    const beaconGeo = new THREE.BufferGeometry();
    const bpA = b1.attributes.position.array as Float32Array;
    const bpB = b2.attributes.position.array as Float32Array;
    const buA = b1.attributes.uv.array as Float32Array;
    const buB = b2.attributes.uv.array as Float32Array;
    const bPos = new Float32Array(bpA.length + bpB.length);
    bPos.set(bpA, 0); bPos.set(bpB, bpA.length);
    const bUv = new Float32Array(buA.length + buB.length);
    bUv.set(buA, 0); bUv.set(buB, buA.length);
    beaconGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
    beaconGeo.setAttribute('uv', new THREE.BufferAttribute(bUv, 2));
    beaconGeo.setIndex([...Array.from(b1.index!.array), ...Array.from(b2.index!.array).map((v) => v + 4)]);
    this.boxBeacon = mkInst(
      this.root,
      beaconGeo,
      new THREE.MeshBasicMaterial({
        map: bgTex,
        color: 0x5990ff,
        transparent: true,
        opacity: 0.34,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
      72,
    );
    this.boxBeacon.renderOrder = 6;

    const boxTex = getTexture('./assets/map1/props/metalbox.webp', { flipY: false });
    const boxMat = new THREE.MeshStandardMaterial({
      map: boxTex,
      roughness: 0.58,
      metalness: 0.34,
      side: THREE.DoubleSide,
    });
    loadGLB('./assets/map1/props/metalbox.glb').then((gltf) => {
      let boxGeo: THREE.BufferGeometry | null = null;
      gltf.scene.traverse((o) => {
        if (!boxGeo && o instanceof THREE.Mesh && o.geometry) {
          boxGeo = o.geometry.clone();
        }
      });
      if (!boxGeo) return;
      const g0 = boxGeo as THREE.BufferGeometry;
      g0.computeBoundingBox();
      const minY = g0.boundingBox ? g0.boundingBox.min.y : 0;
      g0.translate(0, -minY, 0);
      g0.scale(0.0058, 0.0058, 0.0058);

      const im = new THREE.InstancedMesh(g0, boxMat, 72);
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      im.frustumCulled = false;
      im.castShadow = true;
      im.receiveShadow = true;
      im.count = 0;
      im.setColorAt(0, WHITE);
      this.root.add(im);
      this.boxInst = im;
    });
  }

  attachJinxVfx(jinxVfx: JinxVfxSystem) {
    this.ultRocket = jinxVfx.rocketGroup;
  }

  loadStage2() {
    this.hunterPool.ensureLoaded();
    this.dasherPool.ensureLoaded();
    this.elitePool.ensureLoaded();
    this.reksaiRig.ensureLoaded();
  }

  heroReady(): Promise<void> {
    return this.heroRig instanceof JinxRig ? this.heroRig.ready : Promise.resolve();
  }

  update(g: Game, dt = 1 / 60) {
    const t = g.clock;

    // ═════════ 玩家角色 ═════════
    this.heroRig.update(g, dt);

    // ═════════ 原版 3D 敌人 & 精英 ═════════
    this.pixPool.begin();
    this.ghoulPool.begin();
    this.hunterPool.begin();
    this.dasherPool.begin();
    this.eliteBuf.length = 0;

    let shi = 0;
    for (const e of g.enemies) {
      if (!e.alive || e.kind === 'boss') continue;
      if (e.kind === 'elite') {
        this.eliteBuf.push(e);
        continue;
      }

      const emerge = Math.min(1, e.age / 0.35);
      D.position.set(e.x, 0.015, e.z);
      D.rotation.set(0, 0, 0);
      D.scale.setScalar((e.r / 0.55) * 1.15 * emerge);
      D.updateMatrix();
      if (shi < this.shadows.instanceMatrix.count) this.shadows.setMatrixAt(shi++, D.matrix);

      const col = e.flash > 0.25 ? FLASH : e.bindT > 0 ? BIND : WHITE;
      if (e.kind === 'crawler') {
        const isPix = e.variant === 'pix';
        const baseScale = isPix ? ENEMY_SCALES.pix : ENEMY_SCALES.ghoul;
        const bob = isPix ? 0.35 + Math.sin(t * 7 + e.id) * 0.08 : Math.abs(Math.sin(t * 14 + e.id)) * 0.04;
        const wob = Math.sin(t * 14 + e.id) * 0.06;
        D.position.set(e.x, bob, e.z);
        D.rotation.set(0, e.face, wob);
        D.scale.setScalar(baseScale * emerge);
        D.updateMatrix();
        if (isPix) this.pixPool.push(D.matrix, col);
        else this.ghoulPool.push(D.matrix, col);
      } else if (e.kind === 'spitter') {
        const wind = e.state === 'windup';
        D.position.set(e.x, Math.sin(t * 6 + e.id) * 0.03, e.z);
        D.rotation.set(wind ? -0.18 : 0, e.face, 0);
        D.scale.setScalar(ENEMY_SCALES.hunter * emerge);
        D.updateMatrix();
        this.hunterPool.push(D.matrix, col);
      } else {
        const wind = e.state === 'windup';
        const dash = e.state === 'dash';
        D.position.set(e.x, 0.04 + Math.sin(t * 10 + e.id) * 0.03, e.z);
        D.rotation.set(wind ? 0.38 : dash ? 0.24 : Math.sin(t * 8 + e.id) * 0.04, e.face, wind ? Math.sin(t * 36) * 0.05 : 0);
        const s = ENEMY_SCALES.dasher * emerge;
        D.scale.set(s, s * (wind ? 0.88 : 1), s);
        D.updateMatrix();
        this.dasherPool.push(D.matrix, col);
      }
    }
    this.pixPool.end();
    this.ghoulPool.end();
    this.hunterPool.end();
    this.dasherPool.end();
    this.elitePool.update(this.eliteBuf, dt);

    // ═════════ 最终首领：雷克塞 ═════════
    this.reksaiRig.update(g, dt);

    // ═════════ 官方武器投射物与场内特效 + R 超究极死神飞弹 ═════════
    this.weaponVfx.update(g, dt);
    if (this.ultRocket) this.ultRocket.visible = false;
    for (const pr of g.projectiles) {
      if (!pr.alive || pr.kind !== 'ult_r') continue;
      if (this.ultRocket) {
        this.ultRocket.visible = true;
        this.ultRocket.position.set(pr.x, 1.05, pr.z);
        this.ultRocket.rotation.y = Math.atan2(pr.vx, pr.vz);
      }
    }

    // ═════════ 敌弹 ═════════
    let ei = 0;
    const pulse = 1 + Math.sin(t * 14) * 0.08;
    for (const eb of g.enemyBullets) {
      if (!eb.alive) continue;
      D.position.set(eb.x, 0.85, eb.z);
      D.rotation.set(0, 0, 0);
      D.scale.setScalar((eb.r / 0.26) * pulse);
      D.updateMatrix();
      this.eHalos.setMatrixAt(ei, D.matrix);
      D.scale.setScalar(eb.r / 0.26);
      D.updateMatrix();
      this.eBullets.setMatrixAt(ei++, D.matrix);
    }
    this.eBullets.count = ei; this.eHalos.count = ei;
    this.eBullets.instanceMatrix.needsUpdate = true; this.eHalos.instanceMatrix.needsUpdate = true;

    // ═════════ 经验晶片 / 维修包 ═════════
    this.shards.begin();
    for (const s of g.shards) {
      if (!s.alive) continue;
      D.position.set(s.x, 0.42 + Math.sin(t * 4 + s.x * 2) * 0.1, s.z);
      D.rotation.set(0, t * 2.4 + s.z, 0);
      D.scale.setScalar(s.value >= 4 ? 1.6 : s.value >= 2 ? 1.25 : 1);
      D.updateMatrix();
      this.shards.push(D.matrix, WHITE);
      D.position.y = 0.015;
      D.scale.setScalar(0.32 * (s.value >= 2 ? 1.3 : 1));
      D.updateMatrix();
      if (shi < this.shadows.instanceMatrix.count) this.shadows.setMatrixAt(shi++, D.matrix);
    }
    this.shards.end();
    this.kits.begin();
    for (const k of g.pickups) {
      if (!k.alive) continue;
      D.position.set(k.x, 0.4 + Math.sin(t * 3) * 0.1, k.z);
      D.rotation.set(0, t * 1.6, 0);
      D.scale.setScalar(k.heal >= 25 ? 1.35 : 1);
      D.updateMatrix();
      this.kits.push(D.matrix, WHITE);
    }
    this.kits.end();
    this.shadows.count = Math.min(shi, this.shadows.instanceMatrix.count);
    this.shadows.instanceMatrix.needsUpdate = true;

    // ═════════ 幻灵地雷（仅地雷类显示橙色倒计时圈）& 精英访问卡 ═════════
    this.mines.begin();
    let fi = 0;
    for (const z of g.weaponZones) {
      if (z.kind !== 'mine' && z.kind !== 'mine_sub') continue;
      D.position.set(z.x, 0.09, z.z);
      D.rotation.set(0, t * 2.4, 0);
      D.scale.setScalar(z.kind === 'mine_sub' ? 0.72 : 1);
      D.updateMatrix();
      this.mines.push(D.matrix, Math.sin(t * 18) > 0 ? BIND : WHITE);
      if (fi < this.mineFields.instanceMatrix.count) {
        D.position.set(z.x, 0.05, z.z);
        D.rotation.set(0, t * 1.1, 0);
        D.scale.setScalar(z.r);
        D.updateMatrix();
        this.mineFields.setMatrixAt(fi++, D.matrix);
      }
    }
    this.mines.end();
    this.mineFields.count = fi;
    this.mineFields.instanceMatrix.needsUpdate = true;

    let aci = 0;
    for (const c of g.accessCards) {
      if (!c.alive || aci >= this.cardGroup.instanceMatrix.count) continue;
      D.position.set(c.x, 0.85 + Math.sin(t * 4 + c.x) * 0.15, c.z);
      D.rotation.set(0.2, t * 2.8, 0);
      D.scale.setScalar(1);
      D.updateMatrix();
      this.cardGroup.setMatrixAt(aci, D.matrix);
      D.position.set(c.x, 0, c.z);
      D.rotation.set(0, 0, 0);
      D.scale.setScalar(1);
      D.updateMatrix();
      this.cardBeacons.setMatrixAt(aci++, D.matrix);
    }
    this.cardGroup.count = aci;
    this.cardBeacons.count = aci;
    this.cardGroup.instanceMatrix.needsUpdate = true;
    this.cardBeacons.instanceMatrix.needsUpdate = true;

    // ═════════ 原版金属补给箱 ═════════
    let bgi = 0;
    let bi = 0;
    for (const b of g.boxes) {
      if (!b.alive) continue;
      const sc = b.flash > 0 ? 1 + b.flash * 0.08 : 1;
      D.position.set(b.x, 0.04, b.z);
      D.rotation.set(0, 0, 0);
      D.scale.setScalar(0.95 + Math.sin(t * 3.5 + b.id) * 0.06);
      D.updateMatrix();
      if (bgi < this.boxGlow.instanceMatrix.count) {
        this.boxGlow.setMatrixAt(bgi, D.matrix);
        D.position.set(b.x, 0.25, b.z);
        D.scale.set(1, 0.92 + Math.sin(t * 2.8 + b.id) * 0.1, 1);
        D.updateMatrix();
        this.boxBeacon.setMatrixAt(bgi, D.matrix);
        bgi++;
      }

      if (this.boxInst && bi < this.boxInst.instanceMatrix.count) {
        D.position.set(b.x, 0, b.z);
        D.rotation.set(0, b.rotY, 0);
        D.scale.set(sc, b.flash > 0 ? 1 - b.flash * 0.08 : 1, sc);
        D.updateMatrix();
        this.boxInst.setMatrixAt(bi, D.matrix);
        this.boxInst.setColorAt(bi, b.flash > 0.2 ? FLASH : WHITE);
        bi++;
      }
    }
    this.boxGlow.count = bgi;
    this.boxGlow.instanceMatrix.needsUpdate = true;
    this.boxBeacon.count = bgi;
    this.boxBeacon.instanceMatrix.needsUpdate = true;
    if (this.boxInst) {
      this.boxInst.count = bi;
      this.boxInst.instanceMatrix.needsUpdate = true;
      if (this.boxInst.instanceColor) this.boxInst.instanceColor.needsUpdate = true;
    }
  }
}

```

---

## File: `src/render/vfx.ts`

```ts
import * as THREE from 'three';
import type { Game, Hazard } from '../sim/game';
import { JinxVfxSystem } from './jinx_vfx';
import { softDot } from './style';
import type { WeaponVfxRenderer } from './weapon_vfx';

interface Ring {
  mesh: THREE.Mesh;
  age: number;
  life: number;
  maxR: number;
  active: boolean;
}

interface Particle {
  active: boolean;
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  age: number; life: number;
  r: number; g: number; b: number;
}

/**
 * 特效与危险区渲染：
 * - 地面危险区与逻辑共用同一套 Hazard 数据，玫红实线边框 + 半透明填充
 * - 敌方预警渲染优先级高于友方爆炸
 * - 粒子使用对象池 + 单个 Points，受画质预算限制
 */
export class VfxRenderer {
  private root = new THREE.Group();
  private hazardGroup = new THREE.Group();
  private hazardPool: { fill: THREE.Mesh; line: THREE.Line }[] = [];
  private rings: Ring[] = [];

  private maxP = 800;
  private particles: Particle[] = [];
  private pGeo: THREE.BufferGeometry;
  private pPos: Float32Array;
  private pCol: Float32Array;
  private pPoints: THREE.Points;

  readonly jinxVfx: JinxVfxSystem;
  private weaponVfx: WeaponVfxRenderer | null = null;

  shake = 0;
  reduceFlash = false;
  noShake = false;

  constructor(scene: THREE.Scene) {
    scene.add(this.root);
    this.hazardGroup.renderOrder = 12;
    this.root.add(this.hazardGroup);

    // 预分配冲击波环池
    const ringGeo = new THREE.RingGeometry(0.75, 1.0, 28);
    ringGeo.rotateX(-Math.PI / 2);
    for (let i = 0; i < 24; i++) {
      const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({
        color: 0xffa630, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false,
      }));
      m.visible = false;
      m.renderOrder = 8;
      this.root.add(m);
      this.rings.push({ mesh: m, age: 0, life: 0.3, maxR: 2, active: false });
    }

    // 粒子池
    this.pPos = new Float32Array(this.maxP * 3);
    this.pCol = new Float32Array(this.maxP * 3);
    this.pGeo = new THREE.BufferGeometry();
    this.pGeo.setAttribute('position', new THREE.BufferAttribute(this.pPos, 3));
    this.pGeo.setAttribute('color', new THREE.BufferAttribute(this.pCol, 3));
    this.pPoints = new THREE.Points(this.pGeo, new THREE.PointsMaterial({
      size: 0.52, map: softDot(), alphaTest: 0.02, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false,
    }));
    this.pPoints.frustumCulled = false;
    this.pPoints.renderOrder = 10;
    this.root.add(this.pPoints);
    for (let i = 0; i < this.maxP; i++) {
      this.particles.push({ active: false, x: 0, y: -50, z: 0, vx: 0, vy: 0, vz: 0, age: 0, life: 1, r: 1, g: 1, b: 1 });
    }

    // 金克丝官方 VFX 系统
    this.jinxVfx = new JinxVfxSystem(this.root);
  }

  attachWeaponVfx(w: WeaponVfxRenderer) {
    this.weaponVfx = w;
  }

  private spawnRing(x: number, z: number, maxR: number, life: number, hex: number) {
    const r = this.rings.find((v) => !v.active);
    if (!r) return;
    r.active = true; r.age = 0; r.life = life; r.maxR = maxR;
    r.mesh.visible = true;
    r.mesh.position.set(x, 0.08, z);
    r.mesh.scale.setScalar(0.2);
    (r.mesh.material as THREE.MeshBasicMaterial).color.setHex(hex);
  }

  private spawnParticles(x: number, y: number, z: number, count: number, speed: number, life: number, hex: number) {
    const c = new THREE.Color(hex);
    let spawned = 0;
    for (let i = 0; i < this.maxP && spawned < count; i++) {
      const p = this.particles[i];
      if (p.active) continue;
      p.active = true;
      p.x = x; p.y = y; p.z = z;
      const a = Math.random() * Math.PI * 2;
      const sp = speed * (0.4 + Math.random() * 0.8);
      p.vx = Math.cos(a) * sp;
      p.vy = 1.5 + Math.random() * speed * 0.6;
      p.vz = Math.sin(a) * sp;
      p.age = 0; p.life = life * (0.7 + Math.random() * 0.6);
      p.r = c.r; p.g = c.g; p.b = c.b;
      spawned++;
    }
  }

  private addShake(amount: number) {
    if (!this.noShake) this.shake = Math.min(0.6, Math.max(this.shake, amount));
  }

  consumeEvents(g: Game, fxScale: number, budget: number) {
    const qScale = this.reduceFlash ? fxScale * 0.45 : fxScale;
    const count = (n: number) => Math.max(1, Math.round(n * qScale));
    for (const ev of g.events) {
      if (ev.type === 'shoot') {
        this.jinxVfx.triggerMuzzle(ev.x, ev.z, ev.ang, ev.weapon, ev.ownerId ?? 0);
        if (ev.weapon === 'cn') this.addShake(0.1);
        if (ev.weapon === 'ult') this.addShake(0.28);
      } else if (ev.type === 'hit') {
        const hex = ev.crit ? 0xffe45e : ev.kind === 'meow_evo' ? 0xff6ee6 : ev.kind === 'statikk' ? 0x92fbff : 0x8ef9ff;
        this.spawnParticles(ev.x, 0.65, ev.z, count(ev.crit ? 7 : 4), 4.5, 0.22, hex);
        if (ev.kind === 'meow' || ev.kind === 'meow_evo' || ev.kind === 'uwu' || ev.kind === 'crossbow') {
          this.jinxVfx.spawnGunHit(ev.x, ev.z, !!ev.crit, ev.kind === 'meow_evo');
        }
      } else if (ev.type === 'explode') {
        if (ev.kind === 'ult' || ev.kind === 'ult_r') {
          this.jinxVfx.spawnUltDome(ev.x, ev.z, ev.r);
          this.spawnRing(ev.x, ev.z, ev.r, 0.45, 0xb8feff);
          this.spawnRing(ev.x, ev.z, ev.r * 0.65, 0.28, 0xff62d4);
          this.spawnParticles(ev.x, 0.7, ev.z, count(44), 11, 0.55, 0x62f5ff);
          this.spawnParticles(ev.x, 0.5, ev.z, count(26), 5.5, 0.85, 0xff80e0);
          this.addShake(0.48);
        } else if (ev.kind === 'rocket_e') {
          this.jinxVfx.spawnRocketEBlast(ev.x, ev.z, ev.r);
          this.spawnRing(ev.x, ev.z, ev.r, 0.26, 0xff9e2c);
          this.spawnParticles(ev.x, 0.5, ev.z, count(14), 6.5, 0.3, 0xffae3d);
          this.addShake(0.14);
        } else if (ev.kind === 'iceblast') {
          this.weaponVfx?.spawnIceBlast(ev.x, ev.z, ev.r);
          this.spawnRing(ev.x, ev.z, ev.r, 0.45, 0x8ef9ff);
          this.spawnParticles(ev.x, 0.6, ev.z, count(28), 9, 0.5, 0xa8fcff);
          this.addShake(0.2);
        } else if (ev.kind === 'orbital') {
          this.weaponVfx?.spawnOrbitalBeam(ev.x, ev.z, ev.r);
          this.spawnRing(ev.x, ev.z, ev.r, 0.32, 0x8ef9ff);
          this.spawnParticles(ev.x, 0.7, ev.z, count(20), 8, 0.36, 0xffe46b);
          this.addShake(0.18);
        } else if (ev.kind === 'radiant') {
          this.spawnRing(ev.x, ev.z, ev.r, 0.26, 0xff5a22);
          this.spawnParticles(ev.x, 0.5, ev.z, count(14), 6, 0.3, 0xff8c38);
        } else if (ev.kind === 'mine') {
          this.spawnRing(ev.x, ev.z, ev.r, 0.32, 0xff8c3a);
          this.spawnParticles(ev.x, 0.4, ev.z, count(14), 6, 0.32, 0xffaa44);
          this.addShake(0.14);
        } else {
          this.spawnRing(ev.x, ev.z, ev.r, 0.26, 0xff9e2c);
          this.spawnParticles(ev.x, 0.5, ev.z, count(14), 6.5, 0.3, 0xffae3d);
          this.addShake(0.15);
        }
      } else if (ev.type === 'kill') {
        this.spawnParticles(ev.x, 0.45, ev.z, count(ev.kind === 'elite' ? 24 : 7), 4.5, 0.35, 0x3a6f74);
      } else if (ev.type === 'dash') {
        this.spawnParticles(ev.x, 0.5, ev.z, count(10), 4, 0.28, 0x4df5ff);
      } else if (ev.type === 'overload' && ev.on) {
        this.spawnRing(g.player.x, g.player.z, 2.5, 0.35, 0x48f7ff);
      } else if (ev.type === 'bossLand') {
        this.spawnRing(ev.x, ev.z, 6.5, 0.5, 0xff2e88);
        this.spawnParticles(ev.x, 0.5, ev.z, count(30), 9, 0.6, 0xdbe5ec);
        this.addShake(0.48);
      } else if (ev.type === 'hazardHit') {
        this.spawnRing(ev.x, ev.z, ev.kind === 'circle' ? 2.5 : 4, 0.25, 0xff2b85);
        this.addShake(0.22);
      } else if (ev.type === 'bossPhase') {
        if (g.boss) this.spawnRing(g.boss.x, g.boss.z, 8, 0.6, 0xff3b9a);
        this.addShake(0.4);
      } else if (ev.type === 'bossDead') {
        this.spawnRing(ev.x, ev.z, 10, 0.8, 0x62f8ff);
        this.spawnParticles(ev.x, 1.2, ev.z, count(60), 12, 1.0, 0xffb338);
        this.addShake(0.55);
      } else if (ev.type === 'playerHurt') {
        this.addShake(0.26);
      } else if (ev.type === 'fountainHeal') {
        this.spawnRing(ev.x, ev.z, 12.5, 0.65, 0x2ef89a);
        this.spawnRing(ev.x, ev.z, 9.0, 0.45, 0xffd452);
        this.spawnParticles(ev.x, 1.0, ev.z, count(32), 8.5, 0.85, 0x33ff85);
        this.spawnParticles(ev.x, 1.2, ev.z, count(20), 7.5, 0.9, 0xffc845);
        this.addShake(0.16);
      } else if (ev.type === 'boxBreak') {
        this.spawnRing(ev.x, ev.z, 1.8, 0.28, 0x95b5ff);
        this.spawnRing(ev.x, ev.z, 1.2, 0.18, 0x9eff40);
        this.spawnParticles(ev.x, 0.55, ev.z, count(20), 6.2, 0.42, 0x8c9ad6);
        this.spawnParticles(ev.x, 0.45, ev.z, count(8), 2.5, 0.55, 0x555c66);
      }
    }
    this.maxActiveBudget = budget;
  }
  private maxActiveBudget = 420;

  update(dt: number, g: Game) {
    this.shake = Math.max(0, this.shake - dt * 1.8);

    // 冲击波环
    for (const r of this.rings) {
      if (!r.active) continue;
      r.age += dt;
      if (r.age >= r.life) { r.active = false; r.mesh.visible = false; continue; }
      const k = r.age / r.life;
      r.mesh.scale.setScalar(0.2 + (r.maxR - 0.2) * (1 - Math.pow(1 - k, 2)));
      (r.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - k) * (this.reduceFlash ? 0.55 : 0.9);
    }

    // 粒子
    let activeCount = 0;
    for (let i = 0; i < this.maxP; i++) {
      const p = this.particles[i];
      if (!p.active || activeCount >= this.maxActiveBudget) {
        if (p.active && activeCount >= this.maxActiveBudget) p.active = false;
        this.pPos[i * 3 + 1] = -99;
        continue;
      }
      p.age += dt;
      if (p.age >= p.life) { p.active = false; this.pPos[i * 3 + 1] = -99; continue; }
      p.vy -= 12 * dt;
      p.x += p.vx * dt; p.y = Math.max(0.05, p.y + p.vy * dt); p.z += p.vz * dt;
      const fade = 1 - p.age / p.life;
      this.pPos[i * 3] = p.x; this.pPos[i * 3 + 1] = p.y; this.pPos[i * 3 + 2] = p.z;
      this.pCol[i * 3] = p.r * fade; this.pCol[i * 3 + 1] = p.g * fade; this.pCol[i * 3 + 2] = p.b * fade;
      activeCount++;
    }
    this.pGeo.attributes.position.needsUpdate = true;
    this.pGeo.attributes.color.needsUpdate = true;

    this.jinxVfx.update(dt, g.clock, g.player.x, g.player.z, g.player.overloadT > 0, this.reduceFlash);

    this.drawHazards(g);
  }

  private drawHazards(g: Game) {
    // 清理上一帧几何，仅在有危险区时绘制（通常 <= 6 个，开销极微）
    while (this.hazardPool.length < g.hazards.length) {
      const fill = new THREE.Mesh(
        new THREE.BufferGeometry(),
        new THREE.MeshBasicMaterial({ color: 0xff2b88, transparent: true, opacity: 0.24, side: THREE.DoubleSide, depthWrite: false }),
      );
      const line = new THREE.Line(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial({ color: 0xff1c74, linewidth: 2 }),
      );
      fill.renderOrder = 12; line.renderOrder = 13;
      this.hazardGroup.add(fill, line);
      this.hazardPool.push({ fill, line });
    }
    for (let i = 0; i < this.hazardPool.length; i++) {
      const slot = this.hazardPool[i];
      if (i >= g.hazards.length) { slot.fill.visible = false; slot.line.visible = false; continue; }
      const h = g.hazards[i];
      slot.fill.visible = true; slot.line.visible = true;
      const prog = Math.min(1, Math.max(0, (g.time - h.t0) / Math.max(0.01, h.t1 - h.t0)));
      const mat = slot.fill.material as THREE.MeshBasicMaterial;
      mat.opacity = h.resolved ? 0.55 : 0.16 + prog * 0.28;
      this.buildHazardGeo(h, prog, slot.fill, slot.line);
    }
  }

  private buildHazardGeo(h: Hazard, prog: number, fill: THREE.Mesh, line: THREE.Line) {
    fill.geometry.dispose(); line.geometry.dispose();
    if (h.kind === 'circle') {
      const isRingWarn = h.dmg === 0 && h.arc > 0; // 潮门缺口示意
      if (isRingWarn) {
        const geo = new THREE.RingGeometry(h.r, h.r + 0.55, 28, 1, -h.ang + h.arc / 2, Math.PI * 2 - h.arc);
        geo.rotateX(-Math.PI / 2);
        fill.geometry = geo;
        fill.position.set(h.x, 0.06, h.z);
        line.visible = false;
        return;
      }
      const r = h.r;
      const fg = new THREE.CircleGeometry(r * Math.max(0.15, prog), 28);
      fg.rotateX(-Math.PI / 2);
      fill.geometry = fg;
      fill.position.set(h.x, 0.055, h.z);
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 28; k++) {
        const a = (k / 28) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * r, 0.065, Math.sin(a) * r));
      }
      line.geometry = new THREE.BufferGeometry().setFromPoints(pts);
      line.position.set(h.x, 0, h.z);
    } else if (h.kind === 'sector') {
      // Three.js CircleGeometry 在 XY 平面从 +X 逆时针；rotateX(-PI/2) 后 +Y 变成 -Z，注意角度符号
      const start = -h.ang - h.arc / 2;
      const fg = new THREE.CircleGeometry(h.r * Math.max(0.2, prog), 24, start, h.arc);
      fg.rotateX(-Math.PI / 2);
      fill.geometry = fg;
      fill.position.set(h.x, 0.055, h.z);
      const pts: THREE.Vector3[] = [new THREE.Vector3(0, 0.065, 0)];
      for (let k = 0; k <= 24; k++) {
        const a = h.ang - h.arc / 2 + (k / 24) * h.arc;
        pts.push(new THREE.Vector3(Math.cos(a) * h.r, 0.065, Math.sin(a) * h.r));
      }
      pts.push(new THREE.Vector3(0, 0.065, 0));
      line.geometry = new THREE.BufferGeometry().setFromPoints(pts);
      line.position.set(h.x, 0, h.z);
    } else {
      // line（冲锋路径）
      const hw = h.w / 2;
      const fg = new THREE.PlaneGeometry(h.r, h.w);
      fg.rotateX(-Math.PI / 2);
      fg.translate(h.r / 2, 0.055, 0);
      fg.rotateY(-h.ang);
      fill.geometry = fg;
      fill.position.set(h.x, 0, h.z);
      const c = Math.cos(h.ang), s = Math.sin(h.ang);
      const px = -s * hw, pz = c * hw;
      const ex = c * h.r, ez = s * h.r;
      line.geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(px, 0.065, pz),
        new THREE.Vector3(ex + px, 0.065, ez + pz),
        new THREE.Vector3(ex - px, 0.065, ez - pz),
        new THREE.Vector3(-px, 0.065, -pz),
        new THREE.Vector3(px, 0.065, pz),
      ]);
      line.position.set(h.x, 0, h.z);
    }
  }
}

```

---

## File: `src/render/renderer.ts`

```ts
import * as THREE from 'three';
import type { Game } from '../sim/game';
import { setWarmupMs } from './assets';
import { EntityRenderer } from './entities';
import { buildSunnyEnv } from './env';
import { buildWarehouseWorld } from './map_warehouse';
import type { QualityManager } from './quality';
import { VfxRenderer } from './vfx';
import type { WorldView } from './world';

/**
 * 渲染总控：
 * - 窄 FOV 透视斜俯视相机（贴合《无尽狂潮》仓库区视野与俯角），横竖屏自适应拉高
 * - 与战斗模拟完全解耦，只读取 Game 状态与 events
 */
export class Renderer {
  readonly gl: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly cam = new THREE.PerspectiveCamera(40, 1, 0.5, 280);
  readonly closeupCam = new THREE.PerspectiveCamera(34, 1, 0.1, 120);
  readonly world: WorldView;
  readonly entities: EntityRenderer;
  readonly vfx: VfxRenderer;

  closeup = false;
  closeupAngle: number | null = null;
  camTargetOverride: { x: number; y?: number; z: number } | null = null;
  camDistScale = 1;
  private envTex: THREE.Texture;
  private camX = -9.45;
  private camZ = 5.6;
  private w = 1;
  private h = 1;

  constructor(canvas: HTMLCanvasElement, private quality: QualityManager) {
    this.gl = new THREE.WebGLRenderer({
      canvas,
      antialias: quality.spec.tier !== 'low',
      powerPreference: 'high-performance',
    });
    this.gl.outputColorSpace = THREE.SRGBColorSpace;
    this.gl.toneMapping = THREE.NeutralToneMapping;
    this.gl.toneMappingExposure = 1.08;
    this.gl.shadowMap.enabled = quality.spec.shadows;
    this.gl.shadowMap.type = THREE.PCFSoftShadowMap;

    this.envTex = buildSunnyEnv(this.gl);
    this.scene.environment = this.envTex;
    this.scene.environmentIntensity = 0.40;

    this.world = buildWarehouseWorld(this.scene, this.gl);
    // 紧缩实时阴影视锥以提升角色与建筑阴影清晰度
    const sc = this.world.sun.shadow.camera;
    sc.left = -28; sc.right = 28; sc.top = 28; sc.bottom = -28;
    sc.updateProjectionMatrix();

    this.entities = new EntityRenderer(this.scene);
    this.vfx = new VfxRenderer(this.scene);
    this.entities.attachJinxVfx(this.vfx.jinxVfx);
    this.vfx.attachWeaponVfx(this.entities.weaponVfx);

    this.applyQuality();
    this.resize(window.innerWidth, window.innerHeight);
  }

  async warmup(): Promise<number> {
    const t0 = performance.now();
    await Promise.all([
      this.world.ready ?? Promise.resolve(),
      this.entities.heroReady(),
    ]);
    try {
      this.gl.compile(this.scene, this.cam);
    } catch (err) {
      console.warn('[Renderer] shader warmup skipped:', err);
    }
    const ms = performance.now() - t0;
    setWarmupMs(ms);
    return ms;
  }

  startStage2() {
    this.entities.loadStage2();
  }

  applyQuality() {
    const s = this.quality.spec;
    const dpr = Math.min(window.devicePixelRatio || 1, s.maxDpr) * s.resScale;
    this.gl.setPixelRatio(dpr);
    this.gl.setSize(this.w, this.h, false);
    this.gl.shadowMap.enabled = s.shadows;
    this.world.setShadows(s.shadows);
  }

  resize(w: number, h: number) {
    this.w = Math.max(1, w);
    this.h = Math.max(1, h);
    this.applyQuality();
    const aspect = this.w / this.h;
    this.cam.aspect = aspect;
    this.cam.updateProjectionMatrix();
    this.closeupCam.aspect = aspect;
    this.closeupCam.updateProjectionMatrix();
  }

  render(dt: number, g: Game) {
    const s = this.quality.spec;
    this.vfx.consumeEvents(g, s.fxScale, s.particleBudget);
    this.vfx.update(dt, g);
    this.entities.update(g, dt);
    this.world.update(g.clock, g.missionProgress, g.bossAlarm, g.warnings, s.tier, g.fountain);

    // 跟随玩家的高精阴影中心（按 0.5m 步长对齐，避免阴影边缘抖动，对齐官方 sunDirection）
    const sx0 = Math.round(g.player.x * 2) * 0.5;
    const sz0 = Math.round(g.player.z * 2) * 0.5;
    this.world.sun.target.position.set(sx0, 0, sz0);
    this.world.sun.position.set(sx0 - 24, 34, sz0 + 28);
    this.world.sun.target.updateMatrixWorld();

    if (this.closeup) {
      const p = g.player;
      const yaw = Math.atan2(p.faceX, p.faceZ);
      const sway = this.closeupAngle ?? (Math.sin(g.clock * 0.65) * 0.48 + 0.14);
      const a = yaw + sway;
      const dist = 4.45;
      this.closeupCam.position.set(p.x + Math.sin(a) * dist, 1.92, p.z + Math.cos(a) * dist);
      this.closeupCam.lookAt(p.x, 1.02, p.z);
      this.gl.render(this.scene, this.closeupCam);
      return;
    }

    // 窄 FOV 斜俯视透视跟随（竖屏适当拉高以覆盖周围 20-23m 刷怪圈）
    const tx = this.camTargetOverride ? this.camTargetOverride.x : g.player.x;
    const ty = this.camTargetOverride?.y ?? 0;
    const tz = this.camTargetOverride ? this.camTargetOverride.z : g.player.z;
    const k = this.camTargetOverride ? 1 : Math.min(1, dt * 8);
    this.camX += (tx - this.camX) * k;
    this.camZ += (tz - this.camZ) * k;
    const aspect = this.w / this.h;
    const pScale = (aspect < 1 ? Math.min(1.42, 1 / Math.sqrt(aspect)) : 1) * this.camDistScale;
    const shk = this.vfx.shake;
    const sx = shk > 0 ? (Math.random() - 0.5) * shk * 1.4 : 0;
    const sz = shk > 0 ? (Math.random() - 0.5) * shk * 1.4 : 0;
    this.cam.position.set(this.camX + sx, ty + 22.5 * pScale, this.camZ + 17.8 * pScale + sz);
    this.cam.lookAt(this.camX + sx, ty, this.camZ + sz);

    this.gl.render(this.scene, this.cam);
  }

  dispose() {
    this.envTex.dispose();
    this.gl.dispose();
  }
}

```

---

## File: `src/render/lan.ts`

```ts
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { Game } from '../sim/game';
import { angleDiff } from '../sim/math';
import { blobShadowTex } from './style';

const LAN_SCALE = 1.26;

function lerpAngle(a: number, b: number, t: number): number {
  return a + angleDiff(b, a) * Math.min(1, t);
}

/**
 * 为角色 PBR 材质注入手绘垂直渐变（上亮下暗）与清透边缘光（Rim Light），
 * 无需脏黑外壳描边即可在俯视与特写下获得干净立体的层次感。
 */
function stylizeMat<T extends THREE.MeshStandardMaterial>(mat: T): T {
  mat.customProgramCacheKey = () => 'lan_stylized_v2';
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vStylY;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvStylY = (modelMatrix * vec4(transformed, 1.0)).y;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vStylY;')
      .replace(
        '#include <dithering_fragment>',
        `
        gl_FragColor.rgb *= mix(0.74, 1.04, smoothstep(0.05, 1.9, vStylY));
        float rim = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), 3.0);
        gl_FragColor.rgb += vec3(0.55, 0.88, 1.0) * rim * 0.26;
        #include <dithering_fragment>
        `,
      );
  };
  return mat;
}

// ───────────────────────── 程序化高精度纹理 ─────────────────────────

function makeFaceTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const g = c.getContext('2d')!;

  const skinGrd = g.createLinearGradient(0, 80, 0, 480);
  skinGrd.addColorStop(0, '#f4cbb4');
  skinGrd.addColorStop(0.65, '#eebda1');
  skinGrd.addColorStop(1, '#e0a587');
  g.fillStyle = skinGrd;
  g.fillRect(0, 0, 512, 512);

  for (const cx of [145, 367]) {
    const grd = g.createRadialGradient(cx, 316, 6, cx, 316, 56);
    grd.addColorStop(0, 'rgba(248, 128, 114, 0.34)');
    grd.addColorStop(1, 'rgba(248, 128, 114, 0)');
    g.fillStyle = grd;
    g.beginPath();
    g.arc(cx, 316, 56, 0, Math.PI * 2);
    g.fill();
  }

  g.fillStyle = 'rgba(210, 145, 118, 0.35)';
  g.beginPath();
  g.ellipse(256, 312, 5, 9, 0, 0, Math.PI * 2);
  g.fill();

  for (const side of [-1, 1]) {
    const ex = 256 + side * 74;
    const ey = 252;
    g.save();
    g.translate(ex, ey);
    g.scale(side, 1);

    g.fillStyle = '#fcfdff';
    g.beginPath();
    g.ellipse(0, 0, 38, 29, 0, 0, Math.PI * 2);
    g.fill();

    const iris = g.createLinearGradient(0, -24, 0, 24);
    iris.addColorStop(0, '#0a4a68');
    iris.addColorStop(0.55, '#19a7cc');
    iris.addColorStop(1, '#72f9ff');
    g.fillStyle = iris;
    g.beginPath();
    g.ellipse(4, 2, 23, 25, 0, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = '#091f2e';
    g.beginPath();
    g.ellipse(4, 2, 10, 13, 0, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(-6, -10, 7, 0, Math.PI * 2);
    g.arc(12, 10, 3.5, 0, Math.PI * 2);
    g.fill();

    g.strokeStyle = '#1b1a22';
    g.lineWidth = 8;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(-40, -10);
    g.quadraticCurveTo(0, -34, 42, -16);
    g.stroke();

    g.strokeStyle = '#c45318';
    g.lineWidth = 7.5;
    g.beginPath();
    g.moveTo(-34, -42);
    g.quadraticCurveTo(4, -56, 38, -46);
    g.stroke();

    g.restore();
  }

  g.strokeStyle = '#8b433a';
  g.lineWidth = 5;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(226, 376);
  g.quadraticCurveTo(256, 384, 292, 367);
  g.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeCoatTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const g = c.getContext('2d')!;

  g.fillStyle = '#eef3f7';
  g.fillRect(0, 0, 512, 512);

  g.strokeStyle = 'rgba(175, 192, 206, 0.28)';
  g.lineWidth = 2;
  for (let i = -512; i < 1024; i += 10) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + 512, 512);
    g.stroke();
  }

  g.fillStyle = '#24313d';
  g.fillRect(0, 368, 512, 144);
  g.fillRect(0, 0, 42, 512);

  g.fillStyle = '#ff7b22';
  g.fillRect(0, 346, 512, 22);
  g.fillRect(36, 0, 12, 346);

  g.strokeStyle = 'rgba(55, 72, 88, 0.35)';
  g.lineWidth = 3;
  g.strokeRect(64, 34, 396, 286);

  g.fillStyle = '#ff7b22';
  g.font = 'bold 74px sans-serif';
  g.fillText('07', 350, 120);
  g.fillStyle = '#24313d';
  g.font = 'bold 20px sans-serif';
  g.fillText('TIDELINE', 344, 148);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeHazardTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d')!;

  g.fillStyle = '#ff7d24';
  g.fillRect(0, 0, 256, 256);

  g.fillStyle = '#1b242d';
  for (let i = -256; i < 512; i += 48) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + 24, 0);
    g.lineTo(i + 280, 256);
    g.lineTo(i + 256, 256);
    g.closePath();
    g.fill();
  }

  g.fillStyle = '#ff7d24';
  g.fillRect(0, 0, 256, 20);
  g.fillRect(0, 236, 256, 20);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeMetalBumpTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d')!;

  g.fillStyle = '#848484';
  g.fillRect(0, 0, 256, 256);

  for (let y = 0; y < 256; y += 2) {
    const v = 115 + Math.floor(Math.sin(y * 1.7) * 16 + ((y * 37) % 18));
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(0, y, 256, 1);
  }

  g.strokeStyle = '#383838';
  g.lineWidth = 4;
  g.strokeRect(14, 14, 228, 228);
  g.beginPath();
  g.moveTo(128, 14);
  g.lineTo(128, 242);
  g.stroke();

  g.fillStyle = '#d4d4d4';
  for (const [rx, ry] of [[28, 28], [228, 28], [28, 228], [228, 228], [112, 28], [144, 28]]) {
    g.beginPath();
    g.arc(rx, ry, 5, 0, Math.PI * 2);
    g.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/**
 * 对标《无尽狂潮》的发光脚底战术光环：
 * 双层明亮外圈 + 径向刻度 + 淡网格光晕 + 锐利前向指示箭。
 */
function makeReticleTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const g = c.getContext('2d')!;
  const cx = 256;
  const cy = 256;

  // 内部微弱科技光晕与网格
  const glow = g.createRadialGradient(cx, cy, 40, cx, cy, 198);
  glow.addColorStop(0, 'rgba(255,255,255,0.03)');
  glow.addColorStop(0.72, 'rgba(255,255,255,0.14)');
  glow.addColorStop(0.95, 'rgba(255,255,255,0.22)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = glow;
  g.beginPath();
  g.arc(cx, cy, 200, 0, Math.PI * 2);
  g.fill();

  g.save();
  g.beginPath();
  g.arc(cx, cy, 168, 0, Math.PI * 2);
  g.clip();
  g.strokeStyle = 'rgba(255,255,255,0.12)';
  g.lineWidth = 2;
  for (let p = 80; p <= 440; p += 28) {
    g.beginPath(); g.moveTo(p, 80); g.lineTo(p, 440); g.stroke();
    g.beginPath(); g.moveTo(80, p); g.lineTo(440, p); g.stroke();
  }
  g.restore();

  // 外圈分段亮弧
  g.strokeStyle = '#ffffff';
  g.lineWidth = 9;
  g.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const a0 = i * (Math.PI / 2) + 0.2;
    const a1 = (i + 1) * (Math.PI / 2) - 0.2;
    g.beginPath();
    g.arc(cx, cy, 194, a0, a1);
    g.stroke();
  }

  // 内细环 + 径向刻度
  g.strokeStyle = 'rgba(255,255,255,0.72)';
  g.lineWidth = 4;
  g.beginPath();
  g.arc(cx, cy, 168, 0, Math.PI * 2);
  g.stroke();

  g.lineWidth = 3;
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const r0 = i % 6 === 0 ? 154 : 161;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    g.lineTo(cx + Math.cos(a) * 168, cy + Math.sin(a) * 168);
    g.stroke();
  }

  // 锐利前向箭头（在顶部 -Y，经 rotateX(-PI/2) + rotateY(PI) 后指向 +Z 前方）
  g.fillStyle = '#ffffff';
  g.beginPath();
  g.moveTo(cx, 12);
  g.lineTo(cx + 34, 72);
  g.lineTo(cx + 12, 60);
  g.lineTo(cx + 12, 92);
  g.lineTo(cx - 12, 92);
  g.lineTo(cx - 12, 60);
  g.lineTo(cx - 34, 72);
  g.closePath();
  g.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// ───────────────────────── 平滑自定义几何 ─────────────────────────

function makeHairLockGeo(
  pts: [number, number, number][],
  widths: number[],
  thicks: number[],
  segs = 10,
): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  const radial = 8;
  const pos: number[] = [];
  const uvs: number[] = [];
  const idx: number[] = [];

  const up = new THREE.Vector3(0, 1, 0);
  const alt = new THREE.Vector3(0, 0, 1);

  const sampleLerp = (arr: number[], u: number) => {
    const f = u * (arr.length - 1);
    const i = Math.min(arr.length - 2, Math.floor(f));
    const t = f - i;
    return arr[i] * (1 - t) + arr[i + 1] * t;
  };

  for (let i = 0; i <= segs; i++) {
    const u = i / segs;
    const p = curve.getPointAt(u);
    const tang = curve.getTangentAt(u).normalize();
    const ref = Math.abs(tang.dot(up)) > 0.92 ? alt : up;
    const side = new THREE.Vector3().crossVectors(ref, tang).normalize();
    const binorm = new THREE.Vector3().crossVectors(tang, side).normalize();

    const w = sampleLerp(widths, u);
    const th = sampleLerp(thicks, u);

    for (let j = 0; j < radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      pos.push(
        p.x + side.x * Math.cos(a) * w + binorm.x * Math.sin(a) * th,
        p.y + side.y * Math.cos(a) * w + binorm.y * Math.sin(a) * th,
        p.z + side.z * Math.cos(a) * w + binorm.z * Math.sin(a) * th,
      );
      uvs.push(j / radial, u);
    }
  }

  for (let i = 0; i < segs; i++) {
    for (let j = 0; j < radial; j++) {
      const next = (j + 1) % radial;
      const a = i * radial + j;
      const b = i * radial + next;
      const c = (i + 1) * radial + next;
      const d = (i + 1) * radial + j;
      idx.push(a, b, c, a, c, d);
    }
  }

  const tipCenter = curve.getPointAt(1);
  const tipIdx = pos.length / 3;
  pos.push(tipCenter.x, tipCenter.y, tipCenter.z);
  uvs.push(0.5, 1);
  const lastRing = segs * radial;
  for (let j = 0; j < radial; j++) {
    idx.push(lastRing + j, lastRing + ((j + 1) % radial), tipIdx);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

// ───────────────────────── 主角「岚」骨骼装配体 ─────────────────────────

export class LanRig {
  readonly root = new THREE.Group();

  private hips = new THREE.Group();
  private torso = new THREE.Group();
  private head = new THREE.Group();
  private hairPivot = new THREE.Group();

  private legL = new THREE.Group();
  private legR = new THREE.Group();
  private kneeL = new THREE.Group();
  private kneeR = new THREE.Group();

  private armL = new THREE.Group();
  private armR = new THREE.Group();
  private coatTail = new THREE.Group();
  private sash = new THREE.Group();

  private gunPivot = new THREE.Group();
  private mgMesh = new THREE.Group();
  private mgSpin = new THREE.Group();
  private mgPierceFin = new THREE.Group();
  private cnMesh = new THREE.Group();
  private cnShardsWing = new THREE.Group();
  private cnPulseRing = new THREE.Group();
  private cnPistonL!: THREE.Mesh;
  private cnPistonR!: THREE.Mesh;

  private pbrMats: THREE.MeshStandardMaterial[] = [];
  private gogLensMat: THREE.MeshPhysicalMaterial;
  private packCoreMat: THREE.MeshStandardMaterial;
  private packJetMat: THREE.MeshBasicMaterial;
  private heelJetMat: THREE.MeshBasicMaterial;
  private mgGlowMat: THREE.MeshStandardMaterial;
  private mgFocusMat: THREE.MeshStandardMaterial;
  private cnGlowMat: THREE.MeshStandardMaterial;
  private cnPulseMat: THREE.MeshStandardMaterial;

  private facing: THREE.Mesh;
  private facingMat: THREE.MeshBasicMaterial;
  private auraRing: THREE.Mesh;
  private auraMat: THREE.MeshBasicMaterial;
  private pickupRing: THREE.Mesh;

  private legYaw = 0;
  private aimYaw = 0;
  private hairSwings: { mesh: THREE.Mesh; baseRx: number; baseRz: number; phase: number }[] = [];

  constructor() {
    const faceTex = makeFaceTex();
    const coatTex = makeCoatTex();
    const hazardTex = makeHazardTex();
    const metalBump = makeMetalBumpTex();
    const reticleTex = makeReticleTex();

    const mkStd = (opts: THREE.MeshStandardMaterialParameters) => {
      const m = stylizeMat(new THREE.MeshStandardMaterial(opts));
      this.pbrMats.push(m);
      return m;
    };

    const skinMat = mkStd({ color: 0xeec0a5, roughness: 0.68, metalness: 0.01 });
    const faceMat = mkStd({ map: faceTex, roughness: 0.64, metalness: 0.01 });
    const hairOrange = mkStd({ color: 0xff7d26, roughness: 0.44, metalness: 0.05 });
    const hairWhite = mkStd({ color: 0xfff8ee, roughness: 0.42, metalness: 0.05 });
    const coatMat = mkStd({ map: coatTex, roughness: 0.56, metalness: 0.04 });
    const coatWhiteMat = mkStd({ color: 0xeef3f7, roughness: 0.54, metalness: 0.05 });
    const coatOrange = mkStd({ color: 0xff7b22, roughness: 0.46, metalness: 0.12 });
    const hazardMat = mkStd({ map: hazardTex, roughness: 0.44, metalness: 0.2 });
    const tealDarkMat = mkStd({ color: 0x14364a, roughness: 0.58, metalness: 0.08 });
    const navyMat = mkStd({ color: 0x182942, roughness: 0.58, metalness: 0.1 });
    const bootMat = mkStd({ color: 0x202730, roughness: 0.52, metalness: 0.22 });
    const metalMat = mkStd({
      color: 0x8e9da9, roughness: 0.3, metalness: 0.84,
      bumpMap: metalBump, bumpScale: 0.014, roughnessMap: metalBump,
    });
    const darkMetalMat = mkStd({
      color: 0x27313b, roughness: 0.36, metalness: 0.8,
      bumpMap: metalBump, bumpScale: 0.012,
    });
    const jointOrangeMat = mkStd({ color: 0xff7b22, roughness: 0.32, metalness: 0.62 });

    // ── 接地影 & 发光脚底战术光环 ──
    const shadowMat = new THREE.MeshBasicMaterial({ map: blobShadowTex(), transparent: true, depthWrite: false });
    const shadowGeo = new THREE.PlaneGeometry(1.75, 1.75);
    shadowGeo.rotateX(-Math.PI / 2);
    const pShadow = new THREE.Mesh(shadowGeo, shadowMat);
    pShadow.position.y = 0.02;
    this.root.add(pShadow);

    const reticleGeo = new THREE.PlaneGeometry(2.35, 2.35);
    reticleGeo.rotateX(-Math.PI / 2);
    reticleGeo.rotateY(Math.PI); // 关键：让纹理顶部箭头严格指向角色前方 +Z
    this.facingMat = new THREE.MeshBasicMaterial({
      map: reticleTex, color: 0x32f4ff, transparent: true, opacity: 0.92, depthWrite: false,
    });
    this.facing = new THREE.Mesh(reticleGeo, this.facingMat);
    this.facing.position.y = 0.035;
    this.facing.renderOrder = 6;

    this.auraMat = new THREE.MeshBasicMaterial({ color: 0x45f8ff, transparent: true, opacity: 0, depthWrite: false });
    const auraGeo = new THREE.RingGeometry(0.96, 1.24, 36);
    auraGeo.rotateX(-Math.PI / 2);
    this.auraRing = new THREE.Mesh(auraGeo, this.auraMat);
    this.auraRing.position.y = 0.045;
    this.auraRing.renderOrder = 7;

    const prGeo = new THREE.RingGeometry(0.975, 1.0, 48);
    prGeo.rotateX(-Math.PI / 2);
    this.pickupRing = new THREE.Mesh(prGeo, new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.14, depthWrite: false,
    }));
    this.pickupRing.position.y = 0.03;

    this.root.add(this.facing, this.auraRing, this.pickupRing);

    // ── 修长 5 头身骨架根部（hips 高 0.83m，使鞋底稳踩 y=0） ──
    const rigRoot = new THREE.Group();
    rigRoot.scale.setScalar(LAN_SCALE);
    this.root.add(rigRoot);

    this.hips.position.y = 0.83;
    rigRoot.add(this.hips);

    // ── 修长深蓝护腿（细大腿 + 独立膝关节 + 流线护腿 + 工业工靴 + 脚跟喷口） ──
    this.heelJetMat = new THREE.MeshBasicMaterial({ color: 0x45f5ff, transparent: true, opacity: 0 });
    const mkLeg = (side: number, legGrp: THREE.Group, kneeGrp: THREE.Group) => {
      legGrp.position.set(side * 0.11, 0, 0);
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.072, 0.25, 6, 12), navyMat);
      thigh.position.y = -0.19;

      const strap = new THREE.Mesh(new THREE.TorusGeometry(0.074, 0.013, 6, 16), coatOrange);
      strap.rotation.x = Math.PI / 2;
      strap.position.y = -0.2;

      kneeGrp.position.set(0, -0.39, 0);
      const kneePad = new THREE.Mesh(new RoundedBoxGeometry(0.135, 0.11, 0.095, 3, 0.025), metalMat);
      kneePad.position.set(0, 0, 0.055);

      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.056, 0.28, 12), navyMat);
      shin.position.y = -0.17;

      const shinGuard = new THREE.Mesh(new RoundedBoxGeometry(0.11, 0.22, 0.06, 2, 0.018), darkMetalMat);
      shinGuard.position.set(0, -0.17, 0.048);

      const bootUpper = new THREE.Mesh(new RoundedBoxGeometry(0.135, 0.09, 0.23, 3, 0.025), bootMat);
      bootUpper.position.set(0, -0.37, 0.035);
      const sole = new THREE.Mesh(new RoundedBoxGeometry(0.148, 0.04, 0.25, 2, 0.012), coatOrange);
      sole.position.set(0, -0.42, 0.035);

      const heelJet = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.18, 8), this.heelJetMat);
      heelJet.rotation.x = -Math.PI / 2;
      heelJet.position.set(0, -0.37, -0.15);

      kneeGrp.add(kneePad, shin, shinGuard, bootUpper, sole, heelJet);
      legGrp.add(thigh, strap, kneeGrp);
    };
    mkLeg(-1, this.legL, this.kneeL);
    mkLeg(1, this.legR, this.kneeR);
    this.hips.add(this.legL, this.legR);

    // ── 上身躯干（纤细收腰暗青内衬 + 不对称防浪外套 + 飘逸长摆与腰带飘带） ──
    this.hips.add(this.torso);

    const torsoPts = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.14, 0.0),
      new THREE.Vector2(0.12, 0.16),
      new THREE.Vector2(0.175, 0.37),
      new THREE.Vector2(0.15, 0.48),
      new THREE.Vector2(0.0, 0.5),
    ];
    const torsoMesh = new THREE.Mesh(new THREE.LatheGeometry(torsoPts, 16), tealDarkMat);
    torsoMesh.scale.set(1.08, 1, 0.76);
    this.torso.add(torsoMesh);

    const belt = new THREE.Mesh(new RoundedBoxGeometry(0.35, 0.068, 0.26, 3, 0.018), bootMat);
    belt.position.y = 0.02;
    const buckle = new THREE.Mesh(new RoundedBoxGeometry(0.088, 0.056, 0.035, 2, 0.01), metalMat);
    buckle.position.set(0, 0.02, 0.135);
    const beltMine = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 12), jointOrangeMat);
    beltMine.position.set(-0.185, 0.01, 0.03);
    beltMine.rotation.z = 0.25;
    this.torso.add(belt, buckle, beltMine);

    // 不对称防浪外套（圆润贴身剪裁 + 飘逸浅白长摆）
    const coatL = new THREE.Mesh(new RoundedBoxGeometry(0.19, 0.42, 0.25, 4, 0.05), coatMat);
    coatL.position.set(-0.075, 0.26, 0);
    const coatR = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.3, 0.24, 4, 0.045), coatMat);
    coatR.position.set(0.085, 0.32, 0);
    const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 10), coatWhiteMat);
    shoulderL.position.set(-0.185, 0.4, 0.01);

    // 轻盈斜飘的左侧防浪长衣摆（使用纯白布料避免 UV 偏移发黑）
    this.coatTail.position.set(-0.09, 0.06, -0.02);
    const tailShape = new THREE.Shape();
    tailShape.moveTo(-0.08, 0);
    tailShape.lineTo(0.09, 0);
    tailShape.lineTo(0.11, -0.31);
    tailShape.lineTo(-0.02, -0.37);
    tailShape.lineTo(-0.12, -0.27);
    tailShape.closePath();
    const tailGeo = new THREE.ExtrudeGeometry(tailShape, {
      depth: 0.024, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2,
    });
    const tailMesh = new THREE.Mesh(tailGeo, coatWhiteMat);
    tailMesh.position.set(0, 0, -0.1);
    tailMesh.rotation.x = 0.35;
    const tailTrim = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.032, 0.045, 2, 0.01), coatOrange);
    tailTrim.position.set(-0.005, -0.28, -0.19);
    tailTrim.rotation.x = 0.35;
    this.coatTail.add(tailMesh, tailTrim);

    // 亮橙镶青边的动态防风腰带飘带（强化跑动方向感）
    this.sash.position.set(0.14, 0.03, -0.09);
    const sashCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.05, -0.14, -0.18),
      new THREE.Vector3(0.08, -0.32, -0.38),
      new THREE.Vector3(0.06, -0.44, -0.54),
    ]);
    const sashGeo = new THREE.TubeGeometry(sashCurve, 12, 0.026, 6, false);
    sashGeo.scale(1.6, 0.55, 1);
    const sashMesh = new THREE.Mesh(sashGeo, coatOrange);
    this.sash.add(sashMesh);

    // 高翻白橙防风立领
    const collarOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.205, 0.125, 18, 1, false, Math.PI * 0.25, Math.PI * 1.5), coatOrange);
    collarOuter.position.set(0, 0.485, -0.01);
    const collarInner = new THREE.Mesh(new THREE.CylinderGeometry(0.168, 0.185, 0.108, 18, 1, false, Math.PI * 0.25, Math.PI * 1.5), coatMat);
    collarInner.position.set(0, 0.49, -0.01);

    // 右肩斜切橙黑警示肩甲
    const padR = new THREE.Mesh(new RoundedBoxGeometry(0.19, 0.125, 0.24, 3, 0.03), hazardMat);
    padR.position.set(0.22, 0.43, 0.0);
    padR.rotation.z = -0.24;
    const padTrim = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.036, 0.25, 2, 0.01), coatOrange);
    padTrim.position.set(0.22, 0.475, 0.0);
    padTrim.rotation.z = -0.24;

    this.torso.add(coatL, coatR, shoulderL, this.coatTail, this.sash, collarOuter, collarInner, padR, padTrim);

    // ── 工业拆械背包 ──
    const pack = new THREE.Group();
    pack.position.set(0, 0.29, -0.19);
    const packCase = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.31, 0.14, 3, 0.03), darkMetalMat);
    const packFrame = new THREE.Mesh(new RoundedBoxGeometry(0.31, 0.06, 0.16, 2, 0.018), coatMat);
    packFrame.position.y = 0.12;
    this.packCoreMat = new THREE.MeshStandardMaterial({
      color: 0x4df6ff, emissive: 0x1ac8e8, emissiveIntensity: 1.5, roughness: 0.2, metalness: 0.1,
    });
    const packCore = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.2, 12), this.packCoreMat);
    packCore.position.set(0, -0.01, -0.05);
    const packCage = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.01, 6, 14), metalMat);
    packCage.rotation.x = Math.PI / 2;
    packCage.position.set(0, -0.01, -0.05);

    this.packJetMat = new THREE.MeshBasicMaterial({ color: 0x5af7ff, transparent: true, opacity: 0 });
    const packJet = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.36, 10), this.packJetMat);
    packJet.rotation.x = -Math.PI / 2;
    packJet.position.set(0, -0.05, -0.25);

    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.1, 0.05, -0.03),
      new THREE.Vector3(0.21, 0.09, -0.06),
      new THREE.Vector3(0.24, 0.07, 0.1),
    ]);
    const cable = new THREE.Mesh(new THREE.TubeGeometry(cableCurve, 12, 0.02, 8, false), jointOrangeMat);
    pack.add(packCase, packFrame, packCore, packCage, packJet, cable);
    this.torso.add(pack);

    // ── 紧凑头部 + 14 缕立体橙白短发 + 发光青色护目镜 ──
    this.head.position.set(0, 0.53, 0.01);
    this.torso.add(this.head);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.064, 0.1, 12), skinMat);
    neck.position.y = 0.02;
    const headBase = new THREE.Mesh(new THREE.SphereGeometry(0.158, 20, 16), skinMat);
    headBase.scale.set(0.96, 1.04, 0.96);
    headBase.position.y = 0.16;

    const facePatch = new THREE.Mesh(
      new THREE.SphereGeometry(0.159, 20, 14, -Math.PI * 0.32, Math.PI * 0.64, Math.PI * 0.24, Math.PI * 0.56),
      faceMat,
    );
    facePatch.rotation.y = Math.PI / 2;
    facePatch.scale.set(0.96, 1.04, 0.96);
    facePatch.position.y = 0.16;

    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 8), skinMat);
      ear.scale.set(0.55, 1, 0.7);
      ear.position.set(s * 0.154, 0.155, -0.01);
      this.head.add(ear);
    }

    this.hairPivot.position.set(0, 0.185, -0.01);
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.168, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.44),
      hairOrange,
    );
    hairCap.position.set(0, 0.02, -0.008);
    hairCap.rotation.x = -0.18;
    this.hairPivot.add(hairCap);

    const hairDefs: { pts: [number, number, number][]; w: number[]; th: number[]; white?: boolean; phase: number }[] = [
      { pts: [[-0.07, 0.13, 0.07], [-0.13, 0.08, 0.16], [-0.15, 0.0, 0.19]], w: [0.06, 0.042, 0.007], th: [0.03, 0.022, 0.005], phase: 0.2 },
      { pts: [[0.01, 0.14, 0.08], [0.04, 0.09, 0.19], [0.07, 0.01, 0.21]], w: [0.066, 0.046, 0.007], th: [0.032, 0.022, 0.005], white: true, phase: 0.7 },
      { pts: [[0.1, 0.12, 0.06], [0.16, 0.06, 0.15], [0.19, -0.01, 0.16]], w: [0.056, 0.038, 0.007], th: [0.028, 0.02, 0.005], phase: 1.3 },
      { pts: [[-0.03, 0.15, 0.0], [-0.07, 0.25, 0.04], [-0.11, 0.29, 0.08]], w: [0.054, 0.036, 0.005], th: [0.03, 0.02, 0.004], phase: 1.9 },
      { pts: [[0.04, 0.15, 0.0], [0.1, 0.26, 0.02], [0.16, 0.3, -0.03]], w: [0.054, 0.036, 0.005], th: [0.03, 0.02, 0.004], white: true, phase: 2.4 },
      { pts: [[-0.12, 0.1, 0.0], [-0.22, 0.05, -0.02], [-0.26, -0.02, -0.05]], w: [0.058, 0.04, 0.007], th: [0.032, 0.022, 0.005], phase: 2.9 },
      { pts: [[-0.12, 0.05, -0.05], [-0.21, 0.0, -0.12], [-0.25, -0.06, -0.17]], w: [0.058, 0.04, 0.007], th: [0.03, 0.02, 0.005], phase: 3.4 },
      { pts: [[0.12, 0.1, 0.0], [0.22, 0.05, -0.01], [0.26, -0.01, -0.04]], w: [0.058, 0.04, 0.007], th: [0.032, 0.022, 0.005], white: true, phase: 3.9 },
      { pts: [[0.12, 0.05, -0.05], [0.21, 0.0, -0.12], [0.25, -0.06, -0.17]], w: [0.058, 0.04, 0.007], th: [0.03, 0.02, 0.005], phase: 4.4 },
      { pts: [[-0.09, 0.11, -0.11], [-0.15, 0.08, -0.23], [-0.19, 0.01, -0.32]], w: [0.064, 0.045, 0.007], th: [0.034, 0.024, 0.005], phase: 4.9 },
      { pts: [[-0.03, 0.12, -0.13], [-0.04, 0.11, -0.27], [-0.05, 0.05, -0.36]], w: [0.068, 0.048, 0.007], th: [0.036, 0.024, 0.005], phase: 5.4 },
      { pts: [[0.05, 0.12, -0.12], [0.09, 0.1, -0.26], [0.12, 0.04, -0.35]], w: [0.066, 0.046, 0.007], th: [0.034, 0.024, 0.005], white: true, phase: 5.8 },
      { pts: [[0.11, 0.1, -0.1], [0.18, 0.06, -0.22], [0.23, 0.0, -0.3]], w: [0.06, 0.042, 0.007], th: [0.032, 0.022, 0.005], phase: 6.2 },
      { pts: [[0.0, 0.02, -0.15], [0.0, -0.04, -0.24], [0.0, -0.11, -0.29]], w: [0.08, 0.052, 0.01], th: [0.03, 0.02, 0.005], phase: 0.4 },
    ];
    for (const d of hairDefs) {
      const m = new THREE.Mesh(makeHairLockGeo(d.pts, d.w, d.th, 8), d.white ? hairWhite : hairOrange);
      this.hairPivot.add(m);
      this.hairSwings.push({ mesh: m, baseRx: 0, baseRz: 0, phase: d.phase });
    }

    // 发光青色护目镜（贴合额前）
    const gogGroup = new THREE.Group();
    gogGroup.position.set(0, 0.225, 0.005);
    gogGroup.rotation.x = -0.1;
    const gogBand = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.014, 8, 28), darkMetalMat);
    gogBand.rotation.x = Math.PI / 2;
    const gogFrame = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.072, 0.056, 3, 0.018), darkMetalMat);
    gogFrame.position.set(0, 0.005, 0.145);
    const gogNose = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.028, 0.03, 2, 0.008), coatOrange);
    gogNose.position.set(0, -0.018, 0.165);

    this.gogLensMat = new THREE.MeshPhysicalMaterial({
      color: 0x3ef5ff,
      emissive: 0x16b8d8,
      emissiveIntensity: 0.9,
      roughness: 0.08,
      metalness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });
    const gogLens = new THREE.Mesh(new RoundedBoxGeometry(0.21, 0.052, 0.024, 3, 0.012), this.gogLensMat);
    gogLens.position.set(0, 0.005, 0.17);
    gogGroup.add(gogBand, gogFrame, gogNose, gogLens);

    this.head.add(neck, headBase, facePatch, this.hairPivot, gogGroup);

    // ── 左臂（机能布袖 + 手套协同托枪） ──
    this.armL.position.set(-0.2, 0.39, 0.02);
    const sleeveL = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.19, 6, 10), coatMat);
    sleeveL.position.set(0.02, -0.09, 0.07);
    sleeveL.rotation.set(-0.65, 0, -0.22);
    const cuffL = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.052, 0.045, 10), coatOrange);
    cuffL.position.set(0.07, -0.17, 0.17);
    cuffL.rotation.set(-0.65, 0, -0.22);
    const gloveL = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.08, 0.1, 2, 0.022), bootMat);
    gloveL.position.set(0.14, -0.2, 0.27);
    this.armL.add(sleeveL, cuffL, gloveL);
    this.torso.add(this.armL);

    // ── 右侧单侧机械护臂 ──
    this.armR.position.set(0.21, 0.39, 0.01);
    const mechUpper = new THREE.Mesh(new RoundedBoxGeometry(0.115, 0.19, 0.125, 3, 0.026), metalMat);
    mechUpper.position.set(0.01, -0.08, 0.01);
    const mechJoint = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 10), jointOrangeMat);
    mechJoint.position.set(0.02, -0.185, 0.04);
    const mechFore = new THREE.Mesh(new RoundedBoxGeometry(0.13, 0.125, 0.25, 3, 0.026), metalMat);
    mechFore.position.set(0.02, -0.195, 0.17);
    const mechStrip = new THREE.Mesh(new RoundedBoxGeometry(0.024, 0.032, 0.17, 2, 0.008), this.packCoreMat);
    mechStrip.position.set(0.08, -0.195, 0.17);
    const mechHand = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.1, 0.11, 2, 0.022), darkMetalMat);
    mechHand.position.set(0.01, -0.195, 0.31);
    this.armR.add(mechUpper, mechJoint, mechFore, mechStrip, mechHand);
    this.torso.add(this.armR);

    // ── 放大体量的双形态重武器（纤细身板 × 重火力反差，总长 ~1.05m 局部尺度） ──
    this.gunPivot.position.set(0.2, 0.2, 0.32);
    this.gunPivot.add(this.mgMesh, this.cnMesh);
    this.torso.add(this.gunPivot);

    // 1) 铆钉机枪
    this.mgGlowMat = new THREE.MeshStandardMaterial({
      color: 0x264458, emissive: 0x16809e, emissiveIntensity: 0.55, roughness: 0.25, metalness: 0.75,
    });
    this.mgFocusMat = new THREE.MeshStandardMaterial({
      color: 0x45f8ff, emissive: 0x28e4ff, emissiveIntensity: 1.6, roughness: 0.2, metalness: 0.3,
    });

    const mgRec = new THREE.Mesh(new RoundedBoxGeometry(0.17, 0.19, 0.62, 3, 0.03), metalMat);
    const mgTopRail = new THREE.Mesh(new RoundedBoxGeometry(0.088, 0.045, 0.48, 2, 0.012), darkMetalMat);
    mgTopRail.position.set(0, 0.11, 0.02);
    const mgSight = new THREE.Mesh(new RoundedBoxGeometry(0.075, 0.072, 0.11, 2, 0.014), darkMetalMat);
    mgSight.position.set(0, 0.155, -0.02);
    const mgSightGlass = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.045, 0.012), this.gogLensMat);
    mgSightGlass.position.set(0, 0.158, 0.03);

    const mgShroud = new THREE.Mesh(new RoundedBoxGeometry(0.135, 0.135, 0.32, 2, 0.024), darkMetalMat);
    mgShroud.position.z = 0.41;

    this.mgSpin.position.set(0, 0.01, 0.56);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.54, 8), this.mgGlowMat);
      bar.rotation.x = Math.PI / 2;
      bar.position.set(Math.cos(a) * 0.032, Math.sin(a) * 0.032, 0);
      this.mgSpin.add(bar);
    }
    const mgMuzzleCap = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.045, 12), coatOrange);
    mgMuzzleCap.rotation.x = Math.PI / 2;
    mgMuzzleCap.position.z = 0.25;
    this.mgSpin.add(mgMuzzleCap);

    // 大号标志性侧挂青白弹鼓
    const drumBody = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.15, 20), mkStd({ color: 0x26b8d8, roughness: 0.34, metalness: 0.32 }));
    drumBody.rotation.z = Math.PI / 2;
    drumBody.position.set(0.165, -0.035, 0.03);
    const drumHub = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.17, 16), coatMat);
    drumHub.rotation.z = Math.PI / 2;
    drumHub.position.set(0.165, -0.035, 0.03);
    const drumFeed = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.08, 0.12, 2, 0.015), darkMetalMat);
    drumFeed.position.set(0.085, -0.02, 0.03);

    const finL = new THREE.Mesh(new RoundedBoxGeometry(0.028, 0.07, 0.44, 2, 0.008), this.mgFocusMat);
    finL.position.set(-0.09, 0.03, 0.54);
    const finR = finL.clone();
    finR.position.x = 0.09;
    this.mgPierceFin.add(finL, finR);
    this.mgPierceFin.visible = false;

    this.mgMesh.add(mgRec, mgTopRail, mgSight, mgSightGlass, mgShroud, this.mgSpin, drumBody, drumHub, drumFeed, this.mgPierceFin);

    // 2) 震荡炮
    this.cnGlowMat = new THREE.MeshStandardMaterial({
      color: 0xffa832, emissive: 0xff6e12, emissiveIntensity: 0.9, roughness: 0.25, metalness: 0.4,
    });
    this.cnPulseMat = new THREE.MeshStandardMaterial({
      color: 0x45f5ff, emissive: 0x24d6ff, emissiveIntensity: 1.6, roughness: 0.2, metalness: 0.25,
    });

    const cnBody = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.31, 0.64, 3, 0.04), darkMetalMat);
    const cnHood = new THREE.Mesh(new RoundedBoxGeometry(0.37, 0.14, 0.46, 3, 0.032), coatOrange);
    cnHood.position.set(0, 0.16, -0.02);
    const cnHazardPlate = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.034, 0.26, 2, 0.01), hazardMat);
    cnHazardPlate.position.set(0, 0.235, -0.04);
    const cnCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.23, 0.11, 16), metalMat);
    cnCollar.rotation.x = Math.PI / 2;
    cnCollar.position.z = 0.36;
    const cnCap = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.072, 0.16, 12), this.cnGlowMat);
    cnCap.rotation.z = Math.PI / 2;
    cnCap.position.set(0, 0.05, -0.32);

    const pistonGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.28, 8);
    pistonGeo.rotateX(Math.PI / 2);
    this.cnPistonL = new THREE.Mesh(pistonGeo, metalMat);
    this.cnPistonL.position.set(-0.18, 0.02, 0.2);
    this.cnPistonR = new THREE.Mesh(pistonGeo, metalMat);
    this.cnPistonR.position.set(0.18, 0.02, 0.2);

    for (const [bx, by] of [[-0.098, 0.058], [0.098, 0.058], [0, -0.1]]) {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.074, 0.078, 0.4, 12), darkMetalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(bx, by, 0.56);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.066, 0.014, 6, 14), coatOrange);
      rim.position.set(bx, by, 0.755);
      const core = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.024, 10), this.cnGlowMat);
      core.rotation.x = Math.PI / 2;
      core.position.set(bx, by, 0.75);
      this.cnMesh.add(barrel, rim, core);
    }

    for (const s of [-1, 1]) {
      const wing = new THREE.Mesh(new RoundedBoxGeometry(0.045, 0.14, 0.28, 2, 0.01), coatOrange);
      wing.position.set(s * 0.215, 0.03, 0.48);
      wing.rotation.z = s * -0.25;
      this.cnShardsWing.add(wing);
    }
    this.cnShardsWing.visible = false;

    const pulseCoil = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.022, 8, 20), this.cnPulseMat);
    pulseCoil.position.set(0, 0, 0.52);
    this.cnPulseRing.add(pulseCoil);
    this.cnPulseRing.visible = false;

    this.cnMesh.add(
      cnBody, cnHood, cnHazardPlate, cnCollar, cnCap,
      this.cnPistonL, this.cnPistonR, this.cnShardsWing, this.cnPulseRing,
    );

    rigRoot.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.material !== this.packJetMat && m.material !== this.heelJetMat) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
  }

  update(g: Game, dt: number) {
    const p = g.player;
    const t = g.clock;

    this.root.position.set(p.x, 0, p.z);

    // ── 上/下身朝向分离：腿朝移动方向，上身带微侧身战斗架势转向目标 ──
    const targetAim = Math.atan2(p.faceX, p.faceZ);
    const moveAng = Math.atan2(p.lastMoveX, p.lastMoveZ);
    const k = Math.min(1, dt * 16);
    this.aimYaw = lerpAngle(this.aimYaw, targetAim, k);

    const moving = p.moving || p.dashT > 0;
    let legTarget = this.aimYaw - 0.24; // 待机时微侧身 14° 站姿
    let strideSign = 1;
    if (moving) {
      const d = Math.abs(angleDiff(moveAng, this.aimYaw));
      if (d > Math.PI * 0.62) {
        legTarget = moveAng + Math.PI;
        strideSign = -1;
      } else {
        legTarget = moveAng;
      }
    }
    this.legYaw = lerpAngle(this.legYaw, legTarget, Math.min(1, dt * 12));
    this.hips.rotation.y = this.legYaw;
    this.torso.rotation.y = angleDiff(this.aimYaw, this.legYaw);

    // ── 奔跑 / 闪避 / 侧身待机动画 ──
    const dashing = p.dashT > 0;
    const freq = 14.5;
    if (dashing) {
      this.hips.position.y = 0.72;
      this.legL.rotation.x = 0.58;
      this.kneeL.rotation.x = 0.45;
      this.legR.rotation.x = -0.68;
      this.kneeR.rotation.x = 0.72;
      this.torso.rotation.x = 0.34;
    } else if (moving) {
      const s = Math.sin(t * freq) * strideSign;
      const c = Math.cos(t * freq) * strideSign;
      this.hips.position.y = 0.83 + Math.abs(Math.sin(t * freq)) * 0.06;
      this.legL.rotation.x = s * 0.64;
      this.legR.rotation.x = -s * 0.64;
      this.kneeL.rotation.x = Math.max(0, -c) * 0.88;
      this.kneeR.rotation.x = Math.max(0, c) * 0.88;
      this.torso.rotation.x = 0.11 + p.recoil * -0.06;
    } else {
      const breath = Math.sin(t * 2.6);
      this.hips.position.y = 0.83 + breath * 0.012;
      this.legL.rotation.x = lerpAngle(this.legL.rotation.x, -0.18, dt * 10);
      this.legR.rotation.x = lerpAngle(this.legR.rotation.x, 0.14, dt * 10);
      this.kneeL.rotation.x = lerpAngle(this.kneeL.rotation.x, 0.22, dt * 10);
      this.kneeR.rotation.x = lerpAngle(this.kneeR.rotation.x, 0.1, dt * 10);
      this.torso.rotation.x = 0.05 + breath * 0.015 - p.recoil * (p.weapon === 'cn' ? 0.12 : 0.03);
    }

    // ── 次级动态：衣摆、腰带飘带 & 短发随速度弹性飘动 ──
    const speedRatio = dashing ? 1.55 : moving ? 1.0 : 0.16;
    this.coatTail.rotation.x = 0.26 * speedRatio + Math.sin(t * 11) * (moving ? 0.18 : 0.035);
    this.sash.rotation.x = 0.34 * speedRatio + Math.cos(t * 10.5) * (moving ? 0.2 : 0.04);
    this.sash.rotation.y = Math.sin(t * 7.5) * (moving ? 0.14 : 0.04);
    for (const h of this.hairSwings) {
      h.mesh.rotation.x = h.baseRx - speedRatio * 0.14 + Math.sin(t * 9 + h.phase) * (moving ? 0.08 : 0.018);
      h.mesh.rotation.z = h.baseRz + Math.cos(t * 7 + h.phase) * (moving ? 0.05 : 0.012);
    }

    // ── 双武器显示、后坐、换枪与升级可视变化 ──
    this.mgMesh.visible = p.weapon === 'mg';
    this.cnMesh.visible = p.weapon === 'cn';

    const kick = p.weapon === 'cn' ? 0.2 : 0.055;
    this.gunPivot.position.z = 0.32 - p.recoil * kick;
    this.gunPivot.rotation.x = p.swapT > 0
      ? -Math.sin((p.swapT / 0.7) * Math.PI) * 1.15
      : -p.recoil * (p.weapon === 'cn' ? 0.24 : 0.04);

    const meowLv = g.weaponLv('jinx_meow');
    const stackRatio = Math.min(1, meowLv / 6);
    this.mgSpin.rotation.z += dt * (4 + stackRatio * 28);
    this.cnPistonL.position.z = 0.2 - p.recoil * 0.1;
    this.cnPistonR.position.z = 0.2 - p.recoil * 0.1;

    this.mgPierceFin.visible = meowLv >= 6;
    this.cnShardsWing.visible = p.eVolleyLeft > 0;
    this.cnPulseRing.visible = p.rCd <= 0;

    // ── 过载 / 满层 / 推进焰 / 受击状态发光 ──
    const full = meowLv >= 6;
    const over = p.overloadT > 0;

    this.mgGlowMat.emissive.setHex(over || full ? 0x4df9ff : 0x10556e);
    this.mgGlowMat.emissiveIntensity = over ? 2.4 : full ? 1.5 : 0.5;
    this.mgFocusMat.emissiveIntensity = over || full ? 2.2 : 0.75;

    this.cnGlowMat.emissive.setHex(over ? 0xffd24a : 0xff6e12);
    this.cnGlowMat.emissiveIntensity = over ? 2.1 : 0.85 + p.recoil * 1.2;
    this.cnPulseMat.emissiveIntensity = over ? 2.4 : 1.3;

    this.packCoreMat.emissiveIntensity = over ? 2.8 : full ? 2.0 : 1.15 + Math.sin(t * 4) * 0.2;
    this.gogLensMat.emissiveIntensity = over ? 1.8 : 0.9;

    const jetFlicker = 0.75 + Math.sin(t * 45) * 0.25;
    this.packJetMat.opacity = dashing ? 0.9 * jetFlicker : over ? 0.45 * jetFlicker : 0;
    this.heelJetMat.opacity = dashing ? 0.92 * jetFlicker : 0;

    const hurt = p.hurtT > 0.12;
    for (const m of this.pbrMats) {
      m.emissive.setHex(hurt ? 0x992218 : over ? 0x062430 : 0x000000);
    }

    // ── 地面战术光环 ──
    this.facing.rotation.y = this.aimYaw;
    this.facingMat.color.setHex(p.weapon === 'mg' ? 0x32f4ff : 0xffaa2b);
    this.facingMat.opacity = p.swapT > 0 ? 0.35 : 0.92;
    this.auraMat.opacity = over ? 0.55 + Math.sin(t * 18) * 0.25 : 0;
    this.auraRing.scale.setScalar(over ? 1 + Math.sin(t * 10) * 0.08 : 1);
    this.pickupRing.scale.setScalar(g.pickupRadius);
  }
}

```

---

## File: `tools/playtest.ts`

```ts
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

```

---

## File: `tools/compress_assets.mjs`

```mjs
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, quantize, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';

const SRC_DIR = 'c:/七星/游戏/tideline/_assets_raw_backup';
const DST_DIR = 'c:/七星/游戏/tideline/tideline/public/assets';
const MAT_JSON = 'c:/七星/游戏/tideline/tideline/src/sim/map1_materials.json';

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const fmtMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2);

async function main() {
  if (!fs.existsSync(SRC_DIR)) {
    throw new Error(`Raw backup directory missing: ${SRC_DIR}`);
  }

  await MeshoptEncoder.ready;

  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'meshopt.encoder': MeshoptEncoder,
    });

  const files = walk(SRC_DIR);
  const glbs = [];
  const pngs = [];
  const jsons = [];
  const others = [];

  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    if (ext === '.glb') glbs.push(f);
    else if (ext === '.png') pngs.push(f);
    else if (ext === '.json') jsons.push(f);
    else others.push(f);
  }

  // Clean stale .png files in DST_DIR before writing compressed assets
  if (fs.existsSync(DST_DIR)) {
    for (const f of walk(DST_DIR)) {
      if (f.toLowerCase().endsWith('.png')) {
        fs.unlinkSync(f);
      }
    }
  }

  let totalBefore = 0;
  let totalAfter = 0;
  let glbBefore = 0;
  let glbAfter = 0;
  let texBefore = 0;
  let texAfter = 0;
  let jsonBefore = 0;
  let jsonAfter = 0;
  let maxFile = { rel: '', bytes: 0 };

  console.log('\n=== 1. GLB Compression (dedup + quantize [excl TEXCOORD_1] + meshopt) ===');
  for (const srcPath of glbs) {
    const rel = path.relative(SRC_DIR, srcPath).replace(/\\/g, '/');
    const dstPath = path.join(DST_DIR, rel);
    fs.mkdirSync(path.dirname(dstPath), { recursive: true });

    const beforeBytes = fs.statSync(srcPath).size;
    totalBefore += beforeBytes;
    glbBefore += beforeBytes;

    const doc = await io.read(srcPath);
    const root = doc.getRoot();
    const meshCount = root.listMeshes().length;
    const matCount = root.listMaterials().length;
    const animBefore = root.listAnimations().length;

    await doc.transform(
      dedup(),
      quantize({
        quantizePosition: 14,
        quantizeNormal: 10,
        quantizeTexcoord: 12,
        pattern: /^(?!TEXCOORD_1$).*$/,
      }),
      meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
    );

    const animAfter = doc.getRoot().listAnimations().length;
    if (animBefore !== animAfter) {
      throw new Error(`Animation count changed for ${rel}: ${animBefore} -> ${animAfter}`);
    }

    await io.write(dstPath, doc);
    const afterBytes = fs.statSync(dstPath).size;
    totalAfter += afterBytes;
    glbAfter += afterBytes;
    if (afterBytes > maxFile.bytes) maxFile = { rel, bytes: afterBytes };

    const pct = (((beforeBytes - afterBytes) / beforeBytes) * 100).toFixed(1);
    console.log(
      `${rel.padEnd(36)} | meshes:${String(meshCount).padStart(4)} mats:${String(matCount).padStart(3)} anims:${String(animAfter).padStart(2)} | ${fmtMB(beforeBytes)} MB -> ${fmtMB(afterBytes)} MB (-${pct}%)`,
    );
  }

  console.log('\n=== 2. PNG -> WebP Compression ===');
  let pngCount = 0;
  const CONCURRENCY = 8;
  for (let i = 0; i < pngs.length; i += CONCURRENCY) {
    const batch = pngs.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (srcPath) => {
        const relPng = path.relative(SRC_DIR, srcPath).replace(/\\/g, '/');
        const relWebp = relPng.replace(/\.png$/i, '.webp');
        const dstPath = path.join(DST_DIR, relWebp);
        fs.mkdirSync(path.dirname(dstPath), { recursive: true });

        const beforeBytes = fs.statSync(srcPath).size;
        totalBefore += beforeBytes;
        texBefore += beforeBytes;

        let webpOpts;
        if (relPng.startsWith('map1/lightmaps/')) {
          webpOpts = { quality: 92, effort: 5 };
        } else if (/\/(vfx|ui|icons)\//.test('/' + relPng)) {
          webpOpts = { quality: 90, alphaQuality: 95, effort: 5 };
        } else {
          webpOpts = { quality: 84, alphaQuality: 92, effort: 5 };
        }

        await sharp(srcPath).webp(webpOpts).toFile(dstPath);
        const afterBytes = fs.statSync(dstPath).size;
        totalAfter += afterBytes;
        texAfter += afterBytes;
        pngCount++;
        if (afterBytes > maxFile.bytes) maxFile = { rel: relWebp, bytes: afterBytes };
      }),
    );
  }
  console.log(`Converted ${pngCount} PNGs -> WebP: ${fmtMB(texBefore)} MB -> ${fmtMB(texAfter)} MB (-${(((texBefore - texAfter) / texBefore) * 100).toFixed(1)}%)`);

  console.log('\n=== 3. JSON & Other Files ===');
  for (const srcPath of jsons) {
    const rel = path.relative(SRC_DIR, srcPath).replace(/\\/g, '/');
    const dstPath = path.join(DST_DIR, rel);
    fs.mkdirSync(path.dirname(dstPath), { recursive: true });
    const beforeBytes = fs.statSync(srcPath).size;
    const raw = fs.readFileSync(srcPath, 'utf8');
    const minified = JSON.stringify(JSON.parse(raw));
    fs.writeFileSync(dstPath, minified, 'utf8');
    const afterBytes = fs.statSync(dstPath).size;
    totalBefore += beforeBytes;
    totalAfter += afterBytes;
    jsonBefore += beforeBytes;
    jsonAfter += afterBytes;
    if (afterBytes > maxFile.bytes) maxFile = { rel, bytes: afterBytes };
  }
  for (const srcPath of others) {
    const rel = path.relative(SRC_DIR, srcPath).replace(/\\/g, '/');
    const dstPath = path.join(DST_DIR, rel);
    fs.mkdirSync(path.dirname(dstPath), { recursive: true });
    fs.copyFileSync(srcPath, dstPath);
    const sz = fs.statSync(dstPath).size;
    totalBefore += sz;
    totalAfter += sz;
    if (sz > maxFile.bytes) maxFile = { rel, bytes: sz };
  }
  console.log(`JSON (${jsons.length} files): ${fmtMB(jsonBefore)} MB -> ${fmtMB(jsonAfter)} MB`);

  // Update src/sim/map1_materials.json .png -> .webp
  if (fs.existsSync(MAT_JSON)) {
    const matRaw = fs.readFileSync(MAT_JSON, 'utf8');
    const matUpdated = matRaw.replace(/\.png"/g, '.webp"');
    fs.writeFileSync(MAT_JSON, matUpdated, 'utf8');
    console.log(`Updated ${MAT_JSON} (.png -> .webp)`);
  }

  console.log('\n=== SUMMARY ===');
  console.log(`GLB (${glbs.length}):      ${fmtMB(glbBefore)} MB -> ${fmtMB(glbAfter)} MB (-${(((glbBefore - glbAfter) / glbBefore) * 100).toFixed(1)}%)`);
  console.log(`Textures (${pngCount}): ${fmtMB(texBefore)} MB -> ${fmtMB(texAfter)} MB (-${(((texBefore - texAfter) / texBefore) * 100).toFixed(1)}%)`);
  console.log(`JSON (${jsons.length}):     ${fmtMB(jsonBefore)} MB -> ${fmtMB(jsonAfter)} MB`);
  console.log(`TOTAL:        ${fmtMB(totalBefore)} MB -> ${fmtMB(totalAfter)} MB (-${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1)}%)`);
  console.log(`Largest file: ${maxFile.rel} (${fmtMB(maxFile.bytes)} MB)`);

  if (maxFile.bytes >= 25 * 1024 * 1024) {
    throw new Error(`Largest file ${maxFile.rel} exceeds 25 MiB Cloudflare Pages limit!`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

```
