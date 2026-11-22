import type { Platform } from '../platform/platform';

export type QualitySetting = 'auto' | 'low' | 'medium' | 'high';
export type QualityTier = 'low' | 'medium' | 'high';
export type DetailKey = 'shadows' | 'fx' | 'resolution' | 'teammates';
export type DetailValue = 'auto' | 'off' | 'low' | 'high';
/** Q-23 帧率上限：0 = 不限（跟随屏幕刷新率） */
export type FrameCap = 0 | 30 | 60;

/** Preserve the target cadence across non-divisor refresh rates (90/144Hz), without catch-up renders. */
export class FrameLimiter {
  private next = -Infinity;
  private cap: FrameCap = 0;

  accept(now: number, cap: FrameCap): boolean {
    if (cap !== this.cap) {
      this.cap = cap;
      this.next = -Infinity;
    }
    if (!cap) return true;
    const interval = 1000 / cap;
    if (now + 0.8 < this.next) return false;
    if (!Number.isFinite(this.next) || now - this.next > interval * 2) this.next = now + interval;
    else this.next += interval * Math.max(1, Math.floor((now - this.next) / interval) + 1);
    return true;
  }
}

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

/** Q-23 动态分辨率：档内在 [DYN_MIN, 1] 之间按 DYN_STEP 平滑调整，两次调整至少间隔 DYN_GAP 秒 */
const DYN_MIN = 0.75;
const DYN_STEP = 0.05;
const DYN_GAP = 1.5;
/** 实际渲染比例下限（再低画面会明显发糊） */
const RES_FLOOR = 0.58;
/** 降档后多久内不允许升回被降掉的那一档（防止 60 帧上限下来回跳） */
const UPGRADE_BLOCK_SEC = 60;

const TIER_ORDER: QualityTier[] = ['low', 'medium', 'high'];

/**
 * 画质管理器：
 * - 首次进入依据设备信息保守推荐
 * - 自动档用平滑帧时间 + 滞回 + 冷却（至少 8 秒不重复升降）避免来回跳变
 * - Q-23：掉帧时**先在档内降分辨率**（动态分辨率），降到底仍掉帧才降档；帧时间判断以帧率上限为基准
 * - 降低画质时仅缩减装饰粒子、分辨率与实时阴影；核心弹幕/预警/命中反馈始终可见
 */
export class QualityManager {
  setting: QualitySetting = 'auto';
  active: QualityTier = 'medium';
  recommended: QualityTier;
  details: Record<DetailKey, DetailValue> = { shadows: 'auto', fx: 'auto', resolution: 'auto', teammates: 'auto' };
  /** Q-23 帧率上限；手机默认 60，桌面默认不限。可用 `?fps=30|60|0` 或 localStorage `tideline_fpscap` 覆盖 */
  frameCap: FrameCap;
  /** Q-23 档内动态分辨率倍率（乘在 spec.resScale 上）；手动档固定为 1 */
  dynScale = 1;
  private emaMs = 16.6;
  private lastSwitchAt = -10;
  private lastDynAt = -10;
  private badSec = 0;
  private goodSec = 0;
  private dynBadSec = 0;
  private dynGoodSec = 0;
  private blockedTier: QualityTier | null = null;
  private blockedUntil = 0;

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
    try {
      const savedDetails = JSON.parse(platform.load('tideline_quality_details') || '{}');
      for (const key of Object.keys(this.details) as DetailKey[]) {
        if (['auto', 'low', 'high'].includes(savedDetails[key]) || (key === 'shadows' && savedDetails[key] === 'off')) this.details[key] = savedDetails[key];
      }
    } catch { /* old or invalid settings */ }

