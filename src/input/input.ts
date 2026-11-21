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
      if (e.repeat) { if (['Space', 'KeyQ', 'KeyE', 'KeyR'].includes(e.code)) e.preventDefault(); return; }
      this.keys.add(e.code);
      if (!this.enabled) return;
      if (e.code === 'Space') { this.pressed.add('dash'); e.preventDefault(); }
      if (e.code === 'KeyQ') this.pressed.add('swap');
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
