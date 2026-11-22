import { assetUrl } from '../render/assets';

/**
 * 14.14 无尽狂潮原版音效 + BGM（Web Audio 解码播放）与程序化回退层。
 * 玩家点击「开始任务」时 unlock()：
 *  - 优先播放 `public/assets/audio/` 下解包自 14.14 `Map33.wad.client` + `Strawberry_Jinx.wad.client` 的原版 .ogg 采样；
 *  - 尚未解码完成或离线异常时自动以零延迟程序化合成回退，确保永不静音或报错；
 *  - BGM 严格按 `mus_map33_events.bnk` 切换：仓库区开场序曲 → 主循环 → 雷克塞 Boss 战跨淡 → 胜/负横幅曲。
 */

const SFX = {
  mg: ['jinx/1043413444.ogg', 'jinx/130431412.ogg', 'jinx/411020415.ogg'],
  hit: ['jinx/614751743.ogg', 'jinx/866203971.ogg', 'jinx/960743660.ogg'],
  cannon: [
    'jinx/526696285.ogg',
    'jinx/587825863.ogg',
    'jinx/591246802.ogg',
    'jinx/307280542.ogg',
    'jinx/440425711.ogg',
    'jinx/562132371.ogg',
  ],
  explodeSmall: ['jinx/104918442.ogg', 'jinx/670846690.ogg', 'jinx/995389952.ogg'],
  ultLaunch: [
    'jinx/148352341.ogg',
    'jinx/200261631.ogg',
    'jinx/838897672.ogg',
    'jinx/180615743.ogg',
    'jinx/11902419.ogg',
  ],
  explodeBig: ['jinx/203216632.ogg', 'jinx/568985478.ogg', 'jinx/792144673.ogg'],
  overloadOn: ['jinx/363924523.ogg', 'jinx/913671917.ogg'],
  swap: ['jinx/354688762.ogg', 'jinx/882790590.ogg', 'jinx/926940097.ogg'],
  kill: ['global/238729373.ogg', 'global/285886244.ogg', 'global/298438811.ogg'],
  hurt: ['global/928833039.ogg'],
  xp: ['global/227501606.ogg', 'global/866368322.ogg', 'global/950925974.ogg'],
  heal: ['global/1045116557.ogg', 'global/1062221560.ogg', 'global/320582617.ogg'],
  levelUp: ['global/120178910.ogg', 'global/365957618.ogg', 'global/442822305.ogg'],
  fountainHeal: ['global/521950721.ogg'],
  fountainReady: ['global/805610242.ogg'],
  pick: ['global/710361285.ogg', 'global/824606359.ogg', 'global/996906659.ogg'],
  mine: ['global/1025051443.ogg', 'global/31114098.ogg', 'global/624203928.ogg'],
  mineBurst: ['global/486528941.ogg', 'global/525412726.ogg', 'global/598270482.ogg'],
  pulse: ['global/1047584240.ogg', 'global/134674567.ogg', 'global/204643640.ogg'],
  waveWarn: ['global/635871007.ogg', 'global/896158488.ogg'],
  enemyCharge: ['global/320343260.ogg', 'global/530863552.ogg', 'global/693591703.ogg'],
  enemyShoot: ['global/19790674.ogg', 'global/312389454.ogg', 'global/611199792.ogg'],
  alarm: ['global/321788570.ogg'],
  roar: ['global/260961399.ogg'],
  phase: ['global/1034657497.ogg'],
  slam: ['global/909457680.ogg'],
  whoosh: ['global/41839647.ogg'],
  telegraph: ['global/119365228.ogg'],
} as const;

const BGM = {
  mainIntro: 'music/307974760.ogg',
  mainLoop: 'music/854037489.ogg',
  bossLoop: 'music/71063538.ogg',
  victory: 'music/91455257.ogg',
  defeat: 'music/632537467.ogg',
} as const;

