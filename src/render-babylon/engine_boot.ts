/**
 * BAB-01 · B1 双后端初始化（WebGPU → WebGL2 自动回退）、硬件缩放计算与上下文丢失守卫
 * 零外部依赖纯 TypeScript，不 import @babylonjs/core，通过结构化适配器接口直接对接
 * Babylon.WebGPUEngine / Babylon.Engine。
 */

export type BabylonBackend = 'webgpu' | 'webgl2';
export type BackendPreference = 'auto' | BabylonBackend;

export interface DisposableEngineLike {
  dispose(): void;
  setHardwareScalingLevel?(level: number): void;
}

export interface BabylonBackendDrivers<TEngine extends DisposableEngineLike> {
  isWebGpuSupported(): Promise<boolean> | boolean;
  createWebGpuEngine(): Promise<TEngine>;
  createWebGl2Engine(): Promise<TEngine> | TEngine;
}

export interface BackendBootResult<TEngine extends DisposableEngineLike> {
  backend: BabylonBackend;
  engine: TEngine;
  fallbackReason: string | null;
}

/**
 * 严格遵循 render_port.ts 契约：
 * - preference === 'auto' 时先探测 WebGPU；初始化任何阶段抛错都必须先释放半初始化引擎再回退 WebGL2；
 * - preference === 'webgl2' 时直接创建 WebGL2，不触发 WebGPU 探测；
 * - 两个后端均失败时抛出包含双端错误原因的明确异常。
 */
export async function bootBabylonBackend<TEngine extends DisposableEngineLike>(
  drivers: BabylonBackendDrivers<TEngine>,
  preference: BackendPreference = 'auto',
): Promise<BackendBootResult<TEngine>> {
  let fallbackReason: string | null = null;

  if (preference === 'auto' || preference === 'webgpu') {
    let gpuSupported = false;
    try {
      gpuSupported = await drivers.isWebGpuSupported();
    } catch (err) {
      fallbackReason = `webgpu_probe_error: ${err instanceof Error ? err.message : String(err)}`;
    }

    if (gpuSupported) {
      let gpuEngine: TEngine | null = null;
      try {
        gpuEngine = await drivers.createWebGpuEngine();
        return { backend: 'webgpu', engine: gpuEngine, fallbackReason: null };
      } catch (err) {
        if (gpuEngine) {
          try {
            gpuEngine.dispose();
          } catch {
            // ignore secondary dispose errors
          }
        }
        fallbackReason = `webgpu_init_failed: ${err instanceof Error ? err.message : String(err)}`;
        if (preference === 'webgpu') {
          throw new Error(`Forced WebGPU backend failed (${fallbackReason})`);
        }
      }
    } else if (!fallbackReason) {
      fallbackReason = 'webgpu_unsupported';
      if (preference === 'webgpu') {
        throw new Error('Forced WebGPU backend is not supported on this device');
      }
    }
  }

  try {
    const gl2Engine = await drivers.createWebGl2Engine();
    return { backend: 'webgl2', engine: gl2Engine, fallbackReason };
  } catch (err) {
    const gl2Msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Failed to initialize WebGL2 backend (${gl2Msg})${fallbackReason ? `; prior WebGPU fallback: ${fallbackReason}` : ''}`,
    );
  }
}

/** 与 src/render/quality.ts 对齐的最小渲染比例下限 */
export const RENDER_SCALE_FLOOR = 0.58;

/**
 * 将 QualityManager 的 devicePixelRatio、maxDpr、resScale、dynScale 换算为 Babylon.js
 * `engine.setHardwareScalingLevel(level)` 参数（Babylon 约定：level = 1 / effectiveDpr）。
 */
export function computeHardwareScalingLevel(params: {
  devicePixelRatio: number;
  maxDpr: number;
  resScale: number;
  dynScale?: number;
}): { effectiveDpr: number; hardwareScalingLevel: number } {
  const rawDpr = Math.max(1, Number.isFinite(params.devicePixelRatio) ? params.devicePixelRatio : 1);
  const clampedDpr = Math.min(rawDpr, Math.max(1, params.maxDpr));
  const combinedScale = Math.max(RENDER_SCALE_FLOOR, params.resScale * (params.dynScale ?? 1));
  const effectiveDpr = Math.max(RENDER_SCALE_FLOOR, clampedDpr * combinedScale);
  return {
    effectiveDpr,
    hardwareScalingLevel: 1 / effectiveDpr,
  };
}

/**
 * WebGL2 / WebGPU 上下文丢失守卫：丢失期间暂停提交帧，恢复后触发重建回调。
 */
export class ContextLossGuard {
  private lost = false;
  private lostCount = 0;

  isLost(): boolean {
    return this.lost;
  }

  getLostCount(): number {
    return this.lostCount;
  }

  onLost(): boolean {
    if (this.lost) return false;
    this.lost = true;
    this.lostCount += 1;
    return true;
  }

  onRestored(): boolean {
    if (!this.lost) return false;
    this.lost = false;
    return true;
  }
}
