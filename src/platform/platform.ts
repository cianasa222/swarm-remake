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