// 14.14 Map33 global bank events.json, not filename guesses. Each group uses a
// small subset of the decoded original variants; additional variants remain in AG-06.
export const WEAPON_SFX = {
  uwuCast: ['global/275484393.ogg', 'global/352030796.ogg'],
  uwuHit: ['global/22552172.ogg', 'global/399931293.ogg'],
  crossbowCast: ['global/218077601.ogg', 'global/334370000.ogg'],
  crossbowEvoCast: ['global/119146350.ogg', 'global/262911115.ogg'],
  crossbowHit: ['global/37590940.ogg', 'global/438421375.ogg'],
  boomerangCast: ['global/862399986.ogg', 'global/905460843.ogg'],
  boomerangHit: ['global/427504408.ogg', 'global/583413365.ogg'],
  boomerangMiniHit: ['global/1026393134.ogg', 'global/12552275.ogg'],
  radiantHit: ['global/1027519524.ogg', 'global/206975371.ogg'],
  cyclonicCast: ['global/172068817.ogg'],
  cyclonicHit: ['global/1060287372.ogg', 'global/198194112.ogg'],
  statikkCast: ['global/1001858887.ogg', 'global/204325424.ogg'],
  statikkHit: ['global/234909725.ogg', 'global/384584966.ogg'],
  starWarning: ['global/559644877.ogg'],
  starExplode: ['global/994089705.ogg'],
  iceblast: SFX.pulse,
  mineCast: SFX.mine,
  mineExplode: SFX.mineBurst,
} as const;
export type WeaponAudioCue = keyof typeof WEAPON_SFX;

const CORE_PRELOAD: readonly string[] = [
  ...SFX.mg,
  ...SFX.hit,
  ...SFX.cannon.slice(0, 3),
  ...SFX.explodeSmall,
  ...SFX.ultLaunch.slice(0, 3),
  ...SFX.explodeBig,
  ...SFX.overloadOn,
  ...SFX.swap.slice(0, 2),
  ...SFX.kill,
  ...SFX.hurt,
  ...SFX.xp,
  ...SFX.heal.slice(0, 2),
  ...SFX.levelUp.slice(0, 2),
  ...SFX.fountainHeal,
  ...SFX.fountainReady,
  ...SFX.pick.slice(0, 2),
  ...SFX.mine.slice(0, 2),
  ...SFX.mineBurst.slice(0, 2),
  ...SFX.pulse.slice(0, 2),
  ...SFX.waveWarn,
  ...Object.values(WEAPON_SFX).map((samples) => samples[0]),
];

interface ActiveBgmNode {
  src: AudioBufferSourceNode;
  gain: GainNode;
}

export class AudioFX {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private last: Record<string, number> = {};
  private lastPickIdx: Record<string, number> = {};
  readonly buffers = new Map<string, AudioBuffer>();
  private inflight = new Map<string, Promise<AudioBuffer | null>>();
  private failed = new Set<string>();
  private preloaded = false;
  private bgmMode: 'none' | 'main' | 'boss' = 'none';
  private bgmGen = 0;
  private bgmActive: ActiveBgmNode[] = [];
  muted = false;
  private volume = 0.62;
  private bgmVolume = 0.36;

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : this.volume;

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 1.0;

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = this.bgmVolume;

      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -12;
      comp.ratio.value = 5;

      this.sfxGain.connect(this.master);
      this.bgmGain.connect(this.master);
      this.master.connect(comp).connect(this.ctx.destination);

