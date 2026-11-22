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