    let cap: FrameCap = d.mobile ? 60 : 0;
    const savedCap = platform.load('tideline_fpscap');
    if (savedCap === '0' || savedCap === '30' || savedCap === '60') cap = Number(savedCap) as FrameCap;
    try {
      const q = new URLSearchParams(location.search).get('fps');
      if (q === '0' || q === '30' || q === '60') cap = Number(q) as FrameCap;
    } catch {
      /* 非浏览器环境忽略 */
    }
    this.frameCap = cap;
  }

  get spec(): QualitySpec {
    const base = QUALITY_SPECS[this.active];
    const d = this.details;
    return { ...base, shadows: d.shadows === 'auto' ? base.shadows : d.shadows !== 'off',
      fxScale: d.fx === 'auto' ? base.fxScale : d.fx === 'low' ? .45 : 1,
      particleBudget: d.fx === 'auto' ? base.particleBudget : d.fx === 'low' ? 180 : 800,
      resScale: d.resolution === 'auto' ? base.resScale : d.resolution === 'low' ? .78 : 1,
      maxDpr: d.resolution === 'auto' ? base.maxDpr : d.resolution === 'low' ? 1.25 : 2 };
  }

  setDetail(key: DetailKey, value: DetailValue) {
    this.details[key] = value;
    this.platform.save('tideline_quality_details', JSON.stringify(this.details));
    if (key === 'resolution') this.dynScale = 1; // Q-23：手动指定分辨率时关闭动态分辨率
  }

  /** Q-23 实际 3D 渲染比例 = 档位基准 × 动态倍率（不低于 RES_FLOOR） */
  get resScale(): number {
    const s = this.spec;
    if (this.details.resolution !== 'auto') return s.resScale; // GPT-05 细节画质里手动指定了分辨率
    return Math.max(RES_FLOOR, s.resScale * this.dynScale);
  }

  /** 目标帧间隔（毫秒）。不限帧时按 60 帧计 */
  get targetMs(): number {
    return this.frameCap > 0 ? 1000 / this.frameCap : 1000 / 60;
  }

  /** 平滑后的帧时间（调试面板用） */
  get smoothedMs(): number {
    return this.emaMs;
  }

  setFrameCap(cap: FrameCap) {
    this.frameCap = cap;
    this.platform.save('tideline_fpscap', String(cap));
    this.badSec = this.goodSec = this.dynBadSec = this.dynGoodSec = 0;
  }

  setSetting(s: QualitySetting, nowSec: number) {
    this.setting = s;
    this.platform.save('tideline_quality', s);
    this.active = s === 'auto' ? this.recommended : s;
    this.dynScale = 1;
    this.lastSwitchAt = nowSec;
    this.lastDynAt = nowSec;
    this.badSec = 0;
    this.goodSec = 0;
    this.dynBadSec = 0;
    this.dynGoodSec = 0;
    this.blockedTier = null;
  }

  /** 每帧调用，返回是否需要重新应用画质（档位或动态分辨率变化） */
  sampleFrame(dtMs: number, nowSec: number): boolean {
    if (dtMs > 0 && dtMs < 200) {
      this.emaMs = this.emaMs * 0.92 + dtMs * 0.08;
    }
    if (this.setting !== 'auto') return false;

    const dtSec = Math.min(0.1, dtMs / 1000);
    const target = this.targetMs;
    // 滞回阈值（以目标帧间隔为基准；60 帧时 = 原来的 24ms / 约 17.5ms）
    const badMs = Math.max(24, target * 1.45);
    const dynBadMs = target * 1.2;
    const goodMs = target * 1.05;

    // ── 1) 档内动态分辨率（细节画质里手动指定分辨率时跳过） ──
    if (this.emaMs > dynBadMs) {
      this.dynBadSec += dtSec;
      this.dynGoodSec = 0;
    } else if (this.emaMs < goodMs) {
      this.dynGoodSec += dtSec;
      this.dynBadSec = 0;
    } else {
      this.dynBadSec = Math.max(0, this.dynBadSec - dtSec * 0.5);
      this.dynGoodSec = Math.max(0, this.dynGoodSec - dtSec * 0.5);
    }
    const dynOn = this.details.resolution === 'auto';
    if (!dynOn) this.dynScale = 1;
    if (dynOn && nowSec - this.lastDynAt >= DYN_GAP) {
      if (this.dynBadSec > 0.8 && this.dynScale > DYN_MIN + 1e-3) {
        this.dynScale = Math.max(DYN_MIN, this.dynScale - DYN_STEP);
        this.lastDynAt = nowSec;
        this.dynBadSec = 0;
        return true;
      }
      if (this.dynGoodSec > 3.0 && this.dynScale < 1 - 1e-3) {
        this.dynScale = Math.min(1, this.dynScale + DYN_STEP);
        this.lastDynAt = nowSec;
        this.dynGoodSec = 0;
        return true;
      }
    }

    // ── 2) 升降档（冷却 8 秒） ──
    if (nowSec - this.lastSwitchAt < 8) return false;
    const idx = TIER_ORDER.indexOf(this.active);
    if (this.emaMs > badMs && this.active !== 'low') {
      this.goodSec = 0;
      // 动态分辨率还没降到底时先不降档
      if (dynOn && this.dynScale > DYN_MIN + 1e-3) return false;
      this.badSec += dtSec;
      if (this.badSec > 2.5) {
        this.blockedTier = this.active;
        this.blockedUntil = nowSec + UPGRADE_BLOCK_SEC;
        this.active = TIER_ORDER[idx - 1];
        this.dynScale = 1;
        this.lastSwitchAt = nowSec;
        this.lastDynAt = nowSec;
        this.badSec = 0;
        return true;
      }
    } else if (this.emaMs < Math.min(14.5, goodMs) || (this.frameCap > 0 && this.emaMs < goodMs)) {
      // 不限帧：沿用原阈值 14.5ms；有帧率上限：稳定贴着上限且分辨率已满才升档
      if (this.active === 'high' || this.dynScale < 1 - 1e-3) return false;
      const next = TIER_ORDER[idx + 1];
      if (next === this.blockedTier && nowSec < this.blockedUntil) return false;
      this.goodSec += dtSec;
      this.badSec = 0;
      if (this.goodSec > 6.0) {
        this.active = next;
        this.dynScale = 1;
        this.lastSwitchAt = nowSec;
        this.lastDynAt = nowSec;
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