      const len = Math.floor(this.ctx.sampleRate * 0.6);
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    if (!this.preloaded) {
      this.preloaded = true;
      this.preloadCoreSfx();
    }
  }

  suspend() { this.ctx?.suspend(); }
  resume() { if (this.ctx && this.ctx.state === 'suspended') void this.ctx.resume(); }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : this.volume;
  }

  getStats() {
    return {
      unlocked: !!this.ctx,
      state: this.ctx?.state ?? 'uninitialized',
      muted: this.muted,
      bgmMode: this.bgmMode,
      activeBgmNodes: this.bgmActive.length,
      decodedCount: this.buffers.size,
      inflightCount: this.inflight.size,
      failedCount: this.failed.size,
    };
  }

  private preloadCoreSfx() {
    for (const rel of CORE_PRELOAD) {
      void this.loadBuffer(rel);
    }
  }

  private loadBuffer(rel: string): Promise<AudioBuffer | null> {
    const existing = this.buffers.get(rel);
    if (existing) return Promise.resolve(existing);
    if (this.failed.has(rel)) return Promise.resolve(null);
    const pending = this.inflight.get(rel);
    if (pending) return pending;
    const ctx = this.ctx;
    if (!ctx) return Promise.resolve(null);

    const url = assetUrl(`audio/${rel}`);
    const p = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.arrayBuffer();
      })
      .then((ab) => ctx.decodeAudioData(ab))
      .then((buf) => {
        this.buffers.set(rel, buf);
        this.inflight.delete(rel);
        return buf;
      })
      .catch(() => {
        this.failed.add(rel);
        this.inflight.delete(rel);
        return null;
      });
    this.inflight.set(rel, p);
    return p;
  }

  private playBuffer(buf: AudioBuffer, vol: number, pitchJitter = 0.04, rate = 1.0, dest?: AudioNode) {
    const c = this.ctx;
    if (!c) return;
    const s = c.createBufferSource();
    s.buffer = buf;
    const jitter = pitchJitter > 0 ? 1 + (Math.random() * 2 - 1) * pitchJitter : 1;
    s.playbackRate.value = Math.max(0.5, Math.min(2.0, rate * jitter));
    const g = c.createGain();
    g.gain.value = vol;
    s.connect(g).connect(dest ?? this.sfxGain ?? this.master!);
    s.start();
  }

  private playSample(
    paths: readonly string[],
    vol = 0.65,
    pitchJitter = 0.04,
    rate = 1.0,
    key?: string,
  ): boolean {
    if (!this.ctx || paths.length === 0) return false;
    const k = key ?? paths[0];
    let idx = Math.floor(Math.random() * paths.length);
    if (paths.length > 1 && idx === this.lastPickIdx[k]) {
      idx = (idx + 1) % paths.length;
    }
    this.lastPickIdx[k] = idx;

    const chosen = paths[idx];
    const cached = this.buffers.get(chosen);
    if (cached) {
      this.playBuffer(cached, vol, pitchJitter, rate);
      return true;
    }

    // 触发后台解码，同时尝试复用同组已解码变体，避免等待
    void this.loadBuffer(chosen);
    for (const alt of paths) {
      const altBuf = this.buffers.get(alt);
      if (altBuf) {
        this.playBuffer(altBuf, vol, pitchJitter, rate);
        return true;
      }
    }
    return false;
  }

  private playOneShotAsync(rel: string, vol: number, fallback: () => void) {
    if (!this.ctx) return;
    const cached = this.buffers.get(rel);
    if (cached) {
      this.playBuffer(cached, vol, 0, 1.0, this.sfxGain ?? this.master!);
      return;
    }
    void this.loadBuffer(rel).then((buf) => {
      if (!this.ctx || this.muted) return;
      if (buf) this.playBuffer(buf, vol, 0, 1.0, this.sfxGain ?? this.master!);
      else fallback();
    });
  }

  // ── BGM 控制器（14.14 Map33 原声带） ──
  startBgm(mode: 'main' | 'boss') {
    if (!this.ctx) this.unlock();
    if (!this.ctx || !this.bgmGain) return;
    if (this.bgmMode === mode && this.bgmActive.length > 0) return;

    const gen = ++this.bgmGen;
    this.bgmMode = mode;
    this.fadeOutActiveBgm(mode === 'boss' ? 0.85 : 0.45);

    if (mode === 'boss') {
      void this.loadBuffer(BGM.bossLoop).then((buf) => {
        if (!buf || gen !== this.bgmGen || !this.ctx) return;
        this.startBgmNode(buf, true, 0.7);
      });
      return;
    }

    // 仓库区开场序曲（307974760.ogg）→ 无缝衔接主循环（854037489.ogg）
    const introP = this.loadBuffer(BGM.mainIntro);
    const loopP = this.loadBuffer(BGM.mainLoop);
    void introP.then((introBuf) => {
      if (gen !== this.bgmGen || !this.ctx) return;
      if (!introBuf) {
        void loopP.then((loopBuf) => {
          if (!loopBuf || gen !== this.bgmGen || !this.ctx) return;
          this.startBgmNode(loopBuf, true, 0.5);
        });
        return;
      }
      const node = this.startBgmNode(introBuf, false, 0.25);
      if (!node) return;
      node.src.onended = () => {
        this.bgmActive = this.bgmActive.filter((n) => n !== node);
        if (gen !== this.bgmGen || !this.ctx) return;
        void loopP.then((loopBuf) => {
          if (!loopBuf || gen !== this.bgmGen || !this.ctx) return;
          this.startBgmNode(loopBuf, true, 0.2);
        });
      };
    });
  }

  stopBgm(fadeSec = 0.45) {
    this.bgmGen++;
    this.bgmMode = 'none';
    this.fadeOutActiveBgm(fadeSec);
  }

  private startBgmNode(buf: AudioBuffer, loop: boolean, fadeInSec: number): ActiveBgmNode | null {
    const c = this.ctx;
    if (!c || !this.bgmGain) return null;
    const src = c.createBufferSource();
    src.buffer = buf;
    src.loop = loop;
    const gain = c.createGain();
    const t = c.currentTime;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(1.0, t + Math.max(0.05, fadeInSec));
    src.connect(gain).connect(this.bgmGain);
    src.start(t);
    const entry: ActiveBgmNode = { src, gain };
    this.bgmActive.push(entry);
    return entry;
  }

  private fadeOutActiveBgm(fadeSec: number) {
    const c = this.ctx;
    const list = this.bgmActive.splice(0, this.bgmActive.length);
    if (!c || list.length === 0) return;
    const t = c.currentTime;
    const dur = Math.max(0.05, fadeSec);
    for (const item of list) {
      item.src.onended = null;
      try {
        item.gain.gain.cancelScheduledValues(t);
        item.gain.gain.setValueAtTime(Math.max(0.0001, item.gain.gain.value), t);
        item.gain.gain.linearRampToValueAtTime(0.0001, t + dur);
        item.src.stop(t + dur + 0.04);
      } catch {
        // 已停止的节点忽略
      }
    }
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
    o.connect(g).connect(this.sfxGain ?? this.master!);
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
    s.connect(f).connect(g).connect(this.sfxGain ?? this.master!);
    s.start(t, Math.random() * 0.3);
    s.stop(t + dur + 0.02);
  }

  // ── 武器 ──
  weaponCue(cue: WeaponAudioCue) {
    const isHit = cue.endsWith('Hit');
    if (!this.gate(`weapon:${cue}`, isHit ? 0.075 : 0.12)) return;
    if (this.playSample(WEAPON_SFX[cue], isHit ? 0.30 : 0.48, 0.025)) return;
    // Keep a quiet fallback while the original clip is loading / unsupported.
    this.tone('triangle', isHit ? 900 : 450, isHit ? 500 : 260, 0.065, 0.055);
  }
  mg(tier: number) {
    if (!this.gate('mg', 0.055)) return;
    if (this.playSample(SFX.mg, tier >= 1 ? 0.44 : 0.36, 0.05, tier >= 1 ? 1.07 : 1.0, 'mg')) return;
    this.noise(0.05, 0.22, 3200 + tier * 600, 2);
    this.tone('square', 1300 + tier * 150, 700, 0.04, 0.05);
  }
  cannon() {
    if (!this.gate('cn', 0.08)) return;
    if (this.playSample(SFX.cannon, 0.68, 0.04, 1.0, 'cn')) return;
    this.tone('sine', 140, 45, 0.28, 0.5);
    this.noise(0.22, 0.35, 600, 0.8, 'lowpass', 0, 150);
  }
  explode(big: boolean) {
    if (!this.gate(big ? 'exb' : 'ex', big ? 0.05 : 0.07)) return;
    if (this.playSample(big ? SFX.explodeBig : SFX.explodeSmall, big ? 0.88 : 0.62, 0.04, 1.0, big ? 'exb' : 'ex')) return;
    this.noise(big ? 0.7 : 0.28, big ? 0.6 : 0.25, big ? 900 : 1400, 0.7, 'lowpass', 0, 90);
    this.tone('sine', big ? 90 : 120, 35, big ? 0.6 : 0.22, big ? 0.5 : 0.22);
  }
  hit() {
    if (!this.gate('hit', 0.045)) return;
    if (this.playSample(SFX.hit, 0.3, 0.06, 1.0, 'hit')) return;
    this.tone('triangle', 900, 500, 0.03, 0.05);
  }
  kill() {
    if (!this.gate('kill', 0.06)) return;
    if (this.playSample(SFX.kill, 0.42, 0.06, 1.0, 'kill')) return;
    this.noise(0.09, 0.1, 2200, 3);
  }
  swap(w: 'mg' | 'cn') {
    if (!this.gate('swap', 0.1)) return;
    if (this.playSample(SFX.swap, 0.56, 0.03, w === 'cn' ? 0.96 : 1.04, 'swap')) return;
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
    if (this.playSample(SFX.mine, 0.52, 0.05, 1.0, 'mine')) return;
    this.tone('square', 300, 520, 0.12, 0.08);
    this.tone('square', 780, 780, 0.05, 0.05, 0.12);
  }
  mineBurst() {
    if (!this.gate('mineb', 0.1)) return;
    if (this.playSample(SFX.mineBurst, 0.62, 0.05, 1.0, 'mineb')) return;
    this.tone('sawtooth', 220, 880, 0.18, 0.12);
    this.tone('sine', 880, 220, 0.4, 0.1, 0.05);
  }
  pulse() {
    if (!this.gate('pulse', 0.12)) return;
    if (this.playSample(SFX.pulse, 0.54, 0.05, 1.0, 'pulse')) return;
    this.tone('sine', 1200, 300, 0.25, 0.14);
  }
  dash() {
    if (!this.gate('dash', 0.1)) return;
    this.noise(0.22, 0.3, 800, 1, 'bandpass', 0, 3000);
  }
  overload(on: boolean) {
    if (!this.gate('ovl' + on, 0.3)) return;
    if (on) {
      if (this.playSample(SFX.overloadOn, 0.72, 0.03, 1.0, 'ovl')) return;
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
    if (this.playSample(SFX.ultLaunch, 0.82, 0.03, 1.0, 'ult')) return;
    this.tone('sawtooth', 90, 40, 0.5, 0.35);
    this.noise(0.45, 0.45, 2000, 0.6, 'lowpass', 0, 200);
    this.tone('sine', 1800, 300, 0.3, 0.12);
  }
  // ── 拾取 / 升级 / 喷泉 ──
  xp() {
    if (!this.gate('xp', 0.04)) return;
    if (this.playSample(SFX.xp, 0.32, 0.08, 1.0, 'xp')) return;
    this.tone('sine', 1500 + Math.random() * 400, 2200, 0.05, 0.05);
  }
  heal() {
    if (!this.gate('heal', 0.2)) return;
    if (this.playSample(SFX.heal, 0.58, 0.03, 1.0, 'heal')) return;
    [523, 659, 784].forEach((f, i) => this.tone('sine', f, f, 0.14, 0.14, i * 0.06));
  }
  levelUp() {
    if (!this.gate('lvl', 0.3)) return;
    if (this.playSample(SFX.levelUp, 0.72, 0.02, 1.0, 'lvl')) return;
    [523, 659, 784, 1046].forEach((f, i) => this.tone('triangle', f, f * 1.01, 0.18, 0.14, i * 0.07));
  }
  fountainHeal() {
    if (!this.gate('fheal', 0.3)) return;
    if (this.playSample(SFX.fountainHeal, 0.75, 0.02, 1.0, 'fheal')) return;
    this.heal();
  }
  fountainReady() {
    if (!this.gate('fready', 0.3)) return;
    if (this.playSample(SFX.fountainReady, 0.62, 0.02, 1.0, 'fready')) return;
    this.swapReady();
  }
  pick() {
    if (!this.gate('pick', 0.08)) return;
    if (this.playSample(SFX.pick, 0.56, 0.03, 1.0, 'pick')) return;
    this.tone('square', 880, 1320, 0.08, 0.08);
  }
  hurt() {
    if (!this.gate('hurt', 0.16)) return;
    if (this.playSample(SFX.hurt, 0.65, 0.04, 1.0, 'hurt')) return;
    this.tone('sawtooth', 220, 90, 0.18, 0.2);
    this.noise(0.12, 0.2, 500, 1);
  }
  // ── 敌人 ──
  enemyCharge(kind: string) {
    if (!this.gate('ech' + kind, 0.25)) return;
    if (this.playSample(SFX.enemyCharge, 0.42, 0.05, kind === 'spitter' ? 1.08 : 0.94, 'ech')) return;
    if (kind === 'spitter') this.tone('sine', 300, 700, 0.5, 0.05);
    else this.tone('sawtooth', 120, 260, 0.6, 0.06);
  }
  enemyShoot() {
    if (!this.gate('esh', 0.1)) return;
    if (this.playSample(SFX.enemyShoot, 0.38, 0.06, 1.0, 'esh')) return;
    this.tone('square', 520, 260, 0.1, 0.05);
  }
  waveWarn(tag?: string) {
    if (!this.gate('wave', 0.6)) return;
    if (this.playSample(SFX.waveWarn, 0.64, 0.02, tag === 'climax' ? 0.94 : 1.0, 'wave')) return;
    const f = tag === 'climax' || tag === 'elite' ? 440 : 660;
    this.tone('triangle', f, f, 0.1, 0.07);
    this.tone('triangle', f, f, 0.1, 0.07, 0.16);
  }
  // ── 首领（雷克塞） ──
  alarm() {
    if (!this.gate('alarm', 0.9)) return;
    if (this.playSample(SFX.alarm, 0.78, 0, 1.0, 'alarm')) return;
    for (let i = 0; i < 3; i++) {
      this.tone('square', 740, 520, 0.35, 0.12, i * 0.45);
    }
  }
  roar() {
    if (!this.gate('roar', 1)) return;
    if (this.playSample(SFX.roar, 0.86, 0.02, 1.0, 'roar')) return;
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
    o.connect(f).connect(g).connect(this.sfxGain ?? this.master!);
    o.start(t); lfo.start(t);
    o.stop(t + 1.6); lfo.stop(t + 1.6);
    this.noise(1.2, 0.3, 400, 0.6, 'lowpass', 0.05, 80);
  }
  slam() {
    if (!this.gate('slam', 0.12)) return;
    if (this.playSample(SFX.slam, 0.82, 0.04, 1.0, 'slam')) return;
    this.tone('sine', 80, 30, 0.45, 0.55);
    this.noise(0.35, 0.4, 500, 0.6, 'lowpass', 0, 80);
  }
  whoosh() {
    if (!this.gate('whoosh', 0.3)) return;
    if (this.playSample(SFX.whoosh, 0.72, 0.04, 1.0, 'whoosh')) return;
    this.noise(0.5, 0.35, 300, 0.8, 'bandpass', 0, 1800);
  }
  telegraph() {
    if (!this.gate('tele', 0.2)) return;
    if (this.playSample(SFX.telegraph, 0.62, 0.03, 1.0, 'tele')) return;
    this.tone('triangle', 980, 980, 0.07, 0.06);
  }
  phase() {
    if (!this.gate('phase', 1)) return;
    if (this.playSample(SFX.phase, 0.88, 0, 1.0, 'phase')) return;
    this.roar();
    [392, 370, 349, 330].forEach((f, i) => this.tone('square', f, f, 0.25, 0.08, 0.3 + i * 0.22));
  }
  victory() {
    this.stopBgm(0.5);
    this.playOneShotAsync(BGM.victory, 0.72, () => {
      [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone('triangle', f, f, 0.3, 0.16, i * 0.12));
    });
  }
  defeat() {
    this.stopBgm(0.5);
    this.playOneShotAsync(BGM.defeat, 0.72, () => {
      [392, 330, 262, 196].forEach((f, i) => this.tone('triangle', f, f * 0.98, 0.35, 0.14, i * 0.18));
    });
  }
  click() {
    if (!this.gate('click', 0.05)) return;
    if (this.playSample(SFX.pick, 0.42, 0.03, 1.06, 'click')) return;
    this.tone('triangle', 1000, 800, 0.05, 0.08);
  }
}
