import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bootBabylonBackend,
  computeHardwareScalingLevel,
  ContextLossGuard,
  RENDER_SCALE_FLOOR,
  type DisposableEngineLike,
} from '../../src/render-babylon/engine_boot';
import {
  WAREHOUSE_SCENE_SPEC,
  computeCameraOffset,
  resolveJinxClipKey,
  REKSAI_RIG_SPEC,
  shouldHideRekSaiSubmesh,
} from '../../src/render-babylon/scene_specs';

test('B1: WebGPU 可用时优先启动 WebGPU，失败时安全回退 WebGL2', async () => {
  const gpuEngine: DisposableEngineLike = { dispose() {} };
  const gl2Engine: DisposableEngineLike = { dispose() {} };

  const okGpu = await bootBabylonBackend({
    isWebGpuSupported: async () => true,
    createWebGpuEngine: async () => gpuEngine,
    createWebGl2Engine: () => gl2Engine,
  });
  assert.equal(okGpu.backend, 'webgpu');
  assert.equal(okGpu.fallbackReason, null);

  const fallbackGl2 = await bootBabylonBackend({
    isWebGpuSupported: async () => true,
    createWebGpuEngine: async () => {
      throw new Error('adapter lost');
    },
    createWebGl2Engine: () => gl2Engine,
  });
  assert.equal(fallbackGl2.backend, 'webgl2');
  assert.match(fallbackGl2.fallbackReason ?? '', /webgpu_init_failed/);

  const forcedGl2 = await bootBabylonBackend(
    {
      isWebGpuSupported: async () => {
        throw new Error('should not probe');
      },
      createWebGpuEngine: async () => gpuEngine,
      createWebGl2Engine: () => gl2Engine,
    },
    'webgl2',
  );
  assert.equal(forcedGl2.backend, 'webgl2');
  assert.equal(forcedGl2.fallbackReason, null);
});

test('B1: 硬件缩放与 ContextLossGuard 状态转换准确', () => {
  const highDesktop = computeHardwareScalingLevel({ devicePixelRatio: 2, maxDpr: 2, resScale: 1, dynScale: 1 });
  assert.equal(highDesktop.effectiveDpr, 2);
  assert.equal(highDesktop.hardwareScalingLevel, 0.5);

  const lowFloor = computeHardwareScalingLevel({ devicePixelRatio: 1, maxDpr: 1.25, resScale: 0.4, dynScale: 0.5 });
  assert.equal(lowFloor.effectiveDpr, RENDER_SCALE_FLOOR);
  assert.ok(Math.abs(lowFloor.hardwareScalingLevel - 1 / RENDER_SCALE_FLOOR) < 1e-9);

  const guard = new ContextLossGuard();
  assert.equal(guard.isLost(), false);
  assert.equal(guard.onLost(), true);
  assert.equal(guard.onLost(), false);
  assert.equal(guard.getLostCount(), 1);
  assert.equal(guard.onRestored(), true);
  assert.equal(guard.isLost(), false);
});

test('B2: 仓库区镜头在横屏与竖屏下严格遵守 1.42 最大拉远倍率', () => {
  const desktop = computeCameraOffset(16 / 9, 1);
  assert.equal(desktop.height, WAREHOUSE_SCENE_SPEC.camera.height);
  assert.equal(desktop.back, WAREHOUSE_SCENE_SPEC.camera.back);

  const tallPhone = computeCameraOffset(9 / 19.5, 1);
  assert.equal(tallPhone.zoomFactor, WAREHOUSE_SCENE_SPEC.camera.portraitMaxZoom);
});

test('B3: 金克丝与雷克塞状态机及隐藏子网格（Wrap/Plane）匹配无误', () => {
  assert.equal(resolveJinxClipKey({ alive: false, castingUlt: true, weapon: 'mg', moving: true, attacking: true }), 'death');
  assert.equal(resolveJinxClipKey({ alive: true, castingUlt: true, weapon: 'cn', moving: false, attacking: false }), 'ult');
  assert.equal(resolveJinxClipKey({ alive: true, castingUlt: false, weapon: 'mg', moving: true, attacking: false, localForward: 0.1, localRight: -0.9 }), 'mg_run_l');
  assert.equal(resolveJinxClipKey({ alive: true, castingUlt: false, weapon: 'cn', moving: true, attacking: true }), 'cn_atk_run');

  assert.equal(REKSAI_RIG_SPEC.clips.length, 17);
  const idleSpec = REKSAI_RIG_SPEC.clips.find((c) => c.key === 'idle')!;
  const spell1Spec = REKSAI_RIG_SPEC.clips.find((c) => c.key === 'attack')!;
  assert.equal(idleSpec.pattern.test('reksai_idle01.anm'), true);
  assert.equal(idleSpec.pattern.test('reksai_idle01_burrowed.anm'), false);
  assert.equal(spell1Spec.pattern.test('reksai_spell1.anm'), true);
  assert.equal(spell1Spec.pattern.test('reksai_spell1_burrowed.anm'), false);

  assert.equal(shouldHideRekSaiSubmesh('Wrap'), true);
  assert.equal(shouldHideRekSaiSubmesh('Plane'), true);
  assert.equal(shouldHideRekSaiSubmesh('Body'), false);
  assert.equal(shouldHideRekSaiSubmesh('Fin'), false);
  assert.equal(shouldHideRekSaiSubmesh('Scale'), false);
});
