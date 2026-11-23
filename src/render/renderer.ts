import * as THREE from 'three';
import type { Game } from '../sim/game';
import { setWarmupMs } from './assets';
import { EntityRenderer } from './entities';
import { buildSunnyEnv } from './env';
import { buildWarehouseWorld } from './map_warehouse';
import type { QualityManager } from './quality';
import { VfxRenderer } from './vfx';
import type { WorldView } from './world';

/**
 * 渲染总控：
 * - 窄 FOV 透视斜俯视相机（贴合《无尽狂潮》仓库区视野与俯角），横竖屏自适应拉高
 * - 与战斗模拟完全解耦，只读取 Game 状态与 events
 */
export class Renderer {
  readonly gl: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly cam = new THREE.PerspectiveCamera(40, 1, 0.5, 280);
  readonly closeupCam = new THREE.PerspectiveCamera(34, 1, 0.1, 120);
  readonly world: WorldView;
  readonly entities: EntityRenderer;
  readonly vfx: VfxRenderer;

  closeup = false;
  closeupAngle: number | null = null;
  camTargetOverride: { x: number; y?: number; z: number } | null = null;
  camDistScale = 1;
  cameraHeight = 1;
  private envTex: THREE.Texture;
  private camX = -9.45;
  private camZ = 5.6;
  private w = 1;
  private h = 1;

  constructor(canvas: HTMLCanvasElement, private quality: QualityManager, private mobile = false) {
    this.gl = new THREE.WebGLRenderer({
      canvas,
      antialias: quality.spec.tier !== 'low',
      powerPreference: 'high-performance',
    });
    this.gl.outputColorSpace = THREE.SRGBColorSpace;
    this.gl.toneMapping = THREE.NeutralToneMapping;
    this.gl.toneMappingExposure = 1.08;
    this.gl.shadowMap.enabled = quality.spec.shadows;
    this.gl.shadowMap.type = THREE.PCFSoftShadowMap;

    this.envTex = buildSunnyEnv(this.gl);
    this.scene.environment = this.envTex;
    this.scene.environmentIntensity = 0.40;

    this.world = buildWarehouseWorld(this.scene, this.gl);
    // 紧缩实时阴影视锥以提升角色与建筑阴影清晰度
    const sc = this.world.sun.shadow.camera;
    sc.left = -28; sc.right = 28; sc.top = 28; sc.bottom = -28;
    sc.updateProjectionMatrix();

    this.entities = new EntityRenderer(this.scene);
    this.vfx = new VfxRenderer(this.scene);
    this.entities.attachJinxVfx(this.vfx.jinxVfx);
    this.vfx.attachWeaponVfx(this.entities.weaponVfx);

    this.applyQuality();
    this.resize(window.innerWidth, window.innerHeight);
  }

  async warmup(): Promise<number> {
    const t0 = performance.now();
    await Promise.all([
      this.world.ready ?? Promise.resolve(),
      this.entities.heroReady(),
    ]);
    try {
      this.gl.compile(this.scene, this.cam);
    } catch (err) {
      console.warn('[Renderer] shader warmup skipped:', err);
    }
    const ms = performance.now() - t0;
    setWarmupMs(ms);
    return ms;
  }

  startStage2() {
    this.entities.loadStage2();
  }

  applyQuality() {
    const s = this.quality.spec;
    const dpr = Math.min(window.devicePixelRatio || 1, s.maxDpr) * this.quality.resScale; // Q-23：含档内动态分辨率
    this.gl.setPixelRatio(dpr);
    this.gl.setSize(this.w, this.h, false);
    this.gl.shadowMap.enabled = s.shadows;
    this.world.setShadows(s.shadows);
    const size = this.quality.details.shadows === 'low' ? 1024 : 2048;
    const shadow = this.world.sun.shadow;
    if (shadow.mapSize.x !== size) {
      shadow.map?.dispose();
      shadow.map = null;
      shadow.mapSize.set(size, size);
    }
    this.vfx.jinxVfx.teammateVfxScale = this.quality.details.teammates === 'low' ? .3 : 1;
  }

  resize(w: number, h: number) {
    this.w = Math.max(1, w);
    this.h = Math.max(1, h);
    this.applyQuality();
    const aspect = this.w / this.h;
    this.cam.aspect = aspect;
    this.cam.updateProjectionMatrix();
    this.closeupCam.aspect = aspect;
    this.closeupCam.updateProjectionMatrix();
  }

  render(dt: number, g: Game) {
    const s = this.quality.spec;
    this.vfx.consumeEvents(g, s.fxScale, s.particleBudget);
    this.vfx.update(dt, g);
    this.entities.update(g, dt);
    this.world.update(g.clock, g.missionProgress, g.bossAlarm, g.warnings, s.tier, g.fountain);

    // 跟随玩家的高精阴影中心（按 0.5m 步长对齐，避免阴影边缘抖动，对齐官方 sunDirection）
    const sx0 = Math.round(g.player.x * 2) * 0.5;
    const sz0 = Math.round(g.player.z * 2) * 0.5;
    this.world.sun.target.position.set(sx0, 0, sz0);
    this.world.sun.position.set(sx0 - 24, 34, sz0 + 28);
    this.world.sun.target.updateMatrixWorld();

    if (this.closeup) {
      const p = g.player;
      const yaw = Math.atan2(p.faceX, p.faceZ);
      const sway = this.closeupAngle ?? (Math.sin(g.clock * 0.65) * 0.48 + 0.14);
      const a = yaw + sway;
      const dist = 4.45;
      this.closeupCam.position.set(p.x + Math.sin(a) * dist, 1.92, p.z + Math.cos(a) * dist);
      this.closeupCam.lookAt(p.x, 1.02, p.z);
      this.gl.render(this.scene, this.closeupCam);
      return;
    }

    // 窄 FOV 斜俯视透视跟随（竖屏适当拉高以覆盖周围 20-23m 刷怪圈）
    const tx = this.camTargetOverride ? this.camTargetOverride.x : g.player.x;
    const ty = this.camTargetOverride?.y ?? 0;
    const tz = this.camTargetOverride ? this.camTargetOverride.z : g.player.z;
    const k = this.camTargetOverride ? 1 : Math.min(1, dt * 8);
    this.camX += (tx - this.camX) * k;
    this.camZ += (tz - this.camZ) * k;
    const aspect = this.w / this.h;
    let framing = aspect < 1 ? Math.min(1.42, 1 / Math.sqrt(aspect)) : 1;
    if (this.mobile && aspect > 1 && !this.camTargetOverride) {
      // Restore readable player framing on very wide phones without changing sim/FOV.
      framing = Math.max(0.66, Math.min(1, 1.95 / aspect));
    }
    const pScale = framing * this.camDistScale * (this.camTargetOverride ? 1 : this.cameraHeight);
    const shk = this.vfx.shake;
    const sx = shk > 0 ? (Math.random() - 0.5) * shk * 1.4 : 0;
    const sz = shk > 0 ? (Math.random() - 0.5) * shk * 1.4 : 0;
    this.cam.position.set(this.camX + sx, ty + 22.5 * pScale, this.camZ + 17.8 * pScale + sz);
    this.cam.lookAt(this.camX + sx, ty, this.camZ + sz);

    this.gl.render(this.scene, this.cam);
  }

  dispose() {
    this.envTex.dispose();
    this.gl.dispose();
  }
}
