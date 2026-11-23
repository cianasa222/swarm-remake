/**
 * BAB-01 · B1 渲染边界（RenderPort）——引擎无关接口
 *
 * Quick AI（AWS Quick）2026-11-23，编号 BAB-Q01。只含纯 TypeScript 类型，**不 import three / @babylonjs**。
 * 依据：`src/main.ts` 对现有 `src/render/renderer.ts`（Three.js `Renderer`）的全部实际调用（KV 镜像 = main `6962303`）：
 *
 *   new Renderer(canvas, quality) · warmup() · startStage2() · applyQuality() · resize(w, h) · render(dt, game) · dispose()
 *   closeup / closeupAngle / camTargetOverride / camDistScale（调试特写与镜头）
 *   vfx.reduceFlash / vfx.noShake（无障碍选项） · vfx.consumeEvents(game, fxScale, particleBudget)（固定步长循环里每步调用）
 *   gl.info.render.calls / triangles · gl.getPixelRatio()（`?perf=1` 性能面板）
 *
 * 目标：旧 Three 渲染器先包一层实现本接口（行为不变），Babylon 渲染器实现同一接口，`main.ts` 只认接口。
 * 迁移期间同一时刻只创建一个实现（不双跑）。
 *
 * 状态：⚠️ 未编译；接入时以最新 main 的 `main.ts` 调用为准再核对一次。
 */
import type { Game } from '../sim/game';
import type { QualityManager } from '../render/quality';

export type RenderBackend = 'webgpu' | 'webgl2' | 'webgl1-three';

export interface RenderStats {
  backend: RenderBackend;
  drawCalls: number;
  triangles: number;
  /** 实际像素比（已含画质档和动态分辨率） */
  pixelRatio: number;
  /** 可选：活动粒子 / 实例数量，供性能报告 */
  particles?: number;
  instances?: number;
}

export interface RenderCameraControls {
  /** 调试特写镜头 */
  closeup: boolean;
  closeupAngle: number | null;
  /** 固定镜头目标（截图 / 测试场景用），null = 跟随玩家 */
  camTargetOverride: { x: number; y?: number; z: number } | null;
  /** 镜头距离倍率（横竖屏适配之外的额外缩放） */
  camDistScale: number;
}

export interface RenderVfxOptions {
  /** 减弱闪光（无障碍） */
  reduceFlash: boolean;
  /** 关闭震屏（无障碍） */
  noShake: boolean;
}

/**
 * main.ts 依赖的唯一渲染接口。
 * 约束：
 * - 只读 `Game` 状态与 `game.events`，不得修改模拟；
 * - `consumeEvents` 在固定步长循环里每个模拟步调用一次，事件只消费一次；
 * - `render` 每个显示帧调用一次，不自行注册第二个 RAF / render loop；
 * - 画质变化统一经 `applyQuality()`，数据来源仍是现有 `QualityManager`。
 */
export interface RenderPort extends RenderCameraControls {
  readonly vfxOptions: RenderVfxOptions;
  /** 资源预载 + 着色器预热，返回耗时 ms（对应现有 warmup） */
  warmup(): Promise<number>;
  /** 第二阶段资源（精英、首领等）开始加载 */
  startStage2(): void;
  applyQuality(): void;
  resize(width: number, height: number): void;
  /** 每个模拟步调用：把 game.events 转成特效（对应现有 vfx.consumeEvents） */
  consumeEvents(game: Game, fxScale: number, particleBudget: number): void;
  /** 每帧调用 */
  render(dt: number, game: Game): void;
  stats(): RenderStats;
  dispose(): void;
}

/** 创建参数；`backend: 'auto'` 时由实现做能力检测（WebGPU 失败释放后回退 WebGL2） */
export interface RenderPortOptions {
  canvas: HTMLCanvasElement;
  quality: QualityManager;
  backend?: 'auto' | RenderBackend;
}

export type RenderPortFactory = (opts: RenderPortOptions) => Promise<RenderPort>;
