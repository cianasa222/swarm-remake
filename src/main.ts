import './style.css';
import { MATCH, SIM, ULT } from './config';
import { AudioFX } from './audio/audio';
import { InputManager } from './input/input';
import { webPlatform } from './platform/platform';
import { QualityManager, QualitySetting } from './render/quality';
import { Renderer } from './render/renderer';
import { Game, SimInput } from './sim/game';
import { UPGRADE_BY_ID, UpgradeId } from './sim/upgrades';

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

// ── 升级三选一 ──
const TAG_LABEL: Record<string, string> = { mg: '铆钉机枪', cn: '震荡炮', skill: '战术技能', common: '通用强化' };
let cardsShownForLevel = -1;

function showLevelUp() {
  if (cardsShownForLevel === game.player.level) return;
  cardsShownForLevel = game.player.level;
  input.clear();
  input.enabled = false;
  const wrap = $('cards');
  wrap.innerHTML = '';
  for (const id of game.offer) {
    const def = UPGRADE_BY_ID[id];
    const nextLvl = game.lvl(id) + 1;
    const card = document.createElement('button');
    card.className = 'card';
    card.innerHTML = `
      <span class="card-tag ${def.group}">${TAG_LABEL[def.group]}</span>
      <div class="card-name">${def.name}</div>
      <div class="card-desc">${def.desc(nextLvl)}</div>
    `;
    card.addEventListener('click', () => {
      audio.pick();
      game.chooseUpgrade(id);
      if (game.state === 'levelup') {
        cardsShownForLevel = -1;
        showLevelUp();
      } else {
        levelupModal.classList.add('hidden');
        input.clear();
        input.enabled = true;
      }
    });
    wrap.appendChild(card);
  }
  levelupModal.classList.remove('hidden');
}

// ── 结算界面 ──
function showEnd() {
  input.clear();
  input.enabled = false;
  const won = game.state === 'won';
  $('end-title').textContent = won ? '防线守住 · 断潮督军已击破！' : '防线失守 · 岚已撤离';
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
    else if (ev.type === 'pickup') ev.kind === 'xp' ? audio.xp() : audio.heal();
    else if (ev.type === 'levelUp') audio.levelUp();
    else if (ev.type === 'swap') audio.swap(ev.weapon);
    else if (ev.type === 'swapReady') audio.swapReady();
    else if (ev.type === 'mine') audio.mine();
    else if (ev.type === 'dash') audio.dash();
    else if (ev.type === 'overload') audio.overload(ev.on);
    else if (ev.type === 'ultReady') { audio.ultReady(); showBanner('潮汐贯穿弹已充能完毕 (R)', 2.2); }
    else if (ev.type === 'waveWarn') {
      audio.waveWarn(ev.tag);
      if (ev.tag === 'elite') showBanner('警告：重甲裂甲兽正在逼近！', 2.8);
      else if (ev.tag === 'climax') showBanner('警报：大规模异兽潮逼近防线！', 2.8);
    } else if (ev.type === 'enemyCharge') audio.enemyCharge(ev.kind);
    else if (ev.type === 'enemyShoot') audio.enemyShoot();
    else if (ev.type === 'bossWarn') { audio.alarm(); showBanner('海平面异动！「断潮督军」即将登堤！', 4.0); }
    else if (ev.type === 'bossEnter') { audio.roar(); showBanner('断潮督军 · 登场！', 3.2); }
    else if (ev.type === 'bossLand') audio.slam();
    else if (ev.type === 'bossAttack') {
      if (ev.move === 'sweep') audio.whoosh();
      else audio.telegraph();
    } else if (ev.type === 'bossPhase') { audio.phase(); showBanner('断潮督军进入狂暴二阶段！', 3.0); }
    else if (ev.type === 'fountainHeal') { audio.levelUp(); showBanner(`治愈喷泉已激活！恢复 ${ev.heal} 生命`, 2.6); }
    else if (ev.type === 'fountainReady') { audio.swap('mg'); showBanner('中央治愈喷泉已重新就绪', 2.2); }
    else if (ev.type === 'boxBreak') audio.pick();
    else if (ev.type === 'victory') audio.victory();
    else if (ev.type === 'defeat') audio.defeat();
  }
}

// ── HUD 刷新 ──
function updateHUD() {
  const p = game.player;
  $('hp-fill').style.width = `${Math.max(0, (p.hp / p.maxHp) * 100)}%`;
  $('hp-text').textContent = `${Math.ceil(p.hp)} / ${p.maxHp}`;
  $('xp-fill').style.width = `${Math.min(100, (p.xp / game.xpNeed) * 100)}%`;
  $('xp-text').textContent = `Lv.${p.level}`;
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

  $('overload-badge').classList.toggle('hidden', p.overloadT <= 0);

  // 技能按钮状态
  $('swap-name').textContent = p.weapon === 'mg' ? '机枪' : '震荡炮';
  $('swap-cd').textContent = p.swapT > 0 ? `${p.swapT.toFixed(1)}s` : 'Q 换枪';
  $('btn-swap').classList.toggle('on-cd', p.swapT > 0);

  $('mine-chg').textContent = String(p.mineCharges);
  $('mine-cd').textContent = p.mineCharges < game.mineCharges ? `${p.mineCd.toFixed(1)}s` : 'E';
  $('btn-mine').classList.toggle('on-cd', p.mineCharges === 0);

  const ultPct = Math.floor((p.ult / ULT.chargeNeeded) * 100);
  $('ult-pct').textContent = ultPct >= 100 ? 'R 就绪' : `${ultPct}%`;
  $('btn-ult').classList.toggle('ready', ultPct >= 100);
  $('btn-ult').classList.toggle('on-cd', ultPct < 100);

  $('dash-cd').textContent = p.dashCd > 0 ? `${p.dashCd.toFixed(1)}s` : '空格';
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
    warehouse: [14.5, 22.0],
    park: [-10.0, -18.0],
    barricade: [-18.0, 26.0],
    box: [-4.5, 29.0],
  };
  const spotKey = new URLSearchParams(location.search).get('spot');
  if (spotKey && devSpots[spotKey]) {
    const [sx, sz] = devSpots[spotKey];
    game.player.x = sx;
    game.player.z = sz;
    game.dev.invincible = true;
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

  if (started && !manualPaused && game.state === 'play') {
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

    const st: string = game.state;
    if (st === 'levelup') showLevelUp();
    else if (st === 'won' || st === 'lost') showEnd();
  }

  updateHUD();
  renderer.render(dt, game);
}

requestAnimationFrame(frame);

// 暴露只读调试句柄给自动化验收脚本（不影响正式玩法）
(window as unknown as { __TIDELINE__: unknown }).__TIDELINE__ = { game, quality, renderer };
