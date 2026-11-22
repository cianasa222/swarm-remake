import * as THREE from 'three';
import type { Game } from '../sim/game';
import { angleDiff } from '../sim/math';
import { getTexture, loadGLB } from './assets';
import { blobShadowTex } from './style';

export interface HeroRig {
  readonly root: THREE.Group;
  update(g: Game, dt: number): void;
}

/**
 * 拳头官方《无尽狂潮》金克丝（Strawberry_Jinx）3D 骨骼模型与四向走A动画状态机：
 * - 加载 14.14 客户端原版 `strawberry_jinx.glb`（133 根骨骼、18 套战斗动作）
 * - 支持前/后/左/右四向奔跑与四向开火走A、火箭炮切换、过载疾跑、大招与阵亡平滑过渡
 */
export class JinxRig implements HeroRig {
  readonly root = new THREE.Group();
  private modelHolder = new THREE.Group();
  private mixer: THREE.AnimationMixer | null = null;
  private actions: Record<string, THREE.AnimationAction> = {};
  private currentKey = '';
  private mats: THREE.MeshStandardMaterial[] = [];

  private aimYaw = 0;
  private firingT = 0;
  private ultAnimT = 0;
  readonly ready: Promise<void>;

  private auraRing: THREE.Mesh;
  private aimTri: THREE.Mesh;

