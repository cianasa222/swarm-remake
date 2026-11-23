/**
 * Patch 14.14 原版音频事件 ↔ 音轨哈希对照与运行时分发辅助（UIA-1 / UIA-2 / UIA-3）
 * 数据源：asset/14.14-unpacked-assets-20261123 的 global/events.json（280 命名事件 / 656 音轨）
 *        与 music/events.json（6 命名事件 / 46 音轨），按 QC-15 武器身份更正核对。
 * 零外部依赖，可直接被 src/audio/audio.ts 与 Babylon.js 音频层复用。
 */

export type CurrentEnemyKind = 'crawler' | 'spitter' | 'charger' | 'elite' | 'boss';
export type CrawlerVariant = 'pix' | 'ghoul';

/**
 * UIA-1：9 把副武器完整 14.14 原版音效事件表（按 QC-15 纠正：
 * - 十字弩 = pierceshot*（非 scatterarrows*）
 * - 旋风切割器 = holybauble*（非 circleshot*）
 * - 战兔巨爆 = starstrike*（非 nuke*）
 * ）
 */
export const WEAPON_SFX_EXTENDED_14_14 = {
  // 1. UwU 魔爆枪（RapidShot）
  uwuCast: ['global/275484393.ogg', 'global/352030796.ogg', 'global/967786192.ogg', 'global/978149693.ogg'],
  uwuHit: ['global/22552172.ogg', 'global/399931293.ogg', 'global/934021077.ogg', 'global/976226001.ogg'],
  // 进化版与基础版在 14.14 global/events.json 中共用相同 4 条发射/命中哈希

  // 2. 十字弩（PierceShot，QC-15 更正）
  crossbowCast: ['global/218077601.ogg', 'global/334370000.ogg', 'global/417761800.ogg'],
  crossbowPreCast: ['global/569613682.ogg', 'global/597238142.ogg', 'global/75538993.ogg', 'global/8902771.ogg'],
  crossbowEvoCast: ['global/119146350.ogg', 'global/262911115.ogg'],
  crossbowHit: [
    'global/37590940.ogg',
    'global/438421375.ogg',
    'global/458691703.ogg',
    'global/631083431.ogg',
    'global/654137121.ogg',
    'global/680540083.ogg',
    'global/760749351.ogg',
    'global/907566307.ogg',
  ],

  // 3. 回旋刃（Boomerang）— 补齐返程与进化小飞刃事件
  boomerangCast: ['global/862399986.ogg', 'global/905460843.ogg'],
  boomerangReturn: ['global/648459546.ogg', 'global/707729322.ogg'],
  boomerangEvoReturn: ['global/199453683.ogg', 'global/236701451.ogg'],
  boomerangHit: ['global/427504408.ogg', 'global/583413365.ogg', 'global/826982021.ogg'],
  boomerangMiniCast: [
    'global/1063282412.ogg',
    'global/116442316.ogg',
    'global/182117459.ogg',
    'global/299712216.ogg',
    'global/5618198.ogg',
  ],
  boomerangMiniHit: ['global/1026393134.ogg', 'global/12552275.ogg', 'global/415045480.ogg', 'global/828498344.ogg'],

  // 4. 旋风切割器（HolyBauble，QC-15 更正）— 补齐收束事件
  cyclonicCast: ['global/172068817.ogg', 'global/869815710.ogg'],
  cyclonicDeactivate: ['global/869815710.ogg'],
  cyclonicHit: ['global/1060287372.ogg', 'global/198194112.ogg', 'global/984900610.ogg'],

  // 5. 斯塔缇克电刃（StatikkShiv）
  statikkCast: [
    'global/1001858887.ogg',
    'global/204325424.ogg',
    'global/320642320.ogg',
    'global/57467479.ogg',
    'global/604361299.ogg',
    'global/832552480.ogg',
  ],
  statikkHit: ['global/234909725.ogg', 'global/384584966.ogg', 'global/412730289.ogg', 'global/642870227.ogg'],

  // 6. 耀光力场（HollowRadiance）
  radiantHit: [
    'global/1027519524.ogg',
    'global/206975371.ogg',
    'global/40795437.ogg',
    'global/522537690.ogg',
    'global/639156319.ogg',
    'global/854285640.ogg',
  ],

  // 7. 地雷（Mine）— 补齐落地激活事件
  mineCast: ['global/1025051443.ogg', 'global/31114098.ogg', 'global/624203928.ogg'],
  mineArm: ['global/1067684107.ogg', 'global/196758714.ogg', 'global/33989928.ogg', 'global/706547561.ogg'],
  mineExplode: ['global/486528941.ogg', 'global/525412726.ogg', 'global/598270482.ogg'],

  // 8. 战兔巨爆（StarStrike，QC-15 更正）
  starWarning: ['global/559644877.ogg'],
  starExplode: ['global/994089705.ogg'],

  // 9. 冰爆护甲（FrostNova）— 补齐就绪事件
  iceblastReady: ['global/606260377.ogg'],
  iceblastExplode: [
    'global/1047584240.ogg',
    'global/134674567.ogg',
    'global/204643640.ogg',
    'global/230159816.ogg',
    'global/304376004.ogg',
    'global/324589268.ogg',
    'global/367172209.ogg',
    'global/735394503.ogg',
  ],
} as const;

