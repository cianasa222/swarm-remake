import * as THREE from 'three';
import { BOSS, ENEMY_SCALES } from '../config';
import type { Game } from '../sim/game';
import { getTexture, loadGLB } from './assets';
import { blobShadowTex } from './style';

export interface RekSaiSubmeshInfo {
  index: number;
  name: string;
  verts: number;
}

/**
 * 第一关最终首领「深海魔鲨 · 雷克塞（Strawberry_Boss_RekSai）」3D 骨骼模型与 42 动作状态机：
 * - 加载 14.14 官方 42 动作 `reksai.glb` 与 `reksai.webp`；
 * - 依据 `skin0.bin.json` (`initialSubmeshToHide: "Wrap Plane"`) 与 `reference/14.14/reksai_submeshes.json`
 *   精准隐藏 `[3] Wrap`（1250 顶点）与 `[4] Plane`（122 顶点），保留 `[0] Body`（6518）、`[1] Fin`（344）、`[2] Scale`（365）；
 * - 官方 `skinScale = 2.75`（`ENEMY_SCALES.reksai = 0.0275`）；
 * - 完整接入 14.14 原版动作：潜行破土（`run_burrowed` → `spell2_unburrow`）、移动/狂暴追击（`runhaste` / `run_injured`）、
 *   招式（`spell1` / `spell1_frenzy_mirror` / `spell2_knockup` / `spell3` / `spell4_cast`）、二阶段引导（`channel_windup` / `channel_loop`）与死亡倒地（`death`）。
 */
export class RekSaiRig {
  readonly root = new THREE.Group();
  private modelHolder = new THREE.Group();
  private mixer: THREE.AnimationMixer | null = null;
  private actions: Record<string, THREE.AnimationAction> = {};
  private currentKey = '';
  private totalClips = 0;
  private loaded = false;
  private visibleSubmeshes: RekSaiSubmeshInfo[] = [];
  private hiddenSubmeshes: RekSaiSubmeshInfo[] = [];
  private mat: THREE.MeshStandardMaterial;
  private shadow: THREE.Mesh;
  private loadStarted = false;

