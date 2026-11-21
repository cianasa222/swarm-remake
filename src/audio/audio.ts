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
