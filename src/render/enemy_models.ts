import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { ENEMY_SCALES } from '../config';
import type { Enemy } from '../sim/game';
import { getTexture, loadGLB } from './assets';
import { blobShadowTex } from './style';

/**
 * 单 DrawCall 合批 3D 小怪渲染器（基于官方 .glb 几何体 + 官方贴图）。
 * 支持受击闪白与束缚染色，零额外 GC。
 */
export class InstancedEnemyModel {
  private inst: THREE.InstancedMesh | null = null;
  private count = 0;
  private loadStarted = false;

  constructor(
    private parent: THREE.Group,
    private glbUrl: string,
    private texUrl: string,
    private maxCount: number,
    defer = false,
  ) {
    if (!defer) this.ensureLoaded();
  }

  ensureLoaded() {
    if (this.loadStarted) return;
    this.loadStarted = true;

    const tex = getTexture(this.texUrl, { flipY: false });
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      color: 0xffffff,
      roughness: 0.72,
      metalness: 0.12,
      envMapIntensity: 0.45,
      side: THREE.DoubleSide,
    });

    loadGLB(this.glbUrl)
      .then((gltf) => {
        const geos: THREE.BufferGeometry[] = [];
        gltf.scene.updateMatrixWorld(true);
        gltf.scene.traverse((obj) => {
          if (!(obj instanceof THREE.Mesh) || !obj.visible) return;
          const g = obj.geometry.clone();
          g.applyMatrix4(obj.matrixWorld);
          if (!g.attributes.normal) g.computeVertexNormals();
          // 统一属性集，防止 mergeGeometries 因额外皮肤属性失败
          for (const key of Object.keys(g.attributes)) {
            if (key !== 'position' && key !== 'normal' && key !== 'uv') {
              g.deleteAttribute(key);
            }
          }
          const nonIdx = g.index ? g.toNonIndexed() : g;
          if (g.index) g.dispose();
          geos.push(nonIdx);
        });
        if (!geos.length) return;
        const merged = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
        if (geos.length > 1) geos.forEach((g) => g.dispose());
        if (!merged) return;

        const mesh = new THREE.InstancedMesh(merged, mat, this.maxCount);
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        mesh.frustumCulled = false;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.count = 0;
        const white = new THREE.Color(0xffffff);
        for (let i = 0; i < this.maxCount; i++) mesh.setColorAt(i, white);
        this.inst = mesh;
        this.parent.add(mesh);
      })
      .catch((err) => console.error('[InstancedEnemyModel] load failed:', this.glbUrl, err));
  }

  begin() {
    this.count = 0;
  }

  push(matrix: THREE.Matrix4, color: THREE.Color) {
    if (!this.loadStarted) this.ensureLoaded();
    if (!this.inst || this.count >= this.maxCount) return;
    this.inst.setMatrixAt(this.count, matrix);
    this.inst.setColorAt(this.count, color);
    this.count++;
  }

  end() {
    if (!this.inst) return;
    this.inst.count = this.count;
    this.inst.instanceMatrix.needsUpdate = true;
    if (this.inst.instanceColor) this.inst.instanceColor.needsUpdate = true;
  }
}

interface EliteSlot {
  root: THREE.Group;
  model: THREE.Object3D;
  mat: THREE.MeshStandardMaterial;
  mixer: THREE.AnimationMixer;
  actions: Record<string, THREE.AnimationAction>;
  curKey: string;
}

/**
 * 第一关重装精英（Strawberry_MiniBoss_Bruiser）骨骼动画对象池：
 * 同屏精英数量极少（<=6），使用真实骨骼动画展现奔跑与重击姿态。
 */
export class EliteBruiserPool {
  private slots: EliteSlot[] = [];
  private template: THREE.Object3D | null = null;
  private clips: THREE.AnimationClip[] = [];
  private baseTex: THREE.Texture | null = null;
  private loadStarted = false;

  constructor(private parent: THREE.Group, private maxSlots = 6, defer = false) {
    if (!defer) this.ensureLoaded();
  }

  ensureLoaded() {
    if (this.loadStarted) return;
    this.loadStarted = true;
    this.baseTex = getTexture('./assets/enemies/miniboss_bruiser.webp', { flipY: false });
    loadGLB('./assets/enemies/miniboss_bruiser.glb')
      .then((gltf) => {
        this.template = gltf.scene;
        this.clips = gltf.animations;
        for (let i = 0; i < this.maxSlots; i++) this.slots.push(this.createSlot());
      })
      .catch((err) => console.error('[EliteBruiserPool] load failed:', err));
  }

  private createSlot(): EliteSlot {
    const root = new THREE.Group();
    root.visible = false;

    const ringGeo = new THREE.RingGeometry(0.95, 1.12, 28);
    ringGeo.rotateX(-Math.PI / 2);
    const ring = new THREE.Mesh(
      ringGeo,
      new THREE.MeshBasicMaterial({ color: 0xff3b5c, transparent: true, opacity: 0.72, depthWrite: false }),
    );
    ring.position.y = 0.04;

    const shadowGeo = new THREE.PlaneGeometry(2.6, 2.6);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadow = new THREE.Mesh(
      shadowGeo,
      new THREE.MeshBasicMaterial({ map: blobShadowTex(), transparent: true, opacity: 0.5, depthWrite: false }),
    );
    shadow.position.y = 0.02;

    const mat = new THREE.MeshStandardMaterial({
      map: this.baseTex,
      roughness: 0.66,
      metalness: 0.18,
      envMapIntensity: 0.55,
      side: THREE.DoubleSide,
    });

    const model = cloneSkinned(this.template!);
    model.scale.setScalar(ENEMY_SCALES.bruiser);
    model.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      obj.material = mat;
      obj.castShadow = true;
      obj.receiveShadow = true;
    });

    root.add(shadow, ring, model);
    this.parent.add(root);

    const mixer = new THREE.AnimationMixer(model);
    const actions: Record<string, THREE.AnimationAction> = {};
    const bind = (key: string, rx: RegExp) => {
      const clip = this.clips.find((c) => rx.test(c.name));
      if (clip) actions[key] = mixer.clipAction(clip);
    };
    bind('run', /bruiser_run/i);
    bind('attack', /attack1/i);
    bind('idle', /idle1/i);
    if (actions.run) actions.run.play();

    return { root, model, mat, mixer, actions, curKey: actions.run ? 'run' : '' };
  }

  update(elites: Enemy[], dt: number) {
    if (elites.length > 0 && !this.loadStarted) this.ensureLoaded();
    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];
      const e = elites[i];
      if (!e) {
        slot.root.visible = false;
        continue;
      }
      slot.root.visible = true;
      const emerge = Math.min(1, e.age / 0.35);
      slot.root.position.set(e.x, 0, e.z);
      slot.root.rotation.y = e.face;
      slot.model.scale.setScalar(ENEMY_SCALES.bruiser * emerge);

      if (e.flash > 0.25) slot.mat.emissive.setHex(0x777777);
      else if (e.bindT > 0) slot.mat.emissive.setHex(0x1f5578);
      else slot.mat.emissive.setHex(0x000000);

      const want = e.state === 'windup' || e.state === 'dash' ? 'attack' : 'run';
      if (want !== slot.curKey && slot.actions[want]) {
        slot.actions[slot.curKey]?.fadeOut(0.12);
        slot.actions[want].reset().fadeIn(0.12).play();
        slot.curKey = want;
      }
      slot.mixer.update(dt);
    }
  }
}
