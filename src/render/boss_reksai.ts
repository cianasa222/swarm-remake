import * as THREE from 'three';
import { BOSS, ENEMY_SCALES } from '../config';
import type { Game } from '../sim/game';
import { getTexture, loadGLB } from './assets';
import { blobShadowTex } from './style';

/**
 * 第一关最终首领「深海魔鲨 · 雷克塞（Strawberry_Boss_RekSai）」3D 骨骼模型与动画状态机：
 * - 加载 14.14 官方 `reksai.glb`（隐藏 `Wrap`、`Plane` 辅助网格）与 `reksai.png`
 * - 官方 `skinScale = 2.75`（`ENEMY_SCALES.reksai = 0.0275`）
 * - 支持破土登场（潜行 `run_burrowed` -> 破土 `spell2_unburrow`）、扫尾/重踏/弹幕技能动画、转阶段与受击闪白
 */
export class RekSaiRig {
  readonly root = new THREE.Group();
  private modelHolder = new THREE.Group();
  private mixer: THREE.AnimationMixer | null = null;
  private actions: Record<string, THREE.AnimationAction> = {};
  private currentKey = '';
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

    const tex = getTexture('./assets/enemies/reksai.webp', { flipY: false });

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

  ensureLoaded() {
    if (this.loadStarted) return;
    this.loadStarted = true;

    loadGLB('./assets/enemies/reksai.glb')
      .then((gltf) => {
        const model = gltf.scene;
        model.scale.setScalar(ENEMY_SCALES.reksai);
        model.traverse((obj) => {
          if (!(obj instanceof THREE.Mesh)) return;
          const srcMat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
          const mName = srcMat?.name ?? obj.name ?? '';
          // 依据 skin0.bin.json initialSubmeshToHide: "Wrap Plane"
          if (/^(Wrap|Plane)$/i.test(mName) || /^(Wrap|Plane)$/i.test(obj.name)) {
            obj.visible = false;
            return;
          }
          obj.material = this.mat;
          obj.castShadow = true;
          obj.receiveShadow = true;
        });

        this.modelHolder.add(model);
        this.mixer = new THREE.AnimationMixer(model);

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

        bindClip('idle', /idle01/i);
        bindClip('run', /runhaste/i);
        bindClip('burrow', /run_burrowed/i);
        bindClip('unburrow', /spell2_unburrow/i, false);
        bindClip('attack', /attack1/i);
        bindClip('stomp', /spell2_knockup/i);
        bindClip('cast', /spell4_cast/i);
        bindClip('death', /death/i, false);

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
    if (!b || !b.alive) {
      this.root.visible = false;
      return;
    }

    this.ensureLoaded();
    this.root.visible = true;
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
      this.play('cast', 0.12);
    } else if (b.state === 'attack' && u < 1) {
      if (anim.move === 'sweep') this.play('attack', 0.1);
      else if (anim.move === 'stomp') this.play('stomp', 0.1);
      else this.play('cast', 0.1);
    } else if (b.state === 'window') {
      const d = Math.hypot(g.player.x - b.x, g.player.z - b.z);
      this.play(d > 5.2 ? 'run' : 'idle', 0.16);
    } else {
      this.play('idle', 0.16);
    }

    this.mixer?.update(dt);
  }
}