  constructor(parent: THREE.Group, defer = false) {
    parent.add(this.root);
    this.root.visible = false;

    const shadowGeo = new THREE.PlaneGeometry(6.8, 6.8);
    shadowGeo.rotateX(-Math.PI / 2);
    this.shadow = new THREE.Mesh(
      shadowGeo,
      new THREE.MeshBasicMaterial({ map: blobShadowTex(), transparent: true, opacity: 0.56, depthWrite: false }),
    );
    this.shadow.position.y = 0.03;
    this.shadow.renderOrder = 2;

    const tex = getTexture('./assets/enemies/reksai.webp', { flipY: false, anisotropy: 4 }); // Q-22

    this.mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.68,
      metalness: 0.16,
      envMapIntensity: 0.55,
      side: THREE.DoubleSide,
    });

    this.root.add(this.shadow, this.modelHolder);
    if (!defer) this.ensureLoaded();
  }

  getDebugInfo() {
    return {
      loaded: this.loaded,
      totalClips: this.totalClips,
      boundClips: Object.keys(this.actions),
      currentKey: this.currentKey,
      visibleSubmeshes: this.visibleSubmeshes,
      hiddenSubmeshes: this.hiddenSubmeshes,
    };
  }

  ensureLoaded() {
    if (this.loadStarted) return;
    this.loadStarted = true;

    loadGLB('./assets/enemies/reksai.glb')
      .then((gltf) => {
        const model = gltf.scene;
        model.scale.setScalar(ENEMY_SCALES.reksai);

        let submeshIdx = 0;
        model.traverse((obj) => {
          if (!(obj instanceof THREE.Mesh)) return;
          const idx = submeshIdx++;
          const srcMat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
          const mName = srcMat?.name ?? '';
          const verts = obj.geometry?.attributes?.position?.count ?? 0;
          // 依据 skin0.bin.json initialSubmeshToHide: "Wrap Plane" 与 reference/14.14/reksai_submeshes.json：
          // Meshopt/dedup 压缩后 5 个 primitive 材质名会合并为 Body，因此同时按名称、原版顶点数(1250/122)与子网格索引(3/4)精准隐藏 Wrap & Plane
          const hideSubmesh =
            /^(Wrap|Plane)$/i.test(mName) ||
            /^(Wrap|Plane)$/i.test(obj.name) ||
            verts === 1250 ||
            verts === 122 ||
            idx === 3 ||
            idx === 4;
          if (hideSubmesh) {
            obj.visible = false;
            this.hiddenSubmeshes.push({ index: idx, name: obj.name || mName, verts });
            return;
          }
          this.visibleSubmeshes.push({ index: idx, name: obj.name || mName, verts });
          obj.material = this.mat;
          obj.castShadow = true;
          obj.receiveShadow = true;
        });

        this.modelHolder.add(model);
        this.mixer = new THREE.AnimationMixer(model);
        this.totalClips = gltf.animations.length;

        const bindClip = (key: string, rx: RegExp, loop = true) => {
          const clip = gltf.animations.find((c) => rx.test(c.name));
          if (!clip || !this.mixer) return;
          const act = this.mixer.clipAction(clip);
          if (!loop) {
            act.setLoop(THREE.LoopOnce, 1);
            act.clampWhenFinished = true;
          }
          this.actions[key] = act;
        };

        // 严格按精确 clip 名匹配（避免 spell1 误匹配 spell1_burrowed / idle01 误匹配 idle01_burrowed）
        bindClip('idle', /_idle01\./i);
        bindClip('idleAlt', /_idle02\./i);
        bindClip('idleBurrowed', /_idle01_burrowed\./i);
        bindClip('run', /_runhaste\./i);
        bindClip('runInjured', /_run_injured\./i);
        bindClip('burrow', /_run_burrowed\./i);
        bindClip('unburrow', /_spell2_unburrow\./i, false);
        bindClip('emerge', /_spell4_emerge\./i, false);
        bindClip('attack', /_spell1\./i);
        bindClip('frenzy', /_spell1_frenzy_mirror\./i);
        bindClip('attackBasic', /_attack1\./i);
        bindClip('bite', /_spell3\./i);
        bindClip('stomp', /_spell2_knockup\./i);
        bindClip('cast', /_spell4_cast\./i);
        bindClip('channelWindup', /_channel_windup\./i, false);
        bindClip('channelLoop', /_channel_loop\./i);
        bindClip('death', /_death\./i, false);

        this.loaded = true;
        this.play('idle', 0);
      })
      .catch((err) => console.error('[RekSaiRig] Failed to load reksai.glb:', err));
  }

  private play(key: string, fade = 0.14) {
    const next = this.actions[key] ?? this.actions.idle;
    if (!next || this.currentKey === key) return;
    const prev = this.actions[this.currentKey];
    if (prev) prev.fadeOut(fade);
    next.reset().fadeIn(fade).play();
    this.currentKey = key;
  }

  update(g: Game, dt: number) {
    const b = g.boss;
    if (!b) {
      this.root.visible = false;
      this.currentKey = '';
      return;
    }

    this.ensureLoaded();
    this.root.visible = true;

    // 首领已被击杀（胜利结算画面）：保留在原地播放原版倒地 death 动作
    if (!b.alive) {
      this.root.position.set(b.x, 0, b.z);
      this.root.rotation.y = b.face;
      this.modelHolder.position.y = 0;
      this.mat.emissive.setHex(0x000000);
      this.play('death', 0.12);
      this.mixer?.update(dt);
      return;
    }

    const t = g.clock;
    const entering = b.state === 'enter';
    const k = entering ? Math.min(1, b.stateT / BOSS.entranceTime) : 1;

    this.root.position.set(b.x, 0, b.z);
    this.root.rotation.y = b.face;
    this.shadow.scale.setScalar(entering ? 0.45 + k * 0.55 : 1);

    if (entering && k < 0.65) {
      this.modelHolder.position.y = -1.2 + (k / 0.65) * 0.9;
    } else if (entering) {
      const p = (k - 0.65) / 0.35;
      this.modelHolder.position.y = -0.3 * (1 - p);
    } else {
      this.modelHolder.position.y = 0;
    }

    const phase2 = g.bossPhase === 2;
    if (b.flash > 0.25) {
      this.mat.emissive.setHex(0x888888);
    } else if (phase2) {
      const pulse = Math.sin(t * 9) > 0 ? 0x3a0b22 : 0x1e0512;
      this.mat.emissive.setHex(pulse);
    } else {
      this.mat.emissive.setHex(0x000000);
    }

    const anim = g.bossAnim;
    const u = Math.min(1, (g.time - anim.t0) / Math.max(0.01, anim.dur));

    if (entering) {
      this.play(k < 0.65 ? 'burrow' : 'unburrow', 0.1);
    } else if (b.state === 'transition') {
      // 二阶段转场：前 0.65s 蓄力扬起（channel_windup），随后狂暴咆哮循环（channel_loop）
      this.play(b.stateT < 0.65 ? 'channelWindup' : 'channelLoop', 0.12);
    } else if (b.state === 'attack' && u < 1) {
      if (anim.move === 'sweep') this.play(phase2 ? 'frenzy' : 'attack', 0.1);
      else if (anim.move === 'stomp') this.play('stomp', 0.1);
      else this.play('cast', 0.1);
    } else if (b.state === 'window') {
      const d = Math.hypot(g.player.x - b.x, g.player.z - b.z);
      if (d > 5.2) {
        this.play(phase2 && b.hp < b.maxHp * 0.3 ? 'runInjured' : 'run', 0.16);
      } else {
        this.play('idle', 0.16);
      }
    } else {
      this.play('idle', 0.16);
    }

    this.mixer?.update(dt);
  }
}