export type ExtendedWeaponAudioCue = keyof typeof WEAPON_SFX_EXTENDED_14_14;

/**
 * UIA-2：14.14 敌人按怪种死亡音效表（来自 global/events.json 全部 22 组死亡事件）
 */
export const ENEMY_DEATH_SFX_14_14 = {
  pix: [
    'global/312848139.ogg',
    'global/371025373.ogg',
    'global/577766980.ogg',
    'global/623690970.ogg',
    'global/794114414.ogg',
    'global/920899933.ogg',
  ],
  basicMelee: ['global/181571615.ogg', 'global/321846344.ogg', 'global/79180957.ogg'],
  hunter: [
    'global/122258074.ogg',
    'global/515733205.ogg',
    'global/516305754.ogg',
    'global/787374365.ogg',
    'global/880966256.ogg',
    'global/8963142.ogg',
  ],
  miniDasher: [
    'global/1053037764.ogg',
    'global/166078121.ogg',
    'global/54523712.ogg',
    'global/732831246.ogg',
    'global/862646226.ogg',
  ],
  bruiser: ['global/238729373.ogg', 'global/285886244.ogg', 'global/298438811.ogg', 'global/834380146.ogg'],
  minibossBruiser: ['global/308623664.ogg', 'global/348804465.ogg', 'global/879856989.ogg'],
  minibossDasher: ['global/1033508734.ogg', 'global/342171107.ogg', 'global/350033945.ogg', 'global/944734753.ogg'],
  minibossArtillery: [
    'global/112523393.ogg',
    'global/263103438.ogg',
    'global/466618297.ogg',
    'global/641064586.ogg',
    'global/645808889.ogg',
    'global/751177836.ogg',
    'global/763925730.ogg',
    'global/858521949.ogg',
  ],
  swarmer: ['global/312358440.ogg', 'global/733017318.ogg', 'global/763919579.ogg', 'global/824381090.ogg', 'global/840945668.ogg'],
  shy: ['global/256779848.ogg', 'global/522386974.ogg', 'global/529836062.ogg', 'global/764143749.ogg', 'global/892045084.ogg'],
  red: ['global/208938507.ogg', 'global/2178469.ogg', 'global/219206995.ogg', 'global/338439115.ogg', 'global/634747327.ogg'],
  exploder: ['global/763099844.ogg', 'global/828732401.ogg'],
  fuemigo: ['global/154808718.ogg', 'global/759211085.ogg', 'global/881993485.ogg', 'global/902962644.ogg', 'global/925024207.ogg'],
  lancer: [
    'global/1038720905.ogg',
    'global/122427196.ogg',
    'global/540909656.ogg',
    'global/707623693.ogg',
    'global/75682438.ogg',
    'global/780421818.ogg',
  ],
  shield: ['global/280684415.ogg', 'global/367418066.ogg', 'global/518757272.ogg', 'global/681330609.ogg', 'global/97350998.ogg'],
  fast: ['global/228002481.ogg', 'global/297449171.ogg', 'global/438614923.ogg', 'global/64111912.ogg', 'global/669823219.ogg'],
  divider: ['global/1035436999.ogg', 'global/486883634.ogg', 'global/53009639.ogg', 'global/931125542.ogg'],
  hound: ['global/132238155.ogg', 'global/17629576.ogg', 'global/303552994.ogg', 'global/606232610.ogg', 'global/694176108.ogg'],
  ram: ['global/294970358.ogg', 'global/468872478.ogg', 'global/580089207.ogg'],
  healer: ['global/1024922898.ogg', 'global/314187846.ogg', 'global/589761748.ogg'],
  poisonous: ['global/1056233717.ogg', 'global/335335733.ogg', 'global/613483997.ogg', 'global/70360792.ogg', 'global/889381431.ogg'],
  cannon: ['global/1034517020.ogg', 'global/355755547.ogg', 'global/449016226.ogg', 'global/865077539.ogg', 'global/869114796.ogg'],
  mechaMinion: ['global/125526622.ogg', 'global/663508087.ogg', 'global/74418112.ogg', 'global/756912785.ogg'],
} as const;

export type EnemyDeathSpecies = keyof typeof ENEMY_DEATH_SFX_14_14;