  constructor(parent: THREE.Group) {
    parent.add(this.root);

    // 脚底柔和投影
    const pShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.75, 1.75),
      new THREE.MeshBasicMaterial({ map: blobShadowTex(), transparent: true, opacity: 0.58, depthWrite: false }),
    );
    pShadow.rotation.x = -Math.PI / 2;
    pShadow.position.y = 0.02;
    pShadow.renderOrder = 2;
    this.root.add(pShadow);

    // 脚底青蓝指示光环与瞄准三角
    this.auraRing = new THREE.Mesh(
      new THREE.RingGeometry(0.64, 0.72, 32),
      new THREE.MeshBasicMaterial({ color: 0x52f2ff, transparent: true, opacity: 0.52, depthWrite: false }),
    );
    this.auraRing.rotation.x = -Math.PI / 2;
    this.auraRing.position.y = 0.045;
    this.auraRing.renderOrder = 4;

    const triShape = new THREE.Shape();
    triShape.moveTo(0, 0.22);
    triShape.lineTo(-0.14, -0.05);
    triShape.lineTo(0.14, -0.05);
    triShape.closePath();
    const triGeo = new THREE.ShapeGeometry(triShape);
    triGeo.rotateX(-Math.PI / 2);
    this.aimTri = new THREE.Mesh(
      triGeo,
      new THREE.MeshBasicMaterial({ color: 0x8efaff, transparent: true, opacity: 0.9, depthWrite: false }),
    );
    this.aimTri.position.set(0, 0.05, 0.78);
    this.aimTri.renderOrder = 5;

    this.root.add(this.auraRing, this.aimTri, this.modelHolder);

    const loadTex = (url: string) => getTexture(url, { flipY: false, anisotropy: 4 }); // Q-22：斜俯视角下贴图更清晰
    const bodyTex = loadTex('./assets/heroes/jinx/body.webp');
    const weaponTex = loadTex('./assets/heroes/jinx/weapon.webp');

    const bodyMat = new THREE.MeshStandardMaterial({
      map: bodyTex,
      roughness: 0.72,
      metalness: 0.14,
      envMapIntensity: 0.65,
      side: THREE.DoubleSide,
    });
    const weaponMat = new THREE.MeshStandardMaterial({
      map: weaponTex,
      roughness: 0.62,
      metalness: 0.24,
      envMapIntensity: 0.85,
      side: THREE.DoubleSide,
    });
    this.mats.push(bodyMat, weaponMat);

    this.ready = loadGLB('./assets/heroes/jinx/strawberry_jinx.glb')
      .then((gltf) => {
        const model = gltf.scene;
        // 配合《无尽狂潮》紧凑俯视镜头比例，保持原版清晰轮廓
        model.scale.setScalar(0.0096);
        model.position.set(0, 0, 0);

        model.traverse((obj) => {
          if (!(obj instanceof THREE.Mesh)) return;
          const srcMat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
          const mName = srcMat?.name ?? obj.name ?? '';

          // 依据 skin0.bin.json initialSubmeshToHide 隐藏回城水母部件
          if (/JellySpikes|JellyHead|JellyBase/i.test(mName)) {
            obj.visible = false;
            return;
          }

          if (/Weapon/i.test(mName)) obj.material = weaponMat;
          else obj.material = bodyMat;

          obj.castShadow = true;
          obj.receiveShadow = true;
          obj.frustumCulled = false;
        });

        this.modelHolder.add(model);

        // 绑定 18 套原版战斗骨骼动画（含四向走A）
        const mixer = new THREE.AnimationMixer(model);
        this.mixer = mixer;
        const pick = (re: RegExp) => gltf.animations.find((a) => re.test(a.name));
        const bindClip = (key: string, re: RegExp, loopOnce = false) => {
          const clip = pick(re);
          if (!clip) return;
          const act = mixer.clipAction(clip);
          if (loopOnce) {
            act.setLoop(THREE.LoopOnce, 1);
            act.clampWhenFinished = true;
          }
          this.actions[key] = act;
        };

        bindClip('mg_idle', /^jinx_minigun_idle1$/i);
        bindClip('mg_haste', /^minigun_runhaste$/i);
        bindClip('mg_run_f', /^jinx_strawberry_minigun_run\.strawberryrebuild$/i);
        bindClip('mg_run_b', /^jinx_strawberry_minigun_run_back/i);
        bindClip('mg_run_l', /^jinx_strawberry_minigun_run_left/i);
        bindClip('mg_run_r', /^jinx_strawberry_minigun_run_right/i);

        bindClip('mg_atk_idle', /^jinx_strawberry_minigun_attack1_idle/i);
        bindClip('mg_atk_f', /^jinx_strawberry_minigun_attack1\.strawberryrebuild$/i);
        bindClip('mg_atk_b', /^jinx_strawberry_minigun_attack1_back/i);
        bindClip('mg_atk_l', /^jinx_strawberry_minigun_attack1_left/i);
        bindClip('mg_atk_r', /^jinx_strawberry_minigun_attack1_right/i);

        bindClip('cn_idle', /^jinx_rlauncher_idle1$/i);
        bindClip('cn_run', /^jinx_rlauncher_run$/i);
        bindClip('cn_atk_idle', /rlauncher_attack2_idle|rlauncher_attack1/i);
        bindClip('cn_atk_run', /rlauncher_attack2_run|rlauncher_run/i);

        bindClip('ult', /rlauncher_spell4/i, true);
        bindClip('death', /minigun_death/i, true);

        const initAct = this.actions.mg_idle ?? Object.values(this.actions)[0];
        if (initAct) {
          initAct.play();
          this.currentKey = 'mg_idle';
        }
      })
      .catch((err) => {
        console.error('[JinxRig] Failed to load strawberry_jinx.glb:', err);
      });
  }

  private playState(key: string, timeScale = 1) {
    const next = this.actions[key] ?? this.actions.mg_idle;
    if (!next) return;
    next.timeScale = timeScale;
    if (this.currentKey === key) return;

    const prev = this.actions[this.currentKey];
    next.reset();
    next.play();
    if (prev && prev !== next) {
      prev.crossFadeTo(next, 0.12, true);
    }
    this.currentKey = key;
  }

  update(g: Game, dt: number) {
    const p = g.player;
    this.root.position.set(p.x, 0, p.z);

    // 平滑转向目标瞄准角
    const targetYaw = Math.atan2(p.faceX, p.faceZ);
    this.aimYaw = this.aimYaw + angleDiff(targetYaw, this.aimYaw) * Math.min(1, dt * 18);
    this.modelHolder.rotation.y = this.aimYaw;

    this.aimTri.position.set(Math.sin(this.aimYaw) * 0.84, 0.05, Math.cos(this.aimYaw) * 0.84);
    this.aimTri.rotation.y = this.aimYaw;

    // 追踪开火与大招动作窗口（避免机枪连射间隔动画闪烁）
    this.firingT = Math.max(0, this.firingT - dt);
    this.ultAnimT = Math.max(0, this.ultAnimT - dt);
    if (p.recoil > 0.01) this.firingT = 0.28;
    for (const ev of g.events) {
      if (ev.type === 'shoot') {
        if (ev.weapon === 'ult') this.ultAnimT = 0.65;
        else this.firingT = 0.28;
      }
    }

    const overloaded = p.overloadT > 0;
    this.auraRing.visible = !overloaded;
    const auraMat = this.auraRing.material as THREE.MeshBasicMaterial;
    auraMat.color.setHex(0x52f2ff);
    auraMat.opacity = 0.48;

    // 受击闪白 / 过载微光
    const hitFlash = p.hurtT > 0 && Math.floor(g.clock * 20) % 2 === 0;
    for (const m of this.mats) {
      if (hitFlash) {
        m.emissive.setHex(0x664444);
        m.emissiveIntensity = 0.8;
      } else if (overloaded) {
        m.emissive.setHex(0x165566);
        m.emissiveIntensity = 0.35;
      } else {
        m.emissive.setHex(0x000000);
        m.emissiveIntensity = 0;
      }
    }

    if (this.mixer) {
      const spd = Math.hypot(p.vx, p.vz);
      const isCn = p.eVolleyLeft > 0 || p.weapon === 'cn';
      const firing = this.firingT > 0 || p.eVolleyLeft > 0;

      if (p.hp <= 0 || g.state === 'lost') {
        this.playState('death', 1);
      } else if (this.ultAnimT > 0 && this.actions.ult) {
        this.playState('ult', 1.25);
      } else if (p.moving || spd > 0.25) {
        const moveYaw = spd > 0.1 ? Math.atan2(p.vx, p.vz) : Math.atan2(p.lastMoveX, p.lastMoveZ);
        const rel = angleDiff(moveYaw, this.aimYaw);
        const absRel = Math.abs(rel);
        const dir = absRel <= Math.PI * 0.28 ? 'f' : absRel >= Math.PI * 0.72 ? 'b' : rel > 0 ? 'l' : 'r';
        const runScale = Math.max(0.85, spd / 3.4);

        if (!isCn) {
          if (firing) {
            const k = `mg_atk_${dir}`;
            this.playState(this.actions[k] ? k : `mg_run_${dir}`, runScale);
          } else if ((p.dashT > 0 || overloaded) && this.actions.mg_haste) {
            this.playState('mg_haste', Math.max(0.95, spd / 4.2));
          } else {
            this.playState(`mg_run_${dir}`, runScale);
          }
        } else {
          this.playState(firing ? 'cn_atk_run' : 'cn_run', runScale);
        }
      } else if (firing) {
        this.playState(isCn ? 'cn_atk_idle' : 'mg_atk_idle', isCn ? 1.15 : 1.4);
      } else {
        this.playState(isCn ? 'cn_idle' : 'mg_idle', 1);
      }
      this.mixer.update(dt);
    }
  }
}
