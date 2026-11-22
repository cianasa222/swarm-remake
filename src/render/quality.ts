import type { Platform } from '../platform/platform';

export type QualitySetting = 'auto' | 'low' | 'medium' | 'high';
export type QualityTier = 'low' | 'medium' | 'high';
export type DetailKey = 'shadows' | 'fx' | 'resolution' | 'teammates';
export type DetailValue = 'auto' | 'off' | 'low' | 'high';

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
  details: Record<DetailKey, DetailValue> = { shadows: 'auto', fx: 'auto', resolution: 'auto', teammates: 'auto' };
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
    try {
      const savedDetails = JSON.parse(platform.load('tideline_quality_details') || '{}');
      for (const key of Object.keys(this.details) as DetailKey[]) {
        if (['auto', 'low', 'high'].includes(savedDetails[key]) || (key === 'shadows' && savedDetails[key] === 'off')) this.details[key] = savedDetails[key];
      }
    } catch { /* old or invalid settings */ }
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