/**
 * 将当前模拟层 kill 事件的 kind/variant 路由到 14.14 原版死亡音轨组。
 * 注意：当前主线 main 仅内置 bruiser 前 3 条；接入新怪种前需同步对应 .ogg（见下方清单），
 * 未同步时由调用方自动回退到 ENEMY_DEATH_SFX_14_14.bruiser。
 */
export function resolveEnemyDeathSfx(
  kind: CurrentEnemyKind,
  variant?: CrawlerVariant,
): readonly string[] {
  switch (kind) {
    case 'crawler':
      return variant === 'pix' ? ENEMY_DEATH_SFX_14_14.pix : ENEMY_DEATH_SFX_14_14.basicMelee;
    case 'spitter':
      return ENEMY_DEATH_SFX_14_14.hunter;
    case 'charger':
      return ENEMY_DEATH_SFX_14_14.miniDasher;
    case 'elite':
      return ENEMY_DEATH_SFX_14_14.minibossBruiser;
    case 'boss':
      return ENEMY_DEATH_SFX_14_14.minibossBruiser;
  }
}

/**
 * 补给箱破碎、掉落拾取与公告等世界音效核对结果
 */
export const WORLD_SFX_14_14 = {
  /** 原版 Play_sfx_Strawberry_Destructible_Barrell_break_buffactivate（替代 main.ts 借用 pick()） */
  boxBreak: ['global/382785855.ogg', 'global/910166186.ogg', 'global/973490012.ogg'],
  /** 原版 Play_sfx_Strawberry_Drop_XP_Orb_Missile_hit（与现有 SFX.xp 一致，补第 4 条变体） */
  xpPickup: ['global/227501606.ogg', 'global/866368322.ogg', 'global/950925974.ogg', 'global/993022386.ogg'],
  /**
   * 重要核对发现：现有 SFX.levelUp 使用的 120178910/365957618/442822305
   * 在 global/events.json 中实际属于 Play_sfx_Strawberry_Rebuild_drop_gold_missile_OnHit（金币拾取）。
   */
  goldPickup: [
    'global/120178910.ogg',
    'global/365957618.ogg',
    'global/442822305.ogg',
    'global/526553543.ogg',
    'global/892577156.ogg',
  ],
  fountainHeal: ['global/521950721.ogg'],
  fountainReady: ['global/805610242.ogg'],
  reksaiAnnouncement: ['global/321788570.ogg'],
  playerDeath: ['global/159370304.ogg'],
} as const;

/**
 * UIA-3：music/events.json（6 命名事件 / 46 音轨）核对结果
 */
export const BGM_MANIFEST_14_14 = {
  verified: {
    mainIntroMapA: { path: 'music/307974760.ogg', event: 'Play_mus_map33_game_start_MapA' },
    victoryBanner: { path: 'music/91455257.ogg', event: 'Play_sfx_Env_SRUAP_Victory_Banner' },
    defeatBanner: { path: 'music/632537467.ogg', event: 'Play_sfx_Evn_SRUAP_Defeat_Banner' },
  },
  unverifiedMusicSegments: {
    mainLoop: 'music/854037489.ogg',
    bossLoop: 'music/71063538.ogg',
    note: '未出现在 music/events.json 的 6 个普通 Sound Event 中，属 Wwise Interactive Music Segment；mid_game / late_game 切换段需后续解析 music .bnk 的 Music Switch Container 后才能精确绑定。',
  },
} as const;

/**
 * 当前玩法立刻启用 UIA-1 缺口 + UIA-2 4 类怪种 + 补给箱破碎所需的最小增量 .ogg 同步清单
 * （来源：asset/14.14-unpacked-assets-20261123 分支 public/assets/audio/）
 */
export const MINIMAL_ASSET_SYNC_FILES: readonly string[] = [
  // UIA-1 副武器新增事件（每组先同步前 2 条，控体积）
  'global/648459546.ogg',
  'global/707729322.ogg',
  'global/199453683.ogg',
  'global/236701451.ogg',
  'global/1063282412.ogg',
  'global/116442316.ogg',
  'global/869815710.ogg',
  'global/606260377.ogg',
  'global/1067684107.ogg',
  'global/196758714.ogg',
  // 补给箱破碎（替换借用 pick()）
  'global/382785855.ogg',
  'global/910166186.ogg',
  'global/973490012.ogg',
  // UIA-2 当前 4 类在场怪种死亡（pix / basicMelee / hunter / miniDasher / minibossBruiser，每类前 2 条）
  'global/312848139.ogg',
  'global/371025373.ogg',
  'global/181571615.ogg',
  'global/321846344.ogg',
  'global/122258074.ogg',
  'global/515733205.ogg',
  'global/1053037764.ogg',
  'global/166078121.ogg',
  'global/308623664.ogg',
  'global/348804465.ogg',
];
